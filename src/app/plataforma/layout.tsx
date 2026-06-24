import { Sidebar } from "@/components/layout/Sidebar";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { TopBar } from "@/components/layout/TopBar";
import { ToastProvider } from "@/components/ui/Toast";

export default function PlataformaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      {/* Fixed-height shell: sidebar + topbar pinned, only <main> scrolls */}
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar: desktop only (hidden below md) */}
        <Sidebar />

        {/* Content column: topbar + main */}
        <div className="flex flex-col flex-1 min-w-0">
          <TopBar />
          {/* pb on mobile clears the fixed MobileTabBar */}
          <main className="p-4 pb-24 md:p-8 md:pb-8 overflow-y-auto bg-canvas flex-1">
            {children}
          </main>
        </div>

        {/* Bottom tab bar: mobile only */}
        <MobileTabBar />
      </div>
    </ToastProvider>
  );
}
