import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, InputField, OtpInput, Message, StepIndicator, Card, PageWrapper } from "../components";

const STEPS = ["Email", "Xác thực OTP", "Mật khẩu mới"];
const OTP_TTL_MS = 10 * 60 * 1000;

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [otpExpiresAt, setOtpExpiresAt] = useState(null);
    const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);
    const [msgType, setMsgType] = useState("info");
    const [errors, setErrors] = useState({});

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    const setMessage = (text, type = "info") => {
        setMsg(text);
        setMsgType(type);
    };

    const isOtpExpired = () => otpExpiresAt && Date.now() >= otpExpiresAt;

    const sendOtp = async () => {
        const trimmedEmail = email.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (trimmedEmail && !emailRegex.test(trimmedEmail)) {
            setErrors({ email: "Email không đúng định dạng." });
            setMessage(null);
            return;
        }

        if (!trimmedEmail) {
            setErrors({ email: "Vui lòng nhập email." });
            return;
        }
        setErrors({});
        setLoading(true);
        setMessage(null);
        try {
            const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: trimmedEmail }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Lỗi gửi OTP");
            setStep(1);
            setEmail(trimmedEmail);
            setOtp("");
            setOtpExpiresAt(Number(data.expiresAtMs) || (data.expiresAt ? new Date(data.expiresAt).getTime() : Date.now() + OTP_TTL_MS));
            setMessage("OTP đã được gửi tới email của bạn.", "success");
        } catch (err) {
            setMessage(err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        if (isOtpExpired()) {
            setErrors({});
            setMessage("OTP quá hạn", "error");
            return;
        }

        if (otp.length !== 6) {
            setErrors({ otp: "Vui lòng nhập đủ 6 chữ số." });
            return;
        }
        setErrors({});
        setLoading(true);
        setMessage(null);
        try {
            const res = await fetch(`${API_URL}/api/auth/verify-reset-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "OTP không hợp lệ");
            setStep(2);
            setMessage(null);
        } catch (err) {
            setMessage(err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async () => {
        const newErrors = {};
        if (!passwords.newPassword || passwords.newPassword.length < 6)
            newErrors.newPassword = "Mật khẩu tối thiểu 6 ký tự.";
        if (passwords.newPassword !== passwords.confirmPassword)
            newErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
        if (Object.keys(newErrors).length) {
            setErrors(newErrors);
            return;
        }
        setErrors({});
        setLoading(true);
        setMessage(null);
        try {
            const res = await fetch(`${API_URL}/api/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, newPassword: passwords.newPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Lỗi đặt lại mật khẩu");
            setMessage("Đặt lại mật khẩu thành công! Đang chuyển hướng...", "success");
            setTimeout(() => navigate("/login"), 1500);
        } catch (err) {
            setMessage(err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper>
            <Card>
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-4">
                        <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-900">Quên mật khẩu?</h2>
                    <p className="text-gray-500 text-sm mt-1">Đừng lo, chúng tôi sẽ giúp bạn khôi phục</p>
                </div>

                <StepIndicator steps={STEPS} current={step} />

                {step === 0 && (
                    <>
                        <InputField
                            label="Email đã đăng ký"
                            type="email"
                            name="email"
                            placeholder="example@hcmute.edu.vn"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setOtpExpiresAt(null);
                                setErrors((prev) => ({ ...prev, email: null }));
                                setMessage(null);
                            }}
                            error={errors.email}
                        />
                        <Button loading={loading} onClick={sendOtp}>Gửi mã OTP</Button>
                    </>
                )}

                {step === 1 && (
                    <>
                        <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-4 text-sm text-blue-600 text-center">
                            Đã gửi OTP đến <strong>{email}</strong>
                        </div>
                        <OtpInput value={otp} onChange={setOtp} />
                        {errors.otp && <p className="text-xs text-red-500 -mt-3 mb-3 text-center">{errors.otp}</p>}
                        <Button loading={loading} onClick={verifyOtp}>Xác nhận OTP</Button>
                        <Button
                            variant="secondary"
                            className="mt-2"
                            loading={loading}
                            onClick={() => { setStep(0); setOtp(""); setOtpExpiresAt(null); setMessage(null); }}
                        >
                            Đổi email khác
                        </Button>
                        <p className="text-center text-sm text-gray-500 mt-3">
                            Không nhận được?{" "}
                            <button onClick={sendOtp} className="text-primary font-semibold hover:underline">Gửi lại</button>
                        </p>
                    </>
                )}

                {step === 2 && (
                    <>
                        <InputField
                            label="Mật khẩu mới"
                            type="password"
                            placeholder="Tối thiểu 6 ký tự"
                            value={passwords.newPassword}
                            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                            error={errors.newPassword}
                        />
                        <InputField
                            label="Xác nhận mật khẩu mới"
                            type="password"
                            placeholder="Nhập lại mật khẩu"
                            value={passwords.confirmPassword}
                            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                            error={errors.confirmPassword}
                        />
                        <Button loading={loading} onClick={resetPassword}>Đặt lại mật khẩu</Button>
                    </>
                )}

                <Message text={msg} type={msgType} />

                <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                    <Link to="/login" className="text-sm text-gray-500 hover:text-primary transition-colors">
                        ← Quay lại đăng nhập
                    </Link>
                </div>
            </Card>
        </PageWrapper>
    );
};

export default ForgotPassword;
