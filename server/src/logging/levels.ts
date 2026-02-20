export type LogLevel = 'silent' | 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

const LOG_LEVEL_VALUES: Record<LogLevel, number> = {
  silent: Number.POSITIVE_INFINITY,
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};

export function normalizeLogLevel(level: string | undefined): LogLevel {
  if (!level) return 'info';
  const lower = level.toLowerCase();
  if (lower in LOG_LEVEL_VALUES) {
    return lower as LogLevel;
  }
  return 'info';
}

export function isLevelEnabled(currentLevel: LogLevel, targetLevel: LogLevel): boolean {
  return LOG_LEVEL_VALUES[targetLevel] <= LOG_LEVEL_VALUES[currentLevel];
}
