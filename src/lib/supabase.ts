import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category_id: string | null;
  referencia: string | null;
}

export interface Sale {
  id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  customer_name: string | null; // <-- CORREÇÃO APLICADA AQUI
  customer_phone: string | null; // <-- CORREÇÃO APLICADA AQUI
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  pix_code: string | null; // <-- BÔNUS: Adicionado | null para consistência
  created_at: string;
}

export interface AdminUser {
  id: string;
  username: string;
  password_hash: string;
  created_at: string;
}
export interface Attribute {
  id: string;
  name: string;
  attribute_options: AttributeOption[]; 
}

export interface AttributeOption {
  id: string;
  value: string;
}
