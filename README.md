# Markowitz Portfolio Optimizer (Flask)

Aplicación en Flask para calcular el portafolio óptimo (ratio de Sharpe) usando datos históricos de Yahoo Finance.

## Requisitos

- Python 3.10+ (probado con 3.11)
- Dependencias en `requirements.txt`

## Instalación

```bash
python -m venv .venv
.\.venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

Opcional para pruebas:

```bash
pip install pytest
```

Variables de entorno recomendadas (crear `.env`):

```
FLASK_ENV=development
FLASK_DEBUG=1
SECRET_KEY=alguna_clave_segura
```

## Ejecución local

```bash
flask --app app run --debug
# o
python app.py
```

Luego abre `http://127.0.0.1:5000`.

## Pruebas

```bash
pytest
```

## Estructura

```
app.py                # Entrada Flask
markowitz/data.py     # Descarga y limpieza de precios con yfinance
markowitz/optimizer.py# Optimización Markowitz con scipy.optimize
templates/            # Vistas Jinja2
static/               # CSS / JS
tests/                # Pruebas unitarias básicas
```

## Despliegue

- `Procfile` y `runtime.txt` pensados para plataformas tipo Heroku.
- `vercel.json` + `api/index.py` para desplegar en Vercel como función serverless.
