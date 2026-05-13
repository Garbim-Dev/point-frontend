import axios from 'axios';

// Criamos uma instância do axios apontando para o nosso FastAPI
const api = axios.create({
  baseURL: 'https://point-api-ptls.onrender.com',
});

export default api;