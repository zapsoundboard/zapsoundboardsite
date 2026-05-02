import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAdminStore } from '@/store'

interface NavItem {
  label:  string
  href:   string
  icon:   React.ReactNode
  badge?: number
}

function Icon({ d }: { d: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <path d={d}/>
    </svg>
  )
}

export default function AdminLayout() {
  const [pendingCount, setPendingCount] = useState(0)
  const [collapsed, setCollapsed]       = useState(false)
  const navigate                        = useNavigate()
  const location                        = useLocation()
  const { user, logout }                = useAdminStore()

  useEffect(() => {
    // Fetch pending count
    supabase.from('sounds').select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .then(({ count }) => setPendingCount(count ?? 0))
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    logout()
    navigate('/admin/login')
  }

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href:  '/admin',
      icon:  <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10"/>,
    },
    {
      label: 'Pending',
      href:  '/admin/pending',
      badge: pendingCount,
      icon:  <Icon d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 6v4l3 3"/>,
    },
    {
      label: 'Sounds',
      href:  '/admin/sounds',
      icon:  <Icon d="M9 18V5l12-2v13 M6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm12-2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>,
    },
    {
      label: 'Announcement',
      href:  '/admin/announcement',
      icon:  <Icon d="M22 12h-4l-3 9L9 3l-3 9H2"/>,
    },
    {
      label: 'Ads',
      href:  '/admin/ads',
      icon:  <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>,
    },
    {
      label: 'Blog',
      href:  '/admin/blog',
      icon:  <Icon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>,
    },
    {
      label: 'Categories',
      href:  '/admin/categories',
      icon:  <Icon d="M4 6h16M4 12h16M4 18h7"/>,
    },
    {
      label: 'Analytics',
      href:  '/admin/analytics',
      icon:  <Icon d="M18 20V10M12 20V4M6 20v-6"/>,
    },
    {
      label: 'Bulk Upload',
      href:  '/admin/bulk-upload',
      icon:  <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12"/>,
    },
  ]

  useEffect(() => {
    const currentNav = navItems.find(item => item.href === location.pathname)
    if (currentNav) {
      document.title = currentNav.label
    } else {
      document.title = 'ZapSoundboard Admin'
    }
  }, [location.pathname])

  const sidebarW = collapsed ? 64 : 240

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#0a0a0a',
      fontFamily: 'var(--font)',
    }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: sidebarW,
        flexShrink: 0,
        background: '#0f0f0f',
        borderRight: '1px solid #1a1a1a',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 50,
        transition: 'width 200ms ease',
        overflow: 'hidden',
      }}>

        {/* Logo */}
        <div style={{
          padding: collapsed ? '20px 0' : '20px 20px',
          borderBottom: '1px solid #1a1a1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: 10,
          minHeight: 64,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: '#f5c518',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 17, flexShrink: 0,
            }}>⚡</div>
            {!collapsed && (
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
                  ZapSoundboard
                </div>
                <div style={{ fontSize: 11, color: '#555' }}>Admin Panel</div>
              </div>
            )}
          </div>
          {!collapsed && (
            <button onClick={() => setCollapsed(true)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#555', padding: 4, borderRadius: 4, display: 'flex',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          )}
          {collapsed && (
            <button onClick={() => setCollapsed(false)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#555', padding: 4, borderRadius: 4, display: 'flex',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {navItems.map(item => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/admin'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: collapsed ? '10px 0' : '9px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 8,
                marginBottom: 2,
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#f5c518' : '#888',
                background: isActive ? 'rgba(245,197,24,0.08)' : 'transparent',
                border: isActive ? '1px solid rgba(245,197,24,0.15)' : '1px solid transparent',
                transition: 'all 150ms',
                position: 'relative',
              })}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement
                if (!el.classList.contains('active')) {
                  el.style.background = '#1a1a1a'
                  el.style.color = '#fff'
                }
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement
                if (!el.classList.contains('active')) {
                  el.style.background = 'transparent'
                  el.style.color = '#888'
                }
              }}
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && (
                <>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge ? (
                    <span style={{
                      background: '#ef4444',
                      color: '#fff',
                      borderRadius: 'var(--r-full)',
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '1px 6px',
                      minWidth: 18,
                      textAlign: 'center',
                    }}>
                      {item.badge}
                    </span>
                  ) : null}
                </>
              )}
              {/* Collapsed badge dot */}
              {collapsed && item.badge ? (
                <span style={{
                  position: 'absolute', top: 6, right: 6,
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#ef4444',
                }} />
              ) : null}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={{
          padding: '12px 8px',
          borderTop: '1px solid #1a1a1a',
        }}>
          {!collapsed && user && (
            <div style={{
              padding: '8px 12px',
              marginBottom: 6,
              background: '#1a1a1a',
              borderRadius: 8,
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 2 }}>
                {user.username ?? user.email.split('@')[0]}
              </div>
              <div style={{ fontSize: 11, color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 8,
              padding: collapsed ? '10px 0' : '9px 12px',
              background: 'transparent',
              border: '1px solid transparent',
              borderRadius: 8,
              color: '#555',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'var(--font)',
              transition: 'all 150ms',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#1a0a0a'
              e.currentTarget.style.color = '#ef4444'
              e.currentTarget.style.borderColor = '#2a1010'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#555'
              e.currentTarget.style.borderColor = 'transparent'
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {!collapsed && 'Logout'}
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={{
        flex: 1,
        marginLeft: sidebarW,
        transition: 'margin-left 200ms ease',
        minHeight: '100vh',
        background: '#0a0a0a',
      }}>
        {/* Top bar */}
        <div style={{
          height: 56,
          borderBottom: '1px solid #1a1a1a',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          background: '#0a0a0a',
          zIndex: 40,
        }}>
          <div style={{ fontSize: 13, color: '#555' }}>
            ZapSoundboard Admin
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 8,
                border: '1px solid #222', background: 'transparent',
                color: '#888', fontSize: 12, textDecoration: 'none',
                transition: 'all 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#222'; e.currentTarget.style.color = '#888' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              View Site
            </a>
          </div>
        </div>

        {/* Page content */}
        <div style={{ padding: 24 }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
