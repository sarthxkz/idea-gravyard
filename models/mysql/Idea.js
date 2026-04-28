// models/Idea.js
const pool = require('../../db/connection');

class Idea {
    // INSERT – create a new idea and its failure category mappings
    static async create(data, categoryIds) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const [result] = await conn.execute(
                `INSERT INTO IDEAS (title, short_description, detailed_postmortem, industry_domain, posted_by, is_anonymous)
         VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    data.title,
                    data.short_description,
                    data.detailed_postmortem,
                    data.industry_domain,
                    data.posted_by,
                    data.is_anonymous ? 1 : 0,
                ]
            );
            const ideaId = result.insertId;

            // INSERT into junction table for each selected category
            if (categoryIds && categoryIds.length > 0) {
                const mapValues = categoryIds.map(cid => [ideaId, cid]);
                await conn.query(
                    'INSERT INTO IDEA_FAILURE_MAP (idea_id, category_id) VALUES ?',
                    [mapValues]
                );
            }

            await conn.commit();
            return ideaId;
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    }

    // SELECT with optional LIKE and WHERE filter + JOIN + ORDER BY
    static async getAll({ domain, search } = {}) {
        let query = `
      SELECT
        i.idea_id,
        i.title,
        i.short_description,
        i.industry_domain,
        i.is_anonymous,
        i.created_at,
        CASE WHEN i.is_anonymous THEN 'Anonymous' ELSE u.username END AS author,
        COUNT(DISTINCT f.feedback_id) AS feedback_count,
        GROUP_CONCAT(DISTINCT fc.category_name ORDER BY fc.category_name SEPARATOR ', ') AS categories
      FROM IDEAS i
      LEFT JOIN USERS u              ON i.posted_by      = u.user_id
      LEFT JOIN FEEDBACK f           ON i.idea_id        = f.idea_id
      LEFT JOIN IDEA_FAILURE_MAP ifm ON i.idea_id        = ifm.idea_id
      LEFT JOIN FAILURE_CATEGORIES fc ON ifm.category_id = fc.category_id
    `;

        const params = [];
        const conditions = [];

        // LIKE query – search by title
        if (search && search.trim()) {
            conditions.push('i.title LIKE ?');
            params.push(`%${search.trim()}%`);
        }

        // WHERE filter – by industry domain
        if (domain && domain.trim()) {
            conditions.push('i.industry_domain = ?');
            params.push(domain.trim());
        }

        if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');

        query += ' GROUP BY i.idea_id, i.title, i.short_description, i.industry_domain, i.is_anonymous, i.created_at, u.username';
        query += ' ORDER BY i.created_at DESC';

        const [rows] = await pool.execute(query, params);
        return rows;
    }

    // SELECT with JOINs – full idea details by ID
    static async getById(ideaId) {
        const [rows] = await pool.execute(
            `SELECT
         i.*,
         CASE WHEN i.is_anonymous THEN 'Anonymous' ELSE u.username END AS author,
         u.email AS author_email
       FROM IDEAS i
       LEFT JOIN USERS u ON i.posted_by = u.user_id
       WHERE i.idea_id = ?`,
            [ideaId]
        );
        return rows[0] || null;
    }

    // UPDATE – update idea fields
    static async update(ideaId, data, categoryIds, userId) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            await conn.execute(
                `UPDATE IDEAS
         SET title = ?, short_description = ?, detailed_postmortem = ?,
             industry_domain = ?, is_anonymous = ?
         WHERE idea_id = ? AND posted_by = ?`,
                [
                    data.title,
                    data.short_description,
                    data.detailed_postmortem,
                    data.industry_domain,
                    data.is_anonymous ? 1 : 0,
                    ideaId,
                    userId,
                ]
            );

            // DELETE old category mappings then re-insert
            if (categoryIds) {
                await conn.execute('DELETE FROM IDEA_FAILURE_MAP WHERE idea_id = ?', [ideaId]);
                if (categoryIds.length > 0) {
                    const mapValues = categoryIds.map(cid => [ideaId, cid]);
                    await conn.query('INSERT INTO IDEA_FAILURE_MAP (idea_id, category_id) VALUES ?', [mapValues]);
                }
            }

            await conn.commit();
            return true;
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    }

    // DELETE – remove an idea (cascades to FEEDBACK and IDEA_FAILURE_MAP)
    static async delete(ideaId, userId) {
        const [result] = await pool.execute(
            'DELETE FROM IDEAS WHERE idea_id = ? AND posted_by = ?',
            [ideaId, userId]
        );
        return result.affectedRows;
    }

    // GROUP BY + HAVING – analytics per domain
    static async getAnalytics() {
        const [byDomain] = await pool.execute(
            `SELECT industry_domain, COUNT(*) AS idea_count
       FROM IDEAS
       GROUP BY industry_domain
       HAVING COUNT(*) >= 1
       ORDER BY idea_count DESC`
        );

        const [totalRow] = await pool.execute(
            `SELECT
         (SELECT COUNT(*) FROM IDEAS)    AS total_ideas,
         (SELECT COUNT(*) FROM USERS)    AS total_users,
         (SELECT COUNT(*) FROM FEEDBACK) AS total_feedback,
         (SELECT COUNT(*) FROM FAILURE_CATEGORIES) AS total_categories`
        );

        // DISTINCT domains
        const [domains] = await pool.execute(
            'SELECT DISTINCT industry_domain FROM IDEAS ORDER BY industry_domain'
        );

        // Top ideas by feedback count
        const [topIdeas] = await pool.execute(
            `SELECT i.idea_id, i.title, COUNT(f.feedback_id) AS feedback_count
       FROM IDEAS i
       LEFT JOIN FEEDBACK f ON i.idea_id = f.idea_id
       GROUP BY i.idea_id, i.title
       ORDER BY feedback_count DESC
       LIMIT 5`
        );

        return {
            byDomain,
            totals: totalRow[0],
            domains: domains.map(d => d.industry_domain),
            topIdeas,
        };
    }

    // SELECT – get unique industry domains for filter dropdown
    static async getDomains() {
        const [rows] = await pool.execute(
            'SELECT DISTINCT industry_domain FROM IDEAS WHERE industry_domain IS NOT NULL ORDER BY industry_domain'
        );
        return rows.map(r => r.industry_domain);
    }
}

module.exports = Idea;
