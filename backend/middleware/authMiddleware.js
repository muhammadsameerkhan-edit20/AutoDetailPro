const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

/**
 * Middleware to verify JWT token and protect routes.
 * Attaches user to the request object if token is valid.
 */
const protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Return 401 if token is missing
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route, token missing'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user to request (excluding password)
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No user found with this id'
            });
        }

        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route, token invalid'
        });
    }
};

module.exports = { protect };
