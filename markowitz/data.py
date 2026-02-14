import pandas as pd
import yfinance as yf


def get_price_data(tickers, period="5y"):
    """
    Descarga precios ajustados para los tickers indicados.
    Siempre usa intervalo diario para cálculos precisos.
    Devuelve DataFrame con columnas en el mismo orden de `tickers`.
    """
    if not tickers:
        raise ValueError("No se proporcionaron tickers.")

    data = yf.download(
        tickers=tickers,
        period=period,
        interval="1d",  # Siempre diario para cálculos precisos
        group_by="ticker",
        auto_adjust=False,
        progress=False,
    )

    # DEBUG: información detallada del DataFrame
    print("=" * 60)
    print(f"DEBUG - Tickers solicitados: {tickers}")
    print(f"DEBUG - Tipo de data: {type(data)}")
    print(f"DEBUG - Shape: {data.shape}")
    print(f"DEBUG - Tipo de columns: {type(data.columns)}")
    print(f"DEBUG - Columns: {data.columns.tolist()}")
    if isinstance(data.columns, pd.MultiIndex):
        print(f"DEBUG - MultiIndex levels: {data.columns.levels}")
        print(f"DEBUG - MultiIndex names: {data.columns.names}")
    print(f"DEBUG - Primeras filas:\n{data.head(2)}")
    print("=" * 60)

    # yfinance devuelve MultiIndex cuando hay múltiples tickers
    if isinstance(data.columns, pd.MultiIndex):
        print("DEBUG - Detectado MultiIndex, extrayendo 'Adj Close'...")
        if "Adj Close" in data.columns.get_level_values(0):
            data = data["Adj Close"]
            print(f"DEBUG - Columnas después de extraer (nivel 0): {data.columns.tolist()}")
        elif "Adj Close" in data.columns.get_level_values(1):
            data = data.xs("Adj Close", level=1, axis=1)
            print(f"DEBUG - Columnas después de extraer (nivel 1): {data.columns.tolist()}")
        else:
            raise ValueError(f"No se encontró 'Adj Close' en MultiIndex. Niveles: {data.columns.levels}")
    else:
        print("DEBUG - No es MultiIndex, buscando columna 'Adj Close'...")
        if "Adj Close" in data.columns:
            data = data[["Adj Close"]].rename(columns={"Adj Close": tickers[0]})
            print(f"DEBUG - Columna renombrada a: {tickers[0]}")
        else:
            raise ValueError(f"No se encontró 'Adj Close'. Columnas disponibles: {data.columns.tolist()}")

    # Reordenar columnas según el orden de entrada y filtrar solo las que llegaron
    available = [t for t in tickers if t in data.columns]
    data = data.loc[:, available]

    if data.empty or len(available) == 0:
        raise ValueError("No se pudieron descargar precios válidos para los tickers ingresados.")

    # Descartar tickers con más del 50% de datos faltantes
    threshold = len(data) * 0.5
    valid_cols = [c for c in data.columns if data[c].notna().sum() >= threshold]
    if len(valid_cols) == 0:
        raise ValueError("No se pudieron descargar precios válidos para los tickers ingresados.")
    data = data[valid_cols]

    # Forward-fill para llenar huecos por feriados/días sin operación, luego dropna
    data = data.ffill().dropna(how="any")

    if data.shape[0] < 30:
        raise ValueError("Muy pocos datos históricos disponibles para optimizar.")

    return data
