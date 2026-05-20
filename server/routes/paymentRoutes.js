const express = require("express");
const {
  checkDelivery,
  createOrder,
  confirmPayment,
  getOrder,
  listMyOrders,
  cancelOrder,
  markDelivered,
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/delivery/:pincode", checkDelivery);
router.post("/orders", protect, createOrder);
router.post("/orders/:id/confirm", confirmPayment);
router.get("/orders/me", protect, listMyOrders);
router.patch("/orders/:id/cancel", protect, cancelOrder);
router.patch("/orders/:id/mark-delivered", protect, markDelivered);
router.get("/orders/:id", getOrder);

module.exports = router;
