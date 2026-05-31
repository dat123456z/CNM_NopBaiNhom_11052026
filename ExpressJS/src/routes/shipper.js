const express = require('express');
const router = express.Router();
const { authMiddleware, vendorMiddleware } = require('../middleware/auth');
const {
    getShippers,
    createShipper,
    updateShipper,
    deleteShipper,
    getShipperOrders
} = require('../controllers/shipperController');

// All shipper routes require the user to be authenticated and be a vendor (have a shop)
router.use(authMiddleware);
router.use(vendorMiddleware);

router.get('/', getShippers);
router.post('/', createShipper);
router.put('/:id', updateShipper);
router.delete('/:id', deleteShipper);
router.get('/:id/orders', getShipperOrders);

module.exports = router;
