import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Message, PageWrapper } from "../../components";
import Breadcrumb from "../../components/Breadcrumb";
import LineIcon from "../../components/LineIcon";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ── Address Form Component ──────────────────────────────────────────────────
const AddressForm = ({ initial, onSave, onCancel, loading }) => {
    const [form, setForm] = useState({
        street: initial?.street || "",
        isDefault: initial?.isDefault || false
    });
    const [errors, setErrors] = useState({});

    const validate = () => {
        const errs = {};
        if (!form.street.trim()) errs.street = "Vui lòng nhập địa chỉ.";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) onSave({ ...form, id: initial?.id });
    };

    return (
        <div className="border border-gray-200 bg-white rounded-xl p-4 space-y-3 shadow-sm">
            <div className="grid grid-cols-1 gap-3">
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Địa chỉ *</label>
                    <input value={form.street} onChange={(e) => setForm(p => ({ ...p, street: e.target.value }))}
                        placeholder="VD: 123 Lê Lợi, Phường 1, Quận 1, TP.HCM"
                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 ${errors.street ? "border-red-400 focus:border-red-400 focus:ring-red-200" : "border-gray-200 focus:border-[#00b14f] focus:ring-green-100"}`} />
                    {errors.street && <p className="text-xs text-red-500 mt-1">{errors.street}</p>}
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm(p => ({ ...p, isDefault: e.target.checked }))}
                        className="w-4 h-4 accent-[#00b14f] rounded" />
                    <span className="text-sm text-gray-700">Đặt làm địa chỉ mặc định</span>
                </label>
            </div>
            <div className="flex gap-2 pt-1">
                <button onClick={handleSubmit} disabled={loading}
                    className="px-4 py-2 bg-[#00b14f] text-white rounded-lg text-sm font-semibold hover:bg-[#009943] transition-colors disabled:opacity-60">
                    {loading ? "Đang lưu..." : "Lưu địa chỉ"}
                </button>
                <button onClick={onCancel} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50">Hủy</button>
            </div>
        </div>
    );
};

// ── Main Profile Component ─────────────────────────────────────────────────
const Profile = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [user, setUser] = useState(null);

    // Split name into first and last name for the form
    const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "" });
    const [securityForm, setSecurityForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);
    const [msgType, setMsgType] = useState("info");
    const [errors, setErrors] = useState({});

    // Address state
    const [addresses, setAddresses] = useState([]);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [addrLoading, setAddrLoading] = useState(false);
    const [addrMsg, setAddrMsg] = useState(null);
    const [addrMsgType, setAddrMsgType] = useState("info");

    const [coupons, setCoupons] = useState([]);
    const [wishlist, setWishlist] = useState([]);

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (!stored) { navigate("/login"); return; }
        try {
            const parsed = JSON.parse(stored);
            if (parsed.isActive === false) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("user");
                navigate("/login");
                return;
            }
            setUser(parsed);

            // Split name
            const nameParts = (parsed.name || "").trim().split(" ");
            let fName = "";
            let lName = "";
            if (nameParts.length > 1) {
                lName = nameParts.pop();
                fName = nameParts.join(" ");
            } else {
                fName = nameParts[0] || "";
            }

            setForm({ firstName: fName, lastName: lName, email: parsed.email || "", phone: parsed.phone || "" });
            setAddresses(parsed.addresses || []);
            if (parsed.avatar) {
                setAvatarPreview(parsed.avatar.startsWith("http") ? parsed.avatar : `${API_URL}${parsed.avatar}`);
            }

            // Fetch latest user profile from API to update points
            const fetchLatestProfile = async () => {
                try {
                    const token = localStorage.getItem("accessToken");
                    if (!token) return;
                    const res = await fetch(`${API_URL}/api/users/profile`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data.user) {
                            const merged = { ...parsed, ...data.user };
                            localStorage.setItem("user", JSON.stringify(merged));
                            setUser(merged);
                        }
                    }
                } catch (e) {
                    console.error("Error fetching latest profile:", e);
                }
            };
            fetchLatestProfile();

            // Fetch user coupons
            const fetchCoupons = async () => {
                try {
                    const token = localStorage.getItem("accessToken");
                    if (!token) return;
                    const res = await fetch(`${API_URL}/api/users/coupons`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setCoupons(data || []);
                    }
                } catch (err) {
                    console.error("Error fetching coupons:", err);
                }
            };
            fetchCoupons();

            // Fetch user wishlist
            const fetchWishlist = async () => {
                try {
                    const token = localStorage.getItem("accessToken");
                    if (!token) return;
                    const res = await fetch(`${API_URL}/api/wishlists`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setWishlist(Array.isArray(data) ? data : []);
                    }
                } catch (err) {
                    console.error("Error fetching wishlist:", err);
                }
            };
            fetchWishlist();

        } catch {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            navigate("/login");
        }
    }, [navigate]);

    useEffect(() => {
        return () => { if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview); };
    }, [avatarPreview]);

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) { setMsg("File phải là ảnh."); setMsgType("error"); return; }
        if (file.size > 2 * 1024 * 1024) { setMsg("Ảnh không được vượt quá 2MB."); setMsgType("error"); return; }
        if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
        setAvatar(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleRemoveAvatar = () => {
        setAvatar(null);
        setAvatarPreview(null);
    };

    const validate = () => {
        const errs = {};
        if (!form.firstName.trim()) errs.firstName = "Bắt buộc";
        if (!form.lastName.trim()) errs.lastName = "Bắt buộc";
        if (form.phone.trim() && !/^[0-9+\-\s]{8,15}$/.test(form.phone.trim())) errs.phone = "Không hợp lệ";
        return errs;
    };

    const handleSave = async () => {
        if (loading) return;
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({}); setLoading(true); setMsg(null);
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) { navigate("/login"); return; }

            const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();

            const payload = new FormData();
            payload.append("name", fullName);
            payload.append("phone", form.phone.trim());
            if (avatar) payload.append("avatar", avatar);

            const res = await fetch(`${API_URL}/api/users/profile`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
                body: payload
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || "Cập nhật thất bại");

            const updated = data.user;
            const merged = { ...user, ...updated };
            localStorage.setItem("user", JSON.stringify(merged));
            setUser(merged);

            const nameParts = (merged.name || "").trim().split(" ");
            let fName = "", lName = "";
            if (nameParts.length > 1) { lName = nameParts.pop(); fName = nameParts.join(" "); } else { fName = nameParts[0] || ""; }
            setForm({ firstName: fName, lastName: lName, email: merged.email || "", phone: merged.phone || "" });

            if (merged.avatar) setAvatarPreview(merged.avatar.startsWith("http") ? merged.avatar : `${API_URL}${merged.avatar}`);
            setAvatar(null);
            setMsg("Cập nhật hồ sơ thành công!"); setMsgType("success");

            setTimeout(() => setMsg(null), 3000);
        } catch (err) {
            setMsg(err.message || "Cập nhật thất bại"); setMsgType("error");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        const nameParts = (user.name || "").trim().split(" ");
        let fName = "", lName = "";
        if (nameParts.length > 1) { lName = nameParts.pop(); fName = nameParts.join(" "); } else { fName = nameParts[0] || ""; }

        setForm({ firstName: fName, lastName: lName, email: user.email || "", phone: user.phone || "" });
        setAvatar(null); setErrors({}); setMsg(null);
        if (user.avatar) setAvatarPreview(user.avatar.startsWith("http") ? user.avatar : `${API_URL}${user.avatar}`);
        else setAvatarPreview(null);
    };

    // ── Address handlers ────────────────────────────────────────────────────
    const refreshAddresses = (newAddresses) => {
        setAddresses(newAddresses);
        const stored = localStorage.getItem("user");
        if (stored) {
            try {
                const u = JSON.parse(stored);
                u.addresses = newAddresses;
                localStorage.setItem("user", JSON.stringify(u));
                setUser(u);
            } catch { }
        }
    };

    const handleSaveAddress = async (addrData) => {
        const token = localStorage.getItem("accessToken");
        setAddrLoading(true); setAddrMsg(null);
        try {
            const res = await fetch(`${API_URL}/api/users/addresses`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify(addrData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Lỗi lưu địa chỉ.");
            refreshAddresses(data);
            setShowAddressForm(false); setEditingAddress(null);
            setAddrMsg("Địa chỉ đã được lưu."); setAddrMsgType("success");
            setTimeout(() => setAddrMsg(null), 3000);
        } catch (err) {
            setAddrMsg(err.message); setAddrMsgType("error");
        } finally {
            setAddrLoading(false);
        }
    };

    const handleRemoveAddress = async (addrId) => {
        if (!window.confirm("Xóa địa chỉ này?")) return;
        const token = localStorage.getItem("accessToken");
        setAddrLoading(true); setAddrMsg(null);
        try {
            const res = await fetch(`${API_URL}/api/users/addresses/${addrId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Lỗi xóa địa chỉ.");
            refreshAddresses(data);
            setAddrMsg("Đã xóa địa chỉ."); setAddrMsgType("success");
            setTimeout(() => setAddrMsg(null), 3000);
        } catch (err) {
            setAddrMsg(err.message); setAddrMsgType("error");
        } finally {
            setAddrLoading(false);
        }
    };

    const handleSetDefault = async (addrId) => {
        const token = localStorage.getItem("accessToken");
        setAddrLoading(true); setAddrMsg(null);
        try {
            const res = await fetch(`${API_URL}/api/users/addresses/${addrId}/default`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Lỗi cập nhật địa chỉ mặc định.");
            refreshAddresses(data);
            setAddrMsg("Đã đặt địa chỉ mặc định."); setAddrMsgType("success");
            setTimeout(() => setAddrMsg(null), 3000);
        } catch (err) {
            setAddrMsg(err.message); setAddrMsgType("error");
        } finally {
            setAddrLoading(false);
        }
    };

    const handleRemoveFavorite = async (productId) => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        try {
            const res = await fetch(`${API_URL}/api/wishlists/${productId}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setWishlist(prev => prev.filter(p => p.id !== productId));
            }
        } catch (err) {
            console.error("Error toggling favorite:", err);
        }
    };

    if (!user) return null;

    return (
        <>
            <Breadcrumb align="viewport" />
            <main className="flex-1 py-10">
                <div className="max-w-5xl w-full mx-auto px-4">

                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
                        <p className="text-gray-500">Manage your personal information, security, and addresses.</p>
                    </div>

                    {msg && (
                        <div className={`mb-6 p-4 rounded-lg font-medium text-sm flex items-center justify-between ${msgType === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                            {msg}
                            <button onClick={() => setMsg(null)} className="opacity-50 hover:opacity-100">✕</button>
                        </div>
                    )}

                    {/* Avatar Card */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="relative">
                                <div
                                    className="w-20 h-20 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center"
                                    style={{ background: avatarPreview ? "transparent" : "#e5e7eb" }}
                                >
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                    )}
                                </div>
                                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-600 rounded-full border-2 border-white flex items-center justify-center text-white cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                                <p className="text-gray-500 text-sm">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-[#008f3f] text-white text-sm font-semibold rounded-lg hover:bg-[#007a36] transition-colors">
                                Upload New Photo
                            </button>
                            <button onClick={handleRemoveAvatar} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                                Remove
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Vendor Onboarding CTA – only for regular users */}
                        {user.role !== "vendor" && user.role !== "manager" && user.role !== "admin" && (
                            <div className="bg-linear-to-r from-[#00b14f] to-[#009943] rounded-xl shadow-lg border border-green-600/20 overflow-hidden relative">
                                {/* Background decorations */}
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                                <div className="p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div>
                                            <h3 className="text-lg font-extrabold text-white mb-1">Bắt đầu kinh doanh trên UTEShop</h3>
                                            <p className="text-sm text-white/80">Tạo trang bán hàng của riêng bạn, đăng tải sản phẩm và quản lý đơn hàng ngay hôm nay.</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate("/vendor/setup")}
                                        className="px-6 py-3 bg-white text-[#00b14f] text-sm font-bold rounded-xl shadow-md hover:shadow-lg hover:bg-green-50 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer active:scale-95"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                        Tạo trang bán hàng
                                    </button>
                                </div>
                            </div>
                        )}
                        {/* ROW 1: Personal Info & Loyalty/Coupons */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                            {/* Personal Information */}
                            <div className="lg:col-span-7">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="bg-[#f0f4f8] px-6 py-4 flex items-center gap-2 border-b border-gray-100">
                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        <h3 className="font-semibold text-gray-800">Personal Information</h3>
                                    </div>
                                    <div className="p-6 space-y-5">
                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1.5">First Name</label>
                                                <input type="text" value={form.firstName} onChange={(e) => setForm(p => ({ ...p, firstName: e.target.value }))}
                                                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:border-[#008f3f] ${errors.firstName ? 'border-red-500' : 'border-gray-200'}`} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1.5">Last Name</label>
                                                <input type="text" value={form.lastName} onChange={(e) => setForm(p => ({ ...p, lastName: e.target.value }))}
                                                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:border-[#008f3f] ${errors.lastName ? 'border-red-500' : 'border-gray-200'}`} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1.5">Email Address</label>
                                            <input type="email" value={form.email} disabled
                                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1.5">Phone Number</label>
                                            <input type="text" value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                                                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:border-[#008f3f] ${errors.phone ? 'border-red-500' : 'border-gray-200'}`} />
                                            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Loyalty & Coupons */}
                            <div className="lg:col-span-5">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="bg-linear-to-r from-emerald-500 to-green-600 px-6 py-4 flex items-center justify-between text-white">
                                        <div className="flex items-center gap-2">
                                            <LineIcon name="coin" size={22} />
                                            <h3 className="font-semibold text-sm sm:text-base">Kho Điểm & Ví Voucher</h3>
                                        </div>
                                        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                                            Active
                                        </span>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        {/* Points Balance */}
                                        <div className="flex items-center justify-between bg-green-50/50 p-4 rounded-xl border border-green-100">
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Điểm tích lũy</p>
                                                <p className="text-2xl font-bold text-green-700 mt-1 flex items-center gap-1.5">
                                                    <span>{user.points || 0}</span>
                                                    <span className="text-sm font-medium text-green-600">xu</span>
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-gray-400 font-medium">Giá trị quy đổi</p>
                                                <p className="text-sm font-semibold text-gray-700 mt-1">
                                                    {((user.points || 0) * 1000).toLocaleString('vi-VN')} đ
                                                </p>
                                            </div>
                                        </div>

                                        {/* Vouchers/Coupons List */}
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-3 tracking-wider flex items-center justify-between">
                                                <span>MÃ GIẢM GIÁ CỦA BẠN</span>
                                                <span className="text-gray-500 font-medium normal-case">({coupons.length} voucher)</span>
                                            </p>

                                            {coupons.length === 0 ? (
                                                <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                                    <p className="text-xs text-gray-400">Bạn chưa có mã giảm giá nào.</p>
                                                    <p className="text-[10px] text-gray-400 mt-1">Đánh giá sản phẩm đã mua để nhận voucher 10%!</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3 max-h-62.5 overflow-y-auto pr-1">
                                                    {coupons.map((coupon) => (
                                                        <div key={coupon.id} className="relative flex items-center justify-between p-3 border border-dashed border-green-200 rounded-xl bg-green-50/10 hover:bg-green-50/20 transition-colors">
                                                            <div className="flex-1 min-w-0 pr-3">
                                                                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                                                    <span className="bg-green-100 text-green-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                                                                        {coupon.type === 'percent' ? `-${Math.round(coupon.value)}%` : `-${Number(coupon.value).toLocaleString('vi-VN')}đ`}
                                                                    </span>
                                                                    <span className="text-xs font-mono font-bold text-gray-800 tracking-wider">
                                                                        {coupon.code}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[11px] text-gray-500 truncate">
                                                                    Cửa hàng: <span className="font-semibold">{coupon.shop?.name || `Shop #${coupon.shopId}`}</span>
                                                                </p>
                                                                <p className="text-[10px] text-gray-400 mt-0.5">
                                                                    Hạn dùng: {new Date(coupon.expiresAt).toLocaleDateString('vi-VN')}
                                                                </p>
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(coupon.code);
                                                                    alert("Đã sao chép mã giảm giá!");
                                                                }}
                                                                className="text-[11px] font-semibold text-green-700 hover:text-green-900 border border-green-200 hover:border-green-300 bg-white px-2 py-1 rounded-lg shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer"
                                                            >
                                                                Sao chép
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ROW 2: Addresses & Favorite Products */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                            {/* Addresses Management */}
                            <div className="lg:col-span-7 flex flex-col">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col">
                                    <div className="bg-[#f0f4f8] px-6 py-4 flex items-center justify-between border-b border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            <h3 className="font-semibold text-gray-800">Addresses</h3>
                                        </div>
                                        {!showAddressForm && (
                                            <button onClick={() => { setShowAddressForm(true); setEditingAddress(null); }} className="text-xs font-semibold text-[#008f3f] hover:underline">
                                                + Add New
                                            </button>
                                        )}
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col justify-between">
                                        <div>
                                            {addrMsg && (
                                                <div className={`mb-4 px-3 py-2 rounded text-xs font-medium ${addrMsgType === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
                                                    {addrMsg}
                                                </div>
                                            )}

                                            {showAddressForm && editingAddress === null && (
                                                <div className="mb-6">
                                                    <AddressForm initial={null} onSave={handleSaveAddress} onCancel={() => setShowAddressForm(false)} loading={addrLoading} />
                                                </div>
                                            )}

                                            {addresses.length === 0 && !showAddressForm ? (
                                                <p className="text-sm text-gray-500 text-center py-4">No addresses saved.</p>
                                            ) : (
                                                <div className="space-y-4">
                                                    {addresses.map((addr) => (
                                                        <div key={addr.id}>
                                                            {editingAddress === addr.id ? (
                                                                <AddressForm initial={addr} onSave={handleSaveAddress} onCancel={() => setEditingAddress(null)} loading={addrLoading} />
                                                            ) : (
                                                                <div className={`p-4 rounded-xl border ${addr.isDefault ? "border-[#008f3f] bg-green-50/20" : "border-gray-200"}`}>
                                                                    <div className="flex items-start justify-between">
                                                                        <div>
                                                                            {addr.isDefault && <span className="text-[10px] uppercase font-bold text-[#008f3f] mb-1 block tracking-wider">Default</span>}
                                                                            <p className="text-sm text-gray-800 font-medium">{addr.street}</p>
                                                                            {(addr.ward || addr.district || addr.city) && (
                                                                                <p className="text-xs text-gray-500 mt-1">
                                                                                    {[addr.ward, addr.district, addr.city].filter(Boolean).join(", ")}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex gap-2 ml-4">
                                                                            <button onClick={() => setEditingAddress(addr.id)} className="text-gray-400 hover:text-blue-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                                                                            {!addr.isDefault && <button onClick={() => handleRemoveAddress(addr.id)} className="text-gray-400 hover:text-red-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>}
                                                                        </div>
                                                                    </div>
                                                                    {!addr.isDefault && (
                                                                        <button onClick={() => handleSetDefault(addr.id)} className="text-xs text-[#008f3f] mt-3 font-semibold hover:underline">Set as default</button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Favorite Products */}
                            <div className="lg:col-span-5 flex flex-col">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col">
                                    <div className="bg-[#f0f4f8] px-6 py-4 flex items-center gap-2 border-b border-gray-100">
                                        <svg className="w-5 h-5 text-red-500 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                        </svg>
                                        <h3 className="font-semibold text-gray-800">Sản phẩm yêu thích</h3>
                                        <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold ml-auto">
                                            {wishlist.length} món
                                        </span>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col justify-between">
                                        {wishlist.length === 0 ? (
                                            <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl bg-gray-50/50 flex-1 flex flex-col justify-center">
                                                <p className="text-sm text-gray-400">Chưa có sản phẩm yêu thích.</p>
                                                <button
                                                    onClick={() => navigate('/products')}
                                                    className="text-xs text-blue-600 font-bold hover:underline mt-2 cursor-pointer"
                                                >
                                                    Khám phá ngay
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3 max-h-37 overflow-y-auto pr-1 flex-1">
                                                {wishlist.map((item) => {
                                                    const imgUrl = Array.isArray(item.images) && item.images.length > 0
                                                        ? (item.images[0].startsWith('http') ? item.images[0] : `${API_URL}${item.images[0]}`)
                                                        : (item.image ? (item.image.startsWith('http') ? item.image : `${API_URL}${item.image}`) : "/placeholder.png");

                                                    return (
                                                        <div key={item.id} className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                                                            <div
                                                                className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                                                                onClick={() => navigate(`/product/${item.id}`)}
                                                            >
                                                                <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-gray-50">
                                                                    <img src={imgUrl} alt={item.title} className="w-full h-full object-cover" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="text-xs font-bold text-gray-800 truncate hover:text-[#008f3f] transition-colors">{item.title}</h4>
                                                                    <p className="text-xs font-semibold text-gray-900 mt-1">{Number(item.price).toLocaleString('vi-VN')}đ</p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleRemoveFavorite(item.id)}
                                                                className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                                                title="Bỏ thích"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>



                        {/* ROW 3: Security & Spacer */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                            {/* Empty spacer to align with left columns */}
                            <div className="lg:col-span-7 hidden lg:block"></div>
                            {/* Security */}
                            <div className="lg:col-span-5">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="bg-[#f0f4f8] px-6 py-4 flex items-center gap-2 border-b border-gray-100">
                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                        <h3 className="font-semibold text-gray-800">Security</h3>
                                    </div>
                                    <div className="p-6 space-y-5">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-3 tracking-wider">CHANGE PASSWORD</p>
                                            <div className="space-y-3">
                                                <input type="password" placeholder="Current Password" value={securityForm.currentPassword} onChange={e => setSecurityForm(p => ({ ...p, currentPassword: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:border-[#008f3f]" />
                                                <input type="password" placeholder="New Password" value={securityForm.newPassword} onChange={e => setSecurityForm(p => ({ ...p, newPassword: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:border-[#008f3f]" />
                                                <input type="password" placeholder="Confirm New Password" value={securityForm.confirmPassword} onChange={e => setSecurityForm(p => ({ ...p, confirmPassword: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:border-[#008f3f]" />
                                            </div>
                                        </div>

                                        <hr className="border-gray-100" />

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">Two-Factor Auth</p>
                                                <p className="text-[10px] font-bold text-[#008f3f] uppercase mt-0.5 tracking-wider">Currently Active</p>
                                            </div>
                                            <div className="w-10 h-5 bg-[#008f3f] rounded-full relative cursor-pointer">
                                                <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-8 flex justify-end gap-4 items-center">
                        <button onClick={handleCancel} className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">Cancel</button>
                        <button onClick={handleSave} disabled={loading} className="px-6 py-2.5 bg-[#008f3f] text-white text-sm font-bold rounded-lg shadow-sm hover:bg-[#007a36] transition-colors disabled:opacity-70">
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>




                </div>
            </main>
        </>
    );
};

export default Profile;
