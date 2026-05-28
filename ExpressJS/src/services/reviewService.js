const { ProductReview, ShopReview, OrderReview } = require('../models/Review');
const { Order, OrderItem } = require('../models/Order');
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const User = require('../models/User');
const { sequelize } = require('../config/database');

const verifyPurchased = async (userId, productId, orderId) => {
    const order = await Order.findOne({ where: { id: orderId, userId, status: 'delivered' } });
    if (!order) throw Object.assign(new Error('Bạn chưa mua sản phẩm này.'), { status: 403 });
    const item = await OrderItem.findOne({ where: { orderId, productId } });
    if (!item) throw Object.assign(new Error('Sản phẩm không thuộc đơn hàng này.'), { status: 400 });
};

const recalcProductRating = async (productId) => {
    const [result] = await sequelize.query(
        'SELECT AVG(rating) as avg, COUNT(*) as cnt FROM product_reviews WHERE productId = :productId AND isHidden = 0',
        { replacements: { productId }, type: sequelize.QueryTypes.SELECT }
    );
    await Product.update(
        { rating: Number(result.avg || 0).toFixed(2), reviewCount: Number(result.cnt) },
        { where: { id: productId } }
    );
};

const recalcShopRating = async (shopId) => {
    const [result] = await sequelize.query(
        'SELECT AVG(rating) as avg, COUNT(*) as cnt FROM shop_reviews WHERE shopId = :shopId AND isHidden = 0',
        { replacements: { shopId }, type: sequelize.QueryTypes.SELECT }
    );
    await Shop.update(
        { rating: Number(result.avg || 0).toFixed(2), reviewCount: Number(result.cnt) },
        { where: { id: shopId } }
    );
};

const createProductReview = async (userId, { productId, orderId, rating, comment, images }) => {
    await verifyPurchased(userId, productId, orderId);

    const existing = await ProductReview.findOne({ where: { userId, productId, orderId } });
    if (existing) throw Object.assign(new Error('Bạn đã đánh giá sản phẩm này.'), { status: 409 });

    const product = await Product.findByPk(productId);
    if (!product) throw Object.assign(new Error('Sản phẩm không tồn tại.'), { status: 404 });

    const review = await ProductReview.create({
        userId, productId, orderId, rating, comment, images: images || []
    });
    await recalcProductRating(productId);

    // Tặng điểm tích lũy (+10 điểm)
    const user = await User.findByPk(userId);
    if (user) {
        await user.increment('points', { by: 10 });
    }

    // Tạo mã giảm giá 10% cho shop này, chỉ dùng 1 lần cho user này
    const couponService = require('./couponService');
    const couponCode = await couponService.createReviewRewardCoupon(userId, product.shopId);

    const plainReview = review.get({ plain: true });
    plainReview.rewardPoints = 10;
    plainReview.rewardCouponCode = couponCode;

    return plainReview;
};

const createShopReview = async (userId, { shopId, orderId, rating, comment }) => {
    const order = await Order.findOne({ where: { id: orderId, userId, shopId, status: 'delivered' } });
    if (!order) throw Object.assign(new Error('Bạn chưa có đơn hàng hoàn thành từ shop này.'), { status: 403 });

    const existing = await ShopReview.findOne({ where: { userId, shopId, orderId } });
    if (existing) throw Object.assign(new Error('Bạn đã đánh giá shop này.'), { status: 409 });

    const review = await ShopReview.create({ userId, shopId, orderId, rating, comment });
    await recalcShopRating(shopId);
    return review;
};

const createOrderReview = async (userId, { orderId, rating, comment }) => {
    const order = await Order.findOne({ where: { id: orderId, userId, status: 'delivered' } });
    if (!order) throw Object.assign(new Error('Đơn hàng chưa hoàn thành.'), { status: 403 });

    const existing = await OrderReview.findOne({ where: { orderId } });
    if (existing) throw Object.assign(new Error('Bạn đã đánh giá đơn hàng này.'), { status: 409 });

    return OrderReview.create({ userId, orderId, rating, comment });
};

const getProductReviews = async (productId, { page = 1, limit = 10 }) => {
    const offset = (page - 1) * limit;
    const { count, rows } = await ProductReview.findAndCountAll({
        where: { productId, isHidden: false },
        include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'avatar']
        }],
        order: [['createdAt', 'DESC']],
        limit: Number(limit),
        offset
    });
    return { total: count, page: Number(page), limit: Number(limit), reviews: rows };
};

const getShopProductReviews = async (shopId, { page = 1, limit = 20 }) => {
    const offset = (page - 1) * limit;
    const { count, rows } = await ProductReview.findAndCountAll({
        include: [
            {
                model: Product,
                as: 'product',
                where: { shopId },
                attributes: ['id', 'title', 'images']
            },
            {
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'avatar']
            }
        ],
        order: [['createdAt', 'DESC']],
        limit: Number(limit),
        offset
    });
    return { total: count, page: Number(page), limit: Number(limit), reviews: rows };
};

const vendorReplyReview = async (vendorUserId, reviewId, reply) => {
    const review = await ProductReview.findByPk(reviewId, {
        include: [{ model: Product, as: 'product', attributes: ['shopId'] }]
    });
    if (!review) throw Object.assign(new Error('Đánh giá không tồn tại.'), { status: 404 });

    const shop = await Shop.findOne({ where: { userId: vendorUserId, id: review.product.shopId } });
    if (!shop) throw Object.assign(new Error('Không có quyền phản hồi.'), { status: 403 });

    await review.update({ vendorReply: reply });
    return review;
};

const setReviewVisibility = async (type, reviewId, isHidden) => {
    const modelMap = { product: ProductReview, shop: ShopReview };
    const Model = modelMap[type];
    if (!Model) throw Object.assign(new Error('Loại review không hợp lệ.'), { status: 400 });
    const review = await Model.findByPk(reviewId);
    if (!review) throw Object.assign(new Error('Đánh giá không tồn tại.'), { status: 404 });
    await review.update({ isHidden });

    if (type === 'product') await recalcProductRating(review.productId);
    if (type === 'shop') await recalcShopRating(review.shopId);

    return review;
};

module.exports = {
    createProductReview, createShopReview, createOrderReview,
    getProductReviews, getShopProductReviews, vendorReplyReview, setReviewVisibility
};