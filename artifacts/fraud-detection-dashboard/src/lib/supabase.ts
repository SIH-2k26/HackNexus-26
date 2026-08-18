import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jgtcwohlbfzqezztyvjp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_dXTxmEX3TjASlFnnLRwQlg_d4w2GTcg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
