const userTypeDefs = require('./user');
const categoryTypeDefs = require('./category');
const productTypeDefs = require('./product');
const variantTypeDefs = require('./variant');
const cartTypeDefs = require('./cart');
const addressTypeDefs = require('./address');
const orderTypeDefs = require('./order');
const wishlistTypeDefs = require('./wishlist');
const promotionTypeDefs = require('./promotion');
const paymentTypeDefs = require('./payment');
const shippingTypeDefs = require('./shipping');

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
  ${promotionTypeDefs}
  ${paymentTypeDefs}
  ${shippingTypeDefs}
`;

module.exports = rootTypeDefs;
