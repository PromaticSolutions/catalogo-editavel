import { useState, useEffect } from 'react';
import { Store } from 'lucide-react';
import Catalog from './components/Catalog';
import Login from './components/admin/Login';
import AdminPanel from './components/admin/AdminPanel';
import { isAdminLoggedIn } from './lib/auth';

function App() {
  const [view, setView] = useState<'catalog' | 'login' | 'admin'>('catalog');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(isAdminLoggedIn());
  }, []);

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    setView('admin');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setView('catalog');
  };

  const goToAdminLogin = () => {
    setView('login');
  };

  const goToCatalog = () => {
    setView('catalog');
  };

  if (view === 'login') {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (view === 'admin' && isAdmin) {
    return <AdminPanel onLogout={handleLogout} />;
  }

  return (
    <div className="relative">
      <Catalog />

      <button
        onClick={isAdmin ? () => setView('admin') : goToAdminLogin}
        className="fixed bottom-6 right-6 bg-gray-900 text-white p-4 rounded-full shadow-lg hover:bg-gray-800 transition-all hover:scale-110 z-50"
        title={isAdmin ? 'Ir para painel admin' : 'Login admin'}
      >
        <Store className="h-6 w-6" />
      </button>
    </div>
  );
}

export default App;
