# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Flask-based web application for portfolio optimization using Modern Portfolio Theory (Markowitz). The application downloads historical stock data from Yahoo Finance and calculates the optimal portfolio allocation that maximizes the Sharpe ratio.

## Development Commands

### Environment Setup
```bash
python -m venv .venv
.\.venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### Running the Application
```bash
# Development mode (recommended)
flask --app app run --debug

# Alternative
python app.py
```

### Running Tests
```bash
# Install test dependencies first
pip install pytest

# Run all tests
pytest

# Run specific test file
pytest tests/test_optimizer.py
pytest tests/test_data.py

# Run with verbose output
pytest -v
```

## Architecture

### Core Components

**markowitz/data.py**: Data acquisition layer
- Downloads adjusted close prices from Yahoo Finance using yfinance
- Handles multi-ticker downloads with proper column ordering
- Validates minimum data requirements (30+ rows, no empty results)
- Returns cleaned pandas DataFrame with consistent structure

**markowitz/optimizer.py**: Portfolio optimization engine
- Implements Markowitz mean-variance optimization
- Uses scipy.optimize.minimize with SLSQP method to maximize Sharpe ratio
- Constraints: weights sum to 1, all weights between 0-1 (long-only)
- Returns comprehensive dict with weights, expected return, volatility, Sharpe ratio, and marginal contributions

**app.py**: Flask application entry point
- Uses factory pattern with create_app()
- Single route (/) handles both form display (GET) and optimization (POST)
- Input validation: requires 5-20 tickers
- Custom Jinja2 filter 'pct' for percentage formatting
- Ticker parsing handles multiple delimiters (comma, semicolon, newline, tab) and removes duplicates

### Templates Structure
- `base.html`: Base layout with common structure
- `index.html`: Input form for ticker selection and parameters
- `result.html`: Displays optimization results with portfolio weights and metrics

### Deployment

**Local/Heroku**: Uses standard Flask application
- `runtime.txt` specifies Python version
- Application factory pattern in app.py

**Vercel**: Serverless deployment
- `api/index.py` imports and exposes the Flask app for Vercel's WSGI handler
- `vercel.json` configures routing to send all requests to api/index.py
- Python 3.11 runtime specified in vercel.json

### Data Flow

1. User submits tickers via POST to /
2. app.py calls get_price_data() to fetch historical prices
3. Cleaned price DataFrame passed to optimize_portfolio()
4. Optimizer calculates daily returns, covariance matrix, and mean returns
5. scipy.optimize finds weights that maximize (return - risk_free_rate) / volatility
6. Results include per-ticker weights, contributions to return, and marginal variance contributions
7. Results rendered in result.html with percentage formatting

## Important Constraints

- Portfolio accepts 5-20 tickers (validation in app.py:34)
- Minimum 30 historical data points required for optimization (data.py:37)
- Long-only portfolio: all weights constrained to [0, 1]
- Weights must sum to exactly 1.0
- Risk-free rate defaults to 0.0 but can be configured in optimizer
