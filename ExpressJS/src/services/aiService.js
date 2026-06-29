const axios = require('axios');

async function chat(messages = [], model) {
    const apiType = process.env.API_TYPE || process.env.CLAUDE_API_TYPE || 'gemini';

    if (apiType === 'gemini') {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('Missing GEMINI_API_KEY in environment variables');

        let systemInstruction = '';
        const geminiMessages = [];
        let lastRole = null;

        for (const m of (messages || [])) {
            if (m.role === 'system') {
                systemInstruction += (systemInstruction ? '\n' : '') + m.content;
                continue;
            }
            
            // Gemini uses 'user' and 'model'
            const role = m.role === 'user' ? 'user' : 'model';
            
            // Merge consecutive same roles
            if (role === lastRole) {
                const lastMsg = geminiMessages[geminiMessages.length - 1];
                lastMsg.parts[0].text += '\n\n' + m.content;
            } else {
                geminiMessages.push({ role, parts: [{ text: m.content }] });
                lastRole = role;
            }
        }

        // Must start with user
        if (geminiMessages.length > 0 && geminiMessages[0].role === 'model') {
            geminiMessages.unshift({ role: 'user', parts: [{ text: 'Hello' }] });
        }
        if (geminiMessages.length === 0) {
            geminiMessages.push({ role: 'user', parts: [{ text: 'Hello' }] });
        }

        const body = {
            contents: geminiMessages,
        };

        if (systemInstruction) {
            body.systemInstruction = { parts: [{ text: systemInstruction }] };
        }

        // If the frontend sends a Claude model name, ignore it and use gemini
        let targetModel = 'gemini-2.5-flash';
        if (model && model.includes('gemini')) {
            targetModel = model;
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;

        try {
            const resp = await axios.post(url, body, { headers: { 'Content-Type': 'application/json' } });
            const output = resp.data;

            let text = '';
            if (output.candidates && output.candidates.length > 0) {
                const parts = output.candidates[0].content?.parts || [];
                text = parts.map(p => p.text).join('');
            }
            return { raw: output, text };
        } catch (e) {
            console.error('Gemini API Error:', JSON.stringify(e.response?.data || e.message, null, 2));
            throw e;
        }
    }

    throw new Error('Unsupported API Type. Please set API_TYPE=gemini and provide GEMINI_API_KEY');
}

async function analyzeProductImage(imageBuffer, mimeType, model) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('Missing GEMINI_API_KEY in environment variables');
    if (!imageBuffer?.length) throw new Error('Không có dữ liệu ảnh để phân tích.');

    const targetModel = model?.includes('gemini')
        ? model
        : process.env.GEMINI_VISION_MODEL || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;
    const prompt = `Phân tích sản phẩm chính trong ảnh để tìm kiếm trong một sàn thương mại điện tử.
Chỉ trả về JSON hợp lệ, không Markdown, theo cấu trúc:
{
  "object": "tên loại sản phẩm ngắn gọn bằng tiếng Việt",
  "category": "danh mục có khả năng phù hợp",
  "colors": ["màu nổi bật"],
  "keywords": ["tối đa 8 tên gọi đồng nghĩa hoặc cụm từ mô tả đúng loại sản phẩm"],
  "description": "mô tả ngắn các đặc điểm nhìn thấy"
}
Không đoán thương hiệu hoặc thông số không nhìn thấy rõ.
Trong keywords, ưu tiên tên loại sản phẩm và từ đồng nghĩa; không đưa từ quá chung như
"thời trang nam", "thời trang nữ", "sản phẩm", màu sắc hoặc phong cách đứng riêng lẻ.`;

    const body = {
        contents: [{
            role: 'user',
            parts: [
                { text: prompt },
                {
                    inline_data: {
                        mime_type: mimeType,
                        data: imageBuffer.toString('base64')
                    }
                }
            ]
        }],
        generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json'
        }
    };

    try {
        const resp = await axios.post(url, body, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
        });
        const parts = resp.data?.candidates?.[0]?.content?.parts || [];
        const text = parts.map((part) => part.text || '').join('').trim();
        if (!text) throw new Error('Gemini không nhận diện được sản phẩm trong ảnh.');

        const cleaned = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
        return JSON.parse(cleaned);
    } catch (err) {
        const apiMessage = err.response?.data?.error?.message || err.message;
        throw new Error(`Không thể phân tích ảnh: ${apiMessage}`);
    }
}

module.exports = { chat, analyzeProductImage };
