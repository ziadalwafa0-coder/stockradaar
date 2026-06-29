import { createClient } from "@supabase/supabase-js";
import { config, hasSupabaseConfig } from "./config.js";

export const supabaseAdmin = hasSupabaseConfig
  ? createClient(config.supabaseUrl, config.supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;
