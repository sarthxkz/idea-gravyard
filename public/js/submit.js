// public/js/submit.js – Submit idea page logic

document.addEventListener('DOMContentLoaded', async () => {
    const session = await getSession();
    const form = document.getElementById('submitForm');
    const gate = document.getElementById('authGate');

    if (!session.loggedIn) {
        gate.style.display = 'block';
        return;
    }
    form.style.display = 'block';

    // ── Load categories ──────────────────────────────────────
    const grid = document.getElementById('categoryGrid');
    try {
        const cats = await API.get('/categories');
        const ICONS = ['🚫', '🔧', '💸', '👥', '⚙️', '⚔️', '🏛️', '⏱️', '📈', '📣'];
        grid.innerHTML = cats.map((c, i) => `
      <label class="category-checkbox" data-id="${c.category_id}" title="${escHtml(c.description)}">
        <input type="checkbox" value="${c.category_id}" />
        ${ICONS[i % ICONS.length]} ${escHtml(c.category_name)}
      </label>`).join('');

        grid.querySelectorAll('.category-checkbox').forEach(label => {
            label.addEventListener('click', () => label.classList.toggle('selected'));
        });
    } catch {
        grid.innerHTML = '<p style="color:var(--danger)">Failed to load categories.</p>';
    }

    // ── Anonymous toggle ─────────────────────────────────────
    const anonToggle = document.getElementById('anonToggle');
    const anonCheck = document.getElementById('isAnonymous');
    const anonVisual = anonToggle.querySelector('.toggle');
    anonToggle.addEventListener('click', (e) => {
        e.preventDefault();
        anonCheck.checked = !anonCheck.checked;
        anonVisual.classList.toggle('checked', anonCheck.checked);
    });

    // ── Form Submit ──────────────────────────────────────────
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('submitBtn');

        const categoryIds = [...grid.querySelectorAll('input[type="checkbox"]:checked')]
            .map(cb => cb.value);

        if (categoryIds.length === 0) {
            showToast('Please select at least one failure category.', 'error');
            return;
        }

        const title = document.getElementById('title').value.trim();
        const shortDesc = document.getElementById('shortDesc').value.trim();
        const postmortem = document.getElementById('postmortem').value.trim();
        const domain = document.getElementById('domain').value;

        if (!title || !shortDesc || !postmortem || !domain) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }

        btn.disabled = true;
        btn.textContent = '⏳ Submitting…';

        try {
            const result = await API.post('/ideas', {
                title,
                short_description: shortDesc,
                detailed_postmortem: postmortem,
                industry_domain: domain,
                is_anonymous: anonCheck.checked,
                category_ids: categoryIds,
            });
            showToast('Idea buried successfully! 🪦', 'success');
            setTimeout(() => window.location.href = `/idea-detail.html?id=${result.ideaId}`, 1200);
        } catch (err) {
            showToast(err.message || 'Submission failed. Please try again.', 'error');
            btn.disabled = false;
            btn.textContent = '🪦 Bury This Idea';
        }
    });
});
