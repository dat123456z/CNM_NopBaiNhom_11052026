import { useMemo, useState } from "react";
import LineIcon from "../../components/LineIcon";
import AdminCard, { AdminStatCard } from "../../components/admin/AdminCard";
import Pagination, { usePagination } from "../../components/Pagination";

const fmtMoney = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;
const fmtNumber = (value) => Number(value || 0).toLocaleString("vi-VN");

const PERIODS = [
    { value: "daily", label: "Ngày" },
    { value: "monthly", label: "Tháng" },
    { value: "yearly", label: "Năm" },
];

const shopStatusLabel = {
    active: "Đã xác minh",
    pending: "Chờ duyệt",
    suspended: "Tạm khóa",
    closed: "Đã đóng",
};

const getOrderDate = (order) => {
    const date = new Date(order.deliveredAt || order.createdAt);
    return Number.isNaN(date.getTime()) ? null : date;
};

const buildRevenueBuckets = (orders, period) => {
    const now = new Date();
    const buckets = [];

    if (period === "daily") {
        for (let offset = 6; offset >= 0; offset -= 1) {
            const date = new Date(now);
            date.setDate(now.getDate() - offset);
            buckets.push({
                key: date.toDateString(),
                label: date.toLocaleDateString("vi-VN", { weekday: "short" }),
                value: 0,
            });
        }
    } else if (period === "monthly") {
        for (let offset = 5; offset >= 0; offset -= 1) {
            const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
            buckets.push({
                key: `${date.getFullYear()}-${date.getMonth()}`,
                label: `T${date.getMonth() + 1}`,
                value: 0,
            });
        }
    } else {
        for (let offset = 5; offset >= 0; offset -= 1) {
            const year = now.getFullYear() - offset;
            buckets.push({ key: String(year), label: String(year), value: 0 });
        }
    }

    orders
        .filter((order) => order.status === "delivered")
        .forEach((order) => {
            const date = getOrderDate(order);
            if (!date) return;

            const key = period === "daily"
                ? date.toDateString()
                : period === "monthly"
                    ? `${date.getFullYear()}-${date.getMonth()}`
                    : String(date.getFullYear());
            const bucket = buckets.find((item) => item.key === key);
            if (bucket) bucket.value += Number(order.total || 0);
        });

    const maxValue = Math.max(...buckets.map((bucket) => bucket.value), 0);
    return buckets.map((bucket) => ({
        ...bucket,
        height: maxValue > 0 ? Math.max((bucket.value / maxValue) * 100, 8) : 0,
    }));
};

const getPreviousRangeRevenue = (orders, period) => {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);

    if (period === "daily") {
        start.setDate(now.getDate() - 13);
        start.setHours(0, 0, 0, 0);
        end.setDate(now.getDate() - 7);
        end.setHours(23, 59, 59, 999);
    } else if (period === "monthly") {
        start.setMonth(now.getMonth() - 11, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(now.getMonth() - 6, 1);
        end.setMonth(end.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
    } else {
        start.setFullYear(now.getFullYear() - 11, 0, 1);
        start.setHours(0, 0, 0, 0);
        end.setFullYear(now.getFullYear() - 6, 11, 31);
        end.setHours(23, 59, 59, 999);
    }

    return orders
        .filter((order) => order.status === "delivered")
        .reduce((sum, order) => {
            const date = getOrderDate(order);
            return date && date >= start && date <= end ? sum + Number(order.total || 0) : sum;
        }, 0);
};

const AdminOverview = ({ stats, vendors, orders = [] }) => {
    const [period, setPeriod] = useState("monthly");
    const bars = useMemo(() => buildRevenueBuckets(orders, period), [orders, period]);
    const {
        currentPage,
        pageItems: pagedVendors,
        setCurrentPage,
        totalPages,
    } = usePagination(vendors);
    const grossValue = bars.reduce((sum, bucket) => sum + bucket.value, 0);
    const previousValue = useMemo(() => getPreviousRangeRevenue(orders, period), [orders, period]);
    const growth = previousValue > 0 ? ((grossValue - previousValue) / previousValue) * 100 : null;

    return (
        <div className="space-y-6">
            <div>
                <p className="text-2xl font-black">Tổng quan hệ thống</p>
                <p className="text-xs text-slate-500 mt-1">Trạng thái thời gian thực và các chỉ số vận hành của UTEShop.</p>
            </div>

            <AdminCard className="p-5">
                <div className="flex items-center justify-between">
                    <p className="font-black">Doanh số toàn hệ thống</p>
                    <div className="flex rounded-md bg-slate-100 p-1 text-[10px] font-bold">
                        {PERIODS.map((item) => (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => setPeriod(item.value)}
                                className={`px-2 py-1 rounded ${period === item.value ? "bg-red-500 text-white" : "text-slate-500"}`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="h-64 mt-6 flex items-end gap-5 px-6">
                    {bars.map((bar, index) => (
                        <div key={bar.key} className="flex-1 h-full flex flex-col justify-end gap-2">
                            <div
                                title={`${bar.label}: ${fmtMoney(bar.value)}`}
                                className={`rounded-t-md ${index >= bars.length - 2 ? "bg-red-500" : "bg-red-100"}`}
                                style={{ height: `${bar.height}%` }}
                            />
                            <span className="text-center text-[10px] font-bold text-slate-400">{bar.label}</span>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                    <div><p className="text-[10px] uppercase text-slate-400 font-bold">Tổng giá trị</p><p className="font-black">{fmtMoney(grossValue)}</p></div>
                    <div><p className="text-[10px] uppercase text-slate-400 font-bold">Hoa hồng</p><p className="font-black">{fmtMoney(Math.round(grossValue * 0.125))}</p></div>
                    <div><p className="text-[10px] uppercase text-slate-400 font-bold">Tăng trưởng</p><p className={`font-black ${growth == null || growth >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{growth == null ? "Chưa có" : `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`}</p></div>
                </div>
            </AdminCard>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <AdminStatCard icon={<LineIcon name="users" size={18} />} label="Tổng người dùng" value={fmtNumber(stats.totalUsers)} />
                <AdminStatCard icon={<LineIcon name="shop" size={18} />} label="Nhà bán hàng đã duyệt" value={fmtNumber(stats.activeVendors)} sub={`${stats.pendingVendors} đang chờ`} />
                <AdminStatCard icon={<LineIcon name="alert" size={18} />} label="Sản phẩm chờ duyệt" value={fmtNumber(stats.pendingProducts)} sub="Cần chú ý" tone="red" />
            </div>

            <AdminCard className="overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex justify-between"><p className="font-black">Nhà bán hàng mới đăng ký</p><button className="text-xs font-bold text-blue-600">Xem tất cả nhà bán hàng</button></div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-[10px] uppercase text-slate-400"><tr><th className="px-5 py-3">Tên nhà bán hàng</th><th>Danh mục</th><th>Khu vực</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">
                        {pagedVendors.map((shop) => (
                            <tr key={shop.id}>
                                <td className="px-5 py-4 font-bold">{shop.name}<p className="text-[10px] text-slate-400">mới tham gia</p></td>
                                <td>{shop.category || "Sàn thương mại"}</td>
                                <td>{shop.address || "Việt Nam"}</td>
                                <td><span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700">{shopStatusLabel[shop.status] || shop.status}</span></td>
                                <td><LineIcon name="edit" size={15} className="text-slate-400" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Pagination
                    currentPage={currentPage}
                    totalItems={vendors.length}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </AdminCard>
        </div>
    );
};

export default AdminOverview;
