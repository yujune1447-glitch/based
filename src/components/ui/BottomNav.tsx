"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  {
    href: "/timer",
    label: "Timer",
    icon: (active: boolean) => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="13"
          r="8"
          stroke={active ? "#0ea5e9" : "#94a3b8"}
          strokeWidth="1.75"
        />
        <path
          d="M12 9v4l2.5 2.5"
          stroke={active ? "#0ea5e9" : "#94a3b8"}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.5 3h5"
          stroke={active ? "#0ea5e9" : "#94a3b8"}
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: "/reflection",
    label: "Journal",
    icon: (active: boolean) => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="4"
          y="3"
          width="14"
          height="18"
          rx="2.5"
          stroke={active ? "#0ea5e9" : "#94a3b8"}
          strokeWidth="1.75"
        />
        <path
          d="M8 8h8M8 12h8M8 16h5"
          stroke={active ? "#0ea5e9" : "#94a3b8"}
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: "/friends",
    label: "Friends",
    icon: (active: boolean) => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="9"
          cy="8"
          r="3.5"
          stroke={active ? "#0ea5e9" : "#94a3b8"}
          strokeWidth="1.75"
        />
        <path
          d="M3 19.5c0-3.314 2.686-6 6-6s6 2.686 6 6"
          stroke={active ? "#0ea5e9" : "#94a3b8"}
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <circle
          cx="18"
          cy="8"
          r="2.5"
          stroke={active ? "#0ea5e9" : "#94a3b8"}
          strokeWidth="1.5"
        />
        <path
          d="M21 19.5c0-2.485-1.567-4.615-3.75-5.5"
          stroke={active ? "#0ea5e9" : "#94a3b8"}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100">
      <div className="flex items-stretch h-16" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 transition-opacity active:opacity-60",
                active ? "opacity-100" : "opacity-100"
              )}
            >
              {tab.icon(active)}
              <span
                className={cn(
                  "text-[10px] font-medium tracking-wide",
                  active ? "text-sky-500" : "text-slate-400"
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
