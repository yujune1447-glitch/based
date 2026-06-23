"use client";

import { useState, useEffect } from "react";
import Avatar from "@/components/ui/Avatar";
import CalendarGrid from "./CalendarGrid";
import FriendCard from "./FriendCard";
import AddFriendSheet from "./AddFriendSheet";
import FriendRequestCard from "./FriendRequestCard";
import type { User, FriendWithProfile } from "@/types";
import { cn } from "@/lib/utils";

interface FriendsViewProps {
  profile: User | null;
  friends: FriendWithProfile[];
  completedDates: string[];
}

export default function FriendsView({ profile, friends, completedDates }: FriendsViewProps) {
  const [editingProfile, setEditingProfile] = useState(false);
  const [localProfile, setLocalProfile] = useState(profile);
  const [saving, setSaving] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendRequests, setFriendRequests] = useState<User[]>([]);
  const [friendList, setFriendList] = useState(friends);

  const completedSet = new Set(completedDates);

  // Load pending friend requests
  useEffect(() => {
    fetch("/api/friends/requests")
      .then((r) => r.json())
      .then((data) => setFriendRequests(data.requests || []))
      .catch(() => {});
  }, []);

  const handlePrayedFor = async (friendId: string) => {
    await fetch("/api/prayed-for", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId: friendId }),
    });
  };

  const handleAcceptRequest = async (userId: string) => {
    await fetch("/api/friends", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friendId: userId }),
    });
    // Refresh: move from requests to friends
    const accepted = friendRequests.find((r) => r.id === userId);
    if (accepted) {
      setFriendList((prev) => [...prev, accepted as FriendWithProfile]);
      setFriendRequests((prev) => prev.filter((r) => r.id !== userId));
    }
  };

  const handleDeclineRequest = async (userId: string) => {
    await fetch("/api/friends/requests", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friendId: userId }),
    });
    setFriendRequests((prev) => prev.filter((r) => r.id !== userId));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bio: localProfile?.bio,
        prayer_request: localProfile?.prayer_request,
        praise_report: localProfile?.praise_report,
      }),
    });
    setSaving(false);
    setEditingProfile(false);
  };

  return (
    <>
      <div className="h-full overflow-y-auto no-scrollbar scroll-area">
        <div className="px-4 pt-5 pb-24 flex flex-col gap-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">Friends</h1>
              <p className="text-sm text-slate-400 mt-0.5">Pray for one another</p>
            </div>
            <button
              onClick={() => setShowAddFriend(true)}
              className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-sm shadow-sky-200 active:bg-sky-600 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Calendar */}
          <CalendarGrid completedDates={completedSet} />

          {/* Pending friend requests */}
          {friendRequests.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-1">
                Friend requests
              </p>
              {friendRequests.map((req) => (
                <FriendRequestCard
                  key={req.id}
                  user={req}
                  onAccept={handleAcceptRequest}
                  onDecline={handleDeclineRequest}
                />
              ))}
            </div>
          )}

          {/* Own Profile Card */}
          {localProfile && (
            <div className="bg-white rounded-2xl border border-slate-100 p-4">
              <div className="flex items-start gap-3.5">
                <Avatar src={localProfile.avatar_url} name={localProfile.name} size={52} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="text-[15px] font-semibold text-slate-800 truncate">
                        {localProfile.name}
                      </p>
                      <span className="text-[10px] text-sky-500 font-semibold bg-sky-50 px-2 py-0.5 rounded-full flex-shrink-0">
                        You
                      </span>
                    </div>
                    <button
                      onClick={() => setEditingProfile(!editingProfile)}
                      className="text-xs text-slate-400 font-medium active:text-slate-600 flex-shrink-0"
                    >
                      {editingProfile ? "Cancel" : "Edit"}
                    </button>
                  </div>
                  {!editingProfile ? (
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      {localProfile.bio || (
                        <span className="italic">Add a short bio…</span>
                      )}
                    </p>
                  ) : (
                    <input
                      value={localProfile.bio || ""}
                      onChange={(e) =>
                        setLocalProfile((p) => p ? { ...p, bio: e.target.value } : p)
                      }
                      placeholder="Short bio…"
                      className="mt-1 w-full text-xs bg-slate-50 rounded-lg px-3 py-2 outline-none border border-slate-100 focus:border-sky-200"
                    />
                  )}
                </div>
              </div>

              {editingProfile && (
                <div className="mt-4 flex flex-col gap-3">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                      🙏 Prayer request
                    </p>
                    <textarea
                      value={localProfile?.prayer_request || ""}
                      onChange={(e) =>
                        setLocalProfile((p) => p ? { ...p, prayer_request: e.target.value } : p)
                      }
                      placeholder="What would you like prayer for?"
                      rows={2}
                      className="w-full text-sm bg-slate-50 rounded-xl px-3 py-2.5 outline-none border border-slate-100 focus:border-sky-200 resize-none"
                    />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                      ✨ Praise report
                    </p>
                    <textarea
                      value={localProfile?.praise_report || ""}
                      onChange={(e) =>
                        setLocalProfile((p) => p ? { ...p, praise_report: e.target.value } : p)
                      }
                      placeholder="What are you praising God for?"
                      rows={2}
                      className="w-full text-sm bg-slate-50 rounded-xl px-3 py-2.5 outline-none border border-slate-100 focus:border-sky-200 resize-none"
                    />
                  </div>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="h-12 rounded-xl bg-sky-500 text-white text-sm font-medium active:bg-sky-600 transition-colors"
                  >
                    {saving ? "Saving…" : "Save profile"}
                  </button>
                </div>
              )}

              {/* Current prayer/praise (view mode) */}
              {!editingProfile && (localProfile.prayer_request || localProfile.praise_report) && (
                <div className="mt-3 flex flex-col gap-2 pt-3 border-t border-slate-50">
                  {localProfile.prayer_request && (
                    <div className="flex gap-2.5">
                      <span className="text-sm flex-shrink-0 mt-0.5">🙏</span>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {localProfile.prayer_request}
                      </p>
                    </div>
                  )}
                  {localProfile.praise_report && (
                    <div className="flex gap-2.5">
                      <span className="text-sm flex-shrink-0 mt-0.5">✨</span>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {localProfile.praise_report}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Friends list */}
          {friendList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center">
                <span className="text-2xl">👋</span>
              </div>
              <div className="text-center">
                <p className="text-slate-500 font-medium text-sm">No friends yet</p>
                <p className="text-xs text-slate-300 mt-1 max-w-[180px]">
                  Add friends to see their prayer requests and praise reports
                </p>
              </div>
              <button
                onClick={() => setShowAddFriend(true)}
                className="mt-1 px-5 h-10 rounded-full bg-sky-500 text-white text-sm font-medium active:bg-sky-600 transition-colors"
              >
                Add a friend
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {friendList.map((friend) => (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  onPrayedFor={handlePrayedFor}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add friend sheet */}
      {showAddFriend && (
        <AddFriendSheet
          onClose={() => setShowAddFriend(false)}
          onSent={() => {}}
        />
      )}
    </>
  );
}
