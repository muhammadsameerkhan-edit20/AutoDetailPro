const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    make: {
        type: String,
        required: [true, 'Please add a make']
    },
    model: {
        type: String,
        required: [true, 'Please add a model']
    },
    year: {
        type: Number,
        required: [true, 'Please add a year']
    },
    licensePlate: {
        type: String,
        required: [true, 'Please add a license plate'],
        unique: true
    },
    vehicleType: {
        type: String,
        enum: ['sedan', 'suv', 'truck', 'van', 'other'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
