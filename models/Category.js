// models/Category.js - Dynamic Proxy
module.exports = process.env.MONGO_URI ? require('./mongo/Category') : require('./mysql/Category');
