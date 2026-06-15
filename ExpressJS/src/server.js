require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { connection, sequelize } = require('./config/database');
const { seedIfEmpty } = require('./seeders/productSeeder');
const { seedCouponsIfEmpty } = require('./seeders/couponSeeder');
const { seedMarketplaceIfEmpty } = require('./seeders/marketplaceSeeder');
const socketManager = require('./socketManager');

const app = express();
const server = http.createServer(app);

socketManager.init(server);

app.use(cors());
app.use(express.json());

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use('/uploads', express.static(uploadsDir));

require('./models/User');
require('./models/Verification');
require('./models/Product');
require('./models/Shop');
require('./models/CartItem');
require('./models/Order');
require('./models/Review');
require('./models/Wishlist');
require('./models/Coupon');
require('./models/WalletTransaction');
require('./models/Shipper');
require('./models/Notification');
require('./models/association');

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/user'));
app.use('/api/products', require('./routes/product'));
app.use('/api/orders', require('./routes/order'));
app.use('/api/carts', require('./routes/cart'));
app.use('/api/reviews', require('./routes/review'));
app.use('/api/shops', require('./routes/shop'));
app.use('/api/wishlists', require('./routes/wishlist'));
app.use('/api/revenues', require('./routes/revenue'));
app.use('/api/coupons', require('./routes/coupon'));
app.use('/api/shippers', require('./routes/shipper'));
app.use('/api/notifications', require('./routes/notification'));
app.use('/api/payments', require('./routes/payment'));

app.use((err, req, res, next) => {
    const multer = require('multer');
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'Kích thước file quá lớn. Giới hạn tối đa là 2MB.' });
        }
        return res.status(400).json({ message: `Lỗi tải lên: ${err.message}` });
    }
    return res.status(err.status || 500).json({ message: err.message || 'Lỗi hệ thống.' });
});

const PORT = process.env.PORT || 3000;

const start = async () => {
    try {
        await connection();
        await sequelize.sync();

        try {
            await sequelize.query("ALTER TABLE products MODIFY COLUMN status ENUM('active', 'draft', 'hidden', 'deleted', 'pending', 'rejected') NOT NULL DEFAULT 'pending';");
        } catch (e) {
            console.error('>>> Error altering products status ENUM:', e.message);
        }

        try {
            await sequelize.query("ALTER TABLE products ADD COLUMN rejectionReason TEXT NULL;");
        } catch (e) {
            if (!String(e.message).includes('Duplicate column')) {
                console.error('>>> Error adding products rejectionReason:', e.message);
            }
        }

        try {
            await sequelize.query("ALTER TABLE notifications MODIFY COLUMN type ENUM('order_new', 'order_confirmed', 'order_preparing', 'order_shipping', 'order_delivered', 'order_cancelled', 'order_cancel_requested', 'review_new', 'review_reply', 'manager_product_pending', 'manager_product_updated_pending', 'manager_vendor_new', 'product_rejected', 'system') NOT NULL;");
        } catch (e) {
            console.error('>>> Error altering notifications type ENUM:', e.message);
        }

        await seedIfEmpty();
        await seedCouponsIfEmpty();
        await seedMarketplaceIfEmpty();

        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`\nPort ${PORT} đang bị chiếm bởi process khác.`);
                process.exit(1);
            } else {
                console.error('Server error:', err);
                process.exit(1);
            }
        });
    } catch (err) {
        console.error('Server start error:', err);
        process.exit(1);
    }
};

start();
