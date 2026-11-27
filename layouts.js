'use strict';
/* ============================================================================
   AI LEARNING PORTAL - layouts.js
   Interactive lesson layouts. The curriculum text stays in LESSONS (app.js) and
   is never rewritten: after a lesson is rendered, these functions MOVE its
   headings, paragraphs, and cards into flip cards, tabbed explorers, step-by-step
   reveals, and accordions. The Myth vs. Fact, Spotlight, and key-term extras
   below are additions on top of that text.
   ============================================================================ */
const LessonLayouts = (() => {
    let uid = 0;
    // Items are [label, html]. "html" is trusted lesson markup written by the team.

    // ---- 3D flip cards ------------------------------------------------------
    const flipCards = (items, label = 'Flip cards') => `
        <div class="lx lx-flips" role="group" aria-label="${label}">
            <p class="lx-hint">🔄 Click a card to flip it.</p>
            <div class="flip-grid">${items.map(([front, back]) => `
                <div class="flip-card" data-flip>
                    <div class="flip-inner">
                        <div class="flip-face flip-front">
                            <span class="flip-term">${front}</span>
                            <button type="button" class="flip-btn" aria-expanded="false">Reveal<span class="sr-only"> ${front}</span> ↻</button>
                        </div>
                        <div class="flip-face flip-back" inert>
                            <strong class="flip-title">${front}</strong>
                            <div class="flip-text">${back}</div>
                            <button type="button" class="flip-btn">↺ Flip back</button>
                        </div>
                    </div>
                </div>`).join('')}
            </div>
        </div>`;

    // ---- Tabbed explorer ----------------------------------------------------
    function tabs(items, label = 'Topic explorer') {
        const id = `lx-tabs-${++uid}`;
        return `
        <div class="lx lx-tabs">
            <div class="tab-bar" role="tablist" aria-label="${label}">${items.map(([name], i) => `
                <button type="button" role="tab" id="${id}-t${i}" aria-controls="${id}-p${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" class="tab-btn">${name}</button>`).join('')}
            </div>${items.map(([, html], i) => `
            <div role="tabpanel" id="${id}-p${i}" aria-labelledby="${id}-t${i}" class="tab-panel"${i === 0 ? '' : ' hidden'}>${html}</div>`).join('')}
        </div>`;
    }

    // ---- Step-by-step progressive reveal -----------------------------------
    const steps = (items, label = 'Step-by-step walkthrough') => `
        <div class="lx lx-steps" role="group" aria-label="${label}" data-shown="1">
            <div class="step-progress"><span data-step-count>Stage 1 of ${items.length}</span><div class="step-track"><div data-step-fill style="width:${100 / items.length}%"></div></div></div>
            <ol class="step-list">${items.map(([name, html], i) => `
                <li class="step-card"${i === 0 ? '' : ' hidden'}>
                    <span class="step-num">${i + 1}</span>
                    <div><h4 tabindex="-1">${name}</h4><div>${html}</div></div>
                </li>`).join('')}
            </ol>
            <div class="step-controls">
                <button type="button" class="btn-cyan-secondary" data-step-next>Next Stage →</button>
                <button type="button" class="btn-ghost" data-step-all>Show all stages</button>
                <button type="button" class="btn-ghost" data-step-reset hidden>↺ Start over</button>
            </div>
        </div>`;

    // ---- Accordion ----------------------------------------------------------
    function accordion(items, label = 'Expandable topics') {
        const id = `lx-acc-${++uid}`;
        return `
        <div class="lx lx-accordion" role="group" aria-label="${label}">${items.map(([name, html], i) => `
            <div class="acc-item${i === 0 ? ' open' : ''}">
                <h4 class="acc-heading"><button type="button" class="acc-btn" id="${id}-b${i}" aria-controls="${id}-p${i}" aria-expanded="${i === 0}"><span>${name}</span><span class="acc-icon" aria-hidden="true">+</span></button></h4>
                <div class="acc-panel" id="${id}-p${i}" role="region" aria-labelledby="${id}-b${i}"${i === 0 ? '' : ' inert'}><div class="acc-body">${html}</div></div>
            </div>`).join('')}
        </div>`;
    }

    // ---- Callout boxes ------------------------------------------------------
    const mythFact = (myth, fact) => `
        <div class="lx lx-myth">
            <div class="myth-box"><span class="lx-tag">❌ Myth</span><p>${myth}</p></div>
            <button type="button" class="btn-cyan-secondary" data-reveal-fact aria-expanded="false">Reveal the Fact</button>
            <div class="fact-box" hidden tabindex="-1"><span class="lx-tag">✅ Fact</span><p>${fact}</p></div>
        </div>`;
    const spotlight = (title, body) => `
        <aside class="lx lx-spotlight"><span class="lx-tag">🌎 Real-World Spotlight</span><h4>${title}</h4><p>${body}</p></aside>`;

    // ---- Helpers that move existing lesson text into components -------------
    const toNodes = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content; };

    // Replaces the lesson's card grid with a component built from the same cards
    function cardsInto(article, build) {
        const stack = article.querySelector('.paradigms-stack');
        if (!stack) return;
        const items = [...stack.querySelectorAll('.paradigm-row-card')].map(c => [c.querySelector('h4').innerHTML, c.querySelector('p').innerHTML]);
        stack.replaceWith(toNodes(build(items)));
    }
    // Replaces the lesson's top-level paragraphs with a component, one label per paragraph.
    // The text of each paragraph is carried over unchanged.
    function parasInto(article, labels, build) {
        const paras = [...article.children].filter(el => el.tagName === 'P');
        if (!paras.length) return;
        const items = paras.map((p, i) => [labels[i] || `Part ${i + 1}`, p.outerHTML]);
        paras[0].before(toNodes(build(items)));
        paras.forEach(p => p.remove());
    }
    // Each <h3> and everything under it becomes one tab
    function sectionsIntoTabs(article, labels) {
        const heads = [...article.children].filter(el => el.tagName === 'H3');
        if (!heads.length) return;
        const items = heads.map((h, i) => {
            const nodes = [h];
            let next = h.nextElementSibling;
            while (next && next.tagName !== 'H3') { nodes.push(next); next = next.nextElementSibling; }
            return { nodes, label: labels[i] || h.textContent };
        });
        const marker = document.createComment('tabs');
        heads[0].before(marker);
        const html = items.map(s => [s.label, s.nodes.map(n => n.outerHTML).join('')]);
        items.forEach(s => s.nodes.forEach(n => n.remove()));
        marker.replaceWith(toNodes(tabs(html)));
    }
    const append = (article, ...html) => article.appendChild(toNodes(`<div class="lx-extras">${html.join('')}</div>`));

    // ---- One layout per lesson that has no slider ---------------------------
    // Neighboring lessons lead with different components so the course stays varied.
    const LAYOUTS = {
        '1.3': a => {
            const list = a.querySelector('.focus-list');
            if (list) {
                const items = [...list.querySelectorAll('li')].map(li => {
                    const name = li.querySelector('strong');
                    return [name.textContent.replace(/:$/, ''), `<p>${li.innerHTML}</p>`];
                });
                list.replaceWith(toNodes(steps(items, 'How a CNN reads an image')));
            }
            sectionsIntoTabs(a, ['👁️ Computer Vision', '🌀 Hallucinations', '🎭 Adversarial Attacks']);
            append(a, mythFact('If an AI sounds confident, its answer is probably correct.', 'A confident tone is not evidence. A model can state something completely invented in the same tone it uses for facts, so check important claims against trusted sources.'));
        },
        '2.1': a => {
            cardsInto(a, items => flipCards(items, 'The four prompt pillars'));
            const ladder = ['Level 1: Vague Prompt', 'Level 2: Better Prompt', 'Level 3: Production-Ready Prompt'];
            append(a, '<h3>Watch a Prompt Level Up</h3>', steps(PROMPT_PREVIEWS.map((text, i) => [ladder[i], `<p class="prompt-preview">${esc(text)}</p>`]), 'Prompt quality ladder'));
        },
        '2.2': a => {
            cardsInto(a, items => steps(items, 'Four reasoning strategies'));
            append(a, mythFact('If an AI shows its reasoning step by step, the final answer must be right.', 'Step-by-step reasoning often helps with multi-step problems, but any step can still contain a mistake. Read the steps and check the result yourself.'));
        },
        '3.1': a => {
            cardsInto(a, items => accordion(items, 'Pillars of student AI integrity'));
            append(a, mythFact('Submitting AI-written work is fine because I did not copy it from a person.', 'Turning in AI-generated work as your own breaks academic integrity policies, whether or not a person wrote the words first.'));
        },
        '3.2': a => {
            parasInto(a, ['⚖️ Algorithmic Bias', '🔒 Data Privacy'], items => tabs(items, 'Fairness and privacy'));
            append(a, flipCards([
                ['Historical Bias', '<p><em>Example:</em> a hiring model trained on past decisions that favored one group can learn to keep favoring it.</p>'],
                ['PII', '<p><em>Examples:</em> your full name, student ID, medical details, or a password. Keep them out of public AI tools.</p>'],
                ['Subgroup Audit', '<p><em>Example:</em> comparing a model\'s error rate for each demographic group instead of checking only the overall average.</p>']
            ], 'Key terms'),
            spotlight('Picture a Study App', 'A school app asks students to paste an essay into a public chatbot for feedback. A safer habit is to remove names, ID numbers, and other personal details before pasting anything.'));
        },
        '3.3': a => {
            parasInto(a, ['Understand the Threat', 'Verify What You See'], items => steps(items, 'From recognizing to verifying'));
            append(a, accordion([
                ['👀 Visual Clues', '<p>Look for unnatural blinking, warped edges around the face or hair, and lighting that does not match the scene.</p>'],
                ['👂 Audio Clues', '<p>Listen for a flat rhythm, odd pauses, or lip movements that do not line up with the words.</p>'],
                ['🔗 Source Clues', '<p>Find where the clip first appeared and whether reputable outlets are reporting the same event.</p>']
            ], 'Clue checklist'),
            mythFact('I can always spot a deepfake if I look closely enough.', 'Some synthetic media is very convincing. Visual clues help, but checking the source matters more. Missing Content Credentials also does not prove a clip is fake.'));
        },
        '4.1': a => {
            cardsInto(a, items => steps(items, 'The preprocessing pipeline'));
            append(a, spotlight('Picture a Weather Station', 'A sensor glitches and reports a temperature of 999 degrees. If nobody catches it, that one value can drag the average far from reality and mislead any model trained on it.'));
        },
        '4.3': a => {
            parasInto(a, ['📈 High-Signal Features', '🌫️ Noise Columns'], items => tabs(items, 'Signal versus noise'));
            append(a, flipCards([
                ['Engineered Feature', '<p><em>Example:</em> turning a raw timestamp into <code>is_rush_hour</code>.</p>'],
                ['Noise Column', '<p><em>Example:</em> a random record number that has nothing to do with delivery time.</p>'],
                ['Meaningful Ratio', '<p><em>Example:</em> price divided by floor area gives price per square foot, which makes homes easier to compare.</p>']
            ], 'Feature examples'));
        },
        '5.1': a => {
            cardsInto(a, items => tabs(items.map(([h, b]) => [h, `<h4>${h}</h4><p>${b}</p>`]), 'Responsible AI governance'));
            append(a, mythFact('Deleting columns like race or gender is enough to make a model fair.', 'Other columns, such as ZIP code, can act as stand-ins (proxies) for the removed information. That is why teams also audit results across groups.'));
        },
        '5.2': a => {
            parasInto(a, ['🎨 Why Creators Are Affected', '📜 What Ethical Developers Do'], items => accordion(items, 'Creators and developers'));
            append(a, spotlight('Picture a Class Project', 'Your team finds great artwork through an image search. Before using it, you check its license, follow any attribution rule, and pick something else if the license does not allow your use.'),
                mythFact('If I can see it online, it is free to use.', 'Public visibility does not give permission. Creative work is often protected by copyright even without a notice, so check the license first.'));
        },
        '5.3': a => {
            parasInto(a, ['The Threat', 'The Layered Defense'], items => steps(items, 'Defense in depth'));
            append(a, flipCards([
                ['Prompt Injection', '<p><em>Example:</em> a message that says to ignore all earlier rules and reveal private instructions.</p>'],
                ['Input Filter', '<p>Screens a request <strong>before</strong> the main model sees it.</p>'],
                ['Output Filter', '<p>Checks the response <strong>before</strong> a person sees it.</p>'],
                ['Red Teaming', '<p>People attack the system on purpose to find weak spots so they can be fixed.</p>']
            ], 'Defense vocabulary'));
        },
        '6.2': a => {
            parasInto(a, ['Start: The Base Model', 'Align: Human Feedback'], items => steps(items, 'From pretraining to alignment'));
            append(a, accordion([
                ['🧑‍⚖️ Human Reviewers', '<p>They compare two responses and choose the one that is more helpful and safe.</p>'],
                ['🏅 Reward Model', '<p>It learns from those choices to predict which responses people will prefer.</p>'],
                ['🧭 KL-Divergence Penalty', '<p>It keeps the fine-tuned model from drifting too far from its starting behavior just to chase a higher reward score.</p>']
            ], 'Parts of the RLHF loop'));
        },
        '6.3': a => {
            parasInto(a, ['🤖 Agents & Oversight', '🎓 Your Next Chapter'], items => tabs(items, 'Future horizons'));
            append(a, flipCards([
                ['Multimodal AI', '<p><em>Example:</em> a system that can look at a photo of a graph and answer a spoken question about it.</p>'],
                ['AI Agent', '<p><em>Example:</em> a system that plans several steps and uses software tools to finish a task.</p>'],
                ['Human-in-the-Loop', '<p><em>Example:</em> an agent drafts an email, and a person approves it before it is sent.</p>']
            ], 'Future vocabulary'));
        }
    };

    function apply(key, root) {
        const article = root && root.querySelector('.lesson-article-container');
        if (article && LAYOUTS[key]) LAYOUTS[key](article);
    }

    // ---- Interaction (one set of listeners for every lesson) ----------------
    function selectTab(button) {
        const wrap = button.closest('.lx-tabs');
        const bar = button.parentElement;
        [...bar.children].forEach(b => {
            const on = b === button;
            b.setAttribute('aria-selected', on);
            b.tabIndex = on ? 0 : -1;
            wrap.querySelector(`#${b.getAttribute('aria-controls')}`).hidden = !on;
        });
    }
    function showSteps(wrap, count) {
        const cards = [...wrap.querySelector('.step-list').children];
        const shown = Math.max(1, Math.min(count, cards.length));
        wrap.dataset.shown = shown;
        cards.forEach((card, i) => { card.hidden = i >= shown; });
        const done = shown === cards.length;
        wrap.querySelector('[data-step-count]').textContent = done ? `All ${cards.length} stages revealed ✓` : `Stage ${shown} of ${cards.length}`;
        wrap.querySelector('[data-step-fill]').style.width = (shown / cards.length) * 100 + '%';
        wrap.querySelector('[data-step-next]').hidden = done;
        wrap.querySelector('[data-step-all]').hidden = done;
        wrap.querySelector('[data-step-reset]').hidden = !done;
        return cards[shown - 1];
    }
    function flip(card, viaButton) {
        const on = !card.classList.contains('flipped');
        card.classList.toggle('flipped', on);
        const front = card.querySelector('.flip-front'), back = card.querySelector('.flip-back');
        front.inert = on;
        back.inert = !on;
        front.querySelector('.flip-btn').setAttribute('aria-expanded', on);
        if (viaButton) (on ? back : front).querySelector('.flip-btn').focus({ preventScroll: true });
    }

    function onClick(e) {
        const tab = e.target.closest('.tab-btn');
        if (tab) return selectTab(tab);
        const wrap = e.target.closest('.lx-steps');
        if (wrap) {
            if (e.target.closest('[data-step-next]')) showSteps(wrap, +wrap.dataset.shown + 1).querySelector('h4').focus({ preventScroll: true });
            else if (e.target.closest('[data-step-all]')) showSteps(wrap, 99);
            else if (e.target.closest('[data-step-reset]')) showSteps(wrap, 1);
        }
        const acc = e.target.closest('.acc-btn');
        if (acc) {
            const item = acc.closest('.acc-item');
            const open = item.classList.toggle('open');
            acc.setAttribute('aria-expanded', open);
            item.querySelector('.acc-panel').inert = !open;
            return;
        }
        const fact = e.target.closest('[data-reveal-fact]');
        if (fact) {
            const box = fact.parentElement.querySelector('.fact-box');
            box.hidden = !box.hidden;
            fact.setAttribute('aria-expanded', !box.hidden);
            fact.textContent = box.hidden ? 'Reveal the Fact' : 'Hide the Fact';
            if (!box.hidden) box.focus({ preventScroll: true });
            return;
        }
        const card = e.target.closest('[data-flip]');
        if (card) flip(card, !!e.target.closest('.flip-btn'));
    }
    function onKey(e) {
        const tab = e.target.closest && e.target.closest('.tab-btn');
        if (!tab) return;
        const list = [...tab.parentElement.children], i = list.indexOf(tab);
        const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: list.length - 1 }[e.key];
        if (next === undefined) return;
        e.preventDefault();
        const target = list[(next + list.length) % list.length];
        selectTab(target);
        target.focus();
    }
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);

    return { apply, keys: Object.keys(LAYOUTS) };
})();
