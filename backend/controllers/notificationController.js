const sendEmail = require('../utils/sendEmail');
const User = require('../models/userModel');

// @desc    Send custom email notification to a specific user (Admin ONLY)
// @route   POST /api/notifications/email
// @access  Private/Admin
exports.sendCustomNotification = async (req, res) => {
    try {
        const { userId, subject, message } = req.body;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await sendEmail({
            email: user.email,
            subject: subject || 'AutoDetail Pro - Notification',
            message: `Hello ${user.name},\n\n${message}\n\nWarm regards,\nAutoDetail Pro Team`
        });

        res.status(200).json({ success: true, message: `Notification successfully sent to ${user.email}` });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Send bulk email broadcast to all active customers
// @route   POST /api/notifications/broadcast
// @access  Private/Admin
exports.broadcastNotification = async (req, res) => {
    try {
        const { subject, message } = req.body;
        
        // Find users with role 'user'
        const users = await User.find({ role: 'user' });
        
        // Send email to each user (async)
        // In production, one might use a queue like Bull/Redis for bulk mailing
        const sendPromises = users.map(user => {
            return sendEmail({
                email: user.email,
                subject: subject || 'AutoDetail Pro - Special Announcement!',
                message: `Hello ${user.name},\n\n${message}\n\nBest regards,\nThe AutoDetail Pro Team`
            });
        });

        await Promise.all(sendPromises);

        res.status(200).json({ 
            success: true, 
            message: `Broadcast sent successfully to ${users.length} customers!` 
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
