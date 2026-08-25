-- ==========================================================
-- 003_international_tax_shipping.sql
-- ==========================================================

-- Shipping Methods
CREATE TABLE IF NOT EXISTS shipping_methods (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  carrier VARCHAR(100) NOT NULL,
  description TEXT,
  cost_usd NUMERIC(10, 2) NOT NULL,
  estimated_days VARCHAR(50) NOT NULL,
  is_free_above_threshold BOOLEAN DEFAULT TRUE,
  free_threshold_usd NUMERIC(12, 2) DEFAULT 10000,
  insurance_included BOOLEAN DEFAULT TRUE,
  requires_signature BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Bespoke Inquiries
CREATE TABLE IF NOT EXISTS bespoke_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number VARCHAR(50) NOT NULL UNIQUE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  jewellery_type VARCHAR(100) NOT NULL,
  metal_preference VARCHAR(100),
  stone_preference VARCHAR(100),
  budget_range VARCHAR(100),
  timeline VARCHAR(100),
  notes TEXT NOT NULL,
  inspiration_images JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(50) NOT NULL DEFAULT 'received',
  assigned_staff_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contact Inquiries & Appointments
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  boutique_location VARCHAR(100),
  status VARCHAR(50) DEFAULT 'unread',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Newsletter Subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  email VARCHAR(255) PRIMARY KEY,
  is_active BOOLEAN DEFAULT TRUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Password Resets
CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Workshop Concierge Conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  user_phone VARCHAR(50),
  assigned_staff_id UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_staff_name VARCHAR(255),
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'open',
  priority VARCHAR(50) NOT NULL DEFAULT 'standard',
  type VARCHAR(50) NOT NULL DEFAULT 'concierge',
  product_id VARCHAR(100) REFERENCES products(id) ON DELETE SET NULL,
  product_context JSONB,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  order_context JSONB,
  internal_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Conversation Messages
CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  sender_role VARCHAR(50) NOT NULL DEFAULT 'customer',
  sender_name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  is_internal_note BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
