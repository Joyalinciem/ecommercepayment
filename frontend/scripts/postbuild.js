const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const indexFile = path.join(distDir, 'index.html');
const fourOhFour = path.join(distDir, '404.html');

if (!fs.existsSync(indexFile)) {
  console.error('postbuild: index.html not found in dist — run build first');
  process.exitCode = 1;
} else {
  try {
    fs.copyFileSync(indexFile, fourOhFour);
    console.log('postbuild: copied index.html -> 404.html');
  } catch (err) {
    console.error('postbuild: failed to copy file', err);
    process.exitCode = 1;
  }
}
