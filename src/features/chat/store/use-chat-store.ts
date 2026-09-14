import { create } from "zustand";
import { ChatMessage, ChatSession } from "../types/chat.types";

interface ChatState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  messages: ChatMessage[];
  isLoadingSessions: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;
  error: string | null;
}

interface ChatActions {
  setSessions: (sessions: ChatSession[]) => void;
  setActiveSessionId: (sessionId: string | null) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setIsLoadingSessions: (value: boolean) => void;
  setIsLoadingMessages: (value: boolean) => void;
  setIsSending: (value: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export type ChatStore = ChatState & ChatActions;

const initialState: ChatState = {
  sessions: [],
  activeSessionId: null,
  messages: [],
  isLoadingSessions: false,
  isLoadingMessages: false,
  isSending: false,
  error: null,
};

export const useChatStore = create<ChatStore>((set) => ({
  ...initialState,

  setSessions: (sessions) => set({ sessions }),
  setActiveSessionId: (activeSessionId) => set({ activeSessionId }),
  setMessages: (messages) => set({ messages }),
  setIsLoadingSessions: (isLoadingSessions) => set({ isLoadingSessions }),
  setIsLoadingMessages: (isLoadingMessages) => set({ isLoadingMessages }),
  setIsSending: (isSending) => set({ isSending }),
  setError: (error) => set({ error }),
  reset: () => set({ ...initialState }),
}));
