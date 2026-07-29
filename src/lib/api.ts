const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const TOKEN_KEY = 'tannery_token';
const REFRESH_TOKEN_KEY = 'tannery_refresh_token';

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    if (data.token && data.refreshToken) {
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

async function handleTokenRefresh(): Promise<boolean> {
  if (isRefreshing) {
    return refreshPromise!;
  }
  isRefreshing = true;
  refreshPromise = tryRefreshToken().finally(() => {
    isRefreshing = false;
    refreshPromise = null;
  });
  return refreshPromise;
}

function redirectToLogin() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem('tannery_user');
  // Only redirect if not already on login page
  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login';
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);

  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  });

  if (res.status === 401) {
    // Don't try refresh for login/refresh endpoints
    if (path.includes('/auth/login') || path.includes('/auth/refresh')) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Authentication failed');
    }

    // Try to refresh the token
    const refreshed = await handleTokenRefresh();
    if (refreshed) {
      // Retry the original request with new token
      const newToken = localStorage.getItem(TOKEN_KEY);
      const retryRes = await fetch(`${API_BASE}${path}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
          ...options?.headers,
        },
        ...options,
      });

      if (retryRes.ok) {
        return retryRes.json();
      }

      // Retry also failed — redirect to login
      if (retryRes.status === 401) {
        redirectToLogin();
        throw new Error('Session expired. Please login again.');
      }

      const body = await retryRes.json().catch(() => ({}));
      throw new Error(body.error || `Request failed: ${retryRes.status}`);
    }

    // Refresh failed — redirect to login
    redirectToLogin();
    throw new Error('Session expired. Please login again.');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export default request;
