const express = require('express');
const { createBooking, getBookings, cancelBooking, getAvailableSlots, rescheduleBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/available-slots', getAvailableSlots);

router.route('/')
    .get(getBookings)
    .post(createBooking);

router.route('/:id')
    .delete(cancelBooking);

router.put('/:id/reschedule', rescheduleBooking);

module.exports = router;
