const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a promotion title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    discountCode: {
        type: String,
        required: [true, 'Please add a unique discount code'],
        unique: true,
        uppercase: true,
        trim: true
    },
    discountPercentage: {
        type: Number,
        required: [true, 'Please provide discount percent (1-100)'],
        min: 1,
        max: 100
    },
    expiryDate: {
        type: Date,
        required: [true, 'Please add an expiration date']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    usageLimit: {
        type: Number,
        default: 50 // Limit total times the code can be used
    },
    usedCount: {
        type: Number,
        default: 0
    },
    minBookingAmount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Offer', offerSchema);
