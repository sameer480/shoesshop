import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

const readUser = () => {
  try {
    const raw = localStorage.getItem("userInfo");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const AuthNav = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(readUser);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onStorage = () => setUser(readUser());
    window.addEventListener("storage", onStorage);
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    setOpen(false);
    navigate("/");
  };

  if (!user) {
    return (
      <div className="authnav-out" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Link to="/login" className="authnav-btn" style={btnOutline}>Login</Link>
        <Link to="/register" className="authnav-btn" style={btnSolid}>Register</Link>
        <style>{`
          @media (max-width: 480px) {
            .authnav-out { gap: 6px !important; }
            .authnav-btn { padding: 8px 12px !important; font-size: 11px !important; letter-spacing: 1px !important; }
          }
        `}</style>
      </div>
    );
  }

  const initial = (user.name || user.email || "U").trim().charAt(0).toUpperCase();
  const displayName = user.name || user.email?.split("@")[0] || "User";
  const seed = encodeURIComponent(user.email || user.name || "user");
  const dicebearUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}&backgroundColor=e31c1c,b91c1c,7c1d1d,1a1a1a&radius=50`;
  const avatarSrc = user.avatar || dicebearUrl;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="authnav-trigger"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "#1a1a1a",
          border: "1.5px solid #2a2a2a",
          borderRadius: 100,
          padding: "6px 14px 6px 6px",
          color: "#fff",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 34,
            height: 34,
            borderRadius: "50%",
            overflow: "hidden",
            background: "linear-gradient(135deg, #e31c1c, #b01010)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(227,28,28,0.4)",
            border: "2px solid rgba(255,255,255,0.1)",
          }}
        >
          <img
            src={avatarSrc}
            alt={displayName}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          <span
            style={{
              position: "absolute",
              color: "#fff",
              fontWeight: 800,
              fontSize: 14,
              zIndex: -1,
            }}
          >
            {initial}
          </span>
        </div>
        <span
          className="authnav-name"
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            maxWidth: 120,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {displayName}
        </span>
        <svg className="authnav-chev" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.6 }}>
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>
      <style>{`
        @media (max-width: 600px) {
          .authnav-trigger { padding: 4px !important; gap: 0 !important; }
          .authnav-name, .authnav-chev { display: none !important; }
        }
      `}</style>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            background: "#141414",
            border: "1.5px solid #2a2a2a",
            borderRadius: 12,
            minWidth: 200,
            padding: 8,
            zIndex: 1000,
            boxShadow: "0 12px 28px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              padding: "14px 12px",
              borderBottom: "1px solid #222",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                overflow: "hidden",
                background: "linear-gradient(135deg, #e31c1c, #b01010)",
                flexShrink: 0,
                border: "2px solid rgba(255,255,255,0.1)",
              }}
            >
              <img
                src={avatarSrc}
                alt={displayName}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: 14,
                  color: "#fff",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {displayName}
              </div>
              {user.email && (
                <div
                  style={{
                    fontSize: 11,
                    color: "#888",
                    marginTop: 2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user.email}
                </div>
              )}
            </div>
          </div>
          <Link
            to="/orders"
            onClick={() => setOpen(false)}
            style={{
              display: "block",
              textAlign: "left",
              background: "transparent",
              color: "#fff",
              padding: "10px 12px",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              fontFamily: "inherit",
              borderRadius: 8,
              textDecoration: "none",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#1f1f1f")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            My Orders
          </Link>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              textAlign: "left",
              background: "transparent",
              border: "none",
              color: "#ff6b6b",
              padding: "10px 12px",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "inherit",
              borderRadius: 8,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#1f1f1f")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

const btnBase = {
  fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: 2,
  textTransform: "uppercase",
  padding: "9px 18px",
  borderRadius: 10,
  transition: "all 0.2s",
};

const btnSolid = {
  ...btnBase,
  background: "#e31c1c",
  color: "#fff",
  border: "1.5px solid #e31c1c",
};

const btnOutline = {
  ...btnBase,
  background: "transparent",
  color: "#fff",
  border: "1.5px solid #2a2a2a",
};

export default AuthNav;
