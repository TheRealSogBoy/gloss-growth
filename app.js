/**
 * GLOSS GROWTH — PREMIUM LANDING PAGE
 * Main JavaScript: GSAP + ScrollTrigger + Lenis + Custom Interactions
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════════════
   INITIALIZATION
   ═══════════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Register GSAP plugins
  if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  }

  // Initialize all modules
  initLenis();
  initNavbar();
  initCursorGlow();
  initHeroAnimations();
  initScrollReveal();
  initFlowDiagram();
  initCounters();
  initFAQ();
  initCalculator();
  initMagneticButtons();
  initRippleButtons();
  initMobileMenu();
  initSmoothScroll();
  initParallax();
});

/* ═══════════════════════════════════════════════════════════════════════
   LENIS SMOOTH SCROLL
   ═══════════════════════════════════════════════════════════════════════ */

function initLenis() {
  if (typeof Lenis === 'undefined') return;

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  });

  // Sync Lenis with GSAP ScrollTrigger
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  } else {
    // Fallback RAF loop without GSAP
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // Make lenis accessible globally for smooth scroll links
  window._lenis = lenis;
}

/* ═══════════════════════════════════════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════════════════════════════════════ */

function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let lastScrollY = 0;
  let ticking = false;

  function updateNavbar() {
    const scrollY = window.scrollY;

    // Add scrolled class
    if (scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Hide on scroll down, show on scroll up
    if (scrollY > lastScrollY && scrollY > 200) {
      navbar.style.transform = 'translateY(-100%)';
    } else {
      navbar.style.transform = 'translateY(0)';
    }

    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }, { passive: true });

  // Add transition for hide/show
  navbar.style.transition = 'transform 0.4s ease, background 0.4s ease, padding 0.4s ease, box-shadow 0.4s ease';
}

/* ═══════════════════════════════════════════════════════════════════════
   MOBILE MENU
   ═══════════════════════════════════════════════════════════════════════ */

function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!hamburger || !mobileMenu) return;

  let isOpen = false;

  hamburger.addEventListener('click', () => {
    isOpen = !isOpen;
    hamburger.classList.toggle('open', isOpen);
    mobileMenu.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen.toString());
    mobileMenu.setAttribute('aria-hidden', (!isOpen).toString());
  });

  // Close on link click
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      isOpen = false;
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (isOpen && !hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      isOpen = false;
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    }
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   CURSOR GLOW
   ═══════════════════════════════════════════════════════════════════════ */

function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow) return;

  // Only on desktop
  if (window.matchMedia('(pointer: coarse)').matches) {
    glow.style.display = 'none';
    return;
  }

  let mouseX = 0, mouseY = 0;
  let glowX = 0, glowY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  function animateGlow() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;

    glow.style.left = glowX + 'px';
    glow.style.top  = glowY + 'px';

    requestAnimationFrame(animateGlow);
  }

  animateGlow();
}

/* ═══════════════════════════════════════════════════════════════════════
   HERO ANIMATIONS
   ═══════════════════════════════════════════════════════════════════════ */

function initHeroAnimations() {
  // Animate floating notifications
  const notifs = document.querySelectorAll('.hero__notif');
  notifs.forEach((notif, i) => {
    const delay = 1200 + i * 600;
    setTimeout(() => {
      notif.style.transition = 'opacity 0.6s ease';
      notif.style.opacity = '1';
    }, delay);
  });

  // Loop notification fade in/out
  setupNotifLoop(notifs);
}

function setupNotifLoop(notifs) {
  if (notifs.length === 0) return;

  let currentIndex = 0;
  const interval = 4000;

  // After initial show, create subtle pulse animation
  setTimeout(() => {
    setInterval(() => {
      notifs.forEach((n, i) => {
        if (i === currentIndex) {
          n.style.transform = 'scale(1.02)';
          setTimeout(() => { n.style.transform = 'scale(1)'; }, 300);
        }
      });
      currentIndex = (currentIndex + 1) % notifs.length;
    }, interval);
  }, 4000);
}

/* ═══════════════════════════════════════════════════════════════════════
   SCROLL REVEAL
   ═══════════════════════════════════════════════════════════════════════ */

function initScrollReveal() {
  const elements = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Stagger delay for children if applicable
            const delay = parseInt(entry.target.dataset.revealDelay || '0', 10) * 80;
            setTimeout(() => {
              entry.target.classList.add('revealed');
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -60px 0px',
      }
    );

    elements.forEach((el) => observer.observe(el));
  } else {
    // Fallback: show all immediately
    elements.forEach((el) => el.classList.add('revealed'));
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   FLOW DIAGRAM ANIMATION
   ═══════════════════════════════════════════════════════════════════════ */

function initFlowDiagram() {
  const flowContainer = document.getElementById('sistemaFlow');
  if (!flowContainer) return;

  const steps = flowContainer.querySelectorAll('[data-flow-step]');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Animate each step sequentially
          steps.forEach((step, i) => {
            setTimeout(() => {
              step.classList.add('flow-revealed');
            }, i * 120);
          });
          observer.unobserve(flowContainer);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(flowContainer);
  } else {
    steps.forEach((s) => s.classList.add('flow-revealed'));
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   ANIMATED COUNTERS
   ═══════════════════════════════════════════════════════════════════════ */

function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  function animateCounter(el) {
    const target    = parseInt(el.dataset.counter, 10);
    const prefix    = el.dataset.prefix || '';
    const suffix    = el.dataset.suffix || '';
    const duration  = 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed  = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOut(progress);
      const current  = Math.floor(easedProgress * target);

      el.textContent = prefix + current.toLocaleString('es-CO') + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = prefix + target.toLocaleString('es-CO') + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((counter) => observer.observe(counter));
  } else {
    counters.forEach((counter) => {
      const target = parseInt(counter.dataset.counter, 10);
      const suffix = counter.dataset.suffix || '';
      counter.textContent = target + suffix;
    });
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   FAQ ACCORDION
   ═══════════════════════════════════════════════════════════════════════ */

function initFAQ() {
  const faqItems = document.querySelectorAll('.faq__item');

  faqItems.forEach((item) => {
    const button = item.querySelector('.faq__question');
    const answer = item.querySelector('.faq__answer');

    if (!button || !answer) return;

    button.addEventListener('click', () => {
      const isExpanded = button.getAttribute('aria-expanded') === 'true';

      // Close all others
      faqItems.forEach((other) => {
        if (other !== item) {
          const otherBtn = other.querySelector('.faq__question');
          const otherAns = other.querySelector('.faq__answer');
          if (otherBtn && otherAns) {
            otherBtn.setAttribute('aria-expanded', 'false');
            otherAns.setAttribute('hidden', '');
            otherAns.style.maxHeight = '0';
            otherAns.style.paddingBottom = '0';
          }
        }
      });

      // Toggle current
      if (isExpanded) {
        button.setAttribute('aria-expanded', 'false');
        answer.setAttribute('hidden', '');
        answer.style.maxHeight = '0';
        answer.style.paddingBottom = '0';
      } else {
        button.setAttribute('aria-expanded', 'true');
        answer.removeAttribute('hidden');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        answer.style.paddingBottom = '';
      }
    });
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   CALCULATOR
   ═══════════════════════════════════════════════════════════════════════ */

function initCalculator() {
  const avgInput      = document.getElementById('avgProcedure');
  const patientsInput = document.getElementById('newPatients');
  const monthlyResult = document.getElementById('monthlyResult');
  const annualResult  = document.getElementById('annualResult');

  if (!avgInput || !patientsInput || !monthlyResult || !annualResult) return;

  let animationFrame;
  let currentMonthly = 0;
  let currentAnnual  = 0;

  function formatCurrency(value) {
    if (value === 0) return '$0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value);
  }

  function animateToValue(currentRef, target, setter, el) {
    cancelAnimationFrame(animationFrame);

    const start    = performance.now();
    const duration = 600;
    const from     = currentRef;

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      const value    = Math.round(from + (target - from) * eased);

      el.textContent = formatCurrency(value);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      } else {
        el.textContent = formatCurrency(target);
      }
    }

    animationFrame = requestAnimationFrame(step);
    return target;
  }

  function parseCleanNumber(valStr) {
    if (!valStr) return 0;
    const digitsOnly = valStr.toString().replace(/[^0-9]/g, '');
    return parseFloat(digitsOnly) || 0;
  }

  function calculate() {
    const avg      = parseCleanNumber(avgInput.value);
    const patients = parseCleanNumber(patientsInput.value);
    const monthly  = avg * patients;
    const annual   = monthly * 12;

    // Visual feedback
    if (monthly > 0) {
      monthlyResult.style.transform = 'scale(1.05)';
      annualResult.style.transform  = 'scale(1.05)';
      setTimeout(() => {
        monthlyResult.style.transform = 'scale(1)';
        annualResult.style.transform  = 'scale(1)';
      }, 200);
    }

    currentMonthly = animateToValue(currentMonthly, monthly, null, monthlyResult);
    currentAnnual  = animateToValue(currentAnnual,  annual,  null, annualResult);

    // Add transition to result values
    monthlyResult.style.transition = 'transform 0.2s ease';
    annualResult.style.transition  = 'transform 0.2s ease';
  }

  avgInput.addEventListener('input', calculate);
  patientsInput.addEventListener('input', calculate);

  // Format input on blur
  avgInput.addEventListener('blur', () => {
    const val = parseCleanNumber(avgInput.value);
    if (val > 0) {
      avgInput.value = val.toLocaleString('es-CO');
    }
  });

  avgInput.addEventListener('focus', () => {
    const val = parseCleanNumber(avgInput.value);
    if (val > 0) {
      avgInput.value = val.toString();
    }
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   MAGNETIC BUTTONS
   ═══════════════════════════════════════════════════════════════════════ */

function initMagneticButtons() {
  // Only on non-touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const magneticBtns = document.querySelectorAll('.btn--magnetic');

  magneticBtns.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect     = btn.getBoundingClientRect();
      const centerX  = rect.left + rect.width / 2;
      const centerY  = rect.top  + rect.height / 2;
      const dx       = (e.clientX - centerX) * 0.25;
      const dy       = (e.clientY - centerY) * 0.25;

      btn.style.transform = `translate(${dx}px, ${dy}px) scale(1.03)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.transition = 'transform 0.5s cubic-bezier(0.33,1,0.68,1), box-shadow 0.3s ease';
    });

    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'transform 0.1s linear, box-shadow 0.3s ease';
    });
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   RIPPLE EFFECT ON BUTTONS
   ═══════════════════════════════════════════════════════════════════════ */

function initRippleButtons() {
  const buttons = document.querySelectorAll('.btn--primary');

  buttons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const ripple = btn.querySelector('.btn__ripple');
      if (!ripple) return;

      const rect   = btn.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const size   = Math.max(rect.width, rect.height) * 2;

      ripple.style.left   = `${x}px`;
      ripple.style.top    = `${y}px`;
      ripple.style.width  = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.opacity = '1';
      ripple.style.transition = 'none';

      requestAnimationFrame(() => {
        ripple.style.transition = 'width 0.6s ease, height 0.6s ease, opacity 0.6s ease';
        ripple.style.width  = `${size * 2}px`;
        ripple.style.height = `${size * 2}px`;
        ripple.style.opacity = '0';
      });
    });
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   SMOOTH SCROLL
   ═══════════════════════════════════════════════════════════════════════ */

function initSmoothScroll() {
  const anchors = document.querySelectorAll('a[href^="#"]');

  anchors.forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href   = anchor.getAttribute('href');
      const target = document.querySelector(href);

      if (!target) return;

      e.preventDefault();

      const offset = 80; // Navbar height

      if (window._lenis) {
        window._lenis.scrollTo(target, { offset: -offset, duration: 1.4 });
      } else {
        const y = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   PARALLAX EFFECTS
   ═══════════════════════════════════════════════════════════════════════ */

function initParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const heroImage = document.querySelector('.hero__image');
  const heroBgOrbs = document.querySelectorAll('.hero__bg-orb');

  if (!heroImage) return;

  let lastScrollY = 0;

  function onScroll() {
    const scrollY = window.scrollY;

    // Parallax hero image (very subtle)
    if (heroImage) {
      heroImage.style.transform = `scale(1.02) translateY(${scrollY * 0.08}px)`;
    }

    // Orbs move slightly
    heroBgOrbs.forEach((orb, i) => {
      const direction = i === 0 ? 1 : -1;
      orb.style.transform += ` translateY(${scrollY * 0.05 * direction}px)`;
    });

    lastScrollY = scrollY;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ═══════════════════════════════════════════════════════════════════════
   GSAP ADVANCED ANIMATIONS (if GSAP is available)
   ═══════════════════════════════════════════════════════════════════════ */

if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {

  // Hero title word-by-word reveal
  const heroTitle = document.querySelector('.hero__title');
  if (heroTitle) {
    // We use CSS animations for the hero (they're already defined)
    // GSAP handles scroll-triggered ones below
  }

  // Stat card bars
  gsap.utils.toArray('.stat-card__bar-fill').forEach((bar) => {
    const fill = getComputedStyle(bar.parentElement).getPropertyValue('--fill').trim();
    gsap.from(bar, {
      scrollTrigger: {
        trigger: bar,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      width: '0%',
      duration: 1.4,
      ease: 'power2.out',
      onComplete: () => {
        bar.style.width = fill;
      }
    });
  });

  // Problema cards stagger
  gsap.utils.toArray('.problema__card').forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, y: 40 },
      {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: i * 0.15,
        ease: 'power2.out',
      }
    );
  });

  // Proceso steps stagger
  gsap.utils.toArray('.proceso__step').forEach((step, i) => {
    gsap.fromTo(step,
      { opacity: 0, x: -30 },
      {
        scrollTrigger: {
          trigger: step,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
        opacity: 1,
        x: 0,
        duration: 0.7,
        delay: i * 0.1,
        ease: 'power2.out',
      }
    );
  });

  // GLOSS modules stagger
  gsap.utils.toArray('.gloss-module').forEach((module, i) => {
    gsap.fromTo(module,
      { opacity: 0, y: 30, scale: 0.97 },
      {
        scrollTrigger: {
          trigger: module,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        delay: i * 0.12,
        ease: 'back.out(1.4)',
      }
    );
  });

  // Case result cards
  gsap.utils.toArray('.caso__result-card').forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, scale: 0.85 },
      {
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
        opacity: 1,
        scale: 1,
        duration: 0.6,
        delay: i * 0.1,
        ease: 'back.out(1.7)',
      }
    );
  });

  // Para quien criteria stagger
  gsap.utils.toArray('.para-quien__criterion').forEach((c, i) => {
    gsap.fromTo(c,
      { opacity: 0, x: 20 },
      {
        scrollTrigger: {
          trigger: c,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
        opacity: 1,
        x: 0,
        duration: 0.6,
        delay: i * 0.15,
        ease: 'power2.out',
      }
    );
  });

  // FAQ items stagger
  gsap.utils.toArray('.faq__item').forEach((item, i) => {
    gsap.fromTo(item,
      { opacity: 0, y: 16 },
      {
        scrollTrigger: {
          trigger: item,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
        opacity: 1,
        y: 0,
        duration: 0.5,
        delay: Math.min(i * 0.06, 0.6),
        ease: 'power2.out',
      }
    );
  });

  // Section headers reveal
  gsap.utils.toArray('.section__header').forEach((header) => {
    gsap.fromTo(header,
      { opacity: 0, y: 40 },
      {
        scrollTrigger: {
          trigger: header,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power2.out',
      }
    );
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   HOVER EFFECTS FOR STAT CARDS
   ═══════════════════════════════════════════════════════════════════════ */

document.querySelectorAll('.stat-card').forEach((card) => {
  card.addEventListener('mouseenter', () => {
    const fill = card.querySelector('.stat-card__bar-fill');
    if (fill) {
      fill.style.filter = 'brightness(1.1)';
    }
  });

  card.addEventListener('mouseleave', () => {
    const fill = card.querySelector('.stat-card__bar-fill');
    if (fill) {
      fill.style.filter = '';
    }
  });
});

/* ═══════════════════════════════════════════════════════════════════════
   LAZY LOADING (INTERSECTION OBSERVER)
   ═══════════════════════════════════════════════════════════════════════ */

if ('IntersectionObserver' in window) {
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        imageObserver.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });

  lazyImages.forEach((img) => imageObserver.observe(img));
}

/* ═══════════════════════════════════════════════════════════════════════
   PERFORMANCE: REDUCED MOTION DETECTION
   ═══════════════════════════════════════════════════════════════════════ */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (prefersReducedMotion.matches) {
  // Immediately reveal all elements without animation
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    el.style.transition = 'none';
    el.style.opacity    = '1';
    el.style.transform  = 'none';
    el.classList.add('revealed');
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   STAT CARD BAR ANIMATION VIA INTERSECTION OBSERVER
   ═══════════════════════════════════════════════════════════════════════ */

if ('IntersectionObserver' in window) {
  const statCards = document.querySelectorAll('.stat-card');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  statCards.forEach((card) => statObserver.observe(card));
}

/* ═══════════════════════════════════════════════════════════════════════
   COPY TO CLIPBOARD (FOR PHONE/EMAIL)
   ═══════════════════════════════════════════════════════════════════════ */

document.querySelectorAll('[data-copy]').forEach((el) => {
  el.addEventListener('click', async () => {
    const text = el.dataset.copy;
    try {
      await navigator.clipboard.writeText(text);
      const original = el.textContent;
      el.textContent = '¡Copiado!';
      setTimeout(() => { el.textContent = original; }, 2000);
    } catch (err) {
      // Silently fail
    }
  });
});

/* ═══════════════════════════════════════════════════════════════════════
   PAGE LOAD COMPLETE
   ═══════════════════════════════════════════════════════════════════════ */

window.addEventListener('load', () => {
  // Remove any loading states
  document.body.classList.add('loaded');

  // Force-start all CSS animations that might have been delayed
  document.querySelectorAll('.hero__content [data-reveal-delay]').forEach((el) => {
    el.style.animationPlayState = 'running';
  });
});
