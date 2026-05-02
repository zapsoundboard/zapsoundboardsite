import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AdSlot from '@/components/ui/AdSlot'
import SoundGrid from '@/components/sound/SoundGrid'
import { getTrending } from '@/lib/supabase'
import { CATEGORIES } from '@/lib/categories'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import type { Sound } from '@/lib/types'


type SortType = 'trending' | 'new' | 'top'

export default function HomePage() {
  const [sounds, setSounds] = useState<Sound[]>([])
  const [loading, setLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')
  const [sortBy, setSortBy] = useState<SortType>('trending')
  const [search, setSearch] = useState('')
  const [] = useSearchParams()

  // Keyboard shortcuts
  useKeyboardShortcuts(sounds)

  useEffect(() => {
    setLoading(true)
    getTrending(48).then(data => {
      if (data.length) setSounds(data)
      setLoading(false)
    })
  }, [])

  const trending = useMemo(() =>
    [...sounds].sort((a, b) => b.plays - a.plays).slice(0, 10),
  [sounds])

  const filtered = useMemo(() => {
    let s = [...sounds]
    if (activeCategory !== 'all') s = s.filter(x => x.category === activeCategory)
    if (search.trim()) {
      const q = search.toLowerCase()
      s = s.filter(x => x.title.toLowerCase().includes(q) || x.tags.some(t => t.includes(q)))
    }
    if (sortBy === 'trending') s.sort((a, b) => b.plays - a.plays)
    if (sortBy === 'top')      s.sort((a, b) => b.likes - a.likes)
    if (sortBy === 'new')      s.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return s
  }, [sounds, activeCategory, sortBy, search])

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    if (activeCategory !== 'all') setActiveCategory('all')
  }, [activeCategory])

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = { all: sounds.length }
    sounds.forEach(s => { map[s.category] = (map[s.category] || 0) + 1 })
    return map
  }, [sounds])

  return (
    <>
      <Helmet>
        <title>Free Online Soundboard — 100k+ Meme, Discord & Funny Sounds | ZapSoundboard</title>
        <meta name="description" content="Play, share & download 100k+ viral meme sounds, Discord soundboard buttons, goofy ahh clips & funny sound effects. Free online soundboard — no signup needed." />
        <meta name="keywords" content="soundboard, online soundboard, meme soundboard, discord soundboard, funny soundboard, free soundboard, goofy ahh soundboard, brainrot soundboard" />
        <link rel="canonical" href="https://zapsoundboard.com/" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "ZapSoundboard",
          "url": "https://zapsoundboard.com",
          "description": "Free online soundboard with 100k+ meme, discord and funny sounds",
          "applicationCategory": "EntertainmentApplication",
          "offers": { "@type": "Offer", "price": "0" },
        })}</script>
      </Helmet>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        
        <AdSlot position="top" />

        <main style={{ flex: 1 }}>

          {/* ── Hero Section ── */}
          <section style={{
            borderBottom: '1px solid var(--border)',
            padding: 'clamp(32px, 5vw, 64px) 0 clamp(24px, 4vw, 48px)',
            background: 'var(--bg)',
          }}>
            <div className="container">
              <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>

                {/* Badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)',
                  borderRadius: 'var(--r-full)', padding: '4px 14px',
                  fontSize: 12, fontWeight: 600, color: 'var(--accent-dark)', marginBottom: 14,
                }}>
                  <span>⚡</span>Free Online Soundboard — No Download Needed
                </div>

                {/* H1 */}
                <h1 style={{
                  fontSize: 'clamp(24px, 6vw, 52px)',
                  fontWeight: 800, letterSpacing: '-0.03em',
                  color: 'var(--text)', marginBottom: 10, lineHeight: 1.1,
                }}>
                  <span style={{
                    background: 'var(--accent)', padding: '0 8px',
                    borderRadius: 6, color: 'var(--accent-text)',
                    display: 'inline-block', marginBottom: 4,
                  }}>100k+</span>
                  {' '}Soundboard Sounds
                </h1>

                <p style={{ fontSize: 'clamp(14px, 3vw, 16px)', color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
                  Meme sounds, Discord buttons, funny clips — click, download & share. Free forever.
                </p>

                {/* Search bar */}
                <div style={{ position: 'relative', width: '100%', maxWidth: 520, margin: '0 auto' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }}>
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    type="search"
                    placeholder='Search: "goofy ahh", "vine boom"...'
                    value={search}
                    onChange={handleSearch}
                    style={{
                      width: '100%', height: 52,
                      paddingLeft: 44, paddingRight: search ? 44 : 16,
                      border: '1.5px solid var(--border)', borderRadius: 'var(--r-xl)',
                      fontSize: 16, color: 'var(--text)', background: 'var(--bg)',
                      fontFamily: 'var(--font)', outline: 'none',
                      transition: 'border-color var(--t), box-shadow var(--t)',
                      boxShadow: 'var(--shadow-sm)', boxSizing: 'border-box',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-border)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}
                  />
                  {search && (
                    <button onClick={() => setSearch('')} style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                      width: 32, height: 32, justifyContent: 'center',
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  )}
                </div>

                {/* Stats */}
                <div className="stats-row" style={{
                  display: 'flex', justifyContent: 'center', flexWrap: 'wrap',
                  gap: '8px 20px', marginTop: 16,
                }}>
                  {[
                    { num: '100k+', label: 'Sounds' },
                    { num: '120k', label: 'Daily plays' },
                    { num: '16',   label: 'Categories' },
                    { num: '100%', label: 'Free' },
                  ].map(stat => (
                    <div key={stat.label} style={{
                      display: 'flex', gap: 4, alignItems: 'center',
                      fontSize: 13, color: 'var(--text-muted)',
                    }}>
                      <span style={{ fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{stat.num}</span>
                      {stat.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Trending Row ── */}
          {!search && (
            <section style={{
              background: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border)',
              padding: 'var(--sp-5) 0',
            }}>
              <div className="container">
                <div style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>🔥</span>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>
                      Trending Today
                    </h2>
                  </div>
                  <Link to="/trending" style={{
                    fontSize: 13, color: 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '6px 12px', height: 36,
                    border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
                    background: 'var(--bg)', textDecoration: 'none', transition: 'all var(--t)',
                  }}>See all →</Link>
                </div>
                <SoundGrid sounds={trending} showIndex />
              </div>
            </section>
          )}

          {/* ── Main Grid ── */}
          <section style={{ padding: 'var(--sp-8) 0 var(--sp-16)' }}>
            <div className="container">

              {/* Filters */}
              <div style={{ marginBottom: 'var(--sp-5)' }}>
                {/* Category pills — horizontal scroll on mobile */}
                <div className="scroll-x" style={{
                  display: 'flex', gap: 6, marginBottom: 10,
                  paddingBottom: 4,
                }}>
                  <button
                    onClick={() => setActiveCategory('all')}
                    style={{
                      padding: '7px 12px', minHeight: 36, flexShrink: 0,
                      borderRadius: 'var(--r-full)',
                      border: activeCategory === 'all' ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                      background: activeCategory === 'all' ? 'var(--accent-subtle)' : 'var(--bg)',
                      color: activeCategory === 'all' ? 'var(--accent-dark)' : 'var(--text-secondary)',
                      fontSize: 13, fontWeight: activeCategory === 'all' ? 600 : 400,
                      cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all var(--t)',
                      display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
                    }}
                  >
                    🔊 All
                    <span style={{ fontSize: 11, opacity: 0.7 }}>{categoryCounts.all}</span>
                  </button>

                  {CATEGORIES.map(cat => {
                    const isActive = activeCategory === cat.id
                    return (
                      <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
                        padding: '7px 12px', minHeight: 36, flexShrink: 0,
                        borderRadius: 'var(--r-full)',
                        border: isActive ? `1.5px solid ${cat.color}` : '1px solid var(--border)',
                        background: isActive ? `${cat.color}18` : 'var(--bg)',
                        color: isActive ? cat.color : 'var(--text-secondary)',
                        fontSize: 13, fontWeight: isActive ? 600 : 400,
                        cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all var(--t)',
                        display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
                      }}>
                        <span style={{ fontSize: 11 }}>{cat.emoji}</span>
                        {cat.label}
                        {categoryCounts[cat.id] && (
                          <span style={{ fontSize: 11, opacity: 0.65 }}>{categoryCounts[cat.id]}</span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Sort */}
                <div style={{ display: 'flex', gap: 4 }}>
                  {(['trending', 'new', 'top'] as SortType[]).map(sort => (
                    <button key={sort} onClick={() => setSortBy(sort)} style={{
                      padding: '7px 12px', minHeight: 36,
                      borderRadius: 'var(--r-md)', border: '1px solid var(--border)',
                      background: sortBy === sort ? 'var(--text)' : 'transparent',
                      color: sortBy === sort ? 'var(--bg)' : 'var(--text-secondary)',
                      fontSize: 13, fontWeight: 500, cursor: 'pointer',
                      textTransform: 'capitalize', fontFamily: 'var(--font)', transition: 'all var(--t)',
                    }}>
                      {sort === 'trending' ? '🔥' : sort === 'new' ? '✨' : '⭐'}
                      <span className="sort-label"> {sort}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Results header */}
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: 'var(--sp-5)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>
                    {search ? `Results for "${search}"` : activeCategory === 'all' ? '⭐ All Sounds' : `${CATEGORIES.find(c => c.id === activeCategory)?.emoji} ${CATEGORIES.find(c => c.id === activeCategory)?.label} Soundboard`}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {filtered.length} sounds
                  </span>
                </div>

                {/* Keyboard hint */}
                <div style={{
                  fontSize: 11, color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', gap: 4,
                }} className="keyboard-hint">
                  <kbd style={{
                    padding: '2px 6px', border: '1px solid var(--border)',
                    borderRadius: 4, fontSize: 10, fontFamily: 'var(--font-mono)',
                    background: 'var(--bg-secondary)',
                  }}>1–9</kbd>
                  quick play
                  <kbd style={{
                    padding: '2px 6px', border: '1px solid var(--border)',
                    borderRadius: 4, fontSize: 10, fontFamily: 'var(--font-mono)',
                    background: 'var(--bg-secondary)',
                  }}>Space</kbd>
                  pause
                </div>
              </div>

              {/* Sound Grid */}
              <SoundGrid sounds={filtered} loading={loading} showIndex emptyMessage={`No sounds found for "${search}"`} />

              {/* Load more */}
              {filtered.length >= 24 && !search && (
                <div style={{ textAlign: 'center', marginTop: 'var(--sp-10)' }}>
                  <Link to={`/soundboard${activeCategory !== 'all' ? `/${activeCategory}` : ''}`}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '10px 28px', borderRadius: 'var(--r-md)',
                      border: '1px solid var(--border)', background: 'var(--bg)',
                      fontSize: 14, fontWeight: 500, color: 'var(--text)',
                      textDecoration: 'none', transition: 'all var(--t)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--bg)'}
                  >
                    Explore All {activeCategory !== 'all' ? CATEGORIES.find(c => c.id === activeCategory)?.label : ''} Sounds →
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* ── SEO Content Section ── */}
          <section style={{
            background: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border)',
            padding: 'var(--sp-12) 0',
          }}>
            <div className="container" style={{ maxWidth: 800 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: 'var(--text)' }}>
                What is ZapSoundboard?
              </h2>
              <p style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 12 }}>
                ZapSoundboard is a <strong>free online soundboard</strong> with 100k+ meme sounds, Discord soundboard buttons, and viral sound effects. Click any button to instantly play — no download, no signup required. Works on mobile, tablet, and desktop.
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 12 }}>
                Use our <strong>meme soundboard</strong> for Discord pranks, streaming, content creation, or just for fun. Categories include memes, gaming, reactions, brainrot, WhatsApp sounds, and more. All sounds are free to play and download.
              </p>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 20, marginBottom: 10, color: 'var(--text)' }}>
                How to use ZapSoundboard on Discord?
              </h3>
              <p style={{ fontSize: 15, lineHeight: 1.8 }}>
                Open ZapSoundboard in your browser, find your sound, and use a virtual audio cable or Discord's soundboard feature to play it in voice chat. Popular Discord sounds include join/leave notifications, game sounds, and viral meme clips.
              </p>
            </div>
          </section>
        </main>

        <Footer />
      </div>

      <style>{`
        @media (max-width: 640px) {
          .keyboard-hint { display: none !important; }
          .sort-label { display: none; }
        }
        @media (max-width: 360px) {
          .stats-row > div { font-size: 12px; }
        }
      `}</style>
    </>
  )
}
