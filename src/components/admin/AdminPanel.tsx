// src/components/admin/AdminPanel.tsx - VERSÃO COM ÍCONE GARANTIDO

import { useState } from 'react';
// --- Usando um ícone que já existe para evitar erros ---
import { LayoutDashboard, Package, ShoppingCart, Warehouse, Palette, LogOut, Menu, X, Package as CategoryIcon } from 'lucide-react';
import { adminLogout } from '../../lib/auth';
import Dashboard from './Dashboard';
import Products from './Products';
import Sales from './Sales';
import Inventory from './Inventory';
import Styling from './Styling';
import Categories from './Categories';
import Attributes from './Attributes';

interface AdminPanelProps {
  onLogout: () => void;
}

export default function AdminPanel({ onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    adminLogout();
    onLogout();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sales', label: 'Vendas', icon: ShoppingCart },
    { id: 'inventory', label: 'Estoque', icon: Warehouse },
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'categories', label: 'Categorias', icon: CategoryIcon },
    { id: 'attributes', label: 'Filtros', icon: Package }, // <-- SOLUÇÃO: Usando o ícone 'Package' que já existe
    { id: 'styling', label: 'Estilização', icon: Palette },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <Products />;
      case 'sales':
        return <Sales />;
      case 'inventory':
        return <Inventory />;
      case 'categories':
        return <Categories />;
      case 'attributes':
        return <Attributes />;
      case 'styling':
        return <Styling />;
      default:
        return <Dashboard />;
    }
  };

  // O resto do JSX continua o mesmo...
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-gray-900 text-white transition-all duration-300 overflow-hidden fixed lg:relative h-screen z-30`}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-gray-400 text-sm mt-1">Gerenciamento</p>
        </div>

        <nav className="px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-3 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white shadow-sm sticky top-0 z-20">
          <div className="px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 hover:text-gray-900 lg:hidden"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 hover:text-gray-900 hidden lg:block"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Bem-vindo, Admin</span>
              <a href="/" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Ver Catálogo
              </a>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
