import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const PRESET_COLORS = [
  { label: 'Yellow (Default)', value: '#f5c518' },
  { label: 'Green',            value: '#22c55e' },
  { label: 'Red',              value: '#ef4444' },
  { label: 'Blue',             value: '#3b82f6' },
  { label: 'Purple',           value: '#a855f7' },
  { label: 'Orange',           value: '#f97316' },
]

export default function AdminAnnouncement() {
  const [text,        setText]        = useState('')
  const [color,       setColor]       = useState('#f5c518')
  const [link,        setLink]        = useState('')
  const [enabled,     setEnabled]     = useState(false)
  const [dismissable, setDismissable] = useState(true)
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)

  useEffect(() => {
    supabase.from('site_settings').select('*').single().then(({ data }) => {
      if (data) {
        setText(data.announcement_text ?? '')
        setColor(data.announcement_color ?? '#f5c518')
        setLink(data.announcement_link ?? '')
        setEnabled(data.announcement_enabled ?? false)
        setDismissable(data.announcement_dismissable ?? true)
      }
      setLoading(false)
    })
  }, [])

  async function handleSave() {
    setSaving(true)
    await supabase.from('site_settings').update({
      announcement_text:        text,
      announcement_color:       color,
      announcement_link:        link || null,
      announcement_enabled:     enabled,
      announcement_dismissable: dismissable,
      updated_at:               new Date().toISOString(),
    }).eq('id', 1)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const bgIsDark = ['#3b82f6', '#a855f7', '#ef4444'].includes(color)

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 4 }}>
          Announcement
        </h1>
        <p style={{ fontSize: 14, color: '#555' }}>
          Show a dismissable banner at the top of every page
        </p>
      </div>

      {/* Live Preview */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#555', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Live Preview
        </div>
        <div style={{
          borderRadius: 10, overflow: 'hidden',
          border: '1px solid #1e1e1e',
        }}>
          {enabled && text ? (
            <div style={{
              background: color,
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              position: 'relative',
            }}>
              <span style={{
                fontSize: 13, fontWeight: 600,
                color: bgIsDark ? '#fff' : '#1a1400',
              }}>
                {link ? (
                  <a href={link} style={{ color: 'inherit', textDecoration: 'underline' }}>{text}</a>
                ) : text}
              </span>
              {dismissable && (
                <span style={{
                  position: 'absolute', right: 12,
                  fontSize: 16, cursor: 'pointer',
                  color: bgIsDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.4)',
                }}>×</span>
              )}
            </div>
          ) : (
            <div style={{
              padding: '24px', textAlign: 'center',
              color: '#444', fontSize: 13,
              background: '#111',
            }}>
              {!enabled ? 'Announcement is disabled — enable to preview' : 'Enter text above to preview'}
            </div>
          )}
          {/* Mock navbar */}
          <div style={{
            background: '#111', height: 40,
            borderTop: '1px solid #1a1a1a',
            display: 'flex', alignItems: 'center',
            padding: '0 16px', gap: 12,
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>⚡ ZapSoundboard</div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={{
        background: '#111', border: '1px solid #1e1e1e',
        borderRadius: 12, padding: '24px',
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>
        {loading ? (
          <div style={{ color: '#555', fontSize: 14 }}>Loading settings...</div>
        ) : (
          <>
            {/* Enable toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 3 }}>
                  Enable Announcement
                </div>
                <div style={{ fontSize: 12, color: '#555' }}>Show banner on all pages</div>
              </div>
              <button
                onClick={() => setEnabled(!enabled)}
                style={{
                  width: 44, height: 24, borderRadius: 12,
                  border: 'none', cursor: 'pointer',
                  background: enabled ? '#f5c518' : '#2a2a2a',
                  position: 'relative', transition: 'background 200ms',
                }}
              >
                <span style={{
                  position: 'absolute', top: 2,
                  left: enabled ? 22 : 2,
                  width: 20, height: 20,
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 200ms',
                  display: 'block',
                }} />
              </button>
            </div>

            <div style={{ height: 1, background: '#1a1a1a' }} />

            {/* Text */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a0a0a0', marginBottom: 8 }}>
                Announcement Text *
              </label>
              <input
                type="text"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="🎉 New sounds added! Check out the Gaming category →"
                maxLength={200}
                style={{
                  width: '100%', height: 44, padding: '0 14px',
                  background: '#1a1a1a', border: '1px solid #2a2a2a',
                  borderRadius: 8, color: '#fff', fontSize: 14,
                  fontFamily: 'var(--font)', outline: 'none',
                  boxSizing: 'border-box', transition: 'border-color 150ms',
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#f5c518'}
                onBlur={e => e.currentTarget.style.borderColor = '#2a2a2a'}
              />
              <div style={{ fontSize: 11, color: '#444', marginTop: 4, textAlign: 'right' }}>
                {text.length}/200
              </div>
            </div>

            {/* Link */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a0a0a0', marginBottom: 8 }}>
                Link URL (optional)
              </label>
              <input
                type="url"
                value={link}
                onChange={e => setLink(e.target.value)}
                placeholder="https://zapsoundboard.com/soundboard/gaming"
                style={{
                  width: '100%', height: 44, padding: '0 14px',
                  background: '#1a1a1a', border: '1px solid #2a2a2a',
                  borderRadius: 8, color: '#fff', fontSize: 14,
                  fontFamily: 'var(--font)', outline: 'none',
                  boxSizing: 'border-box', transition: 'border-color 150ms',
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#f5c518'}
                onBlur={e => e.currentTarget.style.borderColor = '#2a2a2a'}
              />
            </div>

            {/* Color */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a0a0a0', marginBottom: 10 }}>
                Bar Color
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {PRESET_COLORS.map(c => (
                  <button key={c.value} onClick={() => setColor(c.value)} title={c.label} style={{
                    width: 32, height: 32, borderRadius: 8,
                    border: color === c.value ? '3px solid #fff' : '2px solid transparent',
                    background: c.value, cursor: 'pointer',
                    transition: 'transform 150ms',
                    transform: color === c.value ? 'scale(1.1)' : 'scale(1)',
                    outline: color === c.value ? `2px solid ${c.value}` : 'none',
                    outlineOffset: 2,
                  }} />
                ))}
                {/* Custom color */}
                <div style={{ position: 'relative' }}>
                  <input type="color" value={color} onChange={e => setColor(e.target.value)}
                    style={{
                      width: 32, height: 32, borderRadius: 8, border: '1px solid #333',
                      cursor: 'pointer', padding: 2, background: '#1a1a1a',
                    }}
                    title="Custom color"
                  />
                </div>
              </div>
            </div>

            {/* Dismissable */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 2 }}>
                  Dismissable
                </div>
                <div style={{ fontSize: 12, color: '#555' }}>Show × button for users to close</div>
              </div>
              <button onClick={() => setDismissable(!dismissable)} style={{
                width: 44, height: 24, borderRadius: 12, border: 'none',
                cursor: 'pointer',
                background: dismissable ? '#f5c518' : '#2a2a2a',
                position: 'relative', transition: 'background 200ms',
              }}>
                <span style={{
                  position: 'absolute', top: 2,
                  left: dismissable ? 22 : 2,
                  width: 20, height: 20, borderRadius: '50%',
                  background: '#fff', transition: 'left 200ms', display: 'block',
                }} />
              </button>
            </div>

            {/* Save */}
            <button onClick={handleSave} disabled={saving} style={{
              height: 44, borderRadius: 8, border: 'none',
              background: saved ? '#22c55e' : '#f5c518',
              color: '#1a1400', fontSize: 14, fontWeight: 700,
              cursor: saving ? 'wait' : 'pointer',
              fontFamily: 'var(--font)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background 300ms',
            }}>
              {saving ? (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                  </svg>
                  Saving...
                </>
              ) : saved ? (
                <>✓ Saved!</>
              ) : (
                <>💾 Save Announcement</>
              )}
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
