import { useState, useEffect } from "react";
import LineIcon from "../../components/LineIcon";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const VendorReviews = ({ shop }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [replyText, setReplyText] = useState({});
    const [submitting, setSubmitting] = useState({});

    useEffect(() => {
        if (!shop) return;
        fetchReviews();
    }, [shop]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${API_URL}/api/reviews/shop`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setReviews(data.reviews || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleReviewReply = async (reviewId) => {
        const text = replyText[reviewId];
        if (!text || !text.trim()) return;
        if (submitting[reviewId]) return;

        setSubmitting(prev => ({ ...prev, [reviewId]: true }));
        const token = localStorage.getItem("accessToken");
        try {
            const res = await fetch(`${API_URL}/api/reviews/${reviewId}/reply`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ reply: text.trim() })
            });
            if (res.ok) {
                setReplyText(prev => ({ ...prev, [reviewId]: "" }));
                fetchReviews();
                alert("Đã gửi phản hồi thành công.");
            } else {
                const data = await res.json();
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(prev => ({ ...prev, [reviewId]: false }));
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-extrabold text-gray-900">Phản hồi khách hàng & Đánh giá</h1>

            {loading ? (
                <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-[#00b14f] border-t-transparent rounded-full" /></div>
            ) : reviews.length === 0 ? (
                <div className="bg-white border border-gray-100 p-12 text-center rounded-2xl shadow-xs text-gray-400 text-sm">Chưa nhận được đánh giá nào từ khách hàng.</div>
            ) : (
                <div className="space-y-4">
                    {reviews.map(r => (
                        <div key={r.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4 text-left">
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <span className="font-extrabold text-gray-900 text-sm">{r.user?.name || "Khách hàng ẩn danh"}</span>
                                    <span className="text-[10px] text-gray-400 ml-3 font-semibold">{new Date(r.createdAt).toLocaleDateString()}</span>
                                    <div className="text-amber-500 font-bold text-xs mt-1 inline-flex items-center gap-1">
                                        <LineIcon name="star" size={13} />
                                        {Number(r.rating || 0).toFixed(1)}
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full">Sản phẩm: {r.product?.title}</span>
                            </div>

                            <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>

                            {r.vendorReply ? (
                                <div className="bg-green-50/50 p-4 rounded-xl border border-green-50 text-sm">
                                    <p className="font-bold text-[#00b14f] text-xs">Phản hồi của shop:</p>
                                    <p className="text-gray-700 mt-1">{r.vendorReply}</p>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Nhập phản hồi từ shop..."
                                        value={replyText[r.id] || ""}
                                        onChange={(e) => setReplyText(prev => ({ ...prev, [r.id]: e.target.value }))}
                                        className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[#00b14f]"
                                    />
                                    <button
                                        onClick={() => handleReviewReply(r.id)}
                                        disabled={submitting[r.id]}
                                        className="px-4 py-2 bg-[#00b14f] hover:bg-green-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {submitting[r.id] ? "Đang gửi..." : "Gửi phản hồi"}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default VendorReviews;
