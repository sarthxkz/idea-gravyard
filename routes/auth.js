// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password)
            return res.status(400).json({ error: 'All fields are required.' });
        if (password.length < 6)
            return res.status(400).json({ error: 'Password must be at least 6 characters.' });

        const existing = await User.findByEmail(email);
        if (existing) return res.status(409).json({ error: 'Email already registered.' });

        const hash = await bcrypt.hash(password, 10);
        const userId = await User.create(username, email, hash);

        req.session.userId = userId;
        req.session.username = username;

        res.status(201).json({ message: 'Registered successfully.', userId, username });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: 'Email and password are required.' });

        const user = await User.findByEmail(email);
        if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.status(401).json({ error: 'Invalid email or password.' });

        req.session.userId = user.user_id;
        req.session.username = user.username;

        res.json({ message: 'Logged in.', userId: user.user_id, username: user.username });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed. Please try again.' });
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    req.session = null;
    res.json({ message: 'Logged out.' });
});

// GET /api/auth/me – check current session
router.get('/me', async (req, res) => {
    if (!req.session.userId) return res.json({ loggedIn: false });
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.json({ loggedIn: false });
        res.json({ loggedIn: true, userId: user.user_id, username: user.username });
    } catch (err) {
        res.json({ loggedIn: false });
    }
});

module.exports = router;
