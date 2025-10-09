// CORREÇÃO: Adicionado 'Check' para o feedback e 'useState' para controlar o estado
import { Package, Plus, Check } from 'lucide-react';
import { Product } from '../lib/supabase';
import { toast } from 'react-toastify';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void; 
  primaryColor: string;
}

export default function ProductCard({ product, onAddToCart, primaryColor }: ProductCardProps) {
  const outOfStock = product.stock_quantity <= 0;
  // NOVO ESTADO: para controlar se o item foi recém-adicionado
  const [isAdded, setIsAdded] = useState(false);

  const getTransformedImageUrl = (url: string) => {
    if (!url) return null;
    if (url.includes('?')) return url;
    return `${url}?width=400&height=400&resize=cover`;
  };

  const transformedImageUrl = getTransformedImageUrl(product.image_url);

  // FUNÇÃO ATUALIZADA: agora com a lógica de feedback
  const handleAddToCartClick = () => {
    if (isAdded) return; // Evita múltiplos cliques rápidos

    onAddToCart();
    toast.success(`${product.name} adicionado ao carrinho!`);

    // Ativa o estado "adicionado"
    setIsAdded(true);

    // Após 1.5 segundos, volta ao estado normal
    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col justify-between">
      <div>
        <div className="relative h-48 bg-gray-200">
          {transformedImageUrl ? (
            <img
              src={transformedImageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-16 w-16 text-gray-400" />
            </div>
          )}
          {outOfStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold">
                Esgotado
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2 min-h-[2.5rem]">
            {product.description}
          </p>
        </div>
      </div>

      <div className="p-4 pt-0">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold" style={{ color: primaryColor }}>
            R$ {product.price.toFixed(2)}
          </span>
          
          {/* BOTÃO ATUALIZADO: agora ele muda de aparência */}
          <button
            onClick={handleAddToCartClick}
            disabled={outOfStock || isAdded} // Desabilita se estiver esgotado OU se foi recém-adicionado
            className={`px-4 py-2 rounded-lg text-white font-medium transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${isAdded ? 'bg-green-500' : ''}`}
            style={{ backgroundColor: isAdded ? '#10B981' : (outOfStock ? '#9ca3af' : primaryColor) }}
          >
            {isAdded ? (
              <>
                <Check className="h-4 w-4" />
                Adicionado!
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Adicionar
              </>
            )}
          </button>
        </div>

        {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
          <p className="text-xs text-orange-500 mt-2">
            Apenas {product.stock_quantity} em estoque
          </p>
        )}
      </div>
    </div>
  );
}
