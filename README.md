# IDC Medical Correspondence Platform

## Supabase project: `idc-correspondence-prod`

## Stack
- React + Vite (frontend)
- Cloudflare Pages (hosting + Anthropic API proxy)
- Supabase — dedicated correspondence project
- Anthropic Claude API (PDF data extraction)

---

## Schema overview (8 tables)

| Table | Purpose |
|---|---|
| `providers` | IDC providers — seeded automatically, never re-enter |
| `patients` | Shared patient registry across all letter types |
| `templates` | Reusable letter templates saved by staff |
| `letters` | One row per generated letter |
| `letter_data` | All type-specific fields as key-value pairs |
| `letter_versions` | Auto-snapshot on every HTML update — full revision history |
| `approvals` | Provider sign-off workflow |
| `audit_events` | Immutable HIPAA audit log — every action recorded |

## Adding a new letter type — no DB changes ever needed
1. Add to `LETTER_TYPES` in `src/letterTypes.js`
2. Add `emptyForm` case
3. Add extraction prompt to `EXTRACT_PROMPTS`
4. Add form fields to `LetterForm` in `App.jsx`
5. Add HTML template to `src/letterTemplate.js`
6. Done. The `letter_data` key-value table handles all new fields automatically.

---

## Deployment

### 1. Supabase
1. Create project named `idc-correspondence-prod`
2. SQL Editor → run `supabase/migrations/001_idc_correspondence_schema.sql`
3. Settings → API → copy Project URL and anon key
4. Providers are seeded automatically by the migration

### 2. Local
```bash
cp .env.example .env   # fill in Supabase URL + anon key
npm install
npm run dev
```

### 3. GitHub → Cloudflare Pages
1. Push to GitHub repo
2. Cloudflare Pages → connect repo
3. Build: `npm run build` / output: `dist`
4. Environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `ANTHROPIC_API_KEY` (server-side only)
5. Deploy → add custom domain `rtw.idconsults.net`

### 4. Supabase Auth
Authentication → URL Configuration:
- Site URL: `https://rtw.idconsults.net`
- Redirect URL: `https://rtw.idconsults.net/**`

---

## Letter families
- **patient** — RTW, Follow-Up, Excuse Note, Clearance
- **clinical** — Medical Necessity, Prior Auth, Appeal
- **infusion** — Consent, Billing Disclosure
- **administrative** — Records Request, Insurance Correspondence

## Future modules (schema already supports)
- E-signature capture
- Fax/email delivery log
- Referral tracking
- Insurance workflow
- Full document archive with version rollback
