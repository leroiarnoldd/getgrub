# Deploying Get Grub

Two web apps to host:
- **Diner app** (`apps/mobile`, exported for web) — what customers use.
- **Restaurant dashboard** (`apps/dashboard`) — what venues use.

Both are static sites. The database (Supabase) is already live in the cloud, so
once these are hosted, anyone can use Get Grub from a URL — no laptop running.

You end up with **two URLs**: one for diners, one for restaurants (where venues
sign up via the dashboard's "Create an account" → "Set up your restaurant").

---

## Cloudflare Pages (recommended — you already use Cloudflare)

### Option A — Drag-and-drop (≈5 min)
Build both apps locally (ensure `apps/mobile/.env` and `apps/dashboard/.env`
have your Supabase keys first — the dashboard uses the `VITE_` prefix):
```
cd apps/mobile && npx expo export --platform web      # -> apps/mobile/dist
cd ../dashboard && npm run build                        # -> apps/dashboard/dist
```
Then at **dash.cloudflare.com → Workers & Pages → Create → Pages → Upload assets**:
1. Project `getgrub` → drag **`apps/mobile/dist`** → Deploy → diner app URL
2. Project `getgrub-partners` → drag **`apps/dashboard/dist`** → dashboard URL

### Option B — Connect to Git (auto-rebuild on push)
Cloudflare Pages → **Create → Connect to Git →** `leroiarnoldd/getgrub`, once per app:

**Diner app**
- Root directory: `apps/mobile`
- Build command: `npx expo export --platform web`
- Build output directory: `apps/mobile/dist`
- Env vars: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`

**Dashboard**
- Root directory: `apps/dashboard`
- Build command: `npm run build`
- Build output directory: `apps/dashboard/dist`
- Env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

The `_redirects` files in each app make client-side routing / deep links work on
Cloudflare Pages automatically.

---

## Alternative: Netlify drag-and-drop (≈5 minutes, no account wiring)

You build the site on your PC, then drag the output folder onto Netlify.
Because the build bakes in your Supabase keys, no server config is needed.

### 1. Diner app
```
cd apps/mobile
npx expo export --platform web
```
This creates a **`dist`** folder. Then:
1. Go to https://app.netlify.com/drop
2. Drag the `apps/mobile/dist` folder onto the page
3. Netlify gives you a URL like `https://random-name.netlify.app` — that's your live app

### 2. Restaurant dashboard
```
cd apps/dashboard
npm run build
```
This creates a **`dist`** folder. Drag `apps/dashboard/dist` onto
https://app.netlify.com/drop for a second URL.

> Make sure `apps/mobile/.env` has your real Supabase URL + anon key **before**
> building — the values get baked into the build.

To update later: rebuild and drag the new `dist` again (or use auto-deploy below).

---

## Better long-term: auto-deploy from GitHub (rebuilds on every push)

Do this once per app on Netlify (or Vercel/Cloudflare Pages — same idea):

1. **New site → Import from Git →** pick `leroiarnoldd/getgrub`
2. Configure:

   **Diner app**
   - Base directory: `apps/mobile`
   - Build command: `npx expo export --platform web`
   - Publish directory: `apps/mobile/dist`

   **Dashboard**
   - Base directory: `apps/dashboard`
   - Build command: `npm run build`
   - Publish directory: `apps/dashboard/dist`

3. Add environment variables (Site settings → Environment):
   - `EXPO_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
   - (Dashboard uses `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — check
     `apps/dashboard/src/lib/supabase.ts` for the exact names and add those too.)

4. Deploy. Every `git push` to the branch now rebuilds automatically.

`_redirects` files are already included so client-side routing works on Netlify.

---

## Custom domain (optional)
In Netlify → Domain settings → add your domain (e.g. `getgrub.app` for diners,
`partners.getgrub.app` for the dashboard) and follow the DNS steps.
