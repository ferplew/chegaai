
import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import EditarEnderecoClient from "./EditarEnderecoClient";

export default function EditarEnderecoPage({
  params,
}: {
  params: { enderecoId: string };
}) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      }
    >
      <EditarEnderecoClient params={params} />
    </Suspense>
  );
}
