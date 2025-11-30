function parseTickers(raw) {
    let cleaned = raw;
    [",", ";", "\n", "\t"].forEach((sep) => {
        cleaned = cleaned.split(sep).join(" ");
    });
    return cleaned
        .split(" ")
        .map((t) => t.trim().toUpperCase())
        .filter((t) => t.length > 0);
}

// Lista de acciones populares organizadas por categoría
const POPULAR_TICKERS = {
    Tech: ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "NVDA", "TSLA"],
    Finance: ["JPM", "BAC", "WFC", "GS", "MS", "C"],
    Healthcare: ["JNJ", "PFE", "UNH", "ABBV", "MRK"],
    Energy: ["XOM", "CVX", "COP", "SLB"],
    Consumer: ["KO", "PEP", "PG", "WMT", "HD", "NKE"]
};

/**
 * Crea un chip HTML para un ticker
 * @param {string} ticker - Símbolo del ticker
 * @returns {HTMLElement} - Elemento div del chip
 */
function createTickerChip(ticker) {
    const chip = document.createElement("div");
    chip.className = "ticker-chip";
    chip.dataset.ticker = ticker;

    const tickerText = document.createElement("span");
    tickerText.className = "ticker-chip-text";
    tickerText.textContent = ticker;

    const removeBtn = document.createElement("button");
    removeBtn.className = "ticker-chip-remove";
    removeBtn.type = "button";
    removeBtn.innerHTML = "&times;";
    removeBtn.setAttribute("aria-label", `Remover ${ticker}`);

    chip.appendChild(tickerText);
    chip.appendChild(removeBtn);

    return chip;
}

/**
 * Crea un badge de sugerencia para un ticker
 * @param {string} ticker - Símbolo del ticker
 * @returns {HTMLElement} - Elemento button del badge
 */
function createSuggestionBadge(ticker) {
    const badge = document.createElement("button");
    badge.className = "ticker-suggestion";
    badge.type = "button";
    badge.textContent = ticker;
    badge.dataset.ticker = ticker;
    return badge;
}

/**
 * Renderiza las sugerencias rápidas en el DOM
 */
function renderQuickSuggestions() {
    const container = document.getElementById("quick-suggestions");
    if (!container) return;

    container.innerHTML = "";

    Object.entries(POPULAR_TICKERS).forEach(([category, tickers]) => {
        // Mostrar solo las primeras 3 categorías para no saturar
        if (["Tech", "Finance", "Consumer"].includes(category)) {
            tickers.slice(0, 5).forEach((ticker) => {
                const badge = createSuggestionBadge(ticker);
                container.appendChild(badge);
            });
        }
    });
}

/**
 * Valida el formato de un ticker
 * @param {string} ticker - Ticker a validar
 * @returns {Object} - {valid: boolean, error: string}
 */
function validateTickerFormat(ticker) {
    if (!ticker || ticker.trim() === "") {
        return { valid: false, error: "El ticker no puede estar vacío" };
    }

    const cleaned = ticker.trim().toUpperCase();

    // Validar longitud (1-5 caracteres es común para tickers)
    if (cleaned.length < 1 || cleaned.length > 5) {
        return { valid: false, error: "El ticker debe tener entre 1 y 5 caracteres" };
    }

    // Validar que solo contenga letras, números y opcionalmente punto o guión
    if (!/^[A-Z0-9.\-]+$/.test(cleaned)) {
        return { valid: false, error: "El ticker solo puede contener letras, números, puntos o guiones" };
    }

    return { valid: true, ticker: cleaned };
}

/**
 * Normaliza un ticker (mayúsculas y trim)
 * @param {string} ticker - Ticker a normalizar
 * @returns {string} - Ticker normalizado
 */
function normalizeTicker(ticker) {
    return ticker.trim().toUpperCase();
}

/**
 * Actualiza el contador visual y su estado
 * @param {number} count - Número de tickers seleccionados
 */
function updateTickerCounter(count) {
    const counterEl = document.getElementById("ticker-counter");
    const validationEl = document.getElementById("ticker-validation");

    if (!counterEl || !validationEl) return;

    counterEl.textContent = count;

    // Remover todas las clases de estado
    counterEl.classList.remove("counter-danger", "counter-warning", "counter-success", "counter-optimal");
    validationEl.classList.remove("text-danger", "text-warning", "text-success");

    // Estados con código de colores
    if (count < 5) {
        counterEl.classList.add("counter-danger");
        validationEl.classList.add("text-danger");
        validationEl.textContent = "⚠ Mínimo 5 tickers requeridos";
    } else if (count >= 5 && count <= 7) {
        counterEl.classList.add("counter-warning");
        validationEl.classList.add("text-warning");
        validationEl.textContent = "✓ Mínimo alcanzado";
    } else if (count >= 8 && count <= 18) {
        counterEl.classList.add("counter-optimal");
        validationEl.classList.add("text-success");
        validationEl.textContent = "✓ Diversificación óptima";
    } else if (count === 19 || count === 20) {
        counterEl.classList.add("counter-warning");
        validationEl.classList.add("text-warning");
        validationEl.textContent = count === 20 ? "⚠ Máximo alcanzado" : "⚠ Casi lleno";
    }

    // Deshabilitar input si se alcanzó el máximo
    const searchInput = document.getElementById("ticker-search");
    if (searchInput) {
        searchInput.disabled = count >= 20;
        if (count >= 20) {
            searchInput.placeholder = "Máximo de 20 tickers alcanzado";
        } else {
            searchInput.placeholder = "Escribe un ticker (ej: AAPL) y presiona Enter...";
        }
    }
}

/**
 * Sincroniza el campo hidden con los tickers seleccionados
 * @param {Array<string>} tickers - Array de tickers seleccionados
 */
function syncHiddenField(tickers) {
    const hiddenField = document.getElementById("tickers");
    if (!hiddenField) return;

    // Actualizar el valor del campo hidden con los tickers separados por coma
    hiddenField.value = tickers.join(", ");
}

/**
 * Clase principal para manejar el selector de tickers
 */
class TickerSelector {
    constructor() {
        this.selectedTickers = [];
        this.container = document.getElementById("selected-tickers");
        this.searchInput = document.getElementById("ticker-search");
        this.suggestionsContainer = document.getElementById("quick-suggestions");

        this.init();
    }

    init() {
        // Renderizar sugerencias iniciales
        renderQuickSuggestions();

        // Event listeners
        this.setupEventListeners();

        // Cargar tickers existentes si hay (para casos de error de validación)
        const hiddenField = document.getElementById("tickers");
        if (hiddenField && hiddenField.value.trim()) {
            const existingTickers = parseTickers(hiddenField.value);
            existingTickers.forEach(ticker => this.addTicker(ticker, false));
        }

        // Actualizar estado inicial
        this.updateUI();
    }

    setupEventListeners() {
        // Enter en el input de búsqueda
        this.searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                const ticker = this.searchInput.value.trim();
                if (ticker) {
                    this.addTicker(ticker);
                }
            }
        });

        // Backspace para remover último ticker cuando input está vacío
        this.searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Backspace" && this.searchInput.value === "" && this.selectedTickers.length > 0) {
                const lastTicker = this.selectedTickers[this.selectedTickers.length - 1];
                this.removeTicker(lastTicker);
            }
        });

        // Click en sugerencias
        this.suggestionsContainer.addEventListener("click", (e) => {
            if (e.target.classList.contains("ticker-suggestion") && !e.target.disabled) {
                const ticker = e.target.dataset.ticker;
                this.addTicker(ticker);
            }
        });

        // Click en botón de remover chip (delegación de eventos)
        this.container.addEventListener("click", (e) => {
            if (e.target.classList.contains("ticker-chip-remove")) {
                const chip = e.target.closest(".ticker-chip");
                if (chip) {
                    const ticker = chip.dataset.ticker;
                    this.removeTicker(ticker);
                }
            }
        });
    }

    addTicker(ticker, clearInput = true) {
        // Validar formato
        const validation = validateTickerFormat(ticker);
        if (!validation.valid) {
            this.showError(validation.error);
            return;
        }

        const normalizedTicker = validation.ticker;

        // Verificar si ya está agregado
        if (this.selectedTickers.includes(normalizedTicker)) {
            this.showError(`${normalizedTicker} ya está en la lista`);
            return;
        }

        // Verificar límite máximo
        if (this.selectedTickers.length >= 20) {
            this.showError("Máximo 20 tickers permitidos");
            return;
        }

        // Agregar a la lista
        this.selectedTickers.push(normalizedTicker);

        // Actualizar UI
        this.updateUI();

        // Limpiar input
        if (clearInput) {
            this.searchInput.value = "";
            this.searchInput.focus();
        }
    }

    removeTicker(ticker) {
        const chip = this.container.querySelector(`[data-ticker="${ticker}"]`);

        // Animación de salida
        if (chip) {
            chip.classList.add("chip-removing");
            setTimeout(() => {
                this.selectedTickers = this.selectedTickers.filter(t => t !== ticker);
                this.updateUI();
            }, 200);
        } else {
            this.selectedTickers = this.selectedTickers.filter(t => t !== ticker);
            this.updateUI();
        }
    }

    updateUI() {
        // Renderizar chips
        this.renderChips();

        // Actualizar contador
        updateTickerCounter(this.selectedTickers.length);

        // Sincronizar campo hidden
        syncHiddenField(this.selectedTickers);

        // Actualizar estado de sugerencias
        this.updateSuggestions();
    }

    renderChips() {
        this.container.innerHTML = "";

        this.selectedTickers.forEach(ticker => {
            const chip = createTickerChip(ticker);
            this.container.appendChild(chip);
        });
    }

    updateSuggestions() {
        const suggestions = this.suggestionsContainer.querySelectorAll(".ticker-suggestion");

        suggestions.forEach(badge => {
            const ticker = badge.dataset.ticker;
            badge.disabled = this.selectedTickers.includes(ticker) || this.selectedTickers.length >= 20;
        });
    }

    showError(message) {
        const validationEl = document.getElementById("ticker-validation");
        if (!validationEl) return;

        // Guardar mensaje anterior
        const previousMessage = validationEl.textContent;

        // Mostrar error temporalmente
        validationEl.textContent = `⚠ ${message}`;
        validationEl.classList.add("text-danger");

        // Restaurar mensaje anterior después de 3 segundos
        setTimeout(() => {
            updateTickerCounter(this.selectedTickers.length);
        }, 3000);
    }
}

// Inicialización cuando el DOM está listo
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("portfolio-form");
    const spinner = document.getElementById("spinner");

    // Inicializar selector de tickers si existe el formulario
    if (form && document.getElementById("ticker-search")) {
        const tickerSelector = new TickerSelector();

        // Validación al enviar formulario
        form.addEventListener("submit", (e) => {
            const tickers = tickerSelector.selectedTickers;
            if (tickers.length < 5 || tickers.length > 20) {
                e.preventDefault();
                alert("Debes seleccionar entre 5 y 20 tickers.");
                return;
            }
            spinner?.classList.remove("d-none");
        });
    }

    // Scroll suave solo para enlaces que apuntan a anclas en la misma página
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
            const targetId = this.getAttribute("href").substring(1);
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });

    // Si la página carga con un hash, hacer scroll suave a esa sección
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
            setTimeout(() => {
                targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
        }
    }
});
