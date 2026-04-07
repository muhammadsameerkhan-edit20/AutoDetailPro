const Vehicle = require('../models/vehicleModel');

// @desc    Get all vehicles for current user
// @route   GET /api/vehicles
// @access  Private
exports.getVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({ user: req.user.id });
        res.status(200).json({ success: true, count: vehicles.length, data: vehicles });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Add a vehicle
// @route   POST /api/vehicles
// @access  Private
exports.addVehicle = async (req, res) => {
    try {
        req.body.user = req.user.id;
        const vehicle = await Vehicle.create(req.body);
        res.status(201).json({ success: true, data: vehicle });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
// @access  Private
exports.updateVehicle = async (req, res) => {
    try {
        let vehicle = await Vehicle.findById(req.params.id);

        if (!vehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }

        // Make sure user owns vehicle
        if (vehicle.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: vehicle });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private
exports.deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);

        if (!vehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }

        // Make sure user owns vehicle
        if (vehicle.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        await vehicle.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
