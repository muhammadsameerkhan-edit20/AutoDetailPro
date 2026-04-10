const express = require('express');
const { 
    getAllUsersWithRoles, 
    updateUserRole, 
    getProfilePermissions 
} = require('../controllers/rbacController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/users', protect, authorize('admin'), getAllUsersWithRoles); // GET /api/rbac/users
router.put('/users/:id/role', protect, authorize('admin'), updateUserRole); // PUT /api/rbac/users/:id/role
router.get('/profile', protect, getProfilePermissions); // GET /api/rbac/profile

module.exports = router;
