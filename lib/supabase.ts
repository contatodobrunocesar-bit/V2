import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is properly configured with real values
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' && 
  supabaseAnonKey !== 'your-anon-key' &&
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('.supabase.co')
);

// Only create client if properly configured
export const supabase = isSupabaseConfigured ? (() => {
  try {
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
  } catch (error) {
    console.warn('Erro ao criar cliente Supabase:', error);
    return null;
    }
  })() : null;

// Mock client for offline mode
export const createMockSupabaseClient = () => ({
  auth: {
    signUp: async () => ({ data: null, error: { message: 'Supabase não configurado - usando modo offline' } }),
    signInWithPassword: async () => ({ data: null, error: { message: 'Supabase não configurado - usando modo offline' } }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  },
  from: () => ({
    select: () => ({ eq: () => ({ single: async () => ({ data: null, error: { message: 'Offline mode' } }) }) }),
    insert: () => ({ select: () => ({ single: async () => ({ data: null, error: { message: 'Offline mode' } }) }) }),
    update: () => ({ eq: () => ({ select: () => ({ single: async () => ({ data: null, error: { message: 'Offline mode' } }) }) }) }),
    delete: () => ({ eq: () => ({ error: { message: 'Offline mode' } }) }),
    order: () => ({ data: [], error: null })
  }),
  channel: () => ({
    on: () => ({ subscribe: () => {} })
  })
});

// Use real client if configured, otherwise use mock
export const getSupabaseClient = () => {
  if (isSupabaseConfigured && supabase) {
    return supabase;
  }
  return createMockSupabaseClient();
};

// Tipos para facilitar o uso
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];