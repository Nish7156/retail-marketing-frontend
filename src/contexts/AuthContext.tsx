import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { api } from '../lib/api';
import type { User } from '../types/auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  sendOtp: (phone: string) => Promise<{ otp?: string }>;
  verifyOtp: (phone: string, code: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const me = await api.get<User>('/auth/me');
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const sendOtp = useCallback(async (phone: string) => {
    const res = await api.post<{ ok: boolean; otp?: string }>('/auth/send-otp', { phone });
    return { otp: res.otp };
  }, []);

  const verifyOtp = useCallback(async (phone: string, code: string) => {
    const res = await api.post<{ user: User }>('/auth/verify-otp', { phone, code });
    setUser(res.user);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post<{ user: User }>('/auth/login', { email, password });
      setUser(res.user);
    },
    []
  );

  const register = useCallback(
    async (email: string, password: string, role?: string) => {
      await api.post<{ id: string; email: string; role: string }>('/auth/register', {
        email,
        password,
        role: role ?? 'USER',
      });
      await login(email, password);
    },
    [login]
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout', {});
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, sendOtp, verifyOtp, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
