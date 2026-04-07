const Payment = require('../models/paymentModel');
const Booking = require('../models/bookingModel');

// @desc    Process payment
// @route   POST /api/payments
// @access  Private
exports.processPayment = async (req, res) => {
    try {
        const { bookingId, amount, paymentMethod } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Logic for actual payment gateway would go here (Stripe, PayPal, etc.)
        // For now, we simulate success
        const payment = await Payment.create({
            booking: bookingId,
            user: req.user.id,
            amount,
            paymentMethod,
            paymentStatus: 'completed',
            transactionId: 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase()
        });

        // Update booking status explicitly to pending
        booking.status = 'pending';
        await booking.save();

        res.status(200).json({ success: true, data: payment });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get user payment history
// @route   GET /api/payments
// @access  Private
exports.getPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ user: req.user.id }).populate('booking');
        res.status(200).json({ success: true, count: payments.length, data: payments });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
