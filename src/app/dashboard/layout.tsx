
import type { ReactNode } from 'react';
import { DashboardHeader } from '@/components/dashboard/Header';
import { DashboardSidebar } from '@/components/dashboard/Sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-muted/40">
        <DashboardSidebar />
        {/* This div will be pushed by the Sidebar's own placeholder mechanism */}
        <div className="flex flex-1 flex-col">
          <DashboardHeader />
          <main className="flex-1 p-4 sm:p-6 bg-background overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
