import LineIcon from "../../components/LineIcon";
import AdminCard, { AdminStatCard } from "../../components/admin/AdminCard";
import Pagination, { usePagination } from "../../components/Pagination";

const statusLabel = {
    pending: "Chờ xử lý",
    confirmed: "Đã xác nhận",
    preparing: "Đang chuẩn bị",
    shipping: "Đang giao",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
    rejected: "Từ chối",
};

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
    const {
        currentPage,
        pageItems: pagedOrders,
        setCurrentPage,
        totalPages,
    } = usePagination(orders);

    const handleExport = () => {
        downloadCsv(
            "orders.csv",
            ["Mã đơn", "Khách hàng", "Nhà bán hàng", "Tổng tiền", "Trạng thái", "Ngày tạo"],
            orders.map((order) => [
                order.id,
                order.user?.name || order.userId,
                order.shop?.name || order.shopId,
                Number(order.total || 0),
                statusLabel[order.status] || order.status,
                order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : "",
            ])
        );
    };

    return (
        <div className="space-y-6">
            <div><p className="text-2xl font-black">Quản lý đơn hàng</p><p className="text-xs text-slate-500 mt-1">Theo dõi và quản lý luồng đơn hàng trên toàn hệ thống.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <AdminStatCard icon={<LineIcon name="box" size={18} />} label="Tổng đơn hàng" value={orders.length} />
                <AdminStatCard icon={<LineIcon name="truck" size={18} />} label="Đơn đang giao" value={orders.filter((o) => ["confirmed", "preparing", "shipping"].includes(o.status)).length} tone="amber" />
                <AdminStatCard icon={<LineIcon name="wallet" size={18} />} label="Doanh thu hôm nay" value={fmtMoney(stats.todayRevenue)} />
                <AdminStatCard icon={<LineIcon name="receipt" size={18} />} label="Tỷ lệ hủy/hoàn" value={`${stats.returnRate}%`} tone="red" />
            </div>
            <AdminCard className="p-5">
                <div className="flex justify-between">
                    <p className="font-black">Danh sách đơn hàng</p>
                    <button onClick={handleExport} className="rounded-md bg-red-600 px-4 py-2 text-xs font-bold text-white">
                        Xuất đơn hàng
                    </button>
                </div>
                <div className="mt-5 overflow-hidden rounded-lg border border-slate-200">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-[10px] uppercase text-slate-400"><tr><th className="px-4 py-3">Đơn hàng</th><th>Khách hàng</th><th>Nhà bán hàng</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead>
                        <tbody className="divide-y divide-slate-100">
                            {pagedOrders.map((order) => (
                                <tr key={order.id}><td className="px-4 py-3 font-bold">#{order.id}</td><td>{order.user?.name || order.userId}</td><td>{order.shop?.name || order.shopId}</td><td>{fmtMoney(order.total)}</td><td>{statusLabel[order.status] || order.status}</td></tr>
                            ))}
                        </tbody>
                    </table>
                    <Pagination
                        currentPage={currentPage}
                        totalItems={orders.length}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </AdminCard>
        </div>
    );
};

export default AdminOrders;
