import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PlayerState, ThemeState, AdminState, AdminUser } from '@/lib/types'
import { incrementPlay } from '@/lib/supabase'

// ─── Singleton audio element ───────────────────────────
const audio = new Audio()
audio.preload = 'none'

// ─── Player Store ─────────────────────────────────────
export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSoundId: null,
  currentUrl: null,
  isPlaying: false,
  volume: 0.85,
  isMuted: false,
  isLooping: false,

  play: (id, url) => {
    const { currentSoundId, volume, isMuted, isLooping } = get()

    // Same sound — toggle pause/resume
    if (currentSoundId === id) {
      if (audio.paused) {
        audio.play().catch(() => {})
        set({ isPlaying: true })
      } else {
        audio.pause()
        set({ isPlaying: false })
      }
      return
    }

    // New sound
    audio.pause()
    audio.src = url
    audio.volume = isMuted ? 0 : volume
    audio.loop = isLooping
    audio.play().catch(() => {})

    // Track play count (fire & forget)
    incrementPlay(id)

    set({ currentSoundId: id, currentUrl: url, isPlaying: true })

    audio.onended = () => {
      if (!audio.loop) set({ isPlaying: false, currentSoundId: null })
    }
  },

  pause: () => {
    audio.pause()
    set({ isPlaying: false })
  },

  stop: () => {
    audio.pause()
    audio.currentTime = 0
    set({ isPlaying: false, currentSoundId: null, currentUrl: null })
  },

  setVolume: (v) => {
    audio.volume = v
    set({ volume: v, isMuted: v === 0 })
  },

  toggleMute: () => {
    const { isMuted, volume } = get()
    audio.volume = isMuted ? volume : 0
    set({ isMuted: !isMuted })
  },

  toggleLoop: () => {
    const { isLooping } = get()
    audio.loop = !isLooping
    set({ isLooping: !isLooping })
  },
}))

// ─── Theme Store ──────────────────────────────────────
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggle: () => set((s) => {
        const next = s.theme === 'light' ? 'dark' : 'light'
        document.documentElement.setAttribute('data-theme', next)
        return { theme: next }
      }),
      setTheme: (t) => {
        document.documentElement.setAttribute('data-theme', t)
        set({ theme: t })
      },
    }),
    {
      name: 'zap-theme',
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          document.documentElement.setAttribute('data-theme', state.theme)
        }
      },
    }
  )
)

// ─── Admin Store ──────────────────────────────────────
export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      setUser: (user: AdminUser | null) => set({ isAuthenticated: !!user, user }),
      logout: () => set({ isAuthenticated: false, user: null }),
    }),
    { name: 'zap-admin' }
  )
)
