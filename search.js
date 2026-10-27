/* Showroom Biur — global search (Cmd+K) + scroll reveal */
(function(){
  'use strict';

  // ============== STYLES ==============
  var css = `
.so-search-trigger{
  position:fixed; bottom:24px; right:24px; z-index:9990;
  background:var(--ink,#0F0F0E); color:var(--paper,#FBF8F2);
  border:none; padding:14px 18px; cursor:pointer;
  font-family:'JetBrains Mono',monospace; font-size:12px; letter-spacing:0.1em;
  text-transform:uppercase; box-shadow:0 4px 20px rgba(0,0,0,0.2);
  display:flex; align-items:center; gap:10px;
  transition:transform 0.25s, box-shadow 0.25s;
}
.so-search-trigger:hover{transform:translateY(-2px); box-shadow:0 8px 28px rgba(0,0,0,0.28);}
.so-search-trigger kbd{
  background:rgba(213,78,24,0.15); color:var(--accent,#D54E18);
  padding:3px 7px; font-family:'JetBrains Mono',monospace; font-size:11px;
  border-radius:3px; letter-spacing:0.05em;
}
.so-search-modal{
  position:fixed; inset:0; z-index:9999; display:none;
  background:rgba(15,15,14,0.78); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);
  animation:so-fade 0.18s ease;
}
.so-search-modal.open{display:flex; flex-direction:column; align-items:center; padding-top:8vh;}
@keyframes so-fade{from{opacity:0}to{opacity:1}}
.so-search-box{
  width:min(720px, 92vw); background:var(--paper,#FBF8F2); color:var(--ink,#0F0F0E);
  box-shadow:0 30px 80px rgba(0,0,0,0.4);
  display:flex; flex-direction:column; max-height:80vh;
}
.so-search-input-wrap{
  display:flex; align-items:center; padding:18px 24px;
  border-bottom:1px solid var(--rule,#e8e3d8);
}
.so-search-input-wrap svg{flex:none; opacity:0.5;}
.so-search-input{
  flex:1; border:none; outline:none; background:transparent;
  font-family:'Fraunces',serif; font-size:26px; padding:0 12px;
  color:var(--ink,#0F0F0E);
}
.so-search-input::placeholder{color:var(--muted,#6b6b67); font-style:italic;}
.so-search-input-wrap .so-esc{
  font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:0.1em;
  padding:4px 8px; background:var(--bone,#e8e3d8); color:var(--ink,#0F0F0E);
  text-transform:uppercase; border-radius:3px;
}
.so-results{flex:1; overflow-y:auto; padding:8px 0;}
.so-result{
  display:flex; align-items:center; gap:16px; padding:14px 24px;
  text-decoration:none; color:var(--ink,#0F0F0E); cursor:pointer;
  border-left:3px solid transparent; transition:background 0.12s;
}
.so-result:hover, .so-result.active{background:var(--bone,#e8e3d8); border-left-color:var(--accent,#D54E18);}
.so-result-type{
  flex:none; font-family:'JetBrains Mono',monospace; font-size:9px;
  letter-spacing:0.12em; text-transform:uppercase; color:var(--accent,#D54E18);
  width:90px; opacity:0.85;
}
.so-result-body{flex:1; min-width:0;}
.so-result-name{
  font-family:'Fraunces',serif; font-style:italic; font-size:17px;
  line-height:1.25; margin:0;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.so-result-desc{
  font-family:'Inter',sans-serif; font-size:12px; color:var(--muted,#6b6b67);
  margin-top:2px;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.so-result mark{background:rgba(213,78,24,0.18); color:var(--accent,#D54E18); padding:0 1px;}
.so-empty{padding:60px 24px; text-align:center; color:var(--muted,#6b6b67); font-family:'Inter',sans-serif;}
.so-empty strong{display:block; font-family:'Fraunces',serif; font-style:italic; font-size:24px; color:var(--ink,#0F0F0E); margin-bottom:8px;}
.so-footer{
  padding:12px 24px; border-top:1px solid var(--rule,#e8e3d8);
  font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:0.08em;
  color:var(--muted,#6b6b67); text-transform:uppercase;
  display:flex; gap:18px; justify-content:flex-start;
}
.so-footer span{display:inline-flex; align-items:center; gap:6px;}
.so-footer kbd{
  background:var(--bone,#e8e3d8); padding:2px 6px; border-radius:2px;
  font-family:inherit; font-size:9px;
}
@media (max-width:640px){
  .so-search-trigger{bottom:16px; right:16px; padding:12px 14px; font-size:11px;}
  .so-search-trigger .so-trigger-label{display:none;}
  .so-search-input{font-size:20px;}
  .so-result-type{width:70px; font-size:8px;}
}

/* ============== SCROLL REVEAL ============== */
.reveal{opacity:0; transform:translateY(24px); transition:opacity 0.7s cubic-bezier(0.2,0,0.2,1), transform 0.7s cubic-bezier(0.2,0,0.2,1);}
.reveal.in{opacity:1; transform:translateY(0);}
`;
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ============== TRIGGER + MODAL ==============
  var trigger = document.createElement('button');
  trigger.className = 'so-search-trigger';
  trigger.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><span class="so-trigger-label">Szukaj</span><kbd>⌘K</kbd>';
  trigger.setAttribute('aria-label','Otwórz wyszukiwarkę');

  var modal = document.createElement('div');
  modal.className = 'so-search-modal';
  modal.innerHTML = `
    <div class="so-search-box" role="dialog" aria-label="Wyszukiwarka">
      <div class="so-search-input-wrap">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input class="so-search-input" type="text" placeholder="Szukaj projektów, pracowni, produktów, artykułów..." autocomplete="off" spellcheck="false">
        <span class="so-esc">ESC</span>
      </div>
      <div class="so-results" id="so-results"></div>
      <div class="so-footer">
        <span><kbd>↑↓</kbd> nawigacja</span>
        <span><kbd>↵</kbd> otwórz</span>
        <span><kbd>ESC</kbd> zamknij</span>
        <span style="margin-left:auto;">501 rekordów w indeksie</span>
      </div>
    </div>
  `;

  document.body.appendChild(trigger);
  document.body.appendChild(modal);

  var input = modal.querySelector('.so-search-input');
  var resultsEl = modal.querySelector('.so-results');

  // ============== SEARCH INDEX ==============
  var INDEX = [];
  var indexLoaded = false;
  function loadIndex(){
    if (indexLoaded) return Promise.resolve();
    // Prefer pre-loaded global (works on file:// and http://)
    if (window.SO_SEARCH_INDEX){
      INDEX = window.SO_SEARCH_INDEX;
      indexLoaded = true;
      return Promise.resolve();
    }
    // Fallback: try fetching JSON (works under HTTP only)
    return fetch('search-index.json').then(function(r){
      return r.json();
    }).then(function(data){
      INDEX = data;
      indexLoaded = true;
    }).catch(function(){
      console.warn('Showroom search: nie udało się załadować indeksu');
    });
  }

  // ============== SEARCH ==============
  function normalize(s){
    return (s||'').toString().toLowerCase()
      .replace(/[ąáàâ]/g,'a').replace(/[ćč]/g,'c').replace(/[ęéè]/g,'e')
      .replace(/[íì]/g,'i').replace(/[łĺ]/g,'l').replace(/[ńñ]/g,'n')
      .replace(/[óöô]/g,'o').replace(/[śš]/g,'s').replace(/[úüû]/g,'u')
      .replace(/[ýÿ]/g,'y').replace(/[źżž]/g,'z');
  }
  function search(q){
    if (!q || q.length < 1) return [];
    var nq = normalize(q);
    var terms = nq.split(/\s+/).filter(Boolean);
    var results = [];
    for (var i=0; i<INDEX.length; i++){
      var item = INDEX[i];
      var hay = normalize(item.n + ' ' + (item.d||'') + ' ' + (item.b||'') + ' ' + (item.s||''));
      var score = 0;
      var allMatch = true;
      for (var j=0; j<terms.length; j++){
        var t = terms[j];
        var idx = hay.indexOf(t);
        if (idx < 0){ allMatch = false; break; }
        // Higher score for matches in name
        var nameIdx = normalize(item.n).indexOf(t);
        if (nameIdx === 0) score += 100;
        else if (nameIdx > 0) score += 50;
        else score += 10;
        if (idx === 0) score += 5;
      }
      if (allMatch){
        results.push({item:item, score:score});
      }
    }
    results.sort(function(a,b){return b.score - a.score;});
    return results.slice(0, 30).map(function(r){return r.item;});
  }

  function highlight(text, q){
    if (!q) return text;
    var nq = normalize(q);
    var terms = nq.split(/\s+/).filter(Boolean);
    var out = text;
    for (var i=0; i<terms.length; i++){
      var t = terms[i];
      if (!t) continue;
      var re = new RegExp('('+t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','ig');
      out = out.replace(re, '<mark>$1</mark>');
    }
    return out;
  }

  var activeIndex = 0;
  function render(items, q){
    if (!items.length){
      if (!q){
        resultsEl.innerHTML = '<div class="so-empty"><strong>Zacznij wpisywać.</strong>Projekt, pracownia, produkt, artykuł — wszystko w jednym miejscu.</div>';
      } else {
        resultsEl.innerHTML = '<div class="so-empty"><strong>Brak wyników.</strong>Spróbuj innym hasłem — np. nazwy miasta, sektora, marki.</div>';
      }
      return;
    }
    var html = '';
    for (var i=0; i<items.length; i++){
      var it = items[i];
      var name = highlight(it.n||'', q);
      var desc = highlight(it.d||'', q);
      html += '<a class="so-result' + (i===activeIndex?' active':'') + '" data-idx="'+i+'" href="'+it.u+'">'
            +   '<span class="so-result-type">'+it.t+'</span>'
            +   '<div class="so-result-body">'
            +     '<div class="so-result-name">'+name+'</div>'
            +     (desc ? '<div class="so-result-desc">'+desc+'</div>' : '')
            +   '</div>'
            + '</a>';
    }
    resultsEl.innerHTML = html;
  }

  // ============== EVENTS ==============
  var lastResults = [];

  function open(){
    loadIndex().then(function(){
      modal.classList.add('open');
      setTimeout(function(){ input.focus(); }, 50);
      activeIndex = 0;
      render(lastResults, input.value);
    });
  }
  function close(){
    modal.classList.remove('open');
  }

  trigger.addEventListener('click', open);
  modal.querySelector('.so-esc').addEventListener('click', close);
  modal.addEventListener('click', function(e){
    if (e.target === modal) close();
  });

  input.addEventListener('input', function(){
    activeIndex = 0;
    lastResults = search(input.value);
    render(lastResults, input.value);
  });

  resultsEl.addEventListener('mouseover', function(e){
    var el = e.target.closest('.so-result');
    if (!el) return;
    activeIndex = parseInt(el.dataset.idx, 10);
    Array.prototype.forEach.call(resultsEl.querySelectorAll('.so-result'), function(r){r.classList.remove('active');});
    el.classList.add('active');
  });

  document.addEventListener('keydown', function(e){
    // Open with Cmd+K / Ctrl+K
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')){
      e.preventDefault();
      if (modal.classList.contains('open')) close(); else open();
      return;
    }
    // Open with /
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA'){
      e.preventDefault();
      open();
      return;
    }
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape'){ close(); return; }
    if (e.key === 'ArrowDown'){
      e.preventDefault();
      if (lastResults.length){
        activeIndex = (activeIndex + 1) % lastResults.length;
        render(lastResults, input.value);
        var el = resultsEl.querySelector('.so-result.active');
        if (el) el.scrollIntoView({block:'nearest'});
      }
    } else if (e.key === 'ArrowUp'){
      e.preventDefault();
      if (lastResults.length){
        activeIndex = (activeIndex - 1 + lastResults.length) % lastResults.length;
        render(lastResults, input.value);
        var el = resultsEl.querySelector('.so-result.active');
        if (el) el.scrollIntoView({block:'nearest'});
      }
    } else if (e.key === 'Enter'){
      e.preventDefault();
      if (lastResults.length){
        window.location.href = lastResults[activeIndex].u;
      }
    }
  });

  // ============== SCROLL REVEAL ==============
  if ('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, {threshold:0.08, rootMargin:'0px 0px -80px 0px'});

    function observeReveal(){
      // Use existing .reveal class + auto-mark some elements
      var selectors = ['.reveal', '.cat-card', '.featured-card', '.icon-card', '.mosaic-item', '.callout', '.dstat'];
      selectors.forEach(function(sel){
        document.querySelectorAll(sel).forEach(function(el){
          if (!el.classList.contains('reveal')) el.classList.add('reveal');
          io.observe(el);
        });
      });
    }
    if (document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', observeReveal);
    } else {
      observeReveal();
    }
  }
})();
