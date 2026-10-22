/**
 * GLOSS & GROWTH — CALCULADORA DE ROAS Y RENTABILIDAD PUBLICITARIA
 * Motor financiero y analítico puro.
 * 
 * Basado en la metodología de la Calculadora ROAS (referencia financiera)
 * adaptada al sector de medicina estética, spas y clínicas (servicios y paquetes).
 * 
 * Principios:
 * 1. Fórmulas financieras exactas sin métricas decorativas ni supuestos de WhatsApp obligatorios.
 * 2. Distinción explícita entre ventas necesarias, facturación requerida y ROAS de equilibrio.
 * 3. Separación estricta entre costos de la inversión publicitaria y costos fijos generales del negocio.
 * 4. Recálculo dinámico de todos los totales (solución a la inconsistencia de fijos de $10.000 en el Excel).
 * 5. Motor de interpretaciones determinista en 3 partes: Hecho matemático, Significado y Recomendación prudente.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.GlossCalcEngine = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // =========================================================================
  // 1. HELPERS NUMÉRICOS Y FORMATEO
  // =========================================================================

  function parseNumber(val) {
    if (val === null || val === undefined || val === '') return 0;
    if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
    const clean = String(val).replace(/[^0-9.-]/g, '');
    const num = parseFloat(clean);
    return Number.isFinite(num) ? num : 0;
  }

  function formatCOP(val, includeCurrency = true) {
    if (val === null || val === undefined || !Number.isFinite(val)) return '—';
    const num = Math.round(val);
    const sign = num < 0 ? '−' : '';
    const formatted = Math.abs(num).toLocaleString('es-CO');
    return sign + '$' + formatted + (includeCurrency ? ' COP' : '');
  }

  function formatPct(val, decimals = 1) {
    if (val === null || val === undefined || !Number.isFinite(val)) return '—%';
    return val.toFixed(decimals).replace('.', ',') + '%';
  }

  function formatDecimal(val, decimals = 2) {
    if (val === null || val === undefined || !Number.isFinite(val)) return '—';
    return val.toFixed(decimals).replace('.', ',');
  }

  // =========================================================================
  // 2. MODO A: PLANIFICACIÓN DE PUBLICIDAD Y EQUILIBRIO
  // =========================================================================

  /**
   * Calcula el plan publicitario a partir de los datos de servicio e inversión.
   * 
   * @param {Object} params
   *   - serviceType: 'individual' | 'paquete' | 'agregado'
   *   - serviceName: string
   *   - packageSessions: number (si serviceType === 'paquete')
   *   - price: number (precio de venta efectivo por venta o paquete)
   *   - costInputMode: 'amount' | 'percent'
   *   - variableCostAmount: number (si costInputMode === 'amount')
   *   - variableCostPercent: number (si costInputMode === 'percent')
   *   - directMarginPercent: number (si serviceType === 'agregado')
   *   - adSpend: number (A - presupuesto en anuncios)
   *   - managementFee: number (G - honorarios de gestión)
   *   - otherMarketingCosts: number (O - otros costos de marketing)
   *   - desiredResult: number (meta de contribución económica opcional)
   *   - period: 'mensual' | 'quincenal' | 'campana'
   *   - periodDays: number
   *   - capacityAvailable: number | null (opcional: cupos adicionales disponibles)
   */
  function calculatePlanning(params) {
    const serviceType = params.serviceType || 'individual';
    const serviceName = (params.serviceName || 'Servicio evaluado').trim();
    const packageSessions = Math.max(1, parseInt(params.packageSessions, 10) || 1);
    const price = Math.max(0, parseNumber(params.price));

    const costInputMode = params.costInputMode || 'amount';
    const varCostAmount = Math.max(0, parseNumber(params.variableCostAmount));
    const varCostPercent = Math.max(0, parseNumber(params.variableCostPercent));
    const directMarginPercent = parseNumber(params.directMarginPercent);

    const adSpend = Math.max(0, parseNumber(params.adSpend));
    const managementFee = Math.max(0, parseNumber(params.managementFee));
    const otherCosts = Math.max(0, parseNumber(params.otherMarketingCosts));
    const desiredResult = parseNumber(params.desiredResult); // puede ser 0 o positivo

    const period = params.period || 'mensual';
    const capacityAvailable = params.capacityAvailable !== null && params.capacityAvailable !== undefined && params.capacityAvailable !== ''
      ? Math.max(0, parseInt(params.capacityAvailable, 10))
      : null;

    // 1. Margen de contribución del servicio
    let unitVariableCost = 0;
    let unitMargin = 0;
    let marginRatio = 0; // en decimal (0 a 1)

    if (serviceType === 'agregado') {
      marginRatio = directMarginPercent / 100;
      if (price > 0) {
        unitMargin = price * marginRatio;
        unitVariableCost = price - unitMargin;
      }
    } else {
      if (costInputMode === 'amount') {
        unitVariableCost = varCostAmount;
        unitMargin = price - unitVariableCost;
        marginRatio = price > 0 ? unitMargin / price : 0;
      } else {
        const costRatio = varCostPercent / 100;
        unitVariableCost = price * costRatio;
        unitMargin = price - unitVariableCost;
        marginRatio = 1 - costRatio;
      }
    }

    const marginPercent = marginRatio * 100;

    // 2. Inversión total de marketing (T = A + G + O)
    const totalMarketing = adSpend + managementFee + otherCosts;

    // 3. ROAS de equilibrio
    // ROAS pauta: 1 / M (cuando M > 0)
    let roasBreakevenPauta = null;
    if (marginRatio > 0) {
      roasBreakevenPauta = 1 / marginRatio;
    }

    // ROAS total con gestión y otros costos: (A + G + O) / (A * M)
    let roasBreakevenTotal = null;
    if (adSpend > 0 && marginRatio > 0) {
      roasBreakevenTotal = totalMarketing / (adSpend * marginRatio);
    }

    // 4. Facturación necesaria para equilibrio: T / M
    let revenueBreakeven = null;
    if (marginRatio > 0) {
      revenueBreakeven = totalMarketing / marginRatio;
    }

    // 5. Ventas necesarias para equilibrio: ceil(T / U)
    let salesBreakeven = null;
    if (unitMargin > 0) {
      salesBreakeven = Math.ceil(totalMarketing / unitMargin);
    } else if (revenueBreakeven !== null && price > 0) {
      salesBreakeven = Math.ceil(revenueBreakeven / price);
    }

    // 6. ROAS e Ingresos Objetivo (si se definió una meta > 0)
    let roasTarget = null;
    let revenueTarget = null;
    let salesTarget = null;
    const hasTarget = desiredResult > 0;

    if (hasTarget && marginRatio > 0) {
      const requiredContribution = totalMarketing + desiredResult;
      revenueTarget = requiredContribution / marginRatio;
      if (adSpend > 0) {
        roasTarget = requiredContribution / (adSpend * marginRatio);
      }
      if (unitMargin > 0) {
        salesTarget = Math.ceil(requiredContribution / unitMargin);
      } else if (price > 0) {
        salesTarget = Math.ceil(revenueTarget / price);
      }
    }

    // 7. Capacidad instalada: validación si el usuario introdujo cupos
    let capacityCheck = null;
    if (capacityAvailable !== null) {
      const targetSalesToCheck = hasTarget && salesTarget !== null ? salesTarget : salesBreakeven;
      if (targetSalesToCheck !== null) {
        const diff = targetSalesToCheck - capacityAvailable;
        capacityCheck = {
          declaredCapacity: capacityAvailable,
          requiredSales: targetSalesToCheck,
          isSufficient: diff <= 0,
          deficit: diff > 0 ? diff : 0,
          surplus: diff < 0 ? Math.abs(diff) : 0
        };
      }
    }

    // 8. Estado del margen
    let marginStatus = 'normal';
    if (price > 0 && unitMargin < 0) {
      marginStatus = 'negative';
    } else if (price > 0 && marginPercent < 20) {
      marginStatus = 'thin';
    } else if (marginPercent >= 50) {
      marginStatus = 'healthy';
    }

    return {
      serviceType,
      serviceName,
      packageSessions,
      price,
      costInputMode,
      unitVariableCost,
      unitMargin,
      marginRatio,
      marginPercent,
      marginStatus,
      adSpend,
      managementFee,
      otherCosts,
      totalMarketing,
      period,
      desiredResult,
      hasTarget,
      roasBreakevenPauta,
      roasBreakevenTotal,
      revenueBreakeven,
      salesBreakeven,
      roasTarget,
      revenueTarget,
      salesTarget,
      capacityCheck
    };
  }

  // =========================================================================
  // 3. MATRIZ DE ESCENARIOS (ELEMENTO DIFERENCIADOR)
  // =========================================================================

  /**
   * Genera la matriz cruzada de Presupuestos (filas) vs ROAS (columnas).
   * 
   * Fórmula para cada celda:
   * Ingresos hipotéticos = Presupuesto anuncios * ROAS
   * Margen generado = Ingresos hipotéticos * Margen %
   * Inversión total = Presupuesto anuncios + Gestión aplicable + Otros costos
   * Resultado del escenario = Margen generado - Inversión total
   * 
   * @param {Object} options
   *   - marginRatio: number (0 a 1)
   *   - price: number
   *   - managementFee: number (base)
   *   - feeMode: 'fixed' | 'percentage'
   *   - feePercentage: number (si feeMode === 'percentage')
   *   - otherCosts: number
   *   - budgets: Array<number> (ej: [500000, 1000000, 1200000, 1500000, 2000000, 3000000])
   *   - roasLevels: Array<number> (ej: [1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0])
   */
  function generateScenarioMatrix(options) {
    const marginRatio = Math.max(0, options.marginRatio || 0);
    const price = Math.max(0, options.price || 0);
    const baseFee = Math.max(0, options.managementFee || 0);
    const feeMode = options.feeMode || 'fixed';
    const feePct = Math.max(0, options.feePercentage || 0);
    const otherCosts = Math.max(0, options.otherCosts || 0);

    const budgets = Array.isArray(options.budgets) && options.budgets.length > 0
      ? options.budgets
      : [500000, 1000000, 1200000, 1500000, 2000000, 3000000];

    const roasLevels = Array.isArray(options.roasLevels) && options.roasLevels.length > 0
      ? options.roasLevels
      : [1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0];

    const matrix = [];

    for (let i = 0; i < budgets.length; i++) {
      const budget = budgets[i];
      const fee = feeMode === 'percentage' ? budget * (feePct / 100) : baseFee;
      const totalMkt = budget + fee + otherCosts;

      // ROAS de equilibrio específico de esta fila
      const roasBreakevenRow = (budget > 0 && marginRatio > 0)
        ? totalMkt / (budget * marginRatio)
        : null;

      const rowCells = [];

      for (let j = 0; j < roasLevels.length; j++) {
        const roas = roasLevels[j];
        const hypRevenue = budget * roas;
        const generatedMargin = hypRevenue * marginRatio;
        const result = generatedMargin - totalMkt;

        let status = 'breakeven';
        if (result < -500) {
          status = 'loss';
        } else if (result > 500) {
          status = 'profit';
        }

        const estimatedSales = price > 0 ? Math.round(hypRevenue / price) : null;

        rowCells.push({
          roas,
          budget,
          hypRevenue,
          generatedMargin,
          feeApplied: fee,
          otherCostsApplied: otherCosts,
          totalMarketing: totalMkt,
          result,
          status,
          estimatedSales
        });
      }

      matrix.push({
        budget,
        feeApplied: fee,
        totalMarketing: totalMkt,
        roasBreakevenRow,
        cells: rowCells
      });
    }

    return {
      marginRatio,
      price,
      budgets,
      roasLevels,
      matrix
    };
  }

  // =========================================================================
  // 4. MODO B: ANÁLISIS DE CAMPAÑAS REALES
  // =========================================================================

  /**
   * Analiza los resultados financieros e históricos observados en una campaña.
   * 
   * @param {Object} params
   *   - adSpendReal: number (gasto real en anuncios)
   *   - managementFeeReal: number (honorarios del período)
   *   - otherCostsReal: number (otros costos atribuibles)
   *   - revenueReal: number (ingresos atribuidos directamente a la publicidad)
   *   - costMode: 'amount' | 'percent'
   *   - variableCostsReal: number (costos variables totales de las ventas)
   *   - marginPercentReal: number (margen % aplicable)
   *   - targetResult: number (meta deseada de ganancia opcional)
   *   - funnelMetrics: { sales, uniqueBuyers, newPatients, chats, appointments, attended } (opcional)
   */
  function calculateRealResults(params) {
    const adSpend = Math.max(0, parseNumber(params.adSpendReal));
    const managementFee = Math.max(0, parseNumber(params.managementFeeReal));
    const otherCosts = Math.max(0, parseNumber(params.otherCostsReal));
    const revenue = Math.max(0, parseNumber(params.revenueReal));
    const targetResult = parseNumber(params.targetResult);

    const costMode = params.costMode || 'amount';
    const varCostsInput = Math.max(0, parseNumber(params.variableCostsReal));
    const marginPctInput = parseNumber(params.marginPercentReal);

    // Inversión total de marketing
    const totalMarketing = adSpend + managementFee + otherCosts;

    // Margen generado
    let variableCosts = 0;
    let generatedMargin = 0;
    let marginRatio = 0;

    if (costMode === 'percent') {
      marginRatio = marginPctInput / 100;
      generatedMargin = revenue * marginRatio;
      variableCosts = revenue - generatedMargin;
    } else {
      variableCosts = varCostsInput;
      generatedMargin = revenue - variableCosts;
      marginRatio = revenue > 0 ? generatedMargin / revenue : 0;
    }

    const marginPercent = marginRatio * 100;

    // ROAS real observado (Ingresos atribuidos / Gasto directo en anuncios)
    const roasReal = adSpend > 0 ? revenue / adSpend : 0;

    // ROAS de equilibrio requerido para cubrir los costos considerados
    const roasBreakeven = (adSpend > 0 && marginRatio > 0)
      ? totalMarketing / (adSpend * marginRatio)
      : null;

    // ROAS de solo pauta
    const roasBreakevenPauta = marginRatio > 0 ? 1 / marginRatio : null;

    // Facturación de equilibrio
    const revenueBreakeven = marginRatio > 0 ? totalMarketing / marginRatio : null;

    // Diferencia frente al equilibrio de ROAS
    const roasDiff = roasBreakeven !== null ? roasReal - roasBreakeven : null;

    // Resultado financiero después de marketing: Margen generado - Inversión total
    const resultAfterMarketing = generatedMargin - totalMarketing;

    // Comparación contra objetivo (si se definió)
    const hasTarget = targetResult > 0;
    const targetDiff = hasTarget ? resultAfterMarketing - targetResult : null;

    // Métricas comerciales opcionales (embudo)
    let funnel = null;
    if (params.funnelMetrics) {
      const fm = params.funnelMetrics;
      const sales = Math.max(0, parseInt(fm.sales, 10) || 0);
      const uniqueBuyers = Math.max(0, parseInt(fm.uniqueBuyers, 10) || 0);
      const newPatients = Math.max(0, parseInt(fm.newPatients, 10) || 0);
      const chats = Math.max(0, parseInt(fm.chats, 10) || 0);
      const appointments = Math.max(0, parseInt(fm.appointments, 10) || 0);
      const attended = Math.max(0, parseInt(fm.attended, 10) || 0);

      funnel = {
        sales,
        uniqueBuyers,
        newPatients,
        chats,
        appointments,
        attended,
        costPerSaleAd: sales > 0 ? adSpend / sales : null,
        costPerSaleTotal: sales > 0 ? totalMarketing / sales : null,
        cacPublicitario: newPatients > 0 ? adSpend / newPatients : null,
        cacTotal: newPatients > 0 ? totalMarketing / newPatients : null,
        costPerChat: chats > 0 ? adSpend / chats : null,
        costPerAppointment: appointments > 0 ? adSpend / appointments : null,
        attendanceRate: appointments > 0 ? (attended / appointments) * 100 : null
      };
    }

    return {
      adSpend,
      managementFee,
      otherCosts,
      totalMarketing,
      revenue,
      variableCosts,
      generatedMargin,
      marginRatio,
      marginPercent,
      roasReal,
      roasBreakeven,
      roasBreakevenPauta,
      revenueBreakeven,
      roasDiff,
      resultAfterMarketing,
      targetResult,
      hasTarget,
      targetDiff,
      funnel
    };
  }

  // =========================================================================
  // 5. ANÁLISIS AVANZADO: COSTOS FIJOS DEL NEGOCIO COMPLETO
  // =========================================================================

  /**
   * Calcula el resultado operativo global del negocio sumando dinámicamente
   * cada rubro de costos fijos y combinando ingresos de otros canales.
   * 
   * IMPORTANTE: No hardcodear nunca fijos en $10.000 como el error del Excel.
   * Se recalculan estrictamente a partir de los ítems introducidos.
   */
  function calculateBusinessOperatingResult(params) {
    const campaignMargin = parseNumber(params.campaignMargin);
    const campaignMarketing = parseNumber(params.campaignMarketing);

    // Gastos fijos del negocio (desglose dinámico)
    const rent = Math.max(0, parseNumber(params.rent));
    const payroll = Math.max(0, parseNumber(params.fixedPayroll));
    const utilities = Math.max(0, parseNumber(params.utilities));
    const software = Math.max(0, parseNumber(params.software));
    const admin = Math.max(0, parseNumber(params.admin));
    const otherFixed = Math.max(0, parseNumber(params.otherFixed));

    const totalFixedCosts = rent + payroll + utilities + software + admin + otherFixed;

    // Ingresos y margen de otros canales (orgánicos, recurrentes)
    const otherRevenue = Math.max(0, parseNumber(params.otherRevenue));
    const otherMarginPct = Math.max(0, parseNumber(params.otherMarginPct));
    const otherMarginGenerated = otherRevenue * (otherMarginPct / 100);

    // Margen total generado por todos los canales
    const totalBusinessMargin = campaignMargin + otherMarginGenerated;

    // Resultado operativo estimado con los costos incluidos:
    // (Margen Campaña + Margen Otros Canales) - Total Marketing Campaña - Total Gastos Fijos
    const operatingResult = totalBusinessMargin - campaignMarketing - totalFixedCosts;

    return {
      rent,
      payroll,
      utilities,
      software,
      admin,
      otherFixed,
      totalFixedCosts,
      otherRevenue,
      otherMarginPct,
      otherMarginGenerated,
      totalBusinessMargin,
      operatingResult
    };
  }

  // =========================================================================
  // 6. MOTOR DE INTERPRETACIONES BASADO EN EVIDENCIA (3 PARTES)
  // =========================================================================

  /**
   * Genera diagnósticos comerciales estrictamente fundamentados en los números.
   * Estructura en 3 partes:
   * 1. Hecho matemático: demostrado por las operaciones.
   * 2. Qué significa para el negocio: impacto económico objetivo.
   * 3. Recomendación de revisión prudente: líneas de indagación sin afirmaciones no probadas.
   */
  function generateDiagnosis(mode, data) {
    // -----------------------------------------------------------------------
    // CASO MODO A: PLANIFICACIÓN
    // -----------------------------------------------------------------------
    if (mode === 'plan') {
      const p = data;

      // 1. Margen negativo
      if (p.price > 0 && p.unitMargin < 0) {
        return {
          type: 'danger',
          title: 'Margen de contribución negativo',
          fact: `Los costos variables (${formatCOP(p.unitVariableCost)}) superan el precio de venta (${formatCOP(p.price)}). Cada venta adicional genera un déficit directo de ${formatCOP(p.unitMargin)}.`,
          meaning: 'El negocio pierde dinero con cada servicio prestado antes de considerar publicidad, honorarios de gestión y gastos fijos.',
          recommendation: 'Revisa de inmediato la tarifa de venta y la estructura de insumos u honorarios antes de invertir en captación para este procedimiento.'
        };
      }

      // 2. Sin presupuesto de pauta ingresado
      if (p.adSpend === 0) {
        return {
          type: 'neutral',
          title: 'Presupuesto publicitario sin definir',
          fact: 'Se ha indicado una inversión directa en anuncios de $0 COP.',
          meaning: 'No es posible determinar el ROAS de equilibrio ni las ventas necesarias sin un presupuesto publicitario de referencia.',
          recommendation: 'Ingresa un monto en el campo de presupuesto de anuncios para proyectar los escenarios de retorno requeridos.'
        };
      }

      // 3. Capacidad declarada insuficiente
      if (p.capacityCheck && !p.capacityCheck.isSufficient) {
        return {
          type: 'warning',
          title: 'Capacidad operativa declarada inferior al objetivo',
          fact: `Tu plan requiere ${p.capacityCheck.requiredSales} atenciones en el período, pero has indicado capacidad disponible para ${p.capacityCheck.declaredCapacity} citas (déficit de ${p.capacityCheck.deficit} atenciones).`,
          meaning: 'Incluso si la publicidad genera la demanda proyectada, tu capacidad operativa actual declarada no permitiría atender el volumen necesario.',
          recommendation: 'Antes de iniciar o aumentar la captación, evalúa ampliar horarios, habilitar cabinas o ajustar el objetivo económico a la disponibilidad real.'
        };
      }

      // 4. Plan regular saludable
      const salesText = p.salesBreakeven !== null ? `${p.salesBreakeven} ventas` : 'las ventas equivalentes';
      const targetText = p.hasTarget && p.salesTarget !== null
        ? ` Para alcanzar tu meta de ${formatCOP(p.desiredResult)}, requerirías ${p.salesTarget} ventas (${formatCOP(p.revenueTarget)} en facturación, ROAS ${formatDecimal(p.roasTarget)}x).`
        : '';

      return {
        type: 'healthy',
        title: 'Objetivos de equilibrio calculados',
        fact: `Con un margen de contribución del ${formatPct(p.marginPercent)} (${formatCOP(p.unitMargin)} por venta) y una inversión total de marketing de ${formatCOP(p.totalMarketing)}, requieres generar ${formatCOP(p.revenueBreakeven)} en ventas (${salesText}) para alcanzar el equilibrio, lo que equivale a un ROAS de ${formatDecimal(p.roasBreakevenTotal)}x (o ${formatDecimal(p.roasBreakevenPauta)}x considerando únicamente el gasto directo en anuncios).${targetText}`,
        meaning: 'Alcanzar ese volumen de ventas cubre los costos directos del servicio y toda la inversión de marketing asignada, dejando el resultado económico en punto de equilibrio.',
        recommendation: 'Compara el ROAS de equilibrio requerido con el rendimiento histórico de tus campañas. Si nunca has pautado este servicio, utiliza la Matriz de Escenarios para verificar qué holgura tienes ante distintos niveles de retorno.'
      };
    }

    // -----------------------------------------------------------------------
    // CASO MODO B: RESULTADOS REALES
    // -----------------------------------------------------------------------
    if (mode === 'real') {
      const r = data;

      // 1. Alto ROAS pero resultado financiero negativo (Caso E de las pruebas)
      if (r.roasReal >= 3.0 && r.resultAfterMarketing < 0) {
        return {
          type: 'warning',
          title: 'Alerta financiera: ROAS elevado con resultado negativo',
          fact: `La campaña registró un ROAS de ${formatDecimal(r.roasReal)}x (${formatCOP(r.revenue)} facturados sobre ${formatCOP(r.adSpend)} en pauta), pero el margen generado (${formatCOP(r.generatedMargin)}) fue inferior a los costos totales de marketing (${formatCOP(r.totalMarketing)}), dejando un resultado de ${formatCOP(r.resultAfterMarketing)}. El ROAS de equilibrio era de ${formatDecimal(r.roasBreakeven)}x.`,
          meaning: 'Cuando el margen de contribución porcentual es reducido (en este caso ${formatPct(r.marginPercent)}), un ROAS aparentemente favorable no alcanza para cubrir la inversión en anuncios y gestión.',
          recommendation: 'Revisa la rentabilidad unitaria del servicio promocionado o la proporción de honorarios de gestión frente al gasto publicitario antes de considerar aumentos de presupuesto.'
        };
      }

      // 2. ROAS por debajo del equilibrio
      if (r.roasBreakeven !== null && r.roasReal < r.roasBreakeven) {
        const diffText = r.roasDiff !== null ? `(${formatDecimal(Math.abs(r.roasDiff))}x por debajo)` : '';
        return {
          type: 'danger',
          title: 'Retorno por debajo del punto de equilibrio',
          fact: `El ROAS observado (${formatDecimal(r.roasReal)}x) se ubicó por debajo del punto de equilibrio necesario (${formatDecimal(r.roasBreakeven)}x) ${diffText}. El resultado tras costos variables y marketing fue de ${formatCOP(r.resultAfterMarketing)}.`,
          meaning: 'Los ingresos atribuidos a la publicidad no alcanzaron para compensar los costos variables del procedimiento y los gastos de marketing incurridos.',
          recommendation: 'Revisa los costos del servicio, el presupuesto invertido y la efectividad de las ventas. Si dispones de indicadores comerciales complementarios (costo por cita o tasa de asistencia), examínalos para identificar posibles cuellos de botella sin atribuir la causa exclusivamente a los anuncios.'
        };
      }

      // 3. Resultado exactamente en equilibrio
      if (Math.abs(r.resultAfterMarketing) <= 500) {
        return {
          type: 'neutral',
          title: 'Campaña en punto de equilibrio exacto',
          fact: `Los ingresos atribuidos (${formatCOP(r.revenue)}) generaron un margen de ${formatCOP(r.generatedMargin)}, cubriendo con exactitud los ${formatCOP(r.totalMarketing)} de inversión en marketing (ROAS observado ${formatDecimal(r.roasReal)}x vs equilibrio ${formatDecimal(r.roasBreakeven)}x).`,
          meaning: 'La campaña recuperó todos los desembolsos analizados sin generar pérdida, pero no dejó un excedente financiero adicional para absorber costos fijos de la empresa.',
          recommendation: 'Valora si la captación generó pacientes nuevos con potencial de recompra que rentabilicen la relación comercial en visitas posteriores.'
        };
      }

      // 4. ROAS superior al equilibrio (resultado positivo)
      return {
        type: 'healthy',
        title: 'Campaña con contribución económica positiva',
        fact: `El ROAS alcanzado (${formatDecimal(r.roasReal)}x) superó el punto de equilibrio (${formatDecimal(r.roasBreakeven)}x), generando un excedente de ${formatCOP(r.resultAfterMarketing)} tras cubrir costos variables de cabina e inversión total de marketing.`,
        meaning: 'La campaña dejó un remanente positivo para contribuir a los costos fijos generales del negocio o capitalizar la clínica.',
        recommendation: 'Antes de decidir un aumento de presupuesto, comprueba si cuentas con capacidad instalada para absorber más citas y si este rendimiento se ha sostenido durante un período representativo.'
      };
    }

    return {
      type: 'neutral',
      title: 'Diagnóstico en espera',
      fact: 'Ingresa los datos del escenario para generar el análisis.',
      meaning: '—',
      recommendation: '—'
    };
  }

  // =========================================================================
  // 7. PRESETS DE REFERENCIA PARA PRUEBAS Y USUARIOS
  // =========================================================================

  const PRESETS = {
    // CASO A — SPA MASAJE EN PAREJA (Especificación oficial de prueba)
    casoA: {
      name: 'Spa — Masaje en Pareja (Caso A)',
      serviceType: 'individual',
      serviceName: 'Masaje Relajante en Pareja (60 min)',
      price: 200000,
      costInputMode: 'amount',
      variableCostAmount: 80000,
      variableCostPercent: 40,
      directMarginPercent: 60,
      adSpend: 1200000,
      managementFee: 600000,
      otherMarketingCosts: 0,
      desiredResult: 0,
      period: 'mensual',
      capacityAvailable: null
    },
    // CASO B — ROAS OBJETIVO (Caso A + Meta $600.000)
    casoB: {
      name: 'Spa — Masaje en Pareja con Meta (Caso B)',
      serviceType: 'individual',
      serviceName: 'Masaje Relajante en Pareja (60 min)',
      price: 200000,
      costInputMode: 'amount',
      variableCostAmount: 80000,
      variableCostPercent: 40,
      directMarginPercent: 60,
      adSpend: 1200000,
      managementFee: 600000,
      otherMarketingCosts: 0,
      desiredResult: 600000,
      period: 'mensual',
      capacityAvailable: null
    },
    // CASO D — CAMPAÑA REAL EN EQUILIBRIO
    casoD: {
      name: 'Campaña Real en Equilibrio (Caso D)',
      adSpendReal: 1200000,
      managementFeeReal: 600000,
      otherCostsReal: 0,
      revenueReal: 3000000,
      costMode: 'amount',
      variableCostsReal: 1200000,
      marginPercentReal: 60,
      targetResult: 0
    },
    // CASO E — ALTO ROAS, MARGEN BAJO
    casoE: {
      name: 'Alto ROAS pero Margen Bajo (Caso E)',
      adSpendReal: 1000000,
      managementFeeReal: 300000,
      otherCostsReal: 0,
      revenueReal: 4000000,
      costMode: 'percent',
      variableCostsReal: 3200000,
      marginPercentReal: 20,
      targetResult: 0
    },
    // PAQUETE FACIAL COMPLETO
    paqueteFacial: {
      name: 'Paquete Facial Hidratación y Peeling (4 sesiones)',
      serviceType: 'paquete',
      serviceName: 'Paquete Renovación Facial (4 sesiones)',
      packageSessions: 4,
      price: 600000,
      costInputMode: 'amount',
      variableCostAmount: 180000,
      variableCostPercent: 30,
      directMarginPercent: 70,
      adSpend: 1500000,
      managementFee: 500000,
      otherMarketingCosts: 0,
      desiredResult: 1000000,
      period: 'mensual',
      capacityAvailable: 15
    }
  };

  // =========================================================================
  // EXPORTACIÓN DE LA API PÚBLICA
  // =========================================================================

  return {
    parseNumber,
    formatCOP,
    formatPct,
    formatDecimal,
    calculatePlanning,
    generateScenarioMatrix,
    calculateRealResults,
    calculateBusinessOperatingResult,
    generateDiagnosis,
    PRESETS
  };
}));
