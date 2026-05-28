import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProductCard from "../../components/ProductCard";
import Header from "../../components/user/Header";
import Footer from "../../components/user/Footer";
import { useCart } from "../../context/CartContext";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

const normalizeArray = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.products)) return data.products;
    if (Array.isArray(data?.data)) return data.data;
    return [];
};

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [similarStartIndex, setSimilarStartIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const handleNextSimilar = () => {
        if (similarStartIndex + 3 < similarProducts.length) {
            setSimilarStartIndex(prev => prev + 1);
        }
    };

    const handlePrevSimilar = () => {
        if (similarStartIndex > 0) {
            setSimilarStartIndex(prev => prev - 1);
        }
    };

    // Interactive states
    const [selectedColor, setSelectedColor] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const [success, setSuccess] = useState(false);

    // Engagement & History states
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const [isFavorite, setIsFavorite] = useState(false);

    // Reviews states
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [eligibleOrder, setEligibleOrder] = useState(null);

    // Form inputs
    const [ratingInput, setRatingInput] = useState(5);
    const [commentInput, setCommentInput] = useState("");
    const [imagesInput, setImagesInput] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewMessage, setReviewMessage] = useState("");

    const fetchProductReviews = async () => {
        try {
            setLoadingReviews(true);
            const res = await fetch(`${API_BASE}/api/reviews/product/${id}`);
            const data = await res.json();
            if (res.ok) setReviews(data.reviews || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingReviews(false);
        }
    };

    const checkEligibility = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE}/api/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const orders = await res.json();
            if (res.ok && Array.isArray(orders)) {
                const eligible = orders.find(o =>
                    o.status === 'delivered' &&
                    o.items?.some(item => Number(item.productId) === Number(id))
                );
                if (eligible) {
                    setEligibleOrder(eligible);
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        const controller = new AbortController();

        const load = async () => {
            try {
                setLoading(true);
                setError("");
                setQuantity(1);
                setSuccess(false);

                const res = await fetch(`${API_BASE}/api/products/${id}`, {
                    signal: controller.signal
                });

                if (!res.ok) throw new Error("Load product failed");

                const data = await res.json();
                setProduct(data);

                // Set default color if available
                if (data.colors && data.colors.length > 0) {
                    setSelectedColor(data.colors[0].label);
                } else {
                    setSelectedColor("");
                }

                // Fetch similar products recommendation from custom endpoint
                try {
                    const r = await fetch(
                        `${API_BASE}/api/products/${id}/similar`,
                        { signal: controller.signal }
                    );
                    if (r.ok) {
                        const simData = await r.json();
                        setSimilarProducts(simData);
                        setSimilarStartIndex(0);
                    } else {
                        setSimilarProducts([]);
                        setSimilarStartIndex(0);
                    }
                } catch (e) {
                    setSimilarProducts([]);
                    setSimilarStartIndex(0);
                }

                fetchProductReviews();
                checkEligibility();
            } catch (err) {
                if (err.name !== "AbortError") {
                    setError(err.message || "Error");
                }
            } finally {
                setLoading(false);
            }
        };

        load();
        return () => controller.abort();
    }, [id]);

    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        setActiveImage(0);
    }, [id]);

    const images = useMemo(() => {
        if (!product) return [];
        if (Array.isArray(product.images)) return product.images;
        if (typeof product.images === "string") {
            try { return JSON.parse(product.images); } catch { return []; }
        }
        return product.image ? [product.image] : [];
    }, [product]);

    // Check wishlist status on mount/product change
    useEffect(() => {
        if (!product) return;

        const token = localStorage.getItem("accessToken");
        if (token) {
            fetch(`${API_BASE}/api/wishlists`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
                .then(res => res.json())
                .then(data => {
                    const list = normalizeArray(data);
                    setIsFavorite(list.some(p => String(p.id) === String(product.id)));
                })
                .catch(() => {
                    let favorites = [];
                    try {
                        const raw = localStorage.getItem("wishlist");
                        favorites = raw ? JSON.parse(raw) : [];
                    } catch (e) {
                        favorites = [];
                    }
                    setIsFavorite(favorites.some(fav => String(fav.id) === String(product.id)));
                });
        } else {
            let favorites = [];
            try {
                const raw = localStorage.getItem("wishlist");
                favorites = raw ? JSON.parse(raw) : [];
            } catch (e) {
                favorites = [];
            }
            setIsFavorite(favorites.some(fav => String(fav.id) === String(product.id)));
        }
    }, [product]);

    // Track recently viewed history
    useEffect(() => {
        if (!product) return;

        let items = [];
        try {
            const raw = localStorage.getItem("recentlyViewed");
            items = raw ? JSON.parse(raw) : [];
        } catch (e) {
            items = [];
        }

        // Remove duplicate of current product if it exists
        items = items.filter(item => String(item.id) !== String(product.id));

        // Add current product details
        const newItem = {
            id: product.id,
            title: product.title,
            price: product.price,
            originalPrice: product.originalPrice,
            category: product.category,
            colors: product.colors,
            image: images[0] || product.image,
            rating: product.rating
        };
        items.unshift(newItem);

        // Keep only top 10 items
        items = items.slice(0, 10);

        localStorage.setItem("recentlyViewed", JSON.stringify(items));

        // Filter out current product to display in list below
        setRecentlyViewed(items.filter(item => String(item.id) !== String(product.id)));
    }, [product, images]);

    const toggleFavorite = async () => {
        if (!product) return;
        const token = localStorage.getItem("accessToken");
        if (token) {
            try {
                const res = await fetch(`${API_BASE}/api/wishlists/${product.id}`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                if (res.ok) {
                    const result = await res.json();
                    setIsFavorite(!!result.added);
                    return;
                }
            } catch (e) {
                console.error("Backend wishlist toggle failed, using local storage", e);
            }
        }

        let favorites = [];
        try {
            const raw = localStorage.getItem("wishlist");
            favorites = raw ? JSON.parse(raw) : [];
        } catch (e) {
            favorites = [];
        }

        const exists = favorites.some(fav => String(fav.id) === String(product.id));
        if (exists) {
            favorites = favorites.filter(fav => String(fav.id) !== String(product.id));
            setIsFavorite(false);
        } else {
            favorites.push({
                id: product.id,
                title: product.title,
                price: product.price,
                image: images[0] || product.image,
                rating: product.rating
            });
            setIsFavorite(true);
        }
        localStorage.setItem("wishlist", JSON.stringify(favorites));
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!commentInput.trim()) return;

        setSubmittingReview(true);
        setReviewMessage("");
        const token = localStorage.getItem("accessToken");

        try {
            const res = await fetch(`${API_BASE}/api/reviews/product`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    productId: Number(id),
                    orderId: eligibleOrder.id,
                    rating: Number(ratingInput),
                    comment: commentInput.trim(),
                    images: imagesInput.split(",").map(i => i.trim()).filter(Boolean)
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Đánh giá thất bại.");

            setReviewMessage(`🎉 Đánh giá thành công! Bạn nhận được +${data.rewardPoints || 10} điểm tích lũy và mã giảm giá ${data.rewardCouponCode || ""}`);
            setCommentInput("");
            setImagesInput("");
            setEligibleOrder(null);
            fetchProductReviews();
        } catch (err) {
            setReviewMessage(`❌ Lỗi: ${err.message}`);
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleQuantityChange = (val) => {
        if (val < 1) return;
        setQuantity(val);
    };

    const handleAddToCart = async () => {
        if (adding) return;
        setAdding(true);
        try {
            await addToCart(product.id, quantity, selectedColor);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        } catch (err) {
            alert(err.message || "Lỗi thêm giỏ hàng");
        } finally {
            setAdding(false);
        }
    };

    const handleBuyNow = async () => {
        try {
            await addToCart(product.id, quantity, selectedColor);
            navigate("/checkout");
        } catch (err) {
            alert(err.message || "Lỗi mua ngay");
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;
    if (!product) return <div className="p-4">Not found</div>;

    return (
        <div className="min-h-screen bg-[#f8f9fb]">
            <Header />

            <main className="max-w-6xl mx-auto p-4 pt-10">
                <div className="flex gap-10">
                    {/* Left: Images */}
                    <div className="w-1/2">
                        {images.length ? (
                            <div className="flex flex-col gap-4">
                                <div className="w-full aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                                    <img src={images[activeImage]} className="w-full h-full object-cover" alt={product.title} />
                                </div>
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {images.map((img, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => setActiveImage(idx)}
                                            className={`w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${activeImage === idx ? 'border-blue-600' : 'border-transparent hover:border-gray-300'}`}
                                        >
                                            <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="w-full aspect-[4/3] bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">Không có hình ảnh</div>
                        )}
                    </div>

                    {/* Right: Info */}
                    <div className="w-1/2">
                        <div className="flex items-start justify-between gap-4">
                            <h1 className="text-3xl font-bold text-gray-900 leading-tight flex-1">{product.title}</h1>
                            <button
                                onClick={toggleFavorite}
                                className={`p-3 rounded-full border transition-all cursor-pointer ${isFavorite
                                    ? "bg-red-50 border-red-200 text-red-500 shadow-sm"
                                    : "bg-white border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-gray-50"
                                    }`}
                                title={isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
                            >
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3 text-xs text-gray-500 border-b border-gray-150 pb-4">
                            <span className="flex items-center gap-1 text-orange-400 text-sm">
                                {'★'.repeat(Math.round(product.rating || 5)) + '☆'.repeat(5 - Math.round(product.rating || 5))}
                                <span className="text-gray-500 ml-1 text-xs font-semibold">{product.rating ? Number(product.rating).toFixed(1) : '5.0'}</span>
                            </span>
                            <span className="text-gray-300">|</span>
                            <span className="flex items-center gap-1 text-gray-600 font-medium">
                                👥 <strong>{product.buyersCount || 0}</strong> khách mua
                            </span>
                            <span className="text-gray-300">|</span>
                            <span className="flex items-center gap-1 text-gray-600 font-medium">
                                💬 <strong>{product.commentersCount || 0}</strong> lượt bình luận
                            </span>
                        </div>

                        <div className="text-3xl font-bold text-gray-900 mt-5">
                            {Number(product.price).toLocaleString()}đ
                            {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-xl text-gray-400 line-through ml-3 font-medium">{Number(product.originalPrice).toLocaleString()}đ</span>
                            )}
                        </div>

                        <p className="mt-5 text-gray-600 leading-relaxed text-sm">
                            {product.description || "Chưa có mô tả cho sản phẩm này."}
                        </p>

                        {/* Colors */}
                        <div className="mt-8">
                            <div className="text-sm font-semibold mb-3 text-gray-800">
                                Màu sắc: <span className="font-bold text-blue-600">{selectedColor || "Mặc định"}</span>
                            </div>
                            <div className="flex gap-3">
                                {product.colors && product.colors.length > 0 ? (
                                    product.colors.map((c, i) => (
                                        <button
                                            key={i}
                                            title={c.label}
                                            onClick={() => setSelectedColor(c.label)}
                                            className={`w-8 h-8 rounded-full border border-gray-300 transition-all ${selectedColor === c.label ? 'ring-2 ring-offset-2 ring-blue-600 scale-110' : 'hover:scale-105'}`}
                                            style={{ backgroundColor: c.value }}
                                        ></button>
                                    ))
                                ) : (
                                    <div className="text-sm text-gray-400">Không có phân loại màu sắc</div>
                                )}
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className="mt-6">
                            <div className="text-sm font-semibold mb-3 text-gray-800">Số lượng</div>
                            <div className="flex items-center border border-gray-300 rounded-md w-28 h-10 bg-white overflow-hidden">
                                <button
                                    onClick={() => handleQuantityChange(quantity - 1)}
                                    className="w-1/3 h-full flex items-center justify-center text-gray-600 hover:bg-gray-100 font-medium transition-colors"
                                >
                                    -
                                </button>
                                <input
                                    type="text"
                                    value={quantity}
                                    readOnly
                                    className="w-1/3 h-full text-center border-none bg-transparent focus:outline-none text-sm font-semibold text-gray-800"
                                />
                                <button
                                    onClick={() => handleQuantityChange(quantity + 1)}
                                    className="w-1/3 h-full flex items-center justify-center text-gray-600 hover:bg-gray-100 font-medium transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="mt-8 flex flex-col gap-3">
                            <button
                                onClick={handleAddToCart}
                                disabled={adding}
                                className={`w-full text-white font-semibold py-3.5 rounded-md transition flex items-center justify-center gap-2 ${success
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-[#0057b7] hover:bg-blue-700"
                                    }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                {adding ? "Đang thêm..." : success ? "Đã thêm vào giỏ thành công! ✓" : "Thêm vào giỏ hàng"}
                            </button>
                            <button
                                onClick={handleBuyNow}
                                className="w-full bg-white text-[#0057b7] border border-blue-300 font-semibold py-3.5 rounded-md hover:bg-blue-50 transition"
                            >
                                Mua ngay
                            </button>
                        </div>

                        <div className="mt-8 flex flex-col gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full border border-green-500 flex items-center justify-center text-green-500 bg-white">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                                Miễn phí vận chuyển toàn quốc cho đơn từ 500.000đ
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full border border-green-500 flex items-center justify-center text-green-500 bg-white">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                                Bảo hành chính hãng 2 năm
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full border border-green-500 flex items-center justify-center text-green-500 bg-white">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                                Đổi trả miễn phí trong vòng 30 ngày
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shop Profile Card */}
                {product?.shop && (
                    <div className="mt-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-4 text-left">
                            <div className="w-16 h-16 rounded-full bg-green-50 text-[#00b14f] flex items-center justify-center font-bold text-2xl border border-green-100 overflow-hidden shrink-0">
                                {product.shop.logo ? (
                                    <img src={product.shop.logo.startsWith("http") ? product.shop.logo : `${API_BASE}${product.shop.logo}`} className="w-full h-full object-cover" />
                                ) : "🏪"}
                            </div>
                            <div>
                                <h3 className="font-extrabold text-gray-900 text-base">{product.shop.name}</h3>
                                <p className="text-xs text-gray-500 mt-1">{product.shop.description || "Chưa có mô tả cửa hàng."}</p>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-xs text-gray-400 font-semibold">
                                    <span className="text-amber-500">⭐ {Number(product.shop.rating || 0).toFixed(1)} / 5 ({product.shop.reviewCount || 0} đánh giá)</span>
                                    <span>📍 {product.shop.address}</span>
                                    <span>📞 {product.shop.phone}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate(`/products?shopId=${product.shop.id}`)}
                            className="px-5 py-2.5 bg-white border border-[#00b14f] text-[#00b14f] hover:bg-green-50 font-bold text-sm rounded-xl transition-all whitespace-nowrap cursor-pointer"
                        >
                            Xem Cửa Hàng
                        </button>
                    </div>
                )}
                <div className="mt-10 mb-16 relative">
                    <div className="flex items-center justify-between border-b pb-3 border-gray-200 mb-6">
                        <h2 className="font-bold text-xl text-gray-900">Sản phẩm tương tự</h2>
                        {similarProducts.length > 3 && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePrevSimilar}
                                    disabled={similarStartIndex === 0}
                                    className="p-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white text-gray-600 transition-colors shadow-sm cursor-pointer"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <button
                                    onClick={handleNextSimilar}
                                    disabled={similarStartIndex + 3 >= similarProducts.length}
                                    className="p-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white text-gray-600 transition-colors shadow-sm cursor-pointer"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        )}
                    </div>
                    {similarProducts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-300">
                            {similarProducts.slice(similarStartIndex, similarStartIndex + 3).map(p => (
                                <div key={p.id} onClick={() => navigate(`/product/${p.id}`)} className="cursor-pointer h-full">
                                    <ProductCard product={p} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm italic">Chưa có sản phẩm tương tự.</p>
                    )}
                </div>

                {/* Product Reviews Section */}
                <div className="mt-12 mb-16 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-left">
                    <h2 className="font-extrabold text-xl mb-6 text-gray-900 border-b pb-3 border-gray-100 flex items-center justify-between">
                        <span>Đánh giá sản phẩm ({reviews.length})</span>
                        {product?.rating && (
                            <span className="text-sm font-semibold text-amber-500">
                                Trung bình: ⭐ {Number(product.rating).toFixed(1)} / 5
                            </span>
                        )}
                    </h2>

                    {/* Review Form (if eligible) */}
                    {eligibleOrder && (
                        <div className="bg-green-50/30 border border-green-100/50 p-6 rounded-2xl mb-8">
                            <h3 className="font-extrabold text-sm text-gray-900 mb-1">Gửi đánh giá của bạn</h3>
                            <p className="text-xs text-gray-400 mb-4">Bạn đã nhận được sản phẩm từ đơn hàng #{eligibleOrder.id}. Chia sẻ cảm nhận để nhận ưu đãi tích điểm nhé!</p>

                            {reviewMessage && (
                                <div className="mb-4 p-3 bg-white border border-gray-100 text-xs font-semibold rounded-xl">
                                    {reviewMessage}
                                </div>
                            )}

                            <form onSubmit={handleReviewSubmit} className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Điểm đánh giá:</span>
                                    <div className="flex gap-1.5 text-xl">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRatingInput(star)}
                                                className={`transition-transform active:scale-95 cursor-pointer ${star <= ratingInput ? "text-amber-400" : "text-gray-200"}`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Bình luận của bạn</label>
                                    <textarea
                                        value={commentInput}
                                        onChange={(e) => setCommentInput(e.target.value)}
                                        placeholder="Sản phẩm rất tốt, giao hàng nhanh, phục vụ chu đáo..."
                                        rows={3}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#00b14f] bg-white resize-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Hình ảnh (URLs cách nhau bởi dấu phẩy - tùy chọn)</label>
                                    <input
                                        type="text"
                                        value={imagesInput}
                                        onChange={(e) => setImagesInput(e.target.value)}
                                        placeholder="https://example.com/image.jpg"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#00b14f] bg-white"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submittingReview}
                                    className="px-5 py-2.5 bg-[#00b14f] hover:bg-green-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                                >
                                    {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                                </button>
                            </form>
                        </div>
                    )}

                    {loadingReviews ? (
                        <div className="flex justify-center py-6">
                            <div className="animate-spin w-6 h-6 border-2 border-[#00b14f] border-t-transparent rounded-full" />
                        </div>
                    ) : reviews.length === 0 ? (
                        <p className="text-gray-400 text-sm italic py-4">Chưa có đánh giá nào cho sản phẩm này.</p>
                    ) : (
                        <div className="space-y-6 divide-y divide-gray-150">
                            {reviews.map((rev, idx) => (
                                <div key={rev.id} className={`pt-6 ${idx === 0 ? "pt-0" : ""}`}>
                                    <div className="flex justify-between items-start gap-4 text-left">
                                        <div>
                                            <span className="font-extrabold text-sm text-gray-900">{rev.user?.name || "Người mua ẩn danh"}</span>
                                            <div className="text-amber-400 text-xs mt-0.5">{"★".repeat(rev.rating)}</div>
                                        </div>
                                        <span className="text-[10px] text-gray-400 font-semibold">{new Date(rev.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2.5 leading-relaxed text-left">{rev.comment}</p>

                                    {rev.images && rev.images.length > 0 && (
                                        <div className="flex gap-2.5 mt-3">
                                            {rev.images.map((img, i) => (
                                                <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-gray-100">
                                                    <img src={img.startsWith("http") ? img : `${API_BASE}${img}`} className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {rev.vendorReply && (
                                        <div className="mt-3.5 bg-gray-50/50 p-4 rounded-xl border border-gray-100 text-xs text-left">
                                            <p className="font-bold text-[#00b14f]">Phản hồi từ người bán:</p>
                                            <p className="text-gray-600 mt-1 leading-relaxed">{rev.vendorReply}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ProductDetail;
