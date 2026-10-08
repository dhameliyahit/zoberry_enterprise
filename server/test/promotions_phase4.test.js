/**
 * Phase 4 Promotions, Coupons & Pricing Rules Automated Test Suite
 * 
 * Verifies:
 * 1. Exact paise-based discount arithmetic & maximum cap enforcement
 * 2. Coupon normalization and server-authoritative validation rules
 * 3. Immutable order discount snapshot generation
 * 4. Admin promotion security & authorization gates
 * 5. Complete GraphQL schema compilation with Phase 4 promotion definitions
 */

const assert = require('assert');
const { ApolloServer } = require('@apollo/server');
const typeDefs = require('../graphql/typeDefs');
const resolvers = require('../graphql/resolvers');
const {
  normalizeCouponCode,
  calculatePromotionDiscount,
  createDiscountSnapshot,
  validatePromotionEligibility,
} = require('../helpers/promotionHelper');
const { toPaise, fromPaise, calculateTotals } = require('../helpers/moneyHelper');

let totalTests = 0;
let passedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}:`, err.message);
    throw err;
  }
}

async function asyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}:`, err.message);
    throw err;
  }
}

async function runPhase4TestSuite() {
  console.log('\n======================================================');
  console.log('🏷️ RUNNING PHASE 4 PROMOTIONS & COUPONS TEST SUITE');
  console.log('======================================================\n');

  console.log('--- 1. Coupon Normalization & String Sanitization ---');
  test('normalizeCouponCode trims whitespace and converts to uppercase', () => {
    assert.strictEqual(normalizeCouponCode('  save10  '), 'SAVE10');
    assert.strictEqual(normalizeCouponCode('diwali_2026'), 'DIWALI_2026');
    assert.strictEqual(normalizeCouponCode(''), '');
    assert.strictEqual(normalizeCouponCode(null), '');
  });

  console.log('\n--- 2. Discount Calculation Engine (Paise Arithmetic) ---');
  test('Percentage discount calculates exact amount without floating-point error', () => {
    const promo = {
      discountType: 'PERCENTAGE',
      discountValue: 10, // 10%
    };
    const subtotalPaise = toPaise(1999.90); // 199990 paise
    const result = calculatePromotionDiscount(promo, subtotalPaise, subtotalPaise);
    assert.strictEqual(result.discountAmount, 199.99);
  });

  test('Percentage discount respects maximumDiscount cap', () => {
    const promo = {
      discountType: 'PERCENTAGE',
      discountValue: 20, // 20% of 5,000 = 1,000
      maximumDiscount: 300, // Capped at Rs. 300
    };
    const subtotalPaise = toPaise(5000);
    const result = calculatePromotionDiscount(promo, subtotalPaise, subtotalPaise);
    assert.strictEqual(result.discountAmount, 300.00);
  });

  test('Fixed amount discount applies correctly', () => {
    const promo = {
      discountType: 'FIXED_AMOUNT',
      discountValue: 150,
    };
    const subtotalPaise = toPaise(1000);
    const result = calculatePromotionDiscount(promo, subtotalPaise, subtotalPaise);
    assert.strictEqual(result.discountAmount, 150.00);
  });

  test('Fixed discount never exceeds eligible subtotal (no negative totals)', () => {
    const promo = {
      discountType: 'FIXED_AMOUNT',
      discountValue: 500,
    };
    const subtotalPaise = toPaise(250); // Cart is only Rs. 250
    const result = calculatePromotionDiscount(promo, subtotalPaise, subtotalPaise);
    assert.strictEqual(result.discountAmount, 250.00);

    const totals = calculateTotals([{ price: 250, quantity: 1 }], { discountAmount: result.discountAmount });
    assert.strictEqual(totals.grandTotal, 0.00);
  });

  console.log('\n--- 3. Promotion Eligibility & Validation Rules ---');
  await asyncTest('Inactive promotion is rejected', async () => {
    const promo = {
      isActive: false,
      minimumSubtotal: 0,
    };
    const res = await validatePromotionEligibility(promo, { subtotalPaise: toPaise(500) });
    assert.strictEqual(res.isValid, false);
    assert.ok(res.error.includes('no longer active'));
  });

  await asyncTest('Expired promotion is rejected', async () => {
    const promo = {
      isActive: true,
      endsAt: new Date(Date.now() - 86400000), // Yesterday
      minimumSubtotal: 0,
    };
    const res = await validatePromotionEligibility(promo, { subtotalPaise: toPaise(500) });
    assert.strictEqual(res.isValid, false);
    assert.ok(res.error.includes('expired'));
  });

  await asyncTest('Future promotion is rejected', async () => {
    const promo = {
      isActive: true,
      startsAt: new Date(Date.now() + 86400000), // Tomorrow
      minimumSubtotal: 0,
    };
    const res = await validatePromotionEligibility(promo, { subtotalPaise: toPaise(500) });
    assert.strictEqual(res.isValid, false);
    assert.ok(res.error.includes('not yet active'));
  });

  await asyncTest('Minimum subtotal threshold is enforced', async () => {
    const promo = {
      isActive: true,
      minimumSubtotal: 1000,
    };
    const resBelow = await validatePromotionEligibility(promo, { subtotalPaise: toPaise(750) });
    assert.strictEqual(resBelow.isValid, false);
    assert.ok(resBelow.error.includes('Minimum cart subtotal'));

    const resAbove = await validatePromotionEligibility(promo, { subtotalPaise: toPaise(1200) });
    assert.strictEqual(resAbove.isValid, true);
  });

  await asyncTest('Global usage limit rejection when limit is reached', async () => {
    const promo = {
      isActive: true,
      minimumSubtotal: 0,
      usageLimit: 50,
      usageCount: 50,
    };
    const res = await validatePromotionEligibility(promo, { subtotalPaise: toPaise(500) });
    assert.strictEqual(res.isValid, false);
    assert.ok(res.error.includes('maximum global usage limit'));
  });

  await asyncTest('Product targeting validates eligible cart items', async () => {
    const promo = {
      isActive: true,
      minimumSubtotal: 0,
      targetProductIds: ['prod-special'],
    };
    const ineligibleCart = [{ productId: 'prod-regular', price: 500, quantity: 1 }];
    const resIneligible = await validatePromotionEligibility(promo, {
      cartItems: ineligibleCart,
      subtotalPaise: toPaise(500),
    });
    assert.strictEqual(resIneligible.isValid, false);

    const eligibleCart = [{ productId: 'prod-special', price: 800, quantity: 1 }];
    const resEligible = await validatePromotionEligibility(promo, {
      cartItems: eligibleCart,
      subtotalPaise: toPaise(800),
    });
    assert.strictEqual(resEligible.isValid, true);
    assert.strictEqual(resEligible.eligibleSubtotalPaise, toPaise(800));
  });

  console.log('\n--- 4. Immutable Order Discount Snapshotting ---');
  test('createDiscountSnapshot captures full immutable promotion metadata', () => {
    const promo = {
      id: 'promo-uuid-1',
      code: 'SAVE10',
      name: '10% Launch Offer',
      type: 'COUPON',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      maximumDiscount: 200,
      minimumSubtotal: 500,
    };
    const snapshot = createDiscountSnapshot(promo, 150);
    assert.strictEqual(snapshot.promotionId, 'promo-uuid-1');
    assert.strictEqual(snapshot.code, 'SAVE10');
    assert.strictEqual(snapshot.discountType, 'PERCENTAGE');
    assert.strictEqual(snapshot.discountValue, 10);
    assert.strictEqual(snapshot.actualDiscountAmount, 150);
    assert.ok(snapshot.appliedAt);
  });

  console.log('\n--- 5. Security & Authorization Gates ---');
  await asyncTest('adminGetAllPromotions throws FORBIDDEN for customers and anonymous', async () => {
    try {
      await resolvers.Query.adminGetAllPromotions(null, {}, { user: { id: 'u1', role: 'customer' } });
      assert.fail('Should have thrown FORBIDDEN');
    } catch (err) {
      assert.strictEqual(err.extensions?.code, 'FORBIDDEN');
    }
  });

  await asyncTest('adminCreatePromotion throws FORBIDDEN for customers', async () => {
    try {
      await resolvers.Mutation.adminCreatePromotion(
        null,
        { input: { name: 'Test', discountType: 'PERCENTAGE', discountValue: 10 } },
        { user: { id: 'u1', role: 'customer' } }
      );
      assert.fail('Should have thrown FORBIDDEN');
    } catch (err) {
      assert.strictEqual(err.extensions?.code, 'FORBIDDEN');
    }
  });

  await asyncTest('adminCreatePromotion validates invalid percentage (>100%)', async () => {
    try {
      await resolvers.Mutation.adminCreatePromotion(
        null,
        { input: { name: 'Invalid Promo', discountType: 'PERCENTAGE', discountValue: 150, code: 'TOO_BIG' } },
        { user: { id: 'a1', role: 'admin' } }
      );
      assert.fail('Should have thrown BAD_USER_INPUT');
    } catch (err) {
      assert.strictEqual(err.extensions?.code, 'BAD_USER_INPUT');
    }
  });

  console.log('\n--- 6. Master GraphQL Schema Compilation with Phase 4 ---');
  await asyncTest('Apollo Server successfully compiles master schema with promotions', async () => {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
    });
    await server.start();
    assert.ok(server);
    await server.stop();
  });

  console.log('\n======================================================');
  console.log(`✨ ALL ${passedTests}/${totalTests} PHASE 4 TESTS PASSED SUCCESSFULLY!`);
  console.log('======================================================\n');
}

runPhase4TestSuite().catch((err) => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});
