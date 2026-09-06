const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const TOKEN_KEY = 'tannery_token';
const REFRESH_TOKEN_KEY = 'tannery_refresh_token';

let isRefreshing = false;
let refreshPromise: Promise<RefreshResult> | null = null;

// A refresh attempt can end in three distinct ways. Treating a transient
// failure the same as an invalid token is what caused users to be logged out
// mid-save whenever the /auth/refresh call hit a momentary network/server
// blip. We now separate them so only a genuinely rejected refresh token ends
// the session.
type RefreshResult = 'success' | 'invalid' | 'transient';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function tryRefreshToken(): Promise<RefreshResult> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return 'invalid';

  // Retry a few times on transient errors (network drop, 5xx, timeout) before
  // giving up, so a brief hiccup during a save doesn't kill the session.
  const MAX_ATTEMPTS = 3;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data && data.token && data.refreshToken) {
          localStorage.setItem(TOKEN_KEY, data.token);
          localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
          return 'success';
        }
        // 2xx but malformed body — treat as transient and retry.
      } else if (res.status === 400 || res.status === 401 || res.status === 403) {
        // The refresh token is genuinely invalid/expired — session is over.
        return 'invalid';
      }
      // Any other status (e.g. 5xx) falls through to the transient retry path.
    } catch {
      // Network error — fall through to the transient retry path.
    }

    if (attempt < MAX_ATTEMPTS) await sleep(300 * attempt);
  }

  return 'transient';
}

async function handleTokenRefresh(): Promise<RefreshResult> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
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
    const refreshResult = await handleTokenRefresh();

    if (refreshResult === 'success') {
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

      // Retry also failed with 401 — the fresh token is being rejected, so the
      // session really is over.
      if (retryRes.status === 401) {
        redirectToLogin();
        throw new Error('Session expired. Please login again.');
      }

      const body = await retryRes.json().catch(() => ({}));
      throw new Error(body.error || `Request failed: ${retryRes.status}`);
    }

    if (refreshResult === 'transient') {
      // Couldn't reach the auth server to refresh. Do NOT log out — keep the
      // session so the user can retry (e.g. re-submit the material issue).
      throw new Error('Network issue while verifying your session. Please try again.');
    }

    // refreshResult === 'invalid' — refresh token is genuinely expired/invalid.
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
