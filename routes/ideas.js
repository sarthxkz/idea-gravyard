// routes/ideas.js
const express = require('express');
const Idea = require('../models/Idea');
const Category = require('../models/Category');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// GET /api/ideas?search=&domain=
router.get('/', async (req, res) => {
    try {
        const ideas = await Idea.getAll({
            domain: req.query.domain,
            search: req.query.search,
        });
        res.json(ideas);
    } catch (err) {
        console.error('Get ideas error:', err);
        res.status(500).json({ error: 'Failed to fetch ideas: ' + err.message });
    }
});

// GET /api/ideas/domains – for filter dropdown
router.get('/domains', async (req, res) => {
    try {
        const domains = await Idea.getDomains();
        res.json(domains);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch domains.' });
    }
});

// GET /api/ideas/:id – idea detail with categories
router.get('/:id', async (req, res) => {
    try {
        const idea = await Idea.getById(req.params.id);
        if (!idea) return res.status(404).json({ error: 'Idea not found.' });

        const categories = await Category.getForIdea(req.params.id);
        res.json({ ...idea, categories });
    } catch (err) {
        console.error('Get idea error:', err);
        res.status(500).json({ error: 'Failed to fetch idea.' });
    }
});

// POST /api/ideas – create a new idea (auth required)
router.post('/', requireAuth, async (req, res) => {
    try {
        const { title, short_description, detailed_postmortem, industry_domain, is_anonymous, category_ids } = req.body;
        if (!title || !short_description)
            return res.status(400).json({ error: 'Title and short description are required.' });

        const ideaId = await Idea.create(
            {
                title,
                short_description,
                detailed_postmortem: detailed_postmortem || '',
                industry_domain: industry_domain || 'Other',
                posted_by: req.session.userId,
                is_anonymous: !!is_anonymous,
            },
            Array.isArray(category_ids) ? category_ids : []
        );

        res.status(201).json({ message: 'Idea submitted successfully!', ideaId });
    } catch (err) {
        console.error('Create idea error:', err);
        res.status(500).json({ error: 'Failed to submit idea.' });
    }
});

// PUT /api/ideas/:id – update idea (owner only)
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const { title, short_description, detailed_postmortem, industry_domain, is_anonymous, category_ids } = req.body;
        const updated = await Idea.update(
            req.params.id,
            { title, short_description, detailed_postmortem, industry_domain, is_anonymous: !!is_anonymous },
            Array.isArray(category_ids) ? category_ids : null,
            req.session.userId
        );
        if (!updated) return res.status(403).json({ error: 'Not authorized or idea not found.' });
        res.json({ message: 'Idea updated successfully.' });
    } catch (err) {
        console.error('Update idea error:', err);
        res.status(500).json({ error: 'Failed to update idea.' });
    }
});

// DELETE /api/ideas/:id – delete idea (owner only)
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const deleted = await Idea.delete(req.params.id, req.session.userId);
        if (!deleted) return res.status(403).json({ error: 'Not authorized or idea not found.' });
        res.json({ message: 'Idea deleted successfully.' });
    } catch (err) {
        console.error('Delete idea error:', err);
        res.status(500).json({ error: 'Failed to delete idea.' });
    }
});

module.exports = router;
