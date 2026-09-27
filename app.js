/*
 * AI Learning Portal - JavaScript App
 * TSA Webmaster Competition - Hand-coded HTML5, CSS3, Modern JavaScript
 * Interactive modules, quiz system, XP/badges, and chatbot widget
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    initNavbar();
    initModuleQuizzes();
    initProgressTracking();
    initBadgeSystem();
    initChatbot();
});

// Navbar: active link highlighting
function initNavbar() {
    const links = document.querySelectorAll('.navbar .nav-links a, nav a');
    
    links.forEach(link => {
        link.addEventListener('click', () => {
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

// Module Quizzes with interactive feedback
function initModuleQuizzes() {
    // Support both .quiz-btn and .btn-quiz selectors
    const quizBtns = document.querySelectorAll('.quiz-btn, .btn-quiz, [onclick*="startQuiz"]');
    
    quizBtns.forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const moduleCard = btn.closest('.module-card');
            // Fallback to button index if data-module is missing on HTML element
            const moduleNum = moduleCard && moduleCard.dataset.module ? moduleCard.dataset.module : (index + 1);
            
            showModuleQuiz(moduleNum);
        });
    });
}

// Full Quiz Data Structure
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

// Show quiz for a specific module
function showModuleQuiz(moduleNum) {
    const quiz = moduleQuizzes[moduleNum];
    if (!quiz) return;

    // Remove existing modal if open
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

    // Handle submit
    const submitBtn = modal.querySelector('.btn-submit-quiz');
    submitBtn.addEventListener('click', () => {
        let score = 0;
        let total = quiz.questions.length;

        quiz.questions.forEach((q, i) => {
            const selected = modal.querySelector(`input[name="question${i}"]:checked`);
            const selectedIndex = selected ? parseInt(selected.value) : -1;

            if (selectedIndex === q.correct) {
                score++;
            }
        });

        const modalContent = modal.querySelector('.quiz-modal-content');
        modalContent.innerHTML = `
            <h2 style="color: var(--accent-cyan, #00f2fe); margin-top: 0;">${quiz.title} - Results</h2>
            <h3 style="font-size: 24px; margin: 15px 0;">Score: ${score} / ${total}</h3>
            <div class="quiz-feedback" style="font-size: 18px; margin-bottom: 20px;">
                ${score >= 4 ? 'Great job! You passed this module! 🎓' : 'Good effort! Review the module and try again!'}
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
        });
    });

    // Handle close
    const closeBtn = modal.querySelector('.btn-close-quiz');
    closeBtn.addEventListener('click', () => {
        modal.remove();
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Progress Tracking
function initProgressTracking() {
    const progressBars = document.querySelectorAll('.progress-bar');
    
    progressBars.forEach(section => {
        const bar = section.querySelector('.progress-fill');
        if (bar && !bar.style.width) {
            bar.style.width = '20%';
        }
    });

    window.updateProgress = function(points) {
        const fill = document.querySelector('.progress-fill');
        const text = document.querySelector('.progress-bar p') || document.querySelector('.progress-text');
        
        if (fill) {
            const currentWidth = parseFloat(fill.style.width || '20');
            const newWidth = Math.min(currentWidth + points, 100);
            fill.style.width = `${newWidth}%`;
            
            if (text) {
                text.textContent = `${Math.round(newWidth)}% Complete`;
            }
        }
    };
}

// Badge System
function initBadgeSystem() {
    const badges = document.querySelectorAll('.badge');

    badges.forEach(badge => {
        badge.addEventListener('click', () => {
            badge.classList.toggle('selected');
            
            if (badge.classList.contains('selected')) {
                badge.style.color = 'var(--accent-cyan, #00f2fe)';
                badge.style.borderColor = 'var(--accent-cyan, #00f2fe)';
                badge.style.opacity = '1';
            } else {
                badge.style.color = 'var(--text-secondary, #aaa)';
                badge.style.borderColor = 'var(--border-color, #333)';
            }
        });
    });
}

// Check badges based on progress
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

        if (xpDisplay) {
            xpDisplay.textContent = `${Math.round((progress / 100) * 300)} XP`;
        }
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
            chatPopUp.classList.toggle('open');
            if (chatPopUp.style.display === 'none' || !chatPopUp.style.display) {
                chatPopUp.style.display = 'block';
            } else {
                chatPopUp.style.display = 'none';
            }
        });
    }

    if (closeChat && chatPopUp) {
        closeChat.addEventListener('click', () => {
            chatPopUp.classList.remove('open');
            chatPopUp.style.display = 'none';
        });
    }

    if (sendBtn && chatInput) {
        sendBtn.addEventListener('click', () => {
            const message = chatInput.value.trim();
            if (message) {
                addChatMessage(message, 'user');
                chatInput.value = '';

                setTimeout(() => {
                    const response = getChatResponse(message);
                    addChatMessage(response, 'assistant');
                }, 400);
            }
        });

        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendBtn.click();
            }
        });
    }
}

function addChatMessage(text, sender) {
    const chatMessages = document.querySelector('.chat-messages, .chat-body, .chat-popup');
    if (!chatMessages) return;

    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message');
    msgDiv.style.cssText = `
        background: ${sender === 'user' ? 'var(--accent-blue, #0077ff)' : 'var(--card-bg, #2a2a3d)'};
        color: ${sender === 'user' ? '#ffffff' : 'var(--text-secondary, #e0e0e0)'};
        padding: 8px 12px;
        border-radius: 8px;
        max-width: 80%;
        margin-bottom: 8px;
        clear: both;
        float: ${sender === 'user' ? 'right' : 'left'};
        font-size: 14px;
        word-break: break-word;
    `;
    msgDiv.textContent = text;

    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getChatResponse(message) {
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
        return "Hello! I'm your AI learning assistant. Ask me about machine learning, prompt engineering, or ethical AI!";
    }

    if (lowerMsg.includes('module') || lowerMsg.includes('quiz')) {
        return "You can click 'Start Quiz' on any module to test your knowledge, gain XP, and unlock badges!";
    }

    if (lowerMsg.includes('progress') || lowerMsg.includes('xp')) {
        return "Complete quizzes to increase your progress bar and earn XP points!";
    }

    if (lowerMsg.includes('badge')) {
        return "You earn badges as your total XP and completion progress go up!";
    }

    return "Great question! Try asking me about prompt engineering tips, academic integrity rules, or neural networks.";
}