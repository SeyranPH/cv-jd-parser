export const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

export async function parseCv(file: File) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${API_BASE}/cv-parser/parse`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function parseJd(text: string) {
  const res = await fetch(`${API_BASE}/jd-parser/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
