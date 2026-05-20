import API from "../utils/api";

export const checkPincode = async (pincode) => {
  const response = await API.get(`/delivery/${pincode}`);
  return response.data;
};

export const createOrder = async (payload) => {
  const response = await API.post("/orders", payload);
  return response.data;
};

export const confirmPayment = async (orderId, paymentRef) => {
  const response = await API.post(`/orders/${orderId}/confirm`, { paymentRef });
  return response.data;
};

export const listMyOrders = async () => {
  const response = await API.get("/orders/me");
  return response.data;
};

export const cancelOrder = async (orderId, reason) => {
  const response = await API.patch(`/orders/${orderId}/cancel`, { reason });
  return response.data;
};

export const markDelivered = async (orderId) => {
  const response = await API.patch(`/orders/${orderId}/mark-delivered`);
  return response.data;
};
