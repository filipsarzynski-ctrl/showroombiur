/*
 * Noty redaktora przy projektach - pojawiają się na stronie projektu pod opisem
 * i jako znacznik „Nota redakcji” w archiwum.
 *
 * Klucz = slug projektu (końcówka adresu projekt.html?slug=...).
 * tekst: 3-6 zdań, pisane w pierwszej osobie. Zwykły tekst, akapity rozdziel pustą linią (\n\n).
 *
 * Przykład:
 * 'cd-projekt-red-warszawa-2025': {
 *   autor: 'Filip Sarzyński',
 *   data: '2026-11',
 *   tekst: 'Byłem w tym biurze dwa razy...'
 * },
 */
window.SB_NOTES = {
};

/* Archiwum: znacznik „Nota redakcji” przy kartach projektów, które mają notę. */
document.addEventListener('DOMContentLoaded', function () {
  var notes = window.SB_NOTES || {};
  Object.keys(notes).forEach(function (slug) {
    document.querySelectorAll('article.project a.project-img[href$="=' + slug + '"]').forEach(function (a) {
      var art = a.closest('article.project');
      var t = art && art.querySelector('.project-title');
      if (!t || t.querySelector('.sb-note-flag')) return;
      var s = document.createElement('span');
      s.className = 'sb-note-flag';
      s.textContent = 'Nota redakcji';
      s.style.cssText = "display:inline-block;margin-left:10px;vertical-align:middle;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;border:1px solid currentColor;padding:3px 7px;opacity:.75";
      t.appendChild(s);
    });
  });
});
