import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, googleLogin } from "../services/authService";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setErrorMsg("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      const data = await loginUser(formData);
      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate("/shop");
    } catch (error) {
      setErrorMsg(
        error?.response?.data?.message ||
          "Login failed. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setErrorMsg("");
    try {
      const data = await googleLogin(credentialResponse.credential);
      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate("/shop");
    } catch (error) {
      setErrorMsg(
        error?.response?.data?.message || "Google login failed"
      );
    }
  };

  const fields = [
    { name: "email", type: "email", placeholder: "Email Address" },
    { name: "password", type: "password", placeholder: "Password" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
        backgroundColor: "#0a0a0a",
      }}
    >
      {/* Left image panel */}
      <div
        className="left-panel"
        style={{
          width: "50%",
          background: "linear-gradient(135deg, #e31c1c 0%, #8b0000 100%)",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          display: "none",
        }}
      >
        <div style={{
          position: "absolute", width: 500, height: 500, borderRadius: "50%",
          border: "80px solid rgba(255,255,255,0.07)", top: -120, right: -120,
        }} />
        <div style={{
          position: "absolute", width: 300, height: 300, borderRadius: "50%",
          border: "60px solid rgba(255,255,255,0.05)", bottom: -60, left: -60,
        }} />
        <img
          src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=80"
          alt="shoe"
          style={{
            width: "78%",
            borderRadius: "24px",
            boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
            transform: "rotate(3deg)",
            position: "relative",
            zIndex: 1,
          }}
        />
        <div style={{ marginTop: 40, textAlign: "center", color: "#fff", position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 13, letterSpacing: 6, textTransform: "uppercase", opacity: 0.7, fontWeight: 600 }}>
            Welcome Back
          </p>
          <h2 style={{ fontSize: 42, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", margin: "8px 0 0" }}>
            Your Next Pair Awaits
          </h2>
        </div>
      </div>

      {/* Right form panel */}
      <div
        className="auth-form-panel"
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          background: "#0a0a0a",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ width: "100%", maxWidth: 440 }}
        >
          {/* Brand */}
          <div className="auth-brand" style={{ marginBottom: 40, textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 36, height: 36, background: "#e31c1c", borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/>
                </svg>
              </div>
              <span className="auth-brand-name" style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: 2, textTransform: "uppercase" }}>
                ShoeHub
              </span>
            </div>
            <h1 className="auth-title" style={{ fontSize: 36, fontWeight: 800, color: "#fff", letterSpacing: 1, textTransform: "uppercase", margin: 0 }}>
              Welcome Back
            </h1>
            <p style={{ color: "#555", fontSize: 14, marginTop: 6 }}>
              Sign in to your account
            </p>
          </div>

          {/* Error message */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
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

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {fields.map((field, i) => (
              <motion.div
                key={field.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
              >
                <input
                  type={field.type}
                  name={field.name}
                  placeholder={field.placeholder}
                  onChange={handleChange}
                  required
                  style={{
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
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#e31c1c")}
                  onBlur={(e) => (e.target.style.borderColor = "#2a2a2a")}
                />
              </motion.div>
            ))}

            {/* Forgot password */}
            <div style={{ textAlign: "right", marginTop: -6 }}>
              <Link to="/forgot-password" style={{ color: "#555", fontSize: 13, textDecoration: "none" }}>
                Forgot password?
              </Link>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              style={{
                marginTop: 4,
                width: "100%",
                background: loading
                  ? "#555"
                  : "linear-gradient(135deg, #e31c1c, #b01010)",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "17px",
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: 3,
                textTransform: "uppercase",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                boxShadow: "0 8px 24px rgba(227,28,28,0.35)",
              }}
            >
              {loading ? "Signing In..." : "Sign In"}
            </motion.button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
              <div style={{ flex: 1, height: 1, background: "#222" }} />
              <span style={{ color: "#444", fontSize: 12, textTransform: "uppercase", letterSpacing: 2 }}>or</span>
              <div style={{ flex: 1, height: 1, background: "#222" }} />
            </div>

            {/* Google sign-in */}
            <div className="auth-google-wrap" style={{ display: "flex", justifyContent: "center", width: "100%" }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => alert("Google login failed")}
                theme="filled_black"
                size="large"
                text="continue_with"
                shape="rectangular"
              />
            </div>

            <p style={{ textAlign: "center", color: "#555", fontSize: 14, marginTop: 4 }}>
              Don't have an account?{" "}
              <Link to="/register" style={{ color: "#e31c1c", fontWeight: 700, textDecoration: "none" }}>
                Register
              </Link>
            </p>
          </form>
        </motion.div>
      </div>

      <style>{`
        @media (min-width: 1024px) { .left-panel { display: flex !important; } }
        input::placeholder { color: #444; }

        /* Tablet */
        @media (max-width: 768px) {
          .auth-form-panel { padding: 32px 18px !important; }
          .auth-brand { margin-bottom: 28px !important; }
          .auth-title { font-size: 30px !important; }
          .auth-brand-name { font-size: 22px !important; }
        }

        /* Phone */
        @media (max-width: 480px) {
          .auth-form-panel { padding: 24px 14px !important; }
          .auth-brand { margin-bottom: 22px !important; }
          .auth-title { font-size: 26px !important; letter-spacing: 0.5px !important; }
          .auth-brand-name { font-size: 20px !important; letter-spacing: 1.5px !important; }
        }

        /* Make Google's iframe button stretch to its container */
        .auth-google-wrap > div,
        .auth-google-wrap iframe {
          width: 100% !important;
          max-width: 360px;
        }
      `}</style>
    </div>
  );
};

export default Login;
