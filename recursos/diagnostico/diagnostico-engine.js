/**
 * GLOSS & GROWTH — Motor Determinista de Diagnóstico Comercial Adaptativo
 *
 * Soporta 3 recorridos según la etapa del negocio:
 * 1. Preparación para apertura (8 preguntas) -> "Tu hoja de ruta para comenzar" + Plan inicial de preparación.
 * 2. Primeros clientes (8 preguntas adaptadas) -> "Tus próximas prioridades de crecimiento" + Registro inicial.
 * 3. Negocios establecidos (15 preguntas) -> "Tu diagnóstico comercial" contextual de captación, conversión, operación y rentabilidad.
 *
 * Principios:
 * - Neutralidad: Cero juicios morales, caricaturas o clasificaciones descalificatorias.
 * - Cero puntuaciones artificiales: No hay escalas del 0 al 100% ni "madurez comercial".
 * - Interpretación contextual por cruce de variables.
 * - Sin estadísticas inventadas.
 * - Vocabulario adaptado al tipo de negocio (estética, consultorio médico, clínica, spa).
 *
 * Compatible con Node.js (CommonJS / tests) y Navegadores (window.GlossDiagnosticoEngine).
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.GlossDiagnosticoEngine = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // ==========================================================================
  // 1. OPCIONES COMPARTIDAS Y VOCABULARIO
  // ==========================================================================
  const BUSINESS_TYPE_OPTIONS = [
    { id: 'estetica', text: 'Centro de estética facial y corporal.' },
    { id: 'consultorio', text: 'Consultorio de medicina estética.' },
    { id: 'clinica', text: 'Clínica de medicina estética o cirugía plástica.' },
    { id: 'spa', text: 'Spa o centro de bienestar.' },
    { id: 'combinado', text: 'Negocio que combina varios de estos servicios.' }
  ];

  function getTerminology(businessType) {
    const isSpa = businessType === 'spa';
    const isMedical = businessType === 'consultorio' || businessType === 'clinica';

    return {
      clientWord: isSpa ? 'clientes' : (isMedical ? 'pacientes' : 'pacientes y clientes'),
      clientWordSingular: isSpa ? 'cliente' : (isMedical ? 'paciente' : 'paciente o cliente'),
      serviceWord: isSpa ? 'servicios de bienestar y cabina' : (isMedical ? 'procedimientos médicos y tratamientos' : 'tratamientos y servicios'),
      serviceWordSingular: isSpa ? 'servicio' : (isMedical ? 'tratamiento médico' : 'tratamiento o servicio'),
      appointmentWord: isSpa ? 'reserva o sesión' : (isMedical ? 'cita de valoración' : 'cita o valoración'),
      spaceWord: isSpa ? 'cabinas' : (isMedical ? 'consultorios y salas de procedimiento' : 'cabinas y áreas de atención'),
      professionalWord: isSpa ? 'terapeutas y cosmetólogas' : (isMedical ? 'médicos y especialistas' : 'profesionales y especialistas')
    };
  }

  // ==========================================================================
  // 2. RECORRIDO A: NEGOCIOS EN PREPARACIÓN PARA APERTURA (8 PREGUNTAS)
  // ==========================================================================
  const QUESTIONS_PLANNING = [
    {
      id: 1,
      variable: 'business_type',
      block: 1,
      blockTitle: 'Modelo y alcance',
      type: 'single',
      title: '¿Qué tipo de negocio estás preparando?',
      desc: 'Permite adaptar las recomendaciones y el vocabulario a la naturaleza de tu proyecto.',
      options: BUSINESS_TYPE_OPTIONS
    },
    {
      id: 2,
      variable: 'opening_timeline',
      block: 1,
      blockTitle: 'Calendario de apertura',
      type: 'single',
      title: '¿Cuándo tienes pensado comenzar a atender clientes?',
      desc: 'Ayuda a secuenciar los asuntos pendientes sin urgencias injustificadas.',
      options: [
        { id: 'mes_1', text: 'Dentro del próximo mes.' },
        { id: 'meses_1_3', text: 'Entre uno y tres meses.' },
        { id: 'meses_4_6', text: 'Entre cuatro y seis meses.' },
        { id: 'mas_6', text: 'Dentro de más de seis meses.' },
        { id: 'sin_fecha', text: 'Todavía no tengo una fecha definida.' }
      ]
    },
    {
      id: 3,
      variable: 'service_definition',
      block: 2,
      blockTitle: 'Definición de oferta',
      type: 'single',
      title: '¿Qué tan definidos tienes los servicios que vas a ofrecer?',
      desc: 'Permite identificar si conviene estructurar primero la carta o avanzar hacia la difusión.',
      options: [
        { id: 'definidos_con_precios', text: 'Ya seleccioné los servicios principales y tengo definidos sus precios.' },
        { id: 'definidos_sin_precios', text: 'Ya seleccioné los servicios principales, pero todavía estoy trabajando en los precios.' },
        { id: 'varias_opciones', text: 'Tengo varias opciones de servicios y estoy decidiendo cuáles ofrecer.' },
        { id: 'definiendo', text: 'Todavía estoy definiendo qué servicios tendrá el negocio.' },
        { id: 'lineas_por_organizar', text: 'Mi negocio ofrecerá diferentes líneas de servicios y necesito organizarlas.' }
      ]
    },
    {
      id: 4,
      variable: 'service_location_model',
      block: 2,
      blockTitle: 'Espacio y modalidad',
      type: 'single',
      title: '¿Cómo planeas atender a tus clientes?',
      desc: 'Orienta las recomendaciones sobre visibilidad local, agenda y adecuación operativa.',
      options: [
        { id: 'local_propio', text: 'En un local o centro propio.' },
        { id: 'alquilado', text: 'En un consultorio o espacio alquilado.' },
        { id: 'compartido', text: 'Utilizando espacios compartidos con otros profesionales.' },
        { id: 'domicilio', text: 'Prestando servicios a domicilio, cuando corresponda.' },
        { id: 'buscando_lugar', text: 'Todavía estoy buscando o definiendo el lugar.' },
        { id: 'combinado', text: 'Combinaré más de una modalidad.' }
      ]
    },
    {
      id: 5,
      variable: 'opening_readiness',
      block: 3,
      blockTitle: 'Elementos preparados',
      type: 'multiple',
      title: '¿Cuáles de estos elementos ya tienes preparados para comenzar?',
      desc: 'Selecciona todos los aspectos que ya tengas estructurados o confirmados.',
      options: [
        { id: 'identidad', text: 'Nombre e identidad visual del negocio.' },
        { id: 'lugar', text: 'Lugar o modalidad de atención definidos.' },
        { id: 'equipos_proveedores', text: 'Equipos, materiales o proveedores principales.' },
        { id: 'lista_precios', text: 'Lista de servicios y precios.' },
        { id: 'presupuesto', text: 'Presupuesto para los primeros meses de operación.' },
        { id: 'canales_contacto', text: 'Canales de contacto o reservas.' },
        { id: 'requisitos_revisados', text: 'He revisado los requisitos aplicables para comenzar a operar.' },
        { id: 'organizando_elementos', text: 'Todavía estoy organizando estos elementos.', exclusive: true }
      ]
    },
    {
      id: 6,
      variable: 'planned_acquisition_channels',
      block: 3,
      blockTitle: 'Canales de difusión',
      type: 'multiple',
      title: '¿Qué medios tienes preparados para dar a conocer tu negocio?',
      desc: 'Selecciona los canales que planeas activar desde el inicio.',
      options: [
        { id: 'redes', text: 'Instagram o Facebook.' },
        { id: 'tiktok', text: 'TikTok.' },
        { id: 'google_maps', text: 'Perfil de Empresa en Google.' },
        { id: 'sitio_web', text: 'Página web.' },
        { id: 'contactos_alianzas', text: 'Contactos, recomendaciones o alianzas profesionales.' },
        { id: 'pauta_planificada', text: 'Publicidad pagada planificada.' },
        { id: 'sin_canales', text: 'Todavía no he preparado canales de promoción.', exclusive: true }
      ]
    },
    {
      id: 7,
      variable: 'opening_contact_process',
      block: 4,
      blockTitle: 'Atención y reservas',
      type: 'single',
      title: '¿Cómo tienes pensado recibir consultas y organizar las primeras citas?',
      desc: 'Identifica el proceso inicial para responder mensajes y agendar.',
      options: [
        { id: 'personalmente', text: 'Atenderé personalmente los mensajes y las reservas.' },
        { id: 'recepcionista', text: 'Una recepcionista o integrante del equipo se encargará.' },
        { id: 'compartido', text: 'Varias personas del equipo compartirán la atención.' },
        { id: 'sistema_reservas', text: 'Utilizaré un sistema de reservas o gestión comercial.' },
        { id: 'hibrido', text: 'Combinaré atención humana con automatizaciones.' },
        { id: 'no_definido', text: 'Todavía no he definido cómo lo haremos.' }
      ]
    },
    {
      id: 8,
      variable: 'opening_priorities',
      block: 4,
      blockTitle: 'Prioridades de preparación',
      type: 'multiple',
      max: 2,
      title: '¿En qué te gustaría recibir más orientación antes de comenzar?',
      desc: 'Selecciona hasta dos áreas de apoyo prioritario.',
      options: [
        { id: 'definir_servicios', text: 'Definir los servicios que voy a ofrecer y cómo presentarlos.' },
        { id: 'organizar_precios', text: 'Organizar precios, costos y presupuesto inicial.' },
        { id: 'identidad_digital', text: 'Preparar la identidad y presencia digital del negocio.' },
        { id: 'dar_a_conocer', text: 'Dar a conocer el negocio y conseguir los primeros clientes.' },
        { id: 'organizar_whatsapp', text: 'Organizar WhatsApp, reservas y atención al cliente.' },
        { id: 'plan_lanzamiento', text: 'Preparar un plan de lanzamiento.' },
        { id: 'organizar_tareas', text: 'Organizar las tareas que necesito resolver antes de abrir.' },
        { id: 'sin_claridad', text: 'Todavía no tengo claro por dónde empezar.', exclusive: true }
      ]
    }
  ];

  // ==========================================================================
  // 3. RECORRIDO B: NEGOCIOS CON PRIMEROS CLIENTES (8 PREGUNTAS)
  // ==========================================================================
  const QUESTIONS_STARTING = [
    {
      id: 1,
      variable: 'business_type',
      block: 1,
      blockTitle: 'Modelo y alcance',
      type: 'single',
      title: '¿Qué tipo de negocio estás poniendo en marcha?',
      desc: 'Permite adaptar las recomendaciones y el vocabulario a tu actividad.',
      options: BUSINESS_TYPE_OPTIONS
    },
    {
      id: 2,
      variable: 'initial_service_offer',
      block: 1,
      blockTitle: 'Oferta inicial',
      type: 'single',
      title: '¿Qué servicios estás ofreciendo actualmente?',
      desc: 'Describe cómo está estructurado tu catálogo de tratamientos en este momento.',
      options: [
        { id: 'definidos_y_precios', text: 'Ya tengo definidos los servicios y precios que ofrezco.' },
        { id: 'varios_demanda', text: 'Ofrezco varios servicios y estoy identificando cuáles tienen mayor demanda.' },
        { id: 'uno_dos_principales', text: 'Estoy comenzando con uno o dos servicios principales.' },
        { id: 'ajustando_oferta', text: 'Estoy ajustando mi oferta y mis precios.' },
        { id: 'completando_servicios', text: 'Todavía estoy completando los servicios que planeo ofrecer.' }
      ]
    },
    {
      id: 3,
      variable: 'initial_acquisition_sources',
      block: 2,
      blockTitle: 'Primeros clientes',
      type: 'multiple',
      max: 2,
      title: '¿De dónde han llegado principalmente tus primeros clientes?',
      desc: 'Selecciona hasta dos orígenes principales observados.',
      options: [
        { id: 'recomendaciones', text: 'Recomendaciones y conocidos.' },
        { id: 'redes_organico', text: 'Contenido publicado en redes sociales.' },
        { id: 'pauta', text: 'Anuncios pagados.' },
        { id: 'google_maps', text: 'Google o Google Maps.' },
        { id: 'local_paso', text: 'Personas que conocen o pasan por el local.' },
        { id: 'alianzas', text: 'Alianzas profesionales o comerciales.' },
        { id: 'sin_clientes', text: 'Todavía no he recibido clientes.', exclusive: true }
      ]
    },
    {
      id: 4,
      variable: 'initial_monthly_inquiries',
      block: 2,
      blockTitle: 'Volumen de consultas',
      type: 'single',
      title: 'Durante el último mes, aproximadamente ¿cuántas personas nuevas consultaron por tus servicios?',
      desc: 'Cuenta personas interesadas que preguntaron por un tratamiento o servicio.',
      options: [
        { id: '0_10', text: 'Entre 0 y 10.' },
        { id: '11_30', text: 'Entre 11 y 30.' },
        { id: '31_60', text: 'Entre 31 y 60.' },
        { id: 'mas_60', text: 'Más de 60.' },
        { id: 'sin_consultas', text: 'Todavía no comenzamos a recibir consultas.' },
        { id: 'sin_registro', text: 'No llevo el registro.' }
      ]
    },
    {
      id: 5,
      variable: 'initial_booking_pattern',
      block: 3,
      blockTitle: 'Patrón de agendamiento',
      type: 'single',
      title: '¿Qué ha pasado normalmente con las consultas que recibes?',
      desc: 'Describe la experiencia inicial observada al responder preguntas.',
      options: [
        { id: 'pocas_reservas', text: 'La mayoría son preguntas y todavía hemos conseguido pocas reservas.' },
        { id: 'algunas_reservan', text: 'Algunas personas reservan, mientras otras solo solicitan información.' },
        { id: 'parte_importante', text: 'Una parte importante de los interesados termina reservando.' },
        { id: 'muy_pocas_tendencia', text: 'Todavía tenemos muy pocas consultas para reconocer una tendencia.' },
        { id: 'sin_registro', text: 'No llevamos un registro de consultas y reservas.' }
      ]
    },
    {
      id: 6,
      variable: 'initial_marketing_channels',
      block: 3,
      blockTitle: 'Canales activos',
      type: 'multiple',
      title: '¿Qué canales utilizas actualmente para dar a conocer el negocio?',
      desc: 'Selecciona los medios donde mantienes actividad.',
      options: [
        { id: 'redes', text: 'Instagram o Facebook.' },
        { id: 'tiktok', text: 'TikTok.' },
        { id: 'google_maps', text: 'Google Maps.' },
        { id: 'sitio_web', text: 'Página web.' },
        { id: 'pauta', text: 'Publicidad pagada.' },
        { id: 'alianzas_recom', text: 'Alianzas o recomendaciones.' },
        { id: 'sin_canales_activos', text: 'Todavía no utilizo canales de promoción de manera activa.', exclusive: true }
      ]
    },
    {
      id: 7,
      variable: 'initial_contact_management',
      block: 4,
      blockTitle: 'Gestión y operativa',
      type: 'single',
      title: '¿Cómo organizas actualmente los mensajes y las citas?',
      desc: 'Identifica la forma en que gestionas las conversaciones y los contactos.',
      options: [
        { id: 'personalmente', text: 'Los gestiono personalmente desde WhatsApp.' },
        { id: 'otra_persona', text: 'Otra persona del equipo se encarga.' },
        { id: 'varias_personas', text: 'Varias personas gestionamos las consultas.' },
        { id: 'excel_sheets', text: 'Utilizamos Excel o Google Sheets para registrar contactos.' },
        { id: 'software_crm', text: 'Utilizamos software de agenda o CRM.' },
        { id: 'organizando_proceso', text: 'Todavía estamos organizando ese proceso.' }
      ]
    },
    {
      id: 8,
      variable: 'initial_business_priorities',
      block: 4,
      blockTitle: 'Objetivos a 3 meses',
      type: 'multiple',
      max: 2,
      title: '¿Qué te gustaría conseguir principalmente durante los próximos tres meses?',
      desc: 'Selecciona hasta dos prioridades inmediatas.',
      options: [
        { id: 'primeros_clientes_consultas', text: 'Conseguir mis primeros clientes o aumentar las consultas nuevas.' },
        { id: 'mas_reservas_consultas', text: 'Conseguir más reservas de las personas que ya preguntan.' },
        { id: 'promocionar_servicio', text: 'Promocionar un servicio que quiero dar a conocer.' },
        { id: 'mejorar_presencia', text: 'Mejorar la presencia de mi negocio en internet.' },
        { id: 'organizar_atencion', text: 'Organizar mejor la atención y el seguimiento.' },
        { id: 'definir_precios_costos', text: 'Definir mejor mis precios y costos.' },
        { id: 'preparar_campanas', text: 'Preparar campañas o acciones para dar a conocer el negocio.' },
        { id: 'sin_prioridad_clara', text: 'No tengo claro qué debería priorizar.', exclusive: true }
      ]
    }
  ];

  // ==========================================================================
  // 4. RECORRIDO C: NEGOCIOS ESTABLECIDOS (15 PREGUNTAS CON P15 RENOVADA)
  // ==========================================================================
  const QUESTIONS_ESTABLISHED = [
    // BLOQUE 1 — CONTEXTO Y CAPTACIÓN
    {
      id: 1,
      variable: 'business_type',
      block: 1,
      blockTitle: 'Contexto y captación',
      type: 'single',
      title: '¿Qué tipo de negocio tienes?',
      desc: 'Adaptará las recomendaciones al modelo y alcance de tu centro.',
      options: BUSINESS_TYPE_OPTIONS
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
    // NUEVA PREGUNTA 15 RENOVADA
    {
      id: 15,
      variable: 'business_priorities',
      block: 5,
      blockTitle: 'Gestión y prioridades',
      type: 'multiple',
      max: 2,
      title: '¿Qué te gustaría lograr en tu negocio durante los próximos tres meses?',
      desc: 'Selecciona hasta dos prioridades para orientar tu diagnóstico.',
      options: [
        {
          id: 'conseguir_clientes',
          text: 'Conseguir más clientes nuevos',
          subtext: 'Quiero que más personas conozcan mis servicios y me contacten.'
        },
        {
          id: 'mas_citas_existentes',
          text: 'Lograr más citas con las personas que ya me escriben',
          subtext: 'Recibo consultas, pero quiero conseguir más reservas a partir de ellas.'
        },
        {
          id: 'promocionar_servicio',
          text: 'Promocionar un tratamiento o servicio específico',
          subtext: 'Quiero darle mayor visibilidad y conseguir más reservas para ese servicio.'
        },
        {
          id: 'mejorar_presencia',
          text: 'Mejorar la presencia de mi negocio en internet',
          subtext: 'Quiero trabajar mis redes sociales, Google o mi página web.'
        },
        {
          id: 'ocupar_horarios',
          text: 'Ocupar mejor los horarios que tengo disponibles',
          subtext: 'Quiero conseguir más reservas en los días u horarios con poca actividad.'
        },
        {
          id: 'organizar_gestion',
          text: 'Organizar mi base de datos, atención y seguimiento',
          subtext: 'Quiero llevar un mejor control de interesados, conversaciones y clientes.'
        },
        {
          id: 'mejorar_rentabilidad',
          text: 'Mejorar la rentabilidad de mi negocio',
          subtext: 'Quiero revisar precios, costos y cuánto gano con mis servicios.'
        },
        {
          id: 'sin_prioridad_clara',
          text: 'Todavía no tengo claro qué debería priorizar',
          subtext: 'Prefiero que el diagnóstico me ayude a identificar por dónde empezar.',
          exclusive: true
        }
      ]
    }
  ];

  // Helper para obtener las preguntas de una etapa
  function getQuestions(stage) {
    if (stage === 'planning') return QUESTIONS_PLANNING;
    if (stage === 'starting') return QUESTIONS_STARTING;
    return QUESTIONS_ESTABLISHED;
  }

  function getOptionText(questions, variable, optionId) {
    const q = questions.find(item => item.variable === variable);
    if (!q) return optionId;
    const opt = q.options.find(o => o.id === optionId);
    return opt ? opt.text : optionId;
  }

  // ==========================================================================
  // 5. MOTOR DE ANÁLISIS: RECORRIDO A (PLANNING / PREPARACIÓN)
  // ==========================================================================
  function analyzePlanning(rawAnswers) {
    const a = { ...rawAnswers };
    if (!Array.isArray(a.opening_readiness)) a.opening_readiness = a.opening_readiness ? [a.opening_readiness] : [];
    if (!Array.isArray(a.planned_acquisition_channels)) a.planned_acquisition_channels = a.planned_acquisition_channels ? [a.planned_acquisition_channels] : [];
    if (!Array.isArray(a.opening_priorities)) a.opening_priorities = a.opening_priorities ? [a.opening_priorities] : [];

    const t = getTerminology(a.business_type);
    const Q = QUESTIONS_PLANNING;

    // 1. Resumen del proyecto
    const projectSummary = {
      businessTypeLabel: getOptionText(Q, 'business_type', a.business_type).replace(/\.$/, ''),
      timelineLabel: getOptionText(Q, 'opening_timeline', a.opening_timeline).replace(/\.$/, ''),
      serviceDefLabel: getOptionText(Q, 'service_definition', a.service_definition).replace(/\.$/, ''),
      locationModelLabel: getOptionText(Q, 'service_location_model', a.service_location_model).replace(/\.$/, ''),
      readinessLabels: a.opening_readiness.map(id => getOptionText(Q, 'opening_readiness', id).replace(/\.$/, '')),
      channelsLabels: a.planned_acquisition_channels.map(id => getOptionText(Q, 'planned_acquisition_channels', id).replace(/\.$/, '')),
      contactProcessLabel: getOptionText(Q, 'opening_contact_process', a.opening_contact_process).replace(/\.$/, ''),
      prioritiesLabels: a.opening_priorities.map(id => getOptionText(Q, 'opening_priorities', id).replace(/\.$/, ''))
    };

    // 2. Aspectos definidos
    const definedElements = [];
    if (a.opening_readiness.includes('identidad')) definedElements.push('Nombre e identidad visual del negocio estructurados.');
    if (a.opening_readiness.includes('lugar')) definedElements.push('Ubicación o modelo de atención confirmado.');
    if (a.opening_readiness.includes('equipos_proveedores')) definedElements.push('Equipos, insumos o proveedores principales seleccionados.');
    if (a.opening_readiness.includes('lista_precios')) definedElements.push('Lista de servicios y precios base definida.');
    if (a.opening_readiness.includes('presupuesto')) definedElements.push('Presupuesto de capital de trabajo proyectado.');
    if (a.opening_readiness.includes('canales_contacto')) definedElements.push('Canal de reservas y contacto previsto.');
    if (a.opening_readiness.includes('requisitos_revisados')) definedElements.push('Revisión inicial de requerimientos para operar realizada.');
    if (definedElements.length === 0) {
      definedElements.push('El proyecto se encuentra en etapa de concepción y diseño; es el momento propicio para organizar la oferta antes de contraer compromisos de costo fijo.');
    }

    // 3. Aspectos por revisar antes de abrir
    const pendingElements = [];
    if (!a.opening_readiness.includes('requisitos_revisados')) {
      pendingElements.push('Verificar los requisitos normativos, sanitarios y de habilitación comercial aplicables a tu actividad y sede con las autoridades pertinentes.');
    }
    if (a.service_definition === 'definidos_sin_precios' || a.service_definition === 'definiendo' || !a.opening_readiness.includes('lista_precios')) {
      pendingElements.push('Calcular los costos unitarios de insumos, tiempo asistencial y margen antes de fijar precios al público.');
    }
    if (!a.opening_readiness.includes('presupuesto')) {
      pendingElements.push('Estructurar un fondo de maniobra para cubrir los costos fijos de los primeros 3 a 6 meses sin depender de ingresos inmediatos.');
    }
    if (a.service_location_model === 'buscando_lugar') {
      pendingElements.push('Definir la sede física o modalidad de atención para validar requerimientos de espacio, zonificación y capacidad de ' + t.spaceWord + '.');
    }
    if (a.opening_contact_process === 'no_definido') {
      pendingElements.push('Definir el protocolo de respuesta inicial en WhatsApp y el mecanismo para asentar las primeras citas.');
    }
    if (pendingElements.length === 0) {
      pendingElements.push('Realizar pruebas piloto de la experiencia de reserva y atención con personas de confianza antes del lanzamiento oficial.');
    }

    // 4. Determinación del Área Principal
    const wantsServices = a.opening_priorities.includes('definir_servicios');
    const wantsPrices = a.opening_priorities.includes('organizar_precios');
    const wantsLaunch = a.opening_priorities.includes('plan_lanzamiento');
    const wantsClients = a.opening_priorities.includes('dar_a_conocer');
    const wantsWhatsapp = a.opening_priorities.includes('organizar_whatsapp');
    const isImminentOpening = a.opening_timeline === 'mes_1';
    const isServicesPending = a.service_definition === 'definiendo' || a.service_definition === 'varias_opciones';
    const isPricesPending = a.service_definition === 'definidos_sin_precios';

    let primaryOpportunity = null;

    if (isPricesPending || wantsPrices) {
      primaryOpportunity = {
        area: 'Estructuración de costos y precios antes de publicar la oferta',
        badge: 'Costos y Precios',
        explanation: 'Declaraste que los servicios principales están seleccionados pero los precios siguen pendientes o requieren organización. Antes de abrir canales comerciales o diseñar piezas gráficas, es indispensable calcular el costo real de cada ' + t.serviceWordSingular + ' (insumos, tiempo en cabina y fijos proporcionales) para fijar tarifas sostenibles.',
        evidence: 'Servicios: ' + getOptionText(Q, 'service_definition', a.service_definition) + ' · Prioridad: ' + (projectSummary.prioritiesLabels.join(' · ') || 'Costos y precios') + '.',
        whyItMatters: 'Comenzar con precios calculados a ciegas o copiando a la competencia genera riesgo de operar a pérdida o tener que subir tarifas abruptamente en los primeros meses.'
      };
    } else if (isServicesPending || wantsServices) {
      primaryOpportunity = {
        area: 'Definición y selección de la carta de servicios inicial',
        badge: 'Definición de Oferta',
        explanation: 'Tu proyecto se encuentra decidiendo la carta de ' + t.serviceWord + '. En lugar de intentar ofrecer un catálogo exhaustivo desde el primer día, conviene concentrarse en 3 a 5 tratamientos insignia con demanda comprobada y buen margen de contribución.',
        evidence: 'Estado de servicios: ' + getOptionText(Q, 'service_definition', a.service_definition) + '.',
        whyItMatters: 'Una oferta acotada simplifica la compra inicial de equipos e insumos, facilita la capacitación del equipo y hace que tu mensaje de apertura sea claro para los primeros interesados.'
      };
    } else if (isImminentOpening && (!a.opening_readiness.includes('canales_contacto') || a.opening_contact_process === 'no_definido')) {
      primaryOpportunity = {
        area: 'Aseguramiento del proceso de reservas para apertura inminente',
        badge: 'Operativa de Apertura',
        explanation: 'Falta menos de un mes para comenzar a atender y los canales de contacto o el proceso de reserva están en definición. En este momento crítico conviene simplificar la recepción de mensajes para que ninguna persona interesada quede sin respuesta.',
        evidence: 'Fecha prevista: Próximo mes · Canales de contacto en preparación.',
        whyItMatters: 'Abrir puertas sin un número de WhatsApp organizado ni claridad en horarios de atención dispersa las primeras consultas y frustra la primera impresión del cliente.'
      };
    } else if (wantsLaunch || wantsClients) {
      primaryOpportunity = {
        area: 'Plan de lanzamiento y primeros clientes',
        badge: 'Lanzamiento Comercial',
        explanation: 'Con los pilares operativos orientados, el siguiente paso prudente es diseñar una secuencia de anticipación para que tu apertura cuente con ' + t.clientWord + ' programados desde la primera semana.',
        evidence: 'Prioridad: Dar a conocer el negocio y preparar lanzamiento · Canales: ' + (projectSummary.channelsLabels.join(', ') || 'En preparación') + '.',
        whyItMatters: 'Esperar al día de apertura para empezar a comunicar suele dejar las primeras semanas vacías; activar contactos y contenidos dos semanas antes reduce la incertidumbre inicial.'
      };
    } else {
      primaryOpportunity = {
        area: 'Organización secuencial de tareas previas a la apertura',
        badge: 'Hoja de Ruta',
        explanation: 'La preparación de un centro de ' + projectSummary.businessTypeLabel.toLowerCase() + ' involucra decisiones legales, operativas y comerciales interconectadas. Ordenarlas por orden de dependencia evita gastar en marketing antes de tener el espacio y la oferta listos.',
        evidence: 'Estado general de preparación según elementos declarados.',
        whyItMatters: 'Avanzar en el orden correcto protege tu presupuesto inicial y asegura que cada paso prepare al siguiente.'
      };
    }

    // 5. Tres Prioridades Estructuradas (sin repetición, alineadas con R13 y dependencias lógicas)
    const prioritiesPool = [];
    const hasRealChannels = a.planned_acquisition_channels.length > 0 && !a.planned_acquisition_channels.includes('sin_canales');

    // 1. Si los servicios están totalmente indefinidos, definir la oferta es el paso 1 ineludible (R3)
    if (isServicesPending) {
      prioritiesPool.push({
        id: 'carta_acotada',
        title: 'Acotar la oferta de apertura a 3 o 4 tratamientos insignia',
        explanation: 'Abrir con un catálogo demasiado extenso encarece los insumos iniciales y complica la comunicación comercial. Comenzar con tratamientos insignia facilita la maestría técnica y las primeras recomendaciones.',
        concreteAction: 'Selecciona entre 3 y 5 tratamientos de bienestar o cuidado con buena aceptación y define qué incluye cada sesión antes de adquirir insumos adicionales.',
        relationToAnswers: 'Te encuentras definiendo qué servicios ofrecerás o tienes múltiples opciones bajo evaluación.'
      });
    }

    // 2. Costos y precios (si el usuario lo priorizó o tiene precios pendientes con servicios ya seleccionados)
    if (wantsPrices || (isPricesPending && !isServicesPending)) {
      prioritiesPool.push({
        id: 'costos_precios',
        title: 'Revisar costos unitarios antes de fijar precios definitivos',
        explanation: 'Calcula el costo real de cada ' + t.serviceWordSingular + ' considerando materiales descartables, producto aplicado, tiempo de ' + t.spaceWord + ' y margen de contribución.',
        concreteAction: 'Elabora una hoja de cálculo con los costos directos de tus tratamientos seleccionados y define el margen operativo antes de diseñar listas o cartas de precios.',
        relationToAnswers: 'Marcaste que los precios están en proceso o seleccionaste finanzas y costos como prioridad.'
      });
    }

    // 3. Proceso de atención y WhatsApp (priorizado si el usuario lo pidió o atiende personalmente)
    if (wantsWhatsapp || (a.opening_contact_process === 'personalmente' && !isServicesPending)) {
      prioritiesPool.push({
        id: 'proceso_whatsapp',
        title: 'Estructurar la atención de WhatsApp y las políticas de cita',
        explanation: 'Define plantillas de respuesta con la información esencial de cada ' + t.serviceWordSingular + ', ubicación, horarios y requisitos para agendar.',
        concreteAction: 'Configura un perfil de WhatsApp Business con catálogo básico y redacta respuestas rápidas para las 5 preguntas que con mayor probabilidad harán tus primeros interesados.',
        relationToAnswers: a.opening_contact_process === 'personalmente' ? 'Atenderás personalmente los mensajes; contar con textos listos te ahorrará tiempo en cabina.' : 'Marcaste la atención al cliente y reservas como prioridad.'
      });
    }

    // 4. Plan de lanzamiento y primeros clientes (si el usuario lo priorizó y la oferta está definida)
    if ((wantsLaunch || wantsClients || hasRealChannels) && !isServicesPending) {
      prioritiesPool.push({
        id: 'plan_lanzamiento',
        title: 'Diseñar una secuencia de expectativa y lanzamiento',
        explanation: 'Activa a tu círculo de conocidos, colegas y alianzas locales 2 a 3 semanas antes de abrir para llenar las primeras fechas sin depender de pauta fría.',
        concreteAction: 'Haz una lista de 30 a 50 contactos cercanos para ofrecerles una sesión de apertura o invitarlos a conocer el nuevo espacio, generando las primeras recomendaciones.',
        relationToAnswers: 'Declaraste canales planificados (' + (projectSummary.channelsLabels.slice(0, 2).join(', ') || 'redes') + ') y meta de captación inicial.'
      });
    }

    // 5. Ubicación / espacio de atención pendiente
    if (a.service_location_model === 'buscando_lugar') {
      prioritiesPool.push({
        id: 'definir_espacio',
        title: 'Definir la modalidad y espacio de atención',
        explanation: 'Contar con sede propia, espacio alquilado o compartido determina los costos fijos mensuales, la capacidad de ' + t.spaceWord + ' y los trámites de apertura necesarios.',
        concreteAction: 'Evalúa las opciones de alquiler o espacio compartido comparando el canon fijo contra el volumen mínimo de sesiones requerido para cubrirlo.',
        relationToAnswers: 'Indicaste que todavía estás buscando o definiendo el lugar de atención.'
      });
    }

    // 6. Requisitos normativos y sanitarios pendientes
    if (!a.opening_readiness.includes('requisitos_revisados')) {
      prioritiesPool.push({
        id: 'requisitos_normativos',
        title: 'Comprobar requisitos aplicables a tu actividad y sede',
        explanation: 'Verifica los requerimientos sanitarios, técnicos y comerciales correspondientes a tu tipología de establecimiento (' + projectSummary.businessTypeLabel + ') antes de comprometer obras o compras finales.',
        concreteAction: 'Consulta la normativa vigente en tu municipio o entidad de salud para validar que las instalaciones de ' + t.spaceWord + ' y los equipos cumplan las condiciones exigidas.',
        relationToAnswers: 'No marcaste haber completado la revisión de requisitos para comenzar.'
      });
    }

    // 7. Presupuesto operativo y capital de trabajo
    if (!a.opening_readiness.includes('presupuesto')) {
      prioritiesPool.push({
        id: 'presupuesto_maniobra',
        title: 'Proyectar el flujo de caja y fondo de maniobra inicial',
        explanation: 'Los centros de bienestar y estética suelen requerir de 3 a 6 meses para consolidar su flujo regular de reservas. Un colchón financiero evita decisiones comerciales precipitadas.',
        concreteAction: 'Suma el total de costos fijos mensuales (arriendo, servicios, sueldos base) y asegúrate de contar con reserva para cubrir al menos 90 días de operación.',
        relationToAnswers: 'El presupuesto operativo de los primeros meses aún está pendiente de estimación.'
      });
    }

    // 8. Proceso de atención para caso no definido
    if (a.opening_contact_process === 'no_definido' && !prioritiesPool.some(p => p.id === 'proceso_whatsapp')) {
      prioritiesPool.push({
        id: 'proceso_whatsapp',
        title: 'Estructurar la atención de WhatsApp y las políticas de cita',
        explanation: 'Define plantillas de respuesta con la información esencial de cada ' + t.serviceWordSingular + ', ubicación, horarios y requisitos para agendar.',
        concreteAction: 'Configura un perfil de WhatsApp Business con catálogo básico y redacta respuestas rápidas para las 5 preguntas iniciales.',
        relationToAnswers: 'El canal de recepción de consultas está pendiente de definir.'
      });
    }

    // 9. Visibilidad local en Google Maps
    if ((a.service_location_model === 'local_propio' || a.service_location_model === 'alquilado') && hasRealChannels) {
      prioritiesPool.push({
        id: 'google_maps_local',
        title: 'Configurar el Perfil de Empresa en Google antes de abrir',
        explanation: 'El alta y verificación en Google Maps suele tardar varios días. Tenerlo listo permite que las personas que busquen ' + t.serviceWord + ' en tu zona te encuentren desde el primer día.',
        concreteAction: 'Crea el perfil de tu sede con fotos de la fachada y el interior, horarios previstos y enlace directo a tu WhatsApp de reservas.',
        relationToAnswers: 'Contarás con sede física propia o alquilada; la visibilidad local en mapa es un canal natural de captación.'
      });
    }

    // Asegurar exactamente 3 prioridades
    const priorities = prioritiesPool.slice(0, 3);
    while (priorities.length < 3) {
      priorities.push({
        id: 'registro_inicial_prep',
        title: 'Preparar una plantilla de registro de primeros contactos',
        explanation: 'Registrar desde el primer día el nombre, servicio de interés y origen de cada persona que escribe crea el activo más valioso de tu centro: su base de datos.',
        concreteAction: 'Crea una hoja de cálculo con columnas de fecha, nombre, canal de llegada, tratamiento consultado y estado de la cita.',
        relationToAnswers: 'Recomendación base para iniciar la operación con orden comercial.'
      });
    }

    // 6. Plan inicial de preparación (4 fases adaptadas)
    const preparationPlan = {
      phase1: {
        title: 'Fase 1: Antes de comenzar — Fundamentos y Espacio',
        items: [
          'Verificación de requisitos normativos, sanitarios y de adecuación técnica según tu tipología de negocio (' + projectSummary.businessTypeLabel + ').',
          'Definición de ' + t.spaceWord + ', compras de insumos esenciales y acuerdos con proveedores confiables.',
          'Cálculo de costos fijos mensuales y reserva de capital de trabajo para cubrir los primeros meses.'
        ]
      },
      phase2: {
        title: 'Fase 2: Preparación comercial — Oferta y Canales',
        items: [
          'Selección de 3 a 5 ' + t.serviceWord + ' principales con sus protocolos, duración y precios calculados con margen real.',
          'Configuración de canal oficial de contacto (WhatsApp Business con mensaje de bienvenida y horarios).',
          'Apertura de Perfil en Google Maps e identidad visual básica en redes sociales con propuesta clara.'
        ]
      },
      phase3: {
        title: 'Fase 3: Primeras semanas de operación — Lanzamiento y Atención',
        items: [
          'Comunicación de apertura a contactos cercanos, pacientes previos (si aplica) y alianzas locales.',
          'Atención ágil de consultas en horario laboral con información precisa de los ' + t.serviceWord + '.',
          'Registro de cada consulta recibida y seguimiento a las 24 horas para personas que no hayan agendado.'
        ]
      },
      phase4: {
        title: 'Fase 4: Primeros meses — Consolidación y Medición',
        items: [
          'Medición de qué tratamientos generan mayor interés y qué canales traen más ' + t.clientWord + '.',
          'Recolección de testimonios y valoraciones en Google de las primeras personas atendidas.',
          'Ajuste de tiempos de cabina y control de costos frente al punto de equilibrio planeado.'
        ]
      },
      disclaimer: 'Nota metodológica: Gloss Growth proporciona orientación comercial y estratégica. La validación de requerimientos normativos, sanitarios y de habilitación corresponde a las autoridades competentes y a profesionales acreditados en cada jurisdicción.'
    };

    // 7. Herramientas sugeridas
    const relatedTools = [
      {
        title: 'Simulador de Capacidad Instalada',
        desc: 'Calcula cuántas horas reales de ' + t.spaceWord + ' tendrás disponibles a la semana y cuántas sesiones necesitas para tu punto de equilibrio.',
        badge: 'Herramienta de Planificación',
        url: '../capacidad-instalada/'
      },
      {
        title: 'Estudio de Contenido para Estética',
        desc: 'Estructuras editoriales y ganchos de comunicación para presentar tus primeros ' + t.serviceWord + ' sin afirmaciones inseguras.',
        badge: 'Contenido y Lanzamiento',
        url: '../estudio-contenido/'
      },
      {
        title: 'Gloss Insights — Volumen 01',
        desc: 'Investigación sectorial de referencia con cifras reales del mercado de estética y bienestar en Colombia y Latinoamérica.',
        badge: 'Investigación de Mercado',
        url: '../investigaciones/volumen-01/'
      }
    ];

    // 8. Payload WhatsApp
    const primaryTitle = primaryOpportunity.area;
    const waText = encodeURIComponent(
      `Hola Gloss Growth, completé la guía de preparación para apertura en su web.\n` +
      `• Proyecto: ${projectSummary.businessTypeLabel}\n` +
      `• Plazo de apertura: ${projectSummary.timelineLabel}\n` +
      `• Principal prioridad: ${primaryTitle}\n\n` +
      `Me gustaría recibir orientación sobre los siguientes pasos de mi negocio.`
    );

    return {
      stage: 'planning',
      projectSummary,
      definedElements,
      pendingElements,
      primaryOpportunity,
      priorities,
      preparationPlan,
      relatedTools,
      whatsappPayload: {
        url: 'https://wa.me/573145904933?text=' + waText,
        text: waText
      }
    };
  }

  // ==========================================================================
  // 6. MOTOR DE ANÁLISIS: RECORRIDO B (STARTING / PRIMEROS CLIENTES)
  // ==========================================================================
  function analyzeStarting(rawAnswers) {
    const a = { ...rawAnswers };
    if (!Array.isArray(a.initial_acquisition_sources)) a.initial_acquisition_sources = a.initial_acquisition_sources ? [a.initial_acquisition_sources] : [];
    if (!Array.isArray(a.initial_marketing_channels)) a.initial_marketing_channels = a.initial_marketing_channels ? [a.initial_marketing_channels] : [];
    if (!Array.isArray(a.initial_business_priorities)) a.initial_business_priorities = a.initial_business_priorities ? [a.initial_business_priorities] : [];

    const t = getTerminology(a.business_type);
    const Q = QUESTIONS_STARTING;

    // 1. Resumen de negocio
    const businessSummary = {
      businessTypeLabel: getOptionText(Q, 'business_type', a.business_type).replace(/\.$/, ''),
      serviceOfferLabel: getOptionText(Q, 'initial_service_offer', a.initial_service_offer).replace(/\.$/, ''),
      sourcesLabels: a.initial_acquisition_sources.map(id => getOptionText(Q, 'initial_acquisition_sources', id).replace(/\.$/, '')),
      inquiriesLabel: getOptionText(Q, 'initial_monthly_inquiries', a.initial_monthly_inquiries).replace(/\.$/, ''),
      bookingPatternLabel: getOptionText(Q, 'initial_booking_pattern', a.initial_booking_pattern).replace(/\.$/, ''),
      marketingChannelsLabels: a.initial_marketing_channels.map(id => getOptionText(Q, 'initial_marketing_channels', id).replace(/\.$/, '')),
      contactManagementLabel: getOptionText(Q, 'initial_contact_management', a.initial_contact_management).replace(/\.$/, ''),
      prioritiesLabels: a.initial_business_priorities.map(id => getOptionText(Q, 'initial_business_priorities', id).replace(/\.$/, ''))
    };

    // 2. Análisis de canales de llegada
    let acquisitionAnalysis = '';
    const hasNoClients = a.initial_acquisition_sources.includes('sin_clientes');
    const hasReferrals = a.initial_acquisition_sources.includes('recomendaciones');

    if (hasNoClients) {
      acquisitionAnalysis = 'Aún no se han recibido clientes regulares; es una situación común al comenzar a operar. El objetivo en esta fase temprana es activar contactos directos y visibilidad local para conseguir las primeras experiencias en cabina sin forzar inversiones publicitarias prematuras.';
    } else if (hasReferrals) {
      acquisitionAnalysis = 'Tus primeros clientes provienen principalmente del voz a voz y recomendaciones. Este origen es positivo porque refleja confianza en tu trabajo técnico; el reto a continuación consiste en complementar este canal con medios que generen consultas de manera predecible.';
    } else {
      acquisitionAnalysis = 'Tus primeros interesados provienen de ' + (businessSummary.sourcesLabels.join(' y ') || 'canales digitales') + '. En esta fase conviene observar qué fuentes traen personas con mayor disposición a agendar y completar el tratamiento.';
    }

    // 3. Situación de consultas y reservas
    let inquiryAnalysis = '';
    const noInquiries = a.initial_monthly_inquiries === 'sin_consultas' || a.initial_monthly_inquiries === '0_10';
    const hasInquiries = ['11_30', '31_60', 'mas_60'].includes(a.initial_monthly_inquiries);
    const lowBooking = a.initial_booking_pattern === 'pocas_reservas';
    const noRecords = a.initial_monthly_inquiries === 'sin_registro' || a.initial_booking_pattern === 'sin_registro';

    if (noInquiries) {
      inquiryAnalysis = 'El volumen de consultas mensuales es temprano (' + businessSummary.inquiriesLabel.toLowerCase() + '). En este punto no es prudente evaluar porcentajes de conversión; lo prioritario es dar a conocer la propuesta y poner en marcha los canales de contacto.';
    } else if (lowBooking) {
      inquiryAnalysis = 'Estás recibiendo un flujo mensual de interesados (' + businessSummary.inquiriesLabel.toLowerCase() + '), pero la mayoría queda en preguntas y pocas personas concretan cita. Mejorar el protocolo de respuesta comercial en WhatsApp representa la palanca más inmediata.';
    } else if (hasInquiries) {
      inquiryAnalysis = 'Reportas un volumen activo de consultas (' + businessSummary.inquiriesLabel.toLowerCase() + ') y una respuesta comercial favorable. El siguiente paso consiste en comenzar a medir cuántas citas terminan en asistencia real y recompra.';
    } else {
      inquiryAnalysis = 'Actualmente no se lleva un registro sistemático de cuántas personas escriben ni de cuántas agendan. Registrar estos dos datos durante las próximas semanas permitirá saber si el reto está en atraer más público o en atender mejor a quienes ya preguntan.';
    }

    // 4. Determinación de Área Principal
    const wantsClients = a.initial_business_priorities.includes('primeros_clientes_consultas');
    const wantsBooking = a.initial_business_priorities.includes('mas_reservas_consultas');
    const wantsService = a.initial_business_priorities.includes('promocionar_servicio');
    const wantsPrices = a.initial_business_priorities.includes('definir_precios_costos');
    const wantsPresence = a.initial_business_priorities.includes('mejorar_presencia');
    const wantsOps = a.initial_business_priorities.includes('organizar_atencion');

    let primaryOpportunity = null;

    if (noInquiries || (hasNoClients && wantsClients)) {
      primaryOpportunity = {
        area: 'Visibilidad inicial y generación de las primeras consultas',
        badge: 'Captación Inicial',
        explanation: 'Al estar iniciando, tu negocio necesita que personas con interés real conozcan tu ubicación y tus ' + t.serviceWord + '. Hablar de optimizar tasas de agendamiento o adquirir software complejo resulta prematuro si todavía no existe un volumen regular de mensajes.',
        evidence: 'Consultas mensuales: ' + businessSummary.inquiriesLabel + ' · Origen de clientes: ' + (businessSummary.sourcesLabels.join(', ') || 'En proceso') + '.',
        whyItMatters: 'Conseguir las primeras 15 a 30 consultas mensuales permite validar qué tratamientos despiertan interés genuino y poner a prueba los tiempos reales de tu equipo.'
      };
    } else if (lowBooking || wantsBooking) {
      primaryOpportunity = {
        area: 'Conversión de consultas en citas agendadas',
        badge: 'Conversión Comercial',
        explanation: 'Existe un flujo de personas preguntando por tus servicios, pero la mayoría de las conversaciones se diluyen sin fecha de cita. Ajustar la forma en que se responde, presentar el valor antes del precio y ofrecer horarios concretos elevará las reservas con las personas que ya están escribiendo.',
        evidence: 'Patrón de agendamiento: ' + businessSummary.bookingPatternLabel + ' · Consultas: ' + businessSummary.inquiriesLabel + '.',
        whyItMatters: 'Cada persona que escribe ya dedicó tiempo a buscarte; mejorar la respuesta es mucho más económico y rápido que pagar por más anuncios para compensar conversaciones perdidas.'
      };
    } else if (wantsPrices || a.initial_service_offer === 'ajustando_oferta') {
      primaryOpportunity = {
        area: 'Revisión y consolidación de estructura de costos y precios',
        badge: 'Finanzas y Margen',
        explanation: 'Con los primeros tratamientos realizados, ahora cuentas con evidencia sobre el gasto real de materiales y el tiempo de cabina. Ajustar los precios en esta etapa temprana evita arrastrar márgenes deficientes conforme aumente el volumen.',
        evidence: 'Oferta actual: ' + businessSummary.serviceOfferLabel + ' · Prioridad: Definir mejor precios y costos.',
        whyItMatters: 'Un tratamiento con precio mal calculado genera la ilusión de actividad pero no deja beneficio neto tras pagar consumibles y costos fijos.'
      };
    } else if (wantsService) {
      primaryOpportunity = {
        area: 'Promoción y posicionamiento de un servicio prioritario',
        badge: 'Foco en Oferta',
        explanation: 'Concentrar la comunicación en un tratamiento específico facilita que el público entienda qué problema resuelves y por qué deberían acudir a tu centro.',
        evidence: 'Prioridad declarada: Promocionar un servicio que quiero dar a conocer.',
        whyItMatters: 'Promocionar muchos tratamientos a la vez en un negocio nuevo dispersa la atención y reduce el impacto de cada mensaje.'
      };
    } else {
      primaryOpportunity = {
        area: 'Organización del registro de prospectos y seguimiento',
        badge: 'Organización Comercial',
        explanation: 'Establecer un hábito sencillo de registro para anotar quién escribe, qué servicio consultó y cuándo se le respondió permite hacer seguimiento a quienes no agendaron de inmediato.',
        evidence: 'Gestión actual de contactos: ' + businessSummary.contactManagementLabel + '.',
        whyItMatters: 'Entre un 30% y un 50% de las personas que no agendan en el primer mensaje estarían dispuestas a hacerlo con un seguimiento educado en las siguientes 24 a 48 horas.'
      };
    }

    // 5. Tres Acciones Concretas
    const prioritiesPool = [];

    // Acción para responder mejor en WhatsApp
    if (lowBooking || wantsBooking || a.initial_contact_management === 'personalmente') {
      prioritiesPool.push({
        id: 'protocolo_whatsapp',
        title: 'Optimizar el protocolo de respuesta comercial en WhatsApp',
        explanation: 'Responde con rapidez en horario de atención, presenta brevemente el beneficio y la experiencia del ' + t.serviceWordSingular + ' antes de la cifra, y ofrece dos opciones concretas de horario para la valoración.',
        concreteAction: 'Crea 3 mensajes predeterminados para tus tratamientos más consultados: bienvenida con pregunta de diagnóstico, explicación del procedimiento y propuesta de dos horarios de cita.',
        relationToAnswers: 'Reportas que muchas consultas quedan en preguntas o gestionas los mensajes personalmente.'
      });
    }

    // Acción para visibilidad local
    if (!a.initial_marketing_channels.includes('google_maps') || wantsPresence || noInquiries) {
      prioritiesPool.push({
        id: 'activar_maps',
        title: 'Completar y activar el Perfil de Google Maps',
        explanation: 'Para centros de estética y bienestar, Google Maps es el canal orgánico con mayor intención de compra: quienes buscan ahí están buscando un centro cercano para agendar pronto.',
        concreteAction: 'Asegúrate de tener fotos reales del espacio y del equipo, dirección precisa, categoría correcta y enlace directo a WhatsApp.',
        relationToAnswers: 'Canal Google Maps no marcado o prioridad de presencia digital.'
      });
    }

    // Acción para registro ordenado (respetando Excel)
    if (a.initial_contact_management === 'excel_sheets') {
      prioritiesPool.push({
        id: 'mantener_excel',
        title: 'Consolidar el registro en hoja de cálculo sin complicar el proceso',
        explanation: 'El uso de Excel o Google Sheets es completamente adecuado para tu volumen actual. No requieres contratar software costoso ni CRM complejo en este momento.',
        concreteAction: 'Añade únicamente dos columnas a tu tabla actual: fecha de última respuesta y motivo si no agendó (ej: precio, horario, sin respuesta) para identificar patrones.',
        relationToAnswers: 'Declaraste gestionar contactos en hoja de cálculo; es una herramienta funcional para esta etapa.'
      });
    } else if (a.initial_contact_management === 'organizando_proceso' || noRecords) {
      prioritiesPool.push({
        id: 'iniciar_registro',
        title: 'Iniciar una libreta o tabla básica de consultas semanales',
        explanation: 'Anotar cada persona que escribe evita que las conversaciones queden enterradas en WhatsApp y te da control sobre cuántos clientes potenciales tienes activos.',
        concreteAction: 'Lleva una lista simple de 4 columnas: Fecha, Nombre, Tratamiento consultado y Estado (Agendó / Pendiente / No interesado).',
        relationToAnswers: 'Indicaste que todavía están organizando el proceso o no llevan registro centralizado.'
      });
    }

    // Acción para promocionar servicio específico
    if (wantsService) {
      prioritiesPool.push({
        id: 'campana_servicio',
        title: 'Estructurar una campaña focalizada para tu servicio insignia',
        explanation: 'Prepara 3 piezas de contenido (video explicativo, antes/después con consentimiento y testimonio) centradas exclusivamente en ese tratamiento.',
        concreteAction: 'Publica las 3 piezas en un periodo de dos semanas con llamado claro a consultar valoración por WhatsApp y mide cuántos mensajes nuevos genera ese servicio.',
        relationToAnswers: 'Señalaste como prioridad promocionar un tratamiento específico.'
      });
    }

    // Acción para costos y precios
    if (wantsPrices || a.initial_service_offer === 'ajustando_oferta') {
      prioritiesPool.push({
        id: 'auditoria_costos_inicial',
        title: 'Auditar el costo de materiales y tiempo por tratamiento',
        explanation: 'Anota durante una semana los insumos descartables reales y el tiempo de cabina de cada procedimiento para confirmar que tus precios cubran el costo operativo.',
        concreteAction: 'Calcula el margen neto de tus 2 tratamientos con más citas y ajusta el precio de los que requieran más de 45 minutos de atención profesional.',
        relationToAnswers: 'Te encuentras ajustando la oferta o marcaste costos y precios como meta.'
      });
    }

    // Acción para reactivar contactos
    prioritiesPool.push({
      id: 'reactivar_contactos',
      title: 'Implementar un mensaje de seguimiento amable a las 24 horas',
      explanation: 'Muchas personas no agendan porque estaban ocupadas al recibir el precio. Un mensaje cordial al día siguiente preguntando si desean resolver alguna duda recupera citas sin sonar insistente.',
      concreteAction: 'Envía un mensaje cordial al día siguiente: «Hola [Nombre], ¿te quedó alguna duda sobre el tratamiento o te gustaría que revisáramos horarios para esta semana?».',
      relationToAnswers: 'Estrategia de retención comercial para aprovechar las consultas ya recibidas.'
    });

    const priorities = prioritiesPool.slice(0, 3);
    while (priorities.length < 3) {
      priorities.push({
        id: 'fidelizar_primeros',
        title: 'Fidelizar y pedir reseñas a tus primeros clientes atendidos',
        explanation: 'Las primeras valoraciones positivas en Google y las recomendaciones boca a boca son la base más sólida para construir autoridad local.',
        concreteAction: 'Envía un enlace de reseña de Google a cada cliente satisfecho 24 horas después de su sesión agradeciendo su confianza.',
        relationToAnswers: 'Fortalecimiento de la reputación inicial del centro.'
      });
    }

    // 6. Datos que conviene comenzar a registrar
    const unmeasuredIndicators = [];
    if (a.initial_monthly_inquiries === 'sin_registro') {
      unmeasuredIndicators.push('Número total de personas nuevas que preguntan por tus servicios cada semana.');
    }
    if (a.initial_booking_pattern === 'sin_registro') {
      unmeasuredIndicators.push('Cantidad de personas que agendan una cita frente al total de quienes consultaron.');
    }
    unmeasuredIndicators.push('Motivo principal por el cual las personas interesadas no concretan la cita (precio, horario, lejanía o dudas).');
    unmeasuredIndicators.push('Canal específico por el cual te conoció cada cliente nuevo (Google, recomendación de conocido, redes sociales).');

    // 7. Herramientas sugeridas
    const relatedTools = [
      {
        title: 'Simulador de Capacidad Instalada',
        desc: 'Evalúa el aprovechamiento de tus ' + t.spaceWord + ' y calcula cuántas sesiones necesitas para cubrir tus costos mensuales.',
        badge: 'Gestión y Agenda',
        url: '../capacidad-instalada/'
      },
      {
        title: 'Estudio de Contenido para Estética',
        desc: 'Estructuras narrativas y ganchos probados para explicar tus tratamientos en redes y generar consultas cualificadas.',
        badge: 'Contenido y Redes',
        url: '../estudio-contenido/'
      },
      {
        title: 'Calculadora de Presupuesto Publicitario',
        desc: 'Conoce los rangos realistas de inversión antes de activar tus primeras campañas pagadas en Meta o Google.',
        badge: 'Planificación Comercial',
        url: '../calculadora-publicidad/'
      }
    ];

    // 8. Payload WhatsApp
    const primaryTitle = primaryOpportunity.area;
    const waText = encodeURIComponent(
      `Hola Gloss Growth, completé el diagnóstico de primeros clientes en su web.\n` +
      `• Negocio: ${businessSummary.businessTypeLabel}\n` +
      `• Consultas mensuales: ${businessSummary.inquiriesLabel}\n` +
      `• Principal oportunidad: ${primaryTitle}\n\n` +
      `Me gustaría recibir orientación para organizar mi crecimiento comercial.`
    );

    return {
      stage: 'starting',
      businessSummary,
      acquisitionAnalysis,
      inquiryAnalysis,
      primaryOpportunity,
      priorities,
      unmeasuredIndicators,
      relatedTools,
      whatsappPayload: {
        url: 'https://wa.me/573145904933?text=' + waText,
        text: waText
      }
    };
  }

  // ==========================================================================
  // 7. MOTOR DE ANÁLISIS: RECORRIDO C (ESTABLISHED / NEGOCIOS ESTABLECIDOS)
  // ==========================================================================
  function analyzeEstablished(rawAnswers) {
    const a = { ...rawAnswers };
    if (!Array.isArray(a.acquisition_sources)) a.acquisition_sources = a.acquisition_sources ? [a.acquisition_sources] : [];
    if (!Array.isArray(a.digital_channels)) a.digital_channels = a.digital_channels ? [a.digital_channels] : [];
    if (!Array.isArray(a.business_priorities)) a.business_priorities = a.business_priorities ? [a.business_priorities] : [];

    const t = getTerminology(a.business_type);
    const Q = QUESTIONS_ESTABLISHED;

    // Resumen del negocio
    const businessSummary = {
      businessType: a.business_type,
      businessTypeLabel: getOptionText(Q, 'business_type', a.business_type).replace(/\.$/, ''),
      sourcesLabels: a.acquisition_sources.map(id => getOptionText(Q, 'acquisition_sources', id).replace(/\.$/, '')),
      inquiriesLabel: getOptionText(Q, 'monthly_inquiries', a.monthly_inquiries).replace(/\.$/, ''),
      bookingLabel: getOptionText(Q, 'inquiry_to_booking', a.inquiry_to_booking).replace(/\.$/, ''),
      attendanceLabel: getOptionText(Q, 'booking_attendance', a.booking_attendance).replace(/\.$/, ''),
      occupancyLabel: getOptionText(Q, 'schedule_occupancy', a.schedule_occupancy).replace(/\.$/, ''),
      prioritiesLabels: a.business_priorities.map(id => getOptionText(Q, 'business_priorities', id).replace(/\.$/, ''))
    };

    // Indicadores no medidos
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

    // Variables operativas
    const hasHighInquiries = ['61_120', 'mas_120'].includes(a.monthly_inquiries);
    const hasModInquiries = ['31_60'].includes(a.monthly_inquiries);
    const hasLowInquiries = ['0_10', '11_30'].includes(a.monthly_inquiries);

    const hasLowBooking = ['0_2', '3_4'].includes(a.inquiry_to_booking);
    const hasGoodBooking = ['7_8', '9_10'].includes(a.inquiry_to_booking);

    const hasLowAttendance = ['0_4', '5_6'].includes(a.booking_attendance);
    const hasGoodAttendance = ['7_8', '9_10'].includes(a.booking_attendance);

    const hasHighOccupancy = a.schedule_occupancy === '75_100';
    const hasMidOccupancy = a.schedule_occupancy === '50_74';
    const hasLowOccupancy = ['menos_25', '25_49'].includes(a.schedule_occupancy);

    // Mapeo de nuevas opciones de P15
    const wantsMoreClients = a.business_priorities.includes('conseguir_clientes');
    const wantsMoreBookings = a.business_priorities.includes('mas_citas_existentes');
    const wantsPromoteService = a.business_priorities.includes('promocionar_servicio');
    const wantsPresence = a.business_priorities.includes('mejorar_presencia');
    const wantsOccupancy = a.business_priorities.includes('ocupar_horarios');
    const wantsManagement = a.business_priorities.includes('organizar_gestion');
    const wantsProfit = a.business_priorities.includes('mejorar_rentabilidad');
    const noClearPriority = a.business_priorities.includes('sin_prioridad_clara');

    const usesReferrals = a.acquisition_sources.includes('recomendaciones');
    const noPaidAds = a.paid_advertising === 'no_pauta';
    const activePaidAds = ['constante', 'temporadas'].includes(a.paid_advertising);
    const usesSheets = a.lead_record_system === 'hoja_calculo';

    // Regla D: Contradicción Capacidad Saturada vs Querer Más Clientes
    const contradictionCapacidad = hasHighOccupancy && wantsMoreClients;
    const severeDataDeficit = unmeasuredIndicators.length >= 3;

    // Determinación del Área Principal
    let primaryOpportunity = null;

    if (contradictionCapacidad) {
      primaryOpportunity = {
        area: 'Revisión de capacidad instalada antes de ampliar captación',
        badge: 'Capacidad y Agenda',
        explanation: 'Reportaste una ocupación semanal elevada (' + getOptionText(Q, 'schedule_occupancy', a.schedule_occupancy) + '), pero señalaste como prioridad conseguir más clientes nuevos. Antes de aumentar la inversión en captación o saturar los canales de mensajes, conviene analizar cuánto margen real queda en tus ' + t.spaceWord + ' para no deteriorar los tiempos de atención ni sobrecargar al personal.',
        evidence: 'Ocupación declarada: ' + getOptionText(Q, 'schedule_occupancy', a.schedule_occupancy) + ' · Objetivo: Conseguir más clientes.',
        whyItMatters: 'Si la agenda ya está cerca de su límite, atraer más personas sin margen de atención genera citas aplazadas, esperas en sala y fugas en la experiencia del ' + t.clientWordSingular + '.'
      };
    } else if (severeDataDeficit && (noClearPriority || wantsMoreBookings || wantsMoreClients)) {
      primaryOpportunity = {
        area: 'Registro y medición de indicadores comerciales básicos',
        badge: 'Medición Inicial',
        explanation: 'Para tomar decisiones certeras sobre tu crecimiento, el primer paso prudente es contar con números propios. Actualmente no se lleva registro continuo de variables clave como el volumen de consultas, la tasa de agendamiento o la asistencia a citas.',
        evidence: 'Reportaste no conocer o no medir ' + unmeasuredIndicators.length + ' indicadores comerciales de la operación.',
        whyItMatters: 'Invertir en publicidad o cambiar procesos sin medir el punto de partida impide saber qué funcionó y dónde se concentran las dificultades reales.'
      };
    } else if (wantsPromoteService) {
      primaryOpportunity = {
        area: 'Promoción focalizada y medición de un servicio prioritario',
        badge: 'Foco en Tratamiento',
        explanation: 'Señalaste el objetivo de dar visibilidad y generar citas para un tratamiento específico. En lugar de campañas institucionales dispersas, conviene alinear mensajes claros sobre ese servicio, validar su capacidad disponible y medir cuántas consultas genera antes de masificarlo.',
        evidence: 'Objetivo declarado: Promocionar un tratamiento o servicio específico.',
        whyItMatters: 'Concentrar los esfuerzos de comunicación en un servicio concreto facilita medir su demanda real y evita saturar la agenda con tratamientos de menor interés o rentabilidad.'
      };
    } else if (wantsMoreBookings || (hasLowBooking && (hasHighInquiries || hasModInquiries))) {
      primaryOpportunity = {
        area: 'Conversión de consultas en citas agendadas',
        badge: 'Conversión en WhatsApp',
        explanation: 'Existe un flujo de personas interesadas preguntando por tus ' + t.serviceWord + ', pero una proporción moderada o reducida termina concretando fecha en agenda. Revisar el protocolo de respuesta comercial y el manejo de precios en WhatsApp representa la vía más directa para aprovechar la demanda existente sin gastar de más.',
        evidence: 'Consultas mensuales: ' + getOptionText(Q, 'monthly_inquiries', a.monthly_inquiries) + ' · Agendamiento declarado: ' + getOptionText(Q, 'inquiry_to_booking', a.inquiry_to_booking) + '.',
        whyItMatters: 'Cada consulta recibida representa tiempo e interés de una persona; mejorar la conversación comercial permite llenar espacios de agenda con los prospectos que ya están escribiendo.'
      };
    } else if (wantsProfit) {
      primaryOpportunity = {
        area: 'Control de costos directos y rentabilidad por tratamiento',
        badge: 'Rentabilidad y Costos',
        explanation: 'Tu prioridad es mejorar el rendimiento financiero. Para lograrlo de forma sostenible conviene calcular el margen de contribución real de cada ' + t.serviceWordSingular + ', sumando insumos directos, tiempo asistencial y costos fijos antes de ofrecer descuentos o alterar tarifas.',
        evidence: 'Información de costos: ' + getOptionText(Q, 'financial_visibility', a.financial_visibility) + ' · Objetivo: Mejorar rentabilidad.',
        whyItMatters: 'Aumentar el número de citas sin conocer el margen neto de cada procedimiento puede elevar la facturación pero disminuir el beneficio final del centro.'
      };
    } else if (hasLowAttendance) {
      primaryOpportunity = {
        area: 'Confirmación y asistencia a citas agendadas',
        badge: 'Asistencia y Agenda',
        explanation: 'El agendamiento funciona, pero la inasistencia o las cancelaciones imprevistas restan productividad a tus ' + t.spaceWord + '. Ajustar los recordatorios, formalizar la reserva y analizar los motivos recurrentes de ausencia protegerá el tiempo asistencial de tu equipo.',
        evidence: 'Asistencia declarada: ' + getOptionText(Q, 'booking_attendance', a.booking_attendance) + ' de cada 10 citas agendadas.',
        whyItMatters: 'Una cita vacía de última hora tiene un costo fijo irrecuperable y desaprovecha el tiempo del profesional asignado.'
      };
    } else if (wantsOccupancy || hasLowOccupancy) {
      primaryOpportunity = {
        area: 'Aprovechamiento de horarios y capacidad disponible',
        badge: 'Capacidad de Agenda',
        explanation: 'Identificas franjas horarias con poca actividad en tu semana. Enfocar acciones comerciales en los días de menor demanda (mediante convenios, ofertas puntuales o reasignación de turnos) elevará la rentabilidad fija del centro.',
        evidence: 'Ocupación semanal: ' + getOptionText(Q, 'schedule_occupancy', a.schedule_occupancy) + '.',
        whyItMatters: 'Los costos fijos de local y personal se pagan igual independientemente de cuántas horas de cabina se utilicen.'
      };
    } else if (wantsManagement) {
      primaryOpportunity = {
        area: 'Organización de base de datos, atención y seguimiento',
        badge: 'Gestión Comercial',
        explanation: 'Centralizar los contactos y estructurar un seguimiento ordenado a personas interesadas que no agendaron de inmediato permite reactivar citas sin costo adicional.',
        evidence: 'Sistema de registro: ' + getOptionText(Q, 'lead_record_system', a.lead_record_system) + '.',
        whyItMatters: 'El mayor activo comercial de un centro consolidado es su base de pacientes previos y prospectos; mantener el contacto regular nutre la agenda sin depender de publicidad fría.'
      };
    } else {
      primaryOpportunity = {
        area: 'Atracción de clientes nuevos y diversificación de canales',
        badge: 'Captación y Visibilidad',
        explanation: 'Con la operativa de atención y agenda funcionando, ampliar la visibilidad mediante canales estructurados permitirá generar un flujo predecible de nuevas valoraciones.',
        evidence: 'Objetivo declarado: Conseguir más clientes nuevos · Fuentes actuales: ' + (businessSummary.sourcesLabels.join(', ') || 'En consolidación') + '.',
        whyItMatters: 'Diversificar los canales de captación reduce la vulnerabilidad ante variaciones estacionales o pausas en el voz a voz tradicional.'
      };
    }

    // Nota positiva de recomendación si aplica
    let referralNote = null;
    if (usesReferrals && !activePaidAds) {
      referralNote = 'Recibir pacientes principalmente por recomendación demuestra que tu servicio tiene respaldo clínico y satisfacción comprobada. Tu base técnica es sólida; no necesitas depender forzosamente de anuncios si no buscas escalar de golpe.';
    }

    // 3 Prioridades Sugeridas
    const prioritiesPool = [];

    // Prioridad para promocionar servicio específico
    if (wantsPromoteService) {
      prioritiesPool.push({
        id: 'campana_servicio_especifico',
        title: 'Medir el interés y la capacidad para el tratamiento prioritario',
        explanation: 'Antes de lanzar una promoción masiva de ese servicio, revisa cuántas horas de ' + t.spaceWord + ' requiere y calcula su margen de contribución unitario.',
        concreteAction: 'Crea una ficha operativa para ese tratamiento (costo de insumos, tiempo de sesión y precio) y diseña una serie de 3 publicaciones educativas explicando a quién va dirigido.',
        relationToAnswers: 'Marcaste como prioridad promocionar un tratamiento específico.'
      });
    }

    // Prioridad para agendamiento / WhatsApp
    if (wantsMoreBookings || hasLowBooking) {
      prioritiesPool.push({
        id: 'protocolo_conversion_whatsapp',
        title: 'Revisar el guion de respuesta comercial en WhatsApp',
        explanation: 'Presenta el valor del ' + t.serviceWordSingular + ' antes del precio y guía la conversación hacia una fecha concreta con dos opciones de horario.',
        concreteAction: 'Audita 15 conversaciones recientes en WhatsApp para identificar en qué mensaje se enfrían los prospectos y ajusta las respuestas rápidas.',
        relationToAnswers: 'Bajo agendamiento relativo o meta explícita de convertir más consultas en citas.'
      });
    }

    // Prioridad para seguimiento
    if (['termina', 'algunas_veces', 'desconocido'].includes(a.lead_followup) || wantsManagement) {
      prioritiesPool.push({
        id: 'seguimiento_reactivacion',
        title: 'Implementar seguimiento a consultas no agendadas',
        explanation: 'Muchas personas no reservan en el primer contacto por motivos circunstanciales. Un contacto de seguimiento formal a las 24 y 48 horas recupera un porcentaje significativo de citas.',
        concreteAction: 'Establece como rutina diaria enviar un mensaje de seguimiento cordial a quienes solicitaron información el día anterior y no concretaron fecha.',
        relationToAnswers: 'El seguimiento actual es intermitente o ausente según lo reportado.'
      });
    }

    // Prioridad para asistencia
    if (hasLowAttendance) {
      prioritiesPool.push({
        id: 'politica_confirmacion_asistencia',
        title: 'Formalizar el protocolo de confirmación y anticipos',
        explanation: 'Enviar recordatorios 24 horas antes con confirmación explícita o solicitar un depósito de reserva para tratamientos de alta demanda reduce notablemente las ausencias.',
        concreteAction: 'Implementa confirmación interactiva por WhatsApp un día antes y analiza si los procedimientos más costosos requieren abono para reservar espacio.',
        relationToAnswers: 'Reportaste una tasa de asistencia moderada o baja en citas agendadas.'
      });
    }

    // Prioridad para costos y finanzas
    if (wantsProfit || a.financial_visibility === 'sin_informacion' || a.financial_visibility === 'ingresos_generales') {
      prioritiesPool.push({
        id: 'costeo_por_tratamiento',
        title: 'Calcular el costo real y margen por tratamiento',
        explanation: 'Conocer cuánto cuesta cada procedimiento en producto, descartables y tiempo del profesional permite saber qué servicios conviene promover activamente.',
        concreteAction: 'Calcula el margen neto de tus 3 tratamientos más vendidos utilizando una hoja de costeo directa.',
        relationToAnswers: 'Declaraste no tener organizados los costos unitarios o priorizar la rentabilidad del negocio.'
      });
    }

    // Prioridad para capacidad
    if (hasHighOccupancy || wantsOccupancy) {
      prioritiesPool.push({
        id: 'optimizacion_capacidad_instalada',
        title: 'Analizar la ocupación de ' + t.spaceWord + ' y horarios valle',
        explanation: 'Evaluar cuántas horas se aprovechan en días de baja demanda permite incentivar la agenda sin saturar las franjas pico.',
        concreteAction: 'Identifica tus dos días con menor afluencia y evalúa incentivos específicos o redistribución de turnos profesionales.',
        relationToAnswers: hasHighOccupancy ? 'Tu ocupación declarada es alta; conviene optimizar antes de ampliar captación.' : 'Buscas aprovechar mejor los horarios con poca actividad.'
      });
    }

    // Prioridad para captación / anuncios
    if (wantsMoreClients && !contradictionCapacidad) {
      prioritiesPool.push({
        id: 'captacion_canales_predecibles',
        title: 'Estructurar un canal de atracción predecible',
        explanation: 'Si la atención en WhatsApp y la capacidad tienen margen disponible, una campaña orientada a tu tratamiento insignia generará consultas consistentes.',
        concreteAction: 'Define un presupuesto de prueba para una campaña de mensajes en Meta orientada exclusivamente a tu tratamiento de mayor rentabilidad.',
        relationToAnswers: 'Objetivo de captar más clientes y capacidad disponible para atenderlos.'
      });
    }

    // Prioridad para presencia digital
    if (wantsPresence || (a.digital_channels.length < 2 && !a.digital_channels.includes('google_maps'))) {
      prioritiesPool.push({
        id: 'optimizacion_presencia_local',
        title: 'Consolidar la visibilidad en Google Maps y reputación local',
        explanation: 'Tener un perfil de Google activo con reseñas de pacientes satisfechos genera confianza inmediata en las personas que buscan centros en tu zona.',
        concreteAction: 'Pide a 5 pacientes fidelizados de esta semana que dejen una reseña en Google describiendo su experiencia.',
        relationToAnswers: 'Meta de mejorar presencia digital o ausencia de Google Maps activo.'
      });
    }

    // Prioridad para registro en Sheets
    if (usesSheets) {
      prioritiesPool.push({
        id: 'potenciar_hoja_calculo',
        title: 'Aprovechar tu hoja de cálculo para clasificar interesados',
        explanation: 'Tu uso de Excel o Sheets es adecuado. Para extraer mayor valor, basta con segmentar contactos por tratamiento consultado para futuras comunicaciones.',
        concreteAction: 'Crea una etiqueta o filtro por tipo de servicio para poder informar de disponibilidad a personas que mostraron interés previo.',
        relationToAnswers: 'Utilizas hojas de cálculo para gestión de contactos; una optimización sencilla multiplica su utilidad.'
      });
    }

    // Fallback asegurando 3 prioridades
    const priorities = prioritiesPool.slice(0, 3);
    while (priorities.length < 3) {
      priorities.push({
        id: 'auditoria_general_operativa',
        title: 'Medición sistemática de las etapas del embudo',
        explanation: 'Llevar registro mensual de consultas, citas agendadas y pacientes asistidos es la forma más certera de blindar el crecimiento del negocio.',
        concreteAction: 'Revisa semanalmente la relación entre consultas recibidas y citas completadas para detectar cambios a tiempo.',
        relationToAnswers: 'Recomendación base para sostener la toma de decisiones con datos propios.'
      });
    }

    // Herramientas sugeridas
    const relatedTools = [
      {
        title: 'Simulador de Capacidad Instalada',
        desc: 'Calcula el aprovechamiento real de tus ' + t.spaceWord + ' y proyecta la facturación máxima posible con tu infraestructura actual.',
        badge: 'Herramienta de Capacidad',
        url: '../capacidad-instalada/'
      },
      {
        title: 'Calculadora de Inversión y Presupuesto Publicitario',
        desc: 'Modela el retorno de inversión, costo por consulta y rentabilidad esperada antes de pautar en Meta o Google.',
        badge: 'Herramienta Financiera',
        url: '../calculadora-publicidad/'
      },
      {
        title: 'Estudio de Contenido para Estética',
        desc: 'Biblioteca de estructuras narrativas, ganchos y guiones para comunicar ' + t.serviceWord + ' sin promesas desmesuradas.',
        badge: 'Herramienta Editorial',
        url: '../estudio-contenido/'
      }
    ];

    // Payload WhatsApp
    const primaryTitle = primaryOpportunity.area;
    const waText = encodeURIComponent(
      `Hola Gloss Growth, completé el diagnóstico comercial en su web.\n` +
      `• Centro: ${businessSummary.businessTypeLabel}\n` +
      `• Ocupación semanal: ${businessSummary.occupancyLabel}\n` +
      `• Área prioritaria: ${primaryTitle}\n\n` +
      `Me gustaría coordinar una llamada para analizar estos resultados y ver cómo optimizar mi centro.`
    );

    return {
      stage: 'established',
      businessSummary,
      referralNote,
      primaryOpportunity,
      priorities,
      unmeasuredIndicators,
      relatedTools,
      whatsappPayload: {
        url: 'https://wa.me/573145904933?text=' + waText,
        text: waText
      }
    };
  }

  // ==========================================================================
  // 8. DISPATCHER PRINCIPAL
  // ==========================================================================
  function analyze(answers, explicitStage) {
    const stage = explicitStage || answers.business_stage || 'established';
    if (stage === 'planning') {
      return analyzePlanning(answers);
    }
    if (stage === 'starting') {
      return analyzeStarting(answers);
    }
    return analyzeEstablished(answers);
  }

  return {
    QUESTIONS_PLANNING,
    QUESTIONS_STARTING,
    QUESTIONS_ESTABLISHED,
    QUESTIONS: QUESTIONS_ESTABLISHED, // retrocompatibilidad
    getQuestions,
    getTerminology,
    analyzePlanning,
    analyzeStarting,
    analyzeEstablished,
    analyze
  };
});
