// ─── Cliente HTTP centralizado do projeto MONSAI ─────────────────────────────
import axios from "axios";

/**
 * Configuração de ambiente do Axios.
 * Para rodar localmente com o Spring Boot, mantenha a linha do localhost ativa.
 * Para subir o build final ao ambiente de produção, comente o localhost e ative o Render.
 */
const api = axios.create({
  // baseURL: "http://localhost:8080", // 🔌 Desenvolvimento Local
   baseURL: "https://aaci-monsai-backend-mrxp.onrender.com", // 🚀 Produção (Render)
});

// Injeta o Bearer Token em todas as requisições automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de resposta: se 401, limpa sessão e recarrega de forma segura
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const originalRequest = error.config;
      const originalUrl = originalRequest.url || "";
      
      // 🚨 BLINDAGEM: Não reseta a sessão se o erro ocorrer nas rotas de validação primárias
      // Isso impede que a checagem imediata de perfil limpe o login do usuário por delay de sincronia
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