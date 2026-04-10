const express = require('express');
const { 
    sendCustomNotification, 
    broadcastNotification 
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/email', protect, authorize('admin'), sendCustomNotification); // POST /api/notifications/email
router.post('/broadcast', protect, authorize('admin'), broadcastNotification); // POST /api/notifications/broadcast

module.exports = router;
