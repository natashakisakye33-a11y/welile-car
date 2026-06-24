/* eslint-disable @typescript-eslint/no-explicit-any, react-refresh/only-export-components, react-hooks/exhaustive-deps */
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

import { useAuth as useClerkAuth, useUser as useClerkUser } from '@clerk/clerk-react';
import { API_URL } from '@/config';
import { fetchWithTimeout } from '@/lib/api';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCfo, setIsCfo] = useState(false);

  const { isLoaded: clerkAuthLoaded, userId, getToken, signOut: clerkSignOut } = useClerkAuth();
  const { isLoaded: clerkUserLoaded, user: clerkUser } = useClerkUser();

  const fetchUser = async () => {
    try {
      const token = await getToken();
      if (!token) {
        setUser(null);
        return;
      }
      
      const res = await fetchWithTimeout(`${API_URL}/users/me`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setUser(data);
          setIsAdmin(data.role === 'ADMIN');
          setIsCfo(data.role === 'CFO');
        } else if (clerkUser) {
          // Fallback if webhook hasn't created the user in DB yet
          setUser({
            id: clerkUser.id,
            name: clerkUser.fullName || '',
            email: clerkUser.primaryEmailAddress?.emailAddress || '',
            role: 'CUSTOMER'
          });
          setIsAdmin(false);
          setIsCfo(false);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    }
  };

  useEffect(() => {
    if (clerkAuthLoaded && clerkUserLoaded) {
      if (userId) {
        setSession({ access_token: 'clerk-token' }); // Placeholder just so things relying on session exist
        fetchUser().finally(() => setLoading(false));
      } else {
        // Fallback to local token if no clerk
        const token = localStorage.getItem('authToken');
        if (token) {
          setSession({ access_token: token });
          fetchUser().finally(() => setLoading(false));
        } else {
          setLoading(false);
          setUser(null);
          setSession(null);
        }
      }
    }
  }, [clerkAuthLoaded, clerkUserLoaded, userId]);

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
    if (clerkSignOut) {
      try {
        await clerkSignOut();
      } catch (e) {
        console.error('Clerk sign out error', e);
      }
    }
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
