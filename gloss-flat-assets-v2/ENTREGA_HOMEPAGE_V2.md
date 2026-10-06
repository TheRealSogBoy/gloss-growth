# Homepage V2 — Gloss Growth

Implementada el 6 de octubre de 2026 sobre la opción 2 elegida: `gloss-flat-assets-v2`. Conserva el lenguaje FLAT, las fuentes Zodiak/Plus Jakarta Sans, la paleta oficial y los logos originales. No está publicada en el dominio público.

## Preview y comparación

- Nueva homepage: http://127.0.0.1:8766/
- Versión anterior congelada: http://127.0.0.1:8765/Historial%20versiones/flat-aprobada-2026-10-06/
- Respaldo completo: `Pagina Web Gloss Growth/Historial versiones/flat-aprobada-antes-homepage-v2-2026-10-06.zip`.

La nueva home permanece en la carpeta seleccionada. El ZIP contiene el estado anterior completo; la carpeta de comparación contiene su paquete público. No se borraron assets originales.

## Cambios implementados

Diez secciones y footer, en el orden solicitado: hero, problema, recorrido GLOSS, resultados, servicios, diferenciadores, proceso, filtro de cliente, FAQ y cierre. Copy aprobado aplicado en hero y bloques indicados. Cuatro etapas del paciente y tres pasos de trabajo. Cuatro áreas de servicio, sin catálogo de productos con nombres internos. Ocho FAQs breves.

Un objetivo principal: **Solicitar diagnóstico**. Los cinco CTAs de navegación/hero/resultados/filtro/cierre abren el formulario existente. Se conservaron sus preguntas, validación, manejo de foco, antispam básico y bloqueo de doble envío. El texto preparado ahora solicita el diagnóstico; sigue abriendo el número de WhatsApp original. El usuario revisa y envía el mensaje dentro de WhatsApp: la web no simula haberlo enviado.

Dominio canónico, OG, schema, sitemap y referencias legales actualizados a `https://glossgrowthhq.com`. Instagram oficial `@glossgrowthhq`, email y WhatsApp en footer. Rutas legales y 404 conservadas. No existía analítica configurada; no se inventaron IDs ni se agregaron trackers.

## Secciones y elementos retirados de la home

- Fotografía stock y marco orgánico del hero.
- Mensajes/notificaciones ficticios de WhatsApp y bloque de métricas del hero.
- Estadísticas generales de mercado y sección de oportunidad antigua.
- Explicaciones repetidas y nomenclaturas comerciales internas.
- Recorrido GLOSS de ocho etapas y proceso antiguo de cinco pasos, sustituidos por cuatro y tres, respectivamente.
- Casos/testimonios duplicados en dos secciones; ahora forman una sola sección de prueba.
- Quince FAQs antiguas, sustituidas por ocho objeciones concretas.
- CTAs con objetivos/copy distintos, frases de ranking universal, “Google Maps & IA”, estrellas generales y facturación x6 sin prueba suficiente en los archivos revisados.
- La calculadora sigue ausente; no se reintrodujo.

## Componentes e infraestructura reutilizados

- Logos SVG, tipografías locales y licencias.
- Subrayado FLAT, trayectoria de crecimiento y onda del cierre ya aprobados.
- Formulario/modal de WhatsApp, validación y gestión de foco.
- Comportamiento de FAQ, visor nativo de capturas, zoom, Escape y retorno de foco.
- Dos reseñas originales de Facebook incrustadas. Zen visible en su caso; Monica desplegable dentro de su caso compacto, con embed real.
- Build, servidor Node, 404, robots, sitemap y páginas legales existentes. Sin cambio de stack ni nuevas dependencias.

Se creó `homepage.css` para la nueva composición y `navigation.js` para el menú responsive. `editorial.css` conserva los estilos de las páginas legales e históricas. Los assets antiguos que la home ya no utiliza siguen en la fuente, pero no se incluyen por esa razón en su paquete público.

## Assets de Testimonios utilizados

| Caso | Recursos utilizados | Presentación |
|---|---|---|
| Zen Spa | Logo, foto del local, reporte de resultados, captura Meta, captura de ranking Google; embed existente | Caso principal: antes → trabajo → cifras → evidencia → reseña |
| Monica Skin Care | Foto de perfil, captura Meta; embed existente | Coral Gables, Florida, USA; 2.702 conversaciones |
| Dra. Lina Cruz | Captura Resultados Meta.png y foto lina cruz.jpg | Resultado inicial, no caso consolidado |
| Dra. Laura Erazo | Foto de perfil, reporte de resultados y captura Meta | 69 pacientes registrados; cifras visibles en el reporte |
| Dr. Carlos Mario Rojas | Foto de perfil y conversación WhatsApp | Experiencia reportada de descubrimiento en Google; sin métricas inventadas de citas |
| Rejuvenecer | Logo y capture 1.png | Proyecto web realizado; campañas en proceso, sin prometer resultados |
| Sierva María | Logo y capture 1.png | Proyecto web realizado; no se duplica bajo “Steven” |

Las capturas se muestran sin recortar y permiten ampliar. Se conservaron las copias web existentes y se copiaron seis archivos adicionales desde Testimonios. No se generaron dashboards, capturas o testimonios ficticios.

## Cifras y decisiones pendientes

- **Monica:** los dos dashboards muestran 26/34 pacientes y $36.413.000/$47.617.000 COP. No se eligió arbitrariamente uno. Se muestran las 2.702 conversaciones que coinciden con la captura Meta; confirmar período/versión antes de añadir pacientes o ingresos.
- **Zen:** se usan 633 conversaciones, 16 pacientes registrados, $10.400.000 COP de ingresos reportados y $775.347 COP de inversión. La posición 1 se limita a la búsqueda/zona de la captura, no al presente ni a todas las búsquedas. No se extrapolan resultados a otros centros.
- **Lina:** captura revisada: 318 conversaciones, $427 COP por conversación, $135.908 COP invertidos, 20.885 impresiones y 13.579 personas alcanzadas. “Primeros días” procede del encargo del usuario; el selector de Meta muestra un rango máximo, no acredita por sí solo la duración de la campaña. La agenda casi ocupada se identifica como reporte operativo, no como prueba visual de citas.
- **Laura:** números transcritos del reporte y captura disponibles. Los períodos exactos de los reportes históricos deben confirmarse antes de añadir fechas o comparaciones temporales.
- **Publicación:** continúan pendientes hosting/HTTPS y la revisión de consentimiento para los embeds de Facebook. No se añadió banner sin definición ni se publicó remotamente.
- Sigue pendiente una imagen OG de marca aprobada; no se creó una nueva bajo esta tarea.

## Validación

- `npm run check`: sintaxis correcta, incluida la nueva navegación.
- `npm run build`: correcto, 45 archivos públicos con sus licencias.
- No existe lint configurado ni código TypeScript: no se instalaron herramientas ajenas al stack para aparentar esas comprobaciones.
- Chrome a 1440, 768, 390 y 320 px: sin desbordamientos horizontales, imágenes faltantes, anclas rotas ni excepciones JavaScript; un H1 y ocho FAQs.
- Menú móvil, todos los CTAs, validación, preparación de mensaje y prevención de doble envío comprobados. Apertura de WhatsApp simulada para no enviar mensajes reales.
- Diez capturas ampliables probadas en cada tamaño, incluidas las pruebas desplegables. Zoom y Escape funcionan.
- Home, legales, 404, robots y sitemap comprobados. Datos oficiales presentes y copy antiguo retirado de la home.
- Las reseñas dependen de Facebook; se verificó que la de Zen carga su contenido real. No se garantiza disponibilidad futura del tercero.
- La composición inicial mide aproximadamente 13.177 px en desktop frente a 16.614 px anteriores, y 17.824 px en móvil de 390 frente a 20.715 px anteriores: cerca de 21% y 14% menos recorrido, sin reducir la lectura a texto diminuto. Son mediciones locales con FAQs cerradas, no una métrica de rendimiento.

Capturas desktop/móvil y resultados automatizados acompañan este informe. La revisión es funcional y visual local, no una certificación WCAG o de Core Web Vitals. Los retratos originales siguen siendo pesados; una futura optimización responsive puede reducir su descarga sin tocar las pruebas de resultados.
