import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const VendorShippers = ({ shop }) => {
    const [shippers, setShippers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingShipper, setEditingShipper] = useState(null);
    
    // Form state
    const [form, setForm] = useState({ name: "", phone: "", vehicle: "Xe máy", status: "active" });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // Shipper orders modal state
    const [showOrdersModal, setShowOrdersModal] = useState(false);
    const [selectedShipper, setSelectedShipper] = useState(null);
    const [shipperOrders, setShipperOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    useEffect(() => {
        if (!shop) return;
        fetchShippers();
    }, [shop]);

    const fetchShippers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${API_URL}/api/shippers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setShippers(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAdd = () => {
        setEditingShipper(null);
        setForm({ name: "", phone: "", vehicle: "Xe máy", status: "active" });
        setErrors({});
        setShowModal(true);
    };

    const handleOpenEdit = (shipper) => {
        setEditingShipper(shipper);
        setForm({
            name: shipper.name,
            phone: shipper.phone,
            vehicle: shipper.vehicle || "Xe máy",
            status: shipper.status || "active"
        });
        setErrors({});
        setShowModal(true);
    };

    const validateForm = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = "Vui lòng nhập họ tên shipper.";
        if (!form.phone.trim()) errs.phone = "Vui lòng nhập số điện thoại.";
        else if (!/^\d{10,11}$/.test(form.phone.trim())) errs.phone = "Số điện thoại không hợp lệ (10-11 chữ số).";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        const token = localStorage.getItem("accessToken");
        const url = editingShipper 
            ? `${API_URL}/api/shippers/${editingShipper.id}` 
            : `${API_URL}/api/shippers`;
        const method = editingShipper ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Không thể lưu thông tin shipper.");
            
            setShowModal(false);
            fetchShippers();
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Bạn có chắc chắn muốn xóa shipper này không?")) return;
        const token = localStorage.getItem("accessToken");
        try {
            const res = await fetch(`${API_URL}/api/shippers/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Xóa shipper thất bại.");
            fetchShippers();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleViewOrders = async (shipper) => {
        setSelectedShipper(shipper);
        setShowOrdersModal(true);
        setLoadingOrders(true);
        setShipperOrders([]);
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${API_URL}/api/shippers/${shipper.id}/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setShipperOrders(data || []);
            } else {
                alert(data.message || "Không thể lấy danh sách đơn hàng.");
            }
        } catch (err) {
            console.error(err);
            alert("Lỗi hệ thống khi tải đơn hàng.");
        } finally {
            setLoadingOrders(false);
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case "delivered": return "bg-green-50 text-green-600 border border-green-100";
            case "cancelled": return "bg-red-50 text-red-500 border border-red-100";
            case "shipping": return "bg-purple-50 text-purple-600 border border-purple-100";
            case "preparing": return "bg-orange-50 text-orange-600 border border-orange-100";
            case "confirmed": return "bg-blue-50 text-blue-600 border border-blue-100";
            case "cancel_requested": return "bg-amber-50 text-amber-600 border border-amber-100 animate-pulse";
            default: return "bg-gray-50 text-gray-500 border border-gray-100";
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "pending": return "Chờ xác nhận";
            case "confirmed": return "Đã xác nhận";
            case "preparing": return "Đang chuẩn bị";
            case "shipping": return "Đang giao";
            case "delivered": return "Đã giao";
            case "cancelled": return "Đã hủy";
            case "cancel_requested": return "Yêu cầu hủy";
            default: return status;
        }
    };

    const fmt = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">Quản lý Shipper</h1>
                    <p className="text-sm text-gray-400 mt-1">Danh sách nhân viên giao hàng của shop của bạn</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="bg-[#00b14f] hover:bg-[#009943] text-white font-bold px-4 py-2.5 rounded-xl transition-all text-sm flex items-center gap-2 shadow-sm hover:shadow"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                    </svg>
                    Thêm Shipper
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-2 border-[#00b14f] border-t-transparent rounded-full" />
                </div>
            ) : shippers.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-150 p-12 text-center text-gray-500">
                    <div className="text-4xl mb-3">🚚</div>
                    <p className="font-semibold text-gray-700">Chưa có shipper nào</p>
                    <p className="text-xs text-gray-400 mt-1">Vui lòng thêm shipper để giao các đơn hàng đã xác nhận.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/75 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                <th className="p-4">Họ và tên</th>
                                <th className="p-4">Số điện thoại</th>
                                <th className="p-4">Phương tiện</th>
                                <th className="p-4">Trạng thái</th>
                                <th className="p-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {shippers.map((s) => (
                                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 font-bold text-gray-900">{s.name}</td>
                                    <td className="p-4 text-gray-600 font-mono">{s.phone}</td>
                                    <td className="p-4 text-gray-600">{s.vehicle || "—"}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                            s.status === "active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                                        }`}>
                                            {s.status === "active" ? "Hoạt động" : "Tạm nghỉ"}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2.5">
                                            {/* Button to view all orders managed by shipper */}
                                            <button
                                                onClick={() => handleViewOrders(s)}
                                                className="p-1.5 hover:bg-green-50 text-[#00b14f] rounded-lg transition-colors cursor-pointer"
                                                title="Xem đơn hàng phụ trách"
                                            >
                                                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleOpenEdit(s)}
                                                className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors cursor-pointer"
                                                title="Sửa"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(s.id)}
                                                className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors cursor-pointer"
                                                title="Xóa"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Shipper Form Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-150 animate-in fade-in zoom-in-95 duration-150">
                        {/* Header */}
                        <div className="bg-linear-to-r from-[#00b14f] to-[#009943] px-6 py-4 text-white flex items-center justify-between">
                            <h3 className="font-extrabold text-base">
                                {editingShipper ? "Chỉnh sửa Shipper" : "Thêm Shipper mới"}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-white hover:text-gray-200 transition-colors text-lg font-bold cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Họ và tên *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Ví dụ: Nguyễn Văn Nam"
                                    className={`w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none transition-all ${
                                        errors.name ? "border-red-400 focus:ring-1 focus:ring-red-150" : "border-gray-200 focus:border-[#00b14f] focus:ring-1 focus:ring-green-100"
                                    }`}
                                />
                                {errors.name && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Số điện thoại *</label>
                                <input
                                    type="text"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    placeholder="Ví dụ: 0987654321"
                                    className={`w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none transition-all ${
                                        errors.phone ? "border-red-400 focus:ring-1 focus:ring-red-150" : "border-gray-200 focus:border-[#00b14f] focus:ring-1 focus:ring-green-100"
                                    }`}
                                />
                                {errors.phone && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.phone}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Phương tiện</label>
                                <input
                                    type="text"
                                    value={form.vehicle}
                                    onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
                                    placeholder="Ví dụ: Xe máy, Xe ba gác, Xe tải"
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#00b14f] focus:ring-1 focus:ring-green-100 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Trạng thái</label>
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#00b14f] focus:ring-1 focus:ring-green-100 transition-all bg-white"
                                >
                                    <option value="active">Hoạt động</option>
                                    <option value="inactive">Tạm nghỉ</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-2.5 bg-[#00b14f] hover:bg-[#009943] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-60 cursor-pointer"
                                >
                                    {submitting ? "Đang xử lý..." : editingShipper ? "Cập nhật" : "Thêm mới"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Shipper Orders Modal */}
            {showOrdersModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-gray-150 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
                        {/* Header */}
                        <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white flex items-center justify-between shrink-0">
                            <h3 className="font-extrabold text-base flex items-center gap-2">
                                <span>📦</span>
                                Đơn hàng do shipper: {selectedShipper?.name} phụ trách
                            </h3>
                            <button
                                onClick={() => setShowOrdersModal(false)}
                                className="text-white hover:text-gray-200 transition-colors text-lg font-bold cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-1 bg-gray-55">
                            {loadingOrders ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
                                </div>
                            ) : shipperOrders.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
                                    <div className="text-3xl mb-2">📦</div>
                                    <p className="font-bold text-gray-700">Chưa phụ trách đơn hàng nào</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Shipper này hiện tại chưa có đơn hàng nào được gán giao.</p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                <th className="p-4">Mã ĐH</th>
                                                <th className="p-4">Người nhận / Liên hệ</th>
                                                <th className="p-4">Địa chỉ giao hàng</th>
                                                <th className="p-4">Tổng tiền</th>
                                                <th className="p-4">Trạng thái</th>
                                                <th className="p-4">Ngày giao</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-sm">
                                            {shipperOrders.map((o) => (
                                                <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="p-4 font-bold text-gray-900">#{o.id}</td>
                                                    <td className="p-4">
                                                        <div className="font-bold text-gray-800">
                                                            {o.shippingAddress?.fullName || o.shippingAddress?.name || "Ẩn danh"}
                                                        </div>
                                                        <div className="text-[11px] text-gray-400 font-semibold mt-0.5">
                                                            {o.shippingAddress?.phone || "N/A"}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-gray-600 max-w-50 truncate" title={o.shippingAddress?.street}>
                                                        {o.shippingAddress?.street || "—"}
                                                    </td>
                                                    <td className="p-4 font-bold text-gray-900">{fmt(o.total)}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusBadgeClass(o.status)}`}>
                                                            {getStatusLabel(o.status)}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-gray-500 font-medium">
                                                        {new Date(o.createdAt).toLocaleDateString("vi-VN")}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 flex justify-end shrink-0">
                            <button
                                type="button"
                                onClick={() => setShowOrdersModal(false)}
                                className="px-5 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all cursor-pointer shadow-xs"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorShippers;
