/**
 * GLOSS & GROWTH — MOTOR DE EXPORTACIÓN VISUAL (CANVAS 2D)
 * Generación de piezas gráficas PNG para Instagram en alta resolución:
 * - Carruseles: 1080 × 1350 px (4:5)
 * - Historias:  1080 × 1920 px (9:16)
 * 
 * 100% nativo client-side, sin servicios externos ni APIs de pago.
 * Plantillas: Editorial Premium, Clínica Minimalista, Imagen Protagonista.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.GlossVisualExport = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // =========================================================================
  // 1. DIMENSIONES ESTÁNDAR Y ZONAS SEGURAS DE INSTAGRAM
  // =========================================================================
  const DIMENSIONS = {
    CAROUSEL: {
      width: 1080,
      height: 1350,
      aspectRatio: '4:5',
      safeArea: {
        top: 100,
        bottom: 110,
        left: 88,
        right: 88
      }
    },
    STORY: {
      width: 1080,
      height: 1920,
      aspectRatio: '9:16',
      safeArea: {
        top: 260, // Zona segura debajo de cabecera de Stories de Instagram
        bottom: 300, // Zona segura encima de barra de respuesta/mensaje
        left: 88,
        right: 88
      }
    }
  };

  // =========================================================================
  // 2. PALETAS Y ESTILOS DE PLANTILLA CANÓNICOS
  // =========================================================================
  const TEMPLATES = {
    editorial_premium: {
      id: 'editorial_premium',
      name: 'Editorial Premium',
      description: 'Elegancia médica sobria. Fondo crema cálido, acentos borgoña y detalles dorados.',
      bgType: 'solid',
      bgColor: '#FAF7F2',
      primaryColor: '#2C0913',
      secondaryColor: '#C5A880',
      textColor: '#2C0913',
      bodyColor: '#4A3B32',
      mutedColor: '#7A6B63',
      surfaceBg: '#F3EFE6',
      surfaceBorder: '#E5DEC9',
      fontTitle: "'Cormorant Garamond', 'Playfair Display', 'Georgia', serif",
      fontBody: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fontEyebrow: "'Plus Jakarta Sans', sans-serif"
    },
    clinica_minimal: {
      id: 'clinica_minimal',
      name: 'Clínica Minimalista',
      description: 'Estética clínica pulcra y técnica. Fondo blanco puro, tipografía geométrica y acento pizarra.',
      bgType: 'solid',
      bgColor: '#FFFFFF',
      primaryColor: '#0F172A',
      secondaryColor: '#0D9488',
      textColor: '#0F172A',
      bodyColor: '#334155',
      mutedColor: '#64748B',
      surfaceBg: '#F8FAFC',
      surfaceBorder: '#E2E8F0',
      fontTitle: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fontBody: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fontEyebrow: "'Plus Jakarta Sans', sans-serif"
    },
    imagen_protagonista: {
      id: 'imagen_protagonista',
      name: 'Imagen Protagonista',
      description: 'Fondo fotográfico o vino oscuro con degradado de alto contraste para máxima legibilidad.',
      bgType: 'gradient_dark',
      bgColor: '#160408',
      gradientEnd: '#2C0913',
      primaryColor: '#FAF7F2',
      secondaryColor: '#E6CA9E',
      textColor: '#FFFFFF',
      bodyColor: '#FAF7F2',
      mutedColor: '#D1C7BD',
      surfaceBg: 'rgba(255, 255, 255, 0.08)',
      surfaceBorder: 'rgba(255, 255, 255, 0.20)',
      fontTitle: "'Cormorant Garamond', 'Playfair Display', 'Georgia', serif",
      fontBody: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fontEyebrow: "'Plus Jakarta Sans', sans-serif"
    }
  };

  // =========================================================================
  // 3. UTILIDADES DE CANVAS 2D Y TIPOGRAFÍA
  // =========================================================================

  /**
   * Crea o prepara un elemento Canvas con las dimensiones deseadas.
   */
  function createCanvas(width, height) {
    let canvas;
    if (typeof document !== 'undefined') {
      canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
    } else {
      // Entorno Node de prueba (si se usa mock o librería)
      canvas = { width, height };
    }
    return canvas;
  }

  /**
   * Dibuja un rectángulo con esquinas redondeadas.
   */
  function roundRect(ctx, x, y, width, height, radius) {
    if (typeof radius === 'number') {
      radius = { tl: radius, tr: radius, br: radius, bl: radius };
    } else {
      radius = Object.assign({ tl: 0, tr: 0, br: 0, bl: 0 }, radius);
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
  }

  /**
   * Divide un texto en líneas respetando el ancho máximo de la caja.
   */
  function wrapText(ctx, text, maxWidth) {
    if (!text) return [];
    const paragraphs = String(text).split('\n');
    const lines = [];

    paragraphs.forEach(para => {
      const words = para.trim().split(/\s+/);
      if (words.length === 0 || words[0] === '') {
        lines.push('');
        return;
      }
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine + ' ' + word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width <= maxWidth) {
          currentLine = testLine;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
    });

    return lines;
  }

  /**
   * Dibuja una imagen recortada con modo 'cover' en una caja dada.
   */
  function drawImageCover(ctx, img, x, y, w, h) {
    if (!img) return;
    const imgRatio = img.width / img.height;
    const boxRatio = w / h;
    let sX = 0, sY = 0, sW = img.width, sH = img.height;

    if (imgRatio > boxRatio) {
      sW = img.height * boxRatio;
      sX = (img.width - sW) / 2;
    } else {
      sH = img.width / boxRatio;
      sY = (img.height - sH) / 2;
    }

    ctx.drawImage(img, sX, sY, sW, sH, x, y, w, h);
  }

  // =========================================================================
  // 4. RENDERIZADOR DE CARRUSEL (1080 × 1350 PX - 4:5)
  // =========================================================================

  /**
   * Renderiza una lámina de carrusel completa en un canvas 1080 × 1350.
   * 
   * @param {HTMLCanvasElement} canvas
   * @param {Object} slide
   *   - slide_number: number
   *   - total_slides: number
   *   - role: 'PORTADA' | 'SEGUNDO_GANCHO' | 'DESARROLLO' | 'PRUEBA_O_EJEMPLO' | 'INSIGHT' | 'CTA'
   *   - title: string
   *   - copy_text: string
   *   - micro_hook: string
   *   - visual_guidance: string
   * @param {Object} options
   *   - templateId: 'editorial_premium' | 'clinica_minimal' | 'imagen_protagonista'
   *   - brandName: string (ej: "Dra. Elena Ramos")
   *   - brandHandle: string (ej: "@draelenaramos")
   *   - categoryLabel: string (ej: "Medicina Estética")
   *   - userPhoto: HTMLImageElement | null
   *   - primaryColor: string (opcional)
   *   - secondaryColor: string (opcional)
   */
  function renderCarouselSlide(canvas, slide, options = {}) {
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const width = DIMENSIONS.CAROUSEL.width;
    const height = DIMENSIONS.CAROUSEL.height;
    const safe = DIMENSIONS.CAROUSEL.safeArea;
    const contentWidth = width - safe.left - safe.right;

    canvas.width = width;
    canvas.height = height;

    const tplKey = options.templateId || 'editorial_premium';
    const tpl = Object.assign({}, TEMPLATES[tplKey] || TEMPLATES.editorial_premium);

    // Sobrescrituras opcionales de marca
    if (options.primaryColor) tpl.primaryColor = options.primaryColor;
    if (options.secondaryColor) tpl.secondaryColor = options.secondaryColor;

    const brandName = options.brandName || '';
    const brandHandle = options.brandHandle || '';
    const categoryLabel = options.categoryLabel || 'Gloss & Growth · Criterio';
    const slideNumber = slide.slide_number || 1;
    const totalSlides = slide.total_slides || 6;
    const role = (slide.role || 'DESARROLLO').toUpperCase();

    // 1. DIBUJAR FONDO
    ctx.save();
    if (tpl.bgType === 'gradient_dark') {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, tpl.bgColor);
      grad.addColorStop(1, tpl.gradientEnd || '#2C0913');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = tpl.bgColor;
      ctx.fillRect(0, 0, width, height);
    }

    // Si hay foto de usuario cargada:
    if (options.userPhoto) {
      if (tplKey === 'imagen_protagonista') {
        // En imagen protagonista, la foto cubre toda la lámina con scrim
        ctx.globalAlpha = 0.55;
        drawImageCover(ctx, options.userPhoto, 0, 0, width, height);
        ctx.globalAlpha = 1.0;

        // Scrim gradiente para garantizar contraste del texto
        const scrim = ctx.createLinearGradient(0, height * 0.25, 0, height);
        scrim.addColorStop(0, 'rgba(15, 5, 8, 0.40)');
        scrim.addColorStop(0.6, 'rgba(15, 5, 8, 0.88)');
        scrim.addColorStop(1, 'rgba(15, 5, 8, 0.98)');
        ctx.fillStyle = scrim;
        ctx.fillRect(0, 0, width, height);
      } else {
        // En otras plantillas, marco fotográfico elegante en tercio central o superior
        const photoY = 240;
        const photoH = 340;
        ctx.save();
        roundRect(ctx, safe.left, photoY, contentWidth, photoH, 16);
        ctx.clip();
        drawImageCover(ctx, options.userPhoto, safe.left, photoY, contentWidth, photoH);
        ctx.restore();

        // Borde fino al marco de foto
        ctx.strokeStyle = tpl.surfaceBorder;
        ctx.lineWidth = 1.5;
        roundRect(ctx, safe.left, photoY, contentWidth, photoH, 16);
        ctx.stroke();
      }
    }

    // 2. CABECERA: EYEBROW + NÚMERO DE LÁMINA (SLIDE COUNTER)
    const headerY = safe.top + 30;

    // Eyebrow / Categoría
    ctx.font = `600 24px ${tpl.fontEyebrow}`;
    ctx.fillStyle = tpl.secondaryColor;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    const cleanEyebrow = (categoryLabel + (role === 'PORTADA' ? ' · GUÍA CLÍNICA' : ` · ${role}`)).toUpperCase();
    ctx.fillText(cleanEyebrow, safe.left, headerY);

    // Pill de Numeración (ej: "01 / 06")
    const pillText = `${String(slideNumber).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')}`;
    ctx.font = `700 22px ${tpl.fontBody}`;
    const pillMetrics = ctx.measureText(pillText);
    const pillW = pillMetrics.width + 36;
    const pillH = 40;
    const pillX = width - safe.right - pillW;
    const pillY = headerY - (pillH / 2);

    ctx.fillStyle = tpl.surfaceBg;
    roundRect(ctx, pillX, pillY, pillW, pillH, 20);
    ctx.fill();

    ctx.strokeStyle = tpl.surfaceBorder;
    ctx.lineWidth = 1.2;
    roundRect(ctx, pillX, pillY, pillW, pillH, 20);
    ctx.stroke();

    ctx.fillStyle = tpl.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pillText, pillX + (pillW / 2), headerY);

    // Línea divisoria sutil bajo cabecera
    ctx.strokeStyle = tpl.surfaceBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(safe.left, headerY + 40);
    ctx.lineTo(width - safe.right, headerY + 40);
    ctx.stroke();

    // 3. ZONA DE CONTENIDO: TÍTULO Y DESARROLLO
    let cursorY = headerY + 95;

    // Ajustar posición vertical si hay foto en plantilla minimal/editorial
    if (options.userPhoto && tplKey !== 'imagen_protagonista') {
      cursorY = 240 + 340 + 50; // Inicia debajo del marco fotográfico
    }

    // --- TÍTULO ---
    const titleText = (slide.title || '').trim();
    let titleFontSize = role === 'PORTADA' ? 56 : 46;
    if (titleText.length > 90) titleFontSize = 40;
    if (titleText.length > 130) titleFontSize = 34;

    ctx.font = `700 ${titleFontSize}px ${tpl.fontTitle}`;
    ctx.fillStyle = tpl.textColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const titleLineHeight = titleFontSize * 1.22;
    const titleLines = wrapText(ctx, titleText, contentWidth);

    titleLines.forEach(line => {
      ctx.fillText(line, safe.left, cursorY);
      cursorY += titleLineHeight;
    });

    cursorY += 28; // Espacio entre título y cuerpo

    // --- CUERPO / COPY TEXT ---
    const bodyText = (slide.copy_text || '').trim();
    if (bodyText) {
      // Si el rol es INSIGHT o PRUEBA, dibujar dentro de una tarjeta de superficie
      const isCardRole = (role === 'INSIGHT' || role === 'PRUEBA_O_EJEMPLO' || role === 'SEGUNDO_GANCHO');
      
      let bodyFontSize = 32;
      if (bodyText.length > 180) bodyFontSize = 28;
      if (bodyText.length > 280) bodyFontSize = 24;

      ctx.font = `400 ${bodyFontSize}px ${tpl.fontBody}`;
      const bodyLineHeight = bodyFontSize * 1.45;
      
      const cardPadding = isCardRole ? 40 : 0;
      const textWrapWidth = contentWidth - (cardPadding * 2);
      const bodyLines = wrapText(ctx, bodyText, textWrapWidth);
      const cardHeight = (bodyLines.length * bodyLineHeight) + (cardPadding * 2);

      if (isCardRole) {
        // Dibujar tarjeta contenedora de énfasis
        ctx.fillStyle = tpl.surfaceBg;
        roundRect(ctx, safe.left, cursorY, contentWidth, cardHeight, 16);
        ctx.fill();

        ctx.strokeStyle = tpl.surfaceBorder;
        ctx.lineWidth = 1.5;
        roundRect(ctx, safe.left, cursorY, contentWidth, cardHeight, 16);
        ctx.stroke();

        // Barra lateral de acento de 6px
        ctx.fillStyle = tpl.secondaryColor;
        roundRect(ctx, safe.left, cursorY, 8, cardHeight, { tl: 16, bl: 16, tr: 0, br: 0 });
        ctx.fill();
      }

      ctx.fillStyle = tpl.bodyColor;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      let lineY = cursorY + cardPadding;
      bodyLines.forEach(line => {
        ctx.fillText(line, safe.left + cardPadding, lineY);
        lineY += bodyLineHeight;
      });

      cursorY += cardHeight + 25;
    }

    // 4. MICRO-HOOK O LLAMADO DE DESLIZAMIENTO (SWIPE PROMPT)
    const microHookText = (slide.micro_hook || (role === 'PORTADA' ? 'Desliza para continuar →' : (role === 'CTA' ? 'Guarda este carrusel' : 'Desliza →'))).trim();

    if (microHookText && role !== 'CTA') {
      const hookY = height - safe.bottom - 75;
      ctx.font = `600 23px ${tpl.fontBody}`;
      ctx.fillStyle = tpl.secondaryColor;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(microHookText, width - safe.right, hookY);

      // Icono visual de flecha sutil
      ctx.strokeStyle = tpl.secondaryColor;
      ctx.lineWidth = 2;
    } else if (role === 'CTA') {
      // En lámina final de CTA: Dibujar botón de guardado destacado
      const btnY = height - safe.bottom - 110;
      const btnH = 68;
      const btnW = contentWidth;
      ctx.fillStyle = tpl.primaryColor;
      roundRect(ctx, safe.left, btnY, btnW, btnH, 14);
      ctx.fill();

      ctx.strokeStyle = tpl.secondaryColor;
      ctx.lineWidth = 1.5;
      roundRect(ctx, safe.left, btnY, btnW, btnH, 14);
      ctx.stroke();

      ctx.font = `700 24px ${tpl.fontBody}`;
      ctx.fillStyle = tplKey === 'imagen_protagonista' ? '#2C0913' : '#FFFFFF';
      if (tplKey === 'imagen_protagonista') ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('📌 Guarda este contenido y agenda tu valoración', safe.left + (btnW / 2), btnY + (btnH / 2));
    }

    // 5. PIE DE LÁMINA: BRANDING DEL CENTRO O PROFESIONAL
    const footerY = height - safe.bottom + 20;

    // Línea divisoria inferior
    ctx.strokeStyle = tpl.surfaceBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(safe.left, footerY - 25);
    ctx.lineTo(width - safe.right, footerY - 25);
    ctx.stroke();

    // Nombre de clínica / profesional a la izquierda
    ctx.font = `600 22px ${tpl.fontBody}`;
    ctx.fillStyle = tpl.mutedColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const displayBrand = brandName ? brandName : 'Centro Médico & Estético';
    ctx.fillText(displayBrand, safe.left, footerY);

    // Handle de Instagram a la derecha
    ctx.textAlign = 'right';
    const displayHandle = brandHandle ? (brandHandle.startsWith('@') ? brandHandle : '@' + brandHandle) : '@tucentromedico';
    ctx.fillText(displayHandle, width - safe.right, footerY);

    ctx.restore();
  }

  // =========================================================================
  // 5. RENDERIZADOR DE HISTORIA (1080 × 1920 PX - 9:16)
  // =========================================================================

  /**
   * Renderiza una historia de Instagram respetando las zonas seguras verticales.
   * 
   * @param {HTMLCanvasElement} canvas
   * @param {Object} story
   *   - story_number: number
   *   - total_stories: number
   *   - role: 'PREGUNTA' | 'PROBLEMA' | 'SOLUCION' | 'PRUEBA' | 'CTA'
   *   - screen_text: string
   *   - verbal_script: string
   *   - visual_direction: string
   *   - sticker_id: string ('caja_preguntas', 'encuesta_binaria', 'slider_reaccion', 'enlace_web', etc.)
   *   - sticker_name: string
   *   - transition_to_next: string
   * @param {Object} options
   */
  function renderStorySlide(canvas, story, options = {}) {
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const width = DIMENSIONS.STORY.width;
    const height = DIMENSIONS.STORY.height;
    const safe = DIMENSIONS.STORY.safeArea;
    const contentWidth = width - safe.left - safe.right;

    canvas.width = width;
    canvas.height = height;

    const tplKey = options.templateId || 'editorial_premium';
    const tpl = Object.assign({}, TEMPLATES[tplKey] || TEMPLATES.editorial_premium);

    if (options.primaryColor) tpl.primaryColor = options.primaryColor;
    if (options.secondaryColor) tpl.secondaryColor = options.secondaryColor;

    const brandName = options.brandName || '';
    const brandHandle = options.brandHandle || '';
    const categoryLabel = options.categoryLabel || 'Gloss & Growth';
    const storyNumber = story.story_number || 1;
    const totalStories = story.total_stories || 4;

    ctx.save();

    // 1. DIBUJAR FONDO
    if (tpl.bgType === 'gradient_dark' || options.userPhoto) {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#120306');
      grad.addColorStop(0.5, '#240810');
      grad.addColorStop(1, '#120306');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      if (options.userPhoto) {
        ctx.globalAlpha = 0.50;
        drawImageCover(ctx, options.userPhoto, 0, 0, width, height);
        ctx.globalAlpha = 1.0;

        // Scrim vertical completo para legibilidad superior e inferior
        const storyScrim = ctx.createLinearGradient(0, 0, 0, height);
        storyScrim.addColorStop(0, 'rgba(10, 2, 5, 0.70)');
        storyScrim.addColorStop(0.35, 'rgba(10, 2, 5, 0.45)');
        storyScrim.addColorStop(0.70, 'rgba(10, 2, 5, 0.75)');
        storyScrim.addColorStop(1, 'rgba(10, 2, 5, 0.95)');
        ctx.fillStyle = storyScrim;
        ctx.fillRect(0, 0, width, height);
      }
    } else {
      ctx.fillStyle = tpl.bgColor;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. CABECERA SEGURA (Y = 270px, debajo de la barra superior de Instagram)
    const headerY = safe.top + 20;

    // Barra de progreso de Stories (Segmentos simulados en parte superior)
    const progY = 80;
    const progH = 6;
    const gap = 8;
    const segW = (contentWidth - (gap * (totalStories - 1))) / totalStories;

    for (let s = 0; s < totalStories; s++) {
      const segX = safe.left + (s * (segW + gap));
      ctx.fillStyle = (s < storyNumber) ? tpl.secondaryColor : 'rgba(180, 170, 160, 0.35)';
      roundRect(ctx, segX, progY, segW, progH, 3);
      ctx.fill();
    }

    // Identificación de marca en cabecera
    ctx.font = `600 24px ${tpl.fontBody}`;
    ctx.fillStyle = tpl.secondaryColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${(brandName || 'CLÍNICA ESTÉTICA').toUpperCase()} · HISTORIA ${storyNumber}/${totalStories}`, safe.left, headerY);

    // Línea separadora
    ctx.strokeStyle = tpl.surfaceBorder;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(safe.left, headerY + 35);
    ctx.lineTo(width - safe.right, headerY + 35);
    ctx.stroke();

    // 3. TEXTO EN PANTALLA PRINCIPAL (SCREEN TEXT)
    let cursorY = headerY + 80;
    const screenText = (story.screen_text || story.headline || '').trim();

    if (screenText) {
      let stFontSize = 52;
      if (screenText.length > 70) stFontSize = 44;
      if (screenText.length > 110) stFontSize = 38;

      ctx.font = `800 ${stFontSize}px ${tpl.fontTitle}`;
      ctx.fillStyle = tpl.textColor;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      const stLineHeight = stFontSize * 1.25;
      const stLines = wrapText(ctx, screenText, contentWidth);

      stLines.forEach(line => {
        ctx.fillText(line, safe.left, cursorY);
        cursorY += stLineHeight;
      });

      cursorY += 35;
    }

    // 4. GUION VERBAL / EXPLICACIÓN EN CABINA
    const verbalText = (story.verbal_script || '').trim();
    if (verbalText) {
      let vbFontSize = 30;
      if (verbalText.length > 200) vbFontSize = 26;

      ctx.font = `400 ${vbFontSize}px ${tpl.fontBody}`;
      const vbLineHeight = vbFontSize * 1.5;
      const cardPad = 40;
      const vbLines = wrapText(ctx, verbalText, contentWidth - (cardPad * 2));
      const cardHeight = (vbLines.length * vbLineHeight) + (cardPad * 2);

      // Tarjeta translúcida de lectura
      ctx.fillStyle = tpl.surfaceBg;
      roundRect(ctx, safe.left, cursorY, contentWidth, cardHeight, 18);
      ctx.fill();

      ctx.strokeStyle = tpl.surfaceBorder;
      ctx.lineWidth = 1.5;
      roundRect(ctx, safe.left, cursorY, contentWidth, cardHeight, 18);
      ctx.stroke();

      ctx.fillStyle = tpl.bodyColor;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      let lY = cursorY + cardPad;
      vbLines.forEach(line => {
        ctx.fillText(line, safe.left + cardPad, lY);
        lY += vbLineHeight;
      });

      cursorY += cardHeight + 40;
    }

    // 5. STICKER INTERACTIVO MOCK (DENTRO DE LA ZONA NATURAL DEL PULGAR: Y = 1250 - 1500)
    const stickerId = story.sticker_id || 'caja_preguntas';
    const stickerName = story.sticker_name || 'Pregunta a cabina';
    const stickerY = Math.max(cursorY, 1260);

    renderInstagramSticker(ctx, stickerId, stickerName, safe.left, stickerY, contentWidth, tpl);

    // 6. CUE DE TRANSICIÓN HACIA LA SIGUIENTE HISTORIA (Y = 1580, encima de la zona de respuesta)
    const cueY = height - safe.bottom - 40;
    const transitionText = (story.transition_to_next || story.next_transition || 'Toca para continuar 👉').trim();

    ctx.font = `600 24px ${tpl.fontBody}`;
    ctx.fillStyle = tpl.secondaryColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(transitionText, width / 2, cueY);

    // Identificador de cuenta en pie seguro
    ctx.font = `400 20px ${tpl.fontBody}`;
    ctx.fillStyle = tpl.mutedColor;
    ctx.textAlign = 'center';
    const footHandle = brandHandle ? (brandHandle.startsWith('@') ? brandHandle : '@' + brandHandle) : '@tucentromedico';
    ctx.fillText(footHandle, width / 2, cueY + 40);

    ctx.restore();
  }

  /**
   * Dibuja una representación visual fidedigna de un sticker interactivo de Instagram.
   */
  function renderInstagramSticker(ctx, stickerId, stickerName, x, y, width, tpl) {
    ctx.save();
    const boxW = width;

    if (stickerId === 'caja_preguntas') {
      // Caja de Preguntas de Instagram
      const boxH = 210;
      ctx.fillStyle = '#FFFFFF';
      roundRect(ctx, x, y, boxW, boxH, 24);
      ctx.fill();

      // Sombra suave en sticker
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.lineWidth = 2;
      roundRect(ctx, x, y, boxW, boxH, 24);
      ctx.stroke();

      // Título del sticker
      ctx.font = `700 24px 'Plus Jakarta Sans', sans-serif`;
      ctx.fillStyle = '#1E293B';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('Hazme una pregunta sobre tu piel...', x + (boxW / 2), y + 36);

      // Campo de respuesta simulado
      const inputH = 74;
      const inputW = boxW - 60;
      const inputX = x + 30;
      const inputY = y + 96;

      ctx.fillStyle = '#F1F5F9';
      roundRect(ctx, inputX, inputY, inputW, inputH, 16);
      ctx.fill();

      ctx.font = `400 22px 'Plus Jakarta Sans', sans-serif`;
      ctx.fillStyle = '#94A3B8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Escribe tu duda aquí...', inputX + (inputW / 2), inputY + (inputH / 2));

    } else if (stickerId === 'encuesta_binaria') {
      // Encuesta Sí / No
      const boxH = 190;
      ctx.fillStyle = '#FFFFFF';
      roundRect(ctx, x, y, boxW, boxH, 24);
      ctx.fill();

      ctx.font = `700 24px 'Plus Jakarta Sans', sans-serif`;
      ctx.fillStyle = '#0F172A';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('¿Te ha pasado alguna vez?', x + (boxW / 2), y + 30);

      const btnW = (boxW - 60) / 2;
      const btnH = 68;
      const btnY = y + 86;

      // Opción A
      ctx.fillStyle = '#F8FAFC';
      roundRect(ctx, x + 24, btnY, btnW, btnH, 14);
      ctx.fill();
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1.5;
      roundRect(ctx, x + 24, btnY, btnW, btnH, 14);
      ctx.stroke();
      ctx.fillStyle = '#0F172A';
      ctx.font = `700 22px 'Plus Jakarta Sans', sans-serif`;
      ctx.textBaseline = 'middle';
      ctx.fillText('Sí, totalmente', x + 24 + (btnW / 2), btnY + (btnH / 2));

      // Opción B
      ctx.fillStyle = '#F8FAFC';
      roundRect(ctx, x + 36 + btnW, btnY, btnW, btnH, 14);
      ctx.fill();
      ctx.strokeStyle = '#CBD5E1';
      roundRect(ctx, x + 36 + btnW, btnY, btnW, btnH, 14);
      ctx.stroke();
      ctx.fillText('No, nunca', x + 36 + btnW + (btnW / 2), btnY + (btnH / 2));

    } else if (stickerId === 'enlace_web' || stickerId === 'whatsapp_directo') {
      // Sticker de Enlace de Instagram
      const pillH = 76;
      const pillW = boxW - 120;
      const pillX = x + 60;
      ctx.fillStyle = '#FFFFFF';
      roundRect(ctx, pillX, y + 20, pillW, pillH, 38);
      ctx.fill();

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.lineWidth = 2;
      roundRect(ctx, pillX, y + 20, pillW, pillH, 38);
      ctx.stroke();

      ctx.font = `700 24px 'Plus Jakarta Sans', sans-serif`;
      ctx.fillStyle = '#0284C7';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const linkLabel = stickerId === 'whatsapp_directo' ? '🔗 CHATEAR POR WHATSAPP' : '🔗 AGENDAR VALORACIÓN';
      ctx.fillText(linkLabel, pillX + (pillW / 2), y + 20 + (pillH / 2));

    } else {
      // Reacción Slider
      const boxH = 140;
      ctx.fillStyle = '#FFFFFF';
      roundRect(ctx, x, y, boxW, boxH, 24);
      ctx.fill();

      ctx.font = `700 22px 'Plus Jakarta Sans', sans-serif`;
      ctx.fillStyle = '#1E293B';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('¿Qué tan identificado te sientes?', x + (boxW / 2), y + 24);

      // Barra de slider
      const barW = boxW - 80;
      const barH = 16;
      const barX = x + 40;
      const barY = y + 78;
      ctx.fillStyle = '#E2E8F0';
      roundRect(ctx, barX, barY, barW, barH, 8);
      ctx.fill();

      // Emoji slider thumb
      ctx.font = '36px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✨', barX + (barW * 0.75), barY + (barH / 2));
    }

    ctx.restore();
  }

  // =========================================================================
  // 6. EXPORTACIÓN Y DESCARGA (BLOB / DATA URL)
  // =========================================================================

  /**
   * Exporta un Canvas a Blob PNG de alta resolución.
   */
  function exportCanvasAsBlob(canvas) {
    return new Promise((resolve, reject) => {
      if (!canvas || !canvas.toBlob) {
        reject(new Error('Canvas no válido para exportación'));
        return;
      }
      canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject(new Error('Error al generar Blob PNG'));
      }, 'image/png', 1.0);
    });
  }

  /**
   * Exporta un Canvas a Data URL Base64.
   */
  function exportCanvasAsDataURL(canvas) {
    if (!canvas || !canvas.toDataURL) return '';
    return canvas.toDataURL('image/png', 1.0);
  }

  /**
   * Dispara la descarga inmediata de un Canvas en el navegador del usuario.
   */
  function downloadCanvas(canvas, filename = 'gloss-growth-imagen.png') {
    if (typeof document === 'undefined') return;
    const link = document.createElement('a');
    link.download = filename;
    link.href = exportCanvasAsDataURL(canvas);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return {
    DIMENSIONS,
    TEMPLATES,
    createCanvas,
    renderCarouselSlide,
    renderStorySlide,
    exportCanvasAsBlob,
    exportCanvasAsDataURL,
    downloadCanvas
  };
}));
