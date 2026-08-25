const fs = require('fs');
let content = fs.readFileSync('backend/src/routes/api.routes.ts', 'utf8');

const orderStart = content.indexOf("router.post('/orders'");
const orderEnd = content.indexOf("router.get('/orders/my'");

if (orderStart !== -1 && orderEnd !== -1) {
    const newOrders = `
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
        return res.status(400).json({ success: false, error: \`Product not found: \${itm.productId || itm.id}\` });
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
    const orderNumber = \`AUR-\${Date.now().toString().slice(-6)}-\${Math.floor(100 + Math.random() * 900)}\`;

    const orderInsert = await client.query(
      \`INSERT INTO orders (
        order_number, user_id, customer_email, customer_phone, status, payment_status, payment_method,
        currency, subtotal_usd, discount_usd, shipping_usd, total_usd,
        shipping_address, carrier_name, notes
      ) VALUES ($1, $2, $3, $4, 'pending', 'pending', $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *\`,
      [
        orderNumber, req.user?.id || null, customerEmail.toLowerCase().trim(),
        customerPhone || null, paymentMethod, currency, subtotalUSD, discountUSD,
        shippingUSD, totalUSD, JSON.stringify(shippingAddress), carrierName, notes || null,
      ]
    );

    const createdOrder = orderInsert.rows[0];

    for (const itm of verifiedItems) {
      await client.query(
        \`INSERT INTO order_items (
          order_id, product_id, variant_id, product_name, sku, metal_type, purity, size, engraving_text, unit_price_usd, quantity, total_usd
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)\`,
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

`;
    const before = content.slice(0, orderStart);
    const after = content.slice(orderEnd);
    fs.writeFileSync('backend/src/routes/api.routes.ts', before + newOrders + after);
    console.log("Orders replaced.");
} else {
    console.log("Could not find order routes");
}
