import { auth } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase-server";
import ChatInterface from "@/components/reflection/ChatInterface";
import { format } from "date-fns";
import type { JournalEntry } from "@/types";

interface Props {
  searchParams: Promise<{ session?: string; date?: string }>;
}

export default async function ReflectionPage({ searchParams }: Props) {
  const { session: timerSessionId, date } = await searchParams;
  const authSession = await auth();
  const userId = authSession?.user?.id;

  const supabase = createServerSupabase();
  const today = format(new Date(), "yyyy-MM-dd");
  const targetDate = date || today;

  let initialEntries: JournalEntry[] = [];
  let allDays: { date: string; preview: string }[] = [];

  if (userId) {
    // Fetch today's (or selected date's) entries
    const start = new Date(targetDate + "T00:00:00");
    const end = new Date(targetDate + "T23:59:59");
    const { data: entries } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString())
      .order("created_at", { ascending: true });

    initialEntries = entries || [];

    // Fetch all days for sidebar
    const { data: allEntries } = await supabase
      .from("journal_entries")
      .select("created_at, response_text")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(200);

    if (allEntries) {
      const seen = new Set<string>();
      for (const e of allEntries) {
        const d = format(new Date(e.created_at), "yyyy-MM-dd");
        if (!seen.has(d)) {
          seen.add(d);
          allDays.push({
            date: d,
            preview: e.response_text
              ? e.response_text.slice(0, 60)
              : "",
          });
        }
      }
    }
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <ChatInterface
        initialEntries={initialEntries}
        allDays={allDays}
        timerSessionId={timerSessionId ?? null}
        selectedDate={targetDate}
      />
    </div>
  );
}
