import { Helmet } from 'react-helmet-async'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Link } from 'react-router-dom'

export default function CategoriesPage() {
  return (
    <>
      <Helmet>
        <title>Categories | ZapSoundboard</title>
      </Helmet>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />

        <main style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '80px 24px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: 80, marginBottom: 20 }}>🔍</div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 12 }}>Categories</h1>
            <p style={{ fontSize: 16, color: '#666', maxWidth: 400, margin: '0 auto 32px' }}>
              We're currently restructuring our sound categories. This page is temporarily empty.
            </p>
            <Link to="/" style={{
              display: 'inline-block',
              padding: '12px 28px',
              background: '#f5c518',
              color: '#1a1400',
              textDecoration: 'none',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 15,
              transition: 'transform 150ms'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              Back to Home
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}
