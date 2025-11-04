// Dentro do arquivo: src/types/Product.ts - VERSÃO CORRIGIDA E COMPLETA

import { Category } from './Category';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock_quantity: number;
  is_active: boolean; // Propriedade que estava faltando
  created_at: string; // Propriedade que estava faltando
  updated_at: string; // Propriedade que estava faltando
  category_id: string | null; // Deve permitir nulo
  referencia: string | null; // A NOVA PROPRIEDADE
  categories?: Category; // Opcional, para o join com a tabela de categorias
}
