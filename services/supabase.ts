import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default URL provided by user
const DEFAULT_URL = 'https://mdmudxzblrseclcweisv.supabase.co';
// Provided by user
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kbXVkeHpibHJzZWNsY3dlaXN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNDQ2NDYsImV4cCI6MjA4MzcyMDY0Nn0.0MvPzMk0jUTGy_OF5LpTzxaQYBPypR4lvAVHP3ayD5Q';

export const getSupabaseConfig = () => {
  // Allow env override, but fallback to hardcoded defaults
  const envUrl = process.env.SUPABASE_URL;
  const envKey = process.env.SUPABASE_ANON_KEY;
  
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('sb_url') : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('sb_key') : null;

  return {
    url: localUrl || envUrl || DEFAULT_URL,
    key: localKey || envKey || DEFAULT_KEY
  };
};

export const initSupabase = (url?: string, key?: string): SupabaseClient | null => {
  const config = getSupabaseConfig();
  
  let finalUrl = url || config.url;
  let finalKey = key || config.key;

  finalUrl = finalUrl?.trim();
  finalKey = finalKey?.trim();

  // Strict validation: Ensure URL looks valid and Key exists
  if (!finalUrl || !finalUrl.startsWith('http') || !finalKey) {
    return null;
  }

  try {
    return createClient(finalUrl, finalKey);
  } catch (error) {
    console.error("Supabase init critical error:", error);
    return null;
  }
};

// Initial static instance (might be null if no keys)
export const supabase = initSupabase();
