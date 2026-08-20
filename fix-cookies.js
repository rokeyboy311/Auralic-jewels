const fs = require('fs');

let content = fs.readFileSync('backend/src/routes/api.routes.ts', 'utf8');

const cookieStr = `    res.cookie('aurelia_auth_token', token, {
      httpOnly: true,
      secure: config.env === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      path: '/'
    });
`;

content = content.replace(new RegExp(cookieStr.replace(/[.*+?^$\{\}\(\)|[\\]\\]/g, '\\$&') + '    return res\\.status\\(201\\)\\.json\\(\\{', 'g'), '    return res.status(201).json({');

content = content.replace(/delete user\.password_hash;\n    return res\.json\({/g, `delete user.password_hash;\n${cookieStr}    return res.json({`);
content = content.replace(/      message: 'Patron account successfully registered.',\n    \}\);/g, `      message: 'Patron account successfully registered.',\n    });`);

fs.writeFileSync('backend/src/routes/api.routes.ts', content);
