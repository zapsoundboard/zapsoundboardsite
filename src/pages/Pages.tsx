// ─── Search Page ──────────────────────────────────────
import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import SoundGrid from '@/components/sound/SoundGrid'
import type { Sound } from '@/lib/types'

const MOCK: Sound[] = [
  { id:'1', title:'Vine Boom',        slug:'vine-boom',       category:'meme',    tags:['vine','boom'],    r2_url:'/sounds/vine-boom.mp3',   r2_key:'', file_size:50000, plays:88000, likes:6200, downloads:3100, is_featured:true,  is_ai_generated:false, status:'approved', created_at:'2024-01-01' },
  { id:'2', title:'Bruh',             slug:'bruh',            category:'reaction',tags:['bruh'],           r2_url:'/sounds/bruh.mp3',         r2_key:'', file_size:40000, plays:62000, likes:4100, downloads:2050, is_featured:true,  is_ai_generated:false, status:'approved', created_at:'2024-01-02' },
  { id:'3', title:'Oof',              slug:'oof',             category:'gaming',  tags:['oof','roblox'],   r2_url:'/sounds/oof.mp3',          r2_key:'', file_size:30000, plays:92000, likes:6800, downloads:3400, is_featured:true,  is_ai_generated:false, status:'approved', created_at:'2024-01-03' },
  { id:'4', title:'Goofy Ahh',        slug:'goofy-ahh',       category:'meme',    tags:['goofy','meme'],   r2_url:'/sounds/goofy-ahh.mp3',    r2_key:'', file_size:55000, plays:48000, likes:3200, downloads:1600, is_featured:true,  is_ai_generated:false, status:'approved', created_at:'2024-01-05' },
  { id:'5', title:'Discord Join',     slug:'discord-join',    category:'discord', tags:['discord','join'], r2_url:'/sounds/discord-join.mp3', r2_key:'', file_size:35000, plays:55000, likes:3800, downloads:1900, is_featured:false, is_ai_generated:false, status:'approved', created_at:'2024-01-04' },
  { id:'6', title:'Rizz',             slug:'rizz',            category:'brainrot',tags:['rizz'],           r2_url:'/sounds/rizz.mp3',         r2_key:'', file_size:45000, plays:31000, likes:2100, downloads:1050, is_featured:false, is_ai_generated:false, status:'approved', created_at:'2024-01-06' },
  { id:'7', title:'Emotional Damage', slug:'emotional-damage',category:'reaction',tags:['emotional'],      r2_url:'/sounds/emotional.mp3',    r2_key:'', file_size:60000, plays:53000, likes:3600, downloads:1800, is_featured:false, is_ai_generated:false, status:'approved', created_at:'2024-01-07' },
  { id:'8', title:'Windows XP',       slug:'windows-xp-error',category:'culture', tags:['windows'],        r2_url:'/sounds/winxp.mp3',        r2_key:'', file_size:40000, plays:61000, likes:4200, downloads:2100, is_featured:false, is_ai_generated:false, status:'approved', created_at:'2024-01-08' },
]

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const [input, setInput]   = useState(params.get('q') ?? '')
  const query               = params.get('q') ?? ''

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return MOCK.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.tags.some(t => t.toLowerCase().includes(q)) ||
      s.category.includes(q)
    )
  }, [query])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (input.trim()) setParams({ q: input.trim() })
  }

  return (
    <>
      <Helmet>
        <title>{query ? `"${query}" Sounds — Search` : 'Search Sounds'} | ZapSoundboard</title>
        <meta name="description" content={`Search results for ${query} on ZapSoundboard. Find free meme, discord, and gaming sounds.`} />
        <meta name="robots" content="noindex" />
      </Helmet>
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
        <Navbar />
        <main style={{ flex:1 }}>
          <section style={{ borderBottom:'1px solid var(--border)', padding:'var(--sp-6) 0' }}>
            <div className="container" style={{ maxWidth:600 }}>
              <h1 style={{ fontSize:'clamp(20px,5vw,28px)', fontWeight:800, letterSpacing:'-0.03em', marginBottom:14 }}>
                {query ? `Results for "${query}"` : 'Search Sounds'}
              </h1>
              <form onSubmit={handleSubmit} style={{ display:'flex', gap:10 }}>
                <input type="search" value={input} onChange={e => setInput(e.target.value)}
                  placeholder='Try "bruh", "vine boom", "discord"...'
                  style={{
                    flex:1, height:48, padding:'0 16px',
                    border:'1.5px solid var(--border)', borderRadius:'var(--r-md)',
                    background:'var(--bg)', color:'var(--text)',
                    fontSize:16, fontFamily:'var(--font)', outline:'none', boxSizing:'border-box',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor='var(--accent)'}
                  onBlur={e => e.currentTarget.style.borderColor='var(--border)'}
                />
                <button type="submit" className="btn btn-primary" style={{ height:48, padding:'0 20px', flexShrink:0 }}>
                  Search
                </button>
              </form>
            </div>
          </section>
          <section style={{ padding:'var(--sp-6) 0 var(--sp-16)' }}>
            <div className="container">
              {query && (
                <p style={{ fontSize:14, color:'var(--text-muted)', marginBottom:20 }}>
                  {results.length} sound{results.length !== 1 ? 's' : ''} found for "{query}"
                </p>
              )}
              <SoundGrid sounds={results} emptyMessage={query ? `No sounds found for "${query}"` : 'Enter a search term above'} />
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  )
}

// ─── Trending Page ────────────────────────────────────
export function TrendingPage() {
  const sorted = [...MOCK].sort((a,b) => b.plays - a.plays)
  return (
    <>
      <Helmet>
        <title>Trending Sounds Today — Most Played | ZapSoundboard</title>
        <meta name="description" content="The most played soundboard sounds today. Trending meme sounds, Discord clips and viral audio — updated daily." />
        <link rel="canonical" href="https://zapsoundboard.com/trending" />
      </Helmet>
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
        <Navbar />
        <main style={{ flex:1 }}>
          <section style={{ borderBottom:'1px solid var(--border)', padding:'var(--sp-8) 0 var(--sp-6)' }}>
            <div className="container">
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <span style={{ fontSize:28 }}>🔥</span>
                <h1 style={{ fontSize:'clamp(22px,4vw,36px)', fontWeight:800, letterSpacing:'-0.03em' }}>
                  Trending Sounds
                </h1>
              </div>
              <p style={{ fontSize:15, color:'var(--text-secondary)' }}>
                Most played sounds in the last 24 hours · Updated every hour
              </p>
            </div>
          </section>
          <section style={{ padding:'var(--sp-6) 0 var(--sp-16)' }}>
            <div className="container">
              <SoundGrid sounds={sorted} showIndex />
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  )
}

// ─── Upload Page ──────────────────────────────────────
export function UploadPage() {
  const [file,     setFile]     = useState<File | null>(null)
  const [title,    setTitle]    = useState('')
  const [category, setCategory] = useState('meme')
  const [tags,     setTags]     = useState('')
  const [status,   setStatus]   = useState<'idle'|'uploading'|'success'|'error'>('idle')
  const [dragOver, setDragOver] = useState(false)

  const CATS = ['meme','discord','gaming','reaction','brainrot','culture','music','viral','anime','movies','sports','sfx']

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('audio/')) setFile(f)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !title.trim()) return
    setStatus('uploading')
    await new Promise(r => setTimeout(r, 1500))
    setStatus('success')
  }

  const fieldStyle: React.CSSProperties = {
    width:'100%', height:48, padding:'0 14px',
    border:'1px solid var(--border)', borderRadius:'var(--r-md)',
    background:'var(--bg)', color:'var(--text)',
    fontSize:16, fontFamily:'var(--font)', outline:'none', boxSizing:'border-box',
  }

  return (
    <>
      <Helmet>
        <title>Upload a Sound — Share Your Audio | ZapSoundboard</title>
        <meta name="description" content="Upload your own sound to ZapSoundboard. Share meme sounds, funny clips, and voice effects with millions of users. Free, no signup required." />
      </Helmet>
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
        <Navbar />
        <main style={{ flex:1, padding:'var(--sp-8) 0 var(--sp-16)' }}>
          <div className="container" style={{ maxWidth:560 }}>
            <h1 style={{ fontSize:'clamp(22px,5vw,32px)', fontWeight:800, letterSpacing:'-0.03em', marginBottom:6 }}>Upload a Sound</h1>
            <p style={{ fontSize:15, color:'var(--text-secondary)', marginBottom:24 }}>
              Share your sound with the ZapSoundboard community. All uploads are reviewed within 24 hours.
            </p>

            {status === 'success' ? (
              <div style={{
                background:'var(--success-bg)', border:'1px solid var(--success)',
                borderRadius:'var(--r-xl)', padding:'var(--sp-8)', textAlign:'center',
              }}>
                <div style={{ fontSize:40, marginBottom:12 }}>✅</div>
                <h2 style={{ fontSize:20, fontWeight:700, color:'var(--text)', marginBottom:8 }}>Upload Successful!</h2>
                <p style={{ color:'var(--text-secondary)', marginBottom:20 }}>
                  Your sound is under review. It will appear on the site within 24 hours if approved.
                </p>
                <button onClick={() => { setStatus('idle'); setFile(null); setTitle(''); setTags('') }}
                  className="btn btn-primary" style={{ width:'100%', maxWidth:280 }}>
                  Upload Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
                {/* Drop zone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onClick={() => document.getElementById('file-input')?.click()}
                  style={{
                    border:`2px dashed ${dragOver ? 'var(--accent)' : file ? 'var(--success)' : 'var(--border)'}`,
                    borderRadius:'var(--r-xl)', padding:'var(--sp-8)',
                    textAlign:'center', cursor:'pointer', minHeight:180,
                    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                    background: dragOver ? 'var(--accent-subtle)' : file ? 'var(--success-bg)' : 'var(--bg-secondary)',
                    transition:'all var(--t)',
                  }}
                >
                  <div style={{ fontSize:36, marginBottom:10 }}>{file ? '🎵' : '⬆️'}</div>
                  <div style={{ fontSize:15, fontWeight:600, color:'var(--text)', marginBottom:4 }}>
                    {file ? file.name : 'Tap to select or drop audio file'}
                  </div>
                  <div style={{ fontSize:13, color:'var(--text-muted)' }}>
                    {file ? `${(file.size/1024).toFixed(0)} KB` : 'MP3, WAV, OGG — max 5MB'}
                  </div>
                  <input id="file-input" type="file" accept="audio/*" style={{ display:'none' }}
                    onChange={e => { const f = e.target.files?.[0]; if(f) setFile(f) }}
                  />
                </div>

                <div>
                  <label style={{ display:'block', fontSize:14, fontWeight:500, color:'var(--text-secondary)', marginBottom:6 }}>
                    Sound Title *
                  </label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Vine Boom, Bruh, Discord Join"
                    maxLength={80} required style={fieldStyle}
                    onFocus={e => e.currentTarget.style.borderColor='var(--accent)'}
                    onBlur={e => e.currentTarget.style.borderColor='var(--border)'}
                  />
                </div>

                <div>
                  <label style={{ display:'block', fontSize:14, fontWeight:500, color:'var(--text-secondary)', marginBottom:6 }}>
                    Category *
                  </label>
                  <select value={category} onChange={e => setCategory(e.target.value)}
                    style={{ ...fieldStyle, cursor:'pointer' }}>
                    {CATS.map(c => <option key={c} value={c} style={{ textTransform:'capitalize' }}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display:'block', fontSize:14, fontWeight:500, color:'var(--text-secondary)', marginBottom:6 }}>
                    Tags (comma separated)
                  </label>
                  <input type="text" value={tags} onChange={e => setTags(e.target.value)}
                    placeholder="meme, funny, viral, discord"
                    style={fieldStyle}
                    onFocus={e => e.currentTarget.style.borderColor='var(--accent)'}
                    onBlur={e => e.currentTarget.style.borderColor='var(--border)'}
                  />
                </div>

                <p style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.6 }}>
                  By uploading, you confirm this sound does not violate any copyright.
                  See our <Link to="/dmca" style={{ color:'var(--accent)' }}>DMCA policy</Link>.
                </p>

                <button type="submit" disabled={!file || !title || status==='uploading'}
                  className="btn btn-primary" style={{ height:52, fontSize:15, width:'100%' }}>
                  {status === 'uploading' ? 'Uploading...' : '⬆️ Submit Sound for Review'}
                </button>
              </form>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}

// ─── 404 Page ─────────────────────────────────────────
export function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>404 — Page Not Found | ZapSoundboard</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
        <Navbar />
        <main style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'20px' }}>
          <div style={{ fontSize:56, marginBottom:12 }}>🔇</div>
          <h1 style={{ fontSize:'clamp(28px,6vw,40px)', fontWeight:800, letterSpacing:'-0.03em', marginBottom:8 }}>404</h1>
          <p style={{ fontSize:16, color:'var(--text-secondary)', marginBottom:6 }}>Page not found</p>
          <p style={{ fontSize:14, color:'var(--text-muted)', marginBottom:24, maxWidth:320 }}>
            This sound doesn't exist yet. Check out our latest sounds!
          </p>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center', width:'100%', maxWidth:320 }}>
            <Link to="/" className="btn btn-primary" style={{ flex:1, minWidth:130 }}>🏠 Go Home</Link>
            <Link to="/trending" className="btn btn-secondary" style={{ flex:1, minWidth:130 }}>🔥 Trending</Link>
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}

// ─── Placeholder pages ────────────────────────────────
function Placeholder({ title }: { title: string }) {
  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      <Navbar />
      <main style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:12 }}>🚧</div>
        <h1 style={{ fontSize:22, fontWeight:700, marginBottom:8 }}>{title}</h1>
        <p style={{ color:'var(--text-secondary)' }}>Coming soon!</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop:20 }}>← Back to Home</Link>
      </main>
      <Footer />
    </div>
  )
}

export const RequestsPage    = () => <Placeholder title="Sound Requests" />
export const BlogPage        = () => <Placeholder title="Blog — Coming Soon" />
export const BlogPostPage    = () => <Placeholder title="Blog Post" />
export const AdminBlog       = () => <Placeholder title="Blog Editor" />
