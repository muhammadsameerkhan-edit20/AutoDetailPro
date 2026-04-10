const express = require('express');
const { 
    getPublicOffers, 
    createOffer, 
    applyDiscountCode, 
    getLoyaltyInfo, 
    updateOffer, 
    deleteOffer 
} = require('../controllers/offerController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// Publicly viewable active offers
router.get('/', getPublicOffers); // GET /api/offers

// User role access (private)
router.post('/apply', protect, applyDiscountCode); // POST /api/offers/apply
router.get('/loyalty', protect, getLoyaltyInfo); // GET /api/offers/loyalty

// Admin Only
router.post('/', protect, authorize('admin'), createOffer); // POST /api/offers
router.put('/:id', protect, authorize('admin'), updateOffer); // PUT /api/offers/:id
router.delete('/:id', protect, authorize('admin'), deleteOffer); // DELETE /api/offers/:id

module.exports = router;
