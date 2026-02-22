import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'smol-toml';
import { uuidv7 } from 'uuidv7';
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

// --- Session and Message filesystem operations ---

export function getSessionsDir(agentId: string): string {
  return path.join(getAgentStateDir(agentId), 'sessions');
}

export function getSessionDir(agentId: string, sessionId: string): string {
  return path.join(getSessionsDir(agentId), sessionId);
}

interface SessionMeta {
  title: string;
  created_at: string;
  updated_at: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
}

interface MessageRecord {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

export function createSession(agentId: string): {
  id: string;
  agentId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
} {
  const id = uuidv7();
  const now = new Date().toISOString();
  const dir = getSessionDir(agentId, id);
  fs.mkdirSync(dir, { recursive: true });
  const title = new Date(now).toLocaleString();
  const meta: SessionMeta = {
    title,
    created_at: now,
    updated_at: now,
    input_tokens: 0,
    output_tokens: 0,
    total_tokens: 0,
  };
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta));
  return { id, agentId, title: meta.title, createdAt: now, updatedAt: now };
}

export function listSessions(agentId: string): {
  id: string;
  agentId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}[] {
  const dir = getSessionsDir(agentId);
  let entries: string[];
  try {
    entries = fs.readdirSync(dir);
  } catch {
    return [];
  }
  return entries
    .sort()
    .map((id) => {
      try {
        const raw = fs.readFileSync(path.join(dir, id, 'meta.json'), 'utf-8');
        const meta = JSON.parse(raw) as SessionMeta;
        return {
          id,
          agentId,
          title: meta.title,
          createdAt: meta.created_at,
          updatedAt: meta.updated_at,
          inputTokens: meta.input_tokens ?? 0,
          outputTokens: meta.output_tokens ?? 0,
          totalTokens: meta.total_tokens ?? 0,
        };
      } catch {
        return null;
      }
    })
    .filter((s) => s !== null);
}

export function deleteSession(agentId: string, sessionId: string): void {
  const dir = getSessionDir(agentId, sessionId);
  fs.rmSync(dir, { recursive: true, force: true });
}

export function updateSessionTokenUsage(
  agentId: string,
  sessionId: string,
  usage: { inputTokens: number; outputTokens: number; totalTokens: number },
): void {
  const metaPath = path.join(getSessionDir(agentId, sessionId), 'meta.json');
  try {
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8')) as SessionMeta;
    meta.input_tokens = (meta.input_tokens ?? 0) + usage.inputTokens;
    meta.output_tokens = (meta.output_tokens ?? 0) + usage.outputTokens;
    meta.total_tokens = (meta.total_tokens ?? 0) + usage.totalTokens;
    fs.writeFileSync(metaPath, JSON.stringify(meta));
  } catch {
    /* ignore — session may have been deleted */
  }
}

export function appendMessage(
  agentId: string,
  sessionId: string,
  role: string,
  content: string,
): { id: string; sessionId: string; role: string; content: string; createdAt: string } {
  const id = uuidv7();
  const now = new Date().toISOString();
  const dir = getSessionDir(agentId, sessionId);
  const record: MessageRecord = { id, role, content, created_at: now };
  fs.appendFileSync(path.join(dir, 'messages.jsonl'), JSON.stringify(record) + '\n');
  // Update session's updated_at
  const metaPath = path.join(dir, 'meta.json');
  try {
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8')) as SessionMeta;
    meta.updated_at = now;
    fs.writeFileSync(metaPath, JSON.stringify(meta));
  } catch {
    /* ignore */
  }
  return { id, sessionId, role, content, createdAt: now };
}

export function listMessages(
  agentId: string,
  sessionId: string,
): { id: string; sessionId: string; role: string; content: string; createdAt: string }[] {
  const filePath = path.join(getSessionDir(agentId, sessionId), 'messages.jsonl');
  let raw: string;
  try {
    raw = fs.readFileSync(filePath, 'utf-8');
  } catch {
    return [];
  }
  return raw
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => {
      const r = JSON.parse(line) as MessageRecord;
      return { id: r.id, sessionId, role: r.role, content: r.content, createdAt: r.created_at };
    });
}
