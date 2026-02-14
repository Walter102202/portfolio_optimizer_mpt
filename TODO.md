# TODO - Ideas de Mejoras y Nuevas Funcionalidades

## Calidad de Codigo

- [ ] **Reemplazar print() por logging**: Los `print()` de debug en `data.py`, `capm.py` y `app.py` deberian usar el modulo `logging` de Python con niveles configurables (DEBUG, INFO, WARNING)
- [ ] **Ampliar cobertura de tests**: Faltan tests para rutas Flask, modulo CAPM, manejo de errores, y tests de integracion
- [ ] **Validacion de tickers**: Verificar que los tickers sean simbolos validos antes de llamar a yfinance (ej: regex, o lista de simbolos conocidos)
- [ ] **Centralizar constantes**: Risk-free rate default (0.04) y TRADING_DAYS_PER_YEAR (252) estan duplicados; moverlos a un modulo de configuracion

## Nuevas Funcionalidades

- [x] **Simulacion Monte Carlo**: Generar miles de portafolios aleatorios para visualizar la nube de riesgo-retorno y comparar con la frontera eficiente
- [ ] **Backtesting**: Evaluar como habria performado el portafolio optimo en periodos historicos (rolling window)
- [ ] **Value at Risk (VaR)**: Calcular VaR y CVaR (Conditional VaR) del portafolio optimo usando metodos parametrico, historico y Monte Carlo
- [ ] **Exportar resultados**: Permitir descargar los resultados en CSV o PDF (pesos, metricas, graficos)
- [ ] **Restricciones personalizadas**: Permitir al usuario definir limites por sector, peso maximo/minimo por activo, etc.
- [ ] **Portafolio de minima varianza**: Mostrar ademas del portafolio tangente, el portafolio de minima varianza global
- [ ] **Comparacion de benchmarks**: Comparar el portafolio optimo contra indices como S&P 500, NASDAQ, etc. en el mismo grafico
- [ ] **Black-Litterman**: Implementar el modelo Black-Litterman que permite incorporar vistas del inversor sobre retornos esperados
- [ ] **Analisis de sensibilidad**: Mostrar como cambian los pesos optimos al variar la tasa libre de riesgo o el periodo historico
- [ ] **Rebalanceo automatico**: Calcular los trades necesarios para rebalancear un portafolio existente hacia los pesos optimos

## Mejoras de UX/UI

- [ ] **Graficos interactivos adicionales**: Grafico de pie/donut para pesos, grafico de barras para contribuciones
- [ ] **Modo oscuro/claro**: Toggle entre temas (actualmente solo oscuro)
- [ ] **Historial de optimizaciones**: Guardar y comparar resultados de sesiones anteriores (localStorage o base de datos)
- [ ] **Tooltips educativos**: Explicaciones emergentes para metricas como Sharpe, Beta, volatilidad, etc.
- [ ] **Responsive mejorado**: Optimizar tablas y graficos para dispositivos moviles

## Infraestructura

- [ ] **Cache de datos**: Cachear datos de yfinance y tasas del tesoro para evitar llamadas repetidas (Redis o cache en memoria)
- [ ] **Rate limiting**: Proteger la API contra abuso
- [ ] **Monitoreo**: Agregar health checks y metricas de rendimiento
- [ ] **CI/CD**: Pipeline de integracion continua con tests automaticos en cada push
