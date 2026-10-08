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
| **Phase 5** | **PhonePe Test Mode Payment Integration (Standard Checkout SDK, Webhooks, Verification, Inventory TTL)** | ✅ **COMPLETE** | 13 / 13 Passed |
| **Phase 6** | **Shipping, Tax & Checkout Business Rules (Centralized Pricing Engine, Shipping Methods, Free Shipping, GST Rules, Order Snapshots)** | ✅ **COMPLETE** | 12 / 12 Passed |
| **Phase 7** | **Fulfillment & Logistics Foundation (Shipments, AWB Tracking, Provider Adapter, Timeline, Admin Fulfillment)** | ✅ **COMPLETE** | 14 / 14 Passed |
| **Phase 8** | **Customer Reviews, Loyalty & Invoicing** | ⏳ **PENDING (NEXT)** | - |

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
- **Verification:** `server/test/payment_phase5.test.js` (13 tests).

### ✅ Phase 6: Shipping, Tax & Checkout Business Rules
- **Single Centralized Checkout Pricing Engine (`checkoutPricingEngine.js`):**
  - Server-authoritative, deterministic integer-paise calculations for subtotal, promotion discounts, provider-independent shipping rates, tax breakdowns, and final grand totals.
  - Strict validation against invalid or inactive shipping method codes (rejects with `BAD_USER_INPUT`).
  - Hierarchy: `Merchandise Subtotal` - `Promotion Discount` = `Eligible Merchandise Subtotal` -> `Shipping Rate (with ₹999 free threshold)` -> `GST Tax Breakdown (5% Inclusive)` = `Grand Total`.
- **Shipping Domain Architecture:**
  - `ShippingMethod` model (`code`, `name`, `description`, `price`, `freeThreshold`, `estimatedDays`, `isActive`, `priority`).
  - Provider-independent configuration supporting standard ground (`STANDARD` @ ₹99 with ₹999 free-shipping threshold) and express priority (`EXPRESS` @ ₹199).
- **Tax Domain Architecture:**
  - `TaxRule` model (`name`, `ratePercent`, `isInclusive`, `isActive`, `country`, `state`).
  - Implements Standard Consumer Tax-Inclusive GST (5%) model, extracting tax portion without altering customer-facing grand total.
- **Immutable Order Snapshots:**
  - `Order` model extended with `shippingMethod`, `shippingSnapshot` JSON, and `taxSnapshot` JSON. Future customer address or rate changes cannot corrupt historical receipts.
- **GraphQL APIs:**
  - Queries: `getAvailableShippingMethods`, `getTaxRules`, `adminGetAllShippingMethods`.
  - Mutations: `adminCreateShippingMethod`, `adminUpdateShippingMethod`, `adminToggleShippingMethodActive`, `adminCreateTaxRule`, `adminUpdateTaxRule`, `adminToggleTaxRuleActive`.
- **Frontend Experience:**
  - `/checkout`: Added Shipping Method selector with live cost calculation, dynamic free-shipping progress badge, and itemized tax breakdown.
  - `/order/:orderNumber`: Renders immutable shipping method and tax breakdown snapshot.
  - `/admin/shipping`: Dedicated dashboard to configure shipping rates, free-shipping thresholds, transit estimates, and GST rules.
- **Verification:** `server/test/shipping_tax_phase6.test.js` (12 tests).

### ✅ Phase 7: Fulfillment & Logistics Foundation
- **Fulfillment & Shipment Architecture:**
  - `Shipment` model (`orderId`, `provider`, `providerShipmentId`, `awbNumber`, `trackingNumber`, `status`, `shippingMethodCode`, `shippingAddressSnapshot`, `packageDetails`, `estimatedDeliveryAt`, `shippedAt`, `deliveredAt`, `cancelledAt`, `idempotencyKey`).
  - `ShipmentTrackingEvent` model recording append-only audit tracking milestones (`status`, `location`, `description`, `eventTime`, `source`, `rawPayload`).
  - Database association: `Order.hasMany(Shipment)` allowing future split-order fulfillment without architectural bottlenecks.
- **Controlled Shipment Lifecycle & State Machine (`shipmentStateMachine.js`):**
  - Strict transitions: `PENDING` → `READY_TO_SHIP` → `SHIPMENT_CREATED` → `PICKED_UP` → `IN_TRANSIT` → `OUT_FOR_DELIVERY` → `DELIVERED`.
  - Terminal states: `DELIVERED`, `CANCELLED`.
  - Controlled retry: `FAILED` → `READY_TO_SHIP` / `SHIPMENT_CREATED` / `CANCELLED`.
- **Payment Eligibility & Inventory Safety (`fulfillmentService.js`):**
  - Authoritative rule: Orders must be in `paymentStatus: PAID` and not cancelled before shipments can be created.
  - Zero double deduction: Stock is not deducted again during fulfillment.
  - Order status synchronization: Transitioning shipments to `PICKED_UP` / `IN_TRANSIT` updates `Order.status = 'SHIPPED'`, and `DELIVERED` updates `Order.status = 'DELIVERED'`.
- **Provider-Independent Adapter Layer (`shippingProviderAdapter.js`):**
  - Abstract base class with clean methods for `checkServiceability`, `createShipment`, `cancelShipment`, and `getTracking`.
  - Default `InternalCourierProvider` generating deterministic unique AWBs (`AWB-ZB-YYYYMMDD-XXXX`).
- **GraphQL APIs:**
  - Customer: `getMyOrderShipments(orderId)`, `getShipmentTracking(awbNumber)`, `checkPostalServiceability(postalCode)`.
  - Admin: `adminCreateShipment`, `adminUpdateShipmentStatus`, `adminCancelShipment`, `adminAddTrackingEvent`, `adminGetOrderShipments`, `adminGetAllShipments`.
- **Frontend Experience:**
  - Customer `/order/:orderNumber`: Displays carrier provider, AWB tracking badge, delivery status, and milestone timeline.
  - Admin `/admin/shipping`: Tabbed interface with dedicated Shipments & Fulfillment manager (live filters, shipment creation modal, status updates, and tracking event audit log).
- **Verification:** `server/test/fulfillment_phase7.test.js` (14 tests) | Clean Vite Client Build.

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
├── graphql/                         # Apollo queries/mutations (auth, products, cart, address, orders, wishlist, promotions, payment, shipping, fulfillment)
├── hooks/                           # Custom hooks (useCart, useWishlist)
├── pages/                           # HomePage, ProductsPage, ProductDetailPage, CartPage, CheckoutPage, OrderDetailPage, WishlistPage, AboutPage, ContactPage
│   ├── account/                     # AccountPage, AccountOrders, AccountAddresses
│   └── admin/                       # AdminDashboard, AdminCategories, AdminProducts, AdminPromotions, AdminShipping
├── store/                           # uiStore (cart count, wishlist IDs, auth state, toasts)
└── utils/                           # guestToken, imageUrl

server/
├── config/
│   └── db.js                        # Sequelize connection configuration
├── graphql/
│   ├── typeDefs/                    # GraphQL schemas (user, category, product, variant, cart, address, order, wishlist, promotion, payment, shipping, shipment)
│   └── resolvers/                   # Resolvers (user, category, product, variant, cart, address, order, wishlist, promotion, payment, shipping, shipment)
├── helpers/                         # authHelper, authMiddleware, checkoutPricingEngine, errorHelper, imageHelper, inventoryHelper, moneyHelper, orderStateMachine, promotionHelper, shipmentStateMachine, validationHelper
├── models/                          # Sequelize models (User, Category, Product, ProductVariant, Cart, CartItem, Address, Order, OrderItem, InventoryMovement, WishlistItem, Promotion, PromotionUsage, Payment, PaymentTransaction, ShippingMethod, TaxRule, Shipment, ShipmentTrackingEvent)
├── routes/                          # paymentRoutes.js (PhonePe callback/webhook)
├── services/
│   ├── payment/                     # PhonePe SDK adapter and payment service
│   └── shipping/                    # Shipping provider adapter and fulfillment service
├── scripts/                         # initDb.js
└── test/
    ├── security_and_regression.test.js  # Phase 1 test suite (26 tests)
    ├── commerce_phase2.test.js          # Phase 2 test suite (20 tests)
    ├── storefront_phase3.test.js        # Phase 3 test suite (6 tests)
    ├── promotions_phase4.test.js        # Phase 4 test suite (16 tests)
    ├── payment_phase5.test.js           # Phase 5 test suite (13 tests)
    ├── shipping_tax_phase6.test.js      # Phase 6 test suite (12 tests)
    └── fulfillment_phase7.test.js       # Phase 7 test suite (14 tests)
```

---

## 🧪 How to Run Tests & Build

From the `server` directory:
```bash
cd server
node test/fulfillment_phase7.test.js
```
*(Runs Phase 7 automated test suite — 14/14 passing).*

To build the client:
```bash
cd client
npm run build
```
*(Runs Vite client production build).*
