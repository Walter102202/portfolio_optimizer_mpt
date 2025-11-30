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

// Debug: capturar todos los clicks
document.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
        const link = e.target.closest("a");
        console.log("CLICK EN ENLACE:", {
            text: link.textContent.trim(),
            href: link.getAttribute("href"),
            classes: link.className,
            defaultPrevented: e.defaultPrevented
        });
    }
}, true);

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("portfolio-form");
    const spinner = document.getElementById("spinner");

    if (form) {
        form.addEventListener("submit", (e) => {
            const tickers = parseTickers(form.tickers.value || "");
            if (tickers.length < 5 || tickers.length > 20) {
                e.preventDefault();
                alert("Debes ingresar entre 5 y 20 tickers.");
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
