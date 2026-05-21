import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { menShoes, womenShoes, kidsShoes, FALLBACK_SHOE_IMG } from "../data/shoes";
import AuthNav from "../components/AuthNav";
import CartIcon from "../components/CartIcon";
import { addToCart, isLoggedIn } from "../utils/cart";

const categories = [
  { key: "all", label: "All Shoes" },
  { key: "men", label: "Men Casual" },
  { key: "women", label: "Women" },
  { key: "kids", label: "Kids" },
];

const COLOR_HEX = {
  Black: "#0a0a0a",
  White: "#ffffff",
  Navy: "#1e3a5f",
  Gray: "#888888",
  Olive: "#6b7a3a",
  Beige: "#d8c7a5",
  Red: "#e31c1c",
  Blue: "#2563eb",
  Charcoal: "#36454f",
  Mint: "#a8e6cf",
  Brown: "#7a4f2c",
  Tan: "#d2b48c",
  Pink: "#ec4899",
  Yellow: "#facc15",
  Green: "#16a34a",
  Cream: "#f3e9d2",
};

const Shop = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState("all");
  const [toast, setToast] = useState("");
  const [loginPrompt, setLoginPrompt] = useState(false);

  const handleAddToCart = (shoe, color, size) => {
    if (!isLoggedIn()) {
      setLoginPrompt(true);
      return;
    }
    if (!size) {
      setToast("Please select a size");
      setTimeout(() => setToast(""), 2200);
      return;
    }
    addToCart({
      id: shoe.id,
      name: shoe.name,
      brand: shoe.brand,
      price: shoe.price,
      image: shoe.colorImages?.[color] || shoe.image,
      color,
      size,
    });
    setToast(`Added to cart: ${shoe.name} (Size ${size})`);
    setTimeout(() => setToast(""), 2400);
  };

  const sections = useMemo(() => {
    const map = {
      men: { title: "Men Casual", items: menShoes },
      women: { title: "Women", items: womenShoes },
      kids: { title: "Kids", items: kidsShoes },
    };
    if (active === "all") return Object.values(map);
    return [map[active]];
  }, [active]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#fff",
        fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* Navbar */}
      <nav
        className="shop-nav"
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
          <span
            className="shop-brand"
            style={{
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            ShoeHub
          </span>
        </Link>

        <div className="shop-nav-right" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <CartIcon />
          <AuthNav />
        </div>
      </nav>

      {/* Header */}
      <div className="shop-header" style={{ padding: "60px 32px 20px", textAlign: "center" }}>
        <p
          style={{
            color: "#e31c1c",
            fontSize: 13,
            letterSpacing: 6,
            textTransform: "uppercase",
            fontWeight: 700,
            margin: 0,
          }}
        >
          Browse Collection
        </p>
        <h1
          className="shop-title"
          style={{
            fontSize: "clamp(36px, 5vw, 60px)",
            fontWeight: 900,
            letterSpacing: 1,
            textTransform: "uppercase",
            margin: "10px 0 0",
          }}
        >
          Shop All <span style={{ color: "#e31c1c" }}>Shoes</span>
        </h1>
        <p style={{ color: "#888", fontSize: 16, marginTop: 12 }}>
          180 styles across Men, Women & Kids
        </p>
      </div>

      {/* Category Tabs */}
      <div
        className="shop-tabs"
        style={{
          display: "flex",
          gap: 10,
          justifyContent: "center",
          padding: "24px 16px 40px",
          flexWrap: "wrap",
        }}
      >
        {categories.map((c) => {
          const isActive = active === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setActive(c.key)}
              style={{
                background: isActive
                  ? "linear-gradient(135deg, #e31c1c, #b01010)"
                  : "#1a1a1a",
                color: "#fff",
                border: isActive
                  ? "1.5px solid #e31c1c"
                  : "1.5px solid #2a2a2a",
                borderRadius: 100,
                padding: "11px 26px",
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: 2,
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.2s",
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Sections */}
      <div
        className="shop-container"
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "0 32px 80px",
        }}
      >
        {sections.map((sec) => (
          <section key={sec.title} style={{ marginBottom: 60 }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <h2
                style={{
                  fontSize: "clamp(24px, 3vw, 34px)",
                  fontWeight: 900,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                {sec.title}
              </h2>
              <span
                style={{
                  color: "#555",
                  fontSize: 13,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                {sec.items.length} items
              </span>
            </div>

            <div
              className="shop-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 20,
              }}
            >
              {sec.items.map((shoe, i) => (
                <ShoeCard
                  key={shoe.id}
                  shoe={shoe}
                  index={i}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </section>
        ))}
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
              letterSpacing: 1,
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login required modal */}
      <AnimatePresence>
        {loginPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLoginPrompt(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2000,
              padding: 20,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#141414",
                border: "1.5px solid #2a2a2a",
                borderRadius: 20,
                padding: 32,
                maxWidth: 400,
                width: "100%",
                textAlign: "center",
                boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  margin: "0 auto 16px",
                  borderRadius: "50%",
                  background: "rgba(227,28,28,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#e31c1c">
                  <path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM8.9 6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2H8.9V6z" />
                </svg>
              </div>
              <h3
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  color: "#fff",
                  margin: 0,
                  fontFamily: "'Barlow Condensed', Arial, sans-serif",
                }}
              >
                Login Required
              </h3>
              <p style={{ color: "#aaa", fontSize: 14, marginTop: 8, marginBottom: 24 }}>
                You must be logged in to add items to your cart.
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button
                  onClick={() => setLoginPrompt(false)}
                  style={{
                    background: "transparent",
                    color: "#fff",
                    border: "1.5px solid #2a2a2a",
                    borderRadius: 10,
                    padding: "11px 22px",
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setLoginPrompt(false);
                    navigate("/login");
                  }}
                  style={{
                    background: "linear-gradient(135deg, #e31c1c, #b01010)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    padding: "11px 22px",
                    fontSize: 13,
                    fontWeight: 800,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    boxShadow: "0 6px 18px rgba(227,28,28,0.3)",
                  }}
                >
                  Login Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .shop-nav { padding: 14px 20px !important; }
          .shop-brand { font-size: 18px !important; letter-spacing: 1.5px !important; }
          .shop-header { padding: 40px 20px 16px !important; }
          .shop-tabs button { padding: 9px 18px !important; font-size: 12px !important; }
          .shop-container { padding: 0 16px 60px !important; }
          .shop-grid { gap: 14px !important; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important; }
        }
        @media (max-width: 480px) {
          .shop-nav { padding: 12px 14px !important; }
          .shop-brand { font-size: 16px !important; letter-spacing: 1px !important; }
          .shop-nav-right { gap: 8px !important; }
          .shop-header { padding: 28px 14px 12px !important; }
          .shop-header h1 { font-size: 28px !important; }
          .shop-header p { font-size: 13px !important; }
          .shop-tabs { padding: 16px 12px 26px !important; gap: 6px !important; }
          .shop-tabs button { padding: 8px 14px !important; font-size: 11px !important; letter-spacing: 1.5px !important; }
          .shop-container { padding: 0 12px 60px !important; }
          .shop-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
        }
      `}</style>
    </div>
  );
};

const ShoeCard = ({ shoe, index, onAddToCart }) => {
  const [selectedColor, setSelectedColor] = useState(shoe.colors[0]);
  const [selectedSize, setSelectedSize] = useState(shoe.availableSizes?.[0] ?? null);

  return (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: Math.min(index * 0.02, 0.4) }}
    whileHover={{ y: -6 }}
    style={{
      background: "#141414",
      border: "1.5px solid #1f1f1f",
      borderRadius: 16,
      overflow: "hidden",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <div
      style={{
        width: "100%",
        aspectRatio: "1 / 1",
        background: "#0e0e0e",
        overflow: "hidden",
      }}
    >
      <motion.img
        key={selectedColor}
        src={(shoe.colorImages && shoe.colorImages[selectedColor]) || shoe.image}
        alt={`${shoe.name} - ${selectedColor}`}
        loading="lazy"
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        onError={(e) => {
          if (e.currentTarget.src !== FALLBACK_SHOE_IMG) {
            e.currentTarget.src = FALLBACK_SHOE_IMG;
          }
        }}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>

    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
      <span
        style={{
          color: "#e31c1c",
          fontSize: 11,
          letterSpacing: 2,
          textTransform: "uppercase",
          fontWeight: 700,
        }}
      >
        {shoe.type}
      </span>
      <h3
        style={{
          margin: 0,
          fontSize: 15,
          fontWeight: 700,
          color: "#fff",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {shoe.name}
      </h3>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>
          ₹{shoe.price.toLocaleString("en-IN")}
        </span>
        <span style={{ fontSize: 12, color: "#888" }}>
          ★ {shoe.rating}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
        {shoe.colors.map((c) => {
          const isSelected = selectedColor === c;
          const hex = COLOR_HEX[c] || "#666";
          return (
            <button
              key={c}
              type="button"
              title={c}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedColor(c);
              }}
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: hex,
                border: isSelected
                  ? "2px solid #e31c1c"
                  : "2px solid #2a2a2a",
                boxShadow: isSelected
                  ? "0 0 0 2px #0a0a0a inset, 0 0 0 1px #e31c1c"
                  : "0 0 0 2px #141414 inset",
                cursor: "pointer",
                padding: 0,
                transition: "all 0.18s ease",
                transform: isSelected ? "scale(1.1)" : "scale(1)",
              }}
            />
          );
        })}
        <span
          style={{
            fontSize: 11,
            color: "#888",
            marginLeft: 2,
            textTransform: "uppercase",
            letterSpacing: 1,
            fontWeight: 600,
          }}
        >
          {selectedColor}
        </span>
      </div>

      {/* Size selector */}
      <div style={{ marginTop: 10 }}>
        <div
          style={{
            fontSize: 10,
            color: "#888",
            letterSpacing: 1.5,
            textTransform: "uppercase",
            fontWeight: 700,
            marginBottom: 6,
          }}
        >
          UK Size
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {shoe.sizes.map((sz) => {
            const available = shoe.availableSizes?.includes(sz);
            const isSelected = selectedSize === sz;
            return (
              <button
                key={sz}
                type="button"
                disabled={!available}
                onClick={(e) => {
                  e.stopPropagation();
                  if (available) setSelectedSize(sz);
                }}
                title={available ? `Size ${sz}` : `Size ${sz} — out of stock`}
                style={{
                  minWidth: 32,
                  height: 30,
                  padding: "0 8px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: "inherit",
                  cursor: available ? "pointer" : "not-allowed",
                  background: isSelected
                    ? "linear-gradient(135deg, #e31c1c, #b01010)"
                    : available
                    ? "#1a1a1a"
                    : "#0d0d0d",
                  color: isSelected ? "#fff" : available ? "#fff" : "#444",
                  border: isSelected
                    ? "1.5px solid #e31c1c"
                    : "1.5px solid #2a2a2a",
                  textDecoration: available ? "none" : "line-through",
                  opacity: available ? 1 : 0.5,
                  transition: "all 0.15s",
                }}
              >
                {sz}
              </button>
            );
          })}
        </div>
      </div>

      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={(e) => {
          e.stopPropagation();
          onAddToCart?.(shoe, selectedColor, selectedSize);
        }}
        style={{
          marginTop: 12,
          width: "100%",
          background: "linear-gradient(135deg, #e31c1c, #b01010)",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          padding: "11px",
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 2,
          textTransform: "uppercase",
          cursor: "pointer",
          fontFamily: "inherit",
          boxShadow: "0 6px 16px rgba(227,28,28,0.25)",
        }}
      >
        Add to Cart
      </motion.button>
    </div>
  </motion.div>
  );
};

export default Shop;
