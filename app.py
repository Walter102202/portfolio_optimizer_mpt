import os
from dotenv import load_dotenv
from flask import Flask, render_template, request

from markowitz.data import get_price_data
from markowitz.optimizer import optimize_portfolio, compute_efficient_frontier

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
                return render_template(
                    "index.html",
                    error=error,
                    tickers_text=tickers_raw,
                    period=period,
                )

            try:
                prices = get_price_data(tickers, period=period)
                opt = optimize_portfolio(prices)
                frontier = compute_efficient_frontier(prices, n_points=30)

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
                }
            except Exception as exc:  # noqa: BLE001
                error = str(exc)

            if error:
                return render_template(
                    "index.html",
                    error=error,
                    tickers_text=tickers_raw,
                    period=period,
                )

            return render_template(
                "result.html",
                result=result,
                tickers=tickers,
                period=period,
            )

        return render_template(
            "index.html",
            error=error,
            tickers_text="",
            period=defaults["period"],
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
