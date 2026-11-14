import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || "").trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();

const isConfigured = Boolean(
    supabaseUrl
    && supabaseAnonKey
    && !supabaseUrl.includes("seu-projeto.supabase.co")
    && !supabaseAnonKey.includes("sua_supabase_anon_key")
);

export const supabase = isConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export function isSupabaseConfigured() {
    return Boolean(supabase);
}
