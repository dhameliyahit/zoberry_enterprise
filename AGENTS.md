# Zoberry Enterprise - Agent Rules & Architecture

> Read this file before making code changes in `D:\personal\zoberry\zoberry_enterprise`.
> This file is the source of truth for repo boundaries, API ownership, migration status, and implementation rules.

---

## 1. Next.js Warning

### This is not legacy Next.js behavior

This repo uses `next@16.2.9` with App Router.
Do not assume older Next.js patterns are still correct.
Before adding or changing Next.js runtime features, read the relevant docs under:

- `node_modules/next/dist/docs/01-app/`
- especially Route Handlers, Backend for Frontend, config, and App Router docs

Current repo facts:
- Route Handlers are used under `src/app/api/`
- `next lint` is not currently reliable in this repo because the project has ESLint 9 with legacy `.eslintrc.json`
- prefer `npx tsc --noEmit` for immediate verification until lint config is modernized

---

## 2. Repositories And Real Paths

There are two separate repos involved in this system:

### Storefront repo
- Path: `D:\personal\zoberry\zoberry_enterprise`
- Stack: Next.js App Router + React + Tailwind + Redux Toolkit + MongoDB
- Responsibility: public storefront and customer-facing APIs
- Deployment: public deployment, e.g. Vercel

### Admin repo
- Path: `D:\personal\zoberry\zoberry_admin`
- Contains:
  - `admin/` -> Vite React admin UI
  - `server/` -> Express + MongoDB admin backend
- Responsibility: admin panel and admin-only APIs
- Dev ports:
  - admin UI: `3001`
  - admin server: `5000`

Do not mix responsibilities between these repos.

---

## 3. Final Architecture Decision

This is the final architecture decision and must be followed.

### Customer-facing API logic belongs in `zoberry_enterprise`
All customer-facing APIs must live in this repo under `src/app/api/`.

### Admin panel APIs belong in `zoberry_admin/server`
All admin CRUD, admin auth, admin dashboards, admin metrics, uploads, and operational actions must stay in the admin backend.

### The admin frontend must call only admin backend APIs
`zoberry_admin/admin` should call `zoberry_admin/server` only.
It must not depend on `zoberry_enterprise` customer API routes.

### The storefront must progressively stop depending on the admin backend
The storefront is being migrated away from the admin Express backend.
Do not reintroduce new customer dependencies on `zoberry_admin/server`.

---

## 4. Current Migration Status

The migration is in progress, not complete.

### Already migrated into `zoberry_enterprise`
Customer read APIs for:
- `GET /api/products`
- `GET /api/products/[id]`
- `GET /api/products/slug/[slug]`
- `GET /api/categories`
- `GET /api/categories/[id]`

These are implemented in:
- `src/app/api/products/route.ts`
- `src/app/api/products/[id]/route.ts`
- `src/app/api/products/slug/[slug]/route.ts`
- `src/app/api/categories/route.ts`
- `src/app/api/categories/[id]/route.ts`

Storefront services already pointed to local Next.js APIs for these reads:
- `src/services/product.service.ts`
- `src/services/category.service.ts`
- helper: `src/services/site-api.ts`

### Not yet migrated
These still depend on the old external/admin backend flow and must be migrated next, not mixed randomly:
- customer auth
- customer addresses
- customer orders
- customer recently viewed
- customer product reviews write path
- blogs
- testimonials
- hero slides
- contact submission

Relevant service files still involved in the old backend path include:
- `src/services/api.ts`
- `src/services/auth.service.ts`
- `src/services/order.service.ts`
- `src/services/blog.service.ts`
- `src/services/testimonial.service.ts`
- `src/services/hero.service.ts`
- `src/services/contact.service.ts`
- `src/services/recently-viewed.service.ts`

### Important temporary state
This repo currently contains both:
- `src/lib/models/`
- `src/lib/storefront-models/`

Use `src/lib/storefront-models/` for the newly migrated storefront catalog read layer.
These were introduced because earlier sandbox/file-lock issues left `src/lib/models/` in an unreliable intermediate state.

Until that cleanup is done, do not casually refactor these two model folders together unless you first verify all imports and consumers.

---

## 5. API Ownership Rules

### Customer APIs that belong in `zoberry_enterprise`
These must end up in this repo:
- auth register/login/google-login/me for customers
- customer products read APIs
- customer categories read APIs
- customer orders create/my-orders/cancel
- customer address book APIs
- customer recently viewed APIs
- public blog reads
- public testimonial reads
- public hero slide reads
- contact submission
- customer review submission

### Admin APIs that belong in `zoberry_admin/server`
These must remain in admin backend:
- admin login
- product create/update/delete
- category create/update/delete
- order status update and metrics
- user management
- content management CRUD
- uploads and media processing
- seed scripts

### Rule
If an endpoint is used by anonymous users or customers browsing the storefront, it belongs in `zoberry_enterprise`.
If an endpoint is used by staff managing the business, it belongs in `zoberry_admin/server`.

---

## 6. Database Rules

- Both repos use the same MongoDB cluster.
- `MONGODB_URI` must come from env files only.
- Never hardcode credentials.
- MongoDB free-tier limits still matter: avoid bloated schemas and duplicated junk data.
- Keep indexes defined in schemas.
- When changing product/order/user/category models, think about compatibility with both repos.

Current storefront DB entry point:
- `src/lib/db.ts`

---

## 7. Storefront Code Rules

### App structure
- Public pages live under `src/app/(site)/`
- Root layout is `src/app/layout.tsx`
- Site shell is `src/app/(site)/layout.tsx`
- Customer APIs live under `src/app/api/`

### Styling
- Global CSS imports belong only in `src/app/layout.tsx`
- Use Tailwind and existing tokens first
- Do not add deprecated style hacks like `::ng-deep` anywhere

### State
- Redux Toolkit lives under `src/redux/`
- Do not add global providers casually

### Services
Use the right service path based on migration state:
- local migrated reads -> `site-api.ts`
- still-unmigrated backend calls -> existing `api.ts`

Do not switch all services to local `/api` blindly in one shot.
That will break still-unmigrated flows.

---

## 8. Admin Repo Rules For This Storefront Agent

Even when inspecting `zoberry_admin`, remember:
- do not move admin UI code into this repo
- do not make storefront features depend on admin-only endpoints
- do not assume admin server is the long-term customer API host

If you need to copy business logic from admin Express controllers during migration, copy only customer-relevant logic and adapt it for Next.js Route Handlers.
Do not copy admin-only behavior into storefront routes.

---

## 9. Current Non-Obvious Technical Caveats

### Build issue
`npm run build` currently hits a `.next` rename/permission problem in this environment:
- Next fails renaming a file inside `.next/server/`
- this appears environmental/file-lock related, not from the new customer catalog API code

Do not assume a build failure automatically means the new route handlers are wrong.

### Lint issue
Current `package.json` still has:
- `"lint": "next lint"`

That is stale for this toolchain state.
This repo also has ESLint 9 with legacy `.eslintrc.json`, so direct ESLint execution fails until config is migrated.

### Dirty worktree
The worktree may already contain unrelated user changes and deleted asset files.
Never revert unrelated changes unless explicitly asked.

---

## 10. Current Verification Baseline

After the first storefront API migration slice:
- `npx tsc --noEmit` passes
- customer product/category read services are local to the storefront
- auth/order/blog/testimonial/contact flows are not fully migrated yet

If a future agent changes this baseline, update this file.

---

## 11. Immediate Next Recommended Work Order

Follow this order unless the user explicitly redirects it.

1. Stabilize tooling if needed
- lint config modernization
- build verification cleanup if `.next` lock issue blocks work repeatedly

2. Migrate customer auth into `zoberry_enterprise`
- register
- login
- google login
- get current user

3. Migrate customer account and order flows
- address book
- create order
- my orders
- cancel order

4. Migrate remaining public content reads
- blogs
- testimonials
- hero slides
- contact submission
- recently viewed

5. After storefront no longer depends on customer routes in admin backend
- shrink `zoberry_admin/server` to admin-only scope

---

## 12. Coding Rules For Agents

1. Read this file first every time.
2. Do not assume old architecture notes are still valid without checking this file.
3. Keep customer logic in storefront and admin logic in admin repo.
4. Use clear naming and keep implementations straightforward.
5. Reuse existing project patterns before introducing new abstractions.
6. Add helper functions only when justified.
7. Keep route responses consistent: `{ success, data }` or `{ success, error }`.
8. Use `try/catch` in every Route Handler.
9. Validate request bodies before DB writes.
10. Ask before deleting files.
11. Do not revert unrelated user changes.
12. If you materially change architecture or migration state, update this file in the same task.

---

## 13. Important Paths Summary

### Storefront repo
- `D:\personal\zoberry\zoberry_enterprise`

### Admin repo
- `D:\personal\zoberry\zoberry_admin`

### Storefront API layer
- `src/app/api/`

### Storefront DB layer
- `src/lib/db.ts`
- `src/lib/storefront-models/`
- `src/lib/catalog-storefront.ts`

### Storefront service split
- migrated local reads: `src/services/site-api.ts`
- older external backend helper: `src/services/api.ts`

### Admin repo split
- admin UI: `D:\personal\zoberry\zoberry_admin\admin`
- admin backend: `D:\personal\zoberry\zoberry_admin\server`
