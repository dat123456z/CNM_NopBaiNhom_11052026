import { useState, useEffect } from "react";
import LineIcon from "../../components/LineIcon";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const fmt = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";
const PRODUCTS_PER_PAGE = 5;

const VendorProducts = ({ shop }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [productModal, setProductModal] = useState({ open: false, editing: null });
    const [productForm, setProductForm] = useState({
        title: "",
        description: "",
        price: "",
        originalPrice: "",
        category: "",
        stock: "",
        colors: ""
    });

    // Image upload states
    const [existingImagesList, setExistingImagesList] = useState([]);
    const [newImageFiles, setNewImageFiles] = useState([]);
    const [newImagePreviews, setNewImagePreviews] = useState([]);

    useEffect(() => {
        if (!shop) return;
        fetchProducts();
    }, [shop]);

    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(products.length / PRODUCTS_PER_PAGE));
        setCurrentPage((page) => Math.min(page, totalPages));
    }, [products.length]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${API_URL}/api/products?shopId=${shop.id}&allStatus=true`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setProducts(data.products || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAdd = () => {
        setProductForm({ title: "", description: "", price: "", originalPrice: "", category: "", stock: "", colors: "" });
        setExistingImagesList([]);
        setNewImageFiles([]);
        setNewImagePreviews([]);
        setProductModal({ open: true, editing: null });
    };

    const editProductClick = (p) => {
        setProductForm({
            title: p.title || "",
            description: p.desc || p.description || "",
            price: p.price || "",
            originalPrice: p.originalPrice || "",
            category: p.category || "",
            stock: p.stock || "",
            colors: Array.isArray(p.colors) ? p.colors.map(c => c.label || c).join(", ") : ""
        });
        setExistingImagesList(Array.isArray(p.images) ? p.images : []);
        setNewImageFiles([]);
        setNewImagePreviews([]);
        setProductModal({ open: true, editing: p.id });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files || []);
        const validFiles = [];
        const newPreviews = [];

        for (const file of files) {
            if (file.size > 2 * 1024 * 1024) {
                alert(`File "${file.name}" vượt quá 2MB. Vui lòng chọn ảnh có kích thước nhỏ hơn.`);
                continue;
            }
            validFiles.push(file);
            newPreviews.push(URL.createObjectURL(file));
        }

        setNewImageFiles(prev => [...prev, ...validFiles]);
        setNewImagePreviews(prev => [...prev, ...newPreviews]);

        // Reset target value so selection of same file is caught
        e.target.value = "";
    };

    const removeNewImage = (index) => {
        setNewImageFiles(prev => prev.filter((_, i) => i !== index));
        URL.revokeObjectURL(newImagePreviews[index]);
        setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (url) => {
        setExistingImagesList(prev => prev.filter(item => item !== url));
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();

        if (existingImagesList.length === 0 && newImageFiles.length === 0) {
            alert("Vui lòng đăng tải ít nhất 1 hình ảnh cho sản phẩm.");
            return;
        }

        const token = localStorage.getItem("accessToken");
        const isEditing = !!productModal.editing;
        const url = isEditing
            ? `${API_URL}/api/products/${productModal.editing}`
            : `${API_URL}/api/products`;
        const method = isEditing ? "PUT" : "POST";

        const formData = new FormData();
        formData.append("title", productForm.title.trim());
        formData.append("description", productForm.description.trim());
        formData.append("price", String(Number(productForm.price)));
        formData.append("originalPrice", productForm.originalPrice ? String(Number(productForm.originalPrice)) : "");
        formData.append("category", productForm.category.trim());
        formData.append("stock", String(Number(productForm.stock)));

        const colorsArray = productForm.colors.split(",")
            .map(c => c.trim())
            .filter(Boolean)
            .map(c => ({ label: c, value: "#1a1a1a" }));
        formData.append("colors", JSON.stringify(colorsArray));

        if (isEditing) {
            formData.append("existingImages", JSON.stringify(existingImagesList));
        }

        newImageFiles.forEach(file => {
            formData.append("images", file);
        });

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Thao tác lưu sản phẩm thất bại.");

            // Revoke blobs to prevent memory leaks
            newImagePreviews.forEach(URL.revokeObjectURL);

            setProductModal({ open: false, editing: null });
            fetchProducts();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleProductDelete = async (id) => {
        if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
        const token = localStorage.getItem("accessToken");
        try {
            const res = await fetch(`${API_URL}/api/products/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) fetchProducts();
            else {
                const data = await res.json();
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const toggleProductStatus = async (p) => {
        const nextStatus = p.status === "active" ? "inactive" : "active";
        const token = localStorage.getItem("accessToken");
        try {
            const res = await fetch(`${API_URL}/api/products/${p.id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: nextStatus })
            });
            if (res.ok) fetchProducts();
            else {
                const data = await res.json();
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const totalPages = Math.max(1, Math.ceil(products.length / PRODUCTS_PER_PAGE));
    const pageStart = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const paginatedProducts = products.slice(pageStart, pageStart + PRODUCTS_PER_PAGE);

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-extrabold text-gray-900">Quản lý sản phẩm</h1>
                    <button
                        onClick={handleOpenAdd}
                        className="px-5 py-2.5 bg-[#00b14f] hover:bg-green-600 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        Thêm sản phẩm mới
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-[#00b14f] border-t-transparent rounded-full" /></div>
                ) : products.length === 0 ? (
                    <div className="bg-white border border-gray-100 p-12 text-center rounded-2xl shadow-xs text-gray-400 text-sm">Chưa có sản phẩm nào. Hãy đăng sản phẩm đầu tiên!</div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase">Hình ảnh</th>
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase">Tên sản phẩm</th>
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase">Giá / Kho</th>
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase">Danh mục</th>
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase">Trạng thái</th>
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-sm">
                                    {paginatedProducts.map(p => {
                                        const img = p.images && p.images.length > 0 ? p.images[0] : "";
                                        const imgSrc = img.startsWith("http") ? img : `${API_URL}${img}`;
                                        return (
                                            <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="p-4">
                                                    <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                                                        {img ? <img src={imgSrc} className="w-full h-full object-cover" /> : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                <LineIcon name="box" size={22} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 font-bold text-gray-900 truncate max-w-[200px]" title={p.title}>{p.title}</td>
                                                <td className="p-4">
                                                    <div className="font-extrabold text-[#00b14f]">{fmt(p.price)}</div>
                                                    <div className="text-[10px] text-gray-400 font-semibold mt-0.5">Kho: {p.stock}</div>
                                                </td>
                                                <td className="p-4"><span className="bg-gray-100 text-gray-500 font-bold text-[10px] px-2 py-0.5 rounded-full">{p.category}</span></td>
                                                <td className="p-4">
                                                    <button
                                                        onClick={() => toggleProductStatus(p)}
                                                        className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase transition-all cursor-pointer ${p.status === "active" ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-red-50 text-red-500 hover:bg-red-100"}`}
                                                    >
                                                        {p.status === "active" ? "Đang bán" : "Ẩn"}
                                                    </button>
                                                </td>
                                                <td className="p-4 text-right space-x-1">
                                                    <button onClick={() => editProductClick(p)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center" title="Chỉnh sửa">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    </button>
                                                    <button onClick={() => handleProductDelete(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center" title="Xóa">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-4 px-4 py-3 border-t border-gray-100 bg-gray-50/40">

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                        disabled={currentPage === 1}
                                        className="w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        &lt;
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            type="button"
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${currentPage === page
                                                ? "bg-[#00b14f] text-white"
                                                : "bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                        disabled={currentPage === totalPages}
                                        className="w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        &gt;
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* PRODUCT ADD/EDIT MODAL */}
            {productModal.open && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6 backdrop-blur-xs overflow-y-auto">
                    <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-8 relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setProductModal({ open: false, editing: null })}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer"
                        >
                            ✕
                        </button>
                        <h2 className="text-xl font-extrabold text-gray-900 mb-6">{productModal.editing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>
                        <form onSubmit={handleProductSubmit} className="space-y-4 text-left">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Tên sản phẩm *</label>
                                <input
                                    type="text"
                                    value={productForm.title}
                                    onChange={(e) => setProductForm(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00b14f]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Mô tả sản phẩm *</label>
                                <textarea
                                    value={productForm.description}
                                    onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00b14f] resize-none"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Giá bán (đ) *</label>
                                    <input
                                        type="number"
                                        value={productForm.price}
                                        onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00b14f]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Giá gốc (đ) (Tùy chọn)</label>
                                    <input
                                        type="number"
                                        value={productForm.originalPrice}
                                        onChange={(e) => setProductForm(prev => ({ ...prev, originalPrice: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00b14f]"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Danh mục *</label>
                                    <input
                                        type="text"
                                        value={productForm.category}
                                        onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                                        placeholder="Ví dụ: Điện thoại, Áo thun"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00b14f]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Số lượng kho *</label>
                                    <input
                                        type="number"
                                        value={productForm.stock}
                                        onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00b14f]"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Multiple image picker grid */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Hình ảnh sản phẩm * (Tối đa 10 ảnh)</label>
                                <div className="grid grid-cols-4 gap-3">
                                    {/* Existing images list */}
                                    {existingImagesList.map((url, idx) => {
                                        const src = url.startsWith("http") ? url : `${API_URL}${url}`;
                                        return (
                                            <div key={`existing-${idx}`} className="relative w-full aspect-square rounded-xl overflow-hidden border border-gray-150 shadow-xs group">
                                                <img src={src} className="w-full h-full object-cover" alt="Saved" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingImage(url)}
                                                    className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] cursor-pointer shadow transition-colors"
                                                    title="Xóa hình ảnh"
                                                >
                                                    ✕
                                                </button>
                                                <span className="absolute bottom-0 inset-x-0 bg-black/45 text-white text-[9px] py-0.5 text-center font-bold tracking-wider">Đã lưu</span>
                                            </div>
                                        );
                                    })}

                                    {/* New images list */}
                                    {newImagePreviews.map((previewUrl, idx) => (
                                        <div key={`new-${idx}`} className="relative w-full aspect-square rounded-xl overflow-hidden border border-gray-150 shadow-xs group">
                                            <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                                            <button
                                                type="button"
                                                onClick={() => removeNewImage(idx)}
                                                className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] cursor-pointer shadow transition-colors"
                                                title="Xóa hình ảnh"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}

                                    {/* Upload box */}
                                    {(existingImagesList.length + newImagePreviews.length) < 10 && (
                                        <label className="w-full aspect-square border-2 border-dashed border-gray-200 hover:border-[#00b14f] hover:bg-green-50/10 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-[#00b14f] transition-all cursor-pointer">
                                            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-[10px] font-bold">Thêm ảnh</span>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1.5">* Hỗ trợ PNG, JPG tối đa 2MB mỗi file.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Màu sắc (Cách nhau bởi dấu phẩy - Tùy chọn)</label>
                                <input
                                    type="text"
                                    value={productForm.colors}
                                    onChange={(e) => setProductForm(prev => ({ ...prev, colors: e.target.value }))}
                                    placeholder="Red, Blue, Green"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00b14f]"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-[#00b14f] hover:bg-green-600 text-white font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer"
                            >
                                Lưu sản phẩm
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default VendorProducts;
