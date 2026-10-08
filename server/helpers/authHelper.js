const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET environment variable is not defined!');
}

/**
 * Generates a secure, expiring JWT token.
 *
 * @param {Object} user - User record object with id and role
 * @param {string} [expiresIn] - Optional override for token expiration
 * @returns {string} - Signed JWT token
 */
const generateAuthToken = (user, expiresIn = JWT_EXPIRES_IN) => {
  if (!user || !user.id) {
    throw new Error('User ID is required to generate authentication token.');
  }

  return jwt.sign(
    { 
      id: user.id, 
      role: user.role || 'customer' 
    }, 
    JWT_SECRET,
    { 
      expiresIn 
    }
  );
};

/**
 * Verifies and decodes a JWT token.
 *
 * @param {string} token - The raw JWT token string
 * @returns {Object|null} - Decoded payload or null if invalid/expired
 */
const verifyAuthToken = (token) => {
  if (!token || typeof token !== 'string') {
    return null;
  }

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    // Return null silently for expired or invalid signatures
    return null;
  }
};

module.exports = {
  generateAuthToken,
  verifyAuthToken,
  JWT_EXPIRES_IN,
};
