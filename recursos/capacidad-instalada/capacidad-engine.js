/**
 * GLOSS & GROWTH — SIMULADOR DE CAPACIDAD INSTALADA Y OCUPACIÓN
 * Motor analítico y matemático puro (Modo Básico).
 * 
 * Especializado para spas, centros de estética, clínicas y consultorios.
 * 
 * Principios:
 * 1. Basado en recursos disponibles simultáneamente (profesionales vs. cabinas).
 * 2. Cero supuestos mágicos o promesas comerciales de ventas.
 * 3. Restricción estricta de jornadas: no acumula minutos sobrantes entre días.
 * 4. Detección clara de inconsistencias (citas atendidas > capacidad).
 * 5. Escenarios de ocupación transparentes (60%, 75%, 90% y personalizado).
 * 6. Interpretación determinista en 3 partes sin IA externa.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.GlossCapacityEngine = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // =========================================================================
  // 1. HELPERS NUMÉRICOS Y FORMATEO
  // =========================================================================

  function parseNumber(val) {
    if (val === null || val === undefined || val === '') return 0;
    if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
    let str = String(val).trim();
    const isNegative = str.startsWith('-') || str.startsWith('−');
    str = str.replace(/[\$\u20AC\s]/g, '').replace(/COP/gi, '').replace(/[^\d.,]/g, '');
    if (!str) return 0;

    let n = 0;
    if ((str.match(/\./g) || []).length > 1) {
      str = str.replace(/\./g, '').replace(',', '.');
      n = parseFloat(str);
    } else if ((str.match(/,/g) || []).length > 1) {
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

  function formatDecimal(val, decimals = 1) {
    if (val === null || val === undefined || !Number.isFinite(val)) return '—';
    return val.toFixed(decimals).replace('.', ',');
  }

  function formatInteger(val) {
    if (val === null || val === undefined || !Number.isFinite(val)) return '0';
    return Math.round(val).toLocaleString('es-CO');
  }

  // =========================================================================
  // 2. MOTOR MATEMÁTICO PRINCIPAL
  // =========================================================================

  /**
   * Calcula la capacidad instalada, ocupación, facturación y escenarios.
   * 
   * @param {Object} inputs
   * @param {number|string} inputs.professionals - Profesionales disponibles (P)
   * @param {number|string} inputs.cabins - Cabinas o espacios disponibles (C)
   * @param {boolean} inputs.noCabinLimit - True si el servicio no depende de cabinas
   * @param {number|string} inputs.reqPerAppointment - Profesionales requeridos por cita (R, default 1)
   * @param {number|string} inputs.dailyHours - Horas efectivas diarias de atención (H)
   * @param {number|string} inputs.monthlyDays - Días de atención al mes (D)
   * @param {number|string} inputs.appointmentMinutes - Duración total por cita en minutos (T)
   * @param {number|string} inputs.attendedAppointments - Citas realmente completadas en el mes (A)
   * @param {number|string} inputs.averageRevenue - Ingreso promedio por cita ($ COP) (V)
   * @param {number|string} [inputs.customScenarioPct=80] - Porcentaje para escenario personalizado
   * @param {number|string} [inputs.targetRevenue=0] - Meta de facturación mensual deseada
   */
  function calculateCapacity(inputs = {}) {
    const P = Math.max(0, parseInt(inputs.professionals, 10) || 0);
    const C = Math.max(0, parseInt(inputs.cabins, 10) || 0);
    const noCabinLimit = Boolean(inputs.noCabinLimit);
    const R = Math.max(1, parseInt(inputs.reqPerAppointment, 10) || 1);
    const H = Math.max(0, parseFloat(inputs.dailyHours) || 0);
    const D = Math.max(0, parseInt(inputs.monthlyDays, 10) || 0);
    const T = Math.max(0, parseFloat(inputs.appointmentMinutes) || 0);
    const A = Math.max(0, parseNumber(inputs.attendedAppointments));
    const V = Math.max(0, parseNumber(inputs.averageRevenue));
    const customPct = Math.max(0, Math.min(100, parseNumber(inputs.customScenarioPct) || 80));
    const targetRevenue = Math.max(0, parseNumber(inputs.targetRevenue));

    // 1. Atenciones simultáneas (S)
    const staffCapacity = Math.floor(P / R);
    let S = 0;
    if (P < R) {
      S = 0;
    } else if (noCabinLimit) {
      S = staffCapacity;
    } else {
      S = Math.min(staffCapacity, C);
    }

    // 2. Citas completas por jornada y espacio (Q)
    // No se acumulan minutos sobrantes de un día a otro
    let Q = 0;
    if (H > 0 && T > 0) {
      Q = Math.floor((H * 60) / T);
    }

    // 3. Capacidad teórica mensual
    const monthlyCapacity = S * Q * D;

    // 4. Tasa de ocupación actual (%)
    let occupancyRate = null;
    let isInconsistent = false;
    if (monthlyCapacity > 0) {
      occupancyRate = (A / monthlyCapacity) * 100;
      if (A > monthlyCapacity) {
        isInconsistent = true;
      }
    } else if (A > 0) {
      isInconsistent = true;
    } else {
      occupancyRate = 0;
    }

    // 5. Capacidad disponible en citas
    const availableAppointments = monthlyCapacity - A;

    // 6. Facturación actual estimada
    const currentRevenue = A * V;

    // 7. Facturación a capacidad completa (máxima teórica)
    const maxTheoreticalRevenue = monthlyCapacity * V;

    // Horas operativas ocupadas vs disponibles
    const availableHours = (monthlyCapacity * T) / 60;
    const occupiedHours = (A * T) / 60;

    // 8. Escenarios de ocupación (60%, 75%, 90%, Personalizado)
    const scenarioTiers = [
      { label: '60%', pct: 0.60, isCustom: false },
      { label: '75%', pct: 0.75, isCustom: false },
      { label: '90%', pct: 0.90, isCustom: false },
      { label: `${formatDecimal(customPct, 0)}% (Personalizado)`, pct: customPct / 100, isCustom: true }
    ];

    const scenarios = scenarioTiers.map(sc => {
      const targetApts = Math.floor(monthlyCapacity * sc.pct);
      const targetRev = targetApts * V;
      const additionalApts = targetApts - A;
      const isExceeded = targetApts <= A;
      const additionalRev = isExceeded ? 0 : additionalApts * V;

      return {
        label: sc.label,
        pct: sc.pct,
        isCustom: sc.isCustom,
        targetAppointments: targetApts,
        targetRevenue: targetRev,
        additionalAppointments: additionalApts,
        additionalRevenue: additionalRev,
        isExceeded
      };
    });

    // 9. Simulación de meta de facturación
    let goal = null;
    if (targetRevenue > 0 && V > 0) {
      const neededApts = Math.ceil(targetRevenue / V);
      const additionalNeeded = Math.max(0, neededApts - A);
      const reqOccupancy = monthlyCapacity > 0 ? (neededApts / monthlyCapacity) * 100 : null;
      const isExceeding = monthlyCapacity > 0 ? neededApts > monthlyCapacity : true;

      goal = {
        targetRevenue,
        neededAppointments: neededApts,
        additionalAppointmentsNeeded: additionalNeeded,
        requiredOccupancy: reqOccupancy,
        isExceedingCapacity: isExceeding
      };
    }

    // 10. Generación de Diagnóstico e Interpretaciones Deterministas
    const interpretation = generateInterpretation({
      P, C, R, noCabinLimit, S, Q, staffCapacity,
      monthlyCapacity, occupancyRate, isInconsistent,
      availableAppointments, A, V, currentRevenue
    });

    return {
      P,
      C,
      R,
      noCabinLimit,
      H,
      D,
      T,
      A,
      V,
      customPct,
      staffCapacity,
      S,
      Q,
      monthlyCapacity,
      occupancyRate,
      isInconsistent,
      availableAppointments,
      currentRevenue,
      maxTheoreticalRevenue,
      maxRevenue: maxTheoreticalRevenue,
      targetRevenue: goal ? goal.targetRevenue : targetRevenue,
      targetAppointmentsNeeded: goal ? goal.neededAppointments : 0,
      targetAppointmentsAdditional: goal ? goal.additionalAppointmentsNeeded : 0,
      targetOccupancyReq: goal ? goal.requiredOccupancy : 0,
      isTargetFeasible: goal ? !goal.isExceedingCapacity : true,
      availableHours,
      occupiedHours,
      scenarios,
      goal,
      interpretation
    };
  }

  // =========================================================================
  // 3. GENERADOR DE INTERPRETACIONES DETERMINISTAS (SIN IA)
  // =========================================================================

  function generateInterpretation(data) {
    const {
      P, C, R, noCabinLimit, S, Q, staffCapacity,
      monthlyCapacity, occupancyRate, isInconsistent,
      availableAppointments, A, V
    } = data;

    // Caso A: Inconsistencia
    if (isInconsistent) {
      return {
        status: 'danger',
        badge: 'Inconsistencia en los datos',
        title: 'Las citas registradas superan la capacidad estimada',
        fact: `Completaste ${formatInteger(A)} citas en el mes, pero bajo los horarios y recursos declarados la capacidad máxima teórica es de ${formatInteger(monthlyCapacity)} citas.`,
        capacityState: `El volumen actual excede la capacidad calculada por ${formatInteger(Math.abs(availableAppointments))} citas (${formatPct(occupancyRate)} de ocupación teórica).`,
        advice: 'Revisa si parte de las atenciones se realizan fuera del horario habitual, si los tiempos de cita y preparación son menores a los ingresados, o si tienes personal o cabinas de apoyo que no declaraste en el formulario.'
      };
    }

    // Caso B: Personal insuficiente para el requerimiento
    if (P < R) {
      return {
        status: 'danger',
        badge: 'Personal insuficiente para el servicio',
        title: 'El servicio requiere más profesionales de los disponibles',
        fact: `Este procedimiento exige ${R} profesional(es) simultáneo(s) por cita, pero actualmente solo cuentas con ${P} profesional(es) asignado(s).`,
        capacityState: 'La capacidad de atención simultánea y mensual bajo este modelo es cero.',
        advice: 'Para habilitar este servicio debes disponer de al menos el número de profesionales que exige cada sesión o ajustar el parámetro en los ajustes adicionales.'
      };
    }

    // Caso C: Capacidad cero por horarios o duración
    if (monthlyCapacity === 0) {
      return {
        status: 'warning',
        badge: 'Capacidad operativa en cero',
        title: 'Verifica las horas de atención y duración del tratamiento',
        fact: 'La combinación de horas diarias, días de atención y duración del servicio no permite completar al menos una cita mensual completa.',
        capacityState: 'Capacidad estimada: 0 citas al mes.',
        advice: 'Comprueba que las horas efectivas diarias sean suficientes para cubrir la duración completa del tratamiento incluyendo preparación y limpieza.'
      };
    }

    // Análisis de cuello de botella de recursos
    let bottleneck = '';
    if (!noCabinLimit) {
      if (staffCapacity > C) {
        bottleneck = `Nota operativa: Tu personal disponible permitiría ${staffCapacity} atenciones simultáneas, pero la disponibilidad de ${C} cabina(s) actúa como el límite físico principal.`;
      } else if (C > staffCapacity) {
        bottleneck = `Nota operativa: Cuentas con ${C} cabina(s), pero el personal disponible (${P} profesionales) limita las atenciones simultáneas a ${S}.`;
      }
    }

    // Caso D: Ocupación baja (< 50%)
    if (occupancyRate < 50) {
      return {
        status: 'warning',
        badge: 'Ocupación con holgura considerable',
        title: 'Dispones de amplio margen de capacidad disponible',
        fact: `Según los horarios y recursos indicados, estás utilizando el ${formatPct(occupancyRate)} de tu capacidad teórica (${formatInteger(A)} de ${formatInteger(monthlyCapacity)} citas posibles).`,
        capacityState: `Quedan aproximadamente ${formatInteger(availableAppointments)} citas disponibles en el mes bajo este modelo. ${bottleneck}`,
        advice: 'Puedes revisar si esa disponibilidad coincide con los horarios en los que tus clientes suelen solicitar citas, o si la demanda actual se concentra excesivamente en días o franjas específicas.'
      };
    }

    // Caso E: Ocupación media-alta (50% - 74.9%)
    if (occupancyRate < 75) {
      return {
        status: 'healthy',
        badge: 'Ocupación equilibrada',
        title: 'Utilización operativa saludable con margen para absorber variaciones',
        fact: `Tu ocupación estimada es del ${formatPct(occupancyRate)}, habiendo realizado ${formatInteger(A)} atenciones de las ${formatInteger(monthlyCapacity)} posibles.`,
        capacityState: `Cuentas con ${formatInteger(availableAppointments)} citas adicionales posibles en el mes. ${bottleneck}`,
        advice: 'Este nivel permite absorber imprevistos, descansos y cancelaciones sin sobrecargar al equipo. Puedes evaluar qué días de la semana presentan menor ocupación para dirigir allí la agenda.'
      };
    }

    // Caso F: Ocupación alta (75% - 89.9%)
    if (occupancyRate < 90) {
      return {
        status: 'healthy',
        badge: 'Alta eficiencia operativa',
        title: 'Aprovechamiento intensivo de tu infraestructura clínica',
        fact: `Estás utilizando el ${formatPct(occupancyRate)} de tu capacidad teórica mensual (${formatInteger(A)} de ${formatInteger(monthlyCapacity)} citas).`,
        capacityState: `Dispones de un margen de ${formatInteger(availableAppointments)} citas adicionales al mes. ${bottleneck}`,
        advice: 'Con este nivel de ocupación, es clave vigilar que los tiempos de preparación, desinfección y descanso se cumplan rigurosamente para evitar retrasos que afecten la experiencia del paciente.'
      };
    }

    // Caso G: Ocupación muy alta / Saturación (>= 90%)
    return {
      status: 'warning',
      badge: 'Cercanía al límite de capacidad',
      title: 'Tu agenda se encuentra próxima al tope operativo',
      fact: `Tu ocupación estimada es del ${formatPct(occupancyRate)}. Estás operando con el ${formatInteger(A)} de ${formatInteger(monthlyCapacity)} citas completadas.`,
      capacityState: `Dispones de muy pocos espacios adicionales (${formatInteger(availableAppointments)} citas en todo el mes) bajo este modelo. ${bottleneck}`,
      advice: 'Comprueba tus horarios, disponibilidad y descanso del personal antes de asumir más compromisos de atención o lanzar ofertas masivas que puedan generar tiempos de espera prolongados.'
    };
  }

  // =========================================================================
  // 4. GENERADOR DE RESUMEN DE TEXTO (COPIAR AL PORTAPAPELES)
  // =========================================================================

  function generateSummaryText(result) {
    if (!result) return '';
    const {
      P, C, R, noCabinLimit, H, D, T, A, V,
      S, Q, monthlyCapacity, occupancyRate, isInconsistent,
      availableAppointments, currentRevenue, maxTheoreticalRevenue,
      scenarios, goal, interpretation
    } = result;

    const lines = [
      '================================================================',
      'GLOSS & GROWTH · SIMULADOR DE CAPACIDAD INSTALADA Y OCUPACIÓN',
      'https://glossgrowthhq.com/recursos/capacidad-instalada/',
      '================================================================',
      '',
      '1. CONFIGURACIÓN DEL NEGOCIO',
      `• Profesionales disponibles: ${P}`,
      `• Cabinas / Espacios de atención: ${noCabinLimit ? 'No depende de cabina fija' : C}`,
      `• Profesionales necesarios por cita: ${R}`,
      `• Horas efectivas diarias: ${formatDecimal(H)} h`,
      `• Días de atención al mes: ${D} días`,
      `• Duración por cita (con preparación): ${T} min`,
      `• Citas completas por jornada/espacio: ${Q} citas`,
      `• Atenciones simultáneas posibles: ${S}`,
      '',
      '2. ACTIVIDAD Y VOLUMEN ACTUAL',
      `• Citas realmente atendidas al mes: ${formatInteger(A)}`,
      `• Ingreso promedio por cita: ${formatCOP(V)}`,
      '',
      '3. RESULTADOS PRINCIPALES',
      `• Capacidad mensual estimada: ${formatInteger(monthlyCapacity)} citas al mes`,
      `• Tasa de ocupación actual: ${formatPct(occupancyRate)}`,
      `• Capacidad disponible restante: ${isInconsistent ? 'Inconsistente (excede capacidad)' : formatInteger(availableAppointments) + ' citas'}`,
      `• Facturación actual estimada: ${formatCOP(currentRevenue)}`,
      `• Facturación máxima teórica: ${formatCOP(maxTheoreticalRevenue)}`,
      '',
      '4. ESCENARIOS DE CRECIMIENTO EN OCUPACIÓN'
    ];

    if (scenarios && scenarios.length) {
      scenarios.forEach(sc => {
        if (sc.isExceeded) {
          lines.push(`• Nivel ${sc.label}: ${formatInteger(sc.targetAppointments)} citas (${formatCOP(sc.targetRevenue)}) — Tu ocupación actual ya supera este nivel.`);
        } else {
          lines.push(`• Nivel ${sc.label}: ${formatInteger(sc.targetAppointments)} citas (+${formatInteger(sc.additionalAppointments)} citas) → Potencial: ${formatCOP(sc.targetRevenue)} (+${formatCOP(sc.additionalRevenue)} adicionales)`);
        }
      });
    }

    if (goal) {
      lines.push('');
      lines.push('5. SIMULACIÓN DE META DE FACTURACIÓN');
      lines.push(`• Meta deseada: ${formatCOP(goal.targetRevenue)}`);
      lines.push(`• Citas necesarias: ${formatInteger(goal.neededAppointments)} citas (${formatPct(goal.requiredOccupancy)} de ocupación)`);
      if (goal.isExceedingCapacity) {
        lines.push(`• Estado: Con tus horarios y recursos actuales, esta meta supera la capacidad estimada.`);
      } else {
        lines.push(`• Citas adicionales para alcanzarla: +${formatInteger(goal.additionalAppointmentsNeeded)} citas.`);
      }
    }

    if (interpretation) {
      lines.push('');
      lines.push('6. CRITERIO Y REFLEXIÓN ESTRATÉGICA');
      lines.push(`• ${interpretation.title}`);
      lines.push(`• Hecho: ${interpretation.fact}`);
      lines.push(`• Disponibilidad: ${interpretation.capacityState}`);
      lines.push(`• Sugerencia: ${interpretation.advice}`);
    }

    lines.push('');
    lines.push('Nota: Esta es una simulación de capacidad e ingresos brutos potenciales bajo supuestos homogéneos. No predice demanda, reservas ni ventas garantizadas.');
    lines.push('================================================================');

    return lines.join('\n');
  }


  // =========================================================================
  // 5. MOTOR ANALÍTICO DE CAPACIDAD AVANZADA (MULTI-RECURSOS Y HORARIOS)
  // =========================================================================

  function calculateAdvancedCapacity(params = {}) {
    const gridInterval = params.gridIntervalMinutes || 15;
    const daysPerMonth = params.daysPerMonth || 22;
    const cancellationPct = Math.max(0, Math.min(100, params.cancellationsPct || 0));

    const treatments = (params.treatments || []).map(t => {
      const rawDur = t.durationMinutes || 60;
      const rawCleanup = t.setupCleanupMinutes || 0;
      const totalMin = rawDur + rawCleanup;
      const effectiveDuration = Math.ceil(totalMin / gridInterval) * gridInterval;
      return {
        id: t.id || 't1',
        name: t.name || 'Tratamiento',
        durationMinutes: rawDur,
        setupCleanupMinutes: rawCleanup,
        effectiveDuration,
        requiredStaffCount: Math.max(1, t.requiredStaffCount || 1),
        requiredEquipmentId: t.requiredEquipmentId || null,
        price: parseNumber(t.price || 0),
        targetMonthlySessions: t.targetMonthlySessions || 0
      };
    });

    const staff = (params.professionals || []).map(p => ({
      id: p.id || 'p1',
      name: p.name || 'Profesional',
      startHour: p.startHour !== undefined ? p.startHour : 9,
      endHour: p.endHour !== undefined ? p.endHour : 17,
      pauseStart: p.pauseStart !== undefined ? p.pauseStart : null,
      pauseEnd: p.pauseEnd !== undefined ? p.pauseEnd : null,
      allowedTreatments: Array.isArray(p.allowedTreatments) ? p.allowedTreatments : (treatments.map(t => t.id))
    }));

    const cabins = (params.cabins || []).map(c => ({
      id: c.id || 'c1',
      name: c.name || 'Cabina',
      startHour: c.startHour !== undefined ? c.startHour : 9,
      endHour: c.endHour !== undefined ? c.endHour : 17,
      allowedTreatments: Array.isArray(c.allowedTreatments) ? c.allowedTreatments : (treatments.map(t => t.id))
    }));

    const equipment = (params.equipment || []).map(e => ({
      id: e.id || 'eq1',
      name: e.name || 'Equipo',
      units: Math.max(0, e.units !== undefined ? e.units : 1),
      startHour: e.startHour !== undefined ? e.startHour : 9,
      endHour: e.endHour !== undefined ? e.endHour : 17
    }));

    const packages = (params.packages || []).map(pkg => {
      const total = pkg.totalSessions || 0;
      const completed = pkg.completedSessions || 0;
      const booked = pkg.bookedSessions || 0;
      const pending = Math.max(0, total - completed);
      const unbooked = Math.max(0, pending - booked);
      return {
        id: pkg.id,
        name: pkg.name || 'Paquete',
        totalSessions: total,
        completedSessions: completed,
        pendingSessions: pending,
        bookedPendingSessions: booked,
        unbookedPendingSessions: unbooked
      };
    });

    const packageSummary = {
      totalOriginalSessions: packages.reduce((acc, p) => acc + p.totalSessions, 0),
      completedSessions: packages.reduce((acc, p) => acc + p.completedSessions, 0),
      pendingSessions: packages.reduce((acc, p) => acc + p.pendingSessions, 0),
      bookedPendingSessions: packages.reduce((acc, p) => acc + p.bookedPendingSessions, 0),
      unbookedPendingSessions: packages.reduce((acc, p) => acc + p.unbookedPendingSessions, 0)
    };

    if (treatments.length === 0 || staff.length === 0 || cabins.length === 0) {
      return {
        dailyAppointments: 0,
        monthlyCapacity: 0,
        effectiveAttended: 0,
        monthlyPotentialRevenue: 0,
        treatmentsResults: [],
        packageSummary,
        bottleneck: 'Sin recursos suficientes configurados',
        daysPerMonth,
        cancellationPct
      };
    }

    let minStart = 24 * 60;
    let maxEnd = 0;
    staff.forEach(s => {
      minStart = Math.min(minStart, s.startHour * 60);
      maxEnd = Math.max(maxEnd, s.endHour * 60);
    });
    cabins.forEach(c => {
      minStart = Math.min(minStart, c.startHour * 60);
      maxEnd = Math.max(maxEnd, c.endHour * 60);
    });

    if (minStart >= maxEnd) {
      return {
        dailyAppointments: 0,
        monthlyCapacity: 0,
        effectiveAttended: 0,
        monthlyPotentialRevenue: 0,
        treatmentsResults: [],
        packageSummary,
        bottleneck: 'Horarios inconsistentes',
        daysPerMonth,
        cancellationPct
      };
    }

    function isStaffFree(s, t, dur, staffBusy) {
      const startM = s.startHour * 60;
      const endM = s.endHour * 60;
      if (t < startM || t + dur > endM) return false;
      if (s.pauseStart !== null && s.pauseEnd !== null) {
        const pStart = s.pauseStart * 60;
        const pEnd = s.pauseEnd * 60;
        if (Math.max(t, pStart) < Math.min(t + dur, pEnd)) return false;
      }
      for (let m = t; m < t + dur; m += gridInterval) {
        if (staffBusy[s.id] && staffBusy[s.id].has(m)) return false;
      }
      return true;
    }

    function isCabinFree(c, t, dur, cabinBusy) {
      const startM = c.startHour * 60;
      const endM = c.endHour * 60;
      if (t < startM || t + dur > endM) return false;
      for (let m = t; m < t + dur; m += gridInterval) {
        if (cabinBusy[c.id] && cabinBusy[c.id].has(m)) return false;
      }
      return true;
    }

    function isEquipmentFree(eqId, t, dur, eqBusy) {
      if (!eqId) return true;
      const eq = equipment.find(e => e.id === eqId);
      if (!eq || eq.units <= 0) return false;
      const startM = eq.startHour * 60;
      const endM = eq.endHour * 60;
      if (t < startM || t + dur > endM) return false;

      for (let m = t; m < t + dur; m += gridInterval) {
        const inUse = (eqBusy[eqId] && eqBusy[eqId][m]) || 0;
        if (inUse >= eq.units) return false;
      }
      return true;
    }

    function simulateDayForTreatment(treatment) {
      const staffBusy = {};
      staff.forEach(s => staffBusy[s.id] = new Set());
      const cabinBusy = {};
      cabins.forEach(c => cabinBusy[c.id] = new Set());
      const eqBusy = {};
      equipment.forEach(e => eqBusy[e.id] = {});

      let count = 0;
      const dur = treatment.effectiveDuration;
      const reqStaff = treatment.requiredStaffCount;
      const reqEq = treatment.requiredEquipmentId;

      for (let t = minStart; t + dur <= maxEnd; t += gridInterval) {
        const freeCabins = cabins.filter(c => c.allowedTreatments.includes(treatment.id) && isCabinFree(c, t, dur, cabinBusy));

        for (const cabin of freeCabins) {
          if (!isEquipmentFree(reqEq, t, dur, eqBusy)) break;

          const freeStaff = staff.filter(s => s.allowedTreatments.includes(treatment.id) && isStaffFree(s, t, dur, staffBusy));

          if (freeStaff.length >= reqStaff) {
            const chosenStaff = freeStaff.slice(0, reqStaff);
            for (let m = t; m < t + dur; m += gridInterval) {
              cabinBusy[cabin.id].add(m);
              chosenStaff.forEach(s => staffBusy[s.id].add(m));
              if (reqEq) {
                eqBusy[reqEq][m] = (eqBusy[reqEq][m] || 0) + 1;
              }
            }
            count++;
          }
        }
      }
      return count;
    }

    const treatmentsResults = treatments.map(t => {
      const dailyMax = simulateDayForTreatment(t);
      const monthlyMax = dailyMax * daysPerMonth;
      const potentialRev = monthlyMax * t.price;
      return {
        id: t.id,
        name: t.name,
        effectiveDuration: t.effectiveDuration,
        dailyMaxAppointments: dailyMax,
        monthlyMaxAppointments: monthlyMax,
        monthlyPotentialRevenue: potentialRev
      };
    });

    const primaryDaily = treatmentsResults[0] ? treatmentsResults[0].dailyMaxAppointments : 0;
    const monthlyCapacity = Math.round(primaryDaily * daysPerMonth);
    const effectiveAttended = Math.round(monthlyCapacity * (1 - cancellationPct / 100));
    const primaryPrice = treatments[0] ? treatments[0].price : 0;
    const monthlyPotentialRevenue = effectiveAttended * primaryPrice;

    let bottleneck = 'Recursos equilibrados';
    const totalStaffHours = staff.reduce((acc, s) => {
      let h = s.endHour - s.startHour;
      if (s.pauseStart !== null && s.pauseEnd !== null) h -= (s.pauseEnd - s.pauseStart);
      return acc + Math.max(0, h);
    }, 0);
    const totalCabinHours = cabins.reduce((acc, c) => acc + Math.max(0, c.endHour - c.startHour), 0);

    if (staff.length < cabins.length && totalStaffHours < totalCabinHours) {
      bottleneck = 'Personal disponible limita la atención frente al número de cabinas';
    } else if (cabins.length < staff.length && totalCabinHours < totalStaffHours) {
      bottleneck = 'Espacio físico (cabinas) actúa como el límite operativo principal';
    } else if (equipment.some(e => e.units === 1 && treatments.some(t => t.requiredEquipmentId === e.id))) {
      bottleneck = 'Disponibilidad de equipo compartido como restricción principal';
    }

    return {
      dailyAppointments: primaryDaily,
      monthlyCapacity,
      effectiveAttended,
      monthlyPotentialRevenue,
      treatmentsResults,
      packageSummary,
      bottleneck,
      daysPerMonth,
      cancellationPct
    };
  }

  // API pública
  return {
    parseNumber,
    formatCOP,
    formatPct,
    formatDecimal,
    formatInteger,
    calculateCapacity,
    calculateAdvancedCapacity,
    generateInterpretation,
    generateSummaryText
  };
}));
