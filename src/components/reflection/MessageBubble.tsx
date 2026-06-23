import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  isLast?: boolean;
}

export default function MessageBubble({
  role,
  content,
  timestamp,
  isLast = false,
}: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex flex-col gap-1 message-in",
        isUser ? "items-end" : "items-start"
      )}
    >
      {/* Role label */}
      {!isUser && (
        <span className="text-xs text-slate-400 font-medium px-1 ml-1">based</span>
      )}

      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed",
          isUser
            ? "bg-sky-500 text-white rounded-br-md"
            : "bg-slate-50 text-slate-800 rounded-bl-md border border-slate-100"
        )}
      >
        <p className="whitespace-pre-wrap">{content}</p>
      </div>

      {/* Timestamp */}
      {(timestamp || isLast) && (
        <span className="text-[10px] text-slate-300 px-1">
          {timestamp ? format(new Date(timestamp), "h:mm a") : ""}
        </span>
      )}
    </div>
  );
}
