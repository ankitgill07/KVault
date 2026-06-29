import axios from "axios";
const API_BASE_URL = `${import.meta.env.VITE_BACKEND_BASE_URL}/${import.meta.env.API_VERSION || "api/v1"}`;
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});
export const emitAuthFailure = () => window.dispatchEvent(new CustomEvent("auth-failure"));
api.interceptors.request.use((c) => c, (e) => Promise.reject(e));
api.interceptors.response.use((r) => r, (e) => Promise.reject(e));
