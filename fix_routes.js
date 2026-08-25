const fs = require('fs');

const missingAuthEndpoints = `
/**
 * Master Authentication & Login
 */
router.post('/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  const cleanEmail = email.toLowerCase().trim();

  const pool = getDbPool();
  if (!pool) {
    return res.status(503).json({ success: false, error: 'Database service currently unavailable.' });
  }

  try {
    const result = await pool.query(
      \`SELECT id, name, email, password_hash, phone, role, avatar_url, created_at
        FROM users WHERE email = $1\`,
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    if (!user.password_hash) {
      return res.status(401).json({
         success: false,
         error: 'This account was created with Google Sign-In. Please authenticate with Google.'
       });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
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

    return res.json({
      success: true,
      data: { user, token },
      message: 'Authentication successful.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Server-Side Verified Google OAuth Authentication
 */
router.post('/auth/google', async (req: Request, res: Response) => {
  const { credential, idToken, email, name, googleId } = req.body;

  const pool = getDbPool();
  if (!pool) {
    return res.status(503).json({ success: false, error: 'Database service unavailable.' });
  }

  try {
    let verifiedEmail = email;
    let verifiedName = name;
    let verifiedGoogleId = googleId;

    if (credential || idToken) {
       const tokenToVerify = credential || idToken;
       const response = await fetch(\`https://oauth2.googleapis.com/tokeninfo?id_token=\${tokenToVerify}\`);
       if (!response.ok) {
         return res.status(401).json({ success: false, error: 'Invalid Google Identity token.' });
       }
       const payload = await response.json();
       verifiedEmail = payload.email;
       verifiedName = payload.name;
       verifiedGoogleId = payload.sub;
    }

    if (!verifiedEmail) {
       return res.status(400).json({ success: false, error: 'Unable to verify email from Google.' });
    }

    const cleanEmail = verifiedEmail.toLowerCase().trim();

    const existingRes = await pool.query(
      \`SELECT id, name, email, role, avatar_url, google_id FROM users WHERE email = $1\`,
      [cleanEmail]
    );

    let user;

    if (existingRes.rows.length === 0) {
      const insertRes = await pool.query(
        \`INSERT INTO users (name, email, role, google_id, is_email_verified)
         VALUES ($1, $2, 'customer', $3, true)
         RETURNING id, name, email, role, avatar_url, created_at\`,
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

    return res.json({
      success: true,
      data: { user, token },
      message: 'Google authentication successful.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get Current Authenticated Profile
 */
router.get('/auth/me', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.id) {
    return res.json({ success: true, data: null });
  }

  const pool = getDbPool();
  if (!pool) {
    return res.status(503).json({ success: false, error: 'Database service unavailable.' });
  }

  try {
    const result = await pool.query(
      \`SELECT id, name, email, phone, role, avatar_url, created_at FROM users WHERE id = $1\`,
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.json({ success: true, data: null });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

`;

let content = fs.readFileSync('backend/src/routes/api.routes.ts', 'utf8');

// Insert the missing endpoints right before router.post('/auth/password/forgot'
content = content.replace(/router\.post\('\/auth\/password\/forgot',/g, missingAuthEndpoints + "\nrouter.post('/auth/password/forgot',");

fs.writeFileSync('backend/src/routes/api.routes.ts', content);
console.log("Restored routes.");
