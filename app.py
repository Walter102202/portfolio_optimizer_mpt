import os
from dotenv import load_dotenv
from flask import Flask, render_template, request

from markowitz.data import get_price_data
from markowitz.optimizer import optimize_portfolio, compute_efficient_frontier
from markowitz.risk_free_rate import get_10year_treasury_rate

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

            if not (5 <= len(tickers) <= 20):
                error = "Debes ingresar entre 5 y 20 tickers."
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
                opt = optimize_portfolio(prices, risk_free_rate=risk_free_rate)
                frontier = compute_efficient_frontier(prices, n_points=30, risk_free_rate=risk_free_rate)

                rows = []
                for i, ticker in enumerate(opt["tickers"]):
                    rows.append(
                        {
                            "ticker": ticker,
                            "weight": opt["weights"][i],
                            "contrib_return": opt["contrib_return"].iloc[i],
                            "contrib_var": opt["contrib_var"].iloc[i],
                        }
                    )

                result = {
                    "rows": rows,
                    "expected_return": opt["expected_return"],
                    "volatility": opt["volatility"],
                    "sharpe": opt["sharpe"],
                    "frontier": frontier,
                    "risk_free_rate": risk_free_rate,
                }
            except Exception as exc:  # noqa: BLE001
                error = str(exc)

            if error:
                return render_template(
                    "index.html",
                    error=error,
                    tickers_text=tickers_raw,
                    period=period,
                    risk_free_rate=risk_free_rate,
                )

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
