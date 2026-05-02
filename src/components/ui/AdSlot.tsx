import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { CustomAd } from '@/lib/types'

interface AdSlotProps {
  position: 'top' | 'sidebar' | 'between-sounds' | 'download'
}

export default function AdSlot({ position }: AdSlotProps) {
  const [ad, setAd] = useState<CustomAd | null>(null)

  useEffect(() => {
    supabase.from('custom_ads')
      .select('*')
      .eq('position', position)
      .eq('is_active', true)
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setAd(data as CustomAd)
      })
  }, [position])

  // Record impression once on mount if ad exists
  useEffect(() => {
    if (ad) {
      supabase.rpc('increment_ad_impression', { ad_id: ad.id }).then(() => {})
    }
  }, [ad])

  if (!ad) return null

  function handleClick() {
    if (!ad) return
    // Fire and forget click tracking
    supabase.rpc('increment_ad_click', { ad_id: ad.id }).then(() => {})
  }

  return (
    <div style={{
      margin: 'var(--sp-6) 0',
      display: 'flex',
      justifyContent: 'center',
    }}>
      <a href={ad.target_url} target="_blank" rel="noopener noreferrer" onClick={handleClick} style={{ display: 'block' }}>
        <img src={ad.image_url} alt={ad.title} style={{
          maxWidth: '100%',
          borderRadius: 'var(--r-md)',
          border: '1px solid var(--border)',
        }} />
      </a>
    </div>
  )
}