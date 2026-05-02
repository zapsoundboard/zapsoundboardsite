import { useState } from 'react'
import { usePWA } from '@/hooks/usePWA'

export default function PWABanner() {
  const { installPrompt, isInstalled, isOnline, promptInstall } = usePWA()
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('zap_pwa_dismissed') === '1'
  )

  function dismiss() {
    localStorage.setItem('zap_pwa_dismissed', '1')
    setDismissed(true)
  }

  async function install() {
    const ok = await promptInstall()
    if (ok) dismiss()
  }

  // Offline indicator
  if (!isOnline) {
    return (
      <div style={{
        position: 'fixed', bottom: 16, left: '50%',
        transform: 'translateX(-50%)',
        background: '#111', border: '1px solid #ef4444',
        borderRadius: 'var(--r-lg)', padding: '10px 20px',
        display: 'flex', alignItems: 'center', gap: 10,
        fontSize: 13, color: '#fff', zIndex: 999,
        boxShadow: 'var(--shadow-lg)',
        animation: 'fadeUp 300ms ease',
      }}>
        <span style={{ fontSize: 16 }}>📡</span>
        You're offline — recently played sounds still work!
      </div>
    )
  }

  // Install prompt
  if (!installPrompt || isInstalled || dismissed) return null

  return (
    <div style={{
      position: 'fixed', bottom: 16, left: '50%',
      transform: 'translateX(-50%)',
      background: 'var(--bg)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-xl)', padding: '14px 18px',
      display: 'flex', alignItems: 'center', gap: 14,
      boxShadow: 'var(--shadow-lg)', zIndex: 999,
      maxWidth: 'calc(100vw - 32px)',
      animation: 'fadeUp 400ms ease',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: 'var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, flexShrink: 0,
      }}>⚡</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
          Install ZapSoundboard
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Add to home screen — offline access, faster loading
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button onClick={dismiss} style={{
          padding: '7px 12px', borderRadius: 'var(--r-md)',
          border: '1px solid var(--border)', background: 'transparent',
          color: 'var(--text-muted)', fontSize: 12,
          cursor: 'pointer', fontFamily: 'var(--font)',
        }}>
          Not now
        </button>
        <button onClick={install} style={{
          padding: '7px 14px', borderRadius: 'var(--r-md)',
          border: 'none', background: 'var(--accent)',
          color: 'var(--accent-text)', fontSize: 12, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'var(--font)',
        }}>
          Install
        </button>
      </div>
    </div>
  )
}
