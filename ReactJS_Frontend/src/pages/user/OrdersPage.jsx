import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/user/Header";
import Footer from "../../components/user/Footer";
import Breadcrumb from "../../components/Breadcrumb";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const fmt = (n) => Number(n).toLocaleString("vi-VN") + "đ";

const STATUS_CONFIG = {
    pending: { label: "Đơn hàng mới", color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
    confirmed: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
    preparing: { label: "Đang chuẩn bị", color: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
    shipping: { label: "Đang giao hàng", color: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
    delivered: { label: "Đã giao thành công", color: "bg-green-100 text-green-700", dot: "bg-green-500" },
    cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-700", dot: "bg-red-500" },
    cancel_requested: { label: "Yêu cầu hủy", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
    refunded: { label: "Đã hoàn tiền", color: "bg-gray-100 text-gray-600", dot: "bg-gray-500" },
};

const TABS = [
    { key: "all", label: "Tất cả" },
    { key: "pending,confirmed,preparing,shipping", label: "Đang xử lý" },
    { key: "delivered", label: "Đã giao" },
    { key: "cancelled", label: "Đã hủy" },
];

const OrdersPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [orders, setOrders] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState("all");
    const [search, setSearch] = useState("");
    const [cancelLoading, setCancelLoading] = useState({});
    const [cancelMsg, setCancelMsg] = useState({});
    const [successBanner, setSuccessBanner] = useState(location.state?.success || false);

    const fetchOrders = useCallback(async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) { navigate("/login"); return; }
        setLoading(true);
        try {
            const statusParam = tab !== "all" ? `&status=${tab}` : "";
            const res = await fetch(`${API_URL}/api/orders/me?limit=50${statusParam}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            let rows = data.orders || [];
            if (search.trim()) {
                const q = search.trim().toLowerCase();
                rows = rows.filter(o =>
                    String(o.id).includes(q) ||
                    o.items?.some(i => i.productTitle?.toLowerCase().includes(q))
                );
            }
            setOrders(rows);
            setTotal(data.total || 0);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [tab, search, navigate]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    useEffect(() => {
        if (successBanner) {
            const t = setTimeout(() => setSuccessBanner(false), 5000);
            return () => clearTimeout(t);
        }
    }, [successBanner]);

    const handleCancel = async (orderId) => {
        if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;
        const token = localStorage.getItem("accessToken");
        setCancelLoading((p) => ({ ...p, [orderId]: true }));
        setCancelMsg((p) => ({ ...p, [orderId]: null }));
        try {
            const res = await fetch(`${API_URL}/api/orders/${orderId}/cancel`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ reason: "Người dùng hủy đơn" })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Không thể hủy đơn.");
            setCancelMsg((p) => ({
                ...p,
                [orderId]: data.status === "cancel_requested"
                    ? "Đã gửi yêu cầu hủy đơn cho shop."
                    : "Hủy đơn thành công."
            }));
            await fetchOrders();
        } catch (err) {
            setCancelMsg((p) => ({ ...p, [orderId]: err.message }));
        } finally {
            setCancelLoading((p) => ({ ...p, [orderId]: false }));
        }
    };

    const canCancel = (order) => {
        if (!["pending", "confirmed", "preparing"].includes(order.status)) return false;
        const diff = Date.now() - new Date(order.createdAt).getTime();
        return diff < 30 * 60 * 1000 || order.status === "preparing";
    };

    const annualSpend = orders
        .filter(o => o.status === "delivered" && new Date(o.createdAt).getFullYear() === new Date().getFullYear())
        .reduce((s, o) => s + Number(o.total), 0);

    return (
        <div className="min-h-screen bg-[#f8f9fb] flex flex-col">
            <Header />
            <Breadcrumb align="viewport"/>
            <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full">
                {/* Success Banner */}
                {successBanner && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        <span className="font-semibold">Đặt hàng thành công! Đơn hàng của bạn đang được xử lý.</span>
                        <button onClick={() => setSuccessBanner(false)} className="ml-auto text-green-500 hover:text-green-700">✕</button>
                    </div>
                )}

                <div className="flex items-start justify-between mb-2">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">Order History</h1>
                        <p className="text-gray-400 text-sm mt-1">Track your recent purchases and manage your orders.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Export List
                        </button>
                        <button onClick={() => navigate("/products")} className="flex items-center gap-2 px-4 py-2 bg-[#00b14f] text-white rounded-lg text-sm font-semibold hover:bg-[#009943] transition-colors">
                            + New Purchase
                        </button>
                    </div>
                </div>

                <div className="flex gap-6 mt-6">
                    {/* Left — Orders */}
                    <div className="flex-1 min-w-0">
                        {/* Tabs */}
                        <div className="flex gap-1 border-b border-gray-200 mb-4">
                            {TABS.map((t) => (
                                <button
                                    key={t.key}
                                    onClick={() => setTab(t.key)}
                                    className={`px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                                        tab === t.key
                                            ? "border-[#00b14f] text-[#00b14f]"
                                            : "border-transparent text-gray-500 hover:text-gray-800"
                                    }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="flex items-center bg-white border border-gray-200 rounded-lg px-4 py-2.5 mb-4 gap-3">
                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input
                                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                                placeholder="Tìm đơn hàng, sản phẩm hoặc mã đơn..."
                                className="flex-1 text-sm focus:outline-none text-gray-700 placeholder-gray-400"
                            />
                        </div>

                        {/* Orders List */}
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin w-10 h-10 border-2 border-[#00b14f] border-t-transparent rounded-full" />
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-20 text-gray-400">
                                <svg className="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                <p className="font-semibold text-gray-600">Không có đơn hàng nào</p>
                                <p className="text-sm mt-1">Hãy đặt hàng để bắt đầu.</p>
                                <button onClick={() => navigate("/products")} className="mt-4 px-6 py-2 bg-[#00b14f] text-white rounded-lg text-sm font-semibold hover:bg-[#009943]">
                                    Mua ngay
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => {
                                    const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                                    return (
                                        <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                            {/* Header */}
                                            <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs text-gray-500">
                                                <div className="flex gap-5">
                                                    <span>ĐẶT NGÀY <strong className="text-gray-700">{new Date(order.createdAt).toLocaleDateString("vi-VN")}</strong></span>
                                                    <span>TỔNG <strong className="text-gray-700">{fmt(order.total)}</strong></span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span>ĐƠN HÀNG #{order.id}</span>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${sc.color}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                                                        {sc.label}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Body */}
                                            <div className="p-5">
                                                {/* Items preview */}
                                                <div className="flex gap-3 mb-4">
                                                    {(order.items || []).slice(0, 3).map((item) => {
                                                        const imgSrc = item.productImage
                                                            ? (item.productImage.startsWith("http") ? item.productImage : `${API_URL}${item.productImage}`)
                                                            : null;
                                                        return (
                                                            <div key={item.id} className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                                                                {imgSrc
                                                                    ? <img src={imgSrc} alt={item.productTitle} className="w-full h-full object-cover" />
                                                                    : <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                                                                }
                                                            </div>
                                                        );
                                                    })}
                                                    {order.items?.length > 3 && (
                                                        <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500">
                                                            +{order.items.length - 3}
                                                        </div>
                                                    )}
                                                    <div className="ml-2 flex-1">
                                                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                                                            {order.items?.[0]?.productTitle}
                                                            {order.items?.length > 1 && ` và ${order.items.length - 1} sản phẩm khác`}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-0.5">{order.items?.length || 0} sản phẩm</p>
                                                    </div>
                                                </div>

                                                {/* Cancel message */}
                                                {cancelMsg[order.id] && (
                                                    <p className={`text-xs mb-3 font-medium ${cancelMsg[order.id].includes("thành công") || cancelMsg[order.id].includes("gửi") ? "text-green-600" : "text-red-500"}`}>
                                                        {cancelMsg[order.id]}
                                                    </p>
                                                )}

                                                {/* Actions */}
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => navigate(`/orders/${order.id}`)}
                                                        className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                        Xem chi tiết
                                                    </button>
                                                    {["shipping", "delivered"].includes(order.status) && (
                                                        <button
                                                            onClick={() => navigate(`/orders/${order.id}`)}
                                                            className="flex items-center gap-1.5 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-xs font-semibold text-green-700 hover:bg-green-100 transition-colors"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                                            Track Package
                                                        </button>
                                                    )}
                                                    {canCancel(order) && (
                                                        <button
                                                            onClick={() => handleCancel(order.id)}
                                                            disabled={cancelLoading[order.id]}
                                                            className="flex items-center gap-1.5 px-4 py-2 border border-red-200 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                                                        >
                                                            {cancelLoading[order.id] ? "Đang xử lý..." : order.status === "preparing" ? "Gửi yêu cầu hủy" : "Hủy đơn"}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Right — Stats */}
                    <div className="w-64 flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-6">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Annual Spend</h3>
                            <p className="text-3xl font-extrabold text-gray-900">{fmt(annualSpend)}</p>
                            <p className="text-xs text-gray-400 mt-1">{orders.filter(o => o.status === "delivered").length} đơn đã giao trong năm nay</p>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
                                <div className="bg-[#00b14f] h-1.5 rounded-full" style={{ width: "60%" }} />
                            </div>
                            <button className="mt-4 text-xs text-[#00b14f] font-semibold hover:underline">View Report →</button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default OrdersPage;
