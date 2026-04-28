// routes/categories.js
const express = require('express');
const Category = require('../models/Category');
const router = express.Router();

// GET /api/categories – all categories with idea counts
router.get('/', async (req, res) => {
    try {
        const cats = await Category.getWithIdeaCounts();
        res.json(cats);
    } catch (err) {
        console.error('Get categories error:', err);
        res.status(500).json({ error: 'Failed to fetch categories.' });
    }
});

// GET /api/categories/:id/ideas – ideas for a specific category
router.get('/:id/ideas', async (req, res) => {
    try {
        const ideas = await Category.getIdeasForCategory(req.params.id);
        const cat = await Category.findById(req.params.id);
        res.json({ category: cat, ideas });
    } catch (err) {
        console.error('Get category ideas error:', err);
        res.status(500).json({ error: 'Failed to fetch ideas for category.' });
    }
});

module.exports = router;
