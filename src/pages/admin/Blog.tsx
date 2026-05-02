import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { BlogPost } from '@/lib/types'

export default function AdminBlog() {
  const [posts,    setPosts]    = useState<BlogPost[]>([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState<'all' | 'published' | 'draft'>('all')
  const [delPost,  setDelPost]  = useState<BlogPost | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState<Set<string>>(new Set())
  const navigate = useNavigate()

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('blog_posts').select('*')
      .order('created_at', { ascending: false })
    if (!error) setPosts((data ?? []) as BlogPost[])
    setLoading(false)
  }

  async function togglePublish(post: BlogPost) {
    setToggling(prev => new Set(prev).add(post.id))
    const next = !post.is_published
    const { error } = await supabase
      .from('blog_posts')
      .update({
        is_published: next,
        published_at: next ? new Date().toISOString() : null,
      })
      .eq('id', post.id)
    if (!error) {
      setPosts(prev => prev.map(p =>
        p.id === post.id ? { ...p, is_published: next } : p
      ))
    }
    setToggling(prev => { const n = new Set(prev); n.delete(post.id); return n })
  }

  async function deletePost() {
    if (!delPost) return
    setDeleting(true)
    const { error } = await supabase.from('blog_posts').delete().eq('id', delPost.id)
    if (!error) setPosts(prev => prev.filter(p => p.id !== delPost.id))
    setDeleting(false)
    setDelPost(null)
  }

  function fmtDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function timeAgo(d: string) {
    const diff = Date.now() - new Date(d).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    const days = Math.floor(h / 24)
    if (days < 30) return `${days}d ago`
    return fmtDate(d)
  }

  const published = posts.filter(p => p.is_published).length
  const drafts    = posts.length - published
  const totalViews = posts.reduce((a, p) => a + (p.views ?? 0), 0)

  const filtered = posts.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || (filter === 'published' ? p.is_published : !p.is_published)
    return matchSearch && matchFilter
  })

  return (
    <div>
      {/* ── header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 4 }}>
            Blog
          </h1>
          <p style={{ fontSize: 14, color: '#555' }}>
            {published} published · {drafts} draft{drafts !== 1 ? 's' : ''} · {totalViews.toLocaleString()} total views
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={load} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 8,
            border: '1px solid #2a2a2a', background: 'transparent',
            color: '#888', fontSize: 13, cursor: 'pointer',
            fontFamily: 'var(--font)', transition: 'all 150ms',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#888' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.18-4.49"/>
            </svg>
            Refresh
          </button>
          <button onClick={() => navigate('/admin/blog/new')} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: '#f5c518', color: '#000',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'var(--font)', transition: 'background 150ms',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#e6b800'}
            onMouseLeave={e => e.currentTarget.style.background = '#f5c518'}
          >
            + New Post
          </button>
        </div>
      </div>

      {/* ── stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        {([
          { label: 'Total Posts',  value: posts.length,             icon: '📝', color: '#f5c518' },
          { label: 'Published',    value: published,                icon: '✅', color: '#22c55e' },
          { label: 'Drafts',       value: drafts,                   icon: '📋', color: '#888'    },
          { label: 'Total Views',  value: totalViews.toLocaleString(), icon: '👁️', color: '#06b6d4' },
        ] as const).map(s => (
          <div key={s.label} style={{
            background: '#111', border: '1px solid #1e1e1e', borderRadius: 10,
            padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
            transition: 'border-color 150ms',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#2a2a2a'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e1e'}
          >
            <span style={{ fontSize: 20 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color, letterSpacing: '-0.03em' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#555' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── search + filter bar ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#555', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search posts by title..."
            style={{
              width: '100%', padding: '10px 14px 10px 36px', fontSize: 13,
              background: '#111', border: '1px solid #222', borderRadius: 9,
              color: '#fff', outline: 'none', fontFamily: 'var(--font)', boxSizing: 'border-box',
              transition: 'border-color .15s',
            }}
            onFocus={e => e.currentTarget.style.borderColor = '#f5c518'}
            onBlur={e => e.currentTarget.style.borderColor = '#222'}
          />
        </div>
        <div style={{ display: 'flex', gap: 4, background: '#111', border: '1px solid #1e1e1e', borderRadius: 9, padding: 4 }}>
          {(['all', 'published', 'draft'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500, border: 'none',
              background: filter === f ? '#1e1e1e' : 'transparent',
              color: filter === f ? '#fff' : '#555',
              cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .15s',
              textTransform: 'capitalize',
            }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── table ── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{ height: 66, borderRadius: 10, background: '#111' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          background: '#111', border: '1px solid #1e1e1e', borderRadius: 12,
          padding: '60px 24px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📝</div>
          <p style={{ color: '#fff', fontWeight: 600, marginBottom: 6 }}>
            {search || filter !== 'all' ? 'No posts match your filters' : 'No blog posts yet'}
          </p>
          <p style={{ color: '#555', fontSize: 13 }}>
            {search || filter !== 'all'
              ? 'Try adjusting your search or filter'
              : 'Click "New Post" to write your first article'}
          </p>
        </div>
      ) : (
        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 120px 80px 130px 160px',
            padding: '10px 20px',
            borderBottom: '1px solid #1a1a1a',
            fontSize: 11, color: '#555', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '.07em',
          }}>
            <span>Title</span>
            <span>Status</span>
            <span>Views</span>
            <span>Date</span>
            <span style={{ textAlign: 'right' }}>Actions</span>
          </div>

          {/* Rows */}
          <div>
            {filtered.map((post, idx) => {
              const isToggling = toggling.has(post.id)
              return (
                <div key={post.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 120px 80px 130px 160px',
                  padding: '14px 20px',
                  borderBottom: idx < filtered.length - 1 ? '1px solid #161616' : 'none',
                  alignItems: 'center',
                  transition: 'background 150ms',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#161616'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Title + slug */}
                  <div style={{ minWidth: 0, paddingRight: 16 }}>
                    <div style={{
                      fontSize: 14, fontWeight: 600, color: '#fff',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      marginBottom: 3,
                    }}>
                      {post.title}
                    </div>
                    <div style={{
                      fontSize: 11, color: '#3a3a3a',
                      fontFamily: 'monospace',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      /blog/{post.slug}
                    </div>
                  </div>

                  {/* Status badge */}
                  <div>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: post.is_published ? 'rgba(34,197,94,0.1)' : 'rgba(100,100,100,0.1)',
                      color: post.is_published ? '#22c55e' : '#666',
                    }}>
                      <span style={{
                        width: 5, height: 5, borderRadius: '50%',
                        background: post.is_published ? '#22c55e' : '#444',
                        display: 'inline-block',
                      }} />
                      {post.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  {/* Views */}
                  <span style={{ fontSize: 13, color: '#666' }}>
                    {(post.views ?? 0).toLocaleString()}
                  </span>

                  {/* Date */}
                  <div>
                    <div style={{ fontSize: 12, color: '#555' }}>
                      {timeAgo(post.published_at ?? post.created_at)}
                    </div>
                    <div style={{ fontSize: 11, color: '#333' }}>
                      {fmtDate(post.created_at)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                    {/* Publish / Unpublish */}
                    <button onClick={() => togglePublish(post)} disabled={isToggling} style={{
                      padding: '5px 11px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      border: `1px solid ${post.is_published ? '#2a2000' : '#1a2e1a'}`,
                      background: post.is_published ? '#1a1200' : '#0a1a0a',
                      color: post.is_published ? '#f5c518' : '#22c55e',
                      cursor: isToggling ? 'wait' : 'pointer',
                      fontFamily: 'var(--font)', transition: 'all 150ms', flexShrink: 0,
                    }}>
                      {isToggling ? '…' : post.is_published ? 'Unpublish' : 'Publish'}
                    </button>

                    {/* Edit */}
                    <button onClick={() => navigate(`/admin/blog/${post.id}`)} title="Edit" style={{
                      width: 30, height: 30, borderRadius: 7,
                      border: '1px solid #2a2a2a', background: 'transparent',
                      color: '#666', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 150ms', flexShrink: 0,
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#f5c518'; e.currentTarget.style.color = '#f5c518' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#666' }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>

                    {/* Delete */}
                    <button onClick={() => setDelPost(post)} title="Delete" style={{
                      width: 30, height: 30, borderRadius: 7,
                      border: '1px solid #2a1818', background: 'transparent',
                      color: '#3a2020', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 150ms', flexShrink: 0, fontSize: 16,
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#1a0808'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#3a1212' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#3a2020'; e.currentTarget.style.borderColor = '#2a1818' }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── delete confirm modal ── */}
      {delPost && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }} onClick={() => !deleting && setDelPost(null)}>
          <div style={{
            background: '#111', border: '1px solid #2a2a2a',
            borderRadius: 14, padding: '28px 26px',
            width: '100%', maxWidth: 400,
            boxShadow: '0 12px 56px rgba(0,0,0,0.75)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 32, marginBottom: 14 }}>🗑️</div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
              Delete Post?
            </h3>
            <p style={{ fontSize: 14, color: '#666', marginBottom: 24, lineHeight: 1.5 }}>
              "<span style={{ color: '#aaa' }}>{delPost.title}</span>" will be permanently deleted.
              This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDelPost(null)} disabled={deleting} style={{
                flex: 1, padding: '11px', borderRadius: 9,
                border: '1px solid #2a2a2a', background: 'transparent',
                color: '#888', fontSize: 13, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'var(--font)',
              }}>
                Cancel
              </button>
              <button onClick={deletePost} disabled={deleting} style={{
                flex: 1, padding: '11px', borderRadius: 9, border: 'none',
                background: deleting ? '#2a1212' : '#ef4444',
                color: '#fff', fontSize: 13, fontWeight: 700,
                cursor: deleting ? 'wait' : 'pointer', fontFamily: 'var(--font)',
              }}>
                {deleting ? 'Deleting…' : 'Delete Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
