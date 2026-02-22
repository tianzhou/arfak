import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'smol-toml';
import { createSubsystemLogger } from '../logging/index.js';

const log = createSubsystemLogger('profile');

export function getProfileDir(): string {
  return process.env.ARFAK_PROFILE ?? process.cwd();
}

export function getWorkspaceDir(): string {
  return path.join(getProfileDir(), 'workspace');
}

export function getStateDir(): string {
  return path.join(getProfileDir(), 'state');
}

export function getAgentConfigDir(id: string): string {
  return path.join(getWorkspaceDir(), 'agents', id);
}

export function getAgentStateDir(id: string): string {
  return path.join(getStateDir(), 'agents', id);
}

function parseFrontmatter(raw: string, defaultLabel: string): { label: string; body: string } {
  const match = raw.match(/^\+\+\+\n([\s\S]*?)\n\+\+\+\n?([\s\S]*)$/);
  if (!match) {
    return { label: defaultLabel, body: raw };
  }
  try {
    const meta = parse(match[1]) as { label?: string };
    return { label: meta.label ?? defaultLabel, body: match[2] };
  } catch (error) {
    log.warn('Failed to parse TOML frontmatter, using default label', {
      error: String(error),
    });
    return { label: defaultLabel, body: match[2] };
  }
}

function readMdDir(dirPath: string): { label: string; content: string }[] {
  let entries: string[];
  try {
    entries = fs.readdirSync(dirPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }

  return entries
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((file) => {
      const raw = fs.readFileSync(path.join(dirPath, file), 'utf-8');
      const defaultLabel = path.basename(file, '.md');
      const { label, body } = parseFrontmatter(raw, defaultLabel);
      return { label, content: body };
    });
}

function readMdFile(filePath: string): string {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return parseFrontmatter(raw, '').body;
  } catch {
    return '';
  }
}

export function readAgentSoul(id: string): string {
  return readMdFile(path.join(getAgentConfigDir(id), 'soul.md'));
}

export function readAgentMemory(id: string): { label: string; content: string }[] {
  return readMdDir(path.join(getAgentStateDir(id), 'memory'));
}

export function readAgentRules(id: string): string {
  return readMdFile(path.join(getAgentConfigDir(id), 'rules.md'));
}

export function readAgentKnowledge(id: string): { label: string; content: string }[] {
  return readMdDir(path.join(getAgentConfigDir(id), 'knowledge'));
}
