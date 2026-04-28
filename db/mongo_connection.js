const mongoose = require('mongoose');

let connectionPromise = null;

async function connectToMongo() {
    if (!process.env.MONGO_URI) {
        return null;
    }

    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (!connectionPromise) {
        connectionPromise = mongoose
            .connect(process.env.MONGO_URI)
            .then((mongooseInstance) => {
                console.log('MongoDB connected successfully to Atlas.');
                return mongooseInstance.connection;
            })
            .catch((err) => {
                connectionPromise = null;
                console.error('MongoDB connection error:', err);
                throw err;
            });
    }

    return connectionPromise;
}

module.exports = { connectToMongo };
