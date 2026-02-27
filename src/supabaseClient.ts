import { createClient } from '@supabase/supabase-js';
import { Database } from './supabase_types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseFinanUrl = import.meta.env.VITE_SUPABASE_FINAN_URL;
const supabaseFinanAnonKey = import.meta.env.VITE_SUPABASE_FINAN_ANON_KEY;

console.log('Supabase Config:', {
    url: supabaseUrl ? 'Found' : 'Missing',
    key: supabaseAnonKey ? 'Found' : 'Missing',
    finanUrl: supabaseFinanUrl ? 'Found' : 'Missing',
    finanKey: supabaseFinanAnonKey ? 'Found' : 'Missing'
});

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables. Please check .env.local');
}

if (!supabaseFinanUrl || !supabaseFinanAnonKey) {
    console.error('Missing Supabase Finan environment variables. Please check .env.local');
}

export const supabase = createClient<Database>(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
);

export const supabaseFinan = createClient<Database>(
    supabaseFinanUrl || 'https://placeholder.supabase.co',
    supabaseFinanAnonKey || 'placeholder'
);
