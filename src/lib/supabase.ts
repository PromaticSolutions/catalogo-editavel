import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// -------------------- Tipos --------------------

export interface SiteSettings {
  id: string;
  company_name: string;
  logo_url: string;
  welcome_message: string;
  pix_key: string;
  primary_color: string;
  secondary_color: string;
  updated_at: string;
  ativar_pix: boolean;
}

export interface Category {
  id: string; // UUID
  name: string;
  parent_id: string | null; // Para subcategorias
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string; // UUID
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category_id: string | null; // UUID da categoria
  referencia: string | null;
}

export interface Sale {
  id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  customer_name: string | null;
  customer_phone: string | null;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  pix_code: string | null;
  created_at: string;
}

export interface AdminUser {
  id: string;
  username: string;
  password_hash: string;
  created_at: string;
}

export interface AttributeOption {
  id: string;
  value: string;
}

export interface Attribute {
  id: string;
  name: string;
  attribute_options: AttributeOption[];
}
