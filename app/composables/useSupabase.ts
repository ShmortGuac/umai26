import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'

export interface Profile {
  id: string
  display_name: string | null
  ign: string | null
  university: string | null
  discord: string | null
  is_admin: boolean
}

export interface Submission {
  id: string
  user_id: string
  video_url: string
  song1: number | null
  song2: number | null
  song3: number | null
  notes: string | null
  status: 'pending' | 'approved' | 'rejected'
  verified_total: number | null
  admin_note: string | null
  submitted_at: string
  updated_at: string
}

let client: SupabaseClient | null = null

/** Returns null when the Supabase env vars are missing, so the rest of the site still works. */
export function useSupabase() {
  const { supabaseUrl, supabaseKey } = useRuntimeConfig().public
  if (!supabaseUrl || !supabaseKey) return null
  client ??= createClient(supabaseUrl, supabaseKey, {
    auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true },
  })
  return client
}

export function useAuthUser() {
  return {
    user: useState<User | null>('auth-user', () => null),
    ready: useState<boolean>('auth-ready', () => false),
  }
}

export function usePrelimWindow() {
  const { prelims } = useAppConfig()
  const now = Date.now()
  const opens = new Date(prelims.opens)
  const closes = new Date(prelims.closes)
  return {
    opens,
    closes,
    state: now < opens.getTime() ? 'before' : now > closes.getTime() ? 'closed' : 'open',
  } as const
}

export function formatDate(d: Date | string) {
  return new Date(d).toLocaleString('en-MY', {
    timeZone: 'Asia/Kuala_Lumpur',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
