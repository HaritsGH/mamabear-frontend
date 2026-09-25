"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { History, Loader2, MessageCircle, Plus, Send, X } from "lucide-react";
import { useChat } from "../hooks/useChat";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ChatSession } from "../types/chat.types";
import { ChatRecommendationCards } from "./ChatRecommendationCards";
import { parseRecommendationSlugs } from "../utils/recommendations";
import ReactMarkdown from "react-markdown";

function SessionList({ sessions, activeSessionId, isLoadingSessions, onSelect }: { sessions: ChatSession[]; activeSessionId: string | null; isLoadingSessions: boolean; onSelect: (sessionId: string) => void }) {
  if (isLoadingSessions) {
    return (
      <div className="p-4 text-gray-500 text-font-2 flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Memuat...
      </div>
    );
  }
  if (sessions.length === 0) {
    return <div className="p-4 text-gray-400 text-font-2">Belum ada percakapan.</div>;
  }
  return (
    <>
      {sessions.map((session) => (
        <button
          key={session.id}
          onClick={() => onSelect(session.id)}
          className={`w-full text-left px-4 py-3 border-b border-gray-50 transition-colors ${activeSessionId === session.id ? "bg-[var(--mama-pink)] text-[var(--mama-brown)]" : "text-gray-600 hover:bg-gray-50"}`}
        >
          {formatTitle(session)}
        </button>
      ))}
    </>
  );
}

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

export function ChatClientView() {
  const { sessions, activeSessionId, messages, isLoadingSessions, isLoadingMessages, isSending, error, loadSessions, selectSession, sendMessage, startNewSession } = useChat();

  const { isLoggedIn } = useAuth();
  const [input, setInput] = useState("");
  const autoSelectedRef = useRef(false);

  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (sessions.length > 0 && !activeSessionId && !autoSelectedRef.current) {
      autoSelectedRef.current = true;
      selectSession(sessions[0].id);
    }
  }, [sessions, activeSessionId, selectSession]);

  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isSending]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isSending) return;
    setInput("");
    sendMessage(text);
  };

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-white px-4 sm:px-6 pt-10">
        <h1 className="text-font-1 md:text-font-6 font-bold text-[var(--mama-brown)] mb-8">Mamabear Ai Asistant</h1>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MessageCircle size={80} className="text-gray-200 mb-6" />
          <h2 className="text-font-4 font-bold text-[var(--mama-brown)] mb-2">Silakan login dulu</h2>
          <p className="text-font-2 text-[var(--color-gray)] mb-8 max-w-md">Masuk untuk mulai ngobrol dengan asisten MamaBear.</p>
          <Link href="/login?callbackUrl=/chat" className="bg-[var(--mama-hot-pink)] text-white px-8 py-3 rounded-full font-bold text-font-2 shadow-md hover:opacity-90 transition-all">
            Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="bg-white">
      <div className="py-8 px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-font-2 md:text-font-6 font-bold text-[var(--mama-brown)]">Mamabear Ai Asistant</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileHistoryOpen(true)}
              className="lg:hidden flex items-center gap-2 bg-white border border-gray-200 hover:border-[var(--mama-hot-pink)] text-[var(--mama-brown)] rounded-full px-2 py-1 text-font-1 font-bold transition-colors"
            >
              <History size={18} /> <span className="hidden md:block">Riwayat</span>
            </button>
            <button
              onClick={startNewSession}
              disabled={isSending}
              className="flex items-center gap-1 md:gap-2 bg-[var(--mama-hot-pink)] hover:bg-[#c24467] disabled:opacity-60 text-white rounded-full px-2 py-1 text-font-1 font-bold transition-colors"
            >
              <Plus size={18} /> <span className="hidden md:block">Chat Baru</span>
            </button>
          </div>
        </div>

        {error && <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-font-2">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:h-[70vh]">
          {/* Session sidebar */}
          <aside className="hidden lg:block rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 font-bold text-[var(--mama-brown)] text-font-2">Riwayat Chat</div>
            <div className="overflow-y-auto lg:h-[calc(70vh-3.5rem)]">
              <SessionList sessions={sessions} activeSessionId={activeSessionId} isLoadingSessions={isLoadingSessions} onSelect={selectSession} />
            </div>
          </aside>

          {/* Main chat area */}
          <section className="flex flex-col rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-[60vh] lg:h-full">
            <div ref={messagesRef} className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4 min-h-[50vh] lg:min-h-0">
              {isLoadingMessages ? (
                <div className="flex justify-center py-10 text-gray-500 text-font-2">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Memuat pesan...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center text-gray-400">
                  <MessageCircle size={56} className="mb-4" />
                  <p className="text-font-2 mt-2">{activeSessionId ? "Belum ada pesan di sesi ini." : 'Tanyakan apa saja tentang produk MamaBear, misalnya: "produk apa yang bagus buat nambah ASI?"'}</p>
                </div>
              ) : (
                messages.map((message) => {
                  const parsed = message.role === "assistant" ? parseRecommendationSlugs(message.content) : null;

                  return (
                    <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-font-1 md:text-font-2 whitespace-pre-wrap break-words ${
                          message.role === "user" ? "bg-[var(--mama-hot-pink)] text-white rounded-br-sm" : "bg-white border border-gray-100 rounded-bl-sm shadow-sm text-gray-800"
                        }`}
                      >
                        <ReactMarkdown>{parsed ? parsed.text : message.content}</ReactMarkdown>
                        <p className={`text-[11px] mt-1 ${message.role === "user" ? "text-white/70" : "text-gray-400"}`}>{formatTime(message.createdAt)}</p>
                        {parsed && parsed.slugs.length > 0 && <ChatRecommendationCards slugs={parsed.slugs} />}
                      </div>
                    </div>
                  );
                })
              )}

              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm shadow-sm px-4 py-3 flex items-center gap-2 text-gray-500 text-font-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-gray-100 p-4 bg-white">
              <div className="flex items-end gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={1}
                  placeholder="Tulis pertanyaan Mama..."
                  className="flex-1 resize-none rounded-2xl border border-gray-200 focus:border-[var(--mama-hot-pink)] focus:ring-0 px-2 md:px-4 py-1 md:py-3 text-font-1 md:text-font-2 outline-none transition-colors max-h-32"
                />
                <button
                  onClick={handleSend}
                  disabled={isSending || !input.trim()}
                  className="flex items-center gap-2 bg-[var(--mama-hot-pink)] hover:bg-[#c24467] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-full px-2 md:px-5 py-1 md:py-3 font-bold md:text-font-2 text-font-1 transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {mobileHistoryOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileHistoryOpen(false)} />
          <div className="absolute bottom-0 inset-x-0 rounded-t-2xl bg-white shadow-xl flex flex-col max-h-[75vh]">
            <div className="pt-2 pb-1 flex justify-center">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
              <span className="font-bold text-[var(--mama-brown)] text-font-2">Riwayat Chat</span>
              <button onClick={() => setMobileHistoryOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto">
              <SessionList
                sessions={sessions}
                activeSessionId={activeSessionId}
                isLoadingSessions={isLoadingSessions}
                onSelect={(sessionId) => {
                  selectSession(sessionId);
                  setMobileHistoryOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
