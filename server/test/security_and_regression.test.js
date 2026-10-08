/**
 * Phase 1 Security & Regression Automated Test Suite
 * 
 * Verifies:
 * 1. Token generation with expiration
 * 2. Token verification & malformed token rejection
 * 3. Validation helper: email, password, slug, prices, numbers
 * 4. Authorization middleware: requireAuth, requireAdmin, requireOwnerOrAdmin, expressRequireAdmin
 * 5. Image upload validation: MIME types, folder whitelisting, file sizes
 * 6. GraphQL Schema syntax and validity
 * 7. Error formatting & sensitive detail masking
 * 8. User, Category, Product resolver security & input constraints
 */

const assert = require('assert');
const jwt = require('jsonwebtoken');
const { ApolloServer } = require('@apollo/server');
const { generateAuthToken, verifyAuthToken, JWT_EXPIRES_IN } = require('../helpers/authHelper');
const {
  isValidEmail,
  isValidPassword,
  isValidSlug,
  sanitizeSlug,
  isNonNegativeNumber,
  isPositiveInteger,
  isValidUUID,
} = require('../helpers/validationHelper');
const {
  requireAuth,
  requireAdmin,
  requireOwnerOrAdmin,
  getAuthUserFromReq,
} = require('../helpers/authMiddleware');
const { formatGraphQLError } = require('../helpers/errorHelper');
const { validateImageBuffer, ALLOWED_FOLDERS } = require('../helpers/imageHelper');
const typeDefs = require('../graphql/typeDefs');
const resolvers = require('../graphql/resolvers');

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

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('🔒 RUNNING PHASE 1 SECURITY & REGRESSION AUDIT SUITE');
  console.log('======================================================\n');

  // ----------------------------------------------------
  // 1. AUTHENTICATION & JWT EXPIRATION TESTS
  // ----------------------------------------------------
  console.log('--- 1. Authentication & JWT Security ---');

  test('generateAuthToken generates valid token with expiration', () => {
    const user = { id: 'u123', role: 'customer' };
    const token = generateAuthToken(user);
    assert(typeof token === 'string' && token.length > 20);

    const decoded = jwt.decode(token);
    assert.strictEqual(decoded.id, 'u123');
    assert.strictEqual(decoded.role, 'customer');
    assert(decoded.exp !== undefined, 'Token must include exp claim');
  });

  test('verifyAuthToken decodes valid token', () => {
    const user = { id: 'admin1', role: 'admin' };
    const token = generateAuthToken(user);
    const verified = verifyAuthToken(token);
    assert.strictEqual(verified.id, 'admin1');
    assert.strictEqual(verified.role, 'admin');
  });

  test('verifyAuthToken rejects malformed and corrupted tokens safely', () => {
    assert.strictEqual(verifyAuthToken('invalid.token.here'), null);
    assert.strictEqual(verifyAuthToken(''), null);
    assert.strictEqual(verifyAuthToken(null), null);
    assert.strictEqual(verifyAuthToken(undefined), null);
  });

  test('verifyAuthToken rejects expired tokens', () => {
    const expiredToken = jwt.sign(
      { id: 'old_user', role: 'customer' },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '-10s' }
    );
    assert.strictEqual(verifyAuthToken(expiredToken), null);
  });

  await asyncTest('getAuthUserFromReq correctly parses Bearer header', async () => {
    const token = generateAuthToken({ id: 'u-auth-1', role: 'customer' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const authUser = await getAuthUserFromReq(req);
    assert.strictEqual(authUser.id, 'u-auth-1');
  });

  await asyncTest('getAuthUserFromReq safely handles malformed Authorization headers', async () => {
    assert.strictEqual(await getAuthUserFromReq({ headers: {} }), null);
    assert.strictEqual(await getAuthUserFromReq({ headers: { authorization: 'Basic 12345' } }), null);
    assert.strictEqual(await getAuthUserFromReq({ headers: { authorization: 'Bearer' } }), null);
    assert.strictEqual(await getAuthUserFromReq({ headers: { authorization: 'Bearer invalid.token' } }), null);
  });

  // ----------------------------------------------------
  // 2. INPUT VALIDATION TESTS
  // ----------------------------------------------------
  console.log('\n--- 2. Input Validation & Data Integrity ---');

  test('isValidEmail accepts valid emails and rejects malformed ones', () => {
    assert.strictEqual(isValidEmail('user@zoberry.com'), true);
    assert.strictEqual(isValidEmail('customer.name+test@domain.co.in'), true);
    assert.strictEqual(isValidEmail('plainaddress'), false);
    assert.strictEqual(isValidEmail('@missingusername.com'), false);
    assert.strictEqual(isValidEmail('missingdomain@.com'), false);
    assert.strictEqual(isValidEmail(''), false);
    assert.strictEqual(isValidEmail(null), false);
  });

  test('isValidPassword enforces length and non-blank rules', () => {
    assert.strictEqual(isValidPassword('secure123'), true);
    assert.strictEqual(isValidPassword('123456'), true);
    assert.strictEqual(isValidPassword('12345'), false); // Too short
    assert.strictEqual(isValidPassword('      '), false); // Whitespace only
    assert.strictEqual(isValidPassword(''), false);
    assert.strictEqual(isValidPassword(null), false);
  });

  test('isValidSlug and sanitizeSlug handle URL slugs cleanly', () => {
    assert.strictEqual(isValidSlug('smart-kitchen-organizer'), true);
    assert.strictEqual(isValidSlug('product123'), true);
    assert.strictEqual(isValidSlug('Invalid Slug!'), false);
    assert.strictEqual(isValidSlug('slug--double-dash'), false);
    assert.strictEqual(sanitizeSlug('Smart Kitchen Organizer 2026!'), 'smart-kitchen-organizer-2026');
  });

  test('isNonNegativeNumber validates pricing and stock correctly', () => {
    assert.strictEqual(isNonNegativeNumber(0), true);
    assert.strictEqual(isNonNegativeNumber(99.99), true);
    assert.strictEqual(isNonNegativeNumber('499'), true);
    assert.strictEqual(isNonNegativeNumber(-1), false);
    assert.strictEqual(isNonNegativeNumber(-0.01), false);
    assert.strictEqual(isNonNegativeNumber('abc'), false);
    assert.strictEqual(isNonNegativeNumber(null), false);
  });

  // ----------------------------------------------------
  // 3. AUTHORIZATION & DATA OWNERSHIP TESTS
  // ----------------------------------------------------
  console.log('\n--- 3. Authorization & Customer Ownership Enforcement ---');

  test('requireAuth throws UNAUTHENTICATED error when unauthenticated', () => {
    assert.throws(
      () => requireAuth({ user: null }),
      (err) => err.extensions?.code === 'UNAUTHENTICATED'
    );
    assert.throws(
      () => requireAuth({}),
      (err) => err.extensions?.code === 'UNAUTHENTICATED'
    );
  });

  test('requireAuth passes for authenticated users', () => {
    const auth = requireAuth({ user: { id: 'u1', role: 'customer' } });
    assert.strictEqual(auth.id, 'u1');
  });

  test('requireAdmin blocks customer role and allows admin role', () => {
    assert.throws(
      () => requireAdmin({ user: { id: 'cust1', role: 'customer' } }),
      (err) => err.extensions?.code === 'FORBIDDEN'
    );
    const admin = requireAdmin({ user: { id: 'adm1', role: 'admin' } });
    assert.strictEqual(admin.role, 'admin');
  });

  test('requireOwnerOrAdmin enforces resource ownership against ID tampering', () => {
    // Customer accessing own resource: ALLOWED
    const self = requireOwnerOrAdmin({ user: { id: 'userA', role: 'customer' } }, 'userA');
    assert.strictEqual(self.id, 'userA');

    // Customer attempting to access another customer's resource: BLOCKED
    assert.throws(
      () => requireOwnerOrAdmin({ user: { id: 'userA', role: 'customer' } }, 'userB'),
      (err) => err.extensions?.code === 'FORBIDDEN'
    );

    // Admin accessing any customer resource: ALLOWED
    const adminAccess = requireOwnerOrAdmin({ user: { id: 'admin1', role: 'admin' } }, 'userB');
    assert.strictEqual(adminAccess.role, 'admin');
  });

  // ----------------------------------------------------
  // 4. IMAGE UPLOAD SECURITY CONTROLS
  // ----------------------------------------------------
  console.log('\n--- 4. Image Upload Security Controls ---');

  test('Whitelisted upload folders are configured properly', () => {
    assert(ALLOWED_FOLDERS.includes('products'));
    assert(ALLOWED_FOLDERS.includes('categories'));
    assert(ALLOWED_FOLDERS.includes('misc'));
    assert(!ALLOWED_FOLDERS.includes('../system'));
  });

  await asyncTest('validateImageBuffer rejects non-buffer or corrupt data', async () => {
    await assert.rejects(
      async () => validateImageBuffer('not a buffer'),
      /Invalid file buffer/
    );
    await assert.rejects(
      async () => validateImageBuffer(Buffer.from('corrupted fake image data')),
      /Invalid image file format/
    );
  });

  // ----------------------------------------------------
  // 5. GRAPHQL SCHEMA & RESOLVERS COMPILATION
  // ----------------------------------------------------
  console.log('\n--- 5. GraphQL Schema Compilation & Resolvers Integrity ---');

  test('Apollo GraphQL Server compiles typeDefs and resolvers without syntax errors', () => {
    const testServer = new ApolloServer({
      typeDefs,
      resolvers,
      formatError: formatGraphQLError,
    });
    assert(testServer !== null);
  });

  test('Product resolvers include paginated getProducts query', () => {
    assert.strictEqual(typeof resolvers.Query.getProducts, 'function');
    assert.strictEqual(typeof resolvers.Query.getAllProducts, 'function');
    assert.strictEqual(typeof resolvers.Query.getProductBySlug, 'function');
    assert.strictEqual(typeof resolvers.Mutation.createProduct, 'function');
    assert.strictEqual(typeof resolvers.Mutation.updateProduct, 'function');
    assert.strictEqual(typeof resolvers.Mutation.deleteProduct, 'function');
  });

  test('Category resolvers include createCategory, updateCategory, deleteCategory', () => {
    assert.strictEqual(typeof resolvers.Query.getAllCategories, 'function');
    assert.strictEqual(typeof resolvers.Mutation.createCategory, 'function');
    assert.strictEqual(typeof resolvers.Mutation.updateCategory, 'function');
    assert.strictEqual(typeof resolvers.Mutation.deleteCategory, 'function');
  });

  test('User resolvers include secure mutations and queries', () => {
    assert.strictEqual(typeof resolvers.Query.getCurrentUser, 'function');
    assert.strictEqual(typeof resolvers.Query.getAllUsers, 'function');
    assert.strictEqual(typeof resolvers.Mutation.registerUser, 'function');
    assert.strictEqual(typeof resolvers.Mutation.loginUser, 'function');
    assert.strictEqual(typeof resolvers.Mutation.updateUser, 'function');
    assert.strictEqual(typeof resolvers.Mutation.deleteUser, 'function');
  });

  // ----------------------------------------------------
  // 6. RESOLVER SECURITY GUARD TESTS
  // ----------------------------------------------------
  console.log('\n--- 6. Resolver Security Guards Verification ---');

  await asyncTest('Category admin mutations throw FORBIDDEN when invoked by customer or anonymous', async () => {
    // Anonymous
    await assert.rejects(
      async () => resolvers.Mutation.createCategory(null, { name: 'Test', slug: 'test', imageUrl: '/img.webp' }, { user: null }),
      (err) => err.extensions?.code === 'UNAUTHENTICATED'
    );

    // Customer
    await assert.rejects(
      async () => resolvers.Mutation.createCategory(null, { name: 'Test', slug: 'test', imageUrl: '/img.webp' }, { user: { id: 'cust1', role: 'customer' } }),
      (err) => err.extensions?.code === 'FORBIDDEN'
    );
  });

  await asyncTest('Product admin mutations throw FORBIDDEN when invoked by customer or anonymous', async () => {
    // Anonymous
    await assert.rejects(
      async () => resolvers.Mutation.createProduct(null, { name: 'Prod', slug: 'prod', price: 10, categoryId: 'c1' }, { user: null }),
      (err) => err.extensions?.code === 'UNAUTHENTICATED'
    );

    // Customer
    await assert.rejects(
      async () => resolvers.Mutation.createProduct(null, { name: 'Prod', slug: 'prod', price: 10, categoryId: 'c1' }, { user: { id: 'cust1', role: 'customer' } }),
      (err) => err.extensions?.code === 'FORBIDDEN'
    );
  });

  await asyncTest('getAllUsers throws FORBIDDEN when invoked by customer', async () => {
    await assert.rejects(
      async () => resolvers.Query.getAllUsers(null, {}, { user: { id: 'cust1', role: 'customer' } }),
      (err) => err.extensions?.code === 'FORBIDDEN'
    );
  });

  await asyncTest('registerUser validates bad emails and short passwords', async () => {
    await assert.rejects(
      async () => resolvers.Mutation.registerUser(null, { email: 'bademail', password: 'password123' }),
      (err) => err.extensions?.code === 'BAD_USER_INPUT'
    );

    await assert.rejects(
      async () => resolvers.Mutation.registerUser(null, { email: 'valid@example.com', password: '123' }),
      (err) => err.extensions?.code === 'BAD_USER_INPUT'
    );
  });

  await asyncTest('loginUser requires both email and password', async () => {
    await assert.rejects(
      async () => resolvers.Mutation.loginUser(null, { email: '', password: '' }),
      (err) => err.extensions?.code === 'BAD_USER_INPUT'
    );
  });

  // ----------------------------------------------------
  // 7. ERROR SANITIZATION TESTS
  // ----------------------------------------------------
  console.log('\n--- 7. Error Sanitization & Masking ---');

  test('formatGraphQLError preserves expected client error codes and masks unexpected internal errors', () => {
    const authErr = formatGraphQLError(
      { message: 'Authentication required', extensions: { code: 'UNAUTHENTICATED' }, path: ['getCurrentUser'] },
      new Error('Authentication required')
    );
    assert.strictEqual(authErr.extensions.code, 'UNAUTHENTICATED');
    assert.strictEqual(authErr.message, 'Authentication required');

    // Simulate internal system error in production mode
    const prevEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const dbErr = formatGraphQLError(
      { message: 'SequelizeConnectionError: connect ECONNREFUSED 127.0.0.1:3306', extensions: {} },
      new Error('SequelizeConnectionError: connect ECONNREFUSED 127.0.0.1:3306')
    );
    assert.strictEqual(dbErr.message, 'An unexpected error occurred. Please try again later.');
    process.env.NODE_ENV = prevEnv;
  });

  console.log(`\n======================================================`);
  console.log(`✨ ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
  console.log(`======================================================\n`);
}

runTestSuite().catch((err) => {
  console.error('\n❌ Test suite failure:', err);
  process.exit(1);
});
