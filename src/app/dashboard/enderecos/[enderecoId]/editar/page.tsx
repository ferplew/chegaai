
import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import EditarEnderecoClient from "./EditarEnderecoClient";

interface EditarEnderecoPageProps {
  params: { enderecoId: string };
}

export default function EditarEnderecoPage({ params }: EditarEnderecoPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] w-full">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-3 text-muted-foreground">Carregando página...</p>
        </div>
      }
    >
      <EditarEnderecoClient params={params} />
    </Suspense>
  );
}
