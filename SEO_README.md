# SEO Setup Documentation

## Overview

এই project এ Next.js App Router এর `generateMetadata` API ব্যবহার করে SEO implement করা হয়েছে। সব static page এর meta একটা central config file থেকে আসে। Dynamic page (product, category) API থেকে data নিয়ে meta বানায়।

---

## File Structure

```
src/
├── app/
│   ├── layout.js                          # Root layout — global meta fallback
│   ├── sitemap.js                         # Auto-generated /sitemap.xml
│   ├── robots.js                          # Auto-generated /robots.txt
│   └── (frontend)/
│       ├── page.js                        # Home
│       ├── about-us/page.jsx
│       ├── all-products/page.jsx
│       ├── all-trending-products/page.jsx
│       ├── cancel-policy/page.jsx
│       ├── cart/page.jsx                  # noindex
│       ├── category/[...slug]/page.js     # Dynamic — API থেকে
│       ├── change-password/page.jsx       # noindex
│       ├── checkout/page.jsx              # noindex
│       ├── compare/page.jsx               # noindex
│       ├── latest-product/page.jsx
│       ├── new-arrival/page.jsx
│       ├── offer/page.jsx
│       ├── privacy-policy/page.jsx
│       ├── products/[slug]/page.js        # Dynamic — API + JSON-LD
│       ├── refund-policy/page.jsx
│       ├── return-policy/page.jsx
│       ├── shipping-information/page.jsx
│       ├── terms-condition/page.jsx
│       ├── top-product/page.jsx
│       ├── verify/page.jsx                # noindex
│       └── wishlist/page.jsx              # noindex
├── (auth)/
│   ├── forget-password/page.jsx           # noindex
│   ├── sign-in/page.jsx                   # noindex
│   └── sign-up/page.jsx                   # noindex
└── components/
    ├── lib/
    │   ├── getSeoConfig.js                # DB থেকে SEO config
    │   └── buildPageMeta.js               # Reusable meta builder
    └── utils/
        └── pageSeo.js                     # সব static page এর title/description
```

---

## কিভাবে কাজ করে

### 1. Admin Panel থেকে Control

Admin panel → Site Setting এ এই ৩টা field update করলে সব page এ reflect হয়:

| Field | কোথায় দেখায় |
|-------|-------------|
| `seo_title` | Browser tab, Google search title |
| `seo_description` | Google search description (fallback) |
| `seo_keywords` | Meta keywords tag |

Backend এ `setting` model এ এই fields আছে।

---

### 2. Static Pages

**Flow:**
```
pageSeo.js → buildPageMeta() → generateMetadata()
```

**pageSeo.js** (`src/components/utils/pageSeo.js`)  
সব static page এর title আর description এক জায়গায়। Resale করলে শুধু এই file এর values বদলালেই হবে।

```js
export const PAGE_SEO = {
  aboutUs: {
    title: "About Us",
    description: "...",
    path: "about-us",
  },
  // ...
};
```

**buildPageMeta.js** (`src/components/lib/buildPageMeta.js`)  
Page level এ call করলে পুরো meta object return করে — title, description, canonical, openGraph, twitter সব।

```js
// যেকোনো static page এ এটুকুই লিখতে হয়
export async function generateMetadata() {
  return buildPageMeta(PAGE_SEO.aboutUs);
}
```

---

### 3. Dynamic Pages

#### Product Page (`/products/[slug]`)
- API থেকে product data fetch করে
- `meta_description` field থাকলে সেটা use করে, না থাকলে auto-generate করে
- **JSON-LD Product Schema** আছে — Google এ price, rating rich result দেখায়
- Fallback image: product image না থাকলে site logo use করে

#### Category Page (`/category/[...slug]`)
- `getFilterHeadData` API থেকে category name আনে
- Subcategory থাকলে: `"Subcategory – Category"` format এ title
- Slug থেকেও readable name বানাতে পারে (fallback)

---

### 4. Root Layout

`layout.js` এ যা আছে এবং কেন:

| Property | কারণ |
|----------|------|
| `metadataBase` | Relative image URL গুলো full URL হয় |
| `title.template` | সব page এ `"Page Title \| Site Name"` format |
| `description` | generateMetadata নেই এমন page এর fallback |
| `keywords` | Admin থেকে set করা keywords |
| `openGraph` | Social share fallback |
| `twitter` | Twitter/X share fallback |
| `verification.google` | Search Console verify |
| `icons.apple` | iPhone home screen icon |
| `formatDetection` | Phone/email auto-link বন্ধ |
| `Organization JSON-LD` | Google কে business info জানায় |

---

### 5. Private Pages (noindex)

এই pages Google index করবে না:

```
/sign-in, /sign-up, /cart, /wishlist
/verify, /change-password, /forget-password
/checkout, /orders, /offer-orders, /user-profile
```

---

### 6. Sitemap (`/sitemap.xml`)

Auto-generate হয়। Contains:
- Static pages (about, policies) → fixed `LAUNCH_DATE`
- Home, all-products, trending, new-arrival → `new Date()` (daily update)
- All active products → `updatedAt` থেকে
- All categories → `updatedAt` থেকে

---

### 7. Robots (`/robots.txt`)

Private pages আর search params crawl হবে না:
```
Disallow: /user-profile/, /cart/, /checkout/ ...
Disallow: /*?search=*, /*?page=*, /*?sort=*
```

---

## নতুন Page যোগ করলে

**Static page হলে:**

1. `pageSeo.js` এ entry যোগ করো:
```js
newPage: {
  title: "Page Title",
  description: "Page description।",
  path: "new-page",
},
```

2. Page এ `generateMetadata` যোগ করো:
```js
import { buildPageMeta } from "@/components/lib/buildPageMeta";
import { PAGE_SEO } from "@/components/utils/pageSeo";

export async function generateMetadata() {
  return buildPageMeta(PAGE_SEO.newPage);
}
```

3. `sitemap.js` এ যোগ করো (public page হলে)

**Private page হলে:**

```js
newPrivatePage: {
  title: "Page Title",
  description: "",
  path: "new-private-page",
  noIndex: true,
},
```

---

## Deploy Checklist

- [ ] `verification.google` — Search Console থেকে code নিয়ে `layout.js` এ বসাও
- [ ] `/public/apple-touch-icon.png` — 180×180px PNG বানাও
- [ ] Admin panel → Site Setting → SEO Title, SEO Description, SEO Keywords fill করো
- [ ] `sitemap.js` এ `LAUNCH_DATE` সঠিক date দাও
- [ ] Google Search Console এ sitemap submit করো: `https://artisenleather.com/sitemap.xml`