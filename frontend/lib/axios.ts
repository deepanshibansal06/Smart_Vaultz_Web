import axios from "axios";

const getInitialBaseUrl = () => {
  if (typeof window !== "undefined") {
    const customUrl = localStorage.getItem("smart_vault_api_url");
    if (customUrl && customUrl.trim().length > 0) return customUrl.trim();

    const host = window.location.hostname;
    if (host !== "localhost" && host !== "127.0.0.1") {
      return "https://smart-vault-backend-9cxx.onrender.com/api";
    }
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || "https://smart-vault-backend-9cxx.onrender.com/api";
};

export const apiClient = axios.create({
  baseURL: getInitialBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

export const setCustomApiUrl = (url: string) => {
  let formatted = url.trim();
  if (!formatted.startsWith("http://") && !formatted.startsWith("https://")) {
    formatted = `https://${formatted}`;
  }
  if (!formatted.endsWith("/api")) {
    formatted = `${formatted.replace(/\/+$/, "")}/api`;
  }
  if (typeof window !== "undefined") {
    localStorage.setItem("smart_vault_api_url", formatted);
  }
  apiClient.defaults.baseURL = formatted;
  return formatted;
};

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("smart_vault_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      const resendKey = localStorage.getItem("smart_vault_resend_key");
      if (resendKey && resendKey.trim().length > 0) {
        config.headers["x-resend-key"] = resendKey.trim();
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("smart_vault_token");
        localStorage.removeItem("smart_vault_user");
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
