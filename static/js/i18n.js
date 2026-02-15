/**
 * Internationalization (i18n) module for Markowitz Lab
 * Supports: Spanish (es), English (en)
 */

const TRANSLATIONS = {
    // ===== Navigation & Header (base.html) =====
    "nav.how_it_works": { es: "Cómo funciona", en: "How it works" },
    "nav.metrics": { es: "Métricas", en: "Metrics" },
    "nav.calculate": { es: "Calcular cartera", en: "Calculate portfolio" },

    // ===== Page title =====
    "page.title": { es: "Optimizador de Portafolios", en: "Portfolio Optimizer" },

    // ===== Hero Section (index.html) =====
    "hero.eyebrow": { es: "Inversión cuantitativa", en: "Quantitative investing" },
    "hero.title": {
        es: "Optimiza tu portafolio con el enfoque de Markowitz",
        en: "Optimize your portfolio with the Markowitz approach"
    },
    "hero.subtitle": {
        es: "Analiza hasta 30 acciones, descarga datos históricos y obtén la asignación con mejor ratio de Sharpe en minutos.",
        en: "Analyze up to 30 stocks, download historical data and get the best Sharpe ratio allocation in minutes."
    },
    "hero.pill_data": { es: "Datos Yahoo Finance", en: "Yahoo Finance Data" },
    "hero.pill_long_only": { es: "Restricción sin cortos", en: "Long-only constraint" },
    "hero.pill_sharpe": { es: "Sharpe Máximo", en: "Maximum Sharpe" },

    // ===== Form Section (index.html) =====
    "form.badge": { es: "Simulación", en: "Simulation" },
    "form.steps": { es: "3 pasos para tu cartera óptima", en: "3 steps to your optimal portfolio" },
    "form.label_stocks": { es: "Selecciona tus acciones", en: "Select your stocks" },
    "form.placeholder_search": {
        es: "Busca por ticker o nombre (ej: Apple, MSFT)...",
        en: "Search by ticker or name (e.g. Apple, MSFT)..."
    },
    "form.counter_suffix": { es: "de 5-30 tickers seleccionados", en: "of 5-30 tickers selected" },
    "form.popular_stocks": { es: "Acciones populares:", en: "Popular stocks:" },
    "form.optimize_by_index": { es: "Optimizar por índice:", en: "Optimize by index:" },
    "form.index_ipsa_count": { es: "30 acciones", en: "30 stocks" },
    "form.label_period": { es: "Periodo histórico", en: "Historical period" },
    "form.period_help": { es: "Resultados anualizados (horizonte 1 año)", en: "Annualized results (1 year horizon)" },
    "form.submit": { es: "Calcular cartera óptima", en: "Calculate optimal portfolio" },
    "form.calculating": { es: "Calculando...", en: "Calculating..." },

    // ===== How It Works Section (index.html) =====
    "how.eyebrow": { es: "Proceso de optimización", en: "Optimization process" },
    "how.title": { es: "Cómo funciona", en: "How it works" },
    "how.step1_title": { es: "Define el universo", en: "Define the universe" },
    "how.step1_desc": {
        es: "Ingresa entre 5 y 30 acciones que quieras evaluar. Podemos mezclar distintos sectores y mercados.",
        en: "Enter between 5 and 30 stocks you want to evaluate. You can mix different sectors and markets."
    },
    "how.step2_title": { es: "Procesamos los datos", en: "We process the data" },
    "how.step2_desc": {
        es: "Descargamos precios ajustados, calculamos retornos, medias y covarianzas diarias en segundos.",
        en: "We download adjusted prices, calculate returns, daily means and covariances in seconds."
    },
    "how.step3_title": { es: "Entregamos el óptimo", en: "We deliver the optimum" },
    "how.step3_desc": {
        es: "Resolvemos el problema de Markowitz maximizando Sharpe sin ventas cortas y te mostramos los pesos finales.",
        en: "We solve the Markowitz problem maximizing Sharpe without short sales and show you the final weights."
    },

    // ===== Metrics Section (index.html) =====
    "metrics.eyebrow": { es: "Fundamentos matemáticos", en: "Mathematical foundations" },
    "metrics.title": { es: "Métricas utilizadas", en: "Metrics used" },
    "metrics.rf_desc": {
        es: "Utilizamos la tasa libre de riesgo del bono del Tesoro de EE.UU. a 10 años (Federal Reserve Bank of New York) · Valor actual:",
        en: "We use the risk-free rate of the 10-year US Treasury bond (Federal Reserve Bank of New York) · Current value:"
    },
    "metrics.risk_label": { es: "Riesgo controlado", en: "Controlled risk" },
    "metrics.risk_title": { es: "Matriz de covarianzas", en: "Covariance matrix" },
    "metrics.risk_desc": {
        es: "Usamos varianzas y covarianzas recientes para equilibrar la volatilidad de la cartera.",
        en: "We use recent variances and covariances to balance portfolio volatility."
    },
    "metrics.return_label": { es: "Rentabilidad esperada", en: "Expected return" },
    "metrics.return_title": { es: "Media de retornos", en: "Returns average" },
    "metrics.return_desc": {
        es: "Estimamos los retornos promedio del periodo seleccionado para guiar la asignación.",
        en: "We estimate the average returns of the selected period to guide the allocation."
    },
    "metrics.efficiency_label": { es: "Maximizando eficiencia", en: "Maximizing efficiency" },
    "metrics.efficiency_title": { es: "Sharpe objetivo", en: "Target Sharpe" },
    "metrics.efficiency_desc": {
        es: "Optimización con SLSQP, pesos en [0,1] y suma 1 para evitar ventas cortas.",
        en: "Optimization with SLSQP, weights in [0,1] and sum to 1 to avoid short sales."
    },

    // ===== Results Page (result.html) =====
    "result.eyebrow": { es: "Resultado de optimización (CAPM)", en: "Optimization result (CAPM)" },
    "result.title": { es: "Portafolio con Sharpe óptimo", en: "Portfolio with optimal Sharpe" },
    "result.historical_data": { es: "Datos históricos:", en: "Historical data:" },
    "result.annualized": { es: "Resultados anualizados", en: "Annualized results" },
    "result.benchmark": { es: "Benchmark: S&P 500", en: "Benchmark: S&P 500" },
    "result.calculate_another": { es: "Calcular otro portafolio", en: "Calculate another portfolio" },

    // KPI Cards
    "result.expected_return": { es: "Retorno esperado (anual)", en: "Expected return (annual)" },
    "result.volatility": { es: "Volatilidad (anual)", en: "Volatility (annual)" },
    "result.sharpe_ratio": { es: "Sharpe Ratio", en: "Sharpe Ratio" },
    "result.risk_free_rate": { es: "Tasa libre de riesgo", en: "Risk-free rate" },
    "result.treasury_10y": { es: "Treasury 10Y", en: "Treasury 10Y" },

    // Weights Table
    "result.optimal_weights": { es: "Pesos óptimos", en: "Optimal weights" },
    "result.long_only_badge": { es: "Restricción sin cortos", en: "Long-only constraint" },
    "result.th_ticker": { es: "Ticker", en: "Ticker" },
    "result.th_beta": { es: "Beta", en: "Beta" },
    "result.th_volatility": { es: "Volatilidad", en: "Volatility" },
    "result.th_er_capm": { es: "E(R) CAPM", en: "E(R) CAPM" },
    "result.th_weight": { es: "Peso", en: "Weight" },
    "result.th_return_contrib": { es: "Aporte retorno", en: "Return contribution" },
    "result.th_var_contrib": { es: "Aporte varianza", en: "Variance contribution" },

    // Efficient Frontier
    "result.efficient_frontier": { es: "Frontera Eficiente", en: "Efficient Frontier" },
    "result.rf_debt_pct": { es: "% Deuda Rf:", en: "% Rf Debt:" },
    "result.reset": { es: "Reset", en: "Reset" },
    "result.mixed_portfolio": { es: "Portafolio Mixto (con deuda Rf)", en: "Mixed Portfolio (with Rf debt)" },
    "result.pct_treasury": { es: "% en Treasury:", en: "% in Treasury:" },
    "result.pct_optimal": { es: "% en Portafolio Óptimo:", en: "% in Optimal Portfolio:" },
    "result.expected_return_label": { es: "Retorno Esperado:", en: "Expected Return:" },
    "result.volatility_label": { es: "Volatilidad:", en: "Volatility:" },

    // Monte Carlo
    "result.monte_carlo_title": { es: "Simulación Monte Carlo", en: "Monte Carlo Simulation" },
    "result.mc_portfolios_generated": { es: "portafolios aleatorios generados", en: "random portfolios generated" },
    "result.mc_badge": { es: "Monte Carlo", en: "Monte Carlo" },
    "result.mc_best_sharpe": { es: "Mejor Sharpe (simulado)", en: "Best Sharpe (simulated)" },
    "result.mc_min_vol": { es: "Mínima Volatilidad (simulada)", en: "Minimum Volatility (simulated)" },
    "result.mc_return": { es: "Retorno:", en: "Return:" },
    "result.mc_volatility": { es: "Volatilidad:", en: "Volatility:" },
    "result.mc_sharpe": { es: "Sharpe:", en: "Sharpe:" },

    // ===== Chart Labels =====
    "chart.cml": { es: "Línea de Mercado (CML)", en: "Capital Market Line (CML)" },
    "chart.efficient_frontier": { es: "Frontera Eficiente", en: "Efficient Frontier" },
    "chart.individual_assets": { es: "Activos Individuales", en: "Individual Assets" },
    "chart.risk_free_rate": { es: "Tasa Libre de Riesgo", en: "Risk-Free Rate" },
    "chart.optimal_portfolio": { es: "Portafolio Óptimo (Tangente)", en: "Optimal Portfolio (Tangent)" },
    "chart.mixed_portfolio": { es: "Portafolio Mixto (con Rf)", en: "Mixed Portfolio (with Rf)" },
    "chart.x_axis": { es: "Volatilidad Anual (%)", en: "Annual Volatility (%)" },
    "chart.y_axis": { es: "Retorno Esperado Anual (%)", en: "Expected Annual Return (%)" },
    "chart.simulated_portfolios": { es: "Portafolios simulados", en: "Simulated portfolios" },
    "chart.optimal_slsqp": { es: "Portafolio Óptimo (SLSQP)", en: "Optimal Portfolio (SLSQP)" },
    "chart.best_sharpe_mc": { es: "Mejor Sharpe (MC)", en: "Best Sharpe (MC)" },
    "chart.min_vol_mc": { es: "Mínima Volatilidad (MC)", en: "Minimum Volatility (MC)" },

    // Chart Tooltips
    "chart.tooltip_rf": { es: "Rf:", en: "Rf:" },
    "chart.tooltip_no_risk": { es: "(sin riesgo)", en: "(risk-free)" },
    "chart.tooltip_optimal": { es: "Óptimo:", en: "Optimal:" },
    "chart.tooltip_mixed": { es: "Mixto:", en: "Mixed:" },
    "chart.tooltip_vol": { es: "Vol", en: "Vol" },
    "chart.tooltip_ret": { es: "Ret", en: "Ret" },

    // ===== Validation Messages (main.js) =====
    "validation.empty_ticker": { es: "El ticker no puede estar vacío", en: "Ticker cannot be empty" },
    "validation.ticker_length": {
        es: "El ticker debe tener entre 1 y 15 caracteres",
        en: "Ticker must be between 1 and 15 characters"
    },
    "validation.ticker_format": {
        es: "El ticker solo puede contener letras, números, puntos, guiones o guiones bajos",
        en: "Ticker can only contain letters, numbers, periods, hyphens or underscores"
    },
    "validation.min_required": { es: "Mínimo 5 tickers requeridos", en: "Minimum 5 tickers required" },
    "validation.min_reached": { es: "Mínimo alcanzado", en: "Minimum reached" },
    "validation.optimal_diversification": { es: "Diversificación óptima", en: "Optimal diversification" },
    "validation.max_reached": { es: "Máximo alcanzado", en: "Maximum reached" },
    "validation.almost_full": { es: "Casi lleno", en: "Almost full" },
    "validation.max_placeholder": {
        es: "Máximo de 30 tickers alcanzado",
        en: "Maximum of 30 tickers reached"
    },
    "validation.input_placeholder": {
        es: "Escribe un ticker (ej: AAPL) y presiona Enter...",
        en: "Type a ticker (e.g. AAPL) and press Enter..."
    },
    "validation.no_results": { es: "No se encontraron resultados", en: "No results found" },
    "validation.already_in_list": { es: "ya está en la lista", en: "is already in the list" },
    "validation.max_allowed": { es: "Máximo 30 tickers permitidos", en: "Maximum 30 tickers allowed" },
    "validation.select_range": {
        es: "Debes seleccionar entre 5 y 30 tickers.",
        en: "You must select between 5 and 30 tickers."
    },
    "validation.remove_ticker": { es: "Remover", en: "Remove" },

    // ===== CSS pseudo-content =====
    "css.no_tickers": { es: "Sin tickers seleccionados", en: "No tickers selected" },

    // ===== Error messages from backend =====
    "error.ticker_range": {
        es: "Debes ingresar entre 5 y 30 tickers.",
        en: "You must enter between 5 and 30 tickers."
    },

    // ===== Chart.js loading errors =====
    "error.chartjs_load": {
        es: "Error: Chart.js no pudo cargarse. Por favor recarga la página.",
        en: "Error: Chart.js could not load. Please reload the page."
    },
};

/**
 * Get the current language from localStorage, defaulting to 'es'
 * @returns {string} 'es' or 'en'
 */
function getCurrentLang() {
    return localStorage.getItem("lang") || "es";
}

/**
 * Set the current language and persist to localStorage
 * @param {string} lang - 'es' or 'en'
 */
function setCurrentLang(lang) {
    localStorage.setItem("lang", lang);
}

/**
 * Get a translated string by key
 * @param {string} key - Translation key (e.g. 'nav.how_it_works')
 * @param {string} [lang] - Language override (defaults to current language)
 * @returns {string} Translated string, or the key if not found
 */
function t(key, lang) {
    const l = lang || getCurrentLang();
    const entry = TRANSLATIONS[key];
    if (!entry) return key;
    return entry[l] || entry["es"] || key;
}

/**
 * Apply translations to all elements with data-i18n attributes
 */
function applyTranslations() {
    const lang = getCurrentLang();

    // Update <html lang="...">
    document.documentElement.lang = lang;

    // Update page title
    document.title = t("page.title");

    // Translate text content
    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        el.textContent = t(key);
    });

    // Translate HTML content (for elements that contain HTML)
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
        const key = el.getAttribute("data-i18n-html");
        el.innerHTML = t(key);
    });

    // Translate placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        const key = el.getAttribute("data-i18n-placeholder");
        el.placeholder = t(key);
    });

    // Translate aria-labels
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
        const key = el.getAttribute("data-i18n-aria");
        el.setAttribute("aria-label", t(key));
    });

    // Update language toggle button state
    const toggleBtns = document.querySelectorAll(".lang-toggle-btn");
    toggleBtns.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.lang === lang);
    });

    // Dispatch event so other scripts can react
    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));
}

/**
 * Switch language and re-apply all translations
 * @param {string} lang - 'es' or 'en'
 */
function switchLanguage(lang) {
    setCurrentLang(lang);
    applyTranslations();
}

// Auto-apply translations when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    applyTranslations();
});
