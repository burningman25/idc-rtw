// ── Shared design system ──────────────────────────────────────────────────────

const todayStr = () => new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

const refNumber = () => {
  const d = new Date()
  return `IDC-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`
}

const baseCSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 10pt; color: #000000; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page { width: 8.5in; min-height: 11in; display: flex; flex-direction: column; }

  .header-band { background: #1a1a2e; padding: 22px 52px 18px; display: flex; justify-content: space-between; align-items: flex-end; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .practice-name { font-family: Georgia, serif; font-size: 20pt; font-weight: 700; color: #ffffff; line-height: 1; margin-bottom: 6px; }
  .providers-line { font-size: 7.5pt; color: #c8c6c0; line-height: 1.7; }
  .contact-block { text-align: right; font-size: 8.5pt; color: #c8c6c0; line-height: 1.8; }
  .contact-label { color: #ffffff; font-weight: 700; font-size: 9pt; display: block; margin-bottom: 2px; }
  .accent-bar { height: 5px; background: #b8943f; flex-shrink: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  .body { flex: 1; padding: 26px 52px 18px; display: flex; flex-direction: column; }

  .date-line { font-size: 9.5pt; color: #333333; margin-bottom: 14px; text-align: right; }
  .recipient-line { font-size: 9.5pt; color: #333333; margin-bottom: 14px; }

  .re-block { border: 1.5px solid #cccccc; border-left: 5px solid #1a1a2e; border-radius: 0 5px 5px 0; padding: 10px 16px; margin-bottom: 16px; background: #f7f7f5; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .re-title { font-size: 7.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: #555555; margin-bottom: 6px; }
  .re-grid { display: flex; flex-wrap: wrap; gap: 2px 32px; }
  .re-item { font-size: 9.5pt; color: #000000; }
  .re-item .lbl { color: #555555; font-size: 8.5pt; margin-right: 4px; }

  .body-para { margin-bottom: 10px; line-height: 1.65; color: #111111; font-size: 10pt; }

  .badge-row { margin: 8px 0 12px; }
  .badge { display: inline-block; padding: 6px 16px; border-radius: 3px; font-size: 8.5pt; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #ffffff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  .data-table { width: 100%; border-collapse: collapse; margin: 10px 0 12px; page-break-inside: avoid; }
  .data-table tr { border-bottom: 1px solid #dddddd; }
  .data-table tr:first-child { border-top: 1.5px solid #aaaaaa; }
  .data-table tr:last-child { border-bottom: 1.5px solid #aaaaaa; }
  .data-table td { padding: 8px 10px 8px 0; vertical-align: top; font-size: 10pt; }
  .data-table td.col-label { width: 36%; font-size: 8pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #444444; padding-top: 9px; }
  .data-table td.col-value { color: #000000; line-height: 1.5; }

  .info-box { background: #f7f7f5; border: 1.5px solid #cccccc; border-radius: 5px; padding: 10px 14px; margin: 8px 0 12px; page-break-inside: avoid; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .info-box-label { font-size: 7.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #555555; margin-bottom: 6px; }
  .info-box-text { font-size: 9.5pt; color: #111111; line-height: 1.6; }
  .info-box ul { list-style: none; padding: 0; margin: 0; }
  .info-box ul li { padding: 4px 0 4px 16px; position: relative; font-size: 9.5pt; color: #111111; line-height: 1.5; }
  .info-box ul li::before { content: "▸"; position: absolute; left: 0; color: #666666; font-size: 8pt; top: 6px; }

  .warn-box { background: #fff5f5; border: 1.5px solid #ffaaaa; border-radius: 5px; padding: 10px 14px; margin: 8px 0 12px; page-break-inside: avoid; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .warn-box .info-box-label { color: #b91c1c; }
  .warn-box .info-box-text { color: #111111; }

  .billing-box { background: #f0f4ff; border: 1.5px solid #aabcee; border-radius: 5px; padding: 10px 14px; margin: 8px 0 12px; page-break-inside: avoid; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .billing-box .info-box-label { color: #1e3a8a; }

  .sig-section { margin-top: auto; padding-top: 16px; display: flex; justify-content: space-between; align-items: flex-end; }
  .sig-close { font-size: 10pt; color: #111111; margin-bottom: 28px; }
  .sig-line { width: 210px; border-bottom: 1.5px solid #000000; margin-bottom: 6px; }
  .sig-name { font-size: 10.5pt; font-weight: 700; color: #000000; }
  .sig-credential { font-size: 9pt; color: #333333; margin-top: 2px; }
  .ref-number { font-size: 8pt; color: #888888; text-align: right; }

  .sig-dual { display: flex; gap: 32px; margin-top: 36px; }
  .sig-block-item { flex: 1; }
  .sig-block-space { height: 36px; border-bottom: 1.5px solid #000000; margin-bottom: 6px; }
  .sig-block-label { font-size: 9.5pt; color: #333333; }
  .sig-block-date { font-size: 9pt; color: #666666; margin-top: 4px; }

  .footer-band { background: #f0efeb; border-top: 1.5px solid #cccccc; padding: 8px 52px; display: flex; justify-content: space-between; align-items: center; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .footer-left { font-size: 7pt; color: #555555; }
  .footer-right { font-size: 7pt; color: #888888; font-style: italic; }

  h1, h2, h3 { page-break-after: avoid; }
  p, li { orphans: 3; widows: 3; }
`

// ── Shared layout blocks ──────────────────────────────────────────────────────

const header = () => `
  <div class="header-band">
    <div>
      <div class="practice-name">ID Consultants Inc.</div>
      <div class="providers-line">
        Latha Srinath, MD &nbsp;&bull;&nbsp; Sunket Ahkee, MD &nbsp;&bull;&nbsp; Kitonga Kiminyo, MD<br/>
        Minu Mathew, MD &nbsp;&bull;&nbsp; Maria Elias, ARNP &nbsp;&bull;&nbsp; Sheeba Jacob, ARNP
      </div>
    </div>
    <div class="contact-block">
      <span class="contact-label">ID Consultants Inc.</span>
      2300 S. Congress Ave, Suite 100<br/>
      Boynton Beach, FL 33426<br/>
      Tel: 561-735-7531 &nbsp;|&nbsp; Fax: 561-742-8250
    </div>
  </div>
  <div class="accent-bar"></div>`

const reBlock = (title, items) => `
  <div class="re-block">
    <div class="re-title">Re: ${title}</div>
    <div class="re-grid">
      ${items.filter(Boolean).map(([label, value]) =>
        value ? `<div class="re-item"><span class="lbl">${label}:</span>${value}</div>` : ''
      ).join('')}
    </div>
  </div>`

const sig = (provider) => `
  <div class="sig-section">
    <div>
      <div class="sig-close">Sincerely,</div>
      <div class="sig-line"></div>
      <div class="sig-name">${provider || '[Signing Provider]'}</div>
      <div class="sig-credential">ID Consultants Inc. &nbsp;&bull;&nbsp; Boynton Beach, FL 33426</div>
    </div>
    <div class="ref-number">Ref: ${refNumber()}</div>
  </div>`

const footer = () => `
  <div class="footer-band">
    <div class="footer-left">This document is confidential and intended solely for the use of the addressed recipient. Unauthorized disclosure is prohibited under HIPAA regulations.</div>
    <div class="footer-right">ID Consultants Inc. &nbsp;&bull;&nbsp; idconsults.net</div>
  </div>`

const infoBox = (label, content, cls='info-box') => `
  <div class="${cls}">
    <div class="info-box-label">${label}</div>
    <div class="info-box-text">${content}</div>
  </div>`

const listBox = (label, items, cls='info-box') => `
  <div class="${cls}">
    <div class="info-box-label">${label}</div>
    <ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>
  </div>`

const dataTable = (rows) => `
  <table class="data-table">
    ${rows.filter(([,v]) => v).map(([label, value]) => `
    <tr>
      <td class="col-label">${label}</td>
      <td class="col-value">${value}</td>
    </tr>`).join('')}
  </table>`

const wrap = (body) => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/>
<style>${baseCSS}</style>
</head>
<body>
<div class="page">
  ${header()}
  <div class="body">
    <div class="date-line">${todayStr()}</div>
    ${body}
  </div>
  ${footer()}
</div>
</body>
</html>`

// ── 1. Return-to-Work ─────────────────────────────────────────────────────────

export function generateRTW(d) {
  const colors = { full: '#1a6b3c', modified: '#8b5e00', not_cleared: '#b91c1c' }
  const labels = { full: 'Full Duty Clearance', modified: 'Modified / Restricted Duty Clearance', not_cleared: 'Not Cleared for Return to Work' }
  const color = colors[d.clearanceType] || '#374151'
  const label = labels[d.clearanceType] || 'Return-to-Work Status'

  return wrap(`
    <div class="recipient-line">To Whom It May Concern / Human Resources Department</div>
    ${reBlock('Return-to-Work Letter', [
      ['Patient',              d.patient.name],
      ['Date of Birth',        d.patient.dob],
      ['Employer',             d.patient.employer],
      ['Position',             d.patient.jobTitle],
      ['Date of Injury',       d.patient.dateOfInjury],
    ])}
    <p class="body-para">Dear Employer / Human Resources,</p>
    <p class="body-para">This letter confirms that <strong>${d.patient.name || 'the above-named patient'}</strong>${d.patient.diagnosis ? `, a patient treated for <em>${d.patient.diagnosis}</em>,` : ''} has been clinically evaluated and the following return-to-work determination has been made:</p>
    <div class="badge-row"><span class="badge" style="background:${color};">&#9679;&nbsp; ${label}</span></div>
    ${d.returnDate ? `<p class="body-para">The patient is authorized to return to work effective <strong>${d.returnDate}</strong>.</p>` : ''}
    ${d.restrictions?.length ? listBox('Work Restrictions / Modified Duty Requirements', d.restrictions) : d.clearanceType === 'full' ? `<p class="body-para">The patient is cleared to return to full duty without restrictions.</p>` : ''}
    ${dataTable([
      ['Return-to-Work Date',   d.returnDate],
      ['Follow-Up Appointment', d.followUpDate],
      ['Date of Injury',        d.patient.dateOfInjury],
      ['Diagnosis',             d.patient.diagnosis],
    ])}
    ${d.additionalNotes ? infoBox('Clinical Notes', d.additionalNotes) : ''}
    <p class="body-para">Please do not hesitate to contact our office at <strong>561-735-7531</strong> or fax <strong>561-742-8250</strong> if you require additional documentation regarding this determination.</p>
    ${sig(d.signingProvider)}
  `)
}

// ── 2. Medical Necessity ──────────────────────────────────────────────────────

export function generateMedNecessity(d) {
  const uc = { routine: '#1a6b3c', urgent: '#8b5e00', emergent: '#b91c1c' }
  const ul = { routine: 'Routine Request', urgent: 'Urgent Request', emergent: 'Emergent Request' }

  return wrap(`
    <div class="recipient-line">To the Medical Director / Utilization Management Department</div>
    ${reBlock('Medical Necessity Letter', [
      ['Patient',        d.patient.name],
      ['Date of Birth',  d.patient.dob],
      ['Insurance Plan', d.patient.insurancePlan],
      ['Member ID',      d.patient.insuranceId],
      ['Diagnosis',      d.patient.diagnosis],
      ['ICD-10',         d.patient.icdCodes],
    ])}
    <p class="body-para">Dear Medical Director,</p>
    <p class="body-para">I am writing to document the medical necessity for the following treatment on behalf of my patient, <strong>${d.patient.name || 'the above-named patient'}</strong>. This request is classified as:</p>
    <div class="badge-row"><span class="badge" style="background:${uc[d.urgency]||'#374151'};">&#9679;&nbsp; ${ul[d.urgency]||'Routine Request'}</span></div>
    ${dataTable([
      ['Requested Medication', d.medication],
      ['Dosage',               d.dosage],
      ['Frequency',            d.frequency],
      ['Treatment Duration',   d.duration],
      ['Diagnosis Codes',      d.patient.icdCodes],
    ])}
    ${d.clinicalJustification ? infoBox('Clinical Justification', d.clinicalJustification) : ''}
    ${d.failedTherapies ? infoBox('Prior / Failed Therapies', d.failedTherapies) : ''}
    ${d.additionalNotes ? infoBox('Additional Notes', d.additionalNotes) : ''}
    <p class="body-para">Based on clinical evidence and my professional medical judgment, this treatment is medically necessary and appropriate for this patient's condition. I respectfully request your approval at the earliest convenience.</p>
    ${sig(d.signingProvider)}
  `)
}

// ── 3. Prior Authorization ────────────────────────────────────────────────────

export function generatePriorAuth(d) {
  return wrap(`
    <div class="recipient-line">To the Prior Authorization Department</div>
    ${reBlock('Prior Authorization Request', [
      ['Patient',          d.patient.name],
      ['Date of Birth',    d.patient.dob],
      ['Insurance Plan',   d.patient.insurancePlan],
      ['Member ID',        d.patient.insuranceId],
      ['Primary Diagnosis',d.patient.diagnosis],
    ])}
    <p class="body-para">Dear Prior Authorization Department,</p>
    <p class="body-para">We are requesting prior authorization for the following service or procedure for our patient, <strong>${d.patient.name || 'the above-named patient'}</strong>. Please review the clinical details below:</p>
    ${dataTable([
      ['Requested Service',    d.requestedService],
      ['CPT Code(s)',          d.cptCode],
      ['Diagnosis (ICD-10)',   d.patient.icdCodes],
      ['Facility / Provider',  d.facility],
      ['Requested Date',       d.requestedDate],
    ])}
    ${d.clinicalJustification ? infoBox('Clinical Justification', d.clinicalJustification) : ''}
    ${d.supportingDiagnosis ? infoBox('Supporting Diagnoses / Comorbidities', d.supportingDiagnosis) : ''}
    ${d.additionalNotes ? infoBox('Additional Notes', d.additionalNotes) : ''}
    <p class="body-para">Please direct questions or requests for additional documentation to our office at <strong>561-735-7531</strong> or fax to <strong>561-742-8250</strong>. We appreciate your prompt attention to this request.</p>
    ${sig(d.signingProvider)}
  `)
}

// ── 4. Follow-Up Instructions ─────────────────────────────────────────────────

export function generateFollowUp(d) {
  const firstName = d.patient.name ? d.patient.name.split(' ')[0] : 'Patient'
  return wrap(`
    ${reBlock('Follow-Up Instructions', [
      ['Patient',      d.patient.name],
      ['Date of Birth',d.patient.dob],
      ['Visit Date',   d.visitDate],
      ['Diagnosis',    d.patient.diagnosis],
    ])}
    <p class="body-para">Dear ${firstName},</p>
    <p class="body-para">Thank you for your visit${d.visitDate ? ` on <strong>${d.visitDate}</strong>` : ''}. Please review the following instructions carefully to support your continued recovery.</p>
    ${d.instructions?.length ? listBox('Care Instructions', d.instructions) : ''}
    ${dataTable([
      ['Follow-Up Appointment', d.followUpDate],
      ['Activity Restrictions', d.activityRestrictions],
      ['Medications / Dosing',  d.medications],
      ['Office Phone',          d.emergencyContact || '561-735-7531'],
    ])}
    ${d.warningSignals ? infoBox('Warning Signs — Seek Immediate Care If You Experience', d.warningSignals, 'warn-box') : ''}
    ${d.additionalNotes ? infoBox('Additional Notes', d.additionalNotes) : ''}
    <p class="body-para">If you have any questions before your next visit, please call our office at <strong>561-735-7531</strong>. We look forward to seeing you at your follow-up appointment.</p>
    ${sig(d.signingProvider)}
  `)
}

// ── 5. Infusion Consent / Billing Disclosure ──────────────────────────────────

export function generateInfusion(d) {
  const defaultConsent = [
    'I understand the purpose, risks, and benefits of the proposed infusion therapy.',
    'I have been informed of potential side effects and allergic reactions associated with the medication.',
    'I authorize ID Consultants Inc. to administer the infusion therapy as outlined above.',
    'I understand that I may withdraw consent at any time prior to or during the infusion.',
    'I have been given the opportunity to ask questions and all questions have been answered to my satisfaction.',
  ]
  const consentList = d.consentItems?.length ? d.consentItems : defaultConsent
  const firstName = d.patient.name ? d.patient.name.split(' ')[0] : 'Patient'

  return wrap(`
    ${reBlock('Infusion Consent & Billing Disclosure', [
      ['Patient',         d.patient.name],
      ['Date of Birth',   d.patient.dob],
      ['Insurance Plan',  d.patient.insurancePlan],
      ['Member ID',       d.patient.insuranceId],
      ['Diagnosis',       d.patient.diagnosis],
      ['Authorization #', d.authorizationNumber],
    ])}
    <p class="body-para">Dear ${firstName},</p>
    <p class="body-para">This letter outlines the details of your upcoming infusion therapy and associated billing information. Please review all sections carefully and sign where indicated.</p>
    ${dataTable([
      ['Medication',        d.medication],
      ['Dosage',            d.dosage],
      ['Frequency',         d.frequency],
      ['Session Duration',  d.infusionDuration],
    ])}
    ${listBox('Informed Consent — By signing below, I acknowledge and agree to the following', consentList)}
    ${(d.billingDisclosure || d.expectedCopay) ? `
    <div class="billing-box">
      <div class="info-box-label">Billing Disclosure</div>
      ${d.billingDisclosure ? `<div class="info-box-text" style="margin-bottom:8px;">${d.billingDisclosure}</div>` : ''}
      ${d.expectedCopay ? `<div class="info-box-text"><strong>Estimated Patient Responsibility:</strong> ${d.expectedCopay}</div>` : ''}
      <div class="info-box-text" style="margin-top:8px;font-size:9pt;color:#333;">Final billing amounts are subject to insurance adjudication. Questions? Call 561-735-7531.</div>
    </div>` : ''}
    ${d.additionalNotes ? infoBox('Additional Notes', d.additionalNotes) : ''}
    <div class="sig-dual">
      <div class="sig-block-item">
        <div class="sig-block-space"></div>
        <div class="sig-block-label">Patient Signature</div>
        <div class="sig-block-date">Date: ___________________</div>
      </div>
      <div class="sig-block-item">
        <div class="sig-block-space"></div>
        <div class="sig-block-label">Witness / Provider Signature</div>
        <div class="sig-block-date">Date: ___________________</div>
      </div>
    </div>
    ${sig(d.signingProvider)}
  `)
}

// ── Dispatcher ────────────────────────────────────────────────────────────────

export function generateLetterHTML(formData) {
  switch (formData.letterType) {
    case 'rtw':       return generateRTW(formData)
    case 'mednet':    return generateMedNecessity(formData)
    case 'priorauth': return generatePriorAuth(formData)
    case 'followup':  return generateFollowUp(formData)
    case 'infusion':  return generateInfusion(formData)
    default:          return '<p>Unknown letter type.</p>'
  }
}
