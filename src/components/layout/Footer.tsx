import { Link } from 'react-router-dom'
import { CATEGORIES } from '@/lib/categories'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Footer() {
  const year = new Date().getFullYear()
  const [promoEnabled, setPromoEnabled] = useState(false)

  useEffect(() => {
    supabase.from('site_settings').select('custom_ads_enabled').eq('id', 1).single()
      .then(({ data, error }) => {
        if (error) console.error(error)
        if (data) setPromoEnabled(data.custom_ads_enabled)
      })

    const channel = supabase.channel('site_settings_footer')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'site_settings' }, (payload) => {
        if (payload.new && typeof payload.new.custom_ads_enabled === 'boolean') {
          setPromoEnabled(payload.new.custom_ads_enabled)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <footer style={{
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border)',
      marginTop: 'auto',
    }}>
      {/* FlashTTS Banner */}
      {promoEnabled && (
        <div style={{
        background: '#0a0a0a',
        padding: 'var(--sp-10) 0',
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--sp-6)',
          flexWrap: 'wrap',
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(245,197,24,0.12)',
              border: '1px solid rgba(245,197,24,0.25)',
              borderRadius: 'var(--r-full)',
              padding: '3px 12px',
              fontSize: 11,
              fontWeight: 500,
              color: '#f5c518',
              marginBottom: 10,
            }}>
              ⚡ Powered by FlashTTS AI
            </div>
            <h3 style={{
              fontSize: 'clamp(18px, 2.5vw, 26px)',
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '-0.02em',
              marginBottom: 6,
            }}>
              Want your own AI voice?
            </h3>
            <p style={{ color: '#888', fontSize: 14, maxWidth: 400 }}>
              Clone your voice in 30 seconds. Generate TTS, soundboard clips, dub videos — free.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href="https://flashtts.com/signup" target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '11px 22px', borderRadius: 'var(--r-md)',
                background: '#f5c518', color: '#1a1400',
                fontSize: 14, fontWeight: 700, textDecoration: 'none',
                transition: 'opacity var(--t)',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Try FlashTTS Free →
            </a>
            <a href="https://flashtts.com/voice-cloning" target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '11px 22px', borderRadius: 'var(--r-md)',
                background: 'transparent', color: '#888',
                border: '1px solid #333', fontSize: 14, fontWeight: 500,
                textDecoration: 'none', transition: 'all var(--t)',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#666' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#888'; e.currentTarget.style.borderColor = '#333' }}
            >
              Clone Your Voice
            </a>
          </div>
        </div>
      </div>
      )}

      {/* Main Footer */}
      <div className="container" style={{ padding: 'var(--sp-10) var(--sp-6)' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 'var(--sp-8)',
          marginBottom: 'var(--sp-8)',
        }}>
          {/* Brand */}
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
            }}>
              <span style={{ fontSize: 20 }}>⚡</span>
              <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)', letterSpacing: '-0.02em' }}>
                ZapSoundboard
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 12 }}>
              Free online soundboard with 100k+ meme, Discord and funny sound buttons. No download, no signup required.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {/* Social icons */}
              {[
                { icon: '𝕏', href: 'https://twitter.com/zapsoundboard', label: 'Twitter' },
                { icon: '📱', href: 'https://tiktok.com/@zapsoundboard', label: 'TikTok' },
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>, href: 'https://youtube.com/@zapsoundboard', label: 'YouTube' },
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>, href: 'https://instagram.com/zapsoundboard', label: 'Instagram' },
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.004 0C8.618 0 5.61.854 5.61 4.542c0 1.258.948 2.378 2.052 2.946-.226 1.458-.934 3.32-2.316 4.67-.348.334-.726.634-1.12.898-1.558 1.054-3.568.612-4.102.398-.108-.042-.234-.022-.326.056-.092.08-.12.208-.07.316.596 1.3 1.83 2.186 3.12 2.502.268.066.544.116.824.148.244.756.912 1.954 2.216 2.658-.338.56-.99 1.442-2.266 1.874-.184.062-.27.27-.186.444.072.146.222.234.378.234.05 0 .1-.01.148-.026 2.298-.75 3.65-2.584 4.094-3.536.634.144 1.298.224 1.986.224s1.352-.08 1.986-.224c.444.952 1.796 2.786 4.094 3.536.048.016.098.026.148.026.156 0 .306-.088.378-.234.084-.174-.002-.382-.186-.444-1.276-.432-1.928-1.314-2.266-1.874 1.304-.704 1.972-1.902 2.216-2.658.28-.032.556-.082.824-.148 1.29-.316 2.524-1.202 3.12-2.502.05-.108.022-.236-.07-.316-.092-.078-.218-.098-.326-.056-.534.214-2.544.656-4.102-.398-.394-.264-.772-.564-1.12-.898-1.382-1.35-2.09-3.212-2.316-4.67 1.104-.568 2.052-1.688 2.052-2.946C18.398.854 15.39 0 12.004 0z"/></svg>, href: 'https://snapchat.com/add/zapsoundboard', label: 'Snapchat' },
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>, href: 'https://discord.gg/zapsoundboard', label: 'Discord' },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  title={s.label}
                  style={{
                    width: 32, height: 32, borderRadius: 'var(--r-md)',
                    border: '1px solid var(--border)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, textDecoration: 'none', color: 'var(--text-muted)',
                    transition: 'all var(--t)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--accent)'
                    e.currentTarget.style.color = 'var(--accent)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.color = 'var(--text-muted)'
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>
              Sound Categories
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {CATEGORIES.slice(0, 8).map(cat => (
                <Link key={cat.id} to={`/soundboard/${cat.slug}`}
                  style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', transition: 'color var(--t)', display: 'flex', alignItems: 'center', gap: 6 }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <span style={{ fontSize: 11 }}>{cat.emoji}</span>
                  {cat.label} Soundboard
                </Link>
              ))}
            </div>
          </div>

          {/* Popular searches */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>
              Popular Soundboards
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                'Meme Soundboard', 'Discord Soundboard', 'Goofy Ahh Soundboard',
                'Brainrot Soundboard', 'Rizz Soundboard', 'Funny Soundboard',
                'Soundboard Unblocked', 'Italian Brainrot Soundboard',
              ].map(term => (
                <Link key={term}
                  to={`/search?q=${encodeURIComponent(term)}`}
                  style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', transition: 'color var(--t)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>
              Quick Links
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'About',          to: '/about' },
                { label: 'Privacy',        to: '/privacy' },
                { label: 'Cookie Policy',  to: '/cookie-policy' },
                { label: 'Disclaimer',     to: '/disclaimer' },
                { label: 'Terms',          to: '/terms' },
                { label: 'DMCA',           to: '/dmca' },
                { label: 'Contact',        to: '/contact' },
                { label: 'Blog',           to: '/blog' },
                { label: 'Categories',     to: '/categories' },
              ].map(link => (
                <Link key={link.to} to={link.to}
                  style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', transition: 'color var(--t)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: 'var(--sp-5)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            © {year} ZapSoundboard · Free Online Soundboard · All sounds are used under their respective licenses.
          </p>
        </div>
      </div>
    </footer>
  )
}
