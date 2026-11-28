'use strict';
/* ============================================================================
   AI LEARNING PORTAL - icons.js
   One hand-drawn SVG icon set (24 x 24 line icons) used across the site in
   place of emoji. Page text and templates can keep their emoji as plain
   markers: this file swaps each one for its matching icon as content is
   added to the page, so every page, toast and leaderboard looks consistent.
   Game canvases, text inputs and the page title are left untouched.
   Load at the end of <body>, before app.js.
   ============================================================================ */
const PortalIcons = (() => {
    // Inner SVG markup for each icon (stroked with currentColor; see .picon in style.css)
    const P = {
        check: '<path d="M20 6 9 17l-5-5"/>',
        'check-circle': '<circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/>',
        x: '<path d="M18 6 6 18M6 6l12 12"/>',
        'x-circle': '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
        lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
        unlock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>',
        vault: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="12" cy="12" r="3.5"/><path d="M12 8.5V7M12 17v-1.5M15.5 12H17M7 12h1.5M6 20v2M18 20v2"/>',
        key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 9.3-9.3M17 6l3 3M14.5 8.5l2 2"/>',
        coins: '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
        graduation: '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5M22 10v6"/>',
        shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
        wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>',
        tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
        flame: '<path d="M12 22c4 0 7-2.7 7-7 0-4-3-6.5-4-9-1 2-2 3-3.5 3.5C11 7 11 4.5 12 2 7 5 5 9.5 5 15c0 4.3 3 7 7 7z"/>',
        burst: '<path d="M12 2l2.2 6.5L21 7l-4.5 5 4.5 5-6.8-1.5L12 22l-2.2-6.5L3 17l4.5-5L3 7l6.8 1.5z"/>',
        trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
        orbit: '<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-25 12 12)"/><circle cx="20" cy="6.5" r="1"/>',
        bot: '<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V4M9 4h6M2 13v3M22 13v3"/><circle cx="9" cy="14" r="1.2"/><circle cx="15" cy="14" r="1.2"/>',
        clipboard: '<rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 2h6v4H9zM9 11h6M9 15h6M9 19h3"/>',
        star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
        palette: '<path d="M12 22a10 10 0 1 1 10-10c0 2.8-2.2 4-4 4h-2a2 2 0 0 0-1.5 3.3A2 2 0 0 1 12 22z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
        zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
        blocks: '<path d="M3 9h6v6H3zM9 9h6v6H9zM15 9h6v6h-6zM9 3h6v6H9z"/>',
        rocket: '<path d="M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1z"/><path d="M12 15l-3-3a22 22 0 0 1 2-4A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22 22 0 0 1-4 2z"/><path d="M9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5"/>',
        invader: '<path d="M5 8h2V6h2v2h6V6h2v2h2v3h2v4h-2v3h-2v-2H7v2H5v-3H3v-4h2z"/><path d="M9 11h.01M15 11h.01"/>',
        crown: '<path d="M2 19h20M3 7l5 5 4-7 4 7 5-5-2 11H5z"/>',
        brain: '<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a2 2 0 0 0-3-1z"/><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1M12 9h-2M12 14h2"/>',
        package: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8M7.5 5.5l9 5"/>',
        gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13"/><path d="M12 8C10 4 7 4 7 6s3 2 5 2c2 0 5 0 5-2s-3-2-5 2z"/>',
        skull: '<path d="M12 3a8 8 0 0 0-8 8c0 2.6 1.3 4.6 3 6v3h10v-3c1.7-1.4 3-3.4 3-6a8 8 0 0 0-8-8z"/><circle cx="9" cy="11" r="1.6"/><circle cx="15" cy="11" r="1.6"/><path d="M10 20v-2M14 20v-2"/>',
        hoverboard: '<path d="M2 12h20l-2 3H4z"/><path d="M5 18.5h3M10.5 18.5h3M16 18.5h3"/><path d="M9 12V8.5a3 3 0 0 1 6 0V12"/>',
        dot: '<circle cx="12" cy="12" r="5" fill="currentColor"/>',
        crosshair: '<circle cx="12" cy="12" r="9"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><circle cx="12" cy="12" r="1.5"/>',
        bomb: '<circle cx="10" cy="14" r="7"/><path d="M14.5 9.5 17 7M16 5l1-1 3 3-1 1M20 2v1M22 4h-1"/>',
        user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
        users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20a7 7 0 0 1 14 0M16 4.5a3.5 3.5 0 0 1 0 7M18 13.5a7 7 0 0 1 4 6.5"/>',
        alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
        scale: '<path d="M12 3v18M7 21h10M5 7h14M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/>',
        magnet: '<path d="M6 3v8a6 6 0 0 0 12 0V3h-4v8a2 2 0 0 1-4 0V3z"/><path d="M6 7h4M14 7h4"/>',
        compass: '<circle cx="12" cy="12" r="10"/><path d="m16 8-2 6-6 2 2-6z"/>',
        scroll: '<path d="M8 21h11a2 2 0 0 0 2-2v-2H10v2a2 2 0 0 1-4 0V5a2 2 0 0 0-2-2h13a2 2 0 0 1 2 2v12"/><path d="M4 3a2 2 0 0 0-2 2v2h4M10 8h6M10 12h6"/>',
        book: '<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',
        chart: '<path d="M3 3v18h18"/><path d="M8 17v-5M13 17V8M18 17v-9"/>',
        'trend-up': '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
        'trend-down': '<path d="m3 7 6 6 4-4 8 8"/><path d="M15 17h6v-6"/>',
        target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
        flag: '<path d="M4 22V4M4 4h13l-2 4 2 4H4"/>',
        medal: '<circle cx="12" cy="15" r="6"/><path d="M8.5 10 6 2h4l2 4 2-4h4l-2.5 8M11 13.5l1-.5v5"/>',
        gamepad: '<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 11v3M5.5 12.5h3"/><circle cx="15" cy="12" r=".8"/><circle cx="17.5" cy="13.5" r=".8"/>',
        sparkles: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 3v4M17 5h4M5 17v4M3 19h4"/>',
        swords: '<path d="M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2"/><path d="M14.5 6.5 18 3h3v3l-3.5 3.5M5 14l4 4M7 17l-3 3M3 19l2 2"/>',
        menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
        timer: '<circle cx="12" cy="14" r="8"/><path d="M12 14v-4M10 2h4M12 2v4"/>',
        'chevrons-up': '<path d="m7 11 5-5 5 5M7 17l5-5 5 5"/>',
        cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L22 7H6"/>',
        siren: '<path d="M7 18v-6a5 5 0 0 1 10 0v6"/><path d="M5 21h14v-3H5zM12 2v2M4 6l1.5 1.5M20 6l-1.5 1.5"/>',
        car: '<path d="M5 17H3v-5l2-5h14l2 5v5h-2M3 12h18M9.5 17h5"/><circle cx="7.5" cy="17" r="2"/><circle cx="16.5" cy="17" r="2"/>',
        printer: '<path d="M6 9V2h12v7"/><rect x="2" y="9" width="20" height="9" rx="2"/><path d="M6 14h12v8H6z"/>',
        microscope: '<path d="M6 18h8M3 22h18M14 22a7 7 0 1 0 0-14h-1M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2zM12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/>',
        link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
        search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
        volume: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
        'volume-x': '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="m22 9-6 6M16 9l6 6"/>',
        refresh: '<path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16M8 16H3v5"/>',
        satellite: '<path d="M4 10a7.3 7.3 0 0 0 10 10z"/><path d="m9 15 3-3M14 6a4 4 0 0 1 4 4M14 2a8 8 0 0 1 8 8"/>',
        ruler: '<path d="M21.3 15.3 8.7 2.7a1 1 0 0 0-1.4 0L2.7 7.3a1 1 0 0 0 0 1.4l12.6 12.6a1 1 0 0 0 1.4 0l4.6-4.6a1 1 0 0 0 0-1.4z"/><path d="m7.5 10.5 2-2M10.5 13.5l2-2M13.5 16.5l2-2"/>',
        'badge-check': '<path d="M12 2l2.4 2.1 3.2-.3.8 3.1 2.8 1.6-1.2 3 1.2 3-2.8 1.6-.8 3.1-3.2-.3L12 22l-2.4-2.1-3.2.3-.8-3.1-2.8-1.6 1.2-3-1.2-3 2.8-1.6.8-3.1 3.2.3z"/><path d="m9 12 2 2 4-4"/>',
        message: '<path d="M21 12a8 8 0 0 1-11.6 7.2L4 21l1.8-5.4A8 8 0 1 1 21 12z"/>',
        gem: '<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M12 21 8 9l4-6 4 6z"/>',
        footprints: '<path d="M4 16v-2.4C4 11.5 3 10.5 3 8c0-2.7 1.5-6 4.5-6C9.4 2 10 3.8 10 5.5c0 3.1-2 5.7-2 8.7V16a2 2 0 1 1-4 0z"/><path d="M20 20v-2.4c0-2.1 1-3.1 1-5.6 0-2.7-1.5-6-4.5-6C14.6 6 14 7.8 14 9.5c0 3.1 2 5.7 2 8.7V20a2 2 0 1 0 4 0zM16 17h4M4 13h4"/>',
        ear: '<path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0"/><path d="M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 1 0 4"/>',
        eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
        dice: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="16" cy="16" r="1.2" fill="currentColor"/>',
        masks: '<path d="M3 4h10v6a5 5 0 0 1-10 0z"/><path d="M6 8h.01M10 8h.01M6 12a2 2 0 0 0 4 0M13 9h8v6a5 5 0 0 1-9.5 2.2M15 13h.01M19 13h.01M15.5 17a2 2 0 0 1 3 0"/>',
        film: '<rect x="2" y="3" width="20" height="18" rx="2"/><path d="M7 3v18M17 3v18M2 8h5M2 16h5M17 8h5M17 16h5M2 12h20"/>',
        backpack: '<path d="M5 20V10a7 7 0 0 1 14 0v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/><path d="M9 6V4a3 3 0 0 1 6 0v2M8 14h8v4H8z"/>',
        cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9z"/>',
        thermometer: '<path d="M14 4v10.5a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z"/><path d="M12 9v8"/>',
        globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',
        rainbow: '<path d="M22 17a10 10 0 0 0-20 0M18 17a6 6 0 0 0-12 0M14 17a2 2 0 0 0-4 0"/>',
        loader: '<path d="M21 12a9 9 0 1 1-6.2-8.6"/>',
        mountain: '<path d="m8 3 4 8 5-5 5 15H2z"/>',
        ring: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/>'
    };

    // Which icon replaces each emoji (variation selectors are ignored)
    const EMOJI = {
        '💰': 'coins', '✅': 'check-circle', '✔': 'check', '✓': 'check', '❌': 'x-circle', '✕': 'x', '✖': 'x',
        '🔒': 'lock', '🔓': 'unlock', '🔐': 'vault', '🗝': 'key', '🔑': 'key',
        '🎓': 'graduation', '🛡': 'shield', '🛠': 'wrench', '🔧': 'wrench', '🏷': 'tag', '🔥': 'flame', '💥': 'burst',
        '🏆': 'trophy', '🌌': 'orbit', '🤖': 'bot', '📝': 'clipboard', '🌟': 'star', '⭐': 'star', '🌠': 'star',
        '🎨': 'palette', '⚡': 'zap', '🧱': 'blocks', '🚀': 'rocket', '👾': 'invader', '👑': 'crown', '🧠': 'brain',
        '📦': 'package', '🎁': 'gift', '☠': 'skull', '🏴‍☠': 'skull', '🛹': 'hoverboard', '🔴': 'dot', '🟢': 'dot', '⚫': 'dot',
        '🔫': 'crosshair', '💣': 'bomb', '👤': 'user', '🧑': 'user', '🤝': 'users', '⚠': 'alert', '⚖': 'scale',
        '🧲': 'magnet', '🧭': 'compass', '📜': 'scroll', '📚': 'book', '📘': 'book', '📖': 'book', '📊': 'chart',
        '📈': 'trend-up', '📉': 'trend-down', '🎯': 'target', '🏹': 'target', '🏴': 'flag', '🏅': 'medal', '🥇': 'medal',
        '🎮': 'gamepad', '🕹': 'gamepad', '✨': 'sparkles', '⚔': 'swords', '☰': 'menu', '⏱': 'timer', '🦘': 'chevrons-up',
        '🛒': 'cart', '🚨': 'siren', '🚗': 'car', '🖨': 'printer', '🔬': 'microscope', '🔗': 'link', '🔍': 'search',
        '🔊': 'volume', '🔇': 'volume-x', '🔄': 'refresh', '📡': 'satellite', '📐': 'ruler', '💯': 'badge-check',
        '💬': 'message', '💎': 'gem', '👣': 'footprints', '👂': 'ear', '👁': 'eye', '👀': 'eye', '🎲': 'dice',
        '🎭': 'masks', '🎬': 'film', '🎒': 'backpack', '🌫': 'cloud', '🌡': 'thermometer', '🌐': 'globe', '🌎': 'globe',
        '🌈': 'rainbow', '🌀': 'loader', '⛰': 'mountain', '⭕': 'ring'
    };
    // Extra classes for a few emoji that share an icon but not a color
    const TONE = { '🔴': 'red', '🟢': 'green', '⚫': 'muted' };

    const RE = /(?:\p{Extended_Pictographic}|[✓✕☰])️?(?:‍\p{Extended_Pictographic}️?)*/gu;
    const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'OPTION', 'TITLE', 'CANVAS', 'NOSCRIPT', 'svg']);

    const clean = e => e.replace(/️/g, '');
    const nameFor = e => clean(e).includes('☠') ? 'skull' : EMOJI[clean(e)] || EMOJI[[...clean(e)][0]];

    // Markup for one icon, for code that wants to place an icon directly
    function icon(name, cls = '') {
        if (!P[name]) return '';
        return `<svg class="picon picon-${name}${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${P[name]}</svg>`;
    }
    const tpl = document.createElement('template');
    function iconNode(e) {
        const name = nameFor(e);
        if (!name) return null;
        tpl.innerHTML = icon(name, TONE[clean(e)] ? 'tone-' + TONE[clean(e)] : '');
        return tpl.content.firstChild;
    }

    function convertText(node) {
        const text = node.nodeValue;
        if (!text || !RE.test(text)) return;
        RE.lastIndex = 0;
        const parent = node.parentNode;
        if (!parent || SKIP.has(parent.nodeName) || parent.closest?.('[data-keep-emoji]')) return;
        const frag = document.createDocumentFragment();
        let last = 0, changed = false;
        for (const m of text.matchAll(RE)) {
            const el = iconNode(m[0]);
            if (!el) continue;                   // unknown symbols (like ©) stay as text
            frag.append(text.slice(last, m.index), el);
            last = m.index + m[0].length;
            changed = true;
        }
        if (!changed) return;
        frag.append(text.slice(last));
        parent.replaceChild(frag, node);
    }

    function render(root) {
        if (!root) return;
        if (root.nodeType === Node.TEXT_NODE) return convertText(root);
        if (root.nodeType !== Node.ELEMENT_NODE || SKIP.has(root.nodeName)) return;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode: n => SKIP.has(n.parentNode?.nodeName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
        });
        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        nodes.forEach(convertText);
    }

    // Keep converting as the app adds content (leaderboards, toasts, game HUDs, modals...)
    function watch() {
        render(document.body);
        new MutationObserver(list => {
            for (const m of list) {
                if (m.type === 'characterData') convertText(m.target);
                else m.addedNodes.forEach(render);
            }
        }).observe(document.body, { childList: true, subtree: true, characterData: true });
    }
    if (document.body) watch(); else document.addEventListener('DOMContentLoaded', watch);

    return { icon, render, has: name => !!P[name] };
})();
