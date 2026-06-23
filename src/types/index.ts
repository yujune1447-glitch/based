export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  prayer_request: string | null;
  praise_report: string | null;
  created_at: string;
}

export interface TimerSession {
  id: string;
  user_id: string;
  planned_minutes: number;
  actual_minutes: number;
  completed: boolean;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  timer_session_id: string | null;
  prompt_used: string | null;
  response_text: string | null;
  created_at: string;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: "pending" | "accepted";
  created_at: string;
}

export interface PrayedFor {
  id: string;
  from_user_id: string;
  to_user_id: string;
  created_at: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface DayEntry {
  date: string;
  journalEntries: JournalEntry[];
  timerSession?: TimerSession;
}

export interface FriendWithProfile extends User {
  prayedForCount?: number;
  lastPrayedAt?: string | null;
}
