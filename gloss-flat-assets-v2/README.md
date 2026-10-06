# Gloss Growth — opción 2 seleccionada

La base elegida es gloss-flat-assets-v2. Diseño y contenido comercial preservados; calculadora retirada por solicitud del usuario.

## Uso local

Requiere Node.js. No requiere instalar paquetes.

```powershell
npm run check
npm run build
npm start
```

Abrir http://127.0.0.1:8766/. El modo por defecto es preview: noindex y robots restrictivo.

## Publicación futura

Publicar únicamente dist, no toda la carpeta de trabajo. Para usar server.js, mantener dist a su lado y configurar estas variables en el proveedor:

- NODE_ENV=production
- HOST=0.0.0.0
- PORT según el proveedor

Ejecutar npm start detrás de un proxy HTTPS con dominio y supervisión del proceso. En hosting estático configurar redirecciones de .html a rutas con barra final y servir 404.html con estado 404; no usar fallback de SPA al inicio. Copiar dist no configura estas reglas automáticamente.

Canonical y sitemap mantienen https://glossgrowthhq.com, pendiente de confirmar antes de publicar. No retirar noindex de previews. El puerto 8765 es el explorador histórico, sin las nuevas reglas de publicación.

TECHNICAL_AUDIT_PRE_V2.md es el informe vigente. DESIGN.md, EXPERIMENTO.md, VALIDATION.json y revision/ documentan la propuesta anterior a esta limpieza; no forman parte de dist. La copia anterior íntegra está en Historial versiones, en la carpeta madre.

## Homepage V2 — 6 de octubre de 2026

La home fue reestructurada siguiendo el nuevo encargo. El informe vigente de esta fase es ENTREGA_HOMEPAGE_V2.md. TECHNICAL_AUDIT_PRE_V2.md conserva la auditoría anterior como historial; dominio y cuenta Instagram ya quedaron resueltos con los datos oficiales del nuevo encargo. homepage.css y navigation.js contienen el nuevo diseño y navegación.
