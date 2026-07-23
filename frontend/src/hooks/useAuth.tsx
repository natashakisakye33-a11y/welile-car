/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface User {
  id: string;
  email?: string;
  name?: string;
  role?: string;
  savingsAccount?: any;
  createdAt?: string | number | Date;
}

interface AuthContextType {
  user: User | null;
  session: any | null; 
  loading: boolean;
  isAdmin: boolean;
  isCfo: boolean;
  signUp: (phone: string, password: string, name: string, email: string, residence: string) => Promise<{ error: string | null }>;
  signIn: (phone: string, password: string) => Promise<{ error: string | null, user?: User }>;
  signInWithGoogle: (idToken: string) => Promise<{ error: string | null, user?: User }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { API_URL } from '@/config';
import { fetchWithTimeout } from '@/lib/api';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('authUser');
    try { return cached ? JSON.parse(cached) : null; } catch { return null; }
  });
  const [session, setSession] = useState<any | null>(() => {
    const token = localStorage.getItem('authToken');
    return token ? { access_token: token } : null;
  });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(() => {
    const cached = localStorage.getItem('authUser');
    try { return cached ? JSON.parse(cached).role === 'ADMIN' : false; } catch { return false; }
  });
  const [isCfo, setIsCfo] = useState(() => {
    const cached = localStorage.getItem('authUser');
    try { return cached ? JSON.parse(cached).role === 'CFO' : false; } catch { return false; }
  });

  const fetchUser = async (token: string) => {
    try {
      const res = await fetchWithTimeout(`${API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data) {
          const userData = data.user || data;
          const fullUser = { ...userData };
          setUser(fullUser);
          setIsAdmin(fullUser.role === 'ADMIN');
          setIsCfo(fullUser.role === 'CFO');
          localStorage.setItem('authUser', JSON.stringify(fullUser));
          return;
        }
      }
      // Only clear if we explicitly get unauthorized or forbidden
      if (res.status === 401 || res.status === 403) {
        setUser(null);
        setSession(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }
    } catch (e) {
      console.warn('Network error fetching user, using cached user if available');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      if (!session) setSession({ access_token: token });
      fetchUser(token).finally(() => setLoading(false));
    } else {
      setLoading(false);
      setUser(null);
      setSession(null);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const cached = localStorage.getItem('authUser');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setUser(parsed);
          setIsAdmin(parsed.role === 'ADMIN');
          setIsCfo(parsed.role === 'CFO');
        } catch (e) {
          console.error(e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const persistLogin = (token: string, userData: any) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUser', JSON.stringify(userData));
    setSession({ access_token: token });
    setUser(userData);
    setIsAdmin(userData.role === 'ADMIN');
    setIsCfo(userData.role === 'CFO');
  };

  const signUp = async (phone: string, password: string, name: string, email: string, residence: string) => {
    try {
      const res = await fetchWithTimeout(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, name, email, residence })
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Signup failed' };
      
      persistLogin(data.token, data.user);
      return { error: null };
    } catch (err) {
      return { error: 'Network error' };
    }
  };

  const signIn = async (phone: string, password: string) => {
    try {
      const res = await fetchWithTimeout(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Login failed' };
      
      persistLogin(data.token, data.user);
      return { error: null, user: data.user };
    } catch (err) {
      return { error: 'Network error' };
    }
  };

  const signInWithGoogle = async (idToken: string) => {
    try {
      const res = await fetchWithTimeout(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Google login failed' };
      
      persistLogin(data.token, data.user);
      return { error: null };
    } catch (err) {
      return { error: 'Network error' };
    }
  };

  const signOut = async () => {
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setIsCfo(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, isCfo, signUp, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
