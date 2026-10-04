const userResolvers = require('./user');
const categoryResolvers = require('./category');
const productResolvers = require('./product');

// Combine all individual module resolvers into one master resolver object
const rootResolvers = {
  Query: {
    ...userResolvers.Query,
    ...categoryResolvers.Query,
    ...productResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...categoryResolvers.Mutation,
    ...productResolvers.Mutation,
  },
  // Relational Field Resolvers
  Product: productResolvers.Product,
  Category: productResolvers.Category,
};

module.exports = rootResolvers;
