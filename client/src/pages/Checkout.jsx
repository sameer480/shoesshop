import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getCart, clearCart } from "../utils/cart";
import {
  checkPincode,
  createOrder,
  confirmPayment,
} from "../services/paymentService";
import AuthNav from "../components/AuthNav";
import CartIcon from "../components/CartIcon";

const UPI_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

const Checkout = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState(getCart());
  const [step, setStep] = useState(1); // 1=address, 2=payment-method, 3=upi-request

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    altMobile: "",
    pincode: "",
    address: "",
    landmark: "",
  });

  const [pincodeStatus, setPincodeStatus] = useState(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [customerUpi, setCustomerUpi] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [orderData, setOrderData] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo") || "null");
    if (!user) {
      navigate("/login");
      return;
    }
    if (items.length === 0) {
      navigate("/cart");
      return;
    }
    setForm((f) => ({ ...f, name: f.name || user.name || "" }));
  }, [items.length, navigate]);

  // Countdown timer while waiting for UPI approval
  useEffect(() => {
    if (!waiting || secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [waiting, secondsLeft]);

  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
  const shippingFee = 99;
  const total = subtotal + shippingFee;

  const handleField = (e) => {
    setErrorMsg("");
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "pincode") setPincodeStatus(null);
  };

  const handleCheckPincode = async () => {
    if (!/^\d{6}$/.test(form.pincode)) {
      setPincodeStatus({ ok: false, message: "Enter a valid 6-digit pincode" });
      return;
    }
    setPincodeLoading(true);
    try {
      const result = await checkPincode(form.pincode);
      setPincodeStatus({ ...result, ok: true });
    } catch (err) {
      setPincodeStatus({
        ok: false,
        message: err?.response?.data?.message || "Could not check pincode",
      });
    } finally {
      setPincodeLoading(false);
    }
  };

  const validateAddress = () => {
    if (!form.name.trim()) return "Name is required";
    if (!/^\d{10}$/.test(form.mobile)) return "Enter a valid 10-digit mobile number";
    if (form.altMobile && !/^\d{10}$/.test(form.altMobile))
      return "Alternate mobile must be 10 digits";
    if (!form.address.trim() || form.address.trim().length < 8)
      return "Please enter a complete address";
    if (!pincodeStatus?.ok) return "Please verify your pincode first";
    return null;
  };

  const goToPayment = (e) => {
    e.preventDefault();
    const err = validateAddress();
    if (err) return setErrorMsg(err);
    setErrorMsg("");
    setStep(2);
  };

  const placeOrder = async () => {
    setErrorMsg("");
    if (paymentMethod === "upi" && !UPI_REGEX.test(customerUpi)) {
      setErrorMsg("Enter a valid UPI ID (e.g., yourname@okhdfcbank)");
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("userInfo") || "null");
      const res = await createOrder({
        items,
        shippingAddress: form,
        paymentMethod,
        customerEmail: user?.email,
        customerUpi: paymentMethod === "upi" ? customerUpi : undefined,
      });
      setOrderData(res);

      if (paymentMethod === "cod") {
        await confirmAndFinish(res.orderId, "COD-" + Date.now());
      } else {
        // UPI: show request screen, simulate user approving in their UPI app
        setStep(3);
        setWaiting(true);
        setSecondsLeft(300); // 5 minutes window
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Failed to create order");
    }
  };

  const confirmAndFinish = async (orderId, paymentRef) => {
    setConfirming(true);
    try {
      const res = await confirmPayment(orderId, paymentRef);
      clearCart();
      navigate(`/order-success/${orderId}`, {
        state: {
          emailSent: res.emailSent,
          emailError: res.emailError,
          customerEmail: res.customerEmail,
          paymentMethod,
        },
      });
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Could not confirm payment");
      setConfirming(false);
    }
  };

  const handleUpiPaid = () => {
    if (!orderData?.orderId) return;
    confirmAndFinish(orderData.orderId, "UPI-" + Math.floor(Math.random() * 1e10));
  };

  const mmss = (s) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

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
      <nav className="page-nav" style={navStyle}>
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

      <div className="checkout-container" style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 32px 80px" }}>
        <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 900, letterSpacing: 1, textTransform: "uppercase", margin: 0 }}>
          Check<span style={{ color: "#e31c1c" }}>out</span>
        </h1>
        <p style={{ color: "#888", fontSize: 15, marginTop: 6 }}>
          {step === 1 ? "Step 1 — Delivery details" : step === 2 ? "Step 2 — Payment" : "Step 3 — Confirm payment"}
        </p>

        {/* Step indicator */}
        <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 18, marginBottom: 30 }}>
          {[1, 2, 3].map((n) => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: step >= n ? "#e31c1c" : "#1a1a1a",
                  border: step >= n ? "1.5px solid #e31c1c" : "1.5px solid #2a2a2a",
                  color: step >= n ? "#fff" : "#666",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 800,
                }}
              >
                {n}
              </div>
              {n < 3 && <div style={{ width: 40, height: 2, background: step > n ? "#e31c1c" : "#2a2a2a" }} />}
            </div>
          ))}
        </div>

        <AnimatePresence>
          {errorMsg && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ background: "rgba(227,28,28,0.12)", border: "1px solid rgba(227,28,28,0.5)", color: "#ff6b6b", padding: "12px 16px", borderRadius: 10, fontSize: 14, marginBottom: 14 }}>
              {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="checkout-grid" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 30, alignItems: "start" }}>
          <div>
            {/* STEP 1: Address */}
            {step === 1 && (
              <form onSubmit={goToPayment} style={cardStyle}>
                <h2 style={sectionTitle}>Contact</h2>
                <input name="name" placeholder="Full Name" value={form.name} onChange={handleField} required style={inputStyle} />
                <input name="mobile" placeholder="Mobile Number (10 digits)" value={form.mobile} onChange={handleField} required maxLength={10} style={{ ...inputStyle, marginTop: 12 }} />
                <input name="altMobile" placeholder="Alternate Mobile (optional)" value={form.altMobile} onChange={handleField} maxLength={10} style={{ ...inputStyle, marginTop: 12 }} />

                <h2 style={{ ...sectionTitle, marginTop: 24 }}>Address</h2>
                <div style={{ display: "flex", gap: 10 }}>
                  <input name="pincode" placeholder="Pincode (6 digits)" value={form.pincode} onChange={handleField} required maxLength={6} style={{ ...inputStyle, flex: 1 }} />
                  <button type="button" onClick={handleCheckPincode} disabled={pincodeLoading || form.pincode.length !== 6}
                    style={{ background: "transparent", color: "#fff", border: "1.5px solid #e31c1c", borderRadius: 10, padding: "0 18px", fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", cursor: pincodeLoading ? "wait" : "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                    {pincodeLoading ? "Checking..." : "Check"}
                  </button>
                </div>
                {pincodeStatus && (
                  <div style={{ marginTop: 8, padding: "10px 12px", borderRadius: 8, fontSize: 13, background: pincodeStatus.ok ? "rgba(34,197,94,0.10)" : "rgba(227,28,28,0.10)", color: pincodeStatus.ok ? "#22c55e" : "#ff6b6b", border: pincodeStatus.ok ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(227,28,28,0.4)" }}>
                    {pincodeStatus.message}
                    {pincodeStatus.etaDays && <span> • Delivery in ~{pincodeStatus.etaDays} days</span>}
                  </div>
                )}
                <textarea name="address" placeholder="House No, Street, Area" value={form.address} onChange={handleField} required rows={3} style={{ ...inputStyle, marginTop: 12, resize: "vertical" }} />
                <input name="landmark" placeholder="Landmark (optional)" value={form.landmark} onChange={handleField} style={{ ...inputStyle, marginTop: 12 }} />

                <PrimaryButton type="submit">Continue to Payment</PrimaryButton>
              </form>
            )}

            {/* STEP 2: Payment method selection */}
            {step === 2 && (
              <div style={cardStyle}>
                <h2 style={sectionTitle}>Payment Method</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
                  <MethodCard
                    selected={paymentMethod === "upi"}
                    onClick={() => setPaymentMethod("upi")}
                    title="UPI Payment"
                    subtitle="Pay using PhonePe, GPay, Paytm, BHIM or any UPI app"
                    icon={<UpiIcon />}
                  />
                  <MethodCard
                    selected={paymentMethod === "cod"}
                    onClick={() => setPaymentMethod("cod")}
                    title="Cash on Delivery"
                    subtitle="Pay in cash when your order arrives"
                    icon={<CodIcon />}
                  />
                </div>

                {paymentMethod === "upi" && (
                  <div style={{ marginTop: 18 }}>
                    <label style={{ fontSize: 12, color: "#888", letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 }}>
                      Your UPI ID (for our records)
                    </label>
                    <input
                      placeholder="e.g. yourname@okhdfcbank"
                      value={customerUpi}
                      onChange={(e) => { setCustomerUpi(e.target.value); setErrorMsg(""); }}
                      style={{ ...inputStyle, marginTop: 6 }}
                    />
                    <p style={{ color: "#666", fontSize: 12, marginTop: 6 }}>
                      On the next step, scan the QR code or tap "Open UPI App" to pay from your phone.
                    </p>
                  </div>
                )}

                <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                  <button type="button" onClick={() => setStep(1)}
                    style={{ background: "transparent", color: "#fff", border: "1.5px solid #2a2a2a", borderRadius: 10, padding: "14px 20px", fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>
                    ← Back
                  </button>
                  <motion.button type="button" onClick={placeOrder} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    style={{ flex: 1, background: "linear-gradient(135deg, #e31c1c, #b01010)", color: "#fff", border: "none", borderRadius: 10, padding: "14px", fontSize: 14, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 8px 24px rgba(227,28,28,0.3)" }}>
                    {paymentMethod === "cod"
                      ? `Place Order — ₹${total.toLocaleString("en-IN")}`
                      : `Send Payment Request — ₹${total.toLocaleString("en-IN")}`}
                  </motion.button>
                </div>
              </div>
            )}

            {/* STEP 3: UPI QR code payment */}
            {step === 3 && orderData && (
              <div style={cardStyle}>
                <h2 style={sectionTitle}>Pay ₹{total.toLocaleString("en-IN")} via UPI</h2>
                <p style={{ color: "#aaa", fontSize: 14, margin: "0 0 6px" }}>
                  <strong style={{ color: "#fff" }}>Scan the QR below</strong> from any UPI app on your phone, or tap "Open UPI App" if you're already on mobile.
                </p>
                <p style={{ color: "#666", fontSize: 12, margin: "0 0 18px" }}>
                  Payment goes to <strong style={{ color: "#aaa" }}>{orderData.merchant?.name}</strong> ({orderData.merchant?.upi})
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, alignItems: "center", background: "#1a1a1a", border: "1.5px solid #2a2a2a", borderRadius: 12, padding: 16 }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&bgcolor=ffffff&color=000000&data=${encodeURIComponent(orderData.upiDeepLink)}`}
                    alt="UPI QR"
                    width={160}
                    height={160}
                    style={{ borderRadius: 8, background: "#fff", padding: 6 }}
                  />
                  <div>
                    <div style={{ fontSize: 11, color: "#888", letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 }}>
                      Scan with any UPI app
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                      <UpiAppPill bg="#5f259f" label="PhonePe" />
                      <UpiAppPill bg="#4285f4" label="GPay" />
                      <UpiAppPill bg="#00baf2" label="Paytm" />
                      <UpiAppPill bg="#1a1a1a" label="BHIM" />
                    </div>
                    <a
                      href={orderData.upiDeepLink}
                      style={{
                        display: "inline-block", marginTop: 14,
                        background: "linear-gradient(135deg, #16a34a, #15803d)",
                        color: "#fff", padding: "10px 16px", borderRadius: 8,
                        fontSize: 12, fontWeight: 800, letterSpacing: 2,
                        textTransform: "uppercase", textDecoration: "none",
                      }}
                    >
                      📱 Open UPI App (mobile)
                    </a>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 18, padding: "12px 14px", background: "#1a1a1a", border: "1.5px solid #2a2a2a", borderRadius: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#facc15", boxShadow: "0 0 0 4px rgba(250,204,21,0.2)", animation: "pulse 1.5s infinite" }} />
                    <span style={{ fontSize: 13, color: "#aaa" }}>Complete payment to confirm your order</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#fff", fontFamily: "Consolas, monospace" }}>
                    {mmss(secondsLeft)}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                  <button type="button" onClick={() => { setStep(2); setWaiting(false); }} disabled={confirming}
                    style={{ background: "transparent", color: "#fff", border: "1.5px solid #2a2a2a", borderRadius: 10, padding: "14px 20px", fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>
                    Cancel
                  </button>
                  <motion.button type="button" onClick={handleUpiPaid} disabled={confirming} whileHover={{ scale: confirming ? 1 : 1.02 }} whileTap={{ scale: confirming ? 1 : 0.97 }}
                    style={{ flex: 1, background: confirming ? "#555" : "linear-gradient(135deg, #16a34a, #15803d)", color: "#fff", border: "none", borderRadius: 10, padding: "14px", fontSize: 14, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", cursor: confirming ? "wait" : "pointer", fontFamily: "inherit", boxShadow: "0 8px 24px rgba(22,163,74,0.3)" }}>
                    {confirming ? "Confirming..." : "I've Completed Payment"}
                  </motion.button>
                </div>
              </div>
            )}
          </div>

          {/* Summary sidebar */}
          <aside className="checkout-summary" style={{ background: "#141414", border: "1.5px solid #1f1f1f", borderRadius: 16, padding: 22, position: "sticky", top: 100 }}>
            <h3 style={sectionTitle}>Order Summary</h3>
            <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: 12 }}>
              {items.map((it) => (
                <div key={it.key} style={{ display: "flex", gap: 10, padding: "6px 0", borderBottom: "1px solid #1f1f1f" }}>
                  <img src={it.image} alt={it.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.name}</div>
                    <div style={{ fontSize: 11, color: "#888" }}>Qty {it.quantity}{it.size ? ` • UK ${it.size}` : ""}</div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>₹{(it.price * it.quantity).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
            <SummaryRow label="Subtotal" value={`₹${subtotal.toLocaleString("en-IN")}`} />
            <SummaryRow label="Shipping" value={`₹${shippingFee}`} />
            <div style={{ height: 1, background: "#222", margin: "10px 0" }} />
            <SummaryRow label="Total" value={`₹${total.toLocaleString("en-IN")}`} big />
          </aside>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .checkout-container { padding: 30px 16px 60px !important; }
          .checkout-grid { grid-template-columns: 1fr !important; }
          .checkout-summary { position: static !important; }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(250,204,21,0.2); }
          50% { box-shadow: 0 0 0 8px rgba(250,204,21,0.0); }
        }
      `}</style>
    </div>
  );
};

const navStyle = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "18px 32px", borderBottom: "1px solid #1a1a1a",
  position: "sticky", top: 0, background: "rgba(10,10,10,0.92)",
  backdropFilter: "blur(12px)", zIndex: 100,
};

// className kept literal on the <nav> below: page-nav

const cardStyle = {
  background: "#141414", border: "1.5px solid #1f1f1f",
  borderRadius: 16, padding: 26,
};

const inputStyle = {
  width: "100%", boxSizing: "border-box", background: "#1a1a1a",
  border: "1.5px solid #2a2a2a", borderRadius: 10,
  padding: "13px 16px", color: "#fff", fontSize: 14,
  fontFamily: "inherit", outline: "none",
};

const sectionTitle = {
  fontSize: 14, fontWeight: 900, letterSpacing: 3,
  textTransform: "uppercase", color: "#fff", margin: "0 0 12px",
};

const PrimaryButton = ({ children, type }) => (
  <motion.button type={type || "button"} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
    style={{
      width: "100%", marginTop: 22,
      background: "linear-gradient(135deg, #e31c1c, #b01010)",
      color: "#fff", border: "none", borderRadius: 12, padding: "15px",
      fontSize: 14, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase",
      cursor: "pointer", fontFamily: "inherit",
      boxShadow: "0 8px 24px rgba(227,28,28,0.3)",
    }}>
    {children}
  </motion.button>
);

const SummaryRow = ({ label, value, big }) => (
  <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0" }}>
    <span style={{ color: big ? "#fff" : "#888", fontSize: big ? 15 : 13, fontWeight: big ? 800 : 500, textTransform: big ? "uppercase" : "none", letterSpacing: big ? 1 : 0 }}>{label}</span>
    <span style={{ color: "#fff", fontSize: big ? 20 : 13, fontWeight: big ? 900 : 700 }}>{value}</span>
  </div>
);

const MethodCard = ({ selected, onClick, title, subtitle, icon }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      display: "flex", alignItems: "center", gap: 14,
      background: selected ? "rgba(227,28,28,0.07)" : "#1a1a1a",
      border: selected ? "1.5px solid #e31c1c" : "1.5px solid #2a2a2a",
      borderRadius: 12, padding: 14, color: "#fff",
      cursor: "pointer", fontFamily: "inherit", textAlign: "left",
      transition: "all 0.18s",
    }}
  >
    {icon}
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 800, fontSize: 15 }}>{title}</div>
      <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{subtitle}</div>
    </div>
    <div style={{
      width: 20, height: 20, borderRadius: "50%",
      border: selected ? "5px solid #e31c1c" : "2px solid #444",
      background: selected ? "#0a0a0a" : "transparent",
    }} />
  </button>
);

const UpiIcon = () => (
  <div style={{
    width: 50, height: 50, borderRadius: 10,
    background: "linear-gradient(135deg, #5f259f, #4285f4 35%, #00baf2 70%, #e31c1c)",
    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 900, fontSize: 14, letterSpacing: 1,
  }}>UPI</div>
);

const UpiAppPill = ({ bg, label }) => (
  <span
    style={{
      background: bg,
      color: "#fff",
      fontSize: 10,
      fontWeight: 800,
      letterSpacing: 1,
      padding: "4px 8px",
      borderRadius: 100,
      textTransform: "uppercase",
      border: bg === "#1a1a1a" ? "1px solid #333" : "none",
    }}
  >
    {label}
  </span>
);

const CodIcon = () => (
  <div style={{
    width: 50, height: 50, borderRadius: 10,
    background: "linear-gradient(135deg, #16a34a, #15803d)",
    display: "flex", alignItems: "center", justifyContent: "center",
  }}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
      <path d="M21 7H3a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zm0 10H3v-6h18v6zM12 9c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z" />
    </svg>
  </div>
);

export default Checkout;
