/*
 * AI Learning Portal - JavaScript App
 * TSA Webmaster Competition - Hand-coded HTML5, CSS3, Modern JavaScript
 * Gamified Arcade Rocket, Drag-and-Drop Block Blast, and Pirate Ship Cannon Minigames Engine
 */

let maxUnlockedModule = parseInt(localStorage.getItem('maxUnlockedModule')) || 1;

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initProgressTracking();
    initBadgeSystem();
    initChatbot();
    updateModuleLockUI();

    // Handle hash routing from references or direct bookmarking
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

    if (homeView) homeView.style.display = 'none';
    if (modulesGridView) modulesGridView.style.display = 'none';
    if (modulesPageView) modulesPageView.style.display = 'none';
    if (dashboardView) dashboardView.style.display = 'none';

    if (pageId === 'modules-grid' || pageId === 'modules') {
        if (modulesGridView) {
            modulesGridView.style.display = 'block';
            updateModuleLockUI();
        }
    } else if (pageId === 'home') {
        if (homeView) homeView.style.display = 'block';
    } else if (pageId === 'dashboard') {
        if (dashboardView) {
            dashboardView.style.display = 'block';
            updateDashboardStats();
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

    // Check all 9 badges dynamically
    for (let i = 1; i <= 9; i++) {
        const badge = document.getElementById(`badge-${i}`);
        if (badge) {
            let isUnlocked = false;
            if (i <= 6) {
                isUnlocked = unlocked >= i;
            } else if (i === 7) {
                isUnlocked = unlocked >= 3; // Quiz Ace
            } else if (i === 8) {
                isUnlocked = unlocked >= 2; // Arcade Pro
            } else if (i === 9) {
                isUnlocked = unlocked >= 6; // Streak Master
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
                    <h3>What is Machine Learning?</h3>
                    <p>Machine Learning (ML) is a branch of artificial intelligence where algorithms identify statistical patterns in large datasets to make accurate predictions on new data without being explicitly programmed with manual IF-THEN rules.</p>
                    <h3>Key Learning Paradigms</h3>
                    <ul>
                        <li><strong>Supervised Learning:</strong> Models learn using labeled input-output pairs (e.g., training a spam filter on labeled emails).</li>
                        <li><strong>Unsupervised Learning:</strong> Models discover natural clusters or patterns in unlabeled data.</li>
                        <li><strong>Reinforcement Learning:</strong> Agents learn optimal actions through trial-and-error rewards.</li>
                    </ul>
                `
            },
            2: {
                title: "1.2 Neural Networks & Deep Learning",
                type: "blockblast",
                content: `
                    <h3>Artificial Neural Networks (ANNs)</h3>
                    <p>Neural networks are computational structures inspired by the human brain's interconnected biological neurons, featuring input, hidden, and output layers.</p>
                    <h3>Deep Learning & Transformers</h3>
                    <p>Deep Learning uses networks with many hidden layers for hierarchical feature learning. Modern LLMs use Transformer architectures powered by Self-Attention mechanisms.</p>
                `
            },
            3: {
                title: "1.3 Computer Vision & Generative AI Risks",
                type: "angrybirds",
                content: `
                    <h3>Computer Vision (CV)</h3>
                    <p>Computer Vision enables machines to analyze, interpret, and extract visual semantics from digital images and videos using CNNs.</p>
                    <h3>Generative Model Hallucinations</h3>
                    <p>Generative models occasionally output plausibly structured but factually false information known as hallucinations. Verification against primary sources is mandatory.</p>
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
    modal.className = 'quiz-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(5, 5, 15, 0.95); display: flex; justify-content: center;
        align-items: center; z-index: 10000; padding: 20px; box-sizing: border-box;
    `;

    modal.innerHTML = `
        <div style="background: #161625; border: 2px solid #00f2fe; border-radius: 12px; padding: 35px; max-width: 600px; width: 100%; color: #fff; box-shadow: 0 0 35px rgba(0,242,254,0.4); text-align: left;">
            <h2 style="color: #00f2fe; margin-top: 0; font-size: 24px; text-align: center; font-family: 'Orbitron', sans-serif;">📜 Mission Briefing: ${gameTitle}</h2>
            <div style="margin: 20px 0; line-height: 1.6; color: #d1d5db; font-size: 15px;">
                ${rulesHTML}
            </div>
            <button id="btn-start-mission" style="width: 100%; padding: 14px; background: linear-gradient(135deg, #00f2fe 0%, #2563eb 100%); color: #fff; border: none; border-radius: 6px; font-weight: bold; font-size: 16px; cursor: pointer; box-shadow: 0 4px 15px rgba(0,242,254,0.4); font-family: 'Orbitron', sans-serif;">
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
// MINIGAME 1: ROCKET SPACE SHOOTER
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
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(5, 5, 12, 0.95); display: flex; justify-content: center;
        align-items: center; z-index: 10000; padding: 20px; box-sizing: border-box;
    `;
    document.body.appendChild(modal);

    function renderQuestionStep() {
        if (currentQ >= questions.length) {
            renderFinalSummary();
            return;
        }

        const qData = questions[currentQ];
        modal.innerHTML = `
            <div style="background: #12121e; border: 2px solid #00f2fe; border-radius: 12px; padding: 30px; max-width: 600px; width: 100%; color: #fff; box-shadow: 0 0 30px rgba(0,242,254,0.3);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <span style="color: #60a5fa; font-weight: bold;">Question ${currentQ + 1} of ${questions.length}</span>
                    <span style="background: #1e1e2e; padding: 4px 12px; border-radius: 20px; color: #00f2fe; border: 1px solid #00f2fe;">Credits: ${credits} 💰</span>
                </div>
                <h2 style="font-size: 20px; margin-bottom: 20px; color: #fff;">${qData.question}</h2>
                <div class="options-container" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
                    ${qData.options.map((opt, i) => `
                        <button class="opt-btn" data-idx="${i}" style="padding: 12px; background: #1e1e2e; border: 1px solid #3f3f46; color: #fff; border-radius: 6px; text-align: left; cursor: pointer; font-size: 15px;">${opt}</button>
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
                    btn.style.background = '#2ed573';
                    btn.style.borderColor = '#2ed573';
                    btn.innerHTML += ' ✓';
                    credits += 100;
                    quizScore++;
                } else {
                    btn.style.background = '#ff4757';
                    btn.style.borderColor = '#ff4757';
                    btn.innerHTML += ' ✗';
                    allBtns[qData.correct].style.background = '#2ed573';
                    allBtns[qData.correct].style.borderColor = '#2ed573';
                }

                setTimeout(() => launchSpaceWave(), 1000);
            });
        });
    }

    function launchSpaceWave() {
        modal.innerHTML = `
            <div style="background: #0a0a14; border: 2px solid #3b82f6; border-radius: 12px; padding: 20px; max-width: 700px; width: 100%; color: #fff; text-align: center;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span style="color: #00f2fe; font-weight: bold;">Wave ${currentQ + 1} - Rocket Defense</span>
                    <span id="game-timer" style="color: #ff4757; font-weight: bold;">Time: 30s</span>
                    <span id="game-score" style="color: #2ed573;">Score: ${spaceScore}</span>
                </div>
                <canvas id="spaceCanvas" width="640" height="360" style="background: #000; border: 1px solid #333; border-radius: 6px; width: 100%; height: auto;"></canvas>
                <p style="color: #aaa; font-size: 13px; margin-top: 8px;">Use <strong>LEFT / RIGHT Arrows (or A/D)</strong> to Move | Press <strong>UP Arrow (W / Space)</strong> to Shoot!</p>
            </div>
        `;

        const canvas = document.getElementById('spaceCanvas');
        const ctx = canvas.getContext('2d');
        let timeLeft = 30;

        let player = { x: canvas.width / 2 - 18, y: canvas.height - 42, w: 36, h: 36, speed: shipSpeedBoost ? 10 : 6 };
        let bullets = [];
        let asteroids = [];
        let keys = {};

        const keydownHandler = (e) => { keys[e.code] = true; };
        const keyupHandler = (e) => { keys[e.code] = false; };
        window.addEventListener('keydown', keydownHandler);
        window.addEventListener('keyup', keyupHandler);

        let lastShoot = 0;

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

            ctx.fillStyle = '#ffffff';
            for (let i = 0; i < 20; i++) {
                ctx.fillRect((i * 47) % canvas.width, (i * 29 + now * 0.05) % canvas.height, 2, 2);
            }

            if ((keys['ArrowLeft'] || keys['KeyA']) && player.x > 0) player.x -= player.speed;
            if ((keys['ArrowRight'] || keys['KeyD']) && player.x < canvas.width - player.w) player.x += player.speed;

            const shootCooldown = rapidFire ? 150 : 350;
            if ((keys['ArrowUp'] || keys['KeyW'] || keys['Space']) && now - lastShoot > shootCooldown) {
                if (tripleBullets) {
                    bullets.push({ x: player.x + 2, y: player.y, w: 4, h: 12 });
                    bullets.push({ x: player.x + player.w / 2 - 2, y: player.y - 4, w: 4, h: 12 });
                    bullets.push({ x: player.x + player.w - 6, y: player.y, w: 4, h: 12 });
                } else if (doubleLaser) {
                    bullets.push({ x: player.x + 6, y: player.y, w: 4, h: 12 });
                    bullets.push({ x: player.x + player.w - 10, y: player.y, w: 4, h: 12 });
                } else {
                    bullets.push({ x: player.x + player.w / 2 - 2, y: player.y, w: 4, h: 12 });
                }
                lastShoot = now;
            }

            ctx.save();
            ctx.translate(player.x + player.w / 2, player.y + player.h / 2);
            ctx.fillStyle = '#e2e8f0';
            ctx.beginPath();
            ctx.moveTo(0, -18);
            ctx.lineTo(12, 10);
            ctx.lineTo(8, 16);
            ctx.lineTo(-8, 16);
            ctx.lineTo(-12, 10);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.moveTo(0, -18);
            ctx.lineTo(8, -2);
            ctx.lineTo(-8, -2);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#00f2fe';
            ctx.beginPath();
            ctx.arc(0, -4, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            ctx.fillStyle = '#00f2fe';
            for (let i = bullets.length - 1; i >= 0; i--) {
                bullets[i].y -= 8;
                ctx.fillRect(bullets[i].x, bullets[i].y, bullets[i].w, bullets[i].h);
                if (bullets[i].y < 0) bullets.splice(i, 1);
            }

            if (Math.random() < 0.045) {
                asteroids.push({
                    x: Math.random() * (canvas.width - 40),
                    y: -35,
                    size: 30 + Math.random() * 15,
                    speed: 1.8 + Math.random() * 2.2,
                    rot: Math.random() * Math.PI,
                    rotSpeed: (Math.random() - 0.5) * 0.03
                });
            }

            for (let i = asteroids.length - 1; i >= 0; i--) {
                let ast = asteroids[i];
                ast.y += ast.speed;
                ast.rot += ast.rotSpeed;

                ctx.save();
                ctx.translate(ast.x + ast.size / 2, ast.y + ast.size / 2);
                ctx.rotate(ast.rot);

                ctx.fillStyle = '#64748b';
                ctx.strokeStyle = '#475569';
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

                for (let j = bullets.length - 1; j >= 0; j--) {
                    let b = bullets[j];
                    if (b.x < ast.x + ast.size && b.x + b.w > ast.x && b.y < ast.y + ast.size && b.y + b.h > ast.y) {
                        asteroids.splice(i, 1);
                        bullets.splice(j, 1);
                        spaceScore += 20 * pointMultiplier;
                        const scoreEl = document.getElementById('game-score');
                        if (scoreEl) scoreEl.textContent = `Score: ${spaceScore}`;
                        break;
                    }
                }

                if (ast && player.x < ast.x + ast.size && player.x + player.w > ast.x && player.y < ast.y + ast.size && player.y + player.h > ast.y) {
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
            <div style="background: #121224; border: 2px solid #a855f7; border-radius: 12px; padding: 25px; max-width: 600px; width: 100%; color: #fff; text-align: center;">
                <h2 style="color: #a855f7; margin-top: 0; font-family: 'Orbitron', sans-serif;">🛠️ Rocket Armory Upgrades</h2>
                <p style="color: #aaa;">Your Credits: <strong style="color: #00f2fe;">${credits} 💰</strong></p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0;">
                    <button id="buy-speed" style="padding: 10px; background: #1e1e2e; border: 1px solid #a855f7; color: #fff; border-radius: 6px; cursor: pointer; font-size: 13px;">
                        🚀 Faster Ship (50 💰) ${shipSpeedBoost ? '✅' : ''}
                    </button>
                    <button id="buy-double" style="padding: 10px; background: #1e1e2e; border: 1px solid #a855f7; color: #fff; border-radius: 6px; cursor: pointer; font-size: 13px;">
                        🔫 Double Laser (75 💰) ${doubleLaser ? '✅' : ''}
                    </button>
                    <button id="buy-rapid" style="padding: 10px; background: #1e1e2e; border: 1px solid #a855f7; color: #fff; border-radius: 6px; cursor: pointer; font-size: 13px;">
                        ⚡ Rapid Fire (100 💰) ${rapidFire ? '✅' : ''}
                    </button>
                    <button id="buy-triple" style="padding: 10px; background: #1e1e2e; border: 1px solid #a855f7; color: #fff; border-radius: 6px; cursor: pointer; font-size: 13px;">
                        💥 Triple Bullets (150 💰) ${tripleBullets ? '✅' : ''}
                    </button>
                    <button id="buy-mult" style="grid-column: span 2; padding: 10px; background: #1e1e2e; border: 1px solid #a855f7; color: #fff; border-radius: 6px; cursor: pointer; font-size: 13px;">
                        🌟 2x Score Multiplier (125 💰) ${pointMultiplier > 1 ? '✅' : ''}
                    </button>
                </div>
                <button id="skip-shop" style="width: 100%; padding: 12px; background: #333; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
                    Skip Shop & Continue →
                </button>
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

    function renderFinalSummary() {
        const totalPoints = (quizScore * 100) + spaceScore;
        const passed = quizScore >= 4;
        if (passed && modId >= maxUnlockedModule && maxUnlockedModule < 6) {
            maxUnlockedModule = parseInt(modId) + 1;
            localStorage.setItem('maxUnlockedModule', maxUnlockedModule);
            updateModuleLockUI();
        }
        modal.innerHTML = `
            <div style="background: #12121e; border: 2px solid #00f2fe; border-radius: 12px; padding: 30px; max-width: 550px; width: 100%; color: #fff; text-align: center;">
                <h1 style="color: #00f2fe; margin-top: 0; font-family: 'Orbitron', sans-serif;">🚀 Rocket Challenge Complete!</h1>
                <h3>Quiz Score: ${quizScore} / ${questions.length}</h3>
                <p style="color: #2ed573;">Arcade Score: ${spaceScore} pts</p>
                <p style="font-weight: bold; color: #eccc68;">Total Score: ${totalPoints} PTS</p>
                <button id="close-final" style="width: 100%; padding: 12px; background: #2563eb; color: #fff; border: none; border-radius: 6px; cursor: pointer; margin-top: 15px;">Continue</button>
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
// MINIGAME 2: BLOCK BLAST GRID PUZZLE
// ============================================================================
function runBlockBlastGame(modId, subId, key) {
    const questions = arcadeQuizDB[key] || arcadeQuizDB["1.2"];
    let currentQ = 0;
    let gridScore = 0;
    let quizScore = 0;
    let grid = Array(8).fill(null).map(() => Array(8).fill(0));
    let trayBlocks = [];
    let selectedTrayIndex = null;

    const modal = document.createElement('div');
    modal.className = 'quiz-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(5, 5, 12, 0.95); display: flex; justify-content: center;
        align-items: center; z-index: 10000; padding: 20px; box-sizing: border-box;
    `;
    document.body.appendChild(modal);

    function renderQuestionStep() {
        if (currentQ >= questions.length) {
            renderFinalSummary();
            return;
        }

        const qData = questions[currentQ];
        modal.innerHTML = `
            <div style="background: #12121e; border: 2px solid #a855f7; border-radius: 12px; padding: 30px; max-width: 600px; width: 100%; color: #fff;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                    <span style="color: #a855f7; font-weight: bold;">Question ${currentQ + 1} of ${questions.length}</span>
                    <span style="color: #2ed573;">Block Blast Score: ${gridScore}</span>
                </div>
                <h2 style="font-size: 20px; margin-bottom: 20px;">${qData.question}</h2>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${qData.options.map((opt, i) => `
                        <button class="opt-btn" data-idx="${i}" style="padding: 12px; background: #1e1e2e; border: 1px solid #3f3f46; color: #fff; border-radius: 6px; text-align: left; cursor: pointer;">${opt}</button>
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
                    btn.style.background = '#2ed573';
                    btn.style.borderColor = '#2ed573';
                    btn.innerHTML += ' ✓';
                    quizScore++;
                    generateTrayBlocks();
                    setTimeout(() => renderPuzzleBoard(), 1000);
                } else {
                    btn.style.background = '#ff4757';
                    btn.style.borderColor = '#ff4757';
                    btn.innerHTML += ' ✗';
                    allBtns[qData.correct].style.background = '#2ed573';
                    allBtns[qData.correct].style.borderColor = '#2ed573';
                    currentQ++;
                    setTimeout(() => renderQuestionStep(), 1200);
                }
            };
        });
    }

    function generateTrayBlocks() {
        const shapes = [
            [[1, 1], [1, 1]], // Square 2x2
            [[1, 1, 1]],      // Horizontal Line
            [[1], [1], [1]],  // Vertical Line
            [[1, 0], [1, 1]], // L-Shape
            [[1]]             // Single Block
        ];
        trayBlocks = [
            shapes[Math.floor(Math.random() * shapes.length)],
            shapes[Math.floor(Math.random() * shapes.length)],
            shapes[Math.floor(Math.random() * shapes.length)]
        ];
        selectedTrayIndex = 0;
    }

    function triggerHypeText(text) {
        const hype = document.createElement('div');
        hype.textContent = text;
        hype.style.cssText = `
            position: fixed; top: 35%; left: 50%; transform: translate(-50%, -50%);
            font-size: 32px; font-weight: bold; color: #00f2fe; text-shadow: 0 0 15px rgba(0,242,254,0.8);
            z-index: 20000; pointer-events: none; animation: floatUpFade 1.2s ease-out forwards;
        `;
        document.body.appendChild(hype);
        setTimeout(() => hype.remove(), 1200);
    }

    function renderPuzzleBoard() {
        let gridHTML = '<div id="block-grid" style="display: grid; grid-template-columns: repeat(8, 34px); gap: 3px; background: #1a1a2e; padding: 10px; border-radius: 8px; border: 2px solid #3b82f6;">';
        
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const isFilled = grid[r][c] === 1;
                const color = isFilled ? '#a855f7' : '#111118';
                gridHTML += `<div class="grid-cell" data-row="${r}" data-col="${c}" style="width: 34px; height: 34px; background: ${color}; border-radius: 4px; cursor: pointer; border: 1px solid #2d2d42;"></div>`;
            }
        }
        gridHTML += '</div>';

        let trayHTML = '<div style="display: flex; gap: 15px; justify-content: center; margin-top: 20px; background: #181824; padding: 15px; border-radius: 8px;">';
        trayBlocks.forEach((shape, idx) => {
            const isSelected = selectedTrayIndex === idx;
            const borderCol = isSelected ? '#00f2fe' : '#3f3f46';

            let previewHTML = '<div style="display:grid; grid-template-columns:repeat(3, 10px); gap:2px; margin-bottom:5px;">';
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    let active = shape[r] && shape[r][c] === 1;
                    previewHTML += `<div style="width:10px; height:10px; background:${active ? '#a855f7' : 'transparent'}; border-radius:2px;"></div>`;
                }
            }
            previewHTML += '</div>';

            trayHTML += `<div class="tray-piece" data-index="${idx}" style="padding: 8px 12px; background: #1e1e2e; border: 2px solid ${borderCol}; border-radius: 6px; cursor: pointer; text-align: center; display:flex; flex-direction:column; align-items:center;">
                ${previewHTML}
                <span style="font-size: 11px; color: #aaa;">Piece ${idx + 1}</span>
            </div>`;
        });
        trayHTML += '</div>';

        modal.innerHTML = `
            <div style="background: #12121e; border: 2px solid #a855f7; border-radius: 12px; padding: 25px; max-width: 650px; width: 100%; color: #fff; text-align: center;">
                <h3 style="color: #a855f7; margin-top: 0; font-family: 'Orbitron', sans-serif;">🧱 Block Blast Puzzle Arena</h3>
                <p style="font-size: 13px; color: #aaa;">Click a piece in your tray to select it, then click any cell on the 8x8 grid to place it!</p>
                
                <div style="display: flex; justify-content: center; margin: 15px 0;">${gridHTML}</div>
                ${trayHTML}

                <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center;">
                    <button id="next-question-btn" style="padding: 12px 24px; background: #2563eb; color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">Next Question →</button>
                </div>
            </div>
        `;

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

            cell.onmouseenter = () => {
                if (selectedTrayIndex === null || !trayBlocks[selectedTrayIndex]) return;
                const shape = trayBlocks[selectedTrayIndex];
                
                cells.forEach(item => {
                    const ir = parseInt(item.getAttribute('data-row'));
                    const ic = parseInt(item.getAttribute('data-col'));
                    const sr = ir - r;
                    const sc = ic - c;
                    if (grid[ir][ic] === 0) {
                        item.style.background = '#111118';
                        item.style.border = '1px solid #2d2d42';
                    }
                    if (sr >= 0 && sr < shape.length && sc >= 0 && sc < shape[0].length && shape[sr][sc] === 1) {
                        if (grid[ir][ic] === 0) {
                            item.style.background = 'rgba(0, 242, 254, 0.4)';
                            item.style.border = '1px dashed #00f2fe';
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
                renderPuzzleBoard();
            };
        }

        modal.querySelector('#next-question-btn').onclick = () => {
            currentQ++;
            renderQuestionStep();
        };
    }

    function placeBlockAt(r, c) {
        if (selectedTrayIndex === null || !trayBlocks[selectedTrayIndex]) {
            alert("⚠️ Please select a shape from your tray first!");
            return;
        }

        const shape = trayBlocks[selectedTrayIndex];
        let fits = true;
        for (let sr = 0; sr < shape.length; sr++) {
            for (let sc = 0; sc < shape[sr].length; sc++) {
                if (shape[sr][sc] && (r + sr >= 8 || c + sc >= 8 || grid[r + sr][c + sc] === 1)) {
                    fits = false;
                }
            }
        }

        if (fits) {
            for (let sr = 0; sr < shape.length; sr++) {
                for (let sc = 0; sc < shape[sr].length; sc++) {
                    if (shape[sr][sc]) {
                        grid[r + sr][c + sc] = 1;
                    }
                }
            }
            trayBlocks.splice(selectedTrayIndex, 1);
            selectedTrayIndex = trayBlocks.length > 0 ? 0 : null;
            
            const clearedCount = checkGridClears();
            if (clearedCount > 0) {
                const phrases = ["Good Job!", "Excellent!", "Amazing!", "Combo!", "Clever Move!"];
                triggerHypeText(phrases[Math.floor(Math.random() * phrases.length)]);
            }
            
            renderPuzzleBoard();
        } else {
            alert("⚠️ Cannot place piece there! It overlaps or goes out of bounds.");
        }
    }

    function checkGridClears() {
        let clears = 0;
        for (let r = 0; r < 8; r++) {
            if (grid[r].every(v => v === 1)) {
                grid[r] = Array(8).fill(0);
                gridScore += 100;
                clears++;
            }
        }
        for (let c = 0; c < 8; c++) {
            let colFull = true;
            for (let r = 0; r < 8; r++) {
                if (grid[r][c] === 0) colFull = false;
            }
            if (colFull) {
                for (let r = 0; r < 8; r++) grid[r][c] = 0;
                gridScore += 100;
                clears++;
            }
        }
        return clears;
    }

    function renderFinalSummary() {
        const totalPoints = (quizScore * 100) + gridScore;
        const passed = quizScore >= 4;
        if (passed && modId >= maxUnlockedModule && maxUnlockedModule < 6) {
            maxUnlockedModule = parseInt(modId) + 1;
            localStorage.setItem('maxUnlockedModule', maxUnlockedModule);
            updateModuleLockUI();
        }
        modal.innerHTML = `
            <div style="background: #12121e; border: 2px solid #a855f7; border-radius: 12px; padding: 30px; max-width: 550px; width: 100%; color: #fff; text-align: center;">
                <h1 style="color: #a855f7; margin-top: 0; font-family: 'Orbitron', sans-serif;">🧱 Block Blast Complete!</h1>
                <h3>Quiz Score: ${quizScore} / ${questions.length}</h3>
                <p style="color: #2ed573;">Grid Score: ${gridScore} pts</p>
                <p style="font-weight: bold; color: #eccc68;">Total Score: ${totalPoints} PTS</p>
                <button id="close-final" style="width: 100%; padding: 12px; background: #2563eb; color: #fff; border: none; border-radius: 6px; cursor: pointer; margin-top: 15px;">Continue</button>
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
// MINIGAME 3: PIRATE SHIP CANNON LAUNCHER
// ============================================================================
function runAngryBirdsGame(modId, subId, key) {
    const questions = arcadeQuizDB[key] || arcadeQuizDB["1.3"];
    let currentQ = 0;
    let launcherScore = 0;
    let quizScore = 0;
    let credits = 0;
    let currentLevel = 1;

    let heavyBall = false;
    let bombBall = false;
    let scoreMult = 1;

    const modal = document.createElement('div');
    modal.className = 'quiz-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(5, 5, 12, 0.95); display: flex; justify-content: center;
        align-items: center; z-index: 10000; padding: 20px; box-sizing: border-box;
    `;
    document.body.appendChild(modal);

    function renderQuestionStep() {
        if (currentQ >= questions.length) {
            renderFinalSummary();
            return;
        }

        const qData = questions[currentQ];
        modal.innerHTML = `
            <div style="background: #12121e; border: 2px solid #ff4757; border-radius: 12px; padding: 30px; max-width: 600px; width: 100%; color: #fff;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                    <span style="color: #ff4757; font-weight: bold;">Question ${currentQ + 1} of ${questions.length} (Pirate Level ${currentLevel})</span>
                    <span style="color: #00f2fe;">Credits: ${credits} 💰</span>
                </div>
                <h2 style="font-size: 20px; margin-bottom: 20px;">${qData.question}</h2>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${qData.options.map((opt, i) => `
                        <button class="opt-btn" data-idx="${i}" style="padding: 12px; background: #1e1e2e; border: 1px solid #3f3f46; color: #fff; border-radius: 6px; text-align: left; cursor: pointer;">${opt}</button>
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
                    btn.style.background = '#2ed573';
                    btn.style.borderColor = '#2ed573';
                    btn.innerHTML += ' ✓';
                    credits += 100;
                    quizScore++;
                } else {
                    btn.style.background = '#ff4757';
                    btn.style.borderColor = '#ff4757';
                    btn.innerHTML += ' ✗';
                    allBtns[qData.correct].style.background = '#2ed573';
                    allBtns[qData.correct].style.borderColor = '#2ed573';
                }

                setTimeout(() => launchPhysicsCanvas(), 1000);
            };
        });
    }

    function launchPhysicsCanvas() {
        let targets = [];
        const rows = 2 + Math.min(2, currentLevel);
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < 3; c++) {
                targets.push({
                    x: 460 + c * 42,
                    y: 170 + r * 42,
                    w: 38,
                    h: 38
                });
            }
        }

        modal.innerHTML = `
            <div style="background: #0a0a14; border: 2px solid #ff4757; border-radius: 12px; padding: 20px; max-width: 700px; width: 100%; color: #fff; text-align: center;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span style="color: #ff4757; font-weight: bold;">Pirate Ship Deck — Level ${currentLevel}</span>
                    <span id="birds-score" style="color: #2ed573;">Score: ${launcherScore}</span>
                </div>
                <canvas id="birdsCanvas" width="640" height="360" style="background: #111; border: 1px solid #333; border-radius: 6px; width: 100%; height: auto; cursor: crosshair;"></canvas>
                <p style="color: #aaa; font-size: 13px; margin-top: 8px;">Click & Drag backward on the Cannonball to Aim with Trajectory Arc, Release to Fire!</p>
            </div>
        `;

        const canvas = document.getElementById('birdsCanvas');
        const ctx = canvas.getContext('2d');

        let cannonPos = { x: 90, y: 250 };
        let ball = { x: 90, y: 250, r: 14, vx: 0, vy: 0, launched: false };
        let dragging = false;
        let particles = [];
        let floatingTexts = [];
        let shakeFrames = 0;
        let muzzleFlashFrames = 0;

        canvas.onmousedown = (e) => {
            const rect = canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            if (Math.hypot(mx - ball.x, my - ball.y) < 35 && !ball.launched) dragging = true;
        };

        canvas.onmousemove = (e) => {
            if (dragging) {
                const rect = canvas.getBoundingClientRect();
                ball.x = e.clientX - rect.left;
                ball.y = e.clientY - rect.top;
                if (Math.hypot(ball.x - cannonPos.x, ball.y - cannonPos.y) > 80) {
                    const angle = Math.atan2(ball.y - cannonPos.y, ball.x - cannonPos.x);
                    ball.x = cannonPos.x + Math.cos(angle) * 80;
                    ball.y = cannonPos.y + Math.sin(angle) * 80;
                }
            }
        };

        canvas.onmouseup = () => {
            if (dragging) {
                dragging = false;
                ball.launched = true;
                ball.vx = (cannonPos.x - ball.x) * 0.35;
                ball.vy = (cannonPos.y - ball.y) * 0.35;
                muzzleFlashFrames = 8;
            }
        };

        let animId;
        function loop(now) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.save();
            if (shakeFrames > 0) {
                shakeFrames--;
                ctx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
            }

            let grad = ctx.createLinearGradient(0, 0, 0, 300);
            grad.addColorStop(0, '#1e3a8a');
            grad.addColorStop(1, '#0284c7');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, 300);

            ctx.fillStyle = '#0369a1';
            ctx.beginPath();
            ctx.moveTo(0, 270);
            for (let x = 0; x <= canvas.width; x += 40) {
                ctx.quadraticCurveTo(x + 20, 260 + Math.sin(now * 0.005 + x) * 8, x + 40, 270);
            }
            ctx.lineTo(canvas.width, 300); ctx.lineTo(0, 300);
            ctx.fill();

            ctx.fillStyle = '#78350f';
            ctx.fillRect(0, 290, canvas.width, 70);
            ctx.strokeStyle = '#451a03';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, 290); ctx.lineTo(canvas.width, 290);
            ctx.stroke();

            ctx.save();
            ctx.translate(cannonPos.x, cannonPos.y);
            let angle = dragging ? Math.atan2(ball.y - cannonPos.y, ball.x - cannonPos.x) : -0.2;
            ctx.rotate(angle);
            ctx.fillStyle = '#334155';
            ctx.fillRect(0, -12, 48, 24);
            ctx.restore();

            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.arc(cannonPos.x - 10, cannonPos.y + 12, 10, 0, Math.PI * 2);
            ctx.arc(cannonPos.x + 10, cannonPos.y + 12, 10, 0, Math.PI * 2);
            ctx.fill();

            if (muzzleFlashFrames > 0) {
                muzzleFlashFrames--;
                ctx.fillStyle = '#f59e0b';
                ctx.beginPath();
                ctx.arc(cannonPos.x + Math.cos(angle)*50, cannonPos.y + Math.sin(angle)*50, 16, 0, Math.PI * 2);
                ctx.fill();
            }

            if (dragging) {
                let simX = ball.x;
                let simY = ball.y;
                let simVx = (cannonPos.x - ball.x) * 0.35;
                let simVy = (cannonPos.y - ball.y) * 0.35;
                let simGravity = heavyBall ? 0.5 : 0.35;

                ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.lineWidth = 2;
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                ctx.moveTo(simX, simY);
                for (let step = 0; step < 25; step++) {
                    simX += simVx;
                    simY += simVy;
                    simVy += simGravity;
                    ctx.lineTo(simX, simY);
                }
                ctx.stroke();
                ctx.setLineDash([]);
            }

            targets.forEach((t, i) => {
                ctx.fillStyle = '#854d0e';
                ctx.fillRect(t.x, t.y, t.w, t.h);
                ctx.strokeStyle = '#422006';
                ctx.lineWidth = 3;
                ctx.strokeRect(t.x, t.y, t.w, t.h);
                ctx.beginPath();
                ctx.moveTo(t.x, t.y); ctx.lineTo(t.x + t.w, t.y + t.h);
                ctx.moveTo(t.x + t.w, t.y); ctx.lineTo(t.x, t.y + t.h);
                ctx.stroke();

                if (ball.x + ball.r > t.x && ball.x - ball.r < t.x + t.w && ball.y + ball.r > t.y && ball.y - ball.r < t.y + t.h) {
                    targets.splice(i, 1);
                    launcherScore += 50 * scoreMult;
                    shakeFrames = 12;

                    for (let p = 0; p < 12; p++) {
                        particles.push({
                            x: t.x + t.w / 2,
                            y: t.y + t.h / 2,
                            vx: (Math.random() - 0.5) * 8,
                            vy: (Math.random() - 0.5) * 8,
                            color: Math.random() > 0.5 ? '#b45309' : '#d97706',
                            alpha: 1.0,
                            size: 3 + Math.random() * 4
                        });
                    }

                    floatingTexts.push({
                        text: `+${50 * scoreMult} PTS!`,
                        x: t.x,
                        y: t.y,
                        alpha: 1.0
                    });

                    const scoreEl = document.getElementById('birds-score');
                    if (scoreEl) scoreEl.textContent = `Score: ${launcherScore}`;

                    if (bombBall) {
                        targets = targets.filter(other => Math.hypot(other.x - t.x, other.y - t.y) > 75);
                    }
                }
            });

            for (let i = particles.length - 1; i >= 0; i--) {
                let pt = particles[i];
                pt.x += pt.vx;
                pt.y += pt.vy;
                pt.alpha -= 0.03;
                ctx.fillStyle = pt.color;
                ctx.globalAlpha = Math.max(0, pt.alpha);
                ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
                ctx.globalAlpha = 1.0;
                if (pt.alpha <= 0) particles.splice(i, 1);
            }

            for (let i = floatingTexts.length - 1; i >= 0; i--) {
                let ft = floatingTexts[i];
                ft.y -= 1.2;
                ft.alpha -= 0.025;
                ctx.fillStyle = '#2ed573';
                ctx.font = 'bold 16px Orbitron, sans-serif';
                ctx.globalAlpha = Math.max(0, ft.alpha);
                ctx.fillText(ft.text, ft.x, ft.y);
                ctx.globalAlpha = 1.0;
                if (ft.alpha <= 0) floatingTexts.splice(i, 1);
            }

            if (dragging) {
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 3;
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
            ctx.arc(ball.x - 4, ball.y - 4, 3, 0, Math.PI * 2);
            ctx.fill();

            if (ball.launched) {
                ball.x += ball.vx;
                ball.y += ball.vy;
                ball.vy += heavyBall ? 0.5 : 0.35;

                if (targets.length === 0) {
                    cancelAnimationFrame(animId);
                    currentLevel++;
                    setTimeout(openBirdsShop, 500);
                    return;
                }

                if (ball.y > 290 || ball.x > canvas.width || ball.x < 0) {
                    cancelAnimationFrame(animId);
                    setTimeout(openBirdsShop, 500);
                    return;
                }
            }

            ctx.restore();
            animId = requestAnimationFrame(loop);
        }

        loop(0);
    }

    function openBirdsShop() {
        modal.innerHTML = `
            <div style="background: #121224; border: 2px solid #ff4757; border-radius: 12px; padding: 25px; max-width: 600px; width: 100%; color: #fff; text-align: center;">
                <h2 style="color: #ff4757; margin-top: 0; font-family: 'Orbitron', sans-serif;">🏹 Launcher Power-Up Shop</h2>
                <p>Credits: <strong style="color: #00f2fe;">${credits} 💰</strong></p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0;">
                    <button id="buy-heavy" style="padding: 10px; background: #1e1e2e; border: 1px solid #ff4757; color: #fff; border-radius: 6px; cursor: pointer;">
                        💣 Heavy Iron Ball (50 💰) ${heavyBall ? '✅' : ''}
                    </button>
                    <button id="buy-bomb" style="padding: 10px; background: #1e1e2e; border: 1px solid #ff4757; color: #fff; border-radius: 6px; cursor: pointer;">
                        💥 Explosive Bomb (100 💰) ${bombBall ? '✅' : ''}
                    </button>
                    <button id="buy-mult" style="grid-column: span 2; padding: 10px; background: #1e1e2e; border: 1px solid #ff4757; color: #fff; border-radius: 6px; cursor: pointer;">
                        🌟 2x Multiplier (75 💰) ${scoreMult > 1 ? '✅' : ''}
                    </button>
                </div>
                <button id="skip-shop" style="width: 100%; padding: 12px; background: #333; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
                    Skip Shop & Next Question →
                </button>
            </div>
        `;

        modal.querySelector('#buy-heavy').onclick = () => {
            if (credits >= 50 && !heavyBall) { credits -= 50; heavyBall = true; openBirdsShop(); }
            else alert("Cannot purchase!");
        };
        modal.querySelector('#buy-bomb').onclick = () => {
            if (credits >= 100 && !bombBall) { credits -= 100; bombBall = true; openBirdsShop(); }
            else alert("Cannot purchase!");
        };
        modal.querySelector('#buy-mult').onclick = () => {
            if (credits >= 75 && scoreMult === 1) { credits -= 75; scoreMult = 2; openBirdsShop(); }
            else alert("Cannot purchase!");
        };
        modal.querySelector('#skip-shop').onclick = () => {
            currentQ++;
            renderQuestionStep();
        };
    }

    function renderFinalSummary() {
        const totalPoints = (quizScore * 100) + launcherScore;
        const passed = quizScore >= 4;
        if (passed && modId >= maxUnlockedModule && maxUnlockedModule < 6) {
            maxUnlockedModule = parseInt(modId) + 1;
            localStorage.setItem('maxUnlockedModule', maxUnlockedModule);
            updateModuleLockUI();
        }
        modal.innerHTML = `
            <div style="background: #12121e; border: 2px solid #ff4757; border-radius: 12px; padding: 30px; max-width: 550px; width: 100%; color: #fff; text-align: center;">
                <h1 style="color: #ff4757; margin-top: 0; font-family: 'Orbitron', sans-serif;">🏹 Launcher Challenge Complete!</h1>
                <h3>Quiz Score: ${quizScore} / ${questions.length}</h3>
                <p style="color: #2ed573;">Launcher Score: ${launcherScore} pts</p>
                <p style="font-weight: bold; color: #eccc68;">Total Score: ${totalPoints} PTS</p>
                <button id="close-final" style="width: 100%; padding: 12px; background: #2563eb; color: #fff; border: none; border-radius: 6px; cursor: pointer; margin-top: 15px;">Continue</button>
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