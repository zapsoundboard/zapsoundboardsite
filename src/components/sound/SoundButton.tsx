import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { usePlayerStore } from '@/store'
import { incrementDownload } from '@/lib/supabase'
import type { Sound } from '@/lib/types'
import { getCategoryMeta } from '@/lib/categories'

interface Props {
  sound: Sound
  index?: number
  showIndex?: boolean
}

export default function SoundButton({ sound, index, showIndex }: Props) {
  const { play, currentSoundId, isPlaying } = usePlayerStore()
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(sound.likes)
  const [copied, setCopied] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  const isActive = currentSoundId === sound.id && isPlaying
  const cat = getCategoryMeta(sound.category)

  const handlePlay = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    play(sound.id, sound.r2_url)
  }, [sound, play])

  const handleLike = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault()
    setLiked(p => { setLikeCount(c => p ? c - 1 : c + 1); return !p })
  }, [])

  const handleDownload = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault()
    const a = document.createElement('a')
    a.href = sound.r2_url; a.download = `${sound.slug}.mp3`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    incrementDownload(sound.id)
  }, [sound])

  const handleShare = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault()
    navigator.clipboard.writeText(`${window.location.origin}/sounds/${sound.slug}`).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1500)
    })
  }, [sound])

  const handleWhatsApp = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault()
    const url = `${window.location.origin}/sounds/${sound.slug}`
    window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this sound: ${sound.title} 🔊\n${url}`)}`, '_blank')
  }, [sound])

  function formatCount(n: number) {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
    return n.toString()
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 5, animation: `fadeUp 300ms ease ${(index ?? 0) * 20}ms both`,
    }}>
      {showIndex && index !== undefined && index < 9 && (
        <div style={{
          fontSize: 10, fontWeight: 600, color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)', background: 'var(--bg-secondary)',
          border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px', marginBottom: -2,
        }}>{index + 1}</div>
      )}

      {/* Button */}
      <button
        onClick={handlePlay}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={e => { setIsPressed(false); handlePlay(e as unknown as React.TouchEvent) }}
        title={`Play: ${sound.title}`}
        style={{
          position: 'relative',
          width: 'var(--sb-size, 80px)',
          height: 'var(--sb-size, 80px)',
          borderRadius: '50%',
          background: cat.borderColor,
          border: 'none',
          boxShadow: isPressed || isActive
            ? `0 2px 6px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.08)`
            : `0 6px 0 rgba(0,0,0,0.35), 0 8px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12)`,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          outline: 'none', flexShrink: 0,
          transition: 'transform 120ms ease, box-shadow 80ms ease',
          transform: isActive ? 'scale(1.06)' : isPressed ? 'scale(0.96) translateY(3px)' : 'scale(1)',
          touchAction: 'manipulation',
        }}
        onMouseEnter={e => {
          if (!isPressed) {
            e.currentTarget.style.transform = isActive ? 'scale(1.1)' : 'scale(1.08)'
            e.currentTarget.style.boxShadow = `0 9px 0 rgba(0,0,0,0.35), 0 14px 28px ${cat.color}55, inset 0 1px 0 rgba(255,255,255,0.12)`
          }
        }}
        onMouseLeave={e => {
          setIsPressed(false)
          e.currentTarget.style.transform = isActive ? 'scale(1.06)' : 'scale(1)'
          e.currentTarget.style.boxShadow = isActive
            ? `0 2px 6px rgba(0,0,0,0.5)`
            : `0 6px 0 rgba(0,0,0,0.35), 0 8px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12)`
        }}
      >
        {/* Inner dome */}
        <div style={{
          width: '90%', height: '90%', borderRadius: '50%',
          background: `radial-gradient(circle at 38% 30%, rgba(255,255,255,0.6) 0%, ${cat.color} 45%, ${cat.borderColor} 100%)`,
          boxShadow: isPressed
            ? `inset 0 5px 14px rgba(0,0,0,0.35), inset 0 -2px 6px rgba(255,255,255,0.08)`
            : `inset 0 -5px 12px rgba(0,0,0,0.2), inset 0 5px 10px rgba(255,255,255,0.2)`,
          transform: isPressed ? 'translateY(3px)' : 'translateY(0)',
          transition: 'transform 80ms ease, box-shadow 80ms ease',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '8%', left: '14%', width: '52%', height: '38%',
            borderRadius: '50%', background: 'rgba(255,255,255,0.35)', filter: 'blur(7px)',
            pointerEvents: 'none',
            transform: isPressed ? 'scale(0.85) translateY(2px)' : 'scale(1)',
            transition: 'transform 80ms ease',
          }} />

          {isActive ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill={cat.textColor} style={{ position: 'relative', zIndex: 1 }}>
              <rect x="5" y="5" width="14" height="14" rx="2"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill={cat.textColor} style={{ position: 'relative', zIndex: 1, marginLeft: 2 }}>
              <polygon points="7,4 21,12 7,20"/>
            </svg>
          )}

          {sound.is_ai_generated && (
            <span style={{
              position: 'absolute', top: 2, right: 2,
              background: '#f5c518', color: '#1a1400',
              borderRadius: 'var(--r-full)', fontSize: 8, fontWeight: 700, padding: '1px 4px',
              border: '1.5px solid white', zIndex: 2,
            }}>AI</span>
          )}
        </div>

        {isActive && (
          <>
            <span style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: `2px solid ${cat.color}`, animation: 'pulseRing 1s ease-out infinite', pointerEvents: 'none' }} />
            <span style={{ position: 'absolute', inset: -16, borderRadius: '50%', border: `1px solid ${cat.color}`, animation: 'pulseRing 1s ease-out 0.3s infinite', pointerEvents: 'none' }} />
          </>
        )}
      </button>

      {/* Title */}
      <Link to={`/sounds/${sound.slug}`} style={{
        fontSize: 11, fontWeight: 500, color: 'var(--text)', textAlign: 'center',
        maxWidth: '100%', lineHeight: 1.3,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        textDecoration: 'none', transition: 'color var(--t)',
      }}
        onMouseEnter={e => e.currentTarget.style.color = cat.color}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text)'}
      >
        {sound.title}
      </Link>

      {/* Play count — hidden below 360px */}
      <span className="plays-count" style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        {formatCount(sound.plays)}
      </span>

      {/* Actions */}
      <div className="sound-actions" style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <button onClick={handleLike} title="Like" style={{
          display: 'flex', alignItems: 'center', gap: 2, padding: '4px 6px',
          borderRadius: 'var(--r-sm)', border: 'none', background: 'transparent',
          cursor: 'pointer', fontSize: 11,
          color: liked ? '#ef4444' : 'var(--text-muted)',
          fontFamily: 'var(--font)', transition: 'all var(--t)',
          transform: liked ? 'scale(1.2)' : 'scale(1)',
          minHeight: 28, minWidth: 28, touchAction: 'manipulation',
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24"
            fill={liked ? '#ef4444' : 'none'}
            stroke={liked ? '#ef4444' : 'currentColor'}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          {likeCount > 0 && <span>{formatCount(likeCount)}</span>}
        </button>

        <button onClick={handleDownload} title="Download MP3" style={{
          padding: '4px 5px', borderRadius: 'var(--r-sm)', border: 'none',
          background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)',
          display: 'flex', alignItems: 'center', transition: 'color var(--t)',
          minHeight: 28, minWidth: 28, touchAction: 'manipulation',
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>

        <button onClick={handleShare} title={copied ? 'Copied!' : 'Copy link'} style={{
          padding: '4px 5px', borderRadius: 'var(--r-sm)', border: 'none',
          background: 'transparent', cursor: 'pointer',
          color: copied ? 'var(--success)' : 'var(--text-muted)',
          display: 'flex', alignItems: 'center', transition: 'color var(--t)',
          minHeight: 28, minWidth: 28, touchAction: 'manipulation',
        }}>
          {copied ? (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          ) : (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          )}
        </button>

        <button onClick={handleWhatsApp} title="Share on WhatsApp" style={{
          padding: '4px 5px', borderRadius: 'var(--r-sm)', border: 'none',
          background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)',
          display: 'flex', alignItems: 'center', transition: 'color var(--t)',
          minHeight: 28, minWidth: 28, touchAction: 'manipulation',
        }}
          onMouseEnter={e => e.currentTarget.style.color = '#25d366'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes pulseRing {
          0%   { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        /* Button size: 80px mobile, 88px tablet, 96px desktop */
        :root { --sb-size: 80px; }
        @media (min-width: 480px) { :root { --sb-size: 88px; } }
        @media (min-width: 768px) { :root { --sb-size: 96px; } }

        /* Hide play count on very small screens */
        @media (max-width: 359px) { .plays-count { display: none; } }

        /* Actions always visible on mobile; desktop: dimmed until hover */
        @media (min-width: 769px) {
          .sound-actions { opacity: 0.4; transition: opacity 150ms; }
          div:hover > .sound-actions { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
