const userTypeDefs = require('./user');
const categoryTypeDefs = require('./category');
const productTypeDefs = require('./product');

// Combine all individual module type definitions into one master schema
const rootTypeDefs = `#graphql
  ${userTypeDefs}
  ${categoryTypeDefs}
  ${productTypeDefs}
`;

module.exports = rootTypeDefs;
