const jwt = require('jsonwebtoken');
require('dotenv').config();

// Helper function to generate a non-expiring JWT token
// Stored here so it can be reused across different modules easily
const generateAuthToken = (user) => {
  // We do not pass an expiresIn parameter, so the token will not expire automatically
  return jwt.sign(
    { id: user.id, role: user.role }, 
    process.env.JWT_SECRET
  ); 
};

module.exports = {
  generateAuthToken,
};
