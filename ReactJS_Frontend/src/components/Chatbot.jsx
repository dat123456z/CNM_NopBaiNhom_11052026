import React, { useState, useRef, useEffect } from 'react';
import { sendChat } from '../api/chatApi';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('chatbot_messages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState('');

  useEffect(() => {
    sessionStorage.setItem('chatbot_messages', JSON.stringify(messages));
  }, [messages]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef();

  useEffect(() => {
    function onDoc(e) {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target) && open) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    try {
      const res = await sendChat(newMsgs);
      const text = res?.result?.text || (res?.result?.raw && JSON.stringify(res.result.raw)) || 'Không có phản hồi';
      const botMsg = { role: 'assistant', content: text };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errMsg = { role: 'assistant', content: 'Lỗi khi gọi AI.' };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Chatbot"
        style={{
          position: 'fixed',
          right: 24,
          bottom: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#00b14f',
          color: 'white',
          border: 'none',
          boxShadow: '0 6px 18px rgba(0,0,0,0.2)',
          zIndex: 60,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20
        }}
      >
        💬
      </button>

      {open && (
        <div
          ref={panelRef}
          style={{
            position: 'fixed',
            right: 24,
            bottom: 96,
            width: 360,
            maxWidth: '90vw',
            height: 420,
            background: 'white',
            borderRadius: 12,
            boxShadow: '0 12px 40px rgba(2,6,23,0.2)',
            zIndex: 70,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <div style={{ padding: 12, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <strong>Trợ lý AI</strong>
            <button onClick={() => setOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>
          </div>

          <div style={{ padding: 12, flex: 1, overflowY: 'auto' }}>
            {messages.length === 0 && <div style={{ color: '#666' }}>Xin chào! Hỏi mình bất cứ điều gì.</div>}
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: '#888' }}>{m.role === 'user' ? 'Bạn' : 'Bot'}</div>
                <div style={{ background: m.role === 'user' ? '#f1f9f6' : '#f4f6ff', padding: 8, borderRadius: 6 }}>{m.content}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} style={{ padding: 10, borderTop: '1px solid #eee', display: 'flex', gap: 8 }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Nhập câu hỏi..." style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #e6e6e6' }} />
            <button type="submit" disabled={loading} style={{ padding: '8px 12px', borderRadius: 6, background: '#00b14f', color: 'white', border: 'none' }}>{loading ? '...' : 'Gửi'}</button>
          </form>
        </div>
      )}
    </>
  );
}
