import { createClient } from '@supabase/supabase-js'
import type { Sound, SiteSettings, CustomAd, SoundRequest, BlogPost } from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseKey)

// ─── Sounds ───────────────────────────────────────────

export async function getSounds(opts: {
  category?: string
  status?: string
  limit?: number
  offset?: number
  orderBy?: 'plays' | 'likes' | 'created_at'
} = {}): Promise<Sound[]> {
  const { category, status = 'approved', limit = 48, offset = 0, orderBy = 'plays' } = opts
  let q = supabase.from('sounds').select('*').eq('status', status)
  if (category && category !== 'all') q = q.eq('category', category)
  q = q.order(orderBy, { ascending: false }).range(offset, offset + limit - 1)
  const { data, error } = await q
  if (error) { console.error('getSounds:', error); return [] }
  return (data ?? []) as Sound[]
}

export async function getTrending(limit = 12): Promise<Sound[]> {
  const { data, error } = await supabase
    .from('sounds')
    .select('*')
    .eq('status', 'approved')
    .order('plays', { ascending: false })
    .limit(limit)
  if (error) { console.error('getTrending:', error); return [] }
  return (data ?? []) as Sound[]
}

export async function getNewSounds(limit = 12): Promise<Sound[]> {
  const { data, error } = await supabase
    .from('sounds')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) { console.error('getNewSounds:', error); return [] }
  return (data ?? []) as Sound[]
}

export async function getFeaturedSounds(limit = 6): Promise<Sound[]> {
  const { data, error } = await supabase
    .from('sounds')
    .select('*')
    .eq('status', 'approved')
    .eq('is_featured', true)
    .order('plays', { ascending: false })
    .limit(limit)
  if (error) return []
  return (data ?? []) as Sound[]
}

export async function getSoundBySlug(slug: string): Promise<Sound | null> {
  const { data, error } = await supabase
    .from('sounds').select('*').eq('slug', slug).single()
  if (error) return null
  return data as Sound
}

export async function searchSounds(query: string, limit = 48): Promise<Sound[]> {
  const { data, error } = await supabase
    .from('sounds')
    .select('*')
    .eq('status', 'approved')
    .or(`title.ilike.%${query}%,tags.cs.{${query}}`)
    .order('plays', { ascending: false })
    .limit(limit)
  if (error) return []
  return (data ?? []) as Sound[]
}

export async function getRelatedSounds(sound: Sound, limit = 8): Promise<Sound[]> {
  const { data, error } = await supabase
    .from('sounds')
    .select('*')
    .eq('status', 'approved')
    .eq('category', sound.category)
    .neq('id', sound.id)
    .order('plays', { ascending: false })
    .limit(limit)
  if (error) return []
  return (data ?? []) as Sound[]
}

// ─── Play + Like (fire & forget) ──────────────────────

export function incrementPlay(soundId: string): void {
  supabase.rpc('increment_play', { sid: soundId }).then()
}

export function incrementDownload(soundId: string): void {
  supabase.rpc('increment_download', { sid: soundId }).then()
}

// ─── Settings ─────────────────────────────────────────

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const { data, error } = await supabase
    .from('site_settings').select('*').single()
  if (error) return null
  return data as SiteSettings
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<boolean> {
  const { error } = await supabase
    .from('site_settings').update(settings).eq('id', 1)
  return !error
}

// ─── Custom Ads ───────────────────────────────────────

export async function getActiveAds(position?: string): Promise<CustomAd[]> {
  let q = supabase.from('custom_ads').select('*').eq('is_active', true)
  if (position) q = q.eq('position', position)
  const { data, error } = await q
  if (error) return []
  return (data ?? []) as CustomAd[]
}

// ─── Admin ────────────────────────────────────────────

export async function getPendingSounds(): Promise<Sound[]> {
  const { data, error } = await supabase
    .from('sounds').select('*').eq('status', 'pending')
    .order('created_at', { ascending: false })
  if (error) return []
  return (data ?? []) as Sound[]
}

export async function approveSound(id: string, r2Url: string, r2Key: string): Promise<boolean> {
  const { error } = await supabase
    .from('sounds')
    .update({ status: 'approved', r2_url: r2Url, r2_key: r2Key, approved_at: new Date().toISOString() })
    .eq('id', id)
  return !error
}

export async function rejectSound(id: string, reason: string): Promise<boolean> {
  const { error } = await supabase
    .from('sounds')
    .update({ status: 'rejected', reject_reason: reason })
    .eq('id', id)
  return !error
}

export async function deleteSound(id: string): Promise<boolean> {
  const { error } = await supabase.from('sounds').delete().eq('id', id)
  return !error
}

export async function updateSound(id: string, updates: Partial<Sound>): Promise<boolean> {
  const { error } = await supabase.from('sounds').update(updates).eq('id', id)
  return !error
}

// ─── Sound Requests ───────────────────────────────────

export async function getSoundRequests(): Promise<SoundRequest[]> {
  const { data, error } = await supabase
    .from('sound_requests').select('*')
    .order('upvotes', { ascending: false })
  if (error) return []
  return (data ?? []) as SoundRequest[]
}

// ─── Blog ─────────────────────────────────────────────

export async function getBlogPosts(limit = 10): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts').select('*').eq('is_published', true)
    .order('published_at', { ascending: false }).limit(limit)
  if (error) return []
  return (data ?? []) as BlogPost[]
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts').select('*').eq('slug', slug).eq('is_published', true).single()
  if (error) return null
  return data as BlogPost
}
