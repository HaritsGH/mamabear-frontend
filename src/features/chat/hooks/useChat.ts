import { chatService } from "../services/chatService";
import { useChatStore } from "../store/use-chat-store";
import { ChatMessage } from "../types/chat.types";

export const useChat = () => {
  const sessions = useChatStore((s) => s.sessions);
  const activeSessionId = useChatStore((s) => s.activeSessionId);
  const messages = useChatStore((s) => s.messages);
  const isLoadingSessions = useChatStore((s) => s.isLoadingSessions);
  const isLoadingMessages = useChatStore((s) => s.isLoadingMessages);
  const isSending = useChatStore((s) => s.isSending);
  const error = useChatStore((s) => s.error);

  const setSessions = useChatStore((s) => s.setSessions);
  const setActiveSessionId = useChatStore((s) => s.setActiveSessionId);
  const setError = useChatStore((s) => s.setError);

  const loadSessions = async () => {
    useChatStore.setState({ isLoadingSessions: true, error: null });
    try {
      const data = await chatService.getChatSessions();
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat daftar sesi chat");
    } finally {
      useChatStore.setState({ isLoadingSessions: false });
    }
  };

  const loadMessages = async (sessionId: string) => {
    useChatStore.setState({ isLoadingMessages: true, error: null });
    try {
      const data = await chatService.getChatMessages(sessionId);
      useChatStore.setState({ messages: data });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat riwayat pesan");
    } finally {
      useChatStore.setState({ isLoadingMessages: false });
    }
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const state = useChatStore.getState();
    const tempMessage: ChatMessage = {
      id: `temp_${Date.now()}`,
      sessionId: state.activeSessionId ?? "",
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    // Optimistic update: tampilkan pesan user segera
    useChatStore.setState({ messages: [...state.messages, tempMessage], isSending: true, error: null });

    try {
      const response = await chatService.sendChatMessage({
        sessionId: state.activeSessionId ?? undefined,
        message: trimmed,
      });

      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        sessionId: response.sessionId,
        role: "assistant",
        content: response.message,
        createdAt: new Date().toISOString(),
      };

      const isNewSession = !state.activeSessionId;

      useChatStore.setState((cur) => ({
        activeSessionId: response.sessionId,
        messages: [...cur.messages, assistantMessage],
        isSending: false,
      }));

      if (isNewSession) {
        await loadSessions();
      }
    } catch (err) {
      // Rollback optimistic user message
      useChatStore.setState((cur) => ({
        messages: cur.messages.filter((m) => m.id !== tempMessage.id),
        isSending: false,
        error: err instanceof Error ? err.message : "Terjadi kesalahan saat mengirim pesan",
      }));
    }
  };

  const selectSession = async (sessionId: string) => {
    setActiveSessionId(sessionId);
    useChatStore.setState({ messages: [], error: null });
    await loadMessages(sessionId);
  };

  const startNewSession = () => {
    setActiveSessionId(null);
    useChatStore.setState({ messages: [], error: null });
  };

  return {
    sessions,
    activeSessionId,
    messages,
    isLoadingSessions,
    isLoadingMessages,
    isSending,
    error,
    loadSessions,
    loadMessages,
    sendMessage,
    selectSession,
    startNewSession,
  };
};
