# Auditoría técnica previa a V2 — Gloss Growth

Fecha: 5 de octubre de 2026. Versión elegida: **opción 2 nueva, `gloss-flat-assets-v2`**. Trabajo local, sin publicación remota.

## 1. Qué ya existía

Sitio estático HTML/CSS/JavaScript; favicon de marca; fuentes locales Zodiak y Plus Jakarta Sans; metadata, canonical, OG y Twitter; schema LocalBusiness; privacidad y términos; formulario de cinco preguntas que prepara un mensaje en WhatsApp; 15 FAQs; nueve capturas ampliables y dos comentarios de Facebook embebidos.

No existían sitemap, robots, 404 personalizada ni proceso de build independiente para esta variante. No había lint configurado ni TypeScript. No se detectaron GA, GTM, Meta Pixel, Google Ads o etiqueta de Search Console. La ausencia de etiqueta no descarta una verificación por DNS.

## 2. Qué se corrigió

- Title: **Gloss Growth | Marketing para Medicina Estética**.
- Description: “Marketing para médicos y centros estéticos: captación de pacientes con Meta Ads, Google y contenido, integrados en una estrategia de crecimiento.”
- OG title, description, site_name, tipo website y URL de la home; Twitter coherente. Canonical raíz conservado: `https://glossgrowth.com/`.
- Canonical y og:url legales normalizados con barra final. Textos legales conservados y comparados con el respaldo.
- Retiradas imágenes sociales ajenas a Gloss Growth. Twitter usa summary; falta una imagen OG aprobada. No se diseñó ninguna nueva.
- Schema Organization con logo local correcto; retirado sameAs discrepante: el schema decía glossgrowthhq y el footer glossgrowth. El enlace visible se conserva hasta confirmar la cuenta.
- Formulario con errores junto a cada campo, aria-describedby/aria-invalid, foco al error, estados accesibles, botón ocupado, prevención temporal de doble envío y enlace alternativo cuando el navegador bloquea WhatsApp.
- El estado final indica que el mensaje está listo para revisar y enviar en WhatsApp; no afirma que haya sido enviado. Número, mensaje y preguntas originales conservados. No hay campos de email/teléfono ni endpoint propio.
- Trampa de foco del modal excluye controles ocultos y deshabilitados; Escape y retorno del foco al CTA comprobados.
- Dimensiones intrínsecas en imágenes raster y retirada de height="auto" inválido. Dos retratos convertidos a WebP sin pérdida, con igualdad de píxeles comprobada: ahorro total de **1.002.817 bytes**. Originales conservados fuera del paquete público.
- Lucide diferido; retiradas conexiones a Google Fonts sin uso y comentarios de imports abandonados.

## 3. Qué se añadió

- 404 responsive de marca con regreso al inicio y estado HTTP 404 real.
- Sitemap con tres URLs públicas: inicio, privacidad y términos.
- Robots de producción y modo preview protegido contra indexación.
- Servidor Node independiente, sin dependencias nuevas: GET/HEAD, redirecciones canónicas, MIME, cabeceras básicas y restricción al paquete público.
- Build reproducible que verifica referencias locales y genera `dist/`: **49 archivos**, incluidas licencias. Excluye comparador, documentación, capturas de revisión y assets no referenciados.
- Comprobación de sintaxis JavaScript, enlace para saltar al contenido y campo trampa antispam. Esta protección es solo del cliente; no existe backend de recepción.
- `VERSION_SELECCIONADA.md` en la carpeta madre y respaldo íntegro anterior a la auditoría en `Historial versiones/opcion-2-aprobada-antes-auditoria-2026-10-05.zip`.

## 4. Qué se eliminó

Calculadora completa: sección, controles, resultados, CTA propio, lógica, listeners y estilos exclusivos, incluidos selectores compartidos. No tenía assets exclusivos que retirar. No quedan referencias en HTML/CSS/JS de ejecución ni en el paquete público. No se añadió una sección sustituta.

Las menciones en documentos históricos y el ZIP previo son registros de versiones. El sitio original y `redesign-v2` permanecen intactos, comprobado mediante hashes.

## 5. Qué se verificó

- Build y comprobación de sintaxis correctos. Lint no configurado; TypeScript no aplica.
- Chrome a 1440, 768, 390 y 320 px: sin desbordamiento horizontal, imágenes rotas, anclas inexistentes ni excepciones JavaScript; un H1 en home. Ninguna imagen sin ALT ni botón vacío sin etiqueta accesible.
- 15 FAQs y nueve visores probados en cada tamaño; zoom y Escape funcionan.
- Formulario: cinco campos vacíos, entrada válida, destino original, ocupado, doble envío bloqueado y alternativa cuando falla la apertura. Foco inicial, trampa de foco, retorno al CTA y campo antispam comprobados. Se simuló la apertura: **no se enviaron mensajes reales**.
- Privacidad y términos accesibles en móvil; texto legal y texto de todas las secciones comerciales conservados, excepto la calculadora retirada. Orden restante conservado.
- Home, legales, robots y sitemap responden 200. Ruta desconocida anidada y 404.html responden 404. Comparador, server.js y revisión no se sirven en el nuevo servidor. Recursos del paquete público comprobados.
- Preview: noindex y robots restrictivo. Producción: páginas públicas sin noindex; recursos no HTML y errores con noindex. No se bloquean assets necesarios para renderizar.
- No hay URLs HTTP inseguras en los recursos del HTML. HTTPS público no verificado: no hubo despliegue.
- Los dos embeds de Facebook y sus recursos cargaron sin fallos en la sesión auditada; sus URLs permanecen intactas. No aparecieron cookies en ese contexto limpio. Esto no demuestra ausencia de seguimiento o cookies para otros usuarios.
- Inspección visual de home, formulario móvil y 404. No se realizó certificación WCAG ni medición de Core Web Vitals en tráfico real.

## 6. Pendientes clasificados

### CRÍTICO para publicar

No quedan errores bloqueantes detectados en el build local. Falta configurar hosting, dominio y HTTPS, así como las reglas reales de redirección/404. El servidor incluido debe ejecutarse con NODE_ENV=production para permitir indexación pública. Un hosting estático requiere trasladar esas reglas; copiar dist no configura por sí mismo el proveedor.

### IMPORTANTE

- Falta una imagen social aprobada de Gloss Growth. og:image/twitter:image quedan ausentes para no difundir otra marca. Añadirla después de aprobarla, con URL HTTPS pública.
- Facebook realiza solicitudes a terceros al cargar. No existe consentimiento. Revisar requisitos según público/jurisdicción y decidir si los embeds deben esperar consentimiento. No se añadió un banner indiscriminado ni se cambiaron las reseñas por enlaces.
- Confirmar el dominio preexistente glossgrowth.com antes de publicar.
- Confirmar la cuenta oficial de Instagram por la discrepancia entre schema anterior y footer. No se certificó la disponibilidad/titularidad del perfil.

### RECOMENDADO

- Los retratos aún pesan aproximadamente 1,2 MB. Evaluar tamaños responsive posteriormente; las capturas de resultados mantienen su resolución para lectura y zoom.
- Jakarta sigue en TTF local con font-display:swap. Evaluar WOFF2 y métricas de fallback. No se afirma CLS cero: medir Lighthouse y datos reales tras desplegar.
- Probar WhatsApp en teléfonos reales con la aplicación instalada. No se verificó entrega de mensajes.

### OPCIONAL

Configurar analítica/objetivos después de decidir herramientas y consentimiento. Vincular Search Console, enviar sitemap y monitorizar indexación tras publicación. No se inventaron IDs.

## 7. Decisiones estratégicas reservadas

Hero, propuesta de valor, copy, servicios, casos, testimonios, FAQs, preguntas comerciales, CTA, orden y arquitectura de conversión quedan para la siguiente fase. También requieren decisión una imagen OG, cuenta social definitiva y plan de medición. No se redactaron textos legales nuevos.

## 8. Configuración externa/manual

Dominio/DNS, HTTPS y hosting; redirecciones/404; modo producción; imagen social; consentimiento; cuenta Instagram; Search Console y analítica. Los archivos están en la carpeta local de OneDrive; su sincronización remota no se ha verificado. No hubo publicación.

## 9. URLs/rutas

Preview técnico local: http://127.0.0.1:8766/.

Nuevas: `/404.html`, `/robots.txt`, `/sitemap.xml`. Públicas: `/`, `/politica-de-privacidad/`, `/terminos-del-servicio/`. Rutas .html e index.html redirigen a las canónicas en el servidor incluido. Cualquier ruta desconocida muestra la 404 con estado 404.

El puerto histórico 8765 es el explorador de carpetas/versiones y no representa las reglas de publicación.

## 10. Archivos principales

- index.html, editorial.css, editorial.js: SEO, accesibilidad y retirada de calculadora.
- form.js: WhatsApp con estados y validación reforzados.
- Páginas legales en directorio y aliases .html: metadata, sin cambios de texto legal.
- assets/testimonios/*-perfil.webp: conversiones sin pérdida.
- 404.html, robots.txt, sitemap.xml, server.js, build.mjs, package.json, BUILD_MANIFEST.json y dist/.
- README.md, este informe y VERSION_SELECCIONADA.md en la carpeta madre.
- Evidencias: qa.json, extra.json, preservation.json y capturas adjuntas; no se publican.

## Referencias técnicas

[Google: robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/intro): controlar rastreo no sustituye noindex. [Google: sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap): URLs públicas canónicas. [Google: códigos HTTP](https://developers.google.com/crawling/docs/troubleshooting/http-status-codes): 404 real para páginas inexistentes.
