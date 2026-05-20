import API from "../utils/api";

export const registerUser = async (userData) => {
  const response = await API.post("/auth/register", userData);
  return response.data;
};

export const loginUser = async (userData) => {
  const response = await API.post("/auth/login", userData);
  return response.data;
};

export const googleLogin = async (credential) => {
  const response = await API.post("/auth/google-login", { credential });
  return response.data;
};

export const googleRegister = async (credential, mobile) => {
  const response = await API.post("/auth/google-register", {
    credential,
    mobile,
  });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await API.post("/auth/forgot-password", { email });
  return response.data;
};

export const verifyOtp = async (email, otp) => {
  const response = await API.post("/auth/verify-otp", { email, otp });
  return response.data;
};

export const resetPassword = async (email, otp, password) => {
  const response = await API.post("/auth/reset-password", {
    email,
    otp,
    password,
  });
  return response.data;
};
