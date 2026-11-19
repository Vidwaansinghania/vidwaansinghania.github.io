// Report pages that spread out as you scroll to them, section highlighting, theme toggle.
// The page is complete without this file; the pages then sit spread out.
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  var header = document.querySelector('[data-header]');
  var hero = document.querySelector('[data-hero]');
  var fan = document.querySelector('[data-fan]');
  var ticking = false;

  function update() {
    ticking = false;
    var y = window.scrollY;
    if (y > 8) header.setAttribute('data-scrolled', ''); else header.removeAttribute('data-scrolled');
    // Header keeps the hero colour until the hero has passed under it.
    if (hero) header.classList.toggle('tone-hero', hero.getBoundingClientRect().bottom > header.offsetHeight);
    // Pages start stacked and spread out between entering the viewport and reaching its middle.
    if (fan) {
      if (reduce.matches) { fan.style.setProperty('--t', 1); return; }
      var r = fan.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = (vh - r.top) / (vh * 0.55);
      p = Math.max(0, Math.min(1, p));
      var eased = 1 - Math.pow(1 - p, 3);
      fan.style.setProperty('--t', eased.toFixed(3));
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  // The corridor of reports in the hero: drag, wheel, arrow keys, a slow drift, and the
  // scroll position nudges it. Without this the row sits still and every cover is still a link.
  var hall = document.querySelector('[data-hall]');
  var ring = hall && hall.querySelector('[data-ring]');
  if (ring) (function () {
    var cards = ring.querySelectorAll('.ring__card');
    var hs = getComputedStyle(hall);
    var n = cards.length;
    var step = parseFloat(hs.getPropertyValue('--step')) || 6;     // degrees between neighbours, set in the CSS
    var reach = parseFloat(hs.getPropertyValue('--reach')) || 60;  // cards beyond this angle from the front are hidden
    var phone = window.matchMedia('(max-width: 40rem)'), onPhone = false;
    var now = document.querySelector('[data-hall-now]');
    var a = 0, v = 0, offset = reduce.matches ? 0 : 34, last = -1, shown = '';
    var down = false, captured = false, moved = 0, lastX = 0, lastT = 0, visible = true, lastScroll = window.scrollY, idle = 0;
    var drift = reduce.matches ? 0 : -2;   // degrees per second
    cards.forEach(function (c) { c.firstElementChild.tabIndex = -1; });

    function front() { return ((Math.round(-(a + offset) / step) % n) + n) % n; }
    function caption() {
      var el = cards[front()].firstElementChild;
      var t = el.getAttribute('data-label') || '';
      if (t !== shown && now) { now.textContent = t; shown = t; }
    }
    // Every report sits on a long loop; only the ones within --reach degrees of the front are drawn,
    // fading out at the edges, and the rest slide in as you move.
    function paint() {
      if (phone.matches) {
        if (!onPhone) { cards.forEach(function (c) { c.style.opacity = ''; c.style.visibility = ''; }); onPhone = true; }
        return;
      }
      onPhone = false;
      var s = a + offset;
      for (var i = 0; i < n; i++) {
        var w = (((i + s / step + n / 2) % n) + n) % n - n / 2;
        var ang = w * step, o = Math.max(0, Math.min(1, (reach - Math.abs(ang)) / 10));
        var el = cards[i];
        el.style.setProperty('--ang', ang.toFixed(2) + 'deg');
        el.style.opacity = o.toFixed(2);
        el.style.visibility = o > 0 ? 'visible' : 'hidden';
      }
      caption();
    }

    function frame(t) {
      if (last < 0) last = t;
      var dt = Math.min(0.05, (t - last) / 1000); last = t;
      if (visible && !document.hidden) {
        if (!down) {
          a += v * dt;
          v *= Math.pow(0.04, dt);          // glide to a stop after a flick
          idle += dt;
          if (idle > 1.5) a += drift * dt;  // then drift
        }
        offset *= Math.pow(0.0035, dt);     // arrival: the row settles in from one side
        if (Math.abs(offset) < 0.01) offset = 0;
        paint();
      }
      requestAnimationFrame(frame);
    }

    var k = function () { return 95 / hall.clientWidth; };   // degrees per pixel dragged
    hall.addEventListener('pointerdown', function (e) {
      if (e.button || phone.matches) return;
      down = true; moved = 0; lastX = e.clientX; lastT = e.timeStamp; v = 0; idle = 0;
      captured = false;
    });
    hall.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - lastX, dtm = Math.max(1, e.timeStamp - lastT);
      moved += Math.abs(dx);
      // Capture the pointer only once it is a real drag. Capturing on press sends the click to the
      // row instead of the cover under the cursor, and the covers stop opening.
      if (!captured && moved > 6) {
        captured = true; hall.classList.add('is-dragging');
        try { hall.setPointerCapture(e.pointerId); } catch (x) {}
      }
      a += dx * k();
      v = (dx * k()) / (dtm / 1000) * 0.6 + v * 0.4;
      lastX = e.clientX; lastT = e.timeStamp; idle = 0;
    });
    document.addEventListener('selectstart', function (e) { if (down) e.preventDefault(); });
    function up() { down = false; hall.classList.remove('is-dragging'); idle = 0; }
    hall.addEventListener('pointerup', up);
    hall.addEventListener('pointercancel', up);
    hall.addEventListener('click', function (e) { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
    // A tilted, moving row does not always hand the click to the cover under the pointer; when it
    // lands on the row itself, open the cover whose outline holds the pointer (nearest centre wins).
    hall.addEventListener('click', function (e) {
      if (e.defaultPrevented || moved > 6 || phone.matches || e.target.closest('a')) return;
      var best = null, bd = 1e9;
      cards.forEach(function (c) {
        if (c.style.visibility === 'hidden') return;
        var r = c.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
        var d = Math.abs(e.clientX - (r.left + r.right) / 2);
        if (d < bd) { bd = d; best = c; }
      });
      if (best) best.firstElementChild.click();
    });
    hall.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { e.preventDefault(); a -= e.deltaX * 0.06; idle = 0; v = 0; }
    }, { passive: false });
    hall.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); a = Math.round(a / step) * step + step; v = 0; idle = 0; }
      else if (e.key === 'ArrowRight') { e.preventDefault(); a = Math.round(a / step) * step - step; v = 0; idle = 0; }
      else if (e.key === 'Enter') { var l = cards[front()].firstElementChild; if (l) l.click(); }
    });
    window.addEventListener('scroll', function () {
      var y = window.scrollY; if (visible) a += (y - lastScroll) * 0.035; lastScroll = y;
    }, { passive: true });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { rootMargin: '100px' }).observe(hall);
    }
    paint();
    requestAnimationFrame(frame);
  })();

  // Mark the nav link for the section in view.
  var links = {};
  document.querySelectorAll('.nav a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var a = links[e.target.id];
        if (!a) return;
        if (e.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].removeAttribute('aria-current'); });
          a.setAttribute('aria-current', 'true');
        } else if (a.getAttribute('aria-current')) {
          a.removeAttribute('aria-current');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) sio.observe(s);
    });
  }

  // Theme toggle. Follows the system until the visitor picks one.
  var toggle = document.querySelector('[data-theme-toggle]');
  var systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  function current() { return root.dataset.theme || (systemDark.matches ? 'dark' : 'light'); }
  function label() { toggle.setAttribute('aria-label', current() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'); }
  if (toggle) {
    label();
    toggle.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) {}
      label();
    });
    if (systemDark.addEventListener) systemDark.addEventListener('change', label);
  }
})();
