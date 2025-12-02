"""
Tests para validar el cálculo de volatilidades individuales.
"""
import numpy as np
import pandas as pd
from markowitz.optimizer import optimize_portfolio, TRADING_DAYS_PER_YEAR


def test_individual_volatilities_calculation():
    """
    Test que valida que las volatilidades individuales se calculan correctamente.
    """
    # Crear datos sintéticos de ejemplo
    np.random.seed(42)
    dates = pd.date_range('2020-01-01', periods=252, freq='D')

    # Generar precios simulados para 3 activos
    prices_data = {
        'AAPL': 100 + np.cumsum(np.random.randn(252) * 0.02),
        'MSFT': 200 + np.cumsum(np.random.randn(252) * 0.015),
        'GOOGL': 1500 + np.cumsum(np.random.randn(252) * 0.025),
    }

    prices_df = pd.DataFrame(prices_data, index=dates)

    # Calcular manualmente la volatilidad anual esperada
    returns = prices_df.pct_change().dropna()
    cov_matrix = returns.cov()

    expected_volatilities = {}
    for ticker in prices_df.columns:
        ticker_index = list(prices_df.columns).index(ticker)
        daily_vol = np.sqrt(cov_matrix.iloc[ticker_index, ticker_index])
        annual_vol = daily_vol * np.sqrt(TRADING_DAYS_PER_YEAR)
        expected_volatilities[ticker] = annual_vol

    # Ejecutar optimización
    result = optimize_portfolio(prices_df, risk_free_rate=0.04)

    # Validar que individual_volatilities existe
    assert 'individual_volatilities' in result, "El resultado debe contener 'individual_volatilities'"

    # Validar que tiene las mismas claves que los tickers
    assert set(result['individual_volatilities'].keys()) == set(prices_df.columns), \
        "Las volatilidades deben estar para todos los tickers"

    # Validar que los valores son cercanos a los calculados manualmente
    for ticker in prices_df.columns:
        calculated_vol = result['individual_volatilities'][ticker]
        expected_vol = expected_volatilities[ticker]

        # Permitir una pequeña diferencia debido a precisión de punto flotante
        assert abs(calculated_vol - expected_vol) < 1e-10, \
            f"La volatilidad de {ticker} no coincide: {calculated_vol} vs {expected_vol}"

    print("✓ Test de volatilidades individuales pasado")


def test_individual_volatilities_are_python_floats():
    """
    Test que valida que las volatilidades individuales son floats de Python.
    """
    np.random.seed(42)
    dates = pd.date_range('2020-01-01', periods=100, freq='D')

    prices_data = {
        'AAPL': 100 + np.cumsum(np.random.randn(100) * 0.02),
        'MSFT': 200 + np.cumsum(np.random.randn(100) * 0.015),
    }

    prices_df = pd.DataFrame(prices_data, index=dates)
    result = optimize_portfolio(prices_df, risk_free_rate=0.03)

    # Validar que todos los valores son floats de Python
    for ticker, vol in result['individual_volatilities'].items():
        assert isinstance(vol, float), \
            f"La volatilidad de {ticker} debe ser un float de Python, no {type(vol)}"
        assert not isinstance(vol, (np.generic, pd.Series, pd.DataFrame)), \
            f"La volatilidad de {ticker} no debe ser tipo numpy/pandas"

    print("✓ Test de tipos de volatilidades individuales pasado")


def test_volatilities_are_positive():
    """
    Test que valida que las volatilidades son positivas.
    """
    np.random.seed(123)
    dates = pd.date_range('2020-01-01', periods=150, freq='D')

    prices_data = {
        'AAPL': 100 + np.cumsum(np.random.randn(150) * 0.02),
        'MSFT': 200 + np.cumsum(np.random.randn(150) * 0.015),
        'GOOGL': 1500 + np.cumsum(np.random.randn(150) * 0.025),
    }

    prices_df = pd.DataFrame(prices_data, index=dates)
    result = optimize_portfolio(prices_df, risk_free_rate=0.02)

    # Validar que todas las volatilidades son positivas
    for ticker, vol in result['individual_volatilities'].items():
        assert vol > 0, f"La volatilidad de {ticker} debe ser positiva: {vol}"

    print("✓ Test de volatilidades positivas pasado")


if __name__ == "__main__":
    print("Ejecutando tests de volatilidades individuales...\n")

    test_individual_volatilities_calculation()
    test_individual_volatilities_are_python_floats()
    test_volatilities_are_positive()

    print("\n✓ Todos los tests de volatilidades individuales pasaron exitosamente")
