const fs = require('fs');
let content = fs.readFileSync('lib/api.ts', 'utf8');

// Replace the fallback definitions with empty arrays
content = content.replace(/export const FALLBACK_PRODUCTS: Product\[\] = \[\s*\{[\s\S]*?\}\s*\];/g, 'export const FALLBACK_PRODUCTS: Product[] = [];');
content = content.replace(/export const FALLBACK_CATEGORIES: Category\[\] = \[\s*\{[\s\S]*?\}\s*\];/g, 'export const FALLBACK_CATEGORIES: Category[] = [];');
content = content.replace(/export const FALLBACK_COLLECTIONS: Collection\[\] = \[\s*\{[\s\S]*?\}\s*\];/g, 'export const FALLBACK_COLLECTIONS: Collection[] = [];');

// Now, in api.ts, fetchApi currently catches errors and sometimes returns fallbacks. We need to find those and make sure they just return the error.
// Actually, since the arrays are empty, if it returns them, it's just an empty array which is fine.

fs.writeFileSync('lib/api.ts', content);
console.log("Frontend fallbacks emptied.");
