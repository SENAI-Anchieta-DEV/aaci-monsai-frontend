// ─── Cliente HTTP centralizado do projeto MONSAI ─────────────────────────────
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

export default api;