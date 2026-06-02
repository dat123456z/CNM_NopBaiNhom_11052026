import LineIcon from "../../components/LineIcon";
import { ManagerCard } from "../../components/manager/ManagerCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const fmtMoney = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;
const getImageSrc = (image) => {
    if (!image) return "";
    return image.startsWith("http") ? image : `${API_URL}${image}`;
};

const ManagerProductModeration = ({
    pendingProducts,
    selectedProduct,
    selectedImage,
    onSelectProduct,
    onUpdateProductStatus,
}) => (
    <>
        <div className="flex items-start justify-between gap-4">
            <div>
                <p className="text-2xl font-black">Vendors</p>
                <p className="text-xs text-slate-500 mt-1">Review pending listings for compliance and quality standards.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <ManagerCard className="px-5 py-3">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Pending Review</p>
                    <p className="text-xl font-black text-[#9a4f00]">{pendingProducts.length}</p>
                </ManagerCard>
                <ManagerCard className="px-5 py-3">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Avg. Response Time</p>
                    <p className="text-xl font-black">4.2h</p>
                </ManagerCard>
            </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">
            <ManagerCard className="overflow-hidden">
                {selectedProduct ? (
                    <>
                        <div className="px-5 py-4 bg-[#edf3ff] border-b border-slate-200 flex items-center justify-between">
                            <p className="font-black flex items-center gap-2">
                                <LineIcon name="eye" size={16} />
                                Item for Review: #PX-{selectedProduct.id}
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black">High Priority</span>
                                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black">{selectedProduct.category || "General"}</span>
                            </div>
                        </div>

                        <div className="p-5 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
                            <div className="aspect-square rounded-md bg-slate-100 overflow-hidden flex items-center justify-center">
                                {selectedImage ? <img src={selectedImage} alt={selectedProduct.title} className="w-full h-full object-cover" /> : <LineIcon name="box" size={58} className="text-slate-300" />}
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400">Product Title</p>
                                    <h2 className="text-xl font-black text-slate-950">{selectedProduct.title}</h2>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400">Description</p>
                                    <p className="text-sm text-slate-600 leading-relaxed">{selectedProduct.desc || "Sản phẩm chưa có mô tả chi tiết."}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-400">Price</p>
                                        <p className="font-black">{fmtMoney(selectedProduct.price)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-400">Vendor</p>
                                        <p className="font-black">{selectedProduct.shop?.name || `Shop #${selectedProduct.shopId}`}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mx-5 mb-5 rounded-md border border-rose-200 bg-rose-50 p-4 text-rose-800">
                            <p className="text-sm font-black flex items-center gap-2"><LineIcon name="alert" size={16} /> Compliance Flags Detected</p>
                            <ul className="mt-2 list-disc pl-5 text-xs space-y-1">
                                <li>Kiểm tra chất lượng hình ảnh và mô tả sản phẩm.</li>
                                <li>Xác minh danh mục, giá, và thông tin shop trước khi duyệt.</li>
                            </ul>
                        </div>

                        <div className="px-5 py-4 bg-[#edf3ff] border-t border-slate-200 flex justify-end gap-3">
                            <button onClick={() => onUpdateProductStatus(selectedProduct.id, "draft")} className="h-10 px-5 rounded-md border border-slate-300 bg-white text-xs font-bold text-slate-700">Request Changes</button>
                            <button onClick={() => onUpdateProductStatus(selectedProduct.id, "rejected")} className="h-10 px-5 rounded-md border border-rose-300 bg-white text-xs font-bold text-rose-700">Reject Listing</button>
                            <button onClick={() => onUpdateProductStatus(selectedProduct.id, "active")} className="h-10 px-5 rounded-md bg-[#9a4f00] text-xs font-bold text-white">Approve Product</button>
                        </div>
                    </>
                ) : (
                    <div className="p-16 text-center text-slate-400">Không có sản phẩm nào đang chờ duyệt.</div>
                )}
            </ManagerCard>

            <ManagerCard className="overflow-hidden h-fit">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <p className="font-black">Up Next in Queue</p>
                    <span className="text-[10px] text-slate-400">Highest Priority</span>
                </div>
                <div className="divide-y divide-slate-100">
                    {pendingProducts.slice(0, 6).map((product) => (
                        <button
                            key={product.id}
                            onClick={() => onSelectProduct(product)}
                            className={`w-full p-4 text-left flex items-center gap-3 hover:bg-slate-50 ${
                                selectedProduct?.id === product.id ? "bg-[#edf3ff]" : ""
                            }`}
                        >
                            <div className="w-10 h-10 rounded-md bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                                {getImageSrc(product.image) ? <img src={getImageSrc(product.image)} alt={product.title} className="w-full h-full object-cover" /> : <LineIcon name="box" size={18} className="text-slate-300" />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-black truncate">{product.title}</p>
                                <p className="text-[10px] text-slate-400 truncate">{product.shop?.name || `Shop #${product.shopId}`}</p>
                            </div>
                            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 rounded-full px-2 py-1">Ready</span>
                        </button>
                    ))}
                </div>
            </ManagerCard>
        </div>
    </>
);

export default ManagerProductModeration;
