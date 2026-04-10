const express = require('express');
const { getAllBookings, getAllUsers, bulkTrashBookings } = require('../controllers/adminController');
const { updateBookingStatus } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// Protect and authorize all admin routes
router.use(protect);
router.use(authorize('admin'));

router.get('/bookings', getAllBookings);
router.put('/bookings/bulk-trash', bulkTrashBookings);
router.put('/bookings/:id/status', updateBookingStatus);
router.get('/users', getAllUsers);

module.exports = router;
