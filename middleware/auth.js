// middleware/auth.js – Session-based authentication guard
function requireAuth(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    }
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
}

function optionalAuth(req, res, next) {
    // Attaches user info to req if logged in, but doesn't block
    next();
}

module.exports = { requireAuth, optionalAuth };
