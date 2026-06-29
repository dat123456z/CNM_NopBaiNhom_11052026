# UTEShop - Fullstack E-commerce

UTEShop là ứng dụng thương mại điện tử fullstack gồm frontend ReactJS và backend ExpressJS. Hệ thống hỗ trợ mua sắm, giỏ hàng, đặt hàng, thanh toán VNPay sandbox, quản lý gian hàng, duyệt sản phẩm, quản trị người dùng, thông báo realtime và chatbot AI.

## Công nghệ sử dụng

### Frontend

- React 19
- Vite
- React Router DOM
- Tailwind CSS
- Socket.IO Client

### Backend

- Node.js
- ExpressJS
- MySQL
- Sequelize ORM
- JWT Authentication
- Socket.IO
- Nodemailer
- Multer
- VNPay Sandbox
- Gemini API

## Cấu trúc thư mục

```text
ProjectFinal/
├── ExpressJS/             # Backend API
│   ├── src/
│   │   ├── config/        # Cấu hình database
│   │   ├── controllers/   # Xử lý request
│   │   ├── middleware/    # Middleware xác thực
│   │   ├── models/        # Sequelize models
│   │   ├── routes/        # API routes
│   │   ├── seeders/       # Dữ liệu mẫu
│   │   ├── services/      # Business logic
│   │   └── server.js      # Entry point backend
│   ├── docker-compose.yml # MySQL Docker service
│   └── package.json
├── ReactJS_Frontend/      # Frontend React
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── routes/
│   └── package.json
└── start-ngrok-backend.bat
```

## Chức năng chính

- Đăng ký, đăng nhập, quên mật khẩu và xác thực JWT.
- Trang người dùng: xem sản phẩm, tìm kiếm/lọc, chi tiết sản phẩm, wishlist, giỏ hàng, checkout, theo dõi đơn hàng.
- Thanh toán COD và VNPay sandbox.
- Trang vendor: thiết lập gian hàng, quản lý sản phẩm, đơn hàng, khuyến mãi, shipper, doanh thu, đánh giá.
- Trang manager: duyệt vendor và duyệt sản phẩm chờ phê duyệt.
- Trang admin: quản lý người dùng, vai trò, vendor, sản phẩm, đơn hàng và doanh thu.
- Thông báo realtime bằng Socket.IO.
- Gửi email thông báo bằng Nodemailer.
- Chatbot AI tư vấn sản phẩm bằng Gemini API.
- Seeder tự tạo tài khoản, shop, sản phẩm, coupon và dữ liệu mẫu khi database trống.

## Yêu cầu môi trường

- Node.js 18 trở lên
- npm
- MySQL 8.0 hoặc Docker
- Tài khoản VNPay sandbox nếu muốn test thanh toán VNPay
- Gemini API key nếu muốn dùng chatbot AI

## Cài đặt

Clone project và cài dependency cho từng phần:

```bash
cd ExpressJS
npm install
```

```bash
cd ../ReactJS_Frontend
npm install
```

## Cấu hình database

Cách nhanh nhất là chạy MySQL bằng Docker trong thư mục backend:

```bash
cd ExpressJS
docker compose up -d
```

Docker compose hiện tạo database:

- Host: `localhost`
- Port: `3306`
- Database: `uteshop_db`
- User: `root`
- Password: `123456`

## Cấu hình biến môi trường

Tạo file `ExpressJS/.env`:

```env
PORT=3000
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_NAME=uteshop_db
DB_USER=root
DB_PASSWORD=123456

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password

API_TYPE=gemini
GEMINI_API_KEY=your_gemini_api_key
GEMINI_VISION_MODEL=gemini-2.5-flash

VNPAY_TMN_CODE=your_vnpay_tmn_code
VNPAY_HASH_SECRET=your_vnpay_hash_secret
VNPAY_PAYMENT_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/api/payments/vnpay/return
VNPAY_BANK_CODE=NCB
```

Tạo file `ReactJS_Frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
VITE_API_BASE=http://localhost:3000
```

Ghi chú:

- Email, Gemini và VNPay là cấu hình tùy chọn theo tính năng. Nếu thiếu, các chức năng tương ứng có thể không hoạt động.
- Khi dùng ngrok cho VNPay callback, cập nhật `FRONTEND_URL`, `VNPAY_RETURN_URL` và `VITE_API_URL` theo URL public.

## Chạy dự án

Chạy backend:

```bash
cd ExpressJS
npm run dev
```

Backend mặc định chạy tại:

```text
http://localhost:3000
```

Chạy frontend ở terminal khác:

```bash
cd ReactJS_Frontend
npm run dev
```

Frontend mặc định chạy tại:

```text
http://localhost:5173
```

## Tài khoản mẫu

Khi backend khởi động, seeder sẽ tự tạo dữ liệu mẫu nếu database còn trống.

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Admin | `admin@gmail.com` | `123456` |
| Manager | `manager@gmail.com` | `123456` |
| Vendor 1 | `vendor1@gmail.com` | `123456` |
| Vendor 2 | `vendor2@gmail.com` | `123456` |
| User | `user@gmail.com` | `123456` |

## API chính

Backend expose các nhóm API dưới prefix:

- `POST /api/auth/*` - đăng ký, đăng nhập, quên mật khẩu
- `/api/users` - quản lý người dùng
- `/api/products` - sản phẩm
- `/api/orders` - đơn hàng
- `/api/carts` - giỏ hàng
- `/api/reviews` - đánh giá
- `/api/shops` - gian hàng
- `/api/wishlists` - wishlist
- `/api/revenues` - doanh thu
- `/api/coupons` - mã giảm giá
- `/api/shippers` - shipper
- `/api/notifications` - thông báo
- `/api/product-alerts` - cảnh báo sản phẩm
- `/api/payments/vnpay/*` - thanh toán VNPay
- `/api/ai` - chatbot AI

## Lệnh hữu ích

Backend:

```bash
npm run dev
npm start
```

Frontend:

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Luồng chạy đề xuất

1. Khởi động MySQL bằng Docker hoặc MySQL local.
2. Tạo file `.env` cho backend và frontend.
3. Chạy backend bằng `npm run dev`.
4. Chạy frontend bằng `npm run dev`.
5. Đăng nhập bằng tài khoản mẫu để kiểm thử các vai trò.

## Ghi chú phát triển

- Backend dùng `sequelize.sync()` để đồng bộ model với MySQL khi khởi động.
- Dữ liệu mẫu được seed tự động từ thư mục `ExpressJS/src/seeders`.
- Ảnh upload được phục vụ qua endpoint `/uploads`.
- Socket.IO dùng token JWT để định danh user khi kết nối realtime.
- File `start-ngrok-backend.bat` có thể dùng để mở tunnel cho backend nếu đã cấu hình đúng đường dẫn ngrok.
