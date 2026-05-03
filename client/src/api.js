const BASE = import.meta.env.VITE_API_URL || '';

function authHeader() {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...authHeader(),
    ...(options.headers || {}),
  };
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg = data?.message || res.statusText || 'Request failed';
    throw new Error(msg);
  }
  return data;
}

export async function downloadPdfBlob(certificateId) {
  const res = await fetch(`${BASE}/api/certificates/${encodeURIComponent(certificateId)}/pdf`, {
    headers: { ...authHeader() },
  });
  if (!res.ok) {
    const t = await res.text();
    let msg = 'Download failed';
    try {
      msg = JSON.parse(t).message || msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.blob();
}
