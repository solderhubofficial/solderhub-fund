-- Fund tracker schema
-- Replaces the "HAPPY FUTURE" spreadsheet: a HOME summary + one ledger per member.
--
-- Data model:
--   fund_members       one row per member (ALEKHA, AMULYA, ...)
--   fund_transactions   every ledger line: loan given, loan repaid, monthly
--                       contribution, interest credited
--   fund_settings       fund-wide manual figures that aren't derived from
--                       transactions in the source sheet (FD, general "save")
--
-- Everything else (fund gross value, total contribution, total loan
-- outstanding, fund balance) is computed from fund_transactions — see
-- lib/fund/queries.ts. This avoids storing totals that can drift out of
-- sync with the underlying entries, the same class of bug that produces
-- silently-wrong spreadsheets.

create extension if not exists "pgcrypto";

create table if not exists fund_members (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  joined_date date,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create type fund_transaction_type as enum (
  'loan',          -- loan disbursed to the member (increases what they owe)
  'repayment',     -- loan repaid by the member (decreases what they owe)
  'contribution',  -- regular monthly contribution into the fund
  'interest'       -- interest credited to the member for a given month
);

create table if not exists fund_transactions (
  id          uuid primary key default gen_random_uuid(),
  member_id   uuid not null references fund_members(id) on delete cascade,
  type        fund_transaction_type not null,
  amount      numeric(12,2) not null check (amount >= 0),
  txn_date    date not null,
  -- for 'contribution'/'interest' rows, the calendar month the entry is for
  -- (matches the "Month" column in the source sheet); null for loan/repayment
  period      date,
  note        text,
  created_by  uuid references auth.users(id),
  created_at  timestamptz not null default now()
);

create index if not exists fund_transactions_member_idx on fund_transactions(member_id);
create index if not exists fund_transactions_type_idx on fund_transactions(type);
create index if not exists fund_transactions_period_idx on fund_transactions(period);

-- Manually-tracked fund-level figures (mirrors "FD" and "save" on the HOME
-- sheet — these are not derived from any transaction in the original file,
-- so they stay as editable settings rather than a formula).
create table if not exists fund_settings (
  id          int primary key default 1,
  fd_amount   numeric(12,2) not null default 0,
  save_amount numeric(12,2) not null default 0,
  updated_at  timestamptz not null default now(),
  constraint fund_settings_singleton check (id = 1)
);
insert into fund_settings (id) values (1) on conflict (id) do nothing;

-- RLS: adjust the policies below to match your existing auth pattern.
-- These assume authenticated users can read, and only members of an
-- "admin" role (however your app expresses that) can write.
alter table fund_members enable row level security;
alter table fund_transactions enable row level security;
alter table fund_settings enable row level security;

create policy fund_members_read on fund_members
  for select using (auth.role() = 'authenticated');
create policy fund_transactions_read on fund_transactions
  for select using (auth.role() = 'authenticated');
create policy fund_settings_read on fund_settings
  for select using (auth.role() = 'authenticated');

-- TODO: replace this with your actual admin check (e.g. a claim on the JWT,
-- or a lookup against your existing admin/user table) before enabling writes.
create policy fund_members_write on fund_members
  for all using (auth.role() = 'service_role');
create policy fund_transactions_write on fund_transactions
  for all using (auth.role() = 'service_role');
create policy fund_settings_write on fund_settings
  for all using (auth.role() = 'service_role');
