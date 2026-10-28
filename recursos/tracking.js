/**
 * GLOSS & GROWTH — Sistema Unificado de Analítica y Medición Comercial
 * Integración segura con Google Analytics 4 (GA4) y Meta Pixel.
 *
 * Principios:
 * 1. Cero recolección de PII (nombres, teléfonos, historias clínicas ni datos sensibles).
 * 2. Deduplicación inteligente: previene eventos disparados en ráfaga o en re-renders.
 * 3. Tolerancia a fallos: no interrumpe la navegación si un bloqueador de anuncios o cookie blocker está activo.
 * 4. Atribución contextual: registra la herramienta, artículo o sección de procedencia.
 */

(function (window, document) {
  'use strict';

  var WA_NUMBER = '573145904933';
  var recentEvents = {};
  var DEDUPE_WINDOW_MS = 1500;

  var GlossTrack = {
    /**
     * Envía un evento normalizado a GA4 y Meta Pixel
     * @param {string} eventName
     * @param {Object} [params]
     */
    event: function (eventName, params) {
      params = params || {};

      // Deduplicación básica
      var now = Date.now();
      var key = eventName + '_' + (params.action || '') + '_' + (params.source || '');
      if (recentEvents[key] && (now - recentEvents[key]) < DEDUPE_WINDOW_MS) {
        return;
      }
      recentEvents[key] = now;

      // Sanitizar parámetros para garantizar cero PII
      var safeParams = {
        page_path: window.location.pathname,
        page_title: document.title
      };

      for (var p in params) {
        if (Object.prototype.hasOwnProperty.call(params, p)) {
          // Filtrar cualquier campo que huela a dato personal
          var pLower = p.toLowerCase();
          if (pLower.indexOf('phone') !== -1 ||
              pLower.indexOf('email') !== -1 ||
              pLower.indexOf('name') !== -1 ||
              pLower.indexOf('nombre') !== -1 ||
              pLower.indexOf('telefono') !== -1 ||
              pLower.indexOf('correo') !== -1) {
            continue;
          }
          safeParams[p] = params[p];
        }
      }

      // Enviar a GA4 (gtag)
      try {
        if (typeof window.gtag === 'function') {
          window.gtag('event', eventName, safeParams);
        }
      } catch (eGA) {
        // Silencioso en producción
      }

      // Enviar a Meta Pixel (fbq)
      try {
        if (typeof window.fbq === 'function') {
          // Si es un evento estándar de Meta
          if (eventName === 'contact_whatsapp_click' || eventName === 'diagnostic_complete') {
            window.fbq('trackCustom', eventName, safeParams);
          } else {
            window.fbq('trackCustom', eventName, safeParams);
          }
        }
      } catch (eFB) {
        // Silencioso en producción
      }
    },

    /**
     * Construye un enlace de WhatsApp contextual y seguro
     * @param {string} context - Ej: 'calculadora_capacidad', 'diagnostico', 'articulo_isaps'
     * @param {string} [customMsg]
     * @returns {string}
     */
    buildWhatsAppUrl: function (context, customMsg) {
      var baseMsg = '';
      if (customMsg) {
        baseMsg = customMsg;
      } else {
        switch (context) {
          case 'servicios':
            baseMsg = 'Hola Gloss Growth, estuve revisando sus servicios y me gustaría consultar disponibilidad para mi centro.';
            break;
          case 'calculadora_publicidad':
            baseMsg = 'Hola Gloss Growth, utilicé la calculadora de presupuesto publicitario y me gustaría analizar mi inversión con un consultor.';
            break;
          case 'calculadora_capacidad':
            baseMsg = 'Hola Gloss Growth, utilicé el simulador de capacidad instalada y me gustaría revisar la rentabilidad de mis horas de sillón.';
            break;
          case 'calculadora_aparatologia':
            baseMsg = 'Hola Gloss Growth, utilicé la calculadora de inversión en aparatología y quisiera evaluar el retorno de un equipo.';
            break;
          case 'diagnostico':
            baseMsg = 'Hola Gloss Growth, completé el diagnóstico comercial en la web y me gustaría revisar mis 3 prioridades operativas.';
            break;
          case 'gloss_insights':
            baseMsg = 'Hola Gloss Growth, leí el reporte Gloss Insights Volumen 01 y me gustaría conversar sobre estrategia sectorial.';
            break;
          default:
            baseMsg = 'Hola Gloss Growth, quisiera hablar con un consultor sobre la gestión y crecimiento de mi clínica estética.';
        }
      }

      // Agregar código no sensible de procedencia técnica
      var encoded = encodeURIComponent(baseMsg);
      return 'https://wa.me/' + WA_NUMBER + '?text=' + encoded;
    },

    /**
     * Inicializa los listeners automáticos para enlaces WhatsApp y descargas de PDF
     */
    initAutoTracking: function () {
      document.addEventListener('click', function (e) {
        var link = e.target.closest('a');
        if (!link) return;

        var href = link.getAttribute('href') || '';

        // 1. Detección de clics hacia WhatsApp
        if (href.indexOf('wa.me') !== -1 || href.indexOf('whatsapp.com') !== -1) {
          var context = link.getAttribute('data-track-wa') || 'general';
          GlossTrack.event('contact_whatsapp_click', {
            source_context: context,
            link_href: href.split('?')[0] // Sin parámetros para evitar fugas
          });
        }

        // 2. Detección de descargas de PDF (Gloss Insights, Reportes, etc.)
        if (/\.pdf($|\?)/i.test(href)) {
          var fileName = href.split('/').pop().split('?')[0];
          GlossTrack.event('insight_pdf_download', {
            file_name: fileName,
            resource_type: 'pdf_document'
          });
        }
      }, { passive: true });
    }
  };

  // Inicialización automática al cargar el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', GlossTrack.initAutoTracking);
  } else {
    GlossTrack.initAutoTracking();
  }

  window.GlossTrack = GlossTrack;

})(window, document);
