// public/js/main.js – Shared utilities across all pages

const API = {
    base: '/api',

    async request(method, path, body = null) {
        const opts = {
            method,
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
        };
        if (body) opts.body = JSON.stringify(body);
        const res = await fetch(this.base + path, opts);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Request failed');
        return data;
    },

    get: (path) => API.request('GET', path),
    post: (path, body) => API.request('POST', path, body),
    put: (path, body) => API.request('PUT', path, body),
    delete: (path) => API.request('DELETE', path),
};

// ─── Session ─────────────────────────────────────────────
let _session = null;

async function getSession() {
    if (_session !== null) return _session;
    try { _session = await API.get('/auth/me'); }
    catch { _session = { loggedIn: false }; }
    return _session;
}

// ─── Navbar ──────────────────────────────────────────────
async function initNav() {
    const session = await getSession();
    const authEl = document.getElementById('nav-auth');
    if (!authEl) return;

    if (session.loggedIn) {
        authEl.innerHTML = `
      <span class="nav-user">👤 <span>${escHtml(session.username)}</span></span>
      <button class="btn btn-outline btn-sm" onclick="logout()">Logout</button>
    `;
    } else {
        authEl.innerHTML = `
      <a href="/login.html" class="btn btn-outline btn-sm">Login</a>
      <a href="/register.html" class="btn btn-primary btn-sm">Register</a>
    `;
    }

    // Highlight active nav link
    const current = window.location.pathname;
    document.querySelectorAll('.nav-links a').forEach(a => {
        const href = a.getAttribute('href');
        if (
            (href === '/index.html' && (current === '/' || current === '/index.html')) ||
            (href !== '/index.html' && current.includes(href.replace('.html', '')))
        ) a.classList.add('active');
    });
}

async function logout() {
    try {
        await API.post('/auth/logout');
        _session = null;
        window.location.href = '/index.html';
    } catch (e) {
        showToast('Logout failed.', 'error');
    }
}

// ─── Toast Notifications ──────────────────────────────────
function showToast(msg, type = 'success', duration = 3500) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(120%)'; }, duration);
    setTimeout(() => toast.remove(), duration + 300);
}

// ─── Helpers ─────────────────────────────────────────────
function escHtml(str = '') {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 30) return `${d}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
}

const DOMAIN_ICONS = {
    'Food & Delivery': '🍕',
    'HR & Recruiting': '👥',
    'Retail & Commerce': '🛒',
    'EdTech': '📚',
    'HealthTech': '🏥',
    'Web3 & NFT': '🔗',
    'Smart City': '🏙️',
    'eCommerce': '📦',
    'FinTech': '💰',
    'Social Media': '📱',
    'Other': '💡',
};

function domainIcon(domain) {
    return DOMAIN_ICONS[domain] || '💡';
}

// Initialise nav on every page
document.addEventListener('DOMContentLoaded', initNav);
