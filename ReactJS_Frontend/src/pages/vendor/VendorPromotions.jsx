import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const fmt = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";

const VendorPromotions = ({ shop }) => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [couponModal, setCouponModal] = useState({ open: false, editing: null });
    const [couponForm, setCouponForm] = useState({
        code: "",
        type: "percent",
        value: "",
        minOrderAmount: "",
        maxDiscount: "",
        usageLimit: "",
        expiresAt: ""
    });

    useEffect(() => {
        if (!shop) return;
        fetchCoupons();
    }, [shop]);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${API_URL}/api/coupons/shop`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setCoupons(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCouponSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("accessToken");
        const isEditing = !!couponModal.editing;
        const url = isEditing
            ? `${API_URL}/api/coupons/${couponModal.editing}`
            : `${API_URL}/api/coupons`;
        const method = isEditing ? "PUT" : "POST";

        try {
            const body = {
                code: couponForm.code.trim().toUpperCase(),
                type: couponForm.type,
                value: Number(couponForm.value),
                minOrderAmount: couponForm.minOrderAmount ? Number(couponForm.minOrderAmount) : 0,
                maxDiscount: couponForm.maxDiscount ? Number(couponForm.maxDiscount) : null,
                usageLimit: couponForm.usageLimit ? Number(couponForm.usageLimit) : null,
                expiresAt: couponForm.expiresAt || null
            };

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Thao tác thất bại.");

            setCouponModal({ open: false, editing: null });
            fetchCoupons();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleCouponDelete = async (id) => {
        if (!confirm("Xóa mã giảm giá này?")) return;
        const token = localStorage.getItem("accessToken");
        try {
            const res = await fetch(`${API_URL}/api/coupons/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) fetchCoupons();
            else {
                const data = await res.json();
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-extrabold text-gray-900">Quản lý khuyến mãi</h1>
                    <button
                        onClick={() => {
                            setCouponForm({ code: "", type: "percent", value: "", minOrderAmount: "", maxDiscount: "", usageLimit: "", expiresAt: "" });
                            setCouponModal({ open: true, editing: null });
                        }}
                        className="px-5 py-2.5 bg-[#00b14f] hover:bg-green-600 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        Tạo mã giảm giá mới
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-[#00b14f] border-t-transparent rounded-full" /></div>
                ) : coupons.length === 0 ? (
                    <div className="bg-white border border-gray-100 p-12 text-center rounded-2xl shadow-xs text-gray-400 text-sm">Chưa có mã giảm giá nào được tạo.</div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase">Mã Code</th>
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase">Loại</th>
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase">Giá trị giảm</th>
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase">Đơn tối thiểu</th>
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase">Lượt dùng</th>
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase">Hạn dùng</th>
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-sm">
                                    {coupons.map(c => (
                                        <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4 font-bold text-gray-900 uppercase">{c.code}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${c.type === "percent" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}>
                                                    {c.type === "percent" ? "Phần trăm" : "Cố định"}
                                                </span>
                                            </td>
                                            <td className="p-4 font-extrabold text-gray-800">{c.type === "percent" ? `${c.value}%` : fmt(c.value)}</td>
                                            <td className="p-4 text-gray-500">{fmt(c.minOrderAmount)}</td>
                                            <td className="p-4 text-gray-500">{c.usedCount} / {c.usageLimit || "∞"}</td>
                                            <td className="p-4 text-gray-400 text-xs">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Vô hạn"}</td>
                                            <td className="p-4 text-right space-x-1">
                                                <button
                                                    onClick={() => {
                                                        setCouponForm({
                                                            code: c.code || "",
                                                            type: c.type || "percent",
                                                            value: c.value || "",
                                                            minOrderAmount: c.minOrderAmount || "",
                                                            maxDiscount: c.maxDiscount || "",
                                                            usageLimit: c.usageLimit || "",
                                                            expiresAt: c.expiresAt ? c.expiresAt.substring(0, 10) : ""
                                                        });
                                                        setCouponModal({ open: true, editing: c.id });
                                                    }}
                                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                                                    title="Chỉnh sửa"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                <button onClick={() => handleCouponDelete(c.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center" title="Xóa">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* COUPON MODAL */}
            {couponModal.open && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8 relative">
                        <button
                            onClick={() => setCouponModal({ open: false, editing: null })}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
                        >
                            ✕
                        </button>
                        <h2 className="text-xl font-extrabold text-gray-900 mb-6">{couponModal.editing ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá mới"}</h2>
                        <form onSubmit={handleCouponSubmit} className="space-y-4 text-left">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Mã Code *</label>
                                    <input
                                        type="text"
                                        value={couponForm.code}
                                        onChange={(e) => setCouponForm(prev => ({ ...prev, code: e.target.value }))}
                                        placeholder="SALE50"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00b14f]"
                                        required
                                        disabled={!!couponModal.editing}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Loại mã *</label>
                                    <select
                                        value={couponForm.type}
                                        onChange={(e) => setCouponForm(prev => ({ ...prev, type: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00b14f]"
                                    >
                                        <option value="percent">Phần trăm (%)</option>
                                        <option value="fixed">Số tiền cố định (đ)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Giá trị giảm *</label>
                                    <input
                                        type="number"
                                        value={couponForm.value}
                                        onChange={(e) => setCouponForm(prev => ({ ...prev, value: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00b14f]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Đơn tối thiểu (đ)</label>
                                    <input
                                        type="number"
                                        value={couponForm.minOrderAmount}
                                        onChange={(e) => setCouponForm(prev => ({ ...prev, minOrderAmount: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00b14f]"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Giảm tối đa (đ)</label>
                                    <input
                                        type="number"
                                        value={couponForm.maxDiscount}
                                        onChange={(e) => setCouponForm(prev => ({ ...prev, maxDiscount: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00b14f]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Giới hạn sử dụng</label>
                                    <input
                                        type="number"
                                        value={couponForm.usageLimit}
                                        onChange={(e) => setCouponForm(prev => ({ ...prev, usageLimit: e.target.value }))}
                                        placeholder="Ví dụ: 100"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00b14f]"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Ngày hết hạn</label>
                                <input
                                    type="date"
                                    value={couponForm.expiresAt}
                                    onChange={(e) => setCouponForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00b14f]"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-[#00b14f] hover:bg-green-600 text-white font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer"
                            >
                                Lưu mã giảm giá
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default VendorPromotions;
