// routes/feedback.js
const express = require('express');
const Feedback = require('../models/Feedback');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// GET /api/feedback/:ideaId – all feedback for an idea
router.get('/:ideaId', async (req, res) => {
    try {
        const feedback = await Feedback.getForIdea(req.params.ideaId);
        const count = await Feedback.countForIdea(req.params.ideaId);
        res.json({ feedback, count });
    } catch (err) {
        console.error('Get feedback error:', err);
        res.status(500).json({ error: 'Failed to fetch feedback.' });
    }
});

// POST /api/feedback – add feedback (auth required)
router.post('/', requireAuth, async (req, res) => {
    try {
        const { idea_id, comment_text, is_anonymous } = req.body;
        if (!idea_id || !comment_text || !comment_text.trim())
            return res.status(400).json({ error: 'Idea ID and comment are required.' });

        const feedbackId = await Feedback.create(
            idea_id,
            req.session.userId,
            comment_text.trim(),
            !!is_anonymous
        );

        res.status(201).json({ message: 'Feedback added.', feedbackId });
    } catch (err) {
        console.error('Add feedback error:', err);
        res.status(500).json({ error: 'Failed to add feedback.' });
    }
});

// DELETE /api/feedback/:id – delete own feedback
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const deleted = await Feedback.delete(req.params.id, req.session.userId);
        if (!deleted) return res.status(403).json({ error: 'Not authorized or feedback not found.' });
        res.json({ message: 'Feedback deleted.' });
    } catch (err) {
        console.error('Delete feedback error:', err);
        res.status(500).json({ error: 'Failed to delete feedback.' });
    }
});

module.exports = router;
