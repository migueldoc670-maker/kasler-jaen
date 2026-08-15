(function () {
  'use strict';

  var RESERVA_EMAIL = 'kaslerjaen@gmail.com';
  var MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  var DIAS_SEMANA_INICIO_LUNES = 1;
  var resvState = { guests: 2, date: null, dateLabel: '', time: '' };
  var calView = { year: 0, month: 0 };

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

  function personIconSVG() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="7" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>';
  }

  function initGuestIcons() {
    var wrap = document.getElementById('guest-icons');
    var countEl = document.getElementById('guest-count');
    if (!wrap || !countEl) return;
    wrap.innerHTML = '';
    for (var n = 1; n <= 6; n++) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'guest-icon' + (n === resvState.guests ? ' is-active' : '');
      btn.setAttribute('data-n', n);
      btn.innerHTML = personIconSVG() + '<span>' + n + '</span>';
      btn.addEventListener('click', function () {
        resvState.guests = parseInt(this.getAttribute('data-n'), 10);
        countEl.textContent = resvState.guests;
        wrap.querySelectorAll('.guest-icon').forEach(function (b) {
          b.classList.toggle('is-active', parseInt(b.getAttribute('data-n'), 10) <= resvState.guests);
        });
      });
      wrap.appendChild(btn);
    }
    countEl.textContent = resvState.guests;
  }

  function renderCalendar() {
    var label = document.getElementById('cal-label');
    var grid = document.getElementById('cal-grid');
    if (!label || !grid) return;
    label.textContent = MESES[calView.month] + ' · ' + calView.year;
    grid.innerHTML = '';

    var today = new Date(); today.setHours(0, 0, 0, 0);
    var firstOfMonth = new Date(calView.year, calView.month, 1);
    var startOffset = (firstOfMonth.getDay() + 6) % 7; // lunes = 0
    var daysInMonth = new Date(calView.year, calView.month + 1, 0).getDate();
    var daysInPrevMonth = new Date(calView.year, calView.month, 0).getDate();

    for (var i = 0; i < startOffset; i++) {
      var prevDay = daysInPrevMonth - startOffset + i + 1;
      grid.appendChild(makeDayCell(prevDay, true, false, null));
    }
    for (var d = 1; d <= daysInMonth; d++) {
      var cellDate = new Date(calView.year, calView.month, d);
      var disabled = cellDate < today;
      grid.appendChild(makeDayCell(d, false, disabled, cellDate));
    }
  }

  function makeDayCell(num, muted, disabled, dateObj) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = num;
    btn.className = 'cal-day' + (muted ? ' is-muted' : '') + (disabled ? ' is-disabled' : '');
    if (dateObj) {
      var iso = dateObj.getFullYear() + '-' + String(dateObj.getMonth() + 1).padStart(2, '0') + '-' + String(dateObj.getDate()).padStart(2, '0');
      if (resvState.date === iso) btn.classList.add('is-selected');
      btn.addEventListener('click', function () {
        resvState.date = iso;
        resvState.dateLabel = num + ' de ' + MESES[calView.month] + ' de ' + calView.year;
        document.querySelectorAll('.cal-day').forEach(function (c) { c.classList.remove('is-selected'); });
        btn.classList.add('is-selected');
      });
    }
    return btn;
  }

  function initCalendar() {
    var grid = document.getElementById('cal-grid');
    if (!grid) return;
    var now = new Date();
    calView.year = now.getFullYear();
    calView.month = now.getMonth();
    renderCalendar();

    var prevBtn = document.getElementById('cal-prev');
    var nextBtn = document.getElementById('cal-next');
    if (prevBtn) prevBtn.addEventListener('click', function () {
      var now2 = new Date();
      if (calView.year === now2.getFullYear() && calView.month === now2.getMonth()) return;
      calView.month--; if (calView.month < 0) { calView.month = 11; calView.year--; }
      renderCalendar();
    });
    if (nextBtn) nextBtn.addEventListener('click', function () {
      calView.month++; if (calView.month > 11) { calView.month = 0; calView.year++; }
      renderCalendar();
    });
  }

  function initTimeSlots() {
    var comida = document.getElementById('slots-comida');
    var cena = document.getElementById('slots-cena');
    if (!comida || !cena) return;
    var comidaHoras = ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30'];
    var cenaHoras = ['20:30', '21:00', '21:30', '22:00', '22:30', '23:00'];

    function fill(container, horas) {
      horas.forEach(function (h) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'time-slot';
        btn.textContent = h;
        btn.addEventListener('click', function () {
          resvState.time = h;
          document.querySelectorAll('.time-slot').forEach(function (s) { s.classList.remove('is-selected'); });
          btn.classList.add('is-selected');
        });
        container.appendChild(btn);
      });
    }
    fill(comida, comidaHoras);
    fill(cena, cenaHoras);
  }

  function initResvWidget() {
    if (!document.getElementById('guest-icons')) return;
    initGuestIcons();
    initCalendar();
    initTimeSlots();
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
        fecha: resvState.dateLabel,
        hora: resvState.time,
        comensales: resvState.guests + (resvState.guests === 1 ? ' persona' : ' personas'),
        zona: zonaInput ? zonaInput.value : 'Comedor',
        nombre: form.nombre.value.trim(),
        telefono: form.telefono.value.trim(),
        alergias: form.alergias.value.trim()
      };
      if (!data.fecha || !data.hora) {
        alert('Por favor, selecciona una fecha y una hora en el calendario.');
        return;
      }
      if (!data.nombre || !data.telefono) {
        form.reportValidity();
        return;
      }
      var email = buildReservaEmail(data);
      var url = 'mailto:' + RESERVA_EMAIL + '?subject=' + encodeURIComponent(email.subject) + '&body=' + encodeURIComponent(email.body);
      window.location.href = url;
    });
  }

  function initCartaTabs() {
    var tabBtns = document.querySelectorAll('.carta-tab-btn');
    var panels = document.querySelectorAll('.carta-panel');
    if (!tabBtns.length || !panels.length) return;

    function activatePanel(id, doScroll) {
      panels.forEach(function (p) { p.classList.toggle('is-active', p.id === id); });
      tabBtns.forEach(function (b) { b.classList.toggle('is-active', b.dataset.target === id); });
      if (doScroll) {
        var el = document.getElementById(id);
        if (el) {
          var top = el.getBoundingClientRect().top + window.pageYOffset - 90;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      }
    }

    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        activatePanel(btn.dataset.target, true);
        history.replaceState(null, '', '#' + btn.dataset.target);
      });
    });

    window.addEventListener('hashchange', function () {
      var id = location.hash.replace('#', '');
      if (id && document.querySelector('.carta-panel#' + id)) {
        activatePanel(id, true);
      }
    });

    var initial = location.hash.replace('#', '');
    if (!initial || !document.querySelector('.carta-panel#' + initial)) {
      initial = panels[0].id;
    }
    activatePanel(initial, false);

    panels.forEach(function (panel) {
      var subBtns = panel.querySelectorAll('.carta-subtab-btn');
      var cats = panel.querySelectorAll('.carta-full-cat');
      if (!subBtns.length || !cats.length) return;

      function activateCat(catId) {
        cats.forEach(function (c) { c.classList.toggle('is-active', c.dataset.cat === catId); });
        subBtns.forEach(function (b) { b.classList.toggle('is-active', b.dataset.cat === catId); });
      }

      subBtns.forEach(function (btn) {
        btn.addEventListener('click', function () { activateCat(btn.dataset.cat); });
      });

      activateCat(cats[0].dataset.cat);
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
    safe(initResvWidget, 'initResvWidget');
    safe(initReservaForm, 'initReservaForm');
    safe(initCartaTabs, 'initCartaTabs');
    safe(initScrollAnimations, 'initScrollAnimations');
  });
})();
