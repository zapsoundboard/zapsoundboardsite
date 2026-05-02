import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface AnnouncementData {
  text:        string
  color:       string
  link?:       string
  dismissable: boolean
  enabled:     boolean
}

const DISMISS_KEY = 'zap_announcement_dismissed'

export default function AnnouncementBar() {
  const [data,      setData]      = useState<AnnouncementData | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if already dismissed
    const wasDismissed = localStorage.getItem(DISMISS_KEY)
    if (wasDismissed) { setDismissed(true); return }

    // Fetch from Supabase
    supabase
      .from('site_settings')
      .select('announcement_enabled,announcement_text,announcement_color,announcement_link,announcement_dismissable')
      .single()
      .then(({ data: settings }) => {
        if (!settings || !settings.announcement_enabled || !settings.announcement_text) return
        setData({
          text:        settings.announcement_text,
          color:       settings.announcement_color ?? '#f5c518',
          link:        settings.announcement_link,
          dismissable: settings.announcement_dismissable ?? true,
          enabled:     true,
        })
      })
  }, [])

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }

  if (!data || dismissed || !data.enabled) return null

  // Decide text color based on bg brightness
  const isDarkBg  = ['#3b82f6','#a855f7','#ef4444','#1a1a1a','#000000'].includes(data.color)
  const textColor = isDarkBg ? '#ffffff' : '#1a1400'

  const content = (
    <span style={{
      fontSize: 13, fontWeight: 600,
      color: textColor,
      textDecoration: data.link ? 'underline' : 'none',
    }}>
      {data.text}
    </span>
  )

  return (
    <div style={{
      background:  data.color,
      padding:     '9px 16px',
      display:     'flex',
      alignItems:  'center',
      justifyContent: 'center',
      position:    'relative',
      animation:   'slideDown 300ms ease',
      zIndex:      200,
    }}>
      {data.link ? (
        <a href={data.link} target="_blank" rel="noopener noreferrer"
          style={{ textDecoration: 'none' }}>
          {content}
        </a>
      ) : content}

      {data.dismissable && (
        <button
          onClick={dismiss}
          title="Dismiss"
          style={{
            position:   'absolute',
            right:      12,
            top:        '50%',
            transform:  'translateY(-50%)',
            background: 'none',
            border:     'none',
            cursor:     'pointer',
            color:      textColor,
            opacity:    0.6,
            fontSize:   18,
            lineHeight: 1,
            padding:    '0 4px',
            transition: 'opacity 150ms',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
        >
          ×
        </button>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-100%); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
