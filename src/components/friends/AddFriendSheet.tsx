"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface AddFriendSheetProps {
  onClose: () => void;
  onSent: () => void;
}

export default function AddFriendSheet({ onClose, onSent }: AddFriendSheetProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSend = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || loading) return;

    setLoading(true);
    setStatus("idle");

    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong");
        setStatus("error");
      } else {
        setStatus("sent");
        onSent();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/20 backdrop" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl fade-in"
        style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom, 0px))" }}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        <div className="px-6 pt-3 pb-6 flex flex-col gap-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Add a friend</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Send a connection request by email
            </p>
          </div>

          {status === "sent" ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="w-14 h-14 rounded-full bg-sky-50 flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
              <p className="text-slate-600 font-medium text-center">Request sent!</p>
              <p className="text-sm text-slate-400 text-center">
                They&apos;ll appear in your friends list once they accept.
              </p>
              <button
                onClick={onClose}
                className="mt-2 w-full h-12 rounded-2xl bg-sky-500 text-white text-sm font-medium active:bg-sky-600"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setStatus("idle");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="friend@example.com"
                  autoFocus
                  className={cn(
                    "w-full px-4 py-3.5 rounded-2xl text-[15px] text-slate-800 bg-slate-50",
                    "border outline-none transition-colors",
                    status === "error"
                      ? "border-red-200 bg-red-50"
                      : "border-slate-100 focus:border-sky-200 focus:bg-white"
                  )}
                />
                {status === "error" && (
                  <p className="text-xs text-red-500 px-1">{errorMsg}</p>
                )}
              </div>

              <button
                onClick={handleSend}
                disabled={!email.trim() || loading}
                className={cn(
                  "w-full h-14 rounded-2xl text-[15px] font-medium transition-all duration-150",
                  email.trim() && !loading
                    ? "bg-sky-500 text-white active:bg-sky-600 active:scale-[0.98]"
                    : "bg-slate-100 text-slate-300"
                )}
              >
                {loading ? "Sending…" : "Send request"}
              </button>

              <button
                onClick={onClose}
                className="w-full h-11 rounded-2xl text-slate-400 text-sm font-medium active:bg-slate-50"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
