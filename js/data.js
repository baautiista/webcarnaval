/* ============================================================
   DATA.JS — CSV data layer for Archivo del Carnaval del Campo de Gibraltar
   ============================================================ */

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSGT9g-Hpp8Ql21aTvDaHaixurmHgrja7_00wC6bPrDDFQ0NEauiz1rFZDlhgh8QBJsttjUsqQNFu99/pub?gid=1311976573&single=true&output=csv';

const DB = {
  raw: [],
  agrupaciones: [],
  autores: [],
  componentes: [],
  municipios: [],
  loaded: false,
  callbacks: []
};

// Alias cache: csv_name (lowercased) → canonical_slug
const ALIAS_CACHE = { loaded: false, map: new Map() };

async function loadAliases() {
  if (ALIAS_CACHE.loaded) return ALIAS_CACHE.map;
  try {
    const SUPA_URL = 'https://mlhcetkaiidwjfmmzpmj.supabase.co';
    const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1saGNldGthaWlkd2pmbW16cG1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1Nzc1NDcsImV4cCI6MjA5NDE1MzU0N30.-NONc0cweym8cNqvSfZt2JQUyrDSLdMz9OMZL2q-ork';
    const res = await fetch(`${SUPA_URL}/rest/v1/autor_aliases?select=csv_name,canonical_slug`, {
      headers: { apikey: SUPA_KEY, Authorization: 'Bearer ' + SUPA_KEY }
    });
    if (res.ok) {
      const rows = await res.json();
      rows.forEach(r => ALIAS_CACHE.map.set(r.csv_name.toLowerCase(), r.canonical_slug));
    }
  } catch(e) {}
  ALIAS_CACHE.loaded = true;
  return ALIAS_CACHE.map;
}

function resolveAutorSlug(nombre, aliasMap) {
  if (!nombre) return slugify(nombre);
  const canonical = aliasMap.get(nombre.toLowerCase());
  return canonical || slugify(nombre);
}

/* ---- Normalise multivalue cells ---- */
function splitMulti(val) {
  if (!val || val.trim() === '') return [];
  return val.split(';').map(s => s.trim()).filter(Boolean);
}

/* ---- Build a slug ---- */
function slugify(str) {
  return String(str)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/* ---- Map CSV row to structured agrupacion object ---- */
function mapRow(row, idx) {
  const municipio = (row['Municipio del Campo de Gibraltar'] || '').trim();
  const nombre    = (row['Nombre de la agrupación'] || row['Nombre de la agrupacion'] || '').trim();
  const anyo      = (row['Año de la agrupación'] || row['Anno de la agrupacion'] || row['Año'] || '').trim();
  const modalidad = (row['Modalidad'] || '').trim();
  const autores   = splitMulti(row['Autores'] || row['Autor'] || '');
  const componentes = splitMulti(row['Componentes'] || '');
  const premios   = splitMulti(row['Premios / Palmarés'] || row['Premios'] || row['Palmares'] || '');
  const descripcion = (row['Descripción / Historia / Anecdotario'] || row['Descripcion'] || row['Historia'] || row['Descripción'] || '').trim();
  const fotografias = splitMulti(row['Fotografías'] || row['Fotografias'] || '');
  const videos    = splitMulti(row['Vídeos'] || row['Videos'] || '');
  const carteles  = splitMulti(row['Carteles'] || '');
  const fotoAutor = (row['Foto autor'] || '').trim();
  const bioAutor  = (row['Biografía autor'] || row['Biografia autor'] || '').trim();

  return {
    id: slugify(`${nombre}-${anyo}-${municipio}`) || `ag-${idx}`,
    idx,
    municipio,
    nombre,
    anyo,
    anyoNum: parseInt(anyo, 10) || 0,
    decada: anyo ? Math.floor(parseInt(anyo, 10) / 10) * 10 : 0,
    modalidad,
    autores,
    componentes,
    premios,
    descripcion,
    fotografias,
    videos,
    carteles,
    fotoAutor,
    bioAutor,
    destacada: false
  };
}

/* ---- Extract unique people ---- */
function buildPeopleIndex(agrupaciones, field, aliasMap = new Map()) {
  const map = new Map();
  agrupaciones.forEach(ag => {
    (ag[field] || []).forEach(nombre => {
      if (!nombre) return;
      const canonicalSlug = resolveAutorSlug(nombre, aliasMap);
      // Group by canonical slug so aliased names merge into one record
      if (!map.has(canonicalSlug)) {
        map.set(canonicalSlug, {
          nombre,
          slug: canonicalSlug,
          agrupaciones: [],
          foto: field === 'autores' ? ag.fotoAutor : '',
          bio: field === 'autores' ? ag.bioAutor : '',
          destacado: false
        });
      }
      map.get(canonicalSlug).agrupaciones.push(ag.id);
      if (field === 'autores' && ag.fotoAutor && !map.get(canonicalSlug).foto) {
        map.get(canonicalSlug).foto = ag.fotoAutor;
      }
      if (field === 'autores' && ag.bioAutor && !map.get(canonicalSlug).bio) {
        map.get(canonicalSlug).bio = ag.bioAutor;
      }
    });
  });
  return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
}

/* ---- Build municipios index ---- */
function buildMunicipiosIndex(agrupaciones) {
  const MUNICIPIOS_DATA = {
    'la linea de la concepcion': {
      nombre: 'La Línea de la Concepción',
      slug: 'lalinea',
      historia: 'La Línea de la Concepción es una ciudad fronteriza con Gibraltar con una rica tradición carnavalesca, influenciada por las culturas atlántica y mediterránea. Su carnaval se celebra con gran fervor popular.',
      imagen: 'https://images.pexels.com/photos/2916820/pexels-photo-2916820.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    'algeciras': {
      nombre: 'Algeciras',
      slug: 'algeciras',
      historia: 'Algeciras, puerta del Estrecho de Gibraltar, celebra su carnaval con una fuerte tradición de agrupaciones que mezclan el humor ácido con la crítica social, heredado de la tradición gaditana.',
      imagen: 'https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    'san roque': {
      nombre: 'San Roque',
      slug: 'sanroque',
      historia: 'San Roque, municipio de gran tradición histórica, cuenta con una destacada participación en el Carnaval del Campo de Gibraltar, con agrupaciones que han cosechado numerosos premios.',
      imagen: 'https://images.pexels.com/photos/3889843/pexels-photo-3889843.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    'los barrios': {
      nombre: 'Los Barrios',
      slug: 'losbarrios',
      historia: 'Los Barrios ha forjado una identidad propia en el Carnaval del Campo de Gibraltar, con agrupaciones de gran calidad que han representado a este municipio industrial en los certámenes comarcales.',
      imagen: 'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    'tarifa': {
      nombre: 'Tarifa',
      slug: 'tarifa',
      historia: 'Tarifa, la ciudad más meridional de Europa continental, aporta al Carnaval del Campo de Gibraltar su carácter único, mezclando la influencia africana y atlántica en sus comparsas y chirigotas.',
      imagen: 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    'jimena': {
      nombre: 'Jimena de la Frontera',
      slug: 'jimena',
      historia: 'Jimena de la Frontera, con su imponente castillo árabe, participa activamente en el carnaval comarcal con agrupaciones que reflejan la idiosincrasia de la sierra campogibraltareña.',
      imagen: 'https://images.pexels.com/photos/3889843/pexels-photo-3889843.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    'castellar': {
      nombre: 'Castellar de la Frontera',
      slug: 'castellar',
      historia: 'Castellar de la Frontera, pueblo de singular belleza con su pueblo viejo habitado, mantiene viva la tradición carnavalesca como expresión cultural de su comunidad.',
      imagen: 'https://images.pexels.com/photos/2916820/pexels-photo-2916820.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    'tesorillo': {
      nombre: 'Tesorillo',
      slug: 'tesorillo',
      historia: 'Tesorillo, pedanía de San Roque, participa en el carnaval comarcal con agrupaciones que mantienen la esencia popular de las tradiciones festivas del Campo de Gibraltar.',
      imagen: 'https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
  };

  // Alias short forms to canonical keys
  const MUN_ALIASES = {
    'la linea': 'la linea de la concepcion',
    'linea': 'la linea de la concepcion',
    'jimena de la frontera': 'jimena',
    'castellar de la frontera': 'castellar',
  };

  const map = new Map();
  agrupaciones.forEach(ag => {
    if (!ag.municipio) return;
    let key = ag.municipio.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    key = MUN_ALIASES[key] || key;
    if (!map.has(key)) {
      const base = MUNICIPIOS_DATA[key] || {
        nombre: ag.municipio,
        slug: slugify(ag.municipio),
        historia: `El municipio de ${ag.municipio} tiene una destacada participación en el Carnaval del Campo de Gibraltar.`,
        imagen: 'https://images.pexels.com/photos/2916820/pexels-photo-2916820.jpeg?auto=compress&cs=tinysrgb&w=800'
      };
      map.set(key, {
        ...base,
        agrupaciones: [],
        destacado: false
      });
    }
    map.get(key).agrupaciones.push(ag.id);
  });

  // Add municipios with no agrupaciones yet
  Object.entries(MUNICIPIOS_DATA).forEach(([key, data]) => {
    if (!map.has(key)) {
      map.set(key, { ...data, agrupaciones: [], destacado: false });
    }
  });

  return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
}

/* ---- Apply admin overrides from localStorage ---- */
function applyAdminOverrides(agrupaciones, autores, municipios) {
  try {
    const overrides = JSON.parse(localStorage.getItem('admin_overrides') || '{}');
    if (overrides.destacadas) {
      overrides.destacadas.forEach(id => {
        const ag = agrupaciones.find(a => a.id === id);
        if (ag) ag.destacada = true;
      });
    }
    if (overrides.autores_destacados) {
      overrides.autores_destacados.forEach(slug => {
        const a = autores.find(x => x.slug === slug);
        if (a) a.destacado = true;
      });
    }
    if (overrides.municipios_destacados) {
      overrides.municipios_destacados.forEach(slug => {
        const m = municipios.find(x => x.slug === slug);
        if (m) m.destacado = true;
      });
    }
    if (overrides.home_texts) {
      window._homeTexts = overrides.home_texts;
    }
  } catch(e) { /* ignore */ }
}

/* ---- Main load function ---- */
async function loadData() {
  if (DB.loaded) return DB;
  return new Promise((resolve, reject) => {
    if (typeof Papa === 'undefined') {
      // Lazy load PapaParse
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js';
      script.onload = () => fetchCSV(resolve, reject);
      script.onerror = () => reject(new Error('PapaParse load failed'));
      document.head.appendChild(script);
    } else {
      fetchCSV(resolve, reject);
    }
  });
}

function fetchCSV(resolve, reject) {
  // Load aliases first, then parse CSV so slugs are canonical from the start
  loadAliases().then(aliasMap => {
    Papa.parse(CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete(results) {
        DB.raw = results.data;
        DB.agrupaciones = results.data
          .map((row, i) => mapRow(row, i))
          .filter(ag => ag.nombre);

        DB.autores = buildPeopleIndex(DB.agrupaciones, 'autores', aliasMap);
        DB.componentes = buildPeopleIndex(DB.agrupaciones, 'componentes', aliasMap);
        DB.municipios = buildMunicipiosIndex(DB.agrupaciones);

        applyAdminOverrides(DB.agrupaciones, DB.autores, DB.municipios);

        DB.loaded = true;
        resolve(DB);
      },
      error(err) {
        console.error('CSV error', err);
        DB.loaded = true;
        resolve(DB);
      }
    });
  });
}

/* ---- Query helpers ---- */
const DataAPI = {
  async getAll() { return loadData(); },

  async getAgrupaciones(filters = {}) {
    const db = await loadData();
    let list = [...db.agrupaciones];
    if (filters.municipio) list = list.filter(a => slugify(a.municipio) === slugify(filters.municipio));
    if (filters.modalidad) list = list.filter(a => slugify(a.modalidad) === slugify(filters.modalidad));
    if (filters.anyo) list = list.filter(a => a.anyo === filters.anyo);
    if (filters.decada) list = list.filter(a => a.decada === parseInt(filters.decada));
    if (filters.autor) list = list.filter(a => a.autores.some(x => slugify(x) === slugify(filters.autor)));
    if (filters.componente) list = list.filter(a => a.componentes.some(x => slugify(x) === slugify(filters.componente)));
    if (filters.q) {
      const q = filters.q.toLowerCase();
      list = list.filter(a =>
        a.nombre.toLowerCase().includes(q) ||
        a.municipio.toLowerCase().includes(q) ||
        a.modalidad.toLowerCase().includes(q) ||
        a.autores.some(x => x.toLowerCase().includes(q)) ||
        a.componentes.some(x => x.toLowerCase().includes(q)) ||
        a.premios.some(x => x.toLowerCase().includes(q)) ||
        a.descripcion.toLowerCase().includes(q)
      );
    }
    return list;
  },

  async getAgrupacionById(id) {
    const db = await loadData();
    return db.agrupaciones.find(a => a.id === id) || null;
  },

  async getAutores() {
    const db = await loadData();
    return db.autores;
  },

  async getAutorBySlug(slug) {
    const db = await loadData();
    // Direct match first
    let autor = db.autores.find(a => a.slug === slug);
    if (autor) return autor;
    // Try alias: maybe the URL slug was generated from a CSV name, find canonical
    const aliasMap = await loadAliases();
    const canonical = aliasMap.get(slug.toLowerCase().replace(/-/g, ' ')) || null;
    if (canonical && canonical !== slug) {
      autor = db.autores.find(a => a.slug === canonical);
    }
    return autor || null;
  },

  async getComponentes() {
    const db = await loadData();
    return db.componentes;
  },

  async getComponenteBySlug(slug) {
    const db = await loadData();
    return db.componentes.find(a => a.slug === slug) || null;
  },

  async getMunicipios() {
    const db = await loadData();
    return db.municipios;
  },

  async getMunicipioBySlug(slug) {
    const db = await loadData();
    return db.municipios.find(m => m.slug === slug) || null;
  },

  async getStats() {
    const db = await loadData();
    const ags = db.agrupaciones;
    let totalFotos = 0, totalVideos = 0, totalCarteles = 0;
    ags.forEach(ag => {
      totalFotos += ag.fotografias.length;
      totalVideos += ag.videos.length;
      totalCarteles += ag.carteles.length;
    });
    return {
      agrupaciones: ags.length,
      autores: db.autores.length,
      componentes: db.componentes.length,
      municipios: db.municipios.filter(m => m.agrupaciones.length > 0).length,
      fotos: totalFotos,
      videos: totalVideos,
      carteles: totalCarteles
    };
  },

  async getDecadas() {
    const db = await loadData();
    const decadas = [...new Set(db.agrupaciones.map(a => a.decada).filter(Boolean))].sort();
    return decadas;
  },

  async getModalidades() {
    const db = await loadData();
    return [...new Set(db.agrupaciones.map(a => a.modalidad).filter(Boolean))].sort();
  },

  async getFototeca(filters = {}) {
    // Merge CSV fotos + Supabase fotos
    const db = await loadData();
    const items = [];

    // From CSV
    db.agrupaciones.forEach(ag => {
      if (filters.municipio && slugify(ag.municipio) !== slugify(filters.municipio)) return;
      if (filters.anyo && ag.anyo !== filters.anyo) return;
      if (filters.agrupacion && ag.id !== filters.agrupacion) return;
      ag.fotografias.forEach(url => {
        items.push({
          url,
          agrupacion_nombre: ag.nombre,
          agrupacion_id: ag.id,
          municipio: ag.municipio,
          municipio_slug: slugify(ag.municipio),
          año: ag.anyoNum || null
        });
      });
    });

    // From Supabase
    try {
      const SUPA_URL = 'https://mlhcetkaiidwjfmmzpmj.supabase.co';
      const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1saGNldGthaWlkd2pmbW16cG1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1Nzc1NDcsImV4cCI6MjA5NDE1MzU0N30.-NONc0cweym8cNqvSfZt2JQUyrDSLdMz9OMZL2q-ork';
      const res = await fetch(`${SUPA_URL}/rest/v1/fotos?select=*&order=created_at.desc`, {
        headers: { apikey: SUPA_KEY, Authorization: 'Bearer ' + SUPA_KEY }
      });
      if (res.ok) {
        const rows = await res.json();
        rows.forEach(r => {
          if (filters.municipio && slugify(r.municipio || '') !== slugify(filters.municipio)) return;
          if (filters.anyo && String(r.ano) !== String(filters.anyo)) return;
          if (filters.agrupacion && r.agrupacion_id !== filters.agrupacion) return;
          items.push({
            url: r.url,
            agrupacion_nombre: r.agrupacion_nombre,
            agrupacion_id: r.agrupacion_id,
            municipio: r.municipio,
            municipio_slug: slugify(r.municipio || ''),
            año: r.ano
          });
        });
      }
    } catch(e) { /* Supabase offline – use CSV only */ }

    return items;
  },

  async getVideos(filters = {}) {
    const db = await loadData();
    const items = [];

    // From CSV
    db.agrupaciones.forEach(ag => {
      if (filters.municipio && slugify(ag.municipio) !== slugify(filters.municipio)) return;
      ag.videos.forEach(url => {
        items.push({
          url,
          agrupacion_nombre: ag.nombre,
          agrupacion_id: ag.id,
          municipio: ag.municipio,
          municipio_slug: slugify(ag.municipio),
          año: ag.anyoNum || null,
          tipo: ag.modalidad || ''
        });
      });
    });

    // From Supabase
    try {
      const SUPA_URL = 'https://mlhcetkaiidwjfmmzpmj.supabase.co';
      const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1saGNldGthaWlkd2pmbW16cG1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1Nzc1NDcsImV4cCI6MjA5NDE1MzU0N30.-NONc0cweym8cNqvSfZt2JQUyrDSLdMz9OMZL2q-ork';
      const res = await fetch(`${SUPA_URL}/rest/v1/videos?select=*&order=created_at.desc`, {
        headers: { apikey: SUPA_KEY, Authorization: 'Bearer ' + SUPA_KEY }
      });
      if (res.ok) {
        const rows = await res.json();
        rows.forEach(r => {
          if (filters.municipio && (r.municipio_slug || slugify(r.municipio || '')) !== slugify(filters.municipio)) return;
          items.push({
            url: r.url,
            titulo: r.titulo,
            agrupacion_nombre: r.agrupacion_nombre,
            agrupacion_id: r.agrupacion_id,
            municipio: r.municipio,
            municipio_slug: r.municipio_slug || slugify(r.municipio || ''),
            año: r.ano,
            tipo: r.tipo
          });
        });
      }
    } catch(e) { /* Supabase offline */ }

    return items;
  },

  async getComponenteRoles(slug) {
    try {
      const SUPA_URL = 'https://mlhcetkaiidwjfmmzpmj.supabase.co';
      const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1saGNldGthaWlkd2pmbW16cG1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1Nzc1NDcsImV4cCI6MjA5NDE1MzU0N30.-NONc0cweym8cNqvSfZt2JQUyrDSLdMz9OMZL2q-ork';
      const res = await fetch(`${SUPA_URL}/rest/v1/componentes_extra?slug=eq.${encodeURIComponent(slug)}&select=*&order=ano.desc`, {
        headers: { apikey: SUPA_KEY, Authorization: 'Bearer ' + SUPA_KEY }
      });
      if (res.ok) return await res.json();
    } catch(e) {}
    return [];
  },

  async getAutorExtra(slug) {
    try {
      const SUPA_URL = 'https://mlhcetkaiidwjfmmzpmj.supabase.co';
      const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1saGNldGthaWlkd2pmbW16cG1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1Nzc1NDcsImV4cCI6MjA5NDE1MzU0N30.-NONc0cweym8cNqvSfZt2JQUyrDSLdMz9OMZL2q-ork';
      const res = await fetch(`${SUPA_URL}/rest/v1/autores_extra?slug=eq.${encodeURIComponent(slug)}&select=*`, {
        headers: { apikey: SUPA_KEY, Authorization: 'Bearer ' + SUPA_KEY }
      });
      if (res.ok) { const rows = await res.json(); return rows[0] || null; }
    } catch(e) {}
    return null;
  },

  async getAutoresFromDB() {
    try {
      const SUPA_URL = 'https://mlhcetkaiidwjfmmzpmj.supabase.co';
      const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1saGNldGthaWlkd2pmbW16cG1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1Nzc1NDcsImV4cCI6MjA5NDE1MzU0N30.-NONc0cweym8cNqvSfZt2JQUyrDSLdMz9OMZL2q-ork';
      const res = await fetch(`${SUPA_URL}/rest/v1/autores_extra?select=*&order=nombre.asc`, {
        headers: { apikey: SUPA_KEY, Authorization: 'Bearer ' + SUPA_KEY }
      });
      if (res.ok) return await res.json();
    } catch(e) {}
    return [];
  },

  async getMunicipioExtra(slug) {
    try {
      const SUPA_URL = 'https://mlhcetkaiidwjfmmzpmj.supabase.co';
      const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1saGNldGthaWlkd2pmbW16cG1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1Nzc1NDcsImV4cCI6MjA5NDE1MzU0N30.-NONc0cweym8cNqvSfZt2JQUyrDSLdMz9OMZL2q-ork';
      const res = await fetch(`${SUPA_URL}/rest/v1/municipios_extra?slug=eq.${encodeURIComponent(slug)}&select=*`, {
        headers: { apikey: SUPA_KEY, Authorization: 'Bearer ' + SUPA_KEY }
      });
      if (res.ok) { const rows = await res.json(); return rows[0] || null; }
    } catch(e) {}
    return null;
  },

  async search(q) {
    if (!q || q.trim().length < 2) return [];
    const db = await loadData();
    const term = q.toLowerCase();
    const results = [];
    db.agrupaciones.forEach(ag => {
      if (ag.nombre.toLowerCase().includes(term))
        results.push({ type: 'agrupacion', label: ag.nombre, meta: `${ag.anyo} · ${ag.municipio}`, url: `agrupacion.html?id=${ag.id}` });
    });
    db.autores.forEach(a => {
      if (a.nombre.toLowerCase().includes(term))
        results.push({ type: 'autor', label: a.nombre, meta: `${a.agrupaciones.length} agrupaciones`, url: `autor.html?slug=${a.slug}` });
    });
    db.municipios.forEach(m => {
      if (m.nombre.toLowerCase().includes(term))
        results.push({ type: 'municipio', label: m.nombre, meta: `${m.agrupaciones.length} agrupaciones`, url: `municipio.html?slug=${m.slug}` });
    });
    db.componentes.forEach(c => {
      if (c.nombre.toLowerCase().includes(term))
        results.push({ type: 'componente', label: c.nombre, meta: `${c.agrupaciones.length} agrupaciones`, url: `persona.html?slug=${c.slug}&tipo=componente` });
    });
    return results.slice(0, 20);
  }
};

window.DataAPI = DataAPI;
window.slugify = slugify;
window.splitMulti = splitMulti;
window.loadAliases = loadAliases;
window.resolveAutorSlug = resolveAutorSlug;
