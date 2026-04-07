const Booking = require('../models/bookingModel');

/**
 * Validates if a specific time slot is available on a given date.
 * Business Rule: Max 3 bookings per hour/slot.
 * 
 * @param {Date} bookingDate - The date to check
 * @param {String} timeSlot - The time slot (e.g., "10:00 AM")
 * @returns {Boolean} - True if available, False if full
 */
const validateSlot = async (bookingDate, timeSlot) => {
    try {
        // Count existing bookings for this specific date and time slot
        // We only count confirmed or pending bookings (ignore cancelled)
        const bookingCount = await Booking.countDocuments({
            bookingDate: new Date(bookingDate),
            timeSlot: timeSlot,
            status: { $ne: 'cancelled' }
        });

        const MAX_BOOKINGS_PER_SLOT = 3;

        // If count is 3 or more, the slot is full
        if (bookingCount >= MAX_BOOKINGS_PER_SLOT) {
            return false;
        }

        // Slot is available
        return true;
    } catch (err) {
        console.error('Slot Validation error:', err);
        return false;
    }
};

module.exports = { validateSlot };
