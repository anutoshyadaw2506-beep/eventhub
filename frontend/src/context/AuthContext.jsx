import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile();
      } else {
        setLoading(false);
      }
    });

    // 2. Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async () => {
    try {
      const p = await api.getMe();
      setProfile(p);
    } catch (err) {
      console.error('Error fetching profile from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const loginWithGithub = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    return data;
  };

  const signup = async (email, password, fullName, role = 'participant') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login?confirmed=true`,
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });
    if (error) throw error;
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      throw new Error('This email address is already registered. Please sign in with your password, or use a different email.');
    }
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, login, loginWithGithub, signup, logout, refreshProfile: fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
