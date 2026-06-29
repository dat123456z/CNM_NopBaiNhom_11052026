import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProductCard from "../../components/ProductCard";
import Breadcrumb from "../../components/Breadcrumb";
import { fetchAllProducts } from "../../api/productApi";
import LineIcon from "../../components/LineIcon";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

const SORT_OPTIONS = [
    { value: "newest", label: "Mới nhất" },
    { value: "price_asc", label: "Giá tăng dần" },
    { value: "price_desc", label: "Giá giảm dần" },
    { value: "bestseller", label: "Bán chạy nhất" },
    { value: "discount", label: "Giảm giá nhiều nhất" },
];

const PRICE_RANGES = [
    { value: "all", label: "Tất cả mức giá" },
    { value: "0-200000", label: "Dưới 200.000đ" },
    { value: "200000-500000", label: "200.000đ – 500.000đ" },
    { value: "500000-1000000", label: "500.000đ – 1.000.000đ" },
    { value: "1000000-999999999", label: "Trên 1.000.000đ" },
];

const STOCK_OPTIONS = [
    { value: "all", label: "Tất cả" },
    { value: "instock", label: "Còn hàng" },
    { value: "outofstock", label: "Hết hàng" },
];

const FilterChip = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        style={{
            padding: "6px 14px",
            borderRadius: "999px",
            border: active ? "2px solid #e11d48" : "1.5px solid #e5e7eb",
            background: active ? "#fff1f2" : "#fff",
            color: active ? "#e11d48" : "#374151",
            fontWeight: active ? 700 : 500,
            fontSize: "0.82rem",
            cursor: "pointer",
            transition: "all 0.18s",
            fontFamily: "'Be Vietnam Pro', sans-serif",
            letterSpacing: "0.01em",
            whiteSpace: "nowrap",
        }}
    >
        {label}
    </button>
);

const ProductPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [priceRange, setPriceRange] = useState("all");
    const [customMin, setCustomMin] = useState("");
    const [customMax, setCustomMax] = useState("");
    const [stockFilter, setStockFilter] = useState("all");
    const [onlyDiscount, setOnlyDiscount] = useState(false);
    const [sortBy, setSortBy] = useState("newest");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [filterShopId, setFilterShopId] = useState(null);
    const [imageSearchResults, setImageSearchResults] = useState(null);
    const [imageAnalysis, setImageAnalysis] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [imageSearchLoading, setImageSearchLoading] = useState(false);
    const [imageSearchError, setImageSearchError] = useState("");
    const imageInputRef = useRef(null);

    useEffect(() => () => {
        if (imagePreview) URL.revokeObjectURL(imagePreview);
    }, [imagePreview]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, selectedCategory, priceRange, customMin, customMax, stockFilter, onlyDiscount, sortBy, filterShopId]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const shopIdParam = queryParams.get("shopId");
        if (shopIdParam) {
            setFilterShopId(Number(shopIdParam));
        } else {
            setFilterShopId(null);
        }
        const qParam = queryParams.get("q");
        if (qParam) {
            setSearch(qParam);
            setSearchInput(qParam);
        }
    }, [location.search]);

    useEffect(() => {
        const controller = new AbortController();
        const load = async () => {
            try {
                setLoading(true);
                setError("");
                const allProducts = await fetchAllProducts({
                    apiBase: API_BASE,
                    signal: controller.signal
                });
                setProducts(allProducts);
            } catch (err) {
                if (err.name !== "AbortError") setError(err.message || "Có lỗi xảy ra");
            } finally {
                setLoading(false);
            }
        };
        load();
        return () => controller.abort();
    }, []);

    const categories = useMemo(() => {
        const cats = [...new Set(products.map((p) => p.category).filter(Boolean))];
        return ["all", ...cats];
    }, [products]);

    const handleSearch = useCallback((e) => {
        e.preventDefault();
        setSearch(searchInput.trim());
    }, [searchInput]);

    const handleImageSearch = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            setImageSearchError("Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setImageSearchError("Ảnh không được vượt quá 5MB.");
            return;
        }

        setImagePreview(URL.createObjectURL(file));
        setImageSearchLoading(true);
        setImageSearchError("");
        setImageSearchResults(null);
        setImageAnalysis(null);

        try {
            const formData = new FormData();
            formData.append("image", file);
            const res = await fetch(`${API_BASE}/api/ai/image-search`, {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Không thể tìm sản phẩm bằng ảnh.");

            setImageAnalysis(data.analysis || null);
            setImageSearchResults(Array.isArray(data.products) ? data.products : []);
            setCurrentPage(1);
        } catch (err) {
            setImageSearchError(err.message);
        } finally {
            setImageSearchLoading(false);
        }
    };

    const clearImageSearch = () => {
        setImageSearchResults(null);
        setImageAnalysis(null);
        setImagePreview("");
        setImageSearchError("");
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setSearch("");
        setSearchInput("");
        setSelectedCategory("all");
        setPriceRange("all");
        setStockFilter("all");
        setOnlyDiscount(false);
        setSortBy("newest");
    };

    const filtered = useMemo(() => {
        let list = [...products];

        if (filterShopId) {
            list = list.filter((p) => Number(p.shopId) === filterShopId);
        }

        if (search) {
            const q = search.toLowerCase();
            list = list.filter(
                (p) =>
                    p.title?.toLowerCase().includes(q) ||
                    p.desc?.toLowerCase().includes(q) ||
                    p.category?.toLowerCase().includes(q)
            );
        }

        if (selectedCategory !== "all") {
            list = list.filter((p) => p.category === selectedCategory);
        }

        if (customMin || customMax) {
            const cMin = customMin ? Number(customMin) : 0;
            const cMax = customMax ? Number(customMax) : 999999999;
            list = list.filter((p) => Number(p.price) >= cMin && Number(p.price) <= cMax);
        } else if (priceRange !== "all") {
            const [min, max] = priceRange.split("-").map(Number);
            list = list.filter((p) => Number(p.price) >= min && Number(p.price) <= max);
        }

        if (stockFilter === "instock") list = list.filter((p) => p.stock > 0);
        if (stockFilter === "outofstock") list = list.filter((p) => p.stock === 0);

        if (onlyDiscount) {
            list = list.filter((p) => p.originalPrice && Number(p.originalPrice) > Number(p.price));
        }

        switch (sortBy) {
            case "price_asc": list.sort((a, b) => Number(a.price) - Number(b.price)); break;
            case "price_desc": list.sort((a, b) => Number(b.price) - Number(a.price)); break;
            case "bestseller": list.sort((a, b) => Number(b.sold || 0) - Number(a.sold || 0)); break;
            case "discount":
                list.sort((a, b) => {
                    const da = a.originalPrice ? Number(a.originalPrice) - Number(a.price) : 0;
                    const db = b.originalPrice ? Number(b.originalPrice) - Number(b.price) : 0;
                    return db - da;
                });
                break;
            default: break;
        }

        return list;
    }, [products, search, selectedCategory, priceRange, customMin, customMax, stockFilter, onlyDiscount, sortBy, filterShopId]);
    const visibleProducts = imageSearchResults ?? filtered;

    const activeFilterCount = [
        selectedCategory !== "all",
        priceRange !== "all",
        stockFilter !== "all",
        onlyDiscount,
    ].filter(Boolean).length;

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb", fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #fce7f3", borderTopColor: "#e11d48", animation: "spin 0.8s linear infinite" }} />
                    <span style={{ color: "#6b7280", fontWeight: 500 }}>Đang tải sản phẩm...</span>
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb" }}>
                <div style={{ background: "#fff", padding: 32, borderRadius: 16, textAlign: "center", boxShadow: "0 4px 24px #0001" }}>
                    <LineIcon name="alert" size={40} className="mx-auto mb-3 text-red-400" />
                    <p style={{ color: "#dc2626", fontWeight: 600, fontFamily: "'Be Vietnam Pro', sans-serif" }}>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "#f8f9fb", fontFamily: "'Be Vietnam Pro', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');
                * { box-sizing: border-box; }
                input:focus { outline: none; }
                select:focus { outline: none; }
                ::-webkit-scrollbar { width: 5px; }
                ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 99px; }
                .prod-card-wrap { transition: transform 0.18s, box-shadow 0.18s; }
                .prod-card-wrap:hover { transform: translateY(-3px); box-shadow: 0 8px 32px #e11d4822; }
                @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
                .fade-up { animation: fadeUp 0.35s ease both; }
            `}</style>
            <Breadcrumb align="viewport"/>

            <main className="max-w-7xl mx-auto px-6 py-10 flex gap-8">
                {/* Sidebar */}
                <aside className="w-64 shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        {/* Categories */}
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-blue-900 mb-4 border-b border-gray-100 pb-2">Danh mục</h3>
                            <div className="flex flex-col gap-3">
                                {categories.map((cat) => (
                                    <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative flex items-center justify-center">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 border-2 border-gray-300 rounded-sm appearance-none checked:bg-blue-600 checked:border-blue-600 cursor-pointer transition-colors"
                                                checked={selectedCategory === cat}
                                                onChange={() => setSelectedCategory(cat)}
                                            />
                                            {selectedCategory === cat && (
                                                <svg className="w-3 h-3 text-white absolute pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                            )}
                                        </div>
                                        <span className={`text-sm ${selectedCategory === cat ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>{cat === 'all' ? 'Tất cả' : cat}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div>
                            <h3 className="text-sm font-bold text-blue-900 mb-4 border-b border-gray-100 pb-2">Mức giá</h3>
                            <div className="flex flex-col gap-3">
                                {PRICE_RANGES.map((pr) => (
                                    <label key={pr.value} className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative flex items-center justify-center">
                                            <input 
                                                type="radio" 
                                                name="priceRange"
                                                className="w-4 h-4 border-2 border-gray-300 rounded-full appearance-none checked:bg-blue-600 checked:border-blue-600 cursor-pointer transition-colors"
                                                checked={priceRange === pr.value && !customMin && !customMax}
                                                onChange={() => {
                                                    setPriceRange(pr.value);
                                                    setCustomMin("");
                                                    setCustomMax("");
                                                }}
                                            />
                                            {(priceRange === pr.value && !customMin && !customMax) && (
                                                <div className="w-2 h-2 bg-white rounded-full absolute pointer-events-none"></div>
                                            )}
                                        </div>
                                        <span className={`text-sm ${(priceRange === pr.value && !customMin && !customMax) ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>{pr.label}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <span className="block text-xs font-bold text-gray-700 mb-3">Tự chọn khoảng giá</span>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 border border-gray-300 rounded-md p-1.5 bg-white">
                                        <input 
                                            type="number" 
                                            placeholder="Tối thiểu" 
                                            className="w-full text-xs text-center border-none focus:outline-none" 
                                            value={customMin}
                                            onChange={(e) => {
                                                setCustomMin(e.target.value);
                                            }}
                                        />
                                    </div>
                                    <span className="text-gray-400 text-xs font-semibold">-</span>
                                    <div className="flex-1 border border-gray-300 rounded-md p-1.5 bg-white">
                                        <input 
                                            type="number" 
                                            placeholder="Tối đa" 
                                            className="w-full text-xs text-center border-none focus:outline-none" 
                                            value={customMax}
                                            onChange={(e) => {
                                                setCustomMax(e.target.value);
                                            }}
                                        />
                                    </div>
                                </div>
                                {(customMin || customMax) && (
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setCustomMin("");
                                            setCustomMax("");
                                        }}
                                        className="mt-2.5 w-full py-1 text-[11px] font-bold text-red-500 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-all cursor-pointer"
                                    >
                                        Xóa tự chọn
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    {/* Top bar */}
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <div>
                            <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleImageSearch}
                                className="hidden"
                            />
                            <button
                                type="button"
                                disabled={imageSearchLoading}
                                onClick={() => imageInputRef.current?.click()}
                                className="inline-flex items-center gap-2 rounded-md border border-[#004b87] bg-[#004b87] px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-[#003666] hover:bg-[#003666] disabled:cursor-wait disabled:opacity-60"
                            >
                                <LineIcon name="search" size={17} />
                                {imageSearchLoading ? "AI đang nhận diện..." : "Tìm bằng hình ảnh"}
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Sắp xếp:</span>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border border-gray-200 rounded-md text-sm py-1.5 px-3 text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer">
                                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                    </div>

                    {(imagePreview || imageSearchError) && (
                        <div className="mb-6 flex items-center gap-4 rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
                            {imagePreview && (
                                <img
                                    src={imagePreview}
                                    alt="Ảnh tìm kiếm"
                                    className="h-20 w-20 shrink-0 rounded-lg border border-gray-200 object-cover"
                                />
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-gray-900">
                                    {imageSearchLoading
                                        ? "Gemini đang phân tích ảnh..."
                                        : "Kết quả tìm kiếm bằng hình ảnh"}
                                </p>
                                {imageAnalysis && (
                                    <>
                                        <p className="mt-1 text-xs text-gray-600">
                                            {imageAnalysis.description || imageAnalysis.object}
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {[
                                                imageAnalysis.object,
                                                imageAnalysis.category,
                                                ...(imageAnalysis.colors || []),
                                                ...(imageAnalysis.keywords || [])
                                            ].filter(Boolean).slice(0, 8).map((term, index) => (
                                                <span
                                                    key={`${term}-${index}`}
                                                    className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-[#004b87]"
                                                >
                                                    {term}
                                                </span>
                                            ))}
                                        </div>
                                    </>
                                )}
                                {imageSearchError && (
                                    <p className="mt-1 text-xs font-semibold text-red-600">{imageSearchError}</p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={clearImageSearch}
                                className="shrink-0 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                            >
                                Xóa
                            </button>
                        </div>
                    )}

                    {visibleProducts.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            <LineIcon name="cart" size={48} className="mx-auto mb-4 text-gray-300" />
                            <p className="font-bold text-lg text-gray-800 mb-2">
                                {imageSearchResults ? "Không có sản phẩm tương tự" : "Không tìm thấy sản phẩm"}
                            </p>
                            <button
                                onClick={imageSearchResults ? clearImageSearch : clearFilters}
                                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md font-semibold text-sm"
                            >
                                {imageSearchResults ? "Quay lại tất cả sản phẩm" : "Xóa bộ lọc"}
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {visibleProducts.slice((currentPage - 1) * 9, currentPage * 9).map((p) => (
                                    <div key={p.id} className="cursor-pointer h-full" onClick={() => navigate(`/product/${p.id}`)}>
                                        <ProductCard product={p} />
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {Math.ceil(visibleProducts.length / 9) > 1 && (
                                <div className="flex justify-center items-center gap-2 mt-12 mb-8">
                                    <button 
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-50"
                                    >&lt;</button>
                                    
                                    {Array.from({ length: Math.ceil(visibleProducts.length / 9) }, (_, i) => i + 1).map(page => (
                                        <button 
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-8 h-8 flex items-center justify-center rounded font-medium ${currentPage === page ? 'bg-[#004b87] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    
                                    <button 
                                        onClick={() => setCurrentPage(prev => Math.min(Math.ceil(visibleProducts.length / 9), prev + 1))}
                                        disabled={currentPage === Math.ceil(visibleProducts.length / 9)}
                                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-50"
                                    >&gt;</button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ProductPage;
