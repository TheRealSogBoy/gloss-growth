/**
 * GLOSS & GROWTH — Diagnóstico Comercial Adaptativo
 * Controlador de interfaz de usuario, navegación accesible, adaptabilidad por etapa y persistencia.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'gloss_diag_adaptive_state';
  const Engine = window.GlossDiagnosticoEngine;

  if (!Engine) {
    console.error('GlossDiagnosticoEngine no está disponible.');
    return;
  }

  // Estado de la aplicación
  let currentStage = null; // 'planning' | 'starting' | 'established'
  let currentIndex = 0;
  let answers = {};
  let autoAdvanceTimer = null;

  // Referencias del DOM - Pantallas
  let elIntro = null;
  let elQuiz = null;
  let elResults = null;

  // Quiz Header & Progress
  let elProgressBar = null;
  let elProgressText = null;
  let elDimBadge = null;
  let elBtnChangeStage = null;

  // Quiz Body
  let elQTitle = null;
  let elQDesc = null;
  let elSelectionHint = null;
  let elOptionsContainer = null;
  let elBtnPrev = null;
  let elBtnNext = null;

  // Resultados
  let elResultsTitle = null;
  let elResultsSubtitle = null;
  let elSummaryHeading = null;
  let elSummaryGrid = null;
  let elAdaptiveDetails = null;
  let elPrimaryContainer = null;
  let elPrioritiesList = null;
  let elAdaptivePlan = null;
  let elUnmeasuredBlock = null;
  let elUnmeasuredList = null;
  let elUnmeasuredHeading = null;
  let elUnmeasuredDesc = null;
  let elToolsGrid = null;
  let elBtnWhatsApp = null;
  let elBtnCopy = null;
  let elBtnPrint = null;
  let elBtnRestart = null;

  function loadSavedState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data && typeof data === 'object' && data.currentStage && data.answers) {
          currentStage = data.currentStage;
          answers = data.answers;
          const questions = Engine.getQuestions(currentStage);
          if (typeof data.currentIndex === 'number' && data.currentIndex >= 0 && data.currentIndex < questions.length) {
            currentIndex = data.currentIndex;
          }
        }
      }
    } catch (e) {
      // Ignorar fallos de almacenamiento
    }
  }

  function saveCurrentState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentStage,
        currentIndex,
        answers,
        updatedAt: Date.now()
      }));
    } catch (e) {
      // Ignorar fallos de almacenamiento
    }
  }

  function clearSavedState() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // Ignorar
    }
  }

  function init() {
    // Cachear elementos del DOM
    elIntro = document.getElementById('diag-intro');
    elQuiz = document.getElementById('diag-quiz');
    elResults = document.getElementById('diag-results');

    elProgressBar = document.getElementById('diag-progress-bar');
    elProgressText = document.getElementById('diag-progress-text');
    elDimBadge = document.getElementById('diag-dim-badge');
    elBtnChangeStage = document.getElementById('diag-btn-change-stage');

    elQTitle = document.getElementById('diag-q-title');
    elQDesc = document.getElementById('diag-q-desc');
    elSelectionHint = document.getElementById('diag-selection-hint');
    elOptionsContainer = document.getElementById('diag-options-container');
    elBtnPrev = document.getElementById('diag-btn-prev');
    elBtnNext = document.getElementById('diag-btn-next');

    elResultsTitle = document.getElementById('diag-results-title');
    elResultsSubtitle = document.getElementById('diag-results-subtitle');
    elSummaryHeading = document.getElementById('diag-summary-heading');
    elSummaryGrid = document.getElementById('diag-summary-grid');
    elAdaptiveDetails = document.getElementById('diag-adaptive-details');
    elPrimaryContainer = document.getElementById('diag-primary-container');
    elPrioritiesList = document.getElementById('diag-priorities-list');
    elAdaptivePlan = document.getElementById('diag-adaptive-plan');
    elUnmeasuredBlock = document.getElementById('diag-unmeasured-block');
    elUnmeasuredList = document.getElementById('diag-unmeasured-list');
    elUnmeasuredHeading = document.getElementById('diag-unmeasured-heading');
    elUnmeasuredDesc = document.getElementById('diag-unmeasured-desc');
    elToolsGrid = document.getElementById('diag-tools-grid');
    elBtnWhatsApp = document.getElementById('diag-btn-whatsapp');
    elBtnCopy = document.getElementById('diag-btn-copy');
    elBtnPrint = document.getElementById('diag-btn-print');
    elBtnRestart = document.getElementById('diag-btn-restart');

    // Botones de selección de etapa en la pantalla de bienvenida
    const stageButtons = document.querySelectorAll('.diag-stage-card[data-stage]');
    stageButtons.forEach(btn => {
      btn.addEventListener('click', function () {
        const selectedStage = this.getAttribute('data-stage');
        selectStage(selectedStage);
      });
    });

    if (elBtnChangeStage) {
      elBtnChangeStage.addEventListener('click', returnToStageSelection);
    }

    if (elBtnPrev) {
      elBtnPrev.addEventListener('click', goToPrev);
    }
    if (elBtnNext) {
      elBtnNext.addEventListener('click', goToNext);
    }
    if (elBtnCopy) {
      elBtnCopy.addEventListener('click', copyResults);
    }
    if (elBtnPrint) {
      elBtnPrint.addEventListener('click', printResults);
    }
    if (elBtnRestart) {
      elBtnRestart.addEventListener('click', restartQuiz);
    }
    if (elBtnWhatsApp) {
      elBtnWhatsApp.addEventListener('click', trackWhatsAppClick);
    }

    loadSavedState();

    // Si había un estado previo en progreso, permitir continuarlo
    if (currentStage && answers && Object.keys(answers).length > 0) {
      const questions = Engine.getQuestions(currentStage);
      if (currentIndex < questions.length) {
        startQuiz(false);
      }
    }
  }

  function selectStage(stage) {
    if (!['planning', 'starting', 'established'].includes(stage)) return;

    // Si cambia de etapa, no mezclar respuestas incompatibles
    if (currentStage !== stage) {
      answers = { business_stage: stage };
      currentIndex = 0;
    }
    currentStage = stage;
    saveCurrentState();
    startQuiz(true);
  }

  function returnToStageSelection() {
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
      autoAdvanceTimer = null;
    }
    elQuiz.hidden = true;
    elResults.hidden = true;
    elIntro.hidden = false;
    elIntro.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function startQuiz(isNewStart) {
    const questions = Engine.getQuestions(currentStage);

    if (isNewStart && window.GlossTrack && typeof window.GlossTrack.event === 'function') {
      window.GlossTrack.event('diagnostic_start', {
        stage: currentStage,
        total_questions: questions.length
      });
    }

    elIntro.hidden = true;
    elResults.hidden = true;
    elQuiz.hidden = false;

    renderQuestion(currentIndex);
    elQuiz.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderQuestion(index) {
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
      autoAdvanceTimer = null;
    }

    const questions = Engine.getQuestions(currentStage);
    const q = questions[index];
    if (!q) return;

    const totalQuestions = questions.length;
    const progressPct = Math.round(((index + 1) / totalQuestions) * 100);

    // Actualizar barra de progreso
    if (elProgressBar) {
      elProgressBar.style.width = progressPct + '%';
    }
    if (elProgressText) {
      elProgressText.textContent = 'Pregunta ' + (index + 1) + ' de ' + totalQuestions + ' (' + progressPct + '%)';
    }
    if (elDimBadge) {
      let stagePrefix = 'Apertura';
      if (currentStage === 'starting') stagePrefix = 'Primeros clientes';
      if (currentStage === 'established') stagePrefix = 'Bloque ' + q.block;
      elDimBadge.textContent = stagePrefix + ': ' + q.blockTitle;
    }

    // Título y descripción
    if (elQTitle) elQTitle.textContent = q.title;
    if (elQDesc) elQDesc.textContent = q.desc || '';

    // Aviso de selección
    updateSelectionHint(q);

    // Renderizar opciones
    elOptionsContainer.innerHTML = '';
    const isMulti = q.type === 'multiple';
    const currentVal = answers[q.variable];

    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'diag-option-btn';
      btn.setAttribute('role', isMulti ? 'checkbox' : 'radio');

      const isSelected = isMulti
        ? (Array.isArray(currentVal) && currentVal.includes(opt.id))
        : (currentVal === opt.id);

      if (isSelected) {
        btn.classList.add('selected');
        btn.setAttribute('aria-checked', 'true');
      } else {
        btn.setAttribute('aria-checked', 'false');
      }

      // Atenuar si se alcanzó el límite máximo y no está seleccionada
      if (isMulti && q.max && Array.isArray(currentVal) && currentVal.length >= q.max && !isSelected) {
        btn.classList.add('disabled');
      }

      const indicator = document.createElement('span');
      indicator.className = isMulti ? 'diag-indicator-square' : 'diag-indicator-circle';
      indicator.setAttribute('aria-hidden', 'true');

      btn.appendChild(indicator);

      // Renderizar texto con subtexto discreto si existe
      if (opt.subtext) {
        const contentWrap = document.createElement('div');
        contentWrap.className = 'diag-option-content';

        const titleSpan = document.createElement('span');
        titleSpan.className = 'diag-option-title';
        titleSpan.textContent = opt.text;

        const subtextSpan = document.createElement('span');
        subtextSpan.className = 'diag-option-subtext';
        subtextSpan.textContent = opt.subtext;

        contentWrap.appendChild(titleSpan);
        contentWrap.appendChild(subtextSpan);
        btn.appendChild(contentWrap);
      } else {
        const textSpan = document.createElement('span');
        textSpan.className = 'diag-option-text';
        textSpan.textContent = opt.text;
        btn.appendChild(textSpan);
      }

      btn.addEventListener('click', function () {
        handleOptionClick(q, opt, btn);
      });

      elOptionsContainer.appendChild(btn);
    });

    // Botones de navegación
    if (elBtnPrev) {
      elBtnPrev.disabled = false; // En pregunta 0, permite volver a elegir etapa
      elBtnPrev.innerHTML = index === 0 ? '<span aria-hidden="true">↩</span> Cambiar etapa' : '<span aria-hidden="true">←</span> Anterior';
    }
    updateNextButtonState(q);
  }

  function updateSelectionHint(q, customAlert) {
    if (!elSelectionHint) return;

    if (customAlert) {
      elSelectionHint.innerHTML = '<span>⚠️ ' + customAlert + '</span>';
      return;
    }

    if (q.type === 'multiple') {
      const currentVal = answers[q.variable] || [];
      const count = Array.isArray(currentVal) ? currentVal.length : 0;
      if (q.max) {
        elSelectionHint.innerHTML = '<span>Selecciona hasta ' + q.max + ' opciones principales</span><span class="count">' + count + ' de ' + q.max + ' seleccionadas</span>';
      } else {
        elSelectionHint.innerHTML = '<span>Selecciona todas las opciones que correspondan</span><span class="count">' + count + ' seleccionadas</span>';
      }
    } else {
      elSelectionHint.innerHTML = '<span>Selecciona la opción más representativa</span>';
    }
  }

  function updateNextButtonState(q) {
    if (!elBtnNext) return;

    const questions = Engine.getQuestions(currentStage);
    const val = answers[q.variable];
    const hasSelection = q.type === 'multiple'
      ? (Array.isArray(val) && val.length > 0)
      : (typeof val === 'string' && val.length > 0);

    elBtnNext.disabled = !hasSelection;
    elBtnNext.textContent = currentIndex === questions.length - 1 ? 'Ver resultados →' : 'Siguiente →';
  }

  function handleOptionClick(q, opt, btn) {
    if (q.type === 'single') {
      answers[q.variable] = opt.id;
      saveCurrentState();

      Array.from(elOptionsContainer.children).forEach(child => {
        child.classList.remove('selected');
        child.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('selected');
      btn.setAttribute('aria-checked', 'true');

      updateNextButtonState(q);

      // Avance automático suave de 260ms para selección única
      if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
      autoAdvanceTimer = setTimeout(function () {
        goToNext();
      }, 260);
    } else {
      // Selección múltiple
      let currentVal = Array.isArray(answers[q.variable]) ? [...answers[q.variable]] : [];

      if (opt.exclusive) {
        // Opción excluyente
        if (currentVal.includes(opt.id)) {
          currentVal = [];
        } else {
          currentVal = [opt.id];
        }
      } else {
        // Opción normal: limpiar cualquier opción excluyente
        const exclusiveOpts = q.options.filter(o => o.exclusive).map(o => o.id);
        currentVal = currentVal.filter(id => !exclusiveOpts.includes(id));

        if (currentVal.includes(opt.id)) {
          currentVal = currentVal.filter(id => id !== opt.id);
        } else {
          if (q.max && currentVal.length >= q.max) {
            updateSelectionHint(q, 'Has alcanzado el límite de ' + q.max + ' opciones. Desmarca una para elegir otra.');
            return;
          }
          currentVal.push(opt.id);
        }
      }

      answers[q.variable] = currentVal;
      saveCurrentState();

      // Refrescar botones
      const buttons = elOptionsContainer.querySelectorAll('.diag-option-btn');
      q.options.forEach((itemOpt, idx) => {
        const itemBtn = buttons[idx];
        if (!itemBtn) return;
        const isSel = currentVal.includes(itemOpt.id);
        itemBtn.classList.toggle('selected', isSel);
        itemBtn.setAttribute('aria-checked', isSel ? 'true' : 'false');

        if (q.max && currentVal.length >= q.max && !isSel) {
          itemBtn.classList.add('disabled');
        } else {
          itemBtn.classList.remove('disabled');
        }
      });

      updateSelectionHint(q);
      updateNextButtonState(q);
    }
  }

  function goToNext() {
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
      autoAdvanceTimer = null;
    }

    const questions = Engine.getQuestions(currentStage);
    const q = questions[currentIndex];
    const val = answers[q.variable];
    const isValid = q.type === 'multiple'
      ? (Array.isArray(val) && val.length > 0)
      : (typeof val === 'string' && val.length > 0);

    if (!isValid) return;

    if (currentIndex < questions.length - 1) {
      currentIndex++;
      saveCurrentState();
      renderQuestion(currentIndex);
      elQuiz.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      finishQuiz();
    }
  }

  function goToPrev() {
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
      autoAdvanceTimer = null;
    }

    if (currentIndex > 0) {
      currentIndex--;
      saveCurrentState();
      renderQuestion(currentIndex);
      elQuiz.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Si está en la primera pregunta, volver a elegir etapa
      returnToStageSelection();
    }
  }

  function finishQuiz() {
    const analysis = Engine.analyze(answers, currentStage);

    if (window.GlossTrack && typeof window.GlossTrack.event === 'function') {
      window.GlossTrack.event('diagnostic_complete', {
        stage: currentStage,
        business_type: answers.business_type,
        primary_area: analysis.primaryOpportunity.area
      });
    }

    renderResults(analysis);

    elQuiz.hidden = true;
    elResults.hidden = false;
    elResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ==========================================================================
  // RENDERIZADO ADAPTATIVO DE RESULTADOS
  // ==========================================================================
  function renderResults(res) {
    if (res.stage === 'planning') {
      renderPlanningResults(res);
    } else if (res.stage === 'starting') {
      renderStartingResults(res);
    } else {
      renderEstablishedResults(res);
    }

    // Herramientas recomendadas (compartido)
    if (elToolsGrid && res.relatedTools) {
      elToolsGrid.innerHTML = res.relatedTools.map(tool => `
        <a class="diag-tool-card" href="${tool.url}">
          <span class="diag-tool-badge">${tool.badge}</span>
          <h4 class="diag-tool-title">${tool.title}</h4>
          <p class="diag-tool-desc">${tool.desc}</p>
          <span class="diag-tool-link">Abrir recurso <span aria-hidden="true">→</span></span>
        </a>
      `).join('');
    }

    // WhatsApp CTA (compartido)
    if (elBtnWhatsApp && res.whatsappPayload) {
      elBtnWhatsApp.href = res.whatsappPayload.url;
    }
  }

  // --- RECORRIDO A: PREPARACIÓN ---
  function renderPlanningResults(res) {
    if (elResultsTitle) elResultsTitle.textContent = 'Tu hoja de ruta para comenzar';
    if (elResultsSubtitle) elResultsSubtitle.textContent = 'Organizamos algunas prioridades a partir de lo que ya tienes preparado y lo que te gustaría resolver antes de abrir.';

    // 1. Resumen del proyecto
    if (elSummaryHeading) elSummaryHeading.textContent = 'Resumen del proyecto reportado';
    if (elSummaryGrid) {
      const s = res.projectSummary;
      const items = [
        { label: 'Tipo de negocio', val: s.businessTypeLabel },
        { label: 'Fecha prevista de apertura', val: s.timelineLabel },
        { label: 'Definición de servicios', val: s.serviceDefLabel },
        { label: 'Modalidad de atención', val: s.locationModelLabel },
        { label: 'Canales planificados', val: s.channelsLabels.join(', ') || 'En preparación' },
        { label: 'Atención y reservas', val: s.contactProcessLabel },
        { label: 'Prioridades declaradas', val: s.prioritiesLabels.join(' · ') || 'No especificadas' }
      ];
      elSummaryGrid.innerHTML = items.map(item => `
        <div class="diag-summary-item">
          <span class="diag-summary-label">${item.label}</span>
          <span class="diag-summary-val">${item.val}</span>
        </div>
      `).join('');
    }

    // 2. Aspectos definidos vs pendientes
    if (elAdaptiveDetails) {
      elAdaptiveDetails.innerHTML = `
        <div class="diag-elements-grid">
          <div class="diag-elements-box diag-defined-box">
            <h4><span aria-hidden="true">✓</span> Aspectos que ya tienes definidos</h4>
            <ul class="diag-elements-list">
              ${res.definedElements.map(el => `<li>${el}</li>`).join('')}
            </ul>
          </div>
          <div class="diag-elements-box diag-pending-box">
            <h4><span aria-hidden="true">⚠️</span> Aspectos que conviene revisar antes de abrir</h4>
            <ul class="diag-elements-list">
              ${res.pendingElements.map(el => `<li>${el}</li>`).join('')}
            </ul>
          </div>
        </div>
      `;
    }

    // 3. Área principal
    renderPrimaryOpportunity(res.primaryOpportunity);

    // 4. Tres prioridades recomendadas
    renderPriorities(res.priorities);

    // 5. Plan inicial de preparación (4 fases)
    if (elAdaptivePlan && res.preparationPlan) {
      const p = res.preparationPlan;
      elAdaptivePlan.innerHTML = `
        <section class="diag-plan-section">
          <div class="diag-plan-head">
            <h3>Tu plan inicial de preparación</h3>
            <p>Secuencia estructurada por etapas operativas adaptada a tu fecha y estado de preparación:</p>
          </div>
          <div class="diag-plan-phases">
            <div class="diag-phase-card">
              <h4 class="diag-phase-title">${p.phase1.title}</h4>
              <ul class="diag-phase-list">
                ${p.phase1.items.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
            <div class="diag-phase-card">
              <h4 class="diag-phase-title">${p.phase2.title}</h4>
              <ul class="diag-phase-list">
                ${p.phase2.items.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
            <div class="diag-phase-card">
              <h4 class="diag-phase-title">${p.phase3.title}</h4>
              <ul class="diag-phase-list">
                ${p.phase3.items.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
            <div class="diag-phase-card">
              <h4 class="diag-phase-title">${p.phase4.title}</h4>
              <ul class="diag-phase-list">
                ${p.phase4.items.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
          </div>
          <div class="diag-plan-disclaimer">${p.disclaimer}</div>
        </section>
      `;
    }

    if (elUnmeasuredBlock) elUnmeasuredBlock.hidden = true;
  }

  // --- RECORRIDO B: PRIMEROS CLIENTES ---
  function renderStartingResults(res) {
    if (elResultsTitle) elResultsTitle.textContent = 'Tus próximas prioridades de crecimiento';
    if (elResultsSubtitle) elResultsSubtitle.textContent = 'Estas recomendaciones consideran que tu negocio está comenzando a operar y que algunas métricas todavía pueden estar formándose.';

    // 1. Contexto inicial
    if (elSummaryHeading) elSummaryHeading.textContent = 'Contexto del negocio en marcha';
    if (elSummaryGrid) {
      const s = res.businessSummary;
      const items = [
        { label: 'Tipo de negocio', val: s.businessTypeLabel },
        { label: 'Oferta inicial', val: s.serviceOfferLabel },
        { label: 'Primeros clientes', val: s.sourcesLabels.join(', ') || 'No registrados' },
        { label: 'Consultas mensuales', val: s.inquiriesLabel },
        { label: 'Patrón de agendamiento', val: s.bookingPatternLabel },
        { label: 'Canales activos', val: s.marketingChannelsLabels.join(', ') || 'Ninguno activo' },
        { label: 'Gestión de contactos', val: s.contactManagementLabel },
        { label: 'Prioridades declaradas', val: s.prioritiesLabels.join(' · ') || 'No especificadas' }
      ];
      elSummaryGrid.innerHTML = items.map(item => `
        <div class="diag-summary-item">
          <span class="diag-summary-label">${item.label}</span>
          <span class="diag-summary-val">${item.val}</span>
        </div>
      `).join('');
    }

    // 2. Análisis de canales y consultas
    if (elAdaptiveDetails) {
      elAdaptiveDetails.innerHTML = `
        <div class="diag-narrative-card">
          <div class="diag-narrative-title">Origen de tus primeros interesados</div>
          <p class="diag-narrative-text">${res.acquisitionAnalysis}</p>
        </div>
        <div class="diag-narrative-card">
          <div class="diag-narrative-title">Situación de consultas y reservas</div>
          <p class="diag-narrative-text">${res.inquiryAnalysis}</p>
        </div>
      `;
    }

    // 3. Área principal
    renderPrimaryOpportunity(res.primaryOpportunity);

    // 4. Tres acciones concretas
    renderPriorities(res.priorities);

    // Plan de fase A no aplica en B
    if (elAdaptivePlan) elAdaptivePlan.innerHTML = '';

    // 5. Datos que conviene comenzar a registrar
    if (elUnmeasuredBlock && elUnmeasuredList && res.unmeasuredIndicators) {
      elUnmeasuredBlock.hidden = false;
      if (elUnmeasuredHeading) elUnmeasuredHeading.textContent = 'Datos que conviene comenzar a registrar';
      if (elUnmeasuredDesc) elUnmeasuredDesc.textContent = 'Para orientar tus decisiones con información propia, te recomendamos empezar a anotar semanalmente:';
      elUnmeasuredList.innerHTML = res.unmeasuredIndicators.map(ind => `<li>${ind}</li>`).join('');
    }
  }

  // --- RECORRIDO C: NEGOCIOS ESTABLECIDOS ---
  function renderEstablishedResults(res) {
    if (elResultsTitle) elResultsTitle.textContent = 'Tu diagnóstico comercial';
    if (elResultsSubtitle) elResultsSubtitle.textContent = 'Estas recomendaciones se basan en la información que compartiste sobre tu negocio.';

    // 1. Resumen del negocio
    if (elSummaryHeading) elSummaryHeading.textContent = 'Resumen del negocio reportado';
    if (elSummaryGrid) {
      const s = res.businessSummary;
      const items = [
        { label: 'Tipo de negocio', val: s.businessTypeLabel },
        { label: 'Fuentes de clientes', val: s.sourcesLabels.join(', ') || 'No registradas' },
        { label: 'Consultas mensuales', val: s.inquiriesLabel },
        { label: 'Agendamiento estimado', val: s.bookingLabel },
        { label: 'Asistencia estimada', val: s.attendanceLabel },
        { label: 'Ocupación semanal', val: s.occupancyLabel },
        { label: 'Prioridades declaradas', val: s.prioritiesLabels.join(' · ') || 'No especificadas' }
      ];
      elSummaryGrid.innerHTML = items.map(item => `
        <div class="diag-summary-item">
          <span class="diag-summary-label">${item.label}</span>
          <span class="diag-summary-val">${item.val}</span>
        </div>
      `).join('');
    }

    if (elAdaptiveDetails) elAdaptiveDetails.innerHTML = '';

    // 2. Área principal
    renderPrimaryOpportunity(res.primaryOpportunity, res.referralNote);

    // 3. Tres prioridades sugeridas
    renderPriorities(res.priorities);

    if (elAdaptivePlan) elAdaptivePlan.innerHTML = '';

    // 4. Indicadores no medidos
    if (elUnmeasuredBlock && elUnmeasuredList) {
      if (res.unmeasuredIndicators && res.unmeasuredIndicators.length > 0) {
        elUnmeasuredBlock.hidden = false;
        if (elUnmeasuredHeading) elUnmeasuredHeading.textContent = 'Información que conviene empezar a medir';
        if (elUnmeasuredDesc) elUnmeasuredDesc.textContent = 'Para fundamentar tus decisiones comerciales con datos propios, sería de gran utilidad registrar los siguientes indicadores:';
        elUnmeasuredList.innerHTML = res.unmeasuredIndicators.map(ind => `<li>${ind}</li>`).join('');
      } else {
        elUnmeasuredBlock.hidden = true;
      }
    }
  }

  function renderPrimaryOpportunity(p, referralNote) {
    if (!elPrimaryContainer || !p) return;

    let referralHtml = '';
    if (referralNote) {
      referralHtml = `<div class="diag-referral-note">💡 <strong>Nota positiva:</strong> ${referralNote}</div>`;
    }

    elPrimaryContainer.innerHTML = `
      <div class="diag-primary-card">
        <div class="diag-primary-header">
          <span class="diag-primary-badge">${p.badge}</span>
          <h4 class="diag-primary-title">${p.area}</h4>
        </div>
        <p class="diag-primary-explanation">${p.explanation}</p>
        <div class="diag-primary-meta-box">
          <div class="diag-primary-meta-row">
            <span class="diag-primary-meta-label">Evidencia de tus respuestas:</span>
            <p class="diag-primary-meta-text">${p.evidence}</p>
          </div>
          <div class="diag-primary-meta-row">
            <span class="diag-primary-meta-label">Por qué importa para tus objetivos:</span>
            <p class="diag-primary-meta-text">${p.whyItMatters}</p>
          </div>
        </div>
        ${referralHtml}
      </div>
    `;
  }

  function renderPriorities(priorities) {
    if (!elPrioritiesList || !priorities) return;

    elPrioritiesList.innerHTML = priorities.map((item, idx) => `
      <article class="diag-priority-card">
        <span class="diag-priority-num" aria-hidden="true">0${idx + 1}</span>
        <div class="diag-priority-content">
          <h4 class="diag-priority-title">${item.title}</h4>
          <p class="diag-priority-desc">${item.explanation}</p>
          <div class="diag-priority-action">
            <span class="diag-priority-action-label">Acción sugerida para las próximas semanas:</span>
            <p class="diag-priority-action-text">${item.concreteAction}</p>
          </div>
          <p class="diag-priority-relation">Contexto: ${item.relationToAnswers}</p>
        </div>
      </article>
    `).join('');
  }

  // ==========================================================================
  // EXPORTACIÓN Y COPIA DE RESULTADOS
  // ==========================================================================
  function copyResults() {
    const analysis = Engine.analyze(answers, currentStage);
    const textLines = [
      '==================================================',
      'DIAGNÓSTICO COMERCIAL — GLOSS & GROWTH',
      'Orientación adaptativa basada en respuestas declaradas',
      '==================================================\n'
    ];

    if (analysis.stage === 'planning') {
      const s = analysis.projectSummary;
      textLines.push('1. RESUMEN DEL PROYECTO:');
      textLines.push('• Tipo de negocio: ' + s.businessTypeLabel);
      textLines.push('• Plazo de apertura: ' + s.timelineLabel);
      textLines.push('• Estado de servicios: ' + s.serviceDefLabel);
      textLines.push('• Modalidad de atención: ' + s.locationModelLabel);
      textLines.push('• Canales previstos: ' + (s.channelsLabels.join(', ') || 'En preparación'));
      textLines.push('• Prioridades: ' + (s.prioritiesLabels.join(' · ') || 'No especificadas') + '\n');

      textLines.push('2. ÁREA PRINCIPAL:');
      textLines.push('• ' + analysis.primaryOpportunity.area);
      textLines.push('• Detalle: ' + analysis.primaryOpportunity.explanation + '\n');

      textLines.push('3. TRES PRIORIDADES DE PREPARACIÓN:');
      analysis.priorities.forEach((p, idx) => {
        textLines.push((idx + 1) + '. ' + p.title);
        textLines.push('   Acción: ' + p.concreteAction);
      });
    } else if (analysis.stage === 'starting') {
      const s = analysis.businessSummary;
      textLines.push('1. SITUACIÓN DEL NEGOCIO:');
      textLines.push('• Tipo: ' + s.businessTypeLabel);
      textLines.push('• Oferta: ' + s.serviceOfferLabel);
      textLines.push('• Primeros clientes: ' + (s.sourcesLabels.join(', ') || 'No registrados'));
      textLines.push('• Consultas mensuales: ' + s.inquiriesLabel);
      textLines.push('• Patrón de agendamiento: ' + s.bookingPatternLabel + '\n');

      textLines.push('2. PRINCIPAL OPORTUNIDAD:');
      textLines.push('• ' + analysis.primaryOpportunity.area);
      textLines.push('• Detalle: ' + analysis.primaryOpportunity.explanation + '\n');

      textLines.push('3. TRES ACCIONES CONCRETAS:');
      analysis.priorities.forEach((p, idx) => {
        textLines.push((idx + 1) + '. ' + p.title);
        textLines.push('   Acción: ' + p.concreteAction);
      });
    } else {
      const s = analysis.businessSummary;
      textLines.push('1. RESUMEN DEL NEGOCIO:');
      textLines.push('• Tipo de negocio: ' + s.businessTypeLabel);
      textLines.push('• Fuentes principales: ' + (s.sourcesLabels.join(', ') || 'No registradas'));
      textLines.push('• Consultas mensuales: ' + s.inquiriesLabel);
      textLines.push('• Agendamiento: ' + s.bookingLabel);
      textLines.push('• Asistencia: ' + s.attendanceLabel);
      textLines.push('• Ocupación semanal: ' + s.occupancyLabel);
      textLines.push('• Prioridades: ' + (s.prioritiesLabels.join(' · ') || 'No especificadas') + '\n');

      textLines.push('2. ÁREA QUE CONVENDRÍA REVISAR PRIMERO:');
      textLines.push('• ' + analysis.primaryOpportunity.area);
      textLines.push('• Evidencia: ' + analysis.primaryOpportunity.evidence + '\n');

      textLines.push('3. TRES PRIORIDADES SUGERIDAS:');
      analysis.priorities.forEach((p, idx) => {
        textLines.push((idx + 1) + '. ' + p.title);
        textLines.push('   Acción: ' + p.concreteAction);
      });
    }

    textLines.push('\nHerramienta disponible en: https://glossgrowthhq.com/recursos/diagnostico/');

    const fullString = textLines.join('\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(fullString).then(() => {
        const prevText = elBtnCopy.textContent;
        elBtnCopy.textContent = '✓ ¡Resumen copiado!';
        setTimeout(() => {
          elBtnCopy.textContent = prevText;
        }, 2000);
      }).catch(() => {
        fallbackCopyText(fullString);
      });
    } else {
      fallbackCopyText(fullString);
    }
  }

  function fallbackCopyText(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      const prevText = elBtnCopy.textContent;
      elBtnCopy.textContent = '✓ ¡Resumen copiado!';
      setTimeout(() => {
        elBtnCopy.textContent = prevText;
      }, 2000);
    } catch (e) {
      alert('No se pudo copiar automáticamente. Puedes seleccionar el texto en pantalla.');
    }
    document.body.removeChild(ta);
  }

  function printResults() {
    window.print();
  }

  function restartQuiz() {
    clearSavedState();
    answers = {};
    currentIndex = 0;
    currentStage = null;
    elResults.hidden = true;
    elQuiz.hidden = true;
    elIntro.hidden = false;
    elIntro.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function trackWhatsAppClick() {
    if (window.GlossTrack && typeof window.GlossTrack.event === 'function') {
      window.GlossTrack.event('diagnostic_contact_click', {
        stage: currentStage
      });
    }
  }

  // Inicialización al cargar el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
