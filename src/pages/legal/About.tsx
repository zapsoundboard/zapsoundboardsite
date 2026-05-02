import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const STATS = [
  { value: '100k+', label: 'Sounds' },
  { value: '120k', label: 'Daily Plays' },
  { value: '9',    label: 'Categories' },
  { value: '100%', label: 'Free' },
]

const FEATURES = [
  {
    icon: '⚡',
    title: 'Instant Playback',
    desc: 'Zero-buffering audio playback. Every sound loads and fires instantly — no lag, no spinner.',
  },
  {
    icon: '🎮',
    title: 'Discord & Gaming Ready',
    desc: 'Built for streamers, Discord servers, and gaming sessions. Drop a sound mid-call with one click.',
  },
  {
    icon: '🔍',
    title: 'Smart Search',
    desc: 'Find any sound in seconds with full-text search across titles, tags, and categories.',
  },
  {
    icon: '📱',
    title: 'Works Everywhere',
    desc: 'Fully responsive — use it on desktop, tablet, or mobile. No app install required.',
  },
  {
    icon: '⬇️',
    title: 'Free Downloads',
    desc: 'Download any sound as an MP3 for free. Use it in your videos, streams, or projects.',
  },
  {
    icon: '🔥',
    title: 'Trending & Fresh',
    desc: 'Sounds ranked by community plays. New sounds added regularly to keep the board fresh.',
  },
]

const TEAM = [
  {
    name: 'Zap Team',
    role: 'Founders & Developers',
    avatar: '⚡',
    bio: 'A small team of developers and meme enthusiasts who got tired of paying for soundboards.',
  },
  {
    name: 'Community',
    role: 'Sound Curators',
    avatar: '🎵',
    bio: 'Hundreds of contributors who suggest, vote, and shape the sound library every day.',
  },
]

export default function AboutPage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  const [hoveredTeam,    setHoveredTeam]    = useState<number | null>(null)

  return (
    <>
      <Helmet>
        <title>About ZapSoundboard — Free Online Soundboard Platform</title>
        <meta
          name="description"
          content="ZapSoundboard is a free online soundboard with 100k+ meme, Discord and gaming sounds. Learn about our mission, story, features, and the team behind the platform."
        />
        <meta property="og:title"       content="About ZapSoundboard" />
        <meta property="og:description" content="Free online soundboard with 100k+ meme, Discord and gaming sounds." />
        <meta property="og:type"        content="website" />
        <link rel="canonical" href="https://zapsoundboard.com/about" />
      </Helmet>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>

          {/* ── Hero ── */}
          <section style={{
            borderBottom: '1px solid var(--border)',
            padding: 'var(--sp-12) 0 var(--sp-10)',
            background: 'var(--bg)',
          }}>
            <div className="container" style={{ maxWidth: 760 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)',
                borderRadius: 'var(--r-full)', padding: '4px 14px',
                fontSize: 12, fontWeight: 700, color: 'var(--accent-dark)',
                letterSpacing: '0.04em', textTransform: 'uppercase',
                marginBottom: 20,
              }}>
                ⚡ About Us
              </div>

              <h1 style={{
                fontSize: 'clamp(28px, 5vw, 48px)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                color: 'var(--text)',
                marginBottom: 16,
              }}>
                The free soundboard built{' '}
                <span style={{ color: 'var(--accent)' }}>for the internet</span>
              </h1>

              <p style={{
                fontSize: 'clamp(15px, 2vw, 17px)',
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                maxWidth: 600,
                marginBottom: 36,
              }}>
                ZapSoundboard is a free online soundboard platform with 100k+ meme, Discord, and gaming
                sounds — playable instantly in your browser, no account required.
              </p>

              {/* Stats row */}
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-4)',
              }}>
                {STATS.map(s => (
                  <div key={s.label} style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-lg)',
                    padding: '14px 24px',
                    textAlign: 'center',
                    minWidth: 90,
                  }}>
                    <div style={{
                      fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800,
                      color: 'var(--text)', letterSpacing: '-0.02em',
                    }}>
                      {s.value}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, marginTop: 2 }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="container" style={{ maxWidth: 760, padding: 'var(--sp-10) var(--sp-6) var(--sp-16)' }}>

            {/* ── Mission ── */}
            <section style={{ marginBottom: 'var(--sp-12)' }}>
              <div style={{
                background: 'var(--accent)', borderRadius: 'var(--r-xl)',
                padding: 'var(--sp-8) var(--sp-8)',
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-text)', opacity: 0.7, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
                  Our Mission
                </div>
                <p style={{
                  fontSize: 'clamp(16px, 2.5vw, 22px)', fontWeight: 700,
                  color: 'var(--accent-text)', lineHeight: 1.55, margin: 0,
                }}>
                  "Sound makes a moment. We want everyone — streamers, gamers, meme lords, and Discord mods —
                  to have instant access to the sounds that define internet culture, completely free."
                </p>
              </div>
            </section>

            {/* ── Story ── */}
            <section style={{ marginBottom: 'var(--sp-12)' }}>
              <SectionHeading emoji="📖" title="Our Story" />
              <div style={{
                display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)',
                fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.75,
              }}>
                <p style={{ margin: 0 }}>
                  ZapSoundboard started as a side project in 2023. We were Discord moderators who kept
                  bookmarking MP3 files in random folders, frustrated that every soundboard tool was either
                  bloated, paywalled, or buried under ads.
                </p>
                <p style={{ margin: 0 }}>
                  So we built our own — clean, fast, and free. What started as a personal tool for a few
                  Discord servers grew into a platform with over a hundred thousand daily plays. We now host
                  100k+ sounds across nine categories: Meme, Discord, Reaction, Gaming, Brainrot, Culture,
                  Music, Viral, and WhatsApp.
                </p>
                <p style={{ margin: 0 }}>
                  Every sound is hand-picked or community-requested. We keep the library fresh by adding new
                  sounds weekly, voting on community requests, and watching what the internet is doing.
                </p>
              </div>
            </section>

            {/* ── Features ── */}
            <section style={{ marginBottom: 'var(--sp-12)' }}>
              <SectionHeading emoji="✨" title="What Makes Us Different" />
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 'var(--sp-4)',
              }}>
                {FEATURES.map((f, i) => (
                  <div
                    key={f.title}
                    onMouseEnter={() => setHoveredFeature(i)}
                    onMouseLeave={() => setHoveredFeature(null)}
                    style={{
                      background: hoveredFeature === i ? 'var(--bg-secondary)' : 'var(--bg)',
                      border: `1px solid ${hoveredFeature === i ? 'var(--border-hover)' : 'var(--border)'}`,
                      borderRadius: 'var(--r-xl)',
                      padding: 'var(--sp-5)',
                      transition: 'background var(--t), border-color var(--t)',
                      cursor: 'default',
                    }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 'var(--r-lg)',
                      background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, marginBottom: 'var(--sp-3)',
                    }}>
                      {f.icon}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                      {f.title}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {f.desc}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── FlashTTS ── */}
            <section style={{ marginBottom: 'var(--sp-12)' }}>
              <SectionHeading emoji="🔗" title="Sister Platform" />
              <div style={{
                background: '#0a0a0a',
                borderRadius: 'var(--r-xl)',
                padding: 'var(--sp-7) var(--sp-8)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--sp-6)',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'rgba(245,197,24,0.15)', border: '1px solid rgba(245,197,24,0.3)',
                    borderRadius: 'var(--r-full)', padding: '3px 12px',
                    fontSize: 11, fontWeight: 700, color: '#f5c518',
                    letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14,
                  }}>
                    ⚡ Sister Platform
                  </div>
                  <h3 style={{
                    fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 800,
                    color: '#ffffff', marginBottom: 10, letterSpacing: '-0.02em',
                  }}>
                    FlashTTS — AI Voice Cloning
                  </h3>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, margin: 0, maxWidth: 420 }}>
                    Our companion tool for AI-generated speech. Clone any voice, generate custom TTS audio,
                    and drop it straight into your soundboard.
                  </p>
                </div>
                <a
                  href="https://flashtts.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '12px 24px', borderRadius: 'var(--r-lg)',
                    background: 'var(--accent)', color: 'var(--accent-text)',
                    fontSize: 14, fontWeight: 700, textDecoration: 'none',
                    transition: 'background var(--t)',
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
                >
                  Visit FlashTTS ↗
                </a>
              </div>
            </section>

            {/* ── Team ── */}
            <section style={{ marginBottom: 'var(--sp-12)' }}>
              <SectionHeading emoji="👥" title="The Team" />
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 'var(--sp-4)',
              }}>
                {TEAM.map((member, i) => (
                  <div
                    key={member.name}
                    onMouseEnter={() => setHoveredTeam(i)}
                    onMouseLeave={() => setHoveredTeam(null)}
                    style={{
                      background: hoveredTeam === i ? 'var(--bg-secondary)' : 'var(--bg)',
                      border: `1px solid ${hoveredTeam === i ? 'var(--border-hover)' : 'var(--border)'}`,
                      borderRadius: 'var(--r-xl)',
                      padding: 'var(--sp-6)',
                      display: 'flex', gap: 'var(--sp-4)', alignItems: 'flex-start',
                      transition: 'background var(--t), border-color var(--t)',
                    }}
                  >
                    <div style={{
                      width: 52, height: 52, borderRadius: 'var(--r-lg)',
                      background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 24, flexShrink: 0,
                    }}>
                      {member.avatar}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>
                        {member.name}
                      </div>
                      <div style={{
                        fontSize: 12, fontWeight: 600, color: 'var(--accent-dark)',
                        marginBottom: 8, letterSpacing: '0.02em',
                      }}>
                        {member.role}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {member.bio}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── CTA ── */}
            <section>
              <div style={{
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-xl)', padding: 'var(--sp-8)',
                textAlign: 'center',
              }}>
                <h2 style={{
                  fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: 800,
                  color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 10,
                }}>
                  Ready to zap some sounds?
                </h2>
                <p style={{
                  fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6,
                  marginBottom: 24, maxWidth: 400, margin: '0 auto 24px',
                }}>
                  Browse 100k+ sounds across meme, Discord, gaming, and more categories — completely free.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link to="/" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '12px 28px', borderRadius: 'var(--r-lg)',
                    background: 'var(--accent)', color: 'var(--accent-text)',
                    fontSize: 14, fontWeight: 700, textDecoration: 'none',
                    transition: 'background var(--t)',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
                  >
                    ⚡ Browse Sounds
                  </Link>
                  <Link to="/requests" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '12px 28px', borderRadius: 'var(--r-lg)',
                    background: 'var(--bg)', border: '1px solid var(--border)',
                    color: 'var(--text)', fontSize: 14, fontWeight: 600,
                    textDecoration: 'none', transition: 'border-color var(--t)',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                  >
                    🎵 Request a Sound
                  </Link>
                </div>
              </div>
            </section>

          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}

function SectionHeading({ emoji, title }: { emoji: string; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--sp-5)' }}>
      <span style={{
        width: 32, height: 32, borderRadius: 'var(--r-md)',
        background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 15, flexShrink: 0,
      }}>
        {emoji}
      </span>
      <h2 style={{
        fontSize: 'clamp(16px, 2.5vw, 20px)', fontWeight: 800,
        color: 'var(--text)', letterSpacing: '-0.02em', margin: 0,
      }}>
        {title}
      </h2>
    </div>
  )
}
