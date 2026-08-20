const fs = require('fs');

const files = [
  'app/custom-jewellery/page.tsx',
  'components/CustomDesignModal.tsx',
  'app/sitemap.ts'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // We are currently using `import * as api from '@/lib/api';`
  
  if (file.includes('page.tsx') || file.includes('CustomDesignModal')) {
    // replace api.get('/products...') with api.getProducts(...)
    // replace api.post('/bespoke'...) with api.submitBespokeInquiry(...)
    
    // For products in page.tsx:
    content = content.replace(/api\.get\('\/products\?limit=\d+'\)/g, "api.getProducts()");
    
    // For bespoke:
    content = content.replace(/api\.post\('\/bespoke',\s*payload\)/g, "api.submitBespokeInquiry(payload)");
    
    // Note: getProducts supports params. For simplicity if the API signature is different, let's just make it work.
  }
  
  if (file.includes('sitemap.ts')) {
    // replace api.get('/products') with api.getProducts()
    content = content.replace(/api\.get\('\/products'\)/g, "api.getProducts()");
  }

  fs.writeFileSync(file, content);
});
