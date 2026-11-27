'use strict';
/* ============================================================================
   AI LEARNING PORTAL - games.js
   Load after app.js. Sections:
   A Game list   B Sound & visual effects   C Combo system   D Shared game engine
   E New games: Cyber Defense, Hover Runner, Vault Breaker, Boss Battle, Packet Catcher
   The original three games (Rocket, Block Blast, Pirate) live in app.js.
   ============================================================================ */

// ============================================================================
// A. GAME LIST (one place that names every game; scores and leaderboards use it)
// ============================================================================
const GAMES = {
    rocket: {
        icon: '🚀', name: 'Rocket Space Defender', short: 'Rocket', run: (m, s) => runRocketGame(m, s),
        rules: `<p><strong>Objective:</strong> Answer questions to earn Credits, then survive each 30-second asteroid wave!</p>
            <ul><li><strong>Move:</strong> Left/Right arrows (or A/D). On a touch screen, drag to steer; your ship fires automatically.</li>
            <li><strong>Shoot:</strong> Up arrow (W or Space).</li>
            <li><strong>Hit chain:</strong> Destroy asteroids back to back for bonus points. A 3-answer streak gives free triple bullets.</li></ul>`
    },
    blockblast: {
        icon: '🧱', name: 'Block Blast AI Grid', short: 'Block Blast', run: (m, s) => runBlockBlastGame(m, s),
        rules: `<p><strong>Objective:</strong> Answer questions, then build combos with the blocks in your tray!</p>
            <ul><li><strong>Place pieces:</strong> Pick a piece, hover over the 8x8 grid to preview it, then click or tap.</li>
            <li><strong>Clear chain:</strong> Clear lines with back-to-back pieces for bigger bonuses.</li>
            <li><strong>Neon Bomb:</strong> A 3-answer streak gives a bomb piece that blasts a 3x3 area.</li></ul>`
    },
    pirate: {
        icon: '🏴‍☠️', name: 'Pirate Cannon Launcher', short: 'Pirate', run: (m, s) => runPirateGame(m, s),
        rules: `<p><strong>Objective:</strong> Answer questions, then smash the wooden crates with your cannon!</p>
            <ul><li><strong>Aim:</strong> Drag the cannonball backward to see the arc, then release to fire.</li>
            <li><strong>Chain hits:</strong> Each extra crate smashed by the same shot is worth more.</li>
            <li><strong>Bonus ball:</strong> A 3-answer streak gives you a fourth cannonball.</li></ul>`
    },
    defense: {
        icon: '🛡️', name: 'Cyber Shield Defense', short: 'Cyber Shield', run: (m, s) => runArcadeGame('defense', m, s),
        rules: `<p><strong>Objective:</strong> Stop malware from reaching your server core. Right answers charge your turrets!</p>
            <ul><li><strong>Aim power:</strong> Tap a lane, or press 1, 2, 3 (or Up/Down). Only the powered turret fires, and each shot uses energy.</li>
            <li><strong>Energy:</strong> A right answer gives a big charge. A wrong answer gives very little.</li>
            <li><strong>EMP:</strong> Streaks of 3 and 5 earn an EMP that wipes the screen. Press E or the EMP button.</li></ul>`
    },
    runner: {
        icon: '🛹', name: 'Neon Hover Runner', short: 'Hover Runner', run: (m, s) => runArcadeGame('runner', m, s),
        rules: `<p><strong>Objective:</strong> Ride the neon highway, dodge firewalls, and grab data orbs!</p>
            <ul><li><strong>Jump:</strong> Space, Up arrow, W, or tap. Press again in the air to double jump.</li>
            <li><strong>Boost:</strong> A right answer launches a speed boost that blasts through obstacles and adds shields.</li>
            <li><strong>Streaks:</strong> 3 in a row turns on the orb magnet. 5 in a row gives a longer mega boost.</li></ul>`
    },
    vault: {
        icon: '🔐', name: 'Vault Code Breaker', short: 'Vault Breaker', run: (m, s) => runArcadeGame('vault', m, s),
        rules: `<p><strong>Objective:</strong> Crack five digital vaults. Each vault has three lock pins.</p>
            <ul><li><strong>Lock a pin:</strong> Press Space or tap LOCK while the needle is inside the glowing zone. The bright center is a PERFECT hit.</li>
            <li><strong>Knowledge helps:</strong> Right answers give a wide zone and a slow needle. Wrong answers do the opposite.</li>
            <li><strong>Skeleton Key:</strong> Streaks of 3 and 5 earn a key that opens one pin instantly.</li></ul>`
    },
    boss: {
        icon: '👾', name: 'Glitch Boss Battle', short: 'Boss Battle', run: (m, s) => runArcadeGame('boss', m, s),
        rules: `<p><strong>Objective:</strong> Defeat the Glitch Overlord. Your knowledge is your weapon!</p>
            <ul><li><strong>Attack:</strong> After a right answer, stop the power meter near the center for maximum damage.</li>
            <li><strong>Defend:</strong> After a wrong answer, the boss attacks. Stop the meter near the center to block most of the damage.</li>
            <li><strong>Combos:</strong> Streaks multiply your damage. At 3 in a row you can unleash a Neural Ultimate.</li></ul>`
    },
    catcher: {
        icon: '📦', name: 'Data Packet Catcher', short: 'Packet Catcher', run: (m, s) => runArcadeGame('catcher', m, s),
        rules: `<p><strong>Objective:</strong> Build a clean dataset. Catch clean packets and dodge corrupted ones!</p>
            <ul><li><strong>Move:</strong> Left/Right arrows (or A/D), or drag with your mouse or finger.</li>
            <li><strong>Knowledge helps:</strong> Right answers give a wider collector. Wrong answers shrink it.</li>
            <li><strong>Streaks:</strong> 3 in a row pulls clean packets toward you. 5 in a row turns corrupted packets to gold for a while.</li></ul>`
    }
};
const GAME_KEYS = Object.keys(GAMES);

// Which game each lesson uses. No game repeats inside a module.
const GAME_ROTATION = {
    '1.1': 'runner', '1.2': 'blockblast', '1.3': 'vault',
    '2.1': 'defense', '2.2': 'boss', '2.3': 'rocket',
    '3.1': 'catcher', '3.2': 'pirate', '3.3': 'runner',
    '4.1': 'vault', '4.2': 'defense', '4.3': 'blockblast',
    '5.1': 'boss', '5.2': 'catcher', '5.3': 'rocket',
    '6.1': 'pirate', '6.2': 'runner', '6.3': 'boss'
};
const gameFor = (modId, subId) => GAME_ROTATION[`${modId}.${subId}`] || 'rocket';

// ============================================================================
// B. SOUND & VISUAL EFFECTS (sounds are generated in code, no audio files)
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
    return { play, comboSound, burst, burstAt, shake, flash, toggleMute, isMuted: () => muted };
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
                arcadeLabel: 'Arcade Score', arcadeScore: Math.round(S.score), bestStreak: S.combo.best, retry: () => runArcadeGame(key, modId, subId)
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
function canvasRound(S, { title, theme, seconds, hint, intro, buttons = '', setup, onEnd }) {
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
        elapsed: () => seconds * 1000 - timeLeft
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
            roundSummary(S, game.summary(), onEnd);
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
ARCADE_LOGIC.defense = S => {
    const T = { core: 100, energy: 20, emp: 0 };
    return {
        status: () => `Core ${T.core}% · Energy ${Math.round(T.energy)}`,
        round(ok, next) {
            const streak = S.combo.streak;
            T.energy = Math.min(150, T.energy + (ok ? 60 + streak * 8 : 14));
            if (ok && (streak === 3 || streak === 5)) { T.emp++; FX.play('power'); }
            if (ok && streak === 5) T.core = Math.min(100, T.core + 25);
            const level = ok ? 1 + Math.min(streak, 5) : 1;
            let kills = 0, leaks = 0;
            canvasRound(S, {
                title: '🛡️ Cyber Shield', theme: 'theme-defense', seconds: 15,
                intro: ok ? `⚡ Turrets charged! Power level ${level}.` : '⚠️ Low charge. Spend your shots carefully.',
                hint: 'Tap a lane or press 1 / 2 / 3 to power its turret · E fires an EMP',
                buttons: '<button type="button" class="game-btn" data-action="emp">💥 EMP</button>',
                onEnd: next,
                setup(api) {
                    const { ctx, juice } = api;
                    const lanes = [70, 180, 290];
                    const chain = createChain(2500);
                    let lane = 1, enemies = [], shots = [], spawn = 0, cooldown = 0;
                    const emp = () => {
                        if (!T.emp || !enemies.length) return;
                        T.emp--;
                        enemies.forEach(e => { juice.burst(e.x, lanes[e.lane], '#00f2fe', 18); S.score += 20 * S.combo.mult; kills++; });
                        enemies = [];
                        juice.shake(18); FX.flash('rgba(0,242,254,.35)'); FX.play('explode');
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
                            neonBackdrop(ctx, 640, 360, '#050b1c', '#0b1533');
                            lanes.forEach((y, i) => {
                                ctx.fillStyle = i === lane ? 'rgba(0,242,254,.12)' : 'rgba(255,255,255,.025)';
                                ctx.fillRect(60, y - 42, 580, 84);
                            });
                            glowRect(ctx, 10, 30, 14, 300, T.core > 35 ? '#10b981' : '#ef4444', 20);
                            spawn -= ms;
                            if (spawn <= 0) {
                                const tough = Math.random() < 0.2 + S.q * 0.04;
                                enemies.push({ lane: Math.floor(Math.random() * 3), x: 660, hp: tough ? 3 : 1, speed: (tough ? 0.8 : rand(1.2, 1.9)) + S.q * 0.1, tough });
                                spawn = rand(520, 900) - S.q * 40;
                            }
                            lanes.forEach((y, i) => {
                                const on = i === lane && T.energy >= 1;
                                glowRect(ctx, 40, y - 18, 30, 36, on ? '#00f2fe' : '#334155', on ? 18 : 0);
                                glowRect(ctx, 66, y - 5, 18, 10, on ? '#e0f2fe' : '#475569', 0);
                            });
                            cooldown -= ms;
                            if (cooldown <= 0 && T.energy >= 1 && enemies.some(e => e.lane === lane)) {
                                T.energy -= 1;
                                shots.push({ lane, x: 84 });
                                cooldown = 300 - level * 28;
                                FX.play('shoot');
                            }
                            shots.forEach(s => { s.x += 11 * dt; glowRect(ctx, s.x, lanes[s.lane] - 3, 18, 6, '#38bdf8'); });
                            enemies.forEach(e => {
                                e.x -= e.speed * dt;
                                emoji(ctx, e.tough ? '👹' : '👾', e.x, lanes[e.lane], e.tough ? 46 : 36);
                                if (e.tough) glowRect(ctx, e.x - 18, lanes[e.lane] - 34, 12 * e.hp, 4, '#f472b6', 6);
                                shots.forEach(s => {
                                    if (!s.used && s.lane === e.lane && e.hp > 0 && s.x + 18 >= e.x - 16 && s.x <= e.x + 16) {
                                        s.used = true; e.hp--;
                                        juice.burst(e.x, lanes[e.lane], '#38bdf8', 6);
                                        if (e.hp <= 0) {
                                            const pts = Math.round((e.tough ? 60 : 25) * S.combo.mult * chain.hit());
                                            S.score += pts; kills++;
                                            juice.burst(e.x, lanes[e.lane], '#f472b6', 22);
                                            juice.text(e.x, lanes[e.lane] - 22, `+${pts}`, '#67e8f9');
                                            juice.shake(5); FX.play('hit');
                                        }
                                    }
                                });
                                if (e.hp > 0 && e.x <= 34) {
                                    e.hp = 0; leaks++; chain.reset();
                                    T.core -= e.tough ? 20 : 10;
                                    juice.burst(30, lanes[e.lane], '#ef4444', 24); juice.shake(16); FX.play('explode');
                                    if (T.core <= 0) {
                                        T.core = 50; S.score = Math.max(0, S.score - 300);
                                        juice.text(320, 180, 'CORE REBOOTED  -300', '#f87171'); FX.flash('rgba(239,68,68,.4)');
                                    }
                                }
                            });
                            enemies = enemies.filter(e => e.hp > 0);
                            shots = shots.filter(s => !s.used && s.x < 660);
                            if (chain.count >= 3) { ctx.font = '800 15px Orbitron, sans-serif'; ctx.fillStyle = '#fbbf24'; ctx.fillText(`CHAIN x${chain.count}`, 520, 24); }
                            api.hud(`Core ${T.core}% · ⚡${Math.floor(T.energy)} · EMP ${T.emp}`);
                        },
                        summary: () => [`Malware destroyed: <strong>${kills}</strong>`, `Breaches: <strong>${leaks}</strong>`, `Core health: <strong>${T.core}%</strong>`, `Energy saved: <strong>${Math.floor(T.energy)}</strong>`]
                    };
                }
            });
        }
    };
};

// ---- 2. NEON HOVER RUNNER ---------------------------------------------------
ARCADE_LOGIC.runner = S => {
    const T = { shields: 1, meters: 0 };
    return {
        status: () => `${Math.round(T.meters)} m · Shields ${T.shields}`,
        round(ok, next) {
            const streak = S.combo.streak;
            if (ok) T.shields = Math.min(5, T.shields + 1);
            const boostMs = ok ? (streak >= 5 ? 6000 : 2800) : 0;
            const magnet = ok && streak >= 3;
            let orbs = 0, hits = 0, smashed = 0;
            canvasRound(S, {
                title: '🛹 Hover Runner', theme: 'theme-runner', seconds: 14,
                intro: ok ? (streak >= 5 ? '🌈 MEGA BOOST engaged!' : magnet ? '🧲 Boost + orb magnet online!' : '🚀 Speed boost! Smash through anything.') : '🐢 No boost this round. Time your jumps!',
                hint: 'Space / Up / W or tap to jump · press again to double jump',
                onEnd: next,
                setup(api) {
                    const { ctx, juice } = api;
                    const GROUND = 292;
                    const p = { x: 96, y: GROUND - 40, w: 34, h: 40, vy: 0, jumps: 0 };
                    const chain = createChain(1800);
                    let things = [], spawn = 400, orbSpawn = 150, scroll = 0, safe = 0;
                    const jump = () => {
                        if (p.jumps >= 2) return;
                        p.vy = p.jumps ? -10 : -11.5; p.jumps++;
                        juice.burst(p.x + 17, p.y + 40, '#a855f7', 8); FX.play('jump');
                    };
                    return {
                        key(code) { if (['Space', 'ArrowUp', 'KeyW'].includes(code)) jump(); },
                        tap: jump,
                        frame(dt, ms) {
                            chain.tick(ms);
                            const boosting = api.elapsed() < boostMs;
                            const speed = (5 + S.q * 0.35) * (boosting ? 1.75 : 1);
                            scroll += speed * dt; T.meters += speed * dt * 0.05; S.score += speed * dt * 0.08 * S.combo.mult;
                            safe -= ms;
                            neonBackdrop(ctx, 640, 360, '#12062e', '#050816');
                            for (let i = 0; i < 12; i++) {
                                const bx = ((i * 73 - scroll * 0.25) % 876 + 876) % 876 - 120, bh = 60 + (i * 47) % 110;
                                ctx.fillStyle = 'rgba(99,102,241,.16)'; ctx.fillRect(bx, GROUND - bh, 46, bh);
                            }
                            glowRect(ctx, -10, GROUND, 660, 4, boosting ? '#fbbf24' : '#00f2fe', 18);
                            ctx.strokeStyle = 'rgba(0,242,254,.25)';
                            for (let x = -(scroll % 60); x < 700; x += 60) { ctx.beginPath(); ctx.moveTo(x, GROUND + 4); ctx.lineTo(x - 50, 360); ctx.stroke(); }
                            spawn -= ms; orbSpawn -= ms;
                            if (spawn <= 0) {
                                const drone = Math.random() < 0.25;
                                things.push(drone ? { type: 'wall', x: 660, y: GROUND - 118, w: 30, h: 30, drone } : { type: 'wall', x: 660, y: GROUND - rand(32, 58), w: 26, h: 0, drone });
                                const t = things[things.length - 1];
                                if (!drone) t.h = GROUND - t.y;
                                spawn = rand(900, 1500) / (boosting ? 1.4 : 1);
                            }
                            if (orbSpawn <= 0) { things.push({ type: 'orb', x: 660, y: rand(150, GROUND - 30), w: 20, h: 20 }); orbSpawn = rand(220, 480); }
                            p.vy += 0.62 * dt; p.y += p.vy * dt;
                            if (p.y >= GROUND - p.h) { p.y = GROUND - p.h; p.vy = 0; p.jumps = 0; }
                            things.forEach(t => {
                                t.x -= speed * dt;
                                if (t.type === 'orb') {
                                    if (magnet && t.x < 300) { t.x += (p.x + 7 - t.x) * 0.09 * dt; t.y += (p.y + 10 - t.y) * 0.09 * dt; }
                                    glowRect(ctx, t.x + 4, t.y + 4, 12, 12, '#34d399', 16);
                                    if (overlap(p, t)) {
                                        t.gone = true; orbs++;
                                        const pts = Math.round(25 * S.combo.mult * chain.hit());
                                        S.score += pts; juice.burst(t.x + 10, t.y + 10, '#34d399', 8); juice.text(t.x, t.y - 8, `+${pts}`, '#6ee7b7'); FX.play('collect');
                                    }
                                } else {
                                    if (t.drone) emoji(ctx, '🛸', t.x + 15, t.y + 15, 34);
                                    else { glowRect(ctx, t.x, t.y, t.w, t.h, '#f43f5e', 16); ctx.fillStyle = '#4c0519'; ctx.fillRect(t.x + 5, t.y + 6, t.w - 10, t.h - 12); }
                                    if (overlap(p, t)) {
                                        t.gone = true;
                                        if (boosting) {
                                            smashed++; S.score += 60 * S.combo.mult;
                                            juice.burst(t.x + 13, t.y + 20, '#fbbf24', 26); juice.shake(8); FX.play('hit');
                                        } else if (safe <= 0) {
                                            safe = 900; chain.reset(); juice.shake(18); FX.play('explode');
                                            juice.burst(p.x + 17, p.y + 20, '#ef4444', 24);
                                            if (T.shields > 0) { T.shields--; juice.text(p.x + 60, p.y - 10, 'SHIELD!', '#67e8f9'); }
                                            else { hits++; S.score = Math.max(0, S.score - 120); juice.text(p.x + 60, p.y - 10, '-120', '#f87171'); }
                                        }
                                    }
                                }
                            });
                            things = things.filter(t => !t.gone && t.x > -40);
                            // rider and hoverboard
                            if (boosting) for (let i = 1; i <= 4; i++) { ctx.globalAlpha = 0.35 / i; glowRect(ctx, p.x - i * 18, p.y + 8, 24, 24, '#fbbf24'); ctx.globalAlpha = 1; }
                            if (safe <= 0 || Math.floor(safe / 90) % 2) {
                                emoji(ctx, '🤖', p.x + 17, p.y + 17, 34);
                                glowRect(ctx, p.x - 6, p.y + p.h - 3 + Math.sin(scroll * 0.06) * 2, p.w + 14, 6, boosting ? '#fbbf24' : '#a855f7', 18);
                            }
                            if (T.shields > 0) {
                                ctx.strokeStyle = 'rgba(103,232,249,.6)'; ctx.lineWidth = 2;
                                ctx.beginPath(); ctx.arc(p.x + 17, p.y + 20, 32, 0, Math.PI * 2); ctx.stroke();
                            }
                            if (chain.count >= 3) { ctx.font = '800 15px Orbitron, sans-serif'; ctx.fillStyle = '#fbbf24'; ctx.fillText(`ORB CHAIN x${chain.count}`, 470, 24); }
                            api.hud(`${Math.round(T.meters)} m · 🛡️${T.shields}`);
                        },
                        summary: () => [`Distance: <strong>${Math.round(T.meters)} m</strong>`, `Data orbs: <strong>${orbs}</strong>`, `Obstacles smashed: <strong>${smashed}</strong>`, `Unshielded crashes: <strong>${hits}</strong>`]
                    };
                }
            });
        }
    };
};

// ---- 3. VAULT CODE BREAKER --------------------------------------------------
ARCADE_LOGIC.vault = S => {
    const T = { opened: 0, keys: 0 };
    return {
        status: () => `Vaults ${T.opened} · Keys ${T.keys}`,
        round(ok, next) {
            const streak = S.combo.streak;
            if (ok && (streak === 3 || streak === 5)) { T.keys++; FX.play('power'); }
            let pins = 0, tries = ok ? 6 : 4, perfects = 0, done = false;
            canvasRound(S, {
                title: '🔐 Vault Breaker', theme: 'theme-vault', seconds: 16,
                intro: ok ? '🟢 Intel decoded: wide lock zone and a slow needle.' : '🔴 Security alert: narrow zone and a fast needle!',
                hint: 'Press Space or tap LOCK while the needle is in the glowing zone · K uses a Skeleton Key',
                buttons: '<button type="button" class="game-btn primary" data-action="lock">🔒 LOCK</button><button type="button" class="game-btn" data-action="key">🗝️ Skeleton Key</button>',
                onEnd: next,
                setup(api) {
                    const { ctx, juice } = api;
                    const chain = createChain(6000);
                    const width = ok ? 1.05 + Math.min(streak, 5) * 0.05 : 0.55;
                    let angle = 0, dir = 1, speed = (ok ? 0.036 : 0.06) + S.q * 0.003, zone = rand(1, 5), wait = 0;
                    const gap = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
                    const openPin = (perfect, label) => {
                        pins++; if (perfect) perfects++;
                        const pts = Math.round((perfect ? 220 : 120) * S.combo.mult * chain.hit());
                        S.score += pts;
                        juice.burst(320, 178, perfect ? '#fbbf24' : '#34d399', perfect ? 34 : 20);
                        juice.text(320, 105, `${label} +${pts}`, perfect ? '#fde68a' : '#6ee7b7');
                        juice.shake(perfect ? 12 : 6); FX.play(perfect ? 'power' : 'correct');
                        if (pins >= 3) {
                            done = true; T.opened++;
                            const bonus = 150 + tries * 40;
                            S.score += bonus; juice.text(320, 240, `VAULT OPEN +${bonus}`, '#fff'); FX.flash('rgba(16,185,129,.35)'); FX.play('win');
                        } else {
                            dir *= -1; speed *= 1.16;
                            zone = angle + dir * rand(1.8, 4.2);
                        }
                    };
                    const lock = () => {
                        if (done || tries <= 0 || wait > 0) return;
                        wait = 220;
                        const g = gap(angle, zone);
                        if (g <= width / 2) { openPin(g <= width / 8, g <= width / 8 ? 'PERFECT!' : 'LOCKED'); return; }
                        tries--; chain.reset(); juice.shake(14); juice.text(320, 105, 'MISS', '#f87171'); FX.play('wrong');
                    };
                    const useKey = () => { if (!done && tries > 0 && T.keys > 0) { T.keys--; openPin(false, 'SKELETON KEY'); } };
                    return {
                        key(code) { if (code === 'Space' || code === 'Enter') lock(); if (code === 'KeyK') useKey(); },
                        tap: lock,
                        action(a) { if (a === 'lock') lock(); else useKey(); },
                        frame(dt, ms) {
                            chain.tick(ms); wait -= ms;
                            if (!done && tries > 0) angle += speed * dir * dt;
                            neonBackdrop(ctx, 640, 360, '#04140f', '#030712');
                            ctx.save();
                            ctx.translate(320, 178);
                            ctx.lineWidth = 26; ctx.strokeStyle = '#1e293b';
                            ctx.beginPath(); ctx.arc(0, 0, 120, 0, Math.PI * 2); ctx.stroke();
                            if (!done) {
                                ctx.shadowBlur = 20; ctx.shadowColor = '#34d399'; ctx.strokeStyle = '#10b981';
                                ctx.beginPath(); ctx.arc(0, 0, 120, zone - width / 2, zone + width / 2); ctx.stroke();
                                ctx.shadowColor = '#fbbf24'; ctx.strokeStyle = '#fbbf24';
                                ctx.beginPath(); ctx.arc(0, 0, 120, zone - width / 8, zone + width / 8); ctx.stroke();
                                ctx.shadowColor = '#fff'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 6;
                                ctx.beginPath(); ctx.moveTo(Math.cos(angle) * 78, Math.sin(angle) * 78); ctx.lineTo(Math.cos(angle) * 142, Math.sin(angle) * 142); ctx.stroke();
                            }
                            ctx.restore();
                            emoji(ctx, done ? '🔓' : tries > 0 ? '🔒' : '🚨', 320, 178, 62);
                            for (let i = 0; i < 3; i++) glowRect(ctx, 270 + i * 36, 330, 28, 12, i < pins ? '#34d399' : '#334155', i < pins ? 14 : 0);
                            for (let i = 0; i < S.total; i++) glowRect(ctx, 24, 90 + i * 36, 14, 24, i < T.opened ? '#fbbf24' : '#1e293b', i < T.opened ? 12 : 0);
                            if (tries <= 0 && !done) { ctx.font = '800 16px Orbitron, sans-serif'; ctx.fillStyle = '#f87171'; ctx.textAlign = 'center'; ctx.fillText('LOCKOUT - wait for the next vault', 320, 28); ctx.textAlign = 'start'; }
                            api.hud(`Tries ${tries} · 🗝️${T.keys}`);
                        },
                        summary: () => [done ? '🔓 <strong>Vault cracked!</strong>' : `Pins opened: <strong>${pins} / 3</strong>`, `Perfect locks: <strong>${perfects}</strong>`, `Total vaults cracked: <strong>${T.opened}</strong>`]
                    };
                }
            });
        }
    };
};

// ---- 4. GLITCH BOSS BATTLE (no canvas: animated HTML) -----------------------
ARCADE_LOGIC.boss = S => {
    const BOSS_MAX = 90;
    const T = { boss: BOSS_MAX, hero: 100, defeated: false };
    const hpBar = (id, label, value, max) => `
        <div class="hp-block ${id}"><div class="hp-label"><span>${label}</span><span data-hp="${id}">${Math.ceil(value)} / ${max}</span></div>
        <div class="hp-bar"><div data-fill="${id}" style="width:${(value / max) * 100}%"></div></div></div>`;
    return {
        status: () => T.defeated ? 'Boss defeated!' : `Boss HP ${Math.ceil(T.boss)} · You ${Math.ceil(T.hero)}`,
        round(ok, next) {
            const streak = S.combo.streak;
            const ultimateReady = ok && streak >= 3;
            S.stage.innerHTML = `
                <div class="quiz-game-card theme-boss boss-card">
                    <div class="quiz-header-row"><span class="quiz-counter">👾 Boss Battle · Turn ${S.q + 1}/${S.total}</span>${comboPill(S.combo)}<span class="quiz-credits" data-score>Score: ${Math.round(S.score)}</span></div>
                    ${hpBar('boss', '👾 GLITCH OVERLORD', T.boss, BOSS_MAX)}
                    <div class="arena">
                        <div class="fighter player" data-hero>🤖</div>
                        <div class="fighter boss-sprite${T.defeated ? ' down' : ''}" data-boss>${T.defeated ? '💥' : '👾'}</div>
                        <div class="dmg-layer" data-dmg></div>
                    </div>
                    ${hpBar('player', '🤖 YOU', T.hero, 100)}
                    <p class="round-intro" data-msg>${ok ? 'Your turn! Stop the meter near the center to hit hardest.' : 'The boss attacks! Stop the meter near the center to block.'}</p>
                    <div class="power-meter ${ok ? '' : 'defend'}" aria-hidden="true"><span class="sweet"></span><i data-needle></i></div>
                    <div class="game-buttons">
                        <button type="button" class="game-btn primary" data-move="basic">${ok ? '⚔️ Strike' : '🛡️ Block'} (Space)</button>
                        ${ultimateReady ? '<button type="button" class="game-btn ultimate" data-move="ultimate">🌌 Neural Ultimate (U)</button>' : ''}
                    </div>
                </div>`;
            const card = $('.boss-card', S.stage), needle = $('[data-needle]', card);
            let pos = 0, dir = 1, acted = false, raf = 0, last = 0;
            const speed = 0.085 + S.q * 0.012;
            const setHp = (id, value, max) => {
                $(`[data-fill="${id}"]`, card).style.width = (value / max) * 100 + '%';
                $(`[data-hp="${id}"]`, card).textContent = `${Math.ceil(value)} / ${max}`;
            };
            const floatText = (text, side, cls) => {
                const el = document.createElement('span');
                el.className = `dmg ${side} ${cls}`;
                el.textContent = text;
                $('[data-dmg]', card).appendChild(el);
            };
            function sweep(now) {
                if (acted) return;
                if (!document.body.contains(card)) { stop(); return; }
                const ms = last ? Math.min(50, now - last) : 16;
                last = now;
                pos += dir * speed * ms / 16.67 * 20;
                if (pos >= 100) { pos = 100; dir = -1; }
                if (pos <= 0) { pos = 0; dir = 1; }
                needle.style.left = pos + '%';
                raf = requestAnimationFrame(sweep);
            }
            function stop() { acted = true; cancelAnimationFrame(raf); document.removeEventListener('keydown', onKey); }
            function act(move) {
                if (acted) return;
                stop();
                $$('[data-move]', card).forEach(b => b.disabled = true);
                const accuracy = 1 - Math.abs(pos - 50) / 50;            // 1 = dead center
                const perfect = accuracy > 0.85;
                const hero = $('[data-hero]', card), boss = $('[data-boss]', card), msg = $('[data-msg]', card);
                if (ok) {
                    const damage = 18 * (0.8 + accuracy * 0.5) * S.combo.mult * (move === 'ultimate' ? 1.8 : 1);
                    const wasAlive = !T.defeated;
                    T.boss = Math.max(0, T.boss - damage);
                    const pts = Math.round(damage * 12 + (perfect ? 150 : 0) + (wasAlive ? 0 : 200));
                    S.score += pts;
                    if (perfect) recordBest('bestActionCombo', S.combo.streak * 3);
                    hero.classList.add('lunge');
                    setTimeout(() => {
                        boss.classList.add('hurt');
                        FX.burstAt(boss, { color: move === 'ultimate' ? '#c084fc' : '#00f2fe', count: move === 'ultimate' ? 90 : 40, power: move === 'ultimate' ? 11 : 7 });
                        FX.shake(card, move === 'ultimate' ? 18 : 9); FX.play('explode');
                        if (move === 'ultimate') FX.flash('rgba(168,85,247,.45)');
                        floatText(wasAlive ? `-${Math.round(damage)}${perfect ? ' PERFECT!' : ''}` : 'OVERKILL!', 'right', perfect ? 'crit' : '');
                        setHp('boss', T.boss, BOSS_MAX);
                        msg.textContent = `You dealt ${Math.round(damage)} damage (+${pts} points).`;
                        if (wasAlive && T.boss <= 0) {
                            T.defeated = true;
                            S.score += 1000;
                            store.set('bossDefeated', true);
                            boss.textContent = '💥'; boss.classList.add('down');
                            msg.textContent = '🏆 GLITCH OVERLORD DEFEATED! +1000 bonus points.';
                            FX.burstAt(boss, { color: '#fbbf24', count: 120, power: 12 }); FX.play('win');
                        }
                        $('[data-score]', card).textContent = `Score: ${Math.round(S.score)}`;
                    }, 220);
                } else {
                    const damage = T.defeated ? 0 : Math.round(30 * (1 - accuracy * 0.75));
                    T.hero -= damage;
                    boss.classList.add('lunge-left');
                    setTimeout(() => {
                        hero.classList.add('hurt');
                        FX.burstAt(hero, { color: '#ef4444', count: 30 }); FX.shake(card, 6 + damage / 2); FX.play('hit');
                        floatText(perfect ? 'BLOCKED!' : `-${damage}`, 'left', 'bad');
                        msg.textContent = T.defeated ? 'The boss is already down. No damage taken!' : `You took ${damage} damage.`;
                        if (T.hero <= 0) {
                            T.hero = 50; S.score = Math.max(0, S.score - 300);
                            msg.textContent = '🔧 Systems rebooted at 50 HP (-300 points).';
                        }
                        setHp('player', T.hero, 100);
                        $('[data-score]', card).textContent = `Score: ${Math.round(S.score)}`;
                    }, 220);
                }
                setTimeout(() => {
                    if (!document.body.contains(card)) return;
                    const btn = document.createElement('button');
                    btn.type = 'button'; btn.className = 'btn-continue-shop';
                    btn.textContent = S.q >= S.total - 1 ? 'See Results →' : 'Next Question →';
                    btn.onclick = next;
                    $('.game-buttons', card).replaceWith(btn);
                    btn.focus({ preventScroll: true });
                }, 900);
            }
            function onKey(e) {
                if (!document.body.contains(card)) { stop(); return; }
                if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); if (!e.repeat) act('basic'); }
                else if (e.code === 'KeyU' && ultimateReady) act('ultimate');
            }
            document.addEventListener('keydown', onKey);
            $$('[data-move]', card).forEach(b => b.onclick = () => act(b.dataset.move));
            raf = requestAnimationFrame(sweep);
        }
    };
};

// ---- 5. DATA PACKET CATCHER -------------------------------------------------
ARCADE_LOGIC.catcher = S => {
    const T = { clean: 0, dirty: 0 };
    const purity = () => T.clean + T.dirty ? Math.round((T.clean / (T.clean + T.dirty)) * 100) : 100;
    return {
        status: () => `Dataset purity ${purity()}%`,
        round(ok, next) {
            const streak = S.combo.streak;
            const width = ok ? 118 + Math.min(streak, 5) * 8 : 72;
            const magnet = ok && streak >= 3;
            const goldMs = ok && streak >= 5 ? 6000 : 0;
            let caught = 0, bad = 0;
            canvasRound(S, {
                title: '📦 Packet Catcher', theme: 'theme-catcher', seconds: 14,
                intro: ok ? (goldMs ? '✨ GOLD RUSH! Corrupted packets turn to gold.' : magnet ? '🧲 Wide collector + data magnet!' : '📡 Wide collector deployed.') : '📉 Collector damaged: it is narrower this round.',
                hint: 'Catch ✅ clean data · dodge ☠️ corrupted data · arrows / A-D, mouse, or drag',
                onEnd: next,
                setup(api) {
                    const { ctx, juice, keys, pointer } = api;
                    const chain = createChain(2600);
                    const pad = { x: 320 - width / 2, y: 320, w: width, h: 16 };
                    let items = [], spawn = 200, lastX = null;
                    return {
                        frame(dt, ms) {
                            chain.tick(ms);
                            const gold = api.elapsed() < goldMs;
                            neonBackdrop(ctx, 640, 360, '#03121f', '#08051a');
                            ctx.strokeStyle = 'rgba(56,189,248,.1)';
                            for (let x = 40; x < 640; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 360); ctx.stroke(); }
                            if (keys.ArrowLeft || keys.KeyA) pad.x -= 9 * dt;
                            if (keys.ArrowRight || keys.KeyD) pad.x += 9 * dt;
                            // follow the mouse or finger only when it moves, so the keyboard also works
                            if (pointer.x !== lastX) { if (lastX !== null || pointer.down) pad.x = pointer.x - pad.w / 2; lastX = pointer.x; }
                            pad.x = clamp(pad.x, 0, 640 - pad.w);
                            spawn -= ms;
                            if (spawn <= 0) {
                                items.push({ x: rand(10, 600), y: -30, w: 30, h: 30, bad: Math.random() < 0.34 + S.q * 0.02, vy: rand(2.6, 3.9) + S.q * 0.2 });
                                spawn = rand(260, 480) - S.q * 20;
                            }
                            items.forEach(it => {
                                it.y += it.vy * dt;
                                const isBad = it.bad && !gold;
                                const isGold = it.bad && gold;
                                if (magnet && !isBad && it.y > 150) it.x += clamp((pad.x + pad.w / 2 - 15 - it.x) * 0.035, -4, 4) * dt;
                                glowRect(ctx, it.x, it.y, it.w, it.h, isGold ? '#fbbf24' : isBad ? '#e11d48' : '#0891b2', 14);
                                emoji(ctx, isGold ? '⭐' : isBad ? '☠️' : '✅', it.x + 15, it.y + 16, 19);
                                if (overlap(it, pad)) {
                                    it.gone = true;
                                    if (isBad) {
                                        bad++; T.dirty++; chain.reset();
                                        S.score = Math.max(0, S.score - 90);
                                        juice.burst(it.x + 15, pad.y, '#ef4444', 24); juice.text(it.x + 15, pad.y - 20, '-90', '#f87171'); juice.shake(16); FX.play('explode');
                                    } else {
                                        caught++; T.clean++;
                                        const pts = Math.round((isGold ? 90 : 40) * S.combo.mult * chain.hit());
                                        S.score += pts;
                                        juice.burst(it.x + 15, pad.y, isGold ? '#fbbf24' : '#00f2fe', 12); juice.text(it.x + 15, pad.y - 20, `+${pts}`, isGold ? '#fde68a' : '#67e8f9'); juice.shake(2); FX.play('collect');
                                    }
                                }
                            });
                            items = items.filter(it => !it.gone && it.y < 370);
                            glowRect(ctx, pad.x, pad.y, pad.w, pad.h, magnet ? '#c084fc' : ok ? '#00f2fe' : '#f59e0b', 22);
                            if (chain.count >= 3) { ctx.font = '800 15px Orbitron, sans-serif'; ctx.fillStyle = '#fbbf24'; ctx.fillText(`CATCH CHAIN x${chain.count}`, 450, 24); }
                            api.hud(`Purity ${purity()}%`);
                        },
                        summary: () => [`Clean packets: <strong>${caught}</strong>`, `Corrupted packets: <strong>${bad}</strong>`, `Dataset purity: <strong>${purity()}%</strong>`]
                    };
                }
            });
        }
    };
};
