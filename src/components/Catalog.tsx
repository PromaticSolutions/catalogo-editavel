import { useEffect, useState } from 'react';
import { ShoppingBag, Package as SearchIcon } from 'lucide-react';
import { supabase, Product, SiteSettings } from '../lib/supabase';
import { Sale } from '../types/Sale'; // Importa o tipo Sale
import ProductCard from './ProductCard';
import PixModal from './PixModal';
import { toast } from 'react-toastify'; // Importa o toast para feedback

interface Category {
  id: string;
  name: string;
}

export default function Catalog() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ESTADO MODIFICADO: Agora vamos guardar a venda, não o produto
  const [activeSale, setActiveSale] = useState<Sale | null>(null);
  const [showPixModal, setShowPixModal] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const applyTheme = (themeSettings: SiteSettings | null) => {
    if (themeSettings) {
      document.documentElement.style.setProperty('--primary-color', themeSettings.primary_color);
      document.documentElement.style.setProperty('--secondary-color', themeSettings.secondary_color);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    let query = supabase.from('products').select('*').eq('is_active', true);
    if (searchTerm) { query = query.ilike('name', `%${searchTerm}%`); }
    if (selectedCategory) { query = query.eq('category_id', selectedCategory); }
    const { data: productsData, error } = await query.order('name', { ascending: true });
    if (productsData) { setProducts(productsData); } 
    else if (error) { console.error("Erro ao carregar produtos:", error); }
    setLoading(false);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      const [settingsRes, categoriesRes] = await Promise.all([
        supabase.from('site_settings').select('*').maybeSingle(),
        supabase.from('categories').select('id, name').order('name')
      ]);
      if (settingsRes.data) { setSettings(settingsRes.data); applyTheme(settingsRes.data); } 
      else if (settingsRes.error) { console.error("Erro ao carregar configurações:", settingsRes.error); }
      if (categoriesRes.data) { setCategories(categoriesRes.data); } 
      else if (categoriesRes.error) { console.error("Erro ao carregar categorias:", categoriesRes.error); }
    };
    loadInitialData();

    const settingsChannel = supabase.channel('site_settings_changes').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'site_settings' }, (payload) => {
      const newSettings = payload.new as SiteSettings;
      setSettings(newSettings);
      applyTheme(newSettings);
    }).subscribe();
    const productsChannel = supabase.channel('products_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
      loadProducts();
    }).subscribe();
    return () => {
      supabase.removeChannel(settingsChannel);
      supabase.removeChannel(productsChannel);
    };
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => { loadProducts(); }, 300);
    return () => { clearTimeout(handler); };
  }, [searchTerm, selectedCategory]);

  // <<<<<<<<<<<<<<<<<<<<<<< A MÁGICA ACONTECE AQUI >>>>>>>>>>>>>>>>>>>>>>>>>
  const handleProductClick = async (product: Product) => {
    if (product.stock_quantity <= 0) {
      toast.error("Produto esgotado!");
      return;
    }

    // 1. Criar o objeto da nova venda
    const newSaleData = {
      product_id: product.id,
      product_name: product.name,
      quantity: 1, // Assumindo a compra de 1 unidade por clique
      unit_price: product.price,
      total_amount: product.price, // Total para 1 unidade
      status: 'pending' as const, // Define o status inicial
    };

    // 2. Inserir a venda no banco de dados
    const { data: insertedSale, error } = await supabase
      .from('sales')
      .insert(newSaleData)
      .select()
      .single(); // .select().single() retorna o objeto recém-criado

    if (error) {
      toast.error("Não foi possível iniciar a compra. Tente novamente.");
      console.error("Erro ao criar venda:", error);
      return;
    }

    if (insertedSale) {
      // 3. Se a venda foi criada com sucesso, abre o modal do Pix
      setActiveSale(insertedSale);
      setShowPixModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-12">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            {settings?.logo_url && <img src={settings.logo_url} alt={settings.company_name ?? 'Logo'} className="h-16 w-16 object-contain" />}
            <div>
              <h1 className="text-3xl font-bold" style={{ color: settings?.primary_color || '#2563eb' }}>{settings?.company_name || 'Catálogo Online'}</h1>
              <p className="text-gray-600 mt-1">{settings?.welcome_message}</p>
            </div>
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
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="">Todas as categorias</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

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
              <ProductCard key={product.id} product={product} onProductClick={handleProductClick} primaryColor={settings?.primary_color || '#2563eb'} />
            ))}
          </div>
        )}
      </main>

      {/* MODAL MODIFICADO: Agora usa a 'activeSale' */}
      {showPixModal && activeSale && settings && (
        <PixModal sale={activeSale} settings={settings} onClose={() => { setShowPixModal(false); setActiveSale(null); }} />
      )}
    </div>
  );
}
