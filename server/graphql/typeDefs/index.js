const userTypeDefs = require('./user');
const categoryTypeDefs = require('./category');

// Combine all individual module type definitions into one master schema
const rootTypeDefs = `#graphql
  ${userTypeDefs}
  ${categoryTypeDefs}
`;

module.exports = rootTypeDefs;
