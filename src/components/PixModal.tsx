import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import QRCode from 'qrcode';
import { localDB as supabase, Product } from '../lib/localStorage';
import { pixGenerator } from '../lib/pixGenerator';

interface PixModalProps {
  product: Product;
  pixKey: string;
  onClose: () => void;
}

export default function PixModal({ product, pixKey, onClose }: PixModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [pixCode, setPixCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);

  const totalAmount = product.price * quantity;

  const generatePixQRCode = async (pixPayload: string) => {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(pixPayload, {
        width: 300,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qrCodeDataUrl);
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
    }
  };

  const handleCreateOrder = async () => {
    if (!pixKey) {
      alert('Chave PIX não configurada. Entre em contato com o vendedor.');
      return;
    }

    setLoading(true);

    // Gerar código PIX real seguindo o padrão do Banco Central
    const txid = Date.now().toString().substring(0, 25);
    
    const pixPayload = pixGenerator.generate({
      pixKey: pixKey,
      description: product.name,
      merchantName: 'Hanun Tabacaria',
      merchantCity: 'São Roque - SP',
      amount: totalAmount,
      txid: txid
    });

    // Gerar QR Code
    await generatePixQRCode(pixPayload);

    // Salvar venda no banco
    const { error } = await supabase.from('sales').insert({
      product_id: product.id,
      product_name: product.name,
      quantity,
      unit_price: product.price,
      total_amount: totalAmount,
      customer_name: customerName,
      customer_phone: customerPhone,
      status: 'pending',
      pix_code: pixPayload,
    });

    if (!error) {
      setPixCode(pixPayload);
      setOrderCreated(true);
    } else {
      alert('Erro ao criar pedido. Tente novamente.');
    }
    setLoading(false);
  };

  const copyPixCode = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">Finalizar Compra</h2>

        {!orderCreated ? (
          <>
            <div className="mb-4">
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <p className="text-gray-600 text-sm">{product.description}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade
                </label>
                <input
                  type="number"
                  min="1"
                  max={product.stock_quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock_quantity, parseInt(e.target.value) || 1)))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seu nome (opcional)
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite seu nome"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone (opcional)
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    R$ {totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCreateOrder}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Gerando PIX...' : 'Gerar QR Code PIX'}
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">✓ Pedido criado com sucesso!</p>
            </div>

            {qrCodeUrl && (
              <div className="flex flex-col items-center">
                <p className="text-sm text-gray-600 mb-2">Escaneie o QR Code para pagar:</p>
                <img src={qrCodeUrl} alt="QR Code PIX" className="border-2 border-gray-300 rounded-lg" />
                <p className="text-xs text-gray-500 mt-2">Use o app do seu banco</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ou copie o código PIX:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pixCode}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-xs font-mono"
                />
                <button
                  onClick={copyPixCode}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Valor:</strong> R$ {totalAmount.toFixed(2)}
              </p>
              <p className="text-sm text-blue-800 mt-1">
                <strong>Produto:</strong> {product.name}
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800">
                ⚠️ Após o pagamento, seu pedido será processado automaticamente.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}