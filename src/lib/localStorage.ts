// src/lib/localStorage.ts
// Sistema de banco de dados local usando localStorage para testes

export interface SiteSettings {
  id: string;
  company_name: string;
  logo_url: string;
  welcome_message: string;
  pix_key: string;
  primary_color: string;
  secondary_color: string;
  updated_at: string;
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
}

export interface Sale {
  id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  customer_name: string;
  customer_phone: string;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  pix_code: string;
  created_at: string;
}

export interface AdminUser {
  id: string;
  username: string;
  password_hash: string;
  created_at: string;
}

class LocalStorageDB {
  private storageKey = {
    products: 'catalog_products',
    sales: 'catalog_sales',
    settings: 'catalog_settings',
    admins: 'catalog_admins'
  };

  constructor() {
    this.initializeDatabase();
  }

  private initializeDatabase() {
    if (!localStorage.getItem(this.storageKey.admins)) {
      const defaultAdmin: AdminUser = {
        id: this.generateId(),
        username: 'admin',
        password_hash: 'admin123_dev',
        created_at: new Date().toISOString()
      };
      localStorage.setItem(this.storageKey.admins, JSON.stringify([defaultAdmin]));
    }

    if (!localStorage.getItem(this.storageKey.products)) {
      localStorage.setItem(this.storageKey.products, JSON.stringify([]));
    }

    if (!localStorage.getItem(this.storageKey.sales)) {
      localStorage.setItem(this.storageKey.sales, JSON.stringify([]));
    }

    if (!localStorage.getItem(this.storageKey.settings)) {
      const defaultSettings: SiteSettings = {
        id: this.generateId(),
        company_name: 'Minha Loja Online',
        logo_url: '',
        welcome_message: 'Bem-vindo ao nosso catálogo de produtos!',
        pix_key: 'contato@minhaloja.com',
        primary_color: '#2563eb',
        secondary_color: '#1e40af',
        updated_at: new Date().toISOString()
      };
      localStorage.setItem(this.storageKey.settings, JSON.stringify(defaultSettings));
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async getProducts(filters?: { is_active?: boolean }) {
    const products: Product[] = JSON.parse(localStorage.getItem(this.storageKey.products) || '[]');
    let filtered = products;

    if (filters?.is_active !== undefined) {
      filtered = products.filter(p => p.is_active === filters.is_active);
    }

    return { data: filtered, error: null };
  }

  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    const products: Product[] = JSON.parse(localStorage.getItem(this.storageKey.products) || '[]');
    const newProduct: Product = {
      ...product,
      id: this.generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    products.push(newProduct);
    localStorage.setItem(this.storageKey.products, JSON.stringify(products));
    return { data: newProduct, error: null };
  }

  async updateProduct(id: string, updates: Partial<Product>) {
    const products: Product[] = JSON.parse(localStorage.getItem(this.storageKey.products) || '[]');
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
      return { data: null, error: 'Product not found' };
    }

    products[index] = {
      ...products[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    localStorage.setItem(this.storageKey.products, JSON.stringify(products));
    return { data: products[index], error: null };
  }

  async deleteProduct(id: string) {
    const products: Product[] = JSON.parse(localStorage.getItem(this.storageKey.products) || '[]');
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem(this.storageKey.products, JSON.stringify(filtered));
    return { data: null, error: null };
  }

  async getSales() {
    const sales: Sale[] = JSON.parse(localStorage.getItem(this.storageKey.sales) || '[]');
    return { data: sales, error: null };
  }

  async createSale(sale: Omit<Sale, 'id' | 'created_at'>) {
    const sales: Sale[] = JSON.parse(localStorage.getItem(this.storageKey.sales) || '[]');
    const newSale: Sale = {
      ...sale,
      id: this.generateId(),
      created_at: new Date().toISOString()
    };
    sales.push(newSale);
    localStorage.setItem(this.storageKey.sales, JSON.stringify(sales));
    return { data: newSale, error: null };
  }

  async updateSale(id: string, updates: Partial<Sale>) {
    const sales: Sale[] = JSON.parse(localStorage.getItem(this.storageKey.sales) || '[]');
    const index = sales.findIndex(s => s.id === id);
    
    if (index === -1) {
      return { data: null, error: 'Sale not found' };
    }

    sales[index] = { ...sales[index], ...updates };
    localStorage.setItem(this.storageKey.sales, JSON.stringify(sales));
    return { data: sales[index], error: null };
  }

  async getSettings() {
    const settings = localStorage.getItem(this.storageKey.settings);
    return { data: settings ? JSON.parse(settings) : null, error: null };
  }

  async updateSettings(updates: Partial<SiteSettings>) {
    const settings: SiteSettings = JSON.parse(localStorage.getItem(this.storageKey.settings) || '{}');
    const updated = { ...settings, ...updates, updated_at: new Date().toISOString() };
    localStorage.setItem(this.storageKey.settings, JSON.stringify(updated));
    return { data: updated, error: null };
  }

  async getAdminByCredentials(username: string, password: string) {
    const admins: AdminUser[] = JSON.parse(localStorage.getItem(this.storageKey.admins) || '[]');
    const admin = admins.find(a => a.username === username && a.password_hash === password);
    return { data: admin || null, error: admin ? null : 'Invalid credentials' };
  }
}

const db = new LocalStorageDB();

export const localDB = {
  from: (table: string) => {
    return {
      select: () => {
        if (table === 'products') {
          return {
            eq: (field: string, value: boolean) => ({
              order: () => db.getProducts({ is_active: value })
            }),
            order: () => db.getProducts()
          };
        }
        
        if (table === 'sales') {
          return {
            order: () => db.getSales()
          };
        }
        
        if (table === 'site_settings') {
          return {
            maybeSingle: () => db.getSettings()
          };
        }
        
        if (table === 'admin_users') {
          return {
            eq: (_field: string, value: string) => ({
              eq: (_field2: string, value2: string) => ({
                maybeSingle: () => db.getAdminByCredentials(value, value2)
              })
            })
          };
        }

        return { data: [], error: null };
      },
      
      insert: (data: any) => {
        if (table === 'products') return db.createProduct(data);
        if (table === 'sales') return db.createSale(data);
        return { data: null, error: null };
      },
      
      update: (data: any) => ({
        eq: (_field: string, value: string) => {
          if (table === 'products') return db.updateProduct(value, data);
          if (table === 'sales') return db.updateSale(value, data);
          if (table === 'site_settings') return db.updateSettings(data);
          return { data: null, error: null };
        }
      }),
      
      delete: () => ({
        eq: (_field: string, value: string) => {
          if (table === 'products') return db.deleteProduct(value);
          return { data: null, error: null };
        }
      })
    };
  }
};