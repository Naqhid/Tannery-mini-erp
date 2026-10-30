const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
export async function apiGet<T>(path: string): Promise<T> {
 const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
 const response = await fetch(`${API_BASE}${path}`, { headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
 if (!response.ok) { const message = await response.text().catch(() => ''); throw new Error(message || `Request failed (${response.status})`); }
 return response.json() as Promise<T>;
}
