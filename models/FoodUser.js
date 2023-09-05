const mongoose = require("mongoose");
const Order = require("./Order");
// const Product = require("./Product");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  family_name: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone_number: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  cart: {
    items: [
      {
        product: { type: Object, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    totalPrice: {
      type: Number,
      default: 0.0,
      required: true,
    },
  },
});

userSchema.methods.getCart = async function () {
  return this.cart;
};

userSchema.methods.addToCart = async function (product) {
  console.log(product._id);
  const prodIndex = this.cart.items.findIndex(
    (item) => item.product._id.toString() === product._id.toString()
  );
  console.log(prodIndex);
  if (prodIndex !== -1) {
    const oldQty = this.cart.items[prodIndex].quantity;
    this.cart.items[prodIndex] = {
      product,
      quantity: oldQty + 1,
    };
  } else {
    this.cart.items.push({ product, quantity: 1 });
  }
  this.cart.totalPrice =
    Number(this.cart.totalPrice.toFixed(2)) + Number(product.price);
  await this.save();
};

userSchema.methods.removeFromCart = async function (productId) {
  let updatedCart = {};

  const deletedItem = this.cart.items.find(
    (item) => item.product._id.toString() === productId
  );

  const updatedItems = this.cart.items.filter(
    (item) => item.product._id.toString() !== productId
  );

  updatedCart.items = updatedItems;

  updatedCart.totalPrice =
    this.cart.totalPrice -
    Number(deletedItem.product.price) * deletedItem.quantity;

  this.cart = updatedCart;

  console.log(updatedCart);

  await this.save();
};

userSchema.methods.getOrders = async function () {
  let orders = [];
  let priceFix = 0;
  orders = await Order.find({ user: this._id }).populate("items.product");
  let filteredOrders = [];
  let items = [];
  orders.map((order) => {
    order.items = order.items.filter((item) => {
      return item.product !== null && item.product !== undefined;
    });
    filteredOrders.push(order);
  });

  console.log(filteredOrders);

  filteredOrders.map(async (order) => {
    order.items.map((item) => {
      priceFix += Number(item.product.price) * item.quantity;
    });
    order.totalPrice = priceFix;
    if (order.totalPrice === 0) return await Order.findByIdAndRemove(order._id);
    await Order.findOneAndUpdate({ _id: order._id }, { $set: order });
  });

  if (filteredOrders.length > 0) return filteredOrders;

  return [];
};

userSchema.methods.makeOrder = async function () {
  let totalPrice = 0;
  const cart = this.cart;

  let items = [];

  // cart.items.map((item) => {
  //   const availableItem = Product.findById({ _id: item.product._id });
  //   if (!availableItem) return;
  //   items.push({
  //     product: item.product,
  //     quantity: Number(item.quantity),
  //   });
  // });

  items = cart.items;

  await this.save();

  items.map((item) => {
    totalPrice += Number(item.product.price) * Number(item.quantity);
  });

  if (items.length === 0 || items === undefined) return;

  const newOrder = await Order.create({
    user: this._id,
    items,
    totalPrice: Number(totalPrice),
  });

  if (newOrder) this.cart = { items: [], totalPrice: 0.0 };

  await this.save();
};
module.exports = mongoose.model("user", userSchema);
