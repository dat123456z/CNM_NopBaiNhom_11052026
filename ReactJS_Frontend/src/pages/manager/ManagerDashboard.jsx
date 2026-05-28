import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ManagerDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard', 'vendors', 'moderation'
    
    // States for statistics
    const [stats, setStats] = useState({
        totalVendors: 0,
        verifiedPercentage: 0,
        totalRevenue: 0,
        avgRating: 0,
        categoryDistribution: [],
        alerts: []
    });
    const [statsLoading, setStatsLoading] = useState(true);

    // States for vendors
    const [vendors, setVendors] = useState([]);
    const [vendorsLoading, setVendorsLoading] = useState(true);
    const [vendorSearch, setVendorSearch] = useState("");
    const [vendorStatusFilter, setVendorStatusFilter] = useState("all"); // 'all', 'active', 'pending', 'suspended'

    // States for products moderation
    const [pendingProducts, setPendingProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [moderationMessage, setModerationMessage] = useState("");

    // Message notification state
    const [toast, setToast] = useState(null);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Authentication token and headers
    const token = localStorage.getItem("accessToken");
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    };

    // Check manager role
    useEffect(() => {
        const userRaw = localStorage.getItem("user");
        if (userRaw) {
            try {
                const user = JSON.parse(userRaw);
                if (user?.role !== "manager" && user?.role !== "admin") {
                    showToast("Bạn không có quyền truy cập vào trang này.", "error");
                    navigate("/", { replace: true });
                }
            } catch (e) {
                navigate("/login", { replace: true });
            }
        } else {
            navigate("/login", { replace: true });
        }
    }, [navigate]);

    // Fetch Stats
    const fetchStats = async () => {
        try {
            setStatsLoading(true);
            const res = await fetch(`${API_URL}/api/shops/manager/stats`, { headers });
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (err) {
            console.error("Error fetching manager stats:", err);
        } finally {
            setStatsLoading(false);
        }
    };

    // Fetch Vendors
    const fetchVendors = async () => {
        try {
            setVendorsLoading(true);
            let url = `${API_URL}/api/shops?limit=100`;
            if (vendorStatusFilter !== "all") {
                url += `&status=${vendorStatusFilter}`;
            }
            if (vendorSearch.trim()) {
                url += `&search=${encodeURIComponent(vendorSearch)}`;
            }
            const res = await fetch(url, { headers });
            if (res.ok) {
                const data = await res.json();
                setVendors(data.shops || []);
            }
        } catch (err) {
            console.error("Error fetching vendors:", err);
        } finally {
            setVendorsLoading(false);
        }
    };

    // Fetch Pending Products
    const fetchPendingProducts = async () => {
        try {
            setProductsLoading(true);
            const res = await fetch(`${API_URL}/api/products/manager/queue?status=pending`, { headers });
            if (res.ok) {
                const data = await res.json();
                const queue = data.products || [];
                setPendingProducts(queue);
                if (queue.length > 0) {
                    setSelectedProduct(queue[0]);
                } else {
                    setSelectedProduct(null);
                }
            }
        } catch (err) {
            console.error("Error fetching pending products:", err);
        } finally {
            setProductsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        if (activeTab === "vendors") {
            fetchVendors();
        } else if (activeTab === "moderation") {
            fetchPendingProducts();
        } else if (activeTab === "dashboard") {
            fetchStats();
        }
    }, [activeTab, vendorStatusFilter, vendorSearch]);

    // Handle Vendor status change
    const handleUpdateVendorStatus = async (shopId, newStatus) => {
        try {
            const res = await fetch(`${API_URL}/api/shops/${shopId}/status`, {
                method: "PATCH",
                headers,
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                showToast(`Đã chuyển trạng thái shop thành ${newStatus.toUpperCase()}`);
                fetchVendors();
                fetchStats(); // Update alert list
            } else {
                const data = await res.json();
                showToast(data.message || "Không thể cập nhật trạng thái shop", "error");
            }
        } catch (err) {
            showToast("Có lỗi xảy ra khi cập nhật shop.", "error");
        }
    };

    // Handle Product moderation status change
    const handleUpdateProductStatus = async (productId, status) => {
        try {
            const res = await fetch(`${API_URL}/api/products/${productId}/moderation`, {
                method: "PATCH",
                headers,
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                showToast(`Đã duyệt sản phẩm với trạng thái: ${status}`);
                fetchPendingProducts();
            } else {
                const data = await res.json();
                showToast(data.message || "Cập nhật sản phẩm thất bại.", "error");
            }
        } catch (err) {
            showToast("Có lỗi xảy ra khi duyệt sản phẩm.", "error");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        navigate("/login");
    };

    // Format currency to VND
    const formatVND = (value) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND"
        }).format(value);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans">
            {/* TOAST ALERTS */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white font-medium transition-all ${
                    toast.type === "error" ? "bg-rose-600" : "bg-emerald-600"
                }`}>
                    {toast.message}
                </div>
            )}

            {/* SIDEBAR */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
                <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
                    <div className="bg-emerald-500 text-white font-bold p-2 rounded-lg text-xl flex items-center justify-center w-10 h-10 shadow-md shadow-emerald-500/20">
                        U
                    </div>
                    <div>
                        <h1 className="font-extrabold text-white text-lg tracking-wider">UTEShop</h1>
                        <span className="text-xs text-slate-500 font-semibold tracking-widest uppercase">Manager</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    <button
                        onClick={() => setActiveTab("dashboard")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition duration-200 ${
                            activeTab === "dashboard"
                                ? "bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-600/10"
                                : "hover:bg-slate-800 hover:text-white"
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                        </svg>
                        <span>Dashboard</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("vendors")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition duration-200 ${
                            activeTab === "vendors"
                                ? "bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-600/10"
                                : "hover:bg-slate-800 hover:text-white"
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span>Quản lý Shop</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("moderation")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition duration-200 relative ${
                            activeTab === "moderation"
                                ? "bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-600/10"
                                : "hover:bg-slate-800 hover:text-white"
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 00-2 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <span>Duyệt Sản Phẩm</span>
                        {pendingProducts.length > 0 && (
                            <span className="absolute right-4 bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                {pendingProducts.length}
                            </span>
                        )}
                    </button>
                </nav>

                <div className="p-4 border-t border-slate-800 space-y-2">
                    <button
                        onClick={() => navigate("/")}
                        className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white py-2 px-4 rounded-xl text-sm font-semibold transition"
                    >
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        <span>Về Trang Chủ</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 bg-rose-950/20 hover:bg-rose-900/40 text-rose-300 py-2 px-4 rounded-xl text-sm font-semibold transition"
                    >
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* MAIN MAIN CONTENT */}
            <main className="flex-1 flex flex-col overflow-y-auto">
                {/* HEADER */}
                <header className="bg-white h-20 border-b border-slate-200 px-8 flex items-center justify-between shadow-sm sticky top-0 z-10">
                    <div className="flex items-center space-x-2 text-sm text-slate-500">
                        <span className="font-semibold text-slate-700">Manager Dashboard</span>
                        <span>/</span>
                        <span className="capitalize">{activeTab}</span>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3 bg-slate-100 px-4 py-2 rounded-xl">
                            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                                M
                            </div>
                            <span className="text-sm font-semibold text-slate-700">Manager</span>
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-7xl w-full mx-auto space-y-8">
                    {/* ==================== TAB: DASHBOARD ==================== */}
                    {activeTab === "dashboard" && (
                        <div className="space-y-8">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tổng Quan Hệ Thống</h2>
                                    <p className="text-slate-500 mt-1">Giám sát hoạt động của các đối tác bán hàng trên UTEShop.</p>
                                </div>
                            </div>

                            {/* STATISTICS GRID */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-5">
                                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Tổng Đối Tác</span>
                                        <h3 className="text-2xl font-bold mt-0.5">{stats.totalVendors}</h3>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-5">
                                    <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Đã Kích Hoạt</span>
                                        <h3 className="text-2xl font-bold mt-0.5">{stats.verifiedPercentage}%</h3>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-5">
                                    <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16v1M10 21h4a2 2 0 002-2V7a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Tổng Doanh Thu</span>
                                        <h3 className="text-2xl font-bold mt-0.5">{formatVND(stats.totalRevenue)}</h3>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-5">
                                    <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl">
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.242.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.568-.386-1.81.588-1.81h4.907a1 1 0 00.95-.69l1.519-4.674z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Đánh Giá TB</span>
                                        <h3 className="text-2xl font-bold mt-0.5">{stats.avgRating} / 5</h3>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* ALERTS BOARD */}
                                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
                                    <h3 className="text-xl font-bold text-slate-900">Thông Báo Hoạt Động & Sự Cố</h3>
                                    <div className="space-y-4">
                                        {stats.alerts.map((alert) => (
                                            <div
                                                key={alert.id}
                                                className={`flex items-start space-x-3 p-4 rounded-2xl border transition duration-150 ${
                                                    alert.type === "warning"
                                                        ? "bg-amber-50 border-amber-200/60 text-amber-900"
                                                        : alert.type === "error"
                                                        ? "bg-rose-50 border-rose-200/60 text-rose-900"
                                                        : alert.type === "info"
                                                        ? "bg-blue-50 border-blue-200/60 text-blue-900"
                                                        : "bg-emerald-50 border-emerald-200/60 text-emerald-950"
                                                }`}
                                            >
                                                <div className="mt-0.5">
                                                    {alert.type === "warning" && (
                                                        <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                    {alert.type === "info" && (
                                                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                    {alert.type === "success" && (
                                                        <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="flex-1 flex justify-between items-center gap-2">
                                                    <span className="text-sm font-semibold">{alert.message}</span>
                                                    {alert.type === "warning" && (
                                                        <button
                                                            onClick={() => setActiveTab("vendors")}
                                                            className="text-xs bg-amber-200/60 text-amber-900 font-bold px-3 py-1 rounded-xl hover:bg-amber-200 transition shrink-0"
                                                        >
                                                            Đến duyệt Shop
                                                        </button>
                                                    )}
                                                    {alert.type === "info" && (
                                                        <button
                                                            onClick={() => setActiveTab("moderation")}
                                                            className="text-xs bg-blue-200/60 text-blue-900 font-bold px-3 py-1 rounded-xl hover:bg-blue-200 transition shrink-0"
                                                        >
                                                            Kiểm tra ngay
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* CATEGORY DISTRIBUTION */}
                                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">Phân Phối Danh Mục</h3>
                                        <p className="text-xs text-slate-500 mt-1">Biểu đồ thể hiện sự tập trung sản phẩm theo danh mục.</p>
                                    </div>

                                    {/* CUSTOM GRAPH */}
                                    <div className="flex items-end justify-around h-48 px-2 border-b border-slate-100">
                                        {stats.categoryDistribution.map((item, idx) => {
                                            const maxCount = Math.max(...stats.categoryDistribution.map(d => d.count), 1);
                                            const pct = (item.count / maxCount) * 100;
                                            return (
                                                <div key={idx} className="flex flex-col items-center group w-8 relative">
                                                    {/* Tooltip */}
                                                    <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10">
                                                        {item.category}: {item.count} sp
                                                    </div>
                                                    <div
                                                        style={{ height: `${pct}%` }}
                                                        className="w-full bg-emerald-600 group-hover:bg-emerald-500 rounded-t-lg transition-all duration-500 cursor-pointer min-h-[8px]"
                                                    ></div>
                                                    <span className="text-[10px] text-slate-400 mt-2 truncate w-12 text-center">{item.category}</span>
                                                </div>
                                            );
                                        })}
                                        {stats.categoryDistribution.length === 0 && (
                                            <span className="text-sm text-slate-400 pb-16">Chưa có dữ liệu</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ==================== TAB: VENDORS ==================== */}
                    {activeTab === "vendors" && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Danh Sách Đối Tác Bán Hàng</h2>
                                <p className="text-slate-500 mt-1">Duyệt thông tin đăng ký shop mới hoặc đình chỉ hoạt động shop vi phạm.</p>
                            </div>

                            {/* FILTERS & SEARCH */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                                <div className="flex flex-wrap gap-2">
                                    {["all", "pending", "active", "suspended"].map((filter) => (
                                        <button
                                            key={filter}
                                            onClick={() => setVendorStatusFilter(filter)}
                                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                                                vendorStatusFilter === filter
                                                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                                                    : "bg-slate-50 hover:bg-slate-100 text-slate-600"
                                            }`}
                                        >
                                            <span className="capitalize">{filter === "all" ? "Tất Cả" : filter === "pending" ? "Chờ Duyệt" : filter === "active" ? "Hoạt Động" : "Đình Chỉ"}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="relative w-full sm:w-72">
                                    <input
                                        type="text"
                                        placeholder="Tìm tên shop..."
                                        value={vendorSearch}
                                        onChange={(e) => setVendorSearch(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    />
                                    <svg className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>

                            {/* VENDORS TABLE */}
                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                {vendorsLoading ? (
                                    <div className="p-16 text-center text-slate-400 font-medium">Đang tải danh sách shop...</div>
                                ) : vendors.length === 0 ? (
                                    <div className="p-16 text-center text-slate-400 font-medium">Không tìm thấy cửa hàng nào phù hợp.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
                                                    <th className="px-6 py-4">Tên Cửa Hàng</th>
                                                    <th className="px-6 py-4">Người Đại Diện</th>
                                                    <th className="px-6 py-4">Liên Hệ</th>
                                                    <th className="px-6 py-4">Địa Chỉ</th>
                                                    <th className="px-6 py-4 text-center">Trạng Thái</th>
                                                    <th className="px-6 py-4 text-right">Hành Động</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 text-sm">
                                                {vendors.map((shop) => (
                                                    <tr key={shop.id} className="hover:bg-slate-50/80 transition duration-150">
                                                        <td className="px-6 py-4 flex items-center space-x-3">
                                                            <img
                                                                src={shop.logo || "https://images.unsplash.com/photo-1472851294608-062f824d296e?w=80"}
                                                                alt={shop.name}
                                                                className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                                                            />
                                                            <div>
                                                                <h4 className="font-bold text-slate-900">{shop.name}</h4>
                                                                <span className="text-xs text-slate-400">ID: {shop.id}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-medium text-slate-800">{shop.owner?.name || "Khách Hàng"}</div>
                                                            <span className="text-xs text-slate-400">{shop.owner?.email}</span>
                                                        </td>
                                                        <td className="px-6 py-4 font-medium text-slate-600">
                                                            {shop.phone || shop.owner?.phone || "Chưa có"}
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-500 font-medium max-w-xs truncate">
                                                            {shop.address || "Chưa cập nhật"}
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold leading-5 ${
                                                                shop.status === "active"
                                                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                                    : shop.status === "pending"
                                                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                                                    : "bg-rose-50 text-rose-700 border border-rose-200"
                                                            }`}>
                                                                {shop.status === "active" ? "Hoạt Động" : shop.status === "pending" ? "Chờ Duyệt" : "Đình Chỉ"}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right space-x-2 shrink-0">
                                                            {shop.status === "pending" && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleUpdateVendorStatus(shop.id, "active")}
                                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                                                                    >
                                                                        Duyệt Shop
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleUpdateVendorStatus(shop.id, "suspended")}
                                                                        className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                                                                    >
                                                                        Từ Chối
                                                                    </button>
                                                                </>
                                                            )}
                                                            {shop.status === "active" && (
                                                                <button
                                                                    onClick={() => handleUpdateVendorStatus(shop.id, "suspended")}
                                                                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                                                                >
                                                                    Tạm Khóa
                                                                </button>
                                                            )}
                                                            {shop.status === "suspended" && (
                                                                <button
                                                                    onClick={() => handleUpdateVendorStatus(shop.id, "active")}
                                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                                                                >
                                                                    Mở Khóa
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ==================== TAB: MODERATION ==================== */}
                    {activeTab === "moderation" && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Kiểm Duyệt Sản Phẩm</h2>
                                <p className="text-slate-500 mt-1">Đảm bảo các sản phẩm đăng bán đạt tiêu chuẩn chất lượng và nội dung quy định.</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* QUEUE LIST */}
                                <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 h-[650px] flex flex-col">
                                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                                        <span>Danh Sách Chờ Duyệt</span>
                                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">
                                            {pendingProducts.length} sản phẩm
                                        </span>
                                    </h3>

                                    {productsLoading ? (
                                        <div className="text-center text-slate-400 py-20 flex-1 flex items-center justify-center">Đang tải danh sách chờ...</div>
                                    ) : pendingProducts.length === 0 ? (
                                        <div className="text-center text-slate-400 py-20 flex-1 flex items-center justify-center font-medium">Không có sản phẩm nào chờ duyệt.</div>
                                    ) : (
                                        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                                            {pendingProducts.map((prod) => (
                                                <div
                                                    key={prod.id}
                                                    onClick={() => setSelectedProduct(prod)}
                                                    className={`p-3 rounded-2xl border transition duration-150 cursor-pointer flex items-center space-x-3 ${
                                                        selectedProduct?.id === prod.id
                                                            ? "bg-slate-900 text-white border-slate-900"
                                                            : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                                                    }`}
                                                >
                                                    <img
                                                        src={prod.image || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=80"}
                                                        alt={prod.title}
                                                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-sm truncate">{prod.title}</h4>
                                                        <p className={`text-xs ${
                                                            selectedProduct?.id === prod.id ? "text-slate-400" : "text-slate-500"
                                                        } truncate`}>
                                                            Shop: {prod.shop?.name || "Elite Tech Store"}
                                                        </p>
                                                        <span className={`text-xs font-bold ${
                                                            selectedProduct?.id === prod.id ? "text-emerald-400" : "text-emerald-600"
                                                        }`}>
                                                            {formatVND(prod.price)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* DETAILS PANEL */}
                                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-8 h-[650px] flex flex-col justify-between">
                                    {selectedProduct ? (
                                        <div className="flex flex-col h-full justify-between">
                                            <div className="space-y-6 overflow-y-auto pr-2">
                                                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                                                    <div>
                                                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-xl">
                                                            Chờ Duyệt
                                                        </span>
                                                        <h3 className="text-2xl font-extrabold text-slate-900 mt-2">{selectedProduct.title}</h3>
                                                        <p className="text-xs text-slate-500">
                                                            Đăng lúc: {new Date(selectedProduct.createdAt).toLocaleDateString("vi-VN")} | Shop ID: {selectedProduct.shopId}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Mức Giá Đề Xuất</span>
                                                        <div className="text-2xl font-black text-emerald-600">{formatVND(selectedProduct.price)}</div>
                                                        {selectedProduct.originalPrice && (
                                                            <div className="text-xs text-slate-400 line-through">Giá gốc: {formatVND(selectedProduct.originalPrice)}</div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <img
                                                            src={selectedProduct.image || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400"}
                                                            alt={selectedProduct.title}
                                                            className="w-full h-56 rounded-2xl object-cover border border-slate-100"
                                                        />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <span className="text-xs text-slate-400 font-semibold block uppercase">Cửa hàng đăng bán</span>
                                                            <span className="text-base font-bold text-slate-800">{selectedProduct.shop?.name || "Elite Tech Store"}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-xs text-slate-400 font-semibold block uppercase">Danh mục sản phẩm</span>
                                                            <span className="text-base font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg inline-block mt-1">
                                                                {selectedProduct.category || "Chưa phân loại"}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-xs text-slate-400 font-semibold block uppercase">Tồn kho ban đầu</span>
                                                            <span className="text-base font-bold text-slate-800">{selectedProduct.stock || 0} sản phẩm</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <span className="text-xs text-slate-400 font-semibold block uppercase mb-1">Mô tả sản phẩm</span>
                                                    <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl text-sm leading-relaxed text-slate-600 max-h-40 overflow-y-auto">
                                                        {selectedProduct.desc || "Không có mô tả chi tiết."}
                                                    </div>
                                                </div>

                                                {/* WARNING FLAGS */}
                                                <div className="bg-rose-50 border border-rose-200/60 p-4 rounded-xl text-rose-900 space-y-2">
                                                    <div className="flex items-center space-x-2 font-bold text-sm">
                                                        <svg className="w-5 h-5 text-rose-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        <span>Cảnh Báo Kiểm Duyệt Hệ Thống</span>
                                                    </div>
                                                    <ul className="text-xs space-y-1 pl-7 list-disc">
                                                        <li>Kiểm tra chất lượng hình ảnh sắc nét, không vi phạm bản quyền thương hiệu lớn.</li>
                                                        <li>Xác minh mô tả mô tả đúng thuộc tính, không chèn link độc hại hoặc quảng cáo ngoại sàn.</li>
                                                    </ul>
                                                </div>
                                            </div>

                                            {/* ACTION BUTTONS */}
                                            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
                                                <button
                                                    onClick={() => handleUpdateProductStatus(selectedProduct.id, "draft")}
                                                    className="bg-slate-150 hover:bg-slate-200 text-slate-700 text-sm font-bold px-4 py-2.5 rounded-xl transition duration-150"
                                                >
                                                    Yêu Cầu Chỉnh Sửa
                                                </button>
                                                <div className="space-x-3">
                                                    <button
                                                        onClick={() => handleUpdateProductStatus(selectedProduct.id, "rejected")}
                                                        className="bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-sm font-bold px-4 py-2.5 rounded-xl transition duration-150"
                                                    >
                                                        Từ Chối Đăng Bán
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateProductStatus(selectedProduct.id, "active")}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-600/10 transition duration-150"
                                                    >
                                                        Phê Duyệt Sản Phẩm
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center text-slate-400 py-32 flex-1 flex flex-col items-center justify-center space-y-3">
                                            <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 00-2 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            <span className="font-semibold text-base">Vui lòng chọn sản phẩm để bắt đầu duyệt</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
