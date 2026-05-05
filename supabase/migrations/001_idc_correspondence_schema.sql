-- ═══════════════════════════════════════════════════════════════════════════
-- IDC Medical Correspondence Platform
-- Supabase project: idc-correspondence-prod
-- Run this once in SQL Editor on a fresh project
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Enums ────────────────────────────────────────────────────────────────────

create type letter_family as enum (
  'patient',          -- RTW, Follow-Up, Excuse Note, Clearance
  'clinical',         -- Medical Necessity, Prior Auth, Appeal
  'infusion',         -- Consent, Billing Disclosure
  'administrative'    -- Records Request, Insurance Correspondence
);

create type letter_status as enum (
  'draft',
  'pending_approval',
  'approved',
  'final',
  'voided'
);

create type approval_action as enum (
  'submitted',
  'approved',
  'rejected',
  'revision_requested'
);

create type audit_action as enum (
  'created',
  'updated',
  'viewed',
  'downloaded',
  'approved',
  'voided',
  'template_saved',
  'template_used'
);

-- ── Table: providers ─────────────────────────────────────────────────────────
-- The 6 IDC providers. Seeded below, managed by admin.

create table if not exists public.providers (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz default now(),
  name         text not null,
  credentials  text,                        -- 'MD' | 'ARNP' etc.
  display_name text,                        -- 'Latha Srinath, MD'
  is_active    boolean default true,
  sort_order   int default 0
);

-- ── Table: patients ──────────────────────────────────────────────────────────
-- Shared patient registry. Avoids retyping on every letter.

create table if not exists public.patients (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),

  -- Identity
  first_name     text not null,
  last_name      text not null,
  full_name      text generated always as (first_name || ' ' || last_name) stored,
  date_of_birth  date,

  -- Insurance
  insurance_plan text,
  insurance_id   text,

  -- Employment (used for RTW letters)
  employer       text,
  job_title      text,

  -- Contact
  phone          text,
  email          text,

  -- Clinical
  primary_diagnosis text,

  is_active      boolean default true
);

create index if not exists patients_full_name_idx on public.patients (full_name);
create index if not exists patients_last_name_idx on public.patients (last_name);
create index if not exists patients_dob_idx       on public.patients (date_of_birth);

-- ── Table: templates ─────────────────────────────────────────────────────────
-- Reusable letter templates. Staff save a letter as a template
-- so they aren't rebuilding common letters from scratch each time.

create table if not exists public.templates (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  created_by   text,

  name         text not null,              -- e.g. 'Standard RTW - Modified Duty'
  description  text,
  letter_type  text not null,             -- 'rtw' | 'mednet' | 'priorauth' etc.
  family       letter_family not null,

  -- The template form data (JSON blob of default field values)
  -- Patient-specific fields are excluded; everything else is pre-filled
  template_data jsonb default '{}'::jsonb,

  is_active    boolean default true,
  use_count    int default 0              -- incremented each time template is used
);

create index if not exists templates_letter_type_idx on public.templates (letter_type);
create index if not exists templates_family_idx      on public.templates (family);

-- ── Table: letters ───────────────────────────────────────────────────────────
-- One row per generated letter. Core of the system.

create table if not exists public.letters (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  created_by      text,                         -- staff email

  -- Classification
  letter_type     text not null,
  family          letter_family not null,
  status          letter_status default 'draft',

  -- Links
  patient_id      uuid references public.patients(id) on delete set null,
  provider_id     uuid references public.providers(id) on delete set null,
  template_id     uuid references public.templates(id) on delete set null,

  -- Denormalized for fast display (avoids joins in history panel)
  patient_name    text,
  patient_dob     date,
  signing_provider text,

  -- Rendered output
  letter_html     text,

  -- Metadata
  is_template_source boolean default false,     -- true if this letter was saved as a template
  notes           text                          -- internal staff notes, not printed
);

create index if not exists letters_created_at_idx   on public.letters (created_at desc);
create index if not exists letters_letter_type_idx  on public.letters (letter_type);
create index if not exists letters_family_idx       on public.letters (family);
create index if not exists letters_patient_id_idx   on public.letters (patient_id);
create index if not exists letters_provider_id_idx  on public.letters (provider_id);
create index if not exists letters_status_idx       on public.letters (status);
create index if not exists letters_patient_name_idx on public.letters (patient_name);

-- ── Table: letter_data ───────────────────────────────────────────────────────
-- All letter-type-specific fields as key-value pairs.
-- Adding a new letter type = just write new keys. No schema changes ever.

create table if not exists public.letter_data (
  id          uuid primary key default gen_random_uuid(),
  letter_id   uuid not null references public.letters(id) on delete cascade,
  key         text not null,
  value       text,
  created_at  timestamptz default now()
);

create unique index if not exists letter_data_letter_key_idx
  on public.letter_data (letter_id, key);

create index if not exists letter_data_letter_id_idx
  on public.letter_data (letter_id);

-- ── Table: letter_versions ───────────────────────────────────────────────────
-- Snapshot of every saved version of a letter.
-- Enables full revision history and rollback.

create table if not exists public.letter_versions (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz default now(),
  letter_id    uuid not null references public.letters(id) on delete cascade,
  version_num  int not null,
  created_by   text,
  letter_html  text,                    -- full HTML snapshot
  form_data    jsonb,                   -- full form state snapshot
  change_note  text                     -- optional note about what changed
);

create index if not exists letter_versions_letter_id_idx
  on public.letter_versions (letter_id, version_num desc);

-- ── Table: approvals ─────────────────────────────────────────────────────────
-- Provider sign-off workflow. A letter can have one active approval record.

create table if not exists public.approvals (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz default now(),
  letter_id    uuid not null references public.letters(id) on delete cascade,
  provider_id  uuid references public.providers(id) on delete set null,
  action       approval_action not null,
  acted_by     text,                    -- email of person who took action
  notes        text                     -- rejection reason or revision request details
);

create index if not exists approvals_letter_id_idx on public.approvals (letter_id);

-- ── Table: audit_events ──────────────────────────────────────────────────────
-- Immutable log. Every action on every letter is recorded here.
-- Critical for HIPAA compliance.

create table if not exists public.audit_events (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz default now(),
  letter_id    uuid references public.letters(id) on delete set null,
  patient_id   uuid references public.patients(id) on delete set null,
  action       audit_action not null,
  performed_by text not null,           -- staff email
  metadata     jsonb default '{}'::jsonb -- extra context: IP, browser, old/new values
);

create index if not exists audit_events_letter_id_idx   on public.audit_events (letter_id);
create index if not exists audit_events_patient_id_idx  on public.audit_events (patient_id);
create index if not exists audit_events_performed_by_idx on public.audit_events (performed_by);
create index if not exists audit_events_created_at_idx  on public.audit_events (created_at desc);

-- audit_events is append-only — no update or delete allowed
create policy "audit_no_update" on public.audit_events
  for update to authenticated using (false);
create policy "audit_no_delete" on public.audit_events
  for delete to authenticated using (false);

-- ── Row Level Security ────────────────────────────────────────────────────────

alter table public.providers      enable row level security;
alter table public.patients       enable row level security;
alter table public.templates      enable row level security;
alter table public.letters        enable row level security;
alter table public.letter_data    enable row level security;
alter table public.letter_versions enable row level security;
alter table public.approvals      enable row level security;
alter table public.audit_events   enable row level security;

-- Authenticated staff can read/write everything (tighten per role later)
do $$ 
declare
  t text;
begin
  foreach t in array array[
    'providers','patients','templates','letters',
    'letter_data','letter_versions','approvals','audit_events'
  ] loop
    execute format('
      create policy "auth_select_%1$s" on public.%1$s
        for select to authenticated using (true);
      create policy "auth_insert_%1$s" on public.%1$s
        for insert to authenticated with check (true);
    ', t);
  end loop;
end $$;

-- Update allowed on most tables (not audit_events — handled above)
do $$
declare
  t text;
begin
  foreach t in array array[
    'providers','patients','templates','letters',
    'letter_data','letter_versions','approvals'
  ] loop
    execute format('
      create policy "auth_update_%1$s" on public.%1$s
        for update to authenticated using (true);
      create policy "auth_delete_%1$s" on public.%1$s
        for delete to authenticated using (true);
    ', t);
  end loop;
end $$;

-- ── Auto-update updated_at ───────────────────────────────────────────────────

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger patients_updated_at
  before update on public.patients
  for each row execute function public.handle_updated_at();

create trigger templates_updated_at
  before update on public.templates
  for each row execute function public.handle_updated_at();

create trigger letters_updated_at
  before update on public.letters
  for each row execute function public.handle_updated_at();

-- ── Auto-version trigger ─────────────────────────────────────────────────────
-- Every time a letter's HTML is updated, snapshot it into letter_versions.

create or replace function public.snapshot_letter_version()
returns trigger as $$
declare
  next_version int;
begin
  if old.letter_html is distinct from new.letter_html then
    select coalesce(max(version_num), 0) + 1
      into next_version
      from public.letter_versions
      where letter_id = new.id;

    insert into public.letter_versions (letter_id, version_num, created_by, letter_html)
    values (new.id, next_version, new.created_by, new.letter_html);
  end if;
  return new;
end;
$$ language plpgsql;

create trigger letters_version_snapshot
  after update on public.letters
  for each row execute function public.snapshot_letter_version();

-- ── Convenience view ─────────────────────────────────────────────────────────

create or replace view public.letters_full as
select
  l.*,
  p.full_name           as patient_full_name,
  p.date_of_birth       as patient_date_of_birth,
  p.insurance_plan,
  p.insurance_id,
  p.employer,
  p.job_title,
  pr.display_name       as provider_display_name,
  coalesce(
    jsonb_object_agg(d.key, d.value) filter (where d.key is not null),
    '{}'::jsonb
  )                     as data
from public.letters l
left join public.patients   p  on p.id  = l.patient_id
left join public.providers  pr on pr.id = l.provider_id
left join public.letter_data d on d.letter_id = l.id
group by l.id, p.id, pr.id;

-- ── Seed: IDC Providers ───────────────────────────────────────────────────────

insert into public.providers (name, credentials, display_name, sort_order) values
  ('Latha Srinath',   'MD',   'Latha Srinath, MD',   1),
  ('Sunket Ahkee',    'MD',   'Sunket Ahkee, MD',    2),
  ('Kitonga Kiminyo', 'MD',   'Kitonga Kiminyo, MD', 3),
  ('Minu Mathew',     'MD',   'Minu Mathew, MD',     4),
  ('Maria Elias',     'ARNP', 'Maria Elias, ARNP',   5),
  ('Sheeba Jacob',    'ARNP', 'Sheeba Jacob, ARNP',  6);
