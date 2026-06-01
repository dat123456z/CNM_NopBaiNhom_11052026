const notificationService = require('../services/notificationService');

const getNotifications = async (req, res) => {
    try {
        const result = await notificationService.getNotifications(req.user.id, req.query);
        return res.json(result);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        const notificationId = req.params.id ? Number(req.params.id) : null;
        await notificationService.markAsRead(req.user.id, notificationId);
        return res.json({ message: 'Đã đánh dấu đã đọc.' });
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

module.exports = { getNotifications, markAsRead };