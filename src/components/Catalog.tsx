// --- PARTE 1/4 ---
import { useEffect, useState } from 'react';
import { ShoppingBag, Package as SearchIcon, Menu } from 'lucide-react';
import { supabase, Product, SiteSettings, Attribute } from '../lib/supabase';
import { useCart } from '../lib/useCart';
import ProductCard from './ProductCard';
import CartModal from './CartModal';

// ----- Tipos locais -----
interface Category {
  id: string;
  name: string;
  created_at?: string;
  parent_id?: string | null;
  children?: Category[]; // usado apenas no front para montar árvore
}

export default function Catalog() {
  // ----- Estado principal -----
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, totalItems } = useCart();
  const [showCartModal, setShowCartModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');

  // Categorias & seleção
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTree, setCategoryTree] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filtros (atributos)
  const [availableAttributes, setAvailableAttributes] = useState<Attribute[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);

  // Aplica tema vindo do site_settings
  const applyTheme = (themeSettings: SiteSettings | null) => {
    if (!themeSettings) return;
    document.documentElement.style.setProperty('--primary-color', themeSettings.primary_color);
    document.documentElement.style.setProperty('--secondary-color', themeSettings.secondary_color);
  };

  // Util: monta árvore (1 nível de profundidade de subcategorias)
  function buildCategoryTree(items: Category[]): Category[] {
    const map = new Map<string, Category>();
    items.forEach((c) => map.set(c.id, { ...c, children: [] }));

    const roots: Category[] = [];
    items.forEach((c) => {
      if (c.parent_id && map.has(c.parent_id)) {
        const parent = map.get(c.parent_id)!;
        parent.children = parent.children || [];
        parent.children.push(map.get(c.id)!);
      } else {
        roots.push(map.get(c.id)!);
      }
    });

    return roots;
  }
// --- PARTE 2/4 ---
  // Carrega produtos (usa RPC filter_products quando disponível)
  const loadProducts = async () => {
    setLoading(true);
    try {
      const rpc = supabase.rpc('filter_products', {
        category_id_param: selectedCategory || null,
        search_term_param: searchTerm || null,
        selected_options: Object.values(selectedFilters).filter((id) => id) || [],
      });

      const { data: rpcData, error: rpcError } = await rpc;

      if (rpcData) {
        setProducts(rpcData as Product[]);
      } else {
        if (rpcError) console.warn('RPC filter_products falhou, fallback:', rpcError);
        // fallback: consulta direta
        let q = supabase.from('products').select('*').eq('is_active', true);
        if (searchTerm) q = q.ilike('name', `%${searchTerm}%`);
        if (selectedCategory) q = q.eq('category_id', selectedCategory);
        const { data: fallbackData, error: fallbackError } = await q.order('name', { ascending: true });
        if (fallbackError) {
          console.error('Erro fallback ao buscar produtos:', fallbackError);
          setProducts([]);
        } else {
          setProducts(fallbackData || []);
        }
      }
    } catch (err) {
      console.error('Erro em loadProducts:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Carrega categorias e monta árvore
  const loadCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('id, name, parent_id, created_at').order('name', { ascending: true });
      if (error) {
        console.error('Erro ao carregar categorias:', error);
        setCategories([]);
        setCategoryTree([]);
        return;
      }
      const items = (data || []) as Category[];
      setCategories(items);
      const tree = buildCategoryTree(items);
      setCategoryTree(tree);
    } catch (err) {
      console.error('Erro inesperado ao carregar categorias:', err);
      setCategories([]);
      setCategoryTree([]);
    }
  };

  // Carrega atributos — usa RPC get_attributes_by_category quando category selecionada
  const loadAttributes = async (categoryId: string | null) => {
    if (!categoryId) {
      const { data, error } = await supabase.from('attributes').select('id, name, attribute_options(id, value)');
      if (error) {
        console.error('Erro ao carregar atributos:', error);
        setAvailableAttributes([]);
        return;
      }
      setAvailableAttributes((data as unknown) as Attribute[]);
      return;
    }

    const { data, error } = await supabase.rpc('get_attributes_by_category', { category_id_param: categoryId });
    if (data) {
      setAvailableAttributes((data as unknown) as Attribute[]);
    } else {
      console.warn('RPC get_attributes_by_category falhou, fallback:', error);
      const { data: all, error: allErr } = await supabase.from('attributes').select('id, name, attribute_options(id, value)');
      if (allErr) {
        console.error('Erro fallback ao carregar atributos:', allErr);
        setAvailableAttributes([]);
      } else {
        setAvailableAttributes((all as unknown) as Attribute[]);
      }
    }
  };

  // Efeitos iniciais: carrega settings, categorias, atributos e produtos
  useEffect(() => {
    const loadInitial = async () => {
      const [settingsRes, categoriesRes] = await Promise.all([
        supabase.from('site_settings').select('*').maybeSingle(),
        supabase.from('categories').select('id, name, parent_id, created_at').order('name', { ascending: true }),
      ]);

      if (settingsRes && (settingsRes as any).data) {
        setSettings((settingsRes as any).data);
        applyTheme((settingsRes as any).data);
      } else if ((settingsRes as any).error) {
        console.error('Erro ao buscar site_settings:', (settingsRes as any).error);
      }

      if (categoriesRes && (categoriesRes as any).data) {
        const items = (categoriesRes as any).data as Category[];
        setCategories(items);
        setCategoryTree(buildCategoryTree(items));
      } else if ((categoriesRes as any).error) {
        console.error('Erro ao buscar categories:', (categoriesRes as any).error);
      }

      await loadAttributes(null);
      await loadProducts();
    };

    loadInitial();

    // Subscriptions (realtime) - atualiza produtos/config quando houver mudanças
    const settingsChannel = supabase
      .channel('site_settings_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'site_settings' }, (payload) => {
        const newSettings = payload.new as SiteSettings;
        setSettings(newSettings);
        applyTheme(newSettings);
      })
      .subscribe();

    const productsChannel = supabase
      .channel('products_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => loadProducts())
      .subscribe();

    return () => {
      supabase.removeChannel(settingsChannel);
      supabase.removeChannel(productsChannel);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
// --- PARTE 3/4 ---
  // Sempre que mudar categoria/filtros/busca, recarrega atributos e produtos
  useEffect(() => {
    loadAttributes(selectedCategory);
    const t = setTimeout(() => loadProducts(), 300);
    return () => clearTimeout(t);
  }, [searchTerm, selectedCategory, selectedFilters]);

  // Atualiza seleção de filtro
  const handleFilterChange = (attributeId: string, optionId: string) => {
    setSelectedFilters((prev) => {
      const next = { ...prev };
      if (optionId) next[attributeId] = optionId;
      else delete next[attributeId];
      return next;
    });
  };

  // Renderiza opções hierárquicas — tipado para evitar TS7023/7024
  function renderCategoryOptions(items: Category[], depth = 0): JSX.Element[] {
    return items.flatMap((node) => {
      const indent = '— '.repeat(depth);
      const current = (
        <option key={node.id} value={node.id}>
          {indent + node.name}
        </option>
      );
      const children = node.children && node.children.length ? renderCategoryOptions(node.children, depth + 1) : [];
      return [current, ...children];
    });
  }

  // JSX do componente (começo)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-12">
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {settings?.logo_url && (
                <img src={settings.logo_url} alt={settings.company_name ?? 'Logo'} className="h-12 w-12 object-contain" />
              )}
              <div>
                <h1 className="text-2xl font-bold" style={{ color: settings?.primary_color || '#2563eb' }}>
                  {settings?.company_name || 'Catálogo Online'}
                </h1>
                <p className="text-gray-600 text-sm mt-1">{settings?.welcome_message}</p>
              </div>
            </div>

            <button onClick={() => setShowCartModal(true)} className="relative p-2 rounded-full hover:bg-gray-100">
              <ShoppingBag className="h-7 w-7 text-gray-600" />
              {totalItems > 0 && (
                <span
                  className="absolute top-0 right-0 h-5 w-5 rounded-full text-xs font-medium text-white flex items-center justify-center"
                  style={{ backgroundColor: settings?.primary_color || '#2563eb' }}
                >
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
// --- PARTE 4/4 ---
          <select
            value={selectedCategory || ''}
            onChange={(e) => {
              const newCategory = e.target.value || null;
              setSelectedCategory(newCategory);
              setSelectedFilters({});
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="">Todas as categorias</option>
            {renderCategoryOptions(categoryTree)}
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white flex items-center gap-2"
          >
            <Menu size={18} />
            <span>Filtros</span>
          </button>
        </div>

        {showFilters && availableAttributes.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow-sm mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {availableAttributes.map((attr) => (
                <div key={attr.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{attr.name}</label>
                  <select
                    value={selectedFilters[attr.id] || ''}
                    onChange={(e) => handleFilterChange(attr.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  >
                    <option value="">Todos</option>
                    {attr.attribute_options.map((opt: { id: string; value: string }) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.value}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: settings?.primary_color || '#2563eb' }} />
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
              <ProductCard key={product.id} product={product} onAddToCart={() => addToCart(product)} primaryColor={settings?.primary_color || '#2563eb'} />
            ))}
          </div>
        )}
      </main>

      {showCartModal && settings && <CartModal settings={settings} onClose={() => setShowCartModal(false)} />}
    </div>
  );
}