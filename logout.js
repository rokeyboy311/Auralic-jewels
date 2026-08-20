const fs = require('fs');
let content = fs.readFileSync('backend/src/routes/api.routes.ts', 'utf8');

const logoutRoute = `
// ==========================================================
// LOGOUT (Clear Cookie)
// ==========================================================
router.post('/auth/logout', (req, res) => {
  res.clearCookie('aurelia_auth_token', {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'lax',
    path: '/'
  });
  return res.json({ success: true, message: 'Successfully logged out.' });
});
`;

if (!content.includes('/auth/logout')) {
  content = content.replace(/\/\/ 3\. PUBLIC E-COMMERCE ROUTES/g, logoutRoute + '\n// 3. PUBLIC E-COMMERCE ROUTES');
  fs.writeFileSync('backend/src/routes/api.routes.ts', content);
}
