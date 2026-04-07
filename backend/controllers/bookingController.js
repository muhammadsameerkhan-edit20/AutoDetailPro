const Booking = require('../models/bookingModel');
const Service = require('../models/serviceModel');
const User = require('../models/userModel');
const slotValidator = require('../utils/slotValidator');
const sendEmail = require('../utils/sendEmail');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
    try {
        const { vehicle, service: serviceId, bookingDate, timeSlot, location } = req.body;

        // Check if service exists and get price
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        // Validate slot availability
        const isAvailable = await slotValidator.validateSlot(bookingDate, timeSlot);
        if (!isAvailable) {
            return res.status(400).json({ success: false, message: 'Time slot is full or already booked' });
        }

        // Ensure location is fully provided
        if (!location || !location.address || !location.lat || !location.lng) {
            return res.status(400).json({ success: false, message: 'Please provide complete location details (address, latitude, and longitude)'});
        }

        const booking = await Booking.create({
            user: req.user.id,
            vehicle,
            service: serviceId,
            bookingDate,
            timeSlot,
            location,
            totalAmount: service.price
        });

        // Send email notification
        const userCount = await User.findById(req.user.id);
        sendEmail({
            email: userCount.email,
            subject: 'AutoDetail Pro - Booking Received (Pending)',
            message: `Hello ${userCount.name},\n\nYour appointment request for ${service.name} has been received and is currently pending administrator approval.\n\nRequested Date: ${bookingDate}\nRequested Time: ${timeSlot}\nTotal Amount: $${service.price}\n\nWe will notify you once it has been accepted!\n\nThank you for choosing AutoDetail Pro!`
        });

        res.status(201).json({ success: true, data: booking });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get user's booking history
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate('vehicle')
            .populate('service');
        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Cancel or Trash a booking
// @route   DELETE /api/bookings/:id
// @access  Private
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (req.user.role === 'admin') {
            // Admin trashes the booking - moved to trash tab
            await Booking.findByIdAndUpdate(req.params.id, { isDeletedByAdmin: true });
            return res.status(200).json({ success: true, message: 'Booking moved to trash' });
        } else {
            // Make sure user owns booking
            if (booking.user.toString() !== req.user.id) {
                return res.status(401).json({ success: false, message: 'Not authorized' });
            }

            // User deleting their booking permanently hides it from panels
            const bookingUser = await User.findById(booking.user);
            await Booking.findByIdAndDelete(req.params.id);

            sendEmail({
                email: bookingUser.email,
                subject: 'AutoDetail Pro - Booking Cancelled & Deleted',
                message: `Hello ${bookingUser.name},\n\nYour detailing appointment has been successfully cancelled and removed from your dashboard.\n\nHope to see you again soon!`
            });

            return res.status(200).json({ success: true, message: 'Booking removed successfully' });
        }
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update booking status (Admin only)
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        const booking = await Booking.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true }
        ).populate('service');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        const bUser = await User.findById(booking.user);
        sendEmail({
            email: bUser.email,
            subject: `AutoDetail Pro - Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            message: `Hello ${bUser.name},\n\nYour detailing appointment for ${new Date(booking.bookingDate).toLocaleDateString()} at ${booking.timeSlot} has been marked as: ${status.toUpperCase()}.\n\nThank you for choosing us!`
        });

        res.status(200).json({ success: true, data: booking });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get available time slots for a specific date
// @route   GET /api/bookings/available-slots
// @access  Private
exports.getAvailableSlots = async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ success: false, message: 'Please provide a date' });
        }

        const timeSlots = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];
        const availableSlots = [];

        for (let slot of timeSlots) {
            const isAvailable = await slotValidator.validateSlot(date, slot);
            if (isAvailable) {
                availableSlots.push(slot);
            }
        }

        res.status(200).json({ success: true, data: availableSlots });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Reschedule a booking
// @route   PUT /api/bookings/:id/reschedule
// @access  Private
exports.rescheduleBooking = async (req, res) => {
    try {
        const { bookingDate, timeSlot } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Make sure user owns booking or user is admin
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to reschedule this booking' });
        }

        // Validate slot availability
        const isAvailable = await slotValidator.validateSlot(bookingDate, timeSlot);
        if (!isAvailable) {
            return res.status(400).json({ success: false, message: 'Selected time slot is full or already booked' });
        }

        booking.bookingDate = bookingDate;
        booking.timeSlot = timeSlot;
        await booking.save();

        const userObj = await User.findById(booking.user);
        sendEmail({
            email: userObj.email,
            subject: 'AutoDetail Pro - Booking Rescheduled',
            message: `Hello ${userObj.name},\n\nYour appointment has been successfully rescheduled.\n\nNew Date: ${new Date(bookingDate).toLocaleDateString()}\nNew Time: ${timeSlot}\n\nIf you have any further questions, please contact us.`
        });

        res.status(200).json({ success: true, message: 'Booking rescheduled successfully', data: booking });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

