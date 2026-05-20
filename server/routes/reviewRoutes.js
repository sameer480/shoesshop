const express = require("express");
const {
  createReview,
  listMyReviews,
  listProductReviews,
} = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createReview);
router.get("/me", protect, listMyReviews);
router.get("/product/:productId", listProductReviews);

module.exports = router;
