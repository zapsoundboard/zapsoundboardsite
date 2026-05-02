import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { getCategoryMeta } from '@/lib/categories'
import type { Sound } from '@/lib/types'

const WORKER_URL = (import.meta as any).env.VITE_WORKER_URL ?? ''

const REJECT_REASONS = [
  'Copyright violation',
  'Low audio quality',
  'Inappropriate content',
  'Duplicate sound',
  'Too long (max 30s)',
  'Wrong category',
  'Custom reason...',
]

interface RejectModal {
  sound:  Sound
  reason: string
  custom: string
}

export default function AdminPending() {
  const [sounds, setSounds]       = useState<Sound[]>([])
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState<Set<string>>(new Set())
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [rejectModal, setRejectModal] = useState<RejectModal | null>(null)
  const [processing, setProcessing]   = useState<Set<string>>(new Set())
  const audioRef = useRef<HTMLAudioElement>(new Audio())

  useEffect(() => {
    loadPending()
    return () => { audioRef.current.pause() }
  }, [])

  async function loadPending() {
    setLoading(true)
    const { data, error } = await supabase
      .from('sounds').select('*').eq('status', 'pending')
      .order('created_at', { ascending: false })
    if (!error) setSounds((data ?? []) as Sound[])
    setLoading(false)
  }

  function togglePlay(sound: Sound) {
    if (playingId === sound.id) {
      audioRef.current.pause()
      setPlayingId(null)
      return
    }
    audioRef.current.pause()
    audioRef.current.src = sound.r2_url
    audioRef.current.play().catch(() => {})
    audioRef.current.onended = () => setPlayingId(null)
    setPlayingId(sound.id)
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected(prev =>
      prev.size === sounds.length ? new Set() : new Set(sounds.map(s => s.id))
    )
  }

  async function handleApprove(sound: Sound) {
    setProcessing(prev => new Set(prev).add(sound.id))
    try {
      const res = await fetch(`${WORKER_URL}/api/admin/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soundId:    sound.id,
          pendingKey: sound.r2_key,
          category:   sound.category,
          slug:       sound.slug,
        }),
      })
      if (!res.ok) throw new Error('Approve failed')
      setSounds(prev => prev.filter(s => s.id !== sound.id))
      setSelected(prev => { const n = new Set(prev); n.delete(sound.id); return n })
    } catch (err) {
      console.error(err)
      alert('Failed to approve. Check Worker logs.')
    } finally {
      setProcessing(prev => { const n = new Set(prev); n.delete(sound.id); return n })
    }
  }

  async function handleReject(sound: Sound, reason: string) {
    setProcessing(prev => new Set(prev).add(sound.id))
    try {
      const res = await fetch(`${WORKER_URL}/api/admin/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ soundId: sound.id, r2Key: sound.r2_key, reason }),
      })
      if (!res.ok) throw new Error('Reject failed')
      setSounds(prev => prev.filter(s => s.id !== sound.id))
      setSelected(prev => { const n = new Set(prev); n.delete(sound.id); return n })
      setRejectModal(null)
    } catch (err) {
      console.error(err)
      alert('Failed to reject. Check Worker logs.')
    } finally {
      setProcessing(prev => { const n = new Set(prev); n.delete(sound.id); return n })
    }
  }

  async function bulkApprove() {
    const toApprove = sounds.filter(s => selected.has(s.id))
    for (const sound of toApprove) await handleApprove(sound)
  }

  function timeAgo(d: string) {
    const diff = Date.now() - new Date(d).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 60)  return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24)  return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  function fmtBytes(b: number) {
    return b > 1048576 ? `${(b/1048576).toFixed(1)}MB` : `${(b/1024).toFixed(0)}KB`
  }

  function fmtDuration(s?: number) {
    if (!s) return '—'
    return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 4 }}>
            Pending
          </h1>
          <p style={{ fontSize: 14, color: '#555' }}>
            {sounds.length} sound{sounds.length !== 1 ? 's' : ''} waiting for review
          </p>
        </div>
        <button onClick={loadPending} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', borderRadius: 8,
          border: '1px solid #2a2a2a', background: 'transparent',
          color: '#888', fontSize: 13, cursor: 'pointer',
          fontFamily: 'var(--font)', transition: 'all 150ms',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#888' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.18-4.49"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div style={{
          background: '#1a1a00', border: '1px solid #2a2a00',
          borderRadius: 10, padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
          marginBottom: 16,
        }}>
          <span style={{ fontSize: 13, color: '#f5c518', fontWeight: 500 }}>
            {selected.size} selected
          </span>
          <button onClick={bulkApprove} style={{
            padding: '6px 14px', borderRadius: 6, border: 'none',
            background: '#22c55e', color: '#fff',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'var(--font)',
          }}>
            ✓ Approve All
          </button>
          <button onClick={() => setSelected(new Set())} style={{
            padding: '6px 14px', borderRadius: 6,
            border: '1px solid #333', background: 'transparent',
            color: '#888', fontSize: 12, cursor: 'pointer',
            fontFamily: 'var(--font)',
          }}>
            Deselect
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3].map(i => (
            <div key={i} className="skeleton" style={{
              height: 80, borderRadius: 10,
              background: '#111',
            }} />
          ))}
        </div>
      ) : sounds.length === 0 ? (
        <div style={{
          background: '#111', border: '1px solid #1e1e1e',
          borderRadius: 12, padding: '60px 20px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <p style={{ fontSize: 15, color: '#fff', fontWeight: 600, marginBottom: 6 }}>All clear!</p>
          <p style={{ fontSize: 13, color: '#555' }}>No pending sounds to review</p>
        </div>
      ) : (
        <>
          {/* Select all */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 16px', marginBottom: 8,
          }}>
            <input type="checkbox"
              checked={selected.size === sounds.length && sounds.length > 0}
              onChange={toggleAll}
              style={{ width: 15, height: 15, cursor: 'pointer', accentColor: '#f5c518' }}
            />
            <span style={{ fontSize: 12, color: '#555' }}>Select all</span>
          </div>

          {/* Sound rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sounds.map(sound => {
              const cat     = getCategoryMeta(sound.category)
              const isPlay  = playingId === sound.id
              const isProc  = processing.has(sound.id)
              const isSel   = selected.has(sound.id)

              return (
                <div key={sound.id} style={{
                  background: isSel ? '#1a1a00' : '#111',
                  border: `1px solid ${isSel ? '#2a2a00' : '#1e1e1e'}`,
                  borderRadius: 10,
                  padding: '14px 16px',
                  display: 'flex', alignItems: 'center', gap: 12,
                  transition: 'all 150ms',
                  opacity: isProc ? 0.5 : 1,
                }}>
                  {/* Checkbox */}
                  <input type="checkbox"
                    checked={isSel}
                    onChange={() => toggleSelect(sound.id)}
                    style={{ width: 15, height: 15, cursor: 'pointer', accentColor: '#f5c518', flexShrink: 0 }}
                  />

                  {/* Play button */}
                  <button onClick={() => togglePlay(sound)} disabled={isProc} style={{
                    width: 40, height: 40, borderRadius: '50%',
                    border: `2px solid ${cat.color}`,
                    background: isPlay ? cat.color : `${cat.color}18`,
                    color: isPlay ? cat.textColor : cat.color,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'all 150ms',
                  }}>
                    {isPlay ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5,3 19,12 5,21"/>
                      </svg>
                    )}
                  </button>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 14, fontWeight: 600, color: '#fff',
                      marginBottom: 4, overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {sound.title}
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: 11, padding: '1px 7px',
                        borderRadius: 'var(--r-full)',
                        background: `${cat.color}20`,
                        color: cat.color, fontWeight: 500,
                      }}>
                        {cat.emoji} {cat.label}
                      </span>
                      <span style={{ fontSize: 11, color: '#555' }}>{fmtBytes(sound.file_size)}</span>
                      <span style={{ fontSize: 11, color: '#555' }}>{fmtDuration(sound.duration)}</span>
                      <span style={{ fontSize: 11, color: '#555' }}>{timeAgo(sound.created_at)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button onClick={() => handleApprove(sound)} disabled={isProc} style={{
                      padding: '7px 16px', borderRadius: 7, border: 'none',
                      background: '#22c55e', color: '#fff',
                      fontSize: 13, fontWeight: 600,
                      cursor: isProc ? 'wait' : 'pointer',
                      fontFamily: 'var(--font)',
                      display: 'flex', alignItems: 'center', gap: 5,
                      transition: 'opacity 150ms',
                    }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Approve
                    </button>
                    <button onClick={() => setRejectModal({ sound, reason: REJECT_REASONS[0], custom: '' })}
                      disabled={isProc} style={{
                        padding: '7px 16px', borderRadius: 7,
                        border: '1px solid #2a1010',
                        background: '#1a0a0a', color: '#ef4444',
                        fontSize: 13, fontWeight: 600,
                        cursor: isProc ? 'wait' : 'pointer',
                        fontFamily: 'var(--font)',
                        transition: 'all 150ms',
                      }}>
                      Reject
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }} onClick={() => setRejectModal(null)}>
          <div style={{
            background: '#111', border: '1px solid #2a2a2a',
            borderRadius: 14, padding: '28px 24px',
            width: '100%', maxWidth: 420,
            boxShadow: '0 8px 40px rgba(0,0,0,0.7)',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 6, letterSpacing: '-0.02em' }}>
              Reject Sound
            </h3>
            <p style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>
              "{rejectModal.sound.title}" — Choose a reason:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
              {REJECT_REASONS.map(reason => (
                <label key={reason} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8,
                  border: `1px solid ${rejectModal.reason === reason ? '#ef444430' : '#1e1e1e'}`,
                  background: rejectModal.reason === reason ? '#1a0808' : 'transparent',
                  cursor: 'pointer', transition: 'all 150ms',
                }}>
                  <input type="radio" name="reason" value={reason}
                    checked={rejectModal.reason === reason}
                    onChange={() => setRejectModal({ ...rejectModal, reason })}
                    style={{ accentColor: '#ef4444' }}
                  />
                  <span style={{ fontSize: 13, color: rejectModal.reason === reason ? '#ef4444' : '#888' }}>
                    {reason}
                  </span>
                </label>
              ))}
            </div>

            {rejectModal.reason === 'Custom reason...' && (
              <textarea
                value={rejectModal.custom}
                onChange={e => setRejectModal({ ...rejectModal, custom: e.target.value })}
                placeholder="Describe the issue..."
                rows={3}
                style={{
                  width: '100%', padding: '10px 12px',
                  background: '#1a1a1a', border: '1px solid #2a2a2a',
                  borderRadius: 8, color: '#fff', fontSize: 13,
                  fontFamily: 'var(--font)', outline: 'none',
                  resize: 'vertical', marginBottom: 16,
                  boxSizing: 'border-box',
                }}
              />
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setRejectModal(null)} style={{
                flex: 1, padding: '10px', borderRadius: 8,
                border: '1px solid #2a2a2a', background: 'transparent',
                color: '#888', fontSize: 13, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'var(--font)',
              }}>
                Cancel
              </button>
              <button onClick={() => {
                const reason = rejectModal.reason === 'Custom reason...'
                  ? rejectModal.custom || 'No reason provided'
                  : rejectModal.reason
                handleReject(rejectModal.sound, reason)
              }} style={{
                flex: 1, padding: '10px', borderRadius: 8,
                border: 'none', background: '#ef4444',
                color: '#fff', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'var(--font)',
              }}>
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
