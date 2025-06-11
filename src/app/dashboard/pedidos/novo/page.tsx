
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NovoPedidoPage() {
  // Placeholder for form submission handler
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: Implement order saving logic
    console.log("Formulário de novo pedido submetido (lógica de salvar ainda não implementada).");
    // Potentially show a toast message here
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/pedidos">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Voltar para Pedidos</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-headline">Novo Pedido Manual</h1>
          <p className="text-muted-foreground">
            Preencha os detalhes abaixo para criar um novo pedido.
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Detalhes do Pedido</CardTitle>
            <CardDescription>
              Informações do cliente, itens e forma de pagamento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Placeholder for form elements */}
            <div className="space-y-2">
              <Label htmlFor="clientName">Nome do Cliente (Exemplo)</Label>
              <Input id="clientName" placeholder="Nome completo do cliente" />
            </div>

            <div className="space-y-2">
              <Label>Itens do Pedido (Exemplo)</Label>
              <div className="p-4 border border-dashed rounded-md min-h-[100px] flex items-center justify-center">
                <p className="text-muted-foreground text-sm">
                  Aqui será a interface para adicionar produtos ao pedido.
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Forma de Pagamento (Exemplo)</Label>
              <Input id="paymentMethod" placeholder="Dinheiro, Cartão, Pix" />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" asChild>
                <Link href="/dashboard/pedidos">Cancelar</Link>
              </Button>
              <Button type="submit">Salvar Pedido</Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
