import { Sale } from '../../types/Sale'; // <-- USA A FONTE DA VERDADE
import { X } from 'lucide-react';

interface SaleDetailsModalProps {
  sale: Sale;
  onClose: () => void;
}

export default function SaleDetailsModal({ sale, onClose }: SaleDetailsModalProps) {
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('pt-BR');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6">
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h2 className="text-xl font-bold text-gray-800">Detalhes da Venda</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">ID da Venda:</span>
              <span className="text-gray-800 font-mono text-sm">{sale.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Data:</span>
              <span className="text-gray-800">{formatDate(sale.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Status:</span>
              <span className="font-semibold text-blue-600">{sale.status}</span>
            </div>
          </div>
          <div className="mt-6 border-t pt-4">
            <h3 className="font-bold text-lg mb-2">Cliente</h3>
            <div className="text-gray-700">
              <p><strong>Nome:</strong> {sale.customer_name || 'Não informado'}</p>
              <p><strong>Telefone:</strong> {sale.customer_phone || 'Não informado'}</p>
            </div>
          </div>
          <div className="mt-6 border-t pt-4">
            <h3 className="font-bold text-lg mb-2">Produto</h3>
            <div className="text-gray-700">
              <p><strong>Nome:</strong> {sale.product_name}</p>
              <p><strong>Quantidade:</strong> {sale.quantity}</p>
              <p><strong>Preço Unitário:</strong> {formatCurrency(sale.unit_price)}</p>
            </div>
          </div>
          <div className="mt-6 border-t pt-4 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xl text-gray-800">Total Pago:</span>
              <span className="font-bold text-xl text-green-600">{formatCurrency(sale.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
