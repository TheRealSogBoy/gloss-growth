# Gloss Growth — Rama de Código Fuente (source/v2)

Esta rama (`source/v2`) contiene el código fuente reproducible, scripts y assets de entrada utilizados para generar la **Versión 2 (V2)** del sitio web oficial de Gloss Growth ([glossgrowthhq.com](https://glossgrowthhq.com)).

---

## Estructura y Función de Ramas

> **IMPORTANTE — Despliegue en Producción:**
> - `main`: Es la rama activa conectada al hosting de producción (**Hostinger**). Contiene el build estático generado directamente en la raíz para ser servido por el servidor web. No debe mezclarse con `source/v2` sin compilar.
> - `source/v2`: Es la rama canónica de desarrollo y código fuente. Contiene los módulos editables, scripts de comprobación sintáctica (`check`) y construcción estática (`build`).
> - `backup/pre-v2-home` / `tag: pre-v2-home-2026-10-06`: Respaldo completo de la versión previa histórica desplegada antes de la V2.

---

## Requisitos de Entorno

- **Node.js**: v18.0.0 o superior (no requiere librerías externas ni dependencias `node_modules`).

---

## Scripts Disponibles

Los scripts pueden ejecutarse directamente desde la raíz del proyecto o desde el directorio `gloss-flat-assets-v2/`:

```bash
# 1. Comprobación de sintaxis estricta en scripts JS
npm run check

# 2. Generación del build estático de producción
npm run build

# 3. Servidor de previsualización local (puerto 8766)
npm start
```

---

## Proceso de Build

Al ejecutar `npm run build`:
1. El script `build.mjs` lee las semillas de entrada (`index.html`, `404.html`, `politica-de-privacidad/index.html`, `terminos-del-servicio/index.html`, `robots.txt`, `sitemap.xml`, fuentes y licencias).
2. Resuelve de forma recursiva todos los recursos referenciados (`CSS`, `JS`, imágenes, iconos SVG, tipografías).
3. Exporta la estructura estática optimizada en `gloss-flat-assets-v2/dist/`.
4. Genera el manifiesto de archivos compilados `BUILD_MANIFEST.json`.

---

## Estructura del Código Fuente

- `gloss-flat-assets-v2/`: Directorio principal del código fuente V2.
  - `index.html`: Maquetación principal de la landing V2.
  - `editorial.css` / `homepage.css` / `motion.css`: Hojas de estilo modulares de diseño y animación.
  - `editorial.js` / `motion.js` / `navigation.js` / `form.js`: Lógica del cliente, animaciones y formulario.
  - `assets/`: Assets de testimonios, casos de estudio y logos.
  - `brand/`: Identidad visual FLAT institucional (logos, patrones, SVG).
  - `fonts/`: Tipografías Plus Jakarta Sans y Zodiak (WOFF2/TTF) con sus respectivas licencias.
  - `vendor/`: Dependencias locales de terceros (Lucide icons).
  - `build.mjs`: Script autónomo de compilación estática.
  - `server.js`: Servidor HTTP minimalista nativo de Node.js para preview local.
  - `ENTREGA_HOMEPAGE_V2.md`: Documento de entrega y especificaciones de la V2.
  - `ANIMACIONES_HOMEPAGE_V2.md`: Documentación de interacciones y animaciones.
