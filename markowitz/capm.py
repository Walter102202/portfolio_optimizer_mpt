"""
Módulo para calcular retornos esperados usando el modelo CAPM.
"""
import numpy as np
import pandas as pd
import yfinance as yf


def get_market_data(period="5y"):
    """
    Obtiene datos del índice de mercado (S&P 500).
    Retorna Series con precios ajustados del mercado.
    """
    try:
        market = yf.download("^GSPC", period=period, interval="1d", progress=False, auto_adjust=False)

        if market.empty:
            raise ValueError("No se pudieron descargar datos del mercado (DataFrame vacío)")

        # Extraer Adj Close (yfinance devuelve un DataFrame con columnas: Open, High, Low, Close, Adj Close, Volume)
        if "Adj Close" in market.columns:
            adj_close = market["Adj Close"]

            # Si es un DataFrame de una columna, convertir a Series
            if isinstance(adj_close, pd.DataFrame):
                adj_close = adj_close.squeeze()

            return adj_close
        else:
            raise ValueError(f"No se encontró columna 'Adj Close'. Columnas disponibles: {market.columns.tolist()}")

    except Exception as e:
        raise ValueError(f"Error descargando datos del mercado: {e}")


def calculate_betas(price_df, market_prices):
    """
    Calcula el beta de cada acción respecto al mercado.
    Beta = Cov(Ri, Rm) / Var(Rm)

    Args:
        price_df: DataFrame con precios de las acciones
        market_prices: Series con precios del mercado

    Returns:
        Series con los betas de cada acción
    """
    print(f"DEBUG CAPM - Calculando betas...")
    print(f"DEBUG CAPM - Acciones: {list(price_df.columns)}")
    print(f"DEBUG CAPM - Fechas acciones: {len(price_df.index)}, desde {price_df.index[0]} hasta {price_df.index[-1]}")
    print(f"DEBUG CAPM - Fechas mercado: {len(market_prices.index)}, desde {market_prices.index[0]} hasta {market_prices.index[-1]}")

    # Calcular retornos
    stock_returns = price_df.pct_change().dropna()
    market_returns = market_prices.pct_change().dropna()

    # Alinear fechas (intersección)
    common_dates = stock_returns.index.intersection(market_returns.index)
    print(f"DEBUG CAPM - Fechas comunes: {len(common_dates)}")

    if len(common_dates) < 30:
        raise ValueError(f"Muy pocas fechas comunes entre acciones y mercado: {len(common_dates)}. Se necesitan al menos 30.")

    stock_returns = stock_returns.loc[common_dates]
    market_returns = market_returns.loc[common_dates]

    # Calcular beta para cada acción
    betas = {}
    market_var = market_returns.var()

    # Asegurar que market_var sea escalar
    if isinstance(market_var, pd.Series):
        if len(market_var) == 1:
            market_var = float(market_var.iloc[0])
        else:
            raise ValueError(f"market_var es una Series con {len(market_var)} elementos")
    else:
        market_var = float(market_var)

    for ticker in stock_returns.columns:
        covariance = stock_returns[ticker].cov(market_returns)

        # Asegurar que covariance sea escalar
        if isinstance(covariance, pd.Series):
            if len(covariance) == 1:
                covariance = float(covariance.iloc[0])
            else:
                raise ValueError(f"covariance es una Series con {len(covariance)} elementos")
        else:
            covariance = float(covariance)

        beta = covariance / market_var
        betas[ticker] = float(beta)
        print(f"DEBUG CAPM - Beta de {ticker}: {beta:.3f}")

    return pd.Series(betas)


def calculate_capm_returns(betas, risk_free_rate, market_return):
    """
    Calcula retornos esperados usando CAPM.
    E(Ri) = Rf + βi * (E(Rm) - Rf)

    Args:
        betas: Series con betas de cada acción
        risk_free_rate: Tasa libre de riesgo (anualizada)
        market_return: Retorno esperado del mercado (anualizado)

    Returns:
        Series con retornos esperados CAPM (anualizados)
    """
    market_premium = market_return - risk_free_rate
    expected_returns = risk_free_rate + betas * market_premium
    return expected_returns


def get_capm_expected_returns(price_df, risk_free_rate, period="5y"):
    """
    Función principal que calcula retornos esperados CAPM.

    Args:
        price_df: DataFrame con precios de las acciones
        risk_free_rate: Tasa libre de riesgo (anualizada)
        period: Periodo histórico para cálculos

    Returns:
        dict con:
            - 'expected_returns': Series con retornos esperados anualizados
            - 'betas': Series con betas de cada acción
            - 'market_return': Retorno anualizado del mercado
    """
    print("=" * 60)
    print("DEBUG CAPM - Iniciando cálculo de retornos esperados CAPM")
    print(f"DEBUG CAPM - Risk-free rate: {risk_free_rate:.4f} ({risk_free_rate*100:.2f}%)")
    print(f"DEBUG CAPM - Periodo: {period}")
    print("=" * 60)

    # Obtener datos del mercado
    market_prices = get_market_data(period=period)

    # Calcular retorno del mercado (promedio histórico anualizado)
    market_returns = market_prices.pct_change().dropna()
    market_return_annual = market_returns.mean() * 252  # Anualizar

    # Asegurar que sea un float Python
    if isinstance(market_return_annual, pd.Series):
        if len(market_return_annual) == 1:
            market_return_annual = float(market_return_annual.iloc[0])
        else:
            raise ValueError(f"market_return_annual es una Series con {len(market_return_annual)} elementos")
    else:
        market_return_annual = float(market_return_annual)

    print(f"DEBUG CAPM - Retorno anual del mercado (S&P 500): {market_return_annual:.4f} ({market_return_annual*100:.2f}%)")

    # Calcular betas
    betas = calculate_betas(price_df, market_prices)

    # Calcular retornos esperados CAPM
    expected_returns = calculate_capm_returns(betas, risk_free_rate, market_return_annual)

    print("\nDEBUG CAPM - Retornos esperados CAPM:")
    for ticker in expected_returns.index:
        print(f"  {ticker}: Beta={betas[ticker]:.3f}, E(R)={expected_returns[ticker]:.4f} ({expected_returns[ticker]*100:.2f}%)")
    print("=" * 60)

    return {
        'expected_returns': expected_returns,
        'betas': betas,
        'market_return': market_return_annual,
    }
