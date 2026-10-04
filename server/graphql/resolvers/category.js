const CategoryModel = require('../../models/categoryModel');

const categoryResolvers = {
  Query: {
    // Fetch all categories for the store navigation
    getAllCategories: async () => {
      return await CategoryModel.findAll();
    },
    // Fetch a single category by its URL friendly slug
    getCategoryBySlug: async (parent, { slug }) => {
      const category = await CategoryModel.findOne({ where: { slug } });
      if (!category) {
        throw new Error('Category not found');
      }
      return category;
    }
  },
  
  Mutation: {
    // Create a new category (Admin only typically, but auth checks can be added later)
    createCategory: async (parent, { name, slug, imageUrl }) => {
      const existingCategory = await CategoryModel.findOne({ where: { slug } });
      if (existingCategory) {
        throw new Error('A category with this slug already exists');
      }

      return await CategoryModel.create({
        name,
        slug,
        imageUrl
      });
    },

    // Update an existing category
    updateCategory: async (parent, { id, name, slug, imageUrl }) => {
      const categoryRecord = await CategoryModel.findByPk(id);
      if (!categoryRecord) {
        throw new Error('Category not found');
      }

      if (name) categoryRecord.name = name;
      if (slug) categoryRecord.slug = slug;
      if (imageUrl) categoryRecord.imageUrl = imageUrl;

      await categoryRecord.save();
      return categoryRecord;
    },

    // Delete a category
    deleteCategory: async (parent, { id }) => {
      const deletedRowCount = await CategoryModel.destroy({ where: { id } });
      return deletedRowCount > 0;
    }
  }
};

module.exports = categoryResolvers;
