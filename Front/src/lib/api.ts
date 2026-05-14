import axios from "axios";

function normalizeApiUrl(url: string) {
  const cleanUrl = url.replace(/\/+$/, "");
  if (!cleanUrl || cleanUrl === "/api" || cleanUrl.endsWith("/api")) return cleanUrl || "/api";
  return `${cleanUrl}/api`;
}

export const api = axios.create({
  baseURL: normalizeApiUrl(import.meta.env.VITE_API_URL || "/api"),
  withCredentials: true,
});

export function setAuthToken(token?: string) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
    }
    return Promise.reject(err);
  }
);
