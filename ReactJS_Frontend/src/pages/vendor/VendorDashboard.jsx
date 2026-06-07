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
import LineIcon from "../../components/LineIcon";

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

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        navigate("/login");
    };

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

    if (shop && shop.status !== "active") {
        const statusText = {
            pending: "đang chờ duyệt",
            suspended: "đang bị tạm khóa",
            closed: "đã đóng"
        }[shop.status] || shop.status;

        return (
            <div className="max-w-4xl mx-auto px-6 py-16 w-full flex-1">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10 text-center">
                    <div className="mx-auto w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
                        <LineIcon name="shield" size={28} />
                    </div>
                    <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Gian hàng {statusText}</h1>
                    <p className="text-gray-500 max-w-xl mx-auto">
                        Hiện tại bạn không thể quản lý sản phẩm, đơn hàng, mã giảm giá hoặc ví của shop này.
                        Vui lòng liên hệ quản lý để được hỗ trợ
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="mt-6 mr-3 px-5 py-2.5 rounded-xl bg-[#00b14f] text-white text-sm font-bold hover:bg-[#009944] transition-colors"
                    >
                        Về trang chủ
                    </button>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="mt-6 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-bold hover:bg-gray-50 transition-colors"
                    >
                        Đăng xuất
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 w-full flex-1 flex flex-col md:flex-row gap-8">
            <VendorSidebar
                shop={shop}
                tabs={TABS}
                currentTab={currentTab}
                onTabChange={(tabId) => navigate(`/vendor/dashboard/${tabId}`)}
                onLogout={handleLogout}
            />

            <section className="flex-1 min-w-0">
                {renderActiveTab()}
            </section>
        </div>
    );
};

export default VendorDashboard;
