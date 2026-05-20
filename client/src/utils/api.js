import axios from "axios";

// In production (Vercel), the client and API live on the same domain,
// so a relative `/api` works. In dev, hit the local Express on 8000.
const baseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "/api" : "http://localhost:8000/api");

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
