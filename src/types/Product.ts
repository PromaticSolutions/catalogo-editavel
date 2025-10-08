// src/types/Product.ts
import { Category } from './Category';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: number;
  quantity: number;
  categories?: Category; // O '?' indica que é opcional
}
