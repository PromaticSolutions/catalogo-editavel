import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase'; 
import { Sale } from '../../types/Sale';
import { Eye } from 'lucide-react';
import SaleDetailsModal from './SaleDetailsModal';
import { toast } from 'react-toastify';

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const loadSales = async () => {
    setLoading(true);
    let query = supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });

    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus);
    }

    const { data, error } = await query;

    if (error) {
      toast.error("Erro ao carregar vendas: " + error.message);
    } else if (data) {
      setSales(data);
    }
    setLoading(false);
  };

  // Efeito que recarrega os dados quando o filtro muda
  useEffect(() => {
    loadSales();
  }, [filterStatus]);

  // A CORREÇÃO FINAL E SIMPLES
  const handleStatusChange = async (saleId: string, newStatus: string) => {
    const { error } = await supabase
      .from('sales')
      .update({ status: newStatus })
      .eq('id', saleId);

    if (error) {
      toast.error("Erro ao atualizar status.");
    } else {
      toast.success("Status atualizado com sucesso!");
      
      // ATUALIZAÇÃO MANUAL DO ESTADO:
      // Encontra a venda na lista atual e atualiza o status dela.
      // Isso força o React a re-renderizar a tela IMEDIATAMENTE.
      setSales(currentSales => 
        currentSales.map(sale => 
          sale.id === saleId ? { ...sale, status: newStatus as Sale['status'] } : sale
        )
      );
    }
  };

  // O resto do seu componente permanece EXATAMENTE o mesmo.
  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setShowModal(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredSales = sales.filter(sale => {
    if (filterStatus === 'all') return true;
    return sale.status === filterStatus;
  });

  if (loading && sales.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Vendas</h2>
        <p className="text-gray-600">Gerencie todas as vendas realizadas</p>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setFilterStatus('all')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Todas</button>
        <button onClick={() => setFilterStatus('pending')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Pendentes</button>
        <button onClick={() => setFilterStatus('paid')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'paid' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Pagas</button>
        <button onClick={() => setFilterStatus('completed')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'completed' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Concluídas</button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && <tr><td colSpan={7} className="text-center py-4">Atualizando...</td></tr>}
              {!loading && filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">Nenhuma venda encontrada</td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sale.product_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div>{sale.customer_name || '-'}</div>
                        {sale.customer_phone && (<div className="text-xs text-gray-400">{sale.customer_phone}</div>)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{formatCurrency(sale.total_amount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select value={sale.status} onChange={(e) => handleStatusChange(sale.id, e.target.value)} className={`px-2 py-1 text-xs font-medium rounded-full border-0 ${getStatusColor(sale.status)}`}>
                        <option value="pending">Pendente</option>
                        <option value="paid">Pago</option>
                        <option value="completed">Concluído</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(sale.created_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => handleViewDetails(sale)} className="text-blue-600 hover:text-blue-900"><Eye className="h-5 w-5" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && selectedSale && (
        <SaleDetailsModal sale={selectedSale} onClose={() => { setShowModal(false); setSelectedSale(null); }} />
      )}
    </div>
  );
}
