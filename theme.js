'use strict';
/* ============================================================================
   AI LEARNING PORTAL - theme.js
   Shared by index.html and references.html. The background the player equips
   drives the whole site: it sets the picture AND the color variables used by the
   navbar, buttons, lesson pills, progress bars, and card borders in style.css.
   Also runs the two Grandmaster effects (matrix rain and the glowing cursor) and
   records which pages have been visited (for the Explorer badge).
   Load this as the first thing inside <body> so the background never flashes.
   ============================================================================ */

// ---- Accounts: every profile keeps its own progress on this device ---------
// Progress keys are stored as "acct:<profile id>:<key>" ("guest" when nobody is
// logged in). Developer Mode uses a separate throwaway sandbox ("acct:dev:<id>:").
const PortalAccount = (() => {
    const ID_KEY = 'ai_portal_active_user_id';
    const DEV_KEY = 'ai_portal_dev';
    const OWNED_KEY = 'ai_portal_owned_profiles';
    // Saved for the whole device, not per profile
    const DEVICE_KEYS = new Set(['ai_portal_local_directory', 'ai_portal_owned_profiles', 'sfxMuted', 'certificates']);
    // Progress that used to be shared by everyone on this browser
    const LEGACY_KEYS = ['completedLessons', 'maxUnlockedModule', 'unitGate', 'unitTests', 'finalExam', 'gamesPlayed', 'localXP',
        'bestStreak', 'bestActionCombo', 'bossDefeated', 'perfectQuizzes', 'questionsAsked', 'seenRewards', 'inspectedCadets',
        'usedBackground', 'visitedPages', 'previewAll'];

    const read = (k, store = localStorage) => { try { return store.getItem(k); } catch { return null; } };
    const write = (k, v, store = localStorage) => { try { if (v === null) store.removeItem(k); else store.setItem(k, v); } catch { /* storage blocked */ } };

    const activeId = () => read(ID_KEY);
    const devMode = () => read(DEV_KEY, sessionStorage) === '1';
    const prefix = () => `acct:${devMode() ? 'dev:' : ''}${activeId() || 'guest'}:`;
    const key = k => DEVICE_KEYS.has(k) ? k : prefix() + k;

    const owned = () => { try { return JSON.parse(read(OWNED_KEY)) || []; } catch { return []; } };
    const markOwned = id => { if (id && !owned().includes(id)) write(OWNED_KEY, JSON.stringify([...owned(), id])); };

    // One-time move of the old shared progress to whoever was logged in at the time
    if (!read('ai_portal_accounts_v2')) {
        const owner = activeId() || 'guest';
        LEGACY_KEYS.forEach(k => {
            const v = read(k);
            if (v === null) return;
            if (read(`acct:${owner}:${k}`) === null) write(`acct:${owner}:${k}`, v);
            write(k, null);
        });
        if (activeId()) markOwned(activeId());
        write('ai_portal_accounts_v2', '1');
    }

    // Switching account or mode reloads the page, so every module starts from that account's data
    const reload = () => location.reload();
    function logIn(id) { write(ID_KEY, id); markOwned(id); reload(); }
    function logOut() { write(ID_KEY, null); reload(); }
    function setDevMode(on) {
        if (on) {
            // Fresh sandbox every time Developer Mode starts
            const stale = [];
            for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith('acct:dev:')) stale.push(k); }
            stale.forEach(k => write(k, null));
        }
        write(DEV_KEY, on ? '1' : null, sessionStorage);
        reload();
    }

    return { ID_KEY, activeId, devMode, key, owned, markOwned, logIn, logOut, setDevMode };
})();

const PortalTheme = (() => {
    const THEME_KEY = 'ai_portal_active_theme';
    const VISIT_KEY = 'visitedPages';

    // palette: accent = highlight color, accent2 = deeper partner, soft = borders and tabs,
    // alt = second glow color, btn = primary button gradient, ink = text on that gradient,
    // nav = navbar gradient (edge, middle, center)
    // Entries with "img" use a picture. The others are drawn in style.css ([data-bg="..."]).
    const BACKGROUNDS = {
        bg_default: { name: 'Default Dark', palette: { accent: '#00f2fe', accent2: '#2563eb', soft: '#38bdf8', alt: '#a855f7', btn: ['#00f2fe', '#3b82f6'], ink: '#04101a', nav: ['#050a14', '#0d1830', '#122241'] } },
        bg_electric_blue: { name: 'Electric Blue', img: 'images/Designer (5).png', palette: { accent: '#4cc9ff', accent2: '#1d4ed8', soft: '#60a5fa', alt: '#818cf8', btn: ['#7dd3fc', '#60a5fa'], ink: '#03102a', nav: ['#01061c', '#04175a', '#072383'] } },
        bg_robot_painting: { name: 'Robot Painting', img: 'images/Untitled Design (2).png', palette: { accent: '#8fd3ff', accent2: '#2f7fb8', soft: '#5eb1e0', alt: '#2dd4bf', btn: ['#e0f2fe', '#7cc4ee'], ink: '#082f49', nav: ['#0b1c28', '#143247', '#1d4764'] } },
        bg_true_gold: { name: 'True Gold', img: 'images/generate_image_02.png', palette: { accent: '#ffd700', accent2: '#b8860b', soft: '#f2c94c', alt: '#ff9f1c', btn: ['#ffe566', '#e0a812'], ink: '#1c1300', nav: ['#0d0a02', '#1f1806', '#33270a'] } },
        bg_deep_space: { name: 'Deep Space', img: 'images/generate_a_flat_front-facing_full-bleed_deep_space_cosmic_ba.jpg', palette: { accent: '#e08bff', accent2: '#7c3aed', soft: '#c084fc', alt: '#f472b6', btn: ['#f0abfc', '#a78bfa'], ink: '#180426', nav: ['#07020f', '#180a2e', '#2a1050'] } },
        bg_manga: { name: 'Manga Panels', img: 'images/bg_manga.svg', shade: [.66, .78], palette: { accent: '#f5f5f5', accent2: '#3f3f46', soft: '#d4d4d8', alt: '#ff3b5c', btn: ['#ffffff', '#d4d4d8'], ink: '#0a0a0a', nav: ['#000000', '#141414', '#232323'] } },
        bg_fuji: { name: 'Mount Fuji Twilight', img: 'images/bg_fuji.svg', shade: [.42, .62], palette: { accent: '#ffb7d0', accent2: '#be123c', soft: '#fda4c4', alt: '#fbbf24', btn: ['#ffc8dc', '#f472b6'], ink: '#2a0614', nav: ['#0a0b1f', '#1d1640', '#3a1d4f'] } },
        bg_scrappy_console: { name: 'Scrappy on Console', img: 'images/b649ac97-d785-4643-951c-191279da5b6b.jpg', palette: { accent: '#b4cde6', accent2: '#4f6d8a', soft: '#8aa9c4', alt: '#a5b4fc', btn: ['#e2e8f0', '#93b4d1'], ink: '#0f172a', nav: ['#0d1117', '#1b2430', '#273445'] } },
        bg_neon_grid: { name: 'Neon Horizon Grid', palette: { accent: '#22e4ff', accent2: '#7c3aed', soft: '#67e8f9', alt: '#c026d3', btn: ['#22e4ff', '#a78bfa'], ink: '#0b0320', nav: ['#070316', '#160a36', '#241053'] } },
        bg_aurora: { name: 'Quantum Aurora', palette: { accent: '#5eead4', accent2: '#0e7490', soft: '#34d399', alt: '#818cf8', btn: ['#6ee7b7', '#38bdf8'], ink: '#022018', nav: ['#020d16', '#07283a', '#0b3d4d'] } },
        bg_circuit: { name: 'Living Circuit', palette: { accent: '#4ade80', accent2: '#15803d', soft: '#34d399', alt: '#22d3ee', btn: ['#86efac', '#22c55e'], ink: '#03170a', nav: ['#020f0a', '#06261a', '#0a3d29'] } },
        bg_data_rain: { name: 'Data Rain', palette: { accent: '#2dd4bf', accent2: '#0f766e', soft: '#22d3ee', alt: '#4ade80', btn: ['#5eead4', '#22d3ee'], ink: '#021a1c', nav: ['#020a10', '#06202b', '#093342'] } },
        bg_plasma: { name: 'Plasma Core', palette: { accent: '#ff7ac6', accent2: '#6d28d9', soft: '#f472b6', alt: '#818cf8', btn: ['#f9a8d4', '#a78bfa'], ink: '#1f0418', nav: ['#0e0316', '#26083a', '#3d0d59'] } },
        bg_synthwave: { name: 'Synthwave Sunset', palette: { accent: '#ff9e64', accent2: '#be185d', soft: '#f472b6', alt: '#a855f7', btn: ['#fdba74', '#f472b6'], ink: '#240616', nav: ['#0b0420', '#2a0a4a', '#4a0f5e'] } },
        // The ultimate reward for passing the Final Exam
        bg_grandmaster: { name: 'Grandmaster Holo-Matrix', matrix: true, palette: { accent: '#7dfcff', accent2: '#a855f7', soft: '#f0abfc', alt: '#fde68a', btn: ['#7dfcff', '#f0abfc'], ink: '#12021f', nav: ['#03040d', '#130a2b', '#241046'] } }
    };

    const has = key => Object.prototype.hasOwnProperty.call(BACKGROUNDS, key);
    const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(',');

    // Turns a palette into every color variable that style.css reads
    function variables(key) {
        const p = BACKGROUNDS[has(key) ? key : 'bg_default'].palette;
        const holo = key === 'bg_grandmaster';
        return {
            '--accent': p.accent, '--accent-rgb': rgb(p.accent),
            '--accent-2': p.accent2, '--accent-2-rgb': rgb(p.accent2),
            '--accent-soft': p.soft, '--accent-soft-rgb': rgb(p.soft),
            '--accent-alt': p.alt, '--accent-alt-rgb': rgb(p.alt),
            '--text-accent': p.accent,
            '--accent-glow': `rgba(${rgb(p.accent)},.45)`,
            '--card-border': `rgba(${rgb(p.soft)},.4)`,
            '--card-border-strong': p.soft,
            '--nav-bg': `linear-gradient(90deg, ${p.nav[0]} 0%, ${p.nav[1]} 35%, ${p.nav[2]} 50%, ${p.nav[1]} 65%, ${p.nav[0]} 100%)`,
            '--btn-primary': holo ? 'linear-gradient(110deg, #7dfcff, #f0abfc, #fde68a)' : `linear-gradient(135deg, ${p.btn[0]}, ${p.btn[1]})`,
            '--btn-primary-text': p.ink,
            '--btn-secondary': `rgba(${rgb(p.accent)},.13)`,
            '--btn-secondary-border': p.accent,
            '--btn-secondary-text': p.accent,
            '--progress-fill': holo ? 'linear-gradient(90deg, #7dfcff, #a855f7, #f0abfc, #fde68a)' : `linear-gradient(90deg, ${p.accent}, ${p.accent2})`
        };
    }

    function current() {
        try { const k = localStorage.getItem(THEME_KEY); return has(k) ? k : 'bg_default'; }
        catch { return 'bg_default'; }
    }

    // ---- Matrix rain for the Grandmaster background -------------------------
    let matrixTimer = 0, matrixCanvas = null, onResize = null;
    function stopMatrix() {
        clearInterval(matrixTimer);
        matrixTimer = 0;
        if (onResize) window.removeEventListener('resize', onResize);
        onResize = null;
        if (matrixCanvas) matrixCanvas.remove();
        matrixCanvas = null;
    }
    function startMatrix(layer) {
        stopMatrix();
        const canvas = document.createElement('canvas');
        canvas.className = 'matrix-rain';
        layer.appendChild(canvas);
        matrixCanvas = canvas;
        const ctx = canvas.getContext('2d');
        const GLYPHS = '01<>[]{}=+*AIΣλπΔ∇';
        const CELL = 18;
        let drops = [];
        onResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            drops = Array.from({ length: Math.ceil(canvas.width / CELL) }, () => Math.random() * -40);
        };
        onResize();
        window.addEventListener('resize', onResize);
        let hue = 180;
        const draw = () => {
            if (document.hidden) return;
            // fade old glyphs to make trails, while keeping the canvas see-through
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = 'rgba(0,0,0,.12)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'source-over';
            ctx.font = `${CELL - 3}px monospace`;
            hue = (hue + 1) % 360;
            drops.forEach((y, i) => {
                ctx.fillStyle = `hsl(${(hue + i * 4) % 360} 90% 65%)`;
                ctx.fillText(GLYPHS[Math.floor(Math.random() * GLYPHS.length)], i * CELL, y * CELL);
                drops[i] = y * CELL > canvas.height && Math.random() > 0.975 ? 0 : y + 1;
            });
        };
        if (reducedMotion()) { for (let i = 0; i < 60; i++) draw(); }   // one still picture
        else matrixTimer = setInterval(draw, 70);
    }

    function apply(key) {
        const k = has(key) ? key : 'bg_default';
        const root = document.documentElement;
        Object.entries(variables(k)).forEach(([name, value]) => root.style.setProperty(name, value));
        root.dataset.theme = k;
        let layer = document.getElementById('global-bg');
        if (!layer) {
            layer = document.createElement('div');
            layer.id = 'global-bg';
            layer.setAttribute('aria-hidden', 'true');
            document.body.prepend(layer);
        }
        if (layer.dataset.bg === k) return;
        layer.dataset.bg = k;
        const { img, shade = [.78, .88] } = BACKGROUNDS[k];
        // The dark shade keeps text readable on top of bright pictures (darker scenes can use a lighter shade)
        layer.style.backgroundImage = img ? `linear-gradient(rgba(8,8,18,${shade[0]}), rgba(8,8,18,${shade[1]})), url("${img}")` : '';
        root.classList.toggle('has-global-bg', k !== 'bg_default');
        if (BACKGROUNDS[k].matrix) startMatrix(layer); else stopMatrix();
    }

    function set(key) {
        const k = has(key) ? key : 'bg_default';
        try { localStorage.setItem(THEME_KEY, k); } catch { /* storage blocked */ }
        apply(k);
    }

    function visited() {
        try { return JSON.parse(localStorage.getItem(PortalAccount.key(VISIT_KEY))) || {}; }
        catch { return {}; }
    }

    // Returns true the first time a page is visited
    function visit(page) {
        const v = visited();
        if (v[page]) return false;
        v[page] = true;
        try { localStorage.setItem(PortalAccount.key(VISIT_KEY), JSON.stringify(v)); } catch { /* storage blocked */ }
        return true;
    }

    apply(current());
    if (document.body.dataset.page) visit(document.body.dataset.page);
    // Keep other open tabs in step
    window.addEventListener('storage', e => { if (e.key === THEME_KEY) apply(current()); });

    return { BACKGROUNDS, has, current, apply, set, variables, visit, visited };
})();

/* ----------------------------------------------------------------------------
   Glowing particle cursor (Grandmaster reward). The normal pointer stays visible.
   It is skipped for touch input and for people who prefer reduced motion.
   ---------------------------------------------------------------------------- */
const PortalCursor = (() => {
    const KEY = 'ai_portal_cursor';
    const COLORS = ['#7dfcff', '#f0abfc', '#fde68a', '#a78bfa'];
    let canvas = null, ctx = null, parts = [], frame = 0, pointer = null;

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    function draw() {
        frame = 0;
        if (!canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        parts = parts.filter(p => p.life > 0);
        parts.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            p.life = Math.max(0, p.life - 0.035);      // never negative: arc() rejects a negative radius
            ctx.globalAlpha = p.life;
            ctx.shadowColor = p.color; ctx.shadowBlur = 12; ctx.fillStyle = p.color;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2); ctx.fill();
        });
        if (pointer) {
            ctx.globalAlpha = 0.9;
            ctx.strokeStyle = '#7dfcff'; ctx.shadowColor = '#f0abfc'; ctx.shadowBlur = 16; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(pointer.x, pointer.y, 15, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.globalAlpha = 1; ctx.shadowBlur = 0;
        if (parts.length) frame = requestAnimationFrame(draw);
    }
    const queue = () => { if (!frame) frame = requestAnimationFrame(draw); };
    function move(e) {
        if (e.pointerType !== 'mouse') return;
        pointer = { x: e.clientX, y: e.clientY };
        for (let i = 0; i < 2; i++) parts.push({ x: e.clientX, y: e.clientY, vx: (Math.random() - 0.5) * 1.6, vy: (Math.random() - 0.5) * 1.6 + 0.4, life: 1, size: 3 + Math.random() * 3, color: COLORS[Math.floor(Math.random() * COLORS.length)] });
        if (parts.length > 120) parts.splice(0, parts.length - 120);
        queue();
    }
    const leave = () => { pointer = null; queue(); };

    function apply(on) {
        const wanted = on && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (wanted && !canvas) {
            canvas = document.createElement('canvas');
            canvas.className = 'cursor-layer';
            canvas.setAttribute('aria-hidden', 'true');
            document.body.appendChild(canvas);
            ctx = canvas.getContext('2d');
            resize();
            window.addEventListener('resize', resize);
            window.addEventListener('pointermove', move, { passive: true });
            document.documentElement.addEventListener('pointerleave', leave);
        } else if (!wanted && canvas) {
            window.removeEventListener('resize', resize);
            window.removeEventListener('pointermove', move);
            document.documentElement.removeEventListener('pointerleave', leave);
            cancelAnimationFrame(frame);
            canvas.remove();
            canvas = null; parts = []; frame = 0; pointer = null;
        }
    }
    const saved = () => { try { return localStorage.getItem(KEY) === '1'; } catch { return false; } };
    function set(on) {
        try { localStorage.setItem(KEY, on ? '1' : '0'); } catch { /* storage blocked */ }
        apply(on);
    }

    apply(saved());
    window.addEventListener('storage', e => { if (e.key === KEY) apply(saved()); });

    return { set, isOn: saved, isActive: () => !!canvas };
})();
