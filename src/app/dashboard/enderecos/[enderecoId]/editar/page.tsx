
import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import EditarEnderecoClient from "./EditarEnderecoClient";

// Aplicando "Opção 2" sugerida pelo usuário para contornar o erro de tipagem.
export default function EditarEnderecoPage(props: any) {
  // Fazendo a asserção de tipo para params.
  // A interface original `params: { enderecoId: string }` é mantida implicitamente aqui.
  const { params } = props as { params: { enderecoId: string } };

  // Adicionando uma verificação básica para o caso de params ou enderecoId não existirem,
  // embora com 'props: any' o TypeScript não vá alertar sobre isso em tempo de compilação.
  if (!params || typeof params.enderecoId !== 'string') {
    // Idealmente, você retornaria um componente de "Não Encontrado" ou uma mensagem de erro mais elaborada.
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] w-full">
        <Loader2 className="h-10 w-10 animate-spin text-destructive" />
        <p className="mt-3 text-destructive">Erro: ID do endereço inválido ou não encontrado.</p>
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
      <EditarEnderecoClient params={params} />
    </Suspense>
  );
}
