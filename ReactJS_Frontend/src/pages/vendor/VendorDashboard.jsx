import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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

    const activeTab = pathname.split("/").filter(Boolean).pop();
    const currentTab = TABS.some(t => t.id === activeTab) ? activeTab : "overview";

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) { navigate("/login"); return; }
        fetchShop();
    }, [navigate]);

    const fetchShop = async () => {
        try {
            setLoadingShop(true);
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${API_URL}/api/shops/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.status === 404) { navigate("/vendor/setup"); return; }
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Không thể tải thông tin shop.");
            setShop(data);
        } catch (err) {
            alert(err.message);
        } finally {
            setLoadingShop(false);
        }
    };

    const handleShopUpdate = (updatedShop) => setShop(updatedShop);

    const renderActiveTab = () => {
        switch (currentTab) {
            case "overview":    return <VendorOverview shop={shop} />;
            case "products":    return <VendorProducts shop={shop} />;
            case "orders":      return <VendorOrders shop={shop} />;
            case "shippers":    return <VendorShippers shop={shop} />;
            case "revenue":     return <VendorRevenue shop={shop} />;
            case "promotions":  return <VendorPromotions shop={shop} />;
            case "reviews":     return <VendorReviews shop={shop} />;
            case "settings":    return <VendorSettings shop={shop} onShopUpdate={handleShopUpdate} />;
            default:            return <VendorOverview shop={shop} />;
        }
    };

    if (loadingShop) return (
        <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin w-10 h-10 border-2 border-[#00b14f] border-t-transparent rounded-full" />
        </div>
    );

    const shopLogoSrc = shop?.logo
        ? (shop.logo.startsWith("http") ? shop.logo : `${API_URL}${shop.logo}`)
        : null;

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 w-full flex-1 flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full md:w-64 shrink-0 flex flex-col gap-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm h-fit">
                <div className="flex items-center gap-3 px-3 py-4 border-b border-gray-50 mb-4">
                    <div className="w-10 h-10 rounded-full bg-green-50 text-[#00b14f] flex items-center justify-center font-bold text-lg border border-green-100 overflow-hidden">
                        {shopLogoSrc ? <img src={shopLogoSrc} className="w-full h-full object-cover" alt={shop?.name} /> : "🏪"}
                    </div>
                    <div>
                        <h2 className="font-extrabold text-sm text-gray-900 truncate max-w-37.5">{shop?.name}</h2>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-green-600 bg-green-50 px-2 py-0.5 rounded-full w-fit mt-1">Đang hoạt động</p>
                    </div>
                </div>

                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => navigate(`/vendor/dashboard/${tab.id}`)}
                        className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${currentTab === tab.id ? "bg-[#00b14f] text-white shadow-md shadow-green-100" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </aside>

            {/* Main Content */}
            <section className="flex-1 min-w-0">
                {renderActiveTab()}
            </section>
        </div>
    );
};

export default VendorDashboard;