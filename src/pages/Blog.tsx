import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import type { BlogPost } from '@/lib/types'

const SITE = 'https://zapsoundboard.com'

// ─── placeholder posts shown when no real posts exist ────────────────────────

const PLACEHOLDERS: Omit<BlogPost, 'author_id' | 'is_published' | 'content' | 'created_at'>[] = [
  {
    id: 'ph1',
    title: '10 Best Meme Sounds for Discord in 2025',
    slug: '#',
    excerpt: 'Discover the funniest and most viral meme sounds perfect for your Discord server. From classic brainrot to trending clips, we cover them all.',
    tags: ['discord', 'meme', 'trending'],
    published_at: new Date().toISOString(),
    views: 1240,
  },
  {
    id: 'ph2',
    title: 'How to Use a Soundboard on Discord (Complete Guide)',
    slug: '#',
    excerpt: 'Learn how to set up and use a soundboard on Discord for voice channels. Works on desktop and mobile. No bots or apps required.',
    tags: ['discord', 'tutorial', 'guide'],
    published_at: new Date().toISOString(),
    views: 3560,
  },
  {
    id: 'ph3',
    title: 'Top 20 Italian Brainrot Sounds You Need Right Now',
    slug: '#',
    excerpt: 'The internet is obsessed with Italian brainrot sounds. Here are the 20 most viral clips that everyone is using in videos and Discord calls.',
    tags: ['brainrot', 'viral', 'meme'],
    published_at: new Date().toISOString(),
    views: 5890,
  },
]

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function readMins(content?: string) {
  if (!content) return null
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 200))
}

// ─── PostCard ─────────────────────────────────────────────────────────────────

interface PostCardProps {
  post: Partial<BlogPost>
  placeholder?: boolean
}

function PostCard({ post, placeholder }: PostCardProps) {
  const [hover, setHover] = useState(false)
  const mins = readMins(post.content)

  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-xl)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform var(--t-slow), box-shadow var(--t-slow), border-color var(--t)',
        transform: hover ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hover ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        borderColor: hover ? 'var(--border-hover)' : 'var(--border)',
      }}
    >
      {/* Cover */}
      {post.cover_image ? (
        <div style={{ height: 196, overflow: 'hidden', flexShrink: 0 }}>
          <img
            src={post.cover_image}
            alt={post.title}
            loading="lazy"
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform var(--t-slow)',
              transform: hover ? 'scale(1.05)' : 'scale(1)',
            }}
          />
        </div>
      ) : (
        <div style={{
          height: 160, flexShrink: 0,
          background: 'linear-gradient(135deg, var(--accent-subtle) 0%, var(--bg-secondary) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 52, borderBottom: '1px solid var(--border)',
        }}>
          🎵
        </div>
      )}

      {/* Body */}
      <div style={{ padding: '20px 22px 22px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {post.tags.slice(0, 3).map(tag => (
              <span key={tag} className="badge badge-yellow" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', lineHeight: 1.3, letterSpacing: '-0.02em', margin: 0 }}>
          {placeholder ? (
            <span style={{ opacity: 0.75 }}>{post.title}</span>
          ) : (
            <Link to={`/blog/${post.slug}`} style={{ textDecoration: 'none', color: 'var(--text)', transition: 'color var(--t)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-dark)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text)'}
            >
              {post.title}
            </Link>
          )}
        </h2>

        {/* Excerpt */}
        <p style={{
          fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0,
          flex: 1,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        } as React.CSSProperties}>
          {post.excerpt}
        </p>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--border)', marginTop: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {post.published_at && (
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {fmtDate(post.published_at)}
              </span>
            )}
            {mins && (
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>· {mins} min read</span>
            )}
          </div>
          {!placeholder && (
            <Link to={`/blog/${post.slug}`} style={{
              fontSize: 13, fontWeight: 600, color: 'var(--accent-dark)',
              textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3,
              transition: 'gap var(--t)',
              flexShrink: 0,
            }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.gap = '7px'}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.gap = '3px'}
            >
              Read more
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function BlogPage() {
  const [posts,   setPosts]   = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('blog_posts')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .then(({ data }) => {
        setPosts((data ?? []) as BlogPost[])
        setLoading(false)
      })
  }, [])

  const isEmpty = !loading && posts.length === 0
  const display = isEmpty ? PLACEHOLDERS : posts

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'ZapSoundboard Blog',
    description: 'Soundboard tips, meme guides, Discord tutorials and audio tool articles.',
    url: `${SITE}/blog`,
    publisher: { '@type': 'Organization', name: 'ZapSoundboard', url: SITE },
    ...(posts.length > 0 && {
      blogPost: posts.map(p => ({
        '@type': 'BlogPosting',
        headline: p.title,
        description: p.excerpt,
        url: `${SITE}/blog/${p.slug}`,
        datePublished: p.published_at ?? p.created_at,
        ...(p.cover_image && { image: p.cover_image }),
      })),
    }),
  }

  return (
    <>
      <Helmet>
        <title>ZapSoundboard Blog — Soundboard Tips, Memes & Audio Guides</title>
        <meta name="description"         content="Discover soundboard tips, Discord guides, meme sound collections, and audio tool articles from the ZapSoundboard team." />
        <meta name="robots"              content="index, follow" />
        <link rel="canonical"            href={`${SITE}/blog`} />
        <meta property="og:title"        content="ZapSoundboard Blog" />
        <meta property="og:description"  content="Soundboard tips, meme guides, Discord tutorials and more." />
        <meta property="og:type"         content="website" />
        <meta property="og:url"          content={`${SITE}/blog`} />
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content="ZapSoundboard Blog" />
        <meta name="twitter:description" content="Soundboard tips, meme guides, Discord tutorials and more." />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>

          {/* ── Hero ── */}
          <section style={{
            padding: 'var(--sp-16) 0 var(--sp-12)',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg)',
          }}>
            <div className="container" style={{ maxWidth: 720, textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)',
                borderRadius: 'var(--r-full)', padding: '4px 14px',
                fontSize: 12, fontWeight: 700, color: 'var(--accent-dark)',
                letterSpacing: '0.05em', textTransform: 'uppercase',
                marginBottom: 22,
              }}>
                ✍️ Blog
              </div>

              <h1 style={{
                fontSize: 'clamp(30px, 5vw, 54px)',
                fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1,
                color: 'var(--text)', marginBottom: 18,
              }}>
                ZapSoundboard<br />
                <span style={{ color: 'var(--accent-dark)' }}>Blog</span>
              </h1>

              <p style={{
                fontSize: 'clamp(15px, 2vw, 18px)',
                color: 'var(--text-secondary)', lineHeight: 1.7,
                maxWidth: 520, margin: '0 auto',
              }}>
                Tutorials, curated sound collections, Discord tips, and everything you need to master your soundboard.
              </p>

            </div>
          </section>

          {/* ── Posts grid ── */}
          <section style={{ padding: 'var(--sp-12) 0 var(--sp-16)' }}>
            <div className="container">

              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} style={{ borderRadius: 'var(--r-xl)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <div className="skeleton" style={{ height: 160 }} />
                      <div style={{ padding: '20px 22px' }}>
                        <div className="skeleton" style={{ height: 12, width: '45%', borderRadius: 20, marginBottom: 12 }} />
                        <div className="skeleton" style={{ height: 22, marginBottom: 8 }} />
                        <div className="skeleton" style={{ height: 22, width: '85%', marginBottom: 16 }} />
                        <div className="skeleton" style={{ height: 14, marginBottom: 6 }} />
                        <div className="skeleton" style={{ height: 14, width: '70%', marginBottom: 20 }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div className="skeleton" style={{ height: 13, width: '40%' }} />
                          <div className="skeleton" style={{ height: 13, width: '25%' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {isEmpty && (
                    <div style={{
                      textAlign: 'center', marginBottom: 36,
                      padding: '14px 24px', maxWidth: 480, margin: '0 auto 36px',
                      background: 'var(--accent-subtle)',
                      border: '1px solid var(--accent-border)',
                      borderRadius: 'var(--r-lg)',
                    }}>
                      <p style={{ fontSize: 14, color: 'var(--accent-dark)', margin: 0, fontWeight: 500 }}>
                        ✍️ Coming soon — these are example posts. Real articles will appear here shortly.
                      </p>
                    </div>
                  )}

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: 24,
                  }}>
                    {display.map(post => (
                      <PostCard key={post.id} post={post} placeholder={isEmpty} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>

          {/* ── CTA ── */}
          <section style={{
            padding: 'var(--sp-12) 0',
            background: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border)',
          }}>
            <div className="container" style={{ textAlign: 'center', maxWidth: 540 }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>⚡</div>
              <h2 style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 10 }}>
                Explore the Soundboard
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 15, lineHeight: 1.65 }}>
                100k+ free sounds — memes, Discord clips, reactions, gaming effects and more.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/soundboard" className="btn btn-primary btn-lg">Browse Sounds</Link>
                <Link to="/trending"   className="btn btn-secondary btn-lg">Trending Now</Link>
              </div>
            </div>
          </section>

        </main>
        <Footer />
      </div>
    </>
  )
}
