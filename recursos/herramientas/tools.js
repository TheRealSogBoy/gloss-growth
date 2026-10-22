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
  const tInputs = {
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

    const precio = Math.max(0, parseFloat(tInputs.precio.value) || 0);
    const insumosRaw = Math.max(0, parseFloat(tInputs.insumos.value) || 0);
    const tiempoRaw = Math.max(0, parseFloat(tInputs.tiempo.value) || 0);
    const honorariosRaw = Math.max(0, parseFloat(tInputs.honorarios.value) || 0);
    const fijosRaw = Math.max(0, parseFloat(tInputs.fijos.value) || 0);
    const comisionPct = Math.min(100, Math.max(0, parseFloat(tInputs.comision.value) || 0));
    
    // Sesiones mensuales: el valor 0 es completamente válido
    const sesionesVal = tInputs.sesiones.value !== '' ? parseFloat(tInputs.sesiones.value) : 0;
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
      const precio = parseFloat(tInputs.precio?.value) || 0;
      const insumosRaw = parseFloat(tInputs.insumos?.value) || 0;
      const honorariosRaw = parseFloat(tInputs.honorarios?.value) || 0;
      const comisionPct = parseFloat(tInputs.comision?.value) || 0;

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

      if (planPrice && planCost) {
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
        window.location.href = '../calculadora-publicidad/?precio=' + encodeURIComponent(precio) +
          '&costo=' + encodeURIComponent(Math.round(costoVariablePuro)) +
          '&nombre=' + encodeURIComponent(nombre);
      }
    });
  }

  // Inicialización de Herramienta 01
  updateModeVisibility();
  calcTratamiento();
});
