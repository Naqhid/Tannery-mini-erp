import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import api from './api';

interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role_id: number;
  role_code: string | null;
  access_level: 'read_write' | 'read_only';
  company_id: number;
  business_unit_id: number;
  menu_access?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'tannery_token';
const REFRESH_TOKEN_KEY = 'tannery_refresh_token';
const USER_KEY = 'tannery_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  // Use a ref so the timer handle is stable across re-renders. A plain `let`
  // is recreated on every render, which meant activity handlers were clearing
  // a stale (undefined) timer and the original 30-min timer could still fire
  // while the user was actively working — causing random logouts.
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetInactivityTimer = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      // Auto-logout on inactivity
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (storedToken) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
        window.location.href = '/login';
      }
    }, INACTIVITY_TIMEOUT);
  };

  // Track user activity
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => resetInactivityTimer();
    events.forEach(e => window.addEventListener(e, handleActivity));
    resetInactivityTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, handleActivity));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Check for existing token on mount
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Refresh user data to get latest menu_access
        api<{ data: User }>('/auth/me').then((res) => {
          if (res.data) {
            setUser(res.data);
            localStorage.setItem(USER_KEY, JSON.stringify(res.data));
          }
        }).catch(() => {});
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const res = await api<{ token: string; refreshToken: string; user: User } & { error?: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      if (res.error) {
        return { success: false, error: res.error };
      }

      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Return a default unauthenticated state for non-wrapped components
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      login: async () => ({ success: false, error: 'Auth not initialized' }),
      logout: () => {},
    };
  }
  return context;
}
