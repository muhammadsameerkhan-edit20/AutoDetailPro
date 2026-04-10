const Offer = require('../models/offerModel');
const User = require('../models/userModel');

// @desc    Get all active promotional offers for users
// @route   GET /api/offers
// @access  Public
exports.getPublicOffers = async (req, res) => {
    try {
        const offers = await Offer.find({ 
            isActive: true, 
            expiryDate: { $gte: new Date() } 
        });

        res.status(200).json({ 
            success: true, 
            count: offers.length, 
            data: offers 
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create a new promotional offer (Admin only)
// @route   POST /api/offers
// @access  Private/Admin
exports.createOffer = async (req, res) => {
    try {
        const offer = await Offer.create(req.body);
        res.status(201).json({ success: true, data: offer });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Apply a discount code to a potential booking
// @route   POST /api/offers/apply
// @access  Private
exports.applyDiscountCode = async (req, res) => {
    try {
        const { code, bookingAmount } = req.body;
        
        const offer = await Offer.findOne({ discountCode: code.toUpperCase(), isActive: true });
        
        if (!offer) {
            return res.status(404).json({ success: false, message: 'Invalid or inactive discount code' });
        }

        if (new Date() > new Date(offer.expiryDate)) {
            return res.status(400).json({ success: false, message: 'This code has expired' });
        }

        if (offer.usedCount >= offer.usageLimit) {
            return res.status(400).json({ success: false, message: 'This code has reached its usage limit' });
        }

        if (bookingAmount < offer.minBookingAmount) {
            return res.status(400).json({ success: false, message: `A minimum booking of Rs. ${offer.minBookingAmount} is required for this code` });
        }

        const discountValue = (bookingAmount * (offer.discountPercentage / 100));
        const finalPrice = bookingAmount - discountValue;

        res.status(200).json({ 
            success: true, 
            message: `Success! You saved Rs. ${discountValue.toFixed(2)} (${offer.discountPercentage}%)`,
            data: {
                originalPrice: bookingAmount,
                discount: discountValue,
                finalPrice,
                code: offer.discountCode
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get user loyalty points and tier status
// @route   GET /api/offers/loyalty
// @access  Private
exports.getLoyaltyInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('name loyaltyPoints loyaltyTier');
        
        // Define perks based on tier
        let perks = "Standard detailing rates.";
        if (user.loyaltyTier === 'Gold') perks = "10% Exclusive discount on interior detailing.";
        if (user.loyaltyTier === 'Diamond') perks = "Free Engine Bay detailing once per year & 15% discount on all services.";

        res.status(200).json({ 
            success: true, 
            data: {
                points: user.loyaltyPoints,
                tier: user.loyaltyTier,
                perks
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update an offer (Admin only)
// @route   PUT /api/offers/:id
// @access  Private/Admin
exports.updateOffer = async (req, res) => {
    try {
        const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, data: offer });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete an offer (Admin only)
// @route   DELETE /api/offers/:id
// @access  Private/Admin
exports.deleteOffer = async (req, res) => {
    try {
        await Offer.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Offer deleted successfully' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
