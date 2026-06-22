import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface User {
  id: string;
  email?: string;
  name?: string;
  role?: string;
  savingsAccount?: any;
}

interface AuthContextType {
  user: User | null;
  session: any | null; 
  loading: boolean;
  isAdmin: boolean;
  isCfo: boolean;
  signUp: (phone: string, password: string, name: string, email: string, residence: string) => Promise<{ error: string | null }>;
  signIn: (phone: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { API_URL } from '@/config';
import { fetchWithTimeout } from '@/lib/api';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCfo, setIsCfo] = useState(false);

  const fetchUser = async (token: string) => {
    try {
      const res = await fetchWithTimeout(`${API_URL}/users/me`);
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setIsAdmin(data.role === 'ADMIN');
        setIsCfo(data.role === 'CFO');
      } else {
        signOut();
      }
    } catch (e) {
      signOut();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setSession({ access_token: token });
      fetchUser(token).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signUp = async (phone: string, password: string, name: string, email: string, residence: string) => {
    try {
      const res = await fetchWithTimeout(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, name, email, residence })
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Signup failed' };
      
      localStorage.setItem('authToken', data.token);
      setSession({ access_token: data.token });
      setUser(data.user);
      setIsAdmin(data.user.role === 'ADMIN');
      setIsCfo(data.user.role === 'CFO');
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
      
      localStorage.setItem('authToken', data.token);
      setSession({ access_token: data.token });
      setUser(data.user);
      setIsAdmin(data.user.role === 'ADMIN');
      setIsCfo(data.user.role === 'CFO');
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
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, isCfo, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
