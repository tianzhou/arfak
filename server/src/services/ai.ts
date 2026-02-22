import type { LanguageModel } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import type { ModelConfig } from './config.js';
import {
  readAgentKnowledge,
  readAgentMemory,
  readAgentRules,
  readAgentSoul,
} from '../lib/profile.js';

export function createModelInstance(cfg: ModelConfig): LanguageModel {
  switch (cfg.vendor) {
    case 'openai': {
      const provider = createOpenAI({ apiKey: cfg.api_key });
      return provider(cfg.model);
    }
    case 'anthropic': {
      const provider = createAnthropic({ apiKey: cfg.api_key });
      return provider(cfg.model);
    }
    case 'google': {
      const provider = createGoogleGenerativeAI({ apiKey: cfg.api_key });
      return provider(cfg.model);
    }
    default:
      throw new Error(`Unsupported vendor: ${cfg.vendor}`);
  }
}

export function composeSystemPrompt(agentId: string): string {
  const parts: string[] = [];

  const soul = readAgentSoul(agentId);
  if (soul) {
    parts.push(soul);
  }

  const rules = readAgentRules(agentId);
  if (rules) {
    parts.push(`## Rules\n\n${rules}`);
  }

  const knowledge = readAgentKnowledge(agentId);
  if (knowledge.length > 0) {
    const entries = knowledge.map((k) => `### ${k.label}\n\n${k.content}`).join('\n\n');
    parts.push(`## Knowledge\n\n${entries}`);
  }

  const memory = readAgentMemory(agentId);
  if (memory.length > 0) {
    const entries = memory.map((m) => `### ${m.label}\n\n${m.content}`).join('\n\n');
    parts.push(`## Memory\n\n${entries}`);
  }

  return parts.join('\n\n');
}
