import axios from "axios";

const api = axios.create({
  baseURL: "https://route-posts.routemisr.com",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (typeof data?.message === "string") return data.message;
    if (Array.isArray(data?.errors)) return data.errors.join(", ");
  }
  return "Something went wrong. Please try again.";
}

export default api;
