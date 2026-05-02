import { useState, useEffect } from 'react'
import { supabase, updateSound } from '@/lib/supabase'
import { getCategoryMeta, CATEGORIES } from '@/lib/categories'
import type { Sound } from '@/lib/types'

const WORKER_URL = (import.meta as any).env.VITE_WORKER_URL ?? ''

type SortCol = 'title' | 'plays' | 'likes' | 'created_at'

export default function AdminSounds() {
  const [sounds,    setSounds]    = useState<Sound[]>([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [statusFil, setStatusFil] = useState<'approved'|'pending'|'rejected'>('approved')
  const [sortCol,   setSortCol]   = useState<SortCol>('plays')
  const [sortAsc,   setSortAsc]   = useState(false)
  const [editId,    setEditId]    = useState<string | null>(null)
  const [editData,  setEditData]  = useState<Partial<Sound>>({})
  const [deleteId,  setDeleteId]  = useState<string | null>(null)
  const [deleting,  setDeleting]  = useState(false)
  const [saving,    setSaving]    = useState(false)

  useEffect(() => { load() }, [statusFil])

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('sounds').select('*').eq('status', statusFil)
      .order(sortCol, { ascending: sortAsc })
    if (!error) setSounds((data ?? []) as Sound[])
    setLoading(false)
  }

  const filtered = sounds.filter(s => {
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    const matchCat    = catFilter === 'all' || s.category === catFilter
    return matchSearch && matchCat
  })

  function handleSort(col: SortCol) {
    if (sortCol === col) setSortAsc(!sortAsc)
    else { setSortCol(col); setSortAsc(false) }
  }

  function startEdit(sound: Sound) {
    setEditId(sound.id)
    setEditData({ title: sound.title, category: sound.category, tags: sound.tags, is_featured: sound.is_featured })
  }

  async function saveEdit(id: string) {
    setSaving(true)
    const ok = await updateSound(id, editData)
    if (ok) {
      setSounds(prev => prev.map(s => s.id === id ? { ...s, ...editData } : s))
      setEditId(null)
    }
    setSaving(false)
  }

  async function handleDelete(sound: Sound) {
    setDeleting(true)
    try {
      await fetch(`${WORKER_URL}/api/admin/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ soundId: sound.id, r2Key: sound.r2_key }),
      })
      setSounds(prev => prev.filter(s => s.id !== sound.id))
      setDeleteId(null)
    } finally {
      setDeleting(false)
    }
  }

  async function toggleFeature(sound: Sound) {
    const next = !sound.is_featured
    await updateSound(sound.id, { is_featured: next })
    setSounds(prev => prev.map(s => s.id === sound.id ? { ...s, is_featured: next } : s))
  }

  function fmtNum(n: number) {
    return n >= 1000 ? `${(n/1000).toFixed(1)}k` : n.toString()
  }

  function fmtDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
  }

  const SortArrow = ({ col }: { col: SortCol }) => (
    <span style={{ marginLeft: 4, opacity: sortCol === col ? 1 : 0.3, fontSize: 10 }}>
      {sortCol === col ? (sortAsc ? '↑' : '↓') : '↕'}
    </span>
  )

  const thStyle: React.CSSProperties = {
    padding: '10px 14px', textAlign: 'left',
    fontSize: 12, fontWeight: 600, color: '#555',
    textTransform: 'uppercase', letterSpacing: '0.06em',
    borderBottom: '1px solid #1a1a1a', whiteSpace: 'nowrap',
    cursor: 'pointer', userSelect: 'none',
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 4 }}>
            Sounds
          </h1>
          <p style={{ fontSize: 14, color: '#555' }}>{filtered.length} sounds shown</p>
        </div>
        <button onClick={load} style={{
          padding: '8px 14px', borderRadius: 8,
          border: '1px solid #2a2a2a', background: 'transparent',
          color: '#888', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)',
        }}>
          ↻ Refresh
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        {/* Status tabs */}
        <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #2a2a2a' }}>
          {(['approved','pending','rejected'] as const).map(s => (
            <button key={s} onClick={() => setStatusFil(s)} style={{
              padding: '8px 14px', border: 'none',
              background: statusFil === s ? '#f5c518' : '#111',
              color: statusFil === s ? '#1a1400' : '#666',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font)', textTransform: 'capitalize',
              transition: 'all 150ms',
            }}>
              {s}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round"
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search sounds..."
            style={{
              width: '100%', height: 38, paddingLeft: 32, paddingRight: 12,
              background: '#111', border: '1px solid #2a2a2a',
              borderRadius: 8, color: '#fff', fontSize: 13,
              fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box',
            }}
            onFocus={e => e.currentTarget.style.borderColor = '#f5c518'}
            onBlur={e => e.currentTarget.style.borderColor = '#2a2a2a'}
          />
        </div>

        {/* Category filter */}
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{
          height: 38, padding: '0 10px',
          background: '#111', border: '1px solid #2a2a2a',
          borderRadius: 8, color: '#888', fontSize: 13,
          fontFamily: 'var(--font)', cursor: 'pointer', outline: 'none',
        }}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{
        background: '#111', border: '1px solid #1e1e1e',
        borderRadius: 12, overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#444', fontSize: 14 }}>
            Loading sounds...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#444', fontSize: 14 }}>
            No sounds found
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle} onClick={() => handleSort('title')}>
                    Title <SortArrow col="title" />
                  </th>
                  <th style={thStyle}>Category</th>
                  <th style={{ ...thStyle, cursor: 'pointer' }} onClick={() => handleSort('plays')}>
                    Plays <SortArrow col="plays" />
                  </th>
                  <th style={thStyle} onClick={() => handleSort('likes')}>
                    Likes <SortArrow col="likes" />
                  </th>
                  <th style={thStyle}>Featured</th>
                  <th style={thStyle} onClick={() => handleSort('created_at')}>
                    Date <SortArrow col="created_at" />
                  </th>
                  <th style={{ ...thStyle, cursor: 'default' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(sound => {
                  const cat    = getCategoryMeta(sound.category)
                  const isEdit = editId === sound.id

                  return (
                    <tr key={sound.id} style={{ borderBottom: '1px solid #161616' }}
                      onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#141414'}
                      onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                    >
                      {/* Title */}
                      <td style={{ padding: '10px 14px', maxWidth: 200 }}>
                        {isEdit ? (
                          <input value={editData.title ?? ''} onChange={e => setEditData({ ...editData, title: e.target.value })}
                            style={{
                              width: '100%', height: 32, padding: '0 8px',
                              background: '#1a1a1a', border: '1px solid #f5c518',
                              borderRadius: 6, color: '#fff', fontSize: 13,
                              fontFamily: 'var(--font)', outline: 'none',
                            }}
                          />
                        ) : (
                          <div style={{
                            fontSize: 13, fontWeight: 500, color: '#fff',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            display: 'flex', alignItems: 'center', gap: 6,
                          }}>
                            {sound.is_ai_generated && (
                              <span style={{
                                fontSize: 9, padding: '1px 5px', borderRadius: 3,
                                background: '#f5c51820', color: '#f5c518', fontWeight: 700,
                              }}>AI</span>
                            )}
                            {sound.title}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td style={{ padding: '10px 14px' }}>
                        {isEdit ? (
                          <select value={editData.category ?? sound.category}
                            onChange={e => setEditData({ ...editData, category: e.target.value as Sound['category'] })}
                            style={{
                              height: 32, padding: '0 6px',
                              background: '#1a1a1a', border: '1px solid #f5c518',
                              borderRadius: 6, color: '#888', fontSize: 12,
                              fontFamily: 'var(--font)', outline: 'none',
                            }}>
                            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
                          </select>
                        ) : (
                          <span style={{
                            fontSize: 11, padding: '2px 8px', borderRadius: 'var(--r-full)',
                            background: `${cat.color}18`, color: cat.color, fontWeight: 600,
                          }}>
                            {cat.emoji} {cat.label}
                          </span>
                        )}
                      </td>

                      {/* Plays */}
                      <td style={{ padding: '10px 14px', fontSize: 13, color: '#888', fontFamily: 'var(--font-mono)' }}>
                        {fmtNum(sound.plays)}
                      </td>

                      {/* Likes */}
                      <td style={{ padding: '10px 14px', fontSize: 13, color: '#888', fontFamily: 'var(--font-mono)' }}>
                        {fmtNum(sound.likes)}
                      </td>

                      {/* Featured */}
                      <td style={{ padding: '10px 14px' }}>
                        <button onClick={() => toggleFeature(sound)} style={{
                          background: 'none', border: 'none',
                          cursor: 'pointer', fontSize: 16,
                          opacity: sound.is_featured ? 1 : 0.25,
                          transition: 'opacity 150ms',
                        }} title={sound.is_featured ? 'Remove from featured' : 'Add to featured'}>
                          ⭐
                        </button>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '10px 14px', fontSize: 12, color: '#555', whiteSpace: 'nowrap' }}>
                        {fmtDate(sound.created_at)}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {isEdit ? (
                            <>
                              <button onClick={() => saveEdit(sound.id)} disabled={saving} style={{
                                padding: '5px 12px', borderRadius: 6, border: 'none',
                                background: '#22c55e', color: '#fff',
                                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                fontFamily: 'var(--font)',
                              }}>
                                {saving ? '...' : 'Save'}
                              </button>
                              <button onClick={() => setEditId(null)} style={{
                                padding: '5px 10px', borderRadius: 6,
                                border: '1px solid #2a2a2a', background: 'transparent',
                                color: '#888', fontSize: 12, cursor: 'pointer',
                                fontFamily: 'var(--font)',
                              }}>
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEdit(sound)} style={{
                                padding: '5px 10px', borderRadius: 6,
                                border: '1px solid #2a2a2a', background: 'transparent',
                                color: '#888', fontSize: 12, cursor: 'pointer',
                                fontFamily: 'var(--font)', transition: 'all 150ms',
                              }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = '#fff' }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#888' }}
                              >
                                ✏️ Edit
                              </button>
                              <button onClick={() => setDeleteId(sound.id)} style={{
                                padding: '5px 10px', borderRadius: 6,
                                border: '1px solid #2a1010', background: '#1a0808',
                                color: '#ef4444', fontSize: 12, cursor: 'pointer',
                                fontFamily: 'var(--font)', transition: 'all 150ms',
                              }}>
                                🗑️
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {deleteId && (() => {
        const sound = sounds.find(s => s.id === deleteId)
        if (!sound) return null
        return (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }} onClick={() => setDeleteId(null)}>
            <div style={{
              background: '#111', border: '1px solid #2a2a2a',
              borderRadius: 14, padding: '28px 24px',
              maxWidth: 380, width: '100%',
            }} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>🗑️</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 8, letterSpacing: '-0.02em' }}>
                Delete Sound?
              </h3>
              <p style={{ fontSize: 13, color: '#666', marginBottom: 20, lineHeight: 1.6 }}>
                "{sound.title}" will be permanently deleted from the database and R2 storage. This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setDeleteId(null)} style={{
                  flex: 1, padding: '10px', borderRadius: 8,
                  border: '1px solid #2a2a2a', background: 'transparent',
                  color: '#888', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)',
                }}>
                  Cancel
                </button>
                <button onClick={() => handleDelete(sound)} disabled={deleting} style={{
                  flex: 1, padding: '10px', borderRadius: 8,
                  border: 'none', background: '#ef4444',
                  color: '#fff', fontSize: 13, fontWeight: 700,
                  cursor: deleting ? 'wait' : 'pointer', fontFamily: 'var(--font)',
                }}>
                  {deleting ? 'Deleting...' : 'Delete Forever'}
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
