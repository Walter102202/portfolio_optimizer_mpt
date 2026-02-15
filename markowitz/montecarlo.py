"""
Simulación de portafolios aleatorios.
Genera portafolios con pesos aleatorios para visualizar la nube de riesgo-retorno.
"""
import numpy as np

TRADING_DAYS_PER_YEAR = 252


def run_monte_carlo(price_df, n_portfolios=5000, risk_free_rate=0.0,
                    expected_returns_annual=None, seed=42):
    """
    Genera n_portfolios portafolios con pesos aleatorios y calcula
    su retorno esperado, volatilidad y Sharpe ratio.

    Args:
        price_df: DataFrame con precios históricos (columnas = tickers).
        n_portfolios: Número de portafolios aleatorios a generar.
        risk_free_rate: Tasa libre de riesgo anualizada.
        expected_returns_annual: Series opcional con retornos esperados
                                 anualizados (CAPM). Si no se proporciona,
                                 usa promedios históricos.
        seed: Semilla para reproducibilidad.

    Returns:
        dict con:
            - portfolios: lista de dicts {volatility, return, sharpe}
            - best_sharpe: dict del portafolio con mayor Sharpe
            - min_vol: dict del portafolio con menor volatilidad
    """
    rng = np.random.default_rng(seed)

    returns = price_df.pct_change().dropna()
    cov_matrix = returns.cov().values  # matriz numpy para rendimiento
    n_assets = len(price_df.columns)

    if expected_returns_annual is not None:
        mean_returns = np.array(expected_returns_annual, dtype=float)
    else:
        mean_returns = returns.mean().values * TRADING_DAYS_PER_YEAR

    annual_cov = cov_matrix * TRADING_DAYS_PER_YEAR

    # Pre-allocar arrays para rendimiento
    all_returns = np.empty(n_portfolios)
    all_vols = np.empty(n_portfolios)
    all_sharpes = np.empty(n_portfolios)

    for i in range(n_portfolios):
        # Generar pesos aleatorios que sumen 1 (distribución Dirichlet)
        weights = rng.dirichlet(np.ones(n_assets))

        port_return = float(np.dot(weights, mean_returns))
        port_vol = float(np.sqrt(np.dot(weights.T, np.dot(annual_cov, weights))))
        sharpe = (port_return - risk_free_rate) / port_vol if port_vol > 0 else 0.0

        all_returns[i] = port_return
        all_vols[i] = port_vol
        all_sharpes[i] = sharpe

    # Construir lista de portafolios (convertir a floats nativos de Python)
    portfolios = []
    for i in range(n_portfolios):
        portfolios.append({
            "volatility": float(all_vols[i]),
            "return": float(all_returns[i]),
            "sharpe": float(all_sharpes[i]),
        })

    # Mejor Sharpe y mínima volatilidad
    best_sharpe_idx = int(np.argmax(all_sharpes))
    min_vol_idx = int(np.argmin(all_vols))

    return {
        "portfolios": portfolios,
        "best_sharpe": portfolios[best_sharpe_idx],
        "min_vol": portfolios[min_vol_idx],
        "n_portfolios": n_portfolios,
    }
