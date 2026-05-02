import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { CATEGORIES } from '@/lib/categories'

interface Request {
  id:       string
  title:    string
  category: string
  votes:    number
  status:   'pending' | 'fulfilled'
  voted:    boolean
}

const MOCK_REQUESTS: Request[] = [
  { id:'1', title:'Among Us Emergency Meeting Sound', category:'gaming',   votes:234, status:'pending',   voted:false },
  { id:'2', title:'Pakistani Tiktok Viral Sound',     category:'viral',    votes:189, status:'pending',   voted:false },
  { id:'3', title:'Skibidi Toilet Theme',             category:'brainrot', votes:156, status:'pending',   voted:false },
  { id:'4', title:'Valorant Ace Sound',               category:'gaming',   votes:142, status:'fulfilled', voted:false },
  { id:'5', title:'Arabic Meme Sound (Habibi)',       category:'meme',     votes:98,  status:'pending',   voted:false },
  { id:'6', title:'WhatsApp Status Download Sound',   category:'whatsapp', votes:87,  status:'pending',   voted:false },
]

export default function RequestsPage() {
  const [requests,   setRequests]   = useState<Request[]>(MOCK_REQUESTS)
  const [title,      setTitle]      = useState('')
  const [category,   setCategory]   = useState('meme')
  const [submitted,  setSubmitted]  = useState(false)
  const [filter,     setFilter]     = useState<'all'|'pending'|'fulfilled'>('all')

  function handleVote(id: string) {
    setRequests(prev => prev.map(r =>
      r.id === id
        ? { ...r, votes: r.voted ? r.votes - 1 : r.votes + 1, voted: !r.voted }
        : r
    ))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    const newReq: Request = {
      id:       Date.now().toString(),
      title:    title.trim(),
      category,
      votes:    1,
      status:   'pending',
      voted:    true,
    }
    setRequests(prev => [newReq, ...prev])
    setTitle('')
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  const filtered = requests
    .filter(r => filter === 'all' || r.status === filter)
    .sort((a, b) => b.votes - a.votes)

  return (
    <>
      <Helmet>
        <title>Request a Sound — ZapSoundboard</title>
        <meta name="description" content="Request a sound for ZapSoundboard. Vote on community requests. Most voted sounds get added first." />
      </Helmet>

      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
        <Navbar />
        <main style={{ flex:1 }}>

          {/* Hero */}
          <section style={{ borderBottom:'1px solid var(--border)', padding:'var(--sp-8) 0 var(--sp-6)' }}>
            <div className="container" style={{ maxWidth:680 }}>
              <h1 style={{ fontSize:'clamp(22px,4vw,34px)', fontWeight:800, letterSpacing:'-0.03em', marginBottom:8 }}>
                🎵 Request a Sound
              </h1>
              <p style={{ fontSize:15, color:'var(--text-secondary)', lineHeight:1.6 }}>
                Can't find a sound? Request it here. Most voted sounds get added first by our team.
              </p>
            </div>
          </section>

          <div className="container" style={{ maxWidth:680, paddingTop:'var(--sp-8)', paddingBottom:'var(--sp-16)' }}>

            {/* Submit form */}
            <div style={{
              background:'var(--bg-secondary)', border:'1px solid var(--border)',
              borderRadius:'var(--r-xl)', padding:'var(--sp-5)',
              marginBottom:'var(--sp-8)',
            }}>
              <h2 style={{ fontSize:16, fontWeight:700, color:'var(--text)', marginBottom:14 }}>
                Submit a Request
              </h2>
              {submitted ? (
                <div style={{
                  padding:'var(--sp-5)', borderRadius:'var(--r-lg)',
                  background:'var(--success-bg)', border:'1px solid var(--success)',
                  textAlign:'center', color:'#15803d', fontWeight:600, fontSize:14,
                }}>
                  ✅ Request submitted! It will appear in the list below.
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Skibidi Toilet Song, Habibi Meme, GTA Loading..."
                    maxLength={100} required
                    style={{
                      width:'100%', height:48, padding:'0 14px',
                      border:'1px solid var(--border)', borderRadius:'var(--r-md)',
                      background:'var(--bg)', color:'var(--text)',
                      fontSize:16, fontFamily:'var(--font)', outline:'none', boxSizing:'border-box',
                    }}
                    onFocus={e => e.currentTarget.style.borderColor='var(--accent)'}
                    onBlur={e => e.currentTarget.style.borderColor='var(--border)'}
                  />
                  <div style={{ display:'flex', gap:10 }}>
                    <select value={category} onChange={e => setCategory(e.target.value)} style={{
                      flex:1, height:48, padding:'0 12px',
                      border:'1px solid var(--border)', borderRadius:'var(--r-md)',
                      background:'var(--bg)', color:'var(--text)',
                      fontSize:16, fontFamily:'var(--font)', outline:'none', cursor:'pointer',
                    }}>
                      {CATEGORIES.map(c => (
                        <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                      ))}
                    </select>
                    <button type="submit" style={{
                      padding:'0 20px', height:48, minHeight:48, borderRadius:'var(--r-md)',
                      border:'none', background:'var(--accent)',
                      color:'var(--accent-text)', fontSize:14, fontWeight:700,
                      cursor:'pointer', fontFamily:'var(--font)',
                      transition:'background var(--t)', flexShrink:0,
                    }}>
                      Submit
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Filter tabs */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14, flexWrap:'wrap', gap:10 }}>
              <h2 style={{ fontSize:16, fontWeight:700, color:'var(--text)' }}>
                Community Requests ({filtered.length})
              </h2>
              <div className="scroll-x" style={{ display:'flex', gap:6 }}>
                {(['all','pending','fulfilled'] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    padding:'8px 14px', minHeight:40, flexShrink:0,
                    borderRadius:'var(--r-md)', border:'1px solid var(--border)',
                    background: filter===f ? 'var(--text)' : 'transparent',
                    color: filter===f ? 'var(--bg)' : 'var(--text-secondary)',
                    fontSize:13, fontWeight:500, cursor:'pointer',
                    fontFamily:'var(--font)', textTransform:'capitalize',
                    transition:'all var(--t)',
                  }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Requests list */}
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {filtered.map(req => {
                const cat = CATEGORIES.find(c => c.id === req.category)
                return (
                  <div key={req.id} style={{
                    background:'var(--bg)', border:'1px solid var(--border)',
                    borderRadius:'var(--r-lg)', padding:'12px 14px',
                    display:'flex', alignItems:'center', gap:12,
                    transition:'border-color var(--t)',
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor='var(--border-hover)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
                  >
                    {/* Vote button — larger on mobile */}
                    <button onClick={() => handleVote(req.id)} style={{
                      display:'flex', flexDirection:'column', alignItems:'center',
                      gap:2, padding:'8px 12px', minHeight:56, minWidth:52,
                      borderRadius:'var(--r-md)',
                      border:`1px solid ${req.voted ? 'var(--accent)' : 'var(--border)'}`,
                      background: req.voted ? 'var(--accent-subtle)' : 'var(--bg-secondary)',
                      color: req.voted ? 'var(--accent-dark)' : 'var(--text-muted)',
                      cursor:'pointer', fontFamily:'var(--font)',
                      transition:'all var(--t)', flexShrink:0,
                      touchAction:'manipulation',
                    }}>
                      <span style={{ fontSize:16 }}>{req.voted ? '▲' : '△'}</span>
                      <span style={{ fontSize:12, fontWeight:700, fontFamily:'var(--font-mono)' }}>
                        {req.votes}
                      </span>
                    </button>

                    {/* Info */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{
                        fontSize:14, fontWeight:600, color:'var(--text)',
                        marginBottom:5, overflow:'hidden',
                        textOverflow:'ellipsis', whiteSpace:'nowrap',
                      }}>
                        {req.title}
                      </div>
                      <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
                        <span style={{
                          fontSize:11, padding:'2px 7px', borderRadius:'var(--r-full)',
                          background: cat ? `${cat.color}15` : 'var(--bg-secondary)',
                          color: cat?.color ?? 'var(--text-muted)', fontWeight:600,
                        }}>
                          {cat?.emoji} {cat?.label ?? req.category}
                        </span>
                        <span style={{
                          fontSize:11, padding:'2px 7px', borderRadius:'var(--r-full)',
                          background: req.status==='fulfilled' ? 'var(--success-bg)' : 'var(--warning-bg)',
                          color: req.status==='fulfilled' ? '#15803d' : '#854f0b', fontWeight:500,
                        }}>
                          {req.status==='fulfilled' ? '✓ Added' : '⏳ Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}
