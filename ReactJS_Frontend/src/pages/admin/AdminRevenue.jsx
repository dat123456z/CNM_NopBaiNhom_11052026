import LineIcon from "../../components/LineIcon";
import AdminCard, { AdminStatCard } from "../../components/admin/AdminCard";
import Pagination, { usePagination } from "../../components/Pagination";

const COMMISSION_RATE = 0.125;

const fmtMoney = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;
const fmtNumber = (value) => Number(value || 0).toLocaleString("vi-VN");

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

const getDeliveredOrders = (orders) => orders.filter((order) => order.status === "delivered");

const buildVendorRevenue = (orders, vendors) => {
    const vendorMap = new Map(vendors.map((vendor) => [Number(vendor.id), vendor]));

    orders.forEach((order) => {
        const shopId = Number(order.shopId || order.shop?.id);
        if (!vendorMap.has(shopId)) {
            vendorMap.set(shopId, {
                id: shopId,
                name: order.shop?.name || `Shop #${shopId}`,
                status: order.shop?.status || "unknown",
            });
        }
    });

    return Array.from(vendorMap.values())
        .map((vendor) => {
            const vendorOrders = orders.filter((order) => Number(order.shopId || order.shop?.id) === Number(vendor.id));
            const gross = vendorOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
            const commission = Math.round(gross * COMMISSION_RATE);
            return {
                ...vendor,
                orderCount: vendorOrders.length,
                gross,
                commission,
                payout: Math.max(0, gross - commission),
                lastOrderAt: vendorOrders
                    .map((order) => order.deliveredAt || order.createdAt)
                    .filter(Boolean)
                    .sort()
                    .at(-1),
            };
        })
        .filter((vendor) => vendor.orderCount > 0)
        .sort((a, b) => b.gross - a.gross);
};

const buildCategoryRevenue = (orders) => {
    const totals = new Map();

    orders.forEach((order) => {
        const items = Array.isArray(order.items) ? order.items : [];
        if (items.length === 0) {
            const key = "Chưa phân loại";
            totals.set(key, (totals.get(key) || 0) + Number(order.total || 0));
            return;
        }

        const itemTotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0) || 1;
        items.forEach((item) => {
            const key = item.product?.category || item.category || "Chưa phân loại";
            const share = (Number(item.price || 0) * Number(item.quantity || 0)) / itemTotal;
            totals.set(key, (totals.get(key) || 0) + Number(order.total || 0) * share);
        });
    });

    return Array.from(totals.entries())
        .map(([category, value]) => ({ category, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);
};

const AdminRevenue = ({ orders, vendors }) => {
    const deliveredOrders = getDeliveredOrders(orders);
    const vendorRevenue = buildVendorRevenue(deliveredOrders, vendors);
    const {
        currentPage: topVendorPage,
        pageItems: pagedTopVendors,
        setCurrentPage: setTopVendorPage,
        totalPages: topVendorPages,
    } = usePagination(vendorRevenue);
    const {
        currentPage: settlementPage,
        pageItems: pagedSettlements,
        setCurrentPage: setSettlementPage,
        totalPages: settlementPages,
    } = usePagination(vendorRevenue);
    const categoryRevenue = buildCategoryRevenue(deliveredOrders);
    const gross = deliveredOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const commission = Math.round(gross * COMMISSION_RATE);
    const payout = Math.max(0, gross - commission);
    const paidOrders = deliveredOrders.filter((order) => order.paymentStatus === "paid").length;
    const maxVendorRevenue = Math.max(...vendorRevenue.map((vendor) => vendor.gross), 0);
    const maxCategoryRevenue = Math.max(...categoryRevenue.map((item) => item.value), 0);

    const handleExport = () => {
        downloadCsv(
            "vendor-settlements.csv",
            ["Nhà bán hàng", "Đơn hàng", "Doanh thu gộp", "Hoa hồng", "Thanh toán", "Đơn cuối"],
            vendorRevenue.map((vendor) => [
                vendor.name,
                vendor.orderCount,
                vendor.gross,
                vendor.commission,
                vendor.payout,
                vendor.lastOrderAt ? new Date(vendor.lastOrderAt).toLocaleDateString("vi-VN") : "",
            ])
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <p className="text-2xl font-black">Quản lý doanh thu</p>
                <p className="text-xs text-slate-500 mt-1">Báo cáo tài chính, hoa hồng và khoản thanh toán cho nhà bán hàng từ các đơn đã giao.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <AdminStatCard icon={<LineIcon name="card" size={18} />} label="Doanh thu đã giao" value={fmtMoney(gross)} sub={`${fmtNumber(deliveredOrders.length)} đơn đã giao`} />
                <AdminStatCard icon={<LineIcon name="coin" size={18} />} label="Hoa hồng nền tảng" value={fmtMoney(commission)} sub={`${COMMISSION_RATE * 100}% mức cơ bản`} tone="red" />
                <AdminStatCard icon={<LineIcon name="wallet" size={18} />} label="Thanh toán nhà bán hàng" value={fmtMoney(payout)} sub={`${fmtNumber(vendorRevenue.length)} nhà bán hàng`} />
                <AdminStatCard icon={<LineIcon name="receipt" size={18} />} label="Đơn đã thanh toán" value={fmtNumber(paidOrders)} sub={`${fmtNumber(Math.max(0, deliveredOrders.length - paidOrders))} chưa thanh toán/hoàn tiền`} tone="amber" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">
                <AdminCard className="p-5">
                    <div className="flex items-center justify-between">
                        <p className="font-black">Nhà bán hàng có doanh thu cao</p>
                        <button onClick={handleExport} className="rounded-md bg-blue-600 px-4 py-2 text-xs font-bold text-white">
                            Xuất đối soát
                        </button>
                    </div>
                    <div className="mt-6 space-y-4">
                        {pagedTopVendors.map((vendor) => (
                            <div key={vendor.id}>
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span>{vendor.name}</span>
                                    <span>{fmtMoney(vendor.gross)}</span>
                                </div>
                                <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-blue-600"
                                        style={{ width: `${maxVendorRevenue > 0 ? (vendor.gross / maxVendorRevenue) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                        {vendorRevenue.length === 0 && <p className="py-8 text-center text-sm font-bold text-slate-400">Chưa có doanh thu từ đơn đã giao.</p>}
                    </div>
                    <Pagination
                        currentPage={topVendorPage}
                        totalItems={vendorRevenue.length}
                        totalPages={topVendorPages}
                        onPageChange={setTopVendorPage}
                    />
                </AdminCard>

                <AdminCard className="p-5">
                    <p className="font-black">Doanh thu theo danh mục</p>
                    <div className="mt-6 space-y-4">
                        {categoryRevenue.map((item) => (
                            <div key={item.category}>
                                <div className="flex justify-between text-xs font-bold">
                                    <span>{item.category}</span>
                                    <span>{fmtMoney(Math.round(item.value))}</span>
                                </div>
                                <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-emerald-500"
                                        style={{ width: `${maxCategoryRevenue > 0 ? (item.value / maxCategoryRevenue) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                        {categoryRevenue.length === 0 && <p className="py-8 text-center text-sm font-bold text-slate-400">Chưa có doanh thu theo danh mục.</p>}
                    </div>
                </AdminCard>
            </div>

            <AdminCard className="overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                    <p className="font-black">Tóm tắt đối soát nhà bán hàng</p>
                    <p className="mt-1 text-xs text-slate-500">Thanh toán = doanh thu gộp đã giao trừ hoa hồng nền tảng.</p>
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-[10px] uppercase text-slate-400">
                        <tr>
                            <th className="px-5 py-3">Nhà bán hàng</th>
                            <th>Đơn hàng</th>
                            <th>Doanh thu gộp</th>
                            <th>Hoa hồng</th>
                            <th>Thanh toán</th>
                            <th>Đơn cuối</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {pagedSettlements.map((vendor) => (
                            <tr key={vendor.id}>
                                <td className="px-5 py-4 font-bold">{vendor.name}</td>
                                <td>{vendor.orderCount}</td>
                                <td>{fmtMoney(vendor.gross)}</td>
                                <td>{fmtMoney(vendor.commission)}</td>
                                <td className="font-bold text-emerald-600">{fmtMoney(vendor.payout)}</td>
                                <td>{vendor.lastOrderAt ? new Date(vendor.lastOrderAt).toLocaleDateString("vi-VN") : ""}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Pagination
                    currentPage={settlementPage}
                    totalItems={vendorRevenue.length}
                    totalPages={settlementPages}
                    onPageChange={setSettlementPage}
                />
            </AdminCard>
        </div>
    );
};

export default AdminRevenue;
