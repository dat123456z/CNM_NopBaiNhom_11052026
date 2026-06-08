import LineIcon from "../../components/LineIcon";
import AdminCard, { AdminStatCard } from "../../components/admin/AdminCard";

const fmtMoney = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const csvValue = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const downloadCsv = (filename, headers, rows) => {
    const csv = [
        headers.map(csvValue).join(","),
        ...rows.map((row) => row.map(csvValue).join(",")),
    ].join("\n");
    const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
};

const AdminOrders = ({ orders, stats }) => {
    const handleExport = () => {
        downloadCsv(
            "orders.csv",
            ["Order ID", "Customer", "Vendor", "Total", "Status", "Created At"],
            orders.map((order) => [
                order.id,
                order.user?.name || order.userId,
                order.shop?.name || order.shopId,
                Number(order.total || 0),
                order.status,
                order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : "",
            ])
        );
    };

    return (
        <div className="space-y-6">
            <div><p className="text-2xl font-black">Order Management</p><p className="text-xs text-slate-500 mt-1">Oversee and manage the global flow of commerce.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <AdminStatCard icon={<LineIcon name="box" size={18} />} label="Total Orders" value={orders.length} />
                <AdminStatCard icon={<LineIcon name="truck" size={18} />} label="Pending Shipments" value={orders.filter((o) => ["confirmed", "preparing", "shipping"].includes(o.status)).length} tone="amber" />
                <AdminStatCard icon={<LineIcon name="wallet" size={18} />} label="Revenue Today" value={fmtMoney(stats.todayRevenue)} />
                <AdminStatCard icon={<LineIcon name="receipt" size={18} />} label="Return Rate" value={`${stats.returnRate}%`} tone="red" />
            </div>
            <AdminCard className="p-5">
                <div className="flex justify-between">
                    <p className="font-black">Order Directory</p>
                    <button onClick={handleExport} className="rounded-md bg-red-600 px-4 py-2 text-xs font-bold text-white">
                        Export Orders
                    </button>
                </div>
                <div className="mt-5 overflow-hidden rounded-lg border border-slate-200">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-[10px] uppercase text-slate-400"><tr><th className="px-4 py-3">Order</th><th>Customer</th><th>Vendor</th><th>Total</th><th>Status</th></tr></thead>
                        <tbody className="divide-y divide-slate-100">
                            {orders.slice(0, 12).map((order) => (
                                <tr key={order.id}><td className="px-4 py-3 font-bold">#{order.id}</td><td>{order.user?.name || order.userId}</td><td>{order.shop?.name || order.shopId}</td><td>{fmtMoney(order.total)}</td><td>{order.status}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </AdminCard>
        </div>
    );
};

export default AdminOrders;
