const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: String,
    name: String,
    brand: String,
    price: Number,
    image: String,
    color: String,
    size: Number,
    quantity: Number,
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    altMobile: String,
    pincode: { type: String, required: true },
    address: { type: String, required: true },
    landmark: String,
    city: String,
    state: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    customerEmail: String,
    items: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    subtotal: Number,
    shippingFee: Number,
    total: Number,
    paymentMethod: {
      type: String,
      enum: ["upi", "cod"],
    },
    customerUpi: String,
    merchantUpi: String,
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentRef: String,
    orderStatus: {
      type: String,
      enum: ["placed", "shipped", "delivered", "cancelled"],
      default: "placed",
    },
    cancelledAt: Date,
    cancelReason: String,
    shippedAt: Date,
    deliveredAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
