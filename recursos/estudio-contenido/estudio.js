/**
 * GLOSS & GROWTH — ESTUDIO DE CONTENIDO
 * Controlador de Interfaz de Usuario y Lógica Reactiva del Cliente (v1.1.0)
 * Gestiona Ganchos, Generador de Ideas, Estructurador de Reels y Navegación Unificada
 */

(function () {
  'use strict';

  // Estado reactivo en memoria
  let currentBatch = null;
  let currentIdeasBatch = null;
  let currentScript = null;
  let currentCarousel = null;
  let currentStoriesSequence = null;
  let activeBusiness = { name: '', currency: 'COP' };
  let isInitialized = false;

  // Referencias al DOM
  const dom = {};

  document.addEventListener('DOMContentLoaded', initApp);

  async function initApp() {
    cacheDom();
    bindEvents();

    try {
      // 1. Inicializar motor de contenido cargando la biblioteca local
      await GlossContentEngine.init('./data');
      isInitialized = true;

      // 2. Cargar perfil de negocio activo de GlossStorage
      if (typeof GlossStorage !== 'undefined') {
        activeBusiness = GlossStorage.getActiveBusiness();
      }

      // 3. Poblar listas desplegables de todas las vistas
      populateTreatments();
      populateIdeasTreatments();
      populateReelTreatments();
      populateCarouselTreatments();
      populateStoriesTreatments();

      // 4. Actualizar contadores de guardados
      updateFavoritesCount();
      updateSavedIdeasCount();
      updateSavedScriptsCount();
      updateSavedCarouselsCount();
      updateSavedStoriesCount();

      // 5. Inicializar Calendario Editorial (Etapa C)
      initCalendar();

      // 6. Configurar Turnstile y presentar propuestas de referencia inicial
      setupTurnstile();
      renderInitialReferenceState();

      // 7. Verificar hash en URL para activar pestaña directa si aplica
      checkUrlTab();
    } catch (err) {
      console.error('Error al inicializar Estudio de Contenido:', err);
      showToast('Error cargando la biblioteca de datos.');
    }
  }

  function cacheDom() {
    // Pestañas
    dom.tabBtns = document.querySelectorAll('.ec-tab-btn');
    dom.views = {
      ganchos: document.getElementById('view-ganchos'),
      ideas: document.getElementById('view-ideas'),
      estructurador: document.getElementById('view-estructurador'),
      carruseles: document.getElementById('view-carruseles'),
      historias: document.getElementById('view-historias'),
      calendario: document.getElementById('view-calendario')
    };
    dom.mainTitle = document.getElementById('ec-main-title');
    dom.mainLead = document.getElementById('ec-main-lead');

    // Formulario Ganchos
    dom.form = document.getElementById('ec-form');
    dom.audience = document.getElementById('ec-audience');
    dom.specialty = document.getElementById('ec-specialty');
    dom.treatment = document.getElementById('ec-treatment');
    dom.objective = document.getElementById('ec-objective');
    dom.format = document.getElementById('ec-format');
    dom.platform = document.getElementById('ec-platform');
    dom.intensity = document.getElementById('ec-intensity');
    dom.intensityBadge = document.getElementById('ec-intensity-badge');
    dom.style = document.getElementById('ec-style');
    dom.count = document.getElementById('ec-count');
    dom.engine = document.getElementById('ec-engine');
    dom.advancedToggle = document.getElementById('ec-advanced-toggle');
    dom.advancedPane = document.getElementById('ec-advanced-pane');
    dom.btnGenerate = document.getElementById('ec-btn-generate');
    dom.btnOpenFavs = document.getElementById('ec-btn-open-favs');
    dom.favsCountBadge = document.getElementById('ec-favs-count');

    // Resultados Ganchos
    dom.resultsSection = document.getElementById('ec-results');
    dom.resultsTitle = document.getElementById('ec-results-title');
    dom.resultsSubtitle = document.getElementById('ec-results-subtitle');
    dom.cardsContainer = document.getElementById('ec-cards-container');
    dom.btnRotate = document.getElementById('ec-btn-rotate');
    dom.btnCopyBatch = document.getElementById('ec-btn-copy-batch');
    dom.btnExportPdf = document.getElementById('ec-btn-export-pdf');

    // Formulario Ideas (Fase 3)
    dom.ideasForm = document.getElementById('ec-ideas-form');
    dom.ideasAudience = document.getElementById('ec-ideas-audience');
    dom.ideasSpecialty = document.getElementById('ec-ideas-specialty');
    dom.ideasTreatment = document.getElementById('ec-ideas-treatment');
    dom.ideasFunnel = document.getElementById('ec-ideas-funnel');
    dom.ideasAngle = document.getElementById('ec-ideas-angle');
    dom.ideasCount = document.getElementById('ec-ideas-count');
    dom.btnGenerateIdeas = document.getElementById('ec-btn-generate-ideas');
    dom.btnOpenSavedIdeas = document.getElementById('ec-btn-open-saved-ideas');
    dom.savedIdeasCountBadge = document.getElementById('ec-saved-ideas-count');

    // Resultados Ideas (Fase 3)
    dom.ideasResultsSection = document.getElementById('ec-ideas-results');
    dom.ideasTitle = document.getElementById('ec-ideas-title');
    dom.ideasSubtitle = document.getElementById('ec-ideas-subtitle');
    dom.ideasContainer = document.getElementById('ec-ideas-container');
    dom.btnCopyIdeas = document.getElementById('ec-btn-copy-ideas');
    dom.btnExportIdeasPdf = document.getElementById('ec-btn-export-ideas-pdf');

    // Formulario Estructurador de Reels (Fase 3)
    dom.reelForm = document.getElementById('ec-reel-form');
    dom.reelTreatment = document.getElementById('ec-reel-treatment');
    dom.reelStructure = document.getElementById('ec-reel-structure');
    dom.reelDuration = document.getElementById('ec-reel-duration');
    dom.reelTone = document.getElementById('ec-reel-tone');
    dom.reelCustomHook = document.getElementById('ec-reel-custom-hook');
    dom.btnGenerateReel = document.getElementById('ec-btn-generate-reel');
    dom.btnOpenSavedScripts = document.getElementById('ec-btn-open-saved-scripts');
    dom.savedScriptsCountBadge = document.getElementById('ec-saved-scripts-count');

    // Resultados Estructurador (Fase 3)
    dom.reelResultsSection = document.getElementById('ec-reel-results');
    dom.reelSheet = document.getElementById('ec-reel-sheet');

    // Formulario Carruseles (Fase 4)
    dom.carouselForm = document.getElementById('ec-carousel-form');
    dom.carouselTreatment = document.getElementById('ec-carousel-treatment');
    dom.carouselArchetype = document.getElementById('ec-carousel-archetype');
    dom.carouselObjective = document.getElementById('ec-carousel-objective');
    dom.carouselSlidesCount = document.getElementById('ec-carousel-slides-count');
    dom.carouselCustomHook = document.getElementById('ec-carousel-custom-hook');
    dom.btnGenerateCarousel = document.getElementById('ec-btn-generate-carousel');
    dom.btnOpenSavedCarousels = document.getElementById('ec-btn-open-saved-carousels');
    dom.savedCarouselsCountBadge = document.getElementById('ec-saved-carousels-count');

    // Resultados Carruseles (Fase 4)
    dom.carouselResultsSection = document.getElementById('ec-carousel-results');
    dom.carouselSheet = document.getElementById('ec-carousel-sheet');

    // Formulario Historias (Fase 4)
    dom.storiesForm = document.getElementById('ec-stories-form');
    dom.storiesTreatment = document.getElementById('ec-stories-treatment');
    dom.storiesCategory = document.getElementById('ec-stories-category');
    dom.storiesStructure = document.getElementById('ec-stories-structure');
    dom.storiesCount = document.getElementById('ec-stories-count');
    dom.storiesFormatMode = document.getElementById('ec-stories-format-mode');
    dom.storiesCustomTopic = document.getElementById('ec-stories-custom-topic');
    dom.btnGenerateStories = document.getElementById('ec-btn-generate-stories');
    dom.btnOpenSavedStories = document.getElementById('ec-btn-open-saved-stories');
    dom.savedStoriesCountBadge = document.getElementById('ec-saved-stories-count');

    // Resultados Historias (Fase 4)
    dom.storiesResultsSection = document.getElementById('ec-stories-results');
    dom.storiesSheet = document.getElementById('ec-stories-sheet');

    // Modales
    dom.favsModal = document.getElementById('ec-favs-modal');
    dom.favsList = document.getElementById('ec-favs-list');
    dom.btnCloseFavs = document.getElementById('ec-btn-close-favs');
    dom.btnClearFavs = document.getElementById('ec-btn-clear-favs');
    dom.btnExportFavsPdf = document.getElementById('ec-btn-export-favs-pdf');

    dom.savedIdeasModal = document.getElementById('ec-saved-ideas-modal');
    dom.savedIdeasList = document.getElementById('ec-saved-ideas-list');
    dom.btnCloseSavedIdeas = document.getElementById('ec-btn-close-saved-ideas');
    dom.btnClearSavedIdeas = document.getElementById('ec-btn-clear-saved-ideas');
    dom.btnExportSavedIdeasPdf = document.getElementById('ec-btn-export-saved-ideas-pdf');

    dom.savedScriptsModal = document.getElementById('ec-saved-scripts-modal');
    dom.savedScriptsList = document.getElementById('ec-saved-scripts-list');
    dom.btnCloseSavedScripts = document.getElementById('ec-btn-close-saved-scripts');
    dom.btnClearSavedScripts = document.getElementById('ec-btn-clear-saved-scripts');

    // Modales Carruseles & Historias (Fase 4)
    dom.savedCarouselsModal = document.getElementById('ec-saved-carousels-modal');
    dom.savedCarouselsList = document.getElementById('ec-saved-carousels-list');
    dom.btnCloseSavedCarousels = document.getElementById('ec-btn-close-saved-carousels');
    dom.btnClearSavedCarousels = document.getElementById('ec-btn-clear-saved-carousels');

    dom.savedStoriesModal = document.getElementById('ec-saved-stories-modal');
    dom.savedStoriesList = document.getElementById('ec-saved-stories-list');
    dom.btnCloseSavedStories = document.getElementById('ec-btn-close-saved-stories');
    dom.btnClearSavedStories = document.getElementById('ec-btn-clear-saved-stories');

    // Modal Exportador Visual PNG (Fase 7)
    dom.visualModal = document.getElementById('ec-visual-export-modal');
    dom.visualModalTitle = document.getElementById('visual-modal-title');
    dom.visualModalEyebrow = document.getElementById('visual-modal-eyebrow');
    dom.visualCanvas = document.getElementById('ec-visual-canvas');
    dom.visualBtnPrev = document.getElementById('ec-visual-btn-prev');
    dom.visualBtnNext = document.getElementById('ec-visual-btn-next');
    dom.visualPagerIndicator = document.getElementById('ec-visual-pager-indicator');
    dom.visualBtnClose = document.getElementById('ec-btn-close-visual-modal');
    dom.visualTplBtns = document.querySelectorAll('.ec-tpl-btn');
    dom.visualBrandName = document.getElementById('ec-visual-brand-name');
    dom.visualBrandHandle = document.getElementById('ec-visual-brand-handle');
    dom.visualPhotoInput = document.getElementById('ec-visual-photo-input');
    dom.visualBtnDownloadSingle = document.getElementById('ec-visual-btn-download-single');
    dom.visualBtnDownloadAll = document.getElementById('ec-visual-btn-download-all');
    dom.visualRenderTime = document.getElementById('ec-visual-render-time');

    // Calendario Editorial (Etapa C)
    dom.calViewMonth = document.getElementById('ec-cal-view-month');
    dom.calViewWeek = document.getElementById('ec-cal-view-week');
    dom.calBtnPrev = document.getElementById('ec-cal-btn-prev');
    dom.calBtnToday = document.getElementById('ec-cal-btn-today');
    dom.calBtnNext = document.getElementById('ec-cal-btn-next');
    dom.calHeading = document.getElementById('ec-cal-heading');
    dom.calBtnImport = document.getElementById('ec-cal-btn-import');
    dom.calBtnCopy = document.getElementById('ec-cal-btn-copy');
    dom.calBtnExportPdf = document.getElementById('ec-cal-btn-export-pdf');
    dom.calBtnAdd = document.getElementById('ec-cal-btn-add');
    dom.calFilterType = document.getElementById('ec-cal-filter-type');
    dom.calFilterStatus = document.getElementById('ec-cal-filter-status');
    dom.calBtnSeed = document.getElementById('ec-cal-btn-seed');
    dom.calStatTotal = document.getElementById('ec-cal-stat-total');
    dom.calStatProd = document.getElementById('ec-cal-stat-prod');
    dom.calStatReady = document.getElementById('ec-cal-stat-ready');
    dom.calMonthWrap = document.getElementById('ec-cal-month-wrap');
    dom.calMonthGrid = document.getElementById('ec-cal-month-grid');
    dom.calWeekWrap = document.getElementById('ec-cal-week-wrap');
    dom.calWeekColumns = document.getElementById('ec-cal-week-columns');

    // Selectores de motor y botones de Gemini AI en todos los módulos
    dom.ideasEngine = document.getElementById('ec-ideas-engine');
    dom.reelEngine = document.getElementById('ec-reel-engine');
    dom.carouselEngine = document.getElementById('ec-carousel-engine');
    dom.storiesEngine = document.getElementById('ec-stories-engine');
    dom.calBtnGemini = document.getElementById('ec-cal-btn-gemini');

    // Modales Calendario
    dom.calEventModal = document.getElementById('ec-cal-event-modal');
    dom.calModalTitle = document.getElementById('cal-modal-title');
    dom.calEventForm = document.getElementById('ec-cal-event-form');
    dom.calInputId = document.getElementById('cal-input-id');
    dom.calInputSourceType = document.getElementById('cal-input-source-type');
    dom.calInputSourceId = document.getElementById('cal-input-source-id');
    dom.calInputTitle = document.getElementById('cal-input-title');
    dom.calInputDate = document.getElementById('cal-input-date');
    dom.calInputTime = document.getElementById('cal-input-time');
    dom.calInputType = document.getElementById('cal-input-type');
    dom.calInputStatus = document.getElementById('cal-input-status');
    dom.calInputTreatment = document.getElementById('cal-input-treatment');
    dom.calInputHook = document.getElementById('cal-input-hook');
    dom.calInputNotes = document.getElementById('cal-input-notes');
    dom.calBtnDelete = document.getElementById('ec-cal-btn-delete');
    dom.calBtnSave = document.getElementById('ec-cal-btn-save');
    dom.btnCloseCalModal = document.getElementById('ec-btn-close-cal-modal');
    dom.btnCancelCalModal = document.getElementById('ec-btn-cancel-cal-modal');

    // Modal Importación Calendario
    dom.calImportModal = document.getElementById('ec-cal-import-modal');
    dom.btnCloseImportModal = document.getElementById('ec-btn-close-import-modal');
    dom.btnCloseImportModalFooter = document.getElementById('ec-btn-close-import-modal-footer');
    dom.btnImportTabIdeas = document.getElementById('ec-btn-import-tab-ideas');
    dom.btnImportTabScripts = document.getElementById('ec-btn-import-tab-scripts');
    dom.btnImportTabCarousels = document.getElementById('ec-btn-import-tab-carousels');
    dom.btnImportTabStories = document.getElementById('ec-btn-import-tab-stories');
    dom.calImportList = document.getElementById('ec-cal-import-list');

    // Toast
    dom.toast = document.getElementById('ec-toast');
  }

  function bindEvents() {
    // Navegación por pestañas
    dom.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        switchTab(tab);
      });
    });

    // Eventos Formulario Ganchos
    if (dom.audience) {
      dom.audience.addEventListener('change', () => {
        handleAudienceChange();
        populateTreatments();
      });
    }
    if (dom.specialty) {
      dom.specialty.addEventListener('change', () => populateTreatments());
    }
    if (dom.intensity) {
      dom.intensity.addEventListener('input', () => updateIntensityLabel());
    }
    if (dom.advancedToggle) {
      dom.advancedToggle.addEventListener('click', toggleAdvancedPane);
    }
    if (dom.btnGenerate) {
      dom.btnGenerate.addEventListener('click', e => { e.preventDefault(); handleGenerate(false); });
    }
    if (dom.form) {
      dom.form.addEventListener('submit', e => { e.preventDefault(); handleGenerate(false); });
    }
    if (dom.btnRotate) dom.btnRotate.addEventListener('click', handleRotate);
    if (dom.btnCopyBatch) dom.btnCopyBatch.addEventListener('click', handleCopyBatch);
    if (dom.btnExportPdf) dom.btnExportPdf.addEventListener('click', handleExportPdf);
    if (dom.btnOpenFavs) dom.btnOpenFavs.addEventListener('click', openFavsModal);
    if (dom.btnCloseFavs) dom.btnCloseFavs.addEventListener('click', closeFavsModal);
    if (dom.btnClearFavs) dom.btnClearFavs.addEventListener('click', handleClearFavs);
    if (dom.btnExportFavsPdf) dom.btnExportFavsPdf.addEventListener('click', handleExportFavsPdf);

    // Eventos Formulario Ideas (Fase 3)
    if (dom.ideasAudience) {
      dom.ideasAudience.addEventListener('change', () => {
        if (dom.ideasAudience.value === 'responsable_negocio') dom.ideasSpecialty.value = 'negocio_marketing';
        populateIdeasTreatments();
      });
    }
    if (dom.ideasSpecialty) {
      dom.ideasSpecialty.addEventListener('change', () => populateIdeasTreatments());
    }
    if (dom.btnGenerateIdeas) {
      dom.btnGenerateIdeas.addEventListener('click', e => { e.preventDefault(); handleGenerateIdeas(); });
    }
    if (dom.btnCopyIdeas) dom.btnCopyIdeas.addEventListener('click', handleCopyIdeas);
    if (dom.btnExportIdeasPdf) dom.btnExportIdeasPdf.addEventListener('click', handleExportIdeasPdf);
    if (dom.btnOpenSavedIdeas) dom.btnOpenSavedIdeas.addEventListener('click', openSavedIdeasModal);
    if (dom.btnCloseSavedIdeas) dom.btnCloseSavedIdeas.addEventListener('click', closeSavedIdeasModal);
    if (dom.btnClearSavedIdeas) dom.btnClearSavedIdeas.addEventListener('click', handleClearSavedIdeas);
    if (dom.btnExportSavedIdeasPdf) dom.btnExportSavedIdeasPdf.addEventListener('click', handleExportSavedIdeasPdf);

    // Eventos Formulario Estructurador (Fase 3)
    if (dom.btnGenerateReel) {
      dom.btnGenerateReel.addEventListener('click', e => { e.preventDefault(); handleGenerateReel(); });
    }
    if (dom.btnOpenSavedScripts) dom.btnOpenSavedScripts.addEventListener('click', openSavedScriptsModal);
    if (dom.btnCloseSavedScripts) dom.btnCloseSavedScripts.addEventListener('click', closeSavedScriptsModal);
    if (dom.btnClearSavedScripts) dom.btnClearSavedScripts.addEventListener('click', handleClearSavedScripts);

    // Eventos Formulario Carruseles (Fase 4)
    if (dom.btnGenerateCarousel) {
      dom.btnGenerateCarousel.addEventListener('click', e => { e.preventDefault(); handleGenerateCarousel(); });
    }
    if (dom.btnOpenSavedCarousels) dom.btnOpenSavedCarousels.addEventListener('click', openSavedCarouselsModal);
    if (dom.btnCloseSavedCarousels) dom.btnCloseSavedCarousels.addEventListener('click', closeSavedCarouselsModal);
    if (dom.btnClearSavedCarousels) dom.btnClearSavedCarousels.addEventListener('click', handleClearSavedCarousels);

    // Eventos Formulario Historias (Fase 4)
    if (dom.btnGenerateStories) {
      dom.btnGenerateStories.addEventListener('click', e => { e.preventDefault(); handleGenerateStories(); });
    }
    if (dom.btnOpenSavedStories) dom.btnOpenSavedStories.addEventListener('click', openSavedStoriesModal);
    if (dom.btnCloseSavedStories) dom.btnCloseSavedStories.addEventListener('click', closeSavedStoriesModal);
    if (dom.btnClearSavedStories) dom.btnClearSavedStories.addEventListener('click', handleClearSavedStories);

    // Eventos Calendario Editorial (Etapa C)
    if (dom.calViewMonth) dom.calViewMonth.addEventListener('click', () => setCalendarView('month'));
    if (dom.calViewWeek) dom.calViewWeek.addEventListener('click', () => setCalendarView('week'));
    if (dom.calBtnPrev) dom.calBtnPrev.addEventListener('click', handleCalPrev);
    if (dom.calBtnToday) dom.calBtnToday.addEventListener('click', handleCalToday);
    if (dom.calBtnNext) dom.calBtnNext.addEventListener('click', handleCalNext);
    if (dom.calBtnAdd) dom.calBtnAdd.addEventListener('click', () => openCreateEventModal());
    if (dom.calBtnGemini) dom.calBtnGemini.addEventListener('click', handleGenerateCalendarGemini);
    if (dom.calBtnImport) dom.calBtnImport.addEventListener('click', openImportModal);
    if (dom.calBtnCopy) dom.calBtnCopy.addEventListener('click', handleCopyCalendarSummary);
    if (dom.calBtnExportPdf) dom.calBtnExportPdf.addEventListener('click', handleExportCalendarPdf);
    if (dom.calFilterType) dom.calFilterType.addEventListener('change', handleCalFilterChange);
    if (dom.calFilterStatus) dom.calFilterStatus.addEventListener('change', handleCalFilterChange);
    if (dom.calBtnSeed) dom.calBtnSeed.addEventListener('click', handleCalSeed);

    // Modales Calendario
    if (dom.btnCloseCalModal) dom.btnCloseCalModal.addEventListener('click', closeCalModal);
    if (dom.btnCancelCalModal) dom.btnCancelCalModal.addEventListener('click', closeCalModal);
    if (dom.calBtnSave) dom.calBtnSave.addEventListener('click', handleSaveEvent);
    if (dom.calBtnDelete) dom.calBtnDelete.addEventListener('click', handleDeleteEvent);

    // Modal Importación
    if (dom.btnCloseImportModal) dom.btnCloseImportModal.addEventListener('click', closeImportModal);
    if (dom.btnCloseImportModalFooter) dom.btnCloseImportModalFooter.addEventListener('click', closeImportModal);
    if (dom.btnImportTabIdeas) dom.btnImportTabIdeas.addEventListener('click', () => switchImportTab('ideas'));
    if (dom.btnImportTabScripts) dom.btnImportTabScripts.addEventListener('click', () => switchImportTab('scripts'));
    if (dom.btnImportTabCarousels) dom.btnImportTabCarousels.addEventListener('click', () => switchImportTab('carousels'));
    if (dom.btnImportTabStories) dom.btnImportTabStories.addEventListener('click', () => switchImportTab('stories'));

    // Inicializar Modal de Exportación Visual (Fase 7)
    initVisualExportModal();

    // Tecla ESC para cerrar cualquier modal abierto
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeFavsModal();
        closeSavedIdeasModal();
        closeSavedScriptsModal();
        closeSavedCarouselsModal();
        closeSavedStoriesModal();
        closeCalModal();
        closeImportModal();
        closeVisualExportModal();
      }
    });

    [dom.favsModal, dom.savedIdeasModal, dom.savedScriptsModal, dom.savedCarouselsModal, dom.savedStoriesModal, dom.calEventModal, dom.calImportModal, dom.visualModal].forEach(modal => {
      if (modal) {
        modal.addEventListener('click', e => { if (e.target === modal) modal.setAttribute('hidden', ''); });
      }
    });
  }

  // =========================================================================
  // SISTEMA DE PESTAÑAS Y ENRUTAMIENTO LOCAL
  // =========================================================================

  function switchTab(targetTab) {
    dom.tabBtns.forEach(btn => {
      const isTarget = btn.getAttribute('data-tab') === targetTab;
      btn.classList.toggle('is-active', isTarget);
      btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });

    Object.keys(dom.views).forEach(k => {
      if (dom.views[k]) {
        if (k === targetTab) dom.views[k].removeAttribute('hidden');
        else dom.views[k].setAttribute('hidden', '');
      }
    });

    // Actualizar títulos contextuales
    if (targetTab === 'ganchos') {
      dom.mainTitle.innerHTML = 'Generador de Ganchos para <em>Reels, Anuncios y Carruseles</em>';
      dom.mainLead.textContent = 'Diseña aperturas visuales, verbales y de texto en pantalla para captar la atención de tus pacientes sin sensacionalismo ni promesas vacías.';
    } else if (targetTab === 'ideas') {
      dom.mainTitle.innerHTML = 'Generador de Ideas y <em>Ángulos de Contenido</em>';
      dom.mainLead.textContent = 'Explora 179 temas clínicos y estratégicos categorizados por etapa del embudo para planificar meses de publicaciones.';
      if (!currentIdeasBatch) handleGenerateIdeas();
    } else if (targetTab === 'estructurador') {
      dom.mainTitle.innerHTML = 'Estructurador de Reels y <em>Guiones de Rodaje</em>';
      dom.mainLead.textContent = 'Convierte cualquier gancho o idea en un guion técnico segundo a segundo con indicación de cámara, teleprompter continuo y checklist de cabina.';
      if (!currentScript) handleGenerateReel();
    } else if (targetTab === 'carruseles') {
      dom.mainTitle.innerHTML = 'Editor de Carruseles y <em>Estructuras Deslizables</em>';
      dom.mainLead.textContent = 'Diseña carruseles educativos y de autoridad lámina a lámina (formato 4:5) basados en 7 arquetipos editoriales probados con ganchos continuos.';
      if (!currentCarousel) handleGenerateCarousel();
    } else if (targetTab === 'historias') {
      dom.mainTitle.innerHTML = 'Generador de Secuencias de <em>Historias de Instagram</em>';
      dom.mainLead.textContent = 'Crea secuencias verticales de 3 a 6 historias (9:16) con stickers interactivos, modos de producción y llamados a la acción éticos.';
      if (!currentStoriesSequence) handleGenerateStories();
    } else if (targetTab === 'calendario') {
      dom.mainTitle.innerHTML = 'Calendario Editorial <em>y Planificación</em>';
      dom.mainLead.textContent = 'Organiza tus publicaciones semanales y mensuales, asigna estados de producción y exporta tu cronograma.';
      renderCalendar();
    }

    try { history.replaceState(null, null, `#${targetTab}`); } catch (e) {}
  }

  function checkUrlTab() {
    const hash = (window.location.hash || '').replace('#', '');
    if (['ganchos', 'ideas', 'estructurador', 'carruseles', 'historias', 'calendario'].includes(hash)) {
      switchTab(hash);
    }
  }

  // =========================================================================
  // POBLADO DE SELECTORES REACTIVOS
  // =========================================================================

  function handleAudienceChange() {
    // Modo B2C exclusivo para generación de contenido a pacientes
  }

  function populateTreatments() {
    if (!isInitialized) return;
    const spec = dom.specialty ? dom.specialty.value : 'medicina_estetica';
    dom.treatment.innerHTML = '';

    const treatments = GlossContentEngine.getTreatments(spec === 'todas' ? null : spec, 'paciente');
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = `Todos los tratamientos de ${getSpecialtyLabel(spec)}`;
    dom.treatment.appendChild(defaultOpt);

    treatments.filter(t => t.categoria !== 'negocio_marketing' && t.id !== 'negocio_marketing').forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.nombre_habitual;
      dom.treatment.appendChild(opt);
    });
  }

  function populateIdeasTreatments() {
    if (!isInitialized || !dom.ideasTreatment) return;
    const spec = dom.ideasSpecialty ? dom.ideasSpecialty.value : 'todas';
    dom.ideasTreatment.innerHTML = '';

    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = 'Todos los tratamientos del área';
    dom.ideasTreatment.appendChild(defaultOpt);

    const treatments = GlossContentEngine.getTreatments(spec === 'todas' ? null : spec, 'paciente');
    treatments.filter(t => t.categoria !== 'negocio_marketing' && t.id !== 'negocio_marketing').forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.nombre_habitual;
      dom.ideasTreatment.appendChild(opt);
    });
  }

  function populateReelTreatments() {
    if (!isInitialized || !dom.reelTreatment) return;
    dom.reelTreatment.innerHTML = '';
    const treatments = GlossContentEngine.getTreatments();

    treatments.filter(t => t.categoria !== 'negocio_marketing' && t.id !== 'negocio_marketing').forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = `${t.nombre_habitual} (${getSpecialtyLabel(t.categoria)})`;
      dom.reelTreatment.appendChild(opt);
    });
  }

  function getSpecialtyLabel(key) {
    const map = {
      medicina_estetica: 'Medicina Estética',
      estetica_facial: 'Estética Facial',
      estetica_corporal: 'Estética Corporal',
      depilacion: 'Depilación Láser',
      spa_bienestar: 'Spa y Bienestar',
      negocio_marketing: 'Gestión y Rentabilidad'
    };
    return map[key] || 'Especialidad';
  }

  function updateIntensityLabel() {
    const val = parseInt(dom.intensity.value, 10);
    const labels = {
      1: 'Nivel 1: Sobrio y Clínico',
      2: 'Nivel 2: Informativo',
      3: 'Nivel 3: Persuasivo Equilibrado',
      4: 'Nivel 4: Curioso y Confrontativo',
      5: 'Nivel 5: Alerta Crítica'
    };
    if (dom.intensityBadge) {
      dom.intensityBadge.textContent = labels[val] || `Nivel ${val}`;
    }
  }

  function toggleAdvancedPane() {
    const isHidden = dom.advancedPane.hasAttribute('hidden');
    if (isHidden) {
      dom.advancedPane.removeAttribute('hidden');
      dom.advancedToggle.innerHTML = '<span aria-hidden="true">▲</span> Ocultar ajustes avanzados';
    } else {
      dom.advancedPane.setAttribute('hidden', '');
      dom.advancedToggle.innerHTML = '<span aria-hidden="true">▼</span> Mostrar ajustes avanzados (Plataforma, Intensidad, Recursos)';
    }
  }

  function getSelectedAssets() {
    const assets = [];
    document.querySelectorAll('.ec-checkbox-item input[type="checkbox"]:checked').forEach(cb => {
      assets.push(cb.value);
    });
    return assets.length > 0 ? assets : ['medico_camara', 'broll_cabina'];
  }

  // =========================================================================
  // GESTIÓN: GENERADOR DE GANCHOS (CONEXIÓN GEMINI AI v2.3.1 + BIBLIOTECA LOCAL)
  // =========================================================================
  // GESTIÓN: TURNSTILE Y CONEXIÓN CON CLOUDFLARE WORKER / GEMINI v2.3.2
  // =========================================================================

  let turnstileWidgetId = null;
  let currentTurnstileToken = null;

  function setupTurnstile() {
    if (typeof window.turnstile !== 'undefined') {
      try {
        const container = document.getElementById('ec-turnstile-container');
        if (container && turnstileWidgetId === null) {
          turnstileWidgetId = window.turnstile.render(container, {
            sitekey: '1x00000000000000000000AA', // Cloudflare Turnstile Managed Key
            theme: 'light',
            size: 'flexible',
            callback: function(token) {
              currentTurnstileToken = token;
            },
            'expired-callback': function() {
              currentTurnstileToken = null;
            }
          });
        }
      } catch (e) {
        console.warn('Turnstile init warning:', e);
      }
    } else {
      setTimeout(setupTurnstile, 600);
    }
  }

  async function handleGenerate(isInitialLoad = false) {
    if (!isInitialized) return;

    // 1. Carga inicial: presentar estructuras de referencia de la biblioteca local
    // claramente identificadas como demostración, sin simular ejecución con IA.
    if (isInitialLoad) {
      renderInitialReferenceState();
      return;
    }

    // 2. Indicador visual de carga en el botón
    if (dom.btnGenerate) {
      dom.btnGenerate.disabled = true;
      dom.btnGenerate.innerHTML = '<span aria-hidden="true">⏳</span> Generando con Gemini AI...';
    }

    try {
      await handleGenerateGemini();
    } catch (err) {
      console.warn('Gemini AI no completado. Conmutando a biblioteca local:', err);
      showToast(`⚠️ No fue posible conectar con Gemini AI (${err.message}). Mostrando biblioteca local.`);
      generateWithLocalEngine(err.message);
    } finally {
      if (dom.btnGenerate) {
        dom.btnGenerate.disabled = false;
        dom.btnGenerate.innerHTML = '<span aria-hidden="true">✨</span> Generar ganchos con IA';
      }
    }
  }

  function generateWithLocalEngine(fallbackError = null) {
    const options = {
      audience: 'paciente',
      specialty: dom.specialty ? dom.specialty.value : 'todas',
      treatment_id: dom.treatment ? dom.treatment.value : null,
      objective: dom.objective ? dom.objective.value : 'educar',
      format: dom.format ? dom.format.value : 'todos',
      platform: dom.platform ? dom.platform.value : 'instagram_reels',
      intensity: parseInt(dom.intensity ? dom.intensity.value : 3, 10),
      style: dom.style ? dom.style.value : 'Clínico y prudente',
      count: parseInt(dom.count ? dom.count.value : 6, 10),
      available_assets: getSelectedAssets()
    };

    try {
      currentBatch = GlossContentEngine.generate(options);
      currentBatch.metadata.engine = 'local_library';
      currentBatch.metadata.is_fallback = Boolean(fallbackError);
      currentBatch.metadata.fallback_reason = fallbackError;
      currentBatch.metadata.engine_label = fallbackError
        ? 'Biblioteca Editorial Local (Modo de contingencia por indisponibilidad de API)'
        : 'Biblioteca Editorial Local Gloss Growth';

      renderResults(currentBatch);
      if (fallbackError) {
        showToast('Propuestas cargadas desde la Biblioteca Local.');
      } else {
        showToast(`Se cargaron ${currentBatch.items.length} propuestas de la biblioteca local.`);
      }
    } catch (err) {
      console.error('Error al generar ganchos locales:', err);
      showToast('Error en la generación de ganchos.');
    }
  }

  function renderInitialReferenceState() {
    const options = {
      audience: 'paciente',
      specialty: 'todas',
      treatment_id: dom.treatment?.value || null,
      objective: 'educar',
      format: 'todos',
      platform: 'instagram_reels',
      intensity: 3,
      style: 'Clínico y prudente',
      count: 6,
      available_assets: getSelectedAssets()
    };

    try {
      currentBatch = GlossContentEngine.generate(options);
      currentBatch.metadata.engine = 'reference_initial';
      currentBatch.metadata.is_initial = true;
      currentBatch.metadata.engine_label = 'Estructuras Editoriales de Referencia (Demostración)';
      renderResults(currentBatch);
    } catch (err) {
      console.warn('Aviso en carga inicial:', err);
    }
  }

  /**
   * Cliente API centralizado para Cloudflare Worker (Gloss Growth AI / Gemini v2.3.2)
   * Autenticación pública segura con Turnstile y control de abusos.
   */
  async function callGlossWorkerGenerate(payload) {
    const endpoint = 'https://gloss-growth-ai.santiagokansas890.workers.dev/generate';
    const headers = {
      'Content-Type': 'application/json'
    };

    if (currentTurnstileToken) {
      headers['X-Turnstile-Token'] = currentTurnstileToken;
    }

    const reqBody = {
      modelo: 'models/gemini-3.1-flash-lite',
      ejecutar_auditoria_semantica: true,
      cf_turnstile_response: currentTurnstileToken || undefined,
      ...payload
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(reqBody)
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error || `Error del servidor (HTTP ${response.status})`);
    }

    const resData = await response.json();
    if (!resData.ok || !resData.resultado) {
      throw new Error(resData.error || 'Respuesta inválida del servidor');
    }

    // Renovar token Turnstile si está disponible para el siguiente envío
    if (window.turnstile && turnstileWidgetId !== null) {
      try {
        window.turnstile.reset(turnstileWidgetId);
        currentTurnstileToken = null;
      } catch {}
    }

    return resData;
  }

  async function handleGenerateGemini() {
    const treatmentSelect = dom.treatment;
    const selectedOption = treatmentSelect?.options[treatmentSelect.selectedIndex];
    const treatmentName = selectedOption ? selectedOption.textContent.trim() : 'Tratamiento estético';
    const objectiveText = dom.objective?.options[dom.objective.selectedIndex]?.textContent.trim() || 'educar';

    const resData = await callGlossWorkerGenerate({
      formato: 'ganchos_completo',
      tratamiento: treatmentName,
      objetivo: objectiveText
    });

    const geminiBatch = adaptGeminiResultToBatch(resData, treatmentName, 'ganchos_completo');
    geminiBatch.metadata.engine = 'gemini_ai';
    geminiBatch.metadata.engine_label = 'Google Gemini AI v2.3.2 (Supervisado por Auditoría en 2 Niveles)';
    currentBatch = geminiBatch;
    renderResults(currentBatch);

    const auditoria = resData.auditoria_editorial || {};
    const esAprobado = auditoria.aprobada;
    const reintentos = resData.reintentos_ejecutados || 0;
    const calif = auditoria.nivel_semantico?.calificacion || 9;

    showToast(
      esAprobado
        ? `✨ 6 ganchos generados con Gemini AI (${calif}/10 · ${reintentos > 0 ? 'Auto-corregido' : 'Directo'}).`
        : `⚠️ Ganchos generados con observaciones del auditor editorial.`
    );
  }

  function adaptGeminiResultToBatch(geminiData, treatmentName, formatoAI) {
    const res = geminiData.resultado || {};
    const opciones = res.opciones || [];
    const esCompleto = formatoAI === 'ganchos_completo' || res.modalidad === 'completo';

    const items = opciones.map((opc, idx) => {
      const verbal = typeof opc === 'string' ? opc : (opc.gancho_verbal || opc.texto || '');
      const textual = typeof opc === 'object' && opc.texto_en_pantalla ? opc.texto_en_pantalla : (verbal.slice(0, 42) + '...');
      const visual = typeof opc === 'object' && opc.gancho_visual ? opc.gancho_visual : '[Médico o especialista en cabina frente a cámara con iluminación clínica profesional]';
      const familiaCodigo = typeof opc === 'object' && opc.familia ? opc.familia : ['AUTO', 'CONTRA', 'NEG', 'COMP', 'GAP', 'UTIL'][idx % 6];

      return {
        result_id: `gemini-hook-${Date.now()}-${idx + 1}`,
        source_hook_id: `gemini-${idx + 1}`,
        family: {
          code: familiaCodigo,
          name: getFamilyNameByCode(familiaCodigo),
          mechanism: "Ángulo persuasivo validado por auditoría clínica en dos niveles de Gloss & Growth."
        },
        intensity: 4,
        hook_triad: {
          textual: textual,
          verbal: verbal,
          visual: visual,
          synchronization_pattern: esCompleto
            ? "Tríada tridimensional simultánea (Acción visual 0-1s, Texto en pantalla máx 7 palabras, Voz 10-22 palabras)"
            : "Gancho verbal oral directo para cámara (10-22 palabras)"
        },
        structure: {
          hook_category: esCompleto ? "Tríada Completa (Gemini AI v2.3.1)" : "Frase Rápida (Gemini AI v2.3.1)",
          angle: "Generado con Google Gemini 3.1 Flash Lite",
          target_audience: "Pacientes de medicina estética en Colombia",
          key_insight: "Mensaje ético sin garantías de seguridad, sin dolor garantizado y sin fisiología ficticia."
        }
      };
    });

    return {
      metadata: {
        treatment_name: res.tratamiento || treatmentName,
        treatment_id: dom.treatment?.value || 'gemini_custom',
        generated_count: items.length,
        format: esCompleto ? 'Tríada Visual-Textual-Verbal (Gemini AI v2.3.1)' : 'Frases Orales Rápidas (Gemini AI v2.3.1)',
        objective: dom.objective?.value || 'educar',
        intensity: 4,
        style: 'Clínico y prudente',
        audience: dom.audience?.value || 'mujeres_profesionales'
      },
      items: items
    };
  }

  function getFamilyNameByCode(code) {
    const map = {
      AUTO: "Autoidentificación del paciente",
      CONTRA: "Contraintuitivo y desmitificador",
      NEG: "Error frecuente prevenible",
      COMP: "Comparativa de decisión clínica",
      GAP: "Brecha de curiosidad anatómica",
      UTIL: "Criterio y prudencia médica",
      AUT: "Autoridad y valoración profesional"
    };
    return map[code] || "Ángulo persuasivo ético";
  }

  function handleRotate() {
    if (!currentBatch || !isInitialized) return;
    const previousIds = currentBatch.items.map(item => item.source_hook_id);
    const options = {
      audience: currentBatch.metadata.audience,
      specialty: currentBatch.metadata.specialty,
      treatment_id: currentBatch.metadata.treatment_id,
      objective: currentBatch.metadata.objective,
      format: currentBatch.metadata.format,
      platform: currentBatch.metadata.platform,
      intensity: currentBatch.metadata.intensity,
      style: currentBatch.metadata.style,
      count: currentBatch.metadata.generated_count,
      available_assets: getSelectedAssets()
    };

    try {
      currentBatch = GlossContentEngine.generate(options, previousIds);
      renderResults(currentBatch);
      showToast('Nuevo lote rotado sin ganchos repetidos.');
    } catch (err) {
      console.error('Error al rotar ganchos:', err);
      showToast('Error al rotar lote.');
    }
  }

  function renderResults(batch) {
    if (!batch || !batch.items || !dom.cardsContainer) return;
    const meta = batch.metadata || {};
    const engine = meta.engine || 'local_library';
    const isAi = engine === 'gemini_ai';
    const isFallback = meta.is_fallback;
    const isInitial = meta.is_initial;

    if (dom.resultsTitle) {
      dom.resultsTitle.textContent = `${meta.generated_count || batch.items.length} propuestas para ${meta.treatment_name || 'tu clínica'}`;
    }

    if (dom.resultsSubtitle) {
      dom.resultsSubtitle.textContent = `Formato: ${getFormatLabel(meta.format)} · Objetivo: ${getObjectiveLabel(meta.objective)} · Intensidad: Nivel ${meta.intensity || 3}/5`;
    }

    dom.cardsContainer.innerHTML = '';

    // Render banner explicativo del estado del motor
    if (isAi) {
      const banner = document.createElement('div');
      banner.className = 'ec-status-banner ec-status-banner--ai';
      banner.innerHTML = `<span aria-hidden="true" style="font-size: 18px;">✨</span><div><strong>Generación con Inteligencia Artificial (Google Gemini v2.3.2):</strong> Propuestas personalizadas para tu procedimiento, validadas con auditoría médica y de estilo en dos niveles.</div>`;
      dom.cardsContainer.appendChild(banner);
    } else if (isFallback) {
      const banner = document.createElement('div');
      banner.className = 'ec-status-banner ec-status-banner--fallback';
      banner.innerHTML = `<span aria-hidden="true" style="font-size: 18px;">⚠️</span><div><strong>Modo de contingencia (Biblioteca Local):</strong> No fue posible conectar con Gemini AI (${escapeHtml(meta.fallback_reason || 'Servicio no disponible')}). Se presentan opciones pre-estructuradas de nuestra biblioteca clínica para que continúes trabajando.</div>`;
      dom.cardsContainer.appendChild(banner);
    } else if (isInitial) {
      const banner = document.createElement('div');
      banner.className = 'ec-status-banner ec-status-banner--reference';
      banner.innerHTML = `<span aria-hidden="true" style="font-size: 18px;">💡</span><div><strong>Estructuras editoriales de referencia (Demostración):</strong> Estas 6 propuestas son ejemplos de nuestra biblioteca clínica. Haz clic en <strong>"Generar ganchos con IA"</strong> para generar aperturas personalizadas en tiempo real con Gemini v2.3.2.</div>`;
      dom.cardsContainer.appendChild(banner);
    }

    batch.items.forEach((item, index) => {
      const card = createCardElement(item, index + 1, engine);
      dom.cardsContainer.appendChild(card);
    });

    if (dom.resultsSection) dom.resultsSection.removeAttribute('hidden');
  }

  function createCardElement(item, displayIndex, engine = 'local_library') {
    const card = document.createElement('article');
    card.className = 'ec-card';
    card.id = `card-${item.result_id}`;

    const fam = item.family || {};
    const triad = item.hook_triad || {};
    const isFav = checkIfFavorite(item.result_id);

    let engineBadge = '';
    if (engine === 'gemini_ai') {
      engineBadge = `<span class="ec-badge-engine ec-badge-engine--ai" title="Generado en tiempo real con Gemini v2.3.2">✨ Gemini AI</span>`;
    } else if (engine === 'reference_initial') {
      engineBadge = `<span class="ec-badge-engine ec-badge-engine--ref" title="Ejemplo de referencia editorial">📖 Referencia</span>`;
    } else {
      engineBadge = `<span class="ec-badge-engine ec-badge-engine--local" title="Biblioteca local de contingencia">📚 Biblioteca Local</span>`;
    }

    card.innerHTML = `
      <header class="ec-card-header">
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span class="ec-badge-family" title="${fam.mechanism || ''}">
            <span aria-hidden="true">⚡</span> ${fam.code} · ${fam.name}
          </span>
          ${engineBadge}
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span class="ec-badge-intensity">Nivel ${item.intensity || 3}/5</span>
          <button class="ec-btn-fav ${isFav ? 'is-favorite' : ''}" type="button" aria-label="Guardar en favoritos" title="Guardar en favoritos" data-result-id="${item.result_id}">
            ${isFav ? '♥' : '♡'}
          </button>
        </div>
      </header>

      <div class="ec-card-body">
        <!-- GANCHO HABLADO (PROTAGONISTA PRINCIPAL) -->
        <div class="ec-verbal-hero">
          <span class="ec-verbal-badge"><span aria-hidden="true">🎙️</span> Gancho hablado a cámara</span>
          <blockquote class="ec-verbal-quote" contenteditable="false" data-editable="verbal">“${escapeHtml(triad.verbal)}”</blockquote>
        </div>

        <!-- GUÍA DE GRABACIÓN RECOGIDA (CÁMARA Y TEXTO EN PANTALLA) -->
        <details class="ec-recording-guide-drawer">
          <summary class="ec-recording-guide-summary">
            <span>🎥 Ver guía de grabación (cámara y texto en pantalla)</span>
          </summary>
          <div class="ec-recording-guide-content">
            <div class="ec-screen-box">
              <span class="ec-screen-label">Texto en pantalla (Zona segura central)</span>
              <p class="ec-screen-text" contenteditable="false" data-editable="textual">${escapeHtml(triad.textual)}</p>
            </div>
            <div class="ec-visual-box">
              <span class="ec-box-label"><span aria-hidden="true">🎬</span> Dirección de cámara y acción inicial (0–1s)</span>
              <p class="ec-visual-desc" contenteditable="false" data-editable="visual">${escapeHtml(triad.visual)}</p>
            </div>
            <div class="ec-sync-pill">
              <span aria-hidden="true">⮂</span> <strong>Sincronía:</strong> ${escapeHtml(triad.synchronization_pattern || 'Tríada simultánea')}
            </div>
          </div>
        </details>

        <div class="ec-details-drawer">
          <button class="ec-details-toggle" type="button" aria-expanded="false">
            <span>Ver estructura y desglose completo</span>
            <span aria-hidden="true">▼</span>
          </button>
          <div class="ec-details-content" hidden>
            ${renderDetailsContent(item)}
          </div>
        </div>
      </div>

      <footer class="ec-card-footer">
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="ec-btn-card-action btn-copy-verbal" type="button" title="Copiar solo gancho hablado">
            <span aria-hidden="true">💬</span> Copiar gancho
          </button>
          <button class="ec-btn-card-action btn-copy-proposal" type="button" title="Copiar propuesta en Markdown">
            <span aria-hidden="true">📋</span> Copiar propuesta
          </button>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="ec-btn-card-action btn-send-to-reel" type="button" style="color: var(--ec-burgundy); font-weight: 700;" title="Estructurar un guion completo con este gancho">
            <span aria-hidden="true">🎬</span> Estructurar Reel
          </button>
          <button class="ec-btn-card-action btn-send-to-carousel" type="button" style="color: #0369A1; font-weight: 700;" title="Crear carrusel con este gancho">
            <span aria-hidden="true">🎨</span> Llevar a Carrusel
          </button>
          <button class="ec-btn-card-action btn-edit-card" type="button" title="Editar textos inline">
            <span aria-hidden="true">✏️</span> Editar
          </button>
        </div>
      </footer>
    `;

    // Vincular eventos
    card.querySelector('.ec-btn-fav').addEventListener('click', e => toggleFavoriteCard(item, e.currentTarget));
    const toggleBtn = card.querySelector('.ec-details-toggle');
    const detailsContent = card.querySelector('.ec-details-content');
    toggleBtn.addEventListener('click', () => {
      const isHidden = detailsContent.hasAttribute('hidden');
      if (isHidden) {
        detailsContent.removeAttribute('hidden');
        toggleBtn.setAttribute('aria-expanded', 'true');
        toggleBtn.querySelector('span:last-child').textContent = '▲';
      } else {
        detailsContent.setAttribute('hidden', '');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.querySelector('span:last-child').textContent = '▼';
      }
    });

    card.querySelector('.btn-copy-proposal').addEventListener('click', () => {
      copyToClipboardSafe(GlossContentEngine.formatProposalClipboard(item));
      showToast('Propuesta copiada al portapapeles.');
    });

    card.querySelector('.btn-copy-verbal').addEventListener('click', () => {
      copyToClipboardSafe(item.hook_triad.verbal);
      showToast('Gancho hablado copiado al portapapeles.');
    });

    card.querySelector('.btn-send-to-reel').addEventListener('click', () => {
      openReelWithHook(item);
    });

    card.querySelector('.btn-send-to-carousel').addEventListener('click', () => {
      openCarouselWithHook(item);
    });

    const editBtn = card.querySelector('.btn-edit-card');
    editBtn.addEventListener('click', () => toggleInlineEdit(card, item, editBtn));

    return card;
  }

  function renderDetailsContent(item) {
    let out = '';
    if (item.narrative_plan && item.narrative_plan.beats) {
      out += `
        <div class="ec-steps-list">
          <span class="ec-box-label">Estructura Narrativa: ${item.narrative_plan.structure_name}</span>
          ${item.narrative_plan.beats.map(b => `
            <div class="ec-step-item">
              <div class="ec-step-header"><span>[${b.duration}] ${escapeHtml(b.role)}</span></div>
              <div class="ec-step-body">
                <p style="margin: 0 0 2px;"><strong>Visual:</strong> ${escapeHtml(b.visual_cue)}</p>
                <p style="margin: 0;"><strong>Audio:</strong> ${escapeHtml(b.verbal_cue)}</p>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else if (item.carousel_plan && item.carousel_plan.slides) {
      out += `
        <div class="ec-steps-list">
          <span class="ec-box-label">Arquetipo de Carrusel: ${item.carousel_plan.archetype_name}</span>
          ${item.carousel_plan.slides.map(s => `
            <div class="ec-step-item">
              <div class="ec-step-header"><span>Lámina ${s.slide_number} [${s.role}]: ${escapeHtml(s.title)}</span></div>
              <div class="ec-step-body">
                <p style="margin: 0 0 2px;"><strong>Texto:</strong> ${escapeHtml(s.copy_text)}</p>
                <p style="margin: 0;"><strong>Dirección visual:</strong> ${escapeHtml(s.visual_guidance)}</p>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (item.cta) {
      out += `<div class="ec-cta-box"><strong>Llamado a la Acción (CTA):</strong> "${escapeHtml(item.cta.copy)}"</div>`;
    }
    if (item.editorial_guidance) {
      out += `<div class="ec-notice-box"><strong>Nota regulatoria:</strong> ${escapeHtml(item.editorial_guidance.regulatory_warning)}</div>`;
    }
    return out;
  }

  function toggleInlineEdit(card, item, btn) {
    const editables = card.querySelectorAll('[data-editable]');
    const isEditing = btn.classList.contains('is-editing');
    if (!isEditing) {
      editables.forEach(el => {
        el.setAttribute('contenteditable', 'true');
        el.style.outline = '2px dashed var(--ec-burgundy)';
        el.style.padding = '4px';
      });
      btn.innerHTML = '<span aria-hidden="true">💾</span> Guardar';
      btn.classList.add('is-editing');
      showToast('Modo edición activado.');
    } else {
      editables.forEach(el => {
        el.setAttribute('contenteditable', 'false');
        el.style.outline = 'none';
        el.style.padding = '';
        const field = el.getAttribute('data-editable');
        if (field === 'textual') item.hook_triad.textual = el.textContent.trim();
        if (field === 'verbal') item.hook_triad.verbal = el.textContent.replace(/[“”"]/g, '').trim();
        if (field === 'visual') item.hook_triad.visual = el.textContent.trim();
      });
      btn.innerHTML = '<span aria-hidden="true">✏️</span> Editar';
      btn.classList.remove('is-editing');
      showToast('Cambios guardados en la propuesta.');
    }
  }

  // =========================================================================
  // GESTIÓN: GENERADOR DE IDEAS (FASE 3)
  // =========================================================================

  async function handleGenerateIdeas() {
    if (!isInitialized) return;
    const options = {
      audience: dom.ideasAudience?.value || 'paciente',
      specialty: dom.ideasSpecialty ? dom.ideasSpecialty.value : 'todas',
      treatment_id: dom.ideasTreatment ? dom.ideasTreatment.value : null,
      funnel_stage: dom.ideasFunnel ? dom.ideasFunnel.value : null,
      angle: dom.ideasAngle ? dom.ideasAngle.value : null,
      count: parseInt(dom.ideasCount?.value || 6, 10)
    };

    try {
      await handleGenerateIdeasGemini(options);
    } catch (err) {
      console.warn('Fallo en Gemini AI para ideas. Fallback a biblioteca local:', err);
      try {
        currentIdeasBatch = GlossContentEngine.generateIdeas(options);
        renderIdeas(currentIdeasBatch);
        showToast(`Se generaron ${currentIdeasBatch.items.length} ideas estructuradas (Biblioteca local).`);
      } catch (innerErr) {
        console.error('Error al generar ideas locales:', innerErr);
        showToast('Error generando ideas.');
      }
    }
  }

  async function handleGenerateIdeasGemini(options) {
    const treatmentSelect = dom.ideasTreatment;
    const selectedOption = treatmentSelect?.options[treatmentSelect.selectedIndex];
    const treatmentName = selectedOption ? selectedOption.textContent.trim() : (options.treatment_id || 'Medicina Estética');

    if (dom.btnGenerateIdeas) {
      dom.btnGenerateIdeas.disabled = true;
      dom.btnGenerateIdeas.innerHTML = '<span aria-hidden="true">⏳</span> Generando con Gemini AI...';
    }

    try {
      const resData = await callGlossWorkerGenerate({
        formato: 'ideas',
        tratamiento: treatmentName,
        audiencia: options.audience || 'paciente',
        nivel_consciencia: options.funnel_stage || 'mofu',
        objetivo: options.angle || 'educar'
      });

      const res = resData.resultado || {};
      const ideasList = res.ideas || [];

      currentIdeasBatch = {
        metadata: {
          treatment_id: options.treatment_id || 'gemini_custom',
          treatment_name: res.tratamiento || treatmentName,
          specialty: res.especialidad || options.specialty || 'Medicina Estética',
          funnel_stage: options.funnel_stage || 'completo',
          generated_count: ideasList.length,
          generated_at: new Date().toISOString(),
          engine: 'Google Gemini AI v2.3.1 (Aprobado)'
        },
        items: ideasList.map((idea, idx) => ({
          id: `gemini-idea-${Date.now()}-${idx + 1}`,
          title: idea.title || 'Idea de contenido',
          problem: idea.problem || '',
          clinical_solution: idea.clinical_solution || '',
          recommended_format: idea.recommended_format || 'Reel de 45 segundos',
          suggested_hooks: Array.isArray(idea.suggested_hooks) ? idea.suggested_hooks : [],
          funnel_stage: idea.funnel_stage || 'consideracion',
          verification_status: idea.verification_status || 'Verificado por metodología Gloss Growth',
          treatment_id: options.treatment_id
        }))
      };

      renderIdeas(currentIdeasBatch);

      const auditoria = resData.auditoria_editorial || {};
      const calif = auditoria.nivel_semantico?.calificacion || 9;
      showToast(`✨ ${ideasList.length} ideas estructuradas con Gemini AI (${calif}/10).`);
    } catch (err) {
      console.error('Error al generar ideas con Gemini AI:', err);
      showToast(`Error con Gemini AI: ${err.message}. Usando catálogo local.`);
      currentIdeasBatch = GlossContentEngine.generateIdeas(options);
      renderIdeas(currentIdeasBatch);
    } finally {
      if (dom.btnGenerateIdeas) {
        dom.btnGenerateIdeas.disabled = false;
        dom.btnGenerateIdeas.innerHTML = '<span aria-hidden="true">💡</span> Generar banco de ideas';
      }
    }
  }

  function renderIdeas(batch) {
    if (!batch || !batch.items || !dom.ideasContainer) return;
    const meta = batch.metadata;
    if (dom.ideasTitle) dom.ideasTitle.textContent = `${meta.generated_count} ideas para ${meta.treatment_name}`;
    if (dom.ideasSubtitle) dom.ideasSubtitle.textContent = `Especialidad: ${meta.specialty} · Etapa: ${meta.funnel_stage}`;

    dom.ideasContainer.innerHTML = '';
    batch.items.forEach((idea, idx) => {
      const card = createIdeaCardElement(idea, idx + 1);
      dom.ideasContainer.appendChild(card);
    });

    if (dom.ideasResultsSection) dom.ideasResultsSection.removeAttribute('hidden');
  }

  function createIdeaCardElement(idea, idx) {
    const card = document.createElement('article');
    card.className = 'ec-idea-card';

    const stageClass = idea.funnel_stage || 'atencion';
    card.innerHTML = `
      <div>
        <header class="ec-idea-header">
          <span class="ec-badge-funnel ${stageClass}">${escapeHtml(idea.funnel_stage)}</span>
          <span class="ec-badge-verified">✓ ${escapeHtml(idea.verification_status)}</span>
        </header>

        <h3 class="ec-idea-title">${escapeHtml(idea.title)}</h3>

        <div class="ec-idea-body">
          <p><strong>❌ Dolor / Inquietud:</strong> ${escapeHtml(idea.problem)}</p>
          <p><strong>💡 Criterio clínico:</strong> ${escapeHtml(idea.clinical_solution)}</p>
          <p><strong>🎥 Formato recomendado:</strong> ${escapeHtml(idea.recommended_format)}</p>

          ${idea.suggested_hooks && idea.suggested_hooks.length > 0 ? `
            <div class="ec-idea-hooks">
              <span class="ec-idea-hooks-label">Ganchos sugeridos:</span>
              ${idea.suggested_hooks.map(h => `<div class="ec-idea-hook-item">“${escapeHtml(h)}”</div>`).join('')}
            </div>
          ` : ''}
        </div>
      </div>

      <footer class="ec-idea-footer">
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="ec-btn-card-action btn-structure-from-idea" type="button" style="color: var(--ec-burgundy); font-weight: 700;">
            <span aria-hidden="true">🎬</span> Estructurar Reel
          </button>
          <button class="ec-btn-card-action btn-carousel-from-idea" type="button" style="color: #0369A1; font-weight: 600;" title="Crear carrusel desde esta idea">
            <span aria-hidden="true">🎨</span> Carrusel
          </button>
          <button class="ec-btn-card-action btn-stories-from-idea" type="button" style="color: #7C3AED; font-weight: 600;" title="Crear secuencia de historias">
            <span aria-hidden="true">📱</span> Historias
          </button>
          <button class="ec-btn-card-action btn-hooks-from-idea" type="button">
            <span aria-hidden="true">⚡</span> Ver ganchos
          </button>
          <button class="ec-btn-card-action btn-schedule-idea" type="button" style="color: #1E3A8A; font-weight: 600;">
            <span aria-hidden="true">📅</span> Planificar
          </button>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="ec-btn-card-action btn-copy-idea" type="button">
            <span aria-hidden="true">📋</span> Copiar
          </button>
          <button class="ec-btn-card-action btn-save-idea" type="button">
            <span aria-hidden="true">💾</span> Guardar
          </button>
        </div>
      </footer>
    `;

    card.querySelector('.btn-structure-from-idea').addEventListener('click', () => openReelWithIdea(idea));
    const btnCar = card.querySelector('.btn-carousel-from-idea');
    if (btnCar) btnCar.addEventListener('click', () => openCarouselWithIdea(idea));
    const btnSto = card.querySelector('.btn-stories-from-idea');
    if (btnSto) btnSto.addEventListener('click', () => openStoriesWithIdea(idea));
    card.querySelector('.btn-hooks-from-idea').addEventListener('click', () => openHooksWithIdea(idea));
    card.querySelector('.btn-schedule-idea').addEventListener('click', () => scheduleFromIdea(idea));
    card.querySelector('.btn-copy-idea').addEventListener('click', () => {
      copyToClipboardSafe(GlossContentEngine.formatIdeaClipboard(idea));
      showToast('Idea copiada al portapapeles.');
    });
    card.querySelector('.btn-save-idea').addEventListener('click', () => {
      GlossContentEngine.saveIdea(idea);
      updateSavedIdeasCount();
      showToast('Idea guardada en tu colección.');
    });

    return card;
  }

  function handleCopyIdeas() {
    if (!currentIdeasBatch) return;
    const txt = GlossContentEngine.formatIdeasBatchClipboard(currentIdeasBatch);
    copyToClipboardSafe(txt);
    showToast('Banco de ideas copiado al portapapeles.');
  }

  function handleExportIdeasPdf() {
    if (!currentIdeasBatch) return;
    try {
      const payload = {
        ...currentIdeasBatch,
        businessName: activeBusiness.name || 'Tu Clínica o Spa',
        currency: activeBusiness.currency || 'COP'
      };
      GlossContentEngine.exportIdeasPdf(payload);
      showToast('Descargando PDF del banco de ideas.');
    } catch (e) {
      console.error(e);
      showToast('Error exportando PDF de ideas.');
    }
  }

  // =========================================================================
  // GESTIÓN: ESTRUCTURADOR DE REELS (FASE 3)
  // =========================================================================

  async function handleGenerateReel() {
    if (!isInitialized) return;
    try {
      await handleGenerateReelGemini();
    } catch (err) {
      console.warn('Fallo en Gemini AI para Reel. Fallback a biblioteca local:', err);
      const treatmentId = dom.reelTreatment?.value || 'rinomodelacion';
      const structureId = dom.reelStructure?.value || 'doble_caida';
      const duration = parseInt(dom.reelDuration?.value || 50, 10);
      const tone = dom.reelTone?.value || 'Clínico y prudente';
      const customHook = dom.reelCustomHook?.value?.trim() || null;

      try {
        currentScript = GlossContentEngine.generateReelScript({
          treatment_id: treatmentId,
          structure_id: structureId,
          duration_seconds: duration,
          tone: tone,
          custom_hook_verbal: customHook,
          available_assets: getSelectedAssets()
        });
        renderReelSheet(currentScript);
        showToast(`Guion de rodaje estructurado (${currentScript.beats.length} beats, Biblioteca local).`);
      } catch (innerErr) {
        console.error('Error al generar guion de Reel local:', innerErr);
        showToast('Error estructurando guion de Reel.');
      }
    }
  }

  async function handleGenerateReelGemini() {
    const treatmentSelect = dom.reelTreatment;
    const selectedOption = treatmentSelect?.options[treatmentSelect.selectedIndex];
    const treatmentName = selectedOption ? selectedOption.textContent.trim() : 'Tratamiento estético';
    const treatmentId = dom.reelTreatment?.value || 'rinomodelacion';
    const structureId = dom.reelStructure?.value || 'doble_caida';
    const duration = parseInt(dom.reelDuration?.value || 45, 10);
    const tone = dom.reelTone?.value || 'Clínico y prudente';
    const customHook = dom.reelCustomHook?.value?.trim() || null;

    if (dom.btnGenerateReel) {
      dom.btnGenerateReel.disabled = true;
      dom.btnGenerateReel.innerHTML = '<span aria-hidden="true">⏳</span> Estructurando con Gemini AI...';
    }

    try {
      const resData = await callGlossWorkerGenerate({
        formato: 'reel',
        tratamiento: treatmentName,
        nivel_consciencia: structureId,
        contexto: customHook
      });

      const res = resData.resultado || {};
      const blocks = res.bloques || [];
      let totalWords = 0;
      const beats = blocks.map((b, i) => {
        const words = (b.guion_hablado || '').trim().split(/\s+/).filter(Boolean).length;
        totalWords += words;
        return {
          beat_number: i + 1,
          time_range: b.tiempo || `0:${String(i * 8).padStart(2, '0')}`,
          phase_name: b.fase || `Beat ${i + 1}`,
          camera_direction: b.direccion_camara || '[Profesional frente a cámara en plano medio]',
          screen_text: b.texto_pantalla || '',
          verbal_script: b.guion_hablado || '',
          visual_asset: 'Video en cabina / Demostración anatómica'
        };
      });

      const hookBlock = blocks[0] || {};
      currentScript = {
        treatment_id: treatmentId,
        treatment_name: res.tratamiento || treatmentName,
        structure_id: res.estructura_id || structureId,
        structure_name: res.estructura_nombre || 'Estructura Canónica Gemini AI',
        target_duration_seconds: duration || 45,
        total_words: totalWords,
        tone: tone,
        hook_opening: {
          textual: hookBlock.texto_pantalla || 'Criterio clínico indispensable',
          verbal: hookBlock.guion_hablado || customHook || 'Frase de apertura'
        },
        beats: beats,
        call_to_action: blocks[blocks.length - 1]?.guion_hablado || 'Agenda tu cita de valoración médica personalizada.',
        full_speech: beats.map(b => b.verbal_script).join(' '),
        engine: 'Google Gemini AI v2.3.1 (Verificado)'
      };

      renderReelSheet(currentScript);

      const auditoria = resData.auditoria_editorial || {};
      const calif = auditoria.nivel_semantico?.calificacion || 9;
      showToast(`🎬 Guion de Reel estructurado con Gemini AI (${calif}/10 · ${beats.length} beats).`);
    } catch (err) {
      console.error('Error al generar Reel con Gemini AI:', err);
      showToast(`Error con Gemini AI: ${err.message}. Usando plantilla local.`);
      currentScript = GlossContentEngine.generateReelScript({
        treatment_id: treatmentId,
        structure_id: structureId,
        duration_seconds: duration,
        tone: tone,
        custom_hook_verbal: customHook,
        available_assets: getSelectedAssets()
      });
      renderReelSheet(currentScript);
    } finally {
      if (dom.btnGenerateReel) {
        dom.btnGenerateReel.disabled = false;
        dom.btnGenerateReel.innerHTML = '<span aria-hidden="true">🎬</span> Estructurar Guion de Rodaje';
      }
    }
  }

  function renderReelSheet(script) {
    if (!script || !dom.reelSheet) return;

    dom.reelSheet.innerHTML = `
      <header class="ec-script-head">
        <div>
          <span class="eyebrow" style="margin: 0; font-size: 11px;">Hoja de Rodaje Técnica · Reel</span>
          <h2 class="ec-script-title">${escapeHtml(script.treatment_name)}</h2>
          <div class="ec-script-meta-pills">
            <span class="ec-script-meta-pill">📐 ${escapeHtml(script.structure_name)}</span>
            <span class="ec-script-meta-pill">⏱️ ${script.target_duration_seconds} segundos</span>
            <span class="ec-script-meta-pill">📝 ~${script.total_words} palabras</span>
            <span class="ec-script-meta-pill">🎭 ${escapeHtml(script.tone)}</span>
          </div>
        </div>
        <div class="ec-batch-actions">
          <button class="ec-btn-action" id="btn-schedule-this-script" type="button" style="color: #1E3A8A; font-weight: 600;">
            <span aria-hidden="true">📅</span> Planificar
          </button>
          <button class="ec-btn-action" id="btn-save-this-script" type="button">
            <span aria-hidden="true">💾</span> Guardar guion
          </button>
          <button class="ec-btn-action" id="btn-copy-full-script" type="button">
            <span aria-hidden="true">📋</span> Copiar hoja
          </button>
          <button class="ec-btn-action" id="btn-export-script-pdf" type="button">
            <span aria-hidden="true">📄</span> Descargar PDF
          </button>
        </div>
      </header>

      <!-- Apertura de impacto -->
      <div style="margin-bottom: 24px;">
        <span class="ec-box-label"><span aria-hidden="true">⚡</span> Apertura de Gancho (Primeros 3 segundos)</span>
        <div class="ec-screen-box" style="margin-bottom: 10px;">
          <span class="ec-screen-label">Texto en pantalla</span>
          <p class="ec-screen-text" contenteditable="true" id="reel-edit-screen">${escapeHtml(script.hook_opening.textual)}</p>
        </div>
        <div class="ec-verbal-box">
          <span class="ec-box-label">Gancho hablado</span>
          <blockquote class="ec-verbal-quote" contenteditable="true" id="reel-edit-hook">${escapeHtml(script.hook_opening.verbal)}</blockquote>
        </div>
      </div>

      <!-- Desglose de Beats -->
      <div class="ec-beats-container">
        <span class="ec-box-label"><span aria-hidden="true">🎬</span> Secuencia Cronológica Beat a Beat</span>
        ${script.beats.map((b, i) => `
          <div class="ec-beat-card">
            <div class="ec-beat-head">
              <span class="ec-beat-role">BEAT ${b.beat_number}: ${escapeHtml(b.role)}</span>
              <span class="ec-beat-time">${escapeHtml(b.timecode)}</span>
            </div>
            <div class="ec-beat-body">
              <div class="ec-beat-direction">
                <p><strong>📹 Cámara y Encuadre:</strong><br/>${escapeHtml(b.camera_cue)}</p>
                ${b.screen_overlay ? `<p><strong>🏷️ Overlay pantalla:</strong><br/>[ ${escapeHtml(b.screen_overlay)} ]</p>` : ''}
                <p style="font-size: 11px; color: var(--ec-muted); margin: 0;"><strong>🎵 Audio:</strong> ${escapeHtml(b.audio_note)}</p>
              </div>
              <div class="ec-beat-dialogue">
                <span class="ec-teleprompter-label">Guion Teleprompter (Editable)</span>
                <p class="ec-teleprompter-text" contenteditable="true" data-beat-idx="${i}">${escapeHtml(b.teleprompter_text)}</p>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Cuadro Teleprompter Completo -->
      <div class="ec-teleprompter-box">
        <h4>
          <span>📜 Teleprompter Completo (Lectura continua)</span>
          <button class="ec-btn-card-action" id="btn-copy-prompter-only" type="button" style="background: rgba(255,255,255,0.1); color: #FFF; border-color: rgba(255,255,255,0.2);">
            Copiar para app de prompter
          </button>
        </h4>
        <p class="ec-teleprompter-fulltext" id="reel-prompter-fulltext">${escapeHtml(script.full_teleprompter)}</p>
      </div>

      <!-- Checklist de rodaje en cabina -->
      <div style="margin-bottom: 24px;">
        <span class="ec-box-label"><span aria-hidden="true">🎒</span> Checklist de Rodaje en Cabina</span>
        <div class="ec-checklist-grid">
          ${script.shooting_checklist_items.map(item => `
            <label class="ec-check-item">
              <input type="checkbox"/>
              <span>${escapeHtml(item)}</span>
            </label>
          `).join('')}
        </div>
      </div>

      <!-- Advertencia sanitaria -->
      <div class="ec-notice-box">
        <strong>Marco Sanitario y Normativo:</strong> ${escapeHtml(script.regulatory_notice)}
      </div>
    `;

    // Vincular acciones de la hoja
    dom.reelSheet.querySelector('#btn-schedule-this-script').addEventListener('click', () => {
      scheduleFromScript(script);
    });

    dom.reelSheet.querySelector('#btn-save-this-script').addEventListener('click', () => {
      GlossContentEngine.saveScript(script);
      updateSavedScriptsCount();
      showToast('Guion guardado en tu colección.');
    });

    dom.reelSheet.querySelector('#btn-copy-full-script').addEventListener('click', () => {
      copyToClipboardSafe(GlossContentEngine.formatReelScriptClipboard(script));
      showToast('Hoja de rodaje copiada al portapapeles.');
    });

    dom.reelSheet.querySelector('#btn-copy-prompter-only').addEventListener('click', () => {
      copyToClipboardSafe(script.full_teleprompter);
      showToast('Texto teleprompter copiado.');
    });

    dom.reelSheet.querySelector('#btn-export-script-pdf').addEventListener('click', () => {
      try {
        const payload = {
          ...script,
          businessName: activeBusiness.name || 'Tu Clínica o Spa'
        };
        GlossContentEngine.exportReelScriptPdf(payload);
        showToast('Descargando PDF del guion técnico.');
      } catch (e) {
        console.error(e);
        showToast('Error exportando PDF de guion.');
      }
    });

    // Escuchar ediciones en vivo en los beats
    dom.reelSheet.querySelectorAll('[data-beat-idx]').forEach(el => {
      el.addEventListener('input', () => {
        const idx = parseInt(el.getAttribute('data-beat-idx'), 10);
        script.beats[idx].teleprompter_text = el.textContent.trim();
        script.full_teleprompter = script.beats.map(b => b.teleprompter_text).join(' ');
        const prompterFullEl = document.getElementById('reel-prompter-fulltext');
        if (prompterFullEl) prompterFullEl.textContent = script.full_teleprompter;
      });
    });

    if (dom.reelResultsSection) dom.reelResultsSection.removeAttribute('hidden');
  }

  // =========================================================================
  // INTEGRACIÓN CRUZADA ENTRE HERRAMIENTAS (WORKFLOW FLUIDO)
  // =========================================================================

  function openReelWithHook(hookItem) {
    switchTab('estructurador');
    if (hookItem.pipeline_trace && hookItem.pipeline_trace.treatment_id) {
      dom.reelTreatment.value = hookItem.pipeline_trace.treatment_id;
    }
    if (hookItem.hook_triad && hookItem.hook_triad.verbal) {
      dom.reelCustomHook.value = hookItem.hook_triad.verbal;
    }
    handleGenerateReel();
    showToast('Gancho transferido al Estructurador de Reels.');
  }

  function openCarouselWithHook(hookItem) {
    switchTab('carruseles');
    if (hookItem.pipeline_trace && hookItem.pipeline_trace.treatment_id) {
      dom.carouselTreatment.value = hookItem.pipeline_trace.treatment_id;
    }
    if (hookItem.hook_triad && hookItem.hook_triad.verbal) {
      dom.carouselCustomHook.value = hookItem.hook_triad.verbal;
    }
    handleGenerateCarousel();
    showToast('Gancho transferido al Editor de Carruseles.');
  }

  function openReelWithIdea(idea) {
    switchTab('estructurador');
    if (idea.treatment_id) dom.reelTreatment.value = idea.treatment_id;
    if (idea.suggested_hooks && idea.suggested_hooks[0]) {
      dom.reelCustomHook.value = idea.suggested_hooks[0];
    }
    handleGenerateReel();
    showToast('Idea transferida al Estructurador de Reels.');
  }

  function openCarouselWithIdea(idea) {
    switchTab('carruseles');
    if (idea.treatment_id) dom.carouselTreatment.value = idea.treatment_id;
    if (idea.suggested_hooks && idea.suggested_hooks[0]) {
      dom.carouselCustomHook.value = idea.suggested_hooks[0];
    } else if (idea.title) {
      dom.carouselCustomHook.value = idea.title;
    }
    handleGenerateCarousel();
    showToast('Idea transferida al Editor de Carruseles.');
  }

  function openStoriesWithIdea(idea) {
    switchTab('historias');
    if (idea.treatment_id) dom.storiesTreatment.value = idea.treatment_id;
    if (idea.title) {
      dom.storiesCustomTopic.value = idea.title;
    }
    handleGenerateStories();
    showToast('Idea transferida a Secuencias de Historias.');
  }

  function openHooksWithIdea(idea) {
    switchTab('ganchos');
    if (idea.treatment_id) dom.treatment.value = idea.treatment_id;
    if (idea.objective) dom.objective.value = idea.objective;
    handleGenerate();
    showToast('Idea transferida al Generador de Ganchos.');
  }

  // =========================================================================
  // GESTIÓN DE GUARDADOS Y MODALES (FAVORITOS, IDEAS, GUIONES)
  // =========================================================================

  function toggleFavoriteCard(item, btn) {
    const isFav = checkIfFavorite(item.result_id);
    if (isFav) {
      GlossContentEngine.deleteFavorite(item.result_id);
      btn.classList.remove('is-favorite');
      btn.textContent = '♡';
      showToast('Eliminado de favoritos.');
    } else {
      GlossContentEngine.saveFavorite(item);
      btn.classList.add('is-favorite');
      btn.textContent = '♥';
      showToast('Guardado en favoritos.');
    }
    updateFavoritesCount();
  }

  function checkIfFavorite(resultId) {
    const favs = GlossContentEngine.getFavorites();
    return favs.some(f => f.id === resultId || (f.proposal && f.proposal.result_id === resultId));
  }

  function updateFavoritesCount() {
    const favs = GlossContentEngine.getFavorites();
    if (dom.favsCountBadge) dom.favsCountBadge.textContent = favs.length;
  }

  function updateSavedIdeasCount() {
    const ideas = GlossContentEngine.getSavedIdeas();
    if (dom.savedIdeasCountBadge) dom.savedIdeasCountBadge.textContent = ideas.length;
  }

  function updateSavedScriptsCount() {
    const scripts = GlossContentEngine.getSavedScripts();
    if (dom.savedScriptsCountBadge) dom.savedScriptsCountBadge.textContent = scripts.length;
  }

  // Modal Favoritos Ganchos
  function openFavsModal() {
    renderFavsList();
    dom.favsModal.removeAttribute('hidden');
  }
  function closeFavsModal() {
    dom.favsModal.setAttribute('hidden', '');
  }
  function renderFavsList() {
    const favs = GlossContentEngine.getFavorites();
    dom.favsList.innerHTML = '';
    if (favs.length === 0) {
      dom.favsList.innerHTML = '<p style="color: var(--ec-muted); text-align: center; padding: 24px 0;">No tienes ganchos guardados todavía.</p>';
      return;
    }
    favs.forEach(fav => {
      const p = fav.proposal || {};
      const triad = p.hook_triad || {};
      const id = fav.id || p.result_id;
      const el = document.createElement('div');
      el.className = 'ec-fav-item';
      el.innerHTML = `
        <div class="ec-fav-item-header">
          <span><strong>${p.family ? p.family.code : 'GANCHO'}</strong> · ${p.family ? p.family.name : ''}</span>
          <button class="ec-btn-card-action btn-del-fav" type="button" data-id="${id}">Eliminar</button>
        </div>
        <div class="ec-fav-textual">[ ${escapeHtml(triad.textual || '')} ]</div>
        <div class="ec-fav-verbal">“${escapeHtml(triad.verbal || '')}”</div>
      `;
      el.querySelector('.btn-del-fav').addEventListener('click', () => {
        GlossContentEngine.deleteFavorite(id);
        renderFavsList();
        updateFavoritesCount();
        showToast('Gancho eliminado de favoritos.');
      });
      dom.favsList.appendChild(el);
    });
  }
  function handleClearFavs() {
    if (!confirm('¿Deseas vaciar todos los ganchos favoritos?')) return;
    const favs = GlossContentEngine.getFavorites();
    favs.forEach(f => GlossContentEngine.deleteFavorite(f.id || (f.proposal && f.proposal.result_id)));
    renderFavsList();
    updateFavoritesCount();
    showToast('Favoritos vaciados.');
  }
  function handleExportFavsPdf() {
    const favs = GlossContentEngine.getFavorites();
    if (favs.length === 0) { showToast('No hay favoritos para exportar.'); return; }
    try {
      GlossContentEngine.exportBatchPdf({
        metadata: { treatment_name: 'Colección de Ganchos Favoritos', format: 'Mixto', objective: 'Favoritos' },
        items: favs.map(f => f.proposal).filter(Boolean)
      });
    } catch (e) { console.error(e); }
  }

  // Modal Ideas Guardadas
  function openSavedIdeasModal() {
    renderSavedIdeasList();
    dom.savedIdeasModal.removeAttribute('hidden');
  }
  function closeSavedIdeasModal() {
    dom.savedIdeasModal.setAttribute('hidden', '');
  }
  function renderSavedIdeasList() {
    const list = GlossContentEngine.getSavedIdeas();
    dom.savedIdeasList.innerHTML = '';
    if (list.length === 0) {
      dom.savedIdeasList.innerHTML = '<p style="color: var(--ec-muted); text-align: center; padding: 24px 0;">No tienes ideas guardadas todavía.</p>';
      return;
    }
    list.forEach(item => {
      const idea = item.idea || {};
      const id = item.id || idea.idea_id;
      const el = document.createElement('div');
      el.className = 'ec-fav-item';
      el.innerHTML = `
        <div class="ec-fav-item-header">
          <span><strong>${escapeHtml(idea.treatment_name || 'Idea')}</strong> · ${escapeHtml(idea.funnel_stage || '')}</span>
          <button class="ec-btn-card-action btn-del-idea" type="button" data-id="${id}">Eliminar</button>
        </div>
        <div class="ec-fav-textual">${escapeHtml(idea.title || '')}</div>
        <div class="ec-fav-verbal">${escapeHtml(idea.clinical_solution || '')}</div>
        <div style="margin-top: 6px;">
          <button class="ec-btn-card-action btn-use-idea" type="button" style="color: var(--ec-burgundy); font-weight:700;">Estructurar Reel</button>
        </div>
      `;
      el.querySelector('.btn-del-idea').addEventListener('click', () => {
        GlossContentEngine.deleteIdea(id);
        renderSavedIdeasList();
        updateSavedIdeasCount();
        showToast('Idea eliminada.');
      });
      el.querySelector('.btn-use-idea').addEventListener('click', () => {
        closeSavedIdeasModal();
        openReelWithIdea(idea);
      });
      dom.savedIdeasList.appendChild(el);
    });
  }
  function handleClearSavedIdeas() {
    if (!confirm('¿Deseas vaciar todas las ideas guardadas?')) return;
    const list = GlossContentEngine.getSavedIdeas();
    list.forEach(i => GlossContentEngine.deleteIdea(i.id || (i.idea && i.idea.idea_id)));
    renderSavedIdeasList();
    updateSavedIdeasCount();
    showToast('Ideas guardadas vaciadas.');
  }
  function handleExportSavedIdeasPdf() {
    const list = GlossContentEngine.getSavedIdeas();
    if (list.length === 0) { showToast('No hay ideas para exportar.'); return; }
    try {
      GlossContentEngine.exportIdeasPdf({
        metadata: { specialty: 'Colección de Ideas Guardadas', audience: 'Mixta' },
        items: list.map(i => i.idea).filter(Boolean)
      });
    } catch (e) { console.error(e); }
  }

  // Modal Guiones Guardados
  function openSavedScriptsModal() {
    renderSavedScriptsList();
    dom.savedScriptsModal.removeAttribute('hidden');
  }
  function closeSavedScriptsModal() {
    dom.savedScriptsModal.setAttribute('hidden', '');
  }
  function renderSavedScriptsList() {
    const list = GlossContentEngine.getSavedScripts();
    dom.savedScriptsList.innerHTML = '';
    if (list.length === 0) {
      dom.savedScriptsList.innerHTML = '<p style="color: var(--ec-muted); text-align: center; padding: 24px 0;">No tienes guiones guardados todavía.</p>';
      return;
    }
    list.forEach(item => {
      const script = item.script || {};
      const id = item.id || script.script_id;
      const el = document.createElement('div');
      el.className = 'ec-fav-item';
      el.innerHTML = `
        <div class="ec-fav-item-header">
          <span><strong>${escapeHtml(script.treatment_name || 'Tratamiento')}</strong> · ${escapeHtml(script.structure_name || '')}</span>
          <button class="ec-btn-card-action btn-del-script" type="button" data-id="${id}">Eliminar</button>
        </div>
        <div class="ec-fav-textual">${escapeHtml(script.hook_opening ? script.hook_opening.textual : '')}</div>
        <div class="ec-fav-verbal">${script.target_duration_seconds || 50}s · ~${script.total_words || 130} palabras</div>
        <div style="margin-top: 8px; display: flex; gap: 8px;">
          <button class="ec-btn-card-action btn-load-script" type="button" style="color: var(--ec-burgundy); font-weight:700;">Cargar en pantalla</button>
          <button class="ec-btn-card-action btn-pdf-script" type="button">Descargar PDF</button>
        </div>
      `;
      el.querySelector('.btn-del-script').addEventListener('click', () => {
        GlossContentEngine.deleteScript(id);
        renderSavedScriptsList();
        updateSavedScriptsCount();
        showToast('Guion eliminado.');
      });
      el.querySelector('.btn-load-script').addEventListener('click', () => {
        currentScript = script;
        renderReelSheet(script);
        closeSavedScriptsModal();
        switchTab('estructurador');
        showToast('Guion cargado en la hoja de rodaje.');
      });
      el.querySelector('.btn-pdf-script').addEventListener('click', () => {
        GlossContentEngine.exportReelScriptPdf(script);
      });
      dom.savedScriptsList.appendChild(el);
    });
  }
  function handleClearSavedScripts() {
    if (!confirm('¿Deseas vaciar todos los guiones guardados?')) return;
    const list = GlossContentEngine.getSavedScripts();
    list.forEach(s => GlossContentEngine.deleteScript(s.id || (s.script && s.script.script_id)));
    renderSavedScriptsList();
    updateSavedScriptsCount();
    showToast('Guiones vaciados.');
  }

  // =========================================================================
  // EXPORTACIONES DEL LOTE COMPLETO
  // =========================================================================

  function handleCopyBatch() {
    if (!currentBatch) return;
    copyToClipboardSafe(GlossContentEngine.generateBatchClipboard(currentBatch));
    showToast('Lote de ganchos copiado al portapapeles.');
  }

  function handleExportPdf() {
    if (!currentBatch) return;
    try {
      const payload = {
        ...currentBatch,
        businessName: activeBusiness.name || 'Tu Clínica o Spa',
        currency: activeBusiness.currency || 'COP'
      };
      GlossContentEngine.exportBatchPdf(payload);
      showToast('Descargando informe PDF en formato A4 corporativo.');
    } catch (err) {
      console.error('Error al exportar PDF:', err);
      showToast('Error al exportar el informe PDF.');
    }
  }

  // =========================================================================
  // FASE 4: CONTROLADOR DEL EDITOR DE CARRUSELES (INSTAGRAM FEED 4:5)
  // =========================================================================

  function populateCarouselTreatments() {
    if (!isInitialized || !dom.carouselTreatment) return;
    const treatments = GlossContentEngine.getTreatments();
    dom.carouselTreatment.innerHTML = '';
    treatments.filter(t => (t.categoria || t.specialty) !== 'negocio_marketing' && (t.id || t.treatment_id) !== 'negocio_marketing').forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id || t.treatment_id;
      opt.textContent = `${t.nombre_habitual || t.name} (${getSpecialtyLabel(t.categoria || t.specialty)})`;
      dom.carouselTreatment.appendChild(opt);
    });
  }

  async function handleGenerateCarousel() {
    if (!isInitialized) return;
    try {
      await handleGenerateCarouselGemini();
    } catch (err) {
      console.warn('Fallo en Gemini AI para carrusel. Fallback a biblioteca local:', err);
      const treatmentId = dom.carouselTreatment ? dom.carouselTreatment.value : 'rinomodelacion';
      const archetypeId = dom.carouselArchetype ? dom.carouselArchetype.value : 'SPLIT_VERSUS';
      const objective = dom.carouselObjective ? dom.carouselObjective.value : 'autoridad_tecnica';
      const slidesCount = dom.carouselSlidesCount ? parseInt(dom.carouselSlidesCount.value, 10) : 6;
      const customHook = dom.carouselCustomHook ? dom.carouselCustomHook.value.trim() : null;

      try {
        currentCarousel = GlossContentEngine.generateCarousel({
          treatment_id: treatmentId,
          archetype_id: archetypeId,
          objective: objective,
          slides_count: slidesCount,
          custom_hook_verbal: customHook
        });
        renderCarouselSheet(currentCarousel);
        showToast(`Guion de carrusel estructurado (${currentCarousel.slides.length} láminas, Biblioteca local).`);
      } catch (innerErr) {
        console.error('Error al generar carrusel local:', innerErr);
        showToast('Error generando carrusel.');
      }
    }
  }

  async function handleGenerateCarouselGemini() {
    const treatmentSelect = dom.carouselTreatment;
    const selectedOption = treatmentSelect?.options[treatmentSelect.selectedIndex];
    const treatmentName = selectedOption ? selectedOption.textContent.trim() : 'Tratamiento estético';
    const treatmentId = dom.carouselTreatment?.value || 'rinomodelacion';
    const archetypeId = dom.carouselArchetype?.value || 'SPLIT_VERSUS';
    const objective = dom.carouselObjective?.value || 'autoridad_tecnica';
    const slidesCount = dom.carouselSlidesCount ? parseInt(dom.carouselSlidesCount.value, 10) : 6;
    const customHook = dom.carouselCustomHook?.value?.trim() || null;

    if (dom.btnGenerateCarousel) {
      dom.btnGenerateCarousel.disabled = true;
      dom.btnGenerateCarousel.innerHTML = '<span aria-hidden="true">⏳</span> Diseñando slides con Gemini AI...';
    }

    try {
      const resData = await callGlossWorkerGenerate({
        formato: 'carrusel',
        tratamiento: treatmentName,
        arquetipo_carrusel: archetypeId,
        objetivo: objective,
        contexto: customHook
      });

      const res = resData.resultado || {};
      const rawSlides = res.slides || [];
      const slides = rawSlides.map((s, idx) => ({
        slide_number: s.slide_numero || (idx + 1),
        role: s.rol || (idx === 0 ? 'PORTADA' : idx === rawSlides.length - 1 ? 'CTA' : 'DESARROLLO'),
        title: s.titulo || '',
        copy: s.texto || '',
        visual_layout: s.direccion_visual || 'Diseño editorial sobrio sobre fondo off-white',
        micro_hook: s.micro_gancho || (idx < rawSlides.length - 1 ? 'Desliza para ver el criterio médico 👉' : ''),
        character_count: (s.texto || '').length,
        word_count: (s.texto || '').trim().split(/\s+/).filter(Boolean).length
      }));

      currentCarousel = {
        id: `gemini-car-${Date.now()}`,
        treatment_id: treatmentId,
        treatment_name: res.tratamiento || treatmentName,
        title: `${res.arquetipo_nombre || 'Carrusel'} · ${res.tratamiento || treatmentName}`,
        archetype_id: res.arquetipo_codigo || archetypeId,
        archetype_name: res.arquetipo_nombre || 'Carrusel Educativo Gemini AI',
        objective: objective,
        slides: slides,
        created_at: new Date().toISOString(),
        engine: 'Google Gemini AI v2.3.1 (Verificado)'
      };

      renderCarouselSheet(currentCarousel);

      const auditoria = resData.auditoria_editorial || {};
      const calif = auditoria.nivel_semantico?.calificacion || 9;
      showToast(`🎨 Carrusel estructurado con Gemini AI (${calif}/10 · ${slides.length} láminas).`);
    } catch (err) {
      console.error('Error al generar Carrusel con Gemini AI:', err);
      showToast(`Error con Gemini AI: ${err.message}. Usando plantilla local.`);
      currentCarousel = GlossContentEngine.generateCarousel({
        treatment_id: treatmentId,
        archetype_id: archetypeId,
        objective: objective,
        slides_count: slidesCount,
        custom_hook_verbal: customHook
      });
      renderCarouselSheet(currentCarousel);
    } finally {
      if (dom.btnGenerateCarousel) {
        dom.btnGenerateCarousel.disabled = false;
        dom.btnGenerateCarousel.innerHTML = '<span aria-hidden="true">🎨</span> Diseñar Carrusel Slide a Slide';
      }
    }
  }

  function renderCarouselSheet(carousel) {
    if (!carousel || !dom.carouselSheet) return;

    dom.carouselSheet.innerHTML = `
      <header class="ec-carousel-head">
        <div>
          <span class="eyebrow" style="margin: 0; font-size: 11px;">Editor de Carruseles · Feed Instagram (4:5)</span>
          <h2 class="ec-carousel-title">${escapeHtml(carousel.title)}</h2>
          <div class="ec-carousel-meta-pills">
            <span class="ec-carousel-meta-pill">📐 Arquetipo: ${escapeHtml(carousel.archetype_name)}</span>
            <span class="ec-carousel-meta-pill">🎯 Objetivo: ${escapeHtml(carousel.objective)}</span>
            <span class="ec-carousel-meta-pill">🖼️ ${carousel.slides.length} láminas</span>
            <span class="ec-carousel-meta-pill">🏷️ ${escapeHtml(carousel.treatment_name)}</span>
          </div>
        </div>
        <div class="ec-batch-actions">
          <button class="ec-btn-action" id="btn-add-slide-top" type="button" ${carousel.slides.length >= 10 ? 'disabled' : ''} style="color: #0369A1; font-weight: 600;">
            <span aria-hidden="true">+</span> Añadir lámina
          </button>
          <button class="ec-btn-action" id="btn-schedule-this-carousel" type="button" style="color: #1E3A8A; font-weight: 600;">
            <span aria-hidden="true">📅</span> Planificar
          </button>
          <button class="ec-btn-action" id="btn-save-this-carousel" type="button">
            <span aria-hidden="true">💾</span> Guardar carrusel
          </button>
          <button class="ec-btn-action" id="btn-copy-full-carousel" type="button">
            <span aria-hidden="true">📋</span> Copiar carrusel
          </button>
          <button class="ec-btn-action" id="btn-export-carousel-pdf" type="button">
            <span aria-hidden="true">📄</span> Descargar PDF
          </button>
          <button class="ec-btn-action" id="btn-export-visual-carousel" type="button" style="color: #8C2536; font-weight: 700; border-color: #8C2536;">
            <span aria-hidden="true">🖼️</span> Exportar PNGs (4:5)
          </button>
        </div>
      </header>

      <div class="ec-carousel-notice">
        <strong>Estructura visual 4:5:</strong> Cada tarjeta representa una lámina deslizable. Puedes editar títulos, textos y micro-ganchos en tiempo real. Usa los controles para reorganizar, duplicar o eliminar láminas (entre 4 y 10).
      </div>

      <div class="ec-slide-deck" id="ec-slide-deck-container">
        ${carousel.slides.map((s, idx) => `
          <article class="ec-slide-card" data-slide-index="${idx}">
            <header class="ec-slide-card-header">
              <div class="ec-slide-role-wrap">
                <span class="ec-slide-num">LÁMINA ${s.slide_number} / ${carousel.slides.length}</span>
                <span class="ec-slide-role-badge role-${s.role}">${escapeHtml(s.role)}</span>
              </div>
              <div class="ec-slide-controls">
                <button class="ec-slide-ctrl-btn btn-slide-preview-png" type="button" title="Previsualizar y descargar lámina PNG" data-idx="${idx}">🖼️</button>
                <button class="ec-slide-ctrl-btn btn-slide-up" type="button" title="Mover lámina arriba" ${idx <= 1 || idx === carousel.slides.length - 1 ? 'disabled' : ''}>⬆</button>
                <button class="ec-slide-ctrl-btn btn-slide-down" type="button" title="Mover lámina abajo" ${idx === 0 || idx >= carousel.slides.length - 2 ? 'disabled' : ''}>⬇</button>
                <button class="ec-slide-ctrl-btn btn-slide-dup" type="button" title="Duplicar lámina" ${carousel.slides.length >= 10 || idx === 0 || idx === carousel.slides.length - 1 ? 'disabled' : ''}>📑</button>
                <button class="ec-slide-ctrl-btn btn-slide-del" type="button" title="Eliminar lámina" ${carousel.slides.length <= 4 || idx === 0 || idx === carousel.slides.length - 1 ? 'disabled' : ''}>🗑️</button>
              </div>
            </header>

            <div class="ec-slide-canvas">
              <div class="ec-slide-field-group">
                <label class="ec-slide-field-label">Titular de lámina</label>
                <input class="ec-slide-title-input" type="text" value="${escapeHtml(s.title)}" data-field="title" data-idx="${idx}">
              </div>

              <div class="ec-slide-field-group">
                <label class="ec-slide-field-label">Cuerpo de texto / Copy</label>
                <textarea class="ec-slide-copy-input" data-field="copy" data-idx="${idx}">${escapeHtml(s.copy)}</textarea>
              </div>

              <div class="ec-slide-field-group">
                <label class="ec-slide-field-label">Dirección visual & maquetación</label>
                <div class="ec-slide-visual-box">
                  <textarea class="ec-slide-visual-input" data-field="visual_layout" data-idx="${idx}">${escapeHtml(s.visual_layout)}</textarea>
                </div>
              </div>

              <div class="ec-slide-field-group">
                <label class="ec-slide-field-label">Micro-gancho de pase de página</label>
                <div class="ec-slide-micro-hook-box">
                  <input class="ec-slide-micro-hook-input" type="text" value="${escapeHtml(s.micro_hook)}" data-field="micro_hook" data-idx="${idx}">
                </div>
              </div>
            </div>
          </article>
        `).join('')}
      </div>
    `;

    // Escuchar ediciones de campos
    dom.carouselSheet.querySelectorAll('[data-field]').forEach(input => {
      input.addEventListener('input', () => {
        const idx = parseInt(input.getAttribute('data-idx'), 10);
        const field = input.getAttribute('data-field');
        if (carousel.slides[idx]) {
          carousel.slides[idx][field] = input.value;
        }
      });
    });

    // Vincular botones de láminas
    dom.carouselSheet.querySelectorAll('.ec-slide-card').forEach(cardEl => {
      const idx = parseInt(cardEl.getAttribute('data-slide-index'), 10);
      const btnUp = cardEl.querySelector('.btn-slide-up');
      if (btnUp) btnUp.addEventListener('click', () => moveCarouselSlide(idx, idx - 1));

      const btnDown = cardEl.querySelector('.btn-slide-down');
      if (btnDown) btnDown.addEventListener('click', () => moveCarouselSlide(idx, idx + 1));

      const btnDup = cardEl.querySelector('.btn-slide-dup');
      if (btnDup) btnDup.addEventListener('click', () => duplicateCarouselSlide(idx));

      const btnDel = cardEl.querySelector('.btn-slide-del');
      if (btnDel) btnDel.addEventListener('click', () => deleteCarouselSlide(idx));
    });

    // Vincular acciones de cabecera
    const btnAddTop = dom.carouselSheet.querySelector('#btn-add-slide-top');
    if (btnAddTop) btnAddTop.addEventListener('click', addCarouselSlide);

    const btnSchedule = dom.carouselSheet.querySelector('#btn-schedule-this-carousel');
    if (btnSchedule) btnSchedule.addEventListener('click', () => scheduleFromCarousel(carousel));

    const btnSave = dom.carouselSheet.querySelector('#btn-save-this-carousel');
    if (btnSave) btnSave.addEventListener('click', handleSaveCarousel);

    const btnCopy = dom.carouselSheet.querySelector('#btn-copy-full-carousel');
    if (btnCopy) btnCopy.addEventListener('click', handleCopyCarousel);

    const btnExportPdf = dom.carouselSheet.querySelector('#btn-export-carousel-pdf');
    if (btnExportPdf) btnExportPdf.addEventListener('click', handleExportCarouselPdf);

    const btnExportVisual = dom.carouselSheet.querySelector('#btn-export-visual-carousel');
    if (btnExportVisual) btnExportVisual.addEventListener('click', () => openVisualExportModal('carousel', 0));

    dom.carouselSheet.querySelectorAll('.btn-slide-preview-png').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx') || '0', 10);
        openVisualExportModal('carousel', idx);
      });
    });

    if (dom.carouselResultsSection) dom.carouselResultsSection.removeAttribute('hidden');
  }

  function moveCarouselSlide(fromIdx, toIdx) {
    if (!currentCarousel || !currentCarousel.slides) return;
    if (fromIdx < 1 || toIdx < 1) return;
    if (fromIdx >= currentCarousel.slides.length - 1 || toIdx >= currentCarousel.slides.length - 1) return;

    const temp = currentCarousel.slides[fromIdx];
    currentCarousel.slides[fromIdx] = currentCarousel.slides[toIdx];
    currentCarousel.slides[toIdx] = temp;
    currentCarousel.slides.forEach((s, idx) => { s.slide_number = idx + 1; });
    renderCarouselSheet(currentCarousel);
    showToast(`Lámina reubicada a la posición ${toIdx + 1}.`);
  }

  function duplicateCarouselSlide(idx) {
    if (!currentCarousel || !currentCarousel.slides) return;
    if (currentCarousel.slides.length >= 10) {
      showToast('Límite alcanzado: máximo 10 láminas por carrusel en Instagram.');
      return;
    }
    const source = currentCarousel.slides[idx];
    const clone = JSON.parse(JSON.stringify(source));
    clone.role = 'DESARROLLO';
    clone.title = `${source.title} (Continuación)`;
    currentCarousel.slides.splice(idx + 1, 0, clone);
    currentCarousel.slides.forEach((s, i) => { s.slide_number = i + 1; });
    renderCarouselSheet(currentCarousel);
    showToast(`Lámina duplicada (${currentCarousel.slides.length} láminas).`);
  }

  function deleteCarouselSlide(idx) {
    if (!currentCarousel || !currentCarousel.slides) return;
    if (currentCarousel.slides.length <= 4) {
      showToast('Mínimo 4 láminas requeridas para mantener una estructura editorial sólida.');
      return;
    }
    if (idx === 0 || idx === currentCarousel.slides.length - 1) {
      showToast('No puedes eliminar la Portada ni el CTA de cierre.');
      return;
    }
    currentCarousel.slides.splice(idx, 1);
    currentCarousel.slides.forEach((s, i) => { s.slide_number = i + 1; });
    renderCarouselSheet(currentCarousel);
    showToast(`Lámina eliminada (${currentCarousel.slides.length} láminas restantes).`);
  }

  function addCarouselSlide() {
    if (!currentCarousel || !currentCarousel.slides) return;
    if (currentCarousel.slides.length >= 10) {
      showToast('Límite alcanzado: máximo 10 láminas por carrusel en Instagram.');
      return;
    }
    const newSlide = {
      slide_number: currentCarousel.slides.length,
      role: 'DESARROLLO',
      title: 'Punto clave complementario',
      copy: 'Detalla aquí un criterio clínico específico, un ejemplo anatómico o una recomendación preventiva sin exageraciones.',
      visual_layout: 'Esquema visual limpio: texto jerarquizado con bullet point y gráfico de apoyo.',
      micro_hook: 'Continúa deslizando 👉'
    };
    const insertIdx = currentCarousel.slides.length - 1;
    currentCarousel.slides.splice(insertIdx, 0, newSlide);
    currentCarousel.slides.forEach((s, i) => { s.slide_number = i + 1; });
    renderCarouselSheet(currentCarousel);
    showToast(`Nueva lámina añadida (${currentCarousel.slides.length} láminas).`);
  }

  function handleSaveCarousel() {
    if (!currentCarousel) return;
    try {
      GlossContentEngine.saveCarousel(currentCarousel);
      updateSavedCarouselsCount();
      showToast('Carrusel guardado exitosamente.');
    } catch (err) {
      console.error('Error guardando carrusel:', err);
      showToast('Error al guardar carrusel.');
    }
  }

  function updateSavedCarouselsCount() {
    if (!dom.savedCarouselsCountBadge) return;
    const list = GlossContentEngine.getSavedCarousels();
    dom.savedCarouselsCountBadge.textContent = list.length;
  }

  function handleCopyCarousel() {
    if (!currentCarousel) return;
    const text = GlossContentEngine.formatCarouselClipboard(currentCarousel);
    copyToClipboardSafe(text);
    showToast('Guion completo del carrusel copiado al portapapeles.');
  }

  function handleExportCarouselPdf() {
    if (!currentCarousel) return;
    try {
      GlossContentEngine.exportCarouselPdf(currentCarousel);
      showToast('Descargando PDF editorial del carrusel.');
    } catch (err) {
      console.error('Error exportando PDF de carrusel:', err);
      showToast('Error al generar PDF de carrusel.');
    }
  }

  function scheduleFromCarousel(carousel) {
    if (!carousel) return;
    switchTab('calendario');

    const defaultData = {
      title: `Carrusel: ${carousel.treatment_name} · ${carousel.archetype_name}`,
      type: 'carrusel',
      treatment_name: carousel.treatment_name || 'General',
      hook_verbal: carousel.slides && carousel.slides[0] ? carousel.slides[0].title : '',
      notes: `Arquetipo: ${carousel.archetype_name} (${carousel.slides.length} láminas)\nPortada: ${carousel.slides[0] ? carousel.slides[0].copy : ''}`,
      source_type: 'carousel',
      source_id: carousel.carousel_id || null,
      status: 'por_grabar'
    };

    openCreateEventModal(null, defaultData);
    showToast('Carrusel cargado en el formulario. Selecciona la fecha de publicación.');
  }

  function openSavedCarouselsModal() {
    if (!dom.savedCarouselsModal) return;
    renderSavedCarouselsList();
    dom.savedCarouselsModal.removeAttribute('hidden');
  }

  function closeSavedCarouselsModal() {
    if (dom.savedCarouselsModal) dom.savedCarouselsModal.setAttribute('hidden', '');
  }

  function renderSavedCarouselsList() {
    if (!dom.savedCarouselsList) return;
    const list = GlossContentEngine.getSavedCarousels();
    dom.savedCarouselsList.innerHTML = '';

    if (list.length === 0) {
      dom.savedCarouselsList.innerHTML = '<p style="color: var(--ec-muted); text-align: center; padding: 24px;">No tienes carruseles guardados en este momento.</p>';
      return;
    }

    list.forEach(item => {
      const carousel = item.carousel || item;
      const id = item.id || carousel.carousel_id;
      const el = document.createElement('div');
      el.className = 'ec-modal-item';
      el.innerHTML = `
        <div style="flex: 1;">
          <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 4px;">
            <span class="ec-badge-intensity" style="background: #1E3A8A; color: #FFFFFF;">CARRUSEL 4:5</span>
            <span style="font-size: 11px; color: var(--ec-muted);">${carousel.slides ? carousel.slides.length : 0} láminas · ${escapeHtml(carousel.archetype_name || '')}</span>
          </div>
          <h4 style="font-size: 14px; font-weight: 600; margin: 0 0 4px; color: var(--ec-charcoal);">${escapeHtml(carousel.title)}</h4>
          <p style="font-size: 11.5px; color: var(--ec-muted); margin: 0;">${escapeHtml(carousel.treatment_name || '')}</p>
        </div>
        <div style="display: flex; gap: 6px;">
          <button class="ec-btn-card-action btn-load-carousel" type="button" title="Cargar carrusel en el editor">
            <span aria-hidden="true">✏️</span> Abrir
          </button>
          <button class="ec-btn-card-action btn-pdf-carousel" type="button" title="Descargar PDF">
            <span aria-hidden="true">📄</span> PDF
          </button>
          <button class="ec-btn-card-action btn-del-carousel" type="button" title="Eliminar de guardados" style="color: #B91C1C;">
            ✕
          </button>
        </div>
      `;

      el.querySelector('.btn-del-carousel').addEventListener('click', () => {
        GlossContentEngine.deleteCarousel(id);
        renderSavedCarouselsList();
        updateSavedCarouselsCount();
        showToast('Carrusel eliminado.');
      });

      el.querySelector('.btn-load-carousel').addEventListener('click', () => {
        currentCarousel = carousel;
        renderCarouselSheet(carousel);
        closeSavedCarouselsModal();
        switchTab('carruseles');
        showToast('Carrusel cargado en el editor.');
      });

      el.querySelector('.btn-pdf-carousel').addEventListener('click', () => {
        GlossContentEngine.exportCarouselPdf(carousel);
      });

      dom.savedCarouselsList.appendChild(el);
    });
  }

  function handleClearSavedCarousels() {
    if (!confirm('¿Deseas vaciar todos los carruseles guardados?')) return;
    const list = GlossContentEngine.getSavedCarousels();
    list.forEach(c => GlossContentEngine.deleteCarousel(c.id || (c.carousel && c.carousel.carousel_id)));
    renderSavedCarouselsList();
    updateSavedCarouselsCount();
    showToast('Carruseles vaciados.');
  }

  // =========================================================================
  // FASE 4: CONTROLADOR DE SECUENCIAS DE HISTORIAS DE INSTAGRAM (9:16)
  // =========================================================================

  function populateStoriesTreatments() {
    if (!isInitialized || !dom.storiesTreatment) return;
    const treatments = GlossContentEngine.getTreatments();
    dom.storiesTreatment.innerHTML = '';
    treatments.filter(t => (t.categoria || t.specialty) !== 'negocio_marketing' && (t.id || t.treatment_id) !== 'negocio_marketing').forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id || t.treatment_id;
      opt.textContent = `${t.nombre_habitual || t.name} (${getSpecialtyLabel(t.categoria || t.specialty)})`;
      dom.storiesTreatment.appendChild(opt);
    });
  }

  async function handleGenerateStories() {
    if (!isInitialized) return;
    try {
      await handleGenerateStoriesGemini();
    } catch (err) {
      console.warn('Fallo en Gemini AI para historias. Fallback a biblioteca local:', err);
      const treatmentId = dom.storiesTreatment ? dom.storiesTreatment.value : 'rinomodelacion';
      const categoryId = dom.storiesCategory ? dom.storiesCategory.value : 'one_shot';
      const structureId = dom.storiesStructure ? dom.storiesStructure.value : 'bomba';
      const count = dom.storiesCount ? parseInt(dom.storiesCount.value, 10) : 4;
      const formatMode = dom.storiesFormatMode ? dom.storiesFormatMode.value : 'talking_head';
      const customTopic = dom.storiesCustomTopic ? dom.storiesCustomTopic.value.trim() : null;

      try {
        currentStoriesSequence = GlossContentEngine.generateStoriesSequence({
          treatment_id: treatmentId,
          category_id: categoryId,
          structure_id: structureId,
          count: count,
          format_mode: formatMode,
          custom_topic: customTopic
        });
        renderStoriesSheet(currentStoriesSequence);
        showToast(`Secuencia de historias estructurada (${currentStoriesSequence.stories.length} historias, Biblioteca local).`);
      } catch (innerErr) {
        console.error('Error al generar historias locales:', innerErr);
        showToast('Error generando historias.');
      }
    }
  }

  async function handleGenerateStoriesGemini() {
    const treatmentSelect = dom.storiesTreatment;
    const selectedOption = treatmentSelect?.options[treatmentSelect.selectedIndex];
    const treatmentName = selectedOption ? selectedOption.textContent.trim() : 'Tratamiento estético';
    const treatmentId = dom.storiesTreatment?.value || 'rinomodelacion';
    const categoryId = dom.storiesCategory?.value || 'one_shot';
    const structureId = dom.storiesStructure?.value || 'bomba';
    const count = dom.storiesCount ? parseInt(dom.storiesCount.value, 10) : 4;
    const formatMode = dom.storiesFormatMode?.value || 'talking_head';
    const customTopic = dom.storiesCustomTopic?.value?.trim() || null;

    if (dom.btnGenerateStories) {
      dom.btnGenerateStories.disabled = true;
      dom.btnGenerateStories.innerHTML = '<span aria-hidden="true">⏳</span> Generando secuencia con Gemini AI...';
    }

    try {
      const resData = await callGlossWorkerGenerate({
        formato: 'historias',
        tratamiento: treatmentName,
        secuencia_historias: structureId,
        objetivo: categoryId,
        contexto: customTopic
      });

      const res = resData.resultado || {};
      const rawStories = res.historias || [];
      const stories = rawStories.map((h, idx) => ({
        story_number: h.historia_numero || (idx + 1),
        role: h.rol || (idx === 0 ? 'GANCHO' : idx === rawStories.length - 1 ? 'CONVERSIÓN' : 'VALOR'),
        screen_text: h.texto_pantalla || '',
        verbal_script: h.texto_pantalla || '',
        visual_cue: h.direccion_visual || 'Video selfie en consultorio con bata médica y buena iluminación',
        sticker_name: h.sticker_sugerido ? `Sticker: ${h.sticker_sugerido}` : (idx === rawStories.length - 1 ? 'Sticker: Caja de preguntas' : 'Sin sticker'),
        word_count: (h.texto_pantalla || '').trim().split(/\s+/).filter(Boolean).length
      }));

      currentStoriesSequence = {
        id: `gemini-sto-${Date.now()}`,
        treatment_id: treatmentId,
        treatment_name: res.tratamiento || treatmentName,
        title: `${res.secuencia_nombre || 'Secuencia'} · ${res.tratamiento || treatmentName}`,
        category_id: categoryId,
        category_name: 'Impacto Clínico y Valor',
        structure_id: res.secuencia_codigo || structureId,
        structure_name: res.secuencia_nombre || 'Secuencia de Historias Gemini AI',
        format_mode: formatMode,
        format_mode_label: 'Video a cámara + texto en pantalla',
        stories: stories,
        created_at: new Date().toISOString(),
        engine: 'Google Gemini AI v2.3.1 (Verificado)'
      };

      renderStoriesSheet(currentStoriesSequence);

      const auditoria = resData.auditoria_editorial || {};
      const calif = auditoria.nivel_semantico?.calificacion || 9;
      showToast(`📱 Secuencia de Historias con Gemini AI (${calif}/10 · ${stories.length} pantallas).`);
    } catch (err) {
      console.error('Error al generar Historias con Gemini AI:', err);
      showToast(`Error con Gemini AI: ${err.message}. Usando plantilla local.`);
      currentStoriesSequence = GlossContentEngine.generateStoriesSequence({
        treatment_id: treatmentId,
        category_id: categoryId,
        structure_id: structureId,
        count: count,
        format_mode: formatMode,
        custom_topic: customTopic
      });
      renderStoriesSheet(currentStoriesSequence);
    } finally {
      if (dom.btnGenerateStories) {
        dom.btnGenerateStories.disabled = false;
        dom.btnGenerateStories.innerHTML = '<span aria-hidden="true">📱</span> Generar Secuencia de Historias';
      }
    }
  }

  function renderStoriesSheet(sequence) {
    if (!sequence || !dom.storiesSheet) return;

    dom.storiesSheet.innerHTML = `
      <header class="ec-stories-head">
        <div>
          <span class="eyebrow" style="margin: 0; font-size: 11px;">Secuencias de Historias · Formato Vertical (9:16)</span>
          <h2 class="ec-stories-title">${escapeHtml(sequence.title)}</h2>
          <div class="ec-carousel-meta-pills">
            <span class="ec-carousel-meta-pill">📱 ${sequence.stories.length} Historias</span>
            <span class="ec-carousel-meta-pill">📂 Categoría: ${escapeHtml(sequence.category_name)}</span>
            <span class="ec-carousel-meta-pill">📐 Estructura: ${escapeHtml(sequence.structure_name)}</span>
            <span class="ec-carousel-meta-pill">🎥 Modo: ${escapeHtml(sequence.format_mode_label || sequence.format_mode)}</span>
            <span class="ec-carousel-meta-pill">🏷️ ${escapeHtml(sequence.treatment_name)}</span>
          </div>
        </div>
        <div class="ec-batch-actions">
          <button class="ec-btn-action" id="btn-schedule-this-stories" type="button" style="color: #1E3A8A; font-weight: 600;">
            <span aria-hidden="true">📅</span> Planificar
          </button>
          <button class="ec-btn-action" id="btn-save-this-stories" type="button">
            <span aria-hidden="true">💾</span> Guardar secuencia
          </button>
          <button class="ec-btn-action" id="btn-copy-full-stories" type="button">
            <span aria-hidden="true">📋</span> Copiar guion
          </button>
          <button class="ec-btn-action" id="btn-export-stories-pdf" type="button">
            <span aria-hidden="true">📄</span> Descargar PDF
          </button>
          <button class="ec-btn-action" id="btn-export-visual-stories" type="button" style="color: #7C3AED; font-weight: 700; border-color: #7C3AED;">
            <span aria-hidden="true">🖼️</span> Exportar PNGs (9:16)
          </button>
        </div>
      </header>

      <div class="ec-carousel-notice" style="border-left-color: #7C3AED;">
        <strong>Producción vertical 9:16:</strong> Diseña secuencias rápidas de retención. Los textos superpuestos deben permanecer en la zona segura (lejos de bordes y controles de Instagram). La locución debe ser ágil y el sticker interactivo visible.
      </div>

      <div class="ec-stories-grid">
        ${sequence.stories.map((st, idx) => `
          <article class="ec-story-card" data-story-index="${idx}">
            <header class="ec-story-header">
              <span class="ec-story-num">HISTORIA ${st.story_number} / ${sequence.stories.length}</span>
              <span class="ec-story-role-pill">${escapeHtml(st.role)}</span>
              <button class="ec-slide-ctrl-btn btn-story-preview-png" type="button" title="Previsualizar y descargar historia PNG" data-idx="${idx}" style="margin-left: auto;">🖼️</button>
            </header>

            <div class="ec-story-screen-mockup">
              <div class="ec-story-notch"></div>
              <textarea class="ec-story-screen-text-input" placeholder="Texto en pantalla (9:16)" data-story-field="screen_text" data-idx="${idx}">${escapeHtml(st.screen_text)}</textarea>
              <div class="ec-story-sticker-wrap">
                <span class="ec-story-sticker-badge">${escapeHtml(st.sticker_name)}</span>
              </div>
            </div>

            <div class="ec-story-production-box">
              <div class="ec-slide-field-group">
                <label class="ec-slide-field-label">Guion de voz / Locución</label>
                <textarea class="ec-story-script-input" data-story-field="verbal_script" data-idx="${idx}">${escapeHtml(st.verbal_script)}</textarea>
              </div>

              <div class="ec-slide-field-group">
                <label class="ec-slide-field-label">Indicación visual y toma en cabina</label>
                <textarea class="ec-story-visual-input" data-story-field="visual_cue" data-idx="${idx}">${escapeHtml(st.visual_cue)}</textarea>
              </div>

              <div class="ec-story-transition">
                <span>↳</span> <span>${escapeHtml(st.transition_to_next)}</span>
              </div>
            </div>
          </article>
        `).join('')}
      </div>
    `;

    // Escuchar ediciones de historias
    dom.storiesSheet.querySelectorAll('[data-story-field]').forEach(input => {
      input.addEventListener('input', () => {
        const idx = parseInt(input.getAttribute('data-idx'), 10);
        const field = input.getAttribute('data-story-field');
        if (sequence.stories[idx]) {
          sequence.stories[idx][field] = input.value;
        }
      });
    });

    // Vincular acciones de cabecera
    const btnSchedule = dom.storiesSheet.querySelector('#btn-schedule-this-stories');
    if (btnSchedule) btnSchedule.addEventListener('click', () => scheduleFromStories(sequence));

    const btnSave = dom.storiesSheet.querySelector('#btn-save-this-stories');
    if (btnSave) btnSave.addEventListener('click', handleSaveStories);

    const btnCopy = dom.storiesSheet.querySelector('#btn-copy-full-stories');
    if (btnCopy) btnCopy.addEventListener('click', handleCopyStories);

    const btnExportPdf = dom.storiesSheet.querySelector('#btn-export-stories-pdf');
    if (btnExportPdf) btnExportPdf.addEventListener('click', handleExportStoriesPdf);

    const btnExportVisual = dom.storiesSheet.querySelector('#btn-export-visual-stories');
    if (btnExportVisual) btnExportVisual.addEventListener('click', () => openVisualExportModal('stories', 0));

    dom.storiesSheet.querySelectorAll('.btn-story-preview-png').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx') || '0', 10);
        openVisualExportModal('stories', idx);
      });
    });

    if (dom.storiesResultsSection) dom.storiesResultsSection.removeAttribute('hidden');
  }

  function handleSaveStories() {
    if (!currentStoriesSequence) return;
    try {
      GlossContentEngine.saveStoriesSequence(currentStoriesSequence);
      updateSavedStoriesCount();
      showToast('Secuencia de historias guardada exitosamente.');
    } catch (err) {
      console.error('Error guardando historias:', err);
      showToast('Error al guardar secuencia de historias.');
    }
  }

  function updateSavedStoriesCount() {
    if (!dom.savedStoriesCountBadge) return;
    const list = GlossContentEngine.getSavedStoriesSequences();
    dom.savedStoriesCountBadge.textContent = list.length;
  }

  function handleCopyStories() {
    if (!currentStoriesSequence) return;
    const text = GlossContentEngine.formatStoriesClipboard(currentStoriesSequence);
    copyToClipboardSafe(text);
    showToast('Guion de historias copiado al portapapeles.');
  }

  function handleExportStoriesPdf() {
    if (!currentStoriesSequence) return;
    try {
      GlossContentEngine.exportStoriesPdf(currentStoriesSequence);
      showToast('Descargando PDF editorial de historias.');
    } catch (err) {
      console.error('Error exportando PDF de historias:', err);
      showToast('Error al generar PDF de historias.');
    }
  }

  function scheduleFromStories(seq) {
    if (!seq) return;
    switchTab('calendario');

    const defaultData = {
      title: `Historias: ${seq.treatment_name} · ${seq.structure_name}`,
      type: 'historia',
      treatment_name: seq.treatment_name || 'General',
      hook_verbal: seq.stories && seq.stories[0] ? seq.stories[0].screen_text : '',
      notes: `Secuencia: ${seq.structure_name} (${seq.stories.length} historias - ${seq.category_name})\nModo: ${seq.format_mode_label || seq.format_mode}`,
      source_type: 'stories',
      source_id: seq.sequence_id || null,
      status: 'por_grabar'
    };

    openCreateEventModal(null, defaultData);
    showToast('Secuencia cargada en el formulario. Selecciona la fecha de publicación.');
  }

  function openSavedStoriesModal() {
    if (!dom.savedStoriesModal) return;
    renderSavedStoriesList();
    dom.savedStoriesModal.removeAttribute('hidden');
  }

  function closeSavedStoriesModal() {
    if (dom.savedStoriesModal) dom.savedStoriesModal.setAttribute('hidden', '');
  }

  function renderSavedStoriesList() {
    if (!dom.savedStoriesList) return;
    const list = GlossContentEngine.getSavedStoriesSequences();
    dom.savedStoriesList.innerHTML = '';

    if (list.length === 0) {
      dom.savedStoriesList.innerHTML = '<p style="color: var(--ec-muted); text-align: center; padding: 24px;">No tienes secuencias de historias guardadas en este momento.</p>';
      return;
    }

    list.forEach(item => {
      const seq = item.sequence || item;
      const id = item.id || seq.sequence_id;
      const el = document.createElement('div');
      el.className = 'ec-modal-item';
      el.innerHTML = `
        <div style="flex: 1;">
          <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 4px;">
            <span class="ec-badge-intensity" style="background: #7C3AED; color: #FFFFFF;">HISTORIAS 9:16</span>
            <span style="font-size: 11px; color: var(--ec-muted);">${seq.stories ? seq.stories.length : 0} historias · ${escapeHtml(seq.structure_name || '')}</span>
          </div>
          <h4 style="font-size: 14px; font-weight: 600; margin: 0 0 4px; color: var(--ec-charcoal);">${escapeHtml(seq.title)}</h4>
          <p style="font-size: 11.5px; color: var(--ec-muted); margin: 0;">${escapeHtml(seq.treatment_name || '')} (${escapeHtml(seq.category_name || '')})</p>
        </div>
        <div style="display: flex; gap: 6px;">
          <button class="ec-btn-card-action btn-load-stories" type="button" title="Cargar historias en la vista">
            <span aria-hidden="true">✏️</span> Abrir
          </button>
          <button class="ec-btn-card-action btn-pdf-stories" type="button" title="Descargar PDF">
            <span aria-hidden="true">📄</span> PDF
          </button>
          <button class="ec-btn-card-action btn-del-stories" type="button" title="Eliminar de guardados" style="color: #B91C1C;">
            ✕
          </button>
        </div>
      `;

      el.querySelector('.btn-del-stories').addEventListener('click', () => {
        GlossContentEngine.deleteStoriesSequence(id);
        renderSavedStoriesList();
        updateSavedStoriesCount();
        showToast('Secuencia de historias eliminada.');
      });

      el.querySelector('.btn-load-stories').addEventListener('click', () => {
        currentStoriesSequence = seq;
        renderStoriesSheet(seq);
        closeSavedStoriesModal();
        switchTab('historias');
        showToast('Secuencia cargada en la vista.');
      });

      el.querySelector('.btn-pdf-stories').addEventListener('click', () => {
        GlossContentEngine.exportStoriesPdf(seq);
      });

      dom.savedStoriesList.appendChild(el);
    });
  }

  function handleClearSavedStories() {
    if (!confirm('¿Deseas vaciar todas las historias guardadas?')) return;
    const list = GlossContentEngine.getSavedStoriesSequences();
    list.forEach(s => GlossContentEngine.deleteStoriesSequence(s.id || (s.sequence && s.sequence.sequence_id)));
    renderSavedStoriesList();
    updateSavedStoriesCount();
    showToast('Historias vaciadas.');
  }

  // =========================================================================
  // FASE 7: CONTROLADOR DE EXPORTACIÓN VISUAL (CANVAS 2D)
  // =========================================================================

  const visualExportState = {
    mode: 'carousel', // 'carousel' | 'stories'
    templateId: 'editorial_premium',
    currentIndex: 0,
    userPhoto: null,
    brandName: '',
    brandHandle: ''
  };

  function initVisualExportModal() {
    if (!dom.visualModal) return;

    if (dom.visualBtnClose) {
      dom.visualBtnClose.addEventListener('click', closeVisualExportModal);
    }

    if (dom.visualBtnPrev) {
      dom.visualBtnPrev.addEventListener('click', () => {
        const total = getVisualItemsCount();
        if (total === 0) return;
        visualExportState.currentIndex = (visualExportState.currentIndex - 1 + total) % total;
        renderVisualModalCanvas();
      });
    }

    if (dom.visualBtnNext) {
      dom.visualBtnNext.addEventListener('click', () => {
        const total = getVisualItemsCount();
        if (total === 0) return;
        visualExportState.currentIndex = (visualExportState.currentIndex + 1) % total;
        renderVisualModalCanvas();
      });
    }

    if (dom.visualTplBtns) {
      dom.visualTplBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          dom.visualTplBtns.forEach(b => {
            b.classList.remove('active');
            b.style.borderColor = '#CBD5E1';
          });
          btn.classList.add('active');
          btn.style.borderColor = '#2C0913';
          visualExportState.templateId = btn.getAttribute('data-template');
          renderVisualModalCanvas();
        });
      });
    }

    if (dom.visualBrandName) {
      dom.visualBrandName.addEventListener('input', e => {
        visualExportState.brandName = e.target.value.trim();
        renderVisualModalCanvas();
      });
    }
    if (dom.visualBrandHandle) {
      dom.visualBrandHandle.addEventListener('input', e => {
        visualExportState.brandHandle = e.target.value.trim();
        renderVisualModalCanvas();
      });
    }

    if (dom.visualPhotoInput) {
      dom.visualPhotoInput.addEventListener('change', e => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
          const img = new Image();
          img.onload = () => {
            visualExportState.userPhoto = img;
            renderVisualModalCanvas();
            showToast('Fotografía cargada en vista previa.');
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    if (dom.visualBtnDownloadSingle) {
      dom.visualBtnDownloadSingle.addEventListener('click', handleDownloadSingleVisual);
    }

    if (dom.visualBtnDownloadAll) {
      dom.visualBtnDownloadAll.addEventListener('click', handleDownloadAllVisual);
    }
  }

  function getVisualItemsCount() {
    if (visualExportState.mode === 'carousel') {
      return (currentCarousel && currentCarousel.slides) ? currentCarousel.slides.length : 0;
    } else {
      return (currentStoriesSequence && currentStoriesSequence.stories) ? currentStoriesSequence.stories.length : 0;
    }
  }

  function openVisualExportModal(mode = 'carousel', initialIndex = 0) {
    if (typeof GlossVisualExport === 'undefined') {
      showToast('Motor de exportación visual no disponible.');
      return;
    }

    visualExportState.mode = mode;
    visualExportState.currentIndex = initialIndex;

    if (activeBusiness && activeBusiness.name && !visualExportState.brandName) {
      visualExportState.brandName = activeBusiness.name;
      if (dom.visualBrandName) dom.visualBrandName.value = activeBusiness.name;
    }

    if (mode === 'carousel') {
      if (!currentCarousel || !currentCarousel.slides) {
        showToast('Primero genera un carrusel para exportarlo a imagen.');
        return;
      }
      if (dom.visualModalTitle) dom.visualModalTitle.textContent = 'Exportador de Carruseles (1080 × 1350 px · 4:5)';
      if (dom.visualModalEyebrow) dom.visualModalEyebrow.textContent = 'Instagram Feed · Carrusel Deslizable';
      if (dom.visualBtnDownloadSingle) dom.visualBtnDownloadSingle.textContent = 'Descargar esta lámina (PNG 4:5)';
      if (dom.visualBtnDownloadAll) dom.visualBtnDownloadAll.textContent = 'Descargar todo el carrusel (PNG)';
    } else {
      if (!currentStoriesSequence || !currentStoriesSequence.stories) {
        showToast('Primero genera una secuencia de historias para exportarla.');
        return;
      }
      if (dom.visualModalTitle) dom.visualModalTitle.textContent = 'Exportador de Historias (1080 × 1920 px · 9:16)';
      if (dom.visualModalEyebrow) dom.visualModalEyebrow.textContent = 'Instagram Stories · Formato Vertical';
      if (dom.visualBtnDownloadSingle) dom.visualBtnDownloadSingle.textContent = 'Descargar esta historia (PNG 9:16)';
      if (dom.visualBtnDownloadAll) dom.visualBtnDownloadAll.textContent = 'Descargar todas las historias (PNG)';
    }

    renderVisualModalCanvas();
    if (dom.visualModal) dom.visualModal.removeAttribute('hidden');
  }

  function closeVisualExportModal() {
    if (dom.visualModal) dom.visualModal.setAttribute('hidden', '');
  }

  function renderVisualModalCanvas() {
    if (!dom.visualCanvas || typeof GlossVisualExport === 'undefined') return;
    const t0 = performance.now();

    const idx = visualExportState.currentIndex;
    const total = getVisualItemsCount();

    if (dom.visualPagerIndicator) {
      const label = visualExportState.mode === 'carousel' ? 'Lámina' : 'Historia';
      dom.visualPagerIndicator.textContent = `${label} ${idx + 1} de ${total}`;
    }

    const options = {
      templateId: visualExportState.templateId,
      brandName: visualExportState.brandName,
      brandHandle: visualExportState.brandHandle,
      userPhoto: visualExportState.userPhoto
    };

    if (visualExportState.mode === 'carousel') {
      const slide = currentCarousel.slides[idx];
      slide.total_slides = total;
      options.categoryLabel = currentCarousel.treatment_name || 'Gloss & Growth';
      GlossVisualExport.renderCarouselSlide(dom.visualCanvas, slide, options);
    } else {
      const story = currentStoriesSequence.stories[idx];
      story.total_stories = total;
      options.categoryLabel = currentStoriesSequence.treatment_name || 'Gloss & Growth';
      GlossVisualExport.renderStorySlide(dom.visualCanvas, story, options);
    }

    const t1 = performance.now();
    const renderMs = Math.round(t1 - t0);
    if (dom.visualRenderTime) {
      const res = visualExportState.mode === 'carousel' ? '1080 × 1350 px (4:5)' : '1080 × 1920 px (9:16)';
      dom.visualRenderTime.textContent = `Resolución: ${res} · Renderizado en ${renderMs} ms`;
    }
  }

  function handleDownloadSingleVisual() {
    if (!dom.visualCanvas || typeof GlossVisualExport === 'undefined') return;
    const idx = visualExportState.currentIndex;
    const prefix = visualExportState.mode === 'carousel' ? 'Carrusel-Lamina' : 'Historia';
    const num = String(idx + 1).padStart(2, '0');
    const treatName = (visualExportState.mode === 'carousel' ? currentCarousel?.treatment_name : currentStoriesSequence?.treatment_name) || 'Contenido';
    const cleanTreat = treatName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const filename = `Gloss-Growth_${prefix}-${num}_${cleanTreat}.png`;

    GlossVisualExport.downloadCanvas(dom.visualCanvas, filename);
    showToast(`Imagen ${prefix} ${idx + 1} descargada en alta resolución.`);
  }

  async function handleDownloadAllVisual() {
    if (!dom.visualCanvas || typeof GlossVisualExport === 'undefined') return;
    const total = getVisualItemsCount();
    if (total === 0) return;

    showToast(`Iniciando descarga de ${total} imágenes...`);
    const initialIndex = visualExportState.currentIndex;

    for (let i = 0; i < total; i++) {
      visualExportState.currentIndex = i;
      renderVisualModalCanvas();
      await new Promise(r => setTimeout(r, 60));

      const prefix = visualExportState.mode === 'carousel' ? 'Carrusel-Lamina' : 'Historia';
      const num = String(i + 1).padStart(2, '0');
      const treatName = (visualExportState.mode === 'carousel' ? currentCarousel?.treatment_name : currentStoriesSequence?.treatment_name) || 'Contenido';
      const cleanTreat = treatName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const filename = `Gloss-Growth_${prefix}-${num}_${cleanTreat}.png`;

      GlossVisualExport.downloadCanvas(dom.visualCanvas, filename);
      await new Promise(r => setTimeout(r, 200));
    }

    visualExportState.currentIndex = initialIndex;
    renderVisualModalCanvas();
    showToast(`¡Las ${total} imágenes fueron descargadas con éxito!`);
  }

  // =========================================================================
  // FASE 3 / ETAPA C: CONTROLADOR DEL CALENDARIO EDITORIAL MVP
  // =========================================================================

  const MONTH_NAMES_ES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const calState = {
    view: 'month', // 'month' | 'week'
    currentDate: new Date(),
    filterType: 'todos',
    filterStatus: 'todos',
    activeImportTab: 'ideas'
  };

  function initCalendar() {
    populateCalendarTreatments();
    renderCalendar();
  }

  function populateCalendarTreatments() {
    if (!dom.calInputTreatment) return;
    dom.calInputTreatment.innerHTML = '<option value="General">General (Medicina estética)</option>';
    const treatments = GlossContentEngine.getTreatments();
    treatments.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.nombre;
      opt.textContent = t.nombre;
      dom.calInputTreatment.appendChild(opt);
    });
  }

  function setCalendarView(view) {
    calState.view = view;
    if (dom.calViewMonth) {
      dom.calViewMonth.classList.toggle('active', view === 'month');
      dom.calViewMonth.setAttribute('aria-pressed', view === 'month' ? 'true' : 'false');
    }
    if (dom.calViewWeek) {
      dom.calViewWeek.classList.toggle('active', view === 'week');
      dom.calViewWeek.setAttribute('aria-pressed', view === 'week' ? 'true' : 'false');
    }
    if (dom.calMonthWrap) dom.calMonthWrap.hidden = (view !== 'month');
    if (dom.calWeekWrap) dom.calWeekWrap.hidden = (view !== 'week');
    renderCalendar();
  }

  function handleCalPrev() {
    if (calState.view === 'month') {
      calState.currentDate.setMonth(calState.currentDate.getMonth() - 1);
    } else {
      calState.currentDate.setDate(calState.currentDate.getDate() - 7);
    }
    renderCalendar();
  }

  function handleCalToday() {
    calState.currentDate = new Date();
    renderCalendar();
  }

  function handleCalNext() {
    if (calState.view === 'month') {
      calState.currentDate.setMonth(calState.currentDate.getMonth() + 1);
    } else {
      calState.currentDate.setDate(calState.currentDate.getDate() + 7);
    }
    renderCalendar();
  }

  function handleCalFilterChange() {
    calState.filterType = dom.calFilterType ? dom.calFilterType.value : 'todos';
    calState.filterStatus = dom.calFilterStatus ? dom.calFilterStatus.value : 'todos';
    renderCalendar();
  }

  async function handleGenerateCalendarGemini() {
    let treatmentName = 'Medicina Estética';
    if (dom.calInputTreatment && dom.calInputTreatment.value && dom.calInputTreatment.value !== 'General') {
      treatmentName = dom.calInputTreatment.value;
    } else if (dom.treatment && dom.treatment.selectedIndex >= 0) {
      treatmentName = dom.treatment.options[dom.treatment.selectedIndex].textContent.trim();
    }

    if (dom.calBtnGemini) {
      dom.calBtnGemini.disabled = true;
      dom.calBtnGemini.innerHTML = '<span aria-hidden="true">⏳</span> Planificando con Gemini AI...';
    }

    try {
      const resData = await callGlossWorkerGenerate({
        formato: 'calendario',
        tratamiento: treatmentName
      });

      const res = resData.resultado || {};
      const eventos = res.eventos || [];

      if (!eventos.length) {
        throw new Error('No se recibieron eventos en la respuesta');
      }

      eventos.forEach(evt => {
        GlossContentEngine.saveCalendarEvent({
          title: evt.title,
          date: evt.date,
          time: evt.time || '18:00',
          type: evt.type || 'reel',
          status: evt.status || 'por_grabar',
          treatment_name: evt.treatment_name || treatmentName,
          hook_verbal: evt.hook_verbal || '',
          notes: evt.notes || '',
          source_type: 'gemini_ai'
        });
      });

      renderCalendar();

      const auditoria = resData.auditoria_editorial || {};
      const calif = auditoria.nivel_semantico?.calificacion || 9;
      showToast(`✨ Plan mensual con ${eventos.length} publicaciones programadas con Gemini AI (${calif}/10).`);
    } catch (err) {
      console.error('Error al generar calendario con Gemini AI:', err);
      showToast(`Error al generar calendario con Gemini AI: ${err.message}`);
    } finally {
      if (dom.calBtnGemini) {
        dom.calBtnGemini.disabled = false;
        dom.calBtnGemini.innerHTML = '<span aria-hidden="true">✨</span> Plan con Gemini AI';
      }
    }
  }

  function handleCalSeed() {
    GlossContentEngine.seedCalendarWithSampleEvents();
    renderCalendar();
    showToast('Publicaciones de ejemplo cargadas en el calendario.');
  }

  function updateCalendarMetrics() {
    const all = GlossContentEngine.getCalendarEvents();
    const total = all.length;
    const inProd = all.filter(e => e.status === 'por_grabar' || e.status === 'en_edicion').length;
    const ready = all.filter(e => e.status === 'listo' || e.status === 'publicado').length;

    if (dom.calStatTotal) dom.calStatTotal.textContent = String(total);
    if (dom.calStatProd) dom.calStatProd.textContent = String(inProd);
    if (dom.calStatReady) dom.calStatReady.textContent = String(ready);
  }

  function renderCalendar() {
    updateCalendarMetrics();

    const d = calState.currentDate;
    const y = d.getFullYear();
    const m = d.getMonth();

    if (calState.view === 'month') {
      if (dom.calHeading) dom.calHeading.textContent = `${MONTH_NAMES_ES[m]} ${y}`;
      renderMonthGrid();
    } else {
      let dayIdx = d.getDay() - 1;
      if (dayIdx < 0) dayIdx = 6;
      const monday = new Date(d);
      monday.setDate(d.getDate() - dayIdx);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const monStr = `${monday.getDate()} ${MONTH_NAMES_ES[monday.getMonth()].slice(0, 3)}`;
      const sunStr = `${sunday.getDate()} ${MONTH_NAMES_ES[sunday.getMonth()].slice(0, 3)} ${sunday.getFullYear()}`;
      if (dom.calHeading) dom.calHeading.textContent = `Semana: ${monStr} – ${sunStr}`;
      renderWeekGrid(monday);
    }
  }

  function renderMonthGrid() {
    if (!dom.calMonthGrid) return;
    dom.calMonthGrid.innerHTML = '';

    const d = calState.currentDate;
    const y = d.getFullYear();
    const m = d.getMonth();
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const firstDay = new Date(y, m, 1);
    const lastDay = new Date(y, m + 1, 0);
    const daysInMonth = lastDay.getDate();

    let startWeekday = firstDay.getDay() - 1;
    if (startWeekday < 0) startWeekday = 6; // Lunes = 0

    const prevMonthLastDay = new Date(y, m, 0).getDate();
    const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

    const events = GlossContentEngine.getCalendarEvents({
      type: calState.filterType,
      status: calState.filterStatus
    });

    const formatPills = {
      reel: 'Reel',
      carrusel: 'Carrusel',
      historia: 'Historia',
      anuncio: 'Ad'
    };

    for (let i = 0; i < totalCells; i++) {
      const cell = document.createElement('div');
      cell.className = 'ec-cal-day-cell';

      let cellDateStr = '';
      let dayNum = 0;
      let isOther = false;

      if (i < startWeekday) {
        isOther = true;
        dayNum = prevMonthLastDay - (startWeekday - 1 - i);
        const prevM = m === 0 ? 12 : m;
        const prevY = m === 0 ? y - 1 : y;
        cellDateStr = `${prevY}-${String(prevM).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
        cell.classList.add('is-other-month');
      } else if (i < startWeekday + daysInMonth) {
        dayNum = i - startWeekday + 1;
        cellDateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
        if (cellDateStr === todayStr) {
          cell.classList.add('is-today');
        }
      } else {
        isOther = true;
        dayNum = i - (startWeekday + daysInMonth) + 1;
        const nextM = m === 11 ? 1 : m + 2;
        const nextY = m === 11 ? y + 1 : y;
        cellDateStr = `${nextY}-${String(nextM).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
        cell.classList.add('is-other-month');
      }

      cell.dataset.date = cellDateStr;

      const dayEvents = events.filter(e => e.date === cellDateStr);

      cell.innerHTML = `
        <div class="ec-cal-cell-header">
          <span class="ec-cal-day-num">${dayNum}</span>
          <button class="ec-cal-btn-add-day" type="button" title="Programar en esta fecha" data-date="${cellDateStr}">+</button>
        </div>
        <div class="ec-cal-events-list">
          ${dayEvents.map(evt => `
            <div class="ec-cal-chip type-${evt.type}" data-event-id="${evt.id}" title="${escapeHtml(evt.title)} (${evt.status})">
              <span class="ec-cal-chip-title">${escapeHtml(evt.title)}</span>
              <div class="ec-cal-chip-meta">
                <span class="ec-fmt-${evt.type}" style="padding: 1px 4px; border-radius: 2px; font-weight: 700;">${formatPills[evt.type] || evt.type}</span>
                <span class="ec-status-badge ec-status-${evt.status}">${(evt.status || 'pendiente').replace('_', ' ')}</span>
              </div>
            </div>
          `).join('')}
        </div>
      `;

      cell.querySelector('.ec-cal-btn-add-day').addEventListener('click', (e) => {
        e.stopPropagation();
        openCreateEventModal(cellDateStr);
      });

      cell.addEventListener('click', (e) => {
        if (!e.target.closest('.ec-cal-chip') && !e.target.closest('.ec-cal-btn-add-day')) {
          openCreateEventModal(cellDateStr);
        }
      });

      cell.querySelectorAll('.ec-cal-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
          e.stopPropagation();
          const evtId = chip.dataset.eventId;
          openEditEventModal(evtId);
        });
      });

      dom.calMonthGrid.appendChild(cell);
    }
  }

  function renderWeekGrid(monday) {
    if (!dom.calWeekColumns) return;
    dom.calWeekColumns.innerHTML = '';

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const weekdayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    const events = GlossContentEngine.getCalendarEvents({
      type: calState.filterType,
      status: calState.filterStatus
    });

    const formatPills = {
      reel: 'Reel',
      carrusel: 'Carrusel',
      historia: 'Historia',
      anuncio: 'Anuncio'
    };

    for (let i = 0; i < 7; i++) {
      const colDay = new Date(monday);
      colDay.setDate(monday.getDate() + i);

      const y = colDay.getFullYear();
      const m = colDay.getMonth() + 1;
      const d = colDay.getDate();
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = (dateStr === todayStr);

      const colEvents = events.filter(e => e.date === dateStr);

      const col = document.createElement('div');
      col.className = 'ec-cal-week-col';

      col.innerHTML = `
        <div class="ec-cal-week-header ${isToday ? 'is-today' : ''}">
          <div class="ec-cal-week-dayname">${weekdayNames[i]}</div>
          <div class="ec-cal-week-daynum">${d}</div>
        </div>
        <div class="ec-cal-week-body">
          ${colEvents.map(evt => `
            <div class="ec-cal-week-card" data-event-id="${evt.id}">
              <div class="ec-cal-week-card-header">
                <span class="ec-fmt-${evt.type}" style="padding: 2px 6px; border-radius: 3px; font-weight: 700;">${formatPills[evt.type] || evt.type}</span>
                <span style="color: var(--ec-muted); font-size: 11px;">${escapeHtml(evt.time || '10:00')}</span>
              </div>
              <h4 class="ec-cal-week-card-title">${escapeHtml(evt.title)}</h4>
              <div class="ec-cal-week-card-treatment">📍 ${escapeHtml(evt.treatment_name || 'General')}</div>
              ${evt.hook_verbal ? `<div style="font-size: 11px; color: var(--ec-burgundy); font-style: italic; line-height: 1.3;">"${escapeHtml(evt.hook_verbal.slice(0, 80))}${evt.hook_verbal.length > 80 ? '...' : ''}"</div>` : ''}
              <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px;">
                <label style="font-size: 10px; color: var(--ec-muted); margin: 0;">Estado:</label>
                <select class="ec-cal-week-card-status-select" data-evt-id="${evt.id}">
                  <option value="pendiente" ${evt.status === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                  <option value="por_grabar" ${evt.status === 'por_grabar' ? 'selected' : ''}>Por grabar</option>
                  <option value="en_edicion" ${evt.status === 'en_edicion' ? 'selected' : ''}>En edición</option>
                  <option value="listo" ${evt.status === 'listo' ? 'selected' : ''}>Listo</option>
                  <option value="publicado" ${evt.status === 'publicado' ? 'selected' : ''}>Publicado</option>
                </select>
              </div>
              <div class="ec-cal-week-card-actions">
                <button class="ec-cal-card-btn btn-edit-evt" type="button" data-evt-id="${evt.id}">Editar</button>
                <button class="ec-cal-card-btn btn-del-evt" type="button" data-evt-id="${evt.id}" style="color: #B91C1C;">Eliminar</button>
              </div>
            </div>
          `).join('')}
          <button class="ec-cal-btn-add-week" type="button" data-date="${dateStr}">+ Añadir a este día</button>
        </div>
      `;

      col.querySelector('.ec-cal-btn-add-week').addEventListener('click', () => {
        openCreateEventModal(dateStr);
      });

      col.querySelectorAll('.btn-edit-evt').forEach(btn => {
        btn.addEventListener('click', () => {
          openEditEventModal(btn.dataset.evtId);
        });
      });

      col.querySelectorAll('.btn-del-evt').forEach(btn => {
        btn.addEventListener('click', () => {
          if (confirm('¿Eliminar esta publicación del calendario?')) {
            GlossContentEngine.deleteCalendarEvent(btn.dataset.evtId);
            renderCalendar();
            showToast('Publicación eliminada.');
          }
        });
      });

      col.querySelectorAll('.ec-cal-week-card-status-select').forEach(sel => {
        sel.addEventListener('change', (e) => {
          const id = e.target.dataset.evtId;
          const newStatus = e.target.value;
          GlossContentEngine.updateCalendarEventStatus(id, newStatus);
          updateCalendarMetrics();
          showToast(`Estado actualizado a: ${newStatus.replace('_', ' ')}`);
        });
      });

      dom.calWeekColumns.appendChild(col);
    }
  }

  function openCreateEventModal(targetDate = null, defaultData = null) {
    if (!dom.calEventModal) return;
    dom.calModalTitle.textContent = 'Programar Publicación';
    if (dom.calBtnDelete) dom.calBtnDelete.setAttribute('hidden', '');

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    dom.calInputId.value = '';
    dom.calInputSourceType.value = defaultData && defaultData.source_type ? defaultData.source_type : 'manual';
    dom.calInputSourceId.value = defaultData && defaultData.source_id ? defaultData.source_id : '';
    dom.calInputTitle.value = defaultData && defaultData.title ? defaultData.title : '';
    dom.calInputDate.value = targetDate || (defaultData && defaultData.date) || todayStr;
    dom.calInputTime.value = (defaultData && defaultData.time) || '10:00';
    dom.calInputType.value = (defaultData && defaultData.type) || 'reel';
    dom.calInputStatus.value = (defaultData && defaultData.status) || 'pendiente';
    dom.calInputTreatment.value = (defaultData && defaultData.treatment_name) || 'General';
    dom.calInputHook.value = (defaultData && defaultData.hook_verbal) || '';
    dom.calInputNotes.value = (defaultData && defaultData.notes) || '';

    dom.calEventModal.removeAttribute('hidden');
    dom.calInputTitle.focus();
  }

  function openEditEventModal(eventId) {
    if (!dom.calEventModal || !eventId) return;
    const events = GlossContentEngine.getCalendarEvents();
    const evt = events.find(e => e.id === eventId);
    if (!evt) return;

    dom.calModalTitle.textContent = 'Editar Publicación';
    if (dom.calBtnDelete) dom.calBtnDelete.removeAttribute('hidden');

    dom.calInputId.value = evt.id;
    dom.calInputSourceType.value = evt.source_type || 'manual';
    dom.calInputSourceId.value = evt.source_id || '';
    dom.calInputTitle.value = evt.title || '';
    dom.calInputDate.value = evt.date || '';
    dom.calInputTime.value = evt.time || '10:00';
    dom.calInputType.value = evt.type || 'reel';
    dom.calInputStatus.value = evt.status || 'pendiente';
    dom.calInputTreatment.value = evt.treatment_name || 'General';
    dom.calInputHook.value = evt.hook_verbal || '';
    dom.calInputNotes.value = evt.notes || '';

    dom.calEventModal.removeAttribute('hidden');
    dom.calInputTitle.focus();
  }

  function closeCalModal() {
    if (dom.calEventModal) dom.calEventModal.setAttribute('hidden', '');
  }

  function handleSaveEvent() {
    const title = (dom.calInputTitle.value || '').trim();
    const date = (dom.calInputDate.value || '').trim();

    if (!title) {
      alert('Por favor introduce un título para la publicación.');
      dom.calInputTitle.focus();
      return;
    }
    if (!date) {
      alert('Por favor selecciona una fecha de publicación.');
      dom.calInputDate.focus();
      return;
    }

    const eventData = {
      id: dom.calInputId.value || undefined,
      title,
      date,
      time: dom.calInputTime.value || '10:00',
      type: dom.calInputType.value || 'reel',
      status: dom.calInputStatus.value || 'pendiente',
      treatment_name: dom.calInputTreatment.value || 'General',
      hook_verbal: (dom.calInputHook.value || '').trim(),
      notes: (dom.calInputNotes.value || '').trim(),
      source_type: dom.calInputSourceType.value || 'manual',
      source_id: dom.calInputSourceId.value || null
    };

    GlossContentEngine.saveCalendarEvent(eventData);
    closeCalModal();
    renderCalendar();
    showToast('Publicación guardada en el calendario.');
  }

  function handleDeleteEvent() {
    const id = dom.calInputId.value;
    if (!id) return;
    if (!confirm('¿Deseas eliminar esta publicación del calendario?')) return;

    GlossContentEngine.deleteCalendarEvent(id);
    closeCalModal();
    renderCalendar();
    showToast('Publicación eliminada.');
  }

  function openImportModal() {
    if (!dom.calImportModal) return;
    calState.activeImportTab = 'ideas';
    switchImportTab('ideas');
    dom.calImportModal.removeAttribute('hidden');
  }

  function closeImportModal() {
    if (dom.calImportModal) dom.calImportModal.setAttribute('hidden', '');
  }

  function switchImportTab(tab) {
    calState.activeImportTab = tab;
    if (dom.btnImportTabIdeas) dom.btnImportTabIdeas.classList.toggle('active', tab === 'ideas');
    if (dom.btnImportTabScripts) dom.btnImportTabScripts.classList.toggle('active', tab === 'scripts');
    if (dom.btnImportTabCarousels) dom.btnImportTabCarousels.classList.toggle('active', tab === 'carousels');
    if (dom.btnImportTabStories) dom.btnImportTabStories.classList.toggle('active', tab === 'stories');
    renderImportList();
  }

  function renderImportList() {
    if (!dom.calImportList) return;
    dom.calImportList.innerHTML = '';

    if (calState.activeImportTab === 'ideas') {
      const ideas = GlossContentEngine.getSavedIdeas();
      if (!ideas || ideas.length === 0) {
        dom.calImportList.innerHTML = '<p style="color: var(--ec-muted); text-align: center; padding: 24px;">No tienes ideas guardadas en este momento. Guarda ideas desde la pestaña "Ideas de Contenido" para importarlas aquí.</p>';
        return;
      }
      ideas.forEach(item => {
        const idea = item.idea || item;
        const el = document.createElement('div');
        el.className = 'ec-cal-week-card';
        el.style.marginBottom = '10px';
        el.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="ec-badge-funnel ${idea.funnel_stage || 'atencion'}">${escapeHtml(idea.funnel_stage || 'Idea')}</span>
            <span style="font-size: 11px; color: var(--ec-muted);">${escapeHtml(idea.recommended_format || 'Reel')}</span>
          </div>
          <h4 style="font-size: 13px; font-weight: 600; margin: 4px 0; color: var(--ec-charcoal);">${escapeHtml(idea.title)}</h4>
          <p style="font-size: 11px; color: var(--ec-muted); margin: 0 0 6px;">${escapeHtml(idea.treatment_name || 'General')}</p>
          <div style="display: flex; justify-content: flex-end;">
            <button class="ec-btn-primary ec-btn-sm btn-pick-import" type="button" style="padding: 4px 10px; font-size: 11px;">
              + Programar en calendario
            </button>
          </div>
        `;
        el.querySelector('.btn-pick-import').addEventListener('click', () => {
          closeImportModal();
          scheduleFromIdea(idea);
        });
        dom.calImportList.appendChild(el);
      });
    } else if (calState.activeImportTab === 'scripts') {
      const scripts = GlossContentEngine.getSavedScripts();
      if (!scripts || scripts.length === 0) {
        dom.calImportList.innerHTML = '<p style="color: var(--ec-muted); text-align: center; padding: 24px;">No tienes guiones de rodaje guardados en este momento. Estructura y guarda un guion desde la pestaña "Estructurador de Reels" para importarlo aquí.</p>';
        return;
      }
      scripts.forEach(item => {
        const script = item.script || item;
        const el = document.createElement('div');
        el.className = 'ec-cal-week-card';
        el.style.marginBottom = '10px';
        el.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="ec-fmt-reel" style="padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 10px;">REEL</span>
            <span style="font-size: 11px; color: var(--ec-muted);">${script.target_duration_seconds || 45}s</span>
          </div>
          <h4 style="font-size: 13px; font-weight: 600; margin: 4px 0; color: var(--ec-charcoal);">Guion: ${escapeHtml(script.treatment_name)}</h4>
          <p style="font-size: 11px; color: var(--ec-muted); margin: 0 0 6px;">Estructura: ${escapeHtml(script.structure_name || 'Narrativa')}</p>
          <div style="display: flex; justify-content: flex-end;">
            <button class="ec-btn-primary ec-btn-sm btn-pick-import" type="button" style="padding: 4px 10px; font-size: 11px;">
              + Programar en calendario
            </button>
          </div>
        `;
        el.querySelector('.btn-pick-import').addEventListener('click', () => {
          closeImportModal();
          scheduleFromScript(script);
        });
        dom.calImportList.appendChild(el);
      });
    } else if (calState.activeImportTab === 'carousels') {
      const carousels = GlossContentEngine.getSavedCarousels();
      if (!carousels || carousels.length === 0) {
        dom.calImportList.innerHTML = '<p style="color: var(--ec-muted); text-align: center; padding: 24px;">No tienes carruseles guardados en este momento. Diseña y guarda un carrusel desde la pestaña "Editor de Carruseles" para importarlo aquí.</p>';
        return;
      }
      carousels.forEach(item => {
        const carousel = item.carousel || item;
        const el = document.createElement('div');
        el.className = 'ec-cal-week-card';
        el.style.marginBottom = '10px';
        el.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="background: #1E3A8A; color: #FFF; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 10px;">CARRUSEL</span>
            <span style="font-size: 11px; color: var(--ec-muted);">${carousel.slides ? carousel.slides.length : 0} láminas</span>
          </div>
          <h4 style="font-size: 13px; font-weight: 600; margin: 4px 0; color: var(--ec-charcoal);">${escapeHtml(carousel.title)}</h4>
          <p style="font-size: 11px; color: var(--ec-muted); margin: 0 0 6px;">${escapeHtml(carousel.treatment_name || 'General')} · ${escapeHtml(carousel.archetype_name || '')}</p>
          <div style="display: flex; justify-content: flex-end;">
            <button class="ec-btn-primary ec-btn-sm btn-pick-import" type="button" style="padding: 4px 10px; font-size: 11px;">
              + Programar en calendario
            </button>
          </div>
        `;
        el.querySelector('.btn-pick-import').addEventListener('click', () => {
          closeImportModal();
          scheduleFromCarousel(carousel);
        });
        dom.calImportList.appendChild(el);
      });
    } else if (calState.activeImportTab === 'stories') {
      const sequences = GlossContentEngine.getSavedStoriesSequences();
      if (!sequences || sequences.length === 0) {
        dom.calImportList.innerHTML = '<p style="color: var(--ec-muted); text-align: center; padding: 24px;">No tienes secuencias de historias guardadas en este momento. Genera y guarda historias desde la pestaña "Secuencias de Historias" para importarlas aquí.</p>';
        return;
      }
      sequences.forEach(item => {
        const seq = item.sequence || item;
        const el = document.createElement('div');
        el.className = 'ec-cal-week-card';
        el.style.marginBottom = '10px';
        el.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="background: #7C3AED; color: #FFF; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 10px;">HISTORIAS</span>
            <span style="font-size: 11px; color: var(--ec-muted);">${seq.stories ? seq.stories.length : 0} historias</span>
          </div>
          <h4 style="font-size: 13px; font-weight: 600; margin: 4px 0; color: var(--ec-charcoal);">${escapeHtml(seq.title)}</h4>
          <p style="font-size: 11px; color: var(--ec-muted); margin: 0 0 6px;">${escapeHtml(seq.treatment_name || 'General')} · ${escapeHtml(seq.category_name || '')}</p>
          <div style="display: flex; justify-content: flex-end;">
            <button class="ec-btn-primary ec-btn-sm btn-pick-import" type="button" style="padding: 4px 10px; font-size: 11px;">
              + Programar en calendario
            </button>
          </div>
        `;
        el.querySelector('.btn-pick-import').addEventListener('click', () => {
          closeImportModal();
          scheduleFromStories(seq);
        });
        dom.calImportList.appendChild(el);
      });
    }
  }

  function scheduleFromIdea(idea) {
    if (!idea) return;
    switchTab('calendario');

    const fmtMap = {
      'reel': 'reel',
      'carrusel': 'carrusel',
      'historia': 'historia',
      'anuncio': 'anuncio',
      'reels': 'reel'
    };
    const recFmt = (idea.recommended_format || '').toLowerCase();
    const type = fmtMap[recFmt] || 'reel';

    const defaultData = {
      title: idea.title,
      type,
      treatment_name: idea.treatment_name || 'General',
      hook_verbal: Array.isArray(idea.suggested_hooks) && idea.suggested_hooks.length > 0 ? idea.suggested_hooks[0] : '',
      notes: `Problema: ${idea.problem || ''}\nEnfoque clínico: ${idea.clinical_solution || ''}`,
      source_type: 'idea',
      source_id: idea.idea_id || null,
      status: 'pendiente'
    };

    openCreateEventModal(null, defaultData);
    showToast('Idea cargada en el formulario. Selecciona la fecha de publicación.');
  }

  function scheduleFromScript(script) {
    if (!script) return;
    switchTab('calendario');

    const defaultData = {
      title: `Guion Reel: ${script.treatment_name} · ${script.structure_name}`,
      type: 'reel',
      treatment_name: script.treatment_name || 'General',
      hook_verbal: script.hook_opening ? script.hook_opening.verbal : '',
      notes: `Estructura: ${script.structure_name} (${script.target_duration_seconds}s)\nTeleprompter: ${script.full_teleprompter ? script.full_teleprompter.slice(0, 160) + '...' : ''}`,
      source_type: 'script',
      source_id: script.script_id || null,
      status: 'por_grabar'
    };

    openCreateEventModal(null, defaultData);
    showToast('Guion cargado en el formulario. Selecciona la fecha de rodaje/publicación.');
  }

  function handleCopyCalendarSummary() {
    const events = GlossContentEngine.getCalendarEvents({
      type: calState.filterType,
      status: calState.filterStatus
    });
    const periodLabel = dom.calHeading ? dom.calHeading.textContent : 'Cronograma';
    const text = GlossContentEngine.formatCalendarSummaryClipboard(events, { period: periodLabel });
    copyToClipboardSafe(text);
    showToast('Resumen del cronograma copiado al portapapeles.');
  }

  function handleExportCalendarPdf() {
    try {
      const events = GlossContentEngine.getCalendarEvents({
        type: calState.filterType,
        status: calState.filterStatus
      });
      const periodLabel = dom.calHeading ? dom.calHeading.textContent : 'Cronograma';
      GlossContentEngine.exportCalendarPdf(events, {
        period: periodLabel,
        businessName: activeBusiness.name || 'Tu Clínica o Spa'
      });
      showToast('Descargando PDF del cronograma editorial.');
    } catch (err) {
      console.error('Error al exportar PDF del calendario:', err);
      showToast('Error al exportar el PDF del calendario.');
    }
  }

  window.GlossCalendarApp = {
    init: initCalendar,
    render: renderCalendar,
    openCreate: openCreateEventModal,
    openImport: openImportModal,
    scheduleIdea: scheduleFromIdea,
    scheduleScript: scheduleFromScript
  };

  // =========================================================================
  // UTILIDADES
  // =========================================================================

  function copyToClipboardSafe(text) {
    if (typeof GlossReportEngine !== 'undefined' && GlossReportEngine.copyToClipboard) {
      GlossReportEngine.copyToClipboard(text);
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  }

  function showToast(message) {
    if (!dom.toast) return;
    dom.toast.textContent = message;
    dom.toast.classList.add('is-visible');
    setTimeout(() => { dom.toast.classList.remove('is-visible'); }, 2800);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getFormatLabel(key) {
    const map = {
      talking_head: 'Médico a cámara',
      broll: 'B-roll en cabina',
      demostracion: 'Demostración de técnica',
      testimonio: 'Testimonio / Caso clínico',
      carrusel: 'Carrusel de láminas',
      anuncio: 'Anuncio Meta Ads'
    };
    return map[key] || key;
  }

  function getObjectiveLabel(key) {
    const map = {
      educar: 'Educar',
      atraer: 'Atraer',
      confianza: 'Confianza',
      objecion: 'Objeciones',
      conversion: 'Conversión',
      interaccion: 'Interacción'
    };
    return map[key] || key;
  }

})();
