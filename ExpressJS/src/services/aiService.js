const axios = require('axios');

async function chat(messages = [], model) {
    const apiType = process.env.CLAUDE_API_TYPE || 'anthropic';
    const apiKey = process.env.CLAUDE_API_KEY;
    const apiUrl = process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/responses';

    if (!apiKey) throw new Error('Missing CLAUDE_API_KEY in environment variables');

    const prompt = (messages || []).map(m => `${m.role === 'user' ? 'Human' : 'Assistant'}: ${m.content}`).join('\n') + '\nAssistant:';

    if (apiType === 'anthropic') {
        const body = {
            model: model || 'claude-2',
            input: prompt
        };
        const headers = {
            'x-api-key': apiKey,
            'Content-Type': 'application/json'
        };

        const resp = await axios.post(apiUrl, body, { headers });
        const output = resp.data || {};

        // Try to extract text from several possible response shapes
        let text = '';
        if (typeof output === 'string') text = output;
        if (!text && output.completion) text = output.completion;
        if (!text && output.output && Array.isArray(output.output) && output.output[0].content) {
            const content = output.output[0].content;
            if (Array.isArray(content)) text = content.map(c => c.text || '').join('');
            else text = content.text || JSON.stringify(content);
        }

        return { raw: output, text };
    }

    // Generic proxy behaviour (forward body)
    const resp = await axios.post(apiUrl, { messages, model }, { headers: { Authorization: `Bearer ${apiKey}` } });
    return { raw: resp.data, text: resp.data?.text || resp.data?.message || JSON.stringify(resp.data) };
}

module.exports = { chat };
