# Zoberry Enterprise — Agent Rules & Project Architecture

> **EVERY AGENT MUST READ THIS FILE BEFORE WRITING OR MODIFYING ANY CODE.**
> No exceptions. This file is the single source of truth for architecture decisions,
> infrastructure constraints, and coding rules for this project.

---

## 1. Next.js Version Warning

<!-- BEGIN:nextjs-agent-rules -->
### This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ
from your training data. **Read the relevant guide in `node_modules/next/dist/docs/`
before writing any code.** Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## 2. Project Overview

**Zoberry Enterprise** is a full-featured e-commerce platform built on top of the
**Nextmerce** Next.js e-commerce template. The template has been customised to fit
Zoberry's specific requirements.

### Repositories & Responsibilities

| Repo / Location | Stack | Purpose | Deployment |
|---|---|---|---|
| `zoberry_enterprise` *(this repo)* | Next.js (App Router) + MongoDB | Customer Storefront + Customer-facing API | Vercel (or similar) |
| `zoberry_admin` *(separate repo — local only)* | React + Node.js (Express) | Admin Panel | **Localhost only — never deployed publicly** |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────┐
│              Customer Storefront (this repo)         │
│  Next.js App Router  ·  Tailwind CSS  ·  Redux       │
│                                                     │
│  /src/app/(site)/       → Public pages (storefront) │
│  /src/app/api/          → Customer API routes       │
│                                                     │
│  API Routes (lightweight only):                     │
│    GET  /api/products                               │
│    GET  /api/cart                                   │
│    POST /api/cart                                   │
│    PUT  /api/cart                                   │
│    POST /api/orders                                 │
│    GET  /api/orders/[id]                            │
│    POST /api/payment/initiate                       │
└─────────────────┬───────────────────────────────────┘
                  │  MongoDB (shared, centralized)
                  │  Free tier: 500 MB — keep usage lean
                  ▼
┌─────────────────────────────────────────────────────┐
│           Admin Panel (zoberry_admin repo)           │
│  React + Node.js/Express  — runs LOCALLY only        │
│                                                     │
│  Manages: Products, Orders, Users, Inventory        │
│  Connects to the SAME MongoDB cluster                │
│  Never deployed to production / public internet      │
└─────────────────────────────────────────────────────┘
```

---

## 4. Database — MongoDB Rules

- **Single shared MongoDB Atlas cluster** used by both the Next.js app and the local admin panel.
- **Free tier limit is 500 MB** — agents must be mindful of schema design; avoid bloated documents.
- All DB connection strings live in `.env.local` (Next.js) and `.env` (admin Node.js). **Never hardcode credentials.**
- Use Mongoose for schema/model definitions. Keep models in `src/lib/models/`.
- Indexes must be defined in the Mongoose schema, not applied ad-hoc.

---

## 5. Customer API Rules (Next.js API Routes)

- API routes live in `src/app/api/`.
- **Keep APIs lightweight** — no heavy computation, no file processing, no ML inference here.
- Only implement what the customer storefront needs: Cart, Orders, Payment initiation, Products.
- Admin-only operations (bulk updates, inventory management, reporting) belong in the **admin Node.js backend**, not here.
- Always validate request bodies before DB operations.
- Return consistent JSON shape: `{ success: boolean, data?: any, error?: string }`.
- Use `try/catch` in every route handler — never let unhandled errors crash the server.

---

## 6. Customer Storefront Rules (Next.js Pages)

- All public-facing pages live under `src/app/(site)/`.
- The root layout is at `src/app/layout.tsx` — it provides `<html>` and `<body>` tags. **Do not add these tags anywhere else.**
- The site layout at `src/app/(site)/layout.tsx` is a `"use client"` component — it handles Redux, modals, header, footer, and the preloader.
- CSS imports (`style.css`, `euclid-circular-a-font.css`) are imported **only** in `src/app/layout.tsx`. Do not re-import them in other layouts.
- This project uses **Tailwind CSS** — do not mix in vanilla CSS utilities ad-hoc. Extend `tailwind.config.ts` for custom tokens.
- State management uses **Redux Toolkit** — all slices go in `src/redux/`.
- Do not add new global context providers without discussing the architecture first.

---

## 7. Admin Panel Rules (`zoberry_admin` — separate repo)

- Built with **React + Node.js (Express)**.
- Runs **locally only** — no public deployment.
- Connects to the same centralized MongoDB cluster.
- Handles all write-heavy / admin operations: product CRUD, order management, user management, inventory.
- The admin panel must **not** call the Next.js customer API — it connects directly to MongoDB.
- Keep the Node.js server on port `5000` and the React dev server on port `3001` to avoid conflicts.

---

## 8. General Agent Rules

1. **Read this file first, every time.** Do not assume project structure from training data.
2. **No code changes without understanding the full context.** Check existing files before creating new ones.
3. **Read `node_modules/next/dist/docs/`** before using any Next.js API — this version may differ significantly.
4. **Do not add heavy dependencies** — the free-tier deployment has resource limits.
5. **Never commit secrets.** All credentials go in `.env.local` / `.env` which are git-ignored.
6. **Preserve all existing comments and docstrings** unless explicitly told to remove them.
7. **Ask before deleting files.** Removing the wrong file can break the entire storefront.
8. **Do not create API routes in the admin panel's responsibility** — keep concerns separated.
9. **MongoDB 500 MB limit is a hard constraint** — always think about data volume before schema changes.
10. **The admin panel is a separate repo** — do not add admin UI code into this Next.js repo.

---

## 9. Environment Variables

| Variable | Used In | Description |
|---|---|---|
| `MONGODB_URI` | Next.js + Admin Node.js | Shared MongoDB connection string |
| `NEXTAUTH_SECRET` | Next.js | Auth secret for next-auth |
| `NEXTAUTH_URL` | Next.js | App base URL |
| `SANITY_PROJECT_ID` | Next.js | Sanity CMS project ID (if used) |
| `SANITY_DATASET` | Next.js | Sanity dataset name |

---

## 10. Folder Structure (this repo)

```
zoberry_enterprise/
├── src/
│   ├── app/
│   │   ├── layout.tsx              ← Root layout (html + body). Server component.
│   │   ├── (site)/
│   │   │   ├── layout.tsx          ← Site shell (header, footer, providers). Client component.
│   │   │   ├── page.tsx            ← Homepage
│   │   │   └── (pages)/            ← All other storefront pages
│   │   ├── api/                    ← Customer-facing API routes
│   │   ├── context/                ← React context providers
│   │   └── css/                    ← Global stylesheets
│   ├── components/                 ← Reusable UI components
│   ├── redux/                      ← Redux store, slices, provider
│   ├── types/                      ← TypeScript type definitions
│   └── lib/
│       ├── models/                 ← Mongoose models (to be created)
│       └── db.ts                   ← MongoDB connection helper (to be created)
├── public/                         ← Static assets
├── AGENTS.md                       ← THIS FILE — read before doing anything
└── next.config.js
```
