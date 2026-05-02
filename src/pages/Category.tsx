import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import SoundGrid from '@/components/sound/SoundGrid'
import { supabase } from '@/lib/supabase'
import { CATEGORIES, getCategoryMeta } from '@/lib/categories'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import type { Sound } from '@/lib/types'

const FAQ_MAP: Record<string, { q: string; a: string }[]> = {
  meme: [{ q: 'What are the best meme soundboard sounds?', a: 'Top meme sounds include Vine Boom, Bruh, Goofy Ahh, Sad Violin and What Da Dog Doin — all free on ZapSoundboard.' }, { q: 'Can I download meme sounds for free?', a: 'Yes! All sounds on ZapSoundboard are 100% free to download.' }, { q: 'How do I use meme sounds on Discord?', a: "Download the sound, then use Discord's built-in soundboard or a virtual audio cable to play in voice channels." }],
  discord: [{ q: 'What is a Discord soundboard?', a: 'A Discord soundboard lets you play sound effects in voice channels. ZapSoundboard has 50+ Discord-optimized sounds.' }, { q: 'How do I add sounds to Discord?', a: 'Go to Server Settings → Soundboard → Upload Sound. Download from ZapSoundboard and upload (max 512KB).' }, { q: 'What are the best Discord sounds?', a: 'Popular picks: join ping, leave sound, message notification — all free here.' }],
  gaming: [{ q: 'What gaming sounds are most popular?', a: 'Top gaming sounds: Roblox Oof, GTA Wasted, Fortnite Default Dance, MLG Air Horn — perfect for streams.' }, { q: 'Can I use gaming sounds for streaming?', a: 'Yes — all sounds are free for personal streaming.' }, { q: 'How do I play sounds during a stream?', a: 'Use OBS with a virtual audio cable or soundboard software. Download from ZapSoundboard.' }],
  brainrot: [{ q: 'What is brainrot content?', a: 'Brainrot = viral, absurd Gen-Z internet content. Italian brainrot, Rizz, Ohio memes are huge on TikTok and Discord.' }, { q: 'What are the best brainrot sounds?', a: 'Top picks: Italian Brainrot, Rizz, Ohio Rizz, Skibidi.' }, { q: 'Where did brainrot sounds come from?', a: 'Most originated on TikTok then spread to Discord.' }],
}
const DEFAULT_FAQ = [
  { q: 'How do I play sounds?', a: 'Click any sound button to play instantly. Click again to stop. Use 1-9 keys for quick play.' },
  { q: 'Are sounds free to download?', a: 'Yes! Every sound is free to play and download. No signup needed.' },
  { q: 'Can I upload my own sounds?', a: 'Yes! Click Upload in navbar. Sounds are reviewed within 24 hours.' },
]

// Categories with at least 1 approved sound
interface ActiveCategory {
  id: string
  label: string
  emoji: string
  color: string
  slug: string
  count: number
}

export default function CategoryPage() {
  const { category } = useParams<{ category?: string }>()
  const [sounds, setSounds] = useState<Sound[]>([])
  const [activeCategories, setActiveCategories] = useState<ActiveCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'trending' | 'new' | 'top'>('trending')

  const cat = category ? getCategoryMeta(category) : null
  useKeyboardShortcuts(sounds)

  // Fetch active categories (with at least 1 sound)
  useEffect(() => {
    async function loadCategories() {
      // Get count per sound_category from approved sounds
      const { data, error } = await supabase
        .from('sounds')
        .select('sound_category')
        .eq('status', 'approved')

      if (error || !data) return

      // Count sounds per category
      const countMap: Record<string, number> = {}
      data.forEach(row => {
        const c = row.sound_category as string
        countMap[c] = (countMap[c] ?? 0) + 1
      })

      // Only show categories with at least 1 sound
      const active: ActiveCategory[] = Object.entries(countMap)
        .filter(([, count]) => count >= 1)
        .map(([id, count]) => {
          const meta = getCategoryMeta(id)
          return {
            id,
            label: meta.label,
            emoji: meta.emoji,
            color: meta.color,
            slug: meta.slug,
            count,
          }
        })
        .sort((a, b) => b.count - a.count)

      setActiveCategories(active)
    }
    loadCategories()
  }, [])

  // Fetch sounds for selected category
  useEffect(() => {
    setLoading(true)
    setSearch('')

    async function loadSounds() {
      let q = supabase.from('sounds').select('*').eq('status', 'approved')
      if (category && category !== 'all') q = q.eq('sound_category', category)
      q = q.order('plays', { ascending: false }).limit(96)
      const { data, error } = await q
      if (!error && data) {
        setSounds(data.map(row => ({ ...row, category: row.sound_category })) as Sound[])
      }
      setLoading(false)
    }
    loadSounds()
  }, [category])

  const filtered = useMemo(() => {
    let s = [...sounds]
    if (search.trim()) {
      const q = search.toLowerCase()
      s = s.filter(x => x.title.toLowerCase().includes(q) || x.tags?.some((t: string) => t.includes(q)))
    }
    if (sort === 'trending') s.sort((a, b) => b.plays - a.plays)
    if (sort === 'top') s.sort((a, b) => b.likes - a.likes)
    if (sort === 'new') s.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return s
  }, [sounds, search, sort])

  const faqs = cat ? (FAQ_MAP[cat.id] ?? DEFAULT_FAQ) : DEFAULT_FAQ

  const pageTitle = cat
    ? `${cat.label} Soundboard — Free ${cat.label} Sound Buttons`
    : 'All Soundboards — Free Sound Buttons'
  const pageDesc = cat
    ? `Play & download free ${cat.label.toLowerCase()} sounds. ${filtered.length}+ ${cat.label.toLowerCase()} soundboard buttons. No signup needed.`
    : 'Browse free soundboard sounds across all categories. Meme, Discord, Gaming & more.'

  return (
    <>
      <Helmet>
        <title>{pageTitle} | ZapSoundboard</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={`https://zapsoundboard.com/soundboard${cat ? `/${cat.slug}` : ''}`} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org', '@type': 'CollectionPage',
          'name': pageTitle, 'description': pageDesc,
          'numberOfItems': filtered.length,
          'url': `https://zapsoundboard.com/soundboard${cat ? `/${cat.slug}` : ''}`,
        })}</script>
      </Helmet>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>

          {/* Hero */}
          <section style={{
            borderBottom: '1px solid var(--border)',
            padding: 'var(--sp-8) 0 var(--sp-6)',
            background: cat ? `linear-gradient(135deg,${cat.color}08 0%,transparent 60%)` : 'var(--bg)',
          }}>
            <div className="container">
              {/* Breadcrumb */}
              <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
                <span>›</span>
                <Link to="/soundboard" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Soundboard</Link>
                {cat && <><span>›</span><span style={{ color: 'var(--text)' }}>{cat.label}</span></>}
              </nav>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                {cat && (
                  <div style={{
                    width: 56, height: 56, borderRadius: 14,
                    background: `${cat.color}20`, border: `2px solid ${cat.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26, flexShrink: 0,
                  }}>{cat.emoji}</div>
                )}
                <div>
                  <h1 style={{ fontSize: 'clamp(22px,4vw,36px)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 6 }}>
                    {cat ? `${cat.label} Soundboard` : 'All Soundboards'}
                  </h1>
                  <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {cat ? cat.description : 'Browse all free soundboard buttons across categories'}
                    {' '}<span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)' }}>
                      ({loading ? '...' : filtered.length} sounds)
                    </span>
                  </p>
                </div>
              </div>

              {/* Active categories pills — horizontal scroll on mobile */}
              {!cat && (
                <div style={{ marginTop: 16 }}>
                  {activeCategories.length === 0 && !loading ? (
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      No sounds uploaded yet — upload sounds to see categories here.
                    </p>
                  ) : (
                    <div className="scroll-x" style={{ display: 'flex', gap: 8, paddingBottom: 4 }}>
                      {activeCategories.map(c => (
                        <Link key={c.id} to={`/soundboard/${c.slug}`} style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '8px 14px', minHeight: 40, flexShrink: 0,
                          borderRadius: 'var(--r-full)',
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
                          <span>{c.emoji}</span>
                          {c.label}
                          <span style={{
                            fontSize: 11, padding: '1px 6px', borderRadius: 'var(--r-full)',
                            background: `${c.color}20`, color: c.color, fontWeight: 600,
                          }}>{c.count}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Grid */}
          <section style={{ padding: 'var(--sp-6) 0 var(--sp-16)' }}>
            <div className="container">

              {/* Filters — search full width, sort row below on mobile */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ position: 'relative', width: '100%', marginBottom: 10 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round"
                    style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                  <input type="search" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder={`Search ${cat?.label.toLowerCase() ?? ''} sounds...`}
                    style={{
                      width: '100%', height: 46, paddingLeft: 38, paddingRight: 12,
                      border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
                      background: 'var(--bg)', color: 'var(--text)', fontSize: 16,
                      fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box',
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  />
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {(['trending', 'new', 'top'] as const).map(s => (
                    <button key={s} onClick={() => setSort(s)} style={{
                      padding: '0 12px', height: 40, minHeight: 40, borderRadius: 'var(--r-md)',
                      border: '1px solid var(--border)',
                      background: sort === s ? 'var(--text)' : 'transparent',
                      color: sort === s ? 'var(--bg)' : 'var(--text-secondary)',
                      fontSize: 13, fontWeight: 500, cursor: 'pointer',
                      fontFamily: 'var(--font)', transition: 'all var(--t)',
                      display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                      <span>{s === 'trending' ? '🔥' : s === 'new' ? '✨' : '⭐'}</span>
                      <span className="sort-text" style={{ textTransform: 'capitalize' }}>{s}</span>
                    </button>
                  ))}
                </div>
              </div>

              <SoundGrid
                sounds={filtered}
                loading={loading}
                showIndex
                emptyMessage={
                  category
                    ? `No sounds in ${cat?.label ?? category} category yet`
                    : 'No sounds uploaded yet'
                }
              />
            </div>
          </section>

          {/* SEO + FAQ */}
          <section style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', padding: 'var(--sp-12) 0' }}>
            <div className="container" style={{ maxWidth: 800 }}>
              {cat && (
                <>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 12, letterSpacing: '-0.02em' }}>
                    About {cat.label} Soundboard
                  </h2>
                  <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: 24 }}>
                    The ZapSoundboard <strong>{cat.label.toLowerCase()} soundboard</strong> has {filtered.length}+ free {cat.label.toLowerCase()} sounds. {cat.description}. Click to play instantly — no signup needed.
                  </p>
                </>
              )}
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.02em' }}>
                Frequently Asked Questions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {faqs.map((f, i) => (
                  <details key={i} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
                    <summary style={{ padding: '14px 18px', fontSize: 15, fontWeight: 600, color: 'var(--text)', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {f.q}<span style={{ fontSize: 18, color: 'var(--text-muted)', marginLeft: 12 }}>+</span>
                    </summary>
                    <div style={{ padding: '0 18px 14px', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{f.a}</div>
                  </details>
                ))}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>

      <style>{`
        @media (max-width: 480px) {
          .sort-text { display: none; }
        }
        details summary {
          min-height: 52px;
          display: flex;
          align-items: center;
        }
      `}</style>
    </>
  )
}