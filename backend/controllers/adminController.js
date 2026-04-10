const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const Payment = require('../models/paymentModel');

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().populate('user').populate('vehicle').populate('service');
        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all users (customers who made bookings)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        const distinctCustomers = await Booking.distinct('user');
        const users = await User.find({ _id: { $in: distinctCustomers } });
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Bulk trash bookings
// @route   PUT /api/admin/bookings/bulk-trash
// @access  Private/Admin
exports.bulkTrashBookings = async (req, res) => {
    try {
        const { bookingIds } = req.body;
        if (!bookingIds || !Array.isArray(bookingIds)) {
            return res.status(400).json({ success: false, message: 'Please provide an array of booking IDs' });
        }
        
        await Booking.updateMany(
            { _id: { $in: bookingIds } },
            { $set: { isDeletedByAdmin: true } }
        );

        res.status(200).json({ success: true, message: 'Selected bookings moved to trash' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
