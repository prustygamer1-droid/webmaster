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

// Progress is saved per profile (see PortalAccount in theme.js), so each account starts fresh
const store = {
    get(key, fallback) {
        try { const v = localStorage.getItem(PortalAccount.key(key)); return v === null ? fallback : JSON.parse(v); }
        catch { return fallback; }
    },
    set(key, value) { try { localStorage.setItem(PortalAccount.key(key), JSON.stringify(value)); } catch { /* storage full or blocked */ } }
};
// Developer Mode: everything unlocked, nothing saved to the profile or the leaderboards
const devMode = () => PortalAccount.devMode();

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
    '1.2': {
        icon: '🧠', title: 'Interactive Simulator: Build an Artificial Neuron',
        desc: 'Change the input, weight, and bias to see how one neuron decides how strongly to activate.',
        out: 'Neuron Activation (Sigmoid):',
        sliders: [
            { k: 'x', label: 'Input Signal:', min: 0, max: 1, step: 0.1, value: 0.8, fmt: v => v.toFixed(1) },
            { k: 'w', label: 'Weight (Importance of the Input):', min: -6, max: 6, step: 0.5, value: 4, fmt: v => v.toFixed(1) },
            { k: 'b', label: 'Bias (Shifts the Threshold):', min: -6, max: 6, step: 0.5, value: -1.5, fmt: v => v.toFixed(1) }
        ],
        calc: v => {
            const a = 1 / (1 + Math.exp(-(v.w * v.x + v.b)));
            return { out: a.toFixed(2), badge: a >= 0.7 ? ['NEURON FIRES', GREEN] : a >= 0.3 ? ['PARTIAL SIGNAL', AMBER] : ['NEURON STAYS QUIET', RED] };
        }
    },
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
                title: '1.1 Machine Learning Fundamentals',
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
                title: '1.2 Neural Networks & Deep Learning',
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
                    simBox('1.2'),
                    callout('🎮 BlockBlast Challenge', `After completing the knowledge check, continue to the BlockBlast activity to reinforce what you've learned.`)
                )
            },
            3: {
                title: '1.3 Computer Vision & Generative AI Risks',
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
                    para(`Computer vision systems are also vulnerable to <strong>adversarial attacks</strong>—tiny, human-imperceptible pixel modifications that trick neural networks into misclassifying objects entirely. For example, placing a tiny, inconspicuous sticker on a stop sign can cause an autonomous vehicle's vision model to classify it as a 45 MPH speed limit sign, proving that AI pattern recognition operates very differently from human cognitive reasoning.`)
                )
            }
        }
    },
    2: {
        title: 'Module 2: Practical AI Tools & Techniques',
        subs: {
            1: {
                title: '2.1 Foundational Prompt Engineering',
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
                    ])
                )
            },
            2: {
                title: '2.2 Advanced Reasoning Frameworks',
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
                    ])
                )
            },
            3: {
                title: '2.3 Hyperparameters & Fact Verification',
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
                title: '3.1 Academic Citation Standards',
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
                    ])
                )
            },
            2: {
                title: '3.2 Algorithmic Bias & Data Privacy',
                html: () => article(
                    hdr('Fairness & Privacy', 'Algorithmic Bias & Data Privacy Protection', 'Discover how historical prejudices enter training datasets and why protecting Personally Identifiable Information (PII) is vital.'),
                    h3('1. How Historical Bias Enters Machine Learning'),
                    para('Algorithms do not possess personal prejudices, yet they frequently amplify inequality. When a model is trained on historical data—such as past hiring decisions, loan approvals, or medical studies that underrepresented certain demographics—it learns to treat historical bias as a predictive rule.'),
                    para('At the same time, typing private data—like full names, student IDs, medical details, or passwords—into public AI chatbots risks exposing <strong>Personally Identifiable Information (PII)</strong> through logs or model training pipelines.'),
                    takeaway('Fair AI requires diverse, representative training datasets and regular subgroup audits—and smart users never paste private personal data into public AI tools.')
                )
            },
            3: {
                title: '3.3 Deepfakes & Synthetic Media',
                html: () => article(
                    hdr('Media Literacy', 'Synthetic Media, Deepfakes & Digital Trust', 'Learn how generative audio and video synthesis works and how to spot visual artifacts and missing cryptographic provenance.'),
                    h3('1. Recognizing Synthetic Audio and Video'),
                    para('<strong>Deepfakes</strong> use generative neural networks (such as diffusion models and GANs) to clone voices or swap faces in video with startling realism. While synthetic media has positive uses in film dubbing and accessibility, malicious deepfakes threaten elections, online safety, and digital trust.'),
                    para('Verifying media requires checking both visual/audio cues (unnatural blinking, warped background edges, flat vocal cadence) and cryptographic provenance standards like <strong>C2PA Content Credentials</strong>.'),
                    takeaway('"Seeing is believing" no longer applies online. Always verify viral clips against multiple reputable news outlets and inspect metadata before sharing.')
                )
            }
        }
    },
    4: {
        title: 'Module 4: Data & Training Pipelines',
        subs: {
            1: {
                title: '4.1 Data Cleaning & Preprocessing',
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
                    ])
                )
            },
            2: {
                title: '4.2 Training vs Test Splits',
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
                title: '4.3 Feature Engineering',
                html: () => article(
                    hdr('Signal Extraction', 'Feature Engineering & Dimensionality', 'Discover how domain knowledge transforms raw columns into high-signal predictors that dramatically simplify model learning.'),
                    h3('1. Turning Raw Variables into Predictive Signals'),
                    para('<strong>Feature Engineering</strong> is the art of creating, combining, or selecting the most informative input variables for a machine learning model. For example, instead of feeding raw timestamps into a delivery-time predictor, engineering a boolean feature called <code>is_rush_hour</code> immediately exposes the pattern that matters most.'),
                    para('Conversely, feeding dozens of irrelevant noise columns causes the <strong>Curse of Dimensionality</strong>, slowing down training and confusing the model.'),
                    takeaway('Domain expertise shines in feature engineering: removing irrelevant noise columns while crafting meaningful ratios or flags boosts both speed and accuracy.')
                )
            }
        }
    },
    5: {
        title: 'Module 5: Advanced Ethics & Governance',
        subs: {
            1: {
                title: '5.1 Algorithmic Fairness & Transparency',
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
                    ])
                )
            },
            2: {
                title: '5.2 Copyright & IP Compliance',
                html: () => article(
                    hdr('Intellectual Property', 'Copyright, Licensing & Fair Use in AI', 'Navigate the legal and ethical rules governing training datasets, open-source licenses, and generative AI outputs.'),
                    h3('1. Respecting Creators Across the AI Lifecycle'),
                    para('Modern generative models learn from billions of images, articles, and code repositories. Using copyrighted books, artwork, or proprietary code without permission or proper licensing raises serious intellectual property disputes.'),
                    para('Ethical developers verify dataset licenses (such as <strong>MIT, Apache 2.0, Creative Commons,</strong> or <strong>Public Domain</strong>) and ensure generated works are genuinely transformative rather than direct copies of protected art or text.'),
                    takeaway('Just because an image or snippet of code is publicly visible on the internet does not mean it is free to copy or train on without checking its license.')
                )
            },
            3: {
                title: '5.3 Safety Protocols & Guardrails',
                html: () => article(
                    hdr('AI Safety Engineering', 'Safety Guardrails, Red Teaming & Defense', 'Learn how engineers protect AI applications against prompt injection attacks, jailbreaks, and harmful outputs.'),
                    h3('1. Defense-in-Depth: Input & Output Guardrails'),
                    para('When an AI chatbot is deployed to students or customers, bad actors may attempt <strong>prompt injection</strong> or "jailbreak" tricks designed to override system instructions. To prevent misuse, engineers build multi-layered <strong>Safety Guardrails</strong>.'),
                    para('Input classifiers screen incoming prompts for malicious intent before they reach the main model, while output filters inspect responses to block toxic content, PII leaks, or unsafe advice—validated continuously through adversarial <strong>Red Teaming</strong>.'),
                    takeaway('Never rely on a single system prompt for security. True AI safety layers input validation, output moderation, and continuous red-team stress testing.')
                )
            }
        }
    },
    6: {
        title: 'Module 6: Testing & Evaluation',
        subs: {
            1: {
                title: '6.1 Benchmark Testing & Metrics',
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
                title: '6.2 Model Alignment & Reinforcement',
                html: () => article(
                    hdr('Human Alignment', 'RLHF & Aligning Models with Human Values', 'Understand how Reinforcement Learning from Human Feedback transforms raw next-word predictors into helpful, honest, and harmless assistants.'),
                    h3('1. From Raw Pretraining to Helpful Assistants'),
                    para('A base language model trained only to predict internet text might respond to a question with another question or generate unhelpful jargon. To align model behavior with human expectations, engineers apply <strong>RLHF (Reinforcement Learning from Human Feedback)</strong>.'),
                    para('Human reviewers compare pairs of model responses and rank which one is more helpful and safe. Those rankings train a <strong>Reward Model</strong>, which then fine-tunes the AI using reinforcement learning—while a <strong>KL-Divergence penalty</strong> stops the model from gaming the reward signal with repetitive or unnatural text.'),
                    takeaway('Pretraining gives an AI knowledge; RLHF alignment teaches it judgment, safety boundaries, and how to follow human intent constructively.')
                )
            },
            3: {
                title: '6.3 Future Horizons of AI',
                html: () => article(
                    hdr('Capstone & Future', 'Future Horizons & Responsible Innovation', 'Look ahead at autonomous AI agents, multimodal systems, and how the next generation of student innovators can build safe, human-centered technology.'),
                    h3('1. Agentic Workflows & Human-in-the-Loop Design'),
                    para('AI is rapidly evolving from single-turn chatbots into <strong>multimodal agents</strong> capable of reasoning across text, code, audio, and live video while using external software tools. As autonomy grows, keeping <strong>Humans-in-the-Loop (HITL)</strong> for high-impact approvals ensures technology amplifies human creativity rather than replacing human accountability.'),
                    para('Congratulations on completing the full AI Learning Portal curriculum! By combining technical literacy, rigorous evaluation metrics, and strong ethical guardrails, you are ready to lead responsibly in an AI-powered world.'),
                    takeaway(`The future of AI isn't automatic—it is shaped by the engineers, policymakers, and students who insist on transparency, fairness, and human oversight.`)
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
    const old = parseInt(store.get('maxUnlockedModule', 1), 10) || 1;
    for (let m = 1; m < old; m++) for (let s = 1; s <= 3; s++) completed[`${m}.${s}`] = true;
    store.set('completedLessons', completed);
}

const lessonDone = (m, s) => !!completed[`${m}.${s}`];
// One-time migration: students who progressed before Unit Tests existed keep their module access
// and module badges. They still need to pass every Unit Test to open the Final Exam.
let unitGate = store.get('unitGate', null);
if (unitGate === null) {
    const finished = [1, 2, 3, 4, 5, 6].filter(m => [1, 2, 3].every(s => lessonDone(m, s)));
    let open = 1;
    while (open < 6 && finished.includes(open)) open++;
    unitGate = { legacyModules: finished, legacyUnlocked: open };
    store.set('unitGate', unitGate);
}
const legacyModule = m => unitGate.legacyModules.includes(m);
// A module counts as passed once its lessons AND its Unit Test are done (see exams.js)
const moduleDone = m => [1, 2, 3].every(s => lessonDone(m, s)) && (unitPassed(m) || legacyModule(m));
const previewMode = () => store.get('previewAll', false);
// Passing a module's Unit Test is what unlocks the next module
function earnedUnlock() {
    let n = clamp(unitGate.legacyUnlocked, 1, 6);
    while (n < 6 && unitPassed(n)) n++;
    return n;
}
const maxUnlocked = () => previewMode() || devMode() ? 6 : earnedUnlock();
const saveMaxUnlocked = () => store.set('maxUnlockedModule', earnedUnlock());
const lockedMessage = m => `Module ${m} is locked. Pass the Module ${m - 1} Unit Test (80% or higher) to unlock it.`;
function completeLesson(m, s) {
    const key = `${m}.${s}`, first = !completed[key];
    completed[key] = true;
    store.set('completedLessons', completed);
    return { first };
}
// The next thing a student should do, as a page address
function nextStepHash() {
    for (let m = 1; m <= maxUnlocked(); m++) {
        const lesson = [1, 2, 3].find(s => !lessonDone(m, s));
        if (lesson) return `#module-${m}-${lesson}`;
        if (!unitPassed(m)) return `#module-${m}-test`;
    }
    return allUnitsPassed() && !activeCertificate() ? '#final-exam' : '#module-1-1';
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
        const testChip = `<span class="lesson-chip${unitPassed(mod.id) ? ' done' : ''}">${unitPassed(mod.id) ? '✓ ' : '📝 '}Test</span>`;
        return `
            <div class="module-card${open ? '' : ' locked'}" id="card-module-${mod.id}" style="--pop-delay:${0.1 + i * 0.1}s">
                <h3>${esc(mod.title)}</h3>
                <p>${esc(mod.desc)}</p>
                <div class="lesson-chips">${chips}${testChip}</div>
                <button class="quiz-btn" id="btn-module-${mod.id}" data-module="${mod.id}" ${open ? '' : 'disabled'}>${open ? 'Explore Module' : '🔒 Locked'}</button>
            </div>`;
    }).join('');
    const banner = $('#final-banner');
    if (banner) {
        const cert = activeCertificate(), ready = allUnitsPassed() || devMode();
        banner.className = 'final-banner' + (ready || cert ? ' ready' : '');
        banner.innerHTML = `<div><h3>🎓 Course Final Exam</h3><p>${cert ? 'Course completed. Your certificate is ready.' : ready ? 'All Unit Tests passed. The Final Exam is unlocked!' : `🔒 Pass all 6 Module Unit Tests to unlock (${unitsPassedCount()} of 6 passed).`}</p></div>
            <a class="${ready || cert ? 'btn-cyan-primary' : 'btn-ghost'}" href="#final-exam">${cert ? 'View Results' : ready ? 'Take the Final Exam' : 'See Requirements'}</a>`;
    }
    const t = $('#preview-toggle');
    if (t) {
        const on = previewMode();
        t.classList.toggle('on', on);
        t.setAttribute('aria-pressed', on);
        t.textContent = on ? '🔓 Preview Mode ON: all modules unlocked (click to turn off)' : '🔒 Judge / Preview Mode: unlock all modules';
    }
}

// ---- Badges: each one reports [current, target] so progress and unlocking share one rule
const lessonsDoneCount = () => LESSON_ORDER.filter(([m, s]) => lessonDone(m, s)).length;
const modulesDoneCount = () => MODULES.filter(m => moduleDone(m.id)).length;
const moduleSteps = m => moduleDone(m) ? 4 : [1, 2, 3].filter(s => lessonDone(m, s)).length + (unitPassed(m) ? 1 : 0);
const gamesPlayedCount = () => Object.keys(store.get('gamesPlayed', {})).length;
const perfectQuizCount = () => Object.keys(store.get('perfectQuizzes', {})).length;

const playedGame = key => () => store.get('gamesPlayed', {})[key] ? 1 : 0;
const SITE_PAGES = ['home', 'modules', 'dashboard', 'chatbot', 'references', 'profile'];

const BADGE_CATEGORIES = [
    { key: 'learn', label: 'Learning & Quiz Mastery' },
    { key: 'arcade', label: 'Arcade Games' },
    { key: 'combo', label: 'Combos & Streaks' },
    { key: 'explore', label: 'Portal Explorer' },
    { key: 'cert', label: 'Exams & Certification' }
];

// "cat" groups the badge on the dashboard (badges without one are in "learn")
const BADGES = [
    { id: 'first_steps', icon: '👣', name: 'First Steps', desc: 'Complete your first lesson', unit: 'lessons', target: 1, current: lessonsDoneCount },
    { id: 'pioneer', icon: '🚀', name: 'AI Pioneer', desc: 'Pass all 3 lessons and the Module 1 Unit Test', unit: 'steps', target: 4, current: () => moduleSteps(1) },
    { id: 'prompt', icon: '🧱', name: 'Prompt Architect', desc: 'Pass all 3 lessons and the Module 2 Unit Test', unit: 'steps', target: 4, current: () => moduleSteps(2) },
    { id: 'ethics', icon: '⚖️', name: 'Ethical Scholar', desc: 'Pass all 3 lessons and the Module 3 Unit Test', unit: 'steps', target: 4, current: () => moduleSteps(3) },
    { id: 'data', icon: '📊', name: 'Data Expert', desc: 'Pass all 3 lessons and the Module 4 Unit Test', unit: 'steps', target: 4, current: () => moduleSteps(4) },
    { id: 'governance', icon: '🛡️', name: 'Governance Guru', desc: 'Pass all 3 lessons and the Module 5 Unit Test', unit: 'steps', target: 4, current: () => moduleSteps(5) },
    { id: 'alignment', icon: '🎯', name: 'Alignment Master', desc: 'Pass all 3 lessons and the Module 6 Unit Test', unit: 'steps', target: 4, current: () => moduleSteps(6) },
    { id: 'quiz_ace', icon: '🧠', name: 'Quiz Ace', desc: 'Complete any 3 modules', unit: 'modules', target: 3, current: modulesDoneCount },
    { id: 'arcade_pro', cat: 'arcade', icon: '🕹️', name: 'Arcade Pro', desc: 'Finish 2 different minigames', unit: 'games', target: 2, current: gamesPlayedCount },
    { id: 'triple_threat', cat: 'arcade', icon: '🎲', name: 'Triple Threat', desc: 'Finish 3 different minigames', unit: 'games', target: 3, current: gamesPlayedCount },
    { id: 'flawless', icon: '💎', name: 'Flawless Run', desc: 'Score 5 out of 5 on any lesson quiz', unit: 'perfect quizzes', target: 1, current: perfectQuizCount },
    { id: 'sharpshooter', icon: '🏹', name: 'Sharpshooter', desc: 'Score 5 out of 5 on 5 different lesson quizzes', unit: 'perfect quizzes', target: 5, current: perfectQuizCount },
    { id: 'streak', icon: '🏆', name: 'Streak Master', desc: 'Master all 6 modules', unit: 'modules', target: 6, current: modulesDoneCount },
    { id: 'quiz_scholar', icon: '📘', name: 'Quiz Scholar', desc: 'Master 9 lesson quizzes', unit: 'quizzes', target: 9, current: lessonsDoneCount },
    { id: 'quiz_grandmaster', icon: '🎓', name: 'Quiz Grandmaster', desc: 'Master all 18 lesson quizzes', unit: 'quizzes', target: 18, current: lessonsDoneCount },

    { id: 'tower_guardian', cat: 'arcade', icon: '🛡️', name: 'Tower Guardian', desc: 'Finish Cyber Shield Defense (Lesson 2.1 or 4.2)', unit: 'games', target: 1, current: playedGame('defense') },
    { id: 'neon_racer', cat: 'arcade', icon: '🛹', name: 'Neon Racer', desc: 'Finish Neon Hover Runner (Lesson 1.1)', unit: 'games', target: 1, current: playedGame('runner') },
    // id kept from the old Vault game so badges already earned still count
    { id: 'vault_cracker', cat: 'arcade', icon: '⛰️', name: 'Summit Seeker', desc: 'Finish Sky Climb (Lesson 1.3 or 4.1)', unit: 'games', target: 1, current: () => playedGame('climb')() || playedGame('vault')() },
    { id: 'data_diver', cat: 'arcade', icon: '📦', name: 'Data Diver', desc: 'Finish Data Packet Catcher (Lesson 3.1)', unit: 'games', target: 1, current: playedGame('catcher') },
    { id: 'boss_slayer', cat: 'arcade', icon: '⚔️', name: 'Boss Slayer', desc: 'Defeat True God Scrappy (Lesson 2.2, 5.1 or 6.3)', unit: 'bosses', target: 1, current: () => store.get('bossDefeated', false) ? 1 : 0 },
    { id: 'arcade_legend', cat: 'arcade', icon: '👑', name: 'Arcade Legend', desc: 'Finish all 8 different minigames', unit: 'games', target: 8, current: gamesPlayedCount },

    { id: 'hot_streak', cat: 'combo', icon: '🔥', name: 'Hot Streak', desc: 'Answer 3 quiz questions correctly in a row', unit: 'in a row', target: 3, current: () => store.get('bestStreak', 0) },
    { id: 'unstoppable', cat: 'combo', icon: '⚡', name: 'Unstoppable', desc: 'Answer 5 quiz questions correctly in a row', unit: 'in a row', target: 5, current: () => store.get('bestStreak', 0) },
    { id: 'chain_reaction', cat: 'combo', icon: '💥', name: 'Chain Reaction', desc: 'Land a 10-hit action chain inside a minigame', unit: 'hits', target: 10, current: () => store.get('bestActionCombo', 0) },

    { id: 'explorer', cat: 'explore', icon: '🧭', name: 'Explorer', desc: 'Visit Home, Modules, Dashboard, Chatbot, References, and Profile', unit: 'pages', target: 6, current: () => SITE_PAGES.filter(p => PortalTheme.visited()[p]).length },
    { id: 'networker', cat: 'explore', icon: '🤝', name: 'Networker', desc: 'Inspect 2 other players from a leaderboard', unit: 'profiles', target: 2, current: () => Object.keys(store.get('inspectedCadets', {})).length },
    { id: 'world_builder', cat: 'explore', icon: '🌌', name: 'World Builder', desc: 'Equip a site-wide background', unit: 'backgrounds', target: 1, current: () => store.get('usedBackground', false) ? 1 : 0 },
    { id: 'curious_mind', cat: 'explore', icon: '💬', name: 'Curious Mind', desc: 'Ask Scrappy 3 questions', unit: 'questions', target: 3, current: () => store.get('questionsAsked', 0) },

    { id: 'test_pilot', cat: 'cert', icon: '📝', name: 'Test Pilot', desc: 'Pass your first Module Unit Test', unit: 'unit tests', target: 1, current: () => unitsPassedCount() },
    { id: 'perfect_unit', cat: 'cert', icon: '🌠', name: 'Perfect Unit', desc: 'Score 100% on any Unit Test', unit: 'perfect tests', target: 1, current: () => perfectUnitCount() },
    { id: 'unit_champion', cat: 'cert', icon: '🥇', name: 'Unit Champion', desc: 'Pass all 6 Module Unit Tests', unit: 'unit tests', target: 6, current: () => unitsPassedCount() },
    { id: 'graduate', cat: 'cert', icon: '🎓', name: 'AI Grandmaster', desc: 'Pass the Final Exam and earn your certificate', unit: 'certificate', target: 1, current: () => activeCertificate() ? 1 : 0 }
];
const BADGE_MAP = new Map(BADGES.map(b => [b.id, b]));
const badgeProgress = b => {
    const current = Math.min(b.current(), b.target);
    return { current, target: b.target, pct: Math.round((current / b.target) * 100), done: current >= b.target };
};

// ---- Profile rewards: unlocked automatically by the badge named in "badge"
const REWARD_TYPES = [
    { key: 'title', label: 'Unique Titles', single: 'Title' },
    { key: 'border', label: 'Avatar Borders', single: 'Avatar Border' },
    { key: 'accent', label: 'Theme Accents', single: 'Theme Accent' },
    { key: 'chat', label: 'Chat Badges', single: 'Chat Badge' },
    { key: 'bg', label: 'Site-Wide Backgrounds', single: 'Background' },
    { key: 'cursor', label: 'Cursor Effects', single: 'Cursor Effect' }
];
// "colors" are used by borders (two-color ring), "anim" animates a border,
// "rgb" is used by theme accents, and "bg" names a background from theme.js
const REWARDS = [
    { id: 'title_trailblazer', type: 'title', badge: 'first_steps', icon: '🏷️', name: 'Trailblazer' },
    { id: 'border_pioneer', type: 'border', badge: 'pioneer', icon: '⭕', name: 'Ion Ring', colors: ['#00f2fe', '#2563eb'] },
    { id: 'chat_prompt', type: 'chat', badge: 'prompt', icon: '⌨️', name: 'Prompt Smith' },
    { id: 'accent_ethics', type: 'accent', badge: 'ethics', icon: '🎨', name: 'Emerald Circuit', rgb: '52,211,153' },
    { id: 'accent_data', type: 'accent', badge: 'data', icon: '🎨', name: 'Solar Data', rgb: '251,191,36' },
    { id: 'border_governance', type: 'border', badge: 'governance', icon: '⭕', name: 'Sentinel Shield', colors: ['#34d399', '#38bdf8'] },
    { id: 'title_alignment', type: 'title', badge: 'alignment', icon: '🏷️', name: 'Alignment Architect' },
    { id: 'chat_quiz', type: 'chat', badge: 'quiz_ace', icon: '🧠', name: 'Big Brain' },
    { id: 'accent_arcade', type: 'accent', badge: 'arcade_pro', icon: '🎨', name: 'Synthwave Magenta', rgb: '244,114,182' },
    { id: 'chat_arcade', type: 'chat', badge: 'triple_threat', icon: '👾', name: 'Arcade Elite' },
    { id: 'border_flawless', type: 'border', badge: 'flawless', icon: '⭕', name: 'Prism Edge', colors: ['#f472b6', '#00f2fe'] },
    { id: 'title_sharpshooter', type: 'title', badge: 'sharpshooter', icon: '🏷️', name: 'Precision Operative' },
    { id: 'title_streak', type: 'title', badge: 'streak', icon: '🏷️', name: 'Neon Legend' },
    { id: 'border_legend', type: 'border', badge: 'streak', icon: '⭕', name: 'Legendary Plasma', colors: ['#ffd700', '#a855f7'], anim: 'pulse' },
    { id: 'accent_legend', type: 'accent', badge: 'streak', icon: '🎨', name: 'Ultraviolet Core', rgb: '192,132,252' },

    { id: 'bg_reward_aurora', type: 'bg', badge: 'quiz_scholar', icon: '🌌', name: 'Quantum Aurora', bg: 'bg_aurora' },
    { id: 'title_grandmaster', type: 'title', badge: 'quiz_grandmaster', icon: '🏷️', name: 'Quiz Grandmaster' },
    { id: 'border_singularity', type: 'border', badge: 'quiz_grandmaster', icon: '⭕', name: 'Singularity', colors: ['#ffffff', '#6366f1'], anim: 'spin' },
    { id: 'chat_warden', type: 'chat', badge: 'tower_guardian', icon: '🛡️', name: 'Firewall Warden' },
    { id: 'bg_reward_synthwave', type: 'bg', badge: 'neon_racer', icon: '🌌', name: 'Synthwave Sunset', bg: 'bg_synthwave' },
    { id: 'title_vault', type: 'title', badge: 'vault_cracker', icon: '🏷️', name: 'Sky Climber' },
    { id: 'chat_wrangler', type: 'chat', badge: 'data_diver', icon: '📦', name: 'Data Wrangler' },
    { id: 'title_slayer', type: 'title', badge: 'boss_slayer', icon: '🏷️', name: 'Godslayer' },
    { id: 'border_flame', type: 'border', badge: 'boss_slayer', icon: '⭕', name: 'Overlord Flame', colors: ['#fb923c', '#ef4444'], anim: 'flicker' },
    { id: 'bg_reward_plasma', type: 'bg', badge: 'arcade_legend', icon: '🌌', name: 'Plasma Core', bg: 'bg_plasma' },
    { id: 'border_spectrum', type: 'border', badge: 'arcade_legend', icon: '⭕', name: 'Hyperspectrum', colors: ['#00f2fe', '#f472b6'], anim: 'rainbow' },
    { id: 'chat_fire', type: 'chat', badge: 'hot_streak', icon: '🔥', name: 'On Fire' },
    { id: 'bg_reward_grid', type: 'bg', badge: 'unstoppable', icon: '🌌', name: 'Neon Horizon Grid', bg: 'bg_neon_grid' },
    { id: 'border_orbit', type: 'border', badge: 'unstoppable', icon: '⭕', name: 'Orbit Drive', colors: ['#00f2fe', '#a855f7'], anim: 'spin' },
    { id: 'title_combo', type: 'title', badge: 'chain_reaction', icon: '🏷️', name: 'Combo Commander' },
    { id: 'bg_reward_circuit', type: 'bg', badge: 'explorer', icon: '🌌', name: 'Living Circuit', bg: 'bg_circuit' },
    { id: 'chat_networker', type: 'chat', badge: 'networker', icon: '🤝', name: 'Networker' },
    { id: 'title_builder', type: 'title', badge: 'world_builder', icon: '🏷️', name: 'World Builder' },
    { id: 'bg_reward_rain', type: 'bg', badge: 'curious_mind', icon: '🌌', name: 'Data Rain', bg: 'bg_data_rain' },

    { id: 'chat_testpilot', type: 'chat', badge: 'test_pilot', icon: '📝', name: 'Test Pilot' },
    { id: 'title_perfect', type: 'title', badge: 'perfect_unit', icon: '🏷️', name: 'Flawless Scholar' },
    { id: 'accent_champion', type: 'accent', badge: 'unit_champion', icon: '🎨', name: 'Champion Gold', rgb: '250,204,21' },

    // The ultimate rewards: managed from their own panel on the Profile page
    { id: 'title_ai_grandmaster', type: 'title', badge: 'graduate', icon: '👑', name: 'AI Grandmaster', ultimate: true },
    { id: 'bg_reward_grandmaster', type: 'bg', badge: 'graduate', icon: '🌈', name: 'Grandmaster Holo-Matrix', bg: 'bg_grandmaster', ultimate: true },
    { id: 'cursor_grandmaster', type: 'cursor', badge: 'graduate', icon: '✨', name: 'Quantum Particle Cursor', ultimate: true }
];
const REWARD_MAP = new Map(REWARDS.map(r => [r.id, r]));
const rewardUnlocked = r => devMode() || badgeProgress(BADGE_MAP.get(r.badge)).done;
const rewardsFor = badgeId => REWARDS.filter(r => r.badge === badgeId);
const rewardTypeName = r => REWARD_TYPES.find(t => t.key === r.type).single;

// Returns the rewards unlocked since the last check, so each one is announced only once
function syncRewards() {
    const unlocked = REWARDS.filter(rewardUnlocked);
    const seen = store.get('seenRewards', null);
    const fresh = seen === null ? [] : unlocked.filter(r => !seen.includes(r.id));
    if (seen === null || fresh.length) store.set('seenRewards', [...new Set([...(seen || []), ...unlocked.map(r => r.id)])]);
    return fresh;
}

// Call after anything that can earn a badge: announces new rewards and updates the profile
function checkRewards() {
    const fresh = syncRewards();
    if (fresh.length) {
        toast(`🎁 ${plural(fresh.length, 'new profile reward', 'new profile rewards')} unlocked: ${fresh.map(r => r.name).join(', ')}`, 'success');
        FX.play('power');
    }
    if (!Portal.syncProfile() && fresh.length) Portal.refresh();
    return fresh;
}

// Avatar border helpers (values come only from the REWARDS table above)
const frameClass = r => r ? ` has-frame${r.anim ? ' frame-' + r.anim : ''}` : '';
const frameStyle = r => r ? `--f1:${r.colors[0]};--f2:${r.colors[1]};` : '';

const meterHTML = (p, label) => `<div class="meter" role="progressbar" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="${p.target}" aria-valuenow="${p.current}"><div style="width:${p.pct}%"></div></div>`;

// ---- Dashboard
function renderDashboardRewards() {
    const earned = BADGES.filter(b => badgeProgress(b).done).length;
    $('#badge-count').textContent = `${earned} of ${BADGES.length} badges earned`;
    const card = b => {
        const p = badgeProgress(b);
        const perks = rewardsFor(b.id).map(r => `<li title="${esc(rewardTypeName(r))}">${p.done ? r.icon : '🔒'} ${esc(r.name)} <small>${esc(rewardTypeName(r))}</small></li>`).join('');
        return `
            <div class="achv${p.done ? ' unlocked' : ''}">
                <span class="achv-state">${p.done ? '✓ Earned' : '🔒 Locked'}</span>
                <span class="ico" aria-hidden="true">${b.icon}</span><h4>${esc(b.name)}</h4><p>${esc(b.desc)}</p>
                ${meterHTML(p, `${b.name} progress`)}
                <span class="meter-label">${p.current} / ${p.target} ${esc(b.unit)}</span>
                <ul class="perk-list" aria-label="Rewards from this badge">${perks}</ul>
            </div>`;
    };
    $('#badge-grid').innerHTML = BADGE_CATEGORIES.map(c => {
        const list = BADGES.filter(b => (b.cat || 'learn') === c.key);
        return `<h4 class="badge-category">${c.label} <small>${list.filter(b => badgeProgress(b).done).length} / ${list.length}</small></h4>
            <div class="badge-grid">${list.map(card).join('')}</div>`;
    }).join('');

    const count = REWARDS.filter(rewardUnlocked).length;
    const overall = { current: count, target: REWARDS.length, pct: Math.round((count / REWARDS.length) * 100) };
    $('#reward-summary-count').textContent = `${count} of ${REWARDS.length} profile rewards unlocked`;
    $('#reward-summary-meter').innerHTML = meterHTML(overall, 'Profile rewards unlocked');

    // The three locked rewards the student is closest to earning
    const next = REWARDS.filter(r => !rewardUnlocked(r))
        .map(r => ({ r, b: BADGE_MAP.get(r.badge), p: badgeProgress(BADGE_MAP.get(r.badge)) }))
        .sort((a, z) => z.p.pct - a.p.pct || (a.p.target - a.p.current) - (z.p.target - z.p.current))
        .slice(0, 3);
    $('#next-rewards').innerHTML = next.length
        ? next.map(({ r, b, p }) => `
            <div class="next-reward">
                <span class="next-type">🔒 ${esc(rewardTypeName(r))}</span>
                <h4>${esc(r.name)}</h4>
                <p>${esc(b.desc)} to earn <strong>${esc(b.name)}</strong></p>
                ${meterHTML(p, `${r.name} progress`)}
                <span class="meter-label">${p.current} / ${p.target} ${esc(b.unit)}</span>
            </div>`).join('')
        : '<p class="empty-note">🏆 Every profile reward is unlocked. Legendary work!</p>';
    $('#dash-view-rewards').textContent = Portal.getActiveUser() ? 'Open My Inventory' : 'Create a Profile to Equip Rewards';
}

function renderCertification() {
    const status = $('#cert-status');
    if (!status) return;
    const n = unitsPassedCount(), cert = activeCertificate();
    status.textContent = cert ? `🏆 Course completed with ${cert.score}% on the Final Exam.` : allUnitsPassed() ? 'All Unit Tests passed. The Final Exam is unlocked!' : `${n} of 6 Module Unit Tests passed. Pass all six to unlock the Final Exam.`;
    $('#cert-meter').innerHTML = meterHTML({ current: n, target: 6, pct: Math.round((n / 6) * 100) }, 'Unit tests passed');
    $('#cert-units').innerHTML = MODULES.map(m => `<a class="unit-chip${unitPassed(m.id) ? ' done' : ''}" href="#module-${m.id}-test">${unitPassed(m.id) ? '✓' : '📝'} Module ${m.id}${unitRecord(m.id).attempts ? ` · ${unitRecord(m.id).best}%` : ''}</a>`).join('');
    $('#cert-actions').innerHTML = (cert ? '<button type="button" class="btn-cyan-primary" data-view-cert>🎓 View Certificate</button>' : '')
        + `<a class="btn-cyan-secondary" href="#final-exam">${cert ? 'Final Exam Page' : allUnitsPassed() ? 'Take the Final Exam' : 'See Final Exam Requirements'}</a>`;
}

function updateDashboardStats() {
    const doneLessons = lessonsDoneCount();
    const doneModules = modulesDoneCount();
    const pct = Math.round((doneLessons / LESSON_ORDER.length) * 100);
    const user = Portal.getActiveUser();
    const xp = user ? (user.xp || 0) : store.get('localXP', 0);

    $('#dashboard-progress-percent').textContent = pct + '%';
    $('#dashboard-progress-fill').style.width = pct + '%';
    $('#dashboard-progress-bar').setAttribute('aria-valuenow', pct);
    $('#dashboard-xp-text').textContent = xp + ' XP';
    $('#dashboard-modules-count').textContent = `${doneModules} / 6`;
    $('#dashboard-lessons-count').textContent = `${doneLessons} of ${LESSON_ORDER.length} lessons complete`;
    renderDashboardRewards();
    renderCertification();
    Portal.renderDashboardBoard();
    const cont = $('#dash-continue');
    if (cont) {
        const step = nextStepHash();
        cont.textContent = step === '#final-exam' ? 'Take the Final Exam' : step.endsWith('test') ? 'Take Next Unit Test' : activeCertificate() ? 'Review a Lesson' : 'Continue Learning';
    }
}

// ---- Router (hash based, so the back button and deep links work)
const VIEWS = { home: 'home-page-view', modules: 'modules-grid-view', lesson: 'modules-page-view', dashboard: 'dashboard-page-view', chatbot: 'chatbot-page-view', profile: 'profile-page', final: 'final-exam-view', arcade: 'arcade-view' };
const ALIASES = { 'final-exam': 'final', 'modules-grid': 'modules', 'profile-page': 'profile', 'profile-page-view': 'profile', 'references-page-view': 'references' };

function showView(id) {
    Object.entries(VIEWS).forEach(([key, domId]) => { const el = document.getElementById(domId); if (el) el.classList.toggle('is-active', key === id); });
    const navId = id === 'lesson' ? 'modules' : id;
    $$('.nav-links [data-page]').forEach(a => a.classList.toggle('active', a.dataset.page === navId));
    $('#nav-links').classList.remove('open');
    $('#nav-toggle').setAttribute('aria-expanded', 'false');
    if (id === 'modules') renderModulesGrid();
    if (id === 'dashboard') updateDashboardStats();
    if (id === 'final') renderFinalExam();
    if (id === 'arcade') renderArcade();
    window.scrollTo({ top: 0, behavior: 'auto' });
    updateReadProgress();
    if (PortalTheme.visit(id === 'lesson' ? 'modules' : id)) checkRewards();
    animateView(document.getElementById(VIEWS[id]));
}

// ---- Page-entry animations: staggered cards, filling progress bars, counting numbers
const STAGGER_TARGETS = '.stat-card, .panel, .achv, .next-reward, .profile-card-container, .reward-card, .shop-item, .directory-row, .chat-shell, .paradigm-row-card, .footer-section, .lesson-tabs button, .exam-panel, .final-banner';

function countUp(el) {
    const match = el.textContent.match(/^(\d+)(.*)$/);
    if (!match || +match[1] === 0) return;
    const target = +match[1], suffix = match[2], start = performance.now();
    let written = el.textContent;
    const tick = now => {
        if (el.textContent !== written) return;          // something else updated it; leave it alone
        const t = clamp((now - start) / 800, 0, 1);
        written = Math.round(target * (1 - Math.pow(1 - t, 3))) + suffix;
        el.textContent = written;
        if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}

function animateView(view) {
    if (!view || reducedMotion()) return;
    const items = $$(STAGGER_TARGETS, view);
    items.forEach(el => el.classList.remove('stagger-in'));
    void view.offsetWidth;                               // restart the animation on repeat visits
    items.forEach((el, i) => {
        el.style.setProperty('--stagger', Math.min(i, 14));
        el.classList.add('stagger-in');
        el.addEventListener('animationend', function done(e) {
            if (e.target !== el || e.animationName !== 'staggerIn') return;
            el.classList.remove('stagger-in');           // hand the element back to hover and glow styles
            el.removeEventListener('animationend', done);
        });
    });
    const bars = $$('.meter > div, #dashboard-progress-fill', view).map(el => [el, el.style.width]);
    bars.forEach(([el]) => { el.style.transition = 'none'; el.style.width = '0'; });
    void view.offsetWidth;
    bars.forEach(([el, width]) => { el.style.transition = ''; el.style.width = width; });
    $$('.stat-card p, .p-stat-num', view).forEach(countUp);
}

function route() {
    const hash = (location.hash || '#home').slice(1);
    const m = hash.match(/^module-(\d)(?:-(\d|test))?$/);
    if (m && m[2] === 'test') { openUnitTest(parseInt(m[1], 10)); return; }
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
        toast(lockedMessage(moduleId), 'warn');
        return;
    }
    location.hash = `#module-${moduleId}-1`;
};

function openLesson(modId, subId) {
    if (!LESSONS[modId] || !LESSONS[modId].subs[subId]) { showPage('modules'); return; }
    if (modId > maxUnlocked()) { toast(lockedMessage(modId), 'warn'); showPage('modules'); return; }
    const sub = LESSONS[modId].subs[subId];
    const idx = LESSON_ORDER.findIndex(([m, s]) => m === modId && s === subId);
    const prev = LESSON_ORDER[idx - 1], next = LESSON_ORDER[idx + 1];
    const pager = `
        <div class="lesson-pager">
            ${prev ? `<button type="button" class="btn-ghost" data-lesson="${prev[0]}.${prev[1]}">← Lesson ${prev[0]}.${prev[1]}</button>` : '<span></span>'}
            ${subId === 3 ? `<button type="button" class="btn-ghost" data-lesson="${modId}.test">Module ${modId} Unit Test →</button>`
                : next ? `<button type="button" class="btn-ghost" data-lesson="${next[0]}.${next[1]}">Lesson ${next[0]}.${next[1]} →</button>` : ''}
        </div>`;

    $('#active-module-content').innerHTML = `
        ${moduleHeaderHTML(modId, subId)}
        <div class="lesson-kicker">${esc(sub.title)}</div>
        <div class="lesson-body">${sub.html()}</div>
        <div class="arcade-launch">
            <span class="game-tag">${GAMES[gameFor(modId, subId)].icon} ${GAMES[gameFor(modId, subId)].name}</span>
            <h3>Ready to Play Arcade Challenge ${modId}.${subId}?</h3>
            <p>Review the rules, build answer streaks for score multipliers and power-ups, and score 4 out of 5 to complete this lesson!</p>
            <button type="button" class="btn-launch" data-launch="${modId}.${subId}">🎮 Launch Minigame Quiz ${modId}.${subId}</button>
        </div>
        ${pager}`;

    showView('lesson');
    afterLessonRender(`${modId}.${subId}`);
}

function moduleTabsHTML(modId, active) {
    const lessonTabs = [1, 2, 3].map(k => `
        <button type="button" id="btn-lesson-${k}" class="${k === active ? 'active' : ''}"${k === active ? ' aria-current="page"' : ''} data-lesson="${modId}.${k}">${lessonDone(modId, k) ? '✓ ' : ''}Lesson ${modId}.${k}</button>`).join('');
    const icon = unitPassed(modId) ? '✓' : unitTestOpen(modId) ? '📝' : '🔒';
    return lessonTabs + `
        <button type="button" id="btn-unit-test" class="unit-tab${active === 'test' ? ' active' : ''}"${active === 'test' ? ' aria-current="page"' : ''} data-lesson="${modId}.test">${icon} Unit Test</button>`;
}
const moduleHeaderHTML = (modId, active) => `
    <div class="lesson-top"><span class="kicker">Module ${modId} Overview</span><h1>${esc(LESSONS[modId].title)}</h1></div>
    <nav class="lesson-tabs" aria-label="Module ${modId} sections">${moduleTabsHTML(modId, active)}</nav>`;
function refreshModuleTabs(modId) {
    const bar = $('#active-module-content .lesson-tabs');
    if (bar) bar.innerHTML = moduleTabsHTML(modId, 'test');
}

function openUnitTest(modId) {
    if (!LESSONS[modId]) { showPage('modules'); return; }
    if (modId > maxUnlocked()) { toast(lockedMessage(modId), 'warn'); showPage('modules'); return; }
    $('#active-module-content').innerHTML = `
        ${moduleHeaderHTML(modId, 'test')}
        <div id="unit-test-root">${unitIntroHTML(modId)}</div>
        <div class="lesson-pager"><button type="button" class="btn-ghost" data-lesson="${modId}.3">← Lesson ${modId}.3</button></div>`;
    showView('lesson');
}

function afterLessonRender(key) {
    LessonLayouts.apply(key, $('#active-module-content'));
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
    modal.innerHTML = '<button type="button" class="quiz-mute"></button><button type="button" class="quiz-exit">✕ Exit</button><div class="quiz-stage"></div>';
    document.body.appendChild(modal);
    document.body.classList.add('modal-open');
    const mute = $('.quiz-mute', modal);
    const label = () => {
        mute.textContent = FX.isMuted() ? '🔇 Sound Off' : '🔊 Sound On';
        mute.setAttribute('aria-pressed', !FX.isMuted());
    };
    label();
    mute.onclick = () => { FX.toggleMute(); label(); mute.blur(); };
    $('.quiz-exit', modal).onclick = () => {
        if (confirm('Exit this challenge? Your progress in it will be lost.')) { arcadeRun = null; closeModal(modal); }
    };
    return { modal, stage: $('.quiz-stage', modal) };
}
function closeModal(modal) {
    modal.remove();
    document.body.classList.remove('modal-open');
    checkRewards();      // streak badges still count if the player exits early
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

// Set while a game was launched from the Arcade page (replays never change lesson progress or XP)
let arcadeRun = null;

// ---- ARCADE: unlimited replays of finished games once the Final Exam is passed
const arcadeOpen = () => !!activeCertificate() || devMode();
const lessonsFor = key => Object.keys(GAME_ROTATION).filter(l => GAME_ROTATION[l] === key);
const gameBlurb = key => (GAMES[key].rules.match(/<strong>Objective:<\/strong>\s*([^<]*)/) || [])[1] || '';

function renderArcade() {
    const root = $('#arcade-root');
    if (!root) return;
    const played = store.get('gamesPlayed', {}), me = Portal.getActiveUser();
    const best = key => !me ? '—' : key === 'boss' ? (Portal.bossTime(me) ? Portal.fmtTime(Portal.bossTime(me)) : 'Not defeated') : `${Number(me.scores[key]) || 0} pts`;
    const open = arcadeOpen();
    const cards = GAME_KEYS.map(k => {
        const ready = open && (played[k] || devMode());
        const where = lessonsFor(k).map(l => `Lesson ${l}`).join(' or ');
        return `
            <div class="arcade-card${ready ? '' : ' locked'}">
                <span class="arcade-ico" aria-hidden="true">${GAMES[k].icon}</span>
                <h3>${esc(GAMES[k].name)}</h3>
                <p>${esc(gameBlurb(k))}</p>
                <div class="arcade-best"><span>${k === 'boss' ? 'Fastest defeat' : 'High score'}</span><strong>${esc(best(k))}</strong></div>
                ${ready ? `<button type="button" class="btn-cyan-primary" data-arcade-play="${k}">▶ Play</button>`
                    : `<p class="arcade-lock">🔒 ${open ? `Finish it once in ${where}` : 'Pass the Final Exam'}</p>`}
            </div>`;
    }).join('');
    root.innerHTML = (open ? '' : `
        <div class="final-banner">
            <div><h3>🔒 The Arcade opens after the Final Exam</h3><p>Pass all six Unit Tests and the Final Exam (${unitsPassedCount()} of 6 Unit Tests passed). Then replay any game you have finished, as often as you like.</p></div>
            <a class="btn-cyan-secondary" href="#final-exam">See Final Exam</a>
        </div>`) + `
        <p class="arcade-note">🕹️ Arcade runs use questions from every module. High scores and boss times count on the leaderboards; XP still comes from lessons.</p>
        <div class="arcade-grid">${cards}</div>`;
}

function launchArcadeGame(key) {
    if (!arcadeOpen() || !(store.get('gamesPlayed', {})[key] || devMode())) { toast('That game is still locked.', 'warn'); return; }
    // Each run draws its questions from a random lesson, so every module comes up
    const [m, s] = LESSON_ORDER[Math.floor(Math.random() * LESSON_ORDER.length)];
    arcadeRun = { game: key };
    const def = GAMES[key];
    showInstructionsModal(def.name, `${def.rules}<p><strong>Arcade run:</strong> questions come from Lesson ${m}.${s}. Streaks still multiply your score up to x3.</p>`, () => def.run(m, s));
}

// Results screen for an Arcade replay
function finishArcadeRun({ modal, stage, gameKey, title, quizScore, total, arcadeLabel, arcadeScore, bestStreak, retry, theme }) {
    const saved = Portal.award(gameKey, arcadeScore, 0);
    checkRewards();
    const me = Portal.getActiveUser();
    const rows = Portal.topFor(gameKey, 5)
        .map(({ u: c, text }, i) => `<div class="lb-mini-row${me && c.id === me.id ? ' me' : ''}"><span>#${i + 1} <strong>${esc(c.username)}</strong>${me && c.id === me.id ? ' (You)' : ''}</span><b>${esc(text)}</b></div>`).join('');
    stage.innerHTML = `
        <div class="quiz-game-card ${theme}" style="max-width:480px;">
            <h1 class="summary-title">${title} · Arcade Run</h1>
            <div class="summary-banner pass">🕹️ Arcade run complete! Your best score is saved to the leaderboard.</div>
            <div class="summary-rows">
                <div><span>Quiz Score</span><strong>${quizScore} / ${total}</strong></div>
                <div><span>${esc(arcadeLabel)}</span><strong>${arcadeScore} pts</strong></div>
                <div><span>Best Answer Streak</span><strong>🔥 ${bestStreak} in a row</strong></div>
            </div>
            ${devMode() ? '<p class="canvas-instructions" style="margin:0 0 6px;">🛠 Developer Mode: this run was not saved.</p>' : saved ? '' : '<p class="canvas-instructions" style="margin:0 0 6px;">Create a profile to join the leaderboard.</p>'}
            <div class="lb-mini"><h4>🏆 Top Players</h4>${rows || '<p class="empty-note">No scores yet.</p>'}</div>
            <div class="btn-row">
                <button type="button" class="btn-continue-shop secondary" id="g-retry">↻ Play Again</button>
                <button type="button" class="btn-continue-shop" id="g-done">Back to Arcade</button>
            </div>
        </div>`;
    $('#g-retry', stage).onclick = () => { closeModal(modal); retry(); };
    $('#g-done', stage).onclick = () => { arcadeRun = null; closeModal(modal); showPage('arcade'); renderArcade(); };
    FX.play('win');
}

window.startArcadeQuiz = function (modId, subId) {
    arcadeRun = null;
    const def = GAMES[gameFor(modId, subId)];
    showInstructionsModal(def.name, `${def.rules}
        <p><strong>Streaks:</strong> Back-to-back right answers multiply your score up to x3.
        <strong>Pass mark:</strong> 4 out of 5 right completes the lesson.</p>`, () => def.run(modId, subId));
};

// ---- Shared quiz question screen
function askQuestion({ stage, q, index, total, badge, theme = '', combo, onResult }) {
    stage.innerHTML = `
        <div class="quiz-game-card ${theme}">
            <div class="quiz-header-row"><span class="quiz-counter">Question ${index + 1} of ${total}</span><span data-combo>${comboPill(combo)}</span><span class="quiz-credits">${badge}</span></div>
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
        const lost = combo ? combo.streak : 0;
        if (combo) {
            combo.answer(ok);
            $('[data-combo]', stage).innerHTML = comboPill(combo);
        }
        const card = $('.quiz-game-card', stage);
        if (ok) {
            FX.play('correct');
            FX.burstAt(btns[i], { color: '#34d399', count: 28 + (combo ? combo.streak * 10 : 0) });
            card.classList.add('glow-good');
            if (combo && combo.streak >= 2) {
                hype(`${combo.streak}x STREAK! Score x${combo.mult}`);
                FX.comboSound(combo.streak);
                if (combo.streak >= 3) { FX.shake(card, 4 + combo.streak); FX.flash('rgba(251,191,36,.25)'); }
            }
        } else {
            FX.play('wrong');
            FX.shake(card, 12);
            card.classList.add('glow-bad');
            if (lost >= 2) fb.textContent += ' Streak lost!';
        }
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
    const { modal, stage, modId, subId, gameKey, title, quizScore, total, arcadeLabel, arcadeScore, bestStreak = 0, retry, theme = '', xpMult = 1 } = o;
    const arcade = !!arcadeRun;
    const passed = quizScore >= 4;
    // Arcade replays keep high scores but never change lesson progress or give XP
    const result = passed && !arcade ? completeLesson(modId, subId) : { first: false, unlocked: null };
    const xp = arcade ? 0 : (quizScore * 20 + (result.first ? 50 : 0)) * xpMult;     // xpMult: the Double XP shop upgrade
    // Record all progress first, so the profile re-render in award() sees the new badges
    markPlayed(gameKey);
    if (arcade) return finishArcadeRun({ modal, stage, gameKey, title, quizScore, total, arcadeLabel, arcadeScore, bestStreak, retry, theme });
    if (quizScore === total) {
        const perfect = store.get('perfectQuizzes', {});
        perfect[`${modId}.${subId}`] = true;
        store.set('perfectQuizzes', perfect);
    }
    const saved = Portal.award(gameKey, arcadeScore, xp);
    const newRewards = checkRewards();

    const me = Portal.getActiveUser();
    // Same ranking as the main leaderboard (the boss board ranks by fastest defeat time)
    const rows = Portal.topFor(gameKey, 5)
        .map(({ u: c, text }, i) => `<div class="lb-mini-row${me && c.id === me.id ? ' me' : ''}"><span>#${i + 1} <strong>${esc(c.username)}</strong>${me && c.id === me.id ? ' (You)' : ''}</span><b>${esc(text)}</b></div>`).join('');

    const testReady = passed && moduleLessonsComplete(modId) && !unitPassed(modId);
    const nextIdx = LESSON_ORDER.findIndex(([m, s]) => m === modId && s === subId) + 1;
    const next = LESSON_ORDER[nextIdx];
    stage.innerHTML = `
        <div class="quiz-game-card ${theme}" style="max-width:480px;">
            <h1 class="summary-title">${title} Complete!</h1>
            <div class="summary-banner ${passed ? 'pass' : 'fail'}">${passed ? `✅ Lesson ${modId}.${subId} complete!` : '⚠️ Score 4 out of 5 or better to complete this lesson.'}</div>
            ${testReady ? `<div class="summary-banner pass">📝 All three lessons done. Pass the Module ${modId} Unit Test to ${modId < 6 ? 'unlock the next module' : 'qualify for the Final Exam'}!</div>` : ''}
            ${newRewards.length ? `<div class="summary-banner reward">🎁 New rewards: ${newRewards.map(r => `${esc(r.name)} (${esc(rewardTypeName(r))})`).join(', ')}</div>` : ''}
            <div class="summary-rows">
                <div><span>Quiz Score</span><strong>${quizScore} / ${total}</strong></div>
                <div><span>${esc(arcadeLabel)}</span><strong>${arcadeScore} pts</strong></div>
                <div><span>Best Answer Streak</span><strong>🔥 ${bestStreak} in a row</strong></div>
                <div><span>XP Earned</span><strong style="color:var(--text-accent);">+${xp} XP 🌟</strong></div>
            </div>
            ${devMode() ? '<p class="canvas-instructions" style="margin:0 0 6px;">🛠 Developer Mode: this run was not saved to your profile or the leaderboard.</p>' : saved ? '' : '<p class="canvas-instructions" style="margin:0 0 6px;">Create a profile to save XP and join the leaderboard.</p>'}
            <div class="lb-mini"><h4>🏆 Top Players</h4>${rows || '<p class="empty-note">No scores yet. You set the benchmark!</p>'}</div>
            <div class="btn-row">
                ${passed ? '' : '<button type="button" class="btn-continue-shop secondary" id="g-retry">Try Again</button>'}
                <button type="button" class="btn-continue-shop${testReady ? ' secondary' : ''}" id="g-done">${passed && next ? 'Back to Lessons' : 'Continue to Modules'}</button>
                ${testReady ? '<button type="button" class="btn-continue-shop" id="g-test">Take Unit Test →</button>' : ''}
            </div>
        </div>`;
    const testBtn = $('#g-test', stage);
    if (testBtn) testBtn.onclick = () => { closeModal(modal); location.hash = `#module-${modId}-test`; };
    const retryBtn = $('#g-retry', stage);
    if (retryBtn) retryBtn.onclick = () => { closeModal(modal); retry(); };
    $('#g-done', stage).onclick = () => {
        closeModal(modal);
        if (passed) openLesson(modId, subId); else showPage('modules');
        if (!document.getElementById('modules-page-view').classList.contains('is-active')) return;
        $('#active-module-content').scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    updateDashboardStats();
    if (passed) {
        FX.play('win');
        [0.25, 0.5, 0.75].forEach((x, i) => setTimeout(() => FX.burst(window.innerWidth * x, window.innerHeight * 0.3, { color: ['#00f2fe', '#a855f7', '#fbbf24'][i], count: 60, power: 9 }), i * 180));
    } else FX.play('lose');
}

// ----------------------------------------------------------------------------
// MINIGAME 1: ROCKET SPACE SHOOTER
// Mini Scrappy flies the rocket. Rocks come in four kinds with different durability.
// Flow: question -> Rocket Armory (spend credits) -> 30-second wave -> next question.
// ----------------------------------------------------------------------------
const ROCK_TYPES = {
    rock: { hp: 1, pts: 20, size: [30, 42], speed: 1, fill: ['#94a3b8', '#475569'], edge: '#64748b' },
    boulder: { hp: 3, pts: 60, size: [44, 56], speed: 0.85, fill: ['#d97706', '#78350f'], edge: '#92400e' },
    iron: { hp: 6, pts: 120, size: [50, 62], speed: 0.65, fill: ['#e2e8f0', '#334155'], edge: '#94a3b8' },
    crystal: { hp: 2, pts: 40, size: [34, 40], speed: 1.1, fill: ['#c4b5fd', '#6d28d9'], edge: '#a78bfa' }
};
const ROCKET_UPGRADES = [
    { k: 'power', icon: '🔥', name: 'Laser Power', desc: '+1 damage per level (cracks tough rocks faster)', costs: [90, 200] },
    { k: 'rapid', icon: '⚡', name: 'Rapid Fire', desc: 'Shoot faster each level', costs: [80, 180] },
    { k: 'spread', icon: '🔫', name: 'Spread Cannons', desc: 'Lv 1: double laser · Lv 2: triple spread', costs: [75, 160] },
    { k: 'speed', icon: '🚀', name: 'Thrusters', desc: 'Fly faster each level', costs: [50, 120] },
    { k: 'missile', icon: '🎯', name: 'Homing Missiles', desc: 'Auto-launches seeking missiles (faster at Lv 2)', costs: [160, 260] },
    { k: 'deflector', icon: '🛡️', name: 'Deflector Shield', desc: 'Blocks 1 crash per wave, per level', costs: [90, 180] },
    { k: 'plating', icon: '🔩', name: 'Hull Plating', desc: 'Crashes do 40% less damage', costs: [80] },
    { k: 'magnet', icon: '🧲', name: 'Gem Magnet', desc: 'Pulls crystal gems (+15 credits each) to your ship', costs: [70] },
    { k: 'xp', icon: '🎓', name: 'Double XP', desc: 'Doubles the XP you earn from this lesson', costs: [200] },
    { k: 'mult', icon: '🌟', name: '2x Score', desc: 'Doubles every point you score', costs: [125] }
];

// The rocket with a glass cockpit and mini Scrappy at the controls
function drawScrappyRocket(ctx, cx, cy, now, { mood = 'happy', tilt = 0, shield = 0, thrust = 1 }) {
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(tilt);
    // Engine flames
    const flame = (12 + Math.sin(now * 0.04) * 5) * thrust;
    ctx.save(); ctx.shadowColor = '#fb923c'; ctx.shadowBlur = 14;
    ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.moveTo(-7, 20); ctx.lineTo(0, 22 + flame); ctx.lineTo(7, 20); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fde68a'; ctx.beginPath(); ctx.moveTo(-3.5, 20); ctx.lineTo(0, 20 + flame * 0.6); ctx.lineTo(3.5, 20); ctx.closePath(); ctx.fill();
    ctx.restore();
    // Fins
    ctx.fillStyle = '#2563eb'; ctx.strokeStyle = '#0b1020'; ctx.lineWidth = 1.5;
    [-1, 1].forEach(s => { ctx.beginPath(); ctx.moveTo(s * 11, 4); ctx.lineTo(s * 24, 20); ctx.lineTo(s * 22, 24); ctx.lineTo(s * 8, 18); ctx.closePath(); ctx.fill(); ctx.stroke(); });
    // Fuselage
    const body = ctx.createLinearGradient(-14, 0, 14, 0);
    body.addColorStop(0, '#cbd5e1'); body.addColorStop(0.45, '#ffffff'); body.addColorStop(1, '#94a3b8');
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.moveTo(0, -30); ctx.quadraticCurveTo(16, -14, 13, 12); ctx.lineTo(9, 20); ctx.lineTo(-9, 20); ctx.lineTo(-13, 12); ctx.quadraticCurveTo(-16, -14, 0, -30); ctx.closePath(); ctx.fill(); ctx.stroke();
    // Nose cone and stripe
    ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.moveTo(0, -30); ctx.quadraticCurveTo(7, -24, 8.5, -20); ctx.lineTo(-8.5, -20); ctx.quadraticCurveTo(-7, -24, 0, -30); ctx.fill();
    ctx.fillStyle = '#2563eb'; ctx.fillRect(-12, 9, 24, 3);
    ctx.fillStyle = '#334155'; ctx.fillRect(-7, 18, 14, 4);
    // Glass cockpit with mini Scrappy inside
    ctx.save();
    ctx.beginPath(); ctx.arc(0, -5, 10.5, 0, Math.PI * 2); ctx.clip();
    const glass = ctx.createRadialGradient(-3, -9, 1, 0, -5, 11);
    glass.addColorStop(0, '#bae6fd'); glass.addColorStop(1, '#0c4a6e');
    ctx.fillStyle = glass; ctx.fillRect(-12, -17, 24, 24);
    ctx.translate(0, -3); ctx.scale(0.5, 0.5);
    drawScrappyHead(ctx, 0, 0, mood);
    ctx.restore();
    ctx.strokeStyle = '#0b1020'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, -5, 10.5, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.beginPath(); ctx.ellipse(-4, -10, 3.5, 2, -0.6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // Deflector bubble
    if (shield > 0) {
        ctx.save(); ctx.globalAlpha = 0.45 + 0.15 * Math.sin(now / 200);
        ctx.strokeStyle = '#60a5fa'; ctx.shadowColor = '#60a5fa'; ctx.shadowBlur = 14; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(cx, cy - 3, 32, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
}

// A rock: a lumpy shape per type, with cracks that grow as it takes damage and a health bar
function drawRock(ctx, a, now) {
    const T = ROCK_TYPES[a.type], r = a.size / 2;
    ctx.save();
    ctx.translate(a.x + r, a.y + r);
    if (a.type === 'crystal') { ctx.shadowColor = '#a78bfa'; ctx.shadowBlur = 16; }
    ctx.rotate(a.rot);
    const g = ctx.createRadialGradient(-r * 0.35, -r * 0.35, 2, 0, 0, r * 1.1);
    g.addColorStop(0, T.fill[0]); g.addColorStop(1, T.fill[1]);
    ctx.fillStyle = g; ctx.strokeStyle = T.edge; ctx.lineWidth = 2;
    ctx.beginPath();
    a.shape.forEach((k, p) => { const ang = (p / a.shape.length) * Math.PI * 2; p === 0 ? ctx.moveTo(Math.cos(ang) * r * k, Math.sin(ang) * r * k) : ctx.lineTo(Math.cos(ang) * r * k, Math.sin(ang) * r * k); });
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0;
    if (a.type === 'crystal') {
        ctx.strokeStyle = 'rgba(237,233,254,.7)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(-r * 0.5, -r * 0.2); ctx.lineTo(0, -r * 0.6); ctx.lineTo(r * 0.45, -r * 0.1); ctx.lineTo(0, r * 0.5); ctx.closePath(); ctx.stroke();
    } else if (a.type === 'iron') {
        // Metal bands and rivets
        ctx.strokeStyle = 'rgba(15,23,42,.55)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(-r * 0.85, -r * 0.2); ctx.lineTo(r * 0.85, -r * 0.2); ctx.moveTo(-r * 0.75, r * 0.35); ctx.lineTo(r * 0.75, r * 0.35); ctx.stroke();
        ctx.fillStyle = '#f1f5f9'; [-0.5, 0, 0.5].forEach(k => { ctx.beginPath(); ctx.arc(k * r, -r * 0.2, 2, 0, Math.PI * 2); ctx.arc(k * r, r * 0.35, 2, 0, Math.PI * 2); ctx.fill(); });
    } else {
        // Craters
        ctx.fillStyle = 'rgba(15,23,42,.3)';
        [[-0.3, -0.2, 0.22], [0.3, 0.25, 0.16], [0.15, -0.4, 0.1]].forEach(([dx, dy, k]) => { ctx.beginPath(); ctx.arc(dx * r, dy * r, k * r, 0, Math.PI * 2); ctx.fill(); });
    }
    // Cracks: one more line for each point of damage
    const dmg = a.max - a.hp;
    if (dmg > 0) {
        ctx.strokeStyle = a.type === 'crystal' ? '#faf5ff' : 'rgba(2,6,23,.75)'; ctx.lineWidth = 1.8;
        for (let i = 0; i < Math.min(dmg, 5); i++) {
            const ang = a.crack[i];
            ctx.beginPath(); ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(ang) * r * 0.45, Math.sin(ang) * r * 0.45 + 3);
            ctx.lineTo(Math.cos(ang + 0.3) * r * 0.85, Math.sin(ang + 0.3) * r * 0.85);
            ctx.stroke();
        }
    }
    ctx.restore();
    if (now - a.hitAt < 90) { ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(a.x + r, a.y + r, r * 0.85, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    // Health bar for tough rocks once they are damaged
    if (a.max > 1 && a.hp < a.max) {
        const w = a.size * 0.8;
        ctx.fillStyle = 'rgba(2,6,23,.7)'; ctx.fillRect(a.x + r - w / 2, a.y - 8, w, 4);
        ctx.fillStyle = a.hp / a.max > 0.5 ? '#4ade80' : a.hp / a.max > 0.25 ? '#fbbf24' : '#f87171';
        ctx.fillRect(a.x + r - w / 2, a.y - 8, w * a.hp / a.max, 4);
    }
}

function runRocketGame(modId, subId) {
    const { modal, stage } = makeModal();
    const questions = prepareQuiz(modId, subId);
    const S = { q: 0, credits: 0, quiz: 0, score: 0, novas: 0, xpMult: 1, report: null, combo: createCombo(), lv: Object.fromEntries(ROCKET_UPGRADES.map(u => [u.k, 0])) };
    FX.preload(['armorHit', 'crash', 'shopBuy', 'orb', 'emp', 'shieldBlock']);

    function ask() {
        if (S.q >= questions.length) return finish();
        askQuestion({
            stage, q: questions[S.q], index: S.q, total: questions.length, badge: `Credits: ${S.credits} 💰`, combo: S.combo,
            onResult: ok => {
                const gain = ok ? 100 + (S.combo.streak - 1) * 25 : 0;
                if (ok) S.quiz++;
                S.credits += gain;
                shop(gain);
            }
        });
    }

    function shop(gain) {
        const maxed = u => S.lv[u.k] >= u.costs.length;
        const upBtn = u => {
            const lvl = S.lv[u.k], max = u.costs.length;
            return `<button type="button" class="shop-btn" data-up="${u.k}" ${maxed(u) ? 'disabled' : ''}>
                ${u.icon} ${u.name}${max > 1 ? ` <em>Lv ${lvl}/${max}</em>` : ''} ${maxed(u) ? '✅' : `(${u.costs[lvl]} 💰)`}<small>${u.desc}</small></button>`;
        };
        stage.innerHTML = `
            <div class="quiz-game-card">
                <h2 class="shop-title">🛠️ Rocket Armory</h2>
                ${gain ? `<p class="round-intro">✅ Correct! +${gain} credits${S.combo.streak > 1 ? ` (🔥 ${S.combo.streak} streak bonus)` : ''}</p>` : '<p class="round-intro">❌ No credits this time. Right answers (and crystal gems) earn credits.</p>'}
                ${S.report ? `<p class="canvas-instructions">Last wave: ${S.report}</p>` : ''}
                <p class="shop-credits">Your Credits: <strong class="credit-highlight">${S.credits} 💰</strong></p>
                <div class="armory-grid">${ROCKET_UPGRADES.map(upBtn).join('')}
                    <button type="button" class="shop-btn" data-nova ${S.novas >= 2 ? 'disabled' : ''}>💥 Nova Bomb <em>${S.novas}/2</em> (80 💰)<small>Press B to blast every rock on screen</small></button>
                </div>
                <button type="button" class="btn-continue-shop" id="skip-shop">Launch Wave ${S.q + 1} →</button>
            </div>`;
        const spend = cost => {
            if (S.credits < cost) { toast(`Not enough credits. You need ${cost} 💰.`, 'warn'); return false; }
            S.credits -= cost; FX.sample('shopBuy');
            return true;
        };
        $$('[data-up]', stage).forEach(b => b.onclick = () => {
            const u = ROCKET_UPGRADES.find(x => x.k === b.dataset.up);
            if (maxed(u) || !spend(u.costs[S.lv[u.k]])) return;
            S.lv[u.k]++;
            if (u.k === 'xp') S.xpMult = 2;
            toast(`${u.name} installed!`, 'success');
            shop(gain);
        });
        $('[data-nova]', stage).onclick = () => { if (S.novas < 2 && spend(80)) { S.novas++; shop(gain); } };
        const go = $('#skip-shop', stage);
        go.onclick = wave;
        setTimeout(() => { if (document.body.contains(go)) go.focus({ preventScroll: true }); }, 400);
    }

    function wave() {
        stage.innerHTML = `
            <div class="quiz-game-card canvas-card">
                <div class="quiz-header-row">
                    <span class="quiz-counter">Wave ${S.q + 1} · Rocket Defense</span>
                    ${comboPill(S.combo)}
                    <span id="g-timer" class="quiz-credits danger">Time: 30s</span>
                    <span id="g-shield" class="quiz-credits">🛡️ 100%</span>
                    <span id="g-score" class="quiz-credits">Score: ${S.score}</span>
                </div>
                <canvas id="spaceCanvas" width="640" height="360"></canvas>
                <div class="game-buttons"><button type="button" class="game-btn" id="g-nova">💥 Nova Bomb (B)</button></div>
                <p class="canvas-instructions">Arrows / A-D to move · Up / W / Space to shoot · B: Nova Bomb · On touch, drag to steer (auto-fire)</p>
            </div>`;
        const canvas = $('#spaceCanvas', stage), ctx = canvas.getContext('2d');
        const card = $('.quiz-game-card', stage), juice = canvasJuice(), chain = createChain(2500);
        const L = S.lv;
        const freeTriple = S.combo.streak >= 3;          // streak power-up for this wave
        if (freeTriple) { juice.text(canvas.width / 2, 120, 'STREAK BONUS: TRIPLE BULLETS', '#fbbf24'); FX.play('power'); }
        const player = { x: canvas.width / 2 - 20, y: canvas.height - 56, w: 40, h: 44, speed: [5.5, 7.5, 9.5][L.speed] };
        const dmg = 1 + L.power, fireGap = [320, 220, 150][L.rapid], spread = freeTriple ? 2 : L.spread;
        const crashDmg = L.plating ? 12 : 20, missileGap = [0, 2400, 1500][L.missile];
        let bullets = [], missiles = [], asteroids = [], gems = [], keys = {}, lastShoot = 0, lastMissile = 0, timeLeft = 30, shield = 100, animId, ended = false, pointerDown = false;
        let deflect = L.deflector, last = 0, hurtUntil = 0, tilt = 0, nova = 0, smashed = 0, toughSmashed = 0, gemCount = 0;
        const stars = makeStars(70, canvas.width, canvas.height);

        const onDown = e => {
            if (['ArrowUp', 'ArrowLeft', 'ArrowRight', 'ArrowDown', 'Space'].includes(e.code)) e.preventDefault();
            if (e.code === 'KeyB' && !e.repeat) novaBomb();
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
        $('#g-nova', stage).onclick = e => { novaBomb(); e.currentTarget.blur(); };

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
            S.report = `${smashed} rocks smashed (${toughSmashed} tough) · ${gemCount} gems · shield ${shield}%`;
            S.q++;
            ask();
        }
        const hud = () => {
            const sc = $('#g-score', stage), sh = $('#g-shield', stage), nb = $('#g-nova', stage);
            if (sc) sc.textContent = `Score: ${S.score}`;
            if (sh) sh.textContent = `🛡️ ${shield}%`;
            if (nb) { nb.textContent = `💥 Nova Bomb (B) ×${S.novas}`; nb.disabled = !S.novas; }
        };
        hud();

        // Rock spawns: tougher rocks show up more often in later waves
        function spawnRock() {
            const r = Math.random(), w = S.q;
            const type = r < 0.08 ? 'crystal' : r < 0.08 + Math.min(0.22, w * 0.05) ? 'iron' : r < 0.3 + w * 0.06 ? 'boulder' : 'rock';
            const T = ROCK_TYPES[type], size = rand(T.size[0], T.size[1]);
            asteroids.push({
                type, x: Math.random() * (canvas.width - size), y: -size, size, hp: T.hp, max: T.hp, hitAt: -1e9,
                speed: (1.8 + Math.random() * 2.2) * T.speed, drift: rand(-0.4, 0.4), rot: Math.random() * Math.PI, rotSpeed: (Math.random() - 0.5) * 0.035,
                shape: Array.from({ length: 9 }, () => rand(0.78, 1.05)), crack: Array.from({ length: 5 }, () => Math.random() * Math.PI * 2)
            });
        }
        function hitRock(a, n, now) {
            a.hp -= n; a.hitAt = now;
            const cx = a.x + a.size / 2, cy = a.y + a.size / 2;
            if (a.hp > 0) { juice.burst(cx, cy + a.size / 3, ROCK_TYPES[a.type].edge, 5); FX.sample('armorHit'); return false; }
            a.dead = true; smashed++;
            if (a.max > 2) toughSmashed++;
            const pts = Math.round(ROCK_TYPES[a.type].pts * (L.mult ? 2 : 1) * S.combo.mult * chain.hit());
            S.score += pts;
            juice.burst(cx, cy, ROCK_TYPES[a.type].fill[0], 14 + a.max * 3);
            juice.text(cx, a.y, a.max > 2 ? `SMASHED! +${pts}` : `+${pts}`, a.max > 2 ? '#fbbf24' : '#67e8f9');
            juice.shake(a.max > 2 ? 9 : chain.count % 5 === 0 ? 12 : 3);
            if (a.type === 'iron') FX.sample('crash'); else FX.play('hit');
            if (a.type === 'crystal') gems.push({ x: cx, y: cy, vy: 1.4 });
            hud();
            return true;
        }
        function novaBomb() {
            if (ended || !S.novas || nova > 0) return;
            S.novas--; nova = 500;
            FX.sample('emp'); FX.flash('rgba(167,139,250,.3)'); juice.shake(16);
            asteroids.forEach(a => { if (!a.dead) hitRock(a, 4, performance.now()); });
            hud();
        }

        function loop(now) {
            if (ended) return;
            if (!document.body.contains(canvas)) { cleanup(); return; }
            const ms = last ? Math.min(50, now - last) : 16;
            last = now;
            const dt = ms / 16.67;                        // same speed on 60Hz and 144Hz screens
            chain.tick(ms);
            ctx.save();
            juice.offset(ctx);
            spaceBackdrop(ctx, canvas.width, canvas.height, [], dt, now);
            ctx.fillStyle = '#38bdf8';
            stars.forEach(s => { s.y += s.speed * 1.6 * dt; if (s.y > canvas.height) s.y = 0; ctx.globalAlpha = s.size > 2 ? 0.9 : 0.4; ctx.fillRect(s.x, s.y, s.size, s.size); });
            ctx.globalAlpha = 1;

            let move = 0;
            if ((keys.ArrowLeft || keys.KeyA) && player.x > 0) { player.x -= player.speed * dt; move = -1; }
            if ((keys.ArrowRight || keys.KeyD) && player.x < canvas.width - player.w) { player.x += player.speed * dt; move = 1; }
            player.x = clamp(player.x, 0, canvas.width - player.w);
            tilt += (move * 0.18 - tilt) * 0.2 * dt;

            const firing = keys.ArrowUp || keys.KeyW || keys.Space || pointerDown;
            if (firing && now - lastShoot > fireGap) {
                const cx = player.x + player.w / 2, top = player.y - 4;
                const color = ['#00f2fe', '#a78bfa', '#f472b6'][L.power];
                FX.play('shoot');
                const shots = spread >= 2 ? [[-12, -0.9], [0, 0], [12, 0.9]] : spread === 1 ? [[-8, 0], [8, 0]] : [[0, 0]];
                shots.forEach(([dx, vx]) => bullets.push({ x: cx + dx - 2, y: top, w: 4 + L.power, h: 14, vx, color }));
                lastShoot = now;
            }
            if (missileGap && now - lastMissile > missileGap && asteroids.some(a => !a.dead)) {
                missiles.push({ x: player.x + player.w / 2, y: player.y, vx: 0, vy: -4, trail: [] });
                lastMissile = now;
            }

            ctx.save(); ctx.shadowBlur = 12;
            for (let i = bullets.length - 1; i >= 0; i--) {
                const b = bullets[i]; b.y -= 9.5 * dt; b.x += b.vx * dt;
                ctx.fillStyle = b.color; ctx.shadowColor = b.color; ctx.fillRect(b.x, b.y, b.w, b.h);
                if (b.y < -20) bullets.splice(i, 1);
            }
            ctx.restore();

            // Homing missiles steer toward the nearest rock
            missiles.forEach(m => {
                let best = null, bd = 1e9;
                asteroids.forEach(a => { if (a.dead) return; const d = Math.hypot(a.x + a.size / 2 - m.x, a.y + a.size / 2 - m.y); if (d < bd) { bd = d; best = a; } });
                if (best) {
                    const ang = Math.atan2(best.y + best.size / 2 - m.y, best.x + best.size / 2 - m.x);
                    m.vx += Math.cos(ang) * 0.5 * dt; m.vy += Math.sin(ang) * 0.5 * dt;
                }
                const sp = Math.hypot(m.vx, m.vy) || 1; m.vx = m.vx / sp * 6.5; m.vy = m.vy / sp * 6.5;
                m.x += m.vx * dt; m.y += m.vy * dt;
                m.trail.push({ x: m.x, y: m.y }); if (m.trail.length > 8) m.trail.shift();
                m.trail.forEach((p, i) => { ctx.globalAlpha = i / 16; ctx.fillStyle = '#fb923c'; ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2); ctx.fill(); });
                ctx.globalAlpha = 1;
                ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(Math.atan2(m.vy, m.vx) + Math.PI / 2);
                ctx.fillStyle = '#e2e8f0'; ctx.fillRect(-2.5, -7, 5, 12); ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.moveTo(-2.5, -7); ctx.lineTo(0, -11); ctx.lineTo(2.5, -7); ctx.fill();
                ctx.restore();
            });
            missiles = missiles.filter(m => !m.gone && m.y > -30 && m.y < canvas.height + 30 && m.x > -30 && m.x < canvas.width + 30);

            if (Math.random() < 0.042 * dt) spawnRock();

            for (let i = asteroids.length - 1; i >= 0; i--) {
                const a = asteroids[i];
                a.y += a.speed * dt; a.x += a.drift * dt; a.rot += a.rotSpeed * dt;
                if (a.x < 0 || a.x > canvas.width - a.size) a.drift *= -1;
                drawRock(ctx, a, now);
                const box = { x: a.x + a.size * 0.1, y: a.y + a.size * 0.1, w: a.size * 0.8, h: a.size * 0.8 };
                for (let j = bullets.length - 1; j >= 0 && !a.dead; j--) {
                    const b = bullets[j];
                    if (b.x < box.x + box.w && b.x + b.w > box.x && b.y < box.y + box.h && b.y + b.h > box.y) { bullets.splice(j, 1); hitRock(a, dmg, now); }
                }
                missiles.forEach(m => {
                    if (a.dead || m.gone) return;
                    if (m.x > box.x && m.x < box.x + box.w && m.y > box.y && m.y < box.y + box.h) {
                        m.gone = true; juice.burst(m.x, m.y, '#fb923c', 10); hitRock(a, 2 + L.power, now);
                    }
                });
                const ship = { x: player.x + 6, y: player.y + 4, w: player.w - 12, h: player.h - 8 };
                if (!a.dead && overlap(ship, box)) {
                    a.dead = true;
                    juice.burst(a.x + a.size / 2, a.y + a.size / 2, '#ef4444', 18);
                    if (deflect > 0) {
                        deflect--; FX.sample('shieldBlock'); juice.text(player.x + 20, player.y - 10, 'DEFLECTED!', '#93c5fd');
                    } else {
                        const hurt = Math.round(crashDmg * (a.max > 2 ? 1.5 : 1));
                        S.score = Math.max(0, S.score - 15);
                        shield = Math.max(0, shield - hurt);
                        hurtUntil = now + 700;
                        chain.reset(); juice.shake(18); FX.shake(card, 10); FX.play('explode');
                        hud();
                        if (shield <= 0) { ctx.restore(); endWave('Your ship was destroyed!'); return; }
                    }
                }
                if (a.dead || a.y > canvas.height) asteroids.splice(i, 1);
            }

            // Crystal gems: catch them for credits
            for (let i = gems.length - 1; i >= 0; i--) {
                const g = gems[i], pcx = player.x + player.w / 2, pcy = player.y + player.h / 2;
                if (L.magnet && Math.hypot(pcx - g.x, pcy - g.y) < 170) { g.x += (pcx - g.x) * 0.08 * dt; g.y += (pcy - g.y) * 0.08 * dt; }
                else g.y += g.vy * dt;
                ctx.save(); ctx.translate(g.x, g.y); ctx.rotate(now / 300);
                ctx.shadowColor = '#c4b5fd'; ctx.shadowBlur = 12; ctx.fillStyle = '#a78bfa';
                ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(6, 0); ctx.lineTo(0, 8); ctx.lineTo(-6, 0); ctx.closePath(); ctx.fill();
                ctx.fillStyle = '#ede9fe'; ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(3, -1); ctx.lineTo(-3, -1); ctx.closePath(); ctx.fill();
                ctx.restore();
                if (Math.hypot(pcx - g.x, pcy - g.y) < 26) {
                    gems.splice(i, 1); gemCount++; S.credits += 15;
                    juice.text(g.x, g.y - 12, '+15 💰', '#c4b5fd'); FX.sample('orb');
                } else if (g.y > canvas.height + 10) gems.splice(i, 1);
            }

            const mood = now < hurtUntil ? 'worried' : firing ? 'focus' : 'happy';
            drawScrappyRocket(ctx, player.x + player.w / 2, player.y + player.h / 2, now, { mood, tilt, shield: deflect, thrust: move ? 1.25 : 1 });
            if (nova > 0) {
                nova -= ms;
                const k = 1 - nova / 500;
                ctx.save(); ctx.globalAlpha = Math.max(0, 1 - k); ctx.strokeStyle = '#c4b5fd'; ctx.lineWidth = 6; ctx.shadowColor = '#a78bfa'; ctx.shadowBlur = 20;
                ctx.beginPath(); ctx.arc(player.x + player.w / 2, player.y, k * 700, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
            }
            juice.draw(ctx, dt);
            if (chain.count >= 3) { ctx.font = '800 16px Orbitron, sans-serif'; ctx.fillStyle = '#fbbf24'; ctx.fillText(`HIT CHAIN x${chain.count}`, 14, 26); }
            // Small legend in the corner for the gem total and deflector charges
            ctx.font = '700 11px Inter, sans-serif'; ctx.textAlign = 'right'; ctx.fillStyle = '#c4b5fd';
            ctx.fillText(`Credits ${S.credits}${deflect ? ` · Deflector ×${deflect}` : ''}`, 630, 20); ctx.textAlign = 'start';
            ctx.restore();
            animId = requestAnimationFrame(loop);
        }
        animId = requestAnimationFrame(loop);
    }

    function finish() {
        finishGame({ modal, stage, modId, subId, gameKey: 'rocket', title: '🚀 Rocket Challenge', quizScore: S.quiz, total: questions.length, arcadeLabel: 'Arcade Score', arcadeScore: S.score, bestStreak: S.combo.best, xpMult: S.xpMult, retry: () => runRocketGame(modId, subId) });
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
        GAME_KEYS.forEach(g => {
            const v = user.scores[g];
            user.scores[g] = (typeof v !== 'number' || Number.isNaN(v) || v < 0) ? 0 : Math.min(v, 50000);
        });
        // Boss defeat time (ms): anything implausible is dropped
        if (user.bossTime !== undefined && !(Number(user.bossTime) >= 5000 && Number(user.bossTime) <= 3600000)) delete user.bossTime;
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
    { key: 'avatar_true_god_scrappy', type: 'avatar', name: 'True God Scrappy', desc: 'Ascended mascot form.', cost: 350, img: 'images/generate_image_01 (1).png', tier: 'purple' },
    { key: 'avatar_angry_red_bot', type: 'avatar', name: 'Angry Red Bot', desc: 'Overheated, steaming and furious. Do not poke.', cost: 75, img: 'images/avatar_angry_red_bot.svg' },
    { key: 'avatar_dj_bot', type: 'avatar', name: 'Neon DJ Bot', desc: 'Drops beats, not packets.', cost: 125, img: 'images/avatar_dj_bot.jpg' },
    { key: 'avatar_icecream_robot', type: 'avatar', name: 'Ice Cream Yellow Robot', desc: 'Brain freeze, but make it cute.', cost: 200, img: 'images/avatar_icecream_robot.jpg' },
    { key: 'avatar_manga_scrappy', type: 'avatar', name: 'Manga Scrappy', desc: 'Hand-inked and screentoned for chapter one.', cost: 300, img: 'images/avatar_manga_scrappy.svg', tier: 'manga' },
    { key: 'avatar_samurai_scrappy', type: 'avatar', name: 'Samurai Scrappy', desc: 'Kabuto on, blade ready, code sharp.', cost: 450, img: 'images/avatar_samurai_scrappy.jpg', tier: 'sakura' },
    { key: 'bg_manga', type: 'bg', name: 'Manga Panels Background', desc: 'Ink, screentone and speed lines. Comic fonts and hard-shadow borders.', cost: 800, img: 'images/bg_manga.svg', tier: 'manga' },
    { key: 'bg_fuji', type: 'bg', name: 'Mount Fuji Twilight (Animated)', desc: 'Drifting clouds, falling sakura and a shimmering lake. Elegant serif theme.', cost: 900, img: 'images/bg_fuji.svg', tier: 'sakura' },
    { key: 'bg_lofi', type: 'bg', name: 'Lofi Scrappy (Animated)', desc: 'Rainy night, fairy lights and Scrappy vibing to beats. Soft rounded study theme.', cost: 850, img: 'images/bg_lofi.svg' }
];
const AVATAR_MAP = Object.fromEntries(SHOP.filter(i => i.type === 'avatar').map(i => [i.key, i.img]));
const STARTER_AVATARS = ['images/Designer (1).png', 'images/Designer (2).png', 'images/Designer (3).png'];

const Portal = (() => {
    const ID_KEY = 'ai_portal_active_user_id', LOCAL_KEY = 'ai_portal_local_directory';
    let dir = [];
    // Each leaderboard (Profile directory and Dashboard) remembers its own tab
    const category = { directory: 'xp', dashboard: 'xp' };
    const DASH_LIMIT = 10;

    const SEEDS = [
        { id: 'seed_1', username: 'NovaPrime', bio: 'Neural network architect & laser ace', avatar: 'images/Designer (1).png', background: 'bg_default', xp: 650, scores: { rocket: 1420, blockblast: 980, pirate: 1100 }, unlocks: ['bg_default'] },
        { id: 'seed_2', username: 'ByteRunner', bio: 'Prompt engineering speedrunner', avatar: 'images/Designer (2).png', background: 'bg_default', xp: 480, scores: { rocket: 1150, blockblast: 1240, pirate: 890 }, unlocks: ['bg_default'] }
    ];

    function normalize(d) {
        d.scores = d.scores && typeof d.scores === 'object' ? d.scores : {};
        if (d.scores.pirate === undefined) d.scores.pirate = d.pirateScore || d.scores.angrybirds || 0;
        GAME_KEYS.forEach(g => { if (d.scores[g] === undefined) d.scores[g] = 0; });
        if (!Array.isArray(d.unlocks) || !d.unlocks.length) d.unlocks = ['bg_default'];
        d.equipped = d.equipped && typeof d.equipped === 'object' ? d.equipped : {};
        // These three avatars switched from drawn SVGs to painted art; carry over anyone already wearing one
        if (typeof d.avatar === 'string') d.avatar = d.avatar.replace(/^images\/(avatar_(?:dj_bot|icecream_robot|samurai_scrappy))\.svg$/, 'images/$1.jpg');
        d.username = String(d.username || 'Cadet');
        return d;
    }

    // In Developer Mode you get a throwaway copy of your profile: changes show on screen
    // but never reach the saved profile, so the leaderboards stay untouched.
    let devCopy = null;
    const getActiveUser = () => {
        const id = localStorage.getItem(ID_KEY);
        const real = id ? dir.find(u => u.id === id) || null : null;
        if (!real || !devMode()) return real;
        if (!devCopy || devCopy.id !== real.id) devCopy = JSON.parse(JSON.stringify(real));
        return devCopy;
    };

    // Progress lives in this browser, so a summary is copied onto your profile for others to see
    const progressSnapshot = () => ({
        badges: BADGES.filter(b => badgeProgress(b).done).map(b => b.id),
        modulesDone: modulesDoneCount(),
        lessonsDone: lessonsDoneCount()
    });

    // Saves the profile only if its progress summary is out of date. Returns true if it saved.
    function syncProfile() {
        const u = getActiveUser();
        if (!u) return false;
        const snap = progressSnapshot();
        const certMissing = !!savedCertificates()[u.id] && !validCertificate(u.certificate);
        if (!certMissing && JSON.stringify(snap) === JSON.stringify({ badges: u.badges, modulesDone: u.modulesDone, lessonsDone: u.lessonsDone })) return false;
        persist(u);
        return true;
    }

    async function persist(user) {
        // Developer Mode never saves your own profile (other profiles, like the starter seeds, still save)
        if (devMode() && user.id === localStorage.getItem(ID_KEY)) { refreshUI(); return; }
        if (user.id === localStorage.getItem(ID_KEY)) {
            Object.assign(user, progressSnapshot());
            const cert = savedCertificates()[user.id];
            if (cert && !validCertificate(user.certificate)) user.certificate = cert;
        }
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
            if (!syncProfile()) refreshUI();
            return;
        }
        db.collection('cadets').onSnapshot(snap => {
            const cloud = [];
            snap.forEach(doc => cloud.push(normalize({ id: doc.id, ...doc.data() })));
            if (!cloud.length) { SEEDS.forEach(s => persist(normalize({ ...s }))); return; }
            dir = cloud;
            store.set(LOCAL_KEY, dir);
            if (!syncProfile()) refreshUI();
        }, err => {
            console.error('Firestore sync error:', err);
            dir = store.get(LOCAL_KEY, []).map(normalize);
            refreshUI();
        });
    }

    // ---- Passwords: PBKDF2-SHA256 with a random salt per profile; only the hash is saved
    const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
    const cryptoReady = () => !!(window.crypto && crypto.subtle);
    async function hashPassword(password, salt) {
        const enc = new TextEncoder();
        const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
        const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations: 150000 }, key, 256);
        return hex(bits);
    }
    async function makeAuth(password) {
        const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
        return { salt, hash: await hashPassword(password, salt) };
    }
    // Saves the profile (waiting briefly for the cloud), then reloads into it
    async function saveThenLogIn(user) {
        await Promise.race([persist(user), new Promise(r => setTimeout(r, 4000))]);
        PortalAccount.logIn(user.id);
    }

    function award(game, score, xp) {
        store.set('localXP', store.get('localXP', 0) + xp);
        const u = getActiveUser();
        if (!u) return false;
        u.xp = (Number(u.xp) || 0) + xp;
        const capped = Math.min(50000, Math.round(score));     // combo multipliers can push past the cap
        if (capped > (u.scores[game] || 0)) u.scores[game] = capped;
        persist(u);
        return true;
    }

    function buy(key) {
        const user = getActiveUser(), item = SHOP.find(i => i.key === key);
        if (!user) { toast('Create or select a profile first!', 'warn'); return; }
        if (!item) return;
        if (devMode()) return equip(key);     // try anything on, free and unsaved
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
        else if (PortalTheme.has(key)) {
            user.background = key;
            if (key !== 'bg_default') store.set('usedBackground', true);
            toast('Background applied across the whole portal.', 'success');
        }
        persist(user);
        checkRewards();
    }

    // Looks up an equipped reward. Saved ids are untrusted, so only known ids of the right type count.
    // Your own rewards must also be earned on this device.
    function getEquipped(user, type) {
        const r = user && user.equipped ? REWARD_MAP.get(user.equipped[type]) : null;
        if (!r || r.type !== type) return null;
        const me = getActiveUser();
        if (me && me.id === user.id) return rewardUnlocked(r) ? r : null;
        // Another player's ultimate reward only shows if their profile carries a certificate
        return r.ultimate && !validCertificate(user.certificate) ? null : r;
    }

    function toggleReward(id) {
        const user = getActiveUser(), reward = REWARD_MAP.get(id);
        if (!user || !reward) return;
        if (!rewardUnlocked(reward)) { toast(`Locked. Earn the ${BADGE_MAP.get(reward.badge).name} badge to unlock it.`, 'warn'); return; }
        const on = isEquipped(user, reward);
        if (reward.type === 'bg') {
            user.background = on ? 'bg_default' : reward.bg;
            if (!on) store.set('usedBackground', true);
        } else {
            // Unequip stores '' (not delete) because Firestore merge saves keep deleted keys
            user.equipped = { ...user.equipped, [reward.type]: on ? '' : id };
        }
        persist(user);
        toast(`${reward.name} ${on ? 'unequipped' : 'equipped'}.`, 'success');
        checkRewards();
        $(`#active-profile-view [data-reward="${id}"]`)?.focus({ preventScroll: true });
    }

    // Backgrounds are stored in user.background; every other reward type in user.equipped
    const isEquipped = (user, r) => r.type === 'bg' ? user.background === r.bg : user.equipped[r.type] === r.id;

    // ---- Profile panels: Unlockable Shop, Inventory, Leaderboard --------------
    const UNLOCK_CATEGORIES = [
        { key: 'avatar', label: 'Avatars', icon: '🤖' },
        { key: 'bg', label: 'Backgrounds', icon: '🌌' },
        { key: 'border', label: 'Avatar Borders', icon: '⭕' },
        { key: 'title', label: 'Titles', icon: '🏷️' },
        { key: 'accent', label: 'Theme Accents', icon: '🎨' },
        { key: 'chat', label: 'Chat Badges', icon: '💬' },
        { key: 'cursor', label: 'Effects', icon: '✨' }
    ];
    const SOURCE_TAG = { starter: 'Starter', xp: 'XP Item', badge: 'Badge Reward', exam: 'Grandmaster' };

    // Everything that can be owned, in one list. Each entry knows how it is unlocked and equipped.
    function catalog(user) {
        const items = [];
        STARTER_AVATARS.forEach((img, i) => items.push({ id: `starter_${i}`, cat: 'avatar', name: `Starter Bot ${i + 1}`, source: 'starter', img, owned: true, on: user.avatar === img, equip: `data-set-avatar="${esc(img)}"` }));
        items.push({ id: 'bg_default', cat: 'bg', name: 'Default Dark', source: 'starter', bg: 'bg_default', owned: true, on: !user.background || user.background === 'bg_default', equip: 'data-equip="bg_default"' });
        SHOP.forEach(s => {
            const owned = devMode() || user.unlocks.includes(s.key);
            const on = s.type === 'bg' ? user.background === s.key : user.avatar === s.img;
            items.push({ id: s.key, cat: s.type === 'bg' ? 'bg' : 'avatar', name: s.name, desc: s.desc, source: 'xp', cost: s.cost, img: s.img, owned, on, equip: `data-equip="${s.key}"` });
        });
        REWARDS.forEach(r => {
            const owned = rewardUnlocked(r);
            items.push({ id: r.id, cat: r.type, name: r.name, source: r.ultimate ? 'exam' : 'badge', reward: r, bg: r.bg, owned, on: owned && isEquipped(user, r), equip: `data-reward="${r.id}"`, toggles: r.type !== 'bg' });
        });
        return items;
    }

    function previewHTML(item, user) {
        const r = item.reward;
        if (item.cat === 'avatar') return `<img class="unlock-avatar" src="${esc(item.img)}" alt="" loading="lazy">`;
        if (item.cat === 'bg') return item.img ? `<img class="unlock-bg" src="${esc(item.img)}" alt="" loading="lazy">` : `<span class="bg-swatch" data-bg="${item.bg}"></span>`;
        return {
            border: () => `<span class="frame-swatch${frameClass(r)}" style="${frameStyle(r)}"><img src="${esc(user.avatar)}" alt=""></span>`,
            title: () => `<span class="title-pill${r.ultimate ? ' ultimate' : ''}">${esc(r.name)}</span>`,
            accent: () => `<span class="accent-swatch" style="--r-rgb:${r.rgb}"></span>`,
            chat: () => `<span class="chat-badge">${r.icon} ${esc(r.name)}</span>`,
            cursor: () => `<span class="cursor-swatch">✨</span>`
        }[item.cat]();
    }

    let shopCat = 'all';
    function renderShop(user) {
        const root = $('#unlock-shop');
        if (!root) return;
        const items = catalog(user).filter(i => i.source !== 'starter');
        $('#shop-xp').textContent = devMode() ? '🛠 Developer Mode: everything unlocked' : `${num(user.xp)} XP to spend`;
        const count = cat => { const list = items.filter(i => cat === 'all' || i.cat === cat); return `${list.filter(i => i.owned).length}/${list.length}`; };
        $('#shop-filters').innerHTML = [{ key: 'all', label: 'All', icon: '' }, ...UNLOCK_CATEGORIES].map(c =>
            `<button type="button" class="shop-filter${shopCat === c.key ? ' active' : ''}" data-shop-cat="${c.key}" aria-pressed="${shopCat === c.key}">${c.icon} ${c.label} <small>${count(c.key)}</small></button>`).join('');

        const card = item => {
            let status;
            if (item.owned) {
                status = `<span class="unlock-state owned">✓ ${item.source === 'xp' ? 'Owned' : 'Earned'}</span>
                    <button type="button" class="btn-cyan-secondary" data-ptab="inventory">${item.on ? '✓ Equipped' : 'Equip in Inventory'}</button>`;
            } else if (item.source === 'xp') {
                const short = item.cost - num(user.xp);
                status = `<button type="button" class="btn-cyan-secondary" data-buy="${item.id}">Unlock · ${item.cost} XP</button>
                    ${short > 0 ? `<span class="unlock-hint">${short} more XP needed</span>` : ''}`;
            } else if (item.source === 'exam') {
                status = `<p class="unlock-how">🔒 Pass the Final Exam with 80%+</p><a class="btn-cyan-secondary" href="#final-exam">See Final Exam</a>`;
            } else {
                const badge = BADGE_MAP.get(item.reward.badge), p = badgeProgress(badge);
                status = `<p class="unlock-how">🔒 ${esc(badge.desc)} to earn ${badge.icon} <strong>${esc(badge.name)}</strong></p>
                    ${meterHTML(p, `${item.name} progress`)}<span class="meter-label">${p.current} / ${p.target} ${esc(badge.unit)}</span>`;
            }
            return `
                <div class="reward-card unlock-card ${item.owned ? 'unlocked' : 'locked'}${item.on ? ' equipped' : ''}">
                    <span class="unlock-source src-${item.source}">${SOURCE_TAG[item.source]}</span>
                    <div class="reward-preview" aria-hidden="true">${previewHTML(item, user)}</div>
                    <h4>${esc(item.name)}</h4>
                    ${item.desc ? `<p>${esc(item.desc)}</p>` : ''}
                    ${status}
                </div>`;
        };
        const cats = UNLOCK_CATEGORIES.filter(c => shopCat === 'all' || c.key === shopCat);
        root.innerHTML = cats.map(c => {
            // Locked first within a category is noisy; show what you can get soonest: owned last, cheapest first
            const list = items.filter(i => i.cat === c.key).sort((a, b) => (a.owned - b.owned) || ((a.cost || 0) - (b.cost || 0)));
            return list.length ? `<h3 class="locker-group-title">${c.icon} ${c.label} <small>${count(c.key)}</small></h3><div class="reward-grid">${list.map(card).join('')}</div>` : '';
        }).join('');
    }

    function renderInventory(user) {
        const root = $('#inventory-grid');
        if (!root) return;
        const owned = catalog(user).filter(i => i.owned);
        $('#inventory-count').textContent = `${owned.length} items`;
        // Current loadout at a glance
        const worn = cat => owned.find(i => i.cat === cat && i.on);
        const slot = (label, item, fallback = 'None') => `<div class="loadout-slot"><span>${label}</span><strong>${item ? esc(item.name) : fallback}</strong></div>`;
        const avatar = worn('avatar');
        $('#loadout').innerHTML = `
            <img class="loadout-avatar" src="${esc(user.avatar)}" alt="">
            ${slot('Avatar', avatar, 'Custom')}${slot('Background', worn('bg'), 'Default Dark')}${slot('Border', worn('border'))}
            ${slot('Title', worn('title'))}${slot('Accent', worn('accent'))}${slot('Chat Badge', worn('chat'))}${slot('Effect', worn('cursor'))}
            ${certificateFor(user) || devMode() ? `<button type="button" class="btn-cyan-primary" data-ultimate-all="${REWARDS.filter(r => r.ultimate).every(r => isEquipped(user, r)) ? 'off' : 'on'}">👑 ${REWARDS.filter(r => r.ultimate).every(r => isEquipped(user, r)) ? 'Unequip' : 'Equip'} Grandmaster Set</button>` : ''}`;
        // Categories with nothing owned yet collapse into one line at the end
        const empty = UNLOCK_CATEGORIES.filter(c => !owned.some(i => i.cat === c.key));
        root.innerHTML = UNLOCK_CATEGORIES.filter(c => !empty.includes(c)).map(c => {
            const list = owned.filter(i => i.cat === c.key);
            const body = `<div class="reward-grid">${list.map(item => `
                    <div class="reward-card unlocked${item.on ? ' equipped' : ''}">
                        <div class="reward-preview" aria-hidden="true">${previewHTML(item, user)}</div>
                        <h4>${esc(item.name)}</h4>
                        <button type="button" class="btn-cyan-secondary" ${item.equip} aria-pressed="${item.on}"${item.on && !item.toggles ? ' disabled' : ''}>${item.on ? (item.toggles ? '✓ Equipped (Remove)' : '✓ Equipped') : 'Equip'}</button>
                    </div>`).join('')}</div>`;
            return `<h3 class="locker-group-title">${c.icon} ${c.label} <small>${list.length}</small></h3>${body}`;
        }).join('') + (empty.length ? `
            <div class="inventory-empty"><span>Not unlocked yet:</span>${empty.map(c =>
                `<button type="button" class="shop-filter" data-ptab="shop" data-shop-jump="${c.key}">${c.icon} ${c.label}</button>`).join('')}</div>` : '');
    }

    // Fast-track buttons at the top of the profile switch panels (remembered for this visit)
    let profileTab = sessionStorage.getItem('profileTab') || 'shop';
    function showProfileTab(tab, focus = false) {
        if (!['shop', 'inventory', 'leaderboard', 'review'].includes(tab)) tab = 'shop';
        profileTab = tab;
        try { sessionStorage.setItem('profileTab', tab); } catch { /* storage blocked */ }
        $$('.profile-tab').forEach(b => {
            const on = b.dataset.ptab === tab;
            b.classList.toggle('active', on);
            b.setAttribute('aria-selected', on);
            b.tabIndex = on ? 0 : -1;
            if (on && focus) b.focus();
        });
        ['shop', 'inventory', 'leaderboard', 'review'].forEach(t => { const p = $(`#ppanel-${t}`); if (p) p.hidden = t !== tab; });
        if (tab === 'review' && window.Reviews) Reviews.renderEditor();
    }

    function setUltimate(on) {
        const user = getActiveUser();
        if (!user || !(certificateFor(user) || devMode())) return;
        user.background = on ? 'bg_grandmaster' : 'bg_default';
        user.equipped = { ...user.equipped, title: on ? 'title_ai_grandmaster' : '', cursor: on ? 'cursor_grandmaster' : '' };
        if (on) store.set('usedBackground', true);
        persist(user);
        toast(on ? 'Grandmaster set equipped.' : 'Grandmaster set unequipped.', 'success');
        checkRewards();
        $('[data-ultimate-all]')?.focus({ preventScroll: true });
    }

    function addXP(xp) {
        store.set('localXP', store.get('localXP', 0) + xp);
        const u = getActiveUser();
        if (!u) return false;
        u.xp = (Number(u.xp) || 0) + xp;
        persist(u);
        return true;
    }

    // Applies the equipped border, title, chat badge and accent to the profile header
    function applyRewards(user) {
        const border = getEquipped(user, 'border'), title = getEquipped(user, 'title');
        const chat = getEquipped(user, 'chat'), accent = getEquipped(user, 'accent');
        const ring = $('#dash-avatar');
        ring.className = 'profile-avatar-ring' + frameClass(border);
        ring.style.cssText = frameStyle(border);
        const titleEl = $('#dash-title'), chatEl = $('#dash-chat-badge');
        titleEl.hidden = !title;
        titleEl.textContent = title ? title.name : '';
        titleEl.classList.toggle('ultimate', !!title?.ultimate);
        chatEl.hidden = !chat;
        chatEl.textContent = chat ? `${chat.icon} ${chat.name}` : '';
        const view = $('#active-profile-view');
        view.classList.toggle('has-accent', !!accent);
        if (accent) view.style.setProperty('--r-rgb', accent.rgb); else view.style.removeProperty('--r-rgb');
    }

    const rankTitle = xp => xp >= 1000 ? 'Grandmaster AI Architect' : xp >= 500 ? 'Cyber Specialist' : xp >= 200 ? 'Prompt Engineer' : 'Rookie AI Explorer';

    // ---- Leaderboards (Profile directory + Dashboard) ---------------------
    // Built on demand because games.js (which lists the games) loads after this file
    const boardCats = () => [
        { key: 'xp', tab: '🌟 Top XP', value: u => num(u.xp), text: v => `${v} XP` },
        { key: 'total', tab: '🏅 Total Score', value: u => totalScore(u), text: v => `${v} pts` },
        ...GAME_KEYS.map(k => k === 'boss'
            // The boss board ranks the fastest defeat (lower is better); players without a time sit at the bottom
            ? { key: k, tab: `${GAMES[k].icon} ${GAMES[k].short}`, value: bossTime, text: v => v ? fmtTime(v) : 'Not defeated', asc: true }
            : { key: k, tab: `${GAMES[k].icon} ${GAMES[k].short}`, value: u => num(u.scores[k]), text: v => `${v} pts` })
    ];
    // Boss defeat time in ms. Saved values are untrusted, so anything outside 5 s to 1 h is ignored.
    const bossTime = u => { const t = Number(u && u.bossTime); return Number.isFinite(t) && t >= 5000 && t <= 3600000 ? Math.floor(t) : 0; };
    const fmtTime = ms => { const s = ms / 1000; return `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, '0')}`; };
    // Other players' data comes from the shared database, so never trust its types
    const num = v => Number.isFinite(Number(v)) ? Math.max(0, Math.floor(Number(v))) : 0;
    const totalScore = u => GAME_KEYS.reduce((sum, k) => sum + num(u.scores[k]), 0);

    const flairHTML = u => {
        const title = getEquipped(u, 'title'), chat = getEquipped(u, 'chat');
        return (title ? `<span class="title-pill${title.ultimate ? ' ultimate' : ''}">${esc(title.name)}</span>` : '') + (chat ? `<span class="chat-badge">${chat.icon} ${esc(chat.name)}</span>` : '');
    };

    function boardRow(u, rank, cat, me) {
        const isMe = me && u.id === me.id;
        const border = getEquipped(u, 'border'), flair = flairHTML(u);
        const score = cat.text(cat.value(u));
        return `<div class="directory-row clickable${isMe ? ' is-me' : ''}" role="button" tabindex="0" data-inspect="${esc(u.id)}" aria-label="View ${esc(u.username)}'s profile, rank ${rank}, ${score}">
            <div class="dir-user-info"><span class="dir-rank${rank <= 3 ? ' top-' + rank : ''}">#${rank}</span>
                <div class="dir-avatar${frameClass(border)}" style="${frameStyle(border)}"><img src="${esc(u.avatar)}" alt=""></div>
                <div><span class="dir-name">${esc(u.username)}${isMe ? ' (You)' : ''}</span>${flair ? `<span class="dir-flair">${flair}</span>` : ''}<span class="dir-bio">${esc(u.bio || 'AI Learning Cadet')}</span></div>
            </div><div class="dir-side"><div class="dir-scores">${score}</div><span class="dir-view" aria-hidden="true">View profile →</span></div></div>`;
    }

    const ranked = cat => [...dir].sort((a, b) => {
        if (!cat.asc) return cat.value(b) - cat.value(a);
        const A = cat.value(a) || Infinity, B = cat.value(b) || Infinity;
        return A === B ? 0 : A - B;
    });
    // Top rows for one game, used by the results screen after a minigame
    const topFor = (key, n) => ranked(findCat(key)).slice(0, n).map(u => ({ u, text: findCat(key).text(findCat(key).value(u)) }));

    // Saves a boss defeat time if it beats this profile's best. Returns true for a new record.
    function recordBossTime(ms) {
        const u = getActiveUser();
        if (!u || !(ms >= 5000)) return false;
        const best = bossTime(u);
        if (best && best <= ms) return false;
        u.bossTime = Math.round(ms);
        persist(u);
        return true;
    }
    const findCat = key => { const cats = boardCats(); return cats.find(c => c.key === key) || cats[0]; };

    function renderDirectory() {
        const list = $('#global-directory-list');
        if (!list) return;
        const me = getActiveUser(), cat = findCat(category.directory);
        const q = ($('#global-profile-search')?.value || '').toLowerCase().trim();
        // Ranks are worked out before searching, so a search never changes anyone's rank
        const rows = ranked(cat).map((u, i) => [u, i + 1])
            .filter(([u]) => u.username.toLowerCase().includes(q) || String(u.bio || '').toLowerCase().includes(q));
        list.innerHTML = rows.length
            ? rows.map(([u, rank]) => boardRow(u, rank, cat, me)).join('')
            : `<p class="empty-note">No cadets found${q ? ` matching "${esc(q)}"` : ''}.</p>`;
    }

    function renderDashboardBoard() {
        const list = $('#dash-leaderboard');
        if (!list) return;
        const me = getActiveUser(), cat = findCat(category.dashboard);
        const all = ranked(cat).map((u, i) => [u, i + 1]);
        const rows = all.slice(0, DASH_LIMIT);
        const mine = me && all.find(([u]) => u.id === me.id);
        if (mine && mine[1] > DASH_LIMIT) rows.push(mine);
        const focused = document.activeElement?.closest?.('#dash-leaderboard [data-inspect]')?.dataset.inspect;
        list.innerHTML = rows.length ? rows.map(([u, rank]) => boardRow(u, rank, cat, me)).join('') : '<p class="empty-note">No cadets yet. Create a profile to claim the top spot!</p>';
        if (focused) $$('[data-inspect]', list).find(el => el.dataset.inspect === focused)?.focus({ preventScroll: true });
    }

    function buildBoardTabs() {
        $$('[data-board]').forEach(wrap => {
            wrap.innerHTML = boardCats().map(c => `<button type="button" class="lb-tab${c.key === category[wrap.dataset.board] ? ' active' : ''}" data-cat="${c.key}" aria-pressed="${c.key === category[wrap.dataset.board]}">${c.tab}</button>`).join('');
            wrap.addEventListener('click', e => {
                const tab = e.target.closest('.lb-tab');
                if (!tab) return;
                category[wrap.dataset.board] = tab.dataset.cat;
                $$('.lb-tab', wrap).forEach(t => { t.classList.toggle('active', t === tab); t.setAttribute('aria-pressed', t === tab); });
                if (wrap.dataset.board === 'dashboard') renderDashboardBoard(); else renderDirectory();
                animateView(wrap.parentElement);
            });
        });
    }

    // ---- Profile inspection modal -----------------------------------------
    let closeInspector = () => {};

    function inspectorHTML(u) {
        const me = getActiveUser(), isMe = me && u.id === me.id;
        const border = getEquipped(u, 'border'), accent = getEquipped(u, 'accent'), flair = flairHTML(u);
        const shared = Array.isArray(u.badges);
        const badges = shared ? [...new Set(u.badges)].map(id => BADGE_MAP.get(id)).filter(Boolean) : [];
        const modules = shared ? Math.min(MODULES.length, num(u.modulesDone)) : null;
        const best = Math.max(1, ...GAME_KEYS.map(k => num(u.scores[k])));
        const stat = (label, value) => `<div class="p-stat-box"><span class="p-stat-label">${label}</span><span class="p-stat-num">${value}</span></div>`;
        return `
            <div class="inspect-card" role="dialog" aria-modal="true" aria-labelledby="inspect-name" tabindex="-1" style="${accent ? '--i-rgb:' + accent.rgb : ''}">
                <button type="button" class="inspect-close" aria-label="Close profile">✕</button>
                <div class="inspect-head">
                    <div class="profile-avatar-ring${frameClass(border)}" style="${frameStyle(border)}"><img src="${esc(u.avatar)}" alt=""></div>
                    <div>
                        <h2 id="inspect-name">${esc(u.username)}${isMe ? ' (You)' : ''}</h2>
                        <span class="profile-rank-pill">${rankTitle(num(u.xp))}</span>
                        <div class="profile-flair-row">${flair || '<span class="meter-label">No title equipped</span>'}</div>
                        <p>${esc(u.bio || 'AI Learning Cadet')}</p>
                        ${validCertificate(u.certificate) ? '<span class="grad-ribbon">🎓 Course Graduate</span>' : ''}
                    </div>
                </div>
                <div class="inspect-stats">
                    ${stat('TOTAL XP', num(u.xp))}${stat('TOTAL SCORE', totalScore(u))}
                    ${stat('MODULES', modules === null ? '—' : `${modules} / ${MODULES.length}`)}
                    ${stat('BADGES', shared ? `${badges.length} / ${BADGES.length}` : '—')}
                </div>
                <h3>Arcade High Scores</h3>
                <ul class="score-list">${GAME_KEYS.map(k => `
                    <li><span>${GAMES[k].icon} ${GAMES[k].short}</span><div class="score-bar"><div style="--w:${(num(u.scores[k]) / best) * 100}%"></div></div><b>${k === 'boss' && bossTime(u) ? fmtTime(bossTime(u)) : num(u.scores[k])}</b></li>`).join('')}
                </ul>
                <h3>Unlocked Badges</h3>
                ${!shared ? '<p class="empty-note">This cadet has not synced badge progress yet.</p>'
                    : badges.length ? `<ul class="inspect-badges">${badges.map((b, i) => `<li style="--stagger:${Math.min(i, 14)}" title="${esc(b.desc)}"><span aria-hidden="true">${b.icon}</span>${esc(b.name)}</li>`).join('')}</ul>`
                    : '<p class="empty-note">No badges earned yet.</p>'}
            </div>`;
    }

    function openInspector(id) {
        const user = dir.find(u => u.id === id);
        if (!user) { toast('That profile is no longer available.', 'warn'); return; }
        closeInspector(true);
        const opener = document.activeElement;
        const overlay = document.createElement('div');
        overlay.className = 'inspect-overlay';
        overlay.innerHTML = inspectorHTML(user);
        document.body.appendChild(overlay);
        document.body.classList.add('modal-open');
        const onKey = e => {
            if (e.key === 'Escape') closeInspector();
            // The close button is the only control, so Tab stays on it
            if (e.key === 'Tab') { e.preventDefault(); $('.inspect-close', overlay).focus(); }
        };
        closeInspector = instant => {
            closeInspector = () => {};
            document.removeEventListener('keydown', onKey);
            window.removeEventListener('hashchange', onHash);
            document.body.classList.remove('modal-open');
            overlay.classList.add('closing');
            if (instant) overlay.remove(); else setTimeout(() => overlay.remove(), 220);
            // Rows may have been redrawn while the modal was open
            const row = opener?.dataset?.inspect && $$('.view.is-active [data-inspect]').find(el => el.dataset.inspect === opener.dataset.inspect);
            (row || opener)?.focus?.({ preventScroll: true });
        };
        const onHash = () => closeInspector(true);
        document.addEventListener('keydown', onKey);
        window.addEventListener('hashchange', onHash);
        overlay.addEventListener('click', e => { if (e.target === overlay || e.target.closest('.inspect-close')) closeInspector(); });
        $('.inspect-close', overlay).focus();
        FX.play('collect');
        if (user.id !== localStorage.getItem(ID_KEY)) {
            const seen = store.get('inspectedCadets', {});
            if (!seen[id]) { seen[id] = true; store.set('inspectedCadets', seen); checkRewards(); }
        }
    }

    function refreshUI() {
        const user = getActiveUser();
        const navLabel = $('#nav-username-label'), createView = $('#create-account-view'), activeView = $('#active-profile-view');
        if (navLabel) navLabel.textContent = user ? user.username : 'Create Profile';

        // Keep the dashboard current, including after switching away from a profile
        if ($('#dashboard-page-view')?.classList.contains('is-active')) updateDashboardStats();

        // While the cloud profile is still loading, keep the background saved on this device
        if (user) PortalTheme.set(user.background || 'bg_default');
        else if (!localStorage.getItem(ID_KEY)) PortalTheme.set('bg_default');
        if (user) PortalCursor.set(!!getEquipped(user, 'cursor'));
        else if (!localStorage.getItem(ID_KEY)) PortalCursor.set(false);
        if (activeView) {
            const theme = PortalTheme.current();
            // classList (not className) keeps the equipped accent class
            [...activeView.classList].filter(c => c.startsWith('theme-')).forEach(c => activeView.classList.remove(c));
            activeView.classList.add(theme === 'bg_default' ? 'theme-default' : `theme-${theme}`);
        }
        if (!user) {
            if (createView) createView.style.display = 'block';
            if (activeView) activeView.style.display = 'none';
            // Quick picks for profiles that were used on this device
            const mine = dir.filter(u => PortalAccount.owned().includes(u.id));
            const picks = $('#device-profiles');
            if (picks) {
                picks.hidden = !mine.length;
                picks.innerHTML = mine.length ? `<span class="device-profiles-label">On this device:</span>` + mine.map(u =>
                    `<button type="button" class="device-profile" data-login-name="${esc(u.username)}"><img src="${esc(u.avatar)}" alt="">${esc(u.username)}</button>`).join('') : '';
            }
            renderDirectory();
            return;
        }
        if (createView) createView.style.display = 'none';
        if (activeView) activeView.style.display = 'block';

        $('#dash-avatar').innerHTML = `<img src="${esc(user.avatar)}" alt="Your avatar">`;
        $('#dash-username').textContent = user.username;
        $('#dash-rank').textContent = rankTitle(user.xp || 0);
        $('#dash-bio').textContent = user.bio || 'Ready to conquer the AI modules.';
        $('#profile-stats-row').innerHTML = `<div class="p-stat-box"><span class="p-stat-label">TOTAL XP</span><span class="p-stat-num" id="dash-xp">${num(user.xp)}</span></div>`
            + GAME_KEYS.map(k => `<div class="p-stat-box"><span class="p-stat-label">${GAMES[k].icon} ${GAMES[k].short.toUpperCase()}</span><span class="p-stat-num">${k === 'boss' ? (bossTime(user) ? fmtTime(bossTime(user)) : '—') : num(user.scores[k])}</span></div>`).join('');

        applyRewards(user);
        renderShop(user);
        renderInventory(user);
        showProfileTab(profileTab);

        renderDirectory();
    }

    function bind() {

        buildBoardTabs();
        let createAvatar = STARTER_AVATARS[0];
        $$('#create-avatar-picker .avatar-pick').forEach(btn => btn.addEventListener('click', () => {
            $$('#create-avatar-picker .avatar-pick').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            createAvatar = btn.dataset.avatar || createAvatar;
        }));

        $('#create-account-form').addEventListener('submit', async e => {
            e.preventDefault();
            const username = $('#new-username').value.trim(), bio = $('#new-bio').value.trim(), password = $('#new-password').value;
            if (!username) return;
            if (devMode()) { toast('Exit Developer Mode before creating a profile.', 'warn'); return; }
            if (password.length < 6) { toast('Choose a password with at least 6 characters.', 'warn'); return; }
            if (!cryptoReady()) { toast('Passwords need a secure (https) connection. Open the portal from its https address.', 'error'); return; }
            if (PortalSecurity.containsProfanity(username) || PortalSecurity.containsProfanity(bio)) { toast('Please choose an appropriate callsign and bio.', 'warn'); return; }
            if (dir.some(u => u.username.toLowerCase() === username.toLowerCase())) { toast('That callsign is taken. Try another one.', 'warn'); return; }
            // A brand-new profile starts from zero: no progress from earlier visitors carries over
            const user = { id: 'cadet_' + Date.now(), username, bio: bio || 'AI Explorer', avatar: createAvatar, background: 'bg_default', xp: 100, scores: {}, unlocks: ['bg_default'], equipped: {}, auth: await makeAuth(password) };
            GAME_KEYS.forEach(k => { user.scores[k] = 0; });
            toast(`Welcome aboard, ${username}!`, 'success');
            await saveThenLogIn(user);
        });

        $('#login-form').addEventListener('submit', async e => {
            e.preventDefault();
            const name = $('#login-username').value.trim().toLowerCase(), password = $('#login-password').value;
            const user = dir.find(u => u.username.toLowerCase() === name);
            const fail = () => toast('That callsign and password do not match.', 'warn');
            if (!user) return fail();
            const auth = user.auth;
            if (auth && typeof auth.salt === 'string' && typeof auth.hash === 'string') {
                if (!cryptoReady()) { toast('Passwords need a secure (https) connection. Open the portal from its https address.', 'error'); return; }
                if (await hashPassword(password, auth.salt) !== auth.hash) return fail();
                return PortalAccount.logIn(user.id);
            }
            // Profiles made before passwords existed can only be claimed on the device that made them.
            // The password typed now becomes the profile's password.
            if (!PortalAccount.owned().includes(user.id)) { toast('This older profile has no password and was not made on this device, so it cannot be claimed here.', 'warn'); return; }
            if (password.length < 6) { toast('This profile has no password yet. Type a new one (6+ characters) to set it.', 'warn'); return; }
            if (!cryptoReady()) { toast('Passwords need a secure (https) connection. Open the portal from its https address.', 'error'); return; }
            user.auth = await makeAuth(password);
            toast('Password set for this profile.', 'success');
            await saveThenLogIn(user);
        });

        $('#device-profiles').addEventListener('click', e => {
            const pick = e.target.closest('[data-login-name]');
            if (!pick) return;
            $('#login-username').value = pick.dataset.loginName;
            $('#login-password').focus();
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

        $('#btn-switch-profile').addEventListener('click', () => PortalAccount.logOut());

        $('#btn-edit-profile').addEventListener('click', e => {
            const box = $('#profile-edit'), open = box.hidden;
            box.hidden = !open;
            e.currentTarget.setAttribute('aria-expanded', open);
            e.currentTarget.textContent = open ? 'Close Editor' : 'Edit Profile';
            if (open) $('#edit-username-input').focus();
        });

        $('#profile-page').addEventListener('click', e => {
            const tab = e.target.closest('[data-ptab]');
            if (tab) {
                const jump = tab.dataset.shopJump;
                if (jump) { shopCat = jump; const u = getActiveUser(); if (u) renderShop(u); }
                showProfileTab(tab.dataset.ptab, tab.classList.contains('profile-tab'));
                if (!tab.classList.contains('profile-tab')) $('.profile-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
            }
            const cat = e.target.closest('[data-shop-cat]');
            if (cat) { shopCat = cat.dataset.shopCat; const u = getActiveUser(); if (u) renderShop(u); $(`[data-shop-cat="${shopCat}"]`)?.focus(); return; }
            const buyBtn = e.target.closest('[data-buy]'); if (buyBtn) return buy(buyBtn.dataset.buy);
            const eq = e.target.closest('[data-equip]'); if (eq) return equip(eq.dataset.equip);
            const rw = e.target.closest('[data-reward]'); if (rw) return toggleReward(rw.dataset.reward);
            const all = e.target.closest('[data-ultimate-all]'); if (all) return setUltimate(all.dataset.ultimateAll === 'on');
            const av = e.target.closest('[data-set-avatar]');
            if (av) { const u = getActiveUser(); if (u) { u.avatar = av.dataset.setAvatar; persist(u); toast('Avatar equipped.', 'success'); } }
        });
        // Arrow keys move between the profile tabs
        $('.profile-tabs')?.addEventListener('keydown', e => {
            if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
            const order = ['shop', 'inventory', 'leaderboard', 'review'];
            const i = (order.indexOf(profileTab) + (e.key === 'ArrowRight' ? 1 : order.length - 1)) % order.length;
            showProfileTab(order[i], true);
        });
        // Links elsewhere (dashboard, final exam) can open a specific profile panel
        document.addEventListener('click', e => {
            const target = e.target.closest('[data-ptab-target]');
            if (target) showProfileTab(target.dataset.ptabTarget);
        });
        // Clickable leaderboard rows, with keyboard support
        document.addEventListener('click', e => {
            const row = e.target.closest('[data-inspect]');
            if (row) openInspector(row.dataset.inspect);
        });
        document.addEventListener('keydown', e => {
            if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('[data-inspect]')) { e.preventDefault(); openInspector(e.target.dataset.inspect); }
        });
        $('#global-profile-search').addEventListener('input', renderDirectory);
        initSync();
    }

    return { bind, getActiveUser, getDirectory: () => dir, award, addXP, getEquipped, syncProfile, refresh: refreshUI, renderDashboardBoard, recordBossTime, topFor, bossTime, fmtTime };
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
        { k: ['computer vision', 'cnn', 'convolution', 'image recognition'], a: `Computer vision teaches computers to understand images and video. Convolutional Neural Networks (CNNs) slide small filters across pixels: early layers find edges, middle layers find textures, and deep layers assemble whole objects. Lesson 1.3 walks through it with tabs and a step-by-step view.` },
        { k: ['hallucinat'], a: `A hallucination is when an AI states something false or made-up in a confident tone. Language models predict likely words; they don't check facts. Always verify AI claims, especially citations, against trusted primary sources.` },
        { k: ['prompt', 'prompting', 'prompt engineering'], a: `A strong prompt has four parts: a Role ("Act as an AP Biology tutor"), a clear Task verb (summarize, compare, debug), Context and audience, and Format/Constraints (length, structure, tone). Vague prompts make the model guess. Lesson 2.1 has flip cards for each part and shows a prompt leveling up.` },
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
        { k: ['xp', 'badge', 'level up', 'points', 'shop', 'leaderboard'], a: `You earn XP for every correct quiz answer plus a bonus for completing a lesson for the first time. Spend XP in the Profile shop on avatars and backgrounds. Badges on the Dashboard (for lessons, modules, minigames, and perfect quiz scores) (for lessons, minigames, combos, and exploring) automatically unlock titles, animated avatar borders, theme accents, chat badges, and site-wide backgrounds that you can equip on your Profile. Click any player on a leaderboard to see their stats. Your best arcade scores appear on the leaderboard.` },
        { k: ['unit test', 'final exam', 'certificate', 'grandmaster', 'exam'], a: `Each module ends with a Unit Test: 12 multiple-choice questions plus 2 randomly chosen written responses (3 points each, scored against a rubric). You need 80% of the points to pass. After passing all six, the Final Exam unlocks, with 30 multiple-choice questions and 3 written responses. Score 80% or higher on it to earn your Certificate of Completion and the Grandmaster title, background, and cursor effect.` },
        { k: ['unlock', 'locked', 'pass', 'module'], a: `Each lesson ends with an arcade quiz. Answer 4 out of 5 correctly to complete the lesson. After all three lessons, pass the module's Unit Test with 80% or higher to unlock the next module.` },
        { k: ['game', 'arcade', 'combo', 'streak', 'boss'], a: `Lessons use eight quiz games: Rocket Space Defender, Block Blast, Pirate Cannon, Cyber Shield Defense, Neon Hover Runner, Sky Climb, the True God Scrappy Boss Battle, and Data Packet Catcher. Back-to-back right answers multiply your score up to x3 and unlock power-ups.` },
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
        const chat = role === 'user' ? Portal.getEquipped(Portal.getActiveUser(), 'chat') : null;
        if (chat) {
            const tag = document.createElement('span');
            tag.className = 'chat-badge msg-badge';
            tag.textContent = `${chat.icon} ${chat.name}`;
            el.prepend(tag);
        }
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
        store.set('questionsAsked', store.get('questionsAsked', 0) + 1);
        checkRewards();
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
// 8b. DEVELOPER MODE (password protected)
//     Unlocks every module, test, exam, reward and shop item for testing.
//     Progress goes to a throwaway sandbox and your profile is never saved,
//     so XP, scores and the leaderboards are not affected.
// ============================================================================
const DevMode = (() => {
    // SHA-256 of the developer password. To change it, run this in the browser console:
    //   crypto.subtle.digest('SHA-256', new TextEncoder().encode('new password')).then(b => console.log([...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('')))
    const PASSWORD_SHA256 = '7c9f9baba90bc8aa4b0d937da1b5b888524a8c7af2b13155bc97da55282b5779';
    const sha256 = async text => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))].map(b => b.toString(16).padStart(2, '0')).join('');

    function openPrompt() {
        if (devMode()) { PortalAccount.setDevMode(false); return; }
        const opener = document.activeElement;
        const overlay = document.createElement('div');
        overlay.className = 'inspect-overlay';
        overlay.innerHTML = `
            <form class="inspect-card dev-card" role="dialog" aria-modal="true" aria-labelledby="dev-title">
                <button type="button" class="inspect-close" aria-label="Close">✕</button>
                <h2 id="dev-title">🛠 Developer Mode</h2>
                <p>Unlocks every module, test, exam, reward and shop item. Nothing you do while it is on is saved to your profile or the leaderboards.</p>
                <label for="dev-password">Developer password</label>
                <input type="password" id="dev-password" autocomplete="off" required>
                <div class="exam-actions"><button type="submit" class="btn-cyan-primary">Unlock Everything</button></div>
            </form>`;
        document.body.appendChild(overlay);
        document.body.classList.add('modal-open');
        const close = () => {
            document.removeEventListener('keydown', onKey);
            document.body.classList.remove('modal-open');
            overlay.remove();
            opener?.focus?.({ preventScroll: true });
        };
        const onKey = e => { if (e.key === 'Escape') close(); };
        document.addEventListener('keydown', onKey);
        overlay.addEventListener('click', e => { if (e.target === overlay || e.target.closest('.inspect-close')) close(); });
        $('form', overlay).addEventListener('submit', async e => {
            e.preventDefault();
            const input = $('#dev-password', overlay);
            if (!(window.crypto && crypto.subtle)) { toast('Developer Mode needs a secure (https) connection.', 'error'); return; }
            if (await sha256(input.value) !== PASSWORD_SHA256) {
                toast('Incorrect developer password.', 'warn');
                input.value = '';
                input.focus();
                return;
            }
            PortalAccount.setDevMode(true);
        });
        $('#dev-password', overlay).focus();
    }

    function bind() {
        $('#dev-mode-btn')?.addEventListener('click', openPrompt);
        if (!devMode()) return;
        const btn = $('#dev-mode-btn');
        if (btn) btn.textContent = '🛠 Exit Developer Mode';
        const bar = document.createElement('div');
        bar.className = 'dev-banner';
        bar.setAttribute('role', 'status');
        bar.innerHTML = '<span>🛠 <strong>Developer Mode</strong>: everything unlocked · nothing is saved to your profile or the leaderboards</span><button type="button" class="btn-ghost">Exit</button>';
        $('button', bar).addEventListener('click', () => PortalAccount.setDevMode(false));
        document.body.appendChild(bar);
    }
    return { bind };
})();

// ============================================================================
// 9. INIT
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    DevMode.bind();
    renderModulesGrid();
    saveMaxUnlocked();
    syncRewards();   // on first run, records already-earned rewards without announcing them
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
        const play = e.target.closest('[data-arcade-play]');
        if (play) return launchArcadeGame(play.dataset.arcadePlay);
        if (e.target.closest('#preview-toggle')) {
            store.set('previewAll', !previewMode());
            renderModulesGrid();
            toast(previewMode() ? 'Preview mode on: all modules unlocked.' : 'Preview mode off.', 'info');
            return;
        }
        if (e.target.closest('#nav-profile-btn')) return showPage('profile');
        if (e.target.closest('#dash-continue')) location.hash = nextStepHash();
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