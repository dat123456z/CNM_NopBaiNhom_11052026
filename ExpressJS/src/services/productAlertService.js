const { Op } = require('sequelize');
const ProductAlert = require('../models/ProductAlert');
const Product = require('../models/Product');
const notificationService = require('./notificationService');

const getAlert = async (userId, productId) => {
    const alert = await ProductAlert.findOne({ where: { userId, productId } });
    return {
        priceDrop: Boolean(alert?.priceDrop),
        backInStock: Boolean(alert?.backInStock)
    };
};

const updateAlert = async (userId, productId, settings = {}) => {
    const product = await Product.findByPk(productId);
    if (!product || product.status === 'deleted') {
        throw Object.assign(new Error('Sản phẩm không tồn tại.'), { status: 404 });
    }

    const priceDrop = settings.priceDrop === true;
    // "Có hàng trở lại" chỉ có ý nghĩa khi sản phẩm đang hết hàng.
    const backInStock = settings.backInStock === true && Number(product.stock) === 0;
    let alert = await ProductAlert.findOne({ where: { userId, productId } });

    if (!priceDrop && !backInStock) {
        if (alert) await alert.destroy();
        return { priceDrop: false, backInStock: false };
    }

    if (!alert) {
        alert = await ProductAlert.create({
            userId,
            productId,
            priceDrop,
            backInStock,
            referencePrice: product.price,
            wasOutOfStock: Number(product.stock) <= 0
        });
    } else {
        const updates = { priceDrop, backInStock };

        if (priceDrop && !alert.priceDrop) {
            updates.referencePrice = product.price;
            updates.lastNotifiedPrice = null;
        }
        if (backInStock && !alert.backInStock) {
            updates.wasOutOfStock = true;
        }

        await alert.update(updates);
    }

    return {
        priceDrop: Boolean(alert.priceDrop),
        backInStock: Boolean(alert.backInStock)
    };
};

const processProductAlerts = async (product) => {
    const alerts = await ProductAlert.findAll({
        where: {
            productId: product.id,
            [Op.or]: [{ priceDrop: true }, { backInStock: true }]
        }
    });

    const currentPrice = Number(product.price);
    const inStock = Number(product.stock) > 0;

    for (const alert of alerts) {
        const updates = {};
        const referencePrice = Number(alert.referencePrice);
        const lastNotifiedPrice = alert.lastNotifiedPrice == null
            ? null
            : Number(alert.lastNotifiedPrice);

        if (
            alert.priceDrop &&
            currentPrice < referencePrice &&
            (lastNotifiedPrice == null || currentPrice < lastNotifiedPrice)
        ) {
            await notificationService.notify({
                userId: alert.userId,
                productId: product.id,
                type: 'price_drop',
                title: 'Sản phẩm bạn theo dõi vừa giảm giá',
                message: `"${product.title}" hiện chỉ còn ${currentPrice.toLocaleString('vi-VN')}đ.`
            });
            updates.lastNotifiedPrice = currentPrice;
        }

        if (alert.backInStock && inStock) {
            if (alert.wasOutOfStock) {
                await notificationService.notify({
                    userId: alert.userId,
                    productId: product.id,
                    type: 'back_in_stock',
                    title: 'Sản phẩm đã có hàng trở lại',
                    message: `"${product.title}" đã có hàng. Đặt mua trước khi hết nhé!`
                });
            }
            // Đây là thông báo một lần; có hàng xong thì tự tắt theo dõi.
            updates.backInStock = false;
            updates.wasOutOfStock = false;
        }

        if (Object.keys(updates).length) {
            if (updates.backInStock === false && !alert.priceDrop) {
                await alert.destroy();
            } else {
                await alert.update(updates);
            }
        }
    }
};

const processProductAlertsByIds = async (productIds = []) => {
    const ids = [...new Set(productIds.map(Number).filter(Boolean))];
    if (!ids.length) return;

    const products = await Product.findAll({
        where: { id: { [Op.in]: ids }, status: 'active' }
    });
    for (const product of products) {
        await processProductAlerts(product);
    }
};

module.exports = {
    getAlert,
    updateAlert,
    processProductAlerts,
    processProductAlertsByIds
};
