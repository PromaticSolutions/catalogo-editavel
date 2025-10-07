import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
// Mantemos os imports, mas vamos lidar com a tipagem de forma diferente
import { localDB as supabase, Product, SiteSettings } from '../lib/localStorage';
import ProductCard from './ProductCard';
import PixModal from './PixModal';

export default function Catalog() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPixModal, setShowPixModal] = useState(false);

  useEffect(() => {
    loadSettings();
    loadProducts();
  }, []);

  const loadSettings = async () => {
    // Forçando a tipagem para 'any' para evitar erros de tipagem incorreta
    const supabaseClient: any = supabase;
    const { data } = await supabaseClient
      .from('site_settings')
      .select()
      .maybeSingle();

    if (data) {
      setSettings(data);
      applyTheme(data);
    }
  };

  const applyTheme = (settings: SiteSettings) => {
    document.documentElement.style.setProperty('--primary-color', settings.primary_color);
    document.documentElement.style.setProperty('--secondary-color', settings.secondary_color);
  };

  const loadProducts = async () => {
    setLoading(true);

    try {
      // --- SOLUÇÃO DEFINITIVA ---
      // Usamos 'any' para dizer ao TypeScript: "Confie em mim, eu sei o que estou fazendo".
      // Isso ignora as definições de tipo incorretas do seu arquivo localStorage.ts.
      const supabaseClient: any = supabase;

      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true }); // Lembre-se de trocar 'name' se sua coluna for outra

      if (error) {
        throw new Error(error.message); // Lança o erro para ser pego pelo catch
      }

      if (data) {
        setProducts(data);
      }

    } catch (err) {
      console.error("Falha ao carregar produtos:", err);
      setProducts([]); // Garante que products seja um array vazio em caso de falha
    } finally {
      setLoading(false); // 'finally' garante que o loading sempre termine, com ou sem erro.
    }
  };

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
