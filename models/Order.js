const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  items: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: "product",
      },
      quantity: { type: Number, required: true },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0,
  },
});

// orderSchema.methods.addProducts = async function(product) {
//   console.log(product)
// }

module.exports = mongoose.model("order", orderSchema);
