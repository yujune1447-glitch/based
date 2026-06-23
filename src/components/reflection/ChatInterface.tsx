"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSwipeable } from "react-swipeable";
import MessageBubble from "./MessageBubble";
import ChatSidebar from "./ChatSidebar";
import type { ChatMessage, JournalEntry } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ChatInterfaceProps {
  initialEntries: JournalEntry[];
  allDays: { date: string; preview: string }[];
  timerSessionId?: string | null;
  selectedDate?: string;
}

export default function ChatInterface({
  initialEntries,
  allDays,
  timerSessionId,
  selectedDate: initialDate,
}: ChatInterfaceProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingOpening, setIsFetchingOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<string>(
    initialDate || format(new Date(), "yyyy-MM-dd")
  );
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const router = useRouter();
  const swipeHandlers = useSwipeable({
    onSwipedRight: () => setSidebarOpen(true),
    trackMouse: false,
    delta: 40,
  });

  // Build messages from journal entries
  useEffect(() => {
    const msgs: ChatMessage[] = [];
    for (const entry of initialEntries) {
      if (entry.prompt_used) {
        msgs.push({ role: "assistant", content: entry.prompt_used });
      }
      if (entry.response_text) {
        msgs.push({ role: "user", content: entry.response_text });
      }
    }
    setMessages(msgs);
  }, [initialEntries]);

  // Fetch opening question if coming from timer and no entries yet
  useEffect(() => {
    if (timerSessionId && initialEntries.length === 0) {
      fetchOpeningQuestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerSessionId]);

  const fetchOpeningQuestion = useCallback(async () => {
    setIsFetchingOpening(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [],
          type: "opening",
          timerSessionId,
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      const question = data.content as string;
      setPendingPrompt(question);
      setMessages([{ role: "assistant", content: question }]);
    } finally {
      setIsFetchingOpening(false);
    }
  }, [timerSessionId]);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    const userMessage: ChatMessage = { role: "user", content: text };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setIsLoading(true);

    try {
      // Save to Supabase
      await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptUsed: pendingPrompt,
          responseText: text,
          timerSessionId: timerSessionId ?? null,
        }),
      });
      setPendingPrompt(null);

      // Get AI follow-up
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: currentMessages,
          type: "followup",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.error || `Error ${res.status} — check Vercel function logs`);
        return;
      }
      setError(null);
      const data = await res.json();
      const followUp = data.content as string;
      setPendingPrompt(followUp);
      setMessages((prev) => [...prev, { role: "assistant", content: followUp }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectDay = (date: string) => {
    const resolved = date === "today" ? format(new Date(), "yyyy-MM-dd") : date;
    router.push(`/reflection?date=${resolved}`);
  };

  const todayLabel = format(new Date(currentDate + "T12:00:00"), "EEEE, MMMM d");

  return (
    <div className="flex flex-col h-full" {...swipeHandlers}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-white">
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 active:bg-slate-100 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M3 5h14M3 10h14M3 15h8"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-base font-semibold text-slate-800">{todayLabel}</h1>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-5 scroll-area">
        {messages.length === 0 && !isFetchingOpening && (
          <div className="flex flex-col items-center justify-center h-full gap-4 pb-8">
            <div className="w-16 h-16 rounded-full bg-sky-50 flex items-center justify-center">
              <span className="text-2xl">✦</span>
            </div>
            <div className="text-center">
              <p className="text-slate-600 font-medium">Start your reflection</p>
              <p className="text-sm text-slate-400 mt-1 max-w-[220px]">
                Write freely, or complete a timer session to receive a daily prompt
              </p>
            </div>
          </div>
        )}

        {isFetchingOpening && (
          <div className="flex items-start gap-2 mt-2">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1 items-center h-5">
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {messages.map((msg, i) => (
            <MessageBubble
              key={i}
              role={msg.role}
              content={msg.content}
              isLast={i === messages.length - 1}
            />
          ))}

          {isLoading && (
            <div className="flex items-start gap-2">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1 items-center h-5">
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mx-2 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-500">
            {error}
          </div>
        )}
        <div ref={bottomRef} className="h-2" />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-slate-100 bg-white" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}>
        <div className="flex items-end gap-2.5">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write your reflection…"
            rows={1}
            className={cn(
              "flex-1 resize-none bg-slate-50 rounded-2xl px-4 py-3 text-[15px] text-slate-800",
              "placeholder:text-slate-400 outline-none border border-slate-100",
              "focus:border-sky-200 focus:bg-white transition-colors",
              "max-h-32 leading-relaxed"
            )}
            style={{ minHeight: 46 }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 128) + "px";
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={cn(
              "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-150",
              "flex-shrink-0",
              input.trim() && !isLoading
                ? "bg-sky-500 text-white active:scale-95 active:bg-sky-600"
                : "bg-slate-100 text-slate-300"
            )}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M16 2L8 10M16 2L11 16L8 10L2 7L16 2Z"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <ChatSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        days={allDays}
        selectedDate={currentDate}
        onSelectDay={handleSelectDay}
      />
    </div>
  );
}
