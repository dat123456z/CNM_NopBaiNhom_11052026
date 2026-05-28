const productService = require('../services/productService');

const getProducts = async (req, res) => {
    try {
        const result = await productService.getProducts(req.query);
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
        const product = await productService.createProduct(req.shop.id, req.body);
        return res.status(201).json(product);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const product = await productService.updateProduct(req.params.id, req.shop.id, req.body);
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
        const product = await productService.setProductStatus(req.params.id, req.body.status);
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
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    setProductStatus,
    getSimilarProducts,
    getManagerProducts
};