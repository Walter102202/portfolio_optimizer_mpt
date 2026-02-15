import os
from dotenv import load_dotenv
from flask import Flask, render_template, request

from markowitz.data import get_price_data
from markowitz.optimizer import optimize_portfolio, compute_efficient_frontier
from markowitz.montecarlo import run_monte_carlo
from markowitz.risk_free_rate import get_10year_treasury_rate
from markowitz.capm import get_capm_expected_returns

load_dotenv()


def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key")

    @app.template_filter("pct")
    def format_pct(value, decimals=2):
        try:
            return f"{float(value) * 100:.{decimals}f}%"
        except (TypeError, ValueError):
            return value

    @app.route("/", methods=["GET", "POST"])
    def index():
        error = None
        result = None
        defaults = {"period": "5y"}

        if request.method == "POST":
            tickers_raw = request.form.get("tickers", "")
            period = request.form.get("period", defaults["period"])
            tickers = _parse_tickers(tickers_raw)

            if not (5 <= len(tickers) <= 30):
                error = "Debes ingresar entre 5 y 30 tickers."
                try:
                    risk_free_rate = get_10year_treasury_rate()
                except Exception:
                    risk_free_rate = 0.04
                return render_template(
                    "index.html",
                    error=error,
                    tickers_text=tickers_raw,
                    period=period,
                    risk_free_rate=risk_free_rate,
                )

            # Obtener tasa libre de riesgo del bono del tesoro a 10 años
            try:
                risk_free_rate = get_10year_treasury_rate()
            except Exception:
                risk_free_rate = 0.04  # Fallback en caso de error

            try:
                prices = get_price_data(tickers, period=period)

                # Calcular retornos esperados usando CAPM
                capm_data = get_capm_expected_returns(prices, risk_free_rate, period=period)
                expected_returns = capm_data['expected_returns']
                betas = capm_data['betas']
                market_return = capm_data['market_return']

                # Optimizar portafolio usando retornos CAPM
                opt = optimize_portfolio(prices, risk_free_rate=risk_free_rate, expected_returns_annual=expected_returns)
                frontier = compute_efficient_frontier(prices, n_points=30, risk_free_rate=risk_free_rate, expected_returns_annual=expected_returns)

                # Simulación de portafolios aleatorios
                mc = run_monte_carlo(prices, n_portfolios=5000, risk_free_rate=risk_free_rate, expected_returns_annual=expected_returns)

                rows = []
                for i, ticker in enumerate(opt["tickers"]):
                    rows.append(
                        {
                            "ticker": ticker,
                            "weight": _to_float(opt["weights"][i]),
                            "contrib_return": _to_float(opt["contrib_return"].iloc[i]),
                            "contrib_var": _to_float(opt["contrib_var"].iloc[i]),
                            "beta": _to_float(betas[ticker]),
                            "volatility": _to_float(opt["individual_volatilities"][ticker]),  # Volatilidad anual del activo
                            "expected_return_capm": _to_float(expected_returns[ticker]),
                        }
                    )

                result = {
                    "rows": rows,
                    "expected_return": _to_float(opt["expected_return"]),
                    "volatility": _to_float(opt["volatility"]),
                    "sharpe": _to_float(opt["sharpe"]),
                    "frontier": frontier,
                    "montecarlo": mc,
                    "risk_free_rate": _to_float(risk_free_rate),
                    "market_return": _to_float(market_return),
                }

                # Sanitizar recursivamente TODOS los valores para asegurar tipos Python nativos
                result = _sanitize_for_template(result)
            except Exception as exc:  # noqa: BLE001
                error = str(exc)
                print(f"ERROR CAPTURADO EN PROCESAMIENTO: {error}", flush=True)
                import traceback
                traceback.print_exc()

            if error:
                print(f"Retornando página de error con mensaje: {error}", flush=True)
                return render_template(
                    "index.html",
                    error=error,
                    tickers_text=tickers_raw,
                    period=period,
                    risk_free_rate=risk_free_rate,
                )

            # Renderizar resultado
            return render_template(
                "result.html",
                result=result,
                tickers=tickers,
                period=period,
            )

        # Obtener tasa libre de riesgo para mostrar en la página inicial
        try:
            risk_free_rate = get_10year_treasury_rate()
        except Exception:
            risk_free_rate = 0.04  # Fallback en caso de error

        return render_template(
            "index.html",
            error=error,
            tickers_text="",
            period=defaults["period"],
            risk_free_rate=risk_free_rate,
        )

    return app


def _to_float(value):
    """
    Convierte un valor (escalar, Series, numpy array) a float Python.
    Maneja Series de pandas, numpy arrays, y escalares.
    """
    import numpy as np
    import pandas as pd

    if isinstance(value, pd.Series):
        # Si es una Series con un solo valor, extraerlo
        if len(value) == 1:
            return float(value.iloc[0])
        else:
            raise ValueError(f"Se esperaba un valor escalar, pero se recibió una Series con {len(value)} elementos")
    elif isinstance(value, np.ndarray):
        # Si es un array numpy con un solo valor
        if value.size == 1:
            return float(value.item())
        else:
            raise ValueError(f"Se esperaba un valor escalar, pero se recibió un array con {value.size} elementos")
    elif isinstance(value, np.generic):
        # Si es un tipo numpy genérico (np.float64, np.int64, etc.)
        return float(value.item())
    else:
        # Es un escalar, convertir a float
        return float(value)


def _sanitize_for_template(obj):
    """
    Recursively converts all pandas/numpy types to Python natives.
    Ensures template can safely render all values.
    """
    import numpy as np
    import pandas as pd

    if isinstance(obj, dict):
        return {key: _sanitize_for_template(value) for key, value in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [_sanitize_for_template(item) for item in obj]
    elif isinstance(obj, (pd.Series, pd.DataFrame)):
        raise ValueError(f"Found pandas {type(obj).__name__} that should have been converted")
    elif isinstance(obj, np.ndarray):
        if obj.size == 1:
            return float(obj.item())
        else:
            return [_sanitize_for_template(item) for item in obj]
    elif isinstance(obj, np.generic):
        # Convert numpy scalar types to Python natives
        return obj.item()
    elif isinstance(obj, (np.integer, np.floating)):
        return float(obj)
    elif isinstance(obj, str):
        return obj
    elif isinstance(obj, (int, float, bool, type(None))):
        return obj
    else:
        # For any other type, try to convert to float
        try:
            return float(obj)
        except (TypeError, ValueError):
            # If conversion fails, return as-is and let validation catch it
            return obj


def _parse_tickers(raw):
    splitters = [",", ";", "\n", "\t"]
    for sep in splitters:
        raw = raw.replace(sep, " ")
    tickers = [t.strip().upper() for t in raw.split(" ") if t.strip()]
    # Quitar duplicados preservando orden
    seen = set()
    unique = []
    for t in tickers:
        if t not in seen:
            seen.add(t)
            unique.append(t)
    return unique


app = create_app()


if __name__ == "__main__":
    debug = os.getenv("FLASK_DEBUG", "1") == "1"
    app.run(debug=debug)
