import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const fmt = (n) => Number(n).toLocaleString("vi-VN") + "đ";

const STATUS_STEPS = [
    { key: "pending", label: "Đơn hàng mới", icon: "📋", desc: "Đơn hàng của bạn đã được tiếp nhận" },
    { key: "confirmed", label: "Đã xác nhận", icon: "✅", desc: "Shop đã xác nhận đơn hàng" },
    { key: "preparing", label: "Đang chuẩn bị", icon: "📦", desc: "Shop đang đóng gói sản phẩm" },
    { key: "shipping", label: "Đang giao hàng", icon: "🚚", desc: "Đơn hàng đang trên đường giao" },
    { key: "delivered", label: "Đã giao thành công", icon: "🎉", desc: "Bạn đã nhận được hàng" },
];

const STATUS_CONFIG = {
    pending: { label: "Đơn hàng mới", color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
    confirmed: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
    preparing: { label: "Đang chuẩn bị", color: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
    shipping: { label: "Đang giao hàng", color: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
    delivered: { label: "Đã giao thành công", color: "bg-green-100 text-green-700", dot: "bg-green-500" },
    cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-700", dot: "bg-red-500" },
    cancel_requested: { label: "Yêu cầu hủy đang chờ", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
    refunded: { label: "Đã hoàn tiền", color: "bg-gray-100 text-gray-600", dot: "bg-gray-500" },
};

const OrderDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [cancelMsg, setCancelMsg] = useState(null);
    const [cancelReason, setCancelReason] = useState("");
    const [showCancelForm, setShowCancelForm] = useState(false);

    // Review states
    const [reviewProduct, setReviewProduct] = useState(null);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
    const [reviewLoading, setReviewLoading] = useState(false);
    const [rewardInfo, setRewardInfo] = useState(null);

    const handleOpenReview = (item) => {
        setReviewProduct(item);
        setReviewForm({ rating: 5, comment: "" });
        setRewardInfo(null);
    };

    const handleCloseReview = () => {
        setReviewProduct(null);
        setRewardInfo(null);
    };

    const handleSubmitReview = async () => {
        if (!reviewForm.comment.trim()) {
            alert("Vui lòng nhập nội dung đánh giá.");
            return;
        }

        setReviewLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) { alert("Vui lòng đăng nhập để đánh giá."); return; }

            const res = await fetch(`${API_URL}/api/reviews/product`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    productId: reviewProduct.productId,
                    orderId: order.id,
                    rating: reviewForm.rating,
                    comment: reviewForm.comment
                })
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || "Đánh giá thất bại.");

            setRewardInfo({
                points: data.rewardPoints || 10,
                couponCode: data.rewardCouponCode
            });
            setOrder(prev => prev ? {
                ...prev,
                productReviews: [
                    ...(prev.productReviews || []),
                    {
                        id: data.id,
                        productId: reviewProduct.productId,
                        rating: data.rating,
                        comment: data.comment,
                        createdAt: data.createdAt
                    }
                ]
            } : prev);
        } catch (err) {
            alert(err.message || "Đánh giá thất bại.");
        } finally {
            setReviewLoading(false);
        }
    };

    useEffect(() => {
        const fetchOrder = async () => {
            const token = localStorage.getItem("accessToken");
            if (!token) { navigate("/login"); return; }
            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/api/orders/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Không tìm thấy đơn hàng.");
                setOrder(data);
            } catch (err) {
                setCancelMsg(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id, navigate]);

    const handleCancel = async () => {
        const token = localStorage.getItem("accessToken");
        setCancelLoading(true); setCancelMsg(null);
        try {
            const res = await fetch(`${API_URL}/api/orders/${id}/cancel`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ reason: cancelReason || "Người dùng hủy đơn" })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Không thể hủy đơn.");
            setOrder(data);
            setShowCancelForm(false);
            setCancelMsg(data.status === "cancel_requested"
                ? "Đã gửi yêu cầu hủy đơn cho shop. Shop sẽ xử lý trong thời gian sớm nhất."
                : "Đơn hàng đã được hủy thành công.");
        } catch (err) {
            setCancelMsg(err.message);
        } finally {
            setCancelLoading(false);
        }
    };

    const canCancel = (order) => {
        if (!order) return false;
        if (!["pending", "confirmed", "preparing"].includes(order.status)) return false;
        const diff = Date.now() - new Date(order.createdAt).getTime();
        return diff < 30 * 60 * 1000 || order.status === "preparing";
    };

    const getActiveStep = (status) => {
        if (status === "cancelled" || status === "cancel_requested") return -1;
        const idx = STATUS_STEPS.findIndex((s) => s.key === status);
        return idx;
    };

    if (loading) return (
        <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin w-12 h-12 border-2 border-[#00b14f] border-t-transparent rounded-full" />
        </div>
    );

    if (!order && !loading) return (
            <div className="flex-1 flex items-center justify-center flex-col gap-4 text-gray-500">
                <p className="text-lg font-semibold">Không tìm thấy đơn hàng</p>
                <button onClick={() => navigate("/orders")} className="text-[#00b14f] font-semibold hover:underline">← Quay lại</button>
            </div>
    );

    const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
    const activeStep = getActiveStep(order.status);
    const reviewedProductIds = new Set((order.productReviews || []).map((review) => Number(review.productId)));

    return (
        <>
            <main className="flex-1 max-w-5xl mx-auto px-6 py-10 w-full">
                {/* Back */}
                <button onClick={() => navigate("/orders")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 font-medium mb-6 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    Quay lại đơn hàng
                </button>

                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900">Đơn hàng #{order.id}</h1>
                        <p className="text-sm text-gray-400 mt-1">Đặt ngày {new Date(order.createdAt).toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 ${sc.color}`}>
                        <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                        {sc.label}
                    </span>
                </div>

                {/* Cancel Message */}
                {cancelMsg && (
                    <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-sm font-medium ${cancelMsg.includes("thành công") || cancelMsg.includes("gửi") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
                        <span>{cancelMsg.includes("thành công") || cancelMsg.includes("gửi") ? "✅" : "⚠️"}</span>
                        <span>{cancelMsg}</span>
                    </div>
                )}

                <div className="flex gap-6">
                    {/* Left */}
                    <div className="flex-1 space-y-6">
                        {/* Status Timeline */}
                        {order.status !== "cancelled" && order.status !== "cancel_requested" ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="font-bold text-gray-900 mb-6">Theo dõi đơn hàng</h2>
                                <div className="relative">
                                    {STATUS_STEPS.map((step, idx) => {
                                        const isCompleted = idx <= activeStep;
                                        const isActive = idx === activeStep;
                                        return (
                                            <div key={step.key} className="flex items-start gap-4 pb-6 last:pb-0 relative">
                                                {/* Connector line */}
                                                {idx < STATUS_STEPS.length - 1 && (
                                                    <div className={`absolute left-4 top-9 w-0.5 h-full ${isCompleted ? "bg-[#00b14f]" : "bg-gray-200"}`} />
                                                )}
                                                {/* Icon Circle */}
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm z-10 border-2 transition-all ${
                                                    isActive
                                                        ? "border-[#00b14f] bg-[#00b14f] text-white ring-4 ring-green-100"
                                                        : isCompleted
                                                        ? "border-[#00b14f] bg-[#00b14f] text-white"
                                                        : "border-gray-200 bg-white text-gray-300"
                                                }`}>
                                                    {isCompleted ? (idx === activeStep ? step.icon : "✓") : <span className="text-gray-300">{idx + 1}</span>}
                                                </div>
                                                {/* Content */}
                                                <div className={`flex-1 pt-1.5 ${!isCompleted && !isActive ? "opacity-40" : ""}`}>
                                                    <p className={`text-sm font-bold ${isActive ? "text-[#00b14f]" : isCompleted ? "text-gray-900" : "text-gray-400"}`}>
                                                        {step.label}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
                                                    {isActive && (
                                                        <p className="text-xs text-[#00b14f] font-medium mt-1 flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-[#00b14f] animate-pulse inline-block" />
                                                            Đang cập nhật...
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0 ${order.status === "cancelled" ? "bg-red-50" : "bg-amber-50"}`}>
                                        {order.status === "cancelled" ? "❌" : "⏳"}
                                    </div>
                                    <div>
                                        <p className={`font-bold text-lg ${order.status === "cancelled" ? "text-red-600" : "text-amber-600"}`}>
                                            {order.status === "cancelled" ? "Đơn hàng đã bị hủy" : "Yêu cầu hủy đang chờ xử lý"}
                                        </p>
                                        {order.cancelReason && (
                                            <p className="text-sm text-gray-500 mt-1">Lý do: {order.cancelReason}</p>
                                        )}
                                        {order.cancelledAt && (
                                            <p className="text-xs text-gray-400 mt-1">Hủy lúc: {new Date(order.cancelledAt).toLocaleString("vi-VN")}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Products */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="font-bold text-gray-900 mb-4">Sản phẩm đã mua</h2>
                            <div className="space-y-4">
                                {(order.items || []).map((item) => {
                                    const imgSrc = item.productImage
                                        ? (item.productImage.startsWith("http") ? item.productImage : `${API_URL}${item.productImage}`)
                                        : null;
                                    return (
                                        <div key={item.id} className="p-3 rounded-xl border border-gray-150 hover:bg-gray-50 transition-colors space-y-3">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                                                    {imgSrc ? <img src={imgSrc} alt={item.productTitle} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-linear-to-br from-gray-200 to-gray-300" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900 text-sm">{item.productTitle}</p>
                                                    {item.color && <p className="text-xs text-gray-400 mt-0.5">Màu: {item.color}</p>}
                                                    <p className="text-xs text-gray-500 mt-1">x{item.quantity} · {fmt(item.price)} / sản phẩm</p>
                                                </div>
                                                <p className="font-bold text-gray-900 text-sm shrink-0">{fmt(Number(item.price) * item.quantity)}</p>
                                            </div>
                                            {order.status === "delivered" && (
                                                <div className="flex justify-end pt-2 border-t border-gray-100">
                                                    <button
                                                        onClick={() => handleOpenReview(item)}
                                                        disabled={reviewedProductIds.has(Number(item.productId))}
                                                        className={`px-4 py-1.5 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 ${
                                                            reviewedProductIds.has(Number(item.productId))
                                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                                : "bg-green-50 hover:bg-green-100 text-green-700 cursor-pointer"
                                                        }`}
                                                    >
                                                        <span>★</span> {reviewedProductIds.has(Number(item.productId)) ? "Đã đánh giá" : "Viết đánh giá nhận quà"}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Cancel Form */}
                        {canCancel(order) && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="font-bold text-gray-900 mb-4">
                                    {order.status === "preparing" ? "Gửi yêu cầu hủy đơn" : "Hủy đơn hàng"}
                                </h2>
                                {order.status === "preparing" && (
                                    <p className="text-sm text-amber-600 bg-amber-50 px-4 py-3 rounded-lg mb-4">
                                        ⚠️ Shop đang chuẩn bị hàng. Yêu cầu hủy sẽ được gửi cho shop để xem xét.
                                    </p>
                                )}
                                {!showCancelForm ? (
                                    <button onClick={() => setShowCancelForm(true)} className="px-5 py-2 border border-red-200 text-red-500 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors">
                                        {order.status === "preparing" ? "Gửi yêu cầu hủy" : "Hủy đơn hàng"}
                                    </button>
                                ) : (
                                    <div className="space-y-3">
                                        <textarea
                                            value={cancelReason}
                                            onChange={(e) => setCancelReason(e.target.value)}
                                            placeholder="Lý do hủy đơn (tuỳ chọn)..."
                                            rows={3}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 resize-none"
                                        />
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleCancel}
                                                disabled={cancelLoading}
                                                className="px-5 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
                                            >
                                                {cancelLoading ? "Đang xử lý..." : "Xác nhận hủy"}
                                            </button>
                                            <button onClick={() => setShowCancelForm(false)} className="px-5 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50">
                                                Giữ đơn hàng
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right — Summary */}
                    <div className="w-72 shrink-0 space-y-4">
                        {/* Order Info */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            <h3 className="font-bold text-gray-900 mb-4 text-sm">Thông tin đơn hàng</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Mã đơn</span>
                                    <span className="font-semibold text-gray-900">#{order.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Thanh toán</span>
                                    <span className="font-semibold text-gray-900 capitalize">
                                        {order.paymentMethod === "cod" ? "COD" : order.paymentMethod === "momo" ? "MoMo" : order.paymentMethod === "vnpay" ? "VNPay" : order.paymentMethod || "—"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Trạng thái TT</span>
                                    <span className={`font-semibold ${order.paymentStatus === "paid" ? "text-green-600" : "text-orange-500"}`}>
                                        {order.paymentStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Shipping */}
                        {order.shippingAddress && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                <h3 className="font-bold text-gray-900 mb-3 text-sm">Địa chỉ giao hàng</h3>
                                <p className="text-sm font-semibold text-gray-900">{order.shippingAddress.fullName}</p>
                                <p className="text-sm text-gray-500 mt-1">{order.shippingAddress.phone}</p>
                                <p className="text-sm text-gray-500 mt-0.5">{order.shippingAddress.street}</p>
                            </div>
                        )}

                        {/* Price Breakdown */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            <h3 className="font-bold text-gray-900 mb-4 text-sm">Chi tiết thanh toán</h3>
                            <div className="space-y-2.5 text-sm">
                                <div className="flex justify-between text-gray-600"><span>Tạm tính</span><span>{fmt(order.subtotal)}</span></div>
                                {Number(order.discount) > 0 && (
                                    <div className="flex justify-between text-green-600"><span>Giảm giá</span><span>-{fmt(order.discount)}</span></div>
                                )}
                                {Number(order.pointsDiscount) > 0 && (
                                    <div className="flex justify-between text-green-600"><span>Dùng xu tích lũy</span><span>-{fmt(order.pointsDiscount)}</span></div>
                                )}
                                <div className="flex justify-between text-gray-600"><span>Phí vận chuyển</span><span className="text-green-600 font-medium">{Number(order.shippingFee) === 0 ? "Miễn phí" : fmt(order.shippingFee)}</span></div>
                                {Number(order.tax) > 0 && (
                                    <div className="flex justify-between text-gray-600"><span>Thuế VAT (8%)</span><span>{fmt(order.tax)}</span></div>
                                )}
                                <div className="border-t border-gray-100 pt-2.5 flex justify-between font-bold text-gray-900">
                                    <span>Tổng cộng</span><span className="text-lg">{fmt(order.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Review Modal */}
            {reviewProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100">
                        {/* Header */}
                        <div className="bg-linear-to-r from-[#00b14f] to-[#009943] px-6 py-4 text-white flex items-center justify-between">
                            <h3 className="font-bold text-base flex items-center gap-1.5">
                                <span>✍️</span> Đánh giá sản phẩm
                            </h3>
                            <button onClick={handleCloseReview} className="text-white hover:text-gray-200 transition-colors text-lg font-semibold cursor-pointer">✕</button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Product Info */}
                            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                                <div className="w-12 h-12 bg-gray-100 border border-gray-200 rounded-lg overflow-hidden shrink-0">
                                    {reviewProduct.productImage ? (
                                        <img 
                                            src={reviewProduct.productImage.startsWith("http") ? reviewProduct.productImage : `${API_URL}${reviewProduct.productImage}`} 
                                            alt={reviewProduct.productTitle} 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-800 text-sm truncate">{reviewProduct.productTitle}</h4>
                                    {reviewProduct.color && <p className="text-[10px] text-gray-400 mt-0.5">Màu: {reviewProduct.color}</p>}
                                </div>
                            </div>

                            {/* Reward Notice */}
                            {!rewardInfo && (
                                <div className="bg-green-50 text-green-800 border border-green-100 rounded-xl px-4 py-3 text-xs flex items-start gap-2.5">
                                    <span className="text-sm">🎁</span>
                                    <div>
                                        <p className="font-bold">Đánh giá để nhận ngay:</p>
                                        <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-green-700">
                                            <li>Tặng <strong className="text-green-805 font-extrabold">+10 xu</strong> vào tài khoản</li>
                                            <li>Tặng <strong className="text-green-805 font-extrabold">Voucher giảm 10%</strong> cho lần mua sau</li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {rewardInfo ? (
                                /* Reward Success Popup Contents */
                                <div className="text-center py-4 space-y-4">
                                    <div className="w-16 h-16 bg-green-155 rounded-full flex items-center justify-center text-3xl mx-auto animate-bounce">
                                        🎉
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900">Đánh giá thành công!</h4>
                                        <p className="text-sm text-gray-500 mt-1">Cảm ơn bạn đã đóng góp đánh giá sản phẩm.</p>
                                    </div>
                                    <div className="bg-green-50/50 border border-green-100 rounded-xl p-4 space-y-3 text-left">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500 font-medium">Xu tích lũy nhận được:</span>
                                            <span className="font-bold text-green-700">🪙 +{rewardInfo.points} xu</span>
                                        </div>
                                        {rewardInfo.couponCode && (
                                            <div className="border-t border-green-100/50 pt-3 space-y-2">
                                                <p className="text-xs text-gray-500 font-medium">Mã giảm giá 10% đã thêm vào ví của bạn:</p>
                                                <div className="flex items-center justify-between bg-white border border-dashed border-green-300 rounded-lg p-2.5">
                                                    <span className="font-mono font-bold text-sm text-gray-800 tracking-wider">
                                                        {rewardInfo.couponCode}
                                                    </span>
                                                    <button 
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(rewardInfo.couponCode);
                                                            alert("Đã sao chép mã giảm giá!");
                                                        }}
                                                        className="text-xs font-bold text-green-700 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md transition-colors cursor-pointer"
                                                    >
                                                        Sao chép
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <button 
                                        onClick={handleCloseReview}
                                        className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                                    >
                                        Đóng
                                    </button>
                                </div>
                            ) : (
                                /* Form inputs */
                                <div className="space-y-4 text-left">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Chọn số sao</label>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setReviewForm(p => ({ ...p, rating: star }))}
                                                    className="text-2xl transition-transform hover:scale-110 active:scale-95 cursor-pointer text-amber-400"
                                                >
                                                    {star <= reviewForm.rating ? "★" : "☆"}
                                                </button>
                                            ))}
                                            <span className="text-xs font-bold text-gray-600 ml-2">
                                                {reviewForm.rating === 5 ? "Tuyệt vời" : reviewForm.rating === 4 ? "Tốt" : reviewForm.rating === 3 ? "Bình thường" : reviewForm.rating === 2 ? "Tệ" : "Rất tệ"}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Nội dung đánh giá *</label>
                                        <textarea
                                            value={reviewForm.comment}
                                            onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))}
                                            placeholder="Chia sẻ nhận xét của bạn về sản phẩm này nhé..."
                                            rows={4}
                                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100 resize-none"
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-1">
                                        <button 
                                            onClick={handleSubmitReview}
                                            disabled={reviewLoading}
                                            className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-60 cursor-pointer"
                                        >
                                            {reviewLoading ? "Đang gửi..." : "Gửi đánh giá"}
                                        </button>
                                        <button 
                                            onClick={handleCloseReview}
                                            className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default OrderDetailPage;