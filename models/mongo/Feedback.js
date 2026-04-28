// models/mongo/Feedback.js
const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
    idea_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Idea', required: true },
    posted_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment_text: { type: String, required: true },
    is_anonymous: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
});

const FeedbackModel = mongoose.model('Feedback', FeedbackSchema);

class Feedback {
    static async create(ideaId, postedBy, commentText, isAnonymous) {
        const fb = new FeedbackModel({
            idea_id: ideaId,
            posted_by: postedBy,
            comment_text: commentText,
            is_anonymous: isAnonymous
        });
        await fb.save();
        return fb._id.toString();
    }

    static async getForIdea(ideaId) {
        try {
            const feedbacks = await FeedbackModel.find({ idea_id: ideaId })
                .populate('posted_by', 'username')
                .sort({ created_at: -1 })
                .lean();
                
            return feedbacks.map(f => ({
                feedback_id: f._id.toString(),
                comment_text: f.comment_text,
                is_anonymous: f.is_anonymous,
                created_at: f.created_at,
                author: f.is_anonymous || !f.posted_by ? 'Anonymous' : f.posted_by.username
            }));
        } catch(e) { return []; }
    }

    static async findById(feedbackId) {
        try {
            const fb = await FeedbackModel.findById(feedbackId).lean();
            if (!fb) return null;
            fb.feedback_id = fb._id.toString();
            return fb;
        } catch(e) { return null; }
    }

    static async delete(feedbackId, userId) {
        try {
            const res = await FeedbackModel.deleteOne({ _id: feedbackId, posted_by: userId });
            return res.deletedCount;
        } catch(e) { return 0; }
    }

    static async countForIdea(ideaId) {
        try {
            return await FeedbackModel.countDocuments({ idea_id: ideaId });
        } catch(e) { return 0; }
    }
}

module.exports = Feedback;
