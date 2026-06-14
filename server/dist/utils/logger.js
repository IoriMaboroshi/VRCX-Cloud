import { config } from '../config.js';
const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLevel = config.logLevel ?? 'info';
const threshold = LEVELS[currentLevel] ?? LEVELS.info;
function formatMessage(level, msg, meta) {
    const timestamp = new Date().toISOString();
    const metaStr = meta !== undefined ? ' ' + JSON.stringify(meta) : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${msg}${metaStr}`;
}
export const logger = {
    debug(msg, meta) {
        if (threshold <= LEVELS.debug)
            console.debug(formatMessage('debug', msg, meta));
    },
    info(msg, meta) {
        if (threshold <= LEVELS.info)
            console.info(formatMessage('info', msg, meta));
    },
    warn(msg, meta) {
        if (threshold <= LEVELS.warn)
            console.warn(formatMessage('warn', msg, meta));
    },
    error(msg, meta) {
        if (threshold <= LEVELS.error)
            console.error(formatMessage('error', msg, meta));
    },
};
export default logger;
//# sourceMappingURL=logger.js.map