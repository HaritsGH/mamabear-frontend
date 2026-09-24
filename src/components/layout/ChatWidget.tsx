"use client";
import { History, Loader2, MessageCircle, Plus, Send, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { ChatSession } from "@/features/chat/types/chat.types";
import { useChat } from "@/features/chat/hooks/useChat";
import { useAuth } from "@/features/auth/hooks/useAuth";
import Link from "next/link";
import { ChatRecommendationCards } from "@/features/chat/components/ChatRecommendationCards";
import { parseRecommendationSlugs } from "@/features/chat/utils/recommendations";

const formatTitle = (session: ChatSession) => {
  const date = new Date(session.createdAt);
  const day = date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  const time = date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  return `Chat ${day} • ${time}`;
};

const formatTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
};

export default function ChatWidget() {
  const { sessions, activeSessionId, messages, isLoadingSessions, isSending, error, loadSessions, selectSession, sendMessage, startNewSession } = useChat();
  const { isLoggedIn } = useAuth();

  const [open, setOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [input, setInput] = useState("");
  const messagesRef = useRef<HTMLDivElement>(null);
  const openedOnce = useRef(false);

  useEffect(() => {
    if (open && isLoggedIn && !openedOnce.current) {
      openedOnce.current = true;
      loadSessions();
    }
  }, [open, isLoggedIn, loadSessions]);

  useEffect(() => {
    if (open && sessions.length > 0 && !activeSessionId) {
      selectSession(sessions[0].id);
    }
  }, [open, sessions, activeSessionId, selectSession]);

  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isSending, open]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isSending) return;
    setInput("");
    sendMessage(text);
  };

  const closeWidget = () => {
    setOpen(false);
    setHistoryOpen(false);
  };

  return (
    <div className="hidden md:block fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-16 w-80 rounded-2xl shadow-xl bg-white border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-pink-500 px-4 py-3 flex items-center justify-between">
            <span className="text-white font-medium text-sm">MamaBear AI Assistant</span>
            <div className="flex items-center gap-1">
              {isLoggedIn && (
                <button onClick={() => setHistoryOpen((v) => !v)} title="Riwayat chat" className={`p-1 rounded-full transition-colors ${historyOpen ? "bg-white/25" : "hover:bg-pink-600"}`}>
                  <History className="w-4 h-4 text-white" />
                </button>
              )}
              <button onClick={closeWidget} className="p-1 rounded-full hover:bg-pink-600">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Not logged in */}
          {!isLoggedIn && (
            <div className="p-6 text-center text-sm text-gray-600">
              <p className="font-semibold text-gray-800 mb-1">Silakan login dulu</p>
              <p className="mb-4">Masuk untuk mulai ngobrol dengan asisten MamaBear.</p>
              <Link href="/login?callbackUrl=/" className="inline-block bg-[var(--mama-hot-pink)] text-white px-6 py-2 rounded-full font-bold text-sm shadow-md hover:opacity-90 transition-all">
                Login
              </Link>
            </div>
          )}

          {/* History panel */}
          {isLoggedIn && historyOpen && (
            <div className="h-72 flex flex-col">
              <div className="p-3 border-b flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 uppercase">Riwayat Chat</span>
                <button
                  onClick={() => {
                    startNewSession();
                    setHistoryOpen(false);
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-pink-500 hover:text-pink-700"
                >
                  <Plus className="w-3.5 h-3.5" /> Chat Baru
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {isLoadingSessions ? (
                  <div className="p-4 text-xs text-gray-500 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Memuat...
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="p-4 text-xs text-gray-400">Belum ada percakapan.</div>
                ) : (
                  sessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => {
                        selectSession(session.id);
                        setHistoryOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 border-b border-gray-50 text-xs transition-colors ${
                        activeSessionId === session.id ? "bg-[var(--mama-pink)] text-[var(--mama-brown)] font-semibold" : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {formatTitle(session)}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Chat area */}
          {isLoggedIn && !historyOpen && (
            <>
              <div ref={messagesRef} className="p-4 h-72 overflow-y-auto text-sm text-gray-600 space-y-3">
                {error && <div className="p-2 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>}

                {messages.length === 0 ? (
                  <p>Hi! Ada yang bisa dibantu?</p>
                ) : (
                  messages.map((message) => {
                    const parsed = message.role === "assistant" ? parseRecommendationSlugs(message.content) : null;
                    return (
                      <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className="max-w-[85%]">
                          <div className={`rounded-2xl px-3 py-2 text-xs whitespace-pre-wrap break-words ${message.role === "user" ? "bg-[var(--mama-hot-pink)] text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}>
                            <p>{parsed ? parsed.text : message.content}</p>
                            <p className={`text-[10px] mt-1 ${message.role === "user" ? "text-white/70" : "text-gray-400"}`}>{formatTime(message.createdAt)}</p>
                          </div>
                          {parsed && parsed.slugs.length > 0 && <ChatRecommendationCards slugs={parsed.slugs} />}
                        </div>
                      </div>
                    );
                  })
                )}

                {isSending && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3 py-2 flex items-center gap-2 text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t p-3 flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  disabled={isSending}
                  placeholder="Ketik pesan..."
                  className="flex-1 text-sm border rounded-lg px-3 py-2 outline-none focus:border-pink-500"
                />
                <button onClick={handleSend} disabled={isSending || !input.trim()} className="bg-pink-500 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-60 disabled:cursor-not-allowed">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <Button onClick={() => setOpen(!open)} className="hidden md:flex fixed bottom-6 right-6 w-14 h-14 bg-pink-500 text-white rounded-full shadow-xl items-center justify-center hover:bg-pink-600 hover:scale-110 transition-all z-50 group">
        <MessageCircle className="w-7 h-7 group-hover:animate-bounce" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-300"></span>
        </span>
      </Button>
    </div>
  );
}
