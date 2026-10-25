/**
 * GLOSS & GROWTH — SIMULADOR DE CAPACIDAD INSTALADA Y OCUPACIÓN
 * Controlador de Interfaz de Usuario y Eventos (Modo Básico y Modo Avanzado Multi-recurso).
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const engine = window.GlossCapacityEngine;
  const storage = window.GlossStorage;
  const reportEngine = window.GlossReportEngine;
  const currencyPicker = window.GlossCurrency;

  if (!engine) {
    console.error('GlossCapacityEngine no está disponible.');
    return;
  }

  // =========================================================================
  // 1. SELECTOR DE MODO (BÁSICO VS AVANZADO)
  // =========================================================================
  const btnModeBasic = document.getElementById('cap-mode-basic');
  const btnModeAdvanced = document.getElementById('cap-mode-advanced');
  const viewBasic = document.getElementById('cap-view-basic');
  const viewAdvanced = document.getElementById('cap-view-advanced');

  let currentMode = 'basic'; // 'basic' | 'advanced'

  function setMode(mode) {
    currentMode = mode;
    if (mode === 'basic') {
      if (btnModeBasic) {
        btnModeBasic.classList.add('active');
        btnModeBasic.setAttribute('aria-selected', 'true');
      }
      if (btnModeAdvanced) {
        btnModeAdvanced.classList.remove('active');
        btnModeAdvanced.setAttribute('aria-selected', 'false');
      }
      if (viewBasic) viewBasic.style.display = 'block';
      if (viewAdvanced) viewAdvanced.style.display = 'none';
      bindStorageForCurrentMode();
      recalculateBasic();
    } else {
      if (btnModeBasic) {
        btnModeBasic.classList.remove('active');
        btnModeBasic.setAttribute('aria-selected', 'false');
      }
      if (btnModeAdvanced) {
        btnModeAdvanced.classList.add('active');
        btnModeAdvanced.setAttribute('aria-selected', 'true');
      }
      if (viewBasic) viewBasic.style.display = 'none';
      if (viewAdvanced) viewAdvanced.style.display = 'block';
      bindStorageForCurrentMode();
      recalculateAdvanced();
    }
  }

  if (btnModeBasic) {
    btnModeBasic.addEventListener('click', () => setMode('basic'));
  }
  if (btnModeAdvanced) {
    btnModeAdvanced.addEventListener('click', () => setMode('advanced'));
  }

  // =========================================================================
  // 2. MONEDA Y ALMACENAMIENTO COMPARTIDO
  // =========================================================================
  const currContainer = document.getElementById('cap-currency-picker-container');
  if (currencyPicker && currContainer) {
    currencyPicker.initPicker(currContainer, {
      id: 'cap-curr-select',
      onChange: (code) => {
        updateCurrencyDisplay();
        if (currentMode === 'basic') recalculateBasic();
        else recalculateAdvanced();
      }
    });
  }

  function getActiveCurrency() {
    return currencyPicker ? currencyPicker.getSelectedCurrency() : 'COP';
  }

  function formatMoney(val) {
    const cur = getActiveCurrency();
    if (reportEngine && reportEngine.formatCurrency) {
      return reportEngine.formatCurrency(val, cur);
    }
    return engine.formatCOP(val);
  }

  function updateCurrencyDisplay() {
    const cur = getActiveCurrency();
    const curInfo = currencyPicker ? currencyPicker.getCurrency(cur) : { symbol: '$', name: 'COP' };
    document.querySelectorAll('.cap-currency-prefix').forEach(el => {
      el.textContent = curInfo.symbol || '$';
    });
    document.querySelectorAll('.cap-input-unit').forEach(el => {
      if (['COP', 'USD', 'MXN', 'EUR', 'CLP', 'PEN'].includes(el.textContent.trim())) {
        el.textContent = cur;
      }
    });
  }

  const storageContainer = document.getElementById('cap-storage-container');
  function bindStorageForCurrentMode() {
    if (!storage || !storageContainer) return;
    const toolKey = currentMode === 'basic' ? 'capacidad_basica' : 'capacidad_avanzada';
    const toolTitle = currentMode === 'basic' ? 'Capacidad Básica' : 'Capacidad Avanzada';

    storageContainer.innerHTML = storage.renderStorageControlsHtml(toolKey, toolTitle);
    storage.bindStorageUI(storageContainer, toolKey, {
      getDefaultName: () => {
        const bName = (currentMode === 'basic' ? elBusinessName?.value : elAdvBusinessName?.value) || 'Capacidad';
        return bName + ' — ' + new Date().toLocaleDateString('es-CO', { month: 'short', year: 'numeric' });
      },
      getInputs: () => {
        return currentMode === 'basic' ? getBasicInputs() : getAdvancedInputs();
      },
      getMeta: () => ({
        businessName: (currentMode === 'basic' ? elBusinessName?.value : elAdvBusinessName?.value) || '',
        currency: getActiveCurrency(),
        mode: currentMode
      }),
      onLoad: (analysis) => {
        if (analysis && analysis.inputs) {
          if (currentMode === 'basic') {
            setBasicInputs(analysis.inputs);
            recalculateBasic();
          } else {
            setAdvancedInputs(analysis.inputs);
            recalculateAdvanced();
          }
        }
      }
    });
  }

  // =========================================================================
  // 3. MODO BÁSICO: ELEMENTOS Y LÓGICA
  // =========================================================================
  const elBusinessName = document.getElementById('cap-business-name');
  const elProf = document.getElementById('cap-prof');
  const elCabins = document.getElementById('cap-cabins');
  const elNoCabin = document.getElementById('cap-no-cabin');
  const elReqStaff = document.getElementById('cap-req-staff');
  const elHours = document.getElementById('cap-hours');
  const elDays = document.getElementById('cap-days');
  const elDuration = document.getElementById('cap-duration');
  const elAttended = document.getElementById('cap-attended');
  const elRevenue = document.getElementById('cap-revenue');
  const elCustomSlider = document.getElementById('cap-custom-slider');
  const elCustomSliderVal = document.getElementById('cap-custom-slider-val');
  const elTargetRev = document.getElementById('cap-target-revenue');

  // Salidas Básico
  const elKpiCapacity = document.getElementById('cap-kpi-capacity');
  const elKpiOccupancy = document.getElementById('cap-kpi-occupancy');
  const elKpiAvailable = document.getElementById('cap-kpi-available');
  const elKpiCurrentRev = document.getElementById('cap-kpi-current-rev');
  const elOccupancyBar = document.getElementById('cap-occupancy-bar');
  const elAlertBox = document.getElementById('cap-alert-box');
  const elAlertText = document.getElementById('cap-alert-text');
  const elSecMaxRev = document.getElementById('cap-sec-max-rev');
  const elSecSlotsDay = document.getElementById('cap-sec-slots-day');
  const elSecSimultaneous = document.getElementById('cap-sec-simultaneous');
  const elSecHours = document.getElementById('cap-sec-hours');
  const elScenariosTbody = document.getElementById('cap-scenarios-tbody');
  const elNarrativeBox = document.getElementById('cap-narrative-text');
  const elGoalResults = document.getElementById('cap-goal-results');
  const elGoalNeededApts = document.getElementById('cap-goal-needed-apts');
  const elGoalAddApts = document.getElementById('cap-goal-add-apts');
  const elGoalReqOcc = document.getElementById('cap-goal-req-occ');
  const elGoalFeasibility = document.getElementById('cap-goal-feasibility');
  const elInterpCard = document.getElementById('cap-interpretation-card');
  const elInterpBadge = document.getElementById('cap-interp-badge');
  const elInterpTitle = document.getElementById('cap-interp-title');
  const elInterpFact = document.getElementById('cap-interp-fact');
  const elInterpState = document.getElementById('cap-interp-state');
  const elInterpAdvice = document.getElementById('cap-interp-advice');

  const btnReset = document.getElementById('cap-btn-reset');
  const btnCopy = document.getElementById('cap-btn-copy');
  const btnPdf = document.getElementById('cap-btn-pdf');
  const elToast = document.getElementById('cap-toast');
  const presetButtons = document.querySelectorAll('[data-preset]');

  let currentBasicResult = null;

  const BASIC_PRESETS = {
    casoA: {
      professionals: 2,
      cabins: 2,
      noCabinLimit: false,
      reqPerAppointment: 1,
      dailyHours: 6,
      monthlyDays: 22,
      appointmentMinutes: 90,
      attendedAppointments: 60,
      averageRevenue: 150000,
      customScenarioPct: 80,
      targetRevenue: ''
    },
    casoB: {
      professionals: 1,
      cabins: 2,
      noCabinLimit: false,
      reqPerAppointment: 1,
      dailyHours: 6,
      monthlyDays: 22,
      appointmentMinutes: 90,
      attendedAppointments: 60,
      averageRevenue: 150000,
      customScenarioPct: 75,
      targetRevenue: ''
    },
    casoC: {
      professionals: 2,
      cabins: 1,
      noCabinLimit: false,
      reqPerAppointment: 1,
      dailyHours: 7,
      monthlyDays: 24,
      appointmentMinutes: 50,
      attendedAppointments: 95,
      averageRevenue: 120000,
      customScenarioPct: 85,
      targetRevenue: ''
    },
    casoD: {
      professionals: 2,
      cabins: 2,
      noCabinLimit: false,
      reqPerAppointment: 2,
      dailyHours: 6,
      monthlyDays: 20,
      appointmentMinutes: 90,
      attendedAppointments: 30,
      averageRevenue: 280000,
      customScenarioPct: 70,
      targetRevenue: ''
    },
    casoE: {
      professionals: 2,
      cabins: 2,
      noCabinLimit: false,
      reqPerAppointment: 1,
      dailyHours: 6,
      monthlyDays: 22,
      appointmentMinutes: 90,
      attendedAppointments: 0,
      averageRevenue: 150000,
      customScenarioPct: 50,
      targetRevenue: ''
    }
  };

  function getBasicInputs() {
    return {
      professionals: elProf ? parseFloat(elProf.value) : 2,
      cabins: elCabins ? parseFloat(elCabins.value) : 2,
      noCabinLimit: elNoCabin ? elNoCabin.checked : false,
      reqPerAppointment: elReqStaff ? parseFloat(elReqStaff.value) : 1,
      dailyHours: elHours ? parseFloat(elHours.value) : 6,
      monthlyDays: elDays ? parseFloat(elDays.value) : 22,
      appointmentMinutes: elDuration ? parseFloat(elDuration.value) : 90,
      attendedAppointments: elAttended ? parseFloat(elAttended.value) : 60,
      averageRevenue: elRevenue ? engine.parseNumber(elRevenue.value) : 150000,
      customScenarioPct: elCustomSlider ? parseFloat(elCustomSlider.value) : 80,
      targetRevenue: elTargetRev ? (elTargetRev.value.trim() === '' ? null : engine.parseNumber(elTargetRev.value)) : null,
      businessName: elBusinessName ? elBusinessName.value : ''
    };
  }

  function setBasicInputs(data) {
    if (!data) return;
    if (elProf && data.professionals !== undefined) elProf.value = data.professionals;
    if (elCabins && data.cabins !== undefined) elCabins.value = data.cabins;
    if (elNoCabin && data.noCabinLimit !== undefined) {
      elNoCabin.checked = data.noCabinLimit;
      if (elCabins) elCabins.disabled = data.noCabinLimit;
    }
    if (elReqStaff && data.reqPerAppointment !== undefined) elReqStaff.value = data.reqPerAppointment;
    if (elHours && data.dailyHours !== undefined) elHours.value = data.dailyHours;
    if (elDays && data.monthlyDays !== undefined) elDays.value = data.monthlyDays;
    if (elDuration && data.appointmentMinutes !== undefined) elDuration.value = data.appointmentMinutes;
    if (elAttended && data.attendedAppointments !== undefined) elAttended.value = data.attendedAppointments;
    if (elRevenue && data.averageRevenue !== undefined) {
      elRevenue.value = typeof data.averageRevenue === 'number'
        ? data.averageRevenue.toLocaleString('es-CO')
        : data.averageRevenue;
    }
    if (elCustomSlider && data.customScenarioPct !== undefined) {
      elCustomSlider.value = data.customScenarioPct;
      if (elCustomSliderVal) elCustomSliderVal.textContent = data.customScenarioPct + '%';
    }
    if (elTargetRev && data.targetRevenue !== undefined) {
      elTargetRev.value = data.targetRevenue ? data.targetRevenue.toLocaleString('es-CO') : '';
    }
    if (elBusinessName && data.businessName !== undefined) {
      elBusinessName.value = data.businessName;
    }
    recalculateBasic();
  }

  function recalculateBasic() {
    const inputs = getBasicInputs();
    currentBasicResult = engine.calculateCapacity(inputs);
    renderBasicResults(currentBasicResult);
  }

  function renderBasicResults(res) {
    if (!res) return;
    const cur = getActiveCurrency();

    if (elKpiCapacity) elKpiCapacity.textContent = engine.formatInteger(res.monthlyCapacity) + ' citas';
    if (elKpiOccupancy) elKpiOccupancy.textContent = engine.formatPct(res.occupancyRate);
    if (elKpiAvailable) {
      elKpiAvailable.textContent = res.isInconsistent
        ? '0 citas'
        : engine.formatInteger(res.availableAppointments) + ' citas';
    }
    if (elKpiCurrentRev) elKpiCurrentRev.textContent = formatMoney(res.currentRevenue);

    if (elOccupancyBar) {
      const clampedPct = Math.min(100, Math.max(0, res.occupancyRate));
      elOccupancyBar.style.width = clampedPct + '%';
      elOccupancyBar.className = 'cap-occupancy-bar-fill';
      if (res.isInconsistent || res.occupancyRate >= 90) {
        elOccupancyBar.classList.add('bar-danger');
      } else if (res.occupancyRate >= 50) {
        elOccupancyBar.classList.add('bar-healthy');
      } else {
        elOccupancyBar.classList.add('bar-warning');
      }
    }

    if (elAlertBox) {
      if (res.isInconsistent) {
        elAlertBox.classList.add('visible');
        if (elAlertText) {
          elAlertText.textContent = `Has registrado ${engine.formatInteger(res.A)} citas realizadas, pero la capacidad teórica calculada es de ${engine.formatInteger(res.monthlyCapacity)} citas. Revisa si tus horarios son más amplios o los tiempos por cita son menores.`;
        }
      } else {
        elAlertBox.classList.remove('visible');
      }
    }

    if (elSecMaxRev) elSecMaxRev.textContent = formatMoney(res.maxTheoreticalRevenue);
    if (elSecSlotsDay) elSecSlotsDay.textContent = engine.formatInteger(res.Q) + ' citas/jornada';
    if (elSecSimultaneous) elSecSimultaneous.textContent = engine.formatInteger(res.S) + ' atención(es)';
    if (elSecHours) {
      elSecHours.textContent = `${engine.formatDecimal(res.availableHours)}h disp. · ${engine.formatDecimal(res.occupiedHours)}h ocup.`;
    }

    renderBasicScenarios(res.scenarios);
    renderBasicGoal(res.goal, res.monthlyCapacity);
    renderBasicInterpretation(res.interpretation);
  }

  function renderBasicScenarios(scenarios) {
    if (!elScenariosTbody || !scenarios) return;
    elScenariosTbody.innerHTML = '';

    scenarios.forEach(sc => {
      const tr = document.createElement('tr');
      if (sc.isCustom) tr.classList.add('is-custom');
      if (sc.isExceeded) tr.classList.add('is-exceeded');

      const addAptsText = sc.isExceeded
        ? '—'
        : `+${engine.formatInteger(sc.additionalAppointments)} citas`;
      const addRevText = sc.isExceeded
        ? 'Superada'
        : `+${formatMoney(sc.additionalRevenue)}`;

      tr.innerHTML = `
        <th scope="row">
          ${sc.label}
          ${sc.isCustom ? '<span class="tag-custom">Personalizado</span>' : ''}
          ${sc.isExceeded ? '<span class="tag-exceeded">Alcanzado</span>' : ''}
        </th>
        <td><strong>${engine.formatInteger(sc.targetAppointments)}</strong> citas</td>
        <td>${addAptsText}</td>
        <td><strong>${formatMoney(sc.targetRevenue)}</strong></td>
        <td style="color:${sc.isExceeded ? 'var(--cap-charcoal-muted)' : 'var(--cap-healthy-text)'};font-weight:700;">
          ${addRevText}
        </td>
      `;
      elScenariosTbody.appendChild(tr);
    });

    if (elNarrativeBox && currentBasicResult) {
      const cA = currentBasicResult.A;
      const cRev = currentBasicResult.currentRevenue;
      const mCap = currentBasicResult.monthlyCapacity;
      const mRev = currentBasicResult.maxTheoreticalRevenue;
      const occ = currentBasicResult.occupancyRate;

      if (currentBasicResult.isInconsistent) {
        elNarrativeBox.innerHTML = `<p><strong>Atención:</strong> Las citas completadas (${engine.formatInteger(cA)}) exceden el cálculo teórico (${engine.formatInteger(mCap)} citas). Verifica si tienes personal o cabinas de apoyo adicionales.</p>`;
      } else {
        elNarrativeBox.innerHTML = `
          <p>
            Actualmente realizas <strong>${engine.formatInteger(cA)} citas mensuales</strong> generando aproximadamente <strong>${formatMoney(cRev)}</strong> (${engine.formatPct(occ)} de ocupación teórica).
            Si optimizas la asignación de citas y alcanzas el 100% de ocupación, tu facturación máxima teórica podría llegar a <strong>${formatMoney(mRev)}</strong>.
          </p>
        `;
      }
    }
  }

  function renderBasicGoal(goal, monthlyCap) {
    if (!elGoalResults) return;
    if (!goal) {
      elGoalResults.style.display = 'none';
      return;
    }
    elGoalResults.style.display = 'block';
    if (elGoalNeededApts) elGoalNeededApts.textContent = engine.formatInteger(goal.neededAppointments) + ' citas';
    if (elGoalAddApts) {
      elGoalAddApts.textContent = goal.additionalAppointmentsNeeded <= 0
        ? 'Meta ya alcanzada con las citas actuales'
        : '+' + engine.formatInteger(goal.additionalAppointmentsNeeded) + ' citas adicionales';
    }
    if (elGoalReqOcc) elGoalReqOcc.textContent = engine.formatPct(goal.requiredOccupancy);

    if (elGoalFeasibility) {
      if (goal.isExceedingCapacity) {
        elGoalFeasibility.className = 'goal-feasibility not-feasible';
        elGoalFeasibility.textContent = `⚠️ Inviable con la capacidad actual. Esta meta exige ${engine.formatInteger(goal.neededAppointments)} citas (${engine.formatPct(goal.requiredOccupancy)} de ocupación), superando el tope de ${engine.formatInteger(monthlyCap)} citas. Necesitas ampliar profesionales, cabinas o jornadas.`;
      } else {
        elGoalFeasibility.className = 'goal-feasibility feasible';
        elGoalFeasibility.textContent = `✓ Meta alcanzable. Requiere el ${engine.formatPct(goal.requiredOccupancy)} de tu capacidad teórica, dejando ${engine.formatInteger(monthlyCap - goal.neededAppointments)} citas de margen operativo.`;
      }
    }
  }

  function renderBasicInterpretation(interp) {
    if (!elInterpCard || !interp) return;
    elInterpCard.className = 'cap-interpretation-card ' + interp.status;
    if (elInterpBadge) elInterpBadge.textContent = interp.badge;
    if (elInterpTitle) elInterpTitle.textContent = interp.title;
    if (elInterpFact) elInterpFact.textContent = interp.fact;
    if (elInterpState) elInterpState.textContent = interp.capacityState;
    if (elInterpAdvice) elInterpAdvice.textContent = interp.advice;
  }

  // Event Listeners Básicos
  const basicInputs = [
    elBusinessName, elProf, elCabins, elReqStaff, elHours, elDays,
    elDuration, elAttended, elRevenue, elTargetRev
  ];
  basicInputs.forEach(input => {
    if (!input) return;
    input.addEventListener('input', () => {
      if (input === elRevenue || input === elTargetRev) {
        const raw = engine.parseNumber(input.value);
        if (!isNaN(raw) && raw > 0 && input.value.trim() !== '') {
          const start = input.selectionStart;
          const prevLen = input.value.length;
          input.value = raw.toLocaleString('es-CO');
          const newLen = input.value.length;
          input.setSelectionRange(start + (newLen - prevLen), start + (newLen - prevLen));
        }
      }
      recalculateBasic();
    });
  });

  if (elNoCabin) {
    elNoCabin.addEventListener('change', () => {
      if (elCabins) elCabins.disabled = elNoCabin.checked;
      recalculateBasic();
    });
  }

  if (elCustomSlider) {
    elCustomSlider.addEventListener('input', () => {
      if (elCustomSliderVal) elCustomSliderVal.textContent = elCustomSlider.value + '%';
      recalculateBasic();
    });
  }

  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.dataset.preset;
      if (BASIC_PRESETS[presetKey]) {
        setBasicInputs(BASIC_PRESETS[presetKey]);
      }
    });
  });

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      setBasicInputs(BASIC_PRESETS.casoA);
    });
  }

  if (btnPdf) {
    btnPdf.addEventListener('click', () => {
      if (!currentBasicResult) recalculateBasic();
      const bName = elBusinessName ? elBusinessName.value : '';
      if (reportEngine && reportEngine.generateCapacidadPdf) {
        reportEngine.generateCapacidadPdf({
          businessName: bName,
          result: currentBasicResult,
          currency: getActiveCurrency()
        });
      } else {
        window.print();
      }
    });
  }

  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      if (!currentBasicResult) recalculateBasic();
      const bName = elBusinessName ? elBusinessName.value : '';
      const summaryText = reportEngine && reportEngine.generateCapacidadClipboard
        ? reportEngine.generateCapacidadClipboard({ businessName: bName, result: currentBasicResult, currency: getActiveCurrency() })
        : engine.generateSummaryText(currentBasicResult);

      if (reportEngine && reportEngine.copyToClipboard) {
        reportEngine.copyToClipboard(summaryText, () => {
          showToast('¡Resultados copiados al portapapeles!');
        }, () => {
          fallbackCopyText(summaryText);
        });
      } else {
        fallbackCopyText(summaryText);
      }
    });
  }

  // =========================================================================
  // 4. MODO AVANZADO: ELEMENTOS, ESTADO Y LÓGICA MULTI-RECURSO
  // =========================================================================
  const elAdvBusinessName = document.getElementById('cap-adv-business-name');
  const elAdvDays = document.getElementById('cap-adv-days');
  const elAdvCancellations = document.getElementById('cap-adv-cancellations');
  const elAdvInterval = document.getElementById('cap-adv-interval');

  const treatmentsContainer = document.getElementById('cap-adv-treatments-container');
  const staffContainer = document.getElementById('cap-adv-staff-container');
  const cabinsContainer = document.getElementById('cap-adv-cabins-container');
  const equipmentContainer = document.getElementById('cap-adv-equipment-container');

  const btnAddTreatment = document.getElementById('cap-adv-btn-add-treatment');
  const btnAddStaff = document.getElementById('cap-adv-btn-add-staff');
  const btnAddCabin = document.getElementById('cap-adv-btn-add-cabin');
  const btnAddEquipment = document.getElementById('cap-adv-btn-add-equipment');

  const elAdvPkgTotal = document.getElementById('cap-adv-pkg-total');
  const elAdvPkgCompleted = document.getElementById('cap-adv-pkg-completed');
  const elAdvPkgBooked = document.getElementById('cap-adv-pkg-booked');

  // Salidas Avanzadas
  const elAdvBottleneckDesc = document.getElementById('cap-adv-bottleneck-desc');
  const elAdvKpiDaily = document.getElementById('cap-adv-kpi-daily');
  const elAdvKpiMonthly = document.getElementById('cap-adv-kpi-monthly');
  const elAdvKpiEffective = document.getElementById('cap-adv-kpi-effective');
  const elAdvKpiEffectiveSub = document.getElementById('cap-adv-kpi-effective-sub');
  const elAdvKpiRevenue = document.getElementById('cap-adv-kpi-revenue');
  const elAdvTableTbody = document.getElementById('cap-adv-table-tbody');
  const elAdvPackageStats = document.getElementById('cap-adv-package-stats');

  const btnAdvExportAparatologia = document.getElementById('cap-adv-btn-export-aparatologia');
  const btnAdvCopy = document.getElementById('cap-adv-btn-copy');
  const btnAdvPdf = document.getElementById('cap-adv-btn-pdf');

  let currentAdvancedResult = null;

  // Estado inicial Modo Avanzado
  let advTreatments = [
    { id: 't1', name: 'Limpieza Facial Profunda', durationMinutes: 60, setupCleanupMinutes: 15, price: 180000, requiredStaffCount: 1, requiredEquipmentId: null },
    { id: 't2', name: 'Depilación Láser Diodo', durationMinutes: 45, setupCleanupMinutes: 15, price: 220000, requiredStaffCount: 1, requiredEquipmentId: 'eq1' }
  ];

  let advStaff = [
    { id: 'p1', name: 'Dra. Sofía', startHour: 9, endHour: 18, pauseStart: 13, pauseEnd: 14 },
    { id: 'p2', name: 'Dra. Valentina', startHour: 10, endHour: 19, pauseStart: 14, pauseEnd: 15 }
  ];

  let advCabins = [
    { id: 'c1', name: 'Cabina Facial 1', startHour: 9, endHour: 19 },
    { id: 'c2', name: 'Cabina Multifuncional 2', startHour: 9, endHour: 19 }
  ];

  let advEquipment = [
    { id: 'eq1', name: 'Láser Diodo', units: 1, startHour: 9, endHour: 19 }
  ];

  // Renderers de listas dinámicas
  function renderTreatmentsList() {
    if (!treatmentsContainer) return;
    treatmentsContainer.innerHTML = '';
    advTreatments.forEach((t, idx) => {
      const box = document.createElement('div');
      box.className = 'cap-item-box';
      box.innerHTML = `
        <div class="cap-item-header">
          <span class="cap-item-title">Tratamiento #${idx + 1}</span>
          ${advTreatments.length > 1 ? `<button type="button" class="cap-btn-remove" data-del-treatment="${t.id}">Eliminar</button>` : ''}
        </div>
        <div class="cap-field-group">
          <label class="cap-label">Nombre del servicio</label>
          <div class="cap-input-wrap">
            <input type="text" class="cap-input" value="${t.name}" data-t-field="name" data-id="${t.id}">
          </div>
        </div>
        <div class="cap-field-row-2">
          <div class="cap-field-group">
            <label class="cap-label">Duración clínica (min)</label>
            <div class="cap-input-wrap">
              <input type="number" class="cap-input" min="5" max="360" step="5" value="${t.durationMinutes}" data-t-field="duration" data-id="${t.id}">
            </div>
          </div>
          <div class="cap-field-group">
            <label class="cap-label">Preparación / Desinfección (min)</label>
            <div class="cap-input-wrap">
              <input type="number" class="cap-input" min="0" max="60" step="5" value="${t.setupCleanupMinutes}" data-t-field="cleanup" data-id="${t.id}">
            </div>
          </div>
        </div>
        <div class="cap-field-row-2">
          <div class="cap-field-group">
            <label class="cap-label">Tarifa / Precio por cita</label>
            <div class="cap-input-wrap">
              <span class="cap-currency-prefix">$</span>
              <input type="text" class="cap-input input-currency" value="${t.price.toLocaleString('es-CO')}" data-t-field="price" data-id="${t.id}">
            </div>
          </div>
          <div class="cap-field-group">
            <label class="cap-label">Profesionales necesarios</label>
            <div class="cap-input-wrap">
              <select class="cap-input" data-t-field="staffCount" data-id="${t.id}">
                <option value="1" ${t.requiredStaffCount === 1 ? 'selected' : ''}>1 profesional</option>
                <option value="2" ${t.requiredStaffCount === 2 ? 'selected' : ''}>2 profesionales (Pareja/Asistido)</option>
              </select>
            </div>
          </div>
        </div>
        <div class="cap-field-group">
          <label class="cap-label">Equipo / Aparatología requerida</label>
          <div class="cap-input-wrap">
            <select class="cap-input" data-t-field="reqEquipment" data-id="${t.id}">
              <option value="" ${!t.requiredEquipmentId ? 'selected' : ''}>Ninguno (No requiere máquina)</option>
              ${advEquipment.map(e => `<option value="${e.id}" ${t.requiredEquipmentId === e.id ? 'selected' : ''}>${e.name}</option>`).join('')}
            </select>
          </div>
        </div>
      `;
      treatmentsContainer.appendChild(box);
    });

    // Listeners eliminación
    treatmentsContainer.querySelectorAll('[data-del-treatment]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-treatment');
        advTreatments = advTreatments.filter(x => x.id !== id);
        renderTreatmentsList();
        recalculateAdvanced();
      });
    });

    // Listeners campos
    treatmentsContainer.querySelectorAll('input, select').forEach(input => {
      input.addEventListener('input', () => {
        const id = input.getAttribute('data-id');
        const field = input.getAttribute('data-t-field');
        const item = advTreatments.find(x => x.id === id);
        if (!item) return;

        if (field === 'name') item.name = input.value;
        if (field === 'duration') item.durationMinutes = parseFloat(input.value) || 60;
        if (field === 'cleanup') item.setupCleanupMinutes = parseFloat(input.value) || 0;
        if (field === 'staffCount') item.requiredStaffCount = parseInt(input.value, 10) || 1;
        if (field === 'reqEquipment') item.requiredEquipmentId = input.value || null;
        if (field === 'price') {
          const num = engine.parseNumber(input.value);
          item.price = num;
          input.value = num.toLocaleString('es-CO');
        }
        recalculateAdvanced();
      });
    });
  }

  function renderStaffList() {
    if (!staffContainer) return;
    staffContainer.innerHTML = '';
    advStaff.forEach((s, idx) => {
      const box = document.createElement('div');
      box.className = 'cap-item-box';
      box.innerHTML = `
        <div class="cap-item-header">
          <span class="cap-item-title">Profesional #${idx + 1}</span>
          ${advStaff.length > 1 ? `<button type="button" class="cap-btn-remove" data-del-staff="${s.id}">Eliminar</button>` : ''}
        </div>
        <div class="cap-field-group">
          <label class="cap-label">Nombre del profesional</label>
          <div class="cap-input-wrap">
            <input type="text" class="cap-input" value="${s.name}" data-s-field="name" data-id="${s.id}">
          </div>
        </div>
        <div class="cap-field-row-2">
          <div class="cap-field-group">
            <label class="cap-label">Hora entrada (24h)</label>
            <div class="cap-input-wrap">
              <input type="number" class="cap-input" min="6" max="23" step="0.5" value="${s.startHour}" data-s-field="start" data-id="${s.id}">
              <span class="cap-input-unit">hora</span>
            </div>
          </div>
          <div class="cap-field-group">
            <label class="cap-label">Hora salida (24h)</label>
            <div class="cap-input-wrap">
              <input type="number" class="cap-input" min="7" max="24" step="0.5" value="${s.endHour}" data-s-field="end" data-id="${s.id}">
              <span class="cap-input-unit">hora</span>
            </div>
          </div>
        </div>
        <div class="cap-field-row-2">
          <div class="cap-field-group">
            <label class="cap-label">Pausa almuerzo inicio</label>
            <div class="cap-input-wrap">
              <input type="number" class="cap-input" min="11" max="16" step="0.5" value="${s.pauseStart || 13}" data-s-field="pStart" data-id="${s.id}">
              <span class="cap-input-unit">hora</span>
            </div>
          </div>
          <div class="cap-field-group">
            <label class="cap-label">Pausa almuerzo fin</label>
            <div class="cap-input-wrap">
              <input type="number" class="cap-input" min="12" max="17" step="0.5" value="${s.pauseEnd || 14}" data-s-field="pEnd" data-id="${s.id}">
              <span class="cap-input-unit">hora</span>
            </div>
          </div>
        </div>
      `;
      staffContainer.appendChild(box);
    });

    staffContainer.querySelectorAll('[data-del-staff]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-staff');
        advStaff = advStaff.filter(x => x.id !== id);
        renderStaffList();
        recalculateAdvanced();
      });
    });

    staffContainer.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', () => {
        const id = input.getAttribute('data-id');
        const field = input.getAttribute('data-s-field');
        const item = advStaff.find(x => x.id === id);
        if (!item) return;

        if (field === 'name') item.name = input.value;
        if (field === 'start') item.startHour = parseFloat(input.value) || 9;
        if (field === 'end') item.endHour = parseFloat(input.value) || 17;
        if (field === 'pStart') item.pauseStart = parseFloat(input.value) || null;
        if (field === 'pEnd') item.pauseEnd = parseFloat(input.value) || null;
        recalculateAdvanced();
      });
    });
  }

  function renderCabinsList() {
    if (!cabinsContainer) return;
    cabinsContainer.innerHTML = '';
    advCabins.forEach((c, idx) => {
      const box = document.createElement('div');
      box.className = 'cap-item-box';
      box.innerHTML = `
        <div class="cap-item-header">
          <span class="cap-item-title">Cabina / Espacio #${idx + 1}</span>
          ${advCabins.length > 1 ? `<button type="button" class="cap-btn-remove" data-del-cabin="${c.id}">Eliminar</button>` : ''}
        </div>
        <div class="cap-field-group">
          <label class="cap-label">Identificador de la cabina</label>
          <div class="cap-input-wrap">
            <input type="text" class="cap-input" value="${c.name}" data-c-field="name" data-id="${c.id}">
          </div>
        </div>
        <div class="cap-field-row-2">
          <div class="cap-field-group">
            <label class="cap-label">Hora apertura</label>
            <div class="cap-input-wrap">
              <input type="number" class="cap-input" min="6" max="23" step="0.5" value="${c.startHour}" data-c-field="start" data-id="${c.id}">
            </div>
          </div>
          <div class="cap-field-group">
            <label class="cap-label">Hora cierre</label>
            <div class="cap-input-wrap">
              <input type="number" class="cap-input" min="7" max="24" step="0.5" value="${c.endHour}" data-c-field="end" data-id="${c.id}">
            </div>
          </div>
        </div>
      `;
      cabinsContainer.appendChild(box);
    });

    cabinsContainer.querySelectorAll('[data-del-cabin]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-cabin');
        advCabins = advCabins.filter(x => x.id !== id);
        renderCabinsList();
        recalculateAdvanced();
      });
    });

    cabinsContainer.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', () => {
        const id = input.getAttribute('data-id');
        const field = input.getAttribute('data-c-field');
        const item = advCabins.find(x => x.id === id);
        if (!item) return;

        if (field === 'name') item.name = input.value;
        if (field === 'start') item.startHour = parseFloat(input.value) || 9;
        if (field === 'end') item.endHour = parseFloat(input.value) || 19;
        recalculateAdvanced();
      });
    });
  }

  function renderEquipmentList() {
    if (!equipmentContainer) return;
    equipmentContainer.innerHTML = '';
    advEquipment.forEach((e, idx) => {
      const box = document.createElement('div');
      box.className = 'cap-item-box';
      box.innerHTML = `
        <div class="cap-item-header">
          <span class="cap-item-title">Aparatología #${idx + 1}</span>
          <button type="button" class="cap-btn-remove" data-del-eq="${e.id}">Eliminar</button>
        </div>
        <div class="cap-field-group">
          <label class="cap-label">Nombre del equipo</label>
          <div class="cap-input-wrap">
            <input type="text" class="cap-input" value="${e.name}" data-e-field="name" data-id="${e.id}">
          </div>
        </div>
        <div class="cap-field-row-2">
          <div class="cap-field-group">
            <label class="cap-label">Unidades físicas disponibles</label>
            <div class="cap-input-wrap">
              <input type="number" class="cap-input" min="1" max="20" step="1" value="${e.units}" data-e-field="units" data-id="${e.id}">
            </div>
          </div>
          <div class="cap-field-group">
            <label class="cap-label">Horario operativo</label>
            <div class="cap-input-wrap" style="display:flex; gap:6px;">
              <input type="number" class="cap-input" min="6" max="22" step="1" value="${e.startHour}" data-e-field="start" data-id="${e.id}" style="width:50%;">
              <input type="number" class="cap-input" min="7" max="24" step="1" value="${e.endHour}" data-e-field="end" data-id="${e.id}" style="width:50%;">
            </div>
          </div>
        </div>
      `;
      equipmentContainer.appendChild(box);
    });

    equipmentContainer.querySelectorAll('[data-del-eq]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-eq');
        advEquipment = advEquipment.filter(x => x.id !== id);
        renderEquipmentList();
        renderTreatmentsList();
        recalculateAdvanced();
      });
    });

    equipmentContainer.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', () => {
        const id = input.getAttribute('data-id');
        const field = input.getAttribute('data-e-field');
        const item = advEquipment.find(x => x.id === id);
        if (!item) return;

        if (field === 'name') {
          item.name = input.value;
          renderTreatmentsList();
        }
        if (field === 'units') item.units = parseInt(input.value, 10) || 1;
        if (field === 'start') item.startHour = parseFloat(input.value) || 9;
        if (field === 'end') item.endHour = parseFloat(input.value) || 19;
        recalculateAdvanced();
      });
    });
  }

  // Botones de adición
  if (btnAddTreatment) {
    btnAddTreatment.addEventListener('click', () => {
      const nextId = 't' + (advTreatments.length + 1);
      advTreatments.push({
        id: nextId,
        name: 'Tratamiento ' + (advTreatments.length + 1),
        durationMinutes: 60,
        setupCleanupMinutes: 15,
        price: 150000,
        requiredStaffCount: 1,
        requiredEquipmentId: null
      });
      renderTreatmentsList();
      recalculateAdvanced();
    });
  }

  if (btnAddStaff) {
    btnAddStaff.addEventListener('click', () => {
      const nextId = 'p' + (advStaff.length + 1);
      advStaff.push({
        id: nextId,
        name: 'Profesional ' + (advStaff.length + 1),
        startHour: 9,
        endHour: 18,
        pauseStart: 13,
        pauseEnd: 14
      });
      renderStaffList();
      recalculateAdvanced();
    });
  }

  if (btnAddCabin) {
    btnAddCabin.addEventListener('click', () => {
      const nextId = 'c' + (advCabins.length + 1);
      advCabins.push({
        id: nextId,
        name: 'Cabina ' + (advCabins.length + 1),
        startHour: 9,
        endHour: 19
      });
      renderCabinsList();
      recalculateAdvanced();
    });
  }

  if (btnAddEquipment) {
    btnAddEquipment.addEventListener('click', () => {
      const nextId = 'eq' + (advEquipment.length + 1);
      advEquipment.push({
        id: nextId,
        name: 'Aparatología ' + (advEquipment.length + 1),
        units: 1,
        startHour: 9,
        endHour: 19
      });
      renderEquipmentList();
      renderTreatmentsList();
      recalculateAdvanced();
    });
  }

  // Listeners paquetes y generales avanzados
  [elAdvBusinessName, elAdvDays, elAdvCancellations, elAdvInterval, elAdvPkgTotal, elAdvPkgCompleted, elAdvPkgBooked].forEach(el => {
    if (el) el.addEventListener('input', recalculateAdvanced);
  });

  function getAdvancedInputs() {
    return {
      businessName: elAdvBusinessName ? elAdvBusinessName.value : '',
      daysPerMonth: elAdvDays ? parseFloat(elAdvDays.value) || 22 : 22,
      cancellationsPct: elAdvCancellations ? parseFloat(elAdvCancellations.value) || 10 : 10,
      gridIntervalMinutes: elAdvInterval ? parseInt(elAdvInterval.value, 10) || 15 : 15,
      treatments: advTreatments,
      professionals: advStaff,
      cabins: advCabins,
      equipment: advEquipment,
      packages: [{
        id: 'pkg1',
        name: 'Paquetes Globales',
        totalSessions: elAdvPkgTotal ? parseFloat(elAdvPkgTotal.value) || 0 : 0,
        completedSessions: elAdvPkgCompleted ? parseFloat(elAdvPkgCompleted.value) || 0 : 0,
        bookedSessions: elAdvPkgBooked ? parseFloat(elAdvPkgBooked.value) || 0 : 0
      }]
    };
  }

  function setAdvancedInputs(data) {
    if (!data) return;
    if (elAdvBusinessName && data.businessName !== undefined) elAdvBusinessName.value = data.businessName;
    if (elAdvDays && data.daysPerMonth !== undefined) elAdvDays.value = data.daysPerMonth;
    if (elAdvCancellations && data.cancellationsPct !== undefined) elAdvCancellations.value = data.cancellationsPct;
    if (elAdvInterval && data.gridIntervalMinutes !== undefined) elAdvInterval.value = data.gridIntervalMinutes;
    if (Array.isArray(data.treatments)) advTreatments = data.treatments;
    if (Array.isArray(data.professionals)) advStaff = data.professionals;
    if (Array.isArray(data.cabins)) advCabins = data.cabins;
    if (Array.isArray(data.equipment)) advEquipment = data.equipment;

    if (Array.isArray(data.packages) && data.packages[0]) {
      const p = data.packages[0];
      if (elAdvPkgTotal) elAdvPkgTotal.value = p.totalSessions || 0;
      if (elAdvPkgCompleted) elAdvPkgCompleted.value = p.completedSessions || 0;
      if (elAdvPkgBooked) elAdvPkgBooked.value = p.bookedPendingSessions || p.bookedSessions || 0;
    }
    renderTreatmentsList();
    renderStaffList();
    renderCabinsList();
    renderEquipmentList();
    recalculateAdvanced();
  }

  function recalculateAdvanced() {
    const params = getAdvancedInputs();
    currentAdvancedResult = engine.calculateAdvancedCapacity(params);
    renderAdvancedResults(currentAdvancedResult);
  }

  function renderAdvancedResults(res) {
    if (!res) return;

    if (elAdvBottleneckDesc) elAdvBottleneckDesc.textContent = res.bottleneck || 'Recursos equilibrados';
    if (elAdvKpiDaily) elAdvKpiDaily.textContent = engine.formatInteger(res.dailyAppointments) + ' citas';
    if (elAdvKpiMonthly) elAdvKpiMonthly.textContent = engine.formatInteger(res.monthlyCapacity) + ' citas';
    if (elAdvKpiEffective) elAdvKpiEffective.textContent = engine.formatInteger(res.effectiveAttended) + ' citas';
    if (elAdvKpiEffectiveSub) elAdvKpiEffectiveSub.textContent = `Con ${res.cancellationPct}% ausentismo`;
    if (elAdvKpiRevenue) elAdvKpiRevenue.textContent = formatMoney(res.monthlyPotentialRevenue);

    // Tabla tratamientos
    if (elAdvTableTbody) {
      elAdvTableTbody.innerHTML = '';
      (res.treatmentsResults || []).forEach(t => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${t.name}</strong></td>
          <td>${t.effectiveDuration} min</td>
          <td>${engine.formatInteger(t.dailyMaxAppointments)} citas/día</td>
          <td>${engine.formatInteger(t.monthlyMaxAppointments)} citas/mes</td>
          <td style="font-weight:700; color:var(--cap-burgundy);">${formatMoney(t.monthlyPotentialRevenue)}</td>
        `;
        elAdvTableTbody.appendChild(tr);
      });
    }

    // Estadísticas de paquetes
    if (elAdvPackageStats && res.packageSummary) {
      const ps = res.packageSummary;
      elAdvPackageStats.innerHTML = `
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:10px; margin-top:6px;">
          <div><strong>${engine.formatInteger(ps.totalOriginalSessions)}</strong> sesiones vendidas</div>
          <div><strong>${engine.formatInteger(ps.completedSessions)}</strong> sesiones atendidas</div>
          <div style="color:var(--cap-burgundy); font-weight:700;"><strong>${engine.formatInteger(ps.pendingSessions)}</strong> pendientes por dar</div>
          <div><strong>${engine.formatInteger(ps.bookedPendingSessions)}</strong> ya en agenda</div>
          <div style="color:#B45309; font-weight:700;"><strong>${engine.formatInteger(ps.unbookedPendingSessions)}</strong> sin turno fijado</div>
        </div>
      `;
    }
  }

  // Botón Exportar a Aparatología
  if (btnAdvExportAparatologia) {
    btnAdvExportAparatologia.addEventListener('click', () => {
      if (!currentAdvancedResult) recalculateAdvanced();
      const eq = advEquipment[0] || { name: 'Aparatología' };
      const eqTreatments = advTreatments.filter(t => t.requiredEquipmentId === eq.id);
      const treatmentName = eqTreatments.length ? eqTreatments.map(t => t.name).join(', ') : eq.name;
      const avgPrice = eqTreatments.length
        ? eqTreatments.reduce((acc, t) => acc + t.price, 0) / eqTreatments.length
        : 180000;
      const avgDur = eqTreatments.length
        ? eqTreatments.reduce((acc, t) => acc + t.effectiveDuration, 0) / eqTreatments.length / 60
        : 1;

      // Calcular sesiones estimadas al mes
      const trResult = currentAdvancedResult.treatmentsResults.find(t => eqTreatments.some(et => et.name === t.name));
      const monthlySessions = trResult ? trResult.monthlyMaxAppointments : 40;

      if (storage && storage.stageCapacityToAparatologia) {
        storage.stageCapacityToAparatologia({
          equipmentName: eq.name + ' (' + treatmentName + ')',
          sessionsPerMonth: monthlySessions,
          sessionPrice: avgPrice,
          hoursPerSession: avgDur,
          businessName: elAdvBusinessName ? elAdvBusinessName.value : '',
          inputs: getAdvancedInputs(),
          isAdvanced: true,
          name: (elAdvBusinessName?.value || 'Capacidad Avanzada') + ' — ' + new Date().toLocaleDateString('es-CO', { month: 'short', year: 'numeric' })
        });
        showToast('¡Datos transferidos! Abriendo Inversión en Aparatología...');
        setTimeout(() => {
          window.location.href = '../inversion-aparatologia/';
        }, 800);
      } else {
        showToast('Datos preparados para Inversión en Aparatología.');
      }
    });
  }

  // Botón Copiar Avanzado
  if (btnAdvCopy) {
    btnAdvCopy.addEventListener('click', () => {
      if (!currentAdvancedResult) recalculateAdvanced();
      const bName = elAdvBusinessName ? elAdvBusinessName.value : '';
      if (reportEngine && reportEngine.generateCapacidadAvanzadaClipboard) {
        const text = reportEngine.generateCapacidadAvanzadaClipboard({
          businessName: bName,
          result: currentAdvancedResult,
          currency: getActiveCurrency()
        });
        if (reportEngine.copyToClipboard) {
          reportEngine.copyToClipboard(text, () => {
            showToast('¡Reporte avanzado copiado al portapapeles!');
          }, () => {
            fallbackCopyText(text);
          });
        } else {
          fallbackCopyText(text);
        }
      }
    });
  }

  // Botón PDF Avanzado
  if (btnAdvPdf) {
    btnAdvPdf.addEventListener('click', () => {
      if (!currentAdvancedResult) recalculateAdvanced();
      const bName = elAdvBusinessName ? elAdvBusinessName.value : '';
      if (reportEngine && reportEngine.generateCapacidadAvanzadaPdf) {
        reportEngine.generateCapacidadAvanzadaPdf({
          businessName: bName,
          result: currentAdvancedResult,
          currency: getActiveCurrency()
        });
      } else {
        window.print();
      }
    });
  }

  // Funciones de utilidad Toast y Fallback
  function fallbackCopyText(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.top = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('¡Resumen copiado al portapapeles!');
    } catch (err) {
      alert('No se pudo copiar automáticamente. Por favor copia manualmente.');
    }
    document.body.removeChild(ta);
  }

  function showToast(msg) {
    if (!elToast) return;
    elToast.textContent = msg;
    elToast.classList.add('show');
    setTimeout(() => {
      elToast.classList.remove('show');
    }, 2800);
  }

  // INICIALIZACIÓN
  renderTreatmentsList();
  renderStaffList();
  renderCabinsList();
  renderEquipmentList();
  setBasicInputs(BASIC_PRESETS.casoA);
  bindStorageForCurrentMode();
  updateCurrencyDisplay();
});
