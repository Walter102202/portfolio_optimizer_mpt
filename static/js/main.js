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

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("portfolio-form");
    const spinner = document.getElementById("spinner");

    if (!form) return;

    form.addEventListener("submit", (e) => {
        const tickers = parseTickers(form.tickers.value || "");
        if (tickers.length < 5 || tickers.length > 20) {
            e.preventDefault();
            alert("Debes ingresar entre 5 y 20 tickers.");
            return;
        }
        spinner?.classList.remove("d-none");
    });

    // Suavizar scroll a secciones internas
    document.querySelectorAll('a[href*="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
            const href = this.getAttribute("href");
            const hashIndex = href.indexOf("#");
            if (hashIndex === -1) return;

            const targetId = href.substring(hashIndex + 1);
            const targetEl = document.getElementById(targetId);

            // Si el elemento existe en la página actual, hacer scroll suave
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
                // Actualizar el hash en la URL sin recargar
                history.pushState(null, null, "#" + targetId);
            }
            // Si no existe, permitir navegación normal (el navegador irá a la otra página)
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
