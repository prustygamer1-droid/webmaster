'use strict';
/* ============================================================================
   AI LEARNING PORTAL - theme.js
   Shared by index.html and references.html: the site-wide background the player
   equipped, plus a record of which pages have been visited (for the Explorer badge).
   Load this as the first thing inside <body> so the background never flashes.
   ============================================================================ */
const PortalTheme = (() => {
    const THEME_KEY = 'ai_portal_active_theme';
    const VISIT_KEY = 'visitedPages';

    // Entries with "img" use a picture. Entries without one are drawn in style.css ([data-bg="..."]).
    const BACKGROUNDS = {
        bg_default: { name: 'Default Dark' },
        bg_electric_blue: { name: 'Electric Blue', img: 'images/Designer (5).png' },
        bg_robot_painting: { name: 'Robot Painting', img: 'images/Untitled Design (2).png' },
        bg_true_gold: { name: 'True Gold', img: 'images/generate_image_02.png' },
        bg_deep_space: { name: 'Deep Space', img: 'images/generate_a_flat_front-facing_full-bleed_deep_space_cosmic_ba.jpg' },
        bg_scrappy_console: { name: 'Scrappy on Console', img: 'images/b649ac97-d785-4643-951c-191279da5b6b.jpg' },
        bg_neon_grid: { name: 'Neon Horizon Grid' },
        bg_aurora: { name: 'Quantum Aurora' },
        bg_circuit: { name: 'Living Circuit' },
        bg_data_rain: { name: 'Data Rain' },
        bg_plasma: { name: 'Plasma Core' },
        bg_synthwave: { name: 'Synthwave Sunset' }
    };

    const has = key => Object.prototype.hasOwnProperty.call(BACKGROUNDS, key);

    function current() {
        try { const k = localStorage.getItem(THEME_KEY); return has(k) ? k : 'bg_default'; }
        catch { return 'bg_default'; }
    }

    function apply(key) {
        const k = has(key) ? key : 'bg_default';
        let layer = document.getElementById('global-bg');
        if (!layer) {
            layer = document.createElement('div');
            layer.id = 'global-bg';
            layer.setAttribute('aria-hidden', 'true');
            document.body.prepend(layer);
        }
        if (layer.dataset.bg === k) return;
        layer.dataset.bg = k;
        const img = BACKGROUNDS[k].img;
        // The dark shade keeps text readable on top of bright pictures
        layer.style.backgroundImage = img ? `linear-gradient(rgba(8,8,18,.78), rgba(8,8,18,.88)), url("${img}")` : '';
        document.documentElement.classList.toggle('has-global-bg', k !== 'bg_default');
    }

    function set(key) {
        const k = has(key) ? key : 'bg_default';
        try { localStorage.setItem(THEME_KEY, k); } catch { /* storage blocked */ }
        apply(k);
    }

    function visited() {
        try { return JSON.parse(localStorage.getItem(VISIT_KEY)) || {}; }
        catch { return {}; }
    }

    // Returns true the first time a page is visited
    function visit(page) {
        const v = visited();
        if (v[page]) return false;
        v[page] = true;
        try { localStorage.setItem(VISIT_KEY, JSON.stringify(v)); } catch { /* storage blocked */ }
        return true;
    }

    apply(current());
    if (document.body.dataset.page) visit(document.body.dataset.page);
    // Keep other open tabs in step
    window.addEventListener('storage', e => { if (e.key === THEME_KEY) apply(current()); });

    return { BACKGROUNDS, has, current, apply, set, visit, visited };
})();
