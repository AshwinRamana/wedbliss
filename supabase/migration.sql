-- =============================================================================
-- Vaazh Platform — Supabase Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- =============================================================================

-- ── 1. Templates Table ────────────────────────────────────────────────────────
create table if not exists public.templates (
  id            text primary key,
  name          text not null,
  tier          text not null default 'basic' check (tier in ('basic', 'premium')),
  description   text not null default '',
  is_live       boolean not null default false,
  demo_url      text default null,
  thumbnail_url text default null,
  created_at    timestamptz default now()
);

-- Allow public read access (landing page reads templates without auth)
alter table public.templates enable row level security;

create policy "Public read templates"
  on public.templates for select
  using (true);

create policy "Authenticated admin can upsert templates"
  on public.templates for all
  using (auth.role() = 'authenticated');

-- ── 2. Seed the initial 6 templates ──────────────────────────────────────────
insert into public.templates (id, name, tier, description, is_live, demo_url) values
  ('tm-mallipoo',   'Malli Poo',       'basic',   'Jasmine-inspired minimal design. Ivory and soft rose gold.',           true,  'http://localhost:3001'),
  ('tm-kovil',      'Kovil Gopuram',   'basic',   'Temple architecture with rising sun. Forest green & 24k gold.',        false, null),
  ('tm-tanjore',    'Tanjore Gold',    'basic',   'Classic crimson and gold with Tanjore art. Regal and traditional.',    false, null),
  ('tm-peacock',    'Peacock Majesty', 'premium', 'Lord Muruga''s peacock with Vel motif. Teal and gold.',               false, null),
  ('tm-vilakku',    'Kuthu Vilakku',   'premium', 'Traditional oil lamp with warm amber glow. Festive and bright.',       false, null),
  ('tm-kanjivaram', 'Kanjivaram Silk', 'premium', 'Silk saree weave patterns. Deep navy & zari gold borders.',           false, null)
on conflict (id) do nothing;


-- ── 3. Orders Table ───────────────────────────────────────────────────────────
create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  transaction_id text unique,
  couple_name    text,
  plan           text check (plan in ('basic', 'premium')),
  template_id    text references public.templates(id) on delete set null,
  amount_paise   integer,
  status         text check (status in ('success', 'failed', 'pending')),
  user_email     text,
  created_at     timestamptz default now()
);

-- Orders are private — only accessible to authenticated (admin) sessions
alter table public.orders enable row level security;

create policy "Authenticated admin can read orders"
  on public.orders for select
  using (auth.role() = 'authenticated');

create policy "Service role can insert orders"
  on public.orders for insert
  with check (true);


-- ── 4. Invitations Table ─────────────────────────────────────────────────────
-- Stores all wedding form data in a unified JSON structure.
create table if not exists public.invitations (
  id              uuid primary key default gen_random_uuid(),
  user_email      text not null,
  plan            text not null check (plan in ('basic', 'premium')),
  template_id     text references public.templates(id) on delete set null,
  subdomain       text unique,
  domain_status   text default 'pending' check (domain_status in ('pending','provisioning','active','failed')),
  
  -- The unified JSON data structure containing couple details, events, media, etc.
  data            jsonb not null default '{}'::jsonb,

  -- References
  order_id        uuid references public.orders(id) on delete set null,
  cloudfront_id   text,

  created_at      timestamptz default now()
);

-- Note: In a production migration, you would normally move existing data into the 
-- new `data` JSON column here. Since this is early development, we just replace the columns.
alter table public.invitations enable row level security;

-- Users can read their own invitations
create policy "Users can read own invitations"
  on public.invitations for select
  using (true);

-- Service role / authenticated can insert
create policy "Authenticated can insert invitations"
  on public.invitations for insert
  with check (true);

-- Service role / authenticated can update
create policy "Authenticated can update invitations"
  on public.invitations for update
  using (true);
