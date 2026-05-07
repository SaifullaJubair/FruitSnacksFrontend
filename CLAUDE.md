# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Feature Filemap

**Before working on any feature, read [CLAUDE.FILEMAP.md](CLAUDE.FILEMAP.md)** — it lists every file grouped by feature (cart, checkout, auth, product, orders, etc.) so you can read all relevant files at once without searching.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build (TypeScript errors are ignored via eslint config)
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture Overview

This is a **Next.js 14 App Router** e-commerce frontend using Redux Toolkit with RTK Query for state and API management.

### State Management

**Redux store** ([src/redux/store.js](src/redux/store.js)) wires together:
- `baseApi` — single RTK Query API instance; all feature endpoints inject into it (never create separate API instances)
- `cartSlice` — cart state
- `cartLocalstorageMiddleware` — intercepts cart actions and syncs to localStorage + DB with 500ms debounce

**Tag types** for cache invalidation are centralized in [src/redux/tag-types.js](src/redux/tag-types.js). Add new tags there.

### API Pattern

All API slices inject endpoints into `baseApi` ([src/redux/api/baseApi.js](src/redux/api/baseApi.js)):

```js
import { baseApi } from "../api/baseApi";
const myApi = baseApi.injectEndpoints({ endpoints: (build) => ({ ... }) });
```

Base URL comes from `NEXT_PUBLIC_API_URL`. All requests use `credentials: "include"` (cookie-based auth).

### Cart Dual-Storage Pattern

Cart state lives in both localStorage (guests) and the database (logged-in users). The flow:
1. User action → Redux action dispatched
2. `cartLocalstorageMiddleware` detects cart actions → writes to localStorage
3. After login: `syncCartAfterLogin()` ([src/utils/cartSync.js](src/utils/cartSync.js)) merges localStorage cart into DB

### Routing Structure

App Router groups in [src/app/](src/app/):
- `(auth)/` — sign-in, sign-up, OTP, password reset
- `(frontend)/` — main storefront (products, checkout, orders, campaigns)
- `(user-profile)/` — user dashboard

### Data Fetching

- **Server-side** (SEO/SSG): utility functions in [src/lib/](src/lib/) use `fetch` with Next.js `revalidate` options (60–3600s depending on data volatility)
- **Client-side**: RTK Query hooks for mutations and user-specific data

### Path Aliases

`@/*` maps to `src/*` (configured in [jsconfig.json](jsconfig.json)).

### Styling

Tailwind CSS with a custom 5-palette color system (primary, secondary, accent, neutral, complementary — 9 shades each) defined in [tailwind.config.js](tailwind.config.js). UI primitives are Shadcn components in [src/components/ui/](src/components/ui/).

### Analytics

Four analytics integrations loaded in the root layout via components in [src/components/analyticsScripts/](src/components/analyticsScripts/): Meta Pixel, TikTok Pixel, GTM, and Microsoft Clarity. IDs come from environment variables (`META_PIXEL_ID`, `GTM_ID`, `GA4_ID`, `CLARITY_ID`, `TIKTOK_PIXEL_ID`).

### Key Utilities

- [src/utils/helper.js](src/utils/helper.js) — price calculations, discount logic (flash sale, campaign, variation pricing)
- [src/utils/cartUtils.js](src/utils/cartUtils.js) — cart manipulation helpers
- [src/utils/font.js](src/utils/font.js) — custom font loading including Bangla support
- [src/lib/buildPageMeta.js](src/lib/buildPageMeta.js) — dynamic `generateMetadata()` helper for SEO

### Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_API_URL=       # Backend API base URL
NEXT_PUBLIC_SITE_URL=      # Site URL for SEO/canonical
META_PIXEL_ID=
GTM_ID=
GA4_ID=
CLARITY_ID=
TIKTOK_PIXEL_ID=
```

### Image Domains

Configured in [next.config.mjs](next.config.mjs): DigitalOcean Spaces, Contabo, Cloudinary, Unsplash.
