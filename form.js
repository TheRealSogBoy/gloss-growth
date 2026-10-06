
    var WA_NUMBER = '573145904933';

    function openWAModal() {
      var modal = document.getElementById('wa-modal');
      modal.setAttribute('aria-hidden', 'false');
      modal.classList.add('wa-modal--open');
      document.body.style.overflow = 'hidden';
      // Re-init lucide icons inside modal
      if (typeof lucide !== 'undefined') { lucide.createIcons(); }
      // Focus first input
      setTimeout(function() {
        var first = modal.querySelector('input');
        if (first) first.focus();
      }, 200);
    }

    function closeWAModal() {
      var modal = document.getElementById('wa-modal');
      modal.setAttribute('aria-hidden', 'true');
      modal.classList.remove('wa-modal--open');
      document.body.style.overflow = '';
    }

    // Close on ESC
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeWAModal();
    });

    function sendToWhatsApp(e) {
      e.preventDefault();
      var nombre      = document.getElementById('wa-nombre').value.trim();
      var negocio     = document.getElementById('wa-negocio').value.trim();
      var trabajadores = document.getElementById('wa-trabajadores').value;
      var ubicacion   = document.getElementById('wa-ubicacion').value.trim();
      var servicio    = document.getElementById('wa-servicio').value;

      const form=e.currentTarget, button=document.getElementById('waSubmitBtn');
      if(button.disabled || form.elements.website.value) return;
      const fields=[...form.querySelectorAll('[required]')];
      const invalid=fields.filter(el=>!el.value.trim() || !el.checkValidity());
      fields.forEach(el=>{
        const bad=invalid.includes(el);el.setAttribute('aria-invalid',String(bad));
        el.classList.toggle('wa-form__input--error',bad);
        document.getElementById(el.id+'-error').hidden=!bad;
      });
      const status=document.getElementById('wa-status'), fallback=document.getElementById('wa-fallback');
      fallback.hidden=true;
      if(invalid.length){status.textContent='Revisa los campos señalados.';invalid[0].focus();return;}
      button.disabled=true;button.setAttribute('aria-busy','true');status.textContent='Preparando tu mensaje…';
      var message =
        '¡Hola Gloss Growth! 👋 Quiero solicitar un diagnóstico para mi negocio.\n\n' +
        '📋 *Mi información:*\n' +
        '👤 Nombre: ' + nombre + '\n' +
        '🏥 Clínica/Negocio: ' + negocio + '\n' +
        '👥 Equipo: ' + trabajadores + '\n' +
        '📍 Ubicación: ' + ubicacion + '\n' +
        '✨ Servicio a potenciar: ' + servicio + '\n\n' +
        '¿Podemos revisar mi caso? 🚀';

      var encoded = encodeURIComponent(message);
      var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encoded;

      fallback.href=url;
      try {
        const popup=window.open('about:blank','_blank');
        if(!popup) throw new Error('blocked');
        popup.opener=null;popup.location.replace(url);
        status.textContent='Tu mensaje está listo en WhatsApp. Revísalo y pulsa enviar allí.';
      } catch(error) {
        status.textContent='No se pudo abrir WhatsApp. Usa el enlace para continuar.';
        fallback.hidden=false;
      } finally {
        setTimeout(()=>{button.disabled=false;button.removeAttribute('aria-busy');},1500);
      }
    }

    // Remove error class on input
    document.addEventListener('DOMContentLoaded', function() {
      document.querySelectorAll('.wa-form__input').forEach(function(el) {
        el.addEventListener('input', function() { el.classList.remove('wa-form__input--error'); el.removeAttribute('aria-invalid'); document.getElementById(el.id+'-error').hidden=true; });
      });
    });
  