import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb";
import LineIcon from "../../components/LineIcon";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const WishlistPage = () => {
    const navigate = useNavigate();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchWishlist = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) { navigate("/login"); return; }
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/wishlists`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Không thể tải danh sách yêu thích.");
            setWishlist(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchWishlist(); }, [navigate]);

    const handleRemove = async (productId, e) => {
        e.stopPropagation();
        const token = localStorage.getItem("accessToken");
        try {
            const res = await fetch(`${API_URL}/api/wishlists/${productId}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) { const data = await res.json(); throw new Error(data.message || "Lỗi khi cập nhật."); }
            setWishlist(prev => prev.filter(item => item.id !== productId));
        } catch (err) {
            alert(err.message);
        }
    };

    const fmt = (n) => Number(n).toLocaleString("vi-VN") + "đ";

    return (
        <>
            <Breadcrumb align="viewport"/>
            <main className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900">Sản phẩm yêu thích</h1>
                    <p className="text-sm text-gray-500 mt-2">Xem danh sách các sản phẩm bạn đã lưu</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin w-10 h-10 border-2 border-[#00b14f] border-t-transparent rounded-full" />
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-center text-sm font-semibold">{error}</div>
                ) : wishlist.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <LineIcon name="heart" size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="font-bold text-lg text-gray-800 mb-2">Danh sách yêu thích trống</p>
                        <p className="text-sm text-gray-500 mb-6">Hãy thêm những sản phẩm bạn thích để theo dõi tại đây nhé!</p>
                        <button onClick={() => navigate("/products")} className="px-6 py-2.5 bg-[#00b14f] hover:bg-[#009943] text-white font-bold text-sm rounded-xl transition-all shadow-md">
                            Khám phá sản phẩm
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {wishlist.map((item) => {
                            const imgSrc = item.image ? (item.image.startsWith("http") ? item.image : `${API_URL}${item.image}`) : null;
                            return (
                                <div key={item.id} onClick={() => navigate(`/product/${item.id}`)} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full group relative">
                                    <div className="aspect-square bg-gray-50 overflow-hidden relative border-b border-gray-100">
                                        {imgSrc ? (
                                            <img src={imgSrc} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full bg-linear-to-br from-gray-200 to-gray-300" />
                                        )}
                                        <button onClick={(e) => handleRemove(item.id, e)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-gray-600 hover:text-red-500 hover:scale-110 active:scale-95 shadow-md transition-all duration-200 cursor-pointer" title="Xóa khỏi yêu thích">
                                            <LineIcon name="heart" size={17} />
                                        </button>
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-sm line-clamp-2 leading-snug group-hover:text-[#00b14f] transition-colors duration-200">{item.title}</h3>
                                            <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">{item.category}</span>
                                        </div>
                                        <div className="mt-4 flex items-baseline justify-between gap-2 border-t border-gray-50 pt-3">
                                            <span className="font-extrabold text-[#00b14f] text-base">{fmt(item.price)}</span>
                                            {item.originalPrice && Number(item.originalPrice) > Number(item.price) && (
                                                <span className="text-xs text-gray-400 line-through">{fmt(item.originalPrice)}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </>
    );
};

export default WishlistPage;
