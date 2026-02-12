import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSession, signOut as supabaseSignOut } from '@/lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      console.log('👤 [AuthContext] Checking current session...');
      const session = await getSession();
      if (session?.user) {
        console.log('✅ [AuthContext] Session found for user:', session.user.email);
        setUser(session.user);
      } else {
        console.log('ℹ️ [AuthContext] No active session found.');
        setUser(null);
      }
    } catch (error) {
      console.error('❌ [AuthContext] Error checking user session:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = (session) => {
    if (session?.user) {
      console.log('👤 [AuthContext] User signed in manually:', session.user.email);
      setUser(session.user);
    }
  };

  const signOut = async () => {
    console.log('👤 [AuthContext] User signing out...');
    await supabaseSignOut();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    signIn,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};