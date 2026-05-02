import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function PageTracker() {
  const location = useLocation()

  useEffect(() => {
    // We don't track admin pages to keep stats clean
    if (location.pathname.startsWith('/admin')) return

    const recordVisit = async () => {
      try {
        await supabase.from('page_views').insert([{
          path: location.pathname,
          referrer: document.referrer || null,
        }])
      } catch (err) {
        // Silently fail to not interrupt user experience
      }
    }

    recordVisit()
  }, [location.pathname])

  return null
}
