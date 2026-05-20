import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  listMyOrders,
  cancelOrder,
  markDelivered,
} from "../services/paymentService";
import { submitReview, listMyReviews } from "../services/reviewService";
import AuthNav from "../components/AuthNav";
import CartIcon from "../components/CartIcon";
import StarRating from "../components/StarRating";
import { FALLBACK_SHOE_IMG } from "../data/shoes";

const STATUS_COLOR = {
  placed: { bg: "#1e3a8a", text: "#93c5fd" },
  shipped: { bg: "#5b21b6", text: "#c4b5fd" },
  delivered: { bg: "#14532d", text: "#86efac" },
  cancelled: { bg: "#7f1d1d", text: "#fca5a5" },
};

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [reviewsByProduct, setReviewsByProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reviewModal, setReviewModal] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [deliveringId, setDeliveringId] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("userInfo");
    if (!user) {
      navigate("/login");
      return;
    }
    refresh();
  }, [navigate]);

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const [orderData, reviewData] = await Promise.all([
        listMyOrders(),
        listMyReviews(),
      ]);
      setOrders(orderData);
      const map = {};
      reviewData.forEach((r) => (map[r.productId] = r));
      setReviewsByProduct(map);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (orderId, item) => {
    const existing = reviewsByProduct[item.productId];
    setRating(existing?.rating || 0);
    setReviewTitle(existing?.title || "");
    setReviewText(existing?.comment || "");
    setReviewError("");
    setReviewModal({ orderId, item });
  };

  const closeReviewModal = () => {
    setReviewModal(null);
    setRating(0);
    setReviewTitle("");
    setReviewText("");
    setReviewError("");
  };

  const handleSubmitReview = async () => {
    if (!reviewModal) return;
    if (rating < 1) {
      setReviewError("Please select a star rating");
      return;
    }
    setSubmittingReview(true);
    setReviewError("");
    try {
      const review = await submitReview({
        productId: reviewModal.item.productId,
        productName: reviewModal.item.name,
        orderId: reviewModal.orderId,
        rating,
        title: reviewTitle,
        comment: reviewText,
      });
      setReviewsByProduct((prev) => ({
        ...prev,
        [review.productId]: review,
      }));
      closeReviewModal();
    } catch (err) {
      setReviewError(err?.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCancel = async (orderId) => {
    setCancellingId(orderId);
    try {
      const res = await cancelOrder(orderId, "User cancelled from orders page");
      setCancelTarget(null);
      await refresh();
      if (res.emailSent) {
        setToast(`Order cancelled. Confirmation sent to ${res.customerEmail}`);
      } else if (res.emailError) {
        setToast(`Order cancelled. (Email failed: ${res.emailError})`);
      } else {
        setToast("Order cancelled");
      }
      setTimeout(() => setToast(""), 3500);
    } catch (err) {
      alert(err?.response?.data?.message || "Cancel failed");
    } finally {
      setCancellingId(null);
    }
  };

  const handleMarkDelivered = async (orderId) => {
    setDeliveringId(orderId);
    try {
      await markDelivered(orderId);
      await refresh();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to mark delivered");
    } finally {
      setDeliveringId(null);
    }
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
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "18px 32px", borderBottom: "1px solid #1a1a1a",
          position: "sticky", top: 0, background: "rgba(10,10,10,0.92)",
          backdropFilter: "blur(12px)", zIndex: 100,
        }}
      >
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff", textDecoration: "none" }}>
          <div style={{ width: 34, height: 34, background: "#e31c1c", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z" />
            </svg>
          </div>
          <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase" }}>ShoeHub</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <CartIcon />
          <AuthNav />
        </div>
      </nav>

      <div className="orders-container" style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 32px 80px" }}>
        <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 900, letterSpacing: 1, textTransform: "uppercase", margin: 0 }}>
          My <span style={{ color: "#e31c1c" }}>Orders</span>
        </h1>
        <p style={{ color: "#888", fontSize: 15, marginTop: 6 }}>
          {loading ? "Loading..." : orders.length === 0 ? "You haven't placed any orders yet." : `${orders.length} order${orders.length > 1 ? "s" : ""}`}
        </p>

        {error && (
          <div style={{ marginTop: 20, padding: 14, background: "rgba(227,28,28,0.10)", border: "1px solid rgba(227,28,28,0.4)", color: "#ff6b6b", borderRadius: 10, fontSize: 14 }}>
            {error}
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div style={{ marginTop: 30, textAlign: "center", padding: 50, background: "#141414", border: "1.5px dashed #2a2a2a", borderRadius: 20 }}>
            <Link to="/shop" style={{ display: "inline-block", background: "linear-gradient(135deg, #e31c1c, #b01010)", color: "#fff", textDecoration: "none", padding: "14px 32px", borderRadius: 12, fontSize: 14, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", boxShadow: "0 8px 24px rgba(227,28,28,0.35)" }}>
              Start Shopping
            </Link>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 24 }}>
          {orders.map((order) => {
            const sc = STATUS_COLOR[order.orderStatus] || STATUS_COLOR.placed;
            const isCancellable = order.orderStatus === "placed";
            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: "#141414", border: "1.5px solid #1f1f1f",
                  borderRadius: 16, padding: 20,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#888", letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 }}>
                      Order ID
                    </div>
                    <div style={{ fontSize: 13, fontFamily: "Consolas, monospace", color: "#fff", marginTop: 3 }}>
                      {order._id}
                    </div>
                    <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                      Placed {new Date(order.createdAt).toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ background: sc.bg, color: sc.text, padding: "5px 12px", borderRadius: 100, fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" }}>
                      {order.orderStatus}
                    </span>
                    <span style={{ fontSize: 11, color: "#aaa", padding: "5px 10px", border: "1px solid #2a2a2a", borderRadius: 100, letterSpacing: 1, textTransform: "uppercase" }}>
                      {order.paymentMethod} • {order.paymentStatus}
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>
                      ₹{order.total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, borderTop: "1px solid #222", paddingTop: 14 }}>
                  {order.items.map((it, idx) => {
                    const existingReview = reviewsByProduct[it.productId];
                    const isDelivered = order.orderStatus === "delivered";
                    const isCancelled = order.orderStatus === "cancelled";
                    return (
                      <div key={idx} style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                        <img
                          src={it.image}
                          alt={it.name}
                          onError={(e) => { if (e.currentTarget.src !== FALLBACK_SHOE_IMG) e.currentTarget.src = FALLBACK_SHOE_IMG; }}
                          style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", background: "#0e0e0e", flexShrink: 0 }}
                        />
                        <div style={{ flex: 1, minWidth: 180 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{it.name}</div>
                          <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>
                            Qty {it.quantity}{it.color ? ` • ${it.color}` : ""}{it.size ? ` • UK ${it.size}` : ""} • ₹{(it.price * it.quantity).toLocaleString("en-IN")}
                          </div>
                          {existingReview && (
                            <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                              <StarRating value={existingReview.rating} size={14} readOnly />
                              <span style={{ fontSize: 11, color: "#888" }}>your review</span>
                            </div>
                          )}
                        </div>
                        {isDelivered ? (
                          <button
                            onClick={() => openReviewModal(order._id, it)}
                            style={{
                              background: existingReview ? "transparent" : "linear-gradient(135deg, #facc15, #ca8a04)",
                              color: existingReview ? "#facc15" : "#0a0a0a",
                              border: existingReview ? "1.5px solid #facc15" : "none",
                              borderRadius: 10, padding: "8px 14px",
                              fontSize: 11, fontWeight: 800, letterSpacing: 2,
                              textTransform: "uppercase", cursor: "pointer",
                              fontFamily: "inherit", whiteSpace: "nowrap",
                            }}
                          >
                            {existingReview ? "✎ Edit Review" : "★ Write Review"}
                          </button>
                        ) : isCancelled ? null : (
                          <span
                            title="Available after delivery"
                            style={{
                              fontSize: 10, color: "#666",
                              padding: "6px 10px",
                              border: "1px dashed #2a2a2a",
                              borderRadius: 8,
                              letterSpacing: 1,
                              textTransform: "uppercase",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Review after delivery
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 14, borderTop: "1px solid #222", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ fontSize: 12, color: "#888" }}>
                    {order.orderStatus === "delivered" && order.deliveredAt ? (
                      <>Delivered on <span style={{ color: "#bbb" }}>{new Date(order.deliveredAt).toLocaleDateString("en-IN")}</span></>
                    ) : (
                      <>Delivering to <span style={{ color: "#bbb" }}>{order.shippingAddress?.city}{order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ""} - {order.shippingAddress?.pincode}</span></>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {(order.orderStatus === "placed" || order.orderStatus === "shipped") && (
                      <button
                        onClick={() => handleMarkDelivered(order._id)}
                        disabled={deliveringId === order._id}
                        title="Marks this order as received so you can review the items"
                        style={{ background: deliveringId === order._id ? "#555" : "linear-gradient(135deg, #16a34a, #15803d)", color: "#fff", border: "none", borderRadius: 10, padding: "8px 14px", fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", cursor: deliveringId === order._id ? "wait" : "pointer", fontFamily: "inherit" }}
                      >
                        {deliveringId === order._id ? "Marking..." : "✓ I've Received This"}
                      </button>
                    )}
                    {isCancellable && (
                      <button
                        onClick={() => setCancelTarget(order)}
                        style={{ background: "transparent", color: "#ff6b6b", border: "1.5px solid rgba(227,28,28,0.5)", borderRadius: 10, padding: "8px 14px", fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}
                      >
                        Cancel Order
                      </button>
                    )}
                    {order.orderStatus === "cancelled" && (
                      <div style={{ fontSize: 12, color: "#666" }}>
                        Cancelled {order.cancelledAt ? `on ${new Date(order.cancelledAt).toLocaleDateString("en-IN")}` : ""}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            style={{
              position: "fixed",
              top: 90,
              left: "50%",
              background: "linear-gradient(135deg, #16a34a, #15803d)",
              color: "#fff",
              padding: "14px 22px",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 700,
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              zIndex: 1500,
              maxWidth: "90vw",
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review modal */}
      <AnimatePresence>
        {reviewModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeReviewModal}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 20 }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: "#141414", border: "1.5px solid #2a2a2a", borderRadius: 20, padding: 28, maxWidth: 460, width: "100%", boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }}
            >
              <h3 style={{ fontSize: 20, fontWeight: 900, letterSpacing: 1, textTransform: "uppercase", color: "#fff", margin: "0 0 4px", fontFamily: "'Barlow Condensed', Arial, sans-serif" }}>
                Write a Review
              </h3>
              <p style={{ color: "#aaa", fontSize: 13, margin: "0 0 18px" }}>
                {reviewModal.item.name}
              </p>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0", borderTop: "1px solid #222", borderBottom: "1px solid #222", marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "#888", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
                  Your Rating
                </div>
                <StarRating value={rating} onChange={setRating} size={36} />
              </div>

              <input
                placeholder="Title (optional)"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                style={{ width: "100%", boxSizing: "border-box", background: "#1a1a1a", border: "1.5px solid #2a2a2a", borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none", marginBottom: 10 }}
              />
              <textarea
                placeholder="Share your thoughts about this product..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
                style={{ width: "100%", boxSizing: "border-box", background: "#1a1a1a", border: "1.5px solid #2a2a2a", borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none", resize: "vertical" }}
              />

              {reviewError && (
                <div style={{ marginTop: 10, padding: "10px 12px", background: "rgba(227,28,28,0.10)", border: "1px solid rgba(227,28,28,0.5)", color: "#ff6b6b", borderRadius: 8, fontSize: 13 }}>
                  {reviewError}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button onClick={closeReviewModal} disabled={submittingReview}
                  style={{ flex: 1, background: "transparent", color: "#fff", border: "1.5px solid #2a2a2a", borderRadius: 10, padding: "13px", fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>
                  Cancel
                </button>
                <button onClick={handleSubmitReview} disabled={submittingReview}
                  style={{ flex: 1, background: submittingReview ? "#555" : "linear-gradient(135deg, #facc15, #ca8a04)", color: "#0a0a0a", border: "none", borderRadius: 10, padding: "13px", fontSize: 13, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", cursor: submittingReview ? "wait" : "pointer", fontFamily: "inherit" }}>
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel confirm modal */}
      <AnimatePresence>
        {cancelTarget && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setCancelTarget(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 20 }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: "#141414", border: "1.5px solid #2a2a2a", borderRadius: 20, padding: 28, maxWidth: 380, width: "100%", textAlign: "center" }}
            >
              <h3 style={{ fontSize: 20, fontWeight: 900, letterSpacing: 1, textTransform: "uppercase", color: "#fff", margin: "0 0 8px", fontFamily: "'Barlow Condensed', Arial, sans-serif" }}>
                Cancel Order?
              </h3>
              <p style={{ color: "#aaa", fontSize: 14, margin: "0 0 20px" }}>
                Your order for ₹{cancelTarget.total.toLocaleString("en-IN")} will be cancelled
                {cancelTarget.paymentStatus === "paid" ? " and the amount will be refunded" : ""}. This cannot be undone.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setCancelTarget(null)} disabled={cancellingId === cancelTarget._id}
                  style={{ flex: 1, background: "transparent", color: "#fff", border: "1.5px solid #2a2a2a", borderRadius: 10, padding: "12px", fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>
                  Keep Order
                </button>
                <button onClick={() => handleCancel(cancelTarget._id)} disabled={cancellingId === cancelTarget._id}
                  style={{ flex: 1, background: cancellingId === cancelTarget._id ? "#555" : "linear-gradient(135deg, #e31c1c, #b01010)", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontSize: 13, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", cursor: cancellingId === cancelTarget._id ? "wait" : "pointer", fontFamily: "inherit" }}>
                  {cancellingId === cancelTarget._id ? "Cancelling..." : "Yes, Cancel"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .orders-container { padding: 30px 16px 60px !important; }
        }
      `}</style>
    </div>
  );
};

export default MyOrders;
