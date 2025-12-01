"""
Simple script to test type conversions without running the full app.
"""
import numpy as np
import pandas as pd


def _to_float(value):
    """Convert pandas.Series, numpy array, or scalar to Python float."""
    if isinstance(value, pd.Series):
        if len(value) == 1:
            return float(value.iloc[0])
        else:
            raise ValueError(f"Expected scalar, got Series with {len(value)} elements")
    elif isinstance(value, np.ndarray):
        if value.size == 1:
            return float(value.item())
        else:
            raise ValueError(f"Expected scalar, got array with {value.size} elements")
    else:
        return float(value)


def test_conversions():
    """Test various scenarios that might occur in the app."""

    print("=" * 60)
    print("Testing type conversions")
    print("=" * 60)

    # Test 1: Numpy float64 (from Series.mean())
    print("\nTest 1: numpy.float64")
    series = pd.Series([1.0, 2.0, 3.0])
    mean_val = series.mean()
    print(f"  Original type: {type(mean_val)}")
    print(f"  Original value: {mean_val}")
    converted = _to_float(mean_val)
    print(f"  Converted type: {type(converted)}")
    print(f"  Converted value: {converted}")
    print(f"  Is Python float? {type(converted) == float}")

    # Test if format string works
    try:
        formatted = "%.2f" % converted
        print(f"  Format test: '%.2f' % converted = {formatted}")
    except Exception as e:
        print(f"  Format test FAILED: {e}")

    # Test 2: Series indexing (simulating betas[ticker])
    print("\nTest 2: Indexing pandas Series")
    betas_dict = {"AAPL": 1.2, "MSFT": 0.8, "GOOGL": 1.1}
    betas_series = pd.Series(betas_dict)
    beta_value = betas_series["AAPL"]
    print(f"  Original type: {type(beta_value)}")
    print(f"  Original value: {beta_value}")
    converted = _to_float(beta_value)
    print(f"  Converted type: {type(converted)}")
    print(f"  Converted value: {converted}")
    print(f"  Is Python float? {type(converted) == float}")

    # Test if format string works
    try:
        formatted = "%.2f" % converted
        print(f"  Format test: '%.2f' % converted = {formatted}")
    except Exception as e:
        print(f"  Format test FAILED: {e}")

    # Test 3: iloc indexing (simulating contrib_return.iloc[i])
    print("\nTest 3: iloc indexing on Series")
    contrib = pd.Series([0.05, 0.03, 0.02], index=["AAPL", "MSFT", "GOOGL"])
    iloc_value = contrib.iloc[0]
    print(f"  Original type: {type(iloc_value)}")
    print(f"  Original value: {iloc_value}")
    converted = _to_float(iloc_value)
    print(f"  Converted type: {type(converted)}")
    print(f"  Converted value: {converted}")
    print(f"  Is Python float? {type(converted) == float}")

    # Test if format string works
    try:
        formatted = "%.2f" % converted
        print(f"  Format test: '%.2f' % converted = {formatted}")
    except Exception as e:
        print(f"  Format test FAILED: {e}")

    # Test 4: Numpy array indexing
    print("\nTest 4: numpy array indexing")
    weights = np.array([0.3, 0.4, 0.3])
    weight_value = weights[0]
    print(f"  Original type: {type(weight_value)}")
    print(f"  Original value: {weight_value}")
    converted = _to_float(weight_value)
    print(f"  Converted type: {type(converted)}")
    print(f"  Converted value: {converted}")
    print(f"  Is Python float? {type(converted) == float}")

    # Test if format string works
    try:
        formatted = "%.2f" % converted
        print(f"  Format test: '%.2f' % converted = {formatted}")
    except Exception as e:
        print(f"  Format test FAILED: {e}")

    # Test 5: Direct numpy scalar
    print("\nTest 5: Direct numpy scalar (np.float64)")
    np_scalar = np.float64(3.14159)
    print(f"  Original type: {type(np_scalar)}")
    print(f"  Original value: {np_scalar}")
    converted = _to_float(np_scalar)
    print(f"  Converted type: {type(converted)}")
    print(f"  Converted value: {converted}")
    print(f"  Is Python float? {type(converted) == float}")

    # Test if format string works
    try:
        formatted = "%.2f" % converted
        print(f"  Format test: '%.2f' % converted = {formatted}")
    except Exception as e:
        print(f"  Format test FAILED: {e}")

    # Test 6: What happens WITHOUT conversion?
    print("\nTest 6: numpy scalar WITHOUT conversion (should fail)")
    try:
        formatted = "%.2f" % np_scalar
        print(f"  Format test without conversion: SUCCESS (unexpected!)")
        print(f"  Result: {formatted}")
    except Exception as e:
        print(f"  Format test without conversion: FAILED as expected")
        print(f"  Error: {e}")

    print("\n" + "=" * 60)
    print("All conversion tests completed")
    print("=" * 60)


if __name__ == "__main__":
    test_conversions()
