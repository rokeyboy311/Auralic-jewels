const fs = require('fs');
let content = fs.readFileSync('app/admin/page.tsx', 'utf8');

// Remove quick fill function
content = content.replace(/const handleQuickFillAdmin = \(\) => \{[\s\S]*?\};\n/, '');

// Remove quick fill button
content = content.replace(/\{\/\* Quick-Fill Helper for Testing \*\/\}[\s\S]*?<\/button>\n            <\/div>/, '');

fs.writeFileSync('app/admin/page.tsx', content);
