
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChegaAiLogo } from '@/components/icons/ChegaAiLogo';
import { PanelLeft } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';

export function DashboardHeader() {
  const sidebarContext = useSidebar();

  // Explicit check for context before destructuring
  if (!sidebarContext) {
    // This should ideally not happen if useSidebar's fallback is working,
    // but acts as an additional safeguard.
    console.warn("DashboardHeader: sidebarContext is not available. Header might not function correctly.");
    return ( // Render a fallback or null if context is critical
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 shadow-sm backdrop-blur-md md:px-6">
        {/* Minimal header if context fails */}
      </header>
    );
  }
  const { toggleSidebar, isMobile, state: sidebarState } = sidebarContext;


  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 shadow-sm backdrop-blur-md md:px-6">
      {isMobile ? (
         <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
            <PanelLeft className="h-6 w-6" />
            <span className="sr-only">Alternar menu</span>
          </Button>
      ) : (
        <Link href="/dashboard" className="flex items-center gap-2">
           <ChegaAiLogo className="h-8 text-primary" />
        </Link>
      )}
      
      <div className="ml-auto flex items-center gap-4">
      </div>
    </header>
  );
}
