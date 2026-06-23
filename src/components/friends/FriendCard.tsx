"use client";

import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import type { FriendWithProfile } from "@/types";
import { cn } from "@/lib/utils";

interface FriendCardProps {
  friend: FriendWithProfile;
  onPrayedFor: (friendId: string) => Promise<void>;
}

export default function FriendCard({ friend, onPrayedFor }: FriendCardProps) {
  const [prayed, setPrayed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePray = async () => {
    if (prayed || loading) return;
    setLoading(true);
    await onPrayedFor(friend.id);
    setPrayed(true);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col gap-3">
      {/* Top row: avatar + name/bio */}
      <div className="flex items-start gap-3.5">
        <Avatar src={friend.avatar_url} name={friend.name} size={48} />
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-slate-800 leading-tight truncate">
            {friend.name || "Friend"}
          </p>
          {friend.bio && (
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
              {friend.bio}
            </p>
          )}
        </div>
      </div>

      {/* Prayer request */}
      {friend.prayer_request && (
        <div className="flex gap-2.5">
          <div className="flex-shrink-0 w-5 h-5 mt-0.5 flex items-center justify-center">
            <span className="text-sm">🙏</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
              Prayer request
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              {friend.prayer_request}
            </p>
          </div>
        </div>
      )}

      {/* Praise report */}
      {friend.praise_report && (
        <div className="flex gap-2.5">
          <div className="flex-shrink-0 w-5 h-5 mt-0.5 flex items-center justify-center">
            <span className="text-sm">✨</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
              Praise report
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              {friend.praise_report}
            </p>
          </div>
        </div>
      )}

      {/* Prayed for button */}
      <button
        onClick={handlePray}
        disabled={prayed || loading}
        className={cn(
          "mt-1 w-full h-10 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.98]",
          prayed
            ? "bg-sky-50 text-sky-500 border border-sky-100"
            : "bg-slate-50 text-slate-600 border border-slate-100 active:bg-sky-50 active:text-sky-600 active:border-sky-100"
        )}
      >
        {prayed ? "✓ Prayed for you" : "Prayed for you"}
      </button>
    </div>
  );
}
