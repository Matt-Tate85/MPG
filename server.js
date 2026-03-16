const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const { execSync } = require('child_process');

const dev = process.env.NODE_ENV === 'development';
const port = parseInt(process.env.PORT || '8080', 10);

// Build the app if no production build exists.
// Handles cases where Oryx doesn't run next build, or the dist_app dir
// wasn't included in the deployment package.
if (!dev && !fs.existsSync('dist_app/BUILD_ID')) {
  console.log('No production build found - running next build...');
  try {
    execSync('node ./node_modules/next/dist/bin/next build', {
      stdio: 'inherit',
      cwd: __dirname,
    });
    console.log('Build complete.');
  } catch (err) {
    console.error('Build failed:', err.message);
    process.exit(1);
  }
}

const app = next({ dev, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, () => {
    console.log(`> Ready on port ${port}`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
