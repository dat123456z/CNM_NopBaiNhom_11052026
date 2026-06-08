import LineIcon from "../../components/LineIcon";
import AdminCard, { AdminStatCard } from "../../components/admin/AdminCard";

const statusClass = {
    active: "bg-emerald-50 text-emerald-700",
    pending: "bg-blue-50 text-blue-700",
    rejected: "bg-rose-50 text-rose-700",
    hidden: "bg-slate-100 text-slate-600",
    draft: "bg-amber-50 text-amber-700",
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

const AdminProducts = ({ products, stats, onUpdateProductStatus }) => {
    const handleExport = () => {
        downloadCsv(
            "product-audit-report.csv",
            ["ID", "Product", "Category", "Shop", "Submitted", "Status"],
            products.map((product) => [
                product.id,
                product.title,
                product.category || "General",
                product.shop?.name || `Shop #${product.shopId}`,
                product.createdAt ? new Date(product.createdAt).toLocaleDateString("vi-VN") : "",
                product.status,
            ])
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <p className="text-2xl font-black">System Overview</p>
                <p className="text-xs text-slate-500 mt-1">Product control, moderation, and compliance queue.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <AdminStatCard icon={<LineIcon name="clipboard" size={18} />} label="Total Pending" value={stats.pendingProducts} sub="+5 today" />
                <AdminStatCard icon={<LineIcon name="eye" size={18} />} label="In Verification" value={products.filter((p) => p.status === "draft").length} sub="urgent" tone="amber" />
                <AdminStatCard icon={<LineIcon name="check" size={18} />} label="Approved Today" value={products.filter((p) => p.status === "active").length} sub="active" />
                <AdminStatCard icon={<LineIcon name="x" size={18} />} label="Rejected" value={products.filter((p) => p.status === "rejected").length} sub="fraud flagged" tone="red" />
            </div>
            <AdminCard className="overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex justify-between">
                    <p className="font-black">Recent Submissions Detail</p>
                    <button onClick={handleExport} className="rounded-md bg-slate-900 px-4 py-2 text-xs font-bold text-white">
                        Export Audit Report
                    </button>
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-[10px] uppercase text-slate-400"><tr><th className="px-5 py-3">Product</th><th>Shop</th><th>Submitted</th><th>Status</th><th className="text-right pr-5">Actions</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">
                        {products.slice(0, 12).map((product) => (
                            <tr key={product.id}>
                                <td className="px-5 py-4 font-bold">{product.title}<p className="text-[10px] text-slate-400">{product.category || "General"}</p></td>
                                <td>{product.shop?.name || `Shop #${product.shopId}`}</td>
                                <td>{product.createdAt ? new Date(product.createdAt).toLocaleDateString("vi-VN") : ""}</td>
                                <td><span className={`rounded-full px-2 py-1 text-[10px] font-black ${statusClass[product.status] || statusClass.hidden}`}>{product.status}</span></td>
                                <td className="text-right pr-5 space-x-3">
                                    {product.status === "pending" && <button onClick={() => onUpdateProductStatus(product.id, "active")} className="text-xs font-bold text-emerald-600">Approve</button>}
                                    {product.status === "pending" && <button onClick={() => onUpdateProductStatus(product.id, "rejected")} className="text-xs font-bold text-rose-600">Reject</button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </AdminCard>
        </div>
    );
};

export default AdminProducts;
