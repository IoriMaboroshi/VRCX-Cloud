import { config } from '../config.js';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
const LEVELS: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

const currentLevel: LogLevel = (config.logLevel as LogLevel) ?? 'info';
const threshold = LEVELS[currentLevel] ?? LEVELS.info;

function formatMessage(level: LogLevel, msg: string, meta?: unknown): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta !== undefined ? ' ' + JSON.stringify(meta) : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${msg}${metaStr}`;
}

export const logger = {
    debug(msg: string, meta?: unknown): void {
        if (threshold <= LEVELS.debug) console.debug(formatMessage('debug', msg, meta));
    },
    info(msg: string, meta?: unknown): void {
        if (threshold <= LEVELS.info) console.info(formatMessage('info', msg, meta));
    },
    warn(msg: string, meta?: unknown): void {
        if (threshold <= LEVELS.warn) console.warn(formatMessage('warn', msg, meta));
    },
    error(msg: string, meta?: unknown): void {
        if (threshold <= LEVELS.error) console.error(formatMessage('error', msg, meta));
    },
};

export default logger;
