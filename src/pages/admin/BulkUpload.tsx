import { useState, useRef } from 'react'
import { CATEGORIES } from '@/lib/categories'

const WORKER_URL = (import.meta as { env: Record<string, string> }).env.VITE_WORKER_URL
  ?? 'http://localhost:8787'

const PRESET_COLORS = [
  { label: 'Yellow',  value: '#f5c518' },
  { label: 'Purple',  value: '#7C6FFF' },
  { label: 'Pink',    value: '#FF6B8A' },
  { label: 'Green',   value: '#00E5A0' },
  { label: 'Blue',    value: '#3b82f6' },
  { label: 'Orange',  value: '#f97316' },
  { label: 'Red',     value: '#ef4444' },
  { label: 'Cyan',    value: '#06b6d4' },
  { label: 'Indigo',  value: '#6366f1' },
  { label: 'Rose',    value: '#f43f5e' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'White',   value: '#ffffff' },
]

type FileStatus = 'idle' | 'uploading' | 'success' | 'error'

interface FileItem {
  id: string
  file: File
  title: string
  slug: string
  color: string
  status: FileStatus
  progress: number
  error?: string
  r2Key?: string
  playing: boolean
  audioUrl: string
}

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
function titleFromFile(n: string) {
  return n.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase()).trim()
}

export default function BulkUpload() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [category, setCategory] = useState('meme')
  const [subcategory, setSubcat] = useState('')
  const [character, setCharacter] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)

  function buildPath(slug: string) {
    const p = ['approved', toSlug(category)]
    if (subcategory.trim()) p.push(toSlug(subcategory))
    if (character.trim()) p.push(toSlug(character))
    p.push(`${slug}.mp3`)
    return p.join('/')
  }

  function addFiles(newFiles: File[]) {
    const valid = newFiles
      .filter(f => f.size <= 5 * 1024 * 1024 &&
        (f.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a)$/i.test(f.name)))
      .slice(0, 20 - files.length)

    setFiles(prev => [...prev, ...valid.map(f => {
      const title = titleFromFile(f.name)
      return {
        id: Math.random().toString(36).slice(2),
        file: f,
        title,
        slug: toSlug(title),
        color: '#f5c518',
        status: 'idle' as FileStatus,
        progress: 0,
        playing: false,
        audioUrl: URL.createObjectURL(f),
      }
    })])
  }

  function updateFile(id: string, updates: Partial<FileItem>) {
    setFiles(prev => prev.map(f => f.id !== id ? f : {
      ...f, ...updates,
      slug: updates.slug !== undefined ? updates.slug :
        updates.title ? toSlug(updates.title) : f.slug,
    }))
  }

  function togglePlay(item: FileItem) {
    if (playingId === item.id) {
      audioRef.current?.pause()
      setPlayingId(null)
      return
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
    }
    const audio = new Audio(item.audioUrl)
    audioRef.current = audio
    audio.play().catch(() => { })
    audio.onended = () => setPlayingId(null)
    setPlayingId(item.id)
  }

  async function uploadSingle(item: FileItem) {
    updateFile(item.id, { status: 'uploading', progress: 20 })
    try {
      const form = new FormData()
      form.append('file', item.file)
      form.append('title', item.title)
      form.append('slug', item.slug)
      form.append('category', category)
      form.append('subcategory', subcategory.trim())
      form.append('character', character.trim())
      form.append('color', item.color)
      updateFile(item.id, { progress: 50 })
      const res = await fetch(`${WORKER_URL}/api/admin/upload`, { method: 'POST', body: form })
      updateFile(item.id, { progress: 80 })
      if (!res.ok) {
        const d = await res.json() as { error?: string }
        throw new Error(d.error ?? `HTTP ${res.status}`)
      }
      const d = await res.json() as { r2Key: string }
      updateFile(item.id, { status: 'success', progress: 100, r2Key: d.r2Key })
    } catch (e) {
      updateFile(item.id, { status: 'error', progress: 0, error: e instanceof Error ? e.message : 'Failed' })
    }
  }

  async function handleUploadAll() {
    const todo = files.filter(f => f.status === 'idle' || f.status === 'error')
    if (!todo.length) return
    setUploading(true)
    for (const item of todo) await uploadSingle(item)
    setUploading(false)
  }

  const counts = {
    success: files.filter(f => f.status === 'success').length,
    error: files.filter(f => f.status === 'error').length,
    idle: files.filter(f => f.status === 'idle').length,
  }

  const inp: React.CSSProperties = {
    height: 34, padding: '0 10px', background: '#1a1a1a',
    border: '1px solid #2a2a2a', borderRadius: 6, color: '#fff',
    fontSize: 14, fontFamily: 'var(--font)', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 150ms', width: '100%',
  }
  const fo = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = '#f5c518')
  const fb = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = '#2a2a2a')

  return (
    <div style={{ fontFamily: 'var(--font)' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 4 }}>
          Bulk Upload Sounds
        </h1>
        <p style={{ fontSize: 14, color: '#555' }}>
          Upload multiple MP3s — preview, edit slug, pick color, auto-organize in R2
        </p>
      </div>

      {/* Folder Builder */}
      <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 14 }}>
          📁 Category → Subcategory → Character
        </div>
        <div className="folder-builder-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 5 }}>Category *</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              style={{ ...inp, height: 44, cursor: 'pointer', fontSize: 16 }} onFocus={fo} onBlur={fb}>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 5 }}>
              Subcategory <span style={{ color: '#444' }}>(e.g. naruto)</span>
            </label>
            <input type="text" value={subcategory} onChange={e => setSubcat(e.target.value)}
              placeholder="naruto" style={{ ...inp, height: 44, fontSize: 16 }} onFocus={fo} onBlur={fb} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 5 }}>
              Character <span style={{ color: '#444' }}>(e.g. itachi)</span>
            </label>
            <input type="text" value={character} onChange={e => setCharacter(e.target.value)}
              placeholder="itachi" style={{ ...inp, height: 44, fontSize: 16 }} onFocus={fo} onBlur={fb} />
          </div>
        </div>
        <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 8, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: '#555', flexShrink: 0 }}>Preview:</span>
          <code style={{ fontSize: 12, color: '#f5c518', wordBreak: 'break-all' }}>
            sounds.zapsoundboard.com/{buildPath('sound-slug')}
          </code>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(Array.from(e.dataTransfer.files)) }}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? '#f5c518' : '#2a2a2a'}`,
          borderRadius: 12, padding: '24px 20px', textAlign: 'center',
          cursor: 'pointer', marginBottom: 16,
          background: dragOver ? 'rgba(245,197,24,0.05)' : '#111',
          transition: 'all 200ms',
        }}
      >
        <div style={{ fontSize: 26, marginBottom: 8 }}>⬆️</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
          Drop MP3 files here or click to browse
        </div>
        <div style={{ fontSize: 12, color: '#555' }}>MP3, WAV, OGG — max 5MB — max 20 files</div>
        <input ref={inputRef} type="file" accept="audio/*" multiple style={{ display: 'none' }}
          onChange={e => { if (e.target.files) addFiles(Array.from(e.target.files)) }} />
      </div>

      {/* Files Table */}
      {files.length > 0 && (
        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>

          {/* Header — hidden on mobile via CSS */}
          <div className="bulk-file-header" style={{
            display: 'grid',
            gridTemplateColumns: '36px 1fr 1fr 160px 1fr 70px 36px',
            gap: 10, padding: '10px 16px',
            borderBottom: '1px solid #1a1a1a',
            fontSize: 11, fontWeight: 600, color: '#555',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            <span>Play</span>
            <span>Title</span>
            <span>Slug</span>
            <span>Color</span>
            <span>R2 Path</span>
            <span>Size</span>
            <span></span>
          </div>

          {files.map(item => {
            const isPlaying = playingId === item.id
            const locked = item.status === 'uploading' || item.status === 'success'
            return (
              <div key={item.id}>
                <div className="bulk-file-row" style={{
                  display: 'grid',
                  gridTemplateColumns: '36px 1fr 1fr 160px 1fr 70px 36px',
                  gap: 10, padding: '10px 16px',
                  borderBottom: '1px solid #161616',
                  alignItems: 'center',
                  position: 'relative',
                  background: item.status === 'success' ? 'rgba(34,197,94,0.04)'
                    : item.status === 'error' ? 'rgba(239,68,68,0.04)' : 'transparent',
                }}>

                  {/* Play button */}
                  <div className="bulk-cell-play">
                    <button
                      onClick={() => togglePlay(item)}
                      disabled={item.status === 'uploading'}
                      title={isPlaying ? 'Pause' : 'Preview'}
                      style={{
                        width: 36, height: 36, borderRadius: '50%',
                        border: `1.5px solid ${isPlaying ? item.color : '#333'}`,
                        background: isPlaying ? `${item.color}26` : 'transparent',
                        color: isPlaying ? item.color : '#666',
                        cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        transition: 'all 150ms', flexShrink: 0,
                        fontSize: 10, touchAction: 'manipulation',
                      }}
                      onMouseEnter={e => {
                        if (!isPlaying) {
                          e.currentTarget.style.borderColor = item.color
                          e.currentTarget.style.color = item.color
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isPlaying) {
                          e.currentTarget.style.borderColor = '#333'
                          e.currentTarget.style.color = '#666'
                        }
                      }}
                    >
                      {isPlaying ? (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="5" y="4" width="5" height="16" rx="1" />
                          <rect x="14" y="4" width="5" height="16" rx="1" />
                        </svg>
                      ) : (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="6,3 20,12 6,21" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Title */}
                  <div className="bulk-cell-title">
                    <input type="text" value={item.title}
                      disabled={locked}
                      onChange={e => updateFile(item.id, { title: e.target.value })}
                      style={{ ...inp, opacity: item.status === 'success' ? 0.5 : 1 }}
                      onFocus={fo} onBlur={fb}
                      placeholder="Sound title"
                    />
                  </div>

                  {/* Slug */}
                  <div className="bulk-cell-slug" style={{ position: 'relative' }}>
                    <input type="text" value={item.slug}
                      disabled={locked}
                      onChange={e => updateFile(item.id, { slug: toSlug(e.target.value) })}
                      style={{
                        ...inp,
                        opacity: item.status === 'success' ? 0.5 : 1,
                        fontFamily: 'monospace', fontSize: 11,
                        paddingRight: 28,
                        borderColor: '#1e3a1e',
                        background: '#0f1f0f',
                        color: '#22c55e',
                      }}
                      onFocus={e => e.currentTarget.style.borderColor = '#22c55e'}
                      onBlur={e => e.currentTarget.style.borderColor = '#1e3a1e'}
                      placeholder="custom-slug"
                    />
                    <span style={{
                      position: 'absolute', right: 8, top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: 9, color: '#3a6a3a',
                    }}>slug</span>
                  </div>

                  {/* Color Picker */}
                  <div className="bulk-cell-color" style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(6, 16px)',
                      gap: 3,
                    }}>
                      {PRESET_COLORS.map(c => (
                        <button
                          key={c.value}
                          disabled={locked}
                          title={c.label}
                          onClick={() => updateFile(item.id, { color: c.value })}
                          style={{
                            width: 16, height: 16, borderRadius: '50%',
                            background: c.value,
                            border: 'none',
                            cursor: locked ? 'default' : 'pointer',
                            padding: 0, flexShrink: 0,
                            boxShadow: item.color === c.value
                              ? `0 0 0 2px #111, 0 0 0 4px ${c.value}`
                              : 'none',
                            transition: 'box-shadow 120ms',
                            opacity: locked ? 0.5 : 1,
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input
                        type="color"
                        value={item.color}
                        disabled={locked}
                        onChange={e => updateFile(item.id, { color: e.target.value })}
                        title="Custom color"
                        style={{
                          width: 28, height: 28,
                          border: '1px solid #2a2a2a', borderRadius: 4,
                          background: 'none', padding: 2,
                          cursor: locked ? 'default' : 'pointer',
                          opacity: locked ? 0.5 : 1,
                        }}
                      />
                      <code style={{ fontSize: 10, color: '#555', letterSpacing: '0.04em' }}>
                        {item.color}
                      </code>
                    </div>
                  </div>

                  {/* R2 Path preview */}
                  <div className="bulk-cell-path" style={{
                    fontSize: 10, color: '#444', fontFamily: 'monospace',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }} title={buildPath(item.slug)}>
                    {buildPath(item.slug)}
                  </div>

                  {/* Size / Status */}
                  <div className="bulk-cell-size" style={{ textAlign: 'center', fontSize: 11 }}>
                    {item.status === 'idle' && (
                      <span style={{ color: '#555' }}>{(item.file.size / 1024).toFixed(0)}KB</span>
                    )}
                    {item.status === 'uploading' && (
                      <div>
                        <div style={{ height: 4, background: '#1a1a1a', borderRadius: 2, overflow: 'hidden', marginBottom: 2 }}>
                          <div style={{ height: '100%', width: `${item.progress}%`, background: item.color, borderRadius: 2, transition: 'width 300ms' }} />
                        </div>
                        <span style={{ fontSize: 10, color: '#888' }}>{item.progress}%</span>
                      </div>
                    )}
                    {item.status === 'success' && <span style={{ color: '#22c55e', fontSize: 16 }}>✓</span>}
                    {item.status === 'error' && <span style={{ color: '#ef4444', fontSize: 11 }}>✕</span>}
                  </div>

                  {/* Remove */}
                  <div className="bulk-cell-remove" style={{ textAlign: 'center' }}>
                    {!locked && (
                      <button
                        onClick={() => {
                          if (playingId === item.id) { audioRef.current?.pause(); setPlayingId(null) }
                          URL.revokeObjectURL(item.audioUrl)
                          setFiles(p => p.filter(f => f.id !== item.id))
                        }}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: '#555', fontSize: 22, lineHeight: 1,
                          width: 36, height: 36, display: 'flex', alignItems: 'center',
                          justifyContent: 'center', borderRadius: 6,
                          touchAction: 'manipulation',
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={e => e.currentTarget.style.color = '#555'}
                      >×</button>
                    )}
                  </div>
                </div>

                {/* Error message */}
                {item.status === 'error' && item.error && (
                  <div style={{ padding: '4px 16px 8px', fontSize: 11, color: '#ef4444' }}>
                    {item.error}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Actions */}
      {files.length > 0 && (
        <div className="bulk-actions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
            <span style={{ color: '#555' }}>
              Total: <strong style={{ color: '#fff' }}>{files.length}</strong>
            </span>
            {counts.success > 0 && <span style={{ color: '#22c55e' }}>✓ {counts.success} done</span>}
            {counts.error > 0 && <span style={{ color: '#ef4444' }}>✕ {counts.error} failed</span>}
            {counts.idle > 0 && <span style={{ color: '#888' }}>⏳ {counts.idle} pending</span>}
          </div>
          <div className="bulk-action-btns" style={{ display: 'flex', gap: 10 }}>
            {counts.success > 0 && (
              <button onClick={() => setFiles(p => p.filter(f => f.status !== 'success'))}
                style={{ padding: '9px 16px', minHeight: 44, borderRadius: 8, border: '1px solid #2a2a2a', background: 'transparent', color: '#888', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)' }}>
                Clear Done
              </button>
            )}
            <button
              onClick={() => {
                files.forEach(f => URL.revokeObjectURL(f.audioUrl))
                if (audioRef.current) { audioRef.current.pause(); setPlayingId(null) }
                setFiles([])
              }}
              style={{ padding: '9px 16px', minHeight: 44, borderRadius: 8, border: '1px solid #2a1010', background: '#1a0808', color: '#ef4444', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)' }}>
              Clear All
            </button>
            <button onClick={handleUploadAll} disabled={uploading || counts.idle === 0}
              style={{
                padding: '9px 28px', minHeight: 44, borderRadius: 8, border: 'none',
                background: uploading ? '#c9a000' : '#f5c518',
                color: '#1a1400', fontSize: 14, fontWeight: 700,
                cursor: uploading || counts.idle === 0 ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font)',
                opacity: counts.idle === 0 && !uploading ? 0.5 : 1,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
              {uploading ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                    style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  Uploading...
                </>
              ) : `⬆️ Upload ${counts.idle} Sound${counts.idle !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {files.length === 0 && (
        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🎵</div>
          <p style={{ fontSize: 14, color: '#555', marginBottom: 6 }}>Set folder path → Drop MP3 files</p>
          <p style={{ fontSize: 12, color: '#333' }}>You can preview, edit slug & pick a button color before uploading</p>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Desktop: hide R2 path col at 1100px ── */
        @media (max-width: 1100px) {
          .bulk-file-header,
          .bulk-file-row {
            grid-template-columns: 36px 1fr 1fr 160px 70px 36px !important;
          }
          .bulk-cell-path { display: none !important; }
        }

        /* ── Mobile card layout ── */
        @media (max-width: 767px) {
          .folder-builder-grid {
            grid-template-columns: 1fr !important;
          }

          .bulk-file-header { display: none !important; }

          .bulk-file-row {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 10px !important;
            padding: 14px !important;
            align-items: flex-start !important;
          }

          /* Play button — left side of top row */
          .bulk-cell-play {
            flex: 0 0 auto !important;
            align-self: center !important;
          }

          /* Title — fills remaining space in top row */
          .bulk-cell-title {
            flex: 1 1 0 !important;
            min-width: 0 !important;
          }

          /* Remove — absolute top-right */
          .bulk-cell-remove {
            position: absolute !important;
            top: 10px !important;
            right: 10px !important;
            width: auto !important;
          }

          /* Slug, Color, Path, Size — full-width rows */
          .bulk-cell-slug,
          .bulk-cell-color,
          .bulk-cell-path,
          .bulk-cell-size {
            flex: 0 0 100% !important;
            width: 100% !important;
            text-align: left !important;
            white-space: normal !important;
          }

          .bulk-cell-size { font-size: 12px !important; }

          /* Actions bar — stack on mobile */
          .bulk-actions {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .bulk-action-btns {
            flex-direction: column !important;
          }
          .bulk-action-btns button {
            width: 100% !important;
            justify-content: center !important;
          }
        }
      `}</style>
    </div>
  )
}
