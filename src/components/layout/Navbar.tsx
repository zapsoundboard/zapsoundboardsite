import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useThemeStore, usePlayerStore } from '@/store'
import AnnouncementBar from './AnnouncementBar'

const NAV_LINKS = [
  { label: 'Trending', href: '/trending' },
  { label: 'Meme',     href: '/soundboard/meme' },
  { label: 'Discord',  href: '/soundboard/discord' },
  { label: 'Gaming',   href: '/soundboard/gaming' },
  { label: 'Brainrot', href: '/soundboard/brainrot' },
]

const CAT_GRID = [
  { emoji: '😂', label: 'Meme',     href: '/soundboard/meme' },
  { emoji: '🎮', label: 'Discord',  href: '/soundboard/discord' },
  { emoji: '🕹️', label: 'Gaming',   href: '/soundboard/gaming' },
  { emoji: '🧠', label: 'Brainrot', href: '/soundboard/brainrot' },
]

const ICON_BTN: React.CSSProperties = {
  width: 34, height: 34, borderRadius: 'var(--r-md)',
  border: '1px solid var(--border)', background: 'transparent',
  cursor: 'pointer', color: 'var(--text-muted)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'all var(--t)', flexShrink: 0,
}

export default function Navbar() {
  const [searchOpen,     setSearchOpen]     = useState(false)
  const [searchVal,      setSearchVal]      = useState('')
  const [mobileOpen,     setMobileOpen]     = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const searchRef       = useRef<HTMLInputElement>(null)
  const navigate        = useNavigate()
  const location        = useLocation()
  const { theme, toggle } = useThemeStore()
  const { isPlaying, stop } = usePlayerStore()

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const s = localStorage.getItem('zap-recent-searches')
      if (s) setRecentSearches(JSON.parse(s))
    } catch { /* ignore */ }
  }, [])

  // Close mobile overlay on route change
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  // Lock body scroll when overlay open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault(); setSearchOpen(true); setMobileOpen(false)
      }
      if (e.key === 'Escape') { setSearchOpen(false); setMobileOpen(false) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => { if (searchOpen) searchRef.current?.focus() }, [searchOpen])

  function saveSearch(q: string) {
    const updated = [q, ...recentSearches.filter(s => s !== q)].slice(0, 5)
    setRecentSearches(updated)
    try { localStorage.setItem('zap-recent-searches', JSON.stringify(updated)) } catch { /* ignore */ }
  }

  function doSearch(q: string) {
    const trimmed = q.trim()
    if (!trimmed) return
    saveSearch(trimmed)
    navigate(`/search?q=${encodeURIComponent(trimmed)}`)
    setSearchOpen(false); setMobileOpen(false); setSearchVal('')
  }

  function isActive(href: string) {
    const path = href.split('?')[0]
    if (path === '/') return location.pathname === '/'
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <>
      <AnnouncementBar />

      <header style={{
        position: 'sticky', top: 0, zIndex: 100, height: 56,
        background: theme === 'dark' ? 'rgba(10,10,10,0.94)' : 'rgba(255,255,255,0.94)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)', transition: 'background var(--t-slow)',
      }}>
        <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>

          {/* ── Logo ── */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 'var(--r-md)',
              background: 'var(--accent)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 17,
              boxShadow: '0 2px 8px rgba(245,197,24,0.35)',
            }}>⚡</div>
            <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)', letterSpacing: '-0.03em' }}>
              Zap<span style={{ color: 'var(--accent)' }}>Sound</span>board
            </span>
          </Link>

          {/* ── Desktop Nav — absolutely centered ── */}
          <nav className="zap-desk" style={{
            display: 'flex', alignItems: 'center', gap: 2,
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          }}>
            {NAV_LINKS.map(link => {
              const active = isActive(link.href)
              return (
                <Link key={link.href} to={link.href} style={{
                  padding: '6px 11px', borderRadius: 'var(--r-md)',
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  color: active ? 'var(--text)' : 'var(--text-secondary)',
                  background: active ? 'var(--bg-secondary)' : 'transparent',
                  textDecoration: 'none', transition: 'all var(--t)', whiteSpace: 'nowrap',
                }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text)' } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' } }}
                >{link.label}</Link>
              )
            })}
          </nav>

          {/* ── Right side ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 'auto', flexShrink: 0 }}>

            {/* Search */}
            {searchOpen ? (
              <form onSubmit={e => { e.preventDefault(); doSearch(searchVal) }}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  ref={searchRef}
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  placeholder="Search sounds… (Esc to close)"
                  style={{
                    height: 34, padding: '0 12px',
                    border: '1px solid var(--accent)', borderRadius: 'var(--r-md)',
                    background: 'var(--bg)', color: 'var(--text)',
                    fontSize: 13, outline: 'none', width: 200,
                    fontFamily: 'var(--font)',
                    boxShadow: '0 0 0 3px rgba(245,197,24,0.15)',
                  }}
                />
                <button type="button" onClick={() => { setSearchOpen(false); setSearchVal('') }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)} title="Search (Ctrl+K)"
                className="zap-desk" style={ICON_BTN}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </button>
            )}

            {/* Now Playing */}
            {isPlaying && (
              <button onClick={stop} title="Now playing — click to stop" style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '0 10px', height: 30, borderRadius: 'var(--r-full)',
                border: '1px solid var(--accent)', background: 'rgba(245,197,24,0.1)',
                color: 'var(--accent)', fontSize: 11, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font)', flexShrink: 0,
              }}>
                <span style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 12 }}>
                  {[3, 6, 4, 8, 5].map((h, i) => (
                    <span key={i} style={{
                      width: 2, height: h, background: 'var(--accent)', borderRadius: 1,
                      animation: `zapWave .8s ease-in-out ${i * .12}s infinite alternate`,
                      display: 'inline-block',
                    }} />
                  ))}
                </span>
                <span className="zap-desk">Playing</span>
              </button>
            )}

            {/* Theme toggle */}
            <button onClick={toggle} title={theme === 'dark' ? 'Light mode' : 'Dark mode'} style={ICON_BTN}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              {theme === 'dark' ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>

            {/* Upload */}
            <Link to="/upload" className="zap-desk" style={{
              display: 'flex', alignItems: 'center', gap: 5,
              height: 34, padding: '0 12px', borderRadius: 'var(--r-md)',
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500,
              textDecoration: 'none', transition: 'all var(--t)', flexShrink: 0,
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Upload
            </Link>

            {/* FlashTTS */}
            <a href="https://flashtts.com" target="_blank" rel="noopener noreferrer"
              className="zap-desk" style={{
                display: 'flex', alignItems: 'center', gap: 5,
                height: 34, padding: '0 12px', borderRadius: 'var(--r-md)',
                background: 'var(--accent)', color: '#1a1400',
                fontSize: 13, fontWeight: 700, textDecoration: 'none',
                flexShrink: 0, transition: 'opacity var(--t)',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              ⚡ FlashTTS
            </a>

            {/* Hamburger (mobile only) */}
            <button
              onClick={() => setMobileOpen(true)}
              className="zap-mob"
              aria-label="Open menu"
              style={{ ...ICON_BTN, display: 'none' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Full-Screen Overlay ── */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'var(--bg)', display: 'flex', flexDirection: 'column',
          overflowY: 'auto', animation: 'zapSlide 180ms ease',
        }}>
          {/* Overlay header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 16px', height: 56, flexShrink: 0,
            borderBottom: '1px solid var(--border)',
            position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 1,
          }}>
            <Link to="/" onClick={() => setMobileOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚡</div>
              <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)', letterSpacing: '-0.02em' }}>ZapSoundboard</span>
            </Link>
            <button onClick={() => setMobileOpen(false)} style={{
              width: 40, height: 40, border: 'none', background: 'transparent',
              cursor: 'pointer', color: 'var(--text-muted)', fontSize: 24,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>×</button>
          </div>

          <div style={{ flex: 1, padding: '16px 16px 96px' }}>

            {/* Search */}
            <form onSubmit={e => { e.preventDefault(); doSearch(searchVal) }} style={{ marginBottom: 20 }}>
              <div style={{ position: 'relative' }}>
                <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  placeholder="Search 100k+ sounds…"
                  style={{
                    width: '100%', height: 48, paddingLeft: 44, paddingRight: 16,
                    border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
                    background: 'var(--bg-secondary)', color: 'var(--text)',
                    fontSize: 15, outline: 'none', fontFamily: 'var(--font)',
                    boxSizing: 'border-box', transition: 'border-color var(--t)',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                />
              </div>
              {/* Recent searches */}
              {recentSearches.length > 0 && !searchVal && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Recent</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {recentSearches.map(s => (
                      <button key={s} onClick={() => doSearch(s)} style={{
                        padding: '5px 12px', border: '1px solid var(--border)',
                        borderRadius: 'var(--r-full)', background: 'var(--bg-secondary)',
                        color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer',
                        fontFamily: 'var(--font)',
                      }}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
            </form>

            {/* Nav links */}
            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 28 }}>
              {NAV_LINKS.map(link => {
                const active = isActive(link.href)
                return (
                  <Link key={link.href} to={link.href} onClick={() => setMobileOpen(false)} style={{
                    display: 'flex', alignItems: 'center', minHeight: 48,
                    padding: '0 12px', borderRadius: 'var(--r-md)',
                    textDecoration: 'none', fontSize: 16, fontWeight: active ? 700 : 500,
                    color: active ? 'var(--accent)' : 'var(--text)',
                    background: active ? 'rgba(245,197,24,0.08)' : 'transparent',
                    transition: 'all var(--t)', marginBottom: 2,
                  }}>{link.label}</Link>
                )
              })}
            </div>

            {/* Category grid */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Browse Categories</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {CAT_GRID.map(cat => (
                  <Link key={cat.href} to={cat.href} onClick={() => setMobileOpen(false)} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '14px 16px', borderRadius: 'var(--r-md)',
                    border: '1px solid var(--border)', background: 'var(--bg-secondary)',
                    textDecoration: 'none', color: 'var(--text)', fontSize: 15, fontWeight: 500,
                    minHeight: 48, transition: 'all var(--t)',
                  }}>
                    <span style={{ fontSize: 22 }}>{cat.emoji}</span>
                    {cat.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link to="/upload" onClick={() => setMobileOpen(false)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                minHeight: 48, borderRadius: 'var(--r-md)',
                border: '1px solid var(--border)', background: 'transparent',
                color: 'var(--text)', fontSize: 15, fontWeight: 600, textDecoration: 'none',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Upload a Sound
              </Link>
              <a href="https://flashtts.com" target="_blank" rel="noopener noreferrer" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                minHeight: 48, borderRadius: 'var(--r-md)',
                background: 'var(--accent)', color: '#1a1400',
                fontSize: 15, fontWeight: 700, textDecoration: 'none',
              }}>⚡ Try FlashTTS Free</a>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Bottom Bar ── */}
      <nav className="zap-bottom" style={{
        display: 'none',
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 99,
        height: 56, background: 'var(--bg)', borderTop: '1px solid var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {([
          { label: 'Home',     href: '/',        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
          { label: 'Trending', href: '/trending', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> },
          { label: 'Search',   href: '/search',  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> },
          { label: 'Upload',   href: '/upload',  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> },
        ] as { label: string; href: string; icon: React.ReactNode }[]).map(item => {
          const active = isActive(item.href)
          return (
            <Link key={item.label} to={item.href} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', flex: 1, height: '100%',
              textDecoration: 'none', gap: 3, fontSize: 10, fontWeight: 500,
              color: active ? 'var(--accent)' : 'var(--text-muted)',
              transition: 'color var(--t)',
            }}>{item.icon}{item.label}</Link>
          )
        })}
        <button onClick={() => setMobileOpen(true)} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', flex: 1, height: '100%',
          border: 'none', background: 'none', cursor: 'pointer',
          color: mobileOpen ? 'var(--accent)' : 'var(--text-muted)',
          gap: 3, fontSize: 10, fontWeight: 500, fontFamily: 'var(--font)',
          transition: 'color var(--t)',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
          More
        </button>
      </nav>

      <style>{`
        @keyframes zapWave {
          from { transform: scaleY(.3); }
          to   { transform: scaleY(1); }
        }
        @keyframes zapSlide {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .zap-desk { display: none !important; }
          .zap-mob  { display: flex !important; }
          .zap-bottom { display: flex !important; }
          body { padding-bottom: calc(56px + env(safe-area-inset-bottom)); }
        }
      `}</style>
    </>
  )
}
