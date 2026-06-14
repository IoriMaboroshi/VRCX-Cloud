import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config.js';
import { initDb, closeDb } from './db/connection.js';
import { initSchema } from './db/schema.js';
import { logger } from './utils/logger.js';
import { apiRoutes } from './api/server/routes.js';
import { closeWebSocket } from './api/vrchat/websocket.js';
const fastify = Fastify({ logger: false, trustProxy: true });
await fastify.register(cors, { origin: true, methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] });
async function main() {
    await initDb();
    initSchema();
    await fastify.register(apiRoutes, { prefix: '/api' });
    fastify.get('/health', async () => ({ status: 'ok', version: '0.1.0', uptime: process.uptime() }));
    await fastify.listen({ port: config.port, host: config.host });
    logger.info(`VRCX Cloud Server running at http://${config.host}:${config.port}`);
}
async function shutdown(signal) {
    logger.info(`Received ${signal}, shutting down...`);
    try {
        closeWebSocket();
        await fastify.close();
        closeDb();
    }
    catch (e) {
        logger.error(String(e));
    }
    process.exit(0);
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (r) => logger.error(`Unhandled rejection: ${r}`));
process.on('uncaughtException', (e) => logger.error(`Uncaught exception: ${e.message}`));
main();
//# sourceMappingURL=index.js.map