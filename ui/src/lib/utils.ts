import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AGENT_STORAGE_KEY = 'arfak-agents';

type AgentSetting = {
  lastSessionId?: string;
};

function loadAgentSetting(agentId: string): AgentSetting {
  try {
    const raw = localStorage.getItem(AGENT_STORAGE_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw) as Record<string, AgentSetting>;
    return data[agentId] ?? {};
  } catch {
    return {};
  }
}

function saveAgentSetting(agentId: string, patch: AgentSetting): void {
  try {
    const raw = localStorage.getItem(AGENT_STORAGE_KEY);
    const data = raw ? (JSON.parse(raw) as Record<string, AgentSetting>) : {};
    data[agentId] = { ...data[agentId], ...patch };
    localStorage.setItem(AGENT_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

export function getLastSessionId(agentId: string): string | undefined {
  return loadAgentSetting(agentId).lastSessionId;
}

export function saveLastSessionId(agentId: string, sessionId: string): void {
  saveAgentSetting(agentId, { lastSessionId: sessionId });
}
