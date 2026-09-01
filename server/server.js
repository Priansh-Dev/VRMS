const app = require('./app');
const config = require('./config/env');
const logger = require('./utils/logger');
const { close } = require('./config/database');

const server = app.listen(config.port, '0.0.0.0', () => {
  const address = server.address();
  logger.info(`VRMS Server started`, {
    port: config.port,
    environment: config.nodeEnv,
    url: config.appUrl,
    address: JSON.stringify(address)
  });
});

server.on('error', (err) => {
  logger.error('Server error', { error: err.message, code: err.code });
  process.exit(1);
});

server.on('listening', () => {
  logger.info('Server listening event fired');
});

server.on('close', () => {
  logger.info('Server close event fired');
});

process.on('exit', (code) => {
  logger.info('Process exit', { code });
});

setInterval(() => {}, 1000);

const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received, shutting down gracefully`);
  server.close(async () => {
    await close();
    logger.info('Server closed');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', { reason: reason?.message || reason });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

module.exports = server;