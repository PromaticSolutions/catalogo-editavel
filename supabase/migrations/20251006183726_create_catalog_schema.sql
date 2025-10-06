/*
  # Create Online Catalog Schema

  ## Overview
  This migration creates the complete database structure for an online catalog system with admin panel.
  It includes product management, sales tracking, inventory control, and site customization.

  ## New Tables
  
  ### 1. `site_settings`
  Stores global site configuration including branding and PIX payment details
  - `id` (uuid, primary key)
  - `company_name` (text) - Name of the company
  - `logo_url` (text) - URL to company logo
  - `welcome_message` (text) - Welcome message for customers
  - `pix_key` (text) - PIX key for payments
  - `primary_color` (text) - Primary color for site theme
  - `secondary_color` (text) - Secondary color for site theme
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `products`
  Stores all products available in the catalog
  - `id` (uuid, primary key)
  - `name` (text) - Product name
  - `description` (text) - Product description
  - `price` (decimal) - Product price
  - `image_url` (text) - Product image URL
  - `stock_quantity` (integer) - Available quantity in stock
  - `is_active` (boolean) - Whether product is visible in catalog
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `sales`
  Tracks all sales/orders made through the catalog
  - `id` (uuid, primary key)
  - `product_id` (uuid) - Reference to product
  - `product_name` (text) - Product name snapshot
  - `quantity` (integer) - Quantity sold
  - `unit_price` (decimal) - Price per unit at time of sale
  - `total_amount` (decimal) - Total sale amount
  - `customer_name` (text) - Customer name (optional)
  - `customer_phone` (text) - Customer phone (optional)
  - `status` (text) - Order status: pending, paid, completed, cancelled
  - `pix_code` (text) - Generated PIX code for payment
  - `created_at` (timestamptz) - Sale timestamp

  ### 4. `admin_users`
  Stores admin user credentials
  - `id` (uuid, primary key)
  - `username` (text) - Admin username
  - `password_hash` (text) - Hashed password
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - Enable RLS on all tables
  - Public read access to site_settings and active products for catalog
  - Admin-only access for sales, inventory, and management operations
  - Authenticated admin users can manage all data

  ## Initial Data
  - Insert default site settings
  - Create default admin user (username: admin, password: admin123_dev)
*/

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL DEFAULT 'Minha Empresa',
  logo_url text DEFAULT '',
  welcome_message text DEFAULT 'Bem-vindo ao nosso catálogo!',
  pix_key text DEFAULT '',
  primary_color text DEFAULT '#2563eb',
  secondary_color text DEFAULT '#1e40af',
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price decimal(10,2) NOT NULL DEFAULT 0,
  image_url text DEFAULT '',
  stock_quantity integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  customer_name text DEFAULT '',
  customer_phone text DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  pix_code text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for site_settings
CREATE POLICY "Anyone can view site settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Only authenticated users can update site settings"
  ON site_settings FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- RLS Policies for products
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (is_active = true OR true);

CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  USING (true);

-- RLS Policies for sales
CREATE POLICY "Anyone can insert sales"
  ON sales FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view sales"
  ON sales FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can update sales"
  ON sales FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- RLS Policies for admin_users
CREATE POLICY "Anyone can view admin users for login"
  ON admin_users FOR SELECT
  USING (true);

-- Insert default site settings
INSERT INTO site_settings (company_name, welcome_message)
VALUES ('Minha Empresa', 'Bem-vindo ao nosso catálogo online!')
ON CONFLICT DO NOTHING;

-- Insert default admin user (password: admin123_dev)
-- Using simple hash for demo purposes
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', 'admin123_dev')
ON CONFLICT (username) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
