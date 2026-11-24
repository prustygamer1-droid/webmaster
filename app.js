// ============================================================================
// FIREBASE CONFIGURATION & INITIALIZATION
// ============================================================================
const firebaseConfig = {
  apiKey: "AIzaSyD1frKfVoVSqUk0HDyz2ygY_0oxmCCjMGA",
  authDomain: "ai-learning-portal-9c023.firebaseapp.com",
  projectId: "ai-learning-portal-9c023",
  storageBucket: "ai-learning-portal-9c023.firebasestorage.app",
  messagingSenderId: "257707620893",
  appId: "1:257707620893:web:567b9dc9505baa05e464f4"
};

// Initialize Firebase using compat syntax
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();


function loadModule(moduleId) {
    document.getElementById('active-module-content').innerHTML = modules[moduleId].content;
    document.body.classList.add('module-active');
}

function returnToHome() {
    document.getElementById('active-module-content').innerHTML = "";
    document.body.classList.remove('module-active');
}

window.checkNeuralAnswer = function(correct) {
    const result = document.getElementById("nn-result");
    if (!result) return;

    if (correct) {
        result.textContent = "✅ Correct! Neural networks process data from input to output through hidden layers.";
        result.style.background = "#16a34a";
    } else {
        result.textContent = "❌ Not quite. Review the article and try again.";
        result.style.background = "#dc2626";
    }
};


// 1.1 Spam Classifier Simulator
window.updateSpamSimulator = function() {
    const kw = parseFloat(document.getElementById('slider-kw')?.value) || 0;
    const links = parseFloat(document.getElementById('slider-links')?.value) || 0;

    const labelKw = document.getElementById('label-kw');
    const labelLinks = document.getElementById('label-links');
    if (labelKw) labelKw.innerText = kw;
    if (labelLinks) labelLinks.innerText = links;

    const score = (kw * 0.12 + links * 0.20).toFixed(2);
    const outputScore = document.getElementById('output-score');
    if (outputScore) outputScore.innerText = score;

    const badge = document.getElementById('output-badge');
    if (badge) {
        if (score >= 0.5) {
            badge.style.background = '#ef4444';
            badge.innerText = 'SPAM DETECTED';
        } else {
            badge.style.background = '#10b981';
            badge.innerText = 'LEGITIMATE (HAM)';
        }
    }
};

window.updateVisionSimulator = function() {
    const slider = document.getElementById('slider-res');
    const labelRes = document.getElementById('label-res');
    const outputConf = document.getElementById('output-conf');
    const statusBadge = document.getElementById('vision-status');
    const targetImage = document.getElementById('sim-target-image');

    if (!slider) return;

    const val = parseInt(slider.value);
    labelRes.textContent = val + '%';

    // Calculate dynamic blur: 100% clarity = 0px blur, 10% clarity = 12px blur
    const blurAmount = ((100 - val) / 100) * 12;
    if (targetImage) {
        targetImage.style.filter = `blur(${blurAmount}px)`;
    }

    // Calculate dynamic confidence score
    let confidence = Math.min(99.8, Math.max(15.0, (val * 0.95) + (Math.sin(val) * 3))).toFixed(1);
    outputConf.textContent = confidence + '%';

    // Update the status badge based on clarity thresholds
    if (val >= 75) {
        statusBadge.textContent = 'OBJECT VERIFIED';
        statusBadge.style.background = '#10b981'; // Green
        statusBadge.style.color = '#fff';
    } else if (val >= 40) {
        statusBadge.textContent = 'UNCERTAIN';
        statusBadge.style.background = '#f59e0b'; // Amber
        statusBadge.style.color = '#000';
    } else {
        statusBadge.textContent = 'LOW CONFIDENCE / RISK';
        statusBadge.style.background = '#ef4444'; // Red
        statusBadge.style.color = '#fff';
    }
};

let maxUnlockedModule = parseInt(localStorage.getItem('maxUnlockedModule')) || 1;

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initProgressTracking();
    initBadgeSystem();
    initChatbot();
    updateModuleLockUI();

    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        if (hash === 'modules' || hash === 'modules-grid') {
            showPage('modules-grid');
        } else if (hash === 'dashboard') {
            showPage('dashboard');
        } else if (hash === 'home') {
            showPage('home');
        }
    }
});

function initNavbar() {
    const links = document.querySelectorAll('.navbar .nav-links a, nav a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

window.showPage = function(pageId) {
    const homeView = document.getElementById('home-page-view');
    const modulesGridView = document.getElementById('modules-grid-view');
    const modulesPageView = document.getElementById('modules-page-view');
    const dashboardView = document.getElementById('dashboard-page-view');
    const referencesView = document.getElementById('references-page-view');
    const profileView = document.getElementById('profile-page');

    // Hide all main page views
    if (homeView) homeView.style.display = 'none';
    if (modulesGridView) modulesGridView.style.display = 'none';
    if (modulesPageView) modulesPageView.style.display = 'none';
    if (dashboardView) dashboardView.style.display = 'none';
    if (referencesView) referencesView.style.display = 'none';
    if (profileView) profileView.style.display = 'none';

    // Show the requested view
    if (pageId === 'modules-grid' || pageId === 'modules') {
        if (modulesGridView) {
            modulesGridView.style.display = 'block';
            if (typeof updateModuleLockUI === 'function') updateModuleLockUI();
        }
    } else if (pageId === 'home') {
        if (homeView) homeView.style.display = 'block';
    } else if (pageId === 'dashboard') {
        if (dashboardView) {
            dashboardView.style.display = 'block';
            if (typeof updateDashboardStats === 'function') updateDashboardStats();
        }
    } else if (pageId === 'references-page-view' || pageId === 'references') {
        if (referencesView) referencesView.style.display = 'block';
    } else if (pageId === 'profile-page' || pageId === 'profile') {
        if (profileView) {
            profileView.style.display = 'block';
            // Trigger profile UI refresh if the IIFE function exposes it or listens to DOM changes
        }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

function updateDashboardStats() {
    const unlocked = maxUnlockedModule - 1;
    const totalModules = 6;
    const progressPercent = Math.min(Math.round((unlocked / totalModules) * 100), 100);
    const xpPoints = unlocked * 150;

    const percentText = document.getElementById('dashboard-progress-percent');
    const fillBar = document.getElementById('dashboard-progress-fill');
    const xpText = document.getElementById('dashboard-xp-text');
    const modCount = document.getElementById('dashboard-modules-count');

    if (percentText) percentText.textContent = `${progressPercent}%`;
    if (fillBar) fillBar.style.width = `${progressPercent}%`;
    if (xpText) xpText.textContent = `${xpPoints} XP`;
    if (modCount) modCount.textContent = `${unlocked} / ${totalModules}`;

    for (let i = 1; i <= 9; i++) {
        const badge = document.getElementById(`badge-${i}`);
        if (badge) {
            let isUnlocked = false;
            if (i <= 6) {
                isUnlocked = unlocked >= i;
            } else if (i === 7) {
                isUnlocked = unlocked >= 3;
            } else if (i === 8) {
                isUnlocked = unlocked >= 2;
            } else if (i === 9) {
                isUnlocked = unlocked >= 6;
            }

            if (isUnlocked) {
                badge.style.opacity = '1';
                badge.style.borderColor = '#00f2fe';
                badge.style.background = 'rgba(0, 242, 254, 0.1)';
                badge.style.boxShadow = '0 0 15px rgba(0,242,254,0.3)';
            } else {
                badge.style.opacity = '0.35';
                badge.style.borderColor = '#3f3f46';
                badge.style.background = '#181824';
                badge.style.boxShadow = 'none';
            }
        }
    }
}

window.navigateToModule = function(moduleId) {
    if (moduleId > maxUnlockedModule) {
        alert(`Module ${moduleId} is locked! Complete Module ${moduleId - 1} first to unlock it.`);
        return;
    }
    window.loadModulePageContent(moduleId, 1);
    
    const homeView = document.getElementById('home-page-view');
    const modulesGridView = document.getElementById('modules-grid-view');
    const modulesPageView = document.getElementById('modules-page-view');
    const dashboardView = document.getElementById('dashboard-page-view');

    if (homeView) homeView.style.display = 'none';
    if (modulesGridView) modulesGridView.style.display = 'none';
    if (dashboardView) dashboardView.style.display = 'none';
    if (modulesPageView) modulesPageView.style.display = 'block';

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

function updateModuleLockUI() {
    for (let i = 1; i <= 6; i++) {
        const btn = document.getElementById(`btn-module-${i}`);
        const card = document.getElementById(`card-module-${i}`);

        if (btn) {
            if (i <= maxUnlockedModule) {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
                btn.style.background = '#2563eb';
                btn.innerHTML = 'Explore Module';
                if (card) card.style.border = '1px solid #3b82f6';
            } else {
                btn.disabled = true;
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
                btn.style.background = '#1e1e2e';
                btn.innerHTML = '🔒 Locked';
                if (card) card.style.border = '1px solid #27272a';
            }
        }
    }
}

// Submodules detailed lesson data for all 6 modules
const moduleLessons = {
    1: {
        title: "Module 1: Fundamental AI Concepts",
        submodules: {
            1: {
                title: "1.1 Machine Learning Fundamentals",
                type: "rocket",
                content: `
                    <div class="lesson-article-container">
                        
                        <!-- Article Header -->
                        <div class="article-header">
                            <span class="article-badge">Core Concept Article</span>
                            <h2>Demystifying Machine Learning</h2>
                            <p>An exciting journey into how computers stop following rigid rules and start learning from experience just like humans do.</p>
                        </div>

                        <!-- Section 1 -->
                        <h3>1. The Big Shift: Traditional Coding vs. Machine Learning</h3>
                        <p>
                            For a long time, writing computer software meant giving a computer strict, step-by-step instructions. If a programmer wanted to build a spam filter for an email inbox, they had to sit down and write thousands of manual rules by hand—such as <code>IF message contains "WINNER" AND sender is unknown THEN mark as spam</code>. While this works for simple tasks, it totally falls apart in the real world where language changes constantly, pictures look different every time, and new tricks pop up every single day.
                        </p>
                        <p>
                            <strong>Machine Learning (ML)</strong> completely flips this script. Instead of forcing human programmers to invent every single rule, engineers feed the computer massive amounts of examples and correct answers. The computer then looks at the data, figures out patterns all on its own, and creates its own rules to make smart guesses about new things it has never seen before.
                        </p>

                        <img src="images/Module1Image.jpg" alt="Comparison diagram showing traditional programming versus machine learning data flow" class="content-lesson-img">

                        <!-- Callout Box -->
                        <div class="article-callout">
                            <h4>Key Takeaway</h4>
                            <p>
                                Traditional programming is like teaching someone a recipe step-by-step; Machine Learning is like showing someone hundreds of pictures of food until they learn how to cook on their own.
                            </p>
                        </div>

                        <!-- Section 2 -->
                        <h3>2. The Four Core Pillars of Machine Learning</h3>
                        <p>
                            To solve different kinds of problems and build powerful technologies, computer scientists divide machine learning into four fundamental pillars. Each one handles data and challenges in a unique way:
                        </p>

                        <!-- Stacked Row Format (A, B, C, D) -->
                        <div class="paradigms-stack">
                            <div class="paradigm-row-card">
                                <h4>A. Supervised Learning</h4>
                                <p>
                                    Think of this like learning with a teacher checking your homework. The computer is given practice questions that already have the correct answers attached. It practices over and over until it can solve new, unreleased problems accurately. Common examples include email spam filters and apps that predict house prices.
                                </p>
                            </div>

                            <div class="paradigm-row-card">
                                <h4>B. Unsupervised Learning</h4>
                                <p>
                                    Think of this like exploring a messy room with no guide. The computer is given a pile of completely unlabeled data and has to find hidden groups, patterns, or similarities on its own. Stores use this to group shoppers with similar buying habits into categories.
                                </p>
                            </div>

                            <div class="paradigm-row-card">
                                <h4>C. Reinforcement Learning</h4>
                                <p>
                                    Think of this like playing a video game through trial and error. An AI agent takes actions in an environment, earning points for good moves and losing points for mistakes. Over time, it figures out the best strategy to win. This is how self-driving cars and robot arms learn to navigate.
                                </p>
                            </div>

                            <div class="paradigm-row-card">
                                <h4>D. Deep Learning & Neural Networks</h4>
                                <p>
                                    Inspired by the human brain, deep learning uses multi-layered artificial neural networks to process complex data. This is the advanced engine behind modern breakthroughs like facial recognition, voice assistants, and generative AI art tools.
                                </p>
                            </div>
                        </div>

                        <img src="images/Module1Image1.1.jpg" alt="Illustration of the four machine learning paradigms with icons and brief descriptions" class="content-lesson-img">
                        
                        <!-- Interactive Simulator Widget 1.1 -->
                        <div class="simulator-box">
                            <div class="simulator-header">
                                <span class="sim-icon">🔬</span>
                                <div>
                                    <h4>Interactive Model Simulator: Supervised Spam Classifier</h4>
                                    <p>Adjust the sliders below to see how a live AI calculates threat probabilities in real time!</p>
                                </div>
                            </div>

                            <div class="slider-wrapper">
                                <div class="slider-label-row">
                                    <span>Trigger Words Count ("Win", "Free", "Urgent"):</span>
                                    <span id="label-kw" class="highlight-val">3</span>
                                </div>
                                <input type="range" id="slider-kw" min="0" max="10" value="3" oninput="window.updateSpamSimulator()">
                            </div>

                            <div class="slider-wrapper">
                                <div class="slider-label-row">
                                    <span>Suspicious External Links Count:</span>
                                    <span id="label-links" class="highlight-val">2</span>
                                </div>
                                <input type="range" id="slider-links" min="0" max="5" value="2" oninput="window.updateSpamSimulator()">
                            </div>

                            <div class="simulator-output-row">
                                <div>
                                    <span class="output-title">Calculated Probability Score:</span>
                                    <span id="output-score">0.65</span>
                                </div>
                                <div id="output-badge" class="spam-badge-pill">
                                    SPAM DETECTED
                                </div>
                            </div>
                        </div>

                    </div>
                `
            },
            2: {
                title: "1.2 Neural Networks & Deep Learning",
                type: "blockblast",
                content: `
                    <div class="lesson-article-container">
                        <div class="article-header">
                            <span class="article-badge neural-badge">
                                Deep Learning
                            </span>
                            <h2>Neural Networks & Modern AI Systems</h2>
                            <p>
                                Learn how neural networks process information,
                                recognize patterns, and power today's advanced
                                AI systems such as ChatGPT and image generators.
                            </p>
                        </div>

                        <br><br>

                        <div class="article-callout article-reading-card">
                            <h4>📖 Required Reading</h4>
                            <p>
                                Read IBM's explanation of Neural Networks before
                                completing the activity below.
                            </p>
                            <div class="external-article-card">
                                <div>
                                    <div class="source-label">
                                        IBM Technology
                                    </div>
                                    <div class="article-title">
                                        What Are Neural Networks?
                                    </div>
                                    <div class="article-subtitle">
                                        External educational article
                                    </div>
                                </div>
                                <a
                                    class="read-article-btn"
                                    href="https://www.ibm.com/topics/neural-networks"
                                    target="_blank"
                                >
                                    Read Article →
                                </a>
                            </div>
                        </div>

                        <br><br>

                        <h3>Focus Questions</h3>

                        <ul class="focus-list">
                            <li>What is an artificial neuron?</li>
                            <li>What are weights and biases?</li>
                            <li>What is an activation function?</li>
                            <li>Why do neural networks need hidden layers?</li>
                            <li>How do neural networks learn?</li>
                        </ul>

                        <br><br>

                        <div class="simulator-box neural-panel">
                            <div class="simulator-header">
                                <span class="sim-icon">🧠</span>
                                <div>
                                    <h4>Knowledge Check</h4>
                                    <p>
                                        Select the correct neural network architecture.
                                    </p>
                                </div>
                            </div>

                            <br>

                            <button
                                class="nn-option"
                                onclick="checkNeuralAnswer(true)"
                            >
                                Input Layer → Hidden Layer →
                                Activation Function → Output Layer
                            </button>

                            <br><br>

                            <button
                                class="nn-option"
                                onclick="checkNeuralAnswer(false)"
                            >
                                Hidden Layer → Input Layer →
                                Output Layer
                            </button>

                            <br><br>

                            <button
                                class="nn-option"
                                onclick="checkNeuralAnswer(false)"
                            >
                                Output Layer → Hidden Layer →
                                Input Layer
                            </button>

                            <br><br>

                            <button
                                class="nn-option"
                                onclick="checkNeuralAnswer(false)"
                            >
                                Activation Function → Output Layer →
                                Input Layer
                            </button>

                            <br><br>

                            <div
                                id="nn-result"
                                class="nn-result"
                            >
                                Select an answer above.
                            </div>
                        </div>

                        <br><br>

                        <div class="article-callout">
                            <h4>🎮 BlockBlast Challenge</h4>
                            <p>
                                After completing the knowledge check,
                                continue to the BlockBlast activity to
                                reinforce what you've learned.
                            </p>
                        </div>
                    </div>
                `
            },
            3: {
                title: "1.3 Computer Vision & Generative AI Risks",
                type: "angrybirds",
                content: `
                    <div class="lesson-article-container">
                        
                        <!-- Article Header -->
                        <div class="article-header">
                            <span class="article-badge" style="background: rgba(52, 211, 153, 0.1); color: #34d399; border-color: #34d399;">Vision & Reliability</span>
                            <h2>Computer Vision & Generative Hallucinations</h2>
                            <p>Analyzing how machines interpret pixel data, exploring feature extraction, and examining the critical reliability risks of generative AI hallucinations.</p>
                        </div>

                        <br><br>

                        <!-- Section 1 -->
                        <h3>1. Computer Vision (CV) Fundamentals</h3>
                        <p>
                            Computer Vision is a subfield of artificial intelligence that trains computers to extract high-level semantic understanding from digital images, video feeds, and multi-dimensional sensor arrays. Unlike humans—who instantly recognize a face or a road sign—a computer processes a massive grid of multi-channel numerical matrix values (RGB values ranging from 0 to 255 per pixel).
                        </p>
                        <p>
                            To bridge this gap, CV systems utilize specialized architectures called <strong>Convolutional Neural Networks (CNNs)</strong>. CNNs slide mathematical filters (called kernels) across pixel grids layer by layer:
                        </p>
                        
                        <ul class="focus-list" style="margin-bottom: 20px;">
                            <li><strong>Early Layers:</strong> Detect basic geometric traits like sharp edges, horizontal lines, and color gradients.</li>
                            <li><strong>Middle Layers:</strong> Combine edges to recognize textures, curves, and patterns (like fur texture or tire treads).</li>
                            <li><strong>Deep Layers:</strong> Assemble features into complete objects (like a cat, a pedestrian, or a traffic light).</li>
                        </ul>

                        <div class="article-callout">
                            <h4>🚗 Real-World Impact</h4>
                            <p>
                                From autonomous vehicle lane detection and facial recognition to medical MRI scan tumor segmentation, computer vision transforms raw optical matrix data into life-saving automated decisions.
                            </p>
                        </div>

                        <br><br>

                        <!-- Section 2 -->
                        <h3>2. Generative Model Hallucinations</h3>
                        <p>
                            As generative AI models become a standard part of software toolkits, understanding their failure modes is crucial. One of the most prominent risks is the <strong>hallucination phenomenon</strong>, where an AI model generates factually incorrect, nonsensical, or entirely fabricated information while maintaining an authoritative, highly confident tone.
                        </p>
                        <p>
                            Because generative language models predict the next most statistically likely token based on training correlations rather than performing logical truth verification, they can easily invent fake academic citations, non-existent historical events, or buggy code snippets. Cross-referencing primary human sources is therefore mandatory in professional and academic environments.
                        </p>

                        <br><br>

                        <!-- Section 3 -->
                        <h3>3. Edge Cases & Adversarial Vulnerabilities</h3>
                        <p>
                            Computer vision systems are also vulnerable to <strong>adversarial attacks</strong>—tiny, human-imperceptible pixel modifications that trick neural networks into misclassifying objects entirely. For example, placing a tiny, inconspicuous sticker on a stop sign can cause an autonomous vehicle's vision model to classify it as a 45 MPH speed limit sign, proving that AI pattern recognition operates very differently from human cognitive reasoning.
                        </p>

                        <br><br>

                        <!-- Interactive Simulator Widget 1.3 (Upgraded with Visual Blur/Sharpness Preview) -->
                        <div class="simulator-box" style="background: #161625; border: 1px solid rgba(52, 211, 153, 0.3); border-radius: 12px; padding: 30px;">
                            <div class="simulator-header" style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                                <span class="sim-icon" style="font-size: 32px;">🎯</span>
                                <div>
                                    <h4 style="color: #00f2fe; margin: 0 0 5px 0; font-family: 'Orbitron', sans-serif;">Interactive Simulator: Object Detection Confidence</h4>
                                    <p style="color: #aaa; margin: 0; font-size: 14px;">Adjust image resolution clarity to evaluate how pixel quality affects model classification confidence.</p>
                                </div>
                            </div>

                            <img id="sim-target-image" src="images/NYC.jpg" alt="Target Object" style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 8px; margin-bottom: 20px; filter: blur(3px); transition: filter 0.2s ease; display: block;">
                            <div class="slider-wrapper" style="margin-bottom: 20px;">
                                <div class="slider-label-row" style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
                                    <span>Image Resolution Clarity:</span>
                                    <span id="label-res" class="highlight-val" style="color: #34d399; font-weight: bold;">50%</span>
                                </div>
                                <input type="range" id="slider-res" min="10" max="100" value="50" oninput="window.updateVisionSimulator()" style="width: 100%; accent-color: #34d399; cursor: pointer;">
                            </div>

                            <div class="simulator-output-row" style="display: flex; justify-content: space-between; align-items: center; background: #0b0f19; padding: 15px 20px; border-radius: 8px;">
                                <div>
                                    <span class="output-title" style="color: #aaa; font-size: 13px; display: block;">Model Detection Confidence:</span>
                                    <span id="output-conf" style="font-size: 20px; font-weight: bold; color: #fff;">65.4%</span>
                                </div>
                                <div id="vision-status" class="spam-badge-pill" style="background: #f59e0b; color: #000; padding: 6px 14px; border-radius: 20px; font-weight: bold; font-size: 12px; letter-spacing: 0.5px;">
                                    UNCERTAIN
                                </div>
                            </div>
                        </div>

                    </div>
                `
            }
        }
    },
    2: {
        title: "Module 2: Practical AI Tools & Techniques",
        submodules: {
            1: {
                title: "2.1 Foundational Prompt Engineering",
                type: "rocket",
                content: `
                    <h3>Designing Effective Prompts</h3>
                    <p>Prompt engineering structures textual instructions to guide LLMs toward optimal accuracy, structure, and tone using role, context, and constraints.</p>
                `
            },
            2: {
                title: "2.2 Advanced Reasoning Frameworks",
                type: "blockblast",
                content: `
                    <h3>Chain-of-Thought (CoT) Prompting</h3>
                    <p>Instructing an LLM to "think step-by-step" generates intermediate reasoning steps, significantly reducing logic errors in multi-step problems.</p>
                `
            },
            3: {
                title: "2.3 Hyperparameters & Fact Verification",
                type: "angrybirds",
                content: `
                    <h3>Understanding Model Temperature</h3>
                    <p>Temperature controls output randomness: Low temperature yields deterministic answers, while high temperature promotes creative outputs.</p>
                `
            }
        }
    },
    3: {
        title: "Module 3: Ethical AI Usage & Academic Integrity",
        submodules: {
            1: {
                title: "3.1 Academic Citation & Citing Standards",
                type: "rocket",
                content: `
                    <h3>Responsible Student Usage</h3>
                    <p>GenAI tools serve as effective study aids when properly documented and cited according to institutional academic integrity standards.</p>
                `
            },
            2: {
                title: "3.2 Algorithmic Bias & Data Privacy",
                type: "blockblast",
                content: `
                    <h3>Understanding Dataset Bias</h3>
                    <p>AI models reflect historical human biases present in training datasets. Proactive filtering prevents perpetuating unfair discrimination.</p>
                `
            },
            3: {
                title: "3.3 Deepfakes & Copyright Compliance",
                type: "angrybirds",
                content: `
                    <h3>Synthetic Media Risks</h3>
                    <p>Generative audio and video synthesis (Deepfakes) pose threats to digital trust. Students must evaluate content authenticity.</p>
                `
            }
        }
    },
    4: {
        title: "Module 4: Data & Training Pipelines",
        submodules: {
            1: {
                title: "4.1 Data Cleaning & Preprocessing",
                type: "rocket",
                content: `
                    <h3>Garbage In, Garbage Out</h3>
                    <p>Data preprocessing ensures raw data is free of missing values, outliers, and formatting errors before training machine learning models.</p>
                `
            },
            2: {
                title: "4.2 Training vs Test Splits",
                type: "blockblast",
                content: `
                    <h3>Preventing Overfitting</h3>
                    <p>Splitting datasets into training, validation, and test sets ensures models generalize well to unseen real-world data rather than memorizing answers.</p>
                `
            },
            3: {
                title: "4.3 Feature Engineering",
                type: "angrybirds",
                content: `
                    <h3>Extracting Meaningful Signals</h3>
                    <p>Feature engineering transforms raw variables into informative representations that highlight essential patterns for algorithms.</p>
                `
            }
        }
    },
    5: {
        title: "Module 5: Advanced Ethics & Governance",
        submodules: {
            1: {
                title: "5.1 Algorithmic Fairness & Transparency",
                type: "rocket",
                content: `
                    <h3>Explainable AI (XAI)</h3>
                    <p>Ensuring AI decisions can be audited and understood by humans prevents discriminatory outcomes in critical areas like hiring and loans.</p>
                `
            },
            2: {
                title: "5.2 Copyright & IP Compliance",
                type: "blockblast",
                content: `
                    <h3>Respecting Intellectual Property</h3>
                    <p>Understanding licensing terms and fair use policies when training or utilizing generative outputs safeguards creative works.</p>
                `
            },
            3: {
                title: "5.3 Safety Protocols & Guardrails",
                type: "angrybirds",
                content: `
                    <h3>Content Filtering & Alignment</h3>
                    <p>Guardrails prevent harmful or toxic outputs, ensuring safe interactions for student users across educational platforms.</p>
                `
            }
        }
    },
    6: {
        title: "Module 6: Testing & Evaluation",
        submodules: {
            1: {
                title: "6.1 Benchmark Testing & Metrics",
                type: "rocket",
                content: `
                    <h3>Evaluating Model Performance</h3>
                    <p>Using precision, recall, F1-score, and benchmark datasets allows developers to objectively measure AI accuracy.</p>
                `
            },
            2: {
                title: "6.2 Model Alignment & Reinforcement",
                type: "blockblast",
                content: `
                    <h3>RLHF (Reinforcement Learning from Human Feedback)</h3>
                    <p>Aligning AI behaviors with human values and safety standards ensures helpful and harmless responses.</p>
                `
            },
            3: {
                title: "6.3 Future Horizons of AI",
                type: "angrybirds",
                content: `
                    <h3>Responsible Innovation</h3>
                    <p>As AI technology evolves rapidly, students and developers must balance innovation with societal responsibility and robust testing.</p>
                `
            }
        }
    }
};

window.loadModulePageContent = function(moduleId, subId = 1) {
    const mod = moduleLessons[moduleId] || moduleLessons[1];
    const sub = mod.submodules[subId] || mod.submodules[1];
    const container = document.getElementById('active-module-content');

    if (container) {
        let subTabsHTML = '';
        for (let key in mod.submodules) {
            const isCurrent = parseInt(key) === parseInt(subId);
            subTabsHTML += `
                <button onclick="loadModulePageContent(${moduleId}, ${key})" style="padding: 10px 18px; background: ${isCurrent ? '#2563eb' : '#1e1e2e'}; color: #fff; border: 1px solid ${isCurrent ? '#60a5fa' : '#3f3f46'}; border-radius: 6px; cursor: pointer; font-weight: bold; font-family: inherit;">
                    Lesson ${moduleId}.${key}
                </button>
            `;
        }

        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #27272a; padding-bottom: 15px;">
                <div>
                    <span style="color: #60a5fa; font-weight: bold; font-size: 14px; text-transform: uppercase;">Module ${moduleId} Overview</span>
                    <h1 style="color: #ffffff; margin: 5px 0 0 0; font-size: 28px; font-family: 'Orbitron', sans-serif;">${mod.title}</h1>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; margin-bottom: 25px; flex-wrap: wrap;">
                ${subTabsHTML}
            </div>

            <div style="background: #181824; border: 1px solid #2d2d42; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                <h2 style="color: #00f2fe; margin-top: 0; font-family: 'Orbitron', sans-serif;">${sub.title}</h2>
                <div class="lesson-body" style="line-height: 1.8; font-size: 15px; color: #e5e7eb;">
                    ${sub.content}
                </div>
            </div>

            <div style="background: #1e1e2e; padding: 25px; border-radius: 8px; text-align: center; border: 1px solid #3b82f6;">
                <h3 style="margin-top: 0; color: #fff; font-size: 20px; font-family: 'Orbitron', sans-serif;">Ready to Play Arcade Challenge ${moduleId}.${subId}?</h3>
                <p style="color: #aaa; margin-bottom: 20px;">Review rules, answer questions correctly for power-ups and block shapes, and score high!</p>
                <button onclick="startArcadeQuiz(${moduleId}, ${subId})" style="background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%); color: #000; border: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 17px; box-shadow: 0 4px 15px rgba(0,242,254,0.4); font-family: 'Orbitron', sans-serif;">
                    🎮 Launch Minigame Quiz ${moduleId}.${subId}
                </button>
            </div>
        `;
    }
};

// Submodules Quiz Questions Database for all modules
const arcadeQuizDB = {
    "1.1": [
        { question: "What is Machine Learning?", options: ["A) Hardcoded manual IF-THEN rules", "B) Systems learning statistical patterns from data", "C) Fast CPU hardware optimization", "D) Exact copy of biological brain networks"], correct: 1 },
        { question: "Which ML paradigm uses labeled input-output training pairs?", options: ["A) Supervised Learning", "B) Unsupervised Clustering", "C) Reinforcement Learning", "D) Evolutionary Sorting"], correct: 0 },
        { question: "In Unsupervised Learning, what does the model discover?", options: ["A) Teacher labels", "B) Natural clusters and underlying data patterns", "C) Game action rewards", "D) Syntax errors"], correct: 1 },
        { question: "What powers Reinforcement Learning agents?", options: ["A) Handcoded spreadsheets", "B) Trial-and-error feedback rewards", "C) Image blur filters", "D) Unlabeled text files"], correct: 1 },
        { question: "Why is Machine Learning preferred over explicit programming for complex tasks?", options: ["A) ML uses zero memory", "B) Data patterns are too complex for manual rules", "C) Computers don't require power for ML", "D) It guarantees zero errors"], correct: 1 }
    ],
    "1.2": [
        { question: "Which layer in an Artificial Neural Network extracts feature representations?", options: ["A) Input layer", "B) Hidden layers", "C) Output layer", "D) Storage buffer"], correct: 1 },
        { question: "What architecture powers modern Large Language Models?", options: ["A) Decision Trees", "B) Convolutional Neural Networks", "C) Transformers", "D) Relational Hash Tables"], correct: 2 },
        { question: "What mechanism allows Transformers to process full sentence context simultaneously?", options: ["A) Self-Attention", "B) Sequential looping", "C) Manual indexing", "D) Disk cache"], correct: 0 },
        { question: "Deep Learning refers to neural networks with:", options: ["A) Zero layers", "B) Multiple processing hidden layers", "C) Single inputs only", "D) Manual IF statements"], correct: 1 },
        { question: "What are the building blocks of Artificial Neural Networks inspired by?", options: ["A) Microchip transistors", "B) Biological brain neurons", "C) Fiber optic cables", "D) Binary switches"], correct: 1 }
    ],
    "1.3": [
        { question: "What is Computer Vision primarily used for?", options: ["A) Processing audio signals", "B) Analyzing visual data and digital images", "C) Styling CSS layouts", "D) Database indexing"], correct: 1 },
        { question: "What is a 'hallucination' in generative AI?", options: ["A) Hardware overheating", "B) Confident but factually false outputs", "C) High-speed streaming", "D) Memory leaks"], correct: 1 },
        { question: "How should users verify generative AI research outputs?", options: ["A) Never verify", "B) Cross-check with trusted primary sources", "C) Trust blindly", "D) Clear browser cache"], correct: 1 },
        { question: "Which neural network type is heavily used in traditional computer vision?", options: ["A) Convolutional Neural Networks (CNNs)", "B) Decision Forests", "C) Bubble Sort", "D) SQL queries"], correct: 0 },
        { question: "Generative AI models create new text and media based on:", options: ["A) Explicit human memory", "B) Probabilistic patterns learned from training data", "C) Random guesses", "D) Hard drive serial numbers"], correct: 1 }
    ],
    "2.1": [
        { question: "What is prompt engineering?", options: ["A) Typing fast on keyboards", "B) Structuring text instructions to guide LLMs effectively", "C) Fixing computer hardware", "D) Compiling C++ code"], correct: 1 },
        { question: "Which components make up a robust prompt?", options: ["A) Role, Context, Constraints", "B) Random numbers only", "C) Only font styles", "D) Binary code"], correct: 0 },
        { question: "Why specify constraints in prompts?", options: ["A) To slow down the model", "B) To limit output length, format, and tone", "C) To cause errors", "D) To save electricity"], correct: 1 },
        { question: "What does assigning a 'role' do?", options: ["A) Nothing", "B) Frames the LLM's perspective and expertise", "C) Deletes files", "D) Changes screen resolution"], correct: 1 },
        { question: "Effective prompt design leads to:", options: ["A) Better accuracy and relevant outputs", "B) Computer crashes", "C) Slower internet", "D) Blank screens"], correct: 0 }
    ],
    "2.2": [
        { question: "What is Chain-of-Thought (CoT) prompting?", options: ["A) Linking computer monitors", "B) Instructing models to think step-by-step", "C) Deleting cache", "D) Encrypting databases"], correct: 1 },
        { question: "When is CoT most useful?", options: ["A) Multi-step logic and math problems", "B) Single letter typing", "C) Turning off power", "D) Changing wallpapers"], correct: 0 },
        { question: "How does step-by-step reasoning help?", options: ["A) Increases errors", "B) Reduces logic errors by exposing intermediate steps", "C) Adds viruses", "D) Slows CPU"], correct: 1 },
        { question: "CoT prompting encourages the model to:", options: ["A) Guess randomly", "B) Reason through problems before final answers", "C) Shut down", "D) Print text"], correct: 1 },
        { question: "In reasoning frameworks, transparency in logic:", options: ["A) Matters", "B) Helps verify correctness", "C) Is ignored", "D) Prevents execution"], correct: 1 }
    ],
    "2.3": [
        { question: "What does model temperature control?", options: ["A) Room air conditioning", "B) Output randomness and creativity", "C) CPU fan speed", "D) Monitor brightness"], correct: 1 },
        { question: "Low temperature yields:", options: ["A) Deterministic and predictable answers", "B) Complete gibberish", "C) Infinite loops", "D) Random colors"], correct: 0 },
        { question: "High temperature promotes:", options: ["A) Creative and varied outputs", "B) Strict exactness", "C) System freezes", "D) Zero output"], correct: 0 },
        { question: "Why is fact verification necessary?", options: ["A) Models never make mistakes", "B) To catch potential hallucinations", "C) It is optional", "D) To delete data"], correct: 1 },
        { question: "Primary sources for verification include:", options: ["A) Random forum comments", "B) Peer-reviewed journals and official docs", "C) Video games", "D) Blank notes"], correct: 1 }
    ],
    "3.1": [
        { question: "How should students use GenAI responsibly?", options: ["A) As a study aid with proper documentation and citation", "B) To copy homework directly without review", "C) To hack websites", "D) To hide sources"], correct: 0 },
        { question: "Academic integrity requires:", options: ["A) Transparency and citing AI assistance", "B) Complete secrecy", "C) Changing font colors", "D) Deleting citations"], correct: 0 },
        { question: "Proper citation standards prevent:", options: ["A) Plagiarism and academic dishonesty", "B) Good grades", "C) Fast learning", "D) Software updates"], correct: 0 },
        { question: "GenAI tools serve best as:", options: ["A) Collaborative study aids and brainstorm partners", "B) Replacement for thinking", "C) Automatic test takers", "D) Homework ghostwriters"], correct: 0 },
        { question: "Institutional guidelines dictate:",options: ["A) How AI tools may be referenced in research", "B) Computer passwords", "C) Cafeteria menus", "D) Sports schedules"], correct: 0 }
    ],
    "3.2": [
        { question: "What causes dataset bias?", options: ["A) Historical human prejudices present in training data", "B) Perfect math formulas", "C) Clean hardware", "D) Fast networks"], correct: 0 },
        { question: "Why is proactive filtering important?", options: ["A) To prevent perpetuating unfair discrimination", "B) To increase file size", "C) To slow down AI", "D) To change colors"], correct: 0 },
        { question: "Data privacy in AI involves:", options: ["A) Protecting sensitive personal user information", "B) Sharing passwords publicly", "C) Deleting all files", "D) Printing documents"], correct: 0 },
        { question: "Biased training data leads to:", options: ["A) Unfair model predictions", "B) Perfect accuracy", "C) Zero errors", "D) Faster rendering"], correct: 0 },
        { question: "Ethical AI development requires:", options: ["A) Diverse datasets and fairness audits", "B) Ignoring user feedback", "C) Hiding code", "D) Random guessing"], correct: 0 }
    ],
    "3.3": [
        { question: "What are Deepfakes?", options: ["A) Synthetic audio and video generated by AI", "B) Deep ocean trenches", "C) Computer virus scans", "D) Database tables"], correct: 0 },
        { question: "Synthetic media poses threats to:", options: ["A) Digital trust and authenticity", "B) Keyboard durability", "C) Screen resolution", "D) Wi-Fi speed"], correct: 0 },
        { question: "Students must evaluate media by:", options: ["A) Checking authenticity and reliable sources", "B) Believing everything instantly", "C) Sharing immediately", "D) Deleting browsers"], correct: 0 },
        { question: "Copyright compliance ensures:", options: ["A) Original creators' rights are respected", "B) Free downloads of movies", "C) Faster downloads", "D) Zero rules"], correct: 0 },
        { question: "Detecting synthetic media requires:", options: ["A) Critical thinking and verification tools", "B) Closing eyes", "C) Turning off computers", "D) Ignoring media"], correct: 0 }
    ],
    "4.1": [
        { question: "What is data preprocessing?", options: ["A) Cleaning and formatting raw data before training", "B) Printing reports", "C) Buying new mice", "D) Playing games"], correct: 0 },
        { question: "Why is data cleaning essential?", options: ["A) Garbage in, garbage out", "B) It makes screens brighter", "C) It deletes code", "D) It's optional"], correct: 0 },
        { question: "Handling missing values involves:", options: ["A) Imputation or removal", "B) Ignoring them", "C) Doubling file size", "D) Restarting PC"], correct: 0 },
        { question: "Outliers in datasets are:", options: ["A) Extreme values that skew analysis", "B) Normal data points", "C) Software bugs", "D) Color codes"], correct: 0 },
        { question: "Clean data results in:", options: ["A) Higher model accuracy and reliability", "B) Computer crashes", "C) Slow speeds", "D) Blank screens"], correct: 0 }
    ],
    "4.2": [
        { question: "What is the purpose of train/test splits?", options: ["A) To evaluate generalization on unseen data", "B) To divide files equally", "C) To save storage space", "D) To increase lag"], correct: 0 },
        { question: "What is overfitting?", options: ["A) Memorizing training data instead of learning patterns", "B) Running too fast", "C) Overheating CPU", "D) Low memory"], correct: 0 },
        { question: "Validation sets help with:", options: ["A) Tuning model hyperparameters", "B) Deleting cookies", "C) Styling CSS", "D) Writing essays"], correct: 0 },
        { question: "An ideal test set is:", options: ["A) Completely independent from training data", "B) Copied from training data", "C) Empty", "D) Randomly deleted"], correct: 0 },
        { question: "Generalization means:", options: ["A) Performing well on new, unseen data", "B) Memorizing answers", "C) Slow execution", "D) Crashing"], correct: 0 }
    ],
    "4.3": [
        { question: "What is feature engineering?", options: ["A) Transforming raw variables into informative representations", "B) Building physical computers", "C) Designing logos", "D) Writing HTML"], correct: 0 },
        { question: "Good features help algorithms:", options: ["A) Find underlying patterns faster and more accurately", "B) Stop working", "C) Consume more power", "D) Delete files"], correct: 0 },
        { question: "Feature scaling ensures:", options: ["A) Variables are on comparable numerical ranges", "B) Text is capitalized", "C) Screens are centered", "D) Audio is loud"], correct: 0 },
        { question: "Irrelevant features can cause:", options: ["A) Noise and reduced model performance", "B) Better accuracy", "C) Faster speeds", "D) Zero errors"], correct: 0 },
        { question: "Domain knowledge assists in:", options: ["A) Selecting meaningful features", "B) Fixing monitors", "C) Typing code", "D) Browsing web"], correct: 0 }
    ],
    "5.1": [
        { question: "What is Explainable AI (XAI)?", options: ["A) Making AI decisions transparent and understandable", "B) Hiding algorithms", "C) Encrypting passwords", "D) Deleting logs"], correct: 0 },
        { question: "Why is transparency critical in high-stakes decisions?", options: ["A) To ensure fairness and accountability", "B) To make models slower", "C) To increase file size", "D) To hide errors"], correct: 0 },
        { question: "Black-box models are:", options: ["A) Hard to interpret internally", "B) Completely transparent", "C) Hardware devices", "D) Simple spreadsheets"], correct: 0 },
        { question: "Algorithmic bias audits check for:", options: ["A) Disproportionate impacts on specific groups", "B) Fast rendering", "C) Battery life", "D) Wi-Fi range"], correct: 0 },
        { question: "Ethical governance demands:", options: ["A) Clear accountability for AI outcomes", "B) Zero documentation", "C) Hidden code", "D) Random choices"], correct: 0 }
    ],
    "5.2": [
        { question: "Copyright compliance in AI involves:", options: ["A) Respecting IP rights when training or prompting", "B) Stealing code", "C) Ignoring licenses", "D) Deleting files"], correct: 0 },
        { question: "Fair use doctrines examine:", options: ["A) Purpose, nature, and market impact of usage", "B) Computer speed", "C) Monitor size", "D) Keyboard type"], correct: 0 },
        { question: "Training models on copyrighted data without permission:", options: ["A) Sparks major legal and ethical debates", "B) Is always free", "C) Encouraged everywhere", "D) Impossible"], correct: 0 },
        { question: "Open-source licenses provide:", options: ["A) Clear permissions for code and data use", "B) Zero rules", "C) Passwords", "D) Hardware"], correct: 0 },
        { question: "Responsible innovators must:", options: ["A) Respect creator rights and licensing terms", "B) Ignore laws", "C) Hide sources", "D) Delete works"], correct: 0 }
    ],
    "5.3": [
        { question: "What are AI safety guardrails?", options: ["A) Filters preventing harmful or dangerous outputs", "B) Physical barriers", "C) Software updates", "D) Power switches"], correct: 0 },
        { question: "Content filtering protects users from:", options: ["A) Toxic, biased, or hazardous material", "B) Slow internet", "C) Low batteries", "D) Bright lights"], correct: 0 },
        { question: "Model alignment ensures AI is:", options: ["A) Helpful, honest, and harmless", "B) Unpredictable", "C) Autonomous", "D) Hidden"], correct: 0 },
        { question: "Red teaming in AI safety means:", options: ["A) Proactively testing models for vulnerabilities and exploits", "B) Playing video games", "C) Painting screens red", "D) Deleting databases"], correct: 0 },
        { question: "Robust safety protocols build:", options: ["A) Public trust and secure deployments", "B) System lag", "C) Errors", "D) Complexity"], correct: 0 }
    ],
    "6.1": [
        { question: "What do precision and recall measure?", options: ["A) Classification accuracy and thoroughness", "B) Typing speed", "C) Screen resolution", "D) Audio volume"], correct: 0 },
        { question: "Benchmark datasets provide:", options: ["A) Standardized evaluation metrics across models", "B) Random numbers", "C) Computer viruses", "D) Blank templates"], correct: 0 },
        { question: "What is the F1-score?", options: ["A) Harmonic mean of precision and recall", "B) A keyboard shortcut", "C) CPU temperature", "D) Internet speed"], correct: 0 },
        { question: "Rigorous evaluation prevents:", options: ["A) Deploying flawed or biased models", "B) Successful projects", "C) Fast compilation", "D) Clean code"], correct: 0 },
        { question: "Quantitative metrics allow:", options: ["A) Objective performance comparisons", "B) Subjective guessing", "C) Random results", "D) Zero testing"], correct: 0 }
    ],
    "6.2": [
        { question: "What does RLHF stand for?", options: ["A) Reinforcement Learning from Human Feedback", "B) Rapid Language Hardware Framing", "C) Real Logic High Function", "D) Random Link Hyper Filter"], correct: 0 },
        { question: "Human feedback helps models:", options: ["A) Align with human intent and social norms", "B) Forget data", "C) Slow down", "D) Crash"], correct: 0 },
        { question: "Alignment tuning reduces:", options: ["A) Harmful and hallucinated outputs", "B) Accuracy", "C) Processing speed", "D) Storage"], correct: 0 },
        { question: "Iterative refinement involves:", options: ["A) Continuously updating models based on evaluation", "B) Deleting projects", "C) Stopping work", "D) Ignoring bugs"], correct: 0 },
        { question: "Safe AI alignment requires:", options: ["A) Ongoing oversight and feedback loops", "B) Zero reviews", "C) Isolation", "D) Secrecy"], correct: 0 }
    ],
    "6.3": [
        { question: "What is responsible innovation?", options: ["A) Balancing technological advancement with ethical oversight", "B) Hashing passwords", "C) Coding without rules", "D) Speeding up CPUs"], correct: 0 },
        { question: "Future AI horizons demand:", options: ["A) Collaborative global standards and safety research", "B) Less security", "C) Abandoning ethics", "D) Zero testing"], correct: 0 },
        { question: "Students entering the AI field should focus on:", options: ["A) Continuous learning, ethics, and technical skill", "B) Memorizing single commands", "C) Avoiding computers", "D) Skipping math"], correct: 0 },
        { question: "Ethical AI stewardship ensures:", options: ["A) Technology benefits society equitably", "B) System crashes", "C) Data loss", "D) High costs"], correct: 0 },
        { question: "The ultimate goal of AI education is:", options: ["A) Empowering students to build safe, innovative solutions", "B) Replacing humans entirely", "C) Hiding technology", "D) Stopping progress"], correct: 0 }
    ]
};

function showInstructionsModal(gameTitle, rulesHTML, onStartCallback) {
    const modal = document.createElement('div');
    modal.className = 'quiz-modal'; // Uses your CSS class directly

    modal.innerHTML = `
        <div class="quiz-modal-card">
            <h2 style="font-family: 'Orbitron', sans-serif;">📜 Mission Briefing: ${gameTitle}</h2>
            <div class="quiz-briefing-body">
                ${rulesHTML}
            </div>
            <button id="btn-start-mission">
                ✅ Got It! Start Challenge
            </button>
        </div>
    `;

    document.body.appendChild(modal);
    modal.querySelector('#btn-start-mission').onclick = () => {
        modal.remove();
        onStartCallback();
    };
}
window.startArcadeQuiz = function(modId, subId) {
    const key = `${modId}.${subId}`;
    const modData = moduleLessons[modId] || moduleLessons[1];
    const subData = modData.submodules[subId] || modData.submodules[1];
    const gameType = subData.type || (subId === 2 ? 'blockblast' : subId === 3 ? 'angrybirds' : 'rocket');

    if (gameType === 'rocket') {
        showInstructionsModal(
            "Rocket Space Defender",
            `
                <p><strong>Objective:</strong> Answer AI concept questions correctly to earn Credits, then survive the 30-second asteroid wave!</p>
                <ul style="margin: 10px 0 20px 20px;">
                    <li><strong>Controls:</strong> Use <strong>LEFT/RIGHT Arrows (or A/D)</strong> to maneuver your rocket.</li>
                    <li><strong>Shooting:</strong> Press <strong>UP Arrow (W / Space)</strong> to fire lasers.</li>
                    <li><strong>Armory Upgrades:</strong> Spend credits on Faster Ship (50 units), Double Lasers, Rapid Fire, and Triple Bullets (150 units)!</li>
                </ul>
            `,
            () => runRocketGame(modId, subId, key)
        );
    } else if (gameType === 'blockblast') {
        showInstructionsModal(
            "Block Blast AI Grid",
            `
                <p><strong>Objective:</strong> Answer quiz questions correctly to earn visible shape blocks in your bottom tray!</p>
                <ul style="margin: 10px 0 20px 20px;">
                    <li><strong>Quiz Flow:</strong> If you miss a question, you do not receive blocks and the game moves directly to the next question. Get the question correct to earn your blocks!</li>
                    <li><strong>Hover Placement Preview:</strong> Click a piece in your tray, then hover over the 8x8 grid to dynamically highlight placement before clicking to set!</li>
                    <li>Complete full rows or columns to clear them and trigger floating hype text rewards!</li>
                </ul>
            `,
            () => runBlockBlastGame(modId, subId, key)
        );
    } else if (gameType === 'angrybirds') {
        showInstructionsModal(
            "Pirate Ship Cannon Launcher",
            `
                <p><strong>Objective:</strong> Answer questions correctly and launch heavy cannonballs from a pirate ship deck to smash wooden pirate crates!</p>
                <ul style="margin: 10px 0 20px 20px;">
                    <li><strong>Controls:</strong> Click & drag backward on the cannonball to aim with the live trajectory prediction arc, release to fire.</li>
                    <li><strong>Juiciness:</strong> Enjoy muzzle flashes, screen shakes, wood splinter particle explosions, and floating point popups (+50 PTS!) on every direct hit!</li>
                </ul>
            `,
            () => runAngryBirdsGame(modId, subId, key)
        );
    }
};

// ============================================================================
// MINIGAME 1: ROCKET SPACE SHOOTER (Fully Unified & Sleek)
// ============================================================================
function runRocketGame(modId, subId, key) {
    const questions = arcadeQuizDB[key] || arcadeQuizDB["1.1"];
    let currentQ = 0;
    let credits = 0;
    let quizScore = 0;
    let spaceScore = 0;
    let shipShield = 100;

    let shipSpeedBoost = false;
    let doubleLaser = false;
    let rapidFire = false;
    let tripleBullets = false;
    let pointMultiplier = 1;

    const modal = document.createElement('div');
    modal.className = 'quiz-modal';
    document.body.appendChild(modal);

    let particles = [];

    function spawnExplosion(x, y, color = '#00f2fe') {
        for (let i = 0; i < 18; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * 4.5;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1.0,
                decay: 0.02 + Math.random() * 0.025,
                color: color,
                size: 2 + Math.random() * 3.5
            });
        }
    }

    function renderQuestionStep() {
        if (currentQ >= questions.length) {
            renderFinalSummary();
            return;
        }

        const qData = questions[currentQ];
        modal.innerHTML = `
            <div class="quiz-game-card">
                <div class="quiz-header-row">
                    <span class="quiz-counter">Question ${currentQ + 1} of ${questions.length}</span>
                    <span class="quiz-credits">Credits: ${credits} 💰</span>
                </div>
                <h2 class="quiz-title">${qData.question}</h2>
                <div class="options-container">
                    ${qData.options.map((opt, i) => `
                        <button class="opt-btn" data-idx="${i}">${opt}</button>
                    `).join('')}
                </div>
            </div>
        `;

        modal.querySelectorAll('.opt-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const selected = parseInt(e.target.getAttribute('data-idx'));
                const allBtns = modal.querySelectorAll('.opt-btn');
                allBtns.forEach(b => b.style.pointerEvents = 'none');

                if (selected === qData.correct) {
                    btn.classList.add('correct');
                    btn.innerHTML += ' ✓';
                    credits += 100;
                    quizScore++;
                } else {
                    btn.classList.add('incorrect');
                    btn.innerHTML += ' ✗';
                    allBtns[qData.correct].classList.add('correct');
                }

                setTimeout(() => launchSpaceWave(), 1000);
            });
        });
    }

    function launchSpaceWave() {
        modal.innerHTML = `
            <div class="quiz-game-card canvas-card">
                <div class="quiz-header-row">
                    <span class="quiz-counter">Wave ${currentQ + 1} - Rocket Defense</span>
                    <span id="game-timer" class="quiz-credits" style="color: #ef4444 !important; border-color: rgba(239, 68, 68, 0.4);">Time: 30s</span>
                    <span id="game-score" class="quiz-credits">Score: ${spaceScore}</span>
                </div>
                <canvas id="spaceCanvas" width="640" height="360"></canvas>
                <p class="canvas-instructions">Use <strong>LEFT / RIGHT Arrows (or A/D)</strong> to Move | Press <strong>UP Arrow (W / Space)</strong> to Shoot!</p>
            </div>
        `;

        const canvas = document.getElementById('spaceCanvas');
        const ctx = canvas.getContext('2d');
        let timeLeft = 30;

        let player = { x: canvas.width / 2 - 18, y: canvas.height - 45, w: 36, h: 36, speed: shipSpeedBoost ? 9 : 5.5 };
        let bullets = [];
        let asteroids = [];
        let keys = {};

        const keydownHandler = (e) => { keys[e.code] = true; };
        const keyupHandler = (e) => { keys[e.code] = false; };
        window.addEventListener('keydown', keydownHandler);
        window.addEventListener('keyup', keyupHandler);

        let lastShoot = 0;
        let starfield = [];
        for (let i = 0; i < 45; i++) {
            starfield.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 1.8 + 0.5
            });
        }

        const timerInterval = setInterval(() => {
            timeLeft--;
            const timerEl = document.getElementById('game-timer');
            if (timerEl) timerEl.textContent = `Time: ${timeLeft}s`;

            if (timeLeft <= 0) {
                cleanupWave();
                openArmoryShop();
            }
        }, 1000);

        function cleanupWave() {
            clearInterval(timerInterval);
            cancelAnimationFrame(animId);
            window.removeEventListener('keydown', keydownHandler);
            window.removeEventListener('keyup', keyupHandler);
        }

        let animId;
        function gameLoop(now) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Dynamic Gradient Background
            let bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            bgGradient.addColorStop(0, '#060919');
            bgGradient.addColorStop(0.5, '#0b1329');
            bgGradient.addColorStop(1, '#02040a');
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Scrolling Starfield
            ctx.fillStyle = '#38bdf8';
            starfield.forEach(star => {
                star.y += star.speed;
                if (star.y > canvas.height) star.y = 0;
                ctx.globalAlpha = star.size > 2 ? 0.9 : 0.4;
                ctx.fillRect(star.x, star.y, star.size, star.size);
            });
            ctx.globalAlpha = 1.0;

            // Player Movement
            if ((keys['ArrowLeft'] || keys['KeyA']) && player.x > 0) player.x -= player.speed;
            if ((keys['ArrowRight'] || keys['KeyD']) && player.x < canvas.width - player.w) player.x += player.speed;

            // Bullet Firing Logic
            const shootCooldown = rapidFire ? 150 : 320;
            if ((keys['ArrowUp'] || keys['KeyW'] || keys['Space']) && now - lastShoot > shootCooldown) {
                if (tripleBullets) {
                    bullets.push({ x: player.x + 2, y: player.y, w: 4, h: 14, color: '#38bdf8' });
                    bullets.push({ x: player.x + player.w / 2 - 2, y: player.y - 6, w: 4, h: 14, color: '#00f2fe' });
                    bullets.push({ x: player.x + player.w - 6, y: player.y, w: 4, h: 14, color: '#38bdf8' });
                } else if (doubleLaser) {
                    bullets.push({ x: player.x + 6, y: player.y, w: 4, h: 14, color: '#00f2fe' });
                    bullets.push({ x: player.x + player.w - 10, y: player.y, w: 4, h: 14, color: '#00f2fe' });
                } else {
                    bullets.push({ x: player.x + player.w / 2 - 2, y: player.y, w: 4, h: 14, color: '#00f2fe' });
                }
                lastShoot = now;
            }

            // Render Sleek Vector Rocket Model & Pulsing Engine Flame
            ctx.save();
            ctx.translate(player.x + player.w / 2, player.y + player.h / 2);

            const flameHeight = 12 + Math.sin(now * 0.04) * 5;
            ctx.fillStyle = '#ff7b00';
            ctx.beginPath();
            ctx.moveTo(-5, 16);
            ctx.lineTo(0, 16 + flameHeight);
            ctx.lineTo(5, 16);
            ctx.closePath();
            ctx.fill();

            // Rocket Hull
            ctx.fillStyle = '#f8fafc';
            ctx.beginPath();
            ctx.moveTo(0, -20);
            ctx.lineTo(14, 12);
            ctx.lineTo(6, 16);
            ctx.lineTo(-6, 16);
            ctx.lineTo(-14, 12);
            ctx.closePath();
            ctx.fill();

            // Wings
            ctx.fillStyle = '#2563eb';
            ctx.beginPath();
            ctx.moveTo(-14, 12);
            ctx.lineTo(-21, 19);
            ctx.lineTo(-6, 14);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(14, 12);
            ctx.lineTo(21, 19);
            ctx.lineTo(6, 14);
            ctx.closePath();
            ctx.fill();

            // Cockpit Glass
            ctx.fillStyle = '#00f2fe';
            ctx.beginPath();
            ctx.arc(0, -2, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Render Bullets with Glow
            ctx.shadowBlur = 12;
            for (let i = bullets.length - 1; i >= 0; i--) {
                let b = bullets[i];
                b.y -= 9.5;
                ctx.fillStyle = b.color;
                ctx.shadowColor = b.color;
                ctx.fillRect(b.x, b.y, b.w, b.h);
                if (b.y < 0) bullets.splice(i, 1);
            }
            ctx.shadowBlur = 0;

            // Spawn Asteroids
            if (Math.random() < 0.042) {
                asteroids.push({
                    x: Math.random() * (canvas.width - 45),
                    y: -40,
                    size: 32 + Math.random() * 18,
                    speed: 1.8 + Math.random() * 2.2,
                    rot: Math.random() * Math.PI,
                    rotSpeed: (Math.random() - 0.5) * 0.035
                });
            }

            // Render Particles
            for (let i = particles.length - 1; i >= 0; i--) {
                let p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= p.decay;
                if (p.alpha <= 0) {
                    particles.splice(i, 1);
                    continue;
                }
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, p.size, p.size);
            }
            ctx.globalAlpha = 1.0;

            // Asteroid Physics & Collisions
            for (let i = asteroids.length - 1; i >= 0; i--) {
                let ast = asteroids[i];
                ast.y += ast.speed;
                ast.rot += ast.rotSpeed;

                ctx.save();
                ctx.translate(ast.x + ast.size / 2, ast.y + ast.size / 2);
                ctx.rotate(ast.rot);

                ctx.fillStyle = '#475569';
                ctx.strokeStyle = '#64748b';
                ctx.lineWidth = 2;
                ctx.beginPath();
                const pts = 7;
                for (let p = 0; p < pts; p++) {
                    const angle = (p / pts) * Math.PI * 2;
                    const r = (ast.size / 2) * (0.8 + Math.sin(p * 3) * 0.2);
                    const px = Math.cos(angle) * r;
                    const py = Math.sin(angle) * r;
                    if (p === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.restore();

                // Bullet Hit Asteroid
                for (let j = bullets.length - 1; j >= 0; j--) {
                    let b = bullets[j];
                    if (b.x < ast.x + ast.size && b.x + b.w > ast.x && b.y < ast.y + ast.size && b.y + b.h > ast.y) {
                        spawnExplosion(ast.x + ast.size / 2, ast.y + ast.size / 2, '#38bdf8');
                        asteroids.splice(i, 1);
                        bullets.splice(j, 1);
                        spaceScore += 20 * pointMultiplier;
                        const scoreEl = document.getElementById('game-score');
                        if (scoreEl) scoreEl.textContent = `Score: ${spaceScore}`;
                        break;
                    }
                }

                // Player Hit Asteroid
                if (ast && player.x < ast.x + ast.size && player.x + player.w > ast.x && player.y < ast.y + ast.size && player.y + player.h > ast.y) {
                    spawnExplosion(ast.x + ast.size / 2, ast.y + ast.size / 2, '#ef4444');
                    asteroids.splice(i, 1);
                    spaceScore = Math.max(0, spaceScore - 15);
                    shipShield = Math.max(0, shipShield - 20);
                    const scoreEl = document.getElementById('game-score');
                    if (scoreEl) scoreEl.textContent = `Score: ${spaceScore}`;
                }

                if (ast && ast.y > canvas.height) asteroids.splice(i, 1);
            }

            animId = requestAnimationFrame(gameLoop);
        }

        animId = requestAnimationFrame(gameLoop);
    }

    function openArmoryShop() {
        modal.innerHTML = `
            <div class="quiz-game-card">
                <h2 class="shop-title">🛠️ Rocket Armory Upgrades</h2>
                <p class="shop-credits">Your Credits: <strong class="credit-highlight">${credits} 💰</strong></p>
                
                <div class="shop-grid">
                    <button id="buy-speed" class="shop-btn">🚀 Faster Ship (50 💰) ${shipSpeedBoost ? '✅' : ''}</button>
                    <button id="buy-double" class="shop-btn">🔫 Double Laser (75 💰) ${doubleLaser ? '✅' : ''}</button>
                    <button id="buy-rapid" class="shop-btn">⚡ Rapid Fire (100 💰) ${rapidFire ? '✅' : ''}</button>
                    <button id="buy-triple" class="shop-btn">💥 Triple Bullets (150 💰) ${tripleBullets ? '✅' : ''}</button>
                    <button id="buy-mult" class="shop-btn shop-btn-full">🌟 2x Score Multiplier (125 💰) ${pointMultiplier > 1 ? '✅' : ''}</button>
                </div>
                <button id="skip-shop" class="btn-continue-shop">Skip Shop & Continue →</button>
            </div>
        `;

        modal.querySelector('#buy-speed').onclick = () => {
            if (credits >= 50 && !shipSpeedBoost) { credits -= 50; shipSpeedBoost = true; openArmoryShop(); }
            else alert("Cannot purchase!");
        };
        modal.querySelector('#buy-double').onclick = () => {
            if (credits >= 75 && !doubleLaser) { credits -= 75; doubleLaser = true; openArmoryShop(); }
            else alert("Cannot purchase!");
        };
        modal.querySelector('#buy-rapid').onclick = () => {
            if (credits >= 100 && !rapidFire) { credits -= 100; rapidFire = true; openArmoryShop(); }
            else alert("Cannot purchase!");
        };
        modal.querySelector('#buy-triple').onclick = () => {
            if (credits >= 150 && !tripleBullets) { credits -= 150; tripleBullets = true; openArmoryShop(); }
            else alert("Cannot purchase!");
        };
        modal.querySelector('#buy-mult').onclick = () => {
            if (credits >= 125 && pointMultiplier === 1) { credits -= 125; pointMultiplier = 2; openArmoryShop(); }
            else alert("Cannot purchase!");
        };
        modal.querySelector('#skip-shop').onclick = () => {
            currentQ++;
            renderQuestionStep();
        };
    }

    async function renderFinalSummary() {
        const totalPoints = (quizScore * 100) + spaceScore;
        const passed = quizScore >= 4;
        if (passed && modId >= maxUnlockedModule && maxUnlockedModule < 6) {
            maxUnlockedModule = parseInt(modId) + 1;
            localStorage.setItem('maxUnlockedModule', maxUnlockedModule);
            updateModuleLockUI();
        }

        let leaderboardHTML = '<p style="color:#94a3b8; font-size:0.9rem;">Loading leaderboard standings...</p>';

        // Award 150 XP and fetch live leaderboard standings from Firebase Firestore
        if (typeof db !== 'undefined') {
            const activeId = localStorage.getItem('ai_portal_active_user_id');
            try {
                if (activeId) {
                    const docRef = db.collection('cadets').doc(activeId);
                    const doc = await docRef.get();
                    if (doc.exists) {
                        const data = doc.data();
                        const newXp = (data.xp || 0) + 150;
                        const scores = data.scores || { rocket: 0, blockblast: 0, angrybirds: 0 };
                        if (spaceScore > (scores.rocket || 0)) {
                            scores.rocket = spaceScore;
                        }
                        await docRef.update({
                            xp: newXp,
                            scores: scores
                        });
                    }
                }

                // Fetch all cadets to build the game-specific leaderboard
                const snapshot = await db.collection('cadets').get();
                let allCadets = [];
                snapshot.forEach(d => {
                    allCadets.push({ id: d.id, ...d.data() });
                });

                // Sort cadets by their rocket high score highest to lowest
                allCadets.sort((a, b) => {
                    const scoreA = (a.scores && a.scores.rocket) || 0;
                    const scoreB = (b.scores && b.scores.rocket) || 0;
                    return scoreB - scoreA;
                });

                // Build HTML list for top 5 cadets
                leaderboardHTML = allCadets.slice(0, 5).map((cadet, index) => {
                    const isMe = activeId && cadet.id === activeId;
                    const cadetScore = (cadet.scores && cadet.scores.rocket) || 0;
                    return `
                        <div style="display: flex; justify-content: space-between; align-items: center; background: ${isMe ? 'rgba(0,242,254,0.15)' : 'rgba(255,255,255,0.05)'}; border: 1px solid ${isMe ? '#00f2fe' : 'rgba(255,255,255,0.1)'}; padding: 6px 12px; border-radius: 6px; margin-bottom: 6px; font-size: 0.85rem;">
                            <span>#${index + 1} <strong>${escapeHTML(cadet.username)}</strong> ${isMe ? '(You)' : ''}</span>
                            <span style="color: #00f2fe; font-weight: 700;">${cadetScore} pts</span>
                        </div>
                    `;
                }).join('');

            } catch (err) {
                console.error("Error fetching leaderboard standings:", err);
                leaderboardHTML = '<p style="color:#ef4444; font-size:0.85rem;">Could not load leaderboard.</p>';
            }
        }

        modal.innerHTML = `
            <div class="quiz-game-card text-center" style="max-width: 440px; margin: auto;">
                <h1 class="summary-title" style="font-size: 1.4rem; margin-bottom: 8px;">🚀 Rocket Challenge Complete!</h1>
                <h3 class="summary-stat" style="font-size: 1rem;">Quiz Score: ${quizScore} / ${questions.length}</h3>
                <p class="summary-arcade" style="font-size: 0.95rem;">Your Arcade Score: <strong>${spaceScore} pts</strong></p>
                <p class="summary-total" style="color: #00f2fe; margin: 6px 0; font-weight: 700; font-size: 0.9rem;">+150 XP Awarded! 🌟</p>
                
                <div style="margin: 14px 0; text-align: left;">
                    <h4 style="font-size: 0.9rem; color: #cbd5e1; margin-bottom: 6px; text-align: center;">🏆 Top Rocket Pilots</h4>
                    ${leaderboardHTML}
                </div>

                <button id="close-final" class="btn-continue-shop" style="margin-top: 10px; width: 100%;">Continue to Modules</button>
            </div>
        `;

        if (typeof window.updateProgress === 'function') {
            window.updateProgress(20);
            checkBadges();
        }

        modal.querySelector('#close-final').onclick = () => {
            modal.remove();
            showPage('modules-grid');
        };
    }

    renderQuestionStep();
}

// ============================================================================
// MINIGAME 2: BLOCK BLAST GRID PUZZLE (Stable Hover Ghost + Leaderboard Fix)
// ============================================================================
function runBlockBlastGame(modId, subId, key) {
    const questions = arcadeQuizDB[key] || arcadeQuizDB["1.2"];
    let currentQ = 0;
    let gridScore = 0;
    let quizScore = 0;
    let grid = Array(8).fill(null).map(() => Array(8).fill(null));
    let trayBlocks = [];
    let selectedTrayIndex = 0;

    const blockColors = ['#00f2fe', '#38bdf8', '#a855f7', '#ec4899', '#f59e0b', '#22c55e', '#6366f1'];
    let particles = [];

    const modal = document.createElement('div');
    modal.className = 'quiz-modal';
    document.body.appendChild(modal);

    function spawnParticles(x, y, color = '#00f2fe', count = 12) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            particles.push({
                x: x, y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1.0,
                decay: 0.03 + Math.random() * 0.02,
                color: color,
                size: 2 + Math.random() * 2.5
            });
        }
    }

    function triggerHypeText(text) {
        const hype = document.createElement('div');
        hype.textContent = text;
        hype.style.cssText = `
            position: fixed; top: 30%; left: 50%; transform: translate(-50%, -50%);
            font-size: 28px; font-weight: 800; color: #00f2fe; font-family: 'Orbitron', sans-serif;
            text-shadow: 0 0 20px rgba(0,242,254,0.8); z-index: 20000; pointer-events: none;
            animation: floatUpFade 1.2s ease-out forwards;
        `;
        document.body.appendChild(hype);
        setTimeout(() => hype.remove(), 1200);
    }

    function renderQuestionStep() {
        if (currentQ >= questions.length) {
            renderFinalSummary();
            return;
        }

        const qData = questions[currentQ];
        modal.innerHTML = `
            <div class="quiz-game-card">
                <div class="quiz-header-row">
                    <span class="quiz-counter">Question ${currentQ + 1} of ${questions.length}</span>
                    <span class="quiz-credits">Grid Score: ${gridScore} 🧱</span>
                </div>
                <h2 class="quiz-title">${qData.question}</h2>
                <div class="options-container">
                    ${qData.options.map((opt, i) => `
                        <button class="opt-btn" data-idx="${i}">${opt}</button>
                    `).join('')}
                </div>
            </div>
        `;

        modal.querySelectorAll('.opt-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const selected = parseInt(e.target.getAttribute('data-idx'));
                const allBtns = modal.querySelectorAll('.opt-btn');
                allBtns.forEach(b => b.style.pointerEvents = 'none');

                if (selected === qData.correct) {
                    btn.classList.add('correct');
                    btn.innerHTML += ' ✓';
                    quizScore++;
                } else {
                    btn.classList.add('incorrect');
                    btn.innerHTML += ' ✗';
                    allBtns[qData.correct].classList.add('correct');
                }

                setTimeout(() => {
                    generateTrayBlocks();
                    renderPuzzleBoard();
                }, 1000);
            });
        });
    }

    function generateTrayBlocks() {
        const shapes = [
            [[1, 1], [1, 1]],         // Square 2x2
            [[1, 1, 1]],              // Horizontal Line
            [[1], [1], [1]],          // Vertical Line
            [[1, 0], [1, 1]],         // L-Shape
            [[1, 1, 1], [0, 0, 1]],   // Corner L
            [[1]]                     // Single Block
        ];

        trayBlocks = [];
        for (let i = 0; i < 6; i++) {
            const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
            const randomColor = blockColors[Math.floor(Math.random() * blockColors.length)];
            trayBlocks.push({ shape: randomShape, color: randomColor });
        }
        selectedTrayIndex = 0;
    }

    function checkPieceFitsAt(shape, startR, startC) {
        for (let sr = 0; sr < shape.length; sr++) {
            for (let sc = 0; sc < shape[sr].length; sc++) {
                if (shape[sr][sc]) {
                    const targetR = startR + sr;
                    const targetC = startC + sc;
                    if (targetR >= 8 || targetC >= 8 || grid[targetR][targetC] !== null) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    function renderPuzzleBoard() {
        let gridHTML = '<div id="block-grid" style="display: grid; grid-template-columns: repeat(8, 36px); gap: 4px; background: rgba(6, 9, 25, 0.9); padding: 12px; border-radius: 12px; border: 2px solid rgba(0,242,254,0.4); box-shadow: inset 0 0 15px rgba(0,0,0,0.8);">';
        
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const cellColor = grid[r][c];
                const bg = cellColor ? cellColor : 'rgba(255, 255, 255, 0.03)';
                const border = cellColor ? cellColor : 'rgba(255, 255, 255, 0.08)';
                const shadow = cellColor ? `0 0 10px ${cellColor}88` : 'none';

                gridHTML += `<div class="grid-cell" data-row="${r}" data-col="${c}" style="width: 36px; height: 36px; background: ${bg}; border-radius: 6px; cursor: pointer; border: 1px solid ${border}; box-shadow: ${shadow}; transition: background 0.1s ease;"></div>`;
            }
        }
        gridHTML += '</div>';

        let trayHTML = '<div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 15px; background: rgba(18, 18, 30, 0.8); padding: 12px; border-radius: 10px; max-width: 650px;">';
        trayBlocks.forEach((item, idx) => {
            if (!item) return;
            const isSelected = selectedTrayIndex === idx;
            const borderCol = isSelected ? '#00f2fe' : 'rgba(255,255,255,0.15)';
            const bgCard = isSelected ? 'rgba(0,242,254,0.12)' : 'rgba(255,255,255,0.04)';

            let previewHTML = '<div style="display:grid; grid-template-columns:repeat(3, 9px); gap:2px; margin-bottom:4px;">';
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    let active = item.shape[r] && item.shape[r][c] === 1;
                    previewHTML += `<div style="width:9px; height:9px; background:${active ? item.color : 'transparent'}; border-radius:2px; box-shadow: ${active ? `0 0 6px ${item.color}` : 'none'}"></div>`;
                }
            }
            previewHTML += '</div>';

            trayHTML += `<div class="tray-piece" data-index="${idx}" style="padding: 6px 10px; background: ${bgCard}; border: 2px solid ${borderCol}; border-radius: 8px; cursor: pointer; text-align: center; display:flex; flex-direction:column; align-items:center;">
                ${previewHTML}
                <span style="font-size: 10px; color: #94a3b8; font-weight: 600;">Piece #${idx + 1}</span>
            </div>`;
        });
        trayHTML += '</div>';

        modal.innerHTML = `
            <div class="quiz-game-card canvas-card" style="max-width: 680px;">
                <div class="quiz-header-row">
                    <span class="quiz-counter">Wave ${currentQ + 1} - Block Grid Arena</span>
                    <span class="quiz-credits">Grid Score: ${gridScore} 🧱</span>
                </div>
                <p class="canvas-instructions" style="margin-bottom: 12px;">Click a piece to select it, then hover over the grid to see the <strong>ghost outline</strong> before clicking to place!</p>
                <div style="display: flex; justify-content: center; margin: 5px 0;">${gridHTML}</div>
                ${trayHTML}
                <button id="next-question-btn" class="btn-continue-shop" style="margin-top: 15px; width: 100%;">Next Question →</button>
            </div>
        `;

        // Bind tray selection clicks
        modal.querySelectorAll('.tray-piece').forEach(piece => {
            piece.onclick = () => {
                selectedTrayIndex = parseInt(piece.getAttribute('data-index'));
                renderPuzzleBoard();
            };
        });

        const cells = modal.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            const r = parseInt(cell.getAttribute('data-row'));
            const c = parseInt(cell.getAttribute('data-col'));

            // Safe Hover Ghost Preview (Modifies styles directly without re-rendering DOM)
            cell.onmouseenter = () => {
                if (selectedTrayIndex === null || !trayBlocks[selectedTrayIndex]) return;
                const shape = trayBlocks[selectedTrayIndex].shape;
                const pieceColor = trayBlocks[selectedTrayIndex].color;
                const fits = checkPieceFitsAt(shape, r, c);

                cells.forEach(item => {
                    const ir = parseInt(item.getAttribute('data-row'));
                    const ic = parseInt(item.getAttribute('data-col'));
                    const sr = ir - r;
                    const sc = ic - c;

                    // Reset empty cells
                    if (!grid[ir][ic]) {
                        item.style.background = 'rgba(255, 255, 255, 0.03)';
                        item.style.border = '1px solid rgba(255, 255, 255, 0.08)';
                    }

                    // Apply ghost outline overlay
                    if (sr >= 0 && sr < shape.length && sc >= 0 && sc < shape[0].length && shape[sr][sc] === 1) {
                        if (!grid[ir][ic]) {
                            item.style.background = fits ? `${pieceColor}55` : 'rgba(239, 68, 68, 0.35)';
                            item.style.border = `1px dashed ${fits ? pieceColor : '#ef4444'}`;
                        }
                    }
                });
            };

            cell.onclick = () => {
                placeBlockAt(r, c);
            };
        });

        const gridContainer = modal.querySelector('#block-grid');
        if (gridContainer) {
            gridContainer.onmouseleave = () => {
                renderPuzzleBoard(); // Clean up ghost overlay safely on mouse leave
            };
        }

        modal.querySelector('#next-question-btn').onclick = () => {
            currentQ++;
            renderQuestionStep();
        };
    }

    function placeBlockAt(r, c) {
        if (selectedTrayIndex === null || !trayBlocks[selectedTrayIndex]) {
            alert("⚠️ Please select a piece from your tray first!");
            return;
        }

        const trayItem = trayBlocks[selectedTrayIndex];
        const shape = trayItem.shape;
        const color = trayItem.color;

        if (checkPieceFitsAt(shape, r, c)) {
            for (let sr = 0; sr < shape.length; sr++) {
                for (let sc = 0; sc < shape[sr].length; sc++) {
                    if (shape[sr][sc]) {
                        grid[r + sr][c + sc] = color;
                        spawnParticles((c + sc) * 36 + 18, (r + sr) * 36 + 18, color, 8);
                    }
                }
            }
            trayBlocks.splice(selectedTrayIndex, 1);
            selectedTrayIndex = trayBlocks.length > 0 ? 0 : null;

            gridScore += 50;
            const clearedCount = checkGridClears();
            if (clearedCount > 0) {
                const phrases = ["Block Blast!", "Awesome Combo!", "Clean Clear!", "Brilliant!"];
                triggerHypeText(phrases[Math.floor(Math.random() * phrases.length)]);
            }

            renderPuzzleBoard();
        } else {
            triggerHypeText("⚠️ Invalid Placement!");
        }
    }

    function checkGridClears() {
        let clears = 0;
        for (let r = 0; r < 8; r++) {
            if (grid[r].every(v => v !== null)) {
                grid[r] = Array(8).fill(null);
                gridScore += 200;
                clears++;
            }
        }
        for (let c = 0; c < 8; c++) {
            let colFull = true;
            for (let r = 0; r < 8; r++) {
                if (grid[r][c] === null) colFull = false;
            }
            if (colFull) {
                for (let r = 0; r < 8; r++) grid[r][c] = null;
                gridScore += 200;
                clears++;
            }
        }
        return clears;
    }

    async function renderFinalSummary() {
        const totalPoints = (quizScore * 100) + gridScore;
        const passed = quizScore >= 4;
        if (passed && modId >= maxUnlockedModule && maxUnlockedModule < 6) {
            maxUnlockedModule = parseInt(modId) + 1;
            localStorage.setItem('maxUnlockedModule', maxUnlockedModule);
            updateModuleLockUI();
        }

        let leaderboardHTML = '<p style="color:#94a3b8; font-size:0.9rem;">No other scores yet. You set the benchmark! 🚀</p>';

        if (typeof db !== 'undefined') {
            const activeId = localStorage.getItem('ai_portal_active_user_id');
            try {
                if (activeId) {
                    const docRef = db.collection('cadets').doc(activeId);
                    const doc = await docRef.get();
                    if (doc.exists) {
                        const data = doc.data();
                        const newXp = (data.xp || 0) + 100;
                        const scores = data.scores || { rocket: 0, blockblast: 0, angrybirds: 0 };
                        if (gridScore > (scores.blockblast || 0)) {
                            scores.blockblast = gridScore;
                        }
                        await docRef.update({
                            xp: newXp,
                            scores: scores
                        });
                    }
                }

                const snapshot = await db.collection('cadets').get();
                let allCadets = [];
                snapshot.forEach(d => {
                    allCadets.push({ id: d.id, ...d.data() });
                });

                allCadets.sort((a, b) => {
                    const scoreA = (a.scores && a.scores.blockblast) || 0;
                    const scoreB = (b.scores && b.scores.blockblast) || 0;
                    return scoreB - scoreA;
                });

                if (allCadets.length > 0) {
                    leaderboardHTML = allCadets.slice(0, 5).map((cadet, index) => {
                        const isMe = activeId && cadet.id === activeId;
                        const cadetScore = (cadet.scores && cadet.scores.blockblast) || 0;
                        return `
                            <div style="display: flex; justify-content: space-between; align-items: center; background: ${isMe ? 'rgba(0,242,254,0.15)' : 'rgba(255,255,255,0.05)'}; border: 1px solid ${isMe ? '#00f2fe' : 'rgba(255,255,255,0.1)'}; padding: 6px 12px; border-radius: 6px; margin-bottom: 6px; font-size: 0.85rem;">
                                <span>#${index + 1} <strong>${escapeHTML(cadet.username)}</strong> ${isMe ? '(You)' : ''}</span>
                                <span style="color: #00f2fe; font-weight: 700;">${cadetScore} pts</span>
                            </div>
                        `;
                    }).join('');
                }

            } catch (err) {
                console.error("Error fetching Block Blast leaderboard:", err);
            }
        }

        modal.innerHTML = `
            <div class="quiz-game-card text-center" style="max-width: 440px; margin: auto;">
                <h1 class="summary-title" style="font-size: 1.4rem; margin-bottom: 8px;">🧱 Block Blast Complete!</h1>
                <h3 class="summary-stat" style="font-size: 1rem;">Quiz Score: ${quizScore} / ${questions.length}</h3>
                <p class="summary-arcade" style="font-size: 0.95rem;">Grid Score: <strong>${gridScore} pts</strong></p>
                <p class="summary-total" style="color: #00f2fe; margin: 6px 0; font-weight: 700; font-size: 0.9rem;">+100 XP Awarded! 🌟</p>
                
                <div style="margin: 14px 0; text-align: left;">
                    <h4 style="font-size: 0.9rem; color: #cbd5e1; margin-bottom: 6px; text-align: center;">🏆 Top Block Masters</h4>
                    ${leaderboardHTML}
                </div>

                <button id="close-final" class="btn-continue-shop" style="margin-top: 10px; width: 100%;">Continue to Modules</button>
            </div>
        `;

        if (typeof window.updateProgress === 'function') {
            window.updateProgress(20);
            checkBadges();
        }

        modal.querySelector('#close-final').onclick = () => {
            modal.remove();
            showPage('modules-grid');
        };
    }

    renderQuestionStep();
}

// ============================================================================
// MINIGAME 3: PIRATE SHIP CANNON LAUNCHER (HILLTOP EDITION & 100/ROUND)
// ============================================================================
function runAngryBirdsGame(modId, subId, key) {
    const defaultQuestions = [
        {
            question: "What is the primary function of a neural network's activation function?",
            options: [
                "To introduce non-linearity so the network can learn complex patterns",
                "To increase the physical memory size of the GPU",
                "To encrypt training data against hackers",
                "To compile JavaScript into machine bytecode"
            ],
            correct: 0
        },
        {
            question: "Which component stores persistent user data across browser sessions in our portal?",
            options: [
                "Local RAM cache only",
                "Firebase Firestore cloud database",
                "CSS stylesheets",
                "DOM event listeners"
            ],
            correct: 1
        },
        {
            question: "What does an AI model use during training to measure how wrong its predictions are?",
            options: [
                "A Loss Function",
                "An HTML parser",
                "A CSS grid template",
                "A Wi-Fi router"
            ],
            correct: 0
        }
    ];

    let questions = defaultQuestions;
    if (typeof arcadeQuizDB !== 'undefined' && arcadeQuizDB && arcadeQuizDB[key]) {
        questions = arcadeQuizDB[key];
    } else if (typeof arcadeQuizDB !== 'undefined' && arcadeQuizDB && arcadeQuizDB["1.3"]) {
        questions = arcadeQuizDB["1.3"];
    }

    let currentQ = 0;
    let launcherScore = 0;
    let quizScore = 0;
    let credits = 50; 
    let currentLevel = 1;

    let heavyBall = false;
    let bombBall = false;
    let scoreMult = 1;

    const existingModal = document.querySelector('.quiz-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.className = 'quiz-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(5, 5, 15, 0.96); display: flex; justify-content: center;
        align-items: center; z-index: 10000; padding: 20px; box-sizing: border-box;
        font-family: 'Inter', sans-serif;
    `;
    document.body.appendChild(modal);

    function renderQuestionStep() {
        if (!questions || currentQ >= questions.length) {
            renderFinalSummary();
            return;
        }

        const qData = questions[currentQ];
        modal.innerHTML = `
            <div style="background: linear-gradient(135deg, #121224 0%, #1a1a2e 100%); border: 2px solid #ff4757; border-radius: 16px; padding: 35px; max-width: 620px; width: 100%; color: #fff; box-shadow: 0 10px 40px rgba(255, 71, 87, 0.25);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <span style="color: #ff4757; font-weight: 700; font-size: 0.9rem; letter-spacing: 1px;">QUESTION ${currentQ + 1} OF ${questions.length} • HILLTOP LEVEL ${currentLevel}</span>
                    <span style="color: #00f2fe; background: rgba(0,242,254,0.1); padding: 4px 12px; border-radius: 20px; font-weight: 600; font-size: 0.85rem;">${credits} 💰 Credits</span>
                </div>
                <h2 style="font-size: 1.25rem; line-height: 1.5; margin-bottom: 25px; color: #f8fafc;">${qData.question || ''}</h2>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    ${(qData.options || []).map((opt, i) => `
                        <button class="opt-btn" data-idx="${i}" style="padding: 14px 18px; background: rgba(30, 30, 46, 0.8); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 10px; text-align: left; cursor: pointer; font-size: 0.95rem; transition: all 0.2s ease;">${opt}</button>
                    `).join('')}
                </div>
            </div>
        `;

        modal.querySelectorAll('.opt-btn').forEach(btn => {
            btn.onclick = (e) => {
                const selected = parseInt(e.target.getAttribute('data-idx'));
                const allBtns = modal.querySelectorAll('.opt-btn');
                allBtns.forEach(b => b.style.pointerEvents = 'none');

                if (selected === qData.correct) {
                    btn.style.background = 'rgba(46, 213, 115, 0.2)';
                    btn.style.borderColor = '#2ed573';
                    btn.innerHTML += ' ✓';
                    credits += 100; 
                    quizScore++;
                } else {
                    btn.style.background = 'rgba(255, 71, 87, 0.2)';
                    btn.style.borderColor = '#ff4757';
                    btn.innerHTML += ' ✗';
                    if (allBtns[qData.correct]) {
                        allBtns[qData.correct].style.background = 'rgba(46, 213, 115, 0.2)';
                        allBtns[qData.correct].style.borderColor = '#2ed573';
                    }
                }

                setTimeout(() => launchPhysicsCanvas(), 900);
            };
        });
    }

    function launchPhysicsCanvas() {
        let targets = [];
        
        if (currentLevel === 1) {
            targets = [
                { x: 500, y: 235, w: 38, h: 38 },
                { x: 550, y: 235, w: 38, h: 38 },
                { x: 600, y: 235, w: 38, h: 38 },
                { x: 525, y: 190, w: 38, h: 38 },
                { x: 575, y: 190, w: 38, h: 38 },
                { x: 550, y: 145, w: 38, h: 38 }
            ];
        } else if (currentLevel === 2) {
            targets = [
                { x: 480, y: 145, w: 36, h: 36 },
                { x: 480, y: 185, w: 36, h: 36 },
                { x: 480, y: 225, w: 36, h: 36 },
                { x: 540, y: 185, w: 36, h: 36 },
                { x: 540, y: 225, w: 36, h: 36 },
                { x: 600, y: 145, w: 36, h: 36 },
                { x: 600, y: 225, w: 36, h: 36 }
            ];
        } else {
            targets = [
                { x: 460, y: 235, w: 35, h: 35 },
                { x: 510, y: 175, w: 35, h: 35 },
                { x: 560, y: 235, w: 35, h: 35 },
                { x: 610, y: 175, w: 35, h: 35 },
                { x: 535, y: 125, w: 35, h: 35 }
            ];
        }

        modal.innerHTML = `
            <div style="background: linear-gradient(135deg, #0a0a14 0%, #121224 100%); border: 2px solid #ff4757; border-radius: 16px; padding: 25px; max-width: 720px; width: 100%; color: #fff; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <span style="color: #ff4757; font-weight: 700; letter-spacing: 1px;">⛰️ HILLTOP CANNON ASSAULT — LEVEL ${currentLevel}</span>
                    <span id="birds-score" style="color: #2ed573; font-weight: 700; font-size: 1.05rem;">Score: ${launcherScore}</span>
                </div>
                <div style="position: relative;">
                    <canvas id="birdsCanvas" width="680" height="340" style="background: #0d1117; border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; width: 100%; height: auto; cursor: crosshair;"></canvas>
                    <div id="shot-feedback" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0, 242, 254, 0.95); color: #0a0a14; padding: 14px 28px; border-radius: 10px; font-weight: 800; font-size: 1.3rem; display: none; box-shadow: 0 4px 25px rgba(0,242,254,0.6); letter-spacing: 1px;">NICE WORK!</div>
                </div>
                <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 12px;">Click & Drag backward on the Cannonball on your hilltop to aim down at the crates!</p>
            </div>
        `;

        const canvas = document.getElementById('birdsCanvas');
        if (!canvas) {
            renderQuestionStep();
            return;
        }
        const ctx = canvas.getContext('2d');

        let cannonPos = { x: 110, y: 155 };
        let ball = { x: 110, y: 155, r: 14, vx: 0, vy: 0, launched: false };
        let dragging = false;
        let particles = [];
        let floatingTexts = [];
        let shakeFrames = 0;
        let muzzleFlashFrames = 0;
        let roundEnded = false;
        const groundY = 275;

        canvas.onmousedown = (e) => {
            if (ball.launched || roundEnded) return;
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const mx = (e.clientX - rect.left) * scaleX;
            const my = (e.clientY - rect.top) * scaleY;
            if (Math.hypot(mx - ball.x, my - ball.y) < 45) dragging = true;
        };

        const onMouseMoveHandler = (e) => {
            if (!dragging) return;
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            ball.x = (e.clientX - rect.left) * scaleX;
            ball.y = (e.clientY - rect.top) * scaleY;
            
            const dist = Math.hypot(ball.x - cannonPos.x, ball.y - cannonPos.y);
            if (dist > 85) {
                const angle = Math.atan2(ball.y - cannonPos.y, ball.x - cannonPos.x);
                ball.x = cannonPos.x + Math.cos(angle) * 85;
                ball.y = cannonPos.y + Math.sin(angle) * 85;
            }
        };

        const onMouseUpHandler = () => {
            if (dragging) {
                dragging = false;
                ball.launched = true;
                ball.vx = (cannonPos.x - ball.x) * 0.38;
                ball.vy = (cannonPos.y - ball.y) * 0.38;
                muzzleFlashFrames = 10;
                shakeFrames = 6;
            }
        };

        window.addEventListener('mousemove', onMouseMoveHandler);
        window.addEventListener('mouseup', onMouseUpHandler);

        let animId;
        function loop(now) {
            if (!document.body.contains(canvas)) {
                cancelAnimationFrame(animId);
                window.removeEventListener('mousemove', onMouseMoveHandler);
                window.removeEventListener('mouseup', onMouseUpHandler);
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.save();
            if (shakeFrames > 0) {
                shakeFrames--;
                ctx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
            }

            let grad = ctx.createLinearGradient(0, 0, 0, groundY);
            grad.addColorStop(0, '#0f172a');
            grad.addColorStop(1, '#1e3a8a');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, groundY);

            ctx.fillStyle = '#78350f';
            ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
            ctx.strokeStyle = '#451a03';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, groundY); ctx.lineTo(canvas.width, groundY);
            ctx.stroke();

            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.moveTo(0, groundY);
            ctx.lineTo(0, 180);
            ctx.quadraticCurveTo(80, 150, 180, groundY);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.save();
            ctx.translate(cannonPos.x, cannonPos.y);
            let angle = dragging ? Math.atan2(ball.y - cannonPos.y, ball.x - cannonPos.x) : 0.2;
            ctx.rotate(angle);
            ctx.fillStyle = '#334155';
            ctx.fillRect(0, -14, 52, 28);
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(44, -16, 8, 32);
            ctx.restore();

            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(cannonPos.x - 12, cannonPos.y + 11, 10, 0, Math.PI * 2);
            ctx.arc(cannonPos.x + 12, cannonPos.y + 11, 10, 0, Math.PI * 2);
            ctx.fill();

            if (muzzleFlashFrames > 0) {
                muzzleFlashFrames--;
                ctx.fillStyle = '#f59e0b';
                ctx.beginPath();
                ctx.arc(cannonPos.x + Math.cos(angle)*55, cannonPos.y + Math.sin(angle)*55, 18, 0, Math.PI * 2);
                ctx.fill();
            }

            if (dragging) {
                let simX = ball.x;
                let simY = ball.y;
                let simVx = (cannonPos.x - ball.x) * 0.38;
                let simVy = (cannonPos.y - ball.y) * 0.38;
                let simGravity = heavyBall ? 0.48 : 0.36;

                ctx.strokeStyle = 'rgba(0, 242, 254, 0.7)';
                ctx.lineWidth = 2.5;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(simX, simY);
                for (let step = 0; step < 30; step++) {
                    simX += simVx;
                    simY += simVy;
                    simVy += simGravity;
                    ctx.lineTo(simX, simY);
                }
                ctx.stroke();
                ctx.setLineDash([]);
            }

            targets.forEach((t, i) => {
                ctx.fillStyle = '#b45309';
                ctx.fillRect(t.x, t.y, t.w, t.h);
                ctx.strokeStyle = '#78350f';
                ctx.lineWidth = 3;
                ctx.strokeRect(t.x, t.y, t.w, t.h);
                
                ctx.beginPath();
                ctx.moveTo(t.x, t.y); ctx.lineTo(t.x + t.w, t.y + t.h);
                ctx.moveTo(t.x + t.w, t.y); ctx.lineTo(t.x, t.y + t.h);
                ctx.stroke();

                if (ball.x + ball.r > t.x && ball.x - ball.r < t.x + t.w && ball.y + ball.r > t.y && ball.y - ball.r < t.y + t.h) {
                    targets.splice(i, 1);
                    launcherScore += 100 * scoreMult;
                    shakeFrames = 14;

                    for (let p = 0; p < 16; p++) {
                        particles.push({
                            x: t.x + t.w / 2,
                            y: t.y + t.h / 2,
                            vx: (Math.random() - 0.5) * 9,
                            vy: (Math.random() - 0.5) * 9,
                            color: Math.random() > 0.5 ? '#f59e0b' : '#ef4444',
                            alpha: 1.0,
                            size: 3 + Math.random() * 5
                        });
                    }

                    floatingTexts.push({
                        text: `+${100 * scoreMult} PTS!`,
                        x: t.x,
                        y: t.y,
                        alpha: 1.0
                    });

                    const scoreEl = document.getElementById('birds-score');
                    if (scoreEl) scoreEl.textContent = `Score: ${launcherScore}`;

                    if (bombBall) {
                        targets = targets.filter(other => Math.hypot(other.x - t.x, other.y - t.y) > 85);
                    }
                }
            });

            for (let i = particles.length - 1; i >= 0; i--) {
                let pt = particles[i];
                pt.x += pt.vx;
                pt.y += pt.vy;
                pt.alpha -= 0.035;
                ctx.fillStyle = pt.color;
                ctx.globalAlpha = Math.max(0, pt.alpha);
                ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
                ctx.globalAlpha = 1.0;
                if (pt.alpha <= 0) particles.splice(i, 1);
            }

            for (let i = floatingTexts.length - 1; i >= 0; i--) {
                let ft = floatingTexts[i];
                ft.y -= 1.25;
                ft.alpha -= 0.025;
                ctx.fillStyle = '#2ed573';
                ctx.font = 'bold 16px Inter, sans-serif';
                ctx.globalAlpha = Math.max(0, ft.alpha);
                ctx.fillText(ft.text, ft.x, ft.y);
                ctx.globalAlpha = 1.0;
                if (ft.alpha <= 0) floatingTexts.splice(i, 1);
            }

            if (dragging) {
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 3.5;
                ctx.beginPath();
                ctx.moveTo(cannonPos.x, cannonPos.y);
                ctx.lineTo(ball.x, ball.y);
                ctx.stroke();
            }

            ctx.fillStyle = heavyBall ? '#475569' : '#0f172a';
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#94a3b8';
            ctx.beginPath();
            ctx.arc(ball.x - 4, ball.y - 4, 3.5, 0, Math.PI * 2);
            ctx.fill();

            if (ball.launched && !roundEnded) {
                ball.x += ball.vx;
                ball.y += ball.vy;
                ball.vy += heavyBall ? 0.48 : 0.36;

                if (ball.y + ball.r >= groundY) {
                    ball.y = groundY - ball.r;
                    ball.vy = -ball.vy * 0.35;
                    ball.vx *= 0.82;

                    if (Math.abs(ball.vy) < 0.5) {
                        ball.vy = 0;
                    }
                }

                const isSettled = (ball.vy === 0 && Math.abs(ball.vx) < 0.2) || ball.x > canvas.width || ball.x < 0;

                if (targets.length === 0 || isSettled) {
                    roundEnded = true;
                    window.removeEventListener('mousemove', onMouseMoveHandler);
                    window.removeEventListener('mouseup', onMouseUpHandler);

                    setTimeout(() => {
                        const feedbackEl = document.getElementById('shot-feedback');
                        if (feedbackEl) feedbackEl.style.display = 'block';

                        setTimeout(() => {
                            cancelAnimationFrame(animId);
                            openBirdsShop();
                        }, 1200);
                    }, 400);
                    return;
                }
            }

            ctx.restore();
            animId = requestAnimationFrame(loop);
        }

        animId = requestAnimationFrame(loop);
    }

    function openBirdsShop() {
        if (!document.body.contains(modal)) return;
        modal.innerHTML = `
            <div style="background: linear-gradient(135deg, #121224 0%, #1a1a2e 100%); border: 2px solid #ff4757; border-radius: 16px; padding: 30px; max-width: 580px; width: 100%; color: #fff; text-align: center; box-shadow: 0 10px 40px rgba(255, 71, 87, 0.25);">
                <h2 style="color: #ff4757; margin-top: 0; font-family: 'Inter', sans-serif;">🏹 CANNON SHOP & UPGRADES</h2>
                <p>Available Credits: <strong style="color: #00f2fe;">${credits} 💰</strong></p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 25px 0;">
                    <button id="buy-heavy" style="padding: 14px; background: rgba(30,30,46,0.9); border: 1px solid #ff4757; color: #fff; border-radius: 10px; cursor: pointer; font-weight: 600;">
                        💣 Heavy Iron Ball (40 💰)<br><span style="font-size: 0.8rem; color: #94a3b8;">${heavyBall ? '✅ Owned' : 'Flat trajectory'}</span>
                    </button>
                    <button id="buy-bomb" style="padding: 14px; background: rgba(30,30,46,0.9); border: 1px solid #ff4757; color: #fff; border-radius: 10px; cursor: pointer; font-weight: 600;">
                        💥 Explosive Shot (80 💰)<br><span style="font-size: 0.8rem; color: #94a3b8;">${bombBall ? '✅ Owned' : 'Area splash damage'}</span>
                    </button>
                    <button id="buy-mult" style="grid-column: span 2; padding: 14px; background: rgba(30,30,46,0.9); border: 1px solid #ff4757; color: #fff; border-radius: 10px; cursor: pointer; font-weight: 600;">
                        🌟 2x Multiplier (60 💰)<br><span style="font-size: 0.8rem; color: #94a3b8;">${scoreMult > 1 ? '✅ Active' : 'Double points'}</span>
                    </button>
                </div>
                <button id="skip-shop" style="width: 100%; padding: 14px; background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%); color: #0a0a14; border: none; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 1rem;">
                    Continue to Next Question →
                </button>
            </div>
        `;

        modal.querySelector('#buy-heavy').onclick = () => {
            if (credits >= 40 && !heavyBall) { credits -= 40; heavyBall = true; openBirdsShop(); }
            else alert("Not enough credits or already owned!");
        };
        modal.querySelector('#buy-bomb').onclick = () => {
            if (credits >= 80 && !bombBall) { credits -= 80; bombBall = true; openBirdsShop(); }
            else alert("Not enough credits or already owned!");
        };
        modal.querySelector('#buy-mult').onclick = () => {
            if (credits >= 60 && scoreMult === 1) { credits -= 60; scoreMult = 2; openBirdsShop(); }
            else alert("Not enough credits or already active!");
        };
        modal.querySelector('#skip-shop').onclick = () => {
            currentQ++;
            currentLevel++;
            renderQuestionStep();
        };
    }

    function renderFinalSummary() {
        const totalPoints = (quizScore * 150) + launcherScore;
        
        // Ensure recordArcadeScore correctly passes the pirate score to Firebase
        if (typeof window.recordArcadeScore === 'function') {
            window.recordArcadeScore('pirate', totalPoints);
        } else {
            // Fallback direct update if recordArcadeScore isn't scoped globally
            const activeId = localStorage.getItem('ai_portal_active_user_id');
            if (activeId && typeof db !== 'undefined') {
                db.collection('cadets').doc(activeId).get().then(doc => {
                    if (doc.exists) {
                        let data = doc.data();
                        if (!data.scores) data.scores = { rocket: 0, blockblast: 0, pirate: 0 };
                        if (totalPoints > (data.scores.pirate || 0)) {
                            data.scores.pirate = totalPoints;
                        }
                        data.xp = (Number(data.xp) || 0) + 50;
                        db.collection('cadets').doc(activeId).set(data, { merge: true });
                    }
                });
            }
        }

        modal.innerHTML = `
            <div style="background: linear-gradient(135deg, #121224 0%, #1a1a2e 100%); border: 2px solid #ff4757; border-radius: 16px; padding: 35px; max-width: 520px; width: 100%; color: #fff; text-align: center; box-shadow: 0 10px 40px rgba(255, 71, 87, 0.25);">
                <h1 style="color: #ff4757; margin-top: 0; font-size: 1.6rem;">🏴‍☠️ BATTLE COMPLETE!</h1>
                <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 20px; margin: 20px 0; text-align: left; display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; justify-content: space-between;"><span>Quiz Accuracy:</span><strong style="color: #00f2fe;">${quizScore} / ${questions.length}</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>Launcher Score:</span><strong style="color: #2ed573;">${launcherScore} PTS</strong></div>
                    <div style="display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px; margin-top: 4px; font-size: 1.1rem;"><span>Total Arcade Score:</span><strong style="color: #ffd700;">${totalPoints} PTS</strong></div>
                </div>
                <p style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 20px;">Score and XP have been synced to the global Firebase Leaderboard under the Pirate category!</p>
                <button id="close-final" style="width: 100%; padding: 14px; background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%); color: #0a0a14; border: none; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 1rem;">Return to Portal</button>
            </div>
        `;

        if (typeof window.updateProgress === 'function') {
            window.updateProgress(25);
        }

        modal.querySelector('#close-final').onclick = () => {
            modal.remove();
            if (typeof showPage === 'function') showPage('modules-grid');
        };
    }

    renderQuestionStep();
}
function initProgressTracking() {
    window.updateProgress = function(points) {
        const fill = document.querySelector('.progress-fill');
        const text = document.querySelector('.progress-bar p') || document.querySelector('.progress-text');
        if (fill) {
            const currentWidth = parseFloat(fill.style.width || '20');
            const newWidth = Math.min(currentWidth + points, 100);
            fill.style.width = `${newWidth}%`;
            if (text) text.textContent = `${Math.round(newWidth)}% Complete`;
        }
    };
}

function initBadgeSystem() {}

function checkBadges() {
    updateDashboardStats();
}

function initChatbot() {
    const fab = document.querySelector('.chatbot-fab, .chatbot-widget, #chatbot-trigger');
    const chatPopUp = document.querySelector('.chatpop-up, .chat-popup, #chat-popup');
    const closeChat = document.querySelector('.close-chat, #close-chat');
    const sendBtn = document.querySelector('.send-btn');
    const chatInput = document.querySelector('.chat-input-area input, .chat-input input');
    if (fab && chatPopUp) {
        fab.addEventListener('click', () => {
            chatPopUp.style.display = chatPopUp.style.display === 'none' || !chatPopUp.style.display ? 'block' : 'none';
        });
    }
    if (closeChat && chatPopUp) {
        closeChat.addEventListener('click', () => { chatPopUp.style.display = 'none'; });
    }
    if (sendBtn && chatInput) {
        sendBtn.addEventListener('click', () => {
            const message = chatInput.value.trim();
            if (message) {
                addChatMessage(message, 'user');
                chatInput.value = '';
                setTimeout(() => {
                    addChatMessage(getChatResponse(message), 'assistant');
                }, 400);
            }
        });
        chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendBtn.click(); });
    }
}

function addChatMessage(text, sender) {
    const chatMessages = document.querySelector('.chat-messages, .chat-body, .chat-popup');
    if (!chatMessages) return;
    const msgDiv = document.createElement('div');
    msgDiv.style.cssText = `
        background: ${sender === 'user' ? 'var(--accent-blue, #0077ff)' : 'var(--card-bg, #2a2a3d)'};
        color: ${sender === 'user' ? '#ffffff' : 'var(--text-secondary, #e0e0e0)'};
        padding: 8px 12px; border-radius: 8px; max-width: 80%; margin-bottom: 8px;
        clear: both; float: ${sender === 'user' ? 'right' : 'left'}; font-size: 14px; word-break: break-word;
    `;
    msgDiv.textContent = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getChatResponse(message) {
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) return "Hello! I'm your AI learning assistant.";
    if (lowerMsg.includes('module') || lowerMsg.includes('quiz')) return "Pass each submodule's minigame challenge to unlock the next module!";
    return "Great question! Ask me about prompt engineering tips, academic integrity rules, or neural networks.";
}

// Function to handle switching views smoothly
function switchView(viewId) {
    // 1. Hide all elements with the class 'portal-view'
    document.querySelectorAll('.portal-view').forEach(view => {
        view.classList.remove('active-view');
    });

    // 2. Show the targeted view container
    const target = document.getElementById(viewId);
    if (target) {
        target.classList.add('active-view');
        window.scrollTo(0, 0); // Jump back to top smoothly
    }
}

// 3. Navbar click mapper
document.addEventListener('DOMContentLoaded', () => {
    const navMapping = {
        'Home': 'home-page-view',
        'Modules': 'modules-page-view',
        'Dashboard': 'dashboard-page-view',
        'Chatbot': 'chatbot-page-view',
        'References': 'references-page-view',
        'Profile': 'profile-page-view' // Added Profile view mapping
    };

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            const linkText = link.textContent.trim();
            if (navMapping[linkText]) {
                e.preventDefault(); // Stop page reload / file not found errors
                
                // Update active tab styling on navbar
                document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // Switch to the respective view (using switchView or showPage based on your setup)
                if (typeof switchView === 'function') {
                    switchView(navMapping[linkText]);
                } else if (typeof showPage === 'function') {
                    showPage(navMapping[linkText]);
                }
            }
        });
    });
});

// ==========================================
// SPA TAB ROUTING SYSTEM FOR INDEX.HTML
// ==========================================

function showPage(pageId) {
    // 1. Hide all main portal views (including profile and references)
    const views = [
        'home-page-view', 
        'modules-grid', 
        'modules-page-view', 
        'dashboard-page-view', 
        'chatbot-page-view',
        'profile-page-view',      // Added profile view
        'references-page-view'    // Added references view
    ];
    
    views.forEach(id => {
        const viewElement = document.getElementById(id);
        if (viewElement) {
            viewElement.style.display = 'none';
        }
    });

    // 2. Normalize shortcut names if passed from navbar or buttons
    let targetId = pageId;
    if (pageId === 'home') targetId = 'home-page-view';
    if (pageId === 'modules') targetId = 'modules-grid';
    if (pageId === 'dashboard') targetId = 'dashboard-page-view';
    if (pageId === 'chatbot') targetId = 'chatbot-page-view';
    if (pageId === 'profile') targetId = 'profile-page-view';       // Shortcut for profile
    if (pageId === 'references') targetId = 'references-page-view'; // Shortcut for references

    // 3. Show the target view container
    const targetView = document.getElementById(targetId);
    if (targetView) {
        targetView.style.display = 'block';
        window.scrollTo(0, 0); // Smooth jump back to the top of the page
    } else {
        console.warn(`Target view element with ID '${targetId}' was not found in the DOM.`);
    }
}

// Optional: Navigate to a specific sub-lesson module and open the lesson view
function navigateToModule(moduleNumber) {
    // Hide the grid view
    const gridView = document.getElementById('modules-grid');
    if (gridView) gridView.style.display = 'none';

    // Show the individual lesson view container
    const lessonView = document.getElementById('modules-page-view');
    if (lessonView) {
        lessonView.style.display = 'block';
    }

    // Populate dynamic lesson content depending on the module number selected
    const contentContainer = document.getElementById('active-module-content');
    if (contentContainer) {
        contentContainer.innerHTML = `
            <div style="max-width: 900px; margin: 40px auto; padding: 30px; background: #161625; border: 1px solid #3b82f6; border-radius: 12px;">
                <h2 style="color: #00f2fe; font-family: 'Orbitron', sans-serif; margin-top: 0;">Module ${moduleNumber} Interactive Lesson</h2>
                <p style="color: #cbd5e1; line-height: 1.7;">Welcome to Module ${moduleNumber}! Complete the reading below and launch the arcade simulator to test your skills, earn XP, and unlock achievement badges.</p>
            </div>
        `;
    }

    window.scrollTo(0, 0);
}

// ============================================================================
// CLOUD-SYNCED PROFILE SYSTEM & GLOBAL LEADERBOARD (FIREBASE FIRESTORE)
// ============================================================================
(function initProfileSystem() {
    const STORAGE_CURRENT_ID = 'ai_portal_active_user_id';
    
    // In-memory cache for fast UI rendering while waiting for cloud updates
    let cachedDirectory = [];
    let currentLeaderboardCategory = 'xp'; // Default active tab

    // ============================================================================
    // ITEM MAPPING & CONFIGURATION
    // ============================================================================
    const avatarMap = {
        'avatar_pixel_orange': 'images/Designer (4).png',
        'avatar_realistic_scrappy': 'images/Neon Cyan Floating Robot Mascot.png',
        'avatar_true_gold_scrappy': 'images/Radiant Golden Robot Mascot Portrait.png',
        'avatar_error_hand': 'images/Glitch Eye Cybernetic Hand.png',
        'avatar_yellow_robot': 'images/Glossy Yellow Robot Mascot Avatar.png',
        'avatar_bagel_robot': 'images/generate_image_01.png',
        'avatar_true_god_scrappy': 'images/generate_image_01 (1).png'
    };

    const backgroundMap = {
        'bg_default': '',
        'bg_electric_blue': 'images/Designer (5).png',
        'bg_true_gold': 'images/generate_image_02.png',
        'bg_deep_space': 'images/generate_a_flat_front-facing_full-bleed_deep_space_cosmic_ba.jpg',
        'bg_scrappy_console': 'images/b649ac97-d785-4643-951c-191279da5b6b.jpg',
        'bg_robot_painting': 'images/Untitled Design (2).png',
    };

    // Words/terms blocked in usernames and bios
    const profanityList = ['badword1', 'badword2', 'gay'];

    // ============================================================================
    // SECURITY & STORAGE HELPERS
    // ============================================================================
    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag]));
    }

    function containsProfanity(text) {
        if (!text) return false;
        const normalized = text.toLowerCase()
            .replace(/[^a-z]/g, '')
            .replace(/0/g, 'o')
            .replace(/1/g, 'i')
            .replace(/3/g, 'e')
            .replace(/4/g, 'a')
            .replace(/5/g, 's')
            .replace(/@/g, 'a');

        return profanityList.some(word => normalized.includes(word));
    }

    function getDirectory() {
        return cachedDirectory;
    }

    async function saveUserToCloud(user) {
        if (typeof db === 'undefined') {
            console.error("Firebase 'db' is not initialized.");
            return;
        }
        try {
            await db.collection('cadets').doc(user.id).set(user, { merge: true });
        } catch (error) {
            console.error("Error saving user to cloud:", error);
        }
    }

    function getActiveUser() {
        const activeId = localStorage.getItem(STORAGE_CURRENT_ID);
        if (!activeId) return null;
        return cachedDirectory.find(u => u.id === activeId) || null;
    }

    function getRankTitle(xp) {
        if (xp >= 1000) return 'Grandmaster AI Architect';
        if (xp >= 500) return 'Cyber Specialist';
        if (xp >= 200) return 'Prompt Engineer';
        return 'Rookie AI Explorer';
    }

    // ============================================================================
    // REAL-TIME CLOUD LISTENER (FIREBASE ON-SNAPSHOT)
    // ============================================================================
    function initRealtimeSync() {
        if (typeof db === 'undefined') {
            console.warn("Firebase not detected. Falling back to local state.");
            return;
        }

        db.collection('cadets').onSnapshot(snapshot => {
            let cloudDirectory = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                if (!data.scores || typeof data.scores !== 'object') {
                    data.scores = { rocket: 0, blockblast: 0, pirate: 0 };
                }
                if (data.scores.rocket === undefined) data.scores.rocket = 0;
                if (data.scores.blockblast === undefined) data.scores.blockblast = 0;
                if (data.scores.pirate === undefined) data.scores.pirate = data.pirateScore || 0;

                cloudDirectory.push({ id: doc.id, ...data });
            });

            if (cloudDirectory.length === 0) {
                const seed1 = {
                    id: 'seed_1',
                    username: 'NovaPrime',
                    bio: 'Neural network architect & laser ace',
                    avatar: 'images/Designer (1).png',
                    background: 'bg_default',
                    xp: 650,
                    scores: { rocket: 1420, blockblast: 980, pirate: 1100 },
                    unlocks: ['bg_default']
                };
                const seed2 = {
                    id: 'seed_2',
                    username: 'ByteRunner',
                    bio: 'Prompt engineering speedrunner',
                    avatar: 'images/Designer (2).png',
                    background: 'bg_default',
                    xp: 480,
                    scores: { rocket: 1150, blockblast: 1240, pirate: 890 },
                    unlocks: ['bg_default']
                };
                saveUserToCloud(seed1);
                saveUserToCloud(seed2);
                return;
            }

            cachedDirectory = cloudDirectory;
            refreshProfileUI();
        }, error => {
            console.error("Firestore sync error:", error);
        });
    }

    // ============================================================================
    // XP SHOP & ARCADE RECORDERS
    // ============================================================================
    window.buyShopItem = function(itemKey, cost) {
        const user = getActiveUser();
        if (!user) {
            alert("Please create or log into a profile first!");
            return;
        }

        if (!user.unlocks) user.unlocks = ['bg_default'];
        if (user.unlocks.includes(itemKey)) {
            alert("You already unlocked this item!");
            return;
        }

        if ((user.xp || 0) < cost) {
            alert(`Not enough XP! You need ${cost} XP, but you have ${user.xp || 0} XP.`);
            return;
        }

        user.xp -= cost;
        user.unlocks.push(itemKey);

        saveUserToCloud(user);
        refreshProfileUI();
        alert(`Success! Unlocked ${itemKey.replace(/_/g, ' ').toUpperCase()}.`);
    };

    window.recordArcadeScore = function(gameKey, points) {
        if (typeof points !== 'number' || points < 0 || points > 50000) {
            console.warn("Invalid score detected.");
            return;
        }

        const user = getActiveUser();
        if (!user) return;

        if (!user.scores || typeof user.scores !== 'object') {
            user.scores = { rocket: 0, blockblast: 0, pirate: 0 };
        }
        if (user.scores.rocket === undefined) user.scores.rocket = 0;
        if (user.scores.blockblast === undefined) user.scores.blockblast = 0;
        if (user.scores.pirate === undefined) user.scores.pirate = data.pirateScore || 0;

        user.xp = (Number(user.xp) || 0) + 50;
        
        let targetKey = gameKey.toLowerCase().trim();
        if (targetKey === 'pirate' || targetKey === 'angrybirds') targetKey = 'pirate';
        if (targetKey === 'rocket') targetKey = 'rocket';
        if (targetKey === 'blockblast' || targetKey === 'block_blast') targetKey = 'blockblast';

        if (points > (user.scores[targetKey] || 0)) {
            user.scores[targetKey] = points;
        }

        saveUserToCloud(user);
        refreshProfileUI();
    };

    window.equipInventoryItem = function(itemKey) {
        const user = getActiveUser();
        if (!user) return;

        if (avatarMap[itemKey]) {
            user.avatar = avatarMap[itemKey];
            alert(`Equipped avatar: ${itemKey.replace(/_/g, ' ')}`);
        } else if (backgroundMap.hasOwnProperty(itemKey)) {
            user.background = itemKey;
            localStorage.setItem('ai_portal_active_theme', itemKey);
            alert(`Equipped background theme: ${itemKey.replace(/_/g, ' ')}`);
        }

        saveUserToCloud(user);
        refreshProfileUI();
    };

    // ============================================================================
    // RENDER GLOBAL DIRECTORY & CATEGORY LEADERBOARDS
    // ============================================================================
    function renderDirectoryList(filterText = '') {
        const listEl = document.getElementById('global-directory-list');
        if (!listEl) return;

        const activeUser = getActiveUser();
        const query = filterText.toLowerCase().trim();

        const filtered = [...cachedDirectory].filter(u => 
            u.username.toLowerCase().includes(query) || (u.bio && u.bio.toLowerCase().includes(query))
        );

        filtered.sort((a, b) => {
            const aScores = a.scores || {};
            const bScores = b.scores || {};
            if (currentLeaderboardCategory === 'xp') {
                return (b.xp || 0) - (a.xp || 0);
            } else if (currentLeaderboardCategory === 'rocket') {
                return (bScores.rocket || 0) - (aScores.rocket || 0);
            } else if (currentLeaderboardCategory === 'blockblast') {
                return (bScores.blockblast || 0) - (aScores.blockblast || 0);
            } else if (currentLeaderboardCategory === 'pirate') {
                return (bScores.pirate || 0) - (aScores.pirate || 0);
            }
            return 0;
        });

        if (filtered.length === 0) {
            listEl.innerHTML = `<p style="color:#94a3b8; text-align:center; padding:16px;">No cadets found matching "${escapeHTML(filterText)}".</p>`;
            return;
        }

        listEl.innerHTML = filtered.map((u, index) => {
            const isMe = activeUser && u.id === activeUser.id;
            const uScores = u.scores || {};
            let displayScoreMetric = '';

            if (currentLeaderboardCategory === 'xp') {
                displayScoreMetric = `<span class="dir-xp">${u.xp || 0} XP</span>`;
            } else if (currentLeaderboardCategory === 'rocket') {
                displayScoreMetric = `<span class="dir-best">Rocket Score: ${uScores.rocket || 0} pts</span>`;
            } else if (currentLeaderboardCategory === 'blockblast') {
                displayScoreMetric = `<span class="dir-best">Block Blast: ${uScores.blockblast || 0} pts</span>`;
            } else if (currentLeaderboardCategory === 'pirate') {
                displayScoreMetric = `<span class="dir-best">Pirate Score: ${uScores.pirate || 0} pts</span>`;
            }

            return `
                <div class="directory-row ${isMe ? 'is-me' : ''}">
                    <div class="dir-user-info">
                        <span class="dir-rank">#${index + 1}</span>
                        <div class="dir-avatar" style="width: 38px; height: 38px; border-radius: 50%; overflow: hidden; border: 1px solid #00f2fe;">
                            <img src="${escapeHTML(u.avatar)}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <div>
                            <span class="dir-name">${escapeHTML(u.username)} ${isMe ? '(You)' : ''}</span>
                            <span class="dir-bio">${escapeHTML(u.bio || 'AI Learning Cadet')}</span>
                        </div>
                    </div>
                    <div class="dir-scores">
                        ${displayScoreMetric}
                    </div>
                </div>
            `;
        }).join('');
    }

    document.querySelectorAll('.lb-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.lb-tab').forEach(t => {
                t.classList.remove('active');
                t.style.background = 'rgba(255,255,255,0.05)';
                t.style.color = '#fff';
            });
            const clickedTab = e.currentTarget;
            clickedTab.classList.add('active');
            clickedTab.style.background = '#00f2fe';
            clickedTab.style.color = '#0a0a14';

            currentLeaderboardCategory = clickedTab.getAttribute('data-cat');
            renderDirectoryList(document.getElementById('global-profile-search')?.value || '');
        });
    });

    // ============================================================================
    // REFRESH PROFILE DASHBOARD & INVENTORY
    // ============================================================================
    function refreshProfileUI() {
        const user = getActiveUser();
        const navLabel = document.getElementById('nav-username-label');
        const createView = document.getElementById('create-account-view');
        const activeView = document.getElementById('active-profile-view');

        if (activeView) {
            const classListArray = Array.from(activeView.classList).filter(cls => !cls.startsWith('theme-'));
            activeView.className = classListArray.join(' ');
            
            const activeTheme = (user && user.background) ? user.background : (localStorage.getItem('ai_portal_active_theme') || 'bg_default');
            activeView.classList.add(`theme-${activeTheme}`);

            activeView.style.backgroundImage = '';
            activeView.style.backgroundSize = 'cover';
            activeView.style.backgroundPosition = 'center';

            if (backgroundMap[activeTheme]) {
                activeView.style.backgroundImage = `linear-gradient(rgba(10, 10, 20, 0.85), rgba(10, 10, 20, 0.95)), url('${backgroundMap[activeTheme]}')`;
            }
        }

        if (!user) {
            if (navLabel) navLabel.textContent = 'Create Profile';
            if (createView) createView.style.display = 'block';
            if (activeView) activeView.style.display = 'none';
            return;
        }

        if (navLabel) navLabel.textContent = user.username;
        if (createView) createView.style.display = 'none';
        if (activeView) activeView.style.display = 'block';

        const avatarRing = document.getElementById('dash-avatar');
        if (avatarRing) {
            avatarRing.innerHTML = `<img src="${escapeHTML(user.avatar)}" alt="Active Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        }

        const elUsername = document.getElementById('dash-username');
        const elRank = document.getElementById('dash-rank');
        const elBio = document.getElementById('dash-bio');
        const elXp = document.getElementById('dash-xp');
        const elRocket = document.getElementById('dash-score-rocket');
        const elBlock = document.getElementById('dash-score-blockblast');
        const elPirate = document.getElementById('dash-score-pirate');

        const uScores = user.scores || {};

        if (elUsername) elUsername.textContent = user.username;
        if (elRank) elRank.textContent = getRankTitle(user.xp || 0);
        if (elBio) elBio.textContent = user.bio || 'Ready to conquer the AI modules.';
        if (elXp) elXp.textContent = user.xp || 0;
        
        if (elRocket) elRocket.textContent = uScores.rocket ?? uScores.rocketScore ?? 0;
        if (elBlock) elBlock.textContent = uScores.blockblast ?? uScores.blockBlast ?? 0;
        if (elPirate) elPirate.textContent = uScores.pirate ?? uScores.pirateScore ?? 0;

        // Populate Unlocked Inventory Vault
        const inventoryEl = document.getElementById('user-inventory-list');
        if (inventoryEl) {
            if (!user.unlocks || user.unlocks.length === 0) {
                inventoryEl.innerHTML = `<span style="font-size: 0.9rem;">No items unlocked yet. Buy something from the vault below!</span>`;
            } else {
                inventoryEl.innerHTML = user.unlocks.map(itemKey => {
                    return `
                        <div class="inventory-item" style="background: rgba(0,242,254,0.1); border: 1px solid #00f2fe; border-radius: 10px; padding: 10px 14px; color: #fff; font-size: 0.85rem; font-weight: 700; display: flex; align-items: center; gap: 10px;">
                            <span>✅ ${escapeHTML(itemKey.replace(/_/g, ' ').toUpperCase())}</span>
                            <button onclick="equipInventoryItem('${escapeHTML(itemKey)}')" class="btn-cyan-secondary" style="background: rgba(0,242,254,0.15); border: 1px solid #00f2fe; color: #00f2fe; padding: 4px 10px; font-size: 0.75rem; cursor: pointer;">Equip</button>
                        </div>
                    `;
                }).join('');
            }
        }

        // Dynamically populate the Edit Avatar Picker with default options + unlocked shop avatars
        const editAvatarPicker = document.getElementById('edit-avatar-picker');
        if (editAvatarPicker) {
            // Always include the 3 default starting avatars
            let availableAvatars = [
                'images/Designer (1).png',
                'images/Designer (2).png',
                'images/Designer (3).png'
            ];

            // Append any additional unlocked avatars from user inventory
            if (user.unlocks) {
                user.unlocks.forEach(key => {
                    if (avatarMap[key]) {
                        availableAvatars.push(avatarMap[key]);
                    }
                });
            }

            // Remove duplicates just in case
            availableAvatars = [...new Set(availableAvatars)];

            editAvatarPicker.innerHTML = availableAvatars.map(imgPath => {
                const isSelected = user.avatar === imgPath;
                return `
                    <button type="button" class="avatar-pick ${isSelected ? 'selected' : ''}" data-avatar="${imgPath}" style="width: 50px; height: 50px; border-radius: 50%; overflow: hidden; border: ${isSelected ? '2px solid #00f2fe' : '1px solid rgba(255,255,255,0.2)'}; background: #0a0a14; padding: 0; cursor: pointer; transition: 0.2s;">
                        <img src="${imgPath}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;">
                    </button>
                `;
            }).join('');

            // Bind click events to quickly switch active avatars
            editAvatarPicker.querySelectorAll('.avatar-pick').forEach(btn => {
                btn.onclick = (e) => {
                    const chosenAvatar = e.currentTarget.getAttribute('data-avatar');
                    user.avatar = chosenAvatar;
                    saveUserToCloud(user);
                    refreshProfileUI();
                };
            });
        }

        renderDirectoryList(document.getElementById('global-profile-search')?.value || '');
    }

    // Form submission & search bindings
    const createForm = document.getElementById('create-account-form');
    if (createForm) {
        createForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById('new-username');
            const bioInput = document.getElementById('new-bio');
            const username = usernameInput ? usernameInput.value.trim() : '';
            const bio = bioInput ? bioInput.value.trim() : '';
            if (!username) return;

            const newUser = {
                id: 'cadet_' + Date.now(),
                username: username,
                bio: bio || 'AI Explorer',
                avatar: 'images/Designer (1).png',
                background: 'bg_default',
                xp: 100,
                scores: { rocket: 0, blockblast: 0, pirate: 0 },
                unlocks: ['bg_default']
            };

            saveUserToCloud(newUser);
            localStorage.setItem(STORAGE_CURRENT_ID, newUser.id);
            refreshProfileUI();
        });
    }

    // Profile info edit updater button binding
    const saveEditsBtn = document.getElementById('btn-save-profile-edits');
    if (saveEditsBtn) {
        saveEditsBtn.onclick = () => {
            const user = getActiveUser();
            if (!user) {
                alert("No active profile found!");
                return;
            }

            const newUsernameInput = document.getElementById('edit-username-input');
            const newBioInput = document.getElementById('edit-bio-input');

            if (newUsernameInput && newUsernameInput.value.trim()) {
                user.username = newUsernameInput.value.trim();
            }
            if (newBioInput) {
                user.bio = newBioInput.value.trim();
            }

            saveUserToCloud(user);
            refreshProfileUI();
            alert("Profile info updated successfully!");
        };
    }

    const searchInput = document.getElementById('global-profile-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderDirectoryList(e.target.value);
        });
    }

    document.addEventListener('DOMContentLoaded', initRealtimeSync);
    initRealtimeSync();
})();

// ============================================================================
// SECURITY & ANTI-CHEAT DEFENSE SYSTEM
// ============================================================================
const PortalSecurity = (() => {

    // 1. Input Sanitization (Prevents XSS / HTML Injection in Usernames & Bios)
    function escapeHTML(str) {
        if (!str) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag]));
    }

    // 2. Profanity & Restricted Word Filter
    const blockedWords = ['shit', 'fuck', 'gay', 'bitch', 'asshole','slut','dick','nigger','cunt','nigga','faggot']; // Add restricted terms here
    function containsProfanity(text) {
        if (!text) return false;
        const lowerText = text.toLowerCase();
        return blockedWords.some(word => lowerText.includes(word.toLowerCase()));
    }

    // 3. Score & XP Integrity Validator (Prevents LocalStorage Tampering)
    function validateUserMetrics(user) {
        if (!user) return user;

        // Cap XP to valid bounds (e.g., between 0 and 100,000)
        if (typeof user.xp !== 'number' || isNaN(user.xp) || user.xp < 0) {
            user.xp = 0;
        } else if (user.xp > 100000) {
            user.xp = 100000; // Hard cap
        }

        // Validate arcade scores for each game
        if (!user.scores || typeof user.scores !== 'object') {
            user.scores = { rocket: 0, blockblast: 0, angrybirds: 0 };
        } else {
            const maxScoreLimit = 50000; // Max realistic score per session
            ['rocket', 'blockblast', 'angrybirds'].forEach(game => {
                if (typeof user.scores[game] !== 'number' || isNaN(user.scores[game]) || user.scores[game] < 0) {
                    user.scores[game] = 0;
                } else if (user.scores[game] > maxScoreLimit) {
                    user.scores[game] = maxScoreLimit; // Cap impossible scores
                }
            });
        }

        return user;
    }

    // 4. Rate Limiting / Action Cooldown (Prevents Auto-Clicker / Spam Exploits)
    let lastActionTimestamp = 0;
    function checkRateLimit(cooldownMs = 1000) {
        const now = Date.now();
        if (now - lastActionTimestamp < cooldownMs) {
            console.warn("Rate limit exceeded. Slow down.");
            return false; // Action blocked
        }
        lastActionTimestamp = now;
        return true; // Action allowed
    }

    return {
        escapeHTML,
        containsProfanity,
        validateUserMetrics,
        checkRateLimit
    };
})();

// Auto-open tab if arriving from another page with a hash (e.g. index.html#profile) - a debugger since it recrrects certain aspects of code in
document.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
        const targetViewId = hash + '-page-view'; // turns 'profile' into 'profile-page-view'
        if (typeof switchView === 'function') {
            switchView(targetViewId);
        } else if (typeof showPage === 'function') {
            showPage(targetViewId);
        }
    }
});

window.syncReferencesToProfileTheme = function() {
    // 1. Get the current active user's background theme choice from localStorage or your user object
    const activeTheme = localStorage.getItem('ai_portal_active_theme') || 'bg_default';

    // 2. Map of your background image URLs (same as your profile system)
    const backgroundMap = {
        'bg_default': '',
        'bg_electric_blue': 'images/Designer (5).png',
        'bg_true_gold': 'images/generate_image_02.png',
        'bg_deep_space': 'images/generate_a_flat_front-facing_full-bleed_deep_space_cosmic_ba.jpg',
        'bg_scrappy_console': 'images/b649ac97-d785-4643-951c-191279da5b6b.jpg',
        'bg_robot_painting': 'images/Untitled Design (2).png',
    };

    // 3. Target your references container element on the page
    const referencesView = document.getElementById('references-page-view') || document.querySelector('.references-page');

    if (referencesView) {
        // Clear any old theme classes
        const classListArray = Array.from(referencesView.classList).filter(cls => !cls.startsWith('theme-'));
        referencesView.className = classListArray.join(' ');
        
        // Apply the profile's active theme class to the references container
        referencesView.classList.add(`theme-${activeTheme}`);

        // Paint the background image and gradient overlay so it matches the profile look identically
        referencesView.style.backgroundImage = '';
        referencesView.style.backgroundSize = 'cover';
        referencesView.style.backgroundPosition = 'center';

        if (backgroundMap[activeTheme]) {
            referencesView.style.backgroundImage = `linear-gradient(rgba(10, 10, 20, 0.85), rgba(10, 10, 20, 0.95)), url('${backgroundMap[activeTheme]}')`;
        }
    }
};