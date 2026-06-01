const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');
const socketManager = require('../socketManager');

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT) || 587,
    secure: false,
    auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
});

const sendEmail = async (to, subject, html) => {
    if (!process.env.MAIL_USER) return;
    try {
        await transporter.sendMail({ from: `"UTEShop" <${process.env.MAIL_USER}>`, to, subject, html });
    } catch (err) {
        console.error('[Notification] Email error:', err.message);
    }
};

const statusLabels = {
    confirmed:        'Đã xác nhận',
    preparing:        'Đang chuẩn bị hàng',
    shipping:         'Đang giao hàng',
    delivered:        'Đã giao thành công',
    cancelled:        'Đã hủy',
    cancel_requested: 'Yêu cầu hủy đang được xử lý'
};

const notify = async ({ userId, type, title, message, orderId = null, email = null }) => {
    const notification = await Notification.create({ userId, type, title, message, orderId });

    socketManager.emitToUser(userId, 'notification', {
        id:        notification.id,
        type,
        title,
        message,
        orderId,
        isRead:    false,
        createdAt: notification.createdAt
    });

    if (email?.to && email?.subject && email?.html) {
        await sendEmail(email.to, email.subject, email.html);
    }

    return notification;
};

const baseHtml = (content) => `
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><style>
  body { font-family: Arial, sans-serif; color: #333; background: #f8f9fb; margin: 0; padding: 0; }
  .wrap { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
  .header { background: #00b14f; padding: 24px 32px; }
  .header h1 { color: #fff; margin: 0; font-size: 22px; }
  .body { padding: 28px 32px; line-height: 1.6; }
  .btn { display: inline-block; margin-top: 16px; padding: 10px 24px; background: #00b14f; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; }
  .footer { padding: 16px 32px; background: #f0f4f8; color: #888; font-size: 12px; }
</style></head>
<body>
  <div class="wrap">
    <div class="header"><h1>UTEShop</h1></div>
    <div class="body">${content}</div>
    <div class="footer">Bạn nhận được email này từ UTEShop. Vui lòng không trả lời email này.</div>
  </div>
</body></html>`;

const notifyNewOrder = async ({ order, shopOwner, items }) => {
    const itemLines = items.map(i => `<li><strong>${i.productTitle}</strong> × ${i.quantity}</li>`).join('');
    const title   = '🛒 Đơn hàng mới';
    const message = `Bạn có đơn hàng mới #${order.id} trị giá ${Number(order.total).toLocaleString('vi-VN')}đ.`;

    await notify({
        userId:  shopOwner.id,
        type:    'order_new',
        title,
        message,
        orderId: order.id,
        email: {
            to:      shopOwner.email,
            subject: `[UTEShop] Đơn hàng mới #${order.id}`,
            html:    baseHtml(`
                <h2 style="color:#00b14f">Bạn có đơn hàng mới!</h2>
                <p><strong>Mã đơn:</strong> #${order.id}</p>
                <p><strong>Sản phẩm:</strong></p>
                <ul>${itemLines}</ul>
                <p><strong>Tổng tiền:</strong> ${Number(order.total).toLocaleString('vi-VN')}đ</p>
                <p><strong>Thanh toán:</strong> ${order.paymentMethod?.toUpperCase() || 'COD'}</p>
                <p>Vui lòng vào trang quản lý để xác nhận đơn hàng.</p>
                <a class="btn" href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/vendor/dashboard/orders">Xem đơn hàng</a>
            `)
        }
    });
};

const notifyOrderStatusChanged = async ({ order, user, newStatus }) => {
    const label   = statusLabels[newStatus] || newStatus;
    const title   = `📦 Đơn hàng #${order.id}: ${label}`;
    const message = `Đơn hàng #${order.id} của bạn đã chuyển sang trạng thái: ${label}.`;

    const extraMap = {
        delivered: '<p>🎉 Cảm ơn bạn đã mua hàng! Hãy để lại đánh giá để giúp chúng tôi cải thiện dịch vụ.</p>',
        cancelled: '<p>Đơn hàng đã bị hủy. Nếu bạn đã thanh toán trước, tiền sẽ được hoàn trong 3-5 ngày làm việc.</p>',
        shipping:  '<p>🚚 Đơn hàng đang trên đường đến với bạn. Vui lòng chú ý điện thoại để nhận hàng.</p>'
    };

    await notify({
        userId:  user.id,
        type:    `order_${newStatus}`,
        title,
        message,
        orderId: order.id,
        email: {
            to:      user.email,
            subject: `[UTEShop] ${title}`,
            html:    baseHtml(`
                <h2>${title}</h2>
                <p>Xin chào <strong>${user.name}</strong>,</p>
                <p>${message}</p>
                ${extraMap[newStatus] || ''}
                <a class="btn" href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders/${order.id}">Xem chi tiết</a>
            `)
        }
    });
};

const notifyCancelRequest = async ({ order, shopOwner, user }) => {
    const title   = `⚠️ Yêu cầu hủy đơn #${order.id}`;
    const message = `Khách hàng ${user.name} đã yêu cầu hủy đơn hàng #${order.id}.`;

    await notify({
        userId:  shopOwner.id,
        type:    'order_cancel_requested',
        title,
        message,
        orderId: order.id,
        email: {
            to:      shopOwner.email,
            subject: `[UTEShop] ${title}`,
            html:    baseHtml(`
                <h2 style="color:#f59e0b">⚠️ Yêu cầu hủy đơn hàng</h2>
                <p>Khách hàng <strong>${user.name}</strong> yêu cầu hủy đơn <strong>#${order.id}</strong>.</p>
                <p><strong>Lý do:</strong> ${order.cancelReason || 'Không có lý do'}</p>
                <a class="btn" href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/vendor/dashboard/orders">Xử lý ngay</a>
            `)
        }
    });
};

const notifyNewReview = async ({ review, shopOwner, productTitle }) => {
    const stars   = '⭐'.repeat(review.rating);
    const title   = `${stars} Đánh giá mới: "${productTitle}"`;
    const message = `Sản phẩm "${productTitle}" nhận được đánh giá ${review.rating}⭐.`;

    await notify({
        userId: shopOwner.id,
        type:   'review_new',
        title,
        message,
        email: {
            to:      shopOwner.email,
            subject: `[UTEShop] Đánh giá mới cho "${productTitle}"`,
            html:    baseHtml(`
                <h2>Đánh giá mới</h2>
                <p>Sản phẩm <strong>${productTitle}</strong> vừa nhận đánh giá <strong>${review.rating}⭐</strong>.</p>
                <p><strong>Nội dung:</strong> ${review.comment || '(Không có nhận xét)'}</p>
                <a class="btn" href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/vendor/dashboard/reviews">Xem & phản hồi</a>
            `)
        }
    });
};

const getNotifications = async (userId, { page = 1, limit = 20 } = {}) => {
    const offset = (page - 1) * limit;
    const { count, rows } = await Notification.findAndCountAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit:  Number(limit),
        offset
    });
    const unreadCount = await Notification.count({ where: { userId, isRead: false } });
    return { total: count, unreadCount, page: Number(page), limit: Number(limit), notifications: rows };
};

const markAsRead = async (userId, notificationId) => {
    const where = { userId };
    if (notificationId) where.id = notificationId;
    const [affected] = await Notification.update({ isRead: true }, { where });
    return affected;
};

module.exports = {
    notify,
    notifyNewOrder,
    notifyOrderStatusChanged,
    notifyCancelRequest,
    notifyNewReview,
    getNotifications,
    markAsRead
};