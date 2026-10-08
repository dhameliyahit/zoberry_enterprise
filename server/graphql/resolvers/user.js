const bcrypt = require('bcryptjs');
const { GraphQLError } = require('graphql');
const { OAuth2Client } = require('google-auth-library');
const UserModel = require('../../models/userModel');
const { generateAuthToken } = require('../../helpers/authHelper');
const { requireAuth, requireAdmin, requireOwnerOrAdmin } = require('../../helpers/authMiddleware');
const { isValidEmail, isValidPassword } = require('../../helpers/validationHelper');
require('dotenv').config();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const userResolvers = {
  Query: {
    // Fetches the currently logged in user based on verified authentication context
    getCurrentUser: async (parent, args, context) => {
      const authUser = requireAuth(context);
      const user = await UserModel.findByPk(authUser.id);
      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      return user;
    },

    // Fetches a specific user by their ID - restricted to resource owner or admin
    getUserById: async (parent, { id }, context) => {
      requireOwnerOrAdmin(context, id);
      const user = await UserModel.findByPk(id);
      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      return user;
    },

    // Fetches all users - strictly restricted to administrators
    getAllUsers: async (parent, args, context) => {
      requireAdmin(context);
      return await UserModel.findAll({
        order: [['createdAt', 'DESC']],
      });
    },
  },

  Mutation: {
    // Registers a new customer account with strict email and password validation
    registerUser: async (parent, { email, password }) => {
      if (!email || !isValidEmail(email)) {
        throw new GraphQLError('Please provide a valid email address.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      if (password !== undefined && password !== null) {
        if (!isValidPassword(password)) {
          throw new GraphQLError('Password must be at least 6 characters long and cannot be blank.', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Check if user already exists
      const existingUser = await UserModel.findOne({ where: { email: normalizedEmail } });
      if (existingUser) {
        throw new GraphQLError('An account with this email address already exists.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      let hashedPassword = null;
      if (password) {
        hashedPassword = await bcrypt.hash(password, 12);
      }

      // Create new customer (explicitly enforce customer role to prevent privilege escalation)
      const newUser = await UserModel.create({
        email: normalizedEmail,
        password: hashedPassword,
        role: 'customer',
        isGuestConverted: false,
      });

      // Reload without password field
      const safeUser = await UserModel.findByPk(newUser.id);

      return {
        token: generateAuthToken(newUser),
        user: safeUser,
      };
    },

    // Authenticates user with email and password
    loginUser: async (parent, { email, password }) => {
      if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
        throw new GraphQLError('Email and password are required.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Load user including password for authentication check
      const userRecord = await UserModel.scope('withPassword').findOne({
        where: { email: normalizedEmail },
      });

      if (!userRecord) {
        throw new GraphQLError('Invalid email or password.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      if (!userRecord.password) {
        throw new GraphQLError('No password is set for this account. Please sign in with Google.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const isPasswordMatch = await bcrypt.compare(password, userRecord.password);
      if (!isPasswordMatch) {
        throw new GraphQLError('Invalid email or password.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      // Safe user output without password
      const safeUser = await UserModel.findByPk(userRecord.id);

      return {
        token: generateAuthToken(userRecord),
        user: safeUser,
      };
    },

    // Handles Google OAuth ID token verification securely
    googleLoginUser: async (parent, { token }) => {
      if (!token || typeof token !== 'string') {
        throw new GraphQLError('Google authentication token is required.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
          throw new GraphQLError('Invalid Google token payload.', {
            extensions: { code: 'UNAUTHENTICATED' },
          });
        }

        const normalizedEmail = payload.email.trim().toLowerCase();
        const googleId = payload.sub;

        let userRecord = await UserModel.findOne({ where: { email: normalizedEmail } });

        if (!userRecord) {
          userRecord = await UserModel.create({
            email: normalizedEmail,
            googleId: googleId,
            role: 'customer',
          });
        } else if (!userRecord.googleId) {
          userRecord.googleId = googleId;
          await userRecord.save();
        }

        const safeUser = await UserModel.findByPk(userRecord.id);

        return {
          token: generateAuthToken(userRecord),
          user: safeUser,
        };
      } catch (error) {
        throw new GraphQLError(error.message || 'Google authentication failed.', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
    },

    // Updates user profile - restricted to resource owner or admin
    updateUser: async (parent, { id, email }, context) => {
      const authUser = requireAuth(context);
      const targetId = id || authUser.id;

      requireOwnerOrAdmin(context, targetId);

      const userRecord = await UserModel.findByPk(targetId);
      if (!userRecord) {
        throw new GraphQLError('User not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (email !== undefined) {
        if (!isValidEmail(email)) {
          throw new GraphQLError('Please provide a valid email address.', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }

        const normalizedEmail = email.trim().toLowerCase();
        if (normalizedEmail !== userRecord.email) {
          const emailInUse = await UserModel.findOne({ where: { email: normalizedEmail } });
          if (emailInUse) {
            throw new GraphQLError('An account with this email address already exists.', {
              extensions: { code: 'BAD_USER_INPUT' },
            });
          }
          userRecord.email = normalizedEmail;
        }
      }

      await userRecord.save();
      return userRecord;
    },

    // Deletes user account - strictly restricted to administrators
    deleteUser: async (parent, { id }, context) => {
      requireAdmin(context);

      const targetUser = await UserModel.findByPk(id);
      if (!targetUser) {
        throw new GraphQLError('User not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Prevent accidental self-deletion of the acting admin
      if (context.user.id === id) {
        throw new GraphQLError('Administrators cannot delete their own account.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const deletedRowCount = await UserModel.destroy({ where: { id } });
      return deletedRowCount > 0;
    },
  },
};

module.exports = userResolvers;
