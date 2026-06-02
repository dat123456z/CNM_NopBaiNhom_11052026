import LineIcon from "../../components/LineIcon";
import { ManagerCard, ManagerStatCard } from "../../components/manager/ManagerCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const statusLabel = {
    active: "Verified",
    pending: "Pending",
    suspended: "Suspended",
    closed: "Closed",
};

const statusClass = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-100",
    pending: "bg-amber-50 text-amber-700 border-amber-100",
    suspended: "bg-rose-50 text-rose-700 border-rose-100",
    closed: "bg-slate-100 text-slate-600 border-slate-200",
};

const fmtMoney = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;
const fmtCompact = (value) => Number(value || 0).toLocaleString("vi-VN");
const getImageSrc = (image) => {
    if (!image) return "";
    return image.startsWith("http") ? image : `${API_URL}${image}`;
};

const ManagerVendors = ({
    stats,
    vendors,
    loading,
    vendorSearch,
    vendorStatus,
    onSearchChange,
    onStatusChange,
    onUpdateVendorStatus,
}) => {
    const maxCategory = Math.max(...(stats.categoryDistribution || []).map((item) => item.count), 1);
    const categories = (stats.categoryDistribution || []).slice(0, 5).map((item) => ({
        ...item,
        height: Math.max(20, Math.round((item.count / maxCategory) * 100)),
    }));

    return (
        <>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-2xl font-black">Vendor Management</p>
                    <p className="text-xs text-slate-500 mt-1">Monitor, verify, and analyze vendor performance across the marketplace.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="h-9 px-4 rounded-md border border-slate-200 bg-white text-xs font-bold text-slate-600 flex items-center gap-2">
                        <LineIcon name="search" size={14} />
                        Filter View
                    </button>
                    <button className="h-9 px-4 rounded-md bg-[#9a4f00] text-white text-xs font-bold flex items-center gap-2">
                        <LineIcon name="card" size={14} />
                        Export Data
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <ManagerStatCard icon="shop" label="Total Vendors" value={fmtCompact(stats.totalVendors)} sub="+12% from last month" />
                <ManagerStatCard icon="shield" label="Verified Status" value={`${stats.verifiedPercentage}%`} sub="active vendors" />
                <ManagerStatCard icon="coin" label="Vendor Revenue" value={fmtMoney(stats.totalRevenue)} sub="+ growth" />
                <ManagerStatCard icon="star" label="Avg Rating" value={Number(stats.avgRating || 0).toFixed(1)} sub="across reviews" />
            </div>

            <ManagerCard className="overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="font-black">Vendor Directory</p>
                        <p className="text-xs text-slate-400 mt-1">{vendors.length} vendors loaded</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={vendorStatus}
                            onChange={(event) => onStatusChange(event.target.value)}
                            className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600"
                        >
                            <option value="all">All status</option>
                            <option value="pending">Pending</option>
                            <option value="active">Verified</option>
                            <option value="suspended">Suspended</option>
                        </select>
                        <div className="h-9 rounded-md border border-slate-200 bg-slate-50 px-3 flex items-center gap-2">
                            <LineIcon name="search" size={14} className="text-slate-400" />
                            <input
                                value={vendorSearch}
                                onChange={(event) => onSearchChange(event.target.value)}
                                placeholder="Quick search..."
                                className="bg-transparent outline-none text-xs w-44"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-400">
                            <tr>
                                <th className="px-5 py-3">Vendor Name</th>
                                <th className="px-5 py-3">Category</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3">Monthly Sales</th>
                                <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {loading ? (
                                <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">Đang tải dữ liệu...</td></tr>
                            ) : vendors.length === 0 ? (
                                <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">Không có vendor phù hợp.</td></tr>
                            ) : vendors.slice(0, 8).map((shop) => {
                                const logo = getImageSrc(shop.logo);
                                return (
                                    <tr key={shop.id} className="hover:bg-slate-50/70">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-md bg-slate-100 overflow-hidden flex items-center justify-center">
                                                    {logo ? <img src={logo} alt={shop.name} className="w-full h-full object-cover" /> : <LineIcon name="shop" size={18} className="text-slate-400" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{shop.name}</p>
                                                    <p className="text-[10px] text-slate-400">ID: VEND-{String(shop.id).padStart(4, "0")}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-xs text-slate-500">{shop.category || "Marketplace"}</td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2.5 py-1 rounded-full border text-[10px] font-black ${statusClass[shop.status] || statusClass.closed}`}>
                                                {statusLabel[shop.status] || shop.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 font-bold text-slate-900">{fmtMoney(shop.monthlySales || 0)}</td>
                                        <td className="px-5 py-4 text-right">
                                            {shop.status === "pending" && (
                                                <button onClick={() => onUpdateVendorStatus(shop.id, "active")} className="text-xs font-bold text-emerald-700 hover:underline">Approve</button>
                                            )}
                                            {shop.status === "active" && (
                                                <button onClick={() => onUpdateVendorStatus(shop.id, "suspended")} className="text-xs font-bold text-amber-700 hover:underline">Suspend</button>
                                            )}
                                            {shop.status === "suspended" && (
                                                <button onClick={() => onUpdateVendorStatus(shop.id, "active")} className="text-xs font-bold text-emerald-700 hover:underline">Restore</button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </ManagerCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <ManagerCard className="p-5 min-h-56">
                    <p className="font-black">Recent Alerts</p>
                    <div className="mt-5 space-y-4">
                        {(stats.alerts || []).slice(0, 4).map((alert) => (
                            <div key={alert.id} className="flex items-start gap-3">
                                <LineIcon name={alert.type === "success" ? "check" : "alert"} size={16} className={alert.type === "success" ? "text-emerald-600" : "text-rose-600"} />
                                <p className="text-xs text-slate-600 leading-relaxed">{alert.message}</p>
                            </div>
                        ))}
                    </div>
                </ManagerCard>

                <ManagerCard className="p-5 min-h-56">
                    <p className="font-black">Vendor Category Distribution</p>
                    <div className="h-40 mt-5 flex items-end justify-center gap-6">
                        {categories.map((item) => (
                            <div key={item.category} className="flex flex-col items-center gap-2">
                                <div className="w-8 rounded-t-md bg-[#9a4f00]" style={{ height: `${item.height}%` }} />
                                <span className="text-[10px] text-slate-500 max-w-16 truncate">{item.category}</span>
                            </div>
                        ))}
                    </div>
                </ManagerCard>
            </div>
        </>
    );
};

export default ManagerVendors;
