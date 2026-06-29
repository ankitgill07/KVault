import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_BASE_URL}/${import.meta.env.API_VERSION || "api/v1"}`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});
