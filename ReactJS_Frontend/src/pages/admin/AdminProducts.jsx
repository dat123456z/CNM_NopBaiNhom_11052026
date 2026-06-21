import LineIcon from "../../components/LineIcon";
import AdminCard, { AdminStatCard } from "../../components/admin/AdminCard";
import Pagination, { usePagination } from "../../components/Pagination";

const statusClass = {
    active: "bg-emerald-50 text-emerald-700",
    pending: "bg-blue-50 text-blue-700",
    rejected: "bg-rose-50 text-rose-700",
    hidden: "bg-slate-100 text-slate-600",
    draft: "bg-amber-50 text-amber-700",
};

const statusLabel = {
    active: "Đã duyệt",
    pending: "Chờ duyệt",
    rejected: "Từ chối",
    hidden: "Đã ẩn",
    draft: "Cần kiểm tra",
};

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

const AdminProducts = ({ products, stats }) => {
    const {
        currentPage,
        pageItems: pagedProducts,
        setCurrentPage,
        totalPages,
    } = usePagination(products);

    const handleExport = () => {
        downloadCsv(
            "product-audit-report.csv",
            ["ID", "Sản phẩm", "Danh mục", "Shop", "Ngày gửi", "Trạng thái"],
            products.map((product) => [
                product.id,
                product.title,
                product.category || "Chung",
                product.shop?.name || `Shop #${product.shopId}`,
                product.createdAt ? new Date(product.createdAt).toLocaleDateString("vi-VN") : "",
                statusLabel[product.status] || product.status,
            ])
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <p className="text-2xl font-black">Kiểm duyệt sản phẩm</p>
                <p className="text-xs text-slate-500 mt-1">Quản lý sản phẩm, kiểm duyệt và hàng chờ tuân thủ.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <AdminStatCard icon={<LineIcon name="clipboard" size={18} />} label="Đang chờ duyệt" value={stats.pendingProducts} sub="+5 hôm nay" />
                <AdminStatCard icon={<LineIcon name="eye" size={18} />} label="Đang xác minh" value={products.filter((p) => p.status === "draft").length} sub="khẩn cấp" tone="amber" />
                <AdminStatCard icon={<LineIcon name="check" size={18} />} label="Đã duyệt" value={products.filter((p) => p.status === "active").length} sub="đang bán" />
                <AdminStatCard icon={<LineIcon name="x" size={18} />} label="Bị từ chối" value={products.filter((p) => p.status === "rejected").length} sub="cần rà soát" tone="red" />
            </div>
            <AdminCard className="overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex justify-between">
                    <p className="font-black">Chi tiết sản phẩm mới gửi</p>
                    <button onClick={handleExport} className="rounded-md bg-slate-900 px-4 py-2 text-xs font-bold text-white">
                        Xuất báo cáo kiểm duyệt
                    </button>
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-[10px] uppercase text-slate-400"><tr><th className="px-5 py-3">Sản phẩm</th><th>Cửa hàng</th><th>Ngày gửi</th><th>Trạng thái</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">
                        {pagedProducts.map((product) => (
                            <tr key={product.id}>
                                <td className="px-5 py-4 font-bold">{product.title}<p className="text-[10px] text-slate-400">{product.category || "Chung"}</p></td>
                                <td>{product.shop?.name || `Shop #${product.shopId}`}</td>
                                <td>{product.createdAt ? new Date(product.createdAt).toLocaleDateString("vi-VN") : ""}</td>
                                <td><span className={`rounded-full px-2 py-1 text-[10px] font-black ${statusClass[product.status] || statusClass.hidden}`}>{statusLabel[product.status] || product.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Pagination
                    currentPage={currentPage}
                    totalItems={products.length}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </AdminCard>
        </div>
    );
};

export default AdminProducts;
