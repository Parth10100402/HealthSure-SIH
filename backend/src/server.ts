// HealthSure — Server Entrypoint
// backend/src/server.ts

import { createApp } from './app.js';
import { config } from './config/env.js';
import { dataStore } from './db/store.js';

async function startServer() {
  // Initialize and seed store
  await dataStore.initialize();

  const app = createApp();
  const PORT = config.PORT;

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 HealthSure Backend REST API Server is running`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔒 Role-Based Access Control: Active`);
    console.log(`====================================================`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
