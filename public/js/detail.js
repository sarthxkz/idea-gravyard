// public/js/detail.js – Idea detail page

let currentIdeaId = null;
let currentUserId = null;

function getIdFromURL() {
    return new URLSearchParams(window.location.search).get('id');
}

function renderDetail(idea) {
    const container = document.getElementById('detailContainer');
    const cats = (idea.categories || []).map(c =>
        `<span class="tag">💀 ${escHtml(c.category_name)}</span>`
    ).join('');

    container.innerHTML = `
    <div class="detail-header">
      <div class="detail-domain">${escHtml(domainIcon(idea.industry_domain))} ${escHtml(idea.industry_domain || 'Other')}</div>
      <h1 class="detail-title">${escHtml(idea.title)}</h1>
      <div class="detail-meta">
        <span>👤 ${escHtml(idea.author || 'Anonymous')}</span>
        <span>📅 ${formatDate(idea.created_at)}</span>
      </div>
      ${currentUserId && currentUserId === idea.posted_by && !idea.is_anonymous ?
            `<div style="display:flex;gap:0.5rem;margin-top:0.75rem">
          <button class="btn btn-danger btn-sm" onclick="openDeleteModal()">🗑️ Delete</button>
        </div>` : ''}
    </div>

    <div class="detail-section">
      <h3>🪦 Short Description</h3>
      <p>${escHtml(idea.short_description)}</p>
    </div>

    <div class="detail-section">
      <h3>📋 Detailed Postmortem</h3>
      <div class="postmortem-text">${escHtml(idea.detailed_postmortem)}</div>
    </div>

    ${cats ? `
    <div class="detail-section">
      <h3>🏷️ Failure Categories</h3>
      <div class="card-categories" style="margin-top:0.25rem">${cats}</div>
    </div>` : ''}
  `;

    document.title = `${idea.title} – Idea Graveyard`;
}

async function loadFeedback(ideaId) {
    try {
        const data = await API.get(`/feedback/${ideaId}`);
        const list = document.getElementById('feedbackList');
        document.getElementById('feedbackCount').textContent = `(${data.count})`;

        if (!data.feedback.length) {
            list.innerHTML = `<div class="empty-state" style="padding:2rem">
        <div class="empty-icon">💬</div>
        <h3>No feedback yet</h3><p>Be the first to share your thoughts!</p>
      </div>`;
            return;
        }

        list.innerHTML = data.feedback.map(f => `
      <div class="feedback-item">
        <div class="feedback-author">👤 ${escHtml(f.author)}</div>
        <div class="feedback-text">${escHtml(f.comment_text)}</div>
        <div class="feedback-date">${timeAgo(f.created_at)}</div>
      </div>`).join('');
    } catch (e) {
        document.getElementById('feedbackList').innerHTML =
            '<p style="color:var(--danger);padding:1rem">Failed to load feedback.</p>';
    }
}

function openDeleteModal() {
    document.getElementById('deleteModal').classList.add('open');
}

async function initPage() {
    const ideaId = getIdFromURL();
    if (!ideaId) {
        document.getElementById('detailContainer').innerHTML =
            '<div class="empty-state"><div class="empty-icon">⚠️</div><h3>No idea selected</h3></div>';
        return;
    }
    currentIdeaId = ideaId;

    const session = await getSession();
    currentUserId = session.loggedIn ? session.userId : null;

    try {
        const idea = await API.get(`/ideas/${ideaId}`);
        renderDetail(idea);

        document.getElementById('feedbackSection').style.display = 'block';
        loadFeedback(ideaId);

        // Auth-gated feedback form
        if (session.loggedIn) {
            document.getElementById('feedbackForm').style.display = 'block';
        } else {
            document.getElementById('feedbackAuthGate').style.display = 'block';
        }
    } catch (e) {
        document.getElementById('detailContainer').innerHTML =
            `<div class="empty-state"><div class="empty-icon">⚠️</div><h3>Idea not found</h3><p>${e.message}</p></div>`;
    }

    // ── Feedback toggle ──────────────────────────────────────
    const fbAnonToggle = document.getElementById('fbAnonToggle');
    const fbAnon = document.getElementById('fbAnon');
    if (fbAnonToggle) {
        const fbVisual = fbAnonToggle.querySelector('.toggle');
        fbAnonToggle.addEventListener('click', (e) => {
            e.preventDefault();
            fbAnon.checked = !fbAnon.checked;
            fbVisual.classList.toggle('checked', fbAnon.checked);
        });
    }

    // ── Submit Feedback ──────────────────────────────────────
    const submitFeedback = document.getElementById('submitFeedback');
    if (submitFeedback) {
        submitFeedback.addEventListener('click', async () => {
            const text = document.getElementById('feedbackText').value.trim();
            if (!text) { showToast('Please write a comment first.', 'error'); return; }

            submitFeedback.disabled = true;
            submitFeedback.textContent = 'Posting…';
            try {
                await API.post('/feedback', {
                    idea_id: currentIdeaId,
                    comment_text: text,
                    is_anonymous: document.getElementById('fbAnon').checked,
                });
                document.getElementById('feedbackText').value = '';
                showToast('Feedback posted!', 'success');
                loadFeedback(ideaId);
            } catch (err) {
                showToast(err.message || 'Failed to post feedback.', 'error');
            } finally {
                submitFeedback.disabled = false;
                submitFeedback.textContent = 'Post Feedback';
            }
        });
    }

    // ── Delete confirm ───────────────────────────────────────
    document.getElementById('confirmDelete').addEventListener('click', async () => {
        try {
            await API.delete(`/ideas/${currentIdeaId}`);
            showToast('Idea deleted.', 'success');
            setTimeout(() => window.location.href = '/index.html', 1200);
        } catch (err) {
            showToast(err.message || 'Delete failed.', 'error');
            document.getElementById('deleteModal').classList.remove('open');
        }
    });
}

document.addEventListener('DOMContentLoaded', initPage);
