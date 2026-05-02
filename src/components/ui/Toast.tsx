import { useState, useCallback, useEffect } from 'react'

interface Toast {
  id:      string
  message: string
  type:    'success' | 'error' | 'info'
  icon?:   string
}

// Global toast queue
let addToastFn: ((t: Omit<Toast,'id'>) => void) | null = null

export function toast(message: string, type: Toast['type'] = 'success', icon?: string) {
  addToastFn?.({ message, type, icon })
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((t: Omit<Toast,'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { ...t, id }])
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 3500)
  }, [])

  useEffect(() => { addToastFn = addToast }, [addToast])

  const colors = {
    success: { bg: 'var(--success-bg)', border: 'var(--success)', text: '#15803d' },
    error:   { bg: 'var(--error-bg)',   border: 'var(--error)',   text: '#b91c1c' },
    info:    { bg: 'var(--info-bg)',    border: 'var(--info)',    text: '#1d4ed8' },
  }

  const icons = { success: '✓', error: '✕', info: 'ℹ' }

  if (!toasts.length) return null

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24,
      display: 'flex', flexDirection: 'column', gap: 8,
      zIndex: 9999, pointerEvents: 'none',
    }}>
      {toasts.map(t => {
        const c = colors[t.type]
        return (
          <div key={t.id} style={{
            background: c.bg, border: `1px solid ${c.border}`,
            borderRadius: 'var(--r-lg)', padding: '11px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
            fontSize: 14, fontWeight: 500, color: c.text,
            boxShadow: 'var(--shadow-md)',
            animation: 'fadeUp 250ms ease',
            pointerEvents: 'auto',
            maxWidth: 320,
          }}>
            <span style={{ fontSize: 16 }}>{t.icon ?? icons[t.type]}</span>
            {t.message}
          </div>
        )
      })}
    </div>
  )
}
