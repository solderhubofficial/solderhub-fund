# Solderhub Fund

Group savings + loan tracker for the 11-person Solderhub circle. Next.js 14
(App Router) + Supabase. The Supabase project (`solderhub-fund`,
`tfizssjmyiuqcpyxlvox`) is already created, migrated, and seeded with the
real fund data — this repo is the app that reads/writes it.

## 1. Push this code to GitHub

From this folder:

```bash
git init
git add .
git commit -m "Solderhub Fund — initial app"
git branch -M main
git remote add origin https://github.com/<your-username>/solderhub-fund.git
git push -u origin main
```

(Create the empty `solderhub-fund` repo on GitHub first — github.com → New
repository → don't initialize with a README, so the push above doesn't
conflict.)

## 2. Import into Vercel

1. vercel.com → **Add New → Project** → import `solderhub-fund` from GitHub.
2. Framework preset: Next.js (auto-detected). Leave build settings default.
3. **Environment Variables** — add these two (Production, Preview, and
   Development):
   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://tfizssjmyiuqcpyxlvox.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase → Settings → API → anon/public key (also in `.env.example` in this repo, but rotate it once if this repo will ever be public) |
4. Click **Deploy**.

## 3. Point fund.solderhub.com at it

In the Vercel project → **Settings → Domains**, add `fund.solderhub.com`
(or whatever subdomain you want). Vercel will show you a DNS record —
typically a `CNAME` for `fund` → `cname.vercel-dns.com`. Add that in
whatever service hosts solderhub.com's DNS. It's usually live within a
few minutes, sometimes up to an hour.

## 4. Make yourself (or whoever runs the fund) an admin

Reads are public; writes require a signed-in admin. To grant admin:

1. Visit the deployed site → you'll land on `/login` → enter your email →
   check your inbox for the sign-in link → click it.
2. Then run this in the Supabase SQL editor (swap in your email):

```sql
update members
set user_id = (select id from auth.users where email = 'you@example.com'),
    is_admin = true
where short_name = 'SHANTANU';
```

Do this once per admin. Everyone else can sign in too (reads work for
anyone with the link), but only rows with `is_admin = true` can add
entries.

## What's already live vs. what this repo adds

The Supabase project already has all 11 members, every monthly
contribution, every loan transaction, and the FD — migrated from the
original spreadsheet (contribution/interest/loan totals all reconcile
exactly to the sheet's own numbers; see the two SQL migrations run
directly against the project for the fixes made along the way). This repo
is the presentation + write layer on top of that: the dashboard, per-member
pages, and the admin-gated entry form. `supabase/schema.sql` is a snapshot
of what's already applied, for reference — you don't need to run it.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in the anon key
npm run dev
```

## Known gaps / next steps

- **Settings page is read-only.** Editing `fund_settings` (contribution
  amount, interest rate, max credit) is done via the Supabase table editor
  for now — an admin form is a natural next step.
- **No member self-signup flow.** Admin adds members via `/api/fund/members`
  or the Supabase table editor; there's no invite UI yet.
- **Activity log starts empty.** It only fills in going forward, from
  entries logged through the app — historical activity wasn't backfilled
  from the migration.
