import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LineIcon from "../../components/LineIcon";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const VendorOnboarding = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [form, setForm] = useState({ name: "", description: "", address: "", phone: "" });
    const [logoFile, setLogoFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    useEffect(() => {
        const userRaw = localStorage.getItem("user");
        if (userRaw) {
            try {
                const user = JSON.parse(userRaw);
                if (user?.role === "vendor") navigate("/vendor/dashboard", { replace: true });
            } catch {}
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setError("Ảnh logo không được vượt quá 2MB.");
                e.target.value = "";
                return;
            }
            setError(null);
            setLogoFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleNext = () => {
        if (step === 1 && (!form.name.trim() || !form.description.trim())) {
            setError("Vui lòng điền đầy đủ Tên cửa hàng và Mô tả.");
            return;
        }
        setError(null);
        setStep(prev => prev + 1);
    };

    const handlePrev = () => { setError(null); setStep(prev => prev - 1); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.address.trim() || !form.phone.trim()) {
            setError("Vui lòng nhập Địa chỉ và Số điện thoại liên hệ.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("accessToken");
            const formData = new FormData();
            formData.append("name", form.name.trim());
            formData.append("description", form.description.trim());
            formData.append("address", form.address.trim());
            formData.append("phone", form.phone.trim());
            if (logoFile) formData.append("logo", logoFile);

            const res = await fetch(`${API_URL}/api/shops`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Đăng ký shop thất bại.");

            const userRaw = localStorage.getItem("user");
            if (userRaw) {
                const user = JSON.parse(userRaw);
                user.role = "vendor";
                localStorage.setItem("user", JSON.stringify(user));
            }

            setStep(3);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl max-w-2xl w-full p-8 md:p-10 relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00b14f]/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

                {/* Progress */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    {[1, 2, 3].map((s, i) => (
                        <>
                            {i > 0 && <div key={`line-${s}`} className={`h-1 w-12 rounded-full transition-colors ${step >= s ? "bg-[#00b14f]" : "bg-gray-100"}`} />}
                            <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${step >= s ? "bg-[#00b14f] text-white" : "bg-gray-100 text-gray-400"}`}>{s}</div>
                        </>
                    ))}
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-xs font-semibold flex items-center gap-2">
                        <LineIcon name="alert" size={16} /><span>{error}</span>
                    </div>
                )}

                {step === 1 && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h1 className="text-2xl font-extrabold text-gray-900">Bắt đầu kinh doanh trên UTEShop</h1>
                            <p className="text-sm text-gray-500 mt-2">Điền thông tin thương hiệu để tạo gian hàng của riêng bạn</p>
                        </div>
                        <div className="space-y-4 text-left">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Tên cửa hàng *</label>
                                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Ví dụ: UTEShop Flagship Store"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00b14f] focus:ring-1 focus:ring-green-100" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Mô tả gian hàng *</label>
                                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Chia sẻ về sản phẩm và phong cách phục vụ của bạn..." rows={4}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00b14f] focus:ring-1 focus:ring-green-100 resize-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Logo Cửa Hàng (Tùy chọn)</label>
                                <div className="flex items-center gap-4 mt-1.5">
                                    <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                                        {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" alt="logo" /> : <span className="text-gray-400 text-xs">Chưa có logo</span>}
                                    </div>
                                    <input type="file" accept="image/*" onChange={handleLogoChange}
                                        className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer" />
                                </div>
                            </div>
                        </div>
                        <button onClick={handleNext} className="w-full py-3.5 bg-[#00b14f] hover:bg-[#009943] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer">
                            Tiếp tục
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h1 className="text-2xl font-extrabold text-gray-900">Thông tin liên lạc & Vận chuyển</h1>
                            <p className="text-sm text-gray-500 mt-2">Nơi chúng tôi có thể liên hệ và xử lý các vấn đề giao hàng</p>
                        </div>
                        <div className="space-y-4 text-left">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Số điện thoại liên hệ *</label>
                                <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="Nhập số điện thoại liên hệ của cửa hàng"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00b14f] focus:ring-1 focus:ring-green-100" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Địa chỉ lấy hàng *</label>
                                <input type="text" name="address" value={form.address} onChange={handleChange} placeholder="Ví dụ: Số 1 Võ Văn Ngân, Linh Chiểu, Thủ Đức, TP. HCM"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00b14f] focus:ring-1 focus:ring-green-100" />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={handlePrev} className="flex-1 py-3.5 border border-gray-200 text-gray-500 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                                Quay lại
                            </button>
                            <button onClick={handleSubmit} disabled={loading} className="flex-1 py-3.5 bg-[#00b14f] hover:bg-[#009943] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-60 cursor-pointer">
                                {loading ? "Đang đăng ký..." : "Hoàn thành đăng ký"}
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="text-center py-8 space-y-6">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto border border-green-100 text-green-700">
                            <LineIcon name="check" size={38} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900">Chúc mừng bạn!</h1>
                            <p className="text-sm text-gray-500 mt-2">Cửa hàng <strong>{form.name}</strong> đã được khởi tạo thành công.</p>
                            <p className="text-xs text-gray-400 mt-1">Giờ đây bạn đã có quyền truy cập vào Kênh Người Bán để đăng tải sản phẩm và quản lý đơn hàng.</p>
                        </div>
                        <button onClick={() => { window.location.href = "/vendor/dashboard"; }}
                            className="w-full py-3.5 bg-[#00b14f] hover:bg-[#009943] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer">
                            Đi tới Kênh Người Bán
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorOnboarding;
