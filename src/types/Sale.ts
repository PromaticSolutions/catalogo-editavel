export interface Sale {
  id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  customer_name: string | null; // <-- CORRIGIDO PARA ACEITAR NULL
  customer_phone: string | null; // <-- CORRIGIDO PARA ACEITAR NULL
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  pix_code: string | null;
  created_at: string;
}
