/**
 * Global Error Handling Middleware.
 * Catches errors throughout the app and returns standardized JSON responses.
 */
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log the error for the developer
    console.error(`ERROR: ${err.stack}`);

    // Mongoose bad ObjectId error (CastError)
    if (err.name === 'CastError') {
        error.message = 'Resource not found: Invalid ID format';
        error.statusCode = 404;
    }

    // Mongoose duplicate key error (11000)
    if (err.code === 11000) {
        error.message = 'Duplicate field value entered';
        error.statusCode = 400;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        error.message = Object.values(err.errors).map(val => val.message).join(', ');
        error.statusCode = 400;
    }

    // JWT verification errors
    if (err.name === 'JsonWebTokenError') {
        error.message = 'Invalid token, please login again';
        error.statusCode = 401;
    }

    if (err.name === 'TokenExpiredError') {
        error.message = 'Your session has expired, please login again';
        error.statusCode = 401;
    }

    // Send final error response
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Internal Server Error'
    });
};

module.exports = errorHandler;
