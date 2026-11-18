/* Showroom Biur - pływające menu strony głównej (pojawia się po zjechaniu w dół).
   Skróty do sekcji tej strony + podstrony + powrót na górę. Bez cookies, bez bibliotek. */
(function () {
  if (window.__sbDock) return; window.__sbDock = 1;
  var SECTIONS = [
    ['featured', 'Film'],
    ['archive', 'Biura'],
    ['index', 'Indeks'],
    ['studios', 'Pracownie'],
    ['newsletter', 'Newsletter']
  ].filter(function (s) { return document.getElementById(s[0]); });
  var PAGES = [
    ['ranking.html', 'Ranking czytelników'],
    ['rynek-biurowy.html', 'Rynek biurowy'],
    ['trendy.html', 'Trendy'],
    ['wyposazenie.html', 'Wyposażenie'],
    ['workplace.html', 'Workplace'],
    ['biuro-roku-2026.html', 'Biuro Roku'],
    ['o-magazynie.html', 'O magazynie'],
    ['dodaj-biuro.html', 'Dodaj biuro →']
  ];
  var css = '' +
    '.sb-dock{position:fixed;left:50%;bottom:22px;transform:translate(-50%,140%);z-index:9980;display:flex;align-items:center;gap:2px;' +
    'background:rgba(94,26,38,.96);color:#F3EFE6;border-radius:999px;padding:5px;box-shadow:0 10px 30px rgba(0,0,0,.22);' +
    'font-family:Inter,system-ui,sans-serif;font-size:13px;transition:transform .35s ease,opacity .35s;opacity:0;max-width:calc(100vw - 150px)}' +
    '.sb-dock.on{transform:translate(-50%,0);opacity:1}' +
    '.sb-dock a,.sb-dock button{all:unset;cursor:pointer;padding:8px 13px;border-radius:999px;white-space:nowrap;color:inherit;line-height:1}' +
    '.sb-dock a:hover,.sb-dock button:hover{background:rgba(243,239,230,.14)}' +
    '.sb-dock a.act{background:#F3EFE6;color:#5E1A26}' +
    '.sb-dock .sep{width:1px;height:18px;background:rgba(243,239,230,.3);margin:0 4px}' +
    '.sb-dock .cur{display:none}' +
    '.sb-dock-pop{position:fixed;left:50%;bottom:76px;transform:translateX(-50%);z-index:9981;background:#F3EFE6;color:#2B2623;border:1px solid rgba(43,38,35,.15);' +
    'box-shadow:0 14px 40px rgba(0,0,0,.18);padding:10px;display:none;min-width:240px;font-family:Inter,system-ui,sans-serif;font-size:14px}' +
    '.sb-dock-pop.open{display:block}' +
    '.sb-dock-pop h6{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#8A7F78;margin:8px 10px 4px;font-weight:500}' +
    '.sb-dock-pop a{display:block;padding:9px 10px;color:inherit;text-decoration:none}' +
    '.sb-dock-pop a:hover{background:rgba(94,26,38,.08)}' +
    '.sb-dock-pop .sec{display:none}' +
    '@media(max-width:760px){.sb-dock{left:12px;transform:translate(0,140%);max-width:none;right:auto}.sb-dock.on{transform:translate(0,0)}' +
    '.sb-dock .s{display:none}.sb-dock .cur{display:inline-block;max-width:44vw;overflow:hidden;text-overflow:ellipsis}' +
    '.sb-dock-pop{left:12px;right:12px;transform:none;bottom:70px}.sb-dock-pop .sec{display:block}}' +
    '@media print{.sb-dock,.sb-dock-pop{display:none!important}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var dock = document.createElement('nav'); dock.className = 'sb-dock'; dock.setAttribute('aria-label', 'Szybka nawigacja');
  var h = '<button class="cur" type="button" aria-haspopup="true">☰ <span>Spis</span></button>';
  SECTIONS.forEach(function (s) { h += '<a class="s" href="#' + s[0] + '" data-id="' + s[0] + '">' + s[1] + '</a>'; });
  h += '<span class="sep s"></span><button class="more" type="button" aria-haspopup="true">Więcej ▾</button>' +
       '<button class="top" type="button" aria-label="Wróć na górę">↑</button>';
  dock.innerHTML = h;
  var pop = document.createElement('div'); pop.className = 'sb-dock-pop'; pop.setAttribute('role', 'menu');
  var ph = '<div class="sec"><h6>Na tej stronie</h6>';
  SECTIONS.forEach(function (s) { ph += '<a href="#' + s[0] + '" data-id="' + s[0] + '">' + s[1] + '</a>'; });
  ph += '</div><h6>Działy</h6>';
  PAGES.forEach(function (p) { ph += '<a href="' + p[0] + '">' + p[1] + '</a>'; });
  pop.innerHTML = ph;
  document.body.appendChild(dock); document.body.appendChild(pop);

  // strona ma ponad 100 tys. px - płynne przewijanie bywa przerywane, więc na dalekie skoki przeskakujemy od razu
  function jump(y) {
    var far = Math.abs(y - window.pageYOffset) > 2500;
    window.scrollTo({ top: y, behavior: far ? 'auto' : 'smooth' });
  }
  function go(id) {
    var t = document.getElementById(id); if (!t) return;
    jump(t.getBoundingClientRect().top + window.pageYOffset - 70);
    pop.classList.remove('open');
  }
  function onLink(e) {
    var a = e.target.closest('a[data-id]'); if (!a) return;
    e.preventDefault(); e.stopPropagation(); go(a.getAttribute('data-id'));
  }
  dock.addEventListener('click', onLink, true); pop.addEventListener('click', onLink, true);
  dock.querySelector('.top').addEventListener('click', function () { pop.classList.remove('open'); jump(0); });
  function toggle(e) { e.stopPropagation(); pop.classList.toggle('open'); }
  dock.querySelector('.more').addEventListener('click', toggle);
  dock.querySelector('.cur').addEventListener('click', toggle);
  document.addEventListener('click', function (e) { if (!pop.contains(e.target)) pop.classList.remove('open'); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') pop.classList.remove('open'); });

  var curLabel = dock.querySelector('.cur span');
  function update() {
    var y = window.pageYOffset, vh = window.innerHeight;
    dock.classList.toggle('on', y > vh * 0.8);
    if (y <= vh * 0.8) pop.classList.remove('open');
    var act = null;
    SECTIONS.forEach(function (s) { var el = document.getElementById(s[0]); if (el && el.getBoundingClientRect().top < vh * 0.4) act = s; });
    dock.querySelectorAll('a[data-id]').forEach(function (a) { a.classList.toggle('act', !!act && a.getAttribute('data-id') === act[0]); });
    curLabel.textContent = act ? act[1] : 'Spis';
  }
  var tick = false;
  window.addEventListener('scroll', function () { if (!tick) { tick = true; setTimeout(function () { tick = false; update(); }, 60); } }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
