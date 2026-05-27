// ─── Cliente HTTP centralizado do projeto MONSAI ─────────────────────────────
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080", // 🔌 Sempre HTTP puro para desenvolvimento local
});

// Injeta o Bearer Token em todas as requisições automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor de resposta: se 401, limpa sessão e recarrega de forma segura
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const originalRequest = error.config;
      const originalUrl = originalRequest.url || "";
      
      // 🚨 BLINDAGEM: Não reseta a sessão se o erro ocorrer nas telas de validação de credenciais primárias
      const isAuthPath = originalUrl.includes("/auth/login") || originalUrl.includes("/usuarios");
      
      if (!isAuthPath) {
        console.warn("🔒 Token expirado ou requisição inválida. Redirecionando para a área pública...");
        localStorage.clear();
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export default api;