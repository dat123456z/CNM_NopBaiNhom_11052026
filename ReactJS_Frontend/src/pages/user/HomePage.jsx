import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../../components/ProductCard";
import Chatbot from "../../components/Chatbot";
import { fetchAllProducts } from "../../api/productApi";

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

    if (loading) return <div className="p-4">Đang tải...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;

    return (
        <>
            <style>{`.scrollbar-none::-webkit-scrollbar{display:none}.scrollbar-none{-ms-overflow-style:none;scrollbar-width:none}`}</style>

            <div className="max-w-7xl mx-auto px-6 mt-6 mb-2">
                <div className="w-full relative rounded-2xl overflow-hidden shadow-lg group" style={{ minHeight: '320px' }}>
                    <img src="/homepage_banner.png" alt="Khuyến mãi đặc biệt" className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/40 to-transparent flex flex-col justify-center px-10 md:px-16">
                        <span className="text-[#00b14f] font-bold tracking-wider uppercase mb-2">Ưu đãi mùa hè</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg leading-tight">
                            Bùng nổ phong cách <br /> <span className="text-transparent bg-clip-text bg-linear-to-r from-[#00b14f] to-green-300">Sale Up To 50%</span>
                        </h2>
                        <p className="text-base text-gray-200 mb-8 max-w-md drop-shadow">Khám phá ngay bộ sưu tập thời trang và công nghệ mới nhất. Số lượng có hạn, chốt đơn liền tay!</p>
                        <div>
                            <button onClick={() => navigate('/products')} className="bg-[#00b14f] hover:bg-[#008a3d] text-white px-8 py-3 rounded-full font-bold text-lg transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(0,177,79,0.5)]">
                                Mua sắm ngay
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 mt-8">
                <HorizontalProductSlider title="Bán chạy nhất" products={bestsellers} navigate={navigate} />
                <HorizontalProductSlider title="Xem nhiều nhất" products={mostViewed} navigate={navigate} />
                <HorizontalProductSlider title="Sản phẩm đã xem gần đây" products={recentlyViewed} navigate={navigate} />
            </main>

            <Chatbot />
        </>
    );
};

export default HomePage;
