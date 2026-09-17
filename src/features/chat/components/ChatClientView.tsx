"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, MessageCircle, Plus, Send } from "lucide-react";
import { useChat } from "../hooks/useChat";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ChatSession } from "../types/chat.types";

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
  const bottomRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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
        <h1 className="text-font-6 font-bold text-[var(--mama-brown)] mb-8">Online Chat</h1>
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
          <h1 className="text-font-6 font-bold text-[var(--mama-brown)]">Online Chat</h1>
          <button onClick={startNewSession} disabled={isSending} className="flex items-center gap-2 bg-[var(--mama-hot-pink)] hover:bg-[#c24467] disabled:opacity-60 text-white rounded-full px-4 py-2 text-font-2 font-bold transition-colors">
            <Plus size={18} /> Chat Baru
          </button>
        </div>

        {error && <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-font-2">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:h-[70vh]">
          {/* Session sidebar */}
          <aside className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 font-bold text-[var(--mama-brown)] text-font-2">Riwayat Chat</div>
            <div className="overflow-y-auto lg:h-[calc(70vh-3.5rem)]">
              {isLoadingSessions ? (
                <div className="p-4 text-gray-500 text-font-2 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Memuat...
                </div>
              ) : sessions.length === 0 ? (
                <div className="p-4 text-gray-400 text-font-2">Belum ada percakapan.</div>
              ) : (
                sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => selectSession(session.id)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 transition-colors ${activeSessionId === session.id ? "bg-[var(--mama-pink)] text-[var(--mama-brown)]" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    {formatTitle(session)}
                  </button>
                ))
              )}
            </div>
          </aside>

          {/* Main chat area */}
          <section className="flex flex-col rounded-2xl border border-gray-100 shadow-sm overflow-hidden lg:h-full">
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4 min-h-[50vh] lg:min-h-0">
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
                messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-first" : "justify-end"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-font-2 whitespace-pre-wrap break-words ${
                        message.role === "user" ? "bg-[var(--mama-hot-pink)] text-white rounded-br-sm" : "bg-white border border-gray-100 rounded-bl-sm shadow-sm text-gray-800"
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className={`text-[11px] mt-1 ${message.role === "user" ? "text-white/70" : "text-gray-400"}`}>{formatTime(message.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}

              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm shadow-sm px-4 py-3 flex items-center gap-2 text-gray-500 text-font-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
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
                  className="flex-1 resize-none rounded-2xl border border-gray-200 focus:border-[var(--mama-hot-pink)] focus:ring-0 px-4 py-3 text-font-2 outline-none transition-colors max-h-32"
                />
                <button
                  onClick={handleSend}
                  disabled={isSending || !input.trim()}
                  className="flex items-center gap-2 bg-[var(--mama-hot-pink)] hover:bg-[#c24467] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-full px-5 py-3 font-bold text-font-2 transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
