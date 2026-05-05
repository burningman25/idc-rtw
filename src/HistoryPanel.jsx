import { useEffect, useState } from 'react'
import { supabase, fetchLetterHistory } from './supabase'

const TYPE_COLORS = {
  rtw:       '#1a6b3c',
  mednet:    '#1e40af',
  priorauth: '#6b21a8',
  followup:  '#854d0e',
  infusion:  '#0e7490',
}

const TYPE_LABELS = {
  rtw:       'RTW',
  mednet:    'Med Necessity',
  priorauth: 'Prior Auth',
  followup:  'Follow-Up',
  infusion:  'Infusion',
}

const S = {
  panel: { width: '280px', minWidth: '280px', background: 'rgba(0,0,0,0.2)', borderRight: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' },
  header: { padding: '20px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)' },
  title: { fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.4)', marginBottom: '10px' },
  search: { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' },
  list: { flex: 1, overflowY: 'auto', padding: '8px' },
  item: (active) => ({ padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', marginBottom: '4px', background: active ? 'rgba(124,58,237,0.2)' : 'transparent', border: active ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent', transition: 'all 0.15s' }),
  patientName: { fontSize: '13px', fontWeight: '600', color: 'white', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  meta: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' },
  badge: (type) => ({ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '2px 7px', borderRadius: '3px', background: TYPE_COLORS[type] || '#374151', color: 'white' }),
  date: { fontSize: '11px', color: 'rgba(255,255,255,0.35)' },
  provider: { fontSize: '11px', color: 'rgba(255,255,255,0.28)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  empty: { padding: '24px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '13px' },
  footer: { padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.07)' },
  newBtn: { width: '100%', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white', border: 'none', borderRadius: '7px', padding: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
}

export default function HistoryPanel({ activeId, onSelect, onNew, refreshTrigger }) {
  const [letters, setLetters] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => { fetchLetters() }, [refreshTrigger])

  const fetchLetters = async () => {
    try {
      const data = await fetchLetterHistory(100)
      setLetters(data)
    } catch (e) {
      console.error('Failed to load history:', e)
    }
  }

  const filtered = letters.filter(l =>
    l.patient_name?.toLowerCase().includes(search.toLowerCase())
  )

  const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div style={S.panel}>
      <div style={S.header}>
        <div style={S.title}>Letter History</div>
        <input style={S.search} placeholder="Search patient…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div style={S.list}>
        {filtered.length === 0
          ? <div style={S.empty}>No letters yet</div>
          : filtered.map(l => (
            <div key={l.id} style={S.item(l.id === activeId)} onClick={() => onSelect(l.id)}>
              <div style={S.patientName}>{l.patient_name || 'Unnamed Patient'}</div>
              <div style={S.meta}>
                <span style={S.badge(l.letter_type || 'rtw')}>{TYPE_LABELS[l.letter_type] || l.letter_type || 'RTW'}</span>
                <span style={S.date}>{fmt(l.created_at)}</span>
              </div>
              {l.signing_provider && <div style={S.provider}>{l.signing_provider}</div>}
            </div>
          ))
        }
      </div>
      <div style={S.footer}>
        <button style={S.newBtn} onClick={onNew}>+ New Letter</button>
      </div>
    </div>
  )
}
