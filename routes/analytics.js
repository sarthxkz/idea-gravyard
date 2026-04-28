// routes/analytics.js
const express = require('express');
const Idea = require('../models/Idea');
const router = express.Router();

// GET /api/analytics – dashboard data
router.get('/', async (req, res) => {
    try {
        const data = await Idea.getAnalytics();
        res.json(data);
    } catch (err) {
        console.error('Analytics error:', err);
        res.status(500).json({ error: 'Failed to fetch analytics.' });
    }
});

module.exports = router;
