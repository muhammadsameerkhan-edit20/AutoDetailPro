const express = require('express');
const { 
    getAnalyticsDashboard, 
    getBookingReport,
    resetMonthlyRevenue
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/dashboard', protect, authorize('admin'), getAnalyticsDashboard);
router.get('/reports/bookings', protect, authorize('admin'), getBookingReport);
router.post('/reset-monthly', protect, authorize('admin'), resetMonthlyRevenue);

module.exports = router;
