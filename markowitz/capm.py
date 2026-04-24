"""
Módulo para calcular retornos esperados usando el modelo CAPM.
"""
import numpy as np
import pandas as pd
import yfinance as yf


# Candidatos de índice de mercado por sufijo, en orden de preferencia.
# Yahoo Finance no tiene histórico confiable para algunos índices locales
# (p.ej. ^IPSA devuelve solo 1 fila); usamos ETFs proxy cuando es necesario.
MARKET_INDEX_BY_SUFFIX = {
    ".SN": ["ECH"],                   # Chile: iShares MSCI Chile ETF (^IPSA solo tiene 1 fila en Yahoo)
    ".MX": ["^MXX", "EWW"],           # México - IPC (fallback: iShares MSCI Mexico ETF)
    ".SA": ["^BVSP", "EWZ"],          # Brasil - Bovespa (fallback: iShares MSCI Brazil ETF)
    ".BA": ["^MERV", "ARGT"],         # Argentina - Merval (fallback: Global X MSCI Argentina ETF)
    ".L":  ["^FTSE"],                 # Reino Unido - FTSE 100
    ".DE": ["^GDAXI"],                # Alemania - DAX
    ".PA": ["^FCHI"],                 # Francia - CAC 40
    ".MI": ["FTSEMIB.MI"],            # Italia - FTSE MIB
    ".MC": ["^IBEX"],                 # España - IBEX 35
    ".T":  ["^N225"],                 # Japón - Nikkei
    ".HK": ["^HSI"],                  # Hong Kong - Hang Seng
    ".TO": ["^GSPTSE"],               # Canadá - TSX
    ".AX": ["^AXJO"],                 # Australia - ASX 200
}

MIN_MARKET_ROWS = 30


def infer_market_ticker(tickers):
    """
    Retorna el primer candidato de índice de mercado según el sufijo común de los tickers.
    Para lógica con fallback usar get_market_data() directamente.
    """
    candidates = _market_candidates(tickers)
    return candidates[0]


def _market_candidates(tickers):
    """Lista ordenada de tickers candidatos a usar como proxy de mercado."""
    if not tickers:
        return ["^GSPC"]

    suffixes = set()
    for t in tickers:
        if "." in t:
            suffixes.add("." + t.rsplit(".", 1)[1])
        else:
            suffixes.add("")

    if len(suffixes) == 1:
        only = next(iter(suffixes))
        if only in MARKET_INDEX_BY_SUFFIX:
            return MARKET_INDEX_BY_SUFFIX[only] + ["^GSPC"]

    return ["^GSPC"]


def _extract_adj_close_series(market, market_ticker):
    """
    Extrae 'Adj Close' como pd.Series desde el DataFrame que devuelve yf.download.
    Maneja columnas planas y MultiIndex en cualquier orientación sin usar squeeze()
    (que colapsa a escalar si el DataFrame es de shape (1,1)).
    """
    if isinstance(market.columns, pd.MultiIndex):
        level0 = market.columns.get_level_values(0)
        level1 = market.columns.get_level_values(1)
        if "Adj Close" in level0:
            adj_close = market["Adj Close"]
        elif "Adj Close" in level1:
            adj_close = market.xs("Adj Close", level=1, axis=1)
        elif "Close" in level0:
            adj_close = market["Close"]
        elif "Close" in level1:
            adj_close = market.xs("Close", level=1, axis=1)
        else:
            raise ValueError(
                f"No se encontró 'Adj Close' ni 'Close' para {market_ticker}. "
                f"Columnas: {market.columns.tolist()}"
            )
    else:
        if "Adj Close" in market.columns:
            adj_close = market["Adj Close"]
        elif "Close" in market.columns:
            adj_close = market["Close"]
        else:
            raise ValueError(
                f"No se encontró 'Adj Close' ni 'Close' para {market_ticker}. "
                f"Columnas: {market.columns.tolist()}"
            )

    if isinstance(adj_close, pd.DataFrame):
        # Tomar primera columna como Series (evita squeeze que colapsa (1,1) a escalar)
        adj_close = adj_close.iloc[:, 0]

    if not isinstance(adj_close, pd.Series):
        raise ValueError(
            f"Tipo inesperado extrayendo precios de {market_ticker}: {type(adj_close).__name__}"
        )

    return adj_close.dropna()


def get_market_data(period="5y", market_ticker="^GSPC", tickers=None):
    """
    Obtiene la serie de precios ajustados del índice de mercado.
    Si se pasan `tickers`, prueba los candidatos del sufijo en orden y cae a ^GSPC
    cuando el índice local no tiene histórico suficiente en Yahoo (p.ej. ^IPSA).
    Si se pasa un `market_ticker` explícito, intenta sólo ese (con fallback a ^GSPC).
    """
    if tickers is not None:
        candidates = _market_candidates(tickers)
    else:
        candidates = [market_ticker]
        if market_ticker != "^GSPC":
            candidates.append("^GSPC")

    errors = []
    for candidate in candidates:
        try:
            market = yf.download(
                candidate, period=period, interval="1d",
                progress=False, auto_adjust=False,
            )
            if market.empty:
                errors.append(f"{candidate}: DataFrame vacío")
                continue

            series = _extract_adj_close_series(market, candidate)

            if len(series) < MIN_MARKET_ROWS:
                errors.append(f"{candidate}: solo {len(series)} filas (se requieren {MIN_MARKET_ROWS}+)")
                continue

            series.name = candidate
            print(f"DEBUG CAPM - Usando índice de mercado: {candidate} ({len(series)} filas)")
            return series
        except Exception as e:  # noqa: BLE001
            errors.append(f"{candidate}: {e}")
            continue

    raise ValueError(
        "No se pudo obtener un índice de mercado con histórico suficiente. "
        f"Intentos: {'; '.join(errors)}"
    )


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
    tickers_list = list(price_df.columns)

    print("=" * 60)
    print("DEBUG CAPM - Iniciando cálculo de retornos esperados CAPM")
    print(f"DEBUG CAPM - Risk-free rate: {risk_free_rate:.4f} ({risk_free_rate*100:.2f}%)")
    print(f"DEBUG CAPM - Periodo: {period}")
    print(f"DEBUG CAPM - Candidatos de mercado: {_market_candidates(tickers_list)}")
    print("=" * 60)

    # Obtener datos del mercado (con fallback automático por sufijo)
    market_prices = get_market_data(period=period, tickers=tickers_list)
    market_ticker = market_prices.name or "market"

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

    print(f"DEBUG CAPM - Retorno anual del mercado ({market_ticker}): {market_return_annual:.4f} ({market_return_annual*100:.2f}%)")

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
