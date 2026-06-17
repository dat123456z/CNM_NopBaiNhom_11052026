const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Verification = require('../models/Verification');

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
});

const sendOTPEmail = async (to, otp, subject) => {
    await transporter.sendMail({
        from: process.env.MAIL_USER,
        to,
        subject,
        text: `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong 10 phút.`
    });
};

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));
const OTP_TTL_MS = 10 * 60 * 1000;
const CLEANUP_THRESHOLD_MS = 60 * 60 * 1000; // 1 tiếng dọn dẹp một lần
const OTP_EXPIRES_AT_MS_KEY = '__otpExpiresAtMs';

// expiresAt lưu UTC, Date.now() cũng UTC → so sánh chính xác, không bị timezone
const isVerificationExpired = (pending) => {
    const ms = Number(pending.address?.[OTP_EXPIRES_AT_MS_KEY]);
    if (Number.isFinite(ms) && ms > 0) return Date.now() >= ms;
    const t = new Date(pending.expiresAt).getTime();
    return Number.isFinite(t) ? Date.now() >= t : true;
};

// Chỉ thực sự xóa bản ghi khỏi DB nếu đã quá 1 tiếng để giữ lịch sử báo lỗi hết hạn/không còn hiệu lực
const isEligibleForCleanup = (pending) => {
    const createdAtTime = new Date(pending.createdAt).getTime();
    return Number.isFinite(createdAtTime) ? (Date.now() - createdAtTime >= CLEANUP_THRESHOLD_MS) : true;
};

const signToken = (payload) =>
    jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

const createVerification = async ({ name, email, password, address, type }) => {
    const now = Date.now();
    
    // Tìm và dọn dẹp
    const oldVerifications = await Verification.findAll({ where: { email, type } });
    for (const v of oldVerifications) {
        if (isEligibleForCleanup(v)) {
            await v.destroy();
        } else {
            // Clone JSON object để Sequelize phát hiện thay đổi và ghi nhận vào database
            const addr = { ...(v.address || {}) };
            addr.isUsed = true;
            addr.isVerified = false;
            await v.update({ address: addr });
        }
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAtMs = now + OTP_TTL_MS;
    const expiresAt = new Date(expiresAtMs);
    const addressWithOtpMeta = { 
        ...(address || {}), 
        [OTP_EXPIRES_AT_MS_KEY]: expiresAtMs,
        isUsed: false,
        isVerified: false
    };
    await Verification.create({ name, email, password, address: addressWithOtpMeta, otpHash, expiresAt, type });
    return { otp, expiresAt, expiresAtMs };
};

const verifyOtp = async ({ email, otp, type }) => {
    const verifications = await Verification.findAll({ where: { email, type } });
    
    let matchedVerification = null;
    for (const v of verifications) {
        if (v.otpHash && v.otpHash.startsWith('$2')) {
            const match = await bcrypt.compare(otp, v.otpHash).catch(() => false);
            if (match) {
                matchedVerification = v;
                break;
            }
        }
    }

    // 1. Không khớp bất kỳ mã nào
    if (!matchedVerification) {
        throw Object.assign(new Error('Mã OTP không đúng.'), { status: 400 });
    }

    // 2. Khớp mã, nhưng mã đã quá hạn 10 phút
    if (isVerificationExpired(matchedVerification)) {
        if (isEligibleForCleanup(matchedVerification)) {
            await matchedVerification.destroy();
        }
        throw Object.assign(new Error('OTP quá hạn'), { status: 400 });
    }

    // 3. Khớp mã, chưa quá 10 phút nhưng đã được dùng hoặc bị vô hiệu hóa
    if (matchedVerification.address?.isUsed) {
        throw Object.assign(new Error('OTP đã sử dụng'), { status: 400 });
    }

    return matchedVerification;
};

const register = async ({ name, email, password, address }) => {
    const existing = await User.findOne({ where: { email } });
    if (existing) throw Object.assign(new Error('Email đã được đăng ký.'), { status: 409 });

    const passwordHash = await bcrypt.hash(password, 10);
    const { otp } = await createVerification({ name, email, password: passwordHash, address, type: 'register' });
    await sendOTPEmail(email, otp, 'Mã OTP xác thực đăng ký');
};

const verifyRegister = async ({ email, otp }) => {
    const pending = await verifyOtp({ email, otp, type: 'register' });

    const addresses = [];
    if (pending.address && pending.address.street) {
        addresses.push({
            id: Date.now().toString(),
            street: pending.address.street,
            isDefault: true
        });
    }

    const user = await User.create({
        name: pending.name,
        email: pending.email,
        password: pending.password,
        phone: pending.address?.phone || null,
        addresses
    });

    const allPending = await Verification.findAll({ where: { email, type: 'register' } });
    for (const v of allPending) {
        if (isEligibleForCleanup(v)) {
            await v.destroy();
        } else {
            const addr = { ...(v.address || {}) };
            addr.isUsed = true;
            addr.isVerified = false;
            await v.update({ address: addr });
        }
    }

    const payload = { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, avatar: user.avatar, addresses: user.addresses, points: user.points || 0 };
    return { token: signToken(payload), user: payload };
};

const login = async ({ email, password }) => {
    const user = await User.findOne({ where: { email } });
    if (!user) throw Object.assign(new Error('Email hoặc mật khẩu không đúng.'), { status: 401 });
    if (!user.isActive) throw Object.assign(new Error('Tài khoản đã bị khóa.'), { status: 403 });

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw Object.assign(new Error('Email hoặc mật khẩu không đúng.'), { status: 401 });

    const payload = { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, avatar: user.avatar, addresses: user.addresses, points: user.points || 0 };
    return { token: signToken(payload), user: payload };
};

const forgotPassword = async ({ email }) => {
    const user = await User.findOne({ where: { email } });
    if (!user) throw Object.assign(new Error('Email không tồn tại trong hệ thống.'), { status: 404 });

    const { otp, expiresAt, expiresAtMs } = await createVerification({ email, type: 'reset' });
    await sendOTPEmail(email, otp, 'Mã OTP đặt lại mật khẩu');
    return { expiresAt, expiresAtMs };
};

const verifyResetOtp = async ({ email, otp }) => {
    const pending = await verifyOtp({ email, otp, type: 'reset' });
    
    // Clone JSON object để Sequelize phát hiện thay đổi và ghi nhận vào database
    const addr = { ...(pending.address || {}) };
    addr.isVerified = true;
    addr.isUsed = true;
    await pending.update({ address: addr });
};

const resetPassword = async ({ email, newPassword }) => {
    const verifications = await Verification.findAll({ where: { email, type: 'reset' } });
    const pending = verifications.find(v => v.address?.isVerified === true);

    if (!pending)
        throw Object.assign(new Error('Yêu cầu chưa được xác thực OTP.'), { status: 400 });

    if (isVerificationExpired(pending))
        throw Object.assign(new Error('OTP quá hạn'), { status: 400 });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await User.update({ password: passwordHash }, { where: { email } });
    
    for (const v of verifications) {
        if (isEligibleForCleanup(v)) {
            await v.destroy();
        } else {
            const addr = { ...(v.address || {}) };
            addr.isUsed = true;
            addr.isVerified = false;
            await v.update({ address: addr });
        }
    }
};

module.exports = { register, verifyRegister, login, forgotPassword, verifyResetOtp, resetPassword };
