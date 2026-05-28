import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    Button,
    InputField,
    OtpInput,
    Message,
    StepIndicator,
    Card,
    PageWrapper
} from "../components";

const STEPS = [
    "Thông tin",
    "Xác thực OTP"
];

const Register = () => {
    const navigate = useNavigate();

    const API_URL =
        import.meta.env.VITE_API_URL ||
        "http://localhost:3000";

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        address: ""
    });

    const [otp, setOtp] = useState("");

    const [step, setStep] = useState(0);

    const [loading, setLoading] = useState(false);

    const [msg, setMsg] = useState(null);

    const [msgType, setMsgType] =
        useState("info");

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: ""
        }));
    };

    const validate = () => {
        const errs = {};

        const name =
            formData.name.trim();

        const email =
            formData.email
                .trim()
                .toLowerCase();

        if (!name) {
            errs.name =
                "Vui lòng nhập họ tên.";
        } else if (name.length < 2) {
            errs.name =
                "Họ tên tối thiểu 2 ký tự.";
        }

        if (!email) {
            errs.email =
                "Vui lòng nhập email.";
        } else {
            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(email)) {
                errs.email =
                    "Email không hợp lệ.";
            }
        }

        if (!formData.phone.trim()) {
            errs.phone = "Vui lòng nhập số điện thoại.";
        } else {
            const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
            if (!phoneRegex.test(formData.phone.trim())) {
                errs.phone = "Số điện thoại không hợp lệ (10 chữ số).";
            }
        }

        if (!formData.password) {
            errs.password =
                "Vui lòng nhập mật khẩu.";
        } else if (
            formData.password.length < 6
        ) {
            errs.password =
                "Mật khẩu tối thiểu 6 ký tự.";
        }

        if (!formData.confirmPassword) {
            errs.confirmPassword =
                "Vui lòng xác nhận mật khẩu.";
        } else if (
            formData.password !==
            formData.confirmPassword
        ) {
            errs.confirmPassword =
                "Mật khẩu xác nhận không khớp.";
        }

        if (!formData.address.trim()) errs.address = "Vui lòng nhập địa chỉ.";

        return errs;
    };

    const sendOtp = async () => {
        if (loading) return;

        const errs = validate();

        if (Object.keys(errs).length) {
            setErrors(errs);
            return;
        }

        setErrors({});
        setLoading(true);
        setMsg(null);

        try {
            const payload = {
                name: formData.name.trim(),
                email: formData.email
                    .trim()
                    .toLowerCase(),
                password:
                    formData.password,
                address: {
                    street: formData.address.trim(),
                    phone: formData.phone.trim()
                }
            };

            const res = await fetch(
                `${API_URL}/api/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify(
                        payload
                    )
                }
            );

            const data =
                await res
                    .json()
                    .catch(() => ({}));

            if (!res.ok) {
                throw new Error(
                    data.message ||
                    "Lỗi gửi OTP"
                );
            }

            setStep(1);

            setMsg(
                data.message ||
                "OTP đã được gửi tới email."
            );

            setMsgType("success");
        } catch (err) {
            setMsg(
                err.message ||
                "Lỗi gửi OTP"
            );

            setMsgType("error");
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        if (loading) return;

        if (!/^\d{6}$/.test(otp)) {
            setErrors({
                otp: "OTP phải gồm 6 chữ số."
            });

            return;
        }

        setErrors({});
        setLoading(true);
        setMsg(null);

        try {
            const res = await fetch(
                `${API_URL}/api/auth/verify`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        email:
                            formData.email
                                .trim()
                                .toLowerCase(),
                        otp
                    })
                }
            );

            const data =
                await res
                    .json()
                    .catch(() => ({}));

            if (!res.ok) {
                throw new Error(
                    data.message ||
                    "Lỗi xác thực OTP"
                );
            }

            setMsg(
                "Đăng ký thành công! Đang chuyển hướng..."
            );

            setMsgType("success");

            setTimeout(() => {
                navigate("/login" + window.location.search);
            }, 1500);
        } catch (err) {
            setMsg(
                err.message ||
                "Lỗi xác thực OTP"
            );

            setMsgType("error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper>
            <Card>
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Tạo tài khoản{" "}
                        <span className="text-primary">
                            UTEShop
                        </span>
                    </h2>
                </div>

                <StepIndicator
                    steps={STEPS}
                    current={step}
                />

                {step === 0 && (
                    <>
                        <InputField
                            label="Họ và tên"
                            name="name"
                            type="text"
                            placeholder="Nguyễn Văn A"
                            value={
                                formData.name
                            }
                            onChange={
                                handleChange
                            }
                            error={
                                errors.name
                            }
                        />

                        <InputField
                            label="Email"
                            name="email"
                            type="email"
                            placeholder="example@hcmute.edu.vn"
                            value={
                                formData.email
                            }
                            onChange={
                                handleChange
                            }
                            error={
                                errors.email
                            }
                        />

                        <InputField
                            label="Số điện thoại"
                            name="phone"
                            type="text"
                            placeholder="Ví dụ: 0912345678"
                            value={
                                formData.phone
                            }
                            onChange={
                                handleChange
                            }
                            error={
                                errors.phone
                            }
                        />

                        <InputField
                            label="Mật khẩu"
                            name="password"
                            type="password"
                            placeholder="Tối thiểu 6 ký tự"
                            value={
                                formData.password
                            }
                            onChange={
                                handleChange
                            }
                            error={
                                errors.password
                            }
                        />

                        <InputField
                            label="Xác nhận mật khẩu"
                            name="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={
                                formData.confirmPassword
                            }
                            onChange={
                                handleChange
                            }
                            error={
                                errors.confirmPassword
                            }
                        />

                        <InputField
                            label="Địa chỉ"
                            name="address"
                            type="text"
                            placeholder="VD: 123 Lê Lợi, Phường 1, Quận 1, TP.HCM"
                            value={
                                formData.address
                            }
                            onChange={
                                handleChange
                            }
                            error={
                                errors.address
                            }
                        />

                        <Button
                            loading={loading}
                            disabled={loading}
                            onClick={
                                sendOtp
                            }
                        >
                            {loading
                                ? "Đang gửi OTP..."
                                : "Gửi mã OTP"}
                        </Button>
                    </>
                )}

                {step === 1 && (
                    <>
                        <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-4 text-sm text-blue-600 text-center">
                            Đã gửi OTP đến{" "}
                            <strong>
                                {
                                    formData.email
                                }
                            </strong>
                        </div>

                        <OtpInput
                            value={otp}
                            onChange={(
                                value
                            ) => {
                                setOtp(
                                    value
                                );

                                setErrors(
                                    (
                                        prev
                                    ) => ({
                                        ...prev,
                                        otp: ""
                                    })
                                );
                            }}
                        />

                        {errors.otp && (
                            <p className="text-xs text-red-500 -mt-3 mb-3 text-center">
                                {
                                    errors.otp
                                }
                            </p>
                        )}

                        <div className="flex gap-3">
                            <Button
                                loading={
                                    loading
                                }
                                disabled={
                                    loading
                                }
                                onClick={
                                    verifyOtp
                                }
                            >
                                {loading
                                    ? "Đang xác thực..."
                                    : "Xác nhận OTP"}
                            </Button>

                            <Button
                                variant="secondary"
                                loading={
                                    loading
                                }
                                disabled={
                                    loading
                                }
                                onClick={
                                    sendOtp
                                }
                            >
                                Gửi lại
                            </Button>
                        </div>
                    </>
                )}

                <Message
                    text={msg}
                    type={msgType}
                />

                <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                    <p className="text-gray-600">
                        Đã có tài khoản?{" "}
                        <Link
                            to={`/login${window.location.search}`}
                            className="text-primary font-semibold hover:underline"
                        >
                            Đăng nhập ngay
                        </Link>
                    </p>
                </div>
            </Card>
        </PageWrapper>
    );
};

export default Register;