-- ==========================================================
-- MAISON AURALIC / AURALIC JEWELS — POSTGRESQL PRODUCTION DDL
-- Compatible with Neon PostgreSQL, AWS RDS, Supabase, Google Cloud SQL
-- ==========================================================

-- UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & CUSTOMERS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('customer', 'atelier_staff', 'admin', 'superadmin', 'gemologist', 'master_jeweller')),
    is_email_verified BOOLEAN DEFAULT FALSE,
    google_id VARCHAR(255) UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. SAVED ADDRESSES
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city VARCHAR(100) NOT NULL,
    state_or_province VARCHAR(100) NOT NULL,
    postal_code VARCHAR(50) NOT NULL,
    country VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    item_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. COLLECTIONS
CREATE TABLE IF NOT EXISTS collections (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    subtitle VARCHAR(255),
    description TEXT,
    banner_image TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    category_id VARCHAR(100) REFERENCES categories(id) ON DELETE SET NULL,
    collection_id VARCHAR(100) REFERENCES collections(id) ON DELETE SET NULL,
    gender VARCHAR(50) DEFAULT 'Women' CHECK (gender IN ('Women', 'Men', 'Unisex')),
    short_description TEXT,
    description TEXT,
    price_usd NUMERIC(12, 2) NOT NULL,
    compare_price_usd NUMERIC(12, 2),
    currency VARCHAR(10) DEFAULT 'USD',
    metal_type VARCHAR(100) NOT NULL,
    purity VARCHAR(50) NOT NULL,
    gold_karat VARCHAR(50),
    metal_color VARCHAR(100),
    weight_grams NUMERIC(8, 2) NOT NULL,
    net_gold_weight_grams NUMERIC(8, 2),
    stone_type VARCHAR(100) DEFAULT 'None',
    stone_weight_carats NUMERIC(8, 2),
    dimensions VARCHAR(255),
    stock INT DEFAULT 10,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'out_of_stock')),
    is_featured BOOLEAN DEFAULT FALSE,
    is_new_arrival BOOLEAN DEFAULT FALSE,
    is_best_seller BOOLEAN DEFAULT FALSE,
    is_customizable BOOLEAN DEFAULT TRUE,
    is_engraving_available BOOLEAN DEFAULT TRUE,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    review_count INT DEFAULT 0,
    warranty_period_years INT DEFAULT 5,
    care_instructions TEXT,
    shipping_information TEXT,
    return_eligibility TEXT,
    video_url TEXT,
    model_url TEXT,
    model_thumbnail TEXT,
    has_3d_model BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id VARCHAR(100) REFERENCES products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    public_id VARCHAR(255),
    alt VARCHAR(255),
    type VARCHAR(50) DEFAULT 'gallery' CHECK (type IN ('main', 'gallery', 'lifestyle', 'model', 'detail', 'certificate')),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. PRODUCT VARIANTS
CREATE TABLE IF NOT EXISTS product_variants (
    id VARCHAR(100) PRIMARY KEY,
    product_id VARCHAR(100) REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    metal_type VARCHAR(100) NOT NULL,
    purity VARCHAR(50) NOT NULL,
    size VARCHAR(50),
    stone_type VARCHAR(100),
    price_usd NUMERIC(12, 2) NOT NULL,
    compare_price_usd NUMERIC(12, 2),
    stock INT DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. FUTURE 3D SHOWROOM MODELS (Prepared for Three.js GLB models)
CREATE TABLE IF NOT EXISTS showroom_models (
    id VARCHAR(100) PRIMARY KEY,
    product_id VARCHAR(100) REFERENCES products(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    model_url TEXT NOT NULL,
    thumbnail_url TEXT,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. SHIPPING METHODS
CREATE TABLE IF NOT EXISTS shipping_methods (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    carrier VARCHAR(255) NOT NULL,
    description TEXT,
    cost_usd NUMERIC(8, 2) NOT NULL,
    estimated_days VARCHAR(100) NOT NULL,
    is_free_above_threshold BOOLEAN DEFAULT TRUE,
    insurance_included BOOLEAN DEFAULT TRUE
);

-- 10. COUPONS & PRIVILEGES
CREATE TABLE IF NOT EXISTS coupons (
    code VARCHAR(50) PRIMARY KEY,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10, 2) NOT NULL,
    min_order_usd NUMERIC(10, 2) DEFAULT 0,
    expiry_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(100) PRIMARY KEY,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    shipping_address_json JSONB NOT NULL,
    billing_address_json JSONB,
    subtotal_usd NUMERIC(12, 2) NOT NULL,
    discount_usd NUMERIC(12, 2) DEFAULT 0,
    coupon_code VARCHAR(50),
    shipping_cost_usd NUMERIC(12, 2) DEFAULT 0,
    tax_cost_usd NUMERIC(12, 2) DEFAULT 0,
    customs_duty_cost_usd NUMERIC(12, 2) DEFAULT 0,
    total_usd NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    total_in_currency NUMERIC(12, 2) NOT NULL,
    exchange_rate_used NUMERIC(12, 4) DEFAULT 1.0,
    shipping_method_id VARCHAR(100),
    shipping_method_name VARCHAR(255),
    tracking_number VARCHAR(255),
    carrier_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'payment_pending', 'paid', 'confirmed', 'processing', 'made_to_order', 'ready_to_ship', 'shipped', 'in_transit', 'delivered', 'cancelled', 'refund_requested', 'refunded', 'partially_refunded', 'failed')),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'authorized', 'paid', 'failed', 'cancelled', 'refunded', 'partially_refunded')),
    payment_method VARCHAR(50) DEFAULT 'wire_transfer',
    payment_intent_id VARCHAR(255),
    notes TEXT,
    estimated_delivery_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. ORDER ITEMS (Immutable historical snapshot)
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(100) REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(100) REFERENCES products(id) ON DELETE SET NULL,
    variant_id VARCHAR(100),
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    image TEXT,
    metal_type VARCHAR(100),
    purity VARCHAR(50),
    size VARCHAR(50),
    stone_type VARCHAR(100),
    engraving_text VARCHAR(255),
    certificate_number VARCHAR(100),
    unit_price_usd NUMERIC(12, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    total_usd NUMERIC(12, 2) NOT NULL
);

-- 13. REVIEWS & TESTIMONIALS (With verified buyer link)
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(100) PRIMARY KEY,
    product_id VARCHAR(100) REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    user_country VARCHAR(100) DEFAULT 'International Customer',
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT NOT NULL,
    is_verified_buyer BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. ATELIER CONCIERGE CHAT CONVERSATIONS
CREATE TABLE IF NOT EXISTS conversations (
    id VARCHAR(100) PRIMARY KEY,
    ticket_number VARCHAR(100) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_phone VARCHAR(50),
    subject VARCHAR(255) NOT NULL,
    type VARCHAR(100) DEFAULT 'general_concierge',
    status VARCHAR(50) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'PENDING', 'IN_PROGRESS', 'WAITING_FOR_USER', 'WAITING_FOR_ADMIN', 'RESOLVED', 'CLOSED')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    product_id VARCHAR(100) REFERENCES products(id) ON DELETE SET NULL,
    product_context_json JSONB,
    order_id VARCHAR(100) REFERENCES orders(id) ON DELETE SET NULL,
    order_context_json JSONB,
    assigned_staff_id UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_staff_name VARCHAR(255),
    internal_notes TEXT,
    unread_by_user_count INT DEFAULT 0,
    unread_by_admin_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 15. CONVERSATION MESSAGES
CREATE TABLE IF NOT EXISTS conversation_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id VARCHAR(100) REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id VARCHAR(255) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    sender_role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    attachments_json JSONB,
    is_internal_note BOOLEAN DEFAULT FALSE,
    is_read_by_recipient BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. BESPOKE COMMISSIONS & INQUIRIES
CREATE TABLE IF NOT EXISTS bespoke_inquiries (
    id VARCHAR(100) PRIMARY KEY,
    reference_number VARCHAR(100) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    customer_country VARCHAR(100),
    category VARCHAR(100) NOT NULL,
    metal_preference VARCHAR(100) NOT NULL,
    purity_preference VARCHAR(50),
    stone_preference VARCHAR(100),
    target_carat NUMERIC(8, 2),
    target_budget_usd VARCHAR(100),
    size_specification VARCHAR(100),
    engraving_message TEXT,
    design_description TEXT NOT NULL,
    reference_image_url TEXT,
    timeline_requirement VARCHAR(100),
    status VARCHAR(50) DEFAULT 'inquiry_received' CHECK (status IN ('inquiry_received', 'consultation_scheduled', 'cad_in_progress', 'quotation_issued', 'approved', 'in_atelier')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. WISHLIST ITEMS
CREATE TABLE IF NOT EXISTS wishlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id VARCHAR(100) REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- 18. AUDIT LOGS FOR ADMINISTRATIVE ACTIONS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255),
    details_json JSONB,
    ip_address VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 19. PASSWORD RESETS
CREATE TABLE IF NOT EXISTS password_resets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 20. NEON DATABASE MEDIA STORAGE (Direct PostgreSQL Image Vault)
CREATE TABLE IF NOT EXISTS media_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL DEFAULT 'image/jpeg',
    data_base64 TEXT NOT NULL,
    file_size INT NOT NULL DEFAULT 0,
    folder VARCHAR(100) DEFAULT 'auralic_jewels',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR ULTRA-FAST DISCOVERY & QUERIES
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price_usd);
CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_ticket ON conversations(ticket_number);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_convo ON conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_bespoke_email ON bespoke_inquiries(customer_email);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_media_uploads_created ON media_uploads(created_at DESC);
