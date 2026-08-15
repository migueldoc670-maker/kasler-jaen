(function () {
  'use strict';

  var RESERVA_EMAIL = 'kaslerjaen@gmail.com';

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn('[Kasler]', name, 'failed:', e); }
  }

  function initYear() {
    var el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  function initScrollProgress() {
    var bar = document.getElementById('scroll-progress');
    if (!bar) return;
    function onScroll() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
      bar.style.width = pct + '%';
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function initHeaderScroll() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    function onScroll() {
      if (window.scrollY > 30) header.classList.add('is-scrolled');
      else header.classList.remove('is-scrolled');
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function initMobileNav() {
    var toggle = document.querySelector('.nav-toggle');
    var panel = document.querySelector('.mobile-nav');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', function () {
      var open = toggle.classList.toggle('is-open');
      panel.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    panel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        toggle.classList.remove('is-open');
        panel.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }

  function initActiveNav() {
    var links = document.querySelectorAll('.main-nav a[href^="#"]');
    var sections = [];
    links.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var sec = document.getElementById(id);
      if (sec) sections.push({ link: a, sec: sec });
    });
    if (!sections.length || !('IntersectionObserver' in window)) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var match = sections.find(function (s) { return s.sec === entry.target; });
        if (!match) return;
        if (entry.isIntersecting) {
          sections.forEach(function (s) { s.link.classList.remove('is-active'); });
          match.link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { obs.observe(s.sec); });
  }

  function initReveal() {
    var items = document.querySelectorAll('[data-reveal]');
    if (!items.length || !('IntersectionObserver' in window)) return;
    items.forEach(function (el) { el.classList.add('js-armed'); });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -80px 0px' });
    items.forEach(function (el) { obs.observe(el); });
    setTimeout(function () {
      items.forEach(function (el) { el.classList.add('is-visible'); });
    }, 6000);
  }

  function initHeroSplit() {
    var h1 = document.querySelector('.hero h1[data-split]');
    if (!h1) return;
    var html = h1.innerHTML;
    h1.innerHTML = '<span class="split-line" style="display:block;overflow:hidden;"><span class="split-inner" style="display:block; transform:translateY(115%); transition:transform 1.1s cubic-bezier(0.16,1,0.3,1);">' + html + '</span></span>';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        var inner = h1.querySelector('.split-inner');
        if (inner) setTimeout(function () { inner.style.transform = 'translateY(0)'; }, 250);
      });
    });
  }

  function initScrollAnimations() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll('.gal-item').forEach(function (item, i) {
      gsap.set(item, { y: 24, opacity: 0.001 });
      gsap.to(item, {
        y: 0, opacity: 1, duration: 0.75, delay: (i % 3) * 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: item, start: 'top 92%' }
      });
    });

    document.querySelectorAll('.review-card').forEach(function (card, i) {
      gsap.set(card, { y: 22, opacity: 0.001 });
      gsap.to(card, {
        y: 0, opacity: 1, duration: 0.7, delay: i * 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: card, start: 'top 92%' }
      });
    });

    var conceptoImg = document.querySelector('.concepto-media img');
    if (conceptoImg) {
      gsap.fromTo(conceptoImg, { yPercent: -5 }, {
        yPercent: 5, ease: 'none',
        scrollTrigger: { trigger: '.concepto', start: 'top bottom', end: 'bottom top', scrub: true }
      });
    }
  }

  function buildReservaEmail(data) {
    var subject = 'Reserva de mesa — ' + data.nombre;
    var lines = [
      'Hola Kasler, quiero reservar mesa:',
      '',
      'Fecha: ' + data.fecha,
      'Hora: ' + data.hora,
      'Comensales: ' + data.comensales,
      'Zona: ' + data.zona,
      'Nombre: ' + data.nombre,
      'Teléfono: ' + data.telefono
    ];
    if (data.alergias) lines.push('Alergias/intolerancias: ' + data.alergias);
    return { subject: subject, body: lines.join('\n') };
  }

  function initReservaForm() {
    var form = document.getElementById('reserva-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var zonaInput = form.querySelector('input[name="zona"]:checked');
      var data = {
        fecha: form.fecha.value,
        hora: form.hora.value,
        comensales: form.comensales.value,
        zona: zonaInput ? zonaInput.value : 'Comedor',
        nombre: form.nombre.value.trim(),
        telefono: form.telefono.value.trim(),
        alergias: form.alergias.value.trim()
      };
      if (!data.fecha || !data.hora || !data.nombre || !data.telefono) {
        form.reportValidity();
        return;
      }
      var email = buildReservaEmail(data);
      var url = 'mailto:' + RESERVA_EMAIL + '?subject=' + encodeURIComponent(email.subject) + '&body=' + encodeURIComponent(email.body);
      window.location.href = url;
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    safe(initYear, 'initYear');
    safe(initScrollProgress, 'initScrollProgress');
    safe(initHeaderScroll, 'initHeaderScroll');
    safe(initMobileNav, 'initMobileNav');
    safe(initActiveNav, 'initActiveNav');
    safe(initReveal, 'initReveal');
    safe(initHeroSplit, 'initHeroSplit');
    safe(initReservaForm, 'initReservaForm');
    safe(initScrollAnimations, 'initScrollAnimations');
  });
})();
