-- ==========================================================
-- 002_inventory_payments_history.sql
-- ==========================================================

-- Product Gemstones
CREATE TABLE IF NOT EXISTS product_gemstones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id VARCHAR(100) REFERENCES products(id) ON DELETE CASCADE,
  primary_stone VARCHAR(100) NOT NULL,
  origin VARCHAR(100),
  carat NUMERIC(6, 2) NOT NULL,
  cut VARCHAR(100),
  color_grade VARCHAR(50),
  clarity_grade VARCHAR(50),
  treatment VARCHAR(100) DEFAULT 'None / Natural Untreated'
);

-- Product Certifications
CREATE TABLE IF NOT EXISTS product_certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id VARCHAR(100) REFERENCES products(id) ON DELETE CASCADE,
  lab VARCHAR(50) NOT NULL,
  cert_number VARCHAR(100) NOT NULL,
  carat_weight NUMERIC(6, 2) NOT NULL,
  cut VARCHAR(50) NOT NULL,
  color VARCHAR(50) NOT NULL,
  clarity VARCHAR(50) NOT NULL,
  polish VARCHAR(50),
  symmetry VARCHAR(50),
  fluorescence VARCHAR(50),
  pdf_url TEXT
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) NOT NULL UNIQUE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid',
  payment_method VARCHAR(50) NOT NULL DEFAULT 'stripe',
  payment_intent_id VARCHAR(255),
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  subtotal_usd NUMERIC(12, 2) NOT NULL,
  discount_usd NUMERIC(12, 2) DEFAULT 0,
  tax_usd NUMERIC(12, 2) DEFAULT 0,
  shipping_usd NUMERIC(12, 2) DEFAULT 0,
  total_usd NUMERIC(12, 2) NOT NULL,
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  tracking_number VARCHAR(100),
  carrier_name VARCHAR(100),
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id VARCHAR(100) REFERENCES products(id) ON DELETE SET NULL,
  variant_id VARCHAR(100),
  product_name VARCHAR(255) NOT NULL,
  product_slug VARCHAR(255),
  sku VARCHAR(100),
  image_url TEXT,
  metal_type VARCHAR(100),
  purity VARCHAR(50),
  size VARCHAR(50),
  stone_type VARCHAR(100),
  engraving_text VARCHAR(100),
  unit_price_usd NUMERIC(12, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_usd NUMERIC(12, 2) NOT NULL
);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
  code VARCHAR(50) PRIMARY KEY,
  discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage',
  discount_value NUMERIC(10, 2) NOT NULL,
  min_order_usd NUMERIC(12, 2) DEFAULT 0,
  max_discount_usd NUMERIC(12, 2),
  description TEXT,
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id VARCHAR(100) REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name VARCHAR(255) NOT NULL,
  user_country VARCHAR(100) DEFAULT 'International',
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255) NOT NULL,
  comment TEXT NOT NULL,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'approved',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
