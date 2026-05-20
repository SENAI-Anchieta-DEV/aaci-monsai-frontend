// ─── Cliente HTTP centralizado do projeto MONSAI ─────────────────────────────
import axios from "axios";

/**
 * Configuração do Axios apontando para o ambiente de produção (Render).
 * Caso precise testar localmente, altere para "http://localhost:8080".
 */
const api = axios.create({
  baseURL: "https://aaci-monsai-backend-mrxp.onrender.com", 
});

// Injeta o Bearer Token em todas as requisições autenticadas automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de resposta: se 401 (Sessão Expirada/Inválida), limpa a sessão
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Verifica se o erro não veio da própria tentativa de login
      const isLoginRequest = error.config?.url?.includes("/auth/login");
      
      // Evita o recarregamento infinito se o erro 401 for apenas um erro de senha no login
      if (!isLoginRequest) {
        localStorage.clear();
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export default api;