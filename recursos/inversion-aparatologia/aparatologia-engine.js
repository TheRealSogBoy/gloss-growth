/**
 * GLOSS & GROWTH — CALCULADORA DE INVERSIÓN EN APARATOLOGÍA
 * Motor analítico y financiero puro.
 *
 * Especializado para clínicas estéticas, spas, consultorios y centros de medicina estética.
 *
 * Principios:
 * 1. Separación estricta entre costos de adquisición, gastos fijos y costos variables.
 * 2. Soporte de 5 modalidades reales de adquisición: Contado, Crédito, Proveedor, Leasing y Alquiler.
 * 3. Conversión matemática rigurosa de tasas (EA a EM, sin divisiones simples espurias).
 * 4. Amortización francesa con soporte de cuotas extraordinarias (balloon payments).
 * 5. Diferenciación de recuperación simple de la inversión vs. recuperación del capital aportado (Equity Payback).
 * 6. Depreciación contable lineal tratada de forma independiente al flujo de caja efectivo.
 * 7. Cero promesas comerciales; diagnóstico en 3 partes basado en hechos numéricos.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.GlossAparatologiaEngine = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function parseNumber(val) {
    if (val === null || val === undefined || val === '') return 0;
    if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
    let str = String(val).trim().replace(/[\$\u20AC\s]/g, '').replace(/COP/gi, '').replace(/[^\d.,]/g, '');
    if (!str) return 0;
    if ((str.match(/\./g) || []).length > 1) str = str.replace(/\./g, '').replace(',', '.');
    else if ((str.match(/,/g) || []).length > 1) str = str.replace(/,/g, '');
    else if (str.includes('.') && str.includes(',')) {
      str = str.lastIndexOf('.') > str.lastIndexOf(',') ? str.replace(/,/g, '') : str.replace(/\./g, '').replace(',', '.');
    } else if (str.includes('.') && str.split('.')[1].length === 3) str = str.replace(/\./g, '');
    else if (str.includes(',') && str.split(',')[1].length === 3) str = str.replace(/,/g, '');
    else if (str.includes(',')) str = str.replace(',', '.');
    const n = parseFloat(str);
    return Number.isFinite(n) ? n : 0;
  }

  function formatPct(val, decimals = 1) {
    if (val === null || val === undefined || !Number.isFinite(val)) return '—%';
    return val.toFixed(decimals).replace('.', ',') + '%';
  }

  function formatDecimal(val, decimals = 2) {
    if (val === null || val === undefined || !Number.isFinite(val)) return '—';
    return val.toFixed(decimals).replace('.', ',');
  }

  /**
   * Conversión rigurosa de tasas de interés
   * @param {number} ratePct - Tasa ingresada (ej. 12 para 12%)
   * @param {'EA'|'EM'|'NA'} rateType - Efectiva Anual, Efectiva Mensual, Nominal Anual Mes Vencido
   */
  function convertToMonthlyRate(ratePct, rateType = 'EM') {
    const r = Math.max(0, ratePct) / 100;
    if (r === 0) return 0;
    if (rateType === 'EM') {
      return r;
    } else if (rateType === 'EA') {
      // i_m = (1 + EA)^(1/12) - 1
      return Math.pow(1 + r, 1 / 12) - 1;
    } else if (rateType === 'NA') {
      // Nominal anual con capitalización mensual: i_m = NA / 12
      return r / 12;
    }
    return r;
  }

  /**
   * Cálculo de amortización francesa (cuota fija)
   */
  function calculateLoanSchedule({ principal, monthlyRate, termMonths, extraFeesPerMonth = 0, balloonPayment = 0 }) {
    const P = Math.max(0, principal);
    const n = Math.max(1, parseInt(termMonths, 10) || 1);
    const i = monthlyRate;
    const fees = Math.max(0, extraFeesPerMonth);
    const balloon = Math.max(0, balloonPayment);

    let baseInstallment = 0;
    if (i === 0) {
      baseInstallment = (P - balloon) / n;
    } else {
      const factor = (1 - Math.pow(1 + i, -n)) / i;
      const pvBalloon = balloon * Math.pow(1 + i, -n);
      baseInstallment = (P - pvBalloon) / factor;
    }

    const totalInstallment = baseInstallment + fees;

    let balance = P;
    let totalInterest = 0;
    let totalPrincipal = 0;
    const schedule = [];

    for (let m = 1; m <= n; m++) {
      const interest = balance * i;
      let principalRepay = baseInstallment - interest;
      if (m === n) {
        principalRepay += balloon;
      }
      balance = Math.max(0, balance - (baseInstallment - interest));
      totalInterest += interest;
      totalPrincipal += (baseInstallment - interest);

      schedule.push({
        month: m,
        payment: totalInstallment + (m === n ? balloon : 0),
        principal: (baseInstallment - interest) + (m === n ? balloon : 0),
        interest: interest,
        fees: fees,
        balance: m === n ? 0 : balance
      });
    }

    return {
      monthlyInstallment: totalInstallment,
      baseInstallment,
      totalInterest,
      totalPrincipal: P,
      totalPaid: (totalInstallment * n) + balloon,
      schedule
    };
  }

  /**
   * Evaluación analítica integral de la inversión
   */
  function evaluateAparatologia(params = {}) {
    // 1. Identificación y adquisición
    const equipmentName = (params.equipmentName || 'Equipo Estético').trim();
    const equipmentPrice = Math.max(0, parseNumber(params.equipmentPrice || 0));
    const installationCost = Math.max(0, parseNumber(params.installationCost || 0));
    const trainingCost = Math.max(0, parseNumber(params.trainingCost || 0));
    const otherInitialCosts = Math.max(0, parseNumber(params.otherInitialCosts || 0));
    const initialOutlayBeforeFinancing = equipmentPrice + installationCost + trainingCost + otherInitialCosts;

    const usefulLifeYears = Math.max(1, parseFloat(params.usefulLifeYears || 5));
    const residualValue = Math.max(0, parseNumber(params.residualValue || 0));

    // Modalidad de adquisición: 'contado', 'credito', 'proveedor', 'leasing', 'alquiler'
    const acquisitionMode = params.acquisitionMode || 'contado';

    let downPayment = initialOutlayBeforeFinancing;
    let financedPrincipal = 0;
    let monthlyFinancePayment = 0;
    let totalFinanceInterest = 0;
    let totalAcquisitionCost = initialOutlayBeforeFinancing;
    let loanSchedule = null;

    if (acquisitionMode === 'contado') {
      downPayment = initialOutlayBeforeFinancing;
      financedPrincipal = 0;
      monthlyFinancePayment = 0;
      totalFinanceInterest = 0;
      totalAcquisitionCost = initialOutlayBeforeFinancing;
    } else if (acquisitionMode === 'credito' || acquisitionMode === 'proveedor') {
      const explicitDownPayment = Math.max(0, parseNumber(params.downPayment || 0));
      downPayment = explicitDownPayment + installationCost + trainingCost + otherInitialCosts;
      financedPrincipal = Math.max(0, equipmentPrice - explicitDownPayment);

      const term = Math.max(1, parseInt(params.loanTermMonths || 12, 10));
      const rateType = params.rateType || 'EM';
      const inputRate = parseFloat(params.interestRatePct || 0);
      const monthlyRate = convertToMonthlyRate(inputRate, rateType);
      const extraFees = Math.max(0, parseNumber(params.monthlyLoanFees || 0));
      const balloon = Math.max(0, parseNumber(params.balloonPayment || 0));

      loanSchedule = calculateLoanSchedule({
        principal: financedPrincipal,
        monthlyRate,
        termMonths: term,
        extraFeesPerMonth: extraFees,
        balloonPayment: balloon
      });

      monthlyFinancePayment = loanSchedule.monthlyInstallment;
      totalFinanceInterest = loanSchedule.totalInterest;
      totalAcquisitionCost = downPayment + loanSchedule.totalPaid;
    } else if (acquisitionMode === 'leasing') {
      const initialLeasePayment = Math.max(0, parseNumber(params.downPayment || 0));
      downPayment = initialLeasePayment + installationCost + trainingCost + otherInitialCosts;
      const periodicCanon = Math.max(0, parseNumber(params.leaseCanon || 0));
      const leaseTerm = Math.max(1, parseInt(params.leaseTermMonths || 24, 10));
      const purchaseOption = Math.max(0, parseNumber(params.purchaseOptionAmount || 0));

      monthlyFinancePayment = periodicCanon;
      totalAcquisitionCost = downPayment + (periodicCanon * leaseTerm) + purchaseOption;
    } else if (acquisitionMode === 'alquiler') {
      const securityDeposit = Math.max(0, parseNumber(params.securityDeposit || 0));
      downPayment = securityDeposit + installationCost + trainingCost;
      const rentalFee = Math.max(0, parseNumber(params.monthlyRentalFee || 0));
      monthlyFinancePayment = rentalFee;
      const rentalHorizon = Math.max(1, parseInt(params.rentalMonths || 12, 10));
      totalAcquisitionCost = (rentalFee * rentalHorizon) + installationCost + trainingCost;
    }

    // 2. Operación del equipo
    const treatmentName = (params.treatmentName || 'Tratamiento con aparatología').trim();
    const pricePerSession = Math.max(0, parseNumber(params.pricePerSession || 0));
    const variableCostPerSession = Math.max(0, parseNumber(params.variableCostPerSession || 0));
    const contributionPerSession = pricePerSession - variableCostPerSession;
    const marginPct = pricePerSession > 0 ? (contributionPerSession / pricePerSession) * 100 : 0;

    const monthlySessions = Math.max(0, parseNumber(params.monthlySessions || 0));
    const monthlyRevenue = monthlySessions * pricePerSession;
    const monthlyVariableCost = monthlySessions * variableCostPerSession;
    const monthlyContribution = monthlySessions * contributionPerSession;

    // Costos incrementales fijos del equipo
    const monthlyMaintenance = Math.max(0, parseNumber(params.monthlyMaintenance || 0));
    const monthlyInsurance = Math.max(0, parseNumber(params.monthlyInsurance || 0));
    const monthlyOtherFixed = Math.max(0, parseNumber(params.monthlyOtherFixed || 0));
    const totalIncrementalFixed = monthlyMaintenance + monthlyInsurance + monthlyOtherFixed;

    // Resultado operativo mensual incremental antes de pagos financieros
    const operatingResultBeforeFinance = monthlyContribution - totalIncrementalFixed;

    // Flujo de caja neto estimado tras cuota de financiación/leasing/alquiler
    const netCashFlowAfterFinance = operatingResultBeforeFinance - monthlyFinancePayment;

    // 3. Puntos de equilibrio en sesiones
    let breakevenSessionsFixed = 0;
    if (contributionPerSession > 0) {
      breakevenSessionsFixed = Math.ceil(totalIncrementalFixed / contributionPerSession);
    }

    let breakevenSessionsWithFinance = 0;
    if (contributionPerSession > 0) {
      breakevenSessionsWithFinance = Math.ceil((totalIncrementalFixed + monthlyFinancePayment) / contributionPerSession);
    }

    // 4. Plazos de Recuperación (Payback)
    let simplePaybackMonths = null;
    let simplePaybackFormatted = 'No se recupera en el horizonte analizado';
    if (operatingResultBeforeFinance > 0) {
      simplePaybackMonths = initialOutlayBeforeFinancing / operatingResultBeforeFinance;
      simplePaybackFormatted = `${simplePaybackMonths.toFixed(1).replace('.', ',')} meses`;
    }

    let equityPaybackMonths = null;
    let equityPaybackFormatted = 'No se recupera en el horizonte analizado';
    if (downPayment > 0 && netCashFlowAfterFinance > 0) {
      equityPaybackMonths = downPayment / netCashFlowAfterFinance;
      equityPaybackFormatted = `${equityPaybackMonths.toFixed(1).replace('.', ',')} meses`;
    } else if (downPayment === 0 && netCashFlowAfterFinance > 0) {
      equityPaybackFormatted = 'Inmediato (sin desembolso inicial)';
    }

    // 5. Depreciación lineal contable (apartado avanzado opcional)
    const depreciableCost = Math.max(0, equipmentPrice - residualValue);
    const annualDepreciation = depreciableCost / usefulLifeYears;
    const monthlyDepreciation = annualDepreciation / 12;

    // 6. Escenarios de demanda
    const demandScenarios = [
      { label: 'Demanda baja (−30%)', sessions: Math.round(monthlySessions * 0.7) },
      { label: 'Demanda esperada (Base)', sessions: Math.round(monthlySessions) },
      { label: 'Demanda alta (+30%)', sessions: Math.round(monthlySessions * 1.3) }
    ].map(sc => {
      const rev = sc.sessions * pricePerSession;
      const contrib = sc.sessions * contributionPerSession;
      const opRes = contrib - totalIncrementalFixed;
      const cashFlow = opRes - monthlyFinancePayment;
      const pb = opRes > 0 ? (initialOutlayBeforeFinancing / opRes).toFixed(1).replace('.', ',') + ' m' : 'No recupera';
      return {
        label: sc.label,
        sessions: sc.sessions,
        revenue: rev,
        contribution: contrib,
        operatingResult: opRes,
        netCashFlow: cashFlow,
        payback: pb
      };
    });

    // 7. Diagnóstico e Interpretación Determinista en 3 partes
    let hecho = '';
    let significado = '';
    let recomendacion = '';

    if (contributionPerSession <= 0 && pricePerSession > 0) {
      hecho = `Los costos variables por sesión superan o igualan el precio de venta cobrado (${pricePerSession}).`;
      significado = 'Cada sesión realizada con este equipo genera una pérdida operativa directa antes de pagar mantenimiento o financiación.';
      recomendacion = 'Revisa inmediatamente la tarifa al público y los costos de consumibles, agujas o cabezales antes de adquirir o utilizar la máquina.';
    } else if (operatingResultBeforeFinance < 0) {
      hecho = `La contribución mensual esperada (${monthlyContribution}) no alcanza a cubrir el mantenimiento e insumos fijos (${totalIncrementalFixed}), arrojando un déficit operativo de ${Math.abs(operatingResultBeforeFinance)}.`;
      significado = 'Con el volumen actual de sesiones, el equipo no cubre sus gastos fijos de funcionamiento aunque se pague de contado.';
      recomendacion = `Se requieren al menos ${breakevenSessionsFixed} sesiones mensuales exclusivas para absorber los costos fijos del equipo.`;
    } else if (netCashFlowAfterFinance < 0) {
      hecho = `El equipo genera un resultado operativo positivo antes de deuda (${operatingResultBeforeFinance}), pero la cuota de financiación o alquiler (${monthlyFinancePayment}) supera dicho excedente en ${Math.abs(netCashFlowAfterFinance)} mensuales.`;
      significado = 'Aunque el tratamiento es rentable en cabina, el servicio de deuda presiona negativamente la caja mensual de la clínica.';
      recomendacion = `Para evitar tensión de liquidez requieres comercializar al menos ${breakevenSessionsWithFinance} sesiones al mes o negociar un plazo de amortización más amplio.`;
    } else {
      hecho = `El equipo aporta ${monthlyContribution} de margen mensual (${marginPct.toFixed(1).replace('.', ',')}% por sesión), dejando un flujo de caja libre positivo de ${netCashFlowAfterFinance} tras cubrir mantenimiento y pagos financieros.`;
      significado = `La inversión presenta viabilidad operativa y financiera bajo los supuestos ingresados, con un plazo de amortización del capital propio de ${equityPaybackFormatted}.`;
      recomendacion = 'Verifica que la demanda estimada sea consistente con la capacidad instalada y la agenda de tus especialistas.';
    }

    return {
      equipmentName,
      equipmentPrice,
      installationCost,
      trainingCost,
      otherInitialCosts,
      initialOutlayBeforeFinancing,
      acquisitionMode,
      downPayment,
      financedPrincipal,
      monthlyFinancePayment,
      totalFinanceInterest,
      totalAcquisitionCost,
      loanSchedule,
      treatmentName,
      pricePerSession,
      variableCostPerSession,
      contributionPerSession,
      marginPct,
      monthlySessions,
      monthlyRevenue,
      monthlyVariableCost,
      monthlyContribution,
      totalIncrementalFixed,
      monthlyMaintenance,
      monthlyInsurance,
      monthlyOtherFixed,
      operatingResultBeforeFinance,
      netCashFlowAfterFinance,
      breakevenSessionsFixed,
      breakevenSessionsWithFinance,
      simplePaybackMonths,
      simplePaybackFormatted,
      equityPaybackMonths,
      equityPaybackFormatted,
      usefulLifeYears,
      residualValue,
      depreciableCost,
      annualDepreciation,
      monthlyDepreciation,
      demandScenarios,
      interpretation: {
        hecho,
        significado,
        recomendacion
      }
    };
  }

  // =========================================================================
  // INTEGRACIÓN AVANZADA: CAPACIDAD OPERATIVA DE EQUIPO
  // =========================================================================

  function getCapEngine(engineArg) {
    if (engineArg) return engineArg;
    if (typeof window !== 'undefined' && window.GlossCapacidadEngine) {
      return window.GlossCapacidadEngine;
    }
    if (typeof require !== 'undefined') {
      try {
        return require('../capacidad-instalada/capacidad-engine.js');
      } catch (e) {
        try {
          return require('c:/Users/santi/OneDrive/Escritorio/GLOSS & GROWTH/Pagina Web Gloss Growth/gloss-web-expansion-preview/recursos/capacidad-instalada/capacidad-engine.js');
        } catch (e2) {}
      }
    }
    return null;
  }

  function evaluateOperationalViability(importedConfig, equipmentParams = {}, capEngineOverride = null) {
    if (!importedConfig || typeof importedConfig !== 'object') {
      return null;
    }

    const capEngine = getCapEngine(capEngineOverride);
    if (!capEngine || typeof capEngine.calculateAdvancedCapacity !== 'function') {
      console.warn('GlossAparatologiaEngine: Motor de capacidad avanzada no disponible.');
      return null;
    }

    // Clon profundo para garantizar inmutabilidad absoluta del análisis original (Prueba F)
    const config = JSON.parse(JSON.stringify(importedConfig));
    let staff = Array.isArray(config.professionals) ? config.professionals : [];
    let cabins = Array.isArray(config.cabins) ? config.cabins : [];
    const existingEquipment = Array.isArray(config.equipment) ? config.equipment : [];
    const packages = Array.isArray(config.packages) ? config.packages : [];
    const treatments = Array.isArray(config.treatments) ? config.treatments : [];

    let isBasicDerived = false;
    if (staff.length === 0 && (typeof config.professionals === 'number' || typeof config.dailyHours === 'number')) {
      isBasicDerived = true;
      const numStaff = Math.max(1, parseInt(config.professionals, 10) || 1);
      const dailyHours = Math.max(1, parseFloat(config.dailyHours) || 8);
      const startHour = 9;
      const endHour = startHour + dailyHours;
      staff = [];
      for (let i = 1; i <= numStaff; i++) {
        staff.push({ id: `p${i}`, name: `Profesional ${i}`, startHour, endHour, pauseStart: 0, pauseEnd: 0 });
      }
      const numCabins = config.noCabinLimit ? 99 : Math.max(1, parseInt(config.cabins, 10) || 1);
      cabins = [];
      for (let i = 1; i <= numCabins; i++) {
        cabins.push({ id: `c${i}`, name: `Cabina ${i}`, startHour, endHour });
      }
    }

    const daysPerMonth = Math.max(1, parseInt(config.daysPerMonth || config.monthlyDays, 10) || 22);
    const cancellationPct = Math.max(0, Math.min(100, parseFloat(config.cancellationsPct || config.cancellationPct) || 0));
    const gridInterval = Math.max(5, parseInt(config.gridIntervalMinutes, 10) || 15);

    const equipmentName = (equipmentParams.equipmentName || 'Nuevo Equipo').trim();
    const treatmentName = (equipmentParams.treatmentName || 'Tratamiento con ' + equipmentName).trim();
    const units = Math.max(1, parseInt(equipmentParams.units, 10) || 1);
    const durationMinutes = Math.max(15, parseInt(equipmentParams.durationMinutes, 10) || 60);
    const setupCleanupMinutes = Math.max(0, parseInt(equipmentParams.setupCleanupMinutes, 10) || 0);
    const requiredStaffCount = Math.max(1, parseInt(equipmentParams.requiredStaffCount, 10) || 1);
    const monthlyDemand = Math.max(0, parseInt(equipmentParams.monthlyDemandSessions, 10) || 0);

    // Compatibilidades explícitas declaradas por el usuario (Principio 2)
    const compatibleStaffIds = Array.isArray(equipmentParams.compatibleStaffIds)
      ? equipmentParams.compatibleStaffIds
      : staff.map(s => s.id);
    const compatibleCabinIds = Array.isArray(equipmentParams.compatibleCabinIds)
      ? equipmentParams.compatibleCabinIds
      : cabins.map(c => c.id);

    const compatibleStaffList = staff.filter(s => compatibleStaffIds.includes(s.id));
    const compatibleCabinsList = cabins.filter(c => compatibleCabinIds.includes(c.id));

    const hypoEqId = 'eq_hypo_eval';
    const hypoTreatId = 't_hypo_eval';

    let effectiveUnits = units;
    let eqStartHour = 0;
    let eqEndHour = 24;
    let auxEquipmentName = null;

    if (equipmentParams.auxiliaryEquipmentId) {
      const aux = existingEquipment.find(e => e.id === equipmentParams.auxiliaryEquipmentId);
      if (aux) {
        auxEquipmentName = aux.name;
        effectiveUnits = Math.min(units, Math.max(1, parseInt(aux.units, 10) || 1));
        if (aux.startHour !== undefined) eqStartHour = aux.startHour;
        if (aux.endHour !== undefined) eqEndHour = aux.endHour;
      }
    }

    // Equipo hipotético en evaluación
    const simEquipment = existingEquipment.map(e => ({ ...e }));
    simEquipment.push({
      id: hypoEqId,
      name: equipmentName,
      units: effectiveUnits,
      startHour: eqStartHour,
      endHour: eqEndHour
    });

    // Asignación estricta de tratamientos compatibles
    const simStaff = staff.map(s => ({
      ...s,
      allowedTreatments: compatibleStaffIds.includes(s.id) ? [hypoTreatId] : []
    }));

    const simCabins = cabins.map(c => ({
      ...c,
      allowedTreatments: compatibleCabinIds.includes(c.id) ? [hypoTreatId] : []
    }));

    const simTreatments = [{
      id: hypoTreatId,
      name: treatmentName,
      durationMinutes,
      setupCleanupMinutes,
      requiredStaffCount,
      requiredEquipmentId: hypoEqId,
      price: 0
    }];

    // Casos de incompatibilidad (Pruebas A y B)
    if (compatibleStaffList.length < requiredStaffCount || compatibleCabinsList.length === 0) {
      let reason = '';
      if (compatibleStaffList.length === 0) {
        reason = 'Ningún profesional existente fue habilitado para este tratamiento.';
      } else if (compatibleStaffList.length < requiredStaffCount) {
        reason = `El tratamiento requiere ${requiredStaffCount} profesional(es) simultáneo(s), pero solo ${compatibleStaffList.length} fue(ron) habilitado(s).`;
      } else {
        reason = 'Ninguna cabina existente fue declarada compatible con este tratamiento.';
      }

      return {
        isViable: false,
        businessName: config.businessName || 'Tu Centro',
        equipmentName,
        treatmentName,
        units,
        durationMinutes,
        setupCleanupMinutes,
        requiredStaffCount,
        daysPerMonth,
        cancellationPct,
        compatibleStaffCount: compatibleStaffList.length,
        totalStaffCount: staff.length,
        compatibleStaffNames: compatibleStaffList.map(s => s.name).join(', ') || 'Ninguno',
        compatibleCabinsCount: compatibleCabinsList.length,
        totalCabinsCount: cabins.length,
        compatibleCabinsNames: compatibleCabinsList.map(c => c.name).join(', ') || 'Ninguna',
        dailyProgrammableCapacity: 0,
        programmableCapacity: 0,
        monthlyDemand,
        difference: monthlyDemand,
        feasibleSessions: 0,
        effectiveAttendedFeasible: 0,
        bottleneck: reason,
        displacementCalculable: false,
        displacedSessions: 0,
        displacementText: 'No es posible programar sesiones bajo la compatibilidad actual.',
        interpretation: reason
      };
    }

    // Simulación del motor avanzado existente (Principio 3)
    const simResult = capEngine.calculateAdvancedCapacity({
      gridIntervalMinutes: gridInterval,
      daysPerMonth,
      cancellationsPct: cancellationPct,
      treatments: simTreatments,
      professionals: simStaff,
      cabins: simCabins,
      equipment: simEquipment,
      packages: []
    });

    const dailyCapacity = simResult.dailyAppointments || 0;
    const programmableCapacity = simResult.monthlyCapacity || 0;

    // Análisis de compromisos previos y recursos compartidos (Principio 5)
    const bookedPending = packages.reduce((acc, p) => acc + (p.bookedSessions || p.bookedPendingSessions || 0), 0);
    const targetMonthlyOther = treatments.reduce((acc, t) => acc + (t.targetMonthlySessions || 0), 0);
    const existingCommitments = bookedPending > 0 ? bookedPending : targetMonthlyOther;

    let displacementCalculable = false;
    let displacedSessions = 0;
    let displacementText = '';

    if (existingCommitments > 0) {
      displacementCalculable = true;
      const netAvailableSessions = Math.max(0, programmableCapacity - existingCommitments);
      if (monthlyDemand <= netAvailableSessions) {
        displacedSessions = 0;
        displacementText = `Las ${monthlyDemand} sesiones previstas caben en espacios disponibles sin desplazar los ${existingCommitments} compromisos previos registrados.`;
      } else if (monthlyDemand <= programmableCapacity) {
        displacedSessions = monthlyDemand - netAvailableSessions;
        displacementText = `De las ${monthlyDemand} sesiones previstas, ${netAvailableSessions} caben en espacios libres y ${displacedSessions} podrían competir o desplazar compromisos de otros tratamientos en recursos compartidos.`;
      } else {
        displacedSessions = programmableCapacity - netAvailableSessions;
        const unfeasible = monthlyDemand - programmableCapacity;
        displacementText = `La demanda prevista (${monthlyDemand}) supera la capacidad programable del equipo (${programmableCapacity}). ${unfeasible} citas no caben en el mes y ${displacedSessions} compiten con compromisos existentes.`;
      }
    } else {
      displacementCalculable = false;
      displacedSessions = 0;
      displacementText = 'No hay reservas ni compromisos previos registrados en el análisis importado; se asume disponibilidad sobre los horarios de los recursos compatibles.';
    }

    // Tres métricas obligatorias (Principio 4):
    // 1. Capacidad programable estimada
    // 2. Demanda mensual prevista
    // 3. Sesiones factibles del escenario
    const difference = monthlyDemand - programmableCapacity;
    const feasibleSessions = Math.min(programmableCapacity, monthlyDemand);
    const effectiveAttendedFeasible = Math.round(feasibleSessions * (1 - cancellationPct / 100));

    // Detección de cuello de botella principal
    let bottleneck = simResult.bottleneck || 'Capacidad determinada por disponibilidad de recursos';
    if (auxEquipmentName && effectiveUnits === 1 && (compatibleStaffList.length > 1 || compatibleCabinsList.length > 1)) {
      bottleneck = `Equipo auxiliar compartido (${auxEquipmentName} con 1 unidad): limita la atención a 1 sesión simultánea.`;
    } else if (units === 1 && compatibleStaffList.length > 1 && compatibleCabinsList.length > 1) {
      bottleneck = 'Equipo único (1 unidad): limita la atención a una sesión simultánea aunque existan múltiples cabinas y profesionales.';
    } else if (compatibleStaffList.length < compatibleCabinsList.length) {
      bottleneck = `Personal disponible (${compatibleStaffList.length} profesional(es)) limita la atención frente a las ${compatibleCabinsList.length} cabinas compatibles.`;
    } else if (compatibleCabinsList.length < compatibleStaffList.length) {
      bottleneck = `Espacio físico (${compatibleCabinsList.length} cabina(s)) actúa como límite principal frente a ${compatibleStaffList.length} profesionales disponibles.`;
    }

    // Interpretación sobria y prudente (Regla Editorial Gloss & Growth)
    let interpretation = '';
    if (programmableCapacity === 0) {
      interpretation = 'Los horarios declarados o compatibilidades no permiten programar ninguna cita completa en el mes.';
    } else if (monthlyDemand > programmableCapacity) {
      interpretation = `El equipo permite programar estimativamente hasta ${programmableCapacity} citas mensuales con los recursos compatibles. La demanda proyectada (${monthlyDemand} citas) supera la capacidad disponible en ${difference} citas. Se recomienda usar ${feasibleSessions} citas factibles para el análisis financiero.`;
    } else if (monthlyDemand === 0) {
      interpretation = `Dispones de capacidad programable estimada para hasta ${programmableCapacity} citas al mes con este equipo. Ingresa tu demanda prevista para evaluar la viabilidad financiera.`;
    } else {
      interpretation = `La demanda prevista (${monthlyDemand} citas) cabe completamente dentro de la capacidad programable estimada (${programmableCapacity} citas/mes), dejando ${programmableCapacity - monthlyDemand} espacios disponibles adicionales.`;
    }

    return {
      isViable: true,
      isBasicDerived,
      businessName: config.businessName || 'Tu Centro',
      equipmentName,
      treatmentName,
      units,
      durationMinutes,
      setupCleanupMinutes,
      requiredStaffCount,
      daysPerMonth,
      cancellationPct,
      compatibleStaffCount: compatibleStaffList.length,
      totalStaffCount: staff.length,
      compatibleStaffNames: compatibleStaffList.map(s => s.name).join(', '),
      compatibleCabinsCount: compatibleCabinsList.length,
      totalCabinsCount: cabins.length,
      compatibleCabinsNames: compatibleCabinsList.map(c => c.name).join(', '),
      dailyProgrammableCapacity: dailyCapacity,
      programmableCapacity,
      monthlyDemand,
      difference,
      feasibleSessions,
      effectiveAttendedFeasible,
      bottleneck,
      displacementCalculable,
      displacedSessions,
      displacementText,
      interpretation
    };
  }

  /**
   * COMPARADOR FINANCIERO MULTI-MODALIDAD
   * Evalúa de 2 a 5 modalidades simultáneamente bajo un mismo horizonte temporal (H meses).
   *
   * Principios financieros estrictos:
   * 1. No duplicar préstamos como gasto adicional si están en las cuotas.
   * 2. No restar depreciación del flujo de caja efectivo.
   * 3. No tratar depósito en garantía recuperable como gasto definitivo.
   * 4. No imputar valor residual como ingreso garantizado en caja.
   * 5. Mismo horizonte temporal H para todas las alternativas evaluadas.
   */
  function evaluateModalityComparison(sharedParams = {}, modalityConfigs = {}, horizonMonths = 24, selectedModalities = null) {
    const H = Math.max(1, parseInt(horizonMonths, 10) || 24);

    // Parámetros compartidos del equipo
    const equipmentName = (sharedParams.equipmentName || 'Equipo Estético').trim();
    const equipmentPrice = Math.max(0, parseNumber(sharedParams.equipmentPrice || 0));
    const installationCost = Math.max(0, parseNumber(sharedParams.installationCost || 0));
    const trainingCost = Math.max(0, parseNumber(sharedParams.trainingCost || 0));
    const otherInitialCosts = Math.max(0, parseNumber(sharedParams.otherInitialCosts || 0));
    const totalSetupCost = installationCost + trainingCost + otherInitialCosts;
    const initialOutlayContado = equipmentPrice + totalSetupCost;

    const usefulLifeYears = Math.max(1, parseFloat(sharedParams.usefulLifeYears || 5));
    const residualValue = Math.max(0, parseNumber(sharedParams.residualValue || 0));

    // Operación compartida
    const treatmentName = (sharedParams.treatmentName || 'Tratamiento').trim();
    const pricePerSession = Math.max(0, parseNumber(sharedParams.pricePerSession || 0));
    const variableCostPerSession = Math.max(0, parseNumber(sharedParams.variableCostPerSession || 0));
    const contributionPerSession = pricePerSession - variableCostPerSession;
    const marginPct = pricePerSession > 0 ? (contributionPerSession / pricePerSession) * 100 : 0;

    const monthlySessions = Math.max(0, parseNumber(sharedParams.monthlySessions || 0));
    const monthlyRevenue = monthlySessions * pricePerSession;
    const monthlyContribution = monthlySessions * contributionPerSession;

    const monthlyMaintenance = Math.max(0, parseNumber(sharedParams.monthlyMaintenance || 0));
    const monthlyInsurance = Math.max(0, parseNumber(sharedParams.monthlyInsurance || 0));
    const monthlyOtherFixed = Math.max(0, parseNumber(sharedParams.monthlyOtherFixed || 0));
    const standardMonthlyFixed = monthlyMaintenance + monthlyInsurance + monthlyOtherFixed;
    const standardOperatingResult = monthlyContribution - standardMonthlyFixed;

    // Modalidades activas a comparar (mínimo 2, máximo 5)
    const validModes = ['contado', 'credito', 'proveedor', 'leasing', 'alquiler'];
    let activeModes = Array.isArray(selectedModalities) && selectedModalities.length > 0
      ? selectedModalities.filter(m => validModes.includes(m))
      : ['contado', 'credito', 'proveedor', 'leasing', 'alquiler'];

    if (activeModes.length === 0) {
      activeModes = ['contado', 'credito'];
    }

    const modalityTitles = {
      contado: 'Compra de contado',
      credito: 'Crédito bancario',
      proveedor: 'Financiación proveedor',
      leasing: 'Leasing financiero',
      alquiler: 'Alquiler / Renting'
    };

    const results = {};

    activeModes.forEach(mode => {
      const cfg = modalityConfigs[mode] || {};

      if (mode === 'contado') {
        const initialOutlay = initialOutlayContado;
        const monthlyPayment = 0;
        const totalInterest = 0;
        const totalPaymentsInHorizon = initialOutlay;
        const remainingBalance = 0;
        const ownershipStatus = 'Propiedad total de la clínica desde el desembolso inicial.';
        const attrResidualValue = residualValue;

        const cashFlowSeries = [{ month: 0, netCashFlow: -initialOutlay, cumulativeCashFlow: -initialOutlay }];
        let cum = -initialOutlay;
        for (let m = 1; m <= H; m++) {
          cum += standardOperatingResult;
          cashFlowSeries.push({
            month: m,
            netCashFlow: standardOperatingResult,
            cumulativeCashFlow: cum
          });
        }

        results.contado = {
          id: 'contado',
          title: modalityTitles.contado,
          initialOutlay,
          monthlyPayment,
          monthlyPaymentPost: 0,
          totalFinanceInterest: totalInterest,
          totalPaymentsInHorizon,
          remainingBalance,
          remainingContractText: 'Sin obligaciones pendientes (adquisición de contado liquidada).',
          ownershipStatus,
          residualValue: attrResidualValue,
          monthlyContribution,
          operatingResultBeforeFinance: standardOperatingResult,
          netCashFlowDuringPayments: standardOperatingResult,
          netCashFlowAfterPayments: standardOperatingResult,
          cumulativeCashFlow: cum,
          cashFlowSeries,
          isContractComplete: true,
          contractAlert: null
        };
      } else if (mode === 'credito' || mode === 'proveedor') {
        const isBank = mode === 'credito';
        const explicitDown = Math.max(0, parseNumber(cfg.downPayment !== undefined ? cfg.downPayment : (equipmentPrice * 0.2)));
        const initialOutlay = explicitDown + totalSetupCost;
        const financedPrincipal = Math.max(0, equipmentPrice - explicitDown);
        const term = Math.max(1, parseInt(cfg.loanTermMonths || 12, 10));
        const ratePct = parseFloat(cfg.interestRatePct !== undefined ? cfg.interestRatePct : 1.0);
        const rateType = cfg.rateType || 'EM';
        const monthlyRate = convertToMonthlyRate(ratePct, rateType);
        const fees = Math.max(0, parseNumber(cfg.monthlyLoanFees || 0));
        const balloon = Math.max(0, parseNumber(cfg.balloonPayment || 0));

        const scheduleData = calculateLoanSchedule({
          principal: financedPrincipal,
          monthlyRate,
          termMonths: term,
          extraFeesPerMonth: fees,
          balloonPayment: balloon
        });

        const monthlyPayment = scheduleData.monthlyInstallment;
        let paymentsInHorizon = 0;
        let interestInHorizon = 0;
        let remainingBalance = 0;

        const cashFlowSeries = [{ month: 0, netCashFlow: -initialOutlay, cumulativeCashFlow: -initialOutlay }];
        let cum = -initialOutlay;

        for (let m = 1; m <= H; m++) {
          let inst = 0;
          if (m <= term) {
            const row = scheduleData.schedule[m - 1];
            inst = row.payment;
            paymentsInHorizon += inst;
            interestInHorizon += (row.interest + row.fees);
            if (m === H) {
              remainingBalance = row.balance;
            }
          } else {
            inst = 0;
          }

          const monthlyNet = standardOperatingResult - inst;
          cum += monthlyNet;
          cashFlowSeries.push({
            month: m,
            netCashFlow: monthlyNet,
            cumulativeCashFlow: cum
          });
        }

        if (H >= term) {
          remainingBalance = 0;
        }

        const totalPaymentsInHorizon = initialOutlay + paymentsInHorizon;
        const contractFinishedInHorizon = H >= term;
        let contractAlert = null;
        if (!contractFinishedInHorizon) {
          contractAlert = `El crédito tiene un plazo de ${term} meses que excede el horizonte de ${H} meses. Resta un saldo de capital por amortizar de ${remainingBalance}.`;
        }

        const remainingText = contractFinishedInHorizon
          ? `Crédito cancelado en el mes ${term}. Saldo pendiente: 0.`
          : `Saldo de capital pendiente al mes ${H}: amortización continúa ${term - H} meses adicionales.`;

        results[mode] = {
          id: mode,
          title: modalityTitles[mode],
          initialOutlay,
          monthlyPayment,
          monthlyPaymentPost: 0,
          totalFinanceInterest: interestInHorizon,
          totalPaymentsInHorizon,
          remainingBalance,
          remainingContractText: remainingText,
          ownershipStatus: isBank ? 'Propiedad de la clínica financiada con entidad bancaria.' : 'Propiedad de la clínica financiada directamente por el fabricante.',
          residualValue,
          monthlyContribution,
          operatingResultBeforeFinance: standardOperatingResult,
          netCashFlowDuringPayments: standardOperatingResult - monthlyPayment,
          netCashFlowAfterPayments: standardOperatingResult,
          cumulativeCashFlow: cum,
          cashFlowSeries,
          isContractComplete: contractFinishedInHorizon,
          contractAlert
        };
      } else if (mode === 'leasing') {
        const leaseDown = Math.max(0, parseNumber(cfg.downPayment !== undefined ? cfg.downPayment : (equipmentPrice * 0.1)));
        const initialOutlay = leaseDown + totalSetupCost;
        const canon = Math.max(0, parseNumber(cfg.leaseCanon !== undefined ? cfg.leaseCanon : (equipmentPrice * 0.05)));
        const leaseTerm = Math.max(1, parseInt(cfg.leaseTermMonths || 24, 10));
        const purchaseOption = Math.max(0, parseNumber(cfg.purchaseOptionAmount !== undefined ? cfg.purchaseOptionAmount : (equipmentPrice * 0.1)));
        const exerciseOption = cfg.exercisePurchaseOption !== false;

        let paymentsInHorizon = 0;
        let remainingBalance = 0;
        const cashFlowSeries = [{ month: 0, netCashFlow: -initialOutlay, cumulativeCashFlow: -initialOutlay }];
        let cum = -initialOutlay;

        for (let m = 1; m <= H; m++) {
          let pay = 0;
          if (m <= leaseTerm) {
            pay = canon;
            if (m === leaseTerm && exerciseOption) {
              pay += purchaseOption;
            }
            paymentsInHorizon += pay;
          } else {
            pay = 0;
          }

          let monthlyNet = 0;
          if (m <= leaseTerm || exerciseOption) {
            monthlyNet = standardOperatingResult - pay;
          } else {
            // Si el leasing venció y no se ejerció la opción, el equipo se devolvió
            monthlyNet = 0;
          }

          cum += monthlyNet;
          cashFlowSeries.push({
            month: m,
            netCashFlow: monthlyNet,
            cumulativeCashFlow: cum
          });
        }

        if (H < leaseTerm) {
          remainingBalance = ((leaseTerm - H) * canon) + (exerciseOption ? purchaseOption : 0);
        } else {
          remainingBalance = 0;
        }

        const totalPaymentsInHorizon = initialOutlay + paymentsInHorizon;
        const totalImplicitFinanceCost = Math.max(0, (initialOutlay + (canon * Math.min(H, leaseTerm)) + (H >= leaseTerm && exerciseOption ? purchaseOption : 0)) - equipmentPrice);

        let ownershipStatus = '';
        if (H >= leaseTerm && exerciseOption) {
          ownershipStatus = 'Propiedad transferida a la clínica tras ejercer la opción de compra.';
        } else if (H >= leaseTerm && !exerciseOption) {
          ownershipStatus = 'Equipo devuelto a la entidad financiera (sin opción de compra ejercida).';
        } else {
          ownershipStatus = 'Activo en arrendamiento financiero. Propiedad del banco con opción de compra pendiente.';
        }

        const contractFinishedInHorizon = H >= leaseTerm;
        let contractAlert = null;
        if (!contractFinishedInHorizon) {
          contractAlert = `Contrato de leasing vigente por ${leaseTerm} meses. Al mes ${H} restan ${leaseTerm - H} cánones pactados.`;
        }

        const remainingText = contractFinishedInHorizon
          ? (exerciseOption ? `Contrato culminado con adquisición del activo en el mes ${leaseTerm}.` : `Contrato culminado con restitución del activo.`)
          : `Compromisos contractuales futuros por cánones y opción: ${remainingBalance}.`;

        results.leasing = {
          id: 'leasing',
          title: modalityTitles.leasing,
          initialOutlay,
          monthlyPayment: canon,
          monthlyPaymentPost: 0,
          totalFinanceInterest: totalImplicitFinanceCost,
          totalPaymentsInHorizon,
          remainingBalance,
          remainingContractText: remainingText,
          ownershipStatus,
          residualValue: (H >= leaseTerm && exerciseOption) || (H < leaseTerm) ? residualValue : 0,
          monthlyContribution,
          operatingResultBeforeFinance: standardOperatingResult,
          netCashFlowDuringPayments: standardOperatingResult - canon,
          netCashFlowAfterPayments: exerciseOption ? standardOperatingResult : 0,
          cumulativeCashFlow: cum,
          cashFlowSeries,
          isContractComplete: contractFinishedInHorizon,
          contractAlert
        };
      } else if (mode === 'alquiler') {
        const securityDeposit = Math.max(0, parseNumber(cfg.securityDeposit !== undefined ? cfg.securityDeposit : 0));
        const initialOutlay = securityDeposit + totalSetupCost;
        const rentalFee = Math.max(0, parseNumber(cfg.monthlyRentalFee !== undefined ? cfg.monthlyRentalFee : (equipmentPrice * 0.06)));
        const rentalMonths = Math.max(1, parseInt(cfg.rentalMonths || 12, 10));
        const maintenanceIncluded = !!cfg.maintenanceIncluded;

        // Si el mantenimiento está incluido en el alquiler, la clínica no asume ese costo fijo
        const fixedCostForRental = standardMonthlyFixed - (maintenanceIncluded ? monthlyMaintenance : 0);
        const operatingResultRental = monthlyContribution - fixedCostForRental;

        let paymentsInHorizon = 0;
        const cashFlowSeries = [{ month: 0, netCashFlow: -initialOutlay, cumulativeCashFlow: -initialOutlay }];
        let cum = -initialOutlay;

        for (let m = 1; m <= H; m++) {
          let pay = rentalFee;
          paymentsInHorizon += pay;

          let monthlyNet = operatingResultRental - pay;

          // Devolución del depósito de garantía al finalizar el horizonte (principio 6: no tratar depósito como gasto definitivo)
          if (m === H && securityDeposit > 0) {
            monthlyNet += securityDeposit;
          }

          cum += monthlyNet;
          cashFlowSeries.push({
            month: m,
            netCashFlow: monthlyNet,
            cumulativeCashFlow: cum
          });
        }

        // Pagos acumulados definitivos (el depósito se recupera al final, costo neto del depósito = 0)
        const totalPaymentsInHorizon = totalSetupCost + paymentsInHorizon;

        const ownershipStatus = 'Sin propiedad. El equipo permanece como activo del arrendador tecnológico.';
        const contractFinishedInHorizon = H <= rentalMonths;
        let contractAlert = null;
        if (H > rentalMonths) {
          contractAlert = `El plazo inicial de alquiler pactado es de ${rentalMonths} meses frente a un horizonte evaluado de ${H} meses. Se asume continuidad del canon mensual.`;
        }

        results.alquiler = {
          id: 'alquiler',
          title: modalityTitles.alquiler,
          initialOutlay,
          monthlyPayment: rentalFee,
          monthlyPaymentPost: rentalFee,
          totalFinanceInterest: 0,
          totalPaymentsInHorizon,
          remainingBalance: 0,
          remainingContractText: securityDeposit > 0
            ? `Depósito en garantía de ${securityDeposit} reintegrado al finalizar el horizonte de ${H} meses.`
            : 'Sin obligaciones residuales ni opción de compra.',
          ownershipStatus,
          residualValue: 0,
          monthlyContribution,
          operatingResultBeforeFinance: operatingResultRental,
          netCashFlowDuringPayments: operatingResultRental - rentalFee,
          netCashFlowAfterPayments: operatingResultRental - rentalFee,
          cumulativeCashFlow: cum,
          cashFlowSeries,
          isContractComplete: contractFinishedInHorizon,
          contractAlert
        };
      }
    });

    // Análisis comparativo y destacados (Highlights objetivos)
    const evaluatedList = activeModes.map(m => results[m]).filter(Boolean);

    let lowestInitialOutlay = null;
    let lowestMonthlyCommitment = null;
    let lowestTotalPayments = null;
    let highestCumulativeCashFlow = null;

    if (evaluatedList.length >= 2) {
      lowestInitialOutlay = evaluatedList.reduce((min, cur) => cur.initialOutlay < min.initialOutlay ? cur : min, evaluatedList[0]);
      lowestMonthlyCommitment = evaluatedList.reduce((min, cur) => cur.monthlyPayment < min.monthlyPayment ? cur : min, evaluatedList[0]);
      lowestTotalPayments = evaluatedList.reduce((min, cur) => cur.totalPaymentsInHorizon < min.totalPaymentsInHorizon ? cur : min, evaluatedList[0]);
      highestCumulativeCashFlow = evaluatedList.reduce((max, cur) => cur.cumulativeCashFlow > max.cumulativeCashFlow ? cur : max, evaluatedList[0]);
    }

    // Diagnóstico editorial y comparativo
    let interpretation = {
      desembolso: '',
      pagos: '',
      caja: '',
      prudencia: ''
    };

    if (lowestInitialOutlay && highestCumulativeCashFlow) {
      interpretation.desembolso = `La modalidad con menor barrera de entrada es ${lowestInitialOutlay.title} con un desembolso inicial de ${lowestInitialOutlay.initialOutlay}, frente a ${evaluatedList.find(x => x.id === 'contado')?.initialOutlay || 'la compra de contado'}.`;
      interpretation.pagos = `En el horizonte de ${H} meses, ${lowestTotalPayments.title} acumula el menor importe total pagado (${lowestTotalPayments.totalPaymentsInHorizon}).`;
      interpretation.caja = `${highestCumulativeCashFlow.title} proyecta el mayor excedente acumulado de caja (${highestCumulativeCashFlow.cumulativeCashFlow}) al cierre del mes ${H}.`;
      interpretation.prudencia = 'La selección debe contrastar la disponibilidad de liquidez inmediata frente al costo financiero, las implicaciones fiscales y la necesidad de retener la propiedad tecnológica al término del período.';
    }

    return {
      horizonMonths: H,
      equipmentName,
      equipmentPrice,
      activeModes,
      results,
      highlights: {
        lowestInitialOutlay,
        lowestMonthlyCommitment,
        lowestTotalPayments,
        highestCumulativeCashFlow
      },
      interpretation
    };
  }

  return {
    parseNumber,
    formatPct,
    formatDecimal,
    convertToMonthlyRate,
    calculateLoanSchedule,
    evaluateAparatologia,
    evaluateOperationalViability,
    evaluateModalityComparison
  };
}));
