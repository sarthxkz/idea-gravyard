// models/Idea.js - Dynamic Proxy
module.exports = process.env.MONGO_URI ? require('./mongo/Idea') : require('./mysql/Idea');
