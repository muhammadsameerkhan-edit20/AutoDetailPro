const express = require('express');
const { getVehicles, addVehicle, updateVehicle, deleteVehicle } = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All vehicle routes are protected
router.use(protect);

router.route('/')
    .get(getVehicles)
    .post(addVehicle);

router.route('/:id')
    .put(updateVehicle)
    .delete(deleteVehicle);

module.exports = router;
