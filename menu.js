/* ==========================================================================
   menu.js · Hotel Agua del Corral
   Encabezado, menú desplegable y selector de idioma compartidos por todas
   las páginas del sitio. Para agregar, quitar o renombrar una opción del
   menú, o cambiar el teléfono o el enlace de reseñas, edite SOLO este archivo.

   Uso en cada página (justo después de <body>):
       <script src="menu.js"></script>

   API pública (window.AGC):
       AGC.lang            idioma actual: 'es' | 'pt' | 'en'
       AGC.setLang(l)      cambia el idioma
       AGC.onLang(fn)      ejecuta fn(lang) ahora y en cada cambio de idioma
       AGC.i18n(dict)      traduce los elementos [data-i18n] / [data-i18n-attr]
       AGC.t(clave)        devuelve un texto traducido de la página actual
       AGC.closeMenu()     cierra el menú desplegable
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------- Configuración editable ------------------------- */
  var CONFIG = {
    phone: '+5492612352727',
    reviewUrl: 'https://g.page/r/tu-enlace-de-google-reviews', // ← REEMPLAZAR por el enlace real de reseñas
    langKey: 'agc_lang',
    langs: ['es', 'pt', 'en']
  };

  var ITEMS = [
    { k: 'map',        href: 'index.html',       icon: 'location-dot' },
    { k: 'services',   href: 'servicios.html',   icon: 'concierge-bell' },
    { k: 'spa',        href: 'spa.html',         icon: 'spa' },
    { k: 'restaurant', href: 'restaurante.html', icon: 'utensils' },
    { k: 'contact',    href: 'tel:' + CONFIG.phone, icon: 'headset', noCurrent: true },
    { k: 'blog',       href: 'blog.html',        icon: 'book-open' },
    { k: 'review',     href: CONFIG.reviewUrl,   icon: 'star', external: true, noCurrent: true }
  ];

  var LABELS = {
    es: { map: 'Mapa', services: 'Servicios', spa: 'Servicios Spa', restaurant: 'Restaurante', contact: 'Contacto', blog: 'Blog', review: 'Dejar reseña', menu: 'Menú principal', lang: 'Idioma' },
    pt: { map: 'Mapa', services: 'Serviços', spa: 'Serviços de Spa', restaurant: 'Restaurante', contact: 'Contato', blog: 'Blog', review: 'Deixar avaliação', menu: 'Menu principal', lang: 'Idioma' },
    en: { map: 'Map', services: 'Services', spa: 'Spa Services', restaurant: 'Restaurant', contact: 'Contact', blog: 'Blog', review: 'Leave a review', menu: 'Main menu', lang: 'Language' }
  };

  var LANG_NAMES = { es: 'Español', pt: 'Português', en: 'English' };

  /* Banderas en SVG (se ven igual en todos los dispositivos, a diferencia de los emojis) */
  var SVG_OPEN = '<svg viewBox="0 0 30 20" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">';
  var FLAGS = {
    es: SVG_OPEN + '<rect width="30" height="20" fill="#AA151B"/><rect y="5" width="30" height="10" fill="#F1BF00"/></svg>',
    pt: SVG_OPEN + '<rect width="30" height="20" fill="#009C3B"/><polygon points="15,3 24,10 15,17 6,10" fill="#FFDF00"/><circle cx="15" cy="10" r="4" fill="#002776"/><path d="M11.2 9.3q3.8-1.2 7.6 1.6" stroke="#fff" stroke-width=".8" fill="none"/></svg>',
    en: SVG_OPEN + '<rect width="30" height="20" fill="#fff"/><rect x="12.5" width="5" height="20" fill="#CE1124"/><rect y="7.5" width="30" height="5" fill="#CE1124"/></svg>'
  };

  /* ------------------------------- Estilos ------------------------------- */
  var CSS = [
    '.agc-header{background:linear-gradient(135deg,#111E2B 0%,#1A2B3C 100%);color:#FFF;',
    'padding:calc(12px + env(safe-area-inset-top,0px)) calc(16px + env(safe-area-inset-right,0px)) 12px calc(16px + env(safe-area-inset-left,0px));',
    'display:flex;justify-content:space-between;align-items:center;gap:12px;box-shadow:0 4px 20px rgba(0,0,0,.15);',
    'z-index:3000;border-bottom:2px solid #C5A059;position:sticky;top:0;flex:0 0 auto;font-family:"Plus Jakarta Sans",sans-serif}',
    '.agc-brand{color:inherit;text-decoration:none;display:block;min-width:0}',
    '.agc-header .brand-title{font-family:"Playfair Display",serif;font-size:clamp(1.05rem,4vw,1.4rem);font-weight:700;letter-spacing:.5px;line-height:1.15}',
    '.agc-header .brand-subtitle{font-size:clamp(.62rem,2.4vw,.75rem);color:#C5A059;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;margin-top:2px}',
    '.agc-header .header-right{display:flex;align-items:center;gap:10px;flex:0 0 auto}',
    '.agc-header .lang-switch{display:flex;gap:2px;background:rgba(255,255,255,.1);border-radius:999px;padding:3px}',
    '.agc-header .lang-btn{width:32px;height:32px;border:2px solid transparent;border-radius:50%;background:transparent;padding:0;cursor:pointer;',
    'display:flex;align-items:center;justify-content:center;opacity:.55;transition:opacity .2s,border-color .2s,transform .2s}',
    '.agc-header .lang-btn:hover{opacity:.9}',
    '.agc-header .lang-btn.active{opacity:1;border-color:#C5A059;transform:scale(1.05)}',
    '.agc-header .flag{width:22px;height:22px;border-radius:50%;overflow:hidden;display:block;box-shadow:0 0 0 1px rgba(0,0,0,.25)}',
    '.agc-header .flag svg{width:100%;height:100%;display:block}',
    '.agc-header .menu-wrap{position:relative;z-index:4000}',
    '.agc-header .menu-toggle{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:#FFF;',
    'display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:1rem;transition:background .2s}',
    '.agc-header .menu-toggle:hover{background:rgba(255,255,255,.2)}',
    '.agc-header .dropdown-menu{position:absolute;right:0;top:calc(100% + 8px);background:#FFF;border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.25);',
    'width:230px;padding:8px;display:none;z-index:9999;animation:agcFade .15s ease-out}',
    '.agc-header .dropdown-menu.open{display:block}',
    '@keyframes agcFade{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}',
    '.agc-header .menu-item{display:flex;align-items:center;gap:10px;width:100%;padding:11px 14px;border:none;background:transparent;text-align:left;cursor:pointer;',
    'font:500 .9rem "Plus Jakarta Sans",sans-serif;color:#2D3748;border-radius:8px;text-decoration:none;transition:background .15s,color .15s}',
    '.agc-header .menu-item i{color:#C5A059;width:18px;text-align:center}',
    '.agc-header .menu-item:hover{background:#F7FAFC;color:#1A2B3C}',
    '.agc-header .menu-item.current{background:#FBF5E8;color:#1A2B3C;font-weight:600}'
  ].join('');

  /* ------------------------------- Estado ------------------------------- */
  var lang = 'es';
  var listeners = [];
  var dict = null;      // diccionario de la página (AGC.i18n)
  var base = {};        // textos originales (español) tomados del HTML

  function qsa(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  function detectLang() {
    try {
      var saved = localStorage.getItem(CONFIG.langKey);
      if (CONFIG.langs.indexOf(saved) > -1) return saved;
    } catch (e) {}
    var nav = String(navigator.language || 'es').toLowerCase().slice(0, 2);
    return CONFIG.langs.indexOf(nav) > -1 ? nav : 'es';
  }

  /* ----------------------------- Construcción ----------------------------- */
  var style = document.createElement('style');
  style.id = 'agc-header-style';
  style.textContent = CSS;
  document.head.appendChild(style);

  var file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  var header = document.createElement('header');
  header.className = 'agc-header';

  var langBtns = CONFIG.langs.map(function (l) {
    return '<button type="button" class="lang-btn" data-lang="' + l + '" aria-label="' + LANG_NAMES[l] + '" title="' + LANG_NAMES[l] + '">' +
           '<span class="flag">' + FLAGS[l] + '</span></button>';
  }).join('');

  var menuItems = ITEMS.map(function (it) {
    var current = !it.noCurrent && it.href.toLowerCase() === file;
    return '<a href="' + it.href + '" class="menu-item' + (current ? ' current' : '') + '"' +
           (current ? ' aria-current="page"' : '') +
           (it.external ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' +
           '<i class="fa-solid fa-' + it.icon + '"></i> <span data-k="' + it.k + '"></span></a>';
  }).join('');

  header.innerHTML =
    '<a class="agc-brand" href="index.html"><div class="brand-title">Agua del Corral</div>' +
    '<div class="brand-subtitle">Hotel &amp; Spa • Mendoza</div></a>' +
    '<div class="header-right">' +
      '<div class="lang-switch" role="group" id="agc-lang-group">' + langBtns + '</div>' +
      '<div class="menu-wrap">' +
        '<button type="button" class="menu-toggle" id="menu-btn" aria-haspopup="true" aria-expanded="false"><i class="fa-solid fa-bars"></i></button>' +
        '<div class="dropdown-menu" id="dropdown-menu">' + menuItems + '</div>' +
      '</div>' +
    '</div>';

  var anchor = document.currentScript;
  if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(header, anchor);
  else document.body.insertBefore(header, document.body.firstChild);

  var menuBtn = header.querySelector('#menu-btn');
  var dropdown = header.querySelector('#dropdown-menu');

  /* Altura del encabezado disponible para el CSS de cada página */
  function setHeaderHeight() {
    document.documentElement.style.setProperty('--agc-header-h', header.offsetHeight + 'px');
  }
  setHeaderHeight();
  window.addEventListener('resize', setHeaderHeight);
  window.addEventListener('load', setHeaderHeight);

  /* ------------------------------- Menú ------------------------------- */
  function closeMenu() {
    dropdown.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }

  menuBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = dropdown.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) document.dispatchEvent(new CustomEvent('agc:menuopen'));
  });
  document.addEventListener('click', closeMenu);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* ------------------------------- Idioma ------------------------------- */
  function renderChrome() {
    var L = LABELS[lang];
    header.querySelectorAll('[data-k]').forEach(function (el) { el.textContent = L[el.getAttribute('data-k')]; });
    menuBtn.setAttribute('aria-label', L.menu);
    header.querySelector('#agc-lang-group').setAttribute('aria-label', L.lang);
    header.querySelectorAll('.lang-btn').forEach(function (b) {
      var on = b.getAttribute('data-lang') === lang;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function pick(key) {
    var d = dict && dict[lang];
    if (d && d[key] !== undefined) return d[key];
    if (dict && dict.es && dict.es[key] !== undefined) return dict.es[key];
    return base[key];
  }

  function applyDict() {
    if (!dict) return;
    qsa('[data-i18n]').forEach(function (el) {
      var v = pick(el.getAttribute('data-i18n'));
      if (v !== undefined) el.innerHTML = v;
    });
    qsa('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var p = pair.split(':');
        if (p.length !== 2) return;
        var v = pick(p[1].trim());
        if (v !== undefined) el.setAttribute(p[0].trim(), v);
      });
    });
    var t = pick('title');
    if (t) document.title = t;
  }

  function setLang(l, persist) {
    if (CONFIG.langs.indexOf(l) < 0) l = 'es';
    lang = l;
    if (persist) { try { localStorage.setItem(CONFIG.langKey, l); } catch (e) {} }
    document.documentElement.lang = l;
    renderChrome();
    applyDict();
    listeners.slice().forEach(function (fn) { try { fn(l); } catch (err) { console.error(err); } });
    document.dispatchEvent(new CustomEvent('agc:lang', { detail: { lang: l } }));
  }

  header.querySelectorAll('.lang-btn').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang'), true); });
  });

  /* -------------------------------- API -------------------------------- */
  window.AGC = {
    get lang() { return lang; },
    setLang: function (l) { setLang(l, true); },
    onLang: function (fn) { listeners.push(fn); fn(lang); },
    closeMenu: closeMenu,
    t: function (key) { var v = pick(key); return v === undefined ? key : v; },
    i18n: function (d) {
      dict = d || {};
      /* Se toma el español original directamente del HTML de la página */
      qsa('[data-i18n]').forEach(function (el) {
        var k = el.getAttribute('data-i18n');
        if (!(k in base)) base[k] = el.innerHTML;
      });
      qsa('[data-i18n-attr]').forEach(function (el) {
        el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
          var p = pair.split(':');
          if (p.length === 2 && !(p[1].trim() in base)) base[p[1].trim()] = el.getAttribute(p[0].trim());
        });
      });
      if (!('title' in base)) base.title = document.title;
      applyDict();
    }
  };

  setLang(detectLang(), false);
})();
