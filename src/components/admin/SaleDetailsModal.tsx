import { X, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Sale } from '../../lib/supabase';

interface SaleDetailsModalProps {
  sale: Sale;
  onClose: () => void;
}

export default function SaleDetailsModal({ sale, onClose }: SaleDetailsModalProps) {
  const [copied, setCopied] = useState(false);

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

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pendente',
      paid: 'Pago',
      completed: 'Concluído',
      cancelled: 'Cancelado',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const copyPixCode = () => {
    navigator.clipboard.writeText(sale.pix_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Detalhes da Venda</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Produto</p>
              <p className="font-semibold text-gray-900">{sale.product_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-semibold text-gray-900">{getStatusLabel(sale.status)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Quantidade</p>
              <p className="font-semibold text-gray-900">{sale.quantity}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Preço Unitário</p>
              <p className="font-semibold text-gray-900">
                {formatCurrency(parseFloat(sale.unit_price.toString()))}
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(parseFloat(sale.total_amount.toString()))}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div>
              <p className="text-sm text-gray-600">Cliente</p>
              <p className="font-semibold text-gray-900">{sale.customer_name || 'Não informado'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Telefone</p>
              <p className="font-semibold text-gray-900">{sale.customer_phone || 'Não informado'}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-600">Data do Pedido</p>
            <p className="font-semibold text-gray-900">{formatDate(sale.created_at)}</p>
          </div>

          {sale.pix_code && (
            <div className="border-t pt-4">
              <label className="block text-sm text-gray-600 mb-2">Código PIX</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sale.pix_code}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                />
                <button
                  onClick={copyPixCode}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full mt-4 bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
