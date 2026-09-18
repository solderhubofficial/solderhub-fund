-- Run this against the SAME Supabase project as solderhub.com /
-- simulator.solderhub.com (the "unified login" project) — not the old
-- standalone "solderhub-fund" project.
--
-- If the fund tables (members, monthly_contributions, loan_transactions,
-- fd_deposits, fund_settings, activity_log, and the v_* views) don't exist
-- in that project yet, run schema.sql there first, but SKIP its "public
-- read *" policies section — this migration replaces those with role-
-- gated ones. You'll also need to copy the actual row data over from the
-- old "solderhub-fund" project (pg_dump/restore or the Supabase table
-- editor's export/import) since this migration only sets up structure.

-- 1. Unified role lives on the shared `profiles` table (id = auth.users.id).
-- Adjust this block if `profiles` already exists with a different shape —
-- the important part is a `role` text column reachable as profiles.role.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text,
  created_at timestamptz not null default now()
);

alter table profiles add column if not exists role text;

do $$ begin
  alter table profiles
    add constraint profiles_role_check
    check (role is null or role in ('fund_user', 'fund_manager', 'admin'));
exception
  when duplicate_object then null;
end $$;

alter table profiles enable row level security;

do $$ begin
  create policy "users read own profile" on profiles for select using (auth.uid() = id);
exception
  when duplicate_object then null;
end $$;

-- 2. Replace the local is_fund_admin() with unified-role checks.
create or replace function is_fund_member() returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role in ('fund_user', 'fund_manager')
  );
$$;

create or replace function is_fund_admin() returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'fund_manager'
  );
$$;

-- 3. Reads are no longer public — require a provisioned fund role.
drop policy if exists "public read members" on members;
drop policy if exists "public read monthly_contributions" on monthly_contributions;
drop policy if exists "public read loan_transactions" on loan_transactions;
drop policy if exists "public read fd_deposits" on fd_deposits;
drop policy if exists "public read fund_settings" on fund_settings;
drop policy if exists "public read activity_log" on activity_log;

create policy "fund member read members" on members for select using (is_fund_member());
create policy "fund member read monthly_contributions" on monthly_contributions for select using (is_fund_member());
create policy "fund member read loan_transactions" on loan_transactions for select using (is_fund_member());
create policy "fund member read fd_deposits" on fd_deposits for select using (is_fund_member());
create policy "fund member read fund_settings" on fund_settings for select using (is_fund_member());
create policy "fund member read activity_log" on activity_log for select using (is_fund_member());

-- Write policies (admin insert/update ...) already call is_fund_admin(),
-- which now checks the unified role instead of members.is_admin — no
-- change needed there, they pick up the new function body automatically.

-- 4. `members.is_admin` is now informational only (e.g. still shown
-- somewhere in the UI) — it no longer controls access. To give someone
-- fund access, set their role on the shared profiles table instead:
--
-- update profiles set role = 'fund_manager' where id = (select id from auth.users where email = 'you@example.com');
-- update profiles set role = 'fund_user'    where id = (select id from auth.users where email = 'someone-else@example.com');
--
-- A site-wide Solderhub `admin` role also gets fund_manager-level access
-- automatically (see lib/auth/roles.ts) — no separate grant needed for
-- accounts that already have role = 'admin'.
