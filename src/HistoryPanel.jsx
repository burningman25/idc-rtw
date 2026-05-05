import { useEffect, useState } from 'react'
import { fetchLetterHistory, loadLetter } from './supabase'
import { generateLetterHTML } from './letterTemplate.js'
import { emptyForm } from './letterTypes.js'

const TYPE_BADGES = {
  rtw:       { label: 'RTW',        bg: '#dcfce7', color: '#166534', dot: '#16a34a' },
  mednet:    { label: 'Med Nec',    bg: '#fef3c7', color: '#92400e', dot: '#d97706' },
  priorauth: { label: 'Prior Auth', bg: '#dbeafe', color: '#1e3a8a', dot: '#2563eb' },
  followup:  { label: 'Follow-Up',  bg: '#fee2e2', color: '#991b1b', dot: '#dc2626' },
  infusion:  { label: 'Infusion',   bg: '#ccfbf1', color: '#065f46', dot: '#0d9488' },
}

export default function HistoryPanel({ activeId, onSelect, onNew, refreshTrigger }) {
  const [letters, setLetters] = useState([])
  const [search, setSearch] = useState('')
  const [printingId, setPrintingId] = useState(null)

  useEffect(() => { fetchLetters() }, [refreshTrigger])

  const fetchLetters = async () => {
    try { const data = await fetchLetterHistory(100); setLetters(data) }
    catch (e) { console.error('Failed to load history:', e) }
  }

  const handlePrint = async (e, id) => {
    e.stopPropagation()
    setPrintingId(id)
    try {
      const { letter, form: loadedForm } = await loadLetter(id)
      const reconstructedForm = { ...emptyForm(loadedForm.letterType), ...loadedForm }
      const html = generateLetterHTML(reconstructedForm)
      // Auto-filename from patient name and date
      const patientName = loadedForm.patient?.name?.replace(/\s+/g,'_') || 'Patient'
      const dateStr = new Date(letter.created_at).toISOString().slice(0,10)
      const lt = loadedForm.letterType || 'Letter'
      const filename = `IDC_${lt}_${patientName}_${dateStr}`
      const pdfHTML = html.replace('</head>', `
        <style>
          @page { size: letter; margin: 0; }
          html, body { width: 8.5in; height: 11in; margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          @media screen { body { background: #f0f0f0; display: flex; justify-content: center; padding: 20px; } .page { box-shadow: 0 4px 24px rgba(0,0,0,0.18); } }
          @media print { body { background: white; padding: 0; } .no-print { display: none !important; } }
        </style>
        <script>
          window.onload = function() {
            document.title = '${filename}';
            var bar = document.createElement('div');
            bar.className = 'no-print';
            bar.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#1a1a2e;padding:12px 24px;display:flex;align-items:center;justify-content:space-between;z-index:9999;font-family:Arial,sans-serif;';
            bar.innerHTML = '<span style="color:rgba(255,255,255,0.7);font-size:12px;">IDC Correspond &nbsp;&bull;&nbsp; ${filename}</span><button onclick="window.print()" style="background:#0d7377;color:white;border:none;border-radius:6px;padding:9px 24px;font-size:13px;font-weight:600;cursor:pointer;font-family:Arial,sans-serif;">Save as PDF / Print</button>';
            document.body.appendChild(bar);
          }
        </script>
      </head>`)
      const win = window.open('', '_blank')
      win.document.write(pdfHTML)
      win.document.close()
    } catch (e) { console.error('Print failed:', e) }
    setPrintingId(null)
  }

  const filtered = letters.filter(l => {
    if (!search.trim()) return true
    const q = search.toLowerCase().trim()
    return (
      l.patient_name?.toLowerCase().includes(q) ||
      l.letter_type?.toLowerCase().includes(q) ||
      TYPE_BADGES[l.letter_type]?.label?.toLowerCase().includes(q) ||
      l.signing_provider?.toLowerCase().includes(q) ||
      new Date(l.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toLowerCase().includes(q)
    )
  })

  const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div style={{
      width: '240px', minWidth: '240px',
      background: '#1a1a2e',
      display: 'flex', flexDirection: 'column',
      height: '100vh', overflow: 'hidden',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      {/* Header */}
      <div style={{ padding: '18px 14px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1.2px', color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>
          Letter History
        </div>
        <input
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '7px', padding: '7px 10px',
            color: '#ffffff', fontSize: '12px', outline: 'none',
            fontFamily: "'DM Sans', sans-serif"
          }}
          placeholder="Name, type, provider, date…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {filtered.length === 0
          ? <div style={{ padding: '24px 10px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>
              No letters yet
            </div>
          : filtered.map(l => {
            const badge = TYPE_BADGES[l.letter_type] || { label: l.letter_type, bg: '#e5e7eb', color: '#374151', dot: '#6b7280' }
            const isActive = l.id === activeId
            return (
              <div
                key={l.id}
                onClick={() => onSelect(l.id)}
                style={{
                  padding: '10px 10px 8px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginBottom: '3px',
                  background: isActive ? 'rgba(13,115,119,0.25)' : 'rgba(255,255,255,0.04)',
                  border: isActive ? '1px solid rgba(13,115,119,0.5)' : '1px solid transparent',
                  transition: 'all 0.15s',
                  position: 'relative',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#ffffff', marginBottom: '5px', paddingRight: '28px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {l.patient_name || 'Unnamed Patient'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <span style={{
                    fontSize: '9px', fontWeight: '600', textTransform: 'uppercase',
                    letterSpacing: '0.4px', padding: '2px 7px', borderRadius: '3px',
                    background: badge.bg, color: badge.color
                  }}>
                    {badge.label}
                  </span>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>{fmt(l.created_at)}</span>
                </div>
                {l.signing_provider && (
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {l.signing_provider}
                  </div>
                )}
                {/* Print button */}
                <button
                  onClick={e => handlePrint(e, l.id)}
                  title="Print letter"
                  style={{
                    position: 'absolute', top: '10px', right: '8px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '5px',
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '11px', cursor: 'pointer',
                    width: '24px', height: '24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 0,
                  }}
                >
                  {printingId === l.id ? '…' : '🖨'}
                </button>
              </div>
            )
          })
        }
      </div>

      {/* New letter button */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={onNew}
          style={{
            width: '100%',
            background: '#0d7377',
            color: '#fff', border: 'none', borderRadius: '7px',
            padding: '10px', fontSize: '12px', fontWeight: '600',
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            letterSpacing: '0.3px'
          }}
        >
          + New Letter
        </button>
      </div>
    </div>
  )
}
