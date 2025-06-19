// frontend/src/context/AuthContext.jsx
'use client'; // Componente de cliente

import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/api'; // Sua instância Axios configurada
import { useRouter } from 'next/navigation';

// Cria o contexto de autenticação
export const AuthContext = createContext();

// Provedor de Autenticação
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Armazena os dados do usuário autenticado
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado de autenticação
  const [loading, setLoading] = useState(true); // Indica se o carregamento inicial está completo
  const router = useRouter(); // Hook para navegação

  // Função para carregar o usuário do localStorage ao iniciar a aplicação
  const loadUserFromLocalStorage = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Configura o token na instância do Axios
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // Tenta obter o perfil do usuário para validar o token e buscar dados atualizados
        const response = await api.get('/auth/profile');
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        // Se não há token, garante que o estado é desautenticado
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      // Se o token for inválido ou expirado, limpa e desautentica
      console.error('Falha ao carregar usuário ou token inválido:', error);
      localStorage.removeItem('token');
      api.defaults.headers.common['Authorization'] = '';
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false); // Marca o carregamento inicial como completo
    }
  }, []);

  useEffect(() => {
    loadUserFromLocalStorage();
  }, [loadUserFromLocalStorage]);

  // Função de Login
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user: userData, token } = response.data;

      localStorage.setItem('token', token); // Armazena o token
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Configura o token no Axios
      setUser(userData);
      setIsAuthenticated(true);
      return response.data; // Retorna dados, útil para redirecionamento
    } catch (error) {
      console.error('Erro no login:', error);
      setIsAuthenticated(false);
      // Lança o erro para ser tratado pelo componente que chamou o login
      throw new Error(error.response?.data?.message || 'Falha no login.');
    }
  };

  // Função de Cadastro
  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { user: userData, token } = response.data;

      localStorage.setItem('token', token); // Armazena o token
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Configura o token no Axios
      setUser(userData);
      setIsAuthenticated(true);
      return response.data; // Retorna dados
    } catch (error) {
      console.error('Erro no cadastro:', error);
      setIsAuthenticated(false);
      throw new Error(error.response?.data?.message || 'Falha no cadastro.');
    }
  };

  // Função de Logout
  const logout = () => {
    localStorage.removeItem('token'); // Remove o token
    api.defaults.headers.common['Authorization'] = ''; // Limpa o cabeçalho de autorização no Axios
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login'); // Redireciona para a página de login
  };

  // O valor que será fornecido pelo contexto
  const authContextValue = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    setUser // Permite que outros componentes atualizem o usuário no contexto (ex: settings)
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};