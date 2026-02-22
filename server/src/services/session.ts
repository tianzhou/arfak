import { streamText, type ModelMessage } from 'ai';
import {
  appendMessage,
  createSession,
  deleteSession,
  listMessages,
  listSessions,
  updateSessionTokenUsage,
} from '../lib/profile.js';
import { composeSystemPrompt, createModelInstance } from './ai.js';
import { getAgentConfig, getModelConfig } from './config.js';

export const sessionHandlers = {
  async createSession(req: { agentId: string }) {
    const session = createSession(req.agentId);
    return {
      session: {
        id: session.id,
        agentId: session.agentId,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
    };
  },

  async listSessions(req: { agentId: string }) {
    const sessions = listSessions(req.agentId);
    return {
      sessions: sessions.map((s) => ({
        id: s.id,
        agentId: s.agentId,
        title: s.title,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
    };
  },

  async deleteSession(req: { agentId: string; sessionId: string }) {
    deleteSession(req.agentId, req.sessionId);
    return {};
  },

  async *streamChat(req: { agentId: string; sessionId: string; content: string }) {
    appendMessage(req.agentId, req.sessionId, 'user', req.content);

    const agentCfg = getAgentConfig(req.agentId);
    if (!agentCfg) {
      throw new Error(`Agent not found: ${req.agentId}`);
    }
    const modelCfg = getModelConfig(agentCfg.model);
    if (!modelCfg) {
      throw new Error(`Model not found: ${agentCfg.model}`);
    }

    const history = listMessages(req.agentId, req.sessionId);
    const messages: ModelMessage[] = history.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const system = composeSystemPrompt(req.agentId);
    const model = createModelInstance(modelCfg);
    const result = streamText({ messages, model, system: system || undefined });

    for await (const chunk of result.textStream) {
      yield { textDelta: chunk };
    }

    const fullText = await result.text;
    const usage = await result.usage;
    updateSessionTokenUsage(req.agentId, req.sessionId, {
      inputTokens: usage.inputTokens ?? 0,
      outputTokens: usage.outputTokens ?? 0,
      totalTokens: usage.totalTokens ?? 0,
    });
    const assistantMsg = appendMessage(req.agentId, req.sessionId, 'assistant', fullText);
    yield {
      message: {
        id: assistantMsg.id,
        sessionId: assistantMsg.sessionId,
        role: assistantMsg.role,
        content: assistantMsg.content,
        createdAt: assistantMsg.createdAt,
      },
    };
  },

  async listMessages(req: { agentId: string; sessionId: string }) {
    const messages = listMessages(req.agentId, req.sessionId);
    return {
      messages: messages.map((m) => ({
        id: m.id,
        sessionId: m.sessionId,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      })),
    };
  },
};
