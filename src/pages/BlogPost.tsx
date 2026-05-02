import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import type { BlogPost } from '@/lib/types'

const SITE = 'https://zapsoundboard.com'

// ─── markdown renderer ────────────────────────────────────────────────────────

function renderMarkdown(raw: string): string {
  // 1. escape HTML to prevent XSS
  let s = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // 2. fenced code blocks (before other replacements)
  s = s.replace(/```([\s\S]*?)```/g, (_, code) =>
    `<pre class="bpc"><code>${code.replace(/^\n/, '')}</code></pre>`
  )

  // 3. headings
  s = s
    .replace(/^#### (.+)$/gm, '<h4 class="bh4">$1</h4>')
    .replace(/^### (.+)$/gm,  '<h3 class="bh3">$1</h3>')
    .replace(/^## (.+)$/gm,   '<h2 class="bh2">$1</h2>')
    .replace(/^# (.+)$/gm,    '<h1 class="bh1">$1</h1>')

  // 4. inline formatting
  s = s
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g,     '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,         '<em>$1</em>')
    .replace(/_(.+?)_/g,           '<em>$1</em>')

  // 5. inline code
  s = s.replace(/`([^`]+)`/g, '<code class="bic">$1</code>')

  // 6. links
  s = s.replace(/\[(.+?)\]\((.+?)\)/g,
    '<a href="$2" class="blink" target="_blank" rel="noopener noreferrer">$1</a>'
  )

  // 7. blockquotes
  s = s.replace(/^> (.+)$/gm, '<blockquote class="bbq">$1</blockquote>')

  // 8. horizontal rule
  s = s.replace(/^---$/gm, '<hr class="bhr">')

  // 9. lists
  s = s.replace(/^[-*] (.+)$/gm, '<li class="bli">$1</li>')
  s = s.replace(/^\d+\. (.+)$/gm, '<li class="bli">$1</li>')
  s = s.replace(/(<li[^>]*>[\s\S]+?<\/li>\n?)+/g, m =>
    `<ul class="bul">${m}</ul>`
  )

  // 10. paragraphs (split on blank lines, skip block elements)
  const BLOCK = /^<(h[1-6]|pre|ul|ol|blockquote|hr)/
  s = s
    .split(/\n\n+/)
    .map(block => {
      const t = block.trim()
      if (!t || BLOCK.test(t)) return t
      return `<p class="bp">${t.replace(/\n/g, '<br>')}</p>`
    })
    .join('\n')

  return s
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function fmtDateShort(d: string) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

// ─── share button ─────────────────────────────────────────────────────────────

interface ShareBtnProps {
  platform: 'whatsapp' | 'twitter' | 'copy'
  onClick:  () => void
  copied?:  boolean
  full?:    boolean
}

function ShareBtn({ platform, onClick, copied, full }: ShareBtnProps) {
  const [hover, setHover] = useState(false)

  const CFG = {
    whatsapp: { label: 'WhatsApp',    icon: '💬', hoverColor: '#25d366', hoverBg: '#f0fdf4' },
    twitter:  { label: 'X (Twitter)', icon: '𝕏',  hoverColor: '#111111', hoverBg: '#f5f5f5' },
    copy:     { label: copied ? 'Copied!' : 'Copy Link', icon: copied ? '✓' : '🔗', hoverColor: '#6366f1', hoverBg: '#eef2ff' },
  } as const

  const cfg = CFG[platform]

  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: full ? '9px 14px' : '8px 16px',
        borderRadius: 'var(--r-md)',
        border: `1px solid ${hover ? cfg.hoverColor : 'var(--border)'}`,
        background: hover ? cfg.hoverBg : 'var(--bg)',
        color: hover ? cfg.hoverColor : 'var(--text-secondary)',
        fontSize: 13, fontWeight: 500,
        cursor: 'pointer', fontFamily: 'var(--font)',
        transition: 'all var(--t)',
        width: full ? '100%' : 'auto',
        justifyContent: full ? 'flex-start' : 'center',
      }}
    >
      <span style={{ fontSize: 15, lineHeight: 1 }}>{cfg.icon}</span>
      {cfg.label}
    </button>
  )
}

// ─── related card ─────────────────────────────────────────────────────────────

function RelatedCard({ post }: { post: BlogPost }) {
  const [hover, setHover] = useState(false)

  return (
    <Link to={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <article style={{
        background: 'var(--bg)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)', overflow: 'hidden',
        transition: 'transform var(--t-slow), box-shadow var(--t-slow), border-color var(--t)',
        transform: hover ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hover ? 'var(--shadow-md)' : 'none',
        borderColor: hover ? 'var(--border-hover)' : 'var(--border)',
      }}>
        {post.cover_image ? (
          <div style={{ height: 130, overflow: 'hidden' }}>
            <img src={post.cover_image} alt={post.title} loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform var(--t-slow)', transform: hover ? 'scale(1.05)' : 'scale(1)' }}
            />
          </div>
        ) : (
          <div style={{ height: 100, background: 'linear-gradient(135deg, var(--accent-subtle), var(--bg-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
            🎵
          </div>
        )}
        <div style={{ padding: '14px 16px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', lineHeight: 1.35, marginBottom: 6, letterSpacing: '-0.01em' }}>
            {post.title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {fmtDateShort(post.published_at ?? post.created_at)}
            </span>
            {post.tags?.slice(0, 2).map(t => (
              <span key={t} style={{ fontSize: 11, color: 'var(--accent-dark)', background: 'var(--accent-subtle)', padding: '1px 7px', borderRadius: 'var(--r-full)', border: '1px solid var(--accent-border)' }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </article>
    </Link>
  )
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()

  const [post,     setPost]     = useState<BlogPost | null>(null)
  const [related,  setRelated]  = useState<BlogPost[]>([])
  const [loading,  setLoading]  = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copied,   setCopied]   = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setNotFound(false)
    setPost(null)
    setRelated([])

    supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { setNotFound(true); setLoading(false); return }

        const p = data as BlogPost
        setPost(p)
        setLoading(false)

        // increment views — fire and forget
        supabase
          .from('blog_posts')
          .update({ views: (p.views ?? 0) + 1 })
          .eq('id', p.id)
          .then()

        // fetch related by overlapping tags
        if (p.tags?.length) {
          supabase
            .from('blog_posts')
            .select('*')
            .eq('is_published', true)
            .neq('id', p.id)
            .overlaps('tags', p.tags)
            .limit(3)
            .then(({ data: rel }) => setRelated((rel ?? []) as BlogPost[]))
        }
      })
  }, [slug])

  function share(platform: 'whatsapp' | 'twitter' | 'copy') {
    const url = `${SITE}/blog/${slug}`
    const ttl = post?.title ?? ''
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(ttl + '\n' + url)}`, '_blank')
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(ttl)}&url=${encodeURIComponent(url)}`, '_blank')
    } else {
      navigator.clipboard?.writeText(url).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2200)
      })
    }
  }

  // ── loading skeleton ──
  if (loading) {
    return (
      <>
        <Helmet><title>Loading… — ZapSoundboard Blog</title></Helmet>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1, padding: 'var(--sp-12) 0' }}>
            <div className="container" style={{ maxWidth: 760 }}>
              <div className="skeleton" style={{ height: 360, borderRadius: 'var(--r-xl)', marginBottom: 32 }} />
              <div className="skeleton" style={{ height: 16, width: '35%', borderRadius: 20, marginBottom: 20 }} />
              <div className="skeleton" style={{ height: 44, marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 44, width: '75%', marginBottom: 28 }} />
              <div className="skeleton" style={{ height: 16, width: '50%', marginBottom: 32 }} />
              {[100, 95, 88, 100, 72, 90, 85].map((w, i) => (
                <div key={i} className="skeleton" style={{ height: 16, width: `${w}%`, marginBottom: 14 }} />
              ))}
            </div>
          </main>
          <Footer />
        </div>
      </>
    )
  }

  // ── 404 ──
  if (notFound || !post) {
    return (
      <>
        <Helmet>
          <title>Post Not Found — ZapSoundboard Blog</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--sp-16)' }}>
            <div style={{ textAlign: 'center', maxWidth: 420 }}>
              <div style={{ fontSize: 64, marginBottom: 20 }}>📄</div>
              <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em' }}>Post Not Found</h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.6 }}>
                This article doesn't exist or has been unpublished.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <Link to="/blog" className="btn btn-primary">← Back to Blog</Link>
                <Link to="/"    className="btn btn-secondary">Home</Link>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </>
    )
  }

  // ── computed ──
  const postUrl  = `${SITE}/blog/${slug}`
  const wordCnt  = post.content.split(/\s+/).filter(Boolean).length
  const readMins = Math.max(1, Math.ceil(wordCnt / 200))
  const pubDate  = post.published_at ?? post.created_at

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.cover_image ?? `${SITE}/og-image.png`,
    url: postUrl,
    datePublished: pubDate,
    dateModified:  pubDate,
    wordCount: wordCnt,
    author: { '@type': 'Organization', name: 'ZapSoundboard', url: SITE },
    publisher: {
      '@type': 'Organization',
      name: 'ZapSoundboard',
      logo: { '@type': 'ImageObject', url: `${SITE}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
  }

  return (
    <>
      <Helmet>
        <title>{post.title} — ZapSoundboard Blog</title>
        <meta name="description"              content={post.excerpt} />
        <meta name="robots"                   content="index, follow" />
        <link rel="canonical"                 href={postUrl} />
        <meta property="og:title"             content={post.title} />
        <meta property="og:description"       content={post.excerpt} />
        <meta property="og:type"              content="article" />
        <meta property="og:url"               content={postUrl} />
        <meta property="og:site_name"         content="ZapSoundboard" />
        {post.cover_image && <meta property="og:image" content={post.cover_image} />}
        <meta property="article:published_time" content={pubDate} />
        <meta property="article:author"       content="ZapSoundboard" />
        {post.tags.map(t => <meta key={t} property="article:tag" content={t} />)}
        <meta name="twitter:card"             content="summary_large_image" />
        <meta name="twitter:title"            content={post.title} />
        <meta name="twitter:description"      content={post.excerpt} />
        {post.cover_image && <meta name="twitter:image" content={post.cover_image} />}
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>

          {/* ── cover image ── */}
          {post.cover_image && (
            <div style={{ width: '100%', height: 'clamp(200px, 40vh, 420px)', overflow: 'hidden' }}>
              <img
                src={post.cover_image}
                alt={post.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          )}

          {/* ── two-column layout ── */}
          <div className="container blog-layout" style={{ padding: 'var(--sp-10) var(--sp-6)', alignItems: 'start' }}>

            {/* ── article ── */}
            <article style={{ minWidth: 0, maxWidth: '100%' }}>

              {/* Breadcrumb */}
              <nav aria-label="breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 24, flexWrap: 'wrap' }}>
                {[
                  { label: 'Home', to: '/' },
                  { label: 'Blog', to: '/blog' },
                ].map((crumb, i) => (
                  <span key={crumb.to} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    {i > 0 && <span style={{ color: 'var(--border-strong)', fontSize: 13 }}>›</span>}
                    <Link to={crumb.to} style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', transition: 'color var(--t)' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      {crumb.label}
                    </Link>
                  </span>
                ))}
                <span style={{ color: 'var(--border-strong)', fontSize: 13 }}>›</span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>
                  {post.title}
                </span>
              </nav>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
                  {post.tags.map(tag => (
                    <span key={tag} className="badge badge-yellow" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 style={{
                fontSize: 'clamp(26px, 4vw, 44px)',
                fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15,
                color: 'var(--text)', marginBottom: 22,
              }}>
                {post.title}
              </h1>

              {/* Excerpt lead */}
              {post.excerpt && (
                <p style={{
                  fontSize: 18, color: 'var(--text-secondary)', lineHeight: 1.65,
                  marginBottom: 24, fontWeight: 400,
                  borderLeft: '3px solid var(--accent)',
                  paddingLeft: 16,
                }}>
                  {post.excerpt}
                </p>
              )}

              {/* Meta bar */}
              <div style={{
                display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 16,
                marginBottom: 36, paddingBottom: 24,
                borderBottom: '1px solid var(--border)',
              }}>
                {/* Author */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: 'var(--accent)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0,
                  }}>
                    ⚡
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>
                      ZapSoundboard Team
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {fmtDate(pubDate)}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: 14, marginLeft: 4 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {readMins} min read
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                    {(post.views ?? 0).toLocaleString()} views
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>
                    {wordCnt.toLocaleString()} words
                  </span>
                </div>
              </div>

              {/* Rendered content */}
              <div
                className="blog-content"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
              />

              {/* Bottom share strip */}
              <div style={{
                marginTop: 52, paddingTop: 28,
                borderTop: '1px solid var(--border)',
              }}>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 14, fontWeight: 500 }}>
                  Found this useful? Share it with your crew →
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <ShareBtn platform="whatsapp" onClick={() => share('whatsapp')} />
                  <ShareBtn platform="twitter"  onClick={() => share('twitter')} />
                  <ShareBtn platform="copy"     onClick={() => share('copy')} copied={copied} />
                </div>
              </div>

              {/* Back link */}
              <div style={{ marginTop: 32 }}>
                <Link to="/blog" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 14, color: 'var(--text-muted)', textDecoration: 'none',
                  transition: 'color var(--t)',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                  Back to Blog
                </Link>
              </div>
            </article>

            {/* ── sticky sidebar ── */}
            <aside className="blog-sidebar" style={{ position: 'sticky', top: 76 }}>

              {/* Share card */}
              <div style={{
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-xl)', padding: '20px', marginBottom: 16,
              }}>
                <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Share This Post
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <ShareBtn platform="whatsapp" onClick={() => share('whatsapp')} full />
                  <ShareBtn platform="twitter"  onClick={() => share('twitter')}  full />
                  <ShareBtn platform="copy"     onClick={() => share('copy')}     full copied={copied} />
                </div>
              </div>

              {/* Tags card */}
              {post.tags.length > 0 && (
                <div style={{
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  borderRadius: 'var(--r-xl)', padding: '20px', marginBottom: 16,
                }}>
                  <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    Tags
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {post.tags.map(tag => (
                      <span key={tag} style={{
                        padding: '4px 12px', borderRadius: 'var(--r-full)',
                        fontSize: 12, fontWeight: 500, cursor: 'default',
                        background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
                        border: '1px solid var(--border)',
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick stats */}
              <div style={{
                background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)',
                borderRadius: 'var(--r-xl)', padding: '16px 20px',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { label: 'Published',  val: fmtDateShort(pubDate)         },
                    { label: 'Read time',  val: `${readMins} min`             },
                    { label: 'Views',      val: (post.views ?? 0).toLocaleString() },
                    { label: 'Words',      val: wordCnt.toLocaleString()      },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'var(--accent-dark)', fontWeight: 500 }}>{item.label}</span>
                      <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>

          {/* ── related posts ── */}
          {related.length > 0 && (
            <section style={{
              padding: 'var(--sp-12) 0 var(--sp-16)',
              background: 'var(--bg-secondary)',
              borderTop: '1px solid var(--border)',
            }}>
              <div className="container">
                <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 24 }}>
                  Related Articles
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
                  {related.map(p => <RelatedCard key={p.id} post={p} />)}
                </div>
              </div>
            </section>
          )}

          {/* ── CTA ── */}
          <section style={{ padding: 'var(--sp-12) 0', borderTop: '1px solid var(--border)' }}>
            <div className="container" style={{ textAlign: 'center', maxWidth: 520 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>⚡</div>
              <h2 style={{ fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 10 }}>
                Try the Soundboard
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 22, fontSize: 15 }}>
                100k+ free meme sounds, Discord clips, and reactions — no download needed.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/soundboard" className="btn btn-primary">Browse Sounds</Link>
                <Link to="/trending"   className="btn btn-secondary">Trending Now</Link>
              </div>
            </div>
          </section>

        </main>
        <Footer />
      </div>

      {/* ── scoped blog styles ── */}
      <style>{`
        .blog-layout {
          display: grid;
          grid-template-columns: 1fr 264px;
          gap: 48px;
        }
        /* ── content typography ── */
        .blog-content { font-size:16px; line-height:1.8; color:var(--text-secondary); }
        .bp  { margin:0 0 20px; }
        .bh1 { font-size:clamp(22px,3vw,32px); font-weight:800; color:var(--text); margin:40px 0 16px; letter-spacing:-0.02em; line-height:1.2; }
        .bh2 { font-size:clamp(19px,2.5vw,26px); font-weight:700; color:var(--text); margin:36px 0 14px; letter-spacing:-0.02em; padding-bottom:10px; border-bottom:1px solid var(--border); }
        .bh3 { font-size:20px; font-weight:700; color:var(--text); margin:28px 0 12px; letter-spacing:-0.01em; }
        .bh4 { font-size:17px; font-weight:600; color:var(--text); margin:22px 0 10px; }
        .bpc { background:var(--bg-secondary); border:1px solid var(--border); padding:18px 22px; border-radius:var(--r-lg); overflow-x:auto; margin:22px 0; }
        .bpc code { font-family:var(--font-mono); font-size:13px; color:var(--text); line-height:1.65; }
        .bic { background:var(--bg-secondary); border:1px solid var(--border); padding:1px 7px; border-radius:var(--r-sm); font-family:var(--font-mono); font-size:13px; color:var(--text); }
        .blink { color:var(--accent-dark); text-decoration:underline; text-underline-offset:2px; transition:opacity var(--t); }
        .blink:hover { opacity:0.75; }
        .bhr { border:none; border-top:1px solid var(--border); margin:32px 0; }
        .bbq { border-left:3px solid var(--accent); padding:10px 20px; background:var(--accent-subtle); border-radius:0 var(--r-md) var(--r-md) 0; margin:20px 0; font-style:italic; color:var(--text); }
        .bul { padding-left:26px; margin:16px 0; }
        .bli { margin:7px 0; line-height:1.7; color:var(--text-secondary); }
        /* ── responsive ── */
        @media (max-width: 900px) {
          .blog-layout { grid-template-columns: 1fr !important; gap: 32px !important; }
          .blog-sidebar { position: static !important; }
        }
      `}</style>
    </>
  )
}
