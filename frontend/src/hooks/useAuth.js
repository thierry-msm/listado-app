// frontend/src/hooks/useAuth.js
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext'; // Importa o contexto que criamos

/**
 * Hook customizado para acessar o contexto de autenticação.
 * Simplifica o consumo dos valores do AuthContext em qualquer componente.
 * @returns {object} O objeto de contexto de autenticação (user, isAuthenticated, login, logout, etc.).
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  // Garante que o hook seja usado dentro de um AuthProvider
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
};