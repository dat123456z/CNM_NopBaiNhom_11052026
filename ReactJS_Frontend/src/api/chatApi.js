export async function sendChat(messages) {
  const base = import.meta.env.VITE_API_BASE || "http://localhost:3000";
  const res = await fetch(`${base}/api/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });
  return res.json();
}
