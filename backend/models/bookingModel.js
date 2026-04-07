const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    vehicle: {
        type: mongoose.Schema.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    service: {
        type: mongoose.Schema.ObjectId,
        ref: 'Service',
        required: true
    },
    bookingDate: {
        type: Date,
        required: [true, 'Please add a booking date']
    },
    timeSlot: {
        type: String,
        required: [true, 'Please add a time slot']
    },
    location: {
        address: {
            type: String,
            required: [true, 'Please provide an address for the service']
        },
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        }
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'completed', 'cancelled'],
        default: 'pending'
    },
    totalAmount: {
        type: Number,
        required: true
    },
    isDeletedByUser: {
        type: Boolean,
        default: false
    },
    isDeletedByAdmin: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', bookingSchema);
