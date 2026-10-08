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
| **Phase 3** | **Payments & Logistics (PhonePe, Shipping Providers, Webhooks, Notifications)** | ⏳ **PENDING** | - |
| **Phase 4** | **Frontend Commerce Experience & UI Polish (Cart drawer, Checkout flow, User Orders, Admin Order Ops)** | ⏳ **PENDING** | - |
| **Phase 5** | **Customer Engagement (Coupons/Discounts, Reviews/Ratings, Wishlist Sync)** | ⏳ **PENDING** | - |

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

---

## 📂 Key Architecture & File Map

```
server/
├── config/
│   └── db.js                        # Sequelize connection configuration
├── graphql/
│   ├── typeDefs/
│   │   ├── index.js                 # Schema merger
│   │   ├── user.js                  # Auth & customer schemas
│   │   ├── category.js              # Category schemas
│   │   ├── product.js               # Product schemas (paginated)
│   │   ├── variant.js               # Product variant schemas
│   │   ├── cart.js                  # Cart & item schemas
│   │   ├── address.js               # Customer addresses
│   │   └── order.js                 # Orders, checkout & status schemas
│   └── resolvers/
│       ├── index.js                 # Resolvers merger
│       ├── user.js                  # User authentication & profile
│       ├── category.js              # Category management
│       ├── product.js               # Product listings & admin operations
│       ├── variant.js               # Variant mutations & queries
│       ├── cart.js                  # Persistent cart management
│       ├── address.js               # Address CRUD
│       └── order.js                 # Checkout, order placement & admin ops
├── helpers/
│   ├── authHelper.js                # JWT & password helpers
│   ├── authMiddleware.js            # GraphQL context auth & role gates
│   ├── errorHelper.js               # Sanitized error formatter & custom errors
│   ├── imageHelper.js               # Image upload processing & validations
│   ├── inventoryHelper.js           # Stock reservation & movement tracking
│   ├── moneyHelper.js               # Exact monetary math in paise
│   ├── orderStateMachine.js         # Order number generator & status transitions
│   └── validationHelper.js          # String, email, slug & numeric validators
├── models/
│   ├── index.js                     # Sequelize model relationships & exports
│   ├── userModel.js                 # Users & roles
│   ├── categoryModel.js             # Categories
│   ├── productModel.js              # Products
│   ├── productVariantModel.js       # Variants
│   ├── cartModel.js                 # Guest & user cart sessions
│   ├── cartItemModel.js             # Cart line items
│   ├── addressModel.js              # Customer addresses
│   ├── orderModel.js                # Orders with financial totals & snapshots
│   ├── orderItemModel.js            # Order line items with price snapshots
│   ├── inventoryMovementModel.js    # Stock audit logs
│   └── wishlistItemModel.js         # Wishlist items
├── scripts/
│   └── initDb.js                    # Safe database initializer
└── test/
    ├── security_and_regression.test.js  # Phase 1 test suite
    └── commerce_phase2.test.js          # Phase 2 test suite
```

---

## 🧪 How to Run Tests

From the `server` directory:

```bash
cd server
npm test
```

This runs both Phase 1 and Phase 2 test suites.

To build the client:
```bash
cd client
npm run build
```

---

## 🚀 Immediate Next Steps (Phase 3 Preparation)

1. **Payment Integration (PhonePe / Gateway):**
   - Implement payment initiation endpoint/mutation.
   - Secure webhook receiver with payload signature verification and idempotent order state transition to `PAID`.
   - Implement refund handling hook.

2. **Shipping & Courier Integration:**
   - Shipping rate calculation by pincode / weight.
   - Courier webhook status sync (AWB generation, tracking updates).

3. **Frontend Integration:**
   - Connect client cart state to GraphQL persistent cart mutations (guest token in `localStorage` + customer sync).
   - Checkout multi-step flow (Address selection → Payment selection → Review → Place Order).
   - Customer Order History page & Order tracking page.
   - Admin Order Management dashboard (Update statuses, View inventory movements).
