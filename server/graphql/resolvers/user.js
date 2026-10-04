const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../../models/userModel');
const { generateAuthToken } = require('../../helpers/authHelper');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


const userResolvers = {
  Query: {
    // Fetches the currently logged in user based on the context token
    getCurrentUser: async (parent, args, context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      return await UserModel.findByPk(context.user.id);
    },
    // Fetches a specific user by their ID
    getUserById: async (parent, { id }) => {
      return await UserModel.findByPk(id);
    },
    // Fetches all users (typically for admin use)
    getAllUsers: async () => {
      return await UserModel.findAll();
    }
  },
  
  Mutation: {
    // Registers a new user with an email and an optional password
    registerUser: async (parent, { email, password }) => {
      try {
        // Check if a user with this email already exists
        const existingUser = await UserModel.findOne({ where: { email } });
        if (existingUser) {
          throw new Error('User already exists with this email');
        }

        let hashedPassword = null;
        if (password) {
          // Hash the password for secure storage
          hashedPassword = await bcrypt.hash(password, 10);
        }

        // Create the new user in the database
        const newUser = await UserModel.create({
          email: email,
          password: hashedPassword,
        });

        // Return the generated token and user details
        return {
          token: generateAuthToken(newUser),
          user: newUser,
        };
      } catch (error) {
        throw new Error(error.message);
      }
    },

    // Logs in an existing user using email and password
    loginUser: async (parent, { email, password }) => {
      const userRecord = await UserModel.findOne({ where: { email } });
      if (!userRecord) {
        throw new Error('Invalid email or password');
      }
      
      // If a user was auto-registered as a guest or logged in with Google, they might not have a password
      if (!userRecord.password) {
        throw new Error('No password set. Please login with Google or reset your password.');
      }

      // Compare the provided password with the stored hashed password
      const isPasswordMatch = await bcrypt.compare(password, userRecord.password);
      if (!isPasswordMatch) {
        throw new Error('Invalid email or password');
      }

      return {
        token: generateAuthToken(userRecord),
        user: userRecord,
      };
    },

    // Handles Google Login Securely via Token Verification
    googleLoginUser: async (parent, { token }) => {
      try {
        // 1. Verify the token securely with Google's servers
        const ticket = await googleClient.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID, 
        });
        
        // 2. Extract guaranteed user info from Google
        const payload = ticket.getPayload();
        const email = payload.email;
        const googleId = payload.sub; // 'sub' is Google's unique ID for the user

        // 3. Find or create the user in our database
        let userRecord = await UserModel.findOne({ where: { email } });

        if (!userRecord) {
          // If the user does not exist, automatically register them
          userRecord = await UserModel.create({ 
            email: email, 
            googleId: googleId 
          });
        } else if (!userRecord.googleId) {
          // If the user exists but hasn't linked Google yet, link it now
          userRecord.googleId = googleId;
          await userRecord.save();
        }

        return {
          token: generateAuthToken(userRecord),
          user: userRecord,
        };
      } catch (error) {
        throw new Error('Google Authentication Failed: ' + error.message);
      }
    },

    // Updates a user's basic information
    updateUser: async (parent, { id, email }) => {
      const userRecord = await UserModel.findByPk(id);
      if (!userRecord) {
        throw new Error('User not found');
      }
      
      if (email) {
        userRecord.email = email;
      }
      
      await userRecord.save();
      return userRecord;
    },

    // Deletes a user by ID
    deleteUser: async (parent, { id }) => {
      const deletedRowCount = await UserModel.destroy({ where: { id } });
      return deletedRowCount > 0;
    }
  }
};

module.exports = userResolvers;
