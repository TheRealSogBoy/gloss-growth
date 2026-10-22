/**
 * GLOSS & GROWTH — CALCULADORA DE ROAS Y RENTABILIDAD PUBLICITARIA
 * Controlador interactivo de la interfaz, estado reactivo, matriz de escenarios y exportación.
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const engine = window.GlossCalcEngine;
  if (!engine) {
    console.error('GlossCalcEngine no está cargado.');
    return;
  }

  // =========================================================================
  // 1. ESTADO GLOBAL DE LA CALCULADORA
  // =========================================================================
  let currentMode = 'plan'; // 'plan' | 'real'
  let costInputMode = 'amount'; // 'amount' | 'percent'
  let realCostMode = 'amount'; // 'amount' | 'percent'
  let lastPlanResult = null;
  let lastRealResult = null;

  // =========================================================================
  // 2. REFERENCIAS A ELEMENTOS DEL DOM
  // =========================================================================
  const dom = {
    // Modo y pestañas
    btnModePlan: document.getElementById('mode-btn-plan'),
    btnModeReal: document.getElementById('mode-btn-real'),
    panelFormPlan: document.getElementById('panel-form-plan'),
    panelFormReal: document.getElementById('panel-form-real'),

    // Presets
    presetButtons: document.querySelectorAll('[data-preset]'),
    btnReset: document.getElementById('btn-reset-values'),

    // Inputs Planificar
    planBusinessType: document.getElementById('plan-business-type'),
    planServiceType: document.getElementById('plan-service-type'),
    planServiceName: document.getElementById('plan-service-name'),
    planPackageSessions: document.getElementById('plan-package-sessions'),
    planPrice: document.getElementById('plan-price'),
    planVarCostAmount: document.getElementById('plan-var-cost-amount'),
    planVarCostPercent: document.getElementById('plan-var-cost-percent'),
    planDirectMargin: document.getElementById('plan-direct-margin'),
    planAdSpend: document.getElementById('plan-ad-spend'),
    planManagementFee: document.getElementById('plan-management-fee'),
    planOtherCosts: document.getElementById('plan-other-costs'),
    planPeriod: document.getElementById('plan-period'),
    planDesiredResult: document.getElementById('plan-desired-result'),
    planCapacity: document.getElementById('plan-capacity'),

    // Wrappers condicionales Plan
    fieldWrapPackageSessions: document.getElementById('field-wrap-package-sessions'),
    fieldWrapPrice: document.getElementById('field-wrap-price'),
    fieldWrapVarCosts: document.getElementById('field-wrap-var-costs'),
    fieldWrapDirectMargin: document.getElementById('field-wrap-direct-margin'),
    wrapCostAmount: document.getElementById('wrap-cost-amount'),
    wrapCostPercent: document.getElementById('wrap-cost-percent'),
    btnCostAmount: document.getElementById('btn-cost-amount'),
    btnCostPercent: document.getElementById('btn-cost-percent'),

    // Inputs Real
    realAdSpend: document.getElementById('real-ad-spend'),
    realFee: document.getElementById('real-fee'),
    realOther: document.getElementById('real-other'),
    realRevenue: document.getElementById('real-revenue'),
    realVarCost: document.getElementById('real-var-cost'),
    realMarginPct: document.getElementById('real-margin-pct'),
    realTarget: document.getElementById('real-target'),
    realSalesCount: document.getElementById('real-sales-count'),
    realPatientsCount: document.getElementById('real-patients-count'),
    realChatsCount: document.getElementById('real-chats-count'),
    realApptsCount: document.getElementById('real-appts-count'),
    btnRealCostAmount: document.getElementById('btn-real-cost-amount'),
    btnRealCostPercent: document.getElementById('btn-real-cost-percent'),
    wrapRealCostAmount: document.getElementById('wrap-real-cost-amount'),
    wrapRealCostPercent: document.getElementById('wrap-real-cost-percent'),

    // Hero KPI y Resultados
    heroMainBox: document.getElementById('hero-main-box'),
    heroKpiLabel: document.getElementById('hero-kpi-label'),
    heroKpiValue: document.getElementById('hero-kpi-value'),
    heroKpiSubtext: document.getElementById('hero-kpi-subtext'),

    kpiLbl1: document.getElementById('kpi-lbl-1'),
    kpiVal1: document.getElementById('kpi-val-1'),
    kpiDet1: document.getElementById('kpi-det-1'),

    kpiLbl2: document.getElementById('kpi-lbl-2'),
    kpiVal2: document.getElementById('kpi-val-2'),
    kpiDet2: document.getElementById('kpi-det-2'),

    kpiLbl3: document.getElementById('kpi-lbl-3'),
    kpiVal3: document.getElementById('kpi-val-3'),
    kpiDet3: document.getElementById('kpi-det-3'),

    kpiLbl4: document.getElementById('kpi-lbl-4'),
    kpiVal4: document.getElementById('kpi-val-4'),
    kpiDet4: document.getElementById('kpi-det-4'),

    // Diagnóstico
    diagnosisCard: document.getElementById('diagnosis-card'),
    diagHeader: document.getElementById('diag-header'),
    diagTitle: document.getElementById('diag-title'),
    diagFactText: document.getElementById('diag-fact-text'),
    diagMeaningText: document.getElementById('diag-meaning-text'),
    diagRecText: document.getElementById('diag-rec-text'),

    // Matriz de escenarios
    matrixThead: document.getElementById('matrix-thead'),
    matrixTbody: document.getElementById('matrix-tbody'),
    matrixInspector: document.getElementById('matrix-inspector'),
    inspectorTitle: document.getElementById('inspector-title'),
    inspectorDesc: document.getElementById('inspector-desc'),
    btnCloseInspector: document.getElementById('btn-close-inspector'),

    // Costos fijos del negocio completo
    fixRent: document.getElementById('fix-rent'),
    fixPayroll: document.getElementById('fix-payroll'),
    fixUtilities: document.getElementById('fix-utilities'),
    fixSoftware: document.getElementById('fix-software'),
    fixAdmin: document.getElementById('fix-admin'),
    fixOther: document.getElementById('fix-other'),
    fixOtherRev: document.getElementById('fix-other-rev'),
    fixOtherMargin: document.getElementById('fix-other-margin'),
    outOperatingResult: document.getElementById('out-operating-result'),
    outFixedSum: document.getElementById('out-fixed-sum'),

    // Acciones
    btnCopySummary: document.getElementById('btn-copy-summary'),
    btnPrintPdf: document.getElementById('btn-print-pdf')
  };

  // =========================================================================
  // 3. CAMBIO DE MODO (PLANIFICAR VS ANALIZAR REAL)
  // =========================================================================
  function setMode(mode) {
    currentMode = mode;
    if (mode === 'plan') {
      dom.btnModePlan.classList.add('active');
      dom.btnModePlan.setAttribute('aria-selected', 'true');
      dom.btnModeReal.classList.remove('active');
      dom.btnModeReal.setAttribute('aria-selected', 'false');
      dom.panelFormPlan.style.display = 'block';
      dom.panelFormReal.style.display = 'none';
    } else {
      dom.btnModeReal.classList.add('active');
      dom.btnModeReal.setAttribute('aria-selected', 'true');
      dom.btnModePlan.classList.remove('active');
      dom.btnModePlan.setAttribute('aria-selected', 'false');
      dom.panelFormPlan.style.display = 'none';
      dom.panelFormReal.style.display = 'block';
    }
    recalculate();
  }

  dom.btnModePlan.addEventListener('click', () => setMode('plan'));
  dom.btnModeReal.addEventListener('click', () => setMode('real'));

  // =========================================================================
  // 4. MANEJO DE TIPOS DE SERVICIO Y MODALIDADES DE COSTO
  // =========================================================================
  function updateServiceTypeUI() {
    const sType = dom.planServiceType.value;
    if (sType === 'paquete') {
      dom.fieldWrapPackageSessions.style.display = 'block';
      dom.fieldWrapPrice.style.display = 'block';
      dom.fieldWrapVarCosts.style.display = 'block';
      dom.fieldWrapDirectMargin.style.display = 'none';
    } else if (sType === 'agregado') {
      dom.fieldWrapPackageSessions.style.display = 'none';
      dom.fieldWrapPrice.style.display = 'none';
      dom.fieldWrapVarCosts.style.display = 'none';
      dom.fieldWrapDirectMargin.style.display = 'block';
    } else {
      // Individual
      dom.fieldWrapPackageSessions.style.display = 'none';
      dom.fieldWrapPrice.style.display = 'block';
      dom.fieldWrapVarCosts.style.display = 'block';
      dom.fieldWrapDirectMargin.style.display = 'none';
    }
    recalculate();
  }

  dom.planServiceType.addEventListener('change', updateServiceTypeUI);

  // Subtoggle de costo variable en Plan
  dom.btnCostAmount.addEventListener('click', () => {
    costInputMode = 'amount';
    dom.btnCostAmount.classList.add('active');
    dom.btnCostPercent.classList.remove('active');
    dom.wrapCostAmount.style.display = 'block';
    dom.wrapCostPercent.style.display = 'none';
    recalculate();
  });

  dom.btnCostPercent.addEventListener('click', () => {
    costInputMode = 'percent';
    dom.btnCostPercent.classList.add('active');
    dom.btnCostAmount.classList.remove('active');
    dom.wrapCostPercent.style.display = 'block';
    dom.wrapCostAmount.style.display = 'none';
    recalculate();
  });

  // Subtoggle de costo en Real
  dom.btnRealCostAmount.addEventListener('click', () => {
    realCostMode = 'amount';
    dom.btnRealCostAmount.classList.add('active');
    dom.btnRealCostPercent.classList.remove('active');
    dom.wrapRealCostAmount.style.display = 'block';
    dom.wrapRealCostPercent.style.display = 'none';
    recalculate();
  });

  dom.btnRealCostPercent.addEventListener('click', () => {
    realCostMode = 'percent';
    dom.btnRealCostPercent.classList.add('active');
    dom.btnRealCostAmount.classList.remove('active');
    dom.wrapRealCostPercent.style.display = 'block';
    dom.wrapRealCostAmount.style.display = 'none';
    recalculate();
  });

  // =========================================================================
  // 5. CÁLCULO PRINCIPAL Y RENDERIZADO
  // =========================================================================
  function recalculate() {
    if (currentMode === 'plan') {
      calculateAndRenderPlan();
    } else {
      calculateAndRenderReal();
    }
    calculateAndRenderFixedCosts();
  }

  // -------------------------------------------------------------------------
  // MODO PLANIFICAR
  // -------------------------------------------------------------------------
  function calculateAndRenderPlan() {
    const sType = dom.planServiceType.value;
    const params = {
      serviceType: sType,
      serviceName: dom.planServiceName.value,
      packageSessions: dom.planPackageSessions.value,
      price: dom.planPrice.value,
      costInputMode: costInputMode,
      variableCostAmount: dom.planVarCostAmount.value,
      variableCostPercent: dom.planVarCostPercent.value,
      directMarginPercent: dom.planDirectMargin.value,
      adSpend: dom.planAdSpend.value,
      managementFee: dom.planManagementFee.value,
      otherMarketingCosts: dom.planOtherCosts.value,
      desiredResult: dom.planDesiredResult.value,
      period: dom.planPeriod.value,
      capacityAvailable: dom.planCapacity.value
    };

    const res = engine.calculatePlanning(params);
    lastPlanResult = res;

    // 1. Hero KPI Principal: ROAS de equilibrio total
    dom.heroKpiLabel.textContent = res.hasTarget ? 'ROAS objetivo para alcanzar tu meta' : 'ROAS de equilibrio requerido';
    if (res.hasTarget && res.roasTarget !== null) {
      dom.heroKpiValue.textContent = engine.formatDecimal(res.roasTarget) + 'x';
      dom.heroKpiSubtext.textContent = `Genera ${engine.formatCOP(res.revenueTarget)} en ventas (${res.salesTarget} ventas) para cubrir ${engine.formatCOP(res.totalMarketing)} de marketing y dejar ${engine.formatCOP(res.desiredResult)} de ganancia.`;
    } else if (res.roasBreakevenTotal !== null) {
      dom.heroKpiValue.textContent = engine.formatDecimal(res.roasBreakevenTotal) + 'x';
      const salesCountMsg = res.salesBreakeven !== null ? `(${res.salesBreakeven} ventas necesarias)` : '';
      dom.heroKpiSubtext.textContent = `Genera ${engine.formatCOP(res.revenueBreakeven)} en ventas ${salesCountMsg} para cubrir ${engine.formatCOP(res.totalMarketing)} de marketing total con un margen del ${engine.formatPct(res.marginPercent)}.`;
    } else {
      dom.heroKpiValue.textContent = '—';
      dom.heroKpiSubtext.textContent = res.unitMargin < 0 ? 'Margen negativo: no es posible calcular punto de equilibrio.' : 'Ingresa presupuesto y precio para calcular.';
    }

    // 2. Grid de 4 KPIs
    dom.kpiLbl1.textContent = res.hasTarget ? 'Facturación objetivo' : 'Facturación de equilibrio';
    dom.kpiVal1.textContent = res.hasTarget ? engine.formatCOP(res.revenueTarget) : engine.formatCOP(res.revenueBreakeven);
    dom.kpiDet1.textContent = `Inversión total: ${engine.formatCOP(res.totalMarketing)}`;

    dom.kpiLbl2.textContent = res.hasTarget ? 'Ventas objetivo' : 'Ventas necesarias';
    dom.kpiVal2.textContent = res.hasTarget ? (res.salesTarget !== null ? `${res.salesTarget} ventas` : '—') : (res.salesBreakeven !== null ? `${res.salesBreakeven} ventas` : '—');
    dom.kpiDet2.textContent = sType === 'paquete' ? 'Paquetes completos a vender' : (sType === 'agregado' ? 'Cartera agregada' : 'Tratamientos individuales');

    dom.kpiLbl3.textContent = 'ROAS solo pauta';
    dom.kpiVal3.textContent = res.roasBreakevenPauta !== null ? engine.formatDecimal(res.roasBreakevenPauta) + 'x' : '—';
    dom.kpiDet3.textContent = 'Equilibrio sin incluir honorarios';

    dom.kpiLbl4.textContent = 'Margen de contribución';
    dom.kpiVal4.textContent = engine.formatPct(res.marginPercent);
    dom.kpiDet4.textContent = sType === 'agregado' ? 'Promedio ponderado' : `${engine.formatCOP(res.unitMargin)} por venta`;

    // 3. Tarjeta de Diagnóstico
    renderDiagnosis('plan', res);

    // 4. Renderizar Matriz de Escenarios
    renderScenarioMatrix(res.marginRatio, res.price, res.managementFee, res.otherCosts, res.adSpend);
  }

  // -------------------------------------------------------------------------
  // MODO RESULTADOS REALES
  // -------------------------------------------------------------------------
  function calculateAndRenderReal() {
    const params = {
      adSpendReal: dom.realAdSpend.value,
      managementFeeReal: dom.realFee.value,
      otherCostsReal: dom.realOther.value,
      revenueReal: dom.realRevenue.value,
      costMode: realCostMode,
      variableCostsReal: dom.realVarCost.value,
      marginPercentReal: dom.realMarginPct.value,
      targetResult: dom.realTarget.value,
      funnelMetrics: {
        sales: dom.realSalesCount.value,
        uniqueBuyers: dom.realPatientsCount.value,
        newPatients: dom.realPatientsCount.value,
        chats: dom.realChatsCount.value,
        appointments: dom.realApptsCount.value,
        attended: dom.realApptsCount.value
      }
    };

    const res = engine.calculateRealResults(params);
    lastRealResult = res;

    // 1. Hero KPI Principal: Resultado financiero tras marketing
    dom.heroKpiLabel.textContent = 'Resultado después de marketing';
    const sign = res.resultAfterMarketing > 0 ? '+' : '';
    dom.heroKpiValue.textContent = sign + engine.formatCOP(res.resultAfterMarketing);
    dom.heroKpiSubtext.textContent = `ROAS real observado: ${engine.formatDecimal(res.roasReal)}x · ROAS necesario de equilibrio: ${engine.formatDecimal(res.roasBreakeven)}x`;

    // 2. Grid de 4 KPIs
    dom.kpiLbl1.textContent = 'ROAS real observado';
    dom.kpiVal1.textContent = engine.formatDecimal(res.roasReal) + 'x';
    dom.kpiDet1.textContent = `Gasto anuncios: ${engine.formatCOP(res.adSpend)}`;

    dom.kpiLbl2.textContent = 'ROAS de equilibrio';
    dom.kpiVal2.textContent = engine.formatDecimal(res.roasBreakeven) + 'x';
    dom.kpiDet2.textContent = `Brecha: ${res.roasDiff !== null ? (res.roasDiff >= 0 ? '+' : '') + engine.formatDecimal(res.roasDiff) + 'x' : '—'}`;

    dom.kpiLbl3.textContent = 'Margen generado';
    dom.kpiVal3.textContent = engine.formatCOP(res.generatedMargin);
    dom.kpiDet3.textContent = `Margen: ${engine.formatPct(res.marginPercent)}`;

    dom.kpiLbl4.textContent = 'Inversión total marketing';
    dom.kpiVal4.textContent = engine.formatCOP(res.totalMarketing);
    dom.kpiDet4.textContent = `Pauta + Gestión (${engine.formatCOP(res.managementFee)})`;

    // Si completó métricas de embudo, enriquecer subtítulo o detalles
    if (res.funnel && res.funnel.sales > 0 && res.funnel.costPerSaleAd !== null) {
      dom.kpiDet1.textContent = `Costo por venta: ${engine.formatCOP(res.funnel.costPerSaleAd)}`;
    }

    // 3. Diagnóstico
    renderDiagnosis('real', res);

    // 4. Renderizar Matriz con el margen real observado
    renderScenarioMatrix(res.marginRatio, 0, res.managementFee, res.otherCosts, res.adSpend);
  }

  // -------------------------------------------------------------------------
  // RENDERIZADO DEL DIAGNÓSTICO EN 3 PARTES
  // -------------------------------------------------------------------------
  function renderDiagnosis(mode, data) {
    const diag = engine.generateDiagnosis(mode, data);

    dom.diagnosisCard.className = 'calc-diagnosis-card ' + diag.type;
    dom.diagTitle.textContent = diag.title;
    dom.diagFactText.textContent = diag.fact;
    dom.diagMeaningText.textContent = diag.meaning;
    dom.diagRecText.textContent = diag.recommendation;
  }

  // -------------------------------------------------------------------------
  // RENDERIZADO DE LA MATRIZ DE ESCENARIOS
  // -------------------------------------------------------------------------
  function renderScenarioMatrix(marginRatio, price, managementFee, otherCosts, currentAdSpend) {
    if (!dom.matrixThead || !dom.matrixTbody) return;

    // Rango de presupuestos adaptado al valor actual del usuario
    const baseBudget = Math.max(500000, parseNumber(currentAdSpend) || 1200000);
    const budgets = [
      Math.max(300000, Math.round(baseBudget * 0.5 / 100000) * 100000),
      Math.max(500000, Math.round(baseBudget * 0.75 / 100000) * 100000),
      baseBudget,
      Math.round(baseBudget * 1.25 / 100000) * 100000,
      Math.round(baseBudget * 1.5 / 100000) * 100000,
      Math.round(baseBudget * 2.0 / 100000) * 100000
    ];

    const roasLevels = [1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0];

    const matrixData = engine.generateScenarioMatrix({
      marginRatio: marginRatio,
      price: price,
      managementFee: managementFee,
      feeMode: 'fixed',
      otherCosts: otherCosts,
      budgets: budgets,
      roasLevels: roasLevels
    });

    // Encabezado
    let headHtml = '<tr><th class="col-budget">Presupuesto Anuncios</th>';
    roasLevels.forEach(r => {
      headHtml += `<th>ROAS ${engine.formatDecimal(r, 1)}x</th>`;
    });
    headHtml += '</tr>';
    dom.matrixThead.innerHTML = headHtml;

    // Filas
    let bodyHtml = '';
    matrixData.matrix.forEach(row => {
      const isCurrent = Math.abs(row.budget - baseBudget) < 1000;
      bodyHtml += `<tr ${isCurrent ? 'style="background:rgba(140,37,54,0.02);font-weight:bold;"' : ''}>`;
      bodyHtml += `<th class="row-budget">${engine.formatCOP(row.budget)}</th>`;

      row.cells.forEach(cell => {
        const sign = cell.result > 0 ? '+' : '';
        const cls = cell.status === 'loss' ? 'cell-loss' : (cell.status === 'profit' ? 'cell-profit' : 'cell-breakeven');
        bodyHtml += `
          <td class="matrix-cell ${cls}" data-budget="${cell.budget}" data-roas="${cell.roas}" data-rev="${cell.hypRevenue}" data-margin="${cell.generatedMargin}" data-mkt="${cell.totalMarketing}" data-res="${cell.result}">
            ${sign}${engine.formatCOP(cell.result)}
            <span class="cell-revenue-sub">${engine.formatCOP(cell.hypRevenue, false)}</span>
          </td>
        `;
      });

      bodyHtml += '</tr>';
    });
    dom.matrixTbody.innerHTML = bodyHtml;

    // Listeners de celdas
    dom.matrixTbody.querySelectorAll('.matrix-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        const b = parseNumber(cell.dataset.budget);
        const r = parseFloat(cell.dataset.roas);
        const rev = parseNumber(cell.dataset.rev);
        const m = parseNumber(cell.dataset.margin);
        const mkt = parseNumber(cell.dataset.mkt);
        const res = parseNumber(cell.dataset.res);

        dom.inspectorTitle.textContent = `Escenario: Presupuesto ${engine.formatCOP(b)} con ROAS ${engine.formatDecimal(r, 1)}x`;
        const sign = res > 0 ? '+' : '';
        dom.inspectorDesc.innerHTML = `
          Con una inversión de <strong>${engine.formatCOP(b)}</strong> en anuncios y un retorno de <strong>${engine.formatDecimal(r, 1)}x</strong>, facturarías <strong>${engine.formatCOP(rev)}</strong>.<br>
          Aplicando el margen del <strong>${engine.formatPct(marginRatio * 100)}</strong>, generas <strong>${engine.formatCOP(m)}</strong> de contribución directa.<br>
          Tras descontar la inversión total de marketing (<strong>${engine.formatCOP(mkt)}</strong>), el resultado financiero neto es de <strong>${sign}${engine.formatCOP(res)}</strong>.
        `;
        dom.matrixInspector.classList.add('active');
        dom.matrixInspector.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    });
  }

  if (dom.btnCloseInspector) {
    dom.btnCloseInspector.addEventListener('click', () => {
      dom.matrixInspector.classList.remove('active');
    });
  }

  // -------------------------------------------------------------------------
  // CÁLCULO DE COSTOS FIJOS DEL NEGOCIO COMPLETO
  // -------------------------------------------------------------------------
  function calculateAndRenderFixedCosts() {
    const campaignMargin = currentMode === 'plan'
      ? (lastPlanResult ? (lastPlanResult.revenueBreakeven || 0) * (lastPlanResult.marginRatio || 0) : 0)
      : (lastRealResult ? lastRealResult.generatedMargin : 0);

    const campaignMarketing = currentMode === 'plan'
      ? (lastPlanResult ? lastPlanResult.totalMarketing : 0)
      : (lastRealResult ? lastRealResult.totalMarketing : 0);

    const res = engine.calculateBusinessOperatingResult({
      campaignMargin: campaignMargin,
      campaignMarketing: campaignMarketing,
      rent: dom.fixRent.value,
      fixedPayroll: dom.fixPayroll.value,
      utilities: dom.fixUtilities.value,
      software: dom.fixSoftware.value,
      admin: dom.fixAdmin.value,
      otherFixed: dom.fixOther.value,
      otherRevenue: dom.fixOtherRev.value,
      otherMarginPct: dom.fixOtherMargin.value
    });

    if (dom.outFixedSum) {
      dom.outFixedSum.textContent = engine.formatCOP(res.totalFixedCosts);
    }
    if (dom.outOperatingResult) {
      const sign = res.operatingResult > 0 ? '+' : '';
      dom.outOperatingResult.textContent = sign + engine.formatCOP(res.operatingResult);
      dom.outOperatingResult.style.color = res.operatingResult < 0 ? '#991B1B' : (res.operatingResult > 0 ? '#166534' : 'var(--calc-charcoal)');
    }
  }

  // Listeners para los inputs de fijos
  [dom.fixRent, dom.fixPayroll, dom.fixUtilities, dom.fixSoftware, dom.fixAdmin, dom.fixOther, dom.fixOtherRev, dom.fixOtherMargin].forEach(inp => {
    if (inp) inp.addEventListener('input', calculateAndRenderFixedCosts);
  });

  // =========================================================================
  // 6. LISTENERS DE INPUTS EN TIEMPO REAL
  // =========================================================================
  const allInputs = [
    dom.planPrice, dom.planVarCostAmount, dom.planVarCostPercent, dom.planDirectMargin,
    dom.planAdSpend, dom.planManagementFee, dom.planOtherCosts, dom.planDesiredResult,
    dom.planCapacity, dom.planServiceName, dom.planPackageSessions, dom.planPeriod,
    dom.realAdSpend, dom.realFee, dom.realOther, dom.realRevenue, dom.realVarCost,
    dom.realMarginPct, dom.realTarget, dom.realSalesCount, dom.realPatientsCount,
    dom.realChatsCount, dom.realApptsCount
  ];

  allInputs.forEach(input => {
    if (input) {
      input.addEventListener('input', recalculate);
      input.addEventListener('change', recalculate);
    }
  });

  // =========================================================================
  // 7. CARGA DE PRESETS OFICIALES
  // =========================================================================
  dom.presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.dataset.preset;
      const data = engine.PRESETS[presetKey];
      if (!data) return;

      if (presetKey === 'casoA' || presetKey === 'casoB') {
        setMode('plan');
        dom.planServiceType.value = data.serviceType || 'individual';
        dom.planServiceName.value = data.serviceName || '';
        dom.planPrice.value = data.price;
        costInputMode = data.costInputMode || 'amount';
        dom.btnCostAmount.classList.toggle('active', costInputMode === 'amount');
        dom.btnCostPercent.classList.toggle('active', costInputMode === 'percent');
        dom.wrapCostAmount.style.display = costInputMode === 'amount' ? 'block' : 'none';
        dom.wrapCostPercent.style.display = costInputMode === 'percent' ? 'block' : 'none';
        dom.planVarCostAmount.value = data.variableCostAmount;
        dom.planVarCostPercent.value = data.variableCostPercent;
        dom.planAdSpend.value = data.adSpend;
        dom.planManagementFee.value = data.managementFee;
        dom.planOtherCosts.value = data.otherMarketingCosts;
        dom.planDesiredResult.value = data.desiredResult;
        dom.planCapacity.value = data.capacityAvailable || '';
        updateServiceTypeUI();
      } else if (presetKey === 'casoD' || presetKey === 'casoE') {
        setMode('real');
        dom.realAdSpend.value = data.adSpendReal;
        dom.realFee.value = data.managementFeeReal;
        dom.realOther.value = data.otherCostsReal;
        dom.realRevenue.value = data.revenueReal;
        realCostMode = data.costMode || 'amount';
        dom.btnRealCostAmount.classList.toggle('active', realCostMode === 'amount');
        dom.btnRealCostPercent.classList.toggle('active', realCostMode === 'percent');
        dom.wrapRealCostAmount.style.display = realCostMode === 'amount' ? 'block' : 'none';
        dom.wrapRealCostPercent.style.display = realCostMode === 'percent' ? 'block' : 'none';
        dom.realVarCost.value = data.variableCostsReal;
        dom.realMarginPct.value = data.marginPercentReal;
        dom.realTarget.value = data.targetResult || 0;
      }
      recalculate();
    });
  });

  if (dom.btnReset) {
    dom.btnReset.addEventListener('click', () => {
      // Restablecer Caso A por defecto
      const data = engine.PRESETS.casoA;
      setMode('plan');
      dom.planServiceType.value = 'individual';
      dom.planServiceName.value = data.serviceName;
      dom.planPrice.value = data.price;
      costInputMode = 'amount';
      dom.btnCostAmount.classList.add('active');
      dom.btnCostPercent.classList.remove('active');
      dom.wrapCostAmount.style.display = 'block';
      dom.wrapCostPercent.style.display = 'none';
      dom.planVarCostAmount.value = data.variableCostAmount;
      dom.planAdSpend.value = data.adSpend;
      dom.planManagementFee.value = data.managementFee;
      dom.planOtherCosts.value = 0;
      dom.planDesiredResult.value = 0;
      dom.planCapacity.value = '';
      updateServiceTypeUI();
      recalculate();
    });
  }

  // =========================================================================
  // 8. SOPORTE DE PARÁMETROS URL Y LOCALSTORAGE (IMPORTACIÓN)
  // =========================================================================
  function loadImportedProfile() {
    const urlParams = new URLSearchParams(window.location.search);
    const urlPrice = urlParams.get('precio');
    const urlCost = urlParams.get('costo');
    const urlName = urlParams.get('nombre');

    if (urlPrice !== null && urlCost !== null) {
      dom.planPrice.value = parseNumber(urlPrice);
      dom.planVarCostAmount.value = parseNumber(urlCost);
      costInputMode = 'amount';
      dom.btnCostAmount.classList.add('active');
      dom.btnCostPercent.classList.remove('active');
      dom.wrapCostAmount.style.display = 'block';
      dom.wrapCostPercent.style.display = 'none';
      if (urlName) dom.planServiceName.value = decodeURIComponent(urlName);
      setMode('plan');
      return;
    }

    try {
      const stored = localStorage.getItem('gloss_treatment_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.price) {
          dom.planPrice.value = parsed.price;
          // Variable cost PURO (sin fijos)
          dom.planVarCostAmount.value = parsed.variableCost || 0;
          if (parsed.name) dom.planServiceName.value = parsed.name;
          if (parsed.serviceType === 'paquete') {
            dom.planServiceType.value = 'paquete';
            if (parsed.packageSessions) dom.planPackageSessions.value = parsed.packageSessions;
          }
          updateServiceTypeUI();
        }
      }
    } catch (e) {}
  }

  // =========================================================================
  // 9. ACCIONES: COPIAR RESUMEN E IMPRIMIR
  // =========================================================================
  if (dom.btnCopySummary) {
    dom.btnCopySummary.addEventListener('click', () => {
      let text = '';
      if (currentMode === 'plan' && lastPlanResult) {
        const p = lastPlanResult;
        text = `GLOSS & GROWTH — ANÁLISIS DE PLANIFICACIÓN PUBLICITARIA\n` +
          `Servicio: ${p.serviceName} (${p.serviceType})\n` +
          `Precio de venta: ${engine.formatCOP(p.price)}\n` +
          `Margen de contribución: ${engine.formatPct(p.marginPercent)} (${engine.formatCOP(p.unitMargin)}/venta)\n` +
          `Inversión marketing: Anuncios ${engine.formatCOP(p.adSpend)} + Gestión ${engine.formatCOP(p.managementFee)} = Total ${engine.formatCOP(p.totalMarketing)}\n` +
          `----------------------------------------\n` +
          `ROAS de equilibrio requerido: ${engine.formatDecimal(p.roasBreakevenTotal)}x\n` +
          `ROAS solo pauta: ${engine.formatDecimal(p.roasBreakevenPauta)}x\n` +
          `Facturación de equilibrio: ${engine.formatCOP(p.revenueBreakeven)}\n` +
          `Ventas necesarias: ${p.salesBreakeven !== null ? p.salesBreakeven + ' ventas' : '—'}\n` +
          (p.hasTarget ? `Meta deseada: ${engine.formatCOP(p.desiredResult)} -> Facturación obj: ${engine.formatCOP(p.revenueTarget)} (ROAS ${engine.formatDecimal(p.roasTarget)}x)\n` : '') +
          `Generado en: https://glossgrowthhq.com/recursos/calculadora-publicidad/`;
      } else if (currentMode === 'real' && lastRealResult) {
        const r = lastRealResult;
        text = `GLOSS & GROWTH — EVALUACIÓN DE CAMPAÑA REAL\n` +
          `Gasto anuncios: ${engine.formatCOP(r.adSpend)} | Gestión: ${engine.formatCOP(r.managementFee)} | Total: ${engine.formatCOP(r.totalMarketing)}\n` +
          `Ingresos atribuidos: ${engine.formatCOP(r.revenue)}\n` +
          `Costos variables: ${engine.formatCOP(r.variableCosts)} | Margen generado: ${engine.formatCOP(r.generatedMargin)} (${engine.formatPct(r.marginPercent)})\n` +
          `----------------------------------------\n` +
          `ROAS real observado: ${engine.formatDecimal(r.roasReal)}x\n` +
          `ROAS de equilibrio necesario: ${engine.formatDecimal(r.roasBreakeven)}x\n` +
          `Resultado financiero tras marketing: ${r.resultAfterMarketing >= 0 ? '+' : ''}${engine.formatCOP(r.resultAfterMarketing)}\n` +
          `Generado en: https://glossgrowthhq.com/recursos/calculadora-publicidad/`;
      }

      navigator.clipboard.writeText(text).then(() => {
        const orig = dom.btnCopySummary.textContent;
        dom.btnCopySummary.textContent = '¡Copiado al portapapeles!';
        setTimeout(() => dom.btnCopySummary.textContent = orig, 2000);
      }).catch(() => {
        alert('No se pudo copiar automáticamente. Por favor copia manualmente.');
      });
    });
  }

  if (dom.btnPrintPdf) {
    dom.btnPrintPdf.addEventListener('click', () => {
      window.print();
    });
  }

  // =========================================================================
  // 10. INICIALIZACIÓN
  // =========================================================================
  loadImportedProfile();
  updateServiceTypeUI();
  recalculate();

  function parseNumber(val) {
    return engine.parseNumber(val);
  }
});
