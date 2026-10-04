const userResolvers = require('./user');
const categoryResolvers = require('./category');

// Combine all individual module resolvers into one master resolver object
const rootResolvers = {
  Query: {
    ...userResolvers.Query,
    ...categoryResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...categoryResolvers.Mutation,
  },
};

module.exports = rootResolvers;
