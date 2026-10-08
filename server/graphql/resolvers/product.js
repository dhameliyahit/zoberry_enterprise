const { Op } = require('sequelize');
const { GraphQLError } = require('graphql');
const { ProductModel, CategoryModel, ProductVariantModel } = require('../../models');
const { requireAdmin } = require('../../helpers/authMiddleware');
const {
  isValidSlug,
  sanitizeSlug,
  isNonNegativeNumber,
  isValidUUID,
} = require('../../helpers/validationHelper');

const productResolvers = {
  Query: {
    // Scalable server-side paginated, searchable, filterable and sortable products query
    getProducts: async (parent, { filter = {}, page = 1, limit = 20, sortBy = 'FEATURED' }, context) => {
      const sanitizedPage = Math.max(1, parseInt(page, 10) || 1);
      const sanitizedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
      const offset = (sanitizedPage - 1) * sanitizedLimit;

      const where = {};

      // Inactive products are hidden by default for public users unless explicitly filtered by an admin
      const isAdmin = context?.user?.role === 'admin';
      if (filter.isActive !== undefined) {
        where.isActive = filter.isActive;
      } else if (!isAdmin) {
        where.isActive = true;
      }

      // Category filter by ID
      if (filter.categoryId) {
        where.categoryId = filter.categoryId;
      }

      // Category filter by Slug
      let categoryInclude = { model: CategoryModel, as: 'category' };
      if (filter.categorySlug) {
        categoryInclude = {
          model: CategoryModel,
          as: 'category',
          where: { slug: filter.categorySlug.trim().toLowerCase() },
        };
      }

      // Keyword Search (searches name, shortDescription, optionsLabel)
      if (filter.search && typeof filter.search === 'string' && filter.search.trim()) {
        const searchTerm = `%${filter.search.trim()}%`;
        where[Op.or] = [
          { name: { [Op.like]: searchTerm } },
          { shortDescription: { [Op.like]: searchTerm } },
          { optionsLabel: { [Op.like]: searchTerm } },
        ];
      }

      // Price Range Filter
      if (filter.minPrice !== undefined && filter.minPrice !== null) {
        where.price = { ...(where.price || {}), [Op.gte]: filter.minPrice };
      }
      if (filter.maxPrice !== undefined && filter.maxPrice !== null) {
        where.price = { ...(where.price || {}), [Op.lte]: filter.maxPrice };
      }

      // Stock Status Filter
      if (filter.inStock === true) {
        where.stockQuantity = { [Op.gt]: 0 };
      } else if (filter.inStock === false) {
        where.stockQuantity = { [Op.lte]: 0 };
      }

      // Sorting
      let order = [['createdAt', 'DESC']];
      switch (sortBy) {
        case 'PRICE_LOW':
          order = [['price', 'ASC']];
          break;
        case 'PRICE_HIGH':
          order = [['price', 'DESC']];
          break;
        case 'NEWEST':
          order = [['createdAt', 'DESC']];
          break;
        case 'NAME_ASC':
          order = [['name', 'ASC']];
          break;
        case 'NAME_DESC':
          order = [['name', 'DESC']];
          break;
        case 'FEATURED':
        default:
          order = [['createdAt', 'DESC']];
          break;
      }

      const { count, rows } = await ProductModel.findAndCountAll({
        where,
        include: [
          categoryInclude,
          { model: ProductVariantModel, as: 'variants' },
        ],
        order,
        limit: sanitizedLimit,
        offset,
        distinct: true,
      });

      const totalPages = Math.ceil(count / sanitizedLimit) || 1;

      return {
        items: rows,
        total: count,
        page: sanitizedPage,
        limit: sanitizedLimit,
        totalPages,
        hasMore: sanitizedPage < totalPages,
      };
    },

    // Backward-compatible query for existing storefront widgets
    getAllProducts: async (parent, { limit, offset }, context) => {
      const options = {
        include: [
          { model: CategoryModel, as: 'category' },
          { model: ProductVariantModel, as: 'variants' },
        ],
        order: [['createdAt', 'DESC']],
      };

      if (limit && Number(limit) > 0) {
        options.limit = Math.min(100, parseInt(limit, 10));
      }
      if (offset && Number(offset) >= 0) {
        options.offset = parseInt(offset, 10);
      }

      return await ProductModel.findAll(options);
    },

    // Fetch product by unique slug
    getProductBySlug: async (parent, { slug }) => {
      if (!slug || typeof slug !== 'string') {
        throw new GraphQLError('Product slug is required.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const normalizedSlug = slug.trim().toLowerCase();
      const product = await ProductModel.findOne({
        where: { slug: normalizedSlug },
        include: [
          { model: CategoryModel, as: 'category' },
          { model: ProductVariantModel, as: 'variants' },
        ],
      });

      if (!product) {
        throw new GraphQLError('Product not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return product;
    },

    // Fetch product by ID
    getProductById: async (parent, { id }) => {
      const product = await ProductModel.findByPk(id, {
        include: [
          { model: CategoryModel, as: 'category' },
          { model: ProductVariantModel, as: 'variants' },
        ],
      });

      if (!product) {
        throw new GraphQLError('Product not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return product;
    },

    // Fetch products within a specific category
    getProductsByCategory: async (parent, { categoryId }) => {
      return await ProductModel.findAll({
        where: { categoryId, isActive: true },
        include: [
          { model: CategoryModel, as: 'category' },
          { model: ProductVariantModel, as: 'variants' },
        ],
        order: [['createdAt', 'DESC']],
      });
    },

    // Used by the Frontend to load Cart/Wishlist items from LocalStorage IDs
    getProductsByIds: async (parent, { ids }) => {
      if (!Array.isArray(ids) || ids.length === 0) {
        return [];
      }

      const validIds = ids.filter(id => typeof id === 'string' && id.trim().length > 0);
      if (validIds.length === 0) {
        return [];
      }

      return await ProductModel.findAll({
        where: { id: { [Op.in]: validIds } },
        include: [
          { model: CategoryModel, as: 'category' },
          { model: ProductVariantModel, as: 'variants' },
        ],
      });
    },
  },

  Mutation: {
    // Create a new product (Strictly Admin only with full input validation)
    createProduct: async (parent, args, context) => {
      requireAdmin(context);

      const {
        categoryId,
        name,
        slug,
        price,
        costPrice,
        compareAtPrice,
        stockQuantity,
        hasVariants,
        shortDescription,
        description,
        optionsLabel,
        productVideoUrl,
        features,
        images,
        isActive,
      } = args;

      if (!name || typeof name !== 'string' || !name.trim()) {
        throw new GraphQLError('Product name is required.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const cleanSlug = sanitizeSlug(slug || name);
      if (!isValidSlug(cleanSlug)) {
        throw new GraphQLError('Invalid product slug. Slug must contain only alphanumeric characters and hyphens.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      if (!isNonNegativeNumber(price)) {
        throw new GraphQLError('Product price must be a valid non-negative number.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      if (costPrice !== undefined && costPrice !== null && !isNonNegativeNumber(costPrice)) {
        throw new GraphQLError('Cost price cannot be negative.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      if (compareAtPrice !== undefined && compareAtPrice !== null && !isNonNegativeNumber(compareAtPrice)) {
        throw new GraphQLError('Compare at price cannot be negative.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      if (stockQuantity !== undefined && stockQuantity !== null && (!Number.isInteger(stockQuantity) || stockQuantity < 0)) {
        throw new GraphQLError('Stock quantity must be a non-negative integer.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      // Check category existence
      const categoryExists = await CategoryModel.findByPk(categoryId);
      if (!categoryExists) {
        throw new GraphQLError('The selected category does not exist.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      // Check slug uniqueness
      const existingProduct = await ProductModel.findOne({ where: { slug: cleanSlug } });
      if (existingProduct) {
        throw new GraphQLError('A product with this slug already exists.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const newProduct = await ProductModel.create({
        categoryId,
        name: name.trim(),
        slug: cleanSlug,
        price: parseFloat(price),
        costPrice: costPrice !== undefined && costPrice !== null ? parseFloat(costPrice) : null,
        compareAtPrice: compareAtPrice !== undefined && compareAtPrice !== null ? parseFloat(compareAtPrice) : null,
        stockQuantity: stockQuantity !== undefined && stockQuantity !== null ? parseInt(stockQuantity, 10) : 0,
        hasVariants: Boolean(hasVariants),
        shortDescription: shortDescription?.trim() || null,
        description: description?.trim() || null,
        optionsLabel: optionsLabel?.trim() || null,
        productVideoUrl: productVideoUrl?.trim() || null,
        features: Array.isArray(features) ? features : [],
        images: Array.isArray(images) ? images : [],
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      });

      return await ProductModel.findByPk(newProduct.id, {
        include: [
          { model: CategoryModel, as: 'category' },
          { model: ProductVariantModel, as: 'variants' },
        ],
      });
    },

    // Update an existing product (Strictly Admin only with full input validation)
    updateProduct: async (parent, args, context) => {
      requireAdmin(context);

      const { id, ...updateData } = args;
      const productRecord = await ProductModel.findByPk(id);

      if (!productRecord) {
        throw new GraphQLError('Product not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (updateData.name !== undefined) {
        if (!updateData.name || typeof updateData.name !== 'string' || !updateData.name.trim()) {
          throw new GraphQLError('Product name cannot be empty.', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
        productRecord.name = updateData.name.trim();
      }

      if (updateData.slug !== undefined) {
        const cleanSlug = sanitizeSlug(updateData.slug);
        if (!isValidSlug(cleanSlug)) {
          throw new GraphQLError('Invalid product slug format.', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }

        if (cleanSlug !== productRecord.slug) {
          const duplicateSlug = await ProductModel.findOne({ where: { slug: cleanSlug } });
          if (duplicateSlug) {
            throw new GraphQLError('A product with this slug already exists.', {
              extensions: { code: 'BAD_USER_INPUT' },
            });
          }
          productRecord.slug = cleanSlug;
        }
      }

      if (updateData.price !== undefined) {
        if (!isNonNegativeNumber(updateData.price)) {
          throw new GraphQLError('Product price cannot be negative.', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
        productRecord.price = parseFloat(updateData.price);
      }

      if (updateData.costPrice !== undefined) {
        if (updateData.costPrice !== null && !isNonNegativeNumber(updateData.costPrice)) {
          throw new GraphQLError('Cost price cannot be negative.', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
        productRecord.costPrice = updateData.costPrice !== null ? parseFloat(updateData.costPrice) : null;
      }

      if (updateData.compareAtPrice !== undefined) {
        if (updateData.compareAtPrice !== null && !isNonNegativeNumber(updateData.compareAtPrice)) {
          throw new GraphQLError('Compare at price cannot be negative.', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
        productRecord.compareAtPrice = updateData.compareAtPrice !== null ? parseFloat(updateData.compareAtPrice) : null;
      }

      if (updateData.stockQuantity !== undefined) {
        if (updateData.stockQuantity !== null && (!Number.isInteger(updateData.stockQuantity) || updateData.stockQuantity < 0)) {
          throw new GraphQLError('Stock quantity must be a non-negative integer.', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
        productRecord.stockQuantity = updateData.stockQuantity !== null ? parseInt(updateData.stockQuantity, 10) : 0;
      }

      if (updateData.hasVariants !== undefined) {
        productRecord.hasVariants = Boolean(updateData.hasVariants);
      }

      if (updateData.categoryId !== undefined) {
        const categoryExists = await CategoryModel.findByPk(updateData.categoryId);
        if (!categoryExists) {
          throw new GraphQLError('The selected category does not exist.', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
        productRecord.categoryId = updateData.categoryId;
      }

      if (updateData.shortDescription !== undefined) {
        productRecord.shortDescription = updateData.shortDescription?.trim() || null;
      }
      if (updateData.description !== undefined) {
        productRecord.description = updateData.description?.trim() || null;
      }
      if (updateData.optionsLabel !== undefined) {
        productRecord.optionsLabel = updateData.optionsLabel?.trim() || null;
      }
      if (updateData.productVideoUrl !== undefined) {
        productRecord.productVideoUrl = updateData.productVideoUrl?.trim() || null;
      }
      if (updateData.features !== undefined) {
        productRecord.features = Array.isArray(updateData.features) ? updateData.features : [];
      }
      if (updateData.images !== undefined) {
        productRecord.images = Array.isArray(updateData.images) ? updateData.images : [];
      }
      if (updateData.isActive !== undefined) {
        productRecord.isActive = Boolean(updateData.isActive);
      }

      await productRecord.save();

      return await ProductModel.findByPk(productRecord.id, {
        include: [
          { model: CategoryModel, as: 'category' },
          { model: ProductVariantModel, as: 'variants' },
        ],
      });
    },

    // Delete a product (Strictly Admin only)
    deleteProduct: async (parent, { id }, context) => {
      requireAdmin(context);

      const productRecord = await ProductModel.findByPk(id);
      if (!productRecord) {
        throw new GraphQLError('Product not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const deletedRowCount = await ProductModel.destroy({ where: { id } });
      return deletedRowCount > 0;
    },
  },

  // Field Resolvers
  Product: {
    category: async (product) => {
      if (product.category) return product.category;
      return await CategoryModel.findByPk(product.categoryId);
    },
    variants: async (product) => {
      if (product.variants) return product.variants;
      return await ProductVariantModel.findAll({
        where: { productId: product.id, isActive: true },
        order: [['createdAt', 'ASC']],
      });
    },
  },

  Category: {
    products: async (category) => {
      return await ProductModel.findAll({
        where: { categoryId: category.id, isActive: true },
        order: [['createdAt', 'DESC']],
      });
    },
  },
};

module.exports = productResolvers;
