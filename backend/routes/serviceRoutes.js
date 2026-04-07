const express = require('express');
const { 
    getServices, 
    getService, 
    createService, 
    updateService, 
    deleteService 
} = require('../controllers/serviceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// Public routes
router.get('/', getServices);
router.get('/:id', getService);

// Admin-only routes
router.use(protect);
router.use(authorize('admin'));

router.post('/', createService);
router.put('/:id', updateService);
router.delete('/:id', deleteService);

module.exports = router;
