const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: String,
    productId: { type: String, required: true },
    productName: String,
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: String,
    comment: String,
  },
  { timestamps: true }
);

reviewSchema.index({ user: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
