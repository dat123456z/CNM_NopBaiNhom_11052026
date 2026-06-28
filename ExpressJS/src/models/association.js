const User = require('./User');
const Shop = require('./Shop');
const Product = require('./Product');
const { Order, OrderItem } = require('./Order');
const CartItem = require('./CartItem');
const Coupon = require('./Coupon');
const { ProductReview, ShopReview, OrderReview } = require('./Review');
const WalletTransaction = require('./WalletTransaction');
const Wishlist = require('./Wishlist');
const Verification = require('./Verification');
const Shipper = require('./Shipper');
const ProductAlert = require('./ProductAlert');

User.hasOne(Shop, { foreignKey: 'userId', as: 'shop' });
Shop.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

Shop.hasMany(Product, { foreignKey: 'shopId', as: 'products' });
Product.belongsTo(Shop, { foreignKey: 'shopId', as: 'shop' });

User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Shop.hasMany(Order, { foreignKey: 'shopId', as: 'orders' });
Order.belongsTo(Shop, { foreignKey: 'shopId', as: 'shop' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

User.hasMany(CartItem, { foreignKey: 'userId', as: 'cartItems' });
CartItem.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Product.hasMany(CartItem, { foreignKey: 'productId', as: 'cartItems' });
CartItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

User.hasMany(Wishlist, { foreignKey: 'userId', as: 'wishlist' });
Wishlist.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Product.hasMany(Wishlist, { foreignKey: 'productId', as: 'wishedBy' });
Wishlist.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

User.hasMany(ProductAlert, { foreignKey: 'userId', as: 'productAlerts' });
ProductAlert.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Product.hasMany(ProductAlert, { foreignKey: 'productId', as: 'alerts' });
ProductAlert.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Shop.hasMany(Coupon, { foreignKey: 'shopId', as: 'coupons' });
Coupon.belongsTo(Shop, { foreignKey: 'shopId', as: 'shop' });

User.hasMany(Coupon, { foreignKey: 'userId', as: 'coupons' });
Coupon.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(ProductReview, { foreignKey: 'userId', as: 'productReviews' });
ProductReview.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Product.hasMany(ProductReview, { foreignKey: 'productId', as: 'reviews' });
ProductReview.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Order.hasMany(ProductReview, { foreignKey: 'orderId', as: 'productReviews' });

User.hasMany(ShopReview, { foreignKey: 'userId', as: 'shopReviews' });
ShopReview.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Shop.hasMany(ShopReview, { foreignKey: 'shopId', as: 'reviews' });
ShopReview.belongsTo(Shop, { foreignKey: 'shopId', as: 'shop' });
Order.hasOne(ShopReview, { foreignKey: 'orderId', as: 'shopReview' });

User.hasOne(OrderReview, { foreignKey: 'userId', as: 'orderReview' });
OrderReview.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Order.hasOne(OrderReview, { foreignKey: 'orderId', as: 'review' });
OrderReview.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

Shop.hasMany(WalletTransaction, { foreignKey: 'shopId', as: 'transactions' });
WalletTransaction.belongsTo(Shop, { foreignKey: 'shopId', as: 'shop' });
Order.hasMany(WalletTransaction, { foreignKey: 'orderId', as: 'walletTransactions' });

Shop.hasMany(Shipper, { foreignKey: 'shopId', as: 'shippers' });
Shipper.belongsTo(Shop, { foreignKey: 'shopId', as: 'shop' });

Order.belongsTo(Shipper, { foreignKey: 'shipperId', as: 'shipper' });
Shipper.hasMany(Order, { foreignKey: 'shipperId', as: 'orders' });

module.exports = {
    User, Shop, Product,
    Order, OrderItem,
    CartItem, Coupon,
    ProductReview, ShopReview, OrderReview,
    WalletTransaction, Wishlist, Verification,
    Shipper, ProductAlert
};
