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

  // restore
  const saved = localStorage.getItem('pref-theme-dark');
  if(saved===null || saved==='1') setTheme(true); else setTheme(false);

  // Tooltip for icons
  function makeTooltip(){
    let t = document.getElementById('__icon_tooltip__');
    if(!t){
      t = document.createElement('div');
      t.id = '__icon_tooltip__';
      Object.assign(t.style,{position:'fixed',padding:'6px 10px',background:'rgba(0,0,0,0.8)',color:'#fff',borderRadius:'6px',fontSize:'0.9rem',zIndex:10000,transition:'opacity 0.18s',opacity:0});
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
      setTimeout(()=>{ if(s && s.parentNode) s.parentNode.removeChild(s); }, 600);
    }, 2000);
  });
})();