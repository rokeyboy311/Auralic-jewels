const fs = require('fs');

let content = fs.readFileSync('src/routes/api.routes.ts', 'utf8');

const cookieStr = `    res.cookie('aurelia_auth_token', token, {
      httpOnly: true,
      secure: config.env === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      path: '/'
    });
`;

content = content.replace(/delete user\.password_hash;\n    return res\.json\({/g, `delete user.password_hash;\n${cookieStr}    return res.json({`);
content = content.replace(/    return res\.status\(201\)\.json\(\{/g, `${cookieStr}    return res.status(201).json({`);
content = content.replace(/    return res\.json\(\{\n      success: true,\n      data: \{ user, token \},\n      message: 'Google authentication successful.',/g, `${cookieStr}    return res.json({\n      success: true,\n      data: { user, token },\n      message: 'Google authentication successful.',`);

fs.writeFileSync('src/routes/api.routes.ts', content);
