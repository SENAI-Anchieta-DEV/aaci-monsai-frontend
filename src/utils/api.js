import axios from 'axios';

const api = axios.create({
  // Se o seu backend Spring estiver rodando na porta 8080:
  baseURL: 'http://localhost:8080', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;