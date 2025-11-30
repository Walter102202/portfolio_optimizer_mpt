import numpy as np
from scipy.optimize import minimize


def compute_efficient_frontier(price_df, n_points=50, risk_free_rate=0.0):
    """
    Calcula la frontera eficiente generando portafolios de mínima varianza
    para diferentes niveles de retorno objetivo.
    Devuelve dict con arrays de volatilidades, retornos, y activos individuales.
    """
    returns = price_df.pct_change().dropna()
    mean_returns = returns.mean()
    cov_matrix = returns.cov()
    tickers = list(mean_returns.index)
    n_assets = len(tickers)

    if n_assets < 2:
        raise ValueError("Se requieren al menos 2 activos válidos.")

    def portfolio_volatility(weights):
        return float(np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights))))

    def portfolio_return(weights):
        return float(np.dot(weights, mean_returns))

    bounds = tuple((0.0, 1.0) for _ in range(n_assets))
    x0 = np.array([1.0 / n_assets] * n_assets)

    # Encontrar retorno mínimo y máximo alcanzable
    min_ret = float(mean_returns.min())
    max_ret = float(mean_returns.max())

    # Generar puntos de la frontera eficiente
    target_returns = np.linspace(min_ret, max_ret, n_points)
    frontier_vols = []
    frontier_rets = []

    for target in target_returns:
        constraints = [
            {"type": "eq", "fun": lambda w: np.sum(w) - 1},
            {"type": "eq", "fun": lambda w, t=target: portfolio_return(w) - t},
        ]
        result = minimize(
            portfolio_volatility,
            x0,
            method="SLSQP",
            bounds=bounds,
            constraints=constraints,
            options={"disp": False, "maxiter": 500},
        )
        if result.success:
            frontier_vols.append(portfolio_volatility(result.x))
            frontier_rets.append(target)

    # Calcular posición de cada activo individual
    individual_assets = []
    for i, ticker in enumerate(tickers):
        asset_ret = float(mean_returns.iloc[i])
        asset_vol = float(np.sqrt(cov_matrix.iloc[i, i]))
        individual_assets.append({
            "ticker": ticker,
            "return": asset_ret,
            "volatility": asset_vol,
        })

    return {
        "frontier_volatilities": frontier_vols,
        "frontier_returns": frontier_rets,
        "individual_assets": individual_assets,
    }


def optimize_portfolio(price_df, risk_free_rate=0.0):
    """
    Optimiza el portafolio maximizando el ratio de Sharpe.
    Devuelve dict con pesos, retorno esperado, volatilidad y sharpe.
    """
    returns = price_df.pct_change().dropna()
    mean_returns = returns.mean()
    cov_matrix = returns.cov()
    tickers = list(mean_returns.index)
    n_assets = len(tickers)

    if n_assets < 2:
        raise ValueError("Se requieren al menos 2 activos válidos para optimizar.")

    def portfolio_performance(weights):
        port_return = float(np.dot(weights, mean_returns))
        port_vol = float(np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights))))
        return port_return, port_vol

    def neg_sharpe_ratio(weights):
        port_return, port_vol = portfolio_performance(weights)
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
    port_return, port_vol = portfolio_performance(weights)
    sharpe = (port_return - risk_free_rate) / port_vol if port_vol else float("nan")

    contrib_return = weights * mean_returns
    # Riesgo marginal simple: contribución al var = w_i * (Sigma w)_i
    marginal_var = cov_matrix.dot(weights)
    contrib_var = weights * marginal_var

    return {
        "tickers": tickers,
        "weights": weights,
        "expected_return": port_return,
        "volatility": port_vol,
        "sharpe": sharpe,
        "contrib_return": contrib_return,
        "contrib_var": contrib_var,
    }
