import { config } from '../../config.js';
export async function apiKeyAuth(request, reply) {
    const h = request.headers.authorization;
    if (!h) {
        reply.code(401).send({ error: 'Missing Authorization header' });
        return;
    }
    const p = h.split(' ');
    if (p.length !== 2 || p[0] !== 'Bearer') {
        reply.code(401).send({ error: 'Invalid format' });
        return;
    }
    if (p[1] !== config.apiKey) {
        reply.code(401).send({ error: 'Invalid API key' });
        return;
    }
}
//# sourceMappingURL=middleware.js.map