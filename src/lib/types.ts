// ─── Core Types ───────────────────────────────────────

export type Category =
  | 'meme' | 'discord' | 'reaction' | 'gaming' | 'brainrot'
  | 'culture' | 'music' | 'viral' | 'whatsapp' | 'anime'
  | 'movies' | 'sports' | 'politics' | 'pranks' | 'sfx' | 'ai-voices' | 'sound-buttons'

export type SoundStatus = 'pending' | 'approved' | 'rejected'

export interface Sound {
  id: string
  title: string
  slug: string
  description?: string
  category: Category
  subcategory?: string
  tags: string[]
  r2_url: string
  r2_key: string
  file_size: number
  duration?: number
  plays: number
  likes: number
  downloads: number
  is_featured: boolean
  is_ai_generated: boolean
  status: SoundStatus
  uploaded_by?: string
  reject_reason?: string
  created_at: string
  approved_at?: string
}

export interface CategoryMeta {
  id: Category
  label: string
  emoji: string
  description: string
  color: string
  textColor: string
  borderColor: string
  slug: string
}

export interface SiteSettings {
  id: string
  announcement_enabled: boolean
  announcement_text: string
  announcement_color: string
  announcement_link?: string
  announcement_dismissable: boolean
  adsense_enabled: boolean
  adsense_client_id: string
  custom_ads_enabled: boolean
  maintenance_mode: boolean
  updated_at: string
}

export interface CustomAd {
  id: string
  title: string
  image_url: string
  target_url: string
  position: 'top' | 'sidebar' | 'between-sounds' | 'download'
  is_active: boolean
  clicks: number
  impressions: number
  created_at: string
}

export interface SoundRequest {
  id: string
  title: string
  description?: string
  category: Category
  requested_by?: string
  upvotes: number
  status: 'pending' | 'fulfilled' | 'rejected'
  created_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  cover_image?: string
  tags: string[]
  author_id: string
  is_published: boolean
  views: number
  published_at?: string
  created_at: string
}

export interface AdminUser {
  id: string
  email: string
  username?: string
  is_admin: boolean
  created_at: string
}

// ─── Store Types ───────────────────────────────────────

export interface PlayerState {
  currentSoundId: string | null
  currentUrl: string | null
  isPlaying: boolean
  volume: number
  isMuted: boolean
  isLooping: boolean
  play: (id: string, url: string) => void
  pause: () => void
  stop: () => void
  setVolume: (v: number) => void
  toggleMute: () => void
  toggleLoop: () => void
}

export interface ThemeState {
  theme: 'light' | 'dark'
  toggle: () => void
  setTheme: (t: 'light' | 'dark') => void
}

export interface AdminState {
  isAuthenticated: boolean
  user: AdminUser | null
  setUser: (u: AdminUser | null) => void
  logout: () => void
}

// ─── API Response Types ────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface ApiError {
  message: string
  code?: string
}
