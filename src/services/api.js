import axios from 'axios';

// Criamos uma instância do axios apontando para o nosso FastAPI
const api = axios.create({
  baseURL: 'https://github.com/Garbim-Dev/point-frontend.git',
});

export default api;