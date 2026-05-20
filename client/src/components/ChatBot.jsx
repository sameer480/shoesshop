import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getBotResponse, GREETING } from "../utils/chatbot";

const ChatBot = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: GREETING.text, suggestions: GREETING.suggestions },
  ]);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing, open]);

  const sendMessage = (text) => {
    const value = (text || "").trim();
    if (!value) return;
    setMessages((m) => [...m, { from: "user", text: value }]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const res = getBotResponse(value);
      setMessages((m) => [
        ...m,
        {
          from: "bot",
          text: res.text,
          suggestions: res.suggestions,
          action: res.action,
        },
      ]);
      setTyping(false);
    }, 600);
  };

  const handleAction = (action) => {
    if (action?.type === "navigate" && action.to) {
      setOpen(false);
      navigate(action.to);
    }
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setOpen(true)}
            aria-label="Open chat"
            style={{
              position: "fixed",
              bottom: 24,
              right: 24,
              width: 62,
              height: 62,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #e31c1c, #b01010)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 12px 28px rgba(227,28,28,0.45)",
              zIndex: 999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: "2px solid #e31c1c",
                animation: "chatPulse 2s ease-out infinite",
              }}
            />
            <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM7 9h10v2H7V9zm6 5H7v-2h6v2zm4-6H7V6h10v2z" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="chatbot-panel"
            style={{
              position: "fixed",
              bottom: 24,
              right: 24,
              width: 380,
              maxWidth: "calc(100vw - 32px)",
              height: 540,
              maxHeight: "calc(100vh - 48px)",
              background: "#0a0a0a",
              border: "1.5px solid #2a2a2a",
              borderRadius: 20,
              boxShadow: "0 30px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(227,28,28,0.15)",
              zIndex: 1000,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                background: "linear-gradient(135deg, #1a0606, #0a0a0a)",
                borderBottom: "1px solid #1f1f1f",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #e31c1c, #b01010)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(227,28,28,0.3)",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 1 4.32L2 22l5.85-.99C9.16 21.64 10.55 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm-4 9h2v2H8v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "#fff", fontSize: 15, fontWeight: 800, letterSpacing: 1 }}>
                  ShoeHub Assistant
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#22c55e",
                      boxShadow: "0 0 8px rgba(34,197,94,0.6)",
                    }}
                  />
                  <span style={{ color: "#888", fontSize: 11, letterSpacing: 1, textTransform: "uppercase" }}>
                    Online
                  </span>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#aaa",
                  cursor: "pointer",
                  padding: 6,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#1f1f1f")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: 14,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                background:
                  "radial-gradient(circle at top, rgba(227,28,28,0.04), transparent 60%), #0a0a0a",
              }}
            >
              {messages.map((m, i) => (
                <Bubble key={i} message={m} onAction={handleAction} onSuggestion={sendMessage} />
              ))}
              {typing && <TypingBubble />}
            </div>

            {/* Input */}
            <div
              style={{
                padding: 12,
                borderTop: "1px solid #1f1f1f",
                background: "#0a0a0a",
                display: "flex",
                gap: 8,
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Ask me anything..."
                style={{
                  flex: 1,
                  background: "#1a1a1a",
                  border: "1.5px solid #2a2a2a",
                  borderRadius: 100,
                  padding: "11px 16px",
                  color: "#fff",
                  fontSize: 14,
                  fontFamily: "inherit",
                  outline: "none",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#e31c1c")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a2a")}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                aria-label="Send"
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  background: input.trim()
                    ? "linear-gradient(135deg, #e31c1c, #b01010)"
                    : "#2a2a2a",
                  color: "#fff",
                  border: "none",
                  cursor: input.trim() ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: input.trim() ? "0 4px 12px rgba(227,28,28,0.3)" : "none",
                  transition: "all 0.15s",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes chatPulse {
          0%   { transform: scale(1);   opacity: 0.7; }
          100% { transform: scale(1.6); opacity: 0;   }
        }
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0);   opacity: 0.4; }
          30%           { transform: translateY(-4px); opacity: 1;   }
        }
        @media (max-width: 480px) {
          .chatbot-panel { bottom: 12px !important; right: 12px !important; left: 12px !important; width: auto !important; }
        }
      `}</style>
    </>
  );
};

const Bubble = ({ message, onAction, onSuggestion }) => {
  const isBot = message.from === "bot";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        display: "flex",
        justifyContent: isBot ? "flex-start" : "flex-end",
      }}
    >
      <div style={{ maxWidth: "85%" }}>
        <div
          style={{
            background: isBot ? "#1a1a1a" : "linear-gradient(135deg, #e31c1c, #b01010)",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: isBot ? "16px 16px 16px 4px" : "16px 16px 4px 16px",
            border: isBot ? "1px solid #2a2a2a" : "none",
            fontSize: 13.5,
            lineHeight: 1.5,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {message.text}
        </div>

        {message.action && (
          <button
            onClick={() => onAction(message.action)}
            style={{
              marginTop: 6,
              background: "transparent",
              color: "#e31c1c",
              border: "1.5px solid #e31c1c",
              borderRadius: 100,
              padding: "6px 14px",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {message.action.label || "Go"} →
          </button>
        )}

        {message.suggestions && message.suggestions.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            {message.suggestions.map((s) => (
              <button
                key={s}
                onClick={() => onSuggestion(s)}
                style={{
                  background: "#1a1a1a",
                  color: "#bbb",
                  border: "1px solid #2a2a2a",
                  borderRadius: 100,
                  padding: "5px 12px",
                  fontSize: 11.5,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#222";
                  e.currentTarget.style.borderColor = "#e31c1c";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#1a1a1a";
                  e.currentTarget.style.borderColor = "#2a2a2a";
                  e.currentTarget.style.color = "#bbb";
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const TypingBubble = () => (
  <div style={{ display: "flex", justifyContent: "flex-start" }}>
    <div
      style={{
        background: "#1a1a1a",
        border: "1px solid #2a2a2a",
        padding: "12px 16px",
        borderRadius: "16px 16px 16px 4px",
        display: "flex",
        gap: 4,
        alignItems: "center",
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#e31c1c",
            display: "inline-block",
            animation: `typingDot 1.2s ${i * 0.15}s infinite ease-in-out`,
          }}
        />
      ))}
    </div>
  </div>
);

export default ChatBot;
