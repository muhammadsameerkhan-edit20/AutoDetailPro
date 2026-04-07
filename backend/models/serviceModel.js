const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a service name'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    duration: {
        type: Number,
        required: [true, 'Please add duration in minutes']
    },
    category: {
        type: String,
        enum: ['exterior', 'interior', 'full-detail', 'ceramic-coating', 'other'],
        required: true
    },
    thumbnail: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Service', serviceSchema);
