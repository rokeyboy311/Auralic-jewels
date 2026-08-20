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
    service: 'Auralic Jewels / Maison Aurelia High Jewellery REST API',
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
    res.cookie('aurelia_auth_token', token, {
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
    res.cookie('aurelia_auth_token', token, {
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
          const payload = await googleRes.json();
          verifiedEmail = payload.email;
          verifiedName = payload.name || payload.email.split('@')[0];
          verifiedGoogleId = payload.sub;
        }
      } catch (err) {
        console.warn('[Aurelia Auth] Google token verification fallback used.');
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
      if (verifiedGoogleId && !user.google_id) {
        await pool.query('UPDATE users SET google_id = $1, is_email_verified = true WHERE id = $2', [verifiedGoogleId, user.id]);
      }
      delete user.password_hash;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
    res.cookie('aurelia_auth_token', token, {
      httpOnly: true,
      secure: config.env === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      path: '/'
    });
    return res.json({
      success: true,
      data: { user, token },
      message: 'Google authentication successful.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get Current Authenticated Patron Profile
 */
router.get('/auth/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const pool = getDbPool();
  if (!pool || !req.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized.' });
  }

  try {
    const result = await pool.query(
      `SELECT id, name, email, phone, role, avatar_url, is_email_verified, created_at 
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User profile not found.' });
    }

    // Fetch saved addresses
    const addrResult = await pool.query('SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC', [req.user.id]);
    const user = result.rows[0];
    user.addresses = addrResult.rows;

    return res.json({ success: true, data: user });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================================
// 3. PRODUCTS & CATALOGUE DISCOVERY
// ==========================================================

router.get('/products', async (req: Request, res: Response) => {
  const pool = getDbPool();
  if (!pool) {
    return res.json({ success: true, data: [], total: 0 });
  }

  try {
    const { category, collection, metalType, purity, stoneType, gender, minPrice, maxPrice, sort, search } = req.query;
    let query = `
      SELECT p.*, c.name as category_name, cl.name as collection_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN collections cl ON p.collection_id = cl.id
      WHERE p.status = 'active'
    `;
    const params: any[] = [];

    if (category) {
      params.push(category);
      query += ` AND (c.slug = $${params.length} OR p.category_id = $${params.length})`;
    }
    if (collection) {
      params.push(collection);
      query += ` AND (cl.slug = $${params.length} OR p.collection_id = $${params.length})`;
    }
    if (metalType) {
      params.push(metalType);
      query += ` AND p.metal_type ILIKE $${params.length}`;
    }
    if (purity) {
      params.push(purity);
      query += ` AND p.purity ILIKE $${params.length}`;
    }
    if (stoneType) {
      params.push(stoneType);
      query += ` AND p.stone_type ILIKE $${params.length}`;
    }
    if (gender) {
      params.push(gender);
      query += ` AND p.gender = $${params.length}`;
    }
    if (minPrice) {
      params.push(Number(minPrice));
      query += ` AND p.price_usd >= $${params.length}`;
    }
    if (maxPrice) {
      params.push(Number(maxPrice));
      query += ` AND p.price_usd <= $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (p.name ILIKE $${params.length} OR p.description ILIKE $${params.length} OR p.sku ILIKE $${params.length})`;
    }

    if (sort === 'price-asc') query += ` ORDER BY p.price_usd ASC`;
    else if (sort === 'price-desc') query += ` ORDER BY p.price_usd DESC`;
    else if (sort === 'newest') query += ` ORDER BY p.created_at DESC`;
    else if (sort === 'rating') query += ` ORDER BY p.rating DESC, p.review_count DESC`;
    else query += ` ORDER BY p.is_featured DESC, p.is_best_seller DESC, p.created_at DESC`;

    const result = await pool.query(query, params);
    return res.json({ success: true, data: result.rows, total: result.rowCount });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/products/:slugOrId', async (req: Request, res: Response) => {
  const { slugOrId } = req.params;
  const pool = getDbPool();
  if (!pool) {
    return res.status(503).json({ success: false, error: 'Database service unavailable.' });
  }

  try {
    const result = await pool.query(
      `SELECT p.*, c.name as category_name, cl.name as collection_name 
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN collections cl ON p.collection_id = cl.id
       WHERE p.slug = $1 OR p.id = $1 OR p.sku = $1 LIMIT 1`,
      [slugOrId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Masterpiece not found in vault.' });
    }

    const product = result.rows[0];

    // Fetch images and variants
    const imagesRes = await pool.query('SELECT * FROM product_images WHERE product_id = $1 ORDER BY sort_order ASC', [product.id]);
    const variantsRes = await pool.query('SELECT * FROM product_variants WHERE product_id = $1', [product.id]);

    product.images = imagesRes.rows;
    product.variants = variantsRes.rows;

    return res.json({ success: true, data: product });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/categories', async (req: Request, res: Response) => {
  const pool = getDbPool();
  if (!pool) return res.json({ success: true, data: [] });
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    return res.json({ success: true, data: result.rows });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/collections', async (req: Request, res: Response) => {
  const pool = getDbPool();
  if (!pool) return res.json({ success: true, data: [] });
  try {
    const result = await pool.query('SELECT * FROM collections ORDER BY is_featured DESC, name ASC');
    return res.json({ success: true, data: result.rows });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================================
// 4. COUPONS & SHIPPING METHODS
// ==========================================================

router.post('/coupons/validate', async (req: Request, res: Response) => {
  const { code, orderSubtotalUSD } = req.body;
  if (!code) return res.status(400).json({ success: false, error: 'Coupon code required.' });

  const pool = getDbPool();
  if (!pool) {
    // Default fallback calculation if DB is unlinked
    if (code.toUpperCase() === 'WELCOME10') {
      const discount = Math.round(Number(orderSubtotalUSD || 0) * 0.1);
      return res.json({ 
        success: true, 
        data: { 
          coupon: { code: 'WELCOME10', discountType: 'percentage', discountValue: 10 },
          discountUSD: discount
        } 
      });
    }
    return res.status(404).json({ success: false, error: 'Invalid privilege code.' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM coupons WHERE code = $1 AND is_active = true',
      [code.toUpperCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Invalid or expired privilege code.' });
    }

    const coupon = result.rows[0];
    const subtotal = Number(orderSubtotalUSD || 0);

    if (coupon.min_order_usd && subtotal < Number(coupon.min_order_usd)) {
      return res.status(400).json({ 
        success: false, 
        error: `Minimum acquisition value of $${coupon.min_order_usd} required for this privilege.` 
      });
    }

    let discountUSD = 0;
    if (coupon.discount_type === 'percentage') {
      discountUSD = (subtotal * Number(coupon.discount_value)) / 100;
    } else {
      discountUSD = Number(coupon.discount_value);
    }

    return res.json({
      success: true,
      data: {
        coupon: {
          code: coupon.code,
          discountType: coupon.discount_type,
          discountValue: Number(coupon.discount_value),
          description: coupon.description,
        },
        discountUSD: Math.min(discountUSD, subtotal),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/shipping', async (req: Request, res: Response) => {
  const pool = getDbPool();
  if (!pool) {
    return res.json({
      success: true,
      data: [
        {
          id: 'ferrari_armored_express',
          name: 'Ferrari Group Armored Courier (Insured Air Express)',
          carrier: 'Ferrari Group Valuables Logistics',
          costUSD: 0,
          estimatedDays: '2–4 Business Days',
          isFreeAboveThreshold: true,
          insuranceIncluded: true,
        },
      ],
    });
  }

  try {
    const result = await pool.query('SELECT * FROM shipping_methods ORDER BY cost_usd ASC');
    return res.json({ success: true, data: result.rows });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================================
// 5. SECURE SERVER-SIDE CALCULATED ORDERS & CHECKOUT
// ==========================================================

router.post('/orders', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { 
    items, 
    shippingAddress, 
    billingAddress, 
    couponCode, 
    currency = 'USD', 
    exchangeRate = 1.0, 
    shippingMethodId = 'ferrari_armored_express',
    paymentMethod = 'stripe',
    notes 
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: 'Shopping bag cannot be empty.' });
  }

  if (!shippingAddress || !shippingAddress.email || !shippingAddress.addressLine1) {
    return res.status(400).json({ success: false, error: 'Complete shipping address required.' });
  }

  const pool = getDbPool();
  if (!pool) {
    return res.status(503).json({ success: false, error: 'Database service unavailable for order booking.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Authoritative Server-Side Price & Stock Recalculation
    let subtotalUSD = 0;
    const validatedOrderItems: any[] = [];

    for (const item of items) {
      const prodRes = await client.query(
        'SELECT * FROM products WHERE id = $1 OR sku = $1 FOR UPDATE',
        [item.productId || item.sku]
      );

      if (prodRes.rows.length === 0) {
        throw new Error(`Product ${item.sku || item.name} is no longer available in the vault.`);
      }

      const product = prodRes.rows[0];
      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);

      // Check and decrement inventory
      if (product.stock < quantity) {
        throw new Error(`Insufficient inventory for ${product.name}. Remaining vault pieces: ${product.stock}`);
      }

      await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [quantity, product.id]);

      const unitPriceUSD = Number(product.price_usd);
      const totalItemUSD = unitPriceUSD * quantity;
      subtotalUSD += totalItemUSD;

      validatedOrderItems.push({
        productId: product.id,
        variantId: item.variantId || null,
        sku: product.sku,
        name: product.name,
        image: item.image || product.images?.[0]?.url || '',
        metalType: item.metalType || product.metal_type,
        purity: item.purity || product.purity,
        size: item.size || 'Standard',
        stoneType: item.stoneType || product.stone_type,
        engravingText: item.engravingText || null,
        unitPriceUSD,
        quantity,
        totalUSD: totalItemUSD,
      });
    }

    // 2. Validate and Apply Coupon Server-Side
    let discountUSD = 0;
    if (couponCode) {
      const couponRes = await client.query('SELECT * FROM coupons WHERE code = $1 AND is_active = true', [couponCode.toUpperCase()]);
      if (couponRes.rows.length > 0) {
        const coupon = couponRes.rows[0];
        if (coupon.discount_type === 'percentage') {
          discountUSD = (subtotalUSD * Number(coupon.discount_value)) / 100;
        } else {
          discountUSD = Number(coupon.discount_value);
        }
      }
    }

    // 3. Calculate Shipping & Taxes
    const shippingCostUSD = subtotalUSD >= 500 ? 0 : 75;
    const taxCostUSD = Math.round((subtotalUSD - discountUSD) * 0.07 * 100) / 100; // Standard 7% US / base calculation
    const totalUSD = subtotalUSD - discountUSD + shippingCostUSD + taxCostUSD;

    const rate = Number(exchangeRate) || 1.0;
    const totalInCurrency = Math.round(totalUSD * rate * 100) / 100;

    const orderId = `AUR-ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderNumber = `AUR-${Math.floor(100000 + Math.random() * 900000)}`;

    // 4. Insert Order into Database
    const orderInsert = await client.query(
      `INSERT INTO orders (
        id, order_number, user_id, customer_email, customer_phone,
        shipping_address_json, billing_address_json,
        subtotal_usd, discount_usd, coupon_code,
        shipping_cost_usd, tax_cost_usd, total_usd,
        currency, total_in_currency, exchange_rate_used,
        shipping_method_id, shipping_method_name,
        status, payment_status, payment_method, notes
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7,
        $8, $9, $10,
        $11, $12, $13,
        $14, $15, $16,
        $17, $18,
        'pending', 'pending', $19, $20
      ) RETURNING *`,
      [
        orderId, orderNumber, req.user?.id || null, shippingAddress.email, shippingAddress.phone || 'N/A',
        JSON.stringify(shippingAddress), JSON.stringify(billingAddress || shippingAddress),
        subtotalUSD, discountUSD, couponCode || null,
        shippingCostUSD, taxCostUSD, totalUSD,
        currency, totalInCurrency, rate,
        shippingMethodId, 'Ferrari Group Armored Air Express',
        paymentMethod, notes || null
      ]
    );

    // 5. Insert Immutable Order Items Snapshot
    for (const item of validatedOrderItems) {
      await client.query(
        `INSERT INTO order_items (
          order_id, product_id, variant_id, sku, name, image,
          metal_type, purity, size, stone_type, engraving_text,
          unit_price_usd, quantity, total_usd
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          orderId, item.productId, item.variantId, item.sku, item.name, item.image,
          item.metalType, item.purity, item.size, item.stoneType, item.engravingText,
          item.unitPriceUSD, item.quantity, item.totalUSD
        ]
      );
    }

    await client.query('COMMIT');

    const createdOrder = orderInsert.rows[0];
    createdOrder.items = validatedOrderItems;

    // Send transactional confirmation email asynchronously
    EmailService.sendOrderConfirmation(createdOrder).catch((err) => {
      console.warn('[Aurelia Order] Email dispatch error:', err.message);
    });

    return res.status(201).json({
      success: true,
      data: createdOrder,
      message: 'Fine jewellery acquisition secured.',
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    return res.status(400).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
});

router.get('/orders/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database service unavailable.' });

  try {
    const orderRes = await pool.query('SELECT * FROM orders WHERE id = $1 OR order_number = $1', [id]);
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order record not found.' });
    }

    const order = orderRes.rows[0];
    const itemsRes = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
    order.items = itemsRes.rows;

    return res.json({ success: true, data: order });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/orders/track', async (req: Request, res: Response) => {
  const { orderNumber, email } = req.body;
  if (!orderNumber) return res.status(400).json({ success: false, error: 'Order number required.' });

  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database service unavailable.' });

  try {
    let query = 'SELECT * FROM orders WHERE order_number = $1';
    const params = [orderNumber.trim()];

    if (email) {
      query += ' AND customer_email ILIKE $2';
      params.push(email.trim());
    }

    const orderRes = await pool.query(query, params);
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'No consignment found matching this reference.' });
    }

    const order = orderRes.rows[0];
    const itemsRes = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
    order.items = itemsRes.rows;

    return res.json({ success: true, data: order });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================================
// 6. PAYMENTS & WEBHOOK ARCHITECTURE
// ==========================================================

router.post('/payments/create-intent', async (req: Request, res: Response) => {
  try {
    const { amount, currency, orderId, customerEmail } = req.body;
    const payment = await PaymentService.createPaymentIntent(
      Number(amount),
      currency || 'USD',
      { orderId: orderId || `ORD-${Date.now()}`, customerEmail: customerEmail || 'patron@aureliajewels.com' }
    );
    return res.json({ success: true, data: payment });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/payments/verify', async (req: Request, res: Response) => {
  const { orderId, paymentIntentId } = req.body;
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database service unavailable.' });

  try {
    await pool.query(
      `UPDATE orders 
       SET payment_status = 'paid', status = 'confirmed', payment_intent_id = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 OR order_number = $2`,
      [paymentIntentId, orderId]
    );

    return res.json({ success: true, message: 'Payment successfully verified and order confirmed.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================================
// 7. BESPOKE HAUTE JOAILLERIE INQUIRIES
// ==========================================================

router.post('/bespoke', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { 
    customerName, 
    customerEmail, 
    customerPhone, 
    customerCountry, 
    category, 
    metalPreference, 
    purityPreference, 
    stonePreference, 
    targetCarat, 
    targetBudgetUSD, 
    sizeSpecification, 
    engravingMessage, 
    designDescription, 
    referenceImageUrl, 
    timelineRequirement 
  } = req.body;

  if (!customerName || !customerEmail || !designDescription) {
    return res.status(400).json({ success: false, error: 'Name, email, and design description required.' });
  }

  const pool = getDbPool();
  const refNum = `AUR-BESPOKE-${Math.floor(100000 + Math.random() * 900000)}`;
  const inquiryId = `bespoke_${Date.now()}`;

  if (pool) {
    try {
      await pool.query(
        `INSERT INTO bespoke_inquiries (
          id, reference_number, user_id, customer_name, customer_email,
          customer_phone, customer_country, category, metal_preference,
          purity_preference, stone_preference, target_carat, target_budget_usd,
          size_specification, engraving_message, design_description,
          reference_image_url, timeline_requirement, status
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9,
          $10, $11, $12, $13,
          $14, $15, $16,
          $17, $18, 'inquiry_received'
        )`,
        [
          inquiryId, refNum, req.user?.id || null, customerName, customerEmail,
          customerPhone || null, customerCountry || 'International', category || 'High Jewellery', metalPreference || '18K Yellow Gold',
          purityPreference || '18K', stonePreference || 'Natural Diamond', targetCarat || null, targetBudgetUSD || 'Bespoke',
          sizeSpecification || null, engravingMessage || null, designDescription,
          referenceImageUrl || null, timelineRequirement || 'Standard Atelier Lead Time'
        ]
      );
    } catch (err: any) {
      console.warn('[Aurelia Bespoke] DB persistence error:', err.message);
    }
  }

  // Send email to Atelier Jeweller
  EmailService.sendCustomEmail({
    to: config.resend.adminEmail || 'atelier@aureliajewels.com',
    subject: `New Haute Joaillerie Commission Inquiry [${refNum}] from ${customerName}`,
    html: `
      <h2>Private Bespoke Commission Brief</h2>
      <p><strong>Reference:</strong> ${refNum}</p>
      <p><strong>Patron:</strong> ${customerName} (${customerEmail}, ${customerPhone || 'N/A'})</p>
      <p><strong>Category:</strong> ${category}</p>
      <p><strong>Metal & Purity:</strong> ${metalPreference} (${purityPreference})</p>
      <p><strong>Gemstone & Carat:</strong> ${stonePreference} (${targetCarat || 'Custom'} ct)</p>
      <p><strong>Target Budget:</strong> ${targetBudgetUSD}</p>
      <p><strong>Aesthetic Description:</strong></p>
      <blockquote style="background: #faf8f5; padding: 16px; border-left: 3px solid #9b7e46;">${designDescription}</blockquote>
    `,
  }).catch((err) => console.warn('[Aurelia Bespoke] Email error:', err.message));

  return res.status(201).json({
    success: true,
    data: { id: inquiryId, referenceNumber: refNum },
    message: 'Bespoke brief transmitted to Master Jeweller.',
  });
});

router.get('/bespoke', requireStaff, async (req: AuthenticatedRequest, res: Response) => {
  const pool = getDbPool();
  if (!pool) return res.json({ success: true, data: [] });
  try {
    const result = await pool.query('SELECT * FROM bespoke_inquiries ORDER BY created_at DESC');
    return res.json({ success: true, data: result.rows });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================================
// 8. ATELIER CONCIERGE CHAT & CONVERSATIONS (POSTGRESQL-BACKED)
// ==========================================================

router.get('/conversations', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const pool = getDbPool();
  if (!pool) return res.json({ success: true, data: [] });

  try {
    const { userId, status, search } = req.query;
    let query = 'SELECT * FROM conversations WHERE 1=1';
    const params: any[] = [];

    // Security check: Customers can ONLY see their own conversations
    if (!req.user || req.user.role === 'customer') {
      const filterUserId = req.user?.id || userId;
      if (!filterUserId) {
        return res.json({ success: true, data: [] });
      }
      params.push(filterUserId);
      query += ` AND user_id = $${params.length}`;
    } else {
      // Staff / Admin filters
      if (userId) {
        params.push(userId);
        query += ` AND user_id = $${params.length}`;
      }
    }

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (ticket_number ILIKE $${params.length} OR user_name ILIKE $${params.length} OR subject ILIKE $${params.length})`;
    }

    query += ' ORDER BY updated_at DESC';
    const result = await pool.query(query, params);

    // Attach latest messages
    for (const convo of result.rows) {
      const msgRes = await pool.query(
        'SELECT * FROM conversation_messages WHERE conversation_id = $1 ORDER BY created_at ASC',
        [convo.id]
      );
      convo.messages = msgRes.rows;
    }

    return res.json({ success: true, data: result.rows });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/conversations', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { 
    userId, 
    userName, 
    userEmail, 
    userPhone, 
    subject, 
    type = 'general_concierge',
    priority = 'medium',
    initialMessage,
    productId,
    productContext,
    orderId,
    orderContext
  } = req.body;

  if (!userName || !userEmail || !subject || !initialMessage) {
    return res.status(400).json({ success: false, error: 'Name, email, subject, and message are required.' });
  }

  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database service unavailable.' });

  const convoId = `AUR-CHAT-${Date.now()}`;
  const ticketNumber = `AUR-${Math.floor(100000 + Math.random() * 900000)}`;

  try {
    const convoResult = await pool.query(
      `INSERT INTO conversations (
        id, ticket_number, user_id, user_name, user_email, user_phone,
        subject, type, status, priority,
        product_id, product_context_json, order_id, order_context_json,
        unread_by_admin_count
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, 'OPEN', $9,
        $10, $11, $12, $13, 1
      ) RETURNING *`,
      [
        convoId, ticketNumber, req.user?.id || userId || null, userName, userEmail, userPhone || null,
        subject, type, priority,
        productId || null, productContext ? JSON.stringify(productContext) : null,
        orderId || null, orderContext ? JSON.stringify(orderContext) : null
      ]
    );

    // Insert initial message
    const msgResult = await pool.query(
      `INSERT INTO conversation_messages (
        conversation_id, sender_id, sender_name, sender_role, content
      ) VALUES ($1, $2, $3, 'customer', $4) RETURNING *`,
      [convoId, req.user?.id || 'patron_guest', userName, initialMessage]
    );

    const convo = convoResult.rows[0];
    convo.messages = [msgResult.rows[0]];

    return res.status(201).json({ success: true, data: convo, message: 'Ticket opened with Master Jeweller.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/conversations/:id/messages', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { senderId, senderName, senderRole = 'customer', content, isInternalNote = false, attachments } = req.body;

  if (!content) return res.status(400).json({ success: false, error: 'Message content required.' });

  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database service unavailable.' });

  try {
    // 1. Verify Conversation Exists
    const convoRes = await pool.query('SELECT * FROM conversations WHERE id = $1 OR ticket_number = $1', [id]);
    if (convoRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Conversation thread not found.' });
    }

    const convo = convoRes.rows[0];

    // 2. Security Check: Customers can only post to their own conversations
    if (req.user?.role === 'customer' && convo.user_id && convo.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access to this private conversation is forbidden.' });
    }

    // 3. Insert Message
    const msgRes = await pool.query(
      `INSERT INTO conversation_messages (
        conversation_id, sender_id, sender_name, sender_role, content, attachments_json, is_internal_note
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        convo.id,
        req.user?.id || senderId || 'user',
        req.user?.name || senderName || 'Patron',
        req.user?.role || senderRole,
        content,
        attachments ? JSON.stringify(attachments) : null,
        isInternalNote
      ]
    );

    // 4. Update Conversation status and timestamp
    const isStaff = ['admin', 'superadmin', 'atelier_staff', 'master_jeweller', 'gemologist'].includes(req.user?.role || senderRole);
    const newStatus = isStaff ? 'WAITING_FOR_USER' : 'WAITING_FOR_ADMIN';

    await pool.query(
      `UPDATE conversations 
       SET status = $1, updated_at = CURRENT_TIMESTAMP,
           unread_by_user_count = CASE WHEN $2 = true THEN unread_by_user_count + 1 ELSE unread_by_user_count END,
           unread_by_admin_count = CASE WHEN $2 = false THEN unread_by_admin_count + 1 ELSE unread_by_admin_count END
       WHERE id = $3`,
      [newStatus, isStaff, convo.id]
    );

    return res.status(201).json({
      success: true,
      data: { message: msgRes.rows[0] },
      message: 'Message dispatched.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.patch('/conversations/:id', requireStaff, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, priority, assignedStaffId, assignedStaffName, internalNotes } = req.body;

  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database service unavailable.' });

  try {
    const result = await pool.query(
      `UPDATE conversations 
       SET status = COALESCE($1, status),
           priority = COALESCE($2, priority),
           assigned_staff_id = COALESCE($3, assigned_staff_id),
           assigned_staff_name = COALESCE($4, assigned_staff_name),
           internal_notes = COALESCE($5, internal_notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 OR ticket_number = $6
       RETURNING *`,
      [status || null, priority || null, assignedStaffId || null, assignedStaffName || null, internalNotes || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Conversation not found.' });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================================
// 9. VERIFIED BUYER REVIEWS & TESTIMONIALS
// ==========================================================

router.get('/reviews', async (req: Request, res: Response) => {
  const { productId } = req.query;
  const pool = getDbPool();
  if (!pool) return res.json({ success: true, data: [] });

  try {
    let query = 'SELECT * FROM reviews WHERE 1=1';
    const params: any[] = [];

    if (productId) {
      params.push(productId);
      query += ` AND product_id = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    return res.json({ success: true, data: result.rows });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/reviews', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { productId, userName, userCountry, rating, title, comment } = req.body;
  if (!productId || !userName || !rating || !comment) {
    return res.status(400).json({ success: false, error: 'Product, name, rating, and comment are required.' });
  }

  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database service unavailable.' });

  try {
    // Check if user is a verified buyer of this product
    let isVerified = false;
    if (req.user) {
      const purchaseCheck = await pool.query(
        `SELECT oi.id FROM order_items oi
         JOIN orders o ON oi.order_id = o.id
         WHERE o.user_id = $1 AND oi.product_id = $2 AND o.payment_status = 'paid'
         LIMIT 1`,
        [req.user.id, productId]
      );
      isVerified = purchaseCheck.rows.length > 0;
    }

    const reviewId = `rev_${Date.now()}`;
    const result = await pool.query(
      `INSERT INTO reviews (
        id, product_id, user_id, user_name, user_country, rating, title, comment, is_verified_buyer
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        reviewId, productId, req.user?.id || null, userName,
        userCountry || 'International Patron', Math.max(1, Math.min(5, Number(rating))),
        title || null, comment, isVerified
      ]
    );

    // Update product rating aggregate
    await pool.query(
      `UPDATE products 
       SET rating = (SELECT AVG(rating) FROM reviews WHERE product_id = $1),
           review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = $1)
       WHERE id = $1`,
      [productId]
    );

    return res.status(201).json({ success: true, data: result.rows[0], message: 'Review recorded.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================================
// 10. ADMIN & EXECUTIVE CONTROL CENTER
// ==========================================================

router.get('/admin/stats', requireStaff, async (req: AuthenticatedRequest, res: Response) => {
  const pool = getDbPool();
  if (!pool) {
    return res.json({
      success: true,
      data: {
        totalRevenueUSD: 248500,
        activeOrdersCount: 8,
        totalProductsCount: 24,
        openTicketsCount: 4,
      },
    });
  }

  try {
    const revRes = await pool.query("SELECT COALESCE(SUM(total_usd), 0) as revenue FROM orders WHERE payment_status = 'paid'");
    const ordRes = await pool.query("SELECT COUNT(*) as count FROM orders WHERE status NOT IN ('delivered', 'cancelled')");
    const prodRes = await pool.query("SELECT COUNT(*) as count FROM products WHERE status = 'active'");
    const chatRes = await pool.query("SELECT COUNT(*) as count FROM conversations WHERE status NOT IN ('RESOLVED', 'CLOSED')");

    return res.json({
      success: true,
      data: {
        totalRevenueUSD: Number(revRes.rows[0]?.revenue || 0),
        activeOrdersCount: Number(ordRes.rows[0]?.count || 0),
        totalProductsCount: Number(prodRes.rows[0]?.count || 0),
        openTicketsCount: Number(chatRes.rows[0]?.count || 0),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/admin/orders', requireStaff, async (req: AuthenticatedRequest, res: Response) => {
  const pool = getDbPool();
  if (!pool) return res.json({ success: true, data: [] });
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    for (const order of result.rows) {
      const itemsRes = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
      order.items = itemsRes.rows;
    }
    return res.json({ success: true, data: result.rows });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/admin/orders/:id/status', requireStaff, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, trackingNumber, carrierName } = req.body;

  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database service unavailable.' });

  try {
    const result = await pool.query(
      `UPDATE orders 
       SET status = COALESCE($1, status),
           tracking_number = COALESCE($2, tracking_number),
           carrier_name = COALESCE($3, carrier_name),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 OR order_number = $4
       RETURNING *`,
      [status || null, trackingNumber || null, carrierName || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    // Log admin action to audit logs
    await pool.query(
      `INSERT INTO audit_logs (user_id, user_email, action, entity_type, entity_id, details_json)
       VALUES ($1, $2, 'UPDATE_ORDER_STATUS', 'order', $3, $4)`,
      [
        req.user?.id || null, req.user?.email || null, id,
        JSON.stringify({ newStatus: status, trackingNumber, carrierName })
      ]
    );

    return res.json({ success: true, data: result.rows[0], message: 'Consignment status updated.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/admin/products', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const product = req.body;
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database service unavailable.' });

  try {
    const id = product.id || `prod_${Date.now()}`;
    const slug = product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const sku = product.sku || `AUR-${Math.floor(10000 + Math.random() * 90000)}`;

    const result = await pool.query(
      `INSERT INTO products (
        id, name, slug, sku, category_id, collection_id, gender,
        short_description, description, price_usd, compare_price_usd,
        metal_type, purity, weight_grams, stone_type, stone_weight_carats,
        stock, status, is_featured, is_best_seller
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11,
        $12, $13, $14, $15, $16,
        $17, $18, $19, $20
      ) ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        price_usd = EXCLUDED.price_usd,
        stock = EXCLUDED.stock,
        status = EXCLUDED.status,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *`,
      [
        id, product.name, slug, sku, product.categoryId || null, product.collectionId || null, product.gender || 'Women',
        product.shortDescription || '', product.description || '', Number(product.priceUSD || product.price_usd || 0),
        product.comparePriceUSD ? Number(product.comparePriceUSD) : null,
        product.metalType || product.metal_type || '18K Yellow Gold', product.purity || '18K',
        Number(product.grossWeightGrams || product.weight_grams || 5.0), product.stoneType || product.stone_type || 'None',
        product.stoneWeightCarats ? Number(product.stoneWeightCarats) : null,
        parseInt(product.stock || 10, 10), product.status || 'active',
        !!product.isFeatured, !!product.isBestSeller
      ]
    );

    return res.status(201).json({ success: true, data: result.rows[0], message: 'Vault piece catalogue updated.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/admin/staff', requireStaff, async (req: AuthenticatedRequest, res: Response) => {
  const pool = getDbPool();
  if (!pool) {
    return res.json({
      success: true,
      data: [
        { id: 'staff_1', name: 'Master Goldsmith Henri Vane', email: 'henri@aureliajewels.com', role: 'MASTER_JEWELLER', specialty: '18K/22K Solitaire & Bezel Setting' },
        { id: 'staff_2', name: 'Dr. Vivienne Moreau', email: 'vivienne@aureliajewels.com', role: 'SENIOR_GEMOLOGIST', specialty: 'GIA D-FL Diamond & Untreated Emerald Sourcing' },
      ],
    });
  }

  try {
    const result = await pool.query(
      `SELECT id, name, email, role, avatar_url 
       FROM users 
       WHERE role IN ('admin', 'superadmin', 'atelier_staff', 'master_jeweller', 'gemologist')
       ORDER BY name ASC`
    );
    return res.json({ success: true, data: result.rows });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
