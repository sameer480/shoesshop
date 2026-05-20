import { useState } from "react";

const StarRating = ({ value = 0, onChange, size = 28, readOnly = false }) => {
  const [hover, setHover] = useState(0);
  const display = hover || value;
  return (
    <div style={{ display: "inline-flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= display;
        return (
          <button
            key={n}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onChange?.(n)}
            onMouseEnter={() => !readOnly && setHover(n)}
            onMouseLeave={() => !readOnly && setHover(0)}
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: readOnly ? "default" : "pointer",
              transition: "transform 0.12s",
              transform: hover === n ? "scale(1.15)" : "scale(1)",
              lineHeight: 0,
            }}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? "#facc15" : "#333"}>
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
