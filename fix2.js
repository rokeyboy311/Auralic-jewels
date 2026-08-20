const fs = require('fs');
let content = fs.readFileSync('backend/src/routes/api.routes.ts', 'utf8');

const cookieBlock = `    res.cookie('aurelia_auth_token', token, {
      httpOnly: true,
      secure: config.env === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      path: '/'
    });
`;

content = content.split(cookieBlock).join(''); // remove all cookie blocks

// Now re-insert carefully:
// 1. After delete user.password_hash; in /auth/login
content = content.replace(/delete user\.password_hash;\n    return res\.json\(\{/g, `delete user.password_hash;\n${cookieBlock}    return res.json({`);

// 2. In /auth/register, before return res.status(201)
const registerMatch = `    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    return res.status(201).json({`;
const registerReplace = `    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
${cookieBlock}    return res.status(201).json({`;
content = content.replace(registerMatch, registerReplace);

// 3. In /auth/google
const googleMatch = `    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      data: { user, token },
      message: 'Google authentication successful.',
    });`;
const googleReplace = `    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
${cookieBlock}    return res.json({
      success: true,
      data: { user, token },
      message: 'Google authentication successful.',
    });`;
content = content.replace(googleMatch, googleReplace);

fs.writeFileSync('backend/src/routes/api.routes.ts', content);
