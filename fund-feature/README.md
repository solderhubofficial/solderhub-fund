# Fund tracker — Happy Future

Replaces the `1_hf_16_9_2026.xlsx` spreadsheet with a page on solderhub.com:
a dashboard of fund-wide totals plus a per-member ledger where you log
loans, repayments, monthly contributions, and interest.

## What's in here

```
supabase/migrations/20260916_fund_schema.sql        # tables: fund_members, fund_transactions, fund_settings
supabase/migrations/20260917_fund_settings_max_credit.sql  # adds max_credit_per_member
supabase/seed/seed.sql                          # your existing spreadsheet data, converted (see below)
scripts/xlsx_to_seed_sql.py                     # the converter that produced seed.sql
lib/fund/types.ts                               # shared TypeScript types
lib/fund/queries.ts                             # data access + balance/summary computation
lib/auth/require-admin.ts                       # PLACEHOLDER — wire to your real auth
app/api/fund/transactions/route.ts              # POST: log a new entry
app/api/fund/members/route.ts                   # GET/POST: list/create members
app/fund/layout.tsx                             # sidebar + topbar shell for every /fund page
app/fund/page.tsx                               # dashboard: hero, stat cards, charts, tables, activity
app/fund/charts.tsx                             # recharts line + donut chart components (client)
app/fund/[slug]/page.tsx                        # one member's ledger + entry form
app/fund/[slug]/new-transaction-form.tsx         # client form component
```

**New dependency**: the dashboard charts use `recharts` — `npm install recharts` in your project. Everything else uses only what you already have (Next.js, Tailwind).

A quick visual preview of the full dashboard (sidebar, hero, charts, tables) is published separately so you can see it without wiring anything up first.

## Integration steps (this is code to drop in, not a live deploy)

1. **Auth**: `lib/auth/require-admin.ts` is a stub that throws on purpose.
   Replace it with your project's actual session/role check — the same one
   your other admin write-routes already use — before this goes live.
2. **Supabase client import**: `lib/fund/queries.ts` and
   `app/api/fund/members/route.ts` import `createClient` from
   `@/lib/supabase/server`. Point that at wherever your project's
   server-side Supabase client actually lives.
3. **Styling**: components use plain Tailwind utility classes with no
   assumptions about a design system. Swap in your own components/classes
   to match the rest of the site.
4. **Run the migration** (`supabase/migrations/20260916_fund_schema.sql`)
   against your database, then adjust the RLS policies — right now reads
   require `authenticated` and writes require `service_role`, which is a
   safe-but-blunt default. Replace the write policy with a real admin check.
5. **Load your existing data**: run `supabase/seed/seed.sql` once the
   migration is in place. It was generated from your uploaded spreadsheet —
   see caveats below before trusting it blindly.

## How the numbers are computed

Nothing is stored as a precomputed total — `getFundSummary()` derives
everything from the transaction log each time, so it can't drift out of
sync the way the spreadsheet's hand-entered totals could.

The fund-balance formula was reverse-engineered from the HOME sheet, where
it lines up exactly:

```
fundGrossValue = totalContribution + totalInterest        (= 598,400 + 116,209.3 = 714,609.3 ✓)
fundBalance    = fundGrossValue - totalLoanOutstanding - FD - save
               = 714,609.3 - 390,000 - 100,000 - 85,000 = 139,609.3 ✓
```

`FD` and `save` aren't derived from any transaction in your sheet — they're
fund-level figures you apparently set by hand — so they stayed as editable
values in `fund_settings` rather than a formula. Update them directly in
that table (or add a small settings form if you want it in the UI).

## What I deliberately did NOT reverse-engineer

Each member sheet has a monthly "Contribution / Interest / Total" table
where the interest figure varies month to month in a way that isn't a
simple formula from the visible columns (it looks like it reflects each
member's share of interest earned across the whole pool, calculated by
hand). Rather than guess that logic and risk silently wrong numbers, the
schema just stores whatever interest amount you log for a given member and
month as an `interest` transaction — same as the sheet did. You (or
whoever ran the fund) still decide the number; the app just stops it from
living only in a spreadsheet cell.

## A discrepancy worth resolving before you trust the contribution/interest totals

Each member sheet has **two separate figures that don't reconcile**:

- A summary cell (e.g. Alekha: contribution ₹54,400, interest ₹12,360) — the
  HOME sheet's fund-wide totals (₹5,98,400 contribution / ₹1,16,209 interest)
  are built from these.
- A monthly table below it (₹600/month × however many months). Summed across
  all 11 members, this comes to **₹2,30,400 contribution and ₹88,080
  interest** — nowhere near the summary figures.

`seed.sql` loads the monthly table (it's the only one with per-transaction
detail), but the dashboard's stat cards use the HOME sheet's summary totals
directly, since those are the numbers you'd recognize. That means **the sum
of a member's individual transactions in the app won't currently match the
"Total Contribution" stat card** — the app isn't wrong, the two source
figures just don't agree with each other. Worth figuring out which one
reflects reality (a lump-sum joining contribution on top of the monthly
₹600, most likely) before leaning on either number for real decisions.

The loan/repayment side doesn't have this problem — the ledger-derived
outstanding total (₹3,85,000) is very close to the HOME sheet's reported
₹3,90,000; the small gap traces to one row (Prabhat's) where the "returned"
column has a text note instead of a number, so worth a quick look but not a
structural issue.

## Caveats on the seed data (`seed.sql`)

**If you already ran an earlier version of `seed.sql`**: regenerate and
re-run it. The first version had a bug where the monthly contribution/
interest table was skipped entirely (an off-by-one on which row the data
actually starts), so it silently inserted zero `contribution`/`interest`
transactions. Fixed now — this version's totals were checked against the
sheet before being written up above.

The converter flags what it skipped with `-- SKIPPED` comments — check for
those before running it. Two things worth knowing:

- **One date typo in the source**: ALEKHA's row 25 has `31.11.24`, which
  isn't a real date (November has 30 days). It's skipped rather than
  guessed — decide what it should be and add it by hand.
- **Chronological hiccups**: e.g. `12.3.23` appears in ALEKHA's sheet
  between rows dated in 2024, and reads as literally 12 March 2023 — it
  may have meant 2024. The script parses whatever's written rather than
  correcting it, so it's worth a skim of `seed.sql` for anything that looks
  out of order before you trust it.
- Re-running `xlsx_to_seed_sql.py` is idempotent for members (`on conflict
  do nothing`) but **not** for transactions — running `seed.sql` twice will
  duplicate every entry. Run it once against a fresh database.
