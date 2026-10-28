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
      '.like-slot{margin:22px 0 8px;display:flex;flex-wrap:wrap;align-items:center;gap:14px}' +
      '.like-slot .sb-like{background:#5E1A26;border-color:#5E1A26;color:#fff;font-size:15px;padding:12px 20px}' +
      '.like-slot .sb-like svg{width:20px;height:20px}' +
      '.like-slot .sb-like:hover{background:#7A2433}' +
      '.like-slot .sb-like.on{background:#fff;color:#5E1A26}' +
      '.like-hint{font-family:Inter,sans-serif;font-size:13px;color:var(--muted,#8B7E6A)}' +
      '.like-hint a{color:inherit;border-bottom:1px solid currentColor}' +
      '.like-ovl-slot{position:absolute;top:14px;right:14px;z-index:5}' +
      '.sb-like.ovl{background:rgba(255,255,255,.94);border:0;color:#5E1A26;padding:9px 13px;font-size:14px;font-weight:500;box-shadow:0 2px 10px rgba(0,0,0,.18);border-radius:999px}' +
      '.sb-like.ovl svg{width:19px;height:19px}' +
      '.sb-like.ovl:hover{background:#fff;transform:scale(1.06)}' +
      '.sb-like.ovl .n{min-width:.6em;text-align:left}' +
      '@keyframes sbpulse{0%,100%{transform:scale(1)}50%{transform:scale(1.25)}}' +
      '.sb-like.ovl.hello svg{animation:sbpulse .9s ease 2}' +
      '.sb-like.float{position:fixed;left:24px;bottom:24px;z-index:900;background:#5E1A26;color:#fff;border:0;border-radius:999px;padding:13px 20px;font-size:15px;box-shadow:0 6px 24px rgba(0,0,0,.25);opacity:0;transform:translateY(20px);pointer-events:none;transition:opacity .3s,transform .3s}' +
      '.sb-like.float.show{opacity:1;transform:none;pointer-events:auto}' +
      '.sb-like.float.on{background:#fff;color:#5E1A26}' +
      '.sb-vote-band{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px 28px;margin:0 32px 28px;padding:20px 26px;background:#5E1A26;color:#F3EFE6}' +
      '.sb-vote-band b{font-family:"Cormorant Garamond",serif;font-weight:500;font-size:26px;display:block;line-height:1.1}' +
      '.sb-vote-band span{font-family:Inter,sans-serif;font-size:14px;opacity:.85}' +
      '.sb-vote-band a{font-family:Inter,sans-serif;font-size:13px;letter-spacing:.06em;color:#5E1A26;background:#F3EFE6;padding:11px 18px;white-space:nowrap}' +
      '.sb-vote-band .top{display:flex;gap:10px;align-items:center}' +
      '.sb-vote-band .top a{background:none;color:#F3EFE6;padding:0;letter-spacing:0;font-size:13px;opacity:.9;border-bottom:1px solid rgba(243,239,230,.4)}' +
      '@media(max-width:700px){.sb-like.float{left:12px;bottom:12px}.sb-vote-band{margin:0 16px 20px}}';
    document.head.appendChild(s);
  }

  function paint(btn, liked, n) {
    btn.classList.toggle('on', !!liked);
    btn.setAttribute('aria-pressed', liked ? 'true' : 'false');
    btn.querySelector('.n').textContent = n > 0 ? n : (btn.classList.contains('mini') ? '' : '0');
    btn.title = liked ? 'Kliknij, żeby cofnąć głos' : 'Podoba mi się to biuro';
    var lab = btn.querySelector('.lab'); if (lab) lab.textContent = liked ? 'Podoba Ci się' : 'Podoba mi się';
  }

  function make(slot, kind) {
    var slug = slot.getAttribute('data-like-slug');
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'sb-like' + (kind ? ' ' + kind : '');
    b.setAttribute('aria-label', 'Podoba mi się to biuro');
    b.innerHTML = HEART + (kind === 'ovl' ? '' : '<span class="lab">Podoba mi się</span>') + '<span class="n"></span>';
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
      if (getComputedStyle(art).position === 'static') art.style.position = 'relative';
      var sp = document.createElement('span'); sp.className = 'like-ovl-slot'; sp.setAttribute('data-like-slug', slug);
      art.appendChild(sp);
    });
    banner();
    var slots = Array.prototype.slice.call(document.querySelectorAll('[data-like-slug]')).filter(function (s) { return !s.querySelector('.sb-like'); });
    if (!slots.length) return;
    var btns = slots.map(function (s) { return [s, make(s, s.classList.contains('like-ovl-slot') ? 'ovl' : '')]; });
    // strona projektu: podpowiedź + pływający przycisk
    var main = slots.filter(function (s) { return s.classList.contains('like-slot'); })[0];
    if (main) {
      var hint = document.createElement('span'); hint.className = 'like-hint';
      hint.innerHTML = 'Najczęściej lubiane biura trafiają do <a href="ranking.html">rankingu czytelników</a>.';
      main.appendChild(hint);
      var fs = document.createElement('span'); fs.setAttribute('data-like-slug', main.getAttribute('data-like-slug'));
      document.body.appendChild(fs);
      var fb = make(fs, 'float'); btns.push([fs, fb]);
      var io = new IntersectionObserver(function (en) { fb.classList.toggle('show', !en[0].isIntersecting); });
      io.observe(main);
    }
    Promise.all([counts(), mine()]).then(function (res) {
      var c = res[0], m = res[1];
      btns.forEach(function (p) {
        var slug = p[0].getAttribute('data-like-slug'), n = (c[slug] || {}).total || 0;
        paint(p[1], m[slug], n);
        if (p[1].classList.contains('ovl') && !m[slug]) p[1].classList.add('hello');
        var art = p[0].closest('article'); if (art) art.dataset.likes = n;
      });
      document.dispatchEvent(new CustomEvent('sb-likes-ready'));
    });
  }

  function banner() {
    var bar = document.getElementById('filterBar');
    if (!bar || document.querySelector('.sb-vote-band')) return;
    var d = document.createElement('div'); d.className = 'sb-vote-band';
    d.innerHTML = '<div><b>Które biuro podoba Wam się najbardziej?</b><span>Klikajcie serduszko na zdjęciu. Z Waszych głosów powstaje ranking czytelników.</span></div><div class="top" id="sbTop"></div><a href="ranking.html">Zobacz ranking →</a>';
    bar.parentNode.insertBefore(d, bar);
    counts().then(function (c) {
      var names = {};
      document.querySelectorAll('article.project').forEach(function (a) {
        var l = a.querySelector('a[href*="projekt.html?id="]'), t = a.querySelector('.project-title');
        if (l && t) names[l.getAttribute('href').split('id=')[1]] = t.textContent.trim();
      });
      var top = Object.keys(c).filter(function (k) { return names[k] && c[k].total > 0; }).sort(function (a, b) { return c[b].total - c[a].total; }).slice(0, 3);
      var all = Object.keys(c).reduce(function (a, k) { return a + (c[k].total || 0); }, 0);
      if (all) d.querySelector('div span').textContent = 'Klikajcie serduszko na zdjęciu. Oddaliście już ' + all + ' ' + (all === 1 ? 'głos' : (all % 10 >= 2 && all % 10 <= 4 && (all % 100 < 12 || all % 100 > 14) ? 'głosy' : 'głosów')) + '.';
      if (top.length) document.getElementById('sbTop').innerHTML = '<span>Teraz prowadzą:</span>' + top.map(function (k, i) { return '<a href="projekt.html?id=' + k + '">' + (i + 1) + '. ' + names[k].replace(/[<>&]/g, '') + '</a>'; }).join('');
    });
  }

  window.SBLikes = { on: ON, scan: scan, counts: counts, mine: mine, voter: voter };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan); else scan();
})();
