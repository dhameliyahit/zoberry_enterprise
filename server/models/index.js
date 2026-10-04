const UserModel = require('./userModel');
const CategoryModel = require('./categoryModel');
const ProductModel = require('./productModel');
const CartItemModel = require('./cartItemModel');
const WishlistItemModel = require('./wishlistItemModel');

// ==========================================
// Define Database Relationships / Associations
// ==========================================

// Category <-> Product Relationship (One-to-Many)
// A Category can have many Products
CategoryModel.hasMany(ProductModel, {
  foreignKey: 'categoryId',
  as: 'products', // This allows us to query `category.products`
  onDelete: 'RESTRICT', // Prevents deleting a category if it still has products attached
});

// A Product belongs to exactly one Category
ProductModel.belongsTo(CategoryModel, {
  foreignKey: 'categoryId',
  as: 'category', 
});

// User <-> Cart/Wishlist Relationships
UserModel.hasMany(CartItemModel, { foreignKey: 'userId', as: 'cartItems', onDelete: 'CASCADE' });
CartItemModel.belongsTo(UserModel, { foreignKey: 'userId', as: 'user' });

UserModel.hasMany(WishlistItemModel, { foreignKey: 'userId', as: 'wishlistItems', onDelete: 'CASCADE' });
WishlistItemModel.belongsTo(UserModel, { foreignKey: 'userId', as: 'user' });

// Product <-> Cart/Wishlist Relationships
CartItemModel.belongsTo(ProductModel, { foreignKey: 'productId', as: 'product' });
WishlistItemModel.belongsTo(ProductModel, { foreignKey: 'productId', as: 'product' });

module.exports = {
  UserModel,
  CategoryModel,
  ProductModel,
  CartItemModel,
  WishlistItemModel,
};
