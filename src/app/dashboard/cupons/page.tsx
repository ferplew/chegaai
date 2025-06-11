
"use client"; // Será necessário para interações futuras como modais e formulários

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Ticket } from "lucide-react";
import Link from "next/link"; // Para "Criar Novo Cupom" se for uma nova página

export default function CuponsPage() {
  // TODO: Estado para gerenciar modal de criação de cupom (se for modal)
  // TODO: Estado para listar cupons

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Cupons Promocionais</h1>
          <p className="text-muted-foreground">Crie e gerencie seus cupons de desconto.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/cupons/novo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar Novo Cupom
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meus Cupons</CardTitle>
          <CardDescription>
            Acompanhe e gerencie os cupons ativos e inativos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder para lista/tabela de cupons */}
          <div className="flex flex-col items-center justify-center h-64 border border-dashed rounded-md text-center p-4">
            <Ticket className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Nenhum cupom criado ainda.</p>
            <p className="text-sm text-muted-foreground">
              Clique em &quot;Criar Novo Cupom&quot; para começar.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
