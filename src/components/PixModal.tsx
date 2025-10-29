import { useState } from 'react';
import { X } from 'lucide-react';
import QRCode from 'qrcode';
import { supabase, Product, SiteSettings } from '../lib/supabase';
import { toast } from 'react-toastify'; // Importando o toast

interface PixModalProps {
  product: Product;
  settings: SiteSettings;
  onClose: () => void;
}

export default function PixModal({ product, settings, onClose }: PixModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);

  const totalAmount = product.price * quantity;

  // Esta função gera um QR Code SIMPLES, apenas com a chave.
  // O usuário precisará digitar o valor.
  const generateSimpleQRCode = async (pixKey: string) => {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(pixKey, { width: 280, margin: 2 });
      setQrCodeUrl(qrCodeDataUrl);
    } catch (error) {
      console.error('Erro ao gerar QR Code simples:', error);
      toast.error('Não foi possível gerar o QR Code.');
    }
  };

  const handleCreateOrder = async () => {
    if (!settings.pix_key) {
      toast.error('A chave PIX não está configurada pelo administrador.');
      return;
    }
    setLoading(true);

    // 1. Tenta inserir a venda no banco de dados PRIMEIRO.
    const { data: newSale, error } = await supabase
      .from('sales')
      .insert({
        product_id: product.id,
        product_name: product.name,
        quantity: quantity,
        unit_price: product.price,
        total_amount: totalAmount,
        customer_name: customerName || null, // Garante que campos opcionais vazios sejam nulos
        customer_phone: customerPhone || null,
        status: 'pending',
      })
      .select()
      .single(); // Retorna a venda recém-criada

    if (error) {
      console.error("Erro ao criar venda no Supabase:", error);
      toast.error('Erro ao criar seu pedido. Tente novamente.');
      setLoading(false);
      return; // Para a execução se a venda falhar
    }

    // 2. Se a venda foi criada com sucesso, gera o QR Code.
    if (newSale) {
      await generateSimpleQRCode(settings.pix_key);
      setOrderCreated(true);
      toast.success("Pedido criado! Agora realize o pagamento.");
    }
    
    setLoading(false);
  };

  // Link do WhatsApp com mensagem pré-preenchida
  // Comentário para forçar atualização do build
  //forçar atualização_v2


  
  const whatsappMessage = encodeURIComponent(`Olá! Tenho interesse no pedido: ${product.name} (Qtd: ${quantity}, Total: R$ ${totalAmount.toFixed(2)}). Segue o comprovante de pagamento.`);
  const whatsappLink = `https://wa.me/5511995442526?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Finalizar Compra</h2>

        {!orderCreated ? (
          // ETAPA 1: Formulário de Checkout
          <div className="space-y-4">
            <div className="mb-4">
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <p className="text-gray-600 text-sm">{product.description}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
              <input type="number" min="1" max={product.stock_quantity} value={quantity} onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock_quantity, parseInt(e.target.value) || 1)))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seu nome (opcional)</label>
              <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Digite seu nome" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone (opcional)</label>
              <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="(00) 00000-0000" />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total:</span>
                <span className="text-2xl font-bold text-blue-600">R$ {totalAmount.toFixed(2)}</span>
              </div>
            </div>
            <button onClick={handleCreateOrder} disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
              {loading ? 'Criando pedido...' : 'Gerar QR Code PIX'}
            </button>
          </div>
        ) : (
          // ETAPA 2: Tela de Pagamento
          <div className="space-y-4 text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-800 font-medium">✓ Pedido criado! Pague o valor abaixo.</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Valor a pagar:</strong>
                <span className="text-xl font-bold ml-2">R$ {totalAmount.toFixed(2)}</span>
              </p>
            </div>

            {qrCodeUrl && (
              <div className="flex flex-col items-center">
                <p className="text-sm text-gray-600 mb-2">1. Escaneie o QR Code com seu app do banco:</p>
                <img src={qrCodeUrl} alt="QR Code PIX" className="border-2 border-gray-300 rounded-lg" />
                <p className="text-xs text-gray-500 mt-2">Você precisará digitar o valor do pedido.</p>
              </div>
            )}
            
            <div className="pt-4">
              <p className="text-sm text-gray-600 mb-2">2. Após pagar, envie o comprovante:</p>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                <span className="mr-2">📲</span>
                Enviar Comprovante via WhatsApp
              </a>
            </div>
            <button onClick={onClose} className="w-full text-sm text-gray-500 hover:text-gray-700 pt-4">
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
