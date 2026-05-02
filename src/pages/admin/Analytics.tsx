import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const GA_PROPERTY_ID = 'G-E6X061VCPX'

interface SiteStats {
  totalSounds: number
  totalPlays: number
  totalLikes: number
  pendingCount: number
  approvedToday: number
}

function StatCard({ label, value, icon, sub }: {
  label: string; value: string | number; icon: string; sub?: string
}) {
  return (
    <div style={{
      background: '#111', border: '1px solid #1e1e1e',
      borderRadius: 12, padding: '20px 22px',
      transition: 'border-color 150ms',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#2a2a2a'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e1e'}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <div style={{
        fontSize: 28, fontWeight: 800, color: '#fff',
        letterSpacing: '-0.03em', marginBottom: 4,
        fontFamily: 'var(--font-mono)',
      }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {sub && <div style={{ fontSize: 12, color: '#555' }}>{sub}</div>}
    </div>
  )
}

export default function Analytics() {
  const [stats, setStats] = useState<SiteStats>({
    totalSounds: 0, totalPlays: 0, totalLikes: 0,
    pendingCount: 0, approvedToday: 0,
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'ga' | 'realtime'>('overview')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [
        { count: totalSounds },
        { count: pendingCount },
        { count: approvedToday },
        { data: soundData },
      ] = await Promise.all([
        supabase.from('sounds').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('sounds').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('sounds').select('*', { count: 'exact', head: true })
          .eq('status', 'approved')
          .gte('approved_at', new Date().toISOString().split('T')[0]),
        supabase.from('sounds').select('plays, likes').eq('status', 'approved'),
      ])

      const totalPlays = soundData?.reduce((s, r) => s + (r.plays ?? 0), 0) ?? 0
      const totalLikes = soundData?.reduce((s, r) => s + (r.likes ?? 0), 0) ?? 0

      setStats({
        totalSounds: totalSounds ?? 0,
        totalPlays,
        totalLikes,
        pendingCount: pendingCount ?? 0,
        approvedToday: approvedToday ?? 0,
      })
      setLoading(false)
    }
    load()
  }, [])

  const tabs = [
    { id: 'overview', label: '📊 Site Overview' },
    { id: 'ga', label: '📈 Google Analytics' },
    { id: 'realtime', label: '🔴 Real-time' },
  ] as const

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 4 }}>
          Analytics
        </h1>
        <p style={{ fontSize: 14, color: '#555' }}>
          Site statistics + Google Analytics dashboard
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: '8px 16px', borderRadius: 8,
            border: activeTab === tab.id ? '1px solid #f5c518' : '1px solid #2a2a2a',
            background: activeTab === tab.id ? 'rgba(245,197,24,0.1)' : 'transparent',
            color: activeTab === tab.id ? '#f5c518' : '#888',
            fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400,
            cursor: 'pointer', fontFamily: 'var(--font)',
            transition: 'all 150ms',
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab 1: Site Overview ── */}
      {activeTab === 'overview' && (
        <div>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />
              ))}
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                <StatCard label="Total Sounds" value={stats.totalSounds} icon="🎵" sub="Approved & live" />
                <StatCard label="Total Plays" value={stats.totalPlays} icon="▶️" sub="All time" />
                <StatCard label="Total Likes" value={stats.totalLikes} icon="❤️" sub="All time" />
                <StatCard label="Pending Review" value={stats.pendingCount} icon="⏳" sub="Awaiting approval" />
              </div>

              {/* Quick links */}
              <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 14 }}>
                  Quick Links
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {[
                    { label: '📊 GA4 Dashboard', url: `https://analytics.google.com/analytics/web/#/p${GA_PROPERTY_ID.replace('G-', '')}/reports/` },
                    { label: '🔍 Search Console', url: 'https://search.google.com/search-console' },
                    { label: '☁️ CF Analytics', url: 'https://dash.cloudflare.com/analytics' },
                    { label: '💰 AdSense', url: 'https://www.google.com/adsense' },
                  ].map(link => (
                    <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" style={{
                      padding: '8px 14px', borderRadius: 8,
                      border: '1px solid #2a2a2a', background: 'transparent',
                      color: '#888', fontSize: 13, textDecoration: 'none',
                      transition: 'all 150ms', display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#f5c518'; e.currentTarget.style.color = '#f5c518' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#888' }}
                    >
                      {link.label} ↗
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Tab 2: Google Analytics Embed ── */}
      {activeTab === 'ga' && (
        <div>
          <div style={{
            background: '#111', border: '1px solid #1e1e1e',
            borderRadius: 12, overflow: 'hidden',
          }}>
            {/* Info bar */}
            <div style={{
              padding: '14px 20px', borderBottom: '1px solid #1a1a1a',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 2 }}>
                  Google Analytics 4
                </div>
                <div style={{ fontSize: 12, color: '#555' }}>Property: {GA_PROPERTY_ID}</div>
              </div>
              <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer"
                style={{
                  padding: '7px 14px', borderRadius: 8,
                  border: '1px solid #2a2a2a', background: 'transparent',
                  color: '#888', fontSize: 12, textDecoration: 'none',
                  transition: 'all 150ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#444' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#888'; e.currentTarget.style.borderColor = '#2a2a2a' }}
              >
                Open GA4 ↗
              </a>
            </div>

            {/* Embedded GA iframe */}
            <div style={{ padding: 20 }}>
              <div style={{
                background: '#0a0a0a', border: '1px solid #1a1a1a',
                borderRadius: 10, padding: 24, textAlign: 'center',
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📈</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 8 }}>
                  Google Analytics Dashboard
                </div>
                <div style={{ fontSize: 13, color: '#555', marginBottom: 20, maxWidth: 400, margin: '0 auto 20px' }}>
                  GA4 ka full dashboard embed nahi hota security reasons ki wajah se.
                  Direct GA4 open karo apna data dekhne ke liye.
                </div>
                <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '12px 28px', borderRadius: 8,
                    border: 'none', background: '#f5c518',
                    color: '#1a1400', fontSize: 14, fontWeight: 700,
                    textDecoration: 'none', transition: 'opacity 150ms',
                  }}
                >
                  Open Google Analytics →
                </a>

                {/* Key metrics cards */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: 12, marginTop: 28,
                }}>
                  {[
                    { label: 'Users', desc: 'Real-time + historical' },
                    { label: 'Sessions', desc: 'Page visit sessions' },
                    { label: 'Page Views', desc: 'Total pages viewed' },
                    { label: 'Avg Duration', desc: 'Time on site' },
                  ].map(m => (
                    <div key={m.label} style={{
                      background: '#111', border: '1px solid #1e1e1e',
                      borderRadius: 8, padding: '12px 14px', textAlign: 'left',
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#888', marginBottom: 2 }}>{m.label}</div>
                      <div style={{ fontSize: 11, color: '#444' }}>{m.desc}</div>
                      <div style={{ fontSize: 11, color: '#f5c518', marginTop: 6 }}>View in GA4 →</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 3: Real-time ── */}
      {activeTab === 'realtime' && (
        <div>
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%', background: '#ef4444',
                animation: 'pulse 1.5s ease infinite', display: 'inline-block',
              }} />
              <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Real-time Visitors</span>
            </div>

            <div style={{
              background: '#0a0a0a', border: '1px solid #1a1a1a',
              borderRadius: 10, padding: 24, textAlign: 'center', marginBottom: 20,
            }}>
              <div style={{ fontSize: 13, color: '#555', marginBottom: 16 }}>
                Real-time data Google Analytics mein available hai
              </div>
              <a href="https://analytics.google.com/analytics/web/#/realtime/overview" target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 24px', borderRadius: 8,
                  border: '1px solid #ef4444', background: 'rgba(239,68,68,0.1)',
                  color: '#ef4444', fontSize: 13, fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                🔴 Open Real-time in GA4
              </a>
            </div>

            {/* GA Setup instructions */}
            <div style={{ fontSize: 13, color: '#555', lineHeight: 1.8 }}>
              <div style={{ color: '#888', fontWeight: 600, marginBottom: 8 }}>GA4 Setup Status:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#22c55e' }}>✓</span>
                  <span>GA4 Property ID: <code style={{ color: '#f5c518' }}>{GA_PROPERTY_ID}</code></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#22c55e' }}>✓</span>
                  <span>Tracking script added to index.html</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#f59e0b' }}>⏳</span>
                  <span>Data collection starts after site goes live (24-48 hrs)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}