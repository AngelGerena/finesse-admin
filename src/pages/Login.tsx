import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const { signIn, user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    const { error } = await signIn(email.trim().toLowerCase(), password)
    if (error) {
      setError(error)
      setPassword('')
    }
    setLoading(false)
  }

  // Already signed in: hand off to the protected /admin routes, which gate on
  // admin status (dashboard if authorized, "Access Denied" otherwise).
  if (user) return <Navigate to="/admin" replace />

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--brand)', position: 'relative', overflow: 'hidden',
      fontFamily: 'var(--font-ui)'
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'fixed', top: '-30%', left: '-20%', width: '60%', height: '60%',
        background: 'radial-gradient(ellipse, rgba(197,164,75,0.06) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'fixed', bottom: '-20%', right: '-10%', width: '50%', height: '50%',
        background: 'radial-gradient(ellipse, rgba(197,164,75,0.04) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      {/* Grid overlay */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(197,164,75,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(197,164,75,0.03) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <div style={{
        position: 'relative', width: 440, maxWidth: '100%',
        background: 'rgba(28,38,64,0.95)', border: '1px solid rgba(197,164,75,0.2)',
        borderRadius: 20, padding: '52px 48px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(197,164,75,0.08)',
        zIndex: 10
      }}>
        {/* Top gold line */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '80%', height: 1,
          background: 'linear-gradient(to right, transparent, var(--accent), transparent)'
        }} />

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56, border: '1.5px solid rgba(197,164,75,0.4)',
            borderRadius: 14, marginBottom: 16
          }}>
            <svg viewBox="0 0 28 28" fill="none" width={28} height={28}>
              <path d="M14 2L26 8V20L14 26L2 20V8L14 2Z" stroke="var(--accent)" strokeWidth="1.5" />
              <path d="M14 8L20 11V17L14 20L8 17V11L14 8Z" fill="rgba(197,164,75,0.15)" stroke="var(--accent)" strokeWidth="1" />
              <circle cx="14" cy="14" r="2" fill="var(--accent)" />
            </svg>
          </div>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 400,
            color: '#fff', letterSpacing: '0.02em'
          }}>
            Finesse Media <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>LLC</em>
          </div>
          <div style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.25em',
            textTransform: 'uppercase' as const, color: 'rgba(197,164,75,0.6)', marginTop: 4
          }}>Admin Portal</div>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(197,164,75,0.12)' }} />
          <div style={{ fontSize: 11, color: 'rgba(176,186,200,0.3)', fontWeight: 500, letterSpacing: '0.1em', whiteSpace: 'nowrap' as const }}>
            Sign in to continue
          </div>
          <div style={{ flex: 1, height: 1, background: 'rgba(197,164,75,0.12)' }} />
        </div>

        {/* Error */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(229,62,62,0.08)', border: '1px solid rgba(229,62,62,0.2)',
            borderRadius: 8, padding: '10px 14px', marginBottom: 16,
            fontSize: 13, color: '#FC8181'
          }}>
            <span>Warning</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label htmlFor="email" style={{
              display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
              textTransform: 'uppercase' as const, color: 'rgba(197,164,75,0.7)', marginBottom: 8
            }}>Email Address</label>
            <input
              id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com" autoComplete="email"
              style={{
                width: '100%', padding: '13px 16px', fontFamily: 'var(--font-ui)',
                fontSize: 16, background: 'rgba(17,27,48,0.8)',
                border: '1px solid rgba(197,164,75,0.15)', borderRadius: 10,
                color: '#fff', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label htmlFor="password" style={{
              display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
              textTransform: 'uppercase' as const, color: 'rgba(197,164,75,0.7)', marginBottom: 8
            }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password" type={showPw ? 'text' : 'password'}
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password" autoComplete="current-password"
                style={{
                  width: '100%', padding: '13px 48px 13px 16px', fontFamily: 'var(--font-ui)',
                  fontSize: 16, background: 'rgba(17,27,48,0.8)',
                  border: '1px solid rgba(197,164,75,0.15)', borderRadius: 10,
                  color: '#fff', outline: 'none', boxSizing: 'border-box'
                }}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(176,186,200,0.4)', padding: 4
              }} aria-label="Toggle password visibility">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: 14, fontFamily: 'var(--font-ui)',
            fontSize: 14, fontWeight: 600,
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%)',
            color: 'var(--brand)', border: 'none', borderRadius: 10,
            cursor: loading ? 'wait' : 'pointer', letterSpacing: '0.05em',
            opacity: loading ? 0.8 : 1, marginTop: 4
          }}>
            {loading ? 'Verifying...' : 'Access Dashboard'}
          </button>
        </form>

        <div style={{
          textAlign: 'center', marginTop: 32, paddingTop: 24,
          borderTop: '1px solid rgba(197,164,75,0.08)'
        }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 13,
            color: 'rgba(197,164,75,0.4)', fontStyle: 'italic', lineHeight: 1.6
          }}>
            "For I know the plans I have for you" — Jeremiah 29:11
          </div>
          <a href="https://finessemedia.pro" style={{
            display: 'block', marginTop: 12, fontSize: 12,
            color: 'rgba(176,186,200,0.3)', textDecoration: 'none'
          }}>
            Back to finessemedia.pro
          </a>
        </div>
      </div>
    </div>
  )
}
