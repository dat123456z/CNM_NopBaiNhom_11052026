const productService = require('../services/productService');

const getColorValue = (label) => {
    if (!label) return '#1a1a1a';
    const clean = label.trim().toLowerCase();
    
    // Standard English color hex mappings
    const englishColors = {
        blue: "#3b82f6",
        black: "#000000",
        white: "#ffffff",
        red: "#ef4444",
        green: "#10b981",
        yellow: "#eab308",
        orange: "#f97316",
        pink: "#ec4899",
        purple: "#8b5cf6",
        gray: "#6b7280",
        grey: "#6b7280",
        brown: "#78350f",
        silver: "#c0c0c0",
        gold: "#ffd700",
        cyan: "#06b6d4",
        magenta: "#d946ef",
        kaki: "#907459"
    };

    if (englishColors[clean]) return englishColors[clean];

    // Standard Vietnamese color name mappings
    const viColors = {
        "đỏ": "#ef4444",
        "đen": "#000000",
        "trắng": "#ffffff",
        "xanh": "#3b82f6",
        "xanh lá": "#10b981",
        "xanh lá cây": "#10b981",
        "xanh dương": "#3b82f6",
        "xanh lam": "#3b82f6",
        "xanh nước biển": "#3b82f6",
        "vàng": "#eab308",
        "hồng": "#ec4899",
        "cam": "#f97316",
        "tím": "#8b5cf6",
        "xám": "#6b7280",
        "nâu": "#78350f",
        "bạc": "#c0c0c0",
        "vàng kim": "#ffd700"
    };

    if (viColors[clean]) return viColors[clean];

    if (clean.startsWith("#")) return clean;
    
    // Generate a deterministic color hex hash for any other label (e.g. "Space Grey")
    let hash = 0;
    for (let i = 0; i < clean.length; i++) {
        hash = clean.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return "#" + "00000".substring(0, 6 - color.length) + color;
};

const getProducts = async (req, res) => {
    try {
        const result = await productService.getProducts(req.query);
        return res.json(result);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const getShopProducts = async (req, res) => {
    try {
        const result = await productService.getShopProducts(req.shop.id, req.query);
        return res.json(result);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        return res.json(product);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const createProduct = async (req, res) => {
    try {
        let imagesList = [];
        if (req.files && req.files.length > 0) {
            imagesList = req.files.map(file => `/uploads/${file.filename}`);
        } else if (req.body.images) {
            if (typeof req.body.images === 'string') {
                try {
                    imagesList = JSON.parse(req.body.images);
                } catch (e) {
                    imagesList = req.body.images.split(',').map(s => s.trim()).filter(Boolean);
                }
            } else if (Array.isArray(req.body.images)) {
                imagesList = req.body.images;
            }
        }
        
        let colorsList = [];
        if (req.body.colors) {
            let temp = [];
            if (typeof req.body.colors === 'string') {
                try {
                    temp = JSON.parse(req.body.colors);
                } catch (e) {
                    temp = req.body.colors.split(',').map(s => ({ label: s.trim() }));
                }
            } else if (Array.isArray(req.body.colors)) {
                temp = req.body.colors;
            }
            colorsList = temp.map(c => {
                const label = typeof c === 'string' ? c : (c.label || '');
                const val = (c.value && c.value !== '#1a1a1a') ? c.value : getColorValue(label);
                return { label, value: val };
            }).filter(c => c.label);
        }

        const productData = {
            ...req.body,
            images: imagesList,
            colors: colorsList,
            price: Number(req.body.price || 0),
            originalPrice: req.body.originalPrice ? Number(req.body.originalPrice) : null,
            stock: Number(req.body.stock || 0)
        };

        const product = await productService.createProduct(req.shop.id, productData);
        return res.status(201).json(product);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        let imagesList = [];
        if (req.body.existingImages) {
            try {
                imagesList = JSON.parse(req.body.existingImages);
            } catch (e) {
                imagesList = typeof req.body.existingImages === 'string' 
                    ? req.body.existingImages.split(',').map(s => s.trim()).filter(Boolean)
                    : [];
            }
        } else if (req.body.images) {
            try {
                imagesList = JSON.parse(req.body.images);
            } catch (e) {
                imagesList = typeof req.body.images === 'string'
                    ? req.body.images.split(',').map(s => s.trim()).filter(Boolean)
                    : [];
            }
        }

        if (req.files && req.files.length > 0) {
            const uploaded = req.files.map(file => `/uploads/${file.filename}`);
            imagesList = [...imagesList, ...uploaded];
        }

        let colorsList = [];
        if (req.body.colors) {
            let temp = [];
            if (typeof req.body.colors === 'string') {
                try {
                    temp = JSON.parse(req.body.colors);
                } catch (e) {
                    temp = req.body.colors.split(',').map(s => ({ label: s.trim() }));
                }
            } else if (Array.isArray(req.body.colors)) {
                temp = req.body.colors;
            }
            colorsList = temp.map(c => {
                const label = typeof c === 'string' ? c : (c.label || '');
                const val = (c.value && c.value !== '#1a1a1a') ? c.value : getColorValue(label);
                return { label, value: val };
            }).filter(c => c.label);
        }

        const productData = {
            ...req.body,
            images: imagesList,
            colors: colorsList
        };
        
        if (req.body.price !== undefined) productData.price = Number(req.body.price);
        if (req.body.originalPrice !== undefined) productData.originalPrice = req.body.originalPrice ? Number(req.body.originalPrice) : null;
        if (req.body.stock !== undefined) productData.stock = Number(req.body.stock);

        const product = await productService.updateProduct(req.params.id, req.shop.id, productData);
        return res.json(product);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        await productService.deleteProduct(req.params.id, req.shop.id);
        return res.json({ message: 'Đã xoá sản phẩm.' });
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const setProductStatus = async (req, res) => {
    try {
        const options = req.shop
            ? {
                shopId: req.shop.id,
                allowedStatuses: ['active', 'hidden'],
                allowedTransitions: {
                    active: ['hidden'],
                    hidden: ['active']
                }
            }
            : {};
        const product = await productService.setProductStatus(req.params.id, req.body.status, {
            ...options,
            reason: req.body.reason
        });
        return res.json(product);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const getSimilarProducts = async (req, res) => {
    try {
        const products = await productService.getSimilarProducts(req.params.id);
        return res.json(products);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const getManagerProducts = async (req, res) => {
    try {
        const result = await productService.getManagerProducts(req.query);
        return res.json(result);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

module.exports = {
    getProducts,
    getShopProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    setProductStatus,
    getSimilarProducts,
    getManagerProducts
};
