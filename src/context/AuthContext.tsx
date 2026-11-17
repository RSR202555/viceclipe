'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, Subscription, Plan, UserSession } from '@/types/saas';

interface AuthContextType {
  user: UserProfile | null;
  subscription: Subscription | null;
  plan: Plan | null;
  hasAccess: boolean;
  isLoading: boolean;
  refreshSession: () => Promise<UserSession | null>;
  login: (email: string, name?: string) => Promise<{ success: boolean; session?: UserSession; error?: string }>;
  signup: (name: string, email: string) => Promise<{ success: boolean; session?: UserSession; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshSession = useCallback(async (): Promise<UserSession | null> => {
    try {
      const res = await fetch('/api/auth');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.session) {
          setUser(data.session.user);
          setSubscription(data.session.subscription);
          setPlan(data.session.plan);
          setHasAccess(Boolean(data.session.hasAccess));
          return data.session;
        } else {
          setUser(null);
          setSubscription(null);
          setPlan(null);
          setHasAccess(false);
          return null;
        }
      }
      return null;
    } catch (err) {
      console.error('Error fetching session:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = async (email: string, name?: string) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, name }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.session) {
        setUser(data.session.user);
        setSubscription(data.session.subscription);
        setPlan(data.session.plan);
        setHasAccess(Boolean(data.session.hasAccess));
        return { success: true, session: data.session };
      }
      return { success: false, error: data.error || 'Falha ao autenticar.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro de conexão.' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signup', name, email }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.session) {
        setUser(data.session.user);
        setSubscription(data.session.subscription);
        setPlan(data.session.plan);
        setHasAccess(Boolean(data.session.hasAccess));
        return { success: true, session: data.session };
      }
      return { success: false, error: data.error || 'Falha ao cadastrar.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro de conexão.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
      setUser(null);
      setSubscription(null);
      setPlan(null);
      setHasAccess(false);
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        subscription,
        plan,
        hasAccess,
        isLoading,
        refreshSession,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
