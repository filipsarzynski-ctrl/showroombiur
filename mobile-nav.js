/* Showroom Biur — universal mobile hamburger menu */
(function(){
  'use strict';

  var css = `
.so-mobile-toggle{display:none;background:transparent;border:none;cursor:pointer;padding:8px;margin-left:auto;}
.so-mobile-toggle .bar{display:block;width:24px;height:1.5px;background:var(--ink, #0F0F0E);margin:5px 0;transition:transform 0.3s, opacity 0.3s;}
.so-mobile-toggle.open .bar:nth-child(1){transform:translateY(6.5px) rotate(45deg);}
.so-mobile-toggle.open .bar:nth-child(2){opacity:0;}
.so-mobile-toggle.open .bar:nth-child(3){transform:translateY(-6.5px) rotate(-45deg);}

@media (max-width: 1360px){
  .nav{padding:14px 18px !important;}
  .nav-brand{font-size:18px !important;}
  .so-mobile-toggle{display:block;}
  .nav-links{
    position:fixed;
    top:54px; left:0; right:0;
    background:var(--paper, #FBF8F2);
    border-bottom:1px solid var(--line, #D9D2C2);
    flex-direction:column !important;
    gap:0 !important;
    padding:0 !important;
    max-height:0;
    overflow:hidden;
    transition:max-height 0.35s cubic-bezier(0.2,0,0.2,1);
    z-index:99;
  }
  .nav-links.open{max-height:80vh;overflow-y:auto;}
  .nav-links a{
    padding:18px 24px !important;
    border-bottom:1px solid var(--line, #D9D2C2);
    font-size:13px !important;
    letter-spacing:0.16em !important;
    width:100%;
    display:block;
  }
  .nav-links a:last-child{border-bottom:none;}
}
`;
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  function init(){
    var nav = document.getElementById('nav') || document.querySelector('.nav');
    if (!nav) return;
    var links = nav.querySelector('.nav-links');
    if (!links) return;
    if (nav.querySelector('.so-mobile-toggle')) return;

    var btn = document.createElement('button');
    btn.className = 'so-mobile-toggle';
    btn.setAttribute('aria-label', 'Menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span class="bar"></span><span class="bar"></span><span class="bar"></span>';
    nav.appendChild(btn);

    btn.addEventListener('click', function(){
      var isOpen = links.classList.toggle('open');
      btn.classList.toggle('open', isOpen);
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    Array.prototype.forEach.call(links.querySelectorAll('a'), function(a){
      a.addEventListener('click', function(){
        links.classList.remove('open');
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* Showroom Biur — zdjęcia, które się nie wczytają, nie zostawiają pustej ramki z opisem alt */
document.addEventListener('error', function (e) {
  var el = e.target;
  if (el && el.tagName === 'IMG' && !el.closest('.project-img')) el.style.visibility = 'hidden';
}, true);

/* statystyki ruchu (licznik bez cookies + Google Analytics po zgodzie), 17.11.2026 */
(function(){ if (window.__sbStatsLoader) return; window.__sbStatsLoader = true;
  var s = document.createElement('script'); s.src = 'statystyki.js?v=1711'; s.defer = true; document.head.appendChild(s); })();

/* Showroom Biur - ikony Facebooka i Instagrama w menu i w stopce każdej strony (19.11.2026) */
(function () {
  if (window.__sbSoc) return; window.__sbSoc = 1;
  var FB = 'https://www.facebook.com/profile.php?id=61595666232694', IG = 'https://www.instagram.com/showroombiur.pl/';
  var I_FB = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.700 1.3-3.700 3.800v2.400H8.200v3h2.500V21z"/></svg>', I_IG = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3.5" y="3.500" width="17" height="17" rx="4.500"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.800" r="1" fill="currentColor" stroke="none"/></svg>';
  var st = document.createElement('style');
  st.textContent = '.sb-soc-nav{display:inline-flex;align-items:center;gap:4px;margin-left:6px}' +
    '.nav .nav-links .sb-soc-nav a{display:inline-flex!important;align-items:center;justify-content:center;width:34px!important;height:34px;padding:0!important;border:0!important;opacity:.9}' +
    '.nav .nav-links .sb-soc-nav a:hover{opacity:1}' +
    '@media(max-width:1360px){.sb-soc-nav{display:flex;gap:10px;margin:0;padding:14px 18px}.nav .nav-links .sb-soc-nav a{width:44px!important;height:44px}}' +
    '.sb-soc-foot{display:flex;flex-wrap:wrap;align-items:center;gap:12px;width:100%;margin-top:22px;padding-top:20px;border-top:1px solid rgba(128,128,128,.35);font-family:Inter,sans-serif;font-size:15px}' +
    '.sb-soc-foot a{display:inline-flex;align-items:center;gap:9px;padding:10px 16px;border:1px solid currentColor;color:inherit!important;text-decoration:none;font-size:15px;opacity:.92}' +
    '.sb-soc-foot a:hover{opacity:1}';
  document.head.appendChild(st);
  function a(href, ico, label, withText) {
    return '<a href="' + href + '" target="_blank" rel="noopener" aria-label="Showroom Biur na ' + label + '" title="Showroom Biur na ' + label + '">' + ico + (withText ? '<span>' + label + '</span>' : '') + '</a>';
  }
  function init() {
    var links = document.querySelector('.nav .nav-links');
    if (links && !links.querySelector('.sb-soc-nav')) {
      var s = document.createElement('span'); s.className = 'sb-soc-nav';
      s.innerHTML = a(FB, I_FB, 'Facebooku') + a(IG, I_IG, 'Instagramie');
      links.appendChild(s);
    }
    var f = document.querySelector('footer');
    if (f && !f.querySelector('.sb-soc-foot')) {
      var d = document.createElement('div'); d.className = 'sb-soc-foot';
      d.innerHTML = '<span>Nowe biura codziennie:</span>' + a(FB, I_FB, 'Facebooku', 1).replace('<span>Facebooku', '<span>Facebook') + a(IG, I_IG, 'Instagramie', 1).replace('<span>Instagramie', '<span>Instagram');
      (f.querySelector('.footer-wrap') || f.querySelector('.footer-bottom') || f).appendChild(d);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
