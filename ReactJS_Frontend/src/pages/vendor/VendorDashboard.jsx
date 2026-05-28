import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/user/Header";
import Footer from "../../components/user/Footer";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const VendorDashboard = () => {
    const navigate = useNavigate();
    const [shop, setShop] = useState(null);
    const [loadingShop, setLoadingShop] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    // Overview Stats
    const [revenueData, setRevenueData] = useState(null);
    const [loadingRevenue, setLoadingRevenue] = useState(false);

    // Products
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [productModal, setProductModal] = useState({ open: false, editing: null });
    const [productForm, setProductForm] = useState({
        title: "",
        description: "",
        price: "",
        originalPrice: "",
        category: "",
        stock: "",
        images: "",
        colors: ""
    });

    // Orders
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    // Wallet & Transactions
    const [walletHistory, setWalletHistory] = useState([]);
    const [loadingWallet, setLoadingWallet] = useState(false);
    const [withdrawModal, setWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState("");

    // Coupons/Promotions
    const [coupons, setCoupons] = useState([]);
    const [loadingCoupons, setLoadingCoupons] = useState(false);
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

    // Reviews
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [replyText, setReplyText] = useState({});

    // Shop settings form
    const [shopForm, setShopForm] = useState({
        name: "",
        description: "",
        logo: "",
        address: "",
        phone: ""
    });
    const [savingSettings, setSavingSettings] = useState(false);
    const [settingsSuccess, setSettingsSuccess] = useState(false);

    // Initial Auth & Shop check
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            navigate("/login");
            return;
        }
        fetchShop();
    }, [navigate]);

    const fetchShop = async () => {
        try {
            setLoadingShop(true);
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${API_URL}/api/shops/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.status === 404) {
                // No shop registered yet
                navigate("/vendor/setup");
                return;
            }
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Không thể tải thông tin shop.");
            setShop(data);
            setShopForm({
                name: data.name || "",
                description: data.description || "",
                logo: data.logo || "",
                address: data.address || "",
                phone: data.phone || ""
            });
        } catch (err) {
            alert(err.message);
        } finally {
            setLoadingShop(false);
        }
    };

    // Load Tab Data
    useEffect(() => {
        if (!shop) return;
        if (activeTab === "overview") fetchOverview();
        if (activeTab === "products") fetchProducts();
        if (activeTab === "orders") fetchOrders();
        if (activeTab === "revenue") {
            fetchOverview();
            fetchWalletHistory();
        }
        if (activeTab === "promotions") fetchCoupons();
        if (activeTab === "reviews") fetchReviews();
    }, [shop, activeTab]);

    const fetchOverview = async () => {
        try {
            setLoadingRevenue(true);
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${API_URL}/api/revenues/shop`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setRevenueData(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingRevenue(false);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoadingProducts(true);
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${API_URL}/api/products?shopId=${shop.id}&allStatus=true`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setProducts(data.products || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingProducts(false);
        }
    };

    const fetchOrders = async () => {
        try {
            setLoadingOrders(true);
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${API_URL}/api/orders/shop`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setOrders(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingOrders(false);
        }
    };

    const fetchWalletHistory = async () => {
        try {
            setLoadingWallet(true);
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${API_URL}/api/revenues/wallet-history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setWalletHistory(data.transactions || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingWallet(false);
        }
    };

    const fetchCoupons = async () => {
        try {
            setLoadingCoupons(true);
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${API_URL}/api/coupons/shop`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setCoupons(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingCoupons(false);
        }
    };

    const fetchReviews = async () => {
        try {
            setLoadingReviews(true);
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${API_URL}/api/reviews/shop`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setReviews(data.reviews || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingReviews(false);
        }
    };

    // Product CRUD Operations
    const handleProductSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("accessToken");
        const isEditing = !!productModal.editing;
        const url = isEditing
            ? `${API_URL}/api/products/${productModal.editing}`
            : `${API_URL}/api/products`;
        const method = isEditing ? "PUT" : "POST";

        try {
            const body = {
                title: productForm.title.trim(),
                description: productForm.description.trim(),
                price: Number(productForm.price),
                originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : null,
                category: productForm.category.trim(),
                stock: Number(productForm.stock),
                images: productForm.images.split(",").map(i => i.trim()).filter(Boolean),
                colors: productForm.colors.split(",").map(c => c.trim()).filter(Boolean)
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

            setProductModal({ open: false, editing: null });
            fetchProducts();
        } catch (err) {
            alert(err.message);
        }
    };

    const editProductClick = (p) => {
        setProductForm({
            title: p.title || "",
            description: p.desc || p.description || "",
            price: p.price || "",
            originalPrice: p.originalPrice || "",
            category: p.category || "",
            stock: p.stock || "",
            images: Array.isArray(p.images) ? p.images.join(", ") : "",
            colors: Array.isArray(p.colors) ? p.colors.join(", ") : ""
        });
        setProductModal({ open: true, editing: p.id });
    };

    const handleProductDelete = async (id) => {
        if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
        const token = localStorage.getItem("accessToken");
        try {
            const res = await fetch(`${API_URL}/api/products/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) fetchProducts();
            else {
                const data = await res.json();
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const toggleProductStatus = async (p) => {
        const nextStatus = p.status === "active" ? "inactive" : "active";
        const token = localStorage.getItem("accessToken");
        try {
            const res = await fetch(`${API_URL}/api/products/${p.id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: nextStatus })
            });
            if (res.ok) fetchProducts();
            else {
                const data = await res.json();
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Order actions
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

    // Wallet withdrawal
    const handleWithdrawSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("accessToken");
        try {
            const res = await fetch(`${API_URL}/api/revenues/withdraw`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ amount: Number(withdrawAmount) })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Rút tiền thất bại.");
            setWithdrawModal(false);
            setWithdrawAmount("");
            fetchShop(); // reload balance
            fetchWalletHistory();
            alert("Yêu cầu rút tiền thành công!");
        } catch (err) {
            alert(err.message);
        }
    };

    // Coupons CRUD
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

    // Reviews replies
    const handleReviewReply = async (reviewId) => {
        const text = replyText[reviewId];
        if (!text || !text.trim()) return;

        const token = localStorage.getItem("accessToken");
        try {
            const res = await fetch(`${API_URL}/api/reviews/${reviewId}/reply`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ reply: text.trim() })
            });
            if (res.ok) {
                setReplyText(prev => ({ ...prev, [reviewId]: "" }));
                fetchReviews();
                alert("Đã gửi phản hồi thành công.");
            } else {
                const data = await res.json();
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Save Shop settings
    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        setSettingsSuccess(false);
        const token = localStorage.getItem("accessToken");
        try {
            const res = await fetch(`${API_URL}/api/shops/me`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(shopForm)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Cập nhật thất bại.");
            setShop(data);
            setSettingsSuccess(true);
            setTimeout(() => setSettingsSuccess(false), 3000);
        } catch (err) {
            alert(err.message);
        } finally {
            setSavingSettings(false);
        }
    };

    const fmt = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";

    if (loadingShop) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-2 border-[#00b14f] border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fb] flex flex-col font-sans text-gray-800">
            <Header />

            <div className="max-w-7xl mx-auto px-6 py-8 w-full flex-1 flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 shrink-0 flex flex-col gap-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm h-fit">
                    <div className="flex items-center gap-3 px-3 py-4 border-b border-gray-50 mb-4">
                        <div className="w-10 h-10 rounded-full bg-green-50 text-[#00b14f] flex items-center justify-center font-bold text-lg border border-green-100 overflow-hidden">
                            {shop?.logo ? <img src={shop.logo} className="w-full h-full object-cover" /> : "🏪"}
                        </div>
                        <div>
                            <h2 className="font-extrabold text-sm text-gray-900 truncate max-w-[150px]">{shop?.name}</h2>
                            <p className="text-[10px] uppercase font-bold tracking-wider text-green-600 bg-green-50 px-2 py-0.5 rounded-full w-fit mt-1">Đang hoạt động</p>
                        </div>
                    </div>

                    {[
                        { id: "overview", label: "Tổng quan", icon: "📊" },
                        { id: "products", label: "Sản phẩm", icon: "📦" },
                        { id: "orders", label: "Đơn hàng", icon: "📋" },
                        { id: "revenue", label: "Ví & Doanh thu", icon: "💳" },
                        { id: "promotions", label: "Khuyến mãi", icon: "🏷️" },
                        { id: "reviews", label: "Bình luận / Review", icon: "💬" },
                        { id: "settings", label: "Cấu hình Shop", icon: "⚙️" }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${activeTab === tab.id ? "bg-[#00b14f] text-white shadow-md shadow-green-100" : "text-gray-600 hover:bg-gray-50"}`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </aside>

                {/* Main Content Area */}
                <section className="flex-1 min-w-0">
                    {/* 1. OVERVIEW VIEW */}
                    {activeTab === "overview" && (
                        <div className="space-y-8">
                            <div className="flex justify-between items-center">
                                <h1 className="text-2xl font-extrabold text-gray-900">Tổng quan kinh doanh</h1>
                                <span className="text-xs text-gray-400">Cập nhật hôm nay</span>
                            </div>

                            {loadingRevenue ? (
                                <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-[#00b14f] border-t-transparent rounded-full" /></div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm flex flex-col justify-between">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tổng doanh thu</span>
                                            <span className="text-2xl font-black text-gray-900 mt-2">{fmt(revenueData?.summary?.totalRevenue)}</span>
                                        </div>
                                        <div className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm flex flex-col justify-between">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Đơn hàng hoàn thành</span>
                                            <span className="text-2xl font-black text-gray-900 mt-2">{revenueData?.summary?.totalOrders || 0} đơn</span>
                                        </div>
                                        <div className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm flex flex-col justify-between">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Số dư ví hiện tại</span>
                                            <span className="text-2xl font-black text-green-600 mt-2">{fmt(revenueData?.summary?.balance || shop?.balance)}</span>
                                        </div>
                                        <div className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm flex flex-col justify-between">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Đánh giá trung bình</span>
                                            <span className="text-2xl font-black text-amber-500 mt-2">⭐ {Number(revenueData?.summary?.rating || shop?.rating || 0).toFixed(1)} / 5</span>
                                        </div>
                                    </div>

                                    {/* Visual Chart */}
                                    <div className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm">
                                        <h3 className="font-extrabold text-gray-900 mb-6">Biểu đồ doanh thu gần đây</h3>
                                        {revenueData?.chart && revenueData.chart.length > 0 ? (
                                            <div className="flex items-end justify-between h-48 gap-3 pt-6 border-b border-gray-100">
                                                {revenueData.chart.map((c, idx) => {
                                                    const maxRevenue = Math.max(...revenueData.chart.map(item => Number(item.revenue)));
                                                    const percentHeight = maxRevenue > 0 ? (Number(c.revenue) / maxRevenue) * 100 : 0;
                                                    return (
                                                        <div key={idx} className="flex-1 flex flex-col items-center group relative">
                                                            {/* Tooltip */}
                                                            <div className="absolute bottom-full mb-2 bg-gray-900 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md z-10">
                                                                {fmt(c.revenue)} ({c.orderCount} đơn)
                                                            </div>
                                                            {/* Bar */}
                                                            <div
                                                                style={{ height: `${Math.max(percentHeight, 8)}%` }}
                                                                className="w-full bg-[#00b14f] hover:bg-green-600 rounded-t-lg transition-all duration-300 shadow-xs"
                                                            />
                                                            <span className="text-[10px] text-gray-400 font-semibold mt-2 select-none truncate max-w-[60px]">{c.period}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="py-12 text-center text-sm text-gray-400">Chưa có dữ liệu giao dịch hoàn thành để thống kê.</div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* 2. PRODUCTS VIEW */}
                    {activeTab === "products" && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h1 className="text-2xl font-extrabold text-gray-900">Quản lý sản phẩm</h1>
                                <button
                                    onClick={() => {
                                        setProductForm({ title: "", description: "", price: "", originalPrice: "", category: "", stock: "", images: "", colors: "" });
                                        setProductModal({ open: true, editing: null });
                                    }}
                                    className="px-5 py-2.5 bg-[#00b14f] hover:bg-green-600 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                                >
                                    <span>➕</span> Thêm sản phẩm mới
                                </button>
                            </div>

                            {loadingProducts ? (
                                <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-[#00b14f] border-t-transparent rounded-full" /></div>
                            ) : products.length === 0 ? (
                                <div className="bg-white border border-gray-100 p-12 text-center rounded-2xl shadow-xs text-gray-400 text-sm">Chưa có sản phẩm nào. Hãy đăng sản phẩm đầu tiên!</div>
                            ) : (
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-100">
                                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Hình ảnh</th>
                                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Tên sản phẩm</th>
                                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Giá / Kho</th>
                                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Danh mục</th>
                                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Trạng thái</th>
                                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase text-right">Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 text-sm">
                                                {products.map(p => {
                                                    const img = p.images && p.images.length > 0 ? p.images[0] : "";
                                                    const imgSrc = img.startsWith("http") ? img : `${API_URL}${img}`;
                                                    return (
                                                        <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="p-4">
                                                                <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                                                                    {img ? <img src={imgSrc} className="w-full h-full object-cover" /> : "📦"}
                                                                </div>
                                                            </td>
                                                            <td className="p-4 font-bold text-gray-900 truncate max-w-[200px]" title={p.title}>{p.title}</td>
                                                            <td className="p-4">
                                                                <div className="font-extrabold text-[#00b14f]">{fmt(p.price)}</div>
                                                                <div className="text-[10px] text-gray-400 font-semibold mt-0.5">Kho: {p.stock}</div>
                                                            </td>
                                                            <td className="p-4"><span className="bg-gray-100 text-gray-500 font-bold text-[10px] px-2 py-0.5 rounded-full">{p.category}</span></td>
                                                            <td className="p-4">
                                                                <button
                                                                    onClick={() => toggleProductStatus(p)}
                                                                    className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase transition-all cursor-pointer ${p.status === "active" ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-red-50 text-red-500 hover:bg-red-100"}`}
                                                                >
                                                                    {p.status === "active" ? "Đang bán" : "Ẩn"}
                                                                </button>
                                                            </td>
                                                            <td className="p-4 text-right space-x-2">
                                                                <button onClick={() => editProductClick(p)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" title="Chỉnh sửa">✏️</button>
                                                                <button onClick={() => handleProductDelete(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Xóa">🗑️</button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 3. ORDERS VIEW */}
                    {activeTab === "orders" && (
                        <div className="space-y-6">
                            <h1 className="text-2xl font-extrabold text-gray-900">Danh sách đơn hàng</h1>

                            {loadingOrders ? (
                                <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-[#00b14f] border-t-transparent rounded-full" /></div>
                            ) : orders.length === 0 ? (
                                <div className="bg-white border border-gray-100 p-12 text-center rounded-2xl shadow-xs text-gray-400 text-sm">Chưa có đơn hàng nào từ người mua.</div>
                            ) : (
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-100">
                                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Mã ĐH</th>
                                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Khách hàng</th>
                                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Tổng tiền</th>
                                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Thanh toán</th>
                                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Trạng thái</th>
                                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase text-right">Hành động</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 text-sm">
                                                {orders.map(o => (
                                                    <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="p-4 font-bold text-gray-900">#{o.id}</td>
                                                        <td className="p-4">
                                                            <div className="font-semibold text-gray-800">{o.shippingName || "Ẩn danh"}</div>
                                                            <div className="text-[10px] text-gray-400 font-semibold mt-0.5">{o.shippingPhone}</div>
                                                        </td>
                                                        <td className="p-4 font-extrabold text-gray-900">{fmt(o.total)}</td>
                                                        <td className="p-4">
                                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${o.paymentMethod === "vnpay" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"}`}>
                                                                {o.paymentMethod?.toUpperCase()}
                                                            </span>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                                o.status === "delivered" ? "bg-green-50 text-green-600" :
                                                                o.status === "cancelled" ? "bg-red-50 text-red-500" :
                                                                o.status === "shipping" ? "bg-amber-50 text-amber-600" :
                                                                "bg-blue-50 text-blue-600"
                                                            }`}>
                                                                {o.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            {o.status === "pending" && (
                                                                <button
                                                                    onClick={() => handleOrderConfirm(o.id)}
                                                                    className="px-3 py-1.5 bg-[#00b14f] hover:bg-green-600 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                                                                >
                                                                    Xác nhận Đơn hàng
                                                                </button>
                                                            )}
                                                            {o.status !== "pending" && o.status !== "delivered" && o.status !== "cancelled" && (
                                                                <select
                                                                    value={o.status}
                                                                    onChange={(e) => handleOrderStatusChange(o.id, e.target.value)}
                                                                    className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#00b14f]"
                                                                >
                                                                    <option value="processing">Đang chuẩn bị</option>
                                                                    <option value="shipping">Đang giao</option>
                                                                    <option value="delivered">Đã giao thành công</option>
                                                                    <option value="cancelled">Hủy đơn</option>
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
                    )}

                    {/* 4. REVENUE & WALLET VIEW */}
                    {activeTab === "revenue" && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h1 className="text-2xl font-extrabold text-gray-900">Quản lý ví điện tử shop</h1>
                                <button
                                    onClick={() => setWithdrawModal(true)}
                                    className="px-5 py-2.5 bg-[#00b14f] hover:bg-green-600 text-white font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer"
                                >
                                    Rút tiền về ngân hàng
                                </button>
                            </div>

                            <div className="bg-gradient-to-br from-[#00b14f] to-green-600 p-8 rounded-3xl text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-green-100">Số dư ví khả dụng</p>
                                    <h2 className="text-4xl font-black mt-2">{fmt(revenueData?.summary?.balance || shop?.balance)}</h2>
                                </div>
                                <div className="text-xs bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 max-w-sm">
                                    <p className="font-bold">💡 Lưu ý rút tiền:</p>
                                    <p className="text-green-50/80 mt-1 leading-relaxed">Số tiền sẽ được chuyển thẳng về tài khoản ngân hàng liên kết của chủ cửa hàng trong vòng 24h làm việc.</p>
                                </div>
                            </div>

                            {/* Wallet Transaction History */}
                            <div className="space-y-4">
                                <h3 className="font-extrabold text-gray-900 text-lg">Lịch sử giao dịch ví</h3>
                                {loadingWallet ? (
                                    <div className="flex justify-center py-6"><div className="animate-spin w-6 h-6 border-2 border-[#00b14f] border-t-transparent rounded-full" /></div>
                                ) : walletHistory.length === 0 ? (
                                    <div className="bg-white border border-gray-100 p-12 text-center rounded-2xl text-gray-400 text-sm">Chưa có giao dịch nào được ghi nhận.</div>
                                ) : (
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-gray-50 border-b border-gray-100">
                                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase">Mã GD</th>
                                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase">Loại</th>
                                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase">Số tiền</th>
                                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase">Số dư sau GD</th>
                                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase">Nội dung</th>
                                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase">Thời gian</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50 text-sm">
                                                    {walletHistory.map(w => (
                                                        <tr key={w.id} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="p-4 font-bold text-gray-700">#{w.id}</td>
                                                            <td className="p-4">
                                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${w.type === "credit" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                                                                    {w.type === "credit" ? "Cộng tiền" : "Rút tiền"}
                                                                </span>
                                                            </td>
                                                            <td className={`p-4 font-extrabold ${w.type === "credit" ? "text-green-600" : "text-red-500"}`}>
                                                                {w.type === "credit" ? "+" : ""}{fmt(w.amount)}
                                                            </td>
                                                            <td className="p-4 text-gray-500">{fmt(w.balanceAfter)}</td>
                                                            <td className="p-4 font-semibold text-gray-800">{w.note}</td>
                                                            <td className="p-4 text-gray-400 text-xs">{new Date(w.createdAt).toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 5. PROMOTIONS & COUPONS VIEW */}
                    {activeTab === "promotions" && (
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
                                    <span>➕</span> Tạo mã giảm giá mới
                                </button>
                            </div>

                            {loadingCoupons ? (
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
                                                        <td className="p-4 text-right space-x-2">
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
                                                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                                                title="Chỉnh sửa"
                                                            >
                                                                ✏️
                                                            </button>
                                                            <button onClick={() => handleCouponDelete(c.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Xóa">🗑️</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 6. REVIEWS VIEW */}
                    {activeTab === "reviews" && (
                        <div className="space-y-6">
                            <h1 className="text-2xl font-extrabold text-gray-900">Phản hồi khách hàng & Đánh giá</h1>

                            {loadingReviews ? (
                                <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-[#00b14f] border-t-transparent rounded-full" /></div>
                            ) : reviews.length === 0 ? (
                                <div className="bg-white border border-gray-100 p-12 text-center rounded-2xl shadow-xs text-gray-400 text-sm">Chưa nhận được đánh giá nào từ khách hàng.</div>
                            ) : (
                                <div className="space-y-4">
                                    {reviews.map(r => (
                                        <div key={r.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4 text-left">
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <span className="font-extrabold text-gray-900 text-sm">{r.user?.name || "Khách hàng ẩn danh"}</span>
                                                    <span className="text-[10px] text-gray-400 ml-3 font-semibold">{new Date(r.createdAt).toLocaleDateString()}</span>
                                                    <div className="text-amber-500 font-bold text-xs mt-1">{"⭐".repeat(r.rating)}</div>
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full">Sản phẩm: {r.product?.title}</span>
                                            </div>

                                            <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>

                                            {r.vendorReply ? (
                                                <div className="bg-green-50/50 p-4 rounded-xl border border-green-50 text-sm">
                                                    <p className="font-bold text-[#00b14f] text-xs">Phản hồi của shop:</p>
                                                    <p className="text-gray-700 mt-1">{r.vendorReply}</p>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Nhập phản hồi từ shop..."
                                                        value={replyText[r.id] || ""}
                                                        onChange={(e) => setReplyText(prev => ({ ...prev, [r.id]: e.target.value }))}
                                                        className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[#00b14f]"
                                                    />
                                                    <button
                                                        onClick={() => handleReviewReply(r.id)}
                                                        className="px-4 py-2 bg-[#00b14f] hover:bg-green-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                                                    >
                                                        Gửi phản hồi
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 7. SETTINGS VIEW */}
                    {activeTab === "settings" && (
                        <div className="space-y-6">
                            <h1 className="text-2xl font-extrabold text-gray-900">Cấu hình thông tin gian hàng</h1>

                            <form onSubmit={handleSaveSettings} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 text-left max-w-2xl">
                                {settingsSuccess && (
                                    <div className="p-4 bg-green-50 text-green-600 border border-green-100 rounded-2xl text-xs font-semibold">
                                        🎉 Cập nhật thông tin shop thành công!
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Tên cửa hàng</label>
                                        <input
                                            type="text"
                                            value={shopForm.name}
                                            onChange={(e) => setShopForm(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00b14f]"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Mô tả gian hàng</label>
                                        <textarea
                                            value={shopForm.description}
                                            onChange={(e) => setShopForm(prev => ({ ...prev, description: e.target.value }))}
                                            rows={4}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00b14f] resize-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Địa chỉ gian hàng</label>
                                        <input
                                            type="text"
                                            value={shopForm.address}
                                            onChange={(e) => setShopForm(prev => ({ ...prev, address: e.target.value }))}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00b14f]"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Số điện thoại liên hệ</label>
                                        <input
                                            type="text"
                                            value={shopForm.phone}
                                            onChange={(e) => setShopForm(prev => ({ ...prev, phone: e.target.value }))}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00b14f]"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Logo URL (Hình ảnh)</label>
                                        <input
                                            type="text"
                                            value={shopForm.logo}
                                            onChange={(e) => setShopForm(prev => ({ ...prev, logo: e.target.value }))}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00b14f]"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={savingSettings}
                                    className="w-full py-3.5 bg-[#00b14f] hover:bg-green-600 text-white font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer"
                                >
                                    {savingSettings ? "Đang lưu..." : "Lưu thay đổi"}
                                </button>
                            </form>
                        </div>
                    )}
                </section>
            </div>

            {/* PRODUCT ADD/EDIT MODAL */}
            {productModal.open && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6 backdrop-blur-xs overflow-y-auto">
                    <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-8 relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setProductModal({ open: false, editing: null })}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
                        >
                            ✕
                        </button>
                        <h2 className="text-xl font-extrabold text-gray-900 mb-6">{productModal.editing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>
                        <form onSubmit={handleProductSubmit} className="space-y-4 text-left">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Tên sản phẩm *</label>
                                <input
                                    type="text"
                                    value={productForm.title}
                                    onChange={(e) => setProductForm(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00b14f]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Mô tả sản phẩm *</label>
                                <textarea
                                    value={productForm.description}
                                    onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00b14f] resize-none"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Giá bán (đ) *</label>
                                    <input
                                        type="number"
                                        value={productForm.price}
                                        onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00b14f]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Giá gốc (đ) (Tùy chọn)</label>
                                    <input
                                        type="number"
                                        value={productForm.originalPrice}
                                        onChange={(e) => setProductForm(prev => ({ ...prev, originalPrice: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00b14f]"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Danh mục *</label>
                                    <input
                                        type="text"
                                        value={productForm.category}
                                        onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                                        placeholder="Ví dụ: Điện thoại, Áo thun"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00b14f]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Số lượng kho *</label>
                                    <input
                                        type="number"
                                        value={productForm.stock}
                                        onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00b14f]"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Hình ảnh (Danh sách URLs cách nhau bởi dấu phẩy) *</label>
                                <input
                                    type="text"
                                    value={productForm.images}
                                    onChange={(e) => setProductForm(prev => ({ ...prev, images: e.target.value }))}
                                    placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00b14f]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Màu sắc (Cách nhau bởi dấu phẩy - Tùy chọn)</label>
                                <input
                                    type="text"
                                    value={productForm.colors}
                                    onChange={(e) => setProductForm(prev => ({ ...prev, colors: e.target.value }))}
                                    placeholder="Red, Blue, Green"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00b14f]"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-[#00b14f] hover:bg-green-600 text-white font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer"
                            >
                                Lưu sản phẩm
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* WITHDRAW MODAL */}
            {withdrawModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl shadow-xl max-w-sm w-full p-8 relative">
                        <button
                            onClick={() => setWithdrawModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
                        >
                            ✕
                        </button>
                        <h2 className="text-xl font-extrabold text-gray-900 mb-4">Rút tiền về tài khoản</h2>
                        <form onSubmit={handleWithdrawSubmit} className="space-y-4 text-left">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Nhập số tiền muốn rút (đ)</label>
                                <input
                                    type="number"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    placeholder="Nhập số tiền..."
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00b14f]"
                                    required
                                    min="50000"
                                    max={revenueData?.summary?.balance || shop?.balance}
                                />
                                <span className="text-[10px] text-gray-400 mt-1 block">Tối thiểu: 50.000đ. Tối đa: {fmt(revenueData?.summary?.balance || shop?.balance)}</span>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-[#00b14f] hover:bg-green-600 text-white font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer"
                            >
                                Xác nhận rút tiền
                            </button>
                        </form>
                    </div>
                </div>
            )}

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

            <Footer />
        </div>
    );
};

export default VendorDashboard;
