'use strict';
/* ============================================================================
   AI LEARNING PORTAL - reviews.js
   Star reviews: written on the Profile page ("Write a Review" tab) and shown in
   the carousel on the Home page. One review per profile (the doc id is the
   profile id). Stored in Firestore ("reviews") when it is available, otherwise
   on this device. Load after app.js.
   ============================================================================ */
const Reviews = (() => {
    const LOCAL_KEY = 'ai_portal_reviews_local';      // shared by every account on this device
    const MIN_LEN = 10, MAX_LEN = 280;
    const LABELS = ['', 'Needs work', 'It\'s okay', 'Good', 'Great', 'Loved it!'];
    let reviews = [], index = 0, timer = 0, paused = false;

    // ---- Data -------------------------------------------------------------------------
    // Anything read back from storage is checked before it is shown
    const valid = r => r && typeof r.userId === 'string' && typeof r.username === 'string' && typeof r.text === 'string'
        && Number.isInteger(r.stars) && r.stars >= 1 && r.stars <= 5 && r.text.length <= MAX_LEN + 20;
    const safeAvatar = src => (typeof src === 'string' && /^images\/[\w ().-]+\.(png|jpe?g|svg|webp)$/i.test(src) ? src : 'images/ScrappyV2.png');
    const readLocal = () => { try { return (JSON.parse(localStorage.getItem(LOCAL_KEY)) || []).filter(valid); } catch { return []; } };
    const writeLocal = list => { try { localStorage.setItem(LOCAL_KEY, JSON.stringify(list)); } catch { /* storage blocked */ } };
    const sorted = list => [...list].sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const mine = () => { const u = Portal.getActiveUser(); return u ? reviews.find(r => r.userId === u.id) : null; };

    function setAll(list) {
        reviews = sorted(list.filter(valid));
        index = Math.min(index, maxIndex());
        renderCarousel();
        if (!$('#ppanel-review')?.hidden) renderEditor();
    }

    function load() {
        if (!db) { setAll(readLocal()); return; }
        db.collection('reviews').onSnapshot(snap => {
            const cloud = [];
            snap.forEach(doc => cloud.push({ userId: doc.id, ...doc.data() }));
            writeLocal(cloud);
            setAll(cloud);
        }, err => {
            console.warn('Reviews sync unavailable, showing reviews saved on this device.', err);
            setAll(readLocal());
        });
    }

    async function save(stars, text) {
        const u = Portal.getActiveUser();
        if (!u) { toast('Create or log in to a profile to write a review.', 'warn'); return false; }
        if (devMode()) { toast('Developer Mode cannot post reviews. Exit it to review as yourself.', 'warn'); return false; }
        text = text.trim().replace(/\s+/g, ' ');
        if (!Number.isInteger(stars) || stars < 1 || stars > 5) { toast('Pick a star rating first.', 'warn'); return false; }
        if (text.length < MIN_LEN) { toast(`Please write at least ${MIN_LEN} characters.`, 'warn'); return false; }
        if (PortalSecurity.containsProfanity(text)) { toast('Please keep your review appropriate.', 'warn'); return false; }
        const prev = mine();
        const review = { userId: u.id, username: u.username, avatar: safeAvatar(u.avatar), stars, text: text.slice(0, MAX_LEN), date: new Date().toISOString(), edited: !!prev };
        setAll([...reviews.filter(r => r.userId !== u.id), review]);
        writeLocal(reviews);
        if (db) {
            try { await db.collection('reviews').doc(u.id).set(review); }
            catch (err) { console.error('Review cloud save failed:', err); toast('Saved on this device. The cloud copy could not be updated.', 'warn'); return true; }
        }
        toast(prev ? 'Review updated. Thank you!' : 'Thanks for your review! It is now on the Home page.', 'success');
        FX.play('collect');
        return true;
    }

    async function remove() {
        const u = Portal.getActiveUser();
        if (!u || !mine()) return;
        setAll(reviews.filter(r => r.userId !== u.id));
        writeLocal(reviews);
        if (db) { try { await db.collection('reviews').doc(u.id).delete(); } catch (err) { console.error('Review delete failed:', err); } }
        toast('Your review was removed.', 'info');
    }

    // ---- Stars ------------------------------------------------------------------------
    const STAR = '<path d="M12 2.6l2.9 6 6.5.8-4.8 4.5 1.2 6.5L12 17.2l-5.8 3.2 1.2-6.5L2.6 9.4l6.5-.8z"/>';
    // Static stars; value can be fractional (4.6 fills the fifth star 60%)
    function starsHTML(value, size = 18) {
        return `<span class="stars" style="--s:${size}px" role="img" aria-label="${value.toFixed(1).replace(/\.0$/, '')} out of 5 stars">${[1, 2, 3, 4, 5].map(i => {
            const fill = Math.max(0, Math.min(1, value - (i - 1)));
            return `<svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="sg${i}-${Math.round(fill * 100)}"><stop offset="${fill * 100}%" stop-color="#fbbf24"/><stop offset="${fill * 100}%" stop-color="rgba(148,163,184,.3)"/></linearGradient></defs><g fill="url(#sg${i}-${Math.round(fill * 100)})">${STAR}</g></svg>`;
        }).join('')}</span>`;
    }

    // ---- Home carousel ----------------------------------------------------------------
    const perView = () => (window.innerWidth >= 1000 ? 3 : window.innerWidth >= 680 ? 2 : 1);
    const maxIndex = () => Math.max(0, reviews.length - perView());
    const fmtDate = iso => { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); };

    function renderCarousel() {
        const track = $('#review-track'), summary = $('#review-summary'), dots = $('#review-dots'), wrap = $('#review-carousel');
        if (!track) return;
        if (!reviews.length) {
            summary.innerHTML = '';
            track.innerHTML = `<div class="review-empty"><strong>No reviews yet.</strong> Be the first cadet to rate the portal from your Profile page.</div>`;
            dots.innerHTML = ''; wrap.classList.add('is-empty');
            return;
        }
        wrap.classList.remove('is-empty');
        const avg = reviews.reduce((n, r) => n + r.stars, 0) / reviews.length;
        summary.innerHTML = `<span class="rs-score">${avg.toFixed(1)}</span>${starsHTML(avg, 22)}<span class="rs-count">from ${reviews.length} review${reviews.length === 1 ? '' : 's'}</span>`;
        const me = Portal.getActiveUser();
        track.innerHTML = reviews.map(r => `
            <article class="review-card${me && r.userId === me.id ? ' is-mine' : ''}" aria-roledescription="slide">
                ${starsHTML(r.stars)}
                <p class="review-text">“${esc(r.text)}”</p>
                <div class="review-author">
                    <img src="${esc(safeAvatar(r.avatar))}" alt="" loading="lazy">
                    <div><strong>${esc(r.username)}</strong><small>${fmtDate(r.date)}${r.edited ? ' · edited' : ''}${me && r.userId === me.id ? ' · you' : ''}</small></div>
                </div>
            </article>`).join('');
        track.style.setProperty('--per', perView());
        const pages = maxIndex() + 1;
        dots.innerHTML = pages > 1 ? Array.from({ length: pages }, (_, i) => `<button type="button" class="rc-dot" data-rc="${i}" aria-label="Show reviews from ${i + 1}"></button>`).join('') : '';
        $$('.rc-arrow', wrap).forEach(b => { b.hidden = pages <= 1; });
        go(index, false);
    }

    function go(i, user = true) {
        const track = $('#review-track');
        if (!track || !reviews.length) return;
        const max = maxIndex();
        index = i > max ? 0 : i < 0 ? max : i;
        const card = $('.review-card', track);
        const step = card ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 0) : 0;
        track.style.transform = `translateX(${-index * step}px)`;
        $$('.rc-dot').forEach((d, k) => d.classList.toggle('active', k === index));
        if (user) restart();
    }
    function restart() {
        clearInterval(timer);
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        timer = setInterval(() => { if (!paused && !document.hidden && maxIndex() > 0) go(index + 1, false); }, 5500);
    }

    // ---- Profile editor ---------------------------------------------------------------
    let draftStars = 0;
    function renderEditor() {
        const root = $('#review-editor'), status = $('#review-status');
        if (!root) return;
        const u = Portal.getActiveUser();
        if (!u) { root.innerHTML = '<p class="exam-locked">👤 Create or log in to a profile to write a review.</p>'; status.textContent = ''; return; }
        const r = mine();
        status.textContent = r ? 'Posted' : 'Not posted yet';
        if (!draftStars) draftStars = r ? r.stars : 0;
        root.innerHTML = `
            <form class="review-form" novalidate>
                <fieldset class="star-picker" role="radiogroup" aria-label="Your rating">
                    <legend>Your rating</legend>
                    ${[1, 2, 3, 4, 5].map(i => `<button type="button" class="star-pick" role="radio" data-star="${i}" aria-checked="${i === draftStars}" aria-label="${i} star${i > 1 ? 's' : ''}: ${LABELS[i]}" tabindex="${i === (draftStars || 1) ? 0 : -1}"><svg viewBox="0 0 24 24" aria-hidden="true">${STAR}</svg></button>`).join('')}
                    <span class="star-label" aria-live="polite">${draftStars ? LABELS[draftStars] : 'Tap a star'}</span>
                </fieldset>
                <label class="review-label" for="review-text">Your review</label>
                <textarea id="review-text" rows="4" maxlength="${MAX_LEN}" placeholder="What did you like? What helped you learn? What could be better?">${r ? esc(r.text) : ''}</textarea>
                <div class="review-meta"><span id="review-count">0 / ${MAX_LEN}</span></div>
                <div class="review-actions">
                    <button type="submit" class="btn-cyan-primary">${r ? 'Update My Review' : 'Post Review'}</button>
                    ${r ? '<button type="button" class="btn-ghost" data-review-delete>Remove Review</button>' : ''}
                    <a class="btn-ghost" href="#home">See it on the Home page →</a>
                </div>
            </form>
            ${r ? `<h3 class="review-preview-title">Your review as others see it</h3><div class="review-preview"><article class="review-card is-mine">${starsHTML(r.stars)}<p class="review-text">“${esc(r.text)}”</p><div class="review-author"><img src="${esc(safeAvatar(r.avatar))}" alt=""><div><strong>${esc(r.username)}</strong><small>${fmtDate(r.date)}${r.edited ? ' · edited' : ''}</small></div></div></article></div>` : ''}`;
        const form = $('.review-form', root), ta = $('#review-text', root), count = $('#review-count', root);
        const picks = $$('.star-pick', root), label = $('.star-label', root);
        const paint = n => picks.forEach((p, k) => p.classList.toggle('on', k < n));
        const choose = n => {
            draftStars = n;
            picks.forEach((p, k) => { p.setAttribute('aria-checked', k + 1 === n); p.tabIndex = k + 1 === n ? 0 : -1; });
            label.textContent = LABELS[n]; paint(n); FX.play('collect');
        };
        paint(draftStars);
        picks.forEach((p, k) => {
            p.addEventListener('mouseenter', () => { paint(k + 1); label.textContent = LABELS[k + 1]; });
            p.addEventListener('click', () => choose(k + 1));
            p.addEventListener('keydown', e => {
                const d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
                if (!d) return;
                e.preventDefault();
                const n = Math.min(5, Math.max(1, (draftStars || 0) + d));
                choose(n); picks[n - 1].focus();
            });
        });
        $('.star-picker', root).addEventListener('mouseleave', () => { paint(draftStars); label.textContent = draftStars ? LABELS[draftStars] : 'Tap a star'; });
        const updateCount = () => { count.textContent = `${ta.value.length} / ${MAX_LEN}`; count.classList.toggle('ok', ta.value.trim().length >= MIN_LEN); };
        ta.addEventListener('input', updateCount); updateCount();
        form.addEventListener('submit', async e => {
            e.preventDefault();
            const btn = $('button[type="submit"]', form); btn.disabled = true;
            const ok = await save(draftStars, ta.value);
            if (!ok) btn.disabled = false; else renderEditor();
        });
        $('[data-review-delete]', root)?.addEventListener('click', () => { if (confirm('Remove your review from the Home page?')) { draftStars = 0; remove().then(renderEditor); } });
    }

    // ---- Wiring -----------------------------------------------------------------------
    function bind() {
        const wrap = $('#review-carousel');
        if (wrap) {
            $('.rc-prev', wrap).addEventListener('click', () => go(index - 1));
            $('.rc-next', wrap).addEventListener('click', () => go(index + 1));
            $('#review-dots').addEventListener('click', e => { const d = e.target.closest('[data-rc]'); if (d) go(+d.dataset.rc); });
            ['mouseenter', 'focusin'].forEach(ev => wrap.addEventListener(ev, () => { paused = true; }));
            ['mouseleave', 'focusout'].forEach(ev => wrap.addEventListener(ev, () => { paused = false; }));
            // Swipe on touch screens
            let x0 = null;
            wrap.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
            wrap.addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1)); x0 = null; });
            let rt = 0;
            window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(renderCarousel, 150); });
        }
        // Store buttons are decorative: the app is not released yet
        document.addEventListener('click', e => {
            const s = e.target.closest('[data-store]');
            if (s) toast(`The AI Portal mobile app is coming soon to ${s.dataset.store}!`, 'info');
        });
        // The active profile can change (log in, switch, rename), so refresh both views on profile updates
        window.addEventListener('storage', () => renderCarousel());
        load();
        restart();
    }

    document.addEventListener('DOMContentLoaded', bind);
    if (document.readyState !== 'loading') bind();
    return { renderEditor, renderCarousel, starsHTML, all: () => reviews };
})();
window.Reviews = Reviews;
