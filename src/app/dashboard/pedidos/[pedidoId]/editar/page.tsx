"use client";

import React, { Suspense } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const EditarPedidoForm = dynamic(
  () => import("@/components/dashboard/forms/EditarPedidoForm"),
  {
    loading: () => (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] w-full">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-3 text-muted-foreground">Carregando formulário...</p>
      </div>
    ),
  }
);

export default function EditarPedidoPage() {
  const params = useParams();
  const pedidoId = params.pedidoId as string; // Acesso e casting

  if (typeof pedidoId !== 'string') {
    return (
       <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] w-full">
        <Loader2 className="h-10 w-10 animate-spin text-destructive" />
        <p className="mt-3 text-destructive">Erro: ID do pedido inválido.</p>
      </div>
    );
  }
  
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
           <p className="mt-3 text-muted-foreground">Carregando página...</p>
        </div>
      }
    >
      <EditarPedidoForm pedidoId={pedidoId} />
    </Suspense>
  );
}
