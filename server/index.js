/**
 * index.js — entry point.  Run with:  npm start   (or  npm run dev  to auto-restart on edits)
 */
import { createApp } from './app.js';

const port = Number(process.env.PORT) || 3000;
const { server } = await createApp();

server.listen(port, () => {
  console.log(`\n  Portfolio running at  http://localhost:${port}`);
  console.log('  API health check      http://localhost:' + port + '/api/health\n');
});

// Graceful shutdown: stop accepting new connections, let in-flight requests finish.
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
