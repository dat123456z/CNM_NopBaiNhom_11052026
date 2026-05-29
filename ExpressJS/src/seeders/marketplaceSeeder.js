const User = require('../models/User');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const { Order, OrderItem } = require('../models/Order');
const { ProductReview } = require('../models/Review');
const Coupon = require('../models/Coupon');
const WalletTransaction = require('../models/WalletTransaction');
const bcrypt = require('bcrypt');

const seedMarketplaceIfEmpty = async () => {
    try {
        const hashedPassword = await bcrypt.hash("Password@123", 10);

        // Seed Manager if not exists
        const managerExists = await User.findOne({ where: { email: "manager_tester@example.com" } });
        if (!managerExists) {
            await User.create({
                name: "Manager Tester",
                email: "manager_tester@example.com",
                password: hashedPassword,
                role: "manager"
            });
            console.log(">>> Seeded Manager User.");
        }

        // Seed Pending Products for Moderation if Shop exists
        const existingShop = await Shop.findOne({ where: { name: "Elite Tech Store" } });
        if (existingShop) {
            const pendingCount = await Product.count({ where: { status: 'pending' } });
            if (pendingCount === 0) {
                await Product.create({
                    shopId: existingShop.id,
                    title: "Smart Watch S8",
                    slug: "smart-watch-s8-" + Date.now(),
                    description: "Đồng hồ thông minh thế hệ mới, hỗ trợ đo nhịp tim, nồng độ oxy trong máu, chống nước IP68.",
                    price: 1800000.00,
                    originalPrice: 2200000.00,
                    images: ["https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400"],
                    colors: [{ label: "Black", value: "#000000" }, { label: "Rose Gold", value: "#b76e79" }],
                    category: "Đồng hồ",
                    stock: 50,
                    status: 'pending'
                });
                await Product.create({
                    shopId: existingShop.id,
                    title: "Wireless Earbuds Air",
                    slug: "wireless-earbuds-air-" + Date.now(),
                    description: "Tai nghe bluetooth không dây kết nối Bluetooth 5.2 cực nhạy, âm thanh vòm sống động.",
                    price: 950000.00,
                    originalPrice: 1200000.00,
                    images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400"],
                    colors: [{ label: "White", value: "#ffffff" }],
                    category: "Phụ kiện",
                    stock: 100,
                    status: 'pending'
                });
                console.log(">>> Seeded Pending Products for Moderation.");
            }
        }

        const exists = await User.findOne({ where: { email: "vendor_tester@example.com" } });
        if (exists) {
            console.log(">>> Marketplace seeder already executed, skipping.");
            return;
        }

        console.log(">>> Running Marketplace Seeder...");

        // 1. Create Buyer
        const buyer = await User.create({
            name: "Nguyen Van Binh",
            email: "buyer_tester@example.com",
            password: hashedPassword,
            role: "user",
            points: 120,
            addresses: [{ id: 1, text: "789 Duong 3/2, Quan 10, TP. HCM", name: "Nguyen Van Binh", phone: "0911223344" }]
        });

        // 2. Create Vendor
        const vendor = await User.create({
            name: "Vendor Tester",
            email: "vendor_tester@example.com",
            password: hashedPassword,
            role: "vendor",
            points: 500
        });

        // 3. Create Shop
        const shop = await Shop.create({
            userId: vendor.id,
            name: "Elite Tech Store",
            slug: "elite-tech-store-" + Date.now(),
            description: "Cung cấp các sản phẩm công nghệ cao cấp chính hãng 100%.",
            logo: "https://images.unsplash.com/photo-1472851294608-062f824d296e?w=100",
            phone: "0909123456",
            email: "vendor_tester@example.com",
            address: "1 Vo Van Ngan, Thu Duc, TP. HCM",
            balance: 8500000.00,
            rating: 4.8,
            reviewCount: 1,
            status: "active",
            isVerified: true
        });

        // 4. Use an existing product if available; do not create products here.
        const primaryProduct = await Product.findOne({
            where: { shopId: shop.id, status: "active" }
        });

        if (!primaryProduct) {
            console.log(">>> No active product found for this shop, skipping product-dependent seed data.");
        }

        // 5. Create Payout Wallet Transactions
        await WalletTransaction.create({
            shopId: shop.id,
            amount: 15000000.00,
            type: "credit",
            balanceAfter: 15000000.00,
            note: "Doanh thu đơn hàng #1001"
        });

        await WalletTransaction.create({
            shopId: shop.id,
            amount: 6500000.00,
            type: "debit",
            balanceAfter: 8500000.00,
            note: "Yêu cầu rút tiền về ngân hàng VCB"
        });

        // 6. Create Completed Order for Buyer when we have a product to reference.
        if (primaryProduct) {
            const order = await Order.create({
                userId: buyer.id,
                shopId: shop.id,
                subtotal: Number(primaryProduct.price),
                tax: Math.round(Number(primaryProduct.price) * 0.08),
                total: Number(primaryProduct.price) + Math.round(Number(primaryProduct.price) * 0.08),
                paymentMethod: "cod",
                paymentStatus: "paid",
                status: "delivered",
                shippingName: "Nguyen Van Binh",
                shippingPhone: "0911223344",
                shippingAddress: "789 Duong 3/2, Quan 10, TP. HCM"
            });

            await OrderItem.create({
                orderId: order.id,
                productId: primaryProduct.id,
                quantity: 1,
                price: Number(primaryProduct.price),
                color: primaryProduct.colors?.[0]?.label || null,
                productTitle: primaryProduct.title,
                productImage: Array.isArray(primaryProduct.images) ? primaryProduct.images[0] : null
            });

            // 7. Add an initial product review
            await ProductReview.create({
                productId: primaryProduct.id,
                userId: buyer.id,
                orderId: order.id,
                rating: 5,
                comment: "Máy dùng mượt mà lắm, cấu hình cực mạnh, màn hình siêu đẹp. Shop tư vấn nhiệt tình, ship nhanh!",
                images: ["https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=100"],
                vendorReply: "Cảm ơn quý khách đã tin tưởng ủng hộ Elite Tech Store! Rất hân hạnh được phục vụ quý khách lần sau."
            });
        }

        // 8. Create Coupon
        await Coupon.create({
            shopId: shop.id,
            code: "ELITE20",
            type: "percent",
            value: 20,
            minOrderAmount: 2000000.00,
            maxDiscount: 500000.00,
            usageLimit: 100,
            usedCount: 5,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        });

        console.log(">>> Seeded Marketplace successfully!");
    } catch (err) {
        console.error(">>> Marketplace seed error:", err.message);
    }
};

module.exports = { seedMarketplaceIfEmpty };
