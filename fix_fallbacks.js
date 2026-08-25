const fs = require('fs');
let content = fs.readFileSync('backend/src/routes/api.routes.ts', 'utf8');

// The FALLBACK arrays are huge. We can replace everything from 'const DEFAULT_FALLBACK_PRODUCTS' to the end of that array declaration.
// Same for categories and collections.

// Regex to remove the large fallback arrays
content = content.replace(/const DEFAULT_FALLBACK_PRODUCTS = \[\s*\{[\s\S]*?\}\s*\];/g, '');
content = content.replace(/const DEFAULT_FALLBACK_CATEGORIES = \[\s*\{[\s\S]*?\}\s*\];/g, '');
content = content.replace(/const DEFAULT_FALLBACK_COLLECTIONS = \[\s*\{[\s\S]*?\}\s*\];/g, '');

// Also replace the uses of fallbacks where it returns them if the DB has no result or if DB is offline.
// Because the fallbacks are gone, we just return empty array or 503.

// If !pool, return 503 instead of fallback
content = content.replace(/if \(!pool\) return res\.json\(\{ success: true, data: DEFAULT_FALLBACK_[\w]+ \}\);/g, "if (!pool) return res.status(503).json({ success: false, error: 'Database service unavailable.' });");

// When returning fallback on empty rows:
// return res.json({ success: true, data: DEFAULT_FALLBACK_PRODUCTS }); -> return res.json({ success: true, data: [] });
content = content.replace(/return res\.json\(\{ success: true, data: DEFAULT_FALLBACK_PRODUCTS \}\);/g, "return res.json({ success: true, data: [] });");
content = content.replace(/return res\.json\(\{ success: true, data: DEFAULT_FALLBACK_CATEGORIES \}\);/g, "return res.json({ success: true, data: [] });");
content = content.replace(/return res\.json\(\{ success: true, data: DEFAULT_FALLBACK_COLLECTIONS \}\);/g, "return res.json({ success: true, data: [] });");

// For find fallback:
content = content.replace(/const fallback = DEFAULT_FALLBACK_[\w]+\.find\([^;]+\);/g, "const fallback = null;");

fs.writeFileSync('backend/src/routes/api.routes.ts', content);
console.log("Fallbacks removed from backend.");
