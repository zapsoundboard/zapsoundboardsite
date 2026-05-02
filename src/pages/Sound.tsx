import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import SoundGrid from '@/components/sound/SoundGrid'
import { usePlayerStore } from '@/store'
import { getCategoryMeta } from '@/lib/categories'
import { incrementDownload } from '@/lib/supabase'
import type { Sound } from '@/lib/types'

// Mock — replace with getSoundBySlug(slug) from Supabase
const MOCK_SOUNDS: Sound[] = [
  { id:'1', title:'Vine Boom',       slug:'vine-boom',       category:'meme',    tags:['vine','boom','meme'],      r2_url:'/sounds/vine-boom.mp3',   r2_key:'approved/meme/vine-boom.mp3',  file_size:52000, duration:1.2, plays:88000, likes:6200, downloads:3100, is_featured:true,  is_ai_generated:false, status:'approved', created_at:'2024-01-01', description:'The iconic Vine Boom sound effect — a deep bass hit that became a staple of internet meme culture. Originally from a Vine video, this sound is now used everywhere from TikTok edits to Discord servers.' },
  { id:'2', title:'Bruh',            slug:'bruh',            category:'reaction',tags:['bruh','reaction'],          r2_url:'/sounds/bruh.mp3',         r2_key:'approved/reaction/bruh.mp3',   file_size:41000, duration:0.8, plays:62000, likes:4100, downloads:2050, is_featured:true,  is_ai_generated:false, status:'approved', created_at:'2024-01-02', description:'The classic "Bruh" sound effect — perfect for reacting to awkward moments, facepalm situations, and anything that deserves a deadpan response.' },
  { id:'3', title:'Oof',             slug:'oof',             category:'gaming',  tags:['oof','roblox','gaming'],    r2_url:'/sounds/oof.mp3',          r2_key:'approved/gaming/oof.mp3',      file_size:31000, duration:0.5, plays:92000, likes:6800, downloads:3400, is_featured:true,  is_ai_generated:false, status:'approved', created_at:'2024-01-03', description:'The Roblox "Oof" death sound — one of the most recognizable sounds in gaming. Used whenever something goes wrong or someone makes a mistake.' },
  { id:'4', title:'Goofy Ahh',       slug:'goofy-ahh',       category:'meme',    tags:['goofy','ahh','meme'],       r2_url:'/sounds/goofy-ahh.mp3',    r2_key:'approved/meme/goofy-ahh.mp3', file_size:55000, duration:1.5, plays:48000, likes:3200, downloads:1600, is_featured:true,  is_ai_generated:false, status:'approved', created_at:'2024-01-05', description:'The "Goofy Ahh" meme sound — a ridiculous vocal sound effect that became viral on TikTok. Perfect for reacting to absurd moments.' },
  { id:'5', title:'Discord Join',    slug:'discord-join',    category:'discord', tags:['discord','join','notif'],   r2_url:'/sounds/discord-join.mp3', r2_key:'approved/discord/join.mp3',   file_size:36000, duration:0.7, plays:55000, likes:3800, downloads:1900, is_featured:false, is_ai_generated:false, status:'approved', created_at:'2024-01-04', description:'The Discord voice channel join sound — that satisfying notification when someone joins your server. Instantly recognizable to any Discord user.' },
]

function fmtNum(n: number) {
  if (n >= 1000000) return `${(n/1000000).toFixed(1)}M`
  if (n >= 1000)    return `${(n/1000).toFixed(1)}k`
  return n.toString()
}

function fmtBytes(b: number) {
  return b > 1048576 ? `${(b/1048576).toFixed(1)} MB` : `${(b/1024).toFixed(0)} KB`
}

export default function SoundPage() {
  const { slug }  = useParams<{ slug: string }>()
  const [sound, setSound]     = useState<Sound | null>(null)
  const [related, setRelated] = useState<Sound[]>([])
  const [loading, setLoading] = useState(true)
  const [copied,  setCopied]  = useState(false)
  const [speed,   setSpeed]   = useState(1)

  const { play, pause, stop, currentSoundId, isPlaying, volume, setVolume, isLooping, toggleLoop } = usePlayerStore()
  const progressRef = useRef<HTMLDivElement>(null)
  const audioRef    = useRef<HTMLAudioElement | null>(null)
  const [progress,  setProgress]  = useState(0)
  const [duration,  setDuration]  = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  const isActive = currentSoundId === sound?.id && isPlaying

  useEffect(() => {
    setLoading(true)
    // Simulate async — replace with getSoundBySlug(slug)
    const found = MOCK_SOUNDS.find(s => s.slug === slug) ?? null
    setSound(found)
    if (found) {
      setRelated(MOCK_SOUNDS.filter(s => s.category === found.category && s.id !== found.id).slice(0, 8))
    }
    setLoading(false)
  }, [slug])

  // Dedicated audio for this page (for progress tracking)
  useEffect(() => {
    if (!sound) return
    const audio = new Audio(sound.r2_url)
    audioRef.current = audio
    audio.onloadedmetadata = () => setDuration(audio.duration)
    audio.ontimeupdate     = () => {
      setCurrentTime(audio.currentTime)
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0)
    }
    audio.onended = () => setProgress(0)
    return () => { audio.pause(); audio.src = '' }
  }, [sound])

  function handlePlay() {
    if (!sound) return
    play(sound.id, sound.r2_url)
  }

  function handleDownload() {
    if (!sound) return
    const a = document.createElement('a')
    a.href = sound.r2_url
    a.download = `${sound.slug}.mp3`
    a.click()
    incrementDownload(sound.id)
  }

  function handleShare() {
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleWhatsApp() {
    if (!sound) return
    const url  = window.location.href
    const text = `Check out this sound: ${sound.title} 🔊`
    window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`, '_blank')
  }

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!audioRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct  = (e.clientX - rect.left) / rect.width
    audioRef.current.currentTime = pct * duration
  }

  function changeSpeed(s: number) {
    setSpeed(s)
    if (audioRef.current) audioRef.current.playbackRate = s
  }

  function fmtTime(s: number) {
    if (!s || isNaN(s)) return '0:00'
    return `${Math.floor(s/60)}:${(Math.floor(s%60)).toString().padStart(2,'0')}`
  }

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
        <Navbar />
        <main style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ fontSize:40 }}>⏳</div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!sound) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
        <Navbar />
        <main style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12 }}>
          <div style={{ fontSize:48 }}>🔇</div>
          <h1 style={{ fontSize:24, fontWeight:700 }}>Sound not found</h1>
          <Link to="/" className="btn btn-primary">Back to Home</Link>
        </main>
        <Footer />
      </div>
    )
  }

  const cat = getCategoryMeta(sound.category)
  const shareUrl = `https://zapsoundboard.com/sounds/${sound.slug}`

  return (
    <>
      <Helmet>
        <title>{sound.title} Sound Button — Free Download | ZapSoundboard</title>
        <meta name="description" content={`Play and download the ${sound.title} sound effect free. ${sound.description ?? ''} No signup needed.`} />
        <link rel="canonical" href={shareUrl} />
        <meta property="og:title"       content={`${sound.title} — Free Sound Button`} />
        <meta property="og:description" content={`Play the ${sound.title} sound effect free on ZapSoundboard. ${fmtNum(sound.plays)} plays.`} />
        <meta property="og:url"         content={shareUrl} />
        <meta property="og:type"        content="website" />
        <script type="application/ld+json">{JSON.stringify({
          '@context':'https://schema.org','@type':'AudioObject',
          'name':sound.title,
          'description':sound.description ?? `${sound.title} sound effect`,
          'contentUrl':sound.r2_url,
          'encodingFormat':'audio/mpeg',
          'contentSize':fmtBytes(sound.file_size),
          'duration':sound.duration ? `PT${Math.ceil(sound.duration)}S` : undefined,
          'thumbnailUrl': `https://zapsoundboard.com/og/${sound.slug}.png`,
          'url':shareUrl,
          'breadcrumb':{'@type':'BreadcrumbList','itemListElement':[
            {'@type':'ListItem','position':1,'name':'Home','item':'https://zapsoundboard.com'},
            {'@type':'ListItem','position':2,'name':cat.label,'item':`https://zapsoundboard.com/soundboard/${cat.slug}`},
            {'@type':'ListItem','position':3,'name':sound.title,'item':shareUrl},
          ]},
        })}</script>
      </Helmet>

      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
        <Navbar />
        <main style={{ flex:1 }}>

          {/* Breadcrumb */}
          <div style={{ background:'var(--bg-secondary)', borderBottom:'1px solid var(--border)', padding:'10px 0' }}>
            <div className="container">
              <nav style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'var(--text-muted)' }}>
                <Link to="/" style={{ color:'var(--text-muted)', textDecoration:'none' }}>Home</Link>
                <span>›</span>
                <Link to={`/soundboard/${cat.slug}`} style={{ color:'var(--text-muted)', textDecoration:'none' }}>{cat.label}</Link>
                <span>›</span>
                <span style={{ color:'var(--text)' }}>{sound.title}</span>
              </nav>
            </div>
          </div>

          <div className="container" style={{ padding:'var(--sp-6) 0 var(--sp-16)' }}>
            <div className="sound-page-grid" style={{
              display:'grid',
              gridTemplateColumns:'minmax(300px,420px) 1fr',
              gap:'var(--sp-8)',
              alignItems:'start',
            }}>

              {/* ── Left — Player ── */}
              <div className="sound-player-col" style={{ position:'sticky', top:80 }}>
                <div style={{
                  background:'var(--bg)',
                  border:'1px solid var(--border)',
                  borderRadius:'var(--r-xl)',
                  overflow:'hidden',
                  boxShadow:'var(--shadow-md)',
                }}>
                  {/* Header */}
                  <div style={{
                    background:`linear-gradient(135deg,${cat.color}20 0%,${cat.color}08 100%)`,
                    padding:'var(--sp-8) var(--sp-6)',
                    textAlign:'center',
                    borderBottom:'1px solid var(--border)',
                  }}>
                    {/* Big play button */}
                    <button onClick={handlePlay} style={{
                      width:96, height:96, borderRadius:'50%',
                      background:cat.color, border:`4px solid ${cat.borderColor}`,
                      color:cat.textColor, cursor:'pointer',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      margin:'0 auto 20px',
                      boxShadow: isActive
                        ? `0 0 0 8px ${cat.color}25, 0 8px 32px ${cat.color}50`
                        : `0 4px 20px ${cat.color}35`,
                      transform: isActive ? 'scale(1.05)' : 'scale(1)',
                      transition:'all 200ms',
                      position:'relative',
                    }}>
                      {isActive && <>
                        <span style={{ position:'absolute', inset:-10, borderRadius:'50%', border:`2px solid ${cat.color}`, animation:'pulseRing 1s ease-out infinite', pointerEvents:'none' }} />
                        <span style={{ position:'absolute', inset:-18, borderRadius:'50%', border:`1px solid ${cat.color}60`, animation:'pulseRing 1s ease-out 0.4s infinite', pointerEvents:'none' }} />
                      </>}
                      {isActive ? (
                        <svg width="32" height="32" viewBox="0 0 24 24" fill={cat.textColor}>
                          <rect x="5" y="4" width="5" height="16" rx="1"/><rect x="14" y="4" width="5" height="16" rx="1"/>
                        </svg>
                      ) : (
                        <svg width="32" height="32" viewBox="0 0 24 24" fill={cat.textColor}>
                          <polygon points="6,3 21,12 6,21"/>
                        </svg>
                      )}
                    </button>

                    <h1 style={{ fontSize:20, fontWeight:800, color:'var(--text)', letterSpacing:'-0.02em', marginBottom:6 }}>
                      {sound.title}
                    </h1>
                    <span style={{
                      fontSize:12, padding:'3px 10px', borderRadius:'var(--r-full)',
                      background:`${cat.color}20`, color:cat.color, fontWeight:600,
                    }}>
                      {cat.emoji} {cat.label}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ padding:'var(--sp-4) var(--sp-5)' }}>
                    <div
                      onClick={handleProgressClick}
                      style={{
                        height:6, background:'var(--bg-tertiary)',
                        borderRadius:'var(--r-full)', cursor:'pointer',
                        marginBottom:6, overflow:'hidden',
                      }}
                    >
                      <div style={{
                        height:'100%', width:`${progress}%`,
                        background:`linear-gradient(90deg,${cat.color},${cat.color}cc)`,
                        borderRadius:'var(--r-full)',
                        transition:'width 0.1s linear',
                      }} />
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>
                      <span>{fmtTime(currentTime)}</span>
                      <span>{fmtTime(sound.duration ?? duration)}</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div style={{ padding:'0 var(--sp-5) var(--sp-4)' }}>
                    {/* Speed */}
                    <div style={{ marginBottom:14 }}>
                      <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:6, fontWeight:500 }}>Speed</div>
                      <div className="scroll-x" style={{ display:'flex', gap:4 }}>
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => (
                          <button key={s} onClick={() => changeSpeed(s)} style={{
                            flex:'0 0 auto', minWidth:44, minHeight:44, padding:'5px 8px',
                            borderRadius:'var(--r-sm)', border:'1px solid var(--border)',
                            background: speed===s ? cat.color : 'var(--bg-secondary)',
                            color: speed===s ? cat.textColor : 'var(--text-secondary)',
                            fontSize:12, fontWeight:600, cursor:'pointer',
                            fontFamily:'var(--font)', transition:'all var(--t)',
                            touchAction:'manipulation',
                          }}>{s}x</button>
                        ))}
                      </div>
                    </div>

                    {/* Volume */}
                    <div style={{ marginBottom:14 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text-muted)', marginBottom:6, fontWeight:500 }}>
                        <span>Volume</span>
                        <span style={{ fontFamily:'var(--font-mono)' }}>{Math.round(volume*100)}%</span>
                      </div>
                      <input type="range" min={0} max={1} step={0.05} value={volume}
                        onChange={e => setVolume(parseFloat(e.target.value))}
                        style={{ width:'100%', accentColor:cat.color, cursor:'pointer' }}
                      />
                    </div>

                    {/* Loop */}
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                      <span style={{ fontSize:13, color:'var(--text-secondary)', fontWeight:500 }}>Loop</span>
                      <button onClick={toggleLoop} style={{
                        width:40, height:22, borderRadius:11, border:'none',
                        background: isLooping ? cat.color : 'var(--bg-tertiary)',
                        cursor:'pointer', position:'relative', transition:'background 200ms',
                      }}>
                        <span style={{
                          position:'absolute', top:2, left:isLooping?20:2,
                          width:18, height:18, borderRadius:'50%',
                          background:'#fff', transition:'left 200ms', display:'block',
                        }} />
                      </button>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      <button onClick={handleDownload} style={{
                        height:48, minHeight:48, borderRadius:'var(--r-md)', border:'none',
                        background:cat.color, color:cat.textColor,
                        fontSize:15, fontWeight:700, cursor:'pointer',
                        fontFamily:'var(--font)', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                        transition:'opacity var(--t)', width:'100%', touchAction:'manipulation',
                      }}
                        onMouseEnter={e => e.currentTarget.style.opacity='0.9'}
                        onMouseLeave={e => e.currentTarget.style.opacity='1'}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Download MP3
                      </button>

                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                        <button onClick={handleShare} style={{
                          height:44, minHeight:44, borderRadius:'var(--r-md)',
                          border:'1px solid var(--border)', background:'var(--bg)',
                          color: copied ? 'var(--success)' : 'var(--text-secondary)',
                          fontSize:13, fontWeight:500, cursor:'pointer',
                          fontFamily:'var(--font)', display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                          transition:'all var(--t)', touchAction:'manipulation',
                        }}>
                          {copied ? '✓ Copied!' : '🔗 Copy Link'}
                        </button>
                        <button onClick={handleWhatsApp} style={{
                          height:44, minHeight:44, borderRadius:'var(--r-md)',
                          border:'1px solid #25d36640', background:'#25d36610',
                          color:'#25d366', fontSize:13, fontWeight:500,
                          cursor:'pointer', fontFamily:'var(--font)',
                          display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                          transition:'all var(--t)', touchAction:'manipulation',
                        }}>
                          📱 WhatsApp
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{
                    display:'grid', gridTemplateColumns:'repeat(3,1fr)',
                    borderTop:'1px solid var(--border)',
                  }}>
                    {[
                      { label:'Plays',     value:fmtNum(sound.plays),     icon:'▶' },
                      { label:'Likes',     value:fmtNum(sound.likes),     icon:'♥' },
                      { label:'Downloads', value:fmtNum(sound.downloads), icon:'⬇' },
                    ].map((stat,i) => (
                      <div key={stat.label} style={{
                        textAlign:'center', padding:'12px 8px',
                        borderRight: i<2 ? '1px solid var(--border)' : 'none',
                      }}>
                        <div style={{ fontSize:16, fontWeight:700, color:'var(--text)', fontFamily:'var(--font-mono)' }}>
                          {stat.value}
                        </div>
                        <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>
                          {stat.icon} {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FlashTTS CTA */}
                <a href="https://flashtts.com/voice-cloning" target="_blank" rel="noopener noreferrer" style={{
                  display:'flex', alignItems:'center', gap:12,
                  padding:'14px 16px', marginTop:12,
                  borderRadius:'var(--r-lg)',
                  background:'linear-gradient(135deg,#1a1200,#111)',
                  border:'1px solid rgba(245,197,24,0.2)',
                  textDecoration:'none', transition:'border-color var(--t)',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor='rgba(245,197,24,0.5)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor='rgba(245,197,24,0.2)'}
                >
                  <div style={{
                    width:36, height:36, borderRadius:8,
                    background:'#f5c518', display:'flex', alignItems:'center',
                    justifyContent:'center', fontSize:18, flexShrink:0,
                  }}>⚡</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:'#f5c518', marginBottom:2 }}>
                      Clone this voice style
                    </div>
                    <div style={{ fontSize:12, color:'#666' }}>
                      Generate unlimited AI TTS free →
                    </div>
                  </div>
                </a>
              </div>

              {/* ── Right — Info ── */}
              <div>
                {/* About */}
                {sound.description && (
                  <div style={{ marginBottom:'var(--sp-6)' }}>
                    <h2 style={{ fontSize:18, fontWeight:700, color:'var(--text)', letterSpacing:'-0.02em', marginBottom:10 }}>
                      About "{sound.title}"
                    </h2>
                    <p style={{ fontSize:15, lineHeight:1.8, color:'var(--text-secondary)' }}>
                      {sound.description}
                    </p>
                  </div>
                )}

                {/* How to use */}
                <div style={{
                  background:'var(--bg-secondary)', border:'1px solid var(--border)',
                  borderRadius:'var(--r-lg)', padding:'var(--sp-5)',
                  marginBottom:'var(--sp-6)',
                }}>
                  <h3 style={{ fontSize:16, fontWeight:700, color:'var(--text)', marginBottom:12, letterSpacing:'-0.01em' }}>
                    How to use on Discord
                  </h3>
                  {[
                    { n:'1', text:`Click "Download MP3" to save ${sound.title}` },
                    { n:'2', text:'Go to Discord Server Settings → Soundboard' },
                    { n:'3', text:'Click "Upload Sound" and select your file' },
                    { n:'4', text:'Use it in any voice channel!' },
                  ].map(step => (
                    <div key={step.n} style={{ display:'flex', gap:12, marginBottom:10, alignItems:'flex-start' }}>
                      <div style={{
                        width:24, height:24, borderRadius:'50%',
                        background:`${cat.color}20`, color:cat.color,
                        fontSize:12, fontWeight:700,
                        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                      }}>{step.n}</div>
                      <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.5, margin:0, paddingTop:2 }}>
                        {step.text}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                {sound.tags.length > 0 && (
                  <div style={{ marginBottom:'var(--sp-6)' }}>
                    <h3 style={{ fontSize:14, fontWeight:600, color:'var(--text)', marginBottom:10 }}>Tags</h3>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      {sound.tags.map(tag => (
                        <Link key={tag} to={`/search?q=${tag}`} style={{
                          padding:'4px 12px', borderRadius:'var(--r-full)',
                          border:'1px solid var(--border)', background:'var(--bg-secondary)',
                          fontSize:12, color:'var(--text-secondary)', textDecoration:'none',
                          transition:'all var(--t)',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--text)' }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-secondary)' }}
                        >
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sound details */}
                <div style={{
                  background:'var(--bg-secondary)', border:'1px solid var(--border)',
                  borderRadius:'var(--r-lg)', padding:'var(--sp-5)', marginBottom:'var(--sp-6)',
                }}>
                  <h3 style={{ fontSize:14, fontWeight:600, color:'var(--text)', marginBottom:12 }}>Sound Details</h3>
                  {[
                    { label:'Category',  value:`${cat.emoji} ${cat.label}` },
                    { label:'Format',    value:'MP3 Audio' },
                    { label:'File Size', value:fmtBytes(sound.file_size) },
                    { label:'Duration',  value:sound.duration ? `${sound.duration.toFixed(1)}s` : '—' },
                    { label:'License',   value:'Free to use' },
                  ].map(row => (
                    <div key={row.label} style={{
                      display:'flex', justifyContent:'space-between',
                      padding:'7px 0', borderBottom:'1px solid var(--border)',
                      fontSize:13,
                    }}>
                      <span style={{ color:'var(--text-secondary)' }}>{row.label}</span>
                      <span style={{ color:'var(--text)', fontWeight:500 }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Related sounds */}
                {related.length > 0 && (
                  <div>
                    <h2 style={{ fontSize:18, fontWeight:700, color:'var(--text)', letterSpacing:'-0.02em', marginBottom:16 }}>
                      Related {cat.label} Sounds
                    </h2>
                    <SoundGrid sounds={related} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>

      <style>{`
        @keyframes pulseRing {
          0%   { transform:scale(1); opacity:0.6; }
          100% { transform:scale(1.4); opacity:0; }
        }
        @media (max-width: 768px) {
          .sound-page-grid {
            grid-template-columns: 1fr !important;
          }
          .sound-player-col {
            position: static !important;
          }
        }
      `}</style>
    </>
  )
}
