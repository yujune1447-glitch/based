import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase-server";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const allowed = ["bio", "prayer_request", "praise_report", "name"] as const;
  const updates: Partial<Record<(typeof allowed)[number], string>> = {};

  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  const supabase = createServerSupabase();
  const { error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", session.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
