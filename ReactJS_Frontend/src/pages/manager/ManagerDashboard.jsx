import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ManagerHeader from "../../components/manager/Header";
import ManagerSidebar from "../../components/manager/Sidebar";
import ManagerProductModeration from "./ManagerProductModeration";
import ManagerVendors from "./ManagerVendors";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const getImageSrc = (image) => {
    if (!image) return "";
    return image.startsWith("http") ? image : `${API_URL}${image}`;
};

const TABS = [
    { id: "vendors", label: "Dashboard", icon: "shop" },
    { id: "moderation", label: "Vendors", icon: "clipboard" },
];

const initialStats = {
    totalVendors: 0,
    verifiedPercentage: 0,
    totalRevenue: 0,
    avgRating: 0,
    categoryDistribution: [],
    alerts: [],
};

const buildStatsFromVendors = (shops) => {
    const totalVendors = shops.length;
    const activeVendors = shops.filter((shop) => shop.status === "active").length;
    const ratingSum = shops.reduce((sum, shop) => sum + Number(shop.rating || 0), 0);
    const categoryCounts = shops.reduce((acc, shop) => {
        const category = shop.category || "Marketplace";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
    }, {});

    return {
        totalVendors,
        verifiedPercentage: totalVendors > 0 ? Number(((activeVendors / totalVendors) * 100).toFixed(1)) : 0,
        totalRevenue: shops.reduce((sum, shop) => sum + Number(shop.monthlySales || 0), 0),
        avgRating: totalVendors > 0 ? Number((ratingSum / totalVendors).toFixed(1)) : 0,
        categoryDistribution: Object.entries(categoryCounts).map(([category, count]) => ({ category, count })),
        alerts: []
    };
};

const ManagerDashboard = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const tabFromUrl = searchParams.get("tab");
    const [activeTab, setActiveTab] = useState(TABS.some((tab) => tab.id === tabFromUrl) ? tabFromUrl : "vendors");
    const [stats, setStats] = useState(initialStats);
    const [vendors, setVendors] = useState([]);
    const [pendingProducts, setPendingProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [vendorSearch, setVendorSearch] = useState("");
    const [vendorStatus, setVendorStatus] = useState("all");
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const token = localStorage.getItem("accessToken");
    const authHeaders = useMemo(() => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    }), [token]);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 2800);
    };

    useEffect(() => {
        const rawUser = localStorage.getItem("user");
        const user = rawUser ? JSON.parse(rawUser) : null;
        if (!token || !["manager", "admin"].includes(user?.role)) {
            navigate("/login", { replace: true });
        }
    }, [navigate, token]);

    const fetchStats = useCallback(async () => {
        const res = await fetch(`${API_URL}/api/shops/manager/stats`, { headers: authHeaders });
        if (res.ok) setStats(await res.json());
    }, [authHeaders]);

    const fetchVendors = useCallback(async () => {
        const params = new URLSearchParams({ limit: "100" });
        if (vendorStatus !== "all") params.set("status", vendorStatus);
        if (vendorSearch.trim()) params.set("search", vendorSearch.trim());

        const res = await fetch(`${API_URL}/api/shops?${params.toString()}`, { headers: authHeaders });
        if (res.ok) {
            const data = await res.json();
            setVendors(data.shops || []);
        }
    }, [authHeaders, vendorSearch, vendorStatus]);

    const fetchPendingProducts = useCallback(async () => {
        const res = await fetch(`${API_URL}/api/products/manager/queue?status=pending&limit=50`, { headers: authHeaders });
        if (res.ok) {
            const data = await res.json();
            const products = data.products || [];
            setPendingProducts(products);
            setSelectedProduct((current) => products.find((item) => item.id === current?.id) || products[0] || null);
        }
    }, [authHeaders]);

    const refreshData = useCallback(async () => {
        try {
            setLoading(true);
            await Promise.all([fetchStats(), fetchVendors(), fetchPendingProducts()]);
        } finally {
            setLoading(false);
        }
    }, [fetchPendingProducts, fetchStats, fetchVendors]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    useEffect(() => {
        if (TABS.some((tab) => tab.id === tabFromUrl)) {
            setActiveTab(tabFromUrl);
        }
    }, [tabFromUrl]);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setSearchParams({ tab: tabId });
    };

    const updateVendorStatus = async (shopId, status) => {
        const res = await fetch(`${API_URL}/api/shops/${shopId}/status`, {
            method: "PATCH",
            headers: authHeaders,
            body: JSON.stringify({ status }),
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            showToast(data.message || "Không thể cập nhật shop.", "error");
            return;
        }
        showToast("Đã cập nhật trạng thái shop.");
        fetchVendors();
        fetchStats();
    };

    const updateProductStatus = async (productId, status) => {
        const res = await fetch(`${API_URL}/api/products/${productId}/moderation`, {
            method: "PATCH",
            headers: authHeaders,
            body: JSON.stringify({ status }),
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            showToast(data.message || "Không thể cập nhật sản phẩm.", "error");
            return;
        }
        showToast(status === "active" ? "Đã duyệt sản phẩm." : "Đã cập nhật yêu cầu kiểm duyệt.");
        fetchPendingProducts();
        fetchStats();
    };

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const selectedImage = getImageSrc(selectedProduct?.image || selectedProduct?.images?.[0]);
    const statsForView = useMemo(() => {
        if (stats.totalVendors > 0 || vendors.length === 0) return stats;
        return {
            ...buildStatsFromVendors(vendors),
            alerts: stats.alerts
        };
    }, [stats, vendors]);

    return (
        <div className="min-h-screen bg-[#f3f6fb] text-slate-900 flex font-sans">
            {toast && (
                <div className={`fixed right-5 top-5 z-50 rounded-lg px-4 py-3 text-sm font-bold text-white shadow-lg ${
                    toast.type === "error" ? "bg-rose-600" : "bg-emerald-600"
                }`}>
                    {toast.message}
                </div>
            )}

            <ManagerSidebar
                tabs={TABS}
                activeTab={activeTab}
                pendingCount={pendingProducts.length}
                onTabChange={handleTabChange}
                onLogout={handleLogout}
            />

            <main className="flex-1 min-w-0">
                <ManagerHeader onLogout={handleLogout} />

                <section className="p-7 max-w-7xl mx-auto space-y-6">
                    {activeTab === "vendors" && (
                        <ManagerVendors
                            stats={statsForView}
                            vendors={vendors}
                            loading={loading}
                            vendorSearch={vendorSearch}
                            vendorStatus={vendorStatus}
                            onSearchChange={setVendorSearch}
                            onStatusChange={setVendorStatus}
                            onUpdateVendorStatus={updateVendorStatus}
                        />
                    )}

                    {activeTab === "moderation" && (
                        <ManagerProductModeration
                            pendingProducts={pendingProducts}
                            selectedProduct={selectedProduct}
                            selectedImage={selectedImage}
                            onSelectProduct={setSelectedProduct}
                            onUpdateProductStatus={updateProductStatus}
                        />
                    )}
                </section>
            </main>
        </div>
    );
};

export default ManagerDashboard;
