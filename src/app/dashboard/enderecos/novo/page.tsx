
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function NovoEnderecoPage() {
  // TODO: Implement form state and submission logic

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/enderecos">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Voltar para Endereços</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-headline">Adicionar Novo Endereço</h1>
          <p className="text-muted-foreground">
            Preencha os detalhes do endereço.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Endereço</CardTitle>
          <CardDescription>
            Campos como Rua, Número, Bairro, CEP, etc.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for address form fields */}
          <div className="flex items-center justify-center h-64 border border-dashed rounded-md">
            <p className="text-muted-foreground">Formulário de endereço em construção.</p>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" asChild>
              <Link href="/dashboard/enderecos">Cancelar</Link>
            </Button>
            <Button type="submit" disabled>Salvar Endereço (Em breve)</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
