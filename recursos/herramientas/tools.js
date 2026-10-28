'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const fmtCOP = (val) => {
    if (val === null || val === undefined || !Number.isFinite(val)) return '—';
    const num = Math.round(val);
    const sign = num < 0 ? '−' : '';
    return sign + '$' + Math.abs(num).toLocaleString('es-CO') + ' COP';
  };

  const fmtPct = (val) => {
    if (val === null || val === undefined || !Number.isFinite(val)) return '—%';
    return val.toFixed(1).replace('.', ',') + '%';
  };

  // =========================================================================
  // HERRAMIENTA 01: CALCULADORA DE COSTOS Y RENTABILIDAD POR TRATAMIENTO
  // =========================================================================
  const parseNum = (val) => {
    if (window.GlossReportEngine && window.GlossReportEngine.parseNumber) {
      return window.GlossReportEngine.parseNumber(val);
    }
    if (val === null || val === undefined || val === '') return 0;
    if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
    let s = String(val).replace(/[\$\s]/g, '');
    if ((s.match(/\./g) || []).length > 1) s = s.replace(/\./g, '');
    else if (s.includes('.') && s.split('.')[1].length === 3) s = s.replace(/\./g, '');
    return parseFloat(s) || 0;
  };

  let lastTreatmentData = null;

  const tInputs = {
    businessName: document.getElementById('t-business-name'),
    nombre: document.getElementById('t-nombre'),
    tipo: document.getElementById('t-tipo'),
    sesionesPaquete: document.getElementById('t-sesiones-paquete'),
    modoCostosPaquete: document.getElementById('t-modo-costos-paquete'),
    precio: document.getElementById('t-precio'),
    insumos: document.getElementById('t-insumos'),
    tiempo: document.getElementById('t-tiempo'),
    honorarios: document.getElementById('t-honorarios'),
    fijos: document.getElementById('t-fijos'),
    comision: document.getElementById('t-comision'),
    sesiones: document.getElementById('t-sesiones')
  };

  const tGroupPaquete = document.getElementById('t-group-paquete');

  const tOutputs = {
    titleName: document.getElementById('t-out-name'),
    margenContribucion: document.getElementById('t-out-margen-contribucion'),
    margenContribucionPct: document.getElementById('t-out-margen-contribucion-pct'),
    costoVariable: document.getElementById('t-out-costo-variable'),
    margenBruto: document.getElementById('t-out-margen-bruto'),
    costoFijoUnit: document.getElementById('t-out-costo-fijo-unit'),
    utilidadSesion: document.getElementById('t-out-utilidad-sesion'),
    margenNeto: document.getElementById('t-out-margen-neto'),
    utilidadHora: document.getElementById('t-out-utilidad-hora'),
    ingresoMensual: document.getElementById('t-out-ingreso-mensual'),
    utilidadMensual: document.getElementById('t-out-utilidad-mensual'),
    barDirect: document.getElementById('t-bar-direct'),
    barFixed: document.getElementById('t-bar-fixed'),
    barProfit: document.getElementById('t-bar-profit'),
    diagNote: document.getElementById('t-out-diagnostic')
  };

  const presetsTratamiento = {
    toxina: {
      nombre: 'Aplicación de Toxina Botulínica (3 zonas)',
      tipo: 'individual',
      precio: 950000,
      insumos: 290000,
      tiempo: 45,
      honorarios: 140000,
      fijos: 65000,
      comision: 3.5,
      sesiones: 24
    },
    hialuronico: {
      nombre: 'Armonización Labial con Ácido Hialurónico (1 ml)',
      tipo: 'individual',
      precio: 1250000,
      insumos: 380000,
      tiempo: 60,
      honorarios: 180000,
      fijos: 80000,
      comision: 3.5,
      sesiones: 18
    },
    hydrafacial: {
      nombre: 'Protocolo Facial de Limpieza e Hidratación',
      tipo: 'individual',
      precio: 240000,
      insumos: 42000,
      tiempo: 60,
      honorarios: 45000,
      fijos: 35000,
      comision: 3.0,
      sesiones: 45
    },
    paquete: {
      nombre: 'Paquete Corporal Reductor y Drenante (6 sesiones)',
      tipo: 'paquete',
      sesionesPaquete: 6,
      modoCostos: 'por-sesion',
      precio: 1200000,
      insumos: 35000,
      tiempo: 50,
      honorarios: 40000,
      fijos: 30000,
      comision: 3.5,
      sesiones: 8
    },
    limpiar: {
      nombre: 'Tratamiento personalizado',
      tipo: 'individual',
      precio: 500000,
      insumos: 120000,
      tiempo: 45,
      honorarios: 80000,
      fijos: 45000,
      comision: 0,
      sesiones: 20
    }
  };

  function updateModeVisibility() {
    if (!tInputs.tipo || !tGroupPaquete) return;
    const isPaquete = tInputs.tipo.value === 'paquete';
    tGroupPaquete.style.display = isPaquete ? 'grid' : 'none';
  }

  function calcTratamiento() {
    if (!tInputs.precio) return;

    const nombre = (tInputs.nombre?.value || 'Tratamiento evaluado').trim();
    const isPaquete = tInputs.tipo?.value === 'paquete';
    const numSesionesPaquete = isPaquete ? Math.max(1, parseInt(tInputs.sesionesPaquete?.value, 10) || 1) : 1;
    const modoCostosPaquete = tInputs.modoCostosPaquete?.value || 'por-sesion';

    const precio = Math.max(0, parseNum(tInputs.precio.value));
    const insumosRaw = Math.max(0, parseNum(tInputs.insumos.value));
    const tiempoRaw = Math.max(0, parseNum(tInputs.tiempo.value));
    const honorariosRaw = Math.max(0, parseNum(tInputs.honorarios.value));
    const fijosRaw = Math.max(0, parseNum(tInputs.fijos.value));
    const comisionPct = Math.min(100, Math.max(0, parseNum(tInputs.comision.value)));
    
    // Sesiones mensuales: el valor 0 es completamente válido
    const sesionesVal = tInputs.sesiones.value !== '' ? parseNum(tInputs.sesiones.value) : 0;
    const sesiones = Math.max(0, Number.isFinite(sesionesVal) ? sesionesVal : 0);

    // Cálculo según modalidad individual o paquete
    let insumosTotal = insumosRaw;
    let honorariosTotal = honorariosRaw;
    let fijosTotal = fijosRaw;
    let tiempoTotalMinutos = tiempoRaw;

    if (isPaquete) {
      if (modoCostosPaquete === 'por-sesion') {
        insumosTotal = insumosRaw * numSesionesPaquete;
        honorariosTotal = honorariosRaw * numSesionesPaquete;
        fijosTotal = fijosRaw * numSesionesPaquete;
        tiempoTotalMinutos = tiempoRaw * numSesionesPaquete;
      } else {
        // Ingresó totales para el paquete completo
        insumosTotal = insumosRaw;
        honorariosTotal = honorariosRaw;
        fijosTotal = fijosRaw;
        tiempoTotalMinutos = tiempoRaw * numSesionesPaquete;
      }
    }

    // Costo por comisión de pasarela/datáfono sobre el precio de venta total
    const costoComision = precio * (comisionPct / 100);

    // SEPARACIÓN ESTRICTA: Costos variables directos vs Gastos fijos
    const costoVariableTotal = insumosTotal + honorariosTotal + costoComision;
    const margenContribucion = precio - costoVariableTotal;
    const margenContribucionPct = precio > 0 ? (margenContribucion / precio) * 100 : 0;

    // Resultado tras costos fijos asignados
    const costoTotal = costoVariableTotal + fijosTotal;
    const resultadoTrasFijos = margenContribucion - fijosTotal;
    const margenTrasFijosPct = precio > 0 ? (resultadoTrasFijos / precio) * 100 : 0;

    // Rentabilidad por hora clínica (REQUIERE TIEMPO > 0; nunca NaN o Infinity)
    let utilidadPorHora = null;
    if (tiempoTotalMinutos > 0) {
      utilidadPorHora = (resultadoTrasFijos / tiempoTotalMinutos) * 60;
    }

    // Proyecciones mensuales
    const ingresoMensual = precio * sesiones;
    const utilidadMensual = resultadoTrasFijos * sesiones;

    // Render de textos en UI
    if (tOutputs.titleName) {
      tOutputs.titleName.textContent = nombre + (isPaquete ? ` (Paquete de ${numSesionesPaquete} sesiones)` : '');
    }
    if (tOutputs.margenContribucion) {
      tOutputs.margenContribucion.textContent = fmtCOP(margenContribucion);
      tOutputs.margenContribucion.style.color = margenContribucion < 0 ? '#991B1B' : 'var(--burgundy)';
    }
    if (tOutputs.margenContribucionPct) {
      tOutputs.margenContribucionPct.textContent = precio > 0 ? `${fmtPct(margenContribucionPct)} del precio de venta` : '—';
    }
    if (tOutputs.costoVariable) {
      tOutputs.costoVariable.textContent = fmtCOP(costoVariableTotal);
    }
    if (tOutputs.margenBruto) {
      tOutputs.margenBruto.textContent = fmtPct(margenContribucionPct);
    }
    if (tOutputs.costoFijoUnit) {
      tOutputs.costoFijoUnit.textContent = fmtCOP(fijosTotal);
    }
    if (tOutputs.utilidadSesion) {
      tOutputs.utilidadSesion.textContent = fmtCOP(resultadoTrasFijos);
      tOutputs.utilidadSesion.style.color = resultadoTrasFijos < 0 ? '#991B1B' : 'var(--burgundy)';
    }
    if (tOutputs.margenNeto) {
      tOutputs.margenNeto.textContent = fmtPct(margenTrasFijosPct);
    }
    if (tOutputs.utilidadHora) {
      if (tiempoTotalMinutos <= 0) {
        tOutputs.utilidadHora.textContent = '— (requiere duración > 0)';
        tOutputs.utilidadHora.style.fontSize = '12px';
      } else {
        tOutputs.utilidadHora.textContent = fmtCOP(utilidadPorHora) + '/h';
        tOutputs.utilidadHora.style.fontSize = '';
      }
    }
    if (tOutputs.ingresoMensual) {
      tOutputs.ingresoMensual.textContent = fmtCOP(ingresoMensual);
    }
    if (tOutputs.utilidadMensual) {
      tOutputs.utilidadMensual.textContent = fmtCOP(utilidadMensual);
      tOutputs.utilidadMensual.style.color = utilidadMensual < 0 ? '#991B1B' : 'var(--burgundy)';
    }

    // Barra visual de estructura de costos
    if (precio > 0 && margenContribucion >= 0) {
      const pVar = Math.min(100, (costoVariableTotal / precio) * 100);
      const pFixed = Math.min(100 - pVar, (fijosTotal / precio) * 100);
      const pProfit = Math.max(0, 100 - pVar - pFixed);
      if (tOutputs.barDirect) tOutputs.barDirect.style.width = pVar.toFixed(1) + '%';
      if (tOutputs.barFixed) tOutputs.barFixed.style.width = pFixed.toFixed(1) + '%';
      if (tOutputs.barProfit) tOutputs.barProfit.style.width = pProfit.toFixed(1) + '%';
    } else {
      if (tOutputs.barDirect) tOutputs.barDirect.style.width = '75%';
      if (tOutputs.barFixed) tOutputs.barFixed.style.width = '25%';
      if (tOutputs.barProfit) tOutputs.barProfit.style.width = '0%';
    }

    // DIAGNÓSTICO EN TRES PARTES BASADO ESTRICTAMENTE EN EVIDENCIA (SIN AFIRMACIONES INJUSTIFICADAS)
    if (tOutputs.diagNote) {
      if (precio === 0) {
        tOutputs.diagNote.innerHTML = `
          <div style="font-size:13px;line-height:1.5;">
            <strong>Hecho matemático:</strong> No se ha ingresado un precio de venta para este procedimiento.<br>
            <strong>Qué significa:</strong> Es indispensable indicar una tarifa para determinar si los insumos y honorarios son cubiertos.<br>
            <strong>Revisión prudente:</strong> Completa el precio de venta en el campo 3 para ver el análisis de rentabilidad.
          </div>
        `;
      } else if (margenContribucion < 0) {
        tOutputs.diagNote.innerHTML = `
          <div style="font-size:13px;line-height:1.5;color:#991B1B;">
            <strong>Hecho matemático:</strong> Los costos variables directos (${fmtCOP(costoVariableTotal)}) superan el precio de venta (${fmtCOP(precio)}), dejando un margen de contribución negativo de ${fmtCOP(margenContribucion)}.<br>
            <strong>Qué significa para el negocio:</strong> Cada servicio vendido genera una pérdida directa antes de pagar arriendo, nómina fija o publicidad.<br>
            <strong>Revisión recomendada:</strong> Revisa de inmediato el precio cobrado y negocia insumos u honorarios con proveedores y especialistas antes de comercializar este procedimiento.
          </div>
        `;
      } else if (resultadoTrasFijos < 0) {
        tOutputs.diagNote.innerHTML = `
          <div style="font-size:13px;line-height:1.5;">
            <strong>Hecho matemático:</strong> El margen de contribución es positivo (${fmtCOP(margenContribucion)}, ${fmtPct(margenContribucionPct)}), pero la cuota estimada de costos fijos asignada (${fmtCOP(fijosTotal)}) supera dicho excedente, dejando un déficit estimado de ${fmtCOP(resultadoTrasFijos)} por venta.<br>
            <strong>Qué significa para el negocio:</strong> El tratamiento cubre sus insumos y comisiones, pero con el prorrateo fijo actual no aporta a la ganancia operativa global.<br>
            <strong>Revisión recomendada:</strong> Evalúa si aumentando el volumen de atenciones mensuales o ajustando la tarifa se logra absorber la estructura fija de cabina.
          </div>
        `;
      } else {
        const tiempoMsg = tiempoTotalMinutos <= 0 ? ' No se especificó tiempo en cabina, por lo que no se evaluó rentabilidad por hora.' : ` Con ${tiempoTotalMinutos} minutos en cabina, genera una tasa de ${fmtCOP(utilidadPorHora)}/h tras costos fijos.`;
        tOutputs.diagNote.innerHTML = `
          <div style="font-size:13px;line-height:1.5;">
            <strong>Hecho matemático:</strong> Cada venta aporta ${fmtCOP(margenContribucion)} (${fmtPct(margenContribucionPct)}) de margen de contribución directo y ${fmtCOP(resultadoTrasFijos)} tras absorber la cuota de costos fijos asignada.${tiempoMsg}<br>
            <strong>Qué significa para el negocio:</strong> El procedimiento cuenta con margen positivo para contribuir a los gastos de la empresa y deja un excedente unitario tras fijos.<br>
            <strong>Revisión recomendada:</strong> Puedes utilizar este margen de contribución (${fmtCOP(margenContribucion)}) en la calculadora publicitaria para conocer con precisión cuántos tratamientos tendrías que vender antes de pautar.
          </div>
        `;
      }
    }

    // Guardar estado del cálculo activo para el generador de reportes
    lastTreatmentData = {
      nombre,
      isPaquete,
      numSesionesPaquete,
      precio,
      insumosTotal,
      honorariosTotal,
      costoComision,
      costoVariableTotal,
      margenContribucion,
      margenContribucionPct,
      fijosTotal,
      resultadoTrasFijos,
      margenTrasFijosPct,
      utilidadPorHora,
      tiempoTotalMinutos,
      sesiones,
      ingresoMensual,
      utilidadMensual,
      interpretacion: tOutputs.diagNote ? tOutputs.diagNote.innerText.replace(/\s+/g, ' ').trim() : ''
    };
  }

  // Event listeners para inputs de tratamiento
  Object.values(tInputs).forEach(input => {
    if (input) {
      input.addEventListener('input', calcTratamiento);
      input.addEventListener('change', () => {
        updateModeVisibility();
        calcTratamiento();
      });
    }
  });

  // Presets
  document.querySelectorAll('[data-preset-tratamiento]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.presetTratamiento;
      const data = presetsTratamiento[key];
      if (!data) return;

      if (tInputs.nombre) tInputs.nombre.value = data.nombre;
      if (tInputs.tipo) tInputs.tipo.value = data.tipo || 'individual';
      if (tInputs.sesionesPaquete) tInputs.sesionesPaquete.value = data.sesionesPaquete || 6;
      if (tInputs.modoCostosPaquete) tInputs.modoCostosPaquete.value = data.modoCostos || 'por-sesion';
      if (tInputs.precio) tInputs.precio.value = data.precio;
      if (tInputs.insumos) tInputs.insumos.value = data.insumos;
      if (tInputs.tiempo) tInputs.tiempo.value = data.tiempo;
      if (tInputs.honorarios) tInputs.honorarios.value = data.honorarios;
      if (tInputs.fijos) tInputs.fijos.value = data.fijos;
      if (tInputs.comision) tInputs.comision.value = data.comision;
      if (tInputs.sesiones) tInputs.sesiones.value = data.sesiones;

      updateModeVisibility();
      calcTratamiento();
    });
  });

  // Botón para transferir a la calculadora publicitaria:
  // IMPORTANTE (SECCIÓN 4 Y 12): Se transfiere estrictamente el COSTO VARIABLE (sin incluir fijos)
  const btnExportToCalc = document.getElementById('btn-export-treatment-to-calc');
  if (btnExportToCalc) {
    btnExportToCalc.addEventListener('click', () => {
      const isPaquete = tInputs.tipo?.value === 'paquete';
      const numSesionesPaquete = isPaquete ? Math.max(1, parseInt(tInputs.sesionesPaquete?.value, 10) || 1) : 1;
      const modoCostosPaquete = tInputs.modoCostosPaquete?.value || 'por-sesion';

      const nombre = (tInputs.nombre?.value || 'Tratamiento evaluado').trim();
      const bName = (tInputs.businessName?.value || '').trim();
      const precio = parseNum(tInputs.precio?.value);
      const insumosRaw = parseNum(tInputs.insumos?.value);
      const honorariosRaw = parseNum(tInputs.honorarios?.value);
      const comisionPct = parseNum(tInputs.comision?.value);

      let insumosTotal = insumosRaw;
      let honorariosTotal = honorariosRaw;
      if (isPaquete && modoCostosPaquete === 'por-sesion') {
        insumosTotal = insumosRaw * numSesionesPaquete;
        honorariosTotal = honorariosRaw * numSesionesPaquete;
      }

      const costoComision = precio * (comisionPct / 100);
      // Costo variable PURO (sin gastos fijos)
      const costoVariablePuro = insumosTotal + honorariosTotal + costoComision;
      const margenContribucion = precio - costoVariablePuro;
      const margenPct = precio > 0 ? (margenContribucion / precio) * 100 : 0;

      const profile = {
        name: nombre,
        businessName: bName,
        serviceType: isPaquete ? 'paquete' : 'individual',
        packageSessions: isPaquete ? numSesionesPaquete : 1,
        price: precio,
        variableCost: Math.round(costoVariablePuro),
        contributionMargin: Math.round(margenContribucion),
        marginPct: Number(margenPct.toFixed(2)),
        timestamp: new Date().toISOString()
      };

      try {
        localStorage.setItem('gloss_treatment_profile', JSON.stringify(profile));
      } catch (e) {}

      // Si la calculadora publicitaria está en la misma página (Herramienta 02)
      const planPrice = document.getElementById('plan-price');
      const planCost = document.getElementById('plan-var-cost-amount');
      const planName = document.getElementById('plan-service-name');
      const planType = document.getElementById('plan-service-type');
      const planSessions = document.getElementById('plan-package-sessions');
      const planBusName = document.getElementById('plan-business-name');

      if (planPrice && planCost) {
        if (bName && planBusName) {
          planBusName.value = bName;
          planBusName.dispatchEvent(new Event('input'));
        }
        planPrice.value = precio;
        planCost.value = Math.round(costoVariablePuro);
        if (planName) planName.value = nombre;
        if (planType) {
          planType.value = isPaquete ? 'paquete' : 'individual';
          planType.dispatchEvent(new Event('change'));
        }
        if (isPaquete && planSessions) planSessions.value = numSesionesPaquete;

        // Disparar recálculo reactivo
        planPrice.dispatchEvent(new Event('input'));
        planCost.dispatchEvent(new Event('input'));

        // Desplazar suavemente a la Herramienta 02
        const targetCalc = document.getElementById('calc-publicidad');
        if (targetCalc) {
          targetCalc.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        if (window.GlossStorage && window.GlossStorage.stageTreatmentToRoas) {
          window.GlossStorage.stageTreatmentToRoas(profile);
        }
        window.location.href = '../calculadora-publicidad/?precio=' + encodeURIComponent(precio) +
          '&costo=' + encodeURIComponent(Math.round(costoVariablePuro)) +
          '&nombre=' + encodeURIComponent(nombre) +
          (bName ? '&negocio=' + encodeURIComponent(bName) : '');
      }
    });
  }

  // Botón Exportar datos a Calculadora de Inversión en Aparatología
  const btnExportAparatologia = document.getElementById('t-btn-export-aparatologia');
  if (btnExportAparatologia) {
    btnExportAparatologia.addEventListener('click', () => {
      calcTratamiento();
      const storage = window.GlossStorage;
      const nombre = (tInputs.nombre?.value || 'Tratamiento evaluado').trim();
      const bName = (tInputs.businessName?.value || '').trim();
      const precio = parseNum(tInputs.precio?.value);
      const costoVar = lastTreatmentData ? lastTreatmentData.costoVariableTotal : 0;
      const margenPct = lastTreatmentData ? lastTreatmentData.margenContribucionPct : 0;
      const horas = lastTreatmentData ? (lastTreatmentData.tiempoTotalMinutos / 60) : 1;
      const sesionesMes = lastTreatmentData ? lastTreatmentData.sesionesMensuales : 30;

      if (storage && storage.stageTreatmentToAparatologia) {
        storage.stageTreatmentToAparatologia({
          treatmentName: nombre,
          businessName: bName,
          pricePerSession: precio,
          variableCostPerSession: costoVar,
          marginPct: margenPct,
          hoursPerSession: horas,
          monthlySessions: sesionesMes
        });
      }
      window.location.href = '../inversion-aparatologia/';
    });
  }

  // Inicializar Currency Picker y Storage para Herramienta 01
  const tCurrContainer = document.getElementById('t-currency-picker-container');
  if (window.GlossCurrency && tCurrContainer) {
    window.GlossCurrency.initPicker(tCurrContainer, {
      id: 't-currency-select',
      onChange: () => {
        calcTratamiento();
        if (typeof calcPromociones === 'function') calcPromociones();
      }
    });
  }

  const tStorageContainer = document.getElementById('t-storage-container');
  if (window.GlossStorage && tStorageContainer) {
    tStorageContainer.innerHTML = window.GlossStorage.renderStorageControlsHtml('rentabilidad_tratamiento', 'Rentabilidad por Tratamiento');
    window.GlossStorage.bindStorageUI(tStorageContainer, 'rentabilidad_tratamiento', {
      getDefaultName: () => (tInputs.nombre?.value || 'Tratamiento') + ' — ' + new Date().toLocaleDateString('es-CO', { month: 'short', year: 'numeric' }),
      getInputs: () => ({
        businessName: tInputs.businessName?.value || '',
        nombre: tInputs.nombre?.value || '',
        tipo: tInputs.tipo?.value || 'individual',
        sesionesPaquete: tInputs.sesionesPaquete?.value || '',
        modoCostosPaquete: tInputs.modoCostosPaquete?.value || 'por-sesion',
        precio: tInputs.precio?.value || '',
        insumos: tInputs.insumos?.value || '',
        tiempo: tInputs.tiempo?.value || '',
        honorarios: tInputs.honorarios?.value || '',
        fijos: tInputs.fijos?.value || '',
        comision: tInputs.comision?.value || '',
        sesiones: tInputs.sesiones?.value || ''
      }),
      getMeta: () => ({
        businessName: tInputs.businessName?.value || '',
        currency: window.GlossCurrency ? window.GlossCurrency.getSelectedCurrency() : 'COP'
      }),
      onLoad: (analysis) => {
        if (analysis && analysis.inputs) {
          const inp = analysis.inputs;
          if (tInputs.businessName && inp.businessName !== undefined) tInputs.businessName.value = inp.businessName;
          if (tInputs.nombre && inp.nombre !== undefined) tInputs.nombre.value = inp.nombre;
          if (tInputs.tipo && inp.tipo !== undefined) tInputs.tipo.value = inp.tipo;
          if (tInputs.sesionesPaquete && inp.sesionesPaquete !== undefined) tInputs.sesionesPaquete.value = inp.sesionesPaquete;
          if (tInputs.modoCostosPaquete && inp.modoCostosPaquete !== undefined) tInputs.modoCostosPaquete.value = inp.modoCostosPaquete;
          if (tInputs.precio && inp.precio !== undefined) tInputs.precio.value = inp.precio;
          if (tInputs.insumos && inp.insumos !== undefined) tInputs.insumos.value = inp.insumos;
          if (tInputs.tiempo && inp.tiempo !== undefined) tInputs.tiempo.value = inp.tiempo;
          if (tInputs.honorarios && inp.honorarios !== undefined) tInputs.honorarios.value = inp.honorarios;
          if (tInputs.fijos && inp.fijos !== undefined) tInputs.fijos.value = inp.fijos;
          if (tInputs.comision && inp.comision !== undefined) tInputs.comision.value = inp.comision;
          if (tInputs.sesiones && inp.sesiones !== undefined) tInputs.sesiones.value = inp.sesiones;
          calcTratamiento();
        }
      }
    });
  }

  // Acciones: Copiar resultados y Descargar PDF para Herramienta 01
  const btnCopyTreatment = document.getElementById('t-btn-copy');
  const btnPdfTreatment = document.getElementById('t-btn-pdf');

  if (btnCopyTreatment) {
    btnCopyTreatment.addEventListener('click', () => {
      if (!lastTreatmentData) calcTratamiento();
      const bName = (tInputs.businessName?.value || '').trim();
      if (window.GlossReportEngine && lastTreatmentData) {
        const text = window.GlossReportEngine.generateTratamientoClipboard({
          businessName: bName,
          treatment: lastTreatmentData
        });
        window.GlossReportEngine.copyToClipboard(text, () => {
          const orig = btnCopyTreatment.textContent;
          btnCopyTreatment.textContent = '¡Resultados copiados!';
          setTimeout(() => btnCopyTreatment.textContent = orig, 2200);
        });
      }
    });
  }

  if (btnPdfTreatment) {
    btnPdfTreatment.addEventListener('click', () => {
      if (!lastTreatmentData) calcTratamiento();
      const bName = (tInputs.businessName?.value || '').trim();
      if (window.GlossReportEngine && lastTreatmentData) {
        window.GlossReportEngine.generateTratamientoPdf({
          businessName: bName,
          treatment: lastTreatmentData
        });
      }
    });
  }

  // Inicialización de Herramienta 01
  updateModeVisibility();
  calcTratamiento();

  // =========================================================================
  // MODULO INTEGRADO: SIMULADOR DE PRECIOS Y PROMOCIONES
  // =========================================================================

  const tabBtnRegular = document.getElementById('tab-btn-regular');
  const tabBtnPromos = document.getElementById('tab-btn-promos');
  const btnGotoPromos = document.getElementById('btn-goto-promos');
  const btnBackToRegular = document.getElementById('btn-back-to-regular');

  const panelRegular = document.getElementById('panel-treatment-regular');
  const panelPromos = document.getElementById('panel-treatment-promos');

  const promoBadgeName = document.getElementById('promo-badge-name');
  const promoBadgePrice = document.getElementById('promo-badge-price');
  const promoBadgeCost = document.getElementById('promo-badge-cost');
  const promoModalityBadge = document.getElementById('promo-modality-badge');

  let currentPromoModality = 'discount';
  let lastPromoData = null;

  // Lista inicial de items para el Combo (2 items por defecto)
  let comboItems = [
    { name: 'Limpieza facial profunda', price: 120000, cost: 45000, quantity: 1 },
    { name: 'Masaje relajante y drenaje', price: 180000, cost: 70000, quantity: 1 }
  ];

  function switchTreatmentTab(tab) {
    if (tab === 'promos') {
      if (tabBtnRegular) {
        tabBtnRegular.classList.remove('active');
        tabBtnRegular.setAttribute('aria-selected', 'false');
      }
      if (tabBtnPromos) {
        tabBtnPromos.classList.add('active');
        tabBtnPromos.setAttribute('aria-selected', 'true');
      }
      if (panelRegular) panelRegular.style.display = 'none';
      if (panelPromos) panelPromos.style.display = 'block';

      syncBaseTreatmentToPromo();
      recalcPromo();
    } else {
      if (tabBtnRegular) {
        tabBtnRegular.classList.add('active');
        tabBtnRegular.setAttribute('aria-selected', 'true');
      }
      if (tabBtnPromos) {
        tabBtnPromos.classList.remove('active');
        tabBtnPromos.setAttribute('aria-selected', 'false');
      }
      if (panelRegular) panelRegular.style.display = 'block';
      if (panelPromos) panelPromos.style.display = 'none';
    }
  }

  if (tabBtnRegular) tabBtnRegular.addEventListener('click', () => switchTreatmentTab('regular'));
  if (tabBtnPromos) tabBtnPromos.addEventListener('click', () => switchTreatmentTab('promos'));
  if (btnGotoPromos) btnGotoPromos.addEventListener('click', () => switchTreatmentTab('promos'));
  if (btnBackToRegular) btnBackToRegular.addEventListener('click', () => switchTreatmentTab('regular'));

  function syncBaseTreatmentToPromo() {
    if (!lastTreatmentData) calcTratamiento();
    const t = lastTreatmentData || {};
    const baseName = t.nombre || 'Tratamiento evaluado';
    const basePrice = t.precio || 0;
    const baseVarCost = t.costoVariableTotal || 0;

    if (promoBadgeName) promoBadgeName.textContent = baseName;
    if (promoBadgePrice) promoBadgePrice.textContent = fmtCOP(basePrice);
    if (promoBadgeCost) promoBadgeCost.textContent = fmtCOP(baseVarCost);

    // Precargar en campos según corresponda si están vacíos o por defecto
    const packCostInput = document.getElementById('promo-pack-cost-per-session');
    if (packCostInput && (!packCostInput.value || packCostInput.dataset.userEdited !== 'true')) {
      const perSessionCost = (t.isPaquete && t.numSesionesPaquete > 1 && t.modoCostosPaquete === 'por-sesion')
        ? (t.costoVariableTotal / t.numSesionesPaquete)
        : baseVarCost;
      packCostInput.value = Math.round(perSessionCost);
    }

    const packPriceInput = document.getElementById('promo-pack-price');
    if (packPriceInput && (!packPriceInput.value || packPriceInput.dataset.userEdited !== 'true')) {
      packPriceInput.value = Math.round(basePrice * 0.8 * 8); // Referencia 8 sesiones con 20%
    }

    const targetVarCostInput = document.getElementById('promo-target-var-cost');
    if (targetVarCostInput && (!targetVarCostInput.value || targetVarCostInput.dataset.userEdited !== 'true')) {
      targetVarCostInput.value = Math.round(baseVarCost);
    }

    const customPriceInput = document.getElementById('promo-custom-price');
    if (customPriceInput && (!customPriceInput.value || customPriceInput.dataset.userEdited !== 'true')) {
      customPriceInput.value = Math.round(basePrice * 0.85);
    }

    // Actualizar primer item del combo si no fue editado por el usuario
    if (comboItems.length > 0 && !comboItems[0].customEdited) {
      comboItems[0].name = baseName;
      comboItems[0].price = basePrice > 0 ? basePrice : 120000;
      comboItems[0].cost = baseVarCost > 0 ? Math.round(baseVarCost) : 45000;
      renderComboItems();
    }
  }

  // Selector de Modalidad de Promoción
  const promoModalityBtns = document.querySelectorAll('[data-promo-modality]');
  promoModalityBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      promoModalityBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      currentPromoModality = btn.dataset.promoModality;
      document.querySelectorAll('.promo-modality-panel').forEach(p => p.style.display = 'none');
      const targetPanel = document.getElementById('promo-panel-' + currentPromoModality);
      if (targetPanel) targetPanel.style.display = 'block';

      if (promoModalityBadge) {
        promoModalityBadge.textContent = btn.innerText.trim();
      }

      recalcPromo();
    });
  });

  // Funciones Matemáticas del Simulador
  function simulateDiscount({ price, variableCost, discountPct, commissionPct = 0 }) {
    const d = Math.max(0, Math.min(100, discountPct));
    const promoPrice = price * (1 - d / 100);
    const savings = price - promoPrice;
    const commission = promoPrice * (commissionPct / 100);
    const totalVarCost = variableCost + commission;
    const contribution = promoPrice - totalVarCost;
    const marginPct = promoPrice > 0 ? (contribution / promoPrice) * 100 : 0;
    const regCommission = price * (commissionPct / 100);
    const regContribution = price - variableCost - regCommission;
    const diffContribution = contribution - regContribution;

    return {
      promoPrice,
      savings,
      discountPct: d,
      totalVarCost,
      contribution,
      marginPct,
      regularPrice: price,
      regularVarCost: variableCost + regCommission,
      regularContribution: regContribution,
      regularMarginPct: price > 0 ? (regContribution / price) * 100 : 0,
      diffContribution
    };
  }

  function simulateCustomPrice({ price, variableCost, promoPrice, commissionPct = 0 }) {
    const savings = price - promoPrice;
    const discountPct = price > 0 ? (savings / price) * 100 : 0;
    const commission = promoPrice * (commissionPct / 100);
    const totalVarCost = variableCost + commission;
    const contribution = promoPrice - totalVarCost;
    const marginPct = promoPrice > 0 ? (contribution / promoPrice) * 100 : 0;
    const regCommission = price * (commissionPct / 100);
    const regContribution = price - variableCost - regCommission;
    const diffContribution = contribution - regContribution;

    return {
      promoPrice,
      savings,
      discountPct,
      totalVarCost,
      contribution,
      marginPct,
      regularPrice: price,
      regularVarCost: variableCost + regCommission,
      regularContribution: regContribution,
      regularMarginPct: price > 0 ? (regContribution / price) * 100 : 0,
      diffContribution
    };
  }

  function simulate2x1({ price, variableCost, type = '2x1', commissionPct = 0 }) {
    let promoPrice = price;
    const sessions = 2;
    if (type === 'second50') {
      promoPrice = price * 1.5;
    }
    const regularTotal = price * sessions;
    const savings = regularTotal - promoPrice;
    const discountPct = regularTotal > 0 ? (savings / regularTotal) * 100 : 0;
    const commission = promoPrice * (commissionPct / 100);
    const totalVarCost = (variableCost * sessions) + commission;
    const contribution = promoPrice - totalVarCost;
    const marginPct = promoPrice > 0 ? (contribution / promoPrice) * 100 : 0;
    const regCommission = regularTotal * (commissionPct / 100);
    const regContribution = regularTotal - (variableCost * sessions) - regCommission;
    const diffContribution = contribution - regContribution;

    return {
      promoPrice,
      sessions,
      regularPrice: regularTotal,
      savings,
      discountPct,
      totalVarCost,
      contribution,
      marginPct,
      regularVarCost: (variableCost * sessions) + regCommission,
      regularContribution: regContribution,
      regularMarginPct: regularTotal > 0 ? (regContribution / regularTotal) * 100 : 0,
      diffContribution
    };
  }

  function simulatePackage({ sessions, pricePerSession, packagePrice, costPerSession, extraCost = 0, baseIsPackage = false, commissionPct = 0 }) {
    const n = Math.max(2, sessions);
    const regularTotal = pricePerSession * n;
    const savings = regularTotal - packagePrice;
    const discountPct = regularTotal > 0 ? (savings / regularTotal) * 100 : 0;
    const commission = packagePrice * (commissionPct / 100);
    const totalVarCost = (baseIsPackage ? costPerSession : (costPerSession * n)) + extraCost + commission;
    const contribution = packagePrice - totalVarCost;
    const marginPct = packagePrice > 0 ? (contribution / packagePrice) * 100 : 0;
    const regVarCost = (baseIsPackage ? costPerSession : (costPerSession * n));
    const regContribution = regularTotal - regVarCost;
    const diffContribution = contribution - regContribution;

    return {
      n,
      regularPrice: regularTotal,
      promoPrice: packagePrice,
      savings,
      discountPct,
      totalVarCost,
      contribution,
      marginPct,
      regularVarCost: regVarCost,
      regularContribution: regContribution,
      regularMarginPct: regularTotal > 0 ? (regContribution / regularTotal) * 100 : 0,
      diffContribution,
      contributionPerSession: contribution / n
    };
  }

  function simulateCombo({ items, comboPrice, commissionPct = 0 }) {
    let regularTotal = 0;
    let totalVarCost = 0;
    items.forEach(it => {
      const qty = it.quantity || 1;
      regularTotal += (it.price || 0) * qty;
      totalVarCost += (it.cost || 0) * qty;
    });

    const savings = regularTotal - comboPrice;
    const discountPct = regularTotal > 0 ? (savings / regularTotal) * 100 : 0;
    const commission = comboPrice * (commissionPct / 100);
    const finalVarCost = totalVarCost + commission;
    const contribution = comboPrice - finalVarCost;
    const marginPct = comboPrice > 0 ? (contribution / comboPrice) * 100 : 0;
    const regContribution = regularTotal - totalVarCost;
    const diffContribution = contribution - regContribution;

    return {
      regularPrice: regularTotal,
      promoPrice: comboPrice,
      savings,
      discountPct,
      totalVarCost: finalVarCost,
      contribution,
      marginPct,
      regularVarCost: totalVarCost,
      regularContribution: regContribution,
      regularMarginPct: regularTotal > 0 ? (regContribution / regularTotal) * 100 : 0,
      diffContribution
    };
  }

  function calculateTargetPrice({ variableCost, targetMarginPct, commissionPct = 0, regularPrice = 0 }) {
    const m = targetMarginPct / 100;
    const c = commissionPct / 100;
    if (m + c >= 1) {
      return {
        isPossible: false,
        requiredPrice: null,
        message: 'Margen inalcanzable: la suma de margen deseado y comisiones porcentuales es igual o superior al 100%.'
      };
    }
    const requiredPrice = variableCost / (1 - c - m);
    const commissionAmount = requiredPrice * c;
    const totalVarCost = variableCost + commissionAmount;
    const contribution = requiredPrice - totalVarCost;
    const savings = regularPrice > 0 ? regularPrice - requiredPrice : 0;
    const discountPct = (regularPrice > 0 && savings > 0) ? (savings / regularPrice) * 100 : 0;
    const regContribution = regularPrice > 0 ? (regularPrice - variableCost) : 0;

    return {
      isPossible: true,
      requiredPrice,
      promoPrice: requiredPrice,
      totalVarCost,
      contribution,
      marginPct: targetMarginPct,
      savings,
      discountPct,
      maxCompatibleDiscountPct: discountPct,
      regularPrice,
      regularVarCost: variableCost,
      regularContribution: regContribution,
      regularMarginPct: regularPrice > 0 ? (regContribution / regularPrice) * 100 : 0,
      diffContribution: contribution - regContribution
    };
  }

  // Render dinámico del Combo de tratamientos
  function renderComboItems() {
    const container = document.getElementById('promo-combo-items-list');
    if (!container) return;
    container.innerHTML = '';

    comboItems.forEach((it, idx) => {
      const row = document.createElement('div');
      row.className = 'combo-item-row';
      row.style.cssText = 'display:grid;grid-template-columns:2fr 1fr 1fr 60px 32px;gap:8px;align-items:center;background:rgba(0,0,0,0.02);padding:8px 10px;border-radius:6px;border:1px solid rgba(0,0,0,0.06);';
      row.innerHTML = `
        <div>
          <input class="calc-input combo-name" type="text" value="${it.name}" placeholder="Servicio ${idx + 1}" style="padding:6px 8px;font-size:12px;">
        </div>
        <div>
          <input class="calc-input combo-price" type="number" min="0" step="1000" value="${it.price}" placeholder="PVP" title="Precio habitual" style="padding:6px 8px;font-size:12px;">
        </div>
        <div>
          <input class="calc-input combo-cost" type="number" min="0" step="1000" value="${it.cost}" placeholder="Costo" title="Costo variable" style="padding:6px 8px;font-size:12px;">
        </div>
        <div>
          <input class="calc-input combo-qty" type="number" min="1" max="10" step="1" value="${it.quantity || 1}" title="Cantidad" style="padding:6px 6px;font-size:12px;text-align:center;">
        </div>
        <div>
          ${comboItems.length > 2 ? `<button type="button" class="btn-remove-combo-item" data-idx="${idx}" style="background:none;border:none;color:#991B1B;cursor:pointer;font-weight:bold;font-size:16px;">×</button>` : ''}
        </div>
      `;
      container.appendChild(row);
    });

    // Wire events
    container.querySelectorAll('.combo-name').forEach((inp, idx) => {
      inp.addEventListener('input', (e) => {
        comboItems[idx].name = e.target.value;
        comboItems[idx].customEdited = true;
      });
    });
    container.querySelectorAll('.combo-price').forEach((inp, idx) => {
      inp.addEventListener('input', (e) => {
        comboItems[idx].price = parseNum(e.target.value);
        comboItems[idx].customEdited = true;
        recalcPromo();
      });
    });
    container.querySelectorAll('.combo-cost').forEach((inp, idx) => {
      inp.addEventListener('input', (e) => {
        comboItems[idx].cost = parseNum(e.target.value);
        comboItems[idx].customEdited = true;
        recalcPromo();
      });
    });
    container.querySelectorAll('.combo-qty').forEach((inp, idx) => {
      inp.addEventListener('input', (e) => {
        comboItems[idx].quantity = Math.max(1, parseInt(e.target.value, 10) || 1);
        recalcPromo();
      });
    });
    container.querySelectorAll('.btn-remove-combo-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.idx, 10);
        if (comboItems.length > 2) {
          comboItems.splice(i, 1);
          renderComboItems();
          recalcPromo();
        }
      });
    });
  }

  const btnAddComboItem = document.getElementById('btn-add-combo-item');
  if (btnAddComboItem) {
    btnAddComboItem.addEventListener('click', () => {
      if (comboItems.length < 5) {
        comboItems.push({
          name: 'Tratamiento adicional ' + (comboItems.length + 1),
          price: 150000,
          cost: 50000,
          quantity: 1,
          customEdited: true
        });
        renderComboItems();
        recalcPromo();
      } else {
        alert('El combo permite hasta 5 tratamientos inicialmente.');
      }
    });
  }

  // Recálculo Reactivo del Simulador de Promociones
  function recalcPromo() {
    if (!lastTreatmentData) calcTratamiento();
    const t = lastTreatmentData || {};
    const basePrice = t.precio || 0;
    const baseVarCost = t.costoVariableTotal || 0;

    let res = null;
    let modalityTitle = '';

    if (currentPromoModality === 'discount') {
      modalityTitle = 'Descuento porcentual';
      const pct = Math.max(0, Math.min(100, parseNum(document.getElementById('promo-discount-pct')?.value || 20)));
      const com = Math.max(0, Math.min(100, parseNum(document.getElementById('promo-discount-commission')?.value || 0)));
      res = simulateDiscount({
        price: basePrice,
        variableCost: baseVarCost,
        discountPct: pct,
        commissionPct: com
      });
    } else if (currentPromoModality === 'custom-price') {
      modalityTitle = 'Precio personalizado';
      const customP = Math.max(0, parseNum(document.getElementById('promo-custom-price')?.value || (basePrice * 0.85)));
      const com = Math.max(0, Math.min(100, parseNum(document.getElementById('promo-custom-commission')?.value || 0)));
      res = simulateCustomPrice({
        price: basePrice,
        variableCost: baseVarCost,
        promoPrice: customP,
        commissionPct: com
      });
    } else if (currentPromoModality === 'two-for-one') {
      const type = document.getElementById('promo-2x1-type')?.value || '2x1';
      modalityTitle = type === '2x1' ? 'Promoción 2×1' : 'Segunda sesión al 50%';
      const com = Math.max(0, Math.min(100, parseNum(document.getElementById('promo-2x1-commission')?.value || 0)));
      res = simulate2x1({
        price: basePrice,
        variableCost: baseVarCost,
        type,
        commissionPct: com
      });
    } else if (currentPromoModality === 'package') {
      modalityTitle = 'Paquete de sesiones';
      const n = Math.max(2, Math.min(24, parseInt(document.getElementById('promo-pack-sessions')?.value, 10) || 8));
      const packPrice = Math.max(0, parseNum(document.getElementById('promo-pack-price')?.value || (basePrice * 0.8 * n)));
      const costPerSession = Math.max(0, parseNum(document.getElementById('promo-pack-cost-per-session')?.value || baseVarCost));
      const extraCost = Math.max(0, parseNum(document.getElementById('promo-pack-extra-cost')?.value || 0));
      const baseIsPack = document.getElementById('promo-pack-base-is-pack')?.value === 'yes';
      const com = Math.max(0, Math.min(100, parseNum(document.getElementById('promo-pack-commission')?.value || 0)));
      res = simulatePackage({
        sessions: n,
        pricePerSession: basePrice,
        packagePrice: packPrice,
        costPerSession,
        extraCost,
        baseIsPackage: baseIsPack,
        commissionPct: com
      });
    } else if (currentPromoModality === 'combo') {
      modalityTitle = 'Combo de tratamientos';
      let regularComboTotal = 0;
      comboItems.forEach(it => regularComboTotal += (it.price * (it.quantity || 1)));
      const comboPriceInput = document.getElementById('promo-combo-price');
      if (comboPriceInput && !comboPriceInput.value) {
        comboPriceInput.value = Math.round(regularComboTotal * 0.8);
      }
      const comboP = Math.max(0, parseNum(comboPriceInput?.value || (regularComboTotal * 0.8)));
      const com = Math.max(0, Math.min(100, parseNum(document.getElementById('promo-combo-commission')?.value || 0)));
      res = simulateCombo({
        items: comboItems,
        comboPrice: comboP,
        commissionPct: com
      });
    } else if (currentPromoModality === 'target-price') {
      modalityTitle = 'Precio mínimo según margen deseado';
      const targetMargin = Math.max(1, Math.min(99, parseNum(document.getElementById('promo-target-margin-pct')?.value || 40)));
      const varCost = Math.max(0, parseNum(document.getElementById('promo-target-var-cost')?.value || baseVarCost));
      const com = Math.max(0, Math.min(99, parseNum(document.getElementById('promo-target-commission-pct')?.value || 0)));
      const warningEl = document.getElementById('promo-impossible-warning');

      if (targetMargin + com >= 100) {
        if (warningEl) warningEl.style.display = 'block';
        res = {
          isPossible: false,
          promoPrice: 0,
          totalVarCost: varCost,
          contribution: 0,
          marginPct: 0,
          savings: 0,
          discountPct: 0,
          diffContribution: 0,
          regularPrice: basePrice,
          regularVarCost: baseVarCost,
          regularContribution: basePrice - baseVarCost,
          regularMarginPct: basePrice > 0 ? ((basePrice - baseVarCost) / basePrice) * 100 : 0
        };
      } else {
        if (warningEl) warningEl.style.display = 'none';
        res = calculateTargetPrice({
          variableCost: varCost,
          targetMarginPct: targetMargin,
          commissionPct: com,
          regularPrice: basePrice
        });
      }
    }

    if (!res) return;

    // Render en Tabla Comparativa
    const elRegPrice = document.getElementById('promo-row-reg-price');
    const elProPrice = document.getElementById('promo-row-pro-price');
    const elDiffPrice = document.getElementById('promo-row-diff-price');

    const elRegCost = document.getElementById('promo-row-reg-cost');
    const elProCost = document.getElementById('promo-row-pro-cost');
    const elDiffCost = document.getElementById('promo-row-diff-cost');

    const elRegContrib = document.getElementById('promo-row-reg-contrib');
    const elProContrib = document.getElementById('promo-row-pro-contrib');
    const elDiffContrib = document.getElementById('promo-row-diff-contrib');

    const elRegMargin = document.getElementById('promo-row-reg-margin-pct');
    const elProMargin = document.getElementById('promo-row-pro-margin-pct');
    const elDiffMargin = document.getElementById('promo-row-diff-margin-pct');

    if (elRegPrice) elRegPrice.textContent = fmtCOP(res.regularPrice);
    if (elProPrice) elProPrice.textContent = res.isPossible !== false ? fmtCOP(res.promoPrice) : 'Inalcanzable';
    if (elDiffPrice) {
      const diffP = res.promoPrice - res.regularPrice;
      elDiffPrice.textContent = (diffP < 0 ? '−' : '+') + fmtCOP(Math.abs(diffP));
      elDiffPrice.style.color = diffP < 0 ? '#991B1B' : '#065F46';
    }

    if (elRegCost) elRegCost.textContent = fmtCOP(res.regularVarCost);
    if (elProCost) elProCost.textContent = fmtCOP(res.totalVarCost);
    if (elDiffCost) {
      const diffC = res.totalVarCost - res.regularVarCost;
      elDiffCost.textContent = (diffC > 0 ? '+' : '−') + fmtCOP(Math.abs(diffC));
    }

    if (elRegContrib) elRegContrib.textContent = fmtCOP(res.regularContribution);
    if (elProContrib) {
      elProContrib.textContent = res.isPossible !== false ? fmtCOP(res.contribution) : '—';
      elProContrib.style.color = res.contribution < 0 ? '#991B1B' : 'var(--burgundy)';
    }
    if (elDiffContrib) {
      const diffCont = res.diffContribution;
      elDiffContrib.textContent = (diffCont < 0 ? '−' : '+') + fmtCOP(Math.abs(diffCont));
      elDiffContrib.style.color = diffCont < 0 ? '#991B1B' : '#065F46';
    }

    if (elRegMargin) elRegMargin.textContent = fmtPct(res.regularMarginPct);
    if (elProMargin) elProMargin.textContent = res.isPossible !== false ? fmtPct(res.marginPct) : '—%';
    if (elDiffMargin) {
      const diffM = res.marginPct - res.regularMarginPct;
      elDiffMargin.textContent = (diffM < 0 ? '−' : '+') + fmtPct(Math.abs(diffM));
      elDiffMargin.style.color = diffM < 0 ? '#991B1B' : '#065F46';
    }

    // Render en KPI Boxes
    const outPrice = document.getElementById('promo-out-price');
    const outContrib = document.getElementById('promo-out-contrib');
    const outMarginPct = document.getElementById('promo-out-margin-pct');
    const outDiffContrib = document.getElementById('promo-out-diff-contrib');
    const kpi1Label = document.getElementById('promo-kpi-1-label');

    if (kpi1Label) {
      kpi1Label.textContent = currentPromoModality === 'target-price' ? 'Precio mínimo objetivo' : 'Tarifa promocional';
    }
    if (outPrice) outPrice.textContent = res.isPossible !== false ? fmtCOP(res.promoPrice) : 'Inalcanzable';
    if (outContrib) {
      outContrib.textContent = res.isPossible !== false ? fmtCOP(res.contribution) : '—';
      outContrib.style.color = res.contribution < 0 ? '#991B1B' : 'var(--burgundy)';
    }
    if (outMarginPct) outMarginPct.textContent = res.isPossible !== false ? fmtPct(res.marginPct) : '—%';
    if (outDiffContrib) {
      outDiffContrib.textContent = (res.diffContribution < 0 ? '−' : '+') + fmtCOP(Math.abs(res.diffContribution));
      outDiffContrib.style.color = res.diffContribution < 0 ? '#991B1B' : '#065F46';
    }

    // Diagnóstico en 3 partes
    const diagEl = document.getElementById('promo-out-diagnostic');
    let hecho = '';
    let significado = '';
    let recomendacion = '';

    if (res.isPossible === false) {
      hecho = 'La combinación de margen deseado y comisiones porcentuales es igual o superior al 100%.';
      significado = 'Matemáticamente no existe ningún precio positivo que permita cubrir los costos variables y retener el margen exigido cuando las comisiones absorben el remanente.';
      recomendacion = 'Reduce el porcentaje de margen objetivo o negocia las comisiones de pasarela o profesionales.';
    } else if (res.contribution < 0) {
      hecho = `Los costos variables directos (${fmtCOP(res.totalVarCost)}) superan el precio promocional (${fmtCOP(res.promoPrice)}), produciendo una pérdida directa de ${fmtCOP(Math.abs(res.contribution))} por venta.`;
      significado = 'Cada paciente atendido bajo esta oferta reduce la liquidez del negocio antes de considerar arriendo o nómina fija.';
      recomendacion = 'No publiques esta promoción. Ajusta la tarifa al alza o disminuye los insumos y honorarios incluidos.';
    } else if (res.diffContribution < 0) {
      hecho = `La promoción deja ${fmtCOP(res.contribution)} de contribución (${fmtPct(res.marginPct)} del precio ofertado), lo que representa una reducción de ${fmtCOP(Math.abs(res.diffContribution))} frente a la venta habitual.`;
      significado = 'El procedimiento genera excedente para absorber gastos fijos, pero cada cita rinde menos dinero neto que con la tarifa regular.';
      recomendacion = 'Comprueba si la promoción atraerá suficiente volumen adicional de pacientes o citas en horarios de baja ocupación para compensar el menor margen unitario.';
    } else {
      hecho = `La tarifa evaluada (${fmtCOP(res.promoPrice)}) aporta ${fmtCOP(res.contribution)} de margen de contribución (${fmtPct(res.marginPct)}).`;
      significado = 'El servicio cubre sus costos variables y aporta igual o mayor contribución que la referencia base.';
      recomendacion = 'Verifica la aceptación comercial y la capacidad instalada disponible para prestar este volumen de atenciones.';
    }

    if (diagEl) {
      diagEl.innerHTML = `
        <div style="font-size:13px;line-height:1.5;">
          <strong>Hecho matemático:</strong> ${hecho}<br>
          <strong>Qué significa para el negocio:</strong> ${significado}<br>
          <strong>Revisión prudente:</strong> ${recomendacion}
        </div>
      `;
    }

    // Guardar para exportación
    lastPromoData = {
      treatmentName: t.nombre || 'Tratamiento evaluado',
      modalityTitle,
      regularPrice: res.regularPrice,
      regularVarCost: res.regularVarCost,
      regularContribution: res.regularContribution,
      regularMarginPct: res.regularMarginPct,
      promoPrice: res.promoPrice,
      savings: res.savings,
      discountPct: res.discountPct,
      totalVarCost: res.totalVarCost,
      contribution: res.contribution,
      marginPct: res.marginPct,
      diffContribution: res.diffContribution,
      isTargetPriceMode: currentPromoModality === 'target-price',
      isPossible: res.isPossible !== false,
      targetMarginPct: parseNum(document.getElementById('promo-target-margin-pct')?.value || 40),
      commissionPct: parseNum(document.getElementById('promo-target-commission-pct')?.value || 0),
      requiredPrice: res.requiredPrice,
      maxCompatibleDiscountPct: res.maxCompatibleDiscountPct,
      items: currentPromoModality === 'combo' ? comboItems : null,
      hecho,
      significado,
      recomendacion,
      interpretacion: `${hecho} ${significado} ${recomendacion}`
    };
  }

  // Event Listeners para inputs de promociones
  const promoInputs = [
    'promo-discount-pct',
    'promo-discount-commission',
    'promo-custom-price',
    'promo-custom-commission',
    'promo-2x1-type',
    'promo-2x1-commission',
    'promo-pack-sessions',
    'promo-pack-price',
    'promo-pack-cost-per-session',
    'promo-pack-extra-cost',
    'promo-pack-base-is-pack',
    'promo-pack-commission',
    'promo-combo-price',
    'promo-combo-commission',
    'promo-target-margin-pct',
    'promo-target-var-cost',
    'promo-target-commission-pct'
  ];

  promoInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        el.dataset.userEdited = 'true';
        recalcPromo();
      });
      el.addEventListener('change', () => {
        el.dataset.userEdited = 'true';
        recalcPromo();
      });
    }
  });

  // Exportar Simulación de Promociones (Copiar y PDF)
  const btnCopyPromo = document.getElementById('promo-btn-copy');
  const btnPdfPromo = document.getElementById('promo-btn-pdf');

  if (btnCopyPromo) {
    btnCopyPromo.addEventListener('click', () => {
      if (!lastPromoData) recalcPromo();
      const bName = (tInputs.businessName?.value || '').trim();
      if (window.GlossReportEngine && lastPromoData) {
        const text = window.GlossReportEngine.generatePromoClipboard({
          businessName: bName,
          promo: lastPromoData
        });
        window.GlossReportEngine.copyToClipboard(text, () => {
          const orig = btnCopyPromo.textContent;
          btnCopyPromo.textContent = '¡Simulación copiada!';
          setTimeout(() => btnCopyPromo.textContent = orig, 2200);
        });
      }
    });
  }

  if (btnPdfPromo) {
    btnPdfPromo.addEventListener('click', () => {
      if (!lastPromoData) recalcPromo();
      const bName = (tInputs.businessName?.value || '').trim();
      if (window.GlossReportEngine && lastPromoData) {
        window.GlossReportEngine.generatePromoPdf({
          businessName: bName,
          promo: lastPromoData
        });
      }
    });
  }

  // Inicializar render de items del combo
  renderComboItems();

});
