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

module.exports = { chat };

