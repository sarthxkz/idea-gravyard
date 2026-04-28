// public/js/analytics.js – Analytics dashboard

async function loadAnalytics() {
    try {
        const data = await API.get('/analytics');

        // ── Stat Cards ───────────────────────────────────────────
        document.getElementById('statCards').innerHTML = `
      <div class="stat-card">
        <div class="stat-icon">🪦</div>
        <div class="stat-value">${data.totals.total_ideas}</div>
        <div class="stat-label">Failed Ideas</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👤</div>
        <div class="stat-value">${data.totals.total_users}</div>
        <div class="stat-label">Contributors</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💬</div>
        <div class="stat-value">${data.totals.total_feedback}</div>
        <div class="stat-label">Feedback Posts</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🏷️</div>
        <div class="stat-value">${data.totals.total_categories}</div>
        <div class="stat-label">Failure Categories</div>
      </div>
    `;

        // ── Bar Chart: Ideas by Domain ───────────────────────────
        const chartEl = document.getElementById('domainChart');
        if (!data.byDomain.length) {
            chartEl.innerHTML = '<p style="color:var(--text-muted)">No data yet.</p>';
        } else {
            const max = data.byDomain[0].idea_count;
            chartEl.innerHTML = data.byDomain.map(row => `
        <div class="bar-row">
          <div class="bar-label">${escHtml(domainIcon(row.industry_domain))} ${escHtml(row.industry_domain)}</div>
          <div class="bar-track">
            <div class="bar-fill" style="width:${Math.max(4, (row.idea_count / max) * 100)}%"></div>
          </div>
          <div class="bar-count">${row.idea_count}</div>
        </div>`).join('');
        }

        // ── Top Ideas by Feedback ────────────────────────────────
        const topEl = document.getElementById('topIdeasList');
        if (!data.topIdeas.length) {
            topEl.innerHTML = '<p style="color:var(--text-muted)">No feedback yet.</p>';
        } else {
            topEl.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:0.6rem">
          ${data.topIdeas.map((idea, i) => `
            <div style="display:flex;align-items:center;gap:1rem;padding:0.75rem 1rem;
                        background:var(--bg-secondary);border-radius:var(--radius-sm);cursor:pointer"
                 onclick="window.location.href='/idea-detail.html?id=${idea.idea_id}'">
              <span style="font-family:'Space Grotesk';font-size:1.25rem;font-weight:700;
                           color:var(--accent-light);min-width:1.5rem">${i + 1}</span>
              <span style="flex:1;font-size:0.9rem;color:var(--text-primary)">${escHtml(idea.title)}</span>
              <span style="color:var(--text-muted);font-size:0.8rem">💬 ${idea.feedback_count}</span>
            </div>`).join('')}
        </div>`;
        }

        // ── Distinct Domains ─────────────────────────────────────
        const domainsEl = document.getElementById('domainList');
        domainsEl.innerHTML = data.domains.map(d =>
            `<a href="/index.html?domain=${encodeURIComponent(d)}"
          class="btn btn-outline btn-sm">${escHtml(domainIcon(d))} ${escHtml(d)}</a>`
        ).join('');

    } catch (e) {
        document.getElementById('statCards').innerHTML =
            `<div class="empty-state" style="grid-column:1/-1">
         <div class="empty-icon">⚠️</div>
         <h3>Failed to load analytics</h3>
         <p>${e.message}</p>
       </div>`;
    }
}

document.addEventListener('DOMContentLoaded', loadAnalytics);
