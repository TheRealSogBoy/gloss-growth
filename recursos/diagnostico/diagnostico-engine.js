/**
 * GLOSS & GROWTH — Motor Determinista de Interpretación Comercial (15 Preguntas)
 *
 * Principios:
 * 1. Neutralidad: Opciones descriptivas sin juicios morales ni caricaturas.
 * 2. Cero escalas artificiales de "madurez": No hay puntuaciones de 1 a 4 ni porcentaje ficticio de madurez.
 * 3. Interpretación contextual por cruce de variables: Las conclusiones se derivan de la combinación de respuestas.
 * 4. Sin estadísticas inventadas: No se prometen aumentos del 70% ni pérdidas arbitrarias del 40%.
 * 5. Lenguaje profesional, sobrio y colombiano natural (adaptable a estética, médica o spa).
 *
 * Compatible con Node.js (CommonJS / pruebas automatizadas) y Navegadores (window.GlossDiagnosticoEngine).
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.GlossDiagnosticoEngine = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // 15 PREGUNTAS ESTRUCTURADAS
  const QUESTIONS = [
    // BLOQUE 1 — CONTEXTO Y CAPTACIÓN
    {
      id: 1,
      variable: 'business_type',
      block: 1,
      blockTitle: 'Contexto y captación',
      type: 'single',
      title: '¿Qué tipo de negocio tienes?',
      desc: 'Adaptará las recomendaciones al modelo y alcance de tu centro.',
      options: [
        { id: 'estetica', text: 'Centro de estética facial y corporal.' },
        { id: 'consultorio', text: 'Consultorio de medicina estética.' },
        { id: 'clinica', text: 'Clínica de medicina estética o cirugía plástica.' },
        { id: 'spa', text: 'Spa o centro de bienestar.' },
        { id: 'combinado', text: 'Negocio que combina varios de estos servicios.' }
      ]
    },
    {
      id: 2,
      variable: 'acquisition_sources',
      block: 1,
      blockTitle: 'Contexto y captación',
      type: 'multiple',
      max: 2,
      title: '¿De dónde llegan principalmente tus clientes nuevos?',
      desc: 'Selecciona hasta dos fuentes principales.',
      options: [
        { id: 'recomendaciones', text: 'Recomendaciones de clientes, familiares o conocidos.' },
        { id: 'redes_organico', text: 'Instagram, Facebook o TikTok, sin publicidad pagada.' },
        { id: 'pauta', text: 'Anuncios en Meta, Google u otras plataformas.' },
        { id: 'google_maps', text: 'Google Maps o búsquedas en Google.' },
        { id: 'local_paso', text: 'Personas que pasan por el local o conocen nuestra ubicación.' },
        { id: 'alianzas', text: 'Alianzas con profesionales, negocios u otras empresas.' },
        { id: 'desconocido', text: 'No tengo claro de dónde llegan.', exclusive: true }
      ]
    },
    {
      id: 3,
      variable: 'monthly_inquiries',
      block: 1,
      blockTitle: 'Contexto y captación',
      type: 'single',
      title: 'Aproximadamente, ¿cuántas consultas de posibles clientes nuevos recibes al mes?',
      desc: 'Cuenta personas interesadas que preguntan por un servicio, no pacientes atendidos ni el número total de mensajes.',
      options: [
        { id: '0_10', text: 'Entre 0 y 10.' },
        { id: '11_30', text: 'Entre 11 y 30.' },
        { id: '31_60', text: 'Entre 31 y 60.' },
        { id: '61_120', text: 'Entre 61 y 120.' },
        { id: 'mas_120', text: 'Más de 120.' },
        { id: 'desconocido', text: 'No llevamos ese registro.' }
      ]
    },

    // BLOQUE 2 — MARKETING Y VISIBILIDAD
    {
      id: 4,
      variable: 'paid_advertising',
      block: 2,
      blockTitle: 'Marketing y visibilidad',
      type: 'single',
      title: '¿Actualmente realizas publicidad pagada para atraer clientes?',
      desc: 'Indica el papel que juega la inversión publicitaria en este momento.',
      options: [
        { id: 'no_pauta', text: 'No realizamos publicidad pagada.' },
        { id: 'anteriormente', text: 'Hemos realizado campañas anteriormente, pero ahora no.' },
        { id: 'temporadas', text: 'Activamos campañas en determinadas temporadas.' },
        { id: 'constante', text: 'Mantenemos campañas durante la mayor parte del año.' },
        { id: 'preparando', text: 'Estamos preparando nuestras primeras campañas.' }
      ]
    },
    {
      id: 5,
      variable: 'monthly_content_frequency',
      block: 2,
      blockTitle: 'Marketing y visibilidad',
      type: 'single',
      title: 'Durante el último mes, ¿con qué frecuencia publicaste contenido en redes sociales?',
      desc: 'Cuenta Reels, carruseles y publicaciones del feed. No incluyas historias.',
      options: [
        { id: '0', text: 'No publicamos contenido.' },
        { id: '1_3', text: 'Entre 1 y 3 publicaciones.' },
        { id: '4_7', text: 'Entre 4 y 7 publicaciones.' },
        { id: '8_15', text: 'Entre 8 y 15 publicaciones.' },
        { id: 'mas_15', text: 'Más de 15 publicaciones.' },
        { id: 'desconocido', text: 'No llevo el registro.' }
      ]
    },
    {
      id: 6,
      variable: 'digital_channels',
      block: 2,
      blockTitle: 'Marketing y visibilidad',
      type: 'multiple',
      title: '¿En cuáles de estos canales tiene presencia actualmente tu negocio?',
      desc: 'Selecciona los canales donde tu negocio tiene presencia activa.',
      options: [
        { id: 'redes', text: 'Instagram o Facebook.' },
        { id: 'tiktok', text: 'TikTok.' },
        { id: 'google_maps', text: 'Perfil de Empresa en Google Maps.' },
        { id: 'sitio_web', text: 'Página web propia.' },
        { id: 'directorios', text: 'Directorios o plataformas de reservas.' },
        { id: 'ninguno', text: 'Ninguno de los anteriores.', exclusive: true }
      ]
    },

    // BLOQUE 3 — ATENCIÓN Y CONVERSIÓN
    {
      id: 7,
      variable: 'message_responsibility',
      block: 3,
      blockTitle: 'Atención y conversión',
      type: 'single',
      title: '¿Quién suele atender los mensajes de las personas interesadas en tus servicios?',
      desc: 'Permite comprender cómo se organiza la primera respuesta comercial.',
      options: [
        { id: 'propietario', text: 'Yo, como propietario o profesional.' },
        { id: 'recepcion', text: 'Recepcionista o auxiliar administrativa.' },
        { id: 'comercial', text: 'Asesor comercial o persona encargada de ventas.' },
        { id: 'varios', text: 'Varios integrantes del equipo.' },
        { id: 'bot', text: 'Sistema automatizado, bot o asistente virtual.' },
        { id: 'otro', text: 'Otra modalidad.' }
      ]
    },
    {
      id: 8,
      variable: 'response_time',
      block: 3,
      blockTitle: 'Atención y conversión',
      type: 'single',
      title: 'Durante el horario de atención, ¿cuánto tardan normalmente en responder una consulta nueva?',
      desc: 'Tiempo estimado de primera respuesta durante una jornada habitual.',
      options: [
        { id: 'menos_5min', text: 'Menos de 5 minutos.' },
        { id: '5_15min', text: 'Entre 5 y 15 minutos.' },
        { id: '16_30min', text: 'Entre 16 y 30 minutos.' },
        { id: '31min_2h', text: 'Entre 31 minutos y 2 horas.' },
        { id: 'mas_2h', text: 'Más de 2 horas.' },
        { id: 'desconocido', text: 'No lo sabemos con precisión.' }
      ]
    },
    {
      id: 9,
      variable: 'inquiry_to_booking',
      block: 3,
      blockTitle: 'Atención y conversión',
      type: 'single',
      title: 'De cada 10 personas que consultan por un tratamiento, aproximadamente ¿cuántas terminan agendando una cita?',
      desc: 'Estimación aproximada de cuántos interesados pasan a una fecha concreta en agenda.',
      options: [
        { id: '0_2', text: 'Entre 0 y 2.' },
        { id: '3_4', text: 'Entre 3 y 4.' },
        { id: '5_6', text: 'Entre 5 y 6.' },
        { id: '7_8', text: 'Entre 7 y 8.' },
        { id: '9_10', text: 'Entre 9 y 10.' },
        { id: 'desconocido', text: 'No conocemos esa proporción.' }
      ]
    },

    // BLOQUE 4 — SEGUIMIENTO Y OPERACIÓN
    {
      id: 10,
      variable: 'lead_followup',
      block: 4,
      blockTitle: 'Seguimiento y operación',
      type: 'single',
      title: 'Cuando una persona pregunta por un servicio pero no agenda, ¿qué suele pasar después?',
      desc: 'Evalúa la continuidad del contacto con personas que mostraron interés inicial.',
      options: [
        { id: 'termina', text: 'La conversación termina y esperamos que vuelva a escribir.' },
        { id: 'algunas_veces', text: 'Algunas veces volvemos a contactarla.' },
        { id: 'un_mensaje', text: 'Normalmente enviamos un mensaje posterior.' },
        { id: 'varios_contactos', text: 'Realizamos varios contactos de seguimiento según el caso.' },
        { id: 'desconocido', text: 'No tengo claro cómo se manejan estas conversaciones.' }
      ]
    },
    {
      id: 11,
      variable: 'booking_attendance',
      block: 4,
      blockTitle: 'Seguimiento y operación',
      type: 'single',
      title: 'De cada 10 citas agendadas, aproximadamente ¿cuántas personas terminan asistiendo?',
      desc: 'Proporción estimada de personas que efectivamente asisten a su cita programada.',
      options: [
        { id: '0_4', text: 'Entre 0 y 4.' },
        { id: '5_6', text: 'Entre 5 y 6.' },
        { id: '7_8', text: 'Entre 7 y 8.' },
        { id: '9_10', text: 'Entre 9 y 10.' },
        { id: 'desconocido', text: 'No conocemos esa proporción.' }
      ]
    },
    {
      id: 12,
      variable: 'schedule_occupancy',
      block: 4,
      blockTitle: 'Seguimiento y operación',
      type: 'single',
      title: 'En una semana habitual, ¿qué porcentaje aproximado de tus horarios disponibles termina ocupado con citas?',
      desc: 'Estimación del aprovechamiento de las horas de cabina o consulta durante la semana.',
      options: [
        { id: 'menos_25', text: 'Menos del 25%.' },
        { id: '25_49', text: 'Entre el 25% y el 49%.' },
        { id: '50_74', text: 'Entre el 50% y el 74%.' },
        { id: '75_100', text: 'Entre el 75% y el 100%.' },
        { id: 'desconocido', text: 'No lo medimos.' }
      ]
    },

    // BLOQUE 5 — GESTIÓN Y PRIORIDADES
    {
      id: 13,
      variable: 'lead_record_system',
      block: 5,
      blockTitle: 'Gestión y prioridades',
      type: 'single',
      title: '¿Dónde registran actualmente los datos y el estado de las personas interesadas?',
      desc: 'Identifica el soporte donde se organizan los contactos y su evolución.',
      options: [
        { id: 'whatsapp', text: 'Principalmente en las conversaciones de WhatsApp.' },
        { id: 'libreta', text: 'En una libreta o registro manual.' },
        { id: 'hoja_calculo', text: 'En una hoja de Excel o Google Sheets.' },
        { id: 'crm', text: 'En un CRM o software de gestión comercial.' },
        { id: 'sistema_agenda', text: 'En un sistema de agenda que también registra contactos.' },
        { id: 'sin_registro', text: 'No tenemos un registro centralizado.' }
      ]
    },
    {
      id: 14,
      variable: 'financial_visibility',
      block: 5,
      blockTitle: 'Gestión y prioridades',
      type: 'single',
      title: '¿Qué información tienes sobre los costos y la rentabilidad de tus tratamientos?',
      desc: 'Conocer el margen de contribución real permite planificar precios y promociones.',
      options: [
        { id: 'ingresos_generales', text: 'Conozco los ingresos y gastos generales del negocio.' },
        { id: 'costo_insumos', text: 'Conozco el costo de los principales productos o insumos.' },
        { id: 'costos_directos', text: 'Tengo calculados los costos directos de cada tratamiento.' },
        { id: 'costos_completos', text: 'Calculo costos directos, tiempo de atención y costos operativos para evaluar la rentabilidad.' },
        { id: 'sin_informacion', text: 'No tenemos información organizada sobre estos costos.' }
      ]
    },
    {
      id: 15,
      variable: 'business_priorities',
      block: 5,
      blockTitle: 'Gestión y prioridades',
      type: 'multiple',
      max: 2,
      title: '¿Qué te gustaría mejorar principalmente en tu negocio durante los próximos tres meses?',
      desc: 'Selecciona hasta dos prioridades principales para orientar tus recomendaciones.',
      options: [
        { id: 'mas_consultas', text: 'Conseguir más consultas de posibles clientes.' },
        { id: 'convertir_citas', text: 'Convertir más consultas en citas.' },
        { id: 'reducir_ausencias', text: 'Reducir cancelaciones y ausencias.' },
        { id: 'aprovechar_horarios', text: 'Aprovechar mejor los horarios disponibles.' },
        { id: 'mejorar_rentabilidad', text: 'Mejorar rentabilidad y control financiero.' },
        { id: 'presencia_digital', text: 'Fortalecer la presencia digital del negocio.' },
        { id: 'organizar_seguimiento', text: 'Organizar mejor la atención y el seguimiento comercial.' }
      ]
    }
  ];

  // Helper para buscar textos de opciones
  function getOptionText(variable, optionId) {
    const q = QUESTIONS.find(item => item.variable === variable);
    if (!q) return optionId;
    const opt = q.options.find(o => o.id === optionId);
    return opt ? opt.text : optionId;
  }

  // Vocabulario adaptativo según tipo de negocio
  function getTerminology(businessType) {
    const isSpa = businessType === 'spa';
    const isMedical = businessType === 'consultorio' || businessType === 'clinica';

    return {
      clientWord: isSpa ? 'clientes' : (isMedical ? 'pacientes' : 'pacientes y clientes'),
      clientWordSingular: isSpa ? 'cliente' : (isMedical ? 'paciente' : 'paciente'),
      serviceWord: isSpa ? 'servicios de bienestar y cabina' : (isMedical ? 'procedimientos médicos y tratamientos' : 'tratamientos y servicios'),
      serviceWordSingular: isSpa ? 'servicio' : 'tratamiento',
      appointmentWord: isSpa ? 'reserva o sesión' : (isMedical ? 'cita de valoración' : 'cita o valoración'),
      spaceWord: isSpa ? 'cabinas' : (isMedical ? 'consultorios y salas de procedimiento' : 'cabinas y sillones'),
      professionalWord: isSpa ? 'terapeutas y cosmetólogas' : (isMedical ? 'médicos y especialistas' : 'profesionales y especialistas')
    };
  }

  /**
   * Analiza el mapa de respuestas del usuario y genera un reporte estructurado y contextual.
   * @param {Object} rawAnswers - Mapa { [variable]: string | string[] }
   * @returns {Object} Reporte de diagnóstico
   */
  function analyze(rawAnswers) {
    const a = { ...rawAnswers };

    // Normalizar arrays
    if (!Array.isArray(a.acquisition_sources)) {
      a.acquisition_sources = a.acquisition_sources ? [a.acquisition_sources] : [];
    }
    if (!Array.isArray(a.digital_channels)) {
      a.digital_channels = a.digital_channels ? [a.digital_channels] : [];
    }
    if (!Array.isArray(a.business_priorities)) {
      a.business_priorities = a.business_priorities ? [a.business_priorities] : [];
    }

    const t = getTerminology(a.business_type);

    // 1. Resumen de negocio
    const businessSummary = {
      businessType: a.business_type,
      businessTypeLabel: getOptionText('business_type', a.business_type).replace(/\.$/, ''),
      sourcesLabels: a.acquisition_sources.map(id => getOptionText('acquisition_sources', id).replace(/\.$/, '')),
      inquiriesLabel: getOptionText('monthly_inquiries', a.monthly_inquiries).replace(/\.$/, ''),
      bookingLabel: getOptionText('inquiry_to_booking', a.inquiry_to_booking).replace(/\.$/, ''),
      attendanceLabel: getOptionText('booking_attendance', a.booking_attendance).replace(/\.$/, ''),
      occupancyLabel: getOptionText('schedule_occupancy', a.schedule_occupancy).replace(/\.$/, ''),
      prioritiesLabels: a.business_priorities.map(id => getOptionText('business_priorities', id).replace(/\.$/, ''))
    };

    // 2. Indicadores no medidos
    const unmeasuredIndicators = [];
    if (a.monthly_inquiries === 'desconocido') {
      unmeasuredIndicators.push('Volumen mensual de consultas nuevas recibidas (personas interesadas).');
    }
    if (a.response_time === 'desconocido') {
      unmeasuredIndicators.push('Tiempo promedio de primera respuesta a consultas comerciales en horario laboral.');
    }
    if (a.inquiry_to_booking === 'desconocido') {
      unmeasuredIndicators.push('Proporción de consultas que agendan una cita (conversión comercial de WhatsApp).');
    }
    if (a.lead_followup === 'desconocido') {
      unmeasuredIndicators.push('Registro de seguimiento y reactivación a personas interesadas que no agendaron.');
    }
    if (a.booking_attendance === 'desconocido') {
      unmeasuredIndicators.push('Proporción de citas agendadas que efectivamente asisten a consulta (tasa de asistencia).');
    }
    if (a.schedule_occupancy === 'desconocido') {
      unmeasuredIndicators.push('Porcentaje de ocupación semanal de las horas disponibles en ' + t.spaceWord + '.');
    }
    if (a.financial_visibility === 'sin_informacion') {
      unmeasuredIndicators.push('Costo directo de insumos, tiempo y margen de contribución real por ' + t.serviceWordSingular + '.');
    }
    if (a.acquisition_sources.includes('desconocido')) {
      unmeasuredIndicators.push('Canal de origen o procedencia de los nuevos ' + t.clientWord + '.');
    }

    // 3. Evaluación de Reglas Deterministas
    // Variables operativas
    const hasHighInquiries = ['61_120', 'mas_120'].includes(a.monthly_inquiries);
    const hasModInquiries = ['31_60'].includes(a.monthly_inquiries);
    const hasLowInquiries = ['0_10', '11_30'].includes(a.monthly_inquiries);
    const unknownInquiries = a.monthly_inquiries === 'desconocido';

    const hasLowBooking = ['0_2', '3_4'].includes(a.inquiry_to_booking);
    const hasGoodBooking = ['7_8', '9_10'].includes(a.inquiry_to_booking);
    const unknownBooking = a.inquiry_to_booking === 'desconocido';

    const hasLowAttendance = ['0_4', '5_6'].includes(a.booking_attendance);
    const hasGoodAttendance = ['7_8', '9_10'].includes(a.booking_attendance);
    const unknownAttendance = a.booking_attendance === 'desconocido';

    const hasHighOccupancy = a.schedule_occupancy === '75_100';
    const hasMidOccupancy = a.schedule_occupancy === '50_74';
    const hasLowOccupancy = ['menos_25', '25_49'].includes(a.schedule_occupancy);
    const unknownOccupancy = a.schedule_occupancy === 'desconocido';

    const wantsMoreInquiries = a.business_priorities.includes('mas_consultas');
    const wantsBooking = a.business_priorities.includes('convertir_citas');
    const wantsAttendance = a.business_priorities.includes('reducir_ausencias');
    const wantsOccupancy = a.business_priorities.includes('aprovechar_horarios');
    const wantsProfit = a.business_priorities.includes('mejorar_rentabilidad');
    const wantsPresence = a.business_priorities.includes('presencia_digital');
    const wantsFollowup = a.business_priorities.includes('organizar_seguimiento');

    const usesReferrals = a.acquisition_sources.includes('recomendaciones');
    const noPaidAds = a.paid_advertising === 'no_pauta';
    const activePaidAds = ['constante', 'temporadas'].includes(a.paid_advertising);
    const usesSheets = a.lead_record_system === 'hoja_calculo';
    const noWebsite = !a.digital_channels.includes('sitio_web');
    const noMaps = !a.digital_channels.includes('google_maps');

    // Regla D: Contradicción Capacidad Saturada vs Querer Más Pacientes
    const contradictionCapacidad = hasHighOccupancy && wantsMoreInquiries;

    // Regla F: Información insuficiente crítica (3 o más métricas nucleares desconocidas)
    const severeDataDeficit = unmeasuredIndicators.length >= 3;

    // Determinación del Área Principal (Primary Opportunity)
    let primaryOpportunity = null;

    if (contradictionCapacidad) {
      primaryOpportunity = {
        area: 'Revisión de capacidad instalada antes de ampliar captación',
        badge: 'Capacidad y Agenda',
        explanation: 'Reportaste una ocupación semanal elevada (' + getOptionText('schedule_occupancy', a.schedule_occupancy) + '), pero señalaste como prioridad conseguir más consultas. Antes de aumentar la inversión en captación o saturar los canales de mensajes, conviene analizar cuánto margen real queda en tus ' + t.spaceWord + ' para no deteriorar los tiempos de atención ni sobrecargar al personal.',
        evidence: 'Ocupación declarada: ' + getOptionText('schedule_occupancy', a.schedule_occupancy) + ' · Objetivo: Conseguir más consultas.',
        whyItMatters: 'Si la agenda ya está cerca de su límite, atraer más personas sin margen de atención genera citas aplazadas, esperas en sala y fugas en la experiencia del ' + t.clientWordSingular + '.'
      };
    } else if (severeDataDeficit && (wantsBooking || wantsMoreInquiries || wantsAttendance)) {
      primaryOpportunity = {
        area: 'Registro y medición de indicadores comerciales básicos',
        badge: 'Medición Inicial',
        explanation: 'Para alcanzar tus objetivos de mejora, el primer paso prudente es contar con números propios. Actualmente no se lleva registro continuo de variables clave como el volumen de consultas, la tasa de agendamiento o la asistencia a citas.',
        evidence: 'Reportaste no conocer o no medir ' + unmeasuredIndicators.length + ' de los indicadores comerciales fundamentales de la operación.',
        whyItMatters: 'Tomar decisiones de inversión en publicidad o cambiar procesos sin medir el punto de partida impide saber qué funcionó y dónde se concentran las dificultades reales.'
      };
    } else if (wantsBooking || (hasLowBooking && (hasHighInquiries || hasModInquiries))) {
      primaryOpportunity = {
        area: 'Conversión de consultas en citas agendadas',
        badge: 'Conversión en WhatsApp',
        explanation: 'Existe un flujo de personas interesadas preguntando por tus ' + t.serviceWord + ', pero una proporción moderada o reducida termina concretando fecha en agenda. Revisar el protocolo de respuesta comercial y el manejo de precios en WhatsApp representa la vía más directa para aprovechar la demanda existente sin gastar de más.',
        evidence: 'Consultas mensuales: ' + getOptionText('monthly_inquiries', a.monthly_inquiries) + ' · Agendamiento declarado: ' + getOptionText('inquiry_to_booking', a.inquiry_to_booking) + '.',
        whyItMatters: 'Cada consulta recibida representa tiempo e interés de una persona; mejorar la conversación comercial permite llenar espacios de agenda con los prospectos que ya están escribiendo.'
      };
    } else if (wantsAttendance || hasLowAttendance) {
      primaryOpportunity = {
        area: 'Confirmación y asistencia a citas agendadas',
        badge: 'Asistencia y Agenda',
        explanation: 'El agendamiento funciona, pero la inasistencia o las cancelaciones imprevistas restan productividad a tus ' + t.spaceWord + '. Ajustar los recordatorios, formalizar la reserva y analizar los motivos recurrentes de ausencia protegerá el tiempo asistencial de tu equipo.',
        evidence: 'Asistencia declarada: ' + getOptionText('booking_attendance', a.booking_attendance) + ' de cada 10 citas agendadas.',
        whyItMatters: 'Una cita vacía de última hora tiene un costo fijo irrecuperable y desaprovecha el tiempo del profesional asignado.'
      };
    } else if (wantsProfit) {
      primaryOpportunity = {
        area: 'Costos directos y margen por ' + t.serviceWordSingular,
        badge: 'Rentabilidad Clínica',
        explanation: 'Tu prioridad es mejorar la rentabilidad del negocio. Para lograrlo con bases sólidas, conviene calcular el costo unitario exacto de insumos, tiempo en cabina y honorarios de tus servicios principales, diferenciando ingresos brutos de margen de contribución real.',
        evidence: 'Información financiera actual: ' + getOptionText('financial_visibility', a.financial_visibility) + '.',
        whyItMatters: 'Ofrecer servicios con alta demanda pero margen reducido genera la falsa sensación de crecimiento mientras la utilidad neta permanece estancada.'
      };
    } else if (wantsMoreInquiries && (hasLowInquiries || hasLowOccupancy)) {
      primaryOpportunity = {
        area: 'Evaluación de demanda y canales de captación',
        badge: 'Captación y Visibilidad',
        explanation: 'Tu centro cuenta con disponibilidad en agenda y el objetivo de sumar nuevos ' + t.clientWord + '. Conviene evaluar qué canales locales tienen mayor sentido para tu ubicación y especialidad antes de realizar esfuerzos dispersos.',
        evidence: 'Consultas mensuales: ' + getOptionText('monthly_inquiries', a.monthly_inquiries) + ' · Ocupación declarada: ' + getOptionText('schedule_occupancy', a.schedule_occupancy) + '.',
        whyItMatters: 'Tener franjas horarias libres representa un costo ocioso que puede amortizarse activando canales de atracción pertinentes.'
      };
    } else if (wantsFollowup || a.lead_followup === 'termina') {
      primaryOpportunity = {
        area: 'Organización del seguimiento comercial',
        badge: 'Seguimiento',
        explanation: 'Gran parte de las decisiones para ' + t.serviceWord + ' requieren reflexión por parte del ' + t.clientWordSingular + '. Organizar un protocolo de seguimiento con contenido de valor y momentos oportunos de contacto evita perder interesados que simplemente necesitaban resolver una duda previa.',
        evidence: 'Manejo actual tras consulta sin agendar: ' + getOptionText('lead_followup', a.lead_followup) + '.',
        whyItMatters: 'Dejar que la conversación muera sin acompañamiento obliga a buscar constantemente nuevos prospectos desde cero.'
      };
    } else if (wantsPresence) {
      primaryOpportunity = {
        area: 'Consolidación de presencia digital local',
        badge: 'Visibilidad Digital',
        explanation: 'Para fortalecer el reconocimiento de tu negocio en tu zona, conviene asegurar que los canales prioritarios (como el Perfil de Google Maps y las redes activas) muestren información clara, servicios actualizados y testimonios verificables.',
        evidence: 'Canales con presencia actual: ' + (a.digital_channels.length > 0 ? a.digital_channels.map(c => getOptionText('digital_channels', c)).join(', ') : 'Ninguno registrado') + '.',
        whyItMatters: 'Muchos ' + t.clientWord + ' consultan perfiles digitales o valoraciones locales antes de tomar una decisión de agendamiento.'
      };
    } else {
      // Caso consolidado / equilibrio operativo (Regla I)
      primaryOpportunity = {
        area: 'Consolidación operativa y eficiencia de agenda',
        badge: 'Eficiencia y Operación',
        explanation: 'Tus respuestas reflejan una operación relativamente estable. El foco más recomendable para esta etapa es proteger los márgenes de los ' + t.serviceWord + ' clave y organizar la agenda para aprovechar mejor los horarios disponibles.',
        evidence: 'Ocupación semanal: ' + getOptionText('schedule_occupancy', a.schedule_occupancy) + ' · Agendamiento: ' + getOptionText('inquiry_to_booking', a.inquiry_to_booking) + '.',
        whyItMatters: 'Mantener procesos ordenados en consulta y agenda permite sostener la calidad del servicio sin desgastar al equipo asistencial.'
      };
    }

    // 4. Selección de las 3 Prioridades Sugeridas
    const candidatePriorities = [];

    // Prioridad: Conversión en WhatsApp
    if (hasLowBooking || wantsBooking || a.response_time === 'mas_2h' || a.response_time === '31min_2h') {
      let rel = 'Mencionaste agendar ' + getOptionText('inquiry_to_booking', a.inquiry_to_booking).toLowerCase();
      if (a.response_time === 'mas_2h' || a.response_time === '31min_2h') {
        rel += ' y una demora habitual de respuesta de ' + getOptionText('response_time', a.response_time).toLowerCase();
      }
      candidatePriorities.push({
        id: 'p_conversion',
        score: wantsBooking ? 100 : 70,
        title: 'Revisar las conversaciones donde no se concreta la cita',
        explanation: 'Identificar en qué momento se interrumpe la comunicación en WhatsApp permite corregir respuestas cortantes o envíos de precios sin contexto.',
        concreteAction: 'Durante las próximas dos semanas, anota en una libreta o documento qué preguntas hacen las personas antes de dejar de responder y redacta respuestas de orientación previa al valor monetario.',
        relationToAnswers: rel + '.'
      });
    }

    // Prioridad: Confirmación y Ausencias
    if (hasLowAttendance || wantsAttendance) {
      candidatePriorities.push({
        id: 'p_asistencia',
        score: wantsAttendance ? 100 : 75,
        title: 'Formalizar el protocolo de confirmación de citas',
        explanation: 'Reducir los espacios vacíos por inasistencia protege el tiempo de los ' + t.professionalWord + ' y la rentabilidad de las cabinas.',
        concreteAction: 'Envía un recordatorio estructurado 24 horas antes solicitando confirmación activa e introduce un aviso previo de 2 horas con indicaciones prácticas de llegada al consultorio.',
        relationToAnswers: 'Reportaste una asistencia estimada de ' + getOptionText('booking_attendance', a.booking_attendance).toLowerCase() + ' de cada 10 citas programadas.'
      });
    }

    // Prioridad: Capacidad y Franjas Valle
    if (wantsOccupancy || hasLowOccupancy || contradictionCapacidad) {
      candidatePriorities.push({
        id: 'p_capacidad',
        score: contradictionCapacidad ? 110 : (wantsOccupancy ? 95 : 65),
        title: contradictionCapacidad ? 'Medir capacidad máxima antes de captar más demanda' : 'Mapear la ocupación por franjas horarias y días de la semana',
        explanation: contradictionCapacidad
          ? 'Calcular las horas reales disponibles evita aceptar citas que luego generen retrasos o congestión en sala de espera.'
          : 'Identificar qué días y horarios presentan menor concurrencia permite concentrar tratamientos específicos en franjas valle.',
        concreteAction: 'Calcula cuántas horas semanales están habilitadas en tus ' + t.spaceWord + ' y anota qué porcentaje de ese tiempo cuenta con una persona en atención real.',
        relationToAnswers: 'Ocupación actual declarada en ' + getOptionText('schedule_occupancy', a.schedule_occupancy).toLowerCase() + '.'
      });
    }

    // Prioridad: Costos y Rentabilidad
    if (wantsProfit || a.financial_visibility === 'ingresos_generales' || a.financial_visibility === 'sin_informacion') {
      candidatePriorities.push({
        id: 'p_rentabilidad',
        score: wantsProfit ? 100 : 60,
        title: 'Calcular el costo unitario e insumos de tus 3 tratamientos principales',
        explanation: 'Conocer con precisión qué porcentaje del precio corresponde a producto descartable, tiempo asistencial y costo fijo permite fijar tarifas seguras.',
        concreteAction: 'Elabora una ficha sencilla para tus 3 procedimientos más vendidos sumando insumos directos, minutos en cabina y honorarios del profesional.',
        relationToAnswers: 'Actualmente tu información financiera se ubica en: ' + getOptionText('financial_visibility', a.financial_visibility).toLowerCase() + '.'
      });
    }

    // Prioridad: Seguimiento Comercial
    if (wantsFollowup || a.lead_followup === 'termina' || a.lead_followup === 'algunas_veces') {
      candidatePriorities.push({
        id: 'p_seguimiento',
        score: wantsFollowup ? 95 : 65,
        title: 'Establecer un contacto de seguimiento respetuoso a las 48 horas',
        explanation: 'Muchos ' + t.clientWord + ' posponen la decisión por falta de claridad. Un mensaje de valor ayuda a resolver dudas sin presionar.',
        concreteAction: 'Diseña una plantilla de WhatsApp para enviar dos días después del primer contacto, compartiendo una recomendación o caso clínico relacionado con la inquietud inicial.',
        relationToAnswers: 'Indicaste que actualmente ante una consulta no agendada: ' + getOptionText('lead_followup', a.lead_followup).toLowerCase() + '.'
      });
    }

    // Prioridad: Registro de Indicadores
    if (unmeasuredIndicators.length >= 2) {
      candidatePriorities.push({
        id: 'p_medicion',
        score: severeDataDeficit ? 105 : 70,
        title: 'Iniciar un registro diario de consultas, citas y asistencia',
        explanation: 'Contar con datos fiables durante 30 días seguidos proporciona el mapa necesario para tomar decisiones acertadas de crecimiento.',
        concreteAction: 'Crea una tabla en Google Sheets o en un cuaderno donde cada día se anoten 3 cifras: cuántas personas preguntaron, cuántas agendaron y cuántas asistieron.',
        relationToAnswers: 'Señalaste no llevar registro de varias métricas operativas clave en este momento.'
      });
    }

    // Prioridad: Presencia Digital Local
    if (wantsPresence || noMaps || (a.monthly_content_frequency === '0' && wantsMoreInquiries)) {
      candidatePriorities.push({
        id: 'p_presencia',
        score: wantsPresence ? 90 : 55,
        title: noMaps ? 'Crear y optimizar el Perfil de Empresa en Google Maps' : 'Actualizar información y casos reales en tus canales digitales',
        explanation: 'Los pacientes de estética y bienestar buscan referencias locales en su ciudad antes de acudir a una primera valoración presencial.',
        concreteAction: noMaps
          ? 'Registra tu centro en Google Business Profile con dirección exacta, fotos de instalaciones, catálogo de servicios y teléfono directo de WhatsApp.'
          : 'Publica de 2 a 4 contenidos mensuales enfocados en explicar cómo funciona un procedimiento y qué cuidados posteriores requiere.',
        relationToAnswers: noMaps
          ? 'Actualmente tu negocio no cuenta con Perfil de Google Maps registrado.'
          : 'Frecuencia de contenido declarada: ' + getOptionText('monthly_content_frequency', a.monthly_content_frequency).toLowerCase() + '.'
      });
    }

    // Prioridad: Evaluación de Publicidad Responsable
    if (wantsMoreInquiries && (hasLowInquiries || hasLowOccupancy) && !contradictionCapacidad) {
      candidatePriorities.push({
        id: 'p_captacion',
        score: 85,
        title: 'Evaluar captación digital controlada para franjas con disponibilidad',
        explanation: 'Activar campañas publicitarias solo tiene sentido si existen ' + t.spaceWord + ' disponibles y una persona capacitada para responder de inmediato.',
        concreteAction: 'Define un presupuesto modesto de prueba enfocado en el tratamiento más rentable de tu centro y mide durante un mes el costo por cada consulta real recibida.',
        relationToAnswers: 'Tu negocio realiza publicidad: ' + getOptionText('paid_advertising', a.paid_advertising).toLowerCase() + '.'
      });
    }

    // Ordenar por score y seleccionar hasta 3 prioridades únicas
    candidatePriorities.sort((x, y) => y.score - x.score);
    const selectedPriorities = candidatePriorities.slice(0, 3);

    // Fallbacks de seguridad para garantizar siempre exactamente 3 prioridades estructuradas
    const fallbackPool = [
      {
        id: 'p_fidelizacion',
        title: 'Consolidar el protocolo de atención y fidelización de ' + t.clientWord,
        explanation: 'Asegurar que cada persona atendida reciba indicaciones de cuidado posterior fortalece la recomendación boca a boca natural.',
        concreteAction: 'Envía un mensaje de seguimiento post-atención a las 48 horas preguntando cómo evoluciona el bienestar del ' + t.clientWordSingular + '.',
        relationToAnswers: 'Recomendación de consolidación para ' + businessSummary.businessTypeLabel.toLowerCase() + '.'
      },
      {
        id: 'p_agenda_bloques',
        title: 'Organizar la agenda por bloques de servicio homogéneos',
        explanation: 'Agrupar sesiones similares en franjas específicas reduce tiempos muertos de preparación y alistamiento en ' + t.spaceWord + '.',
        concreteAction: 'Define dos medias jornadas semanales dedicadas exclusivamente a tus ' + t.serviceWord + ' principales para maximizar la concentración asistencial.',
        relationToAnswers: 'Buenas prácticas de optimización de capacidad en ' + t.spaceWord + '.'
      },
      {
        id: 'p_testimonios',
        title: 'Recopilar y organizar testimonios de casos de éxito',
        explanation: 'Contar con experiencias reales documentadas ayuda a que nuevos consultantes tomen la decisión de agendar con mayor confianza.',
        concreteAction: 'Pide a tres ' + t.clientWord + ' satisfechos durante este mes una breve reseña en Google Maps o una recomendación escrita autorizada.',
        relationToAnswers: 'Activo comercial para fortalecer la credibilidad de tu propuesta.'
      }
    ];

    for (const fb of fallbackPool) {
      if (selectedPriorities.length >= 3) break;
      if (!selectedPriorities.some(p => p.id === fb.id)) {
        selectedPriorities.push(fb);
      }
    }

    // 5. Herramientas Recomendadas de Gloss Growth (Máx 3)
    const relatedTools = [];

    // Herramienta 1: Capacidad instalada
    if (wantsOccupancy || hasHighOccupancy || contradictionCapacidad || wantsAttendance || a.schedule_occupancy === 'desconocido') {
      relatedTools.push({
        id: 'capacidad',
        title: 'Simulador de Capacidad Instalada y Ocupación',
        badge: 'Operaciones y Agenda',
        desc: 'Calcula el potencial mensual de atenciones según ' + t.spaceWord + ' y horarios, y mide el costo de las horas ociosas.',
        url: '/recursos/capacidad-instalada/'
      });
    }

    // Herramienta 2: Calculadora de rentabilidad por tratamiento
    if (wantsProfit || a.financial_visibility === 'ingresos_generales' || a.financial_visibility === 'sin_informacion' || wantsBooking) {
      relatedTools.push({
        id: 'tratamiento',
        title: 'Calculadora de Rentabilidad por Tratamiento',
        badge: 'Finanzas Clínicas',
        desc: 'Ingresa precio, insumos descartables, tiempo en cabina y honorarios para conocer el margen de contribución real.',
        url: '/recursos/herramientas/#calc-tratamiento'
      });
    }

    // Herramienta 3: Calculadora de publicidad y ROAS
    if (wantsMoreInquiries || activePaidAds || a.paid_advertising === 'preparando') {
      relatedTools.push({
        id: 'publicidad',
        title: 'Calculadora de ROAS y Pauta Publicitaria',
        badge: 'Inversión y Presupuesto',
        desc: 'Calcula el retorno publicitario necesario para cubrir la inversión en anuncios y evalúa escenarios comerciales.',
        url: '/recursos/calculadora-publicidad/'
      });
    }

    // Herramienta 4: Estudio de Contenido (si quiere presencia, contenido o seguimiento)
    if (relatedTools.length < 3 && (wantsPresence || wantsFollowup || a.monthly_content_frequency === '0' || a.monthly_content_frequency === '1_3')) {
      relatedTools.push({
        id: 'estudio',
        title: 'Estudio de Contenido Editorial',
        badge: 'Suite de Comunicación',
        desc: 'Aperturas de video, guiones estructurados y calendario editorial adaptado a servicios estéticos y de bienestar.',
        url: '/recursos/estudio-contenido/'
      });
    }

    // Herramienta 5: Gloss Insights Volumen 01 (Estudio Sectorial)
    if (relatedTools.length < 3) {
      relatedTools.push({
        id: 'insights',
        title: 'Gloss Insights · Volumen 01',
        badge: 'Investigación Sectorial',
        desc: 'Estudio de referencia con cifras, volúmenes quirúrgicos y no quirúrgicos del mercado de estética en Colombia.',
        url: '/recursos/investigaciones/volumen-01/'
      });
    }

    const finalTools = relatedTools.slice(0, 3);

    // 6. Mensaje contextual de WhatsApp
    const waBaseMsg = 'Hola Gloss Growth, completé el diagnóstico comercial para mi ' +
      businessSummary.businessTypeLabel.toLowerCase() +
      '. Mi área principal identificada es «' + primaryOpportunity.area + '» y me gustaría revisar la prioridad sobre ' +
      selectedPriorities[0].title.toLowerCase() +
      '. ¿Podemos conversar sobre mi caso?';

    const whatsappPayload = {
      messageText: waBaseMsg,
      url: 'https://wa.me/573145904933?text=' + encodeURIComponent(waBaseMsg)
    };

    // 7. Nota sobre canales de recomendación si aplica (Regla J)
    let referralNote = null;
    if (usesReferrals && (hasHighOccupancy || hasMidOccupancy || !wantsMoreInquiries)) {
      referralNote = 'Tener las recomendaciones como fuente principal refleja un buen nivel de satisfacción en tus ' + t.clientWord + '. No es indispensable recurrir a publicidad pagada si la agenda se mantiene estable con este flujo.';
    }

    return {
      businessSummary,
      terminology: t,
      primaryOpportunity,
      referralNote,
      contradictionCapacidad,
      priorities: selectedPriorities,
      unmeasuredIndicators,
      relatedTools: finalTools,
      whatsappPayload
    };
  }

  return {
    QUESTIONS,
    getOptionText,
    getTerminology,
    analyze
  };
});
