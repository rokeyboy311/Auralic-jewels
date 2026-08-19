-- ==========================================================
-- AURELIA LUXURY FINE JEWELLERY — SEED DATA
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
('col-solitaire-masterpieces', 'Solitaire Masterpieces', 'solitaire-masterpieces', 'Exceptional GIA Certified Diamonds in Iconic Aurelia Prongs', 'A celebration of pure brilliance. Each diamond is hand-selected for its extraordinary fire and cut.', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1800&q=85', TRUE),
('col-royal-emerald', 'The Royal Emerald Collection', 'royal-emerald', 'Colombian Muzo Emeralds Paired with Brilliant Cut Diamonds', 'Deep verdant greens reflecting ancient royalty, framed by sculptural 18K yellow gold.', 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=1800&q=85', TRUE),
('col-heritage-gold', 'Heritage 22K Solid Gold', 'heritage-gold', 'Pure Radiance Hand-Carved by Master Goldsmiths', 'Rich, lustrous 22K gold forged with timeless textures and substantial weight.', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1800&q=85', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Insert Shipping Methods
INSERT INTO shipping_methods (id, name, carrier, description, cost_usd, estimated_days, is_free_above_threshold, insurance_included)
VALUES
('ship-insured-priority', 'Aurelia Armored Air Courier (Insured)', 'FedEx Priority Valuables / Ferrari Group', 'Direct courier delivery with sealed security container, signature verification & full transit insurance.', 75.00, '2–4 Business Days', TRUE, TRUE),
('ship-white-glove', 'White-Glove Private Concierge Handover', 'Maison Aurelia Private Client Delivery', 'Dedicated luxury advisor handover at your private residence, hotel suite, or boutique VIP atelier suite.', 250.00, '1–2 Business Days (Scheduled)', FALSE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Insert Coupons
INSERT INTO coupons (code, discount_type, discount_value, min_order_usd, expiry_date, is_active, description)
VALUES
('WELCOME10', 'percentage', 10.00, 1000.00, '2028-12-31 23:59:59Z', TRUE, 'Welcome privileges: 10% complimentary reduction on your first acquisition.'),
('ROYAL15', 'percentage', 15.00, 5000.00, '2028-12-31 23:59:59Z', TRUE, 'VIP Patronage: 15% reduction on acquisitions over $5,000.'),
('AURELIA500', 'fixed', 500.00, 3000.00, '2028-12-31 23:59:59Z', TRUE, 'Private Invitation: $500 reduction on fine jewellery orders over $3,000.')
ON CONFLICT (code) DO NOTHING;
