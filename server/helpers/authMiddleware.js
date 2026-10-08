const { GraphQLError } = require('graphql');
const { verifyAuthToken } = require('./authHelper');
const UserModel = require('../models/userModel');

/**
 * Extracts and verifies the user from the incoming HTTP Authorization header.
 * Tolerates missing or malformed headers safely without crashing.
 *
 * @param {Object} req - Express Request object
 * @returns {Promise<Object|null>} - Authenticated user payload or null
 */
const getAuthUserFromReq = async (req) => {
  try {
    const authHeader = req.headers?.authorization;
    if (!authHeader || typeof authHeader !== 'string') {
      return null;
    }

    const parts = authHeader.trim().split(/\s+/);
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      return null;
    }

    const token = parts[1];
    const decoded = verifyAuthToken(token);
    if (!decoded || !decoded.id) {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Ensures the GraphQL request is made by an authenticated user.
 * Throws GraphQLError with UNAUTHENTICATED code if not logged in.
 *
 * @param {Object} context - Apollo GraphQL Context
 * @returns {Object} - Authenticated user { id, role }
 */
const requireAuth = (context) => {
  if (!context || !context.user || !context.user.id) {
    throw new GraphQLError('Authentication required. Please log in to proceed.', {
      extensions: {
        code: 'UNAUTHENTICATED',
        http: { status: 401 },
      },
    });
  }
  return context.user;
};

/**
 * Ensures the GraphQL request is made by an authenticated administrator.
 * Throws GraphQLError with FORBIDDEN / UNAUTHENTICATED code if not admin.
 *
 * @param {Object} context - Apollo GraphQL Context
 * @returns {Object} - Authenticated admin user { id, role }
 */
const requireAdmin = (context) => {
  const user = requireAuth(context);
  if (user.role !== 'admin') {
    throw new GraphQLError('Access denied. Administrator privileges required.', {
      extensions: {
        code: 'FORBIDDEN',
        http: { status: 403 },
      },
    });
  }
  return user;
};

/**
 * Ensures the authenticated user is either the owner of the resource or an admin.
 *
 * @param {Object} context - Apollo GraphQL Context
 * @param {string} resourceOwnerId - ID of the user who owns the resource
 * @returns {Object} - Authenticated user
 */
const requireOwnerOrAdmin = (context, resourceOwnerId) => {
  const user = requireAuth(context);
  if (user.role !== 'admin' && String(user.id) !== String(resourceOwnerId)) {
    throw new GraphQLError('Access denied. You do not have permission to access or modify this resource.', {
      extensions: {
        code: 'FORBIDDEN',
        http: { status: 403 },
      },
    });
  }
  return user;
};

/**
 * Express middleware to protect REST endpoints (such as image upload) with Admin authorization.
 */
const expressRequireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required. Missing Authorization header.' });
    }

    const parts = authHeader.trim().split(/\s+/);
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      return res.status(401).json({ error: 'Invalid Authorization header format. Format: Bearer <token>' });
    }

    const token = parts[1];
    const decoded = verifyAuthToken(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ error: 'Invalid or expired authentication token.' });
    }

    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Authentication verification failed.' });
  }
};

module.exports = {
  getAuthUserFromReq,
  requireAuth,
  requireAdmin,
  requireOwnerOrAdmin,
  expressRequireAdmin,
};
