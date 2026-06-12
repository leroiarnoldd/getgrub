# EatClub Teardown & GetGrub Competitive Playbook

Research date: June 2026. Sources: EatClub's own terms/FAQ/partner pages, funding press (SmartCompany, Startup Daily, The Caterer, Restaurant Online, PitchBook), Trustpilot/ProductReview/OzBargain review mining, competitor sites, UK hospitality trade press. Claims verified via an adversarial second pass; confidence flagged where evidence is thin.

---

## 1. How EatClub actually works (verified)

**Diner side (UK):**
- Restaurants post off-peak/last-minute deals, typically 10–50% off the total bill (drinks included). Diner claims a deal in-app, walks in within the time window, never mentions EatClub to staff.
- **UK is walk-in only — there is no booking.** Their own FAQ: "You cannot book a table via EatClub — every offer is a walk-in only opportunity."
- Payment via **EatClub Pay** (launched 2023): a virtual card in Apple/Google Wallet. Diner taps to pay the *full undiscounted bill*; the discount is settled afterwards ("Float Amount" mechanics in their restaurant T&Cs).
- **Consumer service fee: 1–6% of the bill (min £0.20), calculated on the PRE-discount amount** — confirmed in eatclub.co.uk terms. On a £120 bill at 40% off, users report paying ~£77 instead of £72, i.e. an effective ~36% discount sold as 40%. This is their single most-complained-about practice.
- **£6 late-cancel/no-show fee** on what is positioned as a walk-in product — widely resented (OzBargain users call it disproportionate).
- AU only: **EatClub Premium** ($7.99/mo, ~$5/mo annual) unlocks booking 7 days ahead + early deal access. Not available in the UK.

**Restaurant side:**
- Pitch: "world's first dynamic pricing hospitality platform" — fill empty tables in quiet windows, airline-style. Partner app (iOS id1163476050) lets venues post/pause deals instantly, choose discount size and number of covers; claimed AI offer recommendations; weekly reporting.
- AU pricing (from indexed partner pricing page): **Premium $99/mo** (marketplace + AI + account manager + bookings), **Bookings-only $149/mo**; plus per-transaction service fee in T&Cs. 2018-era model was monthly fee + ~$2/seated diner.
- UK: "venues pay a commission on bills generated, no upfront fees" (no published %; rate card behind sales demo).
- Free "commission-free" bookings widget product (positioned against OpenTable per-cover fees) — AU mainly.

**Company:**
- Founded Melbourne, Oct 2017. CEO Pan Koutlakis; Marco Pierre White is an *equity partner* (landed via a cold email) and fronts nearly all PR.
- Scale claims: 4,000+ AU venues across 8 cities, 2M+ downloads, "$300M/yr incremental partner revenue" (self-reported, unaudited).
- **UK:** London May 2025 (launched ~150 venues → 1,000+ in ~9 months), Manchester (Mar 2026), Bristol, Leeds (Apr 2026), Liverpool (70+ venues). 300k+ UK downloads claimed. Birmingham not live.
- Funding: A$18.2M Series A (May 2025, Co:Act), **A$27M (~£14M) Series B Feb 2026 led by Marbruck at ~A$200M valuation** — explicitly to fund UK expansion. Their growth is venture-subsidised (e.g. "Summer of EatClub" where they fund the gap to 50% off).
- Restaurant acquisition = in-house territory field-sales BDMs. Diner acquisition = celebrity PR + city-media listicles + subsidised headline discounts + ~$10 referral credits. ASO: they own "restaurant deals" in the App Store title slot.
- Retention: "EatClub Earn" loyalty (Dec 2025) — dining credit for retail purchases; claimed +70% dining frequency.

---

## 2. What EatClub is NOT doing — your openings

Ranked roughly by how exploitable each is.

1. **Fee transparency.** The 1–6% fee on the *pre-discount* bill is their #1 complaint across Trustpilot/OzBargain/Play reviews ("hidden fees", effective discount lower than advertised, fee not shown before claiming). **GetGrub: one flat, visible fee shown before you claim — "what you see is what you pay."**
2. **No bookings / live availability in the UK.** Walk-in only, yet they charge a £6 no-show fee. Nobody in the UK combines restaurant-controlled dynamic discounts with *real bookable inventory* ("fill 12 covers, 17:00–18:30 Tuesday, 30% off, auto-expiring"). That's the open structural position.
3. **Menu price integrity.** Recurring complaints that in-app menu prices are lower than venue prices, silently negating the discount. No verification process. GetGrub can enforce/sync menus (dashboard + photo audit + diner-reported mismatch refunds).
4. **Customer support.** Email-only, days-late, auto-closing tickets, no refund path when the payment card declines at the terminal (a recurring failure mode that forces diners to pay full price and chase refunds). In-app chat + instant auto-refund on verified redemption failure would be a step-change.
5. **No real loyalty/personalization.** No streaks, no venue-level loyalty, geolocated lists only. You already have an `ai-proxy` worker — AI-personalised deal feeds and "your usual Tuesday spot" nudges are cheap differentiation. (Escrowed value — credits/points — is also the proven retention mechanic; D30 retention for deals apps is single-digit without one.)
6. **Coverage.** Five UK cities, London-heavy. Secondary cities (Birmingham!, Glasgow, Edinburgh, Cardiff, Nottingham, Newcastle, student towns) are empty of EatClub and mostly empty of NeoTaste.
7. **Reputation hygiene & community.** Their reviews live on an unclaimed, mixed Trustpilot listing rated 2.6 "Poor"; near-zero organic Reddit/community presence. A brand that *responds* publicly and builds a foodie community wins earned trust cheaply.
8. **Restaurant-side data.** Weekly reports only. Independents under margin pressure want: cover-level ROI, repeat-visitor tracking, demand forecasting, and proof diners come back at full price. Nobody offers this.

---

## 3. Competitive landscape (UK, June 2026)

| Player | Model | Price | Health | Key gap |
|---|---|---|---|---|
| **EatClub** | Walk-in deals, fee on diners + commission on venues | 1–6% diner fee; venue commission unpublished | Funded blitz, 5 cities | No booking, fee opacity, support |
| **NeoTaste** | Subscription deals app (closest analogue) | £6.99/mo diner; free for restaurants | 6 UK cities, €21M raised | Templated 2-for-1 deals, no booking, paywall caps growth |
| **First Table** | £4–8 booking fee, 50% off first table of session | Free for restaurants | ~10 UK cities, slow & profitable-ish | One table per shift, blunt 50% only |
| **Tastecard / Gourmet Society** | Static discount card subscription | £79.99/yr | Mature/stagnant, sold to DragonPass Dec 2025 | No booking, no venue control, "doesn't honour it" friction |
| **Meerkat Meals** | Free insurance perk, 2-for-1 Sun–Thu | Free (via CtM) | Big distribution | Same static rails (Ello network) |
| **OpenTable** | SaaS + per-cover bookings | ~£299/mo + £1/cover | Dominant in bookings | Off-peak lever is a weak ~£6 points bribe |
| **ResDiary** | Flat-fee booking SaaS (Access Group) | £99–289/mo | Stable plumbing | Zero demand generation |
| **Too Good To Go** | Surplus bags, ~25% commission | ~£1 min fee/bag | Huge (13M UK users) | Doesn't fill dine-in seats |
| **Wriggle** | Off-peak deals (Bristol) | — | **Dead (2022)** | Pro-cyclical supply: venues quit when busy |

**Market tailwind:** employer NICs up (Apr 2025), 3,353 hospitality insolvencies in 2025, 3–5% net margins, ~2 net closures/day — and demand is shifting off-peak (Wednesday diners +10% YoY, early-bird normalising). Restaurants need yield management more than at any point since COVID; diners are already trading time for value.

**The unoccupied position:** restaurant-controlled, time-and-capacity-specific dynamic discounting **with booking-grade inventory**, free/cheap for diners, transparent fees, and real venue analytics. Wriggle proved the appetite and died of lockdowns; EatClub and NeoTaste each rebuilt half of it.

---

## 4. Getting customers — the playbook

**Doctrine (consistent across every comparable): supply first, one city, density before demand marketing.**
Observed launch bars: First Table started with 10 venues in Queenstown; EatClub London ~150; NeoTaste ~430/city. Target: **150–250 venues in one launch city** before spending on diners.

### Restaurant side
- **Zero-risk pitch:** free to list, no contract, no upfront fee, you control when deals fire and pause them when busy (this is the anti-Wriggle design — venues must keep using it when full). Lead with the macro pitch: "empty covers are pure lost contribution at 3–5% margins; set the discount, cap the covers, switch it off."
- **Field sales:** territory-based reps walking door to door is how everyone (EatClub, First Table) does it. 100+ venue signings/month is achievable in a major city with 2–3 reps.
- **Pick the launch city carefully:** dense, food-proud, underserved. Birmingham (no EatClub; NeoTaste present but thin), Glasgow/Edinburgh, or Cardiff are better first fights than London, where you'd face two funded incumbents. Win one city outright, then template it.
- **Chains later:** one chain deal (à la TGTG with Greggs) solves density in every city at once — but chains follow proof, so land independents first.

### Diner side (in order of cost-effectiveness)
1. **Local PR + city-media listicles** (The Manc / ON IN / I Love MCR equivalents) — every UK launch in this category was carried by these. Budget for placements.
2. **TikTok "hidden gems" food creators** — the dominant UK dining-discovery format (~31% of Brits pick restaurants from TikTok). Pay micro-creators per city; have them film actual redemptions.
3. **Student channels** — Save the Student, ambassador programs, halls posts (Dusk's playbook). Students are the natural early-adopter for off-peak discounts.
4. **Referral pegged to one free experience** (~£3–£10 credit, paid after first redemption — the in-market pattern; First Table gives £3, EatClub AU gives $10).
5. **Subsidised headline discounts** at launch (you fund the gap to 50% for the first month — EatClub's "Summer of" play) — expensive, use surgically for launch week buzz.
6. **ASO + SEO:** title = "GetGrub – Restaurant Deals" (the keyword EatClub proves works); indexable per-city/per-restaurant web pages (NeoTaste and First Table both do this; it compounds).
7. **A mission/identity frame** generates free WOM that pure discounting can't (TGTG's "waste warriors"). Candidate: "keep your local independents alive" — anti-closure framing fits the 2026 news cycle and gives press a story.

**Hard numbers to plan around:** food-app CAC is now $45–85 paid; D30 retention single-digit without a habit loop. Conclusion: don't buy demand at scale until (a) diner-side revenue exists from booking #1 or (b) an escrowed-value loyalty loop is live. Prompt for App Store reviews at the post-meal moment (after a successful redemption).

---

## 5. Monetization strategy for GetGrub

### Options and trade-offs

| Model | Who pays | Pros | Cons | Proof point |
|---|---|---|---|---|
| Flat consumer booking fee | Diner, £1–3/booking flat | Revenue-positive from first booking; transparent (kills EatClub's #1 complaint); zero restaurant friction | Adds friction per redemption; caps impulse use | First Table (profitable, capital-light, 10 yrs) |
| Consumer subscription | Diner, ~£5–7/mo | Predictable MRR; manufactures retention | Paywall throttles top-of-funnel; churn-fighting forever | NeoTaste, Tastecard |
| Restaurant commission/per-cover | Venue, ~£1–2/seated cover or % of bill | Aligned with value delivered; scales with volume | Hard to sell pre-traction; venues hate %; collection complexity | EatClub UK, TheFork (~€2.60/cover), OpenTable |
| Restaurant SaaS | Venue, £49–149/mo | Predictable; sticky if dashboard is good | Kills the zero-risk listing pitch at launch | EatClub AU ($99/mo), ResDiary |
| Payments take | Both (embedded) | Invisible; EatClub Pay-style | Requires payment rails + venue terminal flow; their model's complaint magnet if opaque | EatClub Pay, Dojo |

### Recommended: staged hybrid

**Phase 1 — Launch (months 0–9): free for restaurants, flat transparent diner fee.**
£1.50–£2 flat per redeemed booking, shown upfront before claiming, charged only on success. Free listing + no contract removes all restaurant sales friction; the flat fee makes every acquired diner revenue-positive immediately (First Table's proven economics) and is itself the marketing message against EatClub: *"No % fees. No fee on money you didn't spend. £1.50, shown before you book, only when you eat."*

**Phase 2 — Density (months 9–18): restaurant success fee.**
Once you demonstrably fill covers, add ~£1/seated cover above a free monthly allowance (or a low, capped % with the rate printed on the public site — being the only player with a published rate card is a sales weapon). Introduce the **premium dashboard tier (£49–99/mo)**: demand forecasting, repeat-diner analytics, menu sync, yield recommendations from your AI worker. SaaS revenue stabilises what is otherwise pro-cyclical.

**Phase 3 — Scale (18m+): consumer premium + escrowed loyalty.**
GetGrub+ (~£4.99/mo): fee waived, 24h early deal access, advance booking windows, partner perks. Loyalty credits earned per redemption (spendable only in-app) become your retention engine — the mechanic every survivor in this space converges on.

**Avoid:** consumer subscription as the *primary* gate at launch (NeoTaste's ceiling), opaque %-of-bill fees (EatClub's reputation wound), Groupon-style deep-voucher economics, and restaurant-side fees before you've proven covers (cold-start killer).

---

## 6. Priority actions

1. **Product:** build bookable deal inventory (covers × time-window × discount, auto-expiring) — the structural gap nobody fills. You already have the deal page and explore map; add slot claiming with capacity counts.
2. **Pricing:** implement the flat, pre-disclosed redemption fee; publish the restaurant rate card publicly from day one.
3. **Trust:** menu-price sync in the dashboard + automatic refund if a diner reports a price mismatch; in-app support chat with instant resolution on redemption failures.
4. **City:** pick one underserved launch city; hire/contract 2 field reps; target 150+ venues before any diner marketing.
5. **Growth stack:** city-media listicles + TikTok micro-creators + student ambassadors + £3-credit referral; ASO title "GetGrub – Restaurant Deals"; per-city SEO pages.
6. **Retention:** loyalty credits from redemption #1; review prompt post-meal.
7. **Watch:** NeoTaste's UK expansion (your most dangerous rival in secondary cities) and EatClub's next city announcements — both publish launches in local press.

### Confidence notes
- EatClub's UK commission % and unit economics are **not public** — all "incremental revenue" and uplift claims are company-supplied PR.
- AU figures (Premium $7.99/mo, $99/mo partner SaaS) come from indexed page snippets + independent reviews; direct page fetches were blocked.
- The 2.6 Trustpilot rating sits on a mixed listing (some reviews belong to unrelated same-named companies), though recent reviews are mostly the AU/UK app.
