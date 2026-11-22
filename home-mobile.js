/* Showroom Biur - strona główna na telefonie (22.11.2026).
   339 biur w jednej kolumnie dawało stronę długą na ponad 200 ekranów. Na wąskim ekranie pokazujemy 12 biur
   i przycisk „Pokaż kolejne”, a indeks zwijamy do 15 pozycji. Filtry i sortowanie działają jak wcześniej. */
(function () {
  'use strict';
  var mq = window.matchMedia('(max-width: 880px)');
  var grid = document.querySelector('.archive-grid');
  if (!grid) return;
  var STEP = 12, limit = STEP, btn = null, busy = false;

  var st = document.createElement('style');
  st.textContent = '.project.m-hid,.index-row.m-hid{display:none!important}' +
    '.sb-more{display:block;width:100%;box-sizing:border-box;margin:40px 0 0;padding:17px 20px;background:#5E1A26;color:#F3EFE6;border:0;font-family:Inter,sans-serif;font-size:16px;font-weight:500;text-align:center;cursor:pointer}' +
    '.sb-more.o{background:transparent;color:#1B1513;border:1px solid #1B1513;margin:22px 0 0}' +
    '@media(max-width:880px){.index-row .ct,.index-row .ds{font-size:13px}}';
  document.head.appendChild(st);

  function cards() { return Array.prototype.filter.call(grid.children, function (c) { return c.classList && c.classList.contains('project') && !c.classList.contains('filter-hidden'); }); }

  function apply() {
    if (busy) return; busy = true;
    var on = mq.matches, vis = cards();
    Array.prototype.forEach.call(grid.querySelectorAll('.project.m-hid'), function (c) { if (!on || c.classList.contains('filter-hidden')) c.classList.remove('m-hid'); });
    vis.forEach(function (c, i) {
      var hide = on && i >= limit;
      if (c.classList.contains('m-hid') !== hide) c.classList.toggle('m-hid', hide);
      if (!hide && !c.classList.contains('in')) c.classList.add('in');
    });
    var left = on ? Math.max(0, vis.length - limit) : 0;
    if (!btn) {
      btn = document.createElement('button'); btn.type = 'button'; btn.className = 'sb-more';
      btn.addEventListener('click', function () { limit += STEP; apply(); });
      grid.parentNode.insertBefore(btn, grid.nextSibling);
    }
    btn.hidden = left === 0;
    btn.textContent = 'Pokaż kolejne biura (zostało ' + left + ')';
    setTimeout(function () { busy = false; }, 0);
  }

  var t = null;
  new MutationObserver(function () { if (busy) return; clearTimeout(t); t = setTimeout(apply, 60); })
    .observe(grid, { childList: true, subtree: false, attributes: true, attributeFilter: ['class'] });
  Array.prototype.forEach.call(grid.children, function (c) {
    new MutationObserver(function () { if (busy) return; clearTimeout(t); t = setTimeout(apply, 60); }).observe(c, { attributes: true, attributeFilter: ['class'] });
  });
  if (mq.addEventListener) mq.addEventListener('change', apply); else mq.addListener(apply);
  apply();

  /* indeks: 15 pozycji i przycisk */
  var rows = document.querySelectorAll('.index-wrap .index-row');
  if (rows.length > 20) {
    var ib = document.createElement('button'); ib.type = 'button'; ib.className = 'sb-more o';
    ib.textContent = 'Pokaż cały indeks (' + rows.length + ' biur)';
    var open = false;
    var idx = function () {
      var on = mq.matches && !open;
      Array.prototype.forEach.call(rows, function (r, i) { r.classList.toggle('m-hid', on && i >= 15); });
      ib.hidden = !on;
    };
    ib.addEventListener('click', function () { open = true; idx(); });
    var last = rows[rows.length - 1];
    last.parentNode.insertBefore(ib, last.nextSibling);
    if (mq.addEventListener) mq.addEventListener('change', idx); else mq.addListener(idx);
    idx();
  }
})();
