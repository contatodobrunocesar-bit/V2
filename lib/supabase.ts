import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_anon_key';

// Verificar se as variáveis são válidas (não são placeholders)
const isValidConfig = supabaseUrl !== 'https://placeholder.supabase.co' && 
                     supabaseAnonKey !== 'placeholder_anon_key' &&
                     supabaseUrl.startsWith('https://') &&
                     supabaseUrl.includes('.supabase.co');

if (!isValidConfig) {
  console.warn('Supabase não configurado. Usando modo offline.');
}

export const supabase = isValidConfig ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
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
}) : null;

// Tipos para facilitar o uso
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];