/**
 * Validation Helper
 * Provides server-side validation and sanitization for user inputs.
 */

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validate email address format.
 */
function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  return trimmed.length <= 254 && EMAIL_REGEX.test(trimmed);
}

/**
 * Validate password requirements.
 * Minimum 6 characters, cannot be empty or only whitespace.
 */
function isValidPassword(password) {
  if (typeof password !== 'string') return false;
  if (password.length < 6) return false;
  if (password.trim().length === 0) return false;
  return true;
}

/**
 * Validate URL friendly slug.
 */
function isValidSlug(slug) {
  if (typeof slug !== 'string') return false;
  const trimmed = slug.trim();
  return trimmed.length >= 1 && trimmed.length <= 200 && SLUG_REGEX.test(trimmed);
}

/**
 * Sanitize and format a string into a valid slug.
 */
function sanitizeSlug(input) {
  if (typeof input !== 'string') return '';
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Validate non-negative numbers (prices, stock, etc.).
 */
function isNonNegativeNumber(value) {
  if (value === null || value === undefined) return false;
  const num = Number(value);
  return !isNaN(num) && isFinite(num) && num >= 0;
}

/**
 * Validate positive integers (page, limit, quantity).
 */
function isPositiveInteger(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0;
}

/**
 * Validate UUID string.
 */
function isValidUUID(id) {
  if (typeof id !== 'string') return false;
  return UUID_REGEX.test(id.trim());
}

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidSlug,
  sanitizeSlug,
  isNonNegativeNumber,
  isPositiveInteger,
  isValidUUID,
};
