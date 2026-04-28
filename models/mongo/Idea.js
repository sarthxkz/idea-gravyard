// models/mongo/Idea.js
const mongoose = require('mongoose');
require('./Category');
require('./Feedback');
require('./User');
const CategoryModel = mongoose.model('Category');
const FeedbackModel = mongoose.model('Feedback');
const UserModel = mongoose.model('User');

const IdeaSchema = new mongoose.Schema({
    title: { type: String, required: true },
    short_description: { type: String },
    detailed_postmortem: { type: String },
    industry_domain: { type: String, default: 'Other' },
    posted_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    is_anonymous: { type: Boolean, default: false },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    created_at: { type: Date, default: Date.now }
});

const IdeaModel = mongoose.model('Idea', IdeaSchema);

class Idea {
    static async create(data, categoryIds) {
        const idea = new IdeaModel({
            title: data.title,
            short_description: data.short_description,
            detailed_postmortem: data.detailed_postmortem,
            industry_domain: data.industry_domain,
            posted_by: data.posted_by,
            is_anonymous: data.is_anonymous,
            categories: categoryIds || []
        });
        await idea.save();
        return idea._id.toString();
    }

    static async getAll({ domain, search } = {}) {
        const query = {};
        if (search && search.trim()) {
            query.title = { $regex: search.trim(), $options: 'i' };
        }
        if (domain && domain.trim()) {
            query.industry_domain = domain.trim();
        }

        const ideas = await IdeaModel.find(query)
            .populate('posted_by', 'username')
            .populate('categories', 'category_name')
            .sort({ created_at: -1 })
            .lean();

        // Get feedback counts
        const results = [];
        for (const i of ideas) {
            const count = await FeedbackModel.countDocuments({ idea_id: i._id });
            const catNames = (i.categories || []).map(c => c.category_name).sort().join(', ');
            
            results.push({
                idea_id: i._id.toString(),
                title: i.title,
                short_description: i.short_description,
                industry_domain: i.industry_domain,
                is_anonymous: i.is_anonymous,
                created_at: i.created_at,
                author: i.is_anonymous || !i.posted_by ? 'Anonymous' : i.posted_by.username,
                feedback_count: count,
                categories: catNames
            });
        }
        return results;
    }

    static async getById(ideaId) {
        try {
            const i = await IdeaModel.findById(ideaId)
                .populate('posted_by', 'username email')
                .lean();
            if (!i) return null;
            
            i.idea_id = i._id.toString();
            i.author = i.is_anonymous || !i.posted_by ? 'Anonymous' : i.posted_by.username;
            i.author_email = i.posted_by ? i.posted_by.email : null;
            return i;
        } catch(e) { return null; }
    }

    static async update(ideaId, data, categoryIds, userId) {
        try {
            const updateData = {
                title: data.title,
                short_description: data.short_description,
                detailed_postmortem: data.detailed_postmortem,
                industry_domain: data.industry_domain,
                is_anonymous: data.is_anonymous
            };
            if (categoryIds !== null) {
                updateData.categories = categoryIds;
            }
            const res = await IdeaModel.updateOne(
                { _id: ideaId, posted_by: userId },
                { $set: updateData }
            );
            return res.modifiedCount > 0;
        } catch(e) { return false; }
    }

    static async delete(ideaId, userId) {
        try {
            const res = await IdeaModel.deleteOne({ _id: ideaId, posted_by: userId });
            if (res.deletedCount > 0) {
                // Cascading deletes
                await FeedbackModel.deleteMany({ idea_id: ideaId });
                return true;
            }
            return false;
        } catch(e) { return false; }
    }

    static async getDomains() {
        return await IdeaModel.distinct('industry_domain');
    }

    static async getAnalytics() {
        const [totalIdeas, totalUsers, totalFeedback, totalCategories] = await Promise.all([
            IdeaModel.countDocuments(),
            UserModel.countDocuments(),
            FeedbackModel.countDocuments(),
            CategoryModel.countDocuments()
        ]);
        
        const byDomainRaw = await IdeaModel.aggregate([
            { $group: { _id: "$industry_domain", idea_count: { $sum: 1 } } },
            { $sort: { idea_count: -1 } }
        ]);
        
        const byDomain = byDomainRaw.map(d => ({
            industry_domain: d._id || 'Other',
            idea_count: d.idea_count
        }));
        
        const domains = await IdeaModel.distinct('industry_domain');
        
        // top ideas by feedback count
        const topFeedbackRaw = await FeedbackModel.aggregate([
            { $group: { _id: "$idea_id", feedback_count: { $sum: 1 } } },
            { $sort: { feedback_count: -1 } },
            { $limit: 5 }
        ]);
        
        const topIdeas = [];
        for (const f of topFeedbackRaw) {
            const i = await IdeaModel.findById(f._id).select('title').lean();
            if (i) {
                topIdeas.push({
                    idea_id: i._id.toString(),
                    title: i.title,
                    feedback_count: f.feedback_count
                });
            }
        }

        return {
            byDomain,
            totals: {
                total_ideas: totalIdeas,
                total_users: totalUsers,
                total_feedback: totalFeedback,
                total_categories: totalCategories
            },
            domains: domains.sort(),
            topIdeas
        };
    }
}

module.exports = Idea;
