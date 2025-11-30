import pandas as pd
import yfinance as yf

from markowitz.data import get_price_data


def test_get_price_data_orders_columns(monkeypatch):
    tickers = ["AAA", "BBB"]
    dates = pd.date_range("2020-01-01", periods=5, freq="D")
    # Simular respuesta de yfinance con MultiIndex
    fake_df = pd.concat(
        [
            pd.DataFrame({"Adj Close": [10, 11, 12, 13, 14]}, index=dates),
            pd.DataFrame({"Adj Close": [20, 21, 22, 23, 24]}, index=dates),
        ],
        axis=1,
        keys=tickers,
    )

    def fake_download(*args, **kwargs):
        return fake_df

    monkeypatch.setattr(yf, "download", fake_download)

    result = get_price_data(tickers, period="1y", interval="1d")

    assert list(result.columns) == tickers
    assert result.shape[0] == 5
