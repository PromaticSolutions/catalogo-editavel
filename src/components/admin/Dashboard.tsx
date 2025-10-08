import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types/Product'; 
import { Sale } from '../../types/Sale';
import { toast } from 'react-toastify';

// ... (resto do código é o mesmo)
export default function Dashboard() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingSales, setPendingSales] = useState(0);
  const [completedSales, setCompletedSales] = useState(0);
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Sales Data
      const { data: salesData, error: salesError } = await supabase.from('sales').select('total_amount, status');
      if (salesError) {
        toast.error("Erro ao buscar dados de vendas.");
      } else if (salesData) {
        const revenue = salesData.reduce((acc, sale) => sale.status === 'completed' ? acc + sale.total_amount : acc, 0);
        const pending = salesData.filter(sale => sale.status === 'pending').length;
        const completed = salesData.filter(sale => sale.status === 'completed').length;
        setTotalRevenue(revenue);
        setPendingSales(pending);
        setCompletedSales(completed);
      }

      // Fetch Products Count
      const { count, error: productsError } = await supabase.from('products').select('*', { count: 'exact', head: true });
      if (productsError) {
        toast.error("Erro ao buscar contagem de produtos.");
      } else {
        setProductCount(count || 0);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm font-medium">Receita Total</h2>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm font-medium">Vendas Concluídas</h2>
          <p className="text-3xl font-bold text-gray-900">{completedSales}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm font-medium">Vendas Pendentes</h2>
          <p className="text-3xl font-bold text-gray-900">{pendingSales}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm font-medium">Produtos Cadastrados</h2>
          <p className="text-3xl font-bold text-gray-900">{productCount}</p>
        </div>
      </div>
    </div>
  );
}
