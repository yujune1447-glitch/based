import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase-server";

// Send a friend request by email
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email } = await req.json();
  const supabase = createServerSupabase();

  // Find user by email
  const { data: targetUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (targetUser.id === session.user.id) {
    return NextResponse.json({ error: "Cannot friend yourself" }, { status: 400 });
  }

  // Create friendship (pending)
  const { error } = await supabase.from("friendships").upsert(
    {
      user_id: session.user.id,
      friend_id: targetUser.id,
      status: "pending",
    },
    { onConflict: "user_id,friend_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// Accept a friend request
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { friendId } = await req.json();
  const supabase = createServerSupabase();

  // Accept the incoming request
  await supabase
    .from("friendships")
    .update({ status: "accepted" })
    .eq("user_id", friendId)
    .eq("friend_id", session.user.id);

  // Create reciprocal friendship
  await supabase.from("friendships").upsert(
    {
      user_id: session.user.id,
      friend_id: friendId,
      status: "accepted",
    },
    { onConflict: "user_id,friend_id" }
  );

  return NextResponse.json({ ok: true });
}
