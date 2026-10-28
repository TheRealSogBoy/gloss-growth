/**
 * GLOSS & GROWTH — Diagnóstico Interactivo de Marketing y Gestión Comercial
 * Algoritmo determinista de evaluación para centros de estética, consultorios y clínicas.
 *
 * Características:
 * - 12 preguntas agrupadas en 4 dimensiones estratégicas (3 preguntas por dimensión).
 * - Puntuación determinista transparente de 12 a 48 puntos (normalizada a 100%).
 * - Diagnóstico por dimensión: Fortalezas, Riesgos y Prioridades Operativas.
 * - Recomendaciones personalizadas con enlaces contextuales a herramientas de Gloss Growth.
 * - Cero PII obligatoria: 100% ejecutable localmente sin bloqueo de datos personales.
 */

(function () {
  'use strict';

  // Banco de preguntas estructuradas
  const QUESTIONS = [
    // --- DIMENSIÓN 1: CAPTACIÓN DE PACIENTES ---
    {
      id: 1,
      dimension: 'captacion',
      dimensionLabel: 'Captación de Pacientes',
      title: '¿Cuál es la principal fuente de nuevos pacientes en tu centro o clínica?',
      desc: 'Analiza de dónde proviene el mayor volumen de personas que asisten a una primera valoración.',
      options: [
        { text: 'Dependemos casi exclusivamente del voz a voz; si los pacientes no recomiendan, la agenda se vacía.', score: 1 },
        { text: 'Publicamos en Instagram con frecuencia, pero los mensajes son esporádicos y de bajo compromiso.', score: 2 },
        { text: 'Hacemos pauta activa en Meta o Google ocasionalmente, con resultados variables que no medimos a fondo.', score: 3 },
        { text: 'Contamos con un sistema predecible y continuo de adquisición digital con costo por consulta medido.', score: 4 }
      ]
    },
    {
      id: 2,
      dimension: 'captacion',
      dimensionLabel: 'Captación de Pacientes',
      title: '¿Cómo gestionas la inversión publicitaria mensual (Meta Ads o Google Ads)?',
      desc: 'Examina si cuentas con un presupuesto planificado o inviertes de forma reactiva según el movimiento del mes.',
      options: [
        { text: 'No invertimos en publicidad pagada o solo hemos usado el botón «Promocionar publicación».', score: 1 },
        { text: 'Invertimos sumas variables cuando vemos la agenda vacía, sin saber con certeza el retorno de cada peso.', score: 2 },
        { text: 'Asignamos un presupuesto mensual fijo y revisamos métricas básicas como clics y mensajes recibidos.', score: 3 },
        { text: 'Medimos costo por conversación, costo por cita asistida y retorno comercial (ROAS) por tratamiento.', score: 4 }
      ]
    },
    {
      id: 3,
      dimension: 'captacion',
      dimensionLabel: 'Captación de Pacientes',
      title: '¿Qué tan clara y diferenciada es la propuesta de valor de tus tratamientos clave?',
      desc: 'Evalúa cómo percibe el paciente tus procedimientos frente a la competencia de tu misma zona.',
      options: [
        { text: 'Ofrecemos prácticamente los mismos tratamientos y precios que el resto de centros de la zona.', score: 1 },
        { text: 'Mencionamos la tecnología o las marcas de productos que usamos, pero los pacientes siempre comparan por precio.', score: 2 },
        { text: 'Destacamos la experiencia y criterio de nuestro equipo médico, logrando justificar precios medios-altos.', score: 3 },
        { text: 'Tenemos protocolos propios, comunicación de autoridad y posicionamiento enfocado en resultados clínicos demostrables.', score: 4 }
      ]
    },

    // --- DIMENSIÓN 2: CONVERSIÓN Y GESTIÓN EN WHATSAPP ---
    {
      id: 4,
      dimension: 'conversion',
      dimensionLabel: 'Conversión y WhatsApp',
      title: '¿Cuánto tiempo tarda tu equipo en responder un mensaje de un paciente potencial en WhatsApp?',
      desc: 'El tiempo de primera respuesta es el factor que más correlaciona con la tasa de agendamiento.',
      options: [
        { text: 'Horas o incluso de un día para otro; responde quien tenga disponibilidad en recepción entre citas.', score: 1 },
        { text: 'Entre 30 minutos y 2 horas durante horario laboral; fuera de horario nadie responde.', score: 2 },
        { text: 'Menos de 15 minutos en horario comercial, con un mensaje automático de bienvenida fuera de turno.', score: 3 },
        { text: 'Menos de 5 minutos con protocolo comercial claro y personal dedicado exclusivamente a la atención de consultas.', score: 4 }
      ]
    },
    {
      id: 5,
      dimension: 'conversion',
      dimensionLabel: 'Conversión y WhatsApp',
      title: 'Cuando una persona pregunta «¿Cuánto cuesta el tratamiento?», ¿cómo responde tu centro?',
      desc: 'Analiza el guion de respuesta ante la objeción de precio más frecuente de la medicina estética.',
      options: [
        { text: 'Damos el precio de inmediato en seco y esperamos a que la persona vuelva a escribir.', score: 1 },
        { text: 'Enviamos un mensaje predeterminado largo con lista de precios o un PDF de catálogo.', score: 2 },
        { text: 'Damos un rango de precio e intentamos invitar amablemente a una cita de valoración presencial.', score: 3 },
        { text: 'Hacemos una pregunta de cualificación previa, explicamos qué determina la indicación y guiamos hacia la agenda.', score: 4 }
      ]
    },
    {
      id: 6,
      dimension: 'conversion',
      dimensionLabel: 'Conversión y WhatsApp',
      title: '¿Qué seguimiento realizas a las personas que mostraron interés pero no agendaron?',
      desc: 'Gran parte de las decisiones de valoración en medicina estética se consolidan durante los días posteriores al primer contacto, cuando existe un acompañamiento estructurado.',
      options: [
        { text: 'Ninguno. Asumimos que si la persona realmente tiene interés volverá a escribir por iniciativa propia.', score: 1 },
        { text: 'Esporádico; de vez en cuando enviamos una promoción o mensaje masivo a todos los contactos guardados.', score: 2 },
        { text: 'Hacemos 1 o 2 recordatorios manuales dentro de las primeras 48 horas si el chat quedó en visto.', score: 3 },
        { text: 'Protocolo estructurado de seguimiento por etapas en CRM, clasificando el motivo y reactivando con contenido clínico.', score: 4 }
      ]
    },

    // --- DIMENSIÓN 3: OPERACIÓN, CAPACIDAD Y RENTABILIDAD ---
    {
      id: 7,
      dimension: 'operacion',
      dimensionLabel: 'Operación y Capacidad',
      title: '¿Conoces el porcentaje de ocupación real de tus cabinas o sillones médicos?',
      desc: 'Las horas ociosas entre semana son el principal destructor del margen operativo de una clínica.',
      options: [
        { text: 'No lo medimos; solo sabemos si la semana se sintió «llena» o «quieta».', score: 1 },
        { text: 'Sabemos que los fines de semana estamos al tope, pero entre semana sobran muchos espacios libres.', score: 2 },
        { text: 'Calculamos el número de citas atendidas al mes, aunque no tenemos formalizado el costo por hora ociosa.', score: 3 },
        { text: 'Medimos ocupación porcentual mensual por sillón/profesional y diseñamos estrategias para franjas valle.', score: 4 }
      ]
    },
    {
      id: 8,
      dimension: 'operacion',
      dimensionLabel: 'Operación y Capacidad',
      title: '¿Cómo manejas las ausencias imprevistas (no-shows) y las cancelaciones de última hora?',
      desc: 'Una cita perdida sin aviso previo genera un costo fijo no recuperable para el consultorio.',
      options: [
        { text: 'Sufrimos una tasa alta de ausencias y nos enteramos cuando el paciente simplemente no llega.', score: 1 },
        { text: 'Enviamos un recordatorio el día anterior, pero seguimos experimentando cancelaciones frecuentes y huecos imprevistos en la agenda.', score: 2 },
        { text: 'Confirmamos en dos momentos (48h y 24h) y cobramos depósito de reserva para procedimientos de ticket alto.', score: 3 },
        { text: 'Protocolo riguroso de confirmación, depósito de valoración y lista de espera activa para reasignar huecos.', score: 4 }
      ]
    },
    {
      id: 9,
      dimension: 'operacion',
      dimensionLabel: 'Operación y Capacidad',
      title: '¿Conoces con exactitud el margen de contribución y el costo de insumos de cada tratamiento?',
      desc: 'En inyectables y aparatología, confundir facturación bruta con rentabilidad neta es un error habitual.',
      options: [
        { text: 'Solo miramos la facturación total al cierre del mes frente a los gastos generales de la cuenta bancaria.', score: 1 },
        { text: 'Sabemos cuánto cuesta el vial o el insumo principal, pero no incorporamos tiempo de sala ni depreciación de equipos.', score: 2 },
        { text: 'Tenemos costeados los insumos directos y fijamos precios buscando un margen estándar aceptable.', score: 3 },
        { text: 'Ficha técnica de costos unitarios por minuto de sillón, insumos descartables, depreciación y margen neto por procedimiento.', score: 4 }
      ]
    },

    // --- DIMENSIÓN 4: PRESENCIA DIGITAL Y REPUTACIÓN LOCAL ---
    {
      id: 10,
      dimension: 'presencia',
      dimensionLabel: 'Presencia Digital y Reputación',
      title: '¿Cómo está optimizada tu ficha de Google Business Profile (Google Maps)?',
      desc: 'El paciente local con dolor agudo o intención inmediata busca primero «médico estético cerca de mí» en Google Maps.',
      options: [
        { text: 'No tenemos ficha creada, está sin verificar o hace más de un año que nadie la actualiza.', score: 1 },
        { text: 'Está creada con datos básicos y fotos antiguas, pero no publicamos novedades ni gestionamos categorías.', score: 2 },
        { text: 'Está activa, con horarios correctos, fotos profesionales y catálogo de servicios actualizado periódicamente.', score: 3 },
        { text: 'Ficha líder en el ranking local de nuestra zona, con fotos constantes, productos, posts semanales y geolocalización sólida.', score: 4 }
      ]
    },
    {
      id: 11,
      dimension: 'presencia',
      dimensionLabel: 'Presencia Digital y Reputación',
      title: '¿Cómo gestionas las reseñas públicas y testimonios de tus pacientes?',
      desc: 'Las reseñas en Google son la prueba social con mayor impacto en la decisión de un paciente nuevo.',
      options: [
        { text: 'Tenemos menos de 10 reseñas o calificaciones negativas sin responder formalmente.', score: 1 },
        { text: 'Pedimos reseñas ocasionalmente solo a los pacientes más cercanos cuando nos acordamos.', score: 2 },
        { text: 'Superamos las 30 reseñas positivas y respondemos con educación a la mayoría de comentarios.', score: 3 },
        { text: 'Sistema protocolizado post-tratamiento que solicita reseñas de forma sistemática y supera las 100 opiniones con >4.8 estrellas.', score: 4 }
      ]
    },
    {
      id: 12,
      dimension: 'presencia',
      dimensionLabel: 'Presencia Digital y Reputación',
      title: '¿Tu sitio web facilita el contacto inmediato y la toma de decisiones del paciente?',
      desc: 'Una web estética no debe ser un folleto estático; debe responder dudas y conducir a la consulta.',
      options: [
        { text: 'No tenemos sitio web propio; dependemos exclusivamente de nuestro perfil de Instagram.', score: 1 },
        { text: 'Tenemos una web informativa básica, pero es lenta en móviles o difícil de navegar para pedir cita.', score: 2 },
        { text: 'Sitio web moderno con información clara de servicios, casos de antes y después y botón directo de WhatsApp.', score: 3 },
        { text: 'Plataforma web de autoridad, rápida en móviles, con contenido educativo de valor, calculadoras y embudos optimizados.', score: 4 }
      ]
    }
  ];

  // Estado de la aplicación de diagnóstico
  const state = {
    currentStep: 0, // 0 = Intro, 1..12 = Preguntas, 13 = Resultados
    answers: {},    // { [questionId]: optionIndex }
    scores: {
      captacion: 0,
      conversion: 0,
      operacion: 0,
      presencia: 0,
      total: 0,
      percentage: 0
    }
  };

  // Referencias al DOM
  const dom = {};

  function initDom() {
    dom.introSection = document.getElementById('diag-intro');
    dom.quizSection = document.getElementById('diag-quiz');
    dom.resultsSection = document.getElementById('diag-results');
    
    dom.btnStart = document.getElementById('diag-btn-start');
    dom.btnPrev = document.getElementById('diag-btn-prev');
    dom.btnRestart = document.getElementById('diag-btn-restart');
    dom.btnCopy = document.getElementById('diag-btn-copy');
    dom.btnPrint = document.getElementById('diag-btn-print');
    dom.btnWhatsApp = document.getElementById('diag-btn-whatsapp');

    dom.progressBar = document.getElementById('diag-progress-bar');
    dom.progressText = document.getElementById('diag-progress-text');
    dom.dimensionBadge = document.getElementById('diag-dim-badge');
    dom.questionTitle = document.getElementById('diag-q-title');
    dom.questionDesc = document.getElementById('diag-q-desc');
    dom.optionsContainer = document.getElementById('diag-options-container');

    // Resultados
    dom.scoreNumber = document.getElementById('diag-score-number');
    dom.scoreBadge = document.getElementById('diag-score-badge');
    dom.scoreDesc = document.getElementById('diag-score-desc');
    dom.weakestDimAlert = document.getElementById('diag-weakest-alert');
    dom.dimCaptacionBar = document.getElementById('diag-bar-captacion');
    dom.dimCaptacionVal = document.getElementById('diag-val-captacion');
    dom.dimConversionBar = document.getElementById('diag-bar-conversion');
    dom.dimConversionVal = document.getElementById('diag-val-conversion');
    dom.dimOperacionBar = document.getElementById('diag-bar-operacion');
    dom.dimOperacionVal = document.getElementById('diag-val-operacion');
    dom.dimPresenciaBar = document.getElementById('diag-bar-presencia');
    dom.dimPresenciaVal = document.getElementById('diag-val-presencia');
    dom.prioritiesList = document.getElementById('diag-priorities-list');
    dom.toolsGrid = document.getElementById('diag-tools-grid');
  }

  function bindEvents() {
    if (dom.btnStart) {
      dom.btnStart.addEventListener('click', () => {
        state.currentStep = 1;
        renderStep();
        if (window.GlossTrack) {
          window.GlossTrack.event('diagnostic_start', { step_number: 1 });
        }
      });
    }

    if (dom.btnPrev) {
      dom.btnPrev.addEventListener('click', () => {
        if (state.currentStep > 1) {
          state.currentStep--;
          renderStep();
        } else if (state.currentStep === 1) {
          state.currentStep = 0;
          renderStep();
        }
      });
    }

    if (dom.btnRestart) {
      dom.btnRestart.addEventListener('click', () => {
        state.currentStep = 0;
        state.answers = {};
        renderStep();
      });
    }

    if (dom.btnCopy) {
      dom.btnCopy.addEventListener('click', handleCopyResults);
    }

    if (dom.btnPrint) {
      dom.btnPrint.addEventListener('click', () => window.print());
    }
  }

  function renderStep() {
    window.scrollTo({ top: dom.introSection.parentElement.offsetTop - 40, behavior: 'smooth' });

    if (state.currentStep === 0) {
      dom.introSection.removeAttribute('hidden');
      dom.quizSection.setAttribute('hidden', '');
      dom.resultsSection.setAttribute('hidden', '');
      return;
    }

    if (state.currentStep >= 1 && state.currentStep <= 12) {
      dom.introSection.setAttribute('hidden', '');
      dom.quizSection.removeAttribute('hidden');
      dom.resultsSection.setAttribute('hidden', '');

      const qIndex = state.currentStep - 1;
      const q = QUESTIONS[qIndex];

      // Actualizar encabezados y progreso
      const progressPct = Math.round((state.currentStep / 12) * 100);
      dom.progressBar.style.width = `${progressPct}%`;
      dom.progressText.textContent = `Pregunta ${state.currentStep} de 12 (${progressPct}%)`;
      dom.dimensionBadge.textContent = q.dimensionLabel;
      dom.questionTitle.textContent = q.title;
      dom.questionDesc.textContent = q.desc;

      // Renderizar opciones
      dom.optionsContainer.innerHTML = '';
      q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'diag-option-btn';
        if (state.answers[q.id] === idx) {
          btn.classList.add('diag-option-btn--selected');
        }

        btn.innerHTML = `
          <div class="diag-option-indicator" aria-hidden="true">${String.fromCharCode(65 + idx)}</div>
          <div class="diag-option-text">${opt.text}</div>
        `;

        btn.addEventListener('click', () => {
          state.answers[q.id] = idx;
          btn.classList.add('diag-option-btn--selected');
          
          setTimeout(() => {
            if (state.currentStep < 12) {
              state.currentStep++;
              renderStep();
            } else {
              calculateResults();
              state.currentStep = 13;
              renderStep();
            }
          }, 240);
        });

        dom.optionsContainer.appendChild(btn);
      });
      return;
    }

    if (state.currentStep === 13) {
      dom.introSection.setAttribute('hidden', '');
      dom.quizSection.setAttribute('hidden', '');
      dom.resultsSection.removeAttribute('hidden');
      renderResultsUI();
    }
  }

  function calculateResults() {
    let dimScores = { captacion: 0, conversion: 0, operacion: 0, presencia: 0 };

    QUESTIONS.forEach(q => {
      const selectedIdx = state.answers[q.id];
      if (selectedIdx !== undefined) {
        const score = q.options[selectedIdx].score;
        dimScores[q.dimension] += score;
      }
    });

    state.scores.captacion = dimScores.captacion;
    state.scores.conversion = dimScores.conversion;
    state.scores.operacion = dimScores.operacion;
    state.scores.presencia = dimScores.presencia;

    const total = dimScores.captacion + dimScores.conversion + dimScores.operacion + dimScores.presencia;
    state.scores.total = total; // Min 12, Max 48
    // Normalizar a porcentaje: (total - 12) / (48 - 12) * 100
    state.scores.percentage = Math.round(((total - 12) / 36) * 100);

    if (window.GlossTrack) {
      window.GlossTrack.event('diagnostic_complete', {
        overall_score: state.scores.percentage,
        total_points: total,
        dim_captacion: dimScores.captacion,
        dim_conversion: dimScores.conversion,
        dim_operacion: dimScores.operacion,
        dim_presencia: dimScores.presencia
      });
    }
  }

  function renderResultsUI() {
    const pct = state.scores.percentage;
    dom.scoreNumber.textContent = `${pct}%`;

    let statusLabel = '';
    let statusDesc = '';
    let statusColor = '';

    if (pct < 40) {
      statusLabel = 'Nivel Operativo Vulnerable';
      statusDesc = 'Tu centro depende en exceso del azar o del voz a voz pasivo. Existen fugas críticas en la velocidad de respuesta comercial y capacidad ociosa no cuantificada.';
      statusColor = '#C2410C';
    } else if (pct < 70) {
      statusLabel = 'Nivel Operativo en Desarrollo con Fugas';
      statusDesc = 'Tienes bases comerciales activas e interés de pacientes, pero existen fugas importantes en la conversión de mensajes y en el aprovechamiento de la capacidad instalada por falta de protocolos continuos.';
      statusColor = '#B45309';
    } else if (pct < 88) {
      statusLabel = 'Nivel Estructurado y Estable';
      statusDesc = 'Operas con buen nivel de orden, protocolos claros y canales activos. El siguiente salto consiste en sistematizar la captación pagada y blindar la ocupación en franjas valle.';
      statusColor = '#15803D';
    } else {
      statusLabel = 'Nivel de Alta Madurez Comercial';
      statusDesc = 'Tu clínica opera como una empresa estructurada con predictibilidad de citas, protocolos rigurosos de WhatsApp y medición unitaria de márgenes de contribución.';
      statusColor = '#8C2536';
    }

    dom.scoreBadge.textContent = statusLabel;
    dom.scoreBadge.style.backgroundColor = `${statusColor}15`;
    dom.scoreBadge.style.color = statusColor;
    dom.scoreBadge.style.borderColor = statusColor;
    dom.scoreDesc.textContent = statusDesc;

    // Dimensiones (Min 3, Max 12 puntos por dimensión)
    // Convertir a %: (puntos - 3) / 9 * 100
    const dims = [
      { key: 'captacion', label: 'Captación de Pacientes', bar: dom.dimCaptacionBar, val: dom.dimCaptacionVal, score: state.scores.captacion },
      { key: 'conversion', label: 'Conversión y WhatsApp', bar: dom.dimConversionBar, val: dom.dimConversionVal, score: state.scores.conversion },
      { key: 'operacion', label: 'Operación y Capacidad', bar: dom.dimOperacionBar, val: dom.dimOperacionVal, score: state.scores.operacion },
      { key: 'presencia', label: 'Presencia Digital y Marca', bar: dom.dimPresenciaBar, val: dom.dimPresenciaVal, score: state.scores.presencia }
    ];

    let lowestDim = dims[0];

    dims.forEach(d => {
      const dPct = Math.round(((d.score - 3) / 9) * 100);
      d.bar.style.width = `${Math.max(10, dPct)}%`;
      d.val.textContent = `${dPct}% (${d.score}/12 pts)`;
      if (d.score < lowestDim.score) {
        lowestDim = d;
      }
    });

    // Alerta de dimensión más débil
    dom.weakestDimAlert.innerHTML = `
      <strong>Dimensión con mayor fuga identificada: ${lowestDim.label} (${Math.round(((lowestDim.score - 3) / 9) * 100)}%).</strong> 
      Aquí se concentran las mayores pérdidas de facturación y tiempo de tu equipo. Las 3 prioridades inmediatas a continuación se enfocan en resolver este cuello de botella.
    `;

    // Renderizar las 3 prioridades sugeridas
    renderPriorities(lowestDim.key);

    // Renderizar herramientas contextuales recomendadas
    renderRecommendedTools(lowestDim.key);

    // Configurar botón de WhatsApp
    if (dom.btnWhatsApp && window.GlossTrack) {
      const waMsg = `Hola Gloss Growth, completé el diagnóstico comercial en la web.\n\n` +
        `📊 *Mis resultados:*\n` +
        `• Puntuación global: ${pct}% (${statusLabel})\n` +
        `• Área de mayor riesgo: ${lowestDim.label}\n\n` +
        `Quisiera revisar mis 3 prioridades operativas con un consultor.`;
      dom.btnWhatsApp.href = window.GlossTrack.buildWhatsAppUrl('diagnostico', waMsg);
    }
  }

  function renderPriorities(weakestKey) {
    const PRIORITIES_MAP = {
      captacion: [
        {
          num: '01',
          title: 'Definir 1 o 2 tratamientos héroe y estandarizar su oferta',
          desc: 'Evita promocionar 15 tratamientos a la vez en redes. Selecciona el procedimiento con mayor margen y satisfacción, y enfoca tu comunicación en resolver una preocupación concreta del paciente.'
        },
        {
          num: '02',
          title: 'Implementar pauta publicitaria continua en Meta Ads con presupuesto controlado',
          desc: 'Deja de encender y apagar anuncios de forma reactiva. Una campaña continua de captación local con presupuesto mínimo predecible estabiliza el flujo semanal de consultas.'
        },
        {
          num: '03',
          title: 'Auditar el costo por valoración médica asistida',
          desc: 'Mide cuántos mensajes necesitas recibir para que una persona asista físicamente a la clínica. Si no conoces tu costo de captación por paciente, no puedes escalar con seguridad.'
        }
      ],
      conversion: [
        {
          num: '01',
          title: 'Reducir el tiempo de primera respuesta en WhatsApp a menos de 10 minutos',
          desc: 'Un paciente interesado en tratamientos estéticos suele consultar varias opciones en la misma jornada. Responder con agilidad, empatía y criterio clínico aumenta de forma decisiva la probabilidad de concretar la valoración.'
        },
        {
          num: '02',
          title: 'Eliminar las respuestas en seco ante la pregunta «¿Cuánto cuesta?»',
          desc: 'Entrena a tu equipo para formular una pregunta de cualificación anatómica o expectativa clínica antes de soltar un valor numérico, guiando hacia la necesidad de la valoración presencial.'
        },
        {
          num: '03',
          title: 'Implementar un protocolo de reactivación a las 48 horas y 5 días',
          desc: 'Construye un registro simple de interesados que no agendaron de inmediato. Un mensaje de seguimiento educativo («Hola Dra. / Sra., te comparto qué cuidados recomendamos antes de este tratamiento») recupera citas dormidas.'
        }
      ],
      operacion: [
        {
          num: '01',
          title: 'Calcular el porcentaje de ocupación semanal por sillón médico',
          desc: 'Registra cuántas horas de tus instalaciones estuvieron vacías de lunes a jueves. Multiplica esas horas por tus costos fijos de nómina y arriendo para conocer el costo real de tu capacidad ociosa.'
        },
        {
          num: '02',
          title: 'Cobrar depósito de reserva o anticipo para citas de valoración y procedimientos clave',
          desc: 'Un depósito de reserva deducible del tratamiento formaliza el compromiso del paciente, disminuye sensiblemente las ausencias no justificadas y protege el tiempo asistencial del profesional.'
        },
        {
          num: '03',
          title: 'Fichar los costos directos de insumos descartables por tratamiento',
          desc: 'Distingue facturación bruta de margen de contribución. Asegura que el precio de cada jeringa, ampolla o sesión cubra insumos descartables, tiempo médico y utilidad real de la empresa.'
        }
      ],
      presencia: [
        {
          num: '01',
          title: 'Optimizar exhaustivamente tu ficha de Google Business Profile (Google Maps)',
          desc: 'Verifica tu dirección, selecciona las categorías precisas («Clínica de cirugía plástica», «Médico estético», «Centro de estética»), sube fotos de tus instalaciones y publica novedades semanales.'
        },
        {
          num: '02',
          title: 'Estandarizar un protocolo de solicitud de reseñas a pacientes satisfechos',
          desc: 'Envía un enlace corto de Google Maps por WhatsApp a los 3 días de completado un procedimiento exitoso. Los centros con más de 50 reseñas de 5 estrellas generan confianza inmediata sin gastar en pauta.'
        },
        {
          num: '03',
          title: 'Adecuar tu presencia web para facilitar el agendamiento móvil',
          desc: 'Asegura que tu sitio web cargue en menos de 2 segundos en teléfonos móviles y cuente con botones flotantes visibles de contacto directo hacia WhatsApp.'
        }
      ]
    };

    const priorities = PRIORITIES_MAP[weakestKey] || PRIORITIES_MAP.captacion;
    dom.prioritiesList.innerHTML = priorities.map(p => `
      <div class="diag-priority-card">
        <div class="diag-priority-num">${p.num}</div>
        <div class="diag-priority-body">
          <h4 class="diag-priority-title">${p.title}</h4>
          <p class="diag-priority-desc">${p.desc}</p>
        </div>
      </div>
    `).join('');
  }

  function renderRecommendedTools(weakestKey) {
    const TOOLS_CATALOG = [
      {
        id: 'capacidad',
        title: 'Simulador de Capacidad Instalada',
        desc: 'Calcula las horas ociosas de tus sillones médicos y descubre cuánto te cuesta tener cabinas vacías.',
        url: '../capacidad-instalada/',
        highlight: weakestKey === 'operacion'
      },
      {
        id: 'publicidad',
        title: 'Calculadora de Presupuesto Publicitario',
        desc: 'Modela cuánto invertir en Meta Ads y estima el costo de adquisición de pacientes con rigor.',
        url: '../calculadora-publicidad/',
        highlight: weakestKey === 'captacion'
      },
      {
        id: 'aparatologia',
        title: 'Calculadora de Inversión en Aparatología',
        desc: 'Evalúa el punto de equilibrio y meses de retorno antes de comprar o financiar un equipo láser o corporal.',
        url: '../inversion-aparatologia/',
        highlight: weakestKey === 'operacion'
      },
      {
        id: 'estudio',
        title: 'Estudio de Contenido con IA',
        desc: 'Genera ganchos, guiones de Reels y secuencias de historias orientadas a pacientes con criterio clínico.',
        url: '../estudio-contenido/',
        highlight: weakestKey === 'presencia' || weakestKey === 'conversion'
      },
      {
        id: 'insights',
        title: 'Gloss Insights Volumen 01',
        desc: 'El reporte de investigación económica de 40 páginas sobre el mercado estético y quirúrgico en Colombia.',
        url: '../investigaciones/volumen-01/',
        highlight: false
      }
    ];

    dom.toolsGrid.innerHTML = TOOLS_CATALOG.map(t => `
      <a href="${t.url}" class="diag-tool-card ${t.highlight ? 'diag-tool-card--highlight' : ''}">
        ${t.highlight ? '<span class="diag-tool-badge">Recomendado para tu perfil</span>' : ''}
        <h4 class="diag-tool-title">${t.title}</h4>
        <p class="diag-tool-desc">${t.desc}</p>
        <span class="diag-tool-link">Abrir herramienta →</span>
      </a>
    `).join('');
  }

  function handleCopyResults() {
    const pct = state.scores.percentage;
    const text = `DIAGNÓSTICO COMERCIAL GLOSS & GROWTH\n` +
      `Puntuación global: ${pct}%\n` +
      `• Captación: ${state.scores.captacion}/12 pts\n` +
      `• Conversión WhatsApp: ${state.scores.conversion}/12 pts\n` +
      `• Operación y Capacidad: ${state.scores.operacion}/12 pts\n` +
      `• Presencia Digital: ${state.scores.presencia}/12 pts\n\n` +
      `Evaluación realizada en: https://glossgrowthhq.com/recursos/diagnostico/`;

    navigator.clipboard.writeText(text).then(() => {
      const origText = dom.btnCopy.textContent;
      dom.btnCopy.textContent = '✓ ¡Copiado al portapapeles!';
      setTimeout(() => { dom.btnCopy.textContent = origText; }, 2500);
    });
  }

  // Inicialización
  document.addEventListener('DOMContentLoaded', () => {
    initDom();
    bindEvents();
    renderStep();
  });

})();
