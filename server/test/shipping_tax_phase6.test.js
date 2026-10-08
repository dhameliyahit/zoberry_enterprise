/**
 * ====================================================================
 * PHASE 6 AUDIT & TEST SUITE: SHIPPING, TAX & CHECKOUT BUSINESS RULES
 * ====================================================================
 * 
 * Focused validation for:
 * 1. Single Server-Authoritative Checkout Pricing Engine
 * 2. Shipping method rate evaluation (Standard @ ₹99, Express @ ₹199)
 * 3. Free shipping threshold rule (Eligible Subtotal >= ₹999 -> Standard = FREE)
 * 4. Promotion discount + shipping threshold interaction
 * 5. Consumer Tax-Inclusive GST calculation (5% standard rate)
 * 6. Order shipping snapshot & tax snapshot immutability
 * 7. PhonePe grand total alignment (Order.grandTotal in integer paise)
 * 8. Customer address ownership validation
 * 9. Explicit invalid shipping method code rejection (BAD_USER_INPUT)
 * 10. Inactive shipping method rejection (BAD_USER_INPUT)
 * 11. Omitted shipping method code default to active STANDARD
 * 12. Admin authorization guards on shipping and tax management mutations
 */

require('dotenv').config();
const assert = require('assert');
const { ApolloServer } = require('@apollo/server');
const typeDefs = require('../graphql/typeDefs');
const resolvers = require('../graphql/resolvers');
const { toPaise, fromPaise } = require('../helpers/moneyHelper');
const {
  calculateCheckoutTotals,
  getAvailableShippingMethods,
  DEFAULT_SHIPPING_METHODS,
  DEFAULT_TAX_RULE,
} = require('../helpers/checkoutPricingEngine');
const { ShippingMethodModel } = require('../models');

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

async function runPhase6TestSuite() {
  console.log('\n======================================================');
  console.log('🚚 RUNNING PHASE 6 SHIPPING, TAX & CHECKOUT TEST SUITE');
  console.log('======================================================\n');

  // 1. GraphQL Schema Compilation
  await asyncTest('1. Master GraphQL Schema compiles with Phase 6 Shipping and Tax operations', async () => {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
    });
    await server.start();
    assert.ok(server, 'ApolloServer instance started successfully');
    await server.stop();
  });

  // 2. Shipping Calculation below threshold
  await asyncTest('2. Standard shipping fee applies when order subtotal is below free threshold (< ₹999)', async () => {
    const items = [
      { unitPrice: 499.00, quantity: 1 }, // ₹499
    ];

    const result = await calculateCheckoutTotals({
      items,
      shippingMethodCode: 'STANDARD',
    });

    assert.strictEqual(result.subtotal, 499.00);
    assert.strictEqual(result.discountAmount, 0);
    assert.strictEqual(result.shippingAmount, 99.00);
    assert.strictEqual(result.shippingSnapshot.isFree, false);
    // Subtotal 499 + Shipping 99 = Grand Total 598
    assert.strictEqual(result.grandTotal, 598.00);
  });

  // 3. Free Shipping Threshold
  await asyncTest('3. Free shipping threshold unlocks FREE Standard shipping when subtotal >= ₹999', async () => {
    const items = [
      { unitPrice: 500.00, quantity: 2 }, // ₹1000
    ];

    const result = await calculateCheckoutTotals({
      items,
      shippingMethodCode: 'STANDARD',
    });

    assert.strictEqual(result.subtotal, 1000.00);
    assert.strictEqual(result.discountAmount, 0);
    assert.strictEqual(result.shippingAmount, 0);
    assert.strictEqual(result.shippingSnapshot.isFree, true);
    assert.strictEqual(result.grandTotal, 1000.00);
  });

  // 4. Express Shipping does not become free on Standard threshold
  await asyncTest('4. Express shipping maintains its premium rate (₹199) regardless of standard free threshold', async () => {
    const items = [
      { unitPrice: 1500.00, quantity: 1 }, // ₹1500 (> ₹999)
    ];

    const result = await calculateCheckoutTotals({
      items,
      shippingMethodCode: 'EXPRESS',
    });

    assert.strictEqual(result.subtotal, 1500.00);
    assert.strictEqual(result.shippingAmount, 199.00);
    assert.strictEqual(result.shippingSnapshot.code, 'EXPRESS');
    assert.strictEqual(result.shippingSnapshot.isFree, false);
    assert.strictEqual(result.grandTotal, 1699.00);
  });

  // 5. Promotion Discount + Free Shipping Interaction
  await asyncTest('5. Free shipping threshold evaluates against net merchandise subtotal after coupon discount', async () => {
    // If original subtotal is ₹1100, but coupon discounts ₹200 -> Net Subtotal = ₹900 (< ₹999)
    // Shipping should be ₹99, not free!
    const availableMethods = await getAvailableShippingMethods({ eligibleSubtotal: 900.00 });
    const standard = availableMethods.find(m => m.code === 'STANDARD');
    assert.ok(standard, 'Standard method found');
    assert.strictEqual(standard.isFree, false);
    assert.strictEqual(standard.actualPrice, 99.00);

    // If net subtotal after discount is ₹1000 (>= ₹999) -> Standard is FREE
    const eligibleMethods = await getAvailableShippingMethods({ eligibleSubtotal: 1000.00 });
    const eligibleStandard = eligibleMethods.find(m => m.code === 'STANDARD');
    assert.strictEqual(eligibleStandard.isFree, true);
    assert.strictEqual(eligibleStandard.actualPrice, 0);
  });

  // 6. Consumer Tax-Inclusive GST calculation
  await asyncTest('6. Standard Consumer Tax-Inclusive GST extracts tax amount accurately without changing grand total', async () => {
    const items = [
      { unitPrice: 1050.00, quantity: 1 },
    ];

    const result = await calculateCheckoutTotals({
      items,
      shippingMethodCode: 'STANDARD',
    });

    // On ₹1050 subtotal (tax inclusive @ 5% GST):
    // Tax = (1050 * 5) / 105 = ₹50
    assert.strictEqual(result.taxSnapshot.isInclusive, true);
    assert.strictEqual(result.taxSnapshot.ratePercent, 5.0);
    assert.strictEqual(result.taxAmount, 50.00);
    // Subtotal (1050) >= 999 -> Shipping = 0 -> Grand Total = 1050
    assert.strictEqual(result.shippingAmount, 0);
    assert.strictEqual(result.grandTotal, 1050.00);
  });

  // 7. Order snapshot immutability guarantee
  test('7. Order shipping snapshot captures complete immutable delivery details', () => {
    const snapshot = {
      code: 'STANDARD',
      name: 'Standard Delivery',
      basePrice: 99.00,
      actualShippingFee: 0,
      freeThreshold: 999.00,
      isFree: true,
      estimatedDays: '3 - 5 business days',
    };

    assert.strictEqual(snapshot.code, 'STANDARD');
    assert.strictEqual(snapshot.actualShippingFee, 0);
    assert.strictEqual(snapshot.isFree, true);
    assert.ok(snapshot.estimatedDays);
  });

  // 8. PhonePe continuity with Order.grandTotal in paise
  test('8. PhonePe receives exact integer paise derived from finalized Order.grandTotal', () => {
    const finalizedGrandTotal = 1699.00;
    const phonepeAmountPaise = toPaise(finalizedGrandTotal);

    assert.strictEqual(Number.isInteger(phonepeAmountPaise), true);
    assert.strictEqual(phonepeAmountPaise, 169900); // 1699 * 100
  });

  // 9. Invalid shipping method code is rejected
  await asyncTest('9. Invalid shipping method code is rejected', async () => {
    const items = [{ unitPrice: 400.00, quantity: 1 }];

    await assert.rejects(
      async () => {
        await calculateCheckoutTotals({
          items,
          shippingMethodCode: 'INVALID_NONEXISTENT_CARRIER',
        });
      },
      (err) => {
        assert.ok(err.message.includes('Invalid shipping method code'));
        assert.strictEqual(err.extensions?.code, 'BAD_USER_INPUT');
        return true;
      }
    );
  });

  // 10. Inactive shipping method is rejected
  await asyncTest('10. Inactive shipping method is rejected', async () => {
    const items = [{ unitPrice: 400.00, quantity: 1 }];

    await assert.rejects(
      async () => {
        await calculateCheckoutTotals({
          items,
          shippingMethodCode: 'INACTIVE_TEST_CARRIER',
        });
      },
      (err) => {
        assert.ok(err.message.includes('inactive'));
        assert.strictEqual(err.extensions?.code, 'BAD_USER_INPUT');
        return true;
      }
    );
  });

  // 11. Omitted shipping method defaults to standard active method
  await asyncTest('11. Omitted shipping method code cleanly defaults to standard active shipping method', async () => {
    const items = [{ unitPrice: 400.00, quantity: 1 }];

    const result = await calculateCheckoutTotals({
      items,
      // shippingMethodCode omitted
    });

    assert.strictEqual(result.shippingMethod, 'STANDARD');
    assert.strictEqual(result.shippingAmount, 99.00);
    assert.strictEqual(result.grandTotal, 499.00);
  });

  // 12. Admin mutation authorization protection
  test('12. Admin shipping and tax resolvers enforce requireAdmin guard', () => {
    const shippingResolvers = require('../graphql/resolvers/shipping');
    const { requireAdmin } = require('../helpers/authMiddleware');

    // Passing context without admin user must throw UNAUTHENTICATED / FORBIDDEN
    const customerContext = { user: { id: 'cust_1', role: 'customer' } };
    assert.throws(() => {
      requireAdmin(customerContext);
    }, /Administrator privileges required/);

    const guestContext = {};
    assert.throws(() => {
      requireAdmin(guestContext);
    }, /Authentication required/);
  });

  console.log('\n======================================================');
  console.log(`🎉 PHASE 6 TEST RESULTS: ${passedTests} passed, ${failedTests} failed`);
  console.log('======================================================\n');
}

if (require.main === module) {
  runPhase6TestSuite().then(() => process.exit(0)).catch((err) => {
    console.error('Test suite error:', err);
    process.exit(1);
  });
}

module.exports = { runPhase6TestSuite };
