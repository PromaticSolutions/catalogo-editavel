import { Category } from './Category';

export interface Product {
  id: string; // <-- MUDADO PARA STRING (UUID)
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string; // <-- MUDADO PARA STRING (UUID)
  stock_quantity: number;
  categories?: Category;
}
