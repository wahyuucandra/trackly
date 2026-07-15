import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

// Response interceptor — 401 → hapus cookies + redirect login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      // Jangan redirect jika sudah di /login (infinite loop)
      if (!currentPath.startsWith("/login")) {
        // Hapus semua cookies
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        // Defer redirect ke next tick agar tidak conflict dengan React render
        setTimeout(() => {
          window.location.replace("/login");
        }, 0);
      }
    }
    return Promise.reject(error);
  },
);