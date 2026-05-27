// ─── Cliente HTTP centralizado do projeto MONSAI ─────────────────────────────
import axios from "axios";

const api = axios.create({
  baseURL: "https://aaci-monsai-backend-mrxp.onrender.com",
});

// Injeta o Bearer Token em todas as requisições automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor de resposta: se 401, limpa sessão e recarrega
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes("/auth/login");
      if (!isLoginRequest) {
        localStorage.clear();
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
