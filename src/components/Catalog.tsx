// src/components/Catalog.tsx - VERSÃO FINAL COM REALTIME

import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { supabase, Product, SiteSettings } from '../lib/supabase'; // Verifique o caminho
import ProductCard from './ProductCard';
import PixModal from './PixModal';

export default function Catalog() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPixModal, setShowPixModal] = useState(false);

  // Função para aplicar o tema, separada para ser reutilizada
  const applyTheme = (themeSettings: SiteSettings | null) => {
    if (themeSettings) {
      document.documentElement.style.setProperty('--primary-color', themeSettings.primary_color);
      document.documentElement.style.setProperty('--secondary-color', themeSettings.secondary_color);
    }
  };

  useEffect(() => {
    // 1. Carrega os dados iniciais
    const loadInitialData = async () => {
      setLoading(true);
      
      // Carrega as configurações
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

      // Carrega os produtos
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

      setLoading(false);
    };

    loadInitialData();

    // 2. "Assina" as mudanças em tempo real na tabela site_settings
    const channel = supabase
      .channel('site_settings_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'site_settings' },
        (payload) => {
          console.log('Mudança recebida nas configurações!', payload.new);
          const newSettings = payload.new as SiteSettings;
          setSettings(newSettings); // Atualiza o estado com as novas configurações
          applyTheme(newSettings); // Aplica o novo tema imediatamente
        }
      )
      .subscribe();

    // 3. Limpa a assinatura quando o componente é desmontado (boa prática)
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleProductClick = (product: Product) => {
    if (product.stock_quantity > 0) {
      setSelectedProduct(product);
      setShowPixModal(true);
    }
  };

  // O resto do seu JSX (return) continua o mesmo...
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

      {showPixModal && selectedProduct && settings && (
        <PixModal
          product={selectedProduct}
          pixKey={settings.pix_key}
          onClose={() => {
            setShowPixModal(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}
