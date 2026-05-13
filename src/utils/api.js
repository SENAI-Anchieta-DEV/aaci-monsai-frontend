// ─── Cliente HTTP centralizado do projeto MONSAI ─────────────────────────────
<<<<<<< HEAD
// Cria uma instância única do axios com baseURL e interceptor de autenticação.
// Uso: import api from '../utils/api';
//      await api.get('/idosos');  →  sem precisar repetir headers em cada chamada

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

// Injeta o Bearer Token em todas as requisições autenticadas automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

=======
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

>>>>>>> AACI-163-autenticar-usuario-no-frontend-login-funcional
export default api;