const express = require('express');
const multer = require('multer');
const router = express.Router();
const aiController = require('../controllers/aiController');

const imageUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
            const error = new Error('Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.');
            error.status = 400;
            return cb(error);
        }
        cb(null, true);
    }
});

router.post('/chat', aiController.chat);
router.post(
    '/image-search',
    imageUpload.single('image'),
    aiController.imageSearch
);
router.post('/recommend', aiController.recommend);

module.exports = router;
