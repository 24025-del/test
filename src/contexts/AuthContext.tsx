import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
}

interface Profile {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email: string;
  city_id: string | null;
  role: 'donor' | 'requester' | 'admin';
  blood_type: string | null;
  nni: string | null;
  is_available: boolean;
  cooldown_end_date: string | null;
  is_banned: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, metadata: Record<string, any>) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const data = await api.profiles.get(userId);
      return data as Profile;
    } catch (err) {
      console.error('Error in fetchProfile:', err);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      if (profileData) {
        setProfile(profileData);
        localStorage.setItem('profile', JSON.stringify(profileData));
      }
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        // First try to check the actual session with the backend
        const data = await api.auth.checkSession();
        if (data.status === 'success' && data.user && data.profile) {
          setUser(data.user);
          setProfile(data.profile);
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('profile', JSON.stringify(data.profile));
        } else {
          // No valid session on server, clear local state
          setUser(null);
          setProfile(null);
          localStorage.removeItem('user');
          localStorage.removeItem('profile');
        }
      } catch (err) {
        // If 401 or network error, check if we have stored data as a fallback
        // but prefer server truth. For now, if server says no, we clear.
        console.error('Session check failed:', err);
        setUser(null);
        setProfile(null);
        localStorage.removeItem('user');
        localStorage.removeItem('profile');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const data = await api.auth.signin(email, password);
      setUser(data.user);
      setProfile(data.profile);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('profile', JSON.stringify(data.profile));
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, metadata: Record<string, any>) => {
    try {
      const data = await api.auth.signup(email, password, metadata);
      if (data.status === 'success' && data.user && data.profile) {
        setUser(data.user);
        setProfile(data.profile);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('profile', JSON.stringify(data.profile));
      }
      return { error: null };
    } catch (error: any) {
      console.error('SignUp Error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      refreshProfile
    }}>
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
