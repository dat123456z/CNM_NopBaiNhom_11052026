const reviewService = require('../services/reviewService');

const createProductReview = async (req, res) => {
    try {
        const review = await reviewService.createProductReview(req.user.id, req.body);
        return res.status(201).json(review);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const createShopReview = async (req, res) => {
    try {
        const review = await reviewService.createShopReview(req.user.id, req.body);
        return res.status(201).json(review);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const createOrderReview = async (req, res) => {
    try {
        const review = await reviewService.createOrderReview(req.user.id, req.body);
        return res.status(201).json(review);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const getProductReviews = async (req, res) => {
    try {
        const result = await reviewService.getProductReviews(req.params.productId, req.query);
        return res.json(result);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const getShopReviews = async (req, res) => {
    try {
        const result = await reviewService.getShopProductReviews(req.shop.id, req.query);
        return res.json(result);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const vendorReplyReview = async (req, res) => {
    try {
        const review = await reviewService.vendorReplyReview(req.user.id, req.params.id, req.body.reply);
        return res.json(review);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const setReviewVisibility = async (req, res) => {
    try {
        const review = await reviewService.setReviewVisibility(req.params.type, req.params.id, req.body.isHidden);
        return res.json(review);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

module.exports = { createProductReview, createShopReview, createOrderReview, getProductReviews, getShopReviews, vendorReplyReview, setReviewVisibility };