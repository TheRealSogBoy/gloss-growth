/**
 * GLOSS & GROWTH — ESTUDIO DE CONTENIDO
 * Motor de Generación de Ganchos para Reels, Anuncios y Carruseles (v1.0.0)
 * 
 * Arquitectura: Determinística, combinatoria y local (sin llamadas externas).
 * Compatible con Node.js (CommonJS / ESM) y Navegadores (window.GlossContentEngine).
 * 
 * Pipeline:
 * 1. Intake de preferencias (Audiencia, Especialidad, Tratamiento, Objetivo, Formato, Intensidad, etc.)
 * 2. Filtrado y emparejamiento de tratamientos y temas clínicos/B2B
 * 3. Selección y scoring de familias editoriales y ganchos canónicos (hooks.json)
 * 4. Control de diversidad (máx 2 por familia, >=3 emociones, >=2 sintaxis, rotación sin repetición)
 * 5. Ensamblaje contextual de la Tríada (Visual 0-2s, Verbal hablado, Texto en pantalla seguro)
 * 6. Asignación de Estructura Narrativa (beats cronológicos) o Arquetipo de Carrusel (slides)
 * 7. Orientación editorial, cumplimiento regulatorio (REPS/INVIMA/Ley 711) y políticas Meta Ads
 * 8. Generación de CTA y formateadores de exportación (Portapapeles y PDF corporativo)
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.GlossContentEngine = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Almacén en memoria de las entidades de la biblioteca normalizada
  const library = {
    hooks: [],
    families: [],
    treatments: [],
    topics: [],
    narratives: { structures: [], objection_variant: null },
    carousels: { archetypes: [], slide_roles: [] },
    stories: { categories: [], structures: [], interactive_stickers: [] },
    rules: {},
    sources: [],
    manifest: null,
    isLoaded: false
  };

  /**
   * Carga la biblioteca de datos.
   * En Node.js: lee sincrónicamente los JSON de la ruta especificada.
   * En Navegador: realiza fetch paralelos desde la URL base relativa.
   */
  async function init(dataPathOrObjects = './data') {
    if (typeof dataPathOrObjects === 'object' && dataPathOrObjects !== null && dataPathOrObjects.hooks) {
      // Datos pasados directamente como objeto
      library.hooks = dataPathOrObjects.hooks || [];
      library.families = dataPathOrObjects.families || [];
      library.treatments = dataPathOrObjects.treatments || [];
      library.topics = dataPathOrObjects.topics || [];
      library.narratives = dataPathOrObjects.narratives || { structures: [] };
      library.carousels = dataPathOrObjects.carousels || { archetypes: [] };
      library.stories = dataPathOrObjects.stories || { categories: [], structures: [], interactive_stickers: [] };
      library.rules = dataPathOrObjects.rules || {};
      library.sources = dataPathOrObjects.sources || [];
      library.manifest = dataPathOrObjects.manifest || null;
      library.isLoaded = true;
      return true;
    }

    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      // Entorno Node.js
      const fs = require('fs');
      const path = require('path');
      const base = path.resolve(dataPathOrObjects);

      library.hooks = JSON.parse(fs.readFileSync(path.join(base, 'hooks.json'), 'utf8'));
      library.families = JSON.parse(fs.readFileSync(path.join(base, 'hook-families.json'), 'utf8'));
      library.treatments = JSON.parse(fs.readFileSync(path.join(base, 'treatments.json'), 'utf8'));
      library.topics = JSON.parse(fs.readFileSync(path.join(base, 'content-topics.json'), 'utf8'));
      library.narratives = JSON.parse(fs.readFileSync(path.join(base, 'narrative-structures.json'), 'utf8'));
      library.carousels = JSON.parse(fs.readFileSync(path.join(base, 'carousel-structures.json'), 'utf8'));
      try {
        library.stories = JSON.parse(fs.readFileSync(path.join(base, 'stories-structures.json'), 'utf8'));
      } catch (e) {
        library.stories = { categories: [], structures: [], interactive_stickers: [] };
      }
      library.rules = JSON.parse(fs.readFileSync(path.join(base, 'editorial-rules.json'), 'utf8'));
      library.sources = JSON.parse(fs.readFileSync(path.join(base, 'sources.json'), 'utf8'));
      try {
        library.manifest = JSON.parse(fs.readFileSync(path.join(base, 'manifest.json'), 'utf8'));
      } catch (e) {
        library.manifest = null;
      }
      library.isLoaded = true;
      return true;
    } else {
      // Entorno Navegador (fetch)
      const base = String(dataPathOrObjects).replace(/\/+$/, '');
      const files = [
        'hooks.json',
        'hook-families.json',
        'treatments.json',
        'content-topics.json',
        'narrative-structures.json',
        'carousel-structures.json',
        'editorial-rules.json',
        'sources.json',
        'manifest.json'
      ];

      const responses = await Promise.all(
        files.map(f => fetch(`${base}/${f}`).then(r => {
          if (!r.ok) throw new Error(`HTTP ${r.status} al cargar ${f}`);
          return r.json();
        }))
      );

      library.hooks = responses[0];
      library.families = responses[1];
      library.treatments = responses[2];
      library.topics = responses[3];
      library.narratives = responses[4];
      library.carousels = responses[5];
      library.rules = responses[6];
      library.sources = responses[7];
      library.manifest = responses[8];

      try {
        const sRes = await fetch(`${base}/stories-structures.json`);
        if (sRes.ok) {
          library.stories = await sRes.json();
        } else {
          library.stories = { categories: [], structures: [], interactive_stickers: [] };
        }
      } catch (e) {
        library.stories = { categories: [], structures: [], interactive_stickers: [] };
      }

      library.isLoaded = true;
      return true;
    }
  }

  // =========================================================================
  // SERVICIOS Y TEMAS B2B PARA GESTIÓN DE CLÍNICA
  // =========================================================================

  const B2B_SERVICES = [
    {
      id: 'gestion_rentabilidad_cabina',
      nombre_habitual: 'Rentabilidad por Cabina y Costos Ocultos',
      categoria: 'negocio_marketing',
      nombres_alternativos: ['Costos Ocultos en Cabina', 'Margen Real por Procedimiento'],
      descripcion_clinica: 'Auditoría financiera de costos fijos, insumos y tiempo muerto por procedimiento en cabina.',
      temas_tecnicos: 'costeo por hora, desperdicio de insumos y margen de contribución',
      cuidados_recuperacion: 'el margen neto operativo no baje del 30%',
      miedos: ['Erosión de márgenes por promociones descontroladas'],
      objeciones: ['Pensar que facturar más siempre significa ganar más'],
      procedimiento_medico: false
    },
    {
      id: 'punto_equilibrio_clinica',
      nombre_habitual: 'Punto de Equilibrio y Finanzas de la Clínica',
      categoria: 'negocio_marketing',
      nombres_alternativos: ['Punto de Equilibrio Operativo', 'Finanzas de Clínica Estética'],
      descripcion_clinica: 'Cálculo del volumen mínimo de tratamientos para cubrir costos fijos y nómina.',
      temas_tecnicos: 'punto de equilibrio en pesos y unidades, costo fijo diario de apertura',
      cuidados_recuperacion: 'cada cabina alcance su punto de equilibrio antes del día 18 del mes',
      miedos: ['Incapacidad para cubrir costos fijos en meses de baja demanda'],
      objeciones: ['No saber cuántos tratamientos diarios cubren los gastos de operación'],
      procedimiento_medico: false
    },
    {
      id: 'gestion_cancelaciones_agenda',
      nombre_habitual: 'Gestión de Inasistencias y Agenda Médica',
      categoria: 'negocio_marketing',
      nombres_alternativos: ['Control de No-Shows', 'Optimización de Agenda Médica'],
      descripcion_clinica: 'Protocolos de anticipos y confirmación para reducir inasistencias en consulta.',
      temas_tecnicos: 'tasa de cancelación (no-show rate), política de anticipos y sobreagendamiento inteligente',
      cuidados_recuperacion: 'la tasa de inasistencia se mantenga por debajo del 8%',
      miedos: ['Horas muertas en cabina y profesionales desocupados'],
      objeciones: ['Temor a que pedir anticipos ahuyente a los pacientes'],
      procedimiento_medico: false
    },
    {
      id: 'adquisicion_pacientes_cac',
      nombre_habitual: 'Costo de Adquisición de Pacientes y LTV',
      categoria: 'negocio_marketing',
      nombres_alternativos: ['CAC y LTV en Medicina Estética', 'Retención de Pacientes'],
      descripcion_clinica: 'Estrategia de retención y valor de vida del paciente (Customer Lifetime Value).',
      temas_tecnicos: 'ratio LTV/CAC, costo por lead calificado y tasa de recompra a 6 meses',
      cuidados_recuperacion: 'el LTV supere al menos en 3.5 veces el costo de adquisición publicitaria',
      miedos: ['Depender exclusivamente de pauta publicitaria cara sin pacientes recurrentes'],
      objeciones: ['Invertir en publicidad sin medir cuántos pacientes regresan por una segunda sesión'],
      procedimiento_medico: false
    }
  ];

  // =========================================================================
  // MÉTODOS DE CONSULTA Y FILTRADO DE LA BIBLIOTECA
  // =========================================================================

  function getTreatments(specialty = null, audience = 'paciente') {
    if (!library.isLoaded) throw new Error('GlossContentEngine no inicializado. Ejecuta init() primero.');
    let list = [...library.treatments, ...B2B_SERVICES];
    if (specialty && specialty !== 'todas') {
      list = list.filter(t => t.categoria === specialty);
    }
    return list;
  }

  function getTreatmentById(id) {
    if (!id || !library.isLoaded) return null;
    const clean = String(id).toLowerCase().trim().replace(/[-_]/g, '');
    const all = [...library.treatments, ...B2B_SERVICES];
    // 1. Direct ID match
    let found = all.find(t => t.id === id || t.id.toLowerCase() === id.toLowerCase());
    if (found) return found;
    // 2. Normalized alphanumeric match
    found = all.find(t => {
      const normId = t.id.toLowerCase().replace(/[-_]/g, '');
      return normId === clean || normId.includes(clean) || clean.includes(normId);
    });
    if (found) return found;
    // 3. Name or alternative name match
    found = all.find(t => {
      const hName = (t.nombre_habitual || '').toLowerCase().replace(/[-_]/g, '');
      if (hName.includes(clean) || clean.includes(hName)) return true;
      if (t.nombres_alternativos && Array.isArray(t.nombres_alternativos)) {
        return t.nombres_alternativos.some(a => {
          const aClean = a.toLowerCase().replace(/[-_]/g, '');
          return aClean.includes(clean) || clean.includes(aClean);
        });
      }
      return false;
    });
    if (found) return found;

    // 4. Fallback: match from library.topics
    const topicFound = library.topics.find(t => t.topic_id === id || t.treatment_id === id);
    if (topicFound) {
      return {
        id: topicFound.treatment_id || topicFound.topic_id,
        nombre_habitual: topicFound.audience === 'responsable_negocio' ? 'Gestión de Clínica y Rentabilidad' : (topicFound.problem || 'Procedimiento Estético'),
        categoria: topicFound.specialty || 'negocio_marketing',
        nombres_alternativos: ['Gestión de Cabina', 'Finanzas de Clínica'],
        descripcion_clinica: topicFound.value_proposition || 'Optimización operativa y financiera de la clínica estética.',
        temas_tecnicos: 'punto de equilibrio, costos por hora y retención de pacientes',
        cuidados_recuperacion: 'mantener los indicadores financieros dentro de rangos sostenibles',
        miedos: ['Desperdicio de agenda', 'Subestimar costos fijos'],
        objeciones: ['Pensar que los problemas operativos se resuelven solo vendiendo más'],
        procedimiento_medico: false
      };
    }
    return null;
  }

  function getTopics(filter = {}) {
    if (!library.isLoaded) throw new Error('GlossContentEngine no inicializado.');
    return library.topics.filter(t => {
      if (filter.audience && t.audience !== filter.audience) return false;
      if (filter.specialty && t.specialty !== filter.specialty) return false;
      if (filter.treatment_id && t.treatment_id !== filter.treatment_id) return false;
      if (filter.objective && t.objective !== filter.objective) return false;
      if (filter.angle && t.angle !== filter.angle) return false;
      return true;
    });
  }

  function getFamilies() {
    return library.families;
  }

  function getNarrativeStructures() {
    return library.narratives.structures || [];
  }

  function getCarouselArchetypes() {
    return library.carousels.archetypes || [];
  }

  // =========================================================================
  // MATRIZ DE COMPATIBILIDAD OBJETIVO -> FAMILIAS EDITORIALES
  // =========================================================================

  const OBJECTIVE_FAMILY_AFFINITY = {
    educar: ['GAP', 'UTIL', 'DEMO', 'NEG', 'COMP', 'ENEM', 'AUTO'],
    atraer: ['GAP', 'ASP', 'INTER', 'CONTRA', 'EFF', 'EXP', 'STORY'],
    confianza: ['AUTO', 'PROOF', 'DEMO', 'UTIL', 'STORY', 'NEG', 'COMP'],
    objecion: ['CONTRA', 'ENEM', 'EXP', 'NEG', 'COMP', 'AUTO', 'PROOF'],
    conversion: ['AUT', 'FOMO', 'EFF', 'PROOF', 'UTIL', 'NEG', 'DEMO'],
    interaccion: ['INTER', 'CONTRA', 'EXP', 'COMP', 'GAP', 'ASP']
  };

  const FORMAT_FAMILY_AFFINITY = {
    talking_head: ['AUTO', 'NEG', 'GAP', 'CONTRA', 'ENEM', 'COMP', 'AUT', 'PROOF', 'UTIL', 'STORY', 'FOMO', 'EXP', 'INTER', 'EFF', 'ASP'],
    broll: ['DEMO', 'ASP', 'EFF', 'UTIL', 'GAP', 'EXP', 'CONTRA', 'STORY'],
    demostracion: ['DEMO', 'COMP', 'UTIL', 'PROOF', 'EXP', 'NEG', 'AUTO'],
    testimonio: ['PROOF', 'STORY', 'AUTO', 'EFF', 'EXP', 'CONTRA'],
    carrusel: ['UTIL', 'NEG', 'COMP', 'EXP', 'GAP', 'AUTO', 'ENEM', 'INTER', 'PROOF'],
    anuncio: ['AUT', 'EFF', 'UTIL', 'PROOF', 'DEMO', 'GAP', 'CONTRA', 'AUTO']
  };

  // Patrones de sincronía según las reglas canónicas
  const SYNCHRONIZATION_PATTERNS = [
    'Complementario',
    'Pregunta visual + Respuesta verbal',
    'Contraste / Ironía',
    'Demostración en vivo + Pregunta abierta',
    'Desempaque o acción física inmediata'
  ];

  // =========================================================================
  // GENERADOR DETERMINÍSTICO DE GANCHOS (FASE 2)
  // =========================================================================

  /**
   * Genera un lote de propuestas de ganchos estructurados y adaptados al formato.
   * @param {Object} options Parámetros de generación según data-contract.json
   * @param {Array<string>} [previousBatchIds] IDs del lote anterior inmediato para forzar rotación sin repetición
   * @returns {Object} { metadata, items, stats }
   */
  function generate(options = {}, previousBatchIds = []) {
    if (!library.isLoaded) {
      throw new Error('GlossContentEngine no inicializado. Llama a GlossContentEngine.init() primero.');
    }

    // 1. Normalización y defaults de opciones
    const audience = options.audience || 'paciente';
    const specialty = options.specialty || (audience === 'responsable_negocio' ? 'negocio_marketing' : 'medicina_estetica');
    const objective = options.objective || 'educar';
    const format = options.format || 'talking_head';
    const platform = options.platform || (format === 'carrusel' ? 'carrusel_feed' : (format === 'anuncio' ? 'meta_ads' : 'instagram_reels'));
    const intensity = Math.max(1, Math.min(5, parseInt(options.intensity || 3, 10)));
    const style = options.style || 'Clínico y prudente';
    const requestedCount = options.count === 5 ? 5 : 8;
    const requestedTreatmentId = options.treatment_id || null;
    const requestedTopicId = options.topic_id || null;
    const requestedAngle = options.angle || null;
    const availableAssets = Array.isArray(options.available_assets) && options.available_assets.length > 0
      ? options.available_assets
      : ['medico_camara', 'broll_cabina', 'viales_producto', 'esquemas_pizarra'];

    // 2. Resolver Tratamiento
    let treatment = null;
    if (requestedTreatmentId) {
      treatment = getTreatmentById(requestedTreatmentId);
    }
    if (!treatment && audience === 'paciente') {
      const candidates = getTreatments(specialty);
      if (candidates.length > 0) {
        treatment = candidates[0];
      }
    }

    // 3. Resolver o filtrar Temas compatibles
    let matchedTopics = [];
    if (requestedTopicId) {
      const explicit = library.topics.find(t => t.topic_id === requestedTopicId);
      if (explicit) matchedTopics.push(explicit);
    }
    if (matchedTopics.length === 0) {
      matchedTopics = library.topics.filter(t => {
        if (t.audience !== audience) return false;
        if (treatment && t.treatment_id === treatment.id) return true;
        if (t.specialty === specialty) return true;
        return false;
      });
    }
    // Si aún está vacío, usar todos los de la audiencia
    if (matchedTopics.length === 0) {
      matchedTopics = library.topics.filter(t => t.audience === audience);
    }

    // 4. Seleccionar Familias afines al Objetivo y Formato
    const targetFamilies = (OBJECTIVE_FAMILY_AFFINITY[objective] || ['GAP', 'NEG', 'UTIL'])
      .filter(f => (FORMAT_FAMILY_AFFINITY[format] || []).includes(f));
    const allowedFamilies = targetFamilies.length >= 3 ? targetFamilies : (OBJECTIVE_FAMILY_AFFINITY[objective] || ['GAP', 'NEG', 'UTIL']);

    // 5. Filtrar Hooks disponibles de hooks.json
    const previousSet = new Set(Array.isArray(previousBatchIds) ? previousBatchIds : []);
    let eligibleHooks = library.hooks.filter(h => {
      // Si format es anuncio, evitar ganchos con interpelaciones negativas agresivas a defectos físicos
      if (format === 'anuncio') {
        const txt = (h.hook_original || '').toLowerCase();
        if (txt.includes('odias') || txt.includes('avergonzado') || txt.includes('complejo') || txt.includes('gordo') || txt.includes('arrugas')) {
          return false;
        }
      }
      return true;
    });

    // Dividir en los que no estaban en previousSet para rotación
    let unspentHooks = eligibleHooks.filter(h => !previousSet.has(h.id));
    if (unspentHooks.length < requestedCount) {
      unspentHooks = eligibleHooks; // Reset si la piscina se agota
    }

    // 6. Selección con estricto Control de Diversidad
    // Reglas:
    // - Máx 2 hooks por familia en lote de 8 (máx 1 en lote de 5)
    // - Mínimo 3 emociones distintas
    // - Mínimo 2 formas sintácticas distintas
    const maxPerFamily = requestedCount === 5 ? 1 : 2;
    const selectedHooks = [];
    const familyCounts = {};
    const usedEmotions = new Set();
    const usedSyntax = new Set();

    // Función de afinidad / scoring
    function scoreHook(h) {
      let score = 0;
      if (allowedFamilies.includes(h.familia_principal)) score += 5;
      if ((h.formatos_recomendados || []).includes(format)) score += 4;
      if (Math.abs((h.intensidad_sugerida || 3) - intensity) <= 1) score += 3;
      if (requestedAngle && h.aplicaciones_recomendadas && h.aplicaciones_recomendadas.some(a => a.includes(requestedAngle))) score += 2;
      return score;
    }

    // Ordenar hooks según afinidad con un toque pseudo-determinístico de dispersión
    const scoredPool = unspentHooks
      .map((h, idx) => ({ hook: h, score: scoreHook(h), randKey: (idx * 17 + intensity * 13) % 100 }))
      .sort((a, b) => (b.score - a.score) || (a.randKey - b.randKey));

    for (const item of scoredPool) {
      if (selectedHooks.length >= requestedCount) break;
      const h = item.hook;
      const fam = h.familia_principal;
      const curCount = familyCounts[fam] || 0;

      if (curCount >= maxPerFamily) continue;

      // Priorizar diversidad emocional en los primeros 4
      if (selectedHooks.length < 3 && usedEmotions.has(h.emocion_principal) && scoredPool.some(other => !selectedHooks.includes(other.hook) && !usedEmotions.has(other.hook.emocion_principal))) {
        continue;
      }

      selectedHooks.push(h);
      familyCounts[fam] = curCount + 1;
      usedEmotions.add(h.emocion_principal);
      usedSyntax.add(h.forma_sintactica);
    }

    // Si aún faltan para completar count (por filtros muy estrictos), completar con los mejores disponibles
    if (selectedHooks.length < requestedCount) {
      for (const item of scoredPool) {
        if (selectedHooks.length >= requestedCount) break;
        if (!selectedHooks.includes(item.hook)) {
          selectedHooks.push(item.hook);
          familyCounts[item.hook.familia_principal] = (familyCounts[item.hook.familia_principal] || 0) + 1;
          usedEmotions.add(item.hook.emocion_principal);
          usedSyntax.add(item.hook.forma_sintactica);
        }
      }
    }

    // 7. Contextualizar cada propuesta
    const generatedItems = selectedHooks.map((hook, index) => {
      // Rotar tema entre los compatibles para variar los ángulos de cada tarjeta
      const topic = matchedTopics[index % matchedTopics.length] || matchedTopics[0] || null;
      return assembleProposal({
        hook,
        treatment,
        topic,
        audience,
        specialty,
        objective,
        format,
        platform,
        intensity,
        style,
        availableAssets,
        proposalIndex: index + 1
      });
    });

    return {
      metadata: {
        audience,
        specialty,
        treatment_id: treatment ? treatment.id : null,
        treatment_name: treatment ? treatment.nombre_habitual : (audience === 'responsable_negocio' ? 'Gestión y Rentabilidad de Clínica' : 'Consulta Estética'),
        objective,
        format,
        platform,
        intensity,
        style,
        generated_count: generatedItems.length,
        timestamp: new Date().toISOString()
      },
      items: generatedItems,
      stats: {
        unique_families: Object.keys(familyCounts).length,
        unique_emotions: usedEmotions.size,
        unique_syntax: usedSyntax.size,
        family_breakdown: familyCounts
      }
    };
  }

  // =========================================================================
  // ENSAMBLAJE CONTEXTUAL DE CADA PROPUESTA
  // =========================================================================

  function assembleProposal(ctx) {
    const { hook, treatment, topic, audience, specialty, objective, format, platform, intensity, style, availableAssets, proposalIndex } = ctx;

    const resultId = `GG-EC-${Date.now().toString(36).toUpperCase()}-${proposalIndex.toString().padStart(2, '0')}`;
    const treatmentName = treatment ? treatment.nombre_habitual : (topic && topic.value_proposition ? 'tu clínica' : 'tu tratamiento estético');

    // 1. Tríada de Gancho: Visual (0-2s), Verbal (Hablado), Textual (Pantalla)
    const triad = buildTriad(hook, treatment, topic, format, availableAssets, intensity, audience);

    // 2. Estructura Narrativa o Secuencia de Carrusel
    let narrativePlan = null;
    let carouselPlan = null;

    if (format === 'carrusel') {
      carouselPlan = buildCarouselPlan(hook, treatment, topic, objective, intensity);
    } else {
      narrativePlan = buildNarrativePlan(hook, treatment, topic, format, intensity);
    }

    // 3. Orientación Editorial y Advertencia Regulatoria
    const editorialGuidance = buildEditorialGuidance(hook, treatment, topic, format, intensity);

    // 4. Llamado a la Acción (CTA)
    const cta = buildCta(objective, audience, format, treatment);

    // 5. Cumplimiento publicitario para Meta Ads
    const adCompliance = format === 'anuncio' ? {
      is_compliant: true,
      policy: 'Meta Health & Personal Appearance Policy',
      check_note: 'Enfoque centrado en educación, valor anatómico y servicio clínico sin atributos personales negativos.'
    } : null;

    return {
      result_id: resultId,
      source_hook_id: hook.id,
      family: {
        code: hook.familia_principal,
        name: getFamilyName(hook.familia_principal),
        mechanism: hook.mecanismo_curado || hook.mecanismo_original
      },
      syntactic_form: hook.forma_sintactica,
      primary_emotion: hook.emocion_principal,
      intensity,
      pipeline_trace: {
        treatment_id: treatment ? treatment.id : null,
        topic_id: topic ? topic.topic_id : null,
        angle: topic ? topic.angle : (hook.aplicaciones_recomendadas ? hook.aplicaciones_recomendadas[0] : 'educacion'),
        family_id: hook.familia_principal,
        source_hook_id: hook.id,
        structure_id: narrativePlan ? narrativePlan.structure_id : (carouselPlan ? carouselPlan.archetype_id : null)
      },
      hook_original: hook.hook_original,
      hook_triad: triad,
      narrative_plan: narrativePlan,
      carousel_plan: carouselPlan,
      editorial_guidance: editorialGuidance,
      cta,
      ad_compliance: adCompliance
    };
  }

  // =========================================================================
  // CONSTRUCCIÓN DE LA TRÍADA (Visual, Verbal, Textual)
  // =========================================================================

  function buildTriad(hook, treatment, topic, format, availableAssets, intensity, audience) {
    const rawTemplate = hook.hook_original || '';
    const treatmentName = treatment ? treatment.nombre_habitual : 'tu servicio estético';
    const shortName = treatment ? (treatment.nombres_alternativos && treatment.nombres_alternativos[0] ? treatment.nombres_alternativos[0] : treatment.nombre_habitual) : 'tratamiento';
    const problem = topic && topic.problem ? topic.problem : (treatment && treatment.objeciones ? treatment.objeciones[0] : 'malas técnicas de aplicación');
    const valueProp = topic && topic.value_proposition ? topic.value_proposition : (treatment && treatment.descripcion_clinica ? treatment.descripcion_clinica : 'evaluación profesional');

    // Contextualización del Gancho Verbal (Hablado 0-3s)
    let verbal = contextualizeTemplate(rawTemplate, treatment, topic, hook, audience, intensity, format);

    // Texto en pantalla (Breve, de alto impacto, zona segura central)
    let textual = buildScreenText(hook, treatment, topic, intensity, audience, format);

    // Escena Visual (0-2s) según recursos y formato
    let visual = buildVisualScene(hook, treatment, format, availableAssets, audience);

    // Patrón de sincronía
    const syncIndex = (hook.source_row || 1) % SYNCHRONIZATION_PATTERNS.length;
    const syncPattern = SYNCHRONIZATION_PATTERNS[syncIndex];

    // Activos visuales requeridos
    const assetsNeeded = [];
    if (availableAssets.includes('medico_camara') && (format === 'talking_head' || format === 'demostracion')) {
      assetsNeeded.push('Profesional con bata clínica / uniforme de cabina');
    }
    if (availableAssets.includes('broll_cabina')) {
      assetsNeeded.push('Toma de cabina iluminada con paciente o instrumento');
    }
    if (availableAssets.includes('viales_producto') && treatment && treatment.procedimiento_medico) {
      assetsNeeded.push('Vial o jeringa de producto original con sello Invima visible');
    }
    if (availableAssets.includes('esquemas_pizarra')) {
      assetsNeeded.push('Esquema anatómico, iPad o modelo didáctico de la zona');
    }

    return {
      visual,
      verbal,
      textual,
      synchronization_pattern: syncPattern,
      visual_assets_needed: assetsNeeded.length > 0 ? assetsNeeded : ['Plano medio del profesional en cabina']
    };
  }

  /**
   * Rellena inteligentemente la plantilla del hook con terminología y sintaxis natural
   */
  function contextualizeTemplate(template, treatment, topic, hook, audience, intensity, format) {
    let t = template.trim();
    const tName = treatment ? treatment.nombre_habitual : 'tu clínica';
    const sName = treatment ? (treatment.nombres_alternativos && treatment.nombres_alternativos[0] ? treatment.nombres_alternativos[0] : treatment.nombre_habitual) : 'procedimiento';
    const prob = topic && topic.problem ? cleanText(topic.problem) : (treatment && treatment.miedos ? treatment.miedos[0] : 'resultados artificiales');
    const doubt = treatment && treatment.dudas_frecuentes ? treatment.dudas_frecuentes[0] : 'cuánto dura el efecto real';
    const diff = treatment && treatment.diferencias_clave ? treatment.diferencias_clave : 'la técnica y profundidad correcta';

    // Manejo especial para Anuncios Meta Ads (evitar señalamientos personales en 2da persona)
    if (format === 'anuncio') {
      if (t.toLowerCase().startsWith('¿cansado de') || t.toLowerCase().startsWith('si odias') || t.toLowerCase().startsWith('no cometas')) {
        return `Antes de realizarte ${tName}, este es el criterio médico para evitar ${prob.toLowerCase()} y asegurar un resultado armónico.`;
      }
    }

    // Reemplazo de slots semánticos entre corchetes
    t = t.replace(/\[hobby\]/gi, treatment ? sName : 'gestión estética');
    t = t.replace(/\[problema común\]/gi, prob);
    t = t.replace(/\[problema\]/gi, prob);
    t = t.replace(/\[tema popular\]/gi, tName);
    t = t.replace(/\[tema controvertido en tu nicho\]/gi, `${tName} y el riesgo de ${prob}`);
    t = t.replace(/\[lograr un objetivo\]/gi, `obtener un resultado natural con ${tName}`);
    t = t.replace(/\[opción A\]/gi, treatment && treatment.nombres_alternativos ? treatment.nombres_alternativos[0] : 'técnica con aguja');
    t = t.replace(/\[opción B\]/gi, 'técnica con microcánula');
    t = t.replace(/\[hábito nocivo\]/gi, 'buscar precios de remate en inyectables');
    t = t.replace(/\[situación frustrante\]/gi, `ver que el efecto de ${tName} se desvanece antes de tiempo`);
    t = t.replace(/\[grupo específico\]/gi, audience === 'responsable_negocio' ? 'directores de clínica' : `pacientes que buscan ${tName}`);
    t = t.replace(/\[creencia limitante\]/gi, `creer que ${tName} siempre deja aspecto acartonado`);
    t = t.replace(/\[resultado extraordinario\]/gi, 'un perfil armónico sin entrar a quirófano');
    t = t.replace(/\[cosa aparentemente inútil\]/gi, 'este detalle milimétrico en la consulta previa');
    t = t.replace(/\[producto\/entorno\]/gi, treatment ? sName : 'cabina y protocolos');
    t = t.replace(/\[nicho\]/gi, 'medicina estética y bienestar');
    t = t.replace(/\[industria\]/gi, 'estética profesional');

    // Reemplazo genérico para cualquier slot residual entre corchetes
    t = t.replace(/\[(.*?)\]/g, (match, slot) => {
      const s = slot.toLowerCase();
      if (s.includes('producto') || s.includes('tratamiento') || s.includes('servicio')) return sName;
      if (s.includes('problema') || s.includes('error') || s.includes('falla')) return prob;
      if (s.includes('tiempo') || s.includes('dia') || s.includes('hora')) return 'las primeras 48 horas';
      if (s.includes('resultado') || s.includes('cambio') || s.includes('efecto')) return 'un resultado natural';
      if (s.includes('paciente') || s.includes('cliente') || s.includes('persona')) return 'tus pacientes';
      if (s.includes('clinica') || s.includes('negocio') || s.includes('spa')) return 'tu centro';
      return treatment ? sName : 'este procedimiento';
    });

    // Completar puntos suspensivos ("...") sin importar puntuación final (?, !, etc.) o posición intermedia
    if (t.includes('...')) {
      const fam = hook.familia_principal;
      let completion = '';

      if (audience === 'responsable_negocio') {
        if (fam === 'NEG') completion = 'calcular el costo de tu cabina: no incluir el tiempo muerto entre pacientes';
        else if (fam === 'GAP') completion = 'la rentabilidad real de tu aparatología: el costo por disparo que casi nadie mide';
        else if (fam === 'AUTO') completion = 'dirigir una clínica estética con margen neto superior al 35%';
        else if (fam === 'UTIL') completion = 'auditar los gastos de insumos y nómina por procedimiento';
        else completion = 'maximizar el retorno de inversión de cada cabina';
      } else {
        if (fam === 'NEG') {
          completion = `realizarte ${tName}: creer que cualquier profesional puede aplicarlo sin mapeo anatómico`;
        } else if (fam === 'GAP') {
          completion = `${tName}: por qué el secreto no es la cantidad de producto, sino el plano exacto de inyección`;
        } else if (fam === 'CONTRA') {
          completion = `${tName}: parece un cambio radical, pero la verdadera técnica busca que nadie note qué te hiciste`;
        } else if (fam === 'ENEM') {
          completion = `${tName}: el mito de que te dejará la cara congelada o inflamada de por vida`;
        } else if (fam === 'DEMO') {
          completion = `cómo se evalúa la simetría antes de aplicar ${tName} en cabina`;
        } else if (fam === 'COMP') {
          completion = `${tName} frente a otras alternativas tradicionales`;
        } else if (fam === 'AUTO') {
          completion = `cómo verificar que el producto de tu ${tName} es 100% original con registro Invima`;
        } else if (fam === 'UTIL') {
          completion = `los 3 cuidados esenciales en las primeras 24 horas tras tu ${tName}`;
        } else if (fam === 'FOMO') {
          completion = `agendar tu valoración antes de que las arrugas dinámicas se vuelvan estáticas`;
        } else if (fam === 'EXP') {
          completion = `lo que ves en redes sociales versus la recuperación médica real de ${tName}`;
        } else {
          completion = `lograr resultados armónicos con ${tName}`;
        }
      }

      if (t.includes('...?')) {
        t = t.replace('...?', ` ${completion}?`);
      } else if (t.includes('...!')) {
        t = t.replace('...!', ` ${completion}!`);
      } else if (t.endsWith('...')) {
        t = t.replace(/\.\.\.$/, `: ${completion}.`);
      } else {
        t = t.replace('...', ` ${completion}`);
      }
    }

    // Adaptación según intensidad (1: sosegado/clínico, 5: confrontativo/alerta)
    if (intensity === 1 && t.includes('¡')) {
      t = t.replace(/[¡!]/g, '');
    } else if (intensity === 5 && !t.includes('alerta') && !t.includes('cuidado') && !t.includes('peligro')) {
      t = `Atención con esto: ${t}`;
    }

    return t;
  }

  function buildScreenText(hook, treatment, topic, intensity, audience, format) {
    const tName = treatment ? (treatment.nombres_alternativos && treatment.nombres_alternativos[0] ? treatment.nombres_alternativos[0] : treatment.nombre_habitual) : 'ESTÉTICA';
    const fam = hook.familia_principal;

    if (audience === 'responsable_negocio') {
      if (fam === 'NEG') return 'EL ERROR QUE ARRUINA EL MARGEN';
      if (fam === 'GAP') return 'EL COSTO OCULTO POR CABINA';
      if (fam === 'UTIL') return '3 MÉTRICAS QUE TU CLÍNICA DEBE MEDIR';
      return 'RENTABILIDAD REAL EN ESTÉTICA';
    }

    if (format === 'anuncio') {
      return `CLAVES MÉDICAS EN ${tName.toUpperCase()}`;
    }

    if (fam === 'NEG') return `EL ERROR MÁS COMÚN EN ${tName.toUpperCase()}`;
    if (fam === 'GAP') return `LO QUE CASI NADIE TE CUENTA DE ${tName.toUpperCase()}`;
    if (fam === 'CONTRA') return `MITO VS REALIDAD: ${tName.toUpperCase()}`;
    if (fam === 'AUTO') return `CÓMO VERIFICAR TU ${tName.toUpperCase()}`;
    if (fam === 'UTIL') return `GUÍA ANTES DE TU ${tName.toUpperCase()}`;
    if (fam === 'DEMO') return `ASÍ SE REALIZA: ${tName.toUpperCase()}`;
    if (fam === 'COMP') return `¿CUÁL ES MEJOR PARA TU CASO?`;
    if (fam === 'EXP') return `EXPECTATIVA VS RESULTADO REAL`;
    if (fam === 'INTER') return `¿TE HARÍAS ESTE PROCEDIMIENTO?`;

    return `${tName.toUpperCase()}: LO QUE DEBES SABER`;
  }

  function buildVisualScene(hook, treatment, format, availableAssets, audience) {
    const fam = hook.familia_principal;
    const tName = treatment ? treatment.nombre_habitual : 'cabina';

    if (audience === 'responsable_negocio') {
      return 'Plano cerrado de una pantalla con hoja de cálculo o software de clínica mostrando el costo de insumos versus facturación por hora.';
    }

    if (format === 'broll') {
      return `Toma cinemática en cámara lenta (0-2s) mostrando la textura del producto o el cabezal del equipo deslizándose suavemente sobre la piel limpia en cabina.`;
    }

    if (format === 'demostracion') {
      return `Profesional con guantes estériles realizando el trazo anatómico guía con lápiz dérmico sobre la piel del paciente en plano medio cerrado.`;
    }

    if (availableAssets.includes('viales_producto') && (fam === 'AUTO' || fam === 'PROOF')) {
      return `Primer plano del profesional girando el vial original sellado frente a la cámara para mostrar el holograma de seguridad del fabricante.`;
    }

    if (availableAssets.includes('esquemas_pizarra') && (fam === 'GAP' || fam === 'NEG')) {
      return `Profesional señalando con puntero en un iPad o esquema anatómico la capa muscular o vascular exacta de ${tName}.`;
    }

    // Default talking head
    return `Plano medio del profesional en bata clínica, mirada firme a cámara con iluminación difusa, haciendo un gesto enfático con las manos en 0-2s.`;
  }

  // =========================================================================
  // CONSTRUCCIÓN DEL PLAN NARRATIVO DE VIDEO (Beats cronológicos)
  // =========================================================================

  function buildNarrativePlan(hook, treatment, topic, format, intensity) {
    const structures = library.narratives.structures || [];
    // Buscar estructura compatible
    let targetId = (hook.narrativas_compatibles && hook.narrativas_compatibles[0]) || 'problema_invisible';
    let struct = structures.find(s => s.id === targetId) || structures[0] || {
      id: 'problema_invisible',
      nombre: 'Problema Invisible',
      pasos: []
    };

    const tName = treatment ? treatment.nombre_habitual : 'el tratamiento';
    const prob = topic && topic.problem ? topic.problem : 'el riesgo de una mala técnica';
    const valueProp = topic && topic.value_proposition ? topic.value_proposition : 'un protocolo seguro y personalizado';
    const technical = treatment && treatment.temas_tecnicos ? treatment.temas_tecnicos : 'anatomía y dosificación';
    const solution = treatment && treatment.descripcion_clinica ? treatment.descripcion_clinica : 'procedimiento clínico';

    // Generar beats cronológicos adaptados
    const beats = (struct.pasos || []).map((step, idx) => {
      let verbalCue = step.indicacion_verbal || '';
      let visualCue = step.indicacion_visual || '';

      if (idx === 0) {
        verbalCue = `Gancho inicial directo: enunciar la premisa sobre ${tName}.`;
        visualCue = 'Contacto visual a cámara con plano medio dinámico.';
      } else if (idx === 1) {
        verbalCue = `Exponer el problema visible: ${prob}.`;
        visualCue = 'B-roll en cabina mostrando el detalle anatómico o el instrumento.';
      } else if (idx === 2) {
        verbalCue = `Revelar la variable que casi nadie explica: ${technical}.`;
        visualCue = 'Apoyo visual en esquema anatómico o vial de producto.';
      } else if (idx === 3) {
        verbalCue = `Solución y criterio médico: ${valueProp}.`;
        visualCue = 'Profesional explicando con calma la técnica de aplicación.';
      } else {
        verbalCue = 'Llamado a la acción contextual sin presión agresiva.';
        visualCue = 'Texto inferior con invitación a consulta de valoración.';
      }

      return {
        order: step.orden || (idx + 1),
        role: step.nombre_paso || `Paso ${idx + 1}`,
        duration: step.duracion_segundos || `${idx * 15}-${(idx + 1) * 15}s`,
        purpose: step.proposito_editorial || 'Avanzar en el argumento de valor',
        visual_cue: visualCue,
        verbal_cue: verbalCue
      };
    });

    return {
      structure_id: struct.id,
      structure_name: struct.nombre,
      estimated_duration_seconds: struct.duracion_estimada_segundos || { min: 40, max: 60 },
      beats
    };
  }

  // =========================================================================
  // CONSTRUCCIÓN DEL PLAN DE CARRUSEL (Slides temáticas)
  // =========================================================================

  function buildCarouselPlan(hook, treatment, topic, objective, intensity) {
    const archetypes = library.carousels.archetypes || [];
    let arch = null;

    if (objective === 'objecion' || hook.familia_principal === 'CONTRA' || hook.familia_principal === 'ENEM') {
      arch = archetypes.find(a => a.id === 'SPLIT_VERSUS');
    } else if (objective === 'interaccion' || hook.familia_principal === 'INTER') {
      arch = archetypes.find(a => a.id === 'INTERACTIVE_TEST');
    } else if (objective === 'confianza' || hook.familia_principal === 'AUTO' || hook.familia_principal === 'PROOF') {
      arch = archetypes.find(a => a.id === 'NEWS');
    } else if (objective === 'educar' || hook.familia_principal === 'UTIL') {
      arch = archetypes.find(a => a.id === 'RESOURCE_LIST') || archetypes.find(a => a.id === 'TYPES_OF_X');
    } else if (objective === 'atraer' || hook.familia_principal === 'ASP' || hook.familia_principal === 'STORY') {
      arch = archetypes.find(a => a.id === 'JOURNAL') || archetypes.find(a => a.id === 'CARTOON');
    }

    if (!arch) arch = archetypes.find(a => a.id === 'TYPES_OF_X') || archetypes[0] || { id: 'TYPES_OF_X', nombre: 'Tipos de X / Clasificación', secuencia_roles: [] };

    const tName = treatment ? treatment.nombre_habitual : 'tu tratamiento estético';
    const prob = topic && topic.problem ? topic.problem : 'las complicaciones por mala praxis';
    const valueProp = topic && topic.value_proposition ? topic.value_proposition : 'el criterio profesional';
    const doubts = treatment && treatment.dudas_frecuentes ? treatment.dudas_frecuentes : ['¿Cuánto dura el resultado?', '¿Es doloroso?'];

    const microHooks = arch.micro_hooks_deslizamiento || [
      'Desliza para ver la explicación médica completa',
      'El detalle que nadie te explica en la siguiente lámina',
      'Guarda este carrusel antes de tu próxima cita'
    ];

    const slides = (arch.secuencia_roles || []).map((sr, idx) => {
      let title = '';
      let copyText = '';
      let visualGuide = '';

      if (sr.role === 'PORTADA') {
        title = contextualizeTemplate(hook.hook_original, treatment, topic, hook, 'paciente', intensity, 'carrusel');
        copyText = 'Lo que necesitas verificar antes de decidirte. Criterio técnico y profesional.';
        visualGuide = 'Tipografía de alto contraste sobre fondo editorial limpio, con micro-hook de deslizamiento visible.';
      } else if (sr.role === 'SEGUNDO_GANCHO') {
        title = '¿Por qué esto te afecta directamente?';
        copyText = `Si estás considerando ${tName}, ignorar este detalle puede traducirse en ${prob.toLowerCase()}.`;
        visualGuide = 'Iconografía médica sutil o gráfico esquemático del área tratada.';
      } else if (sr.role === 'DESARROLLO') {
        const doubtIdx = idx % doubts.length;
        title = `Clave ${idx - 1}: ${doubts[doubtIdx] || 'Técnica y seguridad'}`;
        copyText = `En una aplicación responsable se evalúa la anatomía individual: ${valueProp}.`;
        visualGuide = 'Foto de instrumental limpio o esquema anatómico sin sangre ni deformaciones.';
      } else if (sr.role === 'INSIGHT' || sr.role === 'RESOLUCION') {
        title = 'El criterio que marca la diferencia';
        copyText = `No busques volumen excesivo ni ofertas dudosas; busca un diseño armónico que respete tus rasgos naturales.`;
        visualGuide = 'Plano de cabina impecable con distintivo de habilitación.';
      } else {
        // CTA
        title = '¿Tienes dudas sobre tu caso?';
        copyText = 'Comenta la palabra VALORACIÓN o escríbenos por mensaje directo para una evaluación clínica personalizada.';
        visualGuide = 'Tarjeta final con datos de contacto, ciudad y distintivo REPS de la clínica.';
      }

      return {
        slide_number: sr.slide_number || (idx + 1),
        role: sr.role || 'DESARROLLO',
        title,
        visual_guidance: visualGuide,
        copy_text: copyText
      };
    });

    return {
      archetype_id: arch.id,
      archetype_name: arch.nombre,
      micro_hooks_deslizamiento: microHooks,
      slides
    };
  }

  // =========================================================================
  // ORIENTACIÓN EDITORIAL Y REGULATORIA
  // =========================================================================

  function buildEditorialGuidance(hook, treatment, topic, format, intensity) {
    let warning = 'Toda práctica estética debe realizarse en instalaciones habilitadas ante el REPS conforme a la Resolución 3100 de 2019.';
    if (treatment && treatment.procedimiento_medico) {
      warning = 'Conforme a la Ley 711 de 2001, este procedimiento es de competencia exclusivamente médica. Prohibida su aplicación por personal sin titulación profesional facultada.';
    } else if (treatment && treatment.limites_clinicos_regulatorios) {
      warning = treatment.limites_clinicos_regulatorios;
    }

    const deliveryTips = [
      'Mantener un tono sobrio, empático y explicativo, sin emitir diagnósticos absolutos a través del video.',
      'Evitar primeros planos sangrientos o manipulaciones grotescas en cabina.',
      'Asegurar iluminación neutra sin sombras duras en el rostro del profesional.'
    ];

    if (format === 'anuncio') {
      deliveryTips.push('Cumplir estrictamente las directrices de Meta Ads: no formular preguntas directas sobre defectos corporales ni prometer transformaciones mágicas.');
    }

    return {
      criterio_editorial: hook.criterio_editorial || 'La explicación debe resolver con rigor técnico la duda planteada en el gancho.',
      delivery_requirements: deliveryTips,
      regulatory_warning: warning,
      verification_status: topic && topic.verification_status ? topic.verification_status : 'verified',
      citations: topic && topic.citations ? topic.citations : (treatment && treatment.fuentes_relacionadas ? treatment.fuentes_relacionadas : [1, 2])
    };
  }

  // =========================================================================
  // CONSTRUCCIÓN DEL LLAMADO A LA ACCIÓN (CTA)
  // =========================================================================

  function buildCta(objective, audience, format, treatment) {
    if (audience === 'responsable_negocio') {
      return {
        copy: 'Escribe RENTABILIDAD en los comentarios para enviarte nuestra plantilla de costos por cabina.',
        destination_type: 'calculadora_gloss'
      };
    }

    if (format === 'carrusel') {
      return {
        copy: 'Guarda este carrusel para consultarlo antes de tu cita o envíalo a quien esté evaluando este procedimiento.',
        destination_type: 'guardar_recurso'
      };
    }

    if (objective === 'conversion' || objective === 'confianza') {
      return {
        copy: 'Agenda tu cita de valoración médica presencial en el enlace de nuestra biografía.',
        destination_type: 'valoracion_clinica'
      };
    }

    if (objective === 'interaccion') {
      return {
        copy: '¿Conocías este detalle anatómico? Déjanos tus preguntas en los comentarios y las responderemos.',
        destination_type: 'interaccion'
      };
    }

    return {
      copy: 'Escríbenos por WhatsApp para resolver tus dudas antes de agendar tu procedimiento.',
      destination_type: 'whatsapp'
    };
  }

  // =========================================================================
  // FORMATEADORES DE EXPORTACIÓN (Portapapeles y PDF)
  // =========================================================================

  /**
   * Genera texto estructurado en Markdown para copiar una propuesta individual al portapapeles.
   */
  function formatProposalClipboard(proposal) {
    if (!proposal) return '';
    const { family, hook_triad, narrative_plan, carousel_plan, editorial_guidance, cta, intensity } = proposal;

    let out = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    out += `GLOSS & GROWTH · ESTUDIO DE CONTENIDO\n`;
    out += `Propuesta: ${proposal.result_id} · ${family.name} (${family.code})\n`;
    out += `Intensidad: Nivel ${intensity}/5\n`;
    out += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    out += `🎬 TRÍADA DE GANCHO (0-3s):\n`;
    out += `• Visual (0-2s): ${hook_triad.visual}\n`;
    out += `• Verbal (Voz): "${hook_triad.verbal}"\n`;
    out += `• Texto en pantalla: [ ${hook_triad.textual} ]\n`;
    out += `• Sincronía: ${hook_triad.synchronization_pattern}\n\n`;

    if (narrative_plan && narrative_plan.beats) {
      out += `⏱️ DESGLOSE NARRATIVO (${narrative_plan.structure_name}):\n`;
      narrative_plan.beats.forEach(b => {
        out += `  [${b.duration}] ${b.role}\n`;
        out += `  Visual: ${b.visual_cue}\n`;
        out += `  Audio: ${b.verbal_cue}\n\n`;
      });
    }

    if (carousel_plan && carousel_plan.slides) {
      out += `📑 SECUENCIA DE CARRUSEL (${carousel_plan.archetype_name}):\n`;
      carousel_plan.slides.forEach(s => {
        out += `  Slide ${s.slide_number} [${s.role}]: ${s.title}\n`;
        out += `  Texto: ${s.copy_text}\n`;
        out += `  Visual: ${s.visual_guidance}\n\n`;
      });
    }

    out += `📌 LLAMADO A LA ACCIÓN (CTA):\n"${cta.copy}"\n\n`;
    out += `⚖️ ADVERTENCIA EDITORIAL Y REGULATORIA:\n${editorial_guidance.regulatory_warning}\n`;
    out += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

    return out;
  }

  /**
   * Genera texto estructurado para copiar el lote completo al portapapeles.
   */
  function generateBatchClipboard(batchData) {
    if (!batchData || !Array.isArray(batchData.items)) return '';
    const meta = batchData.metadata || {};
    let out = `================================================================\n`;
    out += `GLOSS & GROWTH · GENERADOR DE GANCHOS PARA REELS Y ANUNCIOS\n`;
    out += `Tratamiento / Tema: ${meta.treatment_name || 'Clínica Estética'}\n`;
    out += `Formato: ${meta.format} · Objetivo: ${meta.objective} · Intensidad: ${meta.intensity}/5\n`;
    out += `Lote de ${batchData.items.length} propuestas generadas · ${new Date().toLocaleDateString('es-CO')}\n`;
    out += `================================================================\n\n`;

    batchData.items.forEach((item, idx) => {
      out += `--- PROPUESTA #${idx + 1} (${item.family.code} - ${item.family.name}) ---\n`;
      out += `TEXTO EN PANTALLA: ${item.hook_triad.textual}\n`;
      out += `GANCHO HABLADO: "${item.hook_triad.verbal}"\n`;
      out += `ESCENA VISUAL: ${item.hook_triad.visual}\n`;
      out += `CTA: ${item.cta.copy}\n\n`;
    });

    out += `Generado por Estudio de Contenido de Gloss & Growth · https://glossgrowthhq.com\n`;
    return out;
  }

  /**
   * Exporta el lote de ganchos a PDF corporativo mediante GlossReportEngine.
   */
  function exportBatchPdf(batchData, customFilename = null) {
    if (typeof GlossReportEngine !== 'undefined' && GlossReportEngine.generateEstudioContenidoPdf) {
      return GlossReportEngine.generateEstudioContenidoPdf(batchData, customFilename);
    }
    if (typeof require !== 'undefined') {
      try {
        const path = require('path');
        const reportEngine = require(path.resolve(__dirname, '../report-engine.js'));
        if (reportEngine && reportEngine.generateEstudioContenidoPdf) {
          return reportEngine.generateEstudioContenidoPdf(batchData, customFilename);
        }
      } catch (e) {}
    }
    throw new Error('GlossReportEngine no disponible para exportar PDF.');
  }

  // =========================================================================
  // PERSISTENCIA DE FAVORITOS (Integrado con GlossStorage)
  // =========================================================================

  const FAVORITES_TOOL_KEY = 'estudio_contenido_favoritos';
  const memFavorites = [];

  function saveFavorite(proposal, meta = {}) {
    if (!proposal || !proposal.result_id) throw new Error('Propuesta inválida para guardar');
    if (typeof GlossStorage !== 'undefined' && GlossStorage.saveAnalysis) {
      const name = `${proposal.hook_triad ? proposal.hook_triad.textual : proposal.family.name} · ${proposal.result_id}`;
      return GlossStorage.saveAnalysis(FAVORITES_TOOL_KEY, name, proposal, {
        summary: {
          family: proposal.family,
          textual: proposal.hook_triad ? proposal.hook_triad.textual : '',
          verbal: proposal.hook_triad ? proposal.hook_triad.verbal : ''
        },
        ...meta
      });
    }
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('gloss_ec_favoritos_v1') || '[]';
      const list = JSON.parse(raw);
      const record = {
        id: proposal.result_id,
        savedAt: new Date().toISOString(),
        proposal,
        meta
      };
      list.unshift(record);
      localStorage.setItem('gloss_ec_favoritos_v1', JSON.stringify(list));
      return record;
    }
    // Fallback en memoria para pruebas o entornos sin localStorage (Node.js)
    const record = {
      id: proposal.result_id,
      savedAt: new Date().toISOString(),
      proposal,
      meta
    };
    memFavorites.unshift(record);
    return record;
  }

  function getFavorites() {
    if (typeof GlossStorage !== 'undefined' && GlossStorage.getSavedAnalyses) {
      const analyses = GlossStorage.getSavedAnalyses(FAVORITES_TOOL_KEY);
      return analyses.map(a => ({
        id: a.id,
        name: a.name,
        savedAt: a.createdAt,
        proposal: a.inputs,
        meta: a.summary || {}
      }));
    }
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('gloss_ec_favoritos_v1') || '[]';
      return JSON.parse(raw);
    }
    return [...memFavorites];
  }

  function deleteFavorite(id) {
    if (typeof GlossStorage !== 'undefined' && GlossStorage.deleteAnalysis) {
      return GlossStorage.deleteAnalysis(id);
    }
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('gloss_ec_favoritos_v1') || '[]';
      let list = JSON.parse(raw);
      const initial = list.length;
      list = list.filter(item => item.id !== id && (item.proposal && item.proposal.result_id !== id));
      localStorage.setItem('gloss_ec_favoritos_v1', JSON.stringify(list));
      return list.length !== initial;
    }
    const idx = memFavorites.findIndex(item => item.id === id || (item.proposal && item.proposal.result_id === id));
    if (idx !== -1) {
      memFavorites.splice(idx, 1);
      return true;
    }
    return false;
  }

  // =========================================================================
  // FASE 3: GENERADOR DE IDEAS DE CONTENIDO Y ÁNGULOS EDITORIALES
  // =========================================================================

  const IDEAS_TOOL_KEY = 'estudio_contenido_ideas';
  const memIdeas = [];

  function generateIdeas(options = {}) {
    if (!library.isLoaded) throw new Error('GlossContentEngine no inicializado.');

    const audience = options.audience || 'paciente';
    const specialty = options.specialty || (audience === 'responsable_negocio' ? 'negocio_marketing' : 'medicina_estetica');
    const requestedTreatmentId = options.treatment_id || null;
    const requestedFunnelStage = options.funnel_stage || null;
    const requestedAngle = options.angle || null;
    const count = parseInt(options.count || 8, 10);

    let treatment = requestedTreatmentId ? getTreatmentById(requestedTreatmentId) : null;
    if (!treatment && audience === 'paciente' && specialty !== 'todas') {
      const candidates = getTreatments(specialty);
      if (candidates.length > 0) treatment = candidates[0];
    }

    // Filtrar temas afines de content-topics.json
    let pool = library.topics.filter(t => {
      if (t.audience !== audience) return false;
      if (treatment && t.treatment_id && t.treatment_id !== treatment.id) return false;
      if (specialty && specialty !== 'todas' && t.specialty !== specialty) return false;
      if (requestedFunnelStage && t.funnel_stage !== requestedFunnelStage) return false;
      if (requestedAngle && t.angle !== requestedAngle) return false;
      return true;
    });

    if (pool.length < count) {
      const fallbackPool = library.topics.filter(t => {
        if (t.audience !== audience) return false;
        if (requestedFunnelStage && t.funnel_stage !== requestedFunnelStage) return false;
        if (specialty && specialty !== 'todas' && t.specialty !== specialty) return false;
        if (treatment && treatment.id === 'masaje_relajante_descontracturante' &&
            (t.treatment_id === 'masajes_pareja_experiencias_spa' || t.treatment_id === 'bonos_regalo_rituales_spa')) {
          return false;
        }
        return true;
      });
      const ids = new Set(pool.map(p => p.topic_id));
      for (const item of fallbackPool) {
        if (!ids.has(item.topic_id)) {
          pool.push(item);
          ids.add(item.topic_id);
          if (pool.length >= count) break;
        }
      }
    }

    if (pool.length < count) {
      const broaderPool = library.topics.filter(t => {
        if (t.audience !== audience) return false;
        if (requestedFunnelStage && t.funnel_stage !== requestedFunnelStage) return false;
        return true;
      });
      const ids = new Set(pool.map(p => p.topic_id));
      for (const item of broaderPool) {
        if (!ids.has(item.topic_id)) {
          pool.push(item);
          ids.add(item.topic_id);
          if (pool.length >= count) break;
        }
      }
    }

    const selectedTopics = pool.slice(0, count);
    const ideas = selectedTopics.map((topic, idx) => {
      const t = topic.treatment_id ? getTreatmentById(topic.treatment_id) : treatment;
      const tName = t ? t.nombre_habitual : (audience === 'responsable_negocio' ? 'Gestión de Clínica' : 'Consulta Estética');

      const matchedHooks = library.hooks.filter(h => {
        if (topic.angle === 'errores' && h.familia_principal === 'NEG') return true;
        if (topic.angle === 'mito' && (h.familia_principal === 'ENEM' || h.familia_principal === 'CONTRA')) return true;
        if (topic.angle === 'comparacion' && (h.familia_principal === 'COMP' || h.familia_principal === 'VERSUS')) return true;
        if (topic.angle === 'autoridad' && (h.familia_principal === 'AUTO' || h.familia_principal === 'PROOF')) return true;
        if (h.aplicaciones_recomendadas && h.aplicaciones_recomendadas.some(a => a.includes(topic.angle))) return true;
        return false;
      });

      const topHooks = (matchedHooks.length >= 2 ? matchedHooks.slice(0, 2) : library.hooks.slice(idx * 2, idx * 2 + 2))
        .map(h => contextualizeTemplate(h.hook_original, t, topic, h, audience, 3, topic.suggested_format || 'talking_head'));

      const ideaId = `GG-IDEA-${Date.now().toString(36).toUpperCase()}-${(idx + 1).toString().padStart(2, '0')}`;
      const title = formatIdeaTitle(topic, tName);

      return {
        idea_id: ideaId,
        topic_id: topic.topic_id,
        treatment_id: t ? t.id : null,
        treatment_name: tName,
        title,
        problem: topic.problem,
        clinical_solution: topic.value_proposition,
        angle: topic.angle,
        objective: topic.objective,
        funnel_stage: topic.funnel_stage,
        recommended_format: topic.suggested_format || 'talking_head',
        suggested_hooks: topHooks,
        visual_brief: topic.visual_brief,
        verification_status: topic.verification_status || 'verified',
        citations: topic.citations || [],
        cta_destination: topic.objective === 'conversion' ? 'valoracion_clinica' : (topic.objective === 'educar' ? 'guardar_recurso' : 'whatsapp')
      };
    });

    return {
      metadata: {
        audience,
        specialty,
        treatment_id: treatment ? treatment.id : null,
        treatment_name: treatment ? treatment.nombre_habitual : (audience === 'responsable_negocio' ? 'Gestión de Clínica' : 'Consulta Estética'),
        funnel_stage: requestedFunnelStage || 'Todas las etapas',
        generated_count: ideas.length,
        timestamp: new Date().toISOString()
      },
      items: ideas
    };
  }

  function formatIdeaTitle(topic, tName) {
    const angle = topic.angle;
    const cleanProb = cleanText(topic.problem);
    const prefix = topic.specialty === 'spa_bienestar' ? 'Criterio de bienestar para' : 'Criterio clínico para';
    if (angle === 'errores') return `El error más común en ${tName}: ${cleanProb}`;
    if (angle === 'mito') return `Mito desmentido sobre ${tName}`;
    if (angle === 'comparacion') return `Comparativa técnica: ¿qué esperar realmente de ${tName}?`;
    if (angle === 'seguridad') return `Protocolo de seguridad y cuidado en ${tName}`;
    if (angle === 'costo_oculto') return `El costo oculto que casi ninguna clínica mide en ${tName}`;
    if (angle === 'expectativas') return `Expectativa vs. Realidad en ${tName}`;
    return `${prefix} ${tName}: ${cleanProb}`;
  }

  function formatIdeaClipboard(idea) {
    if (!idea) return '';
    let out = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    out += `GLOSS & GROWTH · IDEA DE CONTENIDO\n`;
    out += `Título: ${idea.title}\n`;
    out += `Tratamiento: ${idea.treatment_name} · Etapa: ${idea.funnel_stage.toUpperCase()}\n`;
    out += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    out += `❌ PROBLEMA / DOLOR DEL PACIENTE:\n${idea.problem}\n\n`;
    out += `💡 PROPUESTA DE VALOR / CRITERIO CLÍNICO:\n${idea.clinical_solution}\n\n`;
    out += `🎥 FORMATO RECOMENDADO: ${idea.recommended_format}\n`;
    out += `🎬 ENFOQUE VISUAL: ${idea.visual_brief}\n\n`;
    if (idea.suggested_hooks && idea.suggested_hooks.length > 0) {
      out += `⚡ GANCHOS SUGERIDOS:\n`;
      idea.suggested_hooks.forEach((h, i) => {
        out += `  ${i + 1}. "${h}"\n`;
      });
      out += `\n`;
    }
    out += `📌 LLAMADO A LA ACCIÓN: Dirigir hacia ${idea.cta_destination}\n`;
    out += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    return out;
  }

  function formatIdeasBatchClipboard(batch) {
    if (!batch || !Array.isArray(batch.items)) return '';
    const meta = batch.metadata || {};
    let out = `================================================================\n`;
    out += `GLOSS & GROWTH · BANCO DE IDEAS EDITORIALES\n`;
    out += `Especialidad: ${meta.specialty} · Audiencia: ${meta.audience}\n`;
    out += `Total ideas: ${batch.items.length} · ${new Date().toLocaleDateString('es-CO')}\n`;
    out += `================================================================\n\n`;

    batch.items.forEach((idea, idx) => {
      out += `[IDEA #${idx + 1}] ${idea.title}\n`;
      out += `Dolor: ${idea.problem}\n`;
      out += `Solución: ${idea.clinical_solution}\n`;
      out += `Formato: ${idea.recommended_format} · Etapa: ${idea.funnel_stage}\n`;
      if (idea.suggested_hooks && idea.suggested_hooks[0]) {
        out += `Gancho: "${idea.suggested_hooks[0]}"\n`;
      }
      out += `----------------------------------------------------------------\n\n`;
    });

    out += `Generado por Estudio de Contenido de Gloss & Growth · https://glossgrowthhq.com\n`;
    return out;
  }

  function saveIdea(idea, meta = {}) {
    if (!idea || !idea.idea_id) throw new Error('Idea inválida para guardar');
    if (typeof GlossStorage !== 'undefined' && GlossStorage.saveAnalysis) {
      return GlossStorage.saveAnalysis(IDEAS_TOOL_KEY, idea.title, idea, {
        summary: {
          title: idea.title,
          treatment: idea.treatment_name,
          funnel: idea.funnel_stage
        },
        ...meta
      });
    }
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('gloss_ec_ideas_v1') || '[]';
      const list = JSON.parse(raw);
      const record = { id: idea.idea_id, savedAt: new Date().toISOString(), idea, meta };
      list.unshift(record);
      localStorage.setItem('gloss_ec_ideas_v1', JSON.stringify(list));
      return record;
    }
    const record = { id: idea.idea_id, savedAt: new Date().toISOString(), idea, meta };
    memIdeas.unshift(record);
    return record;
  }

  function getSavedIdeas() {
    if (typeof GlossStorage !== 'undefined' && GlossStorage.getSavedAnalyses) {
      const analyses = GlossStorage.getSavedAnalyses(IDEAS_TOOL_KEY);
      return analyses.map(a => ({
        id: a.id,
        name: a.name,
        savedAt: a.createdAt,
        idea: a.inputs,
        meta: a.summary || {}
      }));
    }
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('gloss_ec_ideas_v1') || '[]';
      return JSON.parse(raw);
    }
    return [...memIdeas];
  }

  function deleteIdea(id) {
    if (typeof GlossStorage !== 'undefined' && GlossStorage.deleteAnalysis) {
      return GlossStorage.deleteAnalysis(id);
    }
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('gloss_ec_ideas_v1') || '[]';
      let list = JSON.parse(raw);
      const initial = list.length;
      list = list.filter(item => item.id !== id && (item.idea && item.idea.idea_id !== id));
      localStorage.setItem('gloss_ec_ideas_v1', JSON.stringify(list));
      return list.length !== initial;
    }
    const idx = memIdeas.findIndex(item => item.id === id || (item.idea && item.idea.idea_id === id));
    if (idx !== -1) {
      memIdeas.splice(idx, 1);
      return true;
    }
    return false;
  }

  function exportIdeasPdf(ideasBatch, customFilename = null) {
    if (typeof GlossReportEngine !== 'undefined' && GlossReportEngine.generateIdeasPdf) {
      return GlossReportEngine.generateIdeasPdf(ideasBatch, customFilename);
    }
    if (typeof require !== 'undefined') {
      try {
        const path = require('path');
        const reportEngine = require(path.resolve(__dirname, '../report-engine.js'));
        if (reportEngine && reportEngine.generateIdeasPdf) {
          return reportEngine.generateIdeasPdf(ideasBatch, customFilename);
        }
      } catch (e) {}
    }
    throw new Error('GlossReportEngine no disponible para exportar PDF de ideas.');
  }

  // =========================================================================
  // FASE 3: ESTRUCTURADOR DE REELS (GUIONES TÉCNICOS SEGUNDO A SEGUNDO)
  // =========================================================================

  const SCRIPTS_TOOL_KEY = 'estudio_contenido_guiones';
  const memScripts = [];

  function generateReelScript(options = {}) {
    if (!library.isLoaded) throw new Error('GlossContentEngine no inicializado.');

    const treatmentId = options.treatment_id || 'rinomodelacion';
    const treatment = getTreatmentById(treatmentId) || library.treatments[0];
    const tName = treatment ? treatment.nombre_habitual : 'Tratamiento Estético';
    const sName = treatment && treatment.nombres_alternativos && treatment.nombres_alternativos[0] ? treatment.nombres_alternativos[0] : tName;

    // Resolver estructura narrativa de las 10 canónicas
    const structures = library.narratives.structures || [];
    const requestedStructureId = options.structure_id || 'problema_invisible';
    const structure = structures.find(s => s.id === requestedStructureId) || structures[0];

    // Resolver gancho inicial
    let hookVerbal = options.custom_hook_verbal || null;
    let hookVisual = options.custom_hook_visual || null;
    let hookTextual = options.custom_hook_textual || null;

    if (!hookVerbal || !hookVisual || !hookTextual) {
      const miniGen = generate({
        audience: options.audience || 'paciente',
        specialty: treatment.categoria || 'medicina_estetica',
        treatment_id: treatment.id,
        objective: options.objective || 'confianza',
        format: 'talking_head',
        intensity: options.intensity || 3,
        count: 5
      });
      const topProposal = miniGen.items[0];
      hookVerbal = hookVerbal || topProposal.hook_triad.verbal;
      hookVisual = hookVisual || topProposal.hook_triad.visual;
      hookTextual = hookTextual || topProposal.hook_triad.textual;
    }

    const targetSeconds = parseInt(options.duration_seconds || 55, 10);
    const steps = structure.pasos || [];
    const stepCount = Math.max(1, steps.length);

    // Ensamblar beats cronológicos
    const beats = steps.map((step, idx) => {
      const stepNum = idx + 1;
      const isFirst = idx === 0;
      const isLast = idx === steps.length - 1;

      let startSec = Math.round((idx / stepCount) * targetSeconds);
      let endSec = Math.round(((idx + 1) / stepCount) * targetSeconds);
      if (isFirst) { startSec = 0; endSec = 5; }
      else if (idx === 1) { startSec = 5; }
      if (isLast) { endSec = targetSeconds; }

      const timecode = `00:${startSec.toString().padStart(2, '0')} - 00:${endSec.toString().padStart(2, '0')}`;

      const dialogue = assembleBeatDialogue(step, idx, treatment, hookVerbal, options.tone || 'Clínico y prudente');
      const camera = assembleCameraCue(step, idx, treatment, options.available_assets);
      const screenOverlay = assembleScreenOverlay(step, idx, treatment, hookTextual);

      return {
        beat_number: stepNum,
        timecode,
        role: step.nombre_paso || `Paso ${stepNum}`,
        camera_cue: camera,
        teleprompter_text: dialogue,
        screen_overlay: screenOverlay,
        audio_note: isFirst ? 'Audio nítido sin eco. Corte dinámico.' : 'Voz continua con cadencia segura y ritmo pausado.'
      };
    });

    const fullTeleprompter = beats.map(b => b.teleprompter_text).join(' ');
    const totalWords = fullTeleprompter.split(/\s+/).filter(Boolean).length;
    const readingTimeSec = Math.round(totalWords / 2.3);

    const isB2B = treatment && (treatment.categoria === 'negocio_marketing' || treatment.categoria === 'b2b');
    const checklist = isB2B ? [
      'Vestimenta ejecutiva sobria (blazer o filipina institucional)',
      'Pantalla o tablet con software de gestión, plantilla de costos o simulador abierto',
      'Iluminación limpia de estudio sin reflejos en la pantalla',
      'Micrófono lavalier inalámbrico verificado sin eco de oficina',
      'Gráficos o capturas de indicadores clave listos para insertar en edición',
      'Enlace o QR a la calculadora financiera correspondiente configurado'
    ] : [
      'Bata médica o filipina clínica impecable sin logos ruidosos',
      'Iluminación neutra de 3 puntos (sin sombras duras en ojeras o mentón)',
      treatment.procedimiento_medico ? 'Vial o caja original con holograma y registro Invima visible' : 'Instrumental y productos esterilizados',
      'Esquema anatómico, iPad o modelo de la zona tratada',
      'Micrófono de solapa (lavalier) inalámbrico verificado sin ruido ambiente',
      'Consentimiento informado del paciente si hay tomas de cabina compartidas'
    ];

    let legalNotice = isB2B
      ? 'Gestión Financiera Gloss & Growth: Metodología basada en costeo por absorción y análisis de margen de contribución para clínicas estéticas.'
      : 'Cumplimiento Resolución 3100 de 2019: La clínica debe exhibir su distintivo de habilitación en el REPS.';
    if (!isB2B && treatment.procedimiento_medico) {
      legalNotice += ' Ley 711 de 2001: La inyección de sustancias y neuromoduladores es acto reservado a médicos titulados.';
    }

    const scriptId = `GG-SCRIPT-${Date.now().toString(36).toUpperCase()}`;

    return {
      script_id: scriptId,
      treatment_id: treatment.id,
      treatment_name: tName,
      structure_id: structure.id,
      structure_name: structure.nombre,
      source: structure.fuente,
      tone: options.tone || (isB2B ? 'Educativo y financiero' : 'Clínico y prudente'),
      target_duration_seconds: targetSeconds,
      estimated_reading_seconds: readingTimeSec,
      total_words: totalWords,
      hook_opening: {
        verbal: hookVerbal,
        visual: hookVisual,
        textual: hookTextual
      },
      beats,
      full_teleprompter: fullTeleprompter,
      shooting_checklist: checklist.join(' · '),
      shooting_checklist_items: checklist,
      regulatory_notice: legalNotice,
      cta_summary: isB2B ? 'Invitación a auditar costos con calculadoras Gloss & Growth' : 'Invitación a cita de valoración médica presencial'
    };
  }

  function assembleBeatDialogue(step, idx, treatment, hookVerbal, tone) {
    const isB2B = treatment && (treatment.categoria === 'negocio_marketing' || treatment.categoria === 'b2b');
    const tName = treatment ? treatment.nombre_habitual : 'este procedimiento';
    const sName = treatment && treatment.nombres_alternativos && treatment.nombres_alternativos[0] ? treatment.nombres_alternativos[0] : tName;
    const prob = treatment && treatment.objeciones && treatment.objeciones[0] ? cleanText(treatment.objeciones[0]) : (treatment && treatment.miedos ? treatment.miedos[0] : 'los costos ocultos');
    const tech = treatment && treatment.temas_tecnicos ? treatment.temas_tecnicos : 'la profundidad anatómica del plano de trabajo';
    const care = treatment && treatment.cuidados_recuperacion ? treatment.cuidados_recuperacion : 'seguir las pautas operativas';

    if (idx === 0) {
      return hookVerbal;
    }
    if (isB2B) {
      if (idx === 1) {
        return `En la dirección de clínicas estéticas vemos a diario centros facturando bien pero con márgenes reales erosionados por ${prob.toLowerCase()}. Muchos creen que el problema es vender más, pero en realidad es un problema de estructura de costos.`;
      }
      if (idx === 2) {
        return `El factor que casi ningún gestor audita a tiempo es ${tech.toLowerCase()}. Si no calculas el costo real por hora de cabina y el consumo exacto de insumos, cada cita extra puede estar costándote dinero.`;
      }
      if (idx === 3) {
        return `En una gestión financiera rigurosa no trabajamos con suposiciones: medimos el punto de equilibrio por profesional, optimizamos los tiempos muertos y aseguramos que ${care.toLowerCase()}.`;
      }
      return `Si quieres auditar la rentabilidad real de tus cabinas o calcular tu punto de equilibrio operativo, utiliza las calculadoras financieras de Gloss & Growth o contáctanos para una sesión de diagnóstico.`;
    }
    if (idx === 1) {
      return `En consulta vemos con frecuencia a pacientes preocupados por ${prob.toLowerCase()}. Muchos creen que esto ocurre por azar o por simple mala suerte, pero en realidad tiene una explicación técnica muy concreta.`;
    }
    if (idx === 2) {
      return `Lo que casi nadie explica antes del procedimiento es que entra en juego ${tech.toLowerCase()}. Si no se evalúa la anatomía individual de cada persona y se aplica en el plano incorrecto, el tejido reacciona de forma adversa.`;
    }
    if (idx === 3) {
      return `En un protocolo médico responsable no improvisamos: mapeamos las estructuras con precisión milimétrica, utilizamos producto original con registro sanitario y cuidamos que ${care.toLowerCase()}.`;
    }
    return `Si estás evaluando realizarte ${tName} y quieres una opinión profesional fundamentada, escríbenos o agenda una valoración médica presencial para revisar tu caso con total transparencia.`;
  }

  function assembleCameraCue(step, idx, treatment, availableAssets) {
    const isB2B = treatment && (treatment.categoria === 'negocio_marketing' || treatment.categoria === 'b2b');
    if (isB2B) {
      if (idx === 0) return 'Plano medio de profesional o director frente a escritorio o pantalla con gráficos de rentabilidad, iluminación cálida y limpia.';
      if (idx === 1) return 'Zoom ligero a pantalla o tablet mostrando gráfico de dispersión de costos o agenda con huecos vacíos.';
      if (idx === 2) return 'Toma cerrada de hoja de cálculo o dashboard financiero señalando el costo oculto por hora de cabina.';
      if (idx === 3) return 'Plano medio amplio explicando con seguridad la regla de margen operativo y punto de equilibrio.';
      return 'Plano final con indicación en pantalla de herramientas y recursos financieros en glossgrowthhq.com.';
    }
    if (idx === 0) {
      return 'Plano medio cerrado (busto hacia arriba), contacto visual directo al lente de la cámara, profesional con bata clínica y luz frontal difusa.';
    }
    if (idx === 1) {
      return 'Corte sutil o zoom digital ligero; profesional gesticula con las manos abiertas explicando la inquietud común del paciente.';
    }
    if (idx === 2) {
      return 'Inserto o apoyo en B-roll de cabina: toma de detalle mostrando el instrumental limpio, vial sellado o esquema anatómico explicativo.';
    }
    if (idx === 3) {
      return 'Retorno a plano medio del profesional demostrando con calma la técnica de seguridad en cabina.';
    }
    return 'Plano medio amplio con gráfico inferior de contacto y distintivo de habilitación sanitaria REPS visible.';
  }

  function assembleScreenOverlay(step, idx, treatment, hookTextual) {
    const isB2B = treatment && (treatment.categoria === 'negocio_marketing' || treatment.categoria === 'b2b');
    const sName = treatment && treatment.nombres_alternativos && treatment.nombres_alternativos[0] ? treatment.nombres_alternativos[0] : (treatment ? treatment.nombre_habitual : 'TRATAMIENTO');
    if (isB2B) {
      if (idx === 0) return hookTextual ? hookTextual.toUpperCase() : `RENTABILIDAD EN ${sName.toUpperCase()}`;
      if (idx === 1) return 'EL ERROR FINANCIERO HABITUAL';
      if (idx === 2) return 'COSTO REAL POR HORA DE CABINA';
      if (idx === 3) return 'CONTROL DE MARGEN OPERATIVO';
      return 'AUDITA TU CLÍNICA EN GLOSS & GROWTH';
    }
    if (idx === 0) return hookTextual ? hookTextual.toUpperCase() : `CLAVES DE ${sName.toUpperCase()}`;
    if (idx === 1) return 'EL PROBLEMA VISIBLE EN CONSULTA';
    if (idx === 2) return 'ANATOMÍA Y VARIABLE OCULTA';
    if (idx === 3) return 'CRITERIO MÉDICO Y TÉCNICA SEGURA';
    return 'AGENDA TU VALORACIÓN PRESENCIAL';
  }

  function formatReelScriptClipboard(script) {
    if (!script) return '';
    let out = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    out += `GLOSS & GROWTH · GUION TÉCNICO DE RODAJE PARA REEL\n`;
    out += `Tratamiento: ${script.treatment_name} · Estructura: ${script.structure_name}\n`;
    out += `Duración estimada: ${script.target_duration_seconds}s (~${script.total_words} palabras / ${script.estimated_reading_seconds}s de lectura)\n`;
    out += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    out += `🎬 APERTURA DE GANCHO (0-3s):\n`;
    out += `• Texto en pantalla: [ ${script.hook_opening.textual} ]\n`;
    out += `• Guion hablado: "${script.hook_opening.verbal}"\n`;
    out += `• Cámara / Acción: ${script.hook_opening.visual}\n\n`;

    out += `⏱️ DESGLOSE SEGUNDO A SEGUNDO:\n`;
    script.beats.forEach(b => {
      out += `[${b.timecode}] BEAT ${b.beat_number}: ${b.role}\n`;
      out += `  📹 Cámara: ${b.camera_cue}\n`;
      out += `  🎙️ Guion: "${b.teleprompter_text}"\n`;
      if (b.screen_overlay) out += `  🏷️ Overlay: [ ${b.screen_overlay} ]\n`;
      out += `\n`;
    });

    out += `📜 TELEPROMPTER COMPLETO (Lectura continua):\n`;
    out += `"${script.full_teleprompter}"\n\n`;

    out += `🎒 CHECKLIST DE RODAJE EN CABINA:\n`;
    script.shooting_checklist_items.forEach(c => {
      out += `  [ ] ${c}\n`;
    });
    out += `\n`;

    out += `⚖️ ADVERTENCIA SANITARIA:\n${script.regulatory_notice}\n`;
    out += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    return out;
  }

  function saveScript(script, meta = {}) {
    if (!script || !script.script_id) throw new Error('Guion inválido para guardar');
    const name = `Guion: ${script.treatment_name} · ${script.structure_name}`;
    if (typeof GlossStorage !== 'undefined' && GlossStorage.saveAnalysis) {
      return GlossStorage.saveAnalysis(SCRIPTS_TOOL_KEY, name, script, {
        summary: {
          treatment: script.treatment_name,
          structure: script.structure_name,
          duration: script.target_duration_seconds
        },
        ...meta
      });
    }
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('gloss_ec_guiones_v1') || '[]';
      const list = JSON.parse(raw);
      const record = { id: script.script_id, savedAt: new Date().toISOString(), script, meta };
      list.unshift(record);
      localStorage.setItem('gloss_ec_guiones_v1', JSON.stringify(list));
      return record;
    }
    const record = { id: script.script_id, savedAt: new Date().toISOString(), script, meta };
    memScripts.unshift(record);
    return record;
  }

  function getSavedScripts() {
    if (typeof GlossStorage !== 'undefined' && GlossStorage.getSavedAnalyses) {
      const analyses = GlossStorage.getSavedAnalyses(SCRIPTS_TOOL_KEY);
      return analyses.map(a => ({
        id: a.id,
        name: a.name,
        savedAt: a.createdAt,
        script: a.inputs,
        meta: a.summary || {}
      }));
    }
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('gloss_ec_guiones_v1') || '[]';
      return JSON.parse(raw);
    }
    return [...memScripts];
  }

  function deleteScript(id) {
    if (typeof GlossStorage !== 'undefined' && GlossStorage.deleteAnalysis) {
      return GlossStorage.deleteAnalysis(id);
    }
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('gloss_ec_guiones_v1') || '[]';
      let list = JSON.parse(raw);
      const initial = list.length;
      list = list.filter(item => item.id !== id && (item.script && item.script.script_id !== id));
      localStorage.setItem('gloss_ec_guiones_v1', JSON.stringify(list));
      return list.length !== initial;
    }
    const idx = memScripts.findIndex(item => item.id === id || (item.script && item.script.script_id === id));
    if (idx !== -1) {
      memScripts.splice(idx, 1);
      return true;
    }
    return false;
  }

  function exportReelScriptPdf(script, customFilename = null) {
    if (typeof GlossReportEngine !== 'undefined' && GlossReportEngine.generateGuionReelPdf) {
      return GlossReportEngine.generateGuionReelPdf(script, customFilename);
    }
    if (typeof require !== 'undefined') {
      try {
        const path = require('path');
        const reportEngine = require(path.resolve(__dirname, '../report-engine.js'));
        if (reportEngine && reportEngine.generateGuionReelPdf) {
          return reportEngine.generateGuionReelPdf(script, customFilename);
        }
      } catch (e) {}
    }
    throw new Error('GlossReportEngine no disponible para exportar PDF de guion.');
  }

  // =========================================================================
  // FASE 4: EDITOR DE CARRUSELES (INSTAGRAM FEED 4:5)
  // =========================================================================

  const CAROUSELS_TOOL_KEY = 'estudio_contenido_carruseles';
  const memCarousels = [];

  function generateCarousel(options = {}) {
    if (!library.isLoaded) throw new Error('GlossContentEngine no inicializado.');

    const treatmentId = (options.treatment_id === 'negocio_marketing_general' ? 'adquisicion_pacientes_cac' : options.treatment_id) || 'rinomodelacion';
    const treatment = getTreatmentById(treatmentId) || library.treatments[0];
    const tName = treatment ? treatment.nombre_habitual : 'Tratamiento Estético';
    const isB2B = treatment && (treatment.categoria === 'negocio_marketing' || treatment.categoria === 'b2b');
    const cat = treatment ? (treatment.categoria || (isB2B ? 'negocio_marketing' : 'medicina_estetica')) : 'medicina_estetica';
    const isSpa = cat === 'spa_bienestar';
    const isFacial = cat === 'estetica_facial';
    const isCorporal = cat === 'estetica_corporal';
    const isDepilacion = cat === 'depilacion';
    const isMedical = cat === 'medicina_estetica';
    const isAd = options.format === 'anuncio' || options.is_ad === true || options.objective === 'conversion';

    // 1. Resolver arquetipo de los 7 canónicos
    const archetypes = library.carousels.archetypes || [];
    let archetype = null;
    if (options.archetype_id) {
      archetype = archetypes.find(a => a.id === options.archetype_id || a.id.toLowerCase() === options.archetype_id.toLowerCase());
    }
    if (!archetype) {
      const obj = options.objective || 'educar';
      if (obj === 'objecion') archetype = archetypes.find(a => a.id === 'SPLIT_VERSUS');
      else if (obj === 'interaccion') archetype = archetypes.find(a => a.id === 'INTERACTIVE_TEST');
      else if (obj === 'confianza') archetype = archetypes.find(a => a.id === 'NEWS');
      else if (obj === 'atraer') archetype = archetypes.find(a => a.id === 'JOURNAL' || a.id === 'CARTOON');
      else if (obj === 'conversion') archetype = archetypes.find(a => a.id === 'RESOURCE_LIST');
      else archetype = archetypes.find(a => a.id === 'TYPES_OF_X') || archetypes[0];
    }
    if (!archetype) archetype = archetypes[0] || { id: 'TYPES_OF_X', nombre: 'Tipos de X / Clasificación', secuencia_roles: [] };

    // 2. Cantidad de diapositivas objetivo (entre 4 y 10)
    let requestedSlides = parseInt(options.slides_count || (archetype.secuencia_roles ? archetype.secuencia_roles.length : 6), 10);
    requestedSlides = Math.max(4, Math.min(10, requestedSlides));

    // 3. Tema / Problema clínico o financiero
    const topic = (options.topic_id ? library.topics.find(t => t.topic_id === options.topic_id) : null) ||
                  library.topics.find(t => t.treatment_id === treatment.id) ||
                  library.topics[0];

    const prob = options.custom_problem || (topic && topic.problem ? topic.problem : (treatment.miedos ? treatment.miedos[0] : 'resultados poco naturales'));
    const sol = options.custom_solution || (topic && topic.value_proposition ? topic.value_proposition : treatment.descripcion_clinica);
    const tech = treatment.temas_tecnicos || 'planos anatómicos y dosis de precisión';
    const doubts = treatment.dudas_frecuentes || ['¿Cuánto dura el resultado?', '¿Tiene incapacidad médica?'];

    // 4. Gancho de Portada
    let hookTitle = options.custom_hook_textual || options.custom_hook || null;
    if (!hookTitle) {
      const topHook = library.hooks.find(h => {
        if (archetype.id === 'NEWS' && (h.familia_principal === 'GAP' || h.familia_principal === 'AUTO')) return true;
        if (archetype.id === 'SPLIT_VERSUS' && h.familia_principal === 'COMP') return true;
        if (archetype.id === 'CARTOON' && h.familia_principal === 'CONTRA') return true;
        return h.formato_sugerido === 'carrusel' || h.familia_principal === 'UTIL';
      }) || library.hooks[0];
      hookTitle = contextualizeTemplate(topHook.hook_original, treatment, topic, topHook, isB2B ? 'responsable_negocio' : 'paciente', 3, 'carrusel');
    }

    // 5. Construir diapositivas según secuencia de roles del arquetipo
    const baseRoles = archetype.secuencia_roles || [];
    const microHooks = archetype.micro_hooks_deslizamiento || [
      'Desliza para ver la explicación completa',
      'El detalle clave en la siguiente lámina',
      'Guarda este carrusel antes de tu cita'
    ];

    const slides = [];
    for (let i = 0; i < requestedSlides; i++) {
      const slideNum = i + 1;
      const isFirst = i === 0;
      const isSecond = i === 1;
      const isLast = i === requestedSlides - 1;
      const isPenultimate = i === requestedSlides - 2;

      let role = 'DESARROLLO';
      if (isFirst) role = 'PORTADA';
      else if (isSecond) role = 'SEGUNDO_GANCHO';
      else if (isLast) role = 'CTA';
      else if (isPenultimate) role = 'INSIGHT';
      else if (i === requestedSlides - 3) role = 'PRUEBA_O_EJEMPLO';
      else if (baseRoles[i] && baseRoles[i].role) role = baseRoles[i].role;

      let slideTitle = '';
      let copyText = '';
      let visualGuide = '';

      const contextualMicroHooks = [
        'Desliza para ver el criterio profesional →',
        'Mira la diferencia técnica en la siguiente lámina →',
        'El factor clave que pocos centros explican →',
        '¿Cómo verificarlo en tu caso? Desliza →',
        'El checklist indispensable a continuación →',
        'La recomendación práctica en la siguiente lámina →',
        'El criterio de cierre en la última lámina →'
      ];
      let microHook = (slideNum < requestedSlides) ? contextualMicroHooks[(i - 1) % contextualMicroHooks.length] : '';

      if (role === 'PORTADA') {
        slideTitle = hookTitle;
        if (isB2B) {
          copyText = `Auditoría financiera y operativa para clínicas estéticas: factores clave para proteger el margen y rentabilidad de ${tName}.`;
        } else if (isSpa) {
          copyText = `Guía de bienestar y desconexión: lo que necesitas saber antes de elegir tu experiencia de ${tName.toLowerCase()}.`;
        } else if (isFacial) {
          copyText = `Guía cosmiátrica profesional: cómo evaluar tu biotipo cutáneo antes de realizarte ${tName.toLowerCase()}.`;
        } else if (isCorporal) {
          copyText = `Protocolo de cabina y firmeza: claves para un abordaje responsable en ${tName.toLowerCase()}.`;
        } else if (isDepilacion) {
          copyText = `Fototipo, fases foliculares y tecnología: lo indispensable antes de tu sesión de ${tName.toLowerCase()}.`;
        } else {
          copyText = `Criterio médico y seguridad anatómica: lo que necesitas verificar antes de realizarte ${tName}.`;
        }
        visualGuide = `Tipografía titular grande con alto contraste. Fondo editorial neutro (#FAF8F5). Logotipo institucional sutil y micro-hook de deslizamiento visible en esquina inferior.`;
        microHook = 'Desliza para ver el criterio profesional →';
      } else if (role === 'SEGUNDO_GANCHO') {
        if (isB2B) {
          slideTitle = '¿Por qué este indicador define la supervivencia del negocio?';
          copyText = `Si gestionas un centro estético, no calcular ${tech.toLowerCase()} provoca que cada cita extra aumente costos fijos y mermas sin dejar beneficio real en el balance final.`;
        } else if (isSpa) {
          slideTitle = '¿Por qué no todos los masajes consiguen la misma desconexión?';
          copyText = `Creer que cualquier sesión de masaje es idéntica suele terminar en frustración. La diferencia radica en la cadencia de las maniobras, la temperatura de cabina y la pureza de los aceites botánicos utilizados.`;
        } else if (isFacial) {
          slideTitle = '¿Por qué aplicar una técnica estándar puede irritar tu piel?';
          copyText = `Si buscas solucionar ${prob.toLowerCase()}, aplicar extracciones agresivas o productos sin diagnóstico previo altera la barrera lipídica y empeora la reactividad cutánea.`;
        } else if (isCorporal) {
          slideTitle = '¿Por qué los tratamientos milagro nunca funcionan a largo plazo?';
          copyText = `Prometer reducciones masivas inmediatas sin cambios de hábitos es engañoso. El objetivo de cabina es tonificar, estimular el drenaje y mejorar la textura cutánea con aparatología certificada.`;
        } else if (isDepilacion) {
          slideTitle = '¿Por qué la potencia incorrecta puede manchar tu piel o no dar resultados?';
          copyText = `Cada fototipo en escala Fitzpatrick requiere longitudes de onda específicas. Usar parámetros genéricos quema la epidermis o no alcanza la raíz del vello en fase anágena.`;
        } else {
          slideTitle = '¿Por qué un mal criterio anatómico arruina la naturalidad?';
          copyText = `Si estás considerando ${tName}, una oferta sospechosamente económica suele implicar dilución de producto, viales compartidos o falta de dominio anatómico en planos vasculares.`;
        }
        visualGuide = `Caja de texto destacada en color de acento (#8C2536 o #1E3A8A) con viñeta de alerta o ícono de atención. Espacio en blanco amplio para descanso visual.`;
      } else if (role === 'DESARROLLO') {
        const subIndex = i - 1;
        if (isB2B) {
          const b2bBeats = [
            {
              title: `Punto clave ${subIndex}: Costos por minuto de cabina`,
              text: `Una gestión rigurosa no estima a ojo: calcula el costo por minuto de cabina sumando alquiler, depreciación y nómina fija para asegurar margen positivo.`,
              visual: `Esquema de tabla comparativa o gráfico de barras simplificado mostrando costos fijos frente al margen de contribución.`
            },
            {
              title: `Punto clave ${subIndex}: Control de mermas e insumos directos`,
              text: `Cada insumo descartable, aguja o jeringa debe asignarse al costo unitario del servicio. Omitir insumos menores diluye el margen neto mensual.`,
              visual: `Gráfico de distribución porcentual de costos directos vs. indirectos por sesión estética.`
            },
            {
              title: `Punto clave ${subIndex}: Protocolo de confirmación activa de agenda`,
              text: `Implementar recordatorios sistemáticos y confirmación por WhatsApp 24 horas antes previene huecos de agenda y optimiza la capacidad instalada.`,
              visual: `Flujograma sobrio del recorrido de recordatorio y confirmación de citas en cabina.`
            },
            {
              title: `Punto clave ${subIndex}: Retorno publicitario (ROAS) y CAC real`,
              text: `No midas clics ni seguidores: mide el costo por paciente efectivamente agendado frente al valor medio del tratamiento para proteger el presupuesto.`,
              visual: `Panel de métricas directivas con indicadores CAC, LTV y ROAS en tipografía tabular.`
            }
          ];
          const beat = b2bBeats[(i - 2) % b2bBeats.length];
          slideTitle = beat.title;
          copyText = beat.text;
          visualGuide = beat.visual;
        } else if (isSpa) {
          const spaBeats = [
            {
              title: `Clave ${subIndex}: Cadencia manual y descontracturación gradual`,
              text: `Las maniobras progresivas liberan la tensión acumulada en trapecios y zona lumbar respetando el umbral de relajación sin maniobras agresivas.`,
              visual: `Fotografía cenital suave de cabina de spa con iluminación cálida, toallas dobladas y aceites vegetales puros en cuencos cerámicos.`
            },
            {
              title: `Clave ${subIndex}: Aislamiento acústico y ambientación sensorial`,
              text: `La relajación profunda requiere estímulos armónicos: temperatura constante en 24°C, aromaterapia botánica y música en frecuencia sedativa.`,
              visual: `Detalle de difusor ultrasónico con bruma aromática tenue y velas ambientales en rincón de relajación.`
            },
            {
              title: `Clave ${subIndex}: Experiencia individual vs. ritual compartido`,
              text: `Para desconexión personal se prioriza el silencio y la introspección; en rituales en pareja se sincronizan cabinas para compartir la pausa de bienestar.`,
              visual: `Composición limpia de cabina doble ambientada con pétalos neutros y copas de infusión herbal de bienvenida.`
            },
            {
              title: `Clave ${subIndex}: Impacto en el descanso y bienestar general`,
              text: `La terapia manual induce una reducción en los niveles fisiológicos de estrés, favoreciendo un sueño reparador y recuperación física.`,
              visual: `Toma de detalle de paciente descansando plácidamente sobre camilla ergonómica acolchada con sábana de lino suave.`
            }
          ];
          const beat = spaBeats[(i - 2) % spaBeats.length];
          slideTitle = beat.title;
          copyText = beat.text;
          visualGuide = beat.visual;
        } else if (isFacial) {
          const facialBeats = [
            {
              title: `Clave ${subIndex}: Diagnóstico del biotipo y barrera cutánea`,
              text: `Antes de cualquier procedimiento en cabina es indispensable evaluar si la piel es lipídica, seca o reactiva para modular los principios activos.`,
              visual: `Fotografía limpia de especialista realizando inspección cutánea con lámpara lupa de aumento y guantes limpios.`
            },
            {
              title: `Clave ${subIndex}: Higiene profunda sin daño tisular`,
              text: `La extracción y exfoliación profesional utiliza emulsiones y activos queratolíticos suaves que limpian los poros sin romper capilares dérmicos.`,
              visual: `Primer plano de aplicación suave de mascarilla descongestiva con pincel plano en frente y pómulos.`
            },
            {
              title: `Clave ${subIndex}: Criterio cosmiátrico y límites éticos`,
              text: `En cabina estética tratamos la capa córnea y el cuidado preventivo. Casos de acné inflamatorio activo grado III-IV deben remitirse a dermatología médica.`,
              visual: `Iconografía sobria comparativa entre biotipo cutáneo sano y signos de alerta que exigen valoración médica.`
            },
            {
              title: `Clave ${subIndex}: Mantenimiento en casa y fotoprotección`,
              text: `El resultado de cabina se prolonga con una rutina diaria constante: limpiador con pH neutro, sérum hidratante y uso estricto de protector solar FPS 50+.`,
              visual: `Bodegón cosmético con envases de fotoprotector y crema hidratante sobre bandeja minimalista de mármol.`
            }
          ];
          const beat = facialBeats[(i - 2) % facialBeats.length];
          slideTitle = beat.title;
          copyText = beat.text;
          visualGuide = beat.visual;
        } else if (isCorporal) {
          const corporalBeats = [
            {
              title: `Clave ${subIndex}: Estímulo del drenaje y tonicidad dérmica`,
              text: `Los protocolos corporales combinan maniobras y aparatología para estimular el retorno venolinfático y mejorar la elasticidad del tejido cutáneo.`,
              visual: `Detalle de cabina corporal impecable con toallas blancas y equipo con cabezal ergonómico sobre soporte seguro.`
            },
            {
              title: `Clave ${subIndex}: Calibración segura de aparatología`,
              text: `Equipos de radiofrecuencia o cavitación requieren monitoreo continuo de temperatura tisular para actuar en tejido graso sin riesgo de quemadura.`,
              visual: `Especialista calibrando pantalla digital de aparatología con parámetros moderados y gel conductor transparente.`
            },
            {
              title: `Clave ${subIndex}: Expectativas realistas y hábitos saludables`,
              text: `El moldeamiento de cabina estiliza contornos y mejora la celulitis; no sustituye la actividad física regular ni una nutrición adecuada.`,
              visual: `Gráfico sobrio de líneas de contorno corporal que ilustra el concepto de firmeza cutánea y tonificación.`
            },
            {
              title: `Clave ${subIndex}: Evaluación personalizada de cada zona`,
              text: `El abordaje varía según se trate de abdomen, flancos o piernas: cada región presenta distinto grosor de panículo adiposo y grado de flacidez.`,
              visual: `Esquema anatómico neutro de zonas corporales con guías de aplicación simétrica.`
            }
          ];
          const beat = corporalBeats[(i - 2) % corporalBeats.length];
          slideTitle = beat.title;
          copyText = beat.text;
          visualGuide = beat.visual;
        } else if (isDepilacion) {
          const depilBeats = [
            {
              title: `Clave ${subIndex}: Destrucción folicular en fase anágena`,
              text: `La luz láser solo actúa sobre el vello con raíz conectada al folículo; por ello se requieren sesiones espaciadas de 4 a 6 semanas.`,
              visual: `Ilustración médica esquemática de la estructura del folículo piloso en fase anágena con luz focalizada.`
            },
            {
              title: `Clave ${subIndex}: Calibración por fototipo Fitzpatrick`,
              text: `Ajustar la longitud de onda y la duración de pulso según el tono de piel evita pigmentaciones reactivas y concentra el calor en la melanina del vello.`,
              visual: `Tabla comparativa de fototipos del I al VI con rangos de fluencia y parámetros recomendados.`
            },
            {
              title: `Clave ${subIndex}: Preparación 24 horas antes`,
              text: `El área debe rasurarse con cuchilla un día antes para que el haz de luz viaje directamente a la raíz sin quemar la superficie cutánea.`,
              visual: `Checklist visual con íconos de rasurado previo, piel limpia y ausencia de cremas o desodorantes.`
            },
            {
              title: `Clave ${subIndex}: Cuidados post-sesión y protección`,
              text: `Evitar agua caliente, saunas y exposición al sol durante 48 horas post-sesión, aplicando gel calmante de aloe o regenerador dérmico.`,
              visual: `Fotografía de aplicación de gel hidratante calmante con guantes tras finalizar la sesión de láser.`
            }
          ];
          const beat = depilBeats[(i - 2) % depilBeats.length];
          slideTitle = beat.title;
          copyText = beat.text;
          visualGuide = beat.visual;
        } else {
          // isMedical
          const medicalBeats = [
            {
              title: `Clave ${subIndex}: Anatomía facial y plano de aplicación`,
              text: `En procedimientos médicos con aguja o cánula, el plano anatómico (supraperióstico o subdérmico) determina la naturalidad y previene oclusiones vasculares.`,
              visual: `Esquema anatómico médico de capas faciales (ósea, grasa profunda, SMAS, piel) sin sangre ni sensacionalismo.`
            },
            {
              title: `Clave ${subIndex}: Vial original sellado con registro Invima`,
              text: `Exige siempre que el vial sea abierto frente a ti, comprobando la fecha de vencimiento, lote de fabricación y trazabilidad del laboratorio fabricante.`,
              visual: `Fotografía en alta definición del vial sellado con etiqueta de lote original y distintivo Invima legible.`
            },
            {
              title: `Clave ${subIndex}: Dosificación prudente: Menos es más`,
              text: `La medicina estética moderna busca refrescar y reponer soporte perdido, no transformar ni inflar el rostro. Una sobredosificación genera pérdida de armonía.`,
              visual: `Comparativa sobria de proporciones áureas faciales destacando balance natural entre tercio superior, medio e inferior.`
            },
            {
              title: `Clave ${subIndex}: Consentimiento informado y distintivo REPS`,
              text: `La valoración médica presencial debe incluir historia clínica, firma de consentimiento informado detallado y sede con habilitación sanitaria vigente.`,
              visual: `Plano detalle de documento de consentimiento informado y distintivo de habilitación sanitaria REPS en marco institucional.`
            }
          ];
          const beat = medicalBeats[(i - 2) % medicalBeats.length];
          slideTitle = beat.title;
          copyText = beat.text;
          visualGuide = beat.visual;
        }
      } else if (role === 'PRUEBA_O_EJEMPLO') {
        if (isB2B) {
          slideTitle = 'Auditoría práctica: El checklist directivo';
          copyText = `Tres indicadores obligatorios para revisar cada mes en tu clínica: 1) Ocupación real de cabinas (% sobre capacidad instalada), 2) Margen de contribución neto por servicio, 3) Tasa de confirmación de citas.`;
        } else if (isSpa) {
          slideTitle = 'Garantías no negociables en spa';
          copyText = `Tres elementos indispensables en una experiencia superior: 1) Toallas y sábanas esterilizadas, 2) Aceites botánicos puros sin fragancias sintéticas irritantes, 3) Silencio absoluto y privacidad en cabina.`;
        } else if (isFacial) {
          slideTitle = 'Garantías en cabina facial';
          copyText = `Tres requisitos mínimos que debes comprobar: 1) Instrumental esterilizado en autoclave o descartable, 2) Cosméticos con registro sanitario Invima vigente, 3) Diagnóstico previo de biotipo cutáneo.`;
        } else if (isCorporal) {
          slideTitle = 'Garantías en cabina corporal';
          copyText = `Un protocolo profesional siempre incluye: 1) Medición antropométrica previa estandarizada, 2) Aparatología certificada con registro sanitario, 3) Estimación transparente del número de sesiones necesarias.`;
        } else if (isDepilacion) {
          slideTitle = 'Garantías en depilación láser';
          copyText = `Comprueba antes de iniciar: 1) Disparo de prueba previo en piel, 2) Uso obligatorio de gafas de protección ocular para ti y la operadora, 3) Cabezal con sistema de enfriamiento activo.`;
        } else {
          slideTitle = 'Checklist médico antes de autorizar el procedimiento';
          copyText = `Tres requisitos indispensables: 1) Profesional médico con distintivo REPS visible en la sede, 2) Apertura del vial original sellado frente a ti con registro Invima, 3) Consentimiento informado detallado tras resolver tus dudas.`;
        }
        visualGuide = `Diseño en formato tarjeta o checklist con casillas marcadas, fondo en tono crema suave y tipografía de lectura clara.`;
      } else if (role === 'INSIGHT') {
        if (isB2B) {
          slideTitle = 'El principio directivo de fondo';
          copyText = `La facturación bruta es vanidad; el margen operativo neto por cabina es salud financiera. Los centros sostenibles no compiten por precio: optimizan procesos y cuidan su rentabilidad.`;
        } else if (isSpa) {
          slideTitle = 'La pausa que tu cuerpo y mente necesitan';
          copyText = `El bienestar no es un lujo ocasional, sino una inversión en equilibrio físico y serenidad. Cuidar de ti renueva tu energía para afrontar los compromisos cotidianos.`;
        } else if (isFacial) {
          slideTitle = 'Constancia antes que agresividad';
          copyText = `Una piel sana no se consigue con tratamientos agresivos de un solo día, sino con protocolos respetuosos y una rutina diaria de cuidado adaptada a tus necesidades reales.`;
        } else if (isCorporal) {
          slideTitle = 'Armonía y salud de los tejidos';
          copyText = `El mejor tratamiento corporal es el que respeta la fisiología de tu cuerpo, tonifica tus tejidos y se acompaña de hábitos saludables sostenibles en el tiempo.`;
        } else if (isDepilacion) {
          slideTitle = 'Efectividad basada en ciencia folicular';
          copyText = `La depilación progresiva es un proceso biológico que exige respetar los tiempos del ciclo folicular para lograr una piel suave de manera definitiva y sin foliculitis.`;
        } else {
          slideTitle = 'La naturalidad es la máxima expresión del criterio médico';
          copyText = `El mejor procedimiento médico-estético es aquel que nadie nota que te hiciste, pero todos perciben en tu rostro fresco, descansado y en armonía con tu fisonomía.`;
        }
        visualGuide = `Frase destacada en tipografía serif de alta jerarquía centrada con comillas editoriales elegantes. Fondo sobrio.`;
      } else {
        // CTA
        if (isAd) {
          slideTitle = isB2B ? 'Descarga la Calculadora de Costos de Cabina' : `Reserva tu cita para ${tName}`;
          if (isB2B) {
            copyText = `Visita nuestras herramientas financieras en glossgrowthhq.com y audita el margen de tus tratamientos en menos de 5 minutos.`;
          } else if (isSpa) {
            copyText = `Reserva tu sesión de spa o adquiere un bono de regalo escribiéndonos por WhatsApp o mensaje directo.`;
          } else if (isFacial) {
            copyText = `Agenda tu valoración facial en cabina escribiéndonos un mensaje directo para coordinar tu horario.`;
          } else if (isCorporal) {
            copyText = `Coordina tu evaluación corporal de cabina a través de nuestro enlace directo en el perfil.`;
          } else if (isDepilacion) {
            copyText = `Solicita tu prueba de fototipo y valoración personalizada para iniciar tu protocolo de depilación.`;
          } else {
            copyText = `Escríbenos por WhatsApp para coordinar tu consulta médica de valoración presencial en nuestras sedes habilitadas.`;
          }
        } else {
          slideTitle = isB2B ? '¿Quieres auditar los números de tu clínica?' : '¿Tienes dudas sobre tu caso?';
          if (isB2B) {
            copyText = `Guarda este carrusel para tu próxima reunión directiva o déjanos un comentario con tu duda sobre costos de cabina.`;
          } else if (isSpa) {
            copyText = `Guarda este post para planear tu momento de descanso o compártelo con quien necesite una pausa de bienestar.`;
          } else if (isFacial) {
            copyText = `Guarda esta guía para recordar los cuidados de tu piel y coméntanos qué inquietud tienes sobre tu rutina.`;
          } else if (isCorporal) {
            copyText = `Guarda este carrusel para consultar las claves de un tratamiento responsable y compártelo con alguien interesado.`;
          } else if (isDepilacion) {
            copyText = `Guarda esta publicación antes de tu próxima cita láser y envíasela a quien esté pensando en iniciar su tratamiento.`;
          } else {
            copyText = `Guarda este checklist para tu próxima consulta médica y comenta VALORACIÓN si deseas coordinar tu cita presencial con nuestro equipo habilitado.`;
          }
        }
        visualGuide = `Tarjeta final de contacto: llamado a la acción claro, icono de guardar carrusel, botones de interacción y distintivo institucional REPS.`;
        microHook = '';
      }

      slides.push({
        slide_number: slideNum,
        role,
        title: slideTitle,
        copy_text: copyText,
        visual_guidance: visualGuide,
        micro_hook: microHook
      });
    }

    const carouselId = `GG-CAROUSEL-${Date.now().toString(36).toUpperCase()}`;
    let legalNotice = isB2B
      ? 'Gestión Financiera Gloss & Growth: Metodología basada en costeo por absorción y análisis de margen para clínicas estéticas.'
      : 'Cumplimiento Resolución 3100 de 2019: La clínica debe exhibir su distintivo de habilitación en el REPS.';
    if (!isB2B && treatment.procedimiento_medico) {
      legalNotice += ' Ley 711 de 2001: La inyección de sustancias y neuromoduladores es acto reservado a médicos titulados.';
    }

    const carouselTitle = slides[0] && slides[0].title ? slides[0].title : `Carrusel: ${tName} · ${archetype.nombre}`;

    return {
      carousel_id: carouselId,
      title: carouselTitle,
      treatment_id: treatment.id,
      treatment_name: tName,
      archetype_id: archetype.id,
      archetype_name: archetype.nombre,
      objective: options.objective || 'educar',
      total_slides: slides.length,
      slides,
      regulatory_warning: legalNotice,
      cta_summary: isB2B ? 'Invitación a auditar costos en Gloss & Growth' : 'Invitación a consulta de valoración médica presencial',
      created_at: new Date().toISOString()
    };
  }

  function formatCarouselClipboard(carousel) {
    if (!carousel) return '';
    if (typeof GlossReportEngine !== 'undefined' && GlossReportEngine.generateCarouselClipboard) {
      return GlossReportEngine.generateCarouselClipboard(carousel);
    }
    if (typeof require !== 'undefined') {
      try {
        const path = require('path');
        const reportEngine = require(path.resolve(__dirname, '../report-engine.js'));
        if (reportEngine && reportEngine.generateCarouselClipboard) {
          return reportEngine.generateCarouselClipboard(carousel);
        }
      } catch (e) {}
    }
    return (carousel.slides || []).map((s, i) => `[Slide ${i+1}] ${s.title}: ${s.copy}`).join('\n');
  }

  function exportCarouselPdf(carousel, customFilename = null) {
    if (typeof GlossReportEngine !== 'undefined' && GlossReportEngine.generateCarouselPdf) {
      return GlossReportEngine.generateCarouselPdf(carousel, customFilename);
    }
    if (typeof require !== 'undefined') {
      try {
        const path = require('path');
        const reportEngine = require(path.resolve(__dirname, '../report-engine.js'));
        if (reportEngine && reportEngine.generateCarouselPdf) {
          return reportEngine.generateCarouselPdf(carousel, customFilename);
        }
      } catch (e) {}
    }
    throw new Error('GlossReportEngine no disponible para exportar PDF de carrusel.');
  }

  function saveCarousel(carousel, meta = {}) {
    if (!carousel || !carousel.carousel_id) throw new Error('Carrusel inválido para guardar');
    const name = `Carrusel: ${carousel.treatment_name} · ${carousel.archetype_name} (${carousel.slides.length} láminas)`;
    if (typeof GlossStorage !== 'undefined' && GlossStorage.saveAnalysis) {
      return GlossStorage.saveAnalysis(CAROUSELS_TOOL_KEY, name, carousel, {
        summary: {
          treatment: carousel.treatment_name,
          archetype: carousel.archetype_name,
          slidesCount: carousel.slides.length
        },
        ...meta
      });
    }
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('gloss_ec_carruseles_v1') || '[]';
      const list = JSON.parse(raw);
      const record = { id: carousel.carousel_id, savedAt: new Date().toISOString(), carousel, meta };
      list.unshift(record);
      localStorage.setItem('gloss_ec_carruseles_v1', JSON.stringify(list));
      return record;
    }
    const record = { id: carousel.carousel_id, savedAt: new Date().toISOString(), carousel, meta };
    memCarousels.unshift(record);
    return record;
  }

  function getSavedCarousels() {
    if (typeof GlossStorage !== 'undefined' && GlossStorage.getSavedAnalyses) {
      const analyses = GlossStorage.getSavedAnalyses(CAROUSELS_TOOL_KEY);
      return analyses.map(a => ({
        id: a.id,
        name: a.name,
        savedAt: a.createdAt,
        carousel: a.inputs,
        meta: a.summary || {}
      }));
    }
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('gloss_ec_carruseles_v1') || '[]';
      return JSON.parse(raw);
    }
    return [...memCarousels];
  }

  function deleteCarousel(id) {
    if (typeof GlossStorage !== 'undefined' && GlossStorage.deleteAnalysis) {
      return GlossStorage.deleteAnalysis(id);
    }
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('gloss_ec_carruseles_v1') || '[]';
      let list = JSON.parse(raw);
      const initial = list.length;
      list = list.filter(item => item.id !== id && (item.carousel && item.carousel.carousel_id !== id));
      localStorage.setItem('gloss_ec_carruseles_v1', JSON.stringify(list));
      return list.length !== initial;
    }
    const idx = memCarousels.findIndex(item => item.id === id || (item.carousel && item.carousel.carousel_id === id));
    if (idx !== -1) {
      memCarousels.splice(idx, 1);
      return true;
    }
    return false;
  }

  // =========================================================================
  // FASE 4: GENERADOR DE HISTORIAS DE INSTAGRAM (9:16)
  // =========================================================================

  const STORIES_TOOL_KEY = 'estudio_contenido_historias';
  const memStories = [];

  const DEFAULT_STORIES_CATEGORIES = [
    { id: 'urgencia', nombre: 'Urgencia y Cierre de Agenda', descripcion: 'Cupos limitados reales y fechas límite de agenda.' },
    { id: 'one_shot', nombre: 'One Shot (Impacto Rápido)', descripcion: '1 a 3 historias de alto valor directo.' },
    { id: 'lead_magnet', nombre: 'Lead Magnet y Recursos Gratuitos', descripcion: 'Entrega de guías o calculadoras por DM.' },
    { id: 'libre_humanizacion', nombre: 'Libre y Humanización de Clínica', descripcion: 'Cultura médica, cabina y equipo.' },
    { id: 'encuestas', nombre: 'Encuestas e Interacción', descripcion: 'Stickers interactivos para generar conversación.' }
  ];

  const DEFAULT_STORIES_STRUCTURES = [
    {
      id: 'bomba',
      nombre: 'Estructura Bomba',
      categoria_principal: 'urgencia',
      descripcion: 'Apertura de alto impacto con advertencia o llamado directo.',
      duracion_historias: 3,
      pasos: [
        { orden: 1, rol: 'GANCHO', nombre: 'Impacto Urgente', proposito: 'Detener el scroll con fecha o cupo real', sugerencia_sticker: 'cuenta_regresiva' },
        { orden: 2, rol: 'DESARROLLO', nombre: 'Explicación Breve', proposito: 'Contexto clínico o beneficio', sugerencia_sticker: 'ninguno' },
        { orden: 3, rol: 'CTA', nombre: 'Cierre Rápido', proposito: 'Llamado a escribir por mensaje directo', sugerencia_sticker: 'enlace_o_mensaje' }
      ]
    },
    {
      id: 'de_x_a_y',
      nombre: 'De X a Y (Contraste Antes/Después)',
      categoria_principal: 'one_shot',
      descripcion: 'Transformación de expectativa a realidad con criterio médico.',
      duracion_historias: 4,
      pasos: [
        { orden: 1, rol: 'GANCHO', nombre: 'El Antes o Falso Mito', proposito: 'Exponer la creencia común', sugerencia_sticker: 'deslizador_emoji' },
        { orden: 2, rol: 'DESARROLLO', nombre: 'La Solución Médica', proposito: 'Mostrar el procedimiento en cabina', sugerencia_sticker: 'ninguno' },
        { orden: 3, rol: 'INSIGHT', nombre: 'El Resultado Ético', proposito: 'Explicar por qué la armonía supera el exceso', sugerencia_sticker: 'ninguno' },
        { orden: 4, rol: 'CTA', nombre: 'Llamado a Valoración', proposito: 'Invitar a consulta presencial', sugerencia_sticker: 'enlace_o_mensaje' }
      ]
    },
    {
      id: 'pregunta_respuesta',
      nombre: 'Pregunta → Respuesta',
      categoria_principal: 'encuestas',
      descripcion: 'Resolución de dudas frecuentes de pacientes con sticker interactivo.',
      duracion_historias: 4,
      pasos: [
        { orden: 1, rol: 'GANCHO', nombre: 'Pregunta de Paciente', proposito: 'Plantear duda clínica común', sugerencia_sticker: 'caja_preguntas' },
        { orden: 2, rol: 'DESARROLLO', nombre: 'Respuesta Especializada', proposito: 'Médico explicando con criterio técnico', sugerencia_sticker: 'ninguno' },
        { orden: 3, rol: 'INSIGHT', nombre: 'Recomendación Práctica', proposito: 'Protocolo de seguridad del centro', sugerencia_sticker: 'encuesta' },
        { orden: 4, rol: 'CTA', nombre: 'Cierre', proposito: 'Consulta para casos particulares', sugerencia_sticker: 'enlace_o_mensaje' }
      ]
    },
    {
      id: 'problema_explicacion_cta',
      nombre: 'Problema → Explicación → CTA',
      categoria_principal: 'lead_magnet',
      descripcion: 'Diagnóstico de dolor común, fundamentación técnica y entrega de recurso.',
      duracion_historias: 4,
      pasos: [
        { orden: 1, rol: 'GANCHO', nombre: 'Problema Frecuente', proposito: 'Señalar error o dolor en consulta', sugerencia_sticker: 'encuesta' },
        { orden: 2, rol: 'DESARROLLO', nombre: 'Fundamento Clínico', proposito: 'Explicar la anatomía o margen operativo', sugerencia_sticker: 'ninguno' },
        { orden: 3, rol: 'INSIGHT', nombre: 'El Recurso Gratuito', proposito: 'Presentar plantilla o guía', sugerencia_sticker: 'cuestionario' },
        { orden: 4, rol: 'CTA', nombre: 'Entrega por DM', proposito: 'Pide la palabra clave en mensaje', sugerencia_sticker: 'enlace_o_mensaje' }
      ]
    },
    {
      id: 'demostracion_servicio',
      nombre: 'Demostración de Servicio',
      categoria_principal: 'libre_humanizacion',
      descripcion: 'Recorrido por la experiencia del paciente en cabina o consultorio.',
      duracion_historias: 4,
      pasos: [
        { orden: 1, rol: 'GANCHO', nombre: 'Entrada a Cabina', proposito: 'Mostrar ambiente profesional y aséptico', sugerencia_sticker: 'deslizador_emoji' },
        { orden: 2, rol: 'DESARROLLO', nombre: 'Aplicación / Protocolo', proposito: 'Detalle de insumos y técnica cuidada', sugerencia_sticker: 'ninguno' },
        { orden: 3, rol: 'INSIGHT', nombre: 'Sensación Inmediata', proposito: 'Comodidad y bienestar del paciente', sugerencia_sticker: 'caja_preguntas' },
        { orden: 4, rol: 'CTA', nombre: 'Disponibilidad de Cita', proposito: 'Invitar a reservar valoración', sugerencia_sticker: 'enlace_o_mensaje' }
      ]
    }
  ];

  function generateStoriesSequence(options = {}) {
    if (!library.isLoaded) throw new Error('GlossContentEngine no inicializado.');

    const treatmentId = (options.treatment_id === 'negocio_marketing_general' ? 'adquisicion_pacientes_cac' : options.treatment_id) || 'rinomodelacion';
    const treatment = getTreatmentById(treatmentId) || (library.treatments && library.treatments[0]) || { id: treatmentId, nombre_habitual: 'Tratamiento Estético' };
    const tName = treatment ? treatment.nombre_habitual : 'Tratamiento Estético';
    const isB2B = treatment && (treatment.categoria === 'negocio_marketing' || treatment.categoria === 'b2b');
    const cat = treatment ? (treatment.categoria || (isB2B ? 'negocio_marketing' : 'medicina_estetica')) : 'medicina_estetica';
    const isSpa = cat === 'spa_bienestar';
    const isFacial = cat === 'estetica_facial';
    const isCorporal = cat === 'estetica_corporal';
    const isDepilacion = cat === 'depilacion';
    const isMedical = cat === 'medicina_estetica';
    const isAd = options.format === 'anuncio' || options.is_ad === true || options.objective === 'conversion';

    const categories = (library.stories && Array.isArray(library.stories.categories) && library.stories.categories.length > 0)
      ? library.stories.categories
      : DEFAULT_STORIES_CATEGORIES;
    const structures = (library.stories && Array.isArray(library.stories.structures) && library.stories.structures.length > 0)
      ? library.stories.structures
      : DEFAULT_STORIES_STRUCTURES;
    const stickers = (library.stories && Array.isArray(library.stories.interactive_stickers) && library.stories.interactive_stickers.length > 0)
      ? library.stories.interactive_stickers
      : [
          { id: 'caja_preguntas', nombre: 'Caja de Preguntas' },
          { id: 'encuesta', nombre: 'Encuesta (2 opciones)' },
          { id: 'deslizador_emoji', nombre: 'Deslizador de Reacción' },
          { id: 'enlace_o_mensaje', nombre: 'Sticker de Enlace / DM' },
          { id: 'cuenta_regresiva', nombre: 'Cuenta Regresiva' },
          { id: 'cuestionario', nombre: 'Quiz / Cuestionario' },
          { id: 'ninguno', nombre: 'Sin Sticker' }
        ];

    const categoryId = options.category_id || options.category || 'one_shot';
    const category = categories.find(c => c.id === categoryId) || categories[0] || { id: categoryId, nombre: categoryId };

    const requestedStructureId = options.structure_id || 'pregunta_respuesta';
    const structure = structures.find(s => s.id === requestedStructureId) || structures[0] || {
      id: requestedStructureId,
      nombre: 'Pregunta → Respuesta',
      pasos: []
    };

    const count = Math.max(1, Math.min(6, parseInt(options.count || (structure.pasos ? structure.pasos.length : 4), 10)));
    const formatPref = options.format_mode || options.format_preference || 'mixto';

    const topic = (options.topic_id ? library.topics.find(t => t.topic_id === options.topic_id) : null) ||
                  (library.topics && treatment ? library.topics.find(t => t.treatment_id === (treatment.id || treatment.treatment_id)) : null) ||
                  (library.topics && library.topics[0]) || null;

    const prob = cleanText(options.custom_problem || (topic ? topic.problem : (treatment.miedos ? treatment.miedos[0] : 'dudas con el procedimiento')));
    const sol = cleanText(options.custom_solution || (topic ? topic.value_proposition : treatment.descripcion_clinica));
    const tech = treatment.temas_tecnicos || 'la anatomía y profundidad del plano de aplicación';

    const steps = structure.pasos && structure.pasos.length > 0 ? structure.pasos : [
      { orden: 1, rol: 'GANCHO', nombre: 'Apertura', sugerencia_sticker: 'caja_preguntas' },
      { orden: 2, rol: 'DESARROLLO', nombre: 'Explicación', sugerencia_sticker: 'ninguno' },
      { orden: 3, rol: 'INSIGHT', nombre: 'Criterio', sugerencia_sticker: 'encuesta' },
      { orden: 4, rol: 'CTA', nombre: 'Cierre', sugerencia_sticker: 'enlace_o_mensaje' }
    ];

    const stories = [];
    for (let i = 0; i < count; i++) {
      const stepIdx = Math.min(i, steps.length - 1);
      const step = steps[stepIdx];
      const storyNum = i + 1;
      const isFirst = i === 0;
      const isLast = i === count - 1;

      let mode = 'talking_head';
      if (formatPref === 'broll_text') mode = 'broll_text';
      else if (formatPref === 'talking_head') mode = 'talking_head';
      else {
        mode = (i % 2 === 0) ? 'talking_head' : 'broll_text';
      }

      let stickerId = step.sugerencia_sticker || 'ninguno';
      if (isLast) stickerId = 'enlace_o_mensaje';
      else if (categoryId === 'encuestas' && isFirst) stickerId = 'encuesta';
      else if (categoryId === 'urgencia' && isLast) stickerId = 'cuenta_regresiva';

      const foundSticker = stickers.find(s => s.id === stickerId) || { id: stickerId, nombre: stickerId };

      let screenText = '';
      let verbalScript = '';
      let visualDirection = '';
      let transition = '';

      if (isFirst) {
        if (isB2B) {
          screenText = '¿TU CLÍNICA FACTURA PERO NO DEJA UTILIDAD?';
        } else if (isSpa) {
          screenText = '¿NECESITAS UNA PAUSA REAL DE DESCONEXIÓN?';
        } else if (isFacial) {
          screenText = 'LO QUE DEBES SABER ANTES DE TU LIMPIEZA FACIAL';
        } else if (isCorporal) {
          screenText = 'EL ENFOQUE RESPONSABLE EN MOLDEAMIENTO CORPORAL';
        } else if (isDepilacion) {
          screenText = 'LÁSER DIODO: LO QUE NADIE TE CUENTA DE LAS SESIONES';
        } else {
          screenText = `LO QUE NADIE TE EXPLICA DE ${tName.toUpperCase()}`;
        }

        if (mode === 'talking_head') {
          if (isB2B) {
            verbalScript = 'Si eres director o dueño de clínica estética, mira esto antes de seguir invirtiendo en pauta sin medir márgenes.';
          } else if (isSpa) {
            verbalScript = 'En nuestro spa vemos a diario cómo las contracturas y el cansancio acumulado sobrecargan la espalda. En 3 historias te explico qué buscar en una pausa de bienestar real.';
          } else if (isFacial) {
            verbalScript = `En consulta nos preguntan mucho por ${prob.toLowerCase()}. Antes de agendar una limpieza profunda, te explico qué evaluar para no irritar tu barrera dérmica.`;
          } else if (isCorporal) {
            verbalScript = 'En estética corporal es clave hablar con honestidad: te explico cómo actúa el drenaje y la tonificación de cabina sin caer en falsas promesas de pérdida milagrosa de peso.';
          } else if (isDepilacion) {
            verbalScript = 'Si estás evaluando depilación láser, te explico en 3 historias por qué el fototipo Fitzpatrick y la fase anágena determinan la efectividad de cada sesión.';
          } else {
            verbalScript = `En consulta médica veo a muchos pacientes preocupados por ${prob.toLowerCase()}. Te explico en 3 historias qué aspectos de seguridad anatómica debes verificar.`;
          }
        } else {
          verbalScript = 'Sin locución hablada. Acompañar con música ambiental o audio en tendencia a bajo volumen.';
        }

        if (mode === 'talking_head') {
          if (isB2B) {
            visualDirection = 'Plano vertical 9:16 cerrado, consultor o directivo en entorno sobrio con tablet o panel de indicadores.';
          } else if (isSpa) {
            visualDirection = 'Plano medio 9:16 cálido, terapeuta con uniforme pulcro de spa en cabina ambientada con luz tenue y elementos botánicos.';
          } else if (isFacial) {
            visualDirection = 'Plano vertical 9:16 cerrado, cosmiatra con filipina impecable en cabina facial iluminada con luz neutra.';
          } else if (isCorporal) {
            visualDirection = 'Plano vertical cerrado, especialista corporal en cabina clínica junto a camilla y equipo de soporte.';
          } else if (isDepilacion) {
            visualDirection = 'Plano vertical cerrado, operadora certificada con gafas de protección en cuello y cabezal láser en mano.';
          } else {
            visualDirection = 'Plano vertical 9:16 cerrado, médico con bata o filipina clínica en consultorio habilitado, contacto visual directo y texto en tercio superior.';
          }
        } else {
          visualDirection = 'Video B-roll en cámara lenta con iluminación suave y texto de alto contraste en el centro de la zona segura.';
        }
        transition = 'Toca la pantalla para ver el detalle clave 👉';
      } else if (isLast) {
        if (isB2B) {
          screenText = 'DESCARGA NUESTRA CALCULADORA DE COSTOS DE CABINA';
        } else if (isSpa) {
          screenText = 'RESERVA TU EXPERIENCIA DE SPA Y BIENESTAR';
        } else if (isFacial) {
          screenText = 'AGENDA TU VALORACIÓN FACIAL EN CABINA';
        } else if (isCorporal) {
          screenText = 'AGENDA TU EVALUACIÓN CORPORAL DE CABINA';
        } else if (isDepilacion) {
          screenText = 'AGENDA TU PRUEBA DE FOTOTIPO LÁSER';
        } else {
          screenText = 'AGENDA TU VALORACIÓN CLÍNICA PRESENCIAL';
        }

        if (mode === 'talking_head') {
          if (isB2B) {
            verbalScript = 'Si quieres calcular tu punto de equilibrio o auditar tus costos por hora de cabina, toca el sticker de abajo para acceder a nuestras herramientas.';
          } else if (isSpa) {
            verbalScript = 'Regálate una pausa o comparte un ritual de bienestar. Toca el sticker interactivo de abajo o déjanos un mensaje para coordinar tu cita en el spa.';
          } else if (isFacial) {
            verbalScript = 'Cada tipo de piel tiene necesidades únicas. Toca el enlace de abajo para agendar tu valoración cosmiátrica en cabina y cuidar tu rostro.';
          } else if (isCorporal) {
            verbalScript = 'Diseñamos protocolos personalizados respetando la fisiología de tu cuerpo. Toca el botón interactivo de abajo para coordinar tu evaluación corporal.';
          } else if (isDepilacion) {
            verbalScript = 'Realizamos una prueba de disparo en tu piel antes de iniciar tu paquete de sesiones. Toca el sticker para reservar tu cita de valoración.';
          } else {
            verbalScript = 'Recuerda que cada paciente tiene proporciones únicas y requiere valoración médica individual. Toca el enlace o responde esta historia para agendar tu cita.';
          }
        } else {
          verbalScript = 'Sin locución hablada. Mostrar sticker interactivo centrado y visible para pulsación cómoda.';
        }

        if (isSpa) {
          visualDirection = 'Plano medio de la zona de bienvenida o cabina de spa con toallas enrolladas e infusión herbal, mostrando el sticker interactivo en la zona inferior cómoda para el pulgar.';
        } else {
          visualDirection = 'Plano medio de la clínica o consultorio con distintivo de habilitación REPS visible, mostrando el sticker interactivo en la zona inferior cómoda para el pulgar.';
        }
        transition = 'Última lámina de la secuencia · Llamado a la acción';
      } else {
        if (isB2B) {
          screenText = 'EL COSTO OCULTO QUE EROSIONA TU MARGEN';
        } else if (isSpa) {
          screenText = 'LA PRESIÓN GRADUAL Y EL DESCANSO MUSCULAR';
        } else if (isFacial) {
          screenText = 'LA BARRERA CUTÁNEA: POR QUÉ NO EXTRAER CON AGRESIVIDAD';
        } else if (isCorporal) {
          screenText = 'ESTÍMULO LINFÁTICO Y TONIFICACIÓN TISULAR';
        } else if (isDepilacion) {
          screenText = 'POR QUÉ RESPETAR EL CICLO DE CADA SESIÓN';
        } else {
          screenText = `POR QUÉ LA CLAVE ES ${tech.toUpperCase()}`;
        }

        if (mode === 'talking_head') {
          if (isB2B) {
            verbalScript = 'El error habitual es creer que vender más citas soluciona los problemas. Si tus costos de insumos y tiempos muertos no están costeados, pierdes margen en cada paciente.';
          } else if (isSpa) {
            verbalScript = 'En un buen masaje no se trata de apretar con fuerza excesiva, sino de trabajar la fascia con maniobras lentas y calor térmico para disolver el nudo sin dolor residual.';
          } else if (isFacial) {
            verbalScript = 'Una limpieza facial profesional no debe dejar marcas ni irritación profunda. Utilizamos activos queratolíticos suaves que desincrustan comedones respetando la barrera lipídica.';
          } else if (isCorporal) {
            verbalScript = 'Los resultados de cabina se logran al combinar aparatología calibrada con drenaje circulatorio. Si no hay constancia ni hidratación, el tejido retiene líquido nuevamente.';
          } else if (isDepilacion) {
            verbalScript = 'Si vienes a tu sesión con el vello sin rasurar o te depilaste con cera hace una semana, el láser pierde su blanco. El haz necesita encontrar la raíz en su fase activa.';
          } else {
            verbalScript = 'En una aplicación médica responsable no se busca volumen exagerado. Se mapea la estructura vascular y se utiliza producto sellado con registro Invima.';
          }
        } else {
          verbalScript = 'Sin locución hablada. Enfatizar el texto superpuesto en pantalla y la demostración de técnica en cabina.';
        }

        if (isSpa) {
          visualDirection = 'Toma de detalle de manos especializadas aplicando aceite botánico tibio sobre trapecio con maniobras fluidas y toalla tibia.';
        } else if (isFacial) {
          visualDirection = 'Detalle de aplicación delicada de activo exfoliante suave con gasa o pincel en zona T con lámpara de aumento.';
        } else if (isCorporal) {
          visualDirection = 'Toma de detalle del cabezal de radiofrecuencia o manipulación de drenaje linfático sobre tejido cutáneo con gel neutro.';
        } else if (isDepilacion) {
          visualDirection = 'Toma de detalle del cabezal de zafiro refrigerado emitiendo pulsos de luz sobre la zona con gafas puestas.';
        } else if (isB2B) {
          visualDirection = 'Gráfico de costos o profesional señalando el esquema de margen operativo en tablet.';
        } else {
          visualDirection = 'Toma de detalle mostrando el vial original sellado con registro Invima o médico señalando esquema anatómico en tablet.';
        }
        transition = `Desliza a la historia ${storyNum + 1} para ver la recomendación final 👉`;
      }

      stories.push({
        story_number: storyNum,
        role: step.rol || `PASO_${storyNum}`,
        objective: step.proposito || 'Educar a la audiencia',
        format_mode: mode,
        format_mode_label: mode === 'talking_head' ? 'Médico a cámara (Talking Head)' : 'Sin voz (B-roll + Texto)',
        screen_text: screenText,
        verbal_script: verbalScript,
        visual_direction: visualDirection,
        visual_cue: visualDirection,
        sticker_id: stickerId,
        sticker_name: foundSticker.nombre || stickerId,
        next_transition: transition,
        transition_to_next: transition
      });
    }

    const seqId = `GG-STORY-${Date.now().toString(36).toUpperCase()}`;
    const ethicalWarning = categoryId === 'urgencia'
      ? 'Aviso de Urgencia Ética: Solo publicar fechas límite o cupos reales del centro. Prohibido inventar escasez artificial.'
      : 'Cumplimiento Resolución 3100 de 2019 / Ley 711 de 2001. No emitir diagnósticos remotos sin consulta presencial.';

    return {
      sequence_id: seqId,
      title: `Secuencia: ${tName} · ${(structure && structure.nombre) || 'Historias'}`,
      treatment_id: treatment ? (treatment.id || treatment.treatment_id || treatmentId) : treatmentId,
      treatment_name: tName,
      category_id: (category && category.id) || categoryId,
      category_name: (category && category.nombre) || categoryId,
      structure_id: (structure && structure.id) || requestedStructureId,
      structure_name: (structure && structure.nombre) || requestedStructureId,
      total_stories: stories.length,
      stories,
      ethical_warning: ethicalWarning,
      created_at: new Date().toISOString()
    };
  }

  function formatStoriesClipboard(storiesData) {
    if (!storiesData) return '';
    if (typeof GlossReportEngine !== 'undefined' && GlossReportEngine.generateStoriesClipboard) {
      return GlossReportEngine.generateStoriesClipboard(storiesData);
    }
    if (typeof require !== 'undefined') {
      try {
        const path = require('path');
        const reportEngine = require(path.resolve(__dirname, '../report-engine.js'));
        if (reportEngine && reportEngine.generateStoriesClipboard) {
          return reportEngine.generateStoriesClipboard(storiesData);
        }
      } catch (e) {}
    }
    return (storiesData.stories || []).map((s, i) => `[Story ${i+1}] ${s.screen_text} (${s.sticker_name})`).join('\n');
  }

  function exportStoriesPdf(storiesData, customFilename = null) {
    if (typeof GlossReportEngine !== 'undefined' && GlossReportEngine.generateStoriesPdf) {
      return GlossReportEngine.generateStoriesPdf(storiesData, customFilename);
    }
    if (typeof require !== 'undefined') {
      try {
        const path = require('path');
        const reportEngine = require(path.resolve(__dirname, '../report-engine.js'));
        if (reportEngine && reportEngine.generateStoriesPdf) {
          return reportEngine.generateStoriesPdf(storiesData, customFilename);
        }
      } catch (e) {}
    }
    throw new Error('GlossReportEngine no disponible para exportar PDF de historias.');
  }

  function saveStoriesSequence(seq, meta = {}) {
    if (!seq || !seq.sequence_id) throw new Error('Secuencia inválida para guardar');
    const name = `Historias: ${seq.treatment_name} · ${seq.structure_name} (${seq.stories.length} historias)`;
    if (typeof GlossStorage !== 'undefined' && GlossStorage.saveAnalysis) {
      return GlossStorage.saveAnalysis(STORIES_TOOL_KEY, name, seq, {
        summary: {
          treatment: seq.treatment_name,
          structure: seq.structure_name,
          category: seq.category_name,
          storiesCount: seq.stories.length
        },
        ...meta
      });
    }
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('gloss_ec_historias_v1') || '[]';
      const list = JSON.parse(raw);
      const record = { id: seq.sequence_id, savedAt: new Date().toISOString(), sequence: seq, meta };
      list.unshift(record);
      localStorage.setItem('gloss_ec_historias_v1', JSON.stringify(list));
      return record;
    }
    const record = { id: seq.sequence_id, savedAt: new Date().toISOString(), sequence: seq, meta };
    memStories.unshift(record);
    return record;
  }

  function getSavedStoriesSequences() {
    if (typeof GlossStorage !== 'undefined' && GlossStorage.getSavedAnalyses) {
      const analyses = GlossStorage.getSavedAnalyses(STORIES_TOOL_KEY);
      return analyses.map(a => ({
        id: a.id,
        name: a.name,
        savedAt: a.createdAt,
        sequence: a.inputs,
        meta: a.summary || {}
      }));
    }
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('gloss_ec_historias_v1') || '[]';
      return JSON.parse(raw);
    }
    return [...memStories];
  }

  function deleteStoriesSequence(id) {
    if (typeof GlossStorage !== 'undefined' && GlossStorage.deleteAnalysis) {
      return GlossStorage.deleteAnalysis(id);
    }
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('gloss_ec_historias_v1') || '[]';
      let list = JSON.parse(raw);
      const initial = list.length;
      list = list.filter(item => item.id !== id && (item.sequence && item.sequence.sequence_id !== id));
      localStorage.setItem('gloss_ec_historias_v1', JSON.stringify(list));
      return list.length !== initial;
    }
    const idx = memStories.findIndex(item => item.id === id || (item.sequence && item.sequence.sequence_id === id));
    if (idx !== -1) {
      memStories.splice(idx, 1);
      return true;
    }
    return false;
  }

  function getStoriesCategories() {
    const raw = (library.stories && Array.isArray(library.stories.categories) && library.stories.categories.length > 0)
      ? library.stories.categories
      : DEFAULT_STORIES_CATEGORIES;
    return raw.map(c => ({
      id: c.id,
      category_id: c.id,
      nombre: c.nombre,
      descripcion: c.descripcion || '',
      icono: c.icono || '📱',
      requiere_datos_reales: !!c.requiere_datos_reales,
      advertencia_etica: c.advertencia_etica || null
    }));
  }

  function getStoriesStructures() {
    const raw = (library.stories && Array.isArray(library.stories.structures) && library.stories.structures.length > 0)
      ? library.stories.structures
      : DEFAULT_STORIES_STRUCTURES;
    return raw.map(s => ({
      id: s.id,
      structure_id: s.id,
      nombre: s.nombre,
      categoria_principal: s.categoria_principal,
      descripcion: s.descripcion || '',
      duracion_historias: s.duracion_historias || 4,
      pasos: s.pasos || []
    }));
  }

  // =========================================================================
  // FASE 3 / ETAPA C: CALENDARIO EDITORIAL MVP
  // =========================================================================

  const CALENDAR_STORAGE_KEY = 'gloss_ec_calendar_events_v1';
  const CALENDAR_TOOL_KEY = 'estudio_contenido_calendario';
  let memCalendarEvents = [];

  const FORMAT_TYPES = {
    reel: { id: 'reel', label: 'Reel (Video corto)', badge: 'Reel', color: '#8C2536' },
    carrusel: { id: 'carrusel', label: 'Carrusel (Educativo)', badge: 'Carrusel', color: '#1E3A8A' },
    historia: { id: 'historia', label: 'Historia (Interacción)', badge: 'Historia', color: '#B45309' },
    anuncio: { id: 'anuncio', label: 'Anuncio (Ad pauta)', badge: 'Anuncio', color: '#065F46' }
  };

  const STATUS_TYPES = {
    pendiente: { id: 'pendiente', label: 'Pendiente', badgeClass: 'ec-status-pendiente' },
    por_grabar: { id: 'por_grabar', label: 'Por grabar', badgeClass: 'ec-status-por_grabar' },
    en_edicion: { id: 'en_edicion', label: 'En edición', badgeClass: 'ec-status-en_edicion' },
    listo: { id: 'listo', label: 'Listo', badgeClass: 'ec-status-listo' },
    publicado: { id: 'publicado', label: 'Publicado', badgeClass: 'ec-status-publicado' }
  };

  function getCalendarEvents(filters = {}) {
    let list = [];
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(CALENDAR_STORAGE_KEY);
        if (raw !== null && raw !== '') {
          list = JSON.parse(raw);
        } else {
          list = [];
        }
      } catch (e) {
        console.warn('GlossContentEngine: error al leer calendario', e);
        list = [];
      }
    } else {
      list = [...memCalendarEvents];
    }

    // Ordenar cronológicamente (fecha asc, hora asc)
    list.sort((a, b) => {
      const dComp = (a.date || '').localeCompare(b.date || '');
      if (dComp !== 0) return dComp;
      return (a.time || '10:00').localeCompare(b.time || '10:00');
    });

    // Filtros opcionales
    if (filters.type && filters.type !== 'todos') {
      list = list.filter(e => e.type === filters.type);
    }
    if (filters.status && filters.status !== 'todos') {
      list = list.filter(e => e.status === filters.status);
    }
    if (filters.month) { // 'YYYY-MM'
      list = list.filter(e => e.date && e.date.startsWith(filters.month));
    }
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(e =>
        (e.title && e.title.toLowerCase().includes(q)) ||
        (e.treatment_name && e.treatment_name.toLowerCase().includes(q)) ||
        (e.notes && e.notes.toLowerCase().includes(q))
      );
    }

    return list;
  }

  function _saveCalendarList(list) {
    memCalendarEvents = [...list];
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(list));
      } catch (e) {
        console.warn('GlossContentEngine: error al persistir calendario en localStorage', e);
      }
    }
    // Sincronizar copia en GlossStorage
    if (typeof GlossStorage !== 'undefined' && GlossStorage.saveAnalysis) {
      try {
        GlossStorage.saveAnalysis(CALENDAR_TOOL_KEY, 'Cronograma Editorial Actualizado', {
          events: list,
          total: list.length,
          lastUpdated: new Date().toISOString()
        }, {
          summary: {
            total: list.length,
            reels: list.filter(e => e.type === 'reel').length,
            carruseles: list.filter(e => e.type === 'carrusel').length,
            historias: list.filter(e => e.type === 'historia').length,
            anuncios: list.filter(e => e.type === 'anuncio').length
          }
        });
      } catch (e) {
        // silently fallback
      }
    }
  }

  function saveCalendarEvent(eventData) {
    if (!eventData || !eventData.title || !eventData.date) {
      throw new Error('El evento debe tener al menos título y fecha');
    }

    const currentList = getCalendarEvents();
    const id = eventData.id || ('cal_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5));

    const cleanEvent = {
      id,
      title: String(eventData.title).trim(),
      date: String(eventData.date).trim(), // YYYY-MM-DD
      time: eventData.time ? String(eventData.time).trim() : '10:00',
      type: FORMAT_TYPES[eventData.type] ? eventData.type : 'reel',
      status: STATUS_TYPES[eventData.status] ? eventData.status : 'pendiente',
      treatment_id: eventData.treatment_id || '',
      treatment_name: eventData.treatment_name ? String(eventData.treatment_name).trim() : 'General',
      hook_verbal: eventData.hook_verbal ? String(eventData.hook_verbal).trim() : '',
      notes: eventData.notes ? String(eventData.notes).trim() : '',
      source_type: eventData.source_type || 'manual', // 'idea', 'script', 'gancho', 'manual'
      source_id: eventData.source_id || null,
      created_at: eventData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const existingIdx = currentList.findIndex(e => e.id === id);
    if (existingIdx >= 0) {
      currentList[existingIdx] = cleanEvent;
    } else {
      currentList.push(cleanEvent);
    }

    _saveCalendarList(currentList);
    return cleanEvent;
  }

  function deleteCalendarEvent(id) {
    if (!id) return false;
    const currentList = getCalendarEvents();
    const updated = currentList.filter(e => e.id !== id);
    _saveCalendarList(updated);
    return true;
  }

  function updateCalendarEventStatus(id, newStatus) {
    if (!id || !STATUS_TYPES[newStatus]) return false;
    const currentList = getCalendarEvents();
    const evt = currentList.find(e => e.id === id);
    if (!evt) return false;
    evt.status = newStatus;
    evt.updated_at = new Date().toISOString();
    _saveCalendarList(currentList);
    return evt;
  }

  function updateCalendarEventDate(id, newDate, newTime = null) {
    if (!id || !newDate) return false;
    const currentList = getCalendarEvents();
    const evt = currentList.find(e => e.id === id);
    if (!evt) return false;
    evt.date = newDate;
    if (newTime) evt.time = newTime;
    evt.updated_at = new Date().toISOString();
    _saveCalendarList(currentList);
    return evt;
  }

  function seedCalendarWithSampleEvents() {
    const today = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const y = today.getFullYear();
    const m = pad(today.getMonth() + 1);

    const sampleEvents = [
      {
        title: '3 mitos sobre el dolor y la hinchazón en aumento de labios',
        date: `${y}-${m}-04`,
        time: '11:00',
        type: 'reel',
        status: 'listo',
        treatment_name: 'Ácido Hialurónico (Labios y Surcos)',
        hook_verbal: 'Si crees que los labios quedan deformes los primeros días, mira esto antes de agendar.',
        notes: 'Grabación en cabina con jeringa demostrativa estéril y primer plano de labios hidratados.',
        source_type: 'idea'
      },
      {
        title: 'Diferencia real entre toxina botulínica y relleno de ácido hialurónico',
        date: `${y}-${m}-08`,
        time: '17:00',
        type: 'carrusel',
        status: 'en_edicion',
        treatment_name: 'Toxina Botulínica Facial',
        hook_verbal: 'No hacen lo mismo: uno relaja la musculatura, el otro repone volumen.',
        notes: 'Slide 1: Anatomía muscular. Slide 2: Zona periocular vs tercio medio. Slide 3: Duración y mantenimiento.',
        source_type: 'idea'
      },
      {
        title: '¿Por qué tu limpieza facial casera no elimina los puntos negros profundos?',
        date: `${y}-${m}-12`,
        time: '12:30',
        type: 'reel',
        status: 'por_grabar',
        treatment_name: 'Limpieza Facial Profunda e Hidrafacial',
        hook_verbal: 'Apretar tus poros en casa solo rompe capilares y deja manchas.',
        notes: 'Enfoque en succión controlada con hidrodermoabrasión y extracción con espátula ultrasónica.',
        source_type: 'script'
      },
      {
        title: 'Ronda de preguntas: ¿Cuánto dura realmente el efecto del botox en tercio superior?',
        date: `${y}-${m}-16`,
        time: '18:00',
        type: 'historia',
        status: 'pendiente',
        treatment_name: 'Toxina Botulínica Facial',
        hook_verbal: 'Sticker de preguntas en Instagram Stories para responder objeciones de pacientes.',
        notes: 'Responder 4 historias con doctora explicando metabolismo y dosis fisiológica.',
        source_type: 'manual'
      },
      {
        title: 'Campaña Ad: Evaluación personalizada de armonización facial',
        date: `${y}-${m}-22`,
        time: '09:00',
        type: 'anuncio',
        status: 'por_grabar',
        treatment_name: 'Armonización Facial Completa',
        hook_verbal: 'La medicina estética moderna no cambia tu rostro, restaura proporciones que el tiempo atenuó.',
        notes: 'Video formato 9:16 con llamado a agendamiento de valoración médica presencial.',
        source_type: 'idea'
      }
    ];

    sampleEvents.forEach(evt => saveCalendarEvent(evt));
    return getCalendarEvents();
  }

  function clearCalendar() {
    memCalendarEvents = [];
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(CALENDAR_STORAGE_KEY);
      } catch (e) {}
    }
    return true;
  }

  function formatCalendarSummaryClipboard(events, options = {}) {
    const evts = events || getCalendarEvents();
    if (typeof GlossReportEngine !== 'undefined' && GlossReportEngine.generateCalendarClipboard) {
      return GlossReportEngine.generateCalendarClipboard(evts, options);
    }
    return evts.map((e, idx) => `[${idx + 1}] ${e.date} (${e.type.toUpperCase()} - ${e.status}) ${e.title} · ${e.treatment_name}`).join('\n');
  }

  function exportCalendarPdf(events, options = {}) {
    const evts = events || getCalendarEvents();
    if (typeof GlossReportEngine !== 'undefined' && GlossReportEngine.generateCalendarPdf) {
      return GlossReportEngine.generateCalendarPdf(evts, options);
    }
    alert('El generador de PDF no está disponible en este momento.');
    return null;
  }

  // =========================================================================
  // UTILIDADES INTERNAS
  // =========================================================================

  function getFamilyName(code) {
    const found = library.families.find(f => f.codigo === code);
    return found ? found.nombre : code;
  }

  function cleanText(str) {
    if (!str) return '';
    return str.replace(/[«»"]/g, '').trim();
  }

  // =========================================================================
  // API PÚBLICA
  // =========================================================================

  return {
    init,
    generate,
    getTreatments,
    getTreatmentById,
    getTopics,
    getFamilies,
    getNarrativeStructures,
    getCarouselArchetypes,
    formatProposalClipboard,
    generateBatchClipboard,
    exportBatchPdf,
    saveFavorite,
    getFavorites,
    deleteFavorite,
    // FASE 3: Ideas y Estructurador de Reels
    generateIdeas,
    generateReelScript,
    formatIdeaClipboard,
    formatIdeasBatchClipboard,
    formatReelScriptClipboard,
    saveIdea,
    getSavedIdeas,
    deleteIdea,
    exportIdeasPdf,
    saveScript,
    getSavedScripts,
    deleteScript,
    exportReelScriptPdf,
    // FASE 4: Editor de Carruseles y Generador de Historias
    generateCarousel,
    formatCarouselClipboard,
    exportCarouselPdf,
    saveCarousel,
    getSavedCarousels,
    deleteCarousel,
    generateStoriesSequence,
    formatStoriesClipboard,
    exportStoriesPdf,
    saveStoriesSequence,
    getSavedStoriesSequences,
    deleteStoriesSequence,
    getStoriesCategories,
    getStoriesStructures,
    // ETAPA C: Calendario Editorial MVP
    FORMAT_TYPES,
    STATUS_TYPES,
    getCalendarEvents,
    saveCalendarEvent,
    deleteCalendarEvent,
    updateCalendarEventStatus,
    updateCalendarEventDate,
    seedCalendarWithSampleEvents,
    clearCalendar,
    formatCalendarSummaryClipboard,
    exportCalendarPdf,
    _library: library
  };
}));
