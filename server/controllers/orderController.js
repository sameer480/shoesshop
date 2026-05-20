const Order = require("../models/Order");
const { checkPincode } = require("../utils/pincodeService");
const {
  sendOrderConfirmationEmail,
  sendOrderCancelledEmail,
} = require("../utils/sendEmail");

const merchant = () => ({
  upi: process.env.MERCHANT_UPI_ID || "shoehub@upi",
  name: process.env.MERCHANT_NAME || "ShoeHub Store",
  bank: process.env.MERCHANT_BANK || "DummyBank Demo",
  account: process.env.MERCHANT_ACCOUNT || "1234567890123",
  ifsc: process.env.MERCHANT_IFSC || "DUMM0000123",
});

const UPI_VPA_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

const checkDelivery = async (req, res) => {
  try {
    const { pincode } = req.params;
    const result = await checkPincode(pincode);
    if (!result.ok) return res.status(400).json(result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, customerEmail, customerUpi } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }
    if (!shippingAddress?.pincode) {
      return res.status(400).json({ message: "Shipping address is required" });
    }
    if (!["upi", "cod"].includes(paymentMethod)) {
      return res.status(400).json({ message: "Payment method must be UPI or COD" });
    }
    if (paymentMethod === "upi") {
      if (!customerUpi || !UPI_VPA_REGEX.test(customerUpi)) {
        return res.status(400).json({
          message: "Please enter a valid UPI ID (example: name@okhdfcbank)",
        });
      }
    }

    const pincodeCheck = await checkPincode(shippingAddress.pincode);
    if (!pincodeCheck.ok) {
      return res.status(400).json({ message: pincodeCheck.message });
    }

    const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
    const shippingFee = 99;
    const total = subtotal + shippingFee;

    const m = merchant();

    const order = await Order.create({
      user: req.user._id,
      customerEmail: customerEmail || req.user.email,
      items: items.map((it) => ({
        productId: it.id,
        name: it.name,
        brand: it.brand,
        price: it.price,
        image: it.image,
        color: it.color,
        size: it.size,
        quantity: it.quantity,
      })),
      shippingAddress: {
        ...shippingAddress,
        city: pincodeCheck.city,
        state: pincodeCheck.state,
      },
      subtotal,
      shippingFee,
      total,
      paymentMethod,
      customerUpi: paymentMethod === "upi" ? customerUpi : undefined,
      merchantUpi: paymentMethod === "upi" ? m.upi : undefined,
      paymentStatus: "pending",
    });

    // Build a UPI deep link the client can open / show as QR
    const upiDeepLink =
      paymentMethod === "upi"
        ? `upi://pay?pa=${encodeURIComponent(m.upi)}&pn=${encodeURIComponent(
            m.name
          )}&am=${total}&cu=INR&tn=${encodeURIComponent(`ShoeHub-${order._id}`)}`
        : null;

    res.status(201).json({
      orderId: order._id,
      total: order.total,
      etaDays: pincodeCheck.etaDays,
      upiDeepLink,
      merchant: paymentMethod === "upi" ? m : undefined,
    });
  } catch (error) {
    console.error("createOrder error:", error);
    res.status(500).json({ message: error.message });
  }
};

const confirmPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentRef } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.paymentMethod === "cod") {
      order.paymentStatus = "pending"; // money collected on delivery
    } else {
      order.paymentStatus = "paid";
    }
    order.paymentRef = paymentRef || `SIM-${Date.now()}`;
    await order.save();

    // Send invoice email — surface failure to client
    let emailSent = false;
    let emailError = null;

    if (order.customerEmail) {
      try {
        await sendOrderConfirmationEmail(order.customerEmail, order);
        emailSent = true;
        console.log(`✓ Invoice email sent to ${order.customerEmail}`);
      } catch (mailErr) {
        emailError = mailErr.message;
        console.error("\n✗ INVOICE EMAIL FAILED:", mailErr.message);
        console.error(
          `  → Check EMAIL_USER and EMAIL_PASS in server/.env`
        );
        console.error(`  → EMAIL_USER currently = "${process.env.EMAIL_USER}"\n`);
      }
    } else {
      emailError = "No customer email on order";
    }

    res.json({
      orderId: order._id,
      paymentStatus: order.paymentStatus,
      message: "Order confirmed",
      emailSent,
      emailError,
      customerEmail: order.customerEmail,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const listMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ user: req.user._id }, { customerEmail: req.user.email }],
    })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const isOwner =
      (order.user && order.user.toString() === req.user._id.toString()) ||
      order.customerEmail === req.user.email;
    if (!isOwner) {
      return res.status(403).json({ message: "Not your order" });
    }

    if (order.orderStatus === "cancelled") {
      return res.status(400).json({ message: "Order is already cancelled" });
    }
    if (order.orderStatus === "delivered") {
      return res
        .status(400)
        .json({ message: "Delivered orders cannot be cancelled" });
    }
    if (order.orderStatus === "shipped") {
      return res
        .status(400)
        .json({ message: "Order already shipped — please refuse delivery instead" });
    }

    order.orderStatus = "cancelled";
    order.cancelledAt = new Date();
    order.cancelReason = req.body.reason || "Cancelled by user";
    if (order.paymentStatus === "paid") {
      order.paymentStatus = "refunded";
    }
    await order.save();

    // Send cancellation email — best effort
    let emailSent = false;
    let emailError = null;
    if (order.customerEmail) {
      try {
        await sendOrderCancelledEmail(order.customerEmail, order);
        emailSent = true;
        console.log(`✓ Cancellation email sent to ${order.customerEmail}`);
      } catch (mailErr) {
        emailError = mailErr.message;
        console.error("\n✗ CANCELLATION EMAIL FAILED:", mailErr.message);
        console.error(`  → EMAIL_USER = "${process.env.EMAIL_USER}"\n`);
      }
    }

    res.json({
      orderId: order._id,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      message: "Order cancelled successfully",
      emailSent,
      emailError,
      customerEmail: order.customerEmail,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const isOwner =
      (order.user && order.user.toString() === req.user._id.toString()) ||
      order.customerEmail === req.user.email;
    if (!isOwner) {
      return res.status(403).json({ message: "Not your order" });
    }
    if (order.orderStatus === "cancelled") {
      return res
        .status(400)
        .json({ message: "Cancelled order cannot be marked delivered" });
    }
    if (order.orderStatus === "delivered") {
      return res.status(400).json({ message: "Order already delivered" });
    }

    const now = new Date();
    if (!order.shippedAt) order.shippedAt = now;
    order.deliveredAt = now;
    order.orderStatus = "delivered";
    await order.save();

    res.json({
      orderId: order._id,
      orderStatus: order.orderStatus,
      deliveredAt: order.deliveredAt,
      message: "Order marked as delivered",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  checkDelivery,
  createOrder,
  confirmPayment,
  getOrder,
  listMyOrders,
  cancelOrder,
  markDelivered,
};
