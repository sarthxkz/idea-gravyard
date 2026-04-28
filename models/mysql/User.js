// models/User.js
const pool = require('../../db/connection');

class User {
    // INSERT – create a new user
    static async create(username, email, passwordHash) {
        const [result] = await pool.execute(
            'INSERT INTO USERS (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, passwordHash]
        );
        return result.insertId;
    }

    // SELECT – find user by email for login
    static async findByEmail(email) {
        const [rows] = await pool.execute(
            'SELECT * FROM USERS WHERE email = ?',
            [email]
        );
        return rows[0] || null;
    }

    // SELECT – find user by ID
    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT user_id, username, email, created_at FROM USERS WHERE user_id = ?',
            [id]
        );
        return rows[0] || null;
    }

    // SELECT – get all users (for admin/analytics)
    static async getAll() {
        const [rows] = await pool.execute(
            'SELECT user_id, username, email, created_at FROM USERS ORDER BY created_at DESC'
        );
        return rows;
    }

    // UPDATE – update username
    static async updateUsername(userId, newUsername) {
        const [result] = await pool.execute(
            'UPDATE USERS SET username = ? WHERE user_id = ?',
            [newUsername, userId]
        );
        return result.affectedRows;
    }
}

module.exports = User;
