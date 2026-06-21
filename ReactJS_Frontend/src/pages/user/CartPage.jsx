import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb";
import { useCart } from "../../context/CartContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const CartPage = () => {
    const navigate = useNavigate();
    const { items, total, loading, updateItem, removeItem, clearCart } = useCart();
    const [coupon, setCoupon] = useState("");
    const [couponApplied, setCouponApplied] = useState(false);
    const [actionLoading, setActionLoading] = useState({});

    const fmt = (n) => Number(n).toLocaleString("vi-VN") + "đ";

    const handleQtyChange = async (itemId, newQty) => {
        if (newQty < 1) return;
        setActionLoading((p) => ({ ...p, [itemId]: true }));
        try { await updateItem(itemId, newQty); } catch { }
        setActionLoading((p) => ({ ...p, [itemId]: false }));
    };

    const handleRemove = async (itemId) => {
        setActionLoading((p) => ({ ...p, [itemId]: true }));
        try { await removeItem(itemId); } catch { }
        setActionLoading((p) => ({ ...p, [itemId]: false }));
    };

    const handleClear = async () => {
        if (!window.confirm("Xóa toàn bộ giỏ hàng?")) return;
        try { await clearCart(); } catch { }
    };

    const subtotal = total;
    const tax = Math.round(subtotal * 0.08);
    const finalTotal = subtotal + tax;

    if (loading) return (
        <>
            <Breadcrumb align="viewport"/>
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b14f]"></div>
            </div>
        </>
    );

    return (
        <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Giỏ hàng của bạn</h1>
            <p className="text-gray-500 text-sm mb-8">
                {items.length > 0
                    ? `Bạn có ${items.length} sản phẩm trong giỏ hàng.`
                    : "Giỏ hàng của bạn đang trống."}
            </p>

            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <svg className="w-24 h-24 text-gray-200 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h2 className="text-xl font-bold text-gray-700 mb-2">Giỏ hàng trống</h2>
                    <p className="text-gray-400 mb-6">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục.</p>
                    <Link to="/products" className="bg-[#00b14f] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#009943] transition-colors">
                        Khám phá sản phẩm
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items */}
                    <div className="flex-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                <div className="col-span-5">Sản phẩm</div>
                                <div className="col-span-2 text-center">Giá</div>
                                <div className="col-span-3 text-center">Số lượng</div>
                                <div className="col-span-2 text-right">Tổng</div>
                            </div>

                            {items.map((item) => {
                                const imgSrc = item.product?.image
                                    ? (item.product.image.startsWith("http")
                                        ? item.product.image
                                        : `${API_URL}${item.product.image}`)
                                    : null;
                                return (
                                    <div key={item.id} className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-gray-50 hover:bg-gray-50/50 transition-colors items-center">
                                        <div className="col-span-5 flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                                                {imgSrc
                                                    ? <img src={imgSrc} alt={item.product?.title} className="w-full h-full object-cover" />
                                                    : <div className="w-full h-full bg-linear-to-br from-gray-200 to-gray-300" />
                                                }
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm leading-tight">{item.product?.title || "Sản phẩm"}</p>
                                                {item.color && <p className="text-xs text-gray-400 mt-0.5">{item.color}</p>}
                                                <button
                                                    onClick={() => handleRemove(item.id)}
                                                    disabled={actionLoading[item.id]}
                                                    className="text-xs text-red-400 hover:text-red-600 mt-1 flex items-center gap-1 transition-colors"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                    Xóa
                                                </button>
                                            </div>
                                        </div>

                                        <div className="col-span-2 text-center text-sm text-gray-700 font-medium">
                                            {fmt(item.product?.price || 0)}
                                        </div>

                                        <div className="col-span-3 flex justify-center">
                                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                                <button
                                                    onClick={() => handleQtyChange(item.id, item.quantity - 1)}
                                                    disabled={actionLoading[item.id] || item.quantity <= 1}
                                                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-40 font-medium"
                                                >−</button>
                                                <span className="w-8 text-center text-sm font-semibold text-gray-800">{item.quantity}</span>
                                                <button
                                                    onClick={() => handleQtyChange(item.id, item.quantity + 1)}
                                                    disabled={actionLoading[item.id]}
                                                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-40 font-medium"
                                                >+</button>
                                            </div>
                                        </div>

                                        <div className="col-span-2 text-right text-sm font-bold text-[#00b14f]">
                                            {fmt(item.lineTotal || 0)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex justify-between items-center mt-4">
                            <Link to="/products" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors font-medium">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                Tiếp tục mua sắm
                            </Link>
                            <div className="flex gap-3">
                                <button onClick={handleClear} className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-red-500 transition-colors font-medium">
                                    Xóa giỏ hàng
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:w-80 shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
                            <h2 className="font-bold text-gray-900 text-lg mb-5">Tóm tắt đơn hàng</h2>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Tạm tính</span>
                                    <span className="font-medium text-gray-900">{fmt(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Phí vận chuyển</span>
                                    <span className="text-[#00b14f] font-semibold">Miễn phí</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Thuế VAT (8%)</span>
                                    <span className="font-medium text-gray-900">{fmt(tax)}</span>
                                </div>
                                <div className="border-t border-gray-100 pt-3 flex justify-between">
                                    <span className="font-bold text-gray-900 text-base">Tổng cộng</span>
                                    <span className="font-extrabold text-gray-900 text-xl">{fmt(finalTotal)}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate("/checkout")}
                                className="w-full mt-6 bg-[#00b14f] hover:bg-[#009943] text-white font-bold py-3.5 rounded-xl transition-colors text-sm tracking-wide shadow-sm"
                            >
                                Tiến hành thanh toán
                            </button>

                            <div className="mt-5 p-3.5 bg-green-50 rounded-xl flex items-start gap-3">
                                <svg className="w-5 h-5 text-[#00b14f] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">Miễn phí vận chuyển</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Dự kiến giao trong 3–5 ngày.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default CartPage;
