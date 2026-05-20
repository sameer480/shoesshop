import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  forgotPassword,
  verifyOtp,
  resetPassword,
} from "../services/authService";

const steps = [
  { num: 1, label: "Email" },
  { num: 2, label: "OTP" },
  { num: 3, label: "New Password" },
];

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      if (res?.devOtp) {
        setOtp(res.devOtp);
        setSuccessMsg(
          `Dev mode: OTP is ${res.devOtp} (email not configured — already filled in)`
        );
      } else {
        setSuccessMsg("OTP sent! Check your email inbox.");
      }
      setStep(2);
    } catch (error) {
      setErrorMsg(error?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);
    try {
      await verifyOtp(email, otp);
      setSuccessMsg("OTP verified! Set your new password.");
      setStep(3);
    } catch (error) {
      setErrorMsg(error?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (password.length < 6) {
      return setErrorMsg("Password must be at least 6 characters");
    }
    if (password !== confirmPassword) {
      return setErrorMsg("Passwords do not match");
    }
    setLoading(true);
    try {
      await resetPassword(email, otp, password);
      alert("Password reset successfully! Please log in with your new password.");
      navigate("/login");
    } catch (error) {
      setErrorMsg(error?.response?.data?.message || "Could not reset password");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);
    try {
      await forgotPassword(email);
      setSuccessMsg("A new OTP has been sent to your email.");
    } catch (error) {
      setErrorMsg(error?.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        background: "#0a0a0a",
        fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fp-card"
        style={{ width: "100%", maxWidth: 480 }}
      >
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                background: "#e31c1c",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z" />
              </svg>
            </div>
            <span
              style={{
                fontSize: 26,
                fontWeight: 900,
                color: "#fff",
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              ShoeHub
            </span>
          </div>
          <h1
            className="fp-title"
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: "#fff",
              letterSpacing: 1,
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Reset Password
          </h1>
          <p style={{ color: "#888", fontSize: 14, marginTop: 6 }}>
            {step === 1 && "Enter your registered email"}
            {step === 2 && "Enter the OTP sent to your email"}
            {step === 3 && "Choose a new password"}
          </p>
        </div>

        {/* Step indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginBottom: 28,
          }}
        >
          {steps.map((s, i) => (
            <div
              key={s.num}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: step >= s.num ? "#e31c1c" : "#1a1a1a",
                  border:
                    step >= s.num
                      ? "1.5px solid #e31c1c"
                      : "1.5px solid #2a2a2a",
                  color: step >= s.num ? "#fff" : "#666",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 800,
                  transition: "all 0.3s",
                }}
              >
                {s.num}
              </div>
              {i < steps.length - 1 && (
                <div
                  style={{
                    width: 36,
                    height: 2,
                    background: step > s.num ? "#e31c1c" : "#2a2a2a",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Messages */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                background: "rgba(227,28,28,0.12)",
                border: "1px solid rgba(227,28,28,0.5)",
                color: "#ff6b6b",
                padding: "12px 16px",
                borderRadius: 10,
                fontSize: 14,
                marginBottom: 14,
                textAlign: "center",
              }}
            >
              {errorMsg}
            </motion.div>
          )}
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                background: "rgba(34,197,94,0.10)",
                border: "1px solid rgba(34,197,94,0.5)",
                color: "#22c55e",
                padding: "12px 16px",
                borderRadius: 10,
                fontSize: 14,
                marginBottom: 14,
                textAlign: "center",
              }}
            >
              {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 1: Email */}
        {step === 1 && (
          <form
            onSubmit={handleSendOtp}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <input
              type="email"
              placeholder="Registered Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
            <PrimaryButton loading={loading} type="submit">
              {loading ? "Sending..." : "Send OTP"}
            </PrimaryButton>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <form
            onSubmit={handleVerifyOtp}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              maxLength={6}
              required
              style={{
                ...inputStyle,
                letterSpacing: 8,
                fontSize: 20,
                textAlign: "center",
                fontWeight: 700,
              }}
            />
            <PrimaryButton loading={loading} type="submit">
              {loading ? "Verifying..." : "Verify OTP"}
            </PrimaryButton>
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              style={{
                background: "transparent",
                color: "#888",
                border: "none",
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "inherit",
                textDecoration: "underline",
              }}
            >
              Didn't receive code? Resend OTP
            </button>
          </form>
        )}

        {/* Step 3: New password */}
        {step === 3 && (
          <form
            onSubmit={handleResetPassword}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <input
              type="password"
              placeholder="New Password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={inputStyle}
            />
            <PrimaryButton loading={loading} type="submit">
              {loading ? "Saving..." : "Reset Password"}
            </PrimaryButton>
          </form>
        )}

        <p
          style={{
            textAlign: "center",
            color: "#555",
            fontSize: 14,
            marginTop: 24,
          }}
        >
          Remembered it?{" "}
          <Link
            to="/login"
            style={{
              color: "#e31c1c",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Back to Login
          </Link>
        </p>
      </motion.div>

      <style>{`
        .fp-card input:focus { border-color: #e31c1c !important; }
        .fp-card input::placeholder { color: #444; }
        @media (max-width: 480px) {
          .fp-title { font-size: 26px !important; }
        }
      `}</style>
    </div>
  );
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  background: "#1a1a1a",
  border: "1.5px solid #2a2a2a",
  borderRadius: 12,
  padding: "16px 20px",
  color: "#fff",
  fontSize: 15,
  fontFamily: "inherit",
  outline: "none",
  transition: "border-color 0.2s",
};

const PrimaryButton = ({ loading, type, children }) => (
  <motion.button
    type={type || "button"}
    disabled={loading}
    whileHover={{ scale: loading ? 1 : 1.02 }}
    whileTap={{ scale: loading ? 1 : 0.98 }}
    style={{
      width: "100%",
      marginTop: 4,
      background: loading ? "#555" : "linear-gradient(135deg, #e31c1c, #b01010)",
      color: "#fff",
      border: "none",
      borderRadius: 12,
      padding: "16px",
      fontSize: 15,
      fontWeight: 800,
      letterSpacing: 3,
      textTransform: "uppercase",
      cursor: loading ? "not-allowed" : "pointer",
      fontFamily: "inherit",
      boxShadow: "0 8px 24px rgba(227,28,28,0.3)",
    }}
  >
    {children}
  </motion.button>
);

export default ForgotPassword;
