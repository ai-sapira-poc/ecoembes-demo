import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { ToastProvider } from "@/components/ui/Toast";

export default function PlataformaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar />
        <main className="p-8 overflow-y-auto bg-canvas flex-1">
          <ToastProvider>{children}</ToastProvider>
        </main>
      </div>
    </div>
  );
}
