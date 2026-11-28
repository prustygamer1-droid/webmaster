'use strict';
/* ============================================================================
   AI LEARNING PORTAL - games.js
   Load after app.js. Sections:
   A Game list   B Sound & visual effects   C Combo system   D Shared game engine
   E Reworked games: Cyber Defense, Hover Runner, Sky Climb, Boss Battle, Packet Catcher, Pirate Cannon, Block Blast
   The Rocket game lives in app.js.
   ============================================================================ */

// ============================================================================
// A. GAME LIST (one place that names every game; scores and leaderboards use it)
// ============================================================================
const GAMES = {
    rocket: {
        icon: '🚀', name: 'Rocket Space Defender', short: 'Rocket', run: (m, s) => runRocketGame(m, s),
        rules: `<p><strong>Objective:</strong> Mini Scrappy pilots the rocket! Answer questions to earn credits, then survive each 30-second asteroid wave.</p>
            <ul><li><strong>Move:</strong> Left/Right arrows (or A/D). On a touch screen, drag to steer; your ship fires automatically.</li>
            <li><strong>Shoot:</strong> Up arrow (W or Space).</li>
            <li><strong>Tough rocks:</strong> Orange boulders take 3 hits and armored iron rocks take 6. Purple crystals drop gems worth +15 credits.</li>
            <li><strong>Rocket Armory:</strong> Right answers earn credits. Spend them on Laser Power, Rapid Fire, Spread Cannons, Thrusters, Homing Missiles, Deflector Shield, Hull Plating, Gem Magnet, Double XP, 2x Score and Nova Bombs (B).</li>
            <li><strong>Hit chain:</strong> Destroy rocks back to back for bonus points. A 3-answer streak gives free triple bullets.</li></ul>`
    },
    blockblast: {
        icon: '🧱', name: 'Block Blast AI Grid', short: 'Block Blast', run: (m, s) => runArcadeGame('blockblast', m, s),
        rules: `<p><strong>Objective:</strong> Scrappy is the grid engineer. Drop pieces onto the 8x8 data grid and fill whole rows or columns to clear them!</p>
            <ul><li><strong>Place pieces:</strong> Drag a piece from your tray onto the grid, or click a piece and then click the grid. Keyboard: 1-4 to pick, arrows to move, Space to place.</li>
            <li><strong>Combos:</strong> Clear lines within 3 drops of each other to build a combo (up to x4). Clearing several lines at once, or the whole grid, pays big bonuses.</li>
            <li><strong>Watch the board:</strong> The grid carries over between questions, and corrupted blocks appear from round 3. If nothing fits, the grid jams and the round ends.</li>
            <li><strong>Block Lab:</strong> Right answers (and gold gem blocks) earn credits for the Rotator, Bigger Tray, Gem Finder, Overclock, Double XP, 2x Score, Neon Bombs (B), Line Lasers (L) and Rerolls (X).</li></ul>`
    },
    pirate: {
        icon: '🏴‍☠️', name: 'Pirate Cannon Launcher', short: 'Pirate', run: (m, s) => runArcadeGame('pirate', m, s),
        rules: `<p><strong>Objective:</strong> Captain Pirate Scrappy fires his ship's cannon at the Bot Buccaneers. Knock out every pirate bot on their raft, ships, island and sea fortress!</p>
            <ul><li><strong>Aim:</strong> Press anywhere on the game and pull back like a slingshot, then let go to fire. Or use Up/Down to aim, Left/Right for power and Space to fire.</li>
            <li><strong>Knock them down:</strong> Smash the towers holding the bots up. A long fall or a splash into the sea knocks a bot out. Red powder barrels explode, and treasure chests give +20 credits.</li>
            <li><strong>Credits:</strong> Right answers earn credits (more on a streak). Spend them in the Shipwright's Armory: Heavy Iron Shot, Black Powder Kegs, Explosive Shells, Spyglass, Extra Cannonball, Double XP, 2x Score and Grapeshot Volleys (V).</li>
            <li><strong>Wind and bonuses:</strong> From battle 3 the wind pushes your shots. Clearing a fleet pays a bonus for every cannonball left, and a 3-answer streak adds a cannonball.</li></ul>`
    },
    defense: {
        icon: '🛡️', name: 'Cyber Shield Defense', short: 'Cyber Shield', run: (m, s) => runArcadeGame('defense', m, s),
        rules: `<p><strong>Objective:</strong> Scrappy mans the firewall guns. Stop malware from reaching your server core!</p>
            <ul><li><strong>Move Scrappy:</strong> Tap a lane, or press 1, 2, 3 (or Up/Down). Scrappy fires the gun he is sitting at.</li>
            <li><strong>Credits:</strong> Every right answer earns credits (more on a streak). Spend them in the Firewall Armory before each wave.</li>
            <li><strong>Upgrades:</strong> Plasma Rounds (damage), Rapid Capacitors (fire rate), Deflector Shield, Auto-Turrets, Double XP, 2x Score, plus EMP charges and core repairs.</li>
            <li><strong>EMP:</strong> Buy EMP charges, then press E or the EMP button to wipe the screen.</li></ul>`
    },
    runner: {
        icon: '🛹', name: 'Neon Hover Runner', short: 'Hover Runner', run: (m, s) => runArcadeGame('runner', m, s),
        rules: `<p><strong>Objective:</strong> Scrappy hoverboards through five space zones. Dodge laser barriers, drones and track gaps, and grab data orbs!</p>
            <ul><li><strong>Jump:</strong> Space, Up arrow, W, or tap. Press again in the air to double jump.</li>
            <li><strong>Credits:</strong> Right answers earn credits (more on a streak). Data orbs give +2 and gold chips +15. Spend them in the Hover Garage before each zone.</li>
            <li><strong>Upgrades:</strong> Thrusters, Jump Jets (triple jump), Energy Shield, Orb Magnet, Laser Blaster (F), Double XP, 2x Score, and Nitro Boosts (B).</li>
            <li><strong>Gaps:</strong> Fall through the track and an energy bridge rescues you, but it costs points.</li></ul>`
    },
    climb: {
        icon: '⛰️', name: 'Sky Climb', short: 'Sky Climb', run: (m, s) => runArcadeGame('climb', m, s),
        rules: `<p><strong>Objective:</strong> The only way is up! Bounce Scrappy from Earth through the Sky Castle, the Stratosphere, Orbit, the Moon and an Alien City to the AI Data Center that runs this website.</p>
            <ul><li><strong>Steer:</strong> Left/Right arrows or A/D, or hold your mouse or finger on either side of Scrappy. He bounces on his own.</li>
            <li><strong>One long climb:</strong> Your altitude carries over between questions. Watch for clouds and corrupted blocks that break, springs, meteors, drones and firewall lasers.</li>
            <li><strong>Credits:</strong> Right answers earn credits (more on a streak), plus orbs and gold chips. Spend them in the Climb Gear Lab: Spring Boots, Air Control, Rescue Drone, Orb Magnet, Double XP, 2x Score and Jetpack Bursts (B).</li>
            <li><strong>The AI Core:</strong> It sits at the very top. Reaching it is a real challenge and pays a huge bonus.</li></ul>`
    },
    boss: {
        icon: '👑', name: 'True God Scrappy Boss Battle', short: 'Boss Battle', run: (m, s) => runArcadeGame('boss', m, s),
        rules: `<p><strong>Objective:</strong> Defeat True God Scrappy as fast as you can. The leaderboard ranks the fastest defeat!</p>
            <ul><li><strong>Move:</strong> Arrows or WASD, or drag with your mouse or finger. Little Scrappy fires his blaster automatically.</li>
            <li><strong>Dodge:</strong> Golden halo rings, aimed orbs, giant hand slams (watch the red warning), eye lasers and, once he is enraged, spirals.</li>
            <li><strong>Credits:</strong> Right answers earn credits (more on a streak). Spend them in the Blaster Workshop on damage, fire rate, spread shot, speed, shields, Overcharge and Repair Kits.</li>
            <li><strong>The clock:</strong> Fight time only counts while you are fighting. It is paused in the workshop and during questions.</li></ul>`
    },
    catcher: {
        icon: '📦', name: 'Data Packet Catcher', short: 'Packet Catcher', run: (m, s) => runArcadeGame('catcher', m, s),
        rules: `<p><strong>Objective:</strong> Build a clean AI training set. Scrappy catches clean data packets (text, image and audio) and dodges corrupted ones.</p>
            <ul><li><strong>Move:</strong> Left/Right arrows (or A/D), or move your mouse or finger.</li>
            <li><strong>Watch out:</strong> Corrupted packets glitch and flash red. Catching one costs points and lowers your dataset purity.</li>
            <li><strong>Credits:</strong> Right answers earn credits (more on a streak), and gold packets add +10. Spend them in the Data Lab: Wide Collector, Thruster Speed, Data Magnet, Firewall Filter, Double XP, 2x Score and Gold Rush (G).</li></ul>`
    }
};
const GAME_KEYS = Object.keys(GAMES);

// Which game each lesson uses. No game repeats inside a module.
const GAME_ROTATION = {
    '1.1': 'runner', '1.2': 'blockblast', '1.3': 'climb',
    '2.1': 'defense', '2.2': 'boss', '2.3': 'rocket',
    '3.1': 'catcher', '3.2': 'pirate', '3.3': 'runner',
    '4.1': 'climb', '4.2': 'defense', '4.3': 'blockblast',
    '5.1': 'boss', '5.2': 'catcher', '5.3': 'rocket',
    '6.1': 'pirate', '6.2': 'runner', '6.3': 'boss'
};
const gameFor = (modId, subId) => GAME_ROTATION[`${modId}.${subId}`] || 'rocket';

// ============================================================================
// B. SOUND & VISUAL EFFECTS (most sounds are generated in code; Cyber Shield also uses recorded CC0 samples)
// ============================================================================
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const FX = (() => {
    let audio = null;
    let muted = store.get('sfxMuted', false);

    function tone(freq, dur, { type = 'square', vol = 0.05, to = 0, delay = 0 } = {}) {
        if (muted) return;
        try {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return;
            audio = audio || new AC();
            if (audio.state === 'suspended') audio.resume();
            const t = audio.currentTime + delay;
            const osc = audio.createOscillator(), gain = audio.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, t);
            if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
            gain.gain.setValueAtTime(vol, t);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
            osc.connect(gain).connect(audio.destination);
            osc.start(t);
            osc.stop(t + dur);
        } catch { /* audio is a bonus; never break a game over it */ }
    }
    const arpeggio = (notes, step, opts) => notes.forEach((n, i) => tone(n, 0.18, { ...opts, delay: i * step }));
    const SOUNDS = {
        correct: () => arpeggio([523, 784], 0.08, { type: 'triangle', vol: 0.09 }),
        wrong: () => tone(220, 0.35, { type: 'sawtooth', vol: 0.06, to: 80 }),
        shoot: () => tone(720, 0.06, { vol: 0.018, to: 240 }),
        hit: () => tone(180, 0.12, { vol: 0.05, to: 70 }),
        explode: () => { tone(140, 0.28, { type: 'sawtooth', vol: 0.07, to: 40 }); tone(90, 0.2, { vol: 0.05, to: 40, delay: 0.03 }); },
        collect: () => tone(880, 0.08, { type: 'sine', vol: 0.07, to: 1320 }),
        jump: () => tone(300, 0.14, { type: 'triangle', vol: 0.06, to: 620 }),
        power: () => arpeggio([392, 523, 659, 1047], 0.06, { vol: 0.045 }),
        win: () => arpeggio([523, 659, 784, 1047, 1319], 0.1, { type: 'triangle', vol: 0.09 }),
        lose: () => arpeggio([392, 330, 262], 0.14, { type: 'triangle', vol: 0.08 })
    };
    const play = name => { if (SOUNDS[name]) SOUNDS[name](); };
    const comboSound = streak => tone(440 + Math.min(streak, 10) * 80, 0.16, { vol: 0.05, to: 880 + Math.min(streak, 10) * 80 });

    // Recorded effects from Kenney's "Sci-Fi Sounds" pack (CC0, see sounds/ and the References page).
    // Each name picks one of its files at random; the generated sound above is the fallback.
    const SAMPLES = {
        laser: { files: ['sounds/laser_1.ogg', 'sounds/laser_2.ogg', 'sounds/laser_3.ogg'], vol: 0.06, gap: 60, fallback: 'shoot' },
        robotDeath: { files: ['sounds/robot_death_1.ogg', 'sounds/robot_death_2.ogg'], vol: 0.13, gap: 70, fallback: 'explode' },
        armorHit: { files: ['sounds/armor_hit.ogg'], vol: 0.09, gap: 70, fallback: 'hit' },
        shieldBlock: { files: ['sounds/shield_block.ogg'], vol: 0.15, gap: 120, fallback: 'collect' },
        coreBreach: { files: ['sounds/core_breach.ogg'], vol: 0.17, gap: 150, fallback: 'explode' },
        emp: { files: ['sounds/emp_blast.ogg'], vol: 0.17, gap: 200, fallback: 'power' },
        // Kenney "Digital Audio" (CC0): Hover Runner and the shops
        jump: { files: ['sounds/runner_jump.ogg'], vol: 0.06, gap: 60, fallback: 'jump' },
        doubleJump: { files: ['sounds/runner_double_jump.ogg'], vol: 0.06, gap: 60, fallback: 'jump' },
        orb: { files: ['sounds/runner_orb_1.ogg', 'sounds/runner_orb_2.ogg'], vol: 0.05, gap: 50, fallback: 'collect' },
        crash: { files: ['sounds/runner_crash.ogg'], vol: 0.09, gap: 200, fallback: 'explode' },
        nitro: { files: ['sounds/runner_nitro.ogg'], vol: 0.08, gap: 200, fallback: 'power' },
        blaster: { files: ['sounds/runner_blaster.ogg'], vol: 0.05, gap: 80, fallback: 'shoot' },
        shieldPop: { files: ['sounds/runner_shield_pop.ogg'], vol: 0.08, gap: 200, fallback: 'hit' },
        fall: { files: ['sounds/runner_fall.ogg'], vol: 0.08, gap: 300, fallback: 'lose' },
        zone: { files: ['sounds/runner_zone.ogg'], vol: 0.07, gap: 500, fallback: 'power' },
        shopBuy: { files: ['sounds/shop_buy.ogg'], vol: 0.08, gap: 80, fallback: 'collect' },
        // Sky Climb: the bounce plays constantly, so it is kept very quiet
        bounce: { files: ['sounds/runner_jump.ogg'], vol: 0.025, gap: 120, fallback: 'jump' },
        crumble: { files: ['sounds/armor_hit.ogg'], vol: 0.05, gap: 100, fallback: 'hit' },
        bossHit: { files: ['sounds/armor_hit.ogg'], vol: 0.035, gap: 140, fallback: 'hit' }
    };
    const canOgg = (() => { try { return !!new Audio().canPlayType('audio/ogg; codecs="vorbis"'); } catch { return false; } })();
    const lastSample = {};
    function sample(name) {
        const s = SAMPLES[name];
        if (muted || !s) return;
        if (!canOgg) return play(s.fallback);
        const now = performance.now();
        if (now - (lastSample[name] || 0) < s.gap) return;     // stops dozens of copies stacking up
        lastSample[name] = now;
        try {
            const a = new Audio(s.files[Math.floor(Math.random() * s.files.length)]);
            a.volume = s.vol;
            a.play().catch(() => play(s.fallback));
        } catch { play(s.fallback); }
    }
    // Warms the browser cache so the first shot is not silent
    const preload = names => { if (canOgg) names.forEach(n => SAMPLES[n]?.files.forEach(f => { const a = new Audio(); a.preload = 'auto'; a.src = f; })); };

    // Full-screen particle layer, only animating while particles exist
    let layer = null, parts = [], running = false;
    function burst(x, y, { color = '#00f2fe', count = 26, power = 6 } = {}) {
        if (reducedMotion()) return;
        if (!layer) {
            layer = document.createElement('canvas');
            layer.className = 'fx-layer';
            layer.setAttribute('aria-hidden', 'true');
            document.body.appendChild(layer);
        }
        if (layer.width !== window.innerWidth || layer.height !== window.innerHeight) {
            layer.width = window.innerWidth;
            layer.height = window.innerHeight;
        }
        for (let i = 0; i < count; i++) {
            const a = Math.random() * Math.PI * 2, sp = 1 + Math.random() * power;
            parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.5, life: 1, color, size: 2 + Math.random() * 4 });
        }
        if (!running) { running = true; requestAnimationFrame(step); }
    }
    function step() {
        const ctx = layer.getContext('2d');
        ctx.clearRect(0, 0, layer.width, layer.height);
        parts = parts.filter(p => p.life > 0);
        parts.forEach(p => {
            p.x += p.vx; p.y += p.vy; p.vy += 0.18; p.life -= 0.022;
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        ctx.globalAlpha = 1;
        if (parts.length) requestAnimationFrame(step); else running = false;
    }
    function burstAt(el, opts) {
        if (!el) return;
        const r = el.getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + r.height / 2, opts);
    }
    function shake(el, strength = 8) {
        if (!el || !el.animate || reducedMotion()) return;
        const frames = [0, -1, 1, -0.7, 0.7, -0.3, 0].map(k => ({ translate: `${k * strength}px ${k * strength * 0.35}px` }));
        el.animate(frames, { duration: 360, easing: 'ease-out' });
    }
    function flash(color) {
        if (reducedMotion()) return;
        const el = document.createElement('div');
        el.className = 'fx-flash';
        el.style.setProperty('--flash', color);
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 450);
    }
    function toggleMute() {
        muted = !muted;
        store.set('sfxMuted', muted);
        if (!muted) play('collect');
        return muted;
    }
    return { play, sample, preload, comboSound, burst, burstAt, shake, flash, toggleMute, isMuted: () => muted };
})();

// Particles, floating text and screen shake drawn inside a game canvas
function canvasJuice() {
    let parts = [], texts = [], shakeAmt = 0;
    return {
        burst(x, y, color, n = 16) {
            if (reducedMotion()) return;
            for (let i = 0; i < n; i++) {
                const a = Math.random() * Math.PI * 2, sp = 1 + Math.random() * 4.5;
                parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, color, size: 2 + Math.random() * 3.5 });
            }
        },
        text(x, y, str, color = '#fff') { texts.push({ x, y, str, color, life: 1 }); },
        shake(n) { if (!reducedMotion()) shakeAmt = Math.max(shakeAmt, n); },
        // call right after ctx.save(), before drawing the scene
        offset(ctx) { if (shakeAmt > 0.4) ctx.translate((Math.random() - 0.5) * shakeAmt, (Math.random() - 0.5) * shakeAmt); },
        draw(ctx, dt = 1) {
            shakeAmt *= Math.pow(0.88, dt);
            parts = parts.filter(p => p.life > 0);
            parts.forEach(p => {
                p.x += p.vx * dt; p.y += p.vy * dt; p.life -= 0.032 * dt;
                ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, p.size, p.size);
            });
            texts = texts.filter(t => t.life > 0);
            ctx.font = '800 17px Orbitron, sans-serif';
            ctx.textAlign = 'center';
            texts.forEach(t => {
                t.y -= 1.1 * dt; t.life -= 0.022 * dt;
                ctx.globalAlpha = Math.max(0, t.life); ctx.fillStyle = t.color; ctx.fillText(t.str, t.x, t.y);
            });
            ctx.textAlign = 'start';
            ctx.globalAlpha = 1;
        }
    };
}

// ============================================================================
// C. COMBO SYSTEM (consecutive correct answers)
// ============================================================================
function createCombo() {
    return {
        streak: 0,
        best: 0,
        // x1, x1.5, x2, x2.5, then x3 from five in a row
        get mult() { return this.streak < 2 ? 1 : 1 + Math.min(this.streak - 1, 4) * 0.5; },
        answer(ok) {
            this.streak = ok ? this.streak + 1 : 0;
            this.best = Math.max(this.best, this.streak);
            recordBest('bestStreak', this.streak);
        }
    };
}
const comboPill = combo => combo && combo.streak >= 2 ? `<span class="combo-pill">🔥 ${combo.streak} STREAK · x${combo.mult}</span>` : '';

// Remembers a personal best (used by the combo badges)
function recordBest(key, value) {
    if (value > store.get(key, 0)) store.set(key, value);
}

// ============================================================================
// D. SHARED GAME ENGINE FOR THE NEW GAMES
//    Every question leads into a short action round. All five questions are
//    always asked, so 4 out of 5 still decides whether the lesson is passed.
// ============================================================================
function runArcadeGame(key, modId, subId) {
    const def = GAMES[key];
    const { modal, stage } = makeModal();
    const questions = prepareQuiz(modId, subId);
    const S = { q: 0, quiz: 0, score: 0, combo: createCombo(), stage, total: questions.length };
    const game = ARCADE_LOGIC[key](S);

    function ask() {
        if (S.q >= questions.length) {
            return finishGame({
                modal, stage, modId, subId, gameKey: key, title: `${def.icon} ${def.short}`, quizScore: S.quiz, total: questions.length,
                arcadeLabel: 'Arcade Score', arcadeScore: Math.round(S.score), bestStreak: S.combo.best, xpMult: S.xpMult || 1, retry: () => runArcadeGame(key, modId, subId)
            });
        }
        askQuestion({
            stage, q: questions[S.q], index: S.q, total: questions.length, theme: `theme-${key}`, combo: S.combo,
            badge: `${def.icon} ${game.status()}`,
            onResult: ok => {
                if (ok) S.quiz++;
                game.round(ok, () => { if (document.body.contains(stage)) { S.q++; ask(); } });
            }
        });
    }
    ask();
}

// A timed action round on a canvas. It stops itself if the player exits the game.
function canvasRound(S, { title, theme, seconds, hint, intro, buttons = '', setup, onEnd, skipSummary = false }) {
    S.stage.innerHTML = `
        <div class="quiz-game-card canvas-card ${theme}">
            <div class="quiz-header-row">
                <span class="quiz-counter">${title} · Round ${S.q + 1}/${S.total}</span>
                ${comboPill(S.combo)}
                <span class="quiz-credits" data-time>⏱ ${seconds}s</span>
                <span class="quiz-credits" data-hud></span>
                <span class="quiz-credits" data-score></span>
            </div>
            <p class="round-intro">${intro}</p>
            <canvas class="game-canvas" width="640" height="360" tabindex="0" aria-label="${title} game area"></canvas>
            <div class="game-buttons">${buttons}</div>
            <p class="canvas-instructions">${hint}</p>
        </div>`;
    const canvas = $('canvas', S.stage), ctx = canvas.getContext('2d');
    const card = $('.quiz-game-card', S.stage);
    const juice = canvasJuice();
    const keys = {};
    const pointer = { down: false, x: 0, y: 0 };
    let timeLeft = seconds * 1000, last = 0, raf = 0, over = false, game = null;

    const api = {
        canvas, ctx, juice, keys, pointer, card,
        hud(html) { const el = $('[data-hud]', card); if (el && el.innerHTML !== html) el.innerHTML = html; },
        elapsed: () => seconds * 1000 - timeLeft,
        finish() { timeLeft = 0; }                  // ends the round on the next frame (boss defeated, knocked out...)
    };
    const point = e => {
        const r = canvas.getBoundingClientRect();
        pointer.x = (e.clientX - r.left) * canvas.width / r.width;
        pointer.y = (e.clientY - r.top) * canvas.height / r.height;
    };
    const keyDown = e => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
        if (!e.repeat && game.key) game.key(e.code);
        keys[e.code] = true;
    };
    const keyUp = e => { keys[e.code] = false; };
    const pointerUp = () => { pointer.down = false; };
    const cleanup = () => {
        over = true;
        cancelAnimationFrame(raf);
        window.removeEventListener('keydown', keyDown);
        window.removeEventListener('keyup', keyUp);
        window.removeEventListener('pointerup', pointerUp);
    };
    canvas.addEventListener('pointerdown', e => { pointer.down = true; point(e); if (game.tap) game.tap(pointer.x, pointer.y); });
    canvas.addEventListener('pointermove', point);

    game = setup(api);
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    window.addEventListener('pointerup', pointerUp);
    $$('[data-action]', card).forEach(b => b.onclick = () => { game.action(b.dataset.action); b.blur(); });

    function frame(now) {
        if (over) return;
        if (!document.body.contains(canvas)) { cleanup(); return; }
        const ms = last ? Math.min(50, now - last) : 16;
        last = now;
        const dt = ms / 16.67;                       // same speed on 60Hz and 144Hz screens
        timeLeft -= ms;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        juice.offset(ctx);
        game.frame(dt, ms);
        juice.draw(ctx, dt);
        ctx.restore();
        $('[data-time]', card).textContent = `⏱ ${Math.max(0, Math.ceil(timeLeft / 1000))}s`;
        $('[data-score]', card).textContent = `Score: ${Math.round(S.score)}`;
        if (timeLeft <= 0) {
            cleanup();
            // skipSummary: the game shows the results itself (Cyber Shield shows them in its armory)
            if (skipSummary && S.q < S.total - 1) onEnd(game.summary()); else roundSummary(S, game.summary(), onEnd);
            return;
        }
        raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
}

function roundSummary(S, lines, next) {
    const last = S.q >= S.total - 1;
    S.stage.innerHTML = `
        <div class="quiz-game-card round-summary">
            <h2 class="shop-title">Round ${S.q + 1} Complete</h2>
            <ul>${lines.map(l => `<li>${l}</li>`).join('')}</ul>
            <p class="shop-credits">Total Score: <strong class="credit-highlight">${Math.round(S.score)}</strong></p>
            <button type="button" class="btn-continue-shop" data-next>${last ? 'See Results →' : 'Next Question →'}</button>
        </div>`;
    const btn = $('[data-next]', S.stage);
    btn.onclick = next;
    // A short delay stops a held Space key from skipping the summary
    setTimeout(() => { if (document.body.contains(btn)) btn.focus({ preventScroll: true }); }, 600);
}

const rand = (lo, hi) => lo + Math.random() * (hi - lo);
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

function neonBackdrop(ctx, w, h, top, bottom) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, top); g.addColorStop(1, bottom);
    ctx.fillStyle = g;
    ctx.fillRect(-10, -10, w + 20, h + 20);
}
function glowRect(ctx, x, y, w, h, color, blur = 14) {
    ctx.save();
    ctx.shadowColor = color; ctx.shadowBlur = blur; ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
}
function emoji(ctx, char, x, y, size) {
    ctx.save();
    ctx.font = `${size}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff';
    ctx.fillText(char, x, y);
    ctx.restore();
}

// Tracks quick back-to-back hits inside an action round
function createChain(windowMs = 2200) {
    let count = 0, timer = 0;
    return {
        get count() { return count; },
        tick(ms) { if (count && (timer -= ms) <= 0) count = 0; },
        hit() { count++; timer = windowMs; recordBest('bestActionCombo', count); if (count % 5 === 0) FX.comboSound(count); return 1 + Math.min(count, 20) * 0.05; },
        reset() { count = 0; }
    };
}

// ============================================================================
// E. THE FIVE NEW GAMES
//    Each returns { status(), round(correct, next) }
// ============================================================================
const ARCADE_LOGIC = {};

// ---- 1. CYBER SHIELD DEFENSE ------------------------------------------------
// ---- Cyber Shield art: everything is drawn with canvas shapes (no emojis) ----
// Same deep-space gradient and drifting starfield as the Rocket game, plus a soft nebula
function makeStars(n, w, h) {
    return Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, size: Math.random() * 2 + 0.6, speed: Math.random() * 0.9 + 0.2, tw: Math.random() * Math.PI * 2 }));
}
function spaceBackdrop(ctx, w, h, stars, dt, t) {
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#060919'); bg.addColorStop(0.5, '#0b1329'); bg.addColorStop(1, '#02040a');
    ctx.fillStyle = bg;
    ctx.fillRect(-12, -12, w + 24, h + 24);
    const neb = (x, y, r, color) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    };
    neb(470, 90, 240, 'rgba(124,58,237,.16)');
    neb(250, 330, 220, 'rgba(14,165,233,.10)');
    stars.forEach(s => {
        s.x -= s.speed * dt;
        if (s.x < -4) { s.x = w + 4; s.y = Math.random() * h; }
        ctx.globalAlpha = (s.size > 1.8 ? 0.85 : 0.4) * (0.75 + 0.25 * Math.sin(t / 400 + s.tw));
        ctx.fillStyle = s.size > 1.8 ? '#e0f2fe' : '#38bdf8';
        ctx.fillRect(s.x, s.y, s.size, s.size);
    });
    ctx.globalAlpha = 1;
}
function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
// Data lanes the malware travels along
function drawLanes(ctx, lanes, active, t) {
    lanes.forEach((y, i) => {
        const on = i === active;
        const g = ctx.createLinearGradient(90, 0, 640, 0);
        g.addColorStop(0, on ? 'rgba(34,211,238,.16)' : 'rgba(148,163,184,.05)');
        g.addColorStop(1, 'rgba(15,23,42,0)');
        ctx.fillStyle = g;
        ctx.fillRect(90, y - 38, 550, 76);
        ctx.strokeStyle = on ? 'rgba(34,211,238,.55)' : 'rgba(148,163,184,.12)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(90, y - 38); ctx.lineTo(640, y - 38); ctx.moveTo(90, y + 38); ctx.lineTo(640, y + 38); ctx.stroke();
        // Moving guide dashes show the direction of travel
        ctx.setLineDash([10, 18]); ctx.lineDashOffset = t / 25;
        ctx.strokeStyle = on ? 'rgba(125,211,252,.35)' : 'rgba(148,163,184,.08)';
        ctx.beginPath(); ctx.moveTo(100, y); ctx.lineTo(640, y); ctx.stroke();
        ctx.setLineDash([]);
    });
}
// The firewall fortress: armored wall, reactor core, health gauge and energy shield
function drawFortress(ctx, core, t, hitMs, shield = { charges: 0, max: 0, blockMs: 0 }) {
    const col = core > 60 ? '#22d3ee' : core > 35 ? '#fbbf24' : '#ef4444';
    const wall = ctx.createLinearGradient(0, 0, 34, 0);
    wall.addColorStop(0, '#0b1120'); wall.addColorStop(0.6, '#1e293b'); wall.addColorStop(1, '#334155');
    ctx.fillStyle = wall; roundRect(ctx, -6, 14, 38, 332, 8); ctx.fill();
    ctx.strokeStyle = '#475569'; ctx.lineWidth = 2; ctx.stroke();
    ctx.strokeStyle = 'rgba(15,23,42,.9)'; ctx.lineWidth = 2;
    for (let y = 54; y < 340; y += 40) { ctx.beginPath(); ctx.moveTo(2, y); ctx.lineTo(30, y); ctx.stroke(); }
    // Rivets
    ctx.fillStyle = '#64748b';
    for (let y = 34; y < 340; y += 40) { if (Math.abs(y - 125) > 16 && Math.abs(y - 235) > 16) { ctx.beginPath(); ctx.arc(26, y, 1.6, 0, Math.PI * 2); ctx.fill(); } }
    // Health gauge
    ctx.fillStyle = '#020617'; roundRect(ctx, 3, 30, 6, 300, 3); ctx.fill();
    const fill = 300 * Math.max(0, core) / 100;
    ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 10; ctx.fillStyle = col;
    roundRect(ctx, 3, 330 - fill, 6, fill, 3); ctx.fill(); ctx.restore();
    // Reactor cells sit between the lanes, clear of the turret brackets
    const pulse = 0.8 + 0.2 * Math.sin(t / 220);
    [125, 235].forEach(cy => {
        ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 18 * pulse;
        const g = ctx.createRadialGradient(21, cy, 1, 21, cy, 9);
        g.addColorStop(0, '#ffffff'); g.addColorStop(0.4, col); g.addColorStop(1, '#0f172a');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(21, cy, 9, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(21, cy, 10.5, 0, Math.PI * 2); ctx.stroke();
    });
    // Energy shield in front of the wall: flickers red when a virus gets through
    const hurt = hitMs > 0;
    ctx.save();
    ctx.globalAlpha = (hurt ? 0.9 : 0.35 + 0.15 * Math.sin(t / 300)) * (core > 0 ? 1 : 0.3);
    ctx.strokeStyle = hurt ? '#f87171' : col; ctx.lineWidth = 3; ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.ellipse(30, 180, 16, 168, 0, -Math.PI / 2, Math.PI / 2); ctx.stroke();
    ctx.globalAlpha *= 0.25; ctx.fillStyle = ctx.strokeStyle; ctx.fill();
    ctx.restore();
    // Deflector Shield upgrade: a hex-patterned barrier with one pip per charge left this round
    if (shield.max > 0) {
        const up = shield.charges > 0, block = shield.blockMs > 0;
        ctx.save();
        ctx.globalAlpha = block ? 0.95 : up ? 0.55 + 0.2 * Math.sin(t / 250) : 0.12;
        ctx.strokeStyle = block ? '#ffffff' : '#60a5fa'; ctx.lineWidth = 2.5; ctx.shadowColor = '#60a5fa'; ctx.shadowBlur = block ? 26 : 16;
        ctx.beginPath(); ctx.ellipse(40, 180, 18, 176, 0, -Math.PI / 2, Math.PI / 2); ctx.stroke();
        ctx.shadowBlur = 0; ctx.lineWidth = 1; ctx.globalAlpha *= 0.55;
        for (let y = 20; y < 340; y += 22) {
            const half = 176 * Math.sqrt(Math.max(0, 1 - ((y - 180) / 176) ** 2));
            const ex = 40 + 18 * Math.sqrt(Math.max(0, 1 - ((y - 180) / 176) ** 2));
            if (half > 0) { ctx.beginPath(); ctx.moveTo(ex - 6, y - 5); ctx.lineTo(ex, y); ctx.lineTo(ex - 6, y + 5); ctx.stroke(); }
        }
        ctx.restore();
        for (let i = 0; i < shield.max; i++) {
            ctx.fillStyle = i < shield.charges ? '#60a5fa' : 'rgba(148,163,184,.25)';
            roundRect(ctx, 40 + i * 9, 6, 7, 5, 2); ctx.fill();
        }
    }
}
// Scrappy slides along this rail between gun stations
function drawRail(ctx, lanes) {
    ctx.fillStyle = '#0f172a'; ctx.fillRect(36, lanes[0] - 26, 6, lanes[lanes.length - 1] - lanes[0] + 52);
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 1; ctx.strokeRect(36, lanes[0] - 26, 6, lanes[lanes.length - 1] - lanes[0] + 52);
}
// A lane turret: wall bracket, armored base and dome. mode: 'pilot' (Scrappy's), 'auto' or 'idle'
function drawTurret(ctx, x, y, mode, recoil, t) {
    const glow = { pilot: '#22d3ee', auto: '#f59e0b', idle: '#475569' }[mode];
    ctx.fillStyle = '#1e293b'; ctx.fillRect(28, y - 6, 18, 12);
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 1; ctx.strokeRect(28, y - 6, 18, 12);
    const g = ctx.createRadialGradient(x - 4, y - 6, 2, x, y, 17);
    g.addColorStop(0, '#475569'); g.addColorStop(1, '#0f172a');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = glow; ctx.lineWidth = 2; ctx.stroke();
    if (mode === 'pilot') {
        ctx.save(); ctx.strokeStyle = 'rgba(34,211,238,.6)'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 6]); ctx.lineDashOffset = -t / 30;
        ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    } else {
        // Unmanned turrets keep a dome (amber when the Auto-Turret upgrade runs them)
        ctx.save(); ctx.shadowColor = glow; ctx.shadowBlur = mode === 'auto' ? 12 : 0;
        const d = ctx.createRadialGradient(x - 3, y - 3, 1, x, y, 9);
        d.addColorStop(0, mode === 'auto' ? '#fef3c7' : '#94a3b8'); d.addColorStop(1, mode === 'auto' ? '#b45309' : '#334155');
        ctx.fillStyle = d; ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    drawBarrel(ctx, x, y, mode, recoil);
}
function drawBarrel(ctx, x, y, mode, recoil) {
    const bx = x + 4 - recoil, lit = mode !== 'idle';
    ctx.fillStyle = lit ? '#cbd5e1' : '#64748b';
    roundRect(ctx, bx, y - 4.5, 38, 9, 3); ctx.fill();
    ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#0f172a'; ctx.fillRect(bx + 20, y - 4.5, 3, 9); ctx.fillRect(bx + 28, y - 4.5, 3, 9);
    if (lit) {
        ctx.save(); ctx.shadowColor = mode === 'auto' ? '#f59e0b' : '#22d3ee'; ctx.shadowBlur = 12;
        ctx.fillStyle = mode === 'auto' ? '#fde68a' : '#e0f2fe'; ctx.fillRect(bx + 36, y - 3.5, 5, 7); ctx.restore();
    }
}
// Scrappy in the gunner's seat. mood: 'happy' (^^), 'focus' (firing) or 'worried' (just took a hit)
function drawScrappyPilot(ctx, x, y, t, mood) {
    const hx = x - 4, hy = y - 19 + Math.sin(t / 260) * 1.2;
    ctx.save();
    ctx.translate(x, y); ctx.scale(1.2, 1.2); ctx.translate(-x, -y);    // a little bigger than the turret
    drawScrappyHead(ctx, hx, hy, mood);
    // Arm reaching down to the gun's trigger grip
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0b1020'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(hx + 10, hy + 10); ctx.lineTo(x + 14, y - 2); ctx.stroke();
    ctx.strokeStyle = '#60a5fa'; ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.moveTo(hx + 10, hy + 10); ctx.lineTo(x + 14, y - 2); ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#0b1020'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x + 14, y - 2, 3.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.restore();
}
// Scrappy's head (shared by every game that shows him), centered on hx, hy
function drawScrappyHead(ctx, hx, hy, mood = 'happy') {
    ctx.save();
    ctx.lineJoin = 'round';
    // Antennae
    ctx.fillStyle = '#60a5fa'; ctx.strokeStyle = '#0b1020'; ctx.lineWidth = 1.5;
    [[-9, -1], [9, 1]].forEach(([dx, dir]) => {
        ctx.beginPath(); ctx.ellipse(hx + dx, hy - 15, 2.6, 6.5, dir * 0.35, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    });
    // Ear pods
    ctx.fillStyle = '#3b82f6';
    roundRect(ctx, hx - 19, hy - 5, 6, 11, 3); ctx.fill(); ctx.stroke();
    roundRect(ctx, hx + 13, hy - 5, 6, 11, 3); ctx.fill(); ctx.stroke();
    // Head
    const g = ctx.createLinearGradient(0, hy - 12, 0, hy + 12);
    g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#d6dfeb');
    ctx.fillStyle = g; ctx.lineWidth = 2;
    roundRect(ctx, hx - 15, hy - 12, 30, 24, 8); ctx.fill(); ctx.stroke();
    // Visor
    ctx.fillStyle = '#0b1020'; roundRect(ctx, hx - 11, hy - 8, 22, 16, 5); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(hx + 4, hy - 6, 4, 2);
    // Face
    ctx.strokeStyle = '#67e8f9'; ctx.fillStyle = '#67e8f9'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.shadowColor = '#67e8f9'; ctx.shadowBlur = 6;
    if (mood === 'worried') {
        ctx.beginPath(); ctx.arc(hx - 5, hy, 2, 0, Math.PI * 2); ctx.arc(hx + 5, hy, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(hx - 8, hy - 4); ctx.lineTo(hx - 3, hy - 6); ctx.moveTo(hx + 8, hy - 4); ctx.lineTo(hx + 3, hy - 6); ctx.stroke();
    } else if (mood === 'focus') {
        ctx.beginPath(); ctx.moveTo(hx - 8, hy - 2); ctx.lineTo(hx - 3, hy); ctx.lineTo(hx - 8, hy + 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(hx + 8, hy - 2); ctx.lineTo(hx + 3, hy); ctx.lineTo(hx + 8, hy + 2); ctx.stroke();
    } else {
        ctx.beginPath(); ctx.arc(hx - 5, hy + 2, 3, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
        ctx.beginPath(); ctx.arc(hx + 5, hy + 2, 3, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    }
    ctx.restore();
}
// Standard malware: a spiky virus with a single eye watching the fortress
function drawMalware(ctx, x, y, t, flash) {
    const spin = t / 500, bob = Math.sin(t / 180 + x) * 2;
    y += bob;
    ctx.save();
    ctx.shadowColor = '#f472b6'; ctx.shadowBlur = 14;
    ctx.fillStyle = '#be185d';
    for (let i = 0; i < 8; i++) {
        const a = spin + i * Math.PI / 4;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a - 0.22) * 13, y + Math.sin(a - 0.22) * 13);
        ctx.lineTo(x + Math.cos(a) * 21, y + Math.sin(a) * 21);
        ctx.lineTo(x + Math.cos(a + 0.22) * 13, y + Math.sin(a + 0.22) * 13);
        ctx.fill();
        ctx.beginPath(); ctx.arc(x + Math.cos(a) * 21, y + Math.sin(a) * 21, 2.4, 0, Math.PI * 2); ctx.fillStyle = '#f9a8d4'; ctx.fill(); ctx.fillStyle = '#be185d';
    }
    const g = ctx.createRadialGradient(x - 4, y - 5, 2, x, y, 15);
    g.addColorStop(0, '#f9a8d4'); g.addColorStop(0.5, '#db2777'); g.addColorStop(1, '#500724');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(x - 3, y, 6, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(x - 5, y, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1f0010'; ctx.beginPath(); ctx.arc(x - 5.5, y, 1.4, 0, Math.PI * 2); ctx.fill();
    if (flash > 0) { ctx.globalAlpha = 0.7; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 15, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
}
// Armored trojan: hexagonal plated shell with a glowing core; pips show its remaining hits
function drawTrojan(ctx, x, y, t, hp, flash, maxHp = 3) {
    const r = 22, rot = Math.sin(t / 600) * 0.12;
    const hex = rad => { ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = rot + Math.PI / 6 + i * Math.PI / 3; ctx[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rad, y + Math.sin(a) * rad); } ctx.closePath(); };
    ctx.save();
    ctx.shadowColor = '#a855f7'; ctx.shadowBlur = 18;
    const g = ctx.createLinearGradient(x, y - r, x, y + r);
    g.addColorStop(0, '#7c3aed'); g.addColorStop(1, '#2e1065');
    ctx.fillStyle = g; hex(r); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = '#c4b5fd'; ctx.lineWidth = 2; hex(r); ctx.stroke();
    ctx.strokeStyle = 'rgba(196,181,253,.35)'; ctx.lineWidth = 1.5; hex(r - 7); ctx.stroke();
    // Armor bolts
    ctx.fillStyle = '#ddd6fe';
    for (let i = 0; i < 6; i++) { const a = rot + Math.PI / 6 + i * Math.PI / 3; ctx.beginPath(); ctx.arc(x + Math.cos(a) * (r - 3.5), y + Math.sin(a) * (r - 3.5), 1.8, 0, Math.PI * 2); ctx.fill(); }
    // Core eye
    const pulse = 0.75 + 0.25 * Math.sin(t / 150);
    ctx.save(); ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 16 * pulse;
    const c = ctx.createRadialGradient(x - 2, y, 1, x - 2, y, 9);
    c.addColorStop(0, '#fff1f2'); c.addColorStop(0.4, '#f43f5e'); c.addColorStop(1, '#4c0519');
    ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x - 2, y, 9, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    // Hit pips
    const pip = Math.min(11.5, 34 / maxHp);
    for (let i = 0; i < maxHp; i++) {
        ctx.fillStyle = i < hp ? '#f472b6' : 'rgba(148,163,184,.3)';
        roundRect(ctx, x - (pip * maxHp) / 2 + i * pip, y - r - 11, pip - 2.5, 4, 2); ctx.fill();
    }
    if (flash > 0) { ctx.globalAlpha = 0.65; ctx.fillStyle = '#fff'; hex(r); ctx.fill(); ctx.globalAlpha = 1; }
}
// Laser bolt with a fading trail
function drawBolt(ctx, x, y) {
    const g = ctx.createLinearGradient(x - 26, 0, x + 18, 0);
    g.addColorStop(0, 'rgba(56,189,248,0)'); g.addColorStop(1, '#7dd3fc');
    ctx.fillStyle = g; ctx.fillRect(x - 26, y - 2, 44, 4);
    ctx.save(); ctx.shadowColor = '#38bdf8'; ctx.shadowBlur = 12; ctx.fillStyle = '#e0f2fe';
    ctx.beginPath(); ctx.arc(x + 16, y, 3.5, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}

// Cyber Shield flow: answer a question -> spend credits in the Armory -> defend for one wave.
// Correct answers pay credits (more on a streak); upgrades last for the whole lesson.
const DEFENSE_UPGRADES = [
    { k: 'damage', icon: '💥', name: 'Plasma Rounds', desc: '+1 damage per shot', costs: [120, 240, 380] },
    { k: 'rate', icon: '⚡', name: 'Rapid Capacitors', desc: 'Fires 25% faster per level', costs: [100, 200, 320] },
    { k: 'shield', icon: '🛡️', name: 'Deflector Shield', desc: 'Blocks 2 breaches every wave (+2 per level)', costs: [150, 280] },
    { k: 'auto', icon: '🤖', name: 'Auto-Turrets', desc: 'The turrets Scrappy is not using fire on their own', costs: [260] },
    { k: 'xp', icon: '🎓', name: 'Double XP', desc: 'Doubles the XP you earn from this lesson', costs: [200] },
    { k: 'mult', icon: '🌟', name: '2x Score', desc: 'Doubles every point you score', costs: [180] }
];
const DEFENSE_SUPPLIES = [
    { k: 'emp', icon: '💣', name: 'EMP Charge', desc: 'Press E (or the EMP button) to wipe the screen. Hold up to 3.', cost: 70 },
    { k: 'repair', icon: '🔧', name: 'Core Repair', desc: 'Restores 30% core health', cost: 50 }
];

ARCADE_LOGIC.defense = S => {
    const T = { core: 100, credits: 0, emp: 0, report: null, lv: { damage: 0, rate: 0, shield: 0, auto: 0, xp: 0, mult: 0 } };
    FX.preload(['laser', 'robotDeath', 'armorHit', 'shieldBlock', 'coreBreach', 'emp']);
    const scoreMult = () => (T.lv.mult ? 2 : 1) * S.combo.mult;

    function armory(gain, startWave) {
        const owned = u => T.lv[u.k] >= u.costs.length;
        const upgradeBtn = u => {
            const lvl = T.lv[u.k], max = u.costs.length, cost = u.costs[lvl];
            const tag = max > 1 ? ` <em>Lv ${lvl}/${max}</em>` : '';
            return `<button type="button" class="shop-btn" data-up="${u.k}" ${owned(u) ? 'disabled' : ''}>
                ${u.icon} ${u.name}${tag} ${owned(u) ? '✅' : `(${cost} 💰)`}<small>${u.desc}</small></button>`;
        };
        const supplyBtn = s => {
            const full = (s.k === 'emp' && T.emp >= 3) || (s.k === 'repair' && T.core >= 100);
            const have = s.k === 'emp' ? ` <em>${T.emp}/3</em>` : ` <em>Core ${T.core}%</em>`;
            return `<button type="button" class="shop-btn" data-supply="${s.k}" ${full ? 'disabled' : ''}>
                ${s.icon} ${s.name}${have} (${s.cost} 💰)<small>${s.desc}</small></button>`;
        };
        S.stage.innerHTML = `
            <div class="quiz-game-card">
                <h2 class="shop-title">🛠️ Firewall Armory</h2>
                ${gain ? `<p class="round-intro">✅ Correct! +${gain} credits${S.combo.streak > 1 ? ` (🔥 ${S.combo.streak} streak bonus)` : ''}</p>` : '<p class="round-intro">❌ No credits this time. Answer correctly to earn upgrade credits.</p>'}
                ${T.report ? `<p class="canvas-instructions">Last wave: ${T.report}</p>` : ''}
                <p class="shop-credits">Your Credits: <strong class="credit-highlight">${T.credits} 💰</strong></p>
                <div class="armory-grid">${DEFENSE_UPGRADES.map(upgradeBtn).join('')}${DEFENSE_SUPPLIES.map(supplyBtn).join('')}</div>
                <button type="button" class="btn-continue-shop" data-start-wave>Start Wave ${S.q + 1} →</button>
            </div>`;
        const spend = cost => {
            if (T.credits < cost) { toast(`Not enough credits. You need ${cost} 💰.`, 'warn'); return false; }
            T.credits -= cost; FX.sample('shopBuy');
            return true;
        };
        $$('[data-up]', S.stage).forEach(b => b.onclick = () => {
            const u = DEFENSE_UPGRADES.find(x => x.k === b.dataset.up);
            if (owned(u) || !spend(u.costs[T.lv[u.k]])) return;
            T.lv[u.k]++;
            if (u.k === 'xp') S.xpMult = 2;
            toast(`${u.name} installed!`, 'success');
            armory(gain, startWave);
        });
        $$('[data-supply]', S.stage).forEach(b => b.onclick = () => {
            const s = DEFENSE_SUPPLIES.find(x => x.k === b.dataset.supply);
            if (!spend(s.cost)) return;
            if (s.k === 'emp') T.emp++; else T.core = Math.min(100, T.core + 30);
            armory(gain, startWave);
        });
        const go = $('[data-start-wave]', S.stage);
        go.onclick = startWave;
        setTimeout(() => { if (document.body.contains(go)) go.focus({ preventScroll: true }); }, 400);
    }

    function wave(next) {
        let kills = 0, leaks = 0, blocked = 0;
        const q = S.q;
        const shieldMax = T.lv.shield * 2;
        canvasRound(S, {
            title: '🛡️ Cyber Shield', theme: 'theme-defense', seconds: 15, skipSummary: true,
            intro: `Wave ${q + 1}: Scrappy is on the guns! Move him to the lane under attack.`,
            hint: 'Up / Down, W / S, 1 / 2 / 3 or tap a lane to move Scrappy · E fires an EMP',
            buttons: '<button type="button" class="game-btn" data-action="emp">💥 EMP</button>',
            onEnd: () => {
                T.report = `${kills} destroyed · ${leaks} breaches${blocked ? ` · ${blocked} blocked by the shield` : ''} · core ${T.core}%`;
                next();
            },
            setup(api) {
                const { ctx, juice } = api;
                const lanes = [70, 180, 290];
                const chain = createChain(2500);
                const stars = makeStars(70, 640, 360), recoil = [0, 0, 0], cooldowns = [0, 0, 0];
                let lane = 1, pilotY = lanes[1], enemies = [], shots = [], spawn = 400;
                let t = 0, baseHit = 0, blockMs = 0, focusMs = 0, shield = shieldMax;
                const damage = 1 + T.lv.damage;
                const fireDelay = 380 * Math.pow(0.75, T.lv.rate);
                const emp = () => {
                    if (!T.emp || !enemies.length) return;
                    T.emp--;
                    enemies.forEach(e => { juice.burst(e.x, lanes[e.lane], '#00f2fe', 18); S.score += 20 * scoreMult(); kills++; });
                    enemies = [];
                    juice.shake(18); FX.flash('rgba(0,242,254,.35)'); FX.sample('emp');
                };
                const killEnemy = e => {
                    const pts = Math.round((e.tough ? 60 : 25) * scoreMult() * chain.hit());
                    S.score += pts; kills++;
                    juice.burst(e.x, lanes[e.lane], e.tough ? '#a855f7' : '#f472b6', 24);
                    juice.burst(e.x, lanes[e.lane], '#cbd5e1', 8);
                    juice.text(e.x, lanes[e.lane] - 22, `+${pts}`, '#67e8f9');
                    juice.shake(e.tough ? 8 : 4); FX.sample('robotDeath');
                };
                return {
                    key(code) {
                        if (code === 'ArrowUp' || code === 'KeyW') lane = Math.max(0, lane - 1);
                        if (code === 'ArrowDown' || code === 'KeyS') lane = Math.min(2, lane + 1);
                        const n = { Digit1: 0, Digit2: 1, Digit3: 2, Numpad1: 0, Numpad2: 1, Numpad3: 2 }[code];
                        if (n !== undefined) lane = n;
                        if (code === 'KeyE') emp();
                    },
                    tap(x, y) { lane = clamp(Math.floor(y / 120), 0, 2); },
                    action: emp,
                    frame(dt, ms) {
                        chain.tick(ms);
                        t += ms; baseHit -= ms; blockMs -= ms; focusMs -= ms;
                        pilotY += (lanes[lane] - pilotY) * Math.min(1, 0.25 * dt);    // Scrappy glides along the rail
                        const docked = Math.abs(pilotY - lanes[lane]) < 3;
                        spaceBackdrop(ctx, 640, 360, stars, dt, t);
                        drawLanes(ctx, lanes, lane, t);
                        drawFortress(ctx, T.core, t, baseHit, { charges: shield, max: shieldMax, blockMs });
                        drawRail(ctx, lanes);

                        // Spawning gets harder every wave, whatever upgrades you own
                        spawn -= ms;
                        if (spawn <= 0) {
                            const tough = Math.random() < 0.15 + q * 0.06;
                            const hp = tough ? 3 + Math.floor(q / 2) : 1 + (q >= 3 ? 1 : 0);
                            enemies.push({ lane: Math.floor(Math.random() * 3), x: 660, hp, maxHp: hp, tough, speed: (tough ? 0.8 : rand(1.2, 1.9)) + q * 0.12 });
                            spawn = rand(620, 1000) - q * 60;
                        }

                        // Scrappy's gun fires when he is docked; Auto-Turrets run the other two
                        lanes.forEach((y, i) => {
                            recoil[i] = Math.max(0, recoil[i] - 0.8 * dt);
                            cooldowns[i] -= ms;
                            const manned = i === lane && docked, auto = !manned && T.lv.auto > 0;
                            if ((manned || auto) && cooldowns[i] <= 0 && enemies.some(e => e.lane === i && e.x < 650)) {
                                shots.push({ lane: i, x: 90, dmg: damage });
                                cooldowns[i] = manned ? fireDelay : fireDelay * 2.2;
                                recoil[i] = 6;
                                if (manned) focusMs = 250;
                                FX.sample('laser');
                            }
                            drawTurret(ctx, 58, y, i === lane ? 'pilot' : auto ? 'auto' : 'idle', recoil[i], t);
                        });
                        drawScrappyPilot(ctx, 58, pilotY, t, baseHit > 0 ? 'worried' : focusMs > 0 ? 'focus' : 'happy');
                        if (docked) drawBarrel(ctx, 58, lanes[lane], 'pilot', recoil[lane]);

                        shots.forEach(s => { s.x += 11 * dt; drawBolt(ctx, s.x, lanes[s.lane]); });
                        enemies.forEach(e => {
                            e.x -= e.speed * dt;
                            e.flash = (e.flash || 0) - ms;
                            if (e.tough) drawTrojan(ctx, e.x, lanes[e.lane], t, e.hp, e.flash, e.maxHp);
                            else drawMalware(ctx, e.x, lanes[e.lane], t, e.flash);
                            shots.forEach(s => {
                                if (!s.used && s.lane === e.lane && e.hp > 0 && s.x + 18 >= e.x - 16 && s.x <= e.x + 16) {
                                    s.used = true; e.hp -= s.dmg; e.flash = 90;
                                    juice.burst(e.x, lanes[e.lane], '#38bdf8', 6);
                                    if (e.hp <= 0) killEnemy(e); else FX.sample('armorHit');
                                }
                            });
                            if (e.hp > 0 && e.x <= 44) {
                                e.hp = 0; chain.reset();
                                if (shield > 0) {
                                    // The Deflector Shield soaks the hit
                                    shield--; blocked++; blockMs = 260;
                                    juice.burst(44, lanes[e.lane], '#60a5fa', 22); juice.text(70, lanes[e.lane] - 20, 'BLOCKED', '#93c5fd');
                                    juice.shake(6); FX.sample('shieldBlock');
                                } else {
                                    leaks++; baseHit = 350;
                                    T.core = Math.max(0, T.core - (e.tough ? 20 : 10));
                                    juice.burst(30, lanes[e.lane], '#ef4444', 24); juice.shake(16); FX.sample('coreBreach');
                                    if (T.core <= 0) {
                                        T.core = 50; S.score = Math.max(0, S.score - 300);
                                        juice.text(320, 180, 'CORE REBOOTED  -300', '#f87171'); FX.flash('rgba(239,68,68,.4)');
                                    }
                                }
                            }
                        });
                        enemies = enemies.filter(e => e.hp > 0);
                        shots = shots.filter(s => !s.used && s.x < 660);
                        if (chain.count >= 3) { ctx.font = '800 15px Orbitron, sans-serif'; ctx.fillStyle = '#fbbf24'; ctx.fillText(`CHAIN x${chain.count}`, 520, 24); }
                        api.hud(`Core ${T.core}%${shieldMax ? ` · 🛡️${shield}` : ''} · EMP ${T.emp}`);
                    },
                    summary: () => [`Malware destroyed: <strong>${kills}</strong>`, `Breaches: <strong>${leaks}</strong>`, ...(blocked ? [`Blocked by shield: <strong>${blocked}</strong>`] : []), `Core health: <strong>${T.core}%</strong>`, `Credits left: <strong>${T.credits} 💰</strong>`]
                };
            }
        });
    }

    return {
        status: () => `Core ${T.core}% · ${T.credits} 💰`,
        round(ok, next) {
            const gain = ok ? 100 + (S.combo.streak - 1) * 25 : 0;
            T.credits += gain;
            armory(gain, () => wave(next));
        }
    };
};

// ---- 2. NEON HOVER RUNNER ---------------------------------------------------
// Every wave is a new zone with its own sky, nebula and track colors
const RUNNER_ZONES = [
    { name: 'Neon Nebula', sky: ['#0b0626', '#1a0b3d', '#05030f'], neb: ['rgba(168,85,247,.22)', 'rgba(56,189,248,.12)'], track: '#a855f7', glow: '#d8b4fe' },
    { name: 'Frost Rings', sky: ['#04111f', '#0b2a45', '#020812'], neb: ['rgba(56,189,248,.24)', 'rgba(167,243,208,.10)'], track: '#38bdf8', glow: '#bae6fd' },
    { name: 'Solar Flare', sky: ['#1a0707', '#3b1206', '#0a0303'], neb: ['rgba(251,146,60,.26)', 'rgba(244,63,94,.14)'], track: '#fb923c', glow: '#fed7aa' },
    { name: 'Emerald Drift', sky: ['#03140f', '#073325', '#010805'], neb: ['rgba(52,211,153,.22)', 'rgba(34,211,238,.10)'], track: '#34d399', glow: '#a7f3d0' },
    { name: 'Event Horizon', sky: ['#0d0216', '#2a0636', '#030006'], neb: ['rgba(244,114,182,.24)', 'rgba(129,140,248,.14)'], track: '#f472b6', glow: '#fbcfe8' }
];
const PLANET_STYLES = [
    ['#fdba74', '#9a3412'], ['#93c5fd', '#1e3a8a'], ['#c4b5fd', '#4c1d95'], ['#6ee7b7', '#065f46'], ['#fde68a', '#92400e'], ['#f9a8d4', '#831843']
];
function makePlanet(x) {
    const [light, dark] = PLANET_STYLES[Math.floor(Math.random() * PLANET_STYLES.length)];
    return { x, y: rand(60, 190), r: rand(26, 70), light, dark, ring: Math.random() < 0.45, tilt: rand(-0.5, 0.5), bands: Math.random() < 0.6 };
}
function drawPlanet(ctx, p) {
    const ring = half => {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.tilt);
        ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = p.r * 0.12;
        ctx.beginPath(); ctx.ellipse(0, 0, p.r * 1.7, p.r * 0.42, 0, half ? Math.PI : 0, half ? Math.PI * 2 : Math.PI); ctx.stroke();
        ctx.strokeStyle = p.light; ctx.globalAlpha = 0.5; ctx.lineWidth = p.r * 0.05;
        ctx.beginPath(); ctx.ellipse(0, 0, p.r * 1.5, p.r * 0.36, 0, half ? Math.PI : 0, half ? Math.PI * 2 : Math.PI); ctx.stroke();
        ctx.restore();
    };
    if (p.ring) ring(true);                 // back half of the ring
    ctx.save();
    const glow = ctx.createRadialGradient(p.x, p.y, p.r * 0.8, p.x, p.y, p.r * 1.6);
    glow.addColorStop(0, p.light + '55'); glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 1.6, 0, Math.PI * 2); ctx.fill();
    const g = ctx.createRadialGradient(p.x - p.r * 0.4, p.y - p.r * 0.4, p.r * 0.1, p.x, p.y, p.r);
    g.addColorStop(0, p.light); g.addColorStop(1, p.dark);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    ctx.clip();
    if (p.bands) {
        ctx.globalAlpha = 0.18; ctx.fillStyle = '#fff';
        for (let i = -2; i <= 2; i++) ctx.fillRect(p.x - p.r, p.y + i * p.r * 0.35 - p.r * 0.06, p.r * 2, p.r * 0.12);
        ctx.globalAlpha = 1;
    }
    // Night side
    const shade = ctx.createLinearGradient(p.x - p.r, p.y - p.r, p.x + p.r, p.y + p.r);
    shade.addColorStop(0.45, 'rgba(0,0,0,0)'); shade.addColorStop(1, 'rgba(0,0,0,.65)');
    ctx.fillStyle = shade; ctx.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
    ctx.restore();
    if (p.ring) ring(false);                // front half of the ring
}
// The floating hover-track, with gaps cut out of it
function drawTrack(ctx, zone, ground, scroll, gaps, t, nitro) {
    const parts = [];
    let from = -20;
    [...gaps].sort((a, b) => a.x - b.x).forEach(g => { if (!g.bridged) { parts.push([from, g.x]); from = g.x + g.w; } });
    parts.push([from, 660]);
    // Support pylons and under-glow
    ctx.strokeStyle = 'rgba(148,163,184,.12)'; ctx.lineWidth = 6;
    for (let x = -(scroll % 220); x < 680; x += 220) {
        if (parts.some(([a, b]) => x > a && x < b)) { ctx.beginPath(); ctx.moveTo(x, ground + 18); ctx.lineTo(x - 30, 360); ctx.stroke(); }
    }
    parts.forEach(([a, b]) => {
        if (b - a < 2) return;
        const under = ctx.createLinearGradient(0, ground, 0, ground + 70);
        under.addColorStop(0, zone.neb[0]); under.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = under; ctx.fillRect(a, ground + 16, b - a, 70);
        const slab = ctx.createLinearGradient(0, ground, 0, ground + 18);
        slab.addColorStop(0, '#1e293b'); slab.addColorStop(1, '#0b1020');
        ctx.fillStyle = slab; ctx.fillRect(a, ground, b - a, 18);
        ctx.save(); ctx.shadowColor = nitro ? '#fbbf24' : zone.track; ctx.shadowBlur = 16;
        ctx.fillStyle = nitro ? '#fbbf24' : zone.track; ctx.fillRect(a, ground - 1, b - a, 3);
        ctx.restore();
        ctx.fillStyle = zone.glow;
        for (let x = a + ((-scroll % 40) + 40) % 40; x < b - 4; x += 40) ctx.fillRect(x, ground + 9, 10, 2);
        // Hazard stripes where the track ends at a gap
        [[a, 1], [b, -1]].forEach(([edge, dir]) => {
            if (edge <= -20 || edge >= 660) return;
            for (let i = 0; i < 3; i++) { ctx.fillStyle = i % 2 ? '#0b1020' : '#facc15'; ctx.fillRect(dir > 0 ? edge + i * 5 : edge - (i + 1) * 5, ground, 5, 18); }
        });
    });
    // Energy bridges that rescued a fall
    gaps.filter(g => g.bridged).forEach(g => {
        ctx.save(); ctx.globalAlpha = 0.5 + 0.3 * Math.sin(t / 90); ctx.fillStyle = '#67e8f9'; ctx.shadowColor = '#67e8f9'; ctx.shadowBlur = 14;
        ctx.fillRect(g.x, ground - 1, g.w, 4); ctx.restore();
    });
}
// Laser barrier: two posts with flickering beams. Tall ones need a double jump.
function drawBarrier(ctx, o, t) {
    const top = o.y, h = o.h;
    ctx.fillStyle = '#334155'; ctx.fillRect(o.x, top, 6, h); ctx.fillRect(o.x + o.w - 6, top, 6, h);
    ctx.fillStyle = '#64748b'; ctx.fillRect(o.x - 1, top - 4, 8, 5); ctx.fillRect(o.x + o.w - 7, top - 4, 8, 5);
    ctx.save(); ctx.shadowColor = '#f43f5e'; ctx.shadowBlur = 12;
    for (let y = top + 6; y < top + h - 2; y += 9) {
        ctx.globalAlpha = 0.55 + 0.45 * Math.sin(t / 40 + y);
        ctx.fillStyle = '#fb7185'; ctx.fillRect(o.x + 6, y, o.w - 12, 2);
    }
    ctx.restore();
    ctx.fillStyle = Math.floor(t / 300) % 2 ? '#ef4444' : '#7f1d1d';
    ctx.beginPath(); ctx.arc(o.x + 3, top - 6, 2.5, 0, Math.PI * 2); ctx.arc(o.x + o.w - 3, top - 6, 2.5, 0, Math.PI * 2); ctx.fill();
}
// Security drone: saucer body, red scanner eye and blinking lights
function drawDrone(ctx, o, t) {
    const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
    ctx.save();
    ctx.globalAlpha = 0.18; ctx.fillStyle = '#f43f5e';
    ctx.beginPath(); ctx.moveTo(cx - 6, cy + 6); ctx.lineTo(cx + 6, cy + 6); ctx.lineTo(cx + 18, cy + 60); ctx.lineTo(cx - 18, cy + 60); ctx.fill();
    ctx.restore();
    const d = ctx.createLinearGradient(0, cy - 10, 0, cy + 10);
    d.addColorStop(0, '#94a3b8'); d.addColorStop(1, '#1e293b');
    ctx.fillStyle = d; ctx.beginPath(); ctx.ellipse(cx, cy + 2, 18, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#334155'; ctx.beginPath(); ctx.ellipse(cx, cy - 2, 10, 8, 0, Math.PI, 0); ctx.fill();
    ctx.save(); ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 12; ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.arc(cx - 3 + Math.sin(t / 300) * 3, cy - 3, 3.2, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ['#22d3ee', '#fbbf24', '#22d3ee'].forEach((c, i) => {
        ctx.fillStyle = Math.floor(t / 200 + i) % 2 ? c : '#0f172a';
        ctx.beginPath(); ctx.arc(cx - 10 + i * 10, cy + 3, 1.6, 0, Math.PI * 2); ctx.fill();
    });
}
// Data orb (points + 2 credits) and the rarer gold credit chip (+15 credits)
function drawOrb(ctx, o, t) {
    const cx = o.x + o.w / 2, cy = o.y + o.h / 2 + Math.sin(t / 220 + o.x * 0.05) * 3;
    ctx.save(); ctx.shadowColor = '#34d399'; ctx.shadowBlur = 14;
    const g = ctx.createRadialGradient(cx - 2, cy - 2, 1, cx, cy, 7);
    g.addColorStop(0, '#ecfdf5'); g.addColorStop(1, '#10b981');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 6.5, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.strokeStyle = 'rgba(110,231,183,.7)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(cx, cy, 11, 4, t / 400, 0, Math.PI * 2); ctx.stroke();
}
function drawChip(ctx, o, t) {
    const cx = o.x + o.w / 2, cy = o.y + o.h / 2 + Math.sin(t / 260) * 4, sx = Math.abs(Math.cos(t / 350));
    ctx.save(); ctx.translate(cx, cy); ctx.scale(0.35 + 0.65 * sx, 1);
    ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 16;
    ctx.fillStyle = '#f59e0b'; roundRect(ctx, -9, -9, 18, 18, 3); ctx.fill();
    ctx.shadowBlur = 0; ctx.fillStyle = '#fde68a'; roundRect(ctx, -5, -5, 10, 10, 2); ctx.fill();
    ctx.fillStyle = '#92400e'; for (let i = -6; i <= 6; i += 4) { ctx.fillRect(i - 0.75, -12, 1.5, 3); ctx.fillRect(i - 0.75, 9, 1.5, 3); }
    ctx.restore();
}
// Scrappy riding his hoverboard. (x, y) is the top-left of his hit box.
function drawScrappyRider(ctx, p, t, { lean = 0, airborne = false, nitro = false, mood = 'happy', glow = '#a855f7', blink = false }) {
    if (blink) return;
    const cx = p.x + p.w / 2, feet = p.y + p.h;
    ctx.save();
    ctx.translate(cx, feet); ctx.rotate(lean); ctx.scale(1.15, 1.15); ctx.translate(-cx, -feet);
    // Board with thruster flame
    const bob = airborne ? 0 : Math.sin(t / 120) * 1.5;
    const by = feet - 4 + bob;
    const flame = 10 + Math.random() * (nitro ? 18 : 8);
    ctx.save(); ctx.shadowColor = nitro ? '#fbbf24' : '#22d3ee'; ctx.shadowBlur = 14;
    ctx.fillStyle = nitro ? '#fbbf24' : '#67e8f9';
    ctx.beginPath(); ctx.moveTo(p.x - 8, by - 2); ctx.lineTo(p.x - 8 - flame, by + 1.5); ctx.lineTo(p.x - 8, by + 5); ctx.fill();
    ctx.restore();
    ctx.save(); ctx.shadowColor = glow; ctx.shadowBlur = 16;
    const bg = ctx.createLinearGradient(p.x - 10, 0, p.x + p.w + 10, 0);
    bg.addColorStop(0, '#1e293b'); bg.addColorStop(0.5, nitro ? '#f59e0b' : glow); bg.addColorStop(1, '#1e293b');
    ctx.fillStyle = bg; roundRect(ctx, p.x - 10, by - 3, p.w + 20, 7, 3.5); ctx.fill();
    ctx.restore();
    ctx.globalAlpha = 0.35; ctx.fillStyle = nitro ? '#fbbf24' : glow;
    ctx.beginPath(); ctx.ellipse(cx, by + 9, 18, 3, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    // Legs
    ctx.strokeStyle = '#1d4ed8'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx - 5, feet - 16); ctx.lineTo(cx - 7, by - 3); ctx.moveTo(cx + 5, feet - 16); ctx.lineTo(cx + 7, by - 3); ctx.stroke();
    // Body: white egg with Scrappy's blue chest band and glowing light
    const bodyY = feet - 21;
    ctx.fillStyle = '#f1f5f9'; ctx.strokeStyle = '#0b1020'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(cx, bodyY, 9, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.ellipse(cx, bodyY, 9, 8, 0, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = '#3b82f6'; ctx.fillRect(cx - 10, bodyY - 9, 20, 7); ctx.restore();
    ctx.fillStyle = '#67e8f9'; ctx.beginPath(); ctx.arc(cx, bodyY - 3, 2, 0, Math.PI * 2); ctx.fill();
    // Arms: out for balance, up in the air when jumping
    const armUp = airborne ? -9 : -2 + Math.sin(t / 150) * 2;
    [[-1, armUp], [1, airborne ? -6 : 1]].forEach(([s, dy]) => {
        ctx.strokeStyle = '#0b1020'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(cx + s * 7, bodyY - 3); ctx.lineTo(cx + s * 16, bodyY + dy); ctx.stroke();
        ctx.strokeStyle = '#60a5fa'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx + s * 7, bodyY - 3); ctx.lineTo(cx + s * 16, bodyY + dy); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx + s * 16, bodyY + dy, 2.6, 0, Math.PI * 2); ctx.fill();
    });
    drawScrappyHead(ctx, cx + 1, feet - 40, mood);
    ctx.restore();
}

// ---- Hover Garage upgrades (bought with credits from right answers and orbs) ----
const RUNNER_UPGRADES = [
    { k: 'thrust', icon: '🚀', name: 'Thrusters', desc: 'Ride faster and score 15% more distance points per level', costs: [100, 200, 320] },
    { k: 'jets', icon: '🦘', name: 'Jump Jets', desc: 'Lv 1: higher jumps · Lv 2: triple jump', costs: [120, 240] },
    { k: 'shield', icon: '🛡️', name: 'Energy Shield', desc: 'Absorbs 1 crash per zone per level', costs: [120, 220, 340] },
    { k: 'magnet', icon: '🧲', name: 'Orb Magnet', desc: 'Pulls in orbs and chips (bigger range at Lv 2)', costs: [140, 260] },
    { k: 'blaster', icon: '🔫', name: 'Laser Blaster', desc: 'Press F to shoot drones and barriers (faster at Lv 2)', costs: [200, 320] },
    { k: 'xp', icon: '🎓', name: 'Double XP', desc: 'Doubles the XP you earn from this lesson', costs: [200] },
    { k: 'mult', icon: '🌟', name: '2x Score', desc: 'Doubles every point you score', costs: [180] }
];

ARCADE_LOGIC.runner = S => {
    const T = { credits: 0, nitro: 0, meters: 0, report: null, lv: { thrust: 0, jets: 0, shield: 0, magnet: 0, blaster: 0, xp: 0, mult: 0 } };
    FX.preload(['jump', 'doubleJump', 'orb', 'crash', 'nitro', 'blaster', 'shieldPop', 'fall', 'zone', 'shopBuy']);
    const scoreMult = () => (T.lv.mult ? 2 : 1) * S.combo.mult;

    function garage(gain, startZone) {
        const zone = RUNNER_ZONES[S.q % RUNNER_ZONES.length];
        const maxed = u => T.lv[u.k] >= u.costs.length;
        const upBtn = u => {
            const lvl = T.lv[u.k], max = u.costs.length;
            return `<button type="button" class="shop-btn" data-up="${u.k}" ${maxed(u) ? 'disabled' : ''}>
                ${u.icon} ${u.name}${max > 1 ? ` <em>Lv ${lvl}/${max}</em>` : ''} ${maxed(u) ? '✅' : `(${u.costs[lvl]} 💰)`}<small>${u.desc}</small></button>`;
        };
        S.stage.innerHTML = `
            <div class="quiz-game-card">
                <h2 class="shop-title">🛠️ Hover Garage</h2>
                ${gain ? `<p class="round-intro">✅ Correct! +${gain} credits${S.combo.streak > 1 ? ` (🔥 ${S.combo.streak} streak bonus)` : ''}</p>` : '<p class="round-intro">❌ No credits this time. Right answers (and data orbs) earn credits.</p>'}
                ${T.report ? `<p class="canvas-instructions">Last zone: ${T.report}</p>` : ''}
                <p class="shop-credits">Your Credits: <strong class="credit-highlight">${T.credits} 💰</strong></p>
                <div class="armory-grid">${RUNNER_UPGRADES.map(upBtn).join('')}
                    <button type="button" class="shop-btn" data-nitro ${T.nitro >= 3 ? 'disabled' : ''}>🔥 Nitro Boost <em>${T.nitro}/3</em> (60 💰)<small>Press B: 2.5 s of top speed that smashes through anything</small></button>
                </div>
                <button type="button" class="btn-continue-shop" data-start-zone>Start Zone ${S.q + 1}: ${zone.name} →</button>
            </div>`;
        const spend = cost => {
            if (T.credits < cost) { toast(`Not enough credits. You need ${cost} 💰.`, 'warn'); return false; }
            T.credits -= cost; FX.sample('shopBuy');
            return true;
        };
        $$('[data-up]', S.stage).forEach(b => b.onclick = () => {
            const u = RUNNER_UPGRADES.find(x => x.k === b.dataset.up);
            if (maxed(u) || !spend(u.costs[T.lv[u.k]])) return;
            T.lv[u.k]++;
            if (u.k === 'xp') S.xpMult = 2;
            toast(`${u.name} installed!`, 'success');
            garage(gain, startZone);
        });
        $('[data-nitro]', S.stage).onclick = () => { if (T.nitro < 3 && spend(60)) { T.nitro++; garage(gain, startZone); } };
        const go = $('[data-start-zone]', S.stage);
        go.onclick = startZone;
        setTimeout(() => { if (document.body.contains(go)) go.focus({ preventScroll: true }); }, 400);
    }

    function zoneRun(next) {
        const q = S.q, zone = RUNNER_ZONES[q % RUNNER_ZONES.length];
        let orbs = 0, chips = 0, crashes = 0, smashed = 0, blasted = 0, earned = 0;
        const blasterBtn = T.lv.blaster ? '<button type="button" class="game-btn" data-action="blast">🔫 Blast (F)</button>' : '';
        canvasRound(S, {
            title: '🛹 Hover Runner', theme: 'theme-runner', seconds: 16, skipSummary: true,
            intro: `Zone ${q + 1}: ${zone.name}`,
            hint: `Space / Up / W or tap to jump (${T.lv.jets >= 2 ? 'triple' : 'double'} jump in the air) · B: Nitro${T.lv.blaster ? ' · F: Blaster' : ''}`,
            buttons: `<button type="button" class="game-btn" data-action="nitro">🔥 Nitro (B)</button>${blasterBtn}`,
            onEnd: () => {
                T.report = `${Math.round(T.meters)} m total · ${orbs} orbs · ${chips} chips · ${crashes} crashes · +${earned} credits collected`;
                next();
            },
            setup(api) {
                const { ctx, juice } = api;
                const GROUND = 292;
                const p = { x: 96, y: GROUND - 46, w: 26, h: 46, vy: 0, jumps: 0 };
                const chain = createChain(1800);
                const far = makeStars(50, 640, 280), near = makeStars(35, 640, 280);
                const planets = [makePlanet(rand(380, 600))];
                const trail = [], bolts = [];
                let things = [], gaps = [], spawn = 900, orbSpawn = 400, planetIn = rand(5000, 8000);
                let scroll = 0, safe = 0, t = 0, nitroMs = 0, blastCd = 0, worried = 0;
                let shields = T.lv.shield;
                const maxJumps = T.lv.jets >= 2 ? 3 : 2;
                const jumpPower = T.lv.jets ? 12.6 : 11.5;
                const magnetRange = [0, 150, 280][T.lv.magnet];
                FX.sample('zone');

                const jump = () => {
                    if (p.jumps >= maxJumps) return;
                    p.vy = p.jumps ? -(jumpPower - 1.3) : -jumpPower;
                    FX.sample(p.jumps ? 'doubleJump' : 'jump');
                    p.jumps++;
                    juice.burst(p.x + 13, p.y + p.h, zone.track, 8);
                };
                const nitro = () => {
                    if (!T.nitro || nitroMs > 0) return;
                    T.nitro--; nitroMs = 2500;
                    FX.sample('nitro'); FX.flash('rgba(251,191,36,.25)'); juice.shake(6);
                };
                const blast = () => {
                    if (!T.lv.blaster || blastCd > 0) return;
                    bolts.push({ x: p.x + p.w + 6, y: p.y + 20 });
                    blastCd = T.lv.blaster >= 2 ? 320 : 650;
                    FX.sample('blaster');
                };
                const crash = (msg, penalty) => {
                    chain.reset(); worried = 900; safe = 1100;
                    if (shields > 0) {
                        shields--; FX.sample('shieldPop');
                        juice.burst(p.x + 13, p.y + 20, '#67e8f9', 26); juice.text(p.x + 60, p.y - 10, 'SHIELD!', '#67e8f9'); juice.shake(8);
                    } else {
                        crashes++; S.score = Math.max(0, S.score - penalty);
                        FX.sample('crash'); juice.burst(p.x + 13, p.y + 20, '#ef4444', 26); juice.shake(16);
                        juice.text(p.x + 60, p.y - 10, `${msg} -${penalty}`, '#f87171');
                    }
                };
                const earn = n => { T.credits += n; earned += n; };

                return {
                    key(code) {
                        if (['Space', 'ArrowUp', 'KeyW'].includes(code)) jump();
                        if (code === 'KeyB') nitro();
                        if (code === 'KeyF') blast();
                    },
                    tap: jump,
                    action(a) { if (a === 'nitro') nitro(); else if (a === 'blast') blast(); },
                    frame(dt, ms) {
                        chain.tick(ms);
                        t += ms; safe -= ms; nitroMs -= ms; blastCd -= ms; worried -= ms;
                        const boosting = nitroMs > 0;
                        const speed = (5 + q * 0.4 + T.lv.thrust * 0.6) * (boosting ? 1.7 : 1);
                        scroll += speed * dt; T.meters += speed * dt * 0.05;
                        S.score += speed * dt * 0.08 * (1 + T.lv.thrust * 0.15) * scoreMult();

                        // Sky, nebula, parallax stars and the occasional planet drifting past
                        const sky = ctx.createLinearGradient(0, 0, 0, 360);
                        sky.addColorStop(0, zone.sky[0]); sky.addColorStop(0.55, zone.sky[1]); sky.addColorStop(1, zone.sky[2]);
                        ctx.fillStyle = sky; ctx.fillRect(-12, -12, 664, 384);
                        [[480, 80, 260, zone.neb[0]], [160, 220, 220, zone.neb[1]]].forEach(([x, y, r, c]) => {
                            const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)');
                            ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
                        });
                        far.forEach(s => { s.x -= speed * 0.04 * dt; if (s.x < -2) s.x = 642; ctx.globalAlpha = 0.45; ctx.fillStyle = '#c7d2fe'; ctx.fillRect(s.x, s.y, s.size * 0.8, s.size * 0.8); });
                        planetIn -= ms;
                        if (planetIn <= 0) { const np = makePlanet(0); np.x = 640 + np.r * 1.8; planets.push(np); planetIn = rand(7000, 11000); }
                        planets.forEach(pl => { pl.x -= speed * 0.07 * dt; drawPlanet(ctx, pl); });
                        for (let i = planets.length - 1; i >= 0; i--) if (planets[i].x < -planets[i].r * 2) planets.splice(i, 1);
                        near.forEach(s => {
                            s.x -= speed * 0.16 * dt; if (s.x < -30) { s.x = 660; s.y = Math.random() * 280; }
                            ctx.globalAlpha = 0.8; ctx.fillStyle = '#e0f2fe';
                            if (boosting) ctx.fillRect(s.x, s.y, 26, 1.4); else ctx.fillRect(s.x, s.y, s.size, s.size);
                        });
                        ctx.globalAlpha = 1;

                        // Level spawner: barriers, drones and (from Zone 2) tall barriers and track gaps
                        spawn -= ms; orbSpawn -= ms;
                        if (spawn <= 0) {
                            const r = Math.random();
                            if (q >= 1 && r < 0.17) gaps.push({ x: 660, w: 70 + q * 10 });
                            else if (r < 0.17 + 0.22 + q * 0.03) things.push({ type: 'drone', x: 660, baseY: GROUND - rand(105, 135), y: 0, w: 36, h: 22, phase: Math.random() * 6 });
                            else {
                                const tall = q >= 1 && Math.random() < 0.25 + q * 0.04;
                                const h = tall ? rand(74, 88) : rand(34, 52);
                                things.push({ type: 'barrier', x: 660, y: GROUND - h, w: 26, h });
                            }
                            spawn = (rand(950, 1450) - q * 70) / (boosting ? 1.4 : 1);
                        }
                        if (orbSpawn <= 0) {
                            if (Math.random() < 0.12) things.push({ type: 'chip', x: 660, y: GROUND - rand(150, 185), w: 20, h: 20 });
                            else {
                                const n = 3 + Math.floor(Math.random() * 3), baseY = GROUND - rand(40, 110), arc = Math.random() < 0.5;
                                for (let i = 0; i < n; i++) things.push({ type: 'orb', x: 660 + i * 26, y: baseY - (arc ? Math.sin(i / (n - 1) * Math.PI) * 40 : 0), w: 16, h: 16 });
                            }
                            orbSpawn = rand(900, 1500);
                        }

                        // Physics: Scrappy only lands where there is track under him
                        gaps.forEach(g => { g.x -= speed * dt; });
                        gaps = gaps.filter(g => g.x + g.w > -40);
                        drawTrack(ctx, zone, GROUND, scroll, gaps, t, boosting);
                        const prevY = p.y;
                        p.vy += 0.62 * dt; p.y += p.vy * dt;
                        const footX = p.x + p.w / 2;
                        const overGap = gaps.some(g => !g.bridged && footX > g.x + 4 && footX < g.x + g.w - 4);
                        // Swept check: lands if the feet crossed the track this frame, so slow frames cannot tunnel through it
                        if (!overGap && prevY <= GROUND - p.h + 1 && p.y >= GROUND - p.h) { p.y = GROUND - p.h; p.vy = 0; p.jumps = 0; }
                        if (p.y > 380) {
                            // Fell through a gap: a rescue bridge catches Scrappy
                            FX.sample('fall');
                            gaps.forEach(g => { if (footX > g.x - 30 && footX < g.x + g.w + 30) g.bridged = true; });
                            p.y = GROUND - p.h - 70; p.vy = -4; p.jumps = 1;
                            crash('FELL', 150);
                        }

                        things.forEach(o => {
                            o.x -= speed * dt;
                            if (o.type === 'orb' || o.type === 'chip') {
                                if (magnetRange) {
                                    const dx = p.x + 13 - o.x, dy = p.y + 20 - o.y;
                                    if (Math.hypot(dx, dy) < magnetRange) { o.x += dx * 0.1 * dt; o.y += dy * 0.1 * dt; }
                                }
                                if (o.type === 'orb') drawOrb(ctx, o, t); else drawChip(ctx, o, t);
                                if (overlap(p, o)) {
                                    o.gone = true;
                                    const pts = Math.round((o.type === 'chip' ? 80 : 25) * scoreMult() * chain.hit());
                                    S.score += pts;
                                    if (o.type === 'chip') { chips++; earn(15); juice.text(o.x, o.y - 12, '+15 💰', '#fde68a'); }
                                    else { orbs++; earn(2); juice.text(o.x, o.y - 8, `+${pts}`, '#6ee7b7'); }
                                    juice.burst(o.x + 8, o.y + 8, o.type === 'chip' ? '#fbbf24' : '#34d399', 8);
                                    FX.sample('orb');
                                }
                                return;
                            }
                            if (o.type === 'drone') { o.y = o.baseY + Math.sin(t / 380 + o.phase) * 16; drawDrone(ctx, o, t); }
                            else drawBarrier(ctx, o, t);
                            bolts.forEach(b => {
                                if (!b.used && b.x + 16 > o.x && b.x < o.x + o.w && b.y > o.y - 6 && b.y < o.y + o.h + 6) {
                                    b.used = true; o.gone = true; blasted++;
                                    S.score += Math.round(40 * scoreMult());
                                    juice.burst(o.x + o.w / 2, o.y + o.h / 2, '#f43f5e', 22); juice.text(o.x, o.y - 10, `+${Math.round(40 * scoreMult())}`, '#fda4af');
                                    FX.sample('crash');
                                }
                            });
                            if (!o.gone && overlap({ x: p.x + 3, y: p.y + 6, w: p.w - 6, h: p.h - 8 }, o)) {
                                o.gone = true;
                                if (boosting) {
                                    smashed++; S.score += Math.round(60 * scoreMult());
                                    juice.burst(o.x + o.w / 2, o.y + o.h / 2, '#fbbf24', 26); juice.shake(8); FX.play('hit');
                                } else if (safe <= 0) crash('CRASH', 120);
                            }
                        });
                        things = things.filter(o => !o.gone && o.x > -50);

                        bolts.forEach(b => { b.x += 14 * dt; drawBolt(ctx, b.x, b.y); });
                        for (let i = bolts.length - 1; i >= 0; i--) if (bolts[i].used || bolts[i].x > 660) bolts.splice(i, 1);

                        // Thruster trail
                        trail.push({ x: p.x - 10, y: p.y + p.h - 2, life: 1 });
                        trail.forEach(s => { s.x -= speed * 0.9 * dt; s.life -= 0.05 * dt; });
                        while (trail.length && trail[0].life <= 0) trail.shift();
                        trail.forEach(s => { ctx.globalAlpha = Math.max(0, s.life) * 0.6; ctx.fillStyle = boosting ? '#fbbf24' : zone.glow; ctx.fillRect(s.x, s.y, 4, 3); });
                        ctx.globalAlpha = 1;

                        const airborne = p.vy !== 0;
                        drawScrappyRider(ctx, p, t, {
                            lean: boosting ? 0.12 : airborne ? clamp(p.vy * -0.02, -0.25, 0.25) : 0.05,
                            airborne, nitro: boosting, glow: zone.track,
                            mood: worried > 0 ? 'worried' : boosting ? 'focus' : 'happy',
                            blink: safe > 0 && Math.floor(safe / 90) % 2 === 0
                        });
                        if (shields > 0) {
                            ctx.save(); ctx.strokeStyle = 'rgba(103,232,249,.55)'; ctx.lineWidth = 2; ctx.shadowColor = '#67e8f9'; ctx.shadowBlur = 10;
                            ctx.beginPath(); ctx.arc(p.x + 13, p.y + 22, 34 + Math.sin(t / 200) * 1.5, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
                        }
                        if (chain.count >= 3) { ctx.font = '800 15px Orbitron, sans-serif'; ctx.fillStyle = '#fbbf24'; ctx.fillText(`ORB CHAIN x${chain.count}`, 470, 24); }
                        api.hud(`${Math.round(T.meters)} m · 🛡️${shields} · 🔥${T.nitro} · ${T.credits} 💰`);
                    },
                    summary: () => [`Distance: <strong>${Math.round(T.meters)} m</strong>`, `Data orbs: <strong>${orbs}</strong>`, `Credit chips: <strong>${chips}</strong>`, `Blasted: <strong>${blasted}</strong>`, `Smashed with Nitro: <strong>${smashed}</strong>`, `Crashes: <strong>${crashes}</strong>`, `Credits left: <strong>${T.credits} 💰</strong>`]
                };
            }
        });
    }

    return {
        status: () => `${Math.round(T.meters)} m · ${T.credits} 💰`,
        round(ok, next) {
            const gain = ok ? 100 + (S.combo.streak - 1) * 25 : 0;
            T.credits += gain;
            garage(gain, () => zoneRun(next));
        }
    };
};

// ---- 3. SKY CLIMB -------------------------------------------------------------
// One continuous climb across all five rounds: Earth -> Sky Castle -> Stratosphere ->
// Orbit Station -> The Moon -> Alien Civilization -> the AI Data Center that runs the site.
// Scrappy bounces on spring boots automatically; the player steers. Altitude carries over.
const CLIMB_BIOME_H = 2200;                              // world pixels per zone (10 px = 1 m)
const CLIMB_BIOMES = [
    { name: 'Earth City', sky: ['#4cb8f5', '#bfe9ff'], plat: 'girder', g: 0.45, v: 11.5, gap: [70, 104], move: 0.08, crumble: 0, spring: 0.07, hazard: null, rate: 0 },
    { name: 'Sky Castle', sky: ['#f59e0b', '#fde2b8'], plat: 'stone', g: 0.45, v: 11.5, gap: [80, 112], move: 0.12, crumble: 0.16, spring: 0.07, hazard: null, rate: 0 },
    { name: 'Stratosphere', sky: ['#1e3a8a', '#3b82f6'], plat: 'hover', g: 0.45, v: 11.5, gap: [86, 118], move: 0.2, crumble: 0.12, spring: 0.07, hazard: 'meteor', rate: 0.22 },
    { name: 'Orbit Station', sky: ['#020617', '#0f1b3d'], plat: 'panel', g: 0.45, v: 11.5, gap: [90, 120], move: 0.3, crumble: 0.12, spring: 0.08, hazard: 'meteor', rate: 0.35 },
    { name: 'The Moon', sky: ['#000000', '#1f2937'], plat: 'rock', g: 0.3, v: 10, gap: [100, 145], move: 0.2, crumble: 0.16, spring: 0.05, hazard: 'meteor', rate: 0.45 },
    { name: 'Alien Civilization', sky: ['#2e0249', '#6b21a8'], plat: 'crystal', g: 0.45, v: 11.5, gap: [94, 124], move: 0.36, crumble: 0.2, spring: 0.07, hazard: 'drone', rate: 0.5 },
    { name: 'AI Data Center', sky: ['#020617', '#052e1c'], plat: 'server', g: 0.45, v: 11.5, gap: [102, 130], move: 0.38, crumble: 0.34, spring: 0.05, hazard: 'datacenter', rate: 0.7 }
];
const CLIMB_CORE = CLIMB_BIOME_H * CLIMB_BIOMES.length;  // altitude (px) of the AI Core
const biomeIndex = worldY => clamp(Math.floor(-worldY / CLIMB_BIOME_H), 0, CLIMB_BIOMES.length - 1);
const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mixHex = (a, b, f) => { const A = hexRgb(a), B = hexRgb(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * f)).join(',')})`; };

// Sky blends into the next zone over the last quarter of each zone
function climbSky(ctx, camY, t, stars) {
    const pos = -camY / CLIMB_BIOME_H, i = clamp(Math.floor(pos), 0, CLIMB_BIOMES.length - 1);
    const next = CLIMB_BIOMES[Math.min(i + 1, CLIMB_BIOMES.length - 1)], cur = CLIMB_BIOMES[i];
    const f = clamp((pos - i - 0.75) / 0.25, 0, 1);
    const g = ctx.createLinearGradient(0, 0, 0, 360);
    g.addColorStop(0, mixHex(cur.sky[0], next.sky[0], f)); g.addColorStop(1, mixHex(cur.sky[1], next.sky[1], f));
    ctx.fillStyle = g; ctx.fillRect(-12, -12, 664, 384);
    const starA = clamp((pos - 1.7) / 1.2, 0, 1);
    if (starA > 0) stars.forEach(s => {
        const y = ((s.y - camY * 0.05) % 360 + 360) % 360;
        ctx.globalAlpha = starA * (0.4 + 0.4 * Math.sin(t / 500 + s.tw)); ctx.fillStyle = '#e0f2fe'; ctx.fillRect(s.x, y, s.size, s.size);
    });
    ctx.globalAlpha = 1;
    return { i, f };
}

// Background scenery for each zone (silhouettes with gentle parallax)
function climbScenery(ctx, camY, t, biome) {
    const alt = -camY;
    const rep = (period, speed) => ((alt * speed) % period + period) % period;
    ctx.save();
    if (biome === 0) {
        const base = 360 + (alt - 252) * 0.4;                 // skyline sinks as Scrappy climbs
        if (base < 520) {
            ctx.fillStyle = 'rgba(30,58,95,.55)';
            for (let i = 0; i < 14; i++) { const w = 38 + (i * 23) % 30, h = 70 + (i * 53) % 120; ctx.fillRect(i * 48 - 10, base - h, w, h + 200); }
            ctx.fillStyle = 'rgba(254,240,138,.55)';
            for (let i = 0; i < 14; i++) for (let k = 0; k < 4; k++) if ((i * 7 + k * 3) % 5 < 2) ctx.fillRect(i * 48 + 2 + (k % 2) * 14, base - 50 - k * 18, 6, 8);
        }
        ctx.fillStyle = 'rgba(255,255,255,.7)';
        for (let i = 0; i < 4; i++) { const y = (i * 140 + rep(560, 0.25)) % 560 - 100, x = (i * 190 + t * 0.01) % 760 - 60; ctx.beginPath(); ctx.ellipse(x, y, 40, 12, 0, 0, Math.PI * 2); ctx.ellipse(x + 26, y - 6, 26, 12, 0, 0, Math.PI * 2); ctx.fill(); }
    } else if (biome === 1) {
        // Floating castle on a cloud island
        const cy = 220 + ((alt - CLIMB_BIOME_H * 1.5) * 0.3);
        ctx.fillStyle = 'rgba(124,45,18,.35)';
        [[430, 70, 26], [470, 110, 34], [520, 85, 26], [555, 60, 20]].forEach(([x, h, w]) => {
            ctx.fillRect(x, cy - h, w, h);
            for (let k = 0; k < w; k += 8) ctx.fillRect(x + k, cy - h - 6, 5, 6);
            ctx.beginPath(); ctx.moveTo(x - 3, cy - h - 6); ctx.lineTo(x + w / 2, cy - h - 30); ctx.lineTo(x + w + 3, cy - h - 6); ctx.fill();
        });
        ctx.fillStyle = 'rgba(255,255,255,.65)';
        ctx.beginPath(); ctx.ellipse(495, cy + 6, 110, 20, 0, 0, Math.PI * 2); ctx.fill();
        for (let i = 0; i < 5; i++) { const y = (i * 120 + rep(600, 0.3)) % 600 - 100, x = (i * 150 + 40) % 640; ctx.beginPath(); ctx.ellipse(x, y, 50, 14, 0, 0, Math.PI * 2); ctx.ellipse(x + 30, y - 8, 30, 14, 0, 0, Math.PI * 2); ctx.fill(); }
    } else if (biome === 2) {
        // Aurora ribbons
        ['rgba(74,222,128,.22)', 'rgba(56,189,248,.18)', 'rgba(192,132,252,.16)'].forEach((c, k) => {
            ctx.strokeStyle = c; ctx.lineWidth = 18 - k * 4; ctx.beginPath();
            for (let x = -10; x <= 650; x += 20) { const y = 80 + k * 50 + Math.sin(x / 90 + t / 1600 + k) * 24 + rep(360, 0.08) * 0.2; x === -10 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
            ctx.stroke();
        });
    } else if (biome === 3) {
        // Curve of the Earth far below
        const cy = 560 + (alt - CLIMB_BIOME_H * 3) * 0.12;
        const g = ctx.createRadialGradient(320, cy, 300, 320, cy, 520);
        g.addColorStop(0, '#1d4ed8'); g.addColorStop(0.9, '#38bdf8'); g.addColorStop(1, 'rgba(56,189,248,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(320, cy, 520, 0, Math.PI * 2); ctx.fill();
    } else if (biome === 4) {
        // Earth hanging in the black sky
        const g = ctx.createRadialGradient(512, 70, 4, 520, 76, 34);
        g.addColorStop(0, '#93c5fd'); g.addColorStop(0.6, '#2563eb'); g.addColorStop(1, '#1e3a8a');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(520, 76, 30, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(74,222,128,.7)'; ctx.beginPath(); ctx.ellipse(512, 70, 10, 6, 0.5, 0, Math.PI * 2); ctx.fill();
    } else if (biome === 5) {
        // Alien spires with glowing domes, and two moons
        ctx.fillStyle = 'rgba(251,191,36,.5)'; ctx.beginPath(); ctx.arc(110, 60, 18, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(244,114,182,.45)'; ctx.beginPath(); ctx.arc(150, 90, 10, 0, Math.PI * 2); ctx.fill();
        const off = rep(300, 0.25);
        for (let i = 0; i < 6; i++) {
            const x = i * 115 + 20, top = 150 + (i * 37) % 80 + off * 0.3;
            ctx.fillStyle = 'rgba(30,7,60,.75)'; ctx.beginPath(); ctx.moveTo(x - 14, 380); ctx.lineTo(x - 6, top); ctx.lineTo(x + 6, top); ctx.lineTo(x + 14, 380); ctx.fill();
            ctx.fillStyle = i % 2 ? 'rgba(45,212,191,.7)' : 'rgba(232,121,249,.7)'; ctx.beginPath(); ctx.arc(x, top - 4, 9, Math.PI, 0); ctx.fill();
        }
    } else {
        // Server racks with blinking status lights
        const off = rep(120, 0.3);
        [[8, 70], [562, 70]].forEach(([x, w]) => {
            for (let y = -120 + off; y < 380; y += 120) {
                ctx.fillStyle = 'rgba(15,23,42,.9)'; ctx.fillRect(x, y, w, 112);
                ctx.strokeStyle = 'rgba(52,211,153,.25)'; ctx.strokeRect(x, y, w, 112);
                for (let k = 0; k < 6; k++) {
                    ctx.fillStyle = 'rgba(30,41,59,.9)'; ctx.fillRect(x + 6, y + 8 + k * 17, w - 12, 12);
                    ctx.fillStyle = Math.floor(t / 250 + k + y) % 3 ? '#22c55e' : '#064e3b'; ctx.fillRect(x + w - 16, y + 12 + k * 17, 4, 4);
                }
            }
        });
        ctx.strokeStyle = 'rgba(52,211,153,.08)'; ctx.lineWidth = 1;
        for (let x = 0; x < 640; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 360); ctx.stroke(); }
    }
    ctx.restore();
}

// One platform, drawn in the style of its zone
function drawClimbPlatform(ctx, pl, sy, t) {
    const { x, w } = pl, h = 12, style = CLIMB_BIOMES[pl.biome].plat;
    ctx.save();
    if (pl.type === 'crumble') {
        // Weak platforms: clouds in the sky, corrupted blocks in the data center, cracked rock elsewhere
        const shake = pl.hit ? Math.sin(t / 20) * 1.5 : 0;
        if (style === 'stone' || style === 'girder' || style === 'hover') {
            ctx.fillStyle = 'rgba(255,255,255,.92)';
            ctx.beginPath(); ctx.ellipse(x + w * 0.3 + shake, sy + 6, w * 0.32, 8, 0, 0, Math.PI * 2); ctx.ellipse(x + w * 0.65 + shake, sy + 5, w * 0.36, 9, 0, 0, Math.PI * 2); ctx.fill();
        } else if (style === 'server') {
            ctx.fillStyle = '#450a0a'; ctx.fillRect(x + shake, sy, w, h);
            for (let k = 0; k < w; k += 7) { ctx.fillStyle = (k + Math.floor(t / 80)) % 3 ? '#ef4444' : '#7f1d1d'; ctx.fillRect(x + k + shake, sy + 3 + (k % 3), 4, 3); }
        } else {
            // Space zones: a faded, cracked copy of the zone's own platform
            ctx.globalAlpha = 0.55;
            drawClimbPlatform(ctx, { ...pl, type: 'normal' }, sy, t);
            ctx.globalAlpha = 1;
            ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 1.2; ctx.beginPath();
            ctx.moveTo(x + w * 0.3, sy); ctx.lineTo(x + w * 0.38, sy + 6); ctx.lineTo(x + w * 0.33, sy + h);
            ctx.moveTo(x + w * 0.68, sy); ctx.lineTo(x + w * 0.62, sy + 7); ctx.lineTo(x + w * 0.7, sy + h); ctx.stroke();
        }
        ctx.restore();
        return;
    }
    const fills = {
        girder: ['#ea580c', '#7c2d12'], stone: ['#a8a29e', '#57534e'], hover: ['#93c5fd', '#1e3a8a'],
        panel: ['#1d4ed8', '#0f172a'], rock: ['#9ca3af', '#4b5563'], crystal: ['#e879f9', '#581c87'], server: ['#1e293b', '#020617']
    }[style];
    const g = ctx.createLinearGradient(0, sy, 0, sy + h);
    g.addColorStop(0, fills[0]); g.addColorStop(1, fills[1]);
    ctx.fillStyle = g; roundRect(ctx, x, sy, w, h, style === 'stone' || style === 'girder' ? 2 : 5); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = 1; ctx.stroke();
    if (style === 'girder') { ctx.fillStyle = '#fdba74'; for (let k = 6; k < w - 3; k += 12) { ctx.beginPath(); ctx.arc(x + k, sy + 6, 1.4, 0, Math.PI * 2); ctx.fill(); } }
    if (style === 'stone') { ctx.fillStyle = '#78716c'; for (let k = 0; k < w; k += 12) ctx.fillRect(x + k, sy - 4, 7, 4); }
    if (style === 'panel') { ctx.strokeStyle = 'rgba(147,197,253,.5)'; for (let k = 8; k < w; k += 10) { ctx.beginPath(); ctx.moveTo(x + k, sy + 2); ctx.lineTo(x + k, sy + h - 2); ctx.stroke(); } }
    if (style === 'rock') { ctx.fillStyle = 'rgba(31,41,55,.6)'; ctx.beginPath(); ctx.arc(x + w * 0.3, sy + 6, 2.5, 0, Math.PI * 2); ctx.arc(x + w * 0.7, sy + 5, 1.8, 0, Math.PI * 2); ctx.fill(); }
    if (style === 'hover' || style === 'crystal' || style === 'server') {
        ctx.shadowColor = style === 'server' ? '#22c55e' : style === 'crystal' ? '#e879f9' : '#60a5fa'; ctx.shadowBlur = 10;
        ctx.fillStyle = ctx.shadowColor; ctx.fillRect(x + 4, sy + h - 2, w - 8, 2);
        if (style === 'server') for (let k = 8; k < w - 4; k += 9) { ctx.fillStyle = Math.floor(t / 300 + k) % 2 ? '#4ade80' : '#14532d'; ctx.fillRect(x + k, sy + 4, 3, 3); }
    }
    if (pl.type === 'move') { ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(x + 3, sy + 4, 3, 4); ctx.fillRect(x + w - 6, sy + 4, 3, 4); }
    if (pl.type === 'spring') {
        ctx.shadowBlur = 0;
        const cx = x + w / 2, sq = pl.boing > 0 ? 4 : 0;
        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2; ctx.beginPath();
        for (let k = 0; k < 4; k++) { ctx.moveTo(cx - 7, sy - 2 - k * (3 - sq * 0.25)); ctx.lineTo(cx + 7, sy - 3.5 - k * (3 - sq * 0.25)); }
        ctx.stroke();
        ctx.fillStyle = '#facc15'; ctx.shadowColor = '#facc15'; ctx.shadowBlur = 10; ctx.fillRect(cx - 10, sy - 15 + sq, 20, 4);
    }
    ctx.restore();
}

// Scrappy with spring boots: arms up while rising, jet flame while the jetpack fires
function drawScrappyClimber(ctx, p, sy, t, { facing = 1, mood = 'happy', jet = false, blink = false }) {
    if (blink) return;
    const cx = p.x + p.w / 2, feet = sy + p.h;
    ctx.save();
    ctx.translate(cx, feet); ctx.scale(1.1 * facing, 1.1); ctx.translate(-cx, -feet);
    if (jet) {
        ctx.save(); ctx.shadowColor = '#fb923c'; ctx.shadowBlur = 16; ctx.fillStyle = '#fbbf24';
        const fl = 14 + Math.random() * 10;
        ctx.beginPath(); ctx.moveTo(cx - 10, feet - 18); ctx.lineTo(cx - 6, feet - 18 + fl); ctx.lineTo(cx - 2, feet - 18); ctx.fill(); ctx.restore();
        ctx.fillStyle = '#475569'; roundRect(ctx, cx - 13, feet - 30, 8, 14, 3); ctx.fill();
    }
    // Spring boots
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5;
    [-5, 5].forEach(dx => { ctx.beginPath(); for (let k = 0; k < 3; k++) { ctx.moveTo(cx + dx - 3, feet - 2 - k * 2.5); ctx.lineTo(cx + dx + 3, feet - 3 - k * 2.5); } ctx.stroke(); });
    ctx.fillStyle = '#1d4ed8'; [-5, 5].forEach(dx => { roundRect(ctx, cx + dx - 4, feet - 11, 8, 4, 2); ctx.fill(); });
    // Body
    const bodyY = feet - 18;
    ctx.fillStyle = '#f1f5f9'; ctx.strokeStyle = '#0b1020'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(cx, bodyY, 9, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.ellipse(cx, bodyY, 9, 8, 0, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = '#3b82f6'; ctx.fillRect(cx - 10, bodyY - 9, 20, 7); ctx.restore();
    ctx.fillStyle = '#67e8f9'; ctx.beginPath(); ctx.arc(cx, bodyY - 3, 2, 0, Math.PI * 2); ctx.fill();
    // Arms reach up while rising
    const up = p.vy < 0;
    [[-1], [1]].forEach(([s]) => {
        const ex = cx + s * (up ? 12 : 15), ey = bodyY + (up ? -14 : 2);
        ctx.strokeStyle = '#0b1020'; ctx.lineWidth = 5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(cx + s * 7, bodyY - 3); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.strokeStyle = '#60a5fa'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx + s * 7, bodyY - 3); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex, ey, 2.6, 0, Math.PI * 2); ctx.fill();
    });
    drawScrappyHead(ctx, cx + 1, feet - 37, mood);
    ctx.restore();
}

// The AI Core at the very top: a reactor sphere wrapped in data rings
function drawAICore(ctx, sy, t) {
    ctx.save();
    const cy = sy - 70;
    const halo = ctx.createRadialGradient(320, cy, 10, 320, cy, 140);
    halo.addColorStop(0, 'rgba(52,211,153,.55)'); halo.addColorStop(1, 'rgba(52,211,153,0)');
    ctx.fillStyle = halo; ctx.fillRect(180, cy - 140, 280, 280);
    for (let k = 0; k < 3; k++) {
        ctx.strokeStyle = `rgba(110,231,183,${0.6 - k * 0.15})`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(320, cy, 70 + k * 16, 18 + k * 5, t / (900 + k * 300) * (k % 2 ? -1 : 1), 0, Math.PI * 2); ctx.stroke();
    }
    const g = ctx.createRadialGradient(310, cy - 10, 4, 320, cy, 42);
    g.addColorStop(0, '#ecfdf5'); g.addColorStop(0.35, '#34d399'); g.addColorStop(1, '#064e3b');
    ctx.shadowColor = '#34d399'; ctx.shadowBlur = 30; ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(320, cy, 40, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0; ctx.fillStyle = '#022c22'; ctx.font = '800 13px Orbitron, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('AI CORE', 320, cy + 5);
    // The landing deck
    ctx.fillStyle = '#0f172a'; ctx.fillRect(40, sy, 560, 14);
    ctx.fillStyle = '#34d399'; ctx.shadowColor = '#34d399'; ctx.shadowBlur = 12; ctx.fillRect(40, sy, 560, 3);
    ctx.restore();
}

// Altitude meter on the right edge: one band per zone, a marker for Scrappy
function drawClimbMeter(ctx, alt, best) {
    const x = 622, top = 20, h = 320, total = CLIMB_CORE;
    CLIMB_BIOMES.forEach((b, i) => {
        const y0 = top + h - (i + 1) * h / CLIMB_BIOMES.length;
        ctx.fillStyle = b.sky[1]; ctx.globalAlpha = 0.7; ctx.fillRect(x, y0, 8, h / CLIMB_BIOMES.length - 1);
    });
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.strokeRect(x - 0.5, top - 0.5, 9, h + 1);
    const my = top + h - clamp(alt / total, 0, 1) * h, by = top + h - clamp(best / total, 0, 1) * h;
    ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.fillRect(x - 4, by - 1, 16, 2);
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(x - 3, my); ctx.lineTo(x - 10, my - 5); ctx.lineTo(x - 10, my + 5); ctx.fill();
    ctx.fillStyle = '#34d399'; ctx.beginPath(); ctx.arc(x + 4, top - 6, 4, 0, Math.PI * 2); ctx.fill();
}

const CLIMB_UPGRADES = [
    { k: 'boots', icon: '🦘', name: 'Spring Boots', desc: 'Each level bounces Scrappy about 15% higher', costs: [120, 240, 360] },
    { k: 'agility', icon: '⚡', name: 'Air Control', desc: 'Steer faster in mid-air (Lv 2 is very nimble)', costs: [100, 200] },
    { k: 'rescue', icon: '🛡️', name: 'Rescue Drone', desc: 'Catches 1 fall or blocks 1 hit per round, per level', costs: [120, 220, 340] },
    { k: 'magnet', icon: '🧲', name: 'Orb Magnet', desc: 'Pulls in orbs and chips (bigger range at Lv 2)', costs: [140, 260] },
    { k: 'xp', icon: '🎓', name: 'Double XP', desc: 'Doubles the XP you earn from this lesson', costs: [200] },
    { k: 'mult', icon: '🌟', name: '2x Score', desc: 'Doubles every point you score', costs: [180] }
];

ARCADE_LOGIC.climb = S => {
    const T = { credits: 0, jets: 0, startY: 0, best: 0, reached: 0, won: false, report: null, lv: { boots: 0, agility: 0, rescue: 0, magnet: 0, xp: 0, mult: 0 } };
    FX.preload(['bounce', 'doubleJump', 'orb', 'crash', 'nitro', 'shieldPop', 'fall', 'zone', 'shopBuy', 'crumble']);
    const scoreMult = () => (T.lv.mult ? 2 : 1) * S.combo.mult;
    const zoneNow = () => CLIMB_BIOMES[biomeIndex(T.startY - 1)];

    function gearLab(gain, start) {
        const maxed = u => T.lv[u.k] >= u.costs.length;
        const upBtn = u => {
            const lvl = T.lv[u.k], max = u.costs.length;
            return `<button type="button" class="shop-btn" data-up="${u.k}" ${maxed(u) ? 'disabled' : ''}>
                ${u.icon} ${u.name}${max > 1 ? ` <em>Lv ${lvl}/${max}</em>` : ''} ${maxed(u) ? '✅' : `(${u.costs[lvl]} 💰)`}<small>${u.desc}</small></button>`;
        };
        S.stage.innerHTML = `
            <div class="quiz-game-card">
                <h2 class="shop-title">🛠️ Climb Gear Lab</h2>
                ${gain ? `<p class="round-intro">✅ Correct! +${gain} credits${S.combo.streak > 1 ? ` (🔥 ${S.combo.streak} streak bonus)` : ''}</p>` : '<p class="round-intro">❌ No credits this time. Right answers (and data orbs) earn credits.</p>'}
                ${T.report ? `<p class="canvas-instructions">Last climb: ${T.report}</p>` : ''}
                <p class="shop-credits">Altitude: <strong class="credit-highlight">${Math.round(-T.startY / 10)} m</strong> (${T.won ? 'AI Core conquered!' : zoneNow().name}) · Credits: <strong class="credit-highlight">${T.credits} 💰</strong></p>
                <div class="armory-grid">${CLIMB_UPGRADES.map(upBtn).join('')}
                    <button type="button" class="shop-btn" data-jet ${T.jets >= 3 ? 'disabled' : ''}>🚀 Jetpack Burst <em>${T.jets}/3</em> (70 💰)<small>Press B: blast straight up for 1.5 seconds</small></button>
                </div>
                <button type="button" class="btn-continue-shop" data-start-climb>Start Climb ${S.q + 1} →</button>
            </div>`;
        const spend = cost => {
            if (T.credits < cost) { toast(`Not enough credits. You need ${cost} 💰.`, 'warn'); return false; }
            T.credits -= cost; FX.sample('shopBuy');
            return true;
        };
        $$('[data-up]', S.stage).forEach(b => b.onclick = () => {
            const u = CLIMB_UPGRADES.find(x => x.k === b.dataset.up);
            if (maxed(u) || !spend(u.costs[T.lv[u.k]])) return;
            T.lv[u.k]++;
            if (u.k === 'xp') S.xpMult = 2;
            toast(`${u.name} equipped!`, 'success');
            gearLab(gain, start);
        });
        $('[data-jet]', S.stage).onclick = () => { if (T.jets < 3 && spend(70)) { T.jets++; gearLab(gain, start); } };
        const go = $('[data-start-climb]', S.stage);
        go.onclick = start;
        setTimeout(() => { if (document.body.contains(go)) go.focus({ preventScroll: true }); }, 400);
    }

    function climb(next) {
        let orbs = 0, chips = 0, falls = 0, hits = 0;
        const bestAtStart = T.best;
        const startAlt = -T.startY;
        canvasRound(S, {
            title: '⛰️ Sky Climb', theme: 'theme-climb', seconds: 25, skipSummary: true,
            intro: T.won ? 'Victory lap above the AI Core! Every meter still scores.' : `Climb ${S.q + 1}: ${zoneNow().name} · ${Math.round(startAlt / 10)} m. Only one way to go: up!`,
            hint: 'Left / Right, A / D, or hold the mouse or finger on either side to steer · B: Jetpack',
            buttons: '<button type="button" class="game-btn" data-action="jet">🚀 Jetpack (B)</button>',
            onEnd: () => {
                T.report = `+${Math.round((T.best - bestAtStart) / 10)} m · ${orbs} orbs · ${chips} chips · ${falls} falls · ${hits} hits`;
                next();
            },
            setup(api) {
                const { ctx, juice, keys, pointer } = api;
                const stars = makeStars(80, 640, 360);
                const chain = createChain(2200);
                const p = { x: 309, y: T.startY - 34, w: 22, h: 34, vx: 0, vy: 0, facing: 1 };
                let camY = T.startY - 260, nextY = T.startY - 80, t = 0, safe = 0, jetMs = 0, worried = 0, banner = null;
                // Round 1 starts on the ground; later rounds start on a checkpoint pad at the highest landing so far
                let platforms = [T.startY === 0 ? { x: 0, y: 0, w: 640, biome: 0, type: 'ground' } : { x: 250, y: T.startY, w: 140, biome: biomeIndex(T.startY - 1), type: 'normal', rescue: true }];
                let pickups = [], hazards = [], hazardIn = 1500, lastLand = T.startY;
                let rescues = T.lv.rescue;
                const steer = [6, 7.5, 9][T.lv.agility], accel = [0.6, 0.85, 1.1][T.lv.agility];
                const magnetRange = [0, 120, 220][T.lv.magnet];

                function spawnPlatform(y) {
                    const bi = biomeIndex(y), b = CLIMB_BIOMES[bi];
                    const w = rand(62, 96) - bi * 3;
                    const r = Math.random();
                    const type = r < b.spring ? 'spring' : r < b.spring + b.crumble ? 'crumble' : r < b.spring + b.crumble + b.move ? 'move' : 'normal';
                    const pl = { x: rand(14, 606 - w), y, w, biome: bi, type, vx: type === 'move' ? rand(0.8, 1.4 + bi * 0.25) * (Math.random() < 0.5 ? -1 : 1) : 0 };
                    platforms.push(pl);
                    if (Math.random() < 0.3) pickups.push({ x: pl.x + pl.w / 2 - 8, y: y - rand(30, 70), w: 16, h: 16, type: Math.random() < 0.08 ? 'chip' : 'orb' });
                    // Data center lasers sit between platforms
                    if (b.hazard === 'datacenter' && Math.random() < 0.18) hazards.push({ type: 'laser', y: y - 50, phase: Math.random() * 2400 });
                    if ((b.hazard === 'drone' || b.hazard === 'datacenter') && Math.random() < 0.12) hazards.push({ type: 'drone', x: rand(40, 560), y: y - 60, w: 30, h: 18, vx: rand(1.4, 2.4) * (Math.random() < 0.5 ? -1 : 1) });
                }
                const knock = (msg, penalty) => {
                    if (safe > 0) return;
                    safe = 1100; worried = 900; chain.reset();
                    if (rescues > 0) { rescues--; FX.sample('shieldPop'); juice.text(p.x + 40, p.y - camY - 10, 'BLOCKED!', '#67e8f9'); juice.burst(p.x + 11, p.y - camY + 15, '#67e8f9', 20); return; }
                    hits++; S.score = Math.max(0, S.score - penalty); p.vy = Math.max(p.vy, 4);
                    FX.sample('crash'); juice.shake(12); juice.burst(p.x + 11, p.y - camY + 15, '#ef4444', 22);
                    juice.text(p.x + 40, p.y - camY - 10, `${msg} -${penalty}`, '#f87171');
                };
                const jet = () => {
                    if (!T.jets || jetMs > 0) return;
                    T.jets--; jetMs = 1500; FX.sample('nitro'); FX.flash('rgba(251,146,60,.2)');
                };

                return {
                    key(code) { if (code === 'KeyB') jet(); },
                    action(a) { if (a === 'jet') jet(); },
                    frame(dt, ms) {
                        chain.tick(ms);
                        t += ms; safe -= ms; jetMs -= ms; worried -= ms;
                        const bi = biomeIndex(p.y), biome = CLIMB_BIOMES[bi];

                        // Steering: keyboard, or hold the pointer on a side of Scrappy
                        let dir = (keys.ArrowLeft || keys.KeyA ? -1 : 0) + (keys.ArrowRight || keys.KeyD ? 1 : 0);
                        if (!dir && pointer.down) dir = pointer.x < p.x + p.w / 2 - 8 ? -1 : pointer.x > p.x + p.w / 2 + 8 ? 1 : 0;
                        p.vx += (dir * steer - p.vx) * Math.min(1, accel * 0.35 * dt);
                        if (dir) p.facing = dir;
                        p.x += p.vx * dt;
                        if (p.x > 640) p.x -= 660; if (p.x < -20) p.x += 660;          // wrap around the screen edges

                        const prevY = p.y;
                        if (jetMs > 0) { p.vy = -9; juice.burst(p.x + 11, p.y - camY + p.h, '#fbbf24', 2); }
                        else p.vy += biome.g * dt;
                        p.y += p.vy * dt;

                        // Generate the world above the camera
                        while (nextY > camY - 420) {
                            const b = CLIMB_BIOMES[biomeIndex(nextY)];
                            spawnPlatform(nextY);
                            nextY -= rand(b.gap[0], b.gap[1]);
                        }

                        // Platforms: land only while falling and only if the feet crossed the top this frame
                        platforms.forEach(pl => {
                            if (pl.type === 'move') { pl.x += pl.vx * dt; if (pl.x < 6 || pl.x + pl.w > 614) pl.vx *= -1; }
                            if (pl.gone || p.vy <= 0) return;
                            const feetPrev = prevY + p.h, feet = p.y + p.h;
                            const onX = pl.type === 'ground' || (p.x + p.w - 4 > pl.x && p.x + 4 < pl.x + pl.w);
                            if (onX && feetPrev <= pl.y + 1 && feet >= pl.y) {
                                p.y = pl.y - p.h;
                                const v = biome.v * (1 + T.lv.boots * 0.075);
                                if (pl.type === 'spring') { p.vy = -v * 1.6; pl.boing = 200; FX.sample('doubleJump'); juice.burst(p.x + 11, pl.y - camY, '#facc15', 10); }
                                else { p.vy = -v; FX.sample('bounce'); }
                                if (pl.type === 'crumble') { pl.gone = true; FX.sample('crumble'); juice.burst(pl.x + pl.w / 2, pl.y - camY + 6, bi === 6 ? '#ef4444' : '#e2e8f0', 14); }
                                lastLand = pl.y;
                            }
                        });

                        // Camera only moves up; new heights score points
                        camY = Math.min(camY, p.y - 150);
                        if (-p.y > T.best) {
                            const gain = -p.y - T.best;
                            S.score += gain * 0.5 * scoreMult();
                            T.best = -p.y;
                        }
                        const reachedZone = biomeIndex(-T.best);
                        if (reachedZone > T.reached) {
                            T.reached = reachedZone;
                            const bonus = Math.round(300 * reachedZone * scoreMult());
                            S.score += bonus; FX.sample('zone');
                            banner = { text: CLIMB_BIOMES[reachedZone].name.toUpperCase(), sub: `New zone! +${bonus}`, ms: 2200 };
                        }
                        if (!T.won && T.best >= CLIMB_CORE) {
                            T.won = true;
                            const bonus = Math.round(5000 * scoreMult());
                            S.score += bonus; FX.play('win'); FX.flash('rgba(52,211,153,.35)'); juice.shake(10);
                            banner = { text: 'AI CORE REACHED!', sub: `You climbed to the top of the website! +${bonus}`, ms: 4000 };
                        }

                        // Falling below the screen: the Rescue Drone catches you, otherwise it costs points
                        if (p.y - camY > 380) {
                            falls++;
                            if (rescues > 0) { rescues--; FX.sample('shieldPop'); } else { S.score = Math.max(0, S.score - 200); FX.sample('fall'); juice.text(320, 300, 'FELL -200', '#f87171'); }
                            const save = { x: clamp(p.x - 40, 10, 530), y: camY + 330, w: 100, biome: bi, type: 'normal', rescue: true };
                            platforms.push(save);
                            p.y = save.y - p.h - 2; p.vy = -biome.v; safe = 900; worried = 900; chain.reset();
                        }

                        // Hazards: meteors from the stratosphere up, drones and lasers higher still
                        hazardIn -= ms;
                        if (biome.hazard === 'meteor' && hazardIn <= 0) {
                            hazards.push({ type: 'meteor', x: rand(40, 600), y: camY - 30, vx: rand(-1.6, 1.6), vy: rand(2.6, 3.8), r: rand(7, 11) });
                            hazardIn = 1000 / biome.rate * rand(0.7, 1.3);
                        }

                        // Draw: sky, scenery, the Core, platforms, pickups, hazards, Scrappy
                        const sky = climbSky(ctx, camY, t, stars);
                        climbScenery(ctx, camY, t, sky.f > 0.5 ? Math.min(sky.i + 1, 6) : sky.i);
                        const coreSy = -CLIMB_CORE - camY;
                        if (coreSy > -200 && coreSy < 560) drawAICore(ctx, coreSy, t);
                        platforms.forEach(pl => {
                            if (pl.boing) pl.boing -= ms;
                            const sy = pl.y - camY;
                            if (pl.gone || sy < -20 || sy > 380) return;
                            if (pl.type === 'ground') {
                                const g = ctx.createLinearGradient(0, sy, 0, sy + 40);
                                g.addColorStop(0, pl.biome ? '#334155' : '#16a34a'); g.addColorStop(1, '#0f172a');
                                ctx.fillStyle = g; ctx.fillRect(0, sy, 640, 60);
                            } else if (pl.rescue) {
                                ctx.save(); ctx.shadowColor = '#67e8f9'; ctx.shadowBlur = 14; ctx.fillStyle = 'rgba(103,232,249,.8)'; roundRect(ctx, pl.x, sy, pl.w, 8, 4); ctx.fill(); ctx.restore();
                            } else drawClimbPlatform(ctx, pl, sy, t);
                        });
                        platforms = platforms.filter(pl => !pl.gone && pl.y - camY < 420);

                        pickups.forEach(o => {
                            if (magnetRange) { const dx = p.x + 11 - o.x, dy = p.y + 15 - o.y; if (Math.hypot(dx, dy) < magnetRange) { o.x += dx * 0.12 * dt; o.y += dy * 0.12 * dt; } }
                            const draw = { ...o, y: o.y - camY };
                            if (o.type === 'orb') drawOrb(ctx, draw, t); else drawChip(ctx, draw, t);
                            if (overlap(p, o)) {
                                o.gone = true;
                                if (o.type === 'chip') { chips++; T.credits += 15; juice.text(o.x, o.y - camY - 10, '+15 💰', '#fde68a'); }
                                else { orbs++; T.credits += 2; const pts = Math.round(25 * scoreMult() * chain.hit()); S.score += pts; juice.text(o.x, o.y - camY - 8, `+${pts}`, '#6ee7b7'); }
                                juice.burst(o.x + 8, o.y - camY + 8, o.type === 'chip' ? '#fbbf24' : '#34d399', 8); FX.sample('orb');
                            }
                        });
                        pickups = pickups.filter(o => !o.gone && o.y - camY < 420);

                        hazards.forEach(h => {
                            if (h.type === 'meteor') {
                                h.x += h.vx * dt; h.y += h.vy * dt;
                                const sy = h.y - camY;
                                ctx.save(); ctx.strokeStyle = 'rgba(251,146,60,.5)'; ctx.lineWidth = h.r; ctx.lineCap = 'round';
                                ctx.beginPath(); ctx.moveTo(h.x - h.vx * 6, sy - h.vy * 6); ctx.lineTo(h.x, sy); ctx.stroke();
                                const g = ctx.createRadialGradient(h.x - 2, sy - 2, 1, h.x, sy, h.r);
                                g.addColorStop(0, '#d6d3d1'); g.addColorStop(1, '#44403c');
                                ctx.fillStyle = g; ctx.beginPath(); ctx.arc(h.x, sy, h.r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
                                if (Math.hypot(h.x - (p.x + 11), h.y - (p.y + 17)) < h.r + 12) { h.gone = true; knock('METEOR', 100); }
                                if (sy > 400) h.gone = true;
                            } else if (h.type === 'drone') {
                                h.x += h.vx * dt; if (h.x < 10 || h.x > 600) h.vx *= -1;
                                drawDrone(ctx, { x: h.x, y: h.y - camY, w: h.w, h: h.h }, t);
                                if (overlap(p, h)) knock('DRONE', 120);
                                if (h.y - camY > 420) h.gone = true;
                            } else {
                                // Firewall laser: warning line, then a live beam
                                const cyc = (t + h.phase) % 2400, sy = h.y - camY, live = cyc > 1300 && cyc < 2100;
                                if (sy > -10 && sy < 370) {
                                    ctx.save();
                                    if (live) { ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 14; ctx.fillStyle = '#fca5a5'; ctx.fillRect(0, sy - 2, 640, 4); }
                                    else if (cyc > 600) { ctx.strokeStyle = 'rgba(239,68,68,.55)'; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(640, sy); ctx.stroke(); }
                                    ctx.fillStyle = '#334155'; ctx.fillRect(0, sy - 6, 10, 12); ctx.fillRect(630, sy - 6, 10, 12);
                                    ctx.restore();
                                }
                                if (live && Math.abs(p.y + p.h / 2 - h.y) < p.h / 2 + 2) knock('FIREWALL', 150);
                                if (sy > 420) h.gone = true;
                            }
                        });
                        hazards = hazards.filter(h => !h.gone);

                        drawScrappyClimber(ctx, { ...p }, p.y - camY, t, {
                            facing: p.facing, jet: jetMs > 0,
                            mood: worried > 0 ? 'worried' : jetMs > 0 ? 'focus' : 'happy',
                            blink: safe > 0 && Math.floor(safe / 90) % 2 === 0
                        });
                        if (rescues > 0) {
                            ctx.save(); ctx.fillStyle = '#67e8f9'; ctx.shadowColor = '#67e8f9'; ctx.shadowBlur = 8;
                            const dx = p.x + 30 + Math.sin(t / 300) * 4, dy = p.y - camY - 18 + Math.cos(t / 260) * 3;
                            ctx.beginPath(); ctx.ellipse(dx, dy, 6, 3, 0, 0, Math.PI * 2); ctx.fill();
                            ctx.fillRect(dx - 8, dy - 4, 16, 1.5); ctx.restore();
                        }
                        drawClimbMeter(ctx, -p.y, T.best);
                        if (banner && (banner.ms -= ms) > 0) {
                            ctx.save(); ctx.globalAlpha = Math.min(1, banner.ms / 500); ctx.textAlign = 'center';
                            ctx.font = '800 26px Orbitron, sans-serif'; ctx.fillStyle = '#fff'; ctx.shadowColor = '#000'; ctx.shadowBlur = 8;
                            ctx.fillText(banner.text, 320, 70); ctx.font = '700 14px Inter, sans-serif'; ctx.fillStyle = '#fde68a'; ctx.fillText(banner.sub, 320, 94);
                            ctx.restore();
                        }
                        if (chain.count >= 3) { ctx.font = '800 15px Orbitron, sans-serif'; ctx.fillStyle = '#fbbf24'; ctx.textAlign = 'left'; ctx.fillText(`ORB CHAIN x${chain.count}`, 14, 24); }
                        api.hud(`${Math.round(-p.y / 10)} m · ${CLIMB_BIOMES[bi].name} · 🛡️${rescues} · 🚀${T.jets} · ${T.credits} 💰`);
                        T.startY = Math.min(lastLand, T.startY);
                    },
                    summary: () => [`Altitude: <strong>${Math.round(T.best / 10)} m</strong>${T.won ? ' (AI Core reached!)' : ''}`, `Highest zone: <strong>${CLIMB_BIOMES[T.reached].name}</strong>`, `Data orbs: <strong>${orbs}</strong>`, `Credit chips: <strong>${chips}</strong>`, `Falls: <strong>${falls}</strong> · Hits: <strong>${hits}</strong>`]
                };
            }
        });
    }

    return {
        status: () => `${Math.round(T.best / 10)} m · ${T.credits} 💰`,
        round(ok, next) {
            const gain = ok ? 100 + (S.combo.streak - 1) * 25 : 0;
            T.credits += gain;
            gearLab(gain, () => climb(next));
        }
    };
};

// ---- 4. BOSS BATTLE: TRUE GOD SCRAPPY ------------------------------------------
// Little Scrappy (just his head, wielding a blaster) dodges and auto-fires at True God Scrappy.
// Right answers fund the Blaster Workshop. The fight clock only runs during combat, and the
// leaderboard ranks the fastest defeat.
const BOSS_HP = 3000;
const BOSS_SCALE = 0.82;                              // the boss art is drawn at this size (hitboxes match)
const fmtFight = ms => { const s = ms / 1000; return `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, '0')}`; };

// One big floating hand: palm, four fingers and a blue cuff
function drawGodHand(ctx, x, y, s, flip, glow) {
    ctx.save(); ctx.translate(x, y); ctx.scale(flip ? -s : s, s);
    ctx.shadowColor = glow; ctx.shadowBlur = 18;
    ctx.fillStyle = '#1e3a8a'; roundRect(ctx, 18, -16, 22, 32, 8); ctx.fill();
    ctx.fillStyle = '#60a5fa'; ctx.fillRect(18, -16, 6, 32);
    const g = ctx.createLinearGradient(-30, -20, 20, 20);
    g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#c7d2fe');
    ctx.fillStyle = g; ctx.strokeStyle = '#1e1b4b'; ctx.lineWidth = 2;
    roundRect(ctx, -22, -20, 42, 40, 14); ctx.fill(); ctx.stroke();
    [[-20, -16], [-24, -5], [-24, 6], [-20, 16]].forEach(([fx, fy]) => { roundRect(ctx, fx - 18, fy - 5, 24, 10, 5); ctx.fill(); ctx.stroke(); });
    ctx.restore();
}

// True God Scrappy, after the portal's "True God Scrappy" avatar art
function drawGodScrappy(ctx, b, t) {
    const x = b.x, y = b.y + Math.sin(t / 700) * 6;
    const rage = b.phase === 3, gold = rage ? '#fb923c' : '#fbbf24';
    ctx.save();
    // Halos behind the head
    for (let k = 0; k < 3; k++) {
        ctx.save(); ctx.translate(x, y - 85); ctx.rotate(t / (1600 + k * 500) * (k % 2 ? -1 : 1) + k);
        ctx.strokeStyle = gold; ctx.globalAlpha = 0.8 - k * 0.2; ctx.lineWidth = 4 - k; ctx.shadowColor = gold; ctx.shadowBlur = 16;
        ctx.beginPath(); ctx.ellipse(0, 0, 92 + k * 22, 22 + k * 7, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    ctx.save(); ctx.fillStyle = '#fff7d6'; ctx.shadowColor = gold; ctx.shadowBlur = 20;
    ctx.beginPath(); ctx.moveTo(x, y - 175); ctx.lineTo(x + 6, y - 150); ctx.lineTo(x, y - 140); ctx.lineTo(x - 6, y - 150); ctx.fill(); ctx.restore();
    // Robe and gold armor
    const robe = ctx.createLinearGradient(x - 90, 0, x + 90, 0);
    robe.addColorStop(0, '#e0e7ff'); robe.addColorStop(0.5, '#ffffff'); robe.addColorStop(1, '#c7d2fe');
    ctx.fillStyle = robe; ctx.strokeStyle = '#1e1b4b'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x - 78, y - 20); ctx.quadraticCurveTo(x, y - 40, x + 78, y - 20); ctx.lineTo(x + 66, y + 170); ctx.lineTo(x - 66, y + 170); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = gold; ctx.lineWidth = 5; ctx.shadowColor = gold; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.moveTo(x - 70, y + 10); ctx.quadraticCurveTo(x, y + 50, x + 70, y + 10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 60, y + 90); ctx.quadraticCurveTo(x - 10, y + 130, x + 62, y + 80); ctx.stroke();
    ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 40, y + 40); ctx.lineTo(x - 52, y + 170); ctx.moveTo(x + 40, y + 40); ctx.lineTo(x + 52, y + 170); ctx.stroke();
    ctx.shadowBlur = 0;
    // Shoulder pauldrons
    [-1, 1].forEach(s => {
        const pg = ctx.createRadialGradient(x + s * 82, y - 22, 4, x + s * 82, y - 14, 40);
        pg.addColorStop(0, '#fff7d6'); pg.addColorStop(0.5, gold); pg.addColorStop(1, '#92400e');
        ctx.fillStyle = pg; ctx.beginPath(); ctx.ellipse(x + s * 80, y - 14, 40, 26, s * 0.35, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#78350f'; ctx.lineWidth = 2; ctx.stroke();
    });
    // Chest core
    const pulse = 0.8 + 0.2 * Math.sin(t / 180);
    ctx.save(); ctx.shadowColor = '#38bdf8'; ctx.shadowBlur = 30 * pulse;
    const cg = ctx.createRadialGradient(x, y + 40, 2, x, y + 40, 22);
    cg.addColorStop(0, '#ffffff'); cg.addColorStop(0.4, '#38bdf8'); cg.addColorStop(1, '#1e3a8a');
    ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(x, y + 40, 20, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.strokeStyle = gold; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y + 40, 24, 0, Math.PI * 2); ctx.stroke();
    // Neck
    ctx.fillStyle = '#1e293b'; ctx.fillRect(x - 22, y - 42, 44, 22);
    ctx.fillStyle = '#38bdf8'; ctx.fillRect(x - 12, y - 36, 24, 8);
    // Head: antennae, ear pods, white helmet, black visor, angry glowing eyes
    const hy = y - 92;
    ctx.fillStyle = '#3b82f6'; ctx.strokeStyle = '#1e1b4b'; ctx.lineWidth = 2;
    [[-46, -0.5], [46, 0.5]].forEach(([dx, r]) => { ctx.beginPath(); ctx.ellipse(x + dx, hy - 58, 11, 26, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
    [-1, 1].forEach(s => {
        ctx.fillStyle = '#e0e7ff'; ctx.beginPath(); ctx.ellipse(x + s * 72, hy, 16, 26, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#3b82f6'; ctx.beginPath(); ctx.ellipse(x + s * 76, hy, 8, 16, 0, 0, Math.PI * 2); ctx.fill();
    });
    const hg = ctx.createLinearGradient(0, hy - 55, 0, hy + 55);
    hg.addColorStop(0, '#ffffff'); hg.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = b.flash > 0 ? '#ffffff' : hg; ctx.strokeStyle = '#1e1b4b'; ctx.lineWidth = 3;
    roundRect(ctx, x - 68, hy - 55, 136, 110, 32); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#05060f'; roundRect(ctx, x - 52, hy - 36, 104, 74, 18); ctx.fill();
    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    [[-44, -28, 1, 1], [44, -28, -1, 1], [-44, 30, 1, -1], [44, 30, -1, -1]].forEach(([dx, dy, sx, sy]) => {
        ctx.beginPath(); ctx.moveTo(x + dx, hy + dy + sy * 9); ctx.lineTo(x + dx, hy + dy); ctx.lineTo(x + dx + sx * 9, hy + dy); ctx.stroke();
    });
    const eye = rage ? '#fda4af' : '#7dd3fc';
    ctx.save(); ctx.fillStyle = eye; ctx.shadowColor = rage ? '#f43f5e' : '#38bdf8'; ctx.shadowBlur = 18 + (b.eyeCharge || 0) * 30;
    [-1, 1].forEach(s => {
        ctx.beginPath();
        ctx.moveTo(x - s * 38, hy - 6); ctx.lineTo(x - s * 8, hy + 6);
        ctx.quadraticCurveTo(x - s * 12, hy + 20, x - s * 24, hy + 19);
        ctx.quadraticCurveTo(x - s * 38, hy + 16, x - s * 38, hy - 6);
        ctx.fill();
    });
    ctx.restore();
    if (b.flash > 0) { ctx.globalAlpha = 0.35; ctx.fillStyle = '#fff'; roundRect(ctx, x - 70, hy - 57, 140, 114, 32); ctx.fill(); ctx.globalAlpha = 1; }
    ctx.restore();
}

// Little Scrappy: just his head, holding a blaster
function drawLittleScrappy(ctx, p, t, { mood = 'happy', blink = false, over = false }) {
    if (blink) return;
    ctx.save();
    // Hover glow under the head
    ctx.globalAlpha = 0.35; ctx.fillStyle = '#67e8f9';
    ctx.beginPath(); ctx.ellipse(p.x, p.y + 22, 14, 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    ctx.translate(p.x, p.y); ctx.scale(1.25, 1.25); ctx.translate(-p.x, -p.y);
    // Blaster held out to the right
    ctx.fillStyle = '#334155'; ctx.strokeStyle = '#0b1020'; ctx.lineWidth = 1.5;
    roundRect(ctx, p.x + 10, p.y + 2, 26, 9, 3); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#64748b'; roundRect(ctx, p.x + 14, p.y + 10, 7, 9, 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = over ? '#f472b6' : '#22d3ee'; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 10;
    ctx.fillRect(p.x + 34, p.y + 3.5, 4, 6); ctx.fillRect(p.x + 22, p.y + 4, 8, 2);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x + 17, p.y + 13, 3.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    drawScrappyHead(ctx, p.x, p.y, mood);
    ctx.restore();
}

const BOSS_UPGRADES = [
    { k: 'power', icon: '💥', name: 'Plasma Core', desc: '+30% blaster damage per level', costs: [120, 240, 360] },
    { k: 'rate', icon: '⚡', name: 'Rapid Trigger', desc: 'Fires 25% faster per level', costs: [100, 200, 320] },
    { k: 'spread', icon: '✨', name: 'Spread Shot', desc: 'Lv 1: three-way shots · Lv 2: five-way', costs: [180, 340] },
    { k: 'jets', icon: '🚀', name: 'Hover Jets', desc: 'Move 20% faster per level', costs: [90, 180] },
    { k: 'shield', icon: '🛡️', name: 'Energy Shield', desc: 'Blocks 1 hit per fight, per level', costs: [120, 220, 340] },
    { k: 'xp', icon: '🎓', name: 'Double XP', desc: 'Doubles the XP you earn from this lesson', costs: [200] },
    { k: 'mult', icon: '🌟', name: '2x Score', desc: 'Doubles every point you score', costs: [180] }
];

ARCADE_LOGIC.boss = S => {
    const T = { credits: 0, bossHp: BOSS_HP, hp: 100, fightMs: 0, overcharge: 0, defeated: false, record: false, report: null, lv: { power: 0, rate: 0, spread: 0, jets: 0, shield: 0, xp: 0, mult: 0 } };
    FX.preload(['laser', 'bossHit', 'crash', 'shieldBlock', 'emp', 'coreBreach', 'shopBuy']);
    const scoreMult = () => (T.lv.mult ? 2 : 1) * S.combo.mult;

    function workshop(gain, start) {
        const maxed = u => T.lv[u.k] >= u.costs.length;
        const upBtn = u => {
            const lvl = T.lv[u.k], max = u.costs.length;
            return `<button type="button" class="shop-btn" data-up="${u.k}" ${maxed(u) ? 'disabled' : ''}>
                ${u.icon} ${u.name}${max > 1 ? ` <em>Lv ${lvl}/${max}</em>` : ''} ${maxed(u) ? '✅' : `(${u.costs[lvl]} 💰)`}<small>${u.desc}</small></button>`;
        };
        S.stage.innerHTML = `
            <div class="quiz-game-card">
                <h2 class="shop-title">🛠️ Blaster Workshop</h2>
                ${gain ? `<p class="round-intro">✅ Correct! +${gain} credits${S.combo.streak > 1 ? ` (🔥 ${S.combo.streak} streak bonus)` : ''}</p>` : '<p class="round-intro">❌ No credits this time. Right answers earn upgrade credits.</p>'}
                ${T.report ? `<p class="canvas-instructions">Last fight: ${T.report}</p>` : ''}
                <p class="shop-credits">Boss HP: <strong class="credit-highlight">${Math.ceil(T.bossHp / BOSS_HP * 100)}%</strong> · Fight time: <strong class="credit-highlight">${fmtFight(T.fightMs)}</strong> · Credits: <strong class="credit-highlight">${T.credits} 💰</strong></p>
                <div class="armory-grid">${BOSS_UPGRADES.map(upBtn).join('')}
                    <button type="button" class="shop-btn" data-over ${T.overcharge >= 3 ? 'disabled' : ''}>🔋 Overcharge <em>${T.overcharge}/3</em> (80 💰)<small>Press E: 4 s of double fire rate and piercing shots</small></button>
                    <button type="button" class="shop-btn" data-repair ${T.hp >= 100 ? 'disabled' : ''}>🔧 Repair Kit <em>HP ${Math.ceil(T.hp)}</em> (60 💰)<small>Restores 40 health right away</small></button>
                </div>
                <p class="canvas-instructions">The fight clock is paused while you shop. Faster defeats rank higher on the leaderboard!</p>
                <button type="button" class="btn-continue-shop" data-start-fight>⚔️ Fight! →</button>
            </div>`;
        const spend = cost => {
            if (T.credits < cost) { toast(`Not enough credits. You need ${cost} 💰.`, 'warn'); return false; }
            T.credits -= cost; FX.sample('shopBuy');
            return true;
        };
        $$('[data-up]', S.stage).forEach(b => b.onclick = () => {
            const u = BOSS_UPGRADES.find(x => x.k === b.dataset.up);
            if (maxed(u) || !spend(u.costs[T.lv[u.k]])) return;
            T.lv[u.k]++;
            if (u.k === 'xp') S.xpMult = 2;
            toast(`${u.name} installed!`, 'success');
            workshop(gain, start);
        });
        $('[data-over]', S.stage).onclick = () => { if (T.overcharge < 3 && spend(80)) { T.overcharge++; workshop(gain, start); } };
        $('[data-repair]', S.stage).onclick = () => { if (T.hp < 100 && spend(60)) { T.hp = Math.min(100, T.hp + 40); workshop(gain, start); } };
        const go = $('[data-start-fight]', S.stage);
        go.onclick = start;
        setTimeout(() => { if (document.body.contains(go)) go.focus({ preventScroll: true }); }, 400);
    }

    function fight(next) {
        let dealt = 0, hitsTaken = 0, blocked = 0;
        canvasRound(S, {
            title: '👑 Boss Battle', theme: 'theme-boss', seconds: 30, skipSummary: true,
            intro: `Round ${S.q + 1}: True God Scrappy has ${Math.ceil(T.bossHp / BOSS_HP * 100)}% HP left. Dodge and keep firing!`,
            hint: 'Move: arrows or WASD (or drag) · Scrappy fires automatically · E: Overcharge',
            buttons: '<button type="button" class="game-btn" data-action="over">🔋 Overcharge (E)</button>',
            onEnd: () => {
                T.report = T.defeated ? `defeated in ${fmtFight(T.fightMs)}!` : `${Math.round(dealt)} damage dealt · ${hitsTaken} hits taken${blocked ? ` · ${blocked} blocked` : ''}`;
                if (T.defeated && !T.shownWin) { T.shownWin = true; return victory(next); }
                next();
            },
            setup(api) {
                const { ctx, juice, keys, pointer } = api;
                const stars = makeStars(90, 640, 360);
                const planet = { x: 70, y: 70, r: 30, light: '#a5b4fc', dark: '#1e1b4b', ring: true, tilt: -0.3, bands: true };
                const p = { x: 130, y: 190, vx: 0, vy: 0 };
                const boss = { x: 482, y: 214, flash: 0, eyeCharge: 0, phase: 1 };
                const K = BOSS_SCALE;
                let t = 0, bolts = [], orbs = [], slams = [], lasers = [], cool = 1600, fireCd = 0, iframes = 0, overMs = 0, state = 'fight', endMs = 0, worried = 0, spiralA = 0, spiralMs = 0;
                let shield = T.lv.shield;
                const speed = 3.6 * (1 + T.lv.jets * 0.2);
                const damage = 10 * (1 + T.lv.power * 0.3);
                const fireDelay = 260 * Math.pow(0.75, T.lv.rate);
                const phaseOf = () => T.bossHp > BOSS_HP * 0.66 ? 1 : T.bossHp > BOSS_HP * 0.33 ? 2 : 3;
                let lastPhase = phaseOf();

                const over = () => { if (!T.overcharge || overMs > 0 || state !== 'fight') return; T.overcharge--; overMs = 4000; FX.sample('emp'); FX.flash('rgba(244,114,182,.2)'); };
                const hurt = dmg => {
                    if (iframes > 0 || state !== 'fight') return;
                    iframes = 900; worried = 700;
                    if (shield > 0) { shield--; blocked++; FX.sample('shieldBlock'); juice.text(p.x, p.y - 30, 'BLOCKED', '#93c5fd'); juice.burst(p.x, p.y, '#60a5fa', 18); return; }
                    T.hp -= dmg; hitsTaken++; FX.sample('crash'); juice.shake(10); juice.burst(p.x, p.y, '#ef4444', 18);
                    juice.text(p.x, p.y - 30, `-${dmg}`, '#f87171');
                    if (T.hp <= 0) {
                        T.hp = 0; state = 'ko'; endMs = 1800;
                        FX.play('lose');
                    }
                };
                // Boss attack patterns (more join as his health drops)
                const attack = () => {
                    const ph = phaseOf(), pool = ['ring', 'aimed', 'slam'];
                    if (ph >= 2) pool.push('laser', 'laser');
                    if (ph >= 3) pool.push('spiral', 'spiral');
                    const a = pool[Math.floor(Math.random() * pool.length)];
                    const cx = boss.x, cy = boss.y + 40 * K;
                    if (a === 'ring') {
                        const n = 12 + ph * 2, off = Math.random();
                        for (let i = 0; i < n; i++) { const ang = (i + off) / n * Math.PI * 2; orbs.push({ x: cx, y: cy, vx: Math.cos(ang) * (2 + ph * 0.3), vy: Math.sin(ang) * (2 + ph * 0.3), r: 6, c: '#fbbf24' }); }
                    } else if (a === 'aimed') {
                        const base = Math.atan2(p.y - cy, p.x - cx), n = ph >= 2 ? 5 : 3;
                        for (let i = 0; i < n; i++) { const ang = base + (i - (n - 1) / 2) * 0.16; orbs.push({ x: cx - 30, y: cy, vx: Math.cos(ang) * 4.2, vy: Math.sin(ang) * 4.2, r: 7, c: '#38bdf8' }); }
                    } else if (a === 'slam') {
                        slams.push({ y: p.y, x: 660, warn: 700, speed: 9 + ph * 1.5 });
                    } else if (a === 'laser') {
                        lasers.push({ y: p.y, warn: 900, live: 650 });
                        boss.eyeCharge = 1;
                    } else {
                        spiralMs = 2200;
                    }
                    FX.play('hit');
                    cool = Math.max(650, 1700 - ph * 300) * rand(0.8, 1.15);
                };

                return {
                    key(code) { if (code === 'KeyE') over(); },
                    action(a) { if (a === 'over') over(); },
                    frame(dt, ms) {
                        t += ms; iframes -= ms; overMs -= ms; worried -= ms; boss.flash -= ms; boss.eyeCharge = Math.max(0, boss.eyeCharge - ms / 1200);
                        if (state === 'fight') T.fightMs += ms;

                        // Arena: deep space with a nebula, like the True God Scrappy art
                        spaceBackdrop(ctx, 640, 360, stars, dt * 0.3, t);
                        const neb = ctx.createRadialGradient(500, 160, 20, 500, 160, 300);
                        neb.addColorStop(0, boss.phase === 3 ? 'rgba(244,63,94,.22)' : 'rgba(129,140,248,.25)'); neb.addColorStop(1, 'rgba(0,0,0,0)');
                        ctx.fillStyle = neb; ctx.fillRect(0, 0, 640, 360);
                        drawPlanet(ctx, planet);

                        // Movement: keys, or drag toward the pointer
                        let mx = (keys.ArrowRight || keys.KeyD ? 1 : 0) - (keys.ArrowLeft || keys.KeyA ? 1 : 0);
                        let my = (keys.ArrowDown || keys.KeyS ? 1 : 0) - (keys.ArrowUp || keys.KeyW ? 1 : 0);
                        if (!mx && !my && pointer.down) { const dx = pointer.x - p.x, dy = pointer.y - p.y, d = Math.hypot(dx, dy); if (d > 6) { mx = dx / d; my = dy / d; } }
                        const len = Math.hypot(mx, my) || 1;
                        if (state === 'fight') { p.x += mx / len * speed * dt; p.y += my / len * speed * dt; }
                        p.x = clamp(p.x, 24, 380); p.y = clamp(p.y, 40, 340);

                        // Auto-fire
                        fireCd -= ms;
                        if (state === 'fight' && fireCd <= 0) {
                            const angles = T.lv.spread >= 2 ? [-0.2, -0.1, 0, 0.1, 0.2] : T.lv.spread ? [-0.12, 0, 0.12] : [0];
                            angles.forEach(a => bolts.push({ x: p.x + 46, y: p.y + 9, vx: Math.cos(a) * 11, vy: Math.sin(a) * 11, pierce: overMs > 0 }));
                            fireCd = overMs > 0 ? fireDelay / 2 : fireDelay;
                            FX.sample('laser');
                        }

                        // Boss
                        boss.phase = phaseOf();
                        if (boss.phase !== lastPhase && state === 'fight') {
                            lastPhase = boss.phase; FX.sample('coreBreach'); juice.shake(14); FX.flash(boss.phase === 3 ? 'rgba(244,63,94,.3)' : 'rgba(251,191,36,.25)');
                            juice.text(420, 60, boss.phase === 3 ? 'ENRAGED!' : 'PHASE 2', '#fde68a');
                        }
                        if (state === 'fight') { cool -= ms; if (cool <= 0) attack(); }
                        if (spiralMs > 0 && state === 'fight') {
                            spiralMs -= ms; spiralA += 0.32 * dt;
                            if (Math.floor(t / 70) !== Math.floor((t - ms) / 70)) for (let k = 0; k < 2; k++) { const a = spiralA + k * Math.PI; orbs.push({ x: boss.x, y: boss.y + 40 * K, vx: Math.cos(a) * 2.6, vy: Math.sin(a) * 2.6, r: 5, c: '#f472b6' }); }
                        }
                        if (state !== 'won') {
                            ctx.save(); ctx.translate(boss.x, boss.y); ctx.scale(K, K); ctx.translate(-boss.x, -boss.y);
                            drawGodScrappy(ctx, boss, t);
                            drawGodHand(ctx, boss.x - 118, boss.y + 70 + Math.sin(t / 500) * 10, 1, false, boss.phase === 3 ? '#fb7185' : '#60a5fa');
                            drawGodHand(ctx, boss.x + 112, boss.y + 110 + Math.cos(t / 560) * 10, 0.85, true, boss.phase === 3 ? '#fb7185' : '#60a5fa');
                            ctx.restore();
                        }

                        // Player bolts hit the head or body
                        bolts.forEach(b => {
                            b.x += b.vx * dt; b.y += b.vy * dt;
                            ctx.save(); ctx.shadowColor = b.pierce ? '#f472b6' : '#22d3ee'; ctx.shadowBlur = 10;
                            ctx.strokeStyle = b.pierce ? '#f9a8d4' : '#a5f3fc'; ctx.lineWidth = b.pierce ? 4 : 3; ctx.lineCap = 'round';
                            ctx.beginPath(); ctx.moveTo(b.x - b.vx * 1.4, b.y - b.vy * 1.4); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.restore();
                            const head = b.x > boss.x - 70 * K && b.x < boss.x + 70 * K && b.y > boss.y - 150 * K && b.y < boss.y - 35 * K;
                            const body = b.x > boss.x - 75 * K && b.x < boss.x + 75 * K && b.y > boss.y - 35 * K && b.y < boss.y + 170 * K;
                            if (state === 'fight' && !b.used && (head || body)) {
                                b.used = !b.pierce || b.x > boss.x + 40 * K;
                                const dmg = damage * (head ? 1.5 : 1) * (b.pierce ? 1.3 : 1);
                                T.bossHp = Math.max(0, T.bossHp - dmg); dealt += dmg; boss.flash = 70;
                                S.score += Math.round(dmg * 0.5 * scoreMult());
                                if (Math.random() < 0.25) juice.text(b.x, b.y - 10, head ? `${Math.round(dmg)}!` : `${Math.round(dmg)}`, head ? '#fde68a' : '#e0f2fe');
                                FX.sample('bossHit');
                                if (T.bossHp <= 0) {
                                    state = 'won'; endMs = 2600; T.defeated = true;
                                    const secs = T.fightMs / 1000;
                                    S.score += Math.round((2000 + Math.max(0, 6000 - secs * 40)) * scoreMult());
                                    store.set('bossDefeated', true);
                                    T.record = Portal.recordBossTime(T.fightMs);
                                    FX.play('win'); FX.flash('rgba(253,230,138,.45)'); juice.shake(20);
                                    for (let i = 0; i < 6; i++) juice.burst(boss.x + rand(-60, 60), boss.y + rand(-120, 120), ['#fbbf24', '#38bdf8', '#fff'][i % 3], 30);
                                    orbs = []; slams = []; lasers = [];
                                }
                            }
                        });
                        bolts = bolts.filter(b => !b.used && b.x < 660 && b.y > -20 && b.y < 380);

                        // Boss projectiles and attacks
                        orbs.forEach(o => {
                            o.x += o.vx * dt; o.y += o.vy * dt;
                            ctx.save(); ctx.shadowColor = o.c; ctx.shadowBlur = 12; ctx.fillStyle = o.c;
                            ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2); ctx.fill();
                            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(o.x, o.y, o.r * 0.45, 0, Math.PI * 2); ctx.fill(); ctx.restore();
                            if (Math.hypot(o.x - p.x, o.y - p.y) < o.r + 12) { o.gone = true; hurt(8); }
                        });
                        orbs = orbs.filter(o => !o.gone && o.x > -20 && o.x < 660 && o.y > -20 && o.y < 380);
                        slams.forEach(s => {
                            if (s.warn > 0) {
                                s.warn -= ms;
                                ctx.save(); ctx.globalAlpha = 0.25 + 0.25 * Math.sin(t / 60); ctx.fillStyle = '#ef4444'; ctx.fillRect(0, s.y - 24, 640, 48); ctx.restore();
                            } else {
                                s.x -= s.speed * dt;
                                drawGodHand(ctx, s.x, s.y, 1.25, false, '#f43f5e');
                                if (Math.abs(s.y - p.y) < 30 && p.x > s.x - 50 && p.x < s.x + 40) hurt(18);
                                if (s.x < -80) s.gone = true;
                            }
                        });
                        slams = slams.filter(s => !s.gone);
                        lasers.forEach(l => {
                            if (l.warn > 0) {
                                l.warn -= ms;
                                ctx.save(); ctx.strokeStyle = 'rgba(56,189,248,.6)'; ctx.setLineDash([10, 8]); ctx.lineWidth = 2;
                                ctx.beginPath(); ctx.moveTo(0, l.y); ctx.lineTo(boss.x - 40 * K, l.y); ctx.stroke(); ctx.restore();
                            } else {
                                l.live -= ms;
                                ctx.save(); ctx.shadowColor = '#38bdf8'; ctx.shadowBlur = 24; ctx.fillStyle = '#e0f2fe';
                                ctx.fillRect(0, l.y - 7, boss.x - 40 * K, 14); ctx.fillStyle = "#38bdf8"; ctx.fillRect(0, l.y - 12, boss.x - 40 * K, 4); ctx.fillRect(0, l.y + 8, boss.x - 40 * K, 4); ctx.restore();
                                if (Math.abs(l.y - p.y) < 20) hurt(22);
                                if (l.live <= 0) l.gone = true;
                            }
                        });
                        lasers = lasers.filter(l => !l.gone);

                        // Little Scrappy
                        if (state !== 'ko') drawLittleScrappy(ctx, p, t, { mood: worried > 0 ? 'worried' : 'focus', blink: iframes > 0 && Math.floor(iframes / 90) % 2 === 0, over: overMs > 0 });
                        if (shield > 0) { ctx.save(); ctx.strokeStyle = 'rgba(96,165,250,.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x + 6, p.y, 34, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }

                        // HUD: boss health with phase marks, your health, fight clock
                        ctx.save();
                        ctx.fillStyle = 'rgba(2,6,23,.75)'; roundRect(ctx, 150, 10, 340, 24, 6); ctx.fill();
                        const hpw = 330 * T.bossHp / BOSS_HP;
                        const hb = ctx.createLinearGradient(155, 0, 485, 0); hb.addColorStop(0, '#fbbf24'); hb.addColorStop(1, boss.phase === 3 ? '#f43f5e' : '#f59e0b');
                        ctx.fillStyle = hb; roundRect(ctx, 155, 15, Math.max(0, hpw), 14, 4); ctx.fill();
                        ctx.fillStyle = 'rgba(255,255,255,.7)'; [0.33, 0.66].forEach(f => ctx.fillRect(155 + 330 * f, 13, 2, 18));
                        ctx.fillStyle = '#fff'; ctx.font = '800 11px Orbitron, sans-serif'; ctx.textAlign = 'center';
                        ctx.fillText(`TRUE GOD SCRAPPY  ${Math.ceil(T.bossHp / BOSS_HP * 100)}%`, 320, 26);
                        ctx.textAlign = 'left'; ctx.font = '800 13px Orbitron, sans-serif'; ctx.fillStyle = '#e0f2fe';
                        ctx.fillText(`FIGHT ${fmtFight(T.fightMs)}`, 14, 26);
                        ctx.fillStyle = 'rgba(2,6,23,.75)'; roundRect(ctx, 12, 334, 150, 16, 5); ctx.fill();
                        ctx.fillStyle = T.hp > 35 ? '#34d399' : '#ef4444'; roundRect(ctx, 15, 337, 144 * T.hp / 100, 10, 3); ctx.fill();
                        ctx.fillStyle = '#fff'; ctx.font = '800 10px Orbitron, sans-serif'; ctx.fillText(`HP ${Math.ceil(T.hp)}`, 170, 346);
                        if (overMs > 0) { ctx.fillStyle = '#f472b6'; ctx.fillText('OVERCHARGE!', 220, 346); }
                        ctx.restore();

                        // Endings: victory or knocked out
                        if (state !== 'fight') {
                            endMs -= ms;
                            ctx.save(); ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(2,6,23,.55)'; ctx.fillRect(0, 140, 640, 80);
                            ctx.font = '800 26px Orbitron, sans-serif'; ctx.fillStyle = state === 'won' ? '#fde68a' : '#fca5a5';
                            ctx.fillText(state === 'won' ? 'TRUE GOD SCRAPPY DEFEATED!' : 'SCRAPPY KNOCKED OUT', 320, 178);
                            ctx.font = '700 14px Inter, sans-serif'; ctx.fillStyle = '#fff';
                            ctx.fillText(state === 'won' ? `Fight time ${fmtFight(T.fightMs)}${T.record ? ' · NEW PERSONAL BEST!' : ''}` : 'Repair up in the workshop and try again next round.', 320, 202);
                            ctx.restore();
                            if (endMs <= 0) { if (state === 'ko') T.hp = 100; api.finish(); state = 'done'; }
                        }
                        api.hud(`Boss ${Math.ceil(T.bossHp / BOSS_HP * 100)}% · HP ${Math.ceil(T.hp)} · 🛡️${shield} · 🔋${T.overcharge} · ${T.credits} 💰`);
                    },
                    summary: () => [T.defeated ? `<strong>True God Scrappy defeated in ${fmtFight(T.fightMs)}!</strong>` : `Boss health left: <strong>${Math.ceil(T.bossHp / BOSS_HP * 100)}%</strong>`, `Damage this round: <strong>${Math.round(dealt)}</strong>`, `Hits taken: <strong>${hitsTaken}</strong>${blocked ? ` · Blocked: <strong>${blocked}</strong>` : ''}`, `Total fight time: <strong>${fmtFight(T.fightMs)}</strong>`]
                };
            }
        });
    }

    // Victory screen with the time and where it ranks
    function victory(next) {
        const me = Portal.getActiveUser();
        const rows = Portal.topFor('boss', 5).map(({ u, text }, i) =>
            `<div class="lb-mini-row${me && u.id === me.id ? ' me' : ''}"><span>#${i + 1} <strong>${esc(u.username)}</strong>${me && u.id === me.id ? ' (You)' : ''}</span><b>${esc(text)}</b></div>`).join('');
        S.stage.innerHTML = `
            <div class="quiz-game-card round-summary">
                <h2 class="shop-title">👑 True God Scrappy Defeated!</h2>
                <p class="shop-credits">Fight time: <strong class="credit-highlight">${fmtFight(T.fightMs)}</strong>${T.record ? ' · New personal best!' : ''}</p>
                ${me ? '' : '<p class="canvas-instructions">Create a profile to put your time on the leaderboard.</p>'}
                <h3 class="sub-heading">🏆 Fastest Defeats</h3>
                <div class="lb-mini">${rows || '<p class="empty-note">No times yet.</p>'}</div>
                <button type="button" class="btn-continue-shop" data-next>${S.q >= S.total - 1 ? 'See Results →' : 'Next Question →'}</button>
            </div>`;
        $('[data-next]', S.stage).onclick = next;
    }

    return {
        status: () => T.defeated ? `Boss defeated in ${fmtFight(T.fightMs)}` : `Boss ${Math.ceil(T.bossHp / BOSS_HP * 100)}% · ${T.credits} 💰`,
        round(ok, next) {
            if (T.defeated) return next();          // the boss is down: the rest is just quiz questions
            const gain = ok ? 100 + (S.combo.streak - 1) * 25 : 0;
            T.credits += gain;
            workshop(gain, () => fight(next));
        }
    };
};

// ---- 5. DATA PACKET CATCHER -------------------------------------------------
// Scrappy flies a hover-collector under a data cloud. Catch clean data cubes for the training
// set, avoid corrupted ones. Right answers fund the Data Lab between rounds.
const PACKET_KINDS = {
    text: { color: '#38bdf8', dark: '#0c4a6e' },
    image: { color: '#34d399', dark: '#064e3b' },
    audio: { color: '#a78bfa', dark: '#3b0764' },
    gold: { color: '#fbbf24', dark: '#78350f' },
    bad: { color: '#ef4444', dark: '#450a0a' }
};

// A data cube: lit top face, glowing edge and a little icon for its kind
function drawPacket(ctx, it, t) {
    const k = PACKET_KINDS[it.kind], s = it.w, x = it.x, y = it.y;
    ctx.save();
    if (it.kind === 'bad') ctx.translate(Math.sin(t / 30 + x) * 1.5, 0);          // corrupted data jitters
    ctx.shadowColor = k.color; ctx.shadowBlur = it.kind === 'gold' ? 18 : 12;
    const g = ctx.createLinearGradient(x, y, x, y + s);
    g.addColorStop(0, k.color); g.addColorStop(1, k.dark);
    ctx.fillStyle = g; roundRect(ctx, x, y + 5, s, s - 5, 5); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.moveTo(x + 3, y + 5); ctx.lineTo(x + 8, y); ctx.lineTo(x + s - 2, y); ctx.lineTo(x + s - 7, y + 5); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.fillStyle = '#fff'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const cx = x + s / 2, cy = y + s / 2 + 3;
    if (it.kind === 'text') { [-5, 0, 5].forEach((dy, i) => { ctx.beginPath(); ctx.moveTo(cx - 7, cy + dy); ctx.lineTo(cx + (i === 2 ? 2 : 7), cy + dy); ctx.stroke(); }); }
    else if (it.kind === 'image') { ctx.strokeRect(cx - 8, cy - 6, 16, 12); ctx.beginPath(); ctx.moveTo(cx - 7, cy + 5); ctx.lineTo(cx - 2, cy - 1); ctx.lineTo(cx + 2, cy + 3); ctx.lineTo(cx + 7, cy - 3); ctx.stroke(); }
    else if (it.kind === 'audio') { ctx.beginPath(); for (let i = 0; i <= 14; i++) { const px = cx - 7 + i, py = cy + Math.sin(i / 1.6 + t / 120) * 5; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); }
    else if (it.kind === 'gold') { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, r = i % 2 ? 3.2 : 7.5; ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } ctx.closePath(); ctx.fill(); }
    else {
        // Corrupted: glitch slices, static and a warning mark
        for (let i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? 'rgba(0,0,0,.45)' : 'rgba(255,255,255,.25)'; ctx.fillRect(x + ((t / 40 + i * 7) % 6) - 3, y + 6 + i * 5, s, 2); }
        ctx.fillStyle = '#fff'; ctx.fillRect(cx - 1.5, cy - 7, 3, 9); ctx.fillRect(cx - 1.5, cy + 4, 3, 3);
    }
    ctx.restore();
}

// Scrappy riding the collector tray, with thrusters and an optional magnet field
function drawCollector(ctx, pad, t, { mood, magnet, rim }) {
    const cx = pad.x + pad.w / 2, y = pad.y;
    ctx.save();
    if (magnet) { ctx.strokeStyle = 'rgba(192,132,252,.35)'; ctx.lineWidth = 2; ctx.setLineDash([5, 7]); ctx.lineDashOffset = -t / 40; ctx.beginPath(); ctx.ellipse(cx, y - 10, pad.w / 2 + 40, 60, 0, Math.PI, 0); ctx.stroke(); ctx.setLineDash([]); }
    // Thruster flames
    ctx.save(); ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 12; ctx.fillStyle = '#67e8f9';
    [-0.3, 0.3].forEach(f => { const fx = cx + f * pad.w, fl = 8 + Math.random() * 6; ctx.beginPath(); ctx.moveTo(fx - 5, y + 16); ctx.lineTo(fx, y + 16 + fl); ctx.lineTo(fx + 5, y + 16); ctx.fill(); });
    ctx.restore();
    // Tray
    const g = ctx.createLinearGradient(0, y, 0, y + 18);
    g.addColorStop(0, '#94a3b8'); g.addColorStop(1, '#1e293b');
    ctx.fillStyle = g; ctx.strokeStyle = '#0b1020'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(pad.x, y); ctx.lineTo(pad.x + pad.w, y); ctx.lineTo(pad.x + pad.w - 12, y + 16); ctx.lineTo(pad.x + 12, y + 16); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.shadowColor = rim; ctx.shadowBlur = 14; ctx.fillStyle = rim; ctx.fillRect(pad.x + 2, y - 1, pad.w - 4, 3); ctx.restore();
    ctx.fillStyle = '#0f172a'; for (let i = 1; i < 6; i++) ctx.fillRect(pad.x + 12 + (pad.w - 24) * i / 6, y + 5, 2, 8);
    // Scrappy sits behind the tray rim
    ctx.translate(cx, y - 16); ctx.scale(1.15, 1.15); ctx.translate(-cx, -(y - 16));
    drawScrappyHead(ctx, cx, y - 16, mood);
    ctx.restore();
}

const CATCHER_UPGRADES = [
    { k: 'wide', icon: '📦', name: 'Wide Collector', desc: 'A wider tray (+20 px per level)', costs: [100, 200, 320] },
    { k: 'speed', icon: '🚀', name: 'Thruster Speed', desc: 'Move 25% faster per level', costs: [90, 180] },
    { k: 'magnet', icon: '🧲', name: 'Data Magnet', desc: 'Pulls clean packets toward you (stronger at Lv 2)', costs: [140, 260] },
    { k: 'filter', icon: '🛡️', name: 'Firewall Filter', desc: 'Zaps 2 corrupted packets per round, per level', costs: [120, 220, 340] },
    { k: 'xp', icon: '🎓', name: 'Double XP', desc: 'Doubles the XP you earn from this lesson', costs: [200] },
    { k: 'mult', icon: '🌟', name: '2x Score', desc: 'Doubles every point you score', costs: [180] }
];

ARCADE_LOGIC.catcher = S => {
    const T = { clean: 0, dirty: 0, credits: 0, rush: 0, report: null, lv: { wide: 0, speed: 0, magnet: 0, filter: 0, xp: 0, mult: 0 } };
    FX.preload(['orb', 'crash', 'blaster', 'nitro', 'shopBuy', 'zone']);
    const purity = () => T.clean + T.dirty ? Math.round((T.clean / (T.clean + T.dirty)) * 100) : 100;
    const scoreMult = () => (T.lv.mult ? 2 : 1) * S.combo.mult;

    function dataLab(gain, start) {
        const maxed = u => T.lv[u.k] >= u.costs.length;
        const upBtn = u => {
            const lvl = T.lv[u.k], max = u.costs.length;
            return `<button type="button" class="shop-btn" data-up="${u.k}" ${maxed(u) ? 'disabled' : ''}>
                ${u.icon} ${u.name}${max > 1 ? ` <em>Lv ${lvl}/${max}</em>` : ''} ${maxed(u) ? '✅' : `(${u.costs[lvl]} 💰)`}<small>${u.desc}</small></button>`;
        };
        S.stage.innerHTML = `
            <div class="quiz-game-card">
                <h2 class="shop-title">🛠️ Data Lab</h2>
                ${gain ? `<p class="round-intro">✅ Correct! +${gain} credits${S.combo.streak > 1 ? ` (🔥 ${S.combo.streak} streak bonus)` : ''}</p>` : '<p class="round-intro">❌ No credits this time. Right answers (and gold packets) earn credits.</p>'}
                ${T.report ? `<p class="canvas-instructions">Last round: ${T.report}</p>` : ''}
                <p class="shop-credits">Dataset purity: <strong class="credit-highlight">${purity()}%</strong> · Credits: <strong class="credit-highlight">${T.credits} 💰</strong></p>
                <div class="armory-grid">${CATCHER_UPGRADES.map(upBtn).join('')}
                    <button type="button" class="shop-btn" data-rush ${T.rush >= 3 ? 'disabled' : ''}>✨ Gold Rush <em>${T.rush}/3</em> (80 💰)<small>Press G: for 5 s every packet turns gold</small></button>
                </div>
                <button type="button" class="btn-continue-shop" data-start-catch>Start Round ${S.q + 1} →</button>
            </div>`;
        const spend = cost => {
            if (T.credits < cost) { toast(`Not enough credits. You need ${cost} 💰.`, 'warn'); return false; }
            T.credits -= cost; FX.sample('shopBuy');
            return true;
        };
        $$('[data-up]', S.stage).forEach(b => b.onclick = () => {
            const u = CATCHER_UPGRADES.find(x => x.k === b.dataset.up);
            if (maxed(u) || !spend(u.costs[T.lv[u.k]])) return;
            T.lv[u.k]++;
            if (u.k === 'xp') S.xpMult = 2;
            toast(`${u.name} installed!`, 'success');
            dataLab(gain, start);
        });
        $('[data-rush]', S.stage).onclick = () => { if (T.rush < 3 && spend(80)) { T.rush++; dataLab(gain, start); } };
        const go = $('[data-start-catch]', S.stage);
        go.onclick = start;
        setTimeout(() => { if (document.body.contains(go)) go.focus({ preventScroll: true }); }, 400);
    }

    function catchRound(next) {
        let caught = 0, bad = 0, zapped = 0, golds = 0;
        canvasRound(S, {
            title: '📦 Packet Catcher', theme: 'theme-catcher', seconds: 15, skipSummary: true,
            intro: `Round ${S.q + 1}: build a clean training set. Catch clean data, dodge corrupted packets!`,
            hint: 'Arrows / A-D, mouse, or drag to move · G: Gold Rush',
            buttons: '<button type="button" class="game-btn" data-action="rush">✨ Gold Rush (G)</button>',
            onEnd: () => { T.report = `${caught} clean · ${bad} corrupted · ${zapped} zapped · ${golds} gold · purity ${purity()}%`; next(); },
            setup(api) {
                const { ctx, juice, keys, pointer } = api;
                const chain = createChain(2600);
                const width = 92 + T.lv.wide * 20;
                const pad = { x: 320 - width / 2, y: 304, w: width, h: 16 };
                const speed = 8 * (1 + T.lv.speed * 0.25);
                const pull = [0, 0.03, 0.055][T.lv.magnet];
                const cols = Array.from({ length: 22 }, (_, i) => ({ x: 14 + i * 29, y: Math.random() * 360, v: rand(0.6, 1.6), bits: Array.from({ length: 9 }, () => Math.random() < 0.5 ? '0' : '1').join('') }));
                let items = [], zaps = [], spawn = 300, lastX = null, t = 0, rushMs = 0, worried = 0, happy = 0;
                let filters = T.lv.filter * 2;
                const rush = () => { if (!T.rush || rushMs > 0) return; T.rush--; rushMs = 5000; FX.sample('nitro'); FX.flash('rgba(251,191,36,.25)'); };
                return {
                    key(code) { if (code === 'KeyG') rush(); },
                    action(a) { if (a === 'rush') rush(); },
                    frame(dt, ms) {
                        chain.tick(ms); t += ms; rushMs -= ms; worried -= ms; happy -= ms;
                        // Data center sky: falling binary streams under a glowing data cloud
                        neonBackdrop(ctx, 640, 360, '#04101f', '#0a0618');
                        ctx.font = '10px "JetBrains Mono", monospace';
                        cols.forEach(c => {
                            c.y += c.v * dt; if (c.y > 360) c.y = -100;
                            [...c.bits].forEach((b, i) => { ctx.fillStyle = `rgba(45,212,191,${0.05 + i * 0.012})`; ctx.fillText(b, c.x, c.y + i * 11); });
                        });
                        for (let i = 0; i < 8; i++) {
                            const g = ctx.createRadialGradient(i * 90 + 20, 6, 4, i * 90 + 20, 6, 70);
                            g.addColorStop(0, rushMs > 0 ? 'rgba(253,230,138,.35)' : 'rgba(186,230,253,.3)'); g.addColorStop(1, 'rgba(0,0,0,0)');
                            ctx.fillStyle = g; ctx.fillRect(i * 90 - 50, -64, 140, 140);
                        }
                        ctx.strokeStyle = 'rgba(56,189,248,.18)'; ctx.lineWidth = 1;
                        for (let x = -320; x <= 960; x += 60) { ctx.beginPath(); ctx.moveTo(320 + (x - 320) * 0.35, 330); ctx.lineTo(x, 370); ctx.stroke(); }
                        ctx.beginPath(); ctx.moveTo(0, 330); ctx.lineTo(640, 330); ctx.stroke();

                        // Movement
                        if (keys.ArrowLeft || keys.KeyA) pad.x -= speed * dt;
                        if (keys.ArrowRight || keys.KeyD) pad.x += speed * dt;
                        if (pointer.x !== lastX) { if (lastX !== null || pointer.down) pad.x += clamp(pointer.x - pad.w / 2 - pad.x, -speed * 1.6 * dt, speed * 1.6 * dt); lastX = pointer.x; }
                        else if (pointer.down) pad.x += clamp(pointer.x - pad.w / 2 - pad.x, -speed * 1.6 * dt, speed * 1.6 * dt);
                        pad.x = clamp(pad.x, 0, 640 - pad.w);

                        // Spawning: more corrupted data and faster drops every round
                        spawn -= ms;
                        if (spawn <= 0) {
                            const r = Math.random(), badChance = 0.3 + S.q * 0.04;
                            const kind = r < 0.06 ? 'gold' : r < 0.06 + badChance ? 'bad' : ['text', 'image', 'audio'][Math.floor(Math.random() * 3)];
                            items.push({ x: rand(10, 600), y: -34, w: 30, h: 30, kind, vy: rand(2.4, 3.6) + S.q * 0.25, sway: Math.random() * 6 });
                            spawn = rand(240, 440) - S.q * 25;
                        }
                        items.forEach(it => {
                            if (rushMs > 0 && it.kind !== 'gold') it.kind = 'gold';
                            it.y += it.vy * dt;
                            if (S.q >= 2) it.x += Math.sin(t / 400 + it.sway) * 0.6 * dt;          // later rounds drift side to side
                            if (pull && it.kind !== 'bad' && it.y > 120) it.x += clamp((pad.x + pad.w / 2 - 15 - it.x) * pull, -5, 5) * dt;
                            // Firewall Filter zaps corrupted packets that get close
                            if (it.kind === 'bad' && filters > 0 && it.y > pad.y - 130 && Math.abs(it.x + 13 - (pad.x + pad.w / 2)) < pad.w) {
                                filters--; zapped++; it.gone = true;
                                zaps.push({ x1: pad.x + pad.w / 2, y1: pad.y - 24, x2: it.x + 13, y2: it.y + 13, life: 180 });
                                juice.burst(it.x + 13, it.y + 13, '#f87171', 16); FX.sample('blaster');
                                return;
                            }
                            drawPacket(ctx, it, t);
                            if (overlap(it, pad)) {
                                it.gone = true;
                                if (it.kind === 'bad') {
                                    bad++; T.dirty++; chain.reset(); worried = 700;
                                    S.score = Math.max(0, S.score - 90);
                                    juice.burst(it.x + 13, pad.y, '#ef4444', 24); juice.text(it.x + 13, pad.y - 26, '-90', '#f87171'); juice.shake(14); FX.sample('crash');
                                } else {
                                    caught++; T.clean++; happy = 300;
                                    const gold = it.kind === 'gold';
                                    if (gold) { golds++; T.credits += 10; }
                                    const pts = Math.round((gold ? 90 : 40) * scoreMult() * chain.hit());
                                    S.score += pts;
                                    juice.burst(it.x + 13, pad.y, PACKET_KINDS[it.kind].color, 12);
                                    juice.text(it.x + 13, pad.y - 26, gold ? `+${pts} +10 💰` : `+${pts}`, gold ? '#fde68a' : '#67e8f9');
                                    FX.sample(gold ? 'shopBuy' : 'orb');
                                }
                            }
                        });
                        items = items.filter(it => !it.gone && it.y < 370);
                        zaps.forEach(z => {
                            z.life -= ms;
                            ctx.save(); ctx.strokeStyle = '#fca5a5'; ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 12; ctx.lineWidth = 3;
                            ctx.beginPath(); ctx.moveTo(z.x1, z.y1); ctx.lineTo((z.x1 + z.x2) / 2 + rand(-6, 6), (z.y1 + z.y2) / 2); ctx.lineTo(z.x2, z.y2); ctx.stroke(); ctx.restore();
                        });
                        zaps = zaps.filter(z => z.life > 0);

                        drawCollector(ctx, pad, t, { mood: worried > 0 ? 'worried' : happy > 0 ? 'happy' : 'focus', magnet: pull > 0, rim: rushMs > 0 ? '#fbbf24' : '#22d3ee' });
                        // Filter charges as small shield pips beside the collector
                        for (let i = 0; i < filters; i++) { ctx.fillStyle = '#f87171'; roundRect(ctx, pad.x + pad.w + 6, pad.y - 4 + i * 7, 10, 5, 2); ctx.fill(); }
                        if (rushMs > 0) { ctx.font = '800 15px Orbitron, sans-serif'; ctx.fillStyle = '#fde68a'; ctx.textAlign = 'center'; ctx.fillText('GOLD RUSH!', 320, 60); ctx.textAlign = 'left'; }
                        if (chain.count >= 3) { ctx.font = '800 15px Orbitron, sans-serif'; ctx.fillStyle = '#fbbf24'; ctx.fillText(`CATCH CHAIN x${chain.count}`, 450, 24); }
                        api.hud(`Purity ${purity()}% · 🛡️${filters} · ✨${T.rush} · ${T.credits} 💰`);
                    },
                    summary: () => [`Clean packets: <strong>${caught}</strong>`, `Corrupted packets caught: <strong>${bad}</strong>`, `Zapped by the filter: <strong>${zapped}</strong>`, `Gold packets: <strong>${golds}</strong>`, `Dataset purity: <strong>${purity()}%</strong>`]
                };
            }
        });
    }

    return {
        status: () => `Purity ${purity()}% · ${T.credits} 💰`,
        round(ok, next) {
            const gain = ok ? 100 + (S.combo.streak - 1) * 25 : 0;
            T.credits += gain;
            dataLab(gain, () => catchRound(next));
        }
    };
};

// ---- 6. PIRATE CANNON LAUNCHER ----------------------------------------------
// Pirate Scrappy fires his ship's cannon at the Bot Buccaneers' raft, ships and sea fort.
// Blocks only ever fall straight down (they never tip), which keeps every collapse predictable.
// Right answers fund the Shipwright's Armory between rounds.
const PIRATE_SEA = 296, PIRATE_DECK = 252;
const PIRATE_CANNON = { x: 140, y: 236 };
const PIRATE_GRAVITY = 0.3, PIRATE_FALL = 0.35;
const PIRATE_BLOCKS = {
    crate: { w: 34, h: 34, hp: 1, pts: 50 },
    plank: { w: 110, h: 12, hp: 1, pts: 40 },
    stone: { w: 34, h: 34, hp: 3, pts: 90 },
    barrel: { w: 26, h: 32, hp: 1, pts: 60 },
    chest: { w: 36, h: 26, hp: 1, pts: 150 },
    bot: { w: 30, h: 28, hp: 1, pts: 250 },
    captain: { w: 50, h: 46, hp: 6, pts: 900 }
};
const PIRATE_SKIES = [
    { name: 'Dawn Raid', top: '#1e3a8a', mid: '#f472b6', low: '#fdba74', sea: ['#0e7490', '#082f49'], sun: { x: 300, y: 262, r: 34, c: '#fde68a' }, gulls: true },
    { name: 'High Noon', top: '#0369a1', mid: '#38bdf8', low: '#e0f2fe', sea: ['#0284c7', '#0c4a6e'], sun: { x: 540, y: 54, r: 24, c: '#fef9c3' }, gulls: true },
    { name: 'Sunset Siege', top: '#3b0764', mid: '#db2777', low: '#fb923c', sea: ['#9f1239', '#1e1b4b'], sun: { x: 290, y: 280, r: 46, c: '#fb923c' } },
    { name: 'Storm Front', top: '#020617', mid: '#1e293b', low: '#475569', sea: ['#1e293b', '#020617'], storm: true },
    { name: 'Moonlit Fortress', top: '#020617', mid: '#1e1b4b', low: '#3730a3', sea: ['#1e1b4b', '#020617'], moon: { x: 470, y: 58, r: 20 }, stars: true }
];

// The Bot Buccaneers' base for each round: a platform plus a stack of blocks on it
function pirateLayout(i) {
    const blocks = [];
    const add = (t, cx, y, w) => { const d = PIRATE_BLOCKS[t], bw = w || d.w; blocks.push({ t, x: cx - bw / 2, y, w: bw, h: d.h, hp: d.hp, max: d.hp, vy: 0, hitAt: -1e9, seed: Math.random() * 9 }); };
    const col = (cx, y, ...types) => { types.forEach(t => { y -= PIRATE_BLOCKS[t].h; add(t, cx, y); }); return y; };   // stacks bottom-up, returns the top
    const plank = (cx, y, w) => { add('plank', cx, y - 12, w); return y - 12; };
    let base, y, p;
    switch (i % 5) {
        case 0:   // a log raft: two crate towers holding up a plank
            base = { x1: 440, x2: 610, y: 280, kind: 'raft' }; y = base.y;
            p = plank(525, col(468, y, 'crate', 'crate'), 150); col(582, y, 'crate', 'crate'); col(525, y, 'barrel');
            col(482, p, 'bot'); col(568, p, 'bot'); col(525, p, 'chest');
            break;
        case 1:   // a sloop
            base = { x1: 410, x2: 615, y: 262, kind: 'ship', masts: [528] }; y = base.y;
            col(432, col(432, y, 'crate', 'crate', 'crate'), 'bot'); col(466, y, 'barrel');
            col(498, y, 'crate'); col(540, y, 'crate');
            p = plank(519, y - 34, 90); col(519, p, 'bot'); col(480, p, 'chest');
            col(594, y, 'crate', 'crate', 'bot');
            break;
        case 2:   // a rocky island with a stone lookout
            base = { x1: 420, x2: 630, y: 252, kind: 'island' }; y = base.y;
            col(446, y, 'stone', 'stone'); col(526, y, 'stone', 'stone');
            p = plank(486, y - 68, 110); col(470, p, 'bot'); col(508, p, 'barrel');
            col(486, y, 'bot'); col(565, y, 'chest');
            col(604, y, 'crate', 'crate', 'crate', 'bot');
            break;
        case 3:   // a galleon in a storm
            base = { x1: 390, x2: 630, y: 258, kind: 'ship', masts: [452, 600] }; y = base.y;
            col(410, y, 'crate', 'stone', 'bot'); col(446, y, 'barrel');
            col(492, y, 'stone', 'stone'); col(578, y, 'stone', 'stone');
            p = plank(535, y - 68, 130); col(505, p, 'bot'); col(560, p, 'crate', 'bot');
            col(535, y, 'chest'); col(614, y, 'barrel');
            break;
        default:  // Captain Bolt's sea fortress
            base = { x1: 400, x2: 632, y: 250, kind: 'fort' }; y = base.y;
            col(424, y, 'stone', 'stone', 'bot'); col(462, y, 'barrel');
            col(512, y, 'stone', 'stone', 'stone'); col(600, y, 'stone', 'stone', 'stone');
            p = plank(556, y - 102, 130); col(556, p, 'captain'); col(510, p, 'bot'); col(604, p, 'chest');
            col(556, y, 'barrel', 'crate');
    }
    return { base, blocks };
}

// ---- Pirate art (all canvas shapes) ----
function drawPirateSky(ctx, sky, t, clouds, stars, wind) {
    const g = ctx.createLinearGradient(0, 0, 0, PIRATE_SEA);
    g.addColorStop(0, sky.top); g.addColorStop(0.6, sky.mid); g.addColorStop(1, sky.low);
    ctx.fillStyle = g; ctx.fillRect(-12, -12, 664, PIRATE_SEA + 12);
    if (sky.stars) stars.forEach(s => { ctx.globalAlpha = 0.4 + 0.4 * Math.sin(t / 500 + s.tw); ctx.fillStyle = '#e0e7ff'; ctx.fillRect(s.x, s.y, s.size, s.size); });
    ctx.globalAlpha = 1;
    const orb = (o, color, glow) => {
        const halo = ctx.createRadialGradient(o.x, o.y, o.r * 0.6, o.x, o.y, o.r * 3.2);
        halo.addColorStop(0, glow); halo.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = halo; ctx.fillRect(o.x - o.r * 3.2, o.y - o.r * 3.2, o.r * 6.4, o.r * 6.4);
        ctx.fillStyle = color; ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2); ctx.fill();
    };
    if (sky.sun) orb(sky.sun, sky.sun.c, 'rgba(254,215,170,.45)');
    if (sky.moon) {
        orb(sky.moon, '#f1f5f9', 'rgba(199,210,254,.3)');
        ctx.fillStyle = 'rgba(148,163,184,.45)';
        [[-6, -4, 4], [5, 5, 3], [3, -8, 2]].forEach(([dx, dy, r]) => { ctx.beginPath(); ctx.arc(sky.moon.x + dx, sky.moon.y + dy, r, 0, Math.PI * 2); ctx.fill(); });
    }
    // Distant islands
    ctx.fillStyle = sky.storm || sky.stars ? 'rgba(2,6,23,.55)' : 'rgba(30,41,59,.28)';
    ctx.beginPath(); ctx.moveTo(180, PIRATE_SEA);
    ctx.quadraticCurveTo(230, PIRATE_SEA - 34, 280, PIRATE_SEA - 12); ctx.quadraticCurveTo(310, PIRATE_SEA - 26, 350, PIRATE_SEA); ctx.fill();
    ctx.beginPath(); ctx.moveTo(560, PIRATE_SEA); ctx.quadraticCurveTo(610, PIRATE_SEA - 22, 660, PIRATE_SEA); ctx.fill();
    // Clouds drift with the wind
    clouds.forEach(c => {
        c.x += (0.12 + wind * 6) * 1;
        if (c.x > 720) c.x = -100; if (c.x < -110) c.x = 710;
        ctx.fillStyle = sky.storm ? 'rgba(51,65,85,.85)' : sky.stars ? 'rgba(148,163,184,.18)' : 'rgba(255,255,255,.7)';
        [[0, 0, 1], [22, -8, 1.25], [46, 0, 0.95], [24, 6, 1.1]].forEach(([dx, dy, k]) => { ctx.beginPath(); ctx.arc(c.x + dx * c.s, c.y + dy * c.s, 16 * k * c.s, 0, Math.PI * 2); ctx.fill(); });
    });
}

function drawPirateSea(ctx, sky, t, front) {
    if (!front) {
        const g = ctx.createLinearGradient(0, PIRATE_SEA, 0, 360);
        g.addColorStop(0, sky.sea[0]); g.addColorStop(1, sky.sea[1]);
        ctx.fillStyle = g; ctx.fillRect(-12, PIRATE_SEA, 664, 80);
        const glint = sky.sun || sky.moon;
        if (glint) {
            ctx.fillStyle = sky.moon ? 'rgba(224,231,255,.25)' : 'rgba(254,243,199,.35)';
            for (let i = 0; i < 6; i++) { const w = 40 - i * 5 + Math.sin(t / 300 + i) * 6; ctx.fillRect(glint.x - w / 2, PIRATE_SEA + 4 + i * 9, w, 2); }
        }
        ctx.strokeStyle = 'rgba(255,255,255,.16)'; ctx.lineWidth = 1.5;
        for (let k = 0; k < 4; k++) {
            const wy = PIRATE_SEA + 10 + k * 15;
            ctx.beginPath();
            for (let x = -10; x <= 650; x += 10) { const yy = wy + Math.sin(x / 26 + t / 420 + k * 1.7) * 2.2; x === -10 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); }
            ctx.stroke();
        }
        return;
    }
    // Front wave band laps over the hulls so they look like they sit in the water
    ctx.fillStyle = sky.sea[0]; ctx.globalAlpha = 0.78;
    ctx.beginPath(); ctx.moveTo(-10, 370);
    for (let x = -10; x <= 650; x += 8) ctx.lineTo(x, PIRATE_SEA + 3 + Math.sin(x / 22 + t / 360) * 3);
    ctx.lineTo(650, 370); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1; ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = -10; x <= 650; x += 8) { const yy = PIRATE_SEA + 3 + Math.sin(x / 22 + t / 360) * 3; x === -10 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); }
    ctx.stroke();
}

// Black sail with the Bot Buccaneers' red robot skull
function drawBotSail(ctx, mx, top, h, t) {
    ctx.fillStyle = '#3f2a14'; ctx.fillRect(mx - 3, top, 6, h);
    ctx.fillStyle = '#5b3a1a'; ctx.fillRect(mx - 30, top + 16, 60, 4);
    const sw = Math.sin(t / 500) * 4;
    ctx.fillStyle = '#111827'; ctx.strokeStyle = '#020617'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(mx - 28, top + 20); ctx.lineTo(mx + 28, top + 20);
    ctx.quadraticCurveTo(mx + 34 + sw, top + 50, mx + 26, top + 82); ctx.lineTo(mx + 14, top + 76); ctx.lineTo(mx + 4, top + 84); ctx.lineTo(mx - 8, top + 77);
    ctx.lineTo(mx - 26, top + 82); ctx.quadraticCurveTo(mx - 22 + sw, top + 50, mx - 28, top + 20); ctx.closePath(); ctx.fill(); ctx.stroke();
    // Robot skull: square head, glowing eyes, crossed bolts
    const sx = mx + 2, sy = top + 46;
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(sx - 14, sy - 12); ctx.lineTo(sx + 14, sy + 14); ctx.moveTo(sx + 14, sy - 12); ctx.lineTo(sx - 14, sy + 14); ctx.stroke();
    ctx.fillStyle = '#e5e7eb'; roundRect(ctx, sx - 9, sy - 9, 18, 16, 4); ctx.fill();
    ctx.fillStyle = '#dc2626'; ctx.fillRect(sx - 6, sy - 4, 4, 4); ctx.fillRect(sx + 2, sy - 4, 4, 4);
    ctx.fillStyle = '#111827'; ctx.fillRect(sx - 4, sy + 3, 8, 2);
    // Pennant
    ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.moveTo(mx, top); ctx.lineTo(mx - 16, top + 5 + Math.sin(t / 200) * 2); ctx.lineTo(mx, top + 9); ctx.fill();
}

// The enemy platform. Back parts (masts, palm) go behind the blocks; the rest is drawn in front of the sky.
function drawPirateBase(ctx, base, t, back) {
    const { x1, x2, y, kind } = base;
    if (back) {
        if (kind === 'ship') base.masts.forEach(mx => drawBotSail(ctx, mx, y - 160, 160, t));
        if (kind === 'island') {
            // Palm tree
            const px = x2 - 26;
            ctx.strokeStyle = '#78350f'; ctx.lineWidth = 6; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(px, y); ctx.quadraticCurveTo(px + 14, y - 60, px + 4, y - 112); ctx.stroke();
            ctx.fillStyle = '#15803d';
            for (let i = 0; i < 6; i++) {
                const a = -Math.PI / 2 + (i - 2.5) * 0.55 + Math.sin(t / 700 + i) * 0.05;
                ctx.beginPath(); ctx.ellipse(px + 4 + Math.cos(a) * 22, y - 112 + Math.sin(a) * 12 + 8, 26, 6, a, 0, Math.PI * 2); ctx.fill();
            }
        }
        if (kind === 'fort') {
            // Watchtower with the Bot Buccaneer flag
            ctx.fillStyle = '#334155'; ctx.fillRect(x2 - 30, y - 180, 26, 180);
            ctx.fillStyle = '#1e293b'; for (let i = 0; i < 3; i++) ctx.fillRect(x2 - 32 + i * 10, y - 188, 7, 8);
            ctx.fillStyle = '#fbbf24'; ctx.globalAlpha = 0.6 + 0.4 * Math.sin(t / 300); ctx.fillRect(x2 - 21, y - 162, 8, 12); ctx.globalAlpha = 1;
            ctx.fillStyle = '#3f2a14'; ctx.fillRect(x2 - 18, y - 226, 3, 40);
            ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.moveTo(x2 - 15, y - 226); ctx.quadraticCurveTo(x2 - 2, y - 222 + Math.sin(t / 220) * 3, x2 + 6, y - 218); ctx.lineTo(x2 - 15, y - 208); ctx.fill();
            ctx.fillStyle = '#ef4444'; ctx.fillRect(x2 - 9, y - 220, 5, 5);
        }
        return;
    }
    if (kind === 'raft') {
        for (let x = x1 - 6; x < x2 + 6; x += 17) {
            const g = ctx.createLinearGradient(0, y, 0, y + 16);
            g.addColorStop(0, '#a16207'); g.addColorStop(1, '#713f12');
            ctx.fillStyle = g; roundRect(ctx, x, y, 16, 18, 7); ctx.fill();
            ctx.strokeStyle = '#422006'; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.fillStyle = '#d6a35c'; ctx.beginPath(); ctx.ellipse(x + 8, y + 3, 6, 2.5, 0, 0, Math.PI * 2); ctx.fill();
        }
        ctx.strokeStyle = '#fde68a'; ctx.lineWidth = 2;
        [x1 + 20, x2 - 20].forEach(rx => { ctx.beginPath(); ctx.moveTo(rx, y + 2); ctx.lineTo(rx + 4, y + 16); ctx.stroke(); });
    } else if (kind === 'ship') {
        const hull = ctx.createLinearGradient(0, y, 0, PIRATE_SEA + 24);
        hull.addColorStop(0, '#7c2d12'); hull.addColorStop(1, '#3b1406');
        ctx.fillStyle = hull; ctx.strokeStyle = '#1c0a03'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x1 - 34, y - 14); ctx.quadraticCurveTo(x1 - 4, PIRATE_SEA + 4, x1 + 26, PIRATE_SEA + 24);
        ctx.lineTo(x2 - 10, PIRATE_SEA + 24); ctx.quadraticCurveTo(x2 + 12, PIRATE_SEA, x2 + 16, y - 22); ctx.lineTo(x2 + 16, y); ctx.lineTo(x1 - 20, y);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1;
        for (let py = y + 9; py < PIRATE_SEA + 20; py += 9) { ctx.beginPath(); ctx.moveTo(x1 - 8, py); ctx.lineTo(x2 + 6, py); ctx.stroke(); }
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(x1 - 24, y - 2, x2 - x1 + 40, 3);
        // Gun ports with red robot eyes peeking out
        for (let gx = x1 + 20; gx < x2 - 10; gx += 48) {
            ctx.fillStyle = '#0b0503'; roundRect(ctx, gx, y + 12, 16, 12, 2); ctx.fill();
            ctx.fillStyle = '#ef4444'; ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t / 250 + gx); ctx.fillRect(gx + 3, y + 16, 3, 3); ctx.fillRect(gx + 10, y + 16, 3, 3); ctx.globalAlpha = 1;
        }
    } else if (kind === 'island') {
        ctx.fillStyle = '#57534e'; ctx.beginPath(); ctx.moveTo(x1 - 30, PIRATE_SEA + 10); ctx.quadraticCurveTo(x1 - 16, y + 4, x1 + 8, y); ctx.lineTo(x2, y); ctx.quadraticCurveTo(x2 + 24, y + 10, x2 + 30, PIRATE_SEA + 10); ctx.closePath(); ctx.fill();
        const sand = ctx.createLinearGradient(0, y - 4, 0, y + 12);
        sand.addColorStop(0, '#fde68a'); sand.addColorStop(1, '#d97706');
        ctx.fillStyle = sand; ctx.beginPath(); ctx.moveTo(x1 - 4, y + 8); ctx.quadraticCurveTo(x1, y - 2, x1 + 14, y); ctx.lineTo(x2 - 6, y); ctx.quadraticCurveTo(x2 + 10, y, x2 + 12, y + 10); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#44403c';
        [[x1 + 30, PIRATE_SEA - 18, 18], [x2 - 40, PIRATE_SEA - 14, 22], [x1 + 110, PIRATE_SEA - 20, 14]].forEach(([rx, ry, r]) => { ctx.beginPath(); ctx.ellipse(rx, ry, r, r * 0.6, 0, 0, Math.PI * 2); ctx.fill(); });
    } else {
        // Fort: stone wall rising out of the sea
        const wall = ctx.createLinearGradient(0, y, 0, PIRATE_SEA + 20);
        wall.addColorStop(0, '#64748b'); wall.addColorStop(1, '#1e293b');
        ctx.fillStyle = wall; ctx.fillRect(x1 - 8, y, x2 - x1 + 16, PIRATE_SEA + 24 - y);
        ctx.strokeStyle = 'rgba(15,23,42,.55)'; ctx.lineWidth = 1;
        for (let r = 0, by = y; by < PIRATE_SEA + 20; by += 13, r++) {
            ctx.beginPath(); ctx.moveTo(x1 - 8, by); ctx.lineTo(x2 + 8, by); ctx.stroke();
            for (let bx = x1 - 8 + (r % 2) * 14; bx < x2 + 8; bx += 28) { ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + 13); ctx.stroke(); }
        }
        ctx.fillStyle = '#94a3b8'; ctx.fillRect(x1 - 10, y - 3, x2 - x1 + 20, 5);
    }
}

// One block. Damage shows as cracks; a fresh hit flashes white.
function drawPirateBlock(ctx, b, t) {
    const { x, y, w, h } = b, hit = t - b.hitAt < 110;
    ctx.save();
    if (b.t === 'crate' || b.t === 'plank') {
        const g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, '#d97706'); g.addColorStop(1, '#92400e');
        ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = '#451a03'; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
        ctx.lineWidth = 1.5;
        if (b.t === 'crate') {
            ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);
            ctx.beginPath(); ctx.moveTo(x + 5, y + h - 5); ctx.lineTo(x + w - 5, y + 5); ctx.stroke();
        } else {
            ctx.beginPath(); for (let px = x + 18; px < x + w; px += 26) { ctx.moveTo(px, y + 2); ctx.lineTo(px, y + h - 2); } ctx.stroke();
            ctx.fillStyle = '#1c1917'; for (let px = x + 6; px < x + w; px += 26) ctx.fillRect(px, y + h / 2 - 1, 2, 2);
        }
    } else if (b.t === 'stone') {
        const g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, '#9ca3af'); g.addColorStop(1, '#4b5563');
        ctx.fillStyle = g; roundRect(ctx, x, y, w, h, 3); ctx.fill();
        ctx.strokeStyle = '#1f2937'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w, y + h / 2); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h / 2); ctx.moveTo(x + w / 4, y + h / 2); ctx.lineTo(x + w / 4, y + h); ctx.stroke();
    } else if (b.t === 'barrel') {
        const g = ctx.createLinearGradient(x, 0, x + w, 0);
        g.addColorStop(0, '#7f1d1d'); g.addColorStop(0.45, '#dc2626'); g.addColorStop(1, '#7f1d1d');
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillRect(x + 1, y + 5, w - 2, h - 10);
        ctx.fillStyle = '#292524'; ctx.fillRect(x, y + 6, w, 3); ctx.fillRect(x, y + h - 9, w, 3);
        // Powder warning: a little flame mark
        ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.moveTo(x + w / 2, y + 11); ctx.quadraticCurveTo(x + w / 2 + 6, y + 17, x + w / 2, y + 22); ctx.quadraticCurveTo(x + w / 2 - 6, y + 17, x + w / 2, y + 11); ctx.fill();
        ctx.strokeStyle = '#a8a29e'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x + w / 2, y + 1); ctx.quadraticCurveTo(x + w / 2 + 5, y - 5, x + w / 2 + 2, y - 8); ctx.stroke();
        if (Math.sin(t / 90 + b.seed) > 0.2) { ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(x + w / 2 + 2, y - 8, 2, 0, Math.PI * 2); ctx.fill(); }
    } else if (b.t === 'chest') {
        ctx.fillStyle = '#78350f'; roundRect(ctx, x, y + 8, w, h - 8, 3); ctx.fill();
        ctx.fillStyle = '#92400e'; ctx.beginPath(); ctx.moveTo(x, y + 10); ctx.quadraticCurveTo(x + w / 2, y - 4, x + w, y + 10); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(x + 6, y + 3, 4, h - 3); ctx.fillRect(x + w - 10, y + 3, 4, h - 3); ctx.fillRect(x, y + 9, w, 3);
        ctx.fillStyle = '#fde68a'; roundRect(ctx, x + w / 2 - 4, y + 10, 8, 9, 2); ctx.fill();
        const sp = (t / 400 + b.seed) % 2;
        if (sp < 1) { ctx.fillStyle = `rgba(254,243,199,${1 - sp})`; ctx.fillRect(x + w * 0.75, y - 6 - sp * 6, 3, 3); }
    } else drawBotBuccaneer(ctx, b, t);
    // Cracks for damaged blocks
    if (b.hp < b.max && b.t !== 'bot' && b.t !== 'captain') {
        ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x + w * 0.3, y + 2); ctx.lineTo(x + w * 0.45, y + h * 0.4); ctx.lineTo(x + w * 0.35, y + h * 0.65);
        if (b.max - b.hp > 1) { ctx.moveTo(x + w * 0.75, y + h - 2); ctx.lineTo(x + w * 0.6, y + h * 0.55); ctx.lineTo(x + w * 0.7, y + h * 0.3); }
        ctx.stroke();
    }
    if (hit) { ctx.globalAlpha = 0.55; ctx.fillStyle = '#fff'; ctx.fillRect(x, y, w, h); }
    ctx.restore();
}

// A Bot Buccaneer (red robot with a bandana) or Captain Bolt (tricorn hat, eyepatch, health pips)
function drawBotBuccaneer(ctx, b, t) {
    const cap = b.t === 'captain', { x, y, w, h } = b, cx = x + w / 2;
    const bob = Math.sin(t / 260 + b.seed) * 1;
    ctx.save(); ctx.translate(0, bob);
    // Antenna
    ctx.strokeStyle = '#1f2937'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx + w * 0.22, y + 4); ctx.lineTo(cx + w * 0.3, y - 5); ctx.stroke();
    ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(cx + w * 0.3, y - 6, cap ? 3.5 : 2.5, 0, Math.PI * 2); ctx.fill();
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, cap ? '#b91c1c' : '#f87171'); g.addColorStop(1, cap ? '#450a0a' : '#991b1b');
    ctx.fillStyle = g; ctx.strokeStyle = '#1c0505'; ctx.lineWidth = 2;
    roundRect(ctx, x + 1, y + 3, w - 2, h - 3, cap ? 10 : 7); ctx.fill(); ctx.stroke();
    // Visor with angry eyes
    const vy = y + h * 0.42;
    ctx.fillStyle = '#111827'; roundRect(ctx, x + 5, vy - h * 0.16, w - 10, h * 0.34, 4); ctx.fill();
    ctx.save(); ctx.shadowColor = '#fde047'; ctx.shadowBlur = 6; ctx.fillStyle = '#fde047';
    const er = cap ? 4 : 2.6;
    ctx.beginPath(); ctx.moveTo(cx - w * 0.3, vy - er); ctx.lineTo(cx - w * 0.08, vy); ctx.lineTo(cx - w * 0.3, vy + er * 0.6); ctx.closePath(); ctx.fill();
    if (!cap) { ctx.beginPath(); ctx.moveTo(cx + w * 0.3, vy - er); ctx.lineTo(cx + w * 0.08, vy); ctx.lineTo(cx + w * 0.3, vy + er * 0.6); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    // Mouth grille
    ctx.fillStyle = '#1f2937'; for (let i = -2; i <= 2; i++) ctx.fillRect(cx + i * (w * 0.09) - 1, y + h * 0.74, 2, h * 0.14);
    if (cap) {
        // Eyepatch over the right eye, then the tricorn hat with a red skull
        ctx.fillStyle = '#0b0b0b'; ctx.beginPath(); ctx.ellipse(cx + w * 0.2, vy, 7, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#0b0b0b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 2, y + 12); ctx.lineTo(x + w - 2, vy - 2); ctx.stroke();
        ctx.fillStyle = '#111827'; ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(cx - 18, y + 4); ctx.quadraticCurveTo(cx - 18, y - 22, cx, y - 22); ctx.quadraticCurveTo(cx + 18, y - 22, cx + 18, y + 4); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(cx - 34, y - 6); ctx.quadraticCurveTo(cx - 20, y + 6, cx, y + 4); ctx.quadraticCurveTo(cx + 20, y + 6, cx + 34, y - 6); ctx.quadraticCurveTo(cx + 26, y + 12, cx, y + 11); ctx.quadraticCurveTo(cx - 26, y + 12, cx - 34, y - 6); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx - 32, y - 5); ctx.quadraticCurveTo(cx - 20, y + 6, cx, y + 4); ctx.quadraticCurveTo(cx + 20, y + 6, cx + 32, y - 5); ctx.stroke();
        ctx.fillStyle = '#ef4444'; roundRect(ctx, cx - 6, y - 15, 12, 10, 3); ctx.fill();
        ctx.fillStyle = '#111827'; ctx.fillRect(cx - 4, y - 12, 3, 3); ctx.fillRect(cx + 1, y - 12, 3, 3);
        // Health pips
        for (let i = 0; i < b.max; i++) { ctx.fillStyle = i < b.hp ? '#22c55e' : 'rgba(15,23,42,.6)'; roundRect(ctx, cx - b.max * 4.5 + i * 9, y - 34, 7, 5, 2); ctx.fill(); }
    } else {
        // Bandana with white dots and a flapping knot
        ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.moveTo(x + 1, y + 9); ctx.quadraticCurveTo(cx, y - 3, x + w - 1, y + 9); ctx.lineTo(x + w - 1, y + 11); ctx.lineTo(x + 1, y + 11); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#f8fafc'; [[-7, 5], [0, 3], [7, 5]].forEach(([dx, dy]) => ctx.fillRect(cx + dx - 1, y + dy, 2, 2));
        const f = Math.sin(t / 140 + b.seed) * 2;
        ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.moveTo(x + w - 2, y + 7); ctx.lineTo(x + w + 8, y + 4 + f); ctx.lineTo(x + w + 6, y + 12 + f); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
}

// Pirate Scrappy: tricorn hat, eyepatch, navy captain's coat and a robot parrot on his shoulder
function drawPirateScrappy(ctx, hx, hy, t, { mood = 'happy', firing = false }) {
    ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    // Legs and boots
    ctx.fillStyle = '#1f2937'; ctx.fillRect(hx - 8, hy + 30, 6, 10); ctx.fillRect(hx + 2, hy + 30, 6, 10);
    ctx.fillStyle = '#0b0b0b'; roundRect(ctx, hx - 10, hy + 37, 9, 5, 2); ctx.fill(); roundRect(ctx, hx + 1, hy + 37, 9, 5, 2); ctx.fill();
    // Coat
    const coat = ctx.createLinearGradient(0, hy + 10, 0, hy + 34);
    coat.addColorStop(0, '#1d4ed8'); coat.addColorStop(1, '#1e3a8a');
    ctx.fillStyle = coat; ctx.strokeStyle = '#0b1020'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(hx - 11, hy + 11); ctx.lineTo(hx + 11, hy + 11); ctx.lineTo(hx + 14, hy + 33); ctx.lineTo(hx - 14, hy + 33); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.moveTo(hx - 4, hy + 11); ctx.lineTo(hx + 4, hy + 11); ctx.lineTo(hx, hy + 22); ctx.fill();
    ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(hx - 12, hy + 26); ctx.lineTo(hx + 12, hy + 20); ctx.stroke();
    ctx.fillStyle = '#fbbf24'; [hy + 15, hy + 29].forEach(by => { ctx.beginPath(); ctx.arc(hx + 6, by, 1.5, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = '#fbbf24'; ctx.fillRect(hx - 15, hy + 11, 7, 3); ctx.fillRect(hx + 8, hy + 11, 7, 3);   // epaulettes
    // Arm with the linstock (a lit fuse on a stick) reaching toward the cannon
    const reach = firing ? 1 : 0.55 + Math.sin(t / 500) * 0.05;
    const ax = hx + 12, ay = hy + 16, ex = ax + 16 * reach + 6, ey = ay - 2 + 8 * (1 - reach);
    ctx.strokeStyle = '#1e3a8a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#0b1020'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(ex, ey, 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#78350f'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(ex - 2, ey + 6); ctx.lineTo(ex + 8, ey - 12); ctx.stroke();
    ctx.save(); ctx.shadowColor = '#f97316'; ctx.shadowBlur = 10; ctx.fillStyle = Math.sin(t / 60) > 0 ? '#fde047' : '#fb923c';
    ctx.beginPath(); ctx.arc(ex + 8, ey - 13, firing ? 4 : 2.6, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    // Head
    drawScrappyHead(ctx, hx, hy, mood);
    // Eyepatch over his left eye: leather patch with a gold stitched rim and a strap
    ctx.strokeStyle = '#1c1917'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(hx - 15, hy - 6); ctx.lineTo(hx - 9, hy - 3); ctx.moveTo(hx - 1, hy - 4); ctx.lineTo(hx + 15, hy - 9); ctx.stroke();
    ctx.fillStyle = '#44200b'; ctx.strokeStyle = '#d97706'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(hx - 5, hy + 0.5, 5, 4.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // Tricorn hat
    ctx.fillStyle = '#111827'; ctx.strokeStyle = '#020617'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(hx - 13, hy - 11); ctx.quadraticCurveTo(hx - 14, hy - 31, hx, hy - 31); ctx.quadraticCurveTo(hx + 14, hy - 31, hx + 13, hy - 11); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hx - 25, hy - 21); ctx.quadraticCurveTo(hx - 17, hy - 10, hx, hy - 12); ctx.quadraticCurveTo(hx + 17, hy - 10, hx + 25, hy - 21);
    ctx.quadraticCurveTo(hx + 21, hy - 6, hx, hy - 7); ctx.quadraticCurveTo(hx - 21, hy - 6, hx - 25, hy - 21); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(hx - 24, hy - 20); ctx.quadraticCurveTo(hx - 17, hy - 10, hx, hy - 12); ctx.quadraticCurveTo(hx + 17, hy - 10, hx + 24, hy - 20); ctx.stroke();
    // Hat badge: Scrappy's own skull and crossed wrenches
    ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(hx - 6, hy - 25); ctx.lineTo(hx + 6, hy - 15); ctx.moveTo(hx + 6, hy - 25); ctx.lineTo(hx - 6, hy - 15); ctx.stroke();
    ctx.fillStyle = '#f8fafc'; roundRect(ctx, hx - 4.5, hy - 24.5, 9, 7, 2.5); ctx.fill();
    ctx.fillStyle = '#38bdf8'; ctx.fillRect(hx - 3, hy - 22.5, 2, 2); ctx.fillRect(hx + 1, hy - 22.5, 2, 2);
    // Robot parrot on his shoulder
    const px = hx - 15, py = hy + 6 + Math.sin(t / 220) * 1.2;
    ctx.fillStyle = '#22c55e'; ctx.strokeStyle = '#052e16'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(px, py, 5.5, 7, -0.25, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#16a34a'; ctx.beginPath(); ctx.moveTo(px + 2, py + 4); ctx.lineTo(px + 6, py + 13); ctx.lineTo(px - 1, py + 7); ctx.fill();
    ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.moveTo(px - 3, py - 8); ctx.lineTo(px - 1, py - 13); ctx.lineTo(px + 2, py - 8); ctx.fill();
    ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.moveTo(px - 5, py - 3); ctx.lineTo(px - 10, py - 1); ctx.lineTo(px - 5, py + 1); ctx.fill();
    ctx.fillStyle = '#0b1020'; ctx.fillRect(px - 3, py - 5, 3, 3); ctx.fillStyle = '#67e8f9'; ctx.fillRect(px - 2.5, py - 4.5, 1.5, 1.5);
    ctx.restore();
}

// Scrappy's ship on the left: hull, railing, mast with his sail, and a pennant showing the wind
function drawScrappyShip(ctx, t, bob, wind) {
    ctx.save(); ctx.translate(0, bob);
    // Mast and sail
    ctx.fillStyle = '#5b3a1a'; ctx.fillRect(44, 56, 6, PIRATE_DECK - 56);
    ctx.fillRect(14, 82, 66, 4);
    const sw = Math.sin(t / 600) * 3 + wind * 120;
    ctx.fillStyle = '#f8fafc'; ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(16, 86); ctx.lineTo(78, 86); ctx.quadraticCurveTo(86 + sw, 132, 76, 182); ctx.lineTo(18, 182); ctx.quadraticCurveTo(26 + sw, 132, 16, 86); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#2563eb'; ctx.beginPath(); ctx.arc(47 + sw / 3, 132, 15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f8fafc'; roundRect(ctx, 39 + sw / 3, 125, 16, 13, 4); ctx.fill();
    ctx.fillStyle = '#0b1020'; roundRect(ctx, 41 + sw / 3, 127, 12, 8, 3); ctx.fill();
    ctx.fillStyle = '#67e8f9'; ctx.fillRect(43 + sw / 3, 130, 2, 2); ctx.fillRect(49 + sw / 3, 130, 2, 2);
    // Crow's nest and the wind pennant
    ctx.fillStyle = '#78350f'; ctx.fillRect(36, 52, 22, 8);
    const len = 16 + Math.min(30, Math.abs(wind) * 700), dir = wind < -0.002 ? -1 : 1;
    ctx.fillStyle = '#2563eb'; ctx.beginPath(); ctx.moveTo(47, 34); ctx.lineTo(47 + dir * len, 38 + Math.sin(t / 150) * 2); ctx.lineTo(47, 43); ctx.fill();
    ctx.fillStyle = '#5b3a1a'; ctx.fillRect(45.5, 30, 3, 24);
    // Hull
    const hull = ctx.createLinearGradient(0, PIRATE_DECK, 0, PIRATE_SEA + 24);
    hull.addColorStop(0, '#a16207'); hull.addColorStop(1, '#422006');
    ctx.fillStyle = hull; ctx.strokeStyle = '#1c0a03'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-20, PIRATE_DECK - 6); ctx.lineTo(196, PIRATE_DECK); ctx.lineTo(214, PIRATE_DECK - 16);
    ctx.quadraticCurveTo(200, PIRATE_SEA + 6, 170, PIRATE_SEA + 24); ctx.lineTo(-20, PIRATE_SEA + 24); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 1;
    for (let py = PIRATE_DECK + 9; py < PIRATE_SEA + 20; py += 9) { ctx.beginPath(); ctx.moveTo(-20, py); ctx.lineTo(196 - (py - PIRATE_DECK) * 0.4, py); ctx.stroke(); }
    ctx.fillStyle = '#38bdf8'; ctx.fillRect(-20, PIRATE_DECK + 4, 214, 3);
    // Railing
    ctx.strokeStyle = '#78350f'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-20, PIRATE_DECK - 16); ctx.lineTo(100, PIRATE_DECK - 14); ctx.stroke();
    for (let rx = -10; rx < 100; rx += 14) { ctx.beginPath(); ctx.moveTo(rx, PIRATE_DECK - 15); ctx.lineTo(rx, PIRATE_DECK - 3); ctx.stroke(); }
    ctx.restore();
}

// The deck cannon: wooden carriage, two wheels, iron barrel that recoils when it fires
function drawPirateCannon(ctx, c, angle, recoil, heavy) {
    ctx.save();
    ctx.translate(c.x, c.y); ctx.rotate(angle); ctx.translate(-recoil * 9, 0);
    const g = ctx.createLinearGradient(0, -10, 0, 10);
    g.addColorStop(0, heavy ? '#64748b' : '#475569'); g.addColorStop(0.5, '#1f2937'); g.addColorStop(1, '#030712');
    ctx.fillStyle = g; ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-14, -10); ctx.lineTo(36, -7); ctx.lineTo(36, 7); ctx.lineTo(-14, 10); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(-14, 0, 10, Math.PI / 2, Math.PI * 1.5); ctx.fill();
    ctx.fillStyle = '#111827'; roundRect(ctx, 34, -9, 8, 18, 2); ctx.fill();
    ctx.fillStyle = '#fbbf24'; ctx.fillRect(4, -9, 3, 18); ctx.fillRect(22, -8, 3, 16);
    ctx.restore();
    // Carriage and wheels (do not rotate)
    ctx.fillStyle = '#92400e'; ctx.strokeStyle = '#451a03'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(c.x - 22, c.y + 16); ctx.lineTo(c.x - 16, c.y - 2); ctx.lineTo(c.x + 12, c.y + 2); ctx.lineTo(c.x + 20, c.y + 16); ctx.closePath(); ctx.fill(); ctx.stroke();
    [c.x - 12, c.x + 12].forEach(wx => {
        ctx.fillStyle = '#451a03'; ctx.beginPath(); ctx.arc(wx, c.y + 16, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#a16207'; ctx.beginPath(); ctx.arc(wx, c.y + 16, 2.5, 0, Math.PI * 2); ctx.fill();
    });
}

const PIRATE_UPGRADES = [
    { k: 'heavy', icon: '💣', name: 'Heavy Iron Shot', desc: '+1 damage per level (stone breaks faster)', costs: [100, 220] },
    { k: 'powder', icon: '🧨', name: 'Black Powder Kegs', desc: '+12% cannon power per level', costs: [80, 160] },
    { k: 'shells', icon: '💥', name: 'Explosive Shells', desc: 'Shots explode on impact (bigger blast at Lv 2)', costs: [150, 280] },
    { k: 'spyglass', icon: '🔭', name: 'Spyglass', desc: 'A longer aiming guide per level', costs: [60, 140] },
    { k: 'extra', icon: '⚓', name: 'Extra Cannonball', desc: '+1 shot every round, per level', costs: [120, 240] },
    { k: 'xp', icon: '🎓', name: 'Double XP', desc: 'Doubles the XP you earn from this lesson', costs: [200] },
    { k: 'mult', icon: '🌟', name: '2x Score', desc: 'Doubles every point you score', costs: [180] }
];

ARCADE_LOGIC.pirate = S => {
    const T = { credits: 0, sunk: 0, volleys: 0, report: null, lv: { heavy: 0, powder: 0, shells: 0, spyglass: 0, extra: 0, xp: 0, mult: 0 } };
    FX.preload(['robotDeath', 'crash', 'crumble', 'shopBuy', 'shieldPop', 'armorHit']);
    const scoreMult = () => (T.lv.mult ? 2 : 1) * S.combo.mult;

    function armory(gain, start) {
        const maxed = u => T.lv[u.k] >= u.costs.length;
        const upBtn = u => {
            const lvl = T.lv[u.k], max = u.costs.length;
            return `<button type="button" class="shop-btn" data-up="${u.k}" ${maxed(u) ? 'disabled' : ''}>
                ${u.icon} ${u.name}${max > 1 ? ` <em>Lv ${lvl}/${max}</em>` : ''} ${maxed(u) ? '✅' : `(${u.costs[lvl]} 💰)`}<small>${u.desc}</small></button>`;
        };
        const sky = PIRATE_SKIES[S.q % PIRATE_SKIES.length];
        S.stage.innerHTML = `
            <div class="quiz-game-card theme-pirate">
                <h2 class="shop-title">⚓ Shipwright's Armory</h2>
                ${gain ? `<p class="round-intro">✅ Correct! +${gain} credits${S.combo.streak > 1 ? ` (🔥 ${S.combo.streak} streak bonus)` : ''}</p>` : '<p class="round-intro">❌ No credits this time. Right answers (and treasure chests) earn credits.</p>'}
                ${T.report ? `<p class="canvas-instructions">Last battle: ${T.report}</p>` : ''}
                <p class="shop-credits">Next: <strong class="credit-highlight">${sky.name}</strong> · Credits: <strong class="credit-highlight">${T.credits} 💰</strong></p>
                <div class="armory-grid">${PIRATE_UPGRADES.map(upBtn).join('')}
                    <button type="button" class="shop-btn" data-volley ${T.volleys >= 3 ? 'disabled' : ''}>🎯 Grapeshot Volley <em>${T.volleys}/3</em> (70 💰)<small>Press V: your next shot fires three cannonballs</small></button>
                </div>
                <button type="button" class="btn-continue-shop" data-start-battle>Set Sail: Battle ${S.q + 1} →</button>
            </div>`;
        const spend = cost => {
            if (T.credits < cost) { toast(`Not enough credits. You need ${cost} 💰.`, 'warn'); return false; }
            T.credits -= cost; FX.sample('shopBuy');
            return true;
        };
        $$('[data-up]', S.stage).forEach(b => b.onclick = () => {
            const u = PIRATE_UPGRADES.find(x => x.k === b.dataset.up);
            if (maxed(u) || !spend(u.costs[T.lv[u.k]])) return;
            T.lv[u.k]++;
            if (u.k === 'xp') S.xpMult = 2;
            toast(`${u.name} fitted!`, 'success');
            armory(gain, start);
        });
        $('[data-volley]', S.stage).onclick = () => { if (T.volleys < 3 && spend(70)) { T.volleys++; armory(gain, start); } };
        const go = $('[data-start-battle]', S.stage);
        go.onclick = start;
        setTimeout(() => { if (document.body.contains(go)) go.focus({ preventScroll: true }); }, 400);
    }

    function battle(next) {
        const ri = S.q, sky = PIRATE_SKIES[ri % PIRATE_SKIES.length];
        const { base, blocks } = pirateLayout(ri);
        const botTotal = blocks.filter(b => b.t === 'bot' || b.t === 'captain').length;
        const bonusShot = S.combo.streak >= 3 ? 1 : 0;
        let shots = 3 + T.lv.extra + bonusShot;
        let sunk = 0, smashed = 0, chests = 0, cleared = false;
        const windMax = sky.storm ? 0.05 : ri >= 2 ? 0.032 : 0;
        const wind = windMax ? rand(-windMax, windMax) : 0;
        canvasRound(S, {
            title: '🏴‍☠️ Pirate Cannon', theme: 'theme-pirate', seconds: 75, skipSummary: true,
            intro: `${sky.name}: knock out all ${botTotal} Bot Buccaneers${base.kind === 'fort' ? ', including Captain Bolt' : ''}!${bonusShot ? ' 🔥 Streak bonus: +1 cannonball.' : ''}`,
            hint: 'Drag anywhere and pull back like a slingshot, then let go to fire · or Up/Down to aim, Left/Right for power, Space to fire · V: Grapeshot Volley',
            buttons: '<button type="button" class="game-btn" data-action="fire">💥 Fire (Space)</button><button type="button" class="game-btn" data-action="volley">🎯 Volley (V)</button>',
            onEnd: () => {
                T.sunk += sunk;
                T.report = `${sunk}/${botTotal} bots · ${smashed} blocks smashed · ${chests} treasure${cleared ? ' · fleet cleared!' : ''}`;
                next();
            },
            setup(api) {
                const { ctx, juice, keys, pointer } = api;
                const maxV = 13.5 * (1 + 0.12 * T.lv.powder);
                const dmg = 1 + T.lv.heavy, blast = [0, 46, 70][T.lv.shells];
                const clouds = Array.from({ length: 4 }, (_, i) => ({ x: i * 180 + rand(0, 60), y: rand(30, 110), s: rand(0.7, 1.2) }));
                const stars = sky.stars ? makeStars(70, 640, 220) : [];
                let angle = -0.6, power = 0.55, state = 'aim', settleMs = 0, endMs = 0;
                let balls = [], pending = [], booms = [], debris = [], drops = [], puffs = [], banners = [];
                let t = 0, recoil = 0, firing = 0, worried = 0, cheer = 0, shotHits = 0, volleyArmed = false, drag = null, bolt = 0;
                const alive = () => blocks.filter(b => !b.dead);
                const botsLeft = () => blocks.filter(b => !b.dead && (b.t === 'bot' || b.t === 'captain')).length;
                const bob = () => Math.sin(t / 700) * 1.6;
                const muzzle = () => ({ x: PIRATE_CANNON.x + Math.cos(angle) * 40, y: PIRATE_CANNON.y + bob() + Math.sin(angle) * 40 });
                const banner = (text, color) => banners.push({ text, color, life: 1600 });

                function fire() {
                    if (state !== 'aim' || shots <= 0) return;
                    shots--; shotHits = 0;
                    const m = muzzle(), v = power * maxV;
                    const spread = volleyArmed ? [-0.07, 0, 0.07] : [0];
                    if (volleyArmed) { volleyArmed = false; T.volleys--; }
                    balls = spread.map(s => ({ x: m.x, y: m.y, vx: Math.cos(angle + s) * v, vy: Math.sin(angle + s) * v, r: 8 + T.lv.heavy, life: 0, still: 0, done: false, trail: [] }));
                    state = 'flying'; recoil = 1; firing = 400;
                    for (let i = 0; i < 9; i++) puffs.push({ x: m.x, y: m.y, vx: Math.cos(angle) * rand(0.5, 2) + rand(-0.6, 0.6), vy: rand(-1, 0.3), r: rand(5, 10), life: 1 });
                    juice.burst(m.x, m.y, '#fbbf24', 12); juice.shake(7);
                    FX.play('explode');
                }
                function armVolley() {
                    if (state !== 'aim' || !T.volleys || volleyArmed) return;
                    volleyArmed = true; FX.play('power'); banner('GRAPESHOT LOADED!', '#fbbf24');
                }

                // Damage, destruction and explosions
                function damage(b, n) {
                    if (b.dead) return;
                    b.hp -= n; b.hitAt = t;
                    if (b.hp <= 0) destroy(b); else FX.sample('crumble');
                }
                function destroy(b, how) {
                    b.dead = true; smashed++; shotHits++;
                    recordBest('bestActionCombo', shotHits);
                    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
                    const bot = b.t === 'bot' || b.t === 'captain';
                    const pts = Math.round(PIRATE_BLOCKS[b.t].pts * scoreMult() * Math.min(3, 1 + (shotHits - 1) * 0.25));
                    S.score += pts;
                    const color = { crate: '#d97706', plank: '#b45309', stone: '#9ca3af', barrel: '#dc2626', chest: '#fbbf24', bot: '#f87171', captain: '#b91c1c' }[b.t];
                    for (let i = 0; i < (bot ? 10 : 7); i++) debris.push({ x: cx, y: cy, vx: rand(-3.5, 3.5), vy: rand(-5, -1), w: rand(4, 9), h: rand(3, 6), rot: rand(0, 6), vr: rand(-0.3, 0.3), color: i % 3 ? color : '#1f2937', life: 1 });
                    juice.burst(cx, cy, color, bot ? 22 : 12);
                    if (bot) {
                        sunk++; cheer = 900;
                        juice.text(cx, b.y - 8, how === 'sea' ? `SPLASH! +${pts}` : b.t === 'captain' ? `CAPTAIN BOLT DOWN! +${pts}` : `BOT DOWN! +${pts}`, '#fde68a');
                        FX.sample('robotDeath'); juice.shake(b.t === 'captain' ? 18 : 10);
                    } else if (b.t === 'chest') {
                        chests++; T.credits += 20;
                        juice.text(cx, b.y - 8, `TREASURE +${pts} +20 💰`, '#fde68a'); FX.sample('shopBuy');
                    } else {
                        if (shotHits <= 2) juice.text(cx, b.y, `+${pts}`, '#fef3c7');
                        if (b.t === 'barrel') pending.push({ at: t + 90, x: cx, y: cy, r: 56, dmg: 1, big: true });
                    }
                    if (shotHits >= 3 && shotHits % 2 === 1) FX.comboSound(shotHits);
                }
                function explode(e) {
                    booms.push({ x: e.x, y: e.y, r: e.r, life: 1 });
                    juice.burst(e.x, e.y, '#f97316', 26); juice.burst(e.x, e.y, '#fde047', 14); juice.shake(e.big ? 16 : 10);
                    FX.sample('crash');
                    alive().forEach(b => {
                        const px = clamp(e.x, b.x, b.x + b.w), py = clamp(e.y, b.y, b.y + b.h);
                        if (Math.hypot(e.x - px, e.y - py) <= e.r) damage(b, e.dmg);
                    });
                }
                function splash(x) {
                    for (let i = 0; i < 14; i++) drops.push({ x: x + rand(-8, 8), y: PIRATE_SEA, vx: rand(-1.6, 1.6), vy: rand(-5.5, -2), life: 1 });
                    FX.sample('shieldPop');
                }

                // Circle vs rectangle: push the ball out and return the contact normal
                function contact(ball, r) {
                    const px = clamp(ball.x, r.x, r.x + r.w), py = clamp(ball.y, r.y, r.y + r.h);
                    let dx = ball.x - px, dy = ball.y - py, d = Math.hypot(dx, dy);
                    if (d >= ball.r) return null;
                    if (d < 0.001) { dx = ball.vx > 0 ? -1 : 1; dy = 0; d = 1; }        // center inside: push back the way it came
                    const nx = dx / d, ny = dy / d;
                    ball.x = px + nx * ball.r; ball.y = py + ny * ball.r;
                    return { nx, ny };
                }
                function bounce(ball, n, rest = 0.3, fric = 0.82) {
                    const vn = ball.vx * n.nx + ball.vy * n.ny;
                    if (vn < 0) { ball.vx -= (1 + rest) * vn * n.nx; ball.vy -= (1 + rest) * vn * n.ny; }
                    ball.vx *= fric; ball.vy *= fric;
                }
                function stepBall(ball, h) {
                    ball.vy += PIRATE_GRAVITY * h; ball.vx += wind * h;
                    ball.x += ball.vx * h; ball.y += ball.vy * h;
                    const speed = Math.hypot(ball.vx, ball.vy);
                    for (const b of blocks) {
                        if (b.dead) continue;
                        const n = contact(ball, b);
                        if (!n) continue;
                        if (speed > 1.6 && t - b.hitAt > 120) {
                            if (blast) { damage(b, dmg); explode({ x: ball.x, y: ball.y, r: blast, dmg: 1 }); ball.done = true; return; }
                            damage(b, dmg);
                            if (b.dead && speed > 6.5) { ball.vx *= 0.72; ball.vy *= 0.72; continue; }    // smashes straight through
                            FX.sample('armorHit');
                        }
                        bounce(ball, n);
                    }
                    const plat = { x: base.x1, y: base.y, w: base.x2 - base.x1, h: PIRATE_SEA + 30 - base.y };
                    const n = contact(ball, plat);
                    if (n) {
                        if (blast && speed > 1.6) { explode({ x: ball.x, y: ball.y, r: blast, dmg: 1 }); ball.done = true; return; }
                        bounce(ball, n, 0.25, 0.8);
                    }
                    if (ball.y > PIRATE_SEA + 4) { splash(ball.x); ball.done = true; }
                    else if (ball.x > 700 || ball.x < -60) ball.done = true;
                }

                // Blocks only move straight down: each one rests on the highest surface under it
                function settleBlocks(dt) {
                    let moving = false;
                    const list = alive().sort((a, b) => (b.y + b.h) - (a.y + a.h));
                    list.forEach(b => {
                        if (b.dead) return;
                        const bottom = b.y + b.h;
                        let support = null, under = null;
                        if (b.x + b.w > base.x1 + 4 && b.x < base.x2 - 4 && base.y >= bottom - 0.5) support = base.y;
                        list.forEach(o => {
                            if (o === b || o.dead || o.y < bottom - 0.5) return;
                            if (Math.min(b.x + b.w, o.x + o.w) - Math.max(b.x, o.x) < 4) return;
                            if (support === null || o.y < support) { support = o.y; under = o; }
                        });
                        // Landing: blocks riding on a falling block move with it; the impact counts once it stops
                        const land = v => {
                            b.y = support - b.h;
                            if (under && under.vy > 0) { b.vy = under.vy; moving = true; return; }
                            b.vy = 0;
                            const limit = b.t === 'bot' ? 4.2 : b.t === 'captain' ? 6 : 6.5;
                            if (v > 3) { juice.burst(b.x + b.w / 2, support, '#d6d3d1', 6); FX.sample('crumble'); }
                            if (v > limit) damage(b, 1);
                        };
                        if (support !== null && support - bottom <= 0.5) { land(b.vy); return; }
                        moving = true;
                        b.vy += PIRATE_FALL * dt;
                        const ny = b.y + b.vy * dt;
                        if (support !== null && ny + b.h >= support) land(b.vy);
                        else {
                            b.y = ny;
                            if (b.y > PIRATE_SEA - b.h * 0.3) { splash(b.x + b.w / 2); destroy(b, 'sea'); }
                        }
                    });
                    return moving;
                }

                function aimPreview() {
                    const m = muzzle(), v = power * maxV;
                    let x = m.x, y = m.y, vx = Math.cos(angle) * v, vy = Math.sin(angle) * v;
                    const steps = [26, 40, 60][T.lv.spyglass];
                    for (let i = 0; i < steps; i++) {
                        for (let k = 0; k < 2; k++) { vy += PIRATE_GRAVITY; vx += wind; x += vx; y += vy; }
                        if (y > PIRATE_SEA || x > 650) break;
                        ctx.globalAlpha = 0.85 * (1 - i / steps);
                        ctx.fillStyle = volleyArmed ? '#fbbf24' : '#f8fafc';
                        ctx.beginPath(); ctx.arc(x, y, 2.6, 0, Math.PI * 2); ctx.fill();
                    }
                    ctx.globalAlpha = 1;
                    // Power gauge beside the cannon
                    const gx = 176, gy = 186;
                    ctx.fillStyle = 'rgba(2,6,23,.65)'; roundRect(ctx, gx, gy, 10, 52, 4); ctx.fill();
                    const pg = ctx.createLinearGradient(0, gy + 52, 0, gy);
                    pg.addColorStop(0, '#22c55e'); pg.addColorStop(0.6, '#fbbf24'); pg.addColorStop(1, '#ef4444');
                    ctx.fillStyle = pg; roundRect(ctx, gx + 2, gy + 50 - 48 * power, 6, 48 * power, 3); ctx.fill();
                    if (drag) {
                        ctx.strokeStyle = 'rgba(248,250,252,.5)'; ctx.setLineDash([4, 5]); ctx.lineWidth = 2;
                        ctx.beginPath(); ctx.moveTo(drag.x, drag.y); ctx.lineTo(pointer.x, pointer.y); ctx.stroke(); ctx.setLineDash([]);
                        ctx.fillStyle = 'rgba(248,250,252,.6)'; ctx.beginPath(); ctx.arc(drag.x, drag.y, 5, 0, Math.PI * 2); ctx.fill();
                    }
                }

                return {
                    tap(x, y) { if (state === 'aim') drag = { x, y }; },
                    key(code) { if (code === 'Space' || code === 'KeyF') fire(); if (code === 'KeyV') armVolley(); },
                    action(a) { if (a === 'fire') fire(); if (a === 'volley') armVolley(); },
                    frame(dt, ms) {
                        t += ms; recoil = Math.max(0, recoil - 0.08 * dt); firing -= ms; worried -= ms; cheer -= ms;
                        // Aiming: drag like a slingshot, or use the arrow keys
                        if (state === 'aim') {
                            if (keys.ArrowUp || keys.KeyW) angle -= 0.018 * dt;
                            if (keys.ArrowDown || keys.KeyS) angle += 0.018 * dt;
                            if (keys.ArrowRight || keys.KeyD) power += 0.01 * dt;
                            if (keys.ArrowLeft || keys.KeyA) power -= 0.01 * dt;
                            if (drag) {
                                const dx = drag.x - pointer.x, dy = drag.y - pointer.y, d = Math.hypot(dx, dy);
                                if (d > 8 && dx > 0) { angle = Math.atan2(dy, dx); power = clamp(d / 150, 0.25, 1); }
                                if (!pointer.down) { const pulled = d >= 14 && dx > 0; drag = null; if (pulled) fire(); }
                            }
                            angle = clamp(angle, -1.4, 0.2); power = clamp(power, 0.25, 1);
                        } else drag = null;

                        drawPirateSky(ctx, sky, t, clouds, stars, wind);
                        if (sky.storm && Math.random() < 0.004 * dt) bolt = 160;
                        drawPirateSea(ctx, sky, t, false);
                        drawPirateBase(ctx, base, t, true);
                        drawPirateBase(ctx, base, t, false);

                        // Physics
                        pending.filter(e => t >= e.at).forEach(explode);
                        pending = pending.filter(e => t < e.at);
                        balls.forEach(ball => {
                            if (ball.done) return;
                            const n = Math.max(1, Math.ceil(Math.hypot(ball.vx, ball.vy) * dt / 4)), h = dt / n;
                            for (let i = 0; i < n && !ball.done; i++) stepBall(ball, h);
                            ball.life += dt;
                            ball.still = Math.hypot(ball.vx, ball.vy) < 0.6 ? ball.still + dt : 0;
                            if (ball.still > 30 || ball.life > 600) ball.done = true;
                            ball.trail.push({ x: ball.x, y: ball.y }); if (ball.trail.length > 10) ball.trail.shift();
                        });
                        const moving = settleBlocks(dt);

                        alive().forEach(b => drawPirateBlock(ctx, b, t));
                        drawScrappyShip(ctx, t, bob(), wind);
                        ctx.save(); ctx.translate(0, bob());
                        drawPirateScrappy(ctx, 92, PIRATE_DECK - 41, t, { mood: worried > 0 ? 'worried' : cheer > 0 || firing > 0 ? 'happy' : 'focus', firing: firing > 0 });
                        ctx.restore();
                        drawPirateCannon(ctx, { x: PIRATE_CANNON.x, y: PIRATE_CANNON.y + bob() }, angle, recoil, T.lv.heavy > 0);
                        if (state === 'aim') aimPreview();
                        drawPirateSea(ctx, sky, t, true);

                        // Cannonballs with a smoky trail
                        balls.forEach(ball => {
                            if (ball.done) return;
                            ball.trail.forEach((p, i) => { ctx.globalAlpha = (i / ball.trail.length) * 0.35; ctx.fillStyle = '#e2e8f0'; ctx.beginPath(); ctx.arc(p.x, p.y, ball.r * (0.3 + i / 20), 0, Math.PI * 2); ctx.fill(); });
                            ctx.globalAlpha = 1;
                            const g = ctx.createRadialGradient(ball.x - 3, ball.y - 3, 1, ball.x, ball.y, ball.r);
                            g.addColorStop(0, blast ? '#fca5a5' : '#94a3b8'); g.addColorStop(1, blast ? '#7f1d1d' : '#0f172a');
                            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill();
                            if (blast) { ctx.fillStyle = Math.sin(t / 50) > 0 ? '#fde047' : '#f97316'; ctx.beginPath(); ctx.arc(ball.x - ball.vx * 0.6, ball.y - ball.vy * 0.6, 2.5, 0, Math.PI * 2); ctx.fill(); }
                        });
                        // Effects: smoke, explosions, flying debris, water drops
                        puffs.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.r += 0.35 * dt; p.life -= 0.022 * dt; ctx.globalAlpha = Math.max(0, p.life) * 0.5; ctx.fillStyle = '#cbd5e1'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); });
                        puffs = puffs.filter(p => p.life > 0);
                        booms.forEach(b => {
                            b.life -= 0.045 * dt;
                            const k = 1 - b.life;
                            ctx.globalAlpha = Math.max(0, b.life);
                            const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * (0.4 + k * 0.7));
                            g.addColorStop(0, '#fef9c3'); g.addColorStop(0.4, '#fb923c'); g.addColorStop(1, 'rgba(220,38,38,0)');
                            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.x, b.y, b.r * (0.4 + k * 0.7), 0, Math.PI * 2); ctx.fill();
                            ctx.strokeStyle = '#fde68a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(b.x, b.y, b.r * (0.5 + k), 0, Math.PI * 2); ctx.stroke();
                        });
                        booms = booms.filter(b => b.life > 0);
                        debris.forEach(d => {
                            d.vy += 0.25 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.rot += d.vr * dt; d.life -= 0.012 * dt;
                            if (d.y > PIRATE_SEA + 6) d.life = 0;
                            ctx.globalAlpha = Math.max(0, Math.min(1, d.life * 2));
                            ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.rot); ctx.fillStyle = d.color; ctx.fillRect(-d.w / 2, -d.h / 2, d.w, d.h); ctx.restore();
                        });
                        debris = debris.filter(d => d.life > 0);
                        drops.forEach(d => { d.vy += 0.25 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.life -= 0.03 * dt; ctx.globalAlpha = Math.max(0, d.life); ctx.fillStyle = '#e0f2fe'; ctx.beginPath(); ctx.arc(d.x, d.y, 2.2, 0, Math.PI * 2); ctx.fill(); });
                        drops = drops.filter(d => d.life > 0 && d.y < PIRATE_SEA + 10);
                        ctx.globalAlpha = 1;

                        // Storm: rain and lightning
                        if (sky.storm) {
                            ctx.strokeStyle = 'rgba(186,230,253,.35)'; ctx.lineWidth = 1;
                            ctx.beginPath();
                            for (let i = 0; i < 60; i++) { const rx = (i * 53 + t * 0.5) % 680 - 20, ry = (i * 97 + t * 0.9) % 380 - 20; ctx.moveTo(rx, ry); ctx.lineTo(rx + wind * 160 - 3, ry + 12); }
                            ctx.stroke();
                            if (bolt > 0) { bolt -= ms; ctx.fillStyle = `rgba(241,245,249,${(bolt / 160) * 0.35})`; ctx.fillRect(-12, -12, 664, 384); }
                        }

                        // Turn flow: flying -> blocks settle -> aim again, or the battle ends
                        if (state === 'flying' && balls.every(b => b.done)) { state = 'settle'; settleMs = 0; }
                        if (state === 'settle') {
                            settleMs = moving || pending.length || booms.length ? 0 : settleMs + ms;
                            if (settleMs > 450) {
                                if (!botsLeft()) {
                                    cleared = true; state = 'over'; endMs = 2200;
                                    const bonus = Math.round((300 + shots * 150) * scoreMult());
                                    S.score += bonus; cheer = 3000;
                                    banner(`FLEET SUNK! +${bonus}`, '#4ade80'); FX.play('win');
                                } else if (shots <= 0) {
                                    state = 'over'; endMs = 1800; worried = 2000;
                                    banner('OUT OF CANNONBALLS!', '#f87171'); FX.play('lose');
                                } else {
                                    state = 'aim';
                                    if (shotHits === 0) worried = 900;
                                }
                            }
                        }
                        if (state === 'over' && (endMs -= ms) <= 0) { state = 'done'; api.finish(); }

                        // On-canvas HUD: cannonballs left, wind, banners
                        for (let i = 0; i < shots; i++) {
                            const g = ctx.createRadialGradient(18 + i * 18, 18, 1, 20 + i * 18, 20, 7);
                            g.addColorStop(0, '#94a3b8'); g.addColorStop(1, '#020617');
                            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(20 + i * 18, 20, 7, 0, Math.PI * 2); ctx.fill();
                        }
                        if (volleyArmed) { ctx.font = '700 11px Inter, sans-serif'; ctx.fillStyle = '#fbbf24'; ctx.fillText('VOLLEY x3', 14, 42); }
                        if (shotHits >= 3 && state !== 'aim') {
                            ctx.font = '800 15px Boldonse, Orbitron, sans-serif'; ctx.textAlign = 'right'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(2,6,23,.75)';
                            ctx.strokeText(`SMASH CHAIN x${shotHits}`, 626, 26); ctx.fillStyle = '#fbbf24'; ctx.fillText(`SMASH CHAIN x${shotHits}`, 626, 26); ctx.textAlign = 'start';
                        }
                        if (wind) {
                            const wx = 320, wy = 18, len = 10 + Math.abs(wind) * 700, dir = Math.sign(wind);
                            ctx.fillStyle = 'rgba(2,6,23,.5)'; roundRect(ctx, wx - 54, wy - 11, 108, 22, 11); ctx.fill();
                            ctx.font = '700 11px Inter, sans-serif'; ctx.fillStyle = '#e0f2fe'; ctx.textAlign = 'center';
                            ctx.fillText('WIND', wx - 28, wy + 4);
                            ctx.strokeStyle = '#7dd3fc'; ctx.lineWidth = 2.5;
                            ctx.beginPath(); ctx.moveTo(wx + 14 - dir * len / 2, wy); ctx.lineTo(wx + 14 + dir * len / 2, wy);
                            ctx.lineTo(wx + 14 + dir * (len / 2 - 6), wy - 5); ctx.moveTo(wx + 14 + dir * len / 2, wy); ctx.lineTo(wx + 14 + dir * (len / 2 - 6), wy + 5); ctx.stroke();
                            ctx.textAlign = 'start';
                        }
                        banners.forEach((b, i) => {
                            b.life -= ms;
                            ctx.globalAlpha = Math.min(1, b.life / 400);
                            ctx.font = '800 22px Boldonse, Orbitron, sans-serif'; ctx.textAlign = 'center';
                            ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(2,6,23,.8)'; ctx.strokeText(b.text, 320, 120 + i * 30);
                            ctx.fillStyle = b.color; ctx.fillText(b.text, 320, 120 + i * 30);
                            ctx.textAlign = 'start'; ctx.globalAlpha = 1;
                        });
                        banners = banners.filter(b => b.life > 0);
                        api.hud(`Bots ${botTotal - botsLeft()}/${botTotal} · ${T.volleys ? `🎯${T.volleys} · ` : ''}${T.credits} 💰`);
                    },
                    summary: () => [`Bot Buccaneers knocked out: <strong>${sunk}/${botTotal}</strong>`, `Blocks smashed: <strong>${smashed}</strong>`, `Treasure chests: <strong>${chests}</strong>`, cleared ? '<strong>Fleet cleared!</strong>' : 'Some bots escaped this time.']
                };
            }
        });
    }

    return {
        status: () => `${T.sunk} bots sunk · ${T.credits} 💰`,
        round(ok, next) {
            const gain = ok ? 100 + (S.combo.streak - 1) * 25 : 0;
            T.credits += gain;
            armory(gain, () => battle(next));
        }
    };
};

// ---- 7. BLOCK BLAST ---------------------------------------------------------
// A classic 8x8 block puzzle with Scrappy as the grid engineer. Drag pieces from the tray
// (or pick with 1-4 and place with the arrow keys + Space). Full rows and columns clear.
// The board carries over between questions; right answers fund the Block Lab.
const BB_N = 8, BB_CELL = 38, BB_X = 20, BB_Y = 28;
const BB_COLORS = ['#22d3ee', '#60a5fa', '#a78bfa', '#f472b6', '#fb923c', '#4ade80', '#facc15'];
// 'X' = block, '.' = gap, '/' = new row. The number is how often the shape appears.
const BB_SHAPES = [
    ['X', 5], ['XX', 8], ['X/X', 8], ['XXX', 7], ['X/X/X', 7], ['XXXX', 4], ['X/X/X/X', 4], ['XXXXX', 2], ['X/X/X/X/X', 2],
    ['XX/XX', 8], ['XXX/XXX/XXX', 2], ['X./XX', 5], ['.X/XX', 5], ['XX/X.', 5], ['XX/.X', 5],
    ['X../X../XXX', 2], ['..X/..X/XXX', 2], ['XXX/X../X..', 2], ['XXX/..X/..X', 2],
    ['XXX/.X.', 4], ['.X./XXX', 4], ['X./XX/X.', 3], ['.X/XX/.X', 3],
    ['.XX/XX.', 3], ['XX./.XX', 3], ['X./X./XX', 3], ['.X/.X/XX', 3], ['XX/X./X.', 3], ['XX/.X/.X', 3]
].map(([s, w]) => ({ w, cells: s.split('/').flatMap((row, r) => [...row].map((ch, c) => (ch === 'X' ? [r, c] : null)).filter(Boolean)) }));
const bbDims = cells => ({ h: Math.max(...cells.map(c => c[0])) + 1, w: Math.max(...cells.map(c => c[1])) + 1 });
const bbRotate = cells => {
    const turned = cells.map(([r, c]) => [c, -r]);
    const minR = Math.min(...turned.map(c => c[0])), minC = Math.min(...turned.map(c => c[1]));
    return turned.map(([r, c]) => [r - minR, c - minC]);
};

// One glossy block. Gem blocks carry a gold diamond; corrupted blocks glitch.
function drawBBBlock(ctx, x, y, s, color, { gem = false, bad = false, alpha = 1, t = 0 } = {}) {
    ctx.save();
    ctx.globalAlpha = alpha;
    const fill = bad ? '#475569' : color;
    ctx.fillStyle = fill; roundRect(ctx, x + 1, y + 1, s - 2, s - 2, s * 0.2); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.25)'; roundRect(ctx, x + 2, y + s * 0.62, s - 4, s * 0.36 - 1, s * 0.16); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.38)'; roundRect(ctx, x + 4, y + 3, s - 8, s * 0.28, s * 0.12); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 1; roundRect(ctx, x + 1.5, y + 1.5, s - 3, s - 3, s * 0.2); ctx.stroke();
    const cx = x + s / 2, cy = y + s / 2;
    if (gem) {
        ctx.save(); ctx.shadowColor = '#fde68a'; ctx.shadowBlur = 10 + Math.sin(t / 200) * 4; ctx.fillStyle = '#fbbf24';
        const k = s * 0.22;
        ctx.beginPath(); ctx.moveTo(cx, cy - k); ctx.lineTo(cx + k * 0.8, cy); ctx.lineTo(cx, cy + k); ctx.lineTo(cx - k * 0.8, cy); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#fef9c3'; ctx.beginPath(); ctx.moveTo(cx, cy - k); ctx.lineTo(cx + k * 0.35, cy - k * 0.1); ctx.lineTo(cx - k * 0.35, cy - k * 0.1); ctx.closePath(); ctx.fill();
        ctx.restore();
    }
    if (bad) {
        for (let i = 0; i < 3; i++) { ctx.fillStyle = i % 2 ? 'rgba(239,68,68,.55)' : 'rgba(15,23,42,.5)'; ctx.fillRect(x + 3 + ((t / 50 + i * 9) % 5), y + 7 + i * (s / 4), s - 8, 2); }
        ctx.fillStyle = '#fecaca'; ctx.fillRect(cx - 1.5, cy - s * 0.2, 3, s * 0.24); ctx.fillRect(cx - 1.5, cy + s * 0.1, 3, 3);
    }
    ctx.restore();
}

const BB_UPGRADES = [
    { k: 'rotate', icon: '🔄', name: 'Rotator Module', desc: 'Press R (or the button) to rotate the selected piece', costs: [120] },
    { k: 'tray', icon: '🧰', name: 'Bigger Tray', desc: '4 pieces per tray instead of 3', costs: [150] },
    { k: 'gems', icon: '💎', name: 'Gem Finder', desc: 'More gem blocks (+10 credits each when cleared)', costs: [100] },
    { k: 'time', icon: '⏱️', name: 'Overclock', desc: '+15 seconds every round', costs: [80] },
    { k: 'xp', icon: '🎓', name: 'Double XP', desc: 'Doubles the XP you earn from this lesson', costs: [200] },
    { k: 'mult', icon: '🌟', name: '2x Score', desc: 'Doubles every point you score', costs: [150] }
];
const BB_SUPPLIES = [
    { k: 'bombs', icon: '💣', name: 'Neon Bomb', desc: 'Press B, then drop it to clear a 3x3 area', cost: 70, max: 3 },
    { k: 'lasers', icon: '🔦', name: 'Line Laser', desc: 'Press L, then pick a row to wipe it', cost: 90, max: 2 },
    { k: 'rerolls', icon: '🎲', name: 'Reroll', desc: 'Press X for a brand-new tray', cost: 40, max: 3 }
];

ARCADE_LOGIC.blockblast = S => {
    const T = {
        grid: Array.from({ length: BB_N }, () => Array(BB_N).fill(null)),
        credits: 0, lines: 0, bestCombo: 0, wipes: 0, report: null,
        bombs: 0, lasers: 0, rerolls: 0,
        lv: Object.fromEntries(BB_UPGRADES.map(u => [u.k, 0]))
    };
    FX.preload(['shopBuy', 'crash', 'blaster', 'orb', 'zone']);
    const scoreMult = () => (T.lv.mult ? 2 : 1) * S.combo.mult;

    function lab(gain, start) {
        const maxed = u => T.lv[u.k] >= u.costs.length;
        S.stage.innerHTML = `
            <div class="quiz-game-card theme-blockblast">
                <h2 class="shop-title">🧪 Block Lab</h2>
                ${gain ? `<p class="round-intro">✅ Correct! +${gain} credits${S.combo.streak > 1 ? ` (🔥 ${S.combo.streak} streak bonus)` : ''}</p>` : '<p class="round-intro">❌ No credits this time. Right answers (and gem blocks) earn credits.</p>'}
                ${T.report ? `<p class="canvas-instructions">Last round: ${T.report}</p>` : ''}
                <p class="shop-credits">Lines cleared: <strong class="credit-highlight">${T.lines}</strong> · Credits: <strong class="credit-highlight">${T.credits} 💰</strong></p>
                <div class="armory-grid">
                    ${BB_UPGRADES.map(u => `<button type="button" class="shop-btn" data-up="${u.k}" ${maxed(u) ? 'disabled' : ''}>${u.icon} ${u.name} ${maxed(u) ? '✅' : `(${u.costs[T.lv[u.k]]} 💰)`}<small>${u.desc}</small></button>`).join('')}
                    ${BB_SUPPLIES.map(s => `<button type="button" class="shop-btn" data-supply="${s.k}" ${T[s.k] >= s.max ? 'disabled' : ''}>${s.icon} ${s.name} <em>${T[s.k]}/${s.max}</em> (${s.cost} 💰)<small>${s.desc}</small></button>`).join('')}
                </div>
                <button type="button" class="btn-continue-shop" data-start-grid>Start Round ${S.q + 1} →</button>
            </div>`;
        const spend = cost => {
            if (T.credits < cost) { toast(`Not enough credits. You need ${cost} 💰.`, 'warn'); return false; }
            T.credits -= cost; FX.sample('shopBuy');
            return true;
        };
        $$('[data-up]', S.stage).forEach(b => b.onclick = () => {
            const u = BB_UPGRADES.find(x => x.k === b.dataset.up);
            if (maxed(u) || !spend(u.costs[T.lv[u.k]])) return;
            T.lv[u.k]++;
            if (u.k === 'xp') S.xpMult = 2;
            toast(`${u.name} installed!`, 'success');
            lab(gain, start);
        });
        $$('[data-supply]', S.stage).forEach(b => b.onclick = () => {
            const s = BB_SUPPLIES.find(x => x.k === b.dataset.supply);
            if (T[s.k] < s.max && spend(s.cost)) { T[s.k]++; lab(gain, start); }
        });
        const go = $('[data-start-grid]', S.stage);
        go.onclick = start;
        setTimeout(() => { if (document.body.contains(go)) go.focus({ preventScroll: true }); }, 400);
    }

    function gridRound(next) {
        const ri = S.q, grid = T.grid;
        grid.forEach(row => row.forEach(cell => { if (cell) cell.born = -1e9; }));     // blocks from earlier rounds are already settled
        const freeBomb = S.combo.streak >= 3;
        if (freeBomb) T.bombs++;
        let lines = 0, gems = 0, bestCombo = 0, wipes = 0;
        canvasRound(S, {
            title: '🧱 Block Blast', theme: 'theme-blockblast', seconds: 60 + T.lv.time * 15, skipSummary: true,
            intro: `Round ${S.q + 1}: fill rows and columns to clear them. Chain clears for combos!${freeBomb ? ' 🔥 Streak bonus: a free Neon Bomb.' : ''}${ri >= 2 ? ' Corrupted blocks have appeared. Clear them out!' : ''}`,
            hint: 'Drag a piece onto the grid · or 1-4 to pick, arrows to move, Space to place · R rotate · B bomb · L laser · X reroll',
            buttons: `<button type="button" class="game-btn" data-action="rotate" data-bb="rotate">🔄 Rotate (R)</button>
                <button type="button" class="game-btn" data-action="bomb" data-bb="bombs">💣 Bomb (B)</button>
                <button type="button" class="game-btn" data-action="laser" data-bb="lasers">🔦 Laser (L)</button>
                <button type="button" class="game-btn" data-action="reroll" data-bb="rerolls">🎲 Reroll (X)</button>`,
            onEnd: () => {
                T.report = `${lines} lines · best combo x${bestCombo} · ${gems} gems${wipes ? ` · ${wipes} grid wipe${wipes > 1 ? 's' : ''}!` : ''}`;
                next();
            },
            setup(api) {
                const { ctx, juice, pointer, card } = api;
                const slots = 3 + T.lv.tray;
                const slotW = 286 / slots;
                let tray = [], sel = 0, t = 0, mode = null, drag = false, cursor = { r: 3, c: 3 }, input = 'mouse', lastPX = null, lastPY = null;
                let combo = 0, sinceClear = 0, pops = [], beams = [], banners = [], speech = { text: "Let's build!", until: 2200 }, mood = 'happy', moodUntil = 0, over = false, jamMs = 0;
                const say = (text, m = 'happy', ms = 1800) => { speech = { text, until: t + ms }; mood = m; moodUntil = t + ms; };
                const banner = (text, color) => banners.push({ text, color, life: 1400 });

                function newPiece() {
                    let roll = Math.random() * BB_SHAPES.reduce((n, s) => n + s.w, 0), shape = BB_SHAPES[0];
                    for (const s of BB_SHAPES) { roll -= s.w; if (roll <= 0) { shape = s; break; } }
                    const cells = shape.cells.map(c => [...c]);
                    const gem = Math.random() < (T.lv.gems ? 0.38 : 0.18) ? Math.floor(Math.random() * cells.length) : -1;
                    return { cells, ...bbDims(cells), color: BB_COLORS[Math.floor(Math.random() * BB_COLORS.length)], gem };
                }
                const refill = () => { tray = Array.from({ length: slots }, newPiece); sel = 0; };
                const fits = (p, r0, c0) => p.cells.every(([r, c]) => r0 + r >= 0 && r0 + r < BB_N && c0 + c >= 0 && c0 + c < BB_N && !grid[r0 + r][c0 + c]);
                const fitsAnywhere = p => {
                    let cells = p.cells;
                    for (let k = 0; k < (T.lv.rotate ? 4 : 1); k++) {
                        const q = { cells, ...bbDims(cells) };
                        for (let r = 0; r <= BB_N - q.h; r++) for (let c = 0; c <= BB_N - q.w; c++) if (fits(q, r, c)) return true;
                        cells = bbRotate(cells);
                    }
                    return false;
                };
                const live = () => tray.map((p, i) => (p ? i : -1)).filter(i => i >= 0);

                // Corrupted data shows up from round 3, never completing a line by itself
                if (ri >= 2) {
                    let n = (ri - 1) * 2, guard = 0;
                    while (n > 0 && guard++ < 200) {
                        const r = Math.floor(Math.random() * BB_N), c = Math.floor(Math.random() * BB_N);
                        if (grid[r][c]) continue;
                        grid[r][c] = { color: '#475569', bad: true, born: 0 };
                        if (grid[r].every(Boolean) || grid.every(row => row[c])) { grid[r][c] = null; continue; }
                        n--;
                    }
                }
                refill();
                // If nothing fits at the start, Scrappy defragments the three fullest rows
                if (!tray.some(fitsAnywhere)) {
                    [...grid.keys()].sort((a, b) => grid[b].filter(Boolean).length - grid[a].filter(Boolean).length).slice(0, 3).forEach(r => {
                        for (let c = 0; c < BB_N; c++) if (grid[r][c]) { pops.push({ r, c, color: grid[r][c].color, life: 1 }); grid[r][c] = null; }
                        beams.push({ row: r, life: 1 });
                    });
                    say('Defragged the grid!', 'focus', 2400);
                }

                const updateButtons = () => {
                    $$('[data-bb]', card).forEach(b => {
                        const k = b.dataset.bb;
                        if (k === 'rotate') { b.hidden = !T.lv.rotate; return; }
                        const n = T[k];
                        b.disabled = !n;
                        b.classList.toggle('armed', (k === 'bombs' && mode === 'bomb') || (k === 'lasers' && mode === 'laser'));
                        b.lastChild.textContent = b.lastChild.textContent.replace(/ ×\d+$/, '') + ` ×${n}`;
                    });
                };
                updateButtons();

                function checkJam() {
                    if (over || !live().length) return;
                    if (live().some(i => fitsAnywhere(tray[i])) || T.bombs || T.lasers || T.rerolls) return;
                    over = true; jamMs = 1600;
                    banner('GRID JAMMED!', '#f87171'); say('No room left!', 'worried', 3000); FX.play('lose');
                }

                // Clears every full row and column at once (so crossings both count)
                function resolveLines() {
                    const rows = [], cols = [];
                    for (let r = 0; r < BB_N; r++) if (grid[r].every(Boolean)) rows.push(r);
                    for (let c = 0; c < BB_N; c++) if (grid.every(row => row[c])) cols.push(c);
                    const n = rows.length + cols.length;
                    if (!n) return 0;
                    const hit = new Set();
                    rows.forEach(r => { for (let c = 0; c < BB_N; c++) hit.add(r * BB_N + c); beams.push({ row: r, life: 1 }); });
                    cols.forEach(c => { for (let r = 0; r < BB_N; r++) hit.add(r * BB_N + c); beams.push({ col: c, life: 1 }); });
                    let gemHits = 0;
                    hit.forEach(k => {
                        const r = Math.floor(k / BB_N), c = k % BB_N, cell = grid[r][c];
                        if (cell.gem) gemHits++;
                        pops.push({ r, c, color: cell.color, life: 1 });
                        juice.burst(BB_X + c * BB_CELL + BB_CELL / 2, BB_Y + r * BB_CELL + BB_CELL / 2, cell.bad ? '#94a3b8' : cell.color, 4);
                        grid[r][c] = null;
                    });
                    return { n, gemHits };
                }
                function payGems(n) {
                    if (!n) return;
                    gems += n; T.credits += n * 10; S.score += n * 50 * scoreMult();
                    juice.text(BB_X + 152, BB_Y + 140, `+${n * 10} 💰 GEMS`, '#fde68a'); FX.sample('shopBuy');
                }

                function place(p, r0, c0) {
                    p.cells.forEach(([r, c], i) => { grid[r0 + r][c0 + c] = { color: p.color, gem: i === p.gem, born: t }; });
                    S.score += Math.round(p.cells.length * 10 * scoreMult());
                    tray[tray.indexOf(p)] = null;
                    FX.play('hit');
                    const res = resolveLines();
                    if (res) {
                        combo = sinceClear <= 3 ? combo + 1 : 1; sinceClear = 0;
                        bestCombo = Math.max(bestCombo, combo); T.bestCombo = Math.max(T.bestCombo, combo);
                        recordBest('bestActionCombo', combo);
                        lines += res.n; T.lines += res.n;
                        const comboMult = Math.min(4, 1 + (combo - 1) * 0.5);
                        const pts = Math.round((100 * res.n + 80 * res.n * (res.n - 1)) * comboMult * scoreMult());
                        S.score += pts;
                        juice.text(BB_X + 152, BB_Y + 120, `+${pts}`, '#67e8f9'); juice.shake(4 + res.n * 3);
                        payGems(res.gemHits);
                        if (res.n >= 2) banner(res.n >= 4 ? 'MEGA BLAST!' : res.n === 3 ? 'TRIPLE CLEAR!' : 'DOUBLE CLEAR!', '#fbbf24');
                        if (combo >= 2) { say(`Combo x${combo}!`, 'happy'); FX.comboSound(combo * 2); } else { say(['Nice clear!', 'Clean!', 'Blasted!', 'Great fit!'][Math.floor(Math.random() * 4)], 'happy', 1200); FX.sample('orb'); }
                        if (grid.every(row => row.every(v => !v))) {
                            wipes++; T.wipes++;
                            const bonus = Math.round(1500 * scoreMult()); S.score += bonus;
                            banner(`GRID WIPE! +${bonus}`, '#4ade80'); FX.play('win'); juice.shake(16);
                        }
                    } else if (++sinceClear > 3 && combo) { combo = 0; }
                    if (!live().length) refill();
                    if (!tray[sel]) sel = live()[0] ?? 0;
                    checkJam();
                }

                function bomb(r, c) {
                    let blasted = 0, gemHits = 0;
                    for (let br = r - 1; br <= r + 1; br++) for (let bc = c - 1; bc <= c + 1; bc++) {
                        if (br < 0 || bc < 0 || br >= BB_N || bc >= BB_N || !grid[br][bc]) continue;
                        if (grid[br][bc].gem) gemHits++;
                        pops.push({ r: br, c: bc, color: grid[br][bc].color, life: 1 }); grid[br][bc] = null; blasted++;
                    }
                    T.bombs--; mode = null;
                    S.score += Math.round((50 + blasted * 40) * scoreMult());
                    juice.burst(BB_X + c * BB_CELL + 19, BB_Y + r * BB_CELL + 19, '#fbbf24', 30); juice.shake(14);
                    FX.sample('crash'); say('Boom!', 'happy', 1000);
                    payGems(gemHits); updateButtons(); checkJam();
                }
                function laser(r) {
                    let gemHits = 0;
                    for (let c = 0; c < BB_N; c++) if (grid[r][c]) { if (grid[r][c].gem) gemHits++; pops.push({ r, c, color: grid[r][c].color, life: 1 }); grid[r][c] = null; }
                    beams.push({ row: r, life: 1, laser: true });
                    T.lasers--; mode = null;
                    S.score += Math.round(100 * scoreMult());
                    FX.sample('blaster'); juice.shake(6); say('Row wiped!', 'focus', 1000);
                    payGems(gemHits); updateButtons(); checkJam();
                }

                function act(a) {
                    if (over) return;
                    if (a === 'rotate' && T.lv.rotate && tray[sel]) { const p = tray[sel]; p.cells = bbRotate(p.cells); Object.assign(p, bbDims(p.cells)); FX.play('shoot'); }
                    if (a === 'bomb' && T.bombs) { mode = mode === 'bomb' ? null : 'bomb'; say(mode ? 'Drop the bomb on the grid!' : 'Bomb put away.', 'focus', 1500); }
                    if (a === 'laser' && T.lasers) { mode = mode === 'laser' ? null : 'laser'; say(mode ? 'Pick a row to wipe!' : 'Laser off.', 'focus', 1500); }
                    if (a === 'reroll' && T.rerolls) { T.rerolls--; refill(); FX.sample('zone'); say('Fresh pieces!', 'happy', 1200); checkJam(); }
                    updateButtons();
                }
                const target = () => {
                    if (input === 'key') return { r: cursor.r, c: cursor.c, centered: true };
                    return { r: Math.floor((pointer.y - BB_Y) / BB_CELL), c: Math.floor((pointer.x - BB_X) / BB_CELL), px: pointer.x, py: pointer.y };
                };
                const onGrid = () => pointer.x >= BB_X - 10 && pointer.x <= BB_X + BB_N * BB_CELL + 10 && pointer.y >= BB_Y - 10 && pointer.y <= BB_Y + BB_N * BB_CELL + 10;
                // Top-left cell for the selected piece, centered on the pointer or the keyboard cursor
                const anchor = p => {
                    if (input === 'key') return { r0: cursor.r - Math.floor((p.h - 1) / 2), c0: cursor.c - Math.floor((p.w - 1) / 2) };
                    return { r0: Math.round((pointer.y - BB_Y) / BB_CELL - p.h / 2), c0: Math.round((pointer.x - BB_X) / BB_CELL - p.w / 2) };
                };
                function commit() {
                    if (over) return;
                    const tg = target();
                    if (mode === 'bomb') { if (tg.r >= 0 && tg.r < BB_N && tg.c >= 0 && tg.c < BB_N) bomb(tg.r, tg.c); return; }
                    if (mode === 'laser') { if (tg.r >= 0 && tg.r < BB_N) laser(tg.r); return; }
                    const p = tray[sel]; if (!p) return;
                    const { r0, c0 } = anchor(p);
                    if (fits(p, r0, c0)) place(p, r0, c0);
                    else { FX.play('wrong'); say("That won't fit!", 'worried', 1000); }
                }
                const slotAt = (x, y) => (x >= 344 && x < 630 && y >= 168 && y < 330 ? Math.floor((x - 344) / slotW) : -1);

                function drawBoard() {
                    ctx.fillStyle = 'rgba(2,6,23,.75)'; roundRect(ctx, BB_X - 8, BB_Y - 8, BB_N * BB_CELL + 16, BB_N * BB_CELL + 16, 14); ctx.fill();
                    ctx.strokeStyle = 'rgba(56,189,248,.45)'; ctx.lineWidth = 2; ctx.stroke();
                    for (let r = 0; r < BB_N; r++) for (let c = 0; c < BB_N; c++) {
                        const x = BB_X + c * BB_CELL, y = BB_Y + r * BB_CELL, cell = grid[r][c];
                        ctx.fillStyle = (r + c) % 2 ? 'rgba(30,41,59,.55)' : 'rgba(30,41,59,.38)'; roundRect(ctx, x + 2, y + 2, BB_CELL - 4, BB_CELL - 4, 6); ctx.fill();
                        if (!cell) continue;
                        const k = clamp((t - cell.born) / 140, 0, 1), s = BB_CELL * (0.7 + 0.3 * k);
                        drawBBBlock(ctx, x + (BB_CELL - s) / 2, y + (BB_CELL - s) / 2, s, cell.color, { gem: cell.gem, bad: cell.bad, t });
                    }
                }
                function drawGhost() {
                    if (over || (input === 'mouse' && !onGrid())) return;
                    const tg = target();
                    if (mode === 'bomb') {
                        if (tg.r < 0 || tg.r >= BB_N || tg.c < 0 || tg.c >= BB_N) return;
                        ctx.fillStyle = 'rgba(251,191,36,.25)'; ctx.strokeStyle = '#fbbf24'; ctx.setLineDash([5, 4]); ctx.lineWidth = 2;
                        const r0 = Math.max(0, tg.r - 1), c0 = Math.max(0, tg.c - 1), r1 = Math.min(BB_N - 1, tg.r + 1), c1 = Math.min(BB_N - 1, tg.c + 1);
                        roundRect(ctx, BB_X + c0 * BB_CELL + 1, BB_Y + r0 * BB_CELL + 1, (c1 - c0 + 1) * BB_CELL - 2, (r1 - r0 + 1) * BB_CELL - 2, 8); ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
                        return;
                    }
                    if (mode === 'laser') {
                        if (tg.r < 0 || tg.r >= BB_N) return;
                        ctx.fillStyle = 'rgba(248,113,113,.22)'; ctx.fillRect(BB_X, BB_Y + tg.r * BB_CELL, BB_N * BB_CELL, BB_CELL);
                        ctx.strokeStyle = '#f87171'; ctx.lineWidth = 2; ctx.strokeRect(BB_X, BB_Y + tg.r * BB_CELL, BB_N * BB_CELL, BB_CELL);
                        return;
                    }
                    const p = tray[sel]; if (!p) return;
                    const { r0, c0 } = anchor(p), ok = fits(p, r0, c0);
                    // Show which lines this drop would complete
                    if (ok) {
                        const filled = (r, c) => grid[r][c] || p.cells.some(([pr, pc]) => r0 + pr === r && c0 + pc === c);
                        ctx.fillStyle = 'rgba(255,255,255,.12)';
                        for (let r = 0; r < BB_N; r++) if ([...Array(BB_N).keys()].every(c => filled(r, c))) ctx.fillRect(BB_X, BB_Y + r * BB_CELL, BB_N * BB_CELL, BB_CELL);
                        for (let c = 0; c < BB_N; c++) if ([...Array(BB_N).keys()].every(r => filled(r, c))) ctx.fillRect(BB_X + c * BB_CELL, BB_Y, BB_CELL, BB_N * BB_CELL);
                    }
                    p.cells.forEach(([r, c]) => {
                        const gr = r0 + r, gc = c0 + c;
                        if (gr < 0 || gc < 0 || gr >= BB_N || gc >= BB_N) return;
                        if (ok) drawBBBlock(ctx, BB_X + gc * BB_CELL, BB_Y + gr * BB_CELL, BB_CELL, p.color, { alpha: 0.45 });
                        else { ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2; ctx.setLineDash([4, 3]); roundRect(ctx, BB_X + gc * BB_CELL + 3, BB_Y + gr * BB_CELL + 3, BB_CELL - 6, BB_CELL - 6, 6); ctx.stroke(); ctx.setLineDash([]); }
                    });
                }
                function drawSide() {
                    // Scrappy with a speech bubble
                    const m = t < moodUntil ? mood : 'focus';
                    ctx.save(); ctx.translate(372, 50); ctx.scale(1.35, 1.35); drawScrappyHead(ctx, 0, 0, m); ctx.restore();
                    if (t < speech.until) {
                        ctx.font = '700 13px Inter, sans-serif';
                        const w = Math.min(220, ctx.measureText(speech.text).width + 22);
                        ctx.fillStyle = '#f8fafc'; roundRect(ctx, 404, 30, w, 30, 10); ctx.fill();
                        ctx.beginPath(); ctx.moveTo(404, 40); ctx.lineTo(396, 46); ctx.lineTo(406, 50); ctx.fill();
                        ctx.fillStyle = '#0f172a'; ctx.fillText(speech.text, 415, 50);
                    }
                    // Stats
                    ctx.font = '800 15px Orbitron, sans-serif'; ctx.fillStyle = combo >= 2 ? '#fbbf24' : '#64748b';
                    ctx.fillText(combo >= 2 ? `COMBO x${combo}` : 'COMBO --', 350, 104);
                    if (combo >= 2) { ctx.fillStyle = 'rgba(251,191,36,.25)'; ctx.fillRect(350, 112, 120, 5); ctx.fillStyle = '#fbbf24'; ctx.fillRect(350, 112, 120 * (1 - sinceClear / 4), 5); }
                    ctx.font = '600 12px Inter, sans-serif'; ctx.fillStyle = '#94a3b8';
                    ctx.fillText(`Lines ${lines} · Gems ${gems}${T.lv.rotate ? ' · R rotates' : ''}`, 350, 138);
                    ctx.fillText(mode === 'bomb' ? 'NEON BOMB ARMED' : mode === 'laser' ? 'LINE LASER ARMED' : 'Your tray', 350, 160);
                    // Tray
                    for (let i = 0; i < slots; i++) {
                        const sx = 344 + i * slotW, p = tray[i], on = i === sel && p && !mode;
                        ctx.fillStyle = on ? 'rgba(34,211,238,.12)' : 'rgba(15,23,42,.7)';
                        roundRect(ctx, sx + 2, 168, slotW - 6, 160, 12); ctx.fill();
                        ctx.strokeStyle = on ? '#22d3ee' : 'rgba(148,163,184,.25)'; ctx.lineWidth = on ? 2.5 : 1; ctx.stroke();
                        ctx.font = '700 11px Inter, sans-serif'; ctx.fillStyle = '#64748b'; ctx.fillText(String(i + 1), sx + 10, 184);
                        if (!p || (drag && i === sel && input === 'mouse' && onGrid())) continue;
                        const cs = Math.min(20, (slotW - 22) / p.w, 120 / p.h);
                        const ox = sx + (slotW - 4) / 2 - (p.w * cs) / 2, oy = 252 - (p.h * cs) / 2;
                        const usable = fitsAnywhere(p);
                        const lift = drag && i === sel && input === 'mouse' ? 1 : 0;
                        p.cells.forEach(([r, c], k) => drawBBBlock(ctx, lift ? pointer.x - (p.w * cs) / 2 + c * cs : ox + c * cs, lift ? pointer.y - (p.h * cs) / 2 + r * cs : oy + r * cs, cs, p.color, { gem: k === p.gem, alpha: usable ? 1 : 0.3, t }));
                    }
                }

                return {
                    key(code) {
                        const n = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3 }[code];
                        if (n !== undefined && tray[n]) { sel = n; mode = null; updateButtons(); }
                        const mv = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[code];
                        if (mv) { input = 'key'; cursor.r = clamp(cursor.r + mv[0], 0, BB_N - 1); cursor.c = clamp(cursor.c + mv[1], 0, BB_N - 1); }
                        if (code === 'Space' || code === 'Enter') { input = 'key'; commit(); }
                        if (code === 'KeyR') act('rotate');
                        if (code === 'KeyB') act('bomb');
                        if (code === 'KeyL') act('laser');
                        if (code === 'KeyX') act('reroll');
                    },
                    action: act,
                    tap(x, y) {
                        input = 'mouse';
                        const s = slotAt(x, y);
                        if (s >= 0 && tray[s]) { sel = s; mode = null; drag = true; updateButtons(); return; }
                        if (onGrid()) drag = true;      // press on the grid: place where the pointer is let go
                    },
                    frame(dt, ms) {
                        t += ms;
                        if (pointer.down || pointer.x !== lastPX || pointer.y !== lastPY) { if (lastPX !== null || pointer.down) input = 'mouse'; lastPX = pointer.x; lastPY = pointer.y; }
                        if (drag && !pointer.down) { drag = false; if (onGrid()) commit(); }
                        neonBackdrop(ctx, 640, 360, '#070b1e', '#120a2a');
                        ctx.strokeStyle = 'rgba(99,102,241,.08)'; ctx.lineWidth = 1;
                        for (let x = (t / 60) % 32; x < 640; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 360); ctx.stroke(); }
                        drawBoard();
                        drawGhost();
                        // Clear effects: line beams and popping blocks
                        beams.forEach(b => {
                            b.life -= 0.05 * dt;
                            ctx.save(); ctx.globalAlpha = Math.max(0, b.life); ctx.fillStyle = b.laser ? '#fca5a5' : '#e0f2fe'; ctx.shadowColor = b.laser ? '#ef4444' : '#22d3ee'; ctx.shadowBlur = 20;
                            if (b.row !== undefined) ctx.fillRect(BB_X, BB_Y + b.row * BB_CELL + BB_CELL / 2 - 4 * b.life, BB_N * BB_CELL, 8 * b.life);
                            else ctx.fillRect(BB_X + b.col * BB_CELL + BB_CELL / 2 - 4 * b.life, BB_Y, 8 * b.life, BB_N * BB_CELL);
                            ctx.restore();
                        });
                        beams = beams.filter(b => b.life > 0);
                        pops.forEach(p => {
                            p.life -= 0.06 * dt;
                            const s = BB_CELL * (0.4 + Math.max(0, p.life) * 0.75);
                            drawBBBlock(ctx, BB_X + p.c * BB_CELL + (BB_CELL - s) / 2, BB_Y + p.r * BB_CELL + (BB_CELL - s) / 2, s, p.color, { alpha: Math.max(0, p.life) });
                        });
                        pops = pops.filter(p => p.life > 0);
                        if (input === 'key' && !over) { ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 2; roundRect(ctx, BB_X + cursor.c * BB_CELL + 1, BB_Y + cursor.r * BB_CELL + 1, BB_CELL - 2, BB_CELL - 2, 7); ctx.stroke(); }
                        drawSide();
                        banners.forEach((b, i) => {
                            b.life -= ms;
                            ctx.globalAlpha = Math.min(1, b.life / 300); ctx.textAlign = 'center'; ctx.font = '800 24px Orbitron, sans-serif';
                            ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(2,6,23,.85)'; ctx.strokeText(b.text, BB_X + 152, BB_Y + 150 - i * 30);
                            ctx.fillStyle = b.color; ctx.fillText(b.text, BB_X + 152, BB_Y + 150 - i * 30);
                            ctx.textAlign = 'start'; ctx.globalAlpha = 1;
                        });
                        banners = banners.filter(b => b.life > 0);
                        if (over && (jamMs -= ms) <= 0 && jamMs > -1000) { jamMs = -1000; api.finish(); }
                        api.hud(`Lines ${lines} · ${T.credits} 💰`);
                    },
                    summary: () => [`Lines cleared: <strong>${lines}</strong>`, `Best combo: <strong>x${bestCombo}</strong>`, `Gems cleared: <strong>${gems}</strong>`, wipes ? `<strong>Grid wipes: ${wipes}</strong>` : 'Tip: clear the whole grid for a 1500-point wipe bonus.']
                };
            }
        });
    }

    return {
        status: () => `${T.lines} lines · ${T.credits} 💰`,
        round(ok, next) {
            const gain = ok ? 100 + (S.combo.streak - 1) * 25 : 0;
            T.credits += gain;
            lab(gain, () => gridRound(next));
        }
    };
};
