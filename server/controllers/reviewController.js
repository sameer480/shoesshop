const Review = require("../models/Review");
const Order = require("../models/Order");

const createReview = async (req, res) => {
  try {
    const { productId, productName, orderId, rating, title, comment } = req.body;

    if (!productId) return res.status(400).json({ message: "productId required" });
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be 1-5" });
    }

    // Verify the user actually received this product (delivered order)
    const deliveredOrder = await Order.findOne({
      $or: [{ user: req.user._id }, { customerEmail: req.user.email }],
      "items.productId": productId,
      orderStatus: "delivered",
    });
    if (!deliveredOrder) {
      const anyOrder = await Order.findOne({
        $or: [{ user: req.user._id }, { customerEmail: req.user.email }],
        "items.productId": productId,
      });
      if (!anyOrder) {
        return res
          .status(403)
          .json({ message: "You can only review products you have purchased" });
      }
      return res
        .status(403)
        .json({
          message:
            "You can review this product only after it has been delivered",
        });
    }

    const review = await Review.findOneAndUpdate(
      { user: req.user._id, productId },
      {
        user: req.user._id,
        userName: req.user.name,
        productId,
        productName,
        orderId,
        rating,
        title,
        comment,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const listMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const listProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .sort({ updatedAt: -1 })
      .limit(50);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReview, listMyReviews, listProductReviews };
