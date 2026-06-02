import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb";
import LineIcon from "../../components/LineIcon";
import { useCart } from "../../context/CartContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const fmt = (n) => Number(n).toLocaleString("vi-VN") + "đ";

// ── QR Mock Images ──────────────────────────────────────────────────────
const MOMO_QR = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MoMo-UTEShop-Payment";
const VNPAY_QR = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=VNPay-UTEShop-Payment";

const STEPS = ["Shipping", "Payment"];
const VNPAY_TEST_FIELDS = [
    { label: "Ngân hàng", value: "NCB" },
    { label: "Số thẻ", value: "9704198526191432198" },
    { label: "Tên chủ thẻ", value: "NGUYEN VAN A" },
    { label: "Ngày phát hành", value: "07/15" },
    { label: "OTP", value: "123456" }
];

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { items, total, fetchCart } = useCart();

    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);

    // Shipping info
    const [ship, setShip] = useState({ firstName: "", lastName: "", phone: "", street: "" });
    const [shipErrors, setShipErrors] = useState({});
    const [userAddresses, setUserAddresses] = useState([]);

    // Payment
    const [payMethod, setPayMethod] = useState("cod");
    const [payConfirmed, setPayConfirmed] = useState(false); // VNPay/MoMo đã xác nhận
    const [countdown, setCountdown] = useState(600); // 10 phút
    const [copiedVNPayTest, setCopiedVNPayTest] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);

    // Coupon & Points states
    const [couponCode, setCouponCode] = useState("");
    const [couponError, setCouponError] = useState("");
    const [couponSuccess, setCouponSuccess] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);

    const [usePoints, setUsePoints] = useState(false);
    const [userPoints, setUserPoints] = useState(0);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponError("");
        setCouponSuccess("");
        const token = localStorage.getItem("accessToken");
        try {
            const res = await fetch(`${API_URL}/api/orders/check-coupon`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    couponCode: couponCode.trim(),
                    items: items.map(i => ({ productId: i.productId, quantity: i.quantity }))
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Mã giảm giá không hợp lệ.");

            setAppliedCoupon(data);
            setCouponSuccess(`Áp dụng mã giảm giá thành công! Giảm ${fmt(data.discountAmount)}`);
        } catch (err) {
            setCouponError(err.message);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode("");
        setCouponSuccess("");
        setCouponError("");
    };

    // Fetch và pre-fill address + profile từ user API để người dùng không phải nhập lại
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const loadProfile = async () => {
            try {
                const res = await fetch(`${API_URL}/api/users/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (!res.ok) return;
                const data = await res.json();
                const u = data.user || data; // API trả về { user: {...} }
                setUserPoints(u.points || 0);
                
                // Tách họ và tên từ trường name
                const nameParts = u.name ? u.name.trim().split(/\s+/) : [];
                let fName = "";
                let lName = "";
                if (nameParts.length > 1) {
                    lName = nameParts.pop(); // Tên cuối
                    fName = nameParts.join(" "); // Họ đệm
                } else if (nameParts.length === 1) {
                    lName = nameParts[0];
                }

                // Tìm địa chỉ mặc định
                const defaultAddr = u.addresses?.find((a) => a.isDefault) || u.addresses?.[0];
                let fullStreet = "";
                if (defaultAddr) {
                    fullStreet = [
                        defaultAddr.street,
                        defaultAddr.ward,
                        defaultAddr.district,
                        defaultAddr.city
                    ].filter(Boolean).join(", ");
                }

                setShip({
                    firstName: fName,
                    lastName: lName,
                    phone: u.phone || "",
                    street: fullStreet
                });

                if (u.addresses && Array.isArray(u.addresses)) {
                    setUserAddresses(u.addresses);
                }
            } catch (err) {
                console.error("Lỗi lấy thông tin profile để pre-fill:", err);
            }
        };

        loadProfile();
    }, []);

    // Countdown for MoMo/VNPay
    useEffect(() => {
        if (step === 1 && (payMethod === "momo" || payMethod === "vnpay")) {
            setCountdown(600);
            const timer = setInterval(() => {
                setCountdown((c) => {
                    if (c <= 1) { clearInterval(timer); return 0; }
                    return c - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [step, payMethod]);

    const copyVNPayTestInfo = async () => {
        const text = VNPAY_TEST_FIELDS.map((field) => `${field.label}: ${field.value}`).join("\n");
        try {
            await navigator.clipboard.writeText(text);
            setCopiedVNPayTest(true);
            setTimeout(() => setCopiedVNPayTest(false), 1800);
        } catch {
            setMsg(text);
        }
    };

    const validateShip = () => {
        const errs = {};
        if (!ship.firstName.trim()) errs.firstName = "Vui lòng nhập họ.";
        if (!ship.lastName.trim()) errs.lastName = "Vui lòng nhập tên.";
        if (!ship.phone.trim()) errs.phone = "Vui lòng nhập số điện thoại.";
        if (!ship.street.trim()) errs.street = "Vui lòng nhập địa chỉ.";
        setShipErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const goToPayment = () => {
        if (validateShip()) setStep(1);
    };

    const goToReview = () => {
        if (payMethod === "cod" || payMethod === "vnpay" || payConfirmed) setStep(2);
        else setMsg("Vui lòng xác nhận thanh toán trước khi tiếp tục.");
    };

    const handlePlaceOrder = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) { navigate("/login"); return; }
        if (!validateShip()) { setStep(0); return; }
        if (items.length === 0) { setMsg("Giỏ hàng trống."); return; }

        if (payMethod === "momo") {
            setMsg("MoMo sandbox chua duoc cau hinh. Vui long chon COD hoac VNPay de thanh toan.");
            return;
        }

        setLoading(true); setMsg(null);
        try {
            const shippingAddress = {
                fullName: `${ship.firstName} ${ship.lastName}`.trim(),
                phone: ship.phone,
                street: ship.street
            };
            const orderItems = items.map((i) => ({
                productId: i.productId,
                quantity: i.quantity,
                color: i.color || null
            }));
            const endpoint = payMethod === "vnpay"
                ? `${API_URL}/api/payments/vnpay/create`
                : `${API_URL}/api/orders`;
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    items: orderItems, 
                    shippingAddress, 
                    paymentMethod: payMethod,
                    couponCode: appliedCoupon ? appliedCoupon.code : undefined,
                    usePoints: usePoints
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Đặt hàng thất bại.");
            if (payMethod === "vnpay") {
                if (!data.paymentUrl) throw new Error("Không thể tạo liên kết thanh toán VNPay.");
                window.location.href = data.paymentUrl;
                return;
            }
            if (payMethod === "momo") {
                setMsg("MoMo sandbox chua duoc cau hinh. Vui long chon COD hoac VNPay de thanh toan.");
                return;
            }
            await fetchCart();
            setOrderPlaced(true);
            setStep(1);
        } catch (err) {
            setMsg(err.message || "Đặt hàng thất bại.");
        } finally {
            setLoading(false);
        }
    };

    const subtotal = total;
    const tax = Math.round(subtotal * 0.08);
    const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    const pointsDiscount = usePoints ? Math.min(userPoints * 1000, subtotal - couponDiscount) : 0;
    const finalTotal = Math.max(0, subtotal + tax - couponDiscount - pointsDiscount);
    const fmtCountdown = `${String(Math.floor(countdown / 60)).padStart(2, "0")}:${String(countdown % 60).padStart(2, "0")}`;

    return (
        <>


            <Breadcrumb align="viewport"/>
            <main className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full">
                {/* Step Indicator */}
                <div className="flex items-center justify-center mb-10">
                    {STEPS.map((s, i) => (
                        <div key={s} className="flex items-center">
                            <div className="flex flex-col items-center">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${i < step ? "bg-[#00b14f] text-white" :
                                    i === step ? "bg-[#00b14f] text-white ring-4 ring-green-100" :
                                        "bg-gray-100 text-gray-400"
                                    }`}>
                                    {i < step ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                    ) : i + 1}
                                </div>
                                <span className={`text-xs mt-1.5 font-semibold ${i === step ? "text-[#00b14f]" : "text-gray-400"}`}>{s}</span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={`w-24 h-0.5 mx-3 mb-4 ${i < step ? "bg-[#00b14f]" : "bg-gray-200"}`} />
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex gap-8">
                    {/* Left Panel */}
                    <div className="flex-1">
                        {/* ── Step 0: Shipping + Payment Method ── */}
                        {step === 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <h2 className="font-bold text-gray-900 text-lg mb-6">
                                    Thông tin giao hàng
                                </h2>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <FormField label="Họ" value={ship.firstName} error={shipErrors.firstName}
                                        onChange={(e) => setShip((p) => ({ ...p, firstName: e.target.value }))} placeholder="Nguyễn" />
                                    <FormField label="Tên" value={ship.lastName} error={shipErrors.lastName}
                                        onChange={(e) => setShip((p) => ({ ...p, lastName: e.target.value }))} placeholder="Văn A" />
                                </div>
                                <FormField label="Số điện thoại" value={ship.phone} error={shipErrors.phone}
                                    onChange={(e) => setShip((p) => ({ ...p, phone: e.target.value }))} placeholder="037xxxxxxx" />
                                <FormField label="Địa chỉ giao hàng" value={ship.street} error={shipErrors.street}
                                    onChange={(e) => setShip((p) => ({ ...p, street: e.target.value }))} placeholder="123 Đường Lê Lợi, Quận 1, TP.HCM" className="mt-4" />

                                {userAddresses.length >= 2 && (
                                    <div className="mt-3">
                                        <label className="block text-xs font-semibold text-gray-600 mb-2">Chọn địa chỉ đã lưu:</label>
                                        <div className="space-y-2">
                                            {userAddresses.map((addr) => {
                                                const fullAddrText = [
                                                    addr.street,
                                                    addr.ward,
                                                    addr.district,
                                                    addr.city
                                                ].filter(Boolean).join(", ");
                                                const isSelected = ship.street === fullAddrText;

                                                return (
                                                    <button
                                                        key={addr.id}
                                                        type="button"
                                                        onClick={() => setShip(p => ({ ...p, street: fullAddrText }))}
                                                        className={`w-full text-left p-3 rounded-lg border text-xs flex items-start gap-2.5 transition-all ${
                                                            isSelected 
                                                                ? "border-[#00b14f] bg-green-50/50 ring-1 ring-[#00b14f]" 
                                                                : "border-gray-200 hover:border-gray-300 bg-white"
                                                        }`}
                                                    >
                                                        <input 
                                                            type="radio" 
                                                            name="select-checkout-address" 
                                                            checked={isSelected}
                                                            onChange={() => setShip(p => ({ ...p, street: fullAddrText }))}
                                                            className="mt-0.5 accent-[#00b14f]"
                                                        />
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-gray-800">
                                                                    {addr.street}
                                                                </span>
                                                                {addr.isDefault && (
                                                                    <span className="px-1.5 py-0.5 text-[9px] font-bold text-green-700 bg-green-100 rounded">Mặc định</span>
                                                                )}
                                                            </div>
                                                            {(addr.ward || addr.district || addr.city) && (
                                                                <span className="text-gray-500 block mt-0.5">
                                                                    {[addr.ward, addr.district, addr.city].filter(Boolean).join(", ")}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Payment Method */}
                                <h2 className="font-bold text-gray-900 text-lg mt-8 mb-4">
                                    Phương thức thanh toán
                                </h2>
                                <div className="grid grid-cols-3 gap-3">
                                    <PayOption id="cod" label="COD (Tiền mặt)" selected={payMethod === "cod"}
                                        onClick={() => setPayMethod("cod")} />
                                    <PayOption id="vnpay" label="VNPay" selected={payMethod === "vnpay"}
                                        onClick={() => setPayMethod("vnpay")} />
                                    <PayOption id="momo" label="MoMo" selected={payMethod === "momo"}
                                        onClick={() => setPayMethod("momo")} />
                                </div>

                                {payMethod === "cod" && (
                                    <div className="mt-4 p-4 bg-green-50 rounded-xl text-sm text-gray-600 flex items-center gap-3">
                                        <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Thanh toán khi nhận hàng. Vui lòng chuẩn bị đúng số tiền khi nhận hàng.</span>
                                    </div>
                                )}

                                <div className="flex justify-between mt-8">
                                    <button onClick={() => navigate("/cart")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 font-medium">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                        Quay lại giỏ hàng
                                    </button>
                                    <button onClick={handlePlaceOrder} disabled={loading} className="relative bg-[#00b14f] hover:bg-[#009943] disabled:opacity-60 text-white font-bold px-8 py-3 rounded-xl transition-colors text-[0px]">
                                        <span className="text-sm">{loading ? "Đang xử lý..." : payMethod === "cod" ? "Đặt hàng COD" : payMethod === "vnpay" ? "Thanh toán VNPay" : "Thanh toán MoMo"}</span>
                                        Tiếp tục →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ── Step 1: QR Payment / Confirm ── */}
                        {step === 1 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                {orderPlaced ? (
                                    <div className="text-center py-10">
                                        <div className="flex justify-center mb-5">
                                            <div className="w-16 h-16 rounded-full bg-green-50 text-[#00b14f] flex items-center justify-center">
                                                <LineIcon name="check" size={34} />
                                            </div>
                                        </div>
                                        <h2 className="text-2xl font-black text-gray-900 mb-3">Cảm ơn bạn đã đặt hàng.</h2>
                                        <p className="text-gray-500 text-sm max-w-md mx-auto">
                                            Đơn hàng COD của bạn đã được ghi nhận. Shop sẽ chuẩn bị hàng và giao tới địa chỉ đã chọn.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => navigate("/orders", { state: { success: true } })}
                                            className="mt-8 bg-[#00b14f] hover:bg-[#009943] text-white font-bold px-8 py-3 rounded-xl transition-colors text-sm"
                                        >
                                            Xem đơn hàng
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <h2 className="font-bold text-gray-900 text-lg mb-2">Chọn phương thức thanh toán</h2>
                                        <p className="text-sm text-gray-500 mb-5">
                                            COD sẽ đặt hàng ngay. VNPay hoặc MoMo sẽ chuyển sang trang checkout sandbox để hoàn tất thanh toán.
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <PayOption id="cod" label="COD (Tiền mặt)" selected={payMethod === "cod"}
                                                onClick={() => setPayMethod("cod")} />
                                            <PayOption id="vnpay" label="VNPay" selected={payMethod === "vnpay"}
                                                onClick={() => setPayMethod("vnpay")} />
                                            <PayOption id="momo" label="MoMo" selected={payMethod === "momo"}
                                                onClick={() => setPayMethod("momo")} />
                                        </div>

                                        {payMethod === "cod" && (
                                            <div className="mt-5 rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-gray-600 flex gap-3">
                                                <LineIcon name="check" size={20} className="text-[#00b14f] shrink-0 mt-0.5" />
                                                <span>Thanh toán khi nhận hàng. Sau khi bấm đặt hàng, hệ thống sẽ tạo đơn và gửi thông tin cho shop.</span>
                                            </div>
                                        )}

                                        {payMethod === "vnpay" && (
                                            <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                                                <div className="flex items-start gap-3">
                                                    <LineIcon name="card" size={24} className="text-blue-600 shrink-0 mt-0.5" />
                                                    <div className="flex-1">
                                                        <p className="font-bold text-gray-900">Thanh toán qua cổng VNPay sandbox</p>
                                                        <p className="mt-1 text-sm text-gray-600">
                                                            Sau khi bấm thanh toán, hệ thống sẽ chuyển bạn sang VNPay để thanh toán {fmt(finalTotal)}.
                                                        </p>
                                                        <div className="mt-4 rounded-xl bg-white/80 border border-blue-100 p-4">
                                                            <div className="flex items-center justify-between gap-3 mb-3">
                                                                <p className="text-xs font-black uppercase text-blue-700">Thông tin test sandbox</p>
                                                                <button
                                                                    type="button"
                                                                    onClick={copyVNPayTestInfo}
                                                                    className="text-[11px] font-bold text-blue-700 hover:underline"
                                                                >
                                                                    {copiedVNPayTest ? "Đã copy" : "Copy tất cả"}
                                                                </button>
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                {VNPAY_TEST_FIELDS.map((field) => (
                                                                    <div key={field.label} className="rounded-lg border border-blue-50 bg-blue-50/50 px-3 py-2">
                                                                        <p className="text-[10px] uppercase font-bold text-gray-400">{field.label}</p>
                                                                        <p className="mt-0.5 text-sm font-black text-gray-900 break-all">{field.value}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {payMethod === "momo" && (
                                            <div className="mt-5 rounded-xl border border-pink-100 bg-pink-50 p-4 text-sm text-gray-600">
                                                MoMo sandbox chưa được cấu hình endpoint riêng. Khi có API MoMo, nút thanh toán sẽ chuyển sang trang checkout sandbox giống VNPay.
                                            </div>
                                        )}
                                    </div>
                                )}
                                {payMethod === "cod" ? (
                                    <div className="hidden">
                                        <div className="flex justify-center mb-4">
                                            <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Thanh toán khi nhận hàng (COD)</h3>
                                        <p className="text-gray-500 text-sm">Đơn hàng sẽ được xác nhận và giao tới địa chỉ của bạn.</p>
                                        <p className="text-gray-500 text-sm mt-1">Vui lòng chuẩn bị đúng số tiền khi nhận hàng.</p>
                                    </div>
                                ) : (
                                    <div className="hidden">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                                            {payMethod === "momo" ? (
                                                <>
                                                    <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                    </svg>
                                                    Thanh toán MoMo
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                    </svg>
                                                    Thanh toán VNPay
                                                </>
                                            )}
                                        </h3>
                                        <p className={`${payMethod === "vnpay" ? "hidden " : ""}text-sm text-gray-500 mb-6`}>Quét mã QR để thanh toán {fmt(finalTotal)}</p>
                                        {payMethod === "vnpay" && (
                                            <div className="max-w-md mx-auto my-8 rounded-2xl border border-blue-100 bg-blue-50 p-6 text-left">
                                                <div className="flex items-start gap-3">
                                                    <LineIcon name="card" size={24} className="text-blue-600 shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="font-bold text-gray-900">Thanh toán qua cổng VNPay</p>
                                                        <p className="mt-1 text-sm text-gray-600">
                                                            Sau khi xác nhận đơn hàng, hệ thống sẽ chuyển bạn sang VNPay để thanh toán {fmt(finalTotal)}.
                                                        </p>
                                                        <div className="mt-4 rounded-xl bg-white/80 border border-blue-100 p-4">
                                                            <div className="flex items-center justify-between gap-3 mb-3">
                                                                <p className="text-xs font-black uppercase tracking-wide text-blue-700">Thông tin test sandbox</p>
                                                                <button
                                                                    type="button"
                                                                    onClick={copyVNPayTestInfo}
                                                                    className="text-[11px] font-bold text-blue-700 hover:underline"
                                                                >
                                                                    {copiedVNPayTest ? "Đã copy" : "Copy tất cả"}
                                                                </button>
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                {VNPAY_TEST_FIELDS.map((field) => (
                                                                    <div key={field.label} className="rounded-lg border border-blue-50 bg-blue-50/50 px-3 py-2">
                                                                        <p className="text-[10px] uppercase font-bold text-gray-400">{field.label}</p>
                                                                        <p className="mt-0.5 text-sm font-black text-gray-900 break-all">{field.value}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <p className="mt-3 text-[11px] leading-relaxed text-gray-500">
                                                                Trên VNPay sandbox chọn ngân hàng NCB, nhập đúng thông tin trên, sau đó dùng OTP 123456.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div className={`${payMethod === "vnpay" ? "hidden " : ""}inline-block p-3 bg-gray-50 rounded-2xl border border-gray-200 mb-4`}>
                                            <img
                                                src={payMethod === "momo" ? MOMO_QR : VNPAY_QR}
                                                alt="QR Code"
                                                className="w-48 h-48 rounded-lg"
                                            />
                                        </div>
                                        <div className={`${payMethod === "vnpay" ? "hidden " : ""}text-lg font-mono font-bold mb-6 ${countdown < 60 ? "text-red-500" : "text-gray-700"}`}>
                                            Hết hạn sau: {fmtCountdown}
                                        </div>
                                        {!payConfirmed ? (
                                            <button
                                                onClick={() => setPayConfirmed(true)}
                                                className={`${payMethod === "vnpay" ? "hidden " : ""}w-full py-3.5 rounded-xl font-bold text-white transition-colors text-sm`}
                                                style={{ background: payMethod === "momo" ? "#ae2070" : "#0063a5" }}
                                            >
                                                ✓ Tôi đã thanh toán
                                            </button>
                                        ) : (
                                            <div className={`${payMethod === "vnpay" ? "hidden " : ""}w-full py-3.5 rounded-xl font-bold text-green-700 bg-green-50 border border-green-200 text-sm text-center`}>
                                                ✓ Đã xác nhận thanh toán
                                            </div>
                                        )}
                                    </div>
                                )}

                                {msg && <p className="text-red-500 text-sm text-center mt-4">{msg}</p>}

                                {!orderPlaced && <div className="flex justify-between mt-8">
                                    <button onClick={() => { setStep(0); setMsg(null); }} className="text-sm text-gray-500 hover:text-gray-800 font-medium flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                        Quay lại
                                    </button>
                                    <button onClick={handlePlaceOrder} disabled={loading} className="relative bg-[#00b14f] hover:bg-[#009943] disabled:opacity-60 text-white font-bold px-8 py-3 rounded-xl transition-colors text-[0px]">
                                        <span className="text-sm">{loading ? "Đang xử lý..." : payMethod === "cod" ? "Đặt hàng COD" : payMethod === "vnpay" ? "Thanh toán VNPay" : "Thanh toán MoMo"}</span>
                                        Xem lại đơn hàng →
                                    </button>
                                </div>}
                            </div>
                        )}

                        {/* ── Step 2: Review ── */}
                        {step === 2 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <h2 className="font-bold text-gray-900 text-lg mb-6">Xác nhận đơn hàng</h2>

                                {/* Shipping Info Review */}
                                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                                    <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Giao tới</p>
                                    <p className="font-semibold text-gray-900">{ship.firstName} {ship.lastName}</p>
                                    <p className="text-sm text-gray-600">{ship.phone}</p>
                                    <p className="text-sm text-gray-600">{ship.street}</p>
                                </div>

                                {/* Payment Method Review */}
                                <div className="mb-6 p-4 bg-gray-50 rounded-xl flex items-center gap-3">
                                    <span className="shrink-0">
                                        {payMethod === "cod" ? (
                                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        ) : payMethod === "momo" ? (
                                            <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                            </svg>
                                        ) : (
                                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                        )}
                                    </span>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-semibold">Phương thức thanh toán</p>
                                        <p className="font-semibold text-gray-900">
                                            {payMethod === "cod" ? "Thanh toán khi nhận hàng (COD)"
                                                : payMethod === "momo" ? "Ví MoMo"
                                                    : "VNPay"}
                                        </p>
                                    </div>
                                </div>

                                {/* Items Review */}
                                <div className="space-y-3 mb-6">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                                {item.product?.image
                                                    ? <img src={item.product.image.startsWith("http") ? item.product.image : `${API_URL}${item.product.image}`} alt="" className="w-full h-full object-cover" />
                                                    : <div className="w-full h-full bg-gray-200" />
                                                }
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{item.product?.title}</p>
                                                {item.color && <p className="text-xs text-gray-400">{item.color}</p>}
                                            </div>
                                            <div className="text-right text-sm shrink-0">
                                                <p className="text-gray-500">x{item.quantity}</p>
                                                <p className="font-bold text-gray-900">{fmt(item.lineTotal || 0)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {msg && <p className="text-red-500 text-sm text-center mt-4">{msg}</p>}

                                <div className="flex justify-between">
                                    <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-800 font-medium flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                        Quay lại
                                    </button>
                                    <button
                                        onClick={handlePlaceOrder}
                                        disabled={loading}
                                        className="bg-[#00b14f] hover:bg-[#009943] disabled:opacity-60 text-white font-bold px-8 py-3 rounded-xl transition-colors text-sm flex items-center gap-2"
                                    >
                                        {loading ? (
                                            <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />Đang xử lý...</>
                                        ) : (
                                            <>
                                                <LineIcon name="cart" size={16} />
                                                Đặt hàng ngay
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:w-80 shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
                            <h2 className="font-bold text-gray-900 text-lg mb-4">Tổng đơn hàng</h2>
                            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                                {items.map((item) => {
                                    const imgSrc = item.product?.image
                                        ? (item.product.image.startsWith("http") ? item.product.image : `${API_URL}${item.product.image}`)
                                        : null;
                                    return (
                                        <div key={item.id} className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                                {imgSrc ? <img src={imgSrc} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-gray-900 truncate">{item.product?.title}</p>
                                                {item.color && <p className="text-xs text-gray-400">{item.color}</p>}
                                                <p className="text-xs text-gray-500">Số lượng: {item.quantity}</p>
                                            </div>
                                            <span className="text-xs font-bold text-gray-900 shrink-0">{fmt(item.lineTotal || 0)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            {/* Promo & Loyalty Section */}
                            <div className="border-t border-b border-gray-100 py-4 my-4 space-y-4 text-left">
                                {/* Loyalty Points Toggle */}
                                <div className="space-y-2">
                                    <label className="flex items-center justify-between cursor-pointer select-none">
                                        <div className="flex items-center gap-1.5 text-xs text-gray-700 font-bold">
                                            <LineIcon name="coin" size={15} />
                                            <span>Dùng xu tích lũy ({userPoints} xu)</span>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            checked={usePoints} 
                                            disabled={userPoints <= 0}
                                            onChange={(e) => setUsePoints(e.target.checked)}
                                            className="w-4 h-4 accent-[#00b14f] rounded disabled:opacity-50 cursor-pointer"
                                        />
                                    </label>
                                    {usePoints && userPoints > 0 && (
                                        <p className="text-[11px] text-green-700 font-medium">
                                            Quy đổi giảm: -{fmt(pointsDiscount)}
                                        </p>
                                    )}
                                </div>

                                {/* Coupon Code Input */}
                                <div className="space-y-2">
                                    <label className="block text-xs text-gray-700 font-bold">Mã giảm giá (Voucher)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(e) => {
                                                setCouponCode(e.target.value.toUpperCase());
                                                setCouponError("");
                                                setCouponSuccess("");
                                            }}
                                            placeholder="Nhập mã giảm giá..."
                                            className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#00b14f] font-mono tracking-wider"
                                            disabled={!!appliedCoupon}
                                        />
                                        {appliedCoupon ? (
                                            <button
                                                type="button"
                                                onClick={handleRemoveCoupon}
                                                className="px-3 py-1.5 bg-red-50 text-red-500 font-bold text-xs rounded-lg border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
                                            >
                                                Hủy
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleApplyCoupon}
                                                className="px-3 py-1.5 bg-green-50 text-green-700 font-bold text-xs rounded-lg border border-green-200 hover:bg-green-100 transition-colors cursor-pointer"
                                            >
                                                Áp dụng
                                            </button>
                                        )}
                                    </div>
                                    {couponError && <p className="text-[10px] text-red-500 font-medium">{couponError}</p>}
                                    {couponSuccess && <p className="text-[10px] text-green-700 font-medium">{couponSuccess}</p>}
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                                <div className="flex justify-between text-gray-600"><span>Tạm tính</span><span>{fmt(subtotal)}</span></div>
                                {couponDiscount > 0 && (
                                    <div className="flex justify-between text-green-600"><span>Mã giảm giá</span><span>-{fmt(couponDiscount)}</span></div>
                                )}
                                {pointsDiscount > 0 && (
                                    <div className="flex justify-between text-green-600"><span>Dùng xu tích lũy</span><span>-{fmt(pointsDiscount)}</span></div>
                                )}
                                <div className="flex justify-between text-gray-600"><span>Vận chuyển</span><span className="text-[#00b14f] font-semibold">Miễn phí</span></div>
                                <div className="flex justify-between text-gray-600"><span>Thuế VAT (8%)</span><span>{fmt(tax)}</span></div>
                                <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                                    <span>Tổng cộng</span><span>{fmt(finalTotal)}</span>
                                </div>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <button className="flex-1 py-2.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1.5">
                                    <svg className="w-4 h-4 text-[#00b14f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    Thanh toán an toàn
                                </button>
                                <button className="flex-1 py-2.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1.5">
                                    <svg className="w-4 h-4 text-[#00b14f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                    Bảo vệ người mua
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

const FormField = ({ label, value, onChange, error, placeholder, className = "" }) => (
    <div className={`mb-4 ${className}`}>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
        <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none transition-colors ${error ? "border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-200" : "border-gray-200 focus:border-[#00b14f] focus:ring-1 focus:ring-green-100"
                }`}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
);

const PayOption = ({ id, label, selected, onClick }) => {
    const renderIcon = () => {
        if (id === "cod") {
            return (
                <svg className={`w-8 h-8 ${selected ? "text-[#00b14f]" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            );
        }
        if (id === "vnpay") {
            return (
                <svg className={`w-8 h-8 ${selected ? "text-[#00b14f]" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            );
        }
        if (id === "momo") {
            return (
                <svg className={`w-8 h-8 ${selected ? "text-[#00b14f]" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            );
        }
        return null;
    };

    return (
        <button
            id={`pay-${id}`}
            onClick={onClick}
            className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all w-full ${
                selected ? "border-[#00b14f] bg-green-50" : "border-gray-200 hover:border-gray-300"
            }`}
        >
            {renderIcon()}
            <span className={`text-xs font-bold ${selected ? "text-[#00b14f]" : "text-gray-600"}`}>{label}</span>
        </button>
    );
};

export default CheckoutPage;
