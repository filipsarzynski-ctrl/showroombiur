/* Showroom Biur - serduszka „Lubię to” i ranking.
   Głosy zapisuje Supabase (region UE). Bez cookies: anonimowy identyfikator w localStorage.
   Konfiguracja: window.SB_LIKES = {url, key} w site-config.js. Bez konfiguracji przyciski się nie pokazują. */
(function () {
  'use strict';
  var CFG = window.SB_LIKES || {};
  var ON = !!(CFG.url && CFG.key);
  var CACHE_KEY = 'sb_like_counts_v1', CACHE_MS = 60 * 1000;

  function voter() {
    try {
      var v = localStorage.getItem('sb_voter');
      if (!v) {
        v = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() :
          'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); });
        localStorage.setItem('sb_voter', v);
      }
      return v;
    } catch (e) { return null; }
  }

  function rpc(fn, body) {
    return fetch(CFG.url.replace(/\/$/, '') + '/rest/v1/rpc/' + fn, {
      method: 'POST',
      headers: { 'apikey': CFG.key, 'Authorization': 'Bearer ' + CFG.key, 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  }

  var countsP = null, mineP = null;
  function counts(force) {
    if (!ON) return Promise.resolve({});
    if (!force) {
      try {
        var c = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
        if (c && Date.now() - c.t < CACHE_MS) return Promise.resolve(c.d);
      } catch (e) {}
      if (countsP) return countsP;
    }
    countsP = rpc('like_counts').then(function (rows) {
      var d = {};
      (rows || []).forEach(function (r) { d[r.slug] = { total: +r.total, last30: +r.last30 }; });
      try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), d: d })); } catch (e) {}
      return d;
    }).catch(function () { return {}; });
    return countsP;
  }
  function mine() {
    if (!ON) return Promise.resolve({});
    if (mineP) return mineP;
    var v = voter();
    mineP = v ? rpc('my_likes', { p_voter: v }).then(function (rows) {
      var m = {}; (rows || []).forEach(function (s) { m[typeof s === 'string' ? s : (s.my_likes || s.slug)] = true; }); return m;
    }).catch(function () { return {}; }) : Promise.resolve({});
    return mineP;
  }

  var HEART = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.6-9.1C.9 8 2.9 4.5 6.4 4.5c2.1 0 3.6 1.2 4.6 2.6.9-1.4 2.5-2.6 4.6-2.6 3.5 0 5.5 3.5 4 6.9-2.1 4.5-9.6 9.1-9.6 9.1z"/></svg>';

  function css() {
    if (document.getElementById('sb-like-css')) return;
    var s = document.createElement('style'); s.id = 'sb-like-css';
    s.textContent =
      '.sb-like{display:inline-flex;align-items:center;gap:8px;font-family:Inter,sans-serif;font-size:14px;line-height:1;padding:9px 14px;border:1px solid currentColor;background:transparent;color:inherit;cursor:pointer;transition:background .2s,color .2s}' +
      '.sb-like svg{fill:none;stroke:currentColor;stroke-width:1.6;transition:transform .2s}' +
      '.sb-like.on svg{fill:#C2405A;stroke:#C2405A}' +
      '.sb-like:hover svg{transform:scale(1.12)}' +
      '.sb-like .n{font-variant-numeric:tabular-nums}' +
      '.sb-like.mini{padding:0;border:0;font-size:13px;gap:5px;color:var(--muted,#8B7E6A)}' +
      '.sb-like.mini svg{width:15px;height:15px}' +
      '.sb-like.busy{opacity:.6;pointer-events:none}' +
      '.like-slot{margin:18px 0 6px}';
    document.head.appendChild(s);
  }

  function paint(btn, liked, n) {
    btn.classList.toggle('on', !!liked);
    btn.setAttribute('aria-pressed', liked ? 'true' : 'false');
    btn.querySelector('.n').textContent = n > 0 ? n : (btn.classList.contains('mini') ? '' : '0');
    btn.title = liked ? 'Kliknij, żeby cofnąć głos' : 'Podoba mi się to biuro';
    var lab = btn.querySelector('.lab'); if (lab) lab.textContent = liked ? 'Podoba Ci się' : 'Podoba mi się';
  }

  function make(slot, mini) {
    var slug = slot.getAttribute('data-like-slug');
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'sb-like' + (mini ? ' mini' : '');
    b.innerHTML = HEART + (mini ? '' : '<span class="lab">Podoba mi się</span>') + '<span class="n"></span>';
    b.addEventListener('click', function (ev) {
      ev.preventDefault(); ev.stopPropagation();
      var v = voter(); if (!v) return;
      b.classList.add('busy');
      rpc('toggle_like', { p_slug: slug, p_voter: v }).then(function (r) {
        document.querySelectorAll('.sb-like[data-s="' + slug + '"]').forEach(function (x) { paint(x, r.liked, r.total); });
        var art = slot.closest('article'); if (art) art.dataset.likes = r.total;
        try { sessionStorage.removeItem(CACHE_KEY); } catch (e) {}
      }).catch(function () {}).then(function () { b.classList.remove('busy'); });
    });
    b.setAttribute('data-s', slug);
    slot.appendChild(b);
    return b;
  }

  function scan() {
    if (!ON) return;
    css();
    // karty na stronie Biura
    document.querySelectorAll('article.project').forEach(function (art) {
      if (art.querySelector('[data-like-slug]')) return;
      var a = art.querySelector('a[href*="projekt.html?id="]'); if (!a) return;
      var slug = a.getAttribute('href').split('id=')[1];
      var meta = art.querySelector('.project-meta'); if (!meta) return;
      var sp = document.createElement('span'); sp.className = 'like-mini-slot'; sp.setAttribute('data-like-slug', slug);
      sp.style.marginLeft = '10px';
      meta.appendChild(sp);
    });
    var slots = Array.prototype.slice.call(document.querySelectorAll('[data-like-slug]')).filter(function (s) { return !s.querySelector('.sb-like'); });
    if (!slots.length) return;
    var btns = slots.map(function (s) { return [s, make(s, s.classList.contains('like-mini-slot'))]; });
    Promise.all([counts(), mine()]).then(function (res) {
      var c = res[0], m = res[1];
      btns.forEach(function (p) {
        var slug = p[0].getAttribute('data-like-slug'), n = (c[slug] || {}).total || 0;
        paint(p[1], m[slug], n);
        var art = p[0].closest('article'); if (art) art.dataset.likes = n;
      });
      document.dispatchEvent(new CustomEvent('sb-likes-ready'));
    });
  }

  window.SBLikes = { on: ON, scan: scan, counts: counts, mine: mine, voter: voter };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan); else scan();
})();
