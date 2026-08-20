const fs = require('fs');

const cj = 'app/custom-jewellery/page.tsx';
if (fs.existsSync(cj)) {
  let content = fs.readFileSync(cj, 'utf8');
  content = content.replace(/if \(res\.success\) \{/g, "if (res.success && res.data) {");
  fs.writeFileSync(cj, content);
}

const modal = 'components/CustomDesignModal.tsx';
if (fs.existsSync(modal)) {
  let content = fs.readFileSync(modal, 'utf8');
  content = content.replace(/if \(res\.success\) \{/g, "if (res.success && res.data) {");
  fs.writeFileSync(modal, content);
}
