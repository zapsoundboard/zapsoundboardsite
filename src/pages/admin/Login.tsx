import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAdminStore } from '@/store'

export default function AdminLogin() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const navigate                = useNavigate()
  const { setUser }             = useAdminStore()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 1. Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email, password,
      })
      if (authError) throw new Error(authError.message)
      if (!authData.user) throw new Error('Login failed')

      // 2. Check is_admin flag
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, username, is_admin')
        .eq('id', authData.user.id)
        .single()

      if (userError || !userData) throw new Error('User not found')
      if (!userData.is_admin)    throw new Error('Access denied — not an admin account')

      // 3. Save to store
      setUser({
        id:         userData.id,
        email:      userData.email,
        username:   userData.username,
        is_admin:   true,
        created_at: authData.user.created_at,
      })

      navigate('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      fontFamily: 'var(--font)',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div style={{
        width: '100%', maxWidth: 400,
        position: 'relative', zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: '#f5c518',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, margin: '0 auto 16px',
            boxShadow: '0 4px 24px rgba(245,197,24,0.35)',
          }}>⚡</div>
          <h1 style={{
            fontSize: 22, fontWeight: 800, color: '#fff',
            letterSpacing: '-0.03em', marginBottom: 6,
          }}>
            ZapSoundboard
          </h1>
          <p style={{ fontSize: 14, color: '#666' }}>Admin Panel — Secure Login</p>
        </div>

        {/* Card */}
        <div style={{
          background: '#111',
          border: '1px solid #222',
          borderRadius: 16,
          padding: '32px 28px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
        }}>
          <h2 style={{
            fontSize: 17, fontWeight: 700, color: '#fff',
            marginBottom: 24, letterSpacing: '-0.02em',
          }}>
            Sign in to Admin
          </h2>

          {/* Error */}
          {error && (
            <div style={{
              background: '#1a0a0a', border: '1px solid #3a1a1a',
              borderRadius: 8, padding: '10px 14px',
              marginBottom: 20, fontSize: 13, color: '#ff6b6b',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block', fontSize: 13, fontWeight: 500,
                color: '#a0a0a0', marginBottom: 6,
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@zapsoundboard.com"
                required
                style={{
                  width: '100%', height: 44,
                  padding: '0 14px',
                  background: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: 8,
                  color: '#fff', fontSize: 14,
                  fontFamily: 'var(--font)',
                  outline: 'none',
                  transition: 'border-color 150ms',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#f5c518'}
                onBlur={e => e.currentTarget.style.borderColor = '#2a2a2a'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block', fontSize: 13, fontWeight: 500,
                color: '#a0a0a0', marginBottom: 6,
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%', height: 44,
                  padding: '0 14px',
                  background: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: 8,
                  color: '#fff', fontSize: 14,
                  fontFamily: 'var(--font)',
                  outline: 'none',
                  transition: 'border-color 150ms',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#f5c518'}
                onBlur={e => e.currentTarget.style.borderColor = '#2a2a2a'}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', height: 44,
                background: loading ? '#c9a000' : '#f5c518',
                color: '#1a1400',
                border: 'none', borderRadius: 8,
                fontSize: 14, fontWeight: 700,
                cursor: loading ? 'wait' : 'pointer',
                fontFamily: 'var(--font)',
                transition: 'all 150ms',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8,
              }}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                  Sign In to Admin
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back link */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <a href="/" style={{ fontSize: 13, color: '#555', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = '#888'}
            onMouseLeave={e => e.currentTarget.style.color = '#555'}
          >
            ← Back to ZapSoundboard
          </a>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
