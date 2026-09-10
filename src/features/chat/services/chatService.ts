import { apiClient } from "@/lib/api";
import { ApiResponse } from "@/types/api.types";
import {
  ChatMessage,
  ChatSession,
  CreateChatDto,
  SendChatResponse,
} from "../types/chat.types";

/**
 * Sends a message to the AI assistant. Omit sessionId to start a new session (BAT-3).
 */
export async function sendChatMessage(
  payload: CreateChatDto,
): Promise<SendChatResponse> {
  const res = await apiClient.post(`/chat`, payload);

  if (!res.ok) {
    throw new Error(`Gagal mengirim pesan: HTTP ${res.status}`);
  }

  const response = (await res.json()) as ApiResponse<SendChatResponse>;

  if (!response.success || !response.data) {
    throw new Error(
      Array.isArray(response.message)
        ? response.message[0]
        : (response.message ?? "Terjadi kesalahan saat mengirim pesan"),
    );
  }

  return response.data;
}

/**
 * Fetches the current user's chat sessions, newest first (BAT-4).
 */
export async function getChatSessions(): Promise<ChatSession[]> {
  const res = await apiClient.get(`/chat`);

  if (!res.ok) {
    throw new Error(`Gagal mengambil riwayat chat: HTTP ${res.status}`);
  }

  const response = (await res.json()) as ApiResponse<ChatSession[]>;
  return response.data;
}

/**
 * Fetches all messages in one chat session. Backend enforces ownership —
 * cross-user access returns 403/404 (BAT-4).
 */
export async function getChatMessages(sessionId: string): Promise<ChatMessage[]> {
  const res = await apiClient.get(`/chat/${sessionId}`);

  if (!res.ok) {
    throw new Error(`Gagal mengambil pesan chat: HTTP ${res.status}`);
  }

  const response = (await res.json()) as ApiResponse<ChatMessage[]>;
  return response.data;
}

export const chatService = {
  sendChatMessage,
  getChatSessions,
  getChatMessages,
};
