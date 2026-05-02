import SoundButton from './SoundButton'
import type { Sound } from '@/lib/types'

interface Props {
  sounds: Sound[]
  loading?: boolean
  showIndex?: boolean
  emptyMessage?: string
}

function SkeletonButton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div className="skeleton" style={{ width: 'var(--sb-size, 80px)', height: 'var(--sb-size, 80px)', borderRadius: '50%' }} />
      <div className="skeleton" style={{ width: 60, height: 9, borderRadius: 4 }} />
      <div className="skeleton" style={{ width: 36, height: 8, borderRadius: 4 }} />
    </div>
  )
}

export default function SoundGrid({ sounds, loading, showIndex, emptyMessage }: Props) {
  if (loading) {
    return (
      <>
        <div className="sound-grid">
          {Array.from({ length: 24 }).map((_, i) => <SkeletonButton key={i} />)}
        </div>
        <GridStyles />
      </>
    )
  }

  if (!sounds.length) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔇</div>
        <p style={{ fontSize: 16, marginBottom: 6, color: 'var(--text-secondary)' }}>
          {emptyMessage ?? 'No sounds found'}
        </p>
        <p style={{ fontSize: 14 }}>Try a different search or category</p>
      </div>
    )
  }

  return (
    <>
      <div className="sound-grid">
        {sounds.map((sound, i) => (
          <SoundButton key={sound.id} sound={sound} index={i} showIndex={showIndex} />
        ))}
      </div>
      <GridStyles />
    </>
  )
}

function GridStyles() {
  return (
    <style>{`
      .sound-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px 8px;
        justify-items: center;
      }
      @media (min-width: 480px) {
        .sound-grid { grid-template-columns: repeat(4, 1fr); gap: 18px 10px; }
      }
      @media (min-width: 768px) {
        .sound-grid { grid-template-columns: repeat(6, 1fr); gap: 20px 12px; }
      }
      @media (min-width: 1024px) {
        .sound-grid { grid-template-columns: repeat(8, 1fr); gap: 22px 12px; }
      }
    `}</style>
  )
}
