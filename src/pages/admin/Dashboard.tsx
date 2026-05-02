import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { Sound } from '@/lib/types'
import { getCategoryMeta } from '@/lib/categories'

interface VisitorStats {
  today:     number
  yesterday: number
  last7d:    number
  last30d:   number
  lastYear:  number
  last5y:    number
}

interface Stats {
  totalSounds:   number
  pendingCount:  number
  totalPlays:    number
  totalLikes:    number
  approvedToday: number
  totalAdViews:  number
  totalAdClicks: number
}

function StatCard({ label, value, icon, color, sub }: {
  label: string; value: number | string; icon: string; color: string; sub?: string
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
        <span style={{
          width: 36, height: 36, borderRadius: 8,
          background: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 17,
        }}>{icon}</span>
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

export default function AdminDashboard() {
  const [stats, setStats]     = useState<Stats>({ totalSounds: 0, pendingCount: 0, totalPlays: 0, totalLikes: 0, approvedToday: 0, totalAdViews: 0, totalAdClicks: 0 })
  const [visitorStats, setVisitorStats] = useState<VisitorStats>({ today: 0, yesterday: 0, last7d: 0, last30d: 0, lastYear: 0, last5y: 0 })
  const [pending, setPending] = useState<Sound[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        // Parallel fetches
        const [
          { count: totalSounds },
          { count: pendingCount },
          { count: approvedToday },
          { data: soundData },
          { data: pendingData },
          { data: customAdData },
        ] = await Promise.all([
          supabase.from('sounds').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
          supabase.from('sounds').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('sounds').select('*', { count: 'exact', head: true })
            .eq('status', 'approved')
            .gte('approved_at', new Date().toISOString().split('T')[0]),
          supabase.from('sounds').select('plays, likes').eq('status', 'approved'),
          supabase.from('sounds').select('*').eq('status', 'pending')
            .order('created_at', { ascending: false }).limit(5),
          supabase.from('custom_ads').select('impressions, clicks'),
        ])

        const totalPlays = soundData?.reduce((s, r) => s + (r.plays ?? 0), 0) ?? 0
        const totalLikes = soundData?.reduce((s, r) => s + (r.likes ?? 0), 0) ?? 0
        
        const adData = (customAdData ?? []) as any[]
        const totalAdViews = adData.reduce((s: number, r: any) => s + (r.impressions ?? 0), 0)
        const totalAdClicks = adData.reduce((s: number, r: any) => s + (r.clicks ?? 0), 0)

        setStats({
          totalSounds:   totalSounds  ?? 0,
          pendingCount:  pendingCount ?? 0,
          totalPlays,
          totalLikes,
          approvedToday: approvedToday ?? 0,
          totalAdViews,
          totalAdClicks,
        })
        setPending((pendingData ?? []) as Sound[])

        // Fetch Visitor Stats
        const now = new Date()
        const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
        const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString()
        const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30).toISOString()
        const yearStart = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString()
        const fiveYearStart = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate()).toISOString()

        const [vToday, vYesterday, vLast7d, vLast30d, vLastYear, vLast5y] = await Promise.all([
          supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', dayStart),
          supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', yesterdayStart).lt('created_at', dayStart),
          supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', weekStart),
          supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', monthStart),
          supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', yearStart),
          supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', fiveYearStart),
        ])

        setVisitorStats({
          today:     vToday.count ?? 0,
          yesterday: vYesterday.count ?? 0,
          last7d:    vLast7d.count ?? 0,
          last30d:   vLast30d.count ?? 0,
          lastYear:  vLastYear.count ?? 0,
          last5y:    vLast5y.count ?? 0,
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60)   return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24)    return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  function fmtBytes(b: number) {
    if (b > 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} MB`
    if (b > 1024)        return `${(b / 1024).toFixed(0)} KB`
    return `${b} B`
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 22, fontWeight: 800, color: '#fff',
          letterSpacing: '-0.03em', marginBottom: 4,
        }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 14, color: '#555' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16, marginBottom: 28,
        }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{
              background: '#111', border: '1px solid #1e1e1e',
              borderRadius: 12, padding: '20px 22px', height: 100,
            }} className="skeleton" />
          ))}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16, marginBottom: 28,
        }}>
          <StatCard label="Total Sounds"    value={stats.totalSounds}  icon="🎵" color="#f5c518" sub="Approved & live" />
          <StatCard label="Pending Review"  value={stats.pendingCount} icon="⏳" color="#ef4444" sub="Awaiting approval" />
          <StatCard label="Ad Impressions"  value={stats.totalAdViews} icon="📣" color="#a855f7" sub="Custom ads" />
          <StatCard label="Total Plays"     value={stats.totalPlays}   icon="▶️" color="#22c55e" sub="All time" />
        </div>
      )}

      {/* Visitors Section */}
      <div style={{
        background: '#111', border: '1px solid #1e1e1e',
        borderRadius: 12, padding: 24, marginBottom: 28,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Visitors Overview</h2>
            <p style={{ fontSize: 13, color: '#555', marginTop: 2 }}>Real-time traffic analytics</p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ padding: '4px 10px', background: '#1a1a1a', borderRadius: 6, fontSize: 11, color: '#666', border: '1px solid #222' }}>
              LIVE
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12,
        }}>
          {[
            { label: 'Today',     value: visitorStats.today,     icon: '📈', color: '#f5c518' },
            { label: 'Yesterday', value: visitorStats.yesterday, icon: '🗓️', color: '#888' },
            { label: '7 Days',    value: visitorStats.last7d,    icon: '📊', color: '#22c55e' },
            { label: '30 Days',   value: visitorStats.last30d,   icon: '📅', color: '#3b82f6' },
            { label: '1 Year',    value: visitorStats.lastYear,  icon: '⭐', color: '#a855f7' },
            { label: '5 Years',   value: visitorStats.last5y,    icon: '👑', color: '#ec4899' },
          ].map(v => (
            <div key={v.label} style={{
              padding: '16px', background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 10,
              display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{v.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{v.value.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: '#333' }}>page views</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: 20,
      }}>
        {/* Pending Queue Preview */}
        <div style={{
          background: '#111', border: '1px solid #1e1e1e',
          borderRadius: 12, overflow: 'hidden',
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #1a1a1a',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Pending Approval</span>
              {stats.pendingCount > 0 && (
                <span style={{
                  background: '#ef4444', color: '#fff',
                  borderRadius: 'var(--r-full)', fontSize: 11,
                  fontWeight: 700, padding: '1px 7px',
                }}>
                  {stats.pendingCount}
                </span>
              )}
            </div>
            <Link to="/admin/pending" style={{
              fontSize: 12, color: '#f5c518', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              View all →
            </Link>
          </div>

          {pending.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#444' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
              <p style={{ fontSize: 13 }}>No pending sounds — all clear!</p>
            </div>
          ) : (
            <div>
              {pending.map(sound => {
                const cat = getCategoryMeta(sound.category)
                return (
                  <div key={sound.id} style={{
                    padding: '12px 20px',
                    borderBottom: '1px solid #161616',
                    display: 'flex', alignItems: 'center', gap: 12,
                    transition: 'background 150ms',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#161616'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Category dot */}
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: `${cat.color}20`,
                      border: `1px solid ${cat.color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, flexShrink: 0,
                    }}>
                      {cat.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 500, color: '#fff',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        marginBottom: 2,
                      }}>
                        {sound.title}
                      </div>
                      <div style={{ fontSize: 11, color: '#555' }}>
                        {cat.label} · {fmtBytes(sound.file_size)} · {timeAgo(sound.created_at)}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      padding: '2px 8px', borderRadius: 'var(--r-full)',
                      background: '#1a1200', color: '#f5c518',
                      border: '1px solid #2a2000', flexShrink: 0,
                    }}>
                      pending
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            background: '#111', border: '1px solid #1e1e1e',
            borderRadius: 12, padding: 20,
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 14 }}>
              Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Pending',           to: '/admin/pending',      color: '#ef4444', icon: '⏳' },
                { label: 'Sounds',            to: '/admin/sounds',       color: '#22c55e', icon: '⬆️' },
                { label: 'Announcement',      to: '/admin/announcement', color: '#f5c518', icon: '📢' },
                { label: 'Ads',               to: '/admin/ads',          color: '#a855f7', icon: '📣' },
                { label: 'Blog',              to: '/admin/blog',         color: '#06b6d4', icon: '✏️' },
              ].map(action => (
                <Link key={action.to} to={action.to} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8,
                  border: '1px solid #1e1e1e',
                  background: 'transparent',
                  color: '#888', fontSize: 13, fontWeight: 500,
                  textDecoration: 'none', transition: 'all 150ms',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = `${action.color}10`
                    e.currentTarget.style.borderColor = `${action.color}30`
                    e.currentTarget.style.color = action.color
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.borderColor = '#1e1e1e'
                    e.currentTarget.style.color = '#888'
                  }}
                >
                  <span>{action.icon}</span>
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Today stats */}
          <div style={{
            background: 'linear-gradient(135deg, #1a1200 0%, #111 100%)',
            border: '1px solid #2a2000',
            borderRadius: 12, padding: 20,
          }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Approved Today</div>
            <div style={{
              fontSize: 36, fontWeight: 800, color: '#f5c518',
              letterSpacing: '-0.04em', fontFamily: 'var(--font-mono)',
            }}>
              {stats.approvedToday}
            </div>
            <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>sounds published</div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 1fr 320px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
