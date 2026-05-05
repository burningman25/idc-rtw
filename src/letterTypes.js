export const LETTER_TYPES = [
  { id: 'rtw',        label: 'Return-to-Work',              icon: '🏥' },
  { id: 'mednet',     label: 'Medical Necessity',           icon: '📋' },
  { id: 'priorauth',  label: 'Prior Authorization',         icon: '✅' },
  { id: 'followup',   label: 'Follow-Up Instructions',      icon: '📅' },
  { id: 'infusion',   label: 'Infusion Consent / Billing',  icon: '💉' },
]

export const PROVIDERS = [
  'Latha Srinath, MD',
  'Sunket Ahkee, MD',
  'Kitonga Kiminyo, MD',
  'Minu Mathew, MD',
  'Maria Elias, ARNP',
  'Sheeba Jacob, ARNP',
]

// ── Default empty forms per letter type ─────────────────────────────────────

export const emptyForm = (type) => {
  const base = {
    letterType: type,
    signingProvider: PROVIDERS[0],
    patient: { name: '', dob: '', insuranceId: '', insurancePlan: '' },
    additionalNotes: '',
  }
  switch (type) {
    case 'rtw':
      return { ...base, patient: { ...base.patient, employer: '', jobTitle: '', dateOfInjury: '', diagnosis: '' }, restrictions: [], clearanceType: 'modified', returnDate: '', followUpDate: '' }
    case 'mednet':
      return { ...base, patient: { ...base.patient, diagnosis: '', icdCodes: '' }, medication: '', dosage: '', frequency: '', duration: '', clinicalJustification: '', failedTherapies: '', urgency: 'routine' }
    case 'priorauth':
      return { ...base, patient: { ...base.patient, diagnosis: '', icdCodes: '' }, requestedService: '', cptCode: '', facility: '', requestedDate: '', clinicalJustification: '', supportingDiagnosis: '' }
    case 'followup':
      return { ...base, patient: { ...base.patient, diagnosis: '' }, visitDate: '', followUpDate: '', instructions: [], activityRestrictions: '', medications: '', warningSignals: '', emergencyContact: '561-735-7531' }
    case 'infusion':
      return { ...base, patient: { ...base.patient, diagnosis: '' }, medication: '', dosage: '', frequency: '', infusionDuration: '', consentItems: [], billingDisclosure: '', expectedCopay: '', authorizationNumber: '' }
    default:
      return base
  }
}

// ── AI extraction system prompts per letter type ─────────────────────────────

export const EXTRACT_PROMPTS = {
  rtw: `You are a medical document specialist. Extract return-to-work information from the document and return ONLY a JSON object.
{
  "patient": { "name": "", "dob": "", "employer": "", "jobTitle": "", "dateOfInjury": "", "diagnosis": "", "insuranceId": "", "insurancePlan": "" },
  "restrictions": [],
  "clearanceType": "full | modified | not_cleared",
  "returnDate": "",
  "followUpDate": "",
  "additionalNotes": ""
}
clearanceType must be one of: full, modified, not_cleared. restrictions is an array of strings.`,

  mednet: `You are a medical document specialist. Extract medical necessity information from the document and return ONLY a JSON object.
{
  "patient": { "name": "", "dob": "", "diagnosis": "", "icdCodes": "", "insuranceId": "", "insurancePlan": "" },
  "medication": "",
  "dosage": "",
  "frequency": "",
  "duration": "",
  "clinicalJustification": "",
  "failedTherapies": "",
  "urgency": "routine | urgent | emergent",
  "additionalNotes": ""
}`,

  priorauth: `You are a medical document specialist. Extract prior authorization information from the document and return ONLY a JSON object.
{
  "patient": { "name": "", "dob": "", "diagnosis": "", "icdCodes": "", "insuranceId": "", "insurancePlan": "" },
  "requestedService": "",
  "cptCode": "",
  "facility": "",
  "requestedDate": "",
  "clinicalJustification": "",
  "supportingDiagnosis": "",
  "additionalNotes": ""
}`,

  followup: `You are a medical document specialist. Extract follow-up care information from the document and return ONLY a JSON object.
{
  "patient": { "name": "", "dob": "", "diagnosis": "", "insuranceId": "", "insurancePlan": "" },
  "visitDate": "",
  "followUpDate": "",
  "instructions": [],
  "activityRestrictions": "",
  "medications": "",
  "warningSignals": "",
  "additionalNotes": ""
}
instructions is an array of plain strings.`,

  infusion: `You are a medical document specialist. Extract infusion therapy information from the document and return ONLY a JSON object.
{
  "patient": { "name": "", "dob": "", "diagnosis": "", "insuranceId": "", "insurancePlan": "" },
  "medication": "",
  "dosage": "",
  "frequency": "",
  "infusionDuration": "",
  "consentItems": [],
  "billingDisclosure": "",
  "expectedCopay": "",
  "authorizationNumber": "",
  "additionalNotes": ""
}
consentItems is an array of strings describing consent points.`,
}
