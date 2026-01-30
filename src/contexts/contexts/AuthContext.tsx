import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, SupabaseClient } from '@supabase/supabase-js';
import { initSupabase, getSupabaseConfig } from '../services/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  disconnectSupabase: () => void;
  needsConfig: boolean;
  configureSupabase: (url: string, key: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsConfig, setNeedsConfig] = useState(false);

  // Initialize client on mount
  useEffect(() => {
    const supabase = initSupabase();
    if (supabase) {
      setClient(supabase);
      
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      setNeedsConfig(true);
      setLoading(false);
    }
  }, []);

  const configureSupabase = (url: string, key: string) => {
    try {
      const newClient = initSupabase(url, key);
      if (newClient) {
        localStorage.setItem('sb_url', url);
        localStorage.setItem('sb_key', key);
        setClient(newClient);
        setNeedsConfig(false);
        
        // Refresh session check with new client
        newClient.auth.getSession().then(({ data: { session } }) => {
          setSession(session);
          setUser(session?.user ?? null);
        });
        
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const disconnectSupabase = () => {
    localStorage.removeItem('sb_url');
    localStorage.removeItem('sb_key');
    setClient(null);
    setUser(null);
    setSession(null);
    setNeedsConfig(true);
    window.location.reload(); // Reload to clear any cached client states safely
  };

  const signInWithGoogle = async () => {
    if (!client) {
      setNeedsConfig(true);
      return;
    }
    try {
      console.log("Initiating Google Login...");
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Error logging in with Google:", error);
      if (error.message && error.message.includes("provider is not enabled")) {
        alert("Error: Google Provider is not enabled in your Supabase Dashboard. Please enable it in Authentication -> Providers.");
      } else {
        alert(`Failed to sign in: ${error.message || "Unknown error"}`);
      }
    }
  };

  const signOut = async () => {
    if (!client) return;
    try {
      const { error } = await client.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signOut, disconnectSupabase, needsConfig, configureSupabase }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
