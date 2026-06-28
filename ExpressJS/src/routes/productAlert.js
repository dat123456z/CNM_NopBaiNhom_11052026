const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { getAlert, updateAlert } = require('../controllers/productAlertController');

const router = express.Router();

router.get('/:productId', authMiddleware, getAlert);
router.put('/:productId', authMiddleware, updateAlert);

module.exports = router;
