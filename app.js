'use strict';
/* ============================================================================
   AI LEARNING PORTAL - app.js
   TSA Webmaster Competition | Hand-coded HTML5, CSS3, modern JavaScript
   Sections:  1 Setup  2 Simulators  3 Lessons  4 Progress & Router
              5 Quizzes  6 Arcade games  7 Profiles & leaderboard  8 Chatbot  9 Init
   ============================================================================ */

// ============================================================================
// 1. SETUP: FIREBASE, HELPERS
// ============================================================================
const firebaseConfig = {
    apiKey: "AIzaSyD1frKfVoVSqUk0HDyz2ygY_0oxmCCjMGA",
    authDomain: "ai-learning-portal-9c023.firebaseapp.com",
    projectId: "ai-learning-portal-9c023",
    storageBucket: "ai-learning-portal-9c023.firebasestorage.app",
    messagingSenderId: "257707620893",
    appId: "1:257707620893:web:567b9dc9505baa05e464f4"
};

let db = null;
try {
    if (typeof firebase !== 'undefined') {
        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
    }
} catch (err) {
    console.warn('Firebase unavailable, using this device only.', err);
}

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const store = {
    get(key, fallback) {
        try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); }
        catch { return fallback; }
    },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full or blocked */ } }
};

function toast(message, type = 'info') {
    const wrap = $('#toast-wrap');
    if (!wrap) return;
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 3200);
}

const GREEN = '#10b981', AMBER = '#f59e0b', RED = '#ef4444';

// ============================================================================
// 2. INTERACTIVE SIMULATORS (one data-driven engine for all lessons)
// ============================================================================
const PROMPT_PREVIEWS = [
    `"Explain photosynthesis." → High risk of overly broad, generic textbook text.`,
    `"Act as a high school biology tutor. Explain photosynthesis using an everyday solar panel analogy."`,
    `"Act as an AP Biology instructor. Explain the light-dependent reactions of photosynthesis to a 10th grader in 3 bullet points under 120 words, avoiding university jargon."`
];
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

const SIMS = {
    '1.1': {
        icon: '🔬', title: 'Interactive Model Simulator: Supervised Spam Classifier',
        desc: 'Adjust the sliders below to see how a live AI calculates threat probabilities in real time!',
        out: 'Calculated Probability Score:',
        sliders: [
            { k: 'kw', label: 'Trigger Words Count ("Win", "Free", "Urgent"):', min: 0, max: 10, value: 3 },
            { k: 'links', label: 'Suspicious External Links Count:', min: 0, max: 5, value: 2 }
        ],
        calc: v => {
            const s = Math.min(0.99, v.kw * 0.11 + v.links * 0.16);
            return { out: s.toFixed(2), badge: s >= 0.5 ? ['SPAM DETECTED', RED] : ['LEGITIMATE (HAM)', GREEN] };
        }
    },
    '1.3': {
        icon: '🎯', title: 'Interactive Simulator: Object Detection Confidence',
        desc: 'Adjust image resolution clarity to evaluate how pixel quality affects model classification confidence.',
        out: 'Model Detection Confidence:',
        before: `<img class="sim-image" data-sim-image src="images/NYC.jpg" alt="Target object for the detection simulator" loading="lazy">`,
        sliders: [{ k: 'res', label: 'Image Resolution Clarity:', min: 10, max: 100, value: 50, fmt: v => v + '%' }],
        calc: v => {
            const conf = clamp(15 + ((v.res - 10) / 90) * 84.8, 15, 99.8).toFixed(1);
            return {
                out: conf + '%',
                badge: v.res >= 75 ? ['OBJECT VERIFIED', GREEN] : v.res >= 40 ? ['UNCERTAIN', AMBER] : ['LOW CONFIDENCE / RISK', RED]
            };
        },
        apply: (v, box) => { const img = $('[data-sim-image]', box); if (img) img.style.filter = `blur(${((100 - v.res) / 100) * 12}px)`; }
    },
    '2.1': {
        icon: '✍️', title: 'Interactive Simulator: Prompt Architecture Quality Analyzer',
        desc: 'Adjust Role, Context, and Constraints to see how prompt structure boosts LLM response precision!',
        out: 'Estimated Output Precision:', preview: true,
        sliders: [
            { k: 'role', label: '1. Role & Persona Definition:', min: 0, max: 2, value: 2, fmt: v => ['None (Generic)', 'Basic Persona', 'Domain Expert'][v] },
            { k: 'context', label: '2. Context & Audience Depth:', min: 0, max: 2, value: 1, fmt: v => ['Vague Topic', 'Background Included', 'Rich Examples + Data'][v] },
            { k: 'constraints', label: '3. Output Format & Constraints:', min: 0, max: 2, value: 2, fmt: v => ['Unbounded', 'Word Limit Set', 'Format + Tone + Rules'][v] }
        ],
        calc: v => {
            const q = Math.min(99, 25 + v.role * 12 + v.context * 15 + v.constraints * 10);
            return {
                out: q + '%', preview: PROMPT_PREVIEWS[q >= 80 ? 2 : q >= 55 ? 1 : 0],
                badge: q >= 80 ? ['PRODUCTION-READY PROMPT', GREEN] : q >= 55 ? ['MODERATE CLARITY', AMBER] : ['AMBIGUOUS / WEAK', RED]
            };
        }
    },
    '2.2': {
        icon: '🧩', title: 'Interactive Simulator: Multi-Step Logic Accuracy',
        desc: 'Increase reasoning steps and few-shot examples to see how logic accuracy scales on complex benchmarks.',
        out: 'Multi-Step Benchmark Accuracy:',
        sliders: [
            { k: 'steps', label: 'Chain-of-Thought Depth:', min: 1, max: 5, value: 4, fmt: v => v === 1 ? '1 Step (Direct)' : v + ' Reasoning Steps' },
            { k: 'shots', label: 'Few-Shot Examples Provided:', min: 0, max: 5, value: 3, fmt: v => plural(v, 'Example', 'Examples') }
        ],
        calc: v => {
            const a = Math.min(98.5, 42 + v.steps * 8.5 + v.shots * 4.5);
            return { out: a.toFixed(1) + '%', badge: a >= 85 ? ['VERIFIED LOGIC CHAIN', GREEN] : a >= 65 ? ['PARTIAL REASONING', AMBER] : ['HIGH LOGIC ERROR RISK', RED] };
        }
    },
    '2.3': {
        icon: '🌡️', title: 'Interactive Simulator: Temperature vs. Hallucination Risk',
        desc: 'Slide the temperature dial to observe the trade-off between deterministic accuracy and creative randomness.',
        out: 'Estimated Hallucination Risk:',
        sliders: [{ k: 'temp', label: 'Model Temperature Setting:', min: 0, max: 1.5, step: 0.1, value: 0.2, fmt: v => v.toFixed(1) }],
        calc: v => {
            const r = Math.min(96, Math.round(8 + v.temp * 58));
            return { out: r + '%', badge: v.temp <= 0.3 ? ['DETERMINISTIC / FACTUAL', GREEN] : v.temp <= 0.8 ? ['BALANCED CREATIVITY', AMBER] : ['HIGH CREATIVITY / HALLUCINATION RISK', RED] };
        }
    },
    '3.1': {
        icon: '⚖️', title: 'Interactive Simulator: Academic Integrity & Citation Auditor',
        desc: 'Test how different levels of AI usage and disclosure affect academic compliance.',
        out: 'Academic Review Status:',
        sliders: [
            { k: 'usage', label: 'Level of AI Assistance Used:', min: 0, max: 2, value: 1, fmt: v => ['Brainstorming Only', 'Outline & Grammar Check', 'Drafting Paragraphs'][v] },
            { k: 'disclosure', label: 'Citation & Disclosure Level:', min: 0, max: 2, value: 2, fmt: v => ['No Citation', 'Informal Mention', 'Full APA/MLA Citation + Prompt Log'][v] }
        ],
        calc: v => {
            if (v.usage === 2 && v.disclosure < 2) return { out: 'Violation Risk', badge: ['PLAGIARISM FLAG', RED] };
            if (v.disclosure === 0) return { out: 'Missing Attribution', badge: ['NEEDS CITATION', AMBER] };
            return { out: '100% Compliant', badge: ['ETHICAL SCHOLAR', GREEN] };
        }
    },
    '3.2': {
        icon: '🛡️', title: 'Interactive Simulator: Dataset Fairness & Privacy Auditor',
        desc: 'Adjust dataset demographic balance and PII anonymization to evaluate ethical readiness.',
        out: 'Ethical Compliance Score:',
        sliders: [
            { k: 'diversity', label: 'Demographic Representation Balance:', min: 10, max: 100, value: 85, fmt: v => v + '%' },
            { k: 'pii', label: 'PII Scrubbing & Anonymization:', min: 10, max: 100, value: 90, fmt: v => v + '%' }
        ],
        calc: v => {
            const f = Math.round(v.diversity * 0.6 + v.pii * 0.4);
            return { out: f + ' / 100', badge: f >= 80 ? ['BALANCED & ANONYMIZED', GREEN] : f >= 50 ? ['MODERATE SKEW DETECTED', AMBER] : ['HIGH BIAS / PRIVACY LEAK', RED] };
        }
    },
    '3.3': {
        icon: '🕵️', title: 'Interactive Simulator: Synthetic Media Forensics',
        desc: 'Adjust detected visual anomalies and C2PA metadata verification to calculate deepfake probability.',
        out: 'Synthetic Manipulation Probability:',
        sliders: [
            { k: 'artifacts', label: 'Visual/Audio Artifacts Detected:', min: 0, max: 5, value: 1, fmt: v => plural(v, 'Anomaly', 'Anomalies') },
            { k: 'metadata', label: 'Cryptographic Provenance (C2PA):', min: 0, max: 1, value: 1, fmt: v => v ? 'C2PA Verified' : 'Stripped / Missing' }
        ],
        calc: v => {
            const p = Math.min(99, Math.max(4, v.artifacts * 16 + (v.metadata ? 0 : 28)));
            return { out: p + '%', badge: p >= 65 ? ['SYNTHETIC / DEEPFAKE', RED] : p >= 35 ? ['UNVERIFIED SOURCE', AMBER] : ['AUTHENTIC MEDIA', GREEN] };
        }
    },
    '4.1': {
        icon: '🧹', title: 'Interactive Simulator: Dataset Hygiene vs. Model Accuracy',
        desc: 'Lower the missing values and outlier rates to watch downstream model accuracy climb!',
        out: 'Resulting Validation Accuracy:',
        sliders: [
            { k: 'missing', label: 'Unresolved Missing Values:', min: 0, max: 40, value: 5, fmt: v => v + '%' },
            { k: 'outliers', label: 'Corrupted Outliers Remaining:', min: 0, max: 30, value: 4, fmt: v => v + '%' }
        ],
        calc: v => {
            const a = clamp(98 - v.missing * 0.9 - v.outliers * 1.1, 32, 97.5);
            return { out: a.toFixed(1) + '%', badge: a >= 85 ? ['CLEAN PIPELINE', GREEN] : a >= 65 ? ['NOISY DATASET', AMBER] : ['GARBAGE IN, GARBAGE OUT', RED] };
        }
    },
    '4.2': {
        icon: '📊', title: 'Interactive Simulator: Split Ratio & Epoch Overfitting',
        desc: 'Balance your train/test split and training epochs to maximize unseen test accuracy.',
        out: 'Unseen Test Set Accuracy:',
        sliders: [
            { k: 'split', label: 'Dataset Split Ratio:', min: 50, max: 95, step: 5, value: 80, fmt: v => `${v}% Train / ${100 - v}% Test` },
            { k: 'epochs', label: 'Training Iterations:', min: 5, max: 100, step: 5, value: 25, fmt: v => v + ' Epochs' }
        ],
        calc: v => {
            const overfit = v.epochs > 50 ? (v.epochs - 50) * 0.55 : 0;
            const splitPenalty = (v.split < 65 || v.split > 90) ? 14 : 0;
            const a = clamp(94 - overfit - splitPenalty, 40, 96.4);
            return { out: a.toFixed(1) + '%', badge: a >= 85 ? ['OPTIMAL GENERALIZATION', GREEN] : v.epochs > 60 ? ['OVERFITTING DETECTED', RED] : ['SUBOPTIMAL SPLIT', AMBER] };
        }
    },
    '4.3': {
        icon: '⚙️', title: 'Interactive Simulator: Signal-to-Noise Feature Selector',
        desc: 'Add engineered signal features and prune irrelevant noise columns to maximize F1 performance.',
        out: 'Model Signal Score (F1):',
        sliders: [
            { k: 'signal', label: 'High-Signal Domain Features:', min: 1, max: 6, value: 5, fmt: v => plural(v, 'Feature', 'Features') },
            { k: 'noise', label: 'Irrelevant Noise Columns:', min: 0, max: 8, value: 1, fmt: v => plural(v, 'Noise Column', 'Noise Columns') }
        ],
        calc: v => {
            const f = clamp(52 + v.signal * 7.5 - v.noise * 4.5, 35, 97);
            return { out: f.toFixed(1) + '%', badge: f >= 82 ? ['HIGH PREDICTIVE SIGNAL', GREEN] : f >= 62 ? ['MODERATE NOISE', AMBER] : ['DIMENSIONALITY NOISE', RED] };
        }
    },
    '5.1': {
        icon: '🔍', title: 'Interactive Simulator: XAI & Governance Audit Score',
        desc: 'Configure feature explainability coverage and bias auditing to evaluate public trust readiness.',
        out: 'Governance Trust Index:',
        sliders: [
            { k: 'xai', label: 'Feature Attribution Transparency:', min: 10, max: 100, value: 80, fmt: v => v + '%' },
            { k: 'audit', label: 'Independent Subgroup Bias Audit:', min: 0, max: 1, value: 1, fmt: v => v ? 'Active Bias Audit' : 'No Audit' }
        ],
        calc: v => {
            const t = Math.min(99, Math.round(v.xai * 0.7 + (v.audit ? 30 : 0)));
            return { out: t + ' / 100', badge: t >= 80 ? ['TRANSPARENT & AUDITED', GREEN] : t >= 50 ? ['PARTIAL EXPLAINABILITY', AMBER] : ['OPAQUE BLACK-BOX', RED] };
        }
    },
    '5.2': {
        icon: '📜', title: 'Interactive Simulator: IP & Dataset Licensing Risk',
        desc: 'Evaluate how dataset licensing and transformative human editing affect copyright risk.',
        out: 'Estimated IP Dispute Risk:',
        sliders: [
            { k: 'license', label: 'Source Dataset License Type:', min: 0, max: 2, value: 2, fmt: v => ['Unlicensed Scraped Data', 'Creative Commons (CC-BY)', 'Public Domain / Permitted'][v] },
            { k: 'transform', label: 'Human Transformative Editing:', min: 0, max: 100, value: 80, fmt: v => v + '%' }
        ],
        calc: v => {
            const r = clamp((2 - v.license) * 35 + Math.round((100 - v.transform) * 0.25), 5, 95);
            return { out: r + '% Risk', badge: r <= 25 ? ['IP COMPLIANT', GREEN] : r <= 55 ? ['REVIEW LICENSING', AMBER] : ['HIGH INFRINGEMENT RISK', RED] };
        }
    },
    '5.3': {
        icon: '🚧', title: 'Interactive Simulator: Dual-Layer Guardrail Defense',
        desc: 'Tune input prompt screening and output moderation strength to block adversarial attacks.',
        out: 'Adversarial Block Rate:',
        sliders: [
            { k: 'input', label: 'Input Prompt Injection Classifier:', min: 10, max: 100, value: 90, fmt: v => v + '%' },
            { k: 'output', label: 'Output Moderation & PII Filter:', min: 10, max: 100, value: 88, fmt: v => v + '%' }
        ],
        calc: v => {
            const d = Math.min(99.5, v.input * 0.5 + v.output * 0.5);
            return { out: d.toFixed(1) + '%', badge: d >= 85 ? ['JAILBREAKS BLOCKED', GREEN] : d >= 55 ? ['MODERATE PROTECTION', AMBER] : ['VULNERABLE TO INJECTION', RED] };
        }
    },
    '6.1': {
        icon: '📐', title: 'Interactive Simulator: Precision, Recall & F1 Calculator',
        desc: 'Adjust Precision and Recall sliders to compute the live harmonic F1-Score!',
        out: 'Calculated Harmonic F1-Score:',
        sliders: [
            { k: 'precision', label: 'Model Precision:', min: 20, max: 100, value: 88, fmt: v => v + '%' },
            { k: 'recall', label: 'Model Recall:', min: 20, max: 100, value: 84, fmt: v => v + '%' }
        ],
        calc: v => {
            const p = v.precision / 100, r = v.recall / 100;
            const f1 = (p + r) > 0 ? (2 * p * r) / (p + r) * 100 : 0;
            return { out: f1.toFixed(1) + '%', badge: f1 >= 85 ? ['PRODUCTION BENCHMARK', GREEN] : f1 >= 65 ? ['NEEDS THRESHOLD TUNING', AMBER] : ['FAILS BENCHMARK', RED] };
        }
    },
    '6.2': {
        icon: '🤝', title: 'Interactive Simulator: RLHF Alignment & Reward Balance',
        desc: 'Adjust human preference comparisons and KL-divergence regularization to tune alignment quality.',
        out: 'Human Alignment Score:',
        sliders: [
            { k: 'rlhf', label: 'Human Preference Dataset Size:', min: 10, max: 100, value: 85, fmt: v => v + 'k Comparisons' },
            { k: 'kl', label: 'KL-Divergence Anti-Hacking Penalty:', min: 10, max: 100, value: 80, fmt: v => v + '%' }
        ],
        calc: v => {
            const a = Math.min(99, Math.round(v.rlhf * 0.65 + v.kl * 0.35));
            return { out: a + '%', badge: a >= 80 ? ['HELPFUL, HONEST & HARMLESS', GREEN] : a >= 50 ? ['PARTIALLY ALIGNED', AMBER] : ['REWARD HACKING RISK', RED] };
        }
    },
    '6.3': {
        icon: '🚀', title: 'Interactive Simulator: Autonomous Agent Deployment Readiness',
        desc: 'Combine benchmark evaluation rigor with Human-in-the-Loop oversight to certify safe deployment.',
        out: 'Deployment Certification Score:',
        sliders: [
            { k: 'rigor', label: 'Pre-Deployment Eval Rigor:', min: 20, max: 100, value: 90, fmt: v => v + '%' },
            { k: 'hitl', label: 'Human Oversight Architecture:', min: 0, max: 1, value: 1, fmt: v => v ? 'Human-in-the-Loop Active' : 'Fully Autonomous' }
        ],
        calc: v => {
            const r = Math.min(100, Math.round(v.rigor * 0.7 + (v.hitl ? 30 : 0)));
            return { out: r + '%', badge: r >= 85 ? ['SAFE FOR DEPLOYMENT', GREEN] : r >= 55 ? ['SANDBOX TESTING ONLY', AMBER] : ['UNSAFE AUTONOMY', RED] };
        }
    }
};

function simBox(key, opts = {}) {
    const c = SIMS[key];
    const sliders = c.sliders.map(s => `
        <div class="slider-wrapper">
            <div class="slider-label-row"><label for="sim-${key}-${s.k}">${esc(s.label)}</label><span class="highlight-val" data-val="${s.k}"></span></div>
            <input type="range" id="sim-${key}-${s.k}" data-k="${s.k}" min="${s.min}" max="${s.max}" step="${s.step || 1}" value="${s.value}">
        </div>`).join('');
    return `
        <div class="simulator-box${opts.locked ? ' sim-locked' : ''}" data-sim="${key}">
            ${opts.locked ? `<div class="sim-lock-msg"><div><strong>🔒 Watch the lesson video above to unlock this simulator.</strong><button type="button" class="btn-skip">I've already watched it</button></div></div>` : ''}
            <div class="simulator-header"><span class="sim-icon">${c.icon}</span><div><h4>${esc(c.title)}</h4><p>${esc(c.desc)}</p></div></div>
            ${c.before || ''}
            ${sliders}
            ${c.preview ? `<div class="prompt-preview"><strong>Live Prompt Preview:</strong><div data-preview></div></div>` : ''}
            <div class="simulator-output-row">
                <div><span class="output-title">${esc(c.out)}</span><span class="sim-out" data-out></span></div>
                <div class="spam-badge-pill" data-badge></div>
            </div>
        </div>`;
}

function updateSim(box) {
    const c = SIMS[box.dataset.sim];
    if (!c) return;
    const v = {};
    c.sliders.forEach(s => {
        const n = parseFloat($(`[data-k="${s.k}"]`, box).value);
        v[s.k] = Number.isNaN(n) ? s.value : n;      // NaN check (not "||") so a slider at 0 works
    });
    c.sliders.forEach(s => { $(`[data-val="${s.k}"]`, box).textContent = s.fmt ? s.fmt(v[s.k]) : v[s.k]; });
    const r = c.calc(v);
    $('[data-out]', box).textContent = r.out;
    const badge = $('[data-badge]', box);
    badge.textContent = r.badge[0];
    badge.style.background = r.badge[1];
    badge.style.color = r.badge[1] === AMBER ? '#111' : '#fff';
    const pv = $('[data-preview]', box);
    if (pv && r.preview) pv.textContent = r.preview;
    if (c.apply) c.apply(v, box);
}

// ============================================================================
// 3. LESSON CONTENT (modules 1 - 6, lessons 1.1 - 6.3)
// ============================================================================
const hdr = (badge, title, lead, cls = '') => `<div class="article-header"><span class="article-badge ${cls}">${badge}</span><h2>${title}</h2><p>${lead}</p></div>`;
const h3 = t => `<h3>${t}</h3>`;
const para = t => `<p>${t}</p>`;
const callout = (title, body) => `<div class="article-callout"><h4>${title}</h4><p>${body}</p></div>`;
const takeaway = body => callout('Key Takeaway', body);
const cards = list => `<div class="paradigms-stack">${list.map(([h, b]) => `<div class="paradigm-row-card"><h4>${h}</h4><p>${b}</p></div>`).join('')}</div>`;
const article = (...parts) => `<div class="lesson-article-container">${parts.join('')}</div>`;

const VIDEO_SRC = 'videos/Module_1_1_Final_Video_Webmaster.mp4';

const MODULES = [
    { id: 1, title: 'MODULE 1: INTRO TO AI', desc: 'Foundations of artificial intelligence, machine learning, and basic neural networks.' },
    { id: 2, title: 'MODULE 2: PRACTICAL AI TOOLS', desc: 'Prompt engineering, context strategies, model temperature, and verification.' },
    { id: 3, title: 'MODULE 3: ETHICS & INTEGRITY', desc: 'Academic citing guidelines, dataset bias, data privacy, and synthetic media risks.' },
    { id: 4, title: 'MODULE 4: DATA & TRAINING', desc: 'Data cleaning, train/test splits, overfitting, and feature engineering.' },
    { id: 5, title: 'MODULE 5: ADVANCED ETHICS', desc: 'Explainable AI, copyright and IP compliance, and safety guardrails.' },
    { id: 6, title: 'MODULE 6: TESTING & EVALUATION', desc: 'Benchmark testing, precision and recall metrics, human alignment, and the future of AI.' }
];

const LESSONS = {
    1: {
        title: 'Module 1: Fundamental AI Concepts',
        subs: {
            1: {
                title: '1.1 Machine Learning Fundamentals', game: 'rocket',
                html: () => article(
                    hdr('Core Concept Article', 'Demystifying Machine Learning', 'An exciting journey into how computers stop following rigid rules and start learning from experience just like humans do.'),
                    h3('1. The Big Shift: Traditional Coding vs. Machine Learning'),
                    para(`For a long time, writing computer software meant giving a computer strict, step-by-step instructions. If a programmer wanted to build a spam filter for an email inbox, they had to sit down and write thousands of manual rules by hand—such as <code>IF message contains "WINNER" AND sender is unknown THEN mark as spam</code>. While this works for simple tasks, it totally falls apart in the real world where language changes constantly, pictures look different every time, and new tricks pop up every single day.`),
                    para(`<strong>Machine Learning (ML)</strong> completely flips this script. Instead of forcing human programmers to invent every single rule, engineers feed the computer massive amounts of examples and correct answers. The computer then looks at the data, figures out patterns all on its own, and creates its own rules to make smart guesses about new things it has never seen before.`),
                    `<img src="images/Module1Image.jpg" alt="Comparison diagram showing traditional programming versus machine learning data flow" class="content-lesson-img" loading="lazy">`,
                    takeaway('Traditional programming is like teaching someone a recipe step-by-step; Machine Learning is like showing someone hundreds of pictures of food until they learn how to cook on their own.'),
                    h3('2. The Four Core Pillars of Machine Learning'),
                    para('To solve different kinds of problems and build powerful technologies, computer scientists divide machine learning into four fundamental pillars. Each one handles data and challenges in a unique way:'),
                    `<div class="paradigms-stack" style="grid-template-columns:1fr;">${[
                        ['A. Supervised Learning', 'Think of this like learning with a teacher checking your homework. The computer is given practice questions that already have the correct answers attached. It practices over and over until it can solve new, unseen problems accurately. Common examples include email spam filters and apps that predict house prices.'],
                        ['B. Unsupervised Learning', 'Think of this like exploring a messy room with no guide. The computer is given a pile of completely unlabeled data and has to find hidden groups, patterns, or similarities on its own. Stores use this to group shoppers with similar buying habits into categories.'],
                        ['C. Reinforcement Learning', 'Think of this like playing a video game through trial and error. An AI agent takes actions in an environment, earning points for good moves and losing points for mistakes. Over time, it figures out the best strategy to win. This is how self-driving cars and robot arms learn to navigate.'],
                        ['D. Deep Learning & Neural Networks', 'Inspired by the human brain, deep learning uses multi-layered artificial neural networks to process complex data. This is the advanced engine behind modern breakthroughs like facial recognition, voice assistants, and generative AI art tools.']
                    ].map(([h, b]) => `<div class="paradigm-row-card"><h4>${h}</h4><p>${b}</p></div>`).join('')}</div>`,
                    `<img src="images/Module1Image1.1.jpg" alt="Illustration of the four machine learning paradigms with icons and brief descriptions" class="content-lesson-img" loading="lazy">`,
                    `<div class="video-box">
                        <div class="video-head"><span class="sim-icon">🎬</span><div><h4>Lesson Video: Machine Learning Fundamentals</h4><p>Watch the video first. The simulator below unlocks when it finishes.</p></div></div>
                        <video id="lesson-video-1-1" controls preload="metadata" playsinline>
                            <source src="${VIDEO_SRC}" type="video/mp4">
                            Your browser does not support HTML5 video. <a href="${VIDEO_SRC}">Download the lesson video</a>.
                        </video>
                    </div>`,
                    simBox('1.1', { locked: !store.get('video11Watched', false) })
                )
            },
            2: {
                title: '1.2 Neural Networks & Deep Learning', game: 'blockblast',
                html: () => article(
                    hdr('Deep Learning', 'Neural Networks & Modern AI Systems', `Learn how neural networks process information, recognize patterns, and power today's advanced AI systems such as ChatGPT and image generators.`),
                    `<div class="article-callout article-reading-card">
                        <h4>📖 Required Reading</h4>
                        <p>Read IBM's explanation of Neural Networks before completing the activity below.</p>
                        <div class="external-article-card">
                            <div><div class="source-label">IBM Technology</div><div class="article-title">What Are Neural Networks?</div><div class="article-subtitle">External educational article</div></div>
                            <a class="read-article-btn" href="https://www.ibm.com/topics/neural-networks" target="_blank" rel="noopener">Read Article →</a>
                        </div>
                    </div>`,
                    h3('Focus Questions'),
                    `<ul class="focus-list"><li>What is an artificial neuron?</li><li>What are weights and biases?</li><li>What is an activation function?</li><li>Why do neural networks need hidden layers?</li><li>How do neural networks learn?</li></ul>`,
                    `<div class="simulator-box neural-panel">
                        <div class="simulator-header"><span class="sim-icon">🧠</span><div><h4>Knowledge Check</h4><p>Select the correct neural network architecture.</p></div></div>
                        <div id="nn-options"></div>
                        <div id="nn-result" class="nn-result" role="status">Select an answer above.</div>
                    </div>`,
                    callout('🎮 BlockBlast Challenge', `After completing the knowledge check, continue to the BlockBlast activity to reinforce what you've learned.`)
                )
            },
            3: {
                title: '1.3 Computer Vision & Generative AI Risks', game: 'pirate',
                html: () => article(
                    hdr('Vision & Reliability', 'Computer Vision & Generative Hallucinations', 'Analyzing how machines interpret pixel data, exploring feature extraction, and examining the critical reliability risks of generative AI hallucinations.', 'vision-badge'),
                    h3('1. Computer Vision (CV) Fundamentals'),
                    para('Computer Vision is a subfield of artificial intelligence that trains computers to extract high-level semantic understanding from digital images, video feeds, and multi-dimensional sensor arrays. Unlike humans—who instantly recognize a face or a road sign—a computer processes a massive grid of multi-channel numerical matrix values (RGB values ranging from 0 to 255 per pixel).'),
                    para('To bridge this gap, CV systems utilize specialized architectures called <strong>Convolutional Neural Networks (CNNs)</strong>. CNNs slide mathematical filters (called kernels) across pixel grids layer by layer:'),
                    `<ul class="focus-list"><li><strong>Early Layers:</strong> Detect basic geometric traits like sharp edges, horizontal lines, and color gradients.</li><li><strong>Middle Layers:</strong> Combine edges to recognize textures, curves, and patterns (like fur texture or tire treads).</li><li><strong>Deep Layers:</strong> Assemble features into complete objects (like a cat, a pedestrian, or a traffic light).</li></ul>`,
                    callout('🚗 Real-World Impact', 'From autonomous vehicle lane detection and facial recognition to medical MRI scan tumor segmentation, computer vision transforms raw optical matrix data into life-saving automated decisions.'),
                    h3('2. Generative Model Hallucinations'),
                    para('As generative AI models become a standard part of software toolkits, understanding their failure modes is crucial. One of the most prominent risks is the <strong>hallucination phenomenon</strong>, where an AI model generates factually incorrect, nonsensical, or entirely fabricated information while maintaining an authoritative, highly confident tone.'),
                    para('Because generative language models predict the next most statistically likely token based on training correlations rather than performing logical truth verification, they can easily invent fake academic citations, non-existent historical events, or buggy code snippets. Cross-referencing primary human sources is therefore mandatory in professional and academic environments.'),
                    h3('3. Edge Cases & Adversarial Vulnerabilities'),
                    para(`Computer vision systems are also vulnerable to <strong>adversarial attacks</strong>—tiny, human-imperceptible pixel modifications that trick neural networks into misclassifying objects entirely. For example, placing a tiny, inconspicuous sticker on a stop sign can cause an autonomous vehicle's vision model to classify it as a 45 MPH speed limit sign, proving that AI pattern recognition operates very differently from human cognitive reasoning.`),
                    simBox('1.3')
                )
            }
        }
    },
    2: {
        title: 'Module 2: Practical AI Tools & Techniques',
        subs: {
            1: {
                title: '2.1 Foundational Prompt Engineering', game: 'rocket',
                html: () => article(
                    hdr('Practical AI Mastery', 'Foundational Prompt Engineering', 'Learn how to communicate with Large Language Models (LLMs) using structured frameworks that turn vague guesses into precise, reliable results.'),
                    h3('1. Why Prompts Matter: Predicting Tokens, Not Reading Minds'),
                    para(`Large Language Models do not "understand" intent the way a human teacher or teammate does—they predict the most statistically probable sequence of words (tokens) that follows your input. When you type a vague prompt like <code>"Write about climate change"</code>, the model has to guess your grade level, format, tone, and focus, often producing generic filler.`),
                    para('<strong>Prompt Engineering</strong> is the craft of designing clear, structured instructions that narrow down the model\'s probability space so it generates exactly what you need on the first try.'),
                    takeaway('Garbage prompts produce generic answers. Giving an AI a clear Role, rich Context, and strict Constraints transforms it from a random text generator into a specialized assistant.'),
                    h3('2. The Four Core Pillars of a High-Impact Prompt'),
                    para('Every reliable prompt combines four building blocks that eliminate ambiguity and lock in output quality:'),
                    cards([
                        ['A. Role & Persona', 'Assigning a specific expertise—such as <em>"Act as a senior cybersecurity analyst"</em> or <em>"Act as an AP Biology tutor"</em>—activates domain-specific vocabulary and framing within the model.'],
                        ['B. Task & Action Verb', 'Start with an unmistakable action verb: <strong>Summarize, Compare, Debug, Outline,</strong> or <strong>Critique</strong>. Never leave the model guessing what operation to perform.'],
                        ['C. Context & Audience', `Provide background facts, target audience (e.g., <em>"for 9th-grade students"</em>), and any reference text the model should rely on so it doesn't invent details.`],
                        ['D. Format & Constraints', 'Specify exact boundaries: word limits, bulleted lists, JSON/table structure, or negative constraints like <em>"Do not use technical jargon."</em>']
                    ]),
                    simBox('2.1')
                )
            },
            2: {
                title: '2.2 Advanced Reasoning Frameworks', game: 'blockblast',
                html: () => article(
                    hdr('Reasoning & Logic', 'Chain-of-Thought & Few-Shot Frameworks', 'Unlock multi-step problem solving in LLMs by guiding models to show their intermediate reasoning steps before committing to a final answer.'),
                    h3('1. Why LLMs Fail at Mental Math & Multi-Step Logic'),
                    para('Because standard language models generate one token at a time, asking a model to jump straight to a complex final answer forces it to compute an entire multi-step problem inside a single forward pass. When asked to guess immediately, models frequently make arithmetic or logical slips.'),
                    para('<strong>Chain-of-Thought (CoT) Prompting</strong> solves this by instructing the model to <em>"think step-by-step"</em>. Each generated reasoning step becomes new context that helps the model compute the next step accurately.'),
                    takeaway(`Asking an AI to show its work isn't just for human readability—writing out intermediate steps literally gives the neural network extra computation tokens to solve hard logic problems.`),
                    h3('2. Four Proven Reasoning Strategies'),
                    cards([
                        ['A. Zero-Shot Prompting', 'Asking a direct question with zero examples. Fast for simple facts, but prone to formatting drift or logic shortcuts on complex tasks.'],
                        ['B. Few-Shot Prompting', 'Providing 2 to 5 input-output examples inside the prompt so the model mirrors your exact reasoning pattern and structure.'],
                        ['C. Chain-of-Thought (CoT)', 'Breaking problems into sequential sub-steps before stating the final conclusion, dramatically boosting math, coding, and debugging accuracy.'],
                        ['D. Self-Critique & Verification', 'Prompting the AI to review its own draft for edge cases, hidden assumptions, or calculation errors before finalizing the response.']
                    ]),
                    simBox('2.2')
                )
            },
            3: {
                title: '2.3 Hyperparameters & Fact Verification', game: 'pirate',
                html: () => article(
                    hdr('Model Controls & Truth', 'Temperature, Sampling & Fact Verification', 'Master the mathematical knobs that control AI creativity versus determinism, and build habits to catch confident hallucinations.'),
                    h3('1. How Temperature Shapes Next-Token Probability'),
                    para('At every step of text generation, an LLM ranks thousands of possible next words by probability. The <strong>Temperature</strong> hyperparameter (typically ranging from <code>0.0</code> to <code>1.5</code>) flattens or sharpens that probability curve.'),
                    para('At <strong>low temperature (0.0 – 0.3)</strong>, the model almost always picks the highest-probability token, making outputs consistent, factual, and ideal for coding or data extraction. At <strong>high temperature (0.9 – 1.5)</strong>, lower-probability words get chosen more often, sparking creative brainstorming—but also increasing the risk of fabricated facts.'),
                    takeaway('Never use high temperature for research summaries or code debugging, and never treat any LLM output as a primary source without verifying citations against trusted references.'),
                    simBox('2.3')
                )
            }
        }
    },
    3: {
        title: 'Module 3: Ethical AI Usage & Academic Integrity',
        subs: {
            1: {
                title: '3.1 Academic Citation Standards', game: 'rocket',
                html: () => article(
                    hdr('Ethics & Integrity', 'Academic Citation & Responsible AI Standards', 'Learn how to use generative AI transparently as a brainstorming and study partner while upholding strict academic honesty.'),
                    h3('1. Study Aid vs. Ghostwriter: Drawing the Ethical Line'),
                    para('Generative AI can explain difficult concepts, quiz you on vocabulary, or help you debug syntax errors. However, submitting AI-generated essays, code, or artwork as your own original work violates academic integrity policies and deprives you of the critical thinking skills you are building in school.'),
                    para('Whenever an assignment permits AI assistance, <strong>transparency is mandatory</strong>. Both MLA and APA provide official citation formats that credit the AI tool, the version used, the date accessed, and the specific prompt that generated the output.'),
                    takeaway('Good rule of thumb: Use AI to ask <em>"How do I structure this argument?"</em> or <em>"Why is my loop throwing an error?"</em>—never <em>"Write this assignment for me."</em> Always cite any AI tool that contributed to your workflow.'),
                    h3('2. The Four Pillars of Student AI Integrity'),
                    cards([
                        ['A. Check Instructor Policy First', 'Every teacher and competition (including TSA) sets clear rules on where AI is allowed, restricted, or prohibited.'],
                        ['B. Cite Tool, Model & Date', 'Document the exact platform (e.g., ChatGPT, Gemini, Claude), model version, and date in your Works Cited or References page.'],
                        ['C. Keep a Prompt & Verification Log', 'Save your prompts and note how you fact-checked and rewrote ideas into your own authentic voice.'],
                        ['D. Human Authorship & Accountability', 'Because AI cannot take responsibility for errors or bias, you are 100% accountable for every word and line of code you submit.']
                    ]),
                    simBox('3.1')
                )
            },
            2: {
                title: '3.2 Algorithmic Bias & Data Privacy', game: 'blockblast',
                html: () => article(
                    hdr('Fairness & Privacy', 'Algorithmic Bias & Data Privacy Protection', 'Discover how historical prejudices enter training datasets and why protecting Personally Identifiable Information (PII) is vital.'),
                    h3('1. How Historical Bias Enters Machine Learning'),
                    para('Algorithms do not possess personal prejudices, yet they frequently amplify inequality. When a model is trained on historical data—such as past hiring decisions, loan approvals, or medical studies that underrepresented certain demographics—it learns to treat historical bias as a predictive rule.'),
                    para('At the same time, typing private data—like full names, student IDs, medical details, or passwords—into public AI chatbots risks exposing <strong>Personally Identifiable Information (PII)</strong> through logs or model training pipelines.'),
                    takeaway('Fair AI requires diverse, representative training datasets and regular subgroup audits—and smart users never paste private personal data into public AI tools.'),
                    simBox('3.2')
                )
            },
            3: {
                title: '3.3 Deepfakes & Synthetic Media', game: 'pirate',
                html: () => article(
                    hdr('Media Literacy', 'Synthetic Media, Deepfakes & Digital Trust', 'Learn how generative audio and video synthesis works and how to spot visual artifacts and missing cryptographic provenance.'),
                    h3('1. Recognizing Synthetic Audio and Video'),
                    para('<strong>Deepfakes</strong> use generative neural networks (such as diffusion models and GANs) to clone voices or swap faces in video with startling realism. While synthetic media has positive uses in film dubbing and accessibility, malicious deepfakes threaten elections, online safety, and digital trust.'),
                    para('Verifying media requires checking both visual/audio cues (unnatural blinking, warped background edges, flat vocal cadence) and cryptographic provenance standards like <strong>C2PA Content Credentials</strong>.'),
                    takeaway('"Seeing is believing" no longer applies online. Always verify viral clips against multiple reputable news outlets and inspect metadata before sharing.'),
                    simBox('3.3')
                )
            }
        }
    },
    4: {
        title: 'Module 4: Data & Training Pipelines',
        subs: {
            1: {
                title: '4.1 Data Cleaning & Preprocessing', game: 'rocket',
                html: () => article(
                    hdr('Data Engineering', 'Data Cleaning & Preprocessing Pipelines', 'Explore why data scientists spend up to 80% of their time cleaning, normalizing, and structuring raw datasets before training a single model.'),
                    h3('1. The Golden Rule: Garbage In, Garbage Out'),
                    para('Even the most sophisticated neural network cannot learn accurate patterns from corrupted, duplicated, or inconsistent records. Real-world datasets collected from sensors, surveys, or web logs inevitably contain missing cells (<code>NaN</code>), extreme outliers, and mismatched units (such as mixing miles and kilometers in the same column).'),
                    para('<strong>Data Preprocessing</strong> transforms messy raw logs into clean, standardized numerical tensors ready for gradient descent.'),
                    takeaway('Better data beats a fancier algorithm almost every time. Cleaning missing values and scaling features is the foundation of reliable machine learning.'),
                    h3('2. Four Essential Preprocessing Steps'),
                    cards([
                        ['A. Handling Missing Values', 'Either drop incomplete rows when data is abundant or fill gaps using statistical imputation (mean, median, or mode).'],
                        ['B. Outlier Detection & Removal', 'Identify impossible sensor spikes or typos (like an age of 999) so extreme numbers do not skew model weights.'],
                        ['C. Normalization & Scaling', `Scale features onto a common range (e.g., <code>0.0</code> to <code>1.0</code>) so large numbers like house prices don't overpower smaller numbers like bedroom counts.`],
                        ['D. Categorical Encoding', 'Convert text labels (like <code>"Red"</code>, <code>"Blue"</code>, <code>"Green"</code>) into numerical vectors using One-Hot Encoding.']
                    ]),
                    simBox('4.1')
                )
            },
            2: {
                title: '4.2 Training vs Test Splits', game: 'blockblast',
                html: () => article(
                    hdr('Model Generalization', 'Train/Test Splits & Preventing Overfitting', 'Learn how data splits verify that an AI model truly understands patterns instead of simply memorizing the answer key.'),
                    h3('1. Memorization vs. True Generalization'),
                    para(`If you give a student the exact 20 questions that will appear on tomorrow's exam and they score 100%, did they master the subject or just memorize the sheet? Machine learning faces the exact same trap, known as <strong>Overfitting</strong>.`),
                    para('To test real-world <strong>generalization</strong>, engineers divide data into a <strong>Training Set (typically 70–80%)</strong> to learn patterns, a <strong>Validation Set</strong> to tune settings, and a locked <strong>Test Set (15–20%)</strong> that the model never sees until final evaluation.'),
                    takeaway('Never train on your test set! High training accuracy paired with low test accuracy is the classic signature of overfitting.'),
                    simBox('4.2')
                )
            },
            3: {
                title: '4.3 Feature Engineering', game: 'pirate',
                html: () => article(
                    hdr('Signal Extraction', 'Feature Engineering & Dimensionality', 'Discover how domain knowledge transforms raw columns into high-signal predictors that dramatically simplify model learning.'),
                    h3('1. Turning Raw Variables into Predictive Signals'),
                    para('<strong>Feature Engineering</strong> is the art of creating, combining, or selecting the most informative input variables for a machine learning model. For example, instead of feeding raw timestamps into a delivery-time predictor, engineering a boolean feature called <code>is_rush_hour</code> immediately exposes the pattern that matters most.'),
                    para('Conversely, feeding dozens of irrelevant noise columns causes the <strong>Curse of Dimensionality</strong>, slowing down training and confusing the model.'),
                    takeaway('Domain expertise shines in feature engineering: removing irrelevant noise columns while crafting meaningful ratios or flags boosts both speed and accuracy.'),
                    simBox('4.3')
                )
            }
        }
    },
    5: {
        title: 'Module 5: Advanced Ethics & Governance',
        subs: {
            1: {
                title: '5.1 Algorithmic Fairness & Transparency', game: 'rocket',
                html: () => article(
                    hdr('AI Governance', 'Explainable AI (XAI) & Algorithmic Fairness', 'Examine how organizations open up opaque "black-box" neural networks to audit high-stakes decisions in healthcare, finance, and hiring.'),
                    h3('1. Opening the Black Box with Explainable AI (XAI)'),
                    para('Deep neural networks can contain billions of weights, making it nearly impossible for a human to trace how a specific decision was reached by looking at raw numbers alone. In high-stakes domains—like medical diagnostics, bank loan approvals, or university admissions—simply saying <em>"the algorithm said no"</em> is unacceptable.'),
                    para(`<strong>Explainable AI (XAI)</strong> provides tools (such as feature attribution heatmaps and SHAP values) that highlight which exact inputs drove a model's prediction, enabling humans to audit fairness and appeal errors.`),
                    takeaway('Accountability requires transparency. When AI affects human opportunities or safety, developers must be able to explain <em>why</em> the model made its decision.'),
                    h3('2. Core Pillars of Responsible AI Governance'),
                    cards([
                        ['A. Local & Global Explainability', `Showing both how the overall model behaves and which specific factors influenced an individual user's outcome.`],
                        ['B. Disparate Impact Audits', 'Testing approval and error rates across demographic groups to ensure equal opportunity and catch hidden proxy bias.'],
                        ['C. Model Cards & Documentation', `Publishing transparent spec sheets detailing a model's training data, intended use cases, and known limitations.`],
                        ['D. Human Recourse & Appeals', 'Ensuring people affected by automated decisions have a clear path to request a human review.']
                    ]),
                    simBox('5.1')
                )
            },
            2: {
                title: '5.2 Copyright & IP Compliance', game: 'blockblast',
                html: () => article(
                    hdr('Intellectual Property', 'Copyright, Licensing & Fair Use in AI', 'Navigate the legal and ethical rules governing training datasets, open-source licenses, and generative AI outputs.'),
                    h3('1. Respecting Creators Across the AI Lifecycle'),
                    para('Modern generative models learn from billions of images, articles, and code repositories. Using copyrighted books, artwork, or proprietary code without permission or proper licensing raises serious intellectual property disputes.'),
                    para('Ethical developers verify dataset licenses (such as <strong>MIT, Apache 2.0, Creative Commons,</strong> or <strong>Public Domain</strong>) and ensure generated works are genuinely transformative rather than direct copies of protected art or text.'),
                    takeaway('Just because an image or snippet of code is publicly visible on the internet does not mean it is free to copy or train on without checking its license.'),
                    simBox('5.2')
                )
            },
            3: {
                title: '5.3 Safety Protocols & Guardrails', game: 'pirate',
                html: () => article(
                    hdr('AI Safety Engineering', 'Safety Guardrails, Red Teaming & Defense', 'Learn how engineers protect AI applications against prompt injection attacks, jailbreaks, and harmful outputs.'),
                    h3('1. Defense-in-Depth: Input & Output Guardrails'),
                    para('When an AI chatbot is deployed to students or customers, bad actors may attempt <strong>prompt injection</strong> or "jailbreak" tricks designed to override system instructions. To prevent misuse, engineers build multi-layered <strong>Safety Guardrails</strong>.'),
                    para('Input classifiers screen incoming prompts for malicious intent before they reach the main model, while output filters inspect responses to block toxic content, PII leaks, or unsafe advice—validated continuously through adversarial <strong>Red Teaming</strong>.'),
                    takeaway('Never rely on a single system prompt for security. True AI safety layers input validation, output moderation, and continuous red-team stress testing.'),
                    simBox('5.3')
                )
            }
        }
    },
    6: {
        title: 'Module 6: Testing & Evaluation',
        subs: {
            1: {
                title: '6.1 Benchmark Testing & Metrics', game: 'rocket',
                html: () => article(
                    hdr('Evaluation Science', 'Benchmark Testing, Precision & Recall', 'Learn why simple "accuracy" can be dangerously misleading and how Precision, Recall, and F1-Scores measure true model reliability.'),
                    h3(`1. Why Overall Accuracy Isn't Enough`),
                    para('Imagine a medical screening AI testing for a rare condition that affects only 1% of patients. If the AI lazily predicts <em>"Healthy"</em> for every single patient, it achieves <strong>99% accuracy</strong>—yet it fails to catch 100% of sick patients!'),
                    para('To prevent this blind spot, AI engineers evaluate classifiers using two complementary metrics: <strong>Precision</strong> (how many positive flags were actually correct) and <strong>Recall</strong> (how many real positive cases the model successfully caught), combined into the harmonic mean known as the <strong>F1-Score</strong>.'),
                    takeaway('High Precision means fewer false alarms; high Recall means fewer missed detections. A strong F1-Score proves the model balances both without cutting corners.'),
                    h3('2. Core Evaluation Concepts'),
                    cards([
                        ['A. Precision (Quality of Positives)', 'Formula: <code>TP / (TP + FP)</code>. Crucial when false alarms are costly, such as blocking legitimate emails as spam.'],
                        ['B. Recall (Coverage of Positives)', 'Formula: <code>TP / (TP + FN)</code>. Critical when missing a real case is dangerous, such as cancer screening or fraud detection.'],
                        ['C. F1-Score (Harmonic Balance)', 'Formula: <code>2 × (Precision × Recall) / (Precision + Recall)</code>. Punishes models that sacrifice one metric to inflate the other.'],
                        ['D. Standardized Benchmarks', 'Public test suites (like MMLU, HumanEval, and ImageNet) let researchers compare different models fairly on identical tasks.']
                    ]),
                    simBox('6.1')
                )
            },
            2: {
                title: '6.2 Model Alignment & Reinforcement', game: 'blockblast',
                html: () => article(
                    hdr('Human Alignment', 'RLHF & Aligning Models with Human Values', 'Understand how Reinforcement Learning from Human Feedback transforms raw next-word predictors into helpful, honest, and harmless assistants.'),
                    h3('1. From Raw Pretraining to Helpful Assistants'),
                    para('A base language model trained only to predict internet text might respond to a question with another question or generate unhelpful jargon. To align model behavior with human expectations, engineers apply <strong>RLHF (Reinforcement Learning from Human Feedback)</strong>.'),
                    para('Human reviewers compare pairs of model responses and rank which one is more helpful and safe. Those rankings train a <strong>Reward Model</strong>, which then fine-tunes the AI using reinforcement learning—while a <strong>KL-Divergence penalty</strong> stops the model from gaming the reward signal with repetitive or unnatural text.'),
                    takeaway('Pretraining gives an AI knowledge; RLHF alignment teaches it judgment, safety boundaries, and how to follow human intent constructively.'),
                    simBox('6.2')
                )
            },
            3: {
                title: '6.3 Future Horizons of AI', game: 'pirate',
                html: () => article(
                    hdr('Capstone & Future', 'Future Horizons & Responsible Innovation', 'Look ahead at autonomous AI agents, multimodal systems, and how the next generation of student innovators can build safe, human-centered technology.'),
                    h3('1. Agentic Workflows & Human-in-the-Loop Design'),
                    para('AI is rapidly evolving from single-turn chatbots into <strong>multimodal agents</strong> capable of reasoning across text, code, audio, and live video while using external software tools. As autonomy grows, keeping <strong>Humans-in-the-Loop (HITL)</strong> for high-impact approvals ensures technology amplifies human creativity rather than replacing human accountability.'),
                    para('Congratulations on completing the full AI Learning Portal curriculum! By combining technical literacy, rigorous evaluation metrics, and strong ethical guardrails, you are ready to lead responsibly in an AI-powered world.'),
                    takeaway(`The future of AI isn't automatic—it is shaped by the engineers, policymakers, and students who insist on transparency, fairness, and human oversight.`),
                    simBox('6.3')
                )
            }
        }
    }
};

// ============================================================================
// 4. PROGRESS, MODULE UNLOCKS & ROUTER
// ============================================================================
let completed = store.get('completedLessons', null);
if (completed === null) {
    // One-time migration from the old "maxUnlockedModule" system
    completed = {};
    const old = parseInt(localStorage.getItem('maxUnlockedModule'), 10) || 1;
    for (let m = 1; m < old; m++) for (let s = 1; s <= 3; s++) completed[`${m}.${s}`] = true;
    store.set('completedLessons', completed);
}

const lessonDone = (m, s) => !!completed[`${m}.${s}`];
const moduleDone = m => [1, 2, 3].every(s => lessonDone(m, s));
const previewMode = () => store.get('previewAll', false);
function maxUnlocked() {
    if (previewMode()) return 6;
    let n = 1;
    while (n < 6 && moduleDone(n)) n++;
    return n;
}
function completeLesson(m, s) {
    const key = `${m}.${s}`, before = maxUnlocked(), first = !completed[key];
    completed[key] = true;
    store.set('completedLessons', completed);
    const after = maxUnlocked();
    return { first, unlocked: after > before ? after : null };
}
function markPlayed(game) {
    const played = store.get('gamesPlayed', {});
    played[game] = true;
    store.set('gamesPlayed', played);
}
const LESSON_ORDER = [];
for (let m = 1; m <= 6; m++) for (let s = 1; s <= 3; s++) LESSON_ORDER.push([m, s]);

// ---- Modules grid
function renderModulesGrid() {
    const grid = $('#modules-grid');
    if (!grid) return;
    const limit = maxUnlocked();
    grid.innerHTML = MODULES.map((mod, i) => {
        const open = mod.id <= limit;
        const chips = [1, 2, 3].map(s => `<span class="lesson-chip${lessonDone(mod.id, s) ? ' done' : ''}">${lessonDone(mod.id, s) ? '✓ ' : ''}${mod.id}.${s}</span>`).join('');
        return `
            <div class="module-card${open ? '' : ' locked'}" id="card-module-${mod.id}" style="--pop-delay:${0.1 + i * 0.1}s">
                <h3>${esc(mod.title)}</h3>
                <p>${esc(mod.desc)}</p>
                <div class="lesson-chips">${chips}</div>
                <button class="quiz-btn" id="btn-module-${mod.id}" data-module="${mod.id}" ${open ? '' : 'disabled'}>${open ? 'Explore Module' : '🔒 Locked'}</button>
            </div>`;
    }).join('');
    const t = $('#preview-toggle');
    if (t) {
        const on = previewMode();
        t.classList.toggle('on', on);
        t.setAttribute('aria-pressed', on);
        t.textContent = on ? '🔓 Preview Mode ON: all modules unlocked (click to turn off)' : '🔒 Judge / Preview Mode: unlock all modules';
    }
}

// ---- Dashboard
const BADGES = [
    ['🚀', 'AI Pioneer', 'Complete Module 1', () => moduleDone(1)],
    ['🧱', 'Prompt Architect', 'Complete Module 2', () => moduleDone(2)],
    ['⚖️', 'Ethical Scholar', 'Complete Module 3', () => moduleDone(3)],
    ['📊', 'Data Expert', 'Complete Module 4', () => moduleDone(4)],
    ['🛡️', 'Governance Guru', 'Complete Module 5', () => moduleDone(5)],
    ['🎯', 'Alignment Master', 'Complete Module 6', () => moduleDone(6)],
    ['🧠', 'Quiz Ace', 'Unlock Half of Curriculum', () => MODULES.filter(m => moduleDone(m.id)).length >= 3],
    ['🕹️', 'Arcade Pro', 'Play Multiple Minigames', () => Object.keys(store.get('gamesPlayed', {})).length >= 2],
    ['🔥', 'Streak Master', 'Master All 6 Modules', () => MODULES.every(m => moduleDone(m.id))]
];

function updateDashboardStats() {
    const doneLessons = LESSON_ORDER.filter(([m, s]) => lessonDone(m, s)).length;
    const doneModules = MODULES.filter(m => moduleDone(m.id)).length;
    const pct = Math.round((doneLessons / LESSON_ORDER.length) * 100);
    const user = Portal.getActiveUser();
    const xp = user ? (user.xp || 0) : store.get('localXP', 0);

    $('#dashboard-progress-percent').textContent = pct + '%';
    $('#dashboard-progress-fill').style.width = pct + '%';
    $('#dashboard-progress-bar').setAttribute('aria-valuenow', pct);
    $('#dashboard-xp-text').textContent = xp + ' XP';
    $('#dashboard-modules-count').textContent = `${doneModules} / 6`;
    $('#dashboard-lessons-count').textContent = `${doneLessons} of ${LESSON_ORDER.length} lessons complete`;
    $('#badge-grid').innerHTML = BADGES.map(([ico, name, desc, test]) =>
        `<div class="achv${test() ? ' unlocked' : ''}"><span class="ico">${ico}</span><h4>${name}</h4><p>${desc}</p></div>`).join('');
    const cont = $('#dash-continue');
    if (cont) cont.textContent = doneLessons >= LESSON_ORDER.length ? 'Review a Lesson' : 'Continue Learning';
}

// ---- Router (hash based, so the back button and deep links work)
const VIEWS = { home: 'home-page-view', modules: 'modules-grid-view', lesson: 'modules-page-view', dashboard: 'dashboard-page-view', chatbot: 'chatbot-page-view', profile: 'profile-page' };
const ALIASES = { 'modules-grid': 'modules', 'profile-page': 'profile', 'profile-page-view': 'profile', 'references-page-view': 'references' };

function showView(id) {
    Object.entries(VIEWS).forEach(([key, domId]) => { const el = document.getElementById(domId); if (el) el.classList.toggle('is-active', key === id); });
    const navId = id === 'lesson' ? 'modules' : id;
    $$('.nav-links [data-page]').forEach(a => a.classList.toggle('active', a.dataset.page === navId));
    $('#nav-links').classList.remove('open');
    $('#nav-toggle').setAttribute('aria-expanded', 'false');
    if (id === 'modules') renderModulesGrid();
    if (id === 'dashboard') updateDashboardStats();
    window.scrollTo({ top: 0, behavior: 'auto' });
    updateReadProgress();
}

function route() {
    const hash = (location.hash || '#home').slice(1);
    const m = hash.match(/^module-(\d)(?:-(\d))?$/);
    if (m) { openLesson(parseInt(m[1], 10), parseInt(m[2] || '1', 10)); return; }
    const id = ALIASES[hash] || hash;
    if (id === 'references') { location.replace('references.html'); return; }
    showView(VIEWS[id] ? id : 'home');
}

window.showPage = function (id) {
    const target = ALIASES[id] || id;
    if (location.hash === '#' + target) route(); else location.hash = '#' + target;
};
window.navigateToModule = function (moduleId) {
    if (moduleId > maxUnlocked()) {
        toast(`Module ${moduleId} is locked. Complete Module ${moduleId - 1} first to unlock it.`, 'warn');
        return;
    }
    location.hash = `#module-${moduleId}-1`;
};

function openLesson(modId, subId) {
    if (!LESSONS[modId] || !LESSONS[modId].subs[subId]) { showPage('modules'); return; }
    if (modId > maxUnlocked()) { toast(`Module ${modId} is locked. Finish the previous module first.`, 'warn'); showPage('modules'); return; }
    const mod = LESSONS[modId], sub = mod.subs[subId];
    const tabs = Object.keys(mod.subs).map(k => `
        <button type="button" id="btn-lesson-${k}" class="${parseInt(k, 10) === subId ? 'active' : ''}" data-lesson="${modId}.${k}">${lessonDone(modId, k) ? '✓ ' : ''}Lesson ${modId}.${k}</button>`).join('');
    const idx = LESSON_ORDER.findIndex(([m, s]) => m === modId && s === subId);
    const prev = LESSON_ORDER[idx - 1], next = LESSON_ORDER[idx + 1];
    const pager = `
        <div class="lesson-pager">
            ${prev ? `<button type="button" class="btn-ghost" data-lesson="${prev[0]}.${prev[1]}">← Lesson ${prev[0]}.${prev[1]}</button>` : '<span></span>'}
            ${next ? `<button type="button" class="btn-ghost" data-lesson="${next[0]}.${next[1]}">Lesson ${next[0]}.${next[1]} →</button>` : ''}
        </div>`;

    $('#active-module-content').innerHTML = `
        <div class="lesson-top"><span class="kicker">Module ${modId} Overview</span><h1>${esc(mod.title)}</h1></div>
        <div class="lesson-tabs" role="tablist">${tabs}</div>
        <div class="lesson-kicker">${esc(sub.title)}</div>
        <div class="lesson-body">${sub.html()}</div>
        <div class="arcade-launch">
            <h3>Ready to Play Arcade Challenge ${modId}.${subId}?</h3>
            <p>Review the rules, answer questions correctly for power-ups and block shapes, and score 4 out of 5 to complete this lesson!</p>
            <button type="button" class="btn-launch" data-launch="${modId}.${subId}">🎮 Launch Minigame Quiz ${modId}.${subId}</button>
        </div>
        ${pager}`;

    showView('lesson');
    afterLessonRender(`${modId}.${subId}`);
}

function afterLessonRender(key) {
    $$('.simulator-box[data-sim]').forEach(updateSim);            // show correct starting values
    if (key === '1.1') {
        const video = $('#lesson-video-1-1'), box = $('.simulator-box[data-sim="1.1"]');
        const unlock = () => {
            store.set('video11Watched', true);
            if (box && box.classList.contains('sim-locked')) {
                box.classList.remove('sim-locked');
                const msg = $('.sim-lock-msg', box); if (msg) msg.remove();
                toast('Simulator unlocked. Try the sliders!', 'success');
            }
        };
        if (video) {
            video.addEventListener('ended', unlock);
            video.addEventListener('timeupdate', () => { if (video.duration && video.currentTime / video.duration > 0.95) unlock(); });
            let failed = false;
            const fail = () => {
                if (failed) return;
                failed = true;
                unlock();
                const holder = video.closest('.video-box');
                if (holder && !$('.video-error', holder)) {
                    video.insertAdjacentHTML('afterend', `<p class="video-error" style="margin:14px 0 0;padding:12px 16px;border:1px solid #f59e0b;border-radius:10px;color:#fbbf24;background:rgba(245,158,11,.1);">⚠️ The lesson video could not be loaded from <code>${esc(VIDEO_SRC)}</code>. Check that the file is in the <strong>videos</strong> folder next to index.html and the name matches exactly (it is case-sensitive on most web hosts). The simulator below has been unlocked.</p>`);
                }
            };
            video.addEventListener('error', fail, true);
            const src = $('source', video); if (src) src.addEventListener('error', fail);
        }
        const skip = $('.btn-skip', box || document);
        if (skip) skip.addEventListener('click', unlock);
    }
    if (key === '1.2') {
        const options = shuffle([
            ['Input Layer → Hidden Layer → Activation Function → Output Layer', true],
            ['Hidden Layer → Input Layer → Output Layer', false],
            ['Output Layer → Hidden Layer → Input Layer', false],
            ['Activation Function → Output Layer → Input Layer', false]
        ]);
        const wrap = $('#nn-options'), result = $('#nn-result');
        wrap.innerHTML = options.map(([t, ok], i) => `<button type="button" class="nn-option" data-ok="${ok}" data-i="${i}">${esc(t)}</button>`).join('');
        wrap.addEventListener('click', e => {
            const btn = e.target.closest('.nn-option');
            if (!btn || btn.disabled) return;
            const ok = btn.dataset.ok === 'true';
            result.className = 'nn-result ' + (ok ? 'correct' : 'incorrect');
            if (ok) {
                btn.classList.add('correct');
                $$('.nn-option', wrap).forEach(b => b.disabled = true);
                result.textContent = '✅ Correct! Neural networks process data from input to output through hidden layers.';
            } else {
                btn.classList.add('incorrect');
                result.textContent = '❌ Not quite. Review the article and try again.';
            }
        });
    }
}

function updateReadProgress() {
    const bar = $('#read-progress');
    if (!bar) return;
    const lesson = $('#modules-page-view');
    if (!lesson || !lesson.classList.contains('is-active')) { bar.style.width = '0'; return; }
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = max > 0 ? Math.min(100, (window.scrollY / max) * 100) + '%' : '0';
}

// ============================================================================
// 5. QUIZ DATABASE (format: [question, CORRECT answer, wrong, wrong, wrong])
//    Answer positions are re-arranged at runtime, so the right answer is not
//    always "A". See prepareQuiz().
// ============================================================================
const QUIZ = {
    '1.1': [
        ['What is Machine Learning?', 'Systems that learn statistical patterns from data', 'Software built entirely from hand-written IF-THEN rules', 'A faster type of computer hardware', 'An exact digital copy of the human brain'],
        ['Which ML paradigm learns from labeled input-output examples?', 'Supervised Learning', 'Unsupervised Learning', 'Reinforcement Learning', 'Rule-Based Programming'],
        ['In Unsupervised Learning, what does the model try to discover?', 'Hidden groups and patterns in unlabeled data', 'The correct label for every example', 'The highest-scoring game strategy', 'Syntax errors in its own code'],
        ['What drives learning in Reinforcement Learning?', 'Rewards and penalties earned through trial and error', 'A teacher marking every answer in advance', 'Grouping unlabeled data into clusters', 'Manually written rules'],
        ['Why is ML preferred over hand-coded rules for tasks like spam filtering?', 'Patterns change constantly and are too complex for manual rules', 'ML never makes mistakes', 'ML needs no data to work', 'Hand-written rules cannot run on modern computers']
    ],
    '1.2': [
        ['What is an artificial neuron?', 'A small unit that weighs its inputs, adds a bias, and applies an activation function', 'A physical cell that stores data', 'A line of code that deletes duplicate data', 'A type of database table'],
        ['What do weights control in a neural network?', "How strongly each input influences a neuron's output", 'How many layers the network has', "How fast the computer's processor runs", 'Which data is deleted before training'],
        ['What is the purpose of an activation function?', 'To add non-linearity so the network can learn complex patterns', 'To store the training data', 'To label each training example', 'To reduce the size of the dataset'],
        ['Why do neural networks need hidden layers?', 'They let the network build complex features from simpler ones', 'They store the final answer', 'They hide the data from users for privacy', 'They make training unnecessary'],
        ['How do neural networks learn?', 'By adjusting weights and biases to reduce the error in their predictions', 'By memorizing every input exactly', "By copying another model's weights unchanged", 'By having programmers rewrite each rule']
    ],
    '1.3': [
        ['What is Computer Vision primarily used for?', 'Helping computers interpret images and video', 'Processing and generating audio signals', 'Designing website layouts', 'Indexing database records'],
        ["What is a 'hallucination' in generative AI?", 'A confident-sounding output that is false or invented', 'A hardware overheating error', 'A slow response caused by network lag', 'A memory leak in the model'],
        ['How should you verify generative AI research output?', 'Cross-check it against trusted primary sources', 'Trust it if it sounds confident', 'Ask the same chatbot to confirm it', 'Check that it is nicely formatted'],
        ['Which network type slides kernels (filters) across pixel grids?', 'Convolutional Neural Networks (CNNs)', 'Decision forests', 'Linear regression models', 'Hash tables'],
        ['What is an adversarial attack in computer vision?', 'Tiny, hard-to-see pixel changes that trick a model into misclassifying an image', 'Cropping a photo to a smaller size', "Upgrading the camera's resolution", 'Compressing an image into a ZIP file']
    ],
    '2.1': [
        ['How do Large Language Models fundamentally generate text?', 'By predicting the most statistically probable next tokens', 'By looking answers up in a stored table of facts', 'By reasoning exactly like a human tutor', 'By searching the live internet for every word'],
        ['Which four building blocks make up a high-impact prompt?', 'Role, Task, Context, and Format/Constraints', 'Font, Color, Margin, and Border', 'Speed, Memory, Storage, and Power', 'Greeting, Question, Thanks, and Signature'],
        ["What does assigning a role like 'Act as an AP Biology tutor' do?", 'Activates domain-specific vocabulary and framing', 'Gives the model access to a real classroom', "Increases the model's memory", 'Guarantees every answer is correct'],
        ['Why include format and constraints in a prompt?', 'To lock in length, structure, and tone', 'To make the model run faster', 'To stop the model from reading your context', "To increase the model's temperature"],
        ["Why does a vague prompt like 'Write about climate change' underperform?", 'The model has to guess your audience, length, and focus', 'Short prompts are blocked by safety filters', 'Models cannot write about science topics', 'Prompts must be at least 500 words']
    ],
    '2.2': [
        ['What is Chain-of-Thought prompting?', 'Asking the model to reason step by step before giving its final answer', 'Linking several chatbots together', 'Repeating the same prompt until the answer changes', 'Encrypting the prompt before sending it'],
        ['Why do written-out reasoning steps improve accuracy?', 'Each step becomes new context that helps compute the next step', 'They give the model access to the internet', 'They delete wrong answers automatically', "They increase the model's vocabulary"],
        ['How does Few-Shot prompting differ from Zero-Shot prompting?', 'Few-Shot includes 2 to 5 worked examples in the prompt', 'Few-Shot uses fewer words overall', 'Zero-Shot requires 100 examples', 'Few-Shot only works with images'],
        ['Which task benefits MOST from Chain-of-Thought reasoning?', 'Multi-step math, logic puzzles, and debugging', 'Looking up a single capital city', 'Translating a one-word label', 'Retrieving a simple fact'],
        ['What is Self-Critique prompting?', 'Asking the AI to review its own draft for errors and assumptions before finalizing', 'Asking the AI to criticize the user', "Deleting the AI's first answer", "Turning off the AI's safety filters"]
    ],
    '2.3': [
        ['What does the Temperature setting control?', 'How random versus predictable the next-token choices are', 'How long the response can be', 'How much the model remembers', 'How fast the server responds'],
        ['Which temperature range suits coding, math, and fact extraction?', 'Low temperature (0.0 – 0.3)', 'High temperature (0.9 – 1.5)', 'Negative temperature', 'Temperature has no effect on these tasks'],
        ['What happens at very high temperature (1.2 – 1.5)?', 'Output becomes more varied, but fabricated facts become more likely', 'The model repeats identical text every time', 'The model becomes more factually reliable', 'The response always becomes shorter'],
        ['Why must you verify citations generated by an LLM?', "LLMs can invent plausible-sounding sources that don't exist", 'Citations from LLMs are always illegal to use', 'LLMs may only cite sources from before 1990', 'Models are not allowed to cite books'],
        ['What is the best way to fact-check an AI claim?', 'Compare it with primary sources and official documentation', 'Ask another chatbot to agree', 'Check whether it sounds believable', 'Count how many times it repeats the claim']
    ],
    '3.1': [
        ['What is an ethical way for students to use GenAI on schoolwork?', 'As a study partner, within the rules, with citation and original writing', 'Submitting AI essays as your own to save time', "Using it secretly so teachers don't ask questions", 'Letting it complete take-home tests'],
        ['Which details belong in an AI citation (MLA/APA)?', 'Tool, model version, date accessed, and the prompt used', 'Only the name of the website', 'Your device model and screen size', "Nothing, AI tools can't be cited"],
        ['Why keep a prompt and verification log?', 'It documents how you used AI and how you fact-checked the results', 'It makes the AI respond faster', 'It replaces the need to cite', 'It hides AI use from instructors'],
        ['Who is accountable for errors in AI-assisted work you submit?', 'You, the human author', 'The AI company', 'The chatbot itself', "No one, because errors from AI don't count"],
        ['Which prompt respects academic integrity?', "'Quiz me on the causes of World War I and explain what I miss'", "'Write my 5-page history paper for me'", "'Complete my take-home test'", "'Rewrite this article so plagiarism checkers miss it'"]
    ],
    '3.2': [
        ['How does historical bias enter an AI system?', 'Training data reflects past prejudices or underrepresents groups', 'Computers develop personal opinions over time', 'Models read social media comments live', "Bias only comes from the programmer's mood"],
        ['What is PII?', 'Personally Identifiable Information such as names, IDs, and medical details', 'Public Internet Index', 'Processed Image Input', 'Programmed Instruction Interface'],
        ['Why avoid pasting PII into public AI chatbots?', 'It may be logged or exposed through training pipelines', "Chatbots can't process names", 'It permanently locks your account', "It makes the chatbot's answers longer"],
        ['How do engineers detect bias before launch?', 'Subgroup fairness audits across different demographics', 'Testing only on the average user', 'Raising the temperature', 'Removing the test set'],
        ['What is the effect of balanced, representative datasets?', 'Fairer, more accurate predictions across user groups', 'Faster internet speeds', 'Guaranteed 100% accuracy', 'Reduced need for privacy protection']
    ],
    '3.3': [
        ['What is a deepfake?', 'AI-generated or altered audio, image, or video that imitates real people', 'A video compressed to a smaller file size', 'A hidden folder of private videos', 'A screenshot with a filter applied'],
        ['What are C2PA Content Credentials?', 'Cryptographic metadata recording where media came from and how it was edited', 'A password for video sites', 'A video compression standard', 'A badge for popular creators'],
        ['Which clue often exposes a synthetic video?', 'Unnatural blinking, warped edges, or mismatched lip-sync', 'High resolution', 'Clear audio', 'A standard MP4 file type'],
        ['What is the best defense against viral synthetic misinformation?', 'Cross-check with multiple reputable sources before sharing', 'Share it quickly so others can judge', 'Trust clips with many views', 'Trust any video with a news logo'],
        ['Why do deepfakes threaten digital society?', 'They erode trust in authentic audio and video evidence', 'They use up too much storage', 'They slow down social media apps', 'They make all video illegal']
    ],
    '4.1': [
        ["What does 'Garbage In, Garbage Out' mean?", 'Poor-quality training data produces unreliable models', 'Old files should be deleted regularly', 'Larger datasets always give worse results', 'Models automatically clean their own data'],
        ['How can missing values (NaN) be handled?', 'Drop incomplete rows or impute with the mean, median, or mode', 'Replace them with random text', 'Ignore them because models handle them automatically', 'Double every other value'],
        ['Why normalize or scale features?', "So large-valued features don't overpower small-valued ones", 'It makes fonts readable', 'It compresses the dataset', 'It removes labels'],
        ['What is an outlier?', 'An extreme or impossible value, like an age of 999, that can skew learning', 'The most common value in a column', 'A column header', 'A label in the test set'],
        ['What does One-Hot Encoding do?', 'Turns categorical labels into binary numeric vectors', 'Heats the GPU for faster training', 'Encrypts sensitive columns', 'Deletes duplicate rows']
    ],
    '4.2': [
        ['Why split data into training and test sets?', 'To check the model generalizes to unseen data instead of memorizing', 'To save disk space', 'To delete 20% of the data', 'To make the results look better'],
        ['What is overfitting?', 'Memorizing training data so well that performance on new data is poor', 'Training too quickly', 'Using a dataset that is too clean', 'Using too few training epochs'],
        ['Which is a typical train/test split?', 'About 80% training and 20% testing', '5% training and 95% testing', '100% training and 0% testing', '0% training and 100% testing'],
        ['What is the role of the validation set?', 'Tuning settings during development without touching the final test set', 'Storing user passwords', 'Replacing the training set', 'Providing the final reported score'],
        ['Which symptom signals overfitting?', '99% training accuracy but only 58% test accuracy', '90% accuracy on both sets', 'Fast inference speed', 'Low accuracy on both training and test sets']
    ],
    '4.3': [
        ['What is feature engineering?', 'Using domain knowledge to create or select informative inputs', 'Building computer hardware', 'Designing a user interface', 'Writing HTML pages'],
        ['How can noise columns hurt a model?', 'They add dimensionality, slowing training and confusing the model', 'They automatically boost accuracy', 'They save memory', 'They fix missing values'],
        ['Which is a good engineered feature for traffic prediction?', 'An is_rush_hour flag created from timestamps', "The driver's favorite song", 'Random serial numbers', 'Deleting the time column'],
        ['Why prune low-value features?', 'Faster training, less overfitting, and easier interpretation', 'It removes the target label', 'It adds helpful noise', 'It disables testing'],
        ['What helps engineers invent strong features?', 'Domain expertise in the problem area', 'Random guessing', 'Ignoring the data', 'Setting the temperature to maximum']
    ],
    '5.1': [
        ['What is Explainable AI (XAI)?', 'Techniques that make AI decisions understandable to humans', 'Hiding model weights from auditors', 'Compressing a model to a smaller size', 'Automating password resets'],
        ["Why are deep neural networks called 'black boxes'?", 'Billions of weights make decisions hard to trace without XAI tools', 'They run without any inputs', 'They are stored in secret locations', "They can't be tested"],
        ['What is a Model Card?', "Documentation of a model's training data, intended use, and limits", 'A billing card for cloud services', 'A GPU hardware component', 'A leaderboard ranking'],
        ['What does a disparate impact audit check?', 'Whether error or approval rates unfairly disadvantage certain groups', 'How fast a page loads', 'Server temperature', 'Font legibility'],
        ['Why is human recourse essential in automated loan or hiring decisions?', 'People deserve to understand and appeal automated decisions', 'AI never makes mistakes', 'It eliminates all paperwork', 'It speeds up the model']
    ],
    '5.2': [
        ['Why is dataset licensing critical?', "Training on copyrighted data without permission can violate creators' rights", 'Licenses speed up training', 'Everything online is public domain', 'Licenses only apply to hardware'],
        ['Which license allows free reuse with attribution?', 'Creative Commons (CC-BY)', 'All Rights Reserved', 'Proprietary trade secret', 'Unlicensed leaked data'],
        ['What makes a human-AI creative work more defensible?', 'Significant human authorship and transformative creative direction', 'Generating once and claiming the raw output', "Copying an artist's style by name", 'Removing watermarks'],
        ['Before using an open dataset, you should:', 'Read its license to confirm what uses are permitted', 'Assume no rules apply', 'Delete the README', 'Rename the author'],
        ['Respecting intellectual property encourages:', 'A sustainable ecosystem for both creators and AI builders', 'Less transparency', 'More data breaches', 'More plagiarism']
    ],
    '5.3': [
        ['What are AI safety guardrails?', 'Input and output filters that block harmful or unauthorized responses', 'Metal racks protecting servers', 'Screen protectors for devices', 'Backup power supplies'],
        ['What is a prompt injection or jailbreak attack?', 'Crafting inputs to trick an AI into ignoring its rules', 'Installing a new Python package', 'Plugging in a USB drive', 'Optimizing CSS'],
        ['What is red teaming?', 'Simulating attacks to find weaknesses before deployment', 'Coloring the interface red', 'Deleting user accounts', 'Disabling logging'],
        ['Why use both input and output guardrails?', 'Defense-in-depth catches threats before generation and before display', 'One filter always crashes', 'It doubles token speed', 'Input filters only fix spelling'],
        ['How do guardrails affect trust?', 'They make AI platforms safer and more reliable for classrooms and businesses', 'They make apps unusable', 'They remove all helpful features', 'They increase hallucinations']
    ],
    '6.1': [
        ['Why can 99% accuracy mislead on imbalanced data?', 'A model can ignore a rare 1% class entirely and still score 99%', 'Percentages above 90 are impossible', 'Accuracy only measures speed', "Test sets don't have labels"],
        ['What does precision measure?', 'Of all positive predictions, how many were truly positive', 'How fast predictions run', 'The total number of rows', 'Of all real positives, how many were caught'],
        ['What does recall measure?', 'Of all actual positives, how many the model caught', 'Of all predicted positives, how many were right', 'How much memory is free', 'The number of training epochs'],
        ['What is the F1-Score?', 'The harmonic mean of precision and recall', 'The average of accuracy and speed', 'The raw training loss', 'The number of false negatives'],
        ['Why use standardized benchmarks like MMLU or HumanEval?', 'To compare models fairly on identical tasks', 'To hide model weaknesses', 'To skip testing', 'To generate training data']
    ],
    '6.2': [
        ['What does RLHF stand for?', 'Reinforcement Learning from Human Feedback', 'Randomized Logic for Hardware Filtering', 'Recursive Layer Hashing Function', 'Rapid Language Handling Framework'],
        ['How is a reward model trained?', 'Human reviewers rank pairs of model responses', 'By counting punctuation marks', 'By measuring GPU heat', 'By scraping web passwords'],
        ['What are the core goals of an aligned assistant?', 'Helpful, honest, and harmless', 'Fast, loud, and expensive', 'Secret, complex, and unpredictable', 'Short, vague, and random'],
        ['What helps prevent reward hacking in RLHF?', 'A KL-divergence penalty that keeps the model close to natural language', 'Unplugging the internet', 'Setting the temperature to 5.0', 'Deleting the reward model'],
        ['Why is alignment needed after pretraining?', 'Pretraining teaches next-word prediction; alignment teaches human intent and safety', 'Pretraining uses no data', 'Alignment shrinks the model files', "Base models can't read English"]
    ],
    '6.3': [
        ['What is a multimodal AI system?', 'One that processes multiple data types like text, images, audio, and code', 'A computer with two monitors', 'A single-purpose calculator', 'A local text file'],
        ['What does human-in-the-loop design ensure?', 'Humans review and approve high-impact AI actions', 'Humans type every token manually', 'AI is never used', 'Loops run forever'],
        ['What defines responsible AI innovation?', 'Advancing capability alongside testing, transparency, and ethical oversight', 'Shipping untested models as fast as possible', 'Ignoring bias reports', 'Hiding citations'],
        ['How are AI agents evolving beyond chatbots?', 'They plan multi-step workflows and use external tools', 'They output single words only', 'They no longer use neural networks', "They don't need any training"],
        ['What empowers students to lead in AI?', 'Technical skill, critical verification, and ethical judgment', 'Memorizing one perfect prompt', 'Avoiding math and coding', 'Trusting every output']
    ]
};

// Builds a playable quiz: the correct answer rotates through slots A-D (so it is
// never always "A"), and the wrong answers are shuffled into the remaining slots.
function prepareQuiz(modId, subId) {
    const raw = QUIZ[`${modId}.${subId}`] || QUIZ['1.1'];
    const start = Math.floor(Math.random() * 4);
    return raw.map(([q, right, ...wrong], i) => {
        const slot = (start + i * 3) % 4;
        const rest = shuffle(wrong);
        const options = [];
        for (let k = 0; k < 4; k++) options.push(k === slot ? right : rest.pop());
        return { q, options, correct: slot };
    });
}

// ============================================================================
// 6. ARCADE ENGINE (shared pieces + three minigames)
// ============================================================================
function makeModal() {
    $$('.quiz-modal').forEach(m => m.remove());
    const modal = document.createElement('div');
    modal.className = 'quiz-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = '<button type="button" class="quiz-exit">✕ Exit</button><div class="quiz-stage"></div>';
    document.body.appendChild(modal);
    document.body.classList.add('modal-open');
    $('.quiz-exit', modal).onclick = () => {
        if (confirm('Exit this challenge? Your progress in it will be lost.')) closeModal(modal);
    };
    return { modal, stage: $('.quiz-stage', modal) };
}
function closeModal(modal) {
    modal.remove();
    document.body.classList.remove('modal-open');
}
function hype(text) {
    const el = document.createElement('div');
    el.className = 'hype-text';
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
}

function showInstructionsModal(title, rulesHTML, onStart) {
    const { modal, stage } = makeModal();
    stage.innerHTML = `
        <div class="quiz-modal-card">
            <h2>📜 Mission Briefing: ${esc(title)}</h2>
            <div class="quiz-briefing-body">${rulesHTML}</div>
            <button id="btn-start-mission" type="button">✅ Got It! Start Challenge</button>
        </div>`;
    $('#btn-start-mission', stage).onclick = () => { closeModal(modal); onStart(); };
    $('#btn-start-mission', stage).focus();
}

window.startArcadeQuiz = function (modId, subId) {
    const game = (LESSONS[modId] && LESSONS[modId].subs[subId] && LESSONS[modId].subs[subId].game) || 'rocket';
    if (game === 'rocket') {
        showInstructionsModal('Rocket Space Defender', `
            <p><strong>Objective:</strong> Answer AI concept questions correctly to earn Credits, then survive the 30-second asteroid wave!</p>
            <ul>
                <li><strong>Move:</strong> LEFT/RIGHT arrows (or A/D). On a touch screen, drag to steer; your ship fires automatically.</li>
                <li><strong>Shoot:</strong> UP arrow (W or Space).</li>
                <li><strong>Armory:</strong> Spend credits on Faster Ship (50), Double Laser (75), Rapid Fire (100), 2x Score (125), and Triple Bullets (150).</li>
                <li><strong>Pass mark:</strong> 4 out of 5 quiz answers right completes the lesson.</li>
            </ul>`, () => runRocketGame(modId, subId));
    } else if (game === 'blockblast') {
        showInstructionsModal('Block Blast AI Grid', `
            <p><strong>Objective:</strong> Answer quiz questions correctly, then build combos with the shape blocks in your tray!</p>
            <ul>
                <li><strong>Place pieces:</strong> Click a piece in your tray, then hover over the 8x8 grid to preview where it fits. Click (or tap) to set it.</li>
                <li>Complete full rows or columns to clear them and trigger bonus points.</li>
                <li><strong>Pass mark:</strong> 4 out of 5 quiz answers right completes the lesson.</li>
            </ul>`, () => runBlockBlastGame(modId, subId));
    } else {
        showInstructionsModal('Pirate Ship Cannon Launcher', `
            <p><strong>Objective:</strong> Answer questions correctly, then smash the wooden crates with your cannon. You get 3 shots per level!</p>
            <ul>
                <li><strong>Aim:</strong> Click or touch and drag the cannonball backward to see the trajectory arc, then release to fire.</li>
                <li><strong>Upgrades:</strong> Heavy Iron Ball (40), Explosive Shot (80), and 2x Multiplier (60).</li>
                <li><strong>Pass mark:</strong> 4 out of 5 quiz answers right completes the lesson.</li>
            </ul>`, () => runPirateGame(modId, subId));
    }
};

// ---- Shared quiz question screen
function askQuestion({ stage, q, index, total, badge, theme = '', onResult }) {
    stage.innerHTML = `
        <div class="quiz-game-card ${theme}">
            <div class="quiz-header-row"><span class="quiz-counter">Question ${index + 1} of ${total}</span><span class="quiz-credits">${badge}</span></div>
            <div class="quiz-progress"><div style="width:${(index / total) * 100}%"></div></div>
            <h2 class="quiz-title">${esc(q.q)}</h2>
            <div class="options-container">
                ${q.options.map((o, i) => `<button type="button" class="opt-btn" data-i="${i}"><span class="opt-letter">${'ABCD'[i]}</span><span>${esc(o)}</span></button>`).join('')}
            </div>
            <p class="quiz-feedback" aria-live="polite">Pick an answer, or press A, B, C, D.</p>
        </div>`;
    const btns = $$('.opt-btn', stage), fb = $('.quiz-feedback', stage);
    let done = false;
    function choose(i) {
        if (done) return;
        done = true;
        document.removeEventListener('keydown', onKey);
        const ok = i === q.correct;
        btns.forEach(b => b.disabled = true);
        btns[i].classList.add(ok ? 'correct' : 'incorrect');
        if (!ok) btns[q.correct].classList.add('correct');
        fb.textContent = ok ? '✅ Correct!' : `❌ Not quite. The correct answer was ${'ABCD'[q.correct]}.`;
        setTimeout(() => { if (document.body.contains(stage)) onResult(ok); }, 1300);
    }
    function onKey(e) {
        if (!document.body.contains(stage)) { document.removeEventListener('keydown', onKey); return; }
        const k = { a: 0, b: 1, c: 2, d: 3, 1: 0, 2: 1, 3: 2, 4: 3 }[e.key.toLowerCase()];
        if (k !== undefined) choose(k);
    }
    document.addEventListener('keydown', onKey);
    btns.forEach((b, i) => b.onclick = () => choose(i));
}

// ---- Shared results screen: marks lesson complete, awards XP, shows leaderboard
function finishGame(o) {
    const { modal, stage, modId, subId, gameKey, title, quizScore, total, arcadeLabel, arcadeScore, retry, theme = '' } = o;
    const passed = quizScore >= 4;
    const result = passed ? completeLesson(modId, subId) : { first: false, unlocked: null };
    const xp = quizScore * 20 + (result.first ? 50 : 0);
    const saved = Portal.award(gameKey, arcadeScore, xp);
    markPlayed(gameKey);

    const me = Portal.getActiveUser();
    const rows = [...Portal.getDirectory()]
        .sort((a, b) => ((b.scores && b.scores[gameKey]) || 0) - ((a.scores && a.scores[gameKey]) || 0))
        .slice(0, 5)
        .map((c, i) => `<div class="lb-mini-row${me && c.id === me.id ? ' me' : ''}"><span>#${i + 1} <strong>${esc(c.username)}</strong>${me && c.id === me.id ? ' (You)' : ''}</span><b>${(c.scores && c.scores[gameKey]) || 0} pts</b></div>`).join('');

    const nextIdx = LESSON_ORDER.findIndex(([m, s]) => m === modId && s === subId) + 1;
    const next = LESSON_ORDER[nextIdx];
    stage.innerHTML = `
        <div class="quiz-game-card ${theme}" style="max-width:480px;">
            <h1 class="summary-title">${title} Complete!</h1>
            <div class="summary-banner ${passed ? 'pass' : 'fail'}">${passed ? `✅ Lesson ${modId}.${subId} complete!` : '⚠️ Score 4 out of 5 or better to complete this lesson.'}</div>
            ${result.unlocked ? `<div class="summary-banner pass">🔓 Module ${result.unlocked} unlocked!</div>` : ''}
            <div class="summary-rows">
                <div><span>Quiz Score</span><strong>${quizScore} / ${total}</strong></div>
                <div><span>${esc(arcadeLabel)}</span><strong>${arcadeScore} pts</strong></div>
                <div><span>XP Earned</span><strong style="color:#00f2fe;">+${xp} XP 🌟</strong></div>
            </div>
            ${saved ? '' : '<p class="canvas-instructions" style="margin:0 0 6px;">Create a profile to save XP and join the leaderboard.</p>'}
            <div class="lb-mini"><h4>🏆 Top Players</h4>${rows || '<p class="empty-note">No scores yet. You set the benchmark!</p>'}</div>
            <div class="btn-row">
                ${passed ? '' : '<button type="button" class="btn-continue-shop secondary" id="g-retry">Try Again</button>'}
                <button type="button" class="btn-continue-shop" id="g-done">${passed && next ? 'Back to Lessons' : 'Continue to Modules'}</button>
            </div>
        </div>`;
    const retryBtn = $('#g-retry', stage);
    if (retryBtn) retryBtn.onclick = () => { closeModal(modal); retry(); };
    $('#g-done', stage).onclick = () => {
        closeModal(modal);
        if (passed) openLesson(modId, subId); else showPage('modules');
        if (!document.getElementById('modules-page-view').classList.contains('is-active')) return;
        $('#active-module-content').scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    updateDashboardStats();
}

// ----------------------------------------------------------------------------
// MINIGAME 1: ROCKET SPACE SHOOTER
// ----------------------------------------------------------------------------
function runRocketGame(modId, subId) {
    const { modal, stage } = makeModal();
    const questions = prepareQuiz(modId, subId);
    const S = { q: 0, credits: 0, quiz: 0, score: 0, speed: false, dbl: false, rapid: false, triple: false, mult: 1 };

    function ask() {
        if (S.q >= questions.length) return finish();
        askQuestion({
            stage, q: questions[S.q], index: S.q, total: questions.length, badge: `Credits: ${S.credits} 💰`,
            onResult: ok => { if (ok) { S.credits += 100; S.quiz++; } wave(); }
        });
    }

    function wave() {
        stage.innerHTML = `
            <div class="quiz-game-card canvas-card">
                <div class="quiz-header-row">
                    <span class="quiz-counter">Wave ${S.q + 1} · Rocket Defense</span>
                    <span id="g-timer" class="quiz-credits danger">Time: 30s</span>
                    <span id="g-shield" class="quiz-credits">🛡️ 100%</span>
                    <span id="g-score" class="quiz-credits">Score: ${S.score}</span>
                </div>
                <canvas id="spaceCanvas" width="640" height="360"></canvas>
                <p class="canvas-instructions">Arrows / A-D to move · Up / W / Space to shoot · On touch, drag to steer (auto-fire)</p>
            </div>`;
        const canvas = $('#spaceCanvas', stage), ctx = canvas.getContext('2d');
        const player = { x: canvas.width / 2 - 18, y: canvas.height - 45, w: 36, h: 36, speed: S.speed ? 9 : 5.5 };
        let bullets = [], asteroids = [], particles = [], keys = {}, lastShoot = 0, timeLeft = 30, shield = 100, animId, ended = false, pointerDown = false;
        const stars = Array.from({ length: 45 }, () => ({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, size: Math.random() * 2 + 1, speed: Math.random() * 1.8 + 0.5 }));

        const onDown = e => {
            if (['ArrowUp', 'ArrowLeft', 'ArrowRight', 'ArrowDown', 'Space'].includes(e.code)) e.preventDefault();
            keys[e.code] = true;
        };
        const onUp = e => { keys[e.code] = false; };
        window.addEventListener('keydown', onDown);
        window.addEventListener('keyup', onUp);
        const steer = e => {
            const r = canvas.getBoundingClientRect();
            player.x = clamp((e.clientX - r.left) * (canvas.width / r.width) - player.w / 2, 0, canvas.width - player.w);
        };
        canvas.addEventListener('pointerdown', e => { pointerDown = true; steer(e); });
        canvas.addEventListener('pointermove', e => { if (pointerDown) steer(e); });
        const pointerUp = () => { pointerDown = false; };
        window.addEventListener('pointerup', pointerUp);

        const timer = setInterval(() => {
            timeLeft--;
            const t = $('#g-timer', stage); if (t) t.textContent = `Time: ${timeLeft}s`;
            if (timeLeft <= 0) endWave();
        }, 1000);

        function cleanup() {
            ended = true;
            clearInterval(timer);
            cancelAnimationFrame(animId);
            window.removeEventListener('keydown', onDown);
            window.removeEventListener('keyup', onUp);
            window.removeEventListener('pointerup', pointerUp);
        }
        function endWave(msg) {
            if (ended) return;
            cleanup();
            if (msg) toast(msg, 'warn');
            shop();
        }
        function explode(x, y, color) {
            for (let i = 0; i < 18; i++) {
                const a = Math.random() * Math.PI * 2, sp = 1.5 + Math.random() * 4.5;
                particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, alpha: 1, decay: 0.02 + Math.random() * 0.025, color, size: 2 + Math.random() * 3.5 });
            }
        }
        const hud = () => {
            const sc = $('#g-score', stage), sh = $('#g-shield', stage);
            if (sc) sc.textContent = `Score: ${S.score}`;
            if (sh) sh.textContent = `🛡️ ${shield}%`;
        };

        function loop(now) {
            if (ended) return;
            if (!document.body.contains(canvas)) { cleanup(); return; }
            const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
            bg.addColorStop(0, '#060919'); bg.addColorStop(0.5, '#0b1329'); bg.addColorStop(1, '#02040a');
            ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#38bdf8';
            stars.forEach(s => { s.y += s.speed; if (s.y > canvas.height) s.y = 0; ctx.globalAlpha = s.size > 2 ? 0.9 : 0.4; ctx.fillRect(s.x, s.y, s.size, s.size); });
            ctx.globalAlpha = 1;

            if ((keys.ArrowLeft || keys.KeyA) && player.x > 0) player.x -= player.speed;
            if ((keys.ArrowRight || keys.KeyD) && player.x < canvas.width - player.w) player.x += player.speed;

            if ((keys.ArrowUp || keys.KeyW || keys.Space || pointerDown) && now - lastShoot > (S.rapid ? 150 : 320)) {
                const cx = player.x + player.w / 2 - 2;
                if (S.triple) {
                    bullets.push({ x: player.x + 2, y: player.y, w: 4, h: 14, color: '#38bdf8' }, { x: cx, y: player.y - 6, w: 4, h: 14, color: '#00f2fe' }, { x: player.x + player.w - 6, y: player.y, w: 4, h: 14, color: '#38bdf8' });
                } else if (S.dbl) {
                    bullets.push({ x: player.x + 6, y: player.y, w: 4, h: 14, color: '#00f2fe' }, { x: player.x + player.w - 10, y: player.y, w: 4, h: 14, color: '#00f2fe' });
                } else bullets.push({ x: cx, y: player.y, w: 4, h: 14, color: '#00f2fe' });
                lastShoot = now;
            }

            // ship
            ctx.save();
            ctx.translate(player.x + player.w / 2, player.y + player.h / 2);
            const flame = 12 + Math.sin(now * 0.04) * 5;
            ctx.fillStyle = '#ff7b00'; ctx.beginPath(); ctx.moveTo(-5, 16); ctx.lineTo(0, 16 + flame); ctx.lineTo(5, 16); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(14, 12); ctx.lineTo(6, 16); ctx.lineTo(-6, 16); ctx.lineTo(-14, 12); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#2563eb';
            ctx.beginPath(); ctx.moveTo(-14, 12); ctx.lineTo(-21, 19); ctx.lineTo(-6, 14); ctx.closePath(); ctx.fill();
            ctx.beginPath(); ctx.moveTo(14, 12); ctx.lineTo(21, 19); ctx.lineTo(6, 14); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#00f2fe'; ctx.beginPath(); ctx.arc(0, -2, 4.5, 0, Math.PI * 2); ctx.fill();
            ctx.restore();

            ctx.shadowBlur = 12;
            for (let i = bullets.length - 1; i >= 0; i--) {
                const b = bullets[i]; b.y -= 9.5;
                ctx.fillStyle = b.color; ctx.shadowColor = b.color; ctx.fillRect(b.x, b.y, b.w, b.h);
                if (b.y < 0) bullets.splice(i, 1);
            }
            ctx.shadowBlur = 0;

            if (Math.random() < 0.042) asteroids.push({ x: Math.random() * (canvas.width - 45), y: -40, size: 32 + Math.random() * 18, speed: 1.8 + Math.random() * 2.2, rot: Math.random() * Math.PI, rotSpeed: (Math.random() - 0.5) * 0.035 });

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i]; p.x += p.vx; p.y += p.vy; p.alpha -= p.decay;
                if (p.alpha <= 0) { particles.splice(i, 1); continue; }
                ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, p.size, p.size);
            }
            ctx.globalAlpha = 1;

            for (let i = asteroids.length - 1; i >= 0; i--) {
                const a = asteroids[i]; a.y += a.speed; a.rot += a.rotSpeed;
                ctx.save();
                ctx.translate(a.x + a.size / 2, a.y + a.size / 2); ctx.rotate(a.rot);
                ctx.fillStyle = '#475569'; ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
                ctx.beginPath();
                for (let p = 0; p < 7; p++) {
                    const ang = (p / 7) * Math.PI * 2, r = (a.size / 2) * (0.8 + Math.sin(p * 3) * 0.2);
                    p === 0 ? ctx.moveTo(Math.cos(ang) * r, Math.sin(ang) * r) : ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
                }
                ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();

                let dead = false;
                for (let j = bullets.length - 1; j >= 0; j--) {
                    const b = bullets[j];
                    if (b.x < a.x + a.size && b.x + b.w > a.x && b.y < a.y + a.size && b.y + b.h > a.y) {
                        explode(a.x + a.size / 2, a.y + a.size / 2, '#38bdf8');
                        bullets.splice(j, 1);
                        S.score += 20 * S.mult;
                        dead = true; hud();
                        break;
                    }
                }
                if (!dead && player.x < a.x + a.size && player.x + player.w > a.x && player.y < a.y + a.size && player.y + player.h > a.y) {
                    explode(a.x + a.size / 2, a.y + a.size / 2, '#ef4444');
                    S.score = Math.max(0, S.score - 15);
                    shield = Math.max(0, shield - 20);
                    dead = true; hud();
                    if (shield <= 0) { endWave('Your ship was destroyed!'); return; }
                }
                if (dead || a.y > canvas.height) asteroids.splice(i, 1);
            }
            animId = requestAnimationFrame(loop);
        }
        animId = requestAnimationFrame(loop);
    }

    function shop() {
        const last = S.q >= questions.length - 1;
        const items = [
            ['speed', '🚀 Faster Ship', 50, S.speed], ['dbl', '🔫 Double Laser', 75, S.dbl],
            ['rapid', '⚡ Rapid Fire', 100, S.rapid], ['triple', '💥 Triple Bullets', 150, S.triple]
        ];
        stage.innerHTML = `
            <div class="quiz-game-card">
                <h2 class="shop-title">🛠️ Rocket Armory Upgrades</h2>
                <p class="shop-credits">Your Credits: <strong class="credit-highlight">${S.credits} 💰</strong></p>
                <div class="armory-grid">
                    ${items.map(([k, n, c, own]) => `<button type="button" class="shop-btn" data-buy="${k}" data-cost="${c}" ${own ? 'disabled' : ''}>${n} (${c} 💰) ${own ? '✅' : ''}</button>`).join('')}
                    <button type="button" class="shop-btn full" data-buy="mult" data-cost="125" ${S.mult > 1 ? 'disabled' : ''}>🌟 2x Score Multiplier (125 💰) ${S.mult > 1 ? '✅' : ''}</button>
                </div>
                <button type="button" class="btn-continue-shop" id="skip-shop">${last ? 'Finish →' : 'Continue to Next Question →'}</button>
            </div>`;
        $$('[data-buy]', stage).forEach(b => b.onclick = () => {
            const cost = parseInt(b.dataset.cost, 10), k = b.dataset.buy;
            if (S.credits < cost) { toast('Not enough credits for that upgrade.', 'warn'); return; }
            S.credits -= cost;
            if (k === 'mult') S.mult = 2; else S[k] = true;
            toast('Upgrade purchased!', 'success');
            shop();
        });
        $('#skip-shop', stage).onclick = () => { S.q++; ask(); };
    }

    function finish() {
        finishGame({ modal, stage, modId, subId, gameKey: 'rocket', title: '🚀 Rocket Challenge', quizScore: S.quiz, total: questions.length, arcadeLabel: 'Arcade Score', arcadeScore: S.score, retry: () => runRocketGame(modId, subId) });
    }
    ask();
}

// ----------------------------------------------------------------------------
// MINIGAME 2: BLOCK BLAST GRID PUZZLE
// ----------------------------------------------------------------------------
function runBlockBlastGame(modId, subId) {
    const { modal, stage } = makeModal();
    const questions = prepareQuiz(modId, subId);
    const S = { q: 0, quiz: 0, score: 0 };
    const grid = Array.from({ length: 8 }, () => Array(8).fill(null));
    const colors = ['#00f2fe', '#38bdf8', '#a855f7', '#ec4899', '#f59e0b', '#22c55e', '#6366f1'];
    const shapes = [[[1, 1], [1, 1]], [[1, 1, 1]], [[1], [1], [1]], [[1, 0], [1, 1]], [[1, 1, 1], [0, 0, 1]], [[1]]];
    let tray = [], sel = 0;

    function ask() {
        if (S.q >= questions.length) return finish();
        askQuestion({
            stage, q: questions[S.q], index: S.q, total: questions.length, badge: `Grid Score: ${S.score} 🧱`,
            onResult: ok => {
                if (ok) S.quiz++;
                tray = Array.from({ length: 6 }, () => ({ shape: shapes[Math.floor(Math.random() * shapes.length)], color: colors[Math.floor(Math.random() * colors.length)] }));
                sel = 0;
                board();
            }
        });
    }

    const fits = (shape, r0, c0) => shape.every((row, sr) => row.every((v, sc) => !v || (r0 + sr < 8 && c0 + sc < 8 && grid[r0 + sr][c0 + sc] === null)));
    const baseStyle = (r, c) => {
        const col = grid[r][c];
        return col ? `background:${col};border:1px solid ${col};box-shadow:0 0 10px ${col}88;` : 'background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);';
    };

    function board() {
        let cells = '';
        for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) cells += `<div class="bb-cell" data-r="${r}" data-c="${c}" style="${baseStyle(r, c)}"></div>`;
        const trayHTML = tray.length ? tray.map((p, i) => {
            let mini = '';
            for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
                const on = p.shape[r] && p.shape[r][c] === 1;
                mini += `<i style="background:${on ? p.color : 'transparent'};${on ? `box-shadow:0 0 6px ${p.color}` : ''}"></i>`;
            }
            return `<div class="tray-piece${i === sel ? ' selected' : ''}" data-i="${i}" role="button" tabindex="0"><div class="mini">${mini}</div>Piece #${i + 1}</div>`;
        }).join('') : 'Tray empty. Press Next Question to earn more pieces!';
        const last = S.q >= questions.length - 1;
        stage.innerHTML = `
            <div class="quiz-game-card canvas-card" style="max-width:680px;">
                <div class="quiz-header-row"><span class="quiz-counter">Wave ${S.q + 1} · Block Grid Arena</span><span class="quiz-credits">Grid Score: ${S.score} 🧱</span></div>
                <p class="canvas-instructions" style="margin:0 0 10px;">Pick a piece, then hover over the grid to see the <strong>ghost outline</strong>. Click to place it.</p>
                <div class="bb-grid" id="bb-grid">${cells}</div>
                <div class="bb-tray">${trayHTML}</div>
                <button type="button" id="bb-next" class="btn-continue-shop" style="margin-top:16px;">${last ? 'Finish →' : 'Next Question →'}</button>
            </div>`;
        $$('.tray-piece', stage).forEach(p => {
            const pick = () => { sel = parseInt(p.dataset.i, 10); board(); };
            p.onclick = pick;
            p.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } };
        });
        const cellEls = $$('.bb-cell', stage);
        const clearPreview = () => cellEls.forEach(el => { el.style.cssText = baseStyle(+el.dataset.r, +el.dataset.c); });
        cellEls.forEach(el => {
            const r = +el.dataset.r, c = +el.dataset.c;
            el.onmouseenter = () => {
                const p = tray[sel]; if (!p) return;
                clearPreview();
                const ok = fits(p.shape, r, c);
                p.shape.forEach((row, sr) => row.forEach((v, sc) => {
                    if (!v) return;
                    const t = cellEls[(r + sr) * 8 + (c + sc)];
                    if (t && r + sr < 8 && c + sc < 8 && !grid[r + sr][c + sc]) t.style.cssText = `background:${ok ? p.color + '55' : 'rgba(239,68,68,.35)'};border:1px dashed ${ok ? p.color : '#ef4444'};`;
                }));
            };
            el.onclick = () => place(r, c);
        });
        $('#bb-grid', stage).onmouseleave = clearPreview;
        $('#bb-next', stage).onclick = () => { S.q++; ask(); };
    }

    function place(r, c) {
        const p = tray[sel];
        if (!p) { toast('Select a piece from your tray first.', 'warn'); return; }
        if (!fits(p.shape, r, c)) { hype('⚠️ Invalid Placement!'); return; }
        p.shape.forEach((row, sr) => row.forEach((v, sc) => { if (v) grid[r + sr][c + sc] = p.color; }));
        tray.splice(sel, 1);
        sel = 0;
        S.score += 50;
        const lines = clearLines();
        if (lines > 0) hype(['Block Blast!', 'Awesome Combo!', 'Clean Clear!', 'Brilliant!'][Math.floor(Math.random() * 4)]);
        board();
    }

    // Find every full row/column first, then clear them together (so crossings both count)
    function clearLines() {
        const rows = [], cols = [];
        for (let r = 0; r < 8; r++) if (grid[r].every(v => v !== null)) rows.push(r);
        for (let c = 0; c < 8; c++) if (grid.every(row => row[c] !== null)) cols.push(c);
        rows.forEach(r => { for (let c = 0; c < 8; c++) grid[r][c] = null; });
        cols.forEach(c => { for (let r = 0; r < 8; r++) grid[r][c] = null; });
        const n = rows.length + cols.length;
        S.score += n * 200 + (n > 1 ? (n - 1) * 100 : 0);
        return n;
    }

    function finish() {
        finishGame({ modal, stage, modId, subId, gameKey: 'blockblast', title: '🧱 Block Blast', quizScore: S.quiz, total: questions.length, arcadeLabel: 'Grid Score', arcadeScore: S.score, retry: () => runBlockBlastGame(modId, subId) });
    }
    ask();
}

// ----------------------------------------------------------------------------
// MINIGAME 3: PIRATE SHIP CANNON LAUNCHER
// ----------------------------------------------------------------------------
const CRATE_LAYOUTS = {
    1: [[500, 235, 38], [550, 235, 38], [600, 235, 38], [525, 190, 38], [575, 190, 38], [550, 145, 38]],
    2: [[480, 145, 36], [480, 185, 36], [480, 225, 36], [540, 185, 36], [540, 225, 36], [600, 145, 36], [600, 225, 36]],
    3: [[460, 235, 35], [510, 175, 35], [560, 235, 35], [610, 175, 35], [535, 125, 35]]
};

function runPirateGame(modId, subId) {
    const { modal, stage } = makeModal();
    const questions = prepareQuiz(modId, subId);
    const S = { q: 0, quiz: 0, score: 0, credits: 50, heavy: false, bomb: false, mult: 1 };

    function ask() {
        if (S.q >= questions.length) return finish();
        askQuestion({
            stage, q: questions[S.q], index: S.q, total: questions.length, theme: 'theme-pirate',
            badge: `${S.credits} 💰 Credits · Level ${S.q + 1}`,
            onResult: ok => { if (ok) { S.credits += 100; S.quiz++; } arena(); }
        });
    }

    function arena() {
        const level = Math.min(S.q + 1, 3);
        let targets = CRATE_LAYOUTS[level].map(([x, y, s]) => ({ x, y, w: s, h: s }));
        stage.innerHTML = `
            <div class="quiz-game-card canvas-card theme-pirate" style="max-width:740px;">
                <div class="quiz-header-row"><span class="quiz-counter" style="color:#ff4757;">⛰️ Hilltop Assault · Level ${S.q + 1}</span><span id="p-shots" class="quiz-credits">Shots: 🔴🔴🔴</span><span id="birds-score" class="quiz-credits">Score: ${S.score}</span></div>
                <div class="canvas-wrap"><canvas id="birdsCanvas" width="680" height="340"></canvas><div id="shot-feedback"></div></div>
                <p class="canvas-instructions">Click or touch and drag the cannonball backward to aim, then release to fire at the crates!</p>
            </div>`;
        const canvas = $('#birdsCanvas', stage), ctx = canvas.getContext('2d');
        const cannon = { x: 110, y: 155 }, groundY = 275, gravity = S.heavy ? 0.48 : 0.36;
        const ball = { x: cannon.x, y: cannon.y, r: 14, vx: 0, vy: 0, launched: false, frames: 0 };
        let dragging = false, shots = 3, ended = false, shake = 0, muzzle = 0, particles = [], floaters = [], animId;

        const pos = e => { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) * canvas.width / r.width, y: (e.clientY - r.top) * canvas.height / r.height }; };
        canvas.addEventListener('pointerdown', e => {
            if (ball.launched || ended) return;
            const p = pos(e);
            if (Math.hypot(p.x - ball.x, p.y - ball.y) < 50) { dragging = true; canvas.setPointerCapture(e.pointerId); }
        });
        canvas.addEventListener('pointermove', e => {
            if (!dragging) return;
            const p = pos(e);
            let dx = p.x - cannon.x, dy = p.y - cannon.y;
            const d = Math.hypot(dx, dy);
            if (d > 85) { dx *= 85 / d; dy *= 85 / d; }
            ball.x = cannon.x + dx; ball.y = cannon.y + dy;
        });
        const release = () => {
            if (!dragging) return;
            dragging = false;
            const dx = cannon.x - ball.x, dy = cannon.y - ball.y;
            if (Math.hypot(dx, dy) < 12) { ball.x = cannon.x; ball.y = cannon.y; return; }   // ignore accidental taps
            ball.vx = dx * 0.38; ball.vy = dy * 0.38; ball.launched = true; ball.frames = 0;
            shots--; muzzle = 10; shake = 6;
            const sEl = $('#p-shots', stage); if (sEl) sEl.textContent = 'Shots: ' + '🔴'.repeat(shots) + '⚫'.repeat(3 - shots);
        };
        canvas.addEventListener('pointerup', release);
        canvas.addEventListener('pointercancel', release);

        function resetBall() { ball.x = cannon.x; ball.y = cannon.y; ball.vx = ball.vy = 0; ball.launched = false; }
        function shotOver() {
            if (targets.length === 0 || shots === 0) {
                ended = true;
                if (targets.length === 0) S.score += shots * 50;
                const fb = $('#shot-feedback', stage);
                if (fb) { fb.textContent = targets.length === 0 ? 'CRATES SMASHED!' : 'OUT OF CANNONBALLS!'; fb.style.display = 'block'; }
                const sc = $('#birds-score', stage); if (sc) sc.textContent = `Score: ${S.score}`;
                setTimeout(() => { cancelAnimationFrame(animId); if (document.body.contains(stage)) shop(); }, 1400);
            } else resetBall();
        }

        function loop() {
            if (!document.body.contains(canvas)) { cancelAnimationFrame(animId); return; }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            if (shake > 0) { shake--; ctx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8); }

            const sky = ctx.createLinearGradient(0, 0, 0, groundY);
            sky.addColorStop(0, '#0f172a'); sky.addColorStop(1, '#1e3a8a');
            ctx.fillStyle = sky; ctx.fillRect(0, 0, canvas.width, groundY);
            ctx.fillStyle = '#78350f'; ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
            ctx.strokeStyle = '#451a03'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(canvas.width, groundY); ctx.stroke();
            ctx.fillStyle = '#1e293b'; ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(0, 180); ctx.quadraticCurveTo(80, 150, 180, groundY); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#334155'; ctx.stroke();

            // cannon barrel points the way the shot will fly (opposite of the drag)
            const angle = dragging ? Math.atan2(cannon.y - ball.y, cannon.x - ball.x) : 0.2;
            ctx.save(); ctx.translate(cannon.x, cannon.y); ctx.rotate(angle);
            ctx.fillStyle = '#334155'; ctx.fillRect(0, -14, 52, 28);
            ctx.fillStyle = '#1e293b'; ctx.fillRect(44, -16, 8, 32);
            ctx.restore();
            ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(cannon.x - 12, cannon.y + 11, 10, 0, Math.PI * 2); ctx.arc(cannon.x + 12, cannon.y + 11, 10, 0, Math.PI * 2); ctx.fill();
            if (muzzle > 0) { muzzle--; ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(cannon.x + Math.cos(angle) * 55, cannon.y + Math.sin(angle) * 55, 18, 0, Math.PI * 2); ctx.fill(); }

            if (dragging) {
                let sx = ball.x, sy = ball.y, vx = (cannon.x - ball.x) * 0.38, vy = (cannon.y - ball.y) * 0.38;
                ctx.strokeStyle = 'rgba(0,242,254,.7)'; ctx.lineWidth = 2.5; ctx.setLineDash([5, 5]);
                ctx.beginPath(); ctx.moveTo(sx, sy);
                for (let i = 0; i < 30; i++) { sx += vx; sy += vy; vy += gravity; ctx.lineTo(sx, sy); }
                ctx.stroke(); ctx.setLineDash([]);
                ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(cannon.x, cannon.y); ctx.lineTo(ball.x, ball.y); ctx.stroke();
            }

            for (let i = targets.length - 1; i >= 0; i--) {
                const t = targets[i];
                ctx.fillStyle = '#b45309'; ctx.fillRect(t.x, t.y, t.w, t.h);
                ctx.strokeStyle = '#78350f'; ctx.lineWidth = 3; ctx.strokeRect(t.x, t.y, t.w, t.h);
                ctx.beginPath(); ctx.moveTo(t.x, t.y); ctx.lineTo(t.x + t.w, t.y + t.h); ctx.moveTo(t.x + t.w, t.y); ctx.lineTo(t.x, t.y + t.h); ctx.stroke();
                if (ball.launched && ball.x + ball.r > t.x && ball.x - ball.r < t.x + t.w && ball.y + ball.r > t.y && ball.y - ball.r < t.y + t.h) {
                    smash(t);
                    targets.splice(i, 1);
                    if (S.bomb) {
                        for (let k = targets.length - 1; k >= 0; k--) if (Math.hypot(targets[k].x - t.x, targets[k].y - t.y) <= 85) { smash(targets[k]); targets.splice(k, 1); }
                    }
                    shake = 14;
                    const sc = $('#birds-score', stage); if (sc) sc.textContent = `Score: ${S.score}`;
                }
            }

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i]; p.x += p.vx; p.y += p.vy; p.alpha -= 0.035;
                ctx.globalAlpha = Math.max(0, p.alpha); ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, p.size, p.size);
                if (p.alpha <= 0) particles.splice(i, 1);
            }
            for (let i = floaters.length - 1; i >= 0; i--) {
                const f = floaters[i]; f.y -= 1.25; f.alpha -= 0.025;
                ctx.globalAlpha = Math.max(0, f.alpha); ctx.fillStyle = '#2ed573'; ctx.font = 'bold 16px Inter, sans-serif'; ctx.fillText(f.text, f.x, f.y);
                if (f.alpha <= 0) floaters.splice(i, 1);
            }
            ctx.globalAlpha = 1;

            ctx.fillStyle = S.heavy ? '#475569' : '#0f172a'; ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#94a3b8'; ctx.beginPath(); ctx.arc(ball.x - 4, ball.y - 4, 3.5, 0, Math.PI * 2); ctx.fill();
            ctx.restore();

            if (ball.launched && !ended) {
                ball.frames++;
                ball.x += ball.vx; ball.y += ball.vy; ball.vy += gravity;
                if (ball.y + ball.r >= groundY) {
                    ball.y = groundY - ball.r; ball.vy = -ball.vy * 0.35; ball.vx *= 0.82;
                    if (Math.abs(ball.vy) < 0.5) ball.vy = 0;
                }
                const settled = (ball.vy === 0 && Math.abs(ball.vx) < 0.2) || ball.x > canvas.width + 40 || ball.x < -40 || ball.frames > 700;
                if (targets.length === 0 || settled) shotOver();
            }
            animId = requestAnimationFrame(loop);
        }
        function smash(t) {
            S.score += 100 * S.mult;
            for (let p = 0; p < 16; p++) particles.push({ x: t.x + t.w / 2, y: t.y + t.h / 2, vx: (Math.random() - 0.5) * 9, vy: (Math.random() - 0.5) * 9, color: Math.random() > 0.5 ? '#f59e0b' : '#ef4444', alpha: 1, size: 3 + Math.random() * 5 });
            floaters.push({ text: `+${100 * S.mult} PTS!`, x: t.x, y: t.y, alpha: 1 });
        }
        animId = requestAnimationFrame(loop);
    }

    function shop() {
        const last = S.q >= questions.length - 1;
        stage.innerHTML = `
            <div class="quiz-game-card theme-pirate" style="max-width:580px;">
                <h2 class="shop-title" style="color:#ff4757;">🏹 Cannon Shop &amp; Upgrades</h2>
                <p class="shop-credits">Available Credits: <strong class="credit-highlight">${S.credits} 💰</strong></p>
                <div class="armory-grid">
                    <button type="button" class="shop-btn" data-buy="heavy" data-cost="40" ${S.heavy ? 'disabled' : ''}>💣 Heavy Iron Ball (40 💰)<small>${S.heavy ? '✅ Owned' : 'Flatter, heavier shots'}</small></button>
                    <button type="button" class="shop-btn" data-buy="bomb" data-cost="80" ${S.bomb ? 'disabled' : ''}>💥 Explosive Shot (80 💰)<small>${S.bomb ? '✅ Owned' : 'Area splash damage'}</small></button>
                    <button type="button" class="shop-btn full" data-buy="mult" data-cost="60" ${S.mult > 1 ? 'disabled' : ''}>🌟 2x Multiplier (60 💰)<small>${S.mult > 1 ? '✅ Active' : 'Double points'}</small></button>
                </div>
                <button type="button" class="btn-continue-shop" id="skip-shop">${last ? 'Finish →' : 'Continue to Next Question →'}</button>
            </div>`;
        $$('[data-buy]', stage).forEach(b => b.onclick = () => {
            const cost = parseInt(b.dataset.cost, 10), k = b.dataset.buy;
            if (S.credits < cost) { toast('Not enough credits for that upgrade.', 'warn'); return; }
            S.credits -= cost;
            if (k === 'mult') S.mult = 2; else S[k] = true;
            toast('Upgrade purchased!', 'success');
            shop();
        });
        $('#skip-shop', stage).onclick = () => { S.q++; ask(); };
    }

    function finish() {
        const total = S.quiz * 150 + S.score;
        finishGame({ modal, stage, modId, subId, gameKey: 'pirate', title: '🏴‍☠️ Battle', quizScore: S.quiz, total: questions.length, arcadeLabel: 'Total Arcade Score', arcadeScore: total, theme: 'theme-pirate', retry: () => runPirateGame(modId, subId) });
    }
    ask();
}

// ============================================================================
// 7. SECURITY HELPERS, PROFILES, SHOP & GLOBAL LEADERBOARD (Firebase Firestore)
// ============================================================================
const PortalSecurity = (() => {
    const blockedWords = ['shit', 'fuck', 'bitch', 'asshole', 'slut', 'dick', 'nigger', 'cunt', 'nigga', 'faggot'];
    const containsProfanity = text => {
        if (!text) return false;
        const t = String(text).toLowerCase().replace(/[^a-z]/g, '');
        return blockedWords.some(w => t.includes(w));
    };
    function validateUserMetrics(user) {
        if (!user) return user;
        if (typeof user.xp !== 'number' || Number.isNaN(user.xp) || user.xp < 0) user.xp = 0;
        user.xp = Math.min(user.xp, 100000);
        if (!user.scores || typeof user.scores !== 'object') user.scores = {};
        ['rocket', 'blockblast', 'pirate'].forEach(g => {
            const v = user.scores[g];
            user.scores[g] = (typeof v !== 'number' || Number.isNaN(v) || v < 0) ? 0 : Math.min(v, 50000);
        });
        return user;
    }
    return { containsProfanity, validateUserMetrics };
})();

const SHOP = [
    { key: 'bg_electric_blue', type: 'bg', name: 'Electric Blue Background', desc: 'Sleek electric blue theme.', cost: 50, img: 'images/Designer (5).png' },
    { key: 'avatar_pixel_orange', type: 'avatar', name: 'Orange Robot Pixelated', desc: 'Retro 8-bit bot avatar.', cost: 250, img: 'images/Designer (4).png' },
    { key: 'avatar_realistic_scrappy', type: 'avatar', name: 'Realistic Scrappy', desc: 'High-res mascot avatar.', cost: 300, img: 'images/Neon Cyan Floating Robot Mascot.png' },
    { key: 'avatar_true_gold_scrappy', type: 'avatar', name: 'True Gold Scrappy', desc: 'The ultimate status flex avatar.', cost: 9999, img: 'images/Radiant Golden Robot Mascot Portrait.png', tier: 'gold' },
    { key: 'avatar_error_hand', type: 'avatar', name: 'Error Hand Avatar', desc: 'System glitch aesthetic.', cost: 150, img: 'images/Glitch Eye Cybernetic Hand.png' },
    { key: 'avatar_yellow_robot', type: 'avatar', name: 'Yellow Robot', desc: 'Classic designer bot avatar.', cost: 50, img: 'images/Glossy Yellow Robot Mascot Avatar.png' },
    { key: 'avatar_bagel_robot', type: 'avatar', name: 'Bagel Robot', desc: 'Carb-powered mechanical unit.', cost: 250, img: 'images/generate_image_01.png' },
    { key: 'bg_robot_painting', type: 'bg', name: 'Robot Painting BG', desc: 'Artistic mechanical backdrop.', cost: 250, img: 'images/Untitled Design (2).png' },
    { key: 'bg_true_gold', type: 'bg', name: 'True Gold Background', desc: 'Pure luxury profile aesthetic.', cost: 1000, img: 'images/generate_image_02.png', tier: 'gold' },
    { key: 'bg_deep_space', type: 'bg', name: 'Deep Space Background', desc: 'Cosmic starfield theme.', cost: 100, img: 'images/generate_a_flat_front-facing_full-bleed_deep_space_cosmic_ba.jpg' },
    { key: 'bg_scrappy_console', type: 'bg', name: 'Scrappy on Console BG', desc: 'Arcade workstation setup.', cost: 150, img: 'images/b649ac97-d785-4643-951c-191279da5b6b.jpg' },
    { key: 'avatar_true_god_scrappy', type: 'avatar', name: 'True God Scrappy', desc: 'Ascended mascot form.', cost: 350, img: 'images/generate_image_01 (1).png', tier: 'purple' }
];
const AVATAR_MAP = Object.fromEntries(SHOP.filter(i => i.type === 'avatar').map(i => [i.key, i.img]));
const BG_MAP = { bg_default: '', ...Object.fromEntries(SHOP.filter(i => i.type === 'bg').map(i => [i.key, i.img])) };
const STARTER_AVATARS = ['images/Designer (1).png', 'images/Designer (2).png', 'images/Designer (3).png'];

const Portal = (() => {
    const ID_KEY = 'ai_portal_active_user_id', THEME_KEY = 'ai_portal_active_theme', LOCAL_KEY = 'ai_portal_local_directory';
    let dir = [];
    let category = 'xp';

    const SEEDS = [
        { id: 'seed_1', username: 'NovaPrime', bio: 'Neural network architect & laser ace', avatar: 'images/Designer (1).png', background: 'bg_default', xp: 650, scores: { rocket: 1420, blockblast: 980, pirate: 1100 }, unlocks: ['bg_default'] },
        { id: 'seed_2', username: 'ByteRunner', bio: 'Prompt engineering speedrunner', avatar: 'images/Designer (2).png', background: 'bg_default', xp: 480, scores: { rocket: 1150, blockblast: 1240, pirate: 890 }, unlocks: ['bg_default'] }
    ];

    function normalize(d) {
        d.scores = d.scores && typeof d.scores === 'object' ? d.scores : {};
        if (d.scores.pirate === undefined) d.scores.pirate = d.pirateScore || d.scores.angrybirds || 0;
        ['rocket', 'blockblast'].forEach(g => { if (d.scores[g] === undefined) d.scores[g] = 0; });
        if (!Array.isArray(d.unlocks) || !d.unlocks.length) d.unlocks = ['bg_default'];
        d.username = d.username || 'Cadet';
        return d;
    }

    const getActiveUser = () => {
        const id = localStorage.getItem(ID_KEY);
        return id ? dir.find(u => u.id === id) || null : null;
    };

    async function persist(user) {
        PortalSecurity.validateUserMetrics(user);
        const i = dir.findIndex(u => u.id === user.id);
        if (i >= 0) dir[i] = user; else dir.push(user);
        store.set(LOCAL_KEY, dir);
        refreshUI();
        if (db) {
            try { await db.collection('cadets').doc(user.id).set(user, { merge: true }); }
            catch (err) { console.error('Cloud save failed:', err); toast('Cloud save failed. Your progress is kept on this device.', 'error'); }
        }
    }

    function initSync() {
        if (!db) {
            dir = store.get(LOCAL_KEY, []).map(normalize);
            if (!dir.length) SEEDS.forEach(s => persist(normalize({ ...s })));
            refreshUI();
            return;
        }
        db.collection('cadets').onSnapshot(snap => {
            const cloud = [];
            snap.forEach(doc => cloud.push(normalize({ id: doc.id, ...doc.data() })));
            if (!cloud.length) { SEEDS.forEach(s => persist(normalize({ ...s }))); return; }
            dir = cloud;
            store.set(LOCAL_KEY, dir);
            refreshUI();
        }, err => {
            console.error('Firestore sync error:', err);
            dir = store.get(LOCAL_KEY, []).map(normalize);
            refreshUI();
        });
    }

    function award(game, score, xp) {
        store.set('localXP', store.get('localXP', 0) + xp);
        const u = getActiveUser();
        if (!u) return false;
        u.xp = (Number(u.xp) || 0) + xp;
        if (typeof score === 'number' && score >= 0 && score <= 50000 && score > (u.scores[game] || 0)) u.scores[game] = score;
        persist(u);
        return true;
    }

    function buy(key) {
        const user = getActiveUser(), item = SHOP.find(i => i.key === key);
        if (!user) { toast('Create or select a profile first!', 'warn'); return; }
        if (!item) return;
        if (user.unlocks.includes(key)) { toast('You already unlocked this item.', 'warn'); return; }
        if ((user.xp || 0) < item.cost) { toast(`Not enough XP. You need ${item.cost} XP but have ${user.xp || 0}.`, 'warn'); return; }
        user.xp -= item.cost;
        user.unlocks.push(key);
        persist(user);
        toast(`Unlocked ${item.name}!`, 'success');
    }

    function equip(key) {
        const user = getActiveUser();
        if (!user) return;
        if (AVATAR_MAP[key]) { user.avatar = AVATAR_MAP[key]; toast('Avatar equipped.', 'success'); }
        else if (key in BG_MAP) { user.background = key; localStorage.setItem(THEME_KEY, key); toast('Background equipped.', 'success'); }
        persist(user);
    }

    const rankTitle = xp => xp >= 1000 ? 'Grandmaster AI Architect' : xp >= 500 ? 'Cyber Specialist' : xp >= 200 ? 'Prompt Engineer' : 'Rookie AI Explorer';

    function renderDirectory() {
        const list = $('#global-directory-list');
        if (!list) return;
        const me = getActiveUser();
        const q = ($('#global-profile-search')?.value || '').toLowerCase().trim();
        const rows = dir.filter(u => u.username.toLowerCase().includes(q) || (u.bio || '').toLowerCase().includes(q))
            .sort((a, b) => category === 'xp' ? (b.xp || 0) - (a.xp || 0) : (b.scores[category] || 0) - (a.scores[category] || 0));
        if (!rows.length) { list.innerHTML = `<p class="empty-note">No cadets found${q ? ` matching "${esc(q)}"` : ''}.</p>`; return; }
        const label = { xp: u => `${u.xp || 0} XP`, rocket: u => `Rocket: ${u.scores.rocket || 0} pts`, blockblast: u => `Block Blast: ${u.scores.blockblast || 0} pts`, pirate: u => `Pirate: ${u.scores.pirate || 0} pts` }[category];
        list.innerHTML = rows.map((u, i) => {
            const isMe = me && u.id === me.id;
            return `<div class="directory-row${isMe ? ' is-me' : ''}">
                <div class="dir-user-info"><span class="dir-rank">#${i + 1}</span>
                    <div class="dir-avatar"><img src="${esc(u.avatar)}" alt=""></div>
                    <div><span class="dir-name">${esc(u.username)}${isMe ? ' (You)' : ''}</span><span class="dir-bio">${esc(u.bio || 'AI Learning Cadet')}</span></div>
                </div><div class="dir-scores">${label(u)}</div></div>`;
        }).join('');
    }

    function refreshUI() {
        const user = getActiveUser();
        const navLabel = $('#nav-username-label'), createView = $('#create-account-view'), activeView = $('#active-profile-view');
        if (navLabel) navLabel.textContent = user ? user.username : 'Create Profile';

        if (activeView) {
            const theme = (user && user.background) || localStorage.getItem(THEME_KEY) || 'bg_default';
            activeView.className = theme === 'bg_default' ? 'theme-default' : `theme-${theme}`;
            activeView.style.backgroundImage = BG_MAP[theme] ? `linear-gradient(rgba(10,10,20,.85), rgba(10,10,20,.95)), url('${BG_MAP[theme]}')` : '';
            activeView.style.backgroundSize = 'cover';
            activeView.style.backgroundPosition = 'center';
        }
        if (!user) {
            if (createView) createView.style.display = 'block';
            if (activeView) activeView.style.display = 'none';
            renderDirectory();
            return;
        }
        if (createView) createView.style.display = 'none';
        if (activeView) activeView.style.display = 'block';

        $('#dash-avatar').innerHTML = `<img src="${esc(user.avatar)}" alt="Your avatar">`;
        $('#dash-username').textContent = user.username;
        $('#dash-rank').textContent = rankTitle(user.xp || 0);
        $('#dash-bio').textContent = user.bio || 'Ready to conquer the AI modules.';
        $('#dash-xp').textContent = user.xp || 0;
        $('#dash-score-rocket').textContent = user.scores.rocket || 0;
        $('#dash-score-blockblast').textContent = user.scores.blockblast || 0;
        $('#dash-score-pirate').textContent = user.scores.pirate || 0;

        // shop buttons show owned items
        $$('#shop-grid [data-buy]').forEach(b => {
            const owned = user.unlocks.includes(b.dataset.buy);
            b.disabled = owned;
            b.textContent = owned ? '✅ Owned' : `Unlock (${b.dataset.cost} XP)`;
        });

        // inventory
        const inv = $('#user-inventory-list');
        inv.innerHTML = user.unlocks.length
            ? user.unlocks.map(k => `<div class="inventory-item"><span>✅ ${esc(k.replace(/_/g, ' ').toUpperCase())}</span><button type="button" class="btn-cyan-secondary" data-equip="${esc(k)}">Equip</button></div>`).join('')
            : '<span>No items unlocked yet. Buy something from the vault above!</span>';

        // avatar picker
        const avatars = [...new Set([...STARTER_AVATARS, ...user.unlocks.map(k => AVATAR_MAP[k]).filter(Boolean)])];
        $('#edit-avatar-picker').innerHTML = avatars.map(p => `<button type="button" class="avatar-pick${user.avatar === p ? ' selected' : ''}" data-avatar="${esc(p)}"><img src="${esc(p)}" alt=""></button>`).join('');

        renderDirectory();
        if ($('#dashboard-page-view')?.classList.contains('is-active')) updateDashboardStats();
    }

    function buildShop() {
        $('#shop-grid').innerHTML = SHOP.map(i => `
            <div class="shop-item${i.tier ? ' tier-' + i.tier : ''}">
                <div class="thumb ${i.type === 'bg' ? 'bg' : 'avatar'}"><img src="${esc(i.img)}" alt="${esc(i.name)} preview" loading="lazy"></div>
                <h4>${esc(i.name)}</h4><p>${esc(i.desc)}</p>
                <button type="button" class="btn-cyan-secondary" data-buy="${i.key}" data-cost="${i.cost}">Unlock (${i.cost} XP)</button>
            </div>`).join('');
    }

    function bind() {
        buildShop();
        let createAvatar = STARTER_AVATARS[0];
        $$('#create-avatar-picker .avatar-pick').forEach(btn => btn.addEventListener('click', () => {
            $$('#create-avatar-picker .avatar-pick').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            createAvatar = btn.dataset.avatar || createAvatar;
        }));

        $('#create-account-form').addEventListener('submit', e => {
            e.preventDefault();
            const username = $('#new-username').value.trim(), bio = $('#new-bio').value.trim();
            if (!username) return;
            if (PortalSecurity.containsProfanity(username) || PortalSecurity.containsProfanity(bio)) { toast('Please choose an appropriate callsign and bio.', 'warn'); return; }
            if (dir.some(u => u.username.toLowerCase() === username.toLowerCase())) { toast('That callsign is taken. Try another one.', 'warn'); return; }
            const user = { id: 'cadet_' + Date.now(), username, bio: bio || 'AI Explorer', avatar: createAvatar, background: 'bg_default', xp: 100 + store.get('localXP', 0), scores: { rocket: 0, blockblast: 0, pirate: 0 }, unlocks: ['bg_default'] };
            localStorage.setItem(ID_KEY, user.id);
            persist(user);
            e.target.reset();
            toast(`Welcome aboard, ${username}!`, 'success');
        });

        $('#btn-save-profile-edits').addEventListener('click', () => {
            const user = getActiveUser();
            if (!user) { toast('No active profile found.', 'warn'); return; }
            const name = $('#edit-username-input').value.trim(), bio = $('#edit-bio-input').value.trim();
            if (!name && !bio) { toast('Type a new callsign or bio first.', 'warn'); return; }
            if (PortalSecurity.containsProfanity(name) || PortalSecurity.containsProfanity(bio)) { toast('Please choose appropriate text.', 'warn'); return; }
            if (name && dir.some(u => u.id !== user.id && u.username.toLowerCase() === name.toLowerCase())) { toast('That callsign is taken.', 'warn'); return; }
            if (name) user.username = name;
            if (bio) user.bio = bio;
            persist(user);
            $('#edit-username-input').value = ''; $('#edit-bio-input').value = '';
            toast('Profile updated!', 'success');
        });

        $('#btn-switch-profile').addEventListener('click', () => { localStorage.removeItem(ID_KEY); refreshUI(); });

        $('#profile-page').addEventListener('click', e => {
            const buyBtn = e.target.closest('[data-buy]'); if (buyBtn) return buy(buyBtn.dataset.buy);
            const eq = e.target.closest('[data-equip]'); if (eq) return equip(eq.dataset.equip);
            const av = e.target.closest('#edit-avatar-picker .avatar-pick');
            if (av) { const u = getActiveUser(); if (u) { u.avatar = av.dataset.avatar; persist(u); } }
            const tab = e.target.closest('.lb-tab');
            if (tab) {
                $$('.lb-tab').forEach(t => t.classList.toggle('active', t === tab));
                category = tab.dataset.cat;
                renderDirectory();
            }
        });
        $('#global-profile-search').addEventListener('input', renderDirectory);
        initSync();
    }

    return { bind, getActiveUser, getDirectory: () => dir, award };
})();

// ============================================================================
// 8. CHATBOT ("Ask Scrappy")
//    Works out of the box with a built-in tutor. To use a REAL AI model, deploy a
//    small server/proxy (see notes) and paste its URL into CHATBOT_CONFIG.endpoint.
//    Never put an AI API key in this file: anyone can read front-end code.
// ============================================================================
const CHATBOT_CONFIG = {
    endpoint: '',            // e.g. 'https://scrappy-chat.YOUR-NAME.workers.dev'  (leave '' for built-in mode)
    timeoutMs: 20000,
    maxHistory: 8            // how many past messages are sent for context
};

const Chatbot = (() => {
    const KB = [
        { k: ['machine learning', 'what is ml', 'what is machine'], a: `Machine learning (ML) lets computers learn patterns from examples instead of following hand-written rules. You show a model lots of data, it finds patterns on its own, and it uses them to make predictions about new data. Lesson 1.1 covers this, including supervised, unsupervised, and reinforcement learning.` },
        { k: ['supervised'], a: `Supervised learning trains on labeled examples (questions with the correct answers attached), like a spam filter learning from emails marked "spam" or "not spam". Unsupervised learning has no labels and finds hidden groups instead.` },
        { k: ['unsupervised', 'cluster'], a: `Unsupervised learning looks for hidden patterns in unlabeled data. A store might use it to group shoppers with similar buying habits into segments.` },
        { k: ['reinforcement'], a: `Reinforcement learning is trial and error. An agent takes actions, earns rewards for good moves and penalties for bad ones, and gradually learns a winning strategy. It's how many game-playing and robot-control systems learn.` },
        { k: ['neural network', 'neuron', 'hidden layer', 'activation', 'weights', 'deep learning'], a: `A neural network is layers of simple "neurons". Each neuron weighs its inputs, adds a bias, and passes the result through an activation function. Hidden layers build complex features from simple ones, and the network learns by adjusting its weights and biases to reduce its errors. See Lesson 1.2.` },
        { k: ['computer vision', 'cnn', 'convolution', 'image recognition'], a: `Computer vision teaches computers to understand images and video. Convolutional Neural Networks (CNNs) slide small filters across pixels: early layers find edges, middle layers find textures, and deep layers assemble whole objects. Lesson 1.3 has a resolution simulator you can try.` },
        { k: ['hallucinat'], a: `A hallucination is when an AI states something false or made-up in a confident tone. Language models predict likely words; they don't check facts. Always verify AI claims, especially citations, against trusted primary sources.` },
        { k: ['prompt', 'prompting', 'prompt engineering'], a: `A strong prompt has four parts: a Role ("Act as an AP Biology tutor"), a clear Task verb (summarize, compare, debug), Context and audience, and Format/Constraints (length, structure, tone). Vague prompts make the model guess. Try the Prompt Architecture simulator in Lesson 2.1!` },
        { k: ['chain-of-thought', 'chain of thought', 'step by step', 'few-shot', 'few shot', 'zero-shot'], a: `Chain-of-Thought prompting asks the model to reason step by step, which helps on math, logic, and debugging. Few-shot prompting gives 2 to 5 worked examples, and zero-shot gives none. Self-critique asks the AI to review its own draft. See Lesson 2.2.` },
        { k: ['temperature'], a: `Temperature controls randomness. Low (0.0 to 0.3) gives consistent, factual output, which is good for code and facts. High (0.9 to 1.5) is more creative but more likely to invent facts. Lesson 2.3 has a slider to explore it.` },
        { k: ['cite', 'citation', 'apa', 'mla', 'plagiar', 'homework', 'cheat', 'academic'], a: `When AI is allowed on an assignment, be transparent: cite the tool, model version, date accessed, and the prompt used (MLA and APA both have formats), keep a prompt and verification log, and write the final work yourself. Check your teacher's or competition's policy first. See Lesson 3.1.` },
        { k: ['bias', 'fairness', 'fair '], a: `AI learns from data, so if the data reflects past prejudice or leaves groups out, the model can repeat or amplify that bias. Engineers fight it with diverse, representative data and subgroup audits. See Lesson 3.2 and Lesson 5.1.` },
        { k: ['pii', 'privacy', 'personal information', 'personal data'], a: `PII means Personally Identifiable Information: names, IDs, addresses, medical details, passwords. Don't paste it into public AI tools, because it may be logged or used in training pipelines.` },
        { k: ['deepfake', 'c2pa', 'synthetic media', 'fake video'], a: `Deepfakes are AI-made or altered audio, image, or video that imitates real people. Look for unnatural blinking, warped edges, and mismatched lip-sync, check C2PA Content Credentials when available, and cross-check viral clips with reputable sources before sharing. See Lesson 3.3.` },
        { k: ['missing value', 'outlier', 'data cleaning', 'preprocess', 'normaliz', 'one-hot', 'garbage in'], a: `Data cleaning comes first: handle missing values (drop or impute), remove outliers, scale features to a common range, and encode categories (like One-Hot Encoding). "Garbage in, garbage out": bad data makes bad models. See Lesson 4.1.` },
        { k: ['overfit', 'train/test', 'test set', 'training set', 'validation', 'generaliz'], a: `Overfitting is when a model memorizes its training data and does poorly on new data (for example 99% train accuracy but 58% test accuracy). A held-out test set (never used for training) reveals it. Lesson 4.2 has a simulator for split ratio and epochs.` },
        { k: ['feature engineering', 'feature', 'dimensionality'], a: `Feature engineering means creating or choosing the most useful inputs, like turning timestamps into an is_rush_hour flag. Removing irrelevant noise columns helps avoid the "curse of dimensionality". See Lesson 4.3.` },
        { k: ['explainable', 'xai', 'black box', 'model card', 'shap'], a: `Explainable AI (XAI) opens up "black-box" models so people can see which inputs drove a decision. Related practices are disparate impact audits, model cards, and a human appeal process. See Lesson 5.1.` },
        { k: ['copyright', 'license', 'licence', 'fair use', 'intellectual property'], a: `Being publicly visible online doesn't mean something is free to copy or train on. Check licenses (MIT, Apache 2.0, Creative Commons, Public Domain) and make generated work genuinely transformative. See Lesson 5.2.` },
        { k: ['guardrail', 'jailbreak', 'injection', 'red team', 'red-team'], a: `Guardrails are layered defenses: input filters catch malicious prompts (prompt injection and jailbreaks), output filters block harmful or private content, and red teaming stress-tests the system. Never rely on a single system prompt. See Lesson 5.3.` },
        { k: ['precision', 'recall', 'f1', 'accuracy', 'benchmark'], a: `Precision = of the things flagged positive, how many were right. Recall = of the real positives, how many were caught. F1 is their harmonic mean. Accuracy alone can mislead on rare events (a model that always says "healthy" scores 99% when only 1% are sick). See Lesson 6.1.` },
        { k: ['rlhf', 'alignment', 'reward model'], a: `RLHF (Reinforcement Learning from Human Feedback): people rank model answers, a reward model learns those preferences, and the AI is fine-tuned to be helpful, honest, and harmless. A KL penalty prevents reward hacking. See Lesson 6.2.` },
        { k: ['agent', 'multimodal', 'human-in-the-loop', 'hitl'], a: `AI agents plan multi-step tasks and use tools; multimodal models handle text, images, audio, and code. Human-in-the-loop design keeps people approving high-impact actions. See Lesson 6.3.` },
        { k: ['xp', 'badge', 'level up', 'points', 'shop', 'leaderboard'], a: `You earn XP for every correct quiz answer plus a bonus for completing a lesson for the first time. Spend XP in the Profile shop on avatars and backgrounds, and earn badges on the Dashboard as you complete modules. Your best arcade scores appear on the leaderboard.` },
        { k: ['unlock', 'locked', 'pass', 'module'], a: `Each lesson ends with an arcade quiz. Answer 4 out of 5 correctly to complete the lesson. Finish all three lessons in a module to unlock the next one.` },
        { k: ['video'], a: `Lesson 1.1 has a video before the spam-classifier simulator. Watch it and the simulator unlocks!` }
    ];
    const FALLBACK = `I'm not sure about that one yet. Try asking about machine learning, neural networks, prompts, temperature, citing AI, bias, overfitting, precision and recall, or how XP and badges work.`;
    let history = [];
    let busy = false;

    function localReply(text) {
        const t = text.toLowerCase();
        if (/^\s*(hi|hello|hey|yo|sup)\b/.test(t)) return `Hi! I'm Scrappy. Ask me anything about the AI Learning Portal's lessons.`;
        if (/\b(thanks|thank you)\b/.test(t)) return `You're welcome! Keep going. Every lesson you finish unlocks something new.`;
        let best = null, bestScore = 0;
        KB.forEach(entry => {
            const score = entry.k.filter(k => t.includes(k)).length;
            if (score > bestScore) { bestScore = score; best = entry; }
        });
        return best ? best.a : FALLBACK;
    }

    async function reply(text) {
        if (!CHATBOT_CONFIG.endpoint) return localReply(text);
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), CHATBOT_CONFIG.timeoutMs);
        try {
            const res = await fetch(CHATBOT_CONFIG.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: history.slice(-CHATBOT_CONFIG.maxHistory) }),
                signal: ctrl.signal
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json();
            if (!data.reply) throw new Error('Empty reply');
            setMode(true);
            return String(data.reply);
        } catch (err) {
            console.warn('AI endpoint failed, using built-in tutor.', err);
            setMode(false, true);
            return localReply(text);
        } finally { clearTimeout(timer); }
    }

    function setMode(live, failed) {
        const el = $('#chat-mode');
        if (!el) return;
        el.textContent = live ? 'Live AI tutor' : failed ? 'Offline: using built-in tutor' : 'Built-in tutor';
        el.classList.toggle('offline', !live && !!failed);
    }

    function addMessage(role, text) {
        const log = $('#chat-log');
        const el = document.createElement('div');
        el.className = `msg ${role}`;
        el.textContent = text;                 // textContent keeps user/AI text from running as HTML
        log.appendChild(el);
        log.scrollTop = log.scrollHeight;
        return el;
    }

    function greet() {
        $('#chat-log').innerHTML = '';
        history = [];
        addMessage('bot', `Hi, I'm Scrappy! 🤖 Ask me about anything in the six modules, from machine learning to prompt engineering to AI ethics.`);
    }

    async function send(text) {
        text = text.trim();
        if (!text || busy) return;
        busy = true;
        $('#chat-send').disabled = true;
        addMessage('user', text);
        history.push({ role: 'user', content: text });
        const typing = document.createElement('div');
        typing.className = 'msg bot';
        typing.innerHTML = '<span class="typing" aria-label="Scrappy is typing"><i></i><i></i><i></i></span>';
        $('#chat-log').appendChild(typing);
        $('#chat-log').scrollTop = $('#chat-log').scrollHeight;
        const [answer] = await Promise.all([reply(text), new Promise(r => setTimeout(r, 500))]);
        typing.remove();
        addMessage('bot', answer);
        history.push({ role: 'assistant', content: answer });
        busy = false;
        $('#chat-send').disabled = false;
        $('#chat-input').focus();
    }

    function bind() {
        greet();
        setMode(!!CHATBOT_CONFIG.endpoint);
        $('#chat-form').addEventListener('submit', e => {
            e.preventDefault();
            const input = $('#chat-input');
            const v = input.value;
            input.value = '';
            send(v);
        });
        $('#chat-chips').addEventListener('click', e => { const c = e.target.closest('.chip'); if (c) send(c.dataset.q); });
        $('#chat-clear').addEventListener('click', greet);
    }
    return { bind };
})();

// ============================================================================
// 9. INIT
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    renderModulesGrid();
    Portal.bind();
    Chatbot.bind();

    document.addEventListener('click', e => {
        const go = e.target.closest('[data-go]');
        if (go) return showPage(go.dataset.go);
        const modBtn = e.target.closest('[data-module]');
        if (modBtn && !modBtn.disabled) return navigateToModule(parseInt(modBtn.dataset.module, 10));
        const lesson = e.target.closest('[data-lesson]');
        if (lesson) { const [m, s] = lesson.dataset.lesson.split('.'); location.hash = `#module-${m}-${s}`; return; }
        const launch = e.target.closest('[data-launch]');
        if (launch) { const [m, s] = launch.dataset.launch.split('.').map(Number); return startArcadeQuiz(m, s); }
        if (e.target.closest('#preview-toggle')) {
            store.set('previewAll', !previewMode());
            renderModulesGrid();
            toast(previewMode() ? 'Preview mode on: all modules unlocked.' : 'Preview mode off.', 'info');
            return;
        }
        if (e.target.closest('#nav-profile-btn')) return showPage('profile');
        if (e.target.closest('#dash-continue')) {
            const next = LESSON_ORDER.find(([m, s]) => !lessonDone(m, s) && m <= maxUnlocked()) || LESSON_ORDER[0];
            location.hash = `#module-${next[0]}-${next[1]}`;
        }
    });

    document.addEventListener('input', e => {
        const box = e.target.closest && e.target.closest('.simulator-box[data-sim]');
        if (box && e.target.matches('input[type="range"]')) updateSim(box);
    });

    $('#nav-toggle').addEventListener('click', () => {
        const open = $('#nav-links').classList.toggle('open');
        $('#nav-toggle').setAttribute('aria-expanded', open);
    });
    $$('.nav-links a').forEach(a => a.addEventListener('click', () => $('#nav-links').classList.remove('open')));

    window.addEventListener('scroll', updateReadProgress, { passive: true });
    window.addEventListener('hashchange', route);
    route();
});