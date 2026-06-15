import { useState } from "react";
import LineIcon from "../../components/LineIcon";
import { ManagerCard } from "../../components/manager/ManagerCard";
import Pagination, { usePagination } from "../../components/Pagination";

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
}) => {
    const [rejectModal, setRejectModal] = useState({ open: false, product: null, reason: "" });
    const {
        currentPage,
        pageItems: pagedProducts,
        setCurrentPage,
        totalPages,
    } = usePagination(pendingProducts);

    const openRejectModal = (product) => {
        setRejectModal({ open: true, product, reason: "" });
    };

    const closeRejectModal = () => {
        setRejectModal({ open: false, product: null, reason: "" });
    };

    const submitReject = () => {
        const reason = rejectModal.reason.trim();
        if (!reason || !rejectModal.product) return;
        onUpdateProductStatus(rejectModal.product.id, "rejected", reason);
        closeRejectModal();
    };

    return (
        <>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-2xl font-black">Duyệt sản phẩm</p>
                    <p className="text-xs text-slate-500 mt-1">Rà soát các sản phẩm chờ duyệt theo tiêu chuẩn chất lượng và tuân thủ.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <ManagerCard className="px-5 py-3">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Chờ duyệt</p>
                        <p className="text-xl font-black text-[#9a4f00]">{pendingProducts.length}</p>
                    </ManagerCard>
                    <ManagerCard className="px-5 py-3">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Thời gian phản hồi TB</p>
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
                                    Sản phẩm cần duyệt: #PX-{selectedProduct.id}
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black">Ưu tiên cao</span>
                                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black">{selectedProduct.category || "Chung"}</span>
                                </div>
                            </div>

                            <div className="p-5 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
                                <div className="aspect-square rounded-md bg-slate-100 overflow-hidden flex items-center justify-center">
                                    {selectedImage ? <img src={selectedImage} alt={selectedProduct.title} className="w-full h-full object-cover" /> : <LineIcon name="box" size={58} className="text-slate-300" />}
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-400">Tên sản phẩm</p>
                                        <h2 className="text-xl font-black text-slate-950">{selectedProduct.title}</h2>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-400">Mô tả</p>
                                        <p className="text-sm text-slate-600 leading-relaxed">{selectedProduct.desc || "Sản phẩm chưa có mô tả chi tiết."}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-5">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-slate-400">Giá</p>
                                            <p className="font-black">{fmtMoney(selectedProduct.price)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-slate-400">Nhà bán hàng</p>
                                            <p className="font-black">{selectedProduct.shop?.name || `Shop #${selectedProduct.shopId}`}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-5 py-4 bg-[#edf3ff] border-t border-slate-200 flex justify-end gap-3">
                                <button onClick={() => openRejectModal(selectedProduct)} className="h-10 px-5 rounded-md border border-rose-300 bg-white text-xs font-bold text-rose-700">Từ chối</button>
                                <button onClick={() => onUpdateProductStatus(selectedProduct.id, "active")} className="h-10 px-5 rounded-md bg-[#9a4f00] text-xs font-bold text-white">Duyệt sản phẩm</button>
                            </div>
                        </>
                    ) : (
                        <div className="p-16 text-center text-slate-400">Không có sản phẩm nào đang chờ duyệt.</div>
                    )}
                </ManagerCard>

                <ManagerCard className="overflow-hidden h-fit">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <p className="font-black">Tiếp theo trong hàng chờ</p>
                        <span className="text-[10px] text-slate-400">Ưu tiên cao nhất</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {pagedProducts.map((product) => (
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
                                <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 rounded-full px-2 py-1">Sẵn sàng</span>
                            </button>
                        ))}
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalItems={pendingProducts.length}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </ManagerCard>
            </div>

            {rejectModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
                        <p className="text-lg font-black text-slate-950">Lý do từ chối</p>
                        <p className="mt-1 text-xs text-slate-500">Ghi rõ lý do từ chối hoặc nội dung nhà bán hàng cần chỉnh sửa.</p>
                        <textarea
                            value={rejectModal.reason}
                            onChange={(event) => setRejectModal((prev) => ({ ...prev, reason: event.target.value }))}
                            rows={5}
                            className="mt-4 w-full rounded-md border border-slate-200 p-3 text-sm outline-none focus:border-[#9a4f00] focus:ring-2 focus:ring-amber-100"
                            placeholder="Ví dụ: Hình ảnh chưa rõ, mô tả thiếu thông tin chất liệu..."
                        />
                        <div className="mt-4 flex justify-end gap-3">
                            <button type="button" onClick={closeRejectModal} className="h-10 rounded-md border border-slate-200 px-4 text-xs font-bold text-slate-600">
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={submitReject}
                                disabled={!rejectModal.reason.trim()}
                                className="h-10 rounded-md bg-rose-600 px-4 text-xs font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                                Xác nhận từ chối
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ManagerProductModeration;
