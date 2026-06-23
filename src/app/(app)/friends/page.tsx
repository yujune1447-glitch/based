import { auth } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase-server";
import FriendsView from "@/components/friends/FriendsView";
import type { User, FriendWithProfile } from "@/types";
import { format } from "date-fns";

export default async function FriendsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const supabase = createServerSupabase();

  let profile: User | null = null;
  let friends: FriendWithProfile[] = [];
  let completedDates: string[] = [];

  if (userId) {
    // Own profile
    const { data: profileData } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
    profile = profileData;

    // Friends (accepted)
    const { data: friendships } = await supabase
      .from("friendships")
      .select("friend_id")
      .eq("user_id", userId)
      .eq("status", "accepted");

    const friendIds = (friendships || []).map((f) => f.friend_id);
    if (friendIds.length > 0) {
      const { data: friendProfiles } = await supabase
        .from("users")
        .select("*")
        .in("id", friendIds);
      friends = friendProfiles || [];
    }

    // Completed timer sessions for calendar
    const { data: sessions } = await supabase
      .from("timer_sessions")
      .select("created_at")
      .eq("user_id", userId)
      .eq("completed", true)
      .order("created_at", { ascending: false })
      .limit(365);

    completedDates = (sessions || []).map((s) =>
      format(new Date(s.created_at), "yyyy-MM-dd")
    );
  }

  return (
    <FriendsView
      profile={profile}
      friends={friends}
      completedDates={completedDates}
    />
  );
}
