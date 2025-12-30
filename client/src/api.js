// const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

// export function getSessionId() {
//   return localStorage.getItem("kb_session_id");
// }

// export function setSessionId(id) {
//   localStorage.setItem("kb_session_id", id);
// }

// export async function sendChat(message) {
//   const resp = await fetch(`${API_BASE}/api/chat`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       sessionId: getSessionId(),
//       message
//     })
//   });
//   const data = await resp.json();
//   if (!resp.ok) throw new Error(data?.error || "Chat error");
//   if (data.sessionId) setSessionId(data.sessionId);
//   return data;
// }

// export async function fetchAnalytics(path, adminKey) {
//   const resp = await fetch(`${API_BASE}${path}`, {
//     headers: { "x-admin-key": adminKey }
//   });
//   const data = await resp.json();
//   if (!resp.ok) throw new Error(data?.error || "Analytics error");
//   return data;
// }
const API_BASE = (import.meta.env.VITE_API_BASE || "http://localhost:8080")
  .replace(/\/$/, ""); // remove trailing slash if any

export function getSessionId() {
  return localStorage.getItem("kb_session_id");
}

export function setSessionId(id) {
  localStorage.setItem("kb_session_id", id);
}

export async function sendChat(message) {
  const resp = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: getSessionId(),
      message,
    }),
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data?.error || "Chat error");
  if (data.sessionId) setSessionId(data.sessionId);
  return data;
}

export async function fetchAnalytics(path, adminKey) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const resp = await fetch(`${API_BASE}${cleanPath}`, {
    headers: { "x-admin-key": adminKey },
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data?.error || "Analytics error");
  return data;
}
