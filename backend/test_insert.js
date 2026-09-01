const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_zZ3uSxOhX2nW@ep-calm-boat-ax5xne7v-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require',
});

async function run() {
  await client.connect();
  try {
    const prodId = 'prod-' + Date.now();
    await client.query(
      `INSERT INTO products (
        id, name, slug, sku, short_description, description, price_usd, compare_price_usd,
        category_id, collection_id, metal_type, purity, stone_type, stone_weight_carats,
        weight_grams, gender, status, is_featured, is_new_arrival
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
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
        'Test Piece',
        'test-piece-' + Date.now(),
        'AUR-JW-' + Date.now().toString().slice(-4),
        'Short description',
        'Long description',
        5000,
        null,
        'cat-rings',
        'col-solitaire-masterpieces',
        'Yellow Gold',
        '18K',
        'Natural Diamond',
        2.0,
        4.5,
        'Women',
        'active',
        false,
        false
      ]
    );

    // Test product images
    const prodImages = ['https://example.com/img1.jpg'];
    for (let i = 0; i < prodImages.length; i++) {
      const imgUrl = prodImages[i];
      await client.query(
        `INSERT INTO product_images (product_id, url, alt, type, sort_order)
         VALUES ($1, $2, $3, $4, $5)`,
        [prodId, imgUrl, 'Jewellery', i === 0 ? 'main' : 'gallery', i + 1]
      );
    }
    
    console.log("Success!");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

run();
