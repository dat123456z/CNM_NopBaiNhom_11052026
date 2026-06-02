import LineIcon from "../../components/LineIcon";
import AdminCard, { AdminStatCard } from "../../components/admin/AdminCard";

const fmtMoney = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const AdminRevenue = ({ orders, vendors, stats }) => {
    const bars = [42, 31, 55, 74, 48, 82];
    return (
        <div className="space-y-6">
            <div><p className="text-2xl font-black">Revenue Control</p><p className="text-xs text-slate-500 mt-1">Financial reporting, commissions, and vendor payouts.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <AdminStatCard icon={<LineIcon name="card" size={18} />} label="Total Volume" value={fmtMoney(stats.totalRevenue)} sub="+14.2% last month" />
                <AdminStatCard icon={<LineIcon name="coin" size={18} />} label="Commission" value={fmtMoney(stats.commission)} sub="base rate 12.5%" tone="red" />
                <AdminStatCard icon={<LineIcon name="wallet" size={18} />} label="Total Payouts" value={fmtMoney(Math.max(0, stats.totalRevenue - stats.commission))} />
                <AdminStatCard icon={<LineIcon name="receipt" size={18} />} label="Settlements" value={fmtMoney(stats.totalRevenue)} sub="completion 48 hours" tone="amber" />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-5">
                <AdminCard className="p-5">
                    <p className="font-black">Revenue Flow by Category</p>
                    <div className="h-64 mt-6 flex items-end gap-5 px-6">
                        {bars.map((height, index) => <div key={index} className={`flex-1 rounded-t-md ${index === 5 ? "bg-blue-600" : "bg-blue-100"}`} style={{ height: `${height}%` }} />)}
                    </div>
                </AdminCard>
                <AdminCard className="p-5">
                    <p className="font-black">Income Streams</p>
                    <div className="mx-auto mt-8 w-36 h-36 rounded-full border-[22px] border-blue-600 flex items-center justify-center text-center text-xs font-black">Total Share<br />100%</div>
                    <div className="mt-8 space-y-3 text-xs font-bold"><p>Sales Commission 65%</p><p>Premium Subs 22%</p><p>Promotional Fees 13%</p></div>
                </AdminCard>
            </div>
            <AdminCard className="overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex justify-between"><p className="font-black">Vendor Payout Requests</p><button className="text-xs font-bold text-blue-600">View All</button></div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-[10px] uppercase text-slate-400"><tr><th className="px-5 py-3">Vendor Name</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">{vendors.slice(0, 5).map((shop) => <tr key={shop.id}><td className="px-5 py-4 font-bold">{shop.name}</td><td>{fmtMoney(shop.monthlySales || 0)}</td><td>Processed</td><td>{new Date(shop.createdAt).toLocaleDateString("vi-VN")}</td><td>...</td></tr>)}</tbody>
                </table>
            </AdminCard>
        </div>
    );
};

export default AdminRevenue;
