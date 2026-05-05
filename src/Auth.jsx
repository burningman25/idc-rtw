import { useState } from 'react'
import { supabase } from './supabase'

const S = {
  wrap: { minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #1a1a4e, #24243e)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif' },
  card: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '400px', backdropFilter: 'blur(12px)' },
  logo: { textAlign: 'center', marginBottom: '32px' },
  h1: { fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '700', color: 'white', marginBottom: '4px' },
  sub: { fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px' },
  label: { display: 'block', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255,255,255,0.45)', marginBottom: '6px' },
  input: { width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '7px', padding: '11px 14px', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '16px' },
  btn: { width: '100%', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white', border: 'none', borderRadius: '8px', padding: '13px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' },
  err: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '7px', padding: '10px 14px', color: '#fca5a5', fontSize: '13px', marginBottom: '16px' },
  msg: { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '7px', padding: '10px 14px', color: '#86efac', fontSize: '13px', marginBottom: '16px' },
}

export default function Auth() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleLogin = async () => {
    if (!email.trim()) return
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin }
    })
    setLoading(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  return (
    <div style={S.wrap}>
      <div style={S.card}>
        <div style={S.logo}>
          <div style={S.h1}>ID Consultants Inc.</div>
          <div style={S.sub}>RTW Letter Generator</div>
        </div>

        {error && <div style={S.err}>{error}</div>}
        {sent && <div style={S.msg}>✓ Check your email for a magic login link.</div>}

        {!sent && <>
          <label style={S.label}>Staff Email</label>
          <input
            style={S.input}
            type="email"
            placeholder="you@idconsults.net"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
          <button style={S.btn} onClick={handleLogin} disabled={loading}>
            {loading ? 'Sending…' : 'Send Login Link →'}
          </button>
        </>}
      </div>
    </div>
  )
}
