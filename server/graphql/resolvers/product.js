const { ProductModel, CategoryModel } = require('../../models');

const productResolvers = {
  Query: {
    getAllProducts: async () => {
      return await ProductModel.findAll({
        include: [{ model: CategoryModel, as: 'category' }]
      });
    },
    
    getProductBySlug: async (parent, { slug }) => {
      const product = await ProductModel.findOne({ 
        where: { slug },
        include: [{ model: CategoryModel, as: 'category' }]
      });
      if (!product) throw new Error('Product not found');
      return product;
    },

    getProductsByCategory: async (parent, { categoryId }) => {
      return await ProductModel.findAll({ 
        where: { categoryId },
        include: [{ model: CategoryModel, as: 'category' }]
      });
    },

    // Used by the Frontend to load Cart/Wishlist items from LocalStorage IDs
    getProductsByIds: async (parent, { ids }) => {
      const { Op } = require('sequelize');
      return await ProductModel.findAll({
        where: { id: { [Op.in]: ids } },
        include: [{ model: CategoryModel, as: 'category' }]
      });
    }
  },

  Mutation: {
    createProduct: async (parent, args) => {
      const existing = await ProductModel.findOne({ where: { slug: args.slug } });
      if (existing) throw new Error('A product with this slug already exists');
      
      return await ProductModel.create(args);
    },

    updateProduct: async (parent, args) => {
      const { id, ...updateData } = args;
      const productRecord = await ProductModel.findByPk(id);
      
      if (!productRecord) throw new Error('Product not found');

      // Update only the provided fields dynamically
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          productRecord[key] = updateData[key];
        }
      });

      await productRecord.save();
      return productRecord;
    },

    deleteProduct: async (parent, { id }) => {
      const deletedRowCount = await ProductModel.destroy({ where: { id } });
      return deletedRowCount > 0;
    }
  },

  // Field Resolvers to automatically handle relational data when queried
  Product: {
    category: async (product) => {
      // If category was already eagerly loaded by Sequelize 'include', return it
      if (product.category) return product.category;
      return await CategoryModel.findByPk(product.categoryId);
    }
  },
  
  Category: {
    products: async (category) => {
      return await ProductModel.findAll({ where: { categoryId: category.id } });
    }
  }
};

module.exports = productResolvers;
