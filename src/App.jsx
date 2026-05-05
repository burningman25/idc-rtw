import { useState, useEffect, useRef } from 'react'
import { supabase, saveLetter, loadLetter } from './supabase'
import HistoryPanel from './HistoryPanel.jsx'
import { generateLetterHTML } from './letterTemplate.js'
import { LETTER_TYPES, PROVIDERS, EXTRACT_PROMPTS, emptyForm } from './letterTypes.js'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Serif+Display&display=swap');`

const S = {
  app: { display: 'flex', height: '100vh', overflow: 'hidden', background: '#f5f4f1', fontFamily: "'DM Sans', sans-serif" },
  main: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' },
  topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', borderBottom: '1px solid #e8e6e1', background: '#fff', flexShrink: 0 },
  topTitle: { fontFamily: "'DM Serif Display', serif", fontSize: '18px', fontWeight: '400', color: '#1a1a2e', margin: 0 },
  topSub: { fontSize: '11px', color: '#9a9890', textTransform: 'uppercase', letterSpacing: '0.7px', marginTop: '2px' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
  userEmail: { fontSize: '12px', color: '#9a9890' },
  content: { flex: 1, padding: '20px 28px', maxWidth: '860px', width: '100%', margin: '0 auto', boxSizing: 'border-box' },
  card: { background: '#fff', border: '1px solid #e8e6e1', borderRadius: '10px', padding: '20px 22px', marginBottom: '14px' },
  sectionHead: { fontSize: '10px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1.2px', color: '#9a9890', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid #f0eeea' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  label: { display: 'block', fontSize: '10px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#9a9890', marginBottom: '5px' },
  input: { width: '100%', background: '#fafaf8', border: '1px solid #e8e6e1', borderRadius: '7px', padding: '9px 12px', color: '#1a1a2e', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif" },
  select: { width: '100%', background: '#fafaf8', border: '1px solid #e8e6e1', borderRadius: '7px', padding: '9px 12px', color: '#1a1a2e', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif" },
  textarea: { width: '100%', background: '#fafaf8', border: '1px solid #e8e6e1', borderRadius: '7px', padding: '9px 12px', color: '#1a1a2e', fontSize: '13px', outline: 'none', boxSizing: 'border-box', resize: 'vertical', minHeight: '80px', fontFamily: "'DM Sans', sans-serif" },
  btn: { background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '7px', padding: '10px 24px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.3px' },
  btnOutline: { background: 'transparent', color: '#4a4a5a', border: '1px solid #d8d6d1', borderRadius: '7px', padding: '9px 18px', fontSize: '13px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  btnSuccess: { background: '#1a6b3c', color: '#fff', border: 'none', borderRadius: '7px', padding: '10px 24px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  actionRow: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' },
  err: { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '11px 15px', color: '#991b1b', fontSize: '13px', marginBottom: '16px' },
  successBanner: { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '11px 15px', color: '#14532d', fontSize: '13px', marginBottom: '16px' },
  spinner: { display: 'inline-block', width: '26px', height: '26px', border: '2px solid #e8e6e1', borderTopColor: '#1a1a2e', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' },
  centered: { textAlign: 'center', padding: '60px 0' },
  centeredText: { color: '#9a9890', fontSize: '14px' },
  previewFrame: { width: '100%', height: '640px', border: 'none', background: 'white', display: 'block', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  previewNote: { textAlign: 'center', fontSize: '12px', color: '#9a9890', marginTop: '10px' },
  typeGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' },
  typeBtn: (active) => ({
    padding: '12px 8px', borderRadius: '8px', cursor: 'pointer', textAlign: 'center',
    border: active ? '1.5px solid #1a1a2e' : '1px solid #e8e6e1',
    background: active ? '#f5f4f1' : '#fafaf8',
    transition: 'all 0.15s'
  }),
  typeIcon: { fontSize: '20px', marginBottom: '5px' },
  typeLabel: (active) => ({ fontSize: '9px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px', color: active ? '#1a1a2e' : '#9a9890', lineHeight: 1.3 }),
  dropzone: (drag) => ({
    border: `1.5px dashed ${drag ? '#1a1a2e' : '#d8d6d1'}`,
    borderRadius: '8px', padding: '24px', textAlign: 'center', cursor: 'pointer',
    transition: 'all 0.2s', background: drag ? '#f5f4f1' : '#fafaf8'
  }),
  dropIcon: { fontSize: '28px', marginBottom: '8px' },
  dropText: { color: '#4a4a5a', fontSize: '13px', marginBottom: '3px' },
  dropSub: { color: '#9a9890', fontSize: '11px' },
  divider: { height: '1px', background: '#e8e6e1', margin: '0' },
  bottomBar: { background: '#fff', borderTop: '1px solid #e8e6e1', padding: '14px 28px', display: 'flex', justifyContent: 'flex-end', gap: '10px', flexShrink: 0 },
}

function Input({ label, value, onChange, placeholder, span2 }) {
  return (
    <div style={span2 ? { gridColumn: 'span 2' } : {}}>
      <label style={S.label}>{label}</label>
      <input style={S.input} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder || label} />
    </div>
  )
}

function Textarea({ label, value, onChange, placeholder, hint }) {
  return (
    <div>
      <label style={S.label}>{label}</label>
      {hint && <div style={{ fontSize: '11px', color: '#9a9890', marginBottom: '4px' }}>{hint}</div>}
      <textarea style={S.textarea} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label style={S.label}>{label}</label>
      <select style={S.select} value={value} onChange={e => onChange(e.target.value)}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  )
}

function LetterForm({ form, setForm }) {
  const up = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const upP = (key, val) => setForm(f => ({ ...f, patient: { ...f.patient, [key]: val } }))

  const sharedPatient = (
    <div style={S.card}>
      <div style={S.sectionHead}>Patient Information</div>
      <div style={{ ...S.grid2, gap: '12px' }}>
        <Input label="Full Name" value={form.patient.name} onChange={v => upP('name', v)} />
        <Input label="Date of Birth" value={form.patient.dob} onChange={v => upP('dob', v)} placeholder="e.g. March 14, 1981" />
        <Input label="Insurance Plan" value={form.patient.insurancePlan} onChange={v => upP('insurancePlan', v)} />
        <Input label="Member / Insurance ID" value={form.patient.insuranceId} onChange={v => upP('insuranceId', v)} />
      </div>
    </div>
  )

  if (form.letterType === 'rtw') return (<>
    <div style={S.card}>
      <div style={S.sectionHead}>Patient Information</div>
      <div style={{ ...S.grid2, gap: '12px' }}>
        <Input label="Full Name" value={form.patient.name} onChange={v => upP('name', v)} />
        <Input label="Date of Birth" value={form.patient.dob} onChange={v => upP('dob', v)} />
        <Input label="Employer" value={form.patient.employer} onChange={v => upP('employer', v)} />
        <Input label="Job Title" value={form.patient.jobTitle} onChange={v => upP('jobTitle', v)} />
        <Input label="Date of Injury / Illness" value={form.patient.dateOfInjury} onChange={v => upP('dateOfInjury', v)} />
        <Input label="Diagnosis" value={form.patient.diagnosis} onChange={v => upP('diagnosis', v)} />
      </div>
    </div>
    <div style={S.card}>
      <div style={S.sectionHead}>Clearance & Dates</div>
      <div style={{ ...S.grid2, gap: '12px' }}>
        <Select label="Clearance Type" value={form.clearanceType} onChange={v => up('clearanceType', v)} options={[['full','Full Duty Clearance'],['modified','Modified / Restricted Duty'],['not_cleared','Not Cleared for Return']]} />
        <Input label="Return-to-Work Date" value={form.returnDate} onChange={v => up('returnDate', v)} placeholder="e.g. June 1, 2026" />
        <Input label="Follow-Up Date" value={form.followUpDate} onChange={v => up('followUpDate', v)} placeholder="e.g. June 15, 2026" />
      </div>
    </div>
    <div style={S.card}>
      <div style={S.sectionHead}>Work Restrictions</div>
      <Textarea label="Restrictions" value={form.restrictions?.join('\n')} onChange={v => up('restrictions', v.split('\n').filter(r=>r.trim()))} hint="One restriction per line" placeholder={'No lifting over 15 lbs\nSedentary work only'} />
    </div>
  </>)

  if (form.letterType === 'mednet') return (<>
    {sharedPatient}
    <div style={S.card}>
      <div style={S.sectionHead}>Diagnosis</div>
      <div style={{ ...S.grid2, gap: '12px' }}>
        <Input label="Primary Diagnosis" value={form.patient.diagnosis} onChange={v => upP('diagnosis', v)} span2 />
        <Input label="ICD-10 Code(s)" value={form.patient.icdCodes} onChange={v => upP('icdCodes', v)} placeholder="e.g. B20, Z21" />
        <Select label="Urgency" value={form.urgency} onChange={v => up('urgency', v)} options={[['routine','Routine'],['urgent','Urgent'],['emergent','Emergent']]} />
      </div>
    </div>
    <div style={S.card}>
      <div style={S.sectionHead}>Treatment Details</div>
      <div style={{ ...S.grid2, gap: '12px' }}>
        <Input label="Medication / Treatment" value={form.medication} onChange={v => up('medication', v)} />
        <Input label="Dosage" value={form.dosage} onChange={v => up('dosage', v)} />
        <Input label="Frequency" value={form.frequency} onChange={v => up('frequency', v)} />
        <Input label="Duration" value={form.duration} onChange={v => up('duration', v)} placeholder="e.g. 6 months" />
      </div>
    </div>
    <div style={S.card}>
      <div style={S.sectionHead}>Justification</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Textarea label="Clinical Justification" value={form.clinicalJustification} onChange={v => up('clinicalJustification', v)} placeholder="Describe why this treatment is medically necessary…" />
        <Textarea label="Prior / Failed Therapies" value={form.failedTherapies} onChange={v => up('failedTherapies', v)} placeholder="List previously attempted treatments and outcomes…" />
      </div>
    </div>
  </>)

  if (form.letterType === 'priorauth') return (<>
    {sharedPatient}
    <div style={S.card}>
      <div style={S.sectionHead}>Diagnosis</div>
      <div style={{ ...S.grid2, gap: '12px' }}>
        <Input label="Primary Diagnosis" value={form.patient.diagnosis} onChange={v => upP('diagnosis', v)} span2 />
        <Input label="ICD-10 Code(s)" value={form.patient.icdCodes} onChange={v => upP('icdCodes', v)} />
      </div>
    </div>
    <div style={S.card}>
      <div style={S.sectionHead}>Requested Service</div>
      <div style={{ ...S.grid2, gap: '12px' }}>
        <Input label="Requested Service / Procedure" value={form.requestedService} onChange={v => up('requestedService', v)} span2 />
        <Input label="CPT Code(s)" value={form.cptCode} onChange={v => up('cptCode', v)} />
        <Input label="Facility / Rendering Provider" value={form.facility} onChange={v => up('facility', v)} />
        <Input label="Requested Service Date" value={form.requestedDate} onChange={v => up('requestedDate', v)} />
      </div>
    </div>
    <div style={S.card}>
      <div style={S.sectionHead}>Justification</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Textarea label="Clinical Justification" value={form.clinicalJustification} onChange={v => up('clinicalJustification', v)} placeholder="Describe clinical reasoning for this request…" />
        <Textarea label="Supporting Diagnoses / Comorbidities" value={form.supportingDiagnosis} onChange={v => up('supportingDiagnosis', v)} placeholder="List relevant comorbidities or contributing diagnoses…" />
      </div>
    </div>
  </>)

  if (form.letterType === 'followup') return (<>
    <div style={S.card}>
      <div style={S.sectionHead}>Patient Information</div>
      <div style={{ ...S.grid2, gap: '12px' }}>
        <Input label="Full Name" value={form.patient.name} onChange={v => upP('name', v)} />
        <Input label="Date of Birth" value={form.patient.dob} onChange={v => upP('dob', v)} />
        <Input label="Diagnosis" value={form.patient.diagnosis} onChange={v => upP('diagnosis', v)} span2 />
        <Input label="Visit Date" value={form.visitDate} onChange={v => up('visitDate', v)} />
        <Input label="Follow-Up Appointment Date" value={form.followUpDate} onChange={v => up('followUpDate', v)} />
      </div>
    </div>
    <div style={S.card}>
      <div style={S.sectionHead}>Instructions & Restrictions</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Textarea label="Care Instructions" value={form.instructions?.join('\n')} onChange={v => up('instructions', v.split('\n').filter(r=>r.trim()))} hint="One instruction per line" placeholder={'Take all medications as prescribed\nRest and avoid strenuous activity for 48 hours'} />
        <Textarea label="Activity Restrictions" value={form.activityRestrictions} onChange={v => up('activityRestrictions', v)} placeholder="e.g. No driving for 24 hours, no heavy lifting" />
        <Textarea label="Medications / Dosing" value={form.medications} onChange={v => up('medications', v)} placeholder="e.g. Amoxicillin 500mg TID x 10 days" />
        <Textarea label="Warning Signs — Seek Immediate Care If:" value={form.warningSignals} onChange={v => up('warningSignals', v)} placeholder="e.g. Fever over 101°F, severe pain, shortness of breath" />
        <Input label="Emergency / Office Phone" value={form.emergencyContact} onChange={v => up('emergencyContact', v)} />
      </div>
    </div>
  </>)

  if (form.letterType === 'infusion') return (<>
    {sharedPatient}
    <div style={S.card}>
      <div style={S.sectionHead}>Diagnosis & Authorization</div>
      <div style={{ ...S.grid2, gap: '12px' }}>
        <Input label="Primary Diagnosis" value={form.patient.diagnosis} onChange={v => upP('diagnosis', v)} />
        <Input label="Authorization Number" value={form.authorizationNumber} onChange={v => up('authorizationNumber', v)} />
      </div>
    </div>
    <div style={S.card}>
      <div style={S.sectionHead}>Infusion Details</div>
      <div style={{ ...S.grid2, gap: '12px' }}>
        <Input label="Medication" value={form.medication} onChange={v => up('medication', v)} />
        <Input label="Dosage" value={form.dosage} onChange={v => up('dosage', v)} />
        <Input label="Frequency" value={form.frequency} onChange={v => up('frequency', v)} />
        <Input label="Session Duration" value={form.infusionDuration} onChange={v => up('infusionDuration', v)} placeholder="e.g. 2–3 hours" />
      </div>
    </div>
    <div style={S.card}>
      <div style={S.sectionHead}>Consent & Billing</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Textarea label="Consent Points" value={form.consentItems?.join('\n')} onChange={v => up('consentItems', v.split('\n').filter(r=>r.trim()))} hint="One consent item per line. Leave blank for standard IDC consent." placeholder="Leave blank for standard consent language…" />
        <Textarea label="Billing Disclosure" value={form.billingDisclosure} onChange={v => up('billingDisclosure', v)} placeholder="Describe billing, insurance coverage details…" />
        <Input label="Estimated Patient Copay / Responsibility" value={form.expectedCopay} onChange={v => up('expectedCopay', v)} placeholder="e.g. $150 per session" />
      </div>
    </div>
  </>)

  return null
}

export default function App() {
  const [step, setStep] = useState('form')
  const [form, setForm] = useState(emptyForm('rtw'))
  const [letterHTML, setLetterHTML] = useState('')
  const [drag, setDrag] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState(null)
  const [activeHistoryId, setActiveHistoryId] = useState(null)
  const [refreshHistory, setRefreshHistory] = useState(0)
  const fileRef = useRef()
  const session = { user: { email: 'staff@idconsults.net' } }

  useEffect(() => {}, [])

  const selectType = (id) => { setForm(emptyForm(id)); setLetterHTML(''); setStep('form'); setSavedId(null); setError('') }

  const toBase64 = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result.split(',')[1]); r.onerror = () => rej(new Error('Read failed')); r.readAsDataURL(file) })

  const handleFile = async (f) => {
    if (!f || f.type !== 'application/pdf') { setError('Please upload a PDF file.'); return }
    setError(''); setStep('extracting')
    try {
      const base64 = await toBase64(f)
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64, systemPrompt: EXTRACT_PROMPTS[form.letterType] })
      })
      const data = await res.json()
      const text = (data.text || '').replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(text)
      setForm(f => ({
        ...f,
        ...Object.fromEntries(Object.entries(parsed).filter(([k]) => k !== 'patient' && k !== 'letterType')),
        patient: { ...f.patient, ...(parsed.patient || {}) },
      }))
      setStep('form')
    } catch {
      setError('Could not extract data. Fill in fields manually.')
      setStep('form')
    }
  }

  const handleGenerate = () => { setLetterHTML(generateLetterHTML(form)); setStep('preview'); setSavedId(null) }

  const handleSave = async () => {
    setSaving(true)
    try {
      const letter = await saveLetter({ form, letterHTML, userEmail: session.user.email })
      setSavedId(letter.id); setActiveHistoryId(letter.id); setRefreshHistory(r => r + 1)
    } catch (e) { setError('Save failed: ' + e.message) }
    setSaving(false)
  }

  const handleDownload = () => {
    const lt = LETTER_TYPES.find(t => t.id === form.letterType)?.label || 'Letter'
    const blob = new Blob([letterHTML], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `IDC_${lt.replace(/\s+/g,'_')}_${form.patient.name?.replace(/\s+/g,'_') || 'Patient'}_${new Date().toISOString().slice(0,10)}.html`
    a.click(); URL.revokeObjectURL(url)
  }

  const handleSelectHistory = async (id) => {
    setActiveHistoryId(id)
    try {
      const { letter, form: loadedForm } = await loadLetter(id)
      setForm({ ...emptyForm(loadedForm.letterType), ...loadedForm })
      setLetterHTML(letter.letter_html || '')
      setSavedId(id)
      setStep(letter.letter_html ? 'preview' : 'form')
    } catch (e) { setError('Could not load letter: ' + e.message) }
  }

  const handleNew = () => { setForm(emptyForm('rtw')); setLetterHTML(''); setStep('form'); setSavedId(null); setActiveHistoryId(null); setError('') }

  const currentType = LETTER_TYPES.find(t => t.id === form.letterType)

  return (
    <div style={S.app}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} ${FONTS} input::placeholder,textarea::placeholder{color:#b8b6b0} select option{background:#fff; color:#1a1a2e;}`}</style>

      <HistoryPanel activeId={activeHistoryId} onSelect={handleSelectHistory} onNew={handleNew} refreshTrigger={refreshHistory} />

      <div style={S.main}>
        <div style={S.topbar}>
          <div>
            <div style={S.topTitle}>IDC Letter Generator</div>
            <div style={S.topSub}>ID Consultants Inc. · Boynton Beach, FL</div>
          </div>
          <div style={S.userInfo}>
            <span style={S.userEmail}>idconsults.net</span>
          </div>
        </div>

        <div style={S.content}>
          {error && <div style={S.err}>{error}</div>}

          {step === 'extracting' && (
            <div style={S.centered}>
              <div style={S.spinner} />
              <div style={S.centeredText}>Extracting clinical data from PDF…</div>
            </div>
          )}

          {step === 'form' && (
            <>
              <div style={S.card}>
                <div style={S.sectionHead}>Letter Type</div>
                <div style={S.typeGrid}>
                  {LETTER_TYPES.map(t => (
                    <div key={t.id} style={S.typeBtn(form.letterType === t.id)} onClick={() => selectType(t.id)}>
                      <div style={S.typeIcon}>{t.icon}</div>
                      <div style={S.typeLabel(form.letterType === t.id)}>{t.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={S.card}>
                <div style={S.sectionHead}>Import from PDF (optional)</div>
                <div
                  style={S.dropzone(drag)}
                  onDragOver={e => { e.preventDefault(); setDrag(true) }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]) }}
                  onClick={() => fileRef.current.click()}
                >
                  <div style={S.dropIcon}>📄</div>
                  <div style={S.dropText}>Drop a clinical PDF to auto-fill {currentType?.label} fields</div>
                  <div style={S.dropSub}>Discharge summaries, clinical notes, prior letters, EOBs</div>
                </div>
                <input ref={fileRef} type="file" accept="application/pdf" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
              </div>

              <div style={S.card}>
                <div style={S.sectionHead}>Signing Provider</div>
                <select style={S.select} value={form.signingProvider} onChange={e => setForm(f => ({ ...f, signingProvider: e.target.value }))}>
                  {PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <LetterForm form={form} setForm={setForm} />

              <div style={S.card}>
                <div style={S.sectionHead}>Additional Notes</div>
                <textarea style={S.textarea} value={form.additionalNotes || ''} onChange={e => setForm(f => ({ ...f, additionalNotes: e.target.value }))} placeholder="Any additional notes to include in the letter…" />
              </div>
            </>
          )}

          {step === 'preview' && (
            <>
              {savedId && <div style={S.successBanner}>✓ Letter saved to history</div>}
              <iframe style={S.previewFrame} srcDoc={letterHTML} title="Letter Preview" sandbox="allow-same-origin" />
              <div style={S.previewNote}>Download HTML → open in Chrome → Print → Save as PDF</div>
            </>
          )}
        </div>

        <div style={S.divider} />
        <div style={S.bottomBar}>
          {step === 'form' && (
            <button style={S.btn} onClick={handleGenerate}>Generate {currentType?.label} Letter →</button>
          )}
          {step === 'preview' && (<>
            <button style={S.btnOutline} onClick={() => setStep('form')}>← Edit Fields</button>
            {!savedId && <button style={S.btnOutline} onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : '💾 Save'}</button>}
            <button style={S.btnSuccess} onClick={handleDownload}>⬇ Download HTML</button>
          </>)}
        </div>
      </div>
    </div>
  )
}
