import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import SoundGrid from '@/components/sound/SoundGrid'
import { supabase } from '@/lib/supabase'
import { CATEGORIES } from '@/lib/categories'
import type { Sound } from '@/lib/types'

interface FAQ { q: string; a: string }

interface SeoPageProps {
  slug:        string
  metaTitle:   string
  metaDesc:    string
  h1:          string
  tagline:     string
  description: string
  faqs:        FAQ[]
  relatedPages?: { label: string; href: string }[]
}

export default function SeoPage({
  slug, metaTitle, metaDesc, h1, tagline, description, faqs, relatedPages = [],
}: SeoPageProps) {
  const [sounds,  setSounds]  = useState<Sound[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      // Fetch mix of all categories — ordered by plays (trending)
      const { data, error } = await supabase
        .from('sounds')
        .select('*')
        .eq('status', 'approved')
        .order('plays', { ascending: false })
        .limit(24)
      if (!error && data) {
        // Shuffle for variety
        const shuffled = [...data].sort(() => Math.random() - 0.5)
        setSounds(shuffled.map(r => ({ ...r, category: r.sound_category })) as Sound[])
      }
      setLoading(false)
    }
    load()
  }, [slug])

  const canonicalUrl = `https://zapsoundboard.com/${slug}`

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDesc} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title"       content={metaTitle} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:url"         content={canonicalUrl} />
        <meta property="og:type"        content="website" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'CollectionPage',
              'name': metaTitle,
              'description': metaDesc,
              'url': canonicalUrl,
              'numberOfItems': sounds.length,
            },
            {
              '@type': 'BreadcrumbList',
              'itemListElement': [
                { '@type': 'ListItem', 'position': 1, 'name': 'Home',    'item': 'https://zapsoundboard.com' },
                { '@type': 'ListItem', 'position': 2, 'name': h1,        'item': canonicalUrl },
              ],
            },
            {
              '@type': 'FAQPage',
              'mainEntity': faqs.map(f => ({
                '@type': 'Question',
                'name': f.q,
                'acceptedAnswer': { '@type': 'Answer', 'text': f.a },
              })),
            },
          ],
        })}</script>
      </Helmet>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>

          {/* ── Hero ── */}
          <section style={{
            background: 'linear-gradient(135deg, rgba(245,197,24,0.06) 0%, transparent 60%)',
            borderBottom: '1px solid var(--border)',
            padding: 'clamp(32px,5vw,56px) 0 clamp(24px,4vw,44px)',
          }}>
            <div className="container" style={{ maxWidth: 800, textAlign: 'center' }}>
              <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, flexWrap: 'wrap' }}>
                <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
                <span>›</span>
                <span style={{ color: 'var(--text)' }}>{h1}</span>
              </nav>

              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(245,197,24,0.12)', border: '1px solid rgba(245,197,24,0.3)',
                borderRadius: 'var(--r-full)', padding: '4px 14px',
                fontSize: 12, fontWeight: 600, color: 'var(--accent)', marginBottom: 16,
              }}>
                ⚡ Free Forever — No Signup Required
              </div>

              <h1 style={{
                fontSize: 'clamp(22px, 5vw, 44px)',
                fontWeight: 800, letterSpacing: '-0.04em',
                color: 'var(--text)', marginBottom: 12, lineHeight: 1.15,
              }}>
                {h1}
              </h1>

              <p style={{
                fontSize: 'clamp(14px,3vw,17px)', color: 'var(--text-secondary)',
                lineHeight: 1.6, marginBottom: 24, maxWidth: 560, margin: '0 auto 24px',
              }}>
                {tagline}
              </p>

              {/* Stats — 2x2 on mobile, row on desktop */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px 16px',
                maxWidth: 400, margin: '0 auto',
              }}>
                {[
                  { n: '100k+',  l: 'Free Sounds' },
                  { n: '16',    l: 'Categories' },
                  { n: '0',     l: 'Signup Needed' },
                  { n: '100%',  l: 'Free Forever' },
                ].map(stat => (
                  <div key={stat.l} style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: 20, fontWeight: 800, color: 'var(--accent)',
                      fontFamily: 'var(--font-mono)', letterSpacing: '-0.03em',
                    }}>{stat.n}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{stat.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Sound Grid ── */}
          <section style={{ padding: 'var(--sp-8) 0' }}>
            <div className="container">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
                  🔥 Trending Sounds
                </h2>
                <Link to="/soundboard" style={{
                  fontSize: 13, color: 'var(--accent)', textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  Browse all →
                </Link>
              </div>
              <SoundGrid sounds={sounds} loading={loading} showIndex
                emptyMessage="No sounds yet — check back soon!" />
            </div>
          </section>

          {/* ── Category Pills — horizontal scroll on mobile ── */}
          <section style={{
            padding: 'var(--sp-5) 0',
            background: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
          }}>
            <div className="container">
              <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
                Browse by Category
              </h2>
              <div className="scroll-x" style={{ display: 'flex', gap: 8, paddingBottom: 4 }}>
                {CATEGORIES.map(c => (
                  <Link key={c.id} to={`/soundboard/${c.slug}`} style={{
                    display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
                    padding: '8px 14px', minHeight: 40, borderRadius: 'var(--r-full)',
                    border: '1px solid var(--border)', background: 'var(--bg)',
                    fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)',
                    textDecoration: 'none', transition: 'all var(--t)', whiteSpace: 'nowrap',
                  }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = `${c.color}15`
                      e.currentTarget.style.borderColor = `${c.color}40`
                      e.currentTarget.style.color = c.color
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'var(--bg)'
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.color = 'var(--text-secondary)'
                    }}
                  >
                    {c.emoji} {c.label}
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* ── SEO Text ── */}
          <section style={{ padding: 'var(--sp-10) 0' }}>
            <div className="container" style={{ maxWidth: 800 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 14, letterSpacing: '-0.02em' }}>
                About {h1}
              </h2>
              <div style={{
                fontSize: 15, lineHeight: 1.85, color: 'var(--text-secondary)',
                marginBottom: 24,
              }}>
                {description.split('\n').map((para, i) => (
                  para.trim() ? <p key={i} style={{ marginBottom: 14 }}>{para}</p> : null
                ))}
              </div>

              {/* Features grid — 1 col mobile, 2 tablet, 3 desktop */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 10, marginBottom: 28,
              }}>
                {[
                  { icon: '▶️', title: 'Instant Play',    desc: 'Click any button — sound plays immediately' },
                  { icon: '⬇️', title: 'Free Download',   desc: 'Download MP3 files, no account needed' },
                  { icon: '📱', title: 'Mobile Friendly', desc: 'Works on phone, tablet, and desktop' },
                  { icon: '🎮', title: 'Discord Ready',    desc: 'Perfect for Discord soundboard feature' },
                  { icon: '🔄', title: 'Always Updated',  desc: 'New sounds added every week' },
                  { icon: '🌍', title: '16 Categories',   desc: 'Meme, Gaming, Anime, Music and more' },
                ].map(f => (
                  <div key={f.title} style={{
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                    borderRadius: 'var(--r-lg)', padding: '14px 16px',
                  }}>
                    <div style={{ fontSize: 20, marginBottom: 8 }}>{f.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{f.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── FAQ ── */}
          <section style={{
            background: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border)',
            padding: 'var(--sp-10) 0',
          }}>
            <div className="container" style={{ maxWidth: 800 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.02em' }}>
                Frequently Asked Questions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {faqs.map((f, i) => (
                  <details key={i} style={{
                    background: 'var(--bg)', border: '1px solid var(--border)',
                    borderRadius: 'var(--r-lg)', overflow: 'hidden',
                  }}>
                    <summary style={{
                      padding: '14px 18px', fontSize: 15, fontWeight: 600,
                      color: 'var(--text)', cursor: 'pointer', listStyle: 'none',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      {f.q}
                      <span style={{ fontSize: 18, color: 'var(--text-muted)', marginLeft: 12, flexShrink: 0 }}>+</span>
                    </summary>
                    <div style={{
                      padding: '0 18px 16px', fontSize: 14,
                      color: 'var(--text-secondary)', lineHeight: 1.7,
                    }}>
                      {f.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* ── Related Pages — horizontal scroll on mobile ── */}
          {relatedPages.length > 0 && (
            <section style={{ padding: 'var(--sp-6) 0' }}>
              <div className="container" style={{ maxWidth: 800 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
                  Related Soundboards
                </h2>
                <div className="scroll-x" style={{ display: 'flex', gap: 8, paddingBottom: 4 }}>
                  {relatedPages.map(p => (
                    <Link key={p.href} to={p.href} style={{
                      padding: '8px 16px', minHeight: 40, flexShrink: 0,
                      borderRadius: 'var(--r-full)',
                      border: '1px solid var(--border)', background: 'var(--bg-secondary)',
                      fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none',
                      transition: 'all var(--t)', whiteSpace: 'nowrap',
                    }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'var(--accent)'
                        e.currentTarget.style.color = 'var(--accent)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--border)'
                        e.currentTarget.style.color = 'var(--text-secondary)'
                      }}
                    >
                      {p.label}
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── FlashTTS CTA ── */}
          <section style={{
            background: 'linear-gradient(135deg, #1a1200 0%, #111 100%)',
            borderTop: '1px solid rgba(245,197,24,0.15)',
            padding: 'var(--sp-8) 0',
          }}>
            <div className="container" style={{ textAlign: 'center', maxWidth: 600 }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>⚡</div>
              <h3 style={{ fontSize: 'clamp(17px,4vw,22px)', fontWeight: 700, color: '#f5c518', marginBottom: 8 }}>
                Want AI-Generated Voices?
              </h3>
              <p style={{ fontSize: 14, color: '#888', marginBottom: 20 }}>
                Try FlashTTS — Generate unlimited TTS and clone any voice in seconds. Free to start.
              </p>
              <a href="https://flashtts.com" target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px 28px', borderRadius: 'var(--r-md)',
                background: '#f5c518', color: '#1a1400',
                fontSize: 14, fontWeight: 700, textDecoration: 'none',
                transition: 'opacity var(--t)', minHeight: 52,
                width: '100%', maxWidth: 280,
              }}>
                Try FlashTTS Free →
              </a>
            </div>
          </section>

        </main>
        <Footer />
      </div>
    </>
  )
}