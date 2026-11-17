/* Showroom Biur - statystyki ruchu (17.11.2026).
   1) Licznik bez cookies: każda odsłona trafia do Supabase (UE) bez IP i bez identyfikatora.
      Zapisujemy tylko adres strony, domenę, z której ktoś przyszedł, parametry utm, typ urządzenia
      i to, czy to pierwsza strona w wizycie (sessionStorage, znika po zamknięciu karty).
   2) Google Analytics 4 tylko po zgodzie (baner na dole strony). Bez zgody GA się nie ładuje.
   Zmiana decyzji: window.SBZgoda.open() (link w polityce prywatności). */
(function () {
  'use strict';
  var GA_ID = 'G-BQQFCXYSDD';
  var SB = { url: 'https://plomfudejyisiqucavqg.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsb21mdWRlanlpc2lxdWNhdnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxNjQ4OTUsImV4cCI6MjEwODc0MDg5NX0.2LOaPFSsbYELSTpCtlRyzl2iQlwMSoOsQLkpheShCJw' };
  var KEY = 'sb_zgoda_v1';
  if (window.__sbStats) return; window.__sbStats = true;

  var host = location.hostname;
  var LIVE = /(^|\.)showroombiur\.pl$/.test(host);
  var bot = /bot|crawl|spider|slurp|headless|lighthouse|preview/i.test(navigator.userAgent) || navigator.webdriver;

  /* ---------- 1. licznik bez cookies ---------- */
  function track() {
    if (!LIVE || bot) return;
    try {
      var q = new URLSearchParams(location.search);
      var ref = '';
      try { if (document.referrer) { var r = new URL(document.referrer).hostname.replace(/^www\./, ''); if (r !== host.replace(/^www\./, '')) ref = r; } } catch (e) {}
      var entry = false;
      try { if (!sessionStorage.getItem('sb_wizyta')) { sessionStorage.setItem('sb_wizyta', '1'); entry = true; } } catch (e) { entry = !!ref; }
      var w = Math.min(screen.width || 0, window.innerWidth || 9999);
      var dev = /iPad|Tablet/i.test(navigator.userAgent) || (w >= 600 && w < 1024 && 'ontouchstart' in window) ? 'tablet' : (w < 600 ? 'mobile' : 'desktop');
      var path = location.pathname + (location.pathname.indexOf('projekt.html') > -1 || location.pathname.indexOf('pracownia.html') > -1 ? (q.get('id') ? '?id=' + q.get('id') : '') : '');
      var body = JSON.stringify({ p_path: path || '/', p_ref: ref, p_src: q.get('utm_source') || '', p_med: q.get('utm_medium') || '',
        p_camp: q.get('utm_campaign') || '', p_dev: dev, p_entry: entry });
      fetch(SB.url + '/rest/v1/rpc/track_view', { method: 'POST', keepalive: true,
        headers: { 'apikey': SB.key, 'Authorization': 'Bearer ' + SB.key, 'Content-Type': 'application/json' }, body: body }).catch(function () {});
    } catch (e) {}
  }

  /* ---------- 2. Google Analytics po zgodzie ---------- */
  var gaOn = false;
  function loadGA() {
    if (gaOn || !LIVE) return; gaOn = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    gtag('js', new Date());
    gtag('config', GA_ID);
    var s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  var CSS = '.sbz{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:760px;margin:0 auto;background:#0F0F0E;color:#FBF8F2;'
    + 'padding:20px 22px;display:flex;gap:18px;align-items:center;flex-wrap:wrap;box-shadow:0 10px 40px rgba(0,0,0,.25);font-family:Inter,system-ui,sans-serif;font-size:14px;line-height:1.5}'
    + '.sbz p{flex:1 1 360px;margin:0}.sbz a{color:#E8B4C0;text-decoration:underline;text-underline-offset:3px}'
    + '.sbz .b{display:flex;gap:10px;flex-wrap:wrap}.sbz button{font-family:"JetBrains Mono",monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;'
    + 'padding:12px 18px;border:1px solid #FBF8F2;cursor:pointer;background:transparent;color:#FBF8F2}.sbz button.t{background:#5E1A26;border-color:#5E1A26}'
    + '.sbz button:focus-visible{outline:2px solid #E8B4C0;outline-offset:2px}';

  function banner() {
    if (document.getElementById('sbz')) return;
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    var d = document.createElement('div'); d.className = 'sbz'; d.id = 'sbz'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Zgoda na statystyki');
    d.innerHTML = '<p>Liczymy odsłony bez cookies. Jeśli się zgodzisz, użyjemy też Google Analytics, który zapisuje cookies i pomaga nam zrozumieć, '
      + 'które teksty i biura czytacie najchętniej. <a href="polityka-prywatnosci.html#cookies">Szczegóły</a></p>'
      + '<div class="b"><button type="button" class="n">Nie, dziękuję</button><button type="button" class="t">Zgadzam się</button></div>';
    d.querySelector('.t').onclick = function () { set('tak'); d.remove(); loadGA(); };
    d.querySelector('.n').onclick = function () { set('nie'); d.remove(); };
    document.body.appendChild(d);
  }

  window.SBZgoda = { open: function () {
    var was = get();
    try { localStorage.removeItem(KEY); } catch (e) {}
    if (was === 'tak') { // wycofanie zgody: usuń cookies GA
      document.cookie.split(';').forEach(function (c) { var n = c.split('=')[0].trim(); if (/^_ga/.test(n)) {
        document.cookie = n + '=; Max-Age=0; path=/; domain=.' + host.replace(/^www\./, ''); document.cookie = n + '=; Max-Age=0; path=/'; } });
    }
    banner();
  } };

  function start() {
    track();
    var z = get();
    if (z === 'tak') loadGA(); else if (z !== 'nie') banner();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
