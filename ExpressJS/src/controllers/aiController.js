const aiService = require('../services/aiService');

exports.chat = async (req, res) => {
    try {
        const { messages, model } = req.body;
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ ok: false, message: 'Thiếu trường `messages` (mảng).' });
        }

        const result = await aiService.chat(messages, model);
        return res.json({ ok: true, result });
    } catch (err) {
        console.error('AI chat error:', err);
        return res.status(500).json({ ok: false, message: err.message || 'Lỗi AI.' });
    }
};
