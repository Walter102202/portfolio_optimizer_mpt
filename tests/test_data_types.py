"""
Tests para validar que todos los tipos de datos pasados al template son escalares Python.
"""
import numpy as np
import pandas as pd


def validate_is_python_scalar(value, name="value"):
    """
    Valida que un valor sea un escalar nativo de Python (int, float, str, bool).
    Lanza ValueError si es un tipo pandas/numpy.
    """
    if isinstance(value, (pd.Series, pd.DataFrame)):
        raise ValueError(f"{name} es un pandas {type(value).__name__}, no un escalar Python")

    if isinstance(value, np.ndarray):
        raise ValueError(f"{name} es un numpy array, no un escalar Python")

    if isinstance(value, np.generic):
        raise ValueError(f"{name} es un numpy scalar ({type(value).__name__}), no un escalar Python")

    if not isinstance(value, (int, float, str, bool, type(None))):
        raise ValueError(f"{name} tiene tipo no permitido: {type(value).__name__}")

    return True


def validate_result_dict(result):
    """
    Valida que todos los valores en el diccionario result sean tipos Python nativos.
    """
    errors = []

    # Validar valores de primer nivel
    for key in ["expected_return", "volatility", "sharpe", "risk_free_rate", "market_return"]:
        if key in result:
            try:
                validate_is_python_scalar(result[key], f"result['{key}']")
            except ValueError as e:
                errors.append(str(e))

    # Validar cada fila
    if "rows" in result:
        for i, row in enumerate(result["rows"]):
            for key in ["weight", "contrib_return", "contrib_var", "beta", "volatility", "expected_return_capm"]:
                if key in row:
                    try:
                        validate_is_python_scalar(row[key], f"rows[{i}]['{key}']")
                    except ValueError as e:
                        errors.append(str(e))

    # Validar frontier
    if "frontier" in result:
        frontier = result["frontier"]

        # Validar frontier_volatilities
        if "frontier_volatilities" in frontier:
            for i, val in enumerate(frontier["frontier_volatilities"]):
                try:
                    validate_is_python_scalar(val, f"frontier['frontier_volatilities'][{i}]")
                except ValueError as e:
                    errors.append(str(e))

        # Validar frontier_returns
        if "frontier_returns" in frontier:
            for i, val in enumerate(frontier["frontier_returns"]):
                try:
                    validate_is_python_scalar(val, f"frontier['frontier_returns'][{i}]")
                except ValueError as e:
                    errors.append(str(e))

        # Validar individual_assets
        if "individual_assets" in frontier:
            for i, asset in enumerate(frontier["individual_assets"]):
                for key in ["return", "volatility"]:
                    if key in asset:
                        try:
                            validate_is_python_scalar(asset[key], f"frontier['individual_assets'][{i}]['{key}']")
                        except ValueError as e:
                            errors.append(str(e))

    if errors:
        raise ValueError(f"Errores de validación encontrados:\n" + "\n".join(errors))

    return True


if __name__ == "__main__":
    # Test básicos
    print("Ejecutando tests de validación de tipos...")

    # Test 1: Escalar válido
    try:
        validate_is_python_scalar(3.14, "test_float")
        print("✓ Test 1 pasado: float válido")
    except ValueError as e:
        print(f"✗ Test 1 falló: {e}")

    # Test 2: Series inválida
    try:
        validate_is_python_scalar(pd.Series([1, 2, 3]), "test_series")
        print("✗ Test 2 falló: debería haber detectado Series")
    except ValueError as e:
        print(f"✓ Test 2 pasado: {e}")

    # Test 3: numpy array inválido
    try:
        validate_is_python_scalar(np.array([1.0]), "test_array")
        print("✗ Test 3 falló: debería haber detectado array")
    except ValueError as e:
        print(f"✓ Test 3 pasado: {e}")

    # Test 4: numpy scalar inválido
    try:
        validate_is_python_scalar(np.float64(3.14), "test_numpy_scalar")
        print("✗ Test 4 falló: debería haber detectado numpy scalar")
    except ValueError as e:
        print(f"✓ Test 4 pasado: {e}")

    print("\nTodos los tests completados.")
