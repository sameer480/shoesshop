import { allShoes } from "../data/shoes";

const CUSTOMER_CARE = {
  phone: "+91 1800-123-4567",
  email: "support@shoehub.com",
  hours: "Mon-Sat, 9 AM - 9 PM IST",
};

const extractSize = (text) => {
  const explicit = text.match(/(?:size|uk)\s*(\d{1,2})/i);
  if (explicit) return parseInt(explicit[1], 10);
  const standalone = text.match(/\b(\d{1,2})\b/);
  if (standalone) {
    const n = parseInt(standalone[1], 10);
    if (n >= 1 && n <= 13) return n;
  }
  return null;
};

const STOPWORDS = new Set([
  "is", "a", "an", "the", "in", "of", "and", "or", "with", "for", "to",
  "have", "has", "do", "you", "available", "size", "uk", "any", "got",
  "can", "i", "get", "find", "want", "show", "me", "shoes", "shoe",
  "please", "pls", "plz", "yes", "no",
]);

const tokenizeQuery = (q) =>
  q
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));

const findMatchingShoes = (query) => {
  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) return [];
  return allShoes
    .map((shoe) => {
      const hay = `${shoe.name} ${shoe.category} ${shoe.brand} ${shoe.type}`.toLowerCase();
      const score = tokens.reduce((s, t) => s + (hay.includes(t) ? 1 : 0), 0);
      return { shoe, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((r) => r.shoe);
};

const checkAvailability = (query) => {
  const size = extractSize(query);
  const matches = findMatchingShoes(query);

  if (matches.length === 0) {
    return {
      text:
        "I couldn't find a matching shoe. Try mentioning the brand and model name, e.g. 'Is Nike Classic Runner in size 9 available?'",
    };
  }

  const top = matches[0];

  if (size) {
    if (top.availableSizes?.includes(size)) {
      return {
        text: `Yes! **${top.name}** (${top.category}) is available in **UK size ${size}** for **₹${top.price.toLocaleString("en-IN")}**.`,
        action: { type: "navigate", to: "/shop", label: "View in Shop" },
      };
    }
    const otherSizes = top.availableSizes?.join(", ") || "none";
    return {
      text: `**${top.name}** is currently **out of stock in UK size ${size}**. Available sizes: ${otherSizes}.`,
      action: { type: "navigate", to: "/shop", label: "Browse similar" },
    };
  }

  return {
    text: `Found **${top.name}** in ${top.category} (${top.type}). Available in UK sizes: ${top.availableSizes?.join(", ")}. Price: ₹${top.price.toLocaleString("en-IN")}.`,
    action: { type: "navigate", to: "/shop", label: "View in Shop" },
  };
};

export const getBotResponse = (input) => {
  const q = (input || "").toLowerCase().trim();
  if (!q) return { text: "Type a question and I'll help! 🙂" };

  if (/^(hi|hello|hey|hii+|namaste|hola)\b/.test(q)) {
    return {
      text: "Hi there! 👋 I'm the ShoeHub Assistant. How can I help you today?",
      suggestions: [
        "Customer care number",
        "Show my orders",
        "Track delivery",
        "Available payment methods",
      ],
    };
  }

  if (/(thank|thanks|thx|ty)\b/.test(q)) {
    return { text: "You're welcome! 😊 Anything else I can help with?" };
  }

  if (/(care|support|helpline|contact us|phone number|call|reach you)/.test(q)) {
    return {
      text: `📞 Customer Care: ${CUSTOMER_CARE.phone}\n📧 ${CUSTOMER_CARE.email}\n🕒 ${CUSTOMER_CARE.hours}`,
    };
  }

  if (/(my order|previous order|past order|track|order status|order history|order page)/.test(q)) {
    return {
      text: "Taking you to your orders page where you can track, cancel, and write reviews.",
      action: { type: "navigate", to: "/orders", label: "Go to My Orders" },
    };
  }

  if (/(my cart|cart page|basket|view cart)/.test(q)) {
    return {
      text: "Here's your cart.",
      action: { type: "navigate", to: "/cart", label: "Open Cart" },
    };
  }

  if (/(shop now|browse|catalog|store|all shoes|new arrivals|collection)/.test(q)) {
    return {
      text: "We have 180+ styles across Men, Women, and Kids categories.",
      action: { type: "navigate", to: "/shop", label: "Browse Shop" },
    };
  }

  if (/(payment|pay|upi|cod|cash|phonepe|gpay|paytm|how to pay)/.test(q)) {
    return {
      text:
        "We accept UPI (works with PhonePe, GPay, Paytm, BHIM — any UPI app) and Cash on Delivery. Choose at checkout.",
    };
  }

  if (/(delivery|deliver|shipping|ship|how long|when (will|do) (it|arrive)|eta|pincode)/.test(q)) {
    return {
      text:
        "📦 Delivery: 3–5 business days for most pincodes, 2 days for metros (Delhi, Mumbai). Shipping is ₹99. Verify delivery to your pincode during checkout.",
    };
  }

  if (/(return|cancel|refund|exchange)/.test(q)) {
    return {
      text:
        "✅ Cancel orders that haven't shipped from your Orders page. Paid (UPI) orders are refunded in 5–7 business days. COD orders have nothing to refund.",
      action: { type: "navigate", to: "/orders", label: "Go to Orders" },
    };
  }

  if (/(forgot password|reset password|change password|otp)/.test(q)) {
    return {
      text:
        "Click 'Forgot password?' on the login page. We'll send a 6-digit OTP to your registered email. Enter it, set a new password, and you're back in.",
      action: { type: "navigate", to: "/forgot-password", label: "Reset Password" },
    };
  }
  if (/(login|sign in|signin)/.test(q)) {
    return {
      text: "Tap Login at the top right. You can also use Continue with Google for one-click sign in.",
      action: { type: "navigate", to: "/login", label: "Go to Login" },
    };
  }
  if (/(register|sign up|create account|new account)/.test(q)) {
    return {
      text: "New here? Click Register at the top right or use Google sign-up.",
      action: { type: "navigate", to: "/register", label: "Register" },
    };
  }
  if (/(my account|profile)/.test(q)) {
    return { text: "Click your avatar at the top right to access your account menu." };
  }

  if (/(review|rating|write review|star)/.test(q)) {
    return {
      text: "You can write a review and give star ratings on any delivered order from your Orders page.",
      action: { type: "navigate", to: "/orders", label: "Go to Orders" },
    };
  }

  if (/\b(men|mens|men's)\b/.test(q) && findMatchingShoes(q).length === 0) {
    return {
      text: "Men's Casual collection has 60+ styles. Want to browse?",
      action: { type: "navigate", to: "/shop", label: "Browse Men" },
    };
  }
  if (/\b(women|womens|ladies|girl)\b/.test(q) && findMatchingShoes(q).length === 0) {
    return {
      text: "Women's collection has 60+ styles across Sneakers, Casual, and Slip-Ons.",
      action: { type: "navigate", to: "/shop", label: "Browse Women" },
    };
  }
  if (/\b(kid|kids|child|children)\b/.test(q) && findMatchingShoes(q).length === 0) {
    return {
      text: "Kids' shoes — 60+ styles in Velcro, Sports, and Slip-On types. Sizes UK 1–7.",
      action: { type: "navigate", to: "/shop", label: "Browse Kids" },
    };
  }

  if (
    /(available|in stock|stock|size|do you have|got|find|looking for)/.test(q) ||
    findMatchingShoes(q).length > 0
  ) {
    return checkAvailability(q);
  }

  return {
    text:
      "I'm not sure I caught that. I can help with:\n• My orders / tracking\n• Cancel or refund\n• Check shoe availability (try 'Is Nike Classic Runner in size 9 available?')\n• Payment methods\n• Delivery times\n• Customer care number",
    suggestions: [
      "Customer care number",
      "Show my orders",
      "Payment methods",
      "Delivery time",
    ],
  };
};

export const GREETING = {
  text: "Hi! 👋 I'm the ShoeHub Assistant. Ask me about orders, products, delivery, or anything else.",
  suggestions: [
    "Customer care number",
    "Show my orders",
    "Is Nike Classic Runner size 9 available?",
    "Payment methods",
  ],
};
