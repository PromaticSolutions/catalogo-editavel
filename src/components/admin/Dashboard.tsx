import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
// CORREÇÃO: Imports não utilizados foram removidos
// import { Product } from '../../types/Product';
// import { Sale } from '../../types/Sale';
import { toast } from 'react-toastify';

export default function Dashboard() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingSales, setPendingSales] = useState(0);
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      // Busca receita total de vendas concluídas
      const { data: revenueData, error: revenueError } = await supabase
        .from('sales')
        .select('total_amount')
        .eq('status', 'completed');
      
      if (revenueData) {
        const total = revenueData.reduce((acc, sale) => acc + sale.total_amount, 0);
        setTotalRevenue(total);
      } else if (revenueError) {
        toast.error("Erro ao buscar receita.");
      }

      // Busca contagem de vendas pendentes
      const { count: pendingCount, error: pendingError } = await supabase
        .from('sales')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (pendingCount !== null) {
        setPendingSales(pendingCount);
      } else if (pendingError) {
        toast.error("Erro ao buscar vendas pendentes.");
      }

      // Busca contagem de produtos
      const { count: productsCount, error: productsError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (productsCount !== null) {
        setProductCount(productsCount);
      } else if (productsError) {
        toast.error("Erro ao buscar contagem de produtos.");
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm font-medium">Receita Total (Concluído)</h2>
          <p className="text-3xl font-bold text-green-600">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm font-medium">Vendas Pendentes</h2>
          <p className="text-3xl font-bold text-yellow-600">{pendingSales}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm font-medium">Produtos Cadastrados</h2>
          <p className="text-3xl font-bold text-gray-900">{productCount}</p>
        </div>
      </div>
    </div>
  );
}
