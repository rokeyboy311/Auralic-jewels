-- ==========================================================
-- AURELIC LUXURY FINE JEWELLERY — COMPLETE SEED DATA
-- ==========================================================

-- Insert Categories
INSERT INTO categories (id, name, slug, description, image_url, item_count)
VALUES
('cat-rings', 'Rings', 'rings', 'Solitaires, pavé eternity bands, and sculptural cocktail rings in 18K and 22K gold.', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80', 24),
('cat-necklaces', 'Necklaces', 'necklaces', 'High jewellery diamond collars, tennis necklaces, and gemstone chokers.', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80', 18),
('cat-earrings', 'Earrings', 'earrings', 'Brilliant cut diamond studs, celestial chandeliers, and emerald drops.', 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1000&q=80', 16),
('cat-bracelets', 'Bracelets', 'bracelets', 'Iconic tennis bracelets, diamond line cuffs, and gold link creations.', 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=1000&q=80', 14),
('cat-bangles', 'Bangles', 'bangles', 'Solid 18K & 22K gold rigid bangles with intricate filigree and hidden diamond hinges.', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80', 12),
('cat-pendants', 'Pendants', 'pendants', 'Symbolic talismans, bezel-set certified solitaires, and architectural medallions.', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=80', 15),
('cat-chains', 'Chains', 'chains', 'Heavy curb, wheat, rope, and box chains hand-spun in solid 18K yellow and rose gold.', 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=1000&q=80', 9),
('cat-mens', 'Men''s Jewellery', 'mens-jewellery', 'Architectural signet rings, solid platinum cuff links, and heavy diamond link bands.', 'https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?auto=format&fit=crop&w=1000&q=80', 11),
('cat-womens', 'Women''s Jewellery', 'womens-jewellery', 'Elegantly proportioned feminine creations capturing eternal light.', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=80', 42),
('cat-custom', 'Custom Jewellery', 'custom-jewellery', 'Bespoke commissions designed alongside our Master Gemologists.', 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?auto=format&fit=crop&w=1000&q=80', 6)
ON CONFLICT (id) DO NOTHING;

-- Insert Collections
INSERT INTO collections (id, name, slug, subtitle, description, banner_image, is_featured)
VALUES
('col-solitaire-masterpieces', 'Solitaire Masterpieces', 'solitaire-masterpieces', 'Exceptional GIA Certified Diamonds in Iconic Aurelic Prongs', 'A celebration of pure brilliance. Each diamond is hand-selected for its extraordinary fire and cut.', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1800&q=85', TRUE),
('col-royal-emerald', 'The Royal Emerald Collection', 'royal-emerald', 'Colombian Muzo Emeralds Paired with Brilliant Cut Diamonds', 'Deep verdant greens reflecting ancient royalty, framed by sculptural 18K yellow gold.', 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=1800&q=85', TRUE),
('col-heritage-gold', 'Heritage 22K Solid Gold', 'heritage-gold', 'Pure Radiance Hand-Carved by Master Goldsmiths', 'Rich, lustrous 22K gold forged with timeless textures and substantial weight.', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1800&q=85', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Insert Shipping Methods
INSERT INTO shipping_methods (id, name, carrier, description, cost_usd, estimated_days, is_free_above_threshold, insurance_included)
VALUES
('ship-insured-priority', 'Aurelic Armored Air Courier (Insured)', 'FedEx Priority Valuables / Ferrari Group', 'Direct courier delivery with sealed security container, signature verification & full transit insurance.', 75.00, '2–4 Business Days', TRUE, TRUE),
('ship-white-glove', 'White-Glove Private Concierge Handover', 'Aurelic Jewels Private Client Delivery', 'Dedicated luxury advisor handover at your private residence, hotel suite, or boutique VIP atelier suite.', 250.00, '1–2 Business Days (Scheduled)', FALSE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Insert Coupons
INSERT INTO coupons (code, discount_type, discount_value, min_order_usd, expiry_date, is_active, description)
VALUES
('WELCOME10', 'percentage', 10.00, 1000.00, '2028-12-31 23:59:59Z', TRUE, 'Welcome privileges: 10% complimentary reduction on your first acquisition.'),
('ROYAL15', 'percentage', 15.00, 5000.00, '2028-12-31 23:59:59Z', TRUE, 'VIP Customerage: 15% reduction on acquisitions over $5,000.'),
('AURELIC500', 'fixed', 500.00, 3000.00, '2028-12-31 23:59:59Z', TRUE, 'Private Invitation: $500 reduction on fine jewellery orders over $3,000.')
ON CONFLICT (code) DO NOTHING;

-- Insert Products
INSERT INTO products (
  id, name, slug, sku, category_id, collection_id, gender, 
  short_description, description, price_usd, compare_price_usd, 
  metal_type, purity, gold_karat, metal_color, weight_grams, 
  stone_type, stone_weight_carats, stock, status, is_featured, 
  is_new_arrival, is_best_seller, is_customizable, is_engraving_available, 
  rating, review_count
) VALUES
(
  'prod-solitaire-eternity-ring', 
  'The Celestial Solitaire Diamond Ring', 
  'celestial-solitaire-diamond-ring', 
  'AUR-RNG-001', 
  'cat-rings', 
  'col-solitaire-masterpieces', 
  'Women', 
  'A monumental 2.50ct Round Brilliant VVS1 Diamond cradled in signature 18K yellow gold 6-prong crown.', 
  'Sculpted in the heart of our Paris atelier, the Celestial Solitaire is the quintessential expression of timeless devotion. Hand-set with a GIA-certified 2.50-carat round brilliant-cut diamond of exceptional F colour and VVS1 clarity.', 
  12800.00, 14200.00, 
  'Gold', '18K', '18K', 'Yellow Gold', 4.80, 
  'Diamond', 2.50, 8, 'active', TRUE, TRUE, TRUE, TRUE, TRUE, 5.0, 14
),
(
  'prod-royal-emerald-necklace', 
  'The Empress Colombian Emerald Collar', 
  'empress-colombian-emerald-collar', 
  'AUR-NCK-002', 
  'cat-necklaces', 
  'col-royal-emerald', 
  'Women', 
  'Rare 8.40ct untreated Muzo emerald flanked by graduated baguette-cut diamond cascades in 18K white gold.', 
  'An extraordinary creation featuring a royal Colombian emerald of intense saturated green hue, harvested from the legendary Muzo mines and certified with no indications of oil treatment.', 
  38500.00, 42000.00, 
  'Gold', '18K', '18K', 'White Gold', 32.50, 
  'Emerald & Diamond', 12.80, 2, 'active', TRUE, FALSE, TRUE, TRUE, FALSE, 5.0, 6
),
(
  'prod-heritage-solid-bangle', 
  'The Heritage 22K Hand-Carved Sovereign Bangle', 
  'heritage-22k-hand-carved-sovereign-bangle', 
  'AUR-BNG-003', 
  'cat-bangles', 
  'col-heritage-gold', 
  'Women', 
  'Solid 22K rich bullion gold rigid bangle featuring hand-chiselled archival scrollwork.', 
  'Crafted from substantial 22-karat sovereign bullion gold, this heirloom bangle pays homage to centuries of goldsmithing mastery. Weighted for sublime tactile luxury with a discreet safety clasp.', 
  8900.00, 9500.00, 
  'Gold', '22K', '22K', 'Yellow Gold', 46.20, 
  'None', 0.00, 5, 'active', TRUE, TRUE, FALSE, TRUE, TRUE, 4.9, 9
),
(
  'prod-diamond-tennis-bracelet', 
  'The Luminescence 8.00ct Diamond Tennis Bracelet', 
  'luminescence-8ct-diamond-tennis-bracelet', 
  'AUR-BRC-004', 
  'cat-bracelets', 
  'col-solitaire-masterpieces', 
  'Women', 
  'A continuous rivière line of 48 calibrated Ideal Cut diamonds set in flexible 18K platinum-gold prongs.', 
  'An essential high jewellery icon. Each diamond is individually microscope-matched for identical diameter, colour grade, and table reflection to create an unbroken river of liquid brilliance.', 
  16500.00, 18000.00, 
  'Gold & Platinum', '18K / 950 Plat', '18K', 'White Gold', 14.20, 
  'Diamond', 8.00, 6, 'active', TRUE, FALSE, TRUE, TRUE, TRUE, 5.0, 22
),
(
  'prod-sapphire-chandeliers', 
  'The Royal Ceylon Sapphire Cascade Earrings', 
  'royal-ceylon-sapphire-cascade-earrings', 
  'AUR-EAR-005', 
  'cat-earrings', 
  'col-royal-emerald', 
  'Women', 
  'Pair of royal blue natural unheated Ceylon sapphires suspended below pavé diamond halos in 18K white gold.', 
  'Evoking the majestic glamour of Paris ballrooms, these dramatic drops showcase twin unheated Ceylon sapphires totaling 6.20 carats, swaying gracefully with every movement.', 
  19400.00, 21500.00, 
  'Gold', '18K', '18K', 'White Gold', 11.60, 
  'Sapphire & Diamond', 7.80, 3, 'active', FALSE, TRUE, TRUE, TRUE, FALSE, 4.9, 11
),
(
  'prod-mens-signet-cufflinks', 
  'The Sovereign Onyx & Diamond Signet Ring', 
  'sovereign-onyx-diamond-signet-ring', 
  'AUR-MNS-006', 
  'cat-mens', 
  'col-heritage-gold', 
  'Men', 
  'Substantial architectural signet in satin-brushed 18K yellow gold with natural black onyx and central diamond star.', 
  'A commanding masculine emblem combining razor-sharp modernist geometry with old-world weight. The central bezel holds a calibrated princess cut diamond flush-set in midnight onyx.', 
  6200.00, 6800.00, 
  'Gold', '18K', '18K', 'Yellow Gold', 19.50, 
  'Onyx & Diamond', 0.65, 10, 'active', TRUE, TRUE, FALSE, TRUE, TRUE, 5.0, 7
)
ON CONFLICT (id) DO NOTHING;

-- Insert Product Images
INSERT INTO product_images (product_id, url, alt, type, sort_order)
VALUES
('prod-solitaire-eternity-ring', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=85', 'The Celestial Solitaire Diamond Ring Front View', 'main', 1),
('prod-solitaire-eternity-ring', 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1200&q=85', 'The Celestial Solitaire Diamond Ring Angle Detail', 'gallery', 2),
('prod-royal-emerald-necklace', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=85', 'The Empress Colombian Emerald Collar', 'main', 1),
('prod-royal-emerald-necklace', 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=1200&q=85', 'The Empress Colombian Emerald Close Up', 'gallery', 2),
('prod-heritage-solid-bangle', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=85', 'The Heritage 22K Hand-Carved Sovereign Bangle', 'main', 1),
('prod-diamond-tennis-bracelet', 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=1200&q=85', 'The Luminescence 8.00ct Diamond Tennis Bracelet', 'main', 1),
('prod-sapphire-chandeliers', 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1200&q=85', 'The Royal Ceylon Sapphire Cascade Earrings', 'main', 1),
('prod-mens-signet-cufflinks', 'https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?auto=format&fit=crop&w=1200&q=85', 'The Sovereign Onyx & Diamond Signet Ring', 'main', 1);

-- Insert Product Variants
INSERT INTO product_variants (id, product_id, sku, metal_type, purity, size, stone_type, price_usd, stock, weight_grams, lead_time_days, is_ready_to_ship)
VALUES
('var-solitaire-18k-yellow-6', 'prod-solitaire-eternity-ring', 'AUR-RNG-001-YG-6', 'Yellow Gold', '18K', 'US 6.0', 'Natural Diamond', 12800.00, 3, 4.80, 7, TRUE),
('var-solitaire-18k-yellow-7', 'prod-solitaire-eternity-ring', 'AUR-RNG-001-YG-7', 'Yellow Gold', '18K', 'US 7.0', 'Natural Diamond', 12800.00, 4, 4.85, 7, TRUE),
('var-solitaire-18k-white-6', 'prod-solitaire-eternity-ring', 'AUR-RNG-001-WG-6', 'White Gold', '18K', 'US 6.0', 'Natural Diamond', 12950.00, 2, 4.90, 14, FALSE),
('var-solitaire-platinum-7', 'prod-solitaire-eternity-ring', 'AUR-RNG-001-PL-7', 'Platinum', '950 Platinum', 'US 7.0', 'Natural Diamond', 14200.00, 2, 6.20, 14, FALSE),
('var-emerald-necklace-18k-wg', 'prod-royal-emerald-necklace', 'AUR-NCK-002-WG-18', 'White Gold', '18K', '18 inch', 'Colombian Emerald', 38500.00, 2, 32.50, 21, FALSE),
('var-tennis-bracelet-18k-wg', 'prod-diamond-tennis-bracelet', 'AUR-BRC-004-WG-7', 'White Gold', '18K', '7.0 inch', 'Natural Diamond', 16500.00, 5, 14.20, 5, TRUE)
ON CONFLICT (id) DO NOTHING;
