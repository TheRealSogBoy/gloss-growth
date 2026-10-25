/**
 * GLOSS & GROWTH — COMPONENTE CENTRALIZADO MULTIMONEDA
 * Catálogo priorizado, buscador inteligente, formateador numérico y sincronización reactiva.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.GlossCurrency = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // =========================================================================
  // 1. CATÁLOGO PRIORIZADO DE MONEDAS
  // =========================================================================
  const CURRENCY_CATALOG = [
    // --- LATINOAMÉRICA Y MERCADOS HISPANOHABLANTES (PRIORIZADOS PRIMERO) ---
    {
      code: 'COP',
      name: 'Peso colombiano',
      symbol: '$',
      countries: ['Colombia'],
      isoMinorUnit: 2, // Oficial ISO 4217: 2 decimales (centavos)
      displayDecimals: 0, // Interfaz médica y estética: 0 decimales para montos enteros
      zeroDecimals: true // Compatibilidad retroactiva
    },
    {
      code: 'MXN',
      name: 'Peso mexicano',
      symbol: '$',
      countries: ['México', 'Mexico'],
      isoMinorUnit: 2,
      displayDecimals: 2,
      zeroDecimals: false
    },
    {
      code: 'USD',
      name: 'Dólar estadounidense',
      symbol: '$',
      countries: ['Estados Unidos', 'USA', 'Ecuador', 'Panamá', 'Panama', 'El Salvador', 'Puerto Rico'],
      isoMinorUnit: 2,
      displayDecimals: 2,
      zeroDecimals: false
    },
    {
      code: 'EUR',
      name: 'Euro',
      symbol: '€',
      countries: ['España', 'Espana', 'Unión Europea', 'Alemania', 'Francia', 'Italia', 'Portugal'],
      isoMinorUnit: 2,
      displayDecimals: 2,
      zeroDecimals: false
    },
    {
      code: 'PEN',
      name: 'Sol peruano',
      symbol: 'S/',
      countries: ['Perú', 'Peru'],
      isoMinorUnit: 2,
      displayDecimals: 2,
      zeroDecimals: false
    },
    {
      code: 'CLP',
      name: 'Peso chileno',
      symbol: '$',
      countries: ['Chile'],
      isoMinorUnit: 0,
      displayDecimals: 0,
      zeroDecimals: true
    },
    {
      code: 'ARS',
      name: 'Peso argentino',
      symbol: '$',
      countries: ['Argentina'],
      isoMinorUnit: 2,
      displayDecimals: 2,
      zeroDecimals: false
    },
    {
      code: 'BRL',
      name: 'Real brasileño',
      symbol: 'R$',
      countries: ['Brasil', 'Brazil'],
      isoMinorUnit: 2,
      displayDecimals: 2,
      zeroDecimals: false
    },
    {
      code: 'UYU',
      name: 'Peso uruguayo',
      symbol: '$',
      countries: ['Uruguay'],
      isoMinorUnit: 2,
      displayDecimals: 2,
      zeroDecimals: false
    },
    {
      code: 'PYG',
      name: 'Guaraní paraguayo',
      symbol: '₲',
      countries: ['Paraguay'],
      isoMinorUnit: 0,
      displayDecimals: 0,
      zeroDecimals: true
    },
    {
      code: 'BOB',
      name: 'Boliviano',
      symbol: 'Bs',
      countries: ['Bolivia'],
      isoMinorUnit: 2,
      displayDecimals: 2,
      zeroDecimals: false
    },
    {
      code: 'VES',
      name: 'Bolívar digital',
      symbol: 'Bs.',
      countries: ['Venezuela'],
      isoMinorUnit: 2,
      displayDecimals: 2,
      zeroDecimals: false
    },
    {
      code: 'CRC',
      name: 'Colón costarricense',
      symbol: '₡',
      countries: ['Costa Rica'],
      isoMinorUnit: 2,
      displayDecimals: 2,
      zeroDecimals: false
    },
    {
      code: 'GTQ',
      name: 'Quetzal guatemalteco',
      symbol: 'Q',
      countries: ['Guatemala'],
      isoMinorUnit: 2,
      displayDecimals: 2,
      zeroDecimals: false
    },
    {
      code: 'HNL',
      name: 'Lempira hondureña',
      symbol: 'L',
      countries: ['Honduras'],
      isoMinorUnit: 2,
      displayDecimals: 2,
      zeroDecimals: false
    },
    {
      code: 'NIO',
      name: 'Córdoba nicaragüense',
      symbol: 'C$',
      countries: ['Nicaragua'],
      isoMinorUnit: 2,
      displayDecimals: 2,
      zeroDecimals: false
    },
    {
      code: 'DOP',
      name: 'Peso dominicano',
      symbol: 'RD$',
      countries: ['República Dominicana', 'Republica Dominicana', 'Dominicana'],
      isoMinorUnit: 2,
      displayDecimals: 2,
      zeroDecimals: false
    },
    {
      code: 'CUP',
      name: 'Peso cubano',
      symbol: '$',
      countries: ['Cuba'],
      isoMinorUnit: 2,
      displayDecimals: 2,
      zeroDecimals: false
    },
    {
      code: 'PAB',
      name: 'Balboa panameño',
      symbol: 'B/.',
      countries: ['Panamá', 'Panama'],
      isoMinorUnit: 2,
      displayDecimals: 2,
      zeroDecimals: false
    },
    {
      code: 'BZD',
      name: 'Dólar beliceño',
      symbol: 'BZ$',
      countries: ['Belice', 'Belize'],
      isoMinorUnit: 2,
      displayDecimals: 2,
      zeroDecimals: false
    },

    // --- PRINCIPALES MERCADOS INTERNACIONALES ---
    {
      code: 'GBP',
      name: 'Libra esterlina',
      symbol: '£',
      countries: ['Reino Unido', 'Gran Bretaña', 'Inglaterra', 'UK'],
      isoMinorUnit: 2,
      displayDecimals: 2,
      zeroDecimals: false
    },
    {
      code: 'CAD',
      name: 'Dólar canadiense',
      symbol: '$',
      countries: ['Canadá', 'Canada'],
      isoMinorUnit: 2,
      displayDecimals: 2,
      zeroDecimals: false
    },
    {
      code: 'CHF',
      name: 'Franco suizo',
      symbol: 'CHF',
      countries: ['Suiza', 'Switzerland'],
      isoMinorUnit: 2,
      displayDecimals: 2,
      zeroDecimals: false
    },
    {
      code: 'JPY',
      name: 'Yen japonés',
      symbol: '¥',
      countries: ['Japón', 'Japon', 'Japan'],
      isoMinorUnit: 0,
      displayDecimals: 0,
      zeroDecimals: true
    },
    {
      code: 'CNY',
      name: 'Yuan chino',
      symbol: '¥',
      countries: ['China'],
      isoMinorUnit: 2,
      displayDecimals: 2,
      zeroDecimals: false
    },
    {
      code: 'AUD',
      name: 'Dólar australiano',
      symbol: '$',
      countries: ['Australia'],
      isoMinorUnit: 2,
      displayDecimals: 2,
      zeroDecimals: false
    },
    {
      code: 'INR',
      name: 'Rupia india',
      symbol: '₹',
      countries: ['India'],
      isoMinorUnit: 2,
      displayDecimals: 2,
      zeroDecimals: false
    },

    // --- RESPALDO ISO 4217 COMÚN ---
    { code: 'NZD', name: 'Dólar neozelandés', symbol: '$', countries: ['Nueva Zelanda'], isoMinorUnit: 2, displayDecimals: 2, zeroDecimals: false },
    { code: 'SEK', name: 'Corona sueca', symbol: 'kr', countries: ['Suecia'], isoMinorUnit: 2, displayDecimals: 2, zeroDecimals: false },
    { code: 'NOK', name: 'Corona noruega', symbol: 'kr', countries: ['Noruega'], isoMinorUnit: 2, displayDecimals: 2, zeroDecimals: false },
    { code: 'DKK', name: 'Corona danesa', symbol: 'kr', countries: ['Dinamarca'], isoMinorUnit: 2, displayDecimals: 2, zeroDecimals: false },
    { code: 'SGD', name: 'Dólar singapurense', symbol: '$', countries: ['Singapur'], isoMinorUnit: 2, displayDecimals: 2, zeroDecimals: false },
    { code: 'HKD', name: 'Dólar de Hong Kong', symbol: '$', countries: ['Hong Kong'], isoMinorUnit: 2, displayDecimals: 2, zeroDecimals: false },
    { code: 'ZAR', name: 'Rand sudafricano', symbol: 'R', countries: ['Sudáfrica'], isoMinorUnit: 2, displayDecimals: 2, zeroDecimals: false },
    { code: 'AED', name: 'Dírham emiratí', symbol: 'د.إ', countries: ['Emiratos Árabes Unidos', 'Dubai'], isoMinorUnit: 2, displayDecimals: 2, zeroDecimals: false },
    { code: 'SAR', name: 'Riyal saudí', symbol: 'ر.س', countries: ['Arabia Saudita'], isoMinorUnit: 2, displayDecimals: 2, zeroDecimals: false },
    { code: 'TRY', name: 'Lira turca', symbol: '₺', countries: ['Turquía'], isoMinorUnit: 2, displayDecimals: 2, zeroDecimals: false },
    { code: 'ILS', name: 'Nuevo séquel', symbol: '₪', countries: ['Israel'], isoMinorUnit: 2, displayDecimals: 2, zeroDecimals: false },
    { code: 'KRW', name: 'Won surcoreano', symbol: '₩', countries: ['Corea del Sur'], isoMinorUnit: 0, displayDecimals: 0, zeroDecimals: true },
    { code: 'PHP', name: 'Peso filipino', symbol: '₱', countries: ['Filipinas'], isoMinorUnit: 2, displayDecimals: 2, zeroDecimals: false },
    { code: 'IDR', name: 'Rupia indonesia', symbol: 'Rp', countries: ['Indonesia'], isoMinorUnit: 0, displayDecimals: 0, zeroDecimals: true },
    { code: 'THB', name: 'Baht tailandés', symbol: '฿', countries: ['Tailandia'], isoMinorUnit: 2, displayDecimals: 2, zeroDecimals: false },
    { code: 'MYR', name: 'Ringgit malasio', symbol: 'RM', countries: ['Malasia'], isoMinorUnit: 2, displayDecimals: 2, zeroDecimals: false },
    { code: 'PLN', name: 'Zloty polaco', symbol: 'zł', countries: ['Polonia'], isoMinorUnit: 2, displayDecimals: 2, zeroDecimals: false },
    { code: 'CZK', name: 'Corona checa', symbol: 'Kč', countries: ['República Checa'], isoMinorUnit: 2, displayDecimals: 2, zeroDecimals: false },
    { code: 'HUF', name: 'Forinto húngaro', symbol: 'Ft', countries: ['Hungría'], isoMinorUnit: 0, displayDecimals: 0, zeroDecimals: true }
  ];

  const STORAGE_KEY = 'gloss_selected_currency';
  let activeCurrencyCode = 'COP';

  // =========================================================================
  // 2. UTILIDADES DE CONSULTA Y NORMALIZACIÓN
  // =========================================================================

  function normalizeText(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  function getCurrency(code) {
    if (!code) return CURRENCY_CATALOG[0];
    const upper = String(code).trim().toUpperCase();
    const found = CURRENCY_CATALOG.find(c => c.code === upper);
    if (found) return found;
    // Si no está en catálogo principal, permitir código ISO genérico
    return {
      code: upper,
      name: upper,
      symbol: '$',
      countries: [],
      zeroDecimals: false
    };
  }

  function searchCurrencies(query) {
    if (!query || !query.trim()) return CURRENCY_CATALOG;
    const q = normalizeText(query);
    return CURRENCY_CATALOG.filter(c => {
      const codeMatch = c.code.toLowerCase().includes(q);
      const nameMatch = normalizeText(c.name).includes(q);
      const symbolMatch = c.symbol.toLowerCase() === q;
      const countryMatch = (c.countries || []).some(country => normalizeText(country).includes(q));
      return codeMatch || nameMatch || symbolMatch || countryMatch;
    });
  }

  // =========================================================================
  // 3. FORMATEO Y PARSING NUMÉRICO ROBUSTO
  // =========================================================================

  /**
   * Formatea un valor monetario según la divisa seleccionada.
   * Formato: [Símbolo][Espacio si aplica][Monto].[Miles],[Decimales] [ISO]
   * Ejemplos: $300.000 COP, $25.000 MXN, $1.200 USD, €150 EUR, S/ 500 PEN, B/. 450,50 PAB.
   * 
   * Distingue con rigor:
   * 1. Decimales oficiales ISO 4217 (isoMinorUnit).
   * 2. Decimales de despliegue en interfaz estética (displayDecimals / zeroDecimals).
   * 3. Precisión interna de cálculo (mantiene número float íntegro sin redondeo prematuro).
   */
  function formatCurrency(val, code = activeCurrencyCode, includeCode = true, options = {}) {
    if (val === null || val === undefined || !Number.isFinite(val)) return '—';
    const curr = getCurrency(code);
    const sign = val < 0 ? '−' : '';
    const abs = Math.abs(val);

    // Determinar cantidad de decimales a desplegar según reglas y opciones
    let minDigits = 0;
    let maxDigits = 0;

    if (options && typeof options.minimumFractionDigits === 'number') {
      minDigits = Math.max(0, options.minimumFractionDigits);
      maxDigits = typeof options.maximumFractionDigits === 'number' ? Math.max(minDigits, options.maximumFractionDigits) : minDigits;
    } else if (options && options.forceDecimals) {
      // Fuerza mostrar los decimales oficiales ISO 4217 (ej. 2 para COP si se audita al centavo)
      minDigits = typeof curr.isoMinorUnit === 'number' ? curr.isoMinorUnit : 2;
      maxDigits = minDigits;
    } else if (curr.displayDecimals === 0 || curr.zeroDecimals) {
      // Monedas donde la interfaz comercial/médica se presenta sin centavos (ej: COP, CLP, JPY, KRW)
      if (options && options.showDecimalsIfPresent && !Number.isInteger(abs)) {
        minDigits = curr.isoMinorUnit || 2;
        maxDigits = minDigits;
      } else {
        minDigits = 0;
        maxDigits = 0;
      }
    } else if (Number.isInteger(abs) && (!options || !options.alwaysShowTwoDecimals)) {
      minDigits = 0;
      maxDigits = 0;
    } else {
      minDigits = curr.displayDecimals !== undefined ? curr.displayDecimals : 2;
      maxDigits = minDigits;
    }

    const numStr = new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: minDigits,
      maximumFractionDigits: maxDigits
    }).format(minDigits === 0 && maxDigits === 0 ? Math.round(abs) : abs);

    const spacer = (curr.symbol.length > 1) ? ' ' : '';
    const codeSuffix = includeCode ? ` ${curr.code}` : '';
    return `${sign}${curr.symbol}${spacer}${numStr}${codeSuffix}`;
  }

  /**
   * Alias retrocompatible con herramientas previas
   */
  function formatCOP(val, includeCurrency = true) {
    return formatCurrency(val, 'COP', includeCurrency);
  }

  /**
   * Parser numérico que preserva la magnitud de $300.000 (sin truncar a 300).
   * Acepta números directos, strings con símbolos ($ / € / £ / S/), comas y puntos.
   */
  function parseNumber(val) {
    if (val === null || val === undefined || val === '') return 0;
    if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
    let str = String(val).trim();
    const isNegative = str.startsWith('-') || str.startsWith('−');

    // Remover letras, símbolos de moneda comunes y espacios
    str = str.replace(/[\$\u20AC\u00A3\u00A5\s]/g, '').replace(/[a-zA-Z]/g, '').replace(/[^\d.,]/g, '');
    if (!str) return 0;

    let n = 0;
    // Múltiples puntos: claramente separador de miles (ej. 40.000.000)
    if ((str.match(/\./g) || []).length > 1) {
      str = str.replace(/\./g, '').replace(',', '.');
      n = parseFloat(str);
    } else if ((str.match(/,/g) || []).length > 1) {
      // Múltiples comas: separador de miles anglosajón (ej. 40,000,000)
      str = str.replace(/,/g, '');
      n = parseFloat(str);
    } else if (str.includes('.') && str.includes(',')) {
      const lastDot = str.lastIndexOf('.');
      const lastComma = str.lastIndexOf(',');
      if (lastDot > lastComma) {
        str = str.replace(/,/g, '');
      } else {
        str = str.replace(/\./g, '').replace(',', '.');
      }
      n = parseFloat(str);
    } else if (str.includes('.')) {
      const parts = str.split('.');
      if (parts[1].length === 3 && parts[0].length >= 1) {
        str = str.replace(/\./g, '');
      }
      n = parseFloat(str);
    } else if (str.includes(',')) {
      const parts = str.split(',');
      if (parts[1].length === 3 && parts[0].length >= 1) {
        str = str.replace(/,/g, '');
      } else {
        str = str.replace(',', '.');
      }
      n = parseFloat(str);
    } else {
      n = parseFloat(str);
    }

    if (!Number.isFinite(n)) return 0;
    return isNegative ? -Math.abs(n) : n;
  }

  // =========================================================================
  // 4. GESTIÓN DEL ESTADO GLOBAL DE MONEDA
  // =========================================================================

  function getSelectedCurrency() {
    // 1. Revisar URL params si estamos en navegador
    if (typeof window !== 'undefined' && window.location) {
      const urlParams = new URLSearchParams(window.location.search);
      const paramCode = urlParams.get('moneda') || urlParams.get('currency');
      if (paramCode) {
        const found = getCurrency(paramCode);
        activeCurrencyCode = found.code;
        return activeCurrencyCode;
      }
    }
    // 2. Revisar localStorage
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          activeCurrencyCode = getCurrency(saved).code;
          return activeCurrencyCode;
        }
      }
    } catch (e) {}

    return activeCurrencyCode;
  }

  function setSelectedCurrency(code, options = {}) {
    const prevCode = activeCurrencyCode;
    const curr = getCurrency(code);
    activeCurrencyCode = curr.code;

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, activeCurrencyCode);
      }
    } catch (e) {}

    // Actualizar etiquetas en la interfaz
    updateUnitLabels(document, activeCurrencyCode);

    // Actualizar pickers visuales en el DOM
    document.querySelectorAll('.gloss-currency-picker').forEach(pickerEl => {
      syncPickerVisuals(pickerEl, curr);
    });

    // Si se cambió de moneda y hay valores introducidos > 0, mostrar confirmación
    if (prevCode !== activeCurrencyCode && !options.silent) {
      const hasValues = checkPageHasNumericValues();
      if (hasValues) {
        showCurrencyChangeNotice();
      }
    }

    // Disparar evento global reactivo
    if (typeof window !== 'undefined' && !options.silent) {
      window.dispatchEvent(new CustomEvent('gloss-currency-change', {
        detail: {
          code: activeCurrencyCode,
          info: curr,
          prevCode: prevCode
        }
      }));
    }

    return curr;
  }

  /**
   * Actualiza todos los elementos con la clase .currency-unit-label
   */
  function updateUnitLabels(scope = document, code = activeCurrencyCode) {
    if (!scope || typeof scope.querySelectorAll !== 'function') return;
    const elements = scope.querySelectorAll('.currency-unit-label, [data-currency-unit]');
    elements.forEach(el => {
      el.textContent = code;
    });
  }

  /**
   * Verifica si hay inputs numéricos con valores mayores a cero en la página
   */
  function checkPageHasNumericValues(scope = document) {
    if (!scope || typeof scope.querySelectorAll !== 'function') return false;
    const inputs = scope.querySelectorAll('input[type="number"], input[type="text"].calc-input, input[type="text"].cap-input');
    for (const inp of inputs) {
      if (inp.id && (inp.id.includes('name') || inp.id.includes('nombre') || inp.id.includes('negocio'))) continue;
      const val = parseNumber(inp.value);
      if (val > 0) return true;
    }
    return false;
  }

  function showCurrencyChangeNotice() {
    const notices = document.querySelectorAll('.gloss-curr-notice');
    notices.forEach(notice => {
      notice.removeAttribute('hidden');
      notice.style.display = 'flex';
    });
  }

  function hideCurrencyChangeNotice() {
    const notices = document.querySelectorAll('.gloss-curr-notice');
    notices.forEach(notice => {
      notice.setAttribute('hidden', '');
      notice.style.display = 'none';
    });
  }

  // =========================================================================
  // 5. COMPONENTE UI ACCESIBLE DE SELECCIÓN
  // =========================================================================

  function syncPickerVisuals(pickerEl, curr) {
    if (!pickerEl) return;
    const nameEl = pickerEl.querySelector('.gloss-curr-btn-name');
    const codeEl = pickerEl.querySelector('.gloss-curr-btn-code');
    const badgeEl = pickerEl.closest('.gloss-currency-field')?.querySelector('.gloss-currency-badge');

    if (nameEl) nameEl.textContent = curr.name;
    if (codeEl) codeEl.textContent = curr.code;
    if (badgeEl) badgeEl.textContent = curr.code;

    // Actualizar clase is-selected en la lista
    const items = pickerEl.querySelectorAll('.gloss-curr-item');
    items.forEach(item => {
      const itemCode = item.getAttribute('data-code');
      if (itemCode === curr.code) {
        item.classList.add('is-selected');
        item.setAttribute('aria-selected', 'true');
      } else {
        item.classList.remove('is-selected');
        item.setAttribute('aria-selected', 'false');
      }
    });
  }

  function renderPickerHtml(instanceId, currentCurr) {
    return `
      <div class="gloss-currency-field" id="field-${instanceId}">
        <div class="gloss-currency-label-row">
          <label class="gloss-currency-label" for="btn-${instanceId}">Moneda de tu análisis</label>
          <span class="gloss-currency-badge" aria-hidden="true">${currentCurr.code}</span>
        </div>
        <div class="gloss-currency-picker" id="${instanceId}">
          <button type="button" class="gloss-curr-btn" id="btn-${instanceId}" aria-haspopup="listbox" aria-expanded="false" aria-label="Moneda de tu análisis: ${currentCurr.name} — ${currentCurr.code}">
            <span class="gloss-curr-btn-content">
              <span class="gloss-curr-btn-name">${currentCurr.name}</span>
              <span class="gloss-curr-btn-code">${currentCurr.code}</span>
            </span>
            <svg class="gloss-curr-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          <div class="gloss-curr-dropdown" hidden>
            <div class="gloss-curr-search-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input type="search" class="gloss-curr-search-input" placeholder="Buscar por país, moneda o ISO (ej. México, USD)..." autocomplete="off" spellcheck="false" aria-label="Filtrar monedas">
            </div>
            <ul class="gloss-curr-list" role="listbox" tabindex="-1" aria-label="Lista de monedas disponibles">
              ${CURRENCY_CATALOG.map(c => `
                <li role="option" class="gloss-curr-item ${c.code === currentCurr.code ? 'is-selected' : ''}" data-code="${c.code}" aria-selected="${c.code === currentCurr.code}">
                  <span class="gloss-curr-item-name">${c.name}</span>
                  <span class="gloss-curr-item-meta">
                    <span class="gloss-curr-item-symbol">${c.symbol}</span>
                    <span class="gloss-curr-item-code">${c.code}</span>
                  </span>
                </li>
              `).join('')}
            </ul>
            <div class="gloss-curr-empty" hidden>No se encontraron monedas coincidentes</div>
          </div>
        </div>

        <div class="gloss-curr-notice" hidden role="status" aria-live="polite">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>Los valores numéricos se conservarán y pasarán a interpretarse en la nueva moneda. No se realizará conversión de divisas.</span>
          <button type="button" class="gloss-curr-notice-close" aria-label="Cerrar aviso" onclick="this.closest('.gloss-curr-notice').style.display='none'">×</button>
        </div>
      </div>
    `;
  }

  function initPicker(target, options = {}) {
    const container = typeof target === 'string' ? document.querySelector(target) : target;
    if (!container) return null;

    getSelectedCurrency();
    const currentCurr = getCurrency(activeCurrencyCode);
    const instanceId = options.id || 'gloss-curr-' + Math.random().toString(36).substring(2, 9);

    container.innerHTML = renderPickerHtml(instanceId, currentCurr);

    const pickerEl = container.querySelector('.gloss-currency-picker');
    const btn = pickerEl.querySelector('.gloss-curr-btn');
    const dropdown = pickerEl.querySelector('.gloss-curr-dropdown');
    const searchInput = pickerEl.querySelector('.gloss-curr-search-input');
    const list = pickerEl.querySelector('.gloss-curr-list');
    const emptyMsg = pickerEl.querySelector('.gloss-curr-empty');

    let isOpen = false;
    let highlightedIndex = -1;

    function openDropdown() {
      if (isOpen) return;
      isOpen = true;
      dropdown.removeAttribute('hidden');
      btn.setAttribute('aria-expanded', 'true');
      searchInput.value = '';
      filterItems('');
      searchInput.focus();

      // Scroll to selected item
      const selectedItem = list.querySelector('.gloss-curr-item.is-selected');
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest' });
      }
    }

    function closeDropdown(focusBtn = true) {
      if (!isOpen) return;
      isOpen = false;
      dropdown.setAttribute('hidden', '');
      btn.setAttribute('aria-expanded', 'false');
      clearHighlight();
      if (focusBtn) btn.focus();
    }

    function toggleDropdown() {
      if (isOpen) closeDropdown();
      else openDropdown();
    }

    function filterItems(q) {
      const results = searchCurrencies(q);
      const allowedCodes = new Set(results.map(r => r.code));
      let visibleCount = 0;

      list.querySelectorAll('.gloss-curr-item').forEach(item => {
        const code = item.getAttribute('data-code');
        if (allowedCodes.has(code)) {
          item.style.display = 'flex';
          visibleCount++;
        } else {
          item.style.display = 'none';
        }
      });

      if (visibleCount === 0) {
        emptyMsg.removeAttribute('hidden');
      } else {
        emptyMsg.setAttribute('hidden', '');
      }
      clearHighlight();
    }

    function getVisibleItems() {
      return Array.from(list.querySelectorAll('.gloss-curr-item')).filter(
        item => item.style.display !== 'none'
      );
    }

    function highlightItem(index) {
      const items = getVisibleItems();
      clearHighlight();
      if (index >= 0 && index < items.length) {
        highlightedIndex = index;
        const targetItem = items[index];
        targetItem.classList.add('is-highlighted');
        targetItem.scrollIntoView({ block: 'nearest' });
      }
    }

    function clearHighlight() {
      highlightedIndex = -1;
      list.querySelectorAll('.gloss-curr-item.is-highlighted').forEach(el => {
        el.classList.remove('is-highlighted');
      });
    }

    function selectCode(code) {
      setSelectedCurrency(code);
      closeDropdown(true);
      if (typeof options.onChange === 'function') {
        options.onChange(code, getCurrency(code));
      }
    }

    // Eventos Click / Teclado
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleDropdown();
    });

    searchInput.addEventListener('input', (e) => {
      filterItems(e.target.value);
    });

    searchInput.addEventListener('keydown', (e) => {
      const items = getVisibleItems();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        highlightItem(highlightedIndex + 1 < items.length ? highlightedIndex + 1 : 0);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        highlightItem(highlightedIndex - 1 >= 0 ? highlightedIndex - 1 : items.length - 1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightedIndex >= 0 && items[highlightedIndex]) {
          selectCode(items[highlightedIndex].getAttribute('data-code'));
        } else if (items.length > 0) {
          selectCode(items[0].getAttribute('data-code'));
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeDropdown(true);
      }
    });

    list.addEventListener('click', (e) => {
      const item = e.target.closest('.gloss-curr-item');
      if (item) {
        const code = item.getAttribute('data-code');
        selectCode(code);
      }
    });

    // Cerrar al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (isOpen && !pickerEl.contains(e.target)) {
        closeDropdown(false);
      }
    });

    return {
      pickerEl,
      getSelected: () => activeCurrencyCode,
      setCurrency: (c, opts) => setSelectedCurrency(c, opts)
    };
  }

  function getIsoMinorUnit(code) {
    const c = getCurrency(code);
    return typeof c.isoMinorUnit === 'number' ? c.isoMinorUnit : (c.zeroDecimals ? 0 : 2);
  }

  function getDisplayDecimals(code) {
    const c = getCurrency(code);
    return typeof c.displayDecimals === 'number' ? c.displayDecimals : (c.zeroDecimals ? 0 : 2);
  }

  // Inicializar divisa activa al cargar script
  if (typeof window !== 'undefined') {
    getSelectedCurrency();
  }

  return {
    CURRENCIES: CURRENCY_CATALOG,
    CURRENCY_CATALOG: CURRENCY_CATALOG,
    getCurrency,
    getIsoMinorUnit,
    getDisplayDecimals,
    searchCurrencies,
    formatCurrency,
    formatCOP,
    parseNumber,
    getSelectedCurrency,
    setSelectedCurrency,
    updateUnitLabels,
    initPicker,
    showNotice: showCurrencyChangeNotice,
    hideNotice: hideCurrencyChangeNotice
  };
}));
