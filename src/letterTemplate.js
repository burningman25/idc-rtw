// ── Shared letterhead ────────────────────────────────────────────────────────

const todayStr = () => new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

const baseCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Source Sans 3', sans-serif; font-size: 11.5pt; color: #1a1a2e; background: white; }
  .page { max-width: 780px; margin: 0 auto; padding: 52px 64px; min-height: 100vh; }
  .letterhead { border-bottom: 3px solid #1a1a2e; padding-bottom: 20px; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: flex-end; }
  .lh-left h1 { font-family: 'Libre Baskerville', serif; font-size: 19pt; font-weight: 700; color: #0f0f23; margin-bottom: 4px; }
  .lh-left .providers { font-size: 8.5pt; color: #444; line-height: 1.6; }
  .lh-right { text-align: right; font-size: 9pt; color: #555; line-height: 1.7; }
  .re-block { background: #f4f6fb; border-left: 4px solid #1a1a2e; padding: 14px 18px; margin-bottom: 26px; border-radius: 0 6px 6px 0; }
  .re-label { font-size: 8.5pt; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #777; margin-bottom: 6px; }
  .re-content { font-size: 11pt; font-weight: 600; color: #1a1a2e; line-height: 1.6; }
  .body-para { margin-bottom: 14px; line-height: 1.75; color: #222; }
  .badge { display: inline-block; color: white; font-size: 9pt; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; padding: 5px 14px; border-radius: 4px; margin: 4px 0 16px 0; }
  .info-box { border: 1.5px solid #d1d5db; border-radius: 8px; padding: 18px 22px; margin: 18px 0; background: #fafafa; break-inside: avoid; page-break-inside: avoid; overflow: hidden; }
  .info-box h3 { font-family: 'Libre Baskerville', serif; font-size: 10.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #374151; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; }
  .info-box ul { list-style: none; padding: 0; }
  .info-box ul li { padding: 5px 0 5px 20px; position: relative; font-size: 11pt; color: #333; line-height: 1.5; }
  .info-box ul li::before { content: "▸"; position: absolute; left: 0; color: #6b7280; font-size: 9pt; top: 7px; }
  .data-table { width: 100%; border-collapse: collapse; margin: 18px 0; break-inside: avoid; page-break-inside: avoid; overflow: hidden; }
  .data-table td { padding: 10px 14px; font-size: 11pt; border-bottom: 1px solid #e9ecef; }
  .data-table tr:first-child td { border-top: 1.5px solid #d1d5db; }
  .data-table td:first-child { font-weight: 600; color: #374151; width: 40%; font-size: 10pt; text-transform: uppercase; letter-spacing: 0.4px; }
  .sig-block { margin-top: 48px; }
  .sig-line { border-bottom: 1.5px solid #222; width: 240px; margin-bottom: 6px; }
  .sig-name { font-weight: 700; font-size: 11.5pt; color: #1a1a2e; }
  .sig-title { font-size: 10pt; color: #555; margin-top: 2px; }
  .footer-bar { margin-top: 48px; padding-top: 14px; border-top: 1.5px solid #e5e7eb; font-size: 8.5pt; color: #9ca3af; text-align: center; letter-spacing: 0.3px; }
  h1, h2, h3 { break-after: avoid; page-break-after: avoid; }
  p, li { orphans: 3; widows: 3; }
`

const lh = () => `
  <div class="letterhead">
    <div class="lh-left">
      <h1>ID Consultants Inc.</h1>
      <div class="providers">
        Latha Srinath, MD &bull; Sunket Ahkee, MD &bull; Kitonga Kiminyo, MD<br/>
        Minu Mathew, MD &bull; Maria Elias, ARNP &bull; Sheeba Jacob, ARNP
      </div>
    </div>
    <div class="lh-right">
      <div>2300 S. Congress Ave, Suite 100</div>
      <div>Boynton Beach, FL 33426</div>
      <div>Phone: 561-735-7531 &nbsp;|&nbsp; Fax: 561-742-8250</div>
      <div style="margin-top:6px;">${todayStr()}</div>
    </div>
  </div>`

const re = (label, lines) => `
  <div class="re-block">
    <div class="re-label">Re: ${label}</div>
    <div class="re-content">${lines.filter(Boolean).join('<br/>')}</div>
  </div>`

const sig = (provider) => `
  <p class="body-para" style="margin-top:28px;">Sincerely,</p>
  <div class="sig-block">
    <div class="sig-line"></div>
    <div class="sig-name">${provider || '[Signing Provider]'}</div>
    <div class="sig-title">ID Consultants Inc. &nbsp;&bull;&nbsp; 2300 S. Congress Ave, Suite 100, Boynton Beach, FL 33426</div>
  </div>`

const ft = () => `
  <div class="footer-bar">
    This document is confidential and intended solely for the use of the addressed recipient.
    Unauthorized disclosure is prohibited under HIPAA regulations.
  </div>`

const wrap = (body) => `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<style>${baseCSS}</style>
</head><body><div class="page">
${body}
</div></body></html>`

// ── 1. Return-to-Work ─────────────────────────────────────────────────────────

export function generateRTW(d) {
  const colors = { full: '#1a6b3c', modified: '#8b5e00', not_cleared: '#b91c1c' }
  const labels = { full: 'FULL DUTY CLEARANCE', modified: 'MODIFIED / RESTRICTED DUTY CLEARANCE', not_cleared: 'NOT CLEARED FOR RETURN TO WORK' }
  return wrap(`
    ${lh()}
    <p class="body-para">To Whom It May Concern / Human Resources Department</p>
    ${re('Return-to-Work Letter', [
      `Patient: ${d.patient.name || '[Patient Name]'}`,
      d.patient.dob && `Date of Birth: ${d.patient.dob}`,
      d.patient.employer && `Employer: ${d.patient.employer}`,
      d.patient.jobTitle && `Position: ${d.patient.jobTitle}`,
      d.patient.dateOfInjury && `Date of Injury/Illness: ${d.patient.dateOfInjury}`,
    ])}
    <p class="body-para">Dear Employer / Human Resources,</p>
    <p class="body-para">This letter confirms that <strong>${d.patient.name || 'the above-named patient'}</strong>${d.patient.diagnosis ? `, treated for <em>${d.patient.diagnosis}</em>,` : ''} has been evaluated and the following return-to-work determination has been made:</p>
    <div><span class="badge" style="background:${colors[d.clearanceType] || '#374151'};">${labels[d.clearanceType] || 'RTW STATUS'}</span></div>
    ${d.returnDate ? `<p class="body-para">The patient is authorized to return to work effective <strong>${d.returnDate}</strong>.</p>` : ''}
    ${d.restrictions?.length ? `<div class="info-box"><h3>Work Restrictions / Modified Duty Requirements</h3><ul>${d.restrictions.map(r=>`<li>${r}</li>`).join('')}</ul></div>` : d.clearanceType==='full' ? `<p class="body-para">The patient is cleared to return to full duty without restrictions.</p>` : ''}
    <table class="data-table">
      ${d.returnDate ? `<tr><td>Return-to-Work Date</td><td>${d.returnDate}</td></tr>` : ''}
      ${d.followUpDate ? `<tr><td>Follow-Up Appointment</td><td>${d.followUpDate}</td></tr>` : ''}
      ${d.patient.dateOfInjury ? `<tr><td>Date of Injury/Illness</td><td>${d.patient.dateOfInjury}</td></tr>` : ''}
      ${d.patient.diagnosis ? `<tr><td>Diagnosis</td><td>${d.patient.diagnosis}</td></tr>` : ''}
    </table>
    ${d.additionalNotes ? `<p class="body-para"><strong>Additional Notes:</strong> ${d.additionalNotes}</p>` : ''}
    <p class="body-para">Please contact our office if you require additional documentation regarding this patient's return-to-work status.</p>
    ${sig(d.signingProvider)}${ft()}`)
}

// ── 2. Medical Necessity ──────────────────────────────────────────────────────

export function generateMedNecessity(d) {
  const uc = { routine: '#1a6b3c', urgent: '#8b5e00', emergent: '#b91c1c' }
  const ul = { routine: 'ROUTINE', urgent: 'URGENT', emergent: 'EMERGENT' }
  return wrap(`
    ${lh()}
    <p class="body-para">To the Medical Director / Utilization Management Department</p>
    ${re('Medical Necessity Letter', [
      `Patient: ${d.patient.name || '[Patient Name]'}`,
      d.patient.dob && `Date of Birth: ${d.patient.dob}`,
      d.patient.insurancePlan && `Insurance Plan: ${d.patient.insurancePlan}`,
      d.patient.insuranceId && `Member ID: ${d.patient.insuranceId}`,
      d.patient.diagnosis && `Diagnosis: ${d.patient.diagnosis}`,
      d.patient.icdCodes && `ICD-10: ${d.patient.icdCodes}`,
    ])}
    <p class="body-para">Dear Medical Director,</p>
    <p class="body-para">I am writing to document the medical necessity for the following treatment on behalf of my patient, <strong>${d.patient.name || 'the above-named patient'}</strong>. This request is classified as:</p>
    <div><span class="badge" style="background:${uc[d.urgency]||'#374151'};">${ul[d.urgency]||'ROUTINE'}</span></div>
    <table class="data-table">
      ${d.medication ? `<tr><td>Requested Medication</td><td>${d.medication}</td></tr>` : ''}
      ${d.dosage ? `<tr><td>Dosage</td><td>${d.dosage}</td></tr>` : ''}
      ${d.frequency ? `<tr><td>Frequency</td><td>${d.frequency}</td></tr>` : ''}
      ${d.duration ? `<tr><td>Treatment Duration</td><td>${d.duration}</td></tr>` : ''}
      ${d.patient.icdCodes ? `<tr><td>Diagnosis Codes</td><td>${d.patient.icdCodes}</td></tr>` : ''}
    </table>
    ${d.clinicalJustification ? `<div class="info-box"><h3>Clinical Justification</h3><p style="line-height:1.75;color:#333;">${d.clinicalJustification}</p></div>` : ''}
    ${d.failedTherapies ? `<div class="info-box"><h3>Prior / Failed Therapies</h3><p style="line-height:1.75;color:#333;">${d.failedTherapies}</p></div>` : ''}
    ${d.additionalNotes ? `<p class="body-para"><strong>Additional Notes:</strong> ${d.additionalNotes}</p>` : ''}
    <p class="body-para">Based on clinical evidence and my professional medical judgment, this treatment is medically necessary and appropriate. I respectfully request approval at your earliest convenience.</p>
    ${sig(d.signingProvider)}${ft()}`)
}

// ── 3. Prior Authorization ────────────────────────────────────────────────────

export function generatePriorAuth(d) {
  return wrap(`
    ${lh()}
    <p class="body-para">To the Prior Authorization Department</p>
    ${re('Prior Authorization Request', [
      `Patient: ${d.patient.name || '[Patient Name]'}`,
      d.patient.dob && `Date of Birth: ${d.patient.dob}`,
      d.patient.insurancePlan && `Insurance Plan: ${d.patient.insurancePlan}`,
      d.patient.insuranceId && `Member ID: ${d.patient.insuranceId}`,
      d.patient.diagnosis && `Primary Diagnosis: ${d.patient.diagnosis}`,
    ])}
    <p class="body-para">Dear Prior Authorization Department,</p>
    <p class="body-para">We are requesting prior authorization for the following service or procedure for our patient, <strong>${d.patient.name || 'the above-named patient'}</strong>. Please review the clinical details below:</p>
    <table class="data-table">
      ${d.requestedService ? `<tr><td>Requested Service</td><td>${d.requestedService}</td></tr>` : ''}
      ${d.cptCode ? `<tr><td>CPT Code(s)</td><td>${d.cptCode}</td></tr>` : ''}
      ${d.patient.icdCodes ? `<tr><td>Diagnosis (ICD-10)</td><td>${d.patient.icdCodes}</td></tr>` : ''}
      ${d.facility ? `<tr><td>Facility / Provider</td><td>${d.facility}</td></tr>` : ''}
      ${d.requestedDate ? `<tr><td>Requested Service Date</td><td>${d.requestedDate}</td></tr>` : ''}
    </table>
    ${d.clinicalJustification ? `<div class="info-box"><h3>Clinical Justification</h3><p style="line-height:1.75;color:#333;">${d.clinicalJustification}</p></div>` : ''}
    ${d.supportingDiagnosis ? `<div class="info-box"><h3>Supporting Diagnoses / Comorbidities</h3><p style="line-height:1.75;color:#333;">${d.supportingDiagnosis}</p></div>` : ''}
    ${d.additionalNotes ? `<p class="body-para"><strong>Additional Notes:</strong> ${d.additionalNotes}</p>` : ''}
    <p class="body-para">Please direct questions or requests for additional documentation to our office at <strong>561-735-7531</strong> or fax to <strong>561-742-8250</strong>. We appreciate your prompt attention to this request.</p>
    ${sig(d.signingProvider)}${ft()}`)
}

// ── 4. Follow-Up Instructions ─────────────────────────────────────────────────

export function generateFollowUp(d) {
  return wrap(`
    ${lh()}
    ${re('Follow-Up Instructions', [
      `Patient: ${d.patient.name || '[Patient Name]'}`,
      d.patient.dob && `Date of Birth: ${d.patient.dob}`,
      d.visitDate && `Visit Date: ${d.visitDate}`,
      d.patient.diagnosis && `Diagnosis: ${d.patient.diagnosis}`,
    ])}
    <p class="body-para">Dear ${d.patient.name ? d.patient.name.split(' ')[0] : 'Patient'},</p>
    <p class="body-para">Thank you for your visit${d.visitDate ? ` on <strong>${d.visitDate}</strong>` : ''}. Please review the following instructions carefully to support your continued recovery.</p>
    ${d.instructions?.length ? `<div class="info-box"><h3>Care Instructions</h3><ul>${d.instructions.map(i=>`<li>${i}</li>`).join('')}</ul></div>` : ''}
    <table class="data-table">
      ${d.followUpDate ? `<tr><td>Follow-Up Appointment</td><td><strong>${d.followUpDate}</strong></td></tr>` : ''}
      ${d.activityRestrictions ? `<tr><td>Activity Restrictions</td><td>${d.activityRestrictions}</td></tr>` : ''}
      ${d.medications ? `<tr><td>Medications / Dosing</td><td>${d.medications}</td></tr>` : ''}
      ${d.emergencyContact ? `<tr><td>Office Phone</td><td>${d.emergencyContact}</td></tr>` : ''}
    </table>
    ${d.warningSignals ? `<div class="info-box" style="border-color:#fca5a5;background:#fff5f5;"><h3 style="color:#b91c1c;">&#9888; Warning Signs — Seek Immediate Care If You Experience:</h3><p style="line-height:1.75;color:#333;">${d.warningSignals}</p></div>` : ''}
    ${d.additionalNotes ? `<p class="body-para"><strong>Additional Notes:</strong> ${d.additionalNotes}</p>` : ''}
    <p class="body-para">If you have any questions before your next visit, please call our office at <strong>561-735-7531</strong>. We look forward to seeing you at your follow-up appointment.</p>
    ${sig(d.signingProvider)}${ft()}`)
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
  return wrap(`
    ${lh()}
    ${re('Infusion Consent & Billing Disclosure', [
      `Patient: ${d.patient.name || '[Patient Name]'}`,
      d.patient.dob && `Date of Birth: ${d.patient.dob}`,
      d.patient.insurancePlan && `Insurance Plan: ${d.patient.insurancePlan}`,
      d.patient.insuranceId && `Member ID: ${d.patient.insuranceId}`,
      d.patient.diagnosis && `Diagnosis: ${d.patient.diagnosis}`,
      d.authorizationNumber && `Authorization #: ${d.authorizationNumber}`,
    ])}
    <p class="body-para">Dear ${d.patient.name ? d.patient.name.split(' ')[0] : 'Patient'},</p>
    <p class="body-para">This letter outlines the details of your upcoming infusion therapy and the associated billing information. Please review all sections carefully and sign where indicated.</p>
    <div class="info-box">
      <h3>Infusion Therapy Details</h3>
      <table style="width:100%;border-collapse:collapse;">
        ${d.medication ? `<tr><td style="padding:6px 0;font-weight:600;color:#374151;width:40%;font-size:10pt;text-transform:uppercase;letter-spacing:0.4px;">Medication</td><td style="padding:6px 0;">${d.medication}</td></tr>` : ''}
        ${d.dosage ? `<tr><td style="padding:6px 0;font-weight:600;color:#374151;width:40%;font-size:10pt;text-transform:uppercase;letter-spacing:0.4px;">Dosage</td><td style="padding:6px 0;">${d.dosage}</td></tr>` : ''}
        ${d.frequency ? `<tr><td style="padding:6px 0;font-weight:600;color:#374151;width:40%;font-size:10pt;text-transform:uppercase;letter-spacing:0.4px;">Frequency</td><td style="padding:6px 0;">${d.frequency}</td></tr>` : ''}
        ${d.infusionDuration ? `<tr><td style="padding:6px 0;font-weight:600;color:#374151;width:40%;font-size:10pt;text-transform:uppercase;letter-spacing:0.4px;">Session Duration</td><td style="padding:6px 0;">${d.infusionDuration}</td></tr>` : ''}
      </table>
    </div>
    <div class="info-box">
      <h3>Informed Consent</h3>
      <p style="margin-bottom:12px;line-height:1.7;color:#333;">By signing below, I acknowledge and agree to the following:</p>
      <ul>${consentList.map(c=>`<li>${c}</li>`).join('')}</ul>
    </div>
    ${(d.billingDisclosure || d.expectedCopay) ? `
    <div class="info-box" style="border-color:#bfdbfe;background:#eff6ff;">
      <h3 style="color:#1e40af;">Billing Disclosure</h3>
      ${d.billingDisclosure ? `<p style="line-height:1.75;color:#333;margin-bottom:10px;">${d.billingDisclosure}</p>` : ''}
      ${d.expectedCopay ? `<p style="line-height:1.75;color:#333;"><strong>Estimated Patient Responsibility:</strong> ${d.expectedCopay}</p>` : ''}
      <p style="margin-top:10px;font-size:10pt;color:#555;">Final billing amounts are subject to insurance adjudication and may differ from estimates. Questions? Call 561-735-7531.</p>
    </div>` : ''}
    ${d.additionalNotes ? `<p class="body-para"><strong>Additional Notes:</strong> ${d.additionalNotes}</p>` : ''}
    <div style="margin-top:40px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="width:50%;padding-right:24px;vertical-align:bottom;">
            <div style="border-bottom:1.5px solid #222;margin-bottom:6px;height:32px;"></div>
            <div style="font-size:10pt;color:#374151;">Patient Signature</div>
            <div style="font-size:9.5pt;color:#888;margin-top:4px;">Date: ___________________</div>
          </td>
          <td style="width:50%;padding-left:24px;vertical-align:bottom;">
            <div style="border-bottom:1.5px solid #222;margin-bottom:6px;height:32px;"></div>
            <div style="font-size:10pt;color:#374151;">Witness / Provider Signature</div>
            <div style="font-size:9.5pt;color:#888;margin-top:4px;">Date: ___________________</div>
          </td>
        </tr>
      </table>
    </div>
    ${sig(d.signingProvider)}${ft()}`)
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
