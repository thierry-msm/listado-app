// frontend/src/app/settings/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';

export default function SettingsPage() {
  const { user, isAuthenticated, loading: authLoading, setUser } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); // Email não editável
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [isAuthenticated, authLoading, user, router]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const updates = {};
      if (name !== user.name) {
        updates.name = name;
      }

      if (newPassword) {
        if (newPassword !== confirmNewPassword) {
          setError('A nova senha e a confirmação não coincidem.');
          setLoading(false);
          return;
        }
        if (!oldPassword) {
          setError('A senha antiga é necessária para alterar a senha.');
          setLoading(false);
          return;
        }
        updates.oldPassword = oldPassword;
        updates.newPassword = newPassword;
      }

      if (Object.keys(updates).length === 0) {
        setMessage('Nenhuma alteração detectada para salvar.');
        setLoading(false);
        return;
      }

      const response = await api.put('/auth/profile', updates);
      setUser(response.data.user); // Atualiza o usuário no contexto Auth
      setMessage('Perfil atualizado com sucesso!');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao atualizar perfil.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-full min-h-[calc(100vh-80px)]">
        <p className="text-xl text-gray-700">Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 p-10 bg-white shadow-lg rounded-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Configurações de Perfil
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleUpdateProfile}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
            <input
              id="name"
              name="name"
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 cursor-not-allowed sm:text-sm"
              value={email}
              disabled // E-mail não editável via esta rota
            />
          </div>

          <div className="border-t pt-6 mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Alterar Senha</h3>
            <div>
              <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700">Senha Antiga</label>
              <input
                id="oldPassword"
                name="oldPassword"
                type="password"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>
            <div className="mt-4">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Nova Senha</label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="mt-4">
              <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">Confirmar Nova Senha</label>
              <input
                id="confirmNewPassword"
                name="confirmNewPassword"
                type="password"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
            </div>
          </div>

          {message && <p className="text-green-500 text-sm text-center mt-4">{message}</p>}
          {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}

          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}