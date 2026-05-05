import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// ── Providers ─────────────────────────────────────────────────────────────────

export async function fetchProviders() {
  const { data, error } = await supabase
    .from('providers')
    .select('id, display_name, sort_order')
    .eq('is_active', true)
    .order('sort_order')
  if (error) throw error
  return data
}

// ── Patients ──────────────────────────────────────────────────────────────────

export async function searchPatients(query) {
  const { data, error } = await supabase
    .from('patients')
    .select('id, full_name, date_of_birth, insurance_plan, insurance_id, employer, job_title, primary_diagnosis')
    .ilike('full_name', `%${query}%`)
    .eq('is_active', true)
    .order('last_name')
    .limit(10)
  if (error) throw error
  return data
}

export async function upsertPatient(patientData) {
  // If we have an ID, update. Otherwise insert.
  if (patientData.id) {
    const { data, error } = await supabase
      .from('patients')
      .update({
        first_name:        patientData.firstName,
        last_name:         patientData.lastName,
        date_of_birth:     patientData.dob     || null,
        insurance_plan:    patientData.insurancePlan || null,
        insurance_id:      patientData.insuranceId  || null,
        employer:          patientData.employer      || null,
        job_title:         patientData.jobTitle      || null,
        primary_diagnosis: patientData.diagnosis     || null,
      })
      .eq('id', patientData.id)
      .select().single()
    if (error) throw error
    return data
  } else {
    const nameParts = (patientData.name || '').trim().split(/\s+/)
    const firstName = nameParts.slice(0, -1).join(' ') || nameParts[0] || ''
    const lastName  = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''
    const { data, error } = await supabase
      .from('patients')
      .insert({
        first_name:        firstName,
        last_name:         lastName,
        date_of_birth:     patientData.dob          || null,
        insurance_plan:    patientData.insurancePlan || null,
        insurance_id:      patientData.insuranceId  || null,
        employer:          patientData.employer      || null,
        job_title:         patientData.jobTitle      || null,
        primary_diagnosis: patientData.diagnosis     || null,
      })
      .select().single()
    if (error) throw error
    return data
  }
}

// ── Templates ─────────────────────────────────────────────────────────────────

export async function fetchTemplates(letterType = null) {
  let q = supabase
    .from('templates')
    .select('id, name, description, letter_type, family, template_data, use_count')
    .eq('is_active', true)
    .order('use_count', { ascending: false })
  if (letterType) q = q.eq('letter_type', letterType)
  const { data, error } = await q
  if (error) throw error
  return data
}

export async function saveTemplate({ name, description, letterType, family, formData, userEmail }) {
  const { data, error } = await supabase
    .from('templates')
    .insert({
      name,
      description,
      letter_type:    letterType,
      family,
      template_data:  formData,
      created_by:     userEmail,
    })
    .select().single()
  if (error) throw error
  return data
}

export async function incrementTemplateUseCount(templateId) {
  await supabase.rpc('increment_template_use_count', { template_id: templateId })
}

// ── Letters ───────────────────────────────────────────────────────────────────

export async function saveLetter({ form, letterHTML, userEmail, patientId, providerId, templateId }) {
  // 1. Resolve or create patient
  let resolvedPatientId = patientId || null
  if (!resolvedPatientId && form.patient?.name) {
    try {
      const patient = await upsertPatient(form.patient)
      resolvedPatientId = patient.id
    } catch { /* non-blocking */ }
  }

  // 2. Insert letter row
  const { data: letter, error: letterErr } = await supabase
    .from('letters')
    .insert({
      letter_type:      form.letterType,
      family:           letterTypeToFamily(form.letterType),
      status:           'final',
      patient_id:       resolvedPatientId,
      provider_id:      providerId || null,
      template_id:      templateId || null,
      patient_name:     form.patient?.name  || null,
      patient_dob:      form.patient?.dob   || null,
      signing_provider: form.signingProvider || null,
      letter_html:      letterHTML,
      created_by:       userEmail,
    })
    .select().single()

  if (letterErr) throw letterErr

  // 3. Insert all type-specific fields as key-value pairs
  const kvPairs = buildKVPairs(letter.id, form)
  if (kvPairs.length > 0) {
    const { error: dataErr } = await supabase.from('letter_data').insert(kvPairs)
    if (dataErr) throw dataErr
  }

  // 4. Write audit event
  await writeAudit({
    letterId:    letter.id,
    patientId:   resolvedPatientId,
    action:      'created',
    performedBy: userEmail,
    metadata:    { letter_type: form.letterType, signing_provider: form.signingProvider }
  })

  return letter
}

export async function loadLetter(id) {
  const { data: letter, error: letterErr } = await supabase
    .from('letters').select('*').eq('id', id).single()
  if (letterErr) throw letterErr

  const { data: rows, error: dataErr } = await supabase
    .from('letter_data').select('key, value').eq('letter_id', id)
  if (dataErr) throw dataErr

  // Reconstruct form from stored data
  const form = {
    letterType:      letter.letter_type,
    signingProvider: letter.signing_provider || '',
    additionalNotes: '',
    patient: {
      name: letter.patient_name || '',
      dob:  letter.patient_dob  || '',
    },
  }

  for (const { key, value } of rows) {
    if (key.startsWith('patient_')) {
      form.patient[key.replace('patient_', '')] = value
    } else if (key === 'additionalNotes') {
      form.additionalNotes = value
    } else {
      try { form[key] = JSON.parse(value) }
      catch { form[key] = value }
    }
  }

  return { letter, form }
}

export async function fetchLetterHistory(limit = 100) {
  const { data, error } = await supabase
    .from('letters')
    .select('id, letter_type, family, patient_name, signing_provider, status, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

export async function fetchPatientLetters(patientId) {
  const { data, error } = await supabase
    .from('letters')
    .select('id, letter_type, signing_provider, status, created_at')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function voidLetter(id, userEmail) {
  const { error } = await supabase
    .from('letters').update({ status: 'voided' }).eq('id', id)
  if (error) throw error
  await writeAudit({ letterId: id, action: 'voided', performedBy: userEmail })
}

// ── Audit ─────────────────────────────────────────────────────────────────────

export async function writeAudit({ letterId, patientId, action, performedBy, metadata = {} }) {
  await supabase.from('audit_events').insert({
    letter_id:    letterId    || null,
    patient_id:   patientId  || null,
    action,
    performed_by: performedBy,
    metadata,
  })
  // Non-blocking — don't throw on audit failure
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function letterTypeToFamily(type) {
  const map = {
    rtw:       'patient',
    followup:  'patient',
    mednet:    'clinical',
    priorauth: 'clinical',
    infusion:  'infusion',
  }
  return map[type] || 'administrative'
}

function buildKVPairs(letterId, form) {
  const skip = new Set(['letterType', 'signingProvider', 'patient', 'additionalNotes'])
  const pairs = []

  if (form.patient) {
    for (const [k, v] of Object.entries(form.patient)) {
      if (v !== undefined && v !== null && v !== '') {
        pairs.push({ letter_id: letterId, key: `patient_${k}`, value: String(v) })
      }
    }
  }

  for (const [k, v] of Object.entries(form)) {
    if (skip.has(k)) continue
    if (v === undefined || v === null || v === '') continue
    if (Array.isArray(v)) {
      if (v.length > 0) pairs.push({ letter_id: letterId, key: k, value: JSON.stringify(v) })
    } else {
      pairs.push({ letter_id: letterId, key: k, value: String(v) })
    }
  }

  if (form.additionalNotes) {
    pairs.push({ letter_id: letterId, key: 'additionalNotes', value: form.additionalNotes })
  }

  return pairs
}
