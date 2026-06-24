import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export default function PlataformaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar: full viewport height, fixed width */}
      <Sidebar />

      {/* Content column: topbar + main */}
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar />
        <main className="p-8 overflow-auto bg-canvas min-h-screen flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
