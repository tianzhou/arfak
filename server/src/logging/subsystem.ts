import fs from 'node:fs';
import path from 'node:path';
import { getDefaultTmpDir } from '../lib/tmpdir.js';
import { isLevelEnabled, type LogLevel } from './levels.js';

export type SubsystemLogger = {
  subsystem: string;
  isEnabled: (level: LogLevel) => boolean;
  trace: (message: string, meta?: Record<string, unknown>) => void;
  debug: (message: string, meta?: Record<string, unknown>) => void;
  info: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
  fatal: (message: string, meta?: Record<string, unknown>) => void;
  child: (name: string) => SubsystemLogger;
};

// ── Console formatting ──────────────────────────────────────────────

const SUBSYSTEM_COLORS = [
  '\x1b[36m', // cyan
  '\x1b[33m', // yellow
  '\x1b[35m', // magenta
  '\x1b[32m', // green
  '\x1b[34m', // blue
  '\x1b[91m', // bright red
  '\x1b[92m', // bright green
  '\x1b[93m', // bright yellow
  '\x1b[94m', // bright blue
  '\x1b[95m', // bright magenta
  '\x1b[96m', // bright cyan
];

const LEVEL_COLORS: Partial<Record<LogLevel, string>> = {
  fatal: '\x1b[31m',
  error: '\x1b[31m',
  warn: '\x1b[33m',
  info: '\x1b[36m',
  debug: '\x1b[90m',
  trace: '\x1b[90m',
};

const RESET = '\x1b[0m';

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getSubsystemColor(subsystem: string): string {
  return SUBSYSTEM_COLORS[hashCode(subsystem) % SUBSYSTEM_COLORS.length];
}

function formatTime(): string {
  return new Date().toTimeString().slice(0, 8);
}

const isTTY = process.stdout.isTTY ?? false;
const noColor = !!process.env.NO_COLOR;
const useColor = isTTY && !noColor;

function formatConsoleMessage(
  subsystem: string,
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>,
): string {
  const metaStr = meta && Object.keys(meta).length > 0 ? ' ' + JSON.stringify(meta) : '';

  if (!useColor) {
    const timestamp = new Date().toISOString();
    return `${timestamp} ${level.toUpperCase().padEnd(5)} [${subsystem}] ${message}${metaStr}`;
  }

  const time = formatTime();
  const subsystemColor = getSubsystemColor(subsystem);
  const levelColor = LEVEL_COLORS[level] ?? '';
  const coloredMeta = metaStr.length > 0 ? ` ${RESET}\x1b[90m${metaStr.slice(1)}${RESET}` : '';

  return `\x1b[90m${time}${RESET} ${levelColor}${level.toUpperCase().padEnd(5)}${RESET} ${subsystemColor}[${subsystem}]${RESET} ${message}${coloredMeta}`;
}

// ── File logging ────────────────────────────────────────────────────

const DEFAULT_LOG_FILE = path.join(getDefaultTmpDir(), 'arfak-%Y-%m-%d.log');

let filePathPattern: string = DEFAULT_LOG_FILE;

export function setLogFile(pattern: string): void {
  filePathPattern = pattern;
  dirCreated = false;
}

function strftime(pattern: string, date: Date): string {
  return pattern
    .replaceAll('%Y', String(date.getFullYear()))
    .replaceAll('%m', String(date.getMonth() + 1).padStart(2, '0'))
    .replaceAll('%d', String(date.getDate()).padStart(2, '0'))
    .replaceAll('%H', String(date.getHours()).padStart(2, '0'))
    .replaceAll('%M', String(date.getMinutes()).padStart(2, '0'))
    .replaceAll('%S', String(date.getSeconds()).padStart(2, '0'));
}

function getLogFilePath(): string {
  return strftime(filePathPattern, new Date());
}

let dirCreated = false;

function logToFile(
  subsystem: string,
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>,
): void {
  try {
    const filePath = getLogFilePath();
    if (!dirCreated) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      dirCreated = true;
    }
    const entry = {
      time: new Date().toISOString(),
      level,
      subsystem,
      message,
      ...meta,
    };
    fs.appendFileSync(filePath, JSON.stringify(entry) + '\n');
  } catch {
    // Never block on file write failures
  }
}

// ── Shared state ────────────────────────────────────────────────────

let currentLevel: LogLevel = 'info';

export function setLogLevel(level: LogLevel): void {
  currentLevel = level;
}

// ── Logger factory ──────────────────────────────────────────────────

export function createSubsystemLogger(subsystem: string): SubsystemLogger {
  function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    if (!isLevelEnabled(currentLevel, level)) return;

    logToFile(subsystem, level, message, meta);

    const formatted = formatConsoleMessage(subsystem, level, message, meta);

    if (level === 'error' || level === 'fatal') {
      console.error(formatted);
    } else if (level === 'warn') {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
  }

  return {
    subsystem,
    isEnabled: (level: LogLevel) => isLevelEnabled(currentLevel, level),
    trace: (message, meta) => log('trace', message, meta),
    debug: (message, meta) => log('debug', message, meta),
    info: (message, meta) => log('info', message, meta),
    warn: (message, meta) => log('warn', message, meta),
    error: (message, meta) => log('error', message, meta),
    fatal: (message, meta) => log('fatal', message, meta),
    child: (name: string) => createSubsystemLogger(`${subsystem}/${name}`),
  };
}
