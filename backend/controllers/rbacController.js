const User = require('../models/userModel');

// @desc    Get all registered users with their current role (Admin only)
// @route   GET /api/rbac/users
// @access  Private/Admin
exports.getAllUsersWithRoles = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update a user's role (Admin only — e.g. promoting a user to admin)
// @route   PUT /api/rbac/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        
        // Prevent lowering own admin role
        if (req.user.id === req.params.id && req.user.role === 'admin' && role !== 'admin') {
            return res.status(400).json({ success: false, message: 'You cannot revoke your own administrator role' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.role = role;
        await user.save();

        res.status(200).json({ 
            success: true, 
            message: `User ${user.name} role updated to ${role.toUpperCase()}`, 
            data: user 
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get current user's profile and granted permissions
// @route   GET /api/rbac/profile
// @access  Private
exports.getProfilePermissions = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        // Define simple permission set based on role
        const permissions = user.role === 'admin' ? 
            ['read:all', 'write:all', 'delete:all', 'manage:users', 'view:analytics'] : 
            ['read:own', 'write:own', 'manage:profile'];

        res.status(200).json({ 
            success: true, 
            data: user,
            permissions
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
