/**
 * GLOSS & GROWTH — SISTEMA COMPARTIDO DE DATOS GUARDADOS Y TRANSFERENCIAS
 * Persistencia local del navegador (localStorage) para la suite Finanzas y Gestión.
 *
 * Características:
 * 1. Perfiles de negocio independientes (Nombre y Moneda) sin backend.
 * 2. Guardado versionado de análisis por herramienta (Rentabilidad, ROAS, Capacidad, Aparatología).
 * 3. Recuperación reactiva: recarga entradas y re-ejecuta el motor matemático.
 * 4. Transferencias controladas entre herramientas:
 *    - Rentabilidad -> ROAS (Precio, Costo variable, Margen)
 *    - Rentabilidad -> Aparatología (Precio sesión, Costo variable)
 *    - Capacidad -> Aparatología (Cabinas, Profesionales, Horas, Citas)
 * 5. Sanitización de entradas contra XSS e inyecciones en nombres.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.GlossStorage = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_KEYS = {
    ACTIVE_BUSINESS: 'gloss_active_business_v1',
    BUSINESS_LIST: 'gloss_business_profiles_v1',
    ANALYSES: 'gloss_saved_analyses_v1',
    TRANSFER_TREATMENT_ROAS: 'gloss_transfer_treatment_roas_v1',
    TRANSFER_TREATMENT_APARAT: 'gloss_transfer_treatment_aparat_v1',
    TRANSFER_CAPACITY_APARAT: 'gloss_transfer_capacity_aparat_v1'
  };

  // Sanitizador básico para evitar renderizar HTML malicioso
  function sanitizeText(str, maxLength = 120) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/[<>'"&]/g, (c) => {
        switch (c) {
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '&': return '&amp;';
          case '"': return '&quot;';
          case "'": return '&#39;';
          default: return c;
        }
      })
      .trim()
      .slice(0, maxLength);
  }

  function getStorageItem(key, fallback = null) {
    try {
      if (typeof localStorage === 'undefined') return fallback;
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('GlossStorage: error al leer', key, e);
      return fallback;
    }
  }

  function setStorageItem(key, val) {
    try {
      if (typeof localStorage === 'undefined') return false;
      localStorage.setItem(key, JSON.stringify(val));
      return true;
    } catch (e) {
      console.warn('GlossStorage: error al escribir', key, e);
      return false;
    }
  }

  // =========================================================================
  // 1. PERFIL DE NEGOCIO ACTIVO Y MULTINEGOCIO
  // =========================================================================

  function getActiveBusiness() {
    const active = getStorageItem(STORAGE_KEYS.ACTIVE_BUSINESS, null);
    if (active && active.name) {
      return {
        id: active.id || 'biz_default',
        name: sanitizeText(active.name),
        currency: active.currency || 'COP',
        updatedAt: active.updatedAt || new Date().toISOString()
      };
    }
    return {
      id: 'biz_default',
      name: '',
      currency: (typeof root !== 'undefined' && root.GlossCurrency ? root.GlossCurrency.getSelectedCurrency() : 'COP'),
      updatedAt: new Date().toISOString()
    };
  }

  function setActiveBusiness(name, currency = null) {
    const cleanName = sanitizeText(name, 120);
    const curr = currency || (typeof root !== 'undefined' && root.GlossCurrency ? root.GlossCurrency.getSelectedCurrency() : 'COP');
    const existingList = getBusinessList();

    let target = existingList.find(b => b.name.toLowerCase() === cleanName.toLowerCase());
    if (!target) {
      target = {
        id: 'biz_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        name: cleanName,
        currency: curr,
        updatedAt: new Date().toISOString()
      };
      if (cleanName) {
        existingList.push(target);
        setStorageItem(STORAGE_KEYS.BUSINESS_LIST, existingList);
      }
    } else {
      target.currency = curr;
      target.updatedAt = new Date().toISOString();
      setStorageItem(STORAGE_KEYS.BUSINESS_LIST, existingList);
    }

    const activeProfile = {
      id: target.id,
      name: cleanName,
      currency: curr,
      updatedAt: new Date().toISOString()
    };
    setStorageItem(STORAGE_KEYS.ACTIVE_BUSINESS, activeProfile);

    // Disparar evento de sincronización si está en navegador
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gloss-business-change', {
        detail: activeProfile
      }));
    }

    return activeProfile;
  }

  function getBusinessList() {
    const list = getStorageItem(STORAGE_KEYS.BUSINESS_LIST, []);
    if (!Array.isArray(list)) return [];
    return list.map(b => ({
      id: b.id || 'biz_' + Math.random().toString(36).substr(2, 6),
      name: sanitizeText(b.name, 120),
      currency: b.currency || 'COP',
      updatedAt: b.updatedAt || new Date().toISOString()
    })).filter(b => b.name.length > 0);
  }

  // =========================================================================
  // 2. GUARDADO Y GESTIÓN DE ANÁLISIS
  // =========================================================================

  /**
   * Guarda un escenario analítico en localStorage.
   * @param {string} toolKey - 'tratamiento', 'promociones', 'roas', 'breakeven', 'capacidad_basica', 'capacidad_avanzada', 'aparatologia'
   * @param {string} analysisName - Nombre identificativo (ej. "Tratamiento facial — octubre")
   * @param {Object} inputData - Datos de entrada para reproducir el cálculo (no solo resultados)
   * @param {Object} [meta] - Metadatos opcionales (businessName, currency, summaryKPIs)
   */
  function saveAnalysis(toolKey, analysisName, inputData, meta = {}) {
    if (!toolKey || !inputData) {
      throw new Error('GlossStorage: toolKey e inputData son requeridos');
    }

    const cleanName = sanitizeText(analysisName || 'Análisis ' + new Date().toLocaleDateString('es-CO'), 100);
    const activeBiz = getActiveBusiness();
    const bName = sanitizeText(meta.businessName || activeBiz.name || '', 120);
    const cur = meta.currency || activeBiz.currency || 'COP';

    const analyses = getStorageItem(STORAGE_KEYS.ANALYSES, []);
    const record = {
      id: 'an_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5),
      version: 1,
      toolKey: String(toolKey),
      name: cleanName,
      businessName: bName,
      currency: cur,
      inputs: inputData,
      summary: meta.summary || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    analyses.unshift(record);
    // Limitar histórico a 50 análisis para no saturar almacenamiento local
    if (analyses.length > 50) analyses.pop();
    setStorageItem(STORAGE_KEYS.ANALYSES, analyses);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gloss-analysis-saved', { detail: record }));
    }

    return record;
  }

  function getSavedAnalyses(toolKeyFilter = null, businessNameFilter = null) {
    const list = getStorageItem(STORAGE_KEYS.ANALYSES, []);
    if (!Array.isArray(list)) return [];

    return list.filter(item => {
      if (toolKeyFilter && item.toolKey !== toolKeyFilter) return false;
      if (businessNameFilter && item.businessName && item.businessName.toLowerCase() !== businessNameFilter.toLowerCase()) {
        return false;
      }
      return true;
    });
  }

  function loadAnalysis(id) {
    if (!id) return null;
    const list = getStorageItem(STORAGE_KEYS.ANALYSES, []);
    const found = list.find(item => item.id === id);
    if (!found) return null;

    // Validación de integridad
    if (!found.inputs || typeof found.inputs !== 'object') {
      console.warn('GlossStorage: análisis corrupto o sin entradas válidas', id);
      return null;
    }

    return found;
  }

  function deleteAnalysis(id) {
    if (!id) return false;
    let list = getStorageItem(STORAGE_KEYS.ANALYSES, []);
    const initialLen = list.length;
    list = list.filter(item => item.id !== id);
    if (list.length !== initialLen) {
      setStorageItem(STORAGE_KEYS.ANALYSES, list);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('gloss-analysis-deleted', { detail: { id } }));
      }
      return true;
    }
    return false;
  }

  // =========================================================================
  // 3. TRANSFERENCIAS ENTRE HERRAMIENTAS
  // =========================================================================

  // Rentabilidad -> ROAS
  function stageTreatmentToRoas(treatmentData) {
    if (!treatmentData) return false;
    const activeBiz = getActiveBusiness();
    const payload = {
      serviceName: sanitizeText(treatmentData.nombre || treatmentData.name || 'Tratamiento evaluado', 100),
      businessName: sanitizeText(treatmentData.businessName || activeBiz.name, 120),
      price: Math.max(0, Number(treatmentData.precio || treatmentData.price || 0)),
      variableCost: Math.max(0, Number(treatmentData.costoVariableTotal || treatmentData.variableCost || 0)),
      marginPct: Number(treatmentData.margenContribucionPct || treatmentData.marginPct || 0),
      serviceType: treatmentData.isPaquete ? 'paquete' : 'individual',
      packageSessions: treatmentData.numSesionesPaquete || 1,
      currency: activeBiz.currency || 'COP',
      timestamp: new Date().toISOString()
    };
    return setStorageItem(STORAGE_KEYS.TRANSFER_TREATMENT_ROAS, payload);
  }

  function consumeTreatmentToRoas() {
    const data = getStorageItem(STORAGE_KEYS.TRANSFER_TREATMENT_ROAS, null);
    if (data) {
      try { localStorage.removeItem(STORAGE_KEYS.TRANSFER_TREATMENT_ROAS); } catch (e) {}
    }
    return data;
  }

  function peekTreatmentToRoas() {
    return getStorageItem(STORAGE_KEYS.TRANSFER_TREATMENT_ROAS, null);
  }

  // Rentabilidad -> Aparatología
  function stageTreatmentToAparatologia(treatmentData) {
    if (!treatmentData) return false;
    const activeBiz = getActiveBusiness();
    const payload = {
      treatmentName: sanitizeText(treatmentData.nombre || treatmentData.name || 'Tratamiento evaluado', 100),
      businessName: sanitizeText(treatmentData.businessName || activeBiz.name, 120),
      pricePerSession: Math.max(0, Number(treatmentData.precio || treatmentData.price || 0)),
      variableCostPerSession: Math.max(0, Number(treatmentData.costoVariableTotal || treatmentData.variableCost || 0)),
      marginPct: Number(treatmentData.margenContribucionPct || treatmentData.marginPct || 0),
      currency: activeBiz.currency || 'COP',
      timestamp: new Date().toISOString()
    };
    return setStorageItem(STORAGE_KEYS.TRANSFER_TREATMENT_APARAT, payload);
  }

  function consumeTreatmentToAparatologia() {
    const data = getStorageItem(STORAGE_KEYS.TRANSFER_TREATMENT_APARAT, null);
    if (data) {
      try { localStorage.removeItem(STORAGE_KEYS.TRANSFER_TREATMENT_APARAT); } catch (e) {}
    }
    return data;
  }

  function peekTreatmentToAparatologia() {
    return getStorageItem(STORAGE_KEYS.TRANSFER_TREATMENT_APARAT, null);
  }

  // Capacidad -> Aparatología
  function stageCapacityToAparatologia(capacityData) {
    if (!capacityData) return false;
    const activeBiz = getActiveBusiness();
    const payload = {
      equipmentName: sanitizeText(capacityData.equipmentName || 'Aparatología Evaluada', 120),
      sessionsPerMonth: Math.max(0, parseInt(capacityData.sessionsPerMonth || capacityData.monthlyCapacity || 0, 10)),
      sessionPrice: Math.max(0, Number(capacityData.sessionPrice || capacityData.averageRevenue || capacityData.V || 0)),
      hoursPerSession: Math.max(0.1, parseFloat(capacityData.hoursPerSession || 1)),
      businessName: sanitizeText(capacityData.businessName || activeBiz.name, 120),
      professionals: Math.max(1, parseInt(capacityData.professionals || capacityData.P || 1, 10)),
      cabins: Math.max(1, parseInt(capacityData.cabins || capacityData.C || 1, 10)),
      dailyHours: Math.max(1, parseFloat(capacityData.dailyHours || capacityData.H || 8)),
      monthlyDays: Math.max(1, parseInt(capacityData.monthlyDays || capacityData.D || 22, 10)),
      monthlyCapacity: Math.max(0, parseInt(capacityData.monthlyCapacity || 0, 10)),
      availableAppointments: Math.max(0, parseInt(capacityData.availableAppointments || 0, 10)),
      averageRevenue: Math.max(0, Number(capacityData.averageRevenue || capacityData.V || 0)),
      currency: activeBiz.currency || 'COP',
      inputs: capacityData.inputs ? JSON.parse(JSON.stringify(capacityData.inputs)) : null,
      toolKey: capacityData.toolKey || (capacityData.isAdvanced ? 'capacidad_avanzada' : 'capacidad_basica'),
      name: sanitizeText(capacityData.name || 'Capacidad vinculada', 100),
      timestamp: new Date().toISOString()
    };
    return setStorageItem(STORAGE_KEYS.TRANSFER_CAPACITY_APARAT, payload);
  }

  function consumeCapacityToAparatologia() {
    const data = getStorageItem(STORAGE_KEYS.TRANSFER_CAPACITY_APARAT, null);
    if (data) {
      try { localStorage.removeItem(STORAGE_KEYS.TRANSFER_CAPACITY_APARAT); } catch (e) {}
    }
    return data;
  }

  function peekCapacityToAparatologia() {
    return getStorageItem(STORAGE_KEYS.TRANSFER_CAPACITY_APARAT, null);
  }

  // =========================================================================
  // 4. GENERADOR DE UI ACCESIBLE PARA GUARDAR / CARGAR ANÁLISIS
  // =========================================================================

  function renderStorageControlsHtml(toolKey, toolLabel) {
    return `
      <div class="gloss-storage-bar" data-storage-tool="${toolKey}">
        <div class="gloss-storage-bar__inner">
          <div class="gloss-storage-bar__left">
            <span class="gloss-storage-icon" aria-hidden="true">💾</span>
            <span class="gloss-storage-title">Gestión de análisis — ${toolLabel}</span>
          </div>
          <div class="gloss-storage-bar__actions">
            <button type="button" class="btn btn--sm btn--outline gloss-storage-btn-save" data-action="save">
              Guardar análisis
            </button>
            <button type="button" class="btn btn--sm btn--outline gloss-storage-btn-list" data-action="list">
              Mis análisis guardados (<span class="gloss-storage-count">0</span>)
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de Mis Análisis Guardados -->
      <div class="gloss-storage-modal" id="modal-storage-${toolKey}" hidden role="dialog" aria-modal="true" aria-labelledby="modal-title-${toolKey}">
        <div class="gloss-storage-modal__backdrop" data-close-modal="true"></div>
        <div class="gloss-storage-modal__panel">
          <div class="gloss-storage-modal__header">
            <h3 id="modal-title-${toolKey}">Mis análisis guardados — ${toolLabel}</h3>
            <button type="button" class="gloss-storage-modal__close" data-close-modal="true" aria-label="Cerrar modal">×</button>
          </div>
          <div class="gloss-storage-modal__body">
            <p class="gloss-storage-disclaimer">
              Los análisis se conservan localmente en tu navegador. Si limpias los datos del sitio o cambias de explorador, los registros no estarán disponibles.
            </p>
            <div class="gloss-storage-table-wrap">
              <table class="gloss-storage-table">
                <thead>
                  <tr>
                    <th>Nombre del análisis</th>
                    <th>Negocio</th>
                    <th>Moneda</th>
                    <th>Fecha</th>
                    <th style="text-align:right;">Acciones</th>
                  </tr>
                </thead>
                <tbody class="gloss-storage-tbody">
                  <!-- Inyectado dinámicamente -->
                </tbody>
              </table>
            </div>
            <div class="gloss-storage-empty" hidden>
              No tienes análisis guardados para esta herramienta. Realiza un cálculo y pulsa en "Guardar análisis".
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function bindStorageUI(container, toolKey, callbacks = {}) {
    if (!container) return;
    const modal = container.querySelector(`#modal-storage-${toolKey}`);
    const btnSave = container.querySelector('.gloss-storage-btn-save');
    const btnList = container.querySelector('.gloss-storage-btn-list');
    const countBadge = container.querySelector('.gloss-storage-count');
    const tbody = container.querySelector('.gloss-storage-tbody');
    const emptyMsg = container.querySelector('.gloss-storage-empty');

    function updateCount() {
      const list = getSavedAnalyses(toolKey);
      if (countBadge) countBadge.textContent = list.length;
      return list;
    }

    function renderList() {
      const list = updateCount();
      if (!tbody) return;
      tbody.innerHTML = '';

      if (list.length === 0) {
        if (emptyMsg) emptyMsg.removeAttribute('hidden');
        return;
      }
      if (emptyMsg) emptyMsg.setAttribute('hidden', '');

      list.forEach(item => {
        const tr = document.createElement('tr');
        const dateFormatted = new Date(item.updatedAt || item.createdAt).toLocaleDateString('es-CO', {
          day: '2-digit', month: 'short', year: 'numeric'
        });
        tr.innerHTML = `
          <td><strong>${item.name}</strong></td>
          <td>${item.businessName || '—'}</td>
          <td><span class="gloss-currency-badge">${item.currency || 'COP'}</span></td>
          <td style="font-size:12px;color:var(--calc-muted, #786E69);">${dateFormatted}</td>
          <td style="text-align:right;white-space:nowrap;">
            <button type="button" class="btn btn--xs btn--primary gloss-act-load" data-id="${item.id}" style="margin-right:4px;">Cargar</button>
            <button type="button" class="btn btn--xs btn--outline gloss-act-del" data-id="${item.id}" style="color:#991B1B;border-color:#F87171;">Eliminar</button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      tbody.querySelectorAll('.gloss-act-load').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const an = loadAnalysis(id);
          if (an && typeof callbacks.onLoad === 'function') {
            callbacks.onLoad(an);
            closeModal();
          }
        });
      });

      tbody.querySelectorAll('.gloss-act-del').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          if (confirm('¿Deseas eliminar este análisis guardado?')) {
            deleteAnalysis(id);
            renderList();
          }
        });
      });
    }

    function openModal() {
      if (!modal) return;
      renderList();
      modal.removeAttribute('hidden');
    }

    function closeModal() {
      if (!modal) return;
      modal.setAttribute('hidden', '');
    }

    if (btnList) btnList.addEventListener('click', openModal);

    if (btnSave) {
      btnSave.addEventListener('click', () => {
        const defaultName = (typeof callbacks.getDefaultName === 'function')
          ? callbacks.getDefaultName()
          : 'Escenario ' + new Date().toLocaleDateString('es-CO');
        const name = prompt('Nombre identificativo para este análisis:', defaultName);
        if (name && name.trim()) {
          const data = (typeof callbacks.getInputs === 'function') ? callbacks.getInputs() : {};
          const meta = (typeof callbacks.getMeta === 'function') ? callbacks.getMeta() : {};
          saveAnalysis(toolKey, name.trim(), data, meta);
          updateCount();
          alert('¡Análisis guardado exitosamente!');
        }
      });
    }

    container.querySelectorAll('[data-close-modal="true"]').forEach(el => {
      el.addEventListener('click', closeModal);
    });

    updateCount();
  }

  return {
    sanitizeText,
    getActiveBusiness,
    setActiveBusiness,
    getBusinessList,
    saveAnalysis,
    getSavedAnalyses,
    loadAnalysis,
    deleteAnalysis,
    stageTreatmentToRoas,
    consumeTreatmentToRoas,
    peekTreatmentToRoas,
    stageTreatmentToAparatologia,
    consumeTreatmentToAparatologia,
    peekTreatmentToAparatologia,
    stageCapacityToAparatologia,
    consumeCapacityToAparatologia,
    peekCapacityToAparatologia,
    renderStorageControlsHtml,
    bindStorageUI
  };
}));
