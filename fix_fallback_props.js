const fs = require('fs');
let content = fs.readFileSync('backend/src/routes/api.routes.ts', 'utf8');

// Replace fallback references
content = content.replace(/\|\| fallback\?\.imageUrl /g, '');
content = content.replace(/\|\| fallback\?\.description /g, '');
content = content.replace(/\|\| fallback\?\.itemCount /g, '');
content = content.replace(/\|\| fallback\?\.bannerImage /g, '');
content = content.replace(/\|\| fallback\?\.subtitle /g, '');

content = content.replace(/const fallback = null;/g, '');

fs.writeFileSync('backend/src/routes/api.routes.ts', content);
console.log("Fallback props removed from backend.");
