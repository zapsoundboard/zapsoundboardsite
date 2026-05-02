import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { CATEGORIES } from '@/lib/categories'

// ─── types ───────────────────────────────────────────────────────────────────

interface DbCat {
  id:          string
  name:        string
  slug:        string
  emoji:       string
  color:       string
  description: string
  is_active:   boolean
}

interface SubCat {
  id:              string
  name:            string
  slug:            string
  parent_category: string
}

interface DisplayCat {
  id:        string
  name:      string
  slug:      string
  emoji:     string
  color:     string
  is_active: boolean
  is_custom: boolean
}

// ─── constants ────────────────────────────────────────────────────────────────

const STATIC_IDS = new Set(CATEGORIES.map(c => c.id))

const COLOR_PRESETS = ['#f5c518','#ef4444','#22c55e','#3b82f6','#a855f7','#f97316','#ec4899','#06b6d4']

const BLANK_FORM = { emoji: '🔊', name: '', slug: '', description: '', color: '#f5c518', is_active: true }
const BLANK_SUB  = { name: '', slug: '' }

// ─── helpers ──────────────────────────────────────────────────────────────────

function toSlug(s: string) {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
    .replace(/-+/g, '-').replace(/^-|-$/g, '')
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <div onClick={onChange} style={{
      width: 38, height: 22, borderRadius: 11, flexShrink: 0,
      background: on ? '#f5c518' : '#2a2a2a',
      cursor: 'pointer', position: 'relative', transition: 'background .18s',
    }}>
      <div style={{
        width: 16, height: 16, borderRadius: '50%',
        background: on ? '#000' : '#666',
        position: 'absolute', top: 3,
        left: on ? 19 : 3, transition: 'left .18s',
      }} />
    </div>
  )
}

// ─── shared style objects ─────────────────────────────────────────────────────

const INPUT: React.CSSProperties = {
  width: '100%', padding: '9px 12px', fontSize: 13,
  background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8,
  color: '#fff', outline: 'none', fontFamily: 'var(--font)', boxSizing: 'border-box',
}
const LBL: React.CSSProperties = {
  fontSize: 12, color: '#666', display: 'block', marginBottom: 5, fontWeight: 500,
}

// ─── component ────────────────────────────────────────────────────────────────

export default function AdminCategories() {
  const [soundCounts, setSoundCounts] = useState<Record<string, number>>({})
  const [dbMap,       setDbMap]       = useState<Record<string, DbCat>>({})
  const [customCats,  setCustomCats]  = useState<DbCat[]>([])
  const [subcats,     setSubcats]     = useState<SubCat[]>([])
  const [loading,     setLoading]     = useState(true)
  const [expandedId,  setExpandedId]  = useState<string | null>(null)
  const [showModal,   setShowModal]   = useState(false)
  const [editCat,     setEditCat]     = useState<DbCat | null>(null)
  const [addSubFor,   setAddSubFor]   = useState<string | null>(null)
  const [saving,      setSaving]      = useState(false)
  const [form,        setForm]        = useState({ ...BLANK_FORM })
  const [subForm,     setSubForm]     = useState({ ...BLANK_SUB })

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const [
        { data: catData },
        { data: subData },
        { data: soundData },
      ] = await Promise.all([
        supabase.from('categories').select('*'),
        supabase.from('subcategories').select('*').order('name'),
        supabase.from('sounds').select('category').eq('status', 'approved'),
      ])

      const map: Record<string, DbCat> = {}
      const custom: DbCat[] = []
      for (const row of (catData ?? []) as DbCat[]) {
        map[row.id] = row
        if (!STATIC_IDS.has(row.id)) custom.push(row)
      }
      setDbMap(map)
      setCustomCats(custom)
      setSubcats((subData ?? []) as SubCat[])

      const counts: Record<string, number> = {}
      for (const { category } of soundData ?? []) {
        counts[category] = (counts[category] ?? 0) + 1
      }
      setSoundCounts(counts)
    } finally {
      setLoading(false)
    }
  }

  // Build combined display list: 16 static + custom
  const allCats: DisplayCat[] = [
    ...CATEGORIES.map(c => ({
      id:        c.id,
      name:      c.label,
      slug:      c.slug,
      emoji:     c.emoji,
      color:     c.color,
      is_active: dbMap[c.id]?.is_active ?? true,
      is_custom: false,
    })),
    ...customCats.map(c => ({
      id:        c.id,
      name:      c.name,
      slug:      c.slug,
      emoji:     c.emoji,
      color:     c.color,
      is_active: c.is_active ?? true,
      is_custom: true,
    })),
  ]

  // ── toggle active ────────────────────────────────────────────────────────

  async function toggleActive(catId: string, currentActive: boolean) {
    const next = !currentActive
    if (dbMap[catId]) {
      await supabase.from('categories').update({ is_active: next }).eq('id', catId)
    } else {
      const staticMeta = CATEGORIES.find(c => c.id === catId)!
      await supabase.from('categories').upsert({
        id:          staticMeta.id,
        name:        staticMeta.label,
        slug:        staticMeta.slug,
        emoji:       staticMeta.emoji,
        color:       staticMeta.color,
        description: staticMeta.description,
        is_active:   next,
      })
    }
    setDbMap(prev => ({
      ...prev,
      [catId]: {
        ...(prev[catId] ?? { id: catId, name: '', slug: catId, emoji: '', color: '', description: '' }),
        is_active: next,
      },
    }))
  }

  // ── save category (add / edit) ────────────────────────────────────────────

  async function saveCategory() {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const payload: Omit<DbCat, 'id'> = {
        name:        form.name.trim(),
        slug:        form.slug.trim() || toSlug(form.name),
        emoji:       form.emoji,
        color:       form.color,
        description: form.description.trim(),
        is_active:   form.is_active,
      }
      if (editCat) {
        await supabase.from('categories').update(payload).eq('id', editCat.id)
        const updated = { ...editCat, ...payload }
        setDbMap(prev  => ({ ...prev, [editCat.id]: updated }))
        setCustomCats(prev => prev.map(c => c.id === editCat.id ? updated : c))
      } else {
        const id = toSlug(form.name) + '-' + Date.now().toString(36)
        const { error } = await supabase.from('categories').insert({ id, ...payload })
        if (!error) {
          const newCat: DbCat = { id, ...payload }
          setDbMap(prev => ({ ...prev, [id]: newCat }))
          setCustomCats(prev => [...prev, newCat])
        }
      }
      closeModal()
    } finally {
      setSaving(false)
    }
  }

  function closeModal() { setShowModal(false); setEditCat(null); setForm({ ...BLANK_FORM }) }

  function openAdd() { setForm({ ...BLANK_FORM }); setEditCat(null); setShowModal(true) }

  function openEdit(cat: DbCat) {
    setForm({ emoji: cat.emoji, name: cat.name, slug: cat.slug, description: cat.description, color: cat.color, is_active: cat.is_active })
    setEditCat(cat)
    setShowModal(true)
  }

  // ── subcategories ─────────────────────────────────────────────────────────

  async function saveSubcategory() {
    if (!subForm.name.trim() || !addSubFor) return
    setSaving(true)
    try {
      const payload = {
        name:            subForm.name.trim(),
        slug:            subForm.slug.trim() || toSlug(subForm.name),
        parent_category: addSubFor,
      }
      const { data, error } = await supabase.from('subcategories').insert(payload).select().single()
      if (!error && data) setSubcats(prev => [...prev, data as SubCat])
      setAddSubFor(null)
      setSubForm({ ...BLANK_SUB })
    } finally {
      setSaving(false)
    }
  }

  async function deleteSubcat(id: string) {
    if (!window.confirm('Delete this subcategory?')) return
    await supabase.from('subcategories').delete().eq('id', id)
    setSubcats(prev => prev.filter(s => s.id !== id))
  }

  // ── stats ─────────────────────────────────────────────────────────────────

  const activeCount   = allCats.filter(c => c.is_active).length
  const inactiveCount = allCats.length - activeCount
  const withSounds    = Object.keys(soundCounts).filter(k => soundCounts[k] > 0).length
  const totalSounds   = Object.values(soundCounts).reduce((a, b) => a + b, 0)

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div>

      {/* ── header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 4 }}>
            Categories
          </h1>
          <p style={{ fontSize: 14, color: '#555' }}>
            {CATEGORIES.length} built-in · {customCats.length} custom · {totalSounds.toLocaleString()} sounds
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={loadAll} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 8,
            border: '1px solid #2a2a2a', background: 'transparent',
            color: '#888', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all 150ms',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#888' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.18-4.49"/>
            </svg>
            Refresh
          </button>
          <button onClick={openAdd} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: '#f5c518', color: '#000',
            fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
            transition: 'background 150ms',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#e6b800'}
            onMouseLeave={e => e.currentTarget.style.background = '#f5c518'}
          >
            + Add Category
          </button>
        </div>
      </div>

      {/* ── stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: 12, marginBottom: 24 }}>
        {([
          { label: 'Total',       value: allCats.length, icon: '📂', color: '#f5c518' },
          { label: 'Active',      value: activeCount,    icon: '✅', color: '#22c55e' },
          { label: 'Inactive',    value: inactiveCount,  icon: '⏸️', color: '#ef4444' },
          { label: 'With Sounds', value: withSounds,     icon: '🎵', color: '#a855f7' },
        ] as const).map(s => (
          <div key={s.label} style={{
            background: '#111', border: '1px solid #1e1e1e', borderRadius: 10,
            padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 22 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: '-0.03em' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#555' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── category list ── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 74, borderRadius: 12, background: '#111' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {allCats.map(cat => {
            const subs   = subcats.filter(s => s.parent_category === cat.id)
            const isOpen = expandedId === cat.id
            const count  = soundCounts[cat.id] ?? 0

            return (
              <div key={cat.id} style={{
                background: '#111',
                border: `1px solid ${isOpen ? '#2a2a2a' : '#1e1e1e'}`,
                borderRadius: 12, overflow: 'hidden',
                opacity: cat.is_active ? 1 : 0.55,
                transition: 'opacity .2s, border-color .15s',
              }}>

                {/* ── card row ── */}
                <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>

                  {/* emoji badge */}
                  <div style={{
                    width: 46, height: 46, borderRadius: 10, flexShrink: 0,
                    background: `${cat.color}18`, border: `1px solid ${cat.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                  }}>
                    {cat.emoji}
                  </div>

                  {/* info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{cat.name}</span>
                      {cat.is_custom && (
                        <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: '#1e1e1e', color: '#666', fontWeight: 600 }}>
                          custom
                        </span>
                      )}
                      {subs.length > 0 && (
                        <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: '#181818', color: '#555' }}>
                          {subs.length} sub{subs.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: '#3a3a3a', fontFamily: 'monospace' }}>/{cat.slug}</span>
                      <span style={{
                        fontSize: 11, padding: '1px 8px', borderRadius: 20, fontWeight: 600,
                        background: `${cat.color}18`, color: cat.color,
                      }}>
                        {count.toLocaleString()} sounds
                      </span>
                      {!cat.is_active && (
                        <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 20, background: '#1a0a0a', color: '#ef4444', fontWeight: 600 }}>
                          inactive
                        </span>
                      )}
                    </div>
                  </div>

                  {/* actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <Toggle on={cat.is_active} onChange={() => toggleActive(cat.id, cat.is_active)} />

                    {cat.is_custom && (
                      <button onClick={() => openEdit(dbMap[cat.id])} style={{
                        width: 30, height: 30, borderRadius: 7,
                        border: '1px solid #272727', background: 'transparent',
                        color: '#555', cursor: 'pointer', fontSize: 15,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all .15s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#f5c518'; e.currentTarget.style.color = '#f5c518' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#272727'; e.currentTarget.style.color = '#555' }}
                        title="Edit"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                    )}

                    <button onClick={() => setExpandedId(isOpen ? null : cat.id)} style={{
                      width: 30, height: 30, borderRadius: 7,
                      border: '1px solid #272727', background: 'transparent',
                      color: '#555', cursor: 'pointer', fontSize: 12,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all .15s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = '#aaa' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#272727'; e.currentTarget.style.color = '#555' }}
                      title={isOpen ? 'Collapse' : 'Expand subcategories'}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                        style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .18s' }}>
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* ── expanded: subcategories ── */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid #181818', padding: '16px 18px', background: '#0d0d0d' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '.07em' }}>
                        Subcategories {subs.length > 0 && `(${subs.length})`}
                      </span>
                      {addSubFor !== cat.id && (
                        <button onClick={() => { setAddSubFor(cat.id); setSubForm({ ...BLANK_SUB }) }} style={{
                          fontSize: 12, padding: '4px 12px', borderRadius: 6,
                          border: '1px solid #2a2a2a', background: 'transparent',
                          color: '#888', cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .15s',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = '#f5c518'; e.currentTarget.style.color = '#f5c518' }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#888' }}
                        >
                          + Add Sub
                        </button>
                      )}
                    </div>

                    {subs.length === 0 && addSubFor !== cat.id && (
                      <div style={{ fontSize: 13, color: '#2a2a2a', textAlign: 'center', padding: '14px 0 6px' }}>
                        No subcategories yet — add one below
                      </div>
                    )}

                    {subs.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: addSubFor === cat.id ? 12 : 0 }}>
                        {subs.map(sub => (
                          <div key={sub.id} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '8px 12px', borderRadius: 8,
                            border: '1px solid #1e1e1e', background: '#111',
                          }}>
                            <div style={{
                              width: 6, height: 6, borderRadius: '50%',
                              background: cat.color, flexShrink: 0,
                            }} />
                            <div style={{ flex: 1 }}>
                              <span style={{ fontSize: 13, color: '#ccc', fontWeight: 500 }}>{sub.name}</span>
                              <span style={{ fontSize: 11, color: '#3a3a3a', marginLeft: 8, fontFamily: 'monospace' }}>/{sub.slug}</span>
                            </div>
                            <button onClick={() => deleteSubcat(sub.id)} style={{
                              width: 26, height: 26, borderRadius: 6,
                              border: '1px solid #2a1818', background: 'transparent',
                              color: '#3a1818', cursor: 'pointer', fontSize: 16,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all .15s',
                            }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#1a0808'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#3a1212' }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#3a1818'; e.currentTarget.style.borderColor = '#2a1818' }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* add subcategory inline form */}
                    {addSubFor === cat.id && (
                      <div style={{
                        background: '#111', border: '1px solid #2a2a2a',
                        borderRadius: 10, padding: '14px 16px',
                      }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.07em' }}>
                          New Subcategory
                        </div>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                          <div style={{ flex: '1 1 150px' }}>
                            <label style={LBL}>Name *</label>
                            <input
                              value={subForm.name}
                              onChange={e => setSubForm(p => ({ ...p, name: e.target.value, slug: toSlug(e.target.value) }))}
                              placeholder="Hip Hop"
                              style={INPUT}
                              autoFocus
                            />
                          </div>
                          <div style={{ flex: '1 1 130px' }}>
                            <label style={LBL}>Slug</label>
                            <input
                              value={subForm.slug}
                              onChange={e => setSubForm(p => ({ ...p, slug: e.target.value }))}
                              placeholder="hip-hop"
                              style={{ ...INPUT, fontFamily: 'monospace', color: '#999' }}
                            />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => { setAddSubFor(null); setSubForm({ ...BLANK_SUB }) }} style={{
                            padding: '7px 14px', borderRadius: 7,
                            border: '1px solid #2a2a2a', background: 'transparent',
                            color: '#666', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font)',
                          }}>
                            Cancel
                          </button>
                          <button onClick={saveSubcategory} disabled={saving || !subForm.name.trim()} style={{
                            padding: '7px 18px', borderRadius: 7, border: 'none',
                            background: (!subForm.name.trim() || saving) ? '#1e1e1e' : '#f5c518',
                            color: (!subForm.name.trim() || saving) ? '#444' : '#000',
                            fontSize: 12, fontWeight: 700,
                            cursor: (!subForm.name.trim() || saving) ? 'not-allowed' : 'pointer',
                            fontFamily: 'var(--font)',
                          }}>
                            {saving ? 'Saving…' : 'Save Subcategory'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── add / edit modal ── */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }} onClick={closeModal}>
          <div style={{
            background: '#111', border: '1px solid #2a2a2a',
            borderRadius: 14, padding: '28px 26px',
            width: '100%', maxWidth: 460,
            boxShadow: '0 12px 56px rgba(0,0,0,0.75)',
          }} onClick={e => e.stopPropagation()}>

            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 20 }}>
              {editCat ? 'Edit Category' : 'Add Custom Category'}
            </h3>

            {/* emoji + name row */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 76 }}>
                <label style={LBL}>Emoji</label>
                <input
                  value={form.emoji}
                  onChange={e => setForm(p => ({ ...p, emoji: e.target.value }))}
                  style={{ ...INPUT, textAlign: 'center', fontSize: 22 }}
                  maxLength={4}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={LBL}>Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value, slug: toSlug(e.target.value) }))}
                  placeholder="Category name"
                  style={INPUT}
                  autoFocus
                />
              </div>
            </div>

            {/* slug */}
            <div style={{ marginBottom: 14 }}>
              <label style={LBL}>Slug</label>
              <input
                value={form.slug}
                onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                placeholder="auto-generated from name"
                style={{ ...INPUT, fontFamily: 'monospace', color: '#999' }}
              />
            </div>

            {/* description */}
            <div style={{ marginBottom: 16 }}>
              <label style={LBL}>Description</label>
              <input
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Brief description"
                style={INPUT}
              />
            </div>

            {/* color */}
            <div style={{ marginBottom: 18 }}>
              <label style={LBL}>Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 10 }}>
                {COLOR_PRESETS.map(c => (
                  <div key={c} onClick={() => setForm(p => ({ ...p, color: c }))} style={{
                    width: 26, height: 26, borderRadius: '50%', background: c,
                    cursor: 'pointer', boxSizing: 'border-box', transition: 'border .15s',
                    border: form.color === c ? '3px solid #fff' : '3px solid transparent',
                  }} />
                ))}
                <input
                  type="color" value={form.color}
                  onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                  style={{ width: 26, height: 26, padding: 0, border: 'none', borderRadius: '50%', cursor: 'pointer', background: 'transparent' }}
                  title="Custom color"
                />
                <span style={{ fontSize: 11, color: '#555', fontFamily: 'monospace' }}>{form.color}</span>
              </div>
              {/* preview pill */}
              <div style={{
                padding: '8px 14px', borderRadius: 8,
                background: `${form.color}14`, border: `1px solid ${form.color}28`,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 18 }}>{form.emoji || '🔊'}</span>
                <span style={{ fontSize: 13, color: form.color, fontWeight: 600 }}>
                  {form.name || 'Category Preview'}
                </span>
              </div>
            </div>

            {/* active toggle */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 24, padding: '12px 14px',
              background: '#0d0d0d', borderRadius: 9, border: '1px solid #1e1e1e',
            }}>
              <div>
                <div style={{ fontSize: 13, color: '#ccc', fontWeight: 500 }}>Active</div>
                <div style={{ fontSize: 11, color: '#555' }}>Visible to users on the site</div>
              </div>
              <Toggle on={form.is_active} onChange={() => setForm(p => ({ ...p, is_active: !p.is_active }))} />
            </div>

            {/* buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={closeModal} style={{
                flex: 1, padding: '11px', borderRadius: 9,
                border: '1px solid #2a2a2a', background: 'transparent',
                color: '#888', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font)',
              }}>
                Cancel
              </button>
              <button onClick={saveCategory} disabled={saving || !form.name.trim()} style={{
                flex: 2, padding: '11px', borderRadius: 9, border: 'none',
                background: (!form.name.trim() || saving) ? '#1e1e1e' : '#f5c518',
                color: (!form.name.trim() || saving) ? '#444' : '#000',
                fontSize: 13, fontWeight: 700,
                cursor: (!form.name.trim() || saving) ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font)', transition: 'background .15s',
              }}>
                {saving ? 'Saving…' : editCat ? 'Save Changes' : 'Create Category'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
