// models/mongo/Category.js
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    category_name: { type: String, required: true, unique: true },
    description: { type: String }
});

const CategoryModel = mongoose.model('Category', CategorySchema);

class Category {
    static async getAll() {
        const cats = await CategoryModel.find().sort({ category_name: 1 }).lean();
        return cats.map(c => ({ ...c, category_id: c._id.toString() }));
    }

    static async getForIdea(ideaId) {
        // We will fetch categories from Idea.js later since relationships are different
        // But if needed, we can just export a dummy or query them from the Idea document
        const IdeaModel = mongoose.model('Idea');
        try {
            const idea = await IdeaModel.findById(ideaId).populate('categories').lean();
            if (!idea || !idea.categories) return [];
            return idea.categories.map(c => ({ ...c, category_id: c._id.toString() }));
        } catch(e) { return []; }
    }

    static async create(categoryName, description) {
        let cat = await CategoryModel.findOne({ category_name: categoryName });
        if (!cat) {
            cat = new CategoryModel({ category_name: categoryName, description });
            await cat.save();
        }
        return cat._id.toString();
    }

    static async findById(categoryId) {
        try {
            const cat = await CategoryModel.findById(categoryId).lean();
            if (!cat) return null;
            cat.category_id = cat._id.toString();
            return cat;
        } catch(e) { return null; }
    }

    static async getWithIdeaCounts() {
        const IdeaModel = mongoose.model('Idea');
        const cats = await CategoryModel.find().lean();
        const results = [];
        for (const c of cats) {
            const count = await IdeaModel.countDocuments({ categories: c._id });
            results.push({
                category_id: c._id.toString(),
                category_name: c.category_name,
                description: c.description,
                idea_count: count
            });
        }
        return results.sort((a,b) => b.idea_count - a.idea_count);
    }

    static async getIdeasForCategory(categoryId) {
        const IdeaModel = mongoose.model('Idea');
        try {
            const ideas = await IdeaModel.find({ categories: categoryId })
                .populate('posted_by', 'username')
                .sort({ created_at: -1 })
                .lean();
                
            return ideas.map(i => ({
                idea_id: i._id.toString(),
                title: i.title,
                short_description: i.short_description,
                industry_domain: i.industry_domain,
                is_anonymous: i.is_anonymous,
                created_at: i.created_at,
                author: i.is_anonymous || !i.posted_by ? 'Anonymous' : i.posted_by.username
            }));
        } catch(e) { return []; }
    }
}

module.exports = Category;
