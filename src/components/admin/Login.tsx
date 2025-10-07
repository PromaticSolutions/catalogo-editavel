// src/components/admin/Login.tsx - VERSÃO CORRIGIDA PARA DIAGNÓSTICO

// ADICIONE ESTAS DUAS LINHAS DE DIAGNÓSTICO NO TOPO
console.log("DIAGNÓSTICO -> URL Recebida:", import.meta.env.VITE_SUPABASE_URL);
console.log("DIAGNÓSTICO -> Chave Recebida:", import.meta.env.VITE_SUPABASE_ANON_KEY);

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setError('Email ou senha incorretos');
      setLoading(false);
      console.error("Erro retornado pelo Supabase no login:", error); // Log de erro adicional
    } else {
      onLoginSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-4 rounded-full">
            <Lock className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
          Painel Administrativo
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Digite seu email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Digite sua senha"
              required
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
