import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getCart, removeFromCart, clearCart } from "../utils/cart";
import AuthNav from "../components/AuthNav";
import CartIcon from "../components/CartIcon";
import { FALLBACK_SHOE_IMG } from "../data/shoes";

const Cart = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState(getCart());

  useEffect(() => {
    const update = () => setItems(getCart());
    window.addEventListener("cart-updated", update);
    return () => window.removeEventListener("cart-updated", update);
  }, []);

  const updateQuantity = (key, delta) => {
    const next = items.map((it) =>
      it.key === key ? { ...it, quantity: Math.max(1, it.quantity + delta) } : it
    );
    localStorage.setItem("cart", JSON.stringify(next));
    window.dispatchEvent(new Event("cart-updated"));
  };

  const handleRemove = (key) => {
    removeFromCart(key);
  };

  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
  const shipping = items.length > 0 ? 99 : 0;
  const total = subtotal + shipping;

  const handleProceedToBuy = () => {
    const user = localStorage.getItem("userInfo");
    if (!user) {
      alert("Please log in to proceed to checkout");
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#fff",
        fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
      }}
    >
      {/* Navbar */}
      <nav
        className="page-nav"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "18px 32px",
          borderBottom: "1px solid #1a1a1a",
          position: "sticky",
          top: 0,
          background: "rgba(10,10,10,0.92)",
          backdropFilter: "blur(12px)",
          zIndex: 100,
        }}
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            color: "#fff",
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              background: "#e31c1c",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z" />
            </svg>
          </div>
          <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase" }}>
            ShoeHub
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <CartIcon />
          <AuthNav />
        </div>
      </nav>

      <div
        className="cart-container"
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "50px 32px 80px",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 900,
            letterSpacing: 1,
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          Your <span style={{ color: "#e31c1c" }}>Cart</span>
        </h1>
        <p style={{ color: "#888", fontSize: 15, marginTop: 6 }}>
          {items.length === 0
            ? "Nothing here yet."
            : `${items.length} item${items.length > 1 ? "s" : ""} in your bag`}
        </p>

        {items.length === 0 ? (
          <div
            style={{
              marginTop: 60,
              textAlign: "center",
              padding: 60,
              background: "#141414",
              border: "1.5px dashed #2a2a2a",
              borderRadius: 20,
            }}
          >
            <svg width="56" height="56" viewBox="0 0 24 24" fill="#333" style={{ marginBottom: 16 }}>
              <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0 0 20 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
            <p style={{ color: "#888", fontSize: 16, marginBottom: 24 }}>
              Your cart is empty. Start shopping!
            </p>
            <Link
              to="/shop"
              style={{
                display: "inline-block",
                background: "linear-gradient(135deg, #e31c1c, #b01010)",
                color: "#fff",
                textDecoration: "none",
                padding: "14px 32px",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 800,
                letterSpacing: 2,
                textTransform: "uppercase",
                boxShadow: "0 8px 24px rgba(227,28,28,0.35)",
              }}
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div
            className="cart-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 360px",
              gap: 30,
              marginTop: 30,
              alignItems: "start",
            }}
          >
            {/* Items list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <AnimatePresence>
                {items.map((it) => (
                  <motion.div
                    key={it.key}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.25 }}
                    className="cart-item"
                    style={{
                      display: "flex",
                      gap: 16,
                      background: "#141414",
                      border: "1.5px solid #1f1f1f",
                      borderRadius: 16,
                      padding: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: 12,
                        overflow: "hidden",
                        flexShrink: 0,
                        background: "#0e0e0e",
                      }}
                    >
                      <img
                        src={it.image}
                        alt={it.name}
                        onError={(e) => {
                          if (e.currentTarget.src !== FALLBACK_SHOE_IMG) {
                            e.currentTarget.src = FALLBACK_SHOE_IMG;
                          }
                        }}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>

                    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ color: "#e31c1c", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
                          {it.brand}
                        </div>
                        <h3
                          style={{
                            margin: "2px 0 4px",
                            fontSize: 16,
                            fontWeight: 700,
                            color: "#fff",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {it.name}
                        </h3>
                        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                          {it.color && (
                            <span style={{ fontSize: 12, color: "#888" }}>
                              Color: <span style={{ color: "#bbb", fontWeight: 600 }}>{it.color}</span>
                            </span>
                          )}
                          {it.size && (
                            <span style={{ fontSize: 12, color: "#888" }}>
                              Size: <span style={{ color: "#bbb", fontWeight: 600 }}>UK {it.size}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 6 }}>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            background: "#1a1a1a",
                            border: "1.5px solid #2a2a2a",
                            borderRadius: 100,
                            overflow: "hidden",
                          }}
                        >
                          <button
                            onClick={() => updateQuantity(it.key, -1)}
                            style={qtyBtn}
                            disabled={it.quantity <= 1}
                          >
                            −
                          </button>
                          <span style={{ padding: "0 14px", fontWeight: 800, fontSize: 14 }}>
                            {it.quantity}
                          </span>
                          <button onClick={() => updateQuantity(it.key, +1)} style={qtyBtn}>
                            +
                          </button>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 17, fontWeight: 900, color: "#fff" }}>
                            ₹{(it.price * it.quantity).toLocaleString("en-IN")}
                          </span>
                          <button
                            onClick={() => handleRemove(it.key)}
                            title="Remove"
                            style={{
                              background: "transparent",
                              border: "1.5px solid #2a2a2a",
                              color: "#ff6b6b",
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontFamily: "inherit",
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <button
                onClick={() => {
                  if (confirm("Clear all items from cart?")) clearCart();
                }}
                style={{
                  alignSelf: "flex-start",
                  background: "transparent",
                  border: "none",
                  color: "#666",
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontSize: 13,
                  fontFamily: "inherit",
                  marginTop: 8,
                }}
              >
                Clear cart
              </button>
            </div>

            {/* Summary */}
            <aside
              className="cart-summary"
              style={{
                background: "#141414",
                border: "1.5px solid #1f1f1f",
                borderRadius: 20,
                padding: 24,
                position: "sticky",
                top: 100,
              }}
            >
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  margin: "0 0 18px",
                  color: "#fff",
                }}
              >
                Order Summary
              </h2>

              <Row
                label={`Subtotal (${items.length} item${items.length > 1 ? "s" : ""})`}
                value={`₹${subtotal.toLocaleString("en-IN")}`}
              />
              <Row label="Shipping" value={`₹${shipping}`} />
              <div style={{ height: 1, background: "#222", margin: "14px 0" }} />
              <Row label="Total" value={`₹${total.toLocaleString("en-IN")}`} big />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleProceedToBuy}
                style={{
                  width: "100%",
                  marginTop: 20,
                  background: "linear-gradient(135deg, #e31c1c, #b01010)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "16px",
                  fontSize: 15,
                  fontWeight: 800,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  boxShadow: "0 8px 24px rgba(227,28,28,0.35)",
                }}
              >
                Proceed to Buy
              </motion.button>

              <Link
                to="/shop"
                style={{
                  display: "block",
                  textAlign: "center",
                  marginTop: 12,
                  color: "#888",
                  fontSize: 13,
                  textDecoration: "underline",
                }}
              >
                Continue shopping
              </Link>
            </aside>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .cart-container { padding: 30px 16px 60px !important; }
          .cart-grid { grid-template-columns: 1fr !important; }
          .cart-summary { position: static !important; }
        }
        @media (max-width: 480px) {
          .cart-item { flex-direction: column; }
          .cart-item > div:first-child { width: 100% !important; height: 180px !important; }
        }
      `}</style>
    </div>
  );
};

const qtyBtn = {
  background: "transparent",
  color: "#fff",
  border: "none",
  width: 32,
  height: 32,
  fontSize: 18,
  cursor: "pointer",
  fontFamily: "inherit",
};

const Row = ({ label, value, big }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      padding: "6px 0",
    }}
  >
    <span
      style={{
        color: big ? "#fff" : "#888",
        fontSize: big ? 16 : 14,
        fontWeight: big ? 800 : 500,
        letterSpacing: big ? 1 : 0,
        textTransform: big ? "uppercase" : "none",
      }}
    >
      {label}
    </span>
    <span style={{ color: "#fff", fontSize: big ? 22 : 14, fontWeight: big ? 900 : 700 }}>
      {value}
    </span>
  </div>
);

export default Cart;
