import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import AuthNav from "../components/AuthNav";
import CartIcon from "../components/CartIcon";

const shoes = [
  {
    url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=80",
    label: "Men",
  },
  {
    url: "https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=700&q=80",
    label: "Women",
  },
  {
    url: "https://images.unsplash.com/photo-1555274175-6cbf6f3b137b?w=700&q=80",
    label: "Kids",
  },
];

const Home = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % shoes.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const goToShop = () => navigate("/shop");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
        color: "#fff",
        overflowX: "hidden",
      }}
    >
      {/* Navbar */}
      <nav
        className="home-nav"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 48px",
          borderBottom: "1px solid #1a1a1a",
          position: "sticky",
          top: 0,
          background: "rgba(10,10,10,0.92)",
          backdropFilter: "blur(12px)",
          zIndex: 100,
        }}
      >
        <div className="home-brand" style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <div
            style={{
              width: 34,
              height: 34,
              background: "#e31c1c",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z" />
            </svg>
          </div>
          <span
            className="home-brand-name"
            style={{
              fontSize: 24,
              fontWeight: 900,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            ShoeHub
          </span>
        </div>

        <div className="home-nav-right" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <CartIcon />
          <AuthNav />
        </div>
      </nav>

      {/* Hero Section */}
      <div
        className="home-hero"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "80px 48px",
          maxWidth: 1200,
          margin: "0 auto",
          gap: 40,
          flexWrap: "wrap",
        }}
      >
        {/* Left content */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ flex: "1 1 400px", maxWidth: 560 }}
        >
          <div
            style={{
              display: "inline-block",
              background: "rgba(227,28,28,0.12)",
              border: "1px solid rgba(227,28,28,0.3)",
              borderRadius: 100,
              padding: "6px 16px",
              fontSize: 12,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#e31c1c",
              marginBottom: 24,
              fontWeight: 700,
            }}
          >
            New Season 2025
          </div>

          <h1
            className="home-hero-title"
            style={{
              fontSize: "clamp(36px, 6vw, 76px)",
              fontWeight: 900,
              lineHeight: 1.0,
              textTransform: "uppercase",
              letterSpacing: 1,
              margin: 0,
            }}
          >
            Find Your
            <br />
            <span style={{ color: "#e31c1c" }}>Perfect</span>
            <br />
            Shoes
          </h1>

          <p
            style={{
              marginTop: 24,
              color: "#888",
              fontSize: 18,
              lineHeight: 1.6,
              maxWidth: 400,
            }}
          >
            Premium collection for Men, Women and Kids. Step into comfort,
            style, and performance.
          </p>

          <div
            className="home-cta-row"
            style={{
              display: "flex",
              gap: 14,
              marginTop: 36,
              flexWrap: "wrap",
            }}
          >
            <motion.button
              onClick={goToShop}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="home-cta"
              style={{
                background: "linear-gradient(135deg, #e31c1c, #b01010)",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "16px 36px",
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: 3,
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 8px 24px rgba(227,28,28,0.35)",
              }}
            >
              Shop Now
            </motion.button>

            <motion.button
              onClick={goToShop}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="home-cta"
              style={{
                background: "transparent",
                color: "#fff",
                border: "1.5px solid #2a2a2a",
                borderRadius: 12,
                padding: "16px 36px",
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 3,
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Explore
            </motion.button>
          </div>

          {/* Stats */}
          <div className="home-stats" style={{ display: "flex", gap: 36, marginTop: 52, flexWrap: "wrap" }}>
            {[
              ["500+", "Brands"],
              ["10k+", "Products"],
              ["99%", "Satisfaction"],
            ].map(([num, label]) => (
              <div key={label}>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>
                  {num}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "#555",
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    marginTop: 2,
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right — auto-rotating shoe image */}
        <div
          style={{
            flex: "1 1 360px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
          }}
        >
          {/* Glow */}
          <div
            style={{
              position: "absolute",
              width: 380,
              height: 380,
              background:
                "radial-gradient(circle, rgba(227,28,28,0.25) 0%, transparent 70%)",
              borderRadius: "50%",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 0,
            }}
          />

          {/* Image with crossfade */}
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 500,
              aspectRatio: "4/3",
              borderRadius: 24,
              overflow: "hidden",
              boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
              zIndex: 1,
            }}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={current}
                src={shoes[current].url}
                alt={shoes[current].label}
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
              />
            </AnimatePresence>
          </div>

          {/* Dot indicators + label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginTop: 20,
              zIndex: 1,
            }}
          >
            {shoes.map((s, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                style={{
                  width: i === current ? 28 : 8,
                  height: 8,
                  borderRadius: 100,
                  background: i === current ? "#e31c1c" : "#333",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  transition: "all 0.3s ease",
                }}
              />
            ))}
            <span
              style={{
                marginLeft: 6,
                fontSize: 12,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "#555",
                fontWeight: 700,
              }}
            >
              {shoes[current].label}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        /* Tablet */
        @media (max-width: 768px) {
          .home-nav { padding: 14px 20px !important; }
          .home-brand-name { font-size: 20px !important; letter-spacing: 1.5px !important; }
          .home-hero { padding: 50px 20px !important; gap: 28px !important; }
          .home-cta { padding: 14px 24px !important; font-size: 14px !important; letter-spacing: 2px !important; }
          .home-stats { gap: 22px !important; margin-top: 36px !important; }
        }

        /* Phone */
        @media (max-width: 480px) {
          .home-nav { padding: 12px 14px !important; gap: 8px !important; }
          .home-brand-name { font-size: 18px !important; letter-spacing: 1px !important; }
          .home-nav-right { gap: 8px !important; }
          .home-hero { padding: 36px 16px !important; gap: 24px !important; }
          .home-hero-title { font-size: 32px !important; letter-spacing: 0.5px !important; }
          .home-cta-row { gap: 10px !important; margin-top: 24px !important; }
          .home-cta { padding: 13px 18px !important; font-size: 13px !important; letter-spacing: 2px !important; flex: 1 1 auto; }
          .home-stats { gap: 16px !important; margin-top: 28px !important; }
          .home-stats > div { flex: 1 1 30%; min-width: 90px; }
        }
      `}</style>
    </div>
  );
};

/* Helper nav link */
const NavLink = ({ to, children, variant }) => {
  const base = {
    fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: 2,
    textTransform: "uppercase",
    padding: "9px 20px",
    borderRadius: 10,
    transition: "all 0.2s",
  };
  const styles = {
    solid: {
      ...base,
      background: "#e31c1c",
      color: "#fff",
      border: "1.5px solid #e31c1c",
    },
    outline: {
      ...base,
      background: "transparent",
      color: "#fff",
      border: "1.5px solid #2a2a2a",
    },
  };
  return (
    <Link to={to} style={styles[variant]}>
      {children}
    </Link>
  );
};

export default Home;
