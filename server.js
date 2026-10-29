import express from 'express';
import { fileURLToPath } from 'node:url';

const app = express();
const dist = fileURLToPath(new URL('./dist/', import.meta.url));
const port = Number(process.env.PORT || 8080);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}
app.disable('x-powered-by');
app.get('/healthz', (_req, res) => res.type('text').send('ok'));
app.use(express.static(dist, {
  index: 'index.html',
  fallthrough: false,
  setHeaders(res, path) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', /[/\\]assets[/\\]/.test(path)
      ? 'public, max-age=31536000, immutable' : 'no-cache');
  },
}));
app.use((error, _req, res, _next) => {
  const status = error.status === 404 ? 404 : 500;
  res.status(status).type('text').send(status === 404 ? 'Not found' : 'Unable to serve this file');
});
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`App listening on port ${port}`);
});
process.on('SIGTERM', () => server.close(() => process.exit(0)));
