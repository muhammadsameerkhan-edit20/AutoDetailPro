const Booking = require('../models/bookingModel');

// @desc    Get user's booking history
// @route   GET /api/history
// @access  Private
exports.getUserHistory = async (req, res) => {
    try {
        const bookings = await Booking.find({ 
            user: req.user.id, 
            isDeletedByAdmin: { $ne: true } // Show anything that isn't explicitly trashed
        })
            .populate('vehicle')
            .populate('service')
            .sort({ createdAt: -1 });

        res.status(200).json({ 
            success: true, 
            count: bookings.length, 
            data: bookings 
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all bookings history (Admin Only)
// @route   GET /api/history/all
// @access  Private/Admin
exports.getAllHistory = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'name email')
            .populate('vehicle')
            .populate('service')
            .sort({ createdAt: -1 });

        res.status(200).json({ 
            success: true, 
            count: bookings.length, 
            data: bookings 
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
