const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();

const { authMiddleware, requireRole } = require('../middleware/auth');

const {
    getProfile,
    updateProfile,
    upsertAddress,
    removeAddress,
    setDefaultAddress,
    listUsers,
    setUserStatus,
    setUserRole,
    getUserCoupons
} = require('../controllers/userController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `avatar_${req.user.id}_${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Chỉ chấp nhận file ảnh.'));
        }

        cb(null, true);
    }
});

router.get('/profile', authMiddleware, getProfile);

router.put(
    '/profile',
    authMiddleware,
    upload.single('avatar'),
    updateProfile
);

router.post('/addresses', authMiddleware, upsertAddress);

router.delete(
    '/addresses/:addressId',
    authMiddleware,
    removeAddress
);

router.patch(
    '/addresses/:addressId/default',
    authMiddleware,
    setDefaultAddress
);

router.get('/coupons', authMiddleware, getUserCoupons);
router.get('/', authMiddleware, requireRole('admin'), listUsers);

router.patch('/:id/status', authMiddleware, requireRole('admin'), setUserStatus);

router.patch('/:id/role', authMiddleware, requireRole('admin'), setUserRole);

module.exports = router;
