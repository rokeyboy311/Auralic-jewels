const fs = require('fs');

const files = ['app/custom-jewellery/page.tsx', 'components/CustomDesignModal.tsx'];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/selectedProduct\.images/g, "selectedProduct?.images");
    content = content.replace(/selectedProduct\.priceUSD/g, "selectedProduct?.priceUSD");
    fs.writeFileSync(f, content);
  }
});
