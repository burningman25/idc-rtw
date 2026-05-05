import { useEffect, useState } from 'react'
import { fetchLetterHistory } from './supabase'

const TYPE_BADGES = {
  rtw:       { label: 'RTW',        bg: '#e8f4ed', color: '#1a6b3c' },
  mednet:    { label: 'Med Nec',    bg: '#fdf3e8', color: '#92400e' },
  priorauth: { label: 'Prior Auth', bg: '#eff6ff', color: '#1e3a8a' },
  followup:  { label: 'Follow-Up',  bg: '#fff7ed', color: '#9a3412' },
  infusion:  { label: 'Infusion',   bg: '#f0fdfa', color: '#0f6e56' },
}

export default function HistoryPanel({ activeId, onSelect, onNew, refreshTrigger }) {
  const [letters, setLetters] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => { fetchLetters() }, [refreshTrigger])

  const fetchLetters = async () => {
    try { const data = await fetchLetterHistory(100); setLetters(data) }
    catch (e) { console.error('Failed to load history:', e) }
  }

  const filtered = letters.filter(l =>
    l.patient_name?.toLowerCase().includes(search.toLowerCase())
  )

  const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div style={{ width: '220px', minWidth: '220px', background: '#fff', borderRight: '1px solid #e8e6e1', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ padding: '16px 14px 10px', borderBottom: '1px solid #f0eeea' }}>
        <div style={{ fontSize: '10px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px', color: '#9a9890', marginBottom: '8px' }}>Letter History</div>
        <input
          style={{ width: '100%', boxSizing: 'border-box', background: '#fafaf8', border: '1px solid #e8e6e1', borderRadius: '6px', padding: '6px 10px', color: '#1a1a2e', fontSize: '12px', outline: 'none', fontFamily: "'DM Sans', sans-serif" }}
          placeholder="Search patient…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px' }}>
        {filtered.length === 0
          ? <div style={{ padding: '20px 10px', textAlign: 'center', color: '#b8b6b0', fontSize: '12px' }}>No letters yet</div>
          : filtered.map(l => {
            const badge = TYPE_BADGES[l.letter_type] || { label: l.letter_type, bg: '#f5f4f1', color: '#4a4a5a' }
            return (
              <div
                key={l.id}
                onClick={() => onSelect(l.id)}
                style={{ padding: '9px 10px', borderRadius: '7px', cursor: 'pointer', marginBottom: '2px', background: l.id === activeId ? '#f5f4f1' : 'transparent', border: l.id === activeId ? '1px solid #d8d6d1' : '1px solid transparent' }}
              >
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#1a1a2e', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {l.patient_name || 'Unnamed Patient'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '9px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.3px', padding: '2px 6px', borderRadius: '3px', background: badge.bg, color: badge.color }}>
                    {badge.label}
                  </span>
                  <span style={{ fontSize: '10px', color: '#9a9890' }}>{fmt(l.created_at)}</span>
                </div>
                {l.signing_provider && <div style={{ fontSize: '10px', color: '#b8b6b0', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.signing_provider}</div>}
              </div>
            )
          })
        }
      </div>

      <div style={{ padding: '10px 12px', borderTop: '1px solid #e8e6e1' }}>
        <button
          onClick={onNew}
          style={{ width: '100%', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '7px', padding: '9px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.3px' }}
        >
          + New Letter
        </button>
      </div>
    </div>
  )
}
