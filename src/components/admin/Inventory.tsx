import { useEffect, useState } from 'react';
import { AlertTriangle, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types/Product';
import { toast } from 'react-toastify';

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('stock_quantity', { ascending: true });

    if (error) {
      toast.error("Erro ao carregar o inventário: " + error.message);
    } else if (data) {
      setProducts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleStockUpdate = async (productId: string, newStock: number) => {
    if (newStock < 0) return;

    const { error } = await supabase
      .from('products')
      .update({ stock_quantity: newStock })
      .eq('id', productId);

    if (error) {
      toast.error("Erro ao atualizar estoque: " + error.message);
    } else {
      toast.success("Estoque atualizado!");
      setProducts(currentProducts =>
        currentProducts.map(p =>
          p.id === productId ? { ...p, stock_quantity: newStock } : p
        )
      );
    }
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Esgotado', color: 'text-red-600 bg-red-50' };
    if (stock <= 5) return { label: 'Baixo', color: 'text-orange-600 bg-orange-50' };
    return { label: 'Adequado', color: 'text-green-600 bg-green-50' };
  };

  const lowStockProducts = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5);
  const outOfStockProducts = products.filter(p => p.stock_quantity === 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Inventário</h2>
        <p className="text-gray-600">Gerencie e visualize o estoque dos seus produtos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {outOfStockProducts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-red-900">Produtos Esgotados</h3>
            </div>
            <p className="text-red-700">{outOfStockProducts.length} produto(s) sem estoque.</p>
          </div>
        )}
        {lowStockProducts.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-5 w-5 text-orange-600" />
              <h3 className="font-semibold text-orange-900">Estoque Baixo</h3>
            </div>
            <p className="text-orange-700">{lowStockProducts.length} produto(s) com estoque baixo.</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque Atual</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => {
                const status = getStockStatus(product.stock_quantity);
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img src={product.image_url} alt={product.name} className="h-10 w-10 rounded object-cover" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input
                        type="number"
                        min="0"
                        value={product.stock_quantity}
                        onChange={(e) => handleStockUpdate(product.id, parseInt(e.target.value) || 0)}
                        className="w-24 px-3 py-1 border border-gray-300 rounded-lg text-center"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${status.color}`}>{status.label}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => handleStockUpdate(product.id, product.stock_quantity + 10)} className="px-3 py-1 bg-green-600 text-white text-xs rounded" title="Adicionar 10">
                          +10
                        </button>
                        <button onClick={() => handleStockUpdate(product.id, Math.max(0, product.stock_quantity - 1))} className="px-3 py-1 bg-red-600 text-white text-xs rounded" title="Remover 1">
                          -1
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
