import { useEffect } from 'react'
import { usePlayerStore } from '@/store'

export function useKeyboardShortcuts(
  sounds: { id: string; r2_url: string }[] = []
) {
  const { stop, pause, isPlaying, currentSoundId, play } = usePlayerStore()

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      // Don't trigger shortcuts when typing in inputs
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      // Space = play/pause current
      if (e.code === 'Space') {
        e.preventDefault()
        if (isPlaying) pause()
        else if (currentSoundId) {
          const sound = sounds.find(s => s.id === currentSoundId)
          if (sound) play(sound.id, sound.r2_url)
        }
        return
      }

      // Escape = stop
      if (e.code === 'Escape') { stop(); return }

      // 1-9 = play nth sound
      const num = parseInt(e.key)
      if (!isNaN(num) && num >= 1 && num <= 9) {
        const sound = sounds[num - 1]
        if (sound) play(sound.id, sound.r2_url)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sounds, stop, pause, play, isPlaying, currentSoundId])
}
