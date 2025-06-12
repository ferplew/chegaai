"use client";

import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const TemaCustomizationForm = dynamic(() => import('@/components/dashboard/forms/TemaCustomizationForm'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] w-full">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="mt-3 text-muted-foreground">Carregando opções de tema...</p>
    </div>
  ),
});

export default function TemaPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] w-full">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-3 text-muted-foreground">Carregando opções de tema...</p>
      </div>
    }>
      <TemaCustomizationForm />
    </Suspense>
  );
}
