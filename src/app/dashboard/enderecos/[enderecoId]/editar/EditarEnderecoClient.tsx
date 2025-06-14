
"use client";

import dynamic from "next/dynamic";
import React, { Suspense } from 'react'; // React is needed for JSX
import { Loader2 } from "lucide-react";

const EditarEnderecoForm = dynamic(
  () => import("@/components/dashboard/forms/EditarEnderecoForm"),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] w-full">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-3 text-muted-foreground">Carregando formulário...</p>
      </div>
    ),
  }
);

interface EditarEnderecoClientProps {
  params: {
    enderecoId: string;
  };
}

export default function EditarEnderecoClient({ params }: EditarEnderecoClientProps) {
  return <EditarEnderecoForm enderecoId={params.enderecoId} />;
}
