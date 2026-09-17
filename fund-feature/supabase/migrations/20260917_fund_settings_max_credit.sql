-- Adds the per-member maximum credit limit, taken from the "maximun Credit"
-- figure on the HOME sheet (₹50,000 at time of writing).
alter table fund_settings add column if not exists max_credit_per_member numeric(12,2) not null default 0;
