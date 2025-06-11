
"use client";

import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PedidoDetalhesPage() {
  const params = useParams();
  const pedidoId = params.pedidoId as string;

  // TODO: Fetch order details from Firestore using pedidoId

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
          <h1 className="text-3xl font-bold font-headline">Detalhes do Pedido</h1>
          <p className="text-muted-foreground">
            Visualizando informações do pedido ID: <span className="font-semibold text-primary">{pedidoId}</span>
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Pedido</CardTitle>
          <CardDescription>
            Aqui serão exibidos os detalhes completos do pedido. (Em construção)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>ID do Pedido: {pedidoId}</p>
            {/* Placeholder for order details */}
            <div className="p-8 text-center text-muted-foreground border border-dashed rounded-md">
              Carregando detalhes do pedido...
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
