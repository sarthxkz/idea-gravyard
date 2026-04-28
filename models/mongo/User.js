// models/mongo/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});

const UserModel = mongoose.model('User', UserSchema);

class User {
    static async create(username, email, passwordHash) {
        const user = new UserModel({ username, email, password_hash: passwordHash });
        await user.save();
        return user._id.toString();
    }

    static async findByEmail(email) {
        const user = await UserModel.findOne({ email }).lean();
        if (!user) return null;
        user.user_id = user._id.toString();
        return user;
    }

    static async findById(id) {
        try {
            const user = await UserModel.findById(id).lean();
            if (!user) return null;
            user.user_id = user._id.toString();
            return user;
        } catch(e) { return null; }
    }

    static async getAll() {
        const users = await UserModel.find().sort({ created_at: -1 }).lean();
        return users.map(u => ({ ...u, user_id: u._id.toString() }));
    }

    static async updateUsername(userId, newUsername) {
        try {
            const res = await UserModel.updateOne({ _id: userId }, { username: newUsername });
            return res.modifiedCount;
        } catch(e) { return 0; }
    }
}

module.exports = User;
