import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types/Product';
import { Category } from '../../types/Category';
import ProductModal from './ProductModal';
import { toast } from 'react-toastify';

function buildCategoryTree(categories: Category[]): CategoryWithChildren[] {
  const map: Record<string, CategoryWithChildren> = {};
  const tree: CategoryWithChildren[] = [];

  // Inicializa o map com children vazio
  categories.forEach(cat => {
    map[cat.id] = { ...cat, children: [] };
  });

  // Constrói a árvore
  categories.forEach(cat => {
    if (cat.parent_id && map[cat.parent_id]) {
      map[cat.parent_id].children.push(map[cat.id]);
    } else if (!cat.parent_id) {
      tree.push(map[cat.id]);
    }
  });

  return tree;
}

type CategoryWithChildren = Category & { children: CategoryWithChildren[] };

function renderCategoryOptions(categories: CategoryWithChildren[], prefix = ''): JSX.Element[] {
  return categories.flatMap(cat => [
    <option key={cat.id} value={cat.id}>{prefix + cat.name}</option>,
    ...renderCategoryOptions(cat.children, prefix + '→ ')
  ]);
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 10;

  const fetchProducts = async () => {
    let query = supabase
      .from('products')
      .select('*, categories(name, parent_id)', { count: 'exact' })
      .order('name', { ascending: true });

    if (searchTerm) query = query.ilike('name', `%${searchTerm}%`);
    if (selectedCategory) query = query.eq('category_id', selectedCategory);

    const from = (page - 1) * productsPerPage;
    const to = from + productsPerPage - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) toast.error('Erro ao buscar produtos: ' + error.message);
    else if (data) {
      setProducts(data as Product[]);
      setTotalProducts(count || 0);
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error) toast.error('Erro ao buscar categorias: ' + error.message);
    else if (data) {
      setCategories(data as Category[]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [page, searchTerm, selectedCategory]);

  const handleOpenModal = (product: Product | null = null) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    fetchProducts();
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) toast.error('Erro ao excluir produto: ' + error.message);
    else {
      toast.success('Produto excluído com sucesso!');
      fetchProducts();
    }
  };

  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const categoryTree = buildCategoryTree(categories);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gerenciar Produtos</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Adicionar Produto
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="relative flex-grow">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
          className="border rounded-lg px-4 py-2"
        >
          <option value="">Todas as Categorias</option>
          {renderCategoryOptions(categoryTree)}
        </select>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagem</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img src={product.image_url} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{product.categories?.name || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">R$ {product.price.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{product.stock_quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                  <button
                    onClick={() => handleOpenModal(product)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between mt-4">
        <button
          onClick={() => setPage(p => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
        >
          Anterior
        </button>
        <span>Página {page} de {totalPages}</span>
        <button
          onClick={() => setPage(p => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
        >
          Próxima
        </button>
      </div>

      {isModalOpen && <ProductModal product={selectedProduct} categories={categories} onClose={handleCloseModal} />}
    </div>
  );
}