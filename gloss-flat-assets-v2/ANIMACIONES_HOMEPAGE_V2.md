# Movimiento editorial — Homepage V2

## Implementación

Capa de mejora progresiva sobre la homepage aprobada. No cambia copy, cifras, orden de secciones, enlaces, destinos de CTA, fuentes, paleta ni assets. Se verificó la igualdad del texto y de los enlaces contra el respaldo previo.

- **Hero:** secuencia de eyebrow, H1 como bloque editorial, subcopy, CTA y subrayado. Entrada de 12–24 px con opacidad parcial; sin separar palabras ni ocultar el título a la espera de JavaScript.
- **Problema:** título y dolores con entradas progresivas y desfase breve cuando coinciden en pantalla.
- **Sistema GLOSS:** cuatro etapas activadas al entrar en viewport; nodos con escala leve y flechas que se revelan de izquierda a derecha o de arriba abajo según el layout.
- **Resultados:** entradas de 8 px; cifras finales inalteradas. Zen presenta antes, trabajo y resultados en secuencia. Capturas y reseñas mantienen sus funciones.
- **Servicios:** desplazamientos alternos de 14 px, reducidos a 7 px en móvil; iconos con hover de 3 px.
- **Por qué Gloss:** entrada del título y de los cuatro diferenciadores.
- **Proceso:** pasos en secuencia con énfasis breve en su numeración, distinto del recorrido de nodos.
- **Filtro:** columnas con entradas desde lados opuestos, de distancia corta.
- **FAQ:** apertura/cierre de 300 ms con altura, opacidad y desplazamiento mínimo; conserva aria-expanded, hidden y admite clics rápidos sin dejar estados intermedios.
- **Cierre:** título, subcopy y botón en secuencia; onda existente con una sola entrada.
- **Navegación:** cabecera con compactación visual y sombra leve al bajar, conservando su altura para evitar CLS. Menú móvil con apertura de 280 ms y cierre de 220 ms, controles cerrados fuera del foco.
- **Microinteracciones:** desplazamiento de flecha, escala máxima de botón de 1,01, subrayado progresivo en enlaces y sombra mínima en controles de capturas.

## Decisiones técnicas

CSS, Web Animations API e IntersectionObserver nativos. Sin dependencias nuevas. Un solo observador de entradas, desconectado al abandonar la página, y scroll pasivo limitado por requestAnimationFrame para el estado de la cabecera. Las animaciones terminadas se cancelan y liberan; no hay bucles permanentes.

Entradas de 650 ms en escritorio y 450 ms en móvil, curva cubic-bezier(.22,1,.36,1). Desfases breves; móvil limita la demora a 100 ms y reduce las distancias a la mitad. La altura solo se anima donde resulta necesaria: el accordion.

La página no tiene un estado CSS global que oculte el contenido. Sin JavaScript el recorrido GLOSS sigue completo y visible. Si se activa prefers-reduced-motion, las entradas no se ejecutan; las que estén activas se cancelan, y FAQ/menú resuelven su estado directamente. También se contempla el cambio de esa preferencia durante la sesión.

Los dos archivos nuevos de movimiento suman unos 7 KB sin comprimir. No se añadió GSAP porque no formaba parte del proyecto.

## Decisiones de UX

No se implementaron parallax, scroll artificial, fijación de secciones, cursores personalizados, loops de formas, glow, rebotes, loaders ni contadores. Las cifras reales permanecen quietas y legibles. La cabecera no cambia su altura física: se compactan ligeramente sus elementos para evitar desplazamientos del documento.

## Archivos y rollback

- Nuevos: motion.js y motion.css.
- Ajustados: editorial.js para FAQ; navigation.js para menú; index.html para cargar la capa; package.json para incluir la nueva sintaxis en check.
- Respaldo: `Historial versiones/homepage-v2-antes-motion.zip`.
- Preview: http://127.0.0.1:8766/?revision=motion-v2.

El informe automatizado qa.json registra resultados en escritorio, tablet y móvil, preferencias de movimiento, consola, CTAs, clics rápidos y CLS local. No representa una medición de campo ni garantiza rendimiento en todos los dispositivos. No hubo publicación remota.

## Resultados de validación

- Build correcto: 47 archivos públicos. Comprobación de sintaxis correcta. Se consultó el script de lint; el proyecto sigue sin tener uno configurado.
- Ocho combinaciones verificadas: 1440, 768, 390 y 320 px, con movimiento normal y reducido. Sin errores JavaScript ni desbordamientos. Cinco CTAs accesibles y ocho FAQs operativas, incluidos clics rápidos.
- El cambio dinámico a movimiento reducido detiene las animaciones. El sistema sigue visible sin JavaScript.
- CLS durante el recorrido, después de cargar fuentes: **0 en las ocho combinaciones**. La cabecera mantiene su altura.
- La carga inicial sigue presentando CLS variable: también se reproduce sin cargar la capa de movimiento. Una comparación aislada registró 0,171 sin la capa y 0,240 con ella; no permite afirmar CLS inicial cero ni atribuir toda la diferencia a una causa concreta. Las posiciones y alturas finales de todas las secciones fueron idénticas. Se conserva esta limitación, relacionada con la fase de carga y sustitución de fuentes, para una futura optimización específica; no se oculta la página esperando a que cargue.
- `cls-comparison.json` conserva el detalle de las fuentes de desplazamiento y la comparación de geometría.
