// models/User.js - Dynamic Proxy
module.exports = process.env.MONGO_URI ? require('./mongo/User') : require('./mysql/User');
