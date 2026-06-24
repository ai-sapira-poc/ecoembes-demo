import { Sidebar } from "@/components/layout/Sidebar";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { TopBar } from "@/components/layout/TopBar";

export default function PlataformaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar: desktop only (hidden below md) */}
      <Sidebar />

      {/* Content column: topbar + main */}
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar />
        {/* pb on mobile clears the fixed MobileTabBar */}
        <main className="p-4 pb-24 md:p-8 md:pb-8 overflow-auto bg-canvas min-h-screen flex-1">
          {children}
        </main>
      </div>

      {/* Bottom tab bar: mobile only */}
      <MobileTabBar />
    </div>
  );
}
