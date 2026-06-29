import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../../components/ProductCard";
import { fetchAllProducts } from "../../api/productApi";
import { getAiRecommendations } from "../../api/chatApi";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

const HorizontalProductSlider = ({ title, products, navigate }) => {
    const sliderId = useMemo(() => `slider-${Math.random().toString(36).substr(2, 9)}`, []);

    const scroll = (direction) => {
        const container = document.getElementById(sliderId);
        if (!container) return;
        const scrollWidth = container.clientWidth;
        const target = direction === "left"
            ? container.scrollLeft - scrollWidth
            : container.scrollLeft + scrollWidth;
        container.scrollTo({ left: target, behavior: "smooth" });
    };

    if (!products || products.length === 0) return null;

    return (
        <section className="mb-12 relative group/section">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">{title}</h3>
                <div className="flex items-center gap-2">
                    <button onClick={() => scroll("left")} className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all cursor-pointer">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={() => scroll("right")} className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all cursor-pointer">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>
            <div
                id={sliderId}
                className="flex gap-6 overflow-x-auto scroll-smooth scrollbar-none pb-4 snap-x snap-mandatory"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {products.map((p) => (
                    <div key={p.id} className="w-70 md:w-72.5 shrink-0 snap-start cursor-pointer transition-transform duration-300" onClick={() => navigate(`/product/${p.id}`)}>
                        <ProductCard product={p} />
                    </div>
                ))}
            </div>
        </section>
    );
};

const HomePage = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const [aiRecommended, setAiRecommended] = useState([]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem("recentlyViewed");
            if (raw) setRecentlyViewed(JSON.parse(raw));
        } catch (e) {
            console.error("Error parsing recently viewed:", e);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        const loadProducts = async () => {
            try {
                setLoading(true);
                setError("");
                const token = localStorage.getItem("accessToken");
                const data = await fetchAllProducts({
                    apiBase: API_BASE,
                    signal: controller.signal,
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {})
                    }
                });
                setProducts(data);
            } catch (err) {
                if (err.status === 401) { localStorage.clear(); navigate("/login"); return; }
                if (err.name !== "AbortError") setError(err.message || "Error");
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
        return () => controller.abort();
    }, [navigate]);

    const bestsellers = useMemo(() => [...products].sort((a, b) => Number(b.sold || 0) - Number(a.sold || 0)).slice(0, 10), [products]);
    const mostViewed = useMemo(() => [...products].sort((a, b) => Number(b.views || 0) - Number(a.views || 0)).slice(0, 10), [products]);

    // Fetch AI recommendations when products and recentlyViewed are ready
    useEffect(() => {
        if (products.length > 0 && recentlyViewed.length > 0) {
            getAiRecommendations(recentlyViewed)
                .then(data => {
                    if (data?.ok && Array.isArray(data.recommendedIds)) {
                        const recs = data.recommendedIds
                            .map(id => products.find(p => String(p.id) === String(id)))
                            .filter(Boolean);
                        setAiRecommended(recs);
                    }
                })
                .catch(err => console.error("Lỗi lấy gợi ý AI:", err));
        }
    }, [products, recentlyViewed]);

    if (loading) return <div className="p-4">Đang tải...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;

    return (
        <>
            <style>{`.scrollbar-none::-webkit-scrollbar{display:none}.scrollbar-none{-ms-overflow-style:none;scrollbar-width:none}`}</style>

            {/* Banner full width, không bọc trong max-w */}
            <div style={{ position: 'relative', width: '100%', height: '360px', overflow: 'hidden', marginBottom: '2rem' }}>
                <img
                    src="/homepage_banner.png"
                    alt="Banner"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                />
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '0 5rem',
                }}>
                    <span style={{ color: '#00b14f', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px', fontSize: '0.875rem' }}>
                        Ưu đãi mùa hè
                    </span>
                    <h2 style={{ fontSize: '2.8rem', fontWeight: 800, color: 'white', margin: '0 0 16px 0', lineHeight: 1.2, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                        Bùng nổ phong cách <br />
                        <span style={{ color: '#00b14f' }}>Sale Up To 50%</span>
                    </h2>
                    <p style={{ color: '#e5e7eb', margin: '0 0 28px 0', maxWidth: '420px', fontSize: '1rem', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                        Khám phá ngay bộ sưu tập thời trang và công nghệ mới nhất. Số lượng có hạn, chốt đơn liền tay!
                    </p>
                    <div>
                        <button
                            onClick={() => navigate('/products')}
                            style={{ background: '#00b14f', color: 'white', padding: '12px 36px', borderRadius: '9999px', fontWeight: 700, fontSize: '1.1rem', border: 'none', cursor: 'pointer' }}
                        >
                            Mua sắm ngay
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 mt-8">
                {aiRecommended.length > 0 && (
                    <HorizontalProductSlider title="Dành riêng cho bạn" products={aiRecommended} navigate={navigate} />
                )}
                <HorizontalProductSlider title="Bán chạy nhất" products={bestsellers} navigate={navigate} />
                <HorizontalProductSlider title="Xem nhiều nhất" products={mostViewed} navigate={navigate} />
                <HorizontalProductSlider title="Sản phẩm đã xem gần đây" products={recentlyViewed} navigate={navigate} />
            </main>

        </>
    );
};

export default HomePage;
