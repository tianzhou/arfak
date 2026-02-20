import fs from 'node:fs';
import { watch } from 'chokidar';
import { parse } from 'smol-toml';
import {
  createSubsystemLogger,
  normalizeLogLevel,
  setLogFile,
  setLogLevel,
} from '../logging/index.js';

const log = createSubsystemLogger('config');

const configPath = process.env.ARFAK_CONFIG ?? 'arfak.toml';

export interface ModelConfig {
  id: string;
  name: string;
  vendor: string;
  model: string;
  api_key: string;
}

interface ArfakConfig {
  general?: {
    logging?: {
      level?: string;
      file?: string;
    };
    banner?: {
      text?: string;
      link?: string;
      color?: string;
    };
  };
  models?: ModelConfig[];
}

function loadConfig(): ArfakConfig {
  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    return parse(content) as ArfakConfig;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      log.error(`Failed to load config from ${configPath}`, {
        error: String(error),
      });
    }
    return {};
  }
}

function applyLoggingConfig(cfg: ArfakConfig): void {
  setLogLevel(normalizeLogLevel(cfg.general?.logging?.level));
  if (cfg.general?.logging?.file) {
    setLogFile(cfg.general.logging.file);
  }
}

let config = loadConfig();
applyLoggingConfig(config);

const watcher = watch(configPath, { ignoreInitial: true });

watcher.on('all', (event) => {
  config = loadConfig();
  applyLoggingConfig(config);
  if (event === 'unlink') {
    log.info(`Config file removed: ${configPath}`);
  } else {
    log.info(`Config reloaded from ${configPath}`);
  }
});

log.info(
  Object.keys(config).length > 0
    ? `Config loaded from ${configPath}`
    : `No config file found at ${configPath}`,
);

export function getModels(): ModelConfig[] {
  return config.models ?? [];
}

export const configHandlers = {
  async getConfig() {
    const banner = config.general?.banner;

    if (!banner?.text) {
      return {};
    }

    return {
      banner: {
        text: banner.text,
        link: banner.link ?? '',
        color: banner.color ?? '',
      },
    };
  },
};
