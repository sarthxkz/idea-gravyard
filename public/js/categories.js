// public/js/categories.js – Categories page
const CAT_ICONS = ['🚫', '🔧', '💸', '👥', '⚙️', '⚔️', '🏛️', '⏱️', '📈', '📣'];

async function loadCategories() {
    const container = document.getElementById('catsContainer');
    try {
        const cats = await API.get('/categories');
        if (!cats.length) {
            container.innerHTML = '<div class="empty-state"><div class="empty-icon">🏷️</div><h3>No categories yet</h3></div>';
            return;
        }

        container.innerHTML = `<div class="cat-grid">${cats.map((c, i) => `
      <div class="cat-card" onclick="loadCategoryIdeas('${c.category_id}', '${escHtml(c.category_name)}')">
        <div class="cat-icon">${CAT_ICONS[i % CAT_ICONS.length]}</div>
        <div class="cat-name">${escHtml(c.category_name)}</div>
        <div class="cat-desc">${escHtml(c.description || '')}</div>
        <span class="cat-count">💀 ${c.idea_count} idea${c.idea_count !== 1 ? 's' : ''}</span>
      </div>`).join('')}</div>`;
    } catch (e) {
        container.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><h3>Failed to load categories</h3><p>${e.message}</p></div>`;
    }
}

async function loadCategoryIdeas(categoryId, categoryName) {
    const section = document.getElementById('catIdeasSection');
    const grid = document.getElementById('catIdeasGrid');
    const title = document.getElementById('catIdeasTitle');

    title.textContent = `💀 ${categoryName}`;
    section.style.display = 'block';
    grid.innerHTML = '<div class="spinner-wrap"><div class="spinner"></div></div>';
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });

    try {
        const data = await API.get(`/categories/${categoryId}/ideas`);
        if (!data.ideas.length) {
            grid.innerHTML = '<div class="empty-state"><div class="empty-icon">🕳️</div><h3>No ideas in this category</h3></div>';
            return;
        }

        grid.innerHTML = data.ideas.map(idea => `
      <div class="idea-card" onclick="window.location.href='/idea-detail.html?id=${idea.idea_id}'">
        <div class="card-domain">${escHtml(domainIcon(idea.industry_domain))} ${escHtml(idea.industry_domain || 'Other')}</div>
        <div class="card-title">${escHtml(idea.title)}</div>
        <div class="card-desc">${escHtml(idea.short_description)}</div>
        <div class="card-meta">
          <div class="meta-author">👤 ${escHtml(idea.author || 'Anonymous')}</div>
          <div class="meta-stat">🕐 ${timeAgo(idea.created_at)}</div>
        </div>
      </div>`).join('');
    } catch (e) {
        grid.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><h3>Failed to load</h3><p>${e.message}</p></div>`;
    }
}

function closeCatIdeas() {
    document.getElementById('catIdeasSection').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', loadCategories);
