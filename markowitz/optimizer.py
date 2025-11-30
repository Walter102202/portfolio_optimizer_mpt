import numpy as np
from scipy.optimize import minimize

# Días de trading por año para anualización
TRADING_DAYS_PER_YEAR = 252


def compute_efficient_frontier(price_df, n_points=50, risk_free_rate=0.0):
    """
    Calcula la frontera eficiente generando portafolios de mínima varianza
    para diferentes niveles de retorno objetivo.
    Todos los resultados están anualizados.
    Devuelve dict con arrays de volatilidades, retornos, y activos individuales.
    """
    returns = price_df.pct_change().dropna()
    mean_returns = returns.mean()  # Retornos diarios
    cov_matrix = returns.cov()      # Covarianza diaria
    tickers = list(mean_returns.index)
    n_assets = len(tickers)

    if n_assets < 2:
        raise ValueError("Se requieren al menos 2 activos válidos.")

    def portfolio_volatility_daily(weights):
        return float(np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights))))

    def portfolio_return_daily(weights):
        return float(np.dot(weights, mean_returns))

    bounds = tuple((0.0, 1.0) for _ in range(n_assets))
    x0 = np.array([1.0 / n_assets] * n_assets)

    # Encontrar retorno mínimo y máximo alcanzable (diario)
    min_ret = float(mean_returns.min())
    max_ret = float(mean_returns.max())

    # Generar puntos de la frontera eficiente
    target_returns = np.linspace(min_ret, max_ret, n_points)
    frontier_vols = []
    frontier_rets = []

    for target in target_returns:
        constraints = [
            {"type": "eq", "fun": lambda w: np.sum(w) - 1},
            {"type": "eq", "fun": lambda w, t=target: portfolio_return_daily(w) - t},
        ]
        result = minimize(
            portfolio_volatility_daily,
            x0,
            method="SLSQP",
            bounds=bounds,
            constraints=constraints,
            options={"disp": False, "maxiter": 500},
        )
        if result.success:
            # Anualizar: vol_anual = vol_diaria * sqrt(252), ret_anual = ret_diario * 252
            annual_vol = portfolio_volatility_daily(result.x) * np.sqrt(TRADING_DAYS_PER_YEAR)
            annual_ret = target * TRADING_DAYS_PER_YEAR
            frontier_vols.append(annual_vol)
            frontier_rets.append(annual_ret)

    # Calcular posición de cada activo individual (anualizado)
    individual_assets = []
    for i, ticker in enumerate(tickers):
        daily_ret = float(mean_returns.iloc[i])
        daily_vol = float(np.sqrt(cov_matrix.iloc[i, i]))
        individual_assets.append({
            "ticker": ticker,
            "return": daily_ret * TRADING_DAYS_PER_YEAR,
            "volatility": daily_vol * np.sqrt(TRADING_DAYS_PER_YEAR),
        })

    return {
        "frontier_volatilities": frontier_vols,
        "frontier_returns": frontier_rets,
        "individual_assets": individual_assets,
    }


def optimize_portfolio(price_df, risk_free_rate=0.0):
    """
    Optimiza el portafolio maximizando el ratio de Sharpe.
    Calcula con retornos diarios y anualiza los resultados (horizonte 1 año).
    risk_free_rate debe estar en términos anuales.
    Devuelve dict con pesos, retorno esperado, volatilidad y sharpe (todos anualizados).
    """
    returns = price_df.pct_change().dropna()
    mean_returns = returns.mean()  # Retornos diarios
    cov_matrix = returns.cov()      # Covarianza diaria
    tickers = list(mean_returns.index)
    n_assets = len(tickers)

    if n_assets < 2:
        raise ValueError("Se requieren al menos 2 activos válidos para optimizar.")

    # Anualizar para la optimización
    annual_mean_returns = mean_returns * TRADING_DAYS_PER_YEAR
    annual_cov_matrix = cov_matrix * TRADING_DAYS_PER_YEAR

    def portfolio_performance_annual(weights):
        port_return = float(np.dot(weights, annual_mean_returns))
        port_vol = float(np.sqrt(np.dot(weights.T, np.dot(annual_cov_matrix, weights))))
        return port_return, port_vol

    def neg_sharpe_ratio(weights):
        port_return, port_vol = portfolio_performance_annual(weights)
        if port_vol == 0:
            return np.inf
        return -(port_return - risk_free_rate) / port_vol

    bounds = tuple((0.0, 1.0) for _ in range(n_assets))
    constraints = ({"type": "eq", "fun": lambda w: np.sum(w) - 1},)
    x0 = np.array([1.0 / n_assets] * n_assets)

    result = minimize(
        neg_sharpe_ratio,
        x0,
        method="SLSQP",
        bounds=bounds,
        constraints=constraints,
        options={"disp": False, "maxiter": 500},
    )

    if not result.success:
        raise ValueError(f"Falló la optimización: {result.message}")

    weights = result.x
    port_return, port_vol = portfolio_performance_annual(weights)
    sharpe = (port_return - risk_free_rate) / port_vol if port_vol else float("nan")

    # Contribuciones anualizadas
    contrib_return = weights * annual_mean_returns
    marginal_var = annual_cov_matrix.dot(weights)
    contrib_var = weights * marginal_var

    return {
        "tickers": tickers,
        "weights": weights,
        "expected_return": port_return,      # Anualizado
        "volatility": port_vol,              # Anualizado
        "sharpe": sharpe,                    # Anualizado
        "contrib_return": contrib_return,    # Anualizado
        "contrib_var": contrib_var,          # Anualizado
    }
