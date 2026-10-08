const userResolvers = require('./user');
const categoryResolvers = require('./category');
const productResolvers = require('./product');
const variantResolvers = require('./variant');
const { cartResolvers } = require('./cart');
const addressResolvers = require('./address');
const orderResolvers = require('./order');
const wishlistResolvers = require('./wishlist');
const promotionResolvers = require('./promotion');
const paymentResolvers = require('./payment');
const shippingResolvers = require('./shipping');

// Combine all individual module resolvers into one master resolver object
const rootResolvers = {
  Query: {
    ...userResolvers.Query,
    ...categoryResolvers.Query,
    ...productResolvers.Query,
    ...cartResolvers.Query,
    ...addressResolvers.Query,
    ...orderResolvers.Query,
    ...wishlistResolvers.Query,
    ...promotionResolvers.Query,
    ...paymentResolvers.Query,
    ...shippingResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...categoryResolvers.Mutation,
    ...productResolvers.Mutation,
    ...variantResolvers.Mutation,
    ...cartResolvers.Mutation,
    ...addressResolvers.Mutation,
    ...orderResolvers.Mutation,
    ...wishlistResolvers.Mutation,
    ...promotionResolvers.Mutation,
    ...paymentResolvers.Mutation,
    ...shippingResolvers.Mutation,
  },
  // Relational Field Resolvers
  Product: productResolvers.Product,
  Category: productResolvers.Category,
};

module.exports = rootResolvers;
