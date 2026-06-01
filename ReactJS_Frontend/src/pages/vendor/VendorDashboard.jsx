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
import VendorSidebar from "../../components/vendor/Sidebar";

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

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 w-full flex-1 flex flex-col md:flex-row gap-8">
            <VendorSidebar
                shop={shop}
                tabs={TABS}
                currentTab={currentTab}
                onTabChange={(tabId) => navigate(`/vendor/dashboard/${tabId}`)}
            />

            <section className="flex-1 min-w-0">
                {renderActiveTab()}
            </section>
        </div>
    );
};

export default VendorDashboard;
