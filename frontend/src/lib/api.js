// frontend/src/lib/api.js
import axios from 'axios';

// Cria uma instância do Axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // Define a base URL da sua API a partir da variável de ambiente
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de requisição para adicionar o token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Obtém o token do localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Adiciona o token ao cabeçalho de autorização
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta para lidar com erros de autenticação (ex: token expirado)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Se o erro for 401 (Não autorizado) e não for um erro de login/registro
    if (error.response && error.response.status === 401 && !error.config.url.includes('/auth/')) {
      // Opcional: Redirecionar para a página de login e limpar o token
      console.warn('Token expirado ou inválido. Redirecionando para o login.');
      // Importa dinamicamente para evitar problemas de "client-only module" no server-side
      import('next/navigation').then(({ useRouter }) => {
        const router = useRouter();
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        router.push('/login');
      });
    }
    return Promise.reject(error);
  }
);

export default api;