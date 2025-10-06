import { ShoppingCart, Package } from 'lucide-react';
import { Product } from '../lib/supabase';

interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
  primaryColor: string;
}

export default function ProductCard({ product, onProductClick, primaryColor }: ProductCardProps) {
  const outOfStock = product.stock_quantity <= 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 hover:shadow-xl">
      <div className="relative h-48 bg-gray-200">
        {product.image_url ? (
          <img
            src={product.image_url}
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

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold" style={{ color: primaryColor }}>
            R$ {product.price.toFixed(2)}
          </span>
          <button
            onClick={() => onProductClick(product)}
            disabled={outOfStock}
            className="px-4 py-2 rounded-lg text-white font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: outOfStock ? '#9ca3af' : primaryColor,
              opacity: outOfStock ? 0.5 : 1
            }}
          >
            <ShoppingCart className="h-4 w-4" />
            Comprar
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
