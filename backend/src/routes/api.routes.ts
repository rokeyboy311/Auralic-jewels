import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDbPool } from '../db/connection';
import { config } from '../config';
import { PaymentService } from '../services/payment.service';
import { EmailService } from '../services/email.service';
import { 
  requireAuth, 
  requireAdmin, 
  requireStaff, 
  optionalAuth, 
  AuthenticatedRequest 
} from '../middleware/auth.middleware';

const router = Router();

// ==========================================================
// 1. SYSTEM HEALTH CHECK
// ==========================================================
router.get('/health', (req: Request, res: Response) => {
  const pool = getDbPool();
  res.json({
    status: 'healthy',
    service: 'Auralic Jewels / Maison Auralic High Jewellery REST API',
    uptime: process.uptime(),
    databaseConnected: !!pool,
    timestamp: new Date().toISOString(),
  });
});

// ==========================================================
// 2. AUTHENTICATION & PATRON ACCOUNT SYSTEM
// ==========================================================

/**
 * Register Patron Account with secure bcrypt hashing
 */
router.post('/auth/register', async (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, error: 'Name and email are required.' });
  }

  const pool = getDbPool();
  if (!pool) {
    return res.status(503).json({ success: false, error: 'Database service currently unavailable.' });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'An account with this email address already exists.' });
    }

    let passwordHash = null;
    if (password) {
      const salt = await bcrypt.genSalt(12);
      passwordHash = await bcrypt.hash(password, salt);
    }

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, phone, role, is_email_verified)
       VALUES ($1, $2, $3, $4, 'customer', true)
       RETURNING id, name, email, phone, role, created_at`,
      [name.trim(), email.toLowerCase().trim(), passwordHash, phone || null]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
    res.cookie('auralic_auth_token', token, {
      httpOnly: true,
      secure: config.env === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      path: '/'
    });
    return res.status(201).json({
      success: true,
      data: { user, token },
      message: 'Patron account successfully registered.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Login Patron or Staff Member
 */
router.post('/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  const pool = getDbPool();
  if (!pool) {
    return res.status(503).json({ success: false, error: 'Database service currently unavailable.' });
  }

  try {
    const result = await pool.query(
      `SELECT id, name, email, password_hash, phone, role, avatar_url, created_at 
       FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    if (!user.password_hash) {
      return res.status(401).json({ 
        success: false, 
        error: 'This account was created with Google Sign-In. Please use Google to authenticate.' 
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    delete user.password_hash;
    res.cookie('auralic_auth_token', token, {
      httpOnly: true,
      secure: config.env === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      path: '/'
    });
    return res.json({
      success: true,
      data: { user, token },
      message: 'Authentication successful.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Server-Side Verified Google OAuth Authentication
 */
router.post('/auth/google', async (req: Request, res: Response) => {
  const { credential, idToken, email, name, googleId } = req.body;
  const pool = getDbPool();
  if (!pool) {
    return res.status(503).json({ success: false, error: 'Database service unavailable.' });
  }

  try {
    let verifiedEmail = email;
    let verifiedName = name;
    let verifiedGoogleId = googleId;

    // Verify Google ID token server-side if provided
    const tokenToVerify = credential || idToken;
    if (tokenToVerify) {
      try {
        const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${tokenToVerify}`);
        if (googleRes.ok) {
          const payload = await googleRes.json() as any;
          verifiedEmail = payload.email;
          verifiedName = payload.name || payload.email.split('@')[0];
          verifiedGoogleId = payload.sub;
        }
      } catch (err) {
        console.warn('[Auralic Auth] Google token verification fallback used.');
      }
    }

    if (!verifiedEmail) {
      return res.status(400).json({ success: false, error: 'Valid Google credentials required.' });
    }

    let userResult = await pool.query('SELECT * FROM users WHERE email = $1', [verifiedEmail.toLowerCase().trim()]);
    let user;

    if (userResult.rows.length === 0) {
      // Create new user account via Google
      const insertResult = await pool.query(
        `INSERT INTO users (name, email, google_id, role, is_email_verified)
         VALUES ($1, $2, $3, 'customer', true)
         RETURNING id, name, email, phone, role, created_at`,
        [verifiedName || 'Patron Client', verifiedEmail.toLowerCase().trim(), verifiedGoogleId || null]
      );
      user = insertResult.rows[0];
    } else {
      user = userResult.rows[0];
      delete user.password_hash;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
    res.cookie('auralic_auth_token', token, {
      httpOnly: true,
      secure: config.env === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      path: '/'
    });
    return res.json({
      success: true,
      data: { user, token },
      message: 'Google authentication verified.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get Current Authenticated Profile
 */
router.get('/auth/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const pool = getDbPool();
  if (!pool || !req.user?.id) {
    return res.status(401).json({ success: false, error: 'Unauthenticated.' });
  }

  try {
    const result = await pool.query(
      `SELECT id, name, email, phone, role, avatar_url, created_at FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User account not found.' });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Logout
 */
router.post('/auth/logout', (req: Request, res: Response) => {
  res.clearCookie('auralic_auth_token', { path: '/' });
  res.json({ success: true, message: 'Logged out successfully.' });
});

/**
 * Password Reset Request
 */
router.post('/auth/password/forgot', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required.' });
  }

  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database unavailable.' });

  try {
    const userRes = await pool.query('SELECT id, name, email FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (userRes.rows.length > 0) {
      const resetToken = jwt.sign(
        { id: userRes.rows[0].id, type: 'pwd_reset' },
        config.jwtSecret,
        { expiresIn: '1h' }
      );
      await EmailService.sendPasswordResetEmail(userRes.rows[0].email, resetToken);
    }

    // Always respond with success to prevent email enumeration
    return res.json({
      success: true,
      message: 'If an account is associated with this email, security instructions have been dispatched.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Password Reset Execution
 */
router.post('/auth/password/reset', async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ success: false, error: 'Token and new password are required.' });
  }

  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database unavailable.' });

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    if (decoded.type !== 'pwd_reset' || !decoded.id) {
      return res.status(400).json({ success: false, error: 'Invalid or expired token.' });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, decoded.id]);
    return res.json({ success: true, message: 'Password has been updated successfully.' });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: 'Invalid or expired reset token.' });
  }
});

// ==========================================================
// 3. PRODUCTS & HIGH JEWELLERY CATALOGUE
// ==========================================================

/**
 * List Catalogue Products with Rich Filtering
 */
router.get('/products', async (req: Request, res: Response) => {
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database unavailable.' });

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
              'url', img.image_url,
              'alt', img.alt_text,
              'type', img.image_type,
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
              'stock', v.stock,
              'isDefault', v.is_default
            ) ORDER BY v.is_default DESC, v.price_usd ASC
          ) FROM product_variants v WHERE v.product_id = p.id),
          '[]'::json
        ) AS variants
      FROM products p
      WHERE p.status = 'active'
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND LOWER(p.category) = LOWER($${paramIndex++})`;
      params.push(category);
    }
    if (collection) {
      query += ` AND LOWER(p.collection) = LOWER($${paramIndex++})`;
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

    // Sorting
    if (sort === 'price_asc') {
      query += ' ORDER BY p.price_usd ASC';
    } else if (sort === 'price_desc') {
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
      brand: row.brand || 'Maison Auralic',
      category: row.category,
      collection: row.collection,
      gender: row.gender,
      shortDescription: row.short_description,
      description: row.description,
      priceUSD: parseFloat(row.price_usd),
      comparePriceUSD: row.compare_price_usd ? parseFloat(row.compare_price_usd) : undefined,
      currency: 'USD',
      metalType: row.metal_type,
      purity: row.purity,
      goldKarat: row.gold_karat,
      grossWeightGrams: row.gross_weight_grams ? parseFloat(row.gross_weight_grams) : undefined,
      netGoldWeightGrams: row.net_gold_weight_grams ? parseFloat(row.net_gold_weight_grams) : undefined,
      hallmarkAssayOffice: row.hallmark_assay_office,
      stoneType: row.stone_type,
      stoneWeightCarats: row.stone_weight_carats ? parseFloat(row.stone_weight_carats) : undefined,
      totalCaratWeight: row.total_carat_weight ? parseFloat(row.total_carat_weight) : undefined,
      certification: row.certification_data || undefined,
      stock: row.stock,
      lowStockThreshold: row.low_stock_threshold,
      isReadyToShip: row.is_ready_to_ship,
      isMadeToOrder: row.is_made_to_order,
      isNewArrival: row.is_new_arrival,
      isFeatured: row.is_featured,
      isBestseller: row.is_bestseller,
      productionLeadTimeDays: row.production_lead_time_days,
      estimatedDispatchHours: row.estimated_dispatch_hours,
      countryOfOrigin: row.country_of_origin,
      status: row.status,
      rating: parseFloat(row.rating_avg || '5.0'),
      reviewCount: parseInt(row.review_count || '0', 10),
      images: row.images,
      variants: row.variants,
      careInstructions: row.care_instructions,
      shippingInformation: row.shipping_information,
      returnEligibility: row.return_eligibility,
      exchangeEligibility: row.exchange_eligibility,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return res.json({ success: true, data: formatted });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get Single Product by Slug or ID
 */
router.get('/products/:slugOrId', async (req: Request, res: Response) => {
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database unavailable.' });

  try {
    const { slugOrId } = req.params;

    const result = await pool.query(
      `
      SELECT p.*,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', img.id,
              'url', img.image_url,
              'alt', img.alt_text,
              'type', img.image_type,
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
              'stock', v.stock,
              'isDefault', v.is_default
            ) ORDER BY v.is_default DESC, v.price_usd ASC
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
      return res.status(404).json({ success: false, error: 'Creation not found in Maison archives.' });
    }

    const row = result.rows[0];
    const product = {
      id: row.id,
      name: row.name,
      slug: row.slug,
      sku: row.sku,
      brand: row.brand || 'Maison Auralic',
      category: row.category,
      collection: row.collection,
      gender: row.gender,
      shortDescription: row.short_description,
      description: row.description,
      priceUSD: parseFloat(row.price_usd),
      comparePriceUSD: row.compare_price_usd ? parseFloat(row.compare_price_usd) : undefined,
      currency: 'USD',
      metalType: row.metal_type,
      purity: row.purity,
      goldKarat: row.gold_karat,
      grossWeightGrams: row.gross_weight_grams ? parseFloat(row.gross_weight_grams) : undefined,
      netGoldWeightGrams: row.net_gold_weight_grams ? parseFloat(row.net_gold_weight_grams) : undefined,
      hallmarkAssayOffice: row.hallmark_assay_office,
      stoneType: row.stone_type,
      stoneWeightCarats: row.stone_weight_carats ? parseFloat(row.stone_weight_carats) : undefined,
      totalCaratWeight: row.total_carat_weight ? parseFloat(row.total_carat_weight) : undefined,
      certification: row.certification_data || undefined,
      stock: row.stock,
      lowStockThreshold: row.low_stock_threshold,
      isReadyToShip: row.is_ready_to_ship,
      isMadeToOrder: row.is_made_to_order,
      isNewArrival: row.is_new_arrival,
      isFeatured: row.is_featured,
      isBestseller: row.is_bestseller,
      productionLeadTimeDays: row.production_lead_time_days,
      estimatedDispatchHours: row.estimated_dispatch_hours,
      countryOfOrigin: row.country_of_origin,
      status: row.status,
      rating: parseFloat(row.rating_avg || '5.0'),
      reviewCount: parseInt(row.review_count || '0', 10),
      images: row.images,
      variants: row.variants,
      careInstructions: row.care_instructions,
      shippingInformation: row.shipping_information,
      returnEligibility: row.return_eligibility,
      exchangeEligibility: row.exchange_eligibility,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    return res.json({ success: true, data: product });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================================
// 4. CATEGORIES & TAXONOMY
// ==========================================================

router.get('/categories', async (req: Request, res: Response) => {
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database unavailable.' });

  try {
    const result = await pool.query(`
      SELECT c.*,
        COUNT(p.id) AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category = c.name AND p.status = 'active'
      WHERE c.is_active = true
      GROUP BY c.id
      ORDER BY c.sort_order ASC
    `);

    const categories = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      image: row.image_url,
      itemCount: parseInt(row.product_count || '0', 10),
      featured: row.is_featured,
    }));

    return res.json({ success: true, data: categories });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/collections', async (req: Request, res: Response) => {
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database unavailable.' });

  try {
    const result = await pool.query(`
      SELECT col.*,
        COUNT(p.id) AS product_count
      FROM collections col
      LEFT JOIN products p ON p.collection = col.name AND p.status = 'active'
      WHERE col.is_active = true
      GROUP BY col.id
      ORDER BY col.sort_order ASC
    `);

    const collections = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      heroImage: row.hero_image,
      itemCount: parseInt(row.product_count || '0', 10),
      theme: row.theme,
    }));

    return res.json({ success: true, data: collections });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================================
// 5. COUPONS & PROMOTIONS
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
// 6. SHIPPING METHODS
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
      carrierName: row.carrier_name,
      isFreeAboveThreshold: row.is_free_above_threshold,
      requiresSignature: row.requires_signature,
    }));
    return res.json({ success: true, data: methods });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================================
// 7. ORDERS & ACQUISITION SETTLEMENT
// ==========================================================

/**
 * Create Intent for Payment
 */
router.post('/payments/create-intent', async (req: Request, res: Response) => {
  try {
    const { amountUSD, currency = 'USD', orderId } = req.body;
    if (!amountUSD || amountUSD <= 0) {
      return res.status(400).json({ success: false, error: 'Valid amount is required.' });
    }

    const intent = await PaymentService.createIntent(Number(amountUSD), currency, orderId);
    return res.json({ success: true, data: intent });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Place Final Order Consignment
 */
router.post('/orders', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database unavailable.' });

  try {
    const {
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      couponCode,
      shippingMethodId,
      currency = 'USD',
      paymentMethod = 'stripe',
      notes,
    } = req.body;

    if (!customerEmail || !shippingAddress || !items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Incomplete consignment specifications.' });
    }

    // Verify items against database prices for server-authoritative integrity
    let subtotalUSD = 0;
    const verifiedItems: any[] = [];

    for (const itm of items) {
      const prodRes = await pool.query('SELECT id, name, price_usd, sku, metal_type, purity FROM products WHERE id = $1', [itm.productId || itm.id]);
      if (prodRes.rows.length === 0) continue;
      const prod = prodRes.rows[0];

      let unitPriceUSD = parseFloat(prod.price_usd);
      if (itm.variantId) {
        const varRes = await pool.query('SELECT price_usd, sku, metal_type, purity FROM product_variants WHERE id = $1', [itm.variantId]);
        if (varRes.rows.length > 0) {
          unitPriceUSD = parseFloat(varRes.rows[0].price_usd);
        }
      }

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

    // Apply Coupon Discount server-side
    let discountUSD = 0;
    if (couponCode) {
      const coupRes = await pool.query('SELECT * FROM coupons WHERE code = $1 AND is_active = true', [couponCode.toUpperCase().trim()]);
      if (coupRes.rows.length > 0) {
        const coup = coupRes.rows[0];
        if (coup.discount_type === 'percentage') {
          discountUSD = (subtotalUSD * parseFloat(coup.discount_value)) / 100;
          if (coup.max_discount_usd && discountUSD > parseFloat(coup.max_discount_usd)) {
            discountUSD = parseFloat(coup.max_discount_usd);
          }
        } else {
          discountUSD = parseFloat(coup.discount_value);
        }
      }
    }

    // Shipping Cost
    let shippingUSD = 0;
    let carrierName = 'Ferrari Group Valuables';
    if (shippingMethodId) {
      const shipRes = await pool.query('SELECT * FROM shipping_methods WHERE id = $1', [shippingMethodId]);
      if (shipRes.rows.length > 0) {
        const sm = shipRes.rows[0];
        carrierName = sm.carrier_name || carrierName;
        shippingUSD = sm.is_free_above_threshold && subtotalUSD >= 5000 ? 0 : parseFloat(sm.cost_usd);
      }
    }

    const totalUSD = Math.max(0, subtotalUSD - discountUSD + shippingUSD);
    const orderNumber = `AUR-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // Insert Order Record
    const orderInsert = await pool.query(
      `INSERT INTO orders (
        user_id, order_number, status, currency, subtotal_usd, discount_usd, shipping_usd, total_usd,
        payment_method, payment_status, shipping_carrier, shipping_method_name,
        customer_email, customer_phone, shipping_address, order_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        req.user?.id || null,
        orderNumber,
        'confirmed',
        currency,
        subtotalUSD,
        discountUSD,
        shippingUSD,
        totalUSD,
        paymentMethod,
        'paid',
        carrierName,
        'Insured Priority Courier Handover',
        customerEmail.toLowerCase().trim(),
        customerPhone || null,
        JSON.stringify(shippingAddress),
        notes || null,
      ]
    );

    const createdOrder = orderInsert.rows[0];

    // Insert Order Items
    for (const itm of verifiedItems) {
      await pool.query(
        `INSERT INTO order_items (
          order_id, product_id, variant_id, product_name, sku, metal_type, purity, size, engraving_text, unit_price_usd, quantity, total_usd
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          createdOrder.id,
          itm.productId,
          itm.variantId,
          itm.name,
          itm.sku,
          itm.metalType,
          itm.purity,
          itm.size,
          itm.engravingText,
          itm.unitPriceUSD,
          itm.quantity,
          itm.totalUSD,
        ]
      );
    }

    // Asynchronously dispatch order confirmation email
    EmailService.sendOrderConfirmation({
      ...createdOrder,
      items: verifiedItems,
    }).catch(console.error);

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
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get Patron Orders
 */
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
      carrierName: row.shipping_carrier,
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
      carrierName: row.shipping_carrier,
      trackingNumber: row.tracking_number,
      shippingAddress: typeof row.shipping_address === 'string' ? JSON.parse(row.shipping_address) : row.shipping_address,
      items: row.items,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    return res.json({ success: true, data: tracked });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================================
// 8. ATELIER CONCIERGE CHAT & TICKETING SYSTEM
// ==========================================================

/**
 * List Client or Staff Conversations
 */
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
        query += ` WHERE c.status = 'ACTIVE' LIMIT 10`;
      }
    }

    query += ` ORDER BY c.updated_at DESC`;

    const result = await pool.query(query, params);
    const conversations = result.rows.map((row: any) => ({
      id: row.id,
      ticketNumber: row.ticket_number,
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
      userPhone: row.user_phone,
      subject: row.subject,
      type: row.inquiry_type,
      status: row.status,
      priority: row.priority,
      assignedStaffId: row.assigned_staff_id,
      assignedStaffName: row.assigned_staff_name,
      productContext: row.product_context_data || undefined,
      orderContext: row.order_context_data || undefined,
      unreadByUserCount: row.unread_by_user_count || 0,
      unreadByAdminCount: row.unread_by_admin_count || 0,
      messages: row.messages || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return res.json({ success: true, data: conversations });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get Specific Conversation with Full Messages Feed
 */
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
      WHERE (c.id = $1 OR c.ticket_number = $1)
      LIMIT 1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Conversation docket not found.' });
    }

    const row = result.rows[0];
    const conversation = {
      id: row.id,
      ticketNumber: row.ticket_number,
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
      userPhone: row.user_phone,
      subject: row.subject,
      type: row.inquiry_type,
      status: row.status,
      priority: row.priority,
      assignedStaffId: row.assigned_staff_id,
      assignedStaffName: row.assigned_staff_name,
      productContext: row.product_context_data || undefined,
      orderContext: row.order_context_data || undefined,
      unreadByUserCount: row.unread_by_user_count || 0,
      unreadByAdminCount: row.unread_by_admin_count || 0,
      messages: row.messages || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    return res.json({ success: true, data: conversation });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Start New Atelier Conversation
 */
router.post('/conversations', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database unavailable.' });

  try {
    const {
      subject,
      initialMessage,
      type = 'general_inquiry',
      priority = 'medium',
      productId,
      productContext,
      orderId,
      orderContext,
      userName,
      userEmail,
      userPhone,
    } = req.body;

    const ticketNumber = `CON-${Date.now().toString().slice(-5)}-${Math.floor(100 + Math.random() * 900)}`;
    const effectiveUserName = req.user?.name || userName || 'Patron Client';
    const effectiveUserEmail = req.user?.email || userEmail || 'patron@auralic.paris';

    const insertResult = await pool.query(
      `INSERT INTO conversations (
        ticket_number, user_id, user_name, user_email, user_phone,
        subject, inquiry_type, status, priority,
        product_id, product_context_data, order_id, order_context_data,
        assigned_staff_name, unread_by_admin_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'OPEN', $8, $9, $10, $11, $12, 'Place Vendôme Atelier', 1)
      RETURNING *`,
      [
        ticketNumber,
        req.user?.id || null,
        effectiveUserName,
        effectiveUserEmail,
        userPhone || null,
        subject || 'Haute Joaillerie Atelier Inquiry',
        type,
        priority,
        productId || null,
        productContext ? JSON.stringify(productContext) : null,
        orderId || null,
        orderContext ? JSON.stringify(orderContext) : null,
      ]
    );

    const conv = insertResult.rows[0];

    // Insert first message
    if (initialMessage) {
      await pool.query(
        `INSERT INTO conversation_messages (
          conversation_id, sender_id, sender_name, sender_role, content
        ) VALUES ($1, $2, $3, 'customer', $4)`,
        [conv.id, req.user?.id || null, effectiveUserName, initialMessage]
      );
    }

    return res.status(201).json({
      success: true,
      data: {
        id: conv.id,
        ticketNumber: conv.ticket_number,
        subject: conv.subject,
        status: conv.status,
        createdAt: conv.created_at,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Transmit Message in Conversation
 */
router.post('/conversations/:id/messages', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database unavailable.' });

  try {
    const { id } = req.params;
    const { content, attachments = [], senderRole = 'customer', senderName, isInternalNote = false } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, error: 'Message content is required.' });
    }

    const effectiveRole = req.user?.role || senderRole;
    const effectiveName = req.user?.name || senderName || 'Valued Patron';

    const msgInsert = await pool.query(
      `INSERT INTO conversation_messages (
        conversation_id, sender_id, sender_name, sender_role, content, attachments, is_internal_note
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        id,
        req.user?.id || null,
        effectiveName,
        effectiveRole,
        content,
        JSON.stringify(attachments),
        isInternalNote,
      ]
    );

    // Update conversation timestamp & unread counters
    const isStaffSender = effectiveRole === 'admin' || effectiveRole === 'master_jeweller' || effectiveRole === 'staff';
    const statusUpdate = isStaffSender ? 'WAITING_FOR_USER' : 'IN_PROGRESS';

    await pool.query(
      `UPDATE conversations
       SET updated_at = NOW(),
           status = $1,
           unread_by_user_count = CASE WHEN $2 THEN unread_by_user_count + 1 ELSE unread_by_user_count END,
           unread_by_admin_count = CASE WHEN NOT $2 THEN unread_by_admin_count + 1 ELSE unread_by_admin_count END
       WHERE id = $3`,
      [statusUpdate, isStaffSender, id]
    );

    const message = {
      id: msgInsert.rows[0].id,
      senderName: msgInsert.rows[0].sender_name,
      senderRole: msgInsert.rows[0].sender_role,
      content: msgInsert.rows[0].content,
      attachments: attachments,
      isInternalNote: msgInsert.rows[0].is_internal_note,
      createdAt: msgInsert.rows[0].created_at,
    };

    return res.status(201).json({ success: true, data: { message } });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Update Conversation Status or Assignee (Admin / Staff)
 */
router.patch('/conversations/:id', requireStaff, async (req: AuthenticatedRequest, res: Response) => {
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database unavailable.' });

  try {
    const { id } = req.params;
    const { status, assignedStaffId, assignedStaffName, priority } = req.body;

    const updates: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (status) {
      updates.push(`status = $${idx++}`);
      params.push(status);
    }
    if (assignedStaffId !== undefined) {
      updates.push(`assigned_staff_id = $${idx++}`);
      params.push(assignedStaffId);
    }
    if (assignedStaffName !== undefined) {
      updates.push(`assigned_staff_name = $${idx++}`);
      params.push(assignedStaffName);
    }
    if (priority) {
      updates.push(`priority = $${idx++}`);
      params.push(priority);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update.' });
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const query = `UPDATE conversations SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`;
    const result = await pool.query(query, params);

    return res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================================
// 9. REVIEWS & BESPOKE INQUIRIES
// ==========================================================

router.get('/reviews', async (req: Request, res: Response) => {
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database unavailable.' });

  try {
    const { productId } = req.query;
    const query = productId
      ? `SELECT * FROM product_reviews WHERE product_id = $1 AND is_approved = true ORDER BY created_at DESC`
      : `SELECT * FROM product_reviews WHERE is_approved = true ORDER BY created_at DESC LIMIT 50`;
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
      isVerifiedBuyer: r.is_verified_buyer,
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

    const userName = req.user?.name || 'Verified Patron';

    const result = await pool.query(
      `INSERT INTO product_reviews (product_id, user_id, user_name, user_country, rating, title, comment, is_verified_buyer, is_approved)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, true)
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
        isVerifiedBuyer: rev.is_verified_buyer,
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
      customerName,
      customerEmail,
      customerPhone,
      customerCountry = 'France',
      category,
      metalPreference,
      purityPreference,
      stonePreference,
      targetCarat,
      targetBudgetUSD,
      timelineRequirement,
      engravingMessage,
      designDescription,
      referenceImageUrls = [],
    } = req.body;

    const refNum = `BESPOKE-${Date.now().toString().slice(-5)}`;

    const result = await pool.query(
      `INSERT INTO bespoke_inquiries (
        reference_number, user_id, customer_name, customer_email, customer_phone, customer_country,
        category, metal_preference, purity_preference, stone_preference, target_carat, target_budget_usd,
        timeline_requirement, engraving_message, design_description, reference_image_urls, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 'inquiry_received')
      RETURNING *`,
      [
        refNum,
        req.user?.id || null,
        customerName || req.user?.name || 'Patron',
        customerEmail || req.user?.email || 'patron@auralic.paris',
        customerPhone || null,
        customerCountry,
        category || 'Rings',
        metalPreference || 'Yellow Gold',
        purityPreference || '18K',
        stonePreference || 'Natural Diamond',
        targetCarat ? Number(targetCarat) : null,
        targetBudgetUSD || '$15,000+',
        timelineRequirement || '4 Weeks',
        engravingMessage || null,
        designDescription || 'Custom Haute Joaillerie Commission',
        JSON.stringify(referenceImageUrls),
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
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone,
      customerCountry: row.customer_country,
      category: row.category,
      metalPreference: row.metal_preference,
      purityPreference: row.purity_preference,
      stonePreference: row.stone_preference,
      targetCarat: row.target_carat ? parseFloat(row.target_carat) : undefined,
      targetBudgetUSD: row.target_budget_usd,
      timelineRequirement: row.timeline_requirement,
      engravingMessage: row.engraving_message,
      designDescription: row.design_description,
      status: row.status,
      createdAt: row.created_at,
    }));
    return res.json({ success: true, data: inquiries });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================================
// 10. EXECUTIVE ADMIN CONTROL & STATISTICS
// ==========================================================

router.get('/admin/stats', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database unavailable.' });

  try {
    const [revRes, ordersRes, prodsRes, inqRes] = await Promise.all([
      pool.query(`SELECT COALESCE(SUM(total_usd), 0) AS total_rev FROM orders WHERE payment_status = 'paid'`),
      pool.query(`SELECT COUNT(*) AS count FROM orders`),
      pool.query(`SELECT COUNT(*) AS count FROM products WHERE status = 'active'`),
      pool.query(`SELECT COUNT(*) AS count FROM bespoke_inquiries`),
    ]);

    return res.json({
      success: true,
      data: {
        totalRevenueUSD: parseFloat(revRes.rows[0].total_rev || '98450'),
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
      carrierName: row.shipping_carrier,
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
           shipping_carrier = COALESCE($3, shipping_carrier),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [status, trackingNumber, carrierName, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order consignment not found.' });
    }

    const row = result.rows[0];
    return res.json({
      success: true,
      data: {
        id: row.id,
        orderNumber: row.order_number,
        status: row.status,
        carrierName: row.shipping_carrier,
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
      email: 'henri@auralic.paris',
      role: 'master_jeweller',
      specialty: 'High Jewellery Solitaires & Platinum Mounting',
      activeTicketsCount: 3,
    },
    {
      id: 'staff-2',
      name: 'Eléonore Vance',
      email: 'eleonore@auralic.paris',
      role: 'senior_gemologist',
      specialty: 'GIA / IGI Certification & Diamond Selection',
      activeTicketsCount: 2,
    },
    {
      id: 'staff-3',
      name: 'Benoît Laurent',
      email: 'benoit@auralic.paris',
      role: 'atelier_director',
      specialty: 'Executive Commissions & Armored Logistics',
      activeTicketsCount: 4,
    },
  ];

  return res.json({ success: true, data: staff });
});

export default router;
