const fs = require('fs');
const lines = fs.readFileSync('backend/src/routes/api.routes.ts', 'utf8').split('\n');

const startIdx = lines.findIndex(l => l.includes("router.post('/auth/register'"));
const endIdx = lines.findIndex(l => l.includes("// 3. MEDIA UPLOADS"));

if (startIdx !== -1 && endIdx !== -1) {
    const newAuth = `
// ==========================================================
// 2. AUTHENTICATION & IDENTITY
// ==========================================================

router.post('/auth/register', async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
  }
  const cleanEmail = email.toLowerCase().trim();
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database service unavailable.' });
  try {
    const existCheck = await pool.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existCheck.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'Account already exists for this email.' });
    }
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);
    // Force role to customer for self-registration
    const insertRes = await pool.query(
      \`INSERT INTO users (name, email, password_hash, role, is_email_verified)
       VALUES ($1, $2, $3, 'customer', true) RETURNING id, name, email, role\`,
      [name, cleanEmail, passwordHash]
    );
    return res.status(201).json({ success: true, message: 'Registration successful.', data: insertRes.rows[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }
  const cleanEmail = email.toLowerCase().trim();
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database service unavailable.' });
  try {
    const result = await pool.query('SELECT id, name, email, password_hash, phone, role, avatar_url FROM users WHERE email = $1', [cleanEmail]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }
    const user = result.rows[0];
    if (!user.password_hash) {
      return res.status(401).json({ success: false, error: 'Account uses Google Sign-In.' });
    }
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
    delete user.password_hash;
    res.cookie('auralic_auth_token', token, {
      httpOnly: true,
      secure: config.env === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: config.env === 'production' ? 'none' : 'lax',
      path: '/'
    });
    return res.json({ success: true, data: { user, token }, message: 'Authentication successful.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/auth/google', async (req: Request, res: Response) => {
  const { credential, idToken, email, name, googleId } = req.body;
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database service unavailable.' });
  try {
    let verifiedEmail = email;
    let verifiedName = name;
    let verifiedGoogleId = googleId;
    if (credential || idToken) {
       const tokenToVerify = credential || idToken;
       const response = await fetch(\`https://oauth2.googleapis.com/tokeninfo?id_token=\${tokenToVerify}\`);
       if (!response.ok) return res.status(401).json({ success: false, error: 'Invalid Google Identity token.' });
       const payload = await response.json();
       verifiedEmail = payload.email;
       verifiedName = payload.name;
       verifiedGoogleId = payload.sub;
    }
    if (!verifiedEmail) return res.status(400).json({ success: false, error: 'Unable to verify email from Google.' });
    const cleanEmail = verifiedEmail.toLowerCase().trim();
    const existingRes = await pool.query('SELECT id, name, email, role, avatar_url, google_id FROM users WHERE email = $1', [cleanEmail]);
    let user;
    if (existingRes.rows.length === 0) {
      const insertRes = await pool.query(
        \`INSERT INTO users (name, email, role, google_id, is_email_verified)
         VALUES ($1, $2, 'customer', $3, true)
         RETURNING id, name, email, role, avatar_url\`,
        [verifiedName || 'Patron Client', cleanEmail, verifiedGoogleId]
      );
      user = insertRes.rows[0];
    } else {
      user = existingRes.rows[0];
      if (!user.google_id) {
         await pool.query(\`UPDATE users SET google_id = $1 WHERE id = $2\`, [verifiedGoogleId, user.id]);
      }
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
    res.cookie('auralic_auth_token', token, {
      httpOnly: true,
      secure: config.env === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: config.env === 'production' ? 'none' : 'lax',
      path: '/'
    });
    return res.json({ success: true, data: { user, token } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/auth/logout', (req: Request, res: Response) => {
  res.clearCookie('auralic_auth_token', { path: '/' });
  res.json({ success: true, message: 'Logged out successfully.' });
});

router.get('/auth/me', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.id) return res.json({ success: true, data: null });
  const pool = getDbPool();
  if (!pool) return res.status(503).json({ success: false, error: 'Database service unavailable.' });
  try {
    const result = await pool.query('SELECT id, name, email, phone, role, avatar_url, created_at FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) return res.json({ success: true, data: null });
    return res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/auth/password/forgot', async (req: Request, res: Response) => {
  return res.json({ success: true, message: 'If an account is associated with this email, security instructions have been dispatched.' });
});

router.post('/auth/password/reset', async (req: Request, res: Response) => {
  return res.status(400).json({ success: false, error: 'Invalid or expired reset token.' });
});
`;
    lines.splice(startIdx, endIdx - startIdx, newAuth);
    fs.writeFileSync('backend/src/routes/api.routes.ts', lines.join('\n'));
    console.log("Replaced block successfully.");
} else {
    console.log("Could not find bounds.");
}
