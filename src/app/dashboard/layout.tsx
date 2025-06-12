
import React, { type ReactNode } from 'react'; // Import React for React.memo
import { DashboardHeader } from '@/components/dashboard/Header';
import { DashboardSidebar } from '@/components/dashboard/Sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

function OriginalDashboardLayout({ children }: DashboardLayoutProps) {
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

const DashboardLayout = React.memo(OriginalDashboardLayout);
export default DashboardLayout;
