-- Snapshot of the schema already applied to the live "solderhub-fund"
-- Supabase project. This file is for reference/reproducibility (e.g.
-- spinning up a staging project) — it does NOT need to be run against
-- the project this app is already pointed at.

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  short_name text not null unique,
  full_name text,
  joined_on date not null default current_date,
  color text default '#2563eb',
  is_admin boolean not null default false,
  user_id uuid unique references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists monthly_contributions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id),
  month date not null,
  contribution numeric not null default 600,
  interest_share numeric not null default 0,
  paid boolean not null default true,
  note text,
  created_at timestamptz not null default now(),
  unique (member_id, month)
);

create table if not exists loan_transactions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id),
  txn_date date not null,
  txn_type text not null check (txn_type in ('disbursement', 'repayment', 'interest')),
  amount numeric not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists fd_deposits (
  id uuid primary key default gen_random_uuid(),
  amount numeric not null,
  opened_on date not null,
  matures_on date,
  status text not null default 'active' check (status in ('active', 'closed')),
  note text,
  created_at timestamptz not null default now()
);

create table if not exists fund_settings (
  key text primary key,
  value numeric not null,
  label text
);

create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id),
  activity_type text not null check (
    activity_type in ('contribution','loan_disbursed','loan_repaid','interest_posted','member_added','fd_created')
  ),
  amount numeric,
  description text not null,
  occurred_at timestamptz not null default now()
);

-- Aggregation views (the app queries these directly rather than summing
-- in JS — keeps the arithmetic in one place).
create or replace view v_member_summary
with (security_invoker = true) as
select
  m.id, m.short_name, m.full_name, m.joined_on, m.color,
  coalesce(c.total_contribution, 0) as total_contribution,
  coalesce(c.total_interest_share, 0) as total_interest_share,
  coalesce(l.total_disbursed, 0) as total_loan_disbursed,
  coalesce(l.total_repaid, 0) as total_loan_repaid,
  coalesce(l.total_disbursed, 0) - coalesce(l.total_repaid, 0) as outstanding_loan,
  coalesce(c.total_contribution, 0) + coalesce(c.total_interest_share, 0) as balance
from members m
left join (
  select member_id, sum(contribution) as total_contribution, sum(interest_share) as total_interest_share
  from monthly_contributions group by member_id
) c on c.member_id = m.id
left join (
  select member_id,
    sum(amount) filter (where txn_type = 'disbursement') as total_disbursed,
    sum(amount) filter (where txn_type = 'repayment') as total_repaid
  from loan_transactions group by member_id
) l on l.member_id = m.id;

create or replace view v_monthly_trend
with (security_invoker = true) as
select month, sum(contribution) as contribution, sum(interest_share) as interest
from monthly_contributions
group by month
order by month;

create or replace view v_fund_summary
with (security_invoker = true) as
with base as (
  select
    (select coalesce(sum(total_contribution), 0) from v_member_summary)
      + (select value from fund_settings where key = 'opening_contribution') as total_contribution,
    (select coalesce(sum(outstanding_loan), 0) from v_member_summary) as total_loan_taken,
    (select coalesce(sum(total_interest_share), 0) from v_member_summary)
      + (select value from fund_settings where key = 'opening_interest') as total_interest,
    (select coalesce(sum(amount), 0) from fd_deposits where status = 'active') as fd_balance,
    (select value from fund_settings where key = 'save_others') as save_others,
    (select value from fund_settings where key = 'max_credit_per_member') as max_credit_per_member
)
select
  total_contribution, total_loan_taken, total_interest, fd_balance, save_others, max_credit_per_member,
  total_contribution + total_interest as fund_gross_value,
  total_contribution + total_interest - total_loan_taken - fd_balance - save_others as fund_balance
from base;

-- RLS: reads are public (private fund, trusted circle); writes require an
-- admin member linked via members.user_id.
alter table members enable row level security;
alter table monthly_contributions enable row level security;
alter table loan_transactions enable row level security;
alter table fd_deposits enable row level security;
alter table fund_settings enable row level security;
alter table activity_log enable row level security;

create policy "public read members" on members for select using (true);
create policy "public read monthly_contributions" on monthly_contributions for select using (true);
create policy "public read loan_transactions" on loan_transactions for select using (true);
create policy "public read fd_deposits" on fd_deposits for select using (true);
create policy "public read fund_settings" on fund_settings for select using (true);
create policy "public read activity_log" on activity_log for select using (true);

create or replace function is_fund_admin() returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (select 1 from members where user_id = auth.uid() and is_admin = true);
$$;

create policy "admin insert monthly_contributions" on monthly_contributions for insert with check (is_fund_admin());
create policy "admin update monthly_contributions" on monthly_contributions for update using (is_fund_admin());
create policy "admin insert loan_transactions" on loan_transactions for insert with check (is_fund_admin());
create policy "admin update loan_transactions" on loan_transactions for update using (is_fund_admin());
create policy "admin insert members" on members for insert with check (is_fund_admin());
create policy "admin update members" on members for update using (is_fund_admin());
create policy "admin insert fd_deposits" on fd_deposits for insert with check (is_fund_admin());
create policy "admin update fd_deposits" on fd_deposits for update using (is_fund_admin());
create policy "admin insert activity_log" on activity_log for insert with check (is_fund_admin());
create policy "admin update fund_settings" on fund_settings for update using (is_fund_admin());
