import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase-server";

// GET: pending friend requests sent TO the current user
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerSupabase();

  const { data: pending } = await supabase
    .from("friendships")
    .select("user_id")
    .eq("friend_id", session.user.id)
    .eq("status", "pending");

  if (!pending || pending.length === 0) {
    return NextResponse.json({ requests: [] });
  }

  const senderIds = pending.map((r) => r.user_id);
  const { data: senders } = await supabase
    .from("users")
    .select("*")
    .in("id", senderIds);

  return NextResponse.json({ requests: senders || [] });
}

// DELETE: decline a friend request
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { friendId } = await req.json();
  const supabase = createServerSupabase();

  await supabase
    .from("friendships")
    .delete()
    .eq("user_id", friendId)
    .eq("friend_id", session.user.id);

  return NextResponse.json({ ok: true });
}
