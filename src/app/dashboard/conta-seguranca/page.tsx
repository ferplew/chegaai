"use client";

import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const ContaSegurancaForm = dynamic(() => import('@/components/dashboard/forms/ContaSegurancaForm'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] w-full">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="mt-3 text-muted-foreground">Carregando configurações...</p>
    </div>
  ),
});

export default function ContaSegurancaPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] w-full">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-3 text-muted-foreground">Carregando configurações...</p>
      </div>
    }>
      <ContaSegurancaForm />
    </Suspense>
  );
}
