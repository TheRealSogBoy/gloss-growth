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
  const Engine = engine;

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
    btnModeBreakeven: document.getElementById('mode-btn-breakeven'),
    panelFormBreakeven: document.getElementById('panel-form-breakeven'),
    panelResultsBreakeven: document.getElementById('panel-results-breakeven'),
    panelFormPlan: document.getElementById('panel-form-plan'),
    panelFormReal: document.getElementById('panel-form-real'),

    // Presets
    presetButtons: document.querySelectorAll('[data-preset]'),
    btnReset: document.getElementById('btn-reset-values'),

    // Inputs Planificar
    planBusinessName: document.getElementById('plan-business-name'),
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
    const isPlan = mode === 'plan';
    const isReal = mode === 'real';
    const isBreakeven = mode === 'breakeven';

    if (dom.btnModePlan) {
      dom.btnModePlan.classList.toggle('active', isPlan);
      dom.btnModePlan.setAttribute('aria-selected', isPlan ? 'true' : 'false');
    }
    if (dom.btnModeReal) {
      dom.btnModeReal.classList.toggle('active', isReal);
      dom.btnModeReal.setAttribute('aria-selected', isReal ? 'true' : 'false');
    }
    if (dom.btnModeBreakeven) {
      dom.btnModeBreakeven.classList.toggle('active', isBreakeven);
      dom.btnModeBreakeven.setAttribute('aria-selected', isBreakeven ? 'true' : 'false');
    }

    if (dom.panelFormPlan) dom.panelFormPlan.style.display = isPlan ? 'block' : 'none';
    if (dom.panelFormReal) dom.panelFormReal.style.display = isReal ? 'block' : 'none';
    if (dom.panelFormBreakeven) dom.panelFormBreakeven.style.display = isBreakeven ? 'block' : 'none';

    if (dom.panelResultsPlan) dom.panelResultsPlan.style.display = (isPlan || isReal) ? 'block' : 'none';
    if (dom.panelResultsBreakeven) dom.panelResultsBreakeven.style.display = isBreakeven ? 'block' : 'none';

    recalculate();
  }

  if (dom.btnModePlan) dom.btnModePlan.addEventListener('click', () => setMode('plan'));
  if (dom.btnModeReal) dom.btnModeReal.addEventListener('click', () => setMode('real'));
  if (dom.btnModeBreakeven) dom.btnModeBreakeven.addEventListener('click', () => setMode('breakeven'));

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
      calculateAndRenderFixedCosts();
    } else if (currentMode === 'real') {
      calculateAndRenderReal();
      calculateAndRenderFixedCosts();
    } else if (currentMode === 'breakeven') {
      calculateAndRenderBreakeven();
    }
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
    const urlBusName = urlParams.get('negocio');

    if (urlBusName && dom.planBusinessName) dom.planBusinessName.value = decodeURIComponent(urlBusName);

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
          if (parsed.businessName && dom.planBusinessName) dom.planBusinessName.value = parsed.businessName;
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
  // 9. ACCIONES: COPIAR RESULTADOS Y DESCARGA DIRECTA DE PDF
  // =========================================================================
  function buildRoasReportPayload() {
    const bName = dom.planBusinessName ? dom.planBusinessName.value.trim() : '';
    if (currentMode === 'plan' && lastPlanResult) {
      const p = lastPlanResult;
      return {
        businessName: bName,
        roas: {
          isRealMode: false,
          periodo: dom.planPeriod ? dom.planPeriod.options[dom.planPeriod.selectedIndex].text : 'Mensual',
          adSpend: p.adSpend,
          managementFee: p.managementFee,
          otherCosts: p.otherCosts,
          inversionTotalMarketing: p.totalMarketing,
          ticketPrice: p.price,
          unitVarCost: p.unitCost,
          margenContribucionPct: p.marginPercent,
          roasEquilibrio: p.roasBreakevenTotal,
          facturacionEquilibrio: p.revenueBreakeven,
          ventasEquilibrio: p.salesBreakeven,
          roasObjetivo: p.hasTarget ? p.roasTarget : null,
          facturacionObjetivo: p.hasTarget ? p.revenueTarget : null,
          ventasObjetivo: p.hasTarget ? p.salesTarget : null,
          desiredResult: p.desiredResult,
          capacity: p.capacity,
          interpretation: p.interpretation,
          matrixSummary: p.matrixSummary || null
        }
      };
    } else if (currentMode === 'real' && lastRealResult) {
      const r = lastRealResult;
      return {
        businessName: bName,
        roas: {
          isRealMode: true,
          periodo: dom.realPeriod ? dom.realPeriod.options[dom.realPeriod.selectedIndex].text : 'Período evaluado',
          adSpend: r.adSpend,
          managementFee: r.managementFee,
          otherCosts: r.otherCosts,
          inversionTotalMarketing: r.totalMarketing,
          ticketPrice: r.revenue,
          unitVarCost: r.variableCosts,
          margenContribucionPct: r.marginPercent,
          roasEquilibrio: r.roasBreakeven,
          facturacionEquilibrio: r.revenueBreakeven,
          ventasEquilibrio: r.salesBreakeven || 0,
          interpretation: r.interpretation
        }
      };
    }
    return null;
  }

  if (dom.btnCopySummary) {
    dom.btnCopySummary.addEventListener('click', () => {
      let payload = buildRoasReportPayload();
      if (!payload) {
        recalculate();
        payload = buildRoasReportPayload();
      }
      if (window.GlossReportEngine && payload) {
        const text = window.GlossReportEngine.generateRoasClipboard(payload);
        window.GlossReportEngine.copyToClipboard(text, () => {
          const orig = dom.btnCopySummary.textContent;
          dom.btnCopySummary.textContent = '¡Resultados copiados al portapapeles!';
          setTimeout(() => dom.btnCopySummary.textContent = orig, 2200);
        });
      }
    });
  }

  if (dom.btnPrintPdf) {
    dom.btnPrintPdf.addEventListener('click', () => {
      let payload = buildRoasReportPayload();
      if (!payload) {
        recalculate();
        payload = buildRoasReportPayload();
      }
      if (window.GlossReportEngine && window.GlossReportEngine.generateRoasPdf && payload) {
        window.GlossReportEngine.generateRoasPdf(payload);
      } else {
        window.print();
      }
    });
  }

  // =========================================================================
  // 10. INICIALIZACIÓN
  // =========================================================================
  loadImportedProfile();
  updateServiceTypeUI();
  recalculate();

  // =========================================================================
  // MODULO INTEGRADO: PUNTO DE EQUILIBRIO DEL NEGOCIO
  // =========================================================================

  let beMarginMode = 'simple'; // 'simple' | 'mix'
  let lastBreakevenResult = null;

  // Lista inicial de mezcla de tratamientos (Caso J por defecto)
  let mixTreatments = [
    { name: 'Tratamiento A (ej. Limpieza)', price: 100000, variableCost: 40000, quantity: 10, sharePct: 33.33 },
    { name: 'Tratamiento B (ej. Bioestimulador)', price: 200000, variableCost: 100000, quantity: 10, sharePct: 66.67 }
  ];

  // Alternador de modo de margen (Simple vs Mezcla)
  const beMarginModeBtns = document.querySelectorAll('[data-be-margin-mode]');
  beMarginModeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      beMarginModeBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      beMarginMode = btn.dataset.beMarginMode;

      const simplePanel = document.getElementById('be-margin-simple-panel');
      const mixPanel = document.getElementById('be-margin-mix-panel');
      if (simplePanel) simplePanel.style.display = beMarginMode === 'simple' ? 'block' : 'none';
      if (mixPanel) mixPanel.style.display = beMarginMode === 'mix' ? 'block' : 'none';

      recalculate();
    });
  });

  // Render dinámico de mezcla de tratamientos
  function renderMixTreatments() {
    const container = document.getElementById('be-mix-items-list');
    if (!container) return;
    container.innerHTML = '';

    const shareType = document.getElementById('be-mix-share-type')?.value || 'appointments';

    mixTreatments.forEach((t, idx) => {
      const row = document.createElement('div');
      row.className = 'mix-item-row';
      row.style.cssText = 'display:grid;grid-template-columns:2fr 1fr 1fr 80px 32px;gap:8px;align-items:center;background:rgba(0,0,0,0.02);padding:8px 10px;border-radius:6px;border:1px solid rgba(0,0,0,0.06);margin-bottom:8px;';
      row.innerHTML = `
        <div>
          <input class="calc-control mix-name" type="text" value="${t.name}" placeholder="Servicio ${idx + 1}" style="padding:6px 8px;font-size:12px;">
        </div>
        <div>
          <input class="calc-control mix-price" type="number" min="0" step="1000" value="${t.price}" placeholder="PVP" title="Precio medio" style="padding:6px 8px;font-size:12px;">
        </div>
        <div>
          <input class="calc-control mix-cost" type="number" min="0" step="1000" value="${t.variableCost}" placeholder="Costo" title="Costo variable unitario" style="padding:6px 8px;font-size:12px;">
        </div>
        <div>
          <input class="calc-control mix-share" type="number" min="1" step="1" value="${shareType === 'appointments' ? (t.quantity || 10) : (t.sharePct || 50)}" placeholder="${shareType === 'appointments' ? 'Citas' : '%'}" title="${shareType === 'appointments' ? 'Cantidad de citas' : '% de ventas'}" style="padding:6px 6px;font-size:12px;text-align:center;">
        </div>
        <div>
          ${mixTreatments.length > 2 ? `<button type="button" class="btn-remove-mix-item" data-idx="${idx}" style="background:none;border:none;color:#991B1B;cursor:pointer;font-weight:bold;font-size:16px;">×</button>` : ''}
        </div>
      `;
      container.appendChild(row);
    });

    // Wire events
    container.querySelectorAll('.mix-name').forEach((inp, idx) => {
      inp.addEventListener('input', (e) => mixTreatments[idx].name = e.target.value);
    });
    container.querySelectorAll('.mix-price').forEach((inp, idx) => {
      inp.addEventListener('input', (e) => {
        mixTreatments[idx].price = parseNum(e.target.value);
        recalculate();
      });
    });
    container.querySelectorAll('.mix-cost').forEach((inp, idx) => {
      inp.addEventListener('input', (e) => {
        mixTreatments[idx].variableCost = parseNum(e.target.value);
        recalculate();
      });
    });
    container.querySelectorAll('.mix-share').forEach((inp, idx) => {
      inp.addEventListener('input', (e) => {
        if (shareType === 'appointments') {
          mixTreatments[idx].quantity = Math.max(1, parseInt(e.target.value, 10) || 1);
        } else {
          mixTreatments[idx].sharePct = Math.max(0, parseFloat(e.target.value) || 0);
        }
        recalculate();
      });
    });
    container.querySelectorAll('.btn-remove-mix-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.idx, 10);
        if (mixTreatments.length > 2) {
          mixTreatments.splice(i, 1);
          renderMixTreatments();
          recalculate();
        }
      });
    });
  }

  const btnAddMixItem = document.getElementById('btn-add-mix-item');
  if (btnAddMixItem) {
    btnAddMixItem.addEventListener('click', () => {
      if (mixTreatments.length < 6) {
        mixTreatments.push({
          name: 'Servicio adicional ' + (mixTreatments.length + 1),
          price: 150000,
          variableCost: 60000,
          quantity: 10,
          sharePct: 20
        });
        renderMixTreatments();
        recalculate();
      } else {
        alert('Se permite añadir hasta 6 tratamientos en la mezcla inicial.');
      }
    });
  }

  const mixShareTypeEl = document.getElementById('be-mix-share-type');
  if (mixShareTypeEl) {
    mixShareTypeEl.addEventListener('change', () => {
      renderMixTreatments();
      recalculate();
    });
  }

  // Importar datos de la calculadora de tratamientos hacia la mezcla
  const btnImportTreatmentMix = document.getElementById('btn-import-treatment-mix');
  if (btnImportTreatmentMix) {
    btnImportTreatmentMix.addEventListener('click', () => {
      try {
        const raw = localStorage.getItem('gloss_treatment_profile');
        if (raw) {
          const profile = JSON.parse(raw);
          if (profile && profile.price > 0 && mixTreatments.length > 0) {
            mixTreatments[0].name = profile.name || 'Tratamiento Importado';
            mixTreatments[0].price = profile.price;
            mixTreatments[0].variableCost = profile.variableCost;
            renderMixTreatments();
            recalculate();
            alert('Tratamiento importado exitosamente como ítem 1 de la mezcla.');
            return;
          }
        }
      } catch (e) {}
      alert('Primero analiza un tratamiento en la Calculadora de Tratamientos para poder importarlo.');
    });
  }

  function calculateAndRenderBreakeven() {
    const parse = (id, def = 0) => {
      const el = document.getElementById(id);
      return el ? parseNum(el.value) : def;
    };

    // Gastos fijos
    const rent = Math.max(0, parse('be-rent', 2000000));
    const payroll = Math.max(0, parse('be-payroll', 3000000));
    const utilities = Math.max(0, parse('be-utilities', 500000));
    const admin = Math.max(0, parse('be-admin', 500000));
    const software = Math.max(0, parse('be-software', 0));
    const accounting = Math.max(0, parse('be-accounting', 0));
    const insurance = Math.max(0, parse('be-insurance', 0));
    const maintenance = Math.max(0, parse('be-maintenance', 0));
    const otherFixed = Math.max(0, parse('be-other-fixed', 1000000));

    const totalFixedCosts = rent + payroll + utilities + admin + software + accounting + insurance + maintenance + otherFixed;

    // Costos de marketing
    const adSpend = Math.max(0, parse('be-ad-spend', 1200000));
    const agencyFee = Math.max(0, parse('be-agency-fee', 800000));
    const agencyIncluded = document.getElementById('be-agency-included')?.checked || false;
    const otherMarketing = Math.max(0, parse('be-other-marketing', 0));

    const effectiveAgency = agencyIncluded ? 0 : agencyFee;
    const marketingCosts = adSpend + effectiveAgency + otherMarketing;
    const totalCostsToCover = totalFixedCosts + marketingCosts;

    // Badges en formulario
    const badgeFixed = document.getElementById('be-total-fixed-badge');
    const badgeMkt = document.getElementById('be-total-marketing-badge');
    const badgeTotal = document.getElementById('be-total-costs-badge');

    if (badgeFixed) badgeFixed.textContent = fmtCOP(totalFixedCosts);
    if (badgeMkt) badgeMkt.textContent = fmtCOP(marketingCosts);
    if (badgeTotal) badgeTotal.textContent = fmtCOP(totalCostsToCover);

    // Margen
    let marginPct = 60;
    if (beMarginMode === 'simple') {
      marginPct = Math.max(0, Math.min(100, parse('be-global-margin-pct', 60)));
    } else {
      const shareType = document.getElementById('be-mix-share-type')?.value || 'appointments';
      const mixRes = Engine.calculateTreatmentMix(mixTreatments, shareType);
      marginPct = mixRes.weightedMarginPct;
      const mixBadge = document.getElementById('be-mix-weighted-badge');
      if (mixBadge) mixBadge.textContent = fmtPct(marginPct);
    }

    // Facturación y metas
    const currentRevenue = Math.max(0, parse('be-current-revenue', 12000000));
    const targetProfit = Math.max(0, parse('be-target-profit', 3000000));
    const averageTicket = Math.max(0, parse('be-average-ticket', 150000));

    const fixedBreakdown = {
      rent,
      payroll,
      utilities,
      admin,
      software,
      accounting,
      insurance,
      maintenance,
      other: otherFixed
    };

    const bRes = Engine.calculateBusinessBreakeven({
      fixedCosts: totalFixedCosts,
      adSpend,
      agencyFee,
      agencyIncludedInFixed: agencyIncluded,
      otherMarketing,
      marginPct,
      currentRevenue,
      targetResult: targetProfit,
      averageTicket,
      fixedBreakdown
    });

    const scenarios = Engine.calculateBusinessScenarios(bRes.breakevenRevenue, marginPct, totalCostsToCover, currentRevenue);
    bRes.scenarios = scenarios;

    // Render KPIs en columna derecha
    const elBreakevenRev = document.getElementById('be-out-breakeven-revenue');
    const elTotalCosts = document.getElementById('be-out-total-costs');
    const elOperatingRes = document.getElementById('be-out-operating-result');
    const elTargetRev = document.getElementById('be-out-target-revenue');
    const elAppointments = document.getElementById('be-out-appointments');

    if (elBreakevenRev) elBreakevenRev.textContent = bRes.isValid ? fmtCOP(bRes.breakevenRevenue) : '—';
    if (elTotalCosts) elTotalCosts.textContent = fmtCOP(bRes.totalCostsToCover);
    if (elOperatingRes) {
      if (bRes.isValid) {
        elOperatingRes.textContent = fmtCOP(bRes.estimatedResult);
        elOperatingRes.style.color = bRes.estimatedResult < 0 ? '#991B1B' : '#065F46';
      } else {
        elOperatingRes.textContent = '—';
      }
    }
    if (elTargetRev) elTargetRev.textContent = bRes.isValid && targetProfit > 0 ? fmtCOP(bRes.targetRevenue) : '—';
    if (elAppointments) {
      if (bRes.isValid && bRes.appointmentsBreakeven) {
        elAppointments.textContent = formatInteger(bRes.appointmentsBreakeven) + ' citas';
      } else {
        elAppointments.textContent = '— (indica ticket)';
      }
    }

    // Render Tabla de Escenarios
    const tableBody = document.getElementById('be-scenarios-table-body');
    if (tableBody && bRes.isValid) {
      tableBody.innerHTML = '';
      scenarios.forEach(sc => {
        const tr = document.createElement('tr');
        const isB = sc.isBreakeven;
        const isCur = sc.isCurrent;
        tr.style.cssText = `border-bottom:1px solid rgba(0,0,0,0.06);${isB ? 'background:rgba(140,37,54,0.06);font-weight:bold;' : (isCur ? 'background:rgba(0,0,0,0.03);font-style:italic;' : '')}`;
        tr.innerHTML = `
          <td style="padding:7px 10px;">${sc.label}${isB ? ' ★' : ''}</td>
          <td style="padding:7px 10px;text-align:right;">${fmtCOP(sc.revenue)}</td>
          <td style="padding:7px 10px;text-align:right;">${fmtCOP(sc.variableCost)}</td>
          <td style="padding:7px 10px;text-align:right;">${fmtCOP(sc.contribution)}</td>
          <td style="padding:7px 10px;text-align:right;${sc.operatingResult < 0 ? 'color:#991B1B;' : 'color:#065F46;'}">${fmtCOP(sc.operatingResult)}</td>
        `;
        tableBody.appendChild(tr);
      });
    }

    // Diagnóstico
    const diag = Engine.generateDiagnosis('breakeven', bRes);
    const diagEl = document.getElementById('be-out-diagnostic');
    if (diagEl) {
      diagEl.innerHTML = `
        <div style="font-size:13px;line-height:1.5;">
          <strong>Hecho matemático:</strong> ${diag.fact}<br>
          <strong>Qué significa para el negocio:</strong> ${diag.meaning}<br>
          <strong>Revisión prudente:</strong> ${diag.recommendation}
        </div>
      `;
    }

    // Guardar para exportación
    bRes.hecho = diag.fact;
    bRes.significado = diag.meaning;
    bRes.recomendacion = diag.recommendation;
    bRes.interpretacion = `${diag.fact} ${diag.meaning} ${diag.recommendation}`;
    lastBreakevenResult = bRes;
  }

  // Event Listeners para inputs de Punto de Equilibrio
  const beInputIds = [
    'be-rent',
    'be-payroll',
    'be-utilities',
    'be-admin',
    'be-software',
    'be-accounting',
    'be-insurance',
    'be-maintenance',
    'be-other-fixed',
    'be-ad-spend',
    'be-agency-fee',
    'be-agency-included',
    'be-other-marketing',
    'be-global-margin-pct',
    'be-current-revenue',
    'be-target-profit',
    'be-average-ticket'
  ];

  beInputIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', recalculate);
      el.addEventListener('change', recalculate);
    }
  });

  // Exportar Punto de Equilibrio del Negocio (Copiar y PDF)
  const btnCopyBreakeven = document.getElementById('be-btn-copy');
  const btnPdfBreakeven = document.getElementById('be-btn-pdf');

  if (btnCopyBreakeven) {
    btnCopyBreakeven.addEventListener('click', () => {
      if (!lastBreakevenResult) calculateAndRenderBreakeven();
      const bName = (document.getElementById('be-business-name')?.value || '').trim();
      if (window.GlossReportEngine && lastBreakevenResult) {
        const text = window.GlossReportEngine.generateBusinessBreakevenClipboard({
          businessName: bName,
          breakeven: lastBreakevenResult
        });
        window.GlossReportEngine.copyToClipboard(text, () => {
          const orig = btnCopyBreakeven.textContent;
          btnCopyBreakeven.textContent = '¡Resultados copiados!';
          setTimeout(() => btnCopyBreakeven.textContent = orig, 2200);
        });
      }
    });
  }

  if (btnPdfBreakeven) {
    btnPdfBreakeven.addEventListener('click', () => {
      if (!lastBreakevenResult) calculateAndRenderBreakeven();
      const bName = (document.getElementById('be-business-name')?.value || '').trim();
      if (window.GlossReportEngine && lastBreakevenResult) {
        window.GlossReportEngine.generateBusinessBreakevenPdf({
          businessName: bName,
          breakeven: lastBreakevenResult
        });
      }
    });
  }

  // Cargar preset casoBreakevenG
  document.querySelectorAll('[data-preset="casoBreakevenG"]').forEach(btn => {
    btn.addEventListener('click', () => {
      setMode('breakeven');
      const p = Engine.PRESETS.casoBreakevenG;
      if (!p) return;

      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
      };

      setVal('be-business-name', p.businessName);
      setVal('be-rent', p.rent);
      setVal('be-payroll', p.fixedPayroll);
      setVal('be-utilities', p.utilities);
      setVal('be-admin', p.admin);
      setVal('be-software', p.software);
      setVal('be-other-fixed', p.otherFixed);
      setVal('be-ad-spend', p.adSpend);
      setVal('be-agency-fee', p.agencyFee);
      const incEl = document.getElementById('be-agency-included');
      if (incEl) incEl.checked = p.agencyIncludedInFixed;
      setVal('be-other-marketing', p.otherMarketing);
      setVal('be-global-margin-pct', p.marginPct);
      setVal('be-current-revenue', p.currentRevenue);
      setVal('be-target-profit', p.targetResult);
      setVal('be-average-ticket', p.averageTicket);

      recalculate();
    });
  });

  renderMixTreatments();

  // INICIALIZACIÓN DE MONEDA Y ALMACENAMIENTO COMPARTIDO
  const roasCurrContainer = document.getElementById('roas-currency-picker-container');
  if (window.GlossCurrency && roasCurrContainer) {
    window.GlossCurrency.initPicker(roasCurrContainer, {
      id: 'roas-currency-select',
      onChange: () => {
        recalculate();
      }
    });
  }

  const roasStorageContainer = document.getElementById('roas-storage-container');
  if (window.GlossStorage && roasStorageContainer) {
    roasStorageContainer.innerHTML = window.GlossStorage.renderStorageControlsHtml('roas_publicidad', 'ROAS y Rentabilidad Publicitaria');
    window.GlossStorage.bindStorageUI(roasStorageContainer, 'roas_publicidad', {
      getDefaultName: () => (dom.planServiceName?.value || 'Campaña') + ' — ' + new Date().toLocaleDateString('es-CO', { month: 'short', year: 'numeric' }),
      getInputs: () => ({
        businessName: dom.planBusinessName?.value || '',
        serviceName: dom.planServiceName?.value || '',
        serviceType: dom.planServiceType?.value || 'individual',
        price: dom.planPrice?.value || '',
        varCost: dom.planVarCostAmount?.value || '',
        adSpend: dom.planAdSpend?.value || '',
        agencyFee: dom.planAgencyFee?.value || '',
        targetProfit: dom.planTargetProfit?.value || ''
      }),
      getMeta: () => ({
        businessName: dom.planBusinessName?.value || '',
        currency: window.GlossCurrency ? window.GlossCurrency.getSelectedCurrency() : 'COP'
      }),
      onLoad: (analysis) => {
        if (analysis && analysis.inputs) {
          const inp = analysis.inputs;
          if (dom.planBusinessName && inp.businessName !== undefined) dom.planBusinessName.value = inp.businessName;
          if (dom.planServiceName && inp.serviceName !== undefined) dom.planServiceName.value = inp.serviceName;
          if (dom.planServiceType && inp.serviceType !== undefined) dom.planServiceType.value = inp.serviceType;
          if (dom.planPrice && inp.price !== undefined) dom.planPrice.value = inp.price;
          if (dom.planVarCostAmount && inp.varCost !== undefined) dom.planVarCostAmount.value = inp.varCost;
          if (dom.planAdSpend && inp.adSpend !== undefined) dom.planAdSpend.value = inp.adSpend;
          if (dom.planAgencyFee && inp.agencyFee !== undefined) dom.planAgencyFee.value = inp.agencyFee;
          if (dom.planTargetProfit && inp.targetProfit !== undefined) dom.planTargetProfit.value = inp.targetProfit;
          recalculate();
        }
      }
    });
  }

  // Comprobar transferencias preparadas desde Calculadora de Rentabilidad
  if (window.GlossStorage && window.GlossStorage.consumeTreatmentToRoas) {
    const staged = window.GlossStorage.consumeTreatmentToRoas();
    if (staged) {
      if (dom.planServiceName && staged.serviceName) dom.planServiceName.value = staged.serviceName;
      if (dom.planPrice && staged.price) dom.planPrice.value = staged.price;
      if (dom.planVarCostAmount && staged.variableCost) dom.planVarCostAmount.value = staged.variableCost;
      if (dom.planBusinessName && staged.businessName) dom.planBusinessName.value = staged.businessName;
      recalculate();
    }
  }

  function parseNumber(val) {
    return engine.parseNumber(val);
  }
  function parseNum(val) {
    return engine.parseNumber(val);
  }
  function fmtCOP(val) {
    if (window.GlossCurrency && typeof window.GlossCurrency.formatCurrency === 'function') {
      return window.GlossCurrency.formatCurrency(val);
    }
    if (window.GlossReportEngine && typeof window.GlossReportEngine.formatCurrency === 'function') {
      return window.GlossReportEngine.formatCurrency(val);
    }
    return engine.formatCOP(val);
  }
  function fmtPct(val) {
    if (window.GlossReportEngine && typeof window.GlossReportEngine.formatPct === 'function') {
      return window.GlossReportEngine.formatPct(val);
    }
    return engine.formatPct(val);
  }
  function formatInteger(val) {
    if (window.GlossReportEngine && typeof window.GlossReportEngine.formatInteger === 'function') {
      return window.GlossReportEngine.formatInteger(val);
    }
    return Math.round(Number(val) || 0).toLocaleString('es-CO');
  }
});
