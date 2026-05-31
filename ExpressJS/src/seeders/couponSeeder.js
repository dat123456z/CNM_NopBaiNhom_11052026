const Coupon = require('../models/Coupon');
const Shop = require('../models/Shop');

const seedCouponsIfEmpty = async () => {
    try {
        const count = await Coupon.count();
        if (count > 0) {
            console.log(`>>> Coupons đã tồn tại (${count}), bỏ qua seeding.`);
            return;
        }

        const uteShop = await Shop.findOne({ where: { slug: 'uteshop' } });
        const techStore = await Shop.findOne({ where: { slug: 'techstore' } });

        const now = new Date();
        const future = new Date('2030-01-01');

        const testCoupons = [];

        if (uteShop) {
            testCoupons.push({
                shopId: uteShop.id,
                userId: null,
                code: 'HE2026',
                type: 'percent',
                value: 10.00,
                minOrderAmount: 100000.00,
                maxDiscount: 50000.00,
                usageLimit: 100,
                usedCount: 0,
                startsAt: now,
                expiresAt: future,
                isActive: true
            });
            testCoupons.push({
                shopId: uteShop.id,
                userId: null,
                code: 'GIAM30K',
                type: 'fixed',
                value: 30000.00,
                minOrderAmount: 150000.00,
                maxDiscount: 30000.00,
                usageLimit: 100,
                usedCount: 0,
                startsAt: now,
                expiresAt: future,
                isActive: true
            });
            testCoupons.push({
                shopId: uteShop.id,
                userId: null,
                code: 'SIEUDEAL',
                type: 'percent',
                value: 50.00,
                minOrderAmount: 200000.00,
                maxDiscount: 100000.00,
                usageLimit: 100,
                usedCount: 0,
                startsAt: now,
                expiresAt: future,
                isActive: true
            });
        }

        if (techStore) {
            testCoupons.push({
                shopId: techStore.id,
                userId: null,
                code: 'TECH50',
                type: 'percent',
                value: 50.00,
                minOrderAmount: 500000.00,
                maxDiscount: 200000.00,
                usageLimit: 50,
                usedCount: 0,
                startsAt: now,
                expiresAt: future,
                isActive: true
            });
            testCoupons.push({
                shopId: techStore.id,
                userId: null,
                code: 'ELITE20',
                type: 'percent',
                value: 20.00,
                minOrderAmount: 2000000.00,
                maxDiscount: 500000.00,
                usageLimit: 100,
                usedCount: 5,
                startsAt: now,
                expiresAt: future,
                isActive: true
            });
        }

        if (testCoupons.length > 0) {
            await Coupon.bulkCreate(testCoupons);
            console.log(`>>> Seed thành công ${testCoupons.length} coupons`);
        }
    } catch (err) {
        console.error('>>> Coupon seed error:', err.message);
    }
};

module.exports = { seedCouponsIfEmpty };
