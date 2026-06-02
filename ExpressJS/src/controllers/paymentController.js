const orderService = require('../services/orderService');
const vnpayService = require('../services/vnpayService');

const getClientIp = (req) =>
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.socket?.remoteAddress ||
    req.ip ||
    '127.0.0.1';

const createVNPayPayment = async (req, res) => {
    try {
        const orders = await orderService.createOrder(req.user.id, {
            ...req.body,
            paymentMethod: 'vnpay'
        });
        const result = vnpayService.createPaymentUrl({
            orders,
            ipAddr: getClientIp(req)
        });
        return res.status(201).json({
            paymentUrl: result.paymentUrl,
            txnRef: result.txnRef,
            orderIds: orders.map((order) => order.id)
        });
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const handleVNPayReturn = async (req, res) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    try {
        const verified = vnpayService.verifyReturn(req.query);
        const orderIds = vnpayService.getOrderIdsFromTxnRef(verified.txnRef);

        if (!verified.isValid) {
            return res.redirect(`${frontendUrl}/payment-result?status=invalid&provider=vnpay`);
        }

        if (verified.isSuccess) {
            await orderService.activatePaidOrders(orderIds);
            return res.redirect(`${frontendUrl}/payment-result?status=success&provider=vnpay&orders=${orderIds.join(',')}`);
        }

        await orderService.cancelUnpaidPaymentOrders(orderIds, `VNPay response code: ${verified.responseCode || 'unknown'}`);
        return res.redirect(`${frontendUrl}/payment-result?status=failed&provider=vnpay&code=${verified.responseCode || ''}`);
    } catch (err) {
        return res.redirect(`${frontendUrl}/payment-result?status=error&provider=vnpay`);
    }
};

module.exports = { createVNPayPayment, handleVNPayReturn };
