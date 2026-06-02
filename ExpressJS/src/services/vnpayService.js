const crypto = require('crypto');
const { Order } = require('../models/Order');

const VNPAY_VERSION = '2.1.0';
const VNPAY_COMMAND = 'pay';
const VNPAY_ORDER_TYPE = 'other';
const DEFAULT_SANDBOX_URL = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';

const formatDate = (date) => {
    const pad = (n) => String(n).padStart(2, '0');
    const vnDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    return [
        vnDate.getUTCFullYear(),
        pad(vnDate.getUTCMonth() + 1),
        pad(vnDate.getUTCDate()),
        pad(vnDate.getUTCHours()),
        pad(vnDate.getUTCMinutes()),
        pad(vnDate.getUTCSeconds())
    ].join('');
};

const encodeVNPayValue = (value) =>
    encodeURIComponent(String(value))
        .replace(/%20/g, '+')
        .replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);

const sortObject = (obj) => {
    const sorted = {};
    Object.keys(obj).sort().forEach((key) => {
        if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
            sorted[key] = obj[key];
        }
    });
    return sorted;
};

const toQueryString = (params) =>
    Object.keys(params)
        .map((key) => `${encodeVNPayValue(key)}=${encodeVNPayValue(params[key])}`)
        .join('&');

const buildSignedQuery = (params, secret) => {
    const sorted = sortObject(params);
    const signData = toQueryString(sorted);
    const secureHash = crypto.createHmac('sha512', secret).update(signData, 'utf-8').digest('hex');
    return `${signData}&vnp_SecureHash=${secureHash}`;
};

const normalizeIp = (ipAddr) => {
    const ip = (ipAddr || '127.0.0.1').replace('::ffff:', '');
    if (ip === '::1' || ip === '::') return '127.0.0.1';
    return ip;
};

const normalizePublicUrl = (url = '') => {
    const trimmed = String(url).trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
};

const createPaymentUrl = ({ orders, ipAddr }) => {
    const tmnCode = process.env.VNPAY_TMN_CODE;
    const hashSecret = process.env.VNPAY_HASH_SECRET;
    const paymentUrl = process.env.VNPAY_PAYMENT_URL || DEFAULT_SANDBOX_URL;
    const returnUrl = normalizePublicUrl(process.env.VNPAY_RETURN_URL);
    const bankCode = process.env.VNPAY_BANK_CODE;

    if (!tmnCode || !hashSecret || !returnUrl) {
        throw Object.assign(new Error('Thiếu cấu hình VNPay.'), { status: 500 });
    }

    const orderIds = orders.map((order) => order.id);
    const amount = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    if (amount <= 0) {
        throw Object.assign(new Error('Số tiền thanh toán VNPay không hợp lệ.'), { status: 400 });
    }

    const txnRef = `ORD_${orderIds.join('_')}`;
    const createdAt = new Date();
    const expireAt = new Date(createdAt.getTime() + 15 * 60 * 1000);

    const params = {
        vnp_Version: VNPAY_VERSION,
        vnp_Command: VNPAY_COMMAND,
        vnp_TmnCode: tmnCode,
        vnp_Amount: Math.round(amount * 100),
        vnp_CurrCode: 'VND',
        vnp_TxnRef: txnRef,
        vnp_OrderInfo: `Thanh toan don hang ${orderIds.join(',')}`,
        vnp_OrderType: VNPAY_ORDER_TYPE,
        vnp_Locale: 'vn',
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: normalizeIp(ipAddr),
        vnp_CreateDate: formatDate(createdAt),
        vnp_ExpireDate: formatDate(expireAt)
    };
    if (bankCode) params.vnp_BankCode = bankCode;

    return {
        paymentUrl: `${paymentUrl}?${buildSignedQuery(params, hashSecret)}`,
        txnRef,
        amount
    };
};

const verifyReturn = (query) => {
    const hashSecret = process.env.VNPAY_HASH_SECRET;
    if (!hashSecret) throw Object.assign(new Error('Thiếu cấu hình VNPay.'), { status: 500 });

    const secureHash = query.vnp_SecureHash;
    const params = { ...query };
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;

    const sorted = sortObject(params);
    const signData = toQueryString(sorted);
    const checkHash = crypto.createHmac('sha512', hashSecret).update(signData, 'utf-8').digest('hex');

    return {
        isValid: secureHash === checkHash,
        isSuccess: query.vnp_ResponseCode === '00' && query.vnp_TransactionStatus === '00',
        txnRef: query.vnp_TxnRef,
        transactionNo: query.vnp_TransactionNo || null,
        responseCode: query.vnp_ResponseCode,
        amount: Number(query.vnp_Amount || 0) / 100
    };
};

const getOrderIdsFromTxnRef = (txnRef = '') => {
    if (!txnRef.startsWith('ORD_')) return [];
    return txnRef.replace('ORD_', '').split('_').map((id) => Number(id)).filter(Boolean);
};

const markOrdersPaid = async (orderIds) => {
    if (!orderIds.length) return [];
    await Order.update({ paymentStatus: 'paid' }, { where: { id: orderIds } });
    return Order.findAll({ where: { id: orderIds } });
};

module.exports = {
    createPaymentUrl,
    verifyReturn,
    getOrderIdsFromTxnRef,
    markOrdersPaid
};
