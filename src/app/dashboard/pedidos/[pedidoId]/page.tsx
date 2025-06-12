
"use client";

import React, { useEffect, useState, use } from 'react'; 
import { useParams, useRouter } from 'next/navigation';
import Link from "next/link";
import { doc, getDoc, Timestamp, type FirebaseError } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Loader2, AlertCircle, ShoppingBag, User, Phone, Tag, FileText, CircleDollarSign, CalendarDays } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Pedido {
  id: string;
  nomeCliente: string;
  telefoneCliente?: string;
  itensPedido: string;
  valorTotal: number;
  formaPagamento: string;
  observacoes?: string;
  status: 'Novo' | 'Em preparo' | 'Pronto' | 'Finalizado' | 'Cancelado';
  dataCriacao: Timestamp;
  dataModificacao?: Timestamp;
}

function getStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "novo": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "em preparo": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "pronto": return "bg-primary/20 text-primary border-primary/30";
    case "finalizado": return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
    case "cancelado": return "bg-destructive/20 text-destructive border-destructive/30";
    default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
}

function OriginalPedidoDetalhesPage() {
  const params = useParams();
  const unwrappedParams = use(params); // Unwrap params
  const pedidoId = unwrappedParams.pedidoId as string;
  const router = useRouter();

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pedidoId) {
      const fetchPedido = async () => {
        setLoading(true);
        setError(null);
        try {
          const pedidoDocRef = doc(db, 'pedidos', pedidoId);
          const pedidoDocSnap = await getDoc(pedidoDocRef);

          if (pedidoDocSnap.exists()) {
            setPedido({ id: pedidoDocSnap.id, ...pedidoDocSnap.data() } as Pedido);
          } else {
            setError("Pedido não encontrado.");
          }
        } catch (err) {
          const firestoreError = err as FirebaseError;
          console.error("Erro ao buscar pedido:", firestoreError);
          setError("Falha ao carregar os detalhes do pedido.");
        } finally {
          setLoading(false);
        }
      };
      fetchPedido();
    }
  }, [pedidoId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Carregando detalhes do pedido...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/pedidos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold font-headline text-destructive">Erro ao Carregar Pedido</h1>
        </div>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5"/> Ocorreu um Problema</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
            <p className="text-muted-foreground mt-2">
              Verifique se o ID <span className="font-semibold text-primary">{pedidoId}</span> está correto ou tente novamente mais tarde.
            </p>
          </CardContent>
           <CardFooter>
             <Button variant="outline" onClick={() => router.push('/dashboard/pedidos')}>
                Voltar para Lista de Pedidos
            </Button>
           </CardFooter>
        </Card>
      </div>
    );
  }

  if (!pedido) {
    // Should be caught by error state, but as a fallback
    return (
         <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard/pedidos">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                </Button>
                <h1 className="text-2xl font-bold font-headline">Pedido não encontrado</h1>
            </div>
             <p className="text-muted-foreground">
                O pedido com ID <span className="font-semibold text-primary">{pedidoId}</span> não foi encontrado.
            </p>
        </div>
    )
  }

  const formatDate = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return 'N/A';
    return format(timestamp.toDate(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
                ID do Pedido: <span className="font-semibold text-primary">{pedido.id}</span>
            </p>
            </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/pedidos/${pedido.id}/editar`}>
            <Edit className="mr-2 h-4 w-4" />
            Editar Pedido
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShoppingBag className="h-6 w-6 text-primary" /> Itens do Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="p-4 bg-muted/50 rounded-md whitespace-pre-wrap text-sm font-mono">{pedido.itensPedido}</pre>
            {pedido.observacoes && (
              <div className="mt-4">
                <h4 className="font-semibold mb-1 flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground"/>Observações:</h4>
                <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md">{pedido.observacoes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary"/>Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p><span className="font-semibold">Nome:</span> {pedido.nomeCliente}</p>
              {pedido.telefoneCliente && <p><Phone className="inline h-4 w-4 mr-1 text-muted-foreground"/> <span className="font-semibold">Telefone:</span> {pedido.telefoneCliente}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CircleDollarSign className="h-5 w-5 text-primary"/>Pagamento e Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="font-semibold">Valor Total:</span> R$ {pedido.valorTotal.toFixed(2).replace('.', ',')}</p>
              <p><Tag className="inline h-4 w-4 mr-1 text-muted-foreground"/> <span className="font-semibold">Forma de Pagamento:</span> {pedido.formaPagamento}</p>
              <div className="flex items-center">
                <span className="font-semibold mr-2">Status:</span>
                <Badge variant="outline" className={getStatusBadgeClass(pedido.status)}>{pedido.status}</Badge>
              </div>
            </CardContent>
          </Card>
         
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary"/>Datas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
                <p><span className="font-semibold">Criado em:</span> {formatDate(pedido.dataCriacao)}</p>
                {pedido.dataModificacao && <p><span className="font-semibold">Última Modificação:</span> {formatDate(pedido.dataModificacao)}</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

const PedidoDetalhesPage = React.memo(OriginalPedidoDetalhesPage);
export default PedidoDetalhesPage;
