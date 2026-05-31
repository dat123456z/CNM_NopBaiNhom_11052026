import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const fmt = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";

const VendorOrders = ({ shop }) => {
    const [orders, setOrders] = useState([]);
    const [shippers, setShippers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!shop) return;
        fetchOrders();
        fetchShippers();
    }, [shop]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${API_URL}/api/orders/shop`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setOrders(data.orders || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchShippers = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${API_URL}/api/shippers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setShippers(data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleOrderConfirm = async (orderId) => {
        const token = localStorage.getItem("accessToken");
        try {
            const res = await fetch(`${API_URL}/api/orders/${orderId}/confirm`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) fetchOrders();
            else {
                const data = await res.json();
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleOrderStatusChange = async (orderId, newStatus) => {
        const token = localStorage.getItem("accessToken");
        try {
            const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) fetchOrders();
            else {
                const data = await res.json();
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAssignShipper = async (orderId, shipperId) => {
        const token = localStorage.getItem("accessToken");
        try {
            const res = await fetch(`${API_URL}/api/orders/${orderId}/shipper`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ shipperId: shipperId ? Number(shipperId) : null })
            });
            if (res.ok) fetchOrders();
            else {
                const data = await res.json();
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
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

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-extrabold text-gray-900">Danh sách đơn hàng</h1>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-2 border-[#00b14f] border-t-transparent rounded-full" />
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-white border border-gray-100 p-12 text-center rounded-2xl shadow-xs text-gray-400 text-sm">
                    Chưa có đơn hàng nào từ người mua.
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Mã ĐH</th>
                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Khách hàng / Địa chỉ</th>
                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Tổng tiền</th>
                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Thanh toán</th>
                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Trạng thái</th>
                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Shipper giao hàng</th>
                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {orders.map(o => (
                                    <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 font-bold text-gray-900">#{o.id}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-gray-800">
                                                {o.shippingAddress?.fullName || o.shippingAddress?.name || "Ẩn danh"}
                                            </div>

                                        </td>
                                        <td className="p-4 font-extrabold text-gray-900">{fmt(o.total)}</td>
                                        <td className="p-4">
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${o.paymentMethod === "vnpay" ? "bg-blue-50 text-blue-600" : o.paymentMethod === "momo" ? "bg-pink-50 text-pink-600" : "bg-gray-100 text-gray-500"}`}>
                                                {o.paymentMethod?.toUpperCase() || "COD"}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusBadgeClass(o.status)}`}>
                                                {getStatusLabel(o.status)}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {/* Shipper Selection after Confirming */}
                                            {o.status !== "pending" && o.status !== "cancelled" && o.status !== "delivered" ? (
                                                <select
                                                    value={o.shipperId || ""}
                                                    onChange={(e) => handleAssignShipper(o.id, e.target.value)}
                                                    className="border border-gray-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-[#00b14f] bg-white w-full max-w-[150px] font-medium"
                                                >
                                                    <option value="">-- Chọn Shipper --</option>
                                                    {shippers.filter(s => s.status === "active").map(s => (
                                                        <option key={s.id} value={s.id}>
                                                            🚚 {s.name} ({s.phone})
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <div className="text-xs text-gray-500 font-medium">
                                                    {o.shipper ? (
                                                        <span className="flex items-center gap-1">
                                                            <span>🚚</span>
                                                            <strong className="text-gray-800">{o.shipper.name}</strong>
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-300">—</span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            {o.status === "pending" && (
                                                <button
                                                    onClick={() => handleOrderConfirm(o.id)}
                                                    className="px-3 py-1.5 bg-[#00b14f] hover:bg-green-600 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-sm hover:shadow"
                                                >
                                                    Xác nhận Đơn hàng
                                                </button>
                                            )}
                                            {o.status !== "pending" && o.status !== "delivered" && o.status !== "cancelled" && (
                                                <select
                                                    value={o.status}
                                                    onChange={(e) => handleOrderStatusChange(o.id, e.target.value)}
                                                    className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#00b14f] bg-white font-semibold"
                                                >
                                                    {o.status === "confirmed" && (
                                                        <>
                                                            <option value="confirmed">Đã xác nhận</option>
                                                            <option value="preparing">Đang chuẩn bị</option>
                                                            <option value="cancelled">Hủy đơn</option>
                                                        </>
                                                    )}
                                                    {o.status === "preparing" && (
                                                        <>
                                                            <option value="preparing">Đang chuẩn bị</option>
                                                            <option value="shipping">Bắt đầu giao</option>
                                                            <option value="cancelled">Hủy đơn</option>
                                                        </>
                                                    )}
                                                    {o.status === "shipping" && (
                                                        <>
                                                            <option value="shipping">Đang giao</option>
                                                            <option value="delivered">Hoàn thành giao</option>
                                                        </>
                                                    )}
                                                    {o.status === "cancel_requested" && (
                                                        <>
                                                            <option value="cancel_requested">Yêu cầu hủy đơn</option>
                                                            <option value="cancelled">Đồng ý hủy</option>
                                                            <option value="preparing">Từ chối hủy (Chuẩn bị tiếp)</option>
                                                        </>
                                                    )}
                                                </select>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorOrders;
