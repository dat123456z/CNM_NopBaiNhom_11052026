require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { connection, sequelize } = require('./config/database');
const { seedIfEmpty } = require('./seeders/productSeeder');
const { seedCouponsIfEmpty } = require('./seeders/couponSeeder');

const app = express();

app.use(cors());
app.use(express.json());

const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

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

const PORT = process.env.PORT || 3000;

const start = async () => {
    try {
        await connection();
        await sequelize.sync({ alter: true });
        await seedIfEmpty();
        await seedCouponsIfEmpty();

        const server = app.listen(PORT, () => {
            console.log(` Server running on port ${PORT}`);
        });

        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`\n Port ${PORT} đang bị chiếm bởi process khác.`);
                console.error(` Chạy lệnh sau để giải phóng port:\n`);
                console.error(`   PowerShell: Get-Process -Name node | Stop-Process -Force`);
                console.error(`   Hoặc: netstat -ano | findstr :${PORT}  →  taskkill /PID <PID> /F\n`);
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
