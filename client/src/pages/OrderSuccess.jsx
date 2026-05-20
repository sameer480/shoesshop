import { Link, useParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const OrderSuccess = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("userInfo") || "null");
  const emailSent = location.state?.emailSent;
  const emailError = location.state?.emailError;
  const customerEmail = location.state?.customerEmail || user?.email;
  const paymentMethod = location.state?.paymentMethod;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#fff",
        fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          maxWidth: 520,
          width: "100%",
          background: "#141414",
          border: "1.5px solid #1f1f1f",
          borderRadius: 20,
          padding: 40,
          textAlign: "center",
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          style={{
            width: 80,
            height: 80,
            background: "linear-gradient(135deg, #16a34a, #15803d)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            boxShadow: "0 12px 30px rgba(22,163,74,0.4)",
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
        </motion.div>

        <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 8px" }}>
          Order <span style={{ color: "#16a34a" }}>Placed!</span>
        </h1>
        <p style={{ color: "#aaa", fontSize: 15, margin: "0 0 24px" }}>
          Thank you for shopping with us. Your order has been confirmed.
        </p>

        <div
          style={{
            background: "#1a1a1a",
            border: "1.5px solid #2a2a2a",
            borderRadius: 12,
            padding: 16,
            marginBottom: 18,
          }}
        >
          <div style={{ fontSize: 11, color: "#888", letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 }}>
            Order ID
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: "#fff",
              marginTop: 4,
              wordBreak: "break-all",
              fontFamily: "Consolas, monospace",
              letterSpacing: 0,
            }}
          >
            {orderId}
          </div>
        </div>

        {emailSent === true && customerEmail && (
          <div
            style={{
              background: "rgba(34,197,94,0.10)",
              border: "1px solid rgba(34,197,94,0.4)",
              borderRadius: 10,
              padding: "12px 14px",
              marginBottom: 18,
              fontSize: 13,
              color: "#22c55e",
              textAlign: "left",
            }}
          >
            ✓ {paymentMethod === "cod" ? "Order bill" : "Invoice + payment confirmation"} sent to{" "}
            <strong style={{ color: "#fff" }}>{customerEmail}</strong>
          </div>
        )}
        {emailSent === false && (
          <div
            style={{
              background: "rgba(227,28,28,0.10)",
              border: "1px solid rgba(227,28,28,0.5)",
              borderRadius: 10,
              padding: "12px 14px",
              marginBottom: 18,
              fontSize: 13,
              color: "#ff6b6b",
              textAlign: "left",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 4 }}>⚠ Email not sent</div>
            <div style={{ color: "#aaa", fontSize: 12 }}>{emailError}</div>
            <div style={{ color: "#888", fontSize: 11, marginTop: 6 }}>
              Your order is saved. Fix the email config in <code>server/.env</code> and the next order will send.
            </div>
          </div>
        )}
        {emailSent === undefined && user?.email && (
          <p style={{ color: "#888", fontSize: 13, margin: "0 0 24px" }}>
            A confirmation email will be sent to{" "}
            <span style={{ color: "#fff", fontWeight: 700 }}>{user.email}</span>
          </p>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            to="/shop"
            style={{
              display: "inline-block",
              background: "linear-gradient(135deg, #e31c1c, #b01010)",
              color: "#fff",
              textDecoration: "none",
              padding: "13px 26px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: 2,
              textTransform: "uppercase",
              boxShadow: "0 8px 20px rgba(227,28,28,0.3)",
            }}
          >
            Continue Shopping
          </Link>
          <Link
            to="/"
            style={{
              display: "inline-block",
              background: "transparent",
              color: "#fff",
              textDecoration: "none",
              padding: "13px 26px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              border: "1.5px solid #2a2a2a",
            }}
          >
            Go Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
