import numpy as np
import pandas as pd

from markowitz.montecarlo import run_monte_carlo


def _sample_prices():
    """Crea un DataFrame de precios de ejemplo para tests."""
    dates = pd.date_range("2020-01-01", periods=100, freq="D")
    rng = np.random.default_rng(123)
    data = pd.DataFrame(
        {
            "AAA": 100 * np.cumprod(1 + rng.normal(0.0005, 0.01, 100)),
            "BBB": 200 * np.cumprod(1 + rng.normal(0.0003, 0.015, 100)),
            "CCC": 50 * np.cumprod(1 + rng.normal(0.0008, 0.012, 100)),
        },
        index=dates,
    )
    return data


def test_montecarlo_returns_correct_structure():
    prices = _sample_prices()
    result = run_monte_carlo(prices, n_portfolios=100)

    assert "portfolios" in result
    assert "best_sharpe" in result
    assert "min_vol" in result
    assert "n_portfolios" in result
    assert result["n_portfolios"] == 100
    assert len(result["portfolios"]) == 100


def test_montecarlo_portfolio_values_are_native_floats():
    prices = _sample_prices()
    result = run_monte_carlo(prices, n_portfolios=50)

    for p in result["portfolios"]:
        assert isinstance(p["volatility"], float)
        assert isinstance(p["return"], float)
        assert isinstance(p["sharpe"], float)


def test_montecarlo_volatilities_are_positive():
    prices = _sample_prices()
    result = run_monte_carlo(prices, n_portfolios=200)

    for p in result["portfolios"]:
        assert p["volatility"] > 0


def test_montecarlo_best_sharpe_is_max():
    prices = _sample_prices()
    result = run_monte_carlo(prices, n_portfolios=500)

    max_sharpe = max(p["sharpe"] for p in result["portfolios"])
    assert abs(result["best_sharpe"]["sharpe"] - max_sharpe) < 1e-10


def test_montecarlo_min_vol_is_min():
    prices = _sample_prices()
    result = run_monte_carlo(prices, n_portfolios=500)

    min_vol = min(p["volatility"] for p in result["portfolios"])
    assert abs(result["min_vol"]["volatility"] - min_vol) < 1e-10


def test_montecarlo_with_capm_returns():
    prices = _sample_prices()
    expected_returns = pd.Series({"AAA": 0.10, "BBB": 0.08, "CCC": 0.12})
    result = run_monte_carlo(
        prices, n_portfolios=100,
        risk_free_rate=0.04,
        expected_returns_annual=expected_returns,
    )

    # Con retornos CAPM, todos los retornos deberían estar en rango razonable
    for p in result["portfolios"]:
        assert 0.05 <= p["return"] <= 0.15


def test_montecarlo_reproducible_with_seed():
    prices = _sample_prices()
    r1 = run_monte_carlo(prices, n_portfolios=50, seed=99)
    r2 = run_monte_carlo(prices, n_portfolios=50, seed=99)

    for p1, p2 in zip(r1["portfolios"], r2["portfolios"]):
        assert p1["volatility"] == p2["volatility"]
        assert p1["return"] == p2["return"]
