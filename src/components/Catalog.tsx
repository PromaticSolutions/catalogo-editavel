// src/components/Catalog.tsx - VERSÃO FINAL CORRIGIDA POR MANUS

import { useEffect, useState } from 'react';
// --- CORREÇÃO 1: Trocando o ícone do filtro por um que existe ---
import { ShoppingBag, Package as SearchIcon, Menu } from 'lucide-react';
import { supabase, Product, SiteSettings, Attribute, AttributeOption } from '../lib/supabase';
import { useCart } from '../lib/useCart';
import ProductCard from './ProductCard';
import CartModal from './CartModal';

interface Category {
  id: string;
  name: string;
}

export default function Catalog() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  // --- CORREÇÃO 2: Re-adicionando as variáveis do carrinho ---
  const { addToCart, totalItems } = useCart();
  const [showCartModal, setShowCartModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);

  const applyTheme = (themeSettings: SiteSettings | null) => {
    if (themeSettings) {
      document.documentElement.style.setProperty('--primary-color', themeSettings.primary_color);
      document.documentElement.style.setProperty('--secondary-color', themeSettings.secondary_color);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    let query = supabase.rpc('filter_products', {
      category_id_param: selectedCategory,
      search_term_param: searchTerm || null,
      selected_options: Object.values(selectedFilters).filter(id => id)
    });

    const { data: productsData, error } = await query;

    if (productsData) {
      setProducts(productsData as Product[]);
    } else if (error) {
      console.error("Erro ao carregar produtos com RPC, usando fallback:", error);
      let fallbackQuery = supabase.from('products').select('*').eq('is_active', true);
      if (searchTerm) { fallbackQuery = fallbackQuery.ilike('name', `%${searchTerm}%`); }
      if (selectedCategory) { fallbackQuery = fallbackQuery.eq('category_id', selectedCategory); }
      const { data: fallbackData } = await fallbackQuery;
      setProducts(fallbackData || []);
    }
    setLoading(false);
  };

  const loadAttributes = async () => {
    const { data, error } = await supabase
      .from('attributes')
      .select('id, name, attribute_options(id, value)');
    if (data) {
      setAttributes(data as Attribute[]);
    } else if (error) {
      console.error("Erro ao carregar atributos:", error);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      const [settingsRes, categoriesRes] = await Promise.all([
        supabase.from('site_settings').select('*').maybeSingle(),
        supabase.from('categories').select('id, name').order('name')
      ]);
      if (settingsRes.data) { setSettings(settingsRes.data); applyTheme(settingsRes.data); }
      if (categoriesRes.data) { setCategories(categoriesRes.data); }
      loadAttributes();
    };
    loadInitialData();
    // ... (canais do supabase)
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => { loadProducts(); }, 300);
    return () => { clearTimeout(handler); };
  }, [searchTerm, selectedCategory, selectedFilters]);

  const handleFilterChange = (attributeId: string, optionId: string) => {
    setSelectedFilters(prev => {
      const newFilters = { ...prev };
      if (optionId) {
        newFilters[attributeId] = optionId;
      } else {
        delete newFilters[attributeId];
      }
      return newFilters;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-12">
      {/* --- CORREÇÃO 3: Restaurando o cabeçalho --- */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {settings?.logo_url && <img src={settings.logo_url} alt={settings.company_name ?? 'Logo'} className="h-12 w-12 object-contain" />}
              <div>
                <h1 className="text-2xl font-bold" style={{ color: settings?.primary_color || '#2563eb' }}>{settings?.company_name || 'Catálogo Online'}</h1>
                <p className="text-gray-600 text-sm mt-1">{settings?.welcome_message}</p>
              </div>
            </div>
            <button onClick={() => setShowCartModal(true)} className="relative p-2 rounded-full hover:bg-gray-100">
              <ShoppingBag className="h-7 w-7 text-gray-600" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 h-5 w-5 rounded-full text-xs font-medium text-white flex items-center justify-center" style={{ backgroundColor: settings?.primary_color || '#2563eb' }}>
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar por nome do produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <select
            value={selectedCategory || ''}
            onChange={(e) => {
              setSelectedCategory(e.target.value || null);
              setSelectedFilters({});
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="">Todas as categorias</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white flex items-center gap-2"
          >
            <Menu size={18} /> {/* Ícone corrigido */}
            <span>Filtros</span>
          </button>
        </div>

        {showFilters && attributes.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow-sm mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {attributes.map(attr => (
                <div key={attr.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{attr.name}</label>
                  <select
                    value={selectedFilters[attr.id] || ''}
                    onChange={(e) => handleFilterChange(attr.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  >
                    <option value="">Todos</option>
                    {attr.attribute_options.map((opt: AttributeOption) => (
                      <option key={opt.id} value={opt.id}>{opt.value}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- CORREÇÃO 4: Restaurando a seção principal que exibe os produtos --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: settings?.primary_color || '#2563eb' }}></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-md">
            <ShoppingBag className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhum produto encontrado</h3>
            <p className="mt-2 text-gray-500">Tente ajustar sua busca ou limpar os filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={() => addToCart(product)} 
                primaryColor={settings?.primary_color || '#2563eb'}
              />
            ))}
          </div>
        )}
      </main>

      {showCartModal && settings && (
        <CartModal settings={settings} onClose={() => setShowCartModal(false)} />
      )}
    </div>
  );
}
