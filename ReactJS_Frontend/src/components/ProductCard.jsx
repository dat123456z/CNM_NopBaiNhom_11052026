import React, { useState } from "react";
import { useCart } from "../context/CartContext";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const [adding, setAdding] = useState(false);
    const [success, setSuccess] = useState(false);

    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const discountPercent = hasDiscount
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    let image = product.image;
    if (Array.isArray(product.images) && product.images.length > 0) image = product.images[0];
    else if (typeof product.images === 'string') {
        try { image = JSON.parse(product.images)[0]; } catch(e){}
    }

    const imageSrc = image ? (image.startsWith("http") ? image : `${API_BASE}${image}`) : "";

    const handleAddToCart = async (e) => {
        e.stopPropagation();
        if (adding) return;
        setAdding(true);
        try {
            // Lấy màu đầu tiên làm mặc định nếu có
            let defaultColor = "";
            if (product.colors && product.colors.length > 0) {
                defaultColor = product.colors[0].label;
            }
            await addToCart(product.id, 1, defaultColor);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        } catch (err) {
            alert(err.message || "Không thể thêm vào giỏ hàng");
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 relative flex flex-col h-full hover:shadow-lg transition-shadow">
            <div className="h-80 w-full bg-gray-100 flex items-center justify-center overflow-hidden relative">
                <img src={imageSrc} alt={product.title} className="object-cover w-full h-full" />
            </div>
            <div className="p-4 flex flex-col flex-1">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{product.category || 'Category'}</div>
                <h3 className="text-[15px] font-bold text-gray-900 mb-3 leading-tight line-clamp-2">{product.title}</h3>
                
                <div className="mt-auto flex items-end justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="text-lg font-bold text-gray-900">{Number(product.price).toLocaleString()}đ</div>
                        {hasDiscount && (
                            <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded">-{discountPercent}%</span>
                        )}
                    </div>
                    <div className="flex items-center text-xs font-semibold text-gray-600 gap-1">
                        <span className="text-orange-400 text-sm">★</span> {product.rating ? Number(product.rating).toFixed(1) : '5.0'}
                    </div>
                </div>

                <button 
                    className={`w-full py-2.5 rounded-md font-semibold text-sm transition-colors flex items-center justify-center gap-2 text-white ${
                        success 
                            ? "bg-green-600 hover:bg-green-700" 
                            : "bg-[#004b87] hover:bg-[#003666]"
                    }`}
                    onClick={handleAddToCart}
                    disabled={adding}
                >
                    {adding ? "Đang thêm..." : success ? "Đã thêm! ✓" : "Thêm vào giỏ"}
                    {!success && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;

