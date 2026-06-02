import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AdminHeader from "../../components/admin/Header";
import AdminSidebar from "../../components/admin/Sidebar";
import AdminOverview from "./AdminOverview";
import AdminUsers from "./AdminUsers";
import AdminVendors from "./AdminVendors";
import AdminProducts from "./AdminProducts";
import AdminOrders from "./AdminOrders";
import AdminRevenue from "./AdminRevenue";
import AdminRoles from "./AdminRoles";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const TABS = [
    { id: "dashboard", label: "Dashboard", icon: "home" },
    { id: "users", label: "Users", icon: "users" },
    { id: "vendors", label: "Vendors", icon: "shop" },
    { id: "products", label: "Products", icon: "box" },
    { id: "orders", label: "Orders", icon: "cart" },
    { id: "revenue", label: "Revenue", icon: "wallet" },
    { id: "roles", label: "Settings", icon: "shield" },
];

const fmtStats = ({ users, vendors, products, orders }) => {
    const deliveredOrders = orders.filter((order) => order.status === "delivered");
    const totalRevenue = deliveredOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const today = new Date().toDateString();
    const todayRevenue = deliveredOrders
        .filter((order) => new Date(order.createdAt).toDateString() === today)
        .reduce((sum, order) => sum + Number(order.total || 0), 0);

    return {
        totalUsers: users.length,
        totalVendors: vendors.length,
        activeVendors: vendors.filter((shop) => shop.status === "active").length,
        pendingVendors: vendors.filter((shop) => shop.status === "pending").length,
        totalProducts: products.length,
        pendingProducts: products.filter((product) => product.status === "pending").length,
        totalRevenue,
        todayRevenue,
        commission: Math.round(totalRevenue * 0.125),
        returnRate: orders.length > 0 ? Number(((orders.filter((order) => order.status === "cancelled").length / orders.length) * 100).toFixed(1)) : 0,
        verifiedPercentage: vendors.length > 0 ? Number(((vendors.filter((shop) => shop.status === "active").length / vendors.length) * 100).toFixed(1)) : 0,
        avgRating: vendors.length > 0 ? Number((vendors.reduce((sum, shop) => sum + Number(shop.rating || 0), 0) / vendors.length).toFixed(1)) : 0,
        categoryDistribution: Object.entries(vendors.reduce((acc, shop) => {
            const key = shop.category || "Marketplace";
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {})).map(([category, count]) => ({ category, count })),
    };
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const tabFromUrl = searchParams.get("tab");
    const [activeTab, setActiveTab] = useState(TABS.some((tab) => tab.id === tabFromUrl) ? tabFromUrl : "dashboard");
    const [users, setUsers] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [vendorSearch, setVendorSearch] = useState("");
    const [vendorStatus, setVendorStatus] = useState("all");
    const [toast, setToast] = useState(null);

    const token = localStorage.getItem("accessToken");
    const headers = useMemo(() => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    }), [token]);

    const stats = useMemo(() => fmtStats({ users, vendors, products, orders }), [users, vendors, products, orders]);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 2600);
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!token || user.role !== "admin") navigate("/login", { replace: true });
    }, [navigate, token]);

    useEffect(() => {
        if (TABS.some((tab) => tab.id === tabFromUrl)) setActiveTab(tabFromUrl);
    }, [tabFromUrl]);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const vendorParams = new URLSearchParams({ limit: "100" });
            if (vendorStatus !== "all") vendorParams.set("status", vendorStatus);
            if (vendorSearch.trim()) vendorParams.set("search", vendorSearch.trim());

            const [usersRes, vendorsRes, productsRes, ordersRes] = await Promise.all([
                fetch(`${API_URL}/api/users?limit=100`, { headers }),
                fetch(`${API_URL}/api/shops?${vendorParams.toString()}`, { headers }),
                fetch(`${API_URL}/api/products/manager/queue?limit=100`, { headers }),
                fetch(`${API_URL}/api/orders/admin?limit=100`, { headers }),
            ]);

            if (usersRes.ok) setUsers((await usersRes.json()).users || []);
            if (vendorsRes.ok) setVendors((await vendorsRes.json()).shops || []);
            if (productsRes.ok) setProducts((await productsRes.json()).products || []);
            if (ordersRes.ok) setOrders((await ordersRes.json()).orders || []);
        } finally {
            setLoading(false);
        }
    }, [headers, vendorSearch, vendorStatus]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setSearchParams({ tab: tabId });
    };

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const updateVendorStatus = async (shopId, status) => {
        const res = await fetch(`${API_URL}/api/shops/${shopId}/status`, { method: "PATCH", headers, body: JSON.stringify({ status }) });
        showToast(res.ok ? "Đã cập nhật vendor." : "Không thể cập nhật vendor.", res.ok ? "success" : "error");
        fetchAll();
    };

    const updateProductStatus = async (productId, status) => {
        const res = await fetch(`${API_URL}/api/products/${productId}/moderation`, { method: "PATCH", headers, body: JSON.stringify({ status }) });
        showToast(res.ok ? "Đã cập nhật sản phẩm." : "Không thể cập nhật sản phẩm.", res.ok ? "success" : "error");
        fetchAll();
    };

    const setUserStatus = async (userId, isActive) => {
        const res = await fetch(`${API_URL}/api/users/${userId}/status`, { method: "PATCH", headers, body: JSON.stringify({ isActive }) });
        showToast(res.ok ? "Đã cập nhật tài khoản." : "Không thể cập nhật tài khoản.", res.ok ? "success" : "error");
        fetchAll();
    };

    const setUserRole = async (userId, role) => {
        const res = await fetch(`${API_URL}/api/users/${userId}/role`, { method: "PATCH", headers, body: JSON.stringify({ role }) });
        showToast(res.ok ? "Đã cập nhật quyền." : "Không thể cập nhật quyền.", res.ok ? "success" : "error");
        fetchAll();
    };

    return (
        <div className="min-h-screen bg-[#f3f6fb] text-slate-900 flex font-sans">
            {toast && <div className={`fixed right-5 top-5 z-50 rounded-lg px-4 py-3 text-sm font-bold text-white shadow-lg ${toast.type === "error" ? "bg-rose-600" : "bg-emerald-600"}`}>{toast.message}</div>}
            <AdminSidebar tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} onGoHome={() => navigate("/")} onLogout={handleLogout} />
            <main className="flex-1 min-w-0">
                <AdminHeader onSwitchRole={() => navigate("/manager/dashboard")} onLogout={handleLogout} />
                <section className="p-7 max-w-7xl mx-auto">
                    {activeTab === "dashboard" && <AdminOverview stats={stats} vendors={vendors} />}
                    {activeTab === "users" && <AdminUsers users={users} onSetUserStatus={setUserStatus} onSetUserRole={setUserRole} />}
                    {activeTab === "vendors" && <AdminVendors stats={stats} vendors={vendors} loading={loading} vendorSearch={vendorSearch} vendorStatus={vendorStatus} onSearchChange={setVendorSearch} onStatusChange={setVendorStatus} onUpdateVendorStatus={updateVendorStatus} />}
                    {activeTab === "products" && <AdminProducts products={products} stats={stats} onUpdateProductStatus={updateProductStatus} />}
                    {activeTab === "orders" && <AdminOrders orders={orders} stats={stats} />}
                    {activeTab === "revenue" && <AdminRevenue orders={orders} vendors={vendors} stats={stats} />}
                    {activeTab === "roles" && <AdminRoles users={users} />}
                </section>
            </main>
        </div>
    );
};

export default AdminDashboard;
