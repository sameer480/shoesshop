const CART_KEY = "cart";

export const getCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveCart = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-updated"));
};

export const addToCart = (item) => {
  const cart = getCart();
  const key = `${item.id}-${item.color || ""}-${item.size || ""}`;
  const existing = cart.find((c) => c.key === key);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      key,
      id: item.id,
      name: item.name,
      brand: item.brand,
      price: item.price,
      image: item.image,
      color: item.color,
      size: item.size,
      quantity: 1,
    });
  }
  saveCart(cart);
  return cart;
};

export const removeFromCart = (key) => {
  const cart = getCart().filter((c) => c.key !== key);
  saveCart(cart);
  return cart;
};

export const clearCart = () => {
  saveCart([]);
};

export const getCartCount = () =>
  getCart().reduce((sum, item) => sum + item.quantity, 0);

export const isLoggedIn = () => !!localStorage.getItem("userInfo");
