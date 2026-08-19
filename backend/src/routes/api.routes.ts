import { Router, Request, Response } from 'express';
import { getDbPool } from '../db/connection';
import { PaymentService } from '../services/payment.service';
import { EmailService } from '../services/email.service';

const router = Router();

// Health Check
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'Maison Aurelia High Jewellery REST API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Products Endpoint
router.get('/products', async (req: Request, res: Response) => {
  const pool = getDbPool();
  if (pool) {
    try {
      const { category, collection, minPrice, maxPrice, sort, search } = req.query;
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
        query += ` AND c.slug = $${params.length}`;
      }
      if (collection) {
        params.push(collection);
        query += ` AND cl.slug = $${params.length}`;
      }
      if (minPrice) {
        params.push(Number(minPrice));
        query += ` AND p.price >= $${params.length}`;
      }
      if (maxPrice) {
        params.push(Number(maxPrice));
        query += ` AND p.price <= $${params.length}`;
      }
      if (search) {
        params.push(`%${search}%`);
        query += ` AND (p.name ILIKE $${params.length} OR p.description ILIKE $${params.length} OR p.sku ILIKE $${params.length})`;
      }

      if (sort === 'price-asc') query += ` ORDER BY p.price ASC`;
      else if (sort === 'price-desc') query += ` ORDER BY p.price DESC`;
      else if (sort === 'newest') query += ` ORDER BY p.created_at DESC`;
      else query += ` ORDER BY p.featured DESC, p.created_at DESC`;

      const result = await pool.query(query, params);
      return res.json({ success: true, data: result.rows, total: result.rowCount });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // Fallback demo response if running without DB connection
  return res.json({
    success: true,
    message: 'Operational fallback mode. Configure DATABASE_URL for live PostgreSQL.',
    data: [],
  });
});

// Single Product by Slug
router.get('/products/:slug', async (req: Request, res: Response) => {
  const { slug } = req.params;
  const pool = getDbPool();
  if (pool) {
    try {
      const result = await pool.query(
        `SELECT p.*, c.name as category_name, cl.name as collection_name 
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         LEFT JOIN collections cl ON p.collection_id = cl.id
         WHERE p.slug = $1 LIMIT 1`,
        [slug]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Piece not found in vault catalogue.' });
      }
      return res.json({ success: true, data: result.rows[0] });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
  return res.status(404).json({ success: false, error: 'Database connection required for dynamic querying.' });
});

// Categories
router.get('/categories', async (req: Request, res: Response) => {
  const pool = getDbPool();
  if (pool) {
    try {
      const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
      return res.json({ success: true, data: result.rows });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
  return res.json({ success: true, data: [] });
});

// Collections
router.get('/collections', async (req: Request, res: Response) => {
  const pool = getDbPool();
  if (pool) {
    try {
      const result = await pool.query('SELECT * FROM collections ORDER BY name ASC');
      return res.json({ success: true, data: result.rows });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
  return res.json({ success: true, data: [] });
});

// Create Payment Intent (Stripe / Bank Wire)
router.post('/payments/create-intent', async (req: Request, res: Response) => {
  try {
    const { amount, currency, orderId, customerEmail } = req.body;
    const payment = await PaymentService.createPaymentIntent({
      amount: Number(amount),
      currency: currency || 'USD',
      orderId: orderId || `ORD-${Date.now()}`,
      customerEmail: customerEmail || 'patron@mmsaurelia.com',
      metadata: { source: 'aurelia_luxury_frontend' },
    });
    return res.json({ success: true, data: payment });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Bespoke Inquiry Submission
router.post('/bespoke', async (req: Request, res: Response) => {
  try {
    const { clientName, email, phone, category, metalPreference, estimatedBudget, designBrief } = req.body;
    // Send email notification to Atelier
    await EmailService.sendCustomEmail({
      to: 'atelier@maisonaurelia.com',
      subject: `New Haute Joaillerie Commission Inquiry from ${clientName}`,
      html: `
        <h2>Private Bespoke Commission Brief</h2>
        <p><strong>Patron:</strong> ${clientName} (${email}, ${phone || 'N/A'})</p>
        <p><strong>Category:</strong> ${category}</p>
        <p><strong>Metal Alloy:</strong> ${metalPreference}</p>
        <p><strong>Indicative Budget:</strong> ${estimatedBudget}</p>
        <p><strong>Aesthetic Brief:</strong> ${designBrief}</p>
      `,
    });

    return res.status(201).json({
      success: true,
      message: 'Private bespoke inquiry logged with the Master Jeweller.',
      ticketNumber: `AUR-BESPOKE-${Math.floor(100000 + Math.random() * 900000)}`,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
