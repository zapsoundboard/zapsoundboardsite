import { Component, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface Props   { children: ReactNode }
interface State   { hasError: boolean; error?: Error }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('ZapSoundboard Error:', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 40, textAlign: 'center',
        background: 'var(--bg)',
        fontFamily: 'var(--font)',
      }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.03em' }}>
          Something went wrong
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 6, maxWidth: 400 }}>
          An unexpected error occurred. Don't worry — your sounds are still there!
        </p>
        {this.state.error && (
          <code style={{
            fontSize: 12, color: 'var(--text-muted)',
            background: 'var(--bg-secondary)', padding: '4px 10px',
            borderRadius: 6, marginBottom: 24,
            maxWidth: 500, overflow: 'auto', display: 'block',
          }}>
            {this.state.error.message}
          </code>
        )}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.reload() }}
            style={{
              padding: '10px 24px', borderRadius: 'var(--r-md)',
              border: 'none', background: 'var(--accent)',
              color: 'var(--accent-text)', fontSize: 14,
              fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
            }}
          >
            Try Again
          </button>
          <Link to="/" style={{
            padding: '10px 24px', borderRadius: 'var(--r-md)',
            border: '1px solid var(--border)', background: 'transparent',
            color: 'var(--text)', fontSize: 14, fontWeight: 500,
            textDecoration: 'none',
          }}>
            Go Home
          </Link>
        </div>
      </div>
    )
  }
}
