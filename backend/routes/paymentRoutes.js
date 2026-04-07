const express = require('express');
const { processPayment, getPayments } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getPayments)
    .post(processPayment);

module.exports = router;
