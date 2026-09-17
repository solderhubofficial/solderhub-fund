# Fund UI — design plan

**Subject**: a community lending circle (chit fund) run by one person for ~11
members — closer to a small cooperative bank ledger than a SaaS dashboard.
**Audience**: the admin (you) logging entries; members checking their own
account. **Job**: see the fund's health at a glance, then log or review
entries fast, on a phone.

## Color
- `#101828` ink — hero surface, headings
- `#F6F4EF` paper — page background
- `#C98A2B` gold — accent, primary actions, active states (nods to the
  fund's own name and to gold as the traditional store of value it's
  informally competing with)
- `#1F7A5C` green — money moving into the fund (repayment, contribution,
  interest)
- `#B4552E` clay — money moving out (a loan disbursed)
- `#E4E0D6` line — hairline dividers

## Type
- **Fraunces** (serif, display) for the balance figures and page titles —
  gives the numbers some warmth instead of reading like a generic fintech
  template.
- **IBM Plex Sans** (body/data) for labels, statement rows, and form
  fields — has clean tabular figures for aligned amounts.

## Layout
- Dashboard: one dark hero card (`ink`) with the fund balance as the
  largest thing on the page, three inline stats below it separated by
  hairlines (not boxed into their own cards — avoids the identical-card
  look). Below that, a flat list of members as statement-style rows, not
  cards: avatar initial, name, one line of context, chevron.
- Member page: name + their position up top, a pill-style segmented
  control to pick entry type instead of a dropdown, a large amount field,
  then their history as bank-statement rows (date · description ·
  signed, colored amount).

## Principle
One bold move — the dark hero balance card — everything else stays flat,
quiet, and line-divided so the numbers do the work.
