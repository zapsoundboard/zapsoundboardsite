import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { CustomAd } from '@/lib/types'

const POSITIONS = [
  { value: 'top',             label: 'Top Banner',         desc: 'Above main content, full width' },
  { value: 'sidebar',         label: 'Sidebar',            desc: 'Right sidebar on desktop' },
  { value: 'between-sounds',  label: 'Between Sounds',     desc: 'Inline every 20 sound buttons' },
  { value: 'download',        label: 'Before Download',    desc: 'Shown before MP3 download' },
] as const

type Position = typeof POSITIONS[number]['value']

interface AdsenseSlot {
  position: string
  slot_id:  string
  enabled:  boolean
}

const DEFAULT_ADSENSE_SLOTS: AdsenseSlot[] = [
  { position: 'Homepage Banner',      slot_id: '', enabled: false },
  { position: 'Sound Page Rectangle', slot_id: '', enabled: false },
  { position: 'Category Sidebar',     slot_id: '', enabled: false },
  { position: 'Between Sounds Native',slot_id: '', enabled: false },
  { position: 'Download Page Banner', slot_id: '', enabled: false },
]

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} style={{
      width: 40, height: 22, borderRadius: 11, border: 'none',
      background: value ? '#f5c518' : '#2a2a2a', cursor: 'pointer',
      position: 'relative', transition: 'background 200ms', flexShrink: 0,
    }}>
      <span style={{
        position: 'absolute', top: 2, left: value ? 20 : 2,
        width: 18, height: 18, borderRadius: '50%',
        background: '#fff', transition: 'left 200ms', display: 'block',
      }} />
    </button>
  )
}

export default function AdminAds() {
  const [ads,           setAds]           = useState<CustomAd[]>([])
  const [adsenseClient, setAdsenseClient] = useState('')
  const [adsenseEnabled,setAdsenseEnabled]= useState(false)
  const [promoEnabled,  setPromoEnabled]  = useState(false)
  const [slots,         setSlots]         = useState<AdsenseSlot[]>(DEFAULT_ADSENSE_SLOTS)
  const [loading,       setLoading]       = useState(true)
  const [saving,        setSaving]        = useState(false)
  const [saved,         setSaved]         = useState(false)
  const [showNewAd,     setShowNewAd]     = useState(false)
  const [newAd, setNewAd]                 = useState<{
    title: string; image_url: string; target_url: string; position: Position; is_active: boolean
  }>({ title: '', image_url: '', target_url: '', position: 'top', is_active: true })

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [{ data: settings }, { data: adsData }] = await Promise.all([
        supabase.from('site_settings').select('*').single(),
        supabase.from('custom_ads').select('*').order('created_at', { ascending: false }),
      ])
      if (settings) {
        setAdsenseClient(settings.adsense_client_id ?? '')
        setAdsenseEnabled(settings.adsense_enabled ?? false)
        setPromoEnabled(settings.custom_ads_enabled ?? false)
      }
      setAds((adsData ?? []) as CustomAd[])
      setLoading(false)
    }
    load()
  }, [])

  async function saveAdsense() {
    setSaving(true)
    await supabase.from('site_settings').update({
      adsense_client_id: adsenseClient,
      adsense_enabled:   adsenseEnabled,
      custom_ads_enabled: promoEnabled,
      updated_at:        new Date().toISOString(),
    }).eq('id', 1)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function createAd() {
    if (!newAd.title || !newAd.image_url || !newAd.target_url) return
    const { data, error } = await supabase.from('custom_ads').insert([{
      title:      newAd.title,
      image_url:  newAd.image_url,
      target_url: newAd.target_url,
      position:   newAd.position,
      is_active:  newAd.is_active,
    }]).select().single()
    
    if (error) {
      alert('Error creating ad: ' + error.message)
      return
    }
    
    if (data) {
      setAds(prev => [data as CustomAd, ...prev])
      setShowNewAd(false)
      setNewAd({ title: '', image_url: '', target_url: '', position: 'top', is_active: true })
    }
  }

  async function toggleAd(id: string, active: boolean) {
    await supabase.from('custom_ads').update({ is_active: active }).eq('id', id)
    setAds(prev => prev.map(a => a.id === id ? { ...a, is_active: active } : a))
  }

  async function deleteAd(id: string) {
    if (!confirm('Delete this ad?')) return
    await supabase.from('custom_ads').delete().eq('id', id)
    setAds(prev => prev.filter(a => a.id !== id))
  }

  const inp = (extra?: React.CSSProperties): React.CSSProperties => ({
    width: '100%', height: 40, padding: '0 12px',
    background: '#1a1a1a', border: '1px solid #2a2a2a',
    borderRadius: 8, color: '#fff', fontSize: 13,
    fontFamily: 'var(--font)', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 150ms',
    ...extra,
  })

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 4 }}>
          Ads
        </h1>
        <p style={{ fontSize: 14, color: '#555' }}>Manage custom ads and Google AdSense placements</p>
      </div>

      {loading ? (
        <div style={{ color: '#555', fontSize: 14 }}>Loading...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* ── AdSense Section ── */}
          <div style={{
            background: '#111', border: '1px solid #1e1e1e',
            borderRadius: 12, padding: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 3 }}>
                  Google AdSense
                </h2>
                <p style={{ fontSize: 13, color: '#555' }}>Configure AdSense client ID and placement slots</p>
              </div>
              <Toggle value={adsenseEnabled} onChange={setAdsenseEnabled} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#888', marginBottom: 6 }}>
                AdSense Client ID
              </label>
              <input
                type="text"
                value={adsenseClient}
                onChange={e => setAdsenseClient(e.target.value)}
                placeholder="ca-pub-XXXXXXXXXXXXXXXXX"
                style={inp()}
                onFocus={e => e.currentTarget.style.borderColor = '#f5c518'}
                onBlur={e => e.currentTarget.style.borderColor = '#2a2a2a'}
              />
            </div>

            {/* Slots */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#888', marginBottom: 10 }}>Ad Slots</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {slots.map((slot, i) => (
                  <div key={slot.position} style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr auto',
                    gap: 10, alignItems: 'center',
                    padding: '10px 14px',
                    background: '#1a1a1a', borderRadius: 8,
                    border: '1px solid #222',
                  }}>
                    <span style={{ fontSize: 13, color: '#888', fontWeight: 500 }}>{slot.position}</span>
                    <input
                      type="text"
                      value={slot.slot_id}
                      onChange={e => setSlots(prev => prev.map((s, j) => j === i ? { ...s, slot_id: e.target.value } : s))}
                      placeholder="Slot ID: XXXXXXXXXX"
                      style={inp({ height: 34, fontSize: 12 })}
                      onFocus={e => e.currentTarget.style.borderColor = '#f5c518'}
                      onBlur={e => e.currentTarget.style.borderColor = '#2a2a2a'}
                    />
                    <Toggle value={slot.enabled}
                      onChange={v => setSlots(prev => prev.map((s, j) => j === i ? { ...s, enabled: v } : s))}
                    />
                  </div>
                ))}
              </div>
            </div>

            <button onClick={saveAdsense} disabled={saving} style={{
              padding: '10px 22px', borderRadius: 8, border: 'none',
              background: saved ? '#22c55e' : '#f5c518',
              color: '#1a1400', fontSize: 13, fontWeight: 700,
              cursor: saving ? 'wait' : 'pointer', fontFamily: 'var(--font)',
              transition: 'background 300ms',
            }}>
              {saving ? 'Saving...' : saved ? '✓ Saved!' : '💾 Save Settings'}
            </button>
          </div>

          {/* ── FlashTTS Promo ── */}
          <div style={{
            background: '#111', border: '1px solid #1e1e1e',
            borderRadius: 12, padding: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 3 }}>
                  FlashTTS Footer Promo
                </h2>
                <p style={{ fontSize: 13, color: '#555' }}>Show the hardcoded FlashTTS promo section in the footer</p>
              </div>
              <Toggle value={promoEnabled} onChange={setPromoEnabled} />
            </div>
            <div style={{ marginTop: 16 }}>
              <button onClick={saveAdsense} disabled={saving} style={{
                padding: '10px 22px', borderRadius: 8, border: 'none',
                background: saved ? '#22c55e' : '#f5c518',
                color: '#1a1400', fontSize: 13, fontWeight: 700,
                cursor: saving ? 'wait' : 'pointer', fontFamily: 'var(--font)',
                transition: 'background 300ms',
              }}>
                {saving ? 'Saving...' : saved ? '✓ Saved!' : '💾 Save Promo Setting'}
              </button>
            </div>
          </div>

          {/* ── Custom Ads ── */}
          <div style={{
            background: '#111', border: '1px solid #1e1e1e',
            borderRadius: 12, overflow: 'hidden',
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #1a1a1a',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Custom Ads</h2>
                <p style={{ fontSize: 13, color: '#555', marginTop: 2 }}>FlashTTS banners & custom placements</p>
              </div>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Views</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#f5c518' }}>
                    {ads.reduce((acc, a) => acc + (a.impressions || 0), 0).toLocaleString()}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Clicks</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
                    {ads.reduce((acc, a) => acc + (a.clicks || 0), 0).toLocaleString()}
                  </div>
                </div>
                <button onClick={() => setShowNewAd(!showNewAd)} style={{
                  padding: '8px 14px', borderRadius: 8,
                  border: 'none', background: '#f5c518',
                  color: '#1a1400', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'var(--font)',
                  display: 'flex', alignItems: 'center', gap: 6,
                  marginLeft: 10,
                }}>
                  + New Ad
                </button>
              </div>
            </div>

            {/* New ad form */}
            {showNewAd && (
              <div style={{
                padding: '20px',
                borderBottom: '1px solid #1a1a1a',
                background: '#0f0f0f',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 5 }}>Title</label>
                    <input type="text" value={newAd.title}
                      onChange={e => setNewAd({ ...newAd, title: e.target.value })}
                      placeholder="FlashTTS Promo"
                      style={inp()}
                      onFocus={e => e.currentTarget.style.borderColor = '#f5c518'}
                      onBlur={e => e.currentTarget.style.borderColor = '#2a2a2a'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 5 }}>Target URL</label>
                    <input type="url" value={newAd.target_url}
                      onChange={e => setNewAd({ ...newAd, target_url: e.target.value })}
                      placeholder="https://flashtts.com"
                      style={inp()}
                      onFocus={e => e.currentTarget.style.borderColor = '#f5c518'}
                      onBlur={e => e.currentTarget.style.borderColor = '#2a2a2a'}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 5 }}>Image URL</label>
                  <input type="url" value={newAd.image_url}
                    onChange={e => setNewAd({ ...newAd, image_url: e.target.value })}
                    placeholder="https://sounds.zapsoundboard.com/ads/flashtts-banner.png"
                    style={inp()}
                    onFocus={e => e.currentTarget.style.borderColor = '#f5c518'}
                    onBlur={e => e.currentTarget.style.borderColor = '#2a2a2a'}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, alignItems: 'flex-end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 5 }}>Position</label>
                    <select value={newAd.position}
                      onChange={e => setNewAd({ ...newAd, position: e.target.value as Position })}
                      style={{
                        ...inp(),
                        cursor: 'pointer',
                      }}>
                      {POSITIONS.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ paddingBottom: 1 }}>
                    <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 8 }}>Active</label>
                    <Toggle value={newAd.is_active} onChange={v => setNewAd({ ...newAd, is_active: v })} />
                  </div>
                  <button onClick={createAd} style={{
                    height: 40, padding: '0 20px', borderRadius: 8, border: 'none',
                    background: '#22c55e', color: '#fff', fontSize: 13,
                    fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                  }}>
                    Add Ad
                  </button>
                </div>
              </div>
            )}

            {/* Ads list */}
            {ads.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#444', fontSize: 13 }}>
                No custom ads yet — add your first ad above
              </div>
            ) : (
              <div>
                {ads.map(ad => {
                  const pos = POSITIONS.find(p => p.value === ad.position)
                  return (
                    <div key={ad.id} style={{
                      padding: '14px 20px',
                      borderBottom: '1px solid #161616',
                      display: 'flex', alignItems: 'center', gap: 14,
                      transition: 'background 150ms',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = '#141414'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Thumbnail */}
                      <div style={{
                        width: 56, height: 36, borderRadius: 6,
                        background: '#1a1a1a', overflow: 'hidden', flexShrink: 0,
                        border: '1px solid #2a2a2a',
                      }}>
                        {ad.image_url && (
                          <img src={ad.image_url} alt={ad.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                          />
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 13, fontWeight: 600, color: '#fff',
                          marginBottom: 3, overflow: 'hidden',
                          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {ad.title}
                        </div>
                        <div style={{ display: 'flex', gap: 10, fontSize: 11, color: '#555' }}>
                          <span>{pos?.label ?? ad.position}</span>
                          <span>·</span>
                          <span>{ad.clicks} clicks</span>
                          <span>·</span>
                          <span>{ad.impressions} views</span>
                        </div>
                      </div>

                      {/* Active toggle */}
                      <Toggle value={ad.is_active} onChange={v => toggleAd(ad.id, v)} />

                      {/* Delete */}
                      <button onClick={() => deleteAd(ad.id)} style={{
                        width: 30, height: 30, borderRadius: 6,
                        border: '1px solid #2a2a2a', background: 'transparent',
                        color: '#555', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        transition: 'all 150ms',
                      }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = '#1a0808'
                          e.currentTarget.style.borderColor = '#3a1010'
                          e.currentTarget.style.color = '#ef4444'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.borderColor = '#2a2a2a'
                          e.currentTarget.style.color = '#555'
                        }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Position info */}
          <div style={{
            background: '#111', border: '1px solid #1e1e1e',
            borderRadius: 12, padding: 20,
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 14 }}>Ad Placement Info</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
              {POSITIONS.map(p => (
                <div key={p.value} style={{
                  padding: '10px 14px', borderRadius: 8,
                  background: '#161616', border: '1px solid #1e1e1e',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 3 }}>{p.label}</div>
                  <div style={{ fontSize: 12, color: '#555' }}>{p.desc}</div>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: 14, padding: '10px 14px',
              borderRadius: 8, background: '#1a1200',
              border: '1px solid #2a2000', fontSize: 12, color: '#888',
            }}>
              ⚠️ Rule: Never place ads directly over the sound player buttons — this violates AdSense policies.
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
