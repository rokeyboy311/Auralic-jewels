const fs = require('fs');

const cj = 'app/custom-jewellery/page.tsx';
if (fs.existsSync(cj)) {
  let content = fs.readFileSync(cj, 'utf8');
  content = content.replace(/api\.getProducts\('\/products\?limit=\d+'\)/g, "api.getProducts({ limit: 12 })");
  fs.writeFileSync(cj, content);
}

const modal = 'components/CustomDesignModal.tsx';
if (fs.existsSync(modal)) {
  let content = fs.readFileSync(modal, 'utf8');
  content = content.replace(/api\.getProducts\('\/products\?limit=\d+'\)/g, "api.getProducts({ limit: 24 })");
  fs.writeFileSync(modal, content);
}
