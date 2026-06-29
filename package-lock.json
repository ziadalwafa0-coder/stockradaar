import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 3000),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || "",
  defaultUserId: process.env.DEFAULT_USER_ID || "demo-user"
};

export const hasSupabaseConfig = Boolean(config.supabaseUrl && config.supabaseServiceKey);
