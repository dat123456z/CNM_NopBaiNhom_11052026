const express = require('express');

const router = express.Router();
const { authMiddleware, vendorMiddleware } = require('../middleware/auth');

const {
    createProductReview,
    createShopReview,
    createOrderReview,
    getProductReviews,
    getShopReviews,
    vendorReplyReview,
    setReviewVisibility
} = require('../controllers/reviewController');

router.post('/product', authMiddleware, createProductReview);
router.post('/shop', authMiddleware, createShopReview);
router.post('/order', authMiddleware, createOrderReview);
router.get('/product/:productId', getProductReviews);
router.get('/shop', authMiddleware, vendorMiddleware, getShopReviews);
router.patch('/:id/reply', authMiddleware, vendorMiddleware, vendorReplyReview);

router.patch(
    '/:type/:id/visibility',
    authMiddleware,
    setReviewVisibility
);

module.exports = router;