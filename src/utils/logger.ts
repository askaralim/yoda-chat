type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const levelColors: Record<LogLevel, string> = {
  info: '\x1b[36m', // cyan
  warn: '\x1b[33m', // yellow
  error: '\x1b[31m', // red
  debug: '\x1b[35m', // magenta
};

const resetColor = '\x1b[0m';

function formatMessage(level: LogLevel, message: string): string {
  const color = levelColors[level];
  const timestamp = new Date().toISOString();
  return `${color}[${timestamp}] [${level.toUpperCase()}]${resetColor} ${message}`;
}

export const logger = {
  info(message: string, ...meta: unknown[]): void {
    console.log(formatMessage('info', message), ...meta);
  },
  warn(message: string, ...meta: unknown[]): void {
    console.warn(formatMessage('warn', message), ...meta);
  },
  error(message: string, ...meta: unknown[]): void {
    console.error(formatMessage('error', message), ...meta);
  },
  debug(message: string, ...meta: unknown[]): void {
    if (process.env.LOG_LEVEL === 'debug') {
      console.debug(formatMessage('debug', message), ...meta);
    }
  },
};
