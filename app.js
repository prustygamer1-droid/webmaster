/*
 * AI Learning Portal - JavaScript App
 * TSA Webmaster Competition - Hand-coded HTML5, CSS3, Modern JavaScript
 * Interactive modules, progressive unlocking, quiz system, XP/badges, page routing, and chatbot widget
 */

// Track unlocked modules (Module 1 is always unlocked by default)
let maxUnlockedModule = parseInt(localStorage.getItem('maxUnlockedModule')) || 1;

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initModuleQuizzes();
    initProgressTracking();
    initBadgeSystem();
    initChatbot();
    updateModuleLockUI();
});

// Navigation link highlighting
function initNavbar() {
    const links = document.querySelectorAll('.navbar .nav-links a, nav a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

// Global SPA Page Switcher
window.showPage = function(pageId) {
    const homeView = document.getElementById('home-page-view');
    const modulesGridView = document.getElementById('modules-grid-view');
    const modulesPageView = document.getElementById('modules-page-view');

    // Hide all views first
    if (homeView) homeView.style.display = 'none';
    if (modulesGridView) modulesGridView.style.display = 'none';
    if (modulesPageView) modulesPageView.style.display = 'none';

    if (pageId === 'modules-grid' || pageId === 'modules') {
        if (modulesGridView) {
            modulesGridView.style.display = 'block';
            updateModuleLockUI();
        }
    } else if (pageId === 'home') {
        if (homeView) homeView.style.display = 'block';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Directly navigate to an unlocked module lesson page
window.navigateToModule = function(moduleId) {
    if (moduleId > maxUnlockedModule) {
        alert(`Module ${moduleId} is locked! Complete Module ${moduleId - 1} first to unlock it.`);
        return;
    }
    window.loadModulePageContent(moduleId);
    
    const homeView = document.getElementById('home-page-view');
    const modulesGridView = document.getElementById('modules-grid-view');
    const modulesPageView = document.getElementById('modules-page-view');

    if (homeView) homeView.style.display = 'none';
    if (modulesGridView) modulesGridView.style.display = 'none';
    if (modulesPageView) modulesPageView.style.display = 'block';

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Update lock status and buttons on the modules grid
function updateModuleLockUI() {
    for (let i = 1; i <= 6; i++) {
        const btn = document.getElementById(`btn-module-${i}`);
        const card = document.getElementById(`card-module-${i}`);

        if (btn) {
            if (i <= maxUnlockedModule) {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
                btn.innerHTML = 'Explore Module';
                if (card) card.style.border = '1px solid #3b82f6';
            } else {
                btn.disabled = true;
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
                btn.innerHTML = '🔒 Locked';
                if (card) card.style.border = '1px solid #27272a';
            }
        }
    }
}

// Module Lessons Data
const moduleLessons = {
    1: {
        title: "Module 1: Fundamental AI Concepts",
        subtitle: "Core Architecture, Machine Learning, and Neural Networks",
        content: `
            <h3>1. Machine Learning Basics</h3>
            <p>Machine Learning (ML) is a subset of AI where systems learn patterns directly from data rather than relying strictly on manually hardcoded rules.</p>
            <h3>2. Neural Networks & Transformers</h3>
            <p>Modern Large Language Models (LLMs) rely on the Transformer architecture, which uses self-attention mechanisms to process text context simultaneously.</p>
            <h3>3. Computer Vision & Hallucinations</h3>
            <p>Computer vision allows AI to parse visual data. However, generative models can occasionally output plausible-sounding but factually incorrect information known as <strong>hallucinations</strong>.</p>
        `
    },
    2: {
        title: "Module 2: Practical AI Tools & Techniques",
        subtitle: "Prompt Engineering, Context Strategy, and Verification",
        content: `
            <h3>1. Effective Prompt Engineering</h3>
            <p>Crafting structured prompts with clear roles, constraints, and instructions significantly improves the quality and accuracy of AI responses.</p>
            <h3>2. Advanced Prompting Frameworks</h3>
            <p>Techniques like <strong>Chain-of-Thought</strong> prompting encourage models to break reasoning down step-by-step, while <strong>Few-Shot Prompting</strong> provides reference examples in the query.</p>
            <h3>3. Verification & Model Temperature</h3>
            <p>Always verify AI outputs against trusted primary sources. Adjusting model temperature controls the randomness and creativity of generated text.</p>
        `
    },
    3: {
        title: "Module 3: Ethical AI Usage & Academic Integrity",
        subtitle: "Citations, Bias Mitigation, and Digital Safety",
        content: `
            <h3>1. Academic Citing Guidelines</h3>
            <p>Using GenAI tools as learning aids is acceptable when properly documented and cited according to institutional academic integrity standards.</p>
            <h3>2. Bias & Data Privacy</h3>
            <p>AI models reflect biases present in their training datasets. Users must remain vigilant regarding personal data privacy and ethical implications.</p>
            <h3>3. Synthetic Media & Student Copyright</h3>
            <p>Deepfakes represent synthetic media risks. Students should utilize a Copyright Checklist to ensure fair use and licensing compliance.</p>
        `
    },
    4: {
        title: "Module 4: Data & Training Frameworks",
        subtitle: "Data Collection, Cleaning, and Model Validation",
        content: `
            <h3>1. Data Cleaning & Preparation</h3>
            <p>High-quality data is required to train reliable models. Preprocessing cleans noise, formats structured entries, and balances representation.</p>
            <h3>2. Supervised vs. Unsupervised Learning</h3>
            <p>Supervised learning relies on labeled datasets for guided training, whereas unsupervised learning identifies intrinsic patterns in unlabeled data.</p>
        `
    },
    5: {
        title: "Module 5: Ethics in Artificial Intelligence",
        subtitle: "Algorithmic Fairness, Accountability, and Transparency",
        content: `
            <h3>1. Algorithmic Bias</h3>
            <p>When training data reflects historical inequalities, machine learning outputs perpetuate those biases without deliberate mitigation.</p>
            <h3>2. Responsible AI Governance</h3>
            <p>Developers must prioritize transparent model evaluation and data privacy protocols to ensure equitable deployment.</p>
        `
    },
    6: {
        title: "Module 6: Testing & Evaluation",
        subtitle: "Benchmark Testing, Accuracy Metrics, and Safety Guardrails",
        content: `
            <h3>1. Benchmarking Metrics</h3>
            <p>AI models undergo evaluation using metrics like precision, recall, and F1-score to assess performance across diverse scenarios.</p>
            <h3>2. Alignment & Safety Guardrails</h3>
            <p>Systems are tested against adversarial inputs to build robust guardrails against unwanted system behaviors.</p>
        `
    }
};

// Render full lesson page view
window.loadModulePageContent = function(moduleId) {
    const lesson = moduleLessons[moduleId] || moduleLessons[1];
    const container = document.getElementById('active-module-content');

    if (container) {
        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #27272a; padding-bottom: 15px;">
                <div>
                    <span style="color: #60a5fa; font-weight: bold; font-size: 14px; text-transform: uppercase;">Module ${moduleId}</span>
                    <h1 style="color: #ffffff; margin: 5px 0 0 0; font-size: 28px;">${lesson.title}</h1>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button onclick="navigateToModule(${moduleId > 1 ? moduleId - 1 : 1})" style="background: #1e1e2e; color: #fff; border: 1px solid #3f3f46; padding: 6px 12px; border-radius: 4px; cursor: pointer;">Prev</button>
                    <button onclick="navigateToModule(${moduleId < maxUnlockedModule ? moduleId + 1 : moduleId})" style="background: #1e1e2e; color: #fff; border: 1px solid #3f3f46; padding: 6px 12px; border-radius: 4px; cursor: pointer;">Next</button>
                </div>
            </div>
            
            <p style="color: #9ca3af; font-size: 16px; margin-bottom: 25px;">${lesson.subtitle}</p>
            
            <div class="lesson-body" style="line-height: 1.8; font-size: 16px; color: #e5e7eb; margin-bottom: 35px;">
                ${lesson.content}
            </div>
            
            <div style="background: #1e1e2e; padding: 25px; border-radius: 8px; text-align: center; border: 1px solid #27272a;">
                <h3 style="margin-top: 0; color: #fff; font-size: 20px;">Ready to test your knowledge?</h3>
                <p style="color: #aaa; margin-bottom: 20px;">Pass the quiz (4/5 correct) to unlock the next module!</p>
                <button onclick="showModuleQuiz(${moduleId})" style="background: #2563eb; color: #fff; border: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 16px;">Take Module ${moduleId} Quiz</button>
            </div>
        `;
    }
};

function initModuleQuizzes() {}

// Quiz Data
const moduleQuizzes = {
    1: {
        title: 'Module 1: Fundamental AI Concepts',
        questions: [
            { question: 'What is Machine Learning?', options: ['A) Computers programmed with explicit rules', 'B) Systems that learn patterns from data', 'C) Hardware that processes faster', 'D) Networks that mimic human brains exactly'], correct: 1 },
            { question: 'Which architecture powers modern Large Language Models?', options: ['A) Decision Trees', 'B) Convolutional Neural Networks', 'C) Transformers', 'D) Hash Tables'], correct: 2 },
            { question: 'What does "training" an AI model refer to?', options: ['A) Writing manual rules', 'B) Adjusting internal weights using data', 'C) Downloading software', 'D) Formatting web pages'], correct: 1 },
            { question: 'What is computer vision primarily used for?', options: ['A) Processing audio files', 'B) Analyzing visual data and images', 'C) Database indexing', 'D) CSS styling'], correct: 1 },
            { question: 'What is a "hallucination" in generative AI?', options: ['A) Hardware overheating', 'B) Confident but factually incorrect outputs', 'C) Fast data streaming', 'D) Syntax error in code'], correct: 1 }
        ]
    },
    2: {
        title: 'Module 2: Practical AI Tools & Techniques',
        questions: [
            { question: 'What is prompt engineering?', options: ['A) Engineering physical server prompts', 'B) Designing effective input queries for AI', 'C) Building GPU hardware for AI', 'D) Creating AI art prompts only'], correct: 1 },
            { question: 'Which strategy improves AI reasoning accuracy?', options: ['A) Chain-of-Thought prompting', 'B) Typing in all capital letters', 'C) Deleting context', 'D) Repeating words'], correct: 0 },
            { question: 'What is Few-Shot Prompting?', options: ['A) Giving zero examples', 'B) Providing a few input/output examples in prompt', 'C) Taking screenshots', 'D) Limiting response length'], correct: 1 },
            { question: 'Why check primary sources when using AI for research?', options: ['A) AI cannot hallucinate', 'B) AI outputs require factual verification', 'C) Google requires it', 'D) To save internet bandwidth'], correct: 1 },
            { question: 'What is "Temperature" in LLM settings?', options: ['A) CPU heat level', 'B) Randomness/creativity level of outputs', 'C) Network latency', 'D) Storage limit'], correct: 1 }
        ]
    },
    3: {
        title: 'Module 3: Ethical AI Usage & Academic Integrity',
        questions: [
            { question: 'When should you cite AI-generated content?', options: ['A) Never, it is not human writing', 'B) Only if directly quoted', 'C) Whenever you use AI ideas or text, even if rephrased', 'D) Only if the teacher explicitly asks'], correct: 2 },
            { question: 'What is academic integrity?', options: ['A) Copying from others', 'B) Submitting AI work as your own', 'C) Honest work and giving proper credit', 'D) Taking shortcuts'], correct: 2 },
            { question: 'Why do AI models exhibit bias?', options: ['A) They are sentient beings', 'B) Biases present in their training data', 'C) Random hardware glitches', 'D) Monitors distort colors'], correct: 1 },
            { question: 'What is Data Privacy in the context of AI?', options: ['A) Hiding your computer screen', 'B) Protecting personal info from being in training sets', 'C) Using browser dark mode', 'D) Encrypting local files'], correct: 1 },
            { question: 'What is Deepfake technology?', options: ['A) Virtual reality software', 'B) AI-synthesized synthetic media and images', 'C) Deep neural network hardware', 'D) 3D printing software'], correct: 1 }
        ]
    }
};

// Show Quiz Overlay & Unlock Next Module upon passing
window.showModuleQuiz = function(moduleNum) {
    const quiz = moduleQuizzes[moduleNum] || moduleQuizzes[1];
    if (!quiz) return;

    const existingModal = document.querySelector('.quiz-modal');
    if (existingModal) existingModal.remove();

    let questionsHTML = '';
    quiz.questions.forEach((q, i) => {
        const optionsHTML = q.options.map((opt, j) => `
            <label class="quiz-option" style="display: block; margin: 8px 0; cursor: pointer;">
                <input type="radio" name="question${i}" value="${j}" class="quiz-radio" style="margin-right: 8px;">
                ${opt}
            </label>
        `).join('');

        questionsHTML += `
            <div class="quiz-question" style="margin-bottom: 20px; background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px;">
                <p style="font-weight: bold; margin-bottom: 10px;">${i + 1}. ${q.question}</p>
                <div class="quiz-options">${optionsHTML}</div>
            </div>
        `;
    });

    const modal = document.createElement('div');
    modal.className = 'quiz-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.85); display: flex; justify-content: center;
        align-items: center; z-index: 10000; padding: 20px; box-sizing: border-box;
    `;

    modal.innerHTML = `
        <div class="quiz-modal-content" style="background: var(--card-bg, #1a1a2e); color: #fff; max-width: 650px; width: 100%; max-height: 85vh; overflow-y: auto; padding: 25px; border-radius: 12px; border: 1px solid var(--accent-cyan, #00f2fe); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <h2 style="color: var(--accent-cyan, #00f2fe); margin-top: 0;">${quiz.title}</h2>
            <div class="quiz-body">${questionsHTML}</div>
            <div class="quiz-submit" style="display: flex; gap: 10px; margin-top: 20px;">
                <button class="btn-submit-quiz" style="flex: 1; padding: 12px; background: var(--accent-blue, #0077ff); color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">Submit Quiz</button>
                <button class="btn-close-quiz" style="padding: 12px 20px; background: #333; color: #fff; border: none; border-radius: 6px; cursor: pointer;">Close</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const submitBtn = modal.querySelector('.btn-submit-quiz');
    submitBtn.addEventListener('click', () => {
        let score = 0;
        let total = quiz.questions.length;

        quiz.questions.forEach((q, i) => {
            const selected = modal.querySelector(`input[name="question${i}"]:checked`);
            const selectedIndex = selected ? parseInt(selected.value) : -1;
            if (selectedIndex === q.correct) score++;
        });

        const passed = score >= 4;
        
        // Unlock next module if current module passed
        if (passed && moduleNum >= maxUnlockedModule && maxUnlockedModule < 6) {
            maxUnlockedModule = parseInt(moduleNum) + 1;
            localStorage.setItem('maxUnlockedModule', maxUnlockedModule);
            updateModuleLockUI();
        }

        const modalContent = modal.querySelector('.quiz-modal-content');
        modalContent.innerHTML = `
            <h2 style="color: var(--accent-cyan, #00f2fe); margin-top: 0;">${quiz.title} Results</h2>
            <h3 style="font-size: 24px; margin: 15px 0;">Score: ${score} / ${total}</h3>
            <div class="quiz-feedback" style="font-size: 18px; margin-bottom: 20px;">
                ${passed ? '🎉 Great job! You passed this module and unlocked the next one!' : 'Good effort! You need 4/5 correct to unlock the next module.'}
            </div>
            <button class="btn-continue" style="width: 100%; padding: 12px; background: var(--accent-blue, #0077ff); color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">Continue</button>
        `;

        if (score > 0 && typeof window.updateProgress === 'function') {
            window.updateProgress(20);
            checkBadges();
        }

        const continueBtn = modalContent.querySelector('.btn-continue');
        continueBtn.addEventListener('click', () => {
            modal.remove();
            showPage('modules-grid');
        });
    });

    const closeBtn = modal.querySelector('.btn-close-quiz');
    closeBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
};

// Progress & Badges
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
    const fill = document.querySelector('.progress-fill');
    const progress = fill ? parseFloat(fill.style.width || '0') : 0;
    const xpDisplay = document.querySelector('.xp-points') || document.querySelector('.xp-value');

    if (progress >= 60) {
        const badges = document.querySelectorAll('.badge');
        badges.forEach((badge, index) => {
            if (index < Math.floor(progress / 30)) {
                badge.classList.add('selected');
                badge.style.color = 'var(--accent-cyan, #00f2fe)';
                badge.style.borderColor = 'var(--accent-cyan, #00f2fe)';
                badge.style.opacity = '1';
            }
        });
        if (xpDisplay) xpDisplay.textContent = `${Math.round((progress / 100) * 300)} XP`;
    }
}

// Chatbot Widget
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
    if (lowerMsg.includes('module') || lowerMsg.includes('quiz')) return "Pass each module's quiz with 4/5 correct to unlock the next module!";
    return "Great question! Ask me about prompt engineering tips, academic integrity rules, or neural networks.";
}