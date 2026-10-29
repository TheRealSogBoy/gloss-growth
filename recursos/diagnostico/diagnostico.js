/**
 * GLOSS & GROWTH — Diagnóstico Comercial Interactivo (15 Preguntas)
 * Controlador de interfaz de usuario, navegación accesible y persistencia.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'gloss_diag_v2_state';
  const Engine = window.GlossDiagnosticoEngine;

  if (!Engine) {
    console.error('GlossDiagnosticoEngine no está disponible.');
    return;
  }

  // Estado de la aplicación
  let currentIndex = 0;
  let answers = {};
  let autoAdvanceTimer = null;

  // Referencias del DOM
  let elIntro = null;
  let elQuiz = null;
  let elResults = null;

  let elProgressBar = null;
  let elProgressText = null;
  let elDimBadge = null;
  let elQTitle = null;
  let elQDesc = null;
  let elSelectionHint = null;
  let elOptionsContainer = null;
  let elBtnPrev = null;
  let elBtnNext = null;

  // Resultados
  let elSummaryGrid = null;
  let elPrimaryContainer = null;
  let elPrioritiesList = null;
  let elUnmeasuredBlock = null;
  let elUnmeasuredList = null;
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
        if (data && typeof data === 'object' && data.answers) {
          answers = data.answers;
          if (typeof data.currentIndex === 'number' && data.currentIndex >= 0 && data.currentIndex < 15) {
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
        answers,
        currentIndex,
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
    elQTitle = document.getElementById('diag-q-title');
    elQDesc = document.getElementById('diag-q-desc');
    elSelectionHint = document.getElementById('diag-selection-hint');
    elOptionsContainer = document.getElementById('diag-options-container');
    elBtnPrev = document.getElementById('diag-btn-prev');
    elBtnNext = document.getElementById('diag-btn-next');

    elSummaryGrid = document.getElementById('diag-summary-grid');
    elPrimaryContainer = document.getElementById('diag-primary-container');
    elPrioritiesList = document.getElementById('diag-priorities-list');
    elUnmeasuredBlock = document.getElementById('diag-unmeasured-block');
    elUnmeasuredList = document.getElementById('diag-unmeasured-list');
    elToolsGrid = document.getElementById('diag-tools-grid');
    elBtnWhatsApp = document.getElementById('diag-btn-whatsapp');
    elBtnCopy = document.getElementById('diag-btn-copy');
    elBtnPrint = document.getElementById('diag-btn-print');
    elBtnRestart = document.getElementById('diag-btn-restart');

    const btnStart = document.getElementById('diag-btn-start');
    if (btnStart) {
      btnStart.addEventListener('click', startQuiz);
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

    loadSavedState();
  }

  function startQuiz() {
    if (window.GlossTrack && typeof window.GlossTrack.event === 'function') {
      window.GlossTrack.event('diagnostic_start', { total_questions: 15 });
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

    const q = Engine.QUESTIONS[index];
    if (!q) return;

    // Actualizar progreso
    const progressPct = Math.round(((index + 1) / 15) * 100);
    if (elProgressBar) {
      elProgressBar.style.width = progressPct + '%';
    }
    if (elProgressText) {
      elProgressText.textContent = 'Pregunta ' + (index + 1) + ' de 15 (' + progressPct + '%)';
    }
    if (elDimBadge) {
      elDimBadge.textContent = 'Bloque ' + q.block + ': ' + q.blockTitle;
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

      // Deshabilitar visualmente si se alcanzó el máximo y no está seleccionada
      if (isMulti && q.max && Array.isArray(currentVal) && currentVal.length >= q.max && !isSelected) {
        btn.classList.add('disabled');
      }

      const indicator = document.createElement('span');
      indicator.className = isMulti ? 'diag-indicator-square' : 'diag-indicator-circle';
      indicator.setAttribute('aria-hidden', 'true');

      const text = document.createElement('span');
      text.className = 'diag-option-text';
      text.textContent = opt.text;

      btn.appendChild(indicator);
      btn.appendChild(text);

      btn.addEventListener('click', function () {
        handleOptionClick(q, opt, btn);
      });

      elOptionsContainer.appendChild(btn);
    });

    // Estado de botones de navegación
    if (elBtnPrev) {
      elBtnPrev.disabled = index === 0;
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

    const val = answers[q.variable];
    const hasSelection = q.type === 'multiple'
      ? (Array.isArray(val) && val.length > 0)
      : (typeof val === 'string' && val.length > 0);

    elBtnNext.disabled = !hasSelection;
    elBtnNext.textContent = currentIndex === 14 ? 'Ver diagnóstico →' : 'Siguiente →';
  }

  function handleOptionClick(q, opt, btn) {
    if (q.type === 'single') {
      answers[q.variable] = opt.id;
      saveCurrentState();

      // Actualizar selección visual
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
        // Opción excluyente (ej: 'desconocido' o 'ninguno')
        if (currentVal.includes(opt.id)) {
          currentVal = [];
        } else {
          currentVal = [opt.id];
        }
      } else {
        // Opción no excluyente: limpiar cualquier opción excluyente previa
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

      // Refrescar estado visual de las opciones sin redibujar todo
      const buttons = elOptionsContainer.querySelectorAll('.diag-option-btn');
      q.options.forEach((itemOpt, idx) => {
        const itemBtn = buttons[idx];
        if (!itemBtn) return;
        const isSel = currentVal.includes(itemOpt.id);
        itemBtn.classList.toggle('selected', isSel);
        itemBtn.setAttribute('aria-checked', isSel ? 'true' : 'false');

        // Si se alcanzó el máximo, atenuar las no seleccionadas
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

    const q = Engine.QUESTIONS[currentIndex];
    const val = answers[q.variable];
    const isValid = q.type === 'multiple'
      ? (Array.isArray(val) && val.length > 0)
      : (typeof val === 'string' && val.length > 0);

    if (!isValid) return;

    if (currentIndex < 14) {
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
      elQuiz.hidden = true;
      elIntro.hidden = false;
      elIntro.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function finishQuiz() {
    const analysis = Engine.analyze(answers);

    if (window.GlossTrack && typeof window.GlossTrack.event === 'function') {
      window.GlossTrack.event('diagnostic_complete', {
        business_type: answers.business_type,
        primary_area: analysis.primaryOpportunity.area
      });
    }

    renderResults(analysis);

    elQuiz.hidden = true;
    elResults.hidden = false;
    elResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderResults(res) {
    // 1. Resumen del negocio
    if (elSummaryGrid) {
      const summaryItems = [
        { label: 'Tipo de negocio', val: res.businessSummary.businessTypeLabel },
        { label: 'Fuentes de clientes', val: res.businessSummary.sourcesLabels.join(', ') || 'No registradas' },
        { label: 'Consultas mensuales', val: res.businessSummary.inquiriesLabel },
        { label: 'Agendamiento estimado', val: res.businessSummary.bookingLabel },
        { label: 'Asistencia estimada', val: res.businessSummary.attendanceLabel },
        { label: 'Ocupación semanal', val: res.businessSummary.occupancyLabel },
        { label: 'Prioridades declaradas', val: res.businessSummary.prioritiesLabels.join(' · ') || 'No especificadas' }
      ];

      elSummaryGrid.innerHTML = summaryItems.map(item => `
        <div class="diag-summary-item">
          <span class="diag-summary-label">${item.label}</span>
          <span class="diag-summary-val">${item.val}</span>
        </div>
      `).join('');
    }

    // 2. Área que convendría revisar primero
    if (elPrimaryContainer) {
      const p = res.primaryOpportunity;
      let referralHtml = '';
      if (res.referralNote) {
        referralHtml = `<div class="diag-referral-note">💡 <strong>Nota positiva:</strong> ${res.referralNote}</div>`;
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

    // 3. Tres prioridades sugeridas
    if (elPrioritiesList) {
      elPrioritiesList.innerHTML = res.priorities.map((item, idx) => `
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

    // 4. Indicadores no medidos
    if (elUnmeasuredBlock && elUnmeasuredList) {
      if (res.unmeasuredIndicators && res.unmeasuredIndicators.length > 0) {
        elUnmeasuredBlock.hidden = false;
        elUnmeasuredList.innerHTML = res.unmeasuredIndicators.map(ind => `<li>${ind}</li>`).join('');
      } else {
        elUnmeasuredBlock.hidden = true;
      }
    }

    // 5. Herramientas gratuitas recomendadas
    if (elToolsGrid) {
      elToolsGrid.innerHTML = res.relatedTools.map(tool => `
        <a class="diag-tool-card" href="${tool.url}">
          <span class="diag-tool-badge">${tool.badge}</span>
          <h4 class="diag-tool-title">${tool.title}</h4>
          <p class="diag-tool-desc">${tool.desc}</p>
          <span class="diag-tool-link">Abrir recurso <span aria-hidden="true">→</span></span>
        </a>
      `).join('');
    }

    // 6. Botón de WhatsApp
    if (elBtnWhatsApp) {
      elBtnWhatsApp.href = res.whatsappPayload.url;
    }
  }

  function copyResults() {
    const analysis = Engine.analyze(answers);
    const textLines = [
      '==================================================',
      'DIAGNÓSTICO COMERCIAL — GLOSS & GROWTH',
      'Orientación inicial basada en respuestas declaradas',
      '==================================================\n',
      '1. RESUMEN DEL NEGOCIO:',
      '• Tipo de negocio: ' + analysis.businessSummary.businessTypeLabel,
      '• Fuentes principales: ' + (analysis.businessSummary.sourcesLabels.join(', ') || 'No registradas'),
      '• Consultas mensuales: ' + analysis.businessSummary.inquiriesLabel,
      '• Agendamiento estimado: ' + analysis.businessSummary.bookingLabel,
      '• Asistencia estimada: ' + analysis.businessSummary.attendanceLabel,
      '• Ocupación semanal: ' + analysis.businessSummary.occupancyLabel,
      '• Prioridades: ' + (analysis.businessSummary.prioritiesLabels.join(' · ') || 'No especificadas') + '\n',
      '2. ÁREA QUE CONVENDRÍA REVISAR PRIMERO:',
      '• Área: ' + analysis.primaryOpportunity.area,
      '• Detalle: ' + analysis.primaryOpportunity.explanation,
      '• Evidencia: ' + analysis.primaryOpportunity.evidence + '\n',
      '3. TRES PRIORIDADES SUGERIDAS:'
    ];

    analysis.priorities.forEach((p, idx) => {
      textLines.push((idx + 1) + '. ' + p.title);
      textLines.push('   Acción: ' + p.concreteAction);
      textLines.push('   Contexto: ' + p.relationToAnswers);
    });

    if (analysis.unmeasuredIndicators && analysis.unmeasuredIndicators.length > 0) {
      textLines.push('\n4. INDICADORES PARA EMPEZAR A MEDIR:');
      analysis.unmeasuredIndicators.forEach(ind => {
        textLines.push('• ' + ind);
      });
    }

    textLines.push('\nConsulta completa disponible en: https://glossgrowthhq.com/recursos/diagnostico/');

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
    elResults.hidden = true;
    elQuiz.hidden = true;
    elIntro.hidden = false;
    elIntro.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Inicialización al cargar el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
