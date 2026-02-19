import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'smol-toml';

const configPath = process.env.ARFAK_CONFIG ?? path.join(process.cwd(), 'arfak.toml');

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
    console.log(`Config loaded from ${configPath}`);
    return parse(content) as ArfakConfig;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.log(`No config file found at ${configPath}`);
    } else {
      console.error(`Failed to load config from ${configPath}:`, error);
    }
    return {};
  }
}

const config = loadConfig();

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
