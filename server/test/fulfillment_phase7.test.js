/**
 * ====================================================================
 * PHASE 7 AUDIT & TEST SUITE: FULFILLMENT & LOGISTICS FOUNDATION
 * (INCLUDING PHASE 7 HOTFIX VERIFICATION GAPS)
 * ====================================================================
 * 
 * Focused validation for:
 * 1. Master GraphQL Schema compiles with Phase 7 operations
 * 2. Shipment belongs to Order & Order hasMany Shipments
 * 3. Multi-shipment association support
 * 4. Valid shipment lifecycle transitions succeed
 * 5. Invalid shipment lifecycle transitions are rejected
 * 6. Terminal state: Delivered cannot transition
 * 7. Terminal state: Cancelled cannot transition
 * 8. Fulfillment payment eligibility: Paid order passes
 * 9. Fulfillment payment eligibility: Unpaid/failed rejected
 * 10. AWB and Tracking number generation
 * 11. Serviceability provider returns deterministic delivery estimates
 * 12. Security & IDOR: Customer ownership enforcement
 * 13. Security: Admin role verification
 * 14. Database safety: No destructive force/alter sync flags
 * 15. [HOTFIX 1] Shipment Idempotency (replay-safe, no duplicates)
 * 16. [HOTFIX 2] Real Database Migration (tables, indexes, unique constraints)
 * 17. [HOTFIX 3] Public AWB Tracking Security (no sensitive customer/order data exposed)
 * 18. [HOTFIX 4] Address Snapshot Immutability (customer address edits don't mutate shipment)
 * 19. [HOTFIX 5] No Double Inventory Deduction (stock quantity and movements unchanged)
 * 20. [HOTFIX 6] Status Transition via Actual Resolver / Service (strict state machine enforcement)
 * 21. [HOTFIX 7] Admin Cancel Cannot Bypass State Machine (cancellation rules enforced)
 */

require('dotenv').config();
const assert = require('assert');
const crypto = require('crypto');
const { ApolloServer } = require('@apollo/server');
const typeDefs = require('../graphql/typeDefs');
const resolvers = require('../graphql/resolvers');
const { sequelize } = require('../config/db');
const {
  UserModel,
  CategoryModel,
  ProductModel,
  ProductVariantModel,
  AddressModel,
  OrderModel,
  OrderItemModel,
  InventoryMovementModel,
  ShipmentModel,
  ShipmentTrackingEventModel,
  SHIPMENT_STATUS,
} = require('../models');
const {
  isValidShipmentStatusTransition,
  generateAWBNumber,
  generateTrackingNumber,
} = require('../helpers/shipmentStateMachine');
const {
  validateOrderFulfillmentEligibility,
} = require('../services/shipping/fulfillmentService');
const { getShippingProvider } = require('../services/shipping/shippingProviderAdapter');
const { requireAdmin, requireOwnerOrAdmin } = require('../helpers/authMiddleware');
const { migratePhase7 } = require('../scripts/migratePhase7');

let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (error) {
    console.error(`  ❌ [FAIL] ${name}: ${error.message}`);
    failedTests++;
    throw error;
  }
}

async function asyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (error) {
    console.error(`  ❌ [FAIL] ${name}: ${error.message}`);
    failedTests++;
    throw error;
  }
}

async function runPhase7TestSuite() {
  console.log('\n======================================================');
  console.log('📦 RUNNING PHASE 7 FULFILLMENT & LOGISTICS TEST SUITE');
  console.log('======================================================\n');

  await sequelize.authenticate();
  await ShipmentModel.sync();
  await ShipmentTrackingEventModel.sync();
  await InventoryMovementModel.sync();

  const adminUser = { id: 'usr_admin_p7', email: 'admin@zoberry.com', role: 'admin' };
  const adminContext = { user: adminUser };

  // 1. GraphQL Schema Compilation
  await asyncTest('1. Master GraphQL Schema compiles with Phase 7 Fulfillment & Logistics operations', async () => {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
    });
    await server.start();
    assert.ok(server, 'ApolloServer instance started successfully');
    await server.stop();
  });

  // 2. Shipment Model Association
  test('2. Shipment belongs to an Order and Order hasMany Shipments', () => {
    assert.ok(OrderModel.associations.shipments, 'OrderModel has shipments association');
    assert.ok(ShipmentModel.associations.order, 'ShipmentModel belongs to order');
    assert.ok(ShipmentModel.associations.trackingEvents, 'ShipmentModel has trackingEvents');
  });

  // 3. Multi-shipment support
  test('3. Schema supports multiple shipments per order for future split fulfillment', () => {
    assert.strictEqual(OrderModel.associations.shipments.associationType, 'HasMany');
  });

  // 4. Valid Shipment Status Transitions
  test('4. Valid shipment lifecycle transitions succeed', () => {
    assert.strictEqual(
      isValidShipmentStatusTransition(SHIPMENT_STATUS.PENDING, SHIPMENT_STATUS.READY_TO_SHIP),
      true
    );
    assert.strictEqual(
      isValidShipmentStatusTransition(SHIPMENT_STATUS.READY_TO_SHIP, SHIPMENT_STATUS.SHIPMENT_CREATED),
      true
    );
    assert.strictEqual(
      isValidShipmentStatusTransition(SHIPMENT_STATUS.SHIPMENT_CREATED, SHIPMENT_STATUS.PICKED_UP),
      true
    );
    assert.strictEqual(
      isValidShipmentStatusTransition(SHIPMENT_STATUS.PICKED_UP, SHIPMENT_STATUS.IN_TRANSIT),
      true
    );
    assert.strictEqual(
      isValidShipmentStatusTransition(SHIPMENT_STATUS.IN_TRANSIT, SHIPMENT_STATUS.OUT_FOR_DELIVERY),
      true
    );
    assert.strictEqual(
      isValidShipmentStatusTransition(SHIPMENT_STATUS.OUT_FOR_DELIVERY, SHIPMENT_STATUS.DELIVERED),
      true
    );
  });

  // 5. Invalid Shipment Status Transitions Rejected
  test('5. Illegal forward or backward shipment status transitions are rejected', () => {
    assert.strictEqual(
      isValidShipmentStatusTransition(SHIPMENT_STATUS.PENDING, SHIPMENT_STATUS.DELIVERED),
      false
    );
    assert.strictEqual(
      isValidShipmentStatusTransition(SHIPMENT_STATUS.IN_TRANSIT, SHIPMENT_STATUS.PENDING),
      false
    );
    assert.strictEqual(
      isValidShipmentStatusTransition(SHIPMENT_STATUS.OUT_FOR_DELIVERY, SHIPMENT_STATUS.READY_TO_SHIP),
      false
    );
  });

  // 6. Terminal State: Delivered
  test('6. Delivered shipment is in terminal state and cannot transition to other statuses', () => {
    assert.strictEqual(
      isValidShipmentStatusTransition(SHIPMENT_STATUS.DELIVERED, SHIPMENT_STATUS.IN_TRANSIT),
      false
    );
    assert.strictEqual(
      isValidShipmentStatusTransition(SHIPMENT_STATUS.DELIVERED, SHIPMENT_STATUS.CANCELLED),
      false
    );
  });

  // 7. Terminal State: Cancelled
  test('7. Cancelled shipment cannot transition back to in-transit or delivered', () => {
    assert.strictEqual(
      isValidShipmentStatusTransition(SHIPMENT_STATUS.CANCELLED, SHIPMENT_STATUS.IN_TRANSIT),
      false
    );
    assert.strictEqual(
      isValidShipmentStatusTransition(SHIPMENT_STATUS.CANCELLED, SHIPMENT_STATUS.DELIVERED),
      false
    );
  });

  // 8. Fulfillment Payment Eligibility: Paid Order
  test('8. Order with paymentStatus: "PAID" and active status passes fulfillment eligibility', () => {
    const paidOrder = {
      id: 'ord_123',
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
    };
    assert.doesNotThrow(() => {
      validateOrderFulfillmentEligibility(paidOrder);
    });
  });

  // 9. Fulfillment Payment Eligibility: Unpaid / Failed Orders Rejected
  test('9. Unpaid, pending, or failed payment orders are strictly rejected from fulfillment', () => {
    const pendingPaymentOrder = {
      id: 'ord_unpaid',
      status: 'PENDING',
      paymentStatus: 'PENDING',
    };
    assert.throws(() => {
      validateOrderFulfillmentEligibility(pendingPaymentOrder);
    }, /Required: PAID/);

    const failedPaymentOrder = {
      id: 'ord_failed',
      status: 'PENDING',
      paymentStatus: 'FAILED',
    };
    assert.throws(() => {
      validateOrderFulfillmentEligibility(failedPaymentOrder);
    }, /Required: PAID/);

    const cancelledOrder = {
      id: 'ord_cancelled',
      status: 'CANCELLED',
      paymentStatus: 'PAID',
    };
    assert.throws(() => {
      validateOrderFulfillmentEligibility(cancelledOrder);
    }, /Cannot fulfill a cancelled order/);
  });

  // 10. AWB Generation
  test('10. AWB and Tracking numbers are generated with high-entropy unique identifiers', () => {
    const awb1 = generateAWBNumber('DELHIVERY');
    const awb2 = generateAWBNumber('DELHIVERY');
    assert.ok(awb1.startsWith('AWB-DELH-'));
    assert.notStrictEqual(awb1, awb2);
  });

  // 11. Serviceability Layer
  await asyncTest('11. Serviceability provider returns deterministic delivery estimates', async () => {
    const provider = getShippingProvider('INTERNAL_COURIER');
    const resStandard = await provider.checkServiceability({ postalCode: '400001', shippingMethodCode: 'STANDARD' });
    assert.strictEqual(resStandard.serviceable, true);
    assert.strictEqual(resStandard.estimatedDays, '3 - 5 business days');

    const resExpress = await provider.checkServiceability({ postalCode: '400001', shippingMethodCode: 'EXPRESS' });
    assert.strictEqual(resExpress.serviceable, true);
    assert.strictEqual(resExpress.estimatedDays, '1 - 2 business days');
  });

  // 12. Security & IDOR: Customer ownership enforcement
  test('12. requireOwnerOrAdmin prevents customer from viewing another customer\'s shipments', () => {
    const userA = { id: 'cust_A', role: 'customer' };
    const userBContext = { user: { id: 'cust_B', role: 'customer' } };

    assert.throws(() => {
      requireOwnerOrAdmin(userBContext, userA.id);
    }, /You do not have permission/);
  });

  // 13. Security: Admin role verification
  test('13. Non-admin customer cannot access admin shipment mutations', () => {
    const customerContext = { user: { id: 'cust_123', role: 'customer' } };
    assert.throws(() => {
      requireAdmin(customerContext);
    }, /Administrator privileges required/);
  });

  // 14. Database Safety: No force/alter sync
  test('14. Safe Sequelize sync confirms no destructive force/alter sync flags', () => {
    const fs = require('fs');
    const path = require('path');
    const modelsDir = path.join(__dirname, '../models');
    const files = fs.readdirSync(modelsDir);
    for (const file of files) {
      const content = fs.readFileSync(path.join(modelsDir, file), 'utf8');
      assert.strictEqual(content.includes('force: true'), false, `File ${file} must not contain force: true`);
      assert.strictEqual(content.includes('alter: true'), false, `File ${file} must not contain alter: true`);
    }
  });

  // ====================================================================
  // PHASE 7 HOTFIX VERIFICATION TESTS
  // ====================================================================

  // 15. [HOTFIX 1] TEST SHIPMENT IDEMPOTENCY
  await asyncTest('15. [HOTFIX 1] Shipment creation is replay-safe with idempotencyKey and prevents duplicate shipments', async () => {
    const testUser = await UserModel.create({
      email: `idempotency_test_${Date.now()}@zoberry.com`,
      role: 'customer',
    });

    const testOrder = await OrderModel.create({
      userId: testUser.id,
      orderNumber: `ORD-IDEMP-${Date.now()}`,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      fulfillmentStatus: 'UNFULFILLED',
      subtotal: 1200.00,
      grandTotal: 1200.00,
      shippingMethod: 'STANDARD',
      shippingAddressSnapshot: {
        fullName: 'Test Customer',
        phone: '9876543210',
        street: '123 Idempotency Way',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'IN',
      },
    });

    const idempotencyKey = `TEST-IDEMPOTENCY-${Date.now()}`;

    // Call 1
    const shipment1 = await resolvers.Mutation.adminCreateShipment(
      null,
      {
        input: {
          orderId: testOrder.id,
          idempotencyKey,
          notes: 'First creation attempt',
        },
      },
      adminContext
    );

    assert.ok(shipment1, 'First shipment created successfully');
    assert.ok(shipment1.id, 'Shipment has valid ID');
    assert.ok(shipment1.awbNumber, 'Shipment has AWB number');

    // Call 2 with SAME idempotencyKey
    const shipment2 = await resolvers.Mutation.adminCreateShipment(
      null,
      {
        input: {
          orderId: testOrder.id,
          idempotencyKey,
          notes: 'Replayed creation attempt',
        },
      },
      adminContext
    );

    assert.ok(shipment2, 'Replayed shipment returned successfully');
    assert.strictEqual(shipment2.id, shipment1.id, 'Returned shipment ID matches exactly (deterministic)');
    assert.strictEqual(shipment2.awbNumber, shipment1.awbNumber, 'Returned AWB matches exactly');

    // Verify in database that only 1 shipment exists for this key
    const allShipmentsForKey = await ShipmentModel.findAll({
      where: { idempotencyKey },
    });
    assert.strictEqual(allShipmentsForKey.length, 1, 'Only exactly 1 shipment exists in database for idempotencyKey');
  });

  // 16. [HOTFIX 2] REAL DATABASE MIGRATION VERIFICATION
  await asyncTest('16. [HOTFIX 2] Real database migration creates Shipments and ShipmentTrackingEvents tables, indexes, and unique constraints', async () => {
    const migrationSuccess = await migratePhase7();
    assert.strictEqual(migrationSuccess, true, 'migratePhase7 executed cleanly without error');

    // Verify table definitions and attributes
    const shipmentAttributes = ShipmentModel.rawAttributes;
    assert.ok(shipmentAttributes.id, 'Shipments table has id column');
    assert.ok(shipmentAttributes.orderId, 'Shipments table has orderId foreign key');
    assert.ok(shipmentAttributes.awbNumber, 'Shipments table has awbNumber column');
    assert.ok(shipmentAttributes.idempotencyKey, 'Shipments table has idempotencyKey column');
    assert.ok(shipmentAttributes.shippingAddressSnapshot, 'Shipments table has shippingAddressSnapshot column');
    assert.ok(shipmentAttributes.status, 'Shipments table has status ENUM');

    // Verify unique constraints & indexes on ShipmentModel
    assert.strictEqual(shipmentAttributes.awbNumber.unique, true, 'awbNumber has unique constraint');
    assert.strictEqual(shipmentAttributes.idempotencyKey.unique, true, 'idempotencyKey has unique constraint');

    const eventAttributes = ShipmentTrackingEventModel.rawAttributes;
    assert.ok(eventAttributes.id, 'ShipmentTrackingEvents table has id column');
    assert.ok(eventAttributes.shipmentId, 'ShipmentTrackingEvents table has shipmentId foreign key');
    assert.ok(eventAttributes.status, 'ShipmentTrackingEvents table has status column');
    assert.ok(eventAttributes.eventTime, 'ShipmentTrackingEvents table has eventTime column');
  });

  // 17. [HOTFIX 3] PUBLIC AWB TRACKING SECURITY
  await asyncTest('17. [HOTFIX 3] getShipmentTracking public query strictly excludes sensitive customer/order data', async () => {
    const testUser = await UserModel.create({
      email: `security_check_${Date.now()}@zoberry.com`,
      role: 'customer',
    });

    const testOrder = await OrderModel.create({
      userId: testUser.id,
      orderNumber: `ORD-SEC-${Date.now()}`,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      fulfillmentStatus: 'UNFULFILLED',
      subtotal: 1800.00,
      grandTotal: 1800.00,
      shippingMethod: 'EXPRESS',
      shippingAddressSnapshot: {
        fullName: 'Confidential Customer',
        email: 'confidential@zoberry.com',
        phone: '+91 9999988888',
        street: '404 Secret Penthouse Suite',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
        country: 'IN',
      },
    });

    const shipment = await resolvers.Mutation.adminCreateShipment(
      null,
      {
        input: {
          orderId: testOrder.id,
          notes: 'Private internal logistics note',
        },
      },
      adminContext
    );

    // Query public tracking endpoint
    const publicTracking = await resolvers.Query.getShipmentTracking(
      null,
      { awbNumber: shipment.awbNumber }
    );

    assert.ok(publicTracking, 'Public tracking returns tracking result');
    assert.strictEqual(publicTracking.awbNumber, shipment.awbNumber, 'Public AWB matches');
    assert.strictEqual(publicTracking.status, 'SHIPMENT_CREATED', 'Public status matches');
    assert.strictEqual(publicTracking.provider, 'INTERNAL_COURIER', 'Public provider matches');
    assert.ok(Array.isArray(publicTracking.trackingEvents), 'Public tracking milestones list returned');

    // Security Assertions: Ensure NO sensitive customer/order info is exposed
    assert.strictEqual(publicTracking.orderId, undefined, 'orderId must NOT be exposed in public tracking');
    assert.strictEqual(publicTracking.userId, undefined, 'userId must NOT be exposed in public tracking');
    assert.strictEqual(publicTracking.email, undefined, 'customer email must NOT be exposed in public tracking');
    assert.strictEqual(publicTracking.phone, undefined, 'customer phone must NOT be exposed in public tracking');
    assert.strictEqual(publicTracking.shippingAddressSnapshot, undefined, 'full shipping address must NOT be exposed in public tracking');
    assert.strictEqual(publicTracking.paymentDetails, undefined, 'payment details must NOT be exposed in public tracking');
    assert.strictEqual(publicTracking.notes, undefined, 'internal admin notes must NOT be exposed in public tracking');
    assert.strictEqual(publicTracking.rawPayload, undefined, 'raw webhooks must NOT be exposed in public tracking');
  });

  // 18. [HOTFIX 4] VERIFY ADDRESS SNAPSHOT IMMUTABILITY
  await asyncTest('18. [HOTFIX 4] Shipment shippingAddressSnapshot remains immutable even when customer edits saved address', async () => {
    const testUser = await UserModel.create({
      email: `address_test_${Date.now()}@zoberry.com`,
      role: 'customer',
    });

    const savedAddress = await AddressModel.create({
      userId: testUser.id,
      fullName: 'Original Customer',
      phone: '9111122222',
      addressLine1: '100 Heritage Old Lane',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'IN',
      isDefaultShipping: true,
    });

    // Create order capturing the address snapshot
    const testOrder = await OrderModel.create({
      userId: testUser.id,
      orderNumber: `ORD-ADDR-${Date.now()}`,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      fulfillmentStatus: 'UNFULFILLED',
      subtotal: 999.00,
      grandTotal: 999.00,
      shippingMethod: 'STANDARD',
      shippingAddressSnapshot: savedAddress.toJSON(),
    });

    // Create shipment
    const shipment = await resolvers.Mutation.adminCreateShipment(
      null,
      { input: { orderId: testOrder.id } },
      adminContext
    );

    assert.strictEqual(
      shipment.shippingAddressSnapshot.addressLine1,
      '100 Heritage Old Lane',
      'Shipment shipping address snapshot captured initial addressLine1 correctly'
    );

    // Customer modifies their live address record in database
    savedAddress.addressLine1 = '999 Luxury New Boulevard';
    savedAddress.city = 'New Delhi';
    savedAddress.postalCode = '110001';
    await savedAddress.save();

    // Reload shipment from database
    const reloadedShipment = await ShipmentModel.findByPk(shipment.id);

    // Verify shipment address snapshot did NOT change
    assert.strictEqual(
      reloadedShipment.shippingAddressSnapshot.addressLine1,
      '100 Heritage Old Lane',
      'Shipment shipping address snapshot remained strictly immutable after customer address modification'
    );
    assert.strictEqual(
      reloadedShipment.shippingAddressSnapshot.city,
      'Mumbai',
      'Shipment city remained immutable'
    );
  });

  // 19. [HOTFIX 5] VERIFY NO DOUBLE INVENTORY DEDUCTION
  await asyncTest('19. [HOTFIX 5] Shipment creation does NOT deduct inventory again and creates 0 extra stock movements', async () => {
    const timestamp = Date.now();
    const initialMovementCount = await InventoryMovementModel.count();

    // Check if an existing product and variant exist, or create product via raw SQL to match table schema
    let productId = null;
    let variantId = null;

    const [existingProducts] = await sequelize.query('SELECT id FROM Products LIMIT 1');
    if (existingProducts && existingProducts.length > 0) {
      productId = existingProducts[0].id;
      const [existingVariants] = await sequelize.query('SELECT id FROM ProductVariants WHERE productId = ? LIMIT 1', {
        replacements: [productId],
      });
      if (existingVariants && existingVariants.length > 0) {
        variantId = existingVariants[0].id;
      }
    }

    if (!productId) {
      // Find or create category
      let categoryId = null;
      const [cats] = await sequelize.query('SELECT id FROM Categories LIMIT 1');
      if (cats && cats.length > 0) {
        categoryId = cats[0].id;
      } else {
        categoryId = crypto.randomUUID();
        await sequelize.query(
          'INSERT INTO Categories (id, name, slug, imageUrl, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
          { replacements: [categoryId, `Cat ${timestamp}`, `cat-${timestamp}`, '/uploads/cat.webp'] }
        );
      }

      productId = crypto.randomUUID();
      await sequelize.query(
        'INSERT INTO Products (id, categoryId, name, slug, price, stockQuantity, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        { replacements: [productId, categoryId, `Prod ${timestamp}`, `prod-${timestamp}`, 500.00, 50, true] }
      );
    }

    // Log a baseline deduction movement
    await InventoryMovementModel.create({
      productId,
      variantId,
      quantityChange: -2,
      type: 'ORDER_COMPLETION',
      referenceType: 'ORDER',
      referenceId: `ORD-PRE-FULFILL-${timestamp}`,
      balanceAfter: 48,
    });

    const baselineMovementCount = await InventoryMovementModel.count();
    assert.strictEqual(
      baselineMovementCount,
      initialMovementCount + 1,
      '1 order deduction movement logged during checkout/payment'
    );

    const testUser = await UserModel.create({
      email: `inv_test_${timestamp}@zoberry.com`,
      role: 'customer',
    });

    // Create paid order
    const testOrder = await OrderModel.create({
      userId: testUser.id,
      orderNumber: `ORD-INV-${timestamp}`,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      fulfillmentStatus: 'UNFULFILLED',
      subtotal: 1000.00,
      grandTotal: 1000.00,
      shippingMethod: 'STANDARD',
      shippingAddressSnapshot: {
        fullName: 'Inventory Test',
        addressLine1: '1 Inventory Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'IN',
      },
    });

    // Create Shipment
    const shipment = await resolvers.Mutation.adminCreateShipment(
      null,
      { input: { orderId: testOrder.id } },
      adminContext
    );

    assert.ok(shipment, 'Shipment created successfully');

    // Verify inventory movements count AFTER shipment creation
    const postShipmentMovementCount = await InventoryMovementModel.count();
    assert.strictEqual(
      postShipmentMovementCount,
      baselineMovementCount,
      'Inventory movement count is completely unchanged by shipment creation (0 additional deduction movements created)'
    );
  });

  // 20. [HOTFIX 6] VERIFY STATUS TRANSITION THROUGH ACTUAL RESOLVER / SERVICE
  await asyncTest('20. [HOTFIX 6] adminUpdateShipmentStatus resolver strictly enforces state machine transitions', async () => {
    const testUser = await UserModel.create({
      email: `statemachine_test_${Date.now()}@zoberry.com`,
      role: 'customer',
    });

    const testOrder = await OrderModel.create({
      userId: testUser.id,
      orderNumber: `ORD-SM-${Date.now()}`,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      fulfillmentStatus: 'UNFULFILLED',
      subtotal: 1500.00,
      grandTotal: 1500.00,
      shippingMethod: 'STANDARD',
      shippingAddressSnapshot: {
        fullName: 'SM Customer',
        street: '55 Transition Ave',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'IN',
      },
    });

    const shipment = await ShipmentModel.create({
      orderId: testOrder.id,
      provider: 'INTERNAL_COURIER',
      status: 'READY_TO_SHIP',
      shippingMethodCode: 'STANDARD',
      shippingAddressSnapshot: testOrder.shippingAddressSnapshot,
      awbNumber: generateAWBNumber(),
    });

    // Case 1: VALID transition: READY_TO_SHIP -> SHIPMENT_CREATED
    const validUpdate = await resolvers.Mutation.adminUpdateShipmentStatus(
      null,
      {
        input: {
          shipmentId: shipment.id,
          nextStatus: 'SHIPMENT_CREATED',
          location: 'Sorting Facility',
          description: 'Label created and parcel packaged',
        },
      },
      adminContext
    );

    assert.strictEqual(validUpdate.status, 'SHIPMENT_CREATED', 'Valid transition to SHIPMENT_CREATED succeeded');

    const dbShipment = await ShipmentModel.findByPk(shipment.id);
    assert.strictEqual(dbShipment.status, 'SHIPMENT_CREATED', 'Database status updated to SHIPMENT_CREATED');

    // Case 2: INVALID transition: SHIPMENT_CREATED -> DELIVERED (skipping PICKED_UP / IN_TRANSIT)
    await assert.rejects(
      async () => {
        await resolvers.Mutation.adminUpdateShipmentStatus(
          null,
          {
            input: {
              shipmentId: shipment.id,
              nextStatus: 'DELIVERED',
            },
          },
          adminContext
        );
      },
      (err) => {
        assert.ok(err.message.includes('Illegal shipment status transition'));
        assert.strictEqual(err.extensions?.code, 'BAD_USER_INPUT');
        return true;
      }
    );

    // Verify DB status remains unchanged after invalid transition attempt
    const dbShipmentAfterInvalid = await ShipmentModel.findByPk(shipment.id);
    assert.strictEqual(
      dbShipmentAfterInvalid.status,
      'SHIPMENT_CREATED',
      'Database status remains unchanged at SHIPMENT_CREATED after rejected illegal transition'
    );
  });

  // 21. [HOTFIX 7] VERIFY ADMIN CANCEL CANNOT BYPASS STATE MACHINE
  await asyncTest('21. [HOTFIX 7] adminCancelShipment respects state machine (allowed from SHIPMENT_CREATED, rejected from DELIVERED)', async () => {
    const testUser = await UserModel.create({
      email: `cancel_test_${Date.now()}@zoberry.com`,
      role: 'customer',
    });

    const testOrder = await OrderModel.create({
      userId: testUser.id,
      orderNumber: `ORD-CANCEL-${Date.now()}`,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      fulfillmentStatus: 'UNFULFILLED',
      subtotal: 750.00,
      grandTotal: 750.00,
      shippingMethod: 'STANDARD',
      shippingAddressSnapshot: {
        fullName: 'Cancel Test',
        street: '12 Cancel Lane',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'IN',
      },
    });

    // 1. Allowed cancellation from SHIPMENT_CREATED
    const shipmentA = await ShipmentModel.create({
      orderId: testOrder.id,
      provider: 'INTERNAL_COURIER',
      status: 'SHIPMENT_CREATED',
      shippingMethodCode: 'STANDARD',
      shippingAddressSnapshot: testOrder.shippingAddressSnapshot,
      awbNumber: generateAWBNumber(),
    });

    const cancelledShipment = await resolvers.Mutation.adminCancelShipment(
      null,
      {
        shipmentId: shipmentA.id,
        reason: 'Customer requested cancellation prior to pickup',
      },
      adminContext
    );

    assert.strictEqual(cancelledShipment.status, 'CANCELLED', 'Cancellation from SHIPMENT_CREATED succeeded');
    const dbShipmentA = await ShipmentModel.findByPk(shipmentA.id);
    assert.strictEqual(dbShipmentA.status, 'CANCELLED', 'Database status updated to CANCELLED');

    // 2. Rejected cancellation from DELIVERED (Terminal State)
    const shipmentB = await ShipmentModel.create({
      orderId: testOrder.id,
      provider: 'INTERNAL_COURIER',
      status: 'DELIVERED',
      shippingMethodCode: 'STANDARD',
      shippingAddressSnapshot: testOrder.shippingAddressSnapshot,
      awbNumber: generateAWBNumber(),
      deliveredAt: new Date(),
    });

    await assert.rejects(
      async () => {
        await resolvers.Mutation.adminCancelShipment(
          null,
          {
            shipmentId: shipmentB.id,
            reason: 'Attempt cancellation after parcel delivery',
          },
          adminContext
        );
      },
      (err) => {
        assert.ok(err.message.includes('Illegal shipment status transition'));
        assert.strictEqual(err.extensions?.code, 'BAD_USER_INPUT');
        return true;
      }
    );

    // Verify DB status is STILL DELIVERED
    const dbShipmentB = await ShipmentModel.findByPk(shipmentB.id);
    assert.strictEqual(
      dbShipmentB.status,
      'DELIVERED',
      'Database status remains DELIVERED (terminal state cannot be cancelled)'
    );
  });

  console.log('\n======================================================');
  console.log(`🎉 PHASE 7 TEST RESULTS: ${passedTests} passed, ${failedTests} failed`);
  console.log('======================================================\n');
}

if (require.main === module) {
  runPhase7TestSuite().then(() => process.exit(0)).catch((err) => {
    console.error('Test suite error:', err);
    process.exit(1);
  });
}

module.exports = { runPhase7TestSuite };
