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

const signToken = (payload) =>
    jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

const createVerification = async ({ name, email, password, address, type }) => {
    await Verification.destroy({ where: { email, type } });
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await Verification.create({ name, email, password, address: address || null, otpHash, expiresAt, type });
    return otp;
};

const verifyOtp = async ({ email, otp, type }) => {
    const pending = await Verification.findOne({ where: { email, type } });
    if (!pending) throw Object.assign(new Error('Không tìm thấy yêu cầu.'), { status: 400 });
    if (new Date() > new Date(pending.expiresAt)) {
        await pending.destroy();
        throw Object.assign(new Error('Mã OTP đã hết hạn.'), { status: 400 });
    }
    const match = await bcrypt.compare(otp, pending.otpHash);
    if (!match) throw Object.assign(new Error('Mã OTP không đúng.'), { status: 400 });
    return pending;
};

const register = async ({ name, email, password, address }) => {
    const existing = await User.findOne({ where: { email } });
    if (existing) throw Object.assign(new Error('Email đã được đăng ký.'), { status: 409 });

    const passwordHash = await bcrypt.hash(password, 10);
    const otp = await createVerification({ name, email, password: passwordHash, address, type: 'register' });
    await sendOTPEmail(email, otp, 'Mã OTP xác thực đăng ký');
};

const verifyRegister = async ({ email, otp }) => {
    const pending = await verifyOtp({ email, otp, type: 'register' });

    // Lưu địa chỉ đăng ký làm địa chỉ mặc định
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
    await pending.destroy();

    const payload = { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, avatar: user.avatar, addresses: user.addresses, points: user.points || 0 };
    return { token: signToken(payload), user: payload };
};

const login = async ({ email, password }) => {
    const user = await User.findOne({ where: { email } });
    if (!user) throw Object.assign(new Error('Email hoặc mật khẩu không đúng.'), { status: 401 });
    if (!user.isActive) throw Object.assign(new Error('Tài khoản đã bị khóa.'), { status: 403 });

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw Object.assign(new Error('Email hoặc mật khẩu không đúng.'), { status: 401 });

    // FIX: thêm phone, avatar và addresses vào payload để client có đầy đủ thông tin
    const payload = { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, avatar: user.avatar, addresses: user.addresses, points: user.points || 0 };
    return { token: signToken(payload), user: payload };
};

const forgotPassword = async ({ email }) => {
    const user = await User.findOne({ where: { email } });
    if (!user) throw Object.assign(new Error('Email không tồn tại trong hệ thống.'), { status: 404 });

    const otp = await createVerification({ email, type: 'reset' });
    await sendOTPEmail(email, otp, 'Mã OTP đặt lại mật khẩu');
};

const verifyResetOtp = async ({ email, otp }) => {
    const pending = await verifyOtp({ email, otp, type: 'reset' });
    await pending.update({ otpHash: 'VERIFIED' });
};

const resetPassword = async ({ email, newPassword }) => {
    const pending = await Verification.findOne({ where: { email, type: 'reset' } });
    if (!pending || pending.otpHash !== 'VERIFIED')
        throw Object.assign(new Error('Yêu cầu chưa được xác thực OTP.'), { status: 400 });
    if (new Date() > new Date(pending.expiresAt))
        throw Object.assign(new Error('Phiên đặt lại mật khẩu đã hết hạn, vui lòng thử lại.'), { status: 400 });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await User.update({ password: passwordHash }, { where: { email } });
    await pending.destroy();
};

module.exports = { register, verifyRegister, login, forgotPassword, verifyResetOtp, resetPassword };