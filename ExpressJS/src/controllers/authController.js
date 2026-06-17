const authService = require('../services/authService');

const register = async (req, res) => {
    try {
        const { name, email, password, address } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ message: 'Vui lòng cung cấp tên, email và mật khẩu.' });
        await authService.register({ name, email, password, address });
        return res.json({ message: 'OTP đã được gửi tới email. Vui lòng kiểm tra hộp thư.' });
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const verifyRegister = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp)
            return res.status(400).json({ message: 'Vui lòng cung cấp email và mã OTP.' });
        const result = await authService.verifyRegister({ email, otp });
        return res.status(201).json(result);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: 'Vui lòng cung cấp email và mật khẩu.' });
        const result = await authService.login({ email, password });
        return res.json(result);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email)
            return res.status(400).json({ message: 'Vui lòng cung cấp email.' });
        const result = await authService.forgotPassword({ email });
        return res.json({
            message: 'OTP đã được gửi tới email. Vui lòng kiểm tra hộp thư.',
            expiresAt: result.expiresAt,
            expiresAtMs: result.expiresAtMs
        });
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const verifyResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp)
            return res.status(400).json({ message: 'Vui lòng cung cấp email và mã OTP.' });
        await authService.verifyResetOtp({ email, otp });
        return res.json({ message: 'OTP hợp lệ.' });
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword)
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin.' });
        await authService.resetPassword({ email, newPassword });
        return res.json({ message: 'Đặt lại mật khẩu thành công.' });
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

module.exports = { register, verifyRegister, login, forgotPassword, verifyResetOtp, resetPassword };
