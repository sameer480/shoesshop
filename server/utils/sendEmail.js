const nodemailer = require("nodemailer");

const getTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error("EMAIL_USER / EMAIL_PASS missing from server/.env");
  }
  if (user.includes("your-gmail-here") || user === "your-gmail-here@gmail.com") {
    throw new Error(
      "EMAIL_USER is still the placeholder. Set it to your real Gmail address in server/.env"
    );
  }
  if (!/^[^@\s]+@gmail\.com$/i.test(user)) {
    throw new Error(
      `EMAIL_USER must be a Gmail address (got "${user}"). Update server/.env`
    );
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass: pass.replace(/\s+/g, "") },
  });
};

const sendOTPEmail = async (to, otp) => {
  const transporter = getTransporter();
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; background: #0a0a0a; color: #fff; border-radius: 12px;">
      <h2 style="color: #e31c1c; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 12px;">ShoeHub</h2>
      <p style="color: #ccc; margin: 0 0 18px;">You requested a password reset. Use the OTP below to verify your identity:</p>
      <div style="background: #1a1a1a; border: 1.5px solid #2a2a2a; border-radius: 12px; padding: 22px; text-align: center; margin: 18px 0;">
        <div style="font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #fff;">${otp}</div>
      </div>
      <p style="color: #888; font-size: 13px; margin: 0;">This code will expire in <strong>10 minutes</strong>. If you did not request a password reset, you can safely ignore this email.</p>
    </div>
  `;
  await transporter.sendMail({
    from: `"ShoeHub" <${process.env.EMAIL_USER}>`,
    to,
    subject: "ShoeHub — Password Reset OTP",
    html,
  });
};

const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const sendOrderConfirmationEmail = async (to, order) => {
  const transporter = getTransporter();

  const itemsRows = order.items
    .map(
      (it) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #2a2a2a; color: #fff;">
          <div style="font-weight: 700;">${it.name}</div>
          <div style="font-size: 12px; color: #888; margin-top: 3px;">
            ${it.color ? `Color: ${it.color}` : ""}${it.size ? ` &nbsp;|&nbsp; Size: UK ${it.size}` : ""} &nbsp;|&nbsp; Qty: ${it.quantity}
          </div>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #2a2a2a; color: #fff; text-align: right; font-weight: 700; white-space: nowrap;">
          ${inr(it.price * it.quantity)}
        </td>
      </tr>`
    )
    .join("");

  const addr = order.shippingAddress;

  const isUpi = order.paymentMethod === "upi";
  const isCod = order.paymentMethod === "cod";
  const headline = isCod
    ? "Order Placed — Cash on Delivery"
    : "Payment Received — Invoice";
  const payLineDetail = isUpi
    ? `<div style="margin-top:6px;font-size:12px;color:#888;">Paid by ${order.customerUpi || "UPI"} → ${order.merchantUpi}</div>`
    : isCod
    ? `<div style="margin-top:6px;font-size:12px;color:#888;">Amount payable in cash on delivery</div>`
    : "";

  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 580px; margin: auto; padding: 24px; background: #0a0a0a; color: #fff; border-radius: 14px;">
    <h2 style="color: #e31c1c; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 6px;">ShoeHub</h2>
    <h1 style="margin: 0 0 6px; font-size: 24px;">${headline}</h1>
    <p style="color: #aaa; margin: 0 0 22px;">Thanks for your order, ${addr.name}!</p>

    <div style="background: #141414; border: 1.5px solid #2a2a2a; border-radius: 12px; padding: 16px; margin-bottom: 18px;">
      <div style="font-size: 12px; color: #888; letter-spacing: 2px; text-transform: uppercase;">Order ID</div>
      <div style="font-size: 16px; font-weight: 700; color: #fff; margin-top: 4px;">${order._id}</div>
      <div style="margin-top: 10px; font-size: 13px; color: #aaa;">Payment: <strong style="color:#fff;">${order.paymentMethod.toUpperCase()}</strong> &nbsp;•&nbsp; Status: <strong style="color:${order.paymentStatus === "paid" ? "#22c55e" : "#f59e0b"};">${order.paymentStatus.toUpperCase()}</strong></div>
      ${payLineDetail}
    </div>

    <h3 style="font-size: 14px; letter-spacing: 2px; text-transform: uppercase; color: #aaa; margin: 18px 0 10px;">Items</h3>
    <table style="width: 100%; border-collapse: collapse; background: #141414; border-radius: 12px; overflow: hidden;">
      ${itemsRows}
      <tr>
        <td style="padding: 10px; color: #888;">Subtotal</td>
        <td style="padding: 10px; text-align: right; color: #fff;">${inr(order.subtotal)}</td>
      </tr>
      <tr>
        <td style="padding: 10px; color: #888;">Shipping</td>
        <td style="padding: 10px; text-align: right; color: #fff;">${inr(order.shippingFee)}</td>
      </tr>
      <tr>
        <td style="padding: 14px 10px; color: #fff; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; border-top: 1px solid #2a2a2a;">Total</td>
        <td style="padding: 14px 10px; text-align: right; color: #fff; font-size: 18px; font-weight: 900; border-top: 1px solid #2a2a2a;">${inr(order.total)}</td>
      </tr>
    </table>

    <h3 style="font-size: 14px; letter-spacing: 2px; text-transform: uppercase; color: #aaa; margin: 22px 0 10px;">Delivery Address</h3>
    <div style="background: #141414; border: 1.5px solid #2a2a2a; border-radius: 12px; padding: 14px; color: #ccc; font-size: 14px; line-height: 1.55;">
      <div style="font-weight: 700; color: #fff;">${addr.name}</div>
      <div>${addr.address}</div>
      ${addr.landmark ? `<div>Landmark: ${addr.landmark}</div>` : ""}
      <div>${addr.city || ""}${addr.state ? `, ${addr.state}` : ""} - ${addr.pincode}</div>
      <div>Mobile: ${addr.mobile}${addr.altMobile ? ` &nbsp;|&nbsp; Alt: ${addr.altMobile}` : ""}</div>
    </div>

    <p style="color: #888; font-size: 13px; margin-top: 22px;">
      Expected delivery in 3–5 business days. We'll email you again when your order ships.
    </p>
    <p style="color: #555; font-size: 12px; margin-top: 6px;">— Team ShoeHub</p>
  </div>
  `;

  await transporter.sendMail({
    from: `"ShoeHub" <${process.env.EMAIL_USER}>`,
    to,
    subject: `ShoeHub Order Confirmed — ${order._id}`,
    html,
  });
};

const sendOrderCancelledEmail = async (to, order) => {
  const transporter = getTransporter();
  const addr = order.shippingAddress || {};
  const wasPaid = order.paymentStatus === "refunded";

  const itemsRows = order.items
    .map(
      (it) => `
      <tr>
        <td style="padding: 8px 10px; border-bottom: 1px solid #2a2a2a; color: #ccc; font-size: 13px;">
          ${it.name}
          <div style="font-size: 11px; color: #888; margin-top: 2px;">
            ${it.color ? `Color: ${it.color}` : ""}${it.size ? ` &nbsp;|&nbsp; Size: UK ${it.size}` : ""} &nbsp;|&nbsp; Qty: ${it.quantity}
          </div>
        </td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #2a2a2a; color: #ccc; font-size: 13px; text-align: right; white-space: nowrap;">
          ${inr(it.price * it.quantity)}
        </td>
      </tr>`
    )
    .join("");

  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 580px; margin: auto; padding: 24px; background: #0a0a0a; color: #fff; border-radius: 14px;">
    <h2 style="color: #e31c1c; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 6px;">ShoeHub</h2>
    <h1 style="margin: 0 0 6px; font-size: 24px;">Order Cancelled</h1>
    <p style="color: #aaa; margin: 0 0 22px;">Hi ${addr.name || "there"}, your order has been cancelled as requested.</p>

    <div style="background: #2a0f0f; border: 1.5px solid #5a1a1a; border-radius: 12px; padding: 16px; margin-bottom: 18px;">
      <div style="font-size: 12px; color: #ff8c8c; letter-spacing: 2px; text-transform: uppercase;">Cancelled Order</div>
      <div style="font-size: 16px; font-weight: 700; color: #fff; margin-top: 4px;">${order._id}</div>
      <div style="margin-top: 10px; font-size: 13px; color: #ccc;">
        Cancelled on ${new Date(order.cancelledAt || Date.now()).toLocaleString("en-IN")}
      </div>
      ${order.cancelReason ? `<div style="margin-top: 4px; font-size: 12px; color: #999;">Reason: ${order.cancelReason}</div>` : ""}
    </div>

    ${
      wasPaid
        ? `<div style="background: rgba(34,197,94,0.10); border: 1px solid rgba(34,197,94,0.4); border-radius: 12px; padding: 14px; margin-bottom: 18px; color: #86efac; font-size: 13px;">
            💰 Your payment of <strong style="color:#fff;">${inr(order.total)}</strong> will be refunded to your original payment method within 5-7 business days.
          </div>`
        : order.paymentMethod === "cod"
        ? `<div style="background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.3); border-radius: 12px; padding: 14px; margin-bottom: 18px; color: #fbbf24; font-size: 13px;">
            No payment was processed for this Cash on Delivery order — nothing to refund.
          </div>`
        : ""
    }

    <h3 style="font-size: 14px; letter-spacing: 2px; text-transform: uppercase; color: #aaa; margin: 18px 0 10px;">Cancelled Items</h3>
    <table style="width: 100%; border-collapse: collapse; background: #141414; border-radius: 12px; overflow: hidden;">
      ${itemsRows}
      <tr>
        <td style="padding: 12px 10px; color: #fff; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; border-top: 1px solid #2a2a2a;">Total</td>
        <td style="padding: 12px 10px; text-align: right; color: #fff; font-size: 16px; font-weight: 900; border-top: 1px solid #2a2a2a;">${inr(order.total)}</td>
      </tr>
    </table>

    <p style="color: #888; font-size: 13px; margin-top: 22px;">
      Changed your mind? <a href="#" style="color: #e31c1c; text-decoration: none; font-weight: 700;">Browse our latest collection</a> and place a new order.
    </p>
    <p style="color: #555; font-size: 12px; margin-top: 6px;">— Team ShoeHub</p>
  </div>
  `;

  await transporter.sendMail({
    from: `"ShoeHub" <${process.env.EMAIL_USER}>`,
    to,
    subject: `ShoeHub Order Cancelled — ${order._id}`,
    html,
  });
};

module.exports = {
  sendOTPEmail,
  sendOrderConfirmationEmail,
  sendOrderCancelledEmail,
};
