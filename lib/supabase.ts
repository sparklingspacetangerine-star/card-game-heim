import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
let client = null
try {
  if (url && anonKey && /^https?:\/\//.test(url)) client = createClient(url, anonKey)
} catch { client = null }
export const supabase = client
export const supabaseConfigured = Boolean(supabase)
