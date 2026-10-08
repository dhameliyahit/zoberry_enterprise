const { GraphQLError } = require('graphql');
const { CategoryModel, ProductModel } = require('../../models');
const { requireAdmin } = require('../../helpers/authMiddleware');
const { isValidSlug, sanitizeSlug } = require('../../helpers/validationHelper');

const categoryResolvers = {
  Query: {
    // Fetch all categories for the store navigation
    getAllCategories: async () => {
      return await CategoryModel.findAll({
        order: [['name', 'ASC']],
      });
    },

    // Fetch a single category by its URL friendly slug
    getCategoryBySlug: async (parent, { slug }) => {
      if (!slug || typeof slug !== 'string') {
        throw new GraphQLError('Category slug is required.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const normalizedSlug = slug.trim().toLowerCase();
      const category = await CategoryModel.findOne({ where: { slug: normalizedSlug } });
      if (!category) {
        throw new GraphQLError('Category not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      return category;
    },

    // Fetch a category by ID
    getCategoryById: async (parent, { id }) => {
      const category = await CategoryModel.findByPk(id);
      if (!category) {
        throw new GraphQLError('Category not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      return category;
    },
  },

  Mutation: {
    // Create a new category (Admin only)
    createCategory: async (parent, { name, slug, imageUrl }, context) => {
      requireAdmin(context);

      if (!name || typeof name !== 'string' || !name.trim()) {
        throw new GraphQLError('Category name is required.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const cleanSlug = sanitizeSlug(slug || name);
      if (!isValidSlug(cleanSlug)) {
        throw new GraphQLError('Invalid category slug. Use alphanumeric characters and hyphens.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.trim()) {
        throw new GraphQLError('Category image is required.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const existingCategory = await CategoryModel.findOne({ where: { slug: cleanSlug } });
      if (existingCategory) {
        throw new GraphQLError('A category with this slug already exists.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      return await CategoryModel.create({
        name: name.trim(),
        slug: cleanSlug,
        imageUrl: imageUrl.trim(),
      });
    },

    // Update an existing category (Admin only)
    updateCategory: async (parent, { id, name, slug, imageUrl }, context) => {
      requireAdmin(context);

      const categoryRecord = await CategoryModel.findByPk(id);
      if (!categoryRecord) {
        throw new GraphQLError('Category not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (name !== undefined) {
        if (typeof name !== 'string' || !name.trim()) {
          throw new GraphQLError('Category name cannot be empty.', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
        categoryRecord.name = name.trim();
      }

      if (slug !== undefined) {
        const cleanSlug = sanitizeSlug(slug);
        if (!isValidSlug(cleanSlug)) {
          throw new GraphQLError('Invalid category slug format.', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }

        if (cleanSlug !== categoryRecord.slug) {
          const duplicateSlug = await CategoryModel.findOne({ where: { slug: cleanSlug } });
          if (duplicateSlug) {
            throw new GraphQLError('A category with this slug already exists.', {
              extensions: { code: 'BAD_USER_INPUT' },
            });
          }
          categoryRecord.slug = cleanSlug;
        }
      }

      if (imageUrl !== undefined) {
        if (typeof imageUrl !== 'string' || !imageUrl.trim()) {
          throw new GraphQLError('Category image cannot be empty.', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
        categoryRecord.imageUrl = imageUrl.trim();
      }

      await categoryRecord.save();
      return categoryRecord;
    },

    // Delete a category (Admin only)
    deleteCategory: async (parent, { id }, context) => {
      requireAdmin(context);

      const categoryRecord = await CategoryModel.findByPk(id);
      if (!categoryRecord) {
        throw new GraphQLError('Category not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Check if products are attached to this category
      const associatedProductsCount = await ProductModel.count({ where: { categoryId: id } });
      if (associatedProductsCount > 0) {
        throw new GraphQLError(
          `Cannot delete category. ${associatedProductsCount} products are currently assigned to it. Reassign or delete these products first.`,
          { extensions: { code: 'BAD_USER_INPUT' } }
        );
      }

      const deletedRowCount = await CategoryModel.destroy({ where: { id } });
      return deletedRowCount > 0;
    },
  },
};

module.exports = categoryResolvers;
