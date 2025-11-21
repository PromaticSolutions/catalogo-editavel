// src/App.tsx - VERSÃO FINAL

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Catalog from './components/Catalog';
import Login from './components/admin/Login';
import AdminPanel from './components/admin/AdminPanel';
import AgeVerificationModal from './components/AgeVerificationModal';
import { supabase } from './lib/supabase'; // Importe o supabase

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isChecking) {
    return <div>Carregando...</div>;
  }

  if (!session) {
    return <Login onLoginSuccess={() => {}} />;
  }

  return <>{children}</>;
}

function App() {
  const [showAgeModal, setShowAgeModal] = useState(false);

  useEffect(() => {
    const isVerified = sessionStorage.getItem('isAgeVerified');
    if (isVerified !== 'true') {
      setShowAgeModal(true);
    }
  }, []);

  const handleAgeConfirm = () => {
    sessionStorage.setItem('isAgeVerified', 'true');
    setShowAgeModal(false);
  };

  const handleAgeReject = () => {
    window.location.href = 'about:blank';
  };

  return (
    <BrowserRouter>
      {showAgeModal && (
        <AgeVerificationModal
          onConfirm={handleAgeConfirm}
          onReject={handleAgeReject}
        />
      )}
      <Routes>
        <Route path="/" element={<Catalog />} />
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminPanel onLogout={() => supabase.auth.signOut()} />
            </ProtectedAdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
