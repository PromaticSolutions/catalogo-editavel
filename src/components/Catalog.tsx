// src/components/Catalog.tsx - VERSÃO FINAL COM REALTIME PARA TUDO

import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { supabase, Product, SiteSettings } from '../lib/supabase';
import ProductCard from './ProductCard';
import PixModal from './PixModal';

export default function Catalog() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPixModal, setShowPixModal] = useState(false);

  const applyTheme = (themeSettings: SiteSettings | null) => {
    if (themeSettings) {
      document.documentElement.style.setProperty('--primary-color', themeSettings.primary_color);
      document.documentElement.style.setProperty('--secondary-color', themeSettings.secondary_color);
    }
  };

  const loadProducts = async () => {
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (productsData) {
      setProducts(productsData);
    } else if (productsError) {
      console.error("Erro ao carregar produtos:", productsError);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      const { data: settingsData, error: settingsError } = await supabase
        .from('site_settings')
        .select('*')
        .maybeSingle();
      
      if (settingsData) {
        setSettings(settingsData);
        applyTheme(settingsData);
      } else if (settingsError) {
        console.error("Erro ao carregar configurações:", settingsError);
      }

      await loadProducts(); // Usa a função separada para carregar produtos
      setLoading(false);
    };

    loadInitialData();

    // Assinatura para MUDANÇAS NAS CONFIGURAÇÕES
    const settingsChannel = supabase
      .channel('site_settings_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'site_settings' },
        (payload) => {
          console.log('Mudança recebida nas configurações!', payload.new);
          const newSettings = payload.new as SiteSettings;
          setSettings(newSettings);
          applyTheme(newSettings);
        }
      )
      .subscribe();

    // Assinatura para MUDANÇAS NOS PRODUTOS
    const productsChannel = supabase
      .channel('products_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          console.log('Mudança recebida nos produtos!', payload);
          loadProducts(); // Simplesmente recarrega a lista de produtos
        }
      )
      .subscribe();

    // Limpa AMBAS as assinaturas
    return () => {
      supabase.removeChannel(settingsChannel);
      supabase.removeChannel(productsChannel);
    };
  }, []);

  const handleProductClick = (product: Product) => {
    if (product.stock_quantity > 0) {
      setSelectedProduct(product);
      setShowPixModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            {settings?.logo_url && (
              <img
                src={settings.logo_url}
                alt={settings.company_name ?? 'Logo'}
                className="h-16 w-16 object-contain"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold" style={{ color: settings?.primary_color || '#2563eb' }}>
                {settings?.company_name || 'Catálogo Online'}
              </h1>
              <p className="text-gray-600 mt-1">{settings?.welcome_message}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: settings?.primary_color || '#2563eb' }}></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhum produto disponível</h3>
            <p className="mt-2 text-gray-500">Volte mais tarde para ver nossos produtos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onProductClick={handleProductClick}
                primaryColor={settings?.primary_color || '#2563eb'}
              />
            ))}
          </div>
        )}
      </main>

      {/* --- CHAMADA DO PIXMODAL CORRIGIDA --- */}
      {showPixModal && selectedProduct && settings && (
        <PixModal
          product={selectedProduct}
          settings={settings} 
          onClose={() => {
            setShowPixModal(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}
