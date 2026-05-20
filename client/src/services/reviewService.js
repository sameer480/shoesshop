import API from "../utils/api";

export const submitReview = async (payload) => {
  const response = await API.post("/reviews", payload);
  return response.data;
};

export const listMyReviews = async () => {
  const response = await API.get("/reviews/me");
  return response.data;
};

export const listProductReviews = async (productId) => {
  const response = await API.get(`/reviews/product/${productId}`);
  return response.data;
};
