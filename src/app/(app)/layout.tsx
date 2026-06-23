import BottomNav from "@/components/ui/BottomNav";
import SessionProvider from "@/components/ui/SessionProvider";
import { auth } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <div className="flex flex-col h-full bg-white">
        {/* Main content area, leaves room for bottom nav + safe area */}
        <main className="flex-1 overflow-hidden" style={{ paddingBottom: "calc(4rem + env(safe-area-inset-bottom, 0px))" }}>
          {children}
        </main>
        <BottomNav />
      </div>
    </SessionProvider>
  );
}
