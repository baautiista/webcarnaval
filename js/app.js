/* ============================================================
   APP.JS — Shared UI components and page logic
   ============================================================ */

/* ---- NAVBAR ---- */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  const hamburger = document.querySelector('.nav-hamburger');
  const mobileNav = document.querySelector('.nav-mobile');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target)) mobileNav.classList.remove('open');
    });
  }

  // Mark active link
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

/* ---- SEARCH OVERLAY ---- */
function initSearchOverlay() {
  const overlay = document.querySelector('.search-overlay');
  if (!overlay) return;

  const input = overlay.querySelector('.search-input');
  const results = overlay.querySelector('.search-results');
  const closeBtn = overlay.querySelector('.search-close');

  function openSearch() { overlay.classList.add('open'); input && input.focus(); }
  function closeSearch() { overlay.classList.remove('open'); }

  document.querySelectorAll('.nav-search-btn, [data-open-search]').forEach(btn => {
    btn.addEventListener('click', openSearch);
  });
  closeBtn && closeBtn.addEventListener('click', closeSearch);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeSearch(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSearch();
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
  });

  let debounce;
  input && input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(async () => {
      const q = input.value.trim();
      if (!q) { results.innerHTML = ''; return; }
      const items = await DataAPI.search(q);
      if (!items.length) {
        results.innerHTML = `<div class="search-no-results">Sin resultados para "<strong>${q}</strong>"</div>`;
        return;
      }
      results.innerHTML = items.map(item => `
        <a class="search-result-item" href="${item.url}">
          <span class="search-result-type type-${item.type}">${labelType(item.type)}</span>
          <span class="search-result-name">${item.label}</span>
          <span class="search-result-meta">${item.meta}</span>
        </a>
      `).join('');
    }, 250);
  });
}

function labelType(type) {
  const map = { agrupacion: 'Agrupación', autor: 'Autor', municipio: 'Municipio', componente: 'Componente' };
  return map[type] || type;
}

/* ---- CONFETTI ---- */
function initConfetti(container) {
  if (!container) return;
  const colors = ['#3986ff','#f91669','#fcbd0d','#48bb75','#fb5608','#ffffff'];
  const shapes = ['circle', 'square', 'rect'];
  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const color = colors[Math.floor(Math.random() * colors.length)];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const size = Math.random() * 8 + 4;
    piece.style.cssText = `
      left: ${Math.random() * 100}%;
      top: -20px;
      width: ${shape === 'rect' ? size * 2 : size}px;
      height: ${size}px;
      background: ${color};
      border-radius: ${shape === 'circle' ? '50%' : shape === 'square' ? '2px' : '1px'};
      animation-duration: ${Math.random() * 8 + 6}s;
      animation-delay: ${Math.random() * 8}s;
      opacity: 0;
    `;
    container.appendChild(piece);
  }
}

/* ---- LIGHTBOX ---- */
function initLightbox() {
  let lb = document.querySelector('.lightbox');
  if (!lb) {
    lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = `
      <button class="lightbox-close" aria-label="Cerrar">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="20" height="20"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
      <img class="lightbox-img" src="" alt="">
      <div class="lightbox-caption"></div>
    `;
    document.body.appendChild(lb);
  }
  const img = lb.querySelector('.lightbox-img');
  const caption = lb.querySelector('.lightbox-caption');
  const close = lb.querySelector('.lightbox-close');

  function openLightbox(src, cap) {
    img.src = src;
    caption.textContent = cap || '';
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { img.src = ''; }, 300);
  }

  close.addEventListener('click', closeLightbox);
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-lightbox]');
    if (target) {
      openLightbox(target.dataset.lightbox, target.dataset.caption || '');
    }
  });

  return { openLightbox, closeLightbox };
}

/* ---- TOAST ---- */
function showToast(msg, type = 'success') {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  const icon = type === 'success'
    ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#48bb75" width="18" height="18"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#f91669" width="18" height="18"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>`;
  toast.className = `toast toast-${type} show`;
  toast.innerHTML = icon + `<span>${msg}</span>`;
  setTimeout(() => toast.classList.remove('show'), 3500);
}

/* ---- ANIMATE ON SCROLL ---- */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.card, .stat-item, .quick-item, .timeline-content, .person-card, .municipio-card').forEach(el => {
    observer.observe(el);
  });
}

/* ---- COUNT UP ANIMATION ---- */
function animateCount(el, target, duration = 1500) {
  const start = performance.now();
  const startVal = 0;
  function update(time) {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(startVal + (target - startVal) * eased).toLocaleString('es-ES');
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function initCountAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count || '0', 10);
        animateCount(el, target);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));
}

/* ---- MUNICIPIO COLOR MAP ---- */
function municipioColor(muni) {
  const m = (muni || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  if (m.includes('linea') || m.includes('línea'))     return '#3986ff';
  if (m.includes('san roque'))                         return '#f91669';
  if (m.includes('algeciras'))                         return '#fcbd0d';
  if (m.includes('barrios'))                           return '#49bb76';
  if (m.includes('jimena'))                            return '#1ab1e4';
  if (m.includes('tarifa'))                            return '#fa5506';
  if (m.includes('castellar'))                         return '#8337ec';
  if (m.includes('martin') || m.includes('martín'))   return '#250ed6';
  return '#3986ff'; // default blue
}

/* ---- MODAL YEAR / DECADE BADGE COLOR ---- */
function modalidadColor(mod) {
  const m = (mod || '').toLowerCase();
  if (m.includes('chirigota'))  return 'tag-yellow';
  if (m.includes('comparsa'))   return 'tag-blue';
  if (m.includes('coro'))       return 'tag-green';
  if (m.includes('cuarteto'))   return 'tag-pink';
  if (m.includes('romancer'))   return 'tag-pink';
  if (m.includes('callejer'))   return 'tag-orange';
  if (m.includes('infantil'))   return 'tag-violet';
  if (m.includes('juvenil'))    return 'tag-navy';
  return 'tag-gray';
}

function modalidadBadgeStyle(mod) {
  const m = (mod || '').toLowerCase();
  if (m.includes('chirigota'))  return 'background:rgba(252,189,13,0.15);color:#a07800';
  if (m.includes('comparsa'))   return 'background:rgba(57,134,255,0.15);color:#3986ff';
  if (m.includes('coro'))       return 'background:rgba(73,187,118,0.15);color:#1a7a40';
  if (m.includes('cuarteto'))   return 'background:rgba(249,22,105,0.15);color:#f91669';
  if (m.includes('romancer'))   return 'background:rgba(249,22,105,0.15);color:#f91669';
  if (m.includes('callejer'))   return 'background:rgba(250,85,6,0.15);color:#fa5506';
  if (m.includes('infantil'))   return 'background:rgba(131,55,236,0.15);color:#8337ec';
  if (m.includes('juvenil'))    return 'background:rgba(37,14,214,0.15);color:#250ed6';
  return 'background:rgba(57,134,255,0.06);color:#6b7280';
}

/* ---- PORTADA CACHE ---- */
// Indexed by two keys: agrupacion_id (as stored in DB) AND slugified nombre
const _portadaCache = new Map();
let _portadasPromise = null;

function _slugForCache(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function loadPortadas() {
  if (_portadasPromise) return _portadasPromise;
  _portadasPromise = _doLoadPortadas();
  return _portadasPromise;
}

async function _doLoadPortadas() {
  if (_portadaCache.size > 0) return;
  try {
    const SUPA_URL = 'https://mlhcetkaiidwjfmmzpmj.supabase.co';
    const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1saGNldGthaWlkd2pmbW16cG1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1Nzc1NDcsImV4cCI6MjA5NDE1MzU0N30.-NONc0cweym8cNqvSfZt2JQUyrDSLdMz9OMZL2q-ork';
    const res = await fetch(`${SUPA_URL}/rest/v1/fotos?select=agrupacion_id,agrupacion_nombre,url,is_portada&order=is_portada.desc,created_at.asc`, {
      headers: { apikey: SUPA_KEY, Authorization: 'Bearer ' + SUPA_KEY }
    });
    if (res.ok) {
      const rows = await res.json();
      rows.forEach(r => {
        if (!r.url) return;
        // Index by exact agrupacion_id stored in DB
        if (r.agrupacion_id) {
          if (r.is_portada || !_portadaCache.has(r.agrupacion_id)) {
            _portadaCache.set(r.agrupacion_id, r.url);
          }
        }
        // Also index by slugified agrupacion_nombre for fuzzy matching
        if (r.agrupacion_nombre) {
          const nameKey = _slugForCache(r.agrupacion_nombre);
          if (r.is_portada || !_portadaCache.has(nameKey)) {
            _portadaCache.set(nameKey, r.url);
          }
        }
      });
    }
  } catch(e) {}
}

/* ---- RENDER AGRUPACION CARD ---- */
function renderAgrupacionCard(ag) {
  const color = municipioColor(ag.municipio);
  // Look up by exact id, then by name-only slug (admin stores name-only slugs), then CSV fallback
  const nameSlug = _slugForCache(ag.nombre);
  const portadaUrl = _portadaCache.get(ag.id) || _portadaCache.get(nameSlug) || (ag.fotografias && ag.fotografias.length ? ag.fotografias[0] : null);
  const imgHtml = portadaUrl
    ? `<img class="card-image" src="${portadaUrl}" alt="${ag.nombre}" loading="lazy" onerror="this.parentNode.className='card-image-placeholder'">`
    : `<div class="card-image-placeholder">${iconMask()}</div>`;

  const autoresHtml = ag.autores.length
    ? `<span>${iconPen()} ${ag.autores.slice(0, 2).join(', ')}${ag.autores.length > 2 ? '...' : ''}</span>`
    : '';

  return `
    <article class="card" onclick="location.href='agrupacion.html?id=${ag.id}'">
      ${imgHtml}
      <div class="card-body">
        <div class="card-eyebrow" style="color:${color}">${ag.municipio || ''}</div>
        <h3 class="card-title">${ag.nombre}</h3>
        <div class="card-meta">
          ${ag.anyo ? `<span>${iconCalendar()} ${ag.anyo}</span>` : ''}
          ${ag.modalidad ? `<span class="tag ${modalidadColor(ag.modalidad)}">${ag.modalidad}</span>` : ''}
          ${autoresHtml}
        </div>
        ${ag.descripcion ? `<p class="card-desc">${ag.descripcion}</p>` : ''}
      </div>
      <div class="card-footer">
        ${ag.premios.length ? `<span class="tag tag-yellow">${iconStar()} ${ag.premios.length} premio${ag.premios.length > 1 ? 's' : ''}</span>` : '<span></span>'}
        <span style="color:var(--blue);font-family:var(--font-sans);font-size:13px;font-weight:600">Ver ficha →</span>
      </div>
    </article>
  `;
}

/* ---- RENDER PERSON CARD ---- */
function renderPersonCard(persona, tipo = 'autor') {
  const url = tipo === 'autor'
    ? `autor.html?slug=${persona.slug}`
    : `persona.html?slug=${persona.slug}&tipo=componente`;
  const avatarHtml = persona.foto
    ? `<img src="${persona.foto}" alt="${persona.nombre}" onerror="this.parentNode.innerHTML='${iconUser().replace(/'/g, "&#39;").replace(/"/g, "&quot;")}'">`
    : iconUser();
  return `
    <div class="person-card" onclick="location.href='${url}'">
      <div class="person-avatar">${avatarHtml}</div>
      <div class="person-name">${persona.nombre}</div>
      <div class="person-sub">${tipo === 'autor' ? 'Autor/a' : 'Componente'}</div>
      <div class="person-count">${persona.agrupaciones.length} agrupaci${persona.agrupaciones.length !== 1 ? 'ones' : 'ón'}</div>
    </div>
  `;
}

/* ---- SVG ICONS ---- */
function iconMask() {
  return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"/></svg>`;
}
function iconCalendar() {
  return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>`;
}
function iconPin() {
  return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>`;
}
function iconPen() {
  return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg>`;
}
function iconStar() {
  return `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="12" height="12"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/></svg>`;
}
function iconUser() {
  return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="36" height="36"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>`;
}
function iconSearch() {
  return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="22" height="22"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>`;
}
function iconPhoto() {
  return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="40" height="40"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>`;
}
function iconVideo() {
  return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="40" height="40"><path stroke-linecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"/></svg>`;
}
function iconChevronRight() {
  return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>`;
}
function iconTrophy() {
  return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0"/></svg>`;
}
function iconPlay() {
  return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"/></svg>`;
}

/* ---- YOUTUBE EMBED ---- */
function getYoutubeId(url) {
  const match = url.match(/(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function getGoogleDriveId(url) {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function renderVideoEmbed(url) {
  const ytId = getYoutubeId(url);
  if (ytId) return `<iframe src="https://www.youtube.com/embed/${ytId}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  const driveId = getGoogleDriveId(url);
  if (driveId) return `<iframe src="https://drive.google.com/file/d/${driveId}/preview" allow="autoplay" allowfullscreen></iframe>`;
  if (url.match(/\.(mp4|webm|ogg)$/i)) return `<video src="${url}" controls style="width:100%;height:100%;"></video>`;
  return `<iframe src="${url}" allowfullscreen></iframe>`;
}

function getVideoThumb(url) {
  const ytId = getYoutubeId(url);
  if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  return '';
}

/* ---- NAVBAR HTML ---- */
function getNavbarHTML() {
  return `
<nav class="navbar" id="main-navbar">
  <div class="nav-container">
    <a href="index.html" class="nav-logo">
      <div class="nav-logo-mark">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" width="20" height="20"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"/></svg>
      </div>
      <div class="nav-logo-text">Archivo Carnaval<span>Campo de Gibraltar</span></div>
    </a>
    <div class="nav-links">
      <a href="agrupaciones.html">Agrupaciones</a>
      <a href="autores.html">Autores</a>
      <a href="componentes.html">Componentes</a>
      <a href="municipios.html">Municipios</a>
      <a href="fototeca.html">Fototeca</a>
      <a href="videos.html">Vídeos</a>
      <a href="cronologia.html">Cronología</a>
    </div>
    <div class="nav-actions">
      <button class="nav-search-btn" aria-label="Buscar">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="18" height="18"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
      </button>
      <a href="aporta.html" class="nav-btn">Aportar</a>
    </div>
    <button class="nav-hamburger" aria-label="Menú">
      <span></span><span></span><span></span>
    </button>
  </div>
  <div class="nav-mobile">
    <a href="index.html">Inicio</a>
    <a href="agrupaciones.html">Agrupaciones</a>
    <a href="autores.html">Autores</a>
    <a href="componentes.html">Componentes</a>
    <a href="municipios.html">Municipios</a>
    <a href="fototeca.html">Fototeca</a>
    <a href="videos.html">Vídeos</a>
    <a href="cronologia.html">Cronología</a>
    <a href="aporta.html">Aportar</a>
    <a href="proyecto.html">El Proyecto</a>
  </div>
</nav>
<div class="search-overlay">
  <button class="search-close" aria-label="Cerrar búsqueda">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="20" height="20"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
  </button>
  <div class="search-overlay-inner">
    <div class="search-label">Buscar en el archivo</div>
    <div class="search-input-wrap">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
      <input class="search-input" type="text" placeholder="Agrupación, autor, municipio, año..." autocomplete="off">
    </div>
    <div class="search-results"></div>
  </div>
</div>
`;
}

/* ---- FOOTER HTML ---- */
function getFooterHTML() {
  return `
<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="footer-logo">
          <div class="footer-logo-mark">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" width="22" height="22"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"/></svg>
          </div>
          <div class="footer-logo-text">Archivo del Carnaval<span>Campo de Gibraltar</span></div>
        </div>
        <p class="footer-desc">La memoria viva del carnaval campogibraltareño. Un archivo colaborativo construido entre todos.</p>
        <div class="footer-social">
          <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Facebook">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
        </div>
      </div>
      <div>
        <div class="footer-col-title">Archivo</div>
        <div class="footer-links">
          <a href="agrupaciones.html">Agrupaciones</a>
          <a href="autores.html">Autores</a>
          <a href="componentes.html">Componentes</a>
          <a href="municipios.html">Municipios</a>
          <a href="cronologia.html">Cronología</a>
        </div>
      </div>
      <div>
        <div class="footer-col-title">Multimedia</div>
        <div class="footer-links">
          <a href="fototeca.html">Fototeca</a>
          <a href="videos.html">Vídeos</a>
        </div>
        <div class="footer-col-title" style="margin-top:24px">Proyecto</div>
        <div class="footer-links">
          <a href="proyecto.html">El Proyecto</a>
          <a href="aporta.html">Aportar</a>
        </div>
      </div>
      <div>
        <div class="footer-col-title">Municipios</div>
        <div class="footer-links">
          <a href="municipio.html?slug=algeciras">Algeciras</a>
          <a href="municipio.html?slug=lalinea">La Línea</a>
          <a href="municipio.html?slug=sanroque">San Roque</a>
          <a href="municipio.html?slug=losbarrios">Los Barrios</a>
          <a href="municipio.html?slug=tarifa">Tarifa</a>
          <a href="municipio.html?slug=jimena">Jimena</a>
        </div>
      </div>
    </div>
  </div>
  <div style="border-top:1px solid rgba(255,255,255,0.05);padding:24px 0;">
    <div class="container">
      <div class="footer-bottom">
        <span class="footer-bottom-text">© ${new Date().getFullYear()} Archivo del Carnaval del Campo de Gibraltar. Proyecto cultural sin ánimo de lucro.</span>
        <div class="footer-bottom-links">
          <a href="proyecto.html">Sobre el proyecto</a>
          <a href="aporta.html">Colaborar</a>
        </div>
      </div>
    </div>
  </div>
</footer>
`;
}

/* ---- INIT PAGE ---- */
let _pageInitialized = false;
function initPage() {
  if (_pageInitialized) return;
  _pageInitialized = true;

  // Inject navbar and footer
  const navPlaceholder = document.getElementById('navbar-placeholder');
  if (navPlaceholder) navPlaceholder.outerHTML = getNavbarHTML();

  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (footerPlaceholder) footerPlaceholder.outerHTML = getFooterHTML();

  initNavbar();
  initSearchOverlay();
  initScrollAnimations();
  initCountAnimations();
  initLightbox();
  initConfetti(document.querySelector('.confetti-container'));

  // Pre-load portadas from Supabase so cards have covers ready
  loadPortadas();
}

// Auto-init
document.addEventListener('DOMContentLoaded', initPage);

// Expose globals
window.renderAgrupacionCard = renderAgrupacionCard;
window.renderPersonCard = renderPersonCard;
window.modalidadColor = modalidadColor;
window.modalidadBadgeStyle = modalidadBadgeStyle;
window.getNavbarHTML = getNavbarHTML;
window.getFooterHTML = getFooterHTML;
window.showToast = showToast;
window.renderVideoEmbed = renderVideoEmbed;
window.getVideoThumb = getVideoThumb;
window.getYoutubeId = getYoutubeId;
window.iconStar = iconStar;
window.iconCalendar = iconCalendar;
window.iconPin = iconPin;
window.iconPen = iconPen;
window.iconUser = iconUser;
window.iconSearch = iconSearch;
window.iconPhoto = iconPhoto;
window.iconVideo = iconVideo;
window.iconChevronRight = iconChevronRight;
window.iconTrophy = iconTrophy;
window.iconPlay = iconPlay;
window.iconMask = iconMask;
window.loadPortadas = loadPortadas;
window.municipioColor = municipioColor;
