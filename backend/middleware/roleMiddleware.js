/**
 * Middleware to restrict access based on user roles.
 * Defaults to allowing only 'admin' if no roles specified.
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        // Check if user is attached and has the required role
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role || 'none'} is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = { authorize };
