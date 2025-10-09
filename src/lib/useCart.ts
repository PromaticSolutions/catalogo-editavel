import { useState, useEffect } from 'react';
import { Product } from './supabase';

export interface CartItem extends Product {
  quantity: number;
}

// Função para ler o carrinho do localStorage
const getCartFromStorage = (): CartItem[] => {
  try {
    const cartJson = localStorage.getItem('shopping-cart');
    return cartJson ? JSON.parse(cartJson) : [];
  } catch (error) {
    return [];
  }
};

// Função para salvar o carrinho no localStorage
const saveCartToStorage = (cart: CartItem[]) => {
  localStorage.setItem('shopping-cart', JSON.stringify(cart));
};

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>(getCartFromStorage());

  // Efeito para salvar no storage toda vez que o carrinho mudar
  useEffect(() => {
    saveCartToStorage(cart);
  }, [cart]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.id === product.id);
      if (existingItem) {
        // Se já existe, atualiza a quantidade
        return currentCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      // Se não existe, adiciona o novo item
      return [...currentCart, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(currentCart => currentCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(currentCart =>
        currentCart.map(item =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  };
}
