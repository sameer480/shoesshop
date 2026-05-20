import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const API = axios.create({ baseURL });

API.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("userInfo");
    if (raw) {
      const user = JSON.parse(raw);
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
  } catch {
    // ignore
  }
  return config;
});

export default API;
