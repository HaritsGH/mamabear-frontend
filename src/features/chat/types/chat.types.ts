/**
 * Chat feature types
 * Matches the backend contract from BAT-3 (POST /chat) and BAT-4 (GET /chat, GET /chat/:sessionId).
 * Backend endpoints are not yet implemented (Todo as of this writing) — shapes below are the
 * best fit from the ticket descriptions and should be adjusted once BAT-3/BAT-4 ship.
 */

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  title?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Payload for POST /chat. Omit sessionId to start a new session.
 */
export interface CreateChatDto {
  sessionId?: string;
  message: string;
}

/**
 * Response from POST /chat: the assistant's answer plus the (possibly new) sessionId.
 */
export interface SendChatResponse {
  sessionId: string;
  message: ChatMessage;
}
