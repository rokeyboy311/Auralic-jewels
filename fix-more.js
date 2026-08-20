const fs = require('fs');

const sitemap = 'app/sitemap.ts';
if (fs.existsSync(sitemap)) {
  let content = fs.readFileSync(sitemap, 'utf8');
  content = content.replace(/api\.get/g, "api.getProducts");
  fs.writeFileSync(sitemap, content);
}

const cj = 'app/custom-jewellery/page.tsx';
if (fs.existsSync(cj)) {
  let content = fs.readFileSync(cj, 'utf8');
  content = content.replace(/api\.submitBespokeInquiry\(payload\)/g, "api.submitBespokeInquiry(payload as any)");
  fs.writeFileSync(cj, content);
}

const modal = 'components/CustomDesignModal.tsx';
if (fs.existsSync(modal)) {
  let content = fs.readFileSync(modal, 'utf8');
  content = content.replace(/api\.submitBespokeInquiry\(payload\)/g, "api.submitBespokeInquiry(payload as any)");
  fs.writeFileSync(modal, content);
}
