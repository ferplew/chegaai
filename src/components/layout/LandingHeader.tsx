
"use client";

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChegaAiLogo } from '@/components/icons/ChegaAiLogo';
import { cn } from "@/lib/utils";

export function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Call on mount to check initial scroll position

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
      isScrolled ? "py-3 bg-background/95 shadow-lg backdrop-blur-sm" : "py-6 bg-background/80 backdrop-blur-md"
    )}>
      <div className="container mx-auto px-4 flex justify-start items-center"> {/* Changed to justify-start */}
        <Link href="/" aria-label="Página Inicial Chega Aí">
          <ChegaAiLogo className="h-10 text-primary" />
        </Link>
      </div>
    </header>
  );
}
