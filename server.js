require('dotenv').config();

const express = require('express');
const cookieSession = require('cookie-session');
const cors = require('cors');
const path = require('path');
const { connectToMongo } = require('./db/mongo_connection');

const app = express();

if (process.env.MONGO_URI) {
    connectToMongo().catch((err) => {
        console.error('Initial MongoDB connection failed:', err);
    });
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
    name: 'session',
    keys: [process.env.SESSION_SECRET || 'idea_graveyard_secret'],
    maxAge: 7 * 24 * 60 * 60 * 1000,
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/ideas', require('./routes/ideas'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/analytics', require('./routes/analytics'));

app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error.' });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    if (process.env.MONGO_URI) {
        await connectToMongo();
    }

    app.listen(PORT, () => {
        console.log(`Idea Graveyard server running on http://localhost:${PORT}`);
    });
};

startServer().catch((err) => {
    console.error('Server startup failed:', err);
    process.exit(1);
});

module.exports = app;
