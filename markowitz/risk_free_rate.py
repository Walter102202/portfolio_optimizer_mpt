"""
Módulo para obtener la tasa libre de riesgo del bono del tesoro a 10 años.
"""
import yfinance as yf


def get_10year_treasury_rate():
    """
    Obtiene la tasa del bono del tesoro a 10 años usando yfinance (^TNX).
    ^TNX es el ticker para el Treasury Yield 10 Years en Yahoo Finance.
    Retorna la tasa anualizada como decimal (ej: 0.04 para 4%).
    Si no puede obtener datos, retorna 0.0.
    """
    try:
        # ^TNX es el ticker de Yahoo Finance para el Treasury 10Y
        # Devuelve el yield en porcentaje
        treasury = yf.Ticker("^TNX")

        # Obtener datos del último día de trading
        hist = treasury.history(period="5d")

        if hist.empty:
            raise ValueError("No se obtuvieron datos del Treasury")

        # Obtener el último precio de cierre (que es el yield en %)
        latest_yield = hist['Close'].iloc[-1]

        # Convertir de porcentaje a decimal (ej: 4.5 -> 0.045)
        return float(latest_yield / 100.0)

    except Exception as e:
        print(f"Warning: No se pudo obtener tasa del tesoro: {e}")
        print("Usando tasa libre de riesgo = 0.04 (4% estimado)")
        return 0.04  # Fallback a 4% como estimación conservadora
