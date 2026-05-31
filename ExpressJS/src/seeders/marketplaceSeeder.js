const User = require('../models/User');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const { Order, OrderItem } = require('../models/Order');
const { ProductReview } = require('../models/Review');
const Coupon = require('../models/Coupon');
const WalletTransaction = require('../models/WalletTransaction');
const Shipper = require('../models/Shipper');

const seedMarketplaceIfEmpty = async () => {
    try {
        // Find our seeded users and shops
        const buyer = await User.findOne({ where: { email: "user@gmail.com" } });
        const vendor1 = await User.findOne({ where: { email: "vendor1@gmail.com" } });
        const vendor2 = await User.findOne({ where: { email: "vendor2@gmail.com" } });

        const uteShop = await Shop.findOne({ where: { userId: vendor1?.id } });
        const techStore = await Shop.findOne({ where: { userId: vendor2?.id } });

        if (!buyer || !uteShop || !techStore) {
            console.log(">>> Required users/shops not found, skipping marketplace seeder.");
            return;
        }

        // Check if marketplace seeder has already run by looking for one of the tech products
        const hasLaptop = await Product.findOne({ where: { title: "Ultra Laptop Pro 15" } });
        if (hasLaptop) {
            console.log(">>> Marketplace products already seeded, skipping.");
            return;
        }

        console.log(">>> Running Marketplace Seeder (Orders, Reviews, Tech Products)...");

        // Create Shippers for UTEShop
        const shipUte1 = await Shipper.create({
            shopId: uteShop.id,
            name: "Lê Văn Tình",
            phone: "0901234567",
            vehicle: "Xe tải 1.5 tấn",
            status: "active"
        });
        const shipUte2 = await Shipper.create({
            shopId: uteShop.id,
            name: "Nguyễn Văn Toàn",
            phone: "0912345678",
            vehicle: "Xe máy",
            status: "active"
        });

        // Create Shippers for TechStore
        const shipTech1 = await Shipper.create({
            shopId: techStore.id,
            name: "Trần Văn Hải",
            phone: "0923456789",
            vehicle: "Xe máy",
            status: "active"
        });
        const shipTech2 = await Shipper.create({
            shopId: techStore.id,
            name: "Phạm Văn Thanh",
            phone: "0934567890",
            vehicle: "Xe máy",
            status: "active"
        });

        // 1. Create Tech Products for TechStore
        const laptop = await Product.create({
            shopId: techStore.id,
            title: "Ultra Laptop Pro 15",
            slug: "ultra-laptop-pro-15-" + Date.now(),
            description: "Laptop cao cấp cấu hình khủng Core i7 thế hệ mới, RAM 16GB, SSD 512GB, màn hình Retina siêu sắc nét.",
            price: 24990000.00,
            originalPrice: 28000000.00,
            images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500"],
            colors: [{ label: "Silver", value: "#c0c0c0" }, { label: "Space Gray", value: "#5a5a5a" }],
            category: "Đồ điện tử & Công nghệ",
            stock: 15,
            status: 'active',
            rating: 5.0,
            reviewCount: 1,
            sold: 1
        });

        const headphone = await Product.create({
            shopId: techStore.id,
            title: "Premium ANC Headphone X1",
            slug: "premium-anc-headphone-x1-" + Date.now(),
            description: "Tai nghe chống ồn chủ động cao cấp, âm thanh Hi-Res Audio chân thực, pin trâu lên đến 40h sử dụng.",
            price: 4500000.00,
            originalPrice: 5500000.00,
            images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"],
            colors: [{ label: "Black", value: "#000000" }, { label: "White", value: "#ffffff" }],
            category: "Đồ điện tử & Công nghệ",
            stock: 30,
            status: 'active',
            rating: 0.0,
            reviewCount: 0,
            sold: 0
        });

        await Product.create({
            shopId: techStore.id,
            title: "Smart Watch S8",
            slug: "smart-watch-s8-" + Date.now(),
            description: "Đồng hồ thông minh thế hệ mới, hỗ trợ đo nhịp tim, nồng độ oxy trong máu, chống nước IP68.",
            price: 1800000.00,
            originalPrice: 2200000.00,
            images: ["https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500"],
            colors: [{ label: "Black", value: "#000000" }, { label: "Rose Gold", value: "#b76e79" }],
            category: "Đồ điện tử & Công nghệ",
            stock: 50,
            status: 'pending'
        });

        await Product.create({
            shopId: techStore.id,
            title: "Wireless Earbuds Air",
            slug: "wireless-earbuds-air-" + Date.now(),
            description: "Tai nghe bluetooth không dây kết nối Bluetooth 5.2 cực nhạy, âm thanh vòm sống động.",
            price: 950000.00,
            originalPrice: 1200000.00,
            images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500"],
            colors: [{ label: "White", value: "#ffffff" }],
            category: "Đồ điện tử & Công nghệ",
            stock: 100,
            status: 'pending'
        });

        // 2. Create Wallet Transactions for TechStore
        await WalletTransaction.create({
            shopId: techStore.id,
            amount: 15000000.00,
            type: "credit",
            balanceAfter: 15000000.00,
            note: "Doanh thu đơn hàng #1001"
        });

        await WalletTransaction.create({
            shopId: techStore.id,
            amount: 6500000.00,
            type: "debit",
            balanceAfter: 8500000.00,
            note: "Yêu cầu rút tiền về ngân hàng VCB"
        });

        // Do not seed sample orders for vendors as requested

        console.log(">>> Seeded Marketplace successfully!");
    } catch (err) {
        console.error(">>> Marketplace seed error:", err.message);
    }
};

module.exports = { seedMarketplaceIfEmpty };
