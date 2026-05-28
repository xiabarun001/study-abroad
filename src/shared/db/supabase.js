import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 携带登录态的 Supabase 客户端，用于执行与当前登录用户强关联的操作（如我的申请、我的收藏）
export const supabase = createClient(supabaseUrl, supabaseKey);

// 不含持久化登录态的匿名 Supabase 客户端，专门用于以 anon 匿名角色写入公共项目表 (programs)，绕过针对 authenticated 角色的 RLS 限制
export const supabaseAnon = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

