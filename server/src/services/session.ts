import {
  appendMessage,
  createSession,
  deleteSession,
  listMessages,
  listSessions,
} from '../lib/profile.js';

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

  async sendMessage(req: { agentId: string; sessionId: string; role: string; content: string }) {
    const msg = appendMessage(req.agentId, req.sessionId, req.role, req.content);
    return {
      message: {
        id: msg.id,
        sessionId: msg.sessionId,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt,
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
