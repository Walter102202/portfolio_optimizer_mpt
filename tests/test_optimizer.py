import numpy as np
import pandas as pd

from markowitz.optimizer import optimize_portfolio


def test_optimize_portfolio_weights_sum_to_one():
    dates = pd.date_range("2020-01-01", periods=6, freq="D")
    data = pd.DataFrame(
        {
            "AAA": [100, 101, 102, 103, 104, 105],
            "BBB": [200, 202, 204, 206, 208, 210],
            "CCC": [50, 52, 54, 55, 56, 57],
        },
        index=dates,
    )

    result = optimize_portfolio(data)

    assert np.isclose(result["weights"].sum(), 1.0)
    assert np.all(result["weights"] >= -1e-6)
    assert result["expected_return"] > 0
