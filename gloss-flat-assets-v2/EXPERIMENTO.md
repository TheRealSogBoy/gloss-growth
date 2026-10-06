# Gloss Growth — variante experimental B

Entrega: 5 de octubre de 2026.

## Abrir y comparar

- [Comparación A/B, con selector de sección y tamaño](http://127.0.0.1:8765/gloss-flat-assets-v2/comparar.html)
- [A: Flat aprobado](http://127.0.0.1:8765/redesign-v2/)
- [B: Flat + nueva biblioteca gráfica](http://127.0.0.1:8765/gloss-flat-assets-v2/)

Ruta exacta de B:

`C:\Users\santi\OneDrive\Escritorio\GLOSS & GROWTH\Pagina Web Gloss Growth\gloss-flat-assets-v2`

El servidor local sirve la carpeta `Pagina Web Gloss Growth` en el puerto 8765. Para volver a iniciarlo desde esa carpeta: `python -m http.server 8765 --bind 127.0.0.1`. No se publicó en internet.

## Qué cambia

Es la misma página: contenido, orden de secciones, tipografía, paleta, CTAs, enlaces comerciales, formularios y navegación. B añade una capa gráfica selectiva: marco orgánico para la fotografía, curvas de crecimiento, subrayados y un apoyo editorial al sistema. Las etapas conservan su secuencia vertical, ahora con esquinas curvas alternas. Se conserva el tratamiento reconocible de WhatsApp.

A es más austera y geométrica. B tiene mayor presencia de curvas y gestos de marca, especialmente en el hero. El peso visual de la nueva biblioteca se concentra en pocos puntos y no se extiende a capturas, FAQ o formularios. Los ajustes de espacio responden al tamaño real de los gráficos; no se reorganizaron las secciones.

## Inspección previa

Se revisaron el manual completo de 25 páginas, el contexto de marca, el índice FLAT, las tres familias anteriores y todos los PNG disponibles en las dos carpetas nuevas: 12 Brand Shapes y 4 Editorial Graphics, de los cuales 3 estaban apartados en `_REVISION_NO_CORRESPONDEN`. También se recorrió la versión A completa en escritorio y móvil antes de crear B.

## Ocho assets nuevos utilizados

Los siete primeros proceden de `Diseño Gráfico/FLAT_SYSTEM/04_BRAND_SHAPES/`; Growth Path procede de `05_EDITORIAL_GRAPHICS/`.

| Asset fuente | Sección y función |
| --- | --- |
| `GG_SHAPE_FLAT_01_GROWTH_SWEEP.png` | Hero: acento lateral superior; oculto en móvil. |
| `GG_SHAPE_FLAT_02_GROWTH_CURVE.png` | Caso de éxito: crecimiento junto al encabezado, sin simular una gráfica de datos. |
| `GG_SHAPE_FLAT_03_UNDERLINE_LONG.png` | Hero: énfasis en «de mayor valor.»; segundo uso pequeño bajo la conclusión de oportunidad. |
| `GG_SHAPE_FLAT_04_UNDERLINE_SHORT.png` | Problema: énfasis rosa bajo la conclusión. |
| `GG_SHAPE_FLAT_05_SOFT_WAVE.png` | CTA final: cierre curvo en lugar de la franja de patrón anterior. |
| `GG_SHAPE_FLAT_11_EDITORIAL_ARROW.png` | Cómo trabajamos: dirección desde el encabezado hacia los pasos; oculta en tablet y móvil. |
| `GG_SHAPE_FLAT_12_PHOTO_MASK_ORGANIC.png` | Hero: marco orgánico alrededor de la foto existente, con máscara interior derivada para el recorte. |
| `GG_EDITORIAL_FLAT_01_GROWTH_PATH.png` | Sistema GLOSS: recorrido visual de hitos junto a su introducción, conservando las ocho etapas HTML y siete flechas. |

Las copias web están en `brand/experiment/`. Se conservaron colores y proporciones, se recortaron márgenes transparentes y se redujeron dimensiones; las copias se guardaron como WebP sin pérdida adicional de compresión. Los ocho gráficos suman **507 KiB**, más una pequeña máscara auxiliar del marco. Los PNG fuente permanecen intactos. `manifest.json` documenta origen, dimensiones y recorte.

Los gráficos decorativos tienen alt vacío y no interceptan clics ni foco. Se mantiene toda la explicación en HTML. No se añadió animación ni biblioteca de movimiento.

## Assets no utilizados y motivos

- `GG_SHAPE_FLAT_09_OVAL_FRAME.png`: duplicaba la función del marco orgánico; añadirlo a cifras o pruebas sociales recargaba la composición.
- `GG_SHAPE_FLAT_10_STARBURST.png`: mayor impacto de sello promocional que el requerido; competía con la tipografía y el símbolo oficial.
- `Cinta ondulante burdeos en capas-4.png`, `Elegante Cinta Ondulante Multicolor-3.png` y `Ondas Rubí en Swoosh Rosado-2.png`: variaciones de cinta redundantes frente al sweep y la onda seleccionados.
- Las tres propuestas de `05_EDITORIAL_GRAPHICS/_REVISION_NO_CORRESPONDEN/` —Cinta de crecimiento ascendente con hitos-3, Curva de crecimiento con nodos y destello-4, Trayectoria Ascendente con Destellos-2—: se respetó su clasificación de revisión y se eligió el Growth Path principal.
- `02_UI_DATA`: revisada visualmente. Las barras, anillos, líneas y progresos son ilustrativos y podrían confundirse con resultados medidos. Los marcos de tarjetas introducían cajas adicionales sin mejorar los datos reales; no se incorporaron.
- `03_SOCIAL_ADS`: no se añadieron sus marcos o botones rasterizados; se mantuvieron los controles HTML y las pruebas reales.
- Iconografía adicional: se conserva la selección de A, incluido Meta Flat; no se sustituyeron todos los iconos por una colección nueva.
- Assets 3D, glossy y fondos satinados: fuera de esta dirección.

El listado real no contiene los supuestos archivos 06–08 de Brand Shapes ni una colección completa de journeys/canales. No se inventaron ni se importaron recursos inexistentes.

## Archivos principales

- `index.html`: seis imágenes decorativas nuevas, carga de `experiment.css` y rutas locales adaptadas. Copy y controles conservados.
- `experiment.css`: toda la capa visual experimental y sus reglas responsive.
- `brand/experiment/*.webp` y `manifest.json`: recursos seleccionados y trazabilidad.
- `comparar.html`: herramienta independiente de comparación; no añade contenido a la landing.
- Páginas legales y carrusel: copiados; solo se adaptaron las rutas necesarias para resolver recursos dentro de B.
- `assets/`, `fonts/`, `brand/`, `vendor/`: copias locales para que B no dependa de la carpeta A. La comparación sí referencia A de forma intencional.
- `README.md`, `EXPERIMENTO.md`, `DESIGN.md` y `VALIDATION.json`: documentación de esta variante.

`editorial.css` y `editorial.js` conservan las reglas y el comportamiento de la versión aprobada; el diseño nuevo se añade por separado.

## Validación

- **66 archivos preexistentes protegidos por SHA-256: ninguno modificado.** Incluye la web original y la variante A.
- Las seis páginas HTML originales comparadas: mismos textos normalizados y mismos controles, enlaces y acciones.
- Auditoría de rutas HTML/CSS y anclas: sin referencias inexistentes; los recursos de B están dentro de B.
- Chromium a 320, 390, 768 y 1440 px: sin overflow horizontal ni errores JavaScript; fuentes cargadas y títulos Zodiak.
- Revisión visual completa de escritorio y móvil; revisión adicional de hero, sistema y cierre en tablet.
- Calculadora: 500.000 × 20 = $10.000.000/mes y $120.000.000/año.
- 15 FAQ verificadas; formulario con cinco campos requeridos, foco, Escape y destino WhatsApp original. La apertura externa se interceptó: no se envió ningún mensaje.
- Nueve capturas: apertura, zoom, cierre y retorno del foco verificados en escritorio y móvil.
- Las cuatro rutas legales (.html y directorio), índice móvil y vuelta al inicio comprobados. Carrusel: seis diapositivas y recursos cargados.
- JavaScript propio verificado con `node --check`. No existe una etapa build/lint de framework aplicable a esta web estática.

## Problemas encontrados y límites

- El servidor de la sesión anterior ya no estaba activo; se reinició la previsualización local.
- El índice FLAT aún no enumera las carpetas nuevas. La selección se basó en la inspección de los PNG existentes, no solo en el índice.
- Facebook puede cargar más lento que las capturas de revisión: ambos comentarios se verificaron después de cargar. Se conservan los embeds y sus URLs, sin sustituirlos por enlaces.
- La comprobación inicial de imágenes señaló un `src` vacío: corresponde al visor cerrado, cuya imagen se asigna al abrir una captura; no es un asset roto. La revisión de imágenes con fuente asignada y la prueba de las nueve capturas confirman su carga.
- Validación en Chromium; no se probó Safari/iOS físico. El carrusel conserva sus dependencias externas y no se probó su exportación PNG/ZIP.
- No se verificó la exactitud comercial de cifras o testimonios: se preservaron sin cambios.

## Evidencias

[Comparación](revision/comparacion.png) · [Inicio escritorio B](revision/inicio-B-1440.png) · [Inicio móvil B](revision/inicio-B-390.png)

[Preservación](revision/preservacion.json) · [Navegador](revision/navegador.json) · [Navegación](revision/navegacion.json) · [Visor y embeds](revision/evidencias.json) · [Comparador](revision/comparacion-qa.json)
