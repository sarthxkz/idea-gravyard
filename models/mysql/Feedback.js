// models/Feedback.js
const pool = require('../../db/connection');

class Feedback {
    // INSERT – add new feedback to an idea
    static async create(ideaId, postedBy, commentText, isAnonymous) {
        const [result] = await pool.execute(
            'INSERT INTO FEEDBACK (idea_id, posted_by, comment_text, is_anonymous) VALUES (?, ?, ?, ?)',
            [ideaId, postedBy, commentText, isAnonymous ? 1 : 0]
        );
        return result.insertId;
    }

    // SELECT with JOIN – get all feedback for an idea
    static async getForIdea(ideaId) {
        const [rows] = await pool.execute(
            `SELECT
          f.feedback_id,
          f.comment_text,
          f.is_anonymous,
          f.created_at,
          CASE WHEN f.is_anonymous THEN 'Anonymous' ELSE u.username END AS author
       FROM FEEDBACK f
       LEFT JOIN USERS u ON f.posted_by = u.user_id
       WHERE f.idea_id = ?
       ORDER BY f.created_at DESC`,
            [ideaId]
        );
        return rows;
    }

    // SELECT – feedback by ID
    static async findById(feedbackId) {
        const [rows] = await pool.execute(
            'SELECT * FROM FEEDBACK WHERE feedback_id = ?',
            [feedbackId]
        );
        return rows[0] || null;
    }

    // DELETE – remove a feedback entry
    static async delete(feedbackId, userId) {
        const [result] = await pool.execute(
            'DELETE FROM FEEDBACK WHERE feedback_id = ? AND posted_by = ?',
            [feedbackId, userId]
        );
        return result.affectedRows;
    }

    // COUNT – total feedback for a given idea
    static async countForIdea(ideaId) {
        const [rows] = await pool.execute(
            'SELECT COUNT(*) AS total FROM FEEDBACK WHERE idea_id = ?',
            [ideaId]
        );
        return rows[0].total;
    }
}

module.exports = Feedback;
