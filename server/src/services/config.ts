import fs from 'node:fs';
import { watch } from 'chokidar';
import { parse } from 'smol-toml';

const configPath = process.env.ARFAK_CONFIG ?? 'arfak.toml';

interface ArfakConfig {
  general?: {
    banner?: {
      text?: string;
      link?: string;
      color?: string;
    };
  };
}

function loadConfig(): ArfakConfig {
  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    return parse(content) as ArfakConfig;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error(`Failed to load config from ${configPath}:`, error);
    }
    return {};
  }
}

let config = loadConfig();

const watcher = watch(configPath, { ignoreInitial: true });

watcher.on('all', (event) => {
  config = loadConfig();
  if (event === 'unlink') {
    console.log(`Config file removed: ${configPath}`);
  } else {
    console.log(`Config reloaded from ${configPath}`);
  }
});

console.log(
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
};
