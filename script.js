// Simple interactions: theme toggle and flag highlight
(function(){
  const body = document.body;
  const toggle = document.getElementById('toggleTheme');

  function setTheme(dark){
    if(dark){
      body.classList.add('dark');
      if(toggle) toggle.textContent = '☀️';
    } else {
      body.classList.remove('dark');
      if(toggle) toggle.textContent = '🌙';
    }
    localStorage.setItem('pref-theme-dark', dark? '1':'0');
  }

  if(toggle) toggle.addEventListener('click', ()=>{
    const isDark = body.classList.contains('dark');
    setTheme(!isDark);
  });

  // restore: default to light theme unless user explicitly saved dark ('1')
  const saved = localStorage.getItem('pref-theme-dark');
  if(saved === '1') setTheme(true); else setTheme(false);

  // Tooltip for icons
  function makeTooltip(){
    let t = document.getElementById('__icon_tooltip__');
    if(!t){
      t = document.createElement('div');
      t.id = '__icon_tooltip__';
        Object.assign(t.style,{position:'fixed',padding:'6px 10px',background:'rgba(0,0,0,0.85)',color:'#fff',borderRadius:'6px',fontSize:'0.9rem',zIndex:10000,transition:'opacity 0.18s',opacity:0});
      document.body.appendChild(t);
    }
    return t;
  }

  function showTooltip(text,x,y){
    const t = makeTooltip();
    t.textContent = text;
    const pad = 8;
    const rect = t.getBoundingClientRect();
    let left = x - rect.width/2;
    if(left < 8) left = 8;
    if(left + rect.width > window.innerWidth - 8) left = window.innerWidth - rect.width - 8;
    let top = y - rect.height - pad;
    if(top < 8) top = y + pad;
    Object.assign(t.style,{left: left + 'px', top: top + 'px', opacity:1});
    clearTimeout(t._h);
    t._h = setTimeout(()=>{ t.style.opacity = 0; }, 2000);
  }

  function hideTooltip(){
    const t = document.getElementById('__icon_tooltip__');
    if(!t) return;
    clearTimeout(t._h);
    t.style.opacity = 0;
  }

  document.addEventListener('click', function(e){
    const icon = e.target.closest('.icon');
    if(!icon) return;
    const text = icon.getAttribute('title') || icon.textContent || 'Info';
    const rect = icon.getBoundingClientRect();
    showTooltip(text, rect.left + rect.width/2, rect.top);
  });

  // keyboard activation for icons (Enter / Space)
  document.addEventListener('keydown', function(e){
    if(e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
    const el = document.activeElement;
    if(!el) return;
    if(!el.classList || !el.classList.contains('icon')) return;
    // prevent page scroll on space
    if(e.key === ' ' || e.key === 'Spacebar') e.preventDefault();
    const text = el.getAttribute('title') || el.textContent || 'Info';
    const rect = el.getBoundingClientRect();
    showTooltip(text, rect.left + rect.width/2, rect.top);
  });

  // hide tooltip when user scrolls, wheel or touch-moves
  window.addEventListener('scroll', hideTooltip, {passive:true});
  window.addEventListener('wheel', hideTooltip, {passive:true});
  document.addEventListener('touchmove', hideTooltip, {passive:true});

  // splash screen: fade and remove after 2 seconds
  window.addEventListener('load', function(){
    const s = document.getElementById('splash');
    if(!s) return;
    setTimeout(()=>{
      s.classList.add('hidden');
      // reveal view controls after splash fades
      const controls = document.getElementById('view-controls');
      if(controls) controls.classList.add('controls-visible');
      setTimeout(()=>{ if(s && s.parentNode) s.parentNode.removeChild(s); }, 600);
    }, 2000);
  });

  // View controls: toggle between layout (flags-stack) and route view
  const btnLayout = document.getElementById('btnLayout');
  const btnRoute = document.getElementById('btnRoute');
  const flagsStack = document.querySelector('.flags-stack');
  const routeView = document.getElementById('route-view');

  function showLayout(){
    if(flagsStack) { flagsStack.style.display = 'flex'; flagsStack.scrollIntoView({behavior:'smooth',block:'start'}); flagsStack.focus && flagsStack.focus(); }
    if(routeView) { routeView.classList.add('hidden'); routeView.setAttribute('aria-hidden','true'); }
    if(btnLayout){ btnLayout.classList.add('active'); btnLayout.setAttribute('aria-pressed','true'); }
    if(btnRoute){ btnRoute.classList.remove('active'); btnRoute.setAttribute('aria-pressed','false'); }
  }

  function showRoute(){
    if(flagsStack) flagsStack.style.display = 'none';
    if(routeView) { routeView.classList.remove('hidden'); routeView.setAttribute('aria-hidden','false'); }
    if(btnLayout){ btnLayout.classList.remove('active'); btnLayout.setAttribute('aria-pressed','false'); }
    if(btnRoute){ btnRoute.classList.add('active'); btnRoute.setAttribute('aria-pressed','true'); }
  }

  if(btnLayout) btnLayout.addEventListener('click', showLayout);
  if(btnRoute) btnRoute.addEventListener('click', showRoute);

  // keyboard access
  [btnLayout, btnRoute].forEach(b=>{ if(!b) return; b.tabIndex = 0; b.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' ') b.click(); }); });

  // Numbering system for cards
  function refreshCardNumbers(){
    // Find all flag cards in document order and number them sequentially,
    // but skip certain top flags (they should not be numbered)
    const excludeSelector = '.flag-card.national, .flag-card.college, .flag-card.lasalian';
    // Remove any previously injected variant clones to avoid duplicates (leftover from older approach)
    const injectedSelector = '.flag-card._variant_clone';
    Array.from(document.querySelectorAll(injectedSelector)).forEach(n => n.parentNode && n.parentNode.removeChild(n));

    // We will walk the cards in DOM order and keep track of variant groups so
    // cards sharing the same data-variant-group get the same numeric index.
    const cards = Array.from(document.querySelectorAll('.flag-card'));
    let counter = 0;
    const assignedGroups = new Map(); // groupId -> numericIndex

    cards.forEach((card) => {
      const isExcluded = card.matches(excludeSelector);
      let order = card.querySelector('.order');
      if(isExcluded){
        if(order && order.parentNode) order.parentNode.removeChild(order);
        return;
      }

      const group = card.getAttribute('data-variant-group');
      const letter = card.getAttribute('data-variant-letter');

      if(group){
        // If this group already has a numeric assigned, reuse it; otherwise allocate next number
        let num = assignedGroups.get(group);
        if(!num){
          counter += 1;
          num = counter;
          assignedGroups.set(group, num);
        }
        // create order element if missing
        if(!order){
          order = document.createElement('div');
          order.className = 'order';
          card.insertBefore(order, card.firstChild);
        }
        // append letter if present, otherwise show numeric only
        order.textContent = String(num) + (letter ? String(letter) : '');
      } else {
        // normal single card: increment counter and assign numeric
        if(!order){
          order = document.createElement('div');
          order.className = 'order';
          card.insertBefore(order, card.firstChild);
        }
        counter += 1;
        order.textContent = String(counter);
      }
    });
  }

  // Debounced global observer: watch for added/removed .flag-card elements anywhere in the document
  (function observeAll(){
    let t = null;
    const debounced = ()=>{ clearTimeout(t); t = setTimeout(refreshCardNumbers, 80); };
    const mo = new MutationObserver((mutations)=>{
      for(const m of mutations){
        if(m.type === 'childList' && (m.addedNodes.length || m.removedNodes.length)) { debounced(); break; }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    // initial numbering
    refreshCardNumbers();
  })();
})();