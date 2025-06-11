import type { ReactNode } from 'react';
import { DashboardHeader } from '@/components/dashboard/Header';
import { DashboardSidebar } from '@/components/dashboard/Sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'; // Using the enhanced sidebar provider

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <DashboardSidebar />
        <div className="flex flex-col sm:gap-4 sm:py-0 sm:pl-14 md:pl-0 group-data-[sidebar-collapsed=true]:sm:pl-14"> {/* Adjust pl based on sidebar width */}
          <DashboardHeader />
          <SidebarInset>
            <main className="flex-1 p-4 sm:p-6 bg-background">
              {children}
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
