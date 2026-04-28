// models/Category.js
const pool = require('../../db/connection');

class Category {
    // SELECT DISTINCT – all unique categories
    static async getAll() {
        const [rows] = await pool.execute(
            'SELECT DISTINCT category_id, category_name, description FROM FAILURE_CATEGORIES ORDER BY category_name'
        );
        return rows;
    }

    // SELECT with JOIN – categories linked to a specific idea
    static async getForIdea(ideaId) {
        const [rows] = await pool.execute(
            `SELECT fc.category_id, fc.category_name, fc.description
       FROM FAILURE_CATEGORIES fc
       JOIN IDEA_FAILURE_MAP ifm ON fc.category_id = ifm.category_id
       WHERE ifm.idea_id = ?
       ORDER BY fc.category_name`,
            [ideaId]
        );
        return rows;
    }

    // INSERT – add a new category
    static async create(categoryName, description) {
        const [result] = await pool.execute(
            'INSERT INTO FAILURE_CATEGORIES (category_name, description) VALUES (?, ?)',
            [categoryName, description]
        );
        return result.insertId;
    }

    // SELECT by ID
    static async findById(categoryId) {
        const [rows] = await pool.execute(
            'SELECT * FROM FAILURE_CATEGORIES WHERE category_id = ?',
            [categoryId]
        );
        return rows[0] || null;
    }

    // SELECT IDEAS COUNT per category (GROUP BY)
    static async getWithIdeaCounts() {
        const [rows] = await pool.execute(
            `SELECT fc.category_id, fc.category_name, fc.description,
              COUNT(DISTINCT ifm.idea_id) AS idea_count
       FROM FAILURE_CATEGORIES fc
       LEFT JOIN IDEA_FAILURE_MAP ifm ON fc.category_id = ifm.category_id
       GROUP BY fc.category_id, fc.category_name, fc.description
       ORDER BY idea_count DESC`
        );
        return rows;
    }

    // SELECT ideas belonging to a category
    static async getIdeasForCategory(categoryId) {
        const [rows] = await pool.execute(
            `SELECT i.idea_id, i.title, i.short_description, i.industry_domain,
              i.is_anonymous, i.created_at,
              CASE WHEN i.is_anonymous THEN 'Anonymous' ELSE u.username END AS author
       FROM IDEAS i
       JOIN IDEA_FAILURE_MAP ifm ON i.idea_id = ifm.idea_id
       LEFT JOIN USERS u ON i.posted_by = u.user_id
       WHERE ifm.category_id = ?
       ORDER BY i.created_at DESC`,
            [categoryId]
        );
        return rows;
    }
}

module.exports = Category;
