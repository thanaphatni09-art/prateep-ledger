# Design Brief

## Direction

**Ledger Ink** — a Thai credit-sales ledger rendered as a precision instrument: warm charcoal surfaces, jade primary, brass accents, and monospaced money columns that align like a real accounting book.

## Tone

Refined utilitarian — the calm authority of a well-kept ledger book, not the noise of a fintech dashboard. Restraint is the aesthetic; density is the feature.

## Differentiation

Every monetary value is set in tabular monospace so THB figures line up column-perfect across invoices, payments, and debt rows; status badges carry a ledger-margin tick bar instead of generic pills.

## Color Palette

| Token      | OKLCH (dark / light)     | Role                                          |
| ---------- | ------------------------ | --------------------------------------------- |
| background | 0.155 0.014 168 / 0.975 0.006 95 | Lamplit canvas / daylight paper       |
| foreground | 0.93 0.008 95 / 0.19 0.018 165   | Primary ink text                      |
| card       | 0.195 0.016 168 / 0.995 0.003 95 | Ledger sheet surfaces                 |
| primary    | 0.72 0.13 165 / 0.42 0.11 165    | Jade — actions, active nav, focus     |
| accent     | 0.78 0.13 78 / 0.62 0.13 78      | Brass — outstanding balances, alerts  |
| muted      | 0.235 0.018 168 / 0.94 0.008 95  | Table stripes, secondary surfaces     |
| success    | 0.72 0.14 158 / 0.5 0.13 158     | Approved proofs, paid invoices        |
| destructive| 0.62 0.19 25 / 0.52 0.2 27       | Rejected proofs, overdue debt         |
| warning    | 0.78 0.13 78 / 0.7 0.14 78       | Pending approval, aging buckets       |
| border     | 0.29 0.018 168 / 0.89 0.009 95   | Hairline rules                        |

## Typography

- Display: **Space Grotesk** — page titles, section headings, KPI numerals
- Body: **Satoshi** — UI labels, table cells, form copy, prose
- Mono: **JetBrains Mono** — all THB amounts, invoice numbers, SKUs, dates
- Scale: hero `text-3xl md:text-4xl font-bold tracking-tight`, section `text-lg font-semibold tracking-tight`, label `text-xs font-semibold tracking-widest uppercase`, body `text-sm`, table `text-sm`, figure `text-sm ledger-figure`

## Elevation & Depth

Two-tier surfaces: flat `bg-card` sheets with hairline `border-border` rules for tables and lists, and `shadow-elevated` only for popovers, dialogs, and the invoice document sheet — depth signals "this floats above the ledger", never decoration.

## Structural Zones

| Zone          | Background              | Border        | Notes                                                       |
| ------------- | ----------------------- | ------------- | ----------------------------------------------------------- |
| App header    | `bg-card`               | `border-b`    | Shop name + role badge left, notifications + account right  |
| Sidebar nav   | `bg-sidebar`            | `border-r`    | Active item: jade left rule + `bg-sidebar-accent`           |
| Content       | `bg-background`         | —             | Sections alternate `bg-muted/30` for banding                |
| Data tables   | `bg-card`               | `border`      | Zebra `bg-muted/40`, sticky header, right-aligned figures   |
| Document sheet| `bg-card` + `shadow-paper` | `border`   | Thai invoice/receipt/debt notice, A4 proportions            |
| Footer        | `bg-muted/40`           | `border-t`    | Shop tax ID, contact, print/export actions                  |

## Spacing & Rhythm

Dense and regular: 4px base unit, `gap-4` card interiors, `gap-6` between page sections, `py-2.5` table rows, `px-4` cell padding — rhythm comes from consistent rules and alignment, not from generous whitespace.

## Component Patterns

- Buttons: `rounded-md`, jade `bg-primary` for primary, `variant="outline"` with hairline border for secondary, `variant="ghost"` for row actions; hover shifts to `bg-primary/90`, focus ring `ring-2 ring-ring ring-offset-2`
- Cards: `rounded-lg border border-border bg-card`, no shadow by default, `shadow-elevated` on hover only for clickable cards
- Badges: `rounded-md` with `.ledger-tick` left bar; status colors — draft `muted`, pending `warning`, approved/paid `success`, rejected/overdue `destructive`
- Tables: sticky `bg-muted/60` header with `text-xs uppercase tracking-wider`, hairline row rules, figures right-aligned in `.ledger-figure`
- Forms: `rounded-md` inputs, `bg-background`, jade focus ring, inline validation text in `text-destructive text-xs`

## Motion

- Entrance: `animate-fade-in` 250ms on page content and list rows, staggered 20ms for the first 8 rows
- Hover: `transition-smooth` on buttons, rows (`bg-muted/60`), and nav items; no scale or bounce
- Decorative: `animate-pulse-mark` on the unread-notification dot only; nothing else animates at rest

## Constraints

- Thai-language UI throughout; all currency formatted as THB with tabular mono figures
- Light and dark modes both fully tuned — customers read on phones in daylight, manager works at night
- Restraint over decoration: no gradients on content surfaces, no glow shadows, no bouncy motion
- Table density and alignment are non-negotiable; never trade legibility for visual flourish
- Documents must remain printable on white paper — the document sheet forces light tokens regardless of app theme

## Signature Detail

The **ledger margin tick** — a 3px colored bar on the leading edge of every status badge, echoing the handwritten margin marks of a paper accounting book, paired with column-aligned tabular THB figures.
