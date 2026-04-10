const Booking = require('../models/bookingModel');
const Payment = require('../models/paymentModel');
const User = require('../models/userModel');

const Setting = require('../models/settingModel');

// @desc    Get dashboard analytics (Bookings, Users, Revenue)
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
exports.getAnalyticsDashboard = async (req, res) => {
    try {
        // Calculate only "Active" bookings (not completed or cancelled)
        const totalBookings = await Booking.countDocuments({ status: { $in: ['pending', 'accepted'] } });
        
        // Count only users that actually created a booking
        const distinctCustomers = await Booking.distinct('user');
        const countUsers = distinctCustomers.length;
        
        // Check for manual revenue reset date
        const resetSetting = await Setting.findOne({ key: 'revenueResetDate' });
        const resetDate = resetSetting ? new Date(resetSetting.value) : new Date(0); // Default to beginning of time

        // Calculate total revenue
        const payments = await Payment.find({ paymentStatus: 'completed' });
        const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

        // Get monthly revenue (Current Calendar Month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthlyRevenue = payments
            .filter(p => {
                const pDate = new Date(p.createdAt);
                return pDate.getMonth() === currentMonth && 
                       pDate.getFullYear() === currentYear &&
                       pDate >= resetDate; // Respect the reset date
            })
            .reduce((acc, curr) => acc + curr.amount, 0);

        // Get Previous Month's Revenue
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        
        const prevMonthRevenue = payments
            .filter(p => {
                const pDate = new Date(p.createdAt);
                return pDate.getMonth() === prevMonth && 
                       pDate.getFullYear() === prevYear;
            })
            .reduce((acc, curr) => acc + curr.amount, 0);

        // Monthly Bookings Breakdown
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyStats = [];
        for (let i = 0; i <= currentMonth; i++) {
            const bookingsInMonth = await Booking.countDocuments({
                createdAt: {
                    $gte: new Date(new Date().getFullYear(), i, 1),
                    $lt: new Date(new Date().getFullYear(), i + 1, 1)
                }
            });
            monthlyStats.push({ month: monthNames[i], bookings: bookingsInMonth });
        }

        res.status(200).json({
            success: true,
            data: {
                totalBookings,
                totalUsers: countUsers,
                totalRevenue,
                monthlyRevenue,
                prevMonthRevenue,
                monthlyBookings: monthlyStats,
                lastResetDate: resetSetting ? resetSetting.value : null
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Reset monthly revenue counter
// @route   POST /api/analytics/reset-monthly
// @access  Private/Admin
exports.resetMonthlyRevenue = async (req, res) => {
    try {
        const today = new Date();
        await Setting.findOneAndUpdate(
            { key: 'revenueResetDate' },
            { value: today, updatedAt: today },
            { upsert: true, new: true }
        );

        res.status(200).json({ 
            success: true, 
            message: 'Monthly revenue counter reset successfully to today.' 
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get detailed report of all bookings
// @route   GET /api/analytics/reports/bookings
// @access  Private/Admin
exports.getBookingReport = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'name email address phone')
            .populate('service', 'name price category')
            .sort({ bookingDate: -1 });

        res.status(200).json({ 
            success: true, 
            count: bookings.length, 
            data: bookings 
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
