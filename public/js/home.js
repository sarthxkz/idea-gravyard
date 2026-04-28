// public/js/home.js – Home page logic

let allIdeas = [];
let searchTimer = null;

async function loadDomains() {
    try {
        const domains = await API.get('/ideas/domains');
        const sel = document.getElementById('domainFilter');
        domains.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d;
            opt.textContent = `${domainIcon(d)} ${d}`;
            sel.appendChild(opt);
        });
    } catch (e) { /* silently fail */ }
}

function renderIdeas(ideas) {
    const container = document.getElementById('ideasContainer');
    if (!ideas.length) {
        container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🕳️</div>
        <h3>No ideas found</h3>
        <p>Try a different search term or filter.</p>
      </div>`;
        return;
    }

    container.innerHTML = `<div class="cards-grid">${ideas.map(idea => `
    <div class="idea-card" onclick="viewIdea(${idea.idea_id})">
      <div class="card-domain">${escHtml(domainIcon(idea.industry_domain))} ${escHtml(idea.industry_domain || 'Other')}</div>
      <div class="card-title">${escHtml(idea.title)}</div>
      <div class="card-desc">${escHtml(idea.short_description)}</div>
      ${idea.categories ? `
        <div class="card-categories">
          ${idea.categories.split(', ').slice(0, 3).map(c => `<span class="tag">💀 ${escHtml(c)}</span>`).join('')}
        </div>` : ''}
      <div class="card-meta">
        <div class="meta-author">👤 ${escHtml(idea.author || 'Anonymous')}</div>
        <div class="meta-stats">
          <div class="meta-stat">💬 ${idea.feedback_count || 0}</div>
          <div class="meta-stat">🕐 ${timeAgo(idea.created_at)}</div>
        </div>
      </div>
    </div>`).join('')}</div>`;
}

function viewIdea(id) {
    window.location.href = `/idea-detail.html?id=${id}`;
}

async function fetchIdeas() {
    const search = document.getElementById('searchInput').value.trim();
    const domain = document.getElementById('domainFilter').value;
    document.getElementById('ideasContainer').innerHTML =
        '<div class="spinner-wrap"><div class="spinner"></div></div>';
    try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (domain) params.set('domain', domain);
        const ideas = await API.get('/ideas' + (params.toString() ? '?' + params.toString() : ''));
        renderIdeas(ideas);
    } catch (e) {
        document.getElementById('ideasContainer').innerHTML =
            '<div class="empty-state"><div class="empty-icon">⚠️</div><h3>Failed to load ideas</h3><p>' + e.message + '</p></div>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadDomains();
    fetchIdeas();

    document.getElementById('searchInput').addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(fetchIdeas, 400);
    });

    document.getElementById('domainFilter').addEventListener('change', fetchIdeas);

    document.getElementById('clearBtn').addEventListener('click', () => {
        document.getElementById('searchInput').value = '';
        document.getElementById('domainFilter').value = '';
        fetchIdeas();
    });
});
