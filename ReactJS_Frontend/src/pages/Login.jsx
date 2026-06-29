import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, InputField, Message, Card, PageWrapper } from "../components";

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);
    const [msgType, setMsgType] = useState("info");

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        const userRaw = localStorage.getItem("user");
        if (token && userRaw) {
            try {
                const user = JSON.parse(userRaw);
                if (user?.role === "admin") {
                    navigate("/admin/dashboard", { replace: true });
                    return;
                }
                if (user?.role === "manager") {
                    navigate("/manager/dashboard", { replace: true });
                    return;
                }
            } catch (e) {}
            const params = new URLSearchParams(window.location.search);
            const redirectUrl = params.get("redirect") || "/";
            navigate(redirectUrl, { replace: true });
        }
    }, [navigate]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setMsg("Vui lòng nhập đầy đủ thông tin");
            setMsgType("error");
            return;
        }

        setLoading(true);
        setMsg(null);

        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: formData.email.trim(),
                    password: formData.password
                })
            });

            const data = await res.json();

            console.log("LOGIN RESPONSE:", data, res.status);

            if (!res.ok) {
                setMsg(data.message || "Lỗi đăng nhập");
                setMsgType("error");
                setLoading(false);
                return;
            }

            if (!data.token) {
                setMsg("Server không trả token");
                setMsgType("error");
                setLoading(false);
                return;
            }

            localStorage.setItem("accessToken", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            setMsg("Đăng nhập thành công!");
            setMsgType("success");

            const params = new URLSearchParams(window.location.search);
            let redirectUrl = params.get("redirect") || "/";
            if (data.user.role === "admin") {
                redirectUrl = "/admin/dashboard";
            } else if (data.user.role === "manager") {
                redirectUrl = "/manager/dashboard";
            } else if (data.user.role === "vendor") {
                redirectUrl = "/vendor/dashboard";
            }

            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 500);

        } catch (err) {
            setMsg(err.message || "Lỗi đăng nhập");
            setMsgType("error");
            setLoading(false);
        }
    };

    return (
        <PageWrapper>
            <Card>
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-1">Chào mừng trở lại!</h2>
                    <p className="text-gray-500 font-medium">Đăng nhập vào UTEShop</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <InputField label="Email" name="email" type="email" placeholder="example@hcmute.edu.vn" value={formData.email} onChange={handleChange} />
                    <InputField label="Mật khẩu" name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} />

                    <div className="flex justify-end mb-4">
                        <Link to="/forgot-password" className="text-sm text-primary opacity-80 hover:underline">Quên mật khẩu?</Link>
                    </div>

                    <Button type="submit" loading={loading}>{loading ? "Đang đăng nhập..." : "Đăng Nhập"}</Button>
                    <Message text={msg} type={msgType} />
                </form>

                <div className="my-6 flex items-center gap-3">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-xs font-medium text-gray-400">Hoặc</span>
                    <div className="h-px flex-1 bg-gray-200" />
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-[#00b14f] hover:bg-green-50 hover:text-[#00b14f]"
                >
                    Tiếp tục với vai trò khách
                </button>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-gray-600">
                        Chưa có tài khoản?{" "}
                        <Link to={`/register${window.location.search}`} className="text-primary font-semibold hover:underline">Đăng ký tại đây</Link>
                    </p>
                </div>
            </Card>
        </PageWrapper>
    );
};

export default Login;
