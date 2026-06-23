import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { promptUsed, responseText, timerSessionId } = await req.json();
  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("journal_entries")
    .insert({
      user_id: session.user.id,
      prompt_used: promptUsed ?? null,
      response_text: responseText,
      timer_session_id: timerSessionId ?? null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
