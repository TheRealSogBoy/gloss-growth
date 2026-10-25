'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const engine = window.GlossAparatologiaEngine;
  const storage = window.GlossStorage;
  const reportEngine = window.GlossReportEngine;
  const currencyPicker = window.GlossCurrency;

  if (!engine) {
    console.error('GlossAparatologiaEngine no está disponible.');
    return;
  }

  // 1. INICIALIZAR PICKER DE MONEDA
  const currContainer = document.getElementById('ap-currency-picker-container');
  if (currencyPicker && currContainer) {
    currencyPicker.initPicker(currContainer, {
      id: 'ap-curr-picker',
      onChange: (code) => {
        recalculate();
      }
    });
  }

  // 2. INICIALIZAR GESTOR DE ALMACENAMIENTO COMPARTIDO
  const storageContainer = document.getElementById('ap-storage-container');
  if (storage && storageContainer) {
    storageContainer.innerHTML = storage.renderStorageControlsHtml('aparatologia', 'Inversión en Aparatología');
    storage.bindStorageUI(storageContainer, 'aparatologia', {
      getDefaultName: () => {
        const eqName = document.getElementById('ap-equipment-name')?.value || 'Aparatología';
        return eqName + ' — ' + new Date().toLocaleDateString('es-CO', { month: 'short', year: 'numeric' });
      },
      getInputs: () => getFormInputs(),
      getMeta: () => ({
        businessName: document.getElementById('ap-business-name')?.value || '',
        currency: currencyPicker ? currencyPicker.getSelectedCurrency() : 'COP'
      }),
      onLoad: (analysis) => {
        if (analysis && analysis.inputs) {
          setFormInputs(analysis.inputs);
        }
      }
    });
  }

  // DOM Elements
  const elBusinessName = document.getElementById('ap-business-name');
  const elEquipmentName = document.getElementById('ap-equipment-name');
  const elEquipmentPrice = document.getElementById('ap-equipment-price');
  const elInstallationCost = document.getElementById('ap-installation-cost');
  const elTrainingCost = document.getElementById('ap-training-cost');
  const elUsefulLife = document.getElementById('ap-useful-life');
  const elResidualValue = document.getElementById('ap-residual-value');

  // Financing Inputs
  const elDownPayment = document.getElementById('ap-down-payment');
  const elLoanTerm = document.getElementById('ap-loan-term');
  const elInterestRate = document.getElementById('ap-interest-rate');
  const elRateType = document.getElementById('ap-rate-type');
  const elMonthlyLoanFees = document.getElementById('ap-monthly-loan-fees');
  const elBalloonPayment = document.getElementById('ap-balloon-payment');

  const elLeaseDown = document.getElementById('ap-lease-down');
  const elLeaseCanon = document.getElementById('ap-lease-canon');
  const elLeaseTerm = document.getElementById('ap-lease-term');
  const elPurchaseOption = document.getElementById('ap-purchase-option');

  const elRentalFee = document.getElementById('ap-rental-fee');
  const elRentalMonths = document.getElementById('ap-rental-months');
  const elSecurityDeposit = document.getElementById('ap-security-deposit');

  // Operations Inputs
  const elTreatmentName = document.getElementById('ap-treatment-name');
  const elPriceSession = document.getElementById('ap-price-session');
  const elCostSession = document.getElementById('ap-cost-session');
  const elMonthlySessions = document.getElementById('ap-monthly-sessions');
  const elMonthlyMaintenance = document.getElementById('ap-monthly-maintenance');
  const elMonthlyInsurance = document.getElementById('ap-monthly-insurance');

  // Outputs
  const elKpiDownPayment = document.getElementById('kpi-down-payment');
  const elKpiDownSub = document.getElementById('kpi-down-sub');
  const elKpiMonthlyPayment = document.getElementById('kpi-monthly-payment');
  const elKpiMonthlySub = document.getElementById('kpi-monthly-sub');
  const elKpiMonthlyContrib = document.getElementById('kpi-monthly-contrib');
  const elKpiContribSub = document.getElementById('kpi-contrib-sub');
  const elKpiNetCashflow = document.getElementById('kpi-net-cashflow');
  const elKpiCashflowSub = document.getElementById('kpi-cashflow-sub');

  const elSecBeFixed = document.getElementById('sec-be-fixed');
  const elSecBeFinance = document.getElementById('sec-be-finance');
  const elSecSimplePayback = document.getElementById('sec-simple-payback');
  const elSecEquityPayback = document.getElementById('sec-equity-payback');

  const elDemandTbody = document.getElementById('ap-demand-tbody');
  const elDiagHecho = document.getElementById('diag-hecho');
  const elDiagSignificado = document.getElementById('diag-significado');
  const elDiagRecomendacion = document.getElementById('diag-recomendacion');

  const elCardSchedule = document.getElementById('ap-card-schedule');
  const elSchedTbody = document.getElementById('ap-sched-tbody');
  const elSchedTotalInterest = document.getElementById('sched-total-interest-badge');

  // Operational Capacity DOM
  const elOpConfigCard = document.getElementById('ap-operational-config-card');
  const elOpViabilityCard = document.getElementById('ap-operational-viability-card');
  const elOpCenterBadge = document.getElementById('ap-op-center-badge');
  const elOpCenterSummary = document.getElementById('ap-op-center-summary');
  const elOpStaffCheckboxes = document.getElementById('ap-op-staff-checkboxes');
  const elOpCabinsCheckboxes = document.getElementById('ap-op-cabins-checkboxes');
  const elOpUnits = document.getElementById('ap-op-units');
  const elOpDuration = document.getElementById('ap-op-duration');
  const elOpCleanup = document.getElementById('ap-op-cleanup');
  const elOpStaffCount = document.getElementById('ap-op-staff-count');
  const elOpAuxContainer = document.getElementById('ap-op-aux-equip-container');
  const elOpAuxEquip = document.getElementById('ap-op-aux-equip');
  const btnUnlinkCapacity = document.getElementById('btn-unlink-capacity');

  const elOpKpiProgrammable = document.getElementById('op-kpi-programmable');
  const elOpKpiProgSub = document.getElementById('op-kpi-programmable-sub');
  const elOpKpiDemand = document.getElementById('op-kpi-demand');
  const elOpKpiFeasible = document.getElementById('op-kpi-feasible');
  const elOpKpiFeasibleSub = document.getElementById('op-kpi-feasible-sub');
  const elOpMetricHours = document.getElementById('op-metric-hours');
  const elOpMetricDiff = document.getElementById('op-metric-diff');
  const elOpMetricBottleneck = document.getElementById('op-metric-bottleneck');
  const elOpDisplacementAlert = document.getElementById('op-displacement-alert');
  const elOpDisplacementTitle = document.getElementById('op-displacement-title');
  const elOpDisplacementDesc = document.getElementById('op-displacement-desc');
  const btnApplyFeasible = document.getElementById('btn-apply-feasible');
  const btnRestoreManual = document.getElementById('btn-restore-manual');
  const elOpRestoreVal = document.getElementById('op-restore-val');

  // Modal DOM
  const modalCapacity = document.getElementById('modal-select-capacity');
  const modalCapList = document.getElementById('modal-capacity-list');
  const btnCloseCapModal = document.getElementById('btn-close-cap-modal');

  // State
  let currentMode = 'contado';
  let lastResult = null;
  let activeCapacityConfig = null;
  let activeCapacityMeta = null;
  let currentOperationalResult = null;
  let usingFeasibleSessions = false;
  let manualDemandSessions = 20;

  // Comparator State
  let comparisonHorizon = 24;
  let selectedModalities = ['contado', 'credito', 'proveedor', 'leasing', 'alquiler'];
  let lastComparisonResult = null;

  function getModalityConfigs() {
    const eqPrice = Math.max(0, parseFloat(elEquipmentPrice?.value) || 0);
    return {
      contado: {},
      credito: {
        downPayment: Math.max(0, parseFloat(document.getElementById('comp-cred-down')?.value || elDownPayment?.value || (eqPrice * 0.2))),
        loanTermMonths: Math.max(1, parseInt(document.getElementById('comp-cred-term')?.value || elLoanTerm?.value || 24, 10)),
        interestRatePct: Math.max(0, parseFloat(document.getElementById('comp-cred-rate')?.value || elInterestRate?.value || 1.2)),
        rateType: document.getElementById('comp-cred-ratetype')?.value || elRateType?.value || 'EM',
        balloonPayment: Math.max(0, parseFloat(document.getElementById('comp-cred-balloon')?.value || elBalloonPayment?.value || 0))
      },
      proveedor: {
        downPayment: Math.max(0, parseFloat(document.getElementById('comp-prov-down')?.value || 6000000)),
        loanTermMonths: Math.max(1, parseInt(document.getElementById('comp-prov-term')?.value || 12, 10)),
        interestRatePct: Math.max(0, parseFloat(document.getElementById('comp-prov-rate')?.value || 0)),
        rateType: document.getElementById('comp-prov-ratetype')?.value || 'EM',
        balloonPayment: Math.max(0, parseFloat(document.getElementById('comp-prov-balloon')?.value || 0))
      },
      leasing: {
        downPayment: Math.max(0, parseFloat(document.getElementById('comp-lease-down')?.value || elLeaseDown?.value || 3000000)),
        leaseCanon: Math.max(0, parseFloat(document.getElementById('comp-lease-canon')?.value || elLeaseCanon?.value || 1500000)),
        leaseTermMonths: Math.max(1, parseInt(document.getElementById('comp-lease-term')?.value || elLeaseTerm?.value || 24, 10)),
        purchaseOptionAmount: Math.max(0, parseFloat(document.getElementById('comp-lease-option')?.value || elPurchaseOption?.value || 3000000)),
        exercisePurchaseOption: document.getElementById('comp-lease-exercise') ? document.getElementById('comp-lease-exercise').checked : true
      },
      alquiler: {
        monthlyRentalFee: Math.max(0, parseFloat(document.getElementById('comp-rent-fee')?.value || elRentalFee?.value || 1500000)),
        rentalMonths: Math.max(1, parseInt(document.getElementById('comp-rent-term')?.value || elRentalMonths?.value || 12, 10)),
        securityDeposit: Math.max(0, parseFloat(document.getElementById('comp-rent-deposit')?.value || elSecurityDeposit?.value || 3000000)),
        maintenanceIncluded: document.getElementById('comp-rent-maint-included') ? document.getElementById('comp-rent-maint-included').checked : false
      }
    };
  }

  function fmtCur(val) {
    const cur = currencyPicker ? currencyPicker.getSelectedCurrency() : 'COP';
    return reportEngine ? reportEngine.formatCurrency(val, cur) : '$' + Math.round(val || 0).toLocaleString('es-CO');
  }

  function getFormInputs() {
    return {
      acquisitionMode: currentMode,
      businessName: elBusinessName?.value || '',
      equipmentName: elEquipmentName?.value || '',
      equipmentPrice: elEquipmentPrice?.value || 0,
      installationCost: elInstallationCost?.value || 0,
      trainingCost: elTrainingCost?.value || 0,
      usefulLifeYears: elUsefulLife?.value || 5,
      residualValue: elResidualValue?.value || 0,
      downPayment: currentMode === 'leasing' ? (elLeaseDown?.value || 0) : (elDownPayment?.value || 0),
      loanTermMonths: elLoanTerm?.value || 12,
      interestRatePct: elInterestRate?.value || 0,
      rateType: elRateType?.value || 'EM',
      monthlyLoanFees: elMonthlyLoanFees?.value || 0,
      balloonPayment: elBalloonPayment?.value || 0,
      leaseCanon: elLeaseCanon?.value || 0,
      leaseTermMonths: elLeaseTerm?.value || 24,
      purchaseOptionAmount: elPurchaseOption?.value || 0,
      monthlyRentalFee: elRentalFee?.value || 0,
      rentalMonths: elRentalMonths?.value || 12,
      securityDeposit: elSecurityDeposit?.value || 0,
      treatmentName: elTreatmentName?.value || '',
      pricePerSession: elPriceSession?.value || 0,
      variableCostPerSession: elCostSession?.value || 0,
      monthlySessions: elMonthlySessions?.value || 0,
      monthlyMaintenance: elMonthlyMaintenance?.value || 0,
      monthlyInsurance: elMonthlyInsurance?.value || 0,
      isComparator: currentMode === 'comparador',
      comparisonHorizon,
      selectedModalities: [...selectedModalities],
      modalityConfigs: getModalityConfigs(),
      operationalCapacity: activeCapacityMeta ? {
        meta: activeCapacityMeta,
        config: activeCapacityConfig,
        equipmentParams: {
          units: elOpUnits?.value || 1,
          durationMinutes: elOpDuration?.value || 60,
          setupCleanupMinutes: elOpCleanup?.value || 15,
          requiredStaffCount: elOpStaffCount?.value || 1,
          compatibleStaffIds: Array.from(document.querySelectorAll('.ap-staff-check:checked')).map(el => el.value),
          compatibleCabinIds: Array.from(document.querySelectorAll('.ap-cabin-check:checked')).map(el => el.value),
          auxiliaryEquipmentId: elOpAuxEquip?.value || ''
        },
        usingFeasibleSessions,
        manualDemandSessions
      } : null
    };
  }

  function setFormInputs(data) {
    if (!data) return;
    if (data.acquisitionMode) switchMode(data.acquisitionMode);
    if (data.businessName !== undefined && elBusinessName) elBusinessName.value = data.businessName;
    if (data.equipmentName !== undefined && elEquipmentName) elEquipmentName.value = data.equipmentName;
    if (data.equipmentPrice !== undefined && elEquipmentPrice) elEquipmentPrice.value = data.equipmentPrice;
    if (data.installationCost !== undefined && elInstallationCost) elInstallationCost.value = data.installationCost;
    if (data.trainingCost !== undefined && elTrainingCost) elTrainingCost.value = data.trainingCost;
    if (data.usefulLifeYears !== undefined && elUsefulLife) elUsefulLife.value = data.usefulLifeYears;
    if (data.residualValue !== undefined && elResidualValue) elResidualValue.value = data.residualValue;

    if (data.downPayment !== undefined) {
      if (elDownPayment) elDownPayment.value = data.downPayment;
      if (elLeaseDown) elLeaseDown.value = data.downPayment;
    }
    if (data.loanTermMonths !== undefined && elLoanTerm) elLoanTerm.value = data.loanTermMonths;
    if (data.interestRatePct !== undefined && elInterestRate) elInterestRate.value = data.interestRatePct;
    if (data.rateType !== undefined && elRateType) elRateType.value = data.rateType;
    if (data.monthlyLoanFees !== undefined && elMonthlyLoanFees) elMonthlyLoanFees.value = data.monthlyLoanFees;
    if (data.balloonPayment !== undefined && elBalloonPayment) elBalloonPayment.value = data.balloonPayment;

    if (data.leaseCanon !== undefined && elLeaseCanon) elLeaseCanon.value = data.leaseCanon;
    if (data.leaseTermMonths !== undefined && elLeaseTerm) elLeaseTerm.value = data.leaseTermMonths;
    if (data.purchaseOptionAmount !== undefined && elPurchaseOption) elPurchaseOption.value = data.purchaseOptionAmount;

    if (data.monthlyRentalFee !== undefined && elRentalFee) elRentalFee.value = data.monthlyRentalFee;
    if (data.rentalMonths !== undefined && elRentalMonths) elRentalMonths.value = data.rentalMonths;
    if (data.securityDeposit !== undefined && elSecurityDeposit) elSecurityDeposit.value = data.securityDeposit;

    if (data.treatmentName !== undefined && elTreatmentName) elTreatmentName.value = data.treatmentName;
    if (data.pricePerSession !== undefined && elPriceSession) elPriceSession.value = data.pricePerSession;
    if (data.variableCostPerSession !== undefined && elCostSession) elCostSession.value = data.variableCostPerSession;
    if (data.monthlySessions !== undefined && elMonthlySessions) elMonthlySessions.value = data.monthlySessions;
    if (data.monthlyMaintenance !== undefined && elMonthlyMaintenance) elMonthlyMaintenance.value = data.monthlyMaintenance;
    if (data.monthlyInsurance !== undefined && elMonthlyInsurance) elMonthlyInsurance.value = data.monthlyInsurance;

    if (data.operationalCapacity && data.operationalCapacity.meta && data.operationalCapacity.config) {
      const op = data.operationalCapacity;
      importCapacityAnalysis({
        id: op.meta.id,
        name: op.meta.name,
        toolKey: op.meta.toolKey,
        businessName: op.meta.businessName,
        inputs: op.config
      });

      if (op.equipmentParams) {
        const ep = op.equipmentParams;
        if (elOpUnits && ep.units !== undefined) elOpUnits.value = ep.units;
        if (elOpDuration && ep.durationMinutes !== undefined) elOpDuration.value = ep.durationMinutes;
        if (elOpCleanup && ep.setupCleanupMinutes !== undefined) elOpCleanup.value = ep.setupCleanupMinutes;
        if (elOpStaffCount && ep.requiredStaffCount !== undefined) elOpStaffCount.value = ep.requiredStaffCount;
        if (elOpAuxEquip && ep.auxiliaryEquipmentId !== undefined) elOpAuxEquip.value = ep.auxiliaryEquipmentId;

        if (Array.isArray(ep.compatibleStaffIds)) {
          document.querySelectorAll('.ap-staff-check').forEach(chk => {
            chk.checked = ep.compatibleStaffIds.includes(chk.value);
          });
        }
        if (Array.isArray(ep.compatibleCabinIds)) {
          document.querySelectorAll('.ap-cabin-check').forEach(chk => {
            chk.checked = ep.compatibleCabinIds.includes(chk.value);
          });
        }
      }

      manualDemandSessions = op.manualDemandSessions || (parseInt(elMonthlySessions?.value, 10) || 20);
      usingFeasibleSessions = !!op.usingFeasibleSessions;
    } else if (data.operationalCapacity === null) {
      activeCapacityConfig = null;
      activeCapacityMeta = null;
      currentOperationalResult = null;
      usingFeasibleSessions = false;
      if (elOpConfigCard) elOpConfigCard.style.display = 'none';
      if (elOpViabilityCard) elOpViabilityCard.style.display = 'none';
    }

    if (data.isComparator || data.acquisitionMode === 'comparador') {
      if (data.comparisonHorizon) {
        comparisonHorizon = data.comparisonHorizon;
        document.querySelectorAll('.comp-hz-btn').forEach(btn => {
          const match = parseInt(btn.dataset.hz, 10) === comparisonHorizon;
          btn.classList.toggle('active', match);
          btn.classList.toggle('btn--primary', match);
          btn.classList.toggle('btn--outline', !match);
        });
      }
      if (Array.isArray(data.selectedModalities)) {
        selectedModalities = data.selectedModalities;
        document.querySelectorAll('.comp-mode-check').forEach(chk => {
          chk.checked = selectedModalities.includes(chk.value);
        });
      }
      if (data.modalityConfigs) {
        const mc = data.modalityConfigs;
        if (mc.credito) {
          if (mc.credito.downPayment !== undefined && document.getElementById('comp-cred-down')) document.getElementById('comp-cred-down').value = mc.credito.downPayment;
          if (mc.credito.loanTermMonths !== undefined && document.getElementById('comp-cred-term')) document.getElementById('comp-cred-term').value = mc.credito.loanTermMonths;
          if (mc.credito.interestRatePct !== undefined && document.getElementById('comp-cred-rate')) document.getElementById('comp-cred-rate').value = mc.credito.interestRatePct;
          if (mc.credito.rateType !== undefined && document.getElementById('comp-cred-ratetype')) document.getElementById('comp-cred-ratetype').value = mc.credito.rateType;
          if (mc.credito.balloonPayment !== undefined && document.getElementById('comp-cred-balloon')) document.getElementById('comp-cred-balloon').value = mc.credito.balloonPayment;
        }
        if (mc.proveedor) {
          if (mc.proveedor.downPayment !== undefined && document.getElementById('comp-prov-down')) document.getElementById('comp-prov-down').value = mc.proveedor.downPayment;
          if (mc.proveedor.loanTermMonths !== undefined && document.getElementById('comp-prov-term')) document.getElementById('comp-prov-term').value = mc.proveedor.loanTermMonths;
          if (mc.proveedor.interestRatePct !== undefined && document.getElementById('comp-prov-rate')) document.getElementById('comp-prov-rate').value = mc.proveedor.interestRatePct;
          if (mc.proveedor.rateType !== undefined && document.getElementById('comp-prov-ratetype')) document.getElementById('comp-prov-ratetype').value = mc.proveedor.rateType;
          if (mc.proveedor.balloonPayment !== undefined && document.getElementById('comp-prov-balloon')) document.getElementById('comp-prov-balloon').value = mc.proveedor.balloonPayment;
        }
        if (mc.leasing) {
          if (mc.leasing.downPayment !== undefined && document.getElementById('comp-lease-down')) document.getElementById('comp-lease-down').value = mc.leasing.downPayment;
          if (mc.leasing.leaseCanon !== undefined && document.getElementById('comp-lease-canon')) document.getElementById('comp-lease-canon').value = mc.leasing.leaseCanon;
          if (mc.leasing.leaseTermMonths !== undefined && document.getElementById('comp-lease-term')) document.getElementById('comp-lease-term').value = mc.leasing.leaseTermMonths;
          if (mc.leasing.purchaseOptionAmount !== undefined && document.getElementById('comp-lease-option')) document.getElementById('comp-lease-option').value = mc.leasing.purchaseOptionAmount;
          if (mc.leasing.exercisePurchaseOption !== undefined && document.getElementById('comp-lease-exercise')) document.getElementById('comp-lease-exercise').checked = !!mc.leasing.exercisePurchaseOption;
        }
        if (mc.alquiler) {
          if (mc.alquiler.monthlyRentalFee !== undefined && document.getElementById('comp-rent-fee')) document.getElementById('comp-rent-fee').value = mc.alquiler.monthlyRentalFee;
          if (mc.alquiler.rentalMonths !== undefined && document.getElementById('comp-rent-term')) document.getElementById('comp-rent-term').value = mc.alquiler.rentalMonths;
          if (mc.alquiler.securityDeposit !== undefined && document.getElementById('comp-rent-deposit')) document.getElementById('comp-rent-deposit').value = mc.alquiler.securityDeposit;
          if (mc.alquiler.maintenanceIncluded !== undefined && document.getElementById('comp-rent-maint-included')) document.getElementById('comp-rent-maint-included').checked = !!mc.alquiler.maintenanceIncluded;
        }
      }
      switchMode('comparador');
      return;
    }

    recalculate();
  }

  function switchMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.ap-tab-btn').forEach(btn => {
      const isCur = btn.dataset.mode === mode;
      btn.classList.toggle('active', isCur);
      btn.setAttribute('aria-selected', isCur ? 'true' : 'false');
    });

    const elLayout = document.querySelector('.ap-layout');
    const elCompView = document.getElementById('ap-comparator-view');

    if (mode === 'comparador') {
      if (elLayout) elLayout.style.display = 'none';
      if (elCompView) elCompView.style.display = 'block';
      recalculateComparator();
      return;
    }

    if (elLayout) elLayout.style.display = 'grid';
    if (elCompView) elCompView.style.display = 'none';

    const badge = document.getElementById('ap-financing-mode-badge');
    const titles = {
      contado: 'Compra de contado',
      credito: 'Crédito bancario comercial',
      proveedor: 'Financiación directa del proveedor',
      leasing: 'Leasing financiero',
      alquiler: 'Alquiler o Renting tecnológico'
    };
    if (badge) badge.textContent = titles[mode] || mode;

    document.querySelectorAll('.ap-finance-panel').forEach(p => p.style.display = 'none');
    if (mode === 'contado') {
      const p = document.getElementById('panel-contado');
      if (p) p.style.display = 'block';
    } else if (mode === 'credito' || mode === 'proveedor') {
      const p = document.getElementById('panel-credito');
      if (p) p.style.display = 'block';
    } else if (mode === 'leasing') {
      const p = document.getElementById('panel-leasing');
      if (p) p.style.display = 'block';
    } else if (mode === 'alquiler') {
      const p = document.getElementById('panel-alquiler');
      if (p) p.style.display = 'block';
    }

    recalculate();
  }

  function recalculateComparator() {
    if (currentMode !== 'comparador') return;

    const errorEl = document.getElementById('comp-modes-error');
    if (!selectedModalities || selectedModalities.length < 2) {
      if (errorEl) errorEl.style.display = 'block';
      return;
    }
    if (errorEl) errorEl.style.display = 'none';

    const sharedParams = {
      equipmentName: elEquipmentName?.value || 'Nuevo Equipo',
      equipmentPrice: Math.max(0, parseFloat(elEquipmentPrice?.value) || 0),
      installationCost: Math.max(0, parseFloat(elInstallationCost?.value) || 0),
      trainingCost: Math.max(0, parseFloat(elTrainingCost?.value) || 0),
      usefulLifeYears: Math.max(1, parseInt(elUsefulLife?.value, 10) || 5),
      residualValue: Math.max(0, parseFloat(elResidualValue?.value) || 0),
      pricePerSession: Math.max(0, parseFloat(elPriceSession?.value) || 0),
      variableCostPerSession: Math.max(0, parseFloat(elCostSession?.value) || 0),
      monthlySessions: Math.max(0, parseFloat(elMonthlySessions?.value) || 0),
      monthlyMaintenance: Math.max(0, parseFloat(elMonthlyMaintenance?.value) || 0),
      monthlyInsurance: Math.max(0, parseFloat(elMonthlyInsurance?.value) || 0)
    };

    const modalityConfigs = getModalityConfigs();

    lastComparisonResult = engine.evaluateModalityComparison(
      sharedParams,
      modalityConfigs,
      comparisonHorizon,
      selectedModalities
    );

    // Update labels for horizon
    document.querySelectorAll('.comp-hz-label').forEach(el => {
      el.textContent = `${comparisonHorizon}m`;
    });
    const hzBadge = document.getElementById('comp-table-hz-badge');
    if (hzBadge) hzBadge.textContent = `${comparisonHorizon} meses`;

    // Highlights
    const hl = lastComparisonResult.highlights || {};
    const hlInitVal = document.getElementById('comp-hl-initial-val');
    const hlInitSub = document.getElementById('comp-hl-initial-sub');
    if (hlInitVal && hl.lowestInitialOutlay) {
      hlInitVal.textContent = fmtCur(hl.lowestInitialOutlay.initialOutlay);
      if (hlInitSub) hlInitSub.textContent = hl.lowestInitialOutlay.title;
    }

    const hlMonthVal = document.getElementById('comp-hl-monthly-val');
    const hlMonthSub = document.getElementById('comp-hl-monthly-sub');
    if (hlMonthVal && hl.lowestMonthlyCommitment) {
      hlMonthVal.textContent = fmtCur(hl.lowestMonthlyCommitment.monthlyPayment);
      if (hlMonthSub) hlMonthSub.textContent = hl.lowestMonthlyCommitment.title;
    }

    const hlTotalVal = document.getElementById('comp-hl-total-val');
    const hlTotalSub = document.getElementById('comp-hl-total-sub');
    if (hlTotalVal && hl.lowestTotalPayments) {
      hlTotalVal.textContent = fmtCur(hl.lowestTotalPayments.totalPaymentsInHorizon);
      if (hlTotalSub) hlTotalSub.textContent = hl.lowestTotalPayments.title;
    }

    const hlCashVal = document.getElementById('comp-hl-cashflow-val');
    const hlCashSub = document.getElementById('comp-hl-cashflow-sub');
    if (hlCashVal && hl.highestCumulativeCashFlow) {
      const isNeg = hl.highestCumulativeCashFlow.cumulativeCashFlow < 0;
      hlCashVal.textContent = (isNeg ? '−' : '+') + fmtCur(Math.abs(hl.highestCumulativeCashFlow.cumulativeCashFlow));
      hlCashVal.style.color = isNeg ? '#991B1B' : 'var(--ap-burgundy)';
      if (hlCashSub) hlCashSub.textContent = hl.highestCumulativeCashFlow.title;
    }

    // Render Table and Chart
    renderComparisonTable(lastComparisonResult);
    renderComparisonChart(lastComparisonResult);

    // Interpretation
    const it = lastComparisonResult.interpretation || {};
    const diagDes = document.getElementById('comp-diag-desembolso');
    const diagPag = document.getElementById('comp-diag-pagos');
    const diagCaj = document.getElementById('comp-diag-caja');
    const diagPru = document.getElementById('comp-diag-prudencia');
    if (diagDes) diagDes.textContent = it.desembolso || '—';
    if (diagPag) diagPag.textContent = it.pagos || '—';
    if (diagCaj) diagCaj.textContent = it.caja || '—';
    if (diagPru) diagPru.textContent = it.prudencia || '—';

    // Business sync
    if (storage && elBusinessName && elBusinessName.value.trim()) {
      storage.setActiveBusiness(elBusinessName.value.trim());
    }
  }

  function renderComparisonTable(comp) {
    const thead = document.getElementById('ap-comp-thead');
    const tbody = document.getElementById('ap-comp-tbody');
    if (!thead || !tbody || !comp || !comp.activeModes) return;

    const modes = comp.activeModes;
    const H = comp.horizonMonths || 24;

    let thHtml = '<tr><th style="min-width:180px;">Métrica / Característica</th>';
    modes.forEach(m => {
      const r = comp.results[m];
      thHtml += `<th style="text-align:right;min-width:130px;">${r ? r.title : m}</th>`;
    });
    thHtml += '</tr>';
    thead.innerHTML = thHtml;

    const rows = [
      {
        label: 'Desembolso inicial de caja',
        sub: 'Cuota inicial + instalación + flete',
        getValue: (r) => fmtCur(r.initialOutlay),
        isWinner: (m) => comp.highlights?.lowestInitialOutlay?.id === m
      },
      {
        label: 'Cuota / compromiso mensual',
        sub: 'Durante período de amortización',
        getValue: (r) => fmtCur(r.monthlyPayment),
        isWinner: (m) => comp.highlights?.lowestMonthlyCommitment?.id === m
      },
      {
        label: `Total desembolsado en ${H} meses`,
        sub: 'Suma de todos los pagos en el horizonte',
        getValue: (r) => fmtCur(r.totalPaymentsInHorizon),
        isHighlight: true,
        isWinner: (m) => comp.highlights?.lowestTotalPayments?.id === m
      },
      {
        label: 'Sobrecosto financiero / Intereses',
        sub: 'Intereses bancarios o costo implícito acumulado',
        getValue: (r) => fmtCur(r.totalFinanceInterest)
      },
      {
        label: `Saldo pendiente al mes ${H}`,
        sub: 'Capital insoluto pendiente tras el horizonte',
        getValue: (r) => fmtCur(r.remainingBalance)
      },
      {
        label: `Flujo neto acumulado al mes ${H}`,
        sub: 'Excedente de caja libre acumulado tras cuotas',
        getValue: (r) => {
          const isNeg = r.cumulativeCashFlow < 0;
          return (isNeg ? '−' : '+') + fmtCur(Math.abs(r.cumulativeCashFlow));
        },
        isHighlight: true,
        isWinner: (m) => comp.highlights?.highestCumulativeCashFlow?.id === m
      },
      {
        label: 'Punto de equilibrio mensual',
        sub: 'Sesiones requeridas para cubrir costos fijos y deuda',
        getValue: (r) => {
          const mContrib = r.monthlyContribution;
          const sCount = parseFloat(elMonthlySessions?.value) || 1;
          const unitContrib = sCount > 0 ? (mContrib / sCount) : 0;
          if (unitContrib <= 0) return '—';
          const fixedPlusDebt = (parseFloat(elMonthlyMaintenance?.value) || 0) + (parseFloat(elMonthlyInsurance?.value) || 0) + r.monthlyPayment;
          return `${Math.ceil(fixedPlusDebt / unitContrib)} citas/mes`;
        }
      },
      {
        label: 'Recuperación de inversión (Payback)',
        sub: 'Tiempo estimado de retorno de capital propio',
        getValue: (r) => {
          if (r.id === 'alquiler') return 'Inmediato (sin activo propio)';
          if (r.netCashFlowDuringPayments <= 0 && r.netCashFlowAfterPayments <= 0) return 'Sin recuperación';
          if (r.initialOutlay <= 0) return 'Inmediato (0 inicial)';
          const months = r.initialOutlay / Math.max(1, r.netCashFlowDuringPayments);
          return `${months.toFixed(1).replace('.', ',')} meses`;
        }
      },
      {
        label: 'Situación de propiedad',
        sub: 'Titularidad jurídica al cierre del horizonte',
        getValue: (r) => r.ownershipStatus
      }
    ];

    let tbHtml = '';
    rows.forEach(row => {
      tbHtml += `<tr class="${row.isHighlight ? 'ap-comp-highlight-row' : ''}">`;
      tbHtml += `<td><strong>${row.label}</strong><span style="display:block;font-size:10px;color:var(--ap-muted);">${row.sub}</span></td>`;
      modes.forEach(m => {
        const r = comp.results[m];
        if (!r) {
          tbHtml += '<td style="text-align:right;">—</td>';
          return;
        }
        const val = row.getValue(r);
        const win = row.isWinner ? row.isWinner(m) : false;
        tbHtml += `<td style="text-align:right;" class="${win ? 'ap-comp-winner-cell' : ''}">${val}</td>`;
      });
      tbHtml += '</tr>';
    });
    tbody.innerHTML = tbHtml;
  }

  function renderComparisonChart(comp) {
    const container = document.getElementById('comp-chart-container');
    const legend = document.getElementById('comp-chart-legend');
    if (!container || !comp || !comp.activeModes || comp.activeModes.length === 0) return;

    const colors = {
      contado: '#8C2536',
      credito: '#2563EB',
      proveedor: '#D97706',
      leasing: '#059669',
      alquiler: '#64748B'
    };

    if (legend) {
      legend.innerHTML = comp.activeModes.map(m => {
        const r = comp.results[m];
        const color = colors[m] || '#666';
        return `
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${color};"></span>
            <span style="font-size:12px;color:var(--ap-charcoal);font-weight:600;">${r ? r.title : m}</span>
          </div>
        `;
      }).join('');
    }

    let minVal = 0;
    let maxVal = 0;
    comp.activeModes.forEach(m => {
      const r = comp.results[m];
      if (r && Array.isArray(r.cashFlowSeries)) {
        r.cashFlowSeries.forEach(pt => {
          if (pt.cumulativeCashFlow < minVal) minVal = pt.cumulativeCashFlow;
          if (pt.cumulativeCashFlow > maxVal) maxVal = pt.cumulativeCashFlow;
        });
      }
    });

    const range = (maxVal - minVal) || 1;
    minVal = minVal - (range * 0.05);
    maxVal = maxVal + (range * 0.05);

    const W = 640;
    const H = 260;
    const padL = 75;
    const padR = 25;
    const padT = 20;
    const padB = 35;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const totalMonths = comp.horizonMonths || 24;

    const getX = (m) => padL + ((m / totalMonths) * plotW);
    const getY = (val) => padT + plotH - (((val - minVal) / (maxVal - minVal)) * plotH);

    let svg = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block;" aria-label="Gráfico de flujo de caja acumulado">`;

    const zeroY = getY(0);
    if (zeroY >= padT && zeroY <= padT + plotH) {
      svg += `<line x1="${padL}" y1="${zeroY}" x2="${W - padR}" y2="${zeroY}" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="4,3" />`;
      svg += `<text x="${padL - 6}" y="${zeroY + 3}" text-anchor="end" font-size="10" fill="#64748B" font-family="sans-serif">$0</text>`;
    }

    svg += `<text x="${padL - 6}" y="${padT + 10}" text-anchor="end" font-size="9" fill="#94A3B8" font-family="sans-serif">${fmtCur(maxVal)}</text>`;
    svg += `<text x="${padL - 6}" y="${padT + plotH}" text-anchor="end" font-size="9" fill="#94A3B8" font-family="sans-serif">${fmtCur(minVal)}</text>`;
    svg += `<line x1="${padL}" y1="${padT + plotH}" x2="${W - padR}" y2="${padT + plotH}" stroke="#CBD5E1" stroke-width="1" />`;

    const step = totalMonths <= 24 ? 6 : (totalMonths <= 48 ? 12 : 12);
    for (let m = 0; m <= totalMonths; m += step) {
      const x = getX(m);
      svg += `<line x1="${x}" y1="${padT + plotH}" x2="${x}" y2="${padT + plotH + 5}" stroke="#94A3B8" stroke-width="1" />`;
      svg += `<text x="${x}" y="${padT + plotH + 18}" text-anchor="middle" font-size="10" fill="#64748B" font-family="sans-serif">M${m}</text>`;
    }

    comp.activeModes.forEach(m => {
      const r = comp.results[m];
      if (!r || !Array.isArray(r.cashFlowSeries) || r.cashFlowSeries.length === 0) return;
      const color = colors[m] || '#666';

      let d = '';
      r.cashFlowSeries.forEach((pt, idx) => {
        const x = getX(pt.month);
        const y = getY(pt.cumulativeCashFlow);
        if (idx === 0) d += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
        else d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
      });

      svg += `<path d="${d}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />`;

      const lastPt = r.cashFlowSeries[r.cashFlowSeries.length - 1];
      const lx = getX(lastPt.month);
      const ly = getY(lastPt.cumulativeCashFlow);
      svg += `<circle cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="4" fill="${color}" stroke="#FFFFFF" stroke-width="1.5" />`;
    });

    svg += `</svg>`;
    container.innerHTML = svg;
  }

  // Modality Tabs
  document.querySelectorAll('.ap-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchMode(btn.dataset.mode);
    });
  });

  // Recalculation
  function recalculate() {
    if (currentMode === 'comparador') {
      recalculateComparator();
      return;
    }

    // Sync main panel inputs into comparator drawer
    if (elDownPayment && document.getElementById('comp-cred-down')) document.getElementById('comp-cred-down').value = elDownPayment.value;
    if (elLoanTerm && document.getElementById('comp-cred-term')) document.getElementById('comp-cred-term').value = elLoanTerm.value;
    if (elInterestRate && document.getElementById('comp-cred-rate')) document.getElementById('comp-cred-rate').value = elInterestRate.value;
    if (elRateType && document.getElementById('comp-cred-ratetype')) document.getElementById('comp-cred-ratetype').value = elRateType.value;
    if (elBalloonPayment && document.getElementById('comp-cred-balloon')) document.getElementById('comp-cred-balloon').value = elBalloonPayment.value;
    if (elLeaseDown && document.getElementById('comp-lease-down')) document.getElementById('comp-lease-down').value = elLeaseDown.value;
    if (elLeaseCanon && document.getElementById('comp-lease-canon')) document.getElementById('comp-lease-canon').value = elLeaseCanon.value;
    if (elLeaseTerm && document.getElementById('comp-lease-term')) document.getElementById('comp-lease-term').value = elLeaseTerm.value;
    if (elPurchaseOption && document.getElementById('comp-lease-option')) document.getElementById('comp-lease-option').value = elPurchaseOption.value;
    if (elRentalFee && document.getElementById('comp-rent-fee')) document.getElementById('comp-rent-fee').value = elRentalFee.value;
    if (elRentalMonths && document.getElementById('comp-rent-term')) document.getElementById('comp-rent-term').value = elRentalMonths.value;
    if (elSecurityDeposit && document.getElementById('comp-rent-deposit')) document.getElementById('comp-rent-deposit').value = elSecurityDeposit.value;

    const inputs = getFormInputs();
    lastResult = engine.evaluateAparatologia(inputs);

    // Business sync
    if (storage && elBusinessName && elBusinessName.value.trim()) {
      storage.setActiveBusiness(elBusinessName.value.trim());
    }

    // Contado preview
    const contadoTotal = document.getElementById('contado-out-total');
    if (contadoTotal) contadoTotal.textContent = fmtCur(lastResult.initialOutlayBeforeFinancing);

    // Primary KPIs
    if (elKpiDownPayment) elKpiDownPayment.textContent = fmtCur(lastResult.downPayment);
    if (elKpiDownSub) {
      elKpiDownSub.textContent = currentMode === 'contado' ? '100% de la inversión' : 'Cuota inicial + arranque';
    }

    if (elKpiMonthlyPayment) elKpiMonthlyPayment.textContent = fmtCur(lastResult.monthlyFinancePayment);
    if (elKpiMonthlySub) {
      if (currentMode === 'contado') elKpiMonthlySub.textContent = 'Sin cuota periódica';
      else if (currentMode === 'leasing') elKpiMonthlySub.textContent = 'Canon de leasing pactado';
      else if (currentMode === 'alquiler') elKpiMonthlySub.textContent = 'Tarifa de alquiler mensual';
      else elKpiMonthlySub.textContent = `Plazo: ${inputs.loanTermMonths} meses`;
    }

    if (elKpiMonthlyContrib) elKpiMonthlyContrib.textContent = fmtCur(lastResult.monthlyContribution);
    if (elKpiContribSub) {
      elKpiContribSub.textContent = `${fmtCur(lastResult.contributionPerSession)}/cita (${lastResult.marginPct.toFixed(1).replace('.', ',')}%)`;
    }

    if (elKpiNetCashflow) {
      elKpiNetCashflow.textContent = (lastResult.netCashFlowAfterFinance < 0 ? '−' : '') + fmtCur(Math.abs(lastResult.netCashFlowAfterFinance));
      elKpiNetCashflow.style.color = lastResult.netCashFlowAfterFinance < 0 ? '#991B1B' : 'var(--ap-burgundy)';
    }
    if (elKpiCashflowSub) {
      elKpiCashflowSub.textContent = lastResult.netCashFlowAfterFinance >= 0 ? 'Excedente mensual libre' : 'Déficit mensual de caja';
    }

    // Secondary KPIs
    if (elSecBeFixed) elSecBeFixed.textContent = `${lastResult.breakevenSessionsFixed} sesiones/mes`;
    if (elSecBeFinance) elSecBeFinance.textContent = `${lastResult.breakevenSessionsWithFinance} sesiones/mes`;
    if (elSecSimplePayback) elSecSimplePayback.textContent = lastResult.simplePaybackFormatted;
    if (elSecEquityPayback) elSecEquityPayback.textContent = lastResult.equityPaybackFormatted;

    // Demand Scenarios Table
    if (elDemandTbody && lastResult.demandScenarios) {
      elDemandTbody.innerHTML = '';
      lastResult.demandScenarios.forEach(sc => {
        const tr = document.createElement('tr');
        const isDeficit = sc.netCashFlow < 0;
        tr.innerHTML = `
          <td><strong>${sc.label}</strong></td>
          <td>${sc.sessions} citas</td>
          <td>${fmtCur(sc.revenue)}</td>
          <td style="color:${isDeficit ? '#991B1B' : '#166534'};font-weight:600;">
            ${isDeficit ? '−' : '+'}${fmtCur(Math.abs(sc.netCashFlow))}
          </td>
          <td>${sc.payback}</td>
        `;
        elDemandTbody.appendChild(tr);
      });
    }

    // Diagnosis Box
    if (lastResult.interpretation) {
      if (elDiagHecho) elDiagHecho.textContent = lastResult.interpretation.hecho;
      if (elDiagSignificado) elDiagSignificado.textContent = lastResult.interpretation.significado;
      if (elDiagRecomendacion) elDiagRecomendacion.textContent = lastResult.interpretation.recomendacion;
    }

    // Amortization Schedule
    if (lastResult.loanSchedule && (currentMode === 'credito' || currentMode === 'proveedor')) {
      if (elCardSchedule) elCardSchedule.style.display = 'block';
      if (elSchedTotalInterest) {
        elSchedTotalInterest.textContent = `Intereses totales: ${fmtCur(lastResult.totalFinanceInterest)}`;
      }
      if (elSchedTbody) {
        elSchedTbody.innerHTML = '';
        lastResult.loanSchedule.schedule.forEach(row => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>Mes ${row.month}</td>
            <td><strong>${fmtCur(row.payment)}</strong></td>
            <td>${fmtCur(row.principal)}</td>
            <td style="color:#64748B;">${fmtCur(row.interest)}</td>
            <td>${fmtCur(row.balance)}</td>
          `;
          elSchedTbody.appendChild(tr);
        });
      }
    } else {
      if (elCardSchedule) elCardSchedule.style.display = 'none';
    }

    if (activeCapacityConfig) {
      recalculateOperational();
    }
  }

  // Wire input listeners
  const allInputs = document.querySelectorAll('.ap-input, .ap-select');
  allInputs.forEach(inp => {
    inp.addEventListener('input', recalculate);
    inp.addEventListener('change', recalculate);
  });

  if (elMonthlySessions) {
    elMonthlySessions.addEventListener('input', () => {
      if (usingFeasibleSessions && currentOperationalResult) {
        const val = parseInt(elMonthlySessions.value, 10) || 0;
        if (val !== currentOperationalResult.feasibleSessions) {
          usingFeasibleSessions = false;
          manualDemandSessions = val;
        }
      }
    });
  }

  // Presets
  const PRESETS = {
    'laser-contado': {
      acquisitionMode: 'contado',
      equipmentName: 'Láser de Diodo Alta Potencia',
      equipmentPrice: 30000000,
      installationCost: 0,
      trainingCost: 0,
      usefulLifeYears: 5,
      residualValue: 6000000,
      treatmentName: 'Depilación Láser Diodo',
      pricePerSession: 180000,
      variableCostPerSession: 80000,
      monthlySessions: 20,
      monthlyMaintenance: 300000,
      monthlyInsurance: 0
    },
    'radio-credito': {
      acquisitionMode: 'credito',
      equipmentName: 'Radiofrecuencia Fraccionada con Microagujas',
      equipmentPrice: 15000000,
      downPayment: 3000000,
      loanTermMonths: 12,
      interestRatePct: 1.0,
      rateType: 'EM',
      monthlyLoanFees: 0,
      treatmentName: 'Rejuvenecimiento Facial Radiofrecuencia',
      pricePerSession: 220000,
      variableCostPerSession: 65000,
      monthlySessions: 18,
      monthlyMaintenance: 200000,
      monthlyInsurance: 0
    },
    'hifu-leasing': {
      acquisitionMode: 'leasing',
      equipmentName: 'HIFU 7D Facial & Corporal',
      equipmentPrice: 24000000,
      downPayment: 4000000,
      leaseCanon: 1200000,
      leaseTermMonths: 24,
      purchaseOptionAmount: 2400000,
      treatmentName: 'Lifting Facial no Quirúrgico HIFU',
      pricePerSession: 450000,
      variableCostPerSession: 120000,
      monthlySessions: 12,
      monthlyMaintenance: 250000,
      monthlyInsurance: 0
    },
    'crio-alquiler': {
      acquisitionMode: 'alquiler',
      equipmentName: 'Criolipólisis de Placas 360°',
      equipmentPrice: 18000000,
      monthlyRentalFee: 1500000,
      rentalMonths: 12,
      securityDeposit: 3000000,
      treatmentName: 'Moldeo Corporal Criolipólisis',
      pricePerSession: 280000,
      variableCostPerSession: 60000,
      monthlySessions: 15,
      monthlyMaintenance: 100000,
      monthlyInsurance: 0
    }
  };

  document.querySelectorAll('[data-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const k = btn.dataset.preset;
      if (PRESETS[k]) setFormInputs(PRESETS[k]);
    });
  });

  const btnReset = document.getElementById('ap-btn-reset');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      setFormInputs(PRESETS['laser-contado']);
    });
  }

  // Imports
  const btnImportTreatment = document.getElementById('btn-import-from-treatment');
  if (btnImportTreatment) {
    btnImportTreatment.addEventListener('click', () => {
      if (!storage) return;
      const trans = storage.peekTreatmentToAparatologia();
      if (!trans) {
        alert('No se encontraron datos de tratamiento guardados recientemente en la Calculadora de Rentabilidad.');
        return;
      }
      if (confirm(`¿Deseas importar el tratamiento "${trans.treatmentName}" con tarifa de ${fmtCur(trans.pricePerSession)} y costo de ${fmtCur(trans.variableCostPerSession)}?`)) {
        if (elTreatmentName) elTreatmentName.value = trans.treatmentName;
        if (elPriceSession) elPriceSession.value = trans.pricePerSession;
        if (elCostSession) elCostSession.value = trans.variableCostPerSession;
        if (trans.businessName && elBusinessName && !elBusinessName.value) {
          elBusinessName.value = trans.businessName;
        }
        recalculate();
        alert('¡Datos de tratamiento importados exitosamente!');
      }
    });
  }

  // Operational Capacity Logic & Modal
  function openCapacityModal() {
    if (!storage || !modalCapacity || !modalCapList) return;
    const advList = storage.getSavedAnalyses('capacidad_avanzada') || [];
    const basicList = storage.getSavedAnalyses('capacidad_basica') || [];
    const allList = [...advList, ...basicList];

    modalCapList.innerHTML = '';

    if (allList.length === 0) {
      modalCapList.innerHTML = `
        <div style="background:#FAF8F5;border:1px solid #E2D9CE;border-radius:8px;padding:20px;text-align:center;">
          <p style="font-size:14px;color:var(--ap-charcoal);margin:0 0 10px;font-weight:600;">
            No hay análisis de capacidad guardados
          </p>
          <p style="font-size:12px;color:var(--ap-muted);line-height:1.5;margin:0 0 16px;">
            Puedes crear uno en el Simulador de Capacidad Instalada para analizar la viabilidad de tu equipo con tus recursos reales (cabinas, profesionales y horarios).
          </p>
          <a href="../capacidad-instalada/" class="btn btn--sm btn--primary" style="display:inline-block;text-decoration:none;">
            Ir al Simulador de Capacidad Instalada →
          </a>
        </div>
      `;
    } else {
      const listHtml = document.createElement('div');
      listHtml.style.display = 'flex';
      listHtml.style.flexDirection = 'column';
      listHtml.style.gap = '8px';

      allList.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'cap-import-item';
        const isAdv = item.toolKey === 'capacidad_avanzada';
        const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
        const bName = item.businessName || 'Centro';
        const staffCount = isAdv ? (item.inputs?.professionals?.length || 0) : (item.inputs?.professionals || 1);
        const cabinCount = isAdv ? (item.inputs?.cabins?.length || 0) : (item.inputs?.noCabinLimit ? 'Sin límite' : (item.inputs?.cabins || 1));

        itemCard.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px;">
            <strong style="color:var(--ap-charcoal);font-size:13px;">${item.name || 'Sin título'}</strong>
            <span style="font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;background:${isAdv ? '#EDE8DF' : '#F1F5F9'};color:${isAdv ? 'var(--ap-burgundy)' : '#475569'};">
              ${isAdv ? 'Modo Avanzado' : 'Modo Básico'}
            </span>
          </div>
          <div style="font-size:11px;color:var(--ap-muted);display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px;">
            <span>${bName} · ${staffCount} prof. · ${cabinCount} cabinas</span>
            <span>${dateStr}</span>
          </div>
        `;

        itemCard.addEventListener('click', () => {
          importCapacityAnalysis(item);
          closeCapacityModal();
        });

        listHtml.appendChild(itemCard);
      });

      modalCapList.appendChild(listHtml);
    }

    modalCapacity.style.display = 'flex';
  }

  function closeCapacityModal() {
    if (modalCapacity) modalCapacity.style.display = 'none';
  }

  if (btnCloseCapModal) {
    btnCloseCapModal.addEventListener('click', closeCapacityModal);
  }
  if (modalCapacity) {
    modalCapacity.addEventListener('click', (e) => {
      if (e.target === modalCapacity) closeCapacityModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalCapacity && modalCapacity.style.display === 'flex') {
      closeCapacityModal();
    }
  });

  const btnImportCapacity = document.getElementById('btn-import-from-capacity');
  if (btnImportCapacity) {
    btnImportCapacity.addEventListener('click', () => {
      openCapacityModal();
    });
  }

  function importCapacityAnalysis(item) {
    if (!item || !item.inputs) return;

    // Clon profundo para garantizar inmutabilidad absoluta del análisis original (Prueba F)
    activeCapacityConfig = JSON.parse(JSON.stringify(item.inputs));
    activeCapacityMeta = {
      id: item.id,
      name: item.name,
      toolKey: item.toolKey,
      businessName: item.businessName || ''
    };

    if (item.businessName && elBusinessName && !elBusinessName.value.trim()) {
      elBusinessName.value = item.businessName;
    }
    if (item.currency && currencyPicker) {
      currencyPicker.setSelectedCurrency(item.currency);
    }

    if (elOpCenterBadge) {
      elOpCenterBadge.textContent = item.name || 'Capacidad';
    }
    if (elOpCenterSummary) {
      const isAdv = item.toolKey === 'capacidad_avanzada';
      elOpCenterSummary.textContent = `${isAdv ? 'Modo Avanzado' : 'Modo Básico'} · ${item.businessName || 'Tu Centro'} · ${activeCapacityConfig.daysPerMonth || activeCapacityConfig.monthlyDays || 22} días/mes`;
    }

    let staffList = Array.isArray(activeCapacityConfig.professionals) ? activeCapacityConfig.professionals : [];
    if (staffList.length === 0 && (typeof activeCapacityConfig.professionals === 'number' || typeof activeCapacityConfig.dailyHours === 'number')) {
      const num = Math.max(1, parseInt(activeCapacityConfig.professionals, 10) || 1);
      staffList = [];
      for (let i = 1; i <= num; i++) {
        staffList.push({ id: `p${i}`, name: `Profesional ${i}`, startHour: 9, endHour: 17 });
      }
    }

    if (elOpStaffCheckboxes) {
      elOpStaffCheckboxes.innerHTML = '';
      staffList.forEach(s => {
        const lbl = document.createElement('label');
        lbl.style.cssText = 'display:flex;align-items:center;gap:6px;cursor:pointer;';
        lbl.innerHTML = `<input type="checkbox" class="ap-staff-check" value="${s.id}" checked> <span>${s.name} <small style="color:#64748B;">(${s.startHour || 9}:00-${s.endHour || 18}:00)</small></span>`;
        elOpStaffCheckboxes.appendChild(lbl);
      });
    }

    let cabinList = Array.isArray(activeCapacityConfig.cabins) ? activeCapacityConfig.cabins : [];
    if (cabinList.length === 0 && (typeof activeCapacityConfig.cabins === 'number' || activeCapacityConfig.noCabinLimit)) {
      const num = activeCapacityConfig.noCabinLimit ? 5 : Math.max(1, parseInt(activeCapacityConfig.cabins, 10) || 1);
      cabinList = [];
      for (let i = 1; i <= num; i++) {
        cabinList.push({ id: `c${i}`, name: `Cabina ${i}`, startHour: 9, endHour: 18 });
      }
    }

    if (elOpCabinsCheckboxes) {
      elOpCabinsCheckboxes.innerHTML = '';
      cabinList.forEach(c => {
        const lbl = document.createElement('label');
        lbl.style.cssText = 'display:flex;align-items:center;gap:6px;cursor:pointer;';
        lbl.innerHTML = `<input type="checkbox" class="ap-cabin-check" value="${c.id}" checked> <span>${c.name}</span>`;
        elOpCabinsCheckboxes.appendChild(lbl);
      });
    }

    const existingEq = Array.isArray(activeCapacityConfig.equipment) ? activeCapacityConfig.equipment : [];
    if (elOpAuxEquip && elOpAuxContainer) {
      elOpAuxEquip.innerHTML = '<option value="">Ninguno (solo utiliza el nuevo equipo)</option>';
      if (existingEq.length > 0) {
        existingEq.forEach(eq => {
          const opt = document.createElement('option');
          opt.value = eq.id;
          opt.textContent = `${eq.name} (${eq.units || 1} un.)`;
          elOpAuxEquip.appendChild(opt);
        });
        elOpAuxContainer.style.display = 'block';
      } else {
        elOpAuxContainer.style.display = 'none';
      }
    }

    if (elOpConfigCard) elOpConfigCard.style.display = 'block';

    bindOperationalListeners();

    manualDemandSessions = parseInt(elMonthlySessions?.value, 10) || 20;
    usingFeasibleSessions = false;

    recalculateOperational();
    recalculate();
  }

  function bindOperationalListeners() {
    const opInputs = [elOpUnits, elOpDuration, elOpCleanup, elOpStaffCount, elOpAuxEquip];
    opInputs.forEach(el => {
      if (el) {
        el.removeEventListener('input', onOpInputChange);
        el.removeEventListener('change', onOpInputChange);
        el.addEventListener('input', onOpInputChange);
        el.addEventListener('change', onOpInputChange);
      }
    });

    document.querySelectorAll('.ap-staff-check, .ap-cabin-check').forEach(chk => {
      chk.removeEventListener('change', onOpInputChange);
      chk.addEventListener('change', onOpInputChange);
    });
  }

  function onOpInputChange() {
    recalculateOperational();
    if (usingFeasibleSessions && currentOperationalResult) {
      if (elMonthlySessions) elMonthlySessions.value = currentOperationalResult.feasibleSessions;
      recalculate();
    }
  }

  function recalculateOperational() {
    if (!activeCapacityConfig || !engine || typeof engine.evaluateOperationalViability !== 'function') {
      if (elOpViabilityCard) elOpViabilityCard.style.display = 'none';
      currentOperationalResult = null;
      return null;
    }

    const compatibleStaffIds = Array.from(document.querySelectorAll('.ap-staff-check:checked')).map(c => c.value);
    const compatibleCabinIds = Array.from(document.querySelectorAll('.ap-cabin-check:checked')).map(c => c.value);

    const equipmentParams = {
      equipmentName: elEquipmentName?.value || 'Aparatología',
      treatmentName: elTreatmentName?.value || 'Tratamiento',
      units: parseInt(elOpUnits?.value, 10) || 1,
      durationMinutes: parseInt(elOpDuration?.value, 10) || 60,
      setupCleanupMinutes: parseInt(elOpCleanup?.value, 10) || 0,
      requiredStaffCount: parseInt(elOpStaffCount?.value, 10) || 1,
      compatibleStaffIds,
      compatibleCabinIds,
      auxiliaryEquipmentId: elOpAuxEquip?.value || null,
      monthlyDemandSessions: usingFeasibleSessions ? manualDemandSessions : (parseInt(elMonthlySessions?.value, 10) || 0)
    };

    currentOperationalResult = engine.evaluateOperationalViability(
      activeCapacityConfig,
      equipmentParams,
      window.GlossCapacityEngine
    );

    if (!currentOperationalResult) {
      if (elOpViabilityCard) elOpViabilityCard.style.display = 'none';
      return null;
    }

    const res = currentOperationalResult;
    if (elOpViabilityCard) elOpViabilityCard.style.display = 'block';

    if (elOpKpiProgrammable) {
      elOpKpiProgrammable.textContent = `${res.programmableCapacity} citas/mes`;
    }
    if (elOpKpiProgSub) {
      elOpKpiProgSub.textContent = `${res.compatibleStaffCount} prof., ${res.compatibleCabinsCount} cabinas (${res.dailyProgrammableCapacity} citas/día)`;
    }
    if (elOpKpiDemand) {
      elOpKpiDemand.textContent = `${res.monthlyDemand} citas/mes`;
    }
    if (elOpKpiFeasible) {
      elOpKpiFeasible.textContent = `${res.feasibleSessions} citas/mes`;
    }
    if (elOpKpiFeasibleSub) {
      if (res.monthlyDemand > res.programmableCapacity) {
        elOpKpiFeasibleSub.textContent = `Capacidad insuficiente (${res.difference} citas no atendibles)`;
        elOpKpiFeasibleSub.style.color = '#991B1B';
      } else {
        elOpKpiFeasibleSub.textContent = `Cubre la demanda (${res.programmableCapacity - res.monthlyDemand} vacantes)`;
        elOpKpiFeasibleSub.style.color = 'var(--ap-burgundy)';
      }
    }

    if (elOpMetricHours) {
      const totalMinutes = res.feasibleSessions * (res.durationMinutes + res.setupCleanupMinutes);
      elOpMetricHours.textContent = `${(totalMinutes / 60).toFixed(1).replace('.', ',')} h/mes`;
    }
    if (elOpMetricDiff) {
      if (res.difference > 0) {
        elOpMetricDiff.textContent = `+${res.difference} citas superan la capacidad`;
        elOpMetricDiff.style.color = '#991B1B';
      } else {
        elOpMetricDiff.textContent = `${Math.abs(res.difference)} citas disponibles de margen`;
        elOpMetricDiff.style.color = '#166534';
      }
    }
    if (elOpMetricBottleneck) {
      elOpMetricBottleneck.textContent = res.bottleneck || 'Recursos equilibrados';
    }

    if (elOpDisplacementAlert && elOpDisplacementDesc) {
      if (res.monthlyDemand > res.programmableCapacity || res.displacedSessions > 0 || !res.isViable) {
        elOpDisplacementAlert.style.display = 'block';
        if (elOpDisplacementTitle) {
          elOpDisplacementTitle.textContent = !res.isViable ? '⚠️ Incompatibilidad Operativa' : '⚠️ Restricción de Capacidad y Desplazamiento';
        }
        elOpDisplacementDesc.textContent = `${res.interpretation} ${res.displacementText || ''}`;
      } else {
        elOpDisplacementAlert.style.display = 'none';
      }
    }

    if (btnApplyFeasible && btnRestoreManual) {
      if (usingFeasibleSessions) {
        btnApplyFeasible.style.display = 'none';
        btnRestoreManual.style.display = 'block';
        if (elOpRestoreVal) elOpRestoreVal.textContent = manualDemandSessions;
      } else {
        btnApplyFeasible.style.display = 'block';
        btnRestoreManual.style.display = 'none';
      }
    }

    return res;
  }

  if (btnApplyFeasible) {
    btnApplyFeasible.addEventListener('click', () => {
      if (!currentOperationalResult) return;
      manualDemandSessions = parseInt(elMonthlySessions?.value, 10) || 20;
      usingFeasibleSessions = true;
      if (elMonthlySessions) elMonthlySessions.value = currentOperationalResult.feasibleSessions;
      recalculate();
      recalculateOperational();
    });
  }

  if (btnRestoreManual) {
    btnRestoreManual.addEventListener('click', () => {
      usingFeasibleSessions = false;
      if (elMonthlySessions) elMonthlySessions.value = manualDemandSessions;
      recalculate();
      recalculateOperational();
    });
  }

  if (btnUnlinkCapacity) {
    btnUnlinkCapacity.addEventListener('click', () => {
      if (usingFeasibleSessions) {
        usingFeasibleSessions = false;
        if (elMonthlySessions) elMonthlySessions.value = manualDemandSessions;
      }
      activeCapacityConfig = null;
      activeCapacityMeta = null;
      currentOperationalResult = null;
      if (elOpConfigCard) elOpConfigCard.style.display = 'none';
      if (elOpViabilityCard) elOpViabilityCard.style.display = 'none';
      recalculate();
    });
  }

  // Export Copiar Resultados
  const btnCopy = document.getElementById('ap-btn-copy');
  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      if (!lastResult) recalculate();
      const bName = elBusinessName?.value || '';
      const modalityTitles = {
        contado: 'Compra de contado',
        credito: 'Crédito bancario',
        proveedor: 'Financiación de proveedor',
        leasing: 'Leasing financiero',
        alquiler: 'Alquiler o Renting'
      };
      const text = reportEngine ? reportEngine.generateAparatologiaClipboard({
        businessName: bName,
        currency: currencyPicker ? currencyPicker.getSelectedCurrency() : 'COP',
        aparatologia: {
          ...lastResult,
          acquisitionModeTitle: modalityTitles[currentMode] || currentMode,
          operationalViability: currentOperationalResult
        }
      }) : '';

      if (reportEngine && reportEngine.copyToClipboard) {
        reportEngine.copyToClipboard(text, () => {
          const orig = btnCopy.textContent;
          btnCopy.textContent = '¡Resultados copiados!';
          setTimeout(() => btnCopy.textContent = orig, 2200);
        });
      }
    });
  }

  // Export Descargar PDF Directo
  const btnPdf = document.getElementById('ap-btn-pdf');
  if (btnPdf) {
    btnPdf.addEventListener('click', () => {
      if (!lastResult) recalculate();
      const bName = elBusinessName?.value || '';
      const modalityTitles = {
        contado: 'Compra de contado',
        credito: 'Crédito bancario',
        proveedor: 'Financiación de proveedor',
        leasing: 'Leasing financiero',
        alquiler: 'Alquiler o Renting'
      };
      if (reportEngine && reportEngine.generateAparatologiaPdf) {
        reportEngine.generateAparatologiaPdf({
          businessName: bName,
          currency: currencyPicker ? currencyPicker.getSelectedCurrency() : 'COP',
          aparatologia: {
            ...lastResult,
            acquisitionModeTitle: modalityTitles[currentMode] || currentMode,
            operationalViability: currentOperationalResult
          }
        });
      }
    });
  }

  // =========================================================================
  // CONTROLADOR DEL COMPARADOR FINANCIERO DE APARATOLOGÍA
  // =========================================================================

  // Botones de Horizonte
  document.querySelectorAll('.comp-hz-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.comp-hz-btn').forEach(b => {
        b.classList.remove('active', 'btn--primary');
        b.classList.add('btn--outline');
      });
      btn.classList.add('active', 'btn--primary');
      btn.classList.remove('btn--outline');
      comparisonHorizon = parseInt(btn.dataset.hz, 10);
      const customInp = document.getElementById('comp-custom-hz');
      if (customInp) customInp.value = '';
      recalculateComparator();
    });
  });

  const customHzInp = document.getElementById('comp-custom-hz');
  if (customHzInp) {
    customHzInp.addEventListener('input', () => {
      const val = parseInt(customHzInp.value, 10);
      if (val && val >= 1 && val <= 120) {
        document.querySelectorAll('.comp-hz-btn').forEach(b => {
          b.classList.remove('active', 'btn--primary');
          b.classList.add('btn--outline');
        });
        comparisonHorizon = val;
        recalculateComparator();
      }
    });
  }

  // Checkboxes de Modalidades
  function updateSelectedModalitiesFromUI() {
    const checked = Array.from(document.querySelectorAll('.comp-mode-check:checked')).map(c => c.value);
    selectedModalities = checked;
    recalculateComparator();
  }

  document.querySelectorAll('.comp-mode-check').forEach(chk => {
    chk.addEventListener('change', updateSelectedModalitiesFromUI);
  });

  const btnSelectAll = document.getElementById('comp-btn-select-all');
  if (btnSelectAll) {
    btnSelectAll.addEventListener('click', () => {
      document.querySelectorAll('.comp-mode-check').forEach(c => c.checked = true);
      updateSelectedModalitiesFromUI();
    });
  }

  const btnResetModes = document.getElementById('comp-btn-reset-modes');
  if (btnResetModes) {
    btnResetModes.addEventListener('click', () => {
      document.querySelectorAll('.comp-mode-check').forEach(c => c.checked = true);
      comparisonHorizon = 24;
      document.querySelectorAll('.comp-hz-btn').forEach(b => {
        const match = parseInt(b.dataset.hz, 10) === 24;
        b.classList.toggle('active', match);
        b.classList.toggle('btn--primary', match);
        b.classList.toggle('btn--outline', !match);
      });
      const customInp = document.getElementById('comp-custom-hz');
      if (customInp) customInp.value = '';
      updateSelectedModalitiesFromUI();
    });
  }

  // Exportar Copia al Portapapeles
  const btnCompCopy = document.getElementById('comp-btn-copy');
  const compFeedbackMsg = document.getElementById('comp-feedback-msg');
  if (btnCompCopy) {
    btnCompCopy.addEventListener('click', () => {
      if (!lastComparisonResult) recalculateComparator();
      const bName = elBusinessName?.value || '';
      const text = reportEngine ? reportEngine.generateAparatologiaComparisonClipboard({
        businessName: bName,
        currency: currencyPicker ? currencyPicker.getSelectedCurrency() : 'COP',
        comparison: lastComparisonResult
      }) : '';

      if (reportEngine && reportEngine.copyToClipboard) {
        reportEngine.copyToClipboard(text, () => {
          const orig = btnCompCopy.textContent;
          btnCompCopy.textContent = '¡Comparativa copiada!';
          if (compFeedbackMsg) {
            compFeedbackMsg.style.display = 'block';
            compFeedbackMsg.style.background = '#F0FDF4';
            compFeedbackMsg.style.border = '1px solid #BBF7D0';
            compFeedbackMsg.style.color = '#166534';
            compFeedbackMsg.textContent = '✓ Resumen comparativo copiado al portapapeles con éxito.';
            setTimeout(() => { compFeedbackMsg.style.display = 'none'; }, 3000);
          }
          setTimeout(() => btnCompCopy.textContent = orig, 2200);
        });
      }
    });
  }

  // Exportar PDF Directo
  const btnCompPdf = document.getElementById('comp-btn-pdf');
  if (btnCompPdf) {
    btnCompPdf.addEventListener('click', () => {
      if (!lastComparisonResult) recalculateComparator();
      const bName = elBusinessName?.value || '';
      if (reportEngine && reportEngine.generateAparatologiaComparisonPdf) {
        reportEngine.generateAparatologiaComparisonPdf({
          businessName: bName,
          currency: currencyPicker ? currencyPicker.getSelectedCurrency() : 'COP',
          comparison: lastComparisonResult
        });
      }
    });
  }

  // 6. CONSUMIR TRANSFERENCIAS DE DATOS ENTRE HERRAMIENTAS
  if (storage) {
    const stagedTreat = storage.consumeTreatmentToAparatologia();
    if (stagedTreat) {
      if (elEquipmentName && stagedTreat.treatmentName) {
        elEquipmentName.value = 'Equipo para ' + stagedTreat.treatmentName;
      }
      if (elPriceSession && stagedTreat.pricePerSession) {
        elPriceSession.value = stagedTreat.pricePerSession;
      }
      if (elCostSession && stagedTreat.variableCostPerSession) {
        elCostSession.value = stagedTreat.variableCostPerSession;
      }
      if (elMonthlySessions && stagedTreat.monthlySessions) {
        elMonthlySessions.value = stagedTreat.monthlySessions;
      }
      if (elBusinessName && stagedTreat.businessName) {
        elBusinessName.value = stagedTreat.businessName;
      }
    }

    const stagedCap = storage.consumeCapacityToAparatologia();
    if (stagedCap) {
      if (stagedCap.inputs) {
        importCapacityAnalysis({
          id: 'transferred_' + Date.now(),
          name: stagedCap.name || 'Capacidad Transferida',
          toolKey: stagedCap.toolKey || 'capacidad_avanzada',
          businessName: stagedCap.businessName,
          currency: stagedCap.currency,
          inputs: stagedCap.inputs
        });
      }
      if (elMonthlySessions && stagedCap.sessionsPerMonth) {
        elMonthlySessions.value = stagedCap.sessionsPerMonth;
      }
      if (elPriceSession && stagedCap.sessionPrice) {
        elPriceSession.value = stagedCap.sessionPrice;
      }
      if (elEquipmentName && stagedCap.equipmentName) {
        elEquipmentName.value = stagedCap.equipmentName;
      }
      if (elBusinessName && stagedCap.businessName) {
        elBusinessName.value = stagedCap.businessName;
      }
    }
  }

  // Initial Calculation
  recalculate();
});
