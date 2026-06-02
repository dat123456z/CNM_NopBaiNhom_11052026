import { Link, useSearchParams } from "react-router-dom";
import LineIcon from "../../components/LineIcon";
import { useCart } from "../../context/CartContext";
import { useEffect } from "react";

const RESULT_META = {
    success: {
        title: "Thanh toán VNPay thành công",
        message: "Đơn hàng của bạn đã được ghi nhận thanh toán. Shop sẽ xử lý đơn trong thời gian sớm nhất.",
        icon: "check",
        color: "text-emerald-600",
        bg: "bg-emerald-50"
    },
    failed: {
        title: "Thanh toán VNPay thất bại",
        message: "Giao dịch chưa hoàn tất. Bạn có thể kiểm tra lại đơn hàng hoặc thử thanh toán lại.",
        icon: "x",
        color: "text-rose-600",
        bg: "bg-rose-50"
    },
    invalid: {
        title: "Kết quả thanh toán không hợp lệ",
        message: "Chữ ký trả về từ VNPay không hợp lệ. Vui lòng liên hệ hỗ trợ nếu bạn đã bị trừ tiền.",
        icon: "alert",
        color: "text-amber-600",
        bg: "bg-amber-50"
    },
    error: {
        title: "Không thể xử lý kết quả thanh toán",
        message: "Hệ thống gặp lỗi khi xác nhận giao dịch. Vui lòng kiểm tra lại đơn hàng.",
        icon: "alert",
        color: "text-amber-600",
        bg: "bg-amber-50"
    }
};

const PaymentResult = () => {
    const [params] = useSearchParams();
    const { fetchCart } = useCart();
    const status = params.get("status") || "failed";
    const meta = RESULT_META[status] || RESULT_META.failed;
    const orders = params.get("orders");

    useEffect(() => {
        if (status === "success") fetchCart();
    }, [fetchCart, status]);

    return (
        <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                <div className={`mx-auto w-16 h-16 rounded-full ${meta.bg} ${meta.color} flex items-center justify-center`}>
                    <LineIcon name={meta.icon} size={32} />
                </div>
                <h1 className="mt-6 text-2xl font-extrabold text-gray-900">{meta.title}</h1>
                <p className="mt-3 text-gray-500 leading-relaxed">{meta.message}</p>
                {orders && (
                    <p className="mt-3 text-xs font-bold text-gray-400">Mã đơn hàng: {orders}</p>
                )}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <Link to="/orders" className="px-5 py-2.5 rounded-xl bg-[#00b14f] text-white text-sm font-bold hover:bg-[#009943]">
                        Xem đơn hàng
                    </Link>
                    <Link to="/products" className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-bold hover:bg-gray-50">
                        Tiếp tục mua sắm
                    </Link>
                </div>
            </div>
        </main>
    );
};

export default PaymentResult;
