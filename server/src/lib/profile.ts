import path from 'node:path';

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
