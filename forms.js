/*
 * Showroom Biur - formularze „Dodaj biuro” i newsletter.
 * Gdy w site-config.js są ID Tally / Beehiiv → osadza ich formularze.
 * Gdy nie ma → formularz zapasowy składa e-mail do redakcji (nic nie ginie).
 */
(function () {
  'use strict';
  var C = window.SB_CONFIG || {};
  var MAIL = C.redakcjaEmail || 'redakcja@showroombiur.pl';

  function mailto(subject, body) {
    return 'mailto:' + MAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }

  /* ---------- Dodaj biuro ---------- */
  document.querySelectorAll('[data-sb-submit]').forEach(function (box) {
    var form = box.querySelector('form');
    var konkurs = /[?&]konkurs=1/.test(location.search);
    if (konkurs && form && form.elements.konkurs) form.elements.konkurs.checked = true;

    if (C.tallyFormId) {
      var src = 'https://tally.so/embed/' + C.tallyFormId +
        '?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1' + (konkurs ? '&konkurs=1' : '');
      var ifr = document.createElement('iframe');
      ifr.setAttribute('data-tally-src', src);
      ifr.setAttribute('loading', 'lazy');
      ifr.setAttribute('title', 'Dodaj biuro - formularz');
      ifr.style.cssText = 'width:100%;min-height:900px;border:0;';
      box.innerHTML = '';
      box.appendChild(ifr);
      var s = document.createElement('script');
      s.src = 'https://tally.so/widgets/embed.js';
      s.onload = function () { if (window.Tally) window.Tally.loadEmbeds(); else ifr.src = src; };
      s.onerror = function () { ifr.src = src; };
      document.body.appendChild(s);
      return;
    }

    if (!form) return;
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var f = form.elements;
      var v = function (n) { return f[n] ? (f[n].type === 'checkbox' ? (f[n].checked ? 'tak' : 'nie') : f[n].value.trim()) : ''; };
      var body = [
        'ZGŁOSZENIE BIURA - Showroom Biur', '',
        'Najemca / firma w biurze: ' + v('najemca'),
        'Miasto i adres / budynek: ' + v('miasto'),
        'Rok oddania: ' + v('rok'),
        'Powierzchnia (m²): ' + v('m2'),
        'Pracownia projektowa: ' + v('pracownia'),
        'Generalny wykonawca / fit-out: ' + v('wykonawca'),
        'Fotograf: ' + v('fotograf'),
        'Link do zdjęć (Drive / WeTransfer / Dropbox): ' + v('zdjecia'), '',
        'Opis:', v('opis'), '',
        'Zgłaszający: ' + v('imie') + ' · ' + v('rola') + ' · ' + v('email'),
        'Zgłoszenie także do Biura Roku: ' + v('konkurs'),
        'Oświadczenie o prawach do zdjęć i zgodzie najemcy: ' + v('zgoda')
      ].join('\n');
      location.href = mailto('Dodaj biuro: ' + (v('najemca') || 'nowy projekt'), body);
      var ok = box.querySelector('.sb-sent');
      if (ok) ok.hidden = false;
    });
  });

  /* ---------- Newsletter ---------- */
  document.querySelectorAll('form[data-newsletter]').forEach(function (form) {
    if (C.beehiivEmbedId) {
      var ifr = document.createElement('iframe');
      ifr.src = 'https://embeds.beehiiv.com/' + C.beehiivEmbedId + '?slim=true';
      ifr.setAttribute('data-test-id', 'beehiiv-embed');
      ifr.setAttribute('title', 'Zapis do newslettera Showroom Biur');
      ifr.style.cssText = 'width:100%;height:56px;border:0;background:transparent;margin:0;';
      form.replaceWith(ifr);
      return;
    }
    form.removeAttribute('action');
    form.removeAttribute('target');
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var email = (form.querySelector('input[type="email"]') || {}).value || '';
      location.href = mailto('Newsletter - zapis', 'Proszę o zapis do newslettera Showroom Biur.\nAdres: ' + email);
      var btn = form.querySelector('button');
      if (btn) btn.textContent = 'Dziękujemy - wyślij przygotowanego maila';
    });
  });
})();
