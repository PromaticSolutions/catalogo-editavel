// src/App.tsx

// --- 1. IMPORTS ORGANIZADOS ---
// Juntei os imports duplicados e adicionei o que faltava.
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Catalog from './components/Catalog';
import Login from './components/admin/Login';
import AdminPanel from './components/admin/AdminPanel';
import { isAdminLoggedIn } from './lib/auth';
import AgeVerificationModal from './components/AgeVerificationModal'; // Import do nosso novo modal

// --- 2. COMPONENTE DE ROTA PROTEGIDA (Sem alterações) ---
// Seu componente para proteger a rota /admin continua exatamente igual.
function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    setIsAuthenticated(isAdminLoggedIn());
    setIsChecking(false);
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return <>{children}</>;
}

// --- 3. COMPONENTE PRINCIPAL App (Com a lógica do modal) ---
function App() {
  // Lógica para controlar o modal de idade
  const [showAgeModal, setShowAgeModal] = useState(false);

  // Efeito que roda uma vez para verificar se o modal deve ser exibido
  useEffect(() => {
    const isVerified = sessionStorage.getItem('isAgeVerified');
    if (isVerified !== 'true') {
      setShowAgeModal(true); // Mostra o modal se o usuário ainda não verificou a idade
    }
  }, []);

  // Função para quando o usuário confirma a idade
  const handleAgeConfirm = () => {
    sessionStorage.setItem('isAgeVerified', 'true');
    setShowAgeModal(false); // Esconde o modal
  };

  // Função para quando o usuário é menor de idade
  const handleAgeReject = () => {
    // Redireciona para uma página em branco, impedindo o acesso.
    window.location.href = 'about:blank';
  };

  // --- 4. O RETURN MODIFICADO ---
  // Agora, o BrowserRouter envolve a lógica do modal e as rotas.
  return (
    <BrowserRouter>
      {/* O modal é renderizado aqui, por cima de todo o conteúdo do site */}
      {showAgeModal && (
        <AgeVerificationModal
          onConfirm={handleAgeConfirm}
          onReject={handleAgeReject}
        />
      )}

      {/* 
        As rotas e o conteúdo do seu site são renderizados abaixo.
        O modal, por ter um 'z-index' alto, vai aparecer na frente de tudo
        até que seja fechado.
      */}
      <Routes>
        {/* Rota pública - Catálogo */}
        <Route path="/" element={<Catalog />} />
        
        {/* Rota admin - protegida */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminPanel onLogout={() => window.location.href = '/'} />
            </ProtectedAdminRoute>
          }
        />

        {/* Redireciona qualquer outra rota para home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
