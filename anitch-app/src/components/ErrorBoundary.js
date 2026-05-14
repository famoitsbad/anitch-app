import React from 'react'

// ─── Page-Level Error Boundary ───────────────────────────────────────────────
// Wraps individual pages so one broken page never crashes the whole app.
// Shows a friendly Anitch-branded fallback with a "try again" button.
export class PageErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Log to console so it shows in Vercel Runtime Logs
    console.error('[Anitch PageError]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      const { pageName = 'this page', lang = 'en' } = this.props
      const isZh = lang === 'zh'
      return (
        <div style={{
          minHeight: '100vh',
          background: '#F9F9FB',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 24px',
          fontFamily: "'Lato', sans-serif",
          textAlign: 'center',
        }}>
          {/* Anitch green pill badge */}
          <div style={{
            width: 64, height: 64,
            borderRadius: '50%',
            background: '#004B39',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 24,
            fontSize: 28,
          }}>
            🌿
          </div>

          <h2 style={{
            fontSize: 18, fontWeight: 700,
            color: '#004B39', marginBottom: 8,
          }}>
            {isZh ? '此頁面發生錯誤' : 'Something went wrong'}
          </h2>

          <p style={{
            fontSize: 14, color: '#888',
            marginBottom: 32, lineHeight: 1.6,
            maxWidth: 280,
          }}>
            {isZh
              ? `${pageName} 載入時遇到問題。請重試，您的記錄不會遺失。`
              : `${pageName} ran into a problem. Please try again — your logs are safe.`
            }
          </p>

          {/* Error detail for dev debugging */}
          {process.env.NODE_ENV === 'development' && (
            <pre style={{
              background: '#fff0f0', border: '1px solid #ffcccc',
              borderRadius: 8, padding: '12px 16px',
              fontSize: 11, color: '#c00', textAlign: 'left',
              maxWidth: '100%', overflowX: 'auto',
              marginBottom: 24, lineHeight: 1.5,
            }}>
              {this.state.error?.message}
            </pre>
          )}

          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              background: '#004B39', color: '#fff',
              border: 'none', borderRadius: 12,
              padding: '14px 32px',
              fontSize: 15, fontWeight: 700,
              cursor: 'pointer', marginBottom: 16,
            }}
          >
            {isZh ? '重試' : 'Try Again'}
          </button>

          <button
            onClick={() => window.location.href = '/'}
            style={{
              background: 'transparent', color: '#004B39',
              border: '1.5px solid #004B39', borderRadius: 12,
              padding: '12px 32px',
              fontSize: 14, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {isZh ? '返回主頁' : 'Go to Home'}
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// ─── App-Level Error Boundary ─────────────────────────────────────────────────
// Last-resort safety net for the whole app (e.g. AppContext crash).
// Minimal UI since theme/lang may not be available.
export class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('[Anitch AppError]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#004B39',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
          fontFamily: "'Lato', sans-serif",
          color: 'white',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 24 }}>🌿</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
            anitch™
          </h2>
          <p style={{ fontSize: 14, opacity: 0.7, marginBottom: 32, maxWidth: 280, lineHeight: 1.6 }}>
            The app encountered an unexpected error. Please refresh to continue.
            Your data is safe in the cloud.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#F7984C', color: '#fff',
              border: 'none', borderRadius: 12,
              padding: '14px 36px',
              fontSize: 15, fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Refresh App
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
