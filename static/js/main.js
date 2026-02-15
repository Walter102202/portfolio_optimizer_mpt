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

// Base de datos de acciones chilenas - IPSA (~30 empresas de la Bolsa de Santiago)
const CHILEAN_STOCKS = [
    {t:"CHILE.SN",n:"Banco de Chile"},{t:"SQM-B.SN",n:"SQM Sociedad Química Minera"},
    {t:"FALABELLA.SN",n:"Falabella"},{t:"CENCOSUD.SN",n:"Cencosud"},
    {t:"COPEC.SN",n:"Empresas Copec"},{t:"BSANTANDER.SN",n:"Banco Santander Chile"},
    {t:"BCI.SN",n:"Banco BCI"},{t:"CMPC.SN",n:"Empresas CMPC"},
    {t:"LTM.SN",n:"LATAM Airlines"},{t:"ENELAM.SN",n:"Enel Américas"},
    {t:"ITAUCL.SN",n:"Itaú Corpbanca"},{t:"ILC.SN",n:"ILC"},
    {t:"QUINENCO.SN",n:"Quiñenco"},{t:"ENELCHILE.SN",n:"Enel Chile"},
    {t:"CCU.SN",n:"CCU Cervecerías Unidas"},{t:"VAPORES.SN",n:"CSAV Vapores"},
    {t:"COLBUN.SN",n:"Colbún"},{t:"CAP.SN",n:"CAP"},
    {t:"AGUAS-A.SN",n:"Aguas Andinas"},{t:"ANDINA-B.SN",n:"Embotelladora Andina"},
    {t:"PARAUCO.SN",n:"Parque Arauco"},{t:"RIPLEY.SN",n:"Ripley"},
    {t:"SECURITY.SN",n:"Grupo Security"},{t:"MALLPLAZA.SN",n:"Mallplaza"},
    {t:"HABITAT.SN",n:"AFP Habitat"},{t:"SONDA.SN",n:"Sonda"},
    {t:"ECL.SN",n:"Engie Energia Chile"},{t:"ORO-BLANCO.SN",n:"Oro Blanco"},
    {t:"IAM.SN",n:"Inversiones Aguas Metropolitanas"},{t:"SMSAAM.SN",n:"SM SAAM"}
];

// Índices predefinidos para optimización rápida
const INDEX_TICKERS = {
    IPSA: {
        label: "IPSA Chile",
        description: "30 acciones de la Bolsa de Santiago",
        tickers: CHILEAN_STOCKS.map(s => s.t)
    },
    SP500: {
        label: "S&P 500",
        description: "Top 20 por capitalización",
        tickers: ["AAPL","MSFT","GOOGL","AMZN","NVDA","META","TSLA","BRK-B","LLY","V",
                  "UNH","XOM","JPM","JNJ","WMT","MA","PG","AVGO","HD","CVX"]
    },
    NASDAQ: {
        label: "NASDAQ",
        description: "Top 20 por capitalización",
        tickers: ["AAPL","MSFT","GOOGL","AMZN","NVDA","META","TSLA","AVGO","COST","NFLX",
                  "ADBE","AMD","QCOM","INTC","INTU","CMCSA","TXN","AMGN","AMAT","BKNG"]
    }
};

// Base de datos de acciones estadounidenses - S&P 500 + NASDAQ (~350+ empresas)
const US_STOCKS = [
    {t:"AAPL",n:"Apple"},{t:"MSFT",n:"Microsoft"},{t:"GOOGL",n:"Alphabet Google"},{t:"AMZN",n:"Amazon"},{t:"NVDA",n:"NVIDIA"},
    {t:"META",n:"Meta Facebook"},{t:"TSLA",n:"Tesla"},{t:"BRK.B",n:"Berkshire Hathaway"},{t:"LLY",n:"Eli Lilly"},{t:"V",n:"Visa"},
    {t:"UNH",n:"UnitedHealth"},{t:"XOM",n:"Exxon Mobil"},{t:"JPM",n:"JPMorgan Chase"},{t:"JNJ",n:"Johnson Johnson"},
    {t:"WMT",n:"Walmart"},{t:"MA",n:"Mastercard"},{t:"PG",n:"Procter Gamble"},{t:"AVGO",n:"Broadcom"},{t:"HD",n:"Home Depot"},
    {t:"CVX",n:"Chevron"},{t:"MRK",n:"Merck"},{t:"ABBV",n:"AbbVie"},{t:"COST",n:"Costco"},{t:"KO",n:"Coca Cola"},
    {t:"ORCL",n:"Oracle"},{t:"PEP",n:"PepsiCo Pepsi"},{t:"ADBE",n:"Adobe"},{t:"MCD",n:"McDonald McDonalds"},
    {t:"CSCO",n:"Cisco"},{t:"CRM",n:"Salesforce"},{t:"ACN",n:"Accenture"},{t:"NFLX",n:"Netflix"},{t:"TMO",n:"Thermo Fisher"},
    {t:"ABT",n:"Abbott"},{t:"INTC",n:"Intel"},{t:"AMD",n:"Advanced Micro Devices"},{t:"DHR",n:"Danaher"},
    {t:"DIS",n:"Disney Walt"},{t:"TXN",n:"Texas Instruments"},{t:"CMCSA",n:"Comcast"},{t:"PFE",n:"Pfizer"},
    {t:"VZ",n:"Verizon"},{t:"NKE",n:"Nike"},{t:"WFC",n:"Wells Fargo"},{t:"COP",n:"ConocoPhillips"},{t:"BMY",n:"Bristol Myers Squibb"},
    {t:"LIN",n:"Linde"},{t:"PM",n:"Philip Morris"},{t:"UPS",n:"United Parcel Service"},{t:"HON",n:"Honeywell"},
    {t:"RTX",n:"RTX Raytheon"},{t:"QCOM",n:"Qualcomm"},{t:"T",n:"ATT AT&T"},{t:"INTU",n:"Intuit"},{t:"UNP",n:"Union Pacific"},
    {t:"LOW",n:"Lowes Lowe"},{t:"SPGI",n:"SP Global"},{t:"BA",n:"Boeing"},{t:"AMAT",n:"Applied Materials"},{t:"CAT",n:"Caterpillar"},
    {t:"GS",n:"Goldman Sachs"},{t:"ELV",n:"Elevance Health"},{t:"DE",n:"Deere John"},{t:"BLK",n:"BlackRock"},
    {t:"BKNG",n:"Booking Holdings"},{t:"AXP",n:"American Express"},{t:"MS",n:"Morgan Stanley"},{t:"GILD",n:"Gilead"},
    {t:"ADI",n:"Analog Devices"},{t:"MDLZ",n:"Mondelez"},{t:"MMC",n:"Marsh McLennan"},{t:"TJX",n:"TJX Companies"},
    {t:"GE",n:"General Electric"},{t:"VRTX",n:"Vertex Pharmaceuticals"},{t:"ADP",n:"Automatic Data Processing"},
    {t:"SLB",n:"Schlumberger"},{t:"AMT",n:"American Tower"},{t:"CI",n:"Cigna"},{t:"TMUS",n:"T-Mobile TMobile"},
    {t:"C",n:"Citigroup Citi"},{t:"REGN",n:"Regeneron"},{t:"MO",n:"Altria"},{t:"CB",n:"Chubb"},{t:"NOW",n:"ServiceNow"},
    {t:"ISRG",n:"Intuitive Surgical"},{t:"SBUX",n:"Starbucks"},{t:"SCHW",n:"Charles Schwab"},{t:"ZTS",n:"Zoetis"},
    {t:"PLD",n:"Prologis"},{t:"SO",n:"Southern Company"},{t:"DUK",n:"Duke Energy"},{t:"PGR",n:"Progressive"},
    {t:"BSX",n:"Boston Scientific"},{t:"ETN",n:"Eaton"},{t:"BDX",n:"Becton Dickinson"},{t:"APD",n:"Air Products"},
    {t:"PANW",n:"Palo Alto Networks"},{t:"CME",n:"CME Group"},{t:"EOG",n:"EOG Resources"},{t:"ITW",n:"Illinois Tool Works"},
    {t:"AON",n:"Aon"},{t:"CL",n:"Colgate Palmolive"},{t:"MCK",n:"McKesson"},{t:"CSX",n:"CSX Corporation"},
    {t:"WM",n:"Waste Management"},{t:"HCA",n:"HCA Healthcare"},{t:"USB",n:"US Bancorp"},{t:"MU",n:"Micron Technology"},
    {t:"PYPL",n:"PayPal"},{t:"GM",n:"General Motors"},{t:"PNC",n:"PNC Financial"},{t:"APH",n:"Amphenol"},
    {t:"SHW",n:"Sherwin Williams"},{t:"ECL",n:"Ecolab"},{t:"MSI",n:"Motorola Solutions"},{t:"MAR",n:"Marriott"},
    {t:"NSC",n:"Norfolk Southern"},{t:"KLAC",n:"KLA Corporation"},{t:"LRCX",n:"Lam Research"},{t:"FDX",n:"FedEx"},
    {t:"SNPS",n:"Synopsys"},{t:"CDNS",n:"Cadence Design"},{t:"AJG",n:"Arthur J Gallagher"},{t:"ICE",n:"Intercontinental Exchange"},
    {t:"AFL",n:"Aflac"},{t:"TGT",n:"Target"},{t:"EMR",n:"Emerson Electric"},{t:"AIG",n:"American International"},
    {t:"FCX",n:"Freeport McMoRan"},{t:"ORLY",n:"OReilly Automotive"},{t:"TFC",n:"Truist Financial"},{t:"PSA",n:"Public Storage"},
    {t:"CEG",n:"Constellation Energy"},{t:"MCO",n:"Moodys Moody"},{t:"PCAR",n:"PACCAR"},{t:"ROP",n:"Roper Technologies"},
    {t:"AZO",n:"AutoZone"},{t:"NXPI",n:"NXP Semiconductors"},{t:"SRE",n:"Sempra Energy"},{t:"GD",n:"General Dynamics"},
    {t:"COIN",n:"Coinbase"},{t:"TRV",n:"Travelers Companies"},{t:"CARR",n:"Carrier Global"},{t:"ROST",n:"Ross Stores"},
    {t:"JCI",n:"Johnson Controls"},{t:"ABNB",n:"Airbnb"},{t:"MCHP",n:"Microchip Technology"},{t:"HUM",n:"Humana"},
    {t:"CCI",n:"Crown Castle"},{t:"ALL",n:"Allstate"},{t:"O",n:"Realty Income"},{t:"AEP",n:"American Electric Power"},
    {t:"CMG",n:"Chipotle Mexican Grill"},{t:"KMB",n:"Kimberly Clark"},{t:"CMI",n:"Cummins"},{t:"PAYX",n:"Paychex"},
    {t:"WELL",n:"Welltower"},{t:"URI",n:"United Rentals"},{t:"CPRT",n:"Copart"},{t:"FTNT",n:"Fortinet"},
    {t:"HLT",n:"Hilton"},{t:"D",n:"Dominion Energy"},{t:"GWW",n:"Grainger"},{t:"ODFL",n:"Old Dominion Freight"},
    {t:"F",n:"Ford Motor"},{t:"FAST",n:"Fastenal"},{t:"TEL",n:"TE Connectivity"},{t:"CTVA",n:"Corteva"},
    {t:"SPG",n:"Simon Property"},{t:"KR",n:"Kroger"},{t:"MSCI",n:"MSCI Inc"},{t:"YUM",n:"Yum Brands"},
    {t:"KHC",n:"Kraft Heinz"},{t:"IDXX",n:"IDEXX Laboratories"},{t:"RSG",n:"Republic Services"},{t:"BK",n:"Bank of New York Mellon"},
    {t:"NEM",n:"Newmont"},{t:"VRSK",n:"Verisk Analytics"},{t:"EA",n:"Electronic Arts"},{t:"SYK",n:"Stryker"},
    {t:"DHI",n:"DR Horton"},{t:"EW",n:"Edwards Lifesciences"},{t:"HPQ",n:"HP Inc"},{t:"CTSH",n:"Cognizant"},
    {t:"STZ",n:"Constellation Brands"},{t:"GIS",n:"General Mills"},{t:"A",n:"Agilent Technologies"},{t:"EXC",n:"Exelon"},
    {t:"IR",n:"Ingersoll Rand"},{t:"DLR",n:"Digital Realty"},{t:"IQV",n:"IQVIA Holdings"},{t:"LHX",n:"L3Harris Technologies"},
    {t:"CTAS",n:"Cintas"},{t:"XEL",n:"Xcel Energy"},{t:"PCG",n:"PG&E Pacific Gas Electric"},{t:"HES",n:"Hess"},
    {t:"ACGL",n:"Arch Capital"},{t:"RMD",n:"ResMed"},{t:"KVUE",n:"Kenvue"},{t:"HSY",n:"Hershey"},
    {t:"DD",n:"DuPont"},{t:"DXCM",n:"DexCom"},{t:"IT",n:"Gartner"},{t:"VMC",n:"Vulcan Materials"},
    {t:"CHTR",n:"Charter Communications"},{t:"ANSS",n:"ANSYS"},{t:"DAL",n:"Delta Air Lines"},{t:"ROK",n:"Rockwell Automation"},
    {t:"MTD",n:"Mettler Toledo"},{t:"CDW",n:"CDW Corporation"},{t:"GLW",n:"Corning"},{t:"WMB",n:"Williams Companies"},
    {t:"ED",n:"Consolidated Edison"},{t:"TTWO",n:"Take Two Interactive"},{t:"EFX",n:"Equifax"},{t:"MPWR",n:"Monolithic Power"},
    {t:"PPG",n:"PPG Industries"},{t:"OXY",n:"Occidental Petroleum"},{t:"FICO",n:"Fair Isaac FICO"},{t:"DOW",n:"Dow Chemical"},
    {t:"BAX",n:"Baxter International"},{t:"STT",n:"State Street"},{t:"EIX",n:"Edison International"},{t:"TSN",n:"Tyson Foods"},
    {t:"AVB",n:"AvalonBay Communities"},{t:"GRMN",n:"Garmin"},{t:"MLM",n:"Martin Marietta"},{t:"WBD",n:"Warner Bros Discovery"},
    {t:"VICI",n:"VICI Properties"},{t:"HAL",n:"Halliburton"},{t:"WAB",n:"Westinghouse Air Brake"},{t:"WEC",n:"WEC Energy"},
    {t:"FANG",n:"Diamondback Energy"},{t:"BKR",n:"Baker Hughes"},{t:"MPC",n:"Marathon Petroleum"},{t:"VLO",n:"Valero Energy"},
    {t:"PSX",n:"Phillips 66"},{t:"KMI",n:"Kinder Morgan"},{t:"HIG",n:"Hartford Financial"},{t:"KEYS",n:"Keysight Technologies"},
    {t:"EQR",n:"Equity Residential"},{t:"AWK",n:"American Water Works"},{t:"DTE",n:"DTE Energy"},{t:"PRU",n:"Prudential Financial"},
    {t:"LEN",n:"Lennar"},{t:"DVN",n:"Devon Energy"},{t:"TROW",n:"T Rowe Price"},{t:"GPN",n:"Global Payments"},
    {t:"SBAC",n:"SBA Communications"},{t:"CHD",n:"Church Dwight"},{t:"EQT",n:"EQT Corporation"},{t:"COF",n:"Capital One"},
    {t:"DFS",n:"Discover Financial"},{t:"PPL",n:"PPL Corporation"},{t:"ADM",n:"Archer Daniels Midland"},{t:"NUE",n:"Nucor"},
    {t:"IBM",n:"International Business Machines"},{t:"ZBH",n:"Zimmer Biomet"},{t:"AEE",n:"Ameren"},{t:"LYB",n:"LyondellBasell"},
    {t:"VTR",n:"Ventas"},{t:"FIS",n:"Fidelity National Information"},{t:"BRO",n:"Brown Brown"},{t:"PH",n:"Parker Hannifin"},
    // NASDAQ - Tech & Software
    {t:"SHOP",n:"Shopify"},{t:"ZM",n:"Zoom Video"},{t:"DOCU",n:"DocuSign"},{t:"TEAM",n:"Atlassian"},
    {t:"NET",n:"Cloudflare"},{t:"SPLK",n:"Splunk"},{t:"MNDY",n:"Monday.com"},{t:"ALGN",n:"Align Technology"},
    {t:"MRVL",n:"Marvell Technology"},{t:"ON",n:"ON Semiconductor"},{t:"SMCI",n:"Super Micro Computer"},
    {t:"ARM",n:"ARM Holdings"},{t:"ASML",n:"ASML Holding"},
    // NASDAQ - Media & Entertainment
    {t:"SPOT",n:"Spotify"},{t:"ROKU",n:"Roku"},{t:"PARA",n:"Paramount Global"},{t:"LYV",n:"Live Nation"},
    // NASDAQ - E-commerce & Consumer
    {t:"EBAY",n:"eBay"},{t:"ETSY",n:"Etsy"},{t:"W",n:"Wayfair"},
    {t:"CHWY",n:"Chewy"},{t:"DASH",n:"DoorDash"},{t:"UBER",n:"Uber Technologies"},{t:"LYFT",n:"Lyft"},
    {t:"EXPE",n:"Expedia"},{t:"MELI",n:"MercadoLibre"},{t:"SE",n:"Sea Limited Shopee"},
    // NASDAQ - Semiconductors & Hardware
    {t:"SWKS",n:"Skyworks Solutions"},{t:"QRVO",n:"Qorvo"},{t:"ENTG",n:"Entegris"},{t:"WOLF",n:"Wolfspeed"},
    // NASDAQ - Biotech & Healthcare
    {t:"BIIB",n:"Biogen"},{t:"MRNA",n:"Moderna"},{t:"BNTX",n:"BioNTech"},{t:"ILMN",n:"Illumina"},
    {t:"SGEN",n:"Seagen"},{t:"ALNY",n:"Alnylam Pharmaceuticals"},{t:"NBIX",n:"Neurocrine"},
    {t:"INCY",n:"Incyte"},{t:"EXAS",n:"Exact Sciences"},{t:"TECH",n:"Bio-Techne"},{t:"BMRN",n:"BioMarin"},
    {t:"SRPT",n:"Sarepta Therapeutics"},{t:"JAZZ",n:"Jazz Pharmaceuticals"},{t:"IONS",n:"Ionis Pharmaceuticals"},
    // NASDAQ - Electric Vehicles & Auto
    {t:"RIVN",n:"Rivian Automotive"},{t:"LCID",n:"Lucid Group"},{t:"FSR",n:"Fisker"},{t:"NKLA",n:"Nikola"},
    // NASDAQ - Fintech & Payments
    {t:"SQ",n:"Block Square"},{t:"SOFI",n:"SoFi Technologies"},
    {t:"AFRM",n:"Affirm Holdings"},{t:"UPST",n:"Upstart Holdings"},{t:"LC",n:"LendingClub"},{t:"NU",n:"Nu Holdings Nubank"},
    {t:"BILL",n:"Bill.com"},{t:"FOUR",n:"Shift4 Payments"},{t:"HOOD",n:"Robinhood Markets"},
    // NASDAQ - Gaming
    {t:"ATVI",n:"Activision Blizzard"},{t:"U",n:"Unity Software"},{t:"DKNG",n:"DraftKings"},{t:"PENN",n:"Penn Entertainment"},
    // NASDAQ - Clean Energy & Sustainability
    {t:"ENPH",n:"Enphase Energy"},{t:"SEDG",n:"SolarEdge"},{t:"FSLR",n:"First Solar"},{t:"RUN",n:"Sunrun"},
    {t:"PLUG",n:"Plug Power"},{t:"BE",n:"Bloom Energy"},{t:"BLNK",n:"Blink Charging"},{t:"CHPT",n:"ChargePoint"},
    // NASDAQ - Cybersecurity
    {t:"S",n:"SentinelOne"},{t:"TENB",n:"Tenable"},{t:"QLYS",n:"Qualys"},
    // NASDAQ - Cloud & Infrastructure
    {t:"MDB",n:"MongoDB"},{t:"CFLT",n:"Confluent"},{t:"ESTC",n:"Elastic"},{t:"DBX",n:"Dropbox"},{t:"BOX",n:"Box"},
    // NASDAQ - Communication & Social
    {t:"BMBL",n:"Bumble"},{t:"RDDT",n:"Reddit"},
    // NASDAQ - Chinese ADRs
    {t:"BIDU",n:"Baidu"},{t:"IQ",n:"iQIYI"},{t:"TCOM",n:"Trip.com"},{t:"WB",n:"Weibo"}
];

// Crear índice de búsqueda para acceso rápido (US + Chile)
const STOCK_SEARCH_INDEX = {};
US_STOCKS.forEach(stock => {
    const searchTerms = `${stock.t} ${stock.n}`.toLowerCase();
    STOCK_SEARCH_INDEX[stock.t] = { ticker: stock.t, name: stock.n, searchTerms };
});
CHILEAN_STOCKS.forEach(stock => {
    const searchTerms = `${stock.t} ${stock.n}`.toLowerCase();
    STOCK_SEARCH_INDEX[stock.t] = { ticker: stock.t, name: stock.n, searchTerms };
});

/**
 * Busca acciones por ticker o nombre de empresa
 * @param {string} query - Término de búsqueda
 * @param {number} maxResults - Máximo número de resultados (default: 8)
 * @returns {Array} - Array de resultados ordenados por relevancia
 */
function searchStocks(query, maxResults = 8) {
    if (!query || query.trim().length === 0) {
        return [];
    }

    const searchQuery = query.toLowerCase().trim();
    const results = [];

    // Buscar en el índice
    for (const ticker in STOCK_SEARCH_INDEX) {
        const stock = STOCK_SEARCH_INDEX[ticker];
        const tickerLower = stock.ticker.toLowerCase();
        const nameLower = stock.name.toLowerCase();

        // Calcular puntuación de relevancia
        let score = 0;

        // Coincidencia exacta con ticker (máxima prioridad)
        if (tickerLower === searchQuery) {
            score = 1000;
        }
        // Ticker comienza con el query
        else if (tickerLower.startsWith(searchQuery)) {
            score = 900;
        }
        // Ticker contiene el query
        else if (tickerLower.includes(searchQuery)) {
            score = 700;
        }
        // Nombre comienza con el query
        else if (nameLower.startsWith(searchQuery)) {
            score = 600;
        }
        // Palabra del nombre comienza con el query
        else if (nameLower.split(' ').some(word => word.startsWith(searchQuery))) {
            score = 500;
        }
        // Nombre contiene el query
        else if (nameLower.includes(searchQuery)) {
            score = 300;
        }

        if (score > 0) {
            results.push({
                ticker: stock.ticker,
                name: stock.name,
                score: score
            });
        }
    }

    // Ordenar por puntuación descendente y limitar resultados
    return results
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults);
}

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
    removeBtn.setAttribute("aria-label", `${t('validation.remove_ticker')} ${ticker}`);

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
        return { valid: false, error: t('validation.empty_ticker') };
    }

    const cleaned = ticker.trim().toUpperCase();

    // Validar longitud (1-15 caracteres para acomodar tickers internacionales como SM-CHILE_B.SN)
    if (cleaned.length < 1 || cleaned.length > 15) {
        return { valid: false, error: t('validation.ticker_length') };
    }

    // Validar que solo contenga letras, números, puntos, guiones o underscores
    if (!/^[A-Z0-9.\-_]+$/.test(cleaned)) {
        return { valid: false, error: t('validation.ticker_format') };
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
        validationEl.textContent = `⚠ ${t('validation.min_required')}`;
    } else if (count >= 5 && count <= 7) {
        counterEl.classList.add("counter-warning");
        validationEl.classList.add("text-warning");
        validationEl.textContent = `✓ ${t('validation.min_reached')}`;
    } else if (count >= 8 && count <= 28) {
        counterEl.classList.add("counter-optimal");
        validationEl.classList.add("text-success");
        validationEl.textContent = `✓ ${t('validation.optimal_diversification')}`;
    } else if (count >= 29 && count <= 30) {
        counterEl.classList.add("counter-warning");
        validationEl.classList.add("text-warning");
        validationEl.textContent = count === 30 ? `⚠ ${t('validation.max_reached')}` : `⚠ ${t('validation.almost_full')}`;
    }

    // Deshabilitar input si se alcanzó el máximo
    const searchInput = document.getElementById("ticker-search");
    if (searchInput) {
        searchInput.disabled = count >= 30;
        if (count >= 30) {
            searchInput.placeholder = t('validation.max_placeholder');
        } else {
            searchInput.placeholder = t('validation.input_placeholder');
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
        this.resultsDropdown = document.getElementById("search-results");
        this.currentResults = [];
        this.selectedIndex = -1;

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
        // Input change para búsqueda en tiempo real
        this.searchInput.addEventListener("input", (e) => {
            const query = e.target.value.trim();
            if (query.length >= 1) {
                this.showSearchResults(query);
            } else {
                this.hideSearchResults();
            }
        });

        // Navegación por teclado
        this.searchInput.addEventListener("keydown", (e) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                this.navigateResults(1);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                this.navigateResults(-1);
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (this.selectedIndex >= 0 && this.currentResults.length > 0) {
                    // Seleccionar resultado del dropdown
                    const selectedResult = this.currentResults[this.selectedIndex];
                    this.addTicker(selectedResult.ticker);
                    this.hideSearchResults();
                } else {
                    // Agregar lo que está escrito
                    const ticker = this.searchInput.value.trim();
                    if (ticker) {
                        this.addTicker(ticker);
                        this.hideSearchResults();
                    }
                }
            } else if (e.key === "Escape") {
                this.hideSearchResults();
            } else if (e.key === "Backspace" && this.searchInput.value === "" && this.selectedTickers.length > 0) {
                const lastTicker = this.selectedTickers[this.selectedTickers.length - 1];
                this.removeTicker(lastTicker);
            }
        });

        // Click en resultados del dropdown
        this.resultsDropdown.addEventListener("click", (e) => {
            const item = e.target.closest(".search-result-item");
            if (item && item.dataset.ticker) {
                this.addTicker(item.dataset.ticker);
                this.hideSearchResults();
            }
        });

        // Click en sugerencias
        this.suggestionsContainer.addEventListener("click", (e) => {
            if (e.target.classList.contains("ticker-suggestion") && !e.target.disabled) {
                const ticker = e.target.dataset.ticker;
                this.addTicker(ticker);
            }
        });

        // Click en botón de remover chip
        this.container.addEventListener("click", (e) => {
            if (e.target.classList.contains("ticker-chip-remove")) {
                const chip = e.target.closest(".ticker-chip");
                if (chip) {
                    const ticker = chip.dataset.ticker;
                    this.removeTicker(ticker);
                }
            }
        });

        // Click en botones de índice
        const indexButtonsContainer = document.getElementById("index-buttons");
        if (indexButtonsContainer) {
            indexButtonsContainer.addEventListener("click", (e) => {
                const btn = e.target.closest(".index-btn");
                if (btn && btn.dataset.index) {
                    this.loadIndex(btn.dataset.index);
                }
            });
        }

        // Cerrar dropdown al hacer click fuera
        document.addEventListener("click", (e) => {
            if (!this.searchInput.contains(e.target) && !this.resultsDropdown.contains(e.target)) {
                this.hideSearchResults();
            }
        });

        // Listen for language changes to re-render dynamic text
        document.addEventListener("langchange", () => {
            this.updateUI();
        });
    }

    showSearchResults(query) {
        const results = searchStocks(query);
        this.currentResults = results;
        this.selectedIndex = -1;

        if (results.length === 0) {
            this.resultsDropdown.innerHTML = `<div class="search-result-empty">${t('validation.no_results')}</div>`;
            this.resultsDropdown.style.display = "block";
            return;
        }

        let html = "";
        results.forEach((result, index) => {
            const activeClass = index === this.selectedIndex ? "active" : "";
            html += `
                <div class="search-result-item ${activeClass}" data-ticker="${result.ticker}" data-index="${index}">
                    <span class="search-result-ticker">${result.ticker}</span>
                    <span class="search-result-name">${result.name}</span>
                </div>
            `;
        });

        this.resultsDropdown.innerHTML = html;
        this.resultsDropdown.style.display = "block";
    }

    hideSearchResults() {
        this.resultsDropdown.style.display = "none";
        this.currentResults = [];
        this.selectedIndex = -1;
    }

    navigateResults(direction) {
        if (this.currentResults.length === 0) return;

        this.selectedIndex += direction;

        if (this.selectedIndex < 0) {
            this.selectedIndex = this.currentResults.length - 1;
        } else if (this.selectedIndex >= this.currentResults.length) {
            this.selectedIndex = 0;
        }

        // Actualizar estilos visuales
        const items = this.resultsDropdown.querySelectorAll(".search-result-item");
        items.forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.classList.add("active");
                item.scrollIntoView({ block: "nearest", behavior: "smooth" });
            } else {
                item.classList.remove("active");
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
            this.showError(`${normalizedTicker} ${t('validation.already_in_list')}`);
            return;
        }

        // Verificar límite máximo
        if (this.selectedTickers.length >= 30) {
            this.showError(t('validation.max_allowed'));
            return;
        }

        // Agregar a la lista
        this.selectedTickers.push(normalizedTicker);

        // Actualizar UI
        this.updateUI();

        // Ocultar resultados de búsqueda
        this.hideSearchResults();

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
            badge.disabled = this.selectedTickers.includes(ticker) || this.selectedTickers.length >= 30;
        });
    }

    loadIndex(indexKey) {
        const indexData = INDEX_TICKERS[indexKey];
        if (!indexData) return;

        // Limpiar selección actual
        this.selectedTickers = [];
        this.container.innerHTML = "";

        // Agregar todos los tickers del índice
        indexData.tickers.forEach(ticker => this.addTicker(ticker, false));

        // Limpiar input y actualizar UI
        this.searchInput.value = "";
        this.updateUI();

        // Marcar botón activo
        const indexButtons = document.querySelectorAll(".index-btn");
        indexButtons.forEach(btn => {
            btn.classList.toggle("active", btn.dataset.index === indexKey);
        });
    }

    showError(message) {
        const validationEl = document.getElementById("ticker-validation");
        if (!validationEl) return;

        // Mostrar error temporalmente
        validationEl.textContent = `⚠ ${message}`;
        validationEl.classList.add("text-danger");

        // Restaurar mensaje anterior después de 3 segundos
        setTimeout(() => {
            updateTickerCounter(this.selectedTickers.length);
        }, 3000);
    }
}

// Translate known backend error messages
function translateErrorAlerts() {
    const errorAlerts = document.querySelectorAll("[data-error-msg]");
    errorAlerts.forEach((el) => {
        const msg = el.getAttribute("data-error-msg");
        // Map known Spanish error messages to i18n keys
        const ERROR_MAP = {
            "Debes ingresar entre 5 y 30 tickers.": "error.ticker_range",
        };
        const key = ERROR_MAP[msg];
        if (key) {
            el.textContent = t(key);
        }
    });
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
            if (tickers.length < 5 || tickers.length > 30) {
                e.preventDefault();
                alert(t('validation.select_range'));
                return;
            }
            spinner?.classList.remove("d-none");
        });
    }

    // Translate any error alerts on the page
    translateErrorAlerts();

    // Re-translate error alerts on language change
    document.addEventListener("langchange", () => {
        translateErrorAlerts();
    });

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
