import { Category } from './Category';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: number;
  stock_quantity: number; // CORRIGIDO
  categories?: Category;
}
