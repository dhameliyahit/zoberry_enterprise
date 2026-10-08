# ZOBERRY ENTERPRISE — PROJECT STATE & ROADMAP TRACKER

> **Last Updated:** October 2026  
> **Current Working Branch:** `main`  
> **Overall Architecture:** React (Vite + SSR Meta Prerender) + Node.js (Express 5) + Apollo Server (GraphQL) + MySQL (Sequelize)

---

## 📌 Phase Overview & Completion Status

| Phase | Description | Status | Test Coverage |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Production Foundation & Security** | ✅ **COMPLETE** | 26 / 26 Passed |
| **Phase 2** | **Commerce Core (Cart, Variants, Inventory, Address, Order, Checkout)** | ✅ **COMPLETE** | 20 / 20 Passed |
| **Phase 3** | **Storefront & Customer Shopping Experience (Cart Drawer, PDP Variants, Addresses, Orders, Wishlist, Checkout)** | ✅ **COMPLETE** | 6 / 6 Passed |
| **Phase 4** | **Promotions, Coupons & Pricing Rules (Coupons, Percent/Fixed Caps, Usage Limits, Snapshots, Admin Panel)** | ✅ **COMPLETE** | 16 / 16 Passed |
| **Phase 5** | **PhonePe Test Mode Payment Integration (Standard Checkout SDK, Webhooks, Verification, Inventory TTL)** | ✅ **COMPLETE** | 13 / 13 Passed (81/81 Total) |
| **Phase 6** | **Logistics & Invoicing (Courier Tracking, Automated Tax Invoices)** | ⏳ **PENDING (NEXT)** | - |
| **Phase 7** | **Reviews, Marketing & Customer Loyalty Systems** | ⏳ **PENDING** | - |

---

## 🛠️ Summary of Completed Phases

### ✅ Phase 1: Production Foundation & Security
- **Authentication:** JWT with standard expiry, Bearer token extraction, secure password hashing with `bcryptjs`, and Google OAuth verification.
- **Authorization & Ownership:** Multi-role access control (`requireAuth`, `requireAdmin`, `requireOwnerOrAdmin`). Protected all Admin and User GraphQL mutations against ID manipulation.
- **Database Safety:** Safe Sequelize synchronization with separate `scripts/initDb.js` ensuring schema migrations do not drop or alter existing production records unsafely.
- **Product & Category Foundation:** Non-negative price and stock validations, unique slug enforcement, safe HTML description sanitization, and paginated product querying with search/sort filters.
- **Media Uploads:** Authenticated multipart upload with folder whitelisting and image buffer validation (`sharp`).
- **Error Handling:** Centralized GraphQL error formatter masking internal server leaks while maintaining actionable error codes (`UNAUTHENTICATED`, `FORBIDDEN`, `BAD_USER_INPUT`, `NOT_FOUND`).
- **Verification:** `server/test/security_and_regression.test.js` (26 tests).

### ✅ Phase 2: Commerce Core Engine
- **Money Model:** 
  - Standardized integer paise calculations (`toPaise`, `fromPaise`, `calculateLineTotal`, `calculateTotals`).
  - Zero floating-point drift in line items, subtotal, discount, shipping, tax, and grand total.
- **Product Variants:** 
  - Generic variant model (`ProductVariant`) supporting arbitrary attributes (Size, Color, Material, etc.), separate SKUs, variant pricing, and variant-level stock management.
- **Persistent Cart System:** 
  - Unified cart model (`Cart`, `CartItem`) supporting both guest sessions (via `guestToken`) and authenticated customer accounts (`userId`).
  - Auto-merging guest carts to customer accounts upon login.
- **Inventory & Movement Tracking:** 
  - Real-time stock reservation and deduction tracking with `InventoryMovement` log (RESERVED, DEDUCTED, RESTOCKED, ADJUSTED).
- **Address Domain:** 
  - Full CRUD for customer shipping and billing addresses (`Address`) with default address flags and ownership checks.
- **Order Domain & State Machine:** 
  - Human-friendly order numbering (e.g., `ZB-20261008-XXXX`).
  - Strict order status state transitions: `PENDING` → `CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED` (or `CANCELLED` / `REFUNDED`).
  - Strict payment status state transitions: `PENDING` → `AUTHORIZED` → `PAID` → `FAILED` / `REFUNDED`.
- **Checkout Engine:** 
  - Idempotent `createOrderFromCart` mutation with stock verification, price locking, snapshotting items, and transactional integrity.
- **Verification:** `server/test/commerce_phase2.test.js` (20 tests).

### ✅ Phase 3: Storefront & Customer Shopping Experience
- **Information Architecture & Navigation:** 
  - Clean, classic header with logo, sticky nav, live search, cart item count badge, wishlist badge, customer profile dropdown, and mobile drawer menu.
  - Classic footer with store links, policies, customer service info, and newsletter subscription.
- **Homepage:** 
  - Hero showcase with real backend product queries, clean CTAs, category slider, and featured products grid with zero fake reviews or fake countdowns.
- **Product Catalog & Search:** 
  - `/products`, `/categories`, `/category/:slug`, `/search` with category filtering, live keyword search, price/newest sorting, and in-stock toggles.
- **Product Details & Variant Selector (`/product/:slug`):** 
  - Dynamic media gallery with video support, real `ProductVariant` selection with live price and stock updates, quantity selector bounded to inventory, "Add to Cart", "Buy Now", and wishlist toggling.
- **Persistent Cart Experience:** 
  - Live Cart Drawer + dedicated `/cart` page with server-authoritative calculations, quantity controls, out-of-stock badges, guest session persistence via `zoberry_guest_token`, and auto-merge on login.
- **Customer Authentication:** 
  - Modal and page-level authentication (Email/Password + Google OAuth) with automatic guest cart merging and token session persistence.
- **Customer Account Management (`/account`):** 
  - Protected customer portal with tabbed views for profile details, order history with status tracking, and address CRUD with default shipping flags.
- **Checkout Flow (`/checkout`):** 
  - Multi-step checkout with server checkout preview (`previewCheckout`), stock validation, address selection/guest form, and idempotent order placement (`createOrderFromCart`).
- **Order Confirmation & Tracking (`/order/:orderNumber`):** 
  - Dedicated order confirmation view with status indicators, address snapshot, itemized receipts, and order summary.
- **Wishlist (`/wishlist`):** 
  - Customer wishlist domain with toggle buttons, grid display, and "Move to Cart" action.
- **Verification:** `server/test/storefront_phase3.test.js` (6 tests).

### ✅ Phase 4: Promotions, Coupons & Pricing Rules
- **Promotion & Coupon Models:**
  - `Promotion` model with `code`, `name`, `type` (COUPON / AUTOMATIC), `discountType` (PERCENTAGE / FIXED_AMOUNT), `discountValue`, `minimumSubtotal`, `maximumDiscount`, `usageLimit`, `perCustomerLimit`, `startsAt`, `endsAt`, `isActive`, `targetProductIds`, `targetCategoryIds`.
  - `PromotionUsage` ledger with foreign key relations to `Promotion`, `User`, and `Order`, tracking usage timestamp and actual discount amount.
  - Extended `Order` with `couponCode` and immutable `discountSnapshot` JSON column preserving historical discount data against future edits.
- **Pricing & Calculation Engine (`promotionHelper.js`):**
  - Integer-paise calculations for percentage and fixed discounts, strict cap enforcement (`maximumDiscount`), and non-negative total enforcement.
  - String sanitization and code uppercase normalization (`normalizeCouponCode`).
  - Multi-condition eligibility validation: active status, start/end dates, minimum subtotal, global usage limits, per-customer / guest email limits, product/category targeting.
  - Concurrency-safe atomic usage tracking with DB row locking (`t.LOCK.UPDATE`).
- **GraphQL APIs:**
  - Customer: `validateCoupon(code, guestSessionToken)` and integrated discount preview in `previewCheckout` and `createOrderFromCart`.
  - Admin: `adminGetAllPromotions`, `adminGetPromotionById`, `adminCreatePromotion`, `adminUpdatePromotion`, `adminTogglePromotionActive`, `adminDeletePromotion`.
- **Frontend Experience:**
  - Storefront: Dynamic coupon promo code input, validation feedback, instant preview discount line item, and remove coupon capability in `/checkout`.
  - Admin Management: Dedicated `/admin/promotions` dashboard with live search, filters (active, inactive, coupons, auto), create/edit promotion modal, instant active toggle switches, and deletion controls.
- **Verification:** `server/test/promotions_phase4.test.js` (16 tests).

### ✅ Phase 5: PhonePe Test Mode Payment Integration
- **Payment Domain Architecture:**
  - `Payment` model with `merchantOrderId` (UUID), `amount`, `currency`, `status` (PENDING, INITIATED, SUCCESS, FAILED, CANCELLED, EXPIRED, REFUNDED), `redirectUrl`, `providerPaymentId`, `providerResponseCode`, `rawResponse`, `expiresAt` (15-min TTL), `paidAt`.
  - `PaymentTransaction` model recording granular gateway events (`INITIATE`, `STATUS_VERIFY`, `EXPIRE`).
  - Foreign key associations between `Order` <-> `Payment` <-> `PaymentTransaction`.
- **PhonePe SDK Adapter & Service Layer (`server/services/payment/`):**
  - Configured with official `pg-sdk-node` (v2.0.2) targeting `Env.SANDBOX`.
  - Server-authoritative amount validation: payment amount derived solely from `Order.grandTotal` in integer paise. Zero client-side trust.
  - Server-to-server authoritative verification: `verifyAndProcessPhonePePayment` calls `client.getOrderStatus` to verify state and exact paid amount.
- **Inventory Reservation & Expiry Protection:**
  - Stock is reserved when order is placed (`CHECKOUT_RESERVATION`).
  - 15-minute TTL per payment attempt. `expireStaleUnpaidOrders()` sweeps expired pending orders, marks payment as `EXPIRED`, cancels the order, and automatically restocks inventory via `releaseStockForCancelledOrder`.
- **REST Callback & GraphQL APIs:**
  - `GET/POST /api/payment/phonepe/callback`: receives PhonePe redirect, executes backend verification, updates payment/order atomically, and redirects browser to `/order/:orderNumber?payment=success` or `failed`.
  - GraphQL `initiatePayment(orderNumber)` mutation & `getPaymentStatus(orderNumber)` query with strict IDOR customer ownership protection.
- **Frontend Experience:**
  - `/checkout`: Added PhonePe Online Gateway (UPI, Cards, NetBanking) option alongside Cash On Delivery.
  - `/order/:orderNumber`: Displays verified payment status badge, PhonePe transaction ID, and clear "Retry Payment" workflow if a transaction fails.
- **Verification:** `server/test/payment_phase5.test.js` (13 tests) | **81 / 81 Total Tests Passing** | Clean Vite Client Build.

---

## 📂 Key Architecture & File Map

```
client/src/
├── components/
│   ├── auth/                        # AuthModal, ProtectedRoute
│   ├── cart/                        # CartDrawer
│   ├── common/                      # Drawer, Modal, SEO, ToastContainer
│   ├── layout/                      # Header, Footer, Topbar, MainLayout
│   ├── products/                    # ProductCard
│   └── sections/                    # Hero, CategorySlider, FeaturedProducts
├── graphql/                         # Apollo queries/mutations (auth, products, cart, address, orders, wishlist, promotions, payment)
├── hooks/                           # Custom hooks (useCart, useWishlist)
├── pages/                           # HomePage, ProductsPage, ProductDetailPage, CartPage, CheckoutPage, OrderDetailPage, WishlistPage, AboutPage, ContactPage
│   ├── account/                     # AccountPage, AccountOrders, AccountAddresses
│   └── admin/                       # AdminDashboard, AdminCategories, AdminProducts, AdminPromotions
├── store/                           # uiStore (cart count, wishlist IDs, auth state, toasts)
└── utils/                           # guestToken, imageUrl

server/
├── config/
│   └── db.js                        # Sequelize connection configuration
├── graphql/
│   ├── typeDefs/                    # GraphQL schemas (user, category, product, variant, cart, address, order, wishlist, promotion, payment)
│   └── resolvers/                   # Resolvers (user, category, product, variant, cart, address, order, wishlist, promotion, payment)
├── helpers/                         # authHelper, authMiddleware, errorHelper, imageHelper, inventoryHelper, moneyHelper, orderStateMachine, promotionHelper, validationHelper
├── models/                          # Sequelize models (User, Category, Product, ProductVariant, Cart, CartItem, Address, Order, OrderItem, InventoryMovement, WishlistItem, Promotion, PromotionUsage, Payment, PaymentTransaction)
├── routes/                          # paymentRoutes.js (PhonePe callback/webhook)
├── services/
│   └── payment/
│       ├── paymentService.js        # Master payment orchestrator, TTL, and status verification
│       └── phonepe/
│           ├── phonepeConfig.js     # PhonePe sandbox config
│           └── phonepeService.js    # pg-sdk-node adapter
├── scripts/                         # initDb.js
└── test/
    ├── security_and_regression.test.js  # Phase 1 test suite (26 tests)
    ├── commerce_phase2.test.js          # Phase 2 test suite (20 tests)
    ├── storefront_phase3.test.js        # Phase 3 test suite (6 tests)
    ├── promotions_phase4.test.js        # Phase 4 test suite (16 tests)
    └── payment_phase5.test.js           # Phase 5 test suite (13 tests)
```

---

## 🧪 How to Run Tests & Build

From the `server` directory:
```bash
cd server
npm test
```
*(Runs Phase 1, Phase 2, Phase 3, Phase 4, and Phase 5 automated test suites — 81/81 passing).*

To build the client:
```bash
cd client
npm run build
```
*(Runs Vite client production build).*

---

## 🚀 Phase 4 Scope (Payments & Logistics — Next Up)

1. **PhonePe Payment Gateway Integration:**
   - Payment initiation API / mutation
   - Webhook receiver with cryptographic signature verification
   - Idempotent order state transition (`PENDING` → `PAID`)
2. **Shipping & Courier Logistics Integration:**
   - Pincode serviceability & real-time shipping rate calculation
   - Courier webhook status sync (AWB generation, tracking events)
3. **Invoicing & PDF Receipts:**
   - Automated order tax invoice generation.
