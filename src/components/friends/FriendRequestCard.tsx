"use client";

import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import type { User } from "@/types";
import { cn } from "@/lib/utils";

interface FriendRequestCardProps {
  user: User;
  onAccept: (userId: string) => Promise<void>;
  onDecline: (userId: string) => Promise<void>;
}

export default function FriendRequestCard({
  user,
  onAccept,
  onDecline,
}: FriendRequestCardProps) {
  const [status, setStatus] = useState<"idle" | "accepting" | "declining" | "done">("idle");

  const handleAccept = async () => {
    setStatus("accepting");
    await onAccept(user.id);
    setStatus("done");
  };

  const handleDecline = async () => {
    setStatus("declining");
    await onDecline(user.id);
    setStatus("done");
  };

  if (status === "done") return null;

  return (
    <div className="flex items-center gap-3 bg-sky-50 rounded-2xl p-4 border border-sky-100">
      <Avatar src={user.avatar_url} name={user.name} size={44} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">
          {user.name || user.email}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">wants to connect</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleDecline}
          disabled={status !== "idle"}
          className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-500 text-sm flex items-center justify-center active:bg-slate-50"
        >
          ✕
        </button>
        <button
          onClick={handleAccept}
          disabled={status !== "idle"}
          className={cn(
            "w-9 h-9 rounded-full text-white text-sm flex items-center justify-center",
            "bg-sky-500 active:bg-sky-600"
          )}
        >
          ✓
        </button>
      </div>
    </div>
  );
}
