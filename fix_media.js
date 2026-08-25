const fs = require('fs');
let content = fs.readFileSync('backend/src/services/media.service.ts', 'utf8');

// Replace the fallback blocks with errors
content = content.replace(/if \(!pool\) \{[\s\S]*?return \{[\s\S]*?bytes,\n      \};\n    \}/g, `if (!pool) {
      throw new Error('Database pool unavailable for image storage.');
    }`);

content = content.replace(/} catch \(err: any\) \{[\s\S]*?return \{[\s\S]*?bytes,\n      \};\n    \}/g, `} catch (err: any) {
      console.error('[MediaService] Error storing image in Neon database:', err.message);
      throw new Error('Failed to store image in database: ' + err.message);
    }`);

fs.writeFileSync('backend/src/services/media.service.ts', content);
console.log("MediaService patched.");
