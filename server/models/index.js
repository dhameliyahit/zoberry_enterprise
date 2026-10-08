const UserModel = require('./userModel');
const CategoryModel = require('./categoryModel');
const ProductModel = require('./productModel');
const ProductVariantModel = require('./productVariantModel');
const CartModel = require('./cartModel');
const CartItemModel = require('./cartItemModel');
const InventoryMovementModel = require('./inventoryMovementModel');
const AddressModel = require('./addressModel');
const OrderModel = require('./orderModel');
const OrderItemModel = require('./orderItemModel');
const WishlistItemModel = require('./wishlistItemModel');
const PromotionModel = require('./promotionModel');
const PromotionUsageModel = require('./promotionUsageModel');

// ==========================================
// Define Database Relationships / Associations
// ==========================================

// 1. Category <-> Product
CategoryModel.hasMany(ProductModel, {
  foreignKey: 'categoryId',
  as: 'products',
  onDelete: 'RESTRICT',
});
ProductModel.belongsTo(CategoryModel, {
  foreignKey: 'categoryId',
  as: 'category',
});

// 2. Product <-> ProductVariant
ProductModel.hasMany(ProductVariantModel, {
  foreignKey: 'productId',
  as: 'variants',
  onDelete: 'CASCADE',
});
ProductVariantModel.belongsTo(ProductModel, {
  foreignKey: 'productId',
  as: 'product',
});

// 3. User <-> Cart
UserModel.hasMany(CartModel, {
  foreignKey: 'userId',
  as: 'carts',
  onDelete: 'SET NULL',
});
CartModel.belongsTo(UserModel, {
  foreignKey: 'userId',
  as: 'user',
});

// 4. Cart <-> CartItem
CartModel.hasMany(CartItemModel, {
  foreignKey: 'cartId',
  as: 'items',
  onDelete: 'CASCADE',
});
CartItemModel.belongsTo(CartModel, {
  foreignKey: 'cartId',
  as: 'cart',
});

CartItemModel.belongsTo(ProductModel, {
  foreignKey: 'productId',
  as: 'product',
});
CartItemModel.belongsTo(ProductVariantModel, {
  foreignKey: 'variantId',
  as: 'variant',
});

// 5. User <-> Address
UserModel.hasMany(AddressModel, {
  foreignKey: 'userId',
  as: 'addresses',
  onDelete: 'CASCADE',
});
AddressModel.belongsTo(UserModel, {
  foreignKey: 'userId',
  as: 'user',
});

// 6. User <-> Order
UserModel.hasMany(OrderModel, {
  foreignKey: 'userId',
  as: 'orders',
  onDelete: 'SET NULL',
});
OrderModel.belongsTo(UserModel, {
  foreignKey: 'userId',
  as: 'user',
});

// 7. Order <-> OrderItem
OrderModel.hasMany(OrderItemModel, {
  foreignKey: 'orderId',
  as: 'items',
  onDelete: 'CASCADE',
});
OrderItemModel.belongsTo(OrderModel, {
  foreignKey: 'orderId',
  as: 'order',
});

OrderItemModel.belongsTo(ProductModel, {
  foreignKey: 'productId',
  as: 'product',
});
OrderItemModel.belongsTo(ProductVariantModel, {
  foreignKey: 'variantId',
  as: 'variant',
});

// 8. Inventory Movements
ProductModel.hasMany(InventoryMovementModel, {
  foreignKey: 'productId',
  as: 'inventoryMovements',
  onDelete: 'CASCADE',
});
InventoryMovementModel.belongsTo(ProductModel, {
  foreignKey: 'productId',
  as: 'product',
});

ProductVariantModel.hasMany(InventoryMovementModel, {
  foreignKey: 'variantId',
  as: 'inventoryMovements',
  onDelete: 'CASCADE',
});
InventoryMovementModel.belongsTo(ProductVariantModel, {
  foreignKey: 'variantId',
  as: 'variant',
});

// 9. User <-> Wishlist
UserModel.hasMany(WishlistItemModel, {
  foreignKey: 'userId',
  as: 'wishlistItems',
  onDelete: 'CASCADE',
});
WishlistItemModel.belongsTo(UserModel, {
  foreignKey: 'userId',
  as: 'user',
});
WishlistItemModel.belongsTo(ProductModel, {
  foreignKey: 'productId',
  as: 'product',
});

// 10. Promotion <-> PromotionUsage
PromotionModel.hasMany(PromotionUsageModel, {
  foreignKey: 'promotionId',
  as: 'usages',
  onDelete: 'CASCADE',
});
PromotionUsageModel.belongsTo(PromotionModel, {
  foreignKey: 'promotionId',
  as: 'promotion',
});

// 11. Order <-> PromotionUsage
OrderModel.hasMany(PromotionUsageModel, {
  foreignKey: 'orderId',
  as: 'promotionUsages',
  onDelete: 'CASCADE',
});
PromotionUsageModel.belongsTo(OrderModel, {
  foreignKey: 'orderId',
  as: 'order',
});

// 12. User <-> PromotionUsage
UserModel.hasMany(PromotionUsageModel, {
  foreignKey: 'userId',
  as: 'promotionUsages',
  onDelete: 'SET NULL',
});
PromotionUsageModel.belongsTo(UserModel, {
  foreignKey: 'userId',
  as: 'user',
});

module.exports = {
  UserModel,
  CategoryModel,
  ProductModel,
  ProductVariantModel,
  CartModel,
  CartItemModel,
  InventoryMovementModel,
  AddressModel,
  OrderModel,
  OrderItemModel,
  WishlistItemModel,
  PromotionModel,
  PromotionUsageModel,
};
