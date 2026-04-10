const express = require('express');
const { 
    getUserHistory, 
    getAllHistory 
} = require('../controllers/historyController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', protect, getUserHistory); // GET /api/history
router.get('/all', protect, authorize('admin'), getAllHistory); // GET /api/history/all (Admin Only)

module.exports = router;
