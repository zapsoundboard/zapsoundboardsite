import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAdminStore } from '@/store'
import type { BlogPost } from '@/lib/types'

// ─── slug helper ──────────────────────────────────────────────────────────────

function toSlug(s: string) {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
    .replace(/-+/g, '-').replace(/^-|-$/g, '')
}

// ─── markdown renderer (no external lib) ─────────────────────────────────────

function renderMarkdown(raw: string): string {
  let s = raw
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // fenced code blocks
  s = s.replace(/```([\s\S]*?)```/g, (_, code) =>
    `<pre style="background:#0d0d0d;border:1px solid #2a2a2a;padding:14px 16px;border-radius:8px;overflow-x:auto;margin:16px 0;"><code style="font-size:12px;color:#ccc;font-family:monospace;line-height:1.6;">${code.replace(/^\n/, '')}</code></pre>`
  )

  // headings
  s = s
    .replace(/^### (.+)$/gm, '<h3 style="font-size:15px;font-weight:700;color:#fff;margin:20px 0 8px;">$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2 style="font-size:18px;font-weight:700;color:#fff;margin:24px 0 10px;padding-bottom:6px;border-bottom:1px solid #1e1e1e;">$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1 style="font-size:22px;font-weight:800;color:#fff;margin:28px 0 12px;letter-spacing:-0.02em;">$1</h1>')

  // bold + italic combos
  s = s
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g,     '<strong style="color:#fff;font-weight:700;">$1</strong>')
    .replace(/\*(.+?)\*/g,         '<em>$1</em>')
    .replace(/_(.+?)_/g,           '<em>$1</em>')

  // inline code
  s = s.replace(/`([^`]+)`/g,
    '<code style="background:#1a1a1a;border:1px solid #2a2a2a;padding:1px 6px;border-radius:4px;font-size:12px;font-family:monospace;color:#f5c518;">$1</code>'
  )

  // links
  s = s.replace(/\[(.+?)\]\((.+?)\)/g,
    '<a href="$2" style="color:#f5c518;text-decoration:underline;text-underline-offset:2px;" target="_blank" rel="noopener">$1</a>'
  )

  // horizontal rule
  s = s.replace(/^---$/gm,
    '<hr style="border:none;border-top:1px solid #2a2a2a;margin:24px 0;">'
  )

  // blockquote
  s = s.replace(/^> (.+)$/gm,
    '<blockquote style="border-left:3px solid #f5c518;margin:12px 0;padding:8px 14px;background:#1a1400;border-radius:0 6px 6px 0;color:#aaa;font-style:italic;">$1</blockquote>'
  )

  // lists
  s = s.replace(/^[-*] (.+)$/gm, '<li style="margin:5px 0;padding-left:2px;">$1</li>')
  s = s.replace(/^\d+\. (.+)$/gm, '<li style="margin:5px 0;padding-left:2px;">$1</li>')
  s = s.replace(/(<li[^>]*>[\s\S]+?<\/li>(\n|$))+/g, m =>
    `<ul style="padding-left:22px;margin:12px 0;color:#ccc;">${m}</ul>`
  )

  // paragraphs — split on blank lines
  const blocks = s.split(/\n\n+/)
  s = blocks.map(block => {
    const trimmed = block.trim()
    if (!trimmed) return ''
    if (/^<(h[1-6]|pre|ul|ol|blockquote|hr)/.test(trimmed)) return trimmed
    return `<p style="margin:12px 0;line-height:1.75;color:#ccc;">${trimmed.replace(/\n/g, '<br>')}</p>`
  }).join('\n')

  return s
}

// ─── component ────────────────────────────────────────────────────────────────

const BLANK = { title: '', slug: '', excerpt: '', cover_image: '', tags: '', content: '' }

export default function BlogEditor() {
  const { id }   = useParams<{ id: string }>()
  const isNew    = !id || id === 'new'
  const navigate = useNavigate()
  const { user } = useAdminStore()

  const [form,    setForm]    = useState({ ...BLANK })
  const [loading, setLoading] = useState(!isNew)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [tab,     setTab]     = useState<'write' | 'preview'>('write')

  useEffect(() => {
    if (!isNew) loadPost()
  }, [id])

  async function loadPost() {
    setLoading(true)
    const { data, error } = await supabase
      .from('blog_posts').select('*').eq('id', id).single()
    if (!error && data) {
      const p = data as BlogPost
      setForm({
        title:       p.title,
        slug:        p.slug,
        excerpt:     p.excerpt ?? '',
        cover_image: p.cover_image ?? '',
        tags:        (p.tags ?? []).join(', '),
        content:     p.content,
      })
    }
    setLoading(false)
  }

  function field<K extends keyof typeof BLANK>(key: K, val: string) {
    setForm(prev => ({
      ...prev,
      [key]: val,
      ...(key === 'title' ? { slug: toSlug(val) } : {}),
    }))
  }

  async function save(publish: boolean) {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      const tags    = form.tags.split(',').map(t => t.trim()).filter(Boolean)
      const slug    = form.slug.trim() || toSlug(form.title)
      const payload = {
        title:        form.title.trim(),
        slug,
        excerpt:      form.excerpt.trim(),
        cover_image:  form.cover_image.trim() || null,
        tags,
        content:      form.content,
        is_published: publish,
        published_at: publish ? new Date().toISOString() : null,
        author_id:    user?.id ?? 'admin',
      }
      if (isNew) {
        const { data, error } = await supabase
          .from('blog_posts').insert(payload).select().single()
        if (!error && data) {
          setSaved(true)
          navigate(`/admin/blog/${(data as BlogPost).id}`, { replace: true })
        }
      } else {
        const { error } = await supabase
          .from('blog_posts').update(payload).eq('id', id)
        if (!error) {
          setSaved(true)
          setTimeout(() => setSaved(false), 2500)
        }
      }
    } finally {
      setSaving(false)
    }
  }

  // ── computed ──
  const seoSlug    = form.slug || toSlug(form.title)
  const titleLen   = form.title.length
  const excerptLen = form.excerpt.length
  const wordCount  = form.content.split(/\s+/).filter(Boolean).length
  const readMins   = Math.max(1, Math.ceil(wordCount / 200))

  const titleOk   = titleLen >= 30 && titleLen <= 60
  const excerptOk = excerptLen >= 80 && excerptLen <= 160

  const INPUT: React.CSSProperties = {
    width: '100%', padding: '10px 14px', fontSize: 13,
    background: '#1a1a1a', border: '1px solid #222', borderRadius: 8,
    color: '#fff', outline: 'none', fontFamily: 'var(--font)',
    boxSizing: 'border-box', transition: 'border-color .15s',
  }
  const LBL: React.CSSProperties = {
    fontSize: 11, color: '#666', display: 'block', marginBottom: 5,
    fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em',
  }

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ height: 36, width: 240, borderRadius: 8, background: '#111', marginBottom: 24 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[60, 44, 90, 500].map((h, i) => (
              <div key={i} className="skeleton" style={{ height: h, borderRadius: 8, background: '#111' }} />
            ))}
          </div>
          <div>
            <div className="skeleton" style={{ height: 200, borderRadius: 12, background: '#111' }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* ── header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/admin/blog')} style={{
            width: 34, height: 34, borderRadius: 8,
            border: '1px solid #2a2a2a', background: 'transparent',
            color: '#666', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all .15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#666' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 2 }}>
              {isNew ? 'New Post' : 'Edit Post'}
            </h1>
            <p style={{ fontSize: 12, color: '#555' }}>
              {form.content.length.toLocaleString()} chars · {wordCount.toLocaleString()} words · ~{readMins} min read
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {saved && (
            <span style={{ fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              Saved
            </span>
          )}
          <button onClick={() => save(false)} disabled={saving || !form.title.trim()} style={{
            padding: '8px 16px', borderRadius: 8,
            border: '1px solid #2a2a2a', background: 'transparent',
            color: (!form.title.trim() || saving) ? '#333' : '#888',
            fontSize: 13, fontWeight: 500,
            cursor: (!form.title.trim() || saving) ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font)', transition: 'all .15s',
          }}
            onMouseEnter={e => { if (form.title.trim() && !saving) { e.currentTarget.style.borderColor = '#555'; e.currentTarget.style.color = '#fff' }}}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#888' }}
          >
            Save Draft
          </button>
          <button onClick={() => save(true)} disabled={saving || !form.title.trim()} style={{
            padding: '8px 20px', borderRadius: 8, border: 'none',
            background: (!form.title.trim() || saving) ? '#1e1e1e' : '#f5c518',
            color: (!form.title.trim() || saving) ? '#444' : '#000',
            fontSize: 13, fontWeight: 700,
            cursor: (!form.title.trim() || saving) ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font)', transition: 'background .15s',
          }}>
            {saving ? 'Saving…' : isNew ? '⚡ Publish' : '⚡ Update & Publish'}
          </button>
        </div>
      </div>

      {/* ── two-column layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

        {/* ── left: main editor ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Title */}
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: '18px 20px' }}>
            <label style={LBL}>Title *</label>
            <input
              value={form.title}
              onChange={e => field('title', e.target.value)}
              placeholder="Write an engaging title…"
              style={{ ...INPUT, fontSize: 17, fontWeight: 600, padding: '11px 14px' }}
              onFocus={e => e.currentTarget.style.borderColor = '#f5c518'}
              onBlur={e => e.currentTarget.style.borderColor = '#222'}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: 11, color: titleLen > 60 ? '#ef4444' : titleLen >= 30 ? '#22c55e' : '#555' }}>
                {titleLen > 60 ? '⚠ Too long' : titleLen >= 30 ? '✓ Good length' : 'Aim for 30–60 characters'}
              </span>
              <span style={{ fontSize: 11, color: '#444' }}>{titleLen}/60</span>
            </div>

            {/* Slug row */}
            <div style={{ marginTop: 14 }}>
              <label style={LBL}>Slug</label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#1a1a1a', border: '1px solid #222', borderRadius: 8, overflow: 'hidden' }}>
                <span style={{ padding: '10px 10px 10px 14px', fontSize: 12, color: '#444', whiteSpace: 'nowrap', borderRight: '1px solid #222' }}>
                  /blog/
                </span>
                <input
                  value={form.slug}
                  onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                  placeholder="auto-generated"
                  style={{
                    flex: 1, padding: '10px 12px', fontSize: 12,
                    background: 'transparent', border: 'none',
                    color: '#999', outline: 'none', fontFamily: 'monospace',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Excerpt */}
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: '18px 20px' }}>
            <label style={LBL}>Excerpt / Meta Description</label>
            <textarea
              value={form.excerpt}
              onChange={e => field('excerpt', e.target.value)}
              placeholder="A brief summary shown in search results and post cards…"
              rows={3}
              style={{ ...INPUT, resize: 'vertical', lineHeight: 1.6 }}
              onFocus={e => e.currentTarget.style.borderColor = '#f5c518'}
              onBlur={e => e.currentTarget.style.borderColor = '#222'}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: 11, color: excerptLen > 160 ? '#ef4444' : excerptLen >= 80 ? '#22c55e' : '#555' }}>
                {excerptLen > 160 ? '⚠ Too long' : excerptLen >= 80 ? '✓ Good length' : 'Aim for 80–160 characters'}
              </span>
              <span style={{ fontSize: 11, color: '#444' }}>{excerptLen}/160</span>
            </div>
          </div>

          {/* Content editor */}
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, overflow: 'hidden' }}>
            {/* Tab bar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 20px', borderBottom: '1px solid #1a1a1a',
            }}>
              <label style={{ ...LBL, margin: 0 }}>Content</label>
              <div style={{ display: 'flex', gap: 2, background: '#0d0d0d', borderRadius: 7, padding: 3 }}>
                {(['write', 'preview'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)} style={{
                    padding: '5px 14px', borderRadius: 5, fontSize: 12, fontWeight: 500, border: 'none',
                    background: tab === t ? '#1e1e1e' : 'transparent',
                    color: tab === t ? '#fff' : '#555',
                    cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .12s',
                    textTransform: 'capitalize',
                  }}>
                    {t === 'write' ? '✏️ Write' : '👁 Preview'}
                  </button>
                ))}
              </div>
            </div>

            {/* Markdown toolbar hints */}
            {tab === 'write' && (
              <div style={{
                display: 'flex', gap: 8, padding: '8px 20px',
                borderBottom: '1px solid #161616', flexWrap: 'wrap',
              }}>
                {[
                  ['#', 'Heading'],
                  ['**B**', 'Bold'],
                  ['*I*', 'Italic'],
                  ['`code`', 'Code'],
                  ['[link](url)', 'Link'],
                  ['> text', 'Quote'],
                  ['- item', 'List'],
                  ['---', 'Divider'],
                ].map(([syntax, hint]) => (
                  <span key={hint} title={hint} style={{
                    fontSize: 11, color: '#444', fontFamily: 'monospace',
                    padding: '2px 6px', borderRadius: 4,
                    background: '#0d0d0d', border: '1px solid #1e1e1e',
                    cursor: 'default',
                  }}>
                    {syntax}
                  </span>
                ))}
              </div>
            )}

            {/* Editor / Preview area */}
            {tab === 'write' ? (
              <textarea
                value={form.content}
                onChange={e => field('content', e.target.value)}
                placeholder={`# Your article title\n\nStart writing your post here...\n\nMarkdown is supported for formatting:\n- **bold**, *italic*, \`inline code\`\n- [links](https://example.com)\n- > blockquotes\n- \`\`\`code blocks\`\`\``}
                style={{
                  ...INPUT,
                  border: 'none', borderRadius: 0,
                  height: 520, resize: 'vertical',
                  lineHeight: 1.75, fontFamily: 'monospace', fontSize: 13,
                  padding: '18px 20px',
                }}
              />
            ) : (
              <div
                style={{
                  minHeight: 520, padding: '18px 24px',
                  color: '#ccc', lineHeight: 1.75, fontSize: 14,
                  overflowX: 'auto',
                }}
                dangerouslySetInnerHTML={{
                  __html: form.content
                    ? renderMarkdown(form.content)
                    : '<p style="color:#333;font-style:italic;">Nothing to preview yet — start writing to see the result here.</p>',
                }}
              />
            )}

            {/* Footer count */}
            <div style={{
              padding: '8px 20px', borderTop: '1px solid #161616',
              display: 'flex', justifyContent: 'flex-end', gap: 16,
            }}>
              <span style={{ fontSize: 11, color: '#333' }}>{wordCount.toLocaleString()} words</span>
              <span style={{ fontSize: 11, color: '#333' }}>{form.content.length.toLocaleString()} chars</span>
              <span style={{ fontSize: 11, color: '#333' }}>~{readMins} min read</span>
            </div>
          </div>
        </div>

        {/* ── right sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Publish actions */}
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: '18px' }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, color: '#666', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '.07em' }}>
              Publish
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={() => save(false)} disabled={saving || !form.title.trim()} style={{
                width: '100%', padding: '10px', borderRadius: 8,
                border: '1px solid #2a2a2a', background: 'transparent',
                color: (!form.title.trim() || saving) ? '#333' : '#888',
                fontSize: 13, fontWeight: 500,
                cursor: (!form.title.trim() || saving) ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font)', transition: 'all .15s',
              }}
                onMouseEnter={e => { if (form.title.trim() && !saving) { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.color = '#fff' }}}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888' }}
              >
                📋 Save as Draft
              </button>
              <button onClick={() => save(true)} disabled={saving || !form.title.trim()} style={{
                width: '100%', padding: '10px', borderRadius: 8, border: 'none',
                background: (!form.title.trim() || saving) ? '#1e1e1e' : '#f5c518',
                color: (!form.title.trim() || saving) ? '#444' : '#000',
                fontSize: 13, fontWeight: 700,
                cursor: (!form.title.trim() || saving) ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font)', transition: 'background .15s',
              }}>
                {saving ? 'Saving…' : '⚡ Publish Post'}
              </button>
            </div>
          </div>

          {/* Cover image */}
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: '18px' }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, color: '#666', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '.07em' }}>
              Cover Image
            </h3>
            <label style={LBL}>Image URL</label>
            <input
              value={form.cover_image}
              onChange={e => field('cover_image', e.target.value)}
              placeholder="https://..."
              style={INPUT}
              onFocus={e => e.currentTarget.style.borderColor = '#f5c518'}
              onBlur={e => e.currentTarget.style.borderColor = '#222'}
            />
            {form.cover_image && (
              <div style={{ marginTop: 10, borderRadius: 8, overflow: 'hidden', height: 130, background: '#0d0d0d' }}>
                <img
                  src={form.cover_image}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                />
              </div>
            )}
          </div>

          {/* Tags */}
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: '18px' }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, color: '#666', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '.07em' }}>
              Tags
            </h3>
            <input
              value={form.tags}
              onChange={e => field('tags', e.target.value)}
              placeholder="soundboard, meme, gaming, tutorial"
              style={INPUT}
              onFocus={e => e.currentTarget.style.borderColor = '#f5c518'}
              onBlur={e => e.currentTarget.style.borderColor = '#222'}
            />
            {form.tags.trim() && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
                {form.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                  <span key={tag} style={{
                    padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                    background: 'rgba(245,197,24,0.08)', color: '#f5c518',
                    border: '1px solid rgba(245,197,24,0.18)',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* SEO Preview */}
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: '18px' }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, color: '#666', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '.07em' }}>
              SEO Preview
            </h3>

            {/* Google card mock */}
            <div style={{
              background: '#fff', borderRadius: 8, padding: '12px 14px',
              marginBottom: 14,
            }}>
              <div style={{ fontSize: 11, color: '#006621', marginBottom: 2, fontFamily: 'Arial, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                zapsoundboard.com › blog › {seoSlug || 'post-slug'}
              </div>
              <div style={{
                fontSize: 16, color: '#1a0dab', fontFamily: 'Arial, sans-serif',
                marginBottom: 4, fontWeight: 400,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {form.title || 'Post Title'}
              </div>
              <div style={{
                fontSize: 12, color: '#545454', fontFamily: 'Arial, sans-serif',
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              } as React.CSSProperties}>
                {form.excerpt || 'Your meta description will appear here. Write a compelling summary to improve click-through rates from search results.'}
              </div>
            </div>

            {/* SEO score items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {([
                { label: 'Title length',   ok: titleOk,            hint: `${titleLen}/60 chars`   },
                { label: 'Meta desc',      ok: excerptOk,          hint: `${excerptLen}/160 chars` },
                { label: 'Slug set',       ok: !!seoSlug,          hint: seoSlug ? '✓' : 'Missing' },
                { label: 'Cover image',    ok: !!form.cover_image, hint: form.cover_image ? '✓ Set' : 'Missing' },
                { label: 'Has content',    ok: wordCount > 150,    hint: `${wordCount} words`     },
                { label: 'Has tags',       ok: form.tags.split(',').filter(t=>t.trim()).length > 0, hint: `${form.tags.split(',').filter(t=>t.trim()).length} tags` },
              ] as const).map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                    background: item.ok ? 'rgba(34,197,94,0.15)' : 'rgba(80,80,80,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9,
                  }}>
                    <span style={{ color: item.ok ? '#22c55e' : '#444' }}>{item.ok ? '✓' : '○'}</span>
                  </div>
                  <span style={{ fontSize: 12, color: item.ok ? '#888' : '#444', flex: 1 }}>{item.label}</span>
                  <span style={{ fontSize: 11, color: '#333', fontFamily: 'monospace' }}>{item.hint}</span>
                </div>
              ))}
            </div>

            {/* SEO score bar */}
            {(() => {
              const checks = [titleOk, excerptOk, !!seoSlug, !!form.cover_image, wordCount > 150, form.tags.split(',').filter(t=>t.trim()).length > 0]
              const score  = Math.round((checks.filter(Boolean).length / checks.length) * 100)
              const col    = score >= 80 ? '#22c55e' : score >= 50 ? '#f5c518' : '#ef4444'
              return (
                <div style={{ marginTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: '#555' }}>SEO Score</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: col }}>{score}%</span>
                  </div>
                  <div style={{ height: 4, background: '#1e1e1e', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${score}%`, background: col, borderRadius: 2, transition: 'width .3s ease' }} />
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          div[style*="grid-template-columns: 1fr 300px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
