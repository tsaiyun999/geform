import { createClient } from '@supabase/supabase-js'

// 呼叫我們剛剛藏在 .env.local 裡的鑰匙
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

// 建立並匯出 Supabase 連線客戶端
export const supabase = createClient(supabaseUrl, supabaseAnonKey)