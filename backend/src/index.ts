import { createApp } from './app';
import { config } from './config/index';
import { getDbPool } from './db/connection';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`=======================================================`);
  console.log(`✨ AURELIC Fine Jewellery REST API Server Started`);
  console.log(`📡 Port: ${config.port}`);
  console.log(`🌍 Environment: ${config.env}`);
  console.log(`🔗 Allowed Frontend Origin: ${config.frontendUrl}`);
  console.log(`=======================================================`);

  // Initialize DB pool
  getDbPool();
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server gracefully');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
