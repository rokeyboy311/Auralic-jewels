const fs = require('fs');
let content = fs.readFileSync('backend/src/routes/api.routes.ts', 'utf8');

// 1. Remove fallback session and hardcoded admin passwords
content = content.replace(/const isAdminEmail = [^;]+;/g, '');
content = content.replace(/if \(!pool\) \{[\s\S]*?return res.json\(\{[\s\S]*?message: 'Authentication successful.',\n    \}\);\n  \}/, `if (!pool) {
    return res.status(503).json({ success: false, error: 'Database service currently unavailable.' });
  }`);

content = content.replace(/if \(!pool\) \{[\s\S]*?return res\.json\(\{[\s\S]*?role: req\.user\.role \|\| 'customer',\n        \}\n      \}\);\n    \}/g, `if (!pool) {
    return res.status(503).json({ success: false, error: 'Database service unavailable.' });
  }`);

// For the `if (result.rows.length === 0) { ... }` in login
content = content.replace(/if \(result\.rows\.length === 0\) \{[\s\S]*?return res\.status\(401\)\.json\(\{ success: false, error: 'Invalid email or password\.' \}\);\n    \}/, `if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }`);

// For password verification override
content = content.replace(/if \(!isValidPassword\) \{[\s\S]*?return res\.status\(401\)\.json\(\{ success: false, error: 'Invalid email or password\.' \}\);\n      \}\n    \}/, `if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }`);

// For role upgrade
content = content.replace(/\/\/ Ensure role is admin if it's an admin email[\s\S]*?await pool\.query\(`UPDATE users SET role = 'admin' WHERE id = \$1`, \[user\.id\]\);\n    \}/, ``);

fs.writeFileSync('backend/src/routes/api.routes.ts', content);
console.log("Auth patched.");
