import LineIcon from "../../components/LineIcon";
import AdminCard, { AdminStatCard } from "../../components/admin/AdminCard";

const fmtMoney = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;
const fmtNumber = (value) => Number(value || 0).toLocaleString("vi-VN");

const AdminOverview = ({ stats, vendors }) => {
    const bars = [34, 48, 28, 64, 52, 78, 92];

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-2xl font-black">System Overview</p>
                    <p className="text-xs text-slate-500 mt-1">Real-time status and operational metrics for UTEShop Enterprise.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black">System Healthy</span>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-5">
                <AdminCard className="p-5">
                    <div className="flex items-center justify-between">
                        <p className="font-black">Total System Sales</p>
                        <div className="flex rounded-md bg-slate-100 p-1 text-[10px] font-bold">
                            <span className="px-2 py-1 text-slate-500">Daily</span>
                            <span className="px-2 py-1 rounded bg-red-500 text-white">Monthly</span>
                            <span className="px-2 py-1 text-slate-500">Yearly</span>
                        </div>
                    </div>
                    <div className="h-64 mt-6 flex items-end gap-5 px-6">
                        {bars.map((height, index) => (
                            <div key={index} className={`flex-1 rounded-t-md ${index > 4 ? "bg-red-500" : "bg-red-100"}`} style={{ height: `${height}%` }} />
                        ))}
                    </div>
                    <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                        <div><p className="text-[10px] uppercase text-slate-400 font-bold">Gross Value</p><p className="font-black">{fmtMoney(stats.totalRevenue)}</p></div>
                        <div><p className="text-[10px] uppercase text-slate-400 font-bold">Commission</p><p className="font-black">{fmtMoney(stats.commission)}</p></div>
                        <div><p className="text-[10px] uppercase text-slate-400 font-bold">Growth</p><p className="font-black text-emerald-600">+12.4%</p></div>
                    </div>
                </AdminCard>

                <div className="space-y-5">
                    <AdminCard className="p-5">
                        <p className="text-[10px] uppercase text-slate-400 font-black">System Health</p>
                        {[
                            ["API Latency", "24ms", 88],
                            ["Database Load", "42%", 42],
                            ["Queue Backlog", `${stats.pendingProducts} items`, 22],
                        ].map(([label, value, width]) => (
                            <div key={label} className="mt-4">
                                <div className="flex justify-between text-xs font-bold"><span>{label}</span><span className="text-emerald-600">{value}</span></div>
                                <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${width}%` }} /></div>
                            </div>
                        ))}
                    </AdminCard>
                    <AdminCard className="p-5">
                        <p className="text-[10px] uppercase text-slate-400 font-black">Quick Actions</p>
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            {["Invite Vendor", "Backup DB", "Audit Log", "Restart Cache"].map((item) => (
                                <button key={item} className="h-16 rounded-md border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50">{item}</button>
                            ))}
                        </div>
                    </AdminCard>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <AdminStatCard icon={<LineIcon name="users" size={18} />} label="Total Users" value={fmtNumber(stats.totalUsers)} sub="+240 today" />
                <AdminStatCard icon={<LineIcon name="shop" size={18} />} label="Verified Vendors" value={fmtNumber(stats.activeVendors)} sub={`${stats.pendingVendors} pending`} />
                <AdminStatCard icon={<LineIcon name="alert" size={18} />} label="Pending Products" value={fmtNumber(stats.pendingProducts)} sub="High attention" tone="red" />
            </div>

            <AdminCard className="overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex justify-between"><p className="font-black">Recent Vendor Onboarding</p><button className="text-xs font-bold text-blue-600">View All Vendors</button></div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-[10px] uppercase text-slate-400"><tr><th className="px-5 py-3">Vendor Name</th><th>Category</th><th>Region</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">
                        {vendors.slice(0, 4).map((shop) => (
                            <tr key={shop.id}>
                                <td className="px-5 py-4 font-bold">{shop.name}<p className="text-[10px] text-slate-400">joined recently</p></td>
                                <td>{shop.category || "Marketplace"}</td>
                                <td>{shop.address || "Vietnam"}</td>
                                <td><span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700">{shop.status}</span></td>
                                <td><LineIcon name="edit" size={15} className="text-slate-400" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </AdminCard>
        </div>
    );
};

export default AdminOverview;
