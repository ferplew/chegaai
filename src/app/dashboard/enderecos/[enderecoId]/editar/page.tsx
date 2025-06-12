"use client";

import React, { Suspense } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Carrega o form só no client
const EditarEnderecoForm = dynamic(
  () => import("@/components/dashboard/forms/EditarEnderecoForm"),
  {
    loading: () => (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] w-full">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-3 text-muted-foreground">Carregando formulário...</p>
      </div>
    ),
  }
);

export default function EditarEnderecoPage() {
  const params = useParams();
  const enderecoId = params.enderecoId as string; // Acesso e casting
    
  // Adicionando uma verificação para o caso de enderecoId não ser uma string (embora useParams deva retornar string para segmentos de rota)
  if (typeof enderecoId !== 'string') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] w-full">
        <Loader2 className="h-10 w-10 animate-spin text-destructive" />
        <p className="mt-3 text-destructive">Erro: ID do endereço inválido.</p>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      }
    >
      <EditarEnderecoForm enderecoId={enderecoId} />
    </Suspense>
  );
}
