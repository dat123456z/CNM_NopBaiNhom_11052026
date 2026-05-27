const express = require('express');

const router = express.Router();

const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    setProductStatus,
    getSimilarProducts
} = require('../controllers/productController');

router.get('/', getProducts);
router.get('/:id/similar', getSimilarProducts);
router.get('/:id', getProductById);

router.post('/', createProduct);

router.put('/:id', updateProduct);

router.delete('/:id', deleteProduct);

router.patch('/:id/status', setProductStatus);

module.exports = router;