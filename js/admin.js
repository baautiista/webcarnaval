/* ============================================================
   ADMIN.JS — Local admin panel without backend
   ============================================================ */

const ADMIN_DEFAULTS = { user: 'admin', pass: 'carnaval2024' };

function getAdminCredentials() {
  try {
    const saved = JSON.parse(localStorage.getItem('admin_credentials') || 'null');
    return saved || ADMIN_DEFAULTS;
  } catch(e) { return ADMIN_DEFAULTS; }
}

function isLoggedIn() {
  return localStorage.getItem('admin_logged_in') === '1';
}

function login(user, pass) {
  const creds = getAdminCredentials();
  if (user === creds.user && pass === creds.pass) {
    localStorage.setItem('admin_logged_in', '1');
    return true;
  }
  return false;
}

function logout() {
  localStorage.removeItem('admin_logged_in');
  location.reload();
}

function getOverrides() {
  try {
    return JSON.parse(localStorage.getItem('admin_overrides') || '{}');
  } catch(e) { return {}; }
}

function saveOverrides(overrides) {
  localStorage.setItem('admin_overrides', JSON.stringify(overrides));
}

function toggleHighlight(type, id) {
  const ov = getOverrides();
  const key = type === 'destacadas' ? 'destacadas'
    : type === 'autor' ? 'autores_destacados'
    : 'municipios_destacados';
  if (!ov[key]) ov[key] = [];
  const idx = ov[key].indexOf(id);
  if (idx >= 0) { ov[key].splice(idx, 1); }
  else { ov[key].push(id); }
  saveOverrides(ov);
  return ov[key].includes(id);
}

function isHighlighted(type, id) {
  const ov = getOverrides();
  const key = type === 'destacadas' ? 'destacadas'
    : type === 'autor' ? 'autores_destacados'
    : 'municipios_destacados';
  return (ov[key] || []).includes(id);
}

function saveHomeText(field, val) {
  const ov = getOverrides();
  if (!ov.home_texts) ov.home_texts = {};
  ov.home_texts[field] = val;
  saveOverrides(ov);
}

/* ============================================================
   RENDER ADMIN PAGE
   ============================================================ */
async function renderAdmin() {
  const loginSection = document.getElementById('admin-login');
  const panelSection = document.getElementById('admin-panel');
  if (!loginSection || !panelSection) return;

  if (isLoggedIn()) {
    loginSection.style.display = 'none';
    panelSection.style.display = 'block';
    await loadAdminPanel();
  } else {
    loginSection.style.display = 'flex';
    panelSection.style.display = 'none';
    setupLoginForm();
  }
}

function setupLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value.trim();
    if (login(user, pass)) {
      renderAdmin();
    } else {
      showToast('Credenciales incorrectas', 'error');
      document.getElementById('login-pass').value = '';
    }
  });
}

async function loadAdminPanel() {
  const db = await DataAPI.getAll();

  // Nav tabs
  document.querySelectorAll('.admin-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
      btn.classList.add('active');
      const target = document.getElementById('section-' + btn.dataset.section);
      if (target) target.classList.add('active');
    });
  });

  renderAgrupacionesAdmin(db.agrupaciones);
  renderAutoresAdmin(db.autores);
  renderMunicipiosAdmin(db.municipios);
  renderHomeTextsAdmin();
  renderCredentialsAdmin();

  // Logout
  const logoutBtn = document.getElementById('admin-logout');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);
}

function renderAgrupacionesAdmin(agrupaciones) {
  const tbody = document.getElementById('agrupaciones-tbody');
  if (!tbody) return;
  tbody.innerHTML = agrupaciones.map(ag => `
    <tr>
      <td><strong>${ag.nombre}</strong></td>
      <td>${ag.anyo}</td>
      <td>${ag.municipio}</td>
      <td>${ag.modalidad}</td>
      <td>
        <button class="toggle-btn ${isHighlighted('destacadas', ag.id) ? 'on' : ''}"
          onclick="handleToggle('destacadas', '${ag.id}', this)">
        </button>
      </td>
      <td>
        <a href="agrupacion.html?id=${ag.id}" target="_blank" style="color:var(--blue);font-family:var(--font-sans);font-size:13px">Ver</a>
      </td>
    </tr>
  `).join('');
}

function renderAutoresAdmin(autores) {
  const tbody = document.getElementById('autores-tbody');
  if (!tbody) return;
  tbody.innerHTML = autores.map(a => `
    <tr>
      <td><strong>${a.nombre}</strong></td>
      <td>${a.agrupaciones.length}</td>
      <td>
        <button class="toggle-btn ${isHighlighted('autor', a.slug) ? 'on' : ''}"
          onclick="handleToggle('autor', '${a.slug}', this)">
        </button>
      </td>
    </tr>
  `).join('');
}

function renderMunicipiosAdmin(municipios) {
  const tbody = document.getElementById('municipios-tbody');
  if (!tbody) return;
  tbody.innerHTML = municipios.map(m => `
    <tr>
      <td><strong>${m.nombre}</strong></td>
      <td>${m.agrupaciones.length}</td>
      <td>
        <button class="toggle-btn ${isHighlighted('municipio', m.slug) ? 'on' : ''}"
          onclick="handleToggle('municipio', '${m.slug}', this)">
        </button>
      </td>
    </tr>
  `).join('');
}

function renderHomeTextsAdmin() {
  const ov = getOverrides();
  const texts = ov.home_texts || {};
  const fields = [
    { key: 'hero_title', label: 'Título del Hero', placeholder: 'Archivo del Carnaval' },
    { key: 'hero_subtitle', label: 'Subtítulo del Hero', placeholder: 'La memoria viva...' },
    { key: 'cta_title', label: 'Título del CTA', placeholder: 'Ayúdanos a construir el archivo' },
    { key: 'cta_desc', label: 'Descripción del CTA', placeholder: 'Entre todos...' }
  ];
  const container = document.getElementById('home-texts-form');
  if (!container) return;
  container.innerHTML = fields.map(f => `
    <div class="form-group">
      <label class="form-label">${f.label}</label>
      <input class="form-input" type="text" id="ht-${f.key}" value="${texts[f.key] || ''}" placeholder="${f.placeholder}">
    </div>
  `).join('') + `<button class="btn btn-primary" onclick="saveHomeTextsAdmin()">Guardar textos</button>`;
}

function saveHomeTextsAdmin() {
  const ov = getOverrides();
  ov.home_texts = ov.home_texts || {};
  ['hero_title','hero_subtitle','cta_title','cta_desc'].forEach(key => {
    const el = document.getElementById('ht-' + key);
    if (el) ov.home_texts[key] = el.value;
  });
  saveOverrides(ov);
  showToast('Textos guardados correctamente');
}

function renderCredentialsAdmin() {
  const container = document.getElementById('credentials-form');
  if (!container) return;
  const creds = getAdminCredentials();
  container.innerHTML = `
    <div class="form-group">
      <label class="form-label">Usuario</label>
      <input class="form-input" type="text" id="new-user" value="${creds.user}">
    </div>
    <div class="form-group">
      <label class="form-label">Contraseña actual</label>
      <input class="form-input" type="password" id="current-pass" placeholder="Contraseña actual">
    </div>
    <div class="form-group">
      <label class="form-label">Nueva contraseña</label>
      <input class="form-input" type="password" id="new-pass" placeholder="Nueva contraseña">
    </div>
    <button class="btn btn-primary" onclick="saveCredentialsAdmin()">Actualizar credenciales</button>
  `;
}

function saveCredentialsAdmin() {
  const creds = getAdminCredentials();
  const currentPass = document.getElementById('current-pass').value;
  const newUser = document.getElementById('new-user').value.trim();
  const newPass = document.getElementById('new-pass').value.trim();
  if (currentPass !== creds.pass) {
    showToast('La contraseña actual no es correcta', 'error');
    return;
  }
  const newCreds = { user: newUser || creds.user, pass: newPass || creds.pass };
  localStorage.setItem('admin_credentials', JSON.stringify(newCreds));
  showToast('Credenciales actualizadas');
  renderCredentialsAdmin();
}

function handleToggle(type, id, btn) {
  const newState = toggleHighlight(type, id);
  btn.classList.toggle('on', newState);
  showToast(newState ? 'Marcado como destacado' : 'Eliminado de destacados');
}

window.handleToggle = handleToggle;
window.saveHomeTextsAdmin = saveHomeTextsAdmin;
window.saveCredentialsAdmin = saveCredentialsAdmin;
window.renderAdmin = renderAdmin;

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('admin-login')) {
    renderAdmin();
  }
});
