import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// @ts-ignore
import multer from 'multer';
import { getDbPool } from '../db/connection';
import { config } from '../config';
import { PaymentService } from '../services/payment.service';
import { EmailService } from '../services/email.service';
import { MediaService } from '../services/media.service';
import { 
  requireAuth, 
  requireAdmin, 
  requireStaff, 
  optionalAuth, 
  AuthenticatedRequest 
} from '../middleware/auth.middleware';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
});

// ==========================================================
// 1. SYSTEM HEALTH CHECK
// ==========================================================
router.get('/health', (req: Request, res: Response) => {
  const pool = getDbPool();
  res.json({
    status: 'healthy',
    service: 'Aurelic Jewels / Aurelic Jewels Fine Jewellery REST API',
    uptime: process.uptime(),
    databaseConnected: !!pool,
    mediaStorage: 'Neon PostgreSQL Image Vault',
    payments: 'Direct Workshop Consignment & Bank Wire',
    timestamp: new Date().toISOString(),
  });
});

// ==========================================================
// 2. AUTHENTICATION & CUSTOMER ACCOUNT SYSTEM
// ==========================================================

/**
 * Register Customer Account
 */

// ==========================================================
// 2. AUTHENTICATION & IDENTITY
// ==========================================================

router.post('/auth/register', async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
  }
  const cleanEmail = email.toLowerCase().trim();
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database service unavailable.' });
  try {
    const existCheck = await pool.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existCheck.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'Account already exists for this email.' });
    }
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);
    // Force role to customer for self-registration
    const insertRes = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, is_email_verified)
       VALUES ($1, $2, $3, 'customer', true) RETURNING id, name, email, role`,
      [name, cleanEmail, passwordHash]
    );
    return res.status(201).json({ success: true, message: 'Registration successful.', data: insertRes.rows[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }
  const cleanEmail = email.toLowerCase().trim();
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database service unavailable.' });
  try {
    const result = await pool.query('SELECT id, name, email, password_hash, phone, role, avatar_url FROM users WHERE email = $1', [cleanEmail]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }
    const user = result.rows[0];
    if (!user.password_hash) {
      return res.status(401).json({ success: false, error: 'Account uses Google Sign-In.' });
    }
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
    delete user.password_hash;
    res.cookie('aurelic_auth_token', token, {
      httpOnly: true,
      secure: config.env === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: config.env === 'production' ? 'none' : 'lax',
      path: '/'
    });
    return res.json({ success: true, data: { user, token }, message: 'Authentication successful.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/auth/google', async (req: Request, res: Response) => {
  const { credential, idToken, email, name, googleId } = req.body;
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database service unavailable.' });
  try {
    let verifiedEmail = email;
    let verifiedName = name;
    let verifiedGoogleId = googleId;
    if (credential || idToken) {
       const tokenToVerify = credential || idToken;
       const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${tokenToVerify}`);
       if (!response.ok) return res.status(401).json({ success: false, error: 'Invalid Google Identity token.' });
       const payload = await response.json() as any;
       verifiedEmail = payload.email;
       verifiedName = payload.name;
       verifiedGoogleId = payload.sub;
    }
    if (!verifiedEmail) return res.status(400).json({ success: false, error: 'Unable to verify email from Google.' });
    const cleanEmail = verifiedEmail.toLowerCase().trim();
    const existingRes = await pool.query('SELECT id, name, email, role, avatar_url, google_id FROM users WHERE email = $1', [cleanEmail]);
    let user;
    if (existingRes.rows.length === 0) {
      const insertRes = await pool.query(
        `INSERT INTO users (name, email, role, google_id, is_email_verified)
         VALUES ($1, $2, 'customer', $3, true)
         RETURNING id, name, email, role, avatar_url`,
        [verifiedName || 'Customer Client', cleanEmail, verifiedGoogleId]
      );
      user = insertRes.rows[0];
    } else {
      user = existingRes.rows[0];
      if (!user.google_id) {
         await pool.query(`UPDATE users SET google_id = $1 WHERE id = $2`, [verifiedGoogleId, user.id]);
      }
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
    res.cookie('aurelic_auth_token', token, {
      httpOnly: true,
      secure: config.env === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: config.env === 'production' ? 'none' : 'lax',
      path: '/'
    });
    return res.json({ success: true, data: { user, token } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/auth/logout', (req: Request, res: Response) => {
  res.clearCookie('aurelic_auth_token', { path: '/' });
  res.json({ success: true, message: 'Logged out successfully.' });
});

router.get('/auth/me', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.id) return res.json({ success: true, data: null });
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database service unavailable.' });
  try {
    const result = await pool.query('SELECT id, name, email, phone, role, avatar_url, created_at FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) return res.json({ success: true, data: null });
    return res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/auth/password/forgot', async (req: Request, res: Response) => {
  return res.json({ success: true, message: 'If an account is associated with this email, security instructions have been dispatched.' });
});

router.post('/auth/password/reset', async (req: Request, res: Response) => {
  return res.status(400).json({ success: false, error: 'Invalid or expired reset token.' });
});

// 3. MEDIA UPLOADS & IMAGE VAULT (NEON DATABASE STORAGE)
// ==========================================================

/**
 * Upload Image to Neon PostgreSQL Database
 */
router.post('/uploads/image', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const r = req as any;
    if (r.file) {
      const { originalname, mimetype, buffer } = r.file;
      const folder = (req.body.folder as string) || 'aurelic_jewels';
      const uploaded = await MediaService.uploadBuffer(buffer, originalname, mimetype, folder);
      return res.json({ success: true, data: uploaded });
    }

    if (req.body.base64 || req.body.image) {
      const rawBase64 = req.body.base64 || req.body.image;
      const matches = rawBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      const mimeType = matches ? matches[1] : req.body.mimeType || 'image/jpeg';
      const base64Content = matches ? matches[2] : rawBase64;
      const buffer = Buffer.from(base64Content, 'base64');
      const filename = req.body.filename || `jewellery_${Date.now()}.jpg`;
      const folder = req.body.folder || 'aurelic_jewels';

      const uploaded = await MediaService.uploadBuffer(buffer, filename, mimeType, folder);
      return res.json({ success: true, data: uploaded });
    }

    return res.status(400).json({ success: false, error: 'No image file or base64 payload provided.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Direct Image Stream from Neon Database by ID
 */
router.get('/media/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const media = await MediaService.getMediaById(id);

    if (!media) {
      return res.status(404).send('Image asset not found');
    }

    res.setHeader('Content-Type', media.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.end(media.buffer);
  } catch (error: any) {
    return res.status(500).send('Error loading image');
  }
});

// ==========================================================
// 4. PRODUCTS & HIGH JEWELLERY CATALOGUE
// ==========================================================



/**
 * List Catalogue Products
 */
router.get('/products', async (req: Request, res: Response) => {
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database service unavailable.' });

  try {
    const {
      category,
      collection,
      metalType,
      purity,
      stoneType,
      gender,
      minPrice,
      maxPrice,
      search,
      sort,
      limit = 50,
      offset = 0,
    } = req.query;

    let query = `
      SELECT p.*,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', img.id,
              'url', img.url,
              'alt', img.alt,
              'type', img.type,
              'sortOrder', img.sort_order
            ) ORDER BY img.sort_order ASC
          ) FROM product_images img WHERE img.product_id = p.id),
          '[]'::json
        ) AS images,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', v.id,
              'metalType', v.metal_type,
              'purity', v.purity,
              'sku', v.sku,
              'priceUSD', v.price_usd,
              'comparePriceUSD', v.compare_price_usd,
              'stock', v.stock
            ) ORDER BY v.price_usd ASC
          ) FROM product_variants v WHERE v.product_id = p.id),
          '[]'::json
        ) AS variants
      FROM products p
      WHERE p.status = 'active'
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND LOWER(p.category_id) = LOWER($${paramIndex++})`;
      params.push(category);
    }
    if (collection) {
      query += ` AND LOWER(p.collection_id) = LOWER($${paramIndex++})`;
      params.push(collection);
    }
    if (metalType) {
      query += ` AND LOWER(p.metal_type) = LOWER($${paramIndex++})`;
      params.push(metalType);
    }
    if (purity) {
      query += ` AND LOWER(p.purity) = LOWER($${paramIndex++})`;
      params.push(purity);
    }
    if (stoneType) {
      query += ` AND LOWER(p.stone_type) = LOWER($${paramIndex++})`;
      params.push(stoneType);
    }
    if (gender) {
      query += ` AND LOWER(p.gender) = LOWER($${paramIndex++})`;
      params.push(gender);
    }
    if (minPrice) {
      query += ` AND p.price_usd >= $${paramIndex++}`;
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      query += ` AND p.price_usd <= $${paramIndex++}`;
      params.push(Number(maxPrice));
    }
    if (search) {
      query += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (sort === 'price_asc' || sort === 'price-asc') {
      query += ' ORDER BY p.price_usd ASC';
    } else if (sort === 'price_desc' || sort === 'price-desc') {
      query += ' ORDER BY p.price_usd DESC';
    } else if (sort === 'newest') {
      query += ' ORDER BY p.created_at DESC';
    } else {
      query += ' ORDER BY p.is_featured DESC, p.created_at DESC';
    }

    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(Number(limit), Number(offset));

    const result = await pool.query(query, params);

    const formatted = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      sku: row.sku,
      brand: 'Aurelic Jewels',
      category: row.category_id || 'Rings',
      collection: row.collection_id || 'Solitaire Masterpieces',
      gender: row.gender || 'Women',
      shortDescription: row.short_description || row.description,
      description: row.description,
      priceUSD: parseFloat(row.price_usd),
      comparePriceUSD: row.compare_price_usd ? parseFloat(row.compare_price_usd) : undefined,
      currency: 'USD',
      metalType: row.metal_type,
      purity: row.purity,
      goldKarat: row.purity ? `${row.purity} Gold` : '18K Solid Gold',
      grossWeightGrams: row.weight_grams ? parseFloat(row.weight_grams) : 4.5,
      netGoldWeightGrams: row.weight_grams ? parseFloat(row.weight_grams) * 0.9 : 4.0,
      hallmarkAssayOffice: 'Paris Place Vendôme Assay Stamp',
      stoneType: row.stone_type || 'Natural Diamond',
      stoneWeightCarats: row.total_carat_weight ? parseFloat(row.total_carat_weight) : 2.0,
      totalCaratWeight: row.total_carat_weight ? parseFloat(row.total_carat_weight) : 2.0,
      stock: 10,
      lowStockThreshold: 2,
      isReadyToShip: true,
      isMadeToOrder: false,
      isCustomizable: row.is_customizable ?? true,
      isEngravingAvailable: row.is_engraving_available ?? true,
      isNewArrival: row.is_new_arrival ?? true,
      isFeatured: row.is_featured ?? true,
      isBestSeller: row.is_best_seller ?? true,
      isBestseller: row.is_best_seller ?? true,
      productionLeadTimeDays: row.lead_time_days || 14,
      estimatedDispatchHours: 24,
      countryOfOrigin: 'France',
      status: row.status || 'active',
      rating: parseFloat(row.rating || '5.0'),
      reviewCount: parseInt(row.review_count || '0', 10),
      images: row.images && row.images.length > 0 ? row.images : [{ id: 'img-def', url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=85', alt: row.name, type: 'main', sortOrder: 1 }],
      variants: row.variants || [],
      careInstructions: 'Clean gently with warm water and soft cloth.',
      shippingInformation: 'Complimentary insured worldwide armored handover.',
      returnEligibility: '30-day vault return privilege.',
      exchangeEligibility: 'Lifetime gold upgrade warranty.',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    if (formatted.length === 0) {
      return res.json({ success: true, data: [] });
    }

    return res.json({ success: true, data: formatted });
  } catch (error: any) {
    return res.json({ success: true, data: [] });
  }
});

/**
 * Get Specific Product by Slug or ID
 */
router.get('/products/:slugOrId', async (req: Request, res: Response) => {
  const { slugOrId } = req.params;
  const pool = getDbPool();
  if (!pool) {
    
    return res.status(404).json({ success: false, error: 'Product not found.' });
  }

  try {
    const { slugOrId } = req.params;
    const result = await pool.query(
      `
      SELECT p.*,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', img.id,
              'url', img.url,
              'alt', img.alt,
              'type', img.type,
              'sortOrder', img.sort_order
            ) ORDER BY img.sort_order ASC
          ) FROM product_images img WHERE img.product_id = p.id),
          '[]'::json
        ) AS images,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', v.id,
              'metalType', v.metal_type,
              'purity', v.purity,
              'sku', v.sku,
              'priceUSD', v.price_usd,
              'comparePriceUSD', v.compare_price_usd,
              'stock', v.stock
            ) ORDER BY v.price_usd ASC
          ) FROM product_variants v WHERE v.product_id = p.id),
          '[]'::json
        ) AS variants
      FROM products p
      WHERE (p.slug = $1 OR p.id = $1)
      LIMIT 1
      `,
      [slugOrId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Creation not found in Aurelic Jewels archives.' });
    }

    const row = result.rows[0];
    const product = {
      id: row.id,
      name: row.name,
      slug: row.slug,
      sku: row.sku,
      brand: 'Aurelic Jewels',
      category: row.category_id || 'Rings',
      collection: row.collection_id || 'Solitaire Masterpieces',
      gender: row.gender || 'Women',
      shortDescription: row.short_description || row.description,
      description: row.description,
      priceUSD: parseFloat(row.price_usd),
      comparePriceUSD: row.compare_price_usd ? parseFloat(row.compare_price_usd) : undefined,
      currency: 'USD',
      metalType: row.metal_type,
      purity: row.purity,
      goldKarat: row.purity ? `${row.purity} Gold` : '18K Solid Gold',
      grossWeightGrams: row.weight_grams ? parseFloat(row.weight_grams) : 4.5,
      netGoldWeightGrams: row.weight_grams ? parseFloat(row.weight_grams) * 0.9 : 4.0,
      hallmarkAssayOffice: 'Paris Place Vendôme Assay Stamp',
      stoneType: row.stone_type || 'Natural Diamond',
      stoneWeightCarats: row.total_carat_weight ? parseFloat(row.total_carat_weight) : 2.0,
      totalCaratWeight: row.total_carat_weight ? parseFloat(row.total_carat_weight) : 2.0,
      stock: 10,
      lowStockThreshold: 2,
      isReadyToShip: true,
      isMadeToOrder: false,
      isCustomizable: row.is_customizable ?? true,
      isEngravingAvailable: row.is_engraving_available ?? true,
      isNewArrival: row.is_new_arrival ?? true,
      isFeatured: row.is_featured ?? true,
      isBestSeller: row.is_best_seller ?? true,
      isBestseller: row.is_best_seller ?? true,
      productionLeadTimeDays: row.lead_time_days || 14,
      estimatedDispatchHours: 24,
      countryOfOrigin: 'France',
      status: row.status || 'active',
      rating: parseFloat(row.rating || '5.0'),
      reviewCount: parseInt(row.review_count || '0', 10),
      images: row.images && row.images.length > 0 ? row.images : [{ id: 'img-def', url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=85', alt: row.name, type: 'main', sortOrder: 1 }],
      variants: row.variants || [],
      careInstructions: 'Clean gently with warm water and soft cloth.',
      shippingInformation: 'Complimentary insured worldwide armored handover.',
      returnEligibility: '30-day vault return privilege.',
      exchangeEligibility: 'Lifetime gold upgrade warranty.',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    return res.json({ success: true, data: product });
  } catch (error: any) {
    
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Save / Create Product (Admin)
 */
router.post('/admin/products', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database unavailable.' });

  try {
    const payload = req.body;
    const prodId = payload.id || `prod-${Date.now()}`;
    const slug = payload.slug || (payload.name || 'jewellery').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const sku = payload.sku || `AUR-JW-${Date.now().toString().slice(-4)}`;

    // Insert Product Record
    await pool.query(
      `INSERT INTO products (
        id, name, slug, sku, description, story, price_usd, compare_price_usd,
        category_id, collection_id, metal_type, purity, stone_type, total_carat_weight,
        weight_grams, gender, status, is_featured, is_new_arrival, lead_time_days
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        price_usd = EXCLUDED.price_usd,
        metal_type = EXCLUDED.metal_type,
        purity = EXCLUDED.purity,
        stone_type = EXCLUDED.stone_type,
        weight_grams = EXCLUDED.weight_grams,
        status = EXCLUDED.status,
        updated_at = NOW()`,
      [
        prodId,
        payload.name || 'High Jewellery Masterpiece',
        slug,
        sku,
        payload.description || 'Fine jewellery handcrafted in our workshop.',
        payload.story || null,
        Number(payload.priceUSD || payload.price_usd || 5000),
        payload.comparePriceUSD ? Number(payload.comparePriceUSD) : null,
        payload.category || payload.category_id || 'Rings',
        payload.collection || payload.collection_id || 'Solitaire Masterpieces',
        payload.metalType || payload.metal_type || 'Yellow Gold',
        payload.purity || '18K',
        payload.stoneType || payload.stone_type || 'Natural Diamond',
        payload.stoneWeightCarats || payload.totalCaratWeight ? Number(payload.stoneWeightCarats || payload.totalCaratWeight) : 2.0,
        payload.grossWeightGrams || payload.weight_grams ? Number(payload.grossWeightGrams || payload.weight_grams) : 4.5,
        payload.gender || 'Women',
        payload.status || 'active',
        payload.isFeatured || false,
        payload.isNewArrival || false,
        payload.productionLeadTimeDays || 14,
      ]
    );

    // Insert Product Images
    if (payload.images && Array.isArray(payload.images)) {
      await pool.query('DELETE FROM product_images WHERE product_id = $1', [prodId]);
      for (let i = 0; i < payload.images.length; i++) {
        const img = payload.images[i];
        const imgUrl = typeof img === 'string' ? img : img.url;
        if (imgUrl) {
          await pool.query(
            `INSERT INTO product_images (id, product_id, url, alt, type, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [`img-${Date.now()}-${i}`, prodId, imgUrl, payload.name || 'Jewellery', i === 0 ? 'main' : 'gallery', i + 1]
          );
        }
      }
    }

    return res.status(201).json({ success: true, data: { id: prodId, slug, name: payload.name } });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Delete Product (Admin)
 */
router.delete('/admin/products/:id', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database unavailable.' });

  try {
    const { id } = req.params;
    await pool.query('DELETE FROM product_images WHERE product_id = $1', [id]);
    await pool.query('DELETE FROM product_variants WHERE product_id = $1', [id]);
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    return res.json({ success: true, message: 'Creation archived successfully.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================================
// 5. CATEGORIES & TAXONOMY
// ==========================================================

// Default High Joaillerie Categories with curated luxury imagery




router.get('/categories', async (req: Request, res: Response) => {
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database service unavailable.' });

  try {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.description,
        COALESCE(c.image_url, '') AS image_url,
        COUNT(p.id) AS product_count
      FROM categories c
      LEFT JOIN products p ON (p.category_id = c.id OR LOWER(p.category_id) = LOWER(c.name)) AND p.status = 'active'
      GROUP BY c.id, c.name, c.slug, c.description, c.image_url
      ORDER BY c.name ASC
    `);

    if (result.rows.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const categories = result.rows.map((row: any) => {
      
      const resolvedImg = row.image_url || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80';
      return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description || '',
        imageUrl: resolvedImg,
        image: resolvedImg,
        image_url: resolvedImg,
        itemCount: parseInt(row.product_count || '0', 10) || 12,
        featured: true,
      };
    });

    return res.json({ success: true, data: categories });
  } catch (error: any) {
    return res.json({ success: true, data: [] });
  }
});

router.get('/collections', async (req: Request, res: Response) => {
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database service unavailable.' });

  try {
    const result = await pool.query(`
      SELECT 
        col.id,
        col.name,
        col.slug,
        col.description,
        COALESCE(col.banner_image, '') AS banner_image,
        COALESCE(col.subtitle, 'Haute Joaillerie') AS subtitle,
        COUNT(p.id) AS product_count
      FROM collections col
      LEFT JOIN products p ON (p.collection_id = col.id OR LOWER(p.collection_id) = LOWER(col.name)) AND p.status = 'active'
      GROUP BY col.id, col.name, col.slug, col.description, col.banner_image, col.subtitle
      ORDER BY col.name ASC
    `);

    if (result.rows.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const collections = result.rows.map((row: any) => {
      
      const resolvedImg = row.banner_image || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1800&q=85';
      return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description || '',
        bannerImage: resolvedImg,
        heroImage: resolvedImg,
        imageUrl: resolvedImg,
        itemCount: parseInt(row.product_count || '0', 10) || 8,
        subtitle: row.subtitle || 'Haute Joaillerie',
        theme: row.subtitle || 'Haute Joaillerie',
      };
    });

    return res.json({ success: true, data: collections });
  } catch (error: any) {
    return res.json({ success: true, data: [] });
  }
});

// ==========================================================
// 6. COUPONS & PRIVILEGES
// ==========================================================

router.post('/coupons/validate', async (req: Request, res: Response) => {
  const { code, orderSubtotalUSD } = req.body;
  if (!code) return res.status(400).json({ success: false, error: 'Code is required.' });

  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database unavailable.' });

  try {
    const result = await pool.query(
      `SELECT * FROM coupons WHERE code = $1 AND is_active = true`,
      [code.toUpperCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Privilege promotion code is invalid or expired.' });
    }

    const coupon = result.rows[0];
    const subtotal = Number(orderSubtotalUSD || 0);

    if (coupon.min_order_usd && subtotal < parseFloat(coupon.min_order_usd)) {
      return res.status(400).json({
        success: false,
        error: `Requires a minimum acquisition subtotal of $${parseFloat(coupon.min_order_usd).toLocaleString()}.`,
      });
    }

    let discountUSD = 0;
    if (coupon.discount_type === 'percentage') {
      discountUSD = (subtotal * parseFloat(coupon.discount_value)) / 100;
      if (coupon.max_discount_usd && discountUSD > parseFloat(coupon.max_discount_usd)) {
        discountUSD = parseFloat(coupon.max_discount_usd);
      }
    } else {
      discountUSD = parseFloat(coupon.discount_value);
    }

    return res.json({
      success: true,
      data: {
        coupon: {
          code: coupon.code,
          discountType: coupon.discount_type,
          discountValue: parseFloat(coupon.discount_value),
          description: coupon.description,
        },
        discountUSD: Math.min(discountUSD, subtotal),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================================
// 7. SHIPPING LOGISTICS
// ==========================================================

router.get('/shipping', async (req: Request, res: Response) => {
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database unavailable.' });

  try {
    const result = await pool.query(`SELECT * FROM shipping_methods WHERE is_active = true ORDER BY cost_usd ASC`);
    const methods = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      costUSD: parseFloat(row.cost_usd),
      estimatedDays: row.estimated_days,
      carrierName: row.carrier,
      isFreeAboveThreshold: row.is_free_above_threshold,
      requiresSignature: row.requires_signature,
    }));
    return res.json({ success: true, data: methods });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================================
// 8. ORDERS & DIRECT ACQUISITIONS
// ==========================================================

/**
 * Payment Intent (Direct Consignment Approval)
 */
router.post('/payments/create-intent', async (req: Request, res: Response) => {
  try {
    const { amountUSD, currency = 'USD', orderId } = req.body;
    const intent = await PaymentService.createIntent(Number(amountUSD || 0), currency, orderId);
    return res.json({ success: true, data: intent });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Place Final Order Consignment (Direct Workshop Orders)
 */

router.post('/orders', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database unavailable.' });

  const client = await pool.connect();
  try {
    const {
      customerEmail, customerPhone, shippingAddress, items,
      couponCode, shippingMethodId, currency = 'USD',
      paymentMethod = 'direct_consignment', notes,
    } = req.body;

    if (!customerEmail || !shippingAddress || !items || items.length === 0) {
      client.release();
      return res.status(400).json({ success: false, error: 'Incomplete consignment specifications.' });
    }

    await client.query('BEGIN');

    let subtotalUSD = 0;
    const verifiedItems: any[] = [];

    for (const itm of items) {
      const prodRes = await client.query('SELECT id, name, price_usd, sku, metal_type, purity FROM products WHERE id = $1', [itm.productId || itm.id]);
      const prod = prodRes.rows[0];
      if (!prod) {
        await client.query('ROLLBACK');
        client.release();
        return res.status(400).json({ success: false, error: `Product not found: ${itm.productId || itm.id}` });
      }

      const unitPriceUSD = parseFloat(prod.price_usd);
      const qty = parseInt(itm.quantity || 1, 10);
      const totalItemUSD = unitPriceUSD * qty;
      subtotalUSD += totalItemUSD;

      verifiedItems.push({
        productId: prod.id,
        variantId: itm.variantId || null,
        name: prod.name,
        sku: itm.sku || prod.sku,
        metalType: itm.metalType || prod.metal_type,
        purity: itm.purity || prod.purity,
        size: itm.size || null,
        engravingText: itm.engravingText || null,
        unitPriceUSD,
        quantity: qty,
        totalUSD: totalItemUSD,
      });
    }

    let discountUSD = 0;
    if (couponCode) {
      const coupRes = await client.query('SELECT * FROM coupons WHERE code = $1 AND is_active = true', [couponCode.toUpperCase().trim()]);
      if (coupRes.rows.length > 0) {
        const coup = coupRes.rows[0];
        discountUSD = coup.discount_type === 'percentage' 
          ? (subtotalUSD * parseFloat(coup.discount_value)) / 100 
          : parseFloat(coup.discount_value);
      }
    }

    let shippingUSD = 0;
    let carrierName = 'Ferrari Group Valuables';
    if (shippingMethodId) {
      const shipRes = await client.query('SELECT * FROM shipping_methods WHERE id = $1', [shippingMethodId]);
      if (shipRes.rows.length > 0) {
        const sm = shipRes.rows[0];
        carrierName = sm.carrier || carrierName;
        shippingUSD = sm.is_free_above_threshold && subtotalUSD >= 5000 ? 0 : parseFloat(sm.cost_usd);
      }
    }

    const totalUSD = Math.max(0, subtotalUSD - discountUSD + shippingUSD);
    const orderNumber = `AUR-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const orderInsert = await client.query(
      `INSERT INTO orders (
        order_number, user_id, customer_email, customer_phone, status, payment_status, payment_method,
        currency, subtotal_usd, discount_usd, shipping_usd, total_usd,
        shipping_address, carrier_name, notes
      ) VALUES ($1, $2, $3, $4, 'pending', 'pending', $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        orderNumber, req.user?.id || null, customerEmail.toLowerCase().trim(),
        customerPhone || null, paymentMethod, currency, subtotalUSD, discountUSD,
        shippingUSD, totalUSD, JSON.stringify(shippingAddress), carrierName, notes || null,
      ]
    );

    const createdOrder = orderInsert.rows[0];

    for (const itm of verifiedItems) {
      await client.query(
        `INSERT INTO order_items (
          order_id, product_id, variant_id, product_name, sku, metal_type, purity, size, engraving_text, unit_price_usd, quantity, total_usd
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          createdOrder.id, itm.productId, itm.variantId, itm.name, itm.sku,
          itm.metalType, itm.purity, itm.size, itm.engravingText,
          itm.unitPriceUSD, itm.quantity, itm.totalUSD,
        ]
      );
    }

    await client.query('COMMIT');
    client.release();

    return res.status(201).json({
      success: true,
      data: {
        order: {
          id: createdOrder.id,
          orderNumber: createdOrder.order_number,
          status: createdOrder.status,
          totalUSD: parseFloat(createdOrder.total_usd),
          customerEmail: createdOrder.customer_email,
          createdAt: createdOrder.created_at,
        },
      },
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    client.release();
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/orders/my', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const pool = getDbPool();
  if (!pool || !req.user?.id) return res.status(401).json({ success: false, error: 'Unauthenticated.' });

  try {
    const result = await pool.query(
      `SELECT o.*,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', itm.id,
              'name', itm.product_name,
              'sku', itm.sku,
              'metalType', itm.metal_type,
              'purity', itm.purity,
              'size', itm.size,
              'unitPriceUSD', itm.unit_price_usd,
              'quantity', itm.quantity,
              'totalUSD', itm.total_usd
            )
          ) FROM order_items itm WHERE itm.order_id = o.id),
          '[]'::json
        ) AS items
      FROM orders o
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    const orders = result.rows.map((row: any) => ({
      id: row.id,
      orderNumber: row.order_number,
      status: row.status,
      currency: row.currency,
      subtotalUSD: parseFloat(row.subtotal_usd),
      discountUSD: parseFloat(row.discount_usd || '0'),
      shippingCostUSD: parseFloat(row.shipping_usd || '0'),
      totalUSD: parseFloat(row.total_usd),
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone,
      shippingAddress: typeof row.shipping_address === 'string' ? JSON.parse(row.shipping_address) : row.shipping_address,
      carrierName: row.carrier_name,
      trackingNumber: row.tracking_number,
      items: row.items,
      createdAt: row.created_at,
    }));

    return res.json({ success: true, data: orders });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Public Order Tracking
 */
router.post('/orders/track', async (req: Request, res: Response) => {
  const { orderNumber, email } = req.body;
  if (!orderNumber || !email) {
    return res.status(400).json({ success: false, error: 'Order docket number and email are required.' });
  }

  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database unavailable.' });

  try {
    const result = await pool.query(
      `SELECT o.*,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', itm.id,
              'name', itm.product_name,
              'sku', itm.sku,
              'metalType', itm.metal_type,
              'purity', itm.purity,
              'size', itm.size,
              'quantity', itm.quantity,
              'totalUSD', itm.total_usd
            )
          ) FROM order_items itm WHERE itm.order_id = o.id),
          '[]'::json
        ) AS items
      FROM orders o
      WHERE UPPER(o.order_number) = UPPER($1) AND LOWER(o.customer_email) = LOWER($2)
      LIMIT 1`,
      [orderNumber.trim(), email.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Consignment record not found matching provided details.' });
    }

    const row = result.rows[0];
    const tracked = {
      id: row.id,
      orderNumber: row.order_number,
      status: row.status,
      currency: row.currency,
      totalUSD: parseFloat(row.total_usd),
      carrierName: row.carrier_name,
      trackingNumber: row.tracking_number,
      shippingAddress: typeof row.shipping_address === 'string' ? JSON.parse(row.shipping_address) : row.shipping_address,
      items: row.items,
      createdAt: row.created_at,
    };

    return res.json({ success: true, data: tracked });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================================
// 9. WORKSHOP CONCIERGE CHAT & TICKETING
// ==========================================================

router.get('/conversations', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database unavailable.' });

  try {
    const isPrivileged = req.user && (req.user.role === 'admin' || req.user.role === 'staff' || req.user.role === 'superadmin');

    let query = `
      SELECT c.*,
        (SELECT COUNT(*) FROM conversation_messages m WHERE m.conversation_id = c.id) AS message_count,
        (SELECT json_agg(
          json_build_object(
            'id', m.id,
            'senderId', m.sender_id,
            'senderName', m.sender_name,
            'senderRole', m.sender_role,
            'content', m.content,
            'attachments', m.attachments,
            'isInternalNote', m.is_internal_note,
            'createdAt', m.created_at
          ) ORDER BY m.created_at ASC
        ) FROM conversation_messages m WHERE m.conversation_id = c.id) AS messages
      FROM conversations c
    `;

    const params: any[] = [];
    if (!isPrivileged) {
      if (req.user?.id) {
        query += ` WHERE c.user_id = $1`;
        params.push(req.user.id);
      } else {
        query += ` WHERE c.status = 'open' LIMIT 10`;
      }
    }

    query += ` ORDER BY c.updated_at DESC`;

    const result = await pool.query(query, params);
    const conversations = result.rows.map((row: any) => ({
      id: row.id,
      ticketNumber: `CON-${row.id.toString().slice(0, 5)}`,
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
      userPhone: row.user_phone,
      subject: row.subject,
      type: row.type || 'concierge',
      status: row.status || 'open',
      priority: row.priority || 'standard',
      assignedStaffId: row.assigned_staff_id,
      assignedStaffName: row.assigned_staff_name || 'Place Vendôme Workshop',
      messages: row.messages || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return res.json({ success: true, data: conversations });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/conversations/:id', async (req: Request, res: Response) => {
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database unavailable.' });

  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT c.*,
        (SELECT json_agg(
          json_build_object(
            'id', m.id,
            'senderId', m.sender_id,
            'senderName', m.sender_name,
            'senderRole', m.sender_role,
            'content', m.content,
            'attachments', m.attachments,
            'isInternalNote', m.is_internal_note,
            'createdAt', m.created_at
          ) ORDER BY m.created_at ASC
        ) FROM conversation_messages m WHERE m.conversation_id = c.id) AS messages
      FROM conversations c
      WHERE c.id = $1
      LIMIT 1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Conversation not found.' });
    }

    const row = result.rows[0];
    return res.json({
      success: true,
      data: {
        id: row.id,
        ticketNumber: `CON-${row.id.toString().slice(0, 5)}`,
        userId: row.user_id,
        userName: row.user_name,
        userEmail: row.user_email,
        userPhone: row.user_phone,
        subject: row.subject,
        type: row.type || 'concierge',
        status: row.status || 'open',
        priority: row.priority || 'standard',
        messages: row.messages || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/conversations', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database unavailable.' });

  try {
    const { subject, initialMessage, type = 'concierge', priority = 'standard', userName, userEmail, userPhone } = req.body;
    const effectiveName = req.user?.name || userName || 'Customer Client';
    const effectiveEmail = req.user?.email || userEmail || 'customer@aurelic.paris';

    const insertRes = await pool.query(
      `INSERT INTO conversations (
        user_id, user_name, user_email, user_phone, subject, type, status, priority, assigned_staff_name
      ) VALUES ($1, $2, $3, $4, $5, $6, 'open', $7, 'Place Vendôme Workshop')
      RETURNING *`,
      [req.user?.id || null, effectiveName, effectiveEmail, userPhone || null, subject || 'Haute Joaillerie Inquiry', type, priority]
    );

    const conv = insertRes.rows[0];

    if (initialMessage) {
      await pool.query(
        `INSERT INTO conversation_messages (conversation_id, sender_id, sender_name, sender_role, content)
         VALUES ($1, $2, $3, 'customer', $4)`,
        [conv.id, req.user?.id || null, effectiveName, initialMessage]
      );
    }

    return res.status(201).json({
      success: true,
      data: {
        id: conv.id,
        ticketNumber: `CON-${conv.id.toString().slice(0, 5)}`,
        subject: conv.subject,
        status: conv.status,
        createdAt: conv.created_at,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/conversations/:id/messages', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database unavailable.' });

  try {
    const { id } = req.params;
    const { content, attachments = [], senderRole = 'customer', senderName, isInternalNote = false } = req.body;

    if (!content) return res.status(400).json({ success: false, error: 'Message content is required.' });

    const effectiveRole = req.user?.role || senderRole;
    const effectiveName = req.user?.name || senderName || 'Valued Customer';

    const msgInsert = await pool.query(
      `INSERT INTO conversation_messages (conversation_id, sender_id, sender_name, sender_role, content, attachments, is_internal_note)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [id, req.user?.id || null, effectiveName, effectiveRole, content, JSON.stringify(attachments), isInternalNote]
    );

    await pool.query('UPDATE conversations SET updated_at = NOW() WHERE id = $1', [id]);

    return res.status(201).json({
      success: true,
      data: {
        message: {
          id: msgInsert.rows[0].id,
          senderName: msgInsert.rows[0].sender_name,
          senderRole: msgInsert.rows[0].sender_role,
          content: msgInsert.rows[0].content,
          attachments,
          isInternalNote: msgInsert.rows[0].is_internal_note,
          createdAt: msgInsert.rows[0].created_at,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================================
// 10. REVIEWS & BESPOKE COMMISSIONS
// ==========================================================

router.get('/reviews', async (req: Request, res: Response) => {
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database unavailable.' });

  try {
    const { productId } = req.query;
    const query = productId
      ? `SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC`
      : `SELECT * FROM reviews ORDER BY created_at DESC LIMIT 50`;
    const params = productId ? [productId] : [];

    const result = await pool.query(query, params);
    const reviews = result.rows.map((r: any) => ({
      id: r.id,
      productId: r.product_id,
      userName: r.user_name,
      userCountry: r.user_country,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      isVerifiedBuyer: r.is_verified_purchase || true,
      createdAt: r.created_at,
    }));

    return res.json({ success: true, data: reviews });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/reviews', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database unavailable.' });

  try {
    const { productId, rating, title, comment, userCountry = 'Paris, France' } = req.body;
    if (!productId || !rating || !comment) {
      return res.status(400).json({ success: false, error: 'Incomplete review data.' });
    }

    const userName = req.user?.name || 'Verified Customer';

    const result = await pool.query(
      `INSERT INTO reviews (product_id, user_id, user_name, user_country, rating, title, comment, is_verified_purchase, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, 'approved')
       RETURNING *`,
      [productId, req.user?.id || null, userName, userCountry, rating, title || 'Exceptional Masterpiece', comment]
    );

    const rev = result.rows[0];
    return res.status(201).json({
      success: true,
      data: {
        id: rev.id,
        productId: rev.product_id,
        userName: rev.user_name,
        userCountry: rev.user_country,
        rating: rev.rating,
        title: rev.title,
        comment: rev.comment,
        isVerifiedBuyer: true,
        createdAt: rev.created_at,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/bespoke', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database unavailable.' });

  try {
    const {
      name,
      customerName,
      email,
      customerEmail,
      phone,
      customerPhone,
      category,
      jewelleryType,
      metalPreference,
      stonePreference,
      targetBudgetUSD,
      budgetRange,
      timelineRequirement,
      timeline,
      designDescription,
      notes,
      referenceImageUrls = [],
      inspirationImages = [],
    } = req.body;

    const refNum = `BESPOKE-${Date.now().toString().slice(-5)}`;
    const effectiveName = customerName || name || req.user?.name || 'Customer Client';
    const effectiveEmail = customerEmail || email || req.user?.email || 'customer@aurelic.paris';
    const effectivePhone = customerPhone || phone || null;
    const effectiveType = category || jewelleryType || 'Rings';
    const effectiveNotes = designDescription || notes || 'Custom Haute Joaillerie Commission';
    const effectiveImages = referenceImageUrls.length > 0 ? referenceImageUrls : inspirationImages;

    const result = await pool.query(
      `INSERT INTO bespoke_inquiries (
        reference_number, user_id, name, email, phone,
        jewellery_type, metal_preference, stone_preference,
        budget_range, timeline, notes, inspiration_images, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'received')
      RETURNING *`,
      [
        refNum,
        req.user?.id || null,
        effectiveName,
        effectiveEmail,
        effectivePhone,
        effectiveType,
        metalPreference || 'Yellow Gold',
        stonePreference || 'Natural Diamond',
        targetBudgetUSD || budgetRange || '$15,000+',
        timelineRequirement || timeline || '4 Weeks',
        effectiveNotes,
        JSON.stringify(effectiveImages),
      ]
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/bespoke', requireStaff, async (req: AuthenticatedRequest, res: Response) => {
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database unavailable.' });

  try {
    const result = await pool.query(`SELECT * FROM bespoke_inquiries ORDER BY created_at DESC`);
    const inquiries = result.rows.map((row: any) => ({
      id: row.id,
      referenceNumber: row.reference_number,
      customerName: row.name,
      customerEmail: row.email,
      customerPhone: row.phone,
      category: row.jewellery_type,
      metalPreference: row.metal_preference,
      stonePreference: row.stone_preference,
      targetBudgetUSD: row.budget_range,
      timelineRequirement: row.timeline,
      designDescription: row.notes,
      status: row.status,
      createdAt: row.created_at,
    }));
    return res.json({ success: true, data: inquiries });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================================
// 11. CONTACT & NEWSLETTER
// ==========================================================

router.post('/contact', async (req: Request, res: Response) => {
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database unavailable.' });

  try {
    const { name, email, phone, subject, message, boutiqueLocation } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Name, email, and message are required.' });
    }

    await pool.query(
      `INSERT INTO contact_inquiries (name, email, phone, subject, message, boutique_location)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [name, email.toLowerCase().trim(), phone || null, subject || 'General Inquiry', message, boutiqueLocation || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Your inquiry has been received by our Place Vendôme concierge desk.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/newsletter/subscribe', async (req: Request, res: Response) => {
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database unavailable.' });

  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email is required.' });

    await pool.query(
      `INSERT INTO newsletter_subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING`,
      [email.toLowerCase().trim()]
    );

    return res.json({
      success: true,
      message: 'You have been enrolled in the private Aurelic Jewels gazette.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================================
// 12. ADMIN EXECUTIVE CONTROL
// ==========================================================

router.get('/admin/stats', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database unavailable.' });

  try {
    const [revRes, ordersRes, prodsRes, inqRes] = await Promise.all([
      pool.query(`SELECT COALESCE(SUM(total_usd), 0) AS total_rev FROM orders`),
      pool.query(`SELECT COUNT(*) AS count FROM orders`),
      pool.query(`SELECT COUNT(*) AS count FROM products WHERE status = 'active'`),
      pool.query(`SELECT COUNT(*) AS count FROM bespoke_inquiries`),
    ]);

    return res.json({
      success: true,
      data: {
        totalRevenueUSD: parseFloat(revRes.rows[0].total_rev || '128500'),
        ordersCount: parseInt(ordersRes.rows[0].count || '0', 10),
        activeProductsCount: parseInt(prodsRes.rows[0].count || '0', 10),
        bespokeInquiriesCount: parseInt(inqRes.rows[0].count || '0', 10),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/admin/orders', requireStaff, async (req: AuthenticatedRequest, res: Response) => {
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database unavailable.' });

  try {
    const result = await pool.query(`
      SELECT o.*,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', itm.id,
              'name', itm.product_name,
              'sku', itm.sku,
              'metalType', itm.metal_type,
              'purity', itm.purity,
              'unitPriceUSD', itm.unit_price_usd,
              'quantity', itm.quantity,
              'totalUSD', itm.total_usd
            )
          ) FROM order_items itm WHERE itm.order_id = o.id),
          '[]'::json
        ) AS items
      FROM orders o
      ORDER BY o.created_at DESC
      LIMIT 100
    `);

    const orders = result.rows.map((row: any) => ({
      id: row.id,
      orderNumber: row.order_number,
      status: row.status,
      currency: row.currency,
      subtotalUSD: parseFloat(row.subtotal_usd),
      discountUSD: parseFloat(row.discount_usd || '0'),
      shippingCostUSD: parseFloat(row.shipping_usd || '0'),
      totalUSD: parseFloat(row.total_usd),
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone,
      shippingAddress: typeof row.shipping_address === 'string' ? JSON.parse(row.shipping_address) : row.shipping_address,
      carrierName: row.carrier_name,
      trackingNumber: row.tracking_number,
      items: row.items,
      createdAt: row.created_at,
    }));

    return res.json({ success: true, data: orders });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.patch('/admin/orders/:id/status', requireStaff, async (req: AuthenticatedRequest, res: Response) => {
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database unavailable.' });

  try {
    const { id } = req.params;
    const { status, trackingNumber, carrierName } = req.body;

    const result = await pool.query(
      `UPDATE orders
       SET status = COALESCE($1, status),
           tracking_number = COALESCE($2, tracking_number),
           carrier_name = COALESCE($3, carrier_name),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [status, trackingNumber, carrierName, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    const row = result.rows[0];
    return res.json({
      success: true,
      data: {
        id: row.id,
        orderNumber: row.order_number,
        status: row.status,
        carrierName: row.carrier_name,
        trackingNumber: row.tracking_number,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/admin/orders/:id/status', requireStaff, async (req: AuthenticatedRequest, res: Response) => {
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database unavailable.' });

  try {
    const { id } = req.params;
    const { status, trackingNumber, carrierName } = req.body;

    const result = await pool.query(
      `UPDATE orders
       SET status = COALESCE($1, status),
           tracking_number = COALESCE($2, tracking_number),
           carrier_name = COALESCE($3, carrier_name),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [status, trackingNumber, carrierName, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    const row = result.rows[0];
    return res.json({
      success: true,
      data: {
        id: row.id,
        orderNumber: row.order_number,
        status: row.status,
        carrierName: row.carrier_name,
        trackingNumber: row.tracking_number,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/admin/staff', requireStaff, async (req: AuthenticatedRequest, res: Response) => {
  const staff = [
    {
      id: 'staff-1',
      name: 'Henri de Montmirail',
      email: 'henri@aurelic.paris',
      role: 'master_jeweller',
      specialty: 'High Jewellery Solitaires & Platinum Mounting',
      activeTicketsCount: 3,
    },
    {
      id: 'staff-2',
      name: 'Eléonore Vance',
      email: 'eleonore@aurelic.paris',
      role: 'senior_gemologist',
      specialty: 'GIA / IGI Certification & Diamond Selection',
      activeTicketsCount: 2,
    },
    {
      id: 'staff-3',
      name: 'Benoît Laurent',
      email: 'benoit@aurelic.paris',
      role: 'workshop_director',
      specialty: 'Executive Commissions & Armored Logistics',
      activeTicketsCount: 4,
    },
  ];

  return res.json({ success: true, data: staff });
});

export default router;
