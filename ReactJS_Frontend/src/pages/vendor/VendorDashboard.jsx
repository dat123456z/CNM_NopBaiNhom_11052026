import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import VendorOverview from "./VendorOverview";
import VendorProducts from "./VendorProducts";
import VendorOrders from "./VendorOrders";
import VendorRevenue from "./VendorRevenue";
import VendorPromotions from "./VendorPromotions";
import VendorReviews from "./VendorReviews";
import VendorSettings from "./VendorSettings";
import VendorShippers from "./VendorShippers";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const TABS = [
    { id: "overview", label: "Tổng quan" },
    { id: "products", label: "Sản phẩm" },
    { id: "orders", label: "Đơn hàng" },
    { id: "shippers", label: "Quản lý Shipper" },
    { id: "revenue", label: "Ví & Doanh thu" },
    { id: "promotions", label: "Khuyến mãi" },
    { id: "reviews", label: "Bình luận / Review" },
    { id: "settings", label: "Cấu hình Shop" }
];

const VendorDashboard = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [shop, setShop] = useState(null);
    const [loadingShop, setLoadingShop] = useState(true);

    // Get active tab from path (e.g. /vendor/dashboard/products -> products)
    const activeTab = pathname.split("/").filter(Boolean).pop();
    const currentTab = TABS.some(t => t.id === activeTab) ? activeTab : "overview";

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
                navigate("/vendor/setup");
                return;
            }
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Không thể tải thông tin shop.");
            setShop(data);
        } catch (err) {
            alert(err.message);
        } finally {
            setLoadingShop(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const handleShopUpdate = (updatedShop) => {
        setShop(updatedShop);
    };

    const renderActiveTab = () => {
        switch (currentTab) {
            case "overview":
                return <VendorOverview shop={shop} />;
            case "products":
                return <VendorProducts shop={shop} />;
            case "orders":
                return <VendorOrders shop={shop} />;
            case "shippers":
                return <VendorShippers shop={shop} />;
            case "revenue":
                return <VendorRevenue shop={shop} />;
            case "promotions":
                return <VendorPromotions shop={shop} />;
            case "reviews":
                return <VendorReviews shop={shop} />;
            case "settings":
                return <VendorSettings shop={shop} onShopUpdate={handleShopUpdate} />;
            default:
                return <VendorOverview shop={shop} />;
        }
    };

    if (loadingShop) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-2 border-[#00b14f] border-t-transparent rounded-full" />
            </div>
        );
    }

    const shopLogoSrc = shop?.logo
        ? (shop.logo.startsWith("http") ? shop.logo : `${API_URL}${shop.logo}`)
        : null;

    return (
        <div className="min-h-screen bg-[#f8f9fb] flex flex-col font-sans text-gray-800">
            {/* ── Vendor Header ─────────────────────────────────────────────── */}
            <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Left: Logo + Badge */}
                    <div className="flex items-center gap-3">
                        <Link to="/" className="text-2xl font-extrabold tracking-tight text-[#00b14f]">
                            UTEShop
                        </Link>
                        <div className="h-6 w-px bg-gray-200" />
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-100 px-3 py-1 rounded-full">
                            Kênh Người Bán
                        </span>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1.5"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                            Trang mua hàng
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="bg-[#008a3d] hover:bg-[#007031] text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Main Layout ───────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-6 py-8 w-full flex-1 flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 shrink-0 flex flex-col gap-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm h-fit">
                    <div className="flex items-center gap-3 px-3 py-4 border-b border-gray-50 mb-4">
                        <div className="w-10 h-10 rounded-full bg-green-50 text-[#00b14f] flex items-center justify-center font-bold text-lg border border-green-100 overflow-hidden">
                            {shopLogoSrc ? <img src={shopLogoSrc} className="w-full h-full object-cover" /> : "🏪"}
                        </div>
                        <div>
                            <h2 className="font-extrabold text-sm text-gray-900 truncate max-w-[150px]">{shop?.name}</h2>
                            <p className="text-[10px] uppercase font-bold tracking-wider text-green-600 bg-green-50 px-2 py-0.5 rounded-full w-fit mt-1">Đang hoạt động</p>
                        </div>
                    </div>

                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => navigate(`/vendor/dashboard/${tab.id}`)}
                            className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${currentTab === tab.id ? "bg-[#00b14f] text-white shadow-md shadow-green-100" : "text-gray-600 hover:bg-gray-50"}`}
                        >
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </aside>

                {/* Main Content Area */}
                <section className="flex-1 min-w-0">
                    {renderActiveTab()}
                </section>
            </div>
        </div>
    );
};

export default VendorDashboard;
