import { watch } from 'chokidar';
import fs from 'node:fs';
import { parse } from 'smol-toml';
import {
  createSubsystemLogger,
  normalizeLogLevel,
  setLogFile,
  setLogLevel,
} from '../logging/index.js';

const log = createSubsystemLogger('config');

const configPath = process.env.ARFAK_CONFIG ?? 'arfak.toml';

interface ModelConfig {
  id: string;
  name: string;
  vendor: string;
  model: string;
  api_key: string;
}

interface AgentConfig {
  id: string;
  name: string;
  model: string;
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
  agents?: AgentConfig[];
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

function findDuplicates(ids: string[]): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) dupes.add(id);
    else seen.add(id);
  }
  return [...dupes];
}

function validateConfig(cfg: ArfakConfig): string[] {
  const errors: string[] = [];
  const models = cfg.models ?? [];
  const agents = cfg.agents ?? [];
  const modelIds = models.map((m) => m.id);

  for (const id of findDuplicates(modelIds)) {
    errors.push(`Duplicate model id: "${id}"`);
  }
  for (const id of findDuplicates(agents.map((a) => a.id))) {
    errors.push(`Duplicate agent id: "${id}"`);
  }
  for (const agent of agents) {
    if (!modelIds.includes(agent.model)) {
      errors.push(`Agent "${agent.id}" references unknown model id: "${agent.model}"`);
    }
  }

  return errors;
}

let config = loadConfig();
applyLoggingConfig(config);

const startupErrors = validateConfig(config);
if (startupErrors.length > 0) {
  for (const error of startupErrors) log.error(error);
  process.exit(1);
}

const watcher = watch(configPath, { ignoreInitial: true });

watcher.on('all', (event) => {
  const newConfig = loadConfig();
  const errors = validateConfig(newConfig);
  if (errors.length > 0) {
    for (const error of errors) {
      log.error(error);
    }
    log.warn('Config reload aborted due to validation errors');
    return;
  }
  config = newConfig;
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

  async listModels() {
    return {
      models: (config.models ?? []).map(({ id, name, vendor, model }) => ({
        id,
        name,
        vendor,
        model,
      })),
    };
  },

  async listAgents() {
    return {
      agents: (config.agents ?? []).map(({ id, name, model }) => ({
        id,
        name,
        model,
      })),
    };
  },
};
