const userTypeDefs = require('./user');
const categoryTypeDefs = require('./category');
const productTypeDefs = require('./product');
const variantTypeDefs = require('./variant');
const cartTypeDefs = require('./cart');
const addressTypeDefs = require('./address');
const orderTypeDefs = require('./order');
const wishlistTypeDefs = require('./wishlist');

// Combine all individual module type definitions into one master schema
const rootTypeDefs = `#graphql
  ${productTypeDefs}
  ${userTypeDefs}
  ${categoryTypeDefs}
  ${variantTypeDefs}
  ${cartTypeDefs}
  ${addressTypeDefs}
  ${orderTypeDefs}
  ${wishlistTypeDefs}
`;

module.exports = rootTypeDefs;
