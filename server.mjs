import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');
const port = Number(process.env.PORT) || 3000;

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.ico', 'image/x-icon'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
]);

const send = (res, statusCode, headers, body) => {
  res.writeHead(statusCode, headers);
  res.end(body);
};

const serveFile = async (req, res, filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = contentTypes.get(ext) || 'application/octet-stream';
  const body = await fs.readFile(filePath);

  const headers = {
    'Content-Type': contentType,
  };

  if (filePath.includes(`${path.sep}assets${path.sep}`)) {
    headers['Cache-Control'] = 'public, max-age=31536000, immutable';
  } else if (ext === '.html') {
    headers['Cache-Control'] = 'no-cache';
  } else {
    headers['Cache-Control'] = 'public, max-age=3600';
  }

  send(res, 200, headers, body);
};

const safeResolve = (urlPath) => {
  const decoded = decodeURIComponent(urlPath.split('?')[0] || '/');
  const normalized = path.posix
    .normalize(decoded)
    .replace(/^(\.\.(\/|\\|$))+/, '');

  const rel = normalized.startsWith('/') ? normalized.slice(1) : normalized;
  const abs = path.join(distDir, rel);
  return { normalized, abs };
};

const server = http.createServer(async (req, res) => {
  try {
    if (!req.url) {
      send(res, 400, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Bad Request');
      return;
    }

    const { abs } = safeResolve(req.url);

    try {
      const stat = await fs.stat(abs);
      if (stat.isFile()) {
        await serveFile(req, res, abs);
        return;
      }
    } catch {}

    const indexPath = path.join(distDir, 'index.html');
    await serveFile(req, res, indexPath);
  } catch {
    send(res, 500, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Internal Server Error');
  }
});

server.listen(port, () => {
  console.log(`Server listening on http://0.0.0.0:${port}`);
});
