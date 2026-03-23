/**
 * Structured Logger
 * Provides consistent, prefixed log lines across all server modules.
 * Swap the underlying implementation for Pino/Winston in production.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function log(level: LogLevel, module: string, message: string, meta?: object) {
  const ts = new Date().toISOString();
  const prefix = `[${ts}] [${level.toUpperCase()}] [${module}]`;
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  const line = `${prefix} ${message}${metaStr}`;

  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info:  (module: string, message: string, meta?: object) => log('info',  module, message, meta),
  warn:  (module: string, message: string, meta?: object) => log('warn',  module, message, meta),
  error: (module: string, message: string, meta?: object) => log('error', module, message, meta),
  debug: (module: string, message: string, meta?: object) => {
    if (process.env.NODE_ENV !== 'production') log('debug', module, message, meta);
  },
};
