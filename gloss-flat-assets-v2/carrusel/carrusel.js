/* ═══════════════════════════════════════════════════════════════════════
   GLOSS & GROWTH HQ — INSTAGRAM CAROUSEL STUDIO SCRIPT
   Export Engine: html2canvas (PNG & WebP at native 1080x1350 resolution)
   ═══════════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Setup Responsive Viewport Scaling for 1080x1350 slides
  setupSlideScaling();
  window.addEventListener('resize', setupSlideScaling);

  // Setup Export Listeners
  setupExportButtons();

  // Setup Live Edit Toggle
  setupEditableToggle();
});

/**
 * Dynamically scales the 1080x1350 DOM canvas elements inside their preview viewports
 */
function setupSlideScaling() {
  const viewports = document.querySelectorAll('.slide-viewport');

  viewports.forEach(viewport => {
    const canvas = viewport.querySelector('.slide-canvas');
    if (!canvas) return;

    const viewportWidth = viewport.clientWidth;
    const scale = viewportWidth / 1080;

    canvas.style.transform = `scale(${scale})`;
  });
}

/**
 * Configures single slide & batch export listeners
 */
function setupExportButtons() {
  // Single Slide Export
  const exportBtns = document.querySelectorAll('[data-export-slide]');
  exportBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const slideId = btn.getAttribute('data-export-slide');
      const format = btn.getAttribute('data-format') || 'png';
      await exportSingleSlide(slideId, format, btn);
    });
  });

  // Batch Export All Slides PNG
  const batchPngBtn = document.getElementById('exportAllPng');
  if (batchPngBtn) {
    batchPngBtn.addEventListener('click', () => exportAllSlides('png', batchPngBtn));
  }

  // Batch Export All Slides WebP
  const batchWebpBtn = document.getElementById('exportAllWebp');
  if (batchWebpBtn) {
    batchWebpBtn.addEventListener('click', () => exportAllSlides('webp', batchWebpBtn));
  }
}

/**
 * Converts an image URL to a clean inline Base64 Data URL to prevent tainted canvas security errors
 */
function imageToDataUrl(url) {
  return new Promise((resolve) => {
    // If already data URL, return as is
    if (url.startsWith('data:')) {
      return resolve(url);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth || img.width || 300;
        c.height = img.naturalHeight || img.height || 300;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const dataUrl = c.toDataURL('image/png');
        resolve(dataUrl);
      } catch (e) {
        fetchBlobFallback(url, resolve);
      }
    };

    img.onerror = () => {
      fetchBlobFallback(url, resolve);
    };

    img.src = url;
  });
}

function fetchBlobFallback(url, resolve) {
  fetch(url)
    .then(res => res.blob())
    .then(blob => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    })
    .catch(() => resolve(null));
}

/**
 * Pre-inlines all <img> src attributes inside an element to Base64 data URLs before html2canvas capture
 */
async function inlineImagesInElement(element) {
  const images = Array.from(element.querySelectorAll('img'));
  for (const img of images) {
    if (!img.src || img.src.startsWith('data:')) continue;
    const dataUrl = await imageToDataUrl(img.src);
    if (dataUrl) {
      img.src = dataUrl;
    }
  }
}

/**
 * Renders a 1080x1350 slide canvas element to PNG or WebP blob and triggers download
 */
async function exportSingleSlide(slideId, format = 'png', btnElement = null) {
  const slideElement = document.getElementById(slideId);
  if (!slideElement) {
    console.error(`Slide element #${slideId} not found`);
    return;
  }

  let originalText = '';
  if (btnElement) {
    originalText = btnElement.innerHTML;
    btnElement.innerHTML = `<span class="spinner"></span> Generando ${format.toUpperCase()}...`;
    btnElement.disabled = true;
  }

  try {
    // Pre-inline all images inside the target slide to prevent Tainted Canvas security errors
    await inlineImagesInElement(slideElement);

    // Render using html2canvas at scale 1 (native 1080x1350)
    const canvas = await html2canvas(slideElement, {
      scale: 1,
      width: 1080,
      height: 1350,
      useCORS: true,
      allowTaint: false, // Must be false so canvas remains untainted and toBlob works!
      backgroundColor: '#14080a',
      logging: false,
      onclone: (clonedDoc) => {
        // Ensure cloned canvas in export has scale(1)
        const clonedSlide = clonedDoc.getElementById(slideId);
        if (clonedSlide) {
          clonedSlide.style.transform = 'scale(1)';
          clonedSlide.style.position = 'relative';
        }
      }
    });

    const mimeType = format === 'webp' ? 'image/webp' : 'image/png';
    const extension = format === 'webp' ? 'webp' : 'png';
    const slideNumber = slideId.replace('slide-', '');
    const filename = `GlossGrowth_HQ_Carrusel_Slide_${slideNumber}.${extension}`;

    // Convert canvas to Blob safely
    canvas.toBlob((blob) => {
      if (!blob) {
        // Fallback to dataURL download if blob fails
        const dataUrl = canvas.toDataURL(mimeType, 0.95);
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();
      } else {
        saveAs(blob, filename);
      }

      if (btnElement) {
        btnElement.innerHTML = `✅ ¡Descargado!`;
        setTimeout(() => {
          btnElement.innerHTML = originalText;
          btnElement.disabled = false;
        }, 2000);
      }
    }, mimeType, 0.95);

  } catch (err) {
    console.error(`Error exporting slide #${slideId}:`, err);
    alert(`Error al generar la imagen: ${err.message}`);
    if (btnElement) {
      btnElement.innerHTML = originalText;
      btnElement.disabled = false;
    }
  }
}

/**
 * Exports all 6 slides sequentially and downloads them or packs them into a ZIP if JSZip is available
 */
async function exportAllSlides(format = 'png', mainBtn = null) {
  let originalHtml = '';
  if (mainBtn) {
    originalHtml = mainBtn.innerHTML;
    mainBtn.innerHTML = `⏳ Procesando 6 Slides (${format.toUpperCase()})...`;
    mainBtn.disabled = true;
  }

  const slideIds = ['slide-1', 'slide-2', 'slide-3', 'slide-4', 'slide-5', 'slide-6'];
  const hasZip = typeof JSZip !== 'undefined' && typeof saveAs !== 'undefined';
  const zip = hasZip ? new JSZip() : null;

  for (let i = 0; i < slideIds.length; i++) {
    const slideId = slideIds[i];
    const slideElement = document.getElementById(slideId);
    if (!slideElement) continue;

    if (mainBtn) {
      mainBtn.innerHTML = `⏳ Exportando Slide ${i + 1} de 6...`;
    }

    try {
      // Pre-inline all images inside target slide
      await inlineImagesInElement(slideElement);

      const canvas = await html2canvas(slideElement, {
        scale: 1,
        width: 1080,
        height: 1350,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#14080a',
        logging: false,
        onclone: (clonedDoc) => {
          const clonedSlide = clonedDoc.getElementById(slideId);
          if (clonedSlide) {
            clonedSlide.style.transform = 'scale(1)';
            clonedSlide.style.position = 'relative';
          }
        }
      });

      const mimeType = format === 'webp' ? 'image/webp' : 'image/png';
      const extension = format === 'webp' ? 'webp' : 'png';
      const filename = `GlossGrowth_HQ_Carrusel_Slide_${i + 1}.${extension}`;

      if (zip) {
        const dataUrl = canvas.toDataURL(mimeType, 0.95);
        const base64Data = dataUrl.split(',')[1];
        zip.file(filename, base64Data, { base64: true });
      } else {
        // Fallback: Individual downloads with delay
        await new Promise(resolve => {
          canvas.toBlob((blob) => {
            if (blob) {
              saveAs(blob, filename);
            } else {
              const dataUrl = canvas.toDataURL(mimeType, 0.95);
              const link = document.createElement('a');
              link.download = filename;
              link.href = dataUrl;
              link.click();
            }
            setTimeout(resolve, 600);
          }, mimeType, 0.95);
        });
      }
    } catch (err) {
      console.error(`Error in batch export for slide ${slideId}:`, err);
    }
  }

  if (zip) {
    if (mainBtn) mainBtn.innerHTML = `📦 Compimiendo ZIP...`;
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `GlossGrowth_HQ_Carrusel_Instagram_${format.toUpperCase()}.zip`);
  }

  if (mainBtn) {
    mainBtn.innerHTML = `✅ ¡Los 6 Slides Listos!`;
    setTimeout(() => {
      mainBtn.innerHTML = originalHtml;
      mainBtn.disabled = false;
    }, 2500);
  }
}

/**
 * Toggle live contenteditable mode on text elements in slides
 */
function setupEditableToggle() {
  const toggleBtn = document.getElementById('toggleEditable');
  if (!toggleBtn) return;

  let isEditable = false;

  toggleBtn.addEventListener('click', () => {
    isEditable = !isEditable;

    const editableElements = document.querySelectorAll(
      '.slide-title-lg, .slide-title-md, .slide-subtitle, .big-number, .profile-card__name, .profile-card__role, .comp-card__text, .system-step__title, .system-step__desc, .statement-item'
    );

    editableElements.forEach(el => {
      el.contentEditable = isEditable ? 'true' : 'false';
      if (isEditable) {
        el.style.outline = '1px dashed rgba(253, 164, 175, 0.5)';
        el.style.borderRadius = '4px';
        el.style.padding = '2px 4px';
      } else {
        el.style.outline = 'none';
        el.style.padding = '0';
      }
    });

    if (isEditable) {
      toggleBtn.classList.add('btn-studio--primary');
      toggleBtn.classList.remove('btn-studio--secondary');
      toggleBtn.innerHTML = `<i data-lucide="check"></i> Modo Edición Activo`;
    } else {
      toggleBtn.classList.remove('btn-studio--primary');
      toggleBtn.classList.add('btn-studio--secondary');
      toggleBtn.innerHTML = `<i data-lucide="edit-3"></i> Editar Textos Live`;
    }

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  });
}
