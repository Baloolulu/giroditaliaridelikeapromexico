/* Giro d'Italia Ride Like a Pro México · comportamiento compartido */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.__reduceMotion = reduce;

  // Menú en celular
  var mb = document.querySelector('.menu-btn'), nav = document.querySelector('nav.main');
  if (mb && nav) {
    mb.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      mb.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { nav.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); }
    });
  }

  // Cuenta regresiva al 28 de febrero de 2027 (hora de CDMX)
  var el = document.getElementById('cuenta');
  if (el) {
    var evento = new Date('2027-02-28T00:00:00-06:00').getTime();
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var tick = function () {
      var s = Math.floor((evento - Date.now()) / 1000);
      if (s <= 0) { el.textContent = '¡Es hoy!'; return; }
      var d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), x = s % 60;
      el.innerHTML = d + '<i>d</i>' + pad(h) + '<i>h</i>' + pad(m) + '<i>m</i>' + pad(x) + '<i>s</i>';
    };
    tick(); setInterval(tick, 1000);
  }

  // Líneas de velocidad (eco del logo)
  var box = document.getElementById('speed');
  if (box && !reduce) {
    for (var i = 0; i < 16; i++) {
      var s = document.createElement('span');
      if (i % 3 === 0) s.className = 'w';
      s.style.top = (8 + Math.random() * 84) + '%';
      s.style.width = (40 + Math.random() * 180) + 'px';
      s.style.animationDuration = (2.2 + Math.random() * 3.5) + 's';
      s.style.animationDelay = (-Math.random() * 6) + 's';
      box.appendChild(s);
    }
  }

  // Barra de progreso en km + parallax del cierre
  var header = document.querySelector('header.site');
  var bar = document.getElementById('progBar'), km = document.getElementById('progKm');
  var finalBg = document.getElementById('finalBg');
  var ticking = false;
  function update() {
    var max = document.documentElement.scrollHeight - innerHeight;
    var p = max > 0 ? Math.min(1, scrollY / max) : 0;
    if (bar) bar.style.width = (p * 100) + '%';
    if (km) { km.style.left = 'max(70px, ' + (p * 100) + '%)'; km.textContent = p >= 0.995 ? 'META' : 'KM ' + Math.round(p * 120); }
    if (header) header.classList.toggle('scrolled', scrollY > 40);
    if (finalBg && !reduce) {
      var r = finalBg.parentNode.getBoundingClientRect();
      finalBg.style.transform = 'translate3d(0,' + ((r.top + r.height / 2 - innerHeight / 2) * -0.12) + 'px,0)';
    }
    ticking = false;
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  update();

  // Aparición al hacer scroll + contadores
  window.__reveal = function (root) {
    var items = (root || document).querySelectorAll('[data-rv]:not(.rv)');
    if (reduce || !('IntersectionObserver' in window)) {
      document.querySelectorAll('.bar i').forEach(function (b) { b.style.width = b.getAttribute('data-w'); });
      return;
    }
    var groups = new Map();
    items.forEach(function (it) {
      var parent = it.parentNode, idx = groups.get(parent) || 0;
      groups.set(parent, idx + 1);
      it.style.setProperty('--d', Math.min(idx, 6) * 0.08 + 's');
      it.classList.add('rv');
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var t = en.target;
        t.classList.add('in');
        var c = t.querySelector('[data-count]');
        if (c) countUp(c);
        var b = t.querySelector('.bar i');
        if (b) b.style.width = b.getAttribute('data-w');
        io.unobserve(t);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (it) { io.observe(it); });
  };
  function countUp(c) {
    var to = +c.getAttribute('data-count'), t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / 1200), e = 1 - Math.pow(1 - k, 3);
      c.textContent = Math.round(to * e);
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  window.__reveal();
})();
