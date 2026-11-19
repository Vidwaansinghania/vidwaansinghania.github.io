// Rating filter for the equity research page. The page lists every report without this file.
(function () {
  'use strict';
  document.querySelectorAll('.filters').forEach(function (group) {
    var list = group.parentNode.querySelector('[data-reps]');
    var cards = list.querySelectorAll('.rep');
    group.addEventListener('click', function (ev) {
      var b = ev.target.closest('button[data-filter]');
      if (!b) return;
      var f = b.getAttribute('data-filter');
      group.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      cards.forEach(function (c) { c.hidden = !(f === 'all' || c.getAttribute('data-rating') === f); });
    });
  });
})();
