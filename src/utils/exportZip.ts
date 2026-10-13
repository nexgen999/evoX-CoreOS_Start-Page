import JSZip from 'jszip';
import { AppConfig } from '../types/config';
import { DEFAULT_TRANSLATIONS, LANGUAGES } from '../data/translationsData';

export async function exportGitHubZip(config: AppConfig) {
  const zip = new JSZip();

  // 1. Sanitized config for production (without editor buttons)
  const prodConfig: AppConfig = {
    ...config,
    appearance: {
      ...config.appearance,
      showConfigButtons: false
    }
  };

  // Add config.json and json/config.json
  const configContent = JSON.stringify(prodConfig, null, 2);
  zip.file('config.json', configContent);
  zip.file('json/config.json', configContent);

  // 2. Add translations folder with all 30 languages
  const transFolder = zip.folder('translations');
  if (transFolder) {
    for (const [code, transData] of Object.entries(DEFAULT_TRANSLATIONS)) {
      transFolder.file(`${code}.json`, JSON.stringify(transData, null, 2));
    }
    transFolder.file('index.json', JSON.stringify(LANGUAGES, null, 2));
  }

  // 3. Add assets folder
  const assetsFolder = zip.folder('assets');
  if (assetsFolder) {
    // Add evox.svg
    try {
      const evoxRes = await fetch('/assets/evox.svg');
      if (evoxRes.ok) {
        const evoxText = await evoxRes.text();
        assetsFolder.file('evox.svg', evoxText);
      }
    } catch (e) {
      console.warn('Could not fetch evox.svg for zip', e);
    }

    // Add playstation-light.png
    try {
      const psRes = await fetch('/assets/playstation-light.png');
      if (psRes.ok) {
        const psBlob = await psRes.blob();
        assetsFolder.file('playstation-light.png', psBlob);
      }
    } catch (e) {
      console.warn('Could not fetch playstation-light.png for zip', e);
    }
  }

  // 4. Generate standalone index.html (Optimized for PS5 browser, NO config gear and NO json button)
  const standaloneHtml = generateStandaloneHtml(prodConfig);
  zip.file('index.html', standaloneHtml);

  // 5. Add README.md with clear GitHub deployment instructions
  const readmeContent = `# ${config.title || 'evoX Start Page Browser'}

Page de démarrage ultra-rapide et personnalisable, optimisée pour le navigateur de la PlayStation 5 (et manette DualSense).

## 🚀 Mise en ligne sur GitHub Pages en 2 minutes

1. Créez un nouveau dépôt public sur votre compte GitHub (ex: \`ps5-start\` ou \`evoX-browser\`).
2. Déposez tous les fichiers de ce dossier ZIP à la racine du dépôt (\`index.html\`, \`config.json\`, dossier \`assets/\`, dossier \`translations/\`).
3. Allez dans **Settings** > **Pages** de votre dépôt GitHub.
4. Dans **Build and deployment**, choisissez **Source: Deploy from a branch**, branche **main** (ou \`master\`), dossier **/ (root)**.
5. Cliquez sur **Save**.
6. Votre page sera disponible à l'adresse : \`https://<votre-pseudo>.github.io/<nom-du-repo>/\` !

## 🎮 Compatibilité PS5
- Navigation fluide à la manette et au curseur virtuel.
- Ligne 1 : Les 6 raccourcis officiels evoX.
- Ligne 2 : Vos raccourcis et favoris personnalisés ajoutés via le bouton GÉRER / AJOUTER (enregistrés en local sur votre console).
- 30 langues disponibles via le sélecteur en haut à droite.
- Badges officiels PlayStation® et GitHub.
`;
  zip.file('README.md', readmeContent);

  // 6. Generate ZIP file and trigger download
  const blob = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = 'evox-start-page-browser-github.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}

// Standalone Production HTML generator (No config gear button, no CONFIG.JSON button, clean & pure)
function generateStandaloneHtml(config: AppConfig): string {
  return `<!doctype html>
<html lang="${config.language || 'fr'}" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <meta name="color-scheme" content="dark" />
  <title>${config.title || 'evoX Start Page Browser'}</title>
  <link rel="icon" type="image/png" href="assets/playstation-light.png" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    :root {
      --bg: #070b14;
      --accent: #43e0e0;
      --blue: #46a4ff;
    }
    body {
      background-color: var(--bg);
      background-image: radial-gradient(ellipse at 50% 0%, #17345c 0%, #0b1426 42%, #060911 100%);
      min-height: 100vh;
      color: #f3f7ff;
      user-select: none;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    body::before {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      opacity: 0.14;
      background: linear-gradient(120deg, transparent 0 48%, rgba(67,224,224,.11) 48.2%, transparent 48.5%),
                  linear-gradient(30deg, transparent 0 69%, rgba(70,164,255,.10) 69.2%, transparent 69.5%);
      z-index: 0;
    }
    :focus-visible {
      outline: 3px solid #43e0e0 !important;
      outline-offset: 3px !important;
      box-shadow: 0 0 25px rgba(67, 224, 224, 0.75) !important;
    }
  </style>
</head>
<body class="overflow-x-hidden antialiased">
  <div class="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 min-h-screen flex flex-col justify-between">
    <!-- Header -->
    <header class="flex items-center justify-between gap-4 mb-8 sm:mb-10 pt-2">
      <div class="flex items-center gap-3.5">
        <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-[#173866] to-[#0a162b] border border-[#43e0e0]/30 shadow-lg flex items-center justify-center overflow-hidden">
          <img src="${config.brand?.icon || 'assets/playstation-light.png'}" alt="Logo" class="w-7 h-7 object-contain drop-shadow" onerror="this.src='assets/playstation-light.png'" />
        </div>
        <div>
          <h1 class="text-base sm:text-lg font-black tracking-wider uppercase text-white flex items-center">
            <span>evo</span><span class="text-[#38bdf8]">X</span>
            <span class="ml-1.5 font-light text-slate-300 text-xs sm:text-sm tracking-normal capitalize">Start Page Browser</span>
          </h1>
          <p class="text-[11px] text-slate-400 font-mono tracking-tight hidden sm:block">PlayStation®5 Web Experience</p>
        </div>
      </div>

      <!-- Language Button Only (No config gear!) -->
      <button id="langBtn" type="button" class="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-[#162744] border border-blue-400/25 text-slate-200 cursor-pointer">
        <span id="currentFlag" class="text-lg">🇫🇷</span>
        <div class="flex flex-col text-left leading-none">
          <span id="currentCode" class="text-[11px] font-bold text-cyan-300 uppercase">FR</span>
          <span id="currentName" class="text-[10px] text-slate-400">Français</span>
        </div>
        <i class="fa-solid fa-chevron-down text-[10px] text-slate-400 ml-0.5"></i>
      </button>
    </header>

    <!-- Main -->
    <main class="flex-1 flex flex-col justify-center">
      <!-- Hero -->
      <section class="text-center mx-auto mb-7 sm:mb-9">
        <div class="relative inline-block mb-3">
          <a href="${config.profile?.github || 'https://github.com/nexgen999'}" target="_blank" rel="noopener">
            <img src="${config.profile?.avatar || 'https://github.com/nexgen999.png'}" alt="Avatar" class="w-20 h-20 sm:w-22 sm:h-22 rounded-full border-3 border-cyan-400/80 shadow-[0_0_24px_rgba(56,189,248,0.35)] object-cover bg-slate-900" />
            <span class="absolute right-1 bottom-1 w-4 h-4 rounded-full bg-[#41e0ae] border-3 border-[#070b14]"></span>
          </a>
        </div>
        <h2 class="text-2xl sm:text-4xl font-extrabold text-white mb-2">
          <span id="welcomeTxt" class="font-normal text-slate-200">Bienvenue sur</span> <span class="text-white">evo</span><span class="text-[#38bdf8]">X</span>
        </h2>
        <p id="subTxt" class="text-sm sm:text-base text-slate-400 max-w-md mx-auto font-medium">Tout votre web, au même endroit.</p>
      </section>

      <!-- Search Bar -->
      <div class="max-w-3xl mx-auto mb-8 sm:mb-10 w-full">
        <form id="searchForm" class="flex items-center gap-2 p-1.5 sm:p-2 bg-slate-900/90 border border-slate-700/60 rounded-2xl shadow-xl">
          <div class="pl-3 sm:pl-4 text-cyan-400 text-lg"><i class="fa-solid fa-magnifying-glass"></i></div>
          <input id="searchInput" type="text" placeholder="Entrer une URL ou rechercher sur le Web…" class="flex-1 bg-transparent border-0 py-2.5 sm:py-3.5 px-2 text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none" autocomplete="off" />
          <button type="submit" class="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs sm:text-sm uppercase cursor-pointer">GO ↗</button>
        </form>
        <div id="searchHint" class="text-center text-[11px] sm:text-xs text-slate-400 mt-2 px-2">Saisissez une URL ou un terme de recherche, puis appuyez sur Entrée.</div>
      </div>

      <!-- Shortcuts Section -->
      <section class="mb-10 w-full">
        <div class="flex items-center justify-between gap-3 mb-2 px-1">
          <h3 class="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-200 flex items-center gap-2">
            <span class="w-1.5 h-3.5 rounded-full bg-cyan-400 inline-block shadow-[0_0_8px_rgba(56,189,248,0.8)]"></span>
            <span id="shortcutsTitle">Mes raccourcis</span>
          </h3>
          <div class="flex items-center gap-2">
            <button id="editBtn" type="button" class="px-3 py-1.5 rounded-xl text-xs font-bold uppercase bg-slate-800/80 text-slate-300 border border-slate-700/60 cursor-pointer">GÉRER</button>
            <button id="addBtn" type="button" class="px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase bg-gradient-to-r from-blue-600/90 to-cyan-600/90 text-white border border-cyan-400/30 cursor-pointer">＋ AJOUTER</button>
          </div>
        </div>

        <!-- Row 1: The 6 Official Shortcuts -->
        <div class="pt-3 pb-2 px-1">
          <div id="officialGrid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3 w-full"></div>
        </div>

        <!-- Row 2: User custom shortcuts -->
        <div id="customRowSection" class="mt-4 pt-3 pb-2 px-1 border-t border-slate-800/50">
          <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3 px-1 flex items-center gap-2">
            <i class="fa-solid fa-bookmark text-cyan-400 text-xs"></i>
            <span>Raccourcis personnalisés</span>
          </div>
          <div id="customGrid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3 w-full"></div>
        </div>
      </section>
    </main>

    <!-- Footer: Badges & Links (No CONFIG.JSON button!) -->
    <footer class="mt-14 pt-8 pb-10 border-t border-slate-800/80">
      <div class="mb-8">
        <div class="text-[11px] font-bold tracking-wider uppercase text-slate-400 mb-3 flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          <span>Badges & Écosystème</span>
        </div>
        <div id="footerBadges" class="flex flex-wrap items-center gap-3"></div>
      </div>

      <div class="flex flex-col md:flex-row items-center justify-between gap-5 text-xs text-slate-400">
        <div>
          <div class="font-semibold text-slate-200 flex items-center gap-2 mb-1">
            <span>${config.footer?.text || 'evoX Start Page Browser'}</span>
            <span class="text-cyan-400">◆</span>
            <span class="text-[11px] text-slate-400">${config.footer?.copyright || 'PS5 Edition'}</span>
          </div>
          <p class="text-[11px] text-slate-400">${config.footer?.subtext || 'Conçue pour une navigation simple et fluide sur PS5.'}</p>
        </div>
        <div id="footerLinks" class="flex flex-wrap items-center gap-4"></div>
      </div>
    </footer>
  </div>

  <!-- Add Modal -->
  <div id="addModal" class="fixed inset-0 z-50 hidden items-center justify-center p-4 bg-black/80 backdrop-blur-md">
    <div class="w-full max-w-md bg-[#0f172a] border border-blue-500/40 rounded-2xl p-6 shadow-2xl">
      <h3 class="text-lg font-bold text-white mb-4">Ajouter un raccourci</h3>
      <form id="addForm" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Nom affiché</label>
          <input id="newTileName" type="text" required placeholder="Ex. YouTube / Reddit" class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Adresse URL</label>
          <input id="newTileUrl" type="text" required placeholder="https://..." class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Icône (Font Awesome ou URL)</label>
          <input id="newTileIcon" type="text" placeholder="fa-solid fa-globe" value="fa-solid fa-globe" class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm" />
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button id="closeModalBtn" type="button" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold uppercase cursor-pointer">ANNULER</button>
          <button type="submit" class="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold uppercase cursor-pointer">ENREGISTRER</button>
        </div>
      </form>
    </div>
  </div>

  <script>
    const CONFIG = ${JSON.stringify(prodConfig)};
    let customShortcuts = [];
    try {
      const saved = localStorage.getItem('evox_custom_shortcuts');
      if (saved) customShortcuts = JSON.parse(saved);
    } catch(e) {}

    let isEditing = false;

    function renderShortcuts() {
      const offContainer = document.getElementById('officialGrid');
      offContainer.innerHTML = '';
      (CONFIG.shortcuts || []).forEach((item, idx) => {
        offContainer.appendChild(createTile(item, idx, false));
      });

      const custContainer = document.getElementById('customGrid');
      custContainer.innerHTML = '';
      customShortcuts.forEach((item, idx) => {
        custContainer.appendChild(createTile(item, idx, true));
      });

      // Quick add tile
      const addTile = document.createElement('div');
      addTile.className = 'min-h-[108px] rounded-xl p-3 flex flex-col items-center justify-center gap-2 border border-dashed border-slate-700 hover:border-cyan-400 bg-slate-900/30 text-slate-400 hover:text-cyan-300 cursor-pointer';
      addTile.innerHTML = '<div class="w-9 h-9 rounded-lg flex items-center justify-center bg-slate-800 border border-slate-700"><i class="fa-solid fa-plus text-sm"></i></div><span class="text-[11px] font-bold">Ajouter un favori</span>';
      addTile.onclick = () => document.getElementById('addModal').classList.replace('hidden', 'flex');
      custContainer.appendChild(addTile);
    }

    function createTile(item, idx, isCustom) {
      const a = document.createElement(isEditing ? 'div' : 'a');
      a.className = 'relative min-h-[108px] rounded-xl p-3 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-[#15233c]/85 to-[#0b1322]/95 border border-slate-700/60 shadow-md hover:border-cyan-400/80 transition-all hover:scale-[1.03] cursor-pointer';
      if (!isEditing) a.href = item.url;

      const isImg = item.type === 'image' || item.icon.includes('/') || item.icon.endsWith('.svg') || item.icon.endsWith('.png');
      const iconHtml = isImg
        ? '<img src="' + item.icon + '" class="w-full h-full object-contain p-1" />'
        : '<i class="' + (item.icon || 'fa-solid fa-globe') + ' text-xl text-cyan-300"></i>';

      a.innerHTML = '<div class="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#1b2f4f] to-[#101b2d] border border-blue-400/20 overflow-hidden">' + iconHtml + '</div>' +
                    '<div class="text-[11px] font-bold text-slate-100 text-center line-clamp-2 leading-tight">' + item.name + '</div>';

      if (isEditing) {
        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-black shadow-xl cursor-pointer';
        delBtn.textContent = '✕';
        delBtn.onclick = (e) => {
          e.stopPropagation();
          if (isCustom) {
            customShortcuts.splice(idx, 1);
            localStorage.setItem('evox_custom_shortcuts', JSON.stringify(customShortcuts));
          } else {
            CONFIG.shortcuts.splice(idx, 1);
          }
          renderShortcuts();
        };
        a.appendChild(delBtn);
      }
      return a;
    }

    function renderBadges() {
      const c = document.getElementById('footerBadges');
      c.innerHTML = '';
      (CONFIG.footer?.badges || []).forEach(b => {
        const a = document.createElement(b.url ? 'a' : 'div');
        if (b.url) { a.href = b.url; a.target = '_blank'; }
        a.className = 'flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-transform hover:-translate-y-0.5';
        a.style.backgroundColor = b.bgColor || '#003791';
        a.style.borderColor = b.accentColor || 'rgba(255,255,255,0.15)';
        a.style.color = b.textColor || '#fff';

        const iconHtml = b.iconImage
          ? '<img src="' + b.iconImage + '" class="w-5 h-5 object-contain" />'
          : (b.icon ? '<i class="' + b.icon + ' text-base"></i>' : '');

        a.innerHTML = iconHtml + '<div class="flex flex-col text-left leading-tight"><span class="text-xs font-black uppercase">' + b.label + '</span>' + (b.subLabel ? '<span class="text-[9px] opacity-85 font-mono">' + b.subLabel + '</span>' : '') + '</div>';
        c.appendChild(a);
      });

      const l = document.getElementById('footerLinks');
      l.innerHTML = '';
      (CONFIG.footer?.links || []).forEach(lnk => {
        const link = document.createElement('a');
        link.href = lnk.url;
        link.target = '_blank';
        link.className = 'text-slate-300 hover:text-cyan-300 font-medium';
        link.textContent = lnk.name;
        l.appendChild(link);
      });
    }

    // Search logic
    document.getElementById('searchForm').onsubmit = (e) => {
      e.preventDefault();
      const val = document.getElementById('searchInput').value.trim();
      if (!val) return;
      if (/^[a-z]+:\\/\\//i.test(val) || (val.includes('.') && !val.includes(' '))) {
        location.href = /^[a-z]+:\\/\\//i.test(val) ? val : 'https://' + val;
      } else {
        location.href = (CONFIG.searchEngine || 'https://www.google.com/search?q={query}').replace('{query}', encodeURIComponent(val));
      }
    };

    // Edit button toggle
    document.getElementById('editBtn').onclick = () => {
      isEditing = !isEditing;
      document.getElementById('editBtn').textContent = isEditing ? 'TERMINER' : 'GÉRER';
      document.getElementById('editBtn').className = isEditing
        ? 'px-3 py-1.5 rounded-xl text-xs font-bold uppercase bg-amber-500/25 text-amber-300 border border-amber-500/60 cursor-pointer'
        : 'px-3 py-1.5 rounded-xl text-xs font-bold uppercase bg-slate-800/80 text-slate-300 border border-slate-700/60 cursor-pointer';
      renderShortcuts();
    };

    // Add modal logic
    document.getElementById('addBtn').onclick = () => document.getElementById('addModal').classList.replace('hidden', 'flex');
    document.getElementById('closeModalBtn').onclick = () => document.getElementById('addModal').classList.replace('hidden', 'flex');
    document.getElementById('addForm').onsubmit = (e) => {
      e.preventDefault();
      const name = document.getElementById('newTileName').value.trim();
      let url = document.getElementById('newTileUrl').value.trim();
      const icon = document.getElementById('newTileIcon').value.trim() || 'fa-solid fa-globe';
      if (!/^[a-z]+:\\/\\//i.test(url)) url = 'https://' + url;
      customShortcuts.push({ name, url, icon, type: 'fontawesome' });
      localStorage.setItem('evox_custom_shortcuts', JSON.stringify(customShortcuts));
      document.getElementById('addModal').classList.replace('flex', 'hidden');
      document.getElementById('addForm').reset();
      renderShortcuts();
    };

    renderShortcuts();
    renderBadges();
  </script>
</body>
</html>`;
}
