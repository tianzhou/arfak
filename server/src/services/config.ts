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
    return parse(content) as ArfakConfig;
  } catch {
    return {};
  }
}

export const configHandlers = {
  async getConfig() {
    const config = loadConfig();
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
