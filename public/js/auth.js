// public/js/auth.js – Login & Register forms

document.addEventListener('DOMContentLoaded', async () => {
    // Redirect if already logged in
    const session = await getSession();
    if (session.loggedIn) {
        window.location.href = '/index.html';
        return;
    }

    // ── Login Form ─────────────────────────────────────────
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('loginBtn');
            const errorEl = document.getElementById('loginError');
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            errorEl.style.display = 'none';
            btn.disabled = true;
            btn.textContent = 'Logging in…';

            try {
                await API.post('/auth/login', { email, password });
                showToast('Logged in! Redirecting…', 'success');
                setTimeout(() => window.location.href = '/index.html', 900);
            } catch (err) {
                errorEl.style.display = 'block';
                errorEl.textContent = err.message || 'Login failed.';
                btn.disabled = false;
                btn.textContent = 'Login';
            }
        });
    }

    // ── Register Form ──────────────────────────────────────
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('regBtn');
            const errorEl = document.getElementById('regError');
            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            errorEl.style.display = 'none';
            if (!username || !email || !password) {
                errorEl.style.display = 'block';
                errorEl.textContent = 'All fields are required.';
                return;
            }

            btn.disabled = true;
            btn.textContent = 'Creating account…';

            try {
                await API.post('/auth/register', { username, email, password });
                showToast('Account created! Welcome to the Graveyard 🪦', 'success');
                setTimeout(() => window.location.href = '/index.html', 1000);
            } catch (err) {
                errorEl.style.display = 'block';
                errorEl.textContent = err.message || 'Registration failed.';
                btn.disabled = false;
                btn.textContent = 'Create Account';
            }
        });
    }
});
