// scripts/migrate.js
require('dotenv').config();
const mysql = require('mysql2/promise');
const mongoose = require('mongoose');

// We bypass the dynamic models and directly require the MongoDB ones to write to them
require('../db/mongo_connection');
require('../models/mongo/User');
require('../models/mongo/Category');
require('../models/mongo/Idea');
require('../models/mongo/Feedback');

const UserModel = mongoose.model('User');
const IdeaModel = mongoose.model('Idea');
const CategoryModel = mongoose.model('Category');
const FeedbackModel = mongoose.model('Feedback');

async function migrate() {
    if (!process.env.MONGO_URI) {
        console.error('❌ MONGO_URI missing. Cannot migrate.');
        process.exit(1);
    }
    
    console.log('⏳ Connecting to Source MySQL...');
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'idea_graveyard_db',
        port: parseInt(process.env.DB_PORT || '3306'),
    });

    try {
        console.log('⏳ Connected to MySQL. Clearing MongoDB schemas for fresh import...');
        await Promise.all([
            UserModel.deleteMany({}),
            CategoryModel.deleteMany({}),
            IdeaModel.deleteMany({}),
            FeedbackModel.deleteMany({})
        ]);

        // Maps to hold old Int IDs to new ObjectIds
        const userMap = {};
        const catMap = {};
        const ideaMap = {};

        // 1. Migrate Users
        console.log('🔄 Migrating USERS...');
        const [users] = await pool.query('SELECT * FROM USERS');
        for (const u of users) {
            const newUser = new UserModel({
                username: u.username,
                email: u.email,
                password_hash: u.password_hash,
                created_at: u.created_at
            });
            await newUser.save();
            userMap[u.user_id] = newUser._id;
        }

        // 2. Migrate Categories
        console.log('🔄 Migrating FAILURE_CATEGORIES...');
        const [cats] = await pool.query('SELECT * FROM FAILURE_CATEGORIES');
        for (const c of cats) {
            const newCat = new CategoryModel({
                category_name: c.category_name,
                description: c.description
            });
            await newCat.save();
            catMap[c.category_id] = newCat._id;
        }

        // 3. Migrate Ideas
        console.log('🔄 Migrating IDEAS...');
        const [ideas] = await pool.query('SELECT * FROM IDEAS');
        for (const i of ideas) {
            // Find categories for this idea
            const [maps] = await pool.query('SELECT category_id FROM IDEA_FAILURE_MAP WHERE idea_id = ?', [i.idea_id]);
            const mappedCatIds = maps.map(m => catMap[m.category_id]).filter(Boolean);

            const newIdea = new IdeaModel({
                title: i.title,
                short_description: i.short_description,
                detailed_postmortem: i.detailed_postmortem,
                industry_domain: i.industry_domain,
                posted_by: userMap[i.posted_by] || null,
                is_anonymous: i.is_anonymous === 1,
                categories: mappedCatIds,
                created_at: i.created_at
            });
            await newIdea.save();
            ideaMap[i.idea_id] = newIdea._id;
        }

        // 4. Migrate Feedback
        console.log('🔄 Migrating FEEDBACK...');
        const [feedbacks] = await pool.query('SELECT * FROM FEEDBACK');
        for (const f of feedbacks) {
            if (!ideaMap[f.idea_id]) continue; // Idea was deleted or invalid
            const newFeedback = new FeedbackModel({
                idea_id: ideaMap[f.idea_id],
                posted_by: userMap[f.posted_by] || null,
                comment_text: f.comment_text,
                is_anonymous: f.is_anonymous === 1,
                created_at: f.created_at
            });
            await newFeedback.save();
        }

        console.log('✅ Migration COMPLETED successfully!');
        process.exit(0);

    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
