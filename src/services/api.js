import axios from 'axios';

// Criamos uma instância do axios apontando para o nosso FastAPI
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

export default api;