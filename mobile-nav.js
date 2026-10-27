/* Showroom Biur — universal mobile hamburger menu */
(function(){
  'use strict';

  var css = `
.so-mobile-toggle{display:none;background:transparent;border:none;cursor:pointer;padding:8px;margin-left:auto;}
.so-mobile-toggle .bar{display:block;width:24px;height:1.5px;background:var(--ink, #0F0F0E);margin:5px 0;transition:transform 0.3s, opacity 0.3s;}
.so-mobile-toggle.open .bar:nth-child(1){transform:translateY(6.5px) rotate(45deg);}
.so-mobile-toggle.open .bar:nth-child(2){opacity:0;}
.so-mobile-toggle.open .bar:nth-child(3){transform:translateY(-6.5px) rotate(-45deg);}

@media (max-width: 880px){
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
