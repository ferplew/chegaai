"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChegaAiLogo } from '@/components/icons/ChegaAiLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LogOut, PanelLeft } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar'; // Assuming useSidebar is available for mobile toggle

export function DashboardHeader() {
  const { toggleSidebar, isMobile } = useSidebar(); // Get toggleSidebar and isMobile from context

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 shadow-sm backdrop-blur-md md:px-6">
      {isMobile && (
         <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
            <PanelLeft className="h-6 w-6" />
            <span className="sr-only">Alternar menu</span>
          </Button>
      )}
      {!isMobile && (
        <Link href="/dashboard" className="hidden md:block">
           <ChegaAiLogo className="h-8 text-primary" />
        </Link>
      )}
      
      <div className="ml-auto flex items-center gap-4">
        <span className="text-sm font-medium hidden sm:inline">Restaurante Exemplo</span>
        <ThemeToggle />
        <Button variant="outline" size="sm" asChild>
          <Link href="/login">
            <LogOut className="mr-0 sm:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
