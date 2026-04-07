const User = require('../models/userModel');

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            profilePicture: req.body.profilePicture // Add this!
        };

        // Make sure to remove undefined fields so we don't accidentally blank out the DB
        Object.keys(fieldsToUpdate).forEach(key => {
            if (fieldsToUpdate[key] === undefined) delete fieldsToUpdate[key]
        });

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
